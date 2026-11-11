import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} from "@vue/compiler-sfc";
import ts from "typescript";

const dom = new JSDOM(
  '<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://selldone.test/help/8", pretendToBeVisual: true },
);
for (const name of [
  "window",
  "document",
  "Element",
  "HTMLElement",
  "SVGElement",
  "Node",
  "navigator",
])
  Object.defineProperty(globalThis, name, {
    value: name === "window" ? dom.window : dom.window[name],
    configurable: true,
  });
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
const Vue = await import("vue");
const { renderToString } = await import("vue/server-renderer");
const Prism = (await import("prismjs")).default;
await import("prismjs/components/prism-json.js");
const { PrismEditor } = await import("vue-prism-editor");
const jquery = (await import("jquery")).default;
const plain = (value) => JSON.parse(JSON.stringify(value));

function load(source, imports = {}, globals = {}) {
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
      TextEncoder,
      ...globals,
      require(name) {
        assert(name in imports, "Unexpected import: " + name);
        return imports[name];
      },
    },
  );
  return exports;
}
const flowHelpers = load(
  readFileSync(new URL("./flow-content.ts", import.meta.url), "utf8"),
);
const helpers = load(
  readFileSync(new URL("./article-flowchart.ts", import.meta.url), "utf8"),
  { "./flow-content": flowHelpers },
);
const samples = JSON.parse(
  readFileSync(new URL("./article-flowchart-samples.json", import.meta.url), "utf8"),
);
let enabled = true;
let nativeInputs = 0;
let confirmRemoval;
const nativeCore = {
  options: {
    get enabled() {
      return enabled;
    },
  },
  triggerInput() {
    nativeInputs++;
  },
  hideAddons() {},
  moveCaret() {},
};
const context = load(
  readFileSync(
    new URL("../toolbar/article-addon-context.ts", import.meta.url),
    "utf8",
  ),
  {},
  { $: jquery },
);
const copied = [];
let writeClipboard = async (text) => {
  copied.push(text);
};
Object.defineProperty(dom.window.navigator, "clipboard", {
  configurable: true,
  value: { writeText: (text) => writeClipboard(text) },
});

async function component(name, imports, globals = {}) {
  const filename = fileURLToPath(new URL(name, import.meta.url));
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
    filename,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: name });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename,
    id: name,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles)
    assert.deepEqual(
      (
        await compileStyleAsync({
          source: style.content,
          filename,
          id: name,
          scoped: style.scoped,
          preprocessLang: style.lang,
        })
      ).errors,
      [],
    );
  const options = load(
    script.content,
    { vue: Vue, ...imports },
    globals,
  ).default;
  return { ...options, render: load(template.code, { vue: Vue }).render };
}
const SharedFlow = await component("./SArticleFlow.vue", {
  "./flow-content": flowHelpers,
});
const Toolbar = await component(
  "../toolbar/AAddonToolbar.vue",
  {
    "./article-addon-context": context,
    "@selldone/components-vue/plugins/notification/NotificationService.ts": {
      default: {
        openDangerAlert: (_title, _message, _action, callback) => {
          confirmRemoval = callback;
        },
      },
    },
  },
  { $: jquery, document: dom.window.document },
);
const Addon = await component("./AAddonFlowchart.vue", {
  "./SArticleFlow.vue": { default: SharedFlow },
  "../toolbar/AAddonToolbar.vue": { default: Toolbar },
  "../toolbar/article-addon-context": context,
  "./article-flowchart": helpers,
});
const Dialog = await component(
  "./AAddonFlowchartDialog.vue",
  {
    prismjs: { default: Prism },
    "prismjs/components/prism-json": {},
    "vue-prism-editor": { PrismEditor },
    "vue-prism-editor/dist/prismeditor.min.css": {},
    "./SArticleFlow.vue": { default: SharedFlow },
    "./article-flowchart": helpers,
    "./article-flowchart-samples.json": { default: samples },
  },
  { navigator: dom.window.navigator },
);

function configure(app) {
  app.config.globalProperties.$t = (key) =>
    ({
      "global.article.flowchart.legend_in_flight": "In progress",
      "global.article.flowchart.legend_error": "Error",
      "global.article.flowchart.legend_warning": "Needs attention",
      "global.article.flowchart.legend_success": "Complete",
      "global.article.flowchart.prompt_copied": "AI prompt copied.",
      "global.article.flowchart.copy_failed": "Could not copy. Try again.",
    })[key] || key;
  app.config.warnHandler = (message) => {
    throw Error(message);
  };
  app.component("v-icon", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("span", { "aria-hidden": "true" }, slots.default?.()),
  });
  app.component("v-tooltip", { setup: () => () => null });
  return app;
}

test("compiled RTL transforms stay inside the shared flow instead of moving the document", async () => {
  const filename = fileURLToPath(
    new URL("./SArticleFlow.vue", import.meta.url),
  );
  const { descriptor } = parse(readFileSync(filename, "utf8"), { filename });
  const style = await compileStyleAsync({
    source: descriptor.styles[0].content,
    filename,
    id: "data-v-flow-rtl",
    scoped: true,
    preprocessLang: descriptor.styles[0].lang,
  });
  assert.deepEqual(style.errors, []);
  const fixture = new JSDOM(`<!doctype html><html dir="rtl"><body>
    <section class="api-doc-content" data-v-flow-rtl>
      <span class="api-doc-content__direction" data-v-flow-rtl></span>
      <span class="api-doc-content__pill api-doc-content__pill--end" data-v-flow-rtl></span>
      <span class="api-doc-content__pill" data-v-flow-rtl></span>
    </section>
    <section class="api-doc-content" dir="ltr" data-v-flow-rtl>
      <span class="api-doc-content__direction" data-v-flow-rtl></span>
      <span class="api-doc-content__pill" data-v-flow-rtl></span>
    </section>
    <span class="api-doc-content__direction"></span>
  </body></html>`);
  const doc = fixture.window.document;
  const sheet = doc.createElement("style");
  sheet.textContent = style.code;
  doc.head.append(sheet);
  const transformRules = [];
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.selectorText && rule.style?.getPropertyValue("transform"))
        transformRules.push(rule);
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  visit(sheet.sheet.cssRules);
  for (const element of [doc.documentElement, doc.body])
    assert.equal(
      transformRules.some((rule) => element.matches(rule.selectorText)),
      false,
      "Scoped flow styles must never transform the document or body.",
    );
  const rtlRules = transformRules.filter((rule) =>
    rule.selectorText.includes(":dir(rtl)"),
  );
  const transforms = (element) =>
    rtlRules
      .filter((rule) => element.matches(rule.selectorText))
      .map((rule) =>
        rule.style.getPropertyValue("transform").replace(/\s/g, ""),
      );
  const flow = doc.querySelector("section");
  assert.deepEqual(
    transforms(flow.querySelector(".api-doc-content__direction")),
    ["rotate(180deg)"],
  );
  assert.deepEqual(
    transforms(flow.querySelector(".api-doc-content__pill--end")),
    ["translate(0,-50%)"],
  );
  assert.deepEqual(
    transforms(
      flow.querySelector(
        ".api-doc-content__pill:not(.api-doc-content__pill--end)",
      ),
    ),
    ["translate(calc(-100%-8px),-50%)"],
  );
  for (const element of doc.querySelectorAll(
    'section[dir="ltr"] span, body > span',
  ))
    assert.deepEqual(
      transforms(element),
      [],
      "LTR flows and unrelated page content keep their own geometry.",
    );
});

test("strict definitions match server defaults, retain cycles, and never mutate the input", () => {
  const input = {
    type: "flow",
    title: "  Example  ",
    nodes: [
      { id: "request", label: "Request" },
      { id: "result", label: "Result" },
    ],
    edges: [
      { from: "request", to: "result" },
      { from: "result", to: "request" },
    ],
  };
  const unchanged = JSON.stringify(input);
  const result = helpers.parseArticleFlowchart(input);
  assert.equal(result.title, "Example");
  assert.equal(result.description, "");
  assert.equal(result.animated, false);
  assert.deepEqual(plain(result.nodes[0]), {
    id: "request",
    label: "Request",
    description: "",
    icon: "circle",
    caption: "",
    outcome: null,
  });
  assert.equal(result.edges.length, 2);
  assert.equal(JSON.stringify(input), unchanged);
  assert.deepEqual(
    plain(helpers.parseArticleFlowchart(JSON.stringify(input))),
    plain(result),
  );
  for (const type of ["help", "blog"])
    assert(helpers.canUseArticleFlowchart(type));
  for (const type of ["shop-blog", "product", "Help", "", null])
    assert.equal(helpers.canUseArticleFlowchart(type), false);
});

test("malformed or executable definitions fail closed without silently dropping nodes or edges", () => {
  const sample = helpers.createArticleFlowchart();
  const cases = [
    null,
    [],
    "{broken",
    { ...sample, url: "https://example.test" },
    { ...sample, animated: "true" },
    { ...sample, title: "<svg onload=alert(1)>" },
    { ...sample, title: "x".repeat(161) },
    { ...sample, description: null },
    { ...sample, nodes: [sample.nodes[0]] },
    { ...sample, nodes: Array(7).fill(sample.nodes[0]) },
    { ...sample, nodes: [sample.nodes[0], sample.nodes[0]] },
    {
      ...sample,
      nodes: [{ ...sample.nodes[0], id: "__proto__" }, sample.nodes[1]],
    },
    {
      ...sample,
      nodes: [
        { ...sample.nodes[0], icon: "svg:script" },
        ...sample.nodes.slice(1),
      ],
    },
    {
      ...sample,
      nodes: [
        { ...sample.nodes[0], href: "javascript:alert(1)" },
        ...sample.nodes.slice(1),
      ],
    },
    {
      ...sample,
      nodes: [
        { ...sample.nodes[0], label: "bad\u0000label" },
        ...sample.nodes.slice(1),
      ],
    },
    {
      ...sample,
      nodes: [
        { ...sample.nodes[0], description: "\uD800" },
        ...sample.nodes.slice(1),
      ],
    },
    {
      ...sample,
      nodes: [
        { ...sample.nodes[0], outcome: { label: "Unknown", tone: "purple" } },
        ...sample.nodes.slice(1),
      ],
    },
    { ...sample, edges: [{ from: "request", to: "unknown" }] },
    { ...sample, edges: [{ from: "request", to: "request" }] },
    { ...sample, edges: Array(49).fill(sample.edges[0]) },
    { ...sample, edges: [{ ...sample.edges[0], action: "fetch" }] },
  ];
  for (const value of cases)
    assert.equal(helpers.parseArticleFlowchart(value), null);
  assert.equal(
    helpers.parseArticleFlowchart(
      " ".repeat(helpers.MAX_FLOWCHART_BYTES) + JSON.stringify(sample),
    ),
    null,
  );
  assert.equal(helpers.serializeArticleFlowchart(cases[3]), null);
});

test("serialization reconstructs only inert metadata and escaped canonical JSON", () => {
  const sample = helpers.createArticleFlowchart();
  sample.title = 'A "quoted" & useful flow';
  sample.nodes[0].label = "Customer's request";
  const html = helpers.serializeArticleFlowchart(sample);
  const fragment = JSDOM.fragment(html);
  const element = fragment.firstElementChild;
  assert.equal(element.localName, "article-flowchart");
  assert.deepEqual(
    Array.from(element.attributes, (attribute) => attribute.name),
    ["data-version", "data-flow"],
  );
  assert.equal(element.innerHTML, "");
  assert.deepEqual(
    plain(helpers.parseArticleFlowchartElement(element)),
    plain(sample),
  );
  element.innerHTML =
    '<svg><path d="runtime"></path></svg><button>Editor UI</button>';
  const saved = JSDOM.fragment(
    helpers.serializeArticleFlowchart(
      helpers.parseArticleFlowchartElement(element),
    ),
  );
  assert.equal(saved.querySelectorAll("svg, button, script").length, 0);
  element.setAttribute("data-version", "2");
  assert.equal(helpers.parseArticleFlowchartElement(element), null);
});

test("larger diagrams round-trip at the 24-node and 48-edge bounds", () => {
  const nodes = Array.from({ length: 24 }, (_, index) => ({
    id: `step${index}`,
    label: `Step ${index + 1}`,
  }));
  const edges = [1, 2].flatMap((distance) =>
    nodes.map((node, index) => ({
      from: node.id,
      to: nodes[(index + distance) % nodes.length].id,
      label: `Path ${distance}`,
    })),
  );
  const input = { type: "flow", title: "A larger workflow", nodes, edges };
  const flow = helpers.parseArticleFlowchart(input);
  assert(flow);
  assert.equal(flow.nodes.length, 24);
  assert.equal(flow.edges.length, 48);
  assert.deepEqual(plain(flowHelpers.normalizeDocFlow(flow)), plain(flow));
  assert.deepEqual(
    plain(helpers.parseArticleFlowchartElement(JSDOM.fragment(
      helpers.serializeArticleFlowchart(flow),
    ).firstElementChild)),
    plain(flow),
  );
  for (const invalid of [
    { ...input, nodes: [...nodes, { id: "extra", label: "Extra step" }] },
    { ...input, edges: [...edges, { from: "step0", to: "step3" }] },
  ]) {
    assert.equal(helpers.parseArticleFlowchart(invalid), null);
    assert.equal(flowHelpers.normalizeDocFlow(invalid), null);
  }
  for (const sample of samples) {
    assert(helpers.parseArticleFlowchart(sample.flowchart), sample.id);
    assert(flowHelpers.normalizeDocFlow(sample.flowchart), sample.id);
  }
});

test("the real article figure uses API Docs branching, outcomes and text explanation and excludes shop Blog", async () => {
  const flow = helpers.createArticleFlowchart();
  const app = configure(
    Vue.createSSRApp(Addon, { definition: flow, articleType: "help" }),
  );
  const output = new JSDOM(await renderToString(app)).window.document;
  assert.equal(output.querySelectorAll("article-flowchart").length, 1);
  assert.equal(output.querySelectorAll(".api-doc-content__tile").length, 4);
  assert(output.querySelector("details.api-doc-content__text > summary"));
  assert.equal(
    output.querySelectorAll(".api-doc-content__outcome--error").length,
    1,
  );
  assert.equal(
    output.querySelectorAll(".api-doc-content__outcome--success").length,
    1,
  );
  assert.equal(
    output.querySelectorAll(".api-doc-content__connections li").length,
    3,
  );
  assert.match(
    output.querySelector("figcaption").textContent,
    /From request to outcome/,
  );
  assert.match(
    output.querySelector(".api-doc-content__legend").textContent,
    /In progress.*Error.*Needs attention.*Complete/s,
  );
  assert.doesNotMatch(
    output.querySelector(".api-doc-content__legend").textContent,
    /HTTP|API|api_docs_unified/,
  );
  const excluded = await renderToString(
    configure(
      Vue.createSSRApp(Addon, {
        definition: flow,
        editable: true,
        articleType: "shop-blog",
      }),
    ),
  );
  assert.doesNotMatch(excluded, /article-flowchart|api-doc-content__tile/);
});

test("runtime flow slots and selection preserve ordinary article captions, icons and tap help", async () => {
  const block = helpers.createArticleFlowchart();
  const selections = [],
    tips = [];
  const Flow = {
    ...SharedFlow,
    components: {
      VTooltip: {
        props: { openOnClick: Boolean },
        setup(props) {
          tips.push(props);
          return () => null;
        },
      },
    },
  };
  let app = configure(
    Vue.createApp(Flow, {
      block,
      onSelect: (id) => selections.push(id),
    }),
  );
  app.mount(dom.window.document.getElementById("app"));
  await Vue.nextTick();
  assert.equal(
    dom.window.document.querySelector("figcaption h2").textContent,
    block.title,
  );
  assert.equal(dom.window.document.querySelector("details, summary"), null);
  assert.equal(
    dom.window.document.querySelectorAll(
      ".api-doc-content__sr > .api-doc-content__connections li",
    ).length,
    block.edges.length,
  );
  assert.equal(
    dom.window.document.querySelector(".api-doc-content__icon").textContent,
    block.nodes[0].icon,
  );
  dom.window.document.querySelector(".api-doc-content__tile").click();
  assert.deepEqual(selections, []);
  assert(tips.length && tips.every((tip) => tip.openOnClick));
  app.unmount();

  tips.length = 0;
  app = configure(
    Vue.createApp({
      render: () =>
        Vue.h(
          Flow,
          {
            block,
            interactive: true,
            onSelect: (id) => selections.push(id),
          },
          {
            caption: () => null,
            "node-icon": ({ node }) =>
              Vue.h("span", { class: "runtime-flow-icon" }, node.id),
          },
        ),
    }),
  );
  app.mount(dom.window.document.getElementById("app"));
  await Vue.nextTick();
  assert.equal(dom.window.document.querySelector("figcaption"), null);
  assert.equal(dom.window.document.querySelector("details, summary"), null);
  assert.equal(
    dom.window.document.querySelector(".api-doc-content__icon"),
    null,
  );
  assert.equal(
    dom.window.document.querySelectorAll(".runtime-flow-icon").length,
    block.nodes.length,
  );
  dom.window.document.querySelectorAll(".api-doc-content__tile")[1].click();
  assert.deepEqual(selections, [block.nodes[1].id]);
  assert(tips.length && tips.every((tip) => !tip.openOnClick));
  app.unmount();
});

test("a runtime four-column rail fits wide containers and stacks without changing article defaults", async () => {
  const block = helpers.createArticleFlowchart();
  block.edges = block.nodes.slice(1).map((node, index) => ({
    from: block.nodes[index].id,
    to: node.id,
    label: "",
  }));
  const app = configure(Vue.createApp(SharedFlow, { block, railColumns: 4 }));
  const state = app.mount(dom.window.document.getElementById("app"));
  await Vue.nextTick();
  const stage = dom.window.document.querySelector(".api-doc-content__stage");
  let width = 1000;
  stage.getBoundingClientRect = () => ({ left: 0, top: 0, width, height: 300 });
  for (const [nextWidth, columns] of [
    [1000, 4],
    [650, 1],
    [1000, 4],
  ]) {
    width = nextWidth;
    state.measure();
    await Vue.nextTick();
    await Vue.nextTick();
    assert.equal(
      stage.style.getPropertyValue("--doc-flow-columns"),
      String(columns),
    );
    assert.equal(state.layouts[0].rows, columns === 4 ? 1 : 4);
  }
  app.unmount();
});

test("runtime stage decorations receive connector geometry without changing the stored graph or default rendering", async () => {
  const block = helpers.createArticleFlowchart();
  block.edges = block.nodes.slice(1).map((node, index) => ({
    from: block.nodes[index].id,
    to: node.id,
    label: "",
  }));
  const original = JSON.stringify(block);
  let geometry;
  const measured = [];
  const app = configure(
    Vue.createApp({
      render: () =>
        Vue.h(
          SharedFlow,
          { block, railColumns: 4, onMeasure: (value) => measured.push(value) },
          {
            "stage-decoration": (value) => {
              geometry = value;
              return Vue.h("div", {
                class: "runtime-stage-decoration",
                "data-columns": value.layout.columns,
              });
            },
          },
        ),
    }),
  );
  const root = app.mount(dom.window.document.getElementById("app"));
  await Vue.nextTick();
  const state = root.$.subTree.component.proxy;
  const stage = dom.window.document.querySelector(".api-doc-content__stage");
  stage.getBoundingClientRect = () => ({
    left: 100,
    top: 80,
    width: 1000,
    height: 300,
  });
  const tiles = dom.window.document.querySelectorAll(".api-doc-content__tile");
  tiles.forEach((tile, index) => {
    tile.getBoundingClientRect = () => ({
      left: 114 + index * 230,
      top: 136,
      width: 180,
      height: 108,
    });
    assert.equal(tile.dataset.nodeId, block.nodes[index].id);
  });
  state.measure();
  await Vue.nextTick();
  assert.deepEqual(plain(geometry.boxes[block.nodes[0].id]), {
    x: 14,
    y: 56,
    w: 180,
    h: 108,
  });
  assert.deepEqual(plain(geometry.size), { w: 1000, h: 300 });
  assert.equal(geometry.layout.columns, 4);
  assert.equal(measured.at(-1).index, 0);
  assert.deepEqual(plain(measured.at(-1).boxes), plain(geometry.boxes));
  assert.deepEqual(plain(measured.at(-1).size), plain(geometry.size));
  assert.equal(JSON.stringify(block), original);
  assert.equal(state.wires[0].length, block.edges.length);
  assert.equal(
    dom.window.document.querySelectorAll(".runtime-stage-decoration").length,
    1,
  );
  app.unmount();
  const ordinary = configure(Vue.createApp(SharedFlow, { block }));
  ordinary.mount(dom.window.document.getElementById("app"));
  await Vue.nextTick();
  assert.equal(
    dom.window.document.querySelector(".runtime-stage-decoration"),
    null,
  );
  assert.equal(
    dom.window.document.querySelector("figcaption h2").textContent,
    block.title,
  );
  ordinary.unmount();
});

test("domain overview renders the shared flow with its real home helper and native section navigation", async () => {
  const DomainMixin = load(
    readFileSync(
      new URL("../../../mixin/domain/DomainMixin.ts", import.meta.url),
      "utf8",
    ),
  ).default;
  const provider = load(
    readFileSync(
      new URL(
        "../../../backoffice/domain/provider/domain-provider.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    {
      "../../../assets/trademark/selldone.svg":
        "/test-assets/provider-selldone.svg",
      "../../../assets/trademark/cloudflare.svg": "/test-assets/cloudflare.svg",
      "../../../assets/trademark/google-cloud.svg":
        "/test-assets/google-cloud.svg",
    },
  );
  let renderer;
  const MeasuredFlow = {
    ...SharedFlow,
    mounted() {
      renderer = this;
      SharedFlow.mounted.call(this);
    },
  };
  const DomainFlow = await component(
    "../../../backoffice/domain/workspace/BDomainWorkspaceFlow.vue",
    {
      "@selldone/components-vue/mixin/domain/DomainMixin.ts": {
        default: DomainMixin,
      },
      "@selldone/components-vue/article/add-on/flowchart/SArticleFlow.vue": {
        default: MeasuredFlow,
      },
      "@selldone/components-vue/assets/selldone-logo/selldone.svg": {
        default: "/test-assets/selldone.svg",
      },
      "../provider/domain-provider.ts": provider,
      "../../../article/add-on/flowchart/flow-content": flowHelpers,
    },
  );
  const events = [];
  const refreshes = [];
  const checking = Vue.ref(false);
  const canCheck = Vue.ref(true);
  const owner = Vue.ref(null);
  const item = Vue.ref({
    url: "https://a-long-storefront-name.example.test",
    enable: true,
    primary: false,
    domain: {
      domain: "a-long-storefront-name.example.test",
      home: "blog",
      ssl_proxy: false,
    },
  });
  const app = configure(
    Vue.createApp({
      render: () =>
        Vue.h(DomainFlow, {
          ref: owner,
          shop: { id: 7, home: "shop" },
          item: item.value,
          providerChecking: checking.value,
          providerCheckAllowed: canCheck.value,
          onNavigate: (...args) => events.push(args),
          onRefreshProvider: () => refreshes.push("refresh"),
        }),
    }),
  );
  app.mount(dom.window.document.getElementById("app"));
  await Vue.nextTick();
  const tile = (id) =>
    dom.window.document.querySelector(`[data-node-id="${id}"]`);
  const measure = async (width = 1000, rtl = false, storeHeight = 108) => {
    const stage = dom.window.document.querySelector(".api-doc-content__stage");
    owner.value.$el.dir = rtl ? "rtl" : "ltr";
    stage.style.direction = rtl ? "rtl" : "ltr";
    stage.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width,
      height: width < 500 ? 1100 : 320,
    });
    dom.window.document
      .querySelectorAll(".api-doc-content__tile")
      .forEach((element, index) => {
        const id = element.dataset.nodeId;
        const paired =
          !owner.value.external && ["domain", "store"].includes(id);
        element.getBoundingClientRect = () =>
          width < 500
            ? {
                left: paired && id === (rtl ? "domain" : "store") ? 186 : 14,
                top: 56 + (paired ? owner.value.nodes.length - 2 : index) * 212,
                width: paired ? 130 : 302,
                height: id === "store" ? storeHeight : 108,
              }
            : {
                left: rtl ? width - 164 - index * 190 : 14 + index * 190,
                top: 56,
                width: 150,
                height: id === "store" ? storeHeight : 108,
              };
      });
    renderer.measure();
    await Vue.nextTick();
  };
  await measure();
  assert.equal(
    dom.window.document.querySelectorAll(".api-doc-content__tile").length,
    5,
  );
  assert.equal(
    dom.window.document
      .querySelector(".api-doc-content__stage")
      .style.getPropertyValue("--doc-flow-columns"),
    "5",
  );
  assert.match(tile("client").textContent, /person_outline/);
  assert.match(tile("dns").textContent, /request_flow\.dns_records/);
  assert.match(
    tile("client").textContent,
    /domains_modern\.request_flow\.client/,
  );
  assert.match(
    tile("connection").textContent,
    /domains_modern\.request_flow\.unknown_provider/,
  );
  assert.match(tile("store").textContent, /global\.commons\.blog/);
  assert.equal(dom.window.document.querySelector("figcaption"), null);
  assert.match(
    tile("store").querySelector(".b-domain-workspace-flow__logo").style
      .maskImage,
    /\/test-assets\/selldone\.svg/,
  );
  assert(
    tile("store").querySelector(
      ".b-domain-workspace-flow__action-outline.no-inv",
    ),
  );
  assert(tile("domain").querySelector(".api-doc-content__dot.no-inv"));
  assert.equal(tile("store").classList.contains("no-inv"), false);
  assert.equal(dom.window.document.querySelectorAll("marker path").length, 1);
  assert(
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__dns-wire path[d]",
    ),
  );
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__dns-label")
      .textContent,
    /dns_check/,
  );
  const unknownRoute = dom.window.document.querySelector('.b-domain-workspace-flow__dns-wire path').getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
  const tileBottom = Math.max(...Object.values(renderer.boxes[0]).map(box => box.y + box.h));
  assert(tileBottom + owner.value.flowTail - unknownRoute[2] - 19 / 2 >= 16, 'the complete feedback label clears the following status paragraph');
  const providerCheck = () =>
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__provider-check",
    );
  assert.equal(providerCheck().closest(".api-doc-content__tile"), null);
  providerCheck().click();
  assert.deepEqual(refreshes, ["refresh"]);
  assert.deepEqual(events, []);
  checking.value = true;
  await Vue.nextTick();
  assert.equal(providerCheck().disabled, true);
  assert.equal(providerCheck().getAttribute("aria-busy"), "true");
  providerCheck().click();
  assert.deepEqual(refreshes, ["refresh"]);
  checking.value = false;
  canCheck.value = false;
  await Vue.nextTick();
  assert.equal(providerCheck().disabled, true);
  canCheck.value = true;
  await Vue.nextTick();
  assert.equal(dom.window.document.querySelector("details, summary"), null);
  assert.equal(
    dom.window.document.querySelectorAll(
      ".api-doc-content__sr > .api-doc-content__connections li",
    ).length,
    4,
  );
  tile("client").click();
  await Vue.nextTick();
  assert.deepEqual(events, []);
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__detail")
      .textContent,
    /client_help.*a-long-storefront-name\.example\.test/,
  );
  for (const id of ["dns", "connection", "domain", "store"]) tile(id).click();
  assert.deepEqual(events, [
    ["connection", undefined],
    ["connection", undefined],
    ["settings", "access"],
    ["storefront", undefined],
  ]);

  item.value = {
    ...item.value,
    layout_summary: {
      mode: "inherit",
      inherited: true,
      effective_mode: "private",
      name: "Actual assigned storefront",
      image_url: "https://cdn.example.test/layout-cover.webp",
    },
  };
  await Vue.nextTick();
  assert.match(
    tile("store").querySelector("strong").textContent,
    /Actual assigned storefront/,
  );
  assert.match(tile("store").textContent, /global\.commons\.blog/);
  const cover = tile("store").querySelector("img");
  assert.equal(
    cover.getAttribute("src"),
    "https://cdn.example.test/layout-cover.webp",
  );
  assert.equal(cover.getAttribute("width"), "28");
  assert.equal(cover.getAttribute("height"), "28");
  assert.equal(cover.getAttribute("alt"), "");
  assert.equal(
    tile("store").querySelector(".b-domain-workspace-flow__logo"),
    null,
  );
  cover.dispatchEvent(new dom.window.Event("error"));
  await Vue.nextTick();
  assert.equal(tile("store").querySelector("img"), null);
  assert.match(tile("store").textContent, /layers.*Actual assigned storefront/);
  tile("store").click();
  assert.deepEqual(events.at(-1), ["storefront", undefined]);

  item.value = {
    ...item.value,
    layout_summary: null,
    domain: {
      ...item.value.domain,
      layout_summary: {
        effective_mode: "official",
        name: "Assigned official layout",
        image_url: null,
      },
    },
  };
  await Vue.nextTick();
  assert.match(tile("store").textContent, /layers.*Assigned official layout/);
  assert.match(tile("store").textContent, /global\.commons\.blog/);
  item.value = {
    ...item.value,
    layout_summary: {
      effective_mode: "standard",
      name: "Ignore a standard custom identity",
      image_url: "https://cdn.example.test/ignore-standard.webp",
    },
  };
  await Vue.nextTick();
  assert.doesNotMatch(
    tile("store").textContent,
    /Ignore a standard custom identity/,
  );
  assert.equal(tile("store").querySelector("img"), null);
  assert(tile("store").querySelector(".b-domain-workspace-flow__logo"));

  const normalStore = plain(item.value);
  const normalEdges = plain(owner.value.flow.edges.map(({ from, to }) => [from, to]));
  const maintenance = { enabled: true, supported: true, has_html: true };
  for (const nested of [false, true]) for (const enabled of [true, false]) {
    item.value = {
      ...normalStore,
      enable: enabled,
      maintenance_summary: nested ? null : maintenance,
      domain: { ...normalStore.domain, id: 11, maintenance_summary: nested ? { ...maintenance, has_html: false } : null },
    };
    await Vue.nextTick();
    await measure();
    assert.match(tile('store').textContent, /construction.*maintenance.page_title/);
    assert.match(tile('store').textContent, enabled ? /maintenance.all_paths/ : /maintenance.configured_disabled/);
    assert.equal(tile('store').querySelector('img,.b-domain-workspace-flow__logo'), null);
    assert.equal(owner.value.scenario, 'unknown', 'maintenance is not DNS or connection evidence');
    assert.deepEqual(plain(owner.value.flow.edges.map(({ from, to }) => [from, to])), normalEdges);
    assert(dom.window.document.querySelector('.b-domain-workspace-flow__dns-wire'));
    tile('store').click();
    assert.deepEqual(events.at(-1), ['settings', 'access']);
    assert.equal(!!dom.window.document.querySelector('.b-domain-workspace-flow--stopped'), !enabled);
  }
  for (const summary of [null, { ...maintenance, enabled: false }, { ...maintenance, supported: false }]) {
    item.value = { ...normalStore, maintenance_summary: summary, domain: { ...normalStore.domain, id: 11 } };
    await Vue.nextTick();
    assert.doesNotMatch(tile('store').textContent, /maintenance.page_title/);
    tile('store').click();
    assert.deepEqual(events.at(-1), ['storefront', undefined]);
  }
  item.value = normalStore;
  await Vue.nextTick();

  item.value = {
    ...item.value,
    domain: { ...item.value.domain, ssl_proxy: true },
  };
  await Vue.nextTick();
  await measure();
  assert.equal(
    owner.value.scenario,
    "unknown",
    "certificate configuration is not provider evidence",
  );
  assert.match(tile("connection").textContent, /unknown_provider/);
  assert.match(
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__certificate--action",
    ).textContent,
    /request_flow\.https/,
  );
  assert.doesNotMatch(
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__certificate--action",
    ).textContent,
    /origin_certificate/,
  );

  const evidence = (id, source = "response_headers") => ({
    id,
    source,
    checked_at: "2026-11-03T00:00:00Z",
  });
  item.value = {
    ...item.value,
    connection_provider: evidence("cloudflare"),
    enable: false,
  };
  await Vue.nextTick();
  await measure();
  assert.equal(owner.value.scenario, "cdn");
  assert.match(tile("connection").textContent, /cdn_edge/);
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__status")
      .textContent,
    /status_disabled/,
  );
  assert.match(
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__certificate--action",
    ).textContent,
    /origin_certificate/,
  );
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__group")
      .textContent,
    /public_https/,
  );
  dom.window.document
    .querySelector(".b-domain-workspace-flow__certificate--action")
    .click();
  assert.deepEqual(events.at(-1), ["connection", undefined]);
  assert.equal(owner.value.flow.animated, true);
  assert.deepEqual(
    plain(owner.value.flow.edges.map(({ from, to }) => [from, to])),
    [
      ["client", "dns"],
      ["dns", "connection"],
      ["connection", "domain"],
      ["domain", "store"],
    ],
  );
  assert.equal(
    providerCheck(),
    null,
    "a known CDN does not offer an unknown-provider refresh",
  );
  await measure(390, true);
  assert.equal(renderer.layouts[0].columns, 1);
  const mobileCheck = dom.window.document.querySelector(
    ".b-domain-workspace-flow__dns-wire path",
  );
  assert(
    mobileCheck.getAttribute("d").includes("Q"),
    "narrow verification uses the shared measured bypass",
  );
  assert.doesNotMatch(mobileCheck.getAttribute("d"), /NaN|undefined/);
  assert.equal(
    dom.window.document.querySelectorAll(".b-domain-workspace-flow__dns-wire")
      .length,
    1,
  );
  await measure(390, true, 200);
  let groups = owner.value.measuredGroups(renderer.boxes[0]);
  assert.equal(new Set(groups.map((group) => group.box.h)).size, 1, 'comparable cards use the tallest measured content');
  assert.equal(owner.value.groupSpacing, 92, 'the narrow grid reserves the longer storefront group before its next card');
  assert.equal(owner.value.$el.style.getPropertyValue('--domain-group-extra'), '92px');
  let route = dom.window.document.querySelector('.b-domain-workspace-flow__dns-wire path').getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert.equal(route[0], groups.find((group) => group.id === 'selldone').box.x, 'feedback begins at the group border, not a tile inside it');
  assert(route[2] < Math.min(...groups.map((group) => group.box.x)), 'the mirrored feedback bypass stays outside every card');
  await measure(1000, false, 200);
  groups = owner.value.measuredGroups(renderer.boxes[0]);
  assert.equal(new Set(groups.map((group) => group.box.h)).size, 1);
  assert.equal(owner.value.groupSpacing, 0, 'wide cards do not keep a stale narrow spacer');
  route = dom.window.document.querySelector('.b-domain-workspace-flow__dns-wire path').getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
  assert(route[2] === Math.max(...groups.map((group) => group.box.y + group.box.h)) + 25, 'the wide return lane clears the tallest complete card including its footer');
  await measure();

  for (const id of ["google_cloud", "vercel", "unknown"]) {
    item.value = { ...item.value, connection_provider: evidence(id) };
    await Vue.nextTick();
    assert.equal(owner.value.scenario, "unknown");
    assert.doesNotMatch(tile("connection").textContent, /unknown_connection/);
  }
  item.value = {
    ...item.value,
    connection_provider: evidence("cloudflare", "destination"),
  };
  await Vue.nextTick();
  assert.equal(
    owner.value.scenario,
    "unknown",
    "mismatched evidence cannot create a CDN stage",
  );

  item.value = {
    ...item.value,
    connection_provider: evidence("selldone", "destination"),
    domain: { ...item.value.domain, ssl_proxy: false },
  };
  await Vue.nextTick();
  await measure();
  assert.equal(owner.value.scenario, "direct");
  assert.equal(tile("connection"), null);
  assert.equal(providerCheck(), null);
  dom.window.document
    .querySelector(".b-domain-workspace-flow__certificate--action")
    .click();
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__detail")
      .textContent,
    /connection\.sslOwnHint/,
  );
  assert.match(
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__certificate--action",
    ).textContent,
    /externally_managed/,
  );

  item.value = {
    ...item.value,
    layout_summary: {
      effective_mode: "official",
      name: "Do not show this external assignment",
      image_url: "https://cdn.example.test/ignore-external.webp",
    },
    domain: { ...item.value.domain, externally_hosted: true },
  };
  await Vue.nextTick();
  await measure();
  assert.equal(owner.value.scenario, "external");
  assert.equal(tile("domain"), null);
  assert.equal(tile("store").querySelector("img"), null);
  assert.doesNotMatch(
    tile("store").textContent,
    /Do not show this external assignment/,
  );
  assert.equal(
    tile("store").querySelector(".b-domain-workspace-flow__logo"),
    null,
  );
  assert.match(tile("store").textContent, /request_flow\.external_home/);
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__ownership")
      .textContent,
    /ownership_check.*ownership_meta/,
  );
  dom.window.document
    .querySelector(".b-domain-workspace-flow__ownership")
    .click();
  assert.deepEqual(events.at(-1), ["connection", undefined]);
  assert.equal(providerCheck(), null);
  assert.equal(
    dom.window.document.querySelectorAll(".b-domain-workspace-flow__group")
      .length,
    1,
  );
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__group")
      .textContent,
    /external_hosting/,
  );
  assert.match(
    dom.window.document.querySelector(".b-domain-workspace-flow__status")
      .textContent,
    /status_external/,
  );
  assert.equal(
    dom.window.document.querySelector(".b-domain-workspace-flow--stopped"),
    null,
  );
  assert.equal(
    dom.window.document.querySelector(
      ".b-domain-workspace-flow__certificate--action",
    ),
    null,
  );

  item.value = {
    official: "local",
    url: "https://local.example.test/@synthetic",
    enable: true,
  };
  await Vue.nextTick();
  assert.equal(owner.value.scenario, "direct");
  assert.equal(tile("connection"), null);
  assert.match(tile("store").textContent, /global\.commons\.shop/);
  assert.equal(
    dom.window.document.querySelector(".b-domain-workspace-flow__dns-wire"),
    null,
  );
  assert.match(tile("dns").textContent, /dns_builtin/);
  owner.value.selectNode("home");
  assert.deepEqual(events.at(-1), ["storefront", undefined]);
  app.unmount();
});

test("canonical Unicode text and permitted object-like node IDs survive the shared renderer", async () => {
  const flow = helpers.createArticleFlowchart();
  flow.title = "😀".repeat(160);
  flow.nodes[0].label = "😀".repeat(160);
  flow.nodes[2].id = "constructor";
  flow.edges[1].to = "constructor";
  const canonical = helpers.parseArticleFlowchart(flow);
  assert(canonical);
  const html = await renderToString(
    configure(
      Vue.createSSRApp(Addon, { definition: canonical, articleType: "blog" }),
    ),
  );
  const doc = new JSDOM(html).window.document;
  assert(doc.querySelector("details.api-doc-content__text > summary"));
  assert.equal(doc.querySelector("figcaption h2").textContent, flow.title);
  assert.equal(
    Array.from(doc.querySelector(".api-doc-content__tile strong").textContent)
      .length,
    160,
  );
  const app = configure(Vue.createApp(SharedFlow, { block: canonical }));
  const state = app.mount(dom.window.document.getElementById("app"));
  assert.equal(typeof state.arrivals[0].constructor.stage, "number");
  assert.equal(Object.getPrototypeOf(state.arrivals[0]), null);
  assert(state.tiles[0].constructor instanceof dom.window.HTMLElement);
  await Vue.nextTick();
  app.unmount();
});

test("the real renderer registers pre-mount refs, waits for visibility and disconnects observers", async () => {
  const intersections = [],
    resizes = [];
  const frames = new Map(),
    cancelled = [];
  let nextFrame = 1;
  class Intersection {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Set();
      intersections.push(this);
    }
    observe(element) {
      this.targets.add(element);
    }
    unobserve(element) {
      this.targets.delete(element);
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  class Resize {
    constructor(callback) {
      this.callback = callback;
      this.targets = new Set();
      resizes.push(this);
    }
    observe(element) {
      this.targets.add(element);
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  const Observed = await component(
    "./SArticleFlow.vue",
    { "./flow-content": flowHelpers },
    {
      IntersectionObserver: Intersection,
      ResizeObserver: Resize,
      requestAnimationFrame(callback) {
        const id = nextFrame++;
        frames.set(id, callback);
        return id;
      },
      cancelAnimationFrame(id) {
        cancelled.push(id);
        frames.delete(id);
      },
    },
  );
  const app = configure(
    Vue.createApp(Observed, { block: helpers.createArticleFlowchart() }),
  );
  const state = app.mount(dom.window.document.getElementById("app"));
  const figure = dom.window.document.querySelector("figure");
  const stage = dom.window.document.querySelector(".api-doc-content__stage");
  assert(intersections[0].targets.has(figure));
  assert(resizes[0].targets.has(stage));
  assert.equal(state.played[0], undefined);
  intersections[0].callback([{ target: figure, isIntersecting: false }]);
  assert.equal(state.played[0], undefined);
  intersections[0].callback([{ target: figure, isIntersecting: true }]);
  await Vue.nextTick();
  assert.equal(state.played[0], true);
  assert(figure.classList.contains("api-doc-content__flow--play"));
  let measurements = 0;
  const measure = state.measure;
  state.measure = () => {
    measurements++;
    measure();
  };
  resizes[0].callback([]);
  resizes[0].callback([]);
  assert.equal(
    measurements,
    0,
    "resize delivery must not write layout synchronously",
  );
  assert.equal(frames.size, 1, "resize events coalesce into one frame");
  const [frame, callback] = frames.entries().next().value;
  frames.delete(frame);
  callback();
  assert.equal(measurements, 1);
  resizes[0].callback([]);
  const pending = state.resizeFrame;
  app.unmount();
  assert.deepEqual(cancelled, [pending]);
  assert.equal(frames.size, 0);
  assert.equal(intersections[0].disconnected, true);
  assert.equal(resizes[0].disconnected, true);
});

test("edit events recheck the real native editor boundary instead of trusting the editable prop", () => {
  const owner = dom.window.document.createElement("div");
  owner.className = "medium-editor-element";
  owner.setAttribute("contenteditable", "true");
  jquery(owner).data("plugin_mediumInsert", nativeCore);
  const element = dom.window.document.createElement("article-flowchart");
  owner.append(element);
  dom.window.document.body.append(owner);
  const events = [];
  const state = {
    editable: true,
    supported: true,
    flow: helpers.createArticleFlowchart(),
    element,
    $emit: (...args) => events.push(args),
  };
  Addon.methods.requestEdit.call(state);
  assert.equal(events.length, 1);
  enabled = false;
  Addon.methods.requestEdit.call(state);
  assert.equal(events.length, 1);
  enabled = true;
  owner.style.display = "none";
  Addon.methods.requestEdit.call(state);
  assert.equal(events.length, 1);
  owner.remove();
  Addon.methods.requestEdit.call(state);
  assert.equal(events.length, 1);
});

test("the real add-on toolbar moves and removes the custom root while retaining canonical metadata", async () => {
  const owner = dom.window.document.createElement("div");
  owner.className = "medium-editor-element";
  owner.setAttribute("contenteditable", "true");
  jquery(owner).data("plugin_mediumInsert", nativeCore);
  owner.innerHTML = `<p id="before">Before</p>${helpers.serializeArticleFlowchart(helpers.createArticleFlowchart())}<p id="after">After</p>`;
  dom.window.document.body.append(owner);
  nativeInputs = 0;
  const app = configure(
    Vue.createApp(Addon, {
      definition: helpers.createArticleFlowchart(),
      articleType: "help",
      editable: true,
    }),
  );
  app.component("v-btn", {
    props: ["disabled", "variant", "icon"],
    setup:
      (props, { slots, attrs }) =>
      () =>
        Vue.h(
          "button",
          { ...attrs, type: "button", disabled: props.disabled },
          slots.default?.(),
        ),
  });
  app.component("v-menu", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("div", slots.default?.()),
  });
  app.component("v-list", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("div", slots.default?.()),
  });
  app.component("v-list-item", {
    props: ["title", "prependIcon"],
    setup:
      (props, { attrs }) =>
      () =>
        Vue.h(
          "button",
          { ...attrs, type: "button", "data-action": props.title },
          props.title,
        ),
  });
  const container = dom.window.document.createElement("div");
  app.mount(container);
  const element = container.firstElementChild;
  owner.querySelector("article-flowchart").replaceWith(element);
  await Vue.nextTick();
  const json = element.getAttribute("data-flow");
  element
    .querySelector('[data-action="global.article.inline_tools.move_up"]')
    .click();
  assert.equal(owner.firstElementChild, element);
  element
    .querySelector('[data-action="global.article.inline_tools.move_down"]')
    .click();
  assert.equal(owner.children[1], element);
  assert.equal(nativeInputs, 2);
  assert.equal(element.getAttribute("data-flow"), json);
  const saved = JSDOM.fragment(
    helpers.serializeArticleFlowchart(
      helpers.parseArticleFlowchartElement(element),
    ),
  );
  assert.equal(saved.querySelectorAll("svg, button").length, 0);
  element
    .querySelector('[data-action="global.article.inline_tools.remove_action"]')
    .click();
  assert.equal(typeof confirmRemoval, "function");
  owner.style.display = "none";
  confirmRemoval();
  assert(
    element.isConnected,
    "A delayed delete must recheck the visible editable owner.",
  );
  owner.style.display = "";
  element
    .querySelector('[data-action="global.article.inline_tools.remove_action"]')
    .click();
  confirmRemoval();
  assert.equal(element.isConnected, false);
  assert.equal(owner.querySelector("article-flowchart"), null);
  assert.equal(nativeInputs, 3);
  await Vue.nextTick();
  app.unmount();
  owner.remove();
});

function dialogApp(initial) {
  const props = Vue.reactive({
    modelValue: true,
    definition: null,
    articleType: "help",
    active: true,
    ...initial,
  });
  const events = [];
  const application = configure(
    Vue.createApp({
      render: () =>
        Vue.h(Dialog, {
          ...props,
          ref: "dialog",
          "onUpdate:modelValue": (value) => events.push(["open", value]),
          onApply: (value) => events.push(["apply", plain(value)]),
        }),
    }),
  );
  application.component("v-dialog", {
    props: ["modelValue"],
    setup:
      (props, { slots }) =>
      () =>
        props.modelValue
          ? Vue.h("div", { role: "dialog" }, slots.default?.())
          : null,
  });
  for (const name of [
    "v-card",
    "v-card-title",
    "v-card-text",
    "v-card-actions",
  ])
    application.component(name, {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h("div", slots.default?.()),
    });
  application.component("v-btn", {
    props: ["disabled", "prependIcon", "variant", "icon"],
    setup:
      (props, { slots, attrs }) =>
      () =>
        Vue.h(
          "button",
          { ...attrs, type: "button", disabled: props.disabled },
          slots.default?.(),
        ),
  });
  const instance = application.mount(dom.window.document.getElementById("app"));
  return { application, props, events, dialog: instance.$refs.dialog };
}

test("the real JSON editor previews, preserves invalid draft text, copies the canonical AI schema and applies only when active", async () => {
  const fixture = dialogApp();
  await Vue.nextTick();
  assert(
    dom.window.document.querySelector(
      "details.api-doc-content__text > summary",
    ),
  );
  assert.equal(
    dom.window.document.querySelectorAll(".api-doc-content__tile").length,
    4,
  );
  assert.match(
    dom.window.document.querySelector(".api-doc-content__legend").textContent,
    /In progress.*Error.*Needs attention.*Complete/s,
  );
  const textarea = dom.window.document.querySelector("textarea");
  assert(textarea.id);
  assert.equal(textarea.getAttribute("aria-invalid"), "false");
  assert.equal(textarea.maxLength, helpers.MAX_FLOWCHART_BYTES);
  fixture.dialog.code = "{unfinished";
  await Vue.nextTick();
  fixture.dialog.submit();
  assert.equal(fixture.dialog.code, "{unfinished");
  assert.equal(fixture.events.length, 0);
  assert.equal(
    dom.window.document.querySelectorAll(".api-doc-content__tile").length,
    0,
  );
  await fixture.dialog.copyPrompt();
  assert.match(copied.at(-1), /type Flow =/);
  assert.match(copied.at(-1), /"id": "failure"/);
  assert.match(copied.at(-1), /65536 UTF-8 bytes/);
  assert.equal(fixture.dialog.copyState, "copied");
  fixture.dialog.code = JSON.stringify(helpers.createArticleFlowchart());
  await Vue.nextTick();
  fixture.dialog.submit();
  assert.equal(fixture.events.filter(([name]) => name === "apply").length, 1);
  assert.equal(
    fixture.events.filter(([name]) => name === "open").length,
    0,
    "Only the owner closes after accepting Apply.",
  );
  fixture.props.active = false;
  await Vue.nextTick();
  assert.equal(fixture.dialog.code, "");
  fixture.dialog.submit();
  assert.equal(fixture.events.filter(([name]) => name === "apply").length, 1);
  assert.deepEqual(fixture.events.at(-1), ["open", false]);
  // Let Prism's native line-number measurement finish before disposing the dialog host.
  await new Promise((resolve) => setImmediate(resolve));
  fixture.application.unmount();
});

test("unsupported article types never open the authoring dialog and closed callbacks cannot apply", async () => {
  const fixture = dialogApp({ articleType: "shop-blog" });
  await Vue.nextTick();
  assert.equal(dom.window.document.querySelector("[role='dialog']"), null);
  assert.equal(fixture.dialog.code, "");
  fixture.dialog.submit();
  assert.equal(fixture.events.length, 0);
  fixture.application.unmount();
  const events = [];
  Dialog.methods.submit.call({
    modelValue: false,
    available: true,
    parsed: helpers.createArticleFlowchart(),
    $emit: (...args) => events.push(args),
  });
  assert.equal(events.length, 0);
});

test("sample actions load editable JSON and responsive preview modes preserve the draft", async () => {
  const fixture = dialogApp();
  await Vue.nextTick();
  assert.equal(dom.window.document.querySelectorAll("[data-sample]").length, 5);
  for (const sample of samples) {
    dom.window.document.querySelector(`[data-sample="${sample.id}"]`).click();
    await Vue.nextTick();
    assert.deepEqual(plain(fixture.dialog.parsed), plain(helpers.parseArticleFlowchart(sample.flowchart)));
    assert.equal(dom.window.document.querySelectorAll(".api-doc-content__tile").length, sample.flowchart.nodes.length);
    assert.equal(fixture.events.length, 0, "Loading a sample must not apply it to the article.");
  }
  const draft = fixture.dialog.code;
  await fixture.dialog.copyPrompt();
  assert.match(copied.at(-1), /From checkout to delivery/);
  assert.match(copied.at(-1), /2–24 nodes/);
  dom.window.document.querySelector('[data-preview-mode="mobile"]').click();
  await Vue.nextTick();
  assert(dom.window.document.querySelector(".a-article-flowchart-dialog__preview-frame--mobile"));
  assert.equal(dom.window.document.querySelector('[data-preview-mode="mobile"]').getAttribute("aria-pressed"), "true");
  assert.equal(fixture.dialog.code, draft);
  dom.window.document.querySelector('[data-preview-mode="desktop"]').click();
  await Vue.nextTick();
  assert.equal(dom.window.document.querySelector(".a-article-flowchart-dialog__preview-frame--mobile"), null);
  assert.equal(fixture.dialog.code, draft);
  fixture.dialog.loadSample("unknown");
  assert.equal(fixture.dialog.code, draft);
  fixture.props.modelValue = false;
  await Vue.nextTick();
  fixture.dialog.loadSample("linear");
  assert.equal(fixture.dialog.code, "", "A stale sample callback cannot reopen or populate a closed editor.");
  await new Promise((resolve) => setImmediate(resolve));
  fixture.application.unmount();
});

test("clipboard denial stays visible and retryable while late copy results cannot cross dialog contexts", async () => {
  const fixture = dialogApp();
  await new Promise((resolve) => setImmediate(resolve));
  const draft = fixture.dialog.code;
  writeClipboard = async () => {
    throw new Error("Clipboard denied");
  };
  await fixture.dialog.copyPrompt();
  await Vue.nextTick();
  assert.equal(fixture.dialog.copyState, "failed");
  assert.match(
    dom.window.document.querySelector(
      ".a-article-flowchart-dialog__copy-status",
    ).textContent,
    /Could not copy/,
  );
  assert.equal(fixture.dialog.code, draft);
  writeClipboard = async (text) => {
    copied.push(text);
  };
  await fixture.dialog.copyPrompt();
  await Vue.nextTick();
  assert.equal(fixture.dialog.copyState, "copied");
  assert.match(
    dom.window.document.querySelector(
      ".a-article-flowchart-dialog__copy-status",
    ).textContent,
    /AI prompt copied/,
  );
  let resolveCopy;
  writeClipboard = () =>
    new Promise((resolve) => {
      resolveCopy = resolve;
    });
  const stale = fixture.dialog.copyPrompt();
  fixture.props.definition = JSON.stringify({
    ...helpers.createArticleFlowchart(),
    title: "Another diagram",
  });
  await Vue.nextTick();
  resolveCopy();
  await stale;
  assert.equal(fixture.dialog.copyState, "");
  const closed = fixture.dialog.copyPrompt();
  fixture.props.active = false;
  await Vue.nextTick();
  resolveCopy();
  await closed;
  assert.equal(fixture.dialog.copyState, "");
  writeClipboard = async (text) => {
    copied.push(text);
  };
  await new Promise((resolve) => setImmediate(resolve));
  fixture.application.unmount();
});

test("compact rails fit one row when they can and otherwise balance their rows", () => {
  const { compactRailColumns, narrowThreshold, COMPACT_TILE, COMPACT_GAP } =
    flowHelpers;
  // 9 tiles of 84px with 20px gaps need 916px.
  assert.equal(compactRailColumns(9, 958), 9);
  assert.equal(compactRailColumns(9, 915), 5); // 8 fit, spread as 5 + 4
  assert.equal(compactRailColumns(9, 616), 5);
  assert.equal(compactRailColumns(10, 958), 5); // 9 fit, spread as 5 + 5
  assert.equal(compactRailColumns(9, 958, 6), 5); // a cap of 6 spreads as 5 + 4
  assert.equal(compactRailColumns(3, 2000), 3);
  assert.equal(compactRailColumns(0, 958), 1);
  const nodes = Array.from({ length: 9 }, (_, index) => ({
    id: `n${index}`,
    label: `Step ${index}`,
    description: "",
    icon: "",
    caption: "",
    outcome: null,
  }));
  const block = {
    type: "flow",
    title: "",
    description: "",
    animated: false,
    nodes,
    edges: nodes
      .slice(1)
      .map((node, index) => ({ from: nodes[index].id, to: node.id, label: "" })),
  };
  assert.equal(
    narrowThreshold(block, false, 9, true),
    9 * COMPACT_TILE + 8 * COMPACT_GAP,
  );
  assert.equal(narrowThreshold(block, false, 2, true), 480);
  // Article rails keep their readable 150px tiles and 40px gaps.
  assert.equal(narrowThreshold(block, false, 9), 9 * 150 + 8 * 40);
});
