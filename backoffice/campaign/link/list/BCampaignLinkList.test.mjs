import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const { parse } = require("@vue/compiler-sfc");
const ts = require("typescript");
const { descriptor } = parse(
  readFileSync(new URL("./BCampaignLinkList.vue", import.meta.url), "utf8"),
);
const code = ts.transpileModule(descriptor.script.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const rates = {
  IRR: 0.00002,
  USD: 1,
  EUR: "1.1",
  BAD: -1,
  INF: Infinity,
  BOOL: true,
};
const exports = {};
vm.runInNewContext(code, {
  exports,
  require(name) {
    if (name.includes("PriceHelper"))
      return {
        PriceHelper: {
          getBuyRateValue: (_shop, from, to) =>
            from === to ? 1 : (rates[from] ?? null),
        },
      };
    return {};
  },
});
const context = { shop: {}, GetUserSelectedCurrency: () => ({ code: "USD" }) };
const rows = (payment) =>
  exports.default.methods.paymentRows.call(context, payment);
const codes = (payment) => Array.from(rows(payment), (row) => row.code);

// Native rial units are ranked before UPrice applies its Toman display factor.
const payment = { IRR: 400000000, USD: 553011.64, EUR: "9000", CAD: 0 };
const original = JSON.stringify(payment);
assert.deepEqual(codes(payment), ["USD", "EUR", "IRR", "CAD"]);
assert.equal(rows(payment).find((row) => row.code === "IRR").amount, 400000000);
assert.equal(
  JSON.stringify(payment),
  original,
  "Ranking must not mutate recorded amounts.",
);

assert.deepEqual(
  codes({ BAD: 999999, INF: 100, BOOL: 100, MISSING: 500, USD: 1 }),
  ["USD", "BAD", "INF", "BOOL", "MISSING"],
);
assert.ok(
  rows({ BAD: 4, INF: 4, BOOL: 4, MISSING: 4 }).every(
    (row) => row.value === null,
  ),
);
assert.deepEqual(
  codes({ EUR: 0, USD: 0 }),
  ["EUR", "USD"],
  "Equal values keep their source order.",
);
assert.deepEqual(
  codes({ UNKNOWN: 0, USD: -1 }),
  ["UNKNOWN", "USD"],
  "Known zero needs no exchange rate and ranks above a negative adjustment.",
);
assert.deepEqual(codes({ EUR: -10, USD: -1 }), ["USD", "EUR"]);
assert.deepEqual(codes({ USD: null, EUR: "" }), ["USD", "EUR"]);
assert.ok(
  rows({ USD: null, EUR: "", CAD: false }).every((row) => row.amount === null),
);
assert.deepEqual(codes(null), []);
assert.equal(
  exports.default.props.modern.default,
  false,
  "Legacy list callers remain opt-out.",
);
console.log(
  "Campaign currency ranking, native units, missing rates and stable amounts passed.",
);
