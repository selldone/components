import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import { compile as compileDom } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const root = new URL("../../", import.meta.url);
const files = [
  "backoffice/product/inventory/abstract-view/BProductInventoryAbstractView.vue",
  "backoffice/product/orders/abstract-view/BProductOrdersAbstractView.vue",
  "backoffice/product/orders/sales-performance/BProductOrderSalesPerformance.vue",
  "backoffice/product/finance/charts/BProductFinanceCharts.vue",
  "backoffice/product/rating/charts/BProductRatingCharts.vue",
  "backoffice/product/marketing/abstract-view/BProductMarketingAbstractView.vue",
  "backoffice/dashboard/feedback/BDashboardFeedback.vue",
  "backoffice/order-que/OrdersQue.vue",
  "backoffice/chart/FinanceInlineChart.vue",
  "backoffice/chart/funnel/finance/SChartFunnelFinance.vue",
  "ui/chart/funnel/UChartFunnel.vue",
  "ui/chart/funnel/hover/UChartFunnelHover.vue",
];
const descriptor = (file) =>
  parse(readFileSync(new URL(file, root), "utf8")).descriptor;
const plain = (value) => JSON.parse(JSON.stringify(value));
function component(file, supplied = {}) {
  const source = descriptor(file).script.content;
  const syntax = ts.createSourceFile(
    file + ".ts",
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const globals = { console, ...supplied };
  for (const statement of syntax.statements.filter(ts.isImportDeclaration)) {
    const clause = statement.importClause;
    if (clause?.name) globals[clause.name.text] ??= {};
    for (const binding of clause?.namedBindings?.elements || [])
      globals[binding.name.text] ??= {};
  }
  const expression = syntax.statements
    .find(ts.isExportAssignment)
    .expression.getText(syntax);
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule("export default " + expression, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, ...globals },
  );
  return exports.default;
}
function fixture(options, props = {}) {
  const state = {
    modern: true,
    $t: (key) => key,
    $route: { params: {}, matched: [] },
    $vuetify: { display: { xs: false } },
    ...options.data?.(),
    ...props,
  };
  for (const [name, method] of Object.entries(options.methods || {}))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(options.computed || {}))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  return state;
}
const DateConverter = { convertToLocalTime: (value) => new Date(value) };

test("all modern and legacy analytics templates, styles and scripts compile", () => {
  for (const file of files) {
    const sfc = descriptor(file);
    assert.deepEqual(
      compileTemplate({
        source: sfc.template.content,
        filename: file,
        id: "analytics",
      }).errors,
      [],
      file,
    );
    for (const style of sfc.styles)
      assert.deepEqual(
        compileStyle({
          source: style.content,
          filename: file,
          id: "analytics",
          scoped: style.scoped,
          preprocessLang: style.lang,
        }).errors,
        [],
        file,
      );
    assert.deepEqual(
      ts.createSourceFile(
        file + ".ts",
        sfc.script.content,
        ts.ScriptTarget.Latest,
        true,
      ).parseDiagnostics,
      [],
      file,
    );
  }
});

test("inventory keeps both native count and sell bands for every product model", () => {
  const ProductType = Object.fromEntries(
    ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
      code,
      { code },
    ]),
  );
  const options = component(files[0], { ProductType });
  for (const type of Object.keys(ProductType)) {
    const state = fixture(options, {
      product: { type, subscribers_count: 9 },
      timeSeries: {
        raw_data: [
          { count: 0, sell: 2 },
          { count: 10, sell: 3 },
        ],
      },
    });
    assert.deepEqual(
      plain(state.values),
      [
        [0, 2],
        [10, 3],
      ],
      type,
    );
    assert.equal(state.isFile, type === "FILE");
    assert.equal(state.isSubscription, type === "SUBSCRIPTION");
  }
});

test("responsive funnel direct labels retain endpoints without deleting observations", () => {
  const options = component(files[10], { getDefaultColors: () => [] });
  const labels = Array.from({ length: 30 }, (_, index) => String(index));
  const state = fixture(options, { labels, width: 200 });
  assert.deepEqual(
    labels.map((_, index) => index).filter((index) => state.showLabel(index)),
    [0, 29],
  );
  state.width = 600;
  const visible = labels
    .map((_, index) => index)
    .filter((index) => state.showLabel(index));
  assert.equal(visible[0], 0);
  assert.equal(visible.at(-1), 29);
  assert.ok(visible.length <= 6);
});

test("currency comparison preserves native signs, exact tooltip amounts and unavailable exchange rates", () => {
  const Currency = Object.fromEntries(
    ["USD", "EUR", "GBP"].map((code) => [
      code,
      { code, enable: true, gradient: ["#123456"] },
    ]),
  );
  const options = component(files[9], {
    Currency,
    DateConverter,
    PriceHelper: {
      getBuyRateValue: (_shop, from, to) =>
        from === "EUR" && to === "USD" ? 2 : null,
    },
  });
  const state = fixture(options, {
    shop: { currencies: ["USD", "EUR", "GBP"] },
    selected_currency: "USD",
    enable_currencies: ["USD", "EUR"],
    financeKey: "pay",
    FormatNumberCurrency: (value) => String(value),
    timeSeries: {
      raw_data: [
        {
          created_at: "2026-10-01",
          finances: [
            { currency: "USD", pay: -4 },
            { currency: "EUR", pay: 3 },
          ],
        },
        { created_at: "2026-10-02", finances: [{ currency: "USD", pay: 0 }] },
      ],
    },
  });
  assert.deepEqual(plain(state.sourceCurrencies.map((item) => item.code)), [
    "USD",
    "EUR",
  ]);
  assert.deepEqual(plain(state.amount_sell_values), [
    [-4, 3],
    [0, 0],
  ]);
  assert.deepEqual(plain(state.amount_sell_values_noramized), [
    [-4, 6],
    [0, 0],
  ]);
  assert.equal(state.hasSignedAmounts, true);
  assert.equal(state.estimateUnavailable, false);
  const tooltip = state.signedOptions.tooltip.y.formatter;
  assert.equal(tooltip(-4, { seriesIndex: 0, dataPointIndex: 0 }), "-4 USD");
  assert.equal(tooltip(6, { seriesIndex: 1, dataPointIndex: 0 }), "3 EUR (≈ 6 USD)");
  state.selected_currency = "GBP";
  assert.equal(state.estimateUnavailable, true);
  assert.deepEqual(plain(state.amount_sell_values_noramized), [
    [null, null],
    [null, null],
  ]);
  assert.equal(state.findFinanceSellValueByCurrency(state.timeSeries.raw_data[0].finances, "USD"), -4);
  state.enable_currencies = [];
  assert.deepEqual(plain(state.amount_sell_values), [[], []]);
});

test("compact inventory and fulfillment labels retain full metric and date scopes", () => {
  const ProductType = { FILE: { code: "FILE" }, PHYSICAL: { code: "PHYSICAL" } };
  const props = {
    product: { type: "PHYSICAL" },
    timeSeries: { startDate: "2026-09-29", endDate: "2026-10-29" },
    getLocalDateString: (date) => date,
    $t: (key, values) => `${key}: ${values.start} → ${values.end}`,
  };
  const inventory = fixture(component(files[0], { ProductType }), props);
  assert.equal(inventory.periodSalesScope, "product_admin.dashboard.inventory.total_sell_timespan: 2026-09-29 → 2026-10-29");
  const orders = fixture(component(files[1], { ProductType }), props);
  assert.equal(orders.periodFulfillmentScope, "product_admin.dashboard.orders.send_count_in_period: 2026-09-29 → 2026-10-29");
  orders.product = { type: "FILE" };
  assert.equal(orders.periodFulfillmentScope, "product_admin.dashboard.orders.downloads_count_in_period: 2026-09-29 → 2026-10-29");
});

test("compact report dates respect the selected locale, calendar and calendar-year boundaries", () => {
  for (const file of [files[0], files[1]]) {
    const language = { full_locale: "en-US", calendar: { calendar: "gregory" } };
    const options = component(file, { window: { $language: language } });
    const state = fixture(options, {
      timeSeries: { startDate: "2026-09-29", endDate: "2026-10-29" },
      getLocalDateString: (value) => `full ${value}`,
    });
    const expected = (year = false) => new Intl.DateTimeFormat(language.full_locale, {
      calendar: language.calendar.calendar, month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}),
    }).formatRange(new Date(state.timeSeries.startDate), new Date(state.timeSeries.endDate));
    assert.equal(state.compactPeriod, expected());
    assert.doesNotMatch(state.compactPeriod, /2026/);
    language.full_locale = "fa-IR";
    language.calendar.calendar = "persian";
    assert.equal(state.compactPeriod, expected());
    state.timeSeries = { startDate: "2026-03-15", endDate: "2026-03-25" };
    assert.equal(state.compactPeriod, expected(true), "Persian new year must include both calendar years");
    language.full_locale = "unsupported_locale";
    assert.equal(state.compactPeriod, "full 2026-03-15 – full 2026-03-25");
  }
});

test("compact date help stays open on the first tap after hover or focus, and Escape dismisses it", () => {
  const ProductType = { FILE: { code: "FILE" }, SUBSCRIPTION: { code: "SUBSCRIPTION" }, PHYSICAL: { code: "PHYSICAL", color: "#123456" } };
  for (const file of [files[0], files[1]]) {
    const options = component(file, { ProductType, window: { $language: { full_locale: "en-US", calendar: { calendar: "gregory" } } } });
    const state = fixture(options, {
      product: { type: "PHYSICAL", quantity: 0, sells: 0 }, orderQue: [],
      timeSeries: { startDate: "2026-09-29", endDate: "2026-10-29", raw_data: [], todayData: () => ({ sell: 0 }), totalOf: () => 0 },
      $tm: () => ["Inventory", "Sales"], getLocalDateString: (date) => date,
      $t: (key, values) => values ? `${key}: ${values.start} → ${values.end}` : key,
      numeralFormat: String,
    });
    const render = new Function("Vue", compileDom(descriptor(file).template.content, { mode: "function" }).code)({ ...Vue, resolveComponent: (name) => name, resolveDynamicComponent: (name) => name });
    const nodes = [];
    function visit(node) {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) { node.forEach(visit); return; }
      nodes.push(node);
      visit(node.children);
      if (typeof node.children?.default === "function") visit(node.children.default());
    }
    visit(render.call(state, state, []));
    const trigger = nodes.find((node) => node.type === "button" && node.props?.["aria-label"]);
    const tooltip = nodes.find((node) => node.type === "v-tooltip");
    assert.equal(trigger.props.type, "button");
    assert.equal(tooltip.props["open-on-click"], false);
    assert.equal(tooltip.props.location, "top");
    tooltip.props["onUpdate:modelValue"](true); // Touch can synthesize hover before click.
    trigger.props.onClick();
    assert.equal(state.periodScopeOpen, true);
    trigger.props.onKeydown({ key: "Escape" });
    assert.equal(state.periodScopeOpen, false);
    trigger.props.onClick();
    assert.equal(state.periodScopeOpen, true);
  }
});

test("finance chart retains exact recorded dates and signed native values", () => {
  const options = component(files[8], { DateConverter });
  const state = fixture(options, {
    currency: "EUR",
    financeKeys: ["sell", "pay"],
    valueTitles: ["Sale", "Payment"],
    timeSeries: {
      raw_data: [
        {
          created_at: "2026-09-01",
          finances: [{ currency: "EUR", sell: 10, pay: -2 }],
        },
        { created_at: "2026-09-03", finances: [] },
      ],
    },
  });
  const series = plain(state.seriesSpark);
  assert.deepEqual(
    series.map((item) => item.type),
    ["column", "line"],
  );
  assert.deepEqual(series[1].data, [
    [new Date("2026-09-01").getTime(), -2],
    [new Date("2026-09-03").getTime(), 0],
  ]);
});

test("modern charts coalesce resize notifications outside observer delivery and cancel pending frames", () => {
  for (const [index, ref] of [
    [8, "chartContainer"],
    [0, "chart"],
    [9, "modernChart"],
  ]) {
    let callback,
      observed,
      disconnected = false,
      nextId = 0;
    const frames = new Map();
    class ResizeObserver {
      constructor(handler) {
        callback = handler;
      }
      observe(element) {
        observed = element;
      }
      disconnect() {
        disconnected = true;
      }
    }
    const options = component(files[index], {
      ResizeObserver,
      requestAnimationFrame: (handler) => {
        const id = ++nextId;
        frames.set(id, handler);
        return id;
      },
      cancelAnimationFrame: (id) => frames.delete(id),
    });
    const container = {};
    const state = fixture(options, { $refs: { [ref]: container } });
    const initialWidth = state.chartWidth;
    options.mounted.call(state);
    assert.equal(observed, container);
    callback([{ contentRect: { width: 485 } }]);
    callback([{ contentRect: { width: 203.8 } }]);
    assert.equal(
      state.chartWidth,
      initialWidth,
      "Observer delivery must not redraw a chart",
    );
    assert.equal(
      frames.size,
      1,
      "Several observations share one animation frame",
    );
    const [id, frame] = [...frames][0];
    frames.delete(id);
    frame();
    assert.equal(state.chartWidth, 203, "The last measured numeric width wins");
    callback([{ contentRect: { width: 0 } }]);
    callback([{ contentRect: { width: 203 } }]);
    assert.equal(
      frames.size,
      0,
      "Hidden or unchanged geometry must not redraw",
    );
    callback([{ contentRect: { width: 90 } }]);
    options.beforeUnmount.call(state);
    assert.equal(disconnected, true);
    assert.equal(
      frames.size,
      0,
      "Unmount cancels the owned pending animation frame",
    );
  }
});

test("ratings leave unrated days empty and never clamp recorded scores", () => {
  const options = component(files[4], { DateConverter });
  const state = fixture(options, {
    product: { ratings: [] },
    timeSeries: {
      raw_data: [
        { created_at: "2026-10-01", ratings: 0, rating_star: 0 },
        { created_at: "2026-10-02", ratings: 2, rating_star: 7.5 },
      ],
    },
  });
  const series = plain(state.modernSeries);
  assert.equal(series[1].data[0][1], null);
  assert.equal(series[1].data[1][1], 7.5);
  assert.equal(state.options.yaxis[1].max, 7.5);
  assert.equal(state.options.chart.toolbar.show, false);
});

test("both expectation exports retain their separate shop and vendor endpoints", () => {
  const endpoint = (...args) => args.join("/");
  const options = component(files[5], {
    window: {
      API: {
        GET_EXPORT_FOR_AUCTION: (...args) => "shop/sale/" + endpoint(...args),
        GET_EXPORT_FOR_AVAILABLE: (...args) =>
          "shop/stock/" + endpoint(...args),
      },
      VAPI: {
        GET_MY_VENDOR_EXPORT_FOR_AUCTION: (...args) =>
          "vendor/sale/" + endpoint(...args),
        GET_MY_VENDOR_EXPORT_FOR_AVAILABLE: (...args) =>
          "vendor/stock/" + endpoint(...args),
      },
    },
  });
  const state = fixture(options, {
    product: { shop_id: 3, vendor_id: 7, id: 11 },
  });
  assert.equal(state.download_for_auction, "shop/sale/3/11");
  assert.equal(state.download_for_available, "shop/stock/3/11");
  state.$route = {
    params: { vendor_id: 7 },
    matched: [{ meta: { vendor: true } }],
  };
  assert.equal(state.download_for_auction, "vendor/sale/7/11");
  assert.equal(state.download_for_available, "vendor/stock/7/11");
});
