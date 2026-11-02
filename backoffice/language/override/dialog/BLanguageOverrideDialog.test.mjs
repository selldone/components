import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import { isString, merge } from "lodash-es";
import { compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => {
  await new Promise(setImmediate);
};
const descriptors = Object.fromEntries(
  [
    ["dialog", "./BLanguageOverrideDialog.vue"],
    ["table", "../table/BLanguageOverrideTable.vue"],
    ["drop", "../../../../ui/uploader/SDropZone.vue"],
  ].map(([name, file]) => {
    const parsed = parse(read(file), { filename: file });
    assert.deepEqual(parsed.errors, []);
    return [name, parsed.descriptor];
  }),
);

function evaluate(source, dependency = () => ({}), globals = {}) {
  const output = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  });
  assert.deepEqual(output.diagnostics, []);
  const exports = {};
  vm.runInNewContext(output.outputText, {
    exports,
    require: dependency,
    console,
    ...globals,
  });
  return exports;
}
const calendar = evaluate(
  read("../../../../../core-js/enums/language/Calendar.ts"),
);
const { Language } = evaluate(
  read("../../../../../core-js/enums/language/Language.ts"),
  () => calendar,
);
const core = evaluate(read("../../../../mixin/CoreMixin.ts"), (name) => {
  if (name.includes("/language/Language")) return { Language };
  if (name === "lodash-es") return { isString };
  return {};
}).default;

function fixture(kind = "dialog", overrides = {}, controls = {}) {
  const requests = [],
    notices = [],
    emitted = [],
    fileReads = [],
    repositoryLoads = [],
    confirmations = [];
  const structure = controls.structure || { actions: { buy: "Buy {name}", search: "Search" } };
  const packages = [
    { path: "global", pack: "GLOBAL", pack_code: "global" },
    { path: "shop", pack: "SHOP", pack_code: "shop" },
  ];
  class Repository {
    static PACKAGES_SHOP_OVERRIDE = packages;
    constructor(pack) { this.pack = pack; }
    load(language) {
      if (controls.deferRepository) {
        return new Promise((resolve, reject) => repositoryLoads.push({ pack: this.pack, language, resolve, reject }));
      }
      repositoryLoads.push({ pack: this.pack, language });
      return Promise.resolve({ default: structuredClone(structure) });
    }
  }
  const notification = new Proxy(
    {},
    {
      get:
        (_, method) =>
        (...args) =>
          notices.push([method, ...args]),
    },
  );
  const file = { value: null };
  const confirmation = { value: true };
  const globals = {
    window: {
      confirm(message) { confirmations.push(message); return confirmation.value; },
      API: new Proxy(
        {},
        {
          get:
            (_, key) =>
            (...args) =>
              `${String(key)}:${args.join(":")}`,
        },
      ),
    },
    axios: Object.fromEntries(
      ["get", "post"].map((method) => [
        method,
        (url, body) =>
          new Promise((resolve, reject) =>
            requests.push({
              method,
              url,
              body: body && plain(body),
              resolve,
              reject,
            }),
          ),
      ]),
    ),
  };
  const dependencies = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("NotificationService")) return { default: notification };
    if (name.includes("LanguagesRepository")) return { default: Repository };
    if (name.includes("/language/Language")) return { Language };
    if (name === "@selldone/core-js")
      return {
        FileHelper: {
          LoadFile(event) {
            if (controls.deferFileReads) {
              return new Promise((resolve, reject) => fileReads.push({ event, resolve, reject }));
            }
            fileReads.push(event);
            return Promise.resolve(file.value);
          },
        },
      };
    if (name.endsWith(".vue")) return { default: {} };
    throw new Error("Unexpected dependency: " + name);
  };
  const component = evaluate(
    descriptors[kind].script.content,
    dependencies,
    globals,
  ).default;
  const state = Vue.reactive({
    ...component.data(),
    modern: true,
    readOnly: false,
    modelValue: true,
    shop: { id: 7 },
    language: "fa",
    to: "fa",
    ...overrides,
    $t: (key, args = {}) =>
      key + (Object.keys(args).length ? JSON.stringify(args) : ""),
    $emit: (name, value) => emitted.push([name, value]),
  });
  for (const [name, method] of Object.entries({
    ...core.methods,
    ...component.methods,
  }))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed || {}))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  return {
    state,
    component,
    requests,
    notices,
    emitted,
    file,
    fileReads,
    repositoryLoads,
    confirmations,
    confirmation,
    structure,
  };
}

test("override dialog and recursive table templates and scoped Sass compile", async () => {
  for (const [name, descriptor] of Object.entries(descriptors)) {
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: name + ".vue",
      id: "override-test",
      transformAssetUrls: { includeAbsolute: true },
    });
    assert.deepEqual(template.errors, []);
    for (const style of descriptor.styles) {
      const result = await compileStyleAsync({
        source: style.content,
        filename: name + ".vue",
        id: "override-test",
        scoped: style.scoped,
        preprocessLang: style.lang,
      });
      assert.deepEqual(result.errors, []);
    }
  }
});

test("loads the selected package without mirroring all default keys into modern overrides", async () => {
  const f = fixture();
  const done = f.state.init();
  assert.equal(f.state.busy_fetch, true);
  assert.equal(
    f.requests[0].url,
    "GET_SHOP_OVERRIDE_LANGUAGE_PACK:7:fa:global",
  );
  f.requests[0].resolve({
    data: { pack: { actions: { buy: "خرید {name}" } } },
  });
  await done;
  assert.equal(f.state.busy_fetch, false);
  assert.deepEqual(plain(f.state.pack_default), f.structure);
  assert.deepEqual(plain(f.state.pack_override), {
    actions: { buy: "خرید {name}" },
  });
  assert.equal(Vue.isReactive(f.state.pack_default), false);
  assert.equal(Vue.isReactive(f.state.pack_default.actions), false);
  assert.equal(Vue.isReactive(f.state.pack_override), false);
  assert.equal(Vue.isReactive(f.state.pack_override.actions), false);
  assert.equal(f.state.language_object.dir, "rtl");
});

test("large modern packs stay raw and sparse while defaults and overrides load concurrently", async () => {
  const defaults = {
    bulk: Object.fromEntries(Array.from({ length: 50000 }, (_, index) => [`key_${index}`, `Default ${index}`])),
  };
  const f = fixture("dialog", {}, { deferRepository: true });
  const done = f.state.init();
  assert.equal(f.requests.length, 1);
  assert.equal(f.repositoryLoads.length, 1, "Default loading starts before the override request completes");
  const custom = { bulk: { key_49999: "Custom final entry" } };
  f.requests[0].resolve({ data: { pack: custom } });
  f.repositoryLoads[0].resolve({ default: defaults });
  await done;
  assert.equal(f.state.pack_default, defaults);
  assert.equal(f.state.pack_override, custom);
  assert.equal(Vue.isReactive(f.state.pack_default), false);
  assert.equal(Vue.isReactive(f.state.pack_override), false);
  assert.deepEqual(Object.keys(f.state.pack_override.bulk), ["key_49999"]);
  assert.equal(Object.keys(defaults.bulk).length, 50000);
  assert.equal(defaults.bulk.key_49999, "Default 49999");
});

test("legacy callers retain the full nested empty structure", async () => {
  const f = fixture("dialog", { modern: false });
  const done = f.state.init();
  f.requests[0].resolve({ data: { pack: { actions: { buy: "Legacy {name}" } } } });
  await done;
  assert.deepEqual(plain(f.state.pack_override), { actions: { buy: "Legacy {name}", search: "" } });
});

test("save purifies empty values, blocks duplicate submissions, and closes only on success", async () => {
  const f = fixture();
  f.state.pack_default = f.structure;
  f.state.pack_override = { actions: { buy: "خرید {name}", search: "" } };
  f.state.pack_dirty = true;
  f.state.saveLanguage();
  f.state.saveLanguage();
  assert.equal(f.requests.length, 1);
  assert.equal(
    f.requests[0].url,
    "POST_SHOP_SAVE_OVERRIDE_LANGUAGE_PACK:7:fa:global",
  );
  assert.deepEqual(f.requests[0].body, {
    pack: { actions: { buy: "خرید {name}" } },
  });
  f.requests[0].resolve({ data: { error: true, error_msg: "Fixture denied" } });
  await settle();
  assert.deepEqual(f.emitted, []);
  assert.equal(f.state.pack_override.actions.buy, "خرید {name}");
  assert.equal(f.state.busy, false);
  f.state.saveLanguage();
  f.requests[1].reject(new Error("Fixture offline"));
  await settle();
  assert.deepEqual(f.emitted, []);
  assert.equal(f.state.busy, false);
  f.state.saveLanguage();
  f.requests[2].resolve({ data: {} });
  await settle();
  assert.deepEqual(f.emitted, [["update:modelValue", false]]);
  assert.ok(f.notices.some(([method]) => method === "showSuccessAlert"));
});

test("JSON imports retain the selected package and reject unrelated files", async () => {
  const f = fixture();
  f.state.pack_default = f.structure;
  f.state.pack_override = { actions: { buy: "Keep this", search: "" } };
  f.file.value = { shop: { actions: { buy: "Wrong package" } } };
  f.state.importPack({ name: "fixture.json" });
  await settle();
  assert.equal(f.state.pack_override.actions.buy, "Keep this");
  assert.ok(f.notices.some(([method]) => method === "showErrorAlert"));
  f.file.value = { global: { actions: { buy: "Imported {name}" } } };
  f.state.importPack({ name: "fixture.json" });
  await settle();
  assert.deepEqual(plain(f.state.pack_override), {
    actions: { buy: "Imported {name}" },
  });
  assert.equal(f.state.pack_dirty, true);
});

test("read-only modern views preserve reads while blocking writes and pending imports", async () => {
  const f = fixture("dialog", { readOnly: true });
  f.state.pack_default = f.structure;
  f.state.pack_override = {};
  f.state.saveLanguage();
  f.state.importPack({ name: "fixture.json" });
  assert.deepEqual(f.requests, []);
  assert.deepEqual(f.fileReads, []);
  const done = f.state.init();
  assert.equal(f.requests[0].method, "get");
  f.requests[0].resolve({ data: { pack: {} } });
  await done;
  f.state.readOnly = false;
  f.file.value = { global: { actions: { buy: "Pending import" } } };
  f.state.importPack({ name: "fixture.json" });
  f.state.readOnly = true;
  await settle();
  assert.deepEqual(plain(f.state.pack_override), {});
  assert.equal(f.state.busy_import, false);
});

test("an older package read cannot apply data, report errors or release a newer load", async () => {
  const f = fixture("dialog", {}, { deferRepository: true });
  const first = f.state.init();
  f.state.selected_package = f.state.PACKAGES[1];
  const second = f.state.init();
  assert.equal(f.requests[1].url, "GET_SHOP_OVERRIDE_LANGUAGE_PACK:7:fa:shop");
  f.requests[0].reject(new Error("Old package offline"));
  f.repositoryLoads[0].resolve({ default: { old: "Old value" } });
  await first;
  assert.equal(f.state.busy_fetch, true);
  assert.equal(f.state.pack_default, null);
  assert.equal(f.state.pack_override, null);
  assert.deepEqual(f.notices, []);
  f.requests[1].resolve({ data: { pack: { current: "Custom current" } } });
  f.repositoryLoads[1].resolve({ default: { current: "Current value" } });
  await second;
  assert.equal(f.state.busy_fetch, false);
  assert.deepEqual(plain(f.state.pack_default), { current: "Current value" });
  assert.deepEqual(plain(f.state.pack_override), { current: "Custom current" });
});

test("shop changes and unmount ignore pending package reads", async () => {
  const f = fixture("dialog", {}, { deferRepository: true });
  const first = f.state.init();
  f.state.shop = { id: 8 };
  const second = f.state.init();
  f.requests[0].resolve({ data: { pack: { previous: "Old private override" } } });
  f.repositoryLoads[0].resolve({ default: { previous: "Old default" } });
  await first;
  assert.equal(f.state.pack_override, null);
  assert.equal(f.state.busy_fetch, true);
  f.component.beforeUnmount.call(f.state);
  f.requests[1].resolve({ data: { pack: { current: "Unmounted override" } } });
  f.repositoryLoads[1].resolve({ default: { current: "Unmounted default" } });
  await second;
  assert.equal(f.state.pack_override, null);
  assert.equal(f.state.pack_default, null);
  assert.deepEqual(f.notices, []);
});

test("pending imports bind their original package and shop and preserve untouched values", async () => {
  const f = fixture("dialog", {}, { deferFileReads: true });
  f.state.pack_default = f.structure;
  f.state.pack_override = { actions: { buy: "Keep current {name}" }, unknown: "Preserve me" };
  f.state.importPack({ name: "package.json" });
  f.state.selected_package = f.state.PACKAGES[1];
  f.fileReads[0].resolve({ global: { actions: { buy: "Old import" } }, shop: { title: "Wrong scope" } });
  await settle();
  assert.deepEqual(plain(f.state.pack_override), { actions: { buy: "Keep current {name}" }, unknown: "Preserve me" });
  assert.deepEqual(f.notices, []);
  const g = fixture("dialog", {}, { deferFileReads: true });
  g.state.pack_default = g.structure;
  g.state.pack_override = { actions: { buy: "Keep this shop" }, unknown: "Preserve me" };
  g.state.importPack({ name: "shop.json" });
  g.state.shop = { id: 9 };
  g.fileReads[0].resolve({ global: { title: "Old shop import" } });
  await settle();
  assert.equal(g.state.pack_override.unknown, "Preserve me");
  assert.deepEqual(g.notices, []);
});

test("a pending save from another language cannot close or notify the current dialog", async () => {
  const f = fixture();
  f.state.pack_default = f.structure;
  f.state.pack_override = { actions: { buy: "Save {name}" } };
  f.state.pack_dirty = true;
  f.state.saveLanguage();
  f.state.language = "de";
  f.requests[0].resolve({ data: {} });
  await settle();
  assert.deepEqual(f.emitted, []);
  assert.deepEqual(f.notices, []);
});

test("modern sparse array saves merge onto the original indices without erasing default slots", () => {
  const f = fixture();
  const filtered = f.state.filterStrings({ empty: { text: "" }, entries: ["", "Second", { text: "" }, "Fourth"] });
  assert.equal(filtered.empty, undefined);
  assert.deepEqual(Object.keys(filtered.entries), ["1", "3"]);
  assert.equal(filtered.entries[1], "Second");
  assert.equal(filtered.entries[3], "Fourth");
  const merged = merge({}, { entries: ["First", "Old second", "Third", "Old fourth"] }, plain(filtered));
  assert.deepEqual(merged.entries, ["First", "Second", "Third", "Fourth"]);
});

test("modern sparse purification does not create inherited properties from imported keys", () => {
  const f = fixture();
  const imported = JSON.parse('{"__proto__":{"is_admin":"true"},"valid":"Keep this","empty":""}');
  const filtered = f.state.filterStrings(imported);
  assert.equal(filtered.valid, "Keep this");
  assert.equal("is_admin" in filtered, false);
  assert.equal({}.is_admin, undefined);
});

test("fetch failures release loading, keep unavailable data distinct, and allow retry", async () => {
  const f = fixture("dialog", {}, { deferRepository: true });
  const first = f.state.init();
  f.requests[0].reject(new Error("Fixture offline"));
  f.repositoryLoads[0].resolve({ default: f.structure });
  await first;
  assert.equal(f.state.busy_fetch, false);
  assert.equal(Boolean(f.state.load_error), true);
  assert.equal(f.state.pack_override, null);
  assert.equal(f.state.pack_default, null);
  const second = f.state.init();
  f.requests[1].resolve({ data: { pack: {} } });
  f.repositoryLoads[1].resolve({ default: {} });
  await second;
  assert.equal(f.state.busy_fetch, false);
  assert.equal(Boolean(f.state.load_error), false);
  assert.deepEqual(plain(f.state.pack_override), {});
  assert.deepEqual(plain(f.state.pack_default), {}, "A successfully empty pack is loaded, not a failed read");
});

test("a failed default-module load cannot leave the editor busy or show a false empty pack", async () => {
  const f = fixture("dialog", {}, { deferRepository: true });
  const done = f.state.init();
  f.requests[0].resolve({ data: { pack: {} } });
  f.repositoryLoads[0].reject(new Error("Default module unavailable"));
  await done;
  assert.equal(f.state.busy_fetch, false);
  assert.equal(Boolean(f.state.load_error), true);
  assert.equal(f.state.pack_default, null);
  assert.equal(f.state.pack_override, null);
});

test("modern imports reject non-object package roots without replacing the current draft", async () => {
  const f = fixture();
  f.state.pack_default = f.structure;
  f.state.pack_override = { actions: { buy: "Keep current {name}" } };
  for (const invalid of [null, [], "invalid", 12, true]) {
    f.file.value = { global: invalid };
    f.state.importPack({ name: "invalid.json" });
    await settle();
    assert.equal(f.state.pack_override.actions.buy, "Keep current {name}");
    assert.equal(f.state.busy_import, false);
  }
  assert.equal(f.notices.filter(([method]) => method === "showErrorAlert").length, 5);
});

test("clearing all custom strings saves an empty pack so stored overrides can be removed", async () => {
  const f = fixture();
  f.state.pack_default = f.structure;
  f.state.pack_override = { actions: { buy: "", search: "" } };
  f.state.pack_dirty = true;
  f.state.saveLanguage();
  assert.deepEqual(f.requests[0].body, { pack: {} });
  f.requests[0].resolve({ data: {} });
  await settle();
  assert.deepEqual(f.emitted, [["update:modelValue", false]]);
});

test("closing or changing packages asks before discarding modern unsaved changes", () => {
  const f = fixture();
  f.state.pack_dirty = true;
  f.confirmation.value = false;
  f.state.requestClose();
  assert.deepEqual(f.emitted, []);
  f.state.changePackage(f.state.PACKAGES[1]);
  assert.equal(f.state.selected_package.pack_code, "global");
  assert.equal(f.confirmations.length, 2);
  f.confirmation.value = true;
  f.state.changePackage(f.state.PACKAGES[1]);
  assert.equal(f.state.selected_package.pack_code, "shop");
  f.state.requestClose();
  assert.deepEqual(f.emitted, [["update:modelValue", false]]);
});

test("nested edits preserve placeholders and missing-placeholder repair fails safely", () => {
  const f = fixture("table", {
    structure: { buy: "Buy {name}" },
    modelValue: { buy: "خرید {customer}" },
  });
  f.state.editRecord("buy");
  assert.equal(f.state.dialog, true);
  assert.equal(f.state.checkValidParams("buy"), false);
  f.state.autoFix("buy");
  assert.equal(f.state.input, "خرید {name}");
  f.state.setValue();
  assert.equal(f.state.modelValue.buy, "خرید {name}");
  assert.equal(f.state.checkValidParams("buy"), true);
  assert.equal(f.state.dialog, false);
  f.state.modelValue.buy = "Missing placeholder";
  assert.doesNotThrow(() => f.state.autoFix("buy"));
  assert.ok(f.notices.some(([method]) => method === "showErrorAlert"));
  f.state.readOnly = true;
  f.component.watch.readOnly.call(f.state, true);
  f.state.editRecord("buy");
  f.state.input = "Blocked edit";
  f.state.setValue();
  assert.equal(f.state.dialog, false);
  assert.equal(f.state.modelValue.buy, "Missing placeholder");
});

test("modern JSON picker shows the localized hint and a visible native input", () => {
  const render = new Function(
    "Vue",
    compile(descriptors.drop.template.content, {
      mode: "function",
      prefixIdentifiers: true,
    }).code,
  )({
    ...Vue,
    resolveComponent: (name) => ({ name }),
  });
  const f = fixture("drop", {
    multiple: false,
    extension: ".json",
    label: "انتخاب فایل JSON",
    hint: "فایل زبان را اینجا رها کنید.",
    icon: "translate",
  });
  const nodes = [];
  function inspect(node) {
    if (Array.isArray(node)) return node.map(inspect).join("");
    if (typeof node === "string") return node;
    if (!node || typeof node !== "object") return "";
    nodes.push(node);
    return inspect(
      typeof node.children?.default === "function"
        ? node.children.default()
        : node.children,
    );
  }
  const text = inspect(render(f.state, []));
  assert.ok(text.includes("فایل زبان را اینجا رها کنید."));
  assert.ok(!text.includes("landing page"));
  const input = nodes.find((node) => node.type?.name === "v-file-input");
  assert.ok(input);
  assert.ok(!input.props.class.includes("opacity-0"));
  assert.equal(input.props.label, "انتخاب فایل JSON");
  assert.equal(input.props.accept, ".json");
});

test("JSON picker rejects extension and size failures without emitting the rejected file", () => {
  const f = fixture("drop", {
    multiple: false,
    extension: ".json",
    maxFileSize: 1024,
  });
  const wrongExtension = { name: "fixture.txt", size: 10 };
  f.state.processFile(wrongExtension, "");
  assert.deepEqual(f.emitted, [["select:file", null]]);
  const oversized = { name: "fixture.json", size: 2048 };
  assert.doesNotThrow(() => f.state.processFile(oversized, ""));
  assert.deepEqual(f.emitted.at(-1), ["select:file", null]);
  assert.equal(
    f.notices.filter(([method]) => method === "showErrorAlert").length,
    2,
  );
  const valid = { name: "fixture.JSON", size: 512 };
  f.state.processFile(valid, "");
  assert.equal(f.emitted.at(-1)[1], valid);
  f.state.multiple = true;
  f.state.processFile([wrongExtension, valid], "fixture-folder");
  assert.deepEqual(plain(f.emitted.at(-1)), [
    "select:files",
    { files: [valid], local_folder: "fixture-folder" },
  ]);
});
