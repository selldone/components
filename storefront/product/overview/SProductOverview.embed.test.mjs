import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

const { descriptor, errors } = parse(readFileSync(new URL("./SProductOverview.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const script = ts.createSourceFile("overview.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = script.statements.find(ts.isExportAssignment).expression;
const methodSource = options.properties.find((p) => p.name?.getText(script) === "methods").initializer.getText(script);
const output = ts.transpileModule(`const methods = ${methodSource};`, {
  compilerOptions: { target: ts.ScriptTarget.ES2022 },
}).outputText;
const methods = vm.runInNewContext(output + "\nmethods;", { console: { log() {} } });

function fixture(query = {}, patch = {}) {
  const variants = [
    { id: 11, product_id: 1, enable: true, quantity: 4, color: "red", weight: "100gr" },
    { id: 12, product_id: 1, enable: true, quantity: 0, color: "blue", weight: "200gr" },
    { id: 13, product_id: 1, enable: false, quantity: 4 },
    { id: 14, product_id: 9, enable: true, quantity: 4 },
  ];
  const bought = [];
  const state = {
    canBuy: true, embedMode: false, quickBuyMode: false, busy_user: false,
    $route: { query }, $product: { id: 1, product_variants: variants }, product_variants: variants,
    AvailableProductVariants: [{ code: "color" }, { code: "weight" }],
    current_variant: null, selection_values: [], basket: null,
    $nextTick: (callback) => callback(), ...patch,
  };
  for (const name of ["applyQueryVariant", "selectFirstVariant", "autoVarF", "autoBuy"]) {
    state[name] = methods[name].bind(state);
  }
  state.buy = (variant) => bought.push(variant);
  return { state, variants, bought };
}

test("a selection-only deep link restores the same public product variant without purchasing", () => {
  const { state, variants, bought } = fixture({ variant_id: "12" });
  state.selectFirstVariant();
  state.autoBuy();
  assert.equal(state.current_variant, variants[1]);
  assert.deepEqual(Array.from(state.selection_values, (v) => ({ ...v })), [
    { code: "color", value: "blue" }, { code: "weight", value: "200gr" },
  ]);
  assert.equal(bought.length, 0);
});

test("malformed, foreign, missing and disabled variant IDs cannot override the normal selection", () => {
  for (const id of [undefined, null, ["12"], "", "0", "-12", "12x", "12.0", "1e1", "012", "9007199254740992", "999", "13", "14"]) {
    const { state, variants, bought } = fixture({ variant_id: id });
    state.selectFirstVariant();
    assert.equal(state.current_variant, variants[0], String(id));
    state.autoBuy();
    assert.equal(bought.length, 0);
  }
});

test("normal cart preference survives without a valid handoff; a valid handoff takes precedence", () => {
  const { state, variants } = fixture({}, { basket: { items: [{ product_id: 1, variant_id: 12 }] } });
  state.selectFirstVariant();
  assert.equal(state.current_variant, variants[1]);
  state.$route.query.variant_id = "11";
  state.selectFirstVariant();
  assert.equal(state.current_variant, variants[0]);
});

test("query selection remains local and follows later valid variant navigation", () => {
  const { state, variants, bought } = fixture({ variant_id: "11" });
  state.applyQueryVariant();
  state.$route.query.variant_id = "12";
  assert.equal(state.applyQueryVariant(), true);
  assert.equal(state.current_variant, variants[1]);
  assert.equal(bought.length, 0);
  state.$route.query.variant_id = "14";
  assert.equal(state.applyQueryVariant(), false);
  assert.equal(state.current_variant, variants[1]);
});

test("embedded, quick-buy and non-purchasing overviews do not consume a page's variant query", () => {
  for (const patch of [{ embedMode: true }, { quickBuyMode: true }, { canBuy: false }]) {
    const { state, variants } = fixture({ variant_id: "12" }, patch);
    state.selectFirstVariant();
    assert.equal(state.current_variant, variants[0]);
  }
});

test("the separate existing buy=true flow keeps its explicit opt-in behavior", () => {
  const { state, variants, bought } = fixture({ variant_id: "12", buy: "true" });
  state.selectFirstVariant();
  state.autoBuy();
  assert.equal(bought.length, 1);
  assert.equal(bought[0], variants[1]);
  state.busy_user = true;
  state.autoBuy();
  assert.equal(bought.length, 1);
});
