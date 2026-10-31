import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const files = {
  parent: "./BProductEditSpec.vue",
  table: "../../../../ui/product/spec/table/UProductSpecTable.vue",
  row: "../../../../storefront/product/spec/BProductSpecRow.vue",
};
const helperSource = readFileSync(new URL("../../../../../core-js/helper/product/SpecHelper.ts", import.meta.url), "utf8");
const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
function loadProductEnum(name) {
  const file = new URL(`../../../../../core-js/enums/product/${name}.ts`, import.meta.url);
  const exports = {};
  vm.runInNewContext(compile(readFileSync(file, "utf8")), {
    exports,
    require: path => path.endsWith(".svg") ? { default: new URL(path, file).href } : { Basket: {} },
  });
  return exports[name];
}
const ProductType = loadProductEnum("ProductType");
const ProductStatus = loadProductEnum("ProductStatus");

function fixture(name = "parent", { modern = true, vendorPanel = false, product = {}, ...overrides } = {}) {
  const { descriptor, errors } = parse(readFileSync(new URL(files[name], import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const requests = [], events = [], notices = [];
  const endpoint = (scope) => new Proxy({}, {
    get: (_, action) => (...ids) => `/fixture/${scope}/${String(action)}/${ids.join("/")}`,
  });
  const context = vm.createContext({
    exports: {}, console: { log() {} },
    axios: Object.fromEntries(["get", "post"].map((method) => [method, (url, payload) => new Promise((resolve, reject) => requests.push({
      method, url, payload, reject, resolve: (data) => resolve({ data }),
    }))])),
    window: { API: endpoint("shop"), VAPI: endpoint("vendor") },
    require(path) {
      if (path === "vue") return Vue;
      if (path.includes("enums/product/ProductStatus")) return { ProductStatus };
      if (path.includes("enums/product/ProductType")) return { ProductType };
      if (path.includes("SpecHelper")) return { SpecHelper };
      if (path === "@selldone/core-js/helper/index") return { StripTags: (value) => value.replace(/<[^>]*>/g, "") };
      if (path.includes("NotificationService")) return { default: Object.fromEntries(
        ["showSuccessAlert", "showWarningAlert", "showErrorAlert", "showLaravelError"].map((method) => [method, (...args) => notices.push({ method, args })]),
      ) };
      return { default: {} };
    },
  });
  vm.runInContext("Array.prototype.remove = function (value) { const index = this.indexOf(value); if (index >= 0) this.splice(index, 1); };", context);
  vm.runInContext(compile(helperSource), context);
  const SpecHelper = context.exports.SpecHelper;
  context.exports = {};
  vm.runInContext(compile(descriptor.script.content), context);
  const component = context.exports.default;
  const draft = (value) => vm.runInContext(`(${JSON.stringify(value)})`, context);
  const defaults = Object.fromEntries(Object.entries(component.props || {}).filter(([, prop]) => prop?.default !== undefined).map(([key, prop]) => [
    key, typeof prop.default === "function" ? prop.default() : prop.default,
  ]));
  const state = {
    ...defaults, ...component.data(), modern, editable: true, readOnly: false, autoSave: false,
    product: draft({ id: 31, shop_id: 42, spec: { Manufacturing: "group", Material: ["Plastic"] }, spec_order: ["Manufacturing", "Material"], ...product }),
    shop: { id: 42 }, spec: draft([]), item: draft(["Material", "Plastic"]),
    $refs: {}, $route: { params: vendorPanel ? { vendor_id: "9" } : {}, matched: [{ meta: { vendor: vendorPanel } }], hash: "" },
    $vuetify: { locale: { isRtl: false } },
    $emit: (...args) => events.push(args),
    $t: (key, values = {}) => key + (Object.keys(values).length ? ":" + JSON.stringify(values) : ""),
    $nextTick: (callback) => Promise.resolve().then(callback),
    getShopImagePath: value => value,
    IMAGE_SIZE_SMALL: 64,
    ...overrides,
  };
  for (const [key, method] of Object.entries(component.methods || {})) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed || {})) Object.defineProperty(state, key, { get: getter.bind(state) });
  component.created?.call(state);
  return { state, component, descriptor, requests, events, notices, draft };
}

function renderedNodes(descriptor, state) {
  const output = compileTemplate({ source: descriptor.template.content, filename: "spec-fixture.vue", id: "spec-check" });
  assert.deepEqual(output.errors, []);
  const exports = {};
  vm.runInNewContext(compile(output.code), { exports, require: () => ({
    ...Vue, resolveComponent: (name) => name, resolveDynamicComponent: (name) => name,
    resolveDirective: () => ({}), withDirectives: (node) => node,
  }) });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push(node);
    visit(node.children);
    if (node.children?.default) visit(node.children.default({}));
  }
  visit(exports.render(state, []));
  return nodes;
}

test("inline specification changes stay in the draft until an explicit save", () => {
  const { state, requests } = fixture();
  assert.equal(state.specHasChanges, false);
  state.spec[1][1] = "Ceramic";
  assert.equal(state.specHasChanges, true);
  assert.deepEqual(plain(state.product.spec.Material), ["Plastic"]);
  assert.equal(requests.length, 0);
});

test("removing a heading leaves its following specification rows and their values intact", () => {
  const { state, requests, draft } = fixture();
  state.spec = draft([{ group: "Manufacturing" }, ["Material", "Plastic", "Iron"], { group: "Dimensions" }, ["Height", "12 cm"]]);
  const material = state.spec[1], height = state.spec[3];
  state.deleteItemSpec(state.spec[0]);
  assert.deepEqual(plain(state.spec), [["Material", "Plastic", "Iron"], { group: "Dimensions" }, ["Height", "12 cm"]]);
  assert.equal(state.spec[0], material);
  assert.equal(state.spec[2], height);
  assert.equal(requests.length, 0);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} Save & Continue keeps the actual JSON/order payload and advances only on success`, async () => {
    const { state, requests, events } = fixture("parent", { vendorPanel });
    state.spec[1][1] = "Ceramic";
    state.saveSpec(true);
    assert.equal(state.busy, true);
    assert.match(requests[0].url, vendorPanel ? /\/vendor\/POST_MY_VENDOR_SAVE_SPEC\/9\/31$/ : /\/shop\/POST_SAVE_SPEC\/42\/31$/);
    assert.deepEqual(plain(requests[0].payload), {
      spec: { Manufacturing: "group", Material: ["Ceramic"] }, spec_order: ["Manufacturing", "Material"],
    });
    state.saveSpec(true);
    assert.equal(requests.length, 1);
    assert.equal(events.some(([name]) => name === "next"), false);
    assert.deepEqual(plain(state.product.spec.Material), ["Plastic"]);
    requests[0].resolve(requests[0].payload);
    await setImmediate();
    assert.equal(state.busy, false);
    assert.equal(state.specHasChanges, false);
    assert.equal(events.filter(([name]) => name === "next").length, 1);
    assert.equal(events.filter(([name]) => name === "update-spec").length, 1);
  });
}

test("failed saves retain the draft and persisted product and never advance", async () => {
  const { state, requests, events, notices } = fixture();
  state.spec[1][1] = "Ceramic";
  state.saveSpec(true);
  requests[0].resolve({ error: true, error_msg: "Fixture validation failure" });
  await setImmediate();
  assert.equal(state.specHasChanges, true);
  assert.equal(state.busy, false);
  assert.deepEqual(plain(state.product.spec.Material), ["Plastic"]);
  assert.equal(state.spec[1][1], "Ceramic");
  assert.equal(events.length, 0);
  assert.equal(notices.at(-1).method, "showErrorAlert");
  state.saveSpec(true);
  requests[1].reject(new Error("Fixture transport failure"));
  await setImmediate();
  assert.equal(state.busy, false);
  assert.equal(events.length, 0);
  assert.equal(notices.at(-1).method, "showLaravelError");
});

test("a successful canonical response marks an unchanged submitted draft clean", async () => {
  const { state, requests } = fixture();
  state.spec[1] = [" Material ", " Ceramic "];
  state.saveSpec(false);
  requests[0].resolve({ spec: { Manufacturing: "group", Material: ["Ceramic"] }, spec_order: ["Manufacturing", " Material "] });
  await setImmediate();
  assert.equal(state.specHasChanges, false);
  assert.deepEqual(plain(state.spec.find((row) => Array.isArray(row) && row[0] === "Material")), ["Material", "Ceramic"]);
  state.saveSpec(false);
  assert.equal(requests.length, 1);
});

test("a canonical response preserves edits made after the save request began", async () => {
  const { state, requests } = fixture();
  state.spec[1] = [" Material ", " Ceramic "];
  state.saveSpec(false);
  state.spec[1][1] = "Later unsaved edit";
  requests[0].resolve({ spec: { Manufacturing: "group", Material: ["Ceramic"] }, spec_order: ["Manufacturing", " Material "] });
  await setImmediate();
  assert.equal(state.spec[1][1], "Later unsaved edit");
  assert.equal(state.specHasChanges, true);
  assert.deepEqual(plain(state.product.spec.Material), ["Ceramic"]);
});

test("unchanged drafts continue without a request, while subdialogs own their shortcuts", () => {
  const { state, events, requests } = fixture();
  state.saveSpec(true);
  assert.equal(events.filter(([name]) => name === "next").length, 1);
  state.spec[1][1] = "Ceramic";
  for (const flag of ["dialog_ai", "dialog_import", "dialog_add_group", "dialog_add_spec"]) {
    state[flag] = true;
    state.saveSpec(true);
    state[flag] = false;
  }
  state.$refs.specTable = { dialog_sort: true };
  state.saveSpec(true);
  assert.equal(requests.length, 0);
  assert.equal(events.filter(([name]) => name === "next").length, 1);
});

test("Add autosave is opt-in and does not turn inline or replacement drafts into automatic requests", async () => {
  const { state, requests, draft } = fixture();
  state.group_title = "Dimensions";
  state.addGroup();
  assert.equal(requests.length, 0);
  state.autoSave = true;
  state.dialog_add_spec = true;
  state.item_title = "Height";
  state.item_value = "12 cm";
  state.addSpec();
  assert.equal(requests.length, 1);
  assert.equal(state.dialog_add_spec, false);
  requests[0].resolve(requests[0].payload);
  await setImmediate();
  state.spec[1][1] = "Inline edit";
  assert.equal(requests.length, 1);
  state.safeSetSpec(draft([null, ["Too short"], { invalid: true }, { group: "Imported" }, ["Finish", "Glazed"]]));
  assert.deepEqual(plain(state.spec), [{ group: "Imported" }, ["Finish", "Glazed"]]);
  assert.equal(state.specHasChanges, true);
  assert.equal(requests.length, 1);
});

test("inherited specifications remain read-only and can continue without a write", () => {
  const { state, requests, events, draft } = fixture("parent", { product: { parent_id: 99 } });
  const initial = plain(state.spec);
  state.group_title = "Blocked";
  state.item_title = "Blocked";
  state.item_value = "Blocked";
  state.addGroup(); state.addSpec(); state.deleteItemSpec(state.spec[0]);
  state.safeSetSpec(draft([["Blocked", "Blocked"]]));
  state.openImport(); state.openAI(); state.getSpecProduct("P1"); state.autoGenerateAI();
  state.saveSpec(false);
  assert.deepEqual(plain(state.spec), initial);
  assert.equal(requests.length, 0);
  assert.equal(state.dialog_import, false);
  assert.equal(state.dialog_ai, false);
  state.saveSpec(true);
  assert.equal(events.filter(([name]) => name === "next").length, 1);
});

test("import previews stay separate and stale product responses cannot replace the newest preview", async () => {
  const { state, requests } = fixture();
  const initial = plain(state.spec);
  state.openImport();
  state.selectProduct({ id: 2 });
  state.selectProduct({ id: 3 });
  assert.match(requests[0].url, /\/shop\/GET_SPEC_OF_PRODUCT\/42\/P2$/);
  requests[1].resolve({ spec: { Latest: ["Selected"] }, spec_order: ["Latest"] });
  await setImmediate();
  requests[0].resolve({ spec: { Stale: ["Ignored"] }, spec_order: ["Stale"] });
  await setImmediate();
  assert.deepEqual(plain(state.spec_selected), [["Latest", "Selected"]]);
  assert.deepEqual(plain(state.spec), initial);
  state.safeSetSpec(state.spec_selected);
  assert.deepEqual(plain(state.spec), [["Latest", "Selected"]]);
  assert.equal(requests.filter((request) => request.method === "post").length, 0);
  state.openImport();
  assert.equal(state.spec_selected, null);
});

test("opening Import starts Browse and selecting a source only enters a pending Review", () => {
  const { state, requests } = fixture("parent", { import_step: "review", import_error: true, spec_selected: [["Old", "Preview"]] });
  const initial = plain(state.spec);
  state.openImport();
  assert.equal(state.dialog_import, true);
  assert.equal(state.import_step, "browse");
  assert.equal(state.import_error, false);
  assert.equal(state.product_selected, null);
  assert.equal(state.spec_selected, null);
  assert.equal(state.importReady, false);
  const source = { id: 2, title: "Source", type: "PHYSICAL", status: "Open" };
  state.selectProduct(source);
  assert.equal(state.product_selected, source);
  assert.equal(state.import_step, "review");
  assert.equal(state.busy_find, true);
  assert.equal(state.importReady, false);
  state.replaceImportedSpec();
  assert.deepEqual(plain(state.spec), initial);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "get");
});

for (const failure of ["server", "transport"]) {
  test(`${failure} import failure keeps Replace unavailable, and retry retains the source and scoped GET`, async () => {
    const { state, requests } = fixture("parent", { vendorPanel: true });
    const initial = plain(state.spec);
    state.openImport();
    state.selectProduct({ id: 2 });
    if (failure === "server") requests[0].resolve({ error: true, error_msg: "Fixture denied" });
    else requests[0].reject(new Error("Fixture disconnected"));
    await setImmediate();
    assert.equal(state.busy_find, false);
    assert.equal(state.import_error, true);
    assert.equal(state.importReady, false);
    state.replaceImportedSpec();
    assert.deepEqual(plain(state.spec), initial);
    state.getSpecProduct(`P${state.product_selected.id}`);
    assert.equal(state.product_selected.id, 2);
    assert.equal(state.import_error, false);
    assert.equal(state.busy_find, true);
    assert.match(requests[1].url, /\/vendor\/GET_MY_VENDOR_SPEC_OF_PRODUCT\/9\/P2$/);
    requests[1].resolve({ spec: { Material: ["Steel"] }, spec_order: ["Material"] });
    await setImmediate();
    assert.equal(state.importReady, true);
    assert.deepEqual(plain(state.spec), initial);
  });
}

test("the rendered empty-source warning enables explicit local clearing without saving or advancing", async () => {
  const { state, descriptor, requests, events } = fixture("parent", { autoSave: true });
  const saved = plain(state.product.spec);
  state.openImport();
  state.selectProduct({ id: 2, title: "Empty source", type: "PHYSICAL", status: "Open" });
  requests[0].resolve({ spec: {}, spec_order: [] });
  await setImmediate();
  assert.equal(state.importReady, true);
  assert.deepEqual(plain(state.importSummary), { groups: 0, properties: 0 });
  const dialog = descriptor.template.ast.children.find(node => node.tag === "v-dialog" && node.props.some(prop => prop.name === "if" && prop.exp?.content === "modern") && node.props.some(prop => prop.name === "model" && prop.exp?.content === "dialog_import"));
  assert.ok(dialog);
  const nodes = renderedNodes({ template: { content: dialog.loc.source } }, state);
  const text = nodes.map(node => typeof node.children === "string" ? node.children : "").join(" ");
  assert.match(text, /add_product.spec_import.source_empty_help/);
  assert.match(text, /add_product.spec_import.clear_help/);
  assert.match(text, /global.product_types.physical/);
  assert.match(text, /product_status.open.name/);
  assert.equal(nodes.find(node => node.type === "v-img").props.src, ProductType.PHYSICAL.image);
  const replace = nodes.find(node => node.type === "v-btn" && node.props?.onClick === state.replaceImportedSpec);
  assert.equal(replace.props.disabled, false);
  replace.props.onClick();
  assert.deepEqual(plain(state.spec), []);
  assert.deepEqual(plain(state.product.spec), saved);
  assert.equal(state.dialog_import, false);
  assert.equal(requests.length, 1, "replacement must not use autosave");
  assert.equal(events.some(([name]) => name === "next" || name === "update-spec"), false);
});

test("Replace rechecks open Review, successful preview, save/loading and inherited-product guards", () => {
  const blocked = [
    state => { state.dialog_import = false; },
    state => { state.import_step = "browse"; },
    state => { state.product_selected = null; },
    state => { state.spec_selected = null; },
    state => { state.busy_find = true; },
    state => { state.busy = true; },
    state => { state.import_error = true; },
    state => { state.product.parent_id = 9; },
  ];
  for (const block of blocked) {
    const { state, requests } = fixture("parent", { dialog_import: true, import_step: "review", product_selected: { id: 2 }, spec_selected: [] });
    const initial = plain(state.spec);
    block(state);
    assert.equal(state.importReady, false);
    state.replaceImportedSpec();
    assert.deepEqual(plain(state.spec), initial);
    assert.equal(requests.length, 0);
  }
});

test("Back and dialog dismissal ignore late success, failure and finalizers from older sources", async () => {
  const { state, component, requests, notices } = fixture();
  const initial = plain(state.spec);
  state.openImport();
  state.selectProduct({ id: 2 });
  state.backToImportProducts();
  assert.equal(state.import_step, "browse");
  assert.equal(state.product_selected.id, 2, "Back preserves the source highlight");
  state.selectProduct({ id: 3 });
  requests[0].resolve({ spec: { Stale: ["Ignored"] }, spec_order: ["Stale"] });
  await setImmediate();
  assert.equal(state.busy_find, true, "an old finalizer must not finish the current load");
  assert.equal(state.spec_selected, null);
  state.closeImport();
  component.watch.dialog_import.call(state, false);
  requests[1].reject(new Error("Late dismissed response"));
  await setImmediate();
  assert.equal(state.import_error, false);
  assert.equal(state.product_selected, null);
  assert.equal(state.spec_selected, null);
  assert.equal(state.import_step, "browse");
  assert.equal(notices.length, 0);
  assert.deepEqual(plain(state.spec), initial);
  state.openImport();
  state.selectProduct({ id: 4 });
  component.beforeUnmount.call(state);
  requests[2].resolve({ spec: { Removed: ["Ignored"] }, spec_order: ["Removed"] });
  await setImmediate();
  assert.equal(state.spec_selected, null);
  assert.deepEqual(plain(state.spec), initial);
});

test("read-only changes during an import prevent response adoption and subsequent replacement", async () => {
  const { state, requests, notices } = fixture();
  const initial = plain(state.spec);
  state.openImport();
  state.selectProduct({ id: 2 });
  state.product.parent_id = 9;
  requests[0].resolve({ spec: { Source: ["Ignored"] }, spec_order: ["Source"] });
  await setImmediate();
  assert.equal(state.spec_selected, null);
  assert.equal(state.importReady, false);
  state.replaceImportedSpec();
  assert.deepEqual(plain(state.spec), initial);
  assert.equal(notices.length, 0);
});

test("the mounted two-step import hides Browse while preserving its exact picker and local query state", async () => {
  const { component, descriptor, state: fixtureState, requests } = fixture();
  const dialog = descriptor.template.ast.children.find(node => node.tag === "v-dialog" && node.props.some(prop => prop.name === "if" && prop.exp?.content === "modern") && node.props.some(prop => prop.name === "model" && prop.exp?.content === "dialog_import"));
  const template = compileTemplate({ source: dialog.loc.source, filename: "import-fixture.vue", id: "import-mounted" });
  assert.deepEqual(template.errors, []);
  const rendered = {};
  vm.runInNewContext(compile(template.code), { exports: rendered, require: () => Vue });
  const node = (tag, text = "") => ({ tag, text, props: {}, style: {}, children: [], parent: null, focus() {} });
  const renderer = Vue.createRenderer({
    createElement: tag => node(tag), createText: text => node("#text", text), createComment: text => node("#comment", text),
    insert(child, parent, anchor = null) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
    },
    remove(child) { child.parent?.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
    setText: (element, text) => { element.text = text; },
    setElementText: (element, text) => { element.text = text; element.children = []; },
    patchProp: (element, key, previous, value) => { element.props[key] = value; },
    parentNode: element => element.parent,
    nextSibling: element => element.parent?.children[element.parent.children.indexOf(element) + 1],
  });
  const slot = (tag = "div") => Vue.defineComponent({ setup: (props, { attrs, slots }) => () => Vue.h(tag, attrs, slots.default?.()) });
  const pickerStub = Vue.defineComponent({
    name: "BProductsWindow", inheritAttrs: false,
    data: () => ({ search: "", current_dir_id: null, product_page: 1, focusedProduct: null }),
    methods: { focusSelectedProduct(id) { this.focusedProduct = id; } },
    render() { return [Vue.h("section", { "data-picker": true }, this.search), Vue.h("div", { hidden: true })]; },
  });
  const app = renderer.createApp({
    ...component, render: rendered.render,
    components: { BProductsWindow: pickerStub, BProductEditInfoIcon: slot("i") },
  }, { modern: true, product: fixtureState.product, shop: fixtureState.shop });
  app.component("VDialog", Vue.defineComponent({ props: { modelValue: Boolean }, setup: (props, { slots }) => () => props.modelValue ? Vue.h("div", slots.default?.()) : null }));
  for (const name of ["VCard", "VCardText", "VCardActions", "VTooltip", "VAvatar", "VImg", "VProgressCircular"]) app.component(name, slot());
  app.component("VBtn", slot("button"));
  Object.assign(app.config.globalProperties, {
    $route: fixtureState.$route, $t: fixtureState.$t,
    $vuetify: { locale: { isRtl: false }, display: { xs: false, smAndDown: false } },
    getShopImagePath: fixtureState.getShopImagePath, IMAGE_SIZE_SMALL: 64,
  });
  const failures = [];
  app.config.errorHandler = error => failures.push(error);
  const host = node("root");
  const instance = app.mount(host);
  const descendants = element => [element, ...element.children.flatMap(descendants)];
  const visible = element => !element || (element.style.display !== "none" && !element.props.hidden && visible(element.parent));
  try {
    instance.openImport();
    await Vue.nextTick();
    const picker = instance.$refs.importPicker;
    picker.search = "lamp"; picker.current_dir_id = 7; picker.product_page = 3;
    const body = instance.$refs.importBody.$el;
    body.scrollTop = 148;
    await Vue.nextTick();
    assert.equal(visible(descendants(host).find(element => element.props["data-picker"])), true);
    instance.selectProduct({ id: 2, title: "Source", type: "PHYSICAL", status: "Open" });
    await Vue.nextTick();
    assert.equal(body.scrollTop, 0);
    assert.equal(instance.import_browse_scroll, 148);
    assert.equal(descendants(host).find(element => element.props.src === ProductType.PHYSICAL.image)?.props.src, ProductType.PHYSICAL.image);
    assert.equal(instance.$refs.importPicker, picker);
    assert.equal(visible(descendants(host).find(element => element.props["data-picker"])), false);
    requests[0].resolve({ spec: { Material: ["Steel"] }, spec_order: ["Material"] });
    await setImmediate();
    instance.backToImportProducts();
    await Vue.nextTick();
    assert.equal(instance.$refs.importPicker, picker);
    assert.equal(picker.search, "lamp");
    assert.equal(picker.current_dir_id, 7);
    assert.equal(picker.product_page, 3);
    assert.equal(picker.focusedProduct, 2);
    assert.equal(body.scrollTop, 148);
    assert.equal(visible(descendants(host).find(element => element.props["data-picker"])), true);
    instance.closeImport();
    await Vue.nextTick();
    assert.equal(instance.product_selected, null);
    assert.equal(instance.spec_selected, null);
    assert.equal(instance.import_step, "browse");
    instance.openImport();
    await Vue.nextTick();
    assert.notEqual(instance.$refs.importPicker, picker);
    assert.equal(instance.$refs.importPicker.search, "");
    assert.deepEqual(failures, []);
  } finally { app.unmount(); }
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} AI generation previews its own response and requires an explicit replacement/save`, async () => {
    const { state, requests } = fixture("parent", { vendorPanel });
    const initial = plain(state.spec);
    state.openAI();
    state.prompt = "Fixture product details";
    state.autoGenerateAI();
    assert.match(requests[0].url, vendorPanel ? /\/vendor\/POST_MY_VENDOR_AI_PRODUCT_AUTO_CREATE_SPEC\/9\/31$/ : /\/shop\/POST_AI_PRODUCT_AUTO_CREATE_SPEC\/42\/31$/);
    assert.deepEqual(plain(requests[0].payload), { prompt: "Fixture product details" });
    requests[0].resolve({ spec: { Generated: ["Preview only"] }, spec_order: ["Generated"] });
    await setImmediate();
    assert.deepEqual(plain(state.spec), initial);
    assert.deepEqual(plain(state.spec_generated), [["Generated", "Preview only"]]);
    state.safeSetSpec(state.spec_generated);
    assert.equal(requests.length, 1);
    assert.equal(state.specHasChanges, true);
    state.openAI();
    assert.equal(state.spec_generated, null);
  });
}

test("collapse and reorder retain all flat fields, their values and stable presentation identities", () => {
  const spec = [{ group: "Manufacturing" }, ["Material", "Plastic", "Iron"], { group: "Dimensions" }, ["Height", "12 cm"]];
  const { state } = fixture("table", { spec });
  const headingKey = state.getRowKey(spec[0]);
  assert.equal(state.modernRows[1].hidden, false);
  assert.equal(state.modernRows[3].hidden, true);
  state.toggleGroup(headingKey);
  assert.equal(state.modernRows[1].hidden, true);
  assert.equal(state.spec[1], spec[1]);
  state.toggleGroup(headingKey);
  state.spec = [spec[2], spec[3], spec[0], spec[1]];
  assert.equal(state.getRowKey(spec[0]), headingKey);
  assert.deepEqual(plain(state.spec), [{ group: "Dimensions" }, ["Height", "12 cm"], { group: "Manufacturing" }, ["Material", "Plastic", "Iron"]]);
  const flat = fixture("table", { spec: Array.from({ length: 7 }, (_, index) => [`Field ${index}`, `Value ${index}`]) }).state;
  assert.equal(flat.modernGroups[0].items.length, 7);
  assert.equal(flat.modernRows.filter((row) => !row.hidden).length, 7);
});

test("canonical replacement opens its first group while preserving an intentional all-collapsed state", () => {
  const { state, component, draft } = fixture("table", { spec: [{ group: "Original" }, ["Material", "Plastic"]] });
  const oldKey = state.expandedGroups[0];
  state.spec = draft([{ group: "Canonical" }, ["Material", "Ceramic"]]);
  component.watch.spec.call(state);
  assert.equal(state.expandedGroups.length, 1);
  assert.notEqual(state.expandedGroups[0], oldKey);
  assert.equal(state.modernRows[1].hidden, false);
  state.toggleGroup(state.expandedGroups[0]);
  state.spec = state.spec.slice();
  component.watch.spec.call(state);
  assert.equal(state.expandedGroups.length, 0);
  assert.equal(state.modernRows[1].hidden, true);
  assert.deepEqual(plain(state.spec), [{ group: "Canonical" }, ["Material", "Ceramic"]]);
});

test("flat reorder changes only the selected heading position and saves only with autosave enabled", async () => {
  for (const autoSave of [false, true]) {
    const parent = fixture("parent", { autoSave });
    parent.state.spec.push({ group: "Dimensions" }, ["Height", "12 cm"]);
    const { state: table } = fixture("table", { spec: parent.state.spec, autoSave });
    table.$emit = (event, value) => {
      if (event === "update") table.spec = parent.state.spec = value;
      if (event === "save") parent.state.saveSpec(false);
    };
    table.moveRow(2, -1);
    assert.deepEqual(plain(parent.state.spec), [{ group: "Manufacturing" }, { group: "Dimensions" }, ["Material", "Plastic"], ["Height", "12 cm"]]);
    assert.equal(parent.requests.length, autoSave ? 1 : 0);
    if (autoSave) {
      assert.deepEqual(plain(parent.requests[0].payload.spec_order), ["Manufacturing", "Dimensions", "Material", "Height"]);
      parent.requests[0].resolve(parent.requests[0].payload);
      await setImmediate();
    }
  }
});

test("heading deletion reaches the parent before autosave and keeps the following fields", async () => {
  const parent = fixture("parent", { autoSave: true });
  const { state: table } = fixture("table", { spec: parent.state.spec, autoSave: true });
  table.$emit = (event, value) => {
    if (event === "click-delete") parent.state.deleteItemSpec(value);
    if (event === "save") parent.state.saveSpec(false);
  };
  table.deleteModernRow(table.spec[0]);
  assert.deepEqual(plain(parent.state.spec), [["Material", "Plastic"]]);
  assert.deepEqual(plain(parent.requests[0].payload), { spec: { Material: ["Plastic"] }, spec_order: ["Material"] });
  parent.requests[0].resolve(parent.requests[0].payload);
  await setImmediate();
});

test("group digests follow live values while remaining bounded", () => {
  const items = [["Material", "Plastic", "Iron", "Wood"], ["Finish", "Glazed"], ["Height", "12 cm"]];
  const { state } = fixture("row", { item: { group: "Manufacturing" }, groupItems: items, collapse: true });
  assert.match(state.groupDigest, /Material: Plastic, Iron \(\+1\)/);
  assert.match(state.groupDigest, /Finish: Glazed.*\+1/);
  assert.doesNotMatch(state.groupDigest, /Height|Wood/);
  items[0][1] = "Ceramic";
  assert.match(state.groupDigest, /Material: Ceramic/);
  state.toggleCollapse();
  assert.equal(state.local_collapse, false);
});

test("the rendered Enter action inserts a value without replacing its neighbors or saving", async () => {
  const { state, descriptor, events } = fixture("row", { item: ["Material", "Plastic", "Iron"], editing: true });
  let focused = false;
  state.$refs.item_value = [{ focus() {} }, { focus() { focused = true; } }];
  const value = renderedNodes(descriptor, state).find((node) => node.type === "v-text-field" && (node.props?.modelValue ?? node.props?.["model-value"]) === "Plastic");
  assert.ok(value?.props.onKeydown);
  value.props.onKeydown({ key: "Enter", preventDefault() {}, stopPropagation() {} });
  await setImmediate();
  assert.deepEqual(plain(state.item), ["Material", "Plastic", "", "Iron"]);
  assert.equal(focused, true);
  assert.equal(events.some(([name]) => name === "save"), false);
  assert.equal(events.filter(([name]) => name === "change").length, 1);
  state.removeInnerItem(1);
  assert.equal(state.item[1], "Plastic", "the first value remains present");
  state.removeInnerItem(2);
  assert.deepEqual(plain(state.item), ["Material", "Plastic", "Iron"]);
});

test("six-dot drag handles are rendered only in editable modern rows, and legacy controls remain opted out", () => {
  for (const modern of [false, true]) for (const readOnly of [false, true]) {
    const { state, descriptor, events } = fixture("row", { modern, readOnly });
    const nodes = renderedNodes(descriptor, state);
    const grips = nodes.filter((node) => node.type === "b-product-edit-info-icon" && node.props?.name === "GripVertical");
    assert.equal(grips.length, modern && !readOnly ? 1 : 0);
    if (grips.length) {
      const handle = nodes.find((node) => node.type === "button" && node.props?.class?.includes("u-product-spec-table__handle"));
      assert.ok(handle.props["aria-label"]);
      handle.props.onClick();
      assert.equal(events.at(-1)[0], "arrange");
    }
  }
  const modern = fixture("table", { spec: [["Material", "Plastic"]] });
  const drag = renderedNodes(modern.descriptor, modern.state).find((node) => node.type === "draggable");
  assert.equal(drag.props.handle, ".u-product-spec-table__handle");
  assert.equal(drag.props.modelValue ?? drag.props["model-value"], modern.state.spec);
  const legacy = fixture("table", { modern: false, spec: [["Material", "Plastic"]] });
  const legacyDrag = renderedNodes(legacy.descriptor, legacy.state).find((node) => node.type === "draggable");
  assert.equal(legacyDrag.props.handle, undefined);
});

test("read-only tables and rows guard mutation methods while allowing disclosure", () => {
  const row = fixture("row", { readOnly: true, item: ["Material", "Plastic", "Iron"] });
  row.state.startEdit(); row.state.updateName("Blocked"); row.state.updateValue(1, "Blocked");
  row.state.addInnerItem(row.state.item, 1); row.state.removeInnerItem(2); row.state.deleteItem();
  assert.deepEqual(plain(row.state.item), ["Material", "Plastic", "Iron"]);
  assert.equal(row.state.editing, false);
  assert.equal(row.events.length, 0);
  row.state.toggleCollapse();
  assert.equal(row.events.at(-1)[0], "update:collapse");
  const table = fixture("table", { readOnly: true, spec: [["Material", "Plastic"]] });
  table.state.moveRow(0, 1); table.state.updateModernSpec([]); table.state.deleteModernRow(table.state.spec[0]); table.state.showOrderDialog();
  assert.equal(table.events.length, 0);
  assert.equal(table.state.dialog_sort, false);
  const drag = renderedNodes(table.descriptor, table.state).find((node) => node.type === "draggable");
  assert.equal(drag.props.disabled, true);
});

test("the actual workspace binding opts Edit and Add specifications into modern presentation", () => {
  const { descriptor, errors } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  function findSpec(node) {
    if (node.tag === "b-product-edit-spec") return node;
    for (const child of node.children || []) { const found = findSpec(child); if (found) return found; }
  }
  const element = findSpec(descriptor.template.ast);
  assert.ok(element);
  const exports = {};
  vm.runInNewContext(compile(descriptor.script.content), { exports, require: (path) => path === "vue" ? Vue : { default: {} } });
  const getModernWorkspace = exports.default.computed.modernWorkspace;
  for (const [modern, modernGeneral, expected] of [[true, false, true], [false, true, true], [false, false, false]]) {
    const state = {
      modern, modernGeneral, modernWorkspace: getModernWorkspace.call({ modern, modernGeneral }),
      $product: { id: 31 }, shop: { id: 42 }, TAB_SPEC: 4, setStepEditor() {}, nextStep() {},
    };
    const spec = renderedNodes({ template: { content: element.loc.source } }, state).find((node) => node.type === "b-product-edit-spec");
    assert.equal(spec.props.modern, expected);
  }
});
