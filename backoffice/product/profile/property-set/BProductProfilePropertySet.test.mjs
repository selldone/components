import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const repository = new URL("../../../../../../", import.meta.url);
const filename = fileURLToPath(new URL("./BProductProfilePropertySet.vue", import.meta.url));
const source = readFileSync(filename, "utf8");
const { descriptor, errors } = parse(source, { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "product-property-set-profile-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "product-property-set-profile-test", compilerOptions: { bindingMetadata: script.bindings },
  transformAssetUrls: { includeAbsolute: true } });
assert.deepEqual(template.errors, []);
const transpile = code => ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const plain = value => JSON.parse(JSON.stringify(value));
function loadModule(path, globals = {}) {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(path, repository), "utf8")), { exports, ...globals });
  return exports;
}
const english = loadModule("@selldone/translate/dashboard/en.ts").default;
const translate = (key, values = {}) => {
  const value = key.split(".").reduce((entry, part) => entry?.[part], english);
  return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match) : key;
};
const propertySet = (extra = {}) => ({ id: 11, title: "Apparel", description: "Options for clothing",
  variants: [{ code: "style", name: "Size", icon: "straighten", values: ["XS", "M", "XL"] },
    { code: "type", name: "Fabric", icon: "texture", values: ["Cotton", "Linen"] },
    { code: "color", name: "Shade", icon: "palette" }], ...extra });
const product = (extra = {}) => ({ id: 31, type: "PHYSICAL", property_set_id: 11, property_set: propertySet(),
  tax_id: 5, warranty_id: 6, return_policy_id: 7, guide_id: 8, shipping_id: 9, title: "Synthetic product",
  price: 49.5, quantity: 8, variants: [{ id: 41, color: "navy", style: "M", price: 49.5, quantity: 8 }], ...extra });
const node = (type, text = "") => ({ type, text, props: {}, children: [], parent: null });
const renderer = Vue.createRenderer({
  createElement: type => node(type), createText: text => node("text", text), createComment: text => node("comment", text),
  insert(child, parent, anchor = null) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    parent.children.splice(anchor ? parent.children.indexOf(anchor) : parent.children.length, 0, child); child.parent = parent;
  },
  remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
  setText(child, text) { child.text = text; }, setElementText(child, text) { child.text = text; child.children = []; },
  patchProp(child, key, previous, next) { child.props[key] = next; }, parentNode: child => child.parent,
  nextSibling: child => child.parent?.children[child.parent.children.indexOf(child) + 1] || null,
});
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const allNodes = current => [current, ...current.children.flatMap(allNodes)];
const text = current => allNodes(current).map(item => item.text).join(" ").replace(/\s+/g, " ").trim();
function leaf(name, props = {}) {
  return Vue.defineComponent({ name, inheritAttrs: false, props,
    setup(values, { attrs, slots, emit }) {
      Vue.inject("calls").records.push({ name, props: values, attrs, emit });
      return () => name === "VDialog" && !values.modelValue ? Vue.createCommentVNode("closed")
        : Vue.h(name, { ...attrs, ...values, fixtureEmit: emit }, [slots.prepend?.(), slots.activator?.({ props: {} }),
          slots.append?.(), slots.default?.()]);
    },
  });
}

async function fixture(t, options = {}) {
  const calls = { records: [], http: [], retries: 0, warnings: [], errors: [] };
  const forbiddenHttp = (...args) => { calls.http.push(args); throw new Error("HTTP is forbidden in this isolated fixture"); };
  const shopOptionsHelper = loadModule("@selldone/core-js/helper/shop/ShopOptionsHelper.ts", { require: () => ({}) });
  const variants = loadModule("@selldone/core-js/enums/product/ProductVariants.ts", {
    require: () => shopOptionsHelper, console: { log() {} },
  });
  const colorGenerator = loadModule("@selldone/core-js/helper/color/ColorGenerator.ts");
  const transportations = loadModule("@selldone/core-js/enums/logistic/ShopTransportations.ts", {
    require: () => ({ default: "/synthetic-transportation.svg" }),
  });
  const props = Vue.reactive({ product: product(), shop: { id: 7 }, modern: true, ...options });
  variants.OverrideCustomVariantsName(props.shop);
  const requireDependency = name => {
    if (name === "vue") return Vue;
    if (name.includes("ProductVariants")) return variants;
    if (name.endsWith("ColorGenerator")) return colorGenerator;
    if (name.endsWith("ShopTransportations")) return transportations;
    if (name.includes("ProductType")) return { ProductType: { PHYSICAL: { code: "PHYSICAL" }, VIRTUAL: { code: "VIRTUAL" } } };
    if (name.endsWith("BPropertySetInput.vue")) return { default: {
      ...leaf("BPropertySetInput", { modelValue: {}, returnObject: Boolean, modern: Boolean }),
      emits: ["update:modelValue", "load-state"], methods: { getPropertySets() { calls.retries++; } },
    } };
    if (name.endsWith("BProductPropertySetPreview.vue")) {
      const path = new URL("@selldone/components-vue/backoffice/property-set/preview/BProductPropertySetPreview.vue", repository);
      const preview = parse(readFileSync(path, "utf8"), { filename: fileURLToPath(path) }).descriptor;
      const exports = {};
      vm.runInNewContext(transpile(preview.script.content), { exports, require: requireDependency });
      const compiled = compileTemplate({ source: preview.template.content, filename: fileURLToPath(path), id: "property-set-preview-test" });
      assert.deepEqual(compiled.errors, []);
      const render = {};
      vm.runInNewContext(transpile(compiled.code), { exports: render, require: requireDependency });
      return { default: { ...exports.default, render: render.render } };
    }
    if (name.endsWith(".jpg")) return "/synthetic-property-set.jpg";
    if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    throw new Error(`Unexpected dependency: ${name}`);
  };
  const context = vm.createContext({ exports: {}, fetch: forbiddenHttp,
    axios: new Proxy({}, { get: () => forbiddenHttp }), window: {}, require: requireDependency });
  vm.runInContext(transpile(readFileSync(new URL("@selldone/core-js/prototypes/StringPrototypes.ts", repository), "utf8")), context);
  context.exports = {};
  vm.runInContext(`(() => { ${transpile(descriptor.script.content)} })()`, context);
  const component = context.exports.default;
  context.exports = {};
  vm.runInContext(`(() => { ${transpile(template.code)} })()`, context);
  component.render = context.exports.render;
  const display = Vue.reactive({ xs: false });
  let state;
  const mountedComponent = { ...component,
    render(...args) { state = this; return component.render.apply(this, args); },
  };
  const app = renderer.createApp({ render: () => Vue.h(mountedComponent, { ...props }) });
  app.provide("calls", calls);
  for (const name of ["VListItem", "VListItemTitle", "VListItemSubtitle", "VListItemAction", "VBtn", "VIcon", "VCard", "VCardTitle", "VCardText", "VCardActions", "VListSubheader", "UWidgetHeader", "VChip", "VLocaleProvider", "VDivider"]) app.component(name, leaf(name));
  app.component("VTooltip", leaf("VTooltip", { modelValue: Boolean }));
  app.component("VDialog", leaf("VDialog", { modelValue: Boolean, fullscreen: Boolean, maxWidth: [Number, String] }));
  Object.assign(app.config.globalProperties, {
    $route: options.vendor ? { params: { shop_id: "7", vendor_id: "8", product_id: "31" }, matched: [{ meta: { vendor: true } }] }
      : { params: { shop_id: "7", product_id: "31" }, matched: [] },
    $vuetify: { display, locale: { isRtl: false } }, $t: translate,
    USER: () => ({ preferences: { dark: false } }),
    getShopImagePath: () => "/synthetic-product.png",
  });
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  const root = node("root"); app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); assert.deepEqual(calls.http, []); });
  return { state, props, display, calls, root, component, variants,
    find: type => allNodes(root).find(item => item.type === type),
    record: name => calls.records.filter(item => item.name === name).at(-1),
    rendered: () => text(root),
    async open() { state.showEdit(); await settle(); },
    async choose(value) { calls.records.filter(item => item.name === "BPropertySetInput").at(-1).emit("update:modelValue", value); await settle(); },
    async selectorStatus(value) { calls.records.filter(item => item.name === "BPropertySetInput").at(-1).emit("load-state", value); await settle(); },
    async confirm() {
      const dialog = allNodes(root).find(item => item.type === "VDialog");
      const confirm = allNodes(dialog).find(item => item.type === "VBtn" && item.props.color === "primary" && !item.props.to && item.props.onClick);
      assert.ok(confirm); assert.ok(!confirm.props.disabled); confirm.props.onClick(); await settle();
    },
  };
}

test("the property-set dialog template and scoped styles compile", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename, id: "product-property-set-profile-test", scoped: style.scoped, preprocessLang: style.lang,
  })).errors, []);
});

test("the native selector changes a local draft until Confirm applies only the property-set fields", async t => {
  const f = await fixture(t), before = plain(f.props.product);
  await f.open();
  assert.deepEqual(plain(f.state.property_set), before.property_set);
  assert.equal(f.find("BPropertySetInput").props.returnObject, true);
  assert.equal(f.find("BPropertySetInput").props.modern, true);
  const next = propertySet({ id: 12, title: "Custom apparel" });
  await f.choose(next);
  assert.equal(f.state.property_set.id, 12);
  assert.deepEqual(plain(f.props.product), before);
  await f.confirm();
  assert.deepEqual(plain(f.props.product), { ...before, property_set_id: 12, property_set: next });
  assert.equal(f.state.assign_dialog, false);
});

test("Cancel and native Escape/backdrop dismissal preserve the applied assignment on reopen", async t => {
  for (const dismissal of ["cancel", "native"]) {
    const f = await fixture(t), before = plain(f.props.product);
    await f.open(); await f.choose(propertySet({ id: 12,
      variants: [{ code: "style", name: "Unconfirmed sizing", icon: "straighten" }] }));
    if (dismissal === "cancel") {
      const cancel = allNodes(f.root).find(item => item.type === "VBtn" && text(item) === translate("global.actions.cancel"));
      assert.ok(cancel); cancel.props.onClick();
    } else f.record("VDialog").emit("update:modelValue", false);
    await settle();
    assert.equal(f.state.assign_dialog, false);
    assert.deepEqual(plain(f.props.product), before);
    assert.doesNotMatch(f.rendered(), /Unconfirmed sizing/);
    await f.open();
    assert.deepEqual(plain(f.state.property_set), before.property_set);
  }
});

test("clearing the selector confirms explicit null so General Save can remove a persisted assignment", async t => {
  const f = await fixture(t), before = plain(f.props.product);
  await f.open(); await f.choose(null);
  assert.equal(f.state.property_set, null);
  assert.deepEqual(plain(f.props.product), before);
  await f.confirm();
  assert.deepEqual(plain(f.props.product), { ...before, property_set_id: null, property_set: null });
  assert.ok(JSON.stringify(f.props.product).includes('"property_set_id":null'));
  await f.open(); assert.equal(f.state.property_set, null);
});

test("the complete six-axis preview preserves saved order and configured labels and icons", async t => {
  const codes = ["type", "pack", "weight", "style", "color", "volume"];
  const selected = propertySet({ variants: codes.map(code => ({ code, name: `Custom ${code}`, icon: `custom_${code}` })) });
  const f = await fixture(t, { product: product({ property_set: selected }) });
  await f.open();
  const preview = allNodes(f.root).find(item => item.type === "ol");
  assert.ok(preview);
  const rows = allNodes(preview).filter(item => item.type === "li");
  assert.equal(rows.length, 6);
  for (let index = 0; index < codes.length; index++) assert.ok(text(rows[index]).includes(`Custom ${codes[index]}`));
  assert.deepEqual(rows.map(row => text(allNodes(row).find(item => item.type === "VIcon"))), codes.map(code => `custom_${code}`));
});

test("partial and empty property sets retain every axis with the real shop-default names and icons", async t => {
  const shop = { id: 7, options: [{ code: "variants", value: { volume: "Capacity", volume_icon: "water_drop",
    weight: "Mass", weight_icon: "balance", pack: "Pieces", pack_icon: "inventory_2" } }] };
  const f = await fixture(t, { shop });
  await f.open();
  const rows = () => allNodes(f.root).find(item => item.type === "ol").children.filter(item => item.type === "li");
  const labels = () => rows().map(text);
  const icons = () => rows().map(row => text(allNodes(row).find(item => item.type === "VIcon")));
  for (const [index, label] of ["Size", "Fabric", "Shade", "Capacity", "Mass", "Pieces"].entries()) assert.ok(labels()[index].includes(label));
  assert.deepEqual(icons(), ["straighten", "texture", "palette", "water_drop", "balance", "inventory_2"]);
  assert.match(text(rows()[0]), /XS.*M.*XL/);
  assert.match(text(rows()[1]), /Cotton.*Linen/);
  for (const value of [null, propertySet({ variants: [] })]) {
    await f.choose(value);
    for (const [index, label] of [translate("global.variants.color"), translate("global.variants.style"), "Capacity", "Mass", "Pieces", translate("global.variants.type")].entries()) assert.ok(labels()[index].includes(label));
  }
});

test("suggested values keep native image/color previews and real asset-label formatting without changing stored values", async t => {
  const selected = propertySet({ variants: [
    { code: "style", name: "Size", icon: "straighten", values: ["XS{woven}", "M", "XL", "XXL"] },
    { code: "color", name: "Shade", icon: "palette", values: ["#ff0000", "#00ff00", "#0000ff", "#333333"] },
  ] });
  const f = await fixture(t, { product: product({ property_set: selected }) });
  const before = plain(f.props.product);
  await f.open();
  const preview = allNodes(f.root).find(item => item.type === "ol");
  assert.match(text(preview), /XS.*M.*XL/);
  assert.doesNotMatch(text(preview), /\{woven\}|XXL/);
  assert.ok(f.calls.records.some(item => item.name === "UVariantAssetImage" && item.attrs.value === "XS{woven}"));
  assert.ok(f.calls.records.some(item => item.name === "UColorCircle" && item.attrs.color === "#ff0000"));
  assert.deepEqual(plain(f.props.product), before);
});

test("modern desktop/mobile retain the native dialog while legacy callers keep their fullscreen preview", async t => {
  const f = await fixture(t);
  assert.equal(f.component.props.modern.default, false);
  await f.open(); assert.equal(f.find("VDialog").props.fullscreen, false);
  f.display.xs = true; await settle(); assert.equal(f.find("VDialog").props.fullscreen, true);
  const legacy = await fixture(t, { modern: false });
  await legacy.open(); assert.equal(legacy.find("VDialog").props.fullscreen, true);
  assert.ok(legacy.find("UWidgetHeader"));
  assert.ok(allNodes(legacy.root).some(item => item.props.class?.split(" ").includes("b--product-property-set-preview")));
  await legacy.choose(propertySet({ id: 12 })); await legacy.confirm();
  assert.equal(legacy.props.product.property_set_id, 12);
});

test("selector loading and errors block confirmation; Retry calls the native input and recovery preserves its draft", async t => {
  const f = await fixture(t), before = plain(f.props.product);
  await f.open(); await f.choose(propertySet({ id: 12 }));
  const confirm = () => allNodes(f.root).find(item => item.type === "VBtn" && text(item) === translate("product_property_set.profile_refined.confirm"));
  for (const status of [{ loading: true, error: false }, { loading: false, error: true }]) {
    await f.selectorStatus(status);
    assert.equal(confirm().props.disabled, true);
    f.state.confirm(); await settle();
    assert.equal(f.state.assign_dialog, true);
    assert.equal(f.state.property_set.id, 12);
    assert.deepEqual(plain(f.props.product), before);
  }
  const retry = allNodes(f.root).find(item => item.type === "VBtn" && text(item) === translate("product_property_set.profile_refined.retry"));
  assert.ok(retry); retry.props.onClick(); await settle();
  assert.equal(f.calls.retries, 1);
  await f.selectorStatus({ loading: false, error: false });
  assert.ok(!confirm().props.disabled);
  await f.confirm(); assert.equal(f.props.product.property_set_id, 12);
});

test("malformed unpersisted selections cannot confirm or silently clear the applied assignment", async t => {
  const f = await fixture(t), before = plain(f.props.product);
  await f.open();
  for (const value of [{ title: "Missing id" }, { id: null, title: "No persisted identity" }]) {
    await f.choose(value);
    assert.equal(f.state.confirmBlocked, true);
    f.state.confirm(); await settle();
    assert.equal(f.state.assign_dialog, true);
    assert.deepEqual(plain(f.props.product), before);
  }
});

test("Create retains its native new-tab management route and is disabled for vendors while selection remains available", async t => {
  for (const vendor of [false, { id: 8 }]) {
    const f = await fixture(t, { vendor });
    await f.open();
    const create = allNodes(f.root).find(item => item.type === "VBtn" && item.props.target === "_blank");
    assert.ok(create);
    assert.equal(create.props.rel, "noopener noreferrer");
    assert.equal(create.props.disabled, !!vendor);
    assert.equal(create.props.to?.name, vendor ? undefined : "BPageShopLogisticPropertySets");
    assert.ok(f.find("BPropertySetInput"));
    await f.choose(propertySet({ id: 12 })); await f.confirm();
    assert.equal(f.props.product.property_set_id, 12);
  }
  const legacy = await fixture(t, { modern: false, vendor: { id: 8 } });
  await legacy.open();
  assert.equal(legacy.find("UWidgetHeader").props.disabled, true);
  assert.equal(legacy.find("UWidgetHeader").props.to, undefined);
});

test("General Discard or a refreshed relation updates the applied summary and the next opened selection", async t => {
  const f = await fixture(t);
  const updated = propertySet({ id: 12, title: "Updated property set" });
  f.props.product.property_set_id = updated.id;
  f.props.product.property_set = updated;
  await settle();
  assert.match(f.rendered(), /Updated property set/);
  await f.open(); assert.equal(f.state.property_set, f.props.product.property_set);
});

test("the property-set row remains available only for physical and virtual products", async t => {
  for (const type of ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"]) {
    const f = await fixture(t, { product: product({ type }) });
    assert.equal(!!f.find("VListItem"), ["PHYSICAL", "VIRTUAL"].includes(type), type);
  }
});

test("General create/update payloads preserve ids and explicit null without sending the loaded property-set relation", () => {
  const file = new URL("@selldone/components-vue/backoffice/product/add/full/BProductAddFull.vue", repository);
  const editor = parse(readFileSync(file, "utf8"), { filename: fileURLToPath(file) }).descriptor;
  for (const property_set_id of [11, null]) for (const vendor of [false, true]) for (const method of ["addProduct", "editProduct"]) {
    const writes = [], exports = {};
    const endpoints = new Proxy({}, { get: (_, key) => (...args) => `/${String(key)}/${args.join("/")}` });
    const capture = (url, payload) => { writes.push({ url, payload }); return new Promise(() => {}); };
    vm.runInNewContext(transpile(editor.script.content), { exports, require: () => ({}),
      axios: { post: capture, put: capture }, window: { API: endpoints, VAPI: endpoints },
    });
    const value = { ...product({ property_set_id }), pricing: "FIX", currency: "USD" };
    exports.default.methods[method].call({ $product: value, step: 2, stepEditors: {},
      IS_VENDOR_PANEL: vendor, vendor: { id: 8 }, shop: { id: 7 }, $shop: { currencies: ["USD"] }, $t: key => key,
    });
    assert.equal(writes.length, 1);
    assert.equal(writes[0].payload.property_set_id, property_set_id);
    const serialized = JSON.parse(JSON.stringify(writes[0].payload));
    assert.equal(Object.hasOwn(serialized, "property_set_id"), true);
    assert.equal(serialized.property_set_id, property_set_id);
    assert.equal(Object.hasOwn(writes[0].payload, "property_set"), false);
    assert.doesNotMatch(JSON.stringify(writes[0].payload), /Options for clothing|Apparel|Cotton/);
    const expected = method === "addProduct" ? (vendor ? "/POST_MY_VENDOR_ADD_PRODUCT/8" : "/POST_ADD_PRODUCT/7")
      : (vendor ? "/PUT_MY_VENDOR_EDIT_PRODUCT/8/31" : "/PUT_EDIT_PRODUCT/7/31");
    assert.equal(writes[0].url, expected);
  }
});

test("Refined property-set profile copy exists in English and Persian with matching interpolation", () => {
  const persian = loadModule("@selldone/translate/dashboard/fa.ts").default;
  const entries = english.product_property_set.profile_refined;
  assert.ok(entries);
  assert.deepEqual(Object.keys(entries).sort(), Object.keys(persian.product_property_set.profile_refined).sort());
  for (const key of Object.keys(entries)) {
    const values = [entries[key], persian.product_property_set.profile_refined[key]];
    for (const value of values) assert.equal(typeof value, "string", key);
    assert.deepEqual([...values[0].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
      [...values[1].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), key);
  }
});
