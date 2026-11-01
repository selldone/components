import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

const filename = new URL("./SChartFunnelFinance.vue", import.meta.url);
const sfc = parse(readFileSync(filename, "utf8")).descriptor;
const syntax = ts.createSourceFile(
  "finance.ts",
  sfc.script.content,
  ts.ScriptTarget.Latest,
  true,
);
const Currency = Object.fromEntries(
  ["USD", "EUR", "GBP"].map((code) => [code, { code, enable: true }]),
);
const globals = {
  Currency,
  PriceHelper: {
    getBuyRateValue: (_shop, from, to) =>
      from === "EUR" && to === "USD" ? 2 : null,
  },
};
for (const statement of syntax.statements.filter(ts.isImportDeclaration)) {
  const clause = statement.importClause;
  if (clause?.name) globals[clause.name.text] ??= {};
  for (const binding of clause?.namedBindings?.elements ?? [])
    globals[binding.name.text] ??= {};
}
const options = vm.runInNewContext(
  "(" +
    syntax.statements.find(ts.isExportAssignment).expression.getText(syntax) +
    ")",
  globals,
);

function fixture(financeKey = "pay") {
  const state = {
    ...options.data(),
    modern: true,
    financeKey,
    shop: { currencies: ["USD", "EUR", "GBP"] },
    selected_currency: "USD",
    enable_currencies: ["USD", "EUR"],
    timeSeries: {
      raw_data: [
        {
          created_at: "2026-10-01",
          finances: [
            { currency: "USD", pay: -4, sell: 8 },
            { currency: "EUR", pay: 3, sell: 6 },
          ],
        },
        {
          created_at: "2026-10-02",
          finances: [{ currency: "USD", pay: 0, sell: 1 }],
        },
      ],
    },
  };
  for (const [name, method] of Object.entries(options.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(options.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  return state;
}

test("modern finance selectors, summary and legacy chart compile", () => {
  assert.deepEqual(
    compileTemplate({
      source: sfc.template.content,
      filename: filename.pathname,
      id: "finance",
    }).errors,
    [],
  );
  for (const style of sfc.styles)
    assert.deepEqual(
      compileStyle({
        source: style.content,
        filename: filename.pathname,
        id: "finance",
        scoped: true,
        preprocessLang: style.lang,
      }).errors,
      [],
    );
});

test("estimated period totals keep native signs, selected sources and per-measure state", () => {
  const payments = fixture(),
    sales = fixture("sell");
  const original = JSON.stringify(payments.timeSeries.raw_data);
  assert.equal(payments.estimatedTotal, 2);
  assert.equal(sales.estimatedTotal, 21);
  payments.enable_currencies = ["USD"];
  assert.equal(payments.estimatedTotal, -4);
  assert.equal(
    sales.estimatedTotal,
    21,
    "Source selection belongs to its own measure",
  );
  payments.enable_currencies = ["EUR"];
  payments.selected_currency = "EUR";
  assert.equal(
    payments.estimatedTotal,
    3,
    "A source in its own display currency is not converted",
  );
  assert.equal(JSON.stringify(payments.timeSeries.raw_data), original);
});

test("an unavailable rate, missing value or no observations never becomes a zero total", () => {
  const state = fixture();
  state.selected_currency = "GBP";
  assert.equal(state.estimatedTotal, null);
  state.selected_currency = "USD";
  state.enable_currencies = [];
  assert.equal(state.estimatedTotal, null);
  state.enable_currencies = ["USD"];
  state.timeSeries.raw_data = [];
  assert.equal(state.estimatedTotal, null);
  state.timeSeries.raw_data = [{ finances: [{ currency: "USD", pay: 0 }] }];
  assert.equal(state.estimatedTotal, 0, "A recorded zero remains a valid zero");
  state.timeSeries.raw_data = [{ finances: [{ currency: "USD" }] }];
  assert.equal(state.estimatedTotal, null);
});
