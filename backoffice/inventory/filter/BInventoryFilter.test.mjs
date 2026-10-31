import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import test, { after } from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

// Native Vuetify selection and chip handlers run locally; no app, HTTP or shop data.
const dom = new JSDOM("<!doctype html><html><body></body></html>", { pretendToBeVisual: true });
const globals = {
  window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
  Element: dom.window.Element, HTMLElement: dom.window.HTMLElement, SVGElement: dom.window.SVGElement,
  Node: dom.window.Node, ShadowRoot: dom.window.ShadowRoot,
  MouseEvent: dom.window.MouseEvent, KeyboardEvent: dom.window.KeyboardEvent, Event: dom.window.Event,
  getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
  requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
  cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
  CSS: { supports: () => false },
  visualViewport: { width: 1280, height: 800, offsetTop: 0, offsetLeft: 0, addEventListener() {}, removeEventListener() {} },
  devicePixelRatio: 1, history: dom.window.history,
};
const previous = Object.fromEntries(Object.keys(globals).map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
for (const [key, value] of Object.entries(globals)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
dom.window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
dom.window.visualViewport = globals.visualViewport;
after(() => {
  dom.window.close();
  for (const key of Object.keys(globals)) previous[key] ? Object.defineProperty(globalThis, key, previous[key]) : delete globalThis[key];
});

register("data:text/javascript," + encodeURIComponent(`export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
  return nextLoad(url, context);
}`), import.meta.url);
const Vue = await import("vue");
const Vuetify = await import("vuetify");
const { createVuetify } = Vuetify;
const { VSelect } = await import("vuetify/components/VSelect");
const { VChip } = await import("vuetify/components/VChip");
const { VIcon } = await import("vuetify/components/VIcon");
const { VListItem } = await import("vuetify/components/VList");
const { VForm } = await import("vuetify/components/VForm");
const { VBtn } = await import("vuetify/components/VBtn");
const { VCheckboxBtn } = await import("vuetify/components/VCheckbox");
const { VTooltip } = await import("vuetify/components/VTooltip");
const Form = await import("vuetify/lib/composables/form.js");

function evaluate(source, require = () => ({})) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, require });
  return exports;
}
const ProductType = evaluate(readFileSync(new URL("../../../../core-js/enums/product/ProductType.ts", import.meta.url), "utf8"),
  (name) => name.endsWith(".svg") ? { default: "/fixture-type.svg" } : { Basket: {} }).ProductType;
const ProductStatus = evaluate(readFileSync(new URL("../../../../core-js/enums/product/ProductStatus.ts", import.meta.url), "utf8")).ProductStatus;
const file = new URL("./BInventoryFilter.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "inventory-filter-test" });
assert.deepEqual(template.errors, []);
const decorative = Vue.defineComponent({ setup: () => () => Vue.h("span") });
const dependency = (name) => {
  if (name === "vue") return Vue;
  if (name === "vuetify") return Vuetify;
  if (name === "vuetify/lib/composables/form.js") return Form;
  if (name.includes("ProductType")) return { ProductType };
  if (name.includes("ProductStatus")) return { ProductStatus };
  if (name.endsWith(".vue")) return { default: decorative };
  throw new Error("Unexpected dependency " + name);
};
const Filter = evaluate(descriptor.script.content, dependency).default;
Filter.render = evaluate(template.code, dependency).render;
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await setImmediate(); await Vue.nextTick(); };
const caption = (code) => (ProductType[code] || ProductStatus[code]).name;

async function mounted(modern, selected, options = {}) {
  const model = Vue.ref([...selected]), events = [], errors = [], warnings = [];
  const attrs = Vue.reactive({ ...options.attrs }), form = Vue.reactive({ ...options.form });
  const width = options.width || 1280;
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  globals.visualViewport.width = width;
  const container = document.createElement("div");
  document.body.append(container);
  const control = () => Vue.h(Filter, {
      shop: { id: 1, need_verify: !!options.needVerify }, modern, dense: true, modelValue: model.value, ...attrs,
      "onUpdate:modelValue": (value) => { events.push({ event: "update", value: plain(value) }); model.value = value; },
      onChange: (value) => events.push({ event: "change", value: plain(value), model: plain(model.value), rendered: container.querySelector("output").textContent }),
    });
  const app = Vue.createApp({ setup: () => () => Vue.h("div", [
    options.form ? Vue.h(VForm, form, { default: control }) : control(),
    Vue.h("output", model.value.join(",")),
  ]) });
  app.use(createVuetify({
    components: { VSelect, VChip, VIcon, VListItem, VForm, VBtn, VCheckboxBtn, VTooltip },
    ssr: { clientWidth: width, clientHeight: 800 },
    locale: { locale: options.rtl ? "fa" : "en", rtl: { fa: true } },
    defaults: { VMenu: { transition: false } },
  }));
  app.component("v-img", decorative);
  app.config.globalProperties.$t = (key, args) => key === "inventory_filter.modern.active_count"
    ? options.rtl ? `${args.count} فیلتر فعال` : `${args.count} active filters`
    : key;
  app.config.errorHandler = (error) => errors.push(error);
  app.config.warnHandler = (warning) => warnings.push(warning);
  app.mount(container);
  await settle();
  assert.deepEqual(events, []);
  return {
    container, model, events, errors, warnings, attrs, form, modern, rtl: !!options.rtl,
    chip: (code) => [...container.querySelectorAll(".v-chip")].find((node) => node.textContent.includes(caption(code))),
    close: () => { app.unmount(); container.remove(); },
  };
}
function expectSelection(fixture, expected) {
  assert.deepEqual(plain(fixture.model.value), expected);
  expectVisibleSelection(fixture, expected);
  assert.deepEqual([...fixture.container.querySelector("select").selectedOptions].map((option) => option.value).sort(), [...expected].sort());
  assert.deepEqual(fixture.events, [
    { event: "update", value: expected },
    { event: "change", value: expected, model: expected, rendered: expected.join(",") },
  ]);
  assert.deepEqual(fixture.errors, []);
}
function expectVisibleSelection(fixture, selected) {
  const summarized = fixture.modern && selected.length > 1;
  const summaries = fixture.container.querySelectorAll(".b-inventory-filter__summary");
  assert.equal(fixture.container.querySelectorAll(".v-chip").length, summarized ? 0 : selected.length);
  assert.equal(summaries.length, summarized ? 1 : 0);
  assert.equal(fixture.container.querySelectorAll(".v-select__selection").length, summarized ? 1 : selected.length);
  if (summarized) assert.equal(summaries[0].textContent.trim(), fixture.rtl ? `${selected.length} فیلتر فعال` : `${selected.length} active filters`);
}

const codes = ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION", "Open", "Close", "Pending", "Rejected", "Unlisted"];
const input = (f) => f.container.querySelector('input[role="combobox"]');
const menu = () => document.querySelector(".v-overlay--active .v-select__content");
const rows = () => [...(menu()?.querySelectorAll('.v-list-item[role="option"]') || [])];
const option = (code) => rows().find((row) => row.dataset.filterValue === code || row.textContent.includes(caption(code)));
const keydown = (element, key) => element.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
async function open(f) {
  input(f).focus();
  keydown(input(f), "ArrowDown");
  await settle();
  // VMenu defers ArrowDown focus through two timers; finish before interaction/unmount.
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
  await settle();
  assert.equal(input(f).getAttribute("aria-expanded"), "true");
  assert.ok(menu());
}
function expectImmediate(f, expected) {
  assert.deepEqual(plain(f.model.value), expected);
  assert.deepEqual(f.events, [{ event: "update", value: expected }], "change must wait until the parent has rendered");
}

test("legacy multiple chips and modern single chips retain native mouse removal", async () => {
  const selected = ["PHYSICAL", "VIRTUAL", "Open"];
  for (const modern of [false, true]) for (const target of selected) {
    const initial = modern ? [target] : selected;
    const f = await mounted(modern, initial);
    try {
      f.chip(target).querySelector("button.v-chip__close").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
      await settle();
      expectSelection(f, initial.filter((code) => code !== target));
      assert.equal(f.chip(target), undefined);
    } finally { f.close(); }
  }
});

test("legacy multiple chips and modern single chips retain native Enter and Space removal", async () => {
  const selected = ["PHYSICAL", "VIRTUAL", "Open"];
  for (const modern of [false, true]) for (const key of ["Enter", " "]) for (const target of selected) {
    const initial = modern ? [target] : selected;
    const f = await mounted(modern, initial);
    try {
      const button = f.chip(target).querySelector("button.v-chip__close");
      button.focus();
      const event = new dom.window.KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
      button.dispatchEvent(event);
      assert.equal(event.defaultPrevented, true);
      await settle();
      expectSelection(f, initial.filter((code) => code !== target));
    } finally { f.close(); }
  }
});

test("closing the last Physical or Virtual chip emits the empty controlled selection", async () => {
  for (const modern of [false, true]) for (const target of ["PHYSICAL", "VIRTUAL"]) {
    const f = await mounted(modern, [target]);
    try {
      f.chip(target).querySelector("button.v-chip__close").click();
      await settle();
      expectSelection(f, []);
    } finally { f.close(); }
  }
});

test("native clear-all updates the model and rendered parent before the deferred change event", async () => {
  for (const modern of [false, true]) {
    const f = await mounted(modern, ["PHYSICAL", "VIRTUAL", "Open"]);
    try {
      const clear = f.container.querySelector('.v-field__clearable [role="button"]');
      assert.ok(clear, "The native clear-all control remains reachable");
      clear.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
      await settle();
      expectSelection(f, []);
    } finally { f.close(); }
  }
});

test("both filters offer exactly five product types and all five statuses regardless of verification", async () => {
  for (const modern of [false, true]) for (const needVerify of [false, true]) {
    const f = await mounted(modern, [], { needVerify });
    try {
      await open(f);
      assert.equal(rows().length, 10);
      for (const code of codes) assert.ok(option(code), `Missing native option: ${code}`);
      assert.deepEqual([...f.container.querySelector("select").options].map((item) => item.value), codes);
      assert.deepEqual(f.errors, []);
    } finally { f.close(); }
  }
});

test("native pointer activation opens the Split controls on desktop and mobile", async () => {
  for (const width of [1280, 390]) {
    const f = await mounted(true, [], { width });
    try {
      const field = f.container.querySelector(".v-field");
      field.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      field.click();
      await settle();
      assert.equal(input(f).getAttribute("aria-expanded"), "true");
      assert.equal(rows().length, 10);
      assert.deepEqual(f.errors, []);
    } finally { f.close(); }
  }
});

test("modern multi-count keeps every selection removable immediately through the native Split menu", async () => {
  for (const width of [1280, 390]) for (const rtl of [false, true]) {
    const f = await mounted(true, ["PHYSICAL", "VIRTUAL", "Open"], { width, rtl });
    try {
      expectVisibleSelection(f, ["PHYSICAL", "VIRTUAL", "Open"]);
      assert.deepEqual([...f.container.querySelector("select").selectedOptions].map((item) => item.value), ["PHYSICAL", "VIRTUAL", "Open"]);
      const summary = f.container.querySelector(".b-inventory-filter__summary");
      summary.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      summary.click();
      await settle();
      assert.equal(input(f).getAttribute("aria-expanded"), "true");
      assert.equal(rows().length, 10);
      for (const [code, expected] of [["PHYSICAL", ["VIRTUAL", "Open"]], ["Open", ["VIRTUAL"]], ["VIRTUAL", []]]) {
        f.events.length = 0;
        assert.equal(option(code).getAttribute("aria-selected"), "true");
        option(code).querySelector('input[type="checkbox"]').click();
        expectImmediate(f, expected);
        await settle();
        expectSelection(f, expected);
        assert.equal(option(code).getAttribute("aria-selected"), "false");
        assert.equal(input(f).getAttribute("aria-expanded"), "true");
      }
      assert.equal(input(f).getAttribute("placeholder"), "inventory_filter.all_products");
    } finally { f.close(); }
  }
});

test("Split choices combine types and statuses immediately and retain native menu selection", async () => {
  const f = await mounted(true, []);
  try {
    await open(f);
    for (const [code, expected] of [
      ["PHYSICAL", ["PHYSICAL"]], ["Open", ["PHYSICAL", "Open"]],
      ["Unlisted", ["PHYSICAL", "Open", "Unlisted"]], ["Open", ["PHYSICAL", "Unlisted"]],
    ]) {
      f.events.length = 0;
      const target = code === "PHYSICAL" ? option(code) : option(code).querySelector('input[type="checkbox"]');
      assert.ok(target, "Native row and checkbox controls remain usable");
      target.click();
      expectImmediate(f, expected);
      await settle();
      expectSelection(f, expected);
      assert.equal(option(code).querySelector('input[type="checkbox"]').checked, expected.includes(code));
      assert.equal(input(f).getAttribute("aria-expanded"), "true");
    }
  } finally { f.close(); }
});

test("native option Enter and Space toggle once and leave the Split menu open", async () => {
  for (const key of ["Enter", " "]) {
    const f = await mounted(true, ["PHYSICAL"]);
    try {
      await open(f);
      for (const expected of [["PHYSICAL", "Open"], ["PHYSICAL"]]) {
        f.events.length = 0;
        option("Open").focus();
        keydown(option("Open"), key);
        expectImmediate(f, expected);
        await settle();
        expectSelection(f, expected);
        assert.equal(input(f).getAttribute("aria-expanded"), "true");
      }
    } finally { f.close(); }
  }
});

test("Split clear-all is immediate, preserves the open menu and disables when empty", async () => {
  const f = await mounted(true, ["PHYSICAL", "Open"]);
  try {
    await open(f);
    menu().querySelector(".b-inventory-filter__clear").click();
    expectImmediate(f, []);
    await settle();
    expectSelection(f, []);
    assert.equal(input(f).getAttribute("placeholder"), "inventory_filter.all_products");
    assert.equal(input(f).getAttribute("aria-expanded"), "true");
    const clear = menu().querySelector(".b-inventory-filter__clear");
    assert.equal(clear.disabled, true);
    f.events.length = 0;
    clear.click();
    await settle();
    assert.deepEqual(f.events, []);
  } finally { f.close(); }
});

test("desktop and mobile RTL/LTR menus close without a draft and retain selection on reopening", async () => {
  for (const width of [1280, 390]) for (const rtl of [false, true]) for (const close of ["Done", "Escape", "outside"]) {
    const f = await mounted(true, ["PHYSICAL"], { width, rtl });
    try {
      await open(f);
      assert.equal(!!menu().closest(".v-locale--is-rtl"), rtl);
      assert.equal(rows().length, 10);
      option("Close").click();
      expectImmediate(f, ["PHYSICAL", "Close"]);
      await settle();
      expectSelection(f, ["PHYSICAL", "Close"]);
      f.events.length = 0;
      if (close === "Done") menu().querySelector(".b-inventory-filter__done").click();
      else if (close === "Escape") keydown(window, "Escape");
      else {
        const outside = document.querySelector(".v-overlay--active .v-overlay__scrim") || document.body;
        outside.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true }));
        outside.click();
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
      await settle();
      assert.equal(input(f).getAttribute("aria-expanded"), "false", `${width}px rtl=${rtl} close=${close}`);
      assert.deepEqual(f.events, [], "Closing never applies or cancels a draft");
      await open(f);
      assert.deepEqual(plain(f.model.value), ["PHYSICAL", "Close"]);
      assert.equal(option("PHYSICAL").getAttribute("aria-selected"), "true");
      assert.equal(option("Close").getAttribute("aria-selected"), "true");
      assert.deepEqual(f.events, []);
      assert.deepEqual(f.errors, []);
    } finally { f.close(); }
  }
});

test("modern direct and inherited form locks block opening, chips, clearing and stale open-menu actions", async () => {
  for (const guard of ["disabled", "readonly"]) for (const source of ["attrs", "form"]) for (const width of [1280, 390]) for (const selected of [["PHYSICAL"], ["PHYSICAL", "Open"]]) {
    const f = await mounted(true, selected, { width, [source]: { [guard]: true } });
    try {
      expectVisibleSelection(f, selected);
      const chip = () => f.chip("PHYSICAL")?.querySelector("button.v-chip__close");
      const attemptChip = () => {
        chip()?.click();
        if (chip()) { keydown(chip(), "Enter"); keydown(chip(), " "); }
      };
      keydown(input(f), "ArrowDown");
      f.container.querySelector(".v-field").dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true }));
      attemptChip();
      f.container.querySelector('.v-field__clearable [role="button"]')?.click();
      await settle();
      assert.equal(input(f).getAttribute("aria-expanded"), "false");
      assert.deepEqual(f.events, []);
      f[source][guard] = false;
      await settle();
      await open(f);
      const choice = option("Unlisted"), clear = menu().querySelector(".b-inventory-filter__clear");
      f[source][guard] = true;
      await settle();
      choice.click(); clear.click(); attemptChip();
      f.container.querySelector('.v-field__clearable [role="button"]')?.click();
      await settle();
      assert.deepEqual(plain(f.model.value), selected);
      expectVisibleSelection(f, selected);
      assert.deepEqual(f.events, []);
      assert.deepEqual(f.errors, []);
    } finally { f.close(); }
  }
});
