import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const astNodes = (node) => [node, ...(node.children || []).flatMap(astNodes)];
function source(relative, getterNames) {
  const { descriptor, errors } = parse(readFileSync(new URL(relative, import.meta.url), "utf8")); assert.deepEqual(errors, []);
  const script = ts.createSourceFile(relative, descriptor.script.content, ts.ScriptTarget.Latest, true);
  const options = script.statements.find(ts.isExportAssignment).expression;
  const computed = options.properties.find((property) => property.name?.getText(script) === "computed").initializer;
  const getters = getterNames.map((name) => computed.properties.find((property) => property.name?.getText(script) === name).getText(script)).join(",");
  const exports = {}; vm.runInNewContext(transpile(`export default {${getters}}`), { exports, ShopPermissionRegions: { PRODUCTS: { code: "PRODUCTS" } }, VendorMemberTypes: { VendorMemberRegionCode: { PRODUCTS: "PRODUCTS" } } });
  return { ast: baseParse(descriptor.template.content), getters: exports.default };
}
const windowSource = source("./BProductsWindow.vue", ["IS_VENDOR_PANEL", "CAN_ADD_PRODUCT", "current_filter", "current_engine"]);
const panelSource = source("../panel/BProductsPanel.vue", ["CAN_ADD_PRODUCT"]);
const row = astNodes(windowSource.ast).find((node) => node.tag === "v-row" && node.props.some((prop) => prop.name === "class" && prop.value?.content.includes("b-products-window__tool-row")));
const importer = astNodes(panelSource.ast).find((node) => node.tag === "template" && node.props.some((prop) => prop.name === "slot" && prop.arg?.content === "append-products"));
assert.ok(row); assert.ok(importer);
const compileFragment = (source) => new Function("Vue", compile(source, { mode: "function", prefixIdentifiers: true }).code)({
  ...Vue, resolveComponent: (name) => ({ name }),
  renderSlot: (slots, name) => Vue.h(Vue.Fragment, null, slots[name]?.() || []),
});
const renderTools = compileFragment(row.loc.source), renderImporter = compileFragment(`<b-products-window>${importer.loc.source}</b-products-window>`);
const packs = Object.fromEntries(["en", "fa"].map((language) => {
  const load = (kind) => { const exports = {}; new Function("exports", "require", transpile(readFileSync(new URL(`../../../../translate/${kind}/${language}.ts`, import.meta.url), "utf8")))(exports, () => ({ default: {} })); return exports.default; };
  return [language, { ...load("dashboard"), global: load("global") }];
}));
const titleHelper = Object.getOwnPropertyDescriptor(String.prototype, "limitWords");
Object.defineProperty(String.prototype, "limitWords", { configurable: true, value(count) { return this.split(" ").slice(0, count).join(" "); } });
after(() => titleHelper ? Object.defineProperty(String.prototype, "limitWords", titleHelper) : delete String.prototype.limitWords);
function nodes(node, name) {
  if (Array.isArray(node)) return node.flatMap((child) => nodes(child, name));
  if (!node || typeof node !== "object") return [];
  const children = Array.isArray(node.children) ? node.children : typeof node.children?.default === "function" ? node.children.default() : [];
  return [...(name === undefined || node.type === name || node.type?.name === name ? [node] : []), ...nodes(children, name)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join(" "); if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return ""; return text(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
const prop = (node, name) => node.props?.[name] ?? node.props?.[name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
const enabled = (value) => value === true || value === "";
const classed = (node, name) => String(prop(node, "class") || "").split(/\s+/).includes(name);
const category = (icon = "category.png") => ({ id: 7, title: "Full category scope with several words", icon });
function fixture({ modern = true, vendor = false, write = true, vendorProducts = true, vendorWrite = true, parent = null, filters = { saved: true }, engine = { categories: [9], tags: ["featured"] }, count = 2, language = "en", search = null, busy = false, add = true } = {}) {
  const calls = { clear: [], emitted: [], images: [] };
  const state = { modern, mini: true, addProductButton: add, search, busy_fetch: busy, products: Array.from({ length: count }, (_, index) => ({ id: index + 1, icon: `product-${index}.png` })),
    parent_folders: parent ? { ...parent, filters, engine } : null,
    shop: { id: 19, title: "Fixture Store", filters, engine, marketplace: { product: vendorProducts } }, vendor: vendor ? { id: 3 } : null,
    $route: { params: vendor ? { vendor_id: 3 } : {}, matched: vendor ? [{ meta: { vendor: true } }] : [] },
    writeShopAccess: () => write, writeVendorAccess: () => vendorWrite, IMAGE_SIZE_SMALL: 64, busy_clear_root_filter: false,
    dialog_root_filter: false, dialog_root_engine: false, dialog_sample: false,
    $t(key, parameters = {}) { const value = key.split(".").reduce((object, part) => object?.[part], packs[language]); assert.equal(typeof value, "string", `Missing ${language}: ${key}`); return value.replace(/\{(\w+)\}/g, (all, name) => parameters[name] ?? all); },
    getShopImagePath(icon, size) { calls.images.push([icon, size]); return `/fixture-images/${icon}?size=${size}`; },
    showClearRootFiltersDialog(target) { calls.clear.push(target); }, $emit: (...args) => calls.emitted.push(args),
  };
  for (const [name, getter] of Object.entries(windowSource.getters)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  const panel = Object.create(state); Object.defineProperty(panel, "CAN_ADD_PRODUCT", { get: () => panelSource.getters.CAN_ADD_PRODUCT.call(panel) });
  const importView = () => renderImporter(panel, []).children?.["append-products"]?.() || [];
  state.$slots = { "append-products": importView };
  const view = () => { const tree = renderTools(state, []); return { tree,
    filter: nodes(tree, "v-col").find((node) => node.key === "root-filters"), engine: nodes(tree, "v-col").find((node) => node.key === "engine"), importer: nodes(tree, "v-col").find((node) => node.key === "importer") }; };
  const action = (tree, method) => nodes(tree, "v-btn").find((node) => String(prop(node, "onClick")).includes(method));
  return { state, panel, calls, view, action };
}

test("modern filter and engine labels stay short while avatars and accessible scope retain the full target", () => {
  for (const language of ["en", "fa"]) for (const parent of [null, category(), category(null)]) {
    const f = fixture({ parent, language }), view = f.view();
    for (const [button, key, scope] of [
      [f.action(view.filter, "dialog_root_filter"), "edit_filters", parent ? f.state.$t("products_select.modern.edit_category_filter", { category: parent.title }) : f.state.$t("products_select.filter_box.edit_action")],
      [f.action(view.filter, "showClearRootFiltersDialog"), "clear_filters", parent ? f.state.$t("products_select.modern.clear_category_filter", { category: parent.title }) : f.state.$t("products_select.filter_box.clear_action")],
      [f.action(view.engine, "dialog_root_engine"), "edit_engine", f.state.$t("products_select.engine.action", { category: parent?.title || f.state.$t("global.commons.root") })],
    ]) {
      assert.ok(button); const label = nodes(button, "span").find((node) => classed(node, "b-products-window__action-label"));
      assert.equal(text(label), f.state.$t(`products_select.modern.${key}`)); assert.equal(prop(button, "aria-label"), scope);
      const avatar = nodes(button, "v-avatar")[0]; assert.equal(Number(prop(avatar, "size")), 20); assert.ok(enabled(prop(avatar, "aria-hidden")) || prop(avatar, "aria-hidden") === "true");
      if (parent?.icon) assert.equal(prop(nodes(avatar, "img")[0], "src"), `/fixture-images/${parent.icon}?size=64`);
      else { assert.equal(nodes(avatar, "img").length, 0); assert.equal(text(nodes(avatar, "v-icon")[0]).trim(), parent ? "folder" : "home"); }
      const tooltip = nodes(button, "v-tooltip")[0]; assert.equal(prop(tooltip, "text"), parent?.title || f.state.$t("global.commons.root"));
      assert.equal(prop(tooltip, "location"), "top"); assert.ok(prop(tooltip, "contentClass").includes("sd-modern-tooltip")); assert.equal(prop(tooltip, "openOnFocus"), true);
    }
    f.action(view.filter, "dialog_root_filter").props.onClick(); assert.equal(f.state.dialog_root_filter, true);
    f.action(view.engine, "dialog_root_engine").props.onClick(); assert.equal(f.state.dialog_root_engine, true);
    f.action(view.filter, "showClearRootFiltersDialog").props.onClick(); assert.equal(f.calls.clear[0], f.state.parent_folders);
    f.state.busy_clear_root_filter = true; assert.equal(prop(f.action(f.view().filter, "showClearRootFiltersDialog"), "loading"), true);
    const preview = nodes(view.engine, "b-category-engine-preview")[0]; assert.deepEqual(plain(prop(preview, "engineCategories")), [9]); assert.deepEqual(plain(prop(preview, "engineTags")), ["featured"]);
  }
});

test("native filter visibility and whole-tools permission/search/loading guards are preserved", () => {
  for (const modern of [false, true]) {
    for (const denied of [{ write: false }, { vendor: true, vendorProducts: false }, { search: "query" }, { busy: true, count: 0 }, { add: false }]) assert.equal(nodes(fixture({ modern, ...denied }).view().tree, "v-row").length, 0);
    for (const [options, visible] of [[{ filters: null, engine: null, count: 1 }, false], [{ filters: {}, engine: null, count: 0 }, true], [{ filters: null, engine: null, count: 2 }, true], [{ filters: null, engine: { categories: [9] }, count: 0 }, true], [{ filters: null, engine: { tags: ["a"] }, count: 0 }, true]]) {
      const f = fixture({ modern, ...options }), view = f.view(); assert.equal(Boolean(view.filter), visible);
      if (visible) assert.equal(Boolean(f.action(view.filter, "showClearRootFiltersDialog")), Boolean(options.filters));
    }
  }
});

test("legacy labels and vendor-specific managed-engine behavior keep their original branches", () => {
  for (const parent of [null, category()]) {
    const f = fixture({ modern: false, parent }), view = f.view(); const edit = f.action(view.filter, "dialog_root_filter"), clear = f.action(view.filter, "showClearRootFiltersDialog"), engine = f.action(view.engine, "dialog_root_engine");
    assert.ok(text(edit).includes(parent ? "Edit Full Filter" : f.state.$t("products_select.filter_box.edit_action")));
    assert.ok(text(clear).includes(parent ? "Clear Category Filter" : f.state.$t("products_select.filter_box.clear_action")));
    assert.ok(text(engine).includes(f.state.$t("products_select.engine.action", { category: parent ? "Full" : f.state.$t("global.commons.root") })));
    for (const button of [edit, clear, engine]) { assert.equal(prop(button, "aria-label"), undefined); assert.equal(nodes(button, "v-avatar").length, 0); }
  }
  const modern = fixture({ vendor: true }).view(); assert.equal(modern.filter, undefined); assert.equal(nodes(modern.engine, "v-btn").filter((node) => enabled(prop(node, "disabled"))).length, 1);
  assert.equal(nodes(modern.engine, "v-btn").some((node) => String(prop(node, "onClick")).includes("dialog_root_engine")), false);
  const legacy = fixture({ vendor: true, modern: false }); assert.equal(legacy.view().filter, undefined); assert.ok(legacy.action(legacy.view().engine, "dialog_root_engine"));
});

test("import sample, Or and Select file retain native order, routes and vendor restrictions", () => {
  for (const modern of [false, true]) for (const vendor of [false, true]) for (const language of ["en", "fa"]) {
    const f = fixture({ modern, vendor, language }), importer = f.view().importer; assert.ok(importer);
    const all = nodes(importer), buttons = all.filter((node) => node.type?.name === "v-btn"), sample = buttons.find((node) => String(prop(node, "onClick")).includes("dialog_sample")), select = buttons.find((node) => prop(node, "to"));
    assert.deepEqual(plain(prop(select, "to")), { name: vendor ? "VendorProducts_Importer" : "BPageShopProductsImporter" }); assert.ok(enabled(prop(select, "exact")));
    const or = all.find((node) => node.type === "small" && text(node).trim() === f.state.$t("global.commons.or"));
    if (modern && vendor) assert.equal(or, undefined);
    else if (modern) assert.ok(all.indexOf(sample) < all.indexOf(or) && all.indexOf(or) < all.indexOf(select));
    else assert.ok(all.indexOf(or) < all.indexOf(select) && all.indexOf(select) < all.indexOf(sample));
    sample.props.onClick(); assert.equal(f.panel.dialog_sample, true); assert.ok(text(sample).includes(f.state.$t("product_panel.excel_import.download_sample")));
  }
  assert.equal(fixture({ vendor: true, vendorWrite: false }).view().importer, undefined);
  assert.equal(fixture({ vendor: true, vendorProducts: false }).view().importer, undefined);
});
