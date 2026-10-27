import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { compileScript, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

// Exercise the real lifecycle/watchers; only layout, animation frames and LeaderLine are isolated.
const file = new URL("./BWebhookFlow.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "webhook-flow-test" });
assert.deepEqual(compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "webhook-flow-test",
  compilerOptions: { bindingMetadata: script.bindings },
}).errors, []);
const code = ts.transpileModule(script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function eventTarget() {
  const listeners = new Map();
  return {
    listeners,
    addEventListener(type, callback, options) {
      listeners.set(type, { callback, capture: typeof options === "boolean" ? options : !!options?.capture });
    },
    removeEventListener(type, callback, capture = false) {
      const listener = listeners.get(type);
      if (listener?.callback === callback && listener.capture === capture) listeners.delete(type);
    },
    dispatch(type) { listeners.get(type)?.callback(); },
  };
}

function fixture({ delayedImport = false } = {}) {
  const mounted = [], unmounting = [], lines = [], frames = new Map(), svgs = new Map();
  let frameId = 0, resolveImport, exposed;
  const settings = { mobile: false, visible: true, overlayActive: true };
  const rtl = Vue.ref(false), current = Vue.ref({ name: "light" });
  const bounds = { top: 40, right: 640, bottom: 240, left: 40 };
  const overlayContent = eventTarget();
  const overlay = { classList: { contains: () => settings.overlayActive } };
  const parentElement = {};
  const root = Vue.markRaw({
    parentElement,
    getClientRects: () => settings.visible ? [bounds] : [],
    getBoundingClientRect: () => bounds,
    closest: (selector) => selector === ".v-overlay" ? overlay : selector === ".v-overlay__content" ? overlayContent : null,
  });
  const nodes = [Vue.markRaw({ name: "event" }), Vue.markRaw({ name: "request" }), Vue.markRaw({ name: "endpoint" })];
  const document = { ...eventTarget(), documentElement: { clientWidth: 1000 }, getElementById: (id) => svgs.get(id) };
  const window = { ...eventTarget(), innerHeight: 800, scrollX: 3, scrollY: 9, matchMedia: () => ({ matches: settings.mobile }) };
  class Line {
    constructor(start, end, options) {
      this.start = start;
      this.end = end;
      this.options = options;
      this.positions = 0;
      this.removed = 0;
      this.svg = { style: {}, setAttribute() {}, getBoundingClientRect: () => ({ top: 20, right: 660, bottom: 260, left: 20 }) };
      svgs.set(options.lineId, this.svg);
      lines.push(this);
    }
    setOptions(options) { Object.assign(this.options, options); }
    position() { this.positions++; }
    remove() { this.removed++; svgs.delete(this.options.lineId); }
  }
  let observer;
  class ResizeObserver {
    constructor(callback) { this.callback = callback; this.elements = []; this.disconnected = false; observer = this; }
    observe(element) { this.elements.push(element); }
    disconnect() { this.disconnected = true; }
  }
  const importResult = delayedImport ? new Promise(resolve => { resolveImport = resolve; }) : { default: Line };
  const exports = {};
  vm.runInNewContext(code, {
    exports, document, window, ResizeObserver,
    getComputedStyle: (element) => element === overlay ? { zIndex: "2400" } : { color: "rgb(32, 36, 40)" },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
    console: { warn: (...args) => { throw new Error(args.join(" ")); } },
    require: (name) => {
      if (name === "vue") return { ...Vue, useId: () => "flow", onMounted: callback => mounted.push(callback), onBeforeUnmount: callback => unmounting.push(callback) };
      if (name === "vuetify") return { useLocale: () => ({ isRtl: rtl }), useTheme: () => ({ current }) };
      if (name === "vue3-leaderline") return importResult;
      return { default: {} };
    },
  });
  const props = Vue.reactive({ eventCode: "Inventory", url: "https://example.com/hooks/inventory", active: true });
  const scope = Vue.effectScope();
  const state = scope.run(() => exports.default.setup(props, { expose: value => { exposed = value; } }));
  [state.root.value, state.eventNode.value, state.requestNode.value, state.endpointNode.value] = [root, ...nodes];
  return {
    props, settings, rtl, current, nodes, lines, frames, document, window, overlayContent,
    mount: () => mounted[0](),
    unmount() { unmounting.forEach(callback => callback()); scope.stop(); },
    resolveImport: () => resolveImport({ default: Line }),
    observer: () => observer,
    reposition: () => exposed.reposition(),
    flush() { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); },
  };
}

const tick = async () => { await Vue.nextTick(); await Vue.nextTick(); };
const flow = fixture();
await flow.mount();
assert.equal(flow.lines.length, 2);
assert.deepEqual(flow.lines.map(line => [line.start.name, line.end.name]), [["event", "request"], ["request", "endpoint"]]);
assert.equal(flow.observer().elements.length, 2);
assert.equal(flow.frames.size, 1);
flow.flush();
assert.ok(flow.lines.every(line => line.positions === 1 && line.svg.style.visibility === "visible"));
assert.ok(flow.lines.every(line => line.options.startSocket === "right" && line.options.endSocket === "left"));
assert.ok(flow.lines.every(line => line.svg.style.zIndex === "2401" && line.svg.style.clipPath === "inset(20px 20px 20px 20px)"));

flow.document.dispatch("scroll");
flow.window.dispatch("resize");
flow.observer().callback();
flow.overlayContent.dispatch("transitionend");
assert.equal(flow.frames.size, 1, "layout events share one animation frame");
flow.flush();
assert.ok(flow.lines.every(line => line.positions === 2));

flow.rtl.value = true;
flow.props.url = "https://example.com/hooks/orders";
flow.props.eventCode = "OnlineOrder";
await tick();
flow.flush();
assert.equal(flow.lines.length, 2, "editing inputs repositions the existing connectors");
assert.ok(flow.lines.every(line => line.options.startSocket === "left" && line.options.endSocket === "right"));
flow.settings.mobile = true;
flow.window.dispatch("resize");
flow.flush();
assert.ok(flow.lines.every(line => line.options.startSocket === "bottom" && line.options.endSocket === "top"));

flow.props.active = false;
assert.ok(flow.lines.every(line => line.svg.style.visibility === "hidden"), "closing hides body-level SVGs synchronously");
flow.props.active = true;
await tick();
flow.flush();
assert.ok(flow.lines.every(line => line.svg.style.visibility === "visible"));
flow.settings.overlayActive = false;
flow.reposition();
flow.flush();
assert.ok(flow.lines.every(line => line.svg.style.visibility === "hidden"));
flow.reposition();
flow.unmount();
assert.equal(flow.frames.size, 0);
assert.ok(flow.observer().disconnected);
assert.ok(flow.lines.every(line => line.removed === 1));
assert.equal(flow.document.listeners.size + flow.window.listeners.size + flow.overlayContent.listeners.size, 0);

const pending = fixture({ delayedImport: true });
const mounting = pending.mount();
pending.unmount();
pending.resolveImport();
await mounting;
assert.equal(pending.lines.length, 0, "late module completion cannot create orphaned connectors");
assert.equal(pending.frames.size, 0);
assert.ok(pending.observer().disconnected);
assert.equal(pending.document.listeners.size + pending.window.listeners.size + pending.overlayContent.listeners.size, 0);

console.log("PASS webhook flow: node pairs, layout scheduling, RTL/mobile sockets, visibility and asynchronous cleanup.");
