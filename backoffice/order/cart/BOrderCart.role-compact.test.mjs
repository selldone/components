import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { JSDOM } from "jsdom";

// The real cart template/styles and native array selection run without any application HTTP.
const calls = [];
const context = vm.createContext({});
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
  Object.assign(context, { exports, require });
  vm.runInContext(
    `(function(exports, require) { ${result.outputText}\n})(exports, require)`,
    context,
  );
  return exports;
}
const readCore = (path) =>
  readFileSync(new URL(`../../../../core-js/${path}`, import.meta.url), "utf8");
evaluate(readCore("prototypes/ArrayPrototypes.ts"));
const Basket = evaluate(
  readCore("models/shop/order/basket/basket.model.ts"),
  (name) => ({ default: name, Product: { ProductType: {} } }),
).Basket;
const BasketItemReturn = evaluate(
  readCore("models/shop/order/basket/basket_item_return.model.ts"),
).BasketItemReturn;
const ProductType = evaluate(
  readCore("enums/product/ProductType.ts"),
  (name) => (name.endsWith(".svg") ? { default: name } : { Basket }),
).ProductType;
const BillingPeriod = evaluate(
  readCore("enums/subscription/BillingPeriod.ts"),
).default;
const { OrderTypeCode } = evaluate(readCore("enums/order/OrderTypeCode.ts"));
const { BusinessModel } = evaluate(readCore("enums/shop/BusinessModel.ts"));

const leaf = (name) =>
  Vue.defineComponent({
    name,
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () => {
        calls.push({ name, attrs });
        if (name === "v-dialog" && !attrs.modelValue) return null;
        if (name === "v-data-table") {
          const headers = attrs["show-select"]
            ? [
                { key: "data-table-select", value: "data-table-select" },
                ...attrs.headers,
              ]
            : attrs.headers;
          return Vue.h(
            "div",
            { class: ["v-data-table", attrs.class] },
            Vue.h("div", { class: "v-table__wrapper" }, [
              Vue.h(
                "table",
                null,
                Vue.h(
                  "tbody",
                  null,
                  attrs.items.map((item, index) =>
                    Vue.h(
                      "tr",
                      {
                        class: [
                          "v-data-table__tr--mobile",
                          attrs["row-props"]({ item }).class,
                        ],
                      },
                      headers.map((header) => {
                        const column = {
                          ...header,
                          key: header.key || header.value,
                        };
                        const cell =
                          attrs["cell-props"]?.({ item, column }) || {};
                        return Vue.h(
                          "td",
                          {
                            ...cell,
                            class: [
                              cell.class,
                              {
                                "v-data-table__td--select-row":
                                  column.key === "data-table-select",
                              },
                            ],
                          },
                          [
                            Vue.h(
                              "div",
                              { class: "v-data-table__td-title" },
                              header.title,
                            ),
                            Vue.h(
                              "div",
                              { class: "v-data-table__td-value" },
                              slots[`item.${column.key}`]?.({ item, index }),
                            ),
                          ],
                        );
                      }),
                    ),
                  ),
                ),
              ),
              slots.bottom?.(),
            ]),
          );
        }
        const tag =
          name === "v-btn" ? "button" : name === "RouterLink" ? "a" : "span";
        return Vue.h(
          tag,
          {
            class: attrs.class,
            "aria-label": attrs["aria-label"],
            "aria-expanded": attrs["aria-expanded"],
            "aria-pressed": attrs["aria-pressed"],
            onClick: attrs.onClick,
          },
          [
            slots.activator?.({ props: {} }),
            slots.label?.(),
            slots.default?.(),
            name === "UTextDecimal" ? String(attrs.value) : null,
          ],
        );
      },
  });
function dependency(name) {
  if (name === "vue") return Vue;
  if (name.endsWith(".svg")) return { default: name };
  if (name === "@selldone/core-js") return { Basket, BasketItemReturn };
  if (name.includes("ProductType")) return { ProductType };
  if (name.includes("BillingPeriod")) return { default: BillingPeriod };
  if (name.includes("OrderTypeCode")) return { OrderTypeCode };
  if (name.includes("BusinessModel")) return { BusinessModel };
  if (name.includes("ShopOptionsHelper"))
    return {
      ShopOptionsHelper: { GetSizeUnit: () => "cm", GetMassUnit: () => "kg" },
    };
  if (name.includes("BasketHelper"))
    return {
      BasketHelper: {
        GetBasketItemWeight: (item) => item.product.weight,
        GetBasketItemSize: (item) => [
          item.product.width,
          item.product.length,
          item.product.height,
        ],
      },
    };
  return {
    default: name.endsWith(".vue")
      ? leaf(name.split("/").at(-1).replace(".vue", ""))
      : {},
  };
}
context.axios = new Proxy(
  {},
  { get: () => () => assert.fail("Role cart must not call an HTTP mutation") },
);
context.window = {
  API: new Proxy(
    {},
    {
      get: () => () =>
        assert.fail("Role cart must not construct a shop mutation URL"),
    },
  ),
};
const file = new URL("./BOrderCart.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), {
  filename: file.pathname,
});
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "cart-role-test",
});
assert.deepEqual(template.errors, []);
let css = "";
for (const block of descriptor.styles) {
  const result = await compileStyleAsync({
    source: block.content,
    filename: file.pathname,
    id: "data-v-cart-role-test",
    scoped: block.scoped,
    preprocessLang: block.lang,
  });
  assert.deepEqual(result.errors, []);
  css += result.code;
}
const Cart = {
  ...evaluate(descriptor.script.content, dependency).default,
  __scopeId: "data-v-cart-role-test",
  render: evaluate(template.code, dependency).render,
};
const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>");
const document = dom.window.document;
const style = document.createElement("style");
style.textContent = css;
document.head.append(style);
const renderer = Vue.createRenderer({
  createElement: (tag) => document.createElement(tag),
  createText: (text) => document.createTextNode(text),
  createComment: (text) => document.createComment(text),
  insert: (element, parent, anchor = null) =>
    parent.insertBefore(element, anchor),
  remove: (element) => element.parentNode?.removeChild(element),
  setText: (element, text) => {
    element.nodeValue = text;
  },
  setElementText: (element, text) => {
    element.textContent = text;
  },
  parentNode: (element) => element.parentNode,
  nextSibling: (element) => element.nextSibling,
  setScopeId: (element, id) => element.setAttribute(id, ""),
  patchProp: (element, key, previous, value) => {
    if (key.startsWith("on") && typeof value === "function") {
      if (previous)
        element.removeEventListener(key.slice(2).toLowerCase(), previous);
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "style" && typeof value === "object")
      Object.assign(element.style, value);
    else if (value !== undefined && value !== null)
      element.setAttribute(key, String(value));
  },
});
const fixtures = [
  {
    id: 31,
    check: true,
    count: 2,
    count_adjustment: -0.5,
    price: 0.00002884,
    offer_amount: 0.00000005,
    vendor_price: 0.00001234,
    currency: "BTC",
    tax: { amount: 0.00000002, shipping: 0.00000001, included: true },
    preferences: { dim_1: 12, dim_2: 34, dim_3: 56 },
    variant: {
      id: 41,
      sku: "VARIANT-SKU",
      mpn: "VARIANT-MPN",
      color: "#123456",
      size: "Large",
    },
    subscription_price: {
      title: "Care plan",
      description: "Full care plan",
      price: 0.0000001,
      currency: "BTC",
      period: "Monthly",
    },
    return_request: { state: "Pending", count: 1 },
    product: {
      id: 51,
      title: "Complete product title",
      title_en: "Complete secondary product title",
      icon: "/fixture-product.svg",
      sku: "PRODUCT-SKU",
      mpn: "PRODUCT-MPN",
      unit: "kg",
      unit_float: true,
      weight: 1.25,
      width: 5,
      length: 6,
      height: 7,
      original: true,
      warranty: "Full twenty four month manufacturer warranty",
      return_warranty: 14,
      price_input: "volume",
    },
  },
  {
    id: 32,
    check: false,
    count: 1,
    price: 0,
    currency: "USD",
    preferences: {
      valuation: { text: "Engrave this exact text", enabled: false },
    },
    product: {
      id: 52,
      title: "Personalized product",
      title_en: "Personalized secondary title",
      icon: null,
      sku: "CUSTOM-SKU",
      mpn: "CUSTOM-MPN",
      unit: "piece",
      weight: 0.5,
      width: 2,
      length: 3,
      height: 4,
      return_warranty: 0,
      price_input: "custom",
      valuation: {
        structure: [
          {
            name: "text",
            title: "Engraving",
            placeholder: "Exact customer engraving",
          },
          {
            name: "enabled",
            title: "Gift wrap",
            placeholder: "Requested wrapping",
          },
        ],
      },
    },
  },
];
function mount(overrides = {}, data = {}) {
  calls.length = 0;
  context.fixtureJson = JSON.stringify(fixtures);
  const items = vm.runInContext("JSON.parse(fixtureJson)", context);
  const props = {
    modern: true,
    isRolePanel: true,
    type: ProductType.PHYSICAL.code,
    shop: { id: 3, model: BusinessModel.NORMAL.code },
    basket: {
      id: 21,
      type: ProductType.PHYSICAL.code,
      status: Basket.Status.Payed.code,
      delivery_state: Basket.PhysicalOrderStates.CheckQueue.code,
    },
    items,
    checkable: true,
    ...overrides,
  };
  const app = renderer.createApp(
    {
      ...Cart,
      mixins: [],
      data() {
        return { ...Cart.data.call(this), ...data };
      },
    },
    props,
  );
  for (const name of [
    "v-data-table",
    "v-btn",
    "v-icon",
    "v-img",
    "v-avatar",
    "v-chip",
    "v-tooltip",
    "v-scale-transition",
    "v-row",
    "v-dialog",
    "v-bottom-sheet",
    "v-card",
    "v-card-title",
    "v-card-text",
    "v-card-actions",
    "v-pagination",
    "u-price",
    "u-check",
  ])
    app.component(name, leaf(name));
  app.component("router-link", leaf("RouterLink"));
  Object.assign(app.config.globalProperties, {
    $t: (key, values = {}) => key + (values.count ? ` ${values.count}` : ""),
    $route: { params: {}, matched: [] },
    IMAGE_SIZE_SMALL: 64,
    getShopImagePath: (path) => path,
    isBoolean: (value) => typeof value === "boolean",
  });
  const target = document.createElement("div");
  document.body.append(target);
  return { app, instance: app.mount(target), target, props };
}
const click = async (element) => {
  assert.ok(element);
  element.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
  await Vue.nextTick();
};
const cell = (row, key) =>
  row.querySelector(`.b-order-cart-role__cell--${key}`);
const display = (element) => dom.window.getComputedStyle(element).display;

test("compact rows retain the exact native fields and disclose each product independently", async () => {
  const mounted = mount();
  const rows = mounted.target.querySelectorAll(".b-order-cart-role-row");
  assert.equal(rows.length, 2);
  for (const row of rows) {
    assert.equal(display(cell(row, "variant")), "none");
    assert.equal(display(cell(row, "product-original")), "none");
    assert.equal(
      display(row.querySelector(".b-order-cart-table-modern__metadata")),
      "none",
    );
    assert.notEqual(display(cell(row, "count")), "none");
    assert.notEqual(display(cell(row, "price")), "none");
    assert.equal(
      row.querySelector("[aria-expanded]").getAttribute("aria-expanded"),
      "false",
    );
    assert.notEqual(
      display(
        row.querySelector(".b-order-cart-table-modern__price > .text-h4"),
      ),
      "none",
    );
  }
  const vendorDetails = rows[0].querySelector(
    ".b-order-cart-table-modern__price > div",
  );
  assert.equal(display(vendorDetails), "none");
  await click(rows[0].querySelector("[aria-expanded]"));
  assert.equal(rows[0].classList.contains("is-expanded"), true);
  assert.equal(rows[1].classList.contains("is-expanded"), false);
  assert.notEqual(display(cell(rows[0], "variant")), "none");
  assert.notEqual(display(cell(rows[0], "product-original")), "none");
  assert.notEqual(
    display(rows[0].querySelector(".b-order-cart-table-modern__metadata")),
    "none",
  );
  assert.notEqual(display(vendorDetails), "none");
  assert.equal(display(cell(rows[1], "variant")), "none");
  const text = rows[0].textContent;
  for (const value of [
    "Complete secondary product title",
    "P-51",
    "SVP-41",
    "VARIANT-SKU",
    "VARIANT-MPN",
    "1.25",
    "5 × 6 × 7",
    "12",
    "34",
    "56",
    "Care plan",
    "global.billing_period.Monthly",
    "global.commons.original",
    "Full twenty four month manufacturer warranty",
    "14",
    "global.commons.adjusted",
    "global.commons.available",
    "global.basket_list.return_count 1",
  ])
    assert.ok(text.includes(value), value);
  assert.ok(
    calls.some(
      ({ name, attrs }) =>
        name === "VariantItemViewMicro" &&
        attrs["product-variant"].size === "Large",
    ),
  );
  await click(rows[0].querySelector("[aria-expanded]"));
  assert.equal(display(cell(rows[0], "variant")), "none");
  assert.equal(
    rows[0].querySelector("[aria-expanded]").getAttribute("aria-expanded"),
    "false",
  );
  mounted.app.unmount();
});

test("exact line amounts, tax, vendor, offer and fractional quantity stay native", () => {
  const mounted = mount();
  const prices = calls
    .filter(({ name }) => name === "u-price")
    .map(({ attrs }) => ({ amount: attrs.amount, currency: attrs.currency }));
  for (const amount of [
    2 * fixtures[0].price - fixtures[0].offer_amount,
    fixtures[0].vendor_price,
    fixtures[0].offer_amount,
    fixtures[0].tax.amount,
    fixtures[0].tax.shipping,
    fixtures[0].subscription_price.price,
  ])
    assert.ok(
      prices.some(
        (price) => price.amount === amount && price.currency === "BTC",
      ),
      String(amount),
    );
  assert.ok(
    prices.some(({ amount, currency }) => amount === 0 && currency === "USD"),
  );
  assert.ok(
    calls.some(
      ({ name, attrs }) =>
        name === "UTextDecimal" && attrs.value === 1.5 && attrs.decimals === 3,
    ),
  );
  mounted.app.unmount();
});

test("item selection stays separate from disclosure and role quantity writes stay unavailable", async () => {
  const mounted = mount(),
    state = mounted.instance;
  const rows = mounted.target.querySelectorAll(".b-order-cart-role-row");
  assert.deepEqual(
    Array.from(state.getCheckedItems(), ({ id }) => id),
    [31],
  );
  await click(rows[1].querySelector("[aria-pressed]"));
  assert.deepEqual(
    Array.from(state.getCheckedItems(), ({ id }) => id),
    [31, 32],
  );
  assert.equal(rows[1].classList.contains("is-expanded"), false);
  await click(rows[1].querySelector("[aria-expanded]"));
  assert.deepEqual(
    Array.from(state.getCheckedItems(), ({ id }) => id),
    [31, 32],
  );
  await click(rows[0].querySelector("[aria-pressed]"));
  await click(rows[1].querySelector("[aria-pressed]"));
  assert.equal(state.getCheckedItems().length, 0);
  assert.equal(state.can_set_count_adjustment, false);
  state.showCountAdjustmentDialog(fixtures[0]);
  state.setCountAdjustment();
  assert.equal(state.count_adjustment_dialog, false);
  assert.equal(state.busy_set_count_adjustment, false);
  assert.ok(!calls.some(({ name }) => name === "v-bottom-sheet"));
  mounted.app.unmount();
});

test("custom preferences and booleans remain available through readonly valuation details", async () => {
  const mounted = mount(),
    state = mounted.instance;
  const row = mounted.target.querySelectorAll(".b-order-cart-role-row")[1];
  assert.equal(
    display(row.querySelector(".b-order-cart-table-modern__valuation")),
    "none",
  );
  await click(row.querySelector("[aria-expanded]"));
  assert.notEqual(
    display(row.querySelector(".b-order-cart-table-modern__valuation")),
    "none",
  );
  for (const value of [
    "CUSTOM-SKU",
    "CUSTOM-MPN",
    "Personalized secondary title",
    "Engraving",
    "Engrave this exact text",
    "Gift wrap",
    "global.no_return_warranty",
  ])
    assert.ok(row.textContent.includes(value), value);
  assert.ok(
    calls.some(
      ({ name, attrs }) => name === "u-check" && attrs.value === false,
    ),
  );
  state.showCustomizeDetail(state.items[1]);
  await Vue.nextTick();
  const valuation = calls.findLast(
    ({ name }) => name === "SProductSectionValuation",
  );
  assert.ok(valuation);
  assert.equal(valuation.attrs.readonly, "");
  assert.equal(
    valuation.attrs.preferences.valuation.text,
    "Engrave this exact text",
  );
  assert.equal(valuation.attrs.product.id, 52);
  mounted.app.unmount();
});

test("ordinary shop carts retain their existing row behavior and selection initialization", () => {
  const mounted = mount({ isRolePanel: false, selectAll: true });
  assert.equal(
    mounted.target.querySelectorAll(".b-order-cart-role-row").length,
    0,
  );
  assert.equal(mounted.target.querySelector("[aria-expanded]"), null);
  assert.equal(mounted.instance.can_set_count_adjustment, true);
  assert.deepEqual(
    Array.from(mounted.instance.getCheckedItems(), ({ id }) => id),
    [31, 32],
  );
  mounted.app.unmount();
});
