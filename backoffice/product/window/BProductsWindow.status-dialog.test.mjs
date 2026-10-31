import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import vm from "node:vm";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BProductsWindow.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function evaluate(code, globals = {}) {
  const exports = {};
  vm.runInNewContext(code, { exports, ...globals });
  return exports;
}
const ProductStatus = evaluate(transpile(readFileSync(new URL("../../../../core-js/enums/product/ProductStatus.ts", import.meta.url), "utf8"))).ProductStatus;
const script = ts.createSourceFile("window.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = script.statements.find(ts.isExportAssignment).expression;
const section = (name) => options.properties.find((p) => p.name?.getText(script) === name).initializer.getText(script);
const componentCode = transpile(`export default { computed: ${section("computed")}, methods: ${section("methods")} }`);
const fragments = {};
function findFragments(node) {
  const model = node.props?.find((p) => p.name === "model")?.exp?.content;
  if (["status_product_dialog", "showProductMenu"].includes(model)) fragments[model] = node.loc.source;
  for (const child of node.children || []) findFragments(child);
}
findFragments(baseParse(descriptor.template.content));
const render = Object.fromEntries(Object.entries(fragments).map(([key, source]) => [key,
  new Function("Vue", compile(source, { mode: "function", prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: (name) => ({ name }) }),
]));
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const titleHelper = Object.getOwnPropertyDescriptor(String.prototype, "limitWords");
Object.defineProperty(String.prototype, "limitWords", { configurable: true, value(n) { return this.split(" ").slice(0, n).join(" "); } });
after(() => titleHelper ? Object.defineProperty(String.prototype, "limitWords", titleHelper) : delete String.prototype.limitWords);

function nodes(node, name, found = []) {
  if (Array.isArray(node)) { node.forEach((child) => nodes(child, name, found)); return found; }
  if (!node || typeof node !== "object" || node.type === "template") return found;
  if (node.type?.name === name) found.push(node);
  if (Array.isArray(node.children)) nodes(node.children, name, found);
  else if (typeof node.children?.default === "function") nodes(node.children.default(), name, found);
  return found;
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  return text(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
const product = (id, status = "Open", deleted = false) => ({ id, title: `Fixture product ${id}`, status, deleted_at: deleted ? "deleted" : null, type: "PHYSICAL" });
function fixture({ modern = true, verification = false, role = "Shop", write = true, selected = [], products = [product(1)] } = {}) {
  const requests = [], notifications = [];
  const component = evaluate(componentCode, {
    ProductStatus, ProductType: { SUBSCRIPTION: { code: "SUBSCRIPTION" } },
    ShopURLs: { GetProductLink: () => "/public/product", GetCategoryLink: () => "/public/category" },
    BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } }, ShopPermissionRegions: { PRODUCTS: { code: "PRODUCTS" } },
    window: { API: { POST_ASSIGN_STATUS_TO_PRODUCTS: (id) => `/local/shops/${id}/product-status` } },
    axios: { post: (url, body) => new Promise((resolve, reject) => requests.push({ url, body, resolve, reject })) },
    NotificationService: Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map((name) => [name, (...args) => notifications.push({ name, args })])),
  }).default;
  const state = {
    modern, $: { uid: 81 }, shop: { id: 7, model: role === "Marketplace" ? "MARKETPLACE" : "PHYSICAL", marketplace: { product: true, category: true, need_verify: verification } },
    $route: { params: role === "Vendor" ? { vendor_id: 4 } : {}, matched: [{ meta: { vendor: role === "Vendor" } }] },
    writeShopAccess: () => write, products, selected_products: selected, currentProductForMenu: products[0], currentCategoryForMenu: null,
    parent_folders: null, $store: { getters: {} }, showProductMenu: true, x: 10, y: 20, arrange_folder_mode: false,
    status_product_items: null, status_product_dialog: false, product_status_input: null, status_busy: false,
    ProductStatus, Slugify: { apply: (value) => value },
    $t: (key) => key, getShopImagePath: () => "fixture.svg", IMAGE_SIZE_SMALL: 64,
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  const open = (...items) => state.showChangeStatusProduct(...items);
  const view = () => { const tree = render.status_product_dialog(state, []); return { dialog: tree, selector: nodes(tree, "u-smart-select")[0], close: nodes(tree, "v-btn") }; };
  const choose = (code) => {
    const selector = view().selector;
    assert.ok(selector.props.items.some((item) => item.code === code), "Choose an offered status");
    selector.props["onUpdate:modelValue"](code); selector.props.onChange(code);
  };
  return { state, requests, notifications, open, view, choose };
}

test("status template compiles and single/bulk defaults preserve offered 2/4 statuses", () => {
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "status-dialog-test" }).errors, []);
  for (const modern of [false, true]) for (const verification of [false, true]) {
    const f = fixture({ modern, verification });
    for (const code of Object.keys(ProductStatus)) {
      f.open(product(1, code));
      const selector = f.view().selector;
      assert.equal(selector.props.modelValue, code);
      assert.deepEqual(Array.from(selector.props.items, (item) => item.code), ["Open", "Close", ...(verification ? ["Pending", "Rejected"] : [])]);
      if (code === "Unlisted" || !verification && ["Pending", "Rejected"].includes(code)) assert.ok(!selector.props.items.some((item) => item.code === code));
      assert.equal(Boolean(selector.props.accessible), modern);
    }
    for (const items of [[product(1), product(2)], [product(1), product(2, "Close"), product(3, "Unlisted")]]) {
      f.open(...items);
      assert.equal(f.state.product_status_input, null, "Even a homogeneous bulk selection starts without a choice");
      assert.equal(f.view().selector.props.modelValue, null);
    }
    assert.equal(f.requests.length, 0);
  }
});

test("existing access and deleted-product entry branches pass the correct selection", () => {
  for (const modern of [false, true]) for (const role of ["Shop", "Marketplace", "Vendor"]) for (const write of [false, true]) for (const selected of [[], [1], [1, 2]]) for (const deleted of [false, true]) {
    const products = [product(1, "Open", deleted), product(2, "Close")];
    const f = fixture({ modern, role, write, selected, products });
    const entries = nodes(render.showProductMenu(f.state, []), "v-list-item").filter((row) => text(row).includes("add_product.menu.change_status"));
    const allowed = role !== "Vendor" && write && (!deleted || selected.includes(1));
    assert.equal(entries.length, allowed ? 1 : 0);
    if (allowed) {
      entries[0].props.onClick({});
      assert.deepEqual(Array.from(f.state.status_product_items, (p) => p.id), selected.includes(1) ? selected : [1]);
      assert.equal(f.state.status_product_dialog, true);
    }
    assert.equal(f.requests.length, 0);
  }
});

test("changing the actual selector posts immediately, then success updates and closes", async () => {
  for (const modern of [false, true]) {
    const items = [product(1), product(2, "Close")], f = fixture({ modern, verification: true });
    f.open(...items); f.choose("Pending");
    assert.equal(f.state.status_busy, true);
    assert.equal(f.view().selector.props.loading, true);
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].url, "/local/shops/7/product-status");
    assert.deepEqual(plain(f.requests[0].body), { product_ids: [1, 2], status: "Pending" });
    assert.deepEqual(items.map((p) => p.status), ["Open", "Close"]);
    f.requests[0].resolve({ data: { success: true, count: 2, status: "Pending" } }); await settle();
    assert.deepEqual(items.map((p) => p.status), ["Pending", "Pending"]);
    assert.equal(f.state.status_product_dialog, false); assert.equal(f.state.status_busy, false);
    assert.equal(f.notifications.at(-1).name, "showSuccessAlert");
  }
});

test("server/network failures keep the attempted choice and original products", async () => {
  for (const modern of [false, true]) for (const network of [false, true]) {
    const item = product(1), f = fixture({ modern }); f.open(item); f.choose("Close");
    const error = new Error("Local simulated connection failure");
    if (network) f.requests[0].reject(error);
    else f.requests[0].resolve({ data: { error: true, error_msg: "Some product ids are invalid!" } });
    await settle();
    assert.equal(item.status, "Open"); assert.equal(f.state.product_status_input, "Close");
    assert.equal(f.state.status_product_dialog, true); assert.equal(f.state.status_busy, false);
    assert.equal(f.notifications.at(-1).name, network ? "showLaravelError" : "showErrorAlert");
    assert.equal(f.notifications.at(-1).args.at(-1), network ? error : "Some product ids are invalid!");
  }
});

test("modern same-choice protection resets on reopen and never suppresses bulk defaults", async () => {
  const item = product(1), f = fixture(); f.open(item); f.choose("Open");
  assert.equal(f.requests.length, 0);
  f.choose("Close"); f.requests[0].resolve({ data: { error: true, error_msg: "Denied" } }); await settle();
  f.choose("Close"); assert.equal(f.requests.length, 1, "A failed attempt remains selected and is not submitted twice");
  f.view().close[0].props.onClick({}); f.open(item); f.choose("Close");
  assert.equal(f.requests.length, 2, "Reopening resets the choice to actual product state");
  f.requests[1].resolve({ data: { success: true } }); await settle();
  f.open(product(2), product(3)); f.choose("Open");
  assert.equal(f.requests.length, 3, "Bulk starts null even when every product is already Open");
  f.requests[2].resolve({ data: { success: true } }); await settle();
  const legacy = fixture({ modern: false }); legacy.open(product(1)); legacy.choose("Open");
  assert.equal(legacy.requests.length, 1, "Legacy emitted-change behavior remains unchanged");
  legacy.requests[0].resolve({ data: { success: true } }); await settle();
});

test("Close and native Escape/backdrop model changes do not cancel an in-flight update", async () => {
  for (const modern of [false, true]) for (const close of ["button", "native-model"]) {
    const item = product(1), f = fixture({ modern }); f.open(item); f.choose("Close");
    const view = f.view();
    assert.ok(!view.dialog.props.persistent, "Native Escape/backdrop dismissal remains enabled");
    assert.ok(view.close.length);
    assert.ok(view.close.every((button) => !button.props.disabled && !button.props.loading));
    if (close === "button") view.close[0].props.onClick({});
    else view.dialog.props["onUpdate:modelValue"](false);
    assert.equal(f.state.status_product_dialog, false); assert.equal(f.state.status_busy, true);
    f.requests[0].resolve({ data: { success: true } }); await settle();
    assert.equal(item.status, "Close"); assert.equal(f.state.status_busy, false);
    f.open(item); assert.equal(f.state.product_status_input, "Close");
  }
});
