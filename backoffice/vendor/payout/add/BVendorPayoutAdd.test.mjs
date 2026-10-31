import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { escape } from "lodash-es";

// Compile the real form; provider responses, requests and UI leaves stay isolated.
const calls = [], requests = [], events = [], notices = [];
const plain = value => JSON.parse(JSON.stringify(value));
const settle = () => new Promise(resolve => setImmediate(resolve));
const leaf = name => Vue.defineComponent({
  name, inheritAttrs: false,
  setup: (_, { attrs, slots }) => () => {
    calls.push({ name, attrs });
    const children = name === "USmartSelect"
      ? attrs.items.flatMap(item => [
        typeof attrs["item-text"] === "function" ? attrs["item-text"](item) : item[attrs["item-text"] || "title"],
        slots["append-title"]?.({ item }),
        typeof attrs["item-description"] === "function" ? attrs["item-description"](item) : item[attrs["item-description"]],
        slots.description?.({ item }),
      ])
      : slots.default?.();
    return Vue.h("div", { "data-leaf": name, class: attrs.class }, children);
  },
});
const notification = { showErrorAlert: (...args) => notices.push(['application', ...args]), showLaravelError: (...args) => notices.push(['network', ...args]), showSuccessAlert: (...args) => notices.push(['success', ...args]) };
const globals = {
  require: name => name === "vue" ? Vue : name === "lodash-es" ? { escape } : name.includes("DateMixin") ? { default: {} } : ({ default: name.includes("NotificationService") ? notification : leaf(name.split("/").at(-1).replace(".vue", "")) }),
  window: { vendor_payment_options_fast_mode: false, API: {
    GET_SHOP_VENDOR_PAYMENT_OPTIONS: (shop, vendor) => `/test/${shop}/vendors/${vendor}/options`,
    POST_SHOP_VENDOR_PAYMENT_ADD: shop => `/test/${shop}/payouts`,
    DELETE_SHOP_VENDOR_PAYMENT: (shop, payment) => `/test/${shop}/payouts/${payment}`,
  } },
  axios: {
    get: (...args) => { requests.push(["get", ...args]); return Promise.resolve({ data: { vendor: { id: 5 }, options: [{ code: "bank", title: "Bank" }] } }); },
    post: (...args) => { requests.push(["post", ...args]); return Promise.resolve({ data: { payment: { id: 17 }, account: { id: 12, balance: 0 } } }); },
    delete: (...args) => { requests.push(["delete", ...args]); return Promise.resolve({ data: { id: 17 } }); },
  },
};
function evaluate(source) {
  const exports = {};
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, ...globals });
  return exports;
}
const filename = "BVendorPayoutAdd.vue";
const { descriptor, errors } = parse(readFileSync(new URL(`./${filename}`, import.meta.url), "utf8"), { filename });
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename, id: "payout-test" });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({ source: style.content, filename, id: "data-v-payout-test", scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(result.errors, []);
}
const Form = { ...evaluate(descriptor.script.content).default, render: evaluate(template.code).render };
const shop = { id: 7, currencies: ["USD", "EUR", "DKK"] };
const vendor = { id: 5, name: "Vendor", meta: { account: "example" } };
const options = [
  { code: "bank", title: "Bank transfer", livemode: true },
  { code: "stripe", title: "Connected provider", image: "provider.svg", livemode: true, balances: [{ currency: "USD", amount: 10, pending_amount: 2, reserved_amount: 1 }, { currency: "EUR", amount: 20, pending_amount: 3, reserved_amount: 2 }] },
  { code: "sandbox", title: "Test provider", livemode: false },
];
function fixture(modern = true, props = {}) {
  const state = { ...Form.data(), modern, shop, ...props, $t: key => key, $emit: (...args) => events.push(args), resetToDefault() { Object.assign(this, Form.data()); } };
  for (const [name, fn] of Object.entries(Form.methods)) state[name] = fn.bind(state);
  for (const [name, fn] of Object.entries(Form.computed)) Object.defineProperty(state, name, { get: () => fn.call(state) });
  return state;
}
async function render(data = {}, props = {}) {
  calls.length = 0;
  const app = Vue.createSSRApp({ ...Form, created: undefined, watch: {}, data: () => ({ ...Form.data(), ...data }) }, { modern: true, shop, ...props });
  for (const name of ["v-card", "v-card-title", "v-card-text", "v-card-actions", "v-btn", "v-icon", "v-tooltip", "v-list-subheader", "v-chip", "v-img", "v-avatar", "v-spacer", "v-textarea", "v-checkbox", "u-price", "u-widget-header", "u-loading-progress"]) app.component(name, leaf(name));
  app.directive('copy', {});
  Object.assign(app.config.globalProperties, { $t: key => key, $tm: () => ["Sales payout"], getShopImagePath: value => `/test/${value}`, getName: value => value, getUserAvatar: value => `/test/avatar/${value}`, getFromNowString: value => value ? `relative:${value}` : '', getLocalTimeString: value => value ? `exact:${value}` : '' });
  return renderToString(app);
}

test("modern is opt-in and native initialization preserves vendor, currency, amount and payment view", () => {
  assert.equal(Form.props.modern.default, false);
  const state = fixture(true, { initialVendor: vendor, initialCurrency: "EUR", initialAmount: 125 });
  state.assign();
  assert.equal(state.vendor_id, 5);
  assert.equal(state.currency, "EUR");
  assert.equal(state.amount, 125);
  assert.equal(state.selected_vendor, vendor);
  const payment = { id: 17, vendor_id: 5, currency: "DKK", amount: 80, note: "Visible reference", option: "bank" };
  state.payment = payment;
  state.accept_delete = true;
  state.assign();
  assert.equal(state.currency, "DKK");
  assert.equal(state.amount, 80);
  assert.equal(state.note, payment.note);
  assert.equal(state.selected_option, "bank");
  assert.equal(state.accept_delete, false);
  assert.equal(state.canSubmitModern, false);
});

test("modern bank form preserves every provider, shop currency, bank info, notes and suggestions", async () => {
  const html = await render({ vendor_id: 5, selected_vendor: vendor, selected_option: "bank", options, currency: "EUR", amount: 125 });
  assert.match(html, /marketplace_wallets\.payout\.bank_help/);
  assert.match(html, /marketplace_wallets\.payout\.record_action/);
  assert.doesNotMatch(html, /marketplace_wallets\.payout\.transfer_action/);
  assert.deepEqual(plain(calls.find(call => call.name === "BVendorPayoutBankInfo").attrs.vendor), vendor);
  const choices = calls.find(call => call.name === "USmartSelect").attrs;
  assert.deepEqual(plain(choices.items), options);
  for (const attribute of ["accessible", "border", "force-show-all", "clearable"])
    assert.ok(attribute in choices && choices[attribute] !== false, attribute);
  assert.equal(choices["item-text"](options[0]), "marketplace_wallets.payout.bank_choice_title");
  assert.equal(choices["item-description"](options[0]), "marketplace_wallets.payout.bank_choice_description");
  assert.deepEqual(plain(calls.find(call => call.name === "UCurrencyInput").attrs["active-currencies"]), shop.currencies);
  assert.equal(calls.find(call => call.name === "UPriceInput").attrs.max, undefined);
  assert.equal(calls.find(call => call.name === "UPriceInput").attrs.label, "marketplace_wallets.payout.amount_bank_label");
  assert.equal(calls.find(call => call.name === "v-textarea").attrs.messages, "marketplace_wallets.payout.note_help");
  const suggestion = calls.find(call => call.name === "USmartSuggestion").attrs;
  assert.deepEqual(plain(suggestion.samples), ["Sales payout"]);
  const summary = html.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)?.[1];
  for (const value of ["Vendor", "EUR", "marketplace_wallets.payout.bank_impact", "marketplace_wallets.payout.wallet_entry"])
    assert.ok(summary?.includes(value), value);
  for (const amount of [125, -125])
    assert.ok(calls.some(call => call.name === "u-price" && call.attrs.amount === amount && call.attrs.currency === "EUR"));
  assert.match(html, /marketplace_wallets\.payout\.footer_bank/);
  const legacy = await render({ vendor_id: 5, selected_vendor: vendor, selected_option: "bank", options }, { modern: false });
  assert.doesNotMatch(legacy, /marketplace_wallets\.payout/);
  assert.match(legacy, /global\.actions\.add/);
});

test("modern provider form retains all available, pending and reserved amounts and metadata", async () => {
  const html = await render({ vendor_id: 5, selected_vendor: vendor, selected_option: "stripe", options, currency: "USD", amount: 50 });
  assert.match(html, /marketplace_wallets\.payout\.transfer_action/);
  assert.match(html, /marketplace_wallets\.payout\.available/);
  assert.match(html, /marketplace_wallets\.payout\.pending/);
  assert.match(html, /marketplace_wallets\.payout\.reserved/);
  for (const [amount, currency] of [[10, "USD"], [2, "USD"], [1, "USD"], [20, "EUR"], [3, "EUR"], [2, "EUR"]]) assert.ok(calls.some(call => call.name === "u-price" && call.attrs.amount === amount && call.attrs.currency === currency));
  assert.match(html, /<dt>account<\/dt>/);
  assert.ok(html.includes("example"));
  assert.ok(calls.some(call => call.name === "UPodNode" && call.attrs.image === "provider.svg"));
  const choices = calls.find(call => call.name === "USmartSelect").attrs;
  assert.equal(choices["item-text"](options[1]), "marketplace_wallets.payout.provider_choice_title");
  assert.equal(choices["item-description"](options[1]), "marketplace_wallets.payout.provider_choice_description");
  assert.match(html, /marketplace_wallets\.payout\.provider_impact/);
  assert.match(html, /marketplace_wallets\.payout\.footer_provider/);
  assert.ok(calls.some(call => call.name === "u-price" && call.attrs.amount === -50 && call.attrs.currency === "USD"));
  const labels = fixture();
  labels.$t = (key, params) => `${key}: ${params.provider}`;
  const unsafeOption = { code: "stripe", title: 'Provider <img src=x> & "name"' };
  assert.equal(labels.modernOptionTitle(unsafeOption), escape(`marketplace_wallets.payout.provider_choice_title: ${unsafeOption.title}`));
  assert.ok(!labels.modernOptionTitle(unsafeOption).includes("<img"));
  const withoutBalances = await render({ vendor_id: 5, selected_vendor: vendor, selected_option: "stripe", options, with_balance: false });
  assert.doesNotMatch(withoutBalances, /marketplace_wallets\.payout\.available/);
  assert.doesNotMatch(withoutBalances, /marketplace_wallets\.payout\.provider_balances_unavailable/);
  const unavailableBalances = await render({ vendor_id: 5, selected_vendor: vendor, selected_option: "sandbox", options, with_balance: true });
  assert.match(unavailableBalances, /marketplace_wallets\.payout\.provider_balances_unavailable/);
  assert.match(await render({ vendor_id: 5, selected_vendor: vendor, selected_option: "sandbox", options }), /marketplace_wallets\.payout\.debug_help/);
});

test("modern create accepts positive amounts without a ledger cap and rejects invalid or unavailable choices", async () => {
  const state = fixture();
  Object.assign(state, { vendor_id: 5, selected_vendor: vendor, selected_option: "bank", options, currency: "USD", note: "Visible in history" });
  for (const amount of [0, -1, "", "invalid", Infinity, NaN]) {
    state.amount = amount;
    const count = requests.length;
    assert.equal(state.canSubmitModern, false);
    assert.ok(Number.isFinite(state.displayAmount), "invalid input never produces a nonfinite summary amount");
    state.addPayment();
    assert.equal(requests.length, count);
  }
  state.amount = 5000;
  assert.equal(state.canSubmitModern, true);
  state.addPayment();
  assert.equal(state.busy, true);
  assert.deepEqual(plain(requests.at(-1)), ["post", "/test/7/payouts", { vendor_id: 5, currency: "USD", amount: 5000, note: "Visible in history", option: "bank" }]);
  const count = requests.length;
  state.addPayment();
  assert.equal(requests.length, count);
  await settle();
  assert.equal(state.busy, false);
  assert.deepEqual(plain(events.slice(-3)), [["add", { id: 17 }], ["update:account", { id: 12, balance: 0 }], ["close"]]);
  for (const change of [{ selected_option: "missing" }, { selected_vendor: { id: 6 } }, { busy_fetch: true }, { payment: { id: 17 } }]) {
    const blocked = fixture();
    Object.assign(blocked, { vendor_id: 5, selected_vendor: vendor, selected_option: "stripe", options, currency: "EUR", amount: 25 }, change);
    assert.equal(blocked.canSubmitModern, false);
    const before = requests.length;
    blocked.addPayment();
    assert.equal(requests.length, before);
  }
});

test("provider options retain vendor and with-balance scope while stale results cannot enable a modern payout", async () => {
  const original = globals.axios.get;
  const pending = [];
  globals.axios.get = (...args) => { requests.push(["get", ...args]); return new Promise((resolve, reject) => pending.push({ resolve, reject })); };
  try {
    const state = fixture();
    state.vendor_id = 5;
    state.with_balance = true;
    state.fetchAvailablePaymentMethods();
    assert.deepEqual(plain(requests.at(-1)), ["get", "/test/7/vendors/5/options", { params: { with_balance: true } }]);
    state.vendor_id = 6;
    state.with_balance = false;
    Form.watch.vendor_id.call(state);
    assert.equal(state.selected_vendor, null);
    assert.deepEqual(plain(state.options), []);
    pending[0].resolve({ data: { vendor, options } });
    await settle();
    assert.equal(state.busy_fetch, true);
    assert.equal(state.selected_vendor, null);
    pending[1].resolve({ data: { vendor: { id: 6 }, options } });
    await settle();
    assert.equal(state.selected_vendor.id, 6);
    assert.equal(state.busy_fetch, false);
    state.vendor_id = 7;
    state.fetchAvailablePaymentMethods();
    state.vendor_id = null;
    Form.watch.vendor_id.call(state);
    pending[2].resolve({ data: { vendor: { id: 7 }, options } });
    await settle();
    assert.equal(state.selected_vendor, null);
    assert.deepEqual(plain(state.options), []);
    assert.equal(state.busy_fetch, false);
  } finally { globals.axios.get = original; }
});

test("failed payment options keep the draft and recover through the same scoped read", async () => {
  const originalGet = globals.axios.get;
  const pending = [];
  globals.axios.get = (url, payload) => new Promise((resolve, reject) => pending.push({ url, payload, resolve: data => resolve({ data }), reject }));
  try {
    for (const network of [false, true]) {
      const state = fixture();
      Object.assign(state, { vendor_id: 5, currency: "EUR", amount: 125, note: "Keep this draft", with_balance: false });
      const eventCount = events.length;
      state.fetchAvailablePaymentMethods();
      const failed = pending.at(-1);
      assert.equal(failed.url, "/test/7/vendors/5/options");
      assert.deepEqual(plain(failed.payload), { params: { with_balance: false } });
      if (network) failed.reject(new Error("Options unavailable"));
      else failed.resolve({ error: true, error_msg: "Denied" });
      await settle();
      assert.equal(state.options_error, true);
      assert.equal(state.busy_fetch, false);
      assert.equal(state.canSubmitModern, false);
      assert.deepEqual([state.vendor_id, state.currency, state.amount, state.note], [5, "EUR", 125, "Keep this draft"]);
      assert.equal(events.length, eventCount);
      const html = await render({ vendor_id: 5, options_error: true });
      assert.match(html, /marketplace_wallets\.payout\.options_error/);
      assert.match(html, /marketplace_wallets\.payout\.retry/);
      state.fetchAvailablePaymentMethods();
      const retry = pending.at(-1);
      assert.equal(retry.url, failed.url);
      assert.deepEqual(plain(retry.payload), plain(failed.payload));
      assert.equal(state.options_error, false);
      retry.resolve({ vendor, options });
      await settle();
      assert.equal(state.options_error, false);
      assert.equal(state.selected_vendor, vendor);
      assert.equal(state.selected_option, null, "retry does not choose a payment method");
      state.selected_option = "bank";
      assert.equal(state.canSubmitModern, true);
    }
    const state = fixture();
    state.vendor_id = 5;
    state.fetchAvailablePaymentMethods();
    const stale = pending.at(-1);
    state.vendor_id = 6;
    state.fetchAvailablePaymentMethods();
    pending.at(-1).resolve({ vendor: { id: 6 }, options });
    await settle();
    const noticeCount = notices.length;
    stale.reject(new Error("Old options failed"));
    await settle();
    assert.equal(state.options_error, false);
    assert.equal(state.selected_vendor.id, 6);
    assert.equal(notices.length, noticeCount);
  } finally { globals.axios.get = originalGet; }
});

test("with-balance toggle and legacy payment view preserve their native behavior", async () => {
  const state = fixture();
  let fetched = 0;
  state.fetchAvailablePaymentMethods = () => fetched++;
  Form.watch.with_balance.call(state, false);
  assert.equal(fetched, 0);
  Form.watch.with_balance.call(state, true);
  assert.equal(fetched, 1);
  const payment = { id: 17, vendor_id: 5, currency: "USD", amount: 80, option: "bank", reversal_detail: [{ amount: 10 }] };
  await render({ selected_vendor: vendor, selected_option: "bank", options }, { payment, modern: false });
  assert.ok(calls.some(call => call.name === "BVendorPayoutHistory" && call.attrs.payment === payment));
  assert.equal(calls.some(call => call.name === "USmartSuggestion"), false);
  assert.equal(calls.find(call => call.name === "BVendorInput").attrs.disabled, true);
  const removal = fixture(true, { payment });
  const before = requests.length;
  removal.remove();
  assert.equal(requests.length, before);
  removal.accept_delete = true;
  removal.remove();
  assert.equal(requests.length, before);
  removal.critical_open = true;
  removal.remove();
  removal.remove();
  assert.equal(requests.length, before + 1);
  assert.deepEqual(plain(requests.at(-1)), ["delete", "/test/7/payouts/17"]);
  await settle();
  assert.equal(removal.busy_delete, false);
  assert.deepEqual(plain(events.slice(-2)), [["remove", 17], ["close"]]);
  assert.equal(removal.critical_open, false);
  assert.equal(removal.accept_delete, false);
});

test("modern payment view renders real readonly amounts, officer, dates, full note, reversals and metadata without provider lookups", async () => {
  const payment = { id: 17, vendor_id: 5, vendor, currency: 'USD', amount: 80, reversal: 20, option: 'stripe', staff_id: 9, staff: { name: 'Fixture Officer' }, verified_at: '2026-10-29T10:00:00Z', created_at: '2026-10-28T10:00:00Z', note: 'Full note\nwith another line', meta: { stripe_transfer_id: 'tr_fixture' }, reversal_detail: [{ amount: 20, currency: 'USD', reason: 'Partial reversal reason', user_id: 9, date: '2026-10-29T11:00:00Z' }] };
  const before = requests.length;
  const state = fixture(true, { payment });
  state.assign();
  state.fetchAvailablePaymentMethods();
  assert.equal(requests.length, before);
  const html = await render({}, { payment });
  for (const value of ['marketplace_payouts.modern.detailTitle', 'Fixture Officer', 'Full note', 'with another line', 'Partial reversal reason', 'tr_fixture', 'relative:2026-10-29T10:00:00Z', 'exact:2026-10-28T10:00:00Z', 'exact:2026-10-29T11:00:00Z']) assert.ok(html.includes(value), value);
  for (const amount of [80, -20, 60]) assert.ok(calls.some(call => call.name === 'u-price' && call.attrs.amount === amount && call.attrs.currency === 'USD'));
  for (const name of ['BVendorInput', 'USmartSelect', 'UPriceInput', 'v-textarea']) assert.equal(calls.some(call => call.name === name), false, name);
  assert.ok(calls.some(call => call.name === 'BVendorBox' && call.attrs.vendor === vendor));
});

test("deleted payments remain readonly and nondeleted fully reversed payments can be removed", async () => {
  const payment = { id: 17, vendor_id: 5, amount: 80, reversal: 80, currency: 'USD', option: 'bank', deleted_at: '2026-10-29T10:00:00Z' };
  const state = fixture(true, { payment });
  Object.assign(state, { critical_open: true, accept_delete: true });
  const before = requests.length;
  state.remove();
  assert.equal(requests.length, before);
  const html = await render({}, { payment });
  assert.match(html, /marketplace_payouts\.modern\.deletedHelp/);
  assert.doesNotMatch(html, /marketplace_payouts\.modern\.refundIntent/);
  assert.equal(calls.some(call => call.name === 'USmartToggle'), false);
  assert.equal(state.remainingAmount, 0);
  state.payment = { ...payment, deleted_at: null };
  state.remove();
  assert.equal(requests.length, before + 1);
  await settle();
});

test("critical intent resets on closing disclosure, dialog and reassignment", () => {
  const state = fixture(true, { payment: { id: 17, amount: 10, reversal: 0, currency: 'USD' } });
  Object.assign(state, { critical_open: true, accept_delete: true });
  state.onCriticalToggle({ target: { open: false } });
  assert.equal(state.accept_delete, false);
  Object.assign(state, { critical_open: true, accept_delete: true });
  state.close();
  assert.equal(state.critical_open, false);
  assert.equal(state.accept_delete, false);
  Object.assign(state, { critical_open: true, accept_delete: true });
  state.assign();
  assert.equal(state.critical_open, false);
  assert.equal(state.accept_delete, false);
});

test("modern removal ignores old success/errors after payment or shop changes without clearing a newer request", async () => {
  const originalDelete = globals.axios.delete;
  const pending = [];
  globals.axios.delete = url => new Promise((resolve, reject) => pending.push({ url, resolve: data => resolve({ data }), reject }));
  try {
    for (const context of ['payment', 'shop']) for (const outcome of ['success', 'application', 'network']) {
      const state = fixture(true, { payment: { id: 17, vendor_id: 5, amount: 80, currency: 'USD', option: 'bank' } });
      state.assign();
      Object.assign(state, { critical_open: true, accept_delete: true });
      const oldDone = state.remove();
      const oldRequest = pending.at(-1);
      assert.equal(oldRequest.url, '/test/7/payouts/17');
      const requestCount = pending.length;
      state.remove();
      assert.equal(pending.length, requestCount);

      if (context === 'payment') {
        state.payment = { id: 18, vendor_id: 6, amount: 40, currency: 'EUR', option: 'bank' };
        Form.watch.payment.call(state);
      } else {
        state.shop = { ...shop, id: 8 };
        Form.watch['shop.id'].call(state);
      }
      assert.equal(state.busy_delete, false);
      assert.equal(state.accept_delete, false);
      assert.equal(state.critical_open, false);
      const currentPayment = state.payment;
      Object.assign(state, { critical_open: true, accept_delete: true });
      const newDone = state.remove();
      const newRequest = pending.at(-1);
      assert.equal(newRequest.url, context === 'payment' ? '/test/7/payouts/18' : '/test/8/payouts/17');
      const eventCount = events.length, noticeCount = notices.length;
      if (outcome === 'network') oldRequest.reject(new Error('Old request failed'));
      else oldRequest.resolve(outcome === 'success' ? { id: 17 } : { error: true, error_msg: 'Old failure' });
      await oldDone;
      assert.equal(state.payment, currentPayment);
      assert.equal(state.busy_delete, true, `${context}/${outcome}`);
      assert.equal(state.critical_open, true);
      assert.equal(state.accept_delete, true);
      assert.equal(events.length, eventCount);
      assert.equal(notices.length, noticeCount);
      state.remove();
      assert.equal(pending.at(-1), newRequest);
      newRequest.resolve({ id: currentPayment.id });
      await newDone;
      assert.equal(state.busy_delete, false);
      assert.deepEqual(plain(events.slice(eventCount)), [['remove', currentPayment.id], ['close']]);
    }
  } finally { globals.axios.delete = originalDelete; }
});

test("modern removal retains current error/retry behavior and invalidates callbacks on unmount", async () => {
  const originalDelete = globals.axios.delete;
  const pending = [];
  globals.axios.delete = () => new Promise((resolve, reject) => pending.push({ resolve: data => resolve({ data }), reject }));
  try {
    for (const network of [false, true]) {
      const state = fixture(true, { payment: { id: 17, currency: 'USD' } });
      Object.assign(state, { critical_open: true, accept_delete: true });
      const eventCount = events.length, noticeCount = notices.length;
      const done = state.remove();
      if (network) pending.at(-1).reject(new Error('Current failure'));
      else pending.at(-1).resolve({ error: true, error_msg: 'Current failure' });
      await done;
      assert.equal(state.busy_delete, false);
      assert.equal(events.length, eventCount);
      assert.equal(notices[noticeCount][0], network ? 'network' : 'application');
      const retry = state.remove();
      const count = pending.length;
      state.remove();
      assert.equal(pending.length, count);
      pending.at(-1).resolve({ id: 17 });
      await retry;
      assert.deepEqual(plain(events.slice(eventCount)), [['remove', 17], ['close']]);
    }
    const state = fixture(true, { payment: { id: 17, currency: 'USD' } });
    Object.assign(state, { critical_open: true, accept_delete: true });
    const done = state.remove();
    const eventCount = events.length, noticeCount = notices.length;
    Form.beforeUnmount.call(state);
    pending.at(-1).resolve({ id: 17 });
    await done;
    assert.equal(events.length, eventCount);
    assert.equal(notices.length, noticeCount);
  } finally { globals.axios.delete = originalDelete; }
});

test("a removal listener replacing the payment cannot close or unlock its new action", async () => {
  const originalDelete = globals.axios.delete;
  const pending = [];
  globals.axios.delete = () => new Promise(resolve => pending.push(data => resolve({ data })));
  try {
    const state = fixture(true, { payment: { id: 17, currency: 'USD' } });
    Object.assign(state, { critical_open: true, accept_delete: true });
    const emitted = [];
    let nextDone;
    state.$emit = (...args) => {
      emitted.push(args);
      if (args[0] === 'remove' && args[1] === 17) {
        state.payment = { id: 18, currency: 'EUR' };
        Form.watch.payment.call(state);
        Object.assign(state, { critical_open: true, accept_delete: true });
        nextDone = state.remove();
      }
    };
    const done = state.remove();
    pending[0]({ id: 17 });
    await done;
    assert.deepEqual(plain(emitted), [['remove', 17]]);
    assert.equal(state.payment.id, 18);
    assert.equal(state.busy_delete, true);
    assert.equal(state.critical_open, true);
    pending[1]({ id: 18 });
    await nextDone;
    assert.deepEqual(plain(emitted), [['remove', 17], ['remove', 18], ['close']]);
    assert.equal(state.busy_delete, false);
  } finally { globals.axios.delete = originalDelete; }
});
