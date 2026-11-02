import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const repository = new URL("../../../../../../", import.meta.url);
const filename = fileURLToPath(new URL("./BProductProfileMap.vue", import.meta.url));
const source = readFileSync(filename, "utf8");
const { descriptor, errors } = parse(source, { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "product-map-profile-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "product-map-profile-test", compilerOptions: { bindingMetadata: script.bindings },
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
const dateMixin = loadModule("@selldone/components-vue/mixin/date/DateMixin.ts", {
  require: () => ({ DateConverter: { GetLocalTimeString: value => value, getFromNowString: value => value } }),
}).default;
const mapHelper = loadModule("@selldone/core-js/helper/map/MapHelper.ts", {
  window: { $i18n_global: { t: translate } },
}).MapHelper;
const map = (extra = {}) => ({ id: 11, title: "City collection point", address: "25 Market Street",
  no: "8", unit: "3", city: "Dubai", state: "Dubai", country: "AE", range: 25,
  location: { lng: 55.3, lat: 25.2 }, message: "Use the north entrance", user_id: 2,
  created_at: "2026-10-01T10:00:00Z", updated_at: "2026-10-02T12:00:00Z", ...extra });
const product = (extra = {}) => ({ id: 31, map_id: 11, map: map(), tax_id: 5, warranty_id: 6,
  return_policy_id: 7, guide_id: 8, shipping_id: 9, title: "Synthetic product", ...extra });
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
  const calls = { records: [], http: [], maps: [], warnings: [], errors: [] };
  const forbiddenHttp = (...args) => { calls.http.push(args); throw new Error("HTTP is forbidden in this isolated fixture"); };
  const context = vm.createContext({ exports: {}, fetch: forbiddenHttp,
    axios: new Proxy({}, { get: () => forbiddenHttp }), window: {},
    require(name) {
      if (name === "vue") return Vue;
      if (name.endsWith("DateMixin.ts")) return { default: dateMixin };
      if (name.includes("MapHelper")) return { MapHelper: {
        GenerateFullAddressFromMapInfo: mapHelper.GenerateFullAddressFromMapInfo,
        GetMapImage(...args) { calls.maps.push(args); return "/synthetic-map.png"; },
      } };
      if (name.endsWith("BMapTagInput.vue")) return { default: leaf("BMapTagInput", {
        modelValue: Object, shop: Object, returnObject: Boolean,
      }) };
      if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  vm.runInContext(`(() => { ${transpile(descriptor.script.content)} })()`, context);
  const component = context.exports.default;
  context.exports = {};
  vm.runInContext(`(() => { ${transpile(template.code)} })()`, context);
  component.render = context.exports.render;
  const props = Vue.reactive({ product: product(), shop: { id: 7 }, modern: true, ...options });
  const display = Vue.reactive({ xs: false });
  let state;
  const mountedComponent = { ...component,
    render(...args) { state = this; return component.render.apply(this, args); },
  };
  const app = renderer.createApp({ render: () => Vue.h(mountedComponent, { ...props }) });
  app.provide("calls", calls);
  for (const name of ["VListItem", "VListItemTitle", "VListItemSubtitle", "VListItemAction", "VBtn", "VIcon", "VCard", "VCardTitle", "VCardText", "VCardActions", "VAvatar", "VListSubheader", "UWidgetHeader", "VExpandTransition", "VLocaleProvider", "VRow", "VCol", "VImg", "VSpacer", "VDivider", "Flag"]) app.component(name, leaf(name));
  app.component("VTooltip", leaf("VTooltip", { modelValue: Boolean }));
  app.component("VDialog", leaf("VDialog", { modelValue: Boolean, fullscreen: Boolean, maxWidth: [Number, String] }));
  Object.assign(app.config.globalProperties, {
    $route: { params: { shop_id: "7", product_id: "31" }, matched: [] },
    $vuetify: { display, locale: { isRtl: false } }, $t: translate,
    getUserAvatar: () => "/synthetic-avatar.png",
  });
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  const root = node("root"); app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); assert.deepEqual(calls.http, []); });
  return { state, props, display, calls, root, component,
    find: type => allNodes(root).find(item => item.type === type),
    record: name => calls.records.filter(item => item.name === name).at(-1),
    rendered: () => text(root),
    async open() { state.showSetMapTag(); await settle(); },
    async choose(value) { calls.records.filter(item => item.name === "BMapTagInput").at(-1).emit("update:modelValue", value); await settle(); },
    async confirm() {
      const confirm = allNodes(root).find(item => item.type === "VBtn" && item.props.color === "primary" && item.props.variant === "elevated");
      assert.ok(confirm);
      confirm.props.onClick(); await settle();
    },
  };
}

test("the location picker template and scoped styles compile", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename, id: "product-map-profile-test", scoped: style.scoped, preprocessLang: style.lang,
  })).errors, []);
});

test("opening the native location selector copies the applied assignment to its draft", async t => {
  const f = await fixture(t), before = plain(f.props.product);
  await f.open();
  assert.deepEqual(plain(f.state.map_input), before.map);
  assert.equal(f.find("BMapTagInput").props.shop, f.props.shop);
  assert.equal(f.find("BMapTagInput").props.returnObject, true);
  const next = map({ id: 12, title: "Warehouse collection point", range: 0 });
  await f.choose(next);
  assert.equal(f.state.map_input.id, 12);
  assert.deepEqual(plain(f.props.product), before);
  await f.confirm();
  assert.deepEqual(plain(f.props.product), { ...before, map_id: 12, map: next });
  assert.equal(f.state.map_dialog, false);
});

test("clearing a location changes only the pending selection until Confirm", async t => {
  const f = await fixture(t), before = plain(f.props.product);
  await f.open(); await f.choose(null);
  assert.equal(f.state.map_input, null);
  assert.deepEqual(plain(f.props.product), before);
  await f.confirm();
  assert.deepEqual(plain(f.props.product), { ...before, map_id: null, map: null });
  assert.equal(f.state.map_dialog, false);
  await f.open();
  assert.equal(f.state.map_input, null);
});

test("Cancel and native Escape/backdrop dismissal leave assignments untouched on reopen", async t => {
  for (const dismissal of ["cancel", "native"]) {
    const f = await fixture(t), before = plain(f.props.product);
    await f.open(); await f.choose(map({ id: 12 }));
    if (dismissal === "cancel") {
      const cancel = allNodes(f.root).find(item => item.type === "VBtn" && text(item) === translate("global.actions.cancel"));
      assert.ok(cancel);
      cancel.props.onClick();
    } else f.record("VDialog").emit("update:modelValue", false);
    await settle();
    assert.equal(f.state.map_dialog, false);
    assert.deepEqual(plain(f.props.product), before);
    await f.open();
    assert.deepEqual(plain(f.state.map_input), before.map);
  }
});

test("the selected location keeps address, coverage, message, editor and timestamp metadata", async t => {
  const f = await fixture(t);
  await f.open();
  assert.match(f.state.full_address, /25 Market Street/);
  assert.match(f.state.full_address, /8/);
  assert.match(f.state.full_address, /3/);
  assert.match(f.state.full_address, /Dubai/);
  assert.match(f.rendered(), /Use the north entrance/);
  assert.match(f.rendered(), /2026-10-01T10:00:00Z/);
  assert.match(f.rendered(), /2026-10-02T12:00:00Z/);
  assert.equal(f.state.map_input.range, 25);
  assert.equal(f.state.map_input.user_id, 2);
  assert.deepEqual(f.calls.maps.at(-1), [55.3, 25.2, 15]);
  await f.confirm();
  assert.deepEqual(plain(f.props.product.map), map());
});

test("unassigned products open with an empty selector and can confirm a location", async t => {
  for (const modern of [true, false]) {
    const f = await fixture(t, { modern, product: product({ map_id: null, map: null }) });
    await f.open();
    assert.equal(f.state.map_input, null);
    await f.choose(map({ id: "12", range: 0 })); await f.confirm();
    assert.equal(f.props.product.map_id, "12");
    assert.equal(f.props.product.map.range, 0);
    assert.equal(f.props.product.id, 31);
  }
});

test("modern desktop and mobile use the native responsive dialog, while legacy stays fullscreen", async t => {
  const f = await fixture(t);
  assert.equal(f.component.props.modern.default, false);
  await f.open();
  assert.equal(f.find("VDialog").props.fullscreen, false);
  f.display.xs = true; await settle();
  assert.equal(f.find("VDialog").props.fullscreen, true);
  const legacy = await fixture(t, { modern: false });
  await legacy.open();
  assert.equal(legacy.find("VDialog").props.fullscreen, true);
  assert.ok(legacy.find("UWidgetHeader"));
  await legacy.choose(map({ id: 12 })); await legacy.confirm();
  assert.equal(legacy.props.product.map_id, 12);
  assert.equal(legacy.props.product.map.title, "City collection point");
});

test("General create/update payloads retain location ids without sending loaded map metadata", () => {
  const file = new URL("@selldone/components-vue/backoffice/product/add/full/BProductAddFull.vue", repository);
  const editor = parse(readFileSync(file, "utf8"), { filename: fileURLToPath(file) }).descriptor;
  for (const vendor of [false, true]) for (const method of ["addProduct", "editProduct"]) {
    const writes = [], exports = {};
    const endpoints = new Proxy({}, { get: (_, key) => (...args) => `/${String(key)}/${args.join("/")}` });
    const capture = (url, payload) => { writes.push({ url, payload }); return new Promise(() => {}); };
    vm.runInNewContext(transpile(editor.script.content), { exports, require: () => ({}),
      axios: { post: capture, put: capture }, window: { API: endpoints, VAPI: endpoints },
    });
    const value = { ...product(), type: "PHYSICAL", pricing: "FIX", currency: "USD" };
    exports.default.methods[method].call({ $product: value, step: 2, stepEditors: {},
      IS_VENDOR_PANEL: vendor, vendor: { id: 8 }, shop: { id: 7 }, $shop: { currencies: ["USD"] }, $t: key => key,
    });
    assert.equal(writes.length, 1);
    assert.equal(writes[0].payload.map_id, 11);
    assert.equal(Object.hasOwn(writes[0].payload, "map"), false);
    assert.doesNotMatch(JSON.stringify(writes[0].payload), /Use the north entrance|City collection point/);
    const expected = method === "addProduct" ? (vendor ? "/POST_MY_VENDOR_ADD_PRODUCT/8" : "/POST_ADD_PRODUCT/7")
      : (vendor ? "/PUT_MY_VENDOR_EDIT_PRODUCT/8/31" : "/PUT_EDIT_PRODUCT/7/31");
    assert.equal(writes[0].url, expected);
  }
});

test("Refined location copy exists in English and Persian with matching interpolation", () => {
  const persian = loadModule("@selldone/translate/dashboard/fa.ts").default;
  const entries = english.product_location_profile.refined;
  assert.ok(entries);
  for (const key of Object.keys(entries)) {
    const values = [entries[key], persian.product_location_profile.refined[key]];
    for (const value of values) assert.equal(typeof value, "string", key);
    assert.deepEqual([...values[0].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
      [...values[1].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), key);
  }
});
