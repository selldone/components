import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const repository = fileURLToPath(
  new URL("../../../../../../", import.meta.url),
);
// Synthetic source/rendering fixtures only; requests are promises, never network calls.
const fs = require("node:fs"),
  assert = require("node:assert/strict"),
  vm = require("node:vm"),
  ts = require("typescript");
const {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} = require("@vue/compiler-sfc");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { JSDOM } = require("jsdom");
const base = "@selldone/components-vue/";
const read = (path) => fs.readFileSync(resolve(repository, path), "utf8");
const paths = {
  acquisition:
    "backoffice/dashboard/shop/aquisition/BDashboardShopAcquisition.vue",
  sessions: "backoffice/session/map/BSessionsMap.vue",
  channels: "backoffice/dashboard/shop/channels/BDashboardShopChannels.vue",
};
const fixedNow = new Date("2026-10-27T12:00:00Z");
class CheckDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : [fixedNow]));
  }
}
const calendar = (days, end = false) => {
  const d = new CheckDate();
  d.setDate(d.getDate() - days);
  d.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
  return d;
};
const dc = {
  convertToLocalTime: (v) => (v == null ? null : new CheckDate(v.date || v)),
  GetStartOfDateBefore: (d) => calendar(d),
  GetEndOfDateBefore: (d) => calendar(d, true),
};
class Series {
  constructor(rows, title, offset, days) {
    Object.assign(this, { raw_data: rows, title, offset, days });
  }
}
const document = new JSDOM().window.document;
const maximumFixtures = ["#FFA000", "#C2185B", "#1976D2"].map(
  (color, index) => ({
    x: 280,
    y: [26476, 100, 110][index],
    marker: { size: 4, strokeColor: color },
    label: {
      text: `Maximum ${index}: ${[26476, 100, 110][index]}`,
      style: { background: color },
    },
  }),
);

let requests = [];
const axios = {
  get: (url, options) =>
    new Promise((resolve) => requests.push({ url, options, resolve })),
};
const req = (name) => {
  if (name === "vue") return Vue;
  if (name.endsWith(".svg")) return { default: "fixture.svg" };
  if (name.includes("/Brands.ts")) return { Brands: [] };
  if (name === "@selldone/core-js/helper")
    return { colorSet3: ["#1976d2"], ShadeColor: (color) => color };
  if (name === "numeral") return { default: require("numeral") };
  if (name.includes("DateConverter")) return { DateConverter: dc };
  if (name.includes("TimeSeries")) return { TimeSeries: Series };
  if (name.includes("ChartAnnotations"))
    return { ChartAnnotations: { CreateMaxPoints: () => maximumFixtures } };
  if (name === "chroma-js") return { mix: () => ({ hex: () => "#eee" }) };
  if (name === "@selldone/core-js") return { Analytics: { DeviceType: [] } };
  return {
    default: {},
    ProductType: {},
    ChartAnnotations: {},
    CampaignHelper: {
      GetTotalSocials: () => 0,
      GetTotalOrganicSearch: () => 0,
      GetTotalDirects: ({ social }) => social.direct || 0,
      GetTotalOther: () => 0,
      GetSocialsOnly: () => ({}),
    },
    CountriesResourceHelper: { FetchCountries: () => {} },
  };
};
const transpile = (src) =>
  ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
function load(path) {
  const source = read(base + path);
  const p = parse(source, { filename: path });
  assert.deepEqual(p.errors, []);
  const exports = {};
  vm.runInNewContext(transpile(p.descriptor.script.content), {
    exports,
    require: req,
    Date: CheckDate,
    Number,
    document,
    axios,
    setInterval: () => 1,
    clearInterval: () => {},
  });
  return { component: exports.default, descriptor: p.descriptor };
}
function state(component, props) {
  const s = { ...component.data?.(), ...props };
  Object.entries(component.methods || {}).forEach(
    ([k, f]) => (s[k] = f.bind(s)),
  );
  Object.entries(component.computed || {}).forEach(([k, f]) =>
    Object.defineProperty(s, k, { get: () => f.call(s) }),
  );
  return s;
}
const plain = (x) => JSON.parse(JSON.stringify(x));
async function renderEmptyFixture(
  path,
  socials,
  modern = true,
  composition = [],
) {
  const { component, descriptor } = load(path);
  const script = compileScript(descriptor, { id: "dashboard-empty-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: path,
    id: "dashboard-empty-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  for (const block of descriptor.styles) {
    const style = await compileStyleAsync({
      source: block.content,
      filename: path,
      id: "dashboard-empty-test",
      scoped: block.scoped,
      preprocessLang: "scss",
    });
    assert.deepEqual(style.errors, []);
  }
  const exports = {};
  vm.runInNewContext(transpile(template.code), { exports, require: req });
  const wrapper = {
    inheritAttrs: false,
    setup:
      (_, { slots, attrs }) =>
      () =>
        Vue.h("div", attrs, slots.default?.()),
  };
  const chart = (name) => ({
    props: ["modern", "values"],
    setup: (props) => () =>
      Vue.h("div", {
        "data-chart": name,
        "data-modern": String(props.modern),
        "data-values": JSON.stringify(props.values),
      }),
  });
  const components = Object.fromEntries(
    Object.keys(component.components).map((key) => [key, wrapper]),
  );
  components.BSessionChartSankey = chart("sankey");
  components.UChartFunnel = chart("funnel");
  const app = Vue.createSSRApp(
    {
      ...component,
      components,
      // Keep chart-library option generation outside this empty-state rendering check.
      computed: {
        ...component.computed,
        options: () => ({}),
        options_pie: () => ({}),
        series: () => [],
        series_pie: () => composition,
        modern_metrics: () => [],
        // The production Array.sortByKey extension is not installed in this isolated VM.
        sorted_socials() {
          return Object.entries(this.socials).map(([key, value]) => ({
            key,
            value,
          }));
        },
      },
      render: exports.render,
    },
    {
      modern,
      shop: {},
      timeSeries: {
        raw_data: [{ created_at: "2026-10-27", social: socials }],
        socialTotalKeys: () => socials,
        totalOf: () => 0,
      },
    },
  );
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $i18n: { locale: "en" },
    $vuetify: {
      display: { smAndDown: false },
      theme: { name: "light", current: { dark: false } },
    },
    numeralFormat: (value) => String(value),
    truncate: (value) => Math.trunc(value),
    getName: (value) => value,
    getLocalTimeString: (value) => value,
    getLocalDateString: (value) => value,
  });
  for (const name of [
    "v-row",
    "v-col",
    "v-btn",
    "v-icon",
    "v-tooltip",
    "v-slider",
    "v-table",
    "s-widget-box",
  ])
    app.component(name, wrapper);
  app.component("apexchart", {
    props: ["type", "series"],
    setup: (props) => () =>
      Vue.h("div", {
        "data-chart": props.type,
        "data-series": JSON.stringify(props.series),
      }),
  });
  const html = await renderToString(app);
  return new JSDOM(html).window.document;
}
(async () => {
  const composition = await renderEmptyFixture(
    paths.acquisition,
    {},
    true,
    [0, 0, 0, 0, 0],
  );
  const ring = composition.querySelector(
    ".b-dashboard-acquisition__composition-zero",
  );
  assert.equal(ring.textContent.trim(), "0");
  assert.equal(
    ring.getAttribute("aria-label"),
    "shop_visitors_widget.page_views: 0",
  );
  assert.equal(ring.getAttribute("role"), "img");
  assert.equal(
    composition.querySelector("[data-chart=donut]").getAttribute("data-series"),
    "[0,0,0,0,0]",
    "Apex keeps its native zero series and legend rather than fabricated proportions",
  );
  assert.ok(
    composition.querySelector(".b-dashboard-acquisition__composition-range"),
    "Native date selector remains rendered",
  );
  for (const values of [
    [],
    [null, 0, 0, 0, 0],
    [NaN, 0, 0, 0, 0],
    [Infinity, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ]) {
    const normal = await renderEmptyFixture(
      paths.acquisition,
      {},
      true,
      values,
    );
    assert.equal(
      normal.querySelector(".b-dashboard-acquisition__composition-zero"),
      null,
    );
    assert.ok(normal.querySelector("[data-chart=donut]"));
  }
  const legacyComposition = await renderEmptyFixture(
    paths.acquisition,
    {},
    false,
    [0, 0, 0, 0, 0],
  );
  assert.equal(
    legacyComposition.querySelector(
      ".b-dashboard-acquisition__composition-zero",
    ),
    null,
  );
  for (const socials of [{}, { direct: 0 }]) {
    const empty = await renderEmptyFixture(paths.acquisition, socials);
    assert.equal(
      empty.querySelectorAll(".b-dashboard-acquisition__flow-empty").length,
      1,
    );
    assert.equal(
      empty.querySelector(".b-dashboard-acquisition__flow-empty-count")
        .textContent,
      "0",
    );
    assert.ok(
      empty
        .querySelector(".b-dashboard-acquisition__flow-empty")
        .textContent.includes("global.commons.no_data"),
    );
    assert.equal(empty.querySelector("[data-chart=sankey]"), null);
  }
  const observed = await renderEmptyFixture(paths.acquisition, { direct: 2 });
  assert.equal(
    observed.querySelector(".b-dashboard-acquisition__flow-empty"),
    null,
  );
  assert.ok(observed.querySelector("[data-chart=sankey]"));
  const legacyZero = await renderEmptyFixture(
    paths.acquisition,
    { direct: 0 },
    false,
  );
  assert.ok(legacyZero.querySelector("[data-chart=sankey]"));
  assert.equal(
    legacyZero.querySelector(".b-dashboard-acquisition__flow-empty"),
    null,
  );
  const noSources = await renderEmptyFixture(paths.channels, {});
  assert.equal(
    noSources.querySelector(".b-dashboard-channels__empty").style.minHeight,
    "300px",
  );
  assert.ok(
    noSources.body.textContent.includes(
      "admin_shop.dashboard.modern.channel_history_empty",
    ),
  );
  assert.equal(noSources.querySelector("[data-chart=funnel]"), null);
  assert.equal(
    noSources.querySelector(".b-dashboard-channels__day-table"),
    null,
  );
  const zeroSource = await renderEmptyFixture(paths.channels, { direct: 0 });
  assert.equal(zeroSource.querySelector(".b-dashboard-channels__empty"), null);
  assert.equal(
    zeroSource.querySelector("[data-chart=funnel]").getAttribute("data-modern"),
    "true",
  );
  assert.equal(
    zeroSource.querySelector("[data-chart=funnel]").getAttribute("data-values"),
    "[[0]]",
  );
  assert.ok(
    zeroSource
      .querySelector(".b-dashboard-channels__day-table")
      .textContent.includes("direct"),
  );
  const legacySources = await renderEmptyFixture(paths.channels, {}, false);
  assert.equal(legacySources.querySelector(".b-dashboard-channels"), null);
  const acq = load(paths.acquisition).component;
  const ac = state(acq, {
    modern: true,
    shop: {},
    timeSeries: {
      raw_data: [
        {
          created_at: "2026-10-26",
          page_views: 3,
          new_visitors: 1,
          returning_visitors: 2,
          amp: 9,
        },
        {
          created_at: "2026-10-25",
          page_views: 999,
          new_visitors: 99,
          returning_visitors: 5,
          amp: 3,
        },
        {
          created_at: "2026-10-27",
          page_views: 0,
          new_visitors: 0,
          returning_visitors: null,
          amp: 0,
        },
      ],
    },
    $t: (x) => x,
    $vuetify: { display: { smAndDown: false } },
  });
  assert.equal(ac.endpointPoints.length, 3);
  assert.equal(ac.endpointPoints[0].y, 0, "Recorded zero remains an endpoint");
  assert.equal(ac.endpointPoints[1].y, 0);
  assert.equal(
    ac.endpointPoints[2].y,
    2,
    "Missing latest value uses the last actual observation",
  );
  assert.deepEqual(
    plain(ac.endpointPoints.map((p) => p.seriesIndex)),
    [0, 1, 2],
  );
  ac.shop = { options: [{ code: "amp", value: true }] };
  assert.equal(ac.endpointPoints.length, 4);
  assert.equal(ac.endpointPoints[1].y, 0);
  assert.deepEqual(plain(ac.endpointPoints.map((p) => p.marker.strokeColor)), [
    "#FFA000",
    "#444",
    "#C2185B",
    "#1976D2",
  ]);
  assert.deepEqual(
    plain(ac.maxPoints.map((p) => p.seriesIndex)),
    [0, 2, 3],
    "Maximum labels track the real AMP series order",
  );
  assert.deepEqual(
    plain(ac.maxPoints.map((p) => [p.x, p.y])),
    maximumFixtures.map((p) => [p.x, p.y]),
    "Caption placement never changes maximum observations",
  );
  const originalMaxima = JSON.stringify(maximumFixtures);
  assert.equal(
    ac.maxPoints[0].label.text,
    "shop_visitors_widget.page_views: 26.5K",
    "Desktop maximum labels retain the translated series name with a compact value",
  );
  assert.equal(
    ac.maxPoints[1].label.text,
    "shop_visitors_widget.new_visitors: 100",
  );
  assert.ok(
    ac.maxPoints.every(
      (point) =>
        point.label.textAnchor === "middle" && point.label.offsetX === 0,
    ),
    "Native captions are centered over each actual maximum",
  );
  ac.$vuetify.display.smAndDown = true;
  assert.equal(
    ac.maxPoints[0].label.text,
    "26.5K",
    "Mobile maximum labels contain only the compact value",
  );
  assert.deepEqual(
    plain(ac.maxPoints.map((point) => [point.x, point.y])),
    maximumFixtures.map((point) => [point.x, point.y]),
  );
  ac.$vuetify.display.smAndDown = false;
  ac.modern = false;
  assert.equal(ac.endpointPoints.length, 0);
  assert.equal(ac.maxPoints, maximumFixtures);
  assert.equal(ac.maxPoints[0].label.text, "Maximum 0: 26476");
  assert.equal(
    JSON.stringify(maximumFixtures),
    originalMaxima,
    "Modern formatting leaves the shared helper's observations and legacy labels unchanged",
  );

  const sessions = load(paths.sessions).component;
  const s = state(sessions, {
    modern: true,
    summary: false,
    fullDetails: true,
    url: "/isolated",
    datKey: "sessions",
  });
  assert.equal(
    s.calendarDayNumber("2026-10-27") - s.calendarDayNumber("2026-10-20"),
    7,
  );
  assert.equal(
    s.calendarDayNumber(s.report_min_date),
    s.calendarDayNumber(calendar(89)),
  );
  s.custom_report_start = calendar(89);
  s.custom_report_end = calendar(0, true);
  assert.deepEqual(
    plain(s.custom_report_window),
    { offset: 0, days: 89 },
    "Custom Last90days contains90 inclusive calendar dates",
  );
  s.custom_report_start = calendar(90);
  assert.equal(
    s.custom_report_window,
    null,
    "The91st calendar date is outside Last90days",
  );
  s.selectReportPeriod({ title: "time_spans.last_7", from: 7, to: 0 });
  assert.equal(s.offset, 0);
  assert.equal(s.days, 6);
  assert.deepEqual(plain(s.report_selector_range), [0, 7]);
  assert.deepEqual(plain(requests[0].options.params), {
    offset: 0,
    days: 7,
    details: true,
  });
  const rows = [
    { created_at: "2026-10-20", US: 99 },
    { created_at: "2026-10-21", US: 0 },
    { created_at: "2026-10-23", US: 2 },
    { created_at: "2026-10-27", US: 3 },
    { created_at: "2026-10-28", US: 88 },
  ];
  requests[0].resolve({ data: { sessions: rows } });
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(
    plain(s.timeSeries.raw_data),
    [rows[1], rows[2], rows[3]],
    "Exact7-day range excludes both outside edges and preserves recorded0 without filling missing dates",
  );
  assert.equal(s.timeSeries.days, 6);
  assert.equal(s.busy, false);
  s.selectReportPeriod({ title: "time_spans.yesterday", from: 1, to: 1 });
  assert.deepEqual(plain(requests[1].options.params), {
    offset: 1,
    days: 1,
    details: true,
  });
  assert.equal(s.days, 0);
  assert.equal(s.offset, 1);
  requests[1].resolve({
    data: {
      sessions: [
        { created_at: "2026-10-25", US: 99 },
        { created_at: "2026-10-26", US: 0 },
        { created_at: "2026-10-27", US: 100 },
      ],
    },
  });
  await new Promise((r) => setImmediate(r));
  assert.deepEqual(plain(s.timeSeries.raw_data), [
    { created_at: "2026-10-26", US: 0 },
  ]);
  s.selectReportPeriod({ title: "time_spans.custom" });
  assert.equal(s.custom_report_dialog, true);
  const before = requests.length;
  s.custom_report_start = new CheckDate("2026-10-20T12:00:00");
  s.custom_report_end = new CheckDate("2026-10-23T12:00:00");
  assert.deepEqual(plain(s.custom_report_window), { offset: 4, days: 3 });
  s.applyCustomReport();
  assert.equal(requests.length, before + 1);
  assert.deepEqual(plain(requests.at(-1).options.params), {
    offset: 4,
    days: 4,
    details: true,
  });
  requests.at(-1).resolve({
    data: {
      sessions: [
        { created_at: "2026-10-19", US: 99 },
        { created_at: "2026-10-20", US: 1 },
        { created_at: "2026-10-23", US: 0 },
        { created_at: "2026-10-24", US: 99 },
      ],
    },
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(s.timeSeries.raw_data.length, 2);
  for (const [start, end] of [
    ["2026-10-25", "2026-10-20"],
    ["2026-10-20", "2026-10-28"],
    ["2026-01-01", "2026-10-20"],
    ["invalid", "2026-10-20"],
  ]) {
    s.custom_report_start = start;
    s.custom_report_end = end;
    assert.equal(s.custom_report_window, null);
  }
  s.selectReportPeriod({ title: "time_spans.last_90", from: 90, to: 0 });
  assert.equal(s.days, 89);
  assert.deepEqual(plain(requests.at(-1).options.params), {
    offset: 0,
    days: 90,
    details: true,
  });
  requests.at(-1).resolve({
    data: {
      sessions: [
        { created_at: calendar(90), US: 99 },
        { created_at: calendar(89), US: 0 },
        { created_at: calendar(0), US: 3 },
      ],
    },
  });
  await new Promise((r) => setImmediate(r));
  assert.equal(s.timeSeries.raw_data.length, 2);
  s.play = true;
  s.custom_selected_day = 2;
  const first = s.fetchShopSessions(0, 6),
    r1 = requests.at(-1);
  const second = s.fetchShopSessions(0, 13),
    r2 = requests.at(-1);
  assert.equal(s.play, false);
  assert.equal(s.custom_selected_day, -1);
  r2.resolve({ data: { sessions: [{ created_at: "2026-10-27", US: 14 }] } });
  await second;
  r1.resolve({ data: { sessions: [{ created_at: "2026-10-27", US: 7 }] } });
  await first;
  assert.equal(
    s.timeSeries.raw_data[0].US,
    14,
    "Slower previous range cannot overwrite the selected range",
  );
  for (const props of [
    { modern: false, summary: false },
    { modern: true, summary: true },
  ]) {
    const old = state(sessions, {
      ...props,
      url: "/isolated",
      datKey: "sessions",
      fullDetails: false,
    });
    const p = old.fetchShopSessions(2, 30);
    const r = requests.at(-1);
    assert.deepEqual(
      plain(r.options.params),
      { offset: 2, days: 30, details: false },
      "Legacy/summary request remains exact previous API shape",
    );
    r.resolve({ data: { sessions: { US: 7 } } });
    await p;
    assert.equal(old.timeSeries.raw_data[0].US, 7);
  }

  // Exercise Apex's actual local annotation renderer: native legend and zoom exclusions remain active.
  const nativeExports = {};
  const nativeCode = transpile(
    read(
      "node_modules/apexcharts/src/modules/annotations/PointsAnnotations.js",
    ),
  );
  class NativeHelpers {
    getX1X2(_, a) {
      return { x: a.x, clipped: !!a.outsideZoom };
    }
    getY1Y2(_, a) {
      return { yP: a.y, clipped: false };
    }
  }
  vm.runInNewContext(nativeCode, {
    exports: nativeExports,
    require: (name) =>
      name.includes("Utils")
        ? { default: { isNumber: Number.isFinite } }
        : name.includes("Helpers")
          ? { default: NativeHelpers }
          : { applyProgressiveReveal: () => {} },
  });
  const svgNS = "http://www.w3.org/2000/svg";
  const element = (tag) => document.createElementNS(svgNS, tag);
  const wrapper = (node) => ({
    node,
    attr(attrs) {
      Object.entries(attrs).forEach(([k, v]) =>
        node.setAttribute(k, String(v)),
      );
      return this;
    },
  });
  let nativeW = { globals: { collapsedSeriesIndices: [] } };
  const nativeContext = {
    w: nativeW,
    graphics: {
      drawMarker(x, y, o) {
        const node = element("circle");
        node.setAttribute("cx", x);
        node.setAttribute("cy", y);
        node.setAttribute("r", o.pSize);
        node.setAttribute("stroke", o.pointStrokeColor);
        node.setAttribute("fill", o.pointFillColor);
        node.setAttribute("class", o.class);
        return wrapper(node);
      },
      drawText(o) {
        const node = element("text");
        node.textContent = o.text;
        node.setAttribute("class", o.cssClass);
        node.setAttribute("x", o.x);
        node.setAttribute("y", o.y);
        return wrapper(node);
      },
      group(attrs) {
        return wrapper(element("g")).attr(attrs);
      },
    },
  };
  const native = new nativeExports.default(nativeContext);
  ac.modern = true;
  const point = ac.endpointPoints[2];
  const annotation = {
    ...point,
    label: { text: "", offsetX: 0, offsetY: 0, style: { fontSize: "11px" } },
    image: {},
  };
  const target = element("g");
  native.addPointAnnotation(annotation, target, 0);
  assert.equal(target.querySelectorAll("circle").length, 1);
  assert.equal(
    target.querySelector("circle").getAttribute("stroke"),
    point.marker.strokeColor,
  );
  assert.equal(target.querySelector("circle").getAttribute("r"), "10");
  assert.equal(target.lastElementChild.textContent, "\ue7fe");
  nativeW.globals.collapsedSeriesIndices = [point.seriesIndex];
  const hidden = element("g");
  native.addPointAnnotation(annotation, hidden, 0);
  assert.equal(
    hidden.children.length,
    0,
    "Native legend hiding removes corresponding endpoint",
  );
  nativeW.globals.collapsedSeriesIndices = [];
  const zoomed = element("g");
  native.addPointAnnotation({ ...annotation, outsideZoom: true }, zoomed, 0);
  assert.equal(
    zoomed.children.length,
    0,
    "Native zoom excludes endpoints outside the visible date range",
  );

  // Pixel fixtures represent close visible values after native axis scaling.
  const closePoints = [30, 100, 110].map((y, index) => ({
    ...annotation,
    x: 280,
    y,
    seriesIndex: index,
  }));
  const collisions = element("g");
  nativeContext.el = collisions;
  nativeW.layout = { gridWidth: 300 };
  closePoints.forEach((point, index) =>
    native.addPointAnnotation(point, collisions, index),
  );
  ac.separateEndpointMarkers(nativeContext);
  const visibleMarkers = collisions.querySelectorAll(
    ".apexcharts-point-annotation-marker",
  );
  assert.equal(visibleMarkers[1].getAttribute("transform"), "translate(0, 0)");
  assert.equal(
    visibleMarkers[2].getAttribute("transform"),
    "translate(-24, 0)",
  );
  assert.equal(visibleMarkers[2].getAttribute("cx"), "280");
  assert.equal(visibleMarkers[2].getAttribute("cy"), "110");
  assert.equal(
    collisions
      .querySelectorAll(".apexcharts-point-annotations-custom-svg")[2]
      .getAttribute("transform"),
    "translate(256, 110)",
    "Only the icon moves horizontally; the native point keeps its actual x/y",
  );
  assert.equal(
    collisions
      .querySelector(".b-dashboard-acquisition__endpoint-leader")
      .getAttribute("d"),
    "M 280 110 H 266",
    "The short leader connects the exact endpoint to the shifted circle edge",
  );
  ac.separateEndpointMarkers(nativeContext);
  assert.equal(
    collisions.querySelectorAll(".b-dashboard-acquisition__endpoint-leader")
      .length,
    1,
    "Repeated updates do not accumulate leaders or offsets",
  );
  for (const collapsed of [false, true]) {
    const redrawn = element("g");
    nativeContext.el = redrawn;
    nativeW.globals.collapsedSeriesIndices = collapsed ? [2] : [];
    closePoints.forEach((point, index) =>
      native.addPointAnnotation(
        { ...point, outsideZoom: !collapsed && index === 2 },
        redrawn,
        index,
      ),
    );
    ac.separateEndpointMarkers(nativeContext);
    assert.equal(redrawn.querySelectorAll("circle").length, 2);
    assert.equal(
      redrawn.querySelectorAll(".b-dashboard-acquisition__endpoint-leader")
        .length,
      0,
      "Legend/zoom removal releases the unused collision offset",
    );
  }
  nativeW.globals.collapsedSeriesIndices = [];
  const leftEdge = element("g");
  nativeContext.el = leftEdge;
  closePoints.forEach((point, index) =>
    native.addPointAnnotation({ ...point, x: 0, y: 100 }, leftEdge, index),
  );
  ac.separateEndpointMarkers(nativeContext);
  assert.deepEqual(
    [...leftEdge.querySelectorAll("circle")].map((node) =>
      node.getAttribute("transform"),
    ),
    ["translate(0, 0)", "translate(24, 0)", "translate(48, 0)"],
    "Near the left/RTL edge, markers separate inward instead of leaving the plot",
  );

  // Native labels/backgrounds share their original maximum; only their caption position changes.
  const maxima = ac.maxPoints.map((p) => ({
    ...p,
    marker: { ...p.marker, offsetX: 0, offsetY: 0 },
    label: { ...p.label, offsetX: 0, offsetY: 0 },
    customSVG: {},
    image: {},
  }));
  function maxCaptions(
    width,
    hidden = [],
    outside = [],
    xs = [0, width / 2, width],
  ) {
    const root = element("g");
    nativeContext.el = root;
    nativeW.layout.gridWidth = width;
    nativeW.globals.collapsedSeriesIndices = hidden;
    const scaledMaxima = maxima.map((point, index) => ({
      ...point,
      x: xs[index],
    }));
    scaledMaxima.forEach((point, index) => {
      native.addPointAnnotation(
        { ...point, outsideZoom: outside.includes(index) },
        root,
        index,
      );
      const text = root.querySelector(`text.${point.id}`);
      if (!text) return;
      const rect = element("rect");
      rect.setAttribute("class", point.id);
      const box = { x: point.x - 30, y: point.y - 22, width: 60, height: 16 };
      rect.getBBox = () => box;
      root.insertBefore(rect, text);
    });
    ac.spaceMaximumLabels(nativeContext);
    const captions = [
      ...root.querySelectorAll(".b-dashboard-acquisition__maximum-label"),
    ];
    const centers = captions.map((text) => {
      const transform = Number(
        text.getAttribute("transform").match(/translate\(([^,]+)/)[1],
      );
      assert.equal(
        text.previousElementSibling.getAttribute("transform"),
        text.getAttribute("transform"),
        "Caption text and native background move together",
      );
      return Number(text.getAttribute("x")) + transform;
    });
    assert.deepEqual(
      [...root.querySelectorAll(".apexcharts-point-annotation-marker")].map(
        (n) => [n.getAttribute("cx"), n.getAttribute("cy")],
      ),
      scaledMaxima
        .filter(
          (p, i) => !hidden.includes(p.seriesIndex) && !outside.includes(i),
        )
        .map((p) => [String(p.x), String(p.y)]),
    );
    return { root, centers };
  }
  for (const width of [230, 600]) {
    const { root, centers } = maxCaptions(width);
    assert.deepEqual(
      centers,
      [34, width / 2, width - 34],
      "Only edge captions move inward; the interior caption stays centered over its peak",
    );
    const before = [...root.querySelectorAll("text")].map((n) =>
      n.getAttribute("transform"),
    );
    ac.spaceMaximumLabels(nativeContext);
    assert.deepEqual(
      [...root.querySelectorAll("text")].map((n) =>
        n.getAttribute("transform"),
      ),
      before,
      "Redrawing does not accumulate caption offsets",
    );
    assert.equal(
      root.querySelectorAll(".b-dashboard-acquisition__maximum-leader").length,
      2,
      "Only edge clamps add leaders to the original maxima",
    );
    const interiorXs = [40, width / 2, width - 40];
    const interior = maxCaptions(width, [], [], interiorXs);
    assert.deepEqual(interior.centers, interiorXs);
    assert.equal(
      interior.root.querySelectorAll(".b-dashboard-acquisition__maximum-leader")
        .length,
      0,
      "Interior captions keep their actual peak positions without leaders",
    );
    assert.ok(
      [
        ...interior.root.querySelectorAll(
          ".b-dashboard-acquisition__maximum-label",
        ),
      ].every(
        (caption) => caption.getAttribute("transform") === "translate(0, 0)",
      ),
    );
  }
  assert.deepEqual(
    maxCaptions(600, [2]).centers,
    [34, 566],
    "Hiding a series does not reposition the remaining captions away from their maxima",
  );
  assert.deepEqual(
    maxCaptions(600, [], [0, 1]).centers,
    [566],
    "Zoomed-out maximum observations are not recreated",
  );

  console.log(
    "PASS: Acquisition/Channels empty plots retain neutral bodies, observed zero labels, real source data and legacy behavior; Acquisition endpoints preserve actual zero/missing/latest observations and native legend/zoom; Sessions preserves exact7/90-day, yesterday/custom bounds, recorded zero/gaps, stale-response protection and legacy/summary requests. No API calls.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
