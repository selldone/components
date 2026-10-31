import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { compileScript, compileStyle, compileTemplate, parse } from "@vue/compiler-sfc";
import { JSDOM } from "jsdom";

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("./dropshippingWorkflowRoutes.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports });
const { dropshippingWorkflowRoutes } = exports;
const steps = ["setup", "access", "products", "payment", "settlement", "delivery"];
const expectedEdges = {
  setup: ["a-store", "b-store"], access: ["store-a", "store-b"],
  products: ["a-store", "b-store"], payment: ["customer-store"],
  settlement: ["store-wallet", "wallet-a", "wallet-b"], delivery: ["a-customer", "b-customer"],
};

function fixture(width, compact, rtl, tall) {
  const box = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height });
  let nodes, height;
  if (compact) {
    const column = (width - 64) / 2;
    const first = tall ? 120 : 82, middle = tall ? 126 : 94, last = tall ? 136 : 82;
    const storeTop = 24 + first + 48, lastTop = storeTop + middle + 48;
    const storeWidth = Math.min(190, width - 40);
    nodes = {
      a: box(20, 24, column, first), b: box(44 + column, 24, column, first),
      store: box((width - storeWidth) / 2, storeTop, storeWidth, middle),
      customer: box(20, lastTop, column, last), wallet: box(44 + column, lastTop, column, last),
    };
    height = lastTop + last + 32;
  } else {
    const column = (width - 176) / 3.1, row = tall ? 130 : 82, middle = tall ? 144 : 106;
    const storeLeft = 24 + column + 64, lastLeft = storeLeft + column * 1.1 + 64;
    nodes = {
      a: box(24, 32, column, row), b: box(24, 56 + row, column, row),
      store: box(storeLeft, 32 + (row * 2 + 24 - middle) / 2, column * 1.1, middle),
      customer: box(lastLeft, 32, column, row), wallet: box(lastLeft, 56 + row, column, row),
    };
    height = 96 + row * 2;
  }
  if (rtl) for (const box of Object.values(nodes)) [box.left, box.right] = [width - box.right, width - box.left];
  return { width, height, nodes, compact, rtl };
}

function samplePath(path) {
  const tokens = path.match(/[MLQ]|-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g);
  const points = [];
  let position = { x: 0, y: 0 }, index = 0;
  const point = () => ({ x: Number(tokens[index++]), y: Number(tokens[index++]) });
  while (index < tokens.length) {
    const command = tokens[index++];
    if (command === "M") { position = point(); points.push(position); continue; }
    const start = position, control = command === "Q" ? point() : null, end = point();
    for (let tick = 1; tick <= 60; tick++) {
      const t = tick / 60;
      points.push(control ? {
        x: (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x,
        y: (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y,
      } : { x: start.x + (end.x - start.x) * t, y: start.y + (end.y - start.y) * t });
    }
    position = end;
  }
  return points;
}

function onBoundary(point, box) {
  const close = (a, b) => Math.abs(a - b) < .001;
  return (close(point.x, box.left) || close(point.x, box.right)) && point.y >= box.top && point.y <= box.bottom ||
    (close(point.y, box.top) || close(point.y, box.bottom)) && point.x >= box.left && point.x <= box.right;
}

test("each workflow uses continuous rounded lanes clear of every node at real narrow/desktop widths", () => {
  for (const [width, compact] of [[280, true], [360, true], [620, true], [621, false], [744, false], [1040, false]]) {
    for (const rtl of [false, true]) for (const tall of [false, true]) for (const step of steps) {
      const layout = fixture(width, compact, rtl, tall);
      const routes = dropshippingWorkflowRoutes(layout, step);
      assert.equal(JSON.stringify(routes.map((route) => `${route.from}-${route.to}`)), JSON.stringify(expectedEdges[step]));
      for (const route of routes) {
        const description = `${width}/${compact ? "stacked" : "row"}/${rtl ? "rtl" : "ltr"}/${step}/${route.from}-${route.to}`;
        assert(onBoundary(route.points[0], layout.nodes[route.from]), `${description}: source port`);
        assert(onBoundary(route.points.at(-1), layout.nodes[route.to]), `${description}: arrow target port`);
        assert.equal((route.d.match(/M /g) || []).length, 1, `${description}: one continuous path`);
        for (let i = 1; i < route.points.length; i++)
          assert(route.points[i].x === route.points[i - 1].x || route.points[i].y === route.points[i - 1].y, `${description}: orthogonal lane`);
        for (const point of samplePath(route.d)) {
          assert(point.x >= -.001 && point.x <= width + .001 && point.y >= -.001 && point.y <= layout.height + .001, `${description}: inside stage`);
          for (const [key, box] of Object.entries(layout.nodes))
            assert(!(point.x > box.left + .001 && point.x < box.right - .001 && point.y > box.top + .001 && point.y < box.bottom - .001), `${description}: crosses ${key}`);
        }
      }
    }
  }
});

test("RTL routes mirror the logical flow and retain the same source/arrow order", () => {
  for (const compact of [false, true]) for (const step of steps) {
    const ltr = dropshippingWorkflowRoutes(fixture(744, compact, false, true), step);
    const rtl = dropshippingWorkflowRoutes(fixture(744, compact, true, true), step);
    ltr.forEach((route, index) => route.points.forEach((point, port) => {
      assert(Math.abs(rtl[index].points[port].x - (744 - point.x)) < .001);
      assert.equal(rtl[index].points[port].y, point.y);
    }));
  }
});

test("the workflow SFC compiles script, native controls, SVG and scoped stylesheet", () => {
  const filename = new URL("./BProductAddDropshippingWorkflow.vue", import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "dropshipping-workflow" });
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "dropshipping-workflow", compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  const style = compileStyle({ source: descriptor.styles[0].content, filename: filename.pathname, id: "data-v-dropshipping-workflow", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(style.errors, []);
});

test("each changed stage explicitly starts finite packets, while reduced motion and lifecycle stay static", async () => {
  const dom = new JSDOM("<div id='app'></div>", { pretendToBeVisual: true });
  const { window } = dom;
  Object.assign(globalThis, { window, document: window.document, Element: window.Element, HTMLElement: window.HTMLElement, SVGElement: window.SVGElement });
  const Vue = await import("vue");
  const layout = fixture(744, false, false, false);
  let hidden = false, reduce = false, disconnected = false;
  const mediaListeners = new Set(), timers = [], starts = [];
  Object.defineProperty(window.document, "hidden", { configurable: true, get: () => hidden });
  window.matchMedia = () => ({ get matches() { return reduce; }, addEventListener: (_, fn) => mediaListeners.add(fn), removeEventListener: (_, fn) => mediaListeners.delete(fn) });
  window.SVGElement.prototype.beginElement = function () { starts.push({ element: this, visibility: this.parentElement.parentElement.style.visibility }); };
  Object.defineProperty(window.HTMLElement.prototype, "clientWidth", { configurable: true, get: () => layout.width });
  window.HTMLElement.prototype.getBoundingClientRect = function () {
    const node = layout.nodes[this.dataset.node];
    return node ? { ...node, width: node.right - node.left, height: node.bottom - node.top } : { left: 0, top: 0, right: layout.width, bottom: layout.height, width: layout.width, height: layout.height };
  };
  const filename = new URL("./BProductAddDropshippingWorkflow.vue", import.meta.url);
  const { descriptor } = parse(readFileSync(filename, "utf8"));
  const script = compileScript(descriptor, { id: "workflow-runtime" });
  const compiled = {};
  vm.runInNewContext(ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: compiled, require: (name) => name === "vue" ? Vue : exports,
    window, document: window.document, getComputedStyle: window.getComputedStyle,
    ResizeObserver: class { observe() {} disconnect() { disconnected = true; } },
    requestAnimationFrame: () => 1, cancelAnimationFrame() {},
    setTimeout(callback, delay) { const timer = { callback, delay, cleared: false }; timers.push(timer); return timer; },
    clearTimeout(timer) { if (timer) timer.cleared = true; },
  });
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "workflow-runtime", compilerOptions: { bindingMetadata: script.bindings } });
  const rendered = {};
  vm.runInNewContext(ts.transpileModule(template.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: rendered, require: () => Vue });
  const app = Vue.createApp({ ...compiled.default, render: rendered.render });
  app.config.globalProperties.$t = (key) => key;
  app.component("v-icon", { setup: (_, { slots }) => () => Vue.h("span", slots.default?.()) });
  const flush = async () => { for (let tick = 0; tick < 7; tick++) await Vue.nextTick(); };
  app.mount(window.document.querySelector("#app"));
  await flush();
  const stage = window.document.querySelector(".b-dropshipping-workflow__stage");
  assert.equal(stage.getAttribute("aria-hidden"), "true");
  assert.equal(stage.querySelectorAll("button,a,input,select,textarea,[tabindex]").length, 0);
  assert.equal(starts.length, 2);
  assert(starts.every((start) => start.visibility === "hidden"));
  assert(starts.every((start) => start.element.getAttribute("begin") === "indefinite"));
  const buttons = window.document.querySelectorAll("button");
  buttons[4].click();
  await flush();
  assert.equal(starts.length, 5, "new settlement packets begin on the already-running SVG clock");
  assert.equal(buttons[4].getAttribute("aria-pressed"), "true");
  buttons[4].click();
  await flush();
  assert.equal(starts.length, 5, "the same selection does not replay");
  assert.equal(timers.filter((timer) => !timer.cleared).length, 1);
  assert(timers.every((timer) => timer.delay === 2400));
  timers.at(-1).callback();
  await flush();
  assert.equal(stage.querySelectorAll("animateMotion").length, 0, "the complete static routes remain after 2.4 seconds");
  assert.equal(stage.querySelectorAll(".b-dropshipping-workflow__connections > path").length, 3);
  reduce = true;
  mediaListeners.forEach((listener) => listener());
  buttons[5].click();
  await flush();
  assert.equal(starts.length, 5);
  assert.equal(stage.querySelectorAll(".b-dropshipping-workflow__connections > path").length, 2);
  reduce = false;
  mediaListeners.forEach((listener) => listener());
  buttons[0].click();
  await flush();
  assert.equal(starts.length, 7);
  hidden = true;
  window.document.dispatchEvent(new window.Event("visibilitychange"));
  await flush();
  assert.equal(stage.querySelectorAll("animateMotion").length, 0);
  hidden = false;
  window.document.dispatchEvent(new window.Event("visibilitychange"));
  await flush();
  assert.equal(starts.length, 7, "returning to the page does not replay");
  app.unmount();
  assert(disconnected);
  assert.equal(mediaListeners.size, 0);
  assert(timers.every((timer) => timer.cleared));
  dom.window.close();
});
