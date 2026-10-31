import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const { descriptor, errors } = parse(readFileSync(new URL("./BProductsWindow.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const plain = value => JSON.parse(JSON.stringify(value));
const ProductType = Object.fromEntries(["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map(code => [code, { code, name: code, image: `${code}.svg` }]));
const ProductStatus = Object.fromEntries(["Open", "Close", "Pending", "Rejected", "Unlisted"].map(code => [code, { code, name: code }]));

function fixture({ modern = true, set = "spec", vendorPanel = false, query = {}, wide = false } = {}) {
  const requests = [], routes = [], emitted = [], notices = [], timers = new Map();
  let serial = 0;
  const sdk = scope => ({
    optimize(ttl) { this.ttl = ttl; return this; },
    cancellation() { return this; },
    list(id, offset, limit, params) {
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      const request = { scope, id, offset, limit, params, ttl: this.ttl, resolve, reject };
      promise.cache = callback => { request.cached = callback; return promise; };
      requests.push(request);
      return promise;
    },
  });
  const exports = {};
  vm.runInNewContext(compile(descriptor.script.content), {
    exports, console: { log() {} },
    setTimeout: callback => { const id = ++serial; timers.set(id, callback); return id; },
    clearTimeout: id => timers.delete(id),
    localStorage: { getItem: () => "large", setItem() { throw new Error("Import must not save a global view preference"); } },
    document: { activeElement: { tagName: "BODY" }, addEventListener() {}, removeEventListener() {} },
    window: { $backoffice: { product: sdk("shop") }, $vendor: { product: sdk("vendor") } },
    require(path) {
      if (path === "vue") return Vue;
      if (path.includes("ProductType")) return { ProductType };
      if (path.includes("ProductStatus")) return { ProductStatus };
      if (path.includes("BusinessModel")) return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (path.includes("ShopPermissions")) return { ShopPermissionRegions: { PRODUCTS: { code: "PRODUCTS" } } };
      if (path.includes("Slugify" ) || path.includes("slugify")) return { Slugify: { apply: value => value } };
      if (path.includes("/models")) return { Category: {}, Product: {} };
      if (path.includes("BProductBreadcrumbsHelper")) return { BProductBreadcrumbsHelper: { GenerateCategoryHierarchy: title => [{ text: title, disabled: true, to: { query: {} } }] } };
      if (path.includes("NotificationService")) return { default: { showLaravelError: error => notices.push(error) } };
      if (path === "lodash-es") return { isObject: value => value !== null && typeof value === "object" };
      return { default: {} };
    },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props).map(([key, prop]) => [key, prop.default ?? (prop === Boolean || prop.type?.name === "Boolean" ? false : undefined)]));
  const state = {
    ...defaults, ...component.data(), modern, set,
    shop: { id: 42, model: "MARKETPLACE", marketplace: { product: true, category: true } }, vendor: vendorPanel ? { id: 9 } : null,
    $route: { name: "BPageShopProductsList", query, params: vendorPanel ? { vendor_id: 9 } : {}, matched: [{ meta: { vendor: vendorPanel } }] },
    $router: { push: route => routes.push(route) },
    $vuetify: { display: { lgAndUp: wide, width: wide ? 1024 : 390, md: false, sm: false, xs: !wide } },
    $store: { getters: {} }, $attrs: {}, $refs: {},
    $t: key => key, $nextTick: callback => Promise.resolve().then(callback),
    $emit: (...args) => emitted.push(args),
    getShopImagePath: value => value, IMAGE_SIZE_SMALL: 64, writeShopAccess: () => true,
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: getter.bind(state) });
  return { state, component, requests, routes, emitted, notices, timers };
}

const response = (overrides = {}) => ({ products: [{ id: 2, title: "Source", type: "PHYSICAL", status: "Open" }], total: 19, folders: [{ id: 7, title: "Lighting" }], parent: null, ...overrides });

test("Import opts in only for modern specifications, with responsive whole-row paging", () => {
  for (const modern of [false, true]) for (const set of [null, "spec"]) {
    const { state } = fixture({ modern, set });
    assert.equal(state.isSpecImport, modern && set === "spec");
    assert.equal(state.max_folders_per_page, state.isSpecImport ? 4 : 12);
    if (state.isSpecImport) {
      assert.equal(state.max_products_per_page, 6);
      state.product_page = 3;
      state.toggleImportView();
      assert.equal(state.product_page, 1);
      assert.equal(state.max_products_per_page, 4);
      state.$vuetify.display.lgAndUp = true;
      state.$vuetify.display.width = 1024;
      assert.equal(state.max_products_per_page, 6);
    }
  }
});

test("legacy and ordinary management callers retain their route-based category and type navigation", () => {
  for (const options of [{ modern: false, set: "spec" }, { modern: true, set: null }]) {
    const { state, routes, requests } = fixture(options);
    state.filters = ["FILE"];
    state.onFilterChange();
    assert.deepEqual(plain(routes[0].query.types), ["FILE"]);
    state.selectFolder({ id: 7 });
    assert.equal(routes[1].query.dir, 7);
    assert.equal(requests.length, 0);
  }
});

test("opening the import catalog ignores underlying page directory, search and type-route state", async () => {
  const { state, component, requests, routes } = fixture({ query: { dir: "99", search: "Unrelated editor search", types: "FILE" } });
  component.created.call(state);
  assert.equal(state.current_dir_id, null);
  assert.equal(state.search, null);
  assert.deepEqual(plain(state.filters), []);
  assert.equal(requests[0].params.dir, null);
  assert.deepEqual(plain(requests[0].params.types), []);
  assert.equal(routes.length, 0);
  requests[0].resolve(response());
  await setImmediate();
  component.watch["$route.query"].call(state, { dir: "100", search: "Other page" });
  assert.equal(state.current_dir_id, null);
  assert.equal(state.search, null);
  assert.equal(requests.length, 1);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} import folder/filter queries remain local and use the existing scoped list API`, async () => {
    const { state, requests, routes } = fixture({ vendorPanel });
    state.selectFolder({ id: 7 });
    assert.equal(state.current_dir_id, 7);
    assert.equal(state.product_page, 1);
    assert.equal(state.folder_page, 1);
    assert.equal(routes.length, 0);
    assert.equal(requests[0].scope, vendorPanel ? "vendor" : "shop");
    assert.equal(requests[0].id, vendorPanel ? 9 : 42);
    assert.equal(requests[0].params.dir, 7);
    assert.equal(requests[0].params.set, "spec");
    requests[0].resolve(response());
    await setImmediate();
    state.filters = ["FILE", "Pending"];
    state.only_available = true; state.vendor_filter = "north"; state.sort = "cheapest"; state.product_page = 3;
    state.onFilterChange();
    assert.equal(routes.length, 0);
    assert.equal(state.product_page, 1);
    assert.deepEqual(plain(requests[1].params.types), ["FILE"]);
    assert.deepEqual(plain(requests[1].params.statuses), ["Pending"]);
    assert.equal(requests[1].params.vendor, "north");
    assert.equal(requests[1].params.available, true);
    assert.equal(requests[1].params.sort, "cheapest");
    assert.equal(requests[1].offset, 0);
    requests[1].resolve(response());
    await setImmediate();
    state.product_page = 2;
    state.fetchData();
    assert.equal(requests[2].offset, 6);
    assert.equal(requests[2].params.products_only, true);
    assert.equal(requests[2].params.with_parent, false);
    requests[2].resolve(response({ folders: undefined, parent: undefined }));
    await setImmediate();
    assert.equal(state.folders[0].id, 7, "product paging preserves categories");
  });
}

test("import search coalesces local edits and pending search is cancelled on folder change and unmount", async () => {
  const { state, component, requests, timers, routes } = fixture();
  state.onImportSearch("la"); state.onImportSearch("lamp");
  assert.equal(timers.size, 1);
  assert.equal(requests.length, 0);
  const callback = [...timers.values()][0]; timers.clear(); callback();
  assert.equal(requests[0].params.search, "lamp");
  assert.equal(routes.length, 0);
  requests[0].resolve(response()); await setImmediate();
  state.onImportSearch("discard");
  state.selectFolder({ id: 7 });
  assert.equal(timers.size, 0);
  assert.equal(state.search, null);
  requests[1].resolve(response()); await setImmediate();
  state.onImportSearch("closed");
  component.beforeUnmount.call(state);
  assert.equal(timers.size, 0);
});

test("catalog loading blocks selection and failure permits a forced retry", async () => {
  const { state, requests, emitted } = fixture();
  state.fetchData();
  state.selectImportProduct({ id: 2 });
  assert.equal(emitted.length, 0);
  requests[0].reject(new Error("Fixture list unavailable"));
  await setImmediate();
  assert.equal(state.importLoadError, true);
  assert.equal(state.busy_fetch, false);
  state.fetchData(true);
  assert.equal(state.importLoadError, false);
  assert.equal(requests[1].ttl, 0);
  requests[1].resolve(response());
  await setImmediate();
  const source = { id: 2, status: "Pending" };
  state.selectImportProduct(source);
  assert.equal(emitted.at(-1)[0], "select");
  assert.equal(emitted.at(-1)[1], source, "source access is checked by the existing specification endpoint");
});

test("cancelled and cached older list responses cannot end a newer import load or replace its results", async () => {
  const { state, requests, notices } = fixture();
  state.fetchData();
  state.search = "latest";
  state.fetchData();
  requests[0].reject(undefined);
  await setImmediate();
  assert.equal(state.busy_fetch, true);
  assert.equal(state.importLoadError, false);
  assert.equal(notices.length, 0);
  const latest = response({ products: [{ id: 9 }], total: 1, folders: [{ id: 12 }] });
  requests[1].resolve(latest);
  await setImmediate();
  assert.equal(state.busy_fetch, false);
  assert.equal(state.importLoadError, false);
  requests[0].cached(response({ products: [{ id: 3 }], total: 100 }));
  assert.deepEqual(plain(state.products), latest.products);
  assert.deepEqual(plain(state.folders), latest.folders);
  assert.equal(state.products_count, 1);
});

test("unmount ignores a pending import list response and its finalizer", async () => {
  const { state, component, requests, notices } = fixture();
  state.fetchData();
  component.beforeUnmount.call(state);
  requests[0].resolve(response());
  await setImmediate();
  assert.deepEqual(plain(state.products), []);
  assert.deepEqual(plain(state.folders), []);
  assert.equal(state.products_count, 0);
  assert.equal(state.busy_fetch, true);
  assert.equal(notices.length, 0);
});

test("the actual import renderer preserves native row selection and bounded pagination without management actions", () => {
  const { state } = fixture();
  state.products = response().products;
  state.products_count = 29;
  state.selectedList = [2]; state.selectMode = true;
  const element = descriptor.template.ast.children.find(node => node.tag === "div").children.find(node => node.tag === "section" && node.props.some(prop => prop.name === "if" && prop.exp?.content === "isSpecImport"));
  const output = compileTemplate({ source: element.loc.source, filename: "import-picker-fixture.vue", id: "import-picker-check" });
  assert.deepEqual(output.errors, []);
  const exports = {};
  vm.runInNewContext(compile(output.code), { exports, require: () => ({ ...Vue, resolveComponent: name => name, resolveDirective: () => ({}), withDirectives: vnode => vnode }) });
  const nodes = [];
  const visit = node => { if (!node || typeof node !== "object") return; if (Array.isArray(node)) return node.forEach(visit); nodes.push(node); visit(node.children); if (node.children?.default) visit(node.children.default({})); };
  visit(exports.render(state, []));
  const row = nodes.find(node => node.type === "button" && node.props?.["data-product-id"] === 2);
  assert.equal(row.props["aria-pressed"], true);
  const pagination = nodes.find(node => node.type === "v-pagination");
  assert.equal(pagination.props["total-visible"] ?? pagination.props.totalVisible, 3);
  assert.equal(pagination.props.length, 5);
  assert.equal(nodes.some(node => node.type === "b-product-window-product-large"), false);
});
