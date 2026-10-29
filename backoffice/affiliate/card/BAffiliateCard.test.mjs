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
window.URLS = { MainServiceUrl: () => "https://main.local" };
const Vue = await import("vue");
const { createMemoryHistory, createRouter } = await import("vue-router");
let copied;
document.execCommand = (command) => {
  assert.equal(command, "copy");
  copied = document.querySelector("textarea").value;
  return true;
};

function leaf(name) {
  return Vue.defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        if (name === "UPrice")
          return Vue.h(
            "span",
            {
              ...attrs,
              class: ["u--price", attrs.class],
              "data-amount": attrs.amount,
              "data-currency": attrs.currency,
            },
            String(attrs.amount),
          );
        if (name === "ProductsDenseImagesCircles")
          return Vue.h("div", {
            ...attrs,
            "data-products": JSON.stringify(attrs.ids),
          });
        return Vue.h("div", { ...attrs, "data-leaf": name }, [
          slots.label?.(),
          slots.activator?.({ props: {} }),
          slots.default?.(),
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
    window,
    document,
    console,
  });
  return exports;
}
function dependency(name) {
  if (name === "vue") return Vue;
  if (name.endsWith("NotificationService.ts"))
    return { default: { showSuccessAlert() {} } };
  if (name.endsWith("DateMixin.ts"))
    return {
      default: { methods: { getLocalTimeString: (value) => `Local ${value}` } },
    };
  if (name.endsWith("UTextValueDashed.vue")) return { default: Dashed };
  if (name.endsWith(".vue"))
    return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
  throw new Error(`Unexpected dependency: ${name}`);
}
function load(path) {
  const filename = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
    filename: filename.pathname,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "affiliate-card-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: filename.pathname,
    id: "affiliate-card-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  return {
    descriptor,
    component: {
      ...evaluate(descriptor.script.content).default,
      render: evaluate(template.code).render,
    },
  };
}
const Dashed = load(
  "../../../ui/text/value-dashed/UTextValueDashed.vue",
).component;
const { component: Card, descriptor } = load("./BAffiliateCard.vue");
const Copy = evaluate(
  readFileSync(
    new URL("../../../directives/copy/CopyDirective.ts", import.meta.url),
    "utf8",
  ),
).default;
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({
    source: style.content,
    filename: "BAffiliateCard.vue",
    id: "affiliate-card-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(result.errors, []);
}

const record = (overrides = {}) => ({
  id: 14,
  shop_id: 3,
  name: "Contract <plain text>",
  enable: true,
  shop: {
    title: "Fixture shop",
    name: "fixture-shop",
    domain: "https://store.local",
  },
  code: "ContractCode",
  balance: 0,
  payment: 8475.35,
  currency: "EUR",
  fix: 1.25,
  percent: 5,
  products: { 71: {}, "c-24": {} },
  commission: null,
  created_at: "2026-10-28",
  ...overrides,
});
async function fixture(overrides = {}, props = {}, rtl = false) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/", name: "start", component: { render: () => null } },
      {
        path: "/affiliates/:affiliate_id",
        name: "BPageAffiliatorDashboard",
        component: { render: () => null },
      },
      {
        path: "/custom/:affiliate_id",
        name: "custom-contract",
        component: { render: () => null },
      },
    ],
  });
  await router.push("/");
  const affiliate = Vue.reactive(record(overrides));
  const app = Vue.createApp(Card, { affiliate, ...props });
  app.use(router);
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $vuetify: { locale: { isRtl: rtl } },
    window,
    getShopIcon: (id) => `/fixture-shop-${id}.png`,
  });
  for (const name of [
    "s-widget",
    "v-avatar",
    "v-img",
    "v-icon",
    "v-spacer",
    "v-row",
    "v-col",
    "v-tooltip",
  ])
    app.component(name, leaf(name));
  app.directive("copy", Copy);
  const host = document.createElement("div");
  document.body.append(host);
  app.mount(host);
  return {
    host,
    affiliate,
    router,
    close() {
      app.unmount();
      host.remove();
    },
  };
}
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Vue.nextTick();
};

test("legacy callers keep the existing widget, data and optional contact rows", async () => {
  const result = await fixture({
    email: "a@example.test",
    web: "https://profile.local",
    tel: "+100000",
    address: "Fixture address",
    bank: "Fixture bank",
  });
  try {
    assert.equal(result.host.querySelector("article"), null);
    assert.ok(result.host.querySelector('[data-leaf="s-widget"]'));
    for (const value of [
      "a@example.test",
      "https://profile.local",
      "+100000",
      "Fixture address",
      "Fixture bank",
      "ContractCode",
    ])
      assert.ok(result.host.textContent.includes(value));
    assert.equal(
      result.host
        .querySelector('[data-amount="0"]')
        .getAttribute("data-currency"),
      "EUR",
    );
  } finally {
    result.close();
  }
});

test("modern cards preserve zero/native-currency amounts, fixed/percentage terms and selected products", async () => {
  const result = await fixture({}, { modern: true });
  try {
    const article = result.host.querySelector("article");
    assert.ok(article);
    assert.ok(article.textContent.includes("Contract <plain text>"));
    assert.equal(article.querySelector("plain"), null);
    assert.equal(
      article.querySelector('[data-leaf="v-img"]').getAttribute("src"),
      "/fixture-shop-3.png",
    );
    for (const value of [
      "Fixture shop",
      "@fixture-shop",
      "Local 2026-10-28",
      "5%",
    ])
      assert.ok(article.textContent.includes(value));
    assert.equal(
      article
        .querySelector(".b-affiliate-card-modern__balance")
        .getAttribute("data-amount"),
      "0",
    );
    assert.equal(
      article
        .querySelector(".b-affiliate-card-modern__payment")
        .getAttribute("data-amount"),
      "8475.35",
    );
    assert.equal(article.querySelectorAll('[data-currency="EUR"]').length, 3);
    assert.deepEqual(
      JSON.parse(
        article.querySelector("[data-products]").getAttribute("data-products"),
      ),
      ["71", "c-24"],
    );
    assert.equal(
      article.querySelectorAll(
        ".b-affiliate-card-modern__terms .s--value-dashed",
      ).length,
      2,
    );
    assert.ok(article.querySelector(".sd-modern-status__dot--success"));
  } finally {
    result.close();
  }
});

test("per-product and all-product branches retain inactive status, contact data and RTL arrow", async () => {
  const result = await fixture(
    {
      enable: false,
      commission: { 71: {} },
      products: {},
      email: "affiliate@example.test",
      web: "https://profile.local",
      tel: "+100000",
      address: "Fixture address",
      bank: "Fixture bank",
    },
    { modern: true },
    true,
  );
  try {
    assert.ok(
      result.host.querySelector(".b-affiliate-card-modern__per-product"),
    );
    assert.equal(
      result.host.querySelectorAll(
        ".b-affiliate-card-modern__terms .s--value-dashed",
      ).length,
      0,
    );
    assert.equal(result.host.querySelector("[data-products]"), null);
    assert.ok(result.host.textContent.includes("my_affiliate.all_products"));
    assert.ok(result.host.querySelector(".sd-modern-status__dot--error"));
    assert.ok(
      result.host.querySelector(".b-affiliate-card-modern__arrow--rtl"),
    );
    for (const value of [
      "affiliate@example.test",
      "https://profile.local",
      "+100000",
      "Fixture address",
      "Fixture bank",
    ])
      assert.ok(
        result.host
          .querySelector(".b-affiliate-card-modern__contacts")
          .textContent.includes(value),
      );
  } finally {
    result.close();
  }
});

test("copy preserves custom/fallback URLs and refreshes when the code changes without navigating", async () => {
  for (const domain of ["https://store.local/custom", null]) {
    const result = await fixture(
      { shop: { title: "Fixture shop", name: "fixture-shop", domain } },
      { modern: true },
    );
    try {
      const base = domain || "https://main.local/@fixture-shop";
      result.host.querySelector(".b-affiliate-card-modern__copy").click();
      assert.equal(copied, `${base}?utm_affiliate=ContractCode`);
      assert.equal(result.router.currentRoute.value.name, "start");
      result.affiliate.code = "UpdatedCode";
      await Vue.nextTick();
      result.host.querySelector(".b-affiliate-card-modern__copy").click();
      assert.equal(copied, `${base}?utm_affiliate=UpdatedCode`);
      assert.equal(result.router.currentRoute.value.name, "start");
    } finally {
      result.close();
    }
  }
});

test("native contract links keep custom destinations and browser modifier behavior", async () => {
  const to = {
    name: "custom-contract",
    params: { affiliate_id: 14 },
    query: { return: "kept" },
  };
  const result = await fixture({}, { modern: true, to });
  try {
    const link = result.host.querySelector(
      ".b-affiliate-card-modern__contract-link",
    );
    assert.equal(link.getAttribute("href"), result.router.resolve(to).href);
    assert.equal(
      result.host.querySelectorAll("a a, a button, button a").length,
      0,
    );
    for (const modifier of [
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
      { button: 1 },
    ]) {
      let prevented;
      link.addEventListener(
        "click",
        (event) => {
          prevented = event.defaultPrevented;
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
      assert.equal(prevented, false);
      assert.equal(result.router.currentRoute.value.name, "start");
    }
    for (const help of result.host.querySelectorAll(".sd-modern-info-button"))
      help.click();
    await settle();
    assert.equal(result.router.currentRoute.value.name, "start");
    link.click();
    await settle();
    assert.equal(result.router.currentRoute.value.name, "custom-contract");
    assert.equal(result.router.currentRoute.value.query.return, "kept");
  } finally {
    result.close();
  }
});
