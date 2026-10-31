import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import { compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BProductWindowCategoryLarge.vue", import.meta.url);
const source = readFileSync(file, "utf8");
const { descriptor, errors } = parse(source);
assert.deepEqual(errors, []);
const script = ts.createSourceFile("category.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = script.statements.find(ts.isExportAssignment).expression;
const section = (name) => options.properties.find((p) => p.name?.getText(script) === name).initializer.getText(script);
const code = ts.transpileModule(`export default { props: ${section("props")}, computed: ${section("computed")} }`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exported = {};
vm.runInNewContext(code, { exports: exported });
const component = exported.default;
const render = new Function("Vue", compile(descriptor.template.content, { mode: "function", prefixIdentifiers: true }).code)({
  ...Vue,
  resolveComponent: (name) => ({ name }),
  renderSlot: (slots, name) => slots[name]?.() || [],
});

function nodes(node, predicate, found = []) {
  if (Array.isArray(node)) { node.forEach((child) => nodes(child, predicate, found)); return found; }
  if (!node || typeof node !== "object") return found;
  if (predicate(node)) found.push(node);
  if (Array.isArray(node.children)) nodes(node.children, predicate, found);
  else if (typeof node.children?.default === "function") nodes(node.children.default(), predicate, found);
  return found;
}
const byClass = (tree, name) => nodes(tree, (node) => String(node.props?.class || "").split(" ").includes(name));
const byComponent = (tree, name) => nodes(tree, (node) => node.type?.name === name);
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  if (node.type === Vue.Comment) return "";
  return text(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
function fixture(overrides = {}) {
  const emitted = [];
  const state = {
    modernList: false, loading: false, isEmpty: false, extended: true, compactMode: false, small: false, showEditButton: true,
    category: { id: 8, title: "Category <literal>", description: "", icon: "category.svg", products: 0, categories: 2, visits: 17 },
    ThemeColorDeepDark: "#222", ThemeColorDark: "#333", IMAGE_SIZE_SMALL: 64,
    $store: { getters: { getUploadingKeeper: {} } },
    $slots: { actions: () => Vue.h("button", { class: "native-notes" }, "Notes") },
    $t: (key) => key, numeralFormat: (value) => String(value), getShopImagePath: (value) => `/images/${value}`,
    getConnectIcon: (value) => `/connect/${value}.svg`,
    $emit: (...args) => emitted.push(args),
    ...overrides,
  };
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { state, emitted, tree: render(state, []) };
}

test("both opt-in and native category templates and scoped styles compile", async () => {
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "category-list" }).errors, []);
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: file.pathname, id: "data-v-category-list", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(style.errors, []);
  assert.equal(component.props.modernList.default, false);
  const legacy = fixture();
  assert.equal(byClass(legacy.tree, "widget-folder-root").length, 1);
  assert.equal(byComponent(legacy.tree, "s-widget").length, 1);
  assert.equal(byClass(legacy.tree, "b-product-category-list").length, 0);
  legacy.tree.props.onClick({});
  assert.deepEqual(legacy.emitted, [["select"]]);
  const event = { stopPropagation() {} };
  const nativeHeader = byComponent(legacy.tree, "s-widget")[0].children["top-left"]();
  byComponent(nativeHeader, "v-btn")[0].props.onClick(event);
  assert.deepEqual(legacy.emitted.at(-1), ["click:edit"]);
  assert.ok(text(legacy.tree).includes("admin_shop.products.folder_widget.sub_categories_unit"));
  const emptyLegacy = fixture({ isEmpty: true });
  assert.ok(text(emptyLegacy.tree).includes("global.commons.empty"));
  assert.equal(emptyLegacy.tree.props.style["--card-color"], "#959c9f");
});

test("modern folder avatar retains its real image, loading placeholder, drop target and Notes without metrics or Empty", () => {
  const f = fixture({ modernList: true });
  assert.equal(f.tree.props["category-id"], 8);
  const frame = byClass(f.tree, "b-product-category-list__image")[0];
  assert.equal(frame.type, "span");
  assert.equal(frame.props["drop-image"], "true");
  const image = byComponent(frame, "v-img")[0];
  assert.equal(image.props.src, "/images/category.svg");
  assert.equal(image.props.width, "100%");
  assert.equal(image.props.height, "100%");
  assert.notEqual(image.props.cover, undefined);
  assert.equal(image.props.alt, "");
  const placeholder = byComponent(image.children.placeholder(), "v-progress-circular");
  assert.equal(placeholder.length, 1);
  assert.notEqual(placeholder[0].props.indeterminate, undefined);
  const title = byClass(f.tree, "b-product-category-list__title")[0];
  assert.equal(text(title).trim(), "Category <literal>");
  assert.equal(byClass(f.tree, "b-product-category-list__metric").length, 0);
  assert.equal(byClass(f.tree, "native-notes").length, 1);
  const emptyModern = fixture({ modernList: true, isEmpty: true });
  assert.equal(byClass(emptyModern.tree, "b-product-category-list__empty").length, 0);
  assert.ok(!text(emptyModern.tree).includes("global.commons.empty"));
  assert.equal(byClass(emptyModern.tree, "b-product-category-list__hints").length, 0);
});

test("category body/title navigate while More forwards the native event without a separate Edit action", () => {
  const f = fixture({ modernList: true });
  const event = { stopped: 0, stopPropagation() { this.stopped++; } };
  byClass(f.tree, "b-product-category-list__body")[0].props.onClick(event);
  byClass(f.tree, "b-product-category-list__title")[0].props.onClick(event);
  const buttons = byComponent(f.tree, "v-btn");
  assert.equal(buttons.length, 1);
  buttons[0].props.onClick(event);
  assert.equal(buttons[0].props["aria-label"], "product_panel.workspace.list_view.more_actions");
  assert.deepEqual(f.emitted, [["select"], ["select"], ["contextmenu", event]]);
  assert.equal(event.stopped, 2);
  const withoutEdit = fixture({ modernList: true, showEditButton: false });
  assert.equal(byComponent(withoutEdit.tree, "v-btn").length, 1);
});

test("identity header keeps Notes and More reachable without navigating the category", () => {
  const f = fixture({ modernList: true });
  const header = byClass(f.tree, "b-product-category-list__header")[0];
  const actions = byClass(header, "b-product-category-list__actions")[0];
  assert.equal(byClass(actions, "native-notes").length, 1);
  assert.equal(byComponent(actions, "v-btn").length, 1);
  assert.equal(byClass(f.tree, "b-product-category-list__footer").length, 0);
  const event = { stopped: false, stopPropagation() { this.stopped = true; } };
  actions.props.onClick(event);
  assert.equal(event.stopped, true);
  assert.deepEqual(f.emitted, []);
});

test("description, Connect, star and uploading/loading remain while modern Empty stays hidden", () => {
  const category = { id: 8, title: "Connected", description: "Full category description without truncating the stored value.", icon: "category.svg", star: true, connect_id: 4 };
  const f = fixture({ modernList: true, category, isEmpty: true, loading: true, $store: { getters: { getUploadingKeeper: { upload: { target: { category: 8 }, progress: 42 } } } } });
  assert.ok(text(byClass(f.tree, "b-product-category-list__description")[0]).includes(category.description));
  assert.ok(byComponent(f.tree, "v-tooltip").some((node) => text(node) === category.description));
  assert.equal(byClass(f.tree, "b-product-category-list__empty").length, 0);
  assert.equal(byClass(f.tree, "b-product-category-list__connect").length, 1);
  assert.ok(byComponent(f.tree, "v-icon").some((node) => text(node) === "star"));
  assert.ok(byComponent(f.tree, "v-progress-circular").some((node) => node.props["model-value"] === 42));
  assert.equal(f.tree.props["aria-busy"], true);
  assert.ok(byComponent(f.tree, "v-btn").every((node) => node.props.disabled));
  const missingIcon = fixture({ modernList: true, category: { ...category, icon: null }, $store: f.state.$store });
  const frame = byClass(missingIcon.tree, "b-product-category-list__image")[0];
  assert.equal(byComponent(frame, "v-img").length, 0);
  assert.equal(byComponent(frame, "v-icon")[0].props.icon, "folder_open");
  assert.equal(byComponent(frame, "v-icon")[0].props["aria-hidden"], "true");
  assert.ok(byComponent(frame, "v-progress-circular").some((node) => node.props["model-value"] === 42), "The first image upload remains visible before an icon exists");
});

test("compact and extended options retain native image/upload targets and independent hints without metrics", () => {
  for (const compactMode of [false, true]) for (const extended of [false, true]) {
    const f = fixture({ modernList: true, compactMode, extended, isEmpty: true,
      category: { id: 8, title: "Scoped category", description: "", icon: "category.svg", connect_id: 4 },
    });
    const image = byClass(f.tree, "b-product-category-list__image");
    assert.equal(image.length, compactMode || extended ? 1 : 0);
    if (image.length) assert.equal(image[0].props["drop-image"], !compactMode && extended ? "true" : undefined);
    assert.equal(byClass(f.tree, "b-product-category-list__metric").length, 0);
    assert.equal(byClass(f.tree, "b-product-category-list__empty").length, 0);
    assert.equal(byClass(f.tree, "b-product-category-list__connect").length, 1);
    assert.equal(byClass(f.tree, "b-product-category-list__body--no-image").length, !compactMode && !extended ? 1 : 0);
  }
});
