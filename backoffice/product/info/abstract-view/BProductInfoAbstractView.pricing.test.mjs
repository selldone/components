import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const packageRoot = new URL("../../../../", import.meta.url);
const coreRoot = new URL("../core-js/", packageRoot);
const errors = [];
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function evaluate(source, require) {
  const exports = {};
  vm.runInNewContext(transpile(source), {
    exports, require, console: { error: (...args) => errors.push(args) },
  });
  return exports;
}
const { Currency } = evaluate(readFileSync(new URL("enums/payment/Currency.ts", coreRoot), "utf8"), () => "asset");
const { ProductType } = evaluate(readFileSync(new URL("enums/product/ProductType.ts", coreRoot), "utf8"), path => path.endsWith("/models") ? { Basket: {} } : "asset");
const { PriceHelper } = evaluate(readFileSync(new URL("helper/price/PriceHelper.ts", coreRoot), "utf8"), path => path.endsWith("/Currency") ? { Currency } : {});
const ProductMixin = evaluate(readFileSync(new URL("mixin/product/ProductMixin.ts", packageRoot), "utf8"), path => {
  if (path.includes("PriceHelper")) return { PriceHelper };
  if (path.includes("ProductType")) return { ProductType };
  return {};
}).default;

function loadComponent(relativePath) {
  const file = new URL(relativePath, packageRoot);
  const parsed = parse(readFileSync(file, "utf8"), { filename: file.pathname });
  assert.deepEqual(parsed.errors, []);
  const component = evaluate(parsed.descriptor.script.content, path => {
    if (path.includes("ProductMixin")) return { default: ProductMixin };
    if (path.includes("ProductType")) return { ProductType };
    if (path.includes("ProductVariants")) return { ProductVariants: Object.fromEntries(["color", "style", "volume", "weight", "pack", "type"].map(code => [code, { code }])) };
    if (path.includes("ProductExternal")) return { ProductExternal: { getServiceData: () => null } };
    if (path === "vue") return Vue;
    return { default: {}, ShopURLs: { MainShopUrl: () => "https://shop.example" } };
  }).default;
  const template = compileTemplate({ source: parsed.descriptor.template.content, filename: file.pathname, id: relativePath });
  assert.deepEqual(template.errors, []);
  const { render } = evaluate(template.code, path => path === "vue" ? {
    ...Vue, resolveComponent: name => ({ name }), resolveDirective: () => ({}), withDirectives: node => node,
    renderSlot: (_slots, _name, _props, fallback) => Vue.createVNode(Vue.Fragment, null, fallback?.() || []),
  } : "asset");
  return { component, render };
}
const info = loadComponent("backoffice/product/info/abstract-view/BProductInfoAbstractView.vue");
const variants = loadComponent("backoffice/product/variants/table/BProductVariantsTable.vue");

function fixture(component, product) {
  const state = {
    ...component.data(), shop: { id: 1 }, product, modern: true,
    $t: key => key, $route: { params: {}, matched: [] },
    $vuetify: { display: { smAndUp: true } },
    $emit() {}, numeralFormat: String, getShopImagePath: path => path,
  };
  for (const source of [...(component.mixins || []), component]) {
    for (const [name, method] of Object.entries(source.methods || {})) state[name] = method.bind(state);
    for (const [name, getter] of Object.entries(source.computed || {})) {
      Object.defineProperty(state, name, { get: getter.bind(state) });
    }
  }
  return state;
}
function descendants(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(descendants);
  const type = node.type?.name || node.type;
  if (type === "v-dialog") return [{ ...node, type }];
  return [{ ...node, type }, ...descendants(Array.isArray(node.children) ? node.children : node.children?.default?.())];
}
function product(patch = {}) {
  return {
    id: 31, type: "PHYSICAL", price: 100, commission: 10, discount: 0, currency: "USD",
    quantity: 3, tags: [], product_variants: [], valuation: { id: 7, structure: [] }, ...patch,
  };
}

test("dashboard prices use their explicit valuation through the real product mixin without fallback warnings", () => {
  errors.length = 0;
  for (const valuation of [null, { id: 7, structure: [] }]) {
    const state = fixture(info.component, product({ valuation }));
    const nodes = descendants(info.render(state, []));
    const customerPrice = nodes.find(node => node.type === "td" && node.props?.["data-label"] === "global.commons.customer_price");
    assert.equal(descendants(customerPrice).find(node => node.type === "u-price").props.amount, 110);
  }
  assert.deepEqual(errors, []);
});

test("variant prices and supplier profit keep their values and their separate product valuations", () => {
  errors.length = 0;
  const item = { id: 41, parent_id: 51, pricing: true, price: 150, commission: 10, currency: "USD", quantity: 3, enable: true };
  const sourceItem = { id: 51, pricing: true, price: 80, commission: 5, currency: "USD" };
  const parent = product({ id: 32, valuation: { id: 8, structure: [] }, product_variants: [sourceItem], shop: { id: 2 } });
  const current = product({ parent_id: parent.id, parent, product_variants: [item] });
  const state = fixture(variants.component, current);
  const table = descendants(variants.render(state, [])).find(node => typeof node.children?.item === "function");
  const row = table.children.item({ item });
  const customerPrice = descendants(row).find(node => node.type === "td" && node.props?.["data-label"] === "global.commons.customer_price");
  assert.equal(descendants(customerPrice).find(node => node.type === "u-price").props.amount, 160);
  const infoState = fixture(info.component, current);
  assert.equal(infoState.profitCalculate(current, item), 85);
  assert.deepEqual(errors, []);
});
