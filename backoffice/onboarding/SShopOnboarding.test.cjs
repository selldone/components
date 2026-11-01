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
  "ShopOnboardingAiTab",
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
            connection: Object,
            loading: Boolean,
            error: Boolean,
          },
          setup:
            (props, { attrs }) =>
            () => {
              children.push({
                name: childName,
                ...props,
                onAiBuild: attrs.onAiBuild,
                onRefresh: attrs.onRefresh,
              });
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
  aiConnection = null,
  aiLoading = false,
  aiError = false,
} = {}) {
  const loaded = load();
  const ticks = [],
    pushes = [];
  let detailFocus = 0;
  const state = {
    modern,
    shop,
    aiConnection,
    aiLoading,
    aiError,
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
  aiConnection = null,
  aiLoading = false,
  aiError = false,
} = {}) {
  const children = [],
    buttons = [],
    progresses = [];
  const routes = [];
  const emitted = [];
  const refreshes = [];
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
    {
      modern,
      shop,
      timeSeries,
      aiConnection,
      aiLoading,
      aiError,
      onAiBuild: (...args) => emitted.push(args),
      onRefreshAi: () => refreshes.push(true),
    },
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
          return Vue.h(
            attrs.href ? "a" : "button",
            { ...attrs, "data-test-action": buttons.length - 1 },
            slots.default?.(),
          );
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
    refreshes,
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
  const empty = optionsFixture({ modern: false });
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
    modern: false,
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
  assert.equal(
    optionsFixture({ shop, daily, aiConnection: { active_connections: 1 } })
      .state.tab,
    4,
  );
  assert.equal(optionsFixture({ modern: false, shop, daily }).state.tab, 0);
  assert.equal(optionsFixture().state.tab, 8);
  assert.equal(optionsFixture({ shop: readyShop(), daily }).state.tab, 8);
  assert.equal(
    optionsFixture({
      shop: readyShop(),
      daily,
      aiConnection: { active_connections: 1 },
    }).state.tab,
    0,
  );
});

test("all modern destinations update the detail title and focus without manufacturing completion", () => {
  const fixture = optionsFixture();
  const before = JSON.stringify(fixture.state.shop);
  for (const tab of [8, 0, 1, 2, 3, 4, 5, 6, 7]) {
    fixture.state.openSetupTab(tab);
    assert.equal(fixture.state.tab, tab);
    assert.equal(
      fixture.state.active_step_title,
      tab < 6 || tab === 8
        ? fixture.state.setup_steps.find((step) => step.value === tab)
            .modern_label
        : tab === 6
          ? "onboarding.migration.title"
          : "onboarding.modern.overview",
    );
    assert.equal(fixture.state.completed_steps, 0);
    assert.equal(fixture.state.setup_progress, 0);
  }
  assert.equal(fixture.detailFocus(), 0);
  for (const tick of fixture.ticks) tick();
  assert.equal(fixture.detailFocus(), 9);
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
  assert.deepEqual(
    fixture.emitted.map((args) => args[0]),
    ["layout", "custom"],
  );
  assert.ok(fixture.emitted.every((args) => args[1] === event));
  const legacy = await renderFixture({ modern: false, tab: 0 });
  assert.equal(legacy.children[0].onAiBuild, undefined);
});

test("modern navigation exposes seven real steps plus Migration and Overview with one selected destination", async () => {
  const shop = readyShop();
  shop.domains[0].enable = false;
  const fixture = await renderFixture({
    shop,
    aiConnection: { active_connections: 1 },
  });
  const steps = [
    ...fixture.document.querySelectorAll("nav button[aria-controls]"),
  ];
  assert.equal(steps.length, 9);
  assert.equal(
    steps.filter((button) => button.getAttribute("aria-pressed") === "true")
      .length,
    1,
  );
  assert.equal(steps[5].getAttribute("aria-pressed"), "true");
  assert.equal(fixture.progresses[0].modelValue, 86);
  assert.ok(
    fixture.document.getElementById(steps[5].getAttribute("aria-controls")),
  );
  const complete = await renderFixture({
    aiConnection: { active_connections: 1 },
  });
  assert.equal(complete.progresses[0].modelValue, 100);
  assert.ok(
    complete.buttons.some(
      (button) => button.href === "https://test-shop.example.test",
    ),
  );
});

test("AI completion uses only a real nonnegative active-connection count and keeps unknown distinct", async () => {
  const shop = readyShop(),
    daily = row({ total_products_physical: 1 });
  for (const aiConnection of [
    null,
    {},
    { mcp_url: "https://example.test/mcp/42" },
    { active_connections: null },
    { active_connections: "1" },
    { active_connections: -1 },
    { active_connections: 1.5 },
    { active_connections: NaN },
  ]) {
    const fixture = optionsFixture({ shop, daily, aiConnection });
    assert.equal(fixture.state.ai_complete, null);
    assert.equal(fixture.state.setup_steps.length, 7);
    assert.equal(fixture.state.completed_steps, 6);
    assert.equal(fixture.state.setup_progress, 86);
    assert.equal(fixture.state.tab, 8);
  }
  for (const aiLoading of [false, true])
    for (const aiError of [false, true]) {
      const known = optionsFixture({
        shop,
        daily,
        aiConnection: { active_connections: 1 },
        aiLoading,
        aiError,
      });
      assert.equal(
        known.state.ai_complete,
        true,
        "same-scope refresh keeps the last valid projection",
      );
      assert.equal(known.state.setup_progress, 100);
      const missing = optionsFixture({
        shop,
        daily,
        aiConnection: null,
        aiLoading,
        aiError,
      });
      assert.equal(missing.state.ai_complete, null);
    }
  const zero = optionsFixture({
    shop,
    daily,
    aiConnection: { active_connections: 0 },
  });
  assert.equal(zero.state.ai_complete, false);
  assert.equal(zero.state.completed_steps, 6);

  const unknown = await renderFixture({ aiConnection: null, aiLoading: true });
  assert.ok(
    unknown.document
      .querySelector(".s--shop-onboarding__detail-header")
      .textContent.includes("onboarding.modern.ai.status_unknown"),
  );
  const empty = await renderFixture({
    aiConnection: { active_connections: 0 },
    tab: 8,
  });
  assert.ok(
    empty.document
      .querySelector(".s--shop-onboarding__detail-header")
      .textContent.includes("onboarding.modern.to_do"),
  );
});

test("AI is the first modern entry with stable tab values and unchanged legacy setup", async () => {
  const modern = optionsFixture();
  assert.deepEqual(
    Array.from(modern.state.setup_steps, (step) => step.value),
    [8, 0, 1, 2, 3, 4, 5],
  );
  for (let value = 0; value < 6; value++)
    assert.equal(
      modern.state.setup_steps.find((step) => step.value === value).guide,
      `onboarding.modern.guide_${value}`,
    );
  const legacy = optionsFixture({
    modern: false,
    aiConnection: { active_connections: 0 },
  });
  assert.deepEqual(
    Array.from(legacy.state.setup_steps, (step) => step.value),
    [0, 1, 2, 3, 4, 5],
  );
  assert.equal(legacy.state.tab, 0);
  const rendered = await renderFixture({ modern: false });
  assert.ok(!rendered.html.includes("onboarding.modern.step_ai"));
  assert.ok(
    !rendered.children.some((child) => child.name === "ShopOnboardingAiTab"),
  );
});

test("AI receives the bounded current context and refresh emits without manufacturing completion", async () => {
  const aiConnection = {
    active_connections: 0,
    mcp_url: "https://example.test/mcp/42",
  };
  const fixture = await renderFixture({
    aiConnection,
    aiLoading: true,
    aiError: true,
    tab: 8,
  });
  const child = fixture.children.find(
    (item) => item.name === "ShopOnboardingAiTab",
  );
  assert.ok(child);
  assert.equal(Vue.toRaw(child.shop), fixture.shop);
  assert.equal(Vue.toRaw(child.connection), aiConnection);
  assert.equal(child.loading, true);
  assert.equal(child.error, true);
  child.onRefresh();
  assert.deepEqual(fixture.refreshes, [true]);
  assert.equal(fixture.context.completed_steps, 6);
  assert.equal(aiConnection.active_connections, 0);

  const state = optionsFixture().state;
  assert.equal(state.tab, 8);
  state.aiConnection = { active_connections: 1 };
  assert.equal(state.ai_complete, true);
  assert.equal(
    state.tab,
    8,
    "loading a connection never moves the user's selected tab",
  );
  state.openSetupTab(3);
  state.aiLoading = true;
  state.aiError = true;
  assert.equal(state.tab, 3);
  assert.equal(state.ai_complete, true);
  state.aiConnection = null;
  assert.equal(state.ai_complete, null);
  assert.equal(state.tab, 3, "scope/reset data does not navigate implicitly");
});

test("Continue and Overview guide actions navigate by explicit values after AI is prepended", async () => {
  for (const aiConnection of [null, { active_connections: 1 }]) {
    const shop = readyShop();
    shop.domains[0].enable = false;
    const fixture = await renderFixture({ shop, aiConnection });
    const button = [
      ...fixture.document.querySelectorAll("[data-test-action]"),
    ].find((item) => item.textContent.includes("global.actions.continue"));
    assert.ok(button);
    fixture.buttons[Number(button.getAttribute("data-test-action"))].onClick();
    assert.equal(fixture.context.tab, aiConnection ? 4 : 8);
  }
  const overview = await renderFixture({ tab: 7 });
  for (const [label, value] of [
    ["onboarding.modern.step_ai", 8],
    ["onboarding.modern.step_customize", 0],
    ["onboarding.modern.step_domain", 4],
  ]) {
    const row = [
      ...overview.document.querySelectorAll(
        ".s--shop-onboarding__resource-row",
      ),
    ].find((item) => item.querySelector("strong")?.textContent === label);
    assert.ok(row);
    const button = row.querySelector("[data-test-action]");
    overview.buttons[Number(button.getAttribute("data-test-action"))].onClick();
    assert.equal(overview.context.tab, value);
  }
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
        assert.ok(
          fixture.document
            .querySelector(`[data-test-action="${index}"]`)
            .textContent.trim()
            .endsWith("north_east"),
        );
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
      ...Array.from({ length: 3 }, () => ({
        name: "BPageShopFinanceGateways",
      })),
    ],
  };
  for (const [name, expected] of Object.entries(destinations)) {
    const file = path.join(__dirname, "tabs", `ShopOnboarding${name}Tab.vue`);
    const source = parse(readFileSync(file, "utf8"), {
      filename: file,
    }).descriptor;
    const loaded = load();
    const dependency = (module) => {
      if (module === "vue") return Vue;
      if (/\.(svg|jpg|png)$/.test(module)) return module;
      if (module.includes("CurrencyMixin"))
        return { default: { methods: { getCurrencyName: (code) => code } } };
      if (module.includes("SVGs")) return { default: {} };
      assert.ok(module.endsWith(".vue"));
      return { default: loaded.wrapper() };
    };
    const component = evaluate(source.script.content, {
      require: dependency,
    }).default;
    assert.equal(component.props.modern.default, false);
    const compiled = compileTemplate({
      source: source.template.content,
      filename: file,
      id: name,
    });
    assert.deepEqual(compiled.errors, []);
    const render = evaluate(compiled.code, {
      require: (module) => (module === "vue" ? Vue : dependency(module)),
    }).render;
    for (const modern of [false, true]) {
      const buttons = [];
      let context;
      const app = Vue.createSSRApp(
        {
          ...component,
          render,
          created() {
            component.created?.call(this);
            context = this;
          },
        },
        {
          modern,
          shop: { ...readyShop(), currencies: ["USD"] },
          timeSeries: {
            lastDayData: () => row({ total_products_physical: 1 }),
          },
        },
      );
      app.config.globalProperties.$t = translate;
      app.component(
        "v-btn",
        Vue.defineComponent({
          setup:
            (_, { attrs, slots }) =>
            () => {
              buttons.push(attrs);
              return Vue.h(
                "button",
                { ...attrs, "data-test-action": buttons.length - 1 },
                slots.default?.(),
              );
            },
        }),
      );
      app.component(
        "v-dialog",
        Vue.defineComponent({
          props: ["modelValue"],
          setup:
            (props, { slots }) =>
            () =>
              props.modelValue ? Vue.h("dialog", slots.default?.()) : null,
        }),
      );
      for (const tag of [
        "v-card",
        "v-card-text",
        "v-card-title",
        "v-card-actions",
        "v-list-subheader",
        "v-alert",
        "v-chip",
        "v-img",
        "v-icon",
        "u-widget-header",
      ])
        app.component(tag, loaded.wrapper());
      const document = new JSDOM(await renderToString(app)).window.document;
      const links = buttons.filter((button) => button.to || button.href);
      if (!modern) {
        assert.ok(links.every((button) => button.target === undefined));
        continue;
      }
      assert.deepEqual(
        JSON.parse(JSON.stringify(links.map((button) => button.to))),
        expected,
        `${name}: native routes and hashes`,
      );
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
        assert.ok(
          document
            .querySelector(`[data-test-action="${index}"]`)
            .textContent.trim()
            .endsWith("north_east"),
        );
      }
      if (["Product", "Shipping"].includes(name)) {
        const action = buttons.find(
          (button) => !button.to && !button.href && button.onClick,
        );
        action.onClick({});
        assert.equal(
          context[name === "Product" ? "dialog_sample" : "warehouse_dialog"],
          true,
        );
      }
    }
    for (const style of source.styles) {
      const css = await compileStyleAsync({
        source: style.content,
        filename: file,
        id: name,
        scoped: style.scoped,
        preprocessLang: style.lang,
      });
      assert.deepEqual(css.errors, []);
    }
  }
});

// Mount the real domain entry and Guided form together. Only UI leaves and
// external permissions/requests are isolated; helper ownership stays real.
async function domainFixture(options = {}) {
  const { modern = true, locale = "en" } = options;
  const domains = Object.hasOwn(options, "domains") ? options.domains : [];
  const root = path.resolve(__dirname, "../../..");
  const requests = [],
    forms = [],
    dialogs = [],
    failures = [];
  const document = new JSDOM("<main></main>").window.document;
  const shop = Vue.ref({
    ...emptyShop(),
    domains,
    hash_id: "test-ownership",
    custom_ips: ["203.0.113.10"],
    custom_ips_ssl_proxy: [],
    custom_cnames: ["shops.example.test"],
  });
  const leaf = Vue.defineComponent({
    inheritAttrs: false,
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("div", [slots.activator?.({ props: {} }), slots.default?.()]),
  });
  const globals = {
    window: {
      API: { POST_ADD_DOMAIN: (id) => `/isolated/shops/${id}/domains` },
      CDN: { GET_SHOP_IMAGE_PATH: () => "/isolated-shop.svg" },
    },
    axios: {
      post: (url, payload) =>
        new Promise((resolve, reject) =>
          requests.push({
            url,
            payload,
            resolve: (data) => resolve({ data }),
            reject,
          }),
        ),
      get: () => assert.fail("Opening or navigating Guided must not fetch DNS"),
      put: () => assert.fail("The onboarding entry must not edit a domain"),
    },
  };
  const sources = [];
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("NotificationService"))
      return {
        default: {
          showSuccessAlert() {},
          showErrorAlert() {},
          showLaravelError() {},
        },
      };
    if (name.endsWith("/GlobalRules"))
      return {
        default: {
          ValidateDomain: (value) =>
            typeof value === "string" &&
            value.includes(".") &&
            !value.includes(" "),
          required: () => (value) => !!value,
        },
      };
    if (name.includes("/ShopLicense"))
      return {
        Eligible: {
          CanAddNewDomain: () => true,
          CanEditDomain: () => true,
        },
      };
    if (name.includes("/ShopPermissions"))
      return { ShopPermissionRegions: { SETTINGS: { code: "SETTINGS" } } };
    if (name.endsWith("BDomainAdd.vue"))
      return {
        default: loadDomainComponent(
          path.join(__dirname, "../domain/add/BDomainAdd.vue"),
          true,
        ),
      };
    if (name.endsWith(".vue")) return { default: leaf };
    if (/\.(svg|png|jpg)$/.test(name)) return "/isolated-asset.svg";
    assert.fail(`Unexpected domain dependency: ${name}`);
  };
  function loadDomainComponent(file, capture = false) {
    const parsed = parse(readFileSync(file, "utf8"), { filename: file });
    assert.deepEqual(parsed.errors, []);
    const source = parsed.descriptor;
    sources.push(source);
    const compiledScript = compileScript(source, {
      id: "onboarding-domain-test",
    });
    const component = evaluate(compiledScript.content, {
      ...globals,
      require: dependency,
    }).default;
    const compiled = compileTemplate({
      source: source.template.content,
      filename: file,
      id: "onboarding-domain-test",
      compilerOptions: { bindingMetadata: compiledScript.bindings },
    });
    assert.deepEqual(compiled.errors, []);
    component.render = evaluate(compiled.code, {
      ...globals,
      require: dependency,
    }).render;
    if (capture) {
      const created = component.created;
      component.created = function () {
        created?.call(this);
        forms.push(this);
      };
    }
    return component;
  }
  const entry = loadDomainComponent(
    path.join(__dirname, "tabs/ShopOnboardingDomainTab.vue"),
  );
  const core = evaluate(
    readFileSync(path.join(root, "components-vue/mixin/CoreMixin.ts"), "utf8"),
    {
      ...globals,
      require: () => ({}),
    },
  ).default;
  const dictionary = (file) =>
    evaluate(
      readFileSync(path.join(root, `translate/${file}/${locale}.ts`), "utf8"),
      {
        require: () => ({}),
      },
    ).default;
  const messages = {
    ...dictionary("dashboard"),
    global: dictionary("global"),
    onboarding: dictionary("service/onboarding"),
  };
  const t = (key) =>
    key.split(".").reduce((value, part) => value?.[part], messages) ?? key;
  const renderer = Vue.createRenderer({
    createElement: (tag) => document.createElement(tag),
    createText: (text) => document.createTextNode(text),
    createComment: (text) => document.createComment(text),
    setText: (node, text) => {
      node.nodeValue = text;
    },
    setElementText: (node, text) => {
      node.textContent = text;
    },
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    insert: (node, parent, anchor = null) => parent.insertBefore(node, anchor),
    remove: (node) => node.parentNode?.removeChild(node),
    patchProp: (node, key, previous, value) => {
      if (/^on[A-Z]/.test(key)) {
        node.handlers ||= {};
        node.handlers[key] = value;
      } else if (key === "style" && value && typeof value === "object")
        Object.assign(node.style, value);
      else if (value == null || value === false) node.removeAttribute(key);
      else node.setAttribute(key, String(value));
    },
  });
  let context;
  const app = renderer.createApp({
    render: () =>
      Vue.h(entry, {
        ref: (value) => {
          context = value;
        },
        modern,
        shop: shop.value,
        timeSeries: {},
      }),
  });
  app.mixin(core);
  Object.assign(app.config.globalProperties, {
    $t: t,
    $n: (value) => new Intl.NumberFormat(locale).format(value),
    $vuetify: { locale: { isRtl: locale === "fa" } },
    writeShopAccess: () => true,
    GlobalRules: dependency("/GlobalRules").default,
  });
  const wrapper = (tag) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () =>
          Vue.h(tag, attrs, [
            slots.activator?.({ props: {} }),
            slots.default?.(),
          ]),
    });
  const tags = new Set(
    sources.flatMap((source) =>
      [
        ...source.template.content.matchAll(/<(v-[\w-]+|u-[\w-]+|s-[\w-]+)/g),
      ].map((match) => match[1]),
    ),
  );
  for (const name of tags)
    if (!["v-btn", "v-icon", "v-dialog"].includes(name))
      app.component(name, wrapper("div"));
  app.component("v-btn", wrapper("button"));
  app.component("v-icon", wrapper("span"));
  app.component(
    "v-dialog",
    Vue.defineComponent({
      inheritAttrs: false,
      props: ["modelValue", "persistent"],
      setup(props, { attrs, slots }) {
        dialogs.push({ props, attrs });
        return () =>
          Vue.h(Vue.Fragment, [
            slots.activator?.({
              props: { onClick: () => attrs["onUpdate:modelValue"](true) },
            }),
            props.modelValue
              ? Vue.h("div", { "data-domain-dialog": "" }, slots.default?.())
              : null,
          ]);
      },
    }),
  );
  app.config.warnHandler = (message) => {
    throw Error(message);
  };
  app.config.errorHandler = (error) => failures.push(error);
  app.mount(document.querySelector("main"));
  const tick = async () => {
    await Vue.nextTick();
    await Promise.resolve();
    await Vue.nextTick();
    assert.deepEqual(
      failures,
      [],
      "render errors and rejected handlers must fail the test",
    );
  };
  await tick();
  return {
    app,
    document,
    requests,
    forms,
    dialogs,
    shop,
    t,
    tick,
    sources,
    context: () => context,
    click: async (key) => {
      const button = [...document.querySelectorAll("button")].find((node) =>
        node.textContent.includes(t(key)),
      );
      assert.ok(button, `Missing action: ${key}`);
      button.handlers.onClick({ currentTarget: button });
      await tick();
    },
  };
}

test("modern domain entry keeps missing/empty domains compact and opens the actual Guided addition in EN/FA", async () => {
  for (const locale of ["en", "fa"]) {
    for (const domains of [undefined, null, []]) {
      const f = await domainFixture({ locale, domains });
      assert.equal(f.forms.length, 0, "the form is deferred until Connect");
      assert.ok(
        f.document.body.textContent.includes(
          f.t("onboarding.modern.domain.empty_title"),
        ),
      );
      assert.equal(f.requests.length, 0);
      await f.click("onboarding.modern.domain.connect_domain");
      const form = f.forms.at(-1);
      assert.equal(form.modern, true);
      assert.equal(form.inline, false);
      assert.deepEqual(Object.keys(form.domain), []);
      assert.equal(form.shop, f.shop.value);
      assert.equal(form.guidedAdd, true);
      assert.equal(f.document.querySelectorAll("[data-guided-step]").length, 3);
      assert.ok(
        f.document
          .querySelector(".b-domain-add-guided__rail")
          .textContent.includes(
            f.t("domains_modern.connection.guided.addressTitle"),
          ),
      );
      assert.equal(f.dialogs[0].attrs.fullscreen, "");
      assert.equal(f.requests.length, 0);
      form.close();
      await f.tick();
      assert.equal(f.document.querySelector("[data-domain-dialog]"), null);
      f.app.unmount();
    }
  }
});

test("existing domains retain enablement and ownership distinctions and cancelling a new draft preserves them", async () => {
  const domains = [
    { id: 1, domain: "enabled.example.test", enable: true, approved: false },
    { id: 2, domain: "disabled.example.test", enable: false, approved: true },
    { id: 3, domain: "unknown.example.test", enable: true },
  ];
  for (const locale of ["en", "fa"]) {
    const f = await domainFixture({
      locale,
      domains: structuredClone(domains),
    });
    const before = JSON.stringify(f.shop.value.domains);
    const text = f.document.body.textContent;
    const rows = [
      ...f.document.querySelectorAll(".s-onboarding-domain__domain"),
    ];
    for (const [index, keys] of [
      [0, ["enabled", "pending"]],
      [1, ["disabled", "verified"]],
      [2, ["enabled"]],
    ]) {
      assert.equal(
        rows[index].querySelectorAll(".sd-modern-status").length,
        keys.length,
      );
      for (const key of keys)
        assert.ok(
          rows[index].textContent.includes(f.t(`domains_modern.list.${key}`)),
          key,
        );
    }
    assert.equal(
      rows[0].querySelectorAll(".sd-modern-status__dot--success").length,
      1,
    );
    assert.equal(
      rows[0].querySelectorAll(".sd-modern-status__dot--warning").length,
      1,
    );
    assert.equal(
      rows[1].querySelectorAll(".sd-modern-status__dot--error").length,
      1,
    );
    assert.ok(text.includes(f.t("onboarding.modern.domain.ownership_note")));
    await f.click("onboarding.modern.domain.connect_another");
    const first = f.forms.at(-1);
    first.input_domain = "cancelled.example.test";
    first.close();
    await f.tick();
    assert.equal(JSON.stringify(f.shop.value.domains), before);
    await f.click("onboarding.modern.domain.connect_another");
    assert.notEqual(f.forms.at(-1), first);
    assert.equal(
      f.forms.at(-1).input_domain,
      null,
      "a reopened draft starts fresh",
    );
    f.dialogs[0].attrs["onUpdate:modelValue"](false);
    await f.tick();
    assert.equal(
      f.document.querySelector("[data-domain-dialog]"),
      null,
      "native idle dismissal stays available",
    );
    assert.equal(f.requests.length, 0);
    f.app.unmount();
  }
});

test("Guided success updates the original list and closes while busy requests block parent dismissal", async () => {
  for (const domains of [undefined, null, []]) {
    const f = await domainFixture({ domains });
    await f.click("onboarding.modern.domain.connect_domain");
    const form = f.forms.at(-1);
    form.input_domain = "created.example.test";
    await f.tick();
    form.guided_step = 3;
    form.guided_acknowledged = true;
    form.setShopDomain();
    await f.tick();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].url, "/isolated/shops/42/domains");
    assert.equal(f.dialogs[0].props.persistent, true);
    f.dialogs[0].attrs["onUpdate:modelValue"](false);
    await f.tick();
    assert.ok(f.document.querySelector("[data-domain-dialog]"));
    const added = {
      id: 9,
      domain: "created.example.test",
      enable: true,
      approved: false,
    };
    f.requests[0].resolve({ error: false, domain: added });
    await new Promise(setImmediate);
    await f.tick();
    assert.deepEqual(
      JSON.parse(JSON.stringify(f.shop.value.domains)),
      [added],
      "the result appears once even when the initial list was unavailable",
    );
    assert.equal(f.document.querySelector("[data-domain-dialog]"), null);
    assert.ok(f.document.body.textContent.includes(added.domain));
    f.app.unmount();
  }
});

test("changing shops destroys Guided drafts and late responses cannot write to the next shop", async () => {
  const f = await domainFixture();
  await f.click("onboarding.modern.domain.connect_domain");
  const first = f.forms.at(-1),
    oldShop = f.shop.value;
  first.input_domain = "original.example.test";
  await f.tick();
  first.guided_step = 3;
  first.guided_acknowledged = true;
  first.setShopDomain();
  f.shop.value = { ...oldShop, id: 43, domains: null };
  await f.tick();
  assert.equal(f.document.querySelector("[data-domain-dialog]"), null);
  const added = { id: 10, domain: "original.example.test", enable: true };
  f.requests[0].resolve({ error: false, domain: added });
  await new Promise(setImmediate);
  await f.tick();
  assert.equal(
    f.shop.value.domains,
    null,
    "a late add event must not initialize the next shop's list",
  );
  assert.equal(oldShop.domains[0].domain, added.domain);
  await f.click("onboarding.modern.domain.connect_domain");
  assert.notEqual(f.forms.at(-1), first);
  assert.equal(f.forms.at(-1).shop.id, 43);
  assert.equal(f.forms.at(-1).input_domain, null);
  f.app.unmount();
});

test("legacy onboarding keeps its real inline form and existing-domain branch", async () => {
  const empty = await domainFixture({ modern: false });
  assert.equal(empty.forms.length, 1);
  assert.equal(empty.forms[0].inline, true);
  assert.equal(empty.forms[0].modern, false);
  assert.equal(empty.forms[0].guidedAdd, false);
  assert.equal(empty.requests.length, 0);
  empty.app.unmount();
  const existing = await domainFixture({
    modern: false,
    domains: [{ id: 1, domain: "legacy.example.test" }],
  });
  assert.equal(existing.forms.length, 0);
  assert.ok(existing.document.body.textContent.includes("legacy.example.test"));
  existing.app.unmount();
});
