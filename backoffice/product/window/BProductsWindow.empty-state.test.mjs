import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { baseParse, compile } from "@vue/compiler-dom";
import { compileStyle, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BProductsWindow.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const ProductType = Object.fromEntries(["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map(code => [code, { code }]));
const ProductStatus = Object.fromEntries(["Open", "Close", "Pending", "Rejected", "Unlisted"].map(code => [code, { code }]));
const all = node => [node, ...(node.children || []).flatMap(all)];
const ast = all(baseParse(descriptor.template.content));
const hasClass = (node, value) => node.props?.some(prop => prop.name === "class" && prop.value?.content.split(/\s+/).includes(value));
const empty = ast.find(node => hasClass(node, "b-products-window__empty"));
const loading = ast.find(node => node.tag === "b-list-loading-state" && node.loc.source.includes('v-if="showCatalogLoading"'));
const refresh = ast.find(node => hasClass(node, "b-products-window__refresh"));
const location = ast.find(node => hasClass(node, "b-products-window__location") && node.loc.source.includes('v-if="modern"'));
const catalog = ast.find(node => node.props?.some(prop => prop.name === "id" && prop.value?.content === "manage-panel"));
assert.ok(empty && loading && refresh && location && catalog);
const render = source => new Function("Vue", compile(source, { mode: "function", prefixIdentifiers: true }).code)({
  ...Vue,
  resolveComponent: name => ({ name }),
  resolveDirective: () => ({}),
  withDirectives: node => node,
  renderSlot: (slots, name, props) => slots[name]?.(props) || [],
});
const renderBoundary = render(descriptor.template.content.slice(loading.loc.start.offset, catalog.loc.end.offset));
const renderRefresh = render(refresh.loc.source);
const renderLocation = render(location.loc.source);
const renderEmpty = render(empty.loc.source);
const panel = parse(readFileSync(new URL("../panel/BProductsPanel.vue", import.meta.url), "utf8")).descriptor;
const creation = all(baseParse(panel.template.content)).find(node => hasClass(node, "b-products-panel__creation-actions"));
assert.ok(creation);
const renderCreation = render(creation.loc.source);
const messages = Object.fromEntries(["en", "fa"].map(language => {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(`../../../../translate/dashboard/${language}.ts`, import.meta.url), "utf8")), { exports });
  return [language, exports.default];
}));
const translate = (language, key) => {
  if (!key.startsWith("product_panel.workspace.")) return key;
  const value = key.split(".").reduce((object, part) => object?.[part], messages[language]);
  assert.equal(typeof value, "string", `Missing ${language} translation: ${key}`);
  return value;
};
const nodes = (value, found = []) => {
  if (Array.isArray(value)) value.forEach(node => nodes(node, found));
  else if (value && typeof value === "object") {
    found.push(value);
    if (Array.isArray(value.children)) nodes(value.children, found);
    else if (typeof value.children?.default === "function") nodes(value.children.default(), found);
  }
  return found;
};
const type = node => typeof node.type === "string" ? node.type : node.type?.name;
const branchTypes = node => Array.isArray(node) ? node.flatMap(branchTypes) : node.type === Vue.Fragment ? branchTypes(node.children) : [type(node)];
const text = tree => nodes(tree).map(node => typeof node.children === "string" ? node.children : "").join(" ");
const plain = value => JSON.parse(JSON.stringify(value));
const response = overrides => ({ products: [], folders: [], total: 0, parent: null, ...overrides });
function fixture({ modern = true, set = null, vendorPanel = false, language = "en" } = {}) {
  const requests = [], emitted = [], notices = [], routes = [];
  const sdk = scope => ({
    optimize(ttl) { this.ttl = ttl; return this; },
    cancellation() { return this; },
    list(id, offset, limit, params) {
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      const request = { scope, id, offset, limit, params, resolve, reject, ttl: this.ttl };
      promise.cache = callback => { request.cached = callback; return promise; };
      requests.push(request);
      return promise;
    },
  });
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports, console: { log() {} }, setTimeout, clearTimeout,
    require(path) {
      if (path === "vue") return Vue;
      if (path.includes("ProductType")) return { ProductType };
      if (path.includes("ProductStatus")) return { ProductStatus };
      if (path.includes("BusinessModel")) return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (path.includes("ShopPermissions")) return { ShopPermissionRegions: { PRODUCTS: { code: "PRODUCTS" } } };
      if (path.includes("Slugify") || path.includes("slugify")) return { Slugify: { apply: value => value } };
      if (path.includes("/models")) return { Category: {}, Product: {} };
      if (path.includes("BProductBreadcrumbsHelper")) return { BProductBreadcrumbsHelper: { GenerateCategoryHierarchy: () => [] } };
      if (path.includes("NotificationService")) return { default: { showLaravelError: error => notices.push(error) } };
      if (path === "lodash-es") return { isObject: value => value !== null && typeof value === "object" };
      return { default: {} };
    },
    window: { $backoffice: { product: sdk("shop") }, $vendor: { product: sdk("vendor") } },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props).map(([key, prop]) => [key, prop.default ?? (prop === Boolean || prop.type?.name === "Boolean" ? false : undefined)]));
  const state = {
    ...defaults, ...component.data(), modern, set,
    shop: { id: 42, model: "MARKETPLACE", marketplace: { product: true, category: true } },
    vendor: vendorPanel ? { id: 9 } : null,
    $route: { name: "BPageShopProductsList", query: {}, params: vendorPanel ? { vendor_id: 9 } : {}, matched: [{ meta: { vendor: vendorPanel } }] },
    $vuetify: { display: { lgAndUp: true, md: false, sm: false, xs: false, width: 1440 } },
    $store: { getters: {} }, $attrs: {}, $refs: {}, $slots: {},
    $t: (key, params = {}) => Object.entries(params).reduce((copy, [name, value]) => copy.replaceAll(`{${name}}`, String(value)), translate(language, key)),
    $n: String, $nextTick: callback => callback(),
    $router: { push: route => routes.push(route) },
    $emit: (...args) => emitted.push(args), writeShopAccess: () => true,
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: getter.bind(state) });
  return { state, component, requests, notices, emitted, routes };
}
async function load(f, data = response()) {
  f.state.fetchData(true);
  f.requests.at(-1).resolve(data);
  await setImmediate();
}
function watchedFixture(props = {}) {
  const f = fixture(props), globals = f.state;
  const renderer = Vue.createRenderer({
    patchProp() {}, insert() {}, remove() {}, createElement: () => ({}),
    createText: () => ({}), createComment: () => ({}), setText() {},
    setElementText() {}, parentNode: () => null, nextSibling: () => null,
  });
  const app = renderer.createApp({
    ...f.component,
    // Request initiation and document shortcuts are external to this watcher regression.
    created: undefined, mounted: undefined, beforeUnmount: undefined, render: () => null,
  }, { modern: true, shop: globals.shop, vendor: globals.vendor, ...props });
  for (const key of ["$route", "$vuetify", "$store", "$t", "$n", "writeShopAccess"])
    app.config.globalProperties[key] = globals[key];
  const warnings = [];
  app.config.warnHandler = message => warnings.push(message);
  app.config.errorHandler = error => { throw error; };
  f.state = app.mount({});
  return { ...f, warnings, close: () => app.unmount() };
}

test("real catalog template/script and scoped artwork styles compile", () => {
  assert.deepEqual(ts.createSourceFile("window.ts", descriptor.script.content, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "catalog-empty" }).errors, []);
  for (const style of descriptor.styles.filter(style => !style.src))
    assert.deepEqual(compileStyle({ source: style.content, filename: file.pathname, id: "catalog-empty", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
});

test("Pipeline fills only a pending catalog without rows; refresh keeps the existing catalog", async () => {
  for (const dir of [null, 7]) for (const mini of [false, true]) {
    const f = fixture();
    f.state.current_dir_id = dir;
    f.state.mini = mini;
    f.state.fetchData(true);
    assert.equal(f.state.showCatalogLoading, true);
    assert.ok(branchTypes(renderBoundary(f.state, [])).includes("b-list-loading-state"));
    assert.ok(!branchTypes(renderBoundary(f.state, [])).includes("v-row"));
    assert.equal(f.state.showCatalogEmpty, false);
    f.requests.at(-1).resolve(response({ products: [{ id: 8, title: "Existing product" }], total: 1 }));
    await setImmediate();
    const existing = f.state.products;
    f.state.fetchData(true);
    assert.equal(f.state.products, existing);
    assert.equal(f.state.showCatalogLoading, false);
    assert.ok(branchTypes(renderBoundary(f.state, [])).includes("v-row"));
    assert.ok(branchTypes(renderRefresh(f.state, [])).includes("b-list-loading-state"));
    f.requests.at(-1).reject(new Error("Synthetic refresh failure"));
    await setImmediate();
    assert.equal(f.state.products, existing);
    assert.equal(f.state.showCatalogLoading, false);
    assert.ok(!branchTypes(renderRefresh(f.state, [])).includes("b-list-loading-state"));
  }
});

test("initial/reset null arrays remain pending presentation, and errors never leave a loader", async () => {
  const f = fixture();
  for (const value of [null, undefined, []]) {
    f.state.products = value;
    f.state.folders = value;
    f.state.busy_fetch = true;
    assert.equal(f.state.showCatalogLoading, true);
    f.state.busy_fetch = false;
    assert.equal(f.state.showCatalogLoading, false);
  }
  f.state.products = [];
  f.state.folders = [];
  f.state.fetchData(true);
  f.requests.at(-1).reject(new Error("Synthetic initial failure"));
  await setImmediate();
  assert.equal(f.state.showCatalogLoading, false);
  assert.equal(f.state.showCatalogEmpty, false);
  assert.equal(f.notices.length, 1);
  f.state.modern = false;
  f.state.busy_fetch = true;
  assert.equal(f.state.showCatalogLoading, false, "Legacy mode keeps its existing loading treatment");
});

test("only a successful current read opens the same empty state at root/category in both catalog views", async () => {
  for (const vendorPanel of [false, true]) for (const mini of [false, true]) for (const dir of [null, 7]) {
    const f = fixture({ vendorPanel });
    f.state.mini = mini;
    f.state.current_dir_id = dir;
    assert.equal(f.state.catalogReadContext, null);
    assert.equal(f.state.showCatalogEmpty, false);
    assert.ok(branchTypes(renderBoundary(f.state, [])).includes("v-row"));
    f.state.fetchData();
    assert.equal(f.state.busy_fetch, true);
    f.requests[0].cached(response({ parent: dir ? { id: dir, title: "Empty category" } : null }));
    assert.equal(f.state.showCatalogEmpty, false, "A cached empty snapshot cannot replace pending loading");
    const data = Object.freeze(response({ products: Object.freeze([]), folders: Object.freeze([]) }));
    f.requests[0].resolve(data);
    await setImmediate();
    assert.equal(f.state.showCatalogEmpty, true);
    const branches = branchTypes(renderBoundary(f.state, []));
    assert.ok(branches.includes("section"));
    assert.ok(!branches.includes("v-row"));
    assert.deepEqual(plain(f.state.catalogReadContext), { shopId: 42, ...(vendorPanel ? { vendorId: 9 } : {}), dir });
    assert.equal(f.state.products, data.products);
    assert.equal(f.state.folders, data.folders);
    assert.equal(f.requests[0].scope, vendorPanel ? "vendor" : "shop");
    assert.equal(f.requests[0].params.dir, dir);
    f.state.catalogReadContext = null;
    assert.equal(f.state.showCatalogEmpty, false, "Reset to unready must remove creation guidance");
  }
});

test("failed reads, including a failed refresh after cached empty data, never masquerade as an empty catalog", async () => {
  for (const cached of [false, true]) {
    const f = fixture();
    await load(f);
    assert.equal(f.state.showCatalogEmpty, true);
    f.state.fetchData(true);
    assert.equal(f.state.catalogReadContext, null);
    if (cached) f.requests.at(-1).cached(response());
    f.requests.at(-1).reject(new Error("Synthetic unavailable response"));
    await setImmediate();
    assert.equal(f.state.busy_fetch, false);
    assert.equal(f.state.catalogReadContext, null);
    assert.equal(f.state.showCatalogEmpty, false);
    assert.equal(f.notices.length, 1);
  }
});

test("products, categories, missing totals and null/missing arrays do not become a positive empty state", async () => {
  for (const data of [
    response({ products: [{ id: 3, title: "Product" }], total: 1 }),
    response({ folders: [{ id: 7, title: "Folder" }] }),
    response({ total: 1 }), response({ total: null }), response({ total: undefined }),
    response({ products: null }), response({ products: undefined }),
    response({ folders: null }), response({ folders: undefined }),
  ]) {
    const f = fixture();
    await load(f, data);
    assert.equal(f.state.showCatalogEmpty, false);
  }
});

test("removing the last local row confirms the server total once before showing empty guidance", async () => {
  for (const kind of ["products", "folders"]) {
    const f = watchedFixture();
    try {
      await load(f, response({ [kind]: [{ id: 8, title: "Last visible item" }], total: 1 }));
      assert.equal(f.state.catalogHasNoItems, false);
      f.state[kind].splice(0, 1);
      await Vue.nextTick();
      assert.equal(f.requests.length, 2);
      assert.equal(f.requests[1].ttl, 0, "Use the existing forced authorized read");
      assert.equal(f.state.busy_fetch, true);
      assert.equal(f.state.showCatalogEmpty, false);
      f.requests[1].resolve(response());
      await setImmediate();
      await Vue.nextTick();
      assert.equal(f.state.showCatalogEmpty, true);
      await Vue.nextTick();
      assert.equal(f.requests.length, 2, "A confirmed empty response does not loop");
      assert.deepEqual(f.warnings, []);
    } finally { f.close(); }
  }
});

test("last-row confirmation reveals remaining records or keeps a failed read unavailable without retrying", async () => {
  for (const outcome of ["remaining", "failed"]) {
    const f = watchedFixture();
    try {
      await load(f, response({ products: [{ id: 8 }], total: 1 }));
      f.state.products.pop();
      await Vue.nextTick();
      assert.equal(f.requests.length, 2);
      if (outcome === "remaining") f.requests[1].resolve(response({ products: [{ id: 9 }], total: 1 }));
      else f.requests[1].reject(new Error("Synthetic confirmation failure"));
      await setImmediate();
      await Vue.nextTick();
      assert.equal(f.state.showCatalogEmpty, false);
      assert.equal(f.state.busy_fetch, false);
      assert.equal(f.requests.length, 2);
      if (outcome === "remaining") assert.equal(f.state.products[0].id, 9);
      else {
        assert.equal(f.state.catalogReadContext, null);
        assert.equal(f.notices.length, 1);
      }
      assert.deepEqual(f.warnings, []);
    } finally { f.close(); }
  }
});

test("last-row removal does not refresh filtered, pending, picker, legacy or dragging contexts", async () => {
  const cases = [
    { props: { modern: false } }, { props: { set: "spec" } },
    { props: { selectMode: true } }, { props: { dialogMode: true } },
    { props: { showDeletes: true } },
    { change: state => { state.search = "lamp"; } },
    { change: state => { state.filters = ["PHYSICAL"]; } },
    { change: state => { state.only_available = true; } },
    { change: state => { state.vendor_filter = 9; } },
    { change: state => { state.busy_fetch = true; } },
    { change: state => { state.product_page = 2; } },
    { change: state => { state.current_dragged_product = { id: 8 }; } },
    { change: state => { state.catalogReadContext = null; } },
    { change: state => { state.catalogReadContext.shopId = 99; } },
  ];
  for (const scenario of cases) {
    const f = watchedFixture(scenario.props);
    try {
      await load(f, response({ products: [{ id: 8 }], total: 1 }));
      scenario.change?.(f.state);
      await Vue.nextTick();
      const before = f.requests.length;
      f.state.products.pop();
      await Vue.nextTick();
      assert.equal(f.requests.length, before, "Removal cannot trigger an extra confirmation outside a ready catalog");
      assert.equal(f.state.showCatalogEmpty, false);
      assert.deepEqual(f.warnings, []);
    } finally { f.close(); }
  }
});

test("unrelated held items keep their shelf while an emptied catalog confirms once and waits to show guidance", async () => {
  for (const held of ["held_items", "held_folders"]) {
    const f = watchedFixture();
    try {
      await load(f, response({ products: [{ id: 8 }], total: 1 }));
      f.state[held].push({ id: 99 });
      f.state.products.pop();
      await Vue.nextTick();
      assert.equal(f.requests.length, 2);
      f.requests[1].resolve(response());
      await setImmediate();
      await Vue.nextTick();
      assert.equal(f.state[held].length, 1);
      assert.equal(f.state.products_count, 0);
      assert.equal(f.state.showCatalogEmpty, false, "Do not replace a shelf that still contains held records");
      f.state[held].pop();
      await Vue.nextTick();
      assert.equal(f.state.showCatalogEmpty, true);
      assert.equal(f.requests.length, 2, "Clearing the shelf reuses the confirmed empty response");
      assert.deepEqual(f.warnings, []);
    } finally { f.close(); }
  }
});

test("search/filter/deleted/pagination/selection and held or moving items retain their existing browse states", async () => {
  const f = fixture();
  await load(f);
  const cases = {
    search: "lamp", filters: ["PHYSICAL"], only_available: true, vendor_filter: 7,
    showDeletes: true, product_page: 2, selectMode: true, dialogMode: true,
    set: "spec", modern: false, held_items: [{ id: 2 }], held_folders: [{ id: 7 }],
    current_dragged_product: { id: 2 }, current_dragged_folder: { id: 7 },
  };
  for (const [key, value] of Object.entries(cases)) {
    const previous = f.state[key];
    f.state[key] = value;
    assert.equal(f.state.showCatalogEmpty, false, key);
    f.state[key] = previous;
    assert.equal(f.state.showCatalogEmpty, true);
  }
  f.state.$route.query.types = "FILE";
  assert.equal(f.state.showCatalogEmpty, false, "Type-route views are filtered results");
});

test("older success/cache/failure/finally callbacks cannot overwrite a newer location or stop its loading", async () => {
  for (const settleOld of ["resolve", "reject"]) {
    const f = fixture();
    f.state.fetchData();
    const old = f.requests[0];
    f.state.current_dir_id = 7;
    f.state.fetchData();
    const current = f.requests[1];
    old.cached(response({ folders: [{ id: 99 }] }));
    old[settleOld](settleOld === "resolve" ? response() : undefined);
    await setImmediate();
    assert.equal(f.state.busy_fetch, true);
    assert.equal(f.state.catalogReadContext, null);
    assert.deepEqual(plain(f.state.folders), []);
    assert.equal(f.notices.length, 0);
    current.resolve(response({ parent: { id: 7, title: "Current category" } }));
    await setImmediate();
    assert.equal(f.state.busy_fetch, false);
    assert.equal(f.state.showCatalogEmpty, true);
    assert.equal(f.state.parent_folders.id, 7);
    old.cached(response({ products: [{ id: 99 }], total: 1 }));
    assert.equal(f.state.showCatalogEmpty, true, "A late cache callback cannot change accepted current data");
  }
});

test("shop/vendor changes hide old readiness and prevent in-flight responses from changing the new scope", async () => {
  for (const change of [state => { state.shop.id = 99; }, state => { state.vendor = { id: 11 }; }]) {
    const f = fixture();
    await load(f);
    change(f.state);
    assert.equal(f.state.showCatalogEmpty, false);
    f.state.fetchData(true);
    const old = f.requests.at(-1);
    f.state.shop.id = 100;
    old.cached(response());
    old.resolve(response());
    await setImmediate();
    assert.equal(f.state.catalogReadContext, null);
    assert.equal(f.state.showCatalogEmpty, false);
    await load(f);
    assert.equal(f.state.showCatalogEmpty, true);
  }
});

test("empty guidance preserves one permission-gated native action slot and localized inert artwork", async () => {
  for (const language of ["en", "fa"]) {
    const f = fixture({ language });
    await load(f);
    for (const CAN_ADD_PRODUCT of [false, true]) for (const CAN_ADD_CATEGORY of [false, true]) {
      const parent = { CAN_ADD_PRODUCT, CAN_ADD_CATEGORY, add_product_dialog: false, dialog_add_category: false, $t: f.state.$t };
      let invocations = 0;
      f.state.$slots["breadcrumb-append"] = () => { invocations++; return renderCreation(parent, []); };
      renderLocation(f.state, []);
      const view = renderEmpty(f.state, []), content = nodes(view);
      assert.equal(invocations, 1, "The toolbar must not duplicate the centered action slot");
      const buttons = content.filter(node => type(node) === "v-btn");
      assert.equal(buttons.length, Number(CAN_ADD_PRODUCT) + Number(CAN_ADD_CATEGORY));
      for (const button of buttons) button.props.onClick();
      assert.equal(parent.add_product_dialog, CAN_ADD_PRODUCT);
      assert.equal(parent.dialog_add_category, CAN_ADD_CATEGORY);
      const svg = content.find(node => type(node) === "svg");
      assert.equal(svg.props["aria-hidden"], "true");
      assert.equal(svg.props.focusable, "false");
      assert.ok(!svg.props.onClick && !svg.props.tabindex);
      assert.ok(text(view).includes(translate(language, "product_panel.workspace.empty_catalog.title")));
      assert.ok(text(view).includes(translate(language, "product_panel.workspace.empty_catalog.description")));
      f.state.products = [{ id: 8 }];
      invocations = 0;
      renderLocation(f.state, []);
      renderEmpty(f.state, []);
      assert.equal(invocations, 1, "After adding content the same actions return to the toolbar");
      f.state.products = [];
    }
  }
});

test("artwork motion is brief, finite and complete when reduced motion disables it", () => {
  const style = descriptor.styles.filter(style => !style.src).map(style => style.content).join("\n");
  const artwork = style.slice(style.indexOf(".b-products-window__empty {"), style.indexOf(".b-products-window--list {"));
  const durations = [...artwork.matchAll(/animation:\s*catalog-[\w-]+\s+([\d.]+)s/g)].map(match => Number(match[1]));
  assert.ok(durations.length >= 1);
  assert.ok(durations.every(duration => duration > 0 && duration <= 4));
  assert.ok(!/infinite|animation-iteration-count:\s*(?:[2-9]|infinite)/.test(artwork));
  assert.match(artwork, /prefers-reduced-motion:\s*reduce/);
  assert.match(artwork, /animation:\s*none/);
  assert.match(artwork, /100%\s*\{\s*opacity:\s*1/);
});

test("an empty category retains its native Back route while the store root has no Back action", async () => {
  for (const language of ["en", "fa"]) for (const mini of [false, true]) {
    const f = fixture({ language });
    f.state.mini = mini;
    await load(f);
    const back = () => nodes(renderEmpty(f.state, [])).find(node => String(node.props?.class || "").split(/\s+/).includes("b-products-window__empty-back"));
    assert.equal(back(), undefined);
    for (const parent of [null, { id: 10, title: "Parent category" }]) {
      f.state.current_dir_id = 7;
      await load(f, response({ parent: { id: 7, title: "Empty category", parent } }));
      const button = back();
      assert.ok(button);
      assert.equal(type(button), "v-btn");
      assert.ok(text(button).includes(parent?.title || "global.commons.home"));
      const requestCount = f.requests.length;
      button.props.onClick();
      const destination = f.routes.at(-1);
      assert.equal(destination.query.dir, parent?.id);
      assert.equal(destination.query["no-scroll"], true);
      assert.equal(f.state.loading_cat, parent);
      assert.equal(f.requests.length, requestCount, "Back delegates to native route navigation without a separate read or mutation");
    }
  }
});

test("right-clicking the empty illustration keeps the existing empty-space menu in either modern view", () => {
  for (const modern of [false, true]) for (const mini of [false, true]) {
    const f = fixture({ modern });
    f.state.mini = mini;
    let prevented = false;
    f.state.showMenu({
      target: { id: "", closest: selector => selector === ".b-products-window__empty" ? {} : null },
      type: "contextmenu", clientX: 22, clientY: 33,
      preventDefault: () => { prevented = true; },
    });
    assert.equal(f.state.showProductMenu, modern);
    assert.equal(prevented, modern);
    assert.equal(f.requests.length, 0);
    if (modern) {
      assert.equal(f.state.currentProductForMenu, undefined);
      assert.equal(f.state.currentCategoryForMenu, undefined);
      assert.equal(f.state.x, 22);
      assert.equal(f.state.y, 33);
    }
  }
});
