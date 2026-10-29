import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Isolated role contexts: no application session, HTTP calls or provider access.
const root = new URL("../../../../", import.meta.url);
const Basket = {
  Status: { Payed: { code: "Payed" }, COD: { code: "COD" } },
  PhysicalOrderStates: Object.fromEntries(
    ["CheckQueue", "OrderConfirm", "PreparingOrder", "SentOrder", "ToCustomer"].map(
      (code) => [code, { code }],
    ),
  ),
};
const ProductType = { PHYSICAL: { code: "PHYSICAL" } };
const components = new Map();
const templates = new Map();
const paths = [
  "backoffice/order/cart/BOrderCart.vue",
  "backoffice/order/dashboard/cart/BOrderDashboardCart.vue",
  "backoffice/order/dashboard/payment/BOrderDashboardPayment.vue",
  "backoffice/order/dashboard/delivery/BOrderDashboardDelivery.vue",
  "backoffice/order/dashboard/preparing/BOrderDashboardPreparing.vue",
  "backoffice/order/payment/table/BOrderPaymentTable.vue",
  "backoffice/order/payment/row/pending/BOrderPaymentRowPending.vue",
  "backoffice/order/payment/row/payment/BOrderPaymentRowPayment.vue",
  "backoffice/order/payment/row/cashback/BOrderPaymentRowCashback.vue",
  "backoffice/order/payment/row/giftcard/BOrderPaymentRowGiftcard.vue",
  "storefront/order/delivery/DeliveryTimeline.vue",
  "storefront/order/delivery/DeliveryTimelineTransportationOrder.vue",
];
for (const path of paths) {
  const filename = new URL(path, root);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  assert.deepEqual(errors, [], path);
  compileScript(descriptor, { id: path });
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: path });
  assert.deepEqual(template.errors, [], path);
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({
      source: style.content, filename: filename.pathname, id: path,
      scoped: style.scoped, preprocessLang: style.lang,
    });
    assert.deepEqual(compiled.errors, [], path);
  }
  const exports = {};
  const unknownModule = new Proxy({ default: {}, Basket, ProductType,
    BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } },
    PriceHelper: { FixPrecisionForCurrency: (value) => value }, ShopOptionsHelper: {
    GetCheckout: (shop) => shop.checkout,
    AskShippingAddress: () => true, GetSizeUnit: () => "cm", GetMassUnit: () => "kg",
  }, BasketHelper: { GetTotalBasketItemsWeight: () => 1 } }, {
    get: (target, key) => key in target ? target[key] : {},
  });
  vm.runInNewContext(ts.transpileModule(descriptor.script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports,
    require: () => unknownModule,
    axios: new Proxy({}, { get: () => () => assert.fail("Role context must not call a shop API") }),
  });
  components.set(exports.default.name, exports.default);
  templates.set(exports.default.name, template.code);
}

function roleContext(overrides = {}) {
  return {
    isRolePanel: true, modern: true,
    $emit: () => assert.fail("Unsupported role event"),
    ...overrides,
  };
}

const cart = components.get("BOrderCart");
assert.equal(cart.computed.can_set_count_adjustment.call(roleContext()), false);
for (const method of ["showCountAdjustmentDialog", "setCountAdjustment"]) {
  const context = roleContext();
  cart.methods[method].call(context);
  assert.equal(context.count_adjustment_dialog, undefined);
  assert.equal(context.busy_set_count_adjustment, undefined);
}
assert.equal(cart.computed.can_set_count_adjustment.call({
  isRolePanel: false, modern: true, readonly: false,
  basket: { type: "PHYSICAL", delivery_state: "CheckQueue", status: "Payed" },
}), true, "Shop quantity adjustment remains available");

const payment = components.get("BOrderDashboardPayment");
const roleCheckout = { form: { name: true } };
assert.equal(payment.computed.checkout.call({ shop: { checkout: roleCheckout }, $shop: null }), roleCheckout,
  "The role page's explicit shop supplies checkout without a shop injection");
const legacyCheckout = { form: { phone: true } };
assert.equal(payment.computed.checkout.call({ shop: null, $shop: { checkout: legacyCheckout } }), legacyCheckout);
for (const method of ["checkPaymentStatus", "confirmCODPaymentCompleted"]) {
  const context = roleContext();
  payment.methods[method].call(context);
  assert.equal(context.busy_pay, undefined);
  assert.equal(context.busy_check, undefined);
}

const ledger = components.get("BOrderPaymentTable");
for (const method of [
  "showConfirmPaymentDir", "checkPaymentStatus", "confirmDIRPaymentCompleted",
  "updateAffiliateStatus", "showAddPayment", "addBill", "editBillPrice",
  "updateBillStatus", "showEditBill", "deleteBill", "showManuallyPayment",
  "confirmCashPaymentForBill",
]) {
  const context = roleContext();
  ledger.methods[method].call(context);
  assert.deepEqual(Object.keys(context).sort(), ["$emit", "isRolePanel", "modern"], method);
}
assert.equal(ledger.computed.can_add_pending_transaction.call({ isRolePanel: true, isService: true }), false);
assert.equal(ledger.computed.can_add_pending_transaction.call({ isRolePanel: false, isService: true }), true);
const shopLedger = { isRolePanel: false };
ledger.methods.showAddPayment.call(shopLedger);
assert.equal(shopLedger.add_bill_dialog, true, "Shop payment flow remains available");

const row = components.get("BOrderPaymentRowPayment");
row.methods.capturePayment.call({ readonly: true });
const readonlyRow = { readonly: true, gateway: { actions: ["refund", "delivery"] } };
assert.equal(row.computed.has_refund_action.call(readonlyRow), false);
assert.equal(row.computed.has_delivery_action.call(readonlyRow), false);
assert.equal(row.computed.action_items.call(readonlyRow).length, 0);
assert.equal(row.computed.has_refund_action.call({ ...readonlyRow, readonly: false }), true);
assert.equal(row.computed.has_delivery_action.call({ ...readonlyRow, readonly: false }), true);

const delivery = components.get("BOrderDashboardDelivery");
for (const method of ["returnDelivery", "refreshDeliveryServiceOrder", "setTracking", "editAddress", "autoSelectService"]) {
  const context = roleContext();
  delivery.methods[method].call(context);
  assert.deepEqual(Object.keys(context).sort(), ["$emit", "isRolePanel", "modern"], method);
}
for (const overrides of [
  { isDeliveryActionDisabled: true },
]) delivery.methods.sentOrder.call(roleContext(overrides));
for (const overrides of [
  { is_current_receipt_step: false, accept_action: true, busy_toCustomer: false },
  { is_current_receipt_step: true, accept_action: false, busy_toCustomer: false },
  { is_current_receipt_step: true, accept_action: true, busy_toCustomer: true },
]) delivery.methods.toCustomer.call(roleContext(overrides));

const sent = roleContext({
  isDeliveryActionDisabled: false,
  onDeleteLogisticSendingOrderQue: () => assert.fail("Role handoff must not mutate the shop shipping queue"),
  $emit: (event, { callback }) => { assert.equal(event, "confirm-send"); callback(); },
});
delivery.methods.sentOrder.call(sent);
assert.equal(sent.busy_sentOrder, false);
const received = roleContext({
  is_current_receipt_step: true, accept_action: true, busy_toCustomer: false,
  $emit: (event, { callback }) => { assert.equal(event, "confirm-received"); callback(); },
});
delivery.methods.toCustomer.call(received);
assert.equal(received.busy_toCustomer, false);
assert.equal(received.dialog_received_by_customer, false);

async function childScreen(name, props) {
  const component = components.get(name), code = templates.get(name), exports = {};
  vm.runInNewContext(ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: (path) => path === "vue" ? Vue : "/fixture/icon.svg" });
  const passthrough = { inheritAttrs: false, setup: (_, { slots, attrs }) => () => Vue.h("div", attrs,
    [slots.title?.(), slots.actions?.(), slots.default?.()]) };
  const button = { setup: (_, { slots, attrs }) => () => Vue.h("button", {
    ...attrs, "data-route": attrs.to ? JSON.stringify(attrs.to) : undefined,
  }, slots.default?.()) };
  const locals = Object.fromEntries(Object.keys(component.components ?? {}).map((key) => [key, passthrough]));
  locals.BBoxInput = { render: () => Vue.h("span", { "data-package-picker": "true" }) };
  locals.BOrderPaymentActionsRefundButton = { render: () => Vue.h("button", { "data-refund-action": "true" }) };
  locals.UNumberInput = { props: ["label"], setup: (props) => () => Vue.h("span", { "data-manual-input": "true" }, props.label) };
  locals.UPrice = { props: ["amount"], setup: (props) => () => Vue.h("output", { "data-amount": props.amount }, String(props.amount)) };
  const app = Vue.createSSRApp({ ...component, mixins: [], components: locals, render: exports.render,
    methods: { ...component.methods, formatCard: (value) => String(value), getLocalDateString: () => "fixture date",
      getFromNowString: () => "fixture elapsed", getLocalTimeString: () => "fixture time",
      getShopImagePath: (value) => value, getUserAvatar: (id) => `/fixture/avatar/${id}` },
  }, props);
  for (const name of new Set(Array.from(code.matchAll(/resolveComponent\("([^"]+)"/g), (match) => match[1]))) {
    app.component(name, name === "v-btn" ? button : passthrough);
  }
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, $tm: () => [], $route: { params: {}, matched: [] },
  });
  app.provide("$vendor", null);
  return new JSDOM(await renderToString(app)).window.document;
}
for (const modern of [true, false]) for (const isRolePanel of [true, false]) {
  const document = await childScreen("BOrderDashboardPreparing", {
    modern, isRolePanel, shop: { transportations: [] },
    basket: { type: "PHYSICAL", status: "Payed", delivery_state: "OrderConfirm", items: [],
      delivery_info: { type: null, weight: 1, volume: { width: 10, height: 10, length: 10 } } },
  });
  assert.equal(document.querySelectorAll("[data-package-picker]").length, isRolePanel ? 0 : 1,
    "Shop box picker must not mount in either role presentation");
  assert.equal(document.querySelectorAll("[data-manual-input]").length, 4,
    "Role packing retains manual weight and dimensions");
}
for (const readonly of [true, false]) {
  const cashback = await childScreen("BOrderPaymentRowCashback", { readonly, modern: true,
    order: { cashback_order: { amount_cashback: 3, currency: "USD", cashback: { id: 11, title: "Fixture cashback", description: "Fixture reward" } } },
  });
  assert.ok(cashback.body.textContent.includes("Fixture cashback"));
  assert.equal(cashback.querySelectorAll("[data-route]").length, readonly ? 0 : 1);
  const giftcard = await childScreen("BOrderPaymentRowGiftcard", { readonly, modern: true,
    giftcard: { number: "fixture-card", amount: 3, currency: "USD", type_id: 12, expire_at: "2026-01-08" },
  });
  assert.ok(giftcard.body.textContent.includes("fixture-card"));
  assert.equal(giftcard.querySelectorAll("[data-route]").length, readonly ? 0 : 1);
}

for (const modern of [true, false]) for (const isRolePanel of [true, false]) {
  const giftCards = [];
  giftCards.sumByKey = () => 0;
  const document = await childScreen("BOrderDashboardCart", {
    modern, isRolePanel, shop: { model: "RETAIL", title: "Fixture shop" },
    basket: { type: "PHYSICAL", status: "Payed", delivery_state: "OrderConfirm", currency: "USD",
      price: 100, tax: 5, gift_cards: giftCards, items: [{ id: 1, price: 100, count: 1, check: false }],
      payment: { currency: "USD", refund_amount: 0, gateway: { actions: ["refund"] } } },
  });
  assert.equal(document.querySelectorAll("[data-refund-action]").length, isRolePanel ? 0 : 1,
    "Native refund operation must not mount in either role presentation");
  for (const key of ["process_center.basket_list.need_to_refund.title",
    "process_center.basket_list.need_to_refund.message", "process_center.basket_list.total_refund.title",
    "process_center.basket_list.need_to_refund.calculated_approximately"]) {
    assert.ok(document.body.textContent.includes(key), `Readonly refund context retained: ${key}`);
  }
  assert.ok(document.querySelector('output[data-amount="105"]'), "Calculated refund amount remains visible");
}

console.log("Role child guards, supported delivery actions, native packing/refund/reward rendering and all twelve SFC compilations passed.");
