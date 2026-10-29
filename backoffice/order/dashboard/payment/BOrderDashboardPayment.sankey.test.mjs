import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import numeral from "numeral";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import createSankey from "../../../../ui/chart/sankey/svg/sankey.js";

// Exercise the real presentation model and currency mixin without a shop connection.
const repository = new URL("../../../../../", import.meta.url);
function evaluate(source, require) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, require },
  );
  return exports;
}
const read = (path) => readFileSync(new URL(path, repository), "utf8");
const { Currency } = evaluate(
  read("core-js/enums/payment/Currency.ts"),
  (path) => ({ default: path }),
);
const { Basket } = evaluate(
  read("core-js/models/shop/order/basket/basket.model.ts"),
  (path) => ({ default: path }),
);
const { ProductType } = evaluate(
  read("core-js/enums/product/ProductType.ts"),
  (path) => (path.endsWith("/models") ? { Basket } : { default: path }),
);
const { TransactionStatus } = evaluate(
  read("core-js/enums/payment/TransactionStatus.ts"),
  (path) => ({ default: path }),
);
const objectHelpers = {
  isObject: (value) => value !== null && typeof value === "object",
  isString: (value) => typeof value === "string",
};
const { CurrencyHelper } = evaluate(
  read("core-js/helper/currency/CurrencyHelper.ts"),
  (path) => {
    if (path.includes("/Currency")) return { Currency };
    if (path === "lodash-es") return objectHelpers;
    return {};
  },
);
const currencyMixin = evaluate(
  read("components-vue/mixin/currency/CurrencyMixin.ts"),
  (path) => {
    if (path.includes("/Currency")) return { Currency };
    if (path === "@selldone/core-js/helper") return { CurrencyHelper };
    if (path === "lodash-es") return objectHelpers;
    if (path === "numeral") return { default: numeral };
    return {};
  },
).default;
const file = new URL("./BOrderDashboardPayment.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "payment-sankey-test",
});
assert.deepEqual(template.errors, []);
for (const block of descriptor.styles) {
  const result = await compileStyleAsync({
    source: block.content,
    filename: file.pathname,
    id: "payment-sankey-test",
    scoped: block.scoped,
    preprocessLang: block.lang,
  });
  assert.deepEqual(result.errors, []);
}
const component = evaluate(descriptor.script.content, (path) => {
  if (path.endsWith("/CurrencyMixin.ts")) return { default: currencyMixin };
  if (path.endsWith("/CurrencyHelper")) return { CurrencyHelper };
  if (path.endsWith("/Currency")) return { Currency };
  if (path.endsWith("/ProductType")) return { ProductType };
  if (path.endsWith("/TransactionStatus")) return { TransactionStatus };
  if (path.endsWith("/core/sankey.js")) return { default: () => ({}) };
  if (path === "@selldone/core-js")
    return {
      Basket,
      Bill: { Status: {} },
      ShopOptionsHelper: { GetCheckout: () => ({}) },
    };
  return { default: {} };
}).default;
function fixture(overrides = {}, modern = true) {
  const order = {
    price: 100,
    discount: 0,
    delivery_price: 0,
    tax: 5,
    tax_shipping: 0,
    currency: "USD",
    items: [],
    gift_cards: [],
    payment: { amount: 100 },
    ...overrides,
  };
  if (order.bills) {
    // The application installs this Array extension; sorting does not change the paid sum.
    Object.defineProperty(order.bills, "sortByKey", {
      value: () => order.bills,
    });
  }
  const state = {
    modern,
    order,
    shop: {},
    $t: (key) => (key === "global.currency.IRR_alt" ? "Toman" : key),
    ...objectHelpers,
  };
  for (const mixin of component.mixins) {
    for (const [name, method] of Object.entries(mixin.methods ?? {}))
      state[name] = method.bind(state);
  }
  // Isolate the saved user preference; real formatting must still use the order's currency.
  state.GetUserSelectedCurrency = () => Currency.EUR;
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) {
    if (name !== "payment_sankey_data")
      Object.defineProperty(state, name, { get: () => getter.call(state) });
  }
  state.payment_sankey_data =
    component.computed.payment_sankey_data.call(state);
  return state;
}
const name = (key) => `global.commons.${key}`;
const numericLinks = (data) =>
  Array.from(data.links, ({ source, target, value }) => ({
    source,
    target,
    value,
  }));
const node = (data, key) => data.nodes.find((item) => item.name === name(key));
const incentives = {
  discount: 25,
  delivery_price: 15,
  tax: -2,
  tax_shipping: -1,
  discount_order: { amount_discount: 4 },
  coupon_order: { amount_discount: 3 },
  club_order: { amount_discount: 2 },
  lottery_order: { amount_discount: 1 },
  offer_orders: [{ amount_discount: 2 }],
  items: [{ cross_dis: 5 }],
};
for (const values of [
  { price: 0, tax: 0, payment: null },
  { delivery_price: 10, tax_shipping: 2 },
  { ...incentives, payment: null },
  incentives,
  {
    payment: { amount: 999 },
    bills: [
      { id: 1, payment: { amount: 40 } },
      { id: 2, payment: { amount: 60 } },
      { id: 3 },
    ],
    gift_cards: [{ amount: 7 }, { amount: 3 }],
  },
  { payment: { amount: 10 }, tax: 20 },
  { payment: { amount: -10 }, tax: -2 },
]) {
  const state = fixture(values);
  const legacy = state.payment_sankey_data;
  const before = JSON.stringify(legacy);
  const shown = state.payment_sankey_chart_data;
  assert.deepEqual(
    numericLinks(shown),
    numericLinks(legacy),
    "Presentation preserves every endpoint and numeric link, including existing negative values",
  );
  assert.deepEqual(
    Array.from(shown.nodes, (item) => item.name),
    Array.from(legacy.nodes, (item) => item.name),
  );
  assert.equal(
    JSON.stringify(legacy),
    before,
    "The legacy graph is never recolored or annotated in place",
  );
  for (const link of shown.links) {
    const target = shown.nodes.find((item) => item.name === link.target);
    assert.equal(link.sourceColor, target.color);
    assert.equal(link.targetColor, target.color);
  }
  state.modern = false;
  assert.equal(
    state.payment_sankey_chart_data,
    legacy,
    "Legacy callers receive their original graph object",
  );
}
const unpaid = fixture({ price: 0, tax: 0, payment: null });
assert.equal(unpaid.payment_sankey_data.links[0].value, 0.001);
assert.equal(
  node(unpaid.payment_sankey_chart_data, "items").amount,
  0,
  "Layout epsilon is excluded from displayed amounts",
);
const paid = fixture({ delivery_price: 10, tax_shipping: 2 });
assert.equal(node(paid.payment_sankey_chart_data, "payment").amount, 100);
assert.equal(node(paid.payment_sankey_chart_data, "you").amount, 93);
assert.equal(
  node(
    fixture({ payment: { amount: 10 }, tax: 20 }).payment_sankey_chart_data,
    "you",
  ).amount,
  0,
);
const optional = fixture(incentives).payment_sankey_chart_data;
for (const [key, amount] of Object.entries({
  tax: 2,
  shipping_tax: 1,
  delivery: 15,
  discount: 8,
  discount_code: 4,
  coupon: 3,
  club: 2,
  lottery: 1,
  cross_sell: 5,
  incentives: 23,
})) {
  assert.equal(node(optional, key).amount, amount);
}
const bills = fixture({
  payment: { amount: 999 },
  bills: [{ payment: { amount: 40 } }, { payment: { amount: 60 } }],
  gift_cards: [{ amount: 10 }],
});
assert.equal(bills.total_payed, 110);
assert.equal(node(bills.payment_sankey_chart_data, "payment").amount, 110);

// Real CurrencyMixin precision, symbols, alternative units and merchant placement rules.
const money = fixture();
assert.equal(money.formatSankeyAmount(1234.5), "$1,234.50");
assert.equal(money.formatSankeyAmount(0), "$0.00");
assert.equal(money.formatSankeyAmount(-12.5), "$-12.50");
money.order.currency = "BTC";
assert.equal(money.formatSankeyAmount(0.123456), "₿0.123456");
money.order.currency = "IRR";
assert.equal(money.formatSankeyAmount(12340), "Toman1,234");
money.shop.theme = { reverse_currency: true };
assert.equal(money.formatSankeyAmount(12340), "1,234 Toman");

const modernRenderer = createSankey();
paid.configurePaymentSankey({ sankey: () => modernRenderer });
assert.equal(modernRenderer.sankey().nodeWidth(), 7);
assert.equal(modernRenderer.sankey().nodePadding(), 32);
assert.equal(modernRenderer.sankey().nodeSort(), null);
assert.equal(modernRenderer.nodeDraggableY()({}), true);
assert.equal(
  modernRenderer.nodeValueLabel()(
    node(paid.payment_sankey_chart_data, "payment"),
  ),
  "$100.00",
);
const legacyRenderer = createSankey();
fixture({}, false).configurePaymentSankey({ sankey: () => legacyRenderer });
assert.equal(legacyRenderer.nodeValueLabel()({ amount: 100 }), null);
assert.equal(legacyRenderer.sankey().nodePadding(), 7);

const compiledRender = evaluate(template.code, (path) =>
  path === "vue" ? Vue : "/static/user.svg",
).render;
async function paymentScreen(
  overrides = {},
  { modern = true, role = false, vendor = false, brokenAvatars = false } = {},
) {
  const order = {
    type: ProductType.PHYSICAL.code,
    status: "Payed",
    delivery_state: "OrderConfirm",
    price: 100,
    discount: 0,
    delivery_price: 0,
    tax: 5,
    tax_shipping: 0,
    currency: "USD",
    items: [],
    gift_cards: [],
    transactions_pending: [],
    payment: {
      amount: 100,
      currency: "USD",
      status: "Succeeded",
      livemode: true,
      risk: 0,
    },
    ...overrides,
  };
  const passthrough = {
    inheritAttrs: false,
    setup:
      (_, { slots, attrs }) =>
      () =>
        Vue.h("div", attrs, [
          slots.title?.(),
          slots.actions?.(),
          slots.default?.(),
        ]),
  };
  const button = {
    inheritAttrs: false,
    props: ["to"],
    setup:
      (props, { attrs, slots }) =>
      () =>
        Vue.h(
          props.to ? "a" : "button",
          {
            ...attrs,
            "data-route": props.to ? JSON.stringify(props.to) : undefined,
          },
          slots.default?.(),
        ),
  };
  const components = Object.fromEntries(
    Object.keys(component.components).map((key) => [
      key,
      { render: () => null },
    ]),
  );
  components.UWidgetHeader = passthrough;
  components.UPaymentRiskIndicator = {
    props: ["risk"],
    setup: (props) => () =>
      Vue.h("output", { "data-risk": String(props.risk) }, String(props.risk)),
  };
  const app = Vue.createSSRApp(
    {
      ...component,
      components,
      render: compiledRender,
      methods: {
        ...component.methods,
        GetUserSelectedCurrency: () => Currency.EUR,
        getUserAvatar: (id) => `/avatar/${id}.png`,
        getShopImagePath: (path) => (path ? `/gateway/${path}` : undefined),
        getLocalTimeString: (value) => value ?? "",
        getFromNowString: (value) => value ?? "",
      },
    },
    {
      order,
      modern,
      isRolePanel: role,
      shop: { shop_gateways: [], accounts: [] },
    },
  );
  const image = {
    inheritAttrs: false,
    props: ["src", "alt"],
    setup:
      (props, { slots }) =>
      () =>
        brokenAvatars
          ? Vue.h("span", { "data-image-error": props.src }, slots.error?.())
          : Vue.h("img", { src: props.src, alt: props.alt }),
  };
  const special = {
    "v-btn": button,
    "router-link": button,
    "v-dialog": { setup: () => () => null },
    "v-img": image,
  };
  const names = new Set([
    ...Array.from(
      template.code.matchAll(/resolveComponent\("([^"]+)"/g),
      (match) => match[1],
    ),
    ...Object.keys(special),
  ]);
  for (const name of names) app.component(name, special[name] ?? passthrough);
  app.directive("copy", { getSSRProps: () => ({}) });
  app.provide("$shop", {});
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $tm: () => [],
    $route: {
      params: vendor ? { vendor_id: 9 } : {},
      matched: [{ meta: { vendor } }],
    },
    $vuetify: { display: { smAndDown: false } },
    require: () => "/static/user.svg",
    ...objectHelpers,
  });
  return new JSDOM(await renderToString(app)).window.document;
}
const buyer = {
  id: 11,
  name: "Same name",
  email: "buyer@example.test",
  phone: "1100",
};
const customer = {
  id: 42,
  user_id: 22,
  name: "Same name",
  email: "customer@example.test",
  phone: "2200",
};
const identities = { buyer, customer, customer_id: 42 };
const profiles = (document) =>
  [...document.querySelectorAll("a[data-route]")].filter((link) =>
    link.getAttribute("aria-label")?.includes("_profile"),
  );
const full = await paymentScreen(identities);
assert.equal(profiles(full).length, 2);
for (const link of profiles(full)) {
  assert.deepEqual(JSON.parse(link.getAttribute("data-route")), {
    name: "BPageCustomerDashboard",
    params: { customer_id: 42 },
  });
  assert.equal(link.getAttribute("target"), "_blank");
  assert.equal(link.getAttribute("rel"), "noopener noreferrer");
}
for (const id of [11, 22])
  assert(full.querySelector(`img[src="/avatar/${id}.png"]`));
assert.equal(
  (full.body.textContent.match(/Same name/g) ?? []).length,
  2,
  "Modern buyer and customer names remain readable even when identical",
);
for (const restrictions of [{ role: true }, { vendor: true }]) {
  assert.equal(
    profiles(await paymentScreen(identities, restrictions)).length,
    0,
  );
}
assert.equal(
  profiles(await paymentScreen({ buyer })).length,
  0,
  "A buyer user ID never becomes a shop customer route",
);
const customerOnly = await paymentScreen({ customer, customer_id: 42 });
assert.equal(profiles(customerOnly).length, 1);
assert.equal(
  customerOnly.body.textContent.includes("global.commons.guest"),
  false,
);
assert(customerOnly.querySelector('img[src="/avatar/22.png"]'));
const guest = await paymentScreen({ guest_email: "guest@example.test" });
assert(guest.body.textContent.includes("global.commons.guest"));
assert(guest.body.textContent.includes("guest@example.test"));
assert(guest.querySelector('img[src="/static/user.svg"]'));
const missingAvatar = await paymentScreen({
  customer: { ...customer, user_id: null },
  customer_id: 42,
});
assert.equal(missingAvatar.querySelectorAll('img[src^="/avatar/"]').length, 0);
assert(missingAvatar.body.textContent.includes("person_outline"));
const failedAvatar = await paymentScreen(identities, { brokenAvatars: true });
assert.equal(failedAvatar.querySelectorAll("[data-image-error]").length, 2);
assert.equal(
  (failedAvatar.body.textContent.match(/person_outline/g) ?? []).length,
  2,
);
for (const risk of [0, 45, null, undefined]) {
  const document = await paymentScreen({
    payment: {
      amount: 100,
      currency: "USD",
      status: "Succeeded",
      livemode: true,
      risk,
    },
  });
  assert.equal(
    document.querySelectorAll("output[data-risk]").length,
    risk == null ? 0 : 1,
  );
  if (risk != null)
    assert.equal(
      document.querySelector("output[data-risk]").textContent,
      String(risk),
    );
  assert(
    document.body.textContent.includes(
      risk == null
        ? "process_center.modern.risk_not_recorded"
        : "process_center.modern.risk_review",
    ),
  );
}
const gateway = {
  name: "Sample provider",
  logo: "sample.svg",
  code: "SAMPLE-USD",
  enable: true,
  currency: "USD",
};
const withGateway = await paymentScreen({
  payment: {
    amount: 100,
    currency: "USD",
    status: "Succeeded",
    livemode: true,
    gateway,
  },
});
assert(withGateway.body.textContent.includes("SAMPLE-USD"));
assert(withGateway.body.textContent.includes("global.commons.online"));
assert(
  withGateway
    .querySelector('span[tabindex="0"]')
    ?.textContent.includes("global.commons.online"),
  "The gateway-status explanation remains reachable by keyboard focus",
);
assert(
  withGateway.body.textContent.includes(
    "process_center.modern.gateway_enabled",
  ),
);
const withoutCode = await paymentScreen({
  payment: {
    amount: 100,
    currency: "USD",
    status: "Succeeded",
    gateway: { ...gateway, code: null, enable: false },
  },
});
assert.equal(
  withoutCode.body.textContent.includes("process_center.modern.gateway_code"),
  false,
);
assert(
  withoutCode.body.textContent.includes(
    "process_center.modern.gateway_disabled",
  ),
);
const oldScreen = await paymentScreen(identities, { modern: false });
assert.equal(profiles(oldScreen).length, 0);
assert.equal((oldScreen.body.textContent.match(/Same name/g) ?? []).length, 1);
assert.equal(
  oldScreen.body.textContent.includes("process_center.modern.risk_review"),
  false,
);
console.log(
  "Payment: Sankey/currency preservation, gated buyer/customer/guest routes, avatar fallbacks, optional gateway metadata and zero/missing risk passed.",
);
