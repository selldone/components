import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import { JSDOM } from "jsdom";
import ts from "typescript";

const file = new URL("./UChartFunnel.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "funnel-zero-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "funnel-zero-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
for (const block of descriptor.styles) {
  const style = await compileStyleAsync({
    source: block.content,
    filename: file.pathname,
    id: "funnel-zero-test",
    scoped: block.scoped,
    preprocessLang: "scss",
  });
  assert.deepEqual(style.errors, []);
}

// Run the native graph/core geometry without a browser; render the actual SFC lifecycle.
let constructions = 0;
const coreModules = new Map();
function loadCore(name) {
  if (coreModules.has(name)) return coreModules.get(name);
  const exports = {};
  coreModules.set(name, exports);
  vm.runInNewContext(ts.transpileModule(
    readFileSync(new URL(`./core/js/${name}.js`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } },
  ).outputText, { exports, Array, require: (path) => loadCore(path.replace(/^\.\//, "").replace(/\.js$/, "")) });
  return exports;
}
const NativeGraph = loadCore("main").default;
const geometry = loadCore("path");
class Graph extends NativeGraph {
  constructor(options) { super(options); constructions += 1; }
}
function evaluate(source, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      ...globals,
      require: (name) => {
        if (name === "vue") return Vue;
        if (name.endsWith("/main")) return { default: Graph };
        if (name.endsWith("/path.js")) return geometry;
        if (name.endsWith("/graph.js"))
          return {
            getDefaultColors: () => ["#1976d2"],
            generateLegendBackground: () => ({}),
          };
        if (name === "numeral")
          return { default: (value) => ({ format: () => String(value) }) };
        return { default: {} };
      },
    },
  );
  return exports;
}
const component = evaluate(descriptor.script.content).default;
const render = evaluate(template.code).render;
const labels = ["Add to cart", "Checkout", "Payment", "Orders"];
async function fixture(values, modern = true, direction = "horizontal", options = {}) {
  let context;
  const app = Vue.createSSRApp({ render: () => Vue.h(
    {
      ...component,
      render(...args) {
        context = this;
        return render.apply(this, args);
      },
    },
    {
      values,
      labels,
      modern,
      direction,
      width: 640,
      height: 180,
      noHoverDetails: true,
      noLegend: true,
      displayPercentage: false,
      ...options.props,
    },
    options.slots,
  ) });
  app.config.globalProperties.$vuetify = { locale: { isRtl: options.rtl || false } };
  app.component("u-price", { render: () => Vue.h("span") });
  const html = await renderToString(app);
  return { context, document: new JSDOM(html).window.document, html };
}

test("modern observed-zero funnel keeps all native stages without fake flow paths", async () => {
  for (const direction of ["horizontal", "vertical"]) {
    constructions = 0;
    const { document, context } = await fixture(
      labels.map(() => [0, 0]),
      true,
      direction,
    );
    assert.equal(constructions, 0);
    assert.equal(document.querySelectorAll("svg, path").length, 0);
    const empty = document.querySelector(".u--chart-funnel-empty");
    assert.equal(empty.style.minHeight, "180px");
    assert.equal(empty.getAttribute("role"), "group");
    assert.deepEqual(
      [...document.querySelectorAll(".u--chart-funnel-empty__stage")].map(
        (stage) => [...stage.children].map((child) => child.textContent),
      ),
      labels.map((label) => ["0", label]),
    );
    assert.equal(context.graph, null);
  }
});

test("unknown data is not a recorded zero, and legacy all-zero behavior remains", async () => {
  for (const values of [[], [[], []], [[null], [0]], [[NaN], [0]]]) {
    const { document } = await fixture(values);
    assert.equal(document.querySelector(".u--chart-funnel-empty"), null);
    assert.ok(document.body.textContent.includes("No Data!"));
  }
  constructions = 0;
  const legacy = await fixture(
    labels.map(() => [0]),
    false,
  );
  assert.equal(constructions, 1);
  assert.equal(legacy.document.querySelector(".u--chart-funnel-empty"), null);
  assert.ok(legacy.document.body.textContent.includes("No Data!"));
});

test("zero to positive to zero uses native graph only for actual flow and stops old animation", async () => {
  const positive = await fixture([[4], [2], [1], [1]]);
  assert.equal(positive.document.querySelector(".u--chart-funnel-empty"), null);
  assert.equal(positive.document.querySelectorAll("svg path").length, 1);
  assert.deepEqual(
    [...positive.document.querySelectorAll(".--label-value")].map(
      (node) => node.textContent,
    ),
    ["4", "2", "1", "1"],
  );
  const { context } = await fixture(labels.map(() => [0]));
  // Use the actual watcher/methods against a mutable component state, without DOM timers.
  const state = {
    ...component.data(),
    modern: true,
    animated: false,
    values: [[0]],
    labels,
    width: 640,
    height: 180,
    direction: "horizontal",
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, computed] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => computed.call(state) });
  constructions = 0;
  component.created.call(state);
  assert.equal(state.graph, null);
  component.watch.direction.call(state);
  state.values = [[4], [2], [1], [1]];
  component.watch.values.call(state);
  assert.equal(constructions, 1);
  assert.equal(state.paths.length, 1);
  assert.deepEqual(state.graph.values, state.values);
  let stopped = 0;
  state.tween = { stop: () => stopped++ };
  state.values = labels.map(() => [0]);
  component.watch.values.call(state);
  assert.equal(stopped, 1);
  assert.equal(state.graph, null);
  assert.equal(state.paths.length, 0);
  assert.equal(state.prevPaths.length, 0);
  assert.equal(context.has_zero_data, true);
});

function nativeFlow(values, width = 320, height = 160) {
  return new NativeGraph({ data: { values }, width, height });
}
function identities(graph, rtl = false) {
  return geometry.getFunnelIdentityPositions(graph.getMainAxisPoints(), graph.getCrossAxisPoints(), {
    width: graph.width, height: graph.height, rtl,
  });
}
function pathPolygon(path) {
  const tokens = path.match(/[MCLZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi);
  const points = [];
  let current;
  for (let i = 0; i < tokens.length;) {
    const command = tokens[i++];
    if (command === "M" || command === "L") {
      current = [Number(tokens[i++]), Number(tokens[i++])];
      points.push(current);
    } else if (command === "C") {
      const start = current;
      const control1 = [Number(tokens[i++]), Number(tokens[i++])];
      const control2 = [Number(tokens[i++]), Number(tokens[i++])];
      const end = [Number(tokens[i++]), Number(tokens[i++])];
      for (let step = 1; step <= 50; step++) {
        const t = step / 50;
        points.push([0, 1].map((axis) =>
          (1 - t) ** 3 * start[axis] + 3 * (1 - t) ** 2 * t * control1[axis] +
          3 * (1 - t) * t ** 2 * control2[axis] + t ** 3 * end[axis],
        ));
      }
      current = end;
    }
  }
  return points;
}
function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

test("series identities fit the broadest usable native band, omitting zero/thin and too narrow flows", () => {
  const constant = identities(nativeFlow([[80, 20, 0], [80, 20, 0]], 240, 120));
  assert.equal(constant.length, 1);
  assert.equal(constant[0].index, 0);
  assert.equal(constant[0].x, 120);
  assert.equal(constant[0].y, 48);
  assert.equal(constant[0].size, 20);
  const changing = identities(nativeFlow([[90, 10], [1, 10], [1, 10]], 300, 120));
  assert.ok(changing.find((point) => point.index === 0).x < 50, "a fading series belongs near its actual broad region");
  assert.equal(identities(nativeFlow([[80, 20], [80, 20]], 20, 120)).length, 0);
  assert.equal(identities(nativeFlow([[0, 0], [0, 0]])).length, 0);
});

test("every identity and its inset remain inside the actual curved SVG path, without overlap in LTR or RTL", () => {
  for (const width of [64, 160, 320, 960]) {
    for (const values of [
      [[80, 20], [1, 20], [40, 60]],
      [[1, 40, 2], [90, 5, 1], [1, 40, 80]],
      [[0, 80, 20], [20, 0, 80], [80, 20, 0], [10, 40, 80]],
    ]) {
      const graph = nativeFlow(values, width, 160);
      const polygons = graph.getPathDefinitions().map(pathPolygon);
      const ltr = identities(graph);
      const rtl = identities(graph, true);
      assert.deepEqual(Array.from(rtl, (point) => ({ ...point, x: width - point.x })), Array.from(ltr, (point) => ({ ...point })));
      for (const point of ltr) {
        const half = point.size / 2 + 3;
        for (const x of [point.x - half, point.x, point.x + half]) {
          for (const y of [point.y - half, point.y, point.y + half]) {
            assert.ok(pointInPolygon(x, y, polygons[point.index]), `identity ${point.index} escapes its native band at ${x},${y}`);
          }
        }
        for (const other of ltr.filter((other) => other.index !== point.index)) {
          assert.ok(Math.abs(point.x - other.x) >= 24 || Math.abs(point.y - other.y) >= 24);
        }
      }
    }
  }
});

test("the optional slot is decorative, RTL-aware and leaves native date focus targets unchanged", async () => {
  const values = [[60, 40], [60, 40], [60, 40], [60, 40]];
  const legacy = await fixture(values);
  assert.equal(legacy.document.querySelectorAll('.u-chart-funnel__identity').length, 0);
  const { document, context } = await fixture(values, true, "horizontal", {
    props: { subLabels: ["A", "B"] }, rtl: true,
    slots: { 'series-identity': ({ index, label, size }) => Vue.h('img', { 'data-index': index, alt: label, width: size, height: size }) },
  });
  assert.equal(document.querySelectorAll('.u-chart-funnel__identity').length, 2);
  assert.equal(document.querySelector('.u-chart-funnel__identities').getAttribute('aria-hidden'), 'true');
  assert.equal(document.querySelectorAll('.--segment-container[tabindex="0"]').length, labels.length);
  assert.deepEqual([...document.querySelectorAll('.u-chart-funnel__identity img')].map((node) => [node.alt, node.width]), [["A", 20], ["B", 20]]);
  assert.equal(component.computed.seriesIdentities.call({ $slots: context.$slots, graph: context.graph, is_horizontal: true, animating: true }).length, 0, "identities wait until path motion finishes");
  const vertical = await fixture(values, true, 'vertical', { slots: { 'series-identity': () => Vue.h('img') } });
  assert.equal(vertical.document.querySelectorAll('.u-chart-funnel__identity').length, 0);
});

test("opt-in identities recompute native geometry on resize and respect reduced motion without changing defaults", () => {
  const values = [[60, 40], [60, 40]];
  let stops = 0;
  const state = { $slots: { 'series-identity': () => {} }, width: 180, height: 100, graph: nativeFlow(values), tween: { stop: () => stops++ }, animating: true, drawPaths() {} };
  component.watch.width.call(state);
  component.watch.height.call(state);
  assert.equal(state.graph.width, 180);
  assert.equal(state.graph.height, 100);
  assert.equal(state.animating, false);
  assert.equal(stops, 2);
  assert.ok(identities(state.graph).every((point) => point.x <= 180 && point.y <= 100));
  component.beforeUnmount.call(state);
  assert.equal(stops, 3);
  const reduced = evaluate(descriptor.script.content, { window: { matchMedia: () => ({ matches: true }) } }).default;
  let animated = 0;
  Object.assign(state, { values, modern: true, animated: true, has_valid_data: true, makeAnimations: () => animated++ });
  reduced.methods.syncGraph.call(state);
  assert.equal(animated, 0);
  state.$slots = {};
  reduced.methods.syncGraph.call(state);
  assert.equal(animated, 1, 'existing callers retain their animation contract');
});

test("modern currency hover uses native amounts and original series indices after zero filtering", async () => {
  const file = new URL('./hover/UChartFunnelHover.vue', import.meta.url);
  const { descriptor } = parse(readFileSync(file, 'utf8'));
  const script = compileScript(descriptor, { id: 'funnel-hover-native-test' });
  const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: 'funnel-hover-native-test', compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  const hover = evaluate(descriptor.script.content).default;
  const render = evaluate(template.code).render;
  async function renderHover(modern, actualValue) {
    let context;
    let tooltip;
    const app = Vue.createSSRApp({ ...hover, render(...args) { context = this; return render.apply(this, args); }, mixins: [], components: { UCurrencyIcon: { render: () => Vue.h('span') } } }, {
      modern, actualValue, values: [[0, 20, 30]], index: 0, labels: ['USD', 'EUR', 'BTC'],
      filterZeros: true, isCurrency: true, is2d: true, twoDimPercentages: [],
    });
    app.config.globalProperties.GetCurrency = (code) => code;
    app.config.globalProperties.$t = (key) => key;
    app.component('v-tooltip', {
      props: ['modelValue', 'openOnClick', 'openOnFocus', 'activatorProps'],
      setup(props, { emit, slots }) { tooltip = { props, emit }; return () => Vue.h('div', slots.default?.()); },
    });
    app.component('u-price', { props: ['amount', 'currency'], render() { return Vue.h('span', { 'data-currency': this.currency, 'data-amount': this.amount }); } });
    return { document: new JSDOM(await renderToString(app)).window.document, context, tooltip };
  }
  const calls = [];
  const actualValue = (row, series, geometryValue) => { calls.push([row, series, geometryValue]); return [1000, 2, 0.3][series]; };
  const { document: modern, context, tooltip } = await renderHover(true, actualValue);
  assert.deepEqual([...modern.querySelectorAll('[data-currency]')].map((node) => [node.dataset.currency, node.dataset.amount]), [['EUR', '2'], ['BTC', '0.3']]);
  assert.deepEqual(calls, [[0, 1, 20], [0, 2, 30]]);
  assert.equal(tooltip.props.openOnClick, false, 'native click must not toggle closed after focus opens');
  assert.equal(tooltip.props.openOnFocus, true);
  assert.equal(context.tooltip_open, false);
  tooltip.emit('update:modelValue', true); // Native focus/hover opens before the touch click.
  let stopped = 0;
  tooltip.props.activatorProps.onClick({ stopPropagation: () => stopped++ });
  assert.equal(context.tooltip_open, true, 'the first synthesized click is idempotent');
  assert.equal(stopped, 1, 'chart help must not propagate into a surrounding business action');
  tooltip.props.activatorProps.onKeydown({ key: 'ArrowRight' });
  assert.equal(context.tooltip_open, true, 'ordinary chart keys must not dismiss help');
  tooltip.props.activatorProps.onKeydown({ key: 'Escape' });
  assert.equal(context.tooltip_open, false, 'Escape must dismiss even while the pointer remains over the date');
  tooltip.emit('update:modelValue', true);
  tooltip.emit('update:modelValue', false); // Native hover/focus-out also controls dismissal.
  assert.equal(context.tooltip_open, false);
  const { document: legacy } = await renderHover(false, actualValue);
  assert.deepEqual([...legacy.querySelectorAll('[data-amount]')].map((node) => node.dataset.amount), ['20', '30']);
  const { document: missing } = await renderHover(true, () => undefined);
  assert.equal(missing.querySelectorAll('[data-amount]').length, 0, 'missing native data must not become converted money or zero');
  assert.equal(missing.querySelectorAll('[aria-label="global.commons.not_available"]').length, 2);
});
