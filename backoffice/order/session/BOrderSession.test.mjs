import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Run the real component with synthetic saved sessions; no network or geolocation.
const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
function evaluate(source, require, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, require, ...globals },
  );
  return exports;
}

const deviceTypes = ["desktop", "mobile", "tablet"].map((code) => ({
  code,
  title: `fixture.${code}`,
  icon: `fixture-${code}`,
  color: "#888",
}));
const browser = {
  getImageByCode: (code) => (code ? "/fixture/browser.svg" : null),
};
const passthrough = {
  render() {
    return Vue.h("div", this.$slots.default?.());
  },
};
const map = {
  props: [
    "center",
    "markerPosition",
    "modelValue",
    "zoom",
    "pinIcon",
    "showUserLocation",
  ],
  render() {
    return Vue.h("div", { class: "fixture-map" });
  },
};
const { descriptor, errors } = parse(read("./BOrderSession.vue"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: "BOrderSession.vue",
  id: "session-test",
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const compiled = await compileStyleAsync({
    source: style.content,
    filename: "BOrderSession.vue",
    id: "session-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(compiled.errors, []);
}
const component = evaluate(descriptor.script.content, (name) => {
  if (name === "@selldone/core-js")
    return { Analytics: { DeviceType: deviceTypes } };
  if (name.includes("Browser.ts")) return { default: browser };
  if (name.includes("UMapView.vue")) return { default: map };
  return {
    default: {
      render() {
        return Vue.h("div", this.$slots.actions?.());
      },
    },
  };
}).default;
component.render = evaluate(template.code, () => Vue).render;
const componentNames = [
  ...template.code.matchAll(/resolveComponent\("([^"]+)"/g),
].map((match) => match[1]);
const copied = [];
function configure(app) {
  app.config.globalProperties.$t = (key, values) =>
    values?.code ? `${key} ${values.code}` : key;
  app.mixin({ methods: { copyToClipboard: (value) => copied.push(value) } });
  for (const name of componentNames) {
    if (!["u-map-view", "s-widget-box"].includes(name))
      app.component(name, passthrough);
  }
  return app;
}
const fixture = {
  os: "Fixture OS",
  browser: "Firefox",
  device: "PC",
  type: "desktop",
  ip: "192.0.2.24",
  country: "Fixture country",
  country_code: "US",
  lat: 0,
  lon: 0,
};

// A tiny Vue host exercises actual option watchers and prop updates without a browser.
const renderer = Vue.createRenderer({
  createElement: (tag) => ({ tag, children: [], props: {} }),
  createText: (text) => ({ text }),
  createComment: (text) => ({ text }),
  setText: (node, text) => {
    node.text = text;
  },
  setElementText: (node, text) => {
    node.text = text;
    node.children = [];
  },
  patchProp: (node, key, old, value) => {
    node.props[key] = value;
  },
  parentNode: (node) => node.parent,
  nextSibling: (node) => {
    const siblings = node.parent?.children || [];
    return siblings[siblings.indexOf(node) + 1] || null;
  },
  insert(node, parent, anchor) {
    if (node.parent)
      node.parent.children.splice(node.parent.children.indexOf(node), 1);
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    node.parent = parent;
  },
  remove(node) {
    if (node.parent)
      node.parent.children.splice(node.parent.children.indexOf(node), 1);
  },
});
const props = Vue.reactive({
  session: { ...fixture },
  modern: true,
  orderCode: "FIX-1",
});
let instance;
const app = configure(
  renderer.createApp({
    render: () =>
      Vue.h(component, {
        ...props,
        ref: (value) => {
          instance = value;
        },
      }),
  }),
);
app.mount({ children: [] });
assert.equal(component.props.modern.default, false);
assert.equal(instance.hasSession, true);
assert.deepEqual(plain(instance.coordinates), { lat: 0, lng: 0 });
assert.deepEqual(plain(instance.location_info), {
  location: { lat: 0, lng: 0 },
});
assert.deepEqual(
  plain(instance.sessionDetails),
  Object.fromEntries(
    Object.entries(fixture).filter(([key]) => !["lat", "lon"].includes(key)),
  ),
);
assert.equal(instance.countryCode, "us");
assert.equal(instance.deviceIcon, "desktop_windows");
instance.copyIp();
assert.equal(copied.at(-1), fixture.ip);

async function change(session) {
  props.session = session;
  await Vue.nextTick();
}
for (const type of [undefined, null, "", "unclassified", 7, {}]) {
  await change({ ...fixture, type });
  assert.equal(instance.deviceType, undefined);
  assert.equal(instance.deviceIcon, "devices_other");
}
for (const [type, icon] of [
  ["MOBILE", "smartphone"],
  ["tablet", "tablet_mac"],
]) {
  await change({ ...fixture, type });
  assert.equal(instance.deviceIcon, icon);
}
for (const [lat, lon] of [
  ["0", "0"],
  ["-33.1", "151.2"],
  [-90, 180],
  [90, -180],
]) {
  await change({ ...fixture, lat, lon });
  assert.deepEqual(plain(instance.coordinates), {
    lat: Number(lat),
    lng: Number(lon),
  });
  assert.deepEqual(
    plain(instance.location_info.location),
    plain(instance.coordinates),
  );
}
for (const value of [
  undefined,
  null,
  "",
  " ",
  false,
  true,
  {},
  [],
  NaN,
  Infinity,
  -Infinity,
  "not a coordinate",
]) {
  for (const field of ["lat", "lon"]) {
    await change({ ...fixture, [field]: value });
    assert.equal(
      instance.coordinates,
      null,
      `${field} rejects absent/invalid coordinates`,
    );
    assert.equal(instance.location_info.location, null);
  }
}
for (const [lat, lon] of [
  [91, 0],
  [-91, 0],
  [0, 181],
  [0, -181],
]) {
  await change({ ...fixture, lat, lon });
  assert.equal(instance.coordinates, null);
}
const ipv6 = "2001:db8:1234:5678:90ab:cdef:1234:5678";
await change({ ip: ipv6, browser: 12, country_code: "not-a-country" });
assert.equal(instance.hasSession, true);
assert.equal(instance.sessionDetails.browser, "");
assert.equal(instance.countryCode, "");
instance.copyIp();
assert.equal(copied.at(-1), ipv6, "copy keeps the full current IPv6 address");
for (const session of [
  undefined,
  null,
  {},
  { ip: " ", lat: null, lon: null },
]) {
  const count = copied.length;
  await change(session);
  assert.equal(instance.hasSession, false);
  assert.equal(instance.coordinates, null);
  assert.equal(
    instance.location_info.location,
    null,
    "previous map point is cleared",
  );
  instance.copyIp();
  assert.equal(copied.length, count);
}
app.unmount();

async function html(session, modern = true) {
  return renderToString(
    configure(
      Vue.createSSRApp(component, { session, modern, orderCode: "FIX-1" }),
    ),
  );
}
const complete = await html(fixture);
for (const value of [
  fixture.os,
  fixture.browser,
  fixture.device,
  fixture.ip,
  fixture.country,
  "FIX-1",
])
  assert.ok(complete.includes(value), `${value} is visible`);
assert.ok(complete.includes("fixture-map"));
assert.ok(complete.includes("b_order_session.modern.estimate"));
for (const session of [null, {}, { ip: "" }]) {
  const empty = await html(session);
  assert.ok(empty.includes("b_order_session.modern.session_unavailable"));
  assert.ok(!empty.includes("fixture-map"));
}
const sparse = await html({ ip: ipv6 });
assert.ok(sparse.includes(ipv6));
assert.ok(sparse.includes("b_order_session.modern.not_recorded"));
assert.ok(sparse.includes("b_order_session.modern.location_unavailable"));
assert.ok(!sparse.includes("fixture-map"));
const hostile = "<script>fixtureUnsafe()</script>";
const escaped = await html({
  ...fixture,
  os: hostile,
  ip: hostile,
  country: hostile,
});
assert.ok(!escaped.includes(hostile));
assert.ok(escaped.includes("&lt;script&gt;fixtureUnsafe()&lt;/script&gt;"));
const legacy = await html(fixture, false);
assert.ok(!legacy.includes("b-order-session-modern"));
assert.ok(legacy.includes(fixture.ip));
assert.ok(legacy.includes("fixture-map"));

// The native marker must retain valid zero coordinates and numeric-string callers.
const markerPositions = [];
class Marker {
  setOffset() {
    return this;
  }
  setLngLat(value) {
    markerPositions.push(value);
    return this;
  }
  addTo() {
    return this;
  }
}
const mapDescriptor = parse(
  read("../../../ui/map/view/UMapView.vue"),
).descriptor;
const nativeMap = evaluate(
  mapDescriptor.script.content,
  (name) => {
    if (name === "vue")
      return { createApp: () => ({ use() {}, mount() {} }), h: () => ({}) };
    if (name.endsWith("/MapBox")) return { default: { Marker } };
    if (name.endsWith("components-mandetory"))
      return { installGlobalComponents() {} };
    return { default: {} };
  },
  { document: { createElement: () => ({}) }, window: { $global_vuetify: {} } },
).default;
for (const position of [
  { lat: 0, lng: 10 },
  { lat: 10, lng: 0 },
  { lat: 0, lng: 0 },
  { lat: "0", lng: "0" },
]) {
  const current_markers = [];
  nativeMap.methods.addCurrentToDestinationList.call(
    {
      noMap: false,
      current_markers,
      map_box: {},
      geti18n: () => ({}),
    },
    position,
  );
  assert.equal(current_markers.length, 1);
  assert.deepEqual(plain(markerPositions.at(-1)), [position.lng, position.lat]);
}
for (const position of [
  null,
  {},
  { lat: null, lng: 0 },
  { lat: 0, lng: "" },
  { lat: 0, lng: " " },
  { lat: false, lng: 0 },
  { lat: 0, lng: true },
  { lat: [], lng: 0 },
  { lat: NaN, lng: 0 },
  { lat: 0, lng: Infinity },
]) {
  const before = markerPositions.length;
  nativeMap.methods.addCurrentToDestinationList.call(
    {
      noMap: false,
      current_markers: [],
      map_box: {},
    },
    position,
  );
  assert.equal(markerPositions.length, before);
}

const en = evaluate(read("../../../../translate/dashboard/en.ts"), () => ({}))
  .default.b_order_session.modern;
const fa = evaluate(read("../../../../translate/dashboard/fa.ts"), () => ({}))
  .default.b_order_session.modern;
assert.deepEqual(Object.keys(en).sort(), Object.keys(fa).sort());
for (const key of [
  ...descriptor.template.content.matchAll(
    /b_order_session\.modern\.([a-z_]+)/g,
  ),
].map((match) => match[1])) {
  assert.ok(en[key], `English ${key}`);
  assert.ok(fa[key], `Persian ${key}`);
}
console.log(
  "Order session behavior checks passed: fields, empty/sparse data, coordinate boundaries, updates, copy, escaping, legacy, native zero marker and EN/FA.",
);
