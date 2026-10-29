const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { compileScript, compileStyleAsync, compileTemplate, parse } = require("@vue/compiler-sfc");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

// All HTTP responses are disposable fixtures. Native template cards never deploy a page.
const filename = path.join(__dirname, "SShopOnboardingCustomization.vue");
function evaluate(code, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  vm.runInNewContext(compiled.outputText, { exports, ...globals });
  return exports;
}
function translator(locale) {
  const messages = Object.fromEntries(["onboarding", "global"].map((name) => [name,
    evaluate(readFileSync(path.resolve(__dirname, `../../../../translate/${name === "onboarding" ? "service/onboarding" : "global"}/${locale}.ts`), "utf8"), { require: () => ({ default: {} }) }).default,
  ]));
  return (key, values = {}) => {
    const value = key.split(".").reduce((current, segment) => current?.[segment], messages);
    assert.equal(typeof value, "string", `Missing ${locale} message: ${key}`);
    return value.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
  };
}
const rows = () => [
  { id: 101, name: "Actual free template", image: "free.svg", preview: "https://preview.example.test/free", premium: false },
  { id: 202, name: "Actual premium template", image: "premium.svg", preview: "https://preview.example.test/premium", premium: true },
  { id: 303, name: "More cached templates", image: "more.svg", premium: false },
];
function fixture({ cached = rows(), response, failure } = {}) {
  const requests = [], alerts = [], children = [], buttons = [], cards = [], emitted = [];
  let resolveResponse;
  const pending = new Promise((resolve) => { resolveResponse = resolve; });
  const window = { GAPI: { GET_PAGE_BUILDER_TEMPLATES: () => "/fixture/templates" } };
  if (cached !== null) window.CACHED_HOT_TEMPLATES = cached;
  const globals = {
    window,
    axios: {
      get(url, options) {
        requests.push({ url, options });
        return failure ? Promise.reject(failure) : response ? Promise.resolve(response) : pending;
      },
    },
  };
  const wrapper = (name, tag = "div") => Vue.defineComponent({
    inheritAttrs: false,
    setup: (_, { attrs, slots }) => () => {
      const content = slots.default?.();
      if (name === "VBtn") buttons.push({ ...attrs, content });
      if (name === "VCard") cards.push(attrs);
      return Vue.h(tag, { ...attrs, ...(name === "VBtn" ? { "data-test-action": buttons.length - 1 } : {}) }, content);
    },
  });
  function dependency(name) {
    if (name === "vue") return Vue;
    if (/\.(svg|jpg|png)$/.test(name)) return name;
    if (name.includes("NotificationService")) return { default: {
      showErrorAlert: (...args) => alerts.push(["error", ...args]),
      showLaravelError: (error) => alerts.push(["laravel", error]),
    } };
    if (name.includes("BEventBusMixin")) return { BEventBusMixin: {} };
    if (name.endsWith("LTemplateCard.vue")) {
      const native = load(path.resolve(__dirname, "../../../../page-builder/components/templates/card/LTemplateCard.vue")).component;
      return { default: { ...native, created() {
        native.created?.call(this);
        children.push({ name: "LTemplateCard", template: Vue.toRaw(this.template) });
      } } };
    }
    if (name.endsWith(".vue")) {
      const child = path.basename(name, ".vue");
      return { default: Vue.defineComponent({
        name: child, props: ["shop", "color"],
        setup: (props, { slots }) => () => {
          children.push({ name: child, ...props });
          return Vue.h("div", { "data-child": child }, slots.default?.());
        },
      }) };
    }
    assert.fail(`Unexpected dependency: ${name}`);
  }
  function load(file) {
    const parsed = parse(readFileSync(file, "utf8"), { filename: file });
    assert.deepEqual(parsed.errors, []);
    const { descriptor } = parsed;
    const script = compileScript(descriptor, { id: "customization-test" });
    const component = evaluate(script.content, { ...globals, require: dependency }).default;
    const template = compileTemplate({ source: descriptor.template.content, filename: file, id: "customization-test", compilerOptions: { bindingMetadata: script.bindings } });
    assert.deepEqual(template.errors, []);
    component.render = evaluate(template.code, { ...globals, require: (name) => name === "vue" ? Vue : dependency(name) }).render;
    return { component, descriptor };
  }
  const loaded = load(filename);
  function state(extra = {}) {
    const state = { modern: true, shop: { id: 42, theme: {} }, timeSeries: {}, ...extra };
    Object.assign(state, loaded.component.data.call(state));
    for (const [key, method] of Object.entries(loaded.component.methods || {})) state[key] = method.bind(state);
    for (const [key, getter] of Object.entries(loaded.component.computed || {})) Object.defineProperty(state, key, { get: () => getter.call(state) });
    return state;
  }
  async function render({ modern = true, locale = "en", premium = false } = {}) {
    buttons.length = cards.length = children.length = 0;
    let context;
    const shop = { id: 42, theme: { color_light: "#112233", color_dark: "#223344", color_deep_dark: "#334455" } };
    const app = Vue.createSSRApp({ ...loaded.component,
      created() {
        loaded.component.created.call(this);
        context = this;
      },
    }, { modern, shop, timeSeries: {}, onAiBuild: (...args) => emitted.push(args) });
    Object.assign(app.config.globalProperties, {
      $t: translator(locale), $route: { params: { shop_id: shop.id } },
      USER: () => ({ premium }), showNeedSubscribePremium: () => alerts.push(["premium"]),
      getShopImagePath: (image) => `/fixture/${image}`,
    });
    for (const [name, tag] of Object.entries({ VCard: "article", VCardText: "div", VCardTitle: "h3", VCardActions: "div", VBtn: "button", VIcon: "span", VImg: "div", VChip: "span", VProgressCircular: "span", VProgressLinear: "span", ULoadingProgress: "span" })) app.component(name, wrapper(name, tag));
    const html = await renderToString(app);
    return { html, document: new JSDOM(html).window.document, context, shop };
  }
  return { ...loaded, requests, alerts, children, buttons, cards, emitted, window, state, render, resolveResponse, settle: () => new Promise(setImmediate) };
}

test("customization script/template/scoped Sass compile; legacy remains the default", async () => {
  const f = fixture();
  assert.equal(f.component.props.modern.default, false);
  for (const style of f.descriptor.styles) {
    const compiled = await compileStyleAsync({ source: style.content, filename, id: "customization-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(compiled.errors, []);
  }
});

test("native hot templates use cached real records without another request", () => {
  for (const cached of [rows(), []]) {
    const f = fixture({ cached });
    const state = f.state();
    f.component.created.call(state);
    assert.equal(state.templates, cached);
    assert.equal(state.busy_fetch, false);
    assert.equal(f.requests.length, 0);
  }
});

test("bounded template loading caches successful records and always clears loading", async () => {
  const f = fixture({ cached: null });
  const state = f.state();
  f.component.created.call(state);
  assert.equal(state.busy_fetch, true);
  assert.equal(state.templates.length, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(f.requests)), [{ url: "/fixture/templates", options: { params: { hot: true, limit: 10 } } }]);
  const templates = rows();
  f.resolveResponse({ data: { templates } });
  await f.settle();
  assert.equal(state.templates, templates);
  assert.equal(f.window.CACHED_HOT_TEMPLATES, templates);
  assert.equal(state.busy_fetch, false);
  assert.deepEqual(f.alerts, []);
});

test("failed reads keep native errors visible without inventing templates or cache", async () => {
  const error = new Error("Fixture read failed");
  for (const options of [{ response: { data: { error: true, error_msg: "Fixture denied" } } }, { failure: error }]) {
    const f = fixture({ cached: null, ...options });
    const state = f.state();
    f.component.created.call(state);
    await f.settle();
    assert.equal(state.busy_fetch, false);
    assert.equal(state.templates.length, 0);
    assert.equal(f.window.CACHED_HOT_TEMPLATES, undefined);
    assert.deepEqual(f.alerts, options.failure ? [["laravel", error]] : [["error", null, "Fixture denied"]]);
  }
});

test("EN/FA modern levels expose the real builder, settings and matching repositories", async () => {
  for (const locale of ["en", "fa"]) {
    const f = fixture();
    const screen = await f.render({ locale });
    assert.equal(screen.document.querySelectorAll("article[aria-labelledby]").length, 3);
    const repositories = [...screen.document.querySelectorAll("a[href]")];
    assert.deepEqual(repositories.map((link) => link.getAttribute("href")), [
      "https://github.com/selldone/storefront",
      "https://github.com/pajuhaan/selldone-custom-storefront-backoffice-1",
    ]);
    assert.ok(repositories.every((link) => link.target === "_blank" && link.rel === "noopener noreferrer"));
    const browse = f.buttons.find((button) => button.to?.name === "LandingTemplatesListPage");
    assert.ok(browse);
    assert.equal(browse.target, "_blank");
    assert.equal(browse.rel, "noopener noreferrer");
    assert.ok(f.buttons.some((button) => button.to?.name === "BPageShopSettingTheme"));
    const builder = f.buttons.find((button) => button.to?.name === "BPageLandingEditor");
    assert.deepEqual(JSON.parse(JSON.stringify(builder.to)), { name: "BPageLandingEditor", params: { page_id: "new" } });
    assert.deepEqual(f.children.filter((child) => child.name === "UColorCircle").map((child) => child.color), ["#112233", "#223344", "#334455"]);
    for (const [index, button] of f.buttons.entries()) {
      if (!button.to && !button.href) {
        assert.equal(button.target, undefined, "AI guide actions stay in the current workspace");
        continue;
      }
      assert.equal(button.target, "_blank");
      assert.equal(button.rel, "noopener noreferrer");
      assert.equal(button.variant, "text");
      assert.equal(button.color, "primary");
      assert.ok(button.class.includes("sd-modern-button--inline"));
      assert.ok(screen.document.querySelector(`[data-test-action="${index}"]`).textContent.trim().endsWith("north_east"));
    }
    assert.equal(f.requests.length, 0);
  }
});

test("the two AI actions forward their exact path and original trigger event", async () => {
  const f = fixture();
  await f.render();
  const buttons = f.buttons.filter((button) => button["aria-haspopup"] === "dialog");
  assert.equal(buttons.length, 2);
  const event = Object.freeze({ currentTarget: { id: "fixture-ai-action" } });
  for (const button of buttons) button.onClick(event);
  assert.deepEqual(f.emitted.map((args) => args[0]), ["layout", "custom"]);
  assert.ok(f.emitted.every((args) => args[1] === event));
  assert.equal(f.requests.length, 0);
});

test("compact previews use the first two actual records and direct native preview links", async () => {
  const templates = rows();
  const f = fixture({ cached: templates });
  const screen = await f.render();
  assert.ok(screen.html.includes(templates[0].name) && screen.html.includes(templates[1].name));
  assert.equal(screen.html.includes(templates[2].name), false);
  const previews = f.buttons.filter((button) => button.href);
  assert.deepEqual(previews.map((button) => button.href), templates.slice(0, 2).map((row) => row.preview));
  assert.ok(previews.every((button) => button.target === "_blank" && button.rel === "noopener noreferrer"));
  assert.equal(f.children.filter((child) => child.name === "LTemplateCard").length, 0);
  assert.equal(Vue.toRaw(screen.context.templates), templates);
  assert.equal(screen.document.querySelectorAll("dialog").length, 0);
  assert.deepEqual(f.alerts, []);
});

test("legacy retains every native template card, current-shop deploy routes and Premium gate", async () => {
  const templates = rows();
  for (const premium of [false, true]) {
    const f = fixture({ cached: templates });
    const screen = await f.render({ modern: false, premium });
    const cards = f.children.filter((child) => child.name === "LTemplateCard");
    assert.deepEqual(cards.map((child) => child.template), templates);
    assert.ok(cards.every((child, index) => child.template === templates[index]));
    const tour = f.children.find((child) => child.name === "BShopOnboardingTour");
    assert.equal(Vue.toRaw(tour.shop), screen.shop);
    const deploy = f.buttons.filter((button) => button.to?.name === "BPageLandingEditor");
    assert.deepEqual(deploy.map((button) => button.to.query.template_id), premium ? [101, 202, 303] : [101, 303]);
    assert.ok(deploy.every((button) => button.to.params.page_id === "new"));
    assert.ok(f.buttons.some((button) => button.to?.name === "LandingTemplatesListPage"));
    assert.ok(f.buttons.some((button) => button.to?.name === "BPageShopSettingTheme"));
    assert.equal(screen.html.includes("onboarding-customize-layout"), false);
    if (!premium) {
      const paid = f.cards.filter((card) => card.class?.includes("rounded-2rem"))[1];
      paid.onClick();
      assert.deepEqual(f.alerts, [["premium"]]);
    }
    assert.equal(f.requests.length, 0);
  }
});

test("loading and empty reports retain real launch destinations without placeholder templates", async () => {
  const loading = fixture({ cached: null });
  const pending = await loading.render();
  assert.ok(pending.document.querySelector('[role="status"]'));
  assert.equal(pending.html.includes("Actual free template"), false);
  assert.equal(loading.requests.length, 1);
  loading.resolveResponse({ data: { templates: [] } });
  await loading.settle();
  for (const modern of [false, true]) {
    const empty = fixture({ cached: [] });
    const screen = await empty.render({ modern });
    assert.equal(screen.document.querySelector('[role="status"]'), null);
    assert.equal(empty.children.some((child) => child.name === "LTemplateCard"), false);
    assert.ok(empty.buttons.some((button) => button.to?.name === "LandingTemplatesListPage"));
    assert.ok(empty.buttons.some((button) => button.to?.name === "BPageShopSettingTheme"));
    assert.equal(empty.requests.length, 0);
  }
});
