import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import * as Vue from "vue";
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
  ProductVariants: Object.fromEntries(["color", "style", "volume", "weight", "pack", "type"].map(code => [code, { code }])),
});
const component = exports.default;
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "variant-table-test" });
assert.deepEqual(template.errors, []);
const templateExports = {};
vm.runInNewContext(ts.transpileModule(template.code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: templateExports, require: () => ({
  ...Vue, resolveComponent: name => name, resolveDirective: () => ({}), withDirectives: node => node,
}) });
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

test("missing parameters follow every enabled dimension while raw image-only and zero-string values remain valid", () => {
  const complete = { id: 1, color: "#abcdef", style: "{asset-only}", volume: "10ml", weight: "10g", pack: "0", type: "material" };
  const incomplete = { ...complete, id: 2 };
  const product = { product_variants: [complete, incomplete] };
  const { state, emitted, confirmations } = fixture({ product });
  assert.equal(state.hasMissingVariantParameter(incomplete), false);
  for (const key of Object.keys(complete).filter(key => key !== "id")) {
    for (const value of [null, undefined, "", " \t "]) {
      incomplete[key] = value;
      assert.equal(state.hasMissingVariantParameter(incomplete), true, `${key} is required while another row uses it`);
    }
    incomplete[key] = complete[key];
  }
  state.selectVariant(incomplete);
  assert.equal(emitted[0][1], incomplete, "An incomplete saved variant opens its actual inventory editor");
  assert.equal(confirmations.length, 0, "Missing parameters never turn an existing record into a supplier Add action");
  assert.equal(incomplete.missed, undefined);
  for (const row of product.product_variants) row.type = null;
  assert.equal("type" in state.available_variants, false, "A dimension with no configured values is disabled, as in Inventory");
  assert.equal(state.hasMissingVariantParameter(incomplete), false);
  for (const row of product.product_variants) row.volume = "  ";
  assert.equal("volume" in state.available_variants, false, "Whitespace alone does not enable a dimension");
  assert.equal(state.hasMissingVariantParameter(incomplete), false);
});

function renderedRow(state, item) {
  const root = templateExports.render({
    ...state, $t: key => key, numeralFormat: value => String(value),
    priceProductByCurrency: () => 0,
  }, []);
  const table = descendants(root).find(node => typeof node.children?.item === "function");
  return table.children.item({ item })[0];
}
function descendants(node) {
  return [node, ...(Array.isArray(node.children) ? node.children.flatMap(child => typeof child === "object" && child ? descendants(child) : []) : [])];
}

test("the actual modern row marks incomplete active and disabled variants red without changing supplier Add semantics", () => {
  const complete = { id: 1, color: "#abcdef", quantity: 3, enable: true };
  const incomplete = { id: 2, color: null, quantity: 4, enable: true };
  const { state, confirmations, emitted } = fixture({ product: { product_variants: [complete, incomplete] } });
  let row = renderedRow(state, incomplete);
  let identity = row.children[0];
  assert.match(identity.props.class, /inactive-overlay/);
  assert.match(identity.props.class, /-red/);
  assert.doesNotMatch(identity.props.class, /-amber/);
  assert.ok(descendants(identity).some(node => node.type === "span" && node.children === "b_product_dashboard.identity.missing_parameter"));
  row.props.onClick();
  assert.equal(emitted[0][1], incomplete);
  assert.equal(confirmations.length, 0);
  incomplete.enable = false;
  identity = renderedRow(state, incomplete).children[0];
  assert.match(identity.props.class, /-red/);
  assert.match(identity.props.class, /-amber/, "Existing styles let missing-parameter red take precedence over disabled amber");
  identity = renderedRow(state, complete).children[0];
  assert.doesNotMatch(identity.props.class, /inactive-overlay|-red|-amber/);
  complete.quantity = 0;
  identity = renderedRow(state, complete).children[0];
  assert.match(identity.props.class, /inactive-overlay/);
  assert.doesNotMatch(identity.props.class, /-red|-amber/, "Out-of-stock alone retains its neutral shading");
  state.modern = false;
  row = renderedRow(state, incomplete);
  assert.match(row.props.class, /inactive-overlay/);
  assert.match(row.props.class, /-red/);
});

test("modern rows without SKU show quiet text instead of unavailable barcode actions, while valid and legacy actions retain their behavior", () => {
  const item = { id: 8, color: "#abcdef", quantity: 3, enable: true, mpn: "MPN-8" };
  const { state, emitted } = fixture({ product: { product_variants: [item] } });
  for (const sku of [undefined, null, ""]) {
    item.sku = sku;
    const row = renderedRow(state, item), nodes = descendants(row);
    assert.equal(nodes.filter(node => node.type === "v-btn").length, 0, "No disabled Barcode or QR button is rendered");
    assert.equal(nodes.some(node => node.type === "v-icon" && node.props?.title === "The SKU is not set for variant!"), false);
    const label = nodes.find(node => node.props?.class === "b-product-variants-refined__no-sku");
    assert.equal(label.type, "span");
    assert.equal(label.children, "b_product_dashboard.identity.sku_not_set");
    assert.equal(label.props.onClick, undefined);
    assert.equal(label.props.role, undefined);
  }
  item.sku = "SKU-8";
  const row = renderedRow(state, item), nodes = descendants(row);
  assert.equal(nodes.some(node => node.props?.class === "b-product-variants-refined__no-sku"), false);
  const barcode = nodes.find(node => node.type === "v-btn" && node.props?.["aria-label"] === "b_product_dashboard.identity.sku_barcode");
  const qr = nodes.find(node => node.type === "v-btn" && node.props?.["aria-label"] === "b_product_dashboard.identity.sku_qr");
  assert.ok(barcode && qr);
  assert.equal(barcode.props.disabled, undefined);
  assert.equal(qr.props.disabled, undefined);
  let stopped = 0;
  barcode.props.onClick({ stopPropagation: () => { stopped++; } });
  assert.equal(state.barcode_variant, item);
  assert.equal(state.barcode2d, false);
  qr.props.onClick({ stopPropagation: () => { stopped++; } });
  assert.equal(state.barcode_variant, item);
  assert.equal(state.barcode2d, true);
  assert.equal(stopped, 2);
  assert.equal(emitted.length, 0, "Barcode actions do not select their containing row");
  row.props.onClick();
  assert.equal(emitted[0][1], item, "The rest of the row retains native selection");
  state.modern = false; item.sku = null;
  const legacyNodes = descendants(renderedRow(state, item));
  assert.equal(legacyNodes.filter(node => node.type === "v-btn").length, 0);
  assert.equal(legacyNodes.some(node => node.type === "v-icon" && node.props?.title === "The SKU is not set for variant!"), true);
});
