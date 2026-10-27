import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";

// Real list/customer templates; requests, routing and UI leaves stay isolated.
const calls = [], requests = [], copied = [];
const plain = (value) => JSON.parse(JSON.stringify(value));
const leaf = (name) => Vue.defineComponent({
  name,
  inheritAttrs: false,
  setup: (_, { attrs, slots }) => () => {
    calls.push({ name, attrs });
    const content = name === "v-data-table-server"
      ? attrs.items.flatMap((item) => attrs.headers.flatMap((header) => slots[`item.${header.value}`]?.({ item }) ?? []))
      : slots.default?.();
    return Vue.h(name === "RouterLink" ? "a" : "div", { "data-leaf": name }, content);
  },
});
function evaluate(source, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, ...globals });
  return exports;
}
const Basket = evaluate(readFileSync(new URL("../../../../core-js/models/shop/order/basket/basket.model.ts", import.meta.url), "utf8"), {
  require: (name) => ({ default: name, Product: { ProductType: {} } }),
}).Basket;
const ProductType = Object.fromEntries(["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [code, { code, basket: `/test/${code}.svg` }]));
const notifications = { showErrorAlert() {}, showLaravelError() {} };
const presentation = evaluate(readFileSync(new URL('./ProcessCenterPresentation.ts', import.meta.url), 'utf8'));
let Customer;
function dependency(name) {
  if (name === "vue") return Vue;
  if (name.includes('ProcessCenterPresentation')) return presentation;
  if (name.endsWith("BProcessCenterCustomer.vue")) return { default: Customer };
  if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
  if (name.endsWith(".svg") || name.endsWith(".png")) return name;
  if (name === "@selldone/core-js") return { Basket, Avocado: {}, ShopURLs: { MainShopUrl: () => "https://example.test" } };
  if (name.includes("ProductType")) return { ProductType };
  if (name === "lodash-es") return { debounce: (fn) => fn, throttle: (fn) => fn };
  if (name.includes("DateConverter")) return { DateConverter: { getFromNowNumber: () => 11 } };
  if (name.includes("CurrencyHelper")) return { CurrencyHelper: { NeedToSHowCurrencyFlag: () => true } };
  if (name.includes("TransactionStatus")) return { TransactionStatus: { RequireCapture: { code: "RequireCapture" } } };
  if (name.includes("NotificationService")) return { default: notifications };
  return { default: {}, RouteMixin: {}, OrderType: {} };
}
const isolated = {
  require: dependency,
  window: { SERACH_THROTTLE: 0, API: { GET_ORDERS: (shop, type) => `/test/shops/${shop}/orders/${type}` } },
  axios: { get: (...args) => { requests.push(args); return Promise.resolve({ data: { total: 1, orders: [] } }); } },
};
async function load(filename) {
  const { descriptor, errors } = parse(readFileSync(new URL(filename, import.meta.url), "utf8"), { filename });
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename, id: "process-test" });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({ source: style.content, filename, id: "data-v-process-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(result.errors, []);
  }
  return { ...evaluate(descriptor.script.content, isolated).default, render: evaluate(template.code, isolated).render };
}
Customer = await load("./BProcessCenterCustomer.vue");
const List = await load("./BProcessCenterList.vue");
const display = { xs: false, mdAndUp: true, width: 1400 };
const route = { params: {}, matched: [] };
function fixture(modern = false) {
  const state = { ...Object.fromEntries(Object.entries(List.props).map(([key, prop]) => [key, prop.default])), ...List.data(), modern, shop: { id: 7 }, type: ProductType.PHYSICAL, $t: (key) => key, $vuetify: { display }, $route: route };
  for (const [name, fn] of Object.entries(List.methods)) state[name] = fn.bind(state);
  for (const [name, get] of Object.entries(List.computed)) Object.defineProperty(state, name, { get: () => get.call(state) });
  return state;
}
async function render(component, props, rows = []) {
  calls.length = 0;
  const app = Vue.createSSRApp(component === List ? { ...List, mixins: [], watch: {}, created: undefined, data: () => ({ ...List.data(), orders: rows }) } : component, props);
  for (const name of ["v-row", "v-text-field", "v-data-table-server", "v-img", "v-avatar", "v-icon", "v-btn", "v-spacer", "v-chip", "v-tooltip", "v-progress-linear", "v-badge", "v-pagination", "v-menu", "v-sheet", "v-dialog", "v-card", "v-card-title", "v-card-text", "v-card-actions", "u-loading-progress", "u-price", "flag"]) app.component(name, leaf(name));
  app.component("router-link", leaf("RouterLink"));
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, $vuetify: { display, locale: { isRtl: false } }, $route: route, HIGHLIGHT_ID: null,
    getBasketOrderCode: (item) => `SM-${item.id}`, getUserAvatar: (id) => `/avatar/${id}`, copyToClipboard: (value) => copied.push(value),
    getDeliveryStateString: (state) => state, getFromNowString: () => "ago", getLocalTimeString: (date) => date,
    getLocalDateString: (date) => date,
  });
  return renderToString(app);
}

test("opt-in columns retain backend sort fields and Paid + COD selection", () => {
  assert.equal(List.props.modern.default, false);
  const legacy = fixture(), modern = fixture(true);
  assert.deepEqual(plain(legacy.status), ["Payed", "COD"]);
  assert.deepEqual(plain(legacy.headers.map((header) => header.value)), ["type", "id", "price", "status", "delivery_state", "reserved_at"]);
  assert.deepEqual(plain(modern.headers.filter((header) => header.sortable).map((header) => header.value)), ["id", "price", "status", "delivery_state", "reserved_at"]);
  assert.equal(modern.headers.find((header) => header.value === "customer").sortable, false);
});

test("modern presentation keeps bounded queries, payment projection and order routes", async () => {
  for (const modern of [false, true]) {
    const state = fixture(modern);
    Object.assign(state, { filterProductId: 31, filterCustomerId: 41, filterAffiliateId: 51, search: "sample" });
    state.fetchOrdersNow(3, "price", false);
    await new Promise((resolve) => setImmediate(resolve));
    assert.deepEqual(plain(requests.at(-1)), ["/test/shops/7/orders/PHYSICAL", { params: {
      offset: 20, limit: 10, product_id: 31, customer_id: 41, subscription_price_id: null, sortBy: "price", sortDesc: false,
      statuses: ["Payed", "COD"], search: "sample", affiliate_id: 51, shop_connect_id: null, connect_orders: true, reseller_shop_id: null, with: ["buyer", "payment-compact"],
    } }]);
    assert.deepEqual(plain(state.createRouteTo({ id: 23 })), { name: "BPageOrderPhysicalDashboard", params: { shop_id: 7, basket_id: 23 } });
    state.isVendorPanel = true;
    assert.deepEqual(plain(state.createRouteTo({ id: 23 })), { name: "VendorProcessCenterPhysicalOrderPage_Dashboard", params: { shop_id: 7, vendor_order_id: 23 } });
    state.isAffiliatePos = true;
    assert.equal(state.createRouteTo({ id: 23 }), null);
  }
});

test("real customer template preserves customer, buyer, guest and affiliate actions", async () => {
  const item = { customer_id: 11, customer: { name: "Sample Customer", phone: "12345", email: "customer@example.test" } };
  const html = await render(Customer, { item, shop: { id: 7 } });
  assert.match(html, /Sample Customer/);
  assert.match(html, /12345/);
  assert.equal(calls.find((call) => call.name === "UAvatarText").attrs.name, item.customer.name);
  assert.deepEqual(plain(calls.find((call) => call.name === "RouterLink").attrs.to), { name: "BPageCustomerDashboard", params: { customer_id: 11 } });
  const email = calls.find((call) => call.name === "v-btn").attrs;
  assert.match(email["aria-label"], /global.actions.copy.*customer@example.test/);
  assert.equal(email.title, "global.commons.email : customer@example.test");
  let stopped = false;
  email.onClick({ stopPropagation: () => { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(copied.at(-1), item.customer.email);
  await render(Customer, { item, shop: { id: 7 }, isAffiliatePos: true });
  assert.equal(calls.some((call) => call.name === "RouterLink"), false);
  assert.match(await render(Customer, { item: { buyer: { id: 12, name: "Sample Buyer" } }, shop: {} }), /Sample Buyer/);
  assert.equal(calls.find((call) => call.name === "v-img").attrs.src, "/avatar/12");
  assert.match(await render(Customer, { item: {}, shop: {} }), /global.commons.guest/);
  assert.equal(calls.some((call) => call.name === "UButtonWhatsapp"), false);
});

test("both presentations retain capture/card, basket previews, five stages and attention details", async () => {
  const row = {
    id: 23, status: "Payed", delivery_state: "PreparingOrder", currency: "USD", price: 748.55, delivery_price: 0, discount: 15,
    items: [{ product_id: 9 }, { product_id: 9 }, { product_id: 10 }],
    payment: { status: "RequireCapture", card: { brand: "visa", country: "US", card_no: "****4242" } },
    customer: { name: "Sample Customer" }, receiver_info: { country: "CA", state: "Alberta", city: "Edmonton" },
    withdraw: true, withdraw_at: "2026-10-01", created_at: "2026-10-01", updated_at: "2026-10-01", basket_item_returns: [{ id: 1 }], connect_orders: [{ id: 2 }],
  };
  for (const modern of [false, true]) {
    const html = await render(List, { modern, shop: { id: 7 }, type: ProductType.PHYSICAL }, [row]);
    const status = calls.find((call) => call.name === "SOrderStatusView").attrs;
    assert.equal(status["payment-require-capture"], true);
    assert.deepEqual(plain(status.payment.card), row.payment.card);
    const stepper = calls.find((call) => call.name === "SOrderDeliveryStatusStepper").attrs;
    assert.equal(stepper.state, row.delivery_state);
    assert.deepEqual(Object.keys(stepper.states), ["CheckQueue", "OrderConfirm", "PreparingOrder", "SentOrder", "ToCustomer"]);
    assert.equal(stepper['modern-tooltips'], modern);
    assert.deepEqual(Object.values(stepper.states).map(state => state.code), Object.values(Basket.PhysicalOrderStates).map(state => state.code));
    if (modern) assert.deepEqual(Object.values(stepper.states).map(state => state.icon), ['shopping_basket', 'check_circle', 'inventory_2', 'local_shipping', 'done_all']);
    assert.deepEqual(plain(calls.find((call) => call.name === "ProductsDenseImagesCircles").attrs.ids), ["9", "10"]);
    assert.deepEqual(plain(calls.find((call) => call.name === "SOrderStatusesSelect").attrs.modelValue), ["Payed", "COD"]);
    if (modern) {
      assert.match(html, /admin_shop\.orders\.physical\.modern\.withdrawal\.badge/);
      assert.match(html, /admin_shop\.orders\.physical\.modern\.withdrawal\.title/);
      assert.match(html, /admin_shop\.orders\.physical\.modern\.withdrawal\.requested_at/);
      assert.match(html, /admin_shop\.orders\.physical\.modern\.withdrawal\.body/);
      const badge = calls.find(call => call.name === 'v-chip' && call.attrs.class === 'b-process-center-list__withdrawal').attrs;
      assert.equal(badge['aria-label'], 'admin_shop.orders.physical.modern.withdrawal.title');
      assert.equal(badge.tabindex, 0);
      let stopped = false;
      badge.onClick({ stopPropagation: () => { stopped = true; } });
      assert.equal(stopped, true);
    } else {
      assert.match(html, /Withdrawn by customer/);
    }
    assert.match(html, /Alberta &gt; Edmonton/);
    assert.match(html, /Angry\.svg/);
    assert.ok(calls.some((call) => call.name === "ReturnRequestButtonBadge"));
    assert.ok(calls.some((call) => call.name === "ConnectOrderChip"));
    assert.match(html, /Sample Customer/);
  }
});

test('extra filters apply across server pages, preserve context and clear without null date semantics', async () => {
  const state = fixture(true);
  state.page = 4;
  state.applyExtraFilters({ productId: 9, customerId: 11, customerName: 'Sample', updatedAfter: '2026-10-20T10:30:00.000Z' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state.page, 1);
  let query = plain(requests.at(-1)[1].params);
  assert.equal(query.offset, 0);
  assert.equal(query.product_id, 9);
  assert.equal(query.customer_id, 11);
  assert.equal(query.updated_at, '2026-10-20 10:30:00');

  Object.assign(state, { filterProductId: 31, filterCustomerId: 41 });
  state.fetchOrdersNow(2);
  await new Promise(resolve => setImmediate(resolve));
  query = plain(requests.at(-1)[1].params);
  assert.equal(query.product_id, 31);
  assert.equal(query.customer_id, 41);
  assert.equal(query.offset, 10);

  state.removeExtraFilter('updatedAfter');
  state.removeExtraFilter('customerId');
  await new Promise(resolve => setImmediate(resolve));
  query = plain(requests.at(-1)[1].params);
  assert.equal(Object.hasOwn(query, 'updated_at'), false);
  assert.equal(state.extraFilters.customerName, '');
  assert.equal(state.page, 1);

  state.page = 3;
  List.watch.search.call(state, 'new search', 'old search');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(state.page, 1);
});

test('late unfiltered responses cannot replace filtered results or clear their loading state', async () => {
  const originalGet = isolated.axios.get;
  const pending = [];
  isolated.axios.get = () => new Promise((resolve, reject) => pending.push({ resolve, reject }));
  const settle = () => new Promise(resolve => setImmediate(resolve));
  try {
    const state = fixture(true);
    state.fetchOrdersNow(1);
    state.extraFilters.productId = 9;
    state.fetchOrdersNow(1);
    pending[0].resolve({ data: { total: 99, orders: [{ id: 'old' }] } });
    await settle();
    assert.equal(state.busy_fetch, true);
    assert.deepEqual(plain(state.orders), []);
    pending[1].resolve({ data: { total: 1, orders: [{ id: 'filtered' }] } });
    await settle();
    assert.equal(state.busy_fetch, false);
    assert.deepEqual(plain(state.orders), [{ id: 'filtered' }]);

    state.fetchOrdersNow(1);
    state.fetchOrdersNow(1);
    pending[3].resolve({ data: { total: 2, orders: [{ id: 'latest' }] } });
    await settle();
    pending[2].resolve({ data: { total: 999, orders: [{ id: 'stale' }] } });
    await settle();
    assert.equal(state.totalItems, 2);
    assert.deepEqual(plain(state.orders), [{ id: 'latest' }]);
  } finally {
    isolated.axios.get = originalGet;
  }
});
