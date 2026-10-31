import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { parse, compileTemplate, compileStyleAsync } = require("@vue/compiler-sfc");
const ts = require("typescript");
const filename = new URL("./BDomainConnectionFlow.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture({ secure = false, domain = "store.example.test", image = null } = {}) {
  const exports = {}, observations = [];
  let disconnected = false;
  class ResizeObserver {
    constructor(callback) { this.callback = callback; }
    observe(canvas) { observations.push(canvas); }
    disconnect() { disconnected = true; }
  }
  new Function("exports", "ResizeObserver", compiled)(exports, ResizeObserver);
  const component = exports.default;
  const state = {
    ...component.data(), ...component.methods, secure, domain, image,
    $t: key => key, $refs: {}, $nextTick: fn => fn?.call(state),
  };
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  }
  return { component, state, observations, disconnected: () => disconnected };
}

function canvasFor(state, positions, width, height) {
  return {
    clientWidth: width, clientHeight: height,
    getBoundingClientRect: () => ({ left: 30, top: 50, width, height }),
    querySelectorAll: () => state.nodes.map((node, index) => ({
      dataset: { node: node.id },
      getBoundingClientRect: () => ({ left: 30 + positions[index][0], top: 50 + positions[index][1], width: 128, height: 104 }),
    })),
  };
}

test("direct and secure connection retain their actual node order and explanatory help", () => {
  const direct = fixture().state;
  assert.deepEqual(direct.nodes.map(node => node.id), ["domain", "cdn", "store"]);
  assert.equal(direct.nodes[0].caption, "store.example.test");
  assert.equal(direct.nodes[0].icon, "language");
  assert.equal(direct.nodes[1].help, "domains_modern.connection.flowDirectHelp");
  const secure = fixture({ secure: true, image: "/test-shop.svg" }).state;
  assert.deepEqual(secure.nodes.map(node => node.id), ["domain", "optional", "cdn", "store"]);
  assert.equal(secure.nodes[0].image, "/test-shop.svg");
  assert.equal(secure.nodes[1].optional, true);
  assert.equal(secure.nodes[1].help, "domains_modern.connection.flowOptionalHelp");
  assert.equal(secure.nodes[2].help, "domains_modern.connection.flowSecureHelp");
  assert.equal(secure.nodes[3].title, "Selldone");
});

test("narrow layouts retain logical order through a two-column turn or vertical stack", () => {
  const { state } = fixture({ secure: true });
  state.availableWidth = 700;
  assert.equal(state.columns, 4);
  state.availableWidth = 400;
  assert.equal(state.columns, 2);
  assert.deepEqual(state.nodes.map((_, index) => state.nodePlacement(index)), [
    { gridRow: 1, gridColumn: 1 }, { gridRow: 1, gridColumn: 2 },
    { gridRow: 2, gridColumn: 2 }, { gridRow: 2, gridColumn: 1 },
  ]);
  state.availableWidth = 240;
  assert.equal(state.columns, 1);
  assert.deepEqual(state.nodePlacement(3), { gridRow: 4, gridColumn: 1 });
});

test("measured curves follow horizontal, RTL and responsive turns inside the canvas", () => {
  for (const [secure, positions, width, height] of [
    [false, [[12,12],[184,12],[356,12]], 496, 128],
    [false, [[356,12],[184,12],[12,12]], 496, 128],
    [true, [[12,12],[184,12],[184,160],[12,160]], 324, 276],
    [false, [[12,12],[12,160],[12,308]], 152, 424],
  ]) {
    const { state } = fixture({ secure });
    state.$refs.canvas = canvasFor(state, positions, width, height);
    state.measure();
    assert.equal(state.canvasWidth, width);
    assert.equal(state.canvasHeight, height);
    assert.equal(state.edges.length, state.nodes.length - 1);
    assert.deepEqual(state.edges.map(edge => edge.key), state.nodes.slice(0,-1).map((node,index) => `${node.id}-${state.nodes[index+1].id}`));
    for (const edge of state.edges) {
      assert.ok(edge.path.includes(" C"), "smooth curve path");
      const coordinates = (edge.path + " " + edge.head).match(/-?\d+(?:\.\d+)?/g).map(Number);
      coordinates.forEach((value,index) => assert.ok(value >= 0 && value <= (index % 2 ? height : width), edge.key + " stays inside its measured stage"));
    }
  }
});

test("resize observation is scoped to the diagram and released on unmount", () => {
  const f = fixture();
  f.state.$refs.canvas = canvasFor(f.state, [[12,12],[184,12],[356,12]], 496, 128);
  f.component.mounted.call(f.state);
  assert.deepEqual(f.observations, [f.state.$refs.canvas]);
  f.component.beforeUnmount.call(f.state);
  assert.equal(f.disconnected(), true);
  f.state.$refs.canvas = null;
  assert.doesNotThrow(() => f.state.measure());
  assert.doesNotThrow(() => f.state.drawEdges());
});

test("Vue template and scoped Sass compile without a production build", async () => {
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "domain-connection-flow" });
  assert.deepEqual(template.errors, []);
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: filename.pathname, id: "domain-connection-flow", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(style.errors, []);
});
