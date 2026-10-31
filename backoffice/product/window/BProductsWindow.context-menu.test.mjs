import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const { descriptor, errors } = parse(readFileSync(new URL("./BProductsWindow.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const script = ts.createSourceFile("window.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = script.statements.find(ts.isExportAssignment).expression;
const section = (name) => options.properties.find((p) => p.name?.getText(script) === name).initializer.getText(script);
let menu;
function findMenu(node) {
  if (node.tag === "v-menu" && node.props.some((p) => p.name === "model" && p.exp?.content === "showProductMenu")) menu = node.loc.source;
  for (const child of node.children || []) findMenu(child);
}
findMenu(baseParse(descriptor.template.content));
assert.ok(menu, "Compile the actual context menu, not a copied fixture template");
const ProductStatus = Object.fromEntries(["Open", "Close", "Pending", "Rejected"].map((name) => [name, { name, color: "green" }]));
const ShopURLs = {
  GetProductLink: (_, id, slug) => `/public/products/${id}/${slug}`,
  GetCategoryLink: (_, name) => `/public/categories/${name}`,
};
const module = { exports: {} };
vm.runInNewContext(ts.transpileModule(`module.exports = { computed: ${section("computed")}, methods: ${section("methods")} }`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  module, ShopURLs, ProductStatus, ProductType: { SUBSCRIPTION: { code: "SUBSCRIPTION" } },
  BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } }, ShopPermissionRegions: { PRODUCTS: { code: "PRODUCTS" } },
});
const component = module.exports;
const render = new Function("Vue", compile(menu, { mode: "function", prefixIdentifiers: true }).code)({
  ...Vue, resolveComponent: (name) => ({ name }),
});
// The application supplies this title helper; restore the test process afterward.
const titleHelper = Object.getOwnPropertyDescriptor(String.prototype, "limitWords");
Object.defineProperty(String.prototype, "limitWords", { configurable: true, value(n) { return this.split(" ").slice(0, n).join(" "); } });
after(() => titleHelper ? Object.defineProperty(String.prototype, "limitWords", titleHelper) : delete String.prototype.limitWords);
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture({ modern = true, role = "Shop", target = "Product", write = true, categoryAccess = true,
  vendorProducts = true, kind = "active", clipboard, location, verification = false, set = null, selectMode = false } = {}) {
  const product = { id: 1, title: "Eco Tote", status: "Open", type: kind === "subscription" ? "SUBSCRIPTION" : "PHYSICAL",
    deleted_at: kind === "deleted" ? "deleted" : null, vendor_id: kind === "vendor-owned" ? 8 : null };
  const category = { id: 5, name: "children", title: "Children Room" };
  const buffer = { id: 7, title: "Clipboard product" }, calls = [], commits = [];
  const getters = { getCopyProduct: clipboard === "copy" ? buffer : null, getCutProduct: clipboard === "cut" ? buffer : null };
  const state = {
    modern, set, selectMode, shop: { model: role === "Marketplace" ? "MARKETPLACE" : "PHYSICAL",
      marketplace: { product: vendorProducts, category: categoryAccess, need_verify: verification } },
    $route: { params: role === "Vendor" ? { vendor_id: 4 } : {}, matched: [{ meta: { vendor: role === "Vendor" } }] },
    writeShopAccess: () => write, currentProductForMenu: target.includes("Product") ? product : null,
    currentCategoryForMenu: target === "Category" ? category : null, parent_folders: location ? category : null,
    current_dir_id: location ? 5 : null, selected_products: target === "SelectedProduct" ? [1] : target === "SelectedProducts" ? [1, 2, 3] : [2],
    products: [product, { id: 2, type: "SUBSCRIPTION", vendor_id: 9 }, { id: 3 }], selectedList: ["c5", "p2"],
    $store: { getters, commit(name, value) { commits.push([name, value]); getters[name === "setCutProduct" ? "getCutProduct" : "getCopyProduct"] = value; } },
    ProductStatus, ShopURLs, Slugify: { apply: (title) => title.replaceAll(" ", "-") }, IMAGE_SIZE_SMALL: 64,
    getShopImagePath: () => "fixture.svg", $t: (key, params) => params?.count ? `${params.count} selected` : key,
    arrange_folder_mode: false, dialog_root_filter: false, dialog_root_engine: false, showProductMenu: true,
    x: 12, y: 24, $nextTick: (callback) => callback(),
  };
  // No application methods or API clients execute while rendering/dispatching menu rows.
  for (const name of Object.keys(component.methods)) state[name] = (...args) => calls.push({ name, args });
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { state, calls, commits, product, category, buffer };
}
function rows(node, found = []) {
  if (Array.isArray(node)) { node.forEach((child) => rows(child, found)); return found; }
  if (!node || typeof node !== "object" || node.type === "template") return found; // Native template content is inert.
  if (node.type?.name === "v-list-item") { found.push(node); return found; }
  if (Array.isArray(node.children)) rows(node.children, found);
  else if (typeof node.children?.default === "function") rows(node.children.default(), found);
  return found;
}
const names = { showAssignVendor: "vendor", showChangeStatusProduct: "status", deleteAllSelectedProduct: "deleteAll",
  showNoteProduct: "note", showNoteCategory: "note", deleteProduct: "delete", restoreProduct: "restore", cutProduct: "cut",
  copyProduct: "copy", showSetBulkCategoryProfile: "profiles", showCategoryBulkDiscount: "discount", pastProduct: "paste",
  handleDropInFolder: "move", selectAllProducts: "select", cloneProduct: "duplicate" };
function actions(f) {
  return rows(render(f.state, [])).map((row) => {
    const p = row.props;
    if (p.href) return { id: "open", row };
    if (p.to) return { id: p.to.hash === "#general" ? "edit" : p.to.hash === "#images" ? "images" : /Inventory/.test(p.to.name) ? "inventory" : "dashboard", row };
    const previous = [f.calls.length, f.state.dialog_root_filter, f.state.dialog_root_engine, f.state.arrange_folder_mode];
    p.onClick({});
    const call = f.calls.length > previous[0] ? f.calls.at(-1) : null;
    const id = call?.name === "showEditCategory" ? (call.args[0] ? "editCategory" : "newCategory") : call ? names[call.name]
      : f.state.dialog_root_filter !== previous[1] ? "filter" : f.state.dialog_root_engine !== previous[2] ? "engine"
        : f.state.arrange_folder_mode !== previous[3] ? "arrange" : undefined;
    assert.ok(id, "Every visible action must dispatch its existing handler");
    return { id, row, call };
  });
}
const common = ["select", "newCategory", "arrange"];
const productActions = ["open", "edit", "duplicate", "dashboard", "inventory", "images", "status", "note", "delete", "cut", "copy"];
for (const modern of [false, true]) test(`semantic context actions preserve ${modern ? "modern" : "legacy"} behavior`, () => {
  const categoryNote = modern ? ["note"] : [];
  const cases = [
    [{}, [...productActions, ...common]],
    [{ role: "Marketplace" }, ["open", "vendor", ...productActions.slice(1), ...common]],
    [{ role: "Vendor" }, [...productActions.filter((id) => id !== "status"), ...common]],
    [{ kind: "deleted" }, ["restore", "cut", "copy", ...common]],
    [{ write: false }, ["open", ...common]],
    [{ write: false, kind: "deleted" }, common],
    [{ role: "Vendor", vendorProducts: false }, ["open", ...common]],
    [{ target: "Category", write: false }, ["open", "editCategory", ...categoryNote, "profiles", "discount", ...common]],
    [{ target: "Category", role: "Vendor" }, ["open", "editCategory", ...categoryNote, ...common]],
    [{ target: "Category", role: "Vendor", categoryAccess: false }, ["select"]],
    [{ target: "Blank", write: false }, ["filter", "engine", ...common]],
    [{ target: "Blank", role: "Vendor", categoryAccess: false }, ["select"]],
    [{ target: "SelectedProduct" }, ["status", "deleteAll"]],
    [{ target: "SelectedProducts", role: "Marketplace", kind: "deleted" }, ["vendor", "status", "deleteAll"]],
    [{ target: "SelectedProducts", role: "Vendor" }, ["deleteAll"]],
    [{ target: "SelectedProducts", write: false }, ["open", ...common]],
    ...["subscription", "vendor-owned"].flatMap((kind) => [
      [{ kind, role: "Marketplace" }, [...productActions, ...common]],
      [{ kind, role: "Marketplace", target: "SelectedProducts" }, ["status", "deleteAll"]],
    ]),
  ];
  for (const [scenario, expected] of cases) assert.deepEqual(actions(fixture({ modern, ...scenario })).map((a) => a.id), expected, JSON.stringify(scenario));
});

test("Duplicate product dispatches one native product ID only within the existing writable, active product menu", () => {
  for (const modern of [false, true]) for (const role of ["Shop", "Marketplace", "Vendor"]) {
    const f = fixture({ modern, role });
    const duplicate = actions(f).find(action => action.id === "duplicate");
    assert.ok(duplicate);
    assert.deepEqual(duplicate.call, { name: "cloneProduct", args: [f.product.id] });
    assert.equal(f.state.selected_products.length, 1);
    assert.notEqual(f.state.selected_products[0], f.product.id, "Unrelated selection must not turn duplication into a bulk action");
    assert.ok(duplicate.row.children.default().some(node => node.type?.name === "v-list-item-title" && node.children.default().some(child => child.children === "product_panel.workspace.context_menu.duplicate_product")));

    for (const scenario of [
      { write: false }, { kind: "deleted" }, { target: "Category" }, { target: "Blank" },
      { target: "SelectedProduct" }, { target: "SelectedProducts" },
      ...(role === "Vendor" ? [{ vendorProducts: false }] : []),
    ]) assert.equal(actions(fixture({ modern, role, ...scenario })).some(action => action.id === "duplicate"), false, JSON.stringify({ modern, role, ...scenario }));
  }
});

test("category Edit respects modern edit mode and the existing vendor category capability", () => {
  for (const modern of [false, true])
    for (const set of [null, "spec"])
      for (const selectMode of [false, true])
        for (const role of ["Shop", "Vendor"])
          for (const categoryAccess of [false, true]) {
            const f = fixture({ modern, set, selectMode, role, categoryAccess, target: "Category", write: false });
            const a = actions(f), allowed = role !== "Vendor" || categoryAccess;
            const edit = a.find((item) => item.id === "editCategory");
            assert.equal(Boolean(edit), allowed && (!modern || (!set && !selectMode)));
            if (edit) assert.equal(edit.call.args[0], f.category);
            assert.equal(a.some((item) => item.id === "open"), allowed);
            assert.equal(a.some((item) => item.id === "note"), modern && allowed);
          }
});

test("native routes and existing single/bulk handlers retain their payloads", () => {
  for (const role of ["Shop", "Vendor"]) {
    const f = fixture({ role }), a = actions(f), route = (id) => a.find((item) => item.id === id).row.props.to;
    assert.deepEqual(route("edit"), { name: role === "Vendor" ? "Vendor_AddProduct" : "BPageProductEdit", params: { product_id: 1 }, hash: "#general" });
    assert.equal(route("images").hash, "#images");
    assert.equal(route("images").name, route("edit").name);
    for (const id of ["images", "dashboard", "inventory"]) assert.deepEqual(route(id).params, { product_id: 1 });
    assert.equal(route("dashboard").name, role === "Vendor" ? "Vendor_ProductDashboard" : "BPageProductDashboard");
    assert.equal(route("inventory").name, role === "Vendor" ? "Vendor_ProductInventoryPage" : "BPageProductInventory");
    assert.equal(a[0].row.props.href, "/public/products/1/Eco-Tote");
    assert.equal(a[0].row.props.target, "_blank");
    assert.equal(a.find((item) => item.id === "note").call.name, "showNoteProduct");
    for (const id of ["note", "delete", "cut", "copy"]) assert.equal(a.find((item) => item.id === id).call.args[0], f.product);
  }
  const bulk = fixture({ target: "SelectedProducts", role: "Marketplace" }), a = actions(bulk);
  assert.deepEqual(a.find((item) => item.id === "status").call.args, bulk.state.products);
  assert.equal(a.find((item) => item.id === "deleteAll").call.args[0], bulk.state.selected_products);
  component.methods.showAssignVendor.call(bulk.state, bulk.product);
  assert.equal(bulk.state.assign_vendor_product_ids, bulk.state.selected_products);
  const category = fixture({ target: "Category" });
  const categoryActions = actions(category);
  assert.equal(categoryActions.find((item) => item.id === "note").call.name, "showNoteCategory");
  for (const id of ["editCategory", "note", "profiles", "discount"]) assert.equal(categoryActions.find((item) => item.id === id).call.args[0], category.category);
  assert.deepEqual(categoryActions.find((item) => item.id === "newCategory").call.args, [null]);
  const deleted = fixture({ kind: "deleted" });
  for (const action of actions(deleted).filter((item) => ["restore", "cut", "copy"].includes(item.id))) assert.equal(action.call.args[0], deleted.product);
});

test("clipboard actions stay ungated and always target the open directory", () => {
  for (const location of [false, true]) for (const clipboard of ["copy", "cut"]) {
    const f = fixture({ target: "Category", role: "Vendor", write: false, categoryAccess: false, clipboard, location });
    const action = actions(f).find((a) => a.id === (clipboard === "copy" ? "paste" : "move"));
    if (clipboard === "copy") {
      component.methods.pastProduct.call(f.state, f.buffer);
      assert.deepEqual(f.calls.at(-1), { name: "cloneProduct", args: [7, location ? 5 : null] });
      assert.equal(f.state.copy_product, f.buffer);
    } else assert.deepEqual(action.call.args, [{ product: f.buffer }, { id: location ? 5 : null }]);
  }
  const f = fixture();
  component.methods.copyProduct.call(f.state, f.product);
  assert.equal(f.state.copy_product, f.product); assert.equal(f.state.cut_product, null);
  component.methods.cutProduct.call(f.state, f.product);
  assert.equal(f.state.cut_product, f.product); assert.equal(f.state.copy_product, null);
});

test("selection, status defaults and context identity use current source state", () => {
  const f = fixture();
  component.methods.selectAllProducts.call(f.state, true);
  assert.deepEqual(plain(f.state.selected_products), [1, 2, 3]);
  assert.equal(f.state.is_menu_multi_select_product, true);
  assert.equal(f.state.menu_context.title, "3 selected");
  component.methods.selectAllProducts.call(f.state, false);
  assert.equal(f.state.is_menu_multi_select_product, false);
  assert.equal(f.state.menu_context.title, f.product.title);
  component.methods.showChangeStatusProduct.call(f.state, f.product);
  assert.equal(f.state.product_status_input, "Open");
  component.methods.showChangeStatusProduct.call(f.state, ...f.state.products);
  assert.equal(f.state.product_status_input, null);
  assert.equal(fixture().state.status_list.length, 2);
  assert.equal(fixture({ verification: true }).state.status_list.length, 4);
  assert.equal(fixture({ target: "Blank", location: true }).state.menu_context.title, "Children Room");
});

test("right-click retains selection and opens background actions only on the management canvas", () => {
  const f = fixture(), selected = f.state.selected_products;
  const event = { target: { id: "other" }, clientX: 40, clientY: 60, preventDefault: () => assert.fail("Ignored background click") };
  component.methods.showMenu.call(f.state, event, null, null);
  assert.equal(f.state.currentProductForMenu, f.product);
  event.target.id = "manage-panel";
  event.preventDefault = () => {};
  component.methods.showMenu.call(f.state, event, null, null);
  assert.equal(f.state.currentProductForMenu, null);
  assert.equal(f.state.selected_products, selected);
  assert.deepEqual([f.state.x, f.state.y, f.state.showProductMenu], [40, 60, true]);
});

test("keyboard More anchors both native product and category menus without changing selection", () => {
  for (const target of ["Product", "Category"]) {
    const f = fixture({ target }), selected = f.state.selected_products;
    for (const [type, clientX, clientY, x, y] of [
      ["click", 0, 0, 50, 120],
      ["click", 40, 60, 40, 60],
      ["contextmenu", 40, 60, 40, 60],
      ["contextmenu", 0, 0, 0, 0],
    ]) {
      let prevented = false;
      component.methods.showMenu.call(f.state, {
        type, clientX, clientY, target: {},
        currentTarget: { getBoundingClientRect: () => ({ x: 20, width: 60, bottom: 120 }) },
        preventDefault() { prevented = true; },
      }, target === "Product" ? f.product : null, target === "Category" ? f.category : null);
      assert.equal(f.state.currentProductForMenu, target === "Product" ? f.product : null);
      assert.equal(f.state.currentCategoryForMenu, target === "Category" ? f.category : null);
      assert.deepEqual([f.state.x, f.state.y, f.state.showProductMenu], [x, y, true]);
      assert.equal(f.state.selected_products, selected);
      assert.equal(prevented, true);
    }
  }
});
