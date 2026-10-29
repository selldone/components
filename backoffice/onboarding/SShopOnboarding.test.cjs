const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} = require("@vue/compiler-sfc");
const ts = require("typescript");
const { JSDOM } = require("jsdom");

// Exercise the real shell; child editors and external destinations never run.
const filename = path.join(__dirname, "SShopOnboarding.vue");
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
  filename,
});
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "onboarding-workspace-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename,
  id: "onboarding-workspace-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);

function evaluate(code, globals) {
  const exports = {};
  const compiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  vm.runInNewContext(compiled.outputText, { exports, ...globals });
  return exports;
}

const childNames = [
  "SShopOnboardingCustomization",
  "ShopOnboardingSetupBusinessTab",
  "ShopOnboardingProductTab",
  "ShopOnboardingShippingTab",
  "ShopOnboardingDomainTab",
  "ShopOnboardingPaymentTab",
  "ShopOnboardingMigrationTab",
];
const stockKeys = ["physical", "virtual", "file", "service"];
const row = (values = {}) => ({
  ...Object.fromEntries(stockKeys.map((kind) => [`total_products_${kind}`, 0])),
  ...values,
});
const emptyShop = () => ({
  id: 42,
  title: "Test shop",
  name: "test-shop",
  icon: "test-icon",
  theme: {},
  model: null,
  warehouse: null,
  domains: [],
  shop_gateways: [],
});
const readyShop = () => ({
  ...emptyShop(),
  theme: { color: "#555" },
  model: "normal",
  warehouse: { location: { lat: 0, lng: 0 } },
  domains: [{ domain: "example.test", enable: true }],
  shop_gateways: [{ gateway: { cod: false, cash: false, dir: false } }],
});
const translate = (key) => key;

function load({
  children = [],
  buttons = [],
  progresses = [],
  storage = new Map(),
} = {}) {
  const wrapper = (tag = "div", capture = () => {}) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          capture(attrs);
          return Vue.h(tag, attrs, slots.default?.());
        },
    });
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name === "@selldone/core-js/helper")
      return {
        ShopURLs: {
          MainShopUrl: (shop) => `https://${shop.name}.example.test`,
        },
      };
    if (/\.(jpg|png|svg)$/.test(name)) return name;
    if (name.endsWith(".vue")) {
      const childName = path.basename(name, ".vue");
      if (!childNames.includes(childName)) {
        assert.equal(childName, "UFadeScroll");
        return { default: wrapper() };
      }
      return {
        default: Vue.defineComponent({
          name: childName,
          props: {
            shop: Object,
            timeSeries: Object,
            modern: { type: Boolean, default: false },
          },
          setup: (props, { attrs }) => () => {
            children.push({ name: childName, ...props, onAiBuild: attrs.onAiBuild });
            return Vue.h("div", { "data-editor": childName });
          },
        }),
      };
    }
    assert.fail(`Unexpected dependency: ${name}`);
  };
  const globals = {
    require: dependency,
    localStorage: { setItem: (key, value) => storage.set(key, value) },
  };
  return {
    component: evaluate(descriptor.script.content, globals).default,
    render: evaluate(template.code, globals).render,
    wrapper,
    buttons,
    progresses,
    storage,
  };
}

function optionsFixture({
  modern = true,
  shop = emptyShop(),
  daily = row(),
} = {}) {
  const loaded = load();
  const ticks = [],
    pushes = [];
  let detailFocus = 0;
  const state = {
    modern,
    shop,
    timeSeries: { lastDayData: () => daily },
    $t: translate,
    $refs: { setup_details: { focus: () => detailFocus++ } },
    $nextTick: (callback) => ticks.push(callback),
    $router: {
      push: (route) => pushes.push(JSON.parse(JSON.stringify(route))),
    },
  };
  Object.assign(state, loaded.component.data.call(state));
  for (const [key, getter] of Object.entries(loaded.component.computed))
    Object.defineProperty(state, key, { get: () => getter.call(state) });
  for (const [key, method] of Object.entries(loaded.component.methods))
    state[key] = method.bind(state);
  loaded.component.created.call(state);
  return { ...loaded, state, ticks, pushes, detailFocus: () => detailFocus };
}

async function renderFixture({
  modern = true,
  shop = readyShop(),
  daily = row({ total_products_physical: 1 }),
  tab,
} = {}) {
  const children = [],
    buttons = [],
    progresses = [];
  const routes = [];
  const emitted = [];
  const loaded = load({ children, buttons, progresses });
  const timeSeries = { lastDayData: () => daily };
  let context;
  const app = Vue.createSSRApp(
    {
      ...loaded.component,
      created() {
        loaded.component.created.call(this);
        if (tab !== undefined) this.tab = tab;
      },
      render(...args) {
        context = this;
        return loaded.render.apply(this, args);
      },
    },
    { modern, shop, timeSeries, onAiBuild: (...args) => emitted.push(args) },
  );
  Object.assign(app.config.globalProperties, {
    $t: translate,
    $vuetify: { display: { smAndUp: true } },
    getShopImagePath: () => "/fixture/shop.svg",
  });
  app.component(
    "v-window",
    Vue.defineComponent({
      props: ["modelValue"],
      setup:
        (props, { slots }) =>
        () => {
          const items = (slots.default?.() || []).filter(
            (item) => item.type !== Vue.Comment && item.type !== Vue.Text,
          );
          return Vue.h(
            "div",
            items.filter(
              (item, index) =>
                (item.props?.value ?? index) === props.modelValue,
            ),
          );
        },
    }),
  );
  app.component(
    "v-btn",
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          buttons.push(attrs);
          return Vue.h(attrs.href ? "a" : "button", { ...attrs, "data-test-action": buttons.length - 1 }, slots.default?.());
        },
    }),
  );
  app.component(
    "v-progress-linear",
    Vue.defineComponent({
      props: ["modelValue"],
      setup: (props) => () => {
        progresses.push({ modelValue: props.modelValue });
        return Vue.h("div");
      },
    }),
  );
  for (const name of [
    "v-icon",
    "v-window-item",
    "v-tabs",
    "v-tab",
    "v-row",
    "v-col",
    "v-avatar",
    "v-img",
    "v-chip",
    "v-card",
    "v-card-text",
    "v-card-actions",
    "v-list-subheader",
    "u-widget-header",
    "v-tooltip",
  ])
    app.component(
      name,
      loaded.wrapper(name === "v-icon" ? "span" : "div", (attrs) => {
        if (attrs.to) routes.push(attrs.to);
      }),
    );
  const html = await renderToString(app);
  return {
    ...loaded,
    html,
    children,
    emitted,
    routes,
    context,
    shop,
    timeSeries,
    document: new JSDOM(html).window.document,
  };
}

test("onboarding script, template and scoped Sass compile", async () => {
  assert.equal(load().component.props.modern.default, false);
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({
      source: style.content,
      filename,
      id: "onboarding-workspace-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(compiled.errors, []);
  }
});

test("the six completion predicates use shop state, including enabled domains and online gateways", () => {
  const empty = optionsFixture();
  assert.deepEqual(
    Array.from(empty.state.setup_steps, (step) => step.complete),
    [false, false, false, false, false, false],
  );
  assert.equal(empty.state.completed_steps, 0);
  assert.equal(empty.state.setup_progress, 0);
  const shop = readyShop();
  shop.domains[0].enable = false;
  shop.shop_gateways = ["cod", "cash", "dir"].map((flag) => ({
    gateway: { [flag]: true },
  }));
  const fixture = optionsFixture({
    shop,
    daily: row({ total_products_file: 2 }),
  });
  assert.deepEqual(
    Array.from(fixture.state.setup_steps, (step) => step.complete),
    [true, true, true, true, false, false],
  );
  shop.domains.push({ domain: "enabled.test", enable: true });
  assert.equal(fixture.state.completed_steps, 5);
  assert.equal(fixture.state.setup_progress, 83);
  assert.equal(fixture.state.next_setup_step, 5);
  shop.shop_gateways.push({ gateway: { cod: false, cash: false, dir: false } });
  assert.equal(fixture.state.completed_steps, 6);
  assert.equal(fixture.state.setup_progress, 100);
  assert.equal(fixture.state.next_setup_step, -1);
  shop.theme = {};
  shop.model = null;
  shop.warehouse = {};
  assert.deepEqual(
    Array.from(fixture.state.setup_steps, (step) => step.complete),
    [false, false, true, false, true, true],
  );
});

test("only the four native stock types complete Products; subscriptions and missing reports do not", () => {
  for (const kind of stockKeys)
    assert.equal(
      optionsFixture({ daily: row({ [`total_products_${kind}`]: 1 }) }).state
        .has_product,
      true,
    );
  assert.equal(
    optionsFixture({ daily: row({ total_products_subscription: 50 }) }).state
      .has_product,
    false,
  );
  assert.equal(optionsFixture({ daily: null }).state.has_product, false);
});

test("modern starts at the first real incomplete step and legacy retains its first tab", () => {
  const shop = readyShop();
  shop.domains[0].enable = false;
  const daily = row({ total_products_physical: 1 });
  assert.equal(optionsFixture({ shop, daily }).state.tab, 4);
  assert.equal(optionsFixture({ modern: false, shop, daily }).state.tab, 0);
  assert.equal(optionsFixture().state.tab, 0);
  assert.equal(optionsFixture({ shop: readyShop(), daily }).state.tab, 0);
});

test("all eight selections update the detail title and focus without manufacturing completion", () => {
  const fixture = optionsFixture();
  const before = JSON.stringify(fixture.state.shop);
  for (let tab = 0; tab < 8; tab++) {
    fixture.state.openSetupTab(tab);
    assert.equal(fixture.state.tab, tab);
    assert.equal(
      fixture.state.active_step_title,
      tab < 6
        ? fixture.state.setup_steps[tab].modern_label
        : tab === 6
          ? "onboarding.migration.title"
          : "onboarding.modern.overview",
    );
    assert.equal(fixture.state.completed_steps, 0);
    assert.equal(fixture.state.setup_progress, 0);
  }
  assert.equal(fixture.detailFocus(), 0);
  for (const tick of fixture.ticks) tick();
  assert.equal(fixture.detailFocus(), 8);
  assert.equal(JSON.stringify(fixture.state.shop), before);
  assert.equal(fixture.storage.size, 0);
});

test("Dismiss preserves the shop-local preference and native Dashboard route in both modes", () => {
  for (const modern of [false, true]) {
    const fixture = optionsFixture({ modern });
    fixture.state.dismiss();
    assert.deepEqual([...fixture.storage], [["shop:42-setup", "false"]]);
    assert.deepEqual(fixture.pushes, [
      { name: "BPageShopDashboard", hash: "" },
    ]);
  }
});

test("the eight native destinations retain their editors and original data in both modes", async () => {
  for (const modern of [false, true]) {
    for (let tab = 0; tab < 8; tab++) {
      const fixture = await renderFixture({ modern, tab });
      assert.deepEqual(
        fixture.children.map((child) => child.name),
        tab < 7 ? [childNames[tab]] : [],
      );
      if (tab < 7) {
        assert.equal(Vue.toRaw(fixture.children[0].shop), fixture.shop);
        assert.equal(
          Vue.toRaw(fixture.children[0].timeSeries),
          fixture.timeSeries,
        );
        assert.equal(fixture.children[0].modern, modern);
      }
    }
  }
});

test("modern customization forwards the requested AI path and original trigger event", async () => {
  const fixture = await renderFixture({ modern: true, tab: 0 });
  const event = { currentTarget: { id: "custom-layout-guide" } };
  for (const path of ["layout", "custom"])
    fixture.children[0].onAiBuild(path, event);
  assert.deepEqual(fixture.emitted.map((args) => args[0]), ["layout", "custom"]);
  assert.ok(fixture.emitted.every((args) => args[1] === event));
  const legacy = await renderFixture({ modern: false, tab: 0 });
  assert.equal(legacy.children[0].onAiBuild, undefined);
});

test("modern navigation exposes six real steps plus Migration and Overview with one selected destination", async () => {
  const shop = readyShop();
  shop.domains[0].enable = false;
  const fixture = await renderFixture({ shop });
  const steps = [
    ...fixture.document.querySelectorAll("nav button[aria-controls]"),
  ];
  assert.equal(steps.length, 8);
  assert.equal(
    steps.filter((button) => button.getAttribute("aria-pressed") === "true")
      .length,
    1,
  );
  assert.equal(steps[4].getAttribute("aria-pressed"), "true");
  assert.equal(fixture.progresses[0].modelValue, 83);
  assert.ok(
    fixture.document.getElementById(steps[4].getAttribute("aria-controls")),
  );
  const complete = await renderFixture();
  assert.equal(complete.progresses[0].modelValue, 100);
  assert.ok(
    complete.buttons.some(
      (button) => button.href === "https://test-shop.example.test",
    ),
  );
});

test("Overview retains seven direct tutorials, handbook, store and settings destinations", async () => {
  for (const modern of [false, true]) {
    const fixture = await renderFixture({ modern, tab: 7 });
    const tutorials = fixture.buttons.filter((button) =>
      button.href?.startsWith("https://youtu.be/"),
    );
    assert.equal(tutorials.length, 7);
    assert.deepEqual(
      tutorials.map((button) => button.href),
      [
        "https://youtu.be/mlw4KxlVFCc",
        "https://youtu.be/3j85CI2kRmY",
        "https://youtu.be/XpojjG8cbFk",
        "https://youtu.be/8iWXswJxQ7Q",
        "https://youtu.be/JIESHSJPdKM",
        "https://youtu.be/CqgZG3Vkf64",
        "https://youtu.be/Gj5svwRfo1A",
      ],
    );
    const resources = [
      ...tutorials,
      fixture.buttons.find(
        (button) =>
          button.href ===
          "https://selldone.com/gapi/books/Do-Your-Business-Like-A-Game.pdf",
      ),
    ];
    assert.ok(resources.every(Boolean));
    assert.ok(resources.every((button) => button.target === "_blank"));
    if (modern)
      assert.ok(
        resources.every((button) => button.rel === "noopener noreferrer"),
      );
    assert.ok(
      fixture.buttons.some(
        (button) => button.href === "https://test-shop.example.test",
      ),
    );
    assert.ok(
      [...fixture.buttons.map((button) => button.to), ...fixture.routes].some(
        (route) => route?.name === "BPageShopSettingInfo",
      ),
    );
    if (modern) {
      for (const [index, button] of fixture.buttons.entries()) {
        if (!button.to && !button.href) continue;
        assert.equal(button.target, "_blank");
        assert.equal(button.rel, "noopener noreferrer");
        assert.equal(button.variant, "text");
        assert.equal(button.color, "primary");
        assert.ok(button.class.includes("sd-modern-button--inline"));
        assert.ok(fixture.document.querySelector(`[data-test-action="${index}"]`).textContent.trim().endsWith("north_east"));
      }
    }
  }
});

test("related sections open in new tabs while native tab operations and legacy links stay in place", async () => {
  const destinations = {
    SetupBusiness: [
      { name: "BPageShopSettingBusinessModel", hash: "#add" },
      { name: "BPageShopSettingBusinessModel", hash: "#add" },
    ],
    Product: [
      { name: "BPageShopProductsList", hash: "#add" },
      { name: "BPageShopProductsList", hash: "#category" },
      { name: "BPageShopProductsList" },
    ],
    Shipping: [{ name: "BPageShopLogisticShipping" }],
    Domain: [{ name: "BPageShopSettingDomain" }],
    Payment: [
      { name: "BPageShopFinanceExchange" },
      ...Array.from({ length: 3 }, () => ({ name: "BPageShopFinanceGateways" })),
    ],
  };
  for (const [name, expected] of Object.entries(destinations)) {
    const file = path.join(__dirname, "tabs", `ShopOnboarding${name}Tab.vue`);
    const source = parse(readFileSync(file, "utf8"), { filename: file }).descriptor;
    const loaded = load();
    const dependency = (module) => {
      if (/\.(svg|jpg|png)$/.test(module)) return module;
      if (module.includes("CurrencyMixin")) return { default: { methods: { getCurrencyName: (code) => code } } };
      if (module.includes("SVGs")) return { default: {} };
      assert.ok(module.endsWith(".vue"));
      return { default: loaded.wrapper() };
    };
    const component = evaluate(source.script.content, { require: dependency }).default;
    assert.equal(component.props.modern.default, false);
    const compiled = compileTemplate({ source: source.template.content, filename: file, id: name });
    assert.deepEqual(compiled.errors, []);
    const render = evaluate(compiled.code, { require: (module) => module === "vue" ? Vue : dependency(module) }).render;
    for (const modern of [false, true]) {
      const buttons = [];
      let context;
      const app = Vue.createSSRApp({ ...component, render, created() { component.created?.call(this); context = this; } }, {
        modern, shop: { ...readyShop(), currencies: ["USD"] }, timeSeries: { lastDayData: () => row({ total_products_physical: 1 }) },
      });
      app.config.globalProperties.$t = translate;
      app.component("v-btn", Vue.defineComponent({ setup: (_, { attrs, slots }) => () => {
        buttons.push(attrs);
        return Vue.h("button", { ...attrs, "data-test-action": buttons.length - 1 }, slots.default?.());
      } }));
      app.component("v-dialog", Vue.defineComponent({ props: ["modelValue"], setup: (props, { slots }) => () => props.modelValue ? Vue.h("dialog", slots.default?.()) : null }));
      for (const tag of ["v-card", "v-card-text", "v-card-title", "v-card-actions", "v-list-subheader", "v-alert", "v-chip", "v-img", "v-icon", "u-widget-header"]) app.component(tag, loaded.wrapper());
      const document = new JSDOM(await renderToString(app)).window.document;
      const links = buttons.filter((button) => button.to || button.href);
      if (!modern) {
        assert.ok(links.every((button) => button.target === undefined));
        continue;
      }
      assert.deepEqual(JSON.parse(JSON.stringify(links.map((button) => button.to))), expected, `${name}: native routes and hashes`);
      for (const [index, button] of buttons.entries()) {
        if (!button.to && !button.href) {
          assert.equal(button.target, undefined);
          continue;
        }
        assert.equal(button.target, "_blank");
        assert.equal(button.rel, "noopener noreferrer");
        assert.equal(button.variant, "text");
        assert.equal(button.color, "primary");
        assert.ok(button.class.includes("sd-modern-button--inline"));
        assert.ok(document.querySelector(`[data-test-action="${index}"]`).textContent.trim().endsWith("north_east"));
      }
      if (["Product", "Shipping"].includes(name)) {
        const action = buttons.find((button) => !button.to && !button.href && button.onClick);
        action.onClick({});
        assert.equal(context[name === "Product" ? "dialog_sample" : "warehouse_dialog"], true);
      }
    }
    for (const style of source.styles) {
      const css = await compileStyleAsync({ source: style.content, filename: file, id: name, scoped: style.scoped, preprocessLang: style.lang });
      assert.deepEqual(css.errors, []);
    }
  }
});
