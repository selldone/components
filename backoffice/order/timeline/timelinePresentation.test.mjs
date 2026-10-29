import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Synthetic records only; grouping cannot reach a shop or modify stored events.
const compiled = ts.transpileModule(
  readFileSync(new URL("./timelinePresentation.ts", import.meta.url), "utf8"),
  {
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
);
assert.deepEqual(compiled.diagnostics, []);
const exports = {};
vm.runInNewContext(compiled.outputText, { exports, Date });
const { buildTimelineSections: build, getTimelineCategory: category } = exports;
const event = (id, type, time = "2026-10-28T19:46:00", extra = {}) => ({
  id,
  type,
  created_at: time,
  shop_id: 3,
  data: {},
  ...extra,
});
const rows = (items, filter) => Array.from(build(items, filter)).flatMap(day => day.rows);
const ids = (sections) => Array.from(sections).flatMap(day => Array.from(day.rows).flatMap(row => row.items.map(item => item.id)));

const shippingSms = event(12, "sms-ready-to-ship", undefined, { data: { phone: "fixture-phone" } });
const shippingMail = event(11, "email-update", undefined, { data: { message: "Recorded update" } });
const shipped = event(10, "send");
const confirmationSms = event(9, "sms-order-confirmation", "2026-10-28T18:13:00");
const confirmationMail = event(8, "email-update", "2026-10-28T18:13:00");
const confirmed = event(7, "confirm", "2026-10-28T18:13:00");
const payment = event(6, "payment", "2026-09-24T14:57:00", { data: { payment: { amount: -5, currency: "USD", message: "Recorded adjustment" } } });
const pinnedNote = event(2, "note", "2026-09-24T14:55:00", { pin: true, data: { message: "Pinned fixture" } });
const unpinnedNote = event(1, "note", "2026-09-24T14:54:00");
const records = [shippingSms, shippingMail, shipped, confirmationSms, confirmationMail, confirmed, payment, pinnedNote, unpinnedNote];
const before = JSON.stringify(records);
const sections = build(records);
assert.equal(sections[0].pinned, true);
assert.equal(sections[0].rows[0].items[0], pinnedNote);
assert.equal(sections[1].date, shippingSms.created_at);
assert.equal(sections[1].rows[0].bundle, true);
assert.equal(sections[1].rows[0].items[0], shippingSms);
assert.equal(sections[1].rows[0].items[1], shippingMail);
assert.equal(sections[1].rows[0].titleKey, "order_timeline.modern.bundle_notifications");
assert.deepEqual(ids(sections), [2, 12, 11, 10, 9, 8, 7, 6, 1]);
assert.equal(JSON.stringify(records), before);
assert.equal(rows(records, "message").length, 2);
assert.deepEqual(ids(build(records, "payment")), [6]);
assert.deepEqual(ids(build(records, "note")), [2, 1]);
assert.equal(build([], "all").length, 0);

// A hidden event remains a grouping boundary, even in the Messages filter.
assert.equal(rows([shippingSms, shipped, shippingMail], "message").length, 2);
assert.equal(rows([shippingSms, pinnedNote, shippingMail]).filter(row => row.bundle).length, 0);

const paymentSms = event(4, "sms-payment");
const paymentMail = event(3, "email-payment");
assert.equal(rows([paymentSms, paymentMail])[0].titleKey, "order_timeline.modern.bundle_payment");
assert.equal(rows([paymentMail, event(2, "email-buy")]).length, 2);
assert.equal(rows([shippingSms, event(2, "sms-order-confirmation")]).length, 2);
assert.equal(rows([shippingMail, shippingSms, event(2, "sms-order-confirmation")]).length, 2);

assert.equal(rows([shippingSms, event(2, "email-update", "2026-10-28T19:45:00")]).length, 1);
assert.equal(rows([shippingSms, event(2, "email-update", "2026-10-28T19:44:59")]).length, 2);
assert.equal(rows([shippingSms, event(3, "email-update", "2026-10-28T19:45:30"), event(2, "email-update", "2026-10-28T19:44:59")]).length, 2);
assert.equal(build([event(2, "sms-payment", "2026-10-29T00:00:10"), event(1, "email-payment", "2026-10-28T23:59:50")]).length, 2);
assert.equal(rows([shippingSms, event(2, "email-update", undefined, { shop_id: 4 })]).length, 2);
assert.equal(rows([shippingSms, event(2, "sms-ready-to-ship", undefined, { data: { phone: "different-fixture-phone" } })]).length, 2);

for (const type of ["email-vendor", "vendor-sms", "sms-vendor", "connect-sync", "email-future", "constructor", "__proto__", "toString"]) {
  assert.equal(rows([event(2, type), event(1, type)]).length, 2);
}
for (const data of [{ vendor_id: 7 }, { vendor_order_id: 8 }, { connect_id: 9 }]) {
  assert.equal(rows([event(2, "email-update", undefined, { data }), event(1, "email-update", undefined, { data })]).length, 2);
}

const malformed = [
  event(4, "unknown-type", "invalid", { data: null }),
  event(3, "sms-payment", "invalid"),
  event(2, "email-payment", null),
  event(1, undefined, null, { data: { message: "Unknown event remains visible" } }),
];
assert.deepEqual(ids(build(malformed)), [4, 3, 2, 1]);
assert.equal(build(malformed)[0].date, null);
assert.equal(rows(malformed).every(row => !row.bundle), true);
for (const type of ["payment", "payment-cod-confirm", "payment-cash-confirm", "payment-dir-confirm", "vendor-payout", "vendor-wallet-transaction"]) assert.equal(category(type), "payment");
for (const type of ["email-update", "email-future", "sms-vendor", "vendor-sms"]) assert.equal(category(type), "message");
assert.equal(category("note"), "note");
for (const type of [undefined, null, 7, "unknown", "connect-failed", "error"]) assert.equal(category(type), "order");

console.log("timelinePresentation: grouping, native order, filters, original references, family/time/day/scope boundaries and malformed fallbacks passed.");
