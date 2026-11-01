import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import numeral from "numeral";

const file = new URL("./BDashboardShopFinance.vue", import.meta.url);
const repository = new URL("../../../../../../", import.meta.url);
const source = readFileSync(file, "utf8");
const { descriptor, errors } = parse(source, { filename: file.pathname });
assert.deepEqual(errors, []);
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "finance-dashboard-test",
});
assert.deepEqual(compiled.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({
    source: style.content,
    filename: file.pathname,
    id: "finance-dashboard-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(result.errors, []);
}

// The actual component and optional helper owners run against synthetic data only.
function fixture({
  modern = true,
  gateways = [],
  currencies = ["USD", "EUR"],
  pay = true,
  count = true,
} = {}) {
  const modules = new Map();
  const boundaries = [];
  const windows = {
    $language: { full_locale: "en-US", calendar: { calendar: "gregory" } },
  };
  const transpile = (text) =>
    ts.transpileModule(text, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
  const leaf = (name) => ({
    name,
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        boundaries.push({ name, attrs });
        return Vue.h("div", { ...attrs, "data-feature": name }, [
          slots.actions?.(),
          slots.default?.(),
        ]);
      };
    },
  });
  const evaluate = (text, url) => {
    const exports = {};
    vm.runInNewContext(transpile(text), {
      exports,
      require: (name) => dependency(name, url),
      window: windows,
      Date,
      Intl,
      console,
      axios: new Proxy(
        {},
        {
          get: () =>
            assert.fail("Finance presentation tests must not make requests"),
        },
      ),
    });
    return exports;
  };
  function load(url) {
    if (!modules.has(url.href))
      modules.set(url.href, evaluate(readFileSync(url, "utf8"), url));
    return modules.get(url.href);
  }
  function dependency(name, parent) {
    if (name === "vue") return Vue;
    if (name === "numeral") return { default: numeral };
    if (/\.(svg|png)$/.test(name)) return name;
    if (name.endsWith(".vue"))
      return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    if (name === "lodash-es")
      return {
        isObject: (value) => value !== null && typeof value === "object",
        isString: (value) => typeof value === "string",
      };
    if (name === "@selldone/core-js/helper")
      return {
        CurrencyHelper: load(
          new URL(
            "@selldone/core-js/helper/currency/CurrencyHelper.ts",
            repository,
          ),
        ).CurrencyHelper,
        PriceHelper: {},
      };
    if (name.endsWith("/models") || name === "../../models")
      return { Basket: {} };
    if (name.startsWith("@selldone/"))
      return load(
        new URL(name.endsWith(".ts") ? name : `${name}.ts`, repository),
      );
    if (name.startsWith("."))
      return load(new URL(name.endsWith(".ts") ? name : `${name}.ts`, parent));
    assert.fail(`Unexpected finance dependency: ${name}`);
  }
  const component = evaluate(descriptor.script.content, file).default;
  component.render = evaluate(compiled.code, file).render;
  const createNode = (tag, text = "") => ({
    tag,
    text,
    props: {},
    children: [],
    parent: null,
  });
  const remove = (node) => {
    if (node.parent)
      node.parent.children.splice(node.parent.children.indexOf(node), 1);
    node.parent = null;
  };
  const renderer = Vue.createRenderer({
    createElement: (tag) => createNode(tag),
    createText: (text) => createNode("text", text),
    createComment: (text) => createNode("comment", text),
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) =>
      node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
    patchProp: (node, name, previous, value) => {
      node.props[name] = value;
    },
    remove,
    insert(node, parent, anchor = null) {
      remove(node);
      node.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(
        index < 0 ? parent.children.length : index,
        0,
        node,
      );
    },
  });
  const today = {
    sell_products_physical: 0,
    sell_products_virtual: 0,
    sell_products_file: 0,
    sell_products_service: 0,
    sell_products_subscription: 0,
    finances: [],
  };
  const report = {
    raw_data: [],
    days: 30,
    offset: 0,
    todayData: () => today,
    yesterdayData: () => today,
    todayDataOffset: () => today,
    financeTotalOf: () => ({}),
  };
  const current = Vue.shallowRef({
    modern,
    shop: { id: 11, currencies },
    shopGateways: gateways,
    timeSeries: report,
    pay,
    count,
  });
  const instance = Vue.shallowRef();
  const app = renderer.createApp({
    render: () => Vue.h(component, { ...current.value, ref: instance }),
  });
  Object.assign(app.config.globalProperties, {
    $t: (key, values) => key + (values ? JSON.stringify(values) : ""),
    $n: (value) => String(value),
    $vuetify: { theme: { current: { dark: false } }, locale: { isRtl: false } },
    // These are actual Core/application/plugin globals, never optional mixin helpers.
    isObject: (value) => value !== null && typeof value === "object",
    getShopImagePath: (path) => `/fixture-images/${path}`,
    GetFinanceValueByCurrency: (data, currency, key) =>
      data.finances?.find((item) => item.currency === currency)?.[key] ?? 0,
    numeralFormat: (value, format) => numeral(value).format(format),
  });
  app.config.warnHandler = (message) => {
    throw Error(message);
  };
  app.directive("tooltip", {});
  const link = {
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        Vue.h(
          attrs.to ? "a" : "button",
          {
            ...attrs,
            "data-route": attrs.to?.name,
            "data-gateway-code": attrs.to?.params?.gateway_code,
          },
          [slots.prepend?.(), slots.default?.(), slots.append?.()],
        );
    },
  };
  for (const name of ["router-link", "RouterLink", "v-btn", "VBtn"])
    app.component(name, link);
  for (const match of compiled.code.matchAll(
    /_resolveComponent\("([^"]+)"\)/g,
  )) {
    const name = match[1];
    const pascal = name.replace(/(^|-)([a-z])/g, (_, dash, letter) =>
      letter.toUpperCase(),
    );
    if (
      !app.component(name) &&
      !component.components?.[name] &&
      !component.components?.[pascal]
    )
      app.component(name, leaf(name));
  }
  const container = createNode("root");
  app.mount(container);
  const elements = (root = container) => [
    root,
    ...root.children.flatMap((child) => elements(child)),
  ];
  const text = (node) => [node.text, ...node.children.map(text)].join(" ");
  return {
    app,
    current,
    boundaries,
    elements,
    text,
    get vm() {
      return instance.value;
    },
    get links() {
      return elements().filter((node) => node.props["data-route"]);
    },
    get charts() {
      return elements().filter((node) =>
        /SChartFunnel(Finance|Data)/.test(node.props["data-feature"] || ""),
      );
    },
    async choose(values) {
      const control = elements().find((node) =>
        /v-btn-toggle/i.test(node.props["data-feature"] || ""),
      );
      assert.ok(
        control.props.multiple !== undefined,
        "Measure choices remain multiple selections.",
      );
      control.props["onUpdate:modelValue"](values);
      await Vue.nextTick();
    },
  };
}

const gateway = (id, currency, extras = {}) => ({
  id,
  enable: true,
  livemode: true,
  gateway: {
    code: `provider-${id}`,
    currency,
    name: `Provider ${id}`,
    icon: `${id}.svg`,
    enable: true,
    ...extras.gateway,
  },
  ...Object.fromEntries(
    Object.entries(extras).filter(([key]) => key !== "gateway"),
  ),
});

test("currency tree renders every configured service, including more than the former 100-row page", () => {
  const gateways = Array.from({ length: 107 }, (_, index) =>
    gateway(index + 1, index % 2 ? "EUR" : "USD"),
  );
  const before = JSON.stringify(gateways);
  const f = fixture({ gateways });
  try {
    const details = f.elements().filter((node) => node.tag === "details");
    assert.equal(details.length, 2);
    assert.ok(
      details.every(
        (node) => node.props.open !== undefined && node.props.open !== false,
      ),
    );
    const services = f.links.filter(
      (node) => node.props["data-route"] === "BPageGatewayDashboard",
    );
    assert.equal(services.length, 107);
    assert.deepEqual(
      new Set(services.map((node) => node.props["data-gateway-code"])),
      new Set(gateways.map((item) => item.gateway.code)),
    );
    assert.ok(f.text(details[0]).includes("EUR"));
    assert.ok(f.text(details[1]).includes("USD"));
    assert.equal(
      JSON.stringify(gateways),
      before,
      "Grouping must not mutate source records.",
    );
  } finally {
    f.app.unmount();
  }
});

test("service rows retain independent shop, environment and provider states plus payment type and destination", () => {
  const gateways = [
    gateway(1, "EUR", {
      enable: false,
      gateway: { name: "Bank transfer", dir: true },
    }),
    gateway(2, "USD", {
      livemode: false,
      gateway: { name: "Cash on delivery", cod: true, enable: false },
    }),
    gateway(3, "USD", { gateway: { name: "Cash payment", cash: true } }),
    gateway(4, "USD", { gateway: { name: "Online service" } }),
  ];
  const f = fixture({ gateways });
  try {
    const service = (id) =>
      f.links.find(
        (node) => node.props["data-gateway-code"] === `provider-${id}`,
      );
    assert.match(f.text(service(1)), /Bank transfer/);
    assert.match(f.text(service(1)), /global\.inactive/);
    assert.match(f.text(service(1)), /global\.commons\.dir_payment/);
    assert.match(f.text(service(1)), /live_mode/);
    assert.match(f.text(service(2)), /global\.active/);
    assert.match(f.text(service(2)), /debug_mode/);
    assert.match(f.text(service(2)), /gateway_globally_disabled/);
    assert.match(f.text(service(2)), /global\.commons\.COD/);
    assert.match(f.text(service(3)), /global\.commons\.cash/);
    assert.match(f.text(service(4)), /global\.commons\.online/);
    for (const item of gateways) {
      assert.equal(service(item.id).props.to.name, "BPageGatewayDashboard");
      assert.equal(
        service(item.id).props.to.params.gateway_code,
        item.gateway.code,
      );
    }
    assert.ok(
      f.links.some(
        (node) => node.props["data-route"] === "BPageShopFinanceGateways",
      ),
    );
    assert.ok(
      f.links.some(
        (node) => node.props["data-route"] === "BPageShopFinanceExchange",
      ),
    );
  } finally {
    f.app.unmount();
  }
});

test("measure selection remains independent and keeps all six sales-count series", async () => {
  const f = fixture();
  try {
    assert.deepEqual(Array.from(f.vm.mode_funnel), ["pay", "count"]);
    await f.choose(["pay", "sell", "count"]);
    const amounts = f.charts.filter(
      (node) => node.props["data-feature"] === "SChartFunnelFinance",
    );
    assert.deepEqual(
      amounts.map((node) => node.props["finance-key"] || node.props.financeKey),
      ["pay", "sell"],
    );
    assert.ok(amounts.every((node) => node.props.modern === true));
    const count = f.charts.find(
      (node) => node.props["data-feature"] === "SChartFunnelData",
    );
    assert.deepEqual(Array.from(count.props.keys), [
      "sell_products_physical",
      "sell_products_virtual",
      "sell_products_file",
      "sell_products_service",
      "sell_products_subscription",
      "sell_avocados",
    ]);
    await f.choose(["sell", "discount"]);
    assert.deepEqual(Array.from(f.vm.mode_funnel), ["sell", "discount"]);
    assert.equal(
      f.charts.some(
        (node) => node.props["data-feature"] === "SChartFunnelData",
      ),
      false,
    );
    await f.choose([]);
    assert.equal(f.charts.length, 0);
  } finally {
    f.app.unmount();
  }
});

test("an unrelated measure update preserves the native currency disclosure state", async () => {
  const f = fixture({ gateways: [gateway(1, "USD")] });
  try {
    const details = f.elements().find((node) => node.tag === "details");
    // Native details owns its open property after the initial render.
    details.props.open = false;
    await f.choose(["pay", "sell", "count"]);
    assert.equal(
      f.elements().find((node) => node.tag === "details"),
      details,
    );
    assert.equal(details.props.open, false);
  } finally {
    f.app.unmount();
  }
});

test("no configured currency retains the Exchange recovery action, and legacy stays in its table framework", () => {
  const modern = fixture({ currencies: [] });
  const legacy = fixture({ modern: false, gateways: [gateway(1, "USD")] });
  try {
    assert.ok(
      modern.links.some(
        (node) =>
          node.props["data-route"] === "BPageShopFinanceExchange" &&
          modern.text(node).includes("currencies_alert"),
      ),
    );
    assert.match(modern.text(modern.elements()[0]), /finance_no_methods/);
    assert.equal(
      legacy.elements().filter((node) => node.tag === "details").length,
      0,
    );
    const table = legacy
      .elements()
      .find((node) => /v-data-table/i.test(node.props["data-feature"] || ""));
    assert.ok(table);
    assert.equal(table.props.items.length, 1);
    assert.equal(table.props.items[0].gateway.code, "provider-1");
  } finally {
    modern.app.unmount();
    legacy.app.unmount();
  }
});
