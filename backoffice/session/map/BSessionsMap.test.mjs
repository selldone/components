import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

const source = readFileSync(
  new URL("./BSessionsMap.vue", import.meta.url),
  "utf8",
);
const { descriptor, errors } = parse(source);
assert.deepEqual(errors, []);
const transpile = (content) =>
  ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const today = new Date("2026-10-28T12:00:00Z");
class FixtureDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : [today]));
  }
}
const dateBefore = (offset, end = false) => {
  const date = new FixtureDate();
  date.setDate(date.getDate() - offset);
  date.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
  return date;
};

class Series {
  constructor(rows, title, offset, days) {
    Object.assign(this, { raw_data: rows, title, offset, days });
  }
  totalOf(key) {
    return this.raw_data.reduce((sum, row) => sum + (row[key] || 0), 0);
  }
  getTotalAllKeys(excluded = []) {
    const result = {};
    for (const row of this.raw_data)
      for (const key of Object.keys(row)) {
        if (key.length === 2 && !excluded.includes(key))
          result[key] = (result[key] || 0) + row[key];
      }
    return result;
  }
  findDataOnDay(day) {
    return this.raw_data.find((row) => row.fixture_day === day);
  }
}
const sample = () =>
  new Series(
    [
      {
        created_at: dateBefore(0),
        fixture_day: 0,
        US: 10,
        CA: 2,
        id: 500,
        pc: 99,
        desktop: 9,
        mobile: 5,
        tablet: 1,
      },
      {
        created_at: dateBefore(1),
        fixture_day: 1,
        US: 4,
        CA: 0,
        id: 501,
        pc: 99,
        desktop: 2,
        mobile: 2,
        tablet: 0,
      },
      {
        created_at: dateBefore(2),
        fixture_day: 2,
        US: 0,
        CA: 3,
        id: 502,
        pc: 99,
        desktop: 1,
        mobile: 0,
        tablet: 0,
      },
    ],
    "Sessions",
    0,
    2,
  );
const theme = {
  current: { dark: false, colors: { surface: "#fff", "on-surface": "#222" } },
};

function fixture(props = {}) {
  const requests = [];
  let timer;
  const exports = {};
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("TimeSeries")) return { TimeSeries: Series };
    if (name.includes("DateConverter"))
      return {
        DateConverter: {
          convertToLocalTime: (value) =>
            value == null ? null : new FixtureDate(value),
          GetStartOfDateBefore: (offset) => dateBefore(offset),
          GetEndOfDateBefore: (offset) => dateBefore(offset, true),
        },
      };
    if (name === "@selldone/core-js")
      return {
        Analytics: {
          DeviceType: ["desktop", "mobile", "tablet"].map((code) => ({
            code,
            title: `device_types.${code}`,
            icon: "devices",
            color: "#1976d2",
          })),
        },
      };
    if (name === "chroma-js") return { mix: () => ({ hex: () => "#eee" }) };
    return { default: {}, CountriesResourceHelper: { FetchCountries() {} } };
  };
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports,
    require,
    Date: FixtureDate,
    setInterval: (callback) => {
      timer = callback;
      return 1;
    },
    clearInterval: () => {
      timer = undefined;
    },
    axios: {
      get: (url, options) =>
        new Promise((resolve, reject) =>
          requests.push({ url, options, resolve, reject }),
        ),
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    modern: true,
    report: true,
    summary: false,
    fullDetails: true,
    externalFeed: false,
    url: "/fixture/sessions",
    datKey: "sessions",
    shop: { countries: ["US"] },
    $vuetify: { theme },
    ...props,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { component, state, requests, require, tick: () => timer?.() };
}

test("daily map inspection preserves full-period country and device counters", () => {
  const { state } = fixture();
  state.timeSeries = sample();
  assert.equal(state.total_sessions_map, 19);
  assert.equal(state.total_sessions_keys, 20);
  assert.deepEqual(plain(state.top_countries), [
    ["US", 14],
    ["CA", 5],
  ]);
  state.custom_selected_day = 1;
  assert.equal(state.getCountrySessions("US"), 4);
  assert.equal(state.getCountrySessions("CA"), 0);
  assert.equal(state.total_sessions_map, 19);
  assert.equal(state.total_sessions_keys, 20);
  assert.deepEqual(plain(state.top_countries), [
    ["US", 14],
    ["CA", 5],
  ]);
  state.service_countries = true;
  assert.equal(state.getCountrySessions("US"), 14);
  state.service_countries = false;
  state.custom_selected_day = 9;
  assert.equal(state.getCountrySessions("US"), 0);
});

test("external affiliate feeds synchronize their period and reset day playback without fetching shop sessions", () => {
  const initial = sample();
  const f = fixture({ externalFeed: true, externalTimeSeries: initial, report: false, activityLabel: "Tracked activity" });
  f.component.created.call(f.state);
  assert.equal(f.state.timeSeries, initial);
  assert.equal(f.state.days, 2);
  assert.equal(f.state.total_sessions_map, 19);
  f.state.play = true;
  f.state.service_countries = true;
  f.component.watch.play.call(f.state, true);
  assert.equal(f.state.service_countries, false);
  f.state.custom_selected_day = 1;
  assert.equal(f.state.getCountrySessions("US"), 4);
  f.state.selected_country = "US";
  f.state.service_countries = true;
  const next = new Series([{ created_at: dateBefore(3), US: 2, mobile: 1 }], "Affiliate", 3, 6);
  f.component.watch.externalTimeSeries.call(f.state, next);
  assert.equal(f.state.timeSeries, next);
  assert.equal(f.state.offset, 3);
  assert.equal(f.state.days, 6);
  assert.equal(f.state.play, false);
  assert.equal(f.state.custom_selected_day, -1);
  assert.equal(f.state.selected_country, null);
  assert.equal(f.state.service_countries, false);
  f.tick();
  assert.equal(f.state.custom_selected_day, -1);
  assert.equal(f.state.total_sessions_map, 2);
  assert.equal(f.requests.length, 0);
  const ordinary = fixture({ externalFeed: false });
  ordinary.component.watch.externalTimeSeries.call(ordinary.state, next);
  assert.equal(ordinary.state.timeSeries, null);
});

test("country inspection toggles from either map or country list", () => {
  const { state } = fixture();
  state.selectCountry("US");
  assert.equal(state.selected_country, "US");
  state.selectCountryFromMap({ target: { closest: () => ({ id: "CA" }) } });
  assert.equal(state.selected_country, "CA");
  state.selectCountry("CA");
  assert.equal(state.selected_country, null);
  state.selectCountry("created_at");
  state.selectCountry(null);
  state.selectCountryFromMap({ target: {} });
  assert.equal(state.selected_country, null);
});

test("report playback includes both selected calendar boundaries", () => {
  const f = fixture();
  f.state.timeSeries = sample();
  f.state.service_countries = true;
  f.component.watch.play.call(f.state, true);
  assert.equal(f.state.service_countries, false);
  for (const day of [0, 1, 2, 0]) {
    f.tick();
    assert.equal(f.state.custom_selected_day, day);
  }
  f.state.stopAnimate();
  f.tick();
  assert.equal(f.state.custom_selected_day, 0);
});

test("report requests retain exact dates, stale-response guards and failure recovery", async () => {
  const f = fixture();
  const first = f.state.fetchShopSessions(0, 6);
  const second = f.state.fetchShopSessions(0, 13);
  assert.deepEqual(plain(f.requests[1].options.params), {
    offset: 0,
    days: 14,
    details: true,
  });
  f.requests[1].resolve({
    data: {
      sessions: [
        { created_at: dateBefore(0), US: 14 },
        { created_at: dateBefore(14), US: 99 },
      ],
    },
  });
  await second;
  f.requests[0].resolve({
    data: { sessions: [{ created_at: dateBefore(0), US: 7 }] },
  });
  await first;
  assert.equal(f.state.timeSeries.raw_data[0].US, 14);
  assert.equal(f.state.timeSeries.raw_data.length, 1);
  const previous = f.state.timeSeries;
  const failed = f.state.fetchShopSessions(0, 6);
  f.requests.at(-1).reject(new Error("Read denied"));
  await failed;
  assert.equal(f.state.fetch_error, true);
  assert.equal(f.state.busy, false);
  assert.equal(f.state.timeSeries, previous);
  const retry = f.state.fetchShopSessions(0, 6);
  assert.equal(f.state.fetch_error, false);
  f.requests.at(-1).resolve({ data: { sessions: [] } });
  await retry;
  assert.equal(f.state.total_sessions_map, 0);
  assert.equal(f.state.total_sessions_keys, 0);
});

test("legacy and summary request contracts remain unchanged", async () => {
  for (const props of [
    { modern: false, report: false },
    { modern: true, report: false, summary: true },
  ]) {
    const f = fixture({ ...props, fullDetails: false });
    const request = f.state.fetchShopSessions(2, 30);
    assert.deepEqual(plain(f.requests[0].options.params), {
      offset: 2,
      days: 30,
      details: false,
    });
    f.requests[0].resolve({ data: { sessions: { US: 7 } } });
    await request;
    assert.equal(f.state.total_sessions_map, 7);
  }
});

test("report renders native country buttons and the separate device chart", async () => {
  const f = fixture();
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: "BSessionsMap.vue",
    id: "sessions-report-test",
  });
  assert.deepEqual(compiled.errors, []);
  const exports = {};
  vm.runInNewContext(transpile(compiled.code), { exports, require: f.require });
  const wrapper = {
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("div", attrs, slots.default?.({ country: null })),
  };
  const components = Object.fromEntries(
    Object.keys(f.component.components).map((name) => [name, wrapper]),
  );
  components.BSessionDevicesPie = {
    props: ["type", "desktop", "mobile", "tablet"],
    setup: (props) => () =>
      Vue.h("div", {
        "data-device-type": props.type,
        "data-device-total": props.desktop + props.mobile + props.tablet,
      }),
  };
  const app = Vue.createSSRApp(
    {
      ...f.component,
      components,
      created() {},
      data: () => ({ ...f.component.data(), timeSeries: sample() }),
      render: exports.render,
    },
    {
      modern: true,
      report: true,
      fullDetails: true,
      shop: { countries: ["US"] },
    },
  );
  app.config.globalProperties.$vuetify = { theme };
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.$n = String;
  app.mixin({
    methods: {
      numeralFormat: String,
      getCountryName: (code) => code,
      getLocalDateString: () => "Fixture date",
    },
  });
  for (const name of [
    "v-icon",
    "v-btn",
    "v-tooltip",
    "v-progress-linear",
    "v-slider",
    "v-dialog",
    "v-card",
    "v-card-title",
    "v-card-text",
    "v-card-actions",
    "v-spacer",
    "v-col",
    "v-row",
    "v-table",
    "v-list-subheader",
    "flag",
  ])
    app.component(name, wrapper);
  const document = new JSDOM(await renderToString(app)).window.document;
  assert.equal(
    document.querySelectorAll("button.b-sessions-map__country").length,
    2,
  );
  assert.ok(document.querySelector(".sd-modern-list-header"));
  assert.equal(
    document
      .querySelector("[data-device-type]")
      .getAttribute("data-device-type"),
    "donut",
  );
  assert.equal(
    document
      .querySelector("[data-device-total]")
      .getAttribute("data-device-total"),
    "20",
  );
  for (const block of descriptor.styles) {
    const style = await compileStyleAsync({
      source: block.content,
      filename: "BSessionsMap.vue",
      id: "sessions-report-test",
      scoped: block.scoped,
      preprocessLang: "scss",
    });
    assert.deepEqual(style.errors, []);
  }
});
