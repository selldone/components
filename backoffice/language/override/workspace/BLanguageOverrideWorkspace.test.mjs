import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { performance } from "node:perf_hooks";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const key of ["window", "document", "Element", "SVGElement", "HTMLElement", "Node"]) globalThis[key] = dom.window[key];
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const Vue = await import("vue");
const require = createRequire(import.meta.url);
const read = file => readFileSync(new URL(file, import.meta.url), "utf8");
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const plain = value => JSON.parse(JSON.stringify(value));
function evaluate(source, imports = () => ({})) {
  const output = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  assert.deepEqual(output.diagnostics, []);
  const exports = {};
  vm.runInNewContext(output.outputText, { exports, require: imports, console, setTimeout, clearTimeout });
  return exports;
}
const parsed = parse(read("./BLanguageOverrideWorkspace.vue"));
assert.deepEqual(parsed.errors, []);
const { descriptor } = parsed;
const template = compileTemplate({ source: descriptor.template.content, filename: "BLanguageOverrideWorkspace.vue", id: "workspace-test", transformAssetUrls: { includeAbsolute: true } });
assert.deepEqual(template.errors, []);
const render = evaluate(template.code, name => name === "vue" ? Vue : {}).render;
const { Calendar } = evaluate(read("../../../../../core-js/enums/language/Calendar.ts"));
const { Language } = evaluate(read("../../../../../core-js/enums/language/Language.ts"), () => ({ Calendar }));
const bundle = await build({
  stdin: { contents: 'export { createVuetify } from "vuetify"; export { VTable } from "vuetify/components/VTable"; export { VPagination } from "vuetify/components/VPagination";', resolveDir: process.cwd() },
  bundle: true, write: false, format: "cjs", platform: "node", loader: { ".css": "empty" }, external: ["vue"], logLevel: "silent",
});
const native = { exports: {} };
vm.runInNewContext(bundle.outputFiles[0].text, { module: native, exports: native.exports, require, console, window, document, Node, Element, HTMLElement, SVGElement, ResizeObserver, setTimeout, clearTimeout });
const { createVuetify, VTable, VPagination } = native.exports;
const leaf = Vue.defineComponent({ inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h("div", attrs, [slots.activator?.({ props: {} }), slots.default?.()]) });
const button = Vue.defineComponent({ props: ["disabled"], setup: (props, { attrs, slots }) => () => Vue.h("button", { ...attrs, disabled: props.disabled }, slots.default?.()) });
const dialog = Vue.defineComponent({ props: ["modelValue"], setup: (props, { slots }) => () => props.modelValue ? Vue.h("div", { "data-open-editor": "true" }, slots.default?.()) : null });
const field = Vue.defineComponent({
  inheritAttrs: false, props: ["modelValue", "readonly", "disabled"], emits: ["update:modelValue"],
  setup: (props, { attrs, emit }) => () => Vue.h("input", { ...attrs, value: props.modelValue, readOnly: props.readonly, disabled: props.disabled, onInput: event => emit("update:modelValue", event.target.value) }),
});

async function fixture(t, source = { actions: { buy: "Buy {name}", search: "Search" }, checkout: { greeting: "Hello {name}" } }, initialOverrides = {}) {
  const notices = [], emitted = [], errors = [], warnings = [];
  const currentStructure = Vue.shallowRef(Vue.markRaw(source)), currentOverrides = Vue.shallowRef(Vue.markRaw(initialOverrides));
  const readonly = Vue.ref(false), disabled = Vue.ref(false), instance = Vue.shallowRef();
  const component = evaluate(descriptor.script.content, name => {
    if (name === "vue") return Vue;
    if (name.endsWith("/Language")) return { Language };
    if (name.includes("NotificationService")) return { default: new Proxy({}, { get: (_, key) => (...args) => notices.push([key, args]) }) };
    throw new Error("Unexpected workspace dependency: " + name);
  }).default;
  const compiled = { ...component, render };
  const app = Vue.createApp({ render: () => Vue.h(compiled, {
    ref: instance, structure: currentStructure.value, modelValue: currentOverrides.value, to: "fa", readOnly: readonly.value, disabled: disabled.value,
    "onUpdate:modelValue": value => { currentOverrides.value = value; emitted.push(["update", value]); }, onChanged: () => emitted.push(["changed"]),
  }) });
  app.use(createVuetify());
  app.config.globalProperties.$t = (key, values = {}) => key + (Object.keys(values).length ? JSON.stringify(values) : "");
  app.config.globalProperties.$n = String;
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  app.directive("copy", {});
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g))
    if (!["v-table", "v-pagination", "v-btn", "v-dialog", "v-text-field", "v-textarea"].includes(match[1])) app.component(match[1], leaf);
  app.component("v-table", VTable); app.component("v-pagination", VPagination); app.component("v-btn", button); app.component("v-dialog", dialog);
  app.component("v-text-field", field); app.component("v-textarea", field);
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, notices, emitted, readonly, disabled,
    get state() { return instance.value; }, get overrides() { return currentOverrides.value; },
    async replace(source, overrides) { currentStructure.value = Vue.markRaw(source); currentOverrides.value = Vue.markRaw(overrides); await settle(); },
    async search(value) { instance.value.search = value; await new Promise(resolve => setTimeout(resolve, 210)); await settle(); },
  };
}

test("workspace template, TypeScript and scoped styles compile", async () => {
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({ source: style.content, filename: "workspace.vue", id: "workspace-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(compiled.errors, []);
  }
});

test("100,000 translations keep rendered rows and empty override storage bounded", async t => {
  const source = {};
  for (let group = 0; group < 100; group++) source[`group_${group}`] = Object.fromEntries(Array.from({ length: 1000 }, (_, index) => [`key_${index}`, `Group ${group} translation ${index}`]));
  const started = performance.now();
  const f = await fixture(t, source);
  t.diagnostic(`100k-string mount and category counts: ${Math.round(performance.now() - started)} ms; ${f.host.querySelectorAll('*').length} DOM elements`);
  assert.equal(f.state.page_data.total, 100000);
  assert.equal(f.host.querySelectorAll(".b-language-workspace__row").length, 25);
  assert.ok(f.host.querySelectorAll("*").length < 1000, "DOM size is bounded by one page, not the pack size");
  assert.equal(f.host.querySelectorAll("[data-open-editor]").length, 0);
  assert.deepEqual(Object.keys(f.overrides), [], "Rendering never creates a default-sized override mirror");
  assert.equal(Vue.isReactive(f.state.structure), false, "The raw static pack remains outside deep Vue reactivity");
  f.state.page_size = 50; await settle();
  assert.equal(f.host.querySelectorAll(".b-language-workspace__row").length, 50);
  f.state.page = 2; await settle();
  assert.equal(f.state.page_data.rows[0].path_label, "group_0.key_50");
  f.state.category = f.state.category_entries.find(item => item.key === "group_50").value; await settle();
  assert.equal(f.state.page, 1); assert.equal(f.state.page_data.total, 1000);
  assert.equal(f.state.page_data.rows[0].path_label, "group_50.key_0");
  await f.search("translation 999");
  assert.equal(f.state.page_data.total, 1);
  assert.equal(f.state.page_data.rows[0].path_label, "group_50.key_999");
  f.state.category = 0; await settle();
  assert.equal(f.state.page_data.total, 100);
  assert.equal(f.host.querySelectorAll(".b-language-workspace__row").length, 50);
});

test("only one lazy editor applies sparse edits, search updates and default fallback", async t => {
  const source = { actions: { buy: "Buy {name}", search: "Search" } };
  const before = plain(source);
  const f = await fixture(t, source, { unrelated: { preserved: "Keep" } });
  const buy = f.state.page_data.rows[0];
  f.host.querySelector("[data-record]").click(); await settle();
  assert.equal(f.host.querySelectorAll("[data-open-editor]").length, 1);
  assert.equal(f.host.querySelectorAll(".b-language-workspace__editor").length, 1);
  f.state.input = "خرید {name}";
  f.state.applyRecord(); await settle();
  assert.deepEqual(plain(f.overrides), { unrelated: { preserved: "Keep" }, actions: { buy: "خرید {name}" } });
  assert.deepEqual(source, before, "Default pack is immutable through editing");
  assert.equal(f.emitted.filter(([event]) => event === "changed").length, 1);
  assert.equal(f.host.querySelectorAll("[data-open-editor]").length, 0);
  await f.search("خرید"); assert.equal(f.state.page_data.total, 1);
  f.state.openRecord(buy); f.state.input = ""; f.state.applyRecord(); await settle();
  assert.equal(f.state.page_data.total, 0, "Search no longer matches a cleared override");
  await f.search("");
  assert.equal(f.state.page_data.rows[0].custom, "");
  assert.equal(f.state.page_data.rows[0].original, "Buy {name}");
  assert.ok(f.host.querySelectorAll('[dir="rtl"]').length, "Translation values preserve target-language direction");
});

test("editing one field without a search does not re-read an entire large category", async t => {
  let reads = 0;
  const entries = {};
  for (let index = 0; index < 10000; index++) Object.defineProperty(entries, `key_${index}`, {
    enumerable: true,
    get() { reads++; return `Translation ${index}`; },
  });
  const f = await fixture(t, { category: entries });
  assert.equal(f.state.page_data.total, 10000);
  const first = f.state.page_data.rows[0];
  reads = 0;
  f.state.openRecord(first); f.state.input = "Edited"; f.state.applyRecord(); await settle();
  assert.ok(reads < 40, `Only the visible page and edited path are read again (${reads} reads)`);
  assert.equal(f.state.page_data.total, 10000, "Cached counts retain the complete category size");
  assert.equal(f.host.querySelectorAll('.b-language-workspace__row').length, 25);
  assert.equal(f.overrides.category.key_0, "Edited");
});

test("placeholder validation blocks applying missing parameters and repairs equal-count replacements", async t => {
  const f = await fixture(t, undefined, { actions: { buy: "Invalid import" } });
  assert.equal(f.state.page_data.rows[0].invalid_params, true);
  assert.match(f.host.textContent, /shop_languages.override_params_mismatch/);
  f.state.openRecord(f.state.page_data.rows[0]); f.state.input = "خرید";
  assert.equal(f.state.input_valid, false); f.state.applyRecord();
  assert.equal(f.overrides.actions.buy, "Invalid import", "An invalid local draft does not replace the imported value");
  assert.ok(f.state.selected);
  f.state.autoFix(); assert.equal(f.notices.length, 1);
  f.state.input = "خرید {wrong}"; f.state.autoFix();
  assert.equal(f.state.input, "خرید {name}"); assert.equal(f.state.input_valid, true);
  f.state.applyRecord(); assert.equal(f.overrides.actions.buy, "خرید {name}");
});

test("read-only and disabled boundaries discard drafts while retaining full-text viewing", async t => {
  const f = await fixture(t);
  f.state.openRecord(f.state.page_data.rows[0]); f.state.input = "Changed {name}";
  f.readonly.value = true; await settle(); assert.equal(f.state.selected, null);
  f.state.openRecord(f.state.page_data.rows[0]); await settle();
  assert.ok(f.state.selected, "Readers can inspect full text despite bounded table previews");
  f.state.input = "Not allowed {name}"; f.state.applyRecord(); f.state.autoFix();
  assert.deepEqual(Object.keys(f.overrides), []);
  assert.equal(f.host.querySelector('[data-action="apply-translation"]'), null);
  f.disabled.value = true; await settle(); assert.equal(f.state.selected, null);
  f.state.openRecord(f.state.page_data.rows[0]); assert.equal(f.state.selected, null);
});

test("full token paths preserve dotted keys, array positions, inherited keys and prototype safety", async t => {
  const source = JSON.parse('{"key.with.dots":{"items":["First","Second"],"name":"Name"},"__proto__":{"safe":"Safe"},"constructor":{"prototype":{"safe":"Other"}}}');
  const overrides = { "key.with.dots": { items: { 1: "Existing second" } } };
  Object.setPrototypeOf(source, { inherited: "Never a translation" });
  const f = await fixture(t, source, overrides);
  assert.equal(f.state.page_data.total, 5);
  const second = f.state.page_data.rows.find(row => row.path.at(-1) === "1");
  assert.equal(second.custom, "Existing second", "Numeric-object overrides are read without shifting array indices");
  f.state.openRecord(second); f.state.input = "Second changed"; f.state.applyRecord();
  assert.equal(f.overrides["key.with.dots"].items[1], "Second changed");
  assert.equal(f.overrides.key, undefined);
  for (const row of f.state.page_data.rows.filter(row => row.path[0] === "__proto__" || row.path[0] === "constructor")) {
    f.state.openRecord(row); f.state.input = "Safely stored"; f.state.applyRecord();
  }
  assert.equal(Object.getPrototypeOf(f.overrides), Object.prototype);
  assert.equal(({}).safe, undefined);
  assert.equal(Object.hasOwn(f.overrides, "__proto__"), true);
  assert.equal(f.overrides.__proto__.safe, "Safely stored");
  assert.equal(f.overrides.constructor.prototype.safe, "Safely stored");
});

test("package replacement resets navigation/editor state and keeps successful empty data distinct", async t => {
  const f = await fixture(t);
  f.state.openRecord(f.state.page_data.rows[0]); f.state.category = 1;
  await f.replace({ fresh: { value: "Fresh" } }, { fresh: { value: "New" } });
  assert.equal(f.state.selected, null); assert.equal(f.state.category, 0); assert.equal(f.state.page, 1);
  assert.equal(f.state.page_data.rows[0].custom, "New");
  await f.replace({}, {});
  assert.equal(f.state.page_data.total, 0);
  assert.equal(f.host.querySelectorAll(".b-language-workspace__row").length, 0);
  assert.ok(f.host.querySelector(".b-language-workspace__empty"));
});
