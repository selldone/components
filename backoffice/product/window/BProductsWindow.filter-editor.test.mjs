import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const evaluate = (code, globals = {}) => { const exports = {}; vm.runInNewContext(code, { exports, ...globals }); return exports; };
const { descriptor, errors } = parse(readFileSync(new URL("./BProductsWindow.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const script = ts.createSourceFile("window.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = script.statements.find(ts.isExportAssignment).expression;
const computed = options.properties.find((property) => property.name?.getText(script) === "computed").initializer;
const getters = ["IS_VENDOR_PANEL", "hierarchy_items"].map((name) => computed.properties.find((property) => property.name?.getText(script) === name).getText(script)).join(",");
const { BProductBreadcrumbsHelper } = evaluate(transpile(readFileSync(new URL("../breadcrumbs/helper/BProductBreadcrumbsHelper.ts", import.meta.url), "utf8")));
const component = evaluate(transpile(`export default {computed:{${getters}}}`), { BProductBreadcrumbsHelper }).default;
const walkAst = (node) => [node, ...(node.children || []).flatMap(walkAst)];
const fragment = walkAst(baseParse(descriptor.template.content)).find((node) => node.tag === "v-dialog" && node.props.some((prop) => prop.name === "model" && prop.exp?.content === "dialog_root_filter"));
assert.ok(fragment, "Compile the actual guarded filter dialog");
const render = new Function("Vue", compile(fragment.loc.source, { mode: "function", prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: (name) => ({ name }) });
const packs = Object.fromEntries(["en", "fa"].map((language) => {
  const load = (kind) => {
    const exports = {};
    new Function("exports", "require", transpile(readFileSync(new URL(`../../../../translate/${kind}/${language}.ts`, import.meta.url), "utf8")))(exports, () => ({ default: {} }));
    return exports.default;
  };
  return [language, { ...load("dashboard"), global: load("global") }];
}));
function nodes(node, name) {
  if (Array.isArray(node)) return node.flatMap((child) => nodes(child, name));
  if (!node || typeof node !== "object") return [];
  let children = Array.isArray(node.children) ? node.children : typeof node.children?.default === "function" ? node.children.default() : [];
  // Execute the actual native breadcrumb item slot for each real helper item.
  if (node.type?.name === "v-breadcrumbs") children = node.props.items.flatMap((item, index) => node.children.item({ item, index }));
  return [...(name === undefined || node.type === name || node.type?.name === name ? [node] : []), ...nodes(children, name)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join(" ");
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  return text(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
const prop = (node, name) => node.props?.[name] ?? node.props?.[name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
const enabled = (value) => value === true || value === "";
const deepCategory = () => ({ id: 44, title: "Current leaf", icon: "leaf.png", filters: { leaf: true }, parent: {
  id: 33, title: "Parent three", icon: "third.png", parent: { id: 22, title: "Parent two", icon: "second.png", parent: { id: 11, title: "Parent one", icon: "first.png" } },
} });
function fixture({ category = null, vendor = false, language = "en" } = {}) {
  const images = [];
  const state = { modern: true, dialogMode: false, dialog_root_filter: true, parent_folders: category,
    shop: { id: 19, title: "Fixture Store", icon: "shop.png", filters: { root: true } },
    $route: { params: vendor ? { vendor_id: 7 } : {}, matched: vendor ? [{ meta: { vendor: true } }] : [] },
    $t(key) { const value = key.split(".").reduce((object, part) => object?.[part], packs[language]); assert.equal(typeof value, "string", `Missing ${language}: ${key}`); return value; },
    getShopImagePath(icon, size) { images.push([icon, size]); return `/fixture-images/${icon}?size=${size}`; },
  };
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  const view = () => { const tree = render(state, []); return { tree, dialog: nodes(tree, "v-dialog")[0], header: nodes(tree, "v-card-title")[0], editor: nodes(tree, "b-category-filter-editor")[0] }; };
  return { state, images, view };
}

test("root and deep-category headers have one purpose title and a complete read-only native path", () => {
  for (const language of ["en", "fa"]) for (const category of [null, deepCategory()]) {
    const f = fixture({ category, language }), { header, editor } = f.view();
    assert.equal(nodes(header, "h2").length, 1);
    assert.equal(text(nodes(header, "h2")[0]), f.state.$t(`add_category.edit_filter.modern.${category ? "category_title" : "root_title"}`));
    const nav = nodes(header, "nav")[0], breadcrumbs = nodes(nav, "v-breadcrumbs")[0], items = nodes(nav, "v-breadcrumbs-item");
    assert.equal(prop(nav, "aria-label"), f.state.$t("add_category.edit_filter.modern.path_label")); assert.equal(prop(breadcrumbs, "tag"), "ol");
    const names = category ? ["Fixture Store", "Parent one", "Parent two", "Parent three", "Current leaf"] : ["Fixture Store"];
    const icons = category ? ["shop.png", "first.png", "second.png", "third.png", "leaf.png"] : ["shop.png"];
    assert.equal(items.length, names.length); assert.equal(breadcrumbs.props.items.length, names.length);
    items.forEach((item, index) => {
      assert.ok(text(item).includes(names[index])); assert.equal(Boolean(prop(item, "active")), index === items.length - 1);
      const dividers = nodes(item, "span").filter((node) => String(prop(node, "class") || "").split(/\s+/).includes("b-products-window__filter-divider"));
      assert.equal(dividers.length, index ? 1 : 0, "Each separator wraps together with its following identity");
      dividers.forEach((divider) => { assert.equal(text(divider), "/"); assert.equal(prop(divider, "aria-hidden"), "true"); });
      const avatar = nodes(item, "v-avatar")[0]; assert.equal(Number(prop(avatar, "size")), 32);
      assert.equal(prop(nodes(avatar, "img")[0], "src"), `/fixture-images/${icons[index]}?size=64`);
    });
    assert.equal(nodes(nav, "u-avatar-folder").length, 0);
    for (const node of nodes(nav)) {
      assert.equal(prop(node, "href"), undefined); assert.equal(prop(node, "to"), undefined);
      assert.ok(!Object.keys(node.props || {}).some((name) => /^on[A-Z]/.test(name)), "The displayed path cannot navigate or discard a draft");
    }
    assert.ok(enabled(prop(editor, "hideContext"))); assert.equal(f.state.dialog_root_filter, true);
  }
});

test("missing path icons use native fallbacks without losing any ancestor name", () => {
  const category = deepCategory(); category.parent.icon = null;
  const f = fixture({ category }); f.state.shop.icon = null;
  const items = nodes(f.view().header, "v-breadcrumbs-item");
  assert.ok(text(items[0]).includes("storefront")); assert.ok(text(items[0]).includes("Fixture Store"));
  assert.ok(text(items[3]).includes("folder")); assert.ok(text(items[3]).includes("Parent three"));
  assert.equal(items.length, 5); assert.equal(nodes(items[0], "img").length, 0); assert.equal(nodes(items[3], "img").length, 0);
});

test("filter target, saved result, Cancel, Close and native dialog updates keep their existing contract", () => {
  for (const category of [null, deepCategory()]) {
    const f = fixture({ category }), { dialog, header, editor } = f.view();
    assert.ok(enabled(prop(dialog, "fullscreen"))); assert.ok(enabled(prop(dialog, "scrollable"))); assert.equal(prop(dialog, "persistent"), undefined);
    assert.equal(editor.props.category.id, category ? 44 : "root"); assert.equal(editor.props.shop, f.state.shop);
    const filters = { saved: "current-target" }; editor.props.onEditFilters(filters);
    assert.equal(category ? f.state.parent_folders.filters : f.state.shop.filters, filters);
    assert.equal(f.state.dialog_root_filter, false, "Successful Save closes after updating the current target");
    editor.props.onCancel(); assert.equal(f.state.dialog_root_filter, false);
    f.state.dialog_root_filter = true; const close = nodes(header, "v-btn")[0];
    assert.equal(prop(close, "aria-label"), f.state.$t("global.actions.close")); close.props.onClick(); assert.equal(f.state.dialog_root_filter, false);
    f.state.dialog_root_filter = true; dialog.props["onUpdate:modelValue"](false); assert.equal(f.state.dialog_root_filter, false);
    assert.equal(category ? f.state.parent_folders.filters : f.state.shop.filters, filters, "Dismissal never overwrites saved filters");
  }
  assert.equal(fixture({ vendor: true }).view().dialog, undefined, "Vendor routing retains the native host guard");
});

test("embedded CategoryAdd retains the shared editor's default context heading", () => {
  const { descriptor, errors } = parse(readFileSync(new URL("../../category/add/BCategoryAdd.vue", import.meta.url), "utf8")); assert.deepEqual(errors, []);
  const editors = walkAst(baseParse(descriptor.template.content)).filter((node) => node.tag === "b-category-filter-editor");
  assert.equal(editors.length, 1);
  assert.ok(!editors[0].props.some((prop) => prop.name === "hide-context" || prop.name === "bind" && ["hide-context", "hideContext"].includes(prop.arg?.content)));
});
