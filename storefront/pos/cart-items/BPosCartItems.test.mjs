import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compile } from "@vue/compiler-dom";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BPosCartItems.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);

function evaluate(source, require = () => ({})) {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  const exports = {};
  vm.runInNewContext(result.outputText, { exports, require, String });
  return exports;
}

const core = new URL("../../../../core-js/", import.meta.url);
const readCore = (path) => readFileSync(new URL(path, core), "utf8");
const ProductType = evaluate(
  readCore("enums/product/ProductType.ts"),
  (name) =>
    name.endsWith("models") ? { Basket: {} } : { default: "/fixture/type.svg" },
).ProductType;
const ProductCondition = evaluate(
  readCore("enums/product/ProductCondition.ts"),
  () => ({ default: "/fixture/condition.svg" }),
).ProductCondition;
evaluate(readCore("prototypes/StringPrototypes.ts"), (name) =>
  name.includes("ColorGenerator")
    ? { StringToColour: () => "#000" }
    : { ShopTransportations: {} },
);
const component = evaluate(descriptor.script.content, (name) => {
  if (name.includes("ProductType")) return { ProductType };
  if (name.includes("ProductCondition")) return { ProductCondition };
  return { default: {} };
}).default;
const render = new Function(
  "Vue",
  compile(descriptor.template.content, {
    mode: "function",
    prefixIdentifiers: true,
  }).code,
)({
  ...Vue,
  resolveComponent: (name) => ({ name }),
  resolveDynamicComponent: (name) => (name === "router-link" ? { name } : name),
  renderSlot: (slots, name, props, fallback) =>
    Vue.createVNode(Vue.Fragment, null, slots[name]?.(props) ?? fallback?.()),
});

function nodes(node, name, result = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => nodes(child, name, result));
    return result;
  }
  if (!node || typeof node !== "object") return result;
  if (node.type === name || node.type?.name === name) result.push(node);
  if (Array.isArray(node.children)) nodes(node.children, name, result);
  else
    for (const slot of Object.values(node.children || {}))
      if (typeof slot === "function") nodes(slot({}), name, result);
  return result;
}

function fixture(props = {}) {
  const item = {
    id: 31,
    product_id: 4,
    variant_id: 8,
    count: 2,
    price: 150,
    dis: 180,
    product: {
      id: 4,
      title: "A long product title that remains readable in the cart",
      title_en: "Supporting title",
      type: ProductType.PHYSICAL.code,
      quantity: 20,
      icon: "/product.png",
      original: false,
      condition: ProductCondition.USED.code,
    },
    variant: { quantity: 5, image: "/variant.png", weight: "200gr" },
  };
  const emitted = [];
  const state = {
    ...component.data(),
    basket: { currency: "USD", items: [item] },
    modern: true,
    viewOnly: false,
    isAffiliatePos: false,
    busyAdd: null,
    busyDelete: null,
    $t: (key) => key,
    $slots: {},
    // These image helpers are genuine globally installed CoreMixin methods.
    getShopImagePath: (path, size) => `${path}?size=${size}`,
    getProductImage: (id) => `/product-${id}.png`,
    $emit: (...args) => emitted.push(JSON.parse(JSON.stringify(args))),
    ...props,
  };
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  return { state, item, emitted, tree: () => render(state, []) };
}

test("modern opt-in and both template branches compile with scoped Sass", async () => {
  assert.equal(component.props.modern.default, false);
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: file.pathname,
      id: "pos-cart-test",
    }).errors,
    [],
  );
  const style = await compileStyleAsync({
    source: descriptor.styles[0].content,
    filename: file.pathname,
    id: "data-v-pos-cart-test",
    scoped: true,
    preprocessLang: "scss",
  });
  assert.deepEqual(style.errors, []);
  assert.equal(
    nodes(fixture({ modern: false }).tree(), "s-shop-basket-item-count-select")
      .length,
    1,
  );
});

test("modern cart keeps variant identity, original price data and bounded bulk input", () => {
  const f = fixture();
  const tree = f.tree();
  assert.equal(nodes(tree, "img")[0].props.src, "/variant.png?size=64");
  assert.equal(
    nodes(tree, "variant-item-view-micro")[0].props["product-variant"],
    f.item.variant,
  );
  const input = nodes(tree, "input")[0];
  assert.equal(input.props.type, "number");
  assert.equal(input.props.min, "0");
  assert.equal(input.props.max, 5);
  assert.deepEqual(
    nodes(tree, "u-price").map((price) => [
      price.props.amount,
      price.props.currency,
    ]),
    [
      [360, "USD"],
      [300, "USD"],
    ],
  );
  assert.equal(nodes(tree, "router-link").length, 2);
  assert.equal(nodes(fixture({ viewOnly: true }).tree(), "input").length, 0);
  assert.equal(
    nodes(fixture({ isAffiliatePos: true }).tree(), "router-link").length,
    0,
  );
});

test("step and bulk input emit absolute counts without optimistic item mutation", () => {
  const f = fixture();
  f.state.stepCount(f.item, 1);
  assert.deepEqual(f.emitted.splice(0), [
    ["add", { product_id: 4, variant_id: 8, count: 3 }],
  ]);
  assert.equal(f.item.count, 2);
  const target = { valueAsNumber: 5, value: "5" };
  f.state.changeCount(f.item, { target });
  assert.deepEqual(f.emitted.splice(0), [
    ["add", { product_id: 4, variant_id: 8, count: 5 }],
  ]);
  assert.equal(target.value, "2");
  for (const count of [NaN, Infinity, -1, 1.5, 6, 2])
    f.state.requestCount(f.item, count);
  assert.deepEqual(f.emitted, []);
  f.item.count = 1;
  f.state.stepCount(f.item, -1);
  assert.deepEqual(f.emitted, [["delete", 31]]);
});

test("stock changes, file maximum and in-flight mutations retain their guards", () => {
  const f = fixture();
  f.item.variant.quantity = 1;
  f.state.stepCount(f.item, -1);
  assert.equal(f.emitted.pop()[1].count, 1);
  f.item.product.type = ProductType.FILE.code;
  assert.equal(f.state.availableQuantity(f.item), 1);
  for (const busy of [{ busyAdd: "4-8" }, { busyDelete: 31 }]) {
    Object.assign(f.state, busy);
    f.state.requestCount(f.item, 0);
    assert.deepEqual(f.emitted, []);
    Object.assign(f.state, { busyAdd: null, busyDelete: null });
  }
});
