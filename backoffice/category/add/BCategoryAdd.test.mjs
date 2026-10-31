import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";

const file = new URL("./BCategoryAdd.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "category-add-test" });
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "category-add-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const plain = (value) => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const enabled = (value) => value === true || value === "";
const prop = (node, key) => node.props[key] ?? node.props[key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
const element = (type, text = "") => ({ type, text, props: {}, style: {}, children: [], parent: null });
const remove = (node) => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; };
const renderer = Vue.createRenderer({
  createElement: (type) => element(type), createText: (text) => element("text", text), createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) { remove(node); const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, node); node.parent = parent; },
  remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; }, parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const stub = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(name, attrs, [slots.activator?.({ props: {} }), slots.label?.(), slots.default?.(), slots["append-inner"]?.()]) });
const descendants = (node) => [node, ...node.children.flatMap(descendants)];
const savedCategory = () => ({ id: 31, title: "Saved category", name: "saved-category", description: "Saved description", icon: "shops/19/categories/saved.png", star: false, parent_id: 3, page_id: null, page: null, augment: [], engine: null, filters: null });
const persianExports = {};
new Function("exports", transpile(readFileSync(new URL("../../../../translate/dashboard/fa.ts", import.meta.url), "utf8")))(persianExports);
const persian = persianExports.default;

async function fixture(t, { category = savedCategory(), vendor = false, parentFolder = null, hideTopBar = false, language = "en" } = {}) {
  const calls = { requests: [], notifications: [], emitted: [], confirmations: [], errors: [], warnings: [] };
  const request = (method) => (url, body, options) => new Promise((resolve, reject) => calls.requests.push({ method, url, body, options, resolve, reject }));
  const window = { API: {
    POST_ADD_CATEGORY: (shop) => `/fixture/shops/${shop}/categories`,
    PUT_EDIT_CATEGORY: (shop, category) => `/fixture/shops/${shop}/categories/${category}`,
    DELETE_CATEGORY: (shop, category) => `/fixture/shops/${shop}/categories/${category}`,
    POST_UPLOAD_CATEGORY_IMAGE: (shop, category) => `/fixture/shops/${shop}/categories/${category}/image`,
    GET_ALL_MY_CATEGORIES_LIST_BY_PARAMS: (shop) => `/fixture/shops/${shop}/categories/projection`,
  }, VAPI: {
    POST_MY_VENDOR_ADD_CATEGORY: (vendor) => `/fixture/vendors/${vendor}/categories`,
    PUT_MY_VENDOR_EDIT_CATEGORY: (vendor, category) => `/fixture/vendors/${vendor}/categories/${category}`,
    DELETE_MY_VENDOR_CATEGORY: (vendor, category) => `/fixture/vendors/${vendor}/categories/${category}`,
    POST_MY_VENDOR_UPLOAD_CATEGORY_IMAGE: (vendor, category) => `/fixture/vendors/${vendor}/categories/${category}/image`,
  } };
  const augmentRead = (owner, page, augment) => new Promise((resolve, reject) => calls.requests.push({ method: "augment", owner, page, augment, resolve, reject }));
  window.$backoffice = { page: { getPageAugment: augmentRead } };
  window.$vendor = { page: { getPageAugment: augmentRead } };
  const notifications = Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map((method) => [method, (...args) => calls.notifications.push({ method, args })]));
  notifications.openDangerAlert = (...args) => calls.confirmations.push(args);
  const context = vm.createContext({ exports: {}, console, window, FormData, Blob, axios: Object.fromEntries(["get", "post", "put", "delete"].map((method) => [method, request(method)])),
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("NotificationService")) return { default: notifications };
      if (name.includes("slugify")) return { Slugify: { apply: (value) => value.toLowerCase().trim().replace(/\s+/g, "-") } };
      if (name.includes("ShopCategoryHelper")) return { ShopCategoryHelper: { GetCategoryIconById: (id) => `/fixture-images/${id}` } };
      if (name === "@selldone/core-js/helper") return { ShopURLs: { MainShopUrl: () => "https://fixture.selldone.com" } };
      if (name.endsWith(".vue")) return { default: stub(name.split("/").at(-1).replace(".vue", "").replace(/([A-Z])/g, "-$1").replace(/^-/, "").toLowerCase()) };
      throw new Error(`Unexpected category add dependency: ${name}`);
    } });
  const run = (source) => vm.runInContext(`(() => {${transpile(source)}\n})()`, context);
  run(descriptor.script.content);
  const component = context.exports.default;
  context.exports = {}; run(template.code);
  const render = context.exports.render;
  let state;
  const compiled = { ...component, render(...args) { state = this; return render.apply(this, args); } };
  const props = Vue.reactive({ shop: { id: 19 }, vendor: { id: 7 }, category: category && plain(category), categories: [
    { id: 3, childes: category ? [plain(category)] : [] }, { id: 5, childes: [] },
  ], parentFolder, hideTopBar });
  const app = renderer.createApp({ render: () => Vue.h(compiled, { ...props,
    onAdd: (value) => calls.emitted.push(["add", plain(value)]), onEdit: (value) => calls.emitted.push(["edit", plain(value)]),
    onDelete: (value) => calls.emitted.push(["delete", value]), onBack: () => calls.emitted.push(["back"]),
  }) });
  Object.assign(app.config.globalProperties, {
    window, $route: { params: vendor ? { vendor_id: 7 } : { shop_id: 19 }, matched: [{ meta: { vendor } }] },
    $t: (key) => language === "fa" ? key.split(".").reduce((value, part) => value?.[part], persian) ?? key : key,
    $vuetify: { locale: { isRtl: language === "fa" } },
    getShopImagePath: (path) => `/fixture-images/${path}`,
    resetToDefault() { Object.assign(this.$data, this.$options.data.call(this)); },
    AddOrUpdateItemByID(list, item) { const index = list.findIndex((value) => value.id === item.id); if (index < 0) list.push(item); else list[index] = item; },
    DeleteItemByID(list, id) { const index = list.findIndex((value) => value.id === id); if (index >= 0) list.splice(index, 1); },
  });
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) app.component(match[1], stub(match[1]));
  const root = element("root");
  app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const nodes = (name) => descendants(root).filter((node) => node.type === name);
  const action = (method) => nodes("v-btn").find((node) => node.props.onClick === state[method] || String(node.props.onClick).includes(method));
  const emit = async (node, event, value) => { assert.ok(node, "Native control exists"); for (const handler of [node.props[event]].flat()) { assert.equal(typeof handler, "function"); handler(value); } await settle(); };
  const click = async (node) => { assert.ok(node, "Native action exists"); assert.ok(!enabled(prop(node, "disabled")), "Native action remains enabled"); await emit(node, "onClick", { preventDefault() {}, stopPropagation() {} }); };
  const tab = async (value) => { state.tab = value; await settle(); };
  return { get state() { return state; }, props, calls, nodes, action, emit, click, tab, component };
}

async function templateDraft(f, page = { id: 64 }, augment = [{ name: "headline", value: "Draft page value" }]) {
  await f.tab("template");
  await f.emit(f.nodes("b-page-input")[0], "onUpdate:modelValue", page);
  if (page) {
    const read = f.calls.requests.at(-1); assert.equal(read.method, "augment");
    read.resolve({ augment: [] }); await settle();
    await f.emit(f.nodes("l-augment-form")[0], "onUpdate:modelValue", augment);
    await f.emit(f.nodes("l-augment-form")[0], "onChange");
  }
}

test("creation preserves required title/URL, parent context, native file picker and multipart shop/vendor routes", async (t) => {
  for (const vendor of [false, true]) {
    const f = await fixture(t, { category: null, vendor, parentFolder: { id: 5, title: "Parent" }, hideTopBar: true });
    assert.equal(f.state.title, ""); assert.equal(f.state.name, ""); assert.equal(f.state.star, true); assert.equal(f.state.parent_id, 5);
    assert.equal(f.nodes("b-category-add-header").length, 0); assert.equal(f.nodes("s-image-uploader").length, 0);
    assert.equal(f.nodes("v-file-input").length, 1); assert.ok(enabled(prop(f.action("addCategory"), "disabled")));
    const title = f.nodes("v-text-field").find((node) => prop(node, "label") === "add_category.title_input");
    await f.emit(title, "onUpdate:modelValue", "Draft title"); await f.emit(title, "onBlur");
    assert.equal(f.state.name, "draft-title"); assert.equal(f.state.canConfirm, "Draft title");
    f.state.name = "manual-url"; await f.emit(title, "onBlur"); assert.equal(f.state.name, "manual-url");
    f.state.description = "Draft description"; f.state.star = false;
    f.state.selected_file = new Blob(["fixture image"], { type: "image/png" });
    await f.click(f.action("addCategory"));
    const request = f.calls.requests[0]; assert.equal(request.method, "post");
    assert.equal(request.url, vendor ? "/fixture/vendors/7/categories" : "/fixture/shops/19/categories");
    assert.equal(request.options.headers["Content-Type"], "multipart/form-data");
    const body = Object.fromEntries(request.body.entries());
    assert.deepEqual({ ...body, photo: undefined }, { title: "Draft title", description: "Draft description", star: "false", parent_id: "5", name: "manual-url", photo: undefined });
    assert.equal(body.photo.type, "image/png"); assert.equal(await body.photo.text(), "fixture image");
    assert.equal(f.state.busy, true); assert.equal(prop(f.action("addCategory"), "loading"), true);
    const result = { id: 88, title: "Draft title", parent_id: 5 };
    request.resolve({ data: { category: result } }); await settle();
    assert.equal(f.state.busy, false); assert.deepEqual(f.calls.emitted, [["add", result], ["back"]]);
  }
});

test("routine edit keeps image uploads, parent movement and success ordering without committing template drafts", async (t) => {
  for (const vendor of [false, true]) {
    const f = await fixture(t, { vendor });
    const uploader = f.nodes("s-image-uploader")[0];
    assert.equal(prop(uploader, "server"), vendor ? "/fixture/vendors/7/categories/31/image" : "/fixture/shops/19/categories/31/image");
    assert.equal(prop(uploader, "maxFileSize"), "2MB"); assert.ok(enabled(prop(uploader, "autoCompact")));
    assert.equal(f.nodes("v-file-input").length, 0); assert.equal(f.nodes("b-translation-button-category").length, 2);
    await f.emit(uploader, "onNewPath", "shops/19/categories/new.png");
    assert.equal(f.state.icon, "shops/19/categories/new.png"); assert.equal(f.props.category.icon, f.state.icon);
    const parent = f.nodes("b-category-input")[0]; assert.ok(enabled(prop(parent, "clearable")));
    await f.emit(parent, "onUpdate:modelValue", 5);
    f.state.title = "Changed title"; f.state.description = "Changed description"; f.state.name = "changed-url"; f.state.star = true;
    await f.tab("template");
    await f.emit(f.nodes("b-page-input")[0], "onUpdate:modelValue", { id: 64 });
    const augment = f.calls.requests[0]; assert.equal(augment.method, "augment"); assert.equal(augment.owner, vendor ? 7 : 19); assert.equal(augment.page, 64);
    augment.resolve({ augment: [{ name: "headline", value: "Existing page value" }] }); await settle();
    await f.emit(f.nodes("l-augment-form")[0], "onUpdate:modelValue", [{ name: "headline", value: "Draft page value" }]);
    await f.emit(f.nodes("l-augment-form")[0], "onChange");
    await f.tab("setting");
    await f.click(f.action("editCategory"));
    const request = f.calls.requests[1]; assert.equal(request.method, "put");
    assert.equal(request.url, vendor ? "/fixture/vendors/7/categories/31" : "/fixture/shops/19/categories/31");
    assert.deepEqual(plain(request.body), { title: "Changed title", icon: "shops/19/categories/new.png", description: "Changed description", star: true, parent_id: 5, name: "changed-url" });
    const result = { ...savedCategory(), ...plain(request.body) };
    request.resolve({ data: { category: result } }); await settle();
    assert.deepEqual(plain(f.props.categories[0].childes), []);
    assert.deepEqual(plain(f.props.categories[1].childes), [result]);
    assert.deepEqual(f.calls.emitted, [["edit", result], ["back"]]); assert.equal(f.state.busy, false);
  }
});

test("application and network failures preserve create/edit drafts and keep the dialog open", async (t) => {
  for (const create of [false, true]) for (const network of [false, true]) {
    const f = await fixture(t, { category: create ? null : savedCategory() });
    Object.assign(f.state, { title: "Attempted title", name: "attempted-url", description: "Attempted description", parent_id: null });
    await settle();
    await f.click(f.action(create ? "addCategory" : "editCategory"));
    const request = f.calls.requests[0];
    if (network) request.reject(new Error("Fixture failure")); else request.resolve({ data: { error: true, error_msg: "Fixture denied" } });
    await settle();
    assert.equal(f.state.busy, false); assert.deepEqual(f.calls.emitted, []);
    assert.equal(f.state.title, "Attempted title"); assert.equal(f.state.name, "attempted-url"); assert.equal(f.state.description, "Attempted description"); assert.equal(f.state.parent_id, null);
    assert.equal(f.calls.notifications.at(-1).method, network ? "showLaravelError" : "showErrorAlert");
  }
});

test("template Save uses its independent payload and loading state without closing or committing routine drafts", async (t) => {
  for (const vendor of [false, true]) {
    const f = await fixture(t, { vendor });
    const category = f.props.category;
    Object.assign(f.state, { title: "Unsaved routine title", name: "unsaved-url", description: "Unsaved routine description", parent_id: 5, star: true });
    await templateDraft(f);
    await f.click(f.action("saveTemplate"));
    const request = f.calls.requests.at(-1); assert.equal(request.method, "put");
    assert.equal(request.url, vendor ? "/fixture/vendors/7/categories/31" : "/fixture/shops/19/categories/31");
    assert.deepEqual(plain(request.body), { page_id: 64, augment: [{ name: "headline", value: "Draft page value" }] });
    assert.equal(f.state.busy_save, true); assert.equal(f.state.busy, false); assert.equal(prop(f.action("saveTemplate"), "loading"), true);
    assert.deepEqual(f.calls.emitted, []); assert.equal(f.state.changed, true);
    const result = { ...savedCategory(), page_id: 64, page: { id: 64, title: "Saved custom page" }, augment: plain(request.body.augment) };
    request.resolve({ data: { category: result } }); await settle();
    assert.equal(f.state.busy_save, false); assert.equal(f.state.changed, false); assert.equal(f.state.tab, "template");
    assert.equal(f.props.category, category, "Applying the saved template does not replace the active category and reset routine input");
    assert.equal(f.props.category.page_id, 64); assert.deepEqual(plain(f.props.category.page), result.page); assert.deepEqual(plain(f.props.category.augment), result.augment);
    assert.equal(f.state.title, "Unsaved routine title"); assert.equal(f.state.name, "unsaved-url"); assert.equal(f.state.description, "Unsaved routine description"); assert.equal(f.state.parent_id, 5); assert.equal(f.state.star, true);
    assert.deepEqual(f.calls.emitted, [["edit", result]], "Template completion emits the saved result without Back");
  }
});

test("clearing a saved template sends explicit null page and augment values", async (t) => {
  const f = await fixture(t, { category: { ...savedCategory(), page_id: 64, page: { id: 64 }, augment: [{ name: "headline", value: "Saved page value" }] } });
  const read = f.calls.requests[0]; assert.equal(read.method, "augment"); read.resolve({ augment: [{ name: "headline", value: "Saved page value" }] }); await settle();
  await templateDraft(f, null);
  await f.click(f.action("saveTemplate"));
  const request = f.calls.requests.at(-1);
  assert.deepEqual(plain(request.body), { page_id: null, augment: null });
  const result = { ...savedCategory(), page_id: null, page: null, augment: null };
  request.resolve({ data: { category: result } }); await settle();
  assert.equal(f.props.category.page_id, null); assert.equal(f.props.category.page, null); assert.equal(f.props.category.augment, null);
  assert.equal(f.state.page, null); assert.equal(f.state.busy_save, false); assert.equal(f.state.tab, "template"); assert.deepEqual(f.calls.emitted, [["edit", result]]);
});

test("template errors retain template and routine drafts without result or close events", async (t) => {
  for (const network of [false, true]) {
    const f = await fixture(t);
    f.state.title = "Unsaved routine title"; f.state.description = "Unsaved routine description";
    await templateDraft(f);
    await f.click(f.action("saveTemplate"));
    const request = f.calls.requests.at(-1);
    if (network) request.reject(new Error("Fixture template failure")); else request.resolve({ data: { error: true, error_msg: "Fixture template denied" } });
    await settle();
    assert.equal(f.state.busy_save, false); assert.equal(f.state.busy, false); assert.equal(f.state.changed, true); assert.equal(f.state.tab, "template");
    assert.equal(f.state.page.id, 64); assert.deepEqual(plain(f.state.augment), [{ name: "headline", value: "Draft page value" }]);
    assert.equal(f.props.category.page_id, null); assert.equal(f.state.title, "Unsaved routine title"); assert.equal(f.state.description, "Unsaved routine description");
    assert.deepEqual(f.calls.emitted, []); assert.equal(f.calls.notifications.at(-1).method, network ? "showLaravelError" : "showErrorAlert");
  }
});

test("stale template responses cannot overwrite or emit for a different category or shop", async (t) => {
  for (const change of ["category", "shop"]) {
    const f = await fixture(t);
    await templateDraft(f); await f.click(f.action("saveTemplate"));
    const request = f.calls.requests.at(-1);
    if (change === "category") f.props.category = { ...savedCategory(), id: 92, title: "Next category", name: "next-category" };
    else f.props.shop = { id: 90 };
    await settle(); f.state.title = "Current unsaved title"; await settle();
    request.resolve({ data: { category: { ...savedCategory(), page_id: 64, page: { id: 64 }, augment: [{ name: "headline", value: "Old result" }] } } }); await settle();
    assert.equal(f.props.category.page_id, null); assert.equal(f.state.title, "Current unsaved title"); assert.deepEqual(f.calls.emitted, []);
  }
});

test("overlapping page augment reads apply only the current page and preserve its loading/draft state", async (t) => {
  for (const first of ["older", "current"]) {
    const f = await fixture(t); f.state.title = "Unsaved routine title";
    await f.tab("template");
    await f.emit(f.nodes("b-page-input")[0], "onUpdate:modelValue", { id: 64 });
    const older = f.calls.requests.at(-1);
    await f.emit(f.nodes("b-page-input")[0], "onUpdate:modelValue", { id: 65 });
    const current = f.calls.requests.at(-1);
    assert.notEqual(older, current); assert.equal(older.page, 64); assert.equal(current.page, 65);
    assert.equal(f.state.busy_load, true); assert.ok(enabled(prop(f.action("saveTemplate"), "disabled")));
    f.state.saveTemplate(); await settle(); assert.equal(f.calls.requests.length, 2, "Pending augment reads cannot be saved");
    if (first === "older") {
      older.resolve({ augment: [{ name: "older", value: "Old page schema" }] }); await settle();
      assert.deepEqual(plain(f.state.augment), []); assert.equal(f.state.busy_load, true, "An old finally handler cannot finish the current page's read");
    }
    current.resolve({ augment: [{ name: "current", value: "Current page schema" }] }); await settle();
    assert.deepEqual(plain(f.state.augment), [{ name: "current", value: "Current page schema" }]); assert.equal(f.state.busy_load, false);
    await f.emit(f.nodes("l-augment-form")[0], "onUpdate:modelValue", [{ name: "current", value: "Current page draft" }]);
    await f.emit(f.nodes("l-augment-form")[0], "onChange");
    if (first === "current") { older.resolve({ augment: [{ name: "older", value: "Late old page schema" }] }); await settle(); }
    assert.deepEqual(plain(f.state.augment), [{ name: "current", value: "Current page draft" }]); assert.equal(f.state.augment_load_error, false);
    assert.equal(f.state.title, "Unsaved routine title"); assert.deepEqual(f.calls.emitted, []); assert.deepEqual(f.calls.notifications, []);
  }
});

test("failed current augment reads block template Save until the inline retry succeeds", async (t) => {
  const f = await fixture(t); f.state.title = "Unsaved routine title";
  await f.tab("template");
  await f.emit(f.nodes("b-page-input")[0], "onUpdate:modelValue", { id: 64 });
  f.calls.requests[0].reject(new Error("Fixture augment failure")); await settle();
  assert.equal(f.state.busy_load, false); assert.equal(f.state.augment_load_error, true);
  assert.ok(enabled(prop(f.action("saveTemplate"), "disabled"))); assert.equal(f.calls.notifications.at(-1).method, "showLaravelError");
  f.state.saveTemplate(); await settle(); assert.equal(f.calls.requests.length, 1, "The method guard also blocks saving an unavailable augment schema");
  await f.click(f.action("loadArgumentStructure"));
  assert.equal(f.state.busy_load, true); assert.equal(f.state.augment_load_error, false);
  const retry = f.calls.requests[1]; assert.equal(retry.method, "augment"); assert.equal(retry.page, 64);
  retry.resolve({ augment: [{ name: "retried", value: "Loaded after retry" }] }); await settle();
  assert.equal(f.state.busy_load, false); assert.equal(f.state.augment_load_error, false); assert.ok(!enabled(prop(f.action("saveTemplate"), "disabled")));
  await f.click(f.action("saveTemplate"));
  const save = f.calls.requests[2]; assert.equal(save.method, "put");
  assert.deepEqual(plain(save.body), { page_id: 64, augment: [{ name: "retried", value: "Loaded after retry" }] });
  const result = { ...savedCategory(), page_id: 64, page: { id: 64 }, augment: plain(save.body.augment) };
  save.resolve({ data: { category: result } }); await settle();
  assert.equal(f.state.title, "Unsaved routine title"); assert.equal(f.state.tab, "template"); assert.deepEqual(f.calls.emitted, [["edit", result]]);
});

test("clearing the page clears augment loading/errors and ignores a late success or failure", async (t) => {
  for (const outcome of ["late-success", "late-failure", "already-failed"]) {
    const f = await fixture(t, { category: { ...savedCategory(), page_id: 64, page: { id: 64 }, augment: [{ name: "saved", value: "Saved value" }] } });
    const read = f.calls.requests[0]; assert.equal(read.method, "augment");
    await f.tab("template");
    if (outcome === "already-failed") { read.reject(new Error("Fixture current failure")); await settle(); assert.equal(f.state.augment_load_error, true); }
    const notifications = f.calls.notifications.length;
    await f.emit(f.nodes("b-page-input")[0], "onUpdate:modelValue", null);
    assert.equal(f.state.busy_load, false); assert.equal(f.state.augment_load_error, false);
    if (outcome === "late-success") read.resolve({ augment: [{ name: "late", value: "Discarded schema" }] });
    else if (outcome === "late-failure") read.reject(new Error("Fixture stale failure"));
    await settle();
    assert.deepEqual(plain(f.state.augment), [{ name: "saved", value: "Saved value" }]);
    assert.equal(f.calls.notifications.length, notifications, "A stale failure does not raise a current-page error");
    assert.equal(f.state.augment_load_error, false); assert.ok(!enabled(prop(f.action("saveTemplate"), "disabled")));
    await f.click(f.action("saveTemplate"));
    const save = f.calls.requests.at(-1); assert.deepEqual(plain(save.body), { page_id: null, augment: null });
    save.resolve({ data: { category: { ...savedCategory(), augment: null } } }); await settle();
    assert.equal(f.state.page, null); assert.equal(f.state.augment, null); assert.equal(f.state.tab, "template");
  }
});

test("tab switches retain routine drafts and native filter/engine result propagation", async (t) => {
  const f = await fixture(t);
  Object.assign(f.state, { title: "Unsaved title", name: "unsaved-url", description: "Unsaved description", parent_id: 5 });
  await f.tab("filter");
  assert.ok(enabled(prop(f.nodes("b-category-filter-editor")[0], "embedded")));
  await f.emit(f.nodes("b-category-filter-editor")[0], "onEditFilters", { brands: ["Saved brand"] });
  assert.deepEqual(plain(f.props.category.filters), { brands: ["Saved brand"] });
  await f.tab("engine");
  const engine = f.nodes("b-category-engine-editor")[0]; assert.ok(enabled(prop(engine, "modern"))); assert.ok(enabled(prop(engine, "embedded")));
  await f.emit(engine, "onEditEngine", { categories: [5], tags: ["saved"] });
  assert.deepEqual(plain(f.props.category.engine), { categories: [5], tags: ["saved"] });
  await f.emit(engine, "onEditFilters", { brands: ["Engine brand"] });
  assert.deepEqual(plain(f.props.category.filters), { brands: ["Engine brand"] });
  assert.equal(f.state.tab, "engine", "An embedded engine result stays in its current section");
  await f.tab("setting");
  assert.equal(f.state.title, "Unsaved title"); assert.equal(f.state.name, "unsaved-url"); assert.equal(f.state.description, "Unsaved description"); assert.equal(f.state.parent_id, 5);
  assert.equal(f.calls.requests.length, 0); assert.deepEqual(f.calls.emitted, []);
});

test("missing engine data is read through the bounded projection before mounting the embedded editor", async (t) => {
  const category = savedCategory(); delete category.engine;
  const f = await fixture(t, { category });
  f.state.title = "Unsaved routine title";
  assert.deepEqual(f.calls.requests, [], "Settings does not fetch engine data preemptively");
  await f.tab("engine");
  assert.equal(f.nodes("b-category-engine-editor").length, 0); assert.equal(f.state.busy_load_engine, true);
  const request = f.calls.requests[0]; assert.equal(request.method, "get"); assert.equal(request.url, "/fixture/shops/19/categories/projection");
  assert.deepEqual(plain(request.body), { params: { params: ["engine", "deleted_at"], list: [31] } });
  const engine = { categories: [5, 8], tags: ["saved"] };
  request.resolve({ data: { categories: [{ id: 31, deleted_at: null, engine }] } }); await settle();
  assert.equal(f.state.busy_load_engine, false); assert.equal(f.state.engine_load_error, false);
  const editor = f.nodes("b-category-engine-editor")[0]; assert.ok(editor); assert.ok(enabled(prop(editor, "embedded")));
  assert.deepEqual(plain(prop(editor, "category").engine), engine); assert.equal(f.state.title, "Unsaved routine title");
  await f.tab("setting"); await f.tab("engine");
  assert.equal(f.calls.requests.length, 1, "Known saved engine data is reused"); assert.deepEqual(f.calls.emitted, []);
});

test("explicit empty and populated engine projections do not issue an extra read", async (t) => {
  for (const engine of [null, { categories: [5], tags: [] }]) {
    const f = await fixture(t, { category: { ...savedCategory(), engine } });
    await f.tab("engine");
    assert.equal(f.nodes("b-category-engine-editor").length, 1); assert.deepEqual(f.calls.requests, []);
    assert.deepEqual(plain(prop(f.nodes("b-category-engine-editor")[0], "category").engine), engine);
  }
});

test("failed or invalid engine reads keep the editor gated and allow a successful retry", async (t) => {
  for (const outcome of ["application-error", "network-error", "missing", "deleted", "unprojected"]) {
    const category = savedCategory(); delete category.engine;
    const f = await fixture(t, { category }); await f.tab("engine");
    const request = f.calls.requests[0];
    if (outcome === "network-error") request.reject(new Error("Fixture engine read failure"));
    else if (outcome === "application-error") request.resolve({ data: { error: true, error_msg: "Fixture denied", categories: [] } });
    else request.resolve({ data: { categories: outcome === "missing" ? [] : [{ id: 31, ...(outcome === "deleted" ? { deleted_at: "2026-10-01", engine: null } : {}) }] } });
    await settle();
    assert.equal(f.state.busy_load_engine, false); assert.equal(f.state.engine_load_error, true); assert.equal(f.nodes("b-category-engine-editor").length, 0);
    assert.equal(f.props.category.engine, undefined); assert.deepEqual(f.calls.emitted, []);
    await f.click(f.action("loadEngine"));
    assert.equal(f.state.busy_load_engine, true); assert.equal(f.state.engine_load_error, false);
    f.calls.requests[1].resolve({ data: { categories: [{ id: 31, deleted_at: null, engine: null }] } }); await settle();
    assert.equal(f.props.category.engine, null); assert.equal(f.state.busy_load_engine, false); assert.equal(f.nodes("b-category-engine-editor").length, 1);
  }
});

test("stale engine reads cannot populate a different category or shop and the new context can retry", async (t) => {
  for (const change of ["category", "shop"]) {
    const category = savedCategory(); delete category.engine;
    const f = await fixture(t, { category }); await f.tab("engine");
    const request = f.calls.requests[0];
    if (change === "category") {
      const next = { ...savedCategory(), id: 92, title: "Next category" }; delete next.engine; f.props.category = next;
    } else f.props.shop = { id: 90 };
    await settle();
    request.resolve({ data: { categories: [{ id: 31, engine: { categories: [3], tags: ["old result"] } }] } }); await settle();
    assert.equal(f.props.category.engine, undefined); assert.equal(f.state.busy_load_engine, false); assert.deepEqual(f.calls.emitted, []);
    await f.tab("setting"); await f.tab("engine");
    const nextRead = f.calls.requests.at(-1); assert.notEqual(nextRead, request);
    assert.equal(nextRead.url, change === "shop" ? "/fixture/shops/90/categories/projection" : "/fixture/shops/19/categories/projection");
    assert.deepEqual(plain(nextRead.body.params.list), [change === "category" ? 92 : 31]);
    nextRead.resolve({ data: { categories: [{ id: f.props.category.id, engine: { categories: [], tags: ["current result"] } }] } }); await settle();
    assert.deepEqual(plain(f.props.category.engine), { categories: [], tags: ["current result"] });
  }
});

test("critical delete requires active section, open disclosure and current verification, including final callback", async (t) => {
  for (const vendor of [false, true]) {
    const f = await fixture(t, { vendor });
    f.state.deleteCategoryDialog(); f.state.deleteCategory(f.props.category); await settle();
    assert.equal(f.calls.confirmations.length, 0); assert.equal(f.calls.requests.length, 0);
    await f.tab("critical");
    await f.emit(f.nodes("details")[0], "onToggle", { target: { open: true } });
    assert.equal(f.state.critical_open, true);
    const verify = () => f.nodes("u-smart-verify")[0];
    assert.equal(prop(verify(), "role"), "checkbox"); assert.equal(String(prop(verify(), "tabindex")), "0");
    assert.equal(prop(verify(), "aria-label"), "add_category.critical_zone.accept_delete.true_title");
    assert.equal(prop(verify(), "aria-checked"), false); assert.equal(prop(verify(), "aria-disabled"), false);
    const key = (value) => f.emit(verify(), "onKeydown", { key: value, preventDefault() {}, stopPropagation() {} });
    await key(" "); assert.equal(f.state.accept_delete, true); assert.equal(prop(verify(), "aria-checked"), true);
    await key("Enter"); assert.equal(f.state.accept_delete, false);
    await key(" "); assert.equal(f.state.accept_delete, true);
    await f.click(f.action("deleteCategoryDialog")); assert.equal(f.calls.confirmations.length, 1);
    await f.tab("setting");
    assert.equal(f.state.accept_delete, false);
    f.calls.confirmations[0][3](); await settle();
    assert.equal(f.calls.requests.length, 0, "A stale final confirmation cannot delete from another tab");
    await f.tab("critical"); f.state.critical_open = true; f.state.accept_delete = true; await settle();
    await f.emit(f.nodes("details")[0], "onToggle", { target: { open: false } });
    assert.equal(f.state.accept_delete, false);
    f.state.critical_open = true; f.state.accept_delete = true; await settle();
    await f.click(f.action("deleteCategoryDialog")); f.calls.confirmations[1][3](); await settle();
    const request = f.calls.requests[0]; assert.equal(request.method, "delete");
    assert.equal(request.url, vendor ? "/fixture/vendors/7/categories/31" : "/fixture/shops/19/categories/31"); assert.equal(f.state.busy_delete, true);
    assert.equal(prop(verify(), "disabled"), true); assert.equal(prop(verify(), "aria-disabled"), true);
    await key("Enter"); await key(" ");
    assert.equal(f.state.accept_delete, true, "Busy verification cannot toggle through either keyboard action");
    request.resolve({ data: { id: 31 } }); await settle();
    assert.equal(f.state.busy_delete, false); assert.deepEqual(f.calls.emitted, [["delete", 31], ["back"]]);
  }
});

test("changing the edited category resets routine drafts and critical consent", async (t) => {
  const f = await fixture(t);
  await f.tab("critical"); f.state.critical_open = true; f.state.accept_delete = true; await settle();
  f.props.category = { ...savedCategory(), id: 92, title: "Next category", name: "next-category" }; await settle();
  assert.equal(f.state.title, "Next category"); assert.equal(f.state.name, "next-category"); assert.equal(f.state.tab, "setting"); assert.equal(f.state.accept_delete, false); assert.equal(f.state.critical_open, false);
  assert.deepEqual(f.calls.requests, []); assert.deepEqual(f.calls.emitted, []);
});

test("a final confirmation for a previous category cannot delete after the next category is verified", async (t) => {
  const f = await fixture(t);
  await f.tab("critical"); f.state.critical_open = true; f.state.accept_delete = true; await settle();
  await f.click(f.action("deleteCategoryDialog"));
  f.props.category = { ...savedCategory(), id: 92, title: "Next category", name: "next-category" }; await settle();
  await f.tab("critical"); f.state.critical_open = true; f.state.accept_delete = true; await settle();
  f.calls.confirmations[0][3](); await settle();
  assert.deepEqual(f.calls.requests, []); assert.deepEqual(f.calls.emitted, []);
});

test("Persian rendering preserves localized labels, RTL context and long mixed-direction drafts", async (t) => {
  const title = "دسته‌بندی محصولات اتاق کودک Holiar";
  const description = "توضیحات کامل محصولات برای مشتریان فارسی‌زبان. ".repeat(12);
  const category = { ...savedCategory(), title, description, name: "long-category-name" };
  const f = await fixture(t, { category, hideTopBar: true, language: "fa" });
  assert.equal(f.state.$vuetify.locale.isRtl, true);
  assert.ok(f.nodes("h2").some((node) => node.text === persian.add_category.modern.details_title));
  const field = f.nodes("v-text-field").find((node) => prop(node, "label") === persian.add_category.title_input);
  assert.equal(prop(field, "modelValue"), title);
  assert.equal(prop(field, "placeholder"), persian.add_category.modern.title_placeholder);
  assert.equal(prop(f.nodes("v-textarea")[0], "modelValue"), description);
  const url = f.nodes("span").find((node) => node.props.dir === "ltr");
  assert.ok(url.text.includes("long-category-name-category"), "Mixed-direction URL stays explicitly LTR without changing its value");
  await f.tab("critical"); f.state.critical_open = true; await settle();
  assert.equal(prop(f.nodes("u-smart-verify")[0], "aria-label"), persian.add_category.critical_zone.accept_delete.true_title);
  await f.tab("setting");
  assert.equal(f.state.title, title); assert.equal(f.state.description, description);
  assert.deepEqual(f.calls.requests, []); assert.deepEqual(f.calls.emitted, []);
});
