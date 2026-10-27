const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { parse } = require("@vue/compiler-sfc");
const ts = require("typescript");

const filename = path.join(__dirname, "BusinessModelView.vue");
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  reportDiagnostics: true,
});
assert.ok(!(compiled.diagnostics || []).some(item => item.category === ts.DiagnosticCategory.Error));

function loadComponent({ compact = false, rtl = false } = {}) {
  const exports = {};
  vm.runInNewContext(compiled.outputText, {
    exports,
    getComputedStyle: () => ({
      getPropertyValue: () => compact ? "1" : "0",
      direction: rtl ? "rtl" : "ltr",
    }),
    require(name) {
      if (name === "vue") return { useId: () => "business-model-test" };
      if (name.endsWith("UPodNode.vue")) return {};
      throw new Error(`Unexpected component dependency: ${name}`);
    },
  }, { filename });
  return exports.default;
}

// These are the business relationships, independent of diagram placement.
const relationships = {
  normal: ["customers>shop:payment", "shop>customers:order"],
  wholesaler: ["store-a>shop:payment", "store-b>shop:payment", "shop>customers:order"],
  marketplace: ["customers>shop:payment", "shop>vendor-a:payment", "shop>vendor-b:payment", "vendor-a>customers:order", "vendor-b>customers:order"],
  franchise: ["customers-a>affiliate-a:payment", "customers-b>affiliate-b:payment", "affiliate-a>shop:payment", "affiliate-b>shop:payment", "shop>customers-a:order", "shop>customers-b:order"],
  dropshipping: ["customers>shop:payment", "shop>printful:sync", "shop>doba:sync", "shop>printful:fulfillment", "shop>doba:fulfillment", "printful>customers:order", "doba>customers:order"],
};

function positionedFlow(model, { compact = false, rtl = false } = {}) {
  const component = loadComponent({ compact, rtl });
  const flow = component.computed.modernFlow.call({ businessModel: model });
  const width = compact ? 320 : 480;
  const origin = { left: 37, top: 53 };
  const boxes = new Map();
  for (const [key, column, row] of flow.nodes) {
    let nodeWidth = (width - 64) / 3;
    const nodeHeight = key === "shop" ? 88 : 72;
    let left = (column - 1) * (nodeWidth + 32);
    let top = row.includes("/") ? 120 - nodeHeight / 2 : 18 + (Number(row) - 1) * 116 + (88 - nodeHeight) / 2;
    if (compact) {
      let level = key === "shop" ? 1 : key.startsWith("customers") || key.startsWith("store-") ? 0 : 2;
      if (model === "wholesaler" && key === "customers" || model === "normal" && key === "shop" || model === "franchise" && key === "shop") level = 2;
      if (key.startsWith("affiliate-")) level = 1;
      const centered = key === "shop" || key === "customers";
      nodeWidth = centered ? 82 : (width - 50) / 2;
      left = centered ? (width - nodeWidth) / 2 : 16 + (key.endsWith("-b") || key === "doba" ? nodeWidth + 18 : 0);
      top = level * 112 + (88 - nodeHeight) / 2;
    }
    if (rtl) left = width - left - nodeWidth;
    boxes.set(key, { left, top, right: left + nodeWidth, bottom: top + nodeHeight });
  }
  const height = Math.max(...Array.from(boxes.values(), box => box.bottom)) + 18;
  const canvas = {
    isConnected: true,
    getBoundingClientRect: () => ({ ...origin, width, height }),
    querySelector(selector) {
      const box = boxes.get(selector.match(/="([^"]+)"/)[1]);
      return box ? { getBoundingClientRect: () => ({ left: box.left + origin.left, right: box.right + origin.left, top: box.top + origin.top, bottom: box.bottom + origin.top }) } : null;
    },
  };
  const context = { modern: true, modernFlow: flow, $refs: { modernCanvas: canvas } };
  component.methods.positionModernFlow.call(context);
  return { component, flow, boxes, canvas, context, width, height, paths: context.modernEdgePaths };
}

function endpoints(pathData) {
  let x, y, start;
  for (const command of pathData.match(/[MCHVL][^MCHVL]*/g)) {
    const values = command.slice(1).match(/[-+]?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number);
    if (command[0] === "H") x = values.at(-1);
    else if (command[0] === "V") y = values.at(-1);
    else [x, y] = values.slice(-2);
    if (!start) start = { x, y };
  }
  return { start, end: { x, y } };
}

function touchesNode(point, box) {
  const tolerance = 0.01;
  const vertical = (Math.abs(point.x - box.left) < tolerance || Math.abs(point.x - box.right) < tolerance) && point.y >= box.top - tolerance && point.y <= box.bottom + tolerance;
  const horizontal = (Math.abs(point.y - box.top) < tolerance || Math.abs(point.y - box.bottom) < tolerance) && point.x >= box.left - tolerance && point.x <= box.right + tolerance;
  return vertical || horizontal;
}

test("existing callers retain the legacy default without modern translation lookups", () => {
  const component = loadComponent();
  assert.equal(component.props.modern.default, false);
  const legacy = { modern: false, $t() { throw new Error("Legacy mode requested modern translations"); } };
  assert.equal(component.computed.modernNodes.call(legacy).length, 0);
  assert.equal(component.computed.modernSteps.call(legacy).length, 0);
});

test("all five models preserve their customer, reseller, vendor and supplier relationships", () => {
  for (const [model, expected] of Object.entries(relationships)) {
    const { flow } = positionedFlow(model);
    const edges = Array.from(flow.edges, ([from, to, , kind]) => `${from}>${to}:${kind}`);
    assert.deepEqual(edges.sort(), [...expected].sort(), model);
    const nodes = new Set(Array.from(flow.nodes, node => node[0]));
    for (const [from, to, step] of flow.edges) {
      assert.ok(nodes.has(from) && nodes.has(to), `${model}: relationship has no visible node`);
      assert.ok(step >= 1 && step <= flow.steps.length, `${model}: relationship lacks a numbered explanation`);
    }
  }
});

test("measured arrows touch the correct source and destination in desktop, compact and RTL layouts", () => {
  for (const model of Object.keys(relationships)) {
    for (const compact of [false, true]) for (const rtl of [false, true]) {
      const { paths, flow, boxes, width, height } = positionedFlow(model, { compact, rtl });
      assert.equal(paths.length, flow.edges.length);
      for (const edge of paths) {
        assert.ok(!/NaN|undefined|Infinity/.test(edge.path));
        const definition = flow.edges.find(([from, to, , kind]) => edge.key === `${from}-${to}-${kind}`);
        const points = endpoints(edge.path);
        assert.ok(touchesNode(points.start, boxes.get(definition[0])), `${model}: wrong source`);
        assert.ok(touchesNode(points.end, boxes.get(definition[1])), `${model}: wrong destination`);
        assert.ok(edge.x >= 0 && edge.x <= width && edge.y >= 0 && edge.y <= height, `${model}: marker outside diagram`);
      }
    }
  }
});

test("RTL mirrors compact return lanes and keeps synchronization separate from fulfillment", () => {
  for (const model of Object.keys(relationships)) {
    const ltr = positionedFlow(model, { compact: true });
    const rtl = positionedFlow(model, { compact: true, rtl: true });
    for (const edge of ltr.paths) {
      const mirrored = rtl.paths.find(item => item.key === edge.key);
      assert.ok(Math.abs(edge.x + mirrored.x - ltr.width) < 0.01);
      assert.ok(Math.abs(edge.y - mirrored.y) < 0.01);
    }
  }
  for (const compact of [false, true]) for (const rtl of [false, true]) {
    const { paths } = positionedFlow("dropshipping", { compact, rtl });
    for (const supplier of ["printful", "doba"]) {
      const synchronization = paths.find(edge => edge.key === `shop-${supplier}-sync`);
      const fulfillment = paths.find(edge => edge.key === `shop-${supplier}-fulfillment`);
      const syncPoints = endpoints(synchronization.path), fulfillmentPoints = endpoints(fulfillment.path);
      assert.notEqual(synchronization.path, fulfillment.path);
      assert.notDeepEqual(syncPoints.start, fulfillmentPoints.start);
      assert.notDeepEqual(syncPoints.end, fulfillmentPoints.end);
      assert.equal(synchronization.step, 2);
      assert.equal(fulfillment.step, 3);
    }
  }
});
