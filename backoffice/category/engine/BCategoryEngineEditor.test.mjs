import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";

const transpile = (source) => ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const enabled = (value) => value === true || value === "";
const prop = (node, name) => node.props[name] ?? node.props[name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
function source(relative) {
  const file = new URL(relative, import.meta.url), { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "engine-test" });
  const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "engine-test", compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  return { file, descriptor, script, template };
}
const editorSource = source("./BCategoryEngineEditor.vue"), explanationSource = source("./preview/BCategoryEngineExplanation.vue");
const windowSource = parse(readFileSync(new URL("../../product/window/BProductsWindow.vue", import.meta.url), "utf8"));
assert.deepEqual(windowSource.errors, []);
const astNodes = (node) => [node, ...(node.children || []).flatMap(astNodes)];
const engineDialog = astNodes(baseParse(windowSource.descriptor.template.content)).find((node) => node.tag === "v-dialog" && node.props.some((prop) => prop.name === "model" && prop.exp?.content === "dialog_root_engine"));
assert.ok(engineDialog, "Use the actual catalog host's guarded engine dialog");
const renderEngineDialog = new Function("Vue", compile(engineDialog.loc.source, { mode: "function", prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: (name) => ({ name }) });
function dialogEditor(node) {
  if (Array.isArray(node)) return node.map(dialogEditor).find(Boolean);
  if (!node || typeof node !== "object") return undefined;
  if (node.type?.name === "b-category-engine-editor") return node.props;
  return dialogEditor(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
const packs = Object.fromEntries(["en", "fa"].map((language) => {
  const load = (relative) => {
    const exports = {}, code = readFileSync(new URL(`../../../../translate/${relative}.ts`, import.meta.url), "utf8");
    assert.deepEqual(ts.createSourceFile(relative, code, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
    new Function("exports", "require", transpile(code).outputText)(exports, (name) => ({ default: load(`global/colors/${name.split("/").at(-1)}`) }));
    return exports.default;
  };
  return [language, { ...load(`dashboard/${language}`), global: load(`global/${language}`) }];
}));
const element = (type, text = "") => ({ type, text, props: {}, style: {}, children: [], parent: null });
const remove = (node) => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; };
const renderer = Vue.createRenderer({
  createElement: (type) => element(type), createText: (text) => element("text", text), createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) { remove(node); const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, node); node.parent = parent; },
  remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; }, parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const stub = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(name, attrs, [slots.label?.(), slots.default?.()]) });
const descendants = (node) => [node, ...node.children.flatMap(descendants)];
const text = (node) => node.type === "comment" ? "" : node.text + node.children.map(text).join(" ");
const hasClass = (node, name) => String(node.props.class || "").split(/\s+/).includes(name);
const saved = () => ({ categories: [11, 23], tags: ["featured", "summer"] });

async function fixture(t, { modern = true, embedded = false, vendor = false, categoryId = 31, language = "en", engine = saved(), cache = ["featured", "summer"], catalogHost = false } = {}) {
  const calls = { requests: [], notifications: [], emitted: [], cache: [], translations: [], images: [], errors: [], warnings: [] };
  let explanation;
  const context = vm.createContext({ exports: {}, console, window: { API: {
    PUT_CATEGORY_SET_ENGINE: (shop, category) => `/fixture/${shop}/categories/${category}/engine`,
    GET_CATEGORY_ALL_SUB_CATEGORIES: (shop, category) => `/fixture/${shop}/categories/${category}/descendants`,
  } }, axios: Object.fromEntries(["get", "put"].map((method) => [method, (url, body) => new Promise((resolve, reject) => calls.requests.push({ method, url, body: body && plain(body), resolve, reject }))])),
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("BackofficeLocalStorages")) return { BackofficeLocalStorages: { GetProductCachedTags: (path) => { calls.cache.push(path); return cache; } } };
      if (name.includes("NotificationService")) return { default: Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map((method) => [method, (...args) => calls.notifications.push({ method, args })])) };
      if (name.endsWith("BCategoryEngineExplanation.vue")) return { default: explanation };
      if (name.endsWith("ObjectPrototypes")) return {};
      if (name.endsWith(".vue")) return { default: stub(name.split("/").at(-1).replace(".vue", "").replace(/([A-Z])/g, "-$1").replace(/^-/, "").toLowerCase()) };
      throw new Error(`Unexpected engine dependency: ${name}`);
    } });
  const run = (code) => vm.runInContext(`(() => {${transpile(code).outputText}\n})()`, context);
  const intoRealm = (value) => { context.fixtureJson = JSON.stringify(value); return vm.runInContext("JSON.parse(fixtureJson)", context); };
  // Match the app's native unique()/limit() behavior without changing Node's global Array prototype.
  run(readFileSync(new URL("../../../../core-js/prototypes/ArrayPrototypes.ts", import.meta.url), "utf8"));
  const load = (sfc) => { context.exports = {}; run(sfc.script.content); const component = context.exports.default; context.exports = {}; run(sfc.template.code); return { ...component, render: context.exports.render }; };
  explanation = load(explanationSource);
  const component = load(editorSource);
  let state;
  const compiled = { ...component, render(...args) { state = this; return component.render.apply(this, args); } };
  const props = Vue.reactive({ modern, embedded, shop: { id: 19, title: "Fixture Store", products_count: 987654 }, category: intoRealm({ id: categoryId, title: "Fixture Category", engine, products_count: 987654 }) });
  const translate = (key, parameters = {}) => {
    calls.translations.push(key);
    const value = key.split(".").reduce((object, part) => object?.[part], packs[language]);
    assert.equal(typeof value, "string", `Missing ${language} copy: ${key}`);
    return value.replace(/\{(\w+)\}/g, (all, name) => parameters[name] ?? all);
  };
  let host;
  if (catalogHost) {
    props.shop.engine = props.category.engine; props.shop.filters = { original: "shop" }; props.category.filters = { original: "category" };
    const state = { modern, IS_VENDOR_PANEL: vendor, dialog_root_engine: true, shop: props.shop, parent_folders: categoryId === "root" ? null : props.category, $t: translate, getShopImagePath: (icon) => `/fixture-images/${icon}` };
    host = { state, editor: dialogEditor(renderEngineDialog(state, [])) };
  }
  const app = renderer.createApp({ render: () => Vue.h(compiled, { ...props,
    "onEdit-engine": (value) => { calls.emitted.push(["edit-engine", plain(value)]); if (host?.editor) host.editor.onEditEngine(value); else props.category.engine = value; },
    "onEdit-filters": (value) => { calls.emitted.push(["edit-filters", plain(value)]); host?.editor?.onEditFilters(value); },
    onCancel: () => { calls.emitted.push(["cancel"]); host?.editor?.onCancel(); },
  }) });
  Object.assign(app.config.globalProperties, { $t: translate, $route: { params: { shop_id: 19, ...(vendor ? { vendor_id: 7 } : {}) }, matched: vendor ? [{ meta: { vendor: true } }] : [] },
    $localstorage_base_path: () => "fixture-store", resetToDefault() { Object.assign(this, this.$options.data.call(this)); },
    getShopImagePath(icon, size) { calls.images.push([icon, size]); return `/fixture-images/${icon}?size=${size}`; } });
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  for (const sfc of [editorSource, explanationSource]) for (const match of sfc.template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) app.component(match[1], stub(match[1]));
  const root = element("root"); app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const nodes = (name) => descendants(root).filter((node) => node.type === name);
  const action = (method) => nodes("v-btn").find((node) => node.props.onClick === state[method] || String(node.props.onClick).includes(method));
  const emit = async (node, event, value) => { for (const handler of [node.props[event]].flat()) { assert.equal(typeof handler, "function"); handler(value); } await settle(); };
  const click = async (node) => { assert.ok(node, "Native action exists"); assert.ok(!enabled(prop(node, "disabled")), "Native action is enabled"); await emit(node, "onClick", { preventDefault() {}, stopPropagation() {} }); };
  const changeCategories = async (value) => { await emit(nodes("b-category-input")[0], "onUpdate:modelValue", intoRealm(value)); await emit(nodes("b-category-input")[0], "onChange"); };
  const changeTags = (value) => emit(nodes("v-combobox")[0], "onUpdate:modelValue", intoRealm(value));
  return { get state() { return state; }, props, calls, root, host, nodes, action, emit, click, changeCategories, changeTags, translate, intoRealm,
    classNodes: (name) => descendants(root).filter((node) => hasClass(node, name)) };
}

test("modern drafts keep native category/tag controls and cached suggestions without writes", async (t) => {
  const f = await fixture(t), category = f.nodes("b-category-input")[0], tags = f.nodes("v-combobox")[0];
  assert.notEqual(f.state.engine_categories, f.props.category.engine.categories);
  assert.notEqual(f.state.engine_tags, f.props.category.engine.tags);
  assert.deepEqual(f.calls.cache, ["fixture-store"]); assert.deepEqual(plain(prop(tags, "items")), ["featured", "summer"]);
  for (const node of [category, tags]) { assert.equal(prop(node, "counter"), 32); for (const flag of ["clearable", "multiple", "persistentPlaceholder"]) assert.ok(enabled(prop(node, flag))); }
  for (const flag of ["chips", "closableChips"]) assert.ok(enabled(prop(tags, flag)));
  assert.equal(prop(tags, "variant"), "underlined");
  assert.ok(enabled(prop(f.action("saveEngine"), "disabled")));
  await f.changeCategories([42]); await f.changeTags(["new tag"]);
  assert.deepEqual(plain(f.props.category.engine), saved()); assert.equal(f.state.engine_changed, true);
  assert.deepEqual(f.calls.requests, []); assert.deepEqual(f.calls.emitted, []);
});

test("Cancel and category changes restore saved modern arrays rather than draft aliases", async (t) => {
  const f = await fixture(t); await f.changeCategories([42]); await f.changeTags(["draft"]); await f.click(f.action("cancelEngine"));
  assert.deepEqual(plain(f.state.engine_categories), saved().categories); assert.deepEqual(plain(f.state.engine_tags), saved().tags);
  assert.equal(f.state.engine_changed, false); assert.deepEqual(f.calls.emitted, [["cancel"]]); assert.equal(f.calls.requests.length, 0);
  f.props.category = f.intoRealm({ id: 99, title: "Next category", engine: { categories: [9], tags: ["next"] } }); await settle();
  assert.deepEqual(plain(f.state.engine_categories), [9]); assert.deepEqual(plain(f.state.engine_tags), ["next"]);
  assert.notEqual(f.state.engine_categories, f.props.category.engine.categories);
  for (const engine of [null, { categories: null, tags: null }]) {
    const empty = await fixture(t, { engine }); assert.deepEqual(plain(empty.state.engine_categories), []); assert.deepEqual(plain(empty.state.engine_tags), []);
    await empty.click(empty.action("cancelEngine")); assert.equal(empty.state.matchingRule, "none"); assert.equal(empty.calls.requests.length, 0);
  }
});

test("four matching rules and null clear render accurate EN/FA guidance without a mode control", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language });
    for (const [categories, tags, rule] of [[[1], ["a"], "combined"], [[1], [], "categories"], [[], ["a"], "tags"], [[], [], "none"], [null, null, "none"]]) {
      await f.changeCategories(categories); await f.changeTags(tags);
      assert.equal(f.state.matchingRule, rule);
      assert.ok(text(f.classNodes("b-category-engine-editor__matching")[0]).includes(f.translate(`category_engine_editor.matching.${rule}`)));
      const added = f.classNodes("b-category-engine-explanation__group--added")[0];
      assert.equal(descendants(added).filter((node) => hasClass(node, "b-category-engine-explanation__item")).length, rule === "none" ? 0 : 3);
    }
    assert.equal(f.nodes("v-select").length + f.nodes("v-radio-group").length + f.nodes("v-btn-toggle").length, 0);
    assert.equal(f.calls.requests.length, 0);
  }
  assert.match(packs.en.category_engine_editor.matching.combined, /\(OR\).*\(AND\)/);
  assert.match(packs.en.category_engine_editor.matching.categories, /\(OR\)/); assert.match(packs.en.category_engine_editor.matching.tags, /\(AND\)/);
});

test("Save preserves exact native PUT, both result events, loading and open editor", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId }); await f.changeCategories([5, 8]); await f.changeTags(["one", "two"]); await f.click(f.action("saveEngine"));
    const request = f.calls.requests[0]; assert.equal(request.method, "put"); assert.equal(request.url, `/fixture/19/categories/${categoryId}/engine`);
    assert.deepEqual(request.body, { categories: [5, 8], tags: ["one", "two"] }); assert.equal(f.state.busy_engine, true); assert.equal(prop(f.action("saveEngine"), "loading"), true);
    assert.ok(enabled(prop(f.action("cancelEngine"), "disabled"))); assert.deepEqual(plain(f.props.category.engine), saved());
    const engine = { categories: [5, 8], tags: ["one", "two"] }, filters = { brands: ["Fixture"] };
    request.resolve({ data: { engine, filters } }); await settle();
    assert.deepEqual(f.calls.emitted, [["edit-engine", engine], ["edit-filters", filters]]);
    assert.equal(f.state.busy_engine, false); assert.equal(f.state.engine_changed, false); assert.equal(f.calls.notifications.at(-1).method, "showSuccessAlert");
    assert.equal(f.classNodes("b-category-engine-editor__matching").length, 1, "Successful save leaves editor mounted");
    await f.changeTags(["later draft"]); await f.click(f.action("cancelEngine")); assert.deepEqual(plain(f.state.engine_tags), engine.tags);
  }
});

test("embedded category engine keeps one inline Save with localized scope and no Cancel or fixed footer", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { embedded: true, language });
    const fields = f.classNodes("b-category-engine-editor__fields")[0];
    const footer = f.classNodes("b-category-engine-editor__inline-actions")[0];
    assert.ok(descendants(fields).includes(footer), "Save belongs to its editable settings card");
    assert.ok(text(footer).includes(f.translate("category_engine_editor.save_scope")));
    assert.equal(descendants(footer).filter((node) => node.type === "v-btn").length, 1);
    assert.equal(f.action("cancelEngine"), undefined);
    assert.equal(f.nodes("s-widget-buttons").length, 0, "The embedded editor does not install a fixed action bar");
    assert.ok(enabled(prop(f.action("saveEngine"), "disabled")));
    assert.deepEqual(f.calls.requests, []);
  }
  const vendor = await fixture(t, { embedded: true, vendor: true });
  await vendor.changeTags(["draft"]);
  assert.ok(enabled(prop(vendor.action("saveEngine"), "disabled")), "Embedded mode keeps the existing vendor restriction");
  assert.deepEqual(vendor.calls.requests, []);
});

test("embedded Save uses only the engine endpoint, stays open and keeps failed drafts", async (t) => {
  for (const outcome of ["success", "application-error", "network-error"]) {
    const f = await fixture(t, { embedded: true });
    await f.changeCategories([5, 8]); await f.changeTags(["engine draft"]);
    await f.click(f.action("saveEngine"));
    f.state.saveEngine();
    assert.equal(f.calls.requests.length, 1, "A pending save cannot submit twice");
    const request = f.calls.requests[0];
    assert.equal(request.method, "put"); assert.equal(request.url, "/fixture/19/categories/31/engine");
    assert.deepEqual(request.body, { categories: [5, 8], tags: ["engine draft"] });
    assert.ok(enabled(prop(f.action("saveEngine"), "disabled")));
    assert.equal(prop(f.action("saveEngine"), "loading"), true);
    const engine = { categories: [5, 8], tags: ["engine draft"] }, filters = { brands: ["Saved output"] };
    if (outcome === "success") request.resolve({ data: { engine, filters } });
    else if (outcome === "application-error") request.resolve({ data: { error: true, error_msg: "Fixture denied" } });
    else request.reject(new Error("Fixture network failure"));
    await settle();
    assert.equal(f.state.busy_engine, false);
    assert.equal(f.classNodes("b-category-engine-editor__inline-actions").length, 1, "The embedded editor remains mounted after completion");
    assert.equal(f.action("cancelEngine"), undefined); assert.equal(f.nodes("s-widget-buttons").length, 0);
    if (outcome === "success") {
      assert.deepEqual(f.calls.emitted, [["edit-engine", engine], ["edit-filters", filters]]);
      assert.deepEqual(plain(f.props.category.engine), engine); assert.equal(f.state.engine_changed, false);
    } else {
      assert.deepEqual(f.calls.emitted, []); assert.deepEqual(plain(f.props.category.engine), saved());
      assert.deepEqual(plain(f.state.engine_categories), [5, 8]); assert.deepEqual(plain(f.state.engine_tags), ["engine draft"]);
      assert.equal(f.state.engine_changed, true);
    }
  }
});

test("catalog Save closes only on success and preserves both engine and filter results", async (t) => {
  for (const modern of [false, true]) for (const categoryId of [31, "root"]) for (const outcome of ["success", "application-error", "network-error"]) {
    const f = await fixture(t, { modern, categoryId, catalogHost: true }), target = categoryId === "root" ? f.props.shop : f.props.category;
    assert.equal(f.host.editor.category.id, categoryId);
    const original = plain({ engine: target.engine, filters: target.filters });
    await f.changeCategories([4, 8]); await f.changeTags(["draft"]); await f.click(f.action("saveEngine"));
    assert.equal(f.host.state.dialog_root_engine, true, "Pending Save keeps the dialog open");
    assert.deepEqual(plain({ engine: target.engine, filters: target.filters }), original);
    const engine = { categories: [4, 8], tags: ["draft"] }, filters = { brands: ["Saved result"] };
    if (outcome === "success") f.calls.requests[0].resolve({ data: { engine, filters } });
    else if (outcome === "application-error") f.calls.requests[0].resolve({ data: { error: true, error_msg: "Fixture denied" } });
    else f.calls.requests[0].reject(new Error("Fixture network failure"));
    await settle(); assert.equal(f.state.busy_engine, false);
    if (outcome === "success") {
      assert.equal(f.host.state.dialog_root_engine, false);
      assert.deepEqual(plain(target.engine), engine); assert.deepEqual(plain(target.filters), filters);
      assert.deepEqual(f.calls.emitted, [["edit-engine", engine], ["edit-filters", filters]], "The synchronous filter event still reaches the host after closing");
    } else {
      assert.equal(f.host.state.dialog_root_engine, true); assert.deepEqual(plain({ engine: target.engine, filters: target.filters }), original);
      assert.deepEqual(plain(f.state.engine_tags), ["draft"]); assert.deepEqual(f.calls.emitted, []);
    }
  }
});

test("catalog Cancel still resets the draft and closes, while the vendor host remains unavailable", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId, catalogHost: true }); await f.changeTags(["unsaved"]); await f.click(f.action("cancelEngine"));
    assert.equal(f.host.state.dialog_root_engine, false); assert.deepEqual(plain(f.state.engine_tags), saved().tags); assert.deepEqual(f.calls.requests, []);
  }
  const vendor = await fixture(t, { vendor: true, catalogHost: true }); assert.equal(vendor.host.editor, undefined); assert.deepEqual(vendor.calls.requests, []);
});

test("application and network save errors keep the attempted draft without result events", async (t) => {
  for (const network of [false, true]) {
    const f = await fixture(t); await f.changeCategories([4]); await f.changeTags(["draft"]); await f.click(f.action("saveEngine"));
    if (network) f.calls.requests[0].reject(new Error("Fixture failure")); else f.calls.requests[0].resolve({ data: { error: true, error_msg: "Fixture denied" } });
    await settle(); assert.equal(f.state.busy_engine, false); assert.equal(f.state.engine_changed, true);
    assert.deepEqual(plain(f.state.engine_categories), [4]); assert.deepEqual(plain(f.state.engine_tags), ["draft"]); assert.deepEqual(plain(f.props.category.engine), saved());
    assert.deepEqual(f.calls.emitted, []); assert.equal(f.calls.notifications.at(-1).method, network ? "showLaravelError" : "showErrorAlert");
  }
});

test("Auto add descendants keeps the first 32 unique categories in a local draft", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId, engine: { categories: [5, 7], tags: [] } }); await f.click(f.action("autoAddSubCategories"));
    const request = f.calls.requests[0]; assert.equal(request.method, "get"); assert.equal(request.url, `/fixture/19/categories/${categoryId}/descendants`);
    assert.equal(f.state.busy_auto, true); assert.equal(prop(f.action("autoAddSubCategories"), "loading"), true);
    assert.ok(enabled(prop(f.action("cancelEngine"), "disabled")));
    const ids = [7, ...Array.from({ length: 40 }, (_, index) => index + 1)]; request.resolve({ data: { ids } }); await settle();
    assert.deepEqual(plain(f.state.engine_categories), [...new Set([5, 7, ...ids])].slice(0, 32));
    assert.deepEqual(plain(f.props.category.engine.categories), [5, 7]); assert.equal(f.state.engine_changed, true); assert.equal(f.state.busy_auto, false);
    assert.deepEqual(f.calls.emitted, []); assert.equal(f.calls.requests.length, 1);
  }
});

test("Auto add errors release loading and preserve draft; vendor Save stays disabled", async (t) => {
  for (const network of [false, true]) {
    const f = await fixture(t); await f.click(f.action("autoAddSubCategories"));
    if (network) f.calls.requests[0].reject(new Error("Fixture descendants failure")); else f.calls.requests[0].resolve({ data: { error: true, error_msg: "Fixture denied" } });
    await settle(); assert.equal(f.state.busy_auto, false); assert.equal(f.state.engine_changed, false); assert.deepEqual(plain(f.state.engine_categories), saved().categories);
    assert.equal(f.calls.notifications.at(-1).method, network ? "showLaravelError" : "showErrorAlert"); assert.deepEqual(f.calls.emitted, []);
  }
  const vendor = await fixture(t, { vendor: true }); await vendor.changeTags(["draft"]);
  assert.ok(enabled(prop(vendor.action("saveEngine"), "disabled"))); assert.equal(vendor.calls.requests.length, 0);
  vendor.state.saveEngine(); assert.equal(vendor.calls.requests[0].url, null, "Existing direct-call vendor branch never chooses the shop endpoint");
  vendor.calls.requests[0].resolve({ data: { error: true, error_msg: "Fixture vendor denial" } }); await settle();
});

test("legacy opt-out keeps original aliases, preview, conditional actions and cache fallback", async (t) => {
  const f = await fixture(t, { modern: false, cache: { invalid: true } });
  assert.equal(f.state.engine_categories, f.props.category.engine.categories); assert.equal(f.state.engine_tags, f.props.category.engine.tags);
  assert.deepEqual(plain(f.state.cache_tags), []); assert.equal(f.nodes("b-category-engine-preview").length, 1);
  assert.equal(f.nodes("figure").length, 0); assert.equal(f.action("cancelEngine"), undefined); assert.equal(f.action("saveEngine"), undefined);
  f.state.engine_categories.push(99); assert.ok(f.props.category.engine.categories.includes(99));
  await f.changeTags(["legacy"]); assert.equal(prop(f.action("saveEngine"), "size"), "x-large"); assert.equal(prop(f.action("autoAddSubCategories"), "variant"), "elevated");
  assert.equal(f.calls.requests.length, 0);
});

test("inert explanation distinguishes normal folders from three added product files", async (t) => {
  for (const language of ["en", "fa"]) for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { language, categoryId }); const figure = f.nodes("figure")[0]; assert.ok(figure);
    const location = f.classNodes("b-category-engine-explanation__location")[0]; assert.ok(text(location).includes("Fixture Store"));
    assert.ok(text(location).includes(categoryId === "root" ? f.translate("category_engine_editor.preview.root") : "Fixture Category"));
    assert.ok(descendants(location).some((node) => node.type === "v-icon" && text(node).trim() === (categoryId === "root" ? "home" : "folder")));
    f.props.shop.icon = "fixture-shop.png"; f.props.category.icon = "fixture-category.png"; await settle();
    const expectedIcon = categoryId === "root" ? "fixture-shop.png" : "fixture-category.png", image = descendants(location).find((node) => node.type === "img");
    assert.equal(prop(image, "src"), `/fixture-images/${expectedIcon}?size=64`); assert.deepEqual(f.calls.images.at(-1), [expectedIcon, 64]);
    const stage = f.classNodes("b-category-engine-explanation__stage")[0]; assert.ok(enabled(prop(stage, "aria-hidden")) || prop(stage, "aria-hidden") === "true");
    assert.ok(!descendants(stage).includes(image), "Real location identity remains outside the inert illustration");
    const kinds = (group) => descendants(group).filter((node) => hasClass(node, "b-category-engine-explanation__item")).map((node) => text(node.children.find((child) => child.type === "v-icon")).trim());
    const existing = descendants(stage).find((node) => prop(node, "data-engine-items") === "existing"), added = descendants(stage).find((node) => prop(node, "data-engine-items") === "added");
    assert.deepEqual(kinds(existing), ["folder", "folder", "note"]); assert.deepEqual(kinds(added), ["note", "note", "note"]);
    for (const group of [existing, added]) assert.equal(descendants(group).filter((node) => hasClass(node, "b-category-engine-explanation__more")).length, 1);
    assert.equal(descendants(stage).filter((node) => ["button", "a", "input", "v-btn", "v-select", "v-combobox"].includes(node.type) || node.props.tabindex >= 0).length, 0);
    assert.equal(descendants(stage).filter((node) => Object.keys(node.props).some((name) => /^on[A-Z]/.test(name))).length, 0);
    assert.ok(text(f.nodes("figcaption")[0]).includes(f.translate("category_engine_editor.preview.caption"))); assert.ok(!text(figure).includes("987654"));
    await f.changeCategories([]); await f.changeTags([]);
    assert.deepEqual(kinds(existing), ["folder", "folder", "note"]); assert.deepEqual(kinds(added), []);
    assert.ok(text(added).includes(f.translate("category_engine_editor.preview.choose_sources")));
    assert.ok(text(f.nodes("figcaption")[0]).includes(f.translate("category_engine_editor.preview.empty_caption"))); assert.equal(f.calls.requests.length, 0);
  }
});

test("both SFCs compile scoped TS/template/Sass and preserve EN/FA engine copy placeholders", async () => {
  const flatten = (object, prefix = "") => Object.entries(object).flatMap(([key, value]) => typeof value === "object" ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]);
  const en = Object.fromEntries(flatten(packs.en.category_engine_editor)), fa = Object.fromEntries(flatten(packs.fa.category_engine_editor));
  assert.deepEqual(Object.keys(en).sort(), Object.keys(fa).sort());
  for (const key of Object.keys(en)) { assert.ok(en[key].trim()); assert.ok(fa[key].trim()); assert.deepEqual([...en[key].matchAll(/\{\w+\}/g)].map(([value]) => value).sort(), [...fa[key].matchAll(/\{\w+\}/g)].map(([value]) => value).sort()); }
  for (const sfc of [editorSource, explanationSource]) {
    assert.deepEqual(ts.createSourceFile(sfc.file.pathname, sfc.script.content, ts.ScriptTarget.Latest, true).parseDiagnostics, []); assert.deepEqual(transpile(sfc.script.content).diagnostics, []);
    for (const style of sfc.descriptor.styles) { const result = await compileStyleAsync({ source: style.content, filename: sfc.file.pathname, id: "engine-test", scoped: style.scoped, preprocessLang: style.lang }); assert.deepEqual(result.errors, []); assert.ok(style.scoped); }
  }
});
