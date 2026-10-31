import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const repository = new URL("../../../../../../", import.meta.url);
const filename = fileURLToPath(new URL("./BProductProfileTax.vue", import.meta.url));
const source = readFileSync(filename, "utf8");
const { descriptor, errors } = parse(source, { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "product-tax-profile-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "product-tax-profile-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const transpile = code => ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function dictionary(locale) {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(`@selldone/translate/dashboard/${locale}.ts`, repository), "utf8")), { exports });
  return exports.default;
}
const english = dictionary("en");
const translate = (key, values = {}) => {
  const value = key.split(".").reduce((entry, part) => entry?.[part], english);
  return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match) : key;
};
const plain = value => JSON.parse(JSON.stringify(value));
const node = (type, text = "") => ({ type, text, props: {}, style: {}, children: [], parent: null });
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
const taxProfile = (extra = {}) => ({ id: 1, name: "Appliances", enable: true, fix: true,
  fix_vat: 20, shipping: true, fix_shipping: 5, included: false, icon: "devices", ...extra });
const shop = (extra = {}) => ({ id: 7, tax: taxProfile({ id: undefined, name: "Shop default", fix_vat: 10, shipping: false }),
  tax_profiles: [taxProfile(), taxProfile({ id: 2, name: "Books", included: true, fix_vat: 8 })], ...extra });
const product = (extra = {}) => ({ id: 31, type: "PHYSICAL", tax_id: 1, ...extra });

function leaf(name, props = {}) {
  return Vue.defineComponent({ name, inheritAttrs: false, props,
    setup(values, { attrs, slots, emit }) {
      Vue.inject("calls").records.push({ name, props: values, attrs, emit });
      return () => name === "VDialog" && !values.modelValue ? Vue.createCommentVNode("closed")
        : Vue.h(name, { ...attrs, ...values, fixtureEmit: emit }, [slots.prepend?.(), slots.activator?.({ props: {} }),
          slots["append-actions"]?.(), slots.append?.(), slots.default?.()]);
    },
  });
}

async function fixture(t, options = {}) {
  const calls = { records: [], http: [], warnings: [], errors: [] };
  const forbiddenHttp = (...args) => { calls.http.push(args); throw new Error("HTTP is forbidden in this isolated fixture"); };
  const context = vm.createContext({ exports: {}, fetch: forbiddenHttp, axios: new Proxy({}, { get: () => forbiddenHttp }),
    window: {},
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("ProductType")) return { ProductType: { PHYSICAL: { code: "PHYSICAL" }, SUBSCRIPTION: { code: "SUBSCRIPTION" } } };
      if (name.endsWith("BTaxProfileInput.vue")) return { default: leaf("BTaxProfileInput", {
        modelValue: [Number, String], shop: Object, modern: Boolean,
      }) };
      if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
      return {};
    },
  });
  vm.runInContext(`(() => { ${transpile(descriptor.script.content)} })()`, context);
  const component = context.exports.default;
  context.exports = {};
  vm.runInContext(`(() => { ${transpile(template.code)} })()`, context);
  component.render = context.exports.render;
  const props = Vue.reactive({ product: product(), shop: shop(), modern: true, ...options });
  const display = Vue.reactive({ xs: false });
  let state;
  const mountedComponent = { ...component,
    render(...args) { state = this; return component.render.apply(this, args); },
  };
  const app = renderer.createApp({ render: () => Vue.h(mountedComponent, { ...props }) });
  app.provide("calls", calls);
  for (const name of ["VListItem", "VListItemTitle", "VListItemSubtitle", "VListItemAction", "VBtn", "VIcon", "VCard", "VCardTitle", "VCardText", "VCardActions", "VAvatar", "VListSubheader", "UWidgetHeader", "VChip", "VExpandTransition", "VDivider", "VLocaleProvider"]) app.component(name, leaf(name));
  app.component("VTooltip", leaf("VTooltip", { modelValue: Boolean }));
  app.component("VDialog", leaf("VDialog", { modelValue: Boolean, fullscreen: Boolean, maxWidth: [Number, String] }));
  Object.assign(app.config.globalProperties, {
    $route: { params: { shop_id: "7", product_id: "31" }, matched: [] },
    $vuetify: { display, locale: { isRtl: false } }, $i18n: { locale: "en" },
    $t: translate, getShopImagePath: () => "/synthetic-product.png",
  });
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  const root = node("root"); app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); assert.deepEqual(calls.http, []); });
  return { state, props, display, calls, root, component,
    find: type => allNodes(root).find(item => item.type === type),
    record: name => calls.records.filter(item => item.name === name).at(-1),
    async open() { state.showSetTax(); await settle(); },
    async choose(value) { calls.records.filter(item => item.name === "BTaxProfileInput").at(-1).emit("update:modelValue", value); await settle(); },
    rendered: () => text(root),
  };
}

test("the tax picker template and scoped styles compile", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename, id: "product-tax-profile-test", scoped: style.scoped, preprocessLang: style.lang,
  })).errors, []);
});

test("opening the native selector and changing selection leaves the product draft unchanged until Confirm", async t => {
  const f = await fixture(t);
  const before = plain(f.props.product);
  await f.open();
  assert.equal(f.state.tax_input, 1);
  assert.equal(f.find("BTaxProfileInput").props.shop, f.props.shop);
  assert.equal(f.find("BTaxProfileInput").props.modern, true);
  await f.choose(2);
  assert.equal(f.state.dialog_tax_rule.name, "Books");
  assert.deepEqual(plain(f.props.product), before);
  f.state.selectTax(f.state.tax_input); await settle();
  assert.equal(f.props.product.tax_id, 2);
  assert.equal(f.state.applied_tax_rule.name, "Books");
  assert.equal(f.state.tax_dialog, false);
  assert.deepEqual(plain(f.props.product), { ...before, tax_id: 2 });
});

test("Cancel and native Escape/backdrop dismissal discard the pending selection", async t => {
  for (const dismiss of ["cancel", "native"]) {
    const f = await fixture(t);
    await f.open(); await f.choose(2);
    if (dismiss === "cancel") f.state.closeTaxDialog();
    else f.record("VDialog").emit("update:modelValue", false);
    await settle();
    assert.equal(f.state.tax_dialog, false);
    assert.equal(f.props.product.tax_id, 1);
    await f.open();
    assert.equal(f.state.tax_input, 1);
  }
});

test("Escape dismisses active nested help before the native dialog dismissal receives it", async t => {
  const f = await fixture(t);
  await f.open(); await f.choose(2);
  const help = (copy) => allNodes(dialog).find(item => item.type === "VTooltip" && text(item) === copy);
  const keyEvent = key => ({ key, prevented: false, stopped: false,
    preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } });
  const dialog = f.find("VDialog");
  for (const [key, copy] of [
    ["close", "global.actions.close"],
    ["default", english.product_tax_profile.refined.default_help],
    ["price", english.product_tax_profile.refined.price_help],
    ["calculation", english.product_tax_profile.refined.internal_help],
    ["checkout", english.product_tax_profile.refined.checkout_included_help],
  ]) {
    help(copy).props.fixtureEmit("update:modelValue", true); await settle();
    assert.equal(f.state.tax_help, key);
    assert.equal(help(copy).props.modelValue, true);
    const enter = keyEvent("Enter");
    dialog.props.onKeydownCapture(enter);
    assert.equal(enter.stopped, false);
    assert.equal(f.state.tax_help, key);
    const escape = keyEvent("Escape");
    dialog.props.onKeydownCapture(escape); await settle();
    assert.equal(escape.prevented, true, key);
    assert.equal(escape.stopped, true, key);
    assert.equal(f.state.tax_help, null, key);
    assert.equal(f.state.tax_dialog, true, key);
    assert.equal(f.props.product.tax_id, 1, key);
  }
  const withoutHelp = keyEvent("Escape");
  dialog.props.onKeydownCapture(withoutHelp);
  assert.equal(withoutHelp.prevented, false);
  assert.equal(withoutHelp.stopped, false);
  f.record("VDialog").emit("update:modelValue", false); await settle();
  assert.equal(f.state.tax_dialog, false);
  assert.equal(f.props.product.tax_id, 1);
});

test("clearing the dedicated profile previews and confirms the shop default instead of disabling tax", async t => {
  const f = await fixture(t);
  await f.open(); await f.choose(null);
  assert.equal(f.state.dialog_tax_rule, f.props.shop.tax);
  assert.equal(f.state.dialog_tax_disabled, false);
  assert.equal(f.props.product.tax_id, 1);
  f.state.selectTax(f.state.tax_input); await settle();
  assert.equal(f.props.product.tax_id, null);
  assert.equal(f.state.applied_tax_rule, f.props.shop.tax);
});

test("internal fixed rates and price inclusion preserve goods and shipping facts", async t => {
  for (const included of [true, false]) {
    const rule = taxProfile({ included });
    const f = await fixture(t, { shop: shop({ tax_profiles: [rule] }) });
    await f.open();
    assert.equal(f.state.dialog_tax_included, included);
    assert.equal(f.state.dialog_tax_rule.fix_vat, 20);
    assert.equal(f.state.dialog_tax_rule.fix_shipping, 5);
    assert.match(f.rendered(), /20\s*%/);
    assert.match(f.rendered(), /5\s*%/);
    const facts = allNodes(f.root).filter(item => item.type === "dd").slice(0, 3).map(text);
    assert.deepEqual(facts, ["20%", "5%", included ? "Tax included" : "Tax excluded"]);
  }
});

test("fixed-rate facts and rule details retain configured fractional percentages and zero shipping tax", async t => {
  const f = await fixture(t, { shop: shop({ tax_profiles: [taxProfile({ fix_vat: 7.125, fix_shipping: 9.975 })] }) });
  await f.open();
  const facts = () => allNodes(f.root).filter(item => item.type === "dd").slice(0, 2).map(text);
  const rules = () => allNodes(f.root).find(item => item.type === "dl" && item.props.class?.includes("b-product-profile-tax__rules"));
  assert.deepEqual(facts(), ["7.125%", "9.975%"]);
  assert.match(text(rules()), /fixed goods tax of 7\.125%/);
  assert.match(text(rules()), /fixed shipping tax of 9\.975%/);
  f.props.shop.tax_profiles[0].fix_shipping = 0; await settle();
  assert.deepEqual(facts(), ["7.125%", "0%"]);
  assert.match(text(rules()), /fixed shipping tax of 0%/);
  assert.doesNotMatch(text(rules()), /Shipping is not taxable/);
});

test("location rules and provider rules do not promise fixed tax rates", async t => {
  for (const rule of [taxProfile({ fix: false }),
    taxProfile({ meta: { external_tax: { enabled: true, provider: "stripe_tax" } } }),
    taxProfile({ meta: { external_tax: { enabled: true, provider: "other_provider" } } })]) {
    const f = await fixture(t, { shop: shop({ tax_profiles: [rule] }) });
    await f.open();
    assert.equal(f.state.dialog_tax_rule, f.props.shop.tax_profiles[0]);
    assert.doesNotMatch(f.rendered(), /20\s*%/);
    assert.doesNotMatch(f.rendered(), /5\s*%/);
    assert.match(f.rendered(), rule.meta ? /Stripe|External service/ : /location/i);
    const facts = allNodes(f.root).filter(item => item.type === "dd").slice(0, 2).map(text);
    assert.deepEqual(facts, rule.meta ? ["At checkout", "At checkout"] : ["By location", "By location"]);
  }
});

test("disabled rules do not show active calculation or shipping rates", async t => {
  const f = await fixture(t, { shop: shop({ tax_profiles: [taxProfile({ enable: false })] }) });
  await f.open();
  assert.equal(f.state.dialog_tax_disabled, true);
  assert.match(f.rendered(), /disabled|not calculated/i);
  assert.doesNotMatch(f.rendered(), /20\s*%/);
  assert.doesNotMatch(f.rendered(), /5\s*%/);
  assert.deepEqual(allNodes(f.root).filter(item => item.type === "dd").slice(0, 3).map(text), ["Not applied", "Not applied", "No tax"]);
});

test("shipping-off rules explicitly retain non-taxable shipping", async t => {
  const f = await fixture(t, { shop: shop({ tax_profiles: [taxProfile({ shipping: false })] }) });
  await f.open();
  assert.match(f.rendered(), /shipping.*(?:not taxable|not taxed)|not.*shipping/i);
  assert.doesNotMatch(f.rendered(), /5\s*%/);
});

test("no default rule or profile list stays readable without a fabricated rate", async t => {
  const f = await fixture(t, { product: product({ tax_id: null }), shop: { id: 7 } });
  await f.open();
  assert.ok(f.state.dialog_tax_rule == null);
  assert.equal(f.state.dialog_tax_disabled, true);
  assert.doesNotMatch(f.rendered(), /\d\s*%/);
  assert.match(f.rendered(), /Unavailable/);
  assert.doesNotMatch(f.rendered(), /Tax is disabled by this profile/);
  f.state.selectTax(null); await settle();
  assert.equal(f.props.product.tax_id, null);
});

test("a missing selected profile cannot silently confirm the shop default", async t => {
  const f = await fixture(t);
  await f.open(); await f.choose(999);
  assert.match(f.rendered(), /no longer available/);
  assert.ok(f.state.missingTaxProfile);
  assert.equal(f.state.dialog_tax_rule, null);
  const confirm = allNodes(f.root).find(item => item.type === "VBtn" && text(item) === "Confirm selection");
  assert.equal(confirm.props.disabled, true);
  f.state.selectTax(f.state.tax_input); await settle();
  assert.equal(f.state.tax_dialog, true);
  assert.equal(f.props.product.tax_id, 1);
  await f.choose(null);
  f.state.selectTax(f.state.tax_input); await settle();
  assert.equal(f.props.product.tax_id, null);
});

test("Manage tax keeps the current shop new-tab route and the native mobile dialog breakpoint", async t => {
  const f = await fixture(t);
  await f.open();
  const manage = allNodes(f.root).find(item => item.type === "VBtn" && item.props.to?.name === "BPageShopFinanceTax");
  assert.equal(manage.props.to.params.shop_id, 7);
  assert.equal(manage.props.target, "_blank");
  assert.equal(manage.props.rel, "noopener noreferrer");
  assert.equal(f.find("VDialog").props.fullscreen, false);
  f.display.xs = true; await settle();
  assert.equal(f.find("VDialog").props.fullscreen, true);
});

test("product or shop context changes close the old selection without copying its pending id", async t => {
  for (const boundary of ["product", "product-id", "shop", "shop-id"]) {
    const f = await fixture(t);
    await f.open(); await f.choose(2);
    f.state.setTaxHelp("default", true); await settle();
    if (boundary === "product") f.props.product = product({ id: 32 });
    if (boundary === "product-id") f.props.product.id = 32;
    if (boundary === "shop") f.props.shop = shop({ id: 8 });
    if (boundary === "shop-id") f.props.shop.id = 8;
    await settle();
    assert.equal(f.state.tax_dialog, false, boundary);
    assert.equal(f.state.tax_help, null, boundary);
    assert.equal(f.props.product.tax_id, 1, boundary);
    await f.open();
    assert.equal(f.state.tax_input, 1, boundary);
  }
});

test("General Discard or refreshed profiles update the applied row summary", async t => {
  const f = await fixture(t);
  f.props.product.tax_id = 2; await settle();
  assert.equal(f.state.applied_tax_rule.name, "Books");
  f.props.product.tax_id = 1; await settle();
  assert.equal(f.state.applied_tax_rule.name, "Appliances");
  f.props.shop.tax_profiles = [taxProfile({ name: "Updated appliances" })]; await settle();
  assert.equal(f.state.applied_tax_rule.name, "Updated appliances");
});

test("legacy callers retain their fullscreen selector and native inclusion preview", async t => {
  const f = await fixture(t, { modern: false });
  assert.equal(f.component.props.modern.default, false);
  await f.open();
  assert.equal(f.find("VDialog").props.fullscreen, true);
  assert.ok(f.find("BTaxProfileIncludePod"));
  await f.choose(2);
  f.state.selectTax(f.state.tax_input); await settle();
  assert.equal(f.props.product.tax_id, 2);
});

test("subscription products retain the provider pricing-plan warning", async t => {
  const f = await fixture(t, { product: product({ type: "SUBSCRIPTION" }) });
  await f.open();
  assert.equal(f.state.isSubscription, true);
  const content = allNodes(f.root).map(item => item.props.innerHTML || item.text).join(" ");
  assert.match(content, /pricing plans|Inventory/);
});

test("Refined tax copy exists in English and Persian with matching interpolation", () => {
  const persian = dictionary("fa");
  const entries = english.product_tax_profile.refined;
  assert.ok(entries);
  for (const key of Object.keys(entries)) {
    const values = [entries[key], persian.product_tax_profile.refined[key]];
    for (const value of values) assert.equal(typeof value, "string", key);
    assert.deepEqual([...values[0].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
      [...values[1].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), key);
  }
});
