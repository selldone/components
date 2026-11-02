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
  const filename = fileURLToPath(new URL("./SArticleFlow.vue", import.meta.url));
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
  const rtlRules = transformRules.filter((rule) => rule.selectorText.includes(":dir(rtl)"));
  const transforms = (element) => rtlRules
    .filter((rule) => element.matches(rule.selectorText))
    .map((rule) => rule.style.getPropertyValue("transform").replace(/\s/g, ""));
  const flow = doc.querySelector("section");
  assert.deepEqual(transforms(flow.querySelector(".api-doc-content__direction")), ["rotate(180deg)"]);
  assert.deepEqual(transforms(flow.querySelector(".api-doc-content__pill--end")), ["translate(0,-50%)"]);
  assert.deepEqual(transforms(flow.querySelector(".api-doc-content__pill:not(.api-doc-content__pill--end)")), ["translate(calc(-100%-8px),-50%)"]);
  for (const element of doc.querySelectorAll('section[dir="ltr"] span, body > span'))
    assert.deepEqual(transforms(element), [], "LTR flows and unrelated page content keep their own geometry.");
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
    { ...sample, edges: Array(13).fill(sample.edges[0]) },
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

test("the real article figure uses API Docs branching, outcomes and text explanation and excludes shop Blog", async () => {
  const flow = helpers.createArticleFlowchart();
  const app = configure(
    Vue.createSSRApp(Addon, { definition: flow, articleType: "help" }),
  );
  const output = new JSDOM(await renderToString(app)).window.document;
  assert.equal(output.querySelectorAll("article-flowchart").length, 1);
  assert.equal(output.querySelectorAll(".api-doc-content__tile").length, 4);
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
    { IntersectionObserver: Intersection, ResizeObserver: Resize },
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
  app.unmount();
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
