import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";
import numeral from "numeral";
import { JSDOM } from "jsdom";

// Synthetic source/render fixtures only. No requests or browser session are used.
const levelCodes = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
const levels = Object.fromEntries(
  levelCodes.map((code) => [code, { code, name: code, icon: `${code}.svg` }]),
);
const productTypes = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE"].map((code) => [
    code,
    { color: "#123456", image: `${code}.svg` },
  ]),
);
const files = {
  acquisition: new URL(
    "../aquisition/BDashboardShopAcquisition.vue",
    import.meta.url,
  ),
  customers: new URL("./BDashboardShopCustomers.vue", import.meta.url),
};
const translate = (key, params) => key + (params ? JSON.stringify(params) : "");
const plain = (value) => JSON.parse(JSON.stringify(value));
function load(name, globals = {}) {
  const { descriptor, errors } = parse(readFileSync(files[name], "utf8"));
  assert.deepEqual(errors, []);
  const exports = {};
  vm.runInNewContext(
    "Array.prototype.insert = function(index, value) { this.splice(index, 0, value); };\n" +
      ts.transpileModule(descriptor.script.content, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
    {
      exports,
      window: { innerWidth: 1200 },
      ...globals,
      require: (path) => {
        if (path === "vue") return Vue;
        if (path === "numeral") return { default: numeral };
        if (path === "lodash-es")
          return { isEmpty: (value) => !value || !Object.keys(value).length };
        if (path === "@selldone/core-js") return { Club: { Levels: levels } };
        if (path.includes("ProductType")) return { ProductType: productTypes };
        if (path.includes("DateConverter"))
          return {
            DateConverter: {
              convertToLocalTime: (value) => new Date(value),
              GetStartOfDateBefore: () => null,
              GetEndOfDateBefore: () => null,
            },
          };
        if (path.includes("ChartAnnotations"))
          return { ChartAnnotations: { CreateMaxPoints: () => [] } };
        if (path.includes("periodComparison"))
          return { getPeriodComparison: () => ({ available: false }) };
        if (path.includes("CampaignHelper"))
          return {
            CampaignHelper: {
              GetTotalSocials: () => 20,
              GetTotalOrganicSearch: () => 30,
              GetTotalDirects: () => 40,
              GetTotalOther: ({ sessions }) => sessions - 90,
              GetSocialsOnly: () => ({ facebook: 20 }),
            },
          };
        return { default: {} };
      },
    },
  );
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: files[name].pathname,
    id: "crm-report-test",
  });
  assert.deepEqual(compiled.errors, []);
  const template = {};
  vm.runInNewContext(
    ts.transpileModule(compiled.code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports: template, require: () => Vue },
  );
  return { component: exports.default, render: template.render };
}
const theme = {
  name: "light",
  current: {
    dark: false,
    colors: { primary: "#123456", success: "#456789", "on-surface": "#111111" },
  },
};
const timeSeries = () => ({
  raw_data: [
    { created_at: "2026-10-27", users: 12, users_add: 2 },
    { created_at: "2026-10-28", users: null, users_add: 0 },
  ],
  totalOf: (key) =>
    ({
      new_visitors: 100,
      returning_visitors: 50,
      page_views: 500,
      views: 500,
      view_products_physical: 200,
      view_products_virtual: 100,
      view_products_file: 50,
      view_products_service: 25,
      amp: 10,
    })[key] || 0,
  arrayOf: (key) => [
    [1, key === "new_visitors" ? 100 : key === "returning_visitors" ? 50 : 500],
  ],
  arrayOfTimeAbsolute: () => [1, 2],
  lastDayData: () => ({ users: 12 }),
  todayData: () => ({ users_add: 0 }),
  yesterdayData: () => ({ users_add: 2 }),
  lastWeekData: () => ({ users_add: 7 }),
  previousWeekData: () => ({}),
  socialTotalKeys: () => ({ direct: 40, google: 30, facebook: 20 }),
});
function state(component, props) {
  const value = {
    ...component.data(),
    ...props,
    $t: translate,
    $i18n: { locale: "en" },
    $vuetify: { theme, display: {} },
    numeralFormat: (n) => String(n),
  };
  for (const [key, method] of Object.entries(component.methods || {}))
    value[key] = method.bind(value);
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(value, key, { get: () => getter.call(value) });
  return value;
}
async function render(name, props) {
  const { component, render } = load(name);
  const wrapper = {
    inheritAttrs: false,
    props: ["to"],
    setup:
      (props, { slots, attrs }) =>
      () =>
        Vue.h("div", { ...attrs, "data-route": props.to?.name }, [
          slots.default?.(),
          slots.actions?.(),
          slots.bottom?.(),
        ]),
  };
  const components = Object.fromEntries(
    Object.keys(component.components).map((name) => [name, wrapper]),
  );
  const app = Vue.createSSRApp(
    {
      ...component,
      mixins: [],
      components,
      render,
      computed: {
        ...component.computed,
        sorted_socials() {
          return Object.entries(this.socials).map(([key, value]) => ({
            key,
            value,
          }));
        },
      },
    },
    props,
  );
  Object.assign(app.config.globalProperties, {
    $t: translate,
    $i18n: { locale: "en" },
    $vuetify: { theme, display: {} },
    numeralFormat: (n) => String(n),
  });
  for (const name of [
    "v-row",
    "v-col",
    "v-btn",
    "v-icon",
    "v-tooltip",
    "v-container",
    "router-link",
    "s-widget-box",
  ])
    app.component(name, wrapper);
  app.directive("tooltip", {});
  app.component("UPrice", {
    props: ["amount", "currency"],
    setup: (props) => () => Vue.h("span", `${props.currency} ${props.amount}`),
  });
  app.component("apexchart", {
    props: ["type", "series", "options"],
    setup: (props) => () =>
      Vue.h("div", {
        "data-plot": props.type,
        "data-series": JSON.stringify(props.series),
      }),
  });
  return renderToString(app);
}

test("report acquisition splits the original series and preserves independent composition scope", () => {
  const { component } = load("acquisition");
  const calls = [],
    series = timeSeries(),
    originalTotal = series.totalOf;
  series.totalOf = (...args) => {
    calls.push(args);
    return originalTotal(args[0]);
  };
  const value = state(component, {
    modern: true,
    report: true,
    shop: { options: [{ code: "amp", value: true }] },
    timeSeries: series,
  });
  value.start_date = "composition-start";
  value.end_date = "composition-end";
  assert.equal(value.report_series.visitors.length, 2);
  assert.equal(value.report_series.views.length, 2);
  series.raw_data[0].new_visitors = 100;
  series.raw_data[1].new_visitors = null;
  series.raw_data[0].returning_visitors = 0;
  assert.deepEqual(
    plain(
      value.report_series.visitors.map((row) =>
        row.data.map((point) => point[1]),
      ),
    ),
    [
      [100, null],
      [0, null],
    ],
  );
  assert.deepEqual(
    plain(value.report_composition_series.map((row) => row.data[0])),
    [200, 100, 50, 25, 125],
  );
  assert.ok(
    calls
      .filter(([key]) => key.startsWith("view"))
      .every(
        ([, start, end]) =>
          start === "composition-start" && end === "composition-end",
      ),
  );
  assert.equal(
    value.calcTotalOther,
    60,
    "Flow denominator remains 100 new + 50 returning visitors",
  );
  assert.equal(
    value.report_composition_options.legend.formatter("Physical", {
      seriesIndex: 0,
    }),
    "Physical: 200",
  );
  assert.ok(
    value.report_composition_options.legend.markers.customHTML.length === 5,
  );
});

test("report overview omits all detailed plots/date components while retaining its three metrics", async () => {
  const html = await render("acquisition", {
    modern: true,
    report: true,
    summary: true,
    shop: {},
    timeSeries: timeSeries(),
  });
  assert.equal((html.match(/<dt /g) || []).length, 3);
  assert.equal(
    (html.match(/data-plot=/g) || []).length,
    3,
    "Overview keeps one real-data mini trend per metric",
  );
  assert.ok(!html.includes("b-dashboard-acquisition__report-plots"));
  assert.ok(!html.includes("b-dashboard-acquisition__composition-range"));
  assert.ok(!html.includes('data-route="BPageShopCrmReport"'));
});

test("report customer plots preserve unknown stock, zero additions and native tools", () => {
  const { component } = load("customers");
  const value = state(component, {
    modern: true,
    report: true,
    shop: {},
    timeSeries: timeSeries(),
  });
  value.update_series();
  assert.deepEqual(
    plain(value.series.map((series) => series.data.map((point) => point[1]))),
    [
      [12, null],
      [2, 0],
    ],
  );
  assert.equal(value.change_today, 0);
  assert.equal(value.change_week, 7);
  for (const options of Object.values(value.report_chart_options)) {
    assert.equal(options.chart.toolbar.tools.download, true);
    assert.equal(options.chart.toolbar.tools.selection, true);
    assert.equal(options.chart.toolbar.tools.pan, true);
    assert.equal(options.chart.toolbar.tools.reset, true);
    assert.equal(options.tooltip.y.formatter(1234), "1,234");
  }
  assert.equal(component.props.report.default, false);
});

test("all five clubs, inactive state, thresholds, cap, description and navigation survive report rendering", async () => {
  const club = {
    level: "BRONZE",
    count: 8,
    percent: 5,
    monthly: 100,
    annually: 1000,
    limit: 50,
    currency: "USD",
    description: "Recorded club benefit",
  };
  const html = await render("customers", {
    modern: true,
    report: true,
    shop: { clubs: [club] },
    timeSeries: timeSeries(),
  });
  assert.equal(
    (html.match(/class="b-dashboard-customers-detail__club-row"/g) || [])
      .length,
    5,
  );
  assert.equal((html.match(/aria-expanded="false"/g) || []).length, 5);
  assert.ok(
    html.includes("USD 100") &&
      html.includes("USD 1000") &&
      html.includes("USD 50"),
  );
  assert.ok(
    html.includes("Recorded club benefit") && html.includes("global.inactive"),
  );
  assert.ok(html.includes('data-route="BPageShopCrmClub"'));
  assert.ok(!html.includes('data-route="BPageShopCrmReport"'));
  const { component } = load("customers"),
    value = state(component, {
      shop: { clubs: [club] },
      timeSeries: timeSeries(),
    });
  value.toggleClubDetails("BRONZE");
  assert.deepEqual(plain(value.expanded_clubs), ["BRONZE"]);
  value.toggleClubDetails("BRONZE");
  assert.deepEqual(plain(value.expanded_clubs), []);
});

test("existing modern dashboard callers retain the combined customer chart and club grid", async () => {
  const html = await render("customers", {
    modern: true,
    shop: {},
    timeSeries: timeSeries(),
  });
  assert.equal((html.match(/data-plot=/g) || []).length, 1);
  assert.ok(html.includes("b-dashboard-customers-detail__clubs"));
  assert.ok(!html.includes("b-dashboard-customers-detail__club-table"));
  assert.ok(html.includes('data-route="BPageShopCrmReport"'));
});

test("report flow remeasures positive widths after tab reveals and releases its observer", () => {
  const document = new JSDOM().window.document;
  const element = document.createElement("div");
  let callback,
    observed,
    disconnected = false,
    refreshes = 0;
  class ResizeObserver {
    constructor(handler) {
      callback = handler;
    }
    observe(element) {
      assert.ok(
        element instanceof document.defaultView.Element,
        "Observer rejects fragment/comment anchors",
      );
      observed = element;
    }
    disconnect() {
      disconnected = true;
    }
  }
  const { component } = load("acquisition", { ResizeObserver });
  const value = {
    report: true,
    summary: false,
    $el: document.createComment("fragment anchor"),
    $refs: {
      reportRoot: element,
      reportFlow: { refreshChart: () => refreshes++ },
    },
  };
  component.mounted.call(value);
  assert.equal(observed, element);
  for (const width of [900, 0, 900, 390, 390])
    callback([{ contentRect: { width } }]);
  assert.equal(refreshes, 2);
  component.beforeUnmount.call(value);
  assert.equal(disconnected, true);
  callback = null;
  component.mounted.call({
    report: true,
    summary: false,
    $refs: { reportRoot: document.createComment("not an element") },
  });
  assert.equal(callback, null, "Invalid element refs do not create observers");
  component.mounted.call({ report: true, summary: true });
  assert.equal(
    callback,
    null,
    "Overview summaries do not allocate flow observers",
  );
});
