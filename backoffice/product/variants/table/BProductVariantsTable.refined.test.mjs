import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("./BProductVariantsTable.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const source = ts.createSourceFile("variants.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = source.statements.find(ts.isExportAssignment).expression.getText(source);
const exports = {};
vm.runInNewContext(ts.transpileModule("export default " + options, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, {
  exports, ProductMixin: {}, UChipDiscount: {}, UColorCircle: {}, UVariantAssetImage: {}, UTimeProgressBar: {},
  defineAsyncComponent: (loader) => loader,
  GetVariantNameByCode: (key) => key, GetVariantIconByCode: (key) => key,
  GetNameOfColor: value => value ? 'Blue / Green' : null,
  ProductVariants: { color: { code: "color" }, style: { code: "style" }, weight: { code: "weight" } },
});
const component = exports.default;
function fixture(patch = {}) {
  const emitted = [], confirmations = [];
  const item = { id: 7, color: "#abcdef", style: "floral{asset}", weight: "100g", quantity: 0, enable: false, sku: "CAT-7" };
  const state = {
    ...component.data(), modern: true, viewOnly: false, product: { product_variants: [item] },
    $emit: (...args) => emitted.push(args), ...patch,
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  state.showAddVariantDialog = (variant) => confirmations.push(variant);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { state, item, emitted, confirmations };
}

test("variant dimensions and source-only variants remain available without mutating the source", () => {
  const source = { id: 9, style: "leaves{source}", quantity: 3, enable: true };
  const { state } = fixture({ missedVariants: [source] });
  assert.deepEqual(Object.keys(state.available_variants), ["color", "style", "weight"]);
  assert.equal(state.all_variants_items.length, 2);
  assert.equal(state.all_variants_items[1].missed, true);
  assert.equal(source.missed, undefined);
});

test("out-of-stock and disabled variants still open their actual inventory record", () => {
  const { state, item, emitted, confirmations } = fixture();
  state.selectVariant(item);
  assert.equal(emitted.length, 1);
  assert.equal(emitted[0][0], "select");
  assert.equal(emitted[0][1], item);
  assert.equal(confirmations.length, 0);
});

test("missing source variants retain their add confirmation and read-only tables cannot add them", () => {
  const { state, confirmations, emitted } = fixture();
  const missing = { id: 8, missed: true };
  state.selectVariant(missing);
  assert.equal(confirmations[0], missing);
  assert.equal(emitted.length, 0);
  state.viewOnly = true;
  state.selectVariant(missing);
  assert.equal(confirmations.length, 1);
  assert.equal(emitted.length, 0);
});

test("barcode and QR actions keep the selected SKU variant and distinct code modes", () => {
  const { state, item } = fixture();
  state.showBarcode(item, false);
  assert.equal(state.barcode_variant, item);
  assert.equal(state.barcode2d, false);
  assert.equal(state.show_barcode, true);
  state.showBarcode(item, true);
  assert.equal(state.barcode_variant.sku, "CAT-7");
  assert.equal(state.barcode2d, true);
});

test("legacy callers keep their original selection contract", () => {
  const { state, item, emitted } = fixture({ modern: false, viewOnly: true });
  state.selectVariant(item);
  assert.equal(emitted[0][1], item);
});

test("option help retains readable asset names and canonical color identities without exposing asset IDs as names", () => {
  const { state } = fixture();
  const variantName = text => ({ removeVariantAsset: () => text });
  assert.equal(state.variantOptionName('style', variantName(' Floral ')), 'Floral');
  assert.equal(state.variantOptionName('style', variantName('')), '');
  assert.equal(state.variantOptionName('weight', variantName('100g')), '100g');
  assert.equal(state.variantOptionName('color', '#0000ff/#00ff00'), 'Blue / Green');
  assert.equal(state.variantOptionName('style', null), '');
});
