import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

const { descriptor, errors } = parse(
  readFileSync(new URL("./BSessionsMap.vue", import.meta.url), "utf8"),
);
assert.deepEqual(errors, []);
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const series = () => ({
  offset: 2,
  days: 1,
  raw_data: [
    {
      fixture_day: 2,
      US: 7,
      CA: 2,
      id: 100,
      pc: 9,
      desktop: 4,
      mobile: 5,
      tablet: 0,
    },
    {
      fixture_day: 3,
      US: 1,
      CA: 0,
      id: 101,
      pc: 9,
      desktop: 1,
      mobile: 0,
      tablet: 0,
    },
  ],
  totalOf(key) {
    return this.raw_data.reduce((sum, row) => sum + (row[key] || 0), 0);
  },
  getTotalAllKeys(excluded = []) {
    const out = {};
    for (const row of this.raw_data)
      for (const [key, value] of Object.entries(row))
        if (key.length === 2 && !excluded.includes(key))
          out[key] = (out[key] || 0) + value;
    return out;
  },
  findDataOnDay(day) {
    return this.raw_data.find((row) => row.fixture_day === day);
  },
});

function fixture(props = {}) {
  let timer;
  const requests = [],
    exports = {};
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name === "chroma-js") return { mix: () => ({ hex: () => "#ddd" }) };
    if (name === "@selldone/core-js")
      return {
        Analytics: {
          DeviceType: ["desktop", "mobile", "tablet"].map((code) => ({
            code,
            title: `device_types.${code}`,
            icon: "devices",
            color: "#1976D2",
          })),
        },
      };
    return { default: {}, CountriesResourceHelper: { FetchCountries() {} } };
  };
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports,
    require,
    setInterval: (callback) => {
      timer = callback;
      return 1;
    },
    clearInterval: () => {
      timer = null;
    },
    axios: { get: (...args) => requests.push(args) },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    modern: true,
    audience: true,
    report: false,
    summary: false,
    fullDetails: true,
    externalFeed: true,
    externalTimeSeries: series(),
    shop: { countries: ["US"] },
    $vuetify: {
      theme: {
        current: {
          dark: false,
          colors: { surface: "#fff", "on-surface": "#222" },
        },
      },
    },
    ...props,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, computed] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => computed.call(state) });
  return { component, state, requests, require, tick: () => timer?.() };
}

test("audience uses the supplied period and excludes metadata from country totals without requesting sessions", () => {
  const f = fixture();
  f.component.created.call(f.state);
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.timeSeries, f.state.externalTimeSeries);
  assert.equal(f.state.offset, 2);
  assert.equal(f.state.days, 1);
  assert.equal(f.state.total_sessions_map, 10);
  assert.equal(f.state.total_sessions_keys, 10);
  assert.deepEqual(
    Array.from(f.state.top_countries, (pair) => Array.from(pair)),
    [
      ["US", 8],
      ["CA", 2],
    ],
  );
  f.state.custom_selected_day = 1;
  assert.equal(f.state.getCountrySessions("US"), 1);
  assert.equal(f.state.getCountrySessions("CA"), 0);
  assert.equal(f.state.total_sessions_map, 10);
  assert.equal(f.state.mobile, 5);
  f.state.service_countries = true;
  assert.equal(f.state.getCountrySessions("US"), 8);
  f.component.beforeUnmount.call(f.state);
});

test("audience playback includes both boundaries and external updates stop it and clear inspection", () => {
  const f = fixture();
  f.component.created.call(f.state);
  f.state.service_countries = true;
  f.component.watch.play.call(f.state, true);
  assert.equal(f.state.service_countries, false);
  f.tick();
  assert.equal(f.state.custom_selected_day, 0);
  f.tick();
  assert.equal(f.state.custom_selected_day, 1);
  f.tick();
  assert.equal(f.state.custom_selected_day, 0);
  f.state.selectCountry("US");
  assert.equal(f.state.selected_country, "US");
  const next = series();
  next.days = 0;
  f.component.watch.externalTimeSeries.call(f.state, next);
  assert.equal(f.state.play, false);
  assert.equal(f.state.custom_selected_day, -1);
  assert.equal(f.state.selected_country, null);
  f.tick();
  assert.equal(f.state.custom_selected_day, -1);
  assert.equal(f.requests.length, 0);
});

test("audience remains opt-in and renders native geography, country controls, trends and polar-area devices", async () => {
  const f = fixture();
  assert.equal(f.component.props.audience.name, "Boolean");
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: "BSessionsMap.vue",
    id: "audience-test",
  });
  assert.deepEqual(template.errors, []);
  const exports = {};
  vm.runInNewContext(transpile(template.code), { exports, require: f.require });
  const stub = {
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("div", attrs, [
          slots.activator?.({ props: {} }),
          slots.default?.({ country: "US" }),
        ]),
  };
  const components = Object.fromEntries(
    Object.keys(f.component.components).map((name) => [name, stub]),
  );
  components.BSessionDevicesPie = {
    props: ["type", "desktop", "mobile", "tablet"],
    setup: (props) => () =>
      Vue.h("div", {
        "data-device-chart": props.type,
        "data-total": props.desktop + props.mobile + props.tablet,
      }),
  };
  for (const audience of [true, false]) {
    const app = Vue.createSSRApp(
      {
        ...f.component,
        components,
        created() {},
        data: () => ({ ...f.component.data(), timeSeries: series() }),
        render: exports.render,
      },
      {
        modern: true,
        audience,
        fullDetails: true,
        externalFeed: true,
        shop: { countries: ["US"] },
      },
    );
    app.config.globalProperties.$vuetify = f.state.$vuetify;
    app.config.globalProperties.$t = (key) => key;
    app.mixin({
      methods: {
        numeralFormat: String,
        getCountryName: (code) =>
          ({ US: "United States", CA: "Canada" })[code] || code,
        getLocalDateString: () => "Fixture date",
      },
    });
    for (const name of [
      "v-icon",
      "v-btn",
      "v-tooltip",
      "v-slider",
      "v-progress-linear",
      "v-col",
      "v-table",
      "v-row",
      "v-list-subheader",
      "v-card-title",
      "v-card-text",
      "v-spacer",
      "v-card-actions",
      "v-card",
      "v-dialog",
      "flag",
    ])
      app.component(name, stub);
    const document = new JSDOM(await renderToString(app)).window.document;
    assert.equal(
      !!document.querySelector(".b-sessions-map--audience"),
      audience,
    );
    assert.ok(document.querySelector(".b-sessions-map__world"));
    assert.ok(document.querySelector(".b-sessions-map__playback"));
    assert.equal(
      document
        .querySelector("[data-device-chart]")
        .getAttribute("data-device-chart"),
      "polarArea",
    );
    assert.equal(
      document.querySelectorAll(".b-sessions-map__device-trend").length,
      3,
    );
    if (audience) {
      assert.equal(
        document.querySelectorAll("button.b-sessions-map__country").length,
        2,
      );
      assert.equal(
        document
          .querySelector(".b-sessions-map__country-code")
          .textContent.trim(),
        "US",
      );
      assert.ok(document.querySelector(".b-sessions-map__selection"));
      assert.equal(
        document.querySelector(".b-sessions-map__report-controls"),
        null,
      );
    } else
      assert.equal(
        document.querySelectorAll("button.b-sessions-map__country").length,
        0,
      );
  }
  for (const block of descriptor.styles) {
    const style = await compileStyleAsync({
      source: block.content,
      filename: "BSessionsMap.vue",
      id: "audience-test",
      scoped: block.scoped,
      preprocessLang: block.lang,
    });
    assert.deepEqual(style.errors, []);
  }
});
