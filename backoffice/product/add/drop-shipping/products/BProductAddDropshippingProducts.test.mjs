import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import { throttle } from "lodash-es";
import * as Vue from "vue";
import ts from "typescript";

const root = new URL("../../../../../../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function evaluate(source, require, globals = {}) {
  const exports = {};
  vm.runInNewContext(transpile(source), { exports, require, window: {}, ...globals });
  return exports;
}
const { Currency } = evaluate(read("@selldone/core-js/enums/payment/Currency.ts"), (name) => name);
const { DateConverter } = evaluate(read("@selldone/core-js/helper/date/DateConverter.ts"), () => ({ Calendar: {} }));
const { PriceHelper } = evaluate(read("@selldone/core-js/helper/price/PriceHelper.ts"), (name) => {
  if (name.includes("Currency")) return { Currency };
  if (name.includes("DateConverter")) return { DateConverter };
  return { StorefrontDebugEvents: {} };
});
const { default: ProductMixin } = evaluate(read("@selldone/components-vue/mixin/product/ProductMixin.ts"), (name) => {
  if (name.includes("PriceHelper")) return { PriceHelper };
  if (name.includes("/Currency")) return { Currency };
  return {};
});
const { descriptor, errors } = parse(readFileSync(new URL("./BProductAddDropshippingProducts.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename: "BProductAddDropshippingProducts.vue", id: "supplier-products-test" });
assert.deepEqual(template.errors, []);
const { render: compiledRender } = evaluate(template.code, () => Vue);

const node = (tag, text = "") => ({ tag, text, props: {}, children: [], parent: null, style: {} });
const renderer = Vue.createRenderer({
  createElement: (tag) => node(tag), createText: (text) => node("#text", text), createComment: (text) => node("#comment", text),
  insert(child, parent, anchor) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
  },
  remove(child) { child.parent?.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
  setText: (element, text) => { element.text = text; },
  setElementText: (element, text) => { element.text = text; element.children = []; },
  patchProp: (element, key, _previous, value) => { element.props[key] = value; },
  parentNode: (element) => element.parent,
  nextSibling: (element) => element.parent?.children[element.parent.children.indexOf(element) + 1],
});
const descendants = (element) => [element, ...element.children.flatMap(descendants)];
const text = (element) => element.text + element.children.map(text).join("");
const stub = (tag = "div") => Vue.defineComponent({
  inheritAttrs: false,
  setup: (_props, { attrs, slots }) => () => Vue.h(tag, attrs, [slots.activator?.({ props: {} }), slots.default?.()]),
});
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
function fixture(t, { render = false } = {}) {
  const calls = { get: [], post: [], errors: [], success: [] };
  const axios = Object.fromEntries(["get", "post"].map((method) => [method, (url, payload) => new Promise((resolve, reject) => {
    calls[method].push({ url, payload, resolve: (data) => resolve({ data }), reject });
  })]));
  const { default: component } = evaluate(descriptor.script.content, (name) => {
    if (name === "lodash-es") return { throttle };
    if (name.includes("ProductMixin")) return { default: ProductMixin };
    if (name.includes("NotificationService")) return { default: {
      showErrorAlert: (...args) => calls.errors.push(args),
      showLaravelError: (...args) => calls.errors.push(args),
      showSuccessAlert: (...args) => calls.success.push(args),
    } };
    return { default: {} };
  }, {
    axios,
    window: { API: {
      GET_DROP_SHIPPING_SHOP_PRODUCTS: (shop, supplier) => `/shops/${shop}/reseller/shops/${supplier}/products`,
      POST_ADD_PRODUCT_BY_DROP_SHIPPING: (shop) => `/shops/${shop}/reseller/products/add`,
    } },
  });
  const shop = Vue.reactive({ id: 42, currency: "USD" });
  const supplier = Vue.reactive({ id: 91 });
  const components = Object.fromEntries(Array.from(template.code.matchAll(/resolveComponent\("([^"]+)"\)/g), ([, name]) => [name, stub(name === "v-btn" ? "button" : "div")]));
  for (const name of Object.keys(component.components)) components[name] = stub();
  components["v-data-table-server"] = { render: () => null };
  components["v-bottom-sheet"] = Vue.defineComponent({
    props: ["modelValue"],
    setup: (props, { attrs, slots }) => () => props.modelValue ? Vue.h("sheet", attrs, slots.default?.()) : null,
  });
  components["u-price"] = Vue.defineComponent({
    props: ["amount", "currency"],
    setup: (props) => () => Vue.h("price", { amount: props.amount, currency: props.currency }),
  });
  components.UPriceInput = Vue.defineComponent({
    props: ["modelValue", "currency"], emits: ["update:modelValue"],
    setup: (props, { attrs, emit }) => () => Vue.h("input", {
      ...attrs, value: props.modelValue, currency: props.currency,
      onInput: (event) => emit("update:modelValue", Number(event.target.value)),
    }),
  });
  components["u-price-input"] = components.UPriceInput;
  const app = renderer.createApp({ ...component, components, render: render ? compiledRender : () => null }, { shop, wholesalerShop: supplier });
  const failures = [], warnings = [];
  app.config.errorHandler = (error) => failures.push(error);
  app.config.warnHandler = (warning) => warnings.push(warning);
  Object.assign(app.config.globalProperties, {
    $route: { query: { dir: "fixture-category" } }, $t: (key) => key,
    $vuetify: { display: { width: 1200 } }, getShopImagePath: (value) => value,
    getCountryName: (code) => `Country ${code}`, numeralFormat: (value) => String(value),
    USER: () => ({ preferences: { dark: false } }),
  });
  app.directive("copy", {});
  const host = node("root");
  const state = app.mount(host);
  t.after(() => { if (!state.disposed) app.unmount(); assert.deepEqual(failures, []); assert.deepEqual(warnings, []); });
  const respond = async (index, products = [], total = products.length) => {
    calls.get[index].resolve({ error: false, products, total });
    await settle();
  };
  return { state, calls, respond, shop, supplier, app, host };
}
const product = () => Vue.reactive({
  id: 501, title: "Synthetic supplier product", currency: "EUR", price: 100, commission: 10,
  discount: 5, dis_start: null, dis_end: null, shipping: { DE: 4, US: 0 },
  product_variants: [
    { id: 601, pricing: true, currency: "EUR", price: 80, commission: 7, discount: 3, dis_start: null, dis_end: null },
    { id: 602, pricing: false, currency: "USD", price: 999, commission: 999, discount: 99 },
    { id: 603, pricing: true, currency: "EUR", price: 0, commission: 0, discount: 0 },
  ],
});

test("supplier product query preserves IDs, filters and server total for real pagination", async (t) => {
  const { state, calls, respond } = fixture(t);
  assert.equal(calls.get[0].url, "/shops/42/reseller/shops/91/products");
  assert.deepEqual(plain(calls.get[0].payload.params), {
    offset: 0, limit: 10, sortBy: null, sortDesc: true, sort: null,
    available: true, search: null, dir: null,
  });
  await respond(0, [{ id: 501 }], 31);
  assert.equal(state.total_products, 31);
  assert.equal(state.pageCount, 4);
  assert.deepEqual(plain(state.products), [{ id: 501 }]);
  state.sort = "fixture-sort";
  state.only_available = false;
  state.selected_folder = { id: 61 };
  state.page = 3;
  await settle();
  const query = calls.get.at(-1).payload.params;
  assert.equal(query.offset, 20);
  assert.equal(query.available, false);
  assert.equal(query.sort, "fixture-sort");
  assert.equal(query.dir, 61);
  await respond(calls.get.length - 1, [], 31);
});

test("sort and search reset pagination once, with a distinct cancelable throttle per instance", async (t) => {
  const first = fixture(t), second = fixture(t);
  await first.respond(0, [], 40);
  await second.respond(0);
  assert.notEqual(first.state.searchThrottled, second.state.searchThrottled);
  first.state.page = 3;
  await settle();
  await first.respond(1, [], 40);
  first.state.sortBy = [{ key: "price", order: "asc" }];
  await settle();
  assert.equal(first.state.page, 1);
  assert.equal(first.calls.get.length, 3);
  assert.equal(first.calls.get[2].payload.params.sortBy, "price");
  assert.equal(first.calls.get[2].payload.params.sortDesc, false);
  await first.respond(2, [], 40);
  first.state.page = 2;
  await settle();
  await first.respond(3, [], 40);
  first.state.search_in_shop = "synthetic query";
  await settle();
  assert.equal(first.state.page, 1);
  assert.equal(first.calls.get.length, 5);
  assert.equal(first.calls.get[4].payload.params.search, "synthetic query");
  first.state.search_in_shop = "new pending query";
  await settle();
  const count = first.calls.get.length;
  first.app.unmount();
  first.state.searchThrottled.flush();
  await settle();
  assert.equal(first.calls.get.length, count, "Unmount cancels the trailing search rather than querying an abandoned supplier");
  assert.equal(second.calls.get.length, 1);
});

test("denied and failed catalog loads stay errors until a successful retry, including an empty result", async (t) => {
  const { state, calls, respond } = fixture(t);
  calls.get[0].resolve({ error: true, error_msg: "Synthetic access denied" });
  await settle();
  assert.equal(state.busy_fetch, false);
  assert.equal(state.fetch_error, true);
  assert.equal(state.total_products, 0);
  assert.deepEqual(plain(state.products), []);
  assert.equal(calls.errors.length, 1);
  state.fetchProducts();
  assert.equal(state.busy_fetch, true);
  calls.get[1].reject(new Error("Synthetic network failure"));
  await settle();
  assert.equal(state.busy_fetch, false);
  assert.equal(state.fetch_error, true);
  assert.equal(calls.errors.length, 2);
  state.fetchProducts();
  await respond(2, [], 0);
  assert.equal(state.fetch_error, false);
  assert.equal(state.total_products, 0);
  assert.equal(state.pageCount, 1);
});

test("obsolete responses cannot overwrite a newer query, another shop/supplier or a disposed page", async (t) => {
  const { state, calls, respond, shop, supplier, app } = fixture(t);
  state.fetchProducts();
  await respond(1, [{ id: 2 }], 12);
  calls.get[0].reject(new Error("Obsolete query failed"));
  await settle();
  assert.deepEqual(plain(state.products), [{ id: 2 }]);
  assert.equal(state.busy_fetch, false);
  assert.equal(state.fetch_error, false);
  assert.equal(calls.errors.length, 0);
  state.fetchProducts();
  supplier.id = 92;
  await respond(2, [{ id: 3 }], 15);
  assert.deepEqual(plain(state.products), [{ id: 2 }]);
  state.fetchProducts();
  shop.id = 43;
  await respond(3, [{ id: 4 }], 16);
  assert.deepEqual(plain(state.products), [{ id: 2 }]);
  state.fetchProducts();
  assert.equal(calls.get[4].url, "/shops/43/reseller/shops/92/products");
  app.unmount();
  await respond(4, [{ id: 5 }], 17);
  assert.deepEqual(plain(state.products), [{ id: 2 }]);
  assert.equal(calls.errors.length, 0);
});

test("the native variant and main pricing paths retain discount, commission, zero and currency semantics", async (t) => {
  const { state, respond } = fixture(t);
  await respond(0);
  const item = product();
  state.showAddProduct(item);
  assert.equal(state.show_add_dialog, true);
  assert.equal(state.selected_variant.id, 601);
  assert.equal(state.selected_product_variant_pricing, item.product_variants[0]);
  assert.equal(state.commission, 7);
  assert.equal(state.discount, 3);
  assert.equal(state.net_price_without_commission, 77);
  state.selected_product_variant_pricing.commission = 12;
  assert.equal(state.net_price_without_commission, 77);
  assert.equal(item.commission, 10, "Editing a separately priced variant must not rewrite main commission");
  state.selected_variant = item.product_variants[1];
  assert.equal(state.selected_product_variant_pricing, item);
  assert.equal(state.commission, 10);
  assert.equal(state.discount, 5);
  assert.equal(state.net_price_without_commission, 95, "An unpriced variant inherits main EUR pricing despite its unused USD fields");
  state.selected_product_variant_pricing.commission = 14;
  assert.equal(item.commission, 14, "Editing an inherited variant updates shared main-product commission");
  assert.equal(state.net_price_without_commission, 95);
  state.selected_variant = item.product_variants[0];
  assert.equal(state.commission, 12, "The separately priced variant keeps its own edited commission");
  state.selected_variant = item.product_variants[1];
  assert.equal(state.commission, 14, "Switching away and back retains the main-product edit");
  state.selected_variant = item.product_variants[2];
  assert.equal(state.commission, 0);
  assert.equal(state.discount, 0);
  assert.equal(state.net_price_without_commission, 0);
  state.selected_variant = item.product_variants[0];
  state.selected_variant.dis_end = "2000-01-01T00:00:00Z";
  assert.equal(state.discount, 0);
  assert.equal(state.net_price_without_commission, 80);
  state.showAddProduct({ ...product(), id: 502, currency: "IRR", price: 10000, commission: 2000, discount: 500, product_variants: [] });
  assert.equal(state.selected_variant, null);
  assert.equal(state.net_price_without_commission, 9500, "Native IRR units are retained rather than silently converted to USD or Toman");
});

test("native add payload includes main and separately priced variant commissions and waits for server success", async (t) => {
  const { state, calls, respond } = fixture(t);
  await respond(0);
  state.addProduct();
  assert.equal(calls.post.length, 0);
  const item = product();
  state.showAddProduct(item);
  state.addProduct();
  state.addProduct();
  assert.equal(calls.post.length, 1);
  assert.equal(state.busy_add, true);
  assert.equal(calls.post[0].url, "/shops/42/reseller/products/add");
  assert.deepEqual(plain(calls.post[0].payload), {
    product_id: 501, category_id: "fixture-category", commission: 10,
    commissions: { 601: 7, 603: 0 },
  });
  calls.post[0].resolve({ error: true, error_msg: "Synthetic access denied" });
  await settle();
  assert.equal(state.busy_add, false);
  assert.equal(state.show_add_dialog, true);
  assert.equal(calls.success.length, 0);
  assert.equal(calls.errors.length, 1);
  state.addProduct();
  calls.post[1].reject(new Error("Synthetic offline"));
  await settle();
  assert.equal(state.busy_add, false);
  assert.equal(state.show_add_dialog, true);
  state.addProduct();
  calls.post[2].resolve({ error: false });
  await settle();
  assert.equal(state.busy_add, false);
  assert.equal(state.show_add_dialog, false);
  assert.equal(calls.success.length, 1);
  assert.equal(item.added_product_id, undefined, "The client must not invent a product ID before a real refreshed response");
});

test("the compiled review separates item pricing from destination shipping and preserves edits through native controls and Close", async (t) => {
  const { state, calls, respond, host } = fixture(t, { render: true });
  await respond(0);
  const item = product();
  state.showAddProduct(item);
  await settle();
  const sheet = () => descendants(host).find((element) => element.tag === "sheet");
  const hasClass = (element, name) => String(element.props.class || "").split(" ").includes(name);
  const section = (suffix) => descendants(sheet()).find((element) => hasClass(element, `b-product-dropshipping-review__${suffix}`));
  const prices = (element) => descendants(element).filter((child) => child.tag === "price").map((child) => [child.props.amount, child.props.currency]);
  const markup = () => descendants(sheet()).find((element) => element.tag === "input");
  const destination = (code) => descendants(section("shipping-table")).find((element) => element.tag === "tr" && text(element).includes(`Country ${code}`));
  const choose = async (index) => {
    section("variant-select").props["onUpdate:modelValue"](item.product_variants[index]);
    await settle();
  };
  const edit = async (value) => { markup().props.onInput({ target: { value } }); await settle(); };
  assert.deepEqual(prices(section("retail")), [[84, "EUR"]]);
  assert.deepEqual(prices(section("breakdown")), [[80, "EUR"], [-3, "EUR"], [77, "EUR"], [7, "EUR"]]);
  assert.deepEqual(prices(destination("DE")), [[4, "EUR"], [81, "EUR"]]);
  assert.deepEqual(prices(destination("US")), [[0, "EUR"], [77, "EUR"]]);
  assert.equal(markup().props.currency, "EUR");
  assert.equal(markup().props.value, 7);
  assert.match(text(sheet()), /review\.scope_variant/);
  assert.match(text(sheet()), /review\.excludes_shipping/);

  await edit(15);
  assert.equal(item.product_variants[0].commission, 15);
  assert.deepEqual(prices(section("retail")), [[92, "EUR"]]);
  assert.deepEqual(prices(destination("DE")), [[4, "EUR"], [81, "EUR"]], "Markup cannot increase the supplier amount including shipping");
  await choose(1);
  assert.equal(markup().props.value, 10);
  assert.match(text(sheet()), /review\.scope_main/);
  await edit(18);
  assert.equal(item.commission, 18);
  assert.deepEqual(prices(section("retail")), [[113, "EUR"]]);
  assert.deepEqual(prices(destination("DE")), [[4, "EUR"], [99, "EUR"]]);
  await choose(2);
  assert.equal(markup().props.value, 0);
  assert.deepEqual(prices(section("retail")), [[0, "EUR"]]);
  await choose(0);
  assert.equal(markup().props.value, 15);
  const snapshot = plain(item);
  const selected = state.selected_variant;
  const close = descendants(section("footer")).find((element) => element.tag === "button" && text(element) === "global.actions.close");
  assert.ok(close);
  close.props.onClick();
  await settle();
  assert.equal(state.show_add_dialog, false);
  assert.equal(state.selected_variant, selected);
  assert.deepEqual(plain(item), snapshot, "Close hides the sheet without rewriting or reverting native in-memory commissions");
  assert.equal(calls.post.length, 0);

  state.showAddProduct(item);
  await settle();
  assert.equal(markup().props.value, 15);
  const add = descendants(section("footer")).find((element) => element.tag === "button" && text(element).endsWith("review.add"));
  assert.ok(add);
  add.props.onClick();
  assert.deepEqual(plain(calls.post[0].payload), {
    product_id: 501, category_id: "fixture-category", commission: 18,
    commissions: { 601: 15, 603: 0 },
  });
  calls.post[0].resolve({ error: false });
  await settle();
  assert.equal(state.show_add_dialog, false);
});
