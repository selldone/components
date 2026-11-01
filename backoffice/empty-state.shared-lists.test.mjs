import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { baseParse, compile } from "@vue/compiler-dom";
import { parse } from "@vue/compiler-sfc";

const definitions = [
  ["product/list/BProductsList.vue", "fetchProducts", "products", "sdk"],
  ["box/list/BBoxesList.vue", "fetchBoxes", "boxes"],
  ["blog/list/BBlogsList.vue", "fetchArticles", "articles", "sdk"],
  ["blog/category/list/BBlogCategoriesList.vue", "fetchCategories", "categories", "sdk"],
  ["logistic/profile/list/BLogisticProfilesList.vue", "fetchData", "profiles"],
  ["order/return-request/SBackofficeReturnRequestsList.vue", "fetchData", "return_requests"],
  ["order/bill/list/BOrderBillsList.vue", "fetchBills", "bills"],
  ["listing/review/BShopListingReviewsList.vue", "fetchReviews", "reviews"],
  ["vendor/documents/list/BVendorDocumentsList.vue", "fetchDocuments", "documents", "axios", "busy"],
  ["app/shop/store/BAppShopStore.vue", "fetchAppsList", "apps", "axios", "busy"],
  ["drop-shipping/DropShippingAccountCharges.vue", "fetchResellerAccountCharges", "charges"],
  ["ribbon/list/BRibbonList.vue", "fetchRibbons", "ribbons"],
  ["subscription/ShopSubscriptionList.vue", "fetchSubscriptions", "subscriptions"],
  ["product/inventory/management/virtual/BProductInventoryManagementVirtual.vue", "fetchVirtualItems", "virtual_items"],
  ["shop/sms/template/list/BShopSmsTemplateList.vue", "fetchItems", "templates", "axios", "busy"],
];
const settle = () => new Promise(resolve => setImmediate(resolve));
const all = node => [node, ...(node.children || []).flatMap(all)];
const flatten = (node, out = []) => {
  if (Array.isArray(node)) { node.forEach(child => flatten(child, out)); return out; }
  if (!node || typeof node !== "object") return out;
  out.push(node);
  if (Array.isArray(node.children)) flatten(node.children, out);
  return out;
};
function sourceFor(path, name) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { descriptor, errors } = parse(source);
  assert.deepEqual(errors, []);
  const ast = ts.createSourceFile(path, descriptor.script.content, ts.ScriptTarget.Latest, true);
  const exported = ast.statements.find(ts.isExportAssignment).expression;
  const options = ts.isCallExpression(exported) ? exported.arguments[0] : exported;
  const methods = options.properties.find(p => p.name?.getText(ast) === "methods").initializer;
  const method = methods.properties.find(p => p.name?.getText(ast) === name);
  assert.ok(method, `${path} exposes its real ${name} method`);
  const initial = [];
  function visit(node) {
    if (ts.isPropertyAssignment(node) && node.name?.getText(ast) === "emptyStateLoaded") initial.push(node.initializer.getText(ast));
    ts.forEachChild(node, visit);
  }
  const data = options.properties.find(p => p.name?.getText(ast) === "data");
  visit(data);
  assert.deepEqual(initial, ["false"], `${path} begins unready`);
  const template = all(baseParse(descriptor.template.content));
  const slot = template.find(n => n.tag === "template" && n.props.some(p => p.name === "slot" && p.arg?.content === "no-data"));
  const empty = template.find(n => n.tag === "b-list-empty-state");
  assert.ok(slot || empty, `${path} retains its real collection empty boundary`);
  const fragment = slot ? slot.children.map(n => n.loc.source).join("") : empty.loc.source;
  const render = new Function("Vue", compile(`<div>${fragment}</div>`, { mode: "function", prefixIdentifiers: true }).code)({
    ...Vue, resolveComponent: name => ({ name }),
  });
  return { method: method.getText(ast), render };
}
function fixture(definition) {
  const [path, name, field, transport = "axios", busy = "busy_fetch"] = definition;
  const source = sourceFor(path, name);
  const requests = [], notices = [];
  const request = () => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    const entry = { resolve, reject };
    promise.cache = callback => { entry.cached = callback; return promise; };
    requests.push(entry);
    return promise;
  };
  const sdk = { optimize() { return this; }, cancellation() { return this; }, force() { return this; }, list: request };
  sdk.categories = sdk;
  const API = new Proxy({}, { get: (_, name) => (...ids) => `${String(name)}:${ids.join(":")}` });
  const context = {
    exports: {}, Array, Number, String, Math,
    ProductStatus: {}, ProductType: {},
    window: { API, VAPI: API, $backoffice: { product: sdk, blog: sdk }, $vendor: { product: sdk } },
    axios: { get: request },
    NotificationService: { showLaravelError: error => notices.push(error), showErrorAlert: (...args) => notices.push(args) },
  };
  vm.runInNewContext(ts.transpileModule(`export const run = {${source.method}}.${name};`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, context);
  const state = {
    emptyStateLoaded: false, emptyStateRequest: 0, request_id: 0, requestId: 0,
    fetch_request: 0, list_request_id: 0, disposed: false,
    modern: true, isModern: true, [busy]: false,
    busy_fetch: false, fetch_error: false, load_error: false, failed: false,
    search: "", filters: [], filter_list: ["Open", "Payed", "Canceled", "Reserved"],
    hasFilters: false, extraFilterSummaries: [],
    set: null, showDeletes: false, showVendors: false,
    showProductMenu: false, showHeader: true,
    IS_VENDOR_PANEL: false, VENDOR_ID_SAFE: null, isVendor: false,
    shop: { id: 42 }, vendor: { id: 9 }, product: { id: 18, shop_id: 42 },
    account: { id: 24 }, basket: { id: 24 }, ownerId: 42, API, sms: { verification: false },
    $shop: { id: 42 }, $vendor: { id: 9 },
    $route: { params: { shop_id: 42 }, query: {} },
    $vuetify: { display: { xs: false, smAndDown: false } },
    page: 1, itemsPerPage: 10, pageCount: 1, history_page: 1,
    sort: null, sortBy: [], status: [], subscriptions: [], vouchers: [],
    documents_embed: [], documents_link: [], uploaded_documents: [],
    $t: key => key, $n: String, $slots: {},
    active: false,
    writeShopAccess: () => false,
  };
  const view = () => source.render(state, []);
  const visible = () => flatten(view()).filter(n => n.type?.name === "b-list-empty-state");
  const read = () => context.exports.run.call(state, 1, null, true);
  const success = data => transport === "sdk" ? data : { data };
  return { state, requests, notices, read, visible, success, field, busy };
}

for (const definition of definitions) {
  test(`${definition[0]} shows guidance only after its actual successful collection read`, async () => {
    const f = fixture(definition);
    assert.equal(f.visible().length, 0, "initial empty arrays are unready");
    f.read();
    assert.equal(f.state.emptyStateLoaded, false);
    assert.equal(f.visible().length, 0, "pending reads do not look empty");
    f.requests.at(-1).resolve(f.success({ [f.field]: [], total: 0 }));
    await settle();
    assert.equal(f.state[f.busy], false);
    assert.equal(f.state.emptyStateLoaded, true);
    assert.equal(f.visible().length, 1, "confirmed empty data shows its real placeholder");
    f.read();
    assert.equal(f.state.emptyStateLoaded, false);
    f.requests.at(-1).reject(new Error("Synthetic read failure"));
    await settle();
    assert.equal(f.state.emptyStateLoaded, false);
    assert.equal(f.visible().length, 0, "a failed refresh must not retain empty onboarding");
    assert.ok(f.notices.length, "native notification remains available");
  });
}

test("table-products cache, malformed payloads and cancellation do not establish a false empty catalog", async () => {
  const f = fixture(definitions[0]);
  f.read();
  const old = f.requests[0];
  old.cached({ products: [], total: 0 });
  assert.equal(f.visible().length, 0, "cache cannot hide pending loading");
  f.read();
  old.resolve({ products: [], total: 0 });
  await settle();
  assert.equal(f.state.busy_fetch, true, "old finally cannot release the new read");
  assert.equal(f.state.emptyStateLoaded, false);
  f.requests[1].resolve({ products: null, total: 0 });
  await settle();
  assert.equal(f.state.emptyStateLoaded, false);
  assert.equal(f.visible().length, 0);
  f.read();
  const current = f.requests[2];
  current.cached({ products: [], total: 0 });
  current.reject(new Error("Synthetic refresh failure"));
  await settle();
  assert.equal(f.visible().length, 0);
  f.read();
  f.requests[3].resolve({ products: [] });
  await settle();
  assert.equal(f.state.emptyStateLoaded, false, "missing total is not a confirmed empty read");
});

test("table-products preserves filtered no-match guidance and its specification picker boundary", async () => {
  const f = fixture(definitions[0]);
  f.read(); f.requests[0].resolve({ products: [], total: 0 }); await settle();
  f.state.search = "synthetic search";
  assert.equal(f.visible()[0].props.title, "dashboard_empty_state.no_results.title");
  f.state.search = ""; f.state.filters = ["PHYSICAL"];
  assert.equal(f.visible()[0].props.description, "dashboard_empty_state.no_results.description");
  f.state.filters = []; f.state.set = "spec";
  assert.equal(f.visible().length, 0, "the read-only specification picker keeps its ordinary no-data copy");
});

test("a positive server total keeps empty-page recovery distinct from a first-record prompt", async () => {
  for (const definition of definitions.filter(([path]) => !path.startsWith('app/') && !path.startsWith('subscription/'))) {
    const f = fixture(definition);
    f.read(); f.requests[0].resolve(f.success({ [f.field]: [], total: 12 })); await settle();
    const empty = f.visible()[0];
    assert.equal(empty.props.title, 'dashboard_empty_state.empty_page.title', definition[0]);
    assert.equal(empty.props.description, 'dashboard_empty_state.empty_page.description', definition[0]);
  }
});

test("overlapping collection reads cannot expose an older empty response while a new query is pending", async () => {
  for (const definition of definitions.filter(([path]) => !path.startsWith('app/'))) {
    const f = fixture(definition);
    f.read(); const old = f.requests[0]; f.read();
    assert.equal(f.requests.length, 2, definition[0]);
    old.resolve(f.success({ [f.field]: [], total: 0 })); await settle();
    assert.equal(f.state[f.busy], true, definition[0]);
    assert.equal(f.state.emptyStateLoaded, false, definition[0]);
    assert.equal(f.visible().length, 0, definition[0]);
    f.requests[1].resolve(f.success({ [f.field]: [], total: 0 })); await settle();
    assert.equal(f.state[f.busy], false, definition[0]);
    assert.equal(f.visible().length, 1, definition[0]);
  }
});
