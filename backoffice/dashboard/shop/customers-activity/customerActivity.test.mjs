import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import * as Vue from "vue";
import { createVuetify } from "vuetify";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

const require = createRequire(import.meta.url);
const keys = ["products_views", "add_baskets", "remove_baskets", "buys"].map(
  (code, i) => ({
    code,
    name: code,
    color: ["#FFA000", "#0288D1", "#D32F2F", "#689F38"][i],
    image: "/activity-" + code + ".svg",
  }),
);
const days = Object.fromEntries(
  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ].map((name) => [name, { name }]),
);
const emptyComponent = { render: () => null };
const loaded = {};

function themeFixture() {
  const vuetify = createVuetify();
  // App themes may omit text colors; Vuetify supplies them in computedThemes.
  delete vuetify.theme.themes.value.light.colors["on-surface"];
  delete vuetify.theme.themes.value.dark.colors["on-surface"];
  return Vue.reactive({
    ...vuetify.theme,
    // Older Vuetify runtimes expose raw current themes; resolved palettes are stable.
    current: Vue.computed(
      () => vuetify.theme.themes.value[vuetify.theme.name.value],
    ),
  });
}

function evaluate(source, modules) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, ...modules },
  );
  return exports;
}

for (const [name, path] of [
  ["heatmap", "./heatmap/BDashboardShopCustomersActivityHeatmap.vue"],
  ["map", "./map/BDashboardShopCustomersActivityMap.vue"],
]) {
  const file = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "activity-test",
  });
  assert.deepEqual(template.errors, []);
  const globals = {
    window: {
      API: {
        GET_SHOP_STATISTIC_TIMELINE: (id) => `/shops/${id}/timeline`,
        GET_SHOP_STATISTIC_COUNTRY: (id) => `/shops/${id}/countries`,
      },
    },
    axios: { get: async () => ({ data: {} }) },
    require(id) {
      if (id === "vue") return Vue;
      if (id === "chroma-js") return require(id);
      if (id.includes("UserActivityKeys")) return { UserActivityKeys: keys };
      if (id.includes("WeekDays")) return { WeekDays: days };
      if (id.endsWith(".vue")) return { default: emptyComponent };
      throw Error("Unexpected module: " + id);
    },
  };
  const component = evaluate(descriptor.script.content, globals).default;
  const state = {
    ...component.data(),
    modern: true,
    report: true,
    shop: { id: 7 },
    $t: (key) => key,
    $n: (value, options) =>
      new Intl.NumberFormat("en-US", options).format(value),
    $vuetify: { theme: themeFixture() },
  };
  for (const [key, method] of Object.entries(component.methods))
    state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(state, key, { get: () => getter.call(state) });
  loaded[name] = { component, state, globals, template, descriptor, file };

  test(`${name}: modern template, TypeScript and scoped Sass compile`, async () => {
    const style = await compileStyleAsync({
      source: descriptor.styles[0].content,
      filename: file.pathname,
      id: "activity-test",
      scoped: true,
      preprocessLang: "scss",
    });
    assert.deepEqual(style.errors, []);
  });
}

test("hourly activity grids one activity by weekday and hour and exposes all four exact counters", () => {
  const s = loaded.heatmap.state;
  assert.equal(s.series, null);
  s.timeline = [
    {
      day: 2,
      hour: 13,
      products_views: 0,
      add_baskets: 7,
      remove_baskets: 2,
      buys: 3,
    },
    { day: 6, hour: 0, buys: 1 },
  ];
  s.selected_day = 2;
  s.selected_hour = 13;
  assert.deepEqual(JSON.parse(JSON.stringify(s.hourly_counts)), {
    products_views: 0,
    add_baskets: 7,
    remove_baskets: 2,
    buys: 3,
  });
  s.key_selected = "buys";
  assert.equal(s.series.length, 7, "One row per weekday");
  assert.deepEqual(
    JSON.parse(JSON.stringify(s.series.map((row) => row.name))),
    [
      "Saturday",
      "Friday",
      "Thursday",
      "Wednesday",
      "Tuesday",
      "Monday",
      "Sunday",
    ],
    "Sunday is drawn on top",
  );
  const tuesday = s.series.find((row) => row.name === "Tuesday");
  assert.equal(tuesday.data.length, 24);
  assert.deepEqual(JSON.parse(JSON.stringify(tuesday.data[13])), {
    x: "13",
    y: 3,
  });
  assert.equal(tuesday.data[12].y, 0, "Missing hours are observed zeros");
  assert.equal(s.series[0].data[0].y, 1);
  assert.equal(s.max_value, 3);
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(s.heat_ranges.map((range) => [range.from, range.to])),
    ),
    [
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    "Zero stays neutral; counts split into bands up to the busiest cell",
  );
  assert.equal(s.chartOptions.colors[0], "#689F38");
  assert.equal(s.chartOptions.plotOptions.heatmap.enableShades, false);
  assert.equal(s.chartOptions.chart.toolbar.show, false);
  s.key_selected = "products_views";
  assert.equal(s.max_value, 0);
  assert.deepEqual(
    JSON.parse(JSON.stringify(s.heat_ranges.map((range) => range.from))),
    [0],
    "No band without activity",
  );
  s.timeline = [];
  assert.equal(s.series.length, 7);
  assert.ok(s.series.every((row) => row.data.every((cell) => cell.y === 0)));
});

test("country activity uses the selected counter without mutating country records", () => {
  const s = loaded.map.state;
  s.countries = [
    {
      country_code: "US",
      products_views: 80,
      add_baskets: 5,
      remove_baskets: 2,
      buys: 4,
    },
    { country_code: "GB", products_views: 20, add_baskets: 15, buys: 1 },
  ];
  assert.equal(s.country_total, 100);
  s.key_selected = "add_baskets";
  assert.equal(s.country_total, 20);
  assert.equal(s.top_countries[0].country_code, "GB");
  assert.equal(s.countries[0].country_code, "US");
  assert.equal(s.getValue("US", "buys"), 4);
  assert.equal(s.getValue("GB", "remove_baskets"), 0);
  assert.equal(s.activityLabel(keys[3]), "shop_crm_report.purchase_actions");
  assert.equal(s.map_colors.stroke, s.$vuetify.theme.current.colors.surface);
});

test("real Vuetify light/dark themes supply generated activity colors", () => {
  for (const name of ["light", "dark"]) {
    for (const [kind, { state }] of Object.entries(loaded)) {
      state.$vuetify.theme.name = name;
      const theme = state.$vuetify.theme;
      assert.equal(theme.current.colors["on-surface"], undefined);
      assert.ok(theme.computedThemes[name].colors["on-surface"]);
      if (kind === "map") {
        assert.equal(
          state.map_colors.stroke,
          theme.computedThemes[name].colors.surface,
        );
        assert.match(state.map_colors.low, /^#[0-9a-f]{6}$/i);
        assert.match(state.map_colors.fill, /^#[0-9a-f]{6}$/i);
      } else {
        assert.equal(
          state.chartOptions.chart.foreColor,
          theme.computedThemes[name].colors["on-surface"],
        );
      }
    }
  }
  for (const { state } of Object.values(loaded))
    state.$vuetify.theme.name = "light";
});

test("the heatmap reduces visible hour labels without removing hourly observations", () => {
  const s = loaded.heatmap.state;
  s.timeline = Array.from({ length: 24 }, (_, hour) => ({
    day: 0,
    hour,
    buys: hour + 1,
  }));
  s.key_selected = "buys";
  const options = s.chartOptions,
    mobile = options.responsive.find((item) => item.breakpoint === 600).options,
    narrow = options.responsive.find((item) => item.breakpoint === 380).options;
  const labels = Array.from({ length: 24 }, (_, hour) =>
    String(hour).padStart(2, "0"),
  );
  assert.deepEqual(labels.map(options.xaxis.labels.formatter).filter(Boolean), [
    "00:00",
    "04:00",
    "08:00",
    "12:00",
    "16:00",
    "20:00",
  ]);
  assert.deepEqual(labels.map(mobile.xaxis.labels.formatter).filter(Boolean), [
    "00:00",
    "06:00",
    "12:00",
    "18:00",
  ]);
  assert.deepEqual(labels.map(narrow.xaxis.labels.formatter).filter(Boolean), [
    "00:00",
    "08:00",
    "16:00",
  ]);
  const sunday = s.series.find((row) => row.name === "Sunday");
  assert.equal(sunday.data.length, 24);
  assert.deepEqual(
    JSON.parse(JSON.stringify(sunday.data.map((cell) => cell.y))),
    Array.from({ length: 24 }, (_, hour) => hour + 1),
  );
  assert.equal(s.hourLabel(1), "01:00–01:59");
  assert.equal(options.tooltip.x.formatter("01"), "01:00–01:59");
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(s.heat_ranges.map((range) => [range.from, range.to])),
    ),
    [
      [0, 0],
      [1, 6],
      [7, 12],
      [13, 18],
      [19, 24],
    ],
  );
  assert.equal(
    new Set(s.heat_ranges.map((range) => range.color)).size,
    5,
    "Every band has its own shade",
  );
  s.timeline = [];
});

test("historical activity retains shop-scoped endpoints and error/retry state", async () => {
  for (const [name, method, dataKey] of [
    ["heatmap", "fetchActivityTimeline", "timeline"],
    ["map", "fetchActivityByCountry", "countries"],
  ]) {
    const { state, globals } = loaded[name];
    let requested;
    globals.axios.get = async (url) => {
      requested = url;
      throw Error("isolated failure");
    };
    state[method]();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      requested,
      `/shops/7/${name === "map" ? "countries" : "timeline"}`,
    );
    assert.equal(state.busy, false);
    assert.equal(state.fetch_error, true);
    globals.axios.get = async () => ({ data: { [dataKey]: [] } });
    state[method]();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(state.fetch_error, false);
    assert.equal(state.busy, false);
    assert.deepEqual(Array.from(state[dataKey]), []);
  }
});

test("modern rendering keeps native activity selections and keyboard count inspectors", async () => {
  for (const name of ["heatmap", "map"]) {
    const { component, state, template, globals } = loaded[name];
    const app = Vue.createSSRApp(
      {
        ...component,
        render: evaluate(template.code, globals).render,
        data() {
          return {
            ...component.data.call(this),
            timeline: [{ day: 0, hour: 0, buys: 3 }],
            countries: [{ country_code: "US", products_views: 12, buys: 3 }],
            key_selected: "buys",
          };
        },
      },
      { modern: true, report: true, shop: { id: 7 } },
    );
    app.config.globalProperties.$t = state.$t;
    app.config.globalProperties.$n = state.$n;
    app.config.globalProperties.$vuetify = state.$vuetify;
    app.config.globalProperties.getCountryName = (code) => code;
    app.config.globalProperties.numeralFormat = (value) => String(value);
    app.directive("intersect", { getSSRProps: () => ({}) });
    for (const tag of [
      "v-btn",
      "v-icon",
      "v-tooltip",
      "v-btn-toggle",
      "v-spacer",
      "flag",
      "apexchart",
    ])
      app.component(tag, {
        setup:
          (_, { slots }) =>
          () =>
            Vue.h(tag === "v-btn" ? "button" : "span", slots.default?.()),
      });
    const html = await renderToString(app);
    assert.ok(html.includes("shop_crm_report.purchase_actions"));
    assert.equal(html.includes("confirmed orders"), false);
    if (name === "heatmap") {
      assert.equal(html.includes("checkbox"), false);
      assert.ok(html.includes("shop_crm_report.activity_type"));
      assert.ok(html.includes("shop_crm_report.inspect_hourly"));
      assert.ok(html.includes('aria-live="polite"'));
      assert.ok(html.includes("shop_crm_report.fewer"));
    } else {
      assert.ok(html.includes("shop_crm_report.country_activity"));
      assert.equal(
        html.includes("<select"),
        true,
        "Inspect country keeps its native select",
      );
      assert.equal(
        (html.match(/<select/g) || []).length,
        1,
        "The activity choice is a segmented control",
      );
      assert.ok(html.includes("shop_crm_report.inspect_country"));
      assert.ok(html.includes('aria-pressed="false"'));
    }
  }
});
