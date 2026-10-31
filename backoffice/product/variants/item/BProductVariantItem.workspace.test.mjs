import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { parse, compileStyle, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

const filename = fileURLToPath(new URL("./BProductVariantItem.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: "variant-workspace-test" }).errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({
  source: style.content, filename, id: "variant-workspace-test", scoped: style.scoped, preprocessLang: style.lang,
}).errors, []);
const source = ts.createSourceFile(filename, descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = source.statements.find(ts.isExportAssignment).expression.getText(source);
const stub = { setup(_, { slots }) { return () => Vue.h("span", slots.default?.()); } };
const priceStub = { props: ["amount", "currency", "lineThrough"], setup(props) {
  return () => Vue.h("span", { "data-price": props.amount, "data-struck": String(!!props.lineThrough) }, `${props.currency} ${props.amount}`);
} };
const vars = { color: {}, style: {}, weight: {} };

function fixture(patch = {}) {
  const emitted = [], requests = [], notices = [];
  const exports = {};
  const row = { id: 7, color: "#aabbcc", quantity: 0, enable: false, pricing: true, price: 20, discount: 5, currency: "USD", dis_end: "2022-01-01", sku: "SKU-VERY-LONG-IDENTIFIER-123456789", mpn: "MPN-7" };
  const product = { id: 3, shop_id: 1, vendor_id: 2, icon: "product.png", price: 50, discount: 10, currency: "EUR", dis_end: "2020-01-01", product_variants: [row], extra_pricings: [{ variant_id: 7 }, { variant_id: null }, { variant_id: 7, product_vendor_id: 4 }] };
  const methods = Object.fromEntries(["remove", "restore"].map(name => [name, (...args) => {
    requests.push([name, ...args]);
    return Promise.resolve({ variants: 1, quantity: 4, product_variant: row });
  }]));
  vm.runInNewContext(ts.transpileModule("export default " + options, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, Date, DateMixin: {}, ProductVariants: vars,
    UCube: stub, UAvatarFolder: stub, UColorCircle: stub, UVariantAssetImage: stub,
    ExtraPricingLevels: stub, UTimeProgressBar: stub, BProductEditInfoIcon: stub,
    GetVariantNameByCode: key => key, GetVariantIconByCode: key => key,
    GetVariantOrderIndexByCode: key => Object.keys(vars).indexOf(key),
    GetNameOfColor: () => "Blue", UploadHelper: {},
    NotificationService: { showSuccessAlert: (...args) => notices.push(args), showLaravelError: error => { throw error; } },
    window: { $backoffice: { product: { variants: methods } }, $vendor: { product: { variants: methods } } },
  });
  const component = exports.default;
  const state = {
    ...component.data(), product, productVariant: row, modern: true, productWorkspace: true,
    validateVariants: ["color"], $route: { params: {}, matched: [] }, $emit: (...args) => emitted.push(args),
    $t: (key, params) => params ? `${key} ${JSON.stringify(params)}` : key,
    ...patch,
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { component, state, emitted, requests, notices, row, product };
}

async function render(patch = {}) {
  const result = fixture(patch);
  const component = { ...result.component, render: Vue.compile(descriptor.template.content) };
  const app = Vue.createSSRApp(component, {
    modern: true, productWorkspace: true, hasDelete: true, product: result.product, productVariant: result.row,
    validateVariants: ["color"], ...patch,
  });
  app.config.warnHandler = () => {};
  Object.assign(app.config.globalProperties, {
    $t: result.state.$t, $route: { params: {}, matched: [] }, getShopImagePath: value => value,
    numeralFormat: value => String(value), getLocalTimeString: value => value,
  });
  for (const name of ["VIcon", "VBtn", "VTooltip", "VProgressCircular", "ULoadingProgress", "UButtonCircle"]) app.component(name, stub);
  app.component("UPrice", priceStub);
  result.html = await renderToString(app);
  return result;
}

test("workspace uses the base amount even when an old discount remains configured", async () => {
  const { html, requests } = await render();
  assert.match(html, /b-inventory-variant--workspace/);
  assert.match(html, /data-price="20" data-struck="false"/);
  assert.match(html, /<details class="b-inventory-variant__pricing-details"/);
  assert.match(html, /b_product_inventory.configured_offer/);
  assert.match(html, /data-price="15" data-struck="false"/);
  assert.match(html, /SKU-VERY-LONG-IDENTIFIER-123456789/);
  assert.equal(requests.length, 0);
});

test("standalone modern inventory retains its original offer presentation", async () => {
  const { html } = await render({ productWorkspace: false });
  assert.doesNotMatch(html, /b-inventory-variant--workspace/);
  assert.match(html, /data-price="20" data-struck="true"/);
  assert.doesNotMatch(html, /<details class="b-inventory-variant__pricing-details"/);
});

test("inherited and own pricing retain native currencies and vendor-tier exclusions", () => {
  const { state, row } = fixture();
  assert.equal(state.price, 20);
  assert.equal(state.currency, "USD");
  assert.equal(state.extra_pricings.length, 1);
  assert.equal(state.has_pricing_details, true);
  row.pricing = false;
  assert.equal(state.price, 50);
  assert.equal(state.currency, "EUR");
  assert.equal(state.extra_pricings.length, 1);
  assert.equal(state.extra_pricings[0].variant_id, null);
  state.product.discount = 0;
  state.product.dis_end = null;
  state.product.extra_pricings = [];
  assert.equal(state.has_pricing_details, false);
});

test("out of stock and inactive rows stay editable while pending or deleted rows do not open", () => {
  const { state, emitted, row } = fixture();
  state.selectVariant();
  assert.deepEqual(emitted, [["select"]]);
  state.busy_delete = true;
  state.selectVariant();
  state.busy_delete = false;
  state.busy_restore = true;
  state.selectVariant();
  state.busy_restore = false;
  row.deleted_at = "2026-01-01";
  state.selectVariant();
  assert.equal(emitted.length, 1);
});

test("variant option validation remains based on selected native axes", () => {
  const { state, row } = fixture({ validateVariants: ["color", "weight"] });
  assert.deepEqual(Array.from(state.option_keys), ["color", "weight"]);
  assert.deepEqual(Array.from(state.missing_options), ["weight"]);
  row.weight = "100gr";
  assert.deepEqual(Array.from(state.missing_options), []);
});

test("delete and restore keep their original shop and vendor request arguments", async () => {
  const owner = fixture();
  await owner.state.deleteProductVariant();
  assert.deepEqual(owner.requests, [["remove", 1, 3, 7]]);
  assert.equal(owner.row.deleted_at.length > 0, true);
  assert.deepEqual(owner.emitted, [["delete", 7]]);
  const vendor = fixture({ $route: { params: { vendor_id: 2 }, matched: [{ meta: { vendor: true } }] } });
  await vendor.state.restoreProductVariant();
  assert.deepEqual(vendor.requests, [["restore", 2, 3, 7]]);
  assert.equal(vendor.emitted[0][0], "restore");
  assert.equal(vendor.emitted[0][1], vendor.row);
});
