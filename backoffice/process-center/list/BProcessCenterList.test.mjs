import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import BListEmptyState from "../../empty-state/BListEmptyState.test-helper.mjs";
import BListLoadingState from "../../loading-state/BListLoadingState.test-helper.mjs";

// Real list/customer templates; requests, routing and UI leaves stay isolated.
const calls = [], requests = [], copied = [], navigations = [], cached = [];
const plain = (value) => JSON.parse(JSON.stringify(value));
const leaf = (name) => Vue.defineComponent({
  name,
  inheritAttrs: false,
  setup: (_, { attrs, slots }) => () => {
    const call = { name, attrs };
    calls.push(call);
    const content = name === "v-data-table-server"
      ? attrs.loading && !attrs.items.length ? slots.loading?.() : [
        ...attrs.items.flatMap((item) => attrs.headers.flatMap((header) => slots[`item.${header.value}`]?.({ item }) ?? [])),
        ...(!attrs.items.length ? slots["no-data"]?.() ?? [] : []),
        ...(slots.bottom?.() ?? []),
      ]
      : name === "SOrderDeliveryStatusStepper" && slots["stage-icon"]
        ? Object.values(attrs.states).flatMap((item, index) => {
          const current = Object.values(attrs.states).findIndex(stage => stage.code === attrs.state);
          return slots["stage-icon"]({ item, index, completed: index < current, current: index === current });
        })
        : slots.default?.();
    if (name === "v-data-table-server") call.content = content;
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
const ProductType = Object.fromEntries(["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code, index) => [code, {
  code, name: `global.product_types.${code.toLowerCase()}`, basket: `/test/${code}.svg`, basket_code: ["SM", "SV", "SF", "SS", "SN"][index],
}]));
const notifications = { showErrorAlert() {}, showLaravelError() {} };
const presentation = evaluate(readFileSync(new URL('./ProcessCenterPresentation.ts', import.meta.url), 'utf8'));
const dateWindow = { $language: { full_locale: 'en-US', calendar: { calendar: 'gregory' } } };
const { Calendar } = evaluate(readFileSync(new URL('../../../../core-js/enums/language/Calendar.ts', import.meta.url), 'utf8'));
const { DateConverter } = evaluate(readFileSync(new URL('../../../../core-js/helper/date/DateConverter.ts', import.meta.url), 'utf8'), {
  require: () => ({ Calendar }), window: dateWindow,
});
const DateMixin = evaluate(readFileSync(new URL('../../../mixin/date/DateMixin.ts', import.meta.url), 'utf8'), {
  require: () => ({ DateConverter }), window: dateWindow,
}).default;
const OrderMixin = evaluate(readFileSync(new URL('../../../mixin/order/OrderMixin.ts', import.meta.url), 'utf8'), {
  require: () => ({ Basket, BasketItemReturn: { States: {} } }),
}).default;
const { RouteMixin } = evaluate(readFileSync(new URL('../../../mixin/route/RouteMixin.ts', import.meta.url), 'utf8'), {
  require: name => name === 'vue' ? Vue : { delay: fn => fn() }, window: dateWindow,
});
let Customer;
function dependency(name) {
  if (name === "vue") return Vue;
  if (name.includes('/mixin/date/DateMixin')) return { default: DateMixin };
  if (name.includes('/mixin/order/OrderMixin')) return { default: OrderMixin };
  if (name.includes('/mixin/route/RouteMixin')) return { RouteMixin };
  if (name.endsWith("BListEmptyState.vue")) return { default: BListEmptyState };
  if (name.endsWith("BListLoadingState.vue")) return { default: BListLoadingState };
  if (name.includes('ProcessCenterPresentation')) return presentation;
  if (name.endsWith("BProcessCenterCustomer.vue")) return { default: Vue.defineComponent({
    props: ["item", "shop", "isAffiliatePos", "posReturn"],
    setup(props) {
      return () => {
        calls.push({ name: "BProcessCenterCustomer", attrs: { ...props } });
        return Vue.h(Customer, props);
      };
    },
  }) };
  if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
  if (name.endsWith(".svg") || name.endsWith(".png")) return name;
  if (name === "@selldone/core-js") return { Basket, Avocado, ShopURLs: { MainShopUrl: () => "https://example.test" } };
  if (name.includes("enums/order/OrderType")) return { OrderType };
  if (name.includes("ProductType")) return { ProductType };
  if (name.includes("BillingPeriod")) return { default: { Daily: { code: "Daily", title: "Daily", color: "#1976d2", hours: 24 } } };
  if (name === "lodash-es") return { debounce: (fn) => fn, throttle: (fn) => fn };
  if (name.includes("DateConverter")) return { DateConverter: { getFromNowNumber: () => 11 } };
  if (name.includes("CurrencyHelper")) return { CurrencyHelper: { NeedToSHowCurrencyFlag: () => true } };
  if (name.includes("TransactionStatus")) return { TransactionStatus: { RequireCapture: { code: "RequireCapture" } } };
  if (name.includes("NotificationService")) return { default: notifications };
  return { default: {}, RouteMixin: {}, OrderType: {} };
}
const isolated = {
  require: dependency,
  window: { SERACH_THROTTLE: 0, VAPI: {
    GET_MY_VENDORS_ORDERS: (vendor, type) => `/test/vendors/${vendor}/orders/${type}`,
  }, API: {
    GET_ORDERS: (shop, type) => `/test/shops/${shop}/orders/${type}`,
    GET_VENDORS_ORDERS: (shop, type) => `/test/shops/${shop}/vendor-orders/${type}`,
  } },
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
const chatAppearance = { dark: false };
function fixture(modern = false) {
  const state = { ...Object.fromEntries(Object.entries(List.props).map(([key, prop]) => [key, prop.default])), ...List.data(), modern, shop: { id: 7 }, type: ProductType.PHYSICAL, $t: (key) => key, $vuetify: { display }, $route: route };
  for (const [name, fn] of Object.entries(List.methods)) state[name] = fn.bind(state);
  for (const [name, get] of Object.entries(List.computed)) Object.defineProperty(state, name, { get: () => get.call(state) });
  return state;
}
async function render(component, props, rows = [], data = {}) {
  calls.length = 0;
  const focusedPos = component === List && props.modern && props.isPos && route.name === 'BPagePosOrders';
  const app = Vue.createSSRApp(component === List ? { ...List, mixins: focusedPos ? List.mixins : [], watch: {}, created: focusedPos ? () => {} : undefined, data: () => ({ ...List.data(), orders: rows, emptyStateLoaded: true, ...data }) } : component, props);
  for (const name of ["v-row", "v-text-field", "v-data-table-server", "v-img", "v-avatar", "v-icon", "v-btn", "v-btn-toggle", "v-spacer", "v-chip", "v-tooltip", "v-progress-linear", "v-badge", "v-pagination", "v-menu", "v-list", "v-list-item", "v-list-item-title", "v-sheet", "v-dialog", "v-card", "v-card-title", "v-card-text", "v-card-actions", "u-loading-progress", "u-price", "flag"]) app.component(name, leaf(name));
  app.component("router-link", leaf("RouterLink"));
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, $vuetify: { display, locale: { isRtl: false } }, $route: route, HIGHLIGHT_ID: null,
    USER: () => ({ preferences: chatAppearance }),
    getShopImagePath: (path) => `/fixture/shop-image/${path || "default"}`,
    IMAGE_SIZE_SMALL: 128,
    getBasketOrderCode: (item) => item.label || `${ProductType[item.type]?.basket_code || "SM"}-${item.vendor_id ? item.basket_id : item.id}`,
    getVendorOrderCode: (item) => `VND-${item.id}`,
    getUserAvatar: (id) => `/avatar/${id}`, copyToClipboard: (value) => copied.push(value),
    cacheRouteState: (id) => cached.push(id), $router: { push: (target) => navigations.push(target) },
    getDeliveryStateString: (state) => state, getFromNowString: () => "ago", getLocalTimeString: (date) => date, getLocalTimeStringSmall: (date) => date,
    getLocalDateString: (date) => date,
    getCountryName: (country) => country,
  });
  if (focusedPos) {
    // Missing optional helpers must fail instead of being supplied by test globals.
    for (const name of ['getDeliveryStateString', 'getFromNowString', 'getLocalTimeString', 'getLocalTimeStringSmall', 'getLocalDateString', 'cacheRouteState', 'HIGHLIGHT_ID']) delete app.config.globalProperties[name];
    app.config.warnHandler = message => { throw new Error(message); };
  }
  return renderToString(app);
}

test("Conversation dialog opts into the five native seller lists with one close control and actual appearance", async () => {
  const previous = { name: route.name, params: route.params, width: display.width, dark: chatAppearance.dark };
  try {
    for (const type of ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"]) {
      route.name = `BPageShopOrders${{ PHYSICAL: "Physical", VIRTUAL: "Virtual", FILE: "File", SERVICE: "Service", SUBSCRIPTION: "Subscription" }[type]}`;
      route.params = { shop_id: "7" };
      const row = { id: 42, type, chat: [{ body: "Recorded message", officer: true }] };
      for (const [width, dark] of [[1400, false], [390, true]]) {
        display.width = width; chatAppearance.dark = dark;
        await render(List, { modern: true, shop: { id: 7 }, type: ProductType[type] }, [], { selected_basket: row, dialog_chat: true });
        const dialog = calls.find(call => call.name === "v-dialog" && call.attrs.modelValue === true);
        assert.equal(dialog.attrs.fullscreen, width < 600);
        assert.equal(dialog.attrs["max-width"], 706);
        const card = calls.find(call => call.name === "v-card");
        assert.equal(card.attrs.theme, dark ? "dark" : "light");
        const chat = calls.find(call => call.name === "BOrderChatBox");
        assert.equal(chat.attrs.modern, true);
        assert.equal(chat.attrs["dialog-mode"], true);
        assert.equal(chat.attrs.basket.id, row.id);
        assert.equal(typeof chat.attrs.onClose, "function");
        assert.equal(calls.some(call => call.name === "v-card-title" || call.name === "v-card-actions"), false);
      }
      await render(List, { modern: true, shop: { id: 7 }, type: ProductType[type] }, [], { selected_basket: row, dialog_chat: false });
      assert.equal(calls.some(call => call.name === "BOrderChatBox"), false, "Closing unmounts the modern conversation and its private link state.");
    }
  } finally {
    if (previous.name === undefined) delete route.name; else route.name = previous.name;
    route.params = previous.params; display.width = previous.width; chatAppearance.dark = previous.dark;
  }
});

test("Conversation dialog preserves legacy and unrelated order contexts and clears its scope on exit", async () => {
  const previous = { name: route.name, params: route.params };
  try {
    route.name = "BPageShopOrdersPhysical"; route.params = { shop_id: 7 };
    const row = { id: 42, type: "PHYSICAL", chat: [] };
    for (const props of [
      { modern: false }, { modern: true, isVendorPanel: true }, { modern: true, isVendorOrders: true },
      { modern: true, isAffiliatePos: true }, { modern: true, isPos: true },
      { modern: true, isDropShipping: true }, { modern: true, isAvocado: true }, { modern: true, isHyper: true },
    ]) {
      await render(List, { shop: { id: 7 }, type: ProductType.PHYSICAL, ...props }, [], { selected_basket: row, dialog_chat: true });
      const dialog = calls.find(call => call.name === "v-dialog" && call.attrs.modelValue === true);
      assert.equal(dialog.attrs.fullscreen, true);
      assert.equal(dialog.attrs["max-width"], undefined);
      const chat = calls.find(call => call.name === "BOrderChatBox");
      assert.equal(chat.attrs.modern, false); assert.equal(chat.attrs["dialog-mode"], false);
      assert.ok(calls.some(call => call.name === "v-card-title"));
      assert.ok(calls.some(call => call.name === "v-card-actions"));
    }
    const current = fixture(true); current.selected_basket = row; current.dialog_chat = true;
    assert.equal(current.modernChatDialog, true);
    List.watch.dialog_chat.call(current, false);
    assert.equal(current.selected_basket, null);
    current.selected_basket = row; current.dialog_chat = true;
    List.watch.chatDialogScope.call(current, current.chatDialogScope, current.chatDialogScope);
    assert.equal(current.selected_basket, row, "Same-scope refresh retains the conversation.");
    List.watch.chatDialogScope.call(current, "8:BPageShopOrdersPhysical", current.chatDialogScope);
    assert.equal(current.selected_basket, null); assert.equal(current.dialog_chat, false);
    current.selected_basket = row; current.dialog_chat = true;
    List.watch.chatDialogScope.call(current, "", "7:BPageShopOrdersPhysical");
    assert.equal(current.selected_basket, null); assert.equal(current.dialog_chat, false);
    route.name = "BPageCustomerOrdersPhysical";
    assert.equal(fixture(true).modernChatDialog, false);
    route.name = "BPageShopOrdersPhysical"; route.params = { shop_id: 8 };
    assert.equal(fixture(true).modernChatDialog, false);
  } finally {
    if (previous.name === undefined) delete route.name; else route.name = previous.name;
    route.params = previous.params;
  }
});

test("opt-in columns retain backend sort fields and Paid + COD selection", () => {
  assert.equal(List.props.modern.default, false);
  const legacy = fixture(), modern = fixture(true);
  assert.deepEqual(plain(legacy.status), ["Payed", "COD"]);
  assert.deepEqual(plain(legacy.headers.map((header) => header.value)), ["type", "id", "price", "status", "delivery_state", "reserved_at"]);
  assert.deepEqual(plain(modern.headers.filter((header) => header.sortable).map((header) => header.value)), ["id", "price", "status", "delivery_state", "reserved_at"]);
  assert.equal(modern.headers.find((header) => header.value === "customer").sortable, false);
});

test("pending order tables and their SVG stay clear while refresh retains rows and interaction locks", async () => {
  for (const modern of [false, true]) for (const type of Object.values(ProductType)) {
    const props = { modern, shop: { id: 7 }, type };
    const pending = await render(List, props, [], { busy_fetch: true });
    let table = calls.find(call => call.name === "v-data-table-server").attrs;
    assert.equal(table.loading, true);
    assert.equal(table["aria-busy"], true);
    assert.match(table.class, /disabled-no-filter/);
    assert.doesNotMatch(table.class, /blurred|blur-animate/);
    assert.match(pending, /b-list-loading-state__wires/);
    assert.doesNotMatch(pending, /b-list-empty-state/);

    const row = Object.freeze({ id: 23, label: "Existing order", type: type.code, status: "Reserved", delivery_state: "PreparingOrder", currency: "USD", price: 10, delivery_price: 0, items: [], contents: [] });
    const before = JSON.stringify(row);
    const refresh = await render(List, props, [row], { busy_fetch: true });
    table = calls.find(call => call.name === "v-data-table-server").attrs;
    assert.match(refresh, /Existing order/);
    assert.match(refresh, /b-list-loading-state--compact/);
    assert.doesNotMatch(refresh, /b-list-loading-state__wires/);
    assert.match(table.class, /disabled-no-filter/);
    assert.doesNotMatch(table.class, /blurred|blur-animate/);
    assert.equal(JSON.stringify(row), before);

    await render(List, props, [row], { busy_fetch: false });
    table = calls.find(call => call.name === "v-data-table-server").attrs;
    assert.doesNotMatch(table.class, /disabled-no-filter|blurred|blur-animate/);
    assert.equal(table["aria-busy"], false);
  }
});

test("Vendor panel opts into five columns without merchant actions or changing type defaults", () => {
  const legacy = fixture();
  Object.assign(legacy, { isVendorPanel: true, isVendorOrders: true });
  assert.equal(legacy.modernVendorPanel, false);
  for (const type of Object.values(ProductType)) {
    const state = fixture(true);
    Object.assign(state, { type, isVendorPanel: true, isVendorOrders: true, fetchOrders() {} });
    List.created.call(state);
    assert.equal(state.modernVendorPanel, true);
    assert.equal(state.modernMarketplace, false);
    assert.deepEqual(plain(state.headers.map(header => header.value)), ["id", "price", "status", "delivery_state", "reserved_at"]);
    assert.ok(state.headers.every(header => header.sortable));
    assert.deepEqual(plain(state.status), type === ProductType.SERVICE ? ["Payed", "Reserved"] : ["Payed", "COD"]);
    assert.equal(state.vendorStageIcon("PreparingOrder"), type === ProductType.FILE ? "link" : type === ProductType.VIRTUAL ? "laptop" : type === ProductType.SERVICE ? "list-checks" : "package");
    assert.equal(state.vendorStageIcon("ToCustomer"), type === ProductType.FILE ? "download" : "check-check");
    assert.deepEqual(Object.values(state.deliveryStates).map(stage => stage.code), Object.values(Basket[`${type.code[0] + type.code.slice(1).toLowerCase()}OrderStates`]).map(stage => stage.code));
  }
});

test("Vendor panel queries and routes retain vendor scope, server pagination and existing filter values", async () => {
  for (const type of Object.values(ProductType)) {
    const state = fixture(true);
    Object.assign(state, { type, isVendorPanel: true, isVendorOrders: true, $route: { params: { vendor_id: 9 }, matched: [] }, search: "23", status: ["Open", "Canceled"] });
    state.fetchOrdersNow(3, "reserved_at", false);
    await new Promise(resolve => setImmediate(resolve));
    const [endpoint, { params }] = requests.at(-1);
    assert.equal(endpoint, `/test/vendors/9/orders/${type.code}`);
    assert.equal(params.offset, 20);
    assert.equal(params.limit, 10);
    assert.equal(params.sortBy, "reserved_at");
    assert.equal(params.sortDesc, false);
    assert.equal(params.search, "23");
    assert.deepEqual(plain(params.statuses), ["Open", "Canceled"]);
    assert.equal(params.buyer, undefined);
    assert.equal(params.updated_at, undefined);
    assert.equal(params.globalDaysRange, undefined);
    assert.deepEqual(plain(state.createRouteTo({ id: 23, basket_id: 91 })), {
      name: `VendorProcessCenter${type.code[0] + type.code.slice(1).toLowerCase()}OrderPage_Dashboard`, params: { shop_id: 7, vendor_order_id: 23 },
    });
    state.sortMarketplace("price");
    assert.equal(state.page, 1);
    assert.deepEqual(plain(state.sortBy), [{ key: "price", order: "desc" }]);
    state.clearMarketplaceFilters();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(state.page, 1);
    assert.equal(state.search, null);
    assert.deepEqual(plain(state.status), type === ProductType.SERVICE ? ["Payed", "Reserved"] : ["Payed", "COD"]);
  }
});

test("Vendor rows preserve native identity, payment, thumbnails, stages, Guest, returns, chat and attention", async () => {
  const row = {
    id: 23, vendor_id: 9, basket_id: 91, type: "PHYSICAL", status: "Payed", delivery_state: "PreparingOrder", currency: "USD", price: 35, delivery_price: 0,
    items: [{ product_id: 8 }, { product_id: 8 }, { product_id: 10 }], basket_item_returns: [{ id: 1 }],
    chat: [{ officer: false }], created_at: "2026-10-01", reserved_at: "2026-10-02", updated_at: "2026-10-01", receiver_info: { country: "CA", state: "Alberta", city: "Edmonton" },
  };
  const props = { modern: true, isVendorPanel: true, isVendorOrders: true, shop: { id: 7 }, type: ProductType.PHYSICAL };
  const html = await render(List, props, [row]);
  assert.match(html, /b-process-center-list--vendor/);
  assert.doesNotMatch(html, /b-process-center-list--marketplace/);
  assert.match(html, /SM-91.*VND-23/);
  assert.match(html, /global.commons.guest/);
  assert.match(html, /Alberta &gt; Edmonton/);
  assert.match(html, /2026-10-02/);
  assert.match(html, /Angry\.svg/);
  assert.match(html, /global.commons.free/);
  const headers = calls.find(call => call.name === "v-data-table-server").attrs.headers;
  assert.deepEqual(plain(headers.map(header => header.value)), ["id", "price", "status", "delivery_state", "reserved_at"]);
  const images = calls.find(call => call.name === "ProductsDenseImagesCircles").attrs;
  assert.equal(images.size, 22, "dense modern rows draw 22px product circles");
  assert.deepEqual(plain(images.ids), ["8", "10"]);
  assert.equal(calls.find(call => call.name === "SOrderStatusView").attrs.status, "Payed");
  assert.equal(calls.some(call => call.name === "ReturnRequestButtonBadge"), true);
  assert.equal(calls.some(call => call.name === "BProcessCenterFilters"), false);
  const stepper = calls.find(call => call.name === "SOrderDeliveryStatusStepper").attrs;
  assert.equal(Object.keys(stepper.states).length, 5);
  assert.equal(stepper["modern-final-tooltip"], false);
  for (const glyph of ["user-round", "message-circle", "check", "package", "truck", "check-check"]) {
    assert.ok(calls.some(call => call.name === "BVendorOrderIcon" && call.attrs.name === glyph), glyph);
  }
  const identity = calls.find(call => call.name === "RouterLink" && call.attrs.class === "b-process-center-list__vendor-code").attrs;
  assert.deepEqual(plain(identity.to), { name: "VendorProcessCenterPhysicalOrderPage_Dashboard", params: { shop_id: 7, vendor_order_id: 23 } });
  let stopped = false;
  identity.onClick({ stopPropagation: () => { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(cached.at(-1), 23);
  assert.equal(calls.find(call => call.name === "v-badge").attrs["model-value"], true);

  await render(List, props, [{ ...row, buyer: { id: 4, name: "Sample buyer" } }]);
  assert.equal(calls.find(call => call.name === "BProcessCenterCustomer").attrs.item.buyer.name, "Sample buyer");
});

test("Vendor empty, filtered and failed lists retain filters and expose native reset/retry actions", async () => {
  const props = { modern: true, isVendorPanel: true, isVendorOrders: true, shop: { id: 7 }, type: ProductType.FILE };
  assert.match(await render(List, props), /vendor_orders\.empty_title/);
  assert.doesNotMatch(await render(List, props, [], { emptyStateLoaded: false }), /vendor_orders\.empty_title/);
  assert.match(await render(List, props, [], { search: "missing" }), /vendor_orders\.no_results_title/);
  const failed = await render(List, props, [], { fetch_error: true, search: "kept" });
  assert.match(failed, /role="alert"/);
  assert.match(failed, /vendor_orders\.error_body/);
  assert.match(failed, /vendor_orders\.retry/);
  assert.doesNotMatch(failed, /orders-empty\.png/);
  const toggle = calls.find(call => call.name === "v-btn-toggle").attrs;
  assert.ok(Object.hasOwn(toggle, "multiple"));
  assert.ok(Object.hasOwn(toggle, "mandatory"));
  assert.deepEqual(plain(toggle.modelValue), ["Payed", "COD"]);
  const statusButtons = calls.filter(call => call.name === "v-btn" && call.attrs.value).map(call => call.attrs.value);
  assert.deepEqual(statusButtons, ["Open", "Reserved", "Payed", "Canceled"]);
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
  assert.equal(calls.find((call) => call.name === "RouterLink").attrs.title, "Go to customer page");
  const email = calls.find((call) => call.name === "v-btn").attrs;
  assert.match(email["aria-label"], /global.actions.copy.*customer@example.test/);
  assert.equal(email.title, "global.commons.email : customer@example.test");
  let stopped = false;
  email.onClick({ stopPropagation: () => { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(copied.at(-1), item.customer.email);
  const affiliateHtml = await render(Customer, { item, shop: { id: 7 }, isAffiliatePos: true });
  assert.equal(calls.some((call) => call.name === "RouterLink"), false);
  assert.doesNotMatch(affiliateHtml, /Go to customer page/);
  const buyerHtml = await render(Customer, { item: { buyer: { id: 12, name: "Sample Buyer" } }, shop: {} });
  assert.match(buyerHtml, /Sample Buyer/);
  assert.doesNotMatch(buyerHtml, /Go to customer page/);
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
    [{ isDropShipping: true }, Basket.PhysicalOrderStates, 5, "wholesale"],
    [{ isPos: true }, null, 0, null],
    [{ isHyper: true }, null, 0, null],
  ];
  const canonical = cases.map(([, states]) => states && plain(states));
  for (const [index, [props, states, count, prefix]] of cases.entries()) {
    const row = { id: 23, status: "Reserved", delivery_state: "PreparingOrder", currency: "USD", price: 10, delivery_price: 0, items: [], contents: [] };
    await render(List, { modern: true, shop: { id: 7 }, ...props }, [row]);
    const headers = calls.find(call => call.name === "v-data-table-server").attrs.headers;
    assert.deepEqual(plain(headers.map(header => header.value)), props.isDropShipping
      ? ["id", "customer", "price", "status", "delivery_state", "country", "reserved_at"]
      : ["id", "customer", "price", "status", ...(count ? ["delivery_state"] : []), "reserved_at"]);
    if (props.isDropShipping) assert.equal(headers.reduce((total, header) => total + parseFloat(header.width), 0), 100);
    const stepper = calls.find(call => call.name === "SOrderDeliveryStatusStepper")?.attrs;
    if (count) {
      assert.equal(Object.keys(stepper.states).length, count);
      assert.deepEqual(Object.values(stepper.states).map(state => state.code), Object.values(states).map(state => state.code));
      assert.equal(stepper["modern-tooltip-prefix"], prefix === "physical" ? "admin_shop.orders.physical.modern.stages" : `admin_shop.orders.modern.${prefix}.stages`);
      assert.notEqual(stepper.states, states);
      assert.equal(stepper["modern-final-tooltip"], !!props.isDropShipping);
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
      assert.equal(state.headers.find(header => header.value === "customer").title, "admin_shop.orders.modern.wholesale.owner");
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
    buyer: { id: 12, name: "Reseller Buyer", phone: "12345", email: "reseller@example.test" }, customer_id: 91, customer: { name: "Reseller End Customer" },
  };
  const html = await render(List, { modern: true, shop: { id: 7 }, isDropShipping: true, resellerShopId: 55 }, [row]);
  assert.match(html, /Reseller Buyer/);
  assert.doesNotMatch(html, /Reseller End Customer/);
  const customer = calls.find(call => call.name === "BProcessCenterCustomer").attrs;
  assert.deepEqual(plain(customer.item), { buyer: row.buyer });
  assert.match(html, /12345/);
  assert.doesNotMatch(html, /Go to customer page/);
  assert.deepEqual(plain(calls.find(call => call.name === "UButtonWhatsapp").attrs.user), row.buyer);
  const email = calls.find(call => call.name === "v-btn" && call.attrs["aria-label"]?.includes(row.buyer.email)).attrs;
  let stopped = false;
  email.onClick({ stopPropagation: () => { stopped = true; } });
  assert.equal(stopped, true);
  assert.equal(copied.at(-1), row.buyer.email);
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

test("refined subscription rows keep the amount, period and next-payment bar in one compact cell", async () => {
  const due = { isBeforeToday: () => false, diffHours: () => 12, toString: () => "2026-11-20" };
  const row = {
    id: 23, status: "Payed", delivery_state: "PreparingOrder", currency: "USD", price: 20, delivery_price: 0, items: [], contents: [],
    meta: { subscription_period: "Daily", subscription_payment_at: { convertToLocalDate: () => ({ addHours: () => due }) } },
  };
  const modern = await render(List, { modern: true, shop: { id: 7 }, type: ProductType.SUBSCRIPTION }, [row]);
  assert.match(modern, /b-process-center-list__amount b-process-center-list__amount--subscription/);
  assert.match(modern, /b-process-center-list__next-payment/);
  assert.doesNotMatch(modern, /b-process-center-list__next-payment text-center/);
  assert.match(modern, /title="admin_shop.orders.modern.subscription.next_payment ~ 2026-11-20"/);
  assert.match(modern, /<small class="my-1">ago<\/small>/);
  assert.doesNotMatch(modern, /credit_score|● ago/);
  assert.ok(calls.some(call => call.name === "v-progress-linear" && call.attrs["model-value"] === 50));
  assert.ok(calls.some(call => call.name === "u-price" && call.attrs.amount === 20 && call.attrs.currency === "USD"));
  const legacy = await render(List, { shop: { id: 7 }, type: ProductType.SUBSCRIPTION }, [row]);
  assert.match(legacy, /b-process-center-list__next-payment text-center/);
  assert.match(legacy, /credit_score/);
  assert.match(legacy, /<small class="my-1">~ 2026-11-20 ● ago\.<\/small>/);
  assert.doesNotMatch(legacy, /b-process-center-list__amount--subscription/);
});

test("modern supplier lists initialize with only the visible Paid selection", () => {
  for (const modern of [true, false]) {
    const state = fixture(modern);
    state.isDropShipping = true;
    state.type = undefined;
    state.fetchOrders = () => {};
    List.created.call(state);
    assert.deepEqual(plain(state.status), modern ? ["Payed"] : ["Payed", "COD"]);
  }
});

test("Marketplace opts into six columns and retains each product type's states and default selection", async () => {
  const legacy = fixture();
  legacy.isVendorOrders = true;
  assert.equal(legacy.modernMarketplace, false);
  assert.equal(legacy.headers.some(header => header.value === "actions"), false);
  assert.equal(fixture(true).modernMarketplace, false);

  for (const [type, states] of [
    [ProductType.PHYSICAL, Basket.PhysicalOrderStates],
    [ProductType.VIRTUAL, Basket.VirtualOrderStates],
    [ProductType.FILE, Basket.FileOrderStates],
    [ProductType.SERVICE, Basket.ServiceOrderStates],
  ]) {
    const state = fixture(true);
    Object.assign(state, { type, isVendorOrders: true, fetchOrders() {} });
    List.created.call(state);
    const expectedStatuses = type === ProductType.SERVICE ? ["Payed", "Reserved"] : ["Payed", "COD"];
    assert.equal(state.modernMarketplace, true);
    assert.deepEqual(plain(state.status), expectedStatuses);
    assert.deepEqual(plain(state.headers.map(header => header.value)), ["id", "price", "status", "delivery_state", "reserved_at", "actions"]);
    assert.equal(state.headers.at(-1).sortable, false);
    assert.deepEqual(plain(state.marketplaceStatuses.map(status => status.code)), ["Open", "Reserved", "Payed", ...(type === ProductType.PHYSICAL ? ["COD"] : []), "Canceled"]);

    const html = await render(List, { modern: true, isVendorOrders: true, shop: { id: 7 }, type }, [{
      id: 23, vendor_id: 5, basket_id: 91, type: type.code, status: "Payed", delivery_state: "OrderConfirm", currency: "USD", price: 10, items: [],
    }], { status: expectedStatuses });
    assert.match(html, /b-process-center-list--marketplace/);
    const selector = calls.find(call => call.name === "v-btn-toggle").attrs;
    assert.deepEqual(plain(selector.modelValue), expectedStatuses);
    assert.ok(Object.hasOwn(selector, "multiple"));
    assert.ok(Object.hasOwn(selector, "mandatory"));
    assert.equal(calls.some(call => call.name === "SOrderStatusesSelect"), false);
    const stepper = calls.find(call => call.name === "SOrderDeliveryStatusStepper").attrs;
    assert.deepEqual(Object.values(stepper.states).map(stage => stage.code), Object.values(states).map(stage => stage.code));
    assert.equal(stepper["modern-final-tooltip"], !state.hasReceiverInfo);
  }
});

test("Marketplace queries use the vendor endpoint with bounded pagination and the current filter scope", async () => {
  for (const type of [ProductType.PHYSICAL, ProductType.VIRTUAL, ProductType.FILE, ProductType.SERVICE]) {
    const state = fixture(true);
    Object.assign(state, { type, isVendorOrders: true, filterProductId: 31, filterCustomerId: 41, filterAffiliateId: 51, search: "VND-23", fetchOrders() {} });
    List.created.call(state);
    state.fetchOrdersNow(3, "reserved_at", false);
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(plain(requests.at(-1)), [`/test/shops/7/vendor-orders/${type.code}`, { params: {
      offset: 20, limit: 10, product_id: 31, customer_id: 41, subscription_price_id: null, sortBy: "reserved_at", sortDesc: false,
      statuses: type === ProductType.SERVICE ? ["Payed", "Reserved"] : ["Payed", "COD"], search: "VND-23", affiliate_id: 51,
      shop_connect_id: null, connect_orders: true, reseller_shop_id: null, with: ["buyer", "payment-compact"],
    } }]);
  }
  const connected = fixture(true);
  Object.assign(connected, { isVendorOrders: true, $route: { params: { shop_connect_id: 88 }, matched: [{ meta: { connect: true } }] } });
  connected.fetchOrdersNow(1);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.at(-1)[0], "/test/shops/7/vendor-orders/PHYSICAL");
  assert.equal(requests.at(-1)[1].params.shop_connect_id, 88);
});

test("Marketplace VND identity and new-tab parent actions navigate with the parent basket ID", async () => {
  for (const type of [ProductType.PHYSICAL, ProductType.VIRTUAL, ProductType.FILE, ProductType.SERVICE]) {
    const row = { id: 23, vendor_id: 5, basket_id: 91, type: type.code, status: "Payed", delivery_state: "ToCustomer", currency: "USD", price: 10, items: [] };
    const html = await render(List, { modern: true, isVendorOrders: true, shop: { id: 7 }, type }, [row]);
    assert.match(html, /VND-23/);
    assert.ok(html.includes(`${type.basket_code}-91`));
    const expectedRoute = { name: `BPageOrder${type.code[0] + type.code.slice(1).toLowerCase()}Dashboard`, params: { shop_id: 7, basket_id: 91 } };
    const parent = calls.find(call => call.name === "v-btn" && call.attrs.target === "_blank").attrs;
    assert.deepEqual(plain(parent.to), expectedRoute);
    assert.equal(parent.rel, "noopener noreferrer");
    assert.equal(parent["aria-label"], "marketplace_fulfillments.order_help");
    const identity = calls.find(call => call.name === "v-btn" && call.attrs.class === "b-process-center-list__marketplace-code").attrs;
    let stopped = false;
    identity.onClick({ stopPropagation: () => { stopped = true; } });
    assert.equal(stopped, true);
    assert.equal(cached.at(-1), 23);
    assert.deepEqual(plain(navigations.at(-1)), expectedRoute);
  }
});

test("Marketplace sorting toggles all five supported fields and rejects unsortable actions", () => {
  const state = fixture(true);
  state.isVendorOrders = true;
  const fetches = [];
  state.fetchOrders = (...args) => fetches.push(args);
  for (const key of ["id", "price", "status", "delivery_state", "reserved_at"]) {
    state.page = 4;
    state.sortMarketplace(key);
    assert.equal(state.page, 1);
    assert.deepEqual(plain(state.sortBy), [{ key, order: "desc" }]);
    List.watch.sortBy.call(state);
    assert.deepEqual(fetches.at(-1), [1, key, true]);
    state.sortMarketplace(key);
    assert.deepEqual(plain(state.sortBy), [{ key, order: "asc" }]);
    List.watch.sortBy.call(state);
    assert.deepEqual(fetches.at(-1), [1, key, false]);
  }
  state.page = 3;
  const previous = plain(state.sortBy);
  state.sortMarketplace("actions");
  assert.equal(state.page, 3);
  assert.deepEqual(plain(state.sortBy), previous);
});

test("Marketplace clear filters restores type defaults and range describes real server pages", async () => {
  const address = fixture(true);
  assert.equal(address.getShortAddress({ state: "Alberta", city: "Edmonton" }), "Alberta > Edmonton");
  assert.equal(address.getShortAddress({ city: "Edmonton" }), "Edmonton");
  assert.equal(address.getShortAddress({ state: "ESSONNE" }), "ESSONNE");
  const receiverTarget = {};
  const receiverOrder = { id: 23, receiver_info: { state: "ESSONNE" } };
  address.openMarketplaceReceiver({ currentTarget: receiverTarget }, receiverOrder);
  assert.equal(address.activator, receiverTarget);
  assert.equal(address.activator_item, receiverOrder);
  assert.equal(address.receiver_menu, true);
  for (const type of [ProductType.PHYSICAL, ProductType.SERVICE]) {
    const state = fixture(true);
    Object.assign(state, { type, isVendorOrders: true, status: ["Canceled"], search: "no match", page: 4, sortBy: [{ key: "price", order: "asc" }], filterProductId: 31 });
    assert.equal(state.marketplaceFiltersChanged, true);
    state.clearMarketplaceFilters();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(state.page, 1);
    assert.equal(state.search, null);
    assert.equal(state.marketplaceFiltersChanged, false);
    const query = plain(requests.at(-1)[1].params);
    assert.deepEqual(query.statuses, type === ProductType.SERVICE ? ["Payed", "Reserved"] : ["Payed", "COD"]);
    assert.equal(query.search, null);
    assert.equal(query.product_id, 31);
    assert.equal(query.offset, 0);
    assert.equal(query.sortBy, "price");
    assert.equal(query.sortDesc, false);
    Object.assign(state, { page: 3, totalItems: 23 });
    assert.deepEqual(plain(state.marketplaceRange), { start: 21, end: 23, total: 23 });
    Object.assign(state, { page: 1, totalItems: 0 });
    assert.deepEqual(plain(state.marketplaceRange), { start: 0, end: 0, total: 0 });
    if (type === ProductType.PHYSICAL) state.status.reverse();
    assert.equal(state.marketplaceFiltersChanged, false);
  }
  const props = { modern: true, isVendorOrders: true, shop: { id: 7 }, type: ProductType.PHYSICAL };
  assert.match(await render(List, props), /marketplace_fulfillments\.empty_title/);
  assert.match(await render(List, props, [], { search: "missing" }), /marketplace_fulfillments\.no_results_title/);
  const errorHtml = await render(List, props, [], { fetch_error: true, search: "kept" });
  assert.match(errorHtml, /role="alert"/);
  assert.match(errorHtml, /marketplace_fulfillments\.error_body/);
  assert.ok(calls.some(call => call.name === "v-btn" && call.attrs["prepend-icon"] === "refresh"));
});

test("Marketplace uses compact payment states while capture, card and processing retain the native view", async () => {
  const props = { modern: true, isVendorOrders: true, shop: { id: 7 }, type: ProductType.PHYSICAL };
  const base = { id: 23, vendor_id: 5, basket_id: 91, status: "Payed", delivery_state: "ToCustomer", currency: "USD", price: 10, items: [] };
  for (const [status, dot] of [["Payed", "success"], ["Canceled", "error"], ["Reserved", "warning"], ["COD", "warning"], ["Open", "warning"]]) {
    const html = await render(List, props, [{ ...base, status }]);
    assert.match(html, /b-process-center-list__marketplace-payment/);
    assert.ok(html.includes(`sd-modern-status__dot--${dot}`));
    assert.ok(html.includes(Basket.Status[status].title));
    assert.equal(calls.some(call => call.name === "SOrderStatusView"), false);
  }
  for (const details of [
    { payment: { status: "RequireCapture" } },
    { payment: { card: { brand: "visa", card_no: "****4242", country: "US" } } },
    { gateway_processing: true },
    { status: "Unknown" },
  ]) {
    const row = { ...base, ...details };
    const html = await render(List, props, [row]);
    assert.doesNotMatch(html, /b-process-center-list__marketplace-payment/);
    const native = calls.find(call => call.name === "SOrderStatusView").attrs;
    assert.equal(native.status, row.status);
    assert.equal(native["gateway-processing"], row.gateway_processing);
    assert.equal(native["payment-require-capture"], row.payment?.status === "RequireCapture");
    assert.deepEqual(plain(native.payment ?? null), row.payment ?? null);
  }
});

test("Marketplace failures keep filters and stale failures cannot replace a newer successful request", async () => {
  const originalGet = isolated.axios.get;
  const pending = [];
  isolated.axios.get = () => new Promise((resolve, reject) => pending.push({ resolve, reject }));
  const settle = () => new Promise(resolve => setImmediate(resolve));
  try {
    const state = fixture(true);
    Object.assign(state, { isVendorOrders: true, search: "VND-23", status: ["Reserved"], orders: [{ id: "previous" }], totalItems: 1 });
    state.fetchOrdersNow(3);
    pending[0].reject(new Error("Request failed"));
    await settle();
    assert.equal(state.fetch_error, true);
    assert.equal(state.busy_fetch, false);
    assert.equal(state.search, "VND-23");
    assert.deepEqual(plain(state.status), ["Reserved"]);
    assert.deepEqual(plain(state.orders), [{ id: "previous" }]);

    state.fetchOrdersNow(3);
    assert.equal(state.fetch_error, false);
    assert.equal(state.busy_fetch, true);
    pending[1].resolve({ data: { error: true, error_msg: "Unavailable" } });
    await settle();
    assert.equal(state.fetch_error, true);
    assert.equal(state.busy_fetch, false);

    state.fetchOrdersNow(1);
    state.search = "latest";
    state.fetchOrdersNow(1);
    pending[2].reject(new Error("Stale failed request"));
    await settle();
    assert.equal(state.fetch_error, false);
    assert.equal(state.busy_fetch, true);
    pending[3].resolve({ data: { total: 2, orders: [{ id: "latest" }] } });
    await settle();
    assert.equal(state.fetch_error, false);
    assert.equal(state.busy_fetch, false);
    assert.equal(state.totalItems, 2);
    assert.deepEqual(plain(state.orders), [{ id: "latest" }]);

    state.fetchOrdersNow(1);
    state.fetchOrdersNow(1);
    pending[5].resolve({ data: { total: 3, orders: [{ id: "newest" }] } });
    await settle();
    pending[4].resolve({ data: { error: true, error_msg: "Stale error" } });
    await settle();
    assert.equal(state.fetch_error, false);
    assert.equal(state.totalItems, 3);
    assert.deepEqual(plain(state.orders), [{ id: "newest" }]);
  } finally {
    isolated.axios.get = originalGet;
  }
});


test("bound vendor filters only modern marketplace requests and cannot broaden on invalid identity", async () => {
  const state = fixture(true);
  state.isVendorOrders = true;
  state.vendor = { id: 17 };
  state.fetchOrdersNow(3, 'created_at', false);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.at(-1)[0], '/test/shops/7/vendor-orders/PHYSICAL');
  assert.equal(requests.at(-1)[1].params.vendor_id, 17);
  assert.equal(requests.at(-1)[1].params.offset, 20);
  state.clearMarketplaceFilters();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(requests.at(-1)[1].params.vendor_id, 17);
  state.vendor = { id: 0 };
  const count = requests.length;
  state.fetchOrdersNow(1);
  assert.equal(requests.length, count);
  assert.equal(state.fetch_error, true);
  assert.deepEqual(plain(state.orders), []);
  for (const overrides of [{ isVendorPanel: true }, { isVendorOrders: false }, { modern: false }]) {
    const other = fixture(true);
    Object.assign(other, { isVendorOrders: true, vendor: { id: 17 } }, overrides);
    other.fetchOrdersNow(1);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(Object.hasOwn(requests.at(-1)[1].params, 'vendor_id'), false);
  }
});

test('focused POS Orders preserves native filters, routing, money and request states', async t => {
  const previousName = route.name;
  route.name = 'BPagePosOrders';
  const props = { modern: true, isPos: true, type: undefined, shop: { id: 7 } };
  const row = { id: 438, label: 'POS-438', status: 'Payed', currency: 'EUR', price: 50.60, delivery_price: 0, items: [], created_at: '2025-09-01T12:00:00Z', reserved_at: '2026-10-02T14:30:00Z', payment: null };
  try {
    await t.test('only the dedicated route opts in, with five backend columns and all payment choices', async () => {
      const state = fixture(true);
      Object.assign(state, { isPos: true, type: undefined });
      assert.equal(state.modernPos, true);
      assert.equal(state.has_cod, true);
      assert.deepEqual(plain(state.headers.map(header => header.value)), ['id', 'customer', 'price', 'status', 'reserved_at']);
      assert.equal(state.headers.find(header => header.value === 'customer').sortable, false);
      assert.deepEqual(plain(state.marketplaceStatuses.map(status => status.code)), ['Open', 'Reserved', 'Payed', 'COD', 'Canceled']);
      assert.deepEqual(plain(state.status), ['Payed', 'COD']);
      for (const name of ['BPageShopOrdersPos', 'BPageCustomerOrders', 'VendorOrders']) {
        route.name = name;
        assert.equal(state.modernPos, false);
        assert.equal(Object.hasOwn(state.createRouteTo(row), 'query'), false);
      }
      route.name = 'BPagePosOrders';
      const legacy = fixture(false);
      legacy.isPos = true;
      assert.equal(legacy.modernPos, false);
      const html = await render(List, props, [row]);
      assert.match(html, /b-process-center-list--pos/);
      const toggle = calls.find(call => call.name === 'v-btn-toggle').attrs;
      assert.ok(Object.hasOwn(toggle, 'multiple'));
      assert.ok(Object.hasOwn(toggle, 'mandatory'));
      assert.equal(toggle['aria-label'], 'cash_register.orders.selected_states');
      assert.deepEqual(plain(calls.filter(call => call.name === 'v-btn' && call.attrs.value).map(call => call.attrs.value)), ['Open', 'Reserved', 'Payed', 'COD', 'Canceled']);
      assert.equal(calls.some(call => call.name === 'SOrderStatusesSelect'), false);
      assert.equal(calls.find(call => call.name === 'v-text-field').attrs['aria-label'], 'cash_register.orders.search_help');
      assert.equal(calls.find(call => call.name === 'v-data-table-server').attrs['items-per-page'], 10);
    });

    await t.test('GET pagination and status arrays remain scoped and direct order links retain a fixed return marker', async () => {
      const state = fixture(true);
      Object.assign(state, { isPos: true, type: undefined, search: 'buyer@example.test', $route: { name: 'BPagePosOrders', params: { shop_id: 7 }, query: { pos_return: 'untrusted', return: 'https://example.test' }, matched: [] } });
      for (const statuses of [['Open', 'Reserved', 'Payed', 'COD', 'Canceled'], ['COD'], ['Reserved']]) {
        state.status = statuses;
        state.fetchOrdersNow(3, 'reserved_at', false);
        await new Promise(resolve => setImmediate(resolve));
        const [url, { params }] = plain(requests.at(-1));
        assert.equal(url, '/test/shops/7/orders/POS');
        assert.equal(params.offset, 20);
        assert.equal(params.limit, 10);
        assert.equal(params.buyer, true);
        assert.equal(params.search, 'buyer@example.test');
        assert.deepEqual(params.statuses, statuses);
        assert.equal(params.sortBy, 'reserved_at');
        assert.equal(params.sortDesc, false);
        assert.deepEqual(params.with, ['buyer', 'payment-compact']);
        assert.equal(Object.hasOwn(params, 'updated_at'), false);
      }
      assert.deepEqual(plain(state.createRouteTo(row)), { name: 'BPageOrderPosDashboard', params: { shop_id: 7, basket_id: 438 }, query: { pos_return: 'register' } });
      state.fetchOrders = () => {};
      for (const key of ['id', 'price', 'status', 'reserved_at']) {
        state.page = 3;
        state.sortMarketplace(key);
        assert.equal(state.page, 1);
        assert.equal(state.sortBy[0].key, key);
      }
      const html = await render(List, props, [row]);
      assert.match(html, /POS-438/);
      const link = calls.find(call => call.name === 'RouterLink' && call.attrs.class === 'b-process-center-list__code').attrs;
      assert.deepEqual(plain(link.to), { name: 'BPageOrderPosDashboard', params: { shop_id: 7, basket_id: 438 }, query: { pos_return: 'register' } });
      assert.notEqual(link.target, '_blank');
      assert.equal(link['aria-label'], 'cash_register.orders.open_order');
      link.onClick({ stopPropagation() {} });
      assert.equal(dateWindow.__RETURN.ROUTE_NAME, 'BPagePosOrders');
      assert.equal(dateWindow.__RETURN.HIGHLIGHT_ID, row.id);
      dateWindow.__RETURN = null;
    });

    await t.test('original currencies and order dates survive presentation; missing dates remain unknown', async () => {
      const euro = Object.freeze({ ...row, payment_at: '2099-01-01T00:00:00Z' });
      const dollar = Object.freeze({ ...row, id: 437, label: 'POS-437', currency: 'USD', price: 406.56, reserved_at: null, created_at: '2024-03-04T10:00:00Z' });
      const missing = Object.freeze({ ...row, id: 436, label: 'POS-436', reserved_at: null, created_at: null });
      const before = JSON.stringify([euro, dollar, missing]);
      const html = await render(List, props, [euro, dollar, missing]);
      for (const order of [euro, dollar]) {
        assert.ok(calls.some(call => call.name === 'u-price' && call.attrs.amount === order.price && call.attrs.currency === order.currency));
        assert.ok(calls.some(call => call.name === 'UCurrencyIcon' && call.attrs.currency === order.currency));
      }
      assert.match(html, /datetime="2026-10-02T14:30:00Z"/);
      assert.match(html, /datetime="2024-03-04T10:00:00Z"/);
      assert.doesNotMatch(html, /2099|1970|undefined/);
      assert.match(html, /b-process-center-list__pos-date"><span>—<\/span>/);
      assert.equal(JSON.stringify([euro, dollar, missing]), before);
      const state = fixture(true);
      Object.assign(state, { isPos: true, page: 3, totalItems: 23 });
      assert.deepEqual(plain(state.marketplaceRange), { start: 21, end: 23, total: 23 });
      state.totalItems = 0;
      assert.deepEqual(plain(state.marketplaceRange), { start: 0, end: 0, total: 0 });
      assert.match(html, /cash_register\.orders\.range/);
    });

    await t.test('linked customers retain explicit shop scope and a fixed POS return without changing ordinary customer links', async () => {
      assert.equal(Customer.props.posReturn.default, false);
      const customer = { ...row, customer_id: 11, customer: { name: 'POS Customer' } };
      await render(List, props, [customer]);
      assert.equal(calls.find(call => call.name === 'BProcessCenterCustomer').attrs.posReturn, true);
      const link = calls.find(call => call.name === 'RouterLink' && call.attrs.to?.name === 'BPageCustomerDashboard').attrs;
      assert.deepEqual(plain(link.to), { name: 'BPageCustomerDashboard', params: { customer_id: 11, shop_id: 7 }, query: { pos_return: 'register' } });
      await render(Customer, { item: customer, shop: { id: 7 } });
      const ordinary = calls.find(call => call.name === 'RouterLink').attrs;
      assert.deepEqual(plain(ordinary.to), { name: 'BPageCustomerDashboard', params: { customer_id: 11 } });
    });

    await t.test('known payment states use native metadata and special payment states keep the native detail view', async () => {
      for (const [status, dot] of [['Open', 'warning'], ['Reserved', 'warning'], ['Payed', 'success'], ['COD', 'warning'], ['Canceled', 'error']]) {
        const html = await render(List, props, [{ ...row, status }]);
        assert.match(html, /b-process-center-list__marketplace-payment/);
        assert.ok(html.includes(Basket.Status[status].title));
        assert.ok(html.includes(`sd-modern-status__dot--${dot}`));
        assert.equal(calls.some(call => call.name === 'SOrderStatusView'), false);
        if (status === 'COD') assert.match(html, /cash_register\.orders\.cod_help/);
        if (status === 'COD' || status === 'Payed') {
          const cell = calls.find(call => call.name === 'v-data-table-server').content.find(node => node.props?.class === 'b-process-center-list__payment');
          const label = cell.children.find(node => node.props?.class?.includes('b-process-center-list__marketplace-payment'));
          let stopped = 0;
          label.props.onClick({ stopPropagation: () => stopped++ });
          assert.equal(stopped, status === 'COD' ? 1 : 0, 'COD help stays on the list; Paid keeps native row navigation');
        }
      }
      for (const details of [{ status: 'Unknown' }, { payment: { status: 'RequireCapture' } }, { payment: { card: { brand: 'visa', card_no: '****4242', country: 'US' } } }, { gateway_processing: true }]) {
        const order = { ...row, ...details };
        const html = await render(List, props, [order]);
        assert.doesNotMatch(html, /b-process-center-list__marketplace-payment/);
        const native = calls.find(call => call.name === 'SOrderStatusView').attrs;
        assert.equal(native.status, order.status);
        assert.equal(native['gateway-processing'], order.gateway_processing);
        assert.equal(native['payment-require-capture'], order.payment?.status === 'RequireCapture');
        assert.deepEqual(plain(native.payment ?? null), order.payment ?? null);
      }
    });

    await t.test('empty, unready, filtered, pending and failed reads expose distinct recovery states', async () => {
      assert.match(await render(List, props), /cash_register\.orders\.empty_title/);
      assert.doesNotMatch(await render(List, props, [], { emptyStateLoaded: false }), /cash_register\.orders\.empty_title/);
      assert.match(await render(List, props, [], { search: 'missing' }), /cash_register\.orders\.no_results_title/);
      assert.match(await render(List, props, [], { search: 'missing' }), /cash_register\.orders\.clear_search/);
      const pending = await render(List, props, [], { busy_fetch: true });
      assert.match(pending, /b-list-loading-state/);
      assert.doesNotMatch(pending, /cash_register\.orders\.empty_title/);
      const failed = await render(List, props, [], { fetch_error: true, search: 'kept' });
      assert.match(failed, /role="alert"/);
      assert.match(failed, /cash_register\.orders\.error_body/);
      assert.match(failed, /cash_register\.orders\.retry/);
      assert.doesNotMatch(failed, /cash_register\.orders\.(empty_title|no_results_title)/);
      const refresh = await render(List, props, [row], { fetch_error: true });
      assert.match(refresh, /POS-438/);
      assert.match(refresh, /cash_register\.orders\.error_body/);
    });

    await t.test('failed refreshes preserve filters and rows while stale success and failure cannot replace newer results', async () => {
      const originalGet = isolated.axios.get;
      const pending = [];
      isolated.axios.get = () => new Promise((resolve, reject) => pending.push({ resolve, reject }));
      const settle = () => new Promise(resolve => setImmediate(resolve));
      try {
        const state = fixture(true);
        Object.assign(state, { isPos: true, type: undefined, search: 'kept', status: ['Reserved', 'COD'], orders: [row], totalItems: 1 });
        state.fetchOrdersNow(2);
        pending[0].reject(new Error('Offline'));
        await settle();
        assert.equal(state.fetch_error, true);
        assert.equal(state.busy_fetch, false);
        assert.equal(state.search, 'kept');
        assert.deepEqual(plain(state.status), ['Reserved', 'COD']);
        assert.deepEqual(plain(state.orders), [row]);
        state.fetchOrdersNow(2);
        assert.equal(state.fetch_error, false);
        pending[1].resolve({ data: { error: true, error_msg: 'Unavailable' } });
        await settle();
        assert.equal(state.fetch_error, true);
        state.fetchOrdersNow(1);
        state.search = 'latest';
        state.fetchOrdersNow(1);
        pending[2].reject(new Error('Stale failure'));
        await settle();
        assert.equal(state.fetch_error, false);
        assert.equal(state.busy_fetch, true);
        pending[3].resolve({ data: { total: 1, orders: [{ ...row, id: 999 }] } });
        await settle();
        assert.equal(state.busy_fetch, false);
        assert.equal(state.orders[0].id, 999);
        state.fetchOrdersNow(1);
        state.fetchOrdersNow(1);
        pending[5].resolve({ data: { total: 0, orders: [] } });
        await settle();
        pending[4].resolve({ data: { total: 99, orders: [row] } });
        await settle();
        assert.equal(state.fetch_error, false);
        assert.equal(state.emptyStateLoaded, true);
        assert.equal(state.totalItems, 0);
        assert.deepEqual(plain(state.orders), []);
      } finally {
        isolated.axios.get = originalGet;
      }
    });
  } finally {
    if (previousName === undefined) delete route.name;
    else route.name = previousName;
  }
});
