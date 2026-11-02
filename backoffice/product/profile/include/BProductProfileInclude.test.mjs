import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const repository = new URL("../../../../../../", import.meta.url);
const filename = fileURLToPath(new URL("./BProductProfileInclude.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "product-include-profile-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "product-include-profile-test", compilerOptions: { bindingMetadata: script.bindings },
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
const item = (id, extra = {}) => ({ id, title: `Package item ${id}`, code: `item-${id}`, image: `synthetic-${id}.png`, ...extra });
const product = (extra = {}) => ({ id: 31, title: "Synthetic product", includes: [item(11), item(12)], tax_id: 5, ...extra });
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
const text = current => allNodes(current).map(entry => entry.text).join(" ").replace(/\s+/g, " ").trim();
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
  const calls = { records: [], writes: [], routes: [], notices: [], images: [], warnings: [], errors: [] };
  const window = {
    API: { POST_PRODUCT_INCLUDE_SET(...args) { calls.routes.push(["shop", ...args]); return "/synthetic/shop/includes"; } },
    VAPI: { POST_MY_VENDOR_PRODUCT_INCLUDE_SET(...args) { calls.routes.push(["vendor", ...args]); return "/synthetic/vendor/includes"; } },
    CDN: { GET_SHOP_IMAGE_PATH(...args) { calls.images.push(args); return `/synthetic/${args[0]}`; } },
  };
  // Core is installed by createComponents in the real apps; use its actual collection/image methods here.
  const coreMixin = loadModule("@selldone/components-vue/mixin/CoreMixin.ts", { window, require: () => ({}) }).default;
  const context = vm.createContext({ exports: {}, window,
    fetch() { throw new Error("Unexpected HTTP in isolated package-items fixture"); },
    axios: { post(...args) {
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      calls.writes.push({ args, resolve, reject }); return promise;
    } },
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("NotificationService")) return { default: {
        showErrorAlert: (...args) => calls.notices.push(["error", ...args]),
        showLaravelError: (...args) => calls.notices.push(["laravel", ...args]),
      } };
      if (name.endsWith("BIncludeItemInput.vue")) return { default: leaf("BIncludeItemInput", {
        modelValue: Object, shop: Object, disabled: Boolean, loading: Boolean,
      }) };
      if (name.endsWith("BIncludeItemAdd.vue")) return { default: leaf("BIncludeItemAdd", {
        shop: Object, vendor: Object, dialogMode: Boolean,
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
  const props = Vue.reactive({ product: product(), shop: { id: 7 }, modern: true, ...options.props });
  const route = Vue.reactive({ params: { shop_id: "7", product_id: "31" }, matched: [], ...options.route });
  const display = Vue.reactive({ xs: false });
  let state;
  const mountedComponent = { ...component, render(...args) { state = this; return component.render.apply(this, args); } };
  const app = renderer.createApp({ render: () => Vue.h(mountedComponent, { ...props }) });
  app.provide("calls", calls);
  app.mixin(coreMixin);
  for (const name of ["VListItem", "VListItemTitle", "VListItemSubtitle", "VListItemAction", "VBtn", "VIcon", "VCard", "VCardTitle", "VCardText", "VCardActions", "VLocaleProvider", "VListSubheader", "UWidgetHeader", "VExpandTransition", "VContainer", "VRow", "VCol", "VAvatar", "VImg", "VSheet", "VMenu", "VDivider"]) app.component(name, leaf(name));
  app.component("VTooltip", leaf("VTooltip", { modelValue: Boolean }));
  app.component("VDialog", leaf("VDialog", { modelValue: Boolean, persistent: Boolean, fullscreen: Boolean, maxWidth: [String, Number] }));
  app.directive("copy", {});
  Object.assign(app.config.globalProperties, { $route: route, $t: translate,
    $vuetify: { display, locale: { isRtl: false } }, $i18n: { locale: "en" },
  });
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  const root = node("root"); app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  return { state, props, route, display, calls, root, component,
    find: type => allNodes(root).find(entry => entry.type === type),
    record: name => calls.records.filter(entry => entry.name === name).at(-1),
    mainDialog: () => calls.records.find(entry => entry.name === "VDialog"),
    button: matcher => allNodes(root).find(entry => entry.type === "VBtn" && matcher.test(text(entry))),
    rendered: () => text(root),
    async open() { state.showIncludes(); await settle(); },
    async select(value) { calls.records.filter(entry => entry.name === "BIncludeItemInput").at(-1).emit("update:modelValue", value); await settle(); },
    async save() { state.saveIncludes(); await settle(); },
  };
}

test("the package-items template and scoped styles compile with production asset transforms", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename, id: "product-include-profile-test", scoped: style.scoped, preprocessLang: style.lang,
  })).errors, []);
});

test("opening copies the assigned list; Cancel and native dismissal preserve the product", async t => {
  for (const dismiss of ["cancel", "native"]) {
    const f = await fixture(t);
    const before = plain(f.props.product);
    await f.open();
    assert.deepEqual(plain(f.state.includes), before.includes);
    assert.notEqual(f.state.includes, f.props.product.includes);
    f.state.removeInclude(f.state.includes[0]); await settle();
    if (dismiss === "cancel") f.button(/global.actions.cancel|^Cancel$/i).props.onClick();
    else f.mainDialog().emit("update:modelValue", false);
    await settle();
    assert.equal(f.state.includes_dialog, false);
    assert.deepEqual(plain(f.props.product), before);
    assert.equal(f.calls.writes.length, 0);
    await f.open();
    assert.deepEqual(plain(f.state.includes), before.includes);
    assert.equal(f.state.selected_include, null);
  }
});

test("Escape dismisses nested help first without closing the dialog or losing its draft", async t => {
  const f = await fixture(t);
  const before = plain(f.props.product);
  await f.open();
  f.state.removeInclude(f.state.includes[0]); await settle();
  const draft = plain(f.state.includes);
  const tooltip = copy => allNodes(f.root).find(entry => entry.type === "VTooltip" && text(entry) === copy);
  const event = key => ({ key, prevented: false, stopped: false,
    preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } });
  for (const [key, copy] of [
    ["close", "global.actions.close"],
    ["remove-12", english.product_include_profile.refined.remove_help],
    ["create", english.product_include_profile.refined.create_help],
  ]) {
    tooltip(copy).props.fixtureEmit("update:modelValue", true); await settle();
    assert.equal(f.state.include_help, key);
    assert.equal(tooltip(copy).props.modelValue, true);
    const enter = event("Enter");
    f.find("VDialog").props.onKeydownCapture(enter);
    assert.equal(enter.stopped, false);
    assert.equal(f.state.include_help, key);
    const escape = event("Escape");
    f.find("VDialog").props.onKeydownCapture(escape); await settle();
    assert.equal(escape.prevented, true, key);
    assert.equal(escape.stopped, true, key);
    assert.equal(f.state.include_help, null, key);
    assert.equal(tooltip(copy).props.modelValue, false);
    assert.equal(f.state.includes_dialog, true, key);
    assert.deepEqual(plain(f.state.includes), draft, key);
    assert.deepEqual(plain(f.props.product), before, key);
  }
  const withoutHelp = event("Escape");
  f.find("VDialog").props.onKeydownCapture(withoutHelp);
  assert.equal(withoutHelp.prevented, false);
  assert.equal(withoutHelp.stopped, false);
  f.mainDialog().emit("update:modelValue", false); await settle();
  assert.equal(f.state.includes_dialog, false);
  assert.deepEqual(plain(f.props.product), before);
  assert.equal(f.calls.writes.length, 0);
});

test("stale tooltip leave cannot clear newer help; dismissal and item removal clear owned help", async t => {
  const f = await fixture(t);
  await f.open();
  f.state.setIncludeHelp("close", true);
  f.state.setIncludeHelp("create", true);
  f.state.setIncludeHelp("close", false); await settle();
  assert.equal(f.state.include_help, "create");
  f.state.setIncludeHelp("remove-11", true);
  f.state.removeInclude(f.state.includes[0]); await settle();
  assert.equal(f.state.include_help, null);
  const info = allNodes(f.root).find(entry => entry.type === "VBtn" && entry.props["aria-label"] === english.product_include_profile.refined.create_help);
  info.props.onClick(); await settle();
  assert.equal(f.state.include_help, "create");
  f.mainDialog().emit("update:modelValue", false); await settle();
  assert.equal(f.state.include_help, null);
  await f.open();
  assert.equal(f.state.include_help, null);
});

test("modern selection requires Add and deduplicates existing items through the real Core helper", async t => {
  const f = await fixture(t);
  const before = plain(f.props.product);
  await f.open();
  assert.equal(f.button(/^Add item$/).props.disabled, true);
  await f.select(item(13));
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 12]);
  assert.equal(f.button(/^Add item$/).props.disabled, false);
  f.button(/^Add item$/).props.onClick(); await settle();
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 12, 13]);
  assert.equal(f.state.selected_include, null);
  await f.select(item(13, { title: "Updated package item" }));
  f.state.addSelectedInclude(); await settle();
  assert.equal(f.state.includes.length, 3);
  f.state.removeInclude(f.state.includes[1]); await settle();
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 13]);
  assert.deepEqual(plain(f.props.product), before);
  assert.equal(f.calls.writes.length, 0);
});

test("created items join the draft and close only the creation dialog", async t => {
  const vendor = { id: 9 };
  const f = await fixture(t, { props: { vendor } });
  await f.open();
  f.state.dialog_add = true; await settle();
  assert.equal(f.record("BIncludeItemAdd").props.shop, f.props.shop);
  assert.equal(f.record("BIncludeItemAdd").props.vendor, f.props.vendor);
  assert.equal(f.record("BIncludeItemAdd").props.dialogMode, true);
  f.record("BIncludeItemAdd").emit("add", item(13)); await settle();
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.state.includes_dialog, true);
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 12, 13]);
  assert.deepEqual(plain(f.props.product.includes).map(entry => entry.id), [11, 12]);
  assert.equal(f.calls.writes.length, 0);
});

test("shop Save posts only draft ids and closes after applying the server result", async t => {
  const f = await fixture(t);
  await f.open();
  f.state.removeInclude(f.state.includes[0]); await settle();
  await f.save();
  assert.deepEqual(plain(f.calls.routes), [["shop", 7, 31]]);
  assert.deepEqual(plain(f.calls.writes[0].args), ["/synthetic/shop/includes", { ids: [12] }]);
  assert.equal(f.state.busy_save, true);
  assert.equal(f.state.includes_dialog, true);
  assert.deepEqual(plain(f.props.product.includes).map(entry => entry.id), [11, 12]);
  const saved = [item(12, { title: "Server title" })];
  f.calls.writes[0].resolve({ data: { includes: saved } }); await settle();
  assert.deepEqual(plain(f.props.product.includes), saved);
  assert.equal(f.props.product.tax_id, 5);
  assert.equal(f.state.includes_dialog, false);
  assert.equal(f.state.busy_save, false);
  assert.deepEqual(f.calls.notices, []);
});

test("vendor routing requires both a vendor id and an actual vendor route", async t => {
  for (const vendorRoute of [true, false]) {
    const f = await fixture(t, { route: { params: { vendor_id: "9", shop_id: "7" }, matched: [{ meta: { vendor: vendorRoute } }] } });
    await f.open(); await f.save();
    assert.deepEqual(plain(f.calls.routes), vendorRoute ? [["vendor", "9", 31]] : [["shop", 7, 31]]);
    assert.deepEqual(plain(f.calls.writes[0].args[1]), { ids: [11, 12] });
    f.calls.writes[0].resolve({ data: { includes: [item(11)] } }); await settle();
    assert.equal(f.state.includes_dialog, false);
  }
});

test("server and network failures keep the draft open and the product assignment unchanged", async t => {
  for (const failure of ["server", "network"]) {
    const f = await fixture(t);
    const before = plain(f.props.product);
    await f.open(); f.state.removeInclude(f.state.includes[0]); await settle(); await f.save();
    const error = new Error("Synthetic network failure");
    if (failure === "server") f.calls.writes[0].resolve({ data: { error: true, error_msg: "Synthetic validation error" } });
    else f.calls.writes[0].reject(error);
    await settle();
    assert.equal(f.state.includes_dialog, true);
    assert.equal(f.state.busy_save, false);
    assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [12]);
    assert.deepEqual(plain(f.props.product), before);
    assert.equal(f.calls.notices[0][0], failure === "server" ? "error" : "laravel");
    assert.equal(failure === "server" ? f.calls.notices[0][2] : f.calls.notices[0][1], failure === "server" ? "Synthetic validation error" : error);
  }
});

test("saving locks draft operations and repeated Save until the response settles", async t => {
  const f = await fixture(t);
  await f.open(); await f.select(item(13)); await f.save();
  assert.equal(f.mainDialog().props.persistent, true);
  assert.equal(f.record("BIncludeItemInput").props.disabled, true);
  f.state.addSelectedInclude();
  f.state.removeInclude(f.state.includes[0]);
  f.state.closeIncludes();
  f.state.saveIncludes(); await settle();
  assert.equal(f.state.includes_dialog, true);
  assert.equal(f.calls.writes.length, 1);
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 12]);
  f.calls.writes[0].resolve({ data: { includes: [item(11), item(12)] } }); await settle();
  assert.equal(f.state.busy_save, false);
});

test("empty and missing assignments stay usable and can save an empty id list", async t => {
  for (const includes of [[], null, undefined]) {
    const f = await fixture(t, { props: { product: product({ includes }) } });
    await f.open();
    assert.deepEqual(plain(f.state.includes), []);
    assert.ok(f.find("BIncludeItemInput"));
    await f.save();
    assert.deepEqual(plain(f.calls.writes[0].args[1]), { ids: [] });
    f.calls.writes[0].resolve({ data: { includes: [] } }); await settle();
    assert.deepEqual(plain(f.props.product.includes), []);
    assert.equal(f.state.includes_dialog, false);
  }
});

test("modern presentation stays floating and bounded at desktop and narrow widths", async t => {
  const f = await fixture(t);
  await f.open();
  assert.equal(f.component.props.modern.default, false);
  assert.equal(f.mainDialog().props.fullscreen, false);
  assert.equal(Number(f.mainDialog().props.maxWidth), 760);
  assert.ok(f.calls.images.some(args => args[0] === "synthetic-11.png"));
  assert.ok(f.rendered().includes("Package item 11"));
  assert.ok(f.rendered().includes("item-11"));
  f.display.xs = true; await settle();
  assert.equal(f.mainDialog().props.fullscreen, false);
});

test("modern vendors can select items while owner-only management and creation remain unavailable", async t => {
  const f = await fixture(t, { route: { params: { vendor_id: "9" }, matched: [{ meta: { vendor: true } }] } });
  await f.open();
  assert.ok(f.find("BIncludeItemInput"));
  assert.equal(f.button(/^Create new item$/), undefined);
  assert.equal(allNodes(f.root).some(entry => entry.type === "VBtn" && entry.props.to?.name === "BPageShopLogisticIncludes"), false);
  assert.ok(f.rendered().includes(english.product_include_profile.refined.owner_help));
  await f.select(item(13)); f.state.addSelectedInclude(); await settle();
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 12, 13]);
  assert.equal(f.calls.writes.length, 0);
});

test("modern owner management keeps the current shop route and meaningful item action names", async t => {
  const f = await fixture(t);
  await f.open();
  const manage = allNodes(f.root).find(entry => entry.type === "VBtn" && entry.props.to?.name === "BPageShopLogisticIncludes");
  assert.equal(manage.props.to.params.shop_id, 7);
  assert.ok(f.button(/^Create new item$/));
  const remove = allNodes(f.root).find(entry => entry.type === "VBtn" && entry.props["aria-label"] === "Remove Package item 11 from package");
  assert.ok(remove);
  remove.props.onClick(); await settle();
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [12]);
  assert.deepEqual(plain(f.props.product.includes).map(entry => entry.id), [11, 12]);
});

test("legacy callers keep their fullscreen selector and automatic selection add", async t => {
  const f = await fixture(t, { props: { modern: false } });
  await f.open();
  assert.equal(f.mainDialog().props.fullscreen, true);
  await f.select(item(13));
  assert.deepEqual(plain(f.state.includes).map(entry => entry.id), [11, 12, 13]);
  assert.deepEqual(plain(f.props.product.includes).map(entry => entry.id), [11, 12]);
  assert.equal(f.calls.writes.length, 0);
});

test("the existing selector forwards localized label, placeholder and disabled attrs to its native field", async () => {
  const inputFilename = fileURLToPath(new URL("../../../include-item/input/BIncludeItemInput.vue", import.meta.url));
  const { descriptor: inputDescriptor, errors: inputErrors } = parse(readFileSync(inputFilename, "utf8"), { filename: inputFilename });
  assert.deepEqual(inputErrors, []);
  const inputScript = compileScript(inputDescriptor, { id: "include-native-input-test" });
  const inputTemplate = compileTemplate({ source: inputDescriptor.template.content, filename: inputFilename,
    id: "include-native-input-test", compilerOptions: { bindingMetadata: inputScript.bindings } });
  assert.deepEqual(inputTemplate.errors, []);
  const calls = { records: [], reads: [], errors: [], warnings: [] };
  const context = vm.createContext({ exports: {},
    window: { API: { GET_SHOP_INCLUDES: id => `/synthetic/shop/${id}/includes` } },
    axios: { get(...args) { calls.reads.push(args); return Promise.resolve({ data: { includes: [], total: 0 } }); } },
    require(name) {
      if (name.includes("thread/threads")) return { default: { debounceSearch: callback => callback } };
      if (name.includes("NotificationService")) return { default: { showErrorAlert() { throw new Error("Unexpected selector error"); } } };
      if (name === "vue") return Vue;
      throw new Error(`Unexpected selector dependency: ${name}`);
    },
  });
  vm.runInContext(`(() => { ${transpile(inputDescriptor.script.content)} })()`, context);
  const component = context.exports.default;
  context.exports = {};
  vm.runInContext(`(() => { ${transpile(inputTemplate.code)} })()`, context);
  component.render = context.exports.render;
  const app = renderer.createApp({ render: () => Vue.h(component, {
    shop: { id: 7 }, label: "آیتم موجود", placeholder: "یک آیتم انتخاب کنید", disabled: true,
  }) });
  app.provide("calls", calls);
  app.component("VAutocomplete", leaf("VAutocomplete", { label: String, placeholder: String, disabled: Boolean }));
  for (const name of ["VAvatar", "VListItem"]) app.component(name, leaf(name));
  app.config.globalProperties.$route = { params: {}, matched: [] };
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  app.mount(node("root")); await settle();
  try {
    const field = calls.records.find(entry => entry.name === "VAutocomplete");
    assert.equal(field.props.label, "آیتم موجود");
    assert.equal(field.props.placeholder, "یک آیتم انتخاب کنید");
    assert.equal(field.props.disabled, true);
    assert.deepEqual(plain(calls.reads), [["/synthetic/shop/7/includes", { params: { search: "", offset: 0, count: 20 } }]]);
    assert.deepEqual(calls.errors, []);
    assert.deepEqual(calls.warnings, []);
  } finally { app.unmount(); }
});

test("Refined package-items copy exists in English and Persian with matching interpolation", () => {
  const persian = loadModule("@selldone/translate/dashboard/fa.ts").default;
  const entries = english.product_include_profile.refined;
  assert.ok(entries);
  for (const key of Object.keys(entries)) {
    const values = [entries[key], persian.product_include_profile.refined[key]];
    for (const value of values) assert.equal(typeof value, "string", key);
    assert.deepEqual([...values[0].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
      [...values[1].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), key);
  }
});
