import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

function source(name) {
  const filename = new URL(name, import.meta.url).pathname;
  const { descriptor, errors } = parse(readFileSync(new URL(name, import.meta.url), "utf8"), { filename });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: name });
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: name, compilerOptions: { bindingMetadata: script.bindings } }).errors, []);
  return ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
}

const flowExports = {};
vm.runInNewContext(source("BProductFlow.vue"), {
  exports: flowExports,
  require: name => name.endsWith(".svg") ? name : { default: {}, ProductType: {}, BusinessModel: {}, SubscriptionMode: {} },
});
const flowSteps = flowExports.default.computed.flowSteps;
function steps(overrides = {}) {
  return flowSteps.call({
    $product: { type: "PHYSICAL", icon: "product.png" },
    $t: key => key, getShopImagePath: value => `/images/${value}`,
    getProductTypeImage: value => `/types/${value}.svg`,
    isMarketplace: false, has_valuation: false, isService: false, isSubscription: false,
    ribbon_link_type: null, connect: null, ...overrides,
  });
}
const ids = values => Array.from(values, step => step.id);
assert.deepEqual(ids(steps()), ["purchase", "cart", "pricing", "incentives", "tax", "checkout", "payment", "fulfillment"]);
assert.deepEqual(ids(steps({ isService: true })).slice(-3), ["confirmation", "payment", "fulfillment"]);
assert.deepEqual(ids(steps({ isMarketplace: true, has_valuation: true })).slice(0, 5), ["purchase", "cart", "vendor", "pricing", "valuation"]);
const linked = steps({ isSubscription: true, ribbon_link_type: { image: "physical.svg" }, connect: { name: "Channel", icon: "channel.png" } });
assert.deepEqual(ids(linked).slice(-3), ["recurring", "linked", "connect"]);
assert.equal(linked.at(-1).backward, true);
assert.equal(linked.at(-1).title, "Channel");
assert.equal(linked.at(-2).image, "physical.svg");
assert.equal(steps({ $product: { type: "FILE" } })[1].image, undefined);
assert.ok(steps().every(step => step.help === `b_product_dashboard.flow.help.${step.id}`));

function options(name) {
  const exports = {};
  vm.runInNewContext(source(name), { exports, require: () => ({ defineComponent: value => value, ProductType: {} }) });
  return exports.default;
}
const tax = options("row/tax/BProductFlowRowTax.vue").computed.taxEnabled;
assert.equal(tax.call({ isSubscription: false, current_tax_profile: { enable: false }, $shop: { tax: { enable: true } } }), false);
assert.equal(tax.call({ isSubscription: false, current_tax_profile: null, $shop: { tax: { enable: true } } }), true);
assert.equal(tax.call({ isSubscription: false, current_tax_profile: null, $shop: {} }), undefined);
assert.equal(tax.call({ isSubscription: true, current_tax_profile: null, $shop: { tax: { enable: true } } }), undefined);
const location = options("errors/location/BProductFlowErrorsLocation.vue").computed.subtitle;
assert.equal(location.call({ no_location_error: false, invalid_location_error: true, $t: key => key }), "product_flow.location_errors.invalid_location_error_subtitle");
assert.equal(location.call({ no_location_error: true, invalid_location_error: false, $t: key => key }), "product_flow.location_errors.no_location_error_subtitle");

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(name, callback) { listeners.set(name, callback); },
    removeEventListener(name, callback) { if (listeners.get(name) === callback) listeners.delete(name); },
  };
}

function diagramFixture({ delayedImport = false, count = 8, width = 960 } = {}) {
  const mounted = [], unmounting = [], frames = new Map(), lines = [], svgs = new Map(), observers = [];
  let frameId = 0, resolveImport, state;
  const settings = { width, visible: true, filter: "none" };
  const rtl = Vue.ref(false), theme = Vue.ref({ name: "light" });
  const props = Vue.reactive({ steps: Array.from({ length: count }, (_, index) => ({ id: `step-${index}`, title: `Step ${index}`, help: "Help", backward: index === count - 1 })) });
  const rect = () => ({ top: 40, bottom: 600, left: 20, right: 20 + settings.width, width: settings.width });
  const boundary = { parentElement: null, getBoundingClientRect: rect };
  const nodes = props.steps.map((step, index) => Vue.markRaw({
    getBoundingClientRect() {
      const node = state.nodes.value[index], count = state.columns.value;
      const column = rtl.value ? count - 1 - node.column : node.column;
      const width = (settings.width - (count - 1) * 20) / count;
      return { top: 40 + node.row * 128, bottom: 132 + node.row * 128, left: 20 + column * (width + 20), right: 20 + column * (width + 20) + width };
    },
  }));
  const root = Vue.markRaw({
    parentElement: boundary,
    getClientRects: () => settings.visible ? [rect()] : [],
    getBoundingClientRect: rect,
    querySelectorAll: () => nodes,
    closest: selector => selector === ".s--card-window-content" ? boundary : null,
  });
  const document = { ...eventTarget(), documentElement: { clientWidth: 1200 }, scrollingElement: {}, getElementById: id => svgs.get(id) };
  const window = { ...eventTarget(), innerHeight: 800, scrollX: 0, scrollY: 0 };
  class ResizeObserver {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  class MutationObserver extends ResizeObserver {}
  class Line {
    constructor(from, to, options) {
      Object.assign(this, { from, to, options, removed: false, positions: 0 });
      this.svg = { style: {}, setAttribute() {}, getBoundingClientRect: () => ({ top: 0, right: 1200, bottom: 800, left: 0 }) };
      svgs.set(options.lineId, this.svg);
      lines.push(this);
    }
    setOptions(options) { Object.assign(this.options, options); }
    position() { this.positions++; }
    remove() { this.removed = true; svgs.delete(this.options.lineId); }
  }
  const module = delayedImport ? new Promise(resolve => { resolveImport = resolve; }) : { __esModule: true, default: Line };
  const exports = {};
  vm.runInNewContext(source("BProductFlowDiagram.vue"), {
    exports, document, window, ResizeObserver, MutationObserver,
    getComputedStyle: element => ({ color: "rgb(64, 64, 64)", filter: element === boundary ? settings.filter : "none", overflowX: "visible", overflowY: "visible" }),
    requestAnimationFrame: callback => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    console: { warn: error => { throw new Error(error); } },
    require: name => {
      if (name === "vue") return { ...Vue, useId: () => "product", onMounted: callback => mounted.push(callback), onBeforeUnmount: callback => unmounting.push(callback) };
      if (name === "vuetify") return { useLocale: () => ({ isRtl: rtl }), useTheme: () => ({ current: theme }) };
      if (name === "vue3-leaderline") return module;
      throw new Error(name);
    },
  });
  const scope = Vue.effectScope();
  state = scope.run(() => exports.default.setup(props, { expose() {} }));
  state.diagram.value = root;
  return {
    state, settings, props, rtl, lines, frames, observers, document, window,
    mount: () => mounted[0](),
    unmount() { unmounting.forEach(callback => callback()); scope.stop(); },
    resolveImport() { resolveImport({ __esModule: true, default: Line }); },
    async flush() {
      for (let i = 0; i < 5; i++) {
        await Vue.nextTick();
        const callbacks = [...frames.values()]; frames.clear();
        callbacks.forEach(callback => callback());
      }
    },
  };
}

const f = diagramFixture();
await f.mount(); await f.flush();
assert.equal(f.state.columns.value, 8);
assert.deepEqual(Array.from(f.state.nodes.value, node => node.column), [0, 1, 2, 3, 4, 5, 6, 7]);
assert.equal(f.lines.length, 7);
assert.equal(f.lines.at(-1).options.startPlug, "arrow1");
assert.equal(f.lines[0].options.startSocket, "right");
f.settings.width = 800; f.state.schedulePosition(); await f.flush();
assert.equal(f.state.columns.value, 4);
assert.deepEqual(Array.from(f.state.nodes.value, node => node.column), [0, 1, 2, 3, 3, 2, 1, 0]);
assert.equal(f.lines[3].options.startSocket, "bottom");
assert.equal(f.lines[3].options.endSocket, "top");

f.settings.width = 240; f.state.schedulePosition(); await f.flush();
assert.equal(f.state.columns.value, 2);
assert.deepEqual(Array.from(f.state.nodes.value, node => node.column), [0, 1, 1, 0, 0, 1, 1, 0]);
f.settings.width = 180; f.state.schedulePosition(); await f.flush();
assert.equal(f.state.columns.value, 1);
assert.ok(f.lines.every(line => line.options.startSocket === "bottom" && line.options.endSocket === "top"));

f.settings.width = 240; f.rtl.value = true; await f.flush();
const active = f.lines.filter(line => !line.removed);
assert.equal(active[0].options.startSocket, "left");
assert.equal(active[0].options.endSocket, "right");
f.settings.filter = "invert(1)"; f.state.schedulePosition(); await f.flush();
assert.equal(active[0].svg.style.filter, "invert(1)");
assert.match(active[0].svg.style.clipPath, /^inset\(/);
f.settings.visible = false; f.state.schedulePosition(); await f.flush();
assert.ok(active.every(line => line.svg.style.visibility === "hidden"));
f.unmount();
assert.ok(f.lines.every(line => line.removed));
assert.ok(f.observers.every(observer => observer.disconnected));
assert.equal(f.document.listeners.size, 0);
assert.equal(f.window.listeners.size, 0);
assert.equal(f.frames.size, 0);

for (const [count, width, lengths] of [[10, 360, [3, 3, 2, 2]], [13, 700, [5, 4, 4]], [5, 360, [3, 2]], [0, 960, []]]) {
  const balanced = diagramFixture({ count, width });
  await balanced.mount(); await balanced.flush();
  const nodes = Array.from(balanced.state.nodes.value);
  assert.deepEqual(Array.from(balanced.state.rowLengths.value), lengths);
  assert.deepEqual(nodes.map(node => node.id), Array.from({ length: count }, (_, index) => `step-${index}`));
  assert.equal(balanced.lines.length, Math.max(0, count - 1));
  for (let index = 1; index < nodes.length; index++) {
    const previous = nodes[index - 1], current = nodes[index];
    if (current.row !== previous.row) assert.equal(current.column, previous.column);
    else assert.equal(Math.abs(current.column - previous.column), 1);
  }
  balanced.unmount();
}

const delayed = diagramFixture({ delayedImport: true });
const mounting = delayed.mount();
delayed.unmount(); delayed.resolveImport(); await mounting; await delayed.flush();
assert.equal(delayed.lines.length, 0);
assert.equal(delayed.frames.size, 0);
console.log("Product flow: native step branches, responsive sockets, RTL, Smart invert and lifecycle checks passed.");
