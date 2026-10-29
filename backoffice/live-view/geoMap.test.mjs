import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import * as Vue from "vue";
import * as d3 from "d3";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

// Real source/state/geometry, isolated HTTP/socket/clock controls; no live traffic.
const file = new URL("./geoMap.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "live-view-test",
});
assert.deepEqual(compiled.errors, []);
const world = JSON.parse(
  readFileSync(new URL("./world-countries.geo.json", import.meta.url), "utf8"),
);
const plain = (value) => JSON.parse(JSON.stringify(value));
const evaluate = (source, globals = {}) => {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, ...globals },
  );
  return exports;
};
const helpers = evaluate(
  readFileSync(new URL("./liveViewData.ts", import.meta.url), "utf8"),
);
const counts = (add = 3, orders = 1) => ({
  add_to_cart: add,
  remove_from_cart: 2,
  product_views: 9,
  purchase_actions: 4,
  orders_placed: orders,
});
function snapshot({
  shop = 7,
  sequence = 100,
  enabled = true,
  channel = "shops.7.analytics.live.1",
  add = 3,
  orders = 1,
} = {}) {
  const locations = [
    { id: "a", lat: 51.5, lon: -0.1, country_code: "GB", active_sessions: 4 },
    { id: "b", lat: 52, lon: 1, country_code: "DE", active_sessions: 3 },
  ];
  const window = (minutes) => ({
    start: "2026-10-27T08:00:00Z",
    end: "2026-10-27T08:04:20Z",
    totals: counts(add * (minutes / 5), orders * (minutes / 5)),
    trend: [
      { at: "2026-10-27T08:00:00Z", ...counts(0, 0) },
      { at: "2026-10-27T08:04:00Z", ...counts(add, orders) },
    ],
    events: [
      "add_to_cart",
      "orders_placed",
      "product_views",
      "remove_from_cart",
      "purchase_actions",
      "add_to_cart",
    ].map((type, index) => ({
      at: "2026-10-27T08:04:00Z",
      type,
      country_code: index % 2 ? "DE" : "GB",
      count: index + 1,
    })),
    locations: locations.map((item) => ({
      ...item,
      add_to_cart: add,
      orders_placed: orders,
    })),
  });
  return {
    shop_id: shop,
    sequence,
    as_of: new Date(
      Date.parse("2026-10-27T08:04:20Z") + sequence,
    ).toISOString(),
    presence_window_seconds: 60,
    active_sessions: 10,
    signed_in_customers: 2,
    mapped_sessions: 7,
    unlocated_sessions: 3,
    other_locations_sessions: 0,
    countries: [
      { country_code: "GB", active_sessions: 4 },
      { country_code: "DE", active_sessions: 3 },
    ],
    locations,
    windows: { 5: window(5), 15: window(15) },
    transport: {
      enabled,
      channel,
      event: ".snapshot",
      auth_endpoint: `/shops/${shop}/live-view/auth`,
      lease_seconds: 40,
      refresh_seconds: 10,
    },
    truncated: false,
  };
}

function environment({
  shop = { id: 7 },
  route = 7,
  apiBase = "/api",
  d3Api = d3,
} = {}) {
  const requests = [],
    pushers = [],
    echoes = [],
    intervals = new Map(),
    timeouts = new Map(),
    frames = new Map();
  let now = Date.parse("2026-10-27T08:04:20Z"),
    serial = 0;
  class Clock extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }
    static now() {
      return now;
    }
  }
  const request = (method, url, body, config) =>
    new Promise((resolve, reject) =>
      requests.push({
        method,
        url,
        body,
        signal: config?.signal,
        resolve: (data) => resolve({ data }),
        reject,
      }),
    );
  const axios = {
    post: (url, body, config) => request("post", url, body, config),
    get: (url, config) => request("get", url, undefined, config),
  };
  class Pusher {
    constructor(key, options) {
      this.key = key;
      this.options = options;
      this.handlers = {};
      this.connection = {
        bind: (name, callback) => {
          this.handlers[name] = callback;
        },
      };
      pushers.push(this);
    }
  }
  class Echo {
    constructor(options) {
      this.options = options;
      this.channels = new Map();
      this.left = [];
      this.disconnected = false;
      echoes.push(this);
    }
    private(name) {
      const channel = {
        subscribed(callback) {
          this.ready = callback;
          return this;
        },
        error(callback) {
          this.failed = callback;
          return this;
        },
        listen(event, callback) {
          this.event = event;
          this.message = callback;
          return this;
        },
      };
      this.channels.set(name, channel);
      return channel;
    }
    leave(name) {
      this.left.push(name);
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  const originalEcho = Object.freeze({
    disconnect: () => assert.fail("Global Echo must remain untouched"),
  });
  const window = {
    API: { GET_SHOP_REALTIME_DATA: (id) => `${apiBase}/shops/${id}/real-time` },
    location: { protocol: "https:" },
    crypto: {
      randomUUID: () =>
        `00000000-0000-4000-8000-${String(++serial).padStart(12, "0")}`,
    },
  };
  Object.defineProperty(window, "Echo", {
    get: () => originalEcho,
    set: () => assert.fail("Global Echo overwritten"),
  });
  const document = { hidden: false };
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name === "d3") return d3Api;
    if (name === "laravel-echo") return { default: Echo };
    if (name === "pusher-js") return { default: Pusher };
    if (name.endsWith("/SetupService"))
      return {
        SetupService: {
          EchoServer: () => "socket.example.test",
          EchoPort: () => "443",
        },
      };
    if (name.endsWith("/country-helper"))
      return {
        getCountryName: (code) =>
          ({ GB: "United Kingdom", DE: "Germany" })[code],
      };
    if (name.endsWith("world-countries.geo.json")) return { default: world };
    if (name.endsWith("liveViewData")) return helpers;
    assert.fail(`Unexpected dependency: ${name}`);
  };
  const globals = {
    require,
    axios,
    window,
    document,
    navigator: { onLine: true },
    AbortController,
    Date: Clock,
    setInterval: (callback, ms) => {
      const id = ++serial;
      intervals.set(id, { callback, ms });
      return id;
    },
    clearInterval: (id) => intervals.delete(id),
    setTimeout: (callback, ms) => {
      const id = ++serial;
      timeouts.set(id, { callback, ms });
      return id;
    },
    clearTimeout: (id) => timeouts.delete(id),
    requestAnimationFrame: (callback) => {
      const id = ++serial;
      frames.set(id, callback);
      return id;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  const component = evaluate(descriptor.script.content, globals).default;
  const state = {
    ...component.data.call({ windowMinutes: 5 }),
    shop,
    $route: { params: { shop_id: route } },
    $i18n: { locale: "en" },
    $t: (key, values = {}) =>
      key + (Object.keys(values).length ? " " + JSON.stringify(values) : ""),
  };
  for (const [key, method] of Object.entries(component.methods))
    state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(state, key, {
      get: () => getter.call(state),
      configurable: true,
    });
  state.runtime.mounted = true;
  return {
    state,
    component,
    globals,
    requests,
    pushers,
    echoes,
    intervals,
    timeouts,
    frames,
    window,
    document,
    advance: (ms) => {
      now += ms;
    },
    tick: () => [...intervals.values()][0].callback(),
  };
}

test("visible watcher coalesces requests, renews at20s and waits for private subscription before Live", async () => {
  const e = environment(),
    s = e.state;
  s.startWatching();
  assert.equal(e.intervals.size, 1);
  assert.equal(e.requests.length, 1);
  assert.equal(e.requests[0].url, "/api/shops/7/live-view/watch");
  assert.equal(e.requests[0].body.watching, true);
  e.advance(10000);
  e.tick();
  assert.equal(e.requests.length, 1);
  e.requests[0].resolve({ snapshot: snapshot() });
  await setImmediate();
  assert.equal(e.pushers.length, 1);
  assert.equal(e.pushers[0].options.forceTLS, true);
  assert.equal(e.echoes[0].options.withoutInterceptors, true);
  assert.equal(s.connection, "connecting");
  e.pushers[0].handlers.state_change({ current: "connected" });
  assert.equal(s.connection, "connecting");
  const channel = e.echoes[0].channels.get(s.runtime.channel);
  channel.ready();
  assert.equal(s.connection, "live");
  e.advance(10000);
  e.tick();
  assert.equal(e.requests.length, 1);
  e.advance(10000);
  e.tick();
  assert.equal(e.requests.length, 2);
  assert.equal(e.requests[1].body.watching, true);
  s.stopWatching();
  assert.equal(e.intervals.size, 0);
  assert.equal(e.echoes[0].disconnected, true);
  assert.equal(e.requests.at(-1).body.watching, false);
});

test("resize notifications coalesce, preserve unchanged zoom and cancel detached work", () => {
  let builds = 0;
  const nextTicks = [],
    selection = {
      call() {
        return this;
      },
      on() {
        return this;
      },
    },
    e = environment({
      d3Api: {
        ...d3,
        select: () => selection,
        zoom: () => {
          builds++;
          const control = {};
          for (const key of ["extent", "translateExtent", "scaleExtent", "on"])
            control[key] = () => control;
          return control;
        },
      },
    }),
    s = e.state,
    frame = () => {
      assert.equal(e.frames.size, 1);
      const [id, callback] = [...e.frames][0];
      e.frames.delete(id);
      callback();
    };
  s.$refs = {
    mapStage: { clientWidth: 800, clientHeight: 350 },
    trendSvg: { clientWidth: 600 },
    mapSvg: {},
  };
  s.$nextTick = (callback) => nextTicks.push(callback);
  s.scheduleResize();
  s.scheduleResize();
  s.scheduleResize();
  assert.equal(nextTicks.length, 0);
  frame();
  nextTicks.shift()();
  const originalZoom = s.runtime.zoom;
  assert.equal(builds, 1); // Initial equal-sized DOM still initializes zoom.
  s.transform = { x: 30, y: 20, k: 2 };
  s.$refs.trendSvg.clientWidth = 450;
  s.scheduleResize();
  s.scheduleResize();
  frame();
  assert.equal(s.trendWidth, 450);
  assert.equal(nextTicks.length, 0);
  assert.equal(s.runtime.zoom, originalZoom);
  assert.deepEqual(plain(s.transform), { x: 30, y: 20, k: 2 });
  s.$refs.mapStage.clientWidth = 640;
  s.scheduleResize();
  frame();
  s.$refs.mapStage.clientWidth = 620;
  s.scheduleResize();
  frame();
  nextTicks.shift()();
  assert.equal(builds, 1); // The superseded layout callback cannot bind zoom.
  nextTicks.shift()();
  assert.equal(builds, 2);
  assert.equal(s.mapWidth, 620);
  s.$refs.mapStage.clientWidth = 580;
  s.scheduleResize();
  frame();
  s.scheduleResize(); // A second observer notification remains queued at unmount.
  e.document.removeEventListener = () => {};
  e.window.removeEventListener = () => {};
  e.component.beforeUnmount.call(s);
  assert.equal(e.frames.size, 0);
  assert.equal(s.runtime.resizeFrame, null);
  nextTicks.shift()();
  assert.equal(builds, 2);
  s.scheduleResize();
  assert.equal(e.frames.size, 0);
});

test("fallback GET and rotated topics preserve server scope and custom native authorization", async () => {
  const e = environment({ apiBase: "/native-api" }),
    s = e.state;
  s.startWatching();
  e.requests[0].resolve({ snapshot: snapshot() });
  await setImmediate();
  assert.equal(e.requests[0].url, "/native-api/shops/7/live-view/watch");
  e.advance(10000);
  e.tick();
  assert.equal(e.requests[1].method, "get");
  e.requests[1].resolve({ snapshot: snapshot() });
  await setImmediate();
  const echo = e.echoes[0],
    oldName = s.runtime.channel,
    old = echo.channels.get(oldName);
  s.receiveSnapshot(snapshot({ channel: "shops.7.analytics.live.2" }));
  assert.ok(echo.left.includes(oldName));
  assert.equal(s.connection, "connecting");
  old.ready();
  assert.equal(s.connection, "connecting");
  const auth = e.pushers[0].options.channelAuthorization.customHandler;
  let denied;
  auth(
    { socketId: "local-test", channelName: "private-" + oldName },
    (error) => {
      denied = !!error;
    },
  );
  assert.equal(denied, true);
  let accepted = false;
  auth(
    { socketId: "local-test", channelName: "private-" + s.runtime.channel },
    (error, data) => {
      accepted = !error && !!data;
    },
  );
  assert.equal(e.requests.at(-1).url, "/native-api/shops/7/live-view/auth");
  assert.equal(
    e.requests.at(-1).body.channel_name,
    "private-shops.7.analytics.live.2",
  );
  e.requests.at(-1).resolve({ auth: "isolated-test-response" });
  await setImmediate();
  assert.equal(accepted, true);
  s.stopWatching();
});

test("pause, hidden page and shop changes abort old work and release only the old viewer", async () => {
  const e = environment(),
    s = e.state;
  s.startWatching();
  const original = e.requests[0];
  s.togglePause();
  assert.equal(s.connection, "paused");
  assert.equal(original.signal.aborted, true);
  assert.equal(e.intervals.size, 0);
  original.resolve({ snapshot: snapshot() });
  await setImmediate();
  assert.equal(s.snapshot, null);
  assert.equal(e.requests.at(-1).body.viewer_id, original.body.viewer_id);
  s.togglePause();
  const current = e.requests.at(-1);
  assert.notEqual(current.body.viewer_id, original.body.viewer_id);
  s.shop = { id: 8 };
  e.component.watch.shopId.call(s);
  const next = e.requests.at(-1);
  assert.equal(current.signal.aborted, true);
  assert.equal(next.url, "/api/shops/8/live-view/watch");
  current.resolve({ snapshot: snapshot() });
  await setImmediate();
  assert.equal(s.snapshot, null);
  next.resolve({ snapshot: snapshot({ shop: 8, enabled: false }) });
  await setImmediate();
  assert.equal(s.snapshot.shop_id, 8);
  assert.equal(s.connection, "snapshot_mode");
  e.document.hidden = true;
  s.onVisibility();
  assert.equal(e.intervals.size, 0);
  assert.equal(e.requests.at(-1).body.watching, false);
  assert.equal(environment({ shop: null, route: 11 }).state.shopId, 11);
});

test("transient errors keep real values; revoked access clears data and stops reads", async () => {
  const e = environment(),
    s = e.state;
  s.startWatching();
  e.requests[0].resolve({ snapshot: snapshot({ enabled: false }) });
  await setImmediate();
  s.refresh();
  e.requests.at(-1).reject({ response: { status: 503 } });
  await setImmediate();
  assert.equal(s.snapshot.active_sessions, 10);
  assert.equal(s.loadError, true);
  s.refresh();
  e.requests.at(-1).reject({ response: { status: 403 } });
  await setImmediate();
  assert.equal(s.snapshot, null);
  assert.equal(s.presenceHistory.length, 0);
  assert.equal(e.intervals.size, 0);
});

test("a healthy current-channel snapshot restores Live after an HTTP refresh failure", async () => {
  const e = environment(),
    s = e.state;
  s.startWatching();
  e.requests[0].resolve({ snapshot: snapshot() });
  await setImmediate();
  const channel = e.echoes[0].channels.get(s.runtime.channel);
  channel.ready();
  assert.equal(s.connection, "live");
  s.refresh();
  e.requests.at(-1).reject({ response: { status: 503 } });
  await setImmediate();
  assert.equal(s.connection, "reconnecting");
  assert.equal(s.runtime.subscribed, true);
  channel.message({ snapshot: snapshot({ sequence: 101 }) });
  assert.equal(s.connection, "live");
  assert.equal(s.loadError, false);
  s.stopWatching();
});

test("real5/15 buckets, zeros, clusters and new-event-only finite pulses remain faithful", () => {
  const e = environment(),
    s = e.state;
  s.runtime.shopId = 7;
  s.receiveSnapshot(snapshot({ enabled: false }));
  assert.equal(s.events.length, 5);
  assert.equal(s.metrics[2].value, 3);
  assert.equal(s.metrics[0].value, 10);
  assert.equal(s.trend.series[0].points[0].label.includes(": 0"), true);
  assert.equal(s.clusters.length, 1);
  s.selectCluster(s.clusters[0]);
  assert.equal(s.selectedCountries.length, 2);
  assert.equal(s.selectedSummary.active_sessions, 7);
  s.selectedMinutes = 15;
  assert.equal(s.metrics[2].value, 9);
  assert.equal(s.metrics[0].value, 10);
  s.selectedMinutes = 5;
  s.receiveSnapshot(snapshot({ enabled: false, sequence: 101 }));
  assert.equal(s.pulses.length, 0);
  s.receiveSnapshot(snapshot({ enabled: false, sequence: 102, orders: 2 }));
  assert.equal(s.pulses.length, 2);
  for (const timeout of e.timeouts.values()) timeout.callback();
  assert.equal(s.pulses.length, 0);
  s.reducedMotion = true;
  s.receiveSnapshot(snapshot({ enabled: false, sequence: 103, add: 5 }));
  assert.equal(s.pulses.length, 0);
  s.receiveSnapshot(snapshot({ shop: 9, sequence: 104 }));
  assert.equal(s.snapshot.shop_id, 7);
});

test("actual template renders placeholders, all map controls and complete aggregate panels", async () => {
  const e = environment(),
    render = evaluate(compiled.code, e.globals).render;
  async function html(value, report = false) {
    const component = {
      ...e.component,
      render,
      data() {
        return {
          ...e.component.data.call(this),
          snapshot: value,
          connection: value ? "snapshot_mode" : "connecting",
        };
      },
    };
    const app = Vue.createSSRApp(component, {
      shop: { id: 7 },
      windowMinutes: 5,
      windowControl: true,
      modern: report,
      report,
    });
    app.config.globalProperties.$t = e.state.$t;
    app.config.globalProperties.$i18n = { locale: "en" };
    for (const name of ["v-btn", "v-icon", "flag"])
      app.component(
        name,
        Vue.defineComponent({
          inheritAttrs: false,
          setup:
            (_, { attrs, slots }) =>
            () =>
              Vue.h(
                name === "v-btn" ? "button" : "span",
                attrs,
                slots.default?.(),
              ),
        }),
      );
    app.directive("tooltip", { getSSRProps: () => ({}) });
    return renderToString(app);
  }
  const initial = await html(null);
  assert.equal((initial.match(/<strong>—<\/strong>/g) || []).length, 4);
  const loaded = await html(snapshot({ enabled: false }));
  const report = await html(snapshot({ enabled: false }), true);
  assert.ok(report.includes("b-live-view--report"));
  assert.ok(report.includes("b-live-view__report-header"));
  assert.equal((report.match(/<select/g) || []).length, 1);
  assert.ok(report.includes('aria-label="geo_map.live.pause"'));
  for (const key of [
    "zoom_in",
    "zoom_out",
    "fit_world",
    "locate",
    "active_sessions",
    "signed_in_customers",
    "add_to_cart",
    "orders_placed",
    "purchase_actions",
    "recent_activity",
    "active_locations",
  ])
    assert.ok(report.includes("geo_map.live." + key));
  for (const key of [
    "active_sessions",
    "signed_in_customers",
    "orders_placed",
    "recent_activity",
    "purchase_actions",
    "trend_title",
    "active_locations",
    "zoom_in",
    "zoom_out",
    "fit_world",
    "locate",
  ])
    assert.ok(loaded.includes("geo_map.live." + key));
  assert.equal((loaded.match(/class="b-live-view__marker/g) || []).length, 2); // layer plus one nearby-location cluster
  assert.ok(loaded.includes('datetime="2026-10-27T08:04:00Z"'));
  assert.ok(loaded.includes('aria-pressed="true"'));
  assert.equal(
    loaded.includes("geo_map.live.sample_data"),
    false,
    "Ordinary snapshots carry no sample label",
  );
  const sample = await html({
    ...snapshot({ enabled: false }),
    simulated: true,
  });
  assert.ok(sample.includes("geo_map.live.sample_data"));
  assert.ok(
    sample.includes("geo_map.live.sample_help"),
    "Generated activity is explicitly identified in the real template",
  );
});

test("responsive SVG geometry retains physical geography at320px, RTL and higher device pixel ratios", () => {
  for (const width of [223, 293, 960]) {
    const e = environment(),
      s = e.state;
    s.snapshot = snapshot({ enabled: false });
    s.mapWidth = width;
    s.mapHeight = width < 400 ? 285 : 350;
    const paths = plain(s.landPaths),
      markers = plain(s.clusters);
    assert.equal(paths.length, 176);
    assert.equal(
      paths.some((path) => /NaN|Infinity/.test(path.d)),
      false,
    );
    for (const marker of markers) {
      assert.ok(marker.x >= 0 && marker.x <= width);
      assert.ok(marker.y >= 0 && marker.y <= s.mapHeight);
    }
    e.window.devicePixelRatio = 2;
    s.$i18n.locale = "fa";
    assert.deepEqual(plain(s.landPaths), paths);
    assert.deepEqual(plain(s.clusters), markers);
    assert.equal(s.format(10), "۱۰");
  }
});

test("unmount removes owned resources and a late callback cannot restore its view", async () => {
  const e = environment(),
    s = e.state,
    removed = [];
  s.startWatching();
  e.requests[0].resolve({ snapshot: snapshot() });
  await setImmediate();
  const channel = e.echoes[0].channels.get(s.runtime.channel);
  s.$refs = { mapSvg: {} };
  s.runtime.observer = { disconnect: () => removed.push("observer") };
  s.runtime.media = { removeEventListener: (name) => removed.push(name) };
  e.document.removeEventListener = (name) => removed.push(name);
  e.window.removeEventListener = (name) => removed.push(name);
  e.component.beforeUnmount.call(s);
  assert.equal(e.intervals.size, 0);
  assert.equal(e.echoes[0].disconnected, true);
  assert.equal(e.requests.at(-1).body.watching, false);
  assert.deepEqual(
    removed.sort(),
    ["change", "observer", "offline", "online", "visibilitychange"].sort(),
  );
  channel.ready();
  channel.message({ snapshot: snapshot({ sequence: 200 }) });
  assert.equal(s.snapshot.sequence, 100);
  assert.equal(s.runtime.subscribed, false);
});
