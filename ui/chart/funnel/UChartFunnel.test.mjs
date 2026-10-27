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

// The graph boundary is isolated; all rendering/lifecycle decisions are the real SFC.
let constructions = 0;
class Graph {
  constructor({ data }) {
    constructions += 1;
    this.values = data.values;
  }
  is2d() {
    return true;
  }
  getValues2d() {
    return this.values.map((row) => row.reduce((sum, value) => sum + value, 0));
  }
  getPathDefinitions() {
    return ["M0,0L10,10"];
  }
  setValues(values) {
    this.values = values;
  }
  setDirection() {
    return this;
  }
  setWidth() {
    return this;
  }
  setHeight() {
    return this;
  }
}
function evaluate(source) {
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
      require: (name) => {
        if (name === "vue") return Vue;
        if (name.endsWith("/main")) return { default: Graph };
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
async function fixture(values, modern = true, direction = "horizontal") {
  let context;
  const app = Vue.createSSRApp(
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
    },
  );
  app.config.globalProperties.$vuetify = { locale: { isRtl: false } };
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
