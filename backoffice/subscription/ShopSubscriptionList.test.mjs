import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { register } from "node:module";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import { JSDOM } from "jsdom";

// Render the real native switch in Node; styles are compiled separately below.
register(
  "data:text/javascript," +
    encodeURIComponent(`export async function load(url, context, nextLoad) {
  if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true };
  return nextLoad(url, context);
}`),
  import.meta.url,
);
const { createVuetify } = await import("vuetify");
const { VSwitch } = await import("vuetify/components/VSwitch");

// Every request is synthetic. No browser, wallet or application server is used.
const runtime = { axios: {} };
const notices = [];
let confirmation;
const notification = {
  showSuccessAlert: (...args) => notices.push(["success", ...args]),
  showErrorAlert: (...args) => notices.push(["error", ...args]),
  showLaravelError: (...args) => notices.push(["request-error", ...args]),
  openDangerAlert: (_title, _message, _action, callback) => {
    confirmation = callback;
  },
};
function evaluate(source, require = () => ({})) {
  const exports = {};
  const result = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, {
    exports,
    require,
    ...runtime,
    window: {
      API: new Proxy(
        {},
        {
          get:
            (_target, name) =>
            (...ids) =>
              `${String(name)}/${ids.join("/")}`,
        },
      ),
    },
  });
  return exports;
}
const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const licenses = evaluate(
  read("../../../core-js/enums/shop/ShopLicense.ts"),
  (path) => ({ default: path }),
);
const vouchers = evaluate(
  read("../../../core-js/enums/shop/Vouchers.ts"),
  () => licenses,
);
const filename = new URL("./ShopSubscriptionList.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const component = evaluate(descriptor.script.content, (path) => {
  if (path.includes("ShopLicense")) return licenses;
  if (path.includes("Vouchers")) return vouchers;
  if (path.includes("NotificationService")) return { default: notification };
  return { default: {} };
}).default;
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: component.name,
});
assert.deepEqual(compiled.errors, []);
const render = evaluate(compiled.code, () => Vue).render;
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({
    source: style.content,
    filename: filename.pathname,
    id: component.name,
    scoped: true,
    preprocessLang: style.lang,
  });
  assert.deepEqual(result.errors, []);
}
const translations = new Map();
const locale = (language) => {
  if (translations.has(language)) return translations.get(language);
  const dashboard = evaluate(
    read(`../../../translate/dashboard/${language}.ts`),
  ).default;
  const global = evaluate(
    read(`../../../translate/global/${language}.ts`),
    () => ({ default: {} }),
  ).default;
  const translate = (key, values = {}) => {
    const messages = { ...dashboard, global };
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], messages);
    assert.equal(typeof value, "string", `Missing ${language} message: ${key}`);
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      String(values[name] ?? `{${name}}`),
    );
  };
  translations.set(language, translate);
  return translate;
};
const english = locale("en");
function state(extra = {}) {
  const user = { vouchers: [] };
  const emitted = [];
  const context = {
    ...component.data(),
    shop: { id: 1, license: "FREE", icon: null },
    modern: true,
    disabled: false,
    USER: () => user,
    $emit: (...args) => emitted.push(args),
    $t: english,
    $refs: {},
    $nextTick: (callback) => Promise.resolve().then(callback),
    getShopLicenseName: (code) => english(licenses.ShopLicense[code].name),
    getShopLicenseIcon: (code) => `/test-license/${code}.svg`,
    AddOrUpdateItemByID(items, item) {
      const index = items.findIndex((value) => value.id === item.id);
      if (index < 0) items.push(item);
      else items[index] = item;
    },
    DeleteItemByID(items, id) {
      const index = items.findIndex((value) => value.id === id);
      if (index >= 0) items.splice(index, 1);
    },
    ...extra,
  };
  for (const [key, method] of Object.entries(component.methods))
    context[key] = method.bind(context);
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(context, key, { get: () => getter.call(context) });
  context.user = user;
  context.emitted = emitted;
  return context;
}
function resetRequests() {
  for (const method of ["get", "post", "put", "delete"])
    runtime.axios[method] = () => {
      throw new Error(`Unexpected ${method} request`);
    };
  notices.length = 0;
  confirmation = null;
}
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
};
const wallet = {
  account_number: "EXAMPLE-WALLET",
  currency: "USD",
  balance: 100,
  locked: 20,
};
const paidState = () =>
  state({
    modern: false,
    agreement: true,
    account_selected: { ...wallet },
    subscription_code: "COMPANY",
    type: "monthly",
    price: 30,
    currency: "USD",
    sheet: true,
  });
const record = (id, extra = {}) => ({
  id,
  code: "ENTERPRISE",
  renewal: false,
  start_at: "2026-10-01",
  end_at: "2027-10-01",
  created_at: "2026-09-01",
  payment: 30,
  currency: "USD",
  voucher: {
    code: "TWELVE_MONTHS_COMPANY",
    used_at: "2026-09-01",
    comment: "Example voucher",
  },
  ...extra,
});

// Reads preserve existing rows on failure and reject an earlier shop's response.
resetRequests();
const list = state();
runtime.axios.get = async () => ({ data: { subscriptions: [record(1)] } });
await list.fetchSubscriptions();
assert.equal(list.subscriptions.length, 1);
runtime.axios.get = async () => {
  throw new Error("Synthetic read failure");
};
await list.fetchSubscriptions();
assert.equal(list.busy_fetch, false);
assert.equal(list.subscriptions.length, 1);
const oldRead = deferred();
runtime.axios.get = () => oldRead.promise;
const pendingRead = list.fetchSubscriptions();
list.shop = { id: 2, license: "FREE" };
runtime.axios.get = async () => ({ data: { subscriptions: [record(2)] } });
component.watch["shop.id"].call(list);
await Promise.resolve();
oldRead.resolve({ data: { subscriptions: [record(99)] } });
await pendingRead;
assert.equal(list.subscriptions[0].id, 2);

// Quotes use the selected currency and paid period; late quotes cannot win.
resetRequests();
const quote = paidState();
let requested;
const first = deferred(),
  second = deferred();
runtime.axios.get = (url, options) => {
  requested = { url, options };
  return first.promise;
};
const olderQuote = quote.refreshPrice();
assert.equal(requested.url, "GET_SHOP_SUBSCRIPTION_PRICE/1");
assert.equal(
  JSON.stringify(requested.options.params),
  JSON.stringify({ currency: "USD", type: "monthly", code: "COMPANY" }),
);
assert.equal(quote.price, null);
quote.type = "yearly";
runtime.axios.get = () => second.promise;
const currentQuote = quote.refreshPrice();
second.resolve({
  data: {
    price: 70,
    currency: "USD",
    start_at: "new-start",
    end_at: "new-end",
  },
});
await currentQuote;
first.resolve({
  data: { price: 5, currency: "USD", start_at: "old-start", end_at: "old-end" },
});
await olderQuote;
assert.equal(quote.price, 70);
assert.equal(quote.start_at, "new-start");
quote.account_selected = null;
quote.refreshPrice();
assert.equal(quote.price, null);
assert.equal(quote.busy_price, false);
runtime.axios.get = async () => {
  throw new Error("Synthetic quote failure");
};
quote.account_selected = wallet;
await quote.refreshPrice();
assert.equal(quote.price, null);
assert.equal(quote.busy_price, false);

// Native purchase guards also apply to direct/keyboard invocation.
resetRequests();
const buy = paidState();
for (const [property, value] of [
  ["disabled", true],
  ["agreement", false],
  ["busy_price", true],
  ["price", null],
]) {
  const original = buy[property];
  buy[property] = value;
  assert.equal(buy.buySubscription(), undefined);
  buy[property] = original;
}
buy.account_selected.balance = 25;
assert.equal(buy.needCharge, true);
assert.equal(buy.calculated_need_charge, 25);
assert.equal(buy.buySubscription(), undefined);
buy.account_selected.balance = 100;
const purchase = deferred();
let purchasePayload,
  writes = 0;
runtime.axios.post = (_url, payload) => {
  writes++;
  purchasePayload = payload;
  return purchase.promise;
};
const pendingBuy = buy.buySubscription();
buy.buySubscription();
assert.equal(writes, 1);
assert.equal(purchasePayload.account_number, "EXAMPLE-WALLET");
assert.equal(purchasePayload.voucher_code, null);
purchase.resolve({
  data: { subscription: record(3), shop_license: "COMPANY", vouchers: [] },
});
await pendingBuy;
assert.equal(buy.shop.license, "COMPANY");
assert.equal(buy.subscriptions[0].id, 3);
assert.equal(buy.sheet, false);
assert.equal(buy.busy_buy, false);
assert.deepEqual(buy.emitted, [["refresh"]]);
const failedBuy = paidState();
runtime.axios.post = async () => ({
  data: { error: true, error_msg: "Synthetic decline" },
});
await failedBuy.buySubscription();
assert.equal(failedBuy.sheet, true);
assert.equal(failedBuy.busy_buy, false);
assert.equal(failedBuy.shop.license, "FREE");

// Voucher selection keeps its real plan/duration, uses the type code, and clears stale pricing.
resetRequests();
const voucherState = paidState();
const voucher = { id: 700, code: "TWELVE_MONTHS_COMPANY", total: 1 };
voucherState.selectVoucher(voucher);
voucherState.agreement = true;
assert.equal(voucherState.account_selected, null);
assert.equal(voucherState.subscription_code, "COMPANY");
assert.equal(voucherState.selected_voucher_obj.months, 12);
assert.equal(voucherState.price, null);
assert.equal(voucherState.sheet, true);
runtime.axios.post = async (_url, payload) => {
  purchasePayload = payload;
  return {
    data: { subscription: record(4), shop_license: "COMPANY", vouchers: [] },
  };
};
await voucherState.buySubscription();
assert.equal(purchasePayload.voucher_code, "TWELVE_MONTHS_COMPANY");
assert.equal(purchasePayload.account_number, null);
assert.equal(voucherState.voucher_selected, null);
assert.equal(voucherState.user.vouchers.length, 0);

// Only the last subscription may renew, with a current server result and failure cleanup.
resetRequests();
const renewal = state({ subscriptions: [record(1), record(2)] });
assert.equal(renewal.toggleRenewal(renewal.subscriptions[0]), undefined);
runtime.axios.put = async (_url, payload) => {
  assert.equal(payload.renewal, true);
  return { data: { renewal: true } };
};
await renewal.toggleRenewal(renewal.subscriptions[1]);
assert.equal(renewal.subscriptions[1].renewal, true);
assert.equal(renewal.busy_renewal, null);
runtime.axios.put = async () => {
  throw new Error("Synthetic renewal failure");
};
await renewal.toggleRenewal(renewal.subscriptions[1]);
assert.equal(renewal.subscriptions[1].renewal, true);
assert.equal(renewal.busy_renewal, null);

// Cancellation has no request before confirmation; a changed/disabled shop blocks confirmation.
resetRequests();
const cancellation = state({ subscriptions: [record(5)] });
cancellation.cancelSubscription(5);
assert.equal(typeof confirmation, "function");
cancellation.disabled = true;
assert.equal(confirmation(), undefined);
cancellation.disabled = false;
cancellation.cancelSubscription(5);
cancellation.context_version++;
assert.equal(confirmation(), undefined);
cancellation.cancelSubscription(5);
runtime.axios.delete = async (url) => {
  assert.equal(url, "DELETE_SHOP_SUBSCRIPTION/1/5");
  return { data: { id: 5, shop_license: "FREE", vouchers: [voucher] } };
};
await confirmation();
assert.equal(cancellation.subscriptions.length, 0);
assert.equal(cancellation.user.vouchers[0].code, voucher.code);
assert.equal(cancellation.busy_cancel, null);
assert.deepEqual(cancellation.emitted, [["refresh"]]);
cancellation.cancelSubscription(6);
runtime.axios.delete = async () => {
  throw new Error("Synthetic cancellation failure");
};
await confirmation();
assert.equal(cancellation.busy_cancel, null);

// A route change or unmount cannot apply an old purchase/quote to the next shop.
resetRequests();
const staleBuy = paidState(),
  lateBuy = deferred();
runtime.axios.post = () => lateBuy.promise;
const oldPurchase = staleBuy.buySubscription();
staleBuy.shop = { id: 2, license: "FREE" };
staleBuy.context_version++;
lateBuy.resolve({
  data: { subscription: record(99), shop_license: "ENTERPRISE" },
});
await oldPurchase;
assert.equal(staleBuy.shop.license, "FREE");
assert.equal(staleBuy.emitted.length, 0);
const disposed = paidState(),
  lateQuote = deferred();
runtime.axios.get = () => lateQuote.promise;
const unmountedQuote = disposed.refreshPrice();
component.beforeUnmount.call(disposed);
lateQuote.resolve({ data: { price: 999, currency: "USD" } });
await unmountedQuote;
assert.equal(disposed.price, null);
const blocked = paidState();
blocked.disabled = true;
component.watch.disabled.call(blocked, true);
assert.equal(blocked.sheet, false);
assert.equal(blocked.price, null);
blocked.openPurchase();
blocked.selectVoucher(voucher);
assert.equal(blocked.sheet, false);

// The modern wizard cannot skip wallet selection, a current quote or review consent.
resetRequests();
const wizard = state();
wizard.openPurchase();
assert.equal(wizard.checkout_step, 1);
assert.equal(wizard.agreement, false);
assert.equal(Boolean(wizard.canContinueCheckout), false);
wizard.continueCheckout();
wizard.goCheckoutStep(3);
assert.equal(wizard.checkout_step, 1);
assert.equal(wizard.buySubscription(), undefined);
wizard.account_selected = { ...wallet };
assert.equal(Boolean(wizard.canContinueCheckout), true);
wizard.continueCheckout();
assert.equal(wizard.checkout_step, 2);
assert.equal(Boolean(wizard.canContinueCheckout), false);
wizard.continueCheckout();
assert.equal(wizard.checkout_step, 2);
wizard.subscription_code = "COMPANY";
wizard.type = "monthly";
const quoteResult = {
  price: 30,
  currency: "USD",
  start_at: "2026-11-01T00:00:00Z",
  end_at: "2026-12-01T00:00:00Z",
};
let wizardQuoteParams;
runtime.axios.get = async (_url, { params }) => {
  wizardQuoteParams = params;
  return { data: { ...quoteResult } };
};
await wizard.refreshPrice();
assert.equal(wizardQuoteParams.type, "monthly");
assert.equal(Boolean(wizard.hasCheckoutQuote), true);
assert.equal(Boolean(wizard.canContinueCheckout), true);
wizard.agreement = true;
assert.equal(Boolean(wizard.canSubmitCheckout), false);
assert.equal(wizard.buySubscription(), undefined);
wizard.continueCheckout();
assert.equal(wizard.checkout_step, 3);
assert.equal(Boolean(wizard.canSubmitCheckout), false);
assert.equal(wizard.buySubscription(), undefined);
wizard.agreement = true;
assert.equal(Boolean(wizard.canSubmitCheckout), true);
wizard.sheet = false;
assert.equal(Boolean(wizard.canSubmitCheckout), false);
assert.equal(wizard.buySubscription(), undefined);
wizard.sheet = true;

// A selection edit blocks a fast Pay click even before its watcher requests a new quote.
for (const [property, replacement] of [
  ["subscription_code", "ENTERPRISE"],
  ["type", "yearly"],
  ["account_selected", { ...wallet, account_number: "OTHER-EXAMPLE-WALLET" }],
  ["account_selected", { ...wallet, currency: "EUR" }],
]) {
  const original = wizard[property];
  wizard[property] = replacement;
  assert.equal(Boolean(wizard.hasCheckoutQuote), false);
  assert.equal(Boolean(wizard.canSubmitCheckout), false);
  assert.equal(wizard.buySubscription(), undefined);
  wizard[property] = original;
}
wizard.account_selected.balance = 25;
assert.equal(wizard.calculated_need_charge, 25);
assert.equal(Boolean(wizard.canSubmitCheckout), false);
assert.equal(wizard.buySubscription(), undefined);
wizard.account_selected.balance = 50; // Exactly 30 remains after the locked balance.
assert.equal(Boolean(wizard.canSubmitCheckout), true);
let wizardWrites = 0;
runtime.axios.post = async (_url, payload) => {
  wizardWrites++;
  assert.equal(payload.account_number, "EXAMPLE-WALLET");
  assert.equal(payload.code, "COMPANY");
  assert.equal(payload.type, "monthly");
  assert.equal(payload.voucher_code, null);
  return { data: { subscription: record(8), shop_license: "COMPANY" } };
};
const wizardPurchase = wizard.buySubscription();
wizard.buySubscription();
await wizardPurchase;
assert.equal(wizardWrites, 1);
assert.equal(wizard.sheet, false);
assert.deepEqual(wizard.emitted, [["refresh"]]);

// Back/Next plus changed choices cannot reuse an old response or retain consent.
resetRequests();
const revisited = state({
  sheet: true,
  checkout_step: 2,
  account_selected: { ...wallet },
  subscription_code: "COMPANY",
  type: "monthly",
});
const oldWizardQuote = deferred(),
  newWizardQuote = deferred();
runtime.axios.get = () => oldWizardQuote.promise;
const pendingOldWizardQuote = revisited.refreshPrice();
assert.equal(Boolean(revisited.canContinueCheckout), false);
revisited.continueCheckout();
assert.equal(revisited.checkout_step, 2);
revisited.backCheckout();
assert.equal(revisited.checkout_step, 1);
revisited.account_selected = { ...wallet, currency: "EUR" };
runtime.axios.get = () => newWizardQuote.promise;
const pendingNewWizardQuote = revisited.refreshPrice();
revisited.continueCheckout();
assert.equal(revisited.checkout_step, 2);
oldWizardQuote.resolve({ data: quoteResult });
await pendingOldWizardQuote;
assert.equal(Boolean(revisited.hasCheckoutQuote), false);
assert.equal(Boolean(revisited.canContinueCheckout), false);
newWizardQuote.resolve({
  data: { ...quoteResult, price: 40, currency: "EUR" },
});
await pendingNewWizardQuote;
assert.equal(revisited.currency, "EUR");
revisited.continueCheckout();
assert.equal(revisited.checkout_step, 3);
revisited.agreement = true;
revisited.backCheckout();
assert.equal(revisited.checkout_step, 2);
revisited.type = "yearly";
runtime.axios.get = async () => {
  throw new Error("Synthetic revised quote failure");
};
await revisited.refreshPrice();
assert.equal(revisited.agreement, false);
assert.equal(Boolean(revisited.hasCheckoutQuote), false);
assert.equal(Boolean(revisited.canSubmitCheckout), false);
assert.equal(revisited.checkout_price_error, true);
revisited.continueCheckout();
assert.equal(revisited.checkout_step, 2);
for (const invalidQuote of [
  { ...quoteResult, price: 0, currency: "EUR" },
  { ...quoteResult, start_at: "invalid-date", currency: "EUR" },
  { ...quoteResult, end_at: null, currency: "EUR" },
]) {
  runtime.axios.get = async () => ({ data: invalidQuote });
  await revisited.refreshPrice();
  assert.equal(Boolean(revisited.hasCheckoutQuote), false);
  assert.equal(Boolean(revisited.canContinueCheckout), false);
}
runtime.axios.get = async () => ({ data: { ...quoteResult, currency: "EUR" } });
await revisited.refreshPrice();
assert.equal(revisited.checkout_price_error, false);
assert.equal(Boolean(revisited.canContinueCheckout), true);
revisited.continueCheckout();
assert.equal(revisited.checkout_step, 3);
assert.equal(revisited.agreement, false);

const closedQuote = state({
  sheet: true,
  checkout_step: 2,
  account_selected: { ...wallet },
  subscription_code: "COMPANY",
  type: "monthly",
});
const closingResponse = deferred();
runtime.axios.get = () => closingResponse.promise;
const closingRequest = closedQuote.refreshPrice();
closedQuote.sheet = false;
component.watch.sheet.call(closedQuote, false);
closingResponse.resolve({ data: quoteResult });
await closingRequest;
assert.equal(closedQuote.quote_selection, null);
assert.equal(closedQuote.checkout_step, 1);
assert.equal(Boolean(closedQuote.canSubmitCheckout), false);

// A prepaid voucher has its own fixed plan/months and never quotes or charges a wallet.
resetRequests();
const voucherWizard = state({
  account_selected: { ...wallet },
  subscription_code: "ENTERPRISE",
  type: "yearly",
  renewal: true,
  agreement: true,
});
voucherWizard.selectVoucher(voucher);
assert.equal(voucherWizard.checkout_step, 1);
assert.equal(voucherWizard.agreement, false);
assert.equal(voucherWizard.account_selected, null);
assert.equal(voucherWizard.selected_voucher_obj.months, 12);
assert.equal(voucherWizard.selected_voucher_obj.subscription, "COMPANY");
assert.equal(voucherWizard.subscription_code, "COMPANY");
assert.equal(Boolean(voucherWizard.hasCheckoutQuote), false);
voucherWizard.continueCheckout();
assert.equal(voucherWizard.checkout_step, 2);
voucherWizard.continueCheckout();
assert.equal(voucherWizard.checkout_step, 3);
assert.equal(Boolean(voucherWizard.canSubmitCheckout), false);
voucherWizard.agreement = true;
assert.equal(Boolean(voucherWizard.canSubmitCheckout), true);
voucherWizard.subscription_code = "ENTERPRISE";
assert.equal(Boolean(voucherWizard.canSubmitCheckout), false);
assert.equal(voucherWizard.buySubscription(), undefined);
voucherWizard.subscription_code = "COMPANY";
runtime.axios.post = async (_url, payload) => {
  assert.equal(payload.voucher_code, "TWELVE_MONTHS_COMPANY");
  assert.equal(payload.account_number, null);
  assert.equal(payload.code, "COMPANY");
  return {
    data: { subscription: record(9), shop_license: "COMPANY", vouchers: [] },
  };
};
await voucherWizard.buySubscription();
assert.equal(voucherWizard.sheet, false);

// Closing/reopening starts at Wallet; no old approval can submit another purchase.
resetRequests();
const reopened = state({
  sheet: false,
  checkout_step: 3,
  agreement: true,
  account_selected: { ...wallet },
  subscription_code: "COMPANY",
  type: "monthly",
  price: 30,
  currency: "USD",
});
runtime.axios.get = async () => ({ data: quoteResult });
reopened.openPurchase();
assert.equal(reopened.checkout_step, 1);
assert.equal(reopened.agreement, false);
assert.equal(reopened.account_selected, null);
assert.equal(reopened.subscription_code, null);
assert.equal(reopened.type, null);
assert.equal(reopened.renewal, false);
assert.equal(Boolean(reopened.canSubmitCheckout), false);
assert.equal(reopened.buySubscription(), undefined);

// Step changes focus the rendered heading; closed or disposed dialogs cannot steal focus.
const focusedSteps = [];
const focused = state({
  sheet: true,
  account_selected: { ...wallet },
  $refs: {
    checkoutHeading: { focus: () => focusedSteps.push(focused.checkout_step) },
  },
});
focused.continueCheckout();
assert.equal(focused.checkout_step, 2);
assert.deepEqual(focusedSteps, []);
await Promise.resolve();
assert.deepEqual(focusedSteps, [2]);
focused.backCheckout();
await Promise.resolve();
assert.deepEqual(focusedSteps, [2, 1]);
focused.checkout_step = 3;
focused.goCheckoutStep(1);
await Promise.resolve();
assert.deepEqual(focusedSteps, [2, 1, 1]);
focused.focusCheckoutHeading();
focused.sheet = false;
await Promise.resolve();
assert.deepEqual(focusedSteps, [2, 1, 1]);
focused.sheet = true;
focused.focusCheckoutHeading();
component.beforeUnmount.call(focused);
await Promise.resolve();
assert.deepEqual(focusedSteps, [2, 1, 1]);
state({
  modern: false,
  sheet: true,
  $refs: focused.$refs,
}).focusCheckoutHeading();
await Promise.resolve();
assert.deepEqual(focusedSteps, [2, 1, 1]);

// Modern opt-in leaves legacy copy/controls available and renders actual localized data.
const wrapper = (tag) =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h(tag, attrs, slots.default?.()),
  });
const tooltip = Vue.defineComponent({
  inheritAttrs: false,
  setup:
    (_, { slots }) =>
    () =>
      Vue.h(Vue.Fragment, [
        slots.activator?.({ props: {} }),
        Vue.h("span", { role: "tooltip" }, slots.default?.()),
      ]),
});
const table = Vue.defineComponent({
  props: ["items", "headers"],
  setup:
    (props, { slots }) =>
    () =>
      Vue.h("div", [
        Vue.h("table", [
          Vue.h(
            "thead",
            Vue.h(
              "tr",
              props.headers.map((column) =>
                Vue.h(
                  "th",
                  slots[`header.${column.value}`]?.({ column }) ?? column.title,
                ),
              ),
            ),
          ),
          Vue.h(
            "tbody",
            props.items.map((item) =>
              Vue.h(
                "tr",
                props.headers.map((column) =>
                  Vue.h("td", slots[`item.${column.value}`]?.({ item })),
                ),
              ),
            ),
          ),
        ]),
        !props.items.length && slots["no-data"]?.(),
        slots.bottom?.(),
      ]),
});
const toggle = Vue.defineComponent({
  inheritAttrs: false,
  props: ["modelValue", "trueTitle", "falseTitle"],
  setup:
    (props, { attrs }) =>
    () =>
      Vue.h(
        "div",
        attrs,
        props.modelValue ? props.trueTitle : props.falseTitle,
      ),
});
const bottomSheet = Vue.defineComponent({
  props: ["modelValue"],
  setup:
    (props, { slots }) =>
    () =>
      props.modelValue
        ? Vue.h("div", { role: "dialog" }, slots.default?.())
        : null,
});
const widgetHeader = Vue.defineComponent({
  props: ["title"],
  setup: (props) => () => Vue.h("h2", props.title),
});
async function rendered({
  language = "en",
  modern = true,
  mobile = false,
  rows = [record(1)],
  sheet = false,
  selected = null,
  disabled = false,
  busyRenewal = false,
  checkoutStep = 1,
  checkout = {},
} = {}) {
  const t = locale(language);
  const user = { vouchers: [voucher] };
  const app = Vue.createSSRApp(
    {
      ...component,
      components: {
        VDialog: bottomSheet,
        VBottomSheet: bottomSheet,
        BAccountInput: wrapper("div"),
        USmartSelect: wrapper("div"),
        USmartToggle: toggle,
        USmartVerify: toggle,
        UTextValueDashed: wrapper("div"),
        UTimeProgressBar: wrapper("span"),
      },
      render,
      created() {},
      data: () => ({
        ...component.data(),
        subscriptions: rows,
        sheet,
        voucher_selected: selected,
        subscription_code: selected
          ? vouchers.Vouchers[selected.code].subscription
          : null,
        busy_renewal: busyRenewal ? rows.at(-1) : null,
        checkout_step: checkoutStep,
        agreement: modern ? false : true,
        ...checkout,
      }),
    },
    { shop: { id: 1, license: "FREE", icon: null }, modern, disabled },
  );
  app.use(
    createVuetify({
      ssr: true,
      locale: { locale: language, rtl: { fa: true } },
    }),
  );
  Object.assign(app.config.globalProperties, {
    $t: t,
    $vuetify: { display: { smAndDown: mobile } },
    USER: () => user,
    getShopLicenseName: (code) => t(licenses.ShopLicense[code].name),
    getShopLicenseIcon: (code) => `/test-license/${code}.svg`,
    getShopImagePath: () => "/example-shop.svg",
    formatCard: (value) => value,
    getFromNowString: (value) => value,
    getLocalDateString: (value) => value,
    getLocalTimeString: (value) => value,
    getLocalTimeStringSmall: (value) => value,
    FormatNumberCurrency: (value) => String(value),
    GetUserSelectedCurrencyName: (currency) => currency,
  });
  app.config.warnHandler = () => {};
  for (const tag of new Set(
    [...descriptor.template.content.matchAll(/<(v-[\w-]+)\b/g)].map(
      (match) => match[1],
    ),
  )) {
    if (
      ![
        "v-data-table",
        "v-tooltip",
        "v-bottom-sheet",
        "v-btn",
        "v-switch",
      ].includes(tag)
    )
      app.component(tag, wrapper("div"));
  }
  app.component("v-data-table", table);
  app.component("v-tooltip", tooltip);
  app.component("v-bottom-sheet", bottomSheet);
  app.component("v-btn", wrapper("button"));
  app.component("v-switch", VSwitch);
  app.component("u-widget-header", widgetHeader);
  app.component(
    "u-price",
    Vue.defineComponent({
      props: ["amount", "currency"],
      setup: (props) => () =>
        Vue.h("span", `${props.amount} ${props.currency}`),
    }),
  );
  app.component("u-loading-progress", wrapper("span"));
  return renderToString(app);
}
const dialogButton = (document, caption) =>
  [...document.querySelectorAll('[role="dialog"] button')].find((button) =>
    button.textContent.includes(caption),
  );
resetRequests();
const renderQuote = state({
  sheet: true,
  checkout_step: 2,
  account_selected: { ...wallet },
  subscription_code: "COMPANY",
  type: "monthly",
});
runtime.axios.get = async () => ({ data: quoteResult });
await renderQuote.refreshPrice();
const quotedCheckout = Object.fromEntries(
  [
    "account_selected",
    "subscription_code",
    "type",
    "price",
    "currency",
    "start_at",
    "end_at",
    "quote_selection",
  ].map((key) => [key, renderQuote[key]]),
);

// An interrupted response may follow a committed payment: reload history, never retry automatically.
resetRequests();
const uncertain = state({
  ...quotedCheckout,
  sheet: true,
  checkout_step: 3,
  agreement: true,
});
const authoritativeHistory = deferred();
let uncertainPosts = 0,
  historyReads = 0;
runtime.axios.post = async () => {
  uncertainPosts++;
  throw new Error("Synthetic interrupted purchase response");
};
runtime.axios.get = (url) => {
  historyReads++;
  assert.equal(url, "GET_SHOP_SUBSCRIPTIONS/1");
  return authoritativeHistory.promise;
};
assert.equal(Boolean(uncertain.canSubmitCheckout), true);
await uncertain.buySubscription();
assert.equal(uncertainPosts, 1);
assert.equal(historyReads, 1);
assert.equal(uncertain.sheet, false);
assert.equal(uncertain.agreement, false);
assert.equal(uncertain.quote_selection, null);
assert.equal(uncertain.busy_buy, false);
assert.equal(uncertain.busy_fetch, true);
assert.equal(uncertain.buySubscription(), undefined);
assert.equal(uncertainPosts, 1);
assert.ok(
  notices.some(
    ([kind, , message]) =>
      kind === "error" &&
      message === english("shop_license.workspace.checkout.purchase_uncertain"),
  ),
);
authoritativeHistory.resolve({ data: { subscriptions: [record(10)] } });
await new Promise(setImmediate);
assert.equal(uncertain.subscriptions[0].id, 10);
assert.equal(uncertain.busy_fetch, false);
assert.equal(uncertainPosts, 1);

// A confirmed business rejection remains reviewable without an uncertain-result history reload.
resetRequests();
const declined = state({
  ...quotedCheckout,
  sheet: true,
  checkout_step: 3,
  agreement: true,
});
runtime.axios.post = async () => ({
  data: { error: true, error_msg: "Synthetic purchase declined" },
});
await declined.buySubscription();
assert.equal(declined.sheet, true);
assert.equal(declined.busy_buy, false);
assert.equal(declined.hasCheckoutQuote, true);
assert.ok(
  notices.some(
    ([kind, , message]) =>
      kind === "error" && message === "Synthetic purchase declined",
  ),
);

for (const language of ["en", "fa"])
  for (const mobile of [false, true]) {
    const html = await rendered({ language, mobile });
    const t = locale(language);
    assert.ok(html.includes(t("shop_license.workspace.history_title")));
    assert.ok(html.includes(t("global.license.enterprise")));
    assert.ok(html.includes("2026-10-01"));
    assert.ok(html.includes("30 USD"));
    assert.ok(
      html.includes(
        t("shop_license.workspace.voucher_title", {
          months: 12,
          license: t("global.license.company"),
        }),
      ),
    );
    assert.ok(
      html.includes(t("shop_license.workspace.voucher_count", { count: 2 })),
    );
    assert.ok(
      html.includes('aria-label="' + t("shop_license.table.renewal") + '"'),
    );
    const document = new JSDOM(html).window.document;
    const renewalInput = document.querySelectorAll(
      '.b-shop-subscriptions__renewal input[type="checkbox"]',
    );
    assert.equal(renewalInput.length, 1);
    assert.equal(renewalInput[0].getAttribute("role"), "switch");
    assert.equal(renewalInput[0].checked, false);
    assert.equal(renewalInput[0].disabled, false);
    assert.equal(
      document
        .querySelector(".b-shop-subscriptions__renewal")
        .classList.contains("v-locale--is-rtl"),
      language === "fa",
    );
    assert.ok(
      document
        .querySelector(".b-shop-subscriptions__renewal")
        .textContent.includes(t("shop_license.workspace.renewal_off")),
    );
    const activeDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        rows: [record(1), record(2, { renewal: true })],
      }),
    ).window.document;
    assert.equal(
      activeDocument.querySelectorAll(".b-shop-subscriptions__renewal input")
        .length,
      1,
    );
    assert.equal(
      activeDocument.querySelector(".b-shop-subscriptions__renewal input")
        .checked,
      true,
    );
    assert.ok(
      activeDocument
        .querySelector(".b-shop-subscriptions__renewal")
        .textContent.includes(t("shop_license.workspace.renewal_on")),
    );
    const pendingDocument = new JSDOM(
      await rendered({ language, mobile, busyRenewal: true }),
    ).window.document;
    assert.equal(
      pendingDocument.querySelector(".b-shop-subscriptions__renewal input")
        .disabled,
      true,
    );
    assert.equal(
      pendingDocument
        .querySelector(".b-shop-subscriptions__renewal input")
        .getAttribute("aria-busy"),
      "true",
    );
    assert.equal(
      document.querySelectorAll(".b-shop-subscriptions__date-range time")
        .length,
      2,
    );
    assert.ok(
      document
        .querySelector(".b-shop-subscriptions__date-range time")
        .getAttribute("aria-label")
        .includes("2026-10-01"),
    );
    assert.equal(
      document.querySelector(".b-shop-subscriptions__date-end").textContent,
      t("shop_license.workspace.history_period_to", { date: "2027-10-01" }),
    );
    assert.equal(html.includes("undefined"), false);
    const purchaseHtml = await rendered({
      language,
      mobile,
      sheet: true,
      selected: voucher,
    });
    assert.ok(purchaseHtml.includes('role="dialog"'));
    assert.ok(
      purchaseHtml.includes(t("shop_license.workspace.checkout.voucher_help")),
    );
    const voucherStartDocument = new JSDOM(purchaseHtml).window.document;
    assert.equal(
      voucherStartDocument.querySelectorAll('[aria-current="step"]').length,
      1,
    );
    assert.equal(
      voucherStartDocument.querySelector(".b-shop-subscriptions__wallet-input"),
      null,
    );
    const paidHtml = await rendered({
      language,
      mobile,
      sheet: true,
      disabled: true,
    });
    const walletDocument = new JSDOM(paidHtml).window.document;
    assert.equal(
      walletDocument
        .querySelector("#subscription-checkout-wallet")
        ?.getAttribute("tabindex"),
      "-1",
    );
    assert.equal(
      walletDocument.querySelector("#subscription-checkout-plan"),
      null,
    );
    assert.equal(
      walletDocument.querySelector("#subscription-checkout-review"),
      null,
    );
    assert.ok(
      walletDocument.body.textContent.includes(
        t("shop_license.workspace.checkout.wallet_help"),
      ),
    );
    assert.ok(
      walletDocument.body.textContent.includes(
        t("shop_license.workspace.checkout.wallet_no_charge"),
      ),
    );
    assert.equal(
      dialogButton(
        walletDocument,
        t("shop_license.workspace.checkout.continue"),
      ).disabled,
      true,
    );
    const planDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        checkoutStep: 2,
        checkout: { account_selected: { ...wallet } },
      }),
    ).window.document;
    assert.equal(
      planDocument
        .querySelector("#subscription-checkout-plan")
        ?.getAttribute("tabindex"),
      "-1",
    );
    assert.equal(
      planDocument.querySelector(".b-shop-subscriptions__wallet-input"),
      null,
    );
    assert.equal(
      planDocument.querySelector("#subscription-checkout-review"),
      null,
    );
    assert.equal(
      dialogButton(planDocument, t("shop_license.workspace.checkout.continue"))
        .disabled,
      true,
    );
    assert.equal(
      dialogButton(planDocument, t("shop_license.workspace.checkout.back"))
        .disabled,
      false,
    );
    const readyDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        checkoutStep: 2,
        checkout: quotedCheckout,
      }),
    ).window.document;
    assert.equal(
      dialogButton(readyDocument, t("shop_license.workspace.checkout.continue"))
        .disabled,
      false,
    );
    const reviewDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        checkoutStep: 3,
        checkout: quotedCheckout,
      }),
    ).window.document;
    assert.equal(
      reviewDocument
        .querySelector("#subscription-checkout-review")
        ?.getAttribute("tabindex"),
      "-1",
    );
    assert.equal(
      reviewDocument.querySelector("#subscription-checkout-plan"),
      null,
    );
    assert.equal(
      reviewDocument.querySelector(".b-shop-subscriptions__wallet-input"),
      null,
    );
    assert.equal(
      dialogButton(
        reviewDocument,
        t("shop_license.workspace.checkout.confirm_pay"),
      ).disabled,
      true,
    );
    assert.ok(reviewDocument.body.textContent.includes("2026-11-01T00:00:00Z"));
    const reviewRecords = Object.fromEntries(
      [
        ...reviewDocument.querySelectorAll(
          ".b-shop-subscriptions__checkout-records > div",
        ),
      ].map((row) => [
        row.querySelector("dt").textContent.trim(),
        row.querySelector("dd").textContent.trim(),
      ]),
    );
    assert.equal(
      reviewRecords[t("shop_license.workspace.checkout.step_wallet")],
      "EXAMPLE-WALLET",
    );
    assert.equal(
      reviewRecords[t("shop_license.workspace.checkout.wallet_balance")],
      "80 USD",
    );
    assert.equal(
      reviewRecords[t("shop_license.workspace.checkout.wallet_currency")],
      "USD",
    );
    const approvedDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        checkoutStep: 3,
        checkout: { ...quotedCheckout, agreement: true },
      }),
    ).window.document;
    assert.equal(
      dialogButton(
        approvedDocument,
        t("shop_license.workspace.checkout.confirm_pay"),
      ).disabled,
      false,
    );
    const shortfallDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        checkoutStep: 3,
        checkout: {
          ...quotedCheckout,
          account_selected: { ...wallet, balance: 25 },
          agreement: true,
        },
      }),
    ).window.document;
    assert.equal(
      dialogButton(
        shortfallDocument,
        t("shop_license.workspace.checkout.confirm_pay"),
      ),
      undefined,
    );
    assert.ok(dialogButton(shortfallDocument, t("shop_license.need_charge")));
    const fixedVoucherDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        selected: voucher,
        checkoutStep: 2,
      }),
    ).window.document;
    assert.equal(
      fixedVoucherDocument.querySelector(".b-shop-subscriptions__plan-fields"),
      null,
    );
    assert.ok(
      fixedVoucherDocument.body.textContent.includes(
        t("shop_license.workspace.voucher_title", {
          months: 12,
          license: t("global.license.company"),
        }),
      ),
    );
    const redeemDocument = new JSDOM(
      await rendered({
        language,
        mobile,
        sheet: true,
        selected: voucher,
        checkoutStep: 3,
        checkout: { agreement: true },
      }),
    ).window.document;
    assert.equal(
      dialogButton(redeemDocument, t("shop_license.workspace.checkout.redeem"))
        .disabled,
      false,
    );
    assert.equal(
      redeemDocument.querySelector(".b-shop-subscriptions__plan-fields"),
      null,
    );
    const voucherLabels = [
      ...redeemDocument.querySelectorAll(
        ".b-shop-subscriptions__checkout-records dt",
      ),
    ].map((label) => label.textContent.trim());
    for (const key of ["step_wallet", "wallet_balance", "wallet_currency"])
      assert.equal(
        voucherLabels.includes(t(`shop_license.workspace.checkout.${key}`)),
        false,
      );
  }
const legacy = await rendered({ modern: false });
assert.ok(legacy.includes(english("shop_license.licenses_table.title")));
assert.ok(legacy.includes("Twelve months company"));
assert.equal(legacy.includes("sd-modern-widget"), false);
const legacyDialog = new JSDOM(await rendered({ modern: false, sheet: true }))
  .window.document;
assert.ok(
  legacyDialog.body.textContent.includes(
    english("shop_license.add_dialog.wallet.subtitle"),
  ),
);
const empty = await rendered({ rows: [] });
assert.ok(empty.includes(english("shop_license.workspace.no_subscriptions")));
assert.equal(component.props.modern.name, "Boolean");
assert.equal(component.props.disabled.name, "Boolean");
const keyboard = state();
let prevented = 0;
keyboard.onRenewalKeydown({
  key: " ",
  preventDefault() {
    prevented++;
  },
});
assert.equal(keyboard.renewal, true);
keyboard.disabled = true;
keyboard.onAgreementKeydown({
  key: "Enter",
  preventDefault() {
    prevented++;
  },
});
assert.equal(keyboard.agreement, true);
assert.equal(prevented, 2);
console.log(
  "PASS: Subscription quote, purchase/voucher, renewal, confirmed cancellation, stale-shop guards, legacy opt-in and localized modern rendering.",
);
