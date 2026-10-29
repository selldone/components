import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyle, compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import chroma from "chroma-js";

function evaluate(source, require, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, require, ...globals });
  return exports;
}

function readComponent(relative) {
  const filename = new URL(relative, import.meta.url).pathname;
  const source = readFileSync(new URL(relative, import.meta.url), "utf8");
  const { descriptor, errors } = parse(source, { filename });
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename,
    id: "community-statistic-test",
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    assert.deepEqual(
      compileStyle({
        source: style.content,
        filename,
        id: "community-statistic-test",
        scoped: true,
        preprocessLang: style.lang,
      }).errors,
      [],
    );
  }
  return { descriptor, template };
}

const viewSource = readComponent("./CommunityStatisticView.vue");
const view = evaluate(viewSource.descriptor.script.content, (path) => {
  if (path === "chroma-js") return { default: chroma };
  if (path.includes("DateConverter"))
    return {
      DateConverter: {
        convertToLocalTime: (value) => (value ? new Date(value) : null),
        ConvertTimestampToShortString: (value) =>
          new Date(Number(value)).toISOString().slice(0, 10),
      },
    };
  return {};
}).default;

function series(rows) {
  const startDate = new Date("2026-10-17T00:00:00Z");
  const raw_data = rows.map((row, index) => ({
    created_at: new Date(startDate.getTime() + index * 86400000).toISOString(),
    ...row,
  }));
  return {
    raw_data,
    offset: 4,
    days: 7,
    startDate,
    endDate: new Date("2026-10-24T23:59:59Z"),
    totalOf: (key) => raw_data.reduce((sum, row) => sum + (row[key] || 0), 0),
    arrayOfForceInterpolateZero: (key, attachTime) =>
      Array.from({ length: 8 }, (_, index) => {
        const timestamp = startDate.getTime() + index * 86400000;
        const record = raw_data.find(
          (row) => new Date(row.created_at).getTime() === timestamp,
        );
        const value = record?.[key] ?? 0;
        return attachTime ? [timestamp, value] : value;
      }),
    fetch() {},
  };
}

test("period totals retain actual zero and unknown fields without inventing activity", () => {
  const context = {
    timeSeries: series([{ posts: 0 }, { posts: 3 }]),
    loading: false,
    loadError: false,
  };
  assert.equal(view.methods.metric_total.call(context, "posts"), 3);
  assert.equal(view.methods.metric_total.call(context, "comments"), null);
  context.timeSeries = series([{ posts: 0 }, { posts: null }]);
  assert.equal(view.methods.metric_total.call(context, "posts"), null);
  context.timeSeries = series([{ posts: 0 }]);
  assert.equal(view.methods.metric_total.call(context, "posts"), 0);
  context.timeSeries = series([]);
  assert.equal(view.methods.metric_total.call(context, "posts"), 0);
  context.loading = true;
  assert.equal(view.methods.metric_total.call(context, "posts"), null);
  context.loading = false;
  context.loadError = true;
  assert.equal(view.methods.metric_total.call(context, "posts"), null);
});

test("date scope uses the fetched range including its offset", () => {
  const text = view.computed.time_span_string.call({
    modern: true,
    timeSeries: series([]),
    getLocalTimeString: (date) => date.toISOString().slice(0, 10),
  });
  assert.equal(text, "2026-10-17 – 2026-10-24");
});

test("summary series fill only absent days and keep explicit unknown sparkline gaps", () => {
  const context = {
    timeSeries: series([
      { created_at: "2026-10-18T00:00:00Z", posts: 1 },
      { created_at: "2026-10-19T00:00:00Z", posts: null },
    ]),
  };
  const points = view.methods.daily_values.call(context, "posts");
  assert.deepEqual(
    JSON.parse(JSON.stringify(points.slice(0, 4).map((point) => point[1]))),
    [0, 1, null, 0],
  );
  context.daily_values = () => points;
  const path = view.methods.sparkline_path.call(context, "posts");
  assert.equal((path.match(/M/g) || []).length, 2);
  assert.doesNotMatch(path, /NaN|Infinity/);
});

test("quiet summary disables animation and tools and labels a single event with integer ticks", () => {
  const colors = {
    surface: "#ffffff",
    "on-surface": "#25272c",
    primary: "#0065ed",
    secondary: "#8a5bce",
  };
  const options = view.computed.activity_options.call({
    activity_series: [
      {
        data: [
          [1, 0],
          [2, 0],
        ],
      },
      {
        data: [
          [1, 0],
          [2, 1],
        ],
      },
    ],
    chart_colors: [colors.primary, colors.secondary],
    $vuetify: {
      theme: {
        name: "light",
        current: { dark: false },
        computedThemes: { light: { colors } },
      },
    },
    numeralFormat: (value) => String(value),
  });
  assert.equal(options.chart.animations.enabled, false);
  assert.equal(options.chart.toolbar.show, false);
  assert.equal(options.chart.zoom.enabled, false);
  assert.equal(options.yaxis.min, 0);
  assert.equal(options.yaxis.max, 1);
  assert.equal(options.yaxis.tickAmount, 1);
  assert.equal(options.stroke.curve, "straight");
  assert.deepEqual(
    JSON.parse(JSON.stringify(options.stroke.dashArray)),
    [0, 5],
  );
});

const container = {
  setup:
    (_, { slots }) =>
    () =>
      Vue.h("div", slots.default?.()),
};
async function renderView(props) {
  const component = {
    ...view,
    mixins: [],
    render: evaluate(viewSource.template.code, () => Vue).render,
    components: Object.fromEntries(
      Object.keys(view.components).map((name) => [name, container]),
    ),
  };
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(
        component,
        { modern: true, community: {}, isCommunity: true, ...props },
        { aside: () => Vue.h("aside", "regime and access remain available") },
      ),
  });
  for (const name of [
    "v-icon",
    "v-btn",
    "v-tooltip",
    "v-menu",
    "v-col",
    "v-row",
    "v-container",
    "apexchart",
    "u-loading-progress",
  ])
    app.component(name, container);
  app.directive("intersect", {});
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $i18n: { locale: "en" },
    $vuetify: {
      theme: {
        name: "light",
        current: { dark: false },
        computedThemes: {
          light: {
            colors: {
              primary: "#0065ed",
              surface: "#ffffff",
              secondary: "#8a5bce",
              "on-surface": "#25272c",
              success: "#2c8660",
              warning: "#b87d1d",
              info: "#0288d1",
            },
          },
        },
      },
    },
    numeralFormat: (value) => String(value),
    getLocalTimeString: (date) => date.toISOString().slice(0, 10),
  });
  return renderToString(app);
}

test("loading and failed analytics retain access aside, and completed empty data renders chart geometry", async () => {
  assert.equal(view.props.modern.default, false);
  for (const props of [
    { timeSeries: null, loading: true },
    { timeSeries: null, loadError: true },
  ]) {
    const html = await renderView(props);
    assert.match(html, /regime and access remain available/);
    assert.doesNotMatch(html, /c-community-statistic-modern__activity-chart/);
    if (props.loadError) assert.match(html, /analytics_error/);
    else assert.match(html, /aria-busy="true"/);
  }
  const html = await renderView({ timeSeries: series([]) });
  assert.match(html, /c-community-statistic-modern__activity-chart/);
  assert.match(html, /c-community-statistic-modern__breakdowns/);
  assert.match(html, /2026-10-17 – 2026-10-24/);
});

test("loader ignores stale responses and treats failure as unavailable rather than zero", async () => {
  const loaderSource = readComponent("../statistic/CommunityStatistic.vue");
  const requests = [];
  class TimeSeries {
    constructor(raw_data, title, offset, days) {
      Object.assign(this, { raw_data, title, offset, days });
    }
  }
  const loader = evaluate(
    loaderSource.descriptor.script.content,
    (path) =>
      path.includes("timeserie/TimeSeries")
        ? { TimeSeries }
        : { default: { showErrorAlert() {}, showLaravelError() {} } },
    {
      window: { CAPI: { GET_COMMUNITY_DATA: (id) => "/communities/" + id } },
      axios: {
        get(url, options) {
          return new Promise((resolve, reject) =>
            requests.push({ url, options, resolve, reject }),
          );
        },
      },
    },
  ).default;
  assert.equal(loader.props.modern.default, false);
  const context = {
    ...loader.data(),
    community: { id: 7 },
    fetchCallback() {},
  };
  const first = loader.methods.fetchCommunity.call(context);
  context.offset = 4;
  context.days = 30;
  const second = loader.methods.fetchCommunity.call(context);
  assert.equal(requests[1].url, "/communities/7");
  assert.deepEqual(JSON.parse(JSON.stringify(requests[1].options.params)), {
    offset: 4,
    days: 30,
  });
  requests[1].resolve({ data: { data: [{ posts: 5 }] } });
  await second;
  assert.equal(context.community_timeseries.raw_data[0].posts, 5);
  requests[0].resolve({ data: { data: [{ posts: 999 }] } });
  await first;
  assert.equal(context.community_timeseries.raw_data[0].posts, 5);
  assert.equal(context.busy, false);

  const failed = loader.methods.fetchCommunity.call(context);
  requests[2].reject(new Error("isolated test failure"));
  await failed;
  assert.equal(context.load_error, true);
  assert.equal(context.community_timeseries.raw_data[0].posts, 5);
  assert.equal(context.busy, false);

  const empty = loader.methods.fetchCommunity.call(context);
  requests[3].resolve({ data: { data: [] } });
  await empty;
  assert.equal(context.load_error, false);
  assert.equal(context.community_timeseries.raw_data.length, 0);
  assert.equal(context.community_timeseries.offset, 4);
  assert.equal(context.community_timeseries.days, 30);
});
