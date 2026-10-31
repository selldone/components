import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { compileScript, compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";

const require = createRequire(import.meta.url);
const JsBarcode = require("jsbarcode");
const file = new URL("./BProductBarcode.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "product-barcode-test" });
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "product-barcode-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
for (const block of descriptor.styles) {
  const result = await compileStyleAsync({ source: block.content, filename: file.pathname, id: "product-barcode-test", scoped: block.scoped, preprocessLang: block.lang });
  assert.deepEqual(result.errors, []);
}
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const element = (type, text = "") => ({ type, text, props: {}, children: [], parent: null });
const renderer = Vue.createRenderer({
  createElement: (type) => element(type),
  createText: (text) => element("text", text),
  createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    node.parent = parent;
  },
  remove(node) { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; },
  setText(node, text) { node.text = text; },
  setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; },
  parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const stub = (name) => ({
  name, inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => Vue.h(name, attrs, [slots.activator?.({ props: {} }), slots.default?.()]);
  },
});
const text = (node) => node.type === "comment" ? "" : node.text + node.children.map(text).join("");
const findAll = (node, predicate) => [...(predicate(node) ? [node] : []), ...node.children.flatMap((child) => findAll(child, predicate))];
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const product = (patch = {}) => ({ id: 31, title: "Adorable Cat Shaped Cactus Pot", sku: "01234567890123", icon: "pot.png", price: 20, commission: 2.5, currency: "USD", ...patch });
const variant = (patch = {}) => ({ id: 72, sku: "001234567890", color: "#ff0000", style: "Floral{texture-id}", volume: "1L", weight: "200g", pack: "2", type: "Matte", pricing: true, price: 8, commission: 1, currency: "EUR", ...patch });

async function fixture(t, patch = {}) {
  const calls = { print: [], format: [], copy: [], emitted: [], errors: [], warnings: [] };
  const context = vm.createContext({ exports: {}, console, require: (name) => {
    if (name === "vue") return Vue;
    if (name === "jsbarcode") return { default: JsBarcode };
    if (name.includes("/Print")) return { Print: { PrintElement: (id) => calls.print.push(id) } };
    if (name.includes("CurrencyMixin")) return { default: { methods: { getFormatPriceCurrency(amount, currency) { calls.format.push([amount, currency]); return `${currency}:${amount.toFixed(2)}`; } } } };
    if (name === "@selldone/core-js/helper") return { ShopURLs: { MainShopUrl: (shop) => shop.main_url } };
    if (name.includes("ColorHelper")) return { GetNameOfColor: (color) => color === "#ff0000" ? "Red" : null };
    if (name.endsWith(".vue")) return { default: stub(name.split("/").at(-1).replace(".vue", "").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()) };
    return {};
  } });
  // Use the real variant-asset string extension in the same isolated JS realm as the SFC.
  const prototypes = new URL("../../../../core-js/prototypes/StringPrototypes.ts", import.meta.url);
  vm.runInContext(transpile(readFileSync(prototypes, "utf8")), context);
  context.exports = {};
  vm.runInContext(transpile(descriptor.script.content), context);
  const component = context.exports.default;
  context.exports = {};
  vm.runInContext(transpile(template.code), context);
  const render = context.exports.render;
  let state;
  const testComponent = { ...component, render(...args) { state = this; return render.apply(this, args); } };
  const props = Vue.reactive({ modelValue: true, shop: { id: 4, main_url: "https://store.example.test" }, product: product(), variant: null, barcode2d: false, linkMode: false, ...patch });
  const app = renderer.createApp({ render: () => Vue.h(testComponent, {
    ...props, "onUpdate:modelValue": (value) => calls.emitted.push(value),
  }) });
  Object.assign(app.config.globalProperties, { $t: (key) => key, $vuetify: { locale: { isRtl: false }, display: { mobile: false } }, USER: () => ({ preferences: { dark: false } }), getShopImagePath: (path) => `/images/${path}`, copyToClipboard: (value) => calls.copy.push(value) });
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  const dialogContent = Vue.ref(true);
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) {
    app.component(match[1], match[1] === 'v-dialog' ? {
      inheritAttrs: false,
      setup(_, { attrs, slots }) { return () => Vue.h('v-dialog', attrs, dialogContent.value ? slots.default?.() : null); },
    } : stub(match[1]));
  }
  app.directive("copy", {});
  const root = element("root");
  app.mount(root);
  await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const nodes = (name) => findAll(root, (node) => node.type === name);
  const button = (label) => findAll(root, (node) => ["v-btn", "button"].includes(node.type) && (node.props["aria-label"] === label || text(node).includes(label)))[0];
  const click = async (node) => {
    assert.ok(node, "the native action is rendered");
    assert.notEqual(node.props.disabled, true, "the native action is available");
    const handlers = Array.isArray(node.props.onClick) ? node.props.onClick : [node.props.onClick];
    for (const handler of handlers) handler({ stopPropagation() {}, preventDefault() {} });
    await settle();
  };
  return { state, props, calls, root, nodes, button, click, dialogContent };
}

test("native payloads preserve leading-zero product and variant SKUs; public URL remains product-scoped", async (t) => {
  const f = await fixture(t);
  assert.equal(f.state.qrcode_value, "01234567890123");
  assert.equal(f.nodes("u-barcode")[0].props.value, "01234567890123");
  await f.click(f.button("b_product_dashboard.barcode.copy_sku"));
  assert.equal(f.calls.copy.at(-1), "01234567890123");
  f.props.variant = variant();
  await settle();
  assert.equal(f.state.qrcode_value, "001234567890");
  f.props.linkMode = true;
  f.props.barcode2d = true;
  await settle();
  assert.equal(f.state.qrcode_value, "https://store.example.test/product/31");
  assert.equal(f.nodes("u-qrcode")[0].props.value, "https://store.example.test/product/31");
  await f.click(f.button("b_product_dashboard.barcode.copy_link"));
  assert.equal(f.calls.copy.at(-1), "https://store.example.test/product/31");
  assert.ok(!f.state.qrcode_value.includes("72"), "a variant must not silently change the public URL contract");
  f.props.linkMode = false;
  await settle();
  assert.equal(f.state.qrcode_value, "001234567890");
});

test("captions retain full versus short names, actual dimensions and price plus commission in native currency", async (t) => {
  const f = await fixture(t);
  assert.equal(f.state.barcode_text, "Adorable Cat Shaped USD:22.50");
  f.props.barcode2d = true;
  await settle();
  assert.equal(f.state.barcode_text, "Adorable Cat Shaped Cactus Pot USD:22.50");
  f.props.variant = variant();
  await settle();
  assert.equal(f.state.barcode_text, "Adorable Cat Shaped Cactus Pot Red Floral 1L 200g 2 Matte EUR:9.00");
  assert.equal(f.state.barcode_price, "EUR:9.00");
  assert.ok(text(f.root).includes("EUR:9.00"));
  assert.ok(!f.state.barcode_text.includes("texture-id"));
  assert.deepEqual(callsLast(f.calls.format), [9, "EUR"]);
  f.props.barcode2d = false;
  await settle();
  assert.equal(f.state.barcode_text, "Adorable Cat Red Floral 1L 200g 2 Matte EUR:9.00");
  f.props.variant = variant({ pricing: false, price: 999, commission: 999, currency: "JPY" });
  await settle();
  assert.ok(f.state.barcode_text.endsWith("USD:22.50"));
  assert.equal(f.state.barcode_price, "USD:22.50");
  assert.deepEqual(callsLast(f.calls.format), [22.5, "USD"]);
  f.props.product = product({ price: 0, commission: 0 });
  await settle();
  assert.ok(f.state.barcode_text.endsWith("USD:0.00"));
});
const callsLast = (calls) => Array.from(calls.at(-1));

test("switching product, variant, mode and reopening refreshes both visible caption and encoded value", async (t) => {
  const f = await fixture(t, { barcode2d: true });
  f.props.product = product({ id: 99, title: "Replacement Product With Several Words", sku: "000000000099", price: 3, commission: 1 });
  await settle();
  assert.equal(f.state.qrcode_value, "000000000099");
  assert.equal(f.state.barcode_text, "Replacement Product With Several Words USD:4.00");
  f.props.variant = variant({ sku: "000000000072", pricing: false });
  f.props.barcode2d = false;
  await settle();
  assert.equal(f.state.qrcode_value, "000000000072");
  assert.ok(f.state.barcode_text.startsWith("Replacement Product Red"));
  f.props.variant = null;
  f.props.linkMode = true;
  await settle();
  assert.equal(f.state.qrcode_value, "https://store.example.test/product/99");
  f.props.modelValue = false;
  await settle();
  f.props.product.title = "Changed While Closed";
  f.props.product.sku = "000099";
  f.props.linkMode = false;
  f.props.modelValue = true;
  await settle();
  assert.equal(f.state.qrcode_value, "000099");
  assert.equal(f.state.barcode_text, "Changed While Closed USD:4.00");
});

test("original barcode formats and height cycle remain available through their native controls", async (t) => {
  const f = await fixture(t);
  const values = () => Array.from(f.state.available_formats, (format) => format.value);
  assert.equal(f.state.format, "CODE128");
  assert.deepEqual(values(), ["CODE128", "CODE39", "MSI", "ITF14"]);
  f.props.product = product({ sku: "001234567890" });
  await settle();
  assert.deepEqual(values(), ["CODE128", "CODE39", "MSI", "ean13"]);
  f.props.product = product({ sku: "SKU-7" });
  await settle();
  assert.deepEqual(values(), ["CODE128", "CODE39", "MSI"]);
  f.props.product = product({ sku: "10abc" });
  await settle();
  assert.ok(values().includes("pharmacode"), "retain the existing numeric-prefix eligibility rule");
  const formatControl = findAll(f.root, (node) => node.props.modelValue === f.state.format && typeof node.props["onUpdate:modelValue"] === "function")[0];
  assert.ok(formatControl);
  formatControl.props["onUpdate:modelValue"]("CODE39");
  await settle();
  assert.equal(f.nodes("u-barcode")[0].props.format, "CODE39");
  for (const height of [75, 50, 100, 75]) {
    await f.click(f.button("b_product_dashboard.barcode.change_height"));
    assert.equal(f.state.height, height);
    assert.equal(f.nodes("u-barcode")[0].props.height, height);
  }
  await f.click(findAll(f.root, (node) => node.props.id === "bar_code_container")[0]);
  assert.equal(f.state.height, 50, "the original preview-click height shortcut remains");
});

test("native print selects the exact current QR or barcode container and Close emits the controlled model", async (t) => {
  const f = await fixture(t);
  await f.click(f.button("global.actions.print"));
  assert.deepEqual(f.calls.print, ["bar_code_container"]);
  assert.equal(findAll(f.root, (node) => node.props.id === "bar_code_container").length, 1);
  f.props.barcode2d = true;
  await settle();
  f.nodes("u-qrcode")[0].props.onReady({ width: 240, height: 240 });
  await settle();
  await f.click(f.button("global.actions.print"));
  assert.deepEqual(f.calls.print, ["bar_code_container", "qr_code_container"]);
  assert.equal(findAll(f.root, (node) => node.props.id === "qr_code_container").length, 1);
  await f.click(f.button("global.actions.close"));
  assert.equal(f.calls.emitted.at(-1), false);
  f.nodes("v-dialog")[0].props["onUpdate:modelValue"](false);
  assert.equal(f.calls.emitted.at(-1), false);
});

test("empty/invalid payloads and unsupported formats remain safe and do not enable printing", async (t) => {
  const f = await fixture(t, { product: product({ sku: null }) });
  assert.doesNotThrow(() => f.state.available_formats);
  assert.equal(f.button("global.actions.print").props.disabled, true);
  f.props.product = product({ sku: "SKU☃" });
  await settle();
  assert.equal(f.state.barcode_valid, false);
  assert.equal(f.button("global.actions.print").props.disabled, true);
  f.props.product = product();
  await settle();
  f.state.format = "NO_SUCH_FORMAT";
  await settle();
  assert.equal(f.state.barcode_valid, false);
  f.state.format = "CODE128";
  await settle();
  assert.equal(f.state.barcode_valid, true);
  assert.equal(f.button("global.actions.print").props.disabled, false);
});

test("QR readiness handles pre-mount events, payload changes and native lazy-content teardown", async (t) => {
  const f = await fixture(t, { barcode2d: true });
  assert.equal(f.button("global.actions.print").props.disabled, true);
  for (const canvas of [undefined, null, {}, { width: 0, height: 20 }]) f.nodes("u-qrcode")[0].props.onReady(canvas);
  await settle();
  assert.equal(f.button("global.actions.print").props.disabled, true);
  f.nodes("u-qrcode")[0].props.onReady({ width: 240, height: 240 });
  await settle();
  assert.equal(f.button("global.actions.print").props.disabled, false);
  f.props.modelValue = false;
  await settle();
  f.props.modelValue = true;
  await settle();
  assert.equal(f.button("global.actions.print").props.disabled, false, "an unchanged mounted QR does not emit another ready event");
  f.props.variant = variant();
  await settle();
  assert.equal(f.button("global.actions.print").props.disabled, true);
  f.nodes("u-qrcode")[0].props.onReady({ width: 240, height: 240 });
  await settle();
  f.props.modelValue = false;
  await settle();
  // Native VDialog may remove its lazy content after the leave transition.
  f.dialogContent.value = false;
  await settle();
  assert.equal(f.state.qr_ready, false, 'a destroyed QR canvas cannot remain print-ready');
  f.props.modelValue = true;
  f.dialogContent.value = true;
  await settle();
  assert.equal(f.button("global.actions.print").props.disabled, true);
  f.nodes("u-qrcode")[0].props.onReady({ width: 240, height: 240 });
  await settle();
  assert.equal(f.button("global.actions.print").props.disabled, false);
});

test("native 1D renderer preserves settings, validation callbacks and catches render failures", () => {
  const file = new URL("../../../ui/barcode/UBarcode.vue", import.meta.url);
  const { descriptor } = parse(readFileSync(file, "utf8"));
  const calls = [];
  let fail = false;
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), { exports, console: { error: (error) => calls.push(error.message) }, require: (name) => name === "vue" ? Vue : { default: (target, value, settings) => { calls.push({ target, value, settings }); if (fail) throw Error("Synthetic invalid barcode"); settings.valid(true); } } });
  const component = exports.default;
  const state = { ...component.data(), $refs: { barcode: {} }, value: "001234567890", format: "CODE128", height: 75 };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  state.render();
  assert.equal(calls[0].value, "001234567890");
  assert.equal(calls[0].settings.height, 75);
  assert.equal(calls[0].settings.format, "CODE128");
  assert.ok(!Object.values(calls[0].settings).includes(undefined));
  calls[0].settings.valid(false);
  assert.equal(state.valid, false);
  fail = true;
  assert.doesNotThrow(() => state.render());
  assert.equal(state.error, "Can not render barcode format CODE128.");
  state.$refs = {};
  assert.doesNotThrow(() => state.render());
});
