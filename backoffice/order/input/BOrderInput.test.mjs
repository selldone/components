import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const filename = new URL("./BOrderInput.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const exports = {};
vm.runInNewContext(ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports, require: () => ({ default: {} }) });
const component = exports.default;
const template = compileTemplate({
  source: descriptor.template.content, filename: filename.pathname, id: "order-input-test",
});
assert.deepEqual(template.errors, []);
const compiled = {};
vm.runInNewContext(ts.transpileModule(template.code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: compiled, require: () => Vue });

const passthrough = { setup: (_, { slots }) => () => Vue.h("div", slots.default?.()) };
async function render(basket, props = {}, appendItem) {
  const forms = [], links = [], codeCalls = [], variants = [];
  const target = { ...component, components: {}, render: compiled.render };
  const app = Vue.createSSRApp({
    render: () => Vue.h(target, { shop: { id: 7 }, basket, ...props },
      appendItem ? { "append-item": appendItem } : {}),
  });
  app.component("u-widget-header", {
    props: ["title", "to"], setup(props) {
      if (props.to) links.push(props.to);
      return () => Vue.h("h2", props.title);
    },
  });
  for (const name of ["v-list-subheader", "v-list-item", "v-avatar", "v-icon", "v-row", "u-text-value-box"])
    app.component(name, passthrough);
  app.component("variant-item-view-micro", {
    props: ["productVariant"], setup(props) { variants.push(props.productVariant); return () => null; },
  });
  app.component("v-btn", {
    props: ["to"], setup(props, { slots }) {
      if (props.to) links.push(props.to);
      return () => Vue.h("a", { "data-product-id": props.to?.params.product_id }, slots.default?.());
    },
  });
  app.component("basket-item-user-message-form", {
    props: { basket: Object, product: Object, variantId: Number, readonly: Boolean, isAdmin: Boolean, forceShow: Boolean, modern: Boolean },
    setup(props) { forms.push(props); return () => Vue.h("div", "Customer response"); },
  });
  app.directive("copy", {});
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    getShopImagePath: (path, size) => `/test-images/${size}/${path}`,
    getBasketOrderCode(order) { codeCalls.push(order); return `${props.isFulfillment ? "DS" : "SM"}-${order.id}`; },
  });
  const html = await renderToString(app);
  return { html, forms, links, codeCalls, variants, document: new JSDOM(html).window.document };
}

test("orders with no available product schema render an explicit empty state", async () => {
  for (const basket of [null, {}, { items: [] }, { items: [{ id: 1, product: null }, { id: 2, product: {} }] }]) {
    const { html, forms } = await render(basket);
    assert.match(html, /role="status"/);
    assert.match(html, /order_input.empty_title/);
    assert.match(html, /order_input.empty_message/);
    assert.equal(forms.length, 0);
  }
});

test("available reseller inputs and native output items retain their exact identity and read-only form", async () => {
  const items = [
    { id: 3, product_id: 31, variant_id: 9, count: 2, product: { id: 31, title: "Input product", inputs: [{ name: "engraving" }], parent: { id: 900 } } },
    { id: 4, count: 1, product: { id: 32, title: "Output product", outputs: [{ name: "license" }] } },
  ];
  const basket = { id: 11, items: [{ id: 1, product: null }, ...items] };
  const { html, forms } = await render(basket);
  assert.doesNotMatch(html, /order_input.empty_title/);
  assert.equal(forms.length, 2);
  forms.forEach((form, index) => {
    assert.equal(form.basket, basket);
    assert.equal(form.product, items[index].product);
    assert.equal(form.variantId, items[index].variant_id);
    assert.equal(form.readonly, true);
    assert.equal(form.isAdmin, true);
    assert.equal(form.forceShow, true);
    assert.equal(form.modern, false);
  });
});

test("missing file projection is explained without claiming no files were submitted", async () => {
  const product = { id: 31, title: "Custom product", inputs: [{ name: "artwork", title: "Artwork", type: "file" }] };
  const item = { id: 3, product_id: 31, count: 1, product };
  const missing = await render({ id: 11, items: [item] });
  assert.match(missing.html, /Artwork/);
  assert.match(missing.html, /order_input.files_unavailable/);
  for (const files of [[], [{ id: 2, key: "artwork" }]]) {
    const projected = await render({ id: 11, items: [{ ...item, files }] });
    assert.doesNotMatch(projected.html, /order_input.files_unavailable/);
  }
});

test("modern supplier forms preserve reseller answers while linking only to the supplier product", async () => {
  const item = {
    id: 3, product_id: 31, variant_id: 9, count: 3, variant: { id: 9, color: "red" },
    message: { engraving: "Milo", gift: false },
    product: {
      id: 31, title: "Original reseller product", title_en: "Product subtitle", icon: "product.png",
      sku: "SKU-31", mpn: "MPN-31", inputs: [{ name: "engraving" }], parent: { id: 900, title: "Supplier product" },
    },
  };
  const basket = { id: 11, type: "FUL", items: [item] };
  const snapshot = structuredClone(basket);
  const appended = [];
  const view = await render(basket, { modern: true, isFulfillment: true }, ({ item }) => {
    appended.push(item);
    return Vue.h("div", { "data-output": item.id }, "Existing item output");
  });
  assert.equal(view.document.querySelector("h1").textContent, "order_input.title");
  assert.match(view.document.querySelector(".b-order-input__breadcrumb").textContent, /global.commons.fulfillments.*DS-11/);
  assert.match(view.document.querySelector(".b-order-input__readonly").textContent, /order_input.read_only/);
  assert.equal(view.document.querySelector(".b-order-input__identity h2").textContent, item.product.title);
  assert.equal(view.document.querySelector("img").getAttribute("src"), "/test-images/128/product.png");
  assert.equal(view.document.querySelector(".b-order-input__quantity strong").textContent, "3");
  const details = view.document.querySelector("details");
  assert.ok(details.querySelector("summary"));
  assert.equal(details.hasAttribute("open"), false);
  assert.match(details.textContent, /SKU-31/);
  assert.match(details.textContent, /MPN-31/);
  assert.deepEqual(view.links.map((link) => JSON.parse(JSON.stringify(link))), [
    { name: "BPageProductDashboard", params: { product_id: 900 } },
  ]);
  assert.equal(view.forms[0].basket, basket);
  assert.equal(view.forms[0].product, item.product);
  assert.equal(view.forms[0].variantId, 9);
  assert.equal(view.forms[0].modern, true);
  assert.equal(view.forms[0].readonly, true);
  assert.equal(view.forms[0].forceShow, true);
  assert.equal(view.forms[0].isAdmin, false);
  assert.equal(view.variants[0], item.variant);
  assert.equal(view.codeCalls[0], basket);
  assert.equal(appended[0], item);
  assert.equal(view.document.querySelector('[data-output="3"]').textContent, "Existing item output");
  assert.deepEqual(basket, snapshot);
});

test("modern supplier forms omit unsupported product links and explain missing attachments", async () => {
  const item = {
    id: 3, product_id: 31, count: 1,
    product: { id: 31, title: "Custom product", inputs: [{ name: "artwork", title: "Artwork", type: "file" }] },
  };
  const view = await render({ id: 11, items: [item] }, { modern: true, isFulfillment: true });
  assert.equal(view.links.length, 0);
  assert.match(view.document.querySelector('[role="status"]').textContent, /Artwork.*order_input.files_unavailable/);
  for (const files of [[], [{ id: 2, key: "artwork" }]]) {
    const projected = await render({ id: 11, items: [{ ...item, files }] }, { modern: true, isFulfillment: true });
    assert.doesNotMatch(projected.html, /order_input.files_unavailable/);
  }
});

test("modern retail forms share the composition without losing native file access or output slots", async () => {
  const item = { id: 4, product_id: 32, count: 1, files: [], product: { id: 32, title: "Virtual output", outputs: [{ name: "license" }] } };
  const view = await render({ id: 12, items: [item] }, { modern: true }, ({ item }) => Vue.h("div", { "data-output": item.id }, "License output"));
  assert.match(view.document.querySelector(".b-order-input__breadcrumb").textContent, /order_input.order_label.*SM-12/);
  assert.equal(view.forms[0].isAdmin, true);
  assert.equal(view.forms[0].modern, true);
  assert.equal(view.forms[0].readonly, true);
  assert.equal(view.links[0].params.product_id, 32);
  assert.equal(view.document.querySelector('[data-output="4"]').textContent, "License output");
});

test("modern empty orders retain a named page and an explicit empty state", async () => {
  for (const basket of [null, { id: 11, items: [] }, { id: 11, items: [{ id: 1, product: null }] }]) {
    const view = await render(basket, { modern: true, isFulfillment: true });
    assert.equal(view.document.querySelector("h1").textContent, "order_input.title");
    assert.match(view.document.querySelector('[role="status"]').textContent, /order_input.empty_title.*order_input.empty_message/);
    assert.equal(view.forms.length, 0);
    assert.equal(view.links.length, 0);
  }
});
