import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import ts from "typescript";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} from "@vue/compiler-sfc";

const dom = new JSDOM(
  '<!doctype html><html><body><div id="app"></div></body></html>',
  {
    url: "https://dashboard.example.test/shuttle/shop/7/domain/11",
  },
);
for (const name of [
  "window",
  "document",
  "Element",
  "HTMLElement",
  "SVGElement",
  "Node",
  "navigator",
])
  Object.defineProperty(globalThis, name, {
    value: name === "window" ? dom.window : dom.window[name],
    configurable: true,
  });
const Vue = await import("vue");
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => {
  await Vue.nextTick();
  await new Promise(setImmediate);
  await Vue.nextTick();
};
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const summary = (extra = {}) => ({
  supported: true,
  enabled: false,
  has_html: true,
  byte_size: 13,
  ...extra,
});
const item = (extra = {}) => ({
  enable: true,
  maintenance_summary: summary(),
  domain: { id: 11, domain: "store.example.test", externally_hosted: false },
  ...extra,
});
const page = (html = "<h1>Saved</h1>", extra = {}) => ({
  maintenance_summary: summary({ has_html: html !== null, ...extra }),
  html,
});
const saved = (enabled, extra = {}) => ({
  success: true,
  domain: { id: 11 },
  maintenance_summary: summary({ enabled }),
  ...extra,
});
function execute(source, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      TextEncoder,
      TextDecoder,
      ...globals,
      require(name) {
        assert(name in imports, "Unexpected import: " + name);
        return imports[name];
      },
    },
  );
  return exports;
}
async function component(relative, imports = {}, globals = {}) {
  const filename = fileURLToPath(new URL(relative, import.meta.url));
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
    filename,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "maintenance-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename,
    id: "maintenance-test",
    compilerOptions: { bindingMetadata: script.bindings },
    transformAssetUrls: { includeAbsolute: true },
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({
      source: style.content,
      filename,
      id: "maintenance-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(compiled.errors, []);
  }
  return {
    ...execute(script.content, { vue: Vue, ...imports }, globals).default,
    render: execute(template.code, { vue: Vue }).render,
  };
}
const SmartToggle = await component(
  "../../../ui/smart/toggle/USmartToggle.vue",
);
function shell(tag = "div", props = {}) {
  return Vue.defineComponent({
    inheritAttrs: false,
    props,
    setup:
      (values, { attrs, slots }) =>
      () =>
        Vue.h(tag, attrs, slots.default?.()),
  });
}
const Button = Vue.defineComponent({
  inheritAttrs: false,
  props: ["disabled", "loading"],
  setup:
    (props, { attrs, slots }) =>
    () =>
      Vue.h(
        "button",
        {
          ...attrs,
          type: "button",
          disabled: props.disabled,
          "aria-busy": props.loading,
        },
        slots.default?.(),
      ),
});
const Dialog = Vue.defineComponent({
  props: ["modelValue", "persistent"],
  setup:
    (props, { slots }) =>
    () =>
      props.modelValue
        ? Vue.h("section", { role: "dialog" }, slots.default?.())
        : null,
});
const Textarea = Vue.defineComponent({
  inheritAttrs: false,
  props: ["modelValue", "readonly", "disabled", "label", "errorMessages"],
  emits: ["update:modelValue"],
  setup:
    (props, { attrs, emit }) =>
    () =>
      Vue.h("label", { class: attrs.class }, [
        props.label,
        Vue.h("textarea", {
          value: props.modelValue,
          readonly: props.readonly,
          disabled: props.disabled,
          onInput: (event) => emit("update:modelValue", event.target.value),
        }),
        props.errorMessages
          ? Vue.h("span", { role: "alert" }, props.errorMessages)
          : null,
      ]),
});
const Checkbox = Vue.defineComponent({
  props: ["modelValue", "disabled", "label"],
  emits: ["update:modelValue"],
  setup:
    (props, { emit }) =>
    () =>
      Vue.h("label", [
        Vue.h("input", {
          type: "checkbox",
          checked: props.modelValue,
          disabled: props.disabled,
          onChange: (event) => emit("update:modelValue", event.target.checked),
        }),
        props.label,
      ]),
});
const FileInput = Vue.defineComponent({
  props: ["modelValue", "disabled", "label", "errorMessages"],
  emits: ["update:modelValue"],
  setup:
    (props, { attrs, emit }) =>
    () =>
      Vue.h("label", [
        props.label,
        Vue.h("input", {
          type: "file",
          accept: attrs.accept,
          disabled: props.disabled,
          onChange: (event) =>
            emit("update:modelValue", event.target.files?.[0]),
        }),
        props.errorMessages
          ? Vue.h("span", { role: "alert" }, props.errorMessages)
          : null,
      ]),
});
async function fixture(t, initial = {}) {
  const reads = [],
    writes = [],
    events = [],
    errors = [];
  const transport =
    (calls) =>
    (...args) => {
      const pending = deferred();
      calls.push({ args, ...pending });
      return pending.promise;
    };
  const Maintenance = await component(
    "./BDomainMaintenance.vue",
    {
      "../../../ui/smart/toggle/USmartToggle.vue": { default: SmartToggle },
    },
    {
      document: dom.window.document,
      window: {
        API: {
          GET_DOMAIN_MAINTENANCE: (shop, domain) =>
            "/shops/" + shop + "/domains/" + domain + "/maintenance",
          POST_DOMAIN_MAINTENANCE: (shop, domain) =>
            "/shops/" + shop + "/domains/" + domain + "/maintenance",
        },
      },
      axios: { get: transport(reads), post: transport(writes) },
    },
  );
  const props = Vue.reactive({ shop: { id: 7 }, item: item(), ...initial });
  const owner = Vue.ref();
  const app = Vue.createApp({
    render: () =>
      Vue.h(Maintenance, {
        ...props,
        ref: owner,
        onSaved: (data) => events.push(["saved", data]),
        onState: (data) => events.push(["state", plain(data)]),
      }),
  });
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.$vuetify = {
    theme: { current: { dark: false } },
  };
  app.config.warnHandler = (message) => {
    errors.push(message);
  };
  app.config.errorHandler = (error) => {
    errors.push(error);
  };
  for (const name of [
    "v-card",
    "v-card-text",
    "v-card-actions",
    "v-list-subheader",
  ])
    app.component(name, shell());
  app.component("v-icon", shell("span"));
  app.component("v-tooltip", { setup: () => () => null });
  app.component("v-btn", Button);
  app.component("v-dialog", Dialog);
  app.component("v-textarea", Textarea);
  app.component("v-checkbox", Checkbox);
  app.component("v-file-input", FileInput);
  for (const name of ["v-progress-linear", "v-progress-circular"])
    app.component(name, shell("span"));
  app.mount(dom.window.document.getElementById("app"));
  let mounted = true;
  const unmount = () => {
    if (mounted) {
      app.unmount();
      mounted = false;
    }
  };
  t.after(() => {
    unmount();
    assert.deepEqual(errors, []);
  });
  const root = () => dom.window.document.getElementById("app");
  const button = (key) =>
    [...root().querySelectorAll("button")].find((element) =>
      element.textContent.includes(key),
    );
  const input = async (text) => {
    const element = root().querySelector("textarea");
    element.value = text;
    element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await settle();
  };
  const open = async (data = page()) => {
    button("html").click();
    await settle();
    reads.at(-1).resolve({ data });
    await settle();
  };
  return {
    props,
    reads,
    writes,
    events,
    root,
    button,
    input,
    open,
    owner,
    unmount,
    errors,
  };
}
const file = (text, extra = {}) => {
  const bytes =
    typeof text === "string" ? new TextEncoder().encode(text) : text;
  return Vue.markRaw({
    name: "maintenance.html",
    size: bytes.byteLength,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    ...extra,
  });
};

test("real toggle sends a sparse mode change and trusts only a canonical matching reply", async (t) => {
  const f = await fixture(t);
  f.root().querySelector(".s--smart-toggle > div").click();
  await settle();
  assert.equal(f.reads.length, 0);
  assert.deepEqual(plain(f.writes[0].args), [
    "/shops/7/domains/11/maintenance",
    { enabled: true },
  ]);
  assert.equal(f.owner.value.busy, true);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
  f.writes[0].resolve({ data: saved(true) });
  await settle();
  assert.equal(f.owner.value.busy, false);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 1);
});

test("enabling without a page opens an explicit HTML read and stages the enable choice", async (t) => {
  const f = await fixture(t, {
    item: item({ maintenance_summary: summary({ has_html: false }) }),
  });
  const toggle = f.root().querySelector('[role="checkbox"]');
  toggle.focus();
  toggle.dispatchEvent(
    new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
  );
  await settle();
  assert.equal(f.writes.length, 0);
  assert.deepEqual(plain(f.reads[0].args), [
    "/shops/7/domains/11/maintenance",
    { params: { include_html: true } },
  ]);
  f.reads[0].resolve({ data: page(null, { has_html: false }) });
  await settle();
  assert.equal(f.owner.value.draftEnabled, true);
  assert.equal(f.owner.value.canSave, false);
  await f.input("<h1>New maintenance page</h1>");
  assert.equal(f.owner.value.canSave, true);
  assert.equal(f.writes.length, 0);
  f.root().querySelector("textarea").focus();
  f.button("cancel").click();
  await settle();
  assert.equal(f.root().querySelector('[role="dialog"]'), null);
  assert.equal(dom.window.document.activeElement, toggle);
});

test("mouse activation without a page returns focus to the real toggle after cancel", async (t) => {
  const f = await fixture(t, {
    item: item({ maintenance_summary: summary({ has_html: false }) }),
  });
  const toggle = f.root().querySelector('[role="checkbox"]');
  toggle.focus();
  f.root().querySelector(".s--smart-toggle > div").click();
  await settle();
  f.reads[0].resolve({ data: page(null, { has_html: false }) });
  await settle();
  f.root().querySelector("textarea").focus();
  f.button("actions.cancel").click();
  await settle();
  assert.equal(dom.window.document.activeElement, toggle);
  assert.equal(f.writes.length, 0);
});

test("UTF-8 byte limit, fatal file decoding and NUL checks preserve a retryable draft", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.input("é".repeat(20480));
  assert.equal(f.owner.value.byteSize, 40960);
  assert.equal(f.owner.value.canSave, true);
  await f.input("é".repeat(20481));
  assert.equal(f.owner.value.byteSize, 40962);
  assert.match(f.owner.value.htmlError, /too_large/);
  assert.equal(f.owner.value.canSave, false);
  await f.input("valid\0invalid");
  assert.match(f.owner.value.htmlError, /invalid_html/);
  const draft = "<h1>Keep me</h1>";
  await f.input(draft);
  await f.owner.value.readFile(file("x".repeat(40961)));
  assert.match(f.owner.value.fileError, /too_large/);
  assert.equal(f.owner.value.html, draft);
  await f.owner.value.readFile(file(new Uint8Array([0xc3, 0x28])));
  assert.match(f.owner.value.fileError, /invalid_html/);
  assert.equal(f.owner.value.html, draft);
  await f.owner.value.readFile(file("hello\0world"));
  assert.match(f.owner.value.fileError, /invalid_html/);
  const picker = f.root().querySelector('input[type="file"]');
  Object.defineProperty(picker, "files", { value: [file("<h1>فروشگاه</h1>")] });
  picker.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await settle();
  assert.equal(f.owner.value.fileError, "");
  assert.equal(f.owner.value.html, "<h1>فروشگاه</h1>");
  assert.equal(f.owner.value.canSave, true);
});

test("save sends the staged HTML and mode, retains failures, and closes only on canonical success", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.input("<html><body>Edited</body></html>");
  f.owner.value.draftEnabled = true;
  await settle();
  f.button("actions.save").click();
  await settle();
  assert.deepEqual(plain(f.writes[0].args[1]), {
    enabled: true,
    html: "<html><body>Edited</body></html>",
  });
  assert(f.root().querySelector('[role="dialog"]'));
  f.writes[0].reject(Error("Synthetic denied save"));
  await settle();
  assert.equal(f.owner.value.html, "<html><body>Edited</body></html>");
  assert.equal(f.owner.value.draftEnabled, true);
  assert.match(f.owner.value.error, /save_failed/);
  assert.equal(f.owner.value.canSave, true);
  f.button("actions.save").click();
  await settle();
  f.writes[1].resolve({ data: saved(true, { domain: { id: 99 } }) });
  await settle();
  assert(f.root().querySelector('[role="dialog"]'));
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
  f.button("actions.save").click();
  await settle();
  f.writes[2].resolve({ data: saved(true) });
  await settle();
  assert.equal(f.root().querySelector('[role="dialog"]'), null);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 1);
});

test("unchanged source is omitted when only the modal's enable choice changes", async (t) => {
  const f = await fixture(t);
  await f.open();
  const checkbox = f.root().querySelector('input[type="checkbox"]');
  checkbox.checked = true;
  checkbox.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await settle();
  f.button("actions.save").click();
  await settle();
  assert.deepEqual(plain(f.writes[0].args[1]), { enabled: true });
  f.writes[0].resolve({ data: saved(true) });
  await settle();
});

test("read-only HTML remains inert operator text and cancel restores the opening action", async (t) => {
  const f = await fixture(t, { readOnly: true });
  const activator = f.button("html");
  activator.focus();
  activator.click();
  await settle();
  const source =
    '<script id="payload">throw Error("never")</script><img id="remote" src="https://untrusted.example.test/pixel"><iframe id="frame"></iframe>';
  f.reads[0].resolve({ data: page(source) });
  await settle();
  assert.equal(f.root().querySelector("textarea").value, source);
  assert.equal(f.root().querySelector("textarea").readOnly, true);
  assert.equal(f.root().querySelector("#payload, #remote, #frame"), null);
  assert.equal(f.button("actions.save"), undefined);
  await f.owner.value.toggle(true);
  await f.owner.value.savePage();
  assert.equal(f.writes.length, 0);
  f.root().querySelector("textarea").focus();
  f.button("actions.cancel").click();
  await settle();
  assert.equal(dom.window.document.activeElement, activator);
});

test("permission, external, unsupported and busy guards prevent writes and duplicate opens", async (t) => {
  const f = await fixture(t, { disabled: true });
  await f.owner.value.openEditor();
  await f.owner.value.toggle(true);
  assert.equal(f.reads.length, 0);
  assert.equal(f.writes.length, 0);
  f.props.disabled = false;
  f.props.item = item({ maintenance_summary: summary({ supported: false }) });
  await settle();
  await f.owner.value.toggle(true);
  assert.equal(f.writes.length, 0);
  f.props.item = item({
    domain: {
      id: 11,
      domain: "external.example.test",
      externally_hosted: true,
    },
  });
  await settle();
  await f.owner.value.openEditor();
  await f.owner.value.toggle(true);
  assert.equal(f.reads.length, 0);
  f.props.item = item();
  await settle();
  f.owner.value.toggle(true);
  await settle();
  await f.owner.value.openEditor();
  await f.owner.value.toggle(false);
  assert.equal(f.reads.length, 0);
  assert.equal(f.writes.length, 1);
  f.props.readOnly = true;
  await settle();
  f.writes[0].resolve({ data: saved(true) });
  await settle();
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
});

test("failed or malformed source reads keep writes unavailable until an explicit retry succeeds", async (t) => {
  const f = await fixture(t);
  f.button("html").click();
  await settle();
  f.reads[0].reject(Error("Synthetic read failure"));
  await settle();
  assert.match(f.owner.value.error, /load_failed/);
  assert.equal(f.owner.value.canSave, false);
  f.button("actions.retry").click();
  await settle();
  f.reads[1].resolve({ data: { maintenance_summary: summary(), html: {} } });
  await settle();
  assert.equal(f.owner.value.loadFailed, true);
  f.button("actions.retry").click();
  await settle();
  f.reads[2].resolve({ data: page(null) });
  await settle();
  assert.equal(f.owner.value.loadFailed, false);
  assert.equal(f.owner.value.pageAvailable, false);
  await f.input("<h1>Replacement</h1>");
  assert.equal(f.owner.value.canSave, true);
});

test("resource changes and unmount discard stale GET and POST responses without emitting saved", async (t) => {
  const f = await fixture(t);
  f.button("html").click();
  await settle();
  f.props.item = item({ domain: { id: 22, domain: "next.example.test" } });
  await settle();
  f.reads[0].resolve({ data: page("<h1>Previous tenant</h1>") });
  await settle();
  assert.equal(f.owner.value.dialog, false);
  assert.equal(f.owner.value.html, "");
  f.owner.value.toggle(true);
  await settle();
  assert.match(f.writes[0].args[0], /domains\/22\/maintenance$/);
  f.props.shop = { id: 9 };
  await settle();
  f.writes[0].resolve({ data: saved(true, { domain: { id: 22 } }) });
  await settle();
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
  f.owner.value.toggle(true);
  await settle();
  f.unmount();
  const count = f.events.length;
  f.writes[1].resolve({ data: saved(true, { domain: { id: 22 } }) });
  await settle();
  assert.equal(f.events.length, count);
});

test("a newer source read wins and a post-unmount GET cannot populate the old editor", async (t) => {
  const f = await fixture(t);
  f.button("html").click();
  await settle();
  f.owner.value.loadPage();
  await settle();
  f.reads[0].resolve({ data: page("<h1>Old</h1>") });
  await settle();
  assert.equal(f.owner.value.busy, true);
  assert.equal(f.owner.value.html, "");
  f.reads[1].resolve({ data: page("<h1>Newest</h1>") });
  await settle();
  assert.equal(f.owner.value.html, "<h1>Newest</h1>");
  f.owner.value.loadPage();
  await settle();
  const owner = f.owner.value;
  f.unmount();
  f.reads[2].resolve({ data: page("<h1>Unmounted</h1>") });
  await settle();
  assert.equal(owner.html, "<h1>Newest</h1>");
});

test("file A cannot overwrite a newer file or a pasted source edit", async (t) => {
  const f = await fixture(t);
  await f.open();
  const delayed = deferred();
  const first = file("<h1>First</h1>", { arrayBuffer: () => delayed.promise });
  const reading = f.owner.value.readFile(first);
  await f.owner.value.readFile(file("<h1>Second</h1>"));
  delayed.resolve(await file("<h1>First</h1>").arrayBuffer());
  await reading;
  assert.equal(f.owner.value.html, "<h1>Second</h1>");
  const pending = deferred();
  const stale = f.owner.value.readFile(
    file("<h1>Late</h1>", { arrayBuffer: () => pending.promise }),
  );
  await f.input("<h1>Pasted wins</h1>");
  pending.resolve(await file("<h1>Late</h1>").arrayBuffer());
  await stale;
  assert.equal(f.owner.value.html, "<h1>Pasted wins</h1>");
  assert.equal(f.owner.value.canSave, true);
});

test("an obsolete invalid file cannot leave an error on a newer pasted draft", async (t) => {
  const f = await fixture(t);
  await f.open();
  const pending = deferred();
  const reading = f.owner.value.readFile(
    file("bad", { arrayBuffer: () => pending.promise }),
  );
  await f.input("<h1>Pasted valid draft</h1>");
  pending.resolve(new Uint8Array([0xc3, 0x28]).buffer);
  await reading;
  await settle();
  assert.equal(f.owner.value.html, "<h1>Pasted valid draft</h1>");
  assert.equal(f.owner.value.fileError, "");
  assert.equal(f.owner.value.canSave, true);
});
