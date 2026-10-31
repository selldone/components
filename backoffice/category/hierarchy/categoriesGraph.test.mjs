import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";
import { JSDOM } from "jsdom";
import { select } from "d3-selection";
import renderSankey from "../../../ui/chart/sankey/svg/sankey.js";

const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const helperExports = {};
vm.runInNewContext(
  transpile(
    readFileSync(new URL("./category-hierarchy.ts", import.meta.url), "utf8"),
  ),
  { exports: helperExports },
);
const {
  buildCategoryHierarchy,
  categoryMetric,
  categoryPath,
  escapeCategoryText,
} = helperExports;
const graphSource = readFileSync(
  new URL("./categoriesGraph.vue", import.meta.url),
  "utf8",
);
const graphExports = {};
vm.runInNewContext(transpile(parse(graphSource).descriptor.script.content), {
  exports: graphExports,
  require: (name) =>
    name === "./category-hierarchy"
      ? helperExports
      : name === "d3-selection"
        ? { select }
        : { default: {} },
});

function fixture(categories) {
  const component = graphExports.default;
  const events = [];
  const state = {
    ...component.data(),
    categories,
    canEdit: false,
    $emit: (...args) => events.push(args),
    $refs: {},
    $t: (key) => key.split(".").at(-1),
    $n: (value) => new Intl.NumberFormat("en").format(value),
    getShopImagePath: (icon, size) => `/fixture/${icon}?size=${size}`,
    $: { uid: 1 },
  };
  Object.entries(component.methods).forEach(([name, method]) => {
    state[name] = method.bind(state);
  });
  Object.entries(component.computed).forEach(([name, getter]) => {
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  });
  return { state, component, events };
}

test("IDs keep duplicate names and Home distinct; legacy title parents and missing parents remain readable", () => {
  const categories = [
    { id: 1, title: "Home" },
    { id: 2, title: "Same" },
    { id: 3, title: "Same", parent: { id: 1, title: "Home" } },
    { id: 4, title: "Child", parent: { id: 3, title: "Same" } },
    { title: "Legacy", parent: { title: "Child" } },
    { id: 6, title: "Orphan", parent: { id: 99, title: "Missing" } },
  ];
  const original = JSON.stringify(categories);
  const hierarchy = buildCategoryHierarchy(categories, "Store home");
  assert.equal(hierarchy.nodes.length, categories.length);
  assert.equal(hierarchy.byKey.get("category-3").parentKey, "category-1");
  assert.equal(hierarchy.byKey.get("category-4").parentKey, "category-3");
  assert.equal(hierarchy.nodes[4].parentKey, "category-4");
  assert.equal(hierarchy.byKey.get("category-6").parentKey, "home");
  assert.equal(
    categoryPath(hierarchy.nodes[4], hierarchy.byKey)
      .map((node) => node.title)
      .join("/"),
    "Store home/Home/Same/Child/Legacy",
  );
  assert.equal(JSON.stringify(categories), original);
  assert.equal(buildCategoryHierarchy(categories, "خانه").root.title, "خانه");
});

test("invalid cycles cannot trap chart or mobile traversal; dense columns receive readable natural height", () => {
  const cycle = buildCategoryHierarchy(
    [
      { id: 1, title: "A", parent: { id: 2 } },
      { id: 2, title: "B", parent: { id: 1 } },
      { id: 3, title: "Self", parent: { id: 3 } },
    ],
    "Home",
  );
  cycle.nodes.forEach((node) =>
    assert.ok(categoryPath(node, cycle.byKey).length <= 4),
  );
  const dense = buildCategoryHierarchy(
    Array.from({ length: 40 }, (_, id) => ({ id, title: `Leaf ${id}` })),
    "Home",
  );
  assert.ok(dense.height >= 40 * 44);
  assert.equal(dense.columns[1], 40);
});

test("all three modes retain exact weights, zero categories and selected branch context", () => {
  const { state, component } = fixture([
    { id: 1, title: "Parent", products: 0, categories: 1, visits: 0 },
    {
      id: 2,
      title: "Child",
      parent: { id: 1 },
      products: 7,
      categories: 2,
      visits: 12,
    },
    { id: 3, title: "Other", products: 0, categories: 0, visits: 0 },
  ]);
  assert.equal(
    state.chart_data.links.map((link) => link.actualValue).join(),
    "1,1,1",
  );
  state.mode = "visits";
  assert.equal(
    state.chart_data.links.map((link) => link.actualValue).join(),
    "0,12,0",
  );
  assert.equal(state.chart_data.nodes.length, 4);
  assert.ok(
    state.chart_data.links[0].value > 0,
    "zero gets layout space, but actualValue stays zero",
  );
  state.mode = "count";
  assert.equal(
    state.chart_data.links.map((link) => link.actualValue).join(),
    "1,9,0",
  );
  assert.equal(categoryMetric({ products: 7, categories: 2 }, "count"), 9);
  state.selectNode("category-1");
  assert.equal(
    [...state.active_keys].sort().join(),
    "category-1,category-2,home",
  );
  state.selectNode("category-2");
  assert.equal(state.active_path, "home → Parent → Child");
  state.categories = [
    { id: 8, title: "Zero", visits: 0, products: 0, categories: 0 },
  ];
  component.watch.categories.call(state);
  assert.equal(state.selected, null);
  assert.equal(state.has_activity, false);
  assert.equal(state.chart_data.links[0].actualValue, 0);
  state.$n = (value) => new Intl.NumberFormat("fa").format(value);
  assert.equal(state.formatCount(1234), "۱٬۲۳۴");
  assert.equal(state.formatCount(null), "—");
});

test("category text stays escaped in native chart data; both responsive templates compile", () => {
  const { state } = fixture([
    {
      id: 1,
      title: '<img src=x onerror="x">',
      description: "<script>alert(1)</script>",
    },
  ]);
  assert.ok(!state.chart_data.nodes[1].tooltip.includes("<script>"));
  assert.equal(escapeCategoryText("<>&\"'"), "&lt;&gt;&amp;&quot;&#39;");
  for (const filename of ["categoriesGraph.vue", "CategoryHierarchyTree.vue"]) {
    const source = readFileSync(
      new URL(`./${filename}`, import.meta.url),
      "utf8",
    );
    const descriptor = parse(source).descriptor;
    const result = compileTemplate({
      source: descriptor.template.content,
      filename,
      id: "hierarchy-check",
    });
    assert.equal(result.errors.length, 0, result.errors.join("\n"));
  }
});

test("native Sankey still renders all nodes, decorated labels and keyboard branch selection", () => {
  const dom = new JSDOM('<div id="viewport"><svg><g></g></svg></div>');
  const previousDocument = globalThis.document;
  globalThis.document = dom.window.document;
  dom.window.SVGElement.prototype.getBBox = function () {
    const width = this.textContent.length * 6;
    return {
      x:
        Number(this.getAttribute("x") || 0) -
        (this.classList.contains("d2b-text-anchor-end") ? width : 0),
      y: Number(this.getAttribute("y") || 0) - 10,
      width,
      height: 14,
    };
  };
  try {
    const { state, events } = fixture([
      { id: 1, title: "Parent", visits: 0, icon: "parent.png" },
      { id: 2, title: "Child", parent: { id: 1 }, visits: 2 },
    ]);
    state.mode = "visits";
    const host = dom.window.document.querySelector("svg");
    const native = renderSankey()
      .size({ width: 900, height: state.hierarchy.height })
      .nodeKey((node) => node.key)
      .nodeLabel((node) => node.name);
    state.chartConfig({ sankey: () => native });
    select(host.querySelector("g")).datum(state.chart_data).call(native);
    const clear = () => ({ clear() {} });
    state.$refs.chart = {
      $el: host,
      generator: { nodeTooltip: clear, linkTooltip: clear },
    };
    state.decorateChart();
    assert.equal(host.querySelectorAll(".d2b-sankey-node").length, 3);
    assert.equal(
      host.querySelectorAll(".category-graph__label-background").length,
      3,
    );
    assert.equal(host.querySelectorAll(".category-graph__link-zero").length, 1);
    assert.equal(host.querySelectorAll(".category-graph__avatar").length, 2);
    const avatar = host.querySelector(".category-graph__avatar img");
    assert.equal(avatar.getAttribute("src"), "/fixture/parent.png?size=64");
    assert.equal(avatar.getAttribute("width"), "20");
    assert.equal(avatar.getAttribute("height"), "20");
    assert.equal(avatar.getAttribute("loading"), "lazy");
    assert.equal(avatar.getAttribute("decoding"), "async");
    avatar.dispatchEvent(new dom.window.Event("error"));
    assert.equal(avatar.hidden, true);
    let sourceUpdates = 0;
    const setAttribute = avatar.setAttribute.bind(avatar);
    avatar.setAttribute = (name, value) => {
      if (name === "src") sourceUpdates++;
      setAttribute(name, value);
    };
    state.decorateChart();
    assert.equal(host.querySelector(".category-graph__avatar img"), avatar);
    assert.equal(
      sourceUpdates,
      0,
      "redrawing must not restart the same image request",
    );
    assert.equal(
      avatar.hidden,
      true,
      "failed avatars keep their folder fallback",
    );
    assert.equal(
      host.querySelectorAll(".category-graph__avatar img").length,
      1,
    );
    const child = [...host.querySelectorAll(".d2b-sankey-node")].find(
      (element) => element.__data__.key === "category-2",
    );
    child.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    assert.equal(state.selected, "category-2");
    assert.equal(state.active_path, "home → Parent → Child");
    state.editNode("category-1");
    assert.equal(events.length, 0, "read-only graphs cannot request editing");
    state.canEdit = true;
    state.decorateChart();
    assert.equal(
      host.querySelectorAll(".category-graph__edit-button").length,
      2,
    );
    const lastControl = child.querySelector(".category-graph__edit");
    assert.ok(
      Number(lastControl.getAttribute("x")) +
        Number(lastControl.getAttribute("width")) <=
        4,
      "last-column settings stay inside the diagram's endpoint",
    );
    const edit = host.querySelector(".category-graph__edit-button");
    assert.equal(
      edit.closest(".d2b-sankey-node").getAttribute("role"),
      "group",
    );
    let dragStarts = 0;
    edit.parentElement.parentElement.addEventListener(
      "mousedown",
      () => dragStarts++,
    );
    edit.dispatchEvent(
      new dom.window.MouseEvent("mousedown", { bubbles: true }),
    );
    assert.equal(dragStarts, 0, "edit controls do not start a node drag");
    edit.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    assert.equal(
      state.selected,
      "category-2",
      "edit keys do not change branch selection",
    );
    edit.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    assert.equal(events[0][0], "edit");
    assert.equal(events[0][1].id, 1);
    assert.equal(
      state.selected,
      "category-2",
      "edit clicks do not change branch selection",
    );
    state.canEdit = false;
    edit.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    assert.equal(
      events.length,
      1,
      "permission is rechecked before emitting edit",
    );
    state.decorateChart();
    assert.equal(
      host.querySelectorAll(".category-graph__edit-button").length,
      0,
    );
  } finally {
    globalThis.document = previousDocument;
    dom.window.close();
  }
});

test("mobile category identities use lazy 64px thumbnails with a local folder fallback", async () => {
  const Vue = await import("vue");
  const { renderToString } = await import("vue/server-renderer");
  const source = readFileSync(
    new URL("./CategoryHierarchyTree.vue", import.meta.url),
    "utf8",
  );
  const { descriptor } = parse(source);
  const treeExports = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports: treeExports,
    require: () => helperExports,
  });
  const compiled = {};
  vm.runInNewContext(
    transpile(
      compileTemplate({
        source: descriptor.template.content,
        filename: "CategoryHierarchyTree.vue",
        id: "hierarchy-avatar-test",
      }).code,
    ),
    { exports: compiled, require: () => Vue },
  );
  const Tree = { ...treeExports.default, render: compiled.render };
  const nodes = buildCategoryHierarchy(
    [
      { id: 1, title: "With image", icon: "parent.png" },
      { id: 2, title: "Without image", parent: { id: 1 } },
    ],
    "Home",
  ).root.children;
  const app = Vue.createSSRApp(Tree, {
    nodes,
    mode: "mono",
    selected: null,
    canEdit: true,
  });
  const Wrapper = {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("span", slots.default?.()),
  };
  app.component("VAvatar", Wrapper);
  app.component("VIcon", Wrapper);
  app.component("VBtn", {
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("button", { ...attrs, type: "button" }, slots.default?.()),
  });
  app.component("VTooltip", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("span", slots.activator?.({ props: {} })),
  });
  app.config.globalProperties.$t = (key) => key.split(".").at(-1);
  app.config.globalProperties.$n = (value) => String(value);
  app.config.globalProperties.getShopImagePath = (icon, size) =>
    `/fixture/${icon}?size=${size}`;
  const html = await renderToString(app);
  const document = new JSDOM(html).window.document;
  const image = document.querySelector("img");
  assert.equal(document.querySelectorAll("img").length, 1);
  assert.equal(image.getAttribute("src"), "/fixture/parent.png?size=64");
  assert.equal(image.getAttribute("loading"), "lazy");
  assert.equal(image.getAttribute("decoding"), "async");
  assert.equal(
    document.querySelectorAll(".category-hierarchy-tree__avatar").length,
    2,
  );
  assert.ok(document.body.textContent.includes("Without image"));
  const editControls = [
    ...document.querySelectorAll(".category-hierarchy-tree__edit"),
  ];
  assert.equal(editControls.length, 2);
  assert.ok(
    editControls.every(
      (button) => !button.parentElement.closest("summary, button"),
    ),
    "settings stay independent of tree disclosure and selection",
  );
});
