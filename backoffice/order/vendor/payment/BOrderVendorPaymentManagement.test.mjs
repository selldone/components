import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Real templates with synthetic records; no requests or financial mutations.
const calls = [];
const plain = (value) => JSON.parse(JSON.stringify(value));
const contentText = (nodes) => (nodes || []).map((node) => typeof node === "string" ? node : Array.isArray(node.children) ? contentText(node.children) : typeof node.children === "string" ? node.children : "").join("");
const leaf = (name) => Vue.defineComponent({
  name,
  inheritAttrs: false,
  setup: (_, { attrs, slots }) => () => {
    const content = slots.default?.() || [];
    calls.push({ name, attrs, text: contentText(content) });
    return Vue.h(attrs.to ? "a" : "div", { "data-leaf": name }, [...(slots.activator?.({ props: {} }) || []), ...content]);
  },
});
const productTypes = Object.fromEntries(["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [code, { basket: `/fixture/${code}.svg` }]));
function evaluate(source, require) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, require });
  return exports;
}
async function load(path, require) {
  const file = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "vendor-payment-test" });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({ source: style.content, filename: file.pathname, id: "data-v-vendor-payment-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(compiled.errors, []);
  }
  return { ...evaluate(descriptor.script.content, require).default, render: evaluate(template.code, () => Vue).render };
}
const Icon = await load("../../../process-center/list/icon/BVendorOrderIcon.vue", () => { throw new Error("Unexpected icon import"); });
const Payment = await load("./BOrderVendorPaymentManagement.vue", (name) => {
  if (name.includes("ProductType")) return { ProductType: productTypes };
  if (name.endsWith("DateMixin.ts")) return { default: {} };
  if (name.endsWith("BVendorOrderIcon.vue")) return { default: Icon };
  if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
  throw new Error(`Unexpected import: ${name}`);
});
const fixture = () => ({
  id: 90, vendor_id: 9, type: "PHYSICAL",
  transactions: [
    { id: 1, amount: 250, currency: "USD", note: "Debit the vendor & preserve this historic note.", created_at: "2026-10-01T10:00:00Z", officer_id: 7 },
    { id: 2, amount: -12.5, currency: "EUR", note: "Signed adjustment", created_at: "2026-10-02T10:00:00Z" },
    { id: 3, amount: 0, currency: "USD", note: "Recorded zero", created_at: "2026-10-03T10:00:00Z" },
  ],
  payments: [{ id: 5, amount: 120, currency: "USD", staff_id: 8, note: "Recorded payout", created_at: "2026-10-04T10:00:00Z", meta: { reference: "DEMO-REFERENCE" }, reversal_detail: [{ amount: 20, currency: "USD", user_id: 11, reason: "Recorded reversal", date: "2026-10-05T10:00:00Z" }] }],
});
async function render({ modern, vendor = true, order = fixture() } = {}) {
  calls.length = 0;
  let instance;
  const props = { shop: { id: 3 }, vendorOrder: order, ...(modern === undefined ? {} : { modern }) };
  const app = Vue.createSSRApp({ ...Payment, created() { instance = this; } }, props);
  for (const name of ["v-btn", "v-icon", "v-tooltip", "v-avatar", "v-img", "v-dialog", "v-spacer", "v-table", "v-chip", "v-list-subheader", "u-widget-header"]) app.component(name, leaf(name));
  app.component("u-price", { setup: (_, { attrs }) => () => {
    calls.push({ name: "u-price", attrs });
    return Vue.h("span", { "data-amount": attrs.amount, "data-currency": attrs.currency }, `${attrs.amount} ${attrs.currency}`);
  } });
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $route: vendor ? { params: { vendor_id: 9 }, matched: [{ meta: { vendor: true } }] } : { params: {}, matched: [] },
    $vuetify: { display: { mdAndUp: true } },
    getUserAvatar: (id) => `/fixture/avatar/${id}`,
    getFromNowString: (date) => `relative:${date}`,
    getLocalTimeString: (date) => `local:${date}`,
    getName: (key) => key,
    copyToClipboard() {},
  });
  return { html: await renderToString(app), instance };
}

test("payment templates, TypeScript and scoped Sass compile with modernization opt-in", () => {
  assert.equal(Payment.props.modern.default, false);
  assert.equal(Payment.components.BVendorOrderIcon, Icon);
});

test("modern ledger preserves signed native amounts, real zeros, exact notes, officers and dates", async () => {
  const { html } = await render({ modern: true });
  assert.match(html, /b-vendor-payment-modern/);
  assert.match(html, /Debit the vendor &amp; preserve this historic note\./);
  assert.deepEqual(calls.filter(({ name }) => name === "u-price").map(({ attrs }) => [attrs.amount, attrs.currency]), [[250, "USD"], [-12.5, "EUR"], [0, "USD"], [120, "USD"], [-20, "USD"]]);
  for (const id of [7, 8, 11]) assert.ok(calls.some(({ name, attrs }) => name === "v-img" && attrs.src === `/fixture/avatar/${id}`));
  assert.match(html, /relative:2026-10-01T10:00:00Z/);
  assert.match(html, /local:2026-10-04T10:00:00Z/);
  assert.match(html, /local:2026-10-05T10:00:00Z/);
  assert.match(html, /global\.commons\.system/);
  assert.match(html, /data-label="global\.commons\.amount"/);
  assert.match(html, /DEMO-REFERENCE/);
  assert.match(html, /Recorded reversal/);
  assert.match(html, /order_vendor_payment\.modern\.help/);
  assert.ok(calls.some(({ name, attrs }) => name === "v-tooltip" && attrs.location === "top" && attrs["open-on-click"] === ""));
});

test("modern wallet link retains route and safe new-tab behavior; vendor has no refund or reversal controls", async () => {
  const { html } = await render({ modern: true });
  const link = calls.find(({ name, attrs }) => name === "v-btn" && attrs.target === "_blank").attrs;
  assert.deepEqual(plain(link.to), { name: "VPageVendorPayments" });
  assert.equal(link.rel, "noopener noreferrer");
  assert.doesNotMatch(html, /order_vendor_payment\.refund_order_action/);
  assert.doesNotMatch(html, /order_vendor_payment\.reversal_transfer_action/);
  assert.match(html, /d="M7 7h10v10"/);
});

test("modern empty applies only to explicit empty transactions and optional payouts stay independent", async () => {
  const order = fixture();
  order.transactions = [];
  const empty = await render({ modern: true, order });
  assert.match(empty.html, /order_vendor_payment\.modern\.empty/);
  assert.match(empty.html, /Recorded payout/);
  delete order.transactions;
  order.payments = [];
  const unknown = await render({ modern: true, order });
  assert.doesNotMatch(unknown.html, /order_vendor_payment\.modern\.empty/);
  assert.doesNotMatch(unknown.html, /order_vendor_payment\.modern\.payouts/);
});

test("marketplace owner keeps positive-only refund and original payout reversal selection in both presentations", async () => {
  for (const modern of [false, true]) {
    const order = fixture();
    const { instance } = await render({ modern, vendor: false, order });
    const refunds = calls.filter(({ name, text }) => name === "v-btn" && text.includes("order_vendor_payment.refund_order_action"));
    assert.equal(refunds.length, 1);
    refunds[0].attrs.onClick();
    await Vue.nextTick();
    assert.equal(instance.dialog_refund, true);
    assert.equal(instance.dialog_refund_pre, true);
    const reversal = calls.find(({ name, text }) => name === "v-btn" && text.includes("order_vendor_payment.reversal_transfer_action"));
    reversal.attrs.onClick();
    await Vue.nextTick();
    assert.equal(instance.dialog_reversal, true);
    assert.equal(instance.selected_payment_reversal.id, order.payments[0].id);
  }
});

test("default legacy presentation and canonical order identities remain available", async () => {
  const { html } = await render();
  assert.doesNotMatch(html, /b-vendor-payment-modern/);
  assert.match(html, /widget shadow my-3 mx-1 mx-md-3/);
  const header = calls.find(({ name }) => name === "u-widget-header").attrs;
  assert.deepEqual(plain(header.to), { name: "VPageVendorPayments" });
  assert.equal(header.target, "_blank");
  for (const type of Object.keys(productTypes)) {
    const order = { ...fixture(), type };
    const { html: modernHtml } = await render({ modern: true, order });
    assert.ok(modernHtml.includes(`/fixture/${type}.svg`));
  }
});
