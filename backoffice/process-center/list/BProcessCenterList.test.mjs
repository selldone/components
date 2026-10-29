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
const Avocado = evaluate(readFileSync(new URL("../../../../core-js/models/shop/order/avocado/avocado.order.ts", import.meta.url), "utf8")).Avocado;
const { OrderType } = evaluate(readFileSync(new URL("../../../../core-js/enums/order/OrderType.ts", import.meta.url), "utf8"));
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
  if (name === "@selldone/core-js") return { Basket, Avocado, ShopURLs: { MainShopUrl: () => "https://example.test" } };
  if (name.includes("enums/order/OrderType")) return { OrderType };
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
async function render(component, props, rows = [], data = {}) {
  calls.length = 0;
  const app = Vue.createSSRApp(component === List ? { ...List, mixins: [], watch: {}, created: undefined, data: () => ({ ...List.data(), orders: rows, ...data }) } : component, props);
  for (const name of ["v-row", "v-text-field", "v-data-table-server", "v-img", "v-avatar", "v-icon", "v-btn", "v-spacer", "v-chip", "v-tooltip", "v-progress-linear", "v-badge", "v-pagination", "v-menu", "v-sheet", "v-dialog", "v-card", "v-card-title", "v-card-text", "v-card-actions", "u-loading-progress", "u-price", "flag"]) app.component(name, leaf(name));
  app.component("router-link", leaf("RouterLink"));
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, $vuetify: { display, locale: { isRtl: false } }, $route: route, HIGHLIGHT_ID: null,
    getBasketOrderCode: (item) => `SM-${item.id}`, getUserAvatar: (id) => `/avatar/${id}`, copyToClipboard: (value) => copied.push(value),
    getDeliveryStateString: (state) => state, getFromNowString: () => "ago", getLocalTimeString: (date) => date,
    getLocalDateString: (date) => date,
    getCountryName: (country) => country,
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

test("modern order types render their own stages and columns without changing canonical state metadata", async () => {
  const cases = [
    [{ type: ProductType.PHYSICAL }, Basket.PhysicalOrderStates, 5, "physical"],
    [{ type: ProductType.VIRTUAL }, Basket.VirtualOrderStates, 4, "virtual"],
    [{ type: ProductType.FILE }, Basket.FileOrderStates, 2, "file"],
    [{ type: ProductType.SERVICE }, Basket.ServiceOrderStates, 4, "service"],
    [{ type: ProductType.SUBSCRIPTION }, Basket.SubscriptionOrderStates, 5, "subscription"],
    [{ isAvocado: true }, Avocado.DeliveryStates, 5, "avocado"],
    [{ isDropShipping: true }, Basket.PhysicalOrderStates, 5, "physical"],
    [{ isPos: true }, null, 0, null],
    [{ isHyper: true }, null, 0, null],
  ];
  const canonical = cases.map(([, states]) => states && plain(states));
  for (const [index, [props, states, count, prefix]] of cases.entries()) {
    const row = { id: 23, status: "Reserved", delivery_state: "PreparingOrder", currency: "USD", price: 10, delivery_price: 0, items: [], contents: [] };
    await render(List, { modern: true, shop: { id: 7 }, ...props }, [row]);
    const headers = calls.find(call => call.name === "v-data-table-server").attrs.headers;
    assert.deepEqual(plain(headers.map(header => header.value)), ["id", "customer", ...(props.isDropShipping ? ["country"] : []), "price", "status", ...(count ? ["delivery_state"] : []), "reserved_at"]);
    const stepper = calls.find(call => call.name === "SOrderDeliveryStatusStepper")?.attrs;
    if (count) {
      assert.equal(Object.keys(stepper.states).length, count);
      assert.deepEqual(Object.values(stepper.states).map(state => state.code), Object.values(states).map(state => state.code));
      assert.equal(stepper["modern-tooltip-prefix"], prefix === "physical" ? "admin_shop.orders.physical.modern.stages" : `admin_shop.orders.modern.${prefix}.stages`);
      assert.notEqual(stepper.states, states);
      if (props.type === ProductType.FILE) assert.deepEqual(Object.values(stepper.states).map(state => state.icon), ["link", "cloud_download"]);
      assert.deepEqual(plain(states), canonical[index]);
    } else {
      assert.equal(stepper, undefined);
    }
  }
  for (const [index, [, states]] of cases.entries()) if (states) assert.deepEqual(plain(states), canonical[index]);
});

test("special order queries request buyers and preserve the dropshipping reseller and country scope", async () => {
  for (const [flag, code, dashboard] of [
    ["isPos", "POS", "BPageOrderPosDashboard"],
    ["isAvocado", "AVOCADO", "BPageOrderAvocadoDashboard"],
    ["isHyper", "HYPER", "BPageOrderHyperDashboard"],
    ["isDropShipping", "DROPSHIPPING", "BPageOrderFulfillmentDashboard"],
  ]) {
    const state = fixture(true);
    Object.assign(state, { type: undefined, [flag]: true, resellerShopId: 55 });
    state.fetchOrdersNow(3, flag === "isDropShipping" ? "country" : "id", false);
    await new Promise(resolve => setImmediate(resolve));
    const [url, { params }] = plain(requests.at(-1));
    assert.equal(url, `/test/shops/7/orders/${code}`);
    assert.equal(params.buyer, true);
    assert.equal(params.offset, 20);
    assert.equal(params.limit, 10);
    assert.deepEqual(params.with, ["buyer", "payment-compact"]);
    assert.equal(params.reseller_shop_id, flag === "isDropShipping" ? 55 : null);
    assert.equal(params.sortBy, flag === "isDropShipping" ? "country" : "id");
    assert.deepEqual(plain(state.createRouteTo({ id: 23 })), { name: dashboard, params: { shop_id: 7, basket_id: 23 } });
    if (flag === "isDropShipping") {
      assert.equal(state.headers.find(header => header.value === "customer").title, "admin_shop.orders.modern.reseller");
      assert.equal(state.headers.find(header => header.value === "country").sortable, true);
    }
  }
});

test("type capabilities omit unsupported extra query filters while fixed context retains precedence", async () => {
  for (const [flag, unsupported] of [["isPos", "updated_at"], ["isAvocado", "product_id"], ["isDropShipping", "customer_id"], ["isHyper", null]]) {
    const state = fixture(true);
    Object.assign(state, { type: undefined, [flag]: true, extraFilters: { productId: 9, customerId: 11, customerName: "Sample", updatedAfter: "2026-10-20T10:30:00.000Z" } });
    state.fetchOrdersNow(2);
    await new Promise(resolve => setImmediate(resolve));
    let query = plain(requests.at(-1)[1].params);
    for (const [key, value] of [["product_id", 9], ["customer_id", 11], ["updated_at", "2026-10-20 10:30:00"]]) {
      if (key === unsupported) assert.equal(Object.hasOwn(query, key), false);
      else assert.equal(query[key], value);
    }
    Object.assign(state, { filterProductId: 31, filterCustomerId: 41 });
    state.fetchOrdersNow(2);
    await new Promise(resolve => setImmediate(resolve));
    query = plain(requests.at(-1)[1].params);
    assert.equal(query.product_id, 31);
    assert.equal(query.customer_id, 41);
    if (unsupported === "updated_at") assert.equal(Object.hasOwn(query, "updated_at"), false);

    await render(List, { modern: true, shop: { id: 7 }, [flag]: true, filterProductId: 31, filterCustomerId: 41 }, [], { dialogExtraFilters: true });
    const filters = calls.find(call => call.name === "BProcessCenterFilters").attrs;
    assert.equal(filters["allow-product"], flag !== "isAvocado");
    assert.equal(filters["allow-customer"], flag !== "isDropShipping");
    assert.equal(filters["allow-updated-after"], flag !== "isPos");
    assert.equal(filters["fixed-product-id"], 31);
    assert.equal(filters["fixed-customer-id"], 41);
  }
});

test("subscription plan primitive and object IDs share a stable watcher and bounded query", async () => {
  const state = fixture(true);
  state.type = ProductType.SUBSCRIPTION;
  const choose = async (value) => {
    const previous = state.selectedSubscriptionPriceId;
    state.selected_subscription_price = value;
    List.watch.selectedSubscriptionPriceId.call(state, state.selectedSubscriptionPriceId, previous);
    await new Promise(resolve => setImmediate(resolve));
  };
  state.page = 4;
  await choose(17);
  assert.equal(state.page, 1);
  assert.equal(requests.at(-1)[1].params.subscription_price_id, 17);
  const requestCount = requests.length;
  await choose({ id: 17, title: "Same selected plan" });
  assert.equal(requests.length, requestCount);
  await choose({ id: 18 });
  assert.equal(requests.at(-1)[1].params.subscription_price_id, 18);
  state.page = 3;
  await choose(null);
  assert.equal(state.page, 1);
  assert.equal(requests.at(-1)[1].params.subscription_price_id, null);
  assert.equal(requests.at(-1)[1].params.offset, 0);
  state.filterSubscriptionPriceId = 21;
  await choose({ id: 22 });
  assert.equal(requests.at(-1)[1].params.subscription_price_id, 21);
});

test("dropshipping renders the reseller buyer without linking their end customer into this shop", async () => {
  const row = {
    id: 23, status: "Payed", delivery_state: "PreparingOrder", currency: "USD", price: 10, delivery_price: 0, contents: [], country: "CA",
    buyer: { id: 12, name: "Reseller Buyer", phone: "12345" }, customer_id: 91, customer: { name: "Reseller End Customer" },
  };
  const html = await render(List, { modern: true, shop: { id: 7 }, isDropShipping: true, resellerShopId: 55 }, [row]);
  assert.match(html, /Reseller Buyer/);
  assert.doesNotMatch(html, /Reseller End Customer/);
  assert.equal(calls.some(call => call.name === "RouterLink" && call.attrs.to?.name === "BPageCustomerDashboard"), false);
  assert.equal(calls.find(call => call.name === "v-img" && call.attrs.src === "/avatar/12")?.attrs.src, "/avatar/12");
  assert.equal(calls.find(call => call.name === "flag").attrs.iso, "CA");
  assert.deepEqual(plain(calls.find(call => call.name === "RouterLink").attrs.to), { name: "BPageOrderFulfillmentDashboard", params: { shop_id: 7, basket_id: 23 } });
});

test("Avocado retains custom title, message, raw item images and fulfillment progress", async () => {
  const row = {
    id: 23, title: "Custom order", message: "Order instructions", progress: 65, status: "Reserved", delivery_state: "PreparingOrder",
    currency: "USD", price: 10, delivery_price: 0, items: [{ image: "test/first.webp" }, { image: null }, { image: "test/second.webp" }],
  };
  const html = await render(List, { modern: true, shop: { id: 7 }, isAvocado: true }, [row]);
  assert.match(html, /AVO-23/);
  assert.match(html, /Custom order/);
  assert.match(html, /Order instructions/);
  const images = calls.find(call => call.name === "ProductsDenseImagesCircles").attrs;
  assert.deepEqual(plain(images.ids), ["test/first.webp", "test/second.webp"]);
  assert.equal(images["raw-images-path"], "");
  assert.equal(calls.find(call => call.name === "v-progress-linear").attrs["model-value"], 65);
});

test("service Reserved orders remain selected for review and display waiting review before a price", async () => {
  const state = fixture(true);
  state.type = ProductType.SERVICE;
  state.fetchOrders = () => {};
  List.created.call(state);
  assert.deepEqual(plain(state.status), ["Payed", "Reserved"]);
  const html = await render(List, { modern: true, shop: { id: 7 }, type: ProductType.SERVICE }, [{ id: 23, status: "Reserved", delivery_state: "CheckQueue", currency: "USD", price: 0, items: [] }]);
  assert.match(html, /global.commons.waiting_review/);
  assert.equal(calls.some(call => call.name === "u-price"), false);
});
