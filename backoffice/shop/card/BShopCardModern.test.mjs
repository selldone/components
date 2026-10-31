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
      const activatorProps =
        name === "v-menu"
          ? {
              "data-menu-activator": "",
              onMouseenter: (event) =>
                controls.push({
                  name: "menu-hover",
                  attrs: { target: event.currentTarget },
                }),
            }
          : {};
      return () => {
        controls.push({ name, attrs });
        if (name === "UPrice")
          return Vue.h(
            "span",
            {
              "data-amount": attrs.amount,
              "data-currency": attrs.currency,
              "data-compact": String(Boolean(attrs.compact)),
            },
            String(attrs.amount),
          );
        if (name === "v-list-item" && attrs.to)
          return Vue.h(
            Vue.resolveComponent("router-link"),
            { ...attrs, "data-leaf": name },
            () => [
              slots.prepend?.(),
              attrs.title,
              slots.default?.(),
              slots.append?.(),
            ],
          );
        return Vue.h("div", { ...attrs, "data-leaf": name }, [
          slots.activator?.({ props: activatorProps }),
          slots.default?.({ isActive: { value: false }, props: {} }),
        ]);
      };
    },
  });
}
function evaluate(source, globals = {}) {
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
    URL,
    console,
    ...globals,
  });
  return exports;
}
function dependency(name) {
  if (name === "vue") return Vue;
  if (name.endsWith("/assets/icons/avocado.svg")) return "/fixture/avocado.svg";
  if (name.includes("/ProductType")) return { ProductType };
  if (name.endsWith(".svg"))
    return { default: "/fixture/" + name.split("/").at(-1) };
  if (name === "../../server")
    return {
      SetupService: {
        MainServiceUrl: () => "http://localhost:9000",
        ShopsDomain: () => "shops.example",
      },
    };
  if (name.includes("/ShopURLs"))
    return evaluate(
      readFileSync(
        new URL("../../../../core-js/helper/url/ShopURLs.ts", import.meta.url),
        "utf8",
      ),
    );
  if (name.includes("/BusinessModel"))
    return evaluate(
      readFileSync(
        new URL(
          "../../../../core-js/enums/shop/BusinessModel.ts",
          import.meta.url,
        ),
        "utf8",
      ),
    );
  if (name.includes("/ShopPermissions"))
    return evaluate(
      readFileSync(
        new URL(
          "../../../../core-js/enums/permission/ShopPermissions.ts",
          import.meta.url,
        ),
        "utf8",
      ),
    );
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
  if (key === "user_dashboard.shops.modern.add_favorite")
    return `Add ${values.shop} to favorites`;
  if (key === "user_dashboard.shops.modern.remove_favorite")
    return `Remove ${values.shop} from favorites`;
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
  if (key === "user_dashboard.shops.modern.more_sales_currencies")
    return `+${values.count}`;
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
  getLocalTimeString: (value) => "Exact time " + value,
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
    "v-progress-circular",
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
    mounted: (element, { value }) => {
      element.setAttribute(
        "data-tooltip-disabled",
        String(Boolean(value.disabled)),
      );
      element.setAttribute("data-tooltip-text", value.text);
    },
    updated: (element, { value }) => {
      element.setAttribute(
        "data-tooltip-disabled",
        String(Boolean(value.disabled)),
      );
      element.setAttribute("data-tooltip-text", value.text);
    },
  });
  app.directive("copy", {
    getSSRProps: ({ value }) => ({ "data-copy-value": value }),
    mounted: (element, { value }) =>
      element.setAttribute("data-copy-value", value),
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
    model: "normal",
    license: "FREE",
    expire_at: null,
    shop_permissions: [{ level: "PRODUCT" }, { level: "AUDITING" }],
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
    favorite: false,
    favoriteLoading: true,
    favoriteDisabled: true,
    to: { name: "native-dashboard", params: { shop_id: 42 } },
  });
  const state = contexts.get("BShopCardModern");
  assert.equal(state.compact, true);
  assert.equal(state.expanded, true);
  assert.equal(state.isSample, true);
  assert.equal(state.showEngagement, false);
  assert.equal(state.favorite, false);
  assert.equal(state.favoriteLoading, true);
  assert.equal(state.favoriteDisabled, true);
  assert.equal(state.dashboard_to.name, "native-dashboard");
  assert.ok(modern.html.includes("b-shop-card-modern--compact"));
  assert.equal(
    modern.document.querySelectorAll(".b-shop-card-modern__engagement").length,
    0,
  );
  assert.ok(modern.html.includes("global.commons.demo"));
  assert.equal(
    modern.document.querySelector(".b-shop-card-modern__favorite"),
    null,
  );
});

test("favorite controls are opt-in, named and ordered before the menu in card and list presentations", async () => {
  for (const compact of [false, true]) {
    for (const favorite of [undefined, null, false, true]) {
      const result = await fixture(Modern, { shop: shop(), compact, favorite });
      const button = result.document.querySelector(
        ".b-shop-card-modern__favorite",
      );
      if (favorite === undefined || favorite === null) {
        assert.equal(button, null);
        continue;
      }
      assert.equal(button.tagName, "BUTTON");
      assert.equal(button.type, "button");
      assert.equal(button.getAttribute("aria-pressed"), String(favorite));
      assert.equal(button.disabled, false);
      const label = `${favorite ? "Remove Fixture shop from" : "Add Fixture shop to"} favorites`;
      assert.equal(button.getAttribute("aria-label"), label);
      assert.equal(
        button.querySelector('[data-leaf="v-icon"]').textContent.trim(),
        favorite ? "star" : "star_border",
      );
      const actions = button.closest(".b-shop-card-modern__identity-actions");
      const menu = actions.querySelector(".b-shop-card-modern__menu-button");
      assert.equal(actions.firstElementChild, button);
      assert.ok(menu);
      const tooltip = result.controls.find(
        (control) => control.name === "tooltip" && control.attrs.text === label,
      );
      assert.equal(tooltip.attrs.location, "top");
      assert.equal(tooltip.attrs.openOnFocus, true);
    }
    for (const favorite of [false, true]) {
      const sample = await fixture(Modern, {
        shop: shop(),
        compact,
        isSample: true,
        favorite,
      });
      assert.equal(
        sample.document.querySelector(".b-shop-card-modern__favorite"),
        null,
      );
    }
  }
  const legacy = await fixture(Card, { shop: shop(), favorite: true });
  assert.equal(
    legacy.document.querySelector(".b-shop-card-modern__favorite"),
    null,
  );
  assert.ok(legacy.html.includes('class="s--shop-card"'));
});

test("native favorite activation emits once without changing controlled state, and pending requests prevent activation", async () => {
  for (const compact of [false, true]) {
    for (const component of [Modern, Card]) {
      const favorite = Vue.ref(false),
        pending = Vue.ref(false),
        disabled = Vue.ref(false),
        calls = [];
      let bubbled = 0;
      const app = application({
        render: () =>
          Vue.h("div", { onClick: () => bubbled++ }, [
            Vue.h(component, {
              shop: shop(),
              modern: true,
              compact,
              favorite: favorite.value,
              favoriteLoading: pending.value,
              favoriteDisabled: disabled.value,
              onToggleFavorite: (...args) => calls.push(args),
            }),
          ]),
      });
      const host = document.createElement("div");
      document.body.append(host);
      app.mount(host);
      try {
        const button = host.querySelector(".b-shop-card-modern__favorite");
        button.focus();
        assert.equal(document.activeElement, button);
        // Native keyboard activation delivers a click with detail zero.
        button.dispatchEvent(
          new window.MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            detail: 0,
          }),
        );
        await Vue.nextTick();
        assert.deepEqual(calls, [[]]);
        assert.equal(bubbled, 0);
        assert.equal(button.getAttribute("aria-pressed"), "false");
        assert.equal(document.activeElement, button);
        favorite.value = true;
        pending.value = true;
        await Vue.nextTick();
        assert.equal(
          host.querySelector(".b-shop-card-modern__favorite"),
          button,
        );
        assert.equal(button.getAttribute("aria-pressed"), "true");
        assert.equal(button.getAttribute("aria-busy"), "true");
        assert.equal(button.disabled, true);
        button.click();
        button.dispatchEvent(
          new window.MouseEvent("click", { bubbles: true, cancelable: true }),
        );
        await Vue.nextTick();
        assert.deepEqual(calls, [[]]);
        assert.equal(bubbled, 0);
        pending.value = false;
        disabled.value = true;
        await Vue.nextTick();
        assert.equal(button.disabled, true);
        assert.equal(button.getAttribute("aria-busy"), "false");
        assert.equal(
          button.querySelector('[data-leaf="v-progress-circular"]'),
          null,
        );
        button.click();
        button.dispatchEvent(
          new window.MouseEvent("click", { bubbles: true, cancelable: true }),
        );
        await Vue.nextTick();
        assert.deepEqual(calls, [[]]);
        disabled.value = false;
        await Vue.nextTick();
        assert.equal(button.disabled, false);
        assert.equal(
          button.querySelector('[data-leaf="v-icon"]').textContent.trim(),
          "star",
        );
        assert.equal(
          button.getAttribute("aria-label"),
          "Remove Fixture shop from favorites",
        );
        button.click();
        await Vue.nextTick();
        assert.deepEqual(calls, [[], []]);
        assert.equal(button.getAttribute("aria-pressed"), "true");
      } finally {
        app.unmount();
        host.remove();
      }
    }
  }
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
    [
      ...result.document.querySelectorAll(
        ".b-shop-card-modern__details [data-amount]",
      ),
    ].map((item) => [item.dataset.currency, Number(item.dataset.amount)]),
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
    result.document.querySelectorAll(
      ".b-shop-card-modern__details .b-shop-card-modern__money",
    ).length,
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
  const compact = await fixture(Modern, { shop: record, compact: true });
  for (const view of [result, compact]) {
    const menu = view.document.querySelector(
      '.b-shop-card-modern__queue [data-leaf="v-menu"]',
    );
    for (const event of ["open-on-hover", "open-on-focus", "open-on-click"])
      assert.ok(menu.hasAttribute(event));
    assert.equal(menu.getAttribute("open-delay"), "120");
    assert.equal(menu.getAttribute("close-delay"), "180");
    assert.equal(menu.getAttribute("close-on-content-click"), "true");
    assert.equal(menu.getAttribute("location"), "left center");
    assert.equal(menu.getAttribute("offset"), "8");
    const cart = view.document.querySelector(
      ".b-shop-card-modern__queue-cart svg",
    );
    assert.ok(cart);
    assert.equal(cart.getAttribute("fill"), "none");
    assert.equal(cart.getAttribute("stroke"), "currentColor");
    assert.equal(cart.querySelectorAll("circle").length, 2);
    const button = cart.closest("button");
    assert.equal(
      button.className,
      "sd-modern-icon-button b-shop-card-modern__queue-cart",
    );
    assert.equal(button.type, "button");
    assert.equal(button.querySelector(".b-shop-card-modern__queue-copy"), null);
    const copy = view.document.querySelector(".b-shop-card-modern__queue-copy");
    assert.equal(copy.closest("button, a, [role=button]"), null);
    assert.equal(copy.hasAttribute("data-menu-activator"), false);
    assert.equal(copy.hasAttribute("aria-hidden"), false);
    assert.equal(
      view.document.querySelectorAll(
        ".b-shop-card-modern__queue [data-menu-activator]",
      ).length,
      1,
    );
    assert.equal(
      view.document.querySelectorAll(".b-shop-card-modern__order-row").length,
      6,
    );
  }
  assert.deepEqual(
    plain(result.context.order_types.map((item) => item.value)),
    [1, 2, 3, 4, 5, 6],
  );
  assert.deepEqual(
    plain(result.context.order_types.map((item) => item.code)),
    queueKinds,
  );
  const links = [
    ...result.document.querySelectorAll("a.b-shop-card-modern__order-row"),
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
  for (const [index, link] of links.entries()) {
    assert.equal(link.getAttribute("target"), "_blank");
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
    assert.ok(link.getAttribute("aria-label").includes("open_in_new_tab"));
    const end = link.querySelector(".b-shop-card-modern__order-end");
    assert.equal(
      end.textContent.replace(end.lastElementChild.textContent, "").trim(),
      String(index + 1),
    );
    assert.equal(end.lastElementChild.textContent.trim(), "north_east");
  }
  assert.ok(
    result.document
      .querySelector("button.b-shop-card-modern__queue-cart")
      .getAttribute("aria-label")
      .includes("21 orders to process"),
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
    queueOnly.document.querySelector("button.b-shop-card-modern__queue-cart"),
  );
  const zeroRecord = shop();
  zeroRecord.lastdata.sell_products_physical = 123;
  const zero = await fixture(Modern, { shop: zeroRecord });
  assert.equal(zero.context.queue_total, 0);
  assert.equal(
    zero.document.querySelector("button.b-shop-card-modern__queue-cart"),
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
      result.document.querySelector("button.b-shop-card-modern__queue-cart"),
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

test("statistics show an explicit latest update in both collapsed disclosures without substituting another report scope", async () => {
  const record = shop(),
    updated = record.lastdata.updated_at;
  for (const compact of [false, true]) {
    const result = await fixture(Modern, { shop: record, compact });
    assert.equal(result.context.report_date, updated);
    assert.equal(
      result.context.statistics_help,
      `user_dashboard.shops.modern.report_scope Statistics updated · Exact ${updated}`,
    );
    const details = result.document.querySelector(
      ".b-shop-card-modern__details",
    );
    assert.equal(details.style.display, "none");
    assert.ok(
      details
        .querySelector(".b-shop-card-modern__period")
        .textContent.trim()
        .endsWith(`Statistics updated · Exact time ${updated}`),
    );
    assert.ok(
      !result.context.statistics_help.includes(record.lastdata.created_at),
    );
    assert.ok(
      !result.context.statistics_help.includes(record.order_queue.as_of),
    );
    assert.ok(
      result.controls.some(
        (item) =>
          item.name === "tooltip" &&
          item.attrs.text === result.context.statistics_help,
      ),
    );
  }
  for (const updated_at of [
    undefined,
    null,
    "",
    "2999-01-01T00:00:00Z",
    "not-a-timestamp",
  ]) {
    const record = shop();
    record.lastdata.updated_at = updated_at;
    const result = await fixture(Modern, { shop: record });
    assert.equal(result.context.report_date, "—");
    assert.ok(
      result.document
        .querySelector(".b-shop-card-modern__period")
        .textContent.includes(
          "user_dashboard.shops.modern.statistics_unavailable",
        ),
    );
    if (!updated_at)
      assert.equal(
        result.context.statistics_help,
        "user_dashboard.shops.modern.report_scope",
      );
    else
      assert.ok(
        result.context.statistics_help.includes(`Exact ${updated_at}`),
        "Exact source timestamp remains available without inventing a valid report age",
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
  assert.ok(result.html.includes("shop_permissions.PRODUCT.description"));
  assert.ok(result.html.includes("shop_permissions.AUDITING.description"));
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

test("only a valid future license less than seven days away gets a trailing decorative warning, with shared slow blink and reduced-motion support", async (context) => {
  const now = Date.parse("2026-10-30T12:00:00Z"),
    week = 7 * 24 * 60 * 60 * 1000;
  context.mock.method(Date, "now", () => now);
  const timestamp = (remaining) => new Date(now + remaining).toISOString();
  const cases = [
    ...[undefined, null, "", "invalid"].map((value) => [value, false]),
    [timestamp(-1), false],
    [timestamp(0), false],
    [timestamp(1), true],
    [timestamp(week - 1), true],
    [timestamp(week), false],
    [timestamp(week + 1), false],
    ["2026-11-06T15:59:59.999+04:00", true],
    ["2026-11-06T16:00:00.000+04:00", false],
  ];
  for (const compact of [false, true]) {
    for (const [expire_at, expected] of cases) {
      const result = await fixture(Modern, {
        shop: shop({ expire_at }),
        compact,
      });
      const license = result.document.querySelector(
        "button.b-shop-card-modern__license",
      );
      const dot = license.querySelector(
        ".b-shop-card-modern__license-expiry-dot",
      );
      assert.equal(Boolean(dot), expected, String(expire_at));
      assert.equal(
        license.getAttribute("aria-label"),
        "FREE · " + result.context.expiry_label,
      );
      const expired = Boolean(expire_at && new Date(expire_at).getTime() < now);
      assert.equal(Boolean(result.context.license_expired), expired);
      assert.equal(
        Boolean(result.document.querySelector(".b-shop-card-modern__renew")),
        expired,
      );
      if (dot) {
        assert.equal(dot.tagName, "SPAN");
        assert.equal(dot.getAttribute("aria-hidden"), "true");
        assert.equal(license.lastElementChild, dot);
        assert.ok(dot.previousSibling.textContent.includes("FREE"));
        for (const token of [
          "sd-modern-status__dot",
          "sd-modern-status__dot--error",
          "blink-me-linear",
        ])
          assert.ok(dot.classList.contains(token));
        assert.ok(
          result.html.includes("Exact " + expire_at),
          "Native exact-date tooltip remains available",
        );
      }
    }
  }
  assert.match(
    styleCodes.get(new URL("./BShopCardModern.vue", import.meta.url).href),
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.b-shop-card-modern__license-expiry-dot[^{}]*\{[^{}]*animation:\s*none/,
  );
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

test("Focused cards and lists keep model, status and queue visible with all activity behind the initially collapsed disclosure", async () => {
  for (const compact of [false, true]) {
    const result = await fixture(Modern, { shop: shop(), compact });
    const summary = result.document.querySelector(
      ".b-shop-card-modern__summary",
    );
    assert.ok(
      summary.querySelector(
        ".b-shop-card-modern__identity .b-shop-card-modern__business-model",
      ),
    );
    const status = summary.querySelector(".b-shop-card-modern__status");
    assert.ok(status.querySelector(".b-shop-card-modern__context"));
    assert.ok(status.querySelector(".b-shop-card-modern__access"));
    assert.ok(status.querySelector("button.b-shop-card-modern__license"));
    assert.ok(summary.querySelector(".b-shop-card-modern__orders"));
    assert.equal(summary.querySelector(".b-shop-card-modern__primary"), null);
    const details = result.document.querySelector(
      ".b-shop-card-modern__details",
    );
    assert.equal(details.style.display, "none");
    assert.equal(
      details.querySelectorAll(
        ".b-shop-card-modern__primary > .b-shop-card-modern__metric",
      ).length,
      2,
    );
    assert.ok(details.querySelector(".b-shop-card-modern__finances"));
    assert.ok(details.querySelector(".b-shop-card-modern__period"));
    const metrics = [
      ...details.querySelectorAll(".b-shop-card-modern__engagement-item"),
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
    const footer = result.document.querySelector(
      ".b-shop-card-modern__actions",
    );
    assert.equal(
      footer.firstElementChild.className,
      "b-shop-card-modern__expand",
    );
    assert.equal(footer.lastElementChild.className, "b-shop-card-modern__open");
    assert.ok(footer.lastElementChild.textContent.includes("arrow_forward"));
    assert.equal(footer.querySelectorAll("a").length, 1);
  }
});

test("Focused expiry alert sits above the queue, with its exact native detail and real scoped renewal/domain destinations", async () => {
  const result = await fixture(Modern, {
    shop: shop({ id: 73, expire_at: "2020-01-01" }),
    to: {
      name: "native-dashboard",
      params: { shop_id: 73 },
      query: { fixture: "kept" },
    },
  });
  const notice = result.document.querySelector(".b-shop-card-modern__expired");
  assert.ok(
    notice.textContent.includes("user_dashboard.shops.modern.license_expired"),
  );
  assert.equal(
    notice.nextElementSibling.className,
    "b-shop-card-modern__orders",
  );
  const renew = notice.querySelector("a");
  assert.equal(renew.dataset.route, "BPageShopSettingLicense");
  assert.equal(renew.dataset.shop, "73");
  assert.ok(
    result.document
      .querySelector(".b-shop-card-modern__status")
      .textContent.includes("Exact 2020-01-01"),
  );
  const footer = result.document.querySelector(".b-shop-card-modern__actions");
  assert.equal(footer.querySelectorAll("a").length, 1);
  assert.equal(footer.querySelector("a").dataset.route, "native-dashboard");
  assert.equal(footer.querySelector("a").dataset.shop, "73");
  assert.equal(footer.querySelector(".b-shop-card-modern__expiry"), null);
  assert.equal(result.context.dashboard_to.query.fixture, "kept");
  const sections = [
    ...result.document.querySelectorAll(
      ".b-shop-card-modern__sections a[data-route]",
    ),
  ];
  assert.deepEqual(
    sections.map((item) => item.dataset.route),
    [
      "BPageShopDashboard",
      "BPageShopProductsList",
      "BPageShopOrders",
      "BPageShopCrmCustomers",
      "BPageShopSettingInfo",
      "BPageShopSettingDomain",
    ],
  );
  assert.ok(sections.every((item) => item.dataset.shop === "73"));
  for (const section of sections) {
    assert.equal(section.getAttribute("target"), "_blank");
    assert.equal(section.getAttribute("rel"), "noopener noreferrer");
    assert.ok(section.textContent.includes("north_east"));
    assert.ok(section.getAttribute("aria-label").includes("open_in_new_tab"));
  }
  assert.equal(footer.querySelector("a").getAttribute("target"), null);
  assert.equal(
    result.document
      .querySelector(".b-shop-card-modern__menu-button")
      .getAttribute("aria-haspopup"),
    "menu",
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

test("both layouts explain expansion and collapse while keeping the focused native button and unique details node stable", async () => {
  for (const compact of [false, true]) {
    const host = document.createElement("div");
    document.body.append(host);
    const app = application({
      render: () =>
        Vue.h("div", [
          Vue.h(Modern, { shop: shop(), compact }),
          Vue.h(Modern, {
            shop: shop({ id: 43 }),
            compact,
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
      assert.equal(first.tagName, "BUTTON");
      assert.equal(first.type, "button");
      assert.equal(
        first.dataset.tooltipText,
        "user_dashboard.shops.modern.expand_details_help",
      );
      assert.equal(
        buttons[1].dataset.tooltipText,
        "user_dashboard.shops.modern.collapse_details_help",
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
      assert.equal(
        first.dataset.tooltipText,
        "user_dashboard.shops.modern.collapse_details_help",
      );
      assert.equal(panel.style.display, "");
      first.click();
      await Vue.nextTick();
      assert.equal(document.activeElement, first);
      assert.equal(panel.style.display, "none");
      assert.equal(first.getAttribute("aria-expanded"), "false");
      assert.equal(
        first.dataset.tooltipText,
        "user_dashboard.shops.modern.expand_details_help",
      );
      assert.equal(host.querySelector(".b-shop-card-modern__expand"), first);
    } finally {
      app.unmount();
      host.remove();
    }
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
    assert.ok(article.querySelector("button.b-shop-card-modern__license"));
  }
});

test("native dashboard navigation preserves modifiers and custom destinations without taking over internal controls", async () => {
  const names = [
    "BPageShopDashboard",
    "BPageShopProductsList",
    "BPageShopOrders",
    "BPageShopCrmCustomers",
    "BPageShopSettingInfo",
    "BPageShopSettingDomain",
    "BPageShopSettingLicense",
    "BPageShopOrdersPhysical",
    "BPageShopOrdersVirtual",
    "BPageShopOrdersFile",
    "BPageShopOrdersService",
    "BPageShopOrdersSubscription",
    "BPageShopOrdersAvocado",
    "fixture-custom-dashboard",
  ];
  for (const props of [
    { favorite: false },
    { isSample: true, favorite: false },
    { compact: true, favorite: true },
  ]) {
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
      await Vue.nextTick();
      const cart = host.querySelector(".b-shop-card-modern__queue-cart");
      const copy = host.querySelector(".b-shop-card-modern__queue-copy");
      assert.equal(cart.tagName, "BUTTON");
      assert.ok(cart.hasAttribute("data-menu-activator"));
      const beforeHover = controls.filter(
        (item) => item.name === "menu-hover",
      ).length;
      copy.dispatchEvent(new window.MouseEvent("mouseenter"));
      assert.equal(
        controls.filter((item) => item.name === "menu-hover").length,
        beforeHover,
      );
      cart.dispatchEvent(new window.MouseEvent("mouseenter"));
      assert.equal(
        controls.filter((item) => item.name === "menu-hover").length,
        beforeHover + 1,
      );
      assert.equal(controls.at(-1).attrs.target, cart);
      cart.focus();
      assert.equal(document.activeElement, cart);
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
      assert.equal(section.getAttribute("target"), "_blank");
      assert.equal(section.getAttribute("rel"), "noopener noreferrer");
      let sectionPrevented;
      section.addEventListener(
        "click",
        (event) => {
          sectionPrevented = event.defaultPrevented;
          event.preventDefault();
        },
        { once: true },
      );
      section.click();
      await settle();
      assert.equal(
        sectionPrevented,
        false,
        "Native new-tab shortcut leaves the current router untouched",
      );
      assert.equal(router.currentRoute.value.name, "fixture-start");
      const orderRoutes = [
        "BPageShopOrdersPhysical",
        "BPageShopOrdersVirtual",
        "BPageShopOrdersFile",
        "BPageShopOrdersService",
        "BPageShopOrdersSubscription",
        "BPageShopOrdersAvocado",
      ];
      const orders = [
        ...host.querySelectorAll("a.b-shop-card-modern__order-row"),
      ];
      assert.equal(orders.length, 6);
      for (const [index, order] of orders.entries()) {
        assert.equal(
          order.getAttribute("href"),
          router.resolve({
            name: orderRoutes[index],
            params: { shop_id: record.id },
          }).href,
        );
        assert.equal(order.getAttribute("target"), "_blank");
        assert.equal(order.getAttribute("rel"), "noopener noreferrer");
        let orderPrevented;
        order.addEventListener(
          "click",
          (event) => {
            orderPrevented = event.defaultPrevented;
            event.preventDefault();
          },
          { once: true },
        );
        order.click();
        await settle();
        assert.equal(orderPrevented, false);
        assert.equal(router.currentRoute.value.name, "fixture-start");
      }
      assert.equal(
        orders[1]
          .querySelector(".b-shop-card-modern__order-end")
          .firstChild.textContent.trim(),
        "0",
        "Observed-zero types still open their real order page",
      );
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

test("sales digest reserves the same space with stable encouragement without inventing sales from payments, zero or unavailable records", async () => {
  for (const compact of [false, true]) {
    for (const finances of [
      undefined,
      null,
      [],
      [
        { currency: "USD", sell: 0, pay: 50 },
        { currency: "EUR", sell: null, pay: 9 },
        { currency: "AED", sell: "invalid" },
        { currency: "JPY", sell: Infinity },
        { currency: "", sell: 3 },
        { currency: "   ", sell: 4 },
      ],
    ]) {
      const record = shop();
      record.lastdata.finances = finances;
      const result = await fixture(Modern, { shop: record, compact });
      const orders = result.document.querySelector(
        ".b-shop-card-modern__orders",
      );
      const slot = orders.querySelector(".b-shop-card-modern__sales-slot");
      assert.ok(slot);
      assert.equal(
        slot.previousElementSibling.className,
        "b-shop-card-modern__queue",
      );
      assert.equal(slot.querySelector("button"), null);
      assert.equal(
        slot.textContent.trim(),
        "user_dashboard.shops.modern.sales_hint_product",
      );
      assert.deepEqual(plain(result.context.sales_finances), []);
      assert.equal(result.context.finances, finances || null);
    }
  }
  for (const [id, hint] of [
    [42, "product"],
    [43, "story"],
    [44, "steps"],
    ["44", "product"],
    [Number.MAX_SAFE_INTEGER + 1, "product"],
  ]) {
    for (const compact of [false, true]) {
      const result = await fixture(Modern, { shop: shop({ id }), compact });
      assert.equal(
        result.document
          .querySelector(".b-shop-card-modern__sales-empty")
          .textContent.trim(),
        "user_dashboard.shops.modern.sales_hint_" + hint,
      );
    }
  }
  assert.match(
    styleCodes.get(new URL("./BShopCardModern.vue", import.meta.url).href),
    /\.b-shop-card-modern__sales-slot[^{}]*\{[^{}]*(?:height|min-height):\s*44px/,
  );
});

test("sales digest shows two signed native-currency values with a truthful overflow count and every exact amount in its tooltip", async () => {
  const finances = [
    { currency: "USD", sell: 1234.56, pay: 1 },
    { currency: "EUR", sell: -0.25, pay: 9 },
    { currency: "AED", sell: 12.5, pay: 0 },
    { currency: "JPY", sell: 900, pay: 5 },
    { currency: "GBP", sell: 0, pay: 40 },
  ];
  for (const compact of [false, true]) {
    const record = shop();
    record.lastdata.finances = finances;
    const result = await fixture(Modern, { shop: record, compact });
    assert.deepEqual(
      plain(result.context.sales_finances),
      finances.slice(0, 4),
    );
    assert.deepEqual(plain(result.context.visible_sales), finances.slice(0, 2));
    const sales = result.document.querySelector(
      "button.b-shop-card-modern__sales",
    );
    assert.ok(sales);
    assert.equal(sales.type, "button");
    assert.ok(sales.getAttribute("aria-label"));
    const pairs = (element) =>
      [...element.querySelectorAll("[data-amount]")].map((item) => [
        item.dataset.currency,
        Number(item.dataset.amount),
      ]);
    assert.deepEqual(pairs(sales), [
      ["USD", 1234.56],
      ["EUR", -0.25],
    ]);
    assert.deepEqual(
      [...sales.querySelectorAll("[data-amount]")].map(
        (item) => item.dataset.compact,
      ),
      ["true", "false"],
    );
    assert.equal(
      sales.querySelector(".b-shop-card-modern__sales-more").textContent.trim(),
      "+2",
    );
    const tooltip = result.document.querySelector(
      '.b-shop-card-modern__sales-slot [data-leaf="v-tooltip"]',
    );
    assert.deepEqual(
      [
        ...tooltip.querySelectorAll(".b-shop-card-modern__money [data-amount]"),
      ].map((item) => [item.dataset.currency, Number(item.dataset.amount)]),
      finances.slice(0, 4).map((item) => [item.currency, item.sell]),
    );
    assert.ok(
      [
        ...tooltip.querySelectorAll(".b-shop-card-modern__money [data-amount]"),
      ].every((item) => item.dataset.compact === "false"),
    );
    const flags = result.controls.filter(
      (item) => item.name === "UCurrencyIcon",
    );
    assert.ok(
      flags.every(
        (item) =>
          item.attrs["flag-only"] === "" && item.attrs.flag === undefined,
      ),
    );
    assert.equal(tooltip.getAttribute("location"), "top");
    assert.ok(tooltip.hasAttribute("open-on-focus"));
    assert.ok(tooltip.hasAttribute("open-on-click"));
    assert.deepEqual(
      plain(result.context.finances),
      finances,
      "Full finance details keep zero and payment rows",
    );
    record.lastdata.finances = [finances[2], finances[1]];
    const small = await fixture(Modern, { shop: record, compact });
    const smallValues = small.document.querySelector(
      ".b-shop-card-modern__sales-values",
    );
    assert.deepEqual(pairs(smallValues), [
      ["AED", 12.5],
      ["EUR", -0.25],
    ]);
    assert.ok(
      [...smallValues.querySelectorAll("[data-amount]")].every(
        (item) => item.dataset.compact === "false",
      ),
    );
  }
});

test("EN/FA sales report help uses the actual native local and relative date helpers on the report start, independently of update time", async () => {
  const clock = Date.parse("2020-05-03T00:00:00Z");
  class FixedDate extends Date {
    constructor(...values) {
      super(...(values.length ? values : [clock]));
    }
    static now() {
      return clock;
    }
  }
  const calendar = evaluate(
    readFileSync(
      new URL(
        "../../../../core-js/enums/language/Calendar.ts",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const converter = evaluate(
    readFileSync(
      new URL(
        "../../../../core-js/helper/date/DateConverter.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    { Date: FixedDate, window, require: () => calendar },
  );
  const dates = evaluate(
    readFileSync(
      new URL("../../../mixin/date/DateMixin.ts", import.meta.url),
      "utf8",
    ),
    { window, require: () => converter },
  ).default.methods;
  const previousTimezone = process.env.TZ,
    previousLanguage = window.$language;
  process.env.TZ = "Etc/GMT+8";
  try {
    for (const [lang, locale, calendar] of [
      ["en", "en-US", "gregory"],
      ["fa", "fa-IR", "persian"],
    ]) {
      window.$language = { full_locale: locale, calendar: { calendar } };
      const copy = evaluate(
        readFileSync(
          new URL(
            `../../../../translate/dashboard/${lang}.ts`,
            import.meta.url,
          ),
          "utf8",
        ),
      ).default;
      const translate = (key, values = {}) =>
        String(
          key.split(".").reduce((value, part) => value?.[part], copy) || key,
        ).replace(/\{([^}]+)\}/g, (_, name) =>
          String(values[name] ?? `{${name}}`),
        );
      const record = shop();
      record.lastdata.finances = [{ currency: "USD", sell: -12.5, pay: 7 }];
      record.lastdata.created_at = "2020-05-01T00:00:00Z";
      record.lastdata.updated_at = "2020-05-02T14:15:00Z";
      const app = application(Modern, { shop: record });
      Object.assign(app.config.globalProperties, dates, { $t: translate });
      const doc = new JSDOM(await renderToString(app)).window.document;
      const tooltip = doc.querySelector(
        '.b-shop-card-modern__sales-slot [data-leaf="v-tooltip"]',
      );
      const time = tooltip.querySelector("time");
      assert.equal(time.getAttribute("datetime"), record.lastdata.created_at);
      const absolute = Intl.DateTimeFormat(locale, {
        calendar,
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date(record.lastdata.created_at));
      const relative = new Intl.RelativeTimeFormat(locale, {
        numeric: "auto",
        style: "long",
      }).format(-2, "day");
      assert.ok(tooltip.textContent.includes(absolute));
      assert.ok(tooltip.textContent.includes(relative));
      assert.ok(
        tooltip.textContent.includes(
          copy.user_dashboard.shops.modern.sales_scope,
        ),
      );
      assert.ok(!tooltip.textContent.includes(record.lastdata.updated_at));
      assert.ok(!tooltip.textContent.includes("user_dashboard.shops.modern."));
      if (lang === "en")
        assert.ok(
          absolute.includes("Apr 30"),
          "UTC report start is displayed on the correct local day",
        );
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
    window.$language = previousLanguage;
  }
  for (const created_at of [null, "invalid"]) {
    const record = shop();
    record.lastdata.created_at = created_at;
    record.lastdata.finances = [{ currency: "USD", sell: 10 }];
    const result = await fixture(Modern, { shop: record });
    const tooltip = result.document.querySelector(
      '.b-shop-card-modern__sales-slot [data-leaf="v-tooltip"]',
    );
    assert.equal(tooltip.querySelector("time"), null);
    assert.ok(
      tooltip.textContent.includes(
        "user_dashboard.shops.modern.sales_report_unavailable",
      ),
    );
  }
});

test("public website displays only the canonical native address, preserving local, primary custom and historical host destinations", async () => {
  const cases = [
    [
      { domain: "https://studio.example/catalog?source=shops#top" },
      "https://studio.example/catalog?source=shops#top",
      "studio.example/catalog",
    ],
    [
      { domain: "http://localhost:9000/@studio" },
      "http://localhost:9000/@studio",
      "localhost:9000/@studio",
    ],
    [{ domain: "studio.example" }, "https://studio.example/", "studio.example"],
    [
      { domain: "studio.example:8443/path" },
      "https://studio.example:8443/path",
      "studio.example:8443/path",
    ],
    [
      { domain: "localhost:9000/@studio" },
      "https://localhost:9000/@studio",
      "localhost:9000/@studio",
    ],
    [
      { domain: "//studio.example/catalog" },
      "https://studio.example/catalog",
      "studio.example/catalog",
    ],
    [
      { domain: null },
      "http://localhost:9000/@fixture-shop",
      "localhost:9000/@fixture-shop",
    ],
    [
      { domains: [{ primary: true, domain: "custom.example" }] },
      "https://custom.example/",
      "custom.example",
    ],
    [
      {
        domains: [
          { primary: false, domain: "secondary.example" },
          { primary: true, domain: "custom.example" },
        ],
        domain: "legacy.example",
      },
      "https://custom.example/",
      "custom.example",
    ],
    [
      { domains: [{ primary: true, domain: null }], domain: "legacy.example" },
      "http://localhost:9000/@fixture-shop",
      "localhost:9000/@fixture-shop",
    ],
    [
      { domains: [], sub: { enable: true, primary: true } },
      "https://fixture-shop.shops.example/",
      "fixture-shop.shops.example",
    ],
    [
      {
        domains: [],
        domain: "legacy.example",
        sub: { enable: true, primary: true },
      },
      "https://fixture-shop.shops.example/",
      "fixture-shop.shops.example",
    ],
  ];
  for (const [fields, expected, label] of cases) {
    const result = await fixture(Modern, { shop: shop(fields) });
    const link = result.document.querySelector(
      ".b-shop-card-modern__website-open",
    );
    assert.equal(link.getAttribute("href"), expected);
    assert.equal(link.getAttribute("target"), "_blank");
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
    assert.ok(link.textContent.includes("north_east"));
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__website-address")
        .textContent,
      label,
    );
    const section = result.document.querySelector(
      ".b-shop-card-modern__website",
    );
    assert.equal(section.querySelectorAll("a").length, 1);
    assert.equal(
      section.querySelectorAll(".b-shop-card-modern__website-address").length,
      1,
    );
    assert.ok(!section.textContent.includes("legacy.example"));
    assert.ok(!section.textContent.includes("secondary.example"));
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__copy").dataset
        .copyValue,
      expected,
    );
    assert.ok(
      result.controls.some(
        (item) =>
          item.name === "tooltip" &&
          item.attrs.text === "user_dashboard.shops.modern.copy_address" &&
          item.attrs.location === "top" &&
          item.attrs.openOnFocus,
      ),
    );
  }
});

test("invalid domain metadata stays hidden while the real shop name gets one safe native fallback or an unavailable state", async () => {
  const domains = [
    "javascript:alert(1)",
    "data:text/html,hello",
    "mailto:shop@example.com",
    "https://owner:secret@studio.example",
    "https://studio.example/\npath",
    "*.selldone.com",
    "https://*.selldone.com",
    "https://%2A.selldone.com",
    "https://%2a.selldone.com",
    "https://[invalid",
  ];
  for (const domain of domains) {
    const result = await fixture(Modern, { shop: shop({ domain }) });
    const link = result.document.querySelector(
      ".b-shop-card-modern__website-open",
    );
    assert.equal(
      link.getAttribute("href"),
      "http://localhost:9000/@fixture-shop",
      domain,
    );
    assert.equal(link.getAttribute("target"), "_blank");
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__copy").dataset
        .copyValue,
      link.getAttribute("href"),
    );
    const section = result.document.querySelector(
      ".b-shop-card-modern__website",
    );
    assert.equal(section.querySelectorAll("a").length, 1);
    assert.ok(!section.textContent.includes(domain), domain);
  }
  const related = await fixture(Modern, {
    shop: shop({
      domains: [{ primary: true, domain: "*.selldone.com" }],
      domain: "legacy.example",
    }),
  });
  assert.equal(
    related.context.public_website.url,
    "http://localhost:9000/@fixture-shop",
  );
  const relatedSection = related.document.querySelector(
    ".b-shop-card-modern__website",
  );
  assert.equal(relatedSection.querySelectorAll("a").length, 1);
  assert.ok(!relatedSection.textContent.includes("*.selldone.com"));
  assert.ok(!relatedSection.textContent.includes("legacy.example"));
  for (const fields of [
    { domain: null, name: undefined },
    { domain: "", name: "" },
    { domain: null, name: "   " },
    { domains: [], name: null },
    { domains: [], domain: "legacy.example", name: undefined },
    { domains: [], domain: "legacy.example", name: "" },
    { domains: [{ primary: true, domain: "*.selldone.com" }], name: undefined },
    { domain: "javascript:alert(1)", name: undefined },
  ]) {
    const result = await fixture(Modern, { shop: shop(fields) });
    assert.equal(result.context.public_website, null);
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__website-open"),
      null,
    );
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__copy"),
      null,
    );
    assert.ok(
      result.document
        .querySelector(".b-shop-card-modern__website")
        .textContent.includes(
          "user_dashboard.shops.modern.website_unavailable",
        ),
    );
    assert.equal(
      result.document.querySelector('a[href*="/@undefined"], a[href$="/@"]'),
      null,
    );
    const section = result.document.querySelector(
      ".b-shop-card-modern__website",
    );
    assert.equal(section.querySelectorAll("a").length, 0);
    assert.ok(!section.textContent.includes("legacy.example"));
    assert.ok(!section.textContent.includes("*.selldone.com"));
    assert.ok(!section.textContent.includes("javascript:"));
  }
});

test("every real business model is visible above collapsed activity and unknown models are not relabeled as normal", async () => {
  const { BusinessModel } = dependency(
    "@selldone/core-js/enums/shop/BusinessModel",
  );
  for (const compact of [false, true]) {
    for (const model of Object.values(BusinessModel)) {
      const result = await fixture(Modern, {
        shop: shop({ model: model.code }),
        compact,
      });
      const label = result.document.querySelector(
        ".b-shop-card-modern__business-model",
      );
      assert.equal(label.querySelector("span").textContent, model.name);
      assert.equal(
        label.querySelector('[data-leaf="v-icon"]').textContent.trim(),
        model.icon,
      );
      assert.equal(label.closest(".b-shop-card-modern__details"), null);
      assert.equal(
        result.document.querySelector(".b-shop-card-modern__details").style
          .display,
        "none",
      );
    }
    const unknown = await fixture(Modern, {
      shop: shop({ model: "future-model" }),
      compact,
    });
    assert.equal(
      unknown.document.querySelector(".b-shop-card-modern__business-model span")
        .textContent,
      "user_dashboard.shops.modern.unknown",
    );
  }
});

test("domain and renewal links respect each row's native Settings read/write grants and overrides", async () => {
  const cases = [
    [7, [], true, true],
    [8, [], false, false],
    [8, [{ level: "VIEWER" }], true, false],
    [8, [{ level: "ADMIN" }], true, true],
    [
      8,
      [{ level: "ADMIN", override: { "SETTINGS-READ": false } }],
      false,
      false,
    ],
    [
      8,
      [{ level: "ADMIN", override: { "SETTINGS-WRITE": false } }],
      true,
      false,
    ],
    [
      8,
      [{ level: "PRODUCT", override: { "SETTINGS-WRITE": true } }],
      true,
      true,
    ],
    [
      8,
      [
        {
          level: "VIEWER",
          override: { "SETTINGS-READ": false, "SETTINGS-WRITE": true },
        },
      ],
      false,
      false,
    ],
    [
      8,
      [
        { level: "ADMIN", override: { "SETTINGS-READ": false } },
        { level: "VIEWER" },
      ],
      true,
      true,
    ],
  ];
  for (const [user_id, shop_permissions, read, write] of cases) {
    const result = await fixture(Modern, {
      shop: shop({ user_id, shop_permissions, expire_at: "2020-01-01" }),
    });
    assert.equal(Boolean(result.context.can_view_settings), read);
    assert.equal(Boolean(result.context.can_renew_license), write);
    assert.equal(
      Boolean(
        result.document.querySelector('[data-route="BPageShopSettingDomain"]'),
      ),
      read,
    );
    assert.equal(
      Boolean(result.document.querySelector(".b-shop-card-modern__renew")),
      write,
    );
    assert.ok(
      result.document.querySelector(".b-shop-card-modern__expired"),
      "Expiry information remains visible without write access",
    );
  }
  for (const expire_at of [null, "2999-01-01", "invalid"]) {
    const result = await fixture(Modern, { shop: shop({ expire_at }) });
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__expired"),
      null,
    );
    assert.equal(
      result.document.querySelector(".b-shop-card-modern__renew"),
      null,
    );
  }
});

test("main card disclosure preserves focus and native action-menu tooltips stop while that menu is open", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  const app = application(Modern, { shop: shop() });
  const state = app.mount(host);
  try {
    const button = host.querySelector(".b-shop-card-modern__expand"),
      panel = host.querySelector(
        '[id="' + button.getAttribute("aria-controls") + '"]',
      );
    assert.equal(panel.style.display, "none");
    button.focus();
    button.dispatchEvent(
      new window.MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        detail: 0,
      }),
    );
    await Vue.nextTick();
    assert.equal(button.getAttribute("aria-expanded"), "true");
    assert.equal(panel.style.display, "");
    assert.equal(document.activeElement, button);
    button.click();
    await Vue.nextTick();
    assert.equal(panel.style.display, "none");
    assert.equal(document.activeElement, button);
    const menuButton = host.querySelector(".b-shop-card-modern__menu-button");
    assert.equal(menuButton.dataset.tooltipDisabled, "false");
    state.menu_open = true;
    await Vue.nextTick();
    assert.equal(menuButton.dataset.tooltipDisabled, "true");
    state.menu_open = false;
    await Vue.nextTick();
    assert.equal(menuButton.dataset.tooltipDisabled, "false");
  } finally {
    app.unmount();
    host.remove();
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
