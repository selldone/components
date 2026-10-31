import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const repository = new URL("../../../../../../", import.meta.url);
const filename = fileURLToPath(new URL("./BProductProfileLogistic.vue", import.meta.url));
const source = readFileSync(filename, "utf8");
const { descriptor, errors } = parse(source, { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "product-logistic-profile-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "product-logistic-profile-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const transpile = code => ts.transpileModule(code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function loadEnum(path) {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(path, repository), "utf8")), { exports });
  return exports;
}
const { LogisticProfileType } = loadEnum("@selldone/core-js/enums/logistic/LogisticProfileType.ts");
const ProductSection = loadEnum("@selldone/core-js/enums/product/ProductSection.ts");
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
const text = current => allNodes(current).map(item => item.text).join(" ").trim();
const assignedMarker = row => allNodes(row).find(item => item.props.role === "img" && item.props["aria-label"] === "product_logistic_profile.refined.assigned");
const relationFields = { WARRANTY: "warranty_profile", RETURN_POLICY: "return_policy_profile", GUIDE: "guide_profile", SHIPPING: "shipping_profile" };
const product = (extra = {}) => ({ id: 31, warranty_id: 12, return_policy_id: 13, guide_id: 14, shipping_id: 15, ...extra });
function assignedProduct() {
  const value = product();
  for (const type of Object.values(LogisticProfileType)) value[relationFields[type.value]] = {
    id: value[type.product_column], type: type.value, name: `${type.value} policy`, info: { languages: ["en", "fa"] },
  };
  return value;
}
const result = (id = 12, extra = {}) => ({ profile: { id, name: `Profile ${id}`, type: "WARRANTY", ...extra },
  articles: [{ id: id * 10, lang: "en", title: "Terms", body: "<p>Shared content</p>" }] });

function leaf(name, props = {}) {
  return Vue.defineComponent({ name, inheritAttrs: false, props,
    setup(values, { attrs, slots, emit }) {
      Vue.inject("calls").records.push({ name, props: values, attrs, emit });
      return () => name === "VDialog" && !values.modelValue ? Vue.createCommentVNode("closed")
        : Vue.h(name, { ...attrs, ...values }, [slots.prepend?.(), slots.activator?.({ props: {} }),
          slots["append-actions"]?.(), slots.append?.(), slots.default?.()]);
    },
  });
}

async function fixture(t, options = {}) {
  const calls = { records: [], reads: [], writes: [], notices: [], warnings: [], errors: [] };
  const sdk = {
    cancellation() { return this; }, optimize() { return this; },
    get(...args) {
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      const request = { args, resolve, reject, cached: null };
      calls.reads.push(request);
      return { cache(callback) { request.cached = callback; return promise; } };
    },
  };
  const context = vm.createContext({ exports: {},
    window: { $backoffice: { logistic: { profile: sdk } } },
    axios: {
      post: (...args) => { calls.writes.push(["post", ...args]); return Promise.resolve({ data: {} }); },
      delete: (...args) => { calls.writes.push(["delete", ...args]); return Promise.resolve({ data: {} }); },
    },
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("LogisticProfileType")) return { LogisticProfileType };
      if (name.includes("ProductSection")) return ProductSection;
      if (name.includes("NotificationService")) return { default: {
        showSuccessAlert: (...args) => calls.notices.push(["success", ...args]),
        showErrorAlert: (...args) => calls.notices.push(["error", ...args]),
        showLaravelError: (...args) => calls.notices.push(["laravel", ...args]),
      } };
      if (name.endsWith("BLogisticProfileInput.vue")) return { default: leaf("BLogisticProfileInput", {
        modelValue: [Number, String], shop: Object, type: Object, modern: Boolean, loading: Boolean, disabled: Boolean,
      }) };
      if (name.endsWith("BLogisticProfileEditor.vue")) return { default: leaf("BLogisticProfileEditor", {
        articles: Array, profile: Object, shop: Object, editable: Boolean, modern: Boolean,
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
  const props = Vue.reactive({ product: product(), shop: { id: 7 }, modern: true, ...options.props });
  const route = Vue.reactive({ params: { shop_id: "7", product_id: "31" }, matched: [], ...options.route });
  let state;
  const mountedComponent = { ...component,
    render(...args) { state = this; return component.render.apply(this, args); },
  };
  const app = renderer.createApp({ render: () => Vue.h(mountedComponent, { ...props }) });
  app.provide("calls", calls);
  for (const name of ["VListItem", "VListItemTitle", "VListItemSubtitle", "VListItemAction", "VBtn", "VIcon", "VTooltip", "VCard", "VCardTitle", "VCardText", "VCardActions", "VLocaleProvider", "VListSubheader", "UWidgetHeader", "ULoadingProgress", "VProgressCircular", "VSkeletonLoader", "VDivider"]) app.component(name, leaf(name));
  app.component("VDialog", leaf("VDialog", { modelValue: Boolean, persistent: Boolean, fullscreen: Boolean }));
  Object.assign(app.config.globalProperties, { $route: route,
    $vuetify: { display: { xs: false }, locale: { isRtl: false } },
    $t: (key, values) => values?.type ? `${key}:${values.type}` : values?.id ? `${key}:${values.id}` : key,
  });
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  const root = node("root"); app.mount(root); await settle();
  let mounted = true;
  const unmount = () => { if (mounted) app.unmount(); mounted = false; };
  t.after(() => { unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); assert.deepEqual(calls.writes, []); });
  return { state, props, route, calls, root, component, unmount,
    record: name => calls.records.filter(item => item.name === name).at(-1),
    find: type => allNodes(root).find(item => item.type === type),
    async open(type = LogisticProfileType.WARRANTY, id = props.product[type.product_column]) {
      state.showSetProfile(type, id); await settle();
    },
    async loaded(data = result()) { calls.reads.at(-1).resolve(data); await settle(); },
  };
}

test("the profile picker and scoped styles compile", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename, id: "product-logistic-profile-test", scoped: style.scoped, preprocessLang: style.lang,
  })).errors, []);
});

test("each native profile row opens the matching typed selector and existing profile read", async t => {
  for (const type of Object.values(LogisticProfileType)) {
    const f = await fixture(t);
    assert.equal(f.component.props.modern.default, false);
    assert.equal(allNodes(f.root).filter(item => item.type === "VListItem").length, 4);
    await f.open(type);
    assert.equal(f.state.selected_profile_type.value, type.value);
    assert.equal(f.state.profile_input, f.props.product[type.product_column]);
    assert.deepEqual(f.calls.reads[0].args, [7, f.props.product[type.product_column]]);
    const input = f.find("BLogisticProfileInput");
    assert.equal(input.props.shop, f.props.shop);
    assert.equal(input.props.type.value, type.value);
    assert.equal(input.props.modern, true);
    await f.loaded(result(f.state.profile_input, { type: type.value }));
    const editor = f.find("BLogisticProfileEditor");
    assert.equal(editor.props.modern, true);
    assert.equal(editor.props.editable, true);
    assert.equal(editor.props.profile.id, f.state.profile_input);
    assert.equal(editor.props.articles[0].body, "<p>Shared content</p>");
  }
});

test("all four assigned rows show their product relation names and a green assignment marker", async t => {
  const f = await fixture(t, { props: { product: assignedProduct() } });
  const rows = allNodes(f.root).filter(item => item.type === "VListItem");
  for (const [index, type] of Object.values(LogisticProfileType).entries()) {
    const subtitle = allNodes(rows[index]).find(item => item.type === "VListItemSubtitle");
    assert.equal(text(subtitle), `${type.value} policy`);
    const marker = assignedMarker(rows[index]);
    assert.ok(marker, type.value);
    assert.ok(allNodes(marker).some(item => item.type === "BProductEditInfoIcon" && item.props.name === "CircleCheck"));
    assert.ok(allNodes(rows[index]).some(item => item.type === "VBtn" && text(item).includes("global.actions.change")), type.value);
  }
  assert.equal(f.calls.reads.length, 0, "Assigned summaries do not require opening each dialog");
});

test("stale or missing summary names use an assigned label without exposing an id", async t => {
  const value = assignedProduct();
  value.warranty_profile.id = 999;
  value.return_policy_profile.type = "SHIPPING";
  value.guide_profile = null;
  value.shipping_profile.name = "";
  const f = await fixture(t, { props: { product: value } });
  const rows = () => allNodes(f.root).filter(item => item.type === "VListItem");
  for (const row of rows()) {
    assert.equal(text(allNodes(row).find(item => item.type === "VListItemSubtitle")), "product_logistic_profile.refined.assigned");
    assert.ok(assignedMarker(row));
  }
  for (const type of Object.values(LogisticProfileType)) f.props.product[type.product_column] = null;
  await settle();
  for (const row of rows()) {
    assert.equal(text(allNodes(row).find(item => item.type === "VListItemSubtitle")), "add_product.edit_info.modern.not_assigned");
    assert.equal(assignedMarker(row), undefined);
    assert.ok(allNodes(row).some(item => item.type === "VBtn" && text(item).includes("add_product.edit_info.modern.assign")));
  }
});

test("Confirm retains bounded matching summary metadata across later opens, and clear removes it", async t => {
  for (const [index, type] of Object.values(LogisticProfileType).entries()) {
    const f = await fixture(t, { props: { product: assignedProduct() } });
    const before = plain(f.props.product);
    await f.open(type);
    f.state.setProfileInput(99); await settle();
    const info = { languages: ["en"] };
    await f.loaded(result(99, { type: type.value, name: "New shared policy", info, shop_id: 7, body: "Not summary metadata" }));
    f.state.selectProfile(99); await settle();
    assert.equal(f.props.product[type.product_column], 99);
    assert.deepEqual(plain(f.props.product[relationFields[type.value]]), { id: 99, type: type.value, name: "New shared policy", info });
    const subtitle = () => allNodes(allNodes(f.root).filter(item => item.type === "VListItem")[index]).find(item => item.type === "VListItemSubtitle");
    assert.equal(text(subtitle()), "New shared policy");
    await f.open(Object.values(LogisticProfileType)[(index + 1) % 4]);
    assert.equal(text(subtitle()), "New shared policy");
    f.state.closeProfileDialog(); await settle();
    await f.open(type);
    assert.equal(text(subtitle()), "New shared policy");
    f.record("BLogisticProfileInput").emit("update:modelValue", null); await settle();
    f.state.selectProfile(null); await settle();
    assert.equal(f.props.product[type.product_column], null);
    assert.equal(f.props.product[relationFields[type.value]], null);
    assert.equal(text(subtitle()), "add_product.edit_info.modern.not_assigned");
    for (const other of Object.values(LogisticProfileType).filter(item => item !== type)) {
      assert.equal(f.props.product[other.product_column], before[other.product_column]);
      assert.deepEqual(plain(f.props.product[relationFields[other.value]]), before[relationFields[other.value]]);
    }
  }
});

test("General create/update payloads retain assignment ids without sending loaded profile summaries", () => {
  const file = new URL("@selldone/components-vue/backoffice/product/add/full/BProductAddFull.vue", repository);
  const editor = parse(readFileSync(file, "utf8"), { filename: fileURLToPath(file) }).descriptor;
  for (const vendor of [false, true]) for (const method of ["addProduct", "editProduct"]) {
    const writes = [], exports = {};
    const endpoints = new Proxy({}, { get: (_, key) => (...args) => `/${String(key)}/${args.join("/")}` });
    const capture = (url, payload) => { writes.push({ url, payload }); return new Promise(() => {}); };
    vm.runInNewContext(transpile(editor.script.content), { exports, require: () => ({}),
      axios: { post: capture, put: capture }, window: { API: endpoints, VAPI: endpoints },
    });
    const value = { ...assignedProduct(), type: "PHYSICAL", pricing: "FIX", currency: "USD", warranty: "Text warranty", return_warranty: 30 };
    exports.default.methods[method].call({ $product: value, step: 2, stepEditors: {},
      IS_VENDOR_PANEL: vendor, vendor: { id: 8 }, shop: { id: 7 }, $shop: { currencies: ["USD"] }, $t: key => key,
    });
    assert.equal(writes.length, 1);
    for (const type of Object.values(LogisticProfileType)) {
      assert.equal(writes[0].payload[type.product_column], value[type.product_column]);
      assert.equal(Object.hasOwn(writes[0].payload, relationFields[type.value]), false);
    }
    assert.equal(writes[0].payload.warranty, "Text warranty");
    assert.equal(writes[0].payload.return_warranty, 30);
    assert.doesNotMatch(JSON.stringify(writes[0].payload), /WARRANTY policy|RETURN_POLICY policy|GUIDE policy|SHIPPING policy|"languages"/);
    const expected = method === "addProduct" ? (vendor ? "/POST_MY_VENDOR_ADD_PRODUCT/8" : "/POST_ADD_PRODUCT/7")
      : (vendor ? "/PUT_MY_VENDOR_EDIT_PRODUCT/8/31" : "/PUT_EDIT_PRODUCT/7/31");
    assert.equal(writes[0].url, expected);
  }
});

test("confirm changes only the matching product draft field, and Cancel changes nothing", async t => {
  for (const type of Object.values(LogisticProfileType)) {
    const f = await fixture(t), before = plain(f.props.product);
    await f.open(type);
    f.state.setProfileInput(99); await settle();
    await f.loaded(result(99, { type: type.value }));
    assert.deepEqual(plain(f.props.product), before);
    f.state.selectProfile(99); await settle();
    assert.deepEqual(Object.fromEntries(Object.keys(before).map(key => [key, plain(f.props.product[key])])), { ...before, [type.product_column]: 99 });
    assert.equal(f.state.profile_dialog, false);
    await f.open(type);
    f.state.setProfileInput(88); await settle();
    f.state.closeProfileDialog(); await settle();
    assert.equal(f.state.profile_dialog, false);
    assert.equal(f.props.product[type.product_column], 99);
    assert.equal(f.calls.writes.length, 0);
  }
});

test("clear invalidates pending profile content and confirms a deliberate empty assignment", async t => {
  const f = await fixture(t);
  await f.open();
  const stale = f.calls.reads[0];
  f.record("BLogisticProfileInput").emit("update:modelValue", null); await settle();
  assert.equal(f.state.profile_input, null);
  assert.equal(f.state.profile, null);
  assert.equal(f.state.articles, null);
  assert.equal(f.state.busy, false);
  assert.equal(f.state.confirmBlocked, false);
  stale.cached(result()); stale.resolve(result()); await settle();
  assert.equal(f.state.profile, null);
  assert.equal(f.find("BLogisticProfileEditor"), undefined);
  f.state.selectProfile(null); await settle();
  assert.equal(f.props.product.warranty_id, null);
  assert.equal(f.props.product.return_policy_id, 13);
  assert.equal(f.state.profile_dialog, false);
});

test("dirty and busy content guard selection, confirmation and native persistent dismissal", async t => {
  const f = await fixture(t);
  await f.open(); await f.loaded();
  for (const status of [{ dirty: true, busy: false }, { dirty: false, busy: true }]) {
    f.record("BLogisticProfileEditor").emit("draft-state", status); await settle();
    assert.equal(f.state.dialogBlocked, true);
    assert.equal(f.state.confirmBlocked, true);
    assert.equal(f.find("BLogisticProfileInput").props.disabled, true);
    assert.equal(f.find("VDialog").props.persistent, true);
    f.state.closeProfileDialog();
    f.state.setProfileInput(99);
    f.state.selectProfile(99); await settle();
    assert.equal(f.state.profile_dialog, true);
    assert.equal(f.state.profile_input, 12);
    assert.equal(f.props.product.warranty_id, 12);
  }
  f.record("BLogisticProfileEditor").emit("draft-state", { dirty: false, busy: false }); await settle();
  f.state.closeProfileDialog(); await settle();
  assert.equal(f.state.profile_dialog, false);
});

test("reopening the same id loads fresh data and rejects old cached/network callbacks", async t => {
  const f = await fixture(t);
  await f.open();
  const old = f.calls.reads[0];
  f.state.closeProfileDialog(); await settle();
  await f.open();
  assert.equal(f.calls.reads.length, 2);
  old.cached(result(12, { name: "Old cached" }));
  old.resolve(result(12, { name: "Old network" })); await settle();
  assert.equal(f.state.profile, null);
  assert.equal(f.state.busy, true);
  await f.loaded(result(12, { name: "Fresh profile" }));
  assert.equal(f.state.profile.name, "Fresh profile");
  assert.equal(f.state.busy, false);
  assert.equal(f.calls.notices.length, 0);
});

test("out-of-order selection reads cannot overwrite the latest profile or end its loading", async t => {
  const f = await fixture(t);
  await f.open();
  const old = f.calls.reads[0];
  f.state.setProfileInput(99); await settle();
  old.cached(result()); old.reject(new Error("Stale request")); await settle();
  assert.equal(f.state.profile, null);
  assert.equal(f.state.busy, true);
  assert.equal(f.state.load_error, false);
  assert.equal(f.calls.notices.length, 0);
  await f.loaded(result(99));
  assert.equal(f.state.profile.id, 99);
  assert.equal(f.state.busy, false);
});

test("a late network refresh cannot replace content after a cached profile was edited and saved", async t => {
  const f = await fixture(t);
  await f.open();
  const read = f.calls.reads[0];
  read.cached(result(12, { name: "Cached profile" })); await settle();
  const editor = f.record("BLogisticProfileEditor"), articles = f.state.articles;
  editor.emit("draft-state", { dirty: true, busy: false }); await settle();
  editor.emit("draft-state", { dirty: false, busy: false }); await settle();
  read.resolve(result(12, { name: "Late old network result" })); await settle();
  assert.equal(f.state.profile.name, "Cached profile");
  assert.equal(f.state.articles, articles);
  assert.equal(f.state.confirmBlocked, false);
});

test("a mismatched or incomplete profile response cannot confirm a product assignment", async t => {
  for (const response of [{ profile: { id: 99 }, articles: [] }, { profile: { id: 12 }, articles: null }]) {
    const f = await fixture(t);
    await f.open(); await f.loaded(response);
    assert.equal(f.state.profile, null);
    assert.equal(f.state.load_error, true);
    assert.equal(f.state.confirmBlocked, true);
    f.state.selectProfile(12);
    assert.equal(f.state.profile_dialog, true);
    assert.equal(f.props.product.warranty_id, 12);
  }
});

test("failed reads block confirmation, retain the selection and recover on retry", async t => {
  const f = await fixture(t);
  await f.open();
  f.calls.reads[0].reject(new Error("Synthetic read failure")); await settle();
  assert.equal(f.state.profile_input, 12);
  assert.equal(f.state.load_error, true);
  assert.equal(f.state.busy, false);
  assert.equal(f.state.confirmBlocked, true);
  f.state.selectProfile(99);
  assert.equal(f.props.product.warranty_id, 12);
  assert.equal(f.state.profile_dialog, true);
  f.state.fetchProfile(); await settle();
  await f.loaded();
  assert.equal(f.state.load_error, false);
  assert.equal(f.state.confirmBlocked, false);
  assert.equal(f.state.profile.id, 12);
  assert.equal(f.calls.notices.length, 1);
});

test("context changes and unmount discard pending content and suppress stale notifications", async t => {
  for (const boundary of ["product", "same-product", "shop", "vendor", "unmount"]) {
    const f = await fixture(t);
    await f.open();
    const old = f.calls.reads[0];
    if (boundary === "product") f.props.product = product({ id: 32 });
    if (boundary === "same-product") f.props.product = product();
    if (boundary === "shop") f.props.shop = { id: 9 };
    if (boundary === "vendor") f.route.params.vendor_id = "8";
    if (boundary === "unmount") f.unmount();
    await settle();
    old.cached(result(12, { name: "Stale context" }));
    old.reject(new Error("Stale context request")); await settle();
    assert.equal(f.state.profile, null, boundary);
    assert.equal(f.calls.notices.length, 0, boundary);
    assert.equal(f.props.product.warranty_id, 12, boundary);
  }
});

test("vendor selection stays readable while shared content and profile creation remain unavailable", async t => {
  const f = await fixture(t, { route: { params: { vendor_id: "8" }, matched: [{ meta: { vendor: true } }] } });
  await f.open(); await f.loaded();
  assert.equal(f.find("BLogisticProfileEditor").props.editable, false);
  assert.equal(f.find("BLogisticProfileInput").props.shop, f.props.shop);
  const create = allNodes(f.root).find(item => item.type === "VBtn" && item.props.to?.name === "BPageShopLogisticProfiles");
  assert.ok(!create || create.props.disabled);
  f.state.selectProfile(12); await settle();
  assert.equal(f.state.profile_dialog, false);
  assert.equal(f.calls.writes.length, 0);
});

test("legacy callers retain their native selector and editor without Refined opt-in", async t => {
  const f = await fixture(t, { props: { modern: false } });
  await f.open(); await f.loaded();
  assert.equal(f.find("VDialog").props.fullscreen, true);
  assert.equal(f.find("BLogisticProfileInput").props.modern, false);
  assert.equal(f.find("BLogisticProfileEditor").props.modern, false);
});

test("Refined profile copy exists in English and Persian with matching interpolation", () => {
  const dictionaries = ["en", "fa"].map(locale => loadEnum(`@selldone/translate/dashboard/${locale}.ts`).default);
  const keys = new Set();
  for (const root of ["product_logistic_profile", "logistic_profile_editor"]) {
    for (const key of Object.keys(dictionaries[0][root].refined)) keys.add(`${root}.refined.${key}`);
  }
  for (const match of source.matchAll(/["'](product_logistic_profile\.refined\.[\w]+)["']/g)) keys.add(match[1]);
  for (const match of source.matchAll(/\bt\(['"](\w+)['"]\)/g)) keys.add(`product_logistic_profile.refined.${match[1]}`);
  for (const key of keys) {
    const values = dictionaries.map(dictionary => key.split(".").reduce((value, part) => value?.[part], dictionary));
    for (const value of values) assert.equal(typeof value, "string", key);
    assert.deepEqual([...values[0].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), [...values[1].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), key);
  }
});
