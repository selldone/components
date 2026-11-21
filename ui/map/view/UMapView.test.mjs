import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import { isProxy, reactive, markRaw } from "vue";

const file = new URL("./UMapView.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
assert.deepEqual(
  compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "map-view",
  }).errors,
  [],
);
const { outputText } = ts.transpileModule(descriptor.script.content, {
  compilerOptions: {
    esModuleInterop: false,
    ignoreDeprecations: "6.0",
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

// Drive the real component lifecycle with synthetic dimensions and a local Mapbox stub.
function fixture({ center = null, savedPosition = null, noMap = false } = {}) {
  let timer, observer;
  const created = [];
  class Map {
    constructor(options) {
      this.options = options;
      this.resizeCount = 0;
      this.removed = false;
      created.push(this);
    }
    on() {}
    resize() { this.resizeCount++; }
    remove() { this.removed = true; }
    flyTo(camera) { this.camera = camera; }
  }
  class ResizeObserver {
    constructor(notify) { this.notify = notify; }
    observe(container) { observer = this; this.container = container; }
    disconnect() { this.disconnected = true; }
  }
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    ResizeObserver,
    setTimeout(callback, delay) { timer = { callback, delay }; return timer; },
    clearTimeout(handle) { if (handle) handle.cancelled = true; },
    require(path) {
      if (path === "vue") return { markRaw };
      if (path.endsWith("/MapBox")) return { default: { Map } };
      if (path.endsWith("/SetupService")) {
        return { SetupService: { MapStyle: () => "https://example.test/style", DefaultCountry: () => null } };
      }
      return {};
    },
  });
  const component = exports.default;
  const container = markRaw({ clientWidth: 0, clientHeight: 0 });
  const view = reactive({
    ...component.data(),
    center,
    last_selected_position: savedPosition,
    zoom: 17,
    noMap,
    delayLoad: 1000,
    hideLocationButtons: true,
    initializeMap: component.methods.initializeMap,
  });
  // Vue template refs hold the actual element outside reactive data.
  view.$refs = markRaw({ mapCanvas: container });
  component.mounted.call(view);
  return {
    view,
    created,
    get observer() { return observer; },
    get timer() { return timer; },
    runTimer() { if (timer && !timer.cancelled) timer.callback(); },
    size(width, height) {
      container.clientWidth = width;
      container.clientHeight = height;
      observer.notify();
    },
    updateCenter(value) { component.watch.center.call(view, value); },
    unmount() { component.beforeUnmount.call(view); },
  };
}

test("a new checkout address waits for a visible map and opens at overview zoom", () => {
  const f = fixture();
  assert.equal(f.timer.delay, 1000);
  f.runTimer();
  f.size(0, 0);
  assert.equal(f.created.length, 0);
  f.size(400, 500);
  assert.equal(f.created.length, 1);
  const map = f.created[0];
  assert.equal(map.options.container, f.observer.container);
  assert.equal(map.options.zoom, 2);
  assert.equal(isProxy(f.view.map_box), false);
  f.size(440, 540);
  assert.equal(map.resizeCount, 1);
  f.updateCenter(null);
  assert.equal(map.camera, undefined);
  f.updateCenter({ lng: "36.82", lat: "-1.28" });
  assert.deepEqual(JSON.parse(JSON.stringify(map.camera)), { center: [36.82, -1.28], zoom: 17 });
  f.unmount();
  assert.equal(f.observer.disconnected, true);
  assert.equal(map.removed, true);
});

test("valid saved coordinates keep street zoom, including zero coordinates", () => {
  const f = fixture({ center: { lng: "", lat: 0 }, savedPosition: { lng: 0, lat: 0 } });
  f.runTimer();
  f.size(500, 400);
  assert.equal(f.created[0].options.zoom, 17);
  assert.deepEqual(Array.from(f.created[0].options.center), [0, 0]);
  f.unmount();
});

test("closing the dialog before its delay or using manual-address mode creates no map", () => {
  const closing = fixture();
  closing.unmount();
  closing.runTimer();
  assert.equal(closing.observer, undefined);
  assert.equal(closing.created.length, 0);

  const manual = fixture({ noMap: true });
  assert.equal(manual.timer, undefined);
  assert.equal(manual.created.length, 0);
});
