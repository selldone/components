import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const filename = new URL("./BVendorPayoutReverse.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "payout-reverse-test" });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({ source: style.content, filename: filename.pathname, id: "data-v-payout-reverse-test", scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(result.errors, []);
}
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const payment = () => ({ id: 17, vendor_id: 5, vendor: { id: 5, name: "Fixture vendor" }, amount: 100, reversal: 20, currency: "USD", option: "bank", meta: { reference: "fixture-ref" }, reversal_detail: [{ amount: 20, reason: "Prior partial reversal", currency: "USD" }] });

function fixture(record = payment(), modern = true) {
  const requests = [], events = [], notices = [], calls = [];
  const leaf = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => { calls.push({ name, attrs }); return Vue.h("div", slots.default?.()); } });
  const notification = { showErrorAlert: (...args) => notices.push(["application", ...args]), showLaravelError: (...args) => notices.push(["network", ...args]) };
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports,
    require: (name) => ({ default: name.includes("NotificationService") ? notification : leaf(name.split('/').at(-1).replace('.vue', '')) }),
    window: { API: { POST_SHOP_VENDOR_PAYMENT_REVERSE_TRANSFER: (shop, id) => `/fixture/shops/${shop}/payouts/${id}/reverse` } },
    axios: { post(url, payload) { return new Promise((resolve, reject) => requests.push({ url, payload, resolve: (data) => resolve({ data }), reject })); } },
  });
  const component = exports.default;
  const state = { ...component.data(), modern, payment: record, shop: { id: 7 }, $t: (key) => key, $emit: (...args) => events.push(args) };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state) });
  async function render() {
    const rendered = {};
    vm.runInNewContext(transpile(template.code), { exports: rendered, require: () => Vue });
    const app = Vue.createSSRApp({ ...component, render: rendered.render, watch: {}, data: () => ({ ...component.data(), amount: state.amount, reason: state.reason }) }, { modern, payment: record, shop: state.shop });
    for (const name of ["v-card", "v-card-title", "v-card-text", "v-card-actions", "v-btn", "v-icon", "v-tooltip", "v-list-subheader", "v-spacer", "v-textarea", "u-price", "u-widget-header"]) app.component(name, leaf(name));
    Object.assign(app.config.globalProperties, { $t: (key) => key, $tm: () => ['Example optional reason'], getName: (key) => key, getShopImagePath: (value) => `/fixture/${value}` });
    return renderToString(app);
  }
  return { component, state, requests, events, notices, calls, render };
}

test("modern is opt-in and legacy presentation remains available", async () => {
  const { component, render, calls } = fixture(payment(), false);
  assert.equal(component.props.modern.default, false);
  assert.match(await render(), /Initiate a reverse transfer/);
  assert.ok(calls.some((call) => call.name === 'u-widget-header' && call.attrs.title === 'Reversing transfer'));
});

test("modern form retains real totals, vendor, history, metadata, locked currency and optional reason", async () => {
  const { render, calls, state } = fixture();
  const html = await render();
  for (const key of ['marketplace_payouts.modern.partialScope', 'fixture-ref']) assert.ok(html.includes(key), key);
  for (const amount of [100, -20, 80]) assert.ok(calls.some((call) => call.name === 'u-price' && call.attrs.amount === amount && call.attrs.currency === 'USD'));
  const currency = calls.find((call) => call.name === 'UCurrencyInput').attrs;
  assert.equal(currency['model-value'], 'USD');
  assert.ok('disabled' in currency);
  assert.equal(state.currency, 'USD');
  const reason = calls.find((call) => call.name === 'v-textarea').attrs;
  assert.equal(reason.label, 'marketplace_payouts.modern.reason');
  assert.equal(reason.messages, 'marketplace_payouts.modern.noteHelp');
  assert.equal(reason.required, undefined);
  assert.equal(reason.rules, undefined);
  assert.ok(calls.some((call) => call.name === 'BVendorPayoutHistory' && call.attrs.payment === state.payment));
});

test("modern request boundary rejects invalid, zero, negative, excessive, deleted and duplicate transfers", () => {
  for (const amount of [0, -1, '', 'bad', NaN, Infinity, 80.01]) {
    const { state, requests } = fixture();
    state.amount = amount;
    state.reverseTransfer();
    assert.equal(requests.length, 0, String(amount));
  }
  for (const change of [{ deleted_at: '2026-10-29' }, { id: null }]) {
    const { state, requests } = fixture({ ...payment(), ...change });
    state.amount = 10;
    state.reverseTransfer();
    assert.equal(requests.length, 0);
  }
  const { state, requests } = fixture();
  state.amount = 10;
  state.reverseTransfer();
  state.reverseTransfer();
  assert.equal(requests.length, 1);
});

test("full remaining amount accepts an empty optional reason and retains native request/events/object identity", async () => {
  const original = payment();
  const vendor = original.vendor;
  const { state, requests, events } = fixture(original);
  state.amount = '80';
  state.reason = null;
  const done = state.reverseTransfer();
  assert.equal(requests[0].url, '/fixture/shops/7/payouts/17/reverse');
  assert.deepEqual(plain(requests[0].payload), { currency: 'USD', amount: 80, reason: null });
  requests[0].resolve({ payment: { id: 17, reversal: 100 } });
  await done;
  assert.equal(state.payment, original);
  assert.equal(state.payment.vendor, vendor);
  assert.equal(state.remains_amount, 0);
  assert.equal(state.busy, false);
  assert.deepEqual(plain(events), [['update', { id: 17, reversal: 100 }], ['close']]);
});

test("deleted and fully reversed records expose no usable financial action", async () => {
  for (const record of [{ ...payment(), deleted_at: '2026-10-29' }, { ...payment(), reversal: 100 }]) {
    const { render, calls, state, requests } = fixture(record);
    const html = await render();
    assert.match(html, record.deleted_at ? /marketplace_payouts\.modern\.deletedHelp/ : /marketplace_payouts\.modern\.noRemaining/);
    assert.equal(calls.find((call) => call.name === 'UPriceInput').attrs.disabled, true);
    state.amount = 1;
    state.reverseTransfer();
    assert.equal(requests.length, 0);
    if (record.deleted_at) assert.equal(calls.filter((call) => call.name === 'v-btn').length, 2);
  }
});

test("failed operations preserve the payment and allow a corrected retry", async () => {
  for (const network of [false, true]) {
    const original = payment();
    const { state, requests, events, notices } = fixture(original);
    state.amount = 10;
    const done = state.reverseTransfer();
    if (network) requests[0].reject(new Error('Fixture failure'));
    else requests[0].resolve({ error: true, error_msg: 'Denied' });
    await done;
    assert.equal(state.payment, original);
    assert.equal(state.payment.reversal, 20);
    assert.equal(state.busy, false);
    assert.equal(events.length, 0);
    assert.equal(notices[0][0], network ? 'network' : 'application');
    state.reverseTransfer();
    assert.equal(requests.length, 2);
  }
});

test("switching payments clears the previous draft amount and optional reason", () => {
  const { state, component } = fixture();
  Object.assign(state, { amount: 10, reason: 'Previous payment' });
  component.watch.payment.call(state);
  assert.equal(state.amount, 0);
  assert.equal(state.reason, null);
});

test("old reversal success/errors cannot alter a replacement payment or release a newer request", async () => {
  for (const context of ['payment', 'shop']) for (const outcome of ['success', 'application', 'network']) {
    const original = payment();
    const { state, component, requests, events, notices } = fixture(original);
    state.amount = 10;
    const oldDone = state.reverseTransfer();
    assert.equal(requests[0].url, '/fixture/shops/7/payouts/17/reverse');
    state.reverseTransfer();
    assert.equal(requests.length, 1);
    if (context === 'payment') {
      state.payment = { ...payment(), id: 18, vendor_id: 6, amount: 50, reversal: 0, currency: 'EUR' };
      component.watch.payment.call(state);
    } else {
      state.shop = { id: 8 };
      component.watch['shop.id'].call(state);
    }
    assert.equal(state.busy, false);
    assert.equal(state.amount, 0);
    assert.equal(state.reason, null);
    const current = state.payment;
    const before = plain(current);
    state.amount = 5;
    const newDone = state.reverseTransfer();
    assert.equal(requests[1].url, context === 'payment' ? '/fixture/shops/7/payouts/18/reverse' : '/fixture/shops/8/payouts/17/reverse');
    assert.equal(requests[1].payload.currency, current.currency);
    if (outcome === 'network') requests[0].reject(new Error('Old request failed'));
    else requests[0].resolve(outcome === 'success' ? { payment: { id: 17, reversal: 30, currency: 'USD' } } : { error: true, error_msg: 'Old failure' });
    await oldDone;
    assert.equal(state.payment, current);
    assert.deepEqual(plain(state.payment), before);
    assert.equal(original.reversal, 20);
    assert.equal(state.busy, true, `${context}/${outcome}`);
    assert.equal(events.length, 0);
    assert.equal(notices.length, 0);
    state.reverseTransfer();
    assert.equal(requests.length, 2);
    const response = { id: current.id, reversal: Number(current.reversal) + 5 };
    requests[1].resolve({ payment: response });
    await newDone;
    assert.equal(state.payment, current);
    assert.equal(state.payment.reversal, response.reversal);
    assert.equal(state.busy, false);
    assert.deepEqual(plain(events), [['update', response], ['close']]);
  }
});

test("unmounted modern reversal ignores a late response without changing the passed record", async () => {
  const original = payment();
  const { state, component, requests, events, notices } = fixture(original);
  state.amount = 10;
  const done = state.reverseTransfer();
  component.beforeUnmount.call(state);
  requests[0].resolve({ payment: { id: 17, reversal: 30 } });
  await done;
  assert.equal(original.reversal, 20);
  assert.equal(events.length, 0);
  assert.equal(notices.length, 0);
});

test("an update listener replacing the payment cannot close or unlock its new reversal", async () => {
  const { state, component, requests, events } = fixture();
  let nextDone;
  state.$emit = (...args) => {
    events.push(args);
    if (args[0] === 'update' && args[1].id === 17) {
      state.payment = { ...payment(), id: 18, currency: 'EUR' };
      component.watch.payment.call(state);
      state.amount = 5;
      nextDone = state.reverseTransfer();
    }
  };
  state.amount = 10;
  const done = state.reverseTransfer();
  requests[0].resolve({ payment: { id: 17, reversal: 30 } });
  await done;
  assert.deepEqual(plain(events), [['update', { id: 17, reversal: 30 }]]);
  assert.equal(state.payment.id, 18);
  assert.equal(state.payment.currency, 'EUR');
  assert.equal(state.busy, true);
  requests[1].resolve({ payment: { id: 18, reversal: 25 } });
  await nextDone;
  assert.deepEqual(plain(events), [['update', { id: 17, reversal: 30 }], ['update', { id: 18, reversal: 25 }], ['close']]);
  assert.equal(state.busy, false);
});
