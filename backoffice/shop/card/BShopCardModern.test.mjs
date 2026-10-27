import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import ts from "typescript";

// Actual SFCs and native memory routing; chart rendering and file URLs are isolated leaves.
const browser = new JSDOM("<!doctype html><html><body></body></html>");
for (const key of [
  "window",
  "document",
  "history",
  "Element",
  "SVGElement",
  "HTMLElement",
  "Node",
])
  globalThis[key] = browser.window[key];
const Vue = await import("vue");
const { createMemoryHistory, createRouter } = await import("vue-router");
const { renderToString } = await import("vue/server-renderer");
const contexts = new Map(),
  styleCodes = new Map(),
  controls = [],
  loaded = new Map(),
  styleChecks = [];
const kinds = ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"];
const queueKinds = [...kinds, "AVOCADO"];
const ProductType = Object.fromEntries(
  kinds.map((code, i) => [
    code,
    {
      code,
      name: "type." + code,
      image: `/fixture/${code}.svg`,
      color: ["#345", "#456", "#567", "#678", "#789"][i],
    },
  ]),
);
function leaf(name) {
  return Vue.defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        controls.push({ name, attrs });
        if (name === "UPrice")
          return Vue.h(
            "span",
            { "data-amount": attrs.amount, "data-currency": attrs.currency },
            String(attrs.amount),
          );
        if (name === "v-list-item" && attrs.to)
          return Vue.h(
            Vue.resolveComponent("router-link"),
            { ...attrs, "data-leaf": name },
            () => [slots.prepend?.(), attrs.title, slots.default?.()],
          );
        return Vue.h("div", { ...attrs, "data-leaf": name }, [
          slots.activator?.({ props: {} }),
          slots.default?.({ isActive: { value: false }, props: {} }),
        ]);
      };
    },
  });
}
function evaluate(source) {
  const exports = {};
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(output.diagnostics, []);
  vm.runInNewContext(output.outputText, {
    exports,
    require: dependency,
    Date,
    console,
  });
  return exports;
}
function dependency(name) {
  if (name === "vue") return Vue;
  if (name.endsWith("/assets/icons/avocado.svg")) return "/fixture/avocado.svg";
  if (name.includes("/ProductType")) return { ProductType };
  if (name.includes("/BusinessModel"))
    return {
      BusinessModel: { STORE: { code: "STORE", name: "business.store" } },
    };
  if (name.includes("/ShopPermissions"))
    return {
      ShopPermissions: {
        EDITOR: {
          text: "role.editor",
          description: "role.editor.description",
          src: "/fixture/editor.svg",
        },
        FINANCE: {
          text: "role.finance",
          description: "role.finance.description",
          src: "/fixture/finance.svg",
        },
      },
      ShopPermissionRegions: Object.fromEntries(
        [
          ["DASHBOARD", "dashboard", "dashboard"],
          ["PRODUCTS", "products", "apps"],
          ["ORDERS", "process_center", "fa:fas fa-cart-arrow-down"],
          ["CUSTOMERS", "customers", "supervised_user_circle"],
          ["SETTINGS", "edit", "settings"],
        ].map(([code, label, icon]) => [
          code,
          { code, name: "admin_shop.menu." + label, icon },
        ]),
      ),
    };
  for (const file of [
    "BShopCardModern.vue",
    "BShopCardProducts.vue",
    "BShopCardVisitors.vue",
  ])
    if (name.endsWith(file))
      return {
        default: load(
          file === "BShopCardModern.vue"
            ? "./" + file
            : file.includes("Products")
              ? "./products/" + file
              : "./visitors/" + file,
        ),
      };
  if (name.endsWith("Mixin.ts")) return { default: {} };
  if (name.endsWith(".vue"))
    return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
  return {};
}
function load(path) {
  const url = new URL(path, import.meta.url);
  if (loaded.has(url.href)) return loaded.get(url.href);
  const { descriptor, errors } = parse(readFileSync(url, "utf8"), {
    filename: url.pathname,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "shops-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: url.pathname,
    id: "shops-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles)
    styleChecks.push(
      compileStyleAsync({
        source: style.content,
        filename: url.pathname,
        id: "shops-test",
        scoped: style.scoped,
        preprocessLang: style.lang,
      }).then((result) => {
        assert.deepEqual(result.errors, []);
        styleCodes.set(
          url.href,
          (styleCodes.get(url.href) || "") + result.code,
        );
      }),
    );
  const component = evaluate(descriptor.script.content).default;
  const nativeRender = evaluate(template.code).render;
  component.render = function (...args) {
    contexts.set(component.name, this);
    return nativeRender.apply(this, args);
  };
  loaded.set(url.href, component);
  return component;
}
const Card = load("./BShopCard.vue"),
  Modern = load("./BShopCardModern.vue"),
  Products = load("./products/BShopCardProducts.vue"),
  Visitors = load("./visitors/BShopCardVisitors.vue"),
  Recovery = load("../list/item/BShopListItem.vue");
await Promise.all(styleChecks);
const RouterLink = Vue.defineComponent({
  props: ["to"],
  setup:
    (props, { attrs, slots }) =>
    () =>
      Vue.h(
        "a",
        {
          ...attrs,
          href: "#fixture",
          "data-route":
            typeof props.to === "object" ? props.to?.name : props.to,
          "data-shop": props.to?.params?.shop_id,
        },
        slots.default?.(),
      ),
});
const t = (key, values = {}) => {
  if (key === "user_dashboard.shops.modern.statistics_updated")
    return `Statistics updated · ${values.time}`;
  if (key === "user_dashboard.shops.modern.orders_to_process")
    return `${values.count} orders to process`;
  if (key === "user_dashboard.shops.modern.no_orders_to_process")
    return "No orders to process";
  if (key === "user_dashboard.shops.modern.queue_unavailable")
    return "Order queue unavailable";
  if (key === "user_dashboard.shops.modern.expires")
    return `Expires ${values.time}`;
  if (key === "user_dashboard.shops.modern.expired")
    return `Expired ${values.time}`;
  if (key === "user_dashboard.shops.modern.no_expiry") return "No expiry";
  return key;
};
const globals = {
  $t: t,
  $vuetify: { locale: { isRtl: false }, display: { smAndDown: false } },
  USER_ID: () => 7,
  numeralFormat: (value) => String(value),
  getShopImagePath: (path) => `/fixture/${path}`,
  getShopLicenseIcon: () => "/fixture/license.svg",
  getShopLicenseName: (code) => code,
  getFromNowString: (value) => value,
  getLocalDateString: (value) => "Exact " + value,
};
function application(component, props, router) {
  const app = Vue.createApp(component, props);
  Object.assign(app.config.globalProperties, globals);
  if (router) app.use(router);
  else app.component("router-link", RouterLink);
  app.component("u-price", leaf("UPrice"));
  for (const tag of [
    "v-menu",
    "v-card",
    "v-icon",
    "v-tooltip",
    "v-avatar",
    "v-list-item",
    "v-row",
    "v-col",
    "v-divider",
    "v-chip",
    "v-btn",
    "v-img",
    "v-sheet",
    "v-container",
    "v-list-item-title",
    "v-list-item-action",
    "v-card-text",
    "v-list",
    "v-table",
    "apexchart",
  ])
    app.component(tag, leaf(tag));
  app.directive("tooltip", {
    getSSRProps: ({ value }) => {
      controls.push({ name: "tooltip", attrs: value });
      return {};
    },
  });
  return app;
}
async function fixture(component, props) {
  controls.length = 0;
  contexts.clear();
  const app = application(component, props);
  const html = await renderToString(app);
  return {
    html,
    document: new JSDOM(html).window.document,
    context: contexts.get(component.name),
    controls: [...controls],
  };
}
const plain = (value) => JSON.parse(JSON.stringify(value));
function shop(extra = {}) {
  return {
    id: 42,
    name: "fixture-shop",
    title: "Fixture shop",
    user_id: 7,
    active: true,
    model: "STORE",
    license: "FREE",
    expire_at: null,
    shop_permissions: [{ level: "EDITOR" }, { level: "FINANCE" }],
    total_views: 23,
    order_queue: {
      total: 0,
      by_type: Object.fromEntries(queueKinds.map((code) => [code, 0])),
      as_of: "2026-10-27T14:00:00",
    },
    lastdata: {
      created_at: "2026-10-26T00:00:00",
      updated_at: "2026-10-26T12:34:56Z",
      ...Object.fromEntries(
        kinds.flatMap((code) => [
          ["total_products_" + code.toLowerCase(), 0],
          ["sell_products_" + code.toLowerCase(), 0],
          ["view_products_" + code.toLowerCase(), 0],
        ]),
      ),
      views: 3,
      page_views: 8,
      new_visitors: 2,
      returning_visitors: 1,
      likes: 0,
      comments: 1,
      ratings: 2,
      favorites: 3,
      wishlist: 4,
      finances: [],
    },
    ...extra,
  };
}

test("modern is opt-in and BShopCard forwards its complete presentation contract without replacing legacy callers", async () => {
  const legacy = await fixture(Card, {
    shop: shop(),
    to: { name: "legacy-dashboard" },
  });
  assert.ok(legacy.html.includes('class="s--shop-card"'));
  assert.ok(!legacy.html.includes("b-shop-card-modern text-start"));
  const modern = await fixture(Card, {
    shop: shop(),
    modern: true,
    compact: true,
    initialExpanded: true,
    isSample: true,
    showEngagement: false,
    to: { name: "native-dashboard", params: { shop_id: 42 } },
  });
  const state = contexts.get("BShopCardModern");
  assert.equal(state.compact, true);
  assert.equal(state.expanded, true);
  assert.equal(state.isSample, true);
  assert.equal(state.showEngagement, false);
  assert.equal(state.dashboard_to.name, "native-dashboard");
  assert.ok(modern.html.includes("b-shop-card-modern--compact"));
  assert.equal(
    modern.document.querySelectorAll(".b-shop-card-modern__engagement").length,
    0,
  );
  assert.ok(modern.html.includes("global.commons.demo"));
});

test("all native-currency figures preserve signed amounts, actual zero, missing fields and unavailable versus empty reports", async () => {
  const record = shop();
  record.lastdata.finances = [
    { currency: "USD", sell: 0, pay: -7.5 },
    { currency: "EUR", sell: 11, pay: null },
    { currency: "AED", sell: -2, pay: 0 },
  ];
  const result = await fixture(Modern, { shop: record });
  assert.deepEqual(
    result.controls
      .filter((item) => item.name === "UPrice")
      .map((item) => [item.attrs.currency, item.attrs.amount]),
    [
      ["USD", 0],
      ["EUR", 11],
      ["AED", -2],
      ["USD", -7.5],
      ["AED", 0],
    ],
  );
  assert.ok(result.html.includes("user_dashboard.shops.modern.unknown"));
  assert.equal(
    result.document.querySelectorAll(".b-shop-card-modern__money").length,
    6,
  );
  assert.ok(
    result.controls
      .filter((item) => item.name === "UCurrencyIcon")
      .every(
        (item) =>
          item.attrs["flag-only"] === "" && item.attrs.flag === undefined,
      ),
  );
  const unavailable = await fixture(Modern, { shop: shop({ lastdata: {} }) });
  assert.equal(unavailable.context.finances, null);
  assert.ok(!unavailable.html.includes("shop_card.no_payment"));
  const empty = await fixture(Modern, { shop: shop() });
  assert.ok(empty.html.includes("shop_card.no_payment"));
  assert.ok(empty.html.includes("shop_card.no_purchase"));
});

test("live order queues retain six native per-type destinations independently of daily sold quantities and Hyper", async () => {
  const record = shop();
  kinds.forEach((code) => {
    record.lastdata["sell_products_" + code.toLowerCase()] = 900;
  });
  record.order_queue.total = 21;
  record.order_queue.by_type = {
    ...Object.fromEntries(queueKinds.map((code, i) => [code, i + 1])),
    HYPER: 700,
  };
  const result = await fixture(Modern, { shop: record });
  assert.equal(result.context.queue_total, 21);
  assert.deepEqual(
    plain(result.context.order_types.map((item) => item.value)),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    plain(result.context.order_types.map((item) => item.code)),
    queueKinds,
  );
  const links = [
    ...result.document.querySelectorAll(".b-shop-card-modern__order-row a"),
  ];
  assert.deepEqual(
    links.map((link) => link.dataset.route),
    [
      "BPageShopOrdersPhysical",
      "BPageShopOrdersVirtual",
      "BPageShopOrdersFile",
      "BPageShopOrdersService",
      "BPageShopOrdersSubscription",
      "BPageShopOrdersAvocado",
    ],
  );
  assert.ok(links.every((link) => link.dataset.shop === "42"));
  assert.ok(
    result.document
      .querySelector(".b-shop-card-modern__orders-button")
      .textContent.includes("21 orders to process"),
  );
  assert.equal(
    result.document.querySelectorAll(".b-shop-card-modern__order-row").length,
    6,
  );
  assert.ok(!result.html.includes("modern.sold_units"));
  assert.ok(!result.html.includes("HYPER"));
  assert.ok(
    result.document.querySelector(
      '.b-shop-card-modern__order-row img[src="/fixture/avocado.svg"]',
    ),
  );
  const queueOnly = await fixture(Modern, {
    shop: shop({ lastdata: {}, order_queue: record.order_queue }),
  });
  assert.equal(queueOnly.context.queue_total, 21);
  assert.ok(
    queueOnly.document.querySelector(".b-shop-card-modern__orders-button"),
  );
  const zeroRecord = shop();
  zeroRecord.lastdata.sell_products_physical = 123;
  const zero = await fixture(Modern, { shop: zeroRecord });
  assert.equal(zero.context.queue_total, 0);
  assert.equal(
    zero.document.querySelector(".b-shop-card-modern__orders-button"),
    null,
  );
  assert.ok(
    zero.document
      .querySelector(".b-shop-card-modern__order-status")
      .textContent.includes("No orders to process"),
  );
  assert.equal(
    zero.document.querySelectorAll(".b-shop-card-modern__order-row").length,
    0,
  );
});

test("unavailable or denied queue projections never fall back to daily sold units or an empty queue", async () => {
  // The backend represents a denied queue projection as null.
  for (const order_queue of [undefined, null, { total: null }, {}]) {
    const record = shop({ order_queue });
    kinds.forEach((code) => {
      record.lastdata["sell_products_" + code.toLowerCase()] = 99;
    });
    const result = await fixture(Modern, { shop: record });
    assert.equal(result.context.queue_total, null);
    assert.ok(
      result.document
        .querySelector(".b-shop-card-modern__order-status")
        .textContent.includes("Order queue unavailable"),
    );
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__orders-button"),
      null,
    );
    assert.equal(
      result.document.querySelectorAll(".b-shop-card-modern__order-row").length,
      0,
    );
    assert.ok(!result.html.includes("No orders to process"));
    assert.ok(!result.html.includes("modern.sold_units"));
    assert.deepEqual(
      plain(result.context.order_types.map((item) => item.value)),
      Array(6).fill(null),
    );
  }
});

test("statistics timestamps use the latest update rather than the daily bucket or independent queue snapshot", async () => {
  const record = shop();
  const updated = record.lastdata.updated_at;
  assert.notEqual(updated, record.lastdata.created_at);
  assert.notEqual(updated, record.order_queue.as_of);
  for (const compact of [false, true]) {
    const result = await fixture(Modern, { shop: record, compact });
    assert.equal(result.context.report_date, updated);
    assert.equal(
      result.context.statistics_help,
      `user_dashboard.shops.modern.report_scope Statistics updated · Exact ${updated}`,
    );
    assert.ok(
      !result.context.statistics_help.includes(record.lastdata.created_at),
    );
    assert.ok(
      !result.context.statistics_help.includes(record.order_queue.as_of),
    );
    if (compact) {
      const scope = result.document.querySelector(".b-shop-card-modern__scope");
      assert.ok(scope.textContent.trim().startsWith(updated));
      assert.ok(
        result.document.body.textContent.includes(
          `Statistics updated · Exact ${updated}`,
        ),
      );
    } else {
      assert.equal(
        result.document
          .querySelector(".b-shop-card-modern__period")
          .textContent.trim(),
        updated,
      );
      assert.ok(
        result.controls.some(
          (item) =>
            item.name === "tooltip" &&
            item.attrs.text === result.context.statistics_help,
        ),
      );
    }
  }
  for (const updated_at of [undefined, null, ""]) {
    const missing = shop();
    missing.lastdata.updated_at = updated_at;
    const result = await fixture(Modern, { shop: missing });
    assert.equal(result.context.report_date, "—");
    assert.equal(
      result.context.statistics_help,
      "user_dashboard.shops.modern.report_scope",
    );
    assert.equal(
      result.document
        .querySelector(".b-shop-card-modern__period")
        .textContent.trim(),
      "—",
    );
  }
  for (const updated_at of ["2999-01-01T00:00:00Z", "not-a-timestamp"]) {
    const invalid = shop();
    invalid.lastdata.updated_at = updated_at;
    const result = await fixture(Modern, { shop: invalid });
    assert.equal(result.context.report_date, "—");
    assert.equal(
      result.document
        .querySelector(".b-shop-card-modern__period")
        .textContent.trim(),
      "—",
    );
    if (updated_at.startsWith("2999"))
      assert.ok(
        result.context.statistics_help.includes(`Exact ${updated_at}`),
        "Exact source timestamp remains available without an impossible future age",
      );
  }
});

test("partial and unknown stock/visitor values remain unknown while actual zero and legacy zero defaults are retained", async () => {
  for (const component of [Products, Visitors]) {
    const unknown = await fixture(component, { lastData: {}, modern: true });
    assert.ok(unknown.html.includes("—"));
    const legacy = await fixture(component, { lastData: {} });
    assert.ok(!legacy.html.includes("—"));
  }
  const zero = await fixture(Products, {
    lastData: shop().lastdata,
    modern: true,
  });
  assert.equal(zero.context.total_products, 0);
  const partial = await fixture(Products, {
    lastData: { total_products_physical: 3 },
    modern: true,
  });
  assert.equal(partial.context.total_products, null);
  const unknown = await fixture(Modern, {
    shop: shop({ total_views: null, lastdata: {}, order_queue: null }),
  });
  assert.equal(unknown.context.queue_total, null);
  assert.equal(unknown.context.total_views, null);
  const dailyOnly = await fixture(Modern, {
    shop: shop({ total_views: undefined }),
  });
  assert.equal(
    dailyOnly.context.total_views,
    null,
    "Daily views must not become an all-history total",
  );
  for (const value of [null, undefined, "", false, {}, NaN, Infinity])
    assert.equal(unknown.context.number(value), null);
  assert.equal(unknown.context.number(0), 0);
  assert.equal(unknown.context.number("-2.50"), -2.5);
});

test("engagement, lifetime views, identity, license, penalty, sample and explicit destinations preserve their own scopes", async () => {
  const record = shop({
    icon: "shop.png",
    penalty: true,
    expire_at: "2020-01-01",
    domain: "https://fixture.invalid/store",
  });
  const result = await fixture(Modern, { shop: record, isSample: true });
  assert.equal(
    result.document.querySelectorAll(".b-shop-card-modern__engagement > div")
      .length,
    6,
  );
  assert.equal(result.context.total_views, 23);
  assert.deepEqual(
    plain(result.context.engagement.map((item) => item.value)),
    [0, 1, 2, 3, 23, 4],
  );
  assert.equal(result.context.license_expired, true);
  assert.equal(result.context.expiry_label, "Expired 2020-01-01");
  assert.ok(result.html.includes("Exact 2020-01-01"));
  assert.ok(
    result.document
      .querySelector(".b-shop-card-modern__roles")
      .textContent.includes("global.commons.owner"),
  );
  assert.ok(
    result.document
      .querySelector(".b-shop-card-modern__roles")
      .textContent.includes("+2"),
  );
  assert.equal(
    result.document.querySelectorAll(
      ".b-shop-card-modern__permission-detail img",
    ).length,
    2,
  );
  assert.ok(result.html.includes("role.editor.description"));
  assert.ok(result.html.includes("role.finance.description"));
  assert.ok(result.html.includes("modern.penalty"));
  assert.ok(result.html.includes("global.commons.demo"));
  assert.equal(result.context.report_date, "2026-10-26T12:34:56Z");
  assert.equal(
    result.document.querySelector(".b-shop-card-modern__actions a[target]"),
    null,
  );
  assert.ok(result.document.querySelector('[data-route="BPageShopDashboard"]'));
  assert.ok(
    result.document.querySelector('[data-route="BPageShopSettingInfo"]'),
  );
  const noExpiry = await fixture(Modern, { shop: shop() });
  assert.equal(noExpiry.context.expiry_label, "No expiry");
  const future = await fixture(Modern, {
    shop: shop({ expire_at: "2999-01-01" }),
  });
  assert.equal(future.context.expiry_label, "Expires 2999-01-01");
  assert.ok(future.html.includes("Exact 2999-01-01"));
});

test("native product and visitor chart menus preserve exact series, labels and opt-in keyboard activators", async () => {
  const lastData = shop().lastdata;
  kinds.forEach(
    (code, i) => (lastData["total_products_" + code.toLowerCase()] = i + 1),
  );
  const products = await fixture(Products, { modern: true, lastData });
  assert.deepEqual(plain(products.context.series), [1, 2, 3, 4, 5]);
  assert.deepEqual(
    plain(products.context.options.labels),
    kinds.map((code) => "type." + code),
  );
  assert.equal(products.document.querySelector("button").type, "button");
  const visitors = await fixture(Visitors, { modern: true, lastData });
  assert.equal(visitors.context.total_visitors, 3);
  assert.equal(visitors.context.page_views, 8);
  assert.deepEqual(plain(visitors.context.series_visitors), [1, 2]);
  const chart = visitors.controls.find((item) => item.name === "apexchart");
  assert.equal(chart.attrs.width, "100%");
  assert.deepEqual(plain(chart.attrs.series), [1, 2]);
});

test("modern visitor summary shows one unique visitor value while exact page views remain accessible and native charts retain their data", async () => {
  const result = await fixture(Visitors, {
    modern: true,
    lastData: {
      returning_visitors: 2000,
      new_visitors: 4000,
      page_views: 17000,
    },
  });
  const heading = result.document.querySelector("h6");
  assert.equal(heading.classList.contains("single-line"), false);
  assert.ok(heading.textContent.includes("6000"));
  assert.equal(
    heading.querySelector("i"),
    null,
    "Modern primary visitor value has no extra people glyph",
  );
  assert.ok(!heading.textContent.includes("17000"));
  assert.equal(
    result.document
      .querySelector(".b-shop-card-visitors__caption")
      .textContent.trim(),
    "user_dashboard.shops.modern.unique_visitors",
  );
  assert.equal(
    result.document.querySelector(".b-shop-card-visitors__page-views"),
    null,
  );
  assert.ok(
    !result.document.querySelector("button").textContent.includes("17000"),
  );
  assert.ok(
    result.document
      .querySelector("button")
      .getAttribute("aria-label")
      .includes("unique_visitors: 6000"),
  );
  assert.ok(
    result.document
      .querySelector("button")
      .getAttribute("aria-label")
      .includes("page_views: 17000"),
  );
  assert.deepEqual(plain(result.context.series_visitors), [2000, 4000]);
  const chart = result.controls.find((item) => item.name === "apexchart");
  assert.deepEqual(plain(chart.attrs.series), [2000, 4000]);
  const legacy = await fixture(Visitors, { lastData: shop().lastdata });
  assert.equal(
    legacy.document.querySelector("h6").classList.contains("single-line"),
    true,
  );
  assert.ok(legacy.document.querySelector("h6 i.fa-users"));
});

test("Refined cards retain the approved content hierarchy with two primary metrics, a separate order queue and six accessible compact engagement values", async () => {
  const result = await fixture(Modern, { shop: shop() });
  const summary = result.document.querySelector(".b-shop-card-modern__summary");
  const context = summary.querySelector(".b-shop-card-modern__context");
  const access = summary.querySelector(".b-shop-card-modern__access");
  assert.equal(context.nextElementSibling, access);
  assert.equal(
    access.nextElementSibling.className,
    "b-shop-card-modern__license",
  );
  assert.equal(
    summary.querySelectorAll(
      ".b-shop-card-modern__primary > .b-shop-card-modern__metric",
    ).length,
    2,
  );
  assert.equal(
    summary.querySelector(".b-shop-card-modern__primary").nextElementSibling
      .className,
    "b-shop-card-modern__metric b-shop-card-modern__orders",
  );
  const metrics = [
    ...result.document.querySelectorAll(".b-shop-card-modern__engagement-item"),
  ];
  assert.equal(metrics.length, 6);
  assert.ok(
    metrics.every(
      (item) =>
        item.tagName === "BUTTON" &&
        item.type === "button" &&
        item.getAttribute("aria-label"),
    ),
  );
  assert.deepEqual(
    metrics.map((item) => item.getAttribute("aria-label").split(": ")[1]),
    ["0", "1", "2", "3", "23", "4"],
  );
  assert.ok(
    metrics.every((item) => item.querySelectorAll("span").length === 1),
    "Only compact values are visible; labels stay available to focus/hover/tap",
  );
  const cta = result.document.querySelector(".b-shop-card-modern__actions > a");
  assert.equal(cta.lastElementChild.dataset.leaf, "v-icon");
  assert.ok(cta.lastElementChild.textContent.includes("arrow_forward"));
  const compact = await fixture(Modern, { shop: shop(), compact: true });
  assert.equal(
    compact.document.querySelector(
      ".b-shop-card-modern__summary > .b-shop-card-modern__context",
    ),
    null,
  );
  assert.ok(
    compact.document.querySelector(
      ".b-shop-card-modern__details .b-shop-card-modern__context",
    ),
  );
});

test("Refined footer exposes expiry and one native dashboard CTA, while the header has five exact shop-scoped destinations", async () => {
  const result = await fixture(Modern, {
    shop: shop({ id: 73, expire_at: "2020-01-01" }),
    to: {
      name: "native-dashboard",
      params: { shop_id: 73 },
      query: { fixture: "kept" },
    },
  });
  const footer = result.document.querySelector(".b-shop-card-modern__actions");
  assert.equal(footer.querySelectorAll("a").length, 1);
  assert.equal(footer.querySelector("a").dataset.route, "native-dashboard");
  assert.equal(footer.querySelector("a").dataset.shop, "73");
  assert.ok(
    footer
      .querySelector(".b-shop-card-modern__expiry")
      .textContent.includes("Expired 2020-01-01"),
  );
  assert.ok(footer.textContent.includes("Exact 2020-01-01"));
  assert.ok(
    footer
      .querySelector('.b-shop-card-modern__expiry [data-leaf="v-icon"]')
      .textContent.includes("schedule"),
  );
  assert.equal(
    result.document.querySelector(
      ".b-shop-card-modern__license .b-shop-card-modern__expiry",
    ),
    null,
  );
  assert.ok(footer.querySelector("a").textContent.includes("modern.open_shop"));
  assert.equal(footer.querySelector('[aria-label*="visit_store"]'), null);
  assert.equal(footer.querySelector('[aria-label*="edit_shop"]'), null);
  assert.equal(result.context.dashboard_to.query.fixture, "kept");
  const sections = [
    ...result.document.querySelectorAll(".b-shop-card-modern__sections a"),
  ];
  assert.deepEqual(
    sections.map((item) => item.dataset.route),
    [
      "BPageShopDashboard",
      "BPageShopProductsList",
      "BPageShopOrders",
      "BPageShopCrmCustomers",
      "BPageShopSettingInfo",
    ],
  );
  assert.ok(sections.every((item) => item.dataset.shop === "73"));
  assert.equal(
    result.document
      .querySelector(".b-shop-card-modern__menu-button")
      .getAttribute("aria-haspopup"),
    "menu",
  );
  const compact = await fixture(Modern, { shop: shop(), compact: true });
  assert.ok(
    compact.document.querySelector(
      ".b-shop-card-modern__license .b-shop-card-modern__expiry",
    ),
  );
  assert.equal(
    compact.document.querySelector(
      ".b-shop-card-modern__actions .b-shop-card-modern__expiry",
    ),
    null,
  );
  assert.equal(
    compact.document.querySelectorAll(".b-shop-card-modern__actions a").length,
    1,
  );
});

test("engagement has six distinct lightweight outlined SVG identities and the trailing footer arrow mirrors only in RTL", async () => {
  const result = await fixture(Modern, { shop: shop() });
  const controls = [
    ...result.document.querySelectorAll(".b-shop-card-modern__engagement-item"),
  ];
  assert.equal(controls.length, 6);
  const paths = new Set();
  for (const control of controls) {
    const svg = control.querySelector("svg");
    assert.ok(control.getAttribute("aria-label"));
    assert.ok(svg);
    assert.equal(svg.getAttribute("width"), "12");
    assert.equal(svg.getAttribute("height"), "12");
    assert.equal(svg.getAttribute("fill"), "none");
    assert.equal(svg.getAttribute("stroke"), "currentColor");
    assert.equal(svg.getAttribute("stroke-width"), "1.7");
    assert.equal(svg.getAttribute("aria-hidden"), "true");
    assert.equal(svg.getAttribute("focusable"), "false");
    paths.add(svg.querySelector("path").getAttribute("d"));
  }
  assert.equal(paths.size, 6);
  assert.deepEqual(
    controls.map((item) => item.getAttribute("aria-label").split(": ")[0]),
    [
      "user_dashboard.shops.modern.article_likes",
      "widgets.overview.comments",
      "user_dashboard.shops.modern.ratings",
      "user_dashboard.shops.modern.article_favorites",
      "user_dashboard.shops.modern.shop_views",
      "widgets.overview.wishlist",
    ],
  );
  assert.ok(
    !result.document
      .querySelector(".b-shop-card-modern__arrow")
      .classList.contains("b-shop-card-modern__arrow--rtl"),
  );
  const app = application(Modern, { shop: shop() });
  app.config.globalProperties.$vuetify = {
    ...globals.$vuetify,
    locale: { isRtl: true },
  };
  const rtl = new JSDOM(await renderToString(app)).window.document;
  assert.ok(
    rtl
      .querySelector(".b-shop-card-modern__arrow")
      .classList.contains("b-shop-card-modern__arrow--rtl"),
  );
  assert.match(
    styleCodes.get(new URL("./BShopCardModern.vue", import.meta.url).href),
    /b-shop-card-modern__arrow--rtl[^{}]*\{[^{}]*transform: scaleX\(-1\)/,
  );
});

test("compact expansion keeps the focused native button and unique controlled details node stable", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const app = application({
    render: () =>
      Vue.h("div", [
        Vue.h(Modern, { shop: shop(), compact: true }),
        Vue.h(Modern, {
          shop: shop({ id: 43 }),
          compact: true,
          initialExpanded: true,
        }),
      ]),
  });
  app.mount(host);
  try {
    const buttons = [...host.querySelectorAll(".b-shop-card-modern__expand")];
    const first = buttons[0],
      panel = host.querySelector(
        '[id="' + first.getAttribute("aria-controls") + '"]',
      );
    assert.notEqual(
      first.getAttribute("aria-controls"),
      buttons[1].getAttribute("aria-controls"),
    );
    assert.equal(panel.style.display, "none");
    first.focus();
    first.click();
    await Vue.nextTick();
    assert.equal(document.activeElement, first);
    assert.equal(first.getAttribute("aria-expanded"), "true");
    assert.equal(panel.style.display, "");
    first.click();
    await Vue.nextTick();
    assert.equal(document.activeElement, first);
    assert.equal(panel.style.display, "none");
    assert.equal(host.querySelector(".b-shop-card-modern__expand"), first);
  } finally {
    app.unmount();
    host.remove();
  }
});

test("grid, sample and compact cards retain one named dashboard link without nested anchors or extra tab stops", async () => {
  for (const props of [
    {},
    { isSample: true },
    { compact: true },
    { compact: true, initialExpanded: true },
  ]) {
    const result = await fixture(Modern, { shop: shop(), ...props });
    const article = result.document.querySelector("article");
    const link = article.querySelector(".b-shop-card-modern__dashboard-link");
    assert.equal(link.tagName, "A");
    assert.equal(link.textContent, "Fixture shop");
    assert.equal(link.dataset.route, "BPageShopDashboard");
    assert.equal(link.dataset.shop, "42");
    assert.equal(article.querySelectorAll("a a, a button, button a").length, 0);
    assert.equal(article.hasAttribute("tabindex"), false);
    assert.equal(link.hasAttribute("tabindex"), false);
    const handleRow = article.querySelector(".b-shop-card-modern__handle-row");
    assert.equal(
      handleRow.querySelector(".b-shop-card-modern__handle").textContent,
      "@fixture-shop",
    );
    assert.equal(
      handleRow.querySelectorAll(".b-shop-card-modern__sample").length,
      props.isSample ? 1 : 0,
    );
    if (props.isSample)
      assert.ok(handleRow.textContent.includes("global.commons.demo"));
    assert.ok(article.querySelector(".b-shop-card-modern__menu-button"));
    assert.ok(article.querySelector(".b-shop-card-products--modern"));
    assert.ok(article.querySelector(".b-shop-card-visitors--modern"));
    assert.ok(article.querySelector(".b-shop-card-modern__roles"));
    assert.ok(article.querySelector(".b-shop-card-modern__expiry"));
  }
});

test("native dashboard navigation preserves modifiers and custom destinations without taking over internal controls", async () => {
  const names = [
    "BPageShopDashboard",
    "BPageShopProductsList",
    "BPageShopOrders",
    "BPageShopCrmCustomers",
    "BPageShopSettingInfo",
    "BPageShopOrdersPhysical",
    "BPageShopOrdersAvocado",
    "fixture-custom-dashboard",
  ];
  for (const props of [{}, { isSample: true }, { compact: true }]) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", name: "fixture-start", component: { render: () => null } },
        ...names.map((name, index) => ({
          path: `/fixture-${index}/:shop_id`,
          name,
          component: { render: () => null },
        })),
      ],
    });
    await router.push("/");
    await router.isReady();
    const record = shop();
    record.order_queue.total = 5;
    record.order_queue.by_type.PHYSICAL = 2;
    record.order_queue.by_type.AVOCADO = 3;
    const destination = {
      name: "fixture-custom-dashboard",
      params: { shop_id: record.id },
      query: { source: "kept" },
    };
    const app = application(
      Modern,
      { shop: record, to: destination, ...props },
      router,
    );
    const host = document.createElement("div");
    document.body.append(host);
    app.mount(host);
    const settle = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      await Vue.nextTick();
    };
    try {
      const link = host.querySelector(".b-shop-card-modern__dashboard-link");
      assert.equal(link.getAttribute("href"), router.resolve(destination).href);
      link.focus();
      assert.equal(document.activeElement, link);
      for (const modifier of [
        { ctrlKey: true },
        { metaKey: true },
        { shiftKey: true },
        { button: 1 },
      ]) {
        let preventedByRouter;
        // Observe the native router guard, then suppress jsdom's real URL navigation.
        link.addEventListener(
          "click",
          (event) => {
            preventedByRouter = event.defaultPrevented;
            event.preventDefault();
          },
          { once: true },
        );
        link.dispatchEvent(
          new window.MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            ...modifier,
          }),
        );
        await settle();
        assert.equal(preventedByRouter, false);
        assert.equal(router.currentRoute.value.name, "fixture-start");
      }
      for (const button of host.querySelectorAll("button")) {
        (button.querySelector("span, svg") || button).dispatchEvent(
          new window.MouseEvent("click", { bubbles: true, cancelable: true }),
        );
        await settle();
        assert.equal(router.currentRoute.value.name, "fixture-start");
      }
      const section = host.querySelector(
        '.b-shop-card-modern__sections a[href="' +
          router.resolve({
            name: "BPageShopProductsList",
            params: { shop_id: record.id },
          }).href +
          '"]',
      );
      section.click();
      await settle();
      assert.equal(router.currentRoute.value.name, "BPageShopProductsList");
      assert.equal(router.currentRoute.value.params.shop_id, "42");
      const order = host.querySelector(".b-shop-card-modern__order-row a");
      order.click();
      await settle();
      assert.equal(router.currentRoute.value.name, "BPageShopOrdersPhysical");
      assert.equal(router.currentRoute.value.params.shop_id, "42");
      const avocado = host.querySelector(
        '.b-shop-card-modern__order-row a[href="' +
          router.resolve({
            name: "BPageShopOrdersAvocado",
            params: { shop_id: record.id },
          }).href +
          '"]',
      );
      avocado.click();
      await settle();
      assert.equal(router.currentRoute.value.name, "BPageShopOrdersAvocado");
      assert.equal(router.currentRoute.value.params.shop_id, "42");
      link.click();
      await settle();
      assert.equal(router.currentRoute.value.name, destination.name);
      assert.equal(router.currentRoute.value.query.source, "kept");
      const footer = host.querySelector(".b-shop-card-modern__open");
      assert.equal(footer.getAttribute("href"), link.getAttribute("href"));
    } finally {
      app.unmount();
      host.remove();
    }
  }
});

test("modern deleted recovery keeps original handle, disabled/loading state and native recover event", async () => {
  let recovered;
  const result = await fixture(Recovery, {
    modern: true,
    shop: shop({
      name: "fixture-shop::deleted-42",
      original_name: "fixture-shop",
      deleted_at: "2026-10-25",
    }),
    recoveryDisabled: true,
    recoveryLoading: true,
    onRecover: (value) => (recovered = value),
  });
  assert.equal(result.context.handle, "fixture-shop");
  const dialog = result.controls.find(
    (item) => item.name === "BShopRecoveryDialog",
  );
  assert.equal(dialog.attrs.disabled, true);
  assert.equal(dialog.attrs.loading, true);
  dialog.attrs.onRecover({ shop_id: 42 });
  assert.deepEqual(recovered, { shop_id: 42 });
  assert.ok(result.html.includes("b-shop-list-item--modern"));
  assert.ok(!result.html.includes("bg-red-lighten-5"));
});
