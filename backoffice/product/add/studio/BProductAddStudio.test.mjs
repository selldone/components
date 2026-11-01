import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const compile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const productTypes = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
    code,
    {
      code,
      name: code,
      description: `${code} description`,
      enable: true,
      image: "fixture.svg",
    },
  ]),
);
const { descriptor, errors } = parse(
  readFileSync(new URL("./BProductAddStudio.vue", import.meta.url), "utf8"),
);
assert.deepEqual(errors, []);
const helperExports = {};
vm.runInNewContext(
  compile(
    readFileSync(
      new URL(
        "../../../../../core-js/helper/shop/ShopOptionsHelper.ts",
        import.meta.url,
      ),
      "utf8",
    ),
  ),
  {
    exports: helperExports,
    require: (name) =>
      name.includes("ProductType")
        ? { ProductType: productTypes }
        : { LabelingModes: {} },
  },
);

function fixture({ vendorPanel = false, session = {}, ...overrides } = {}) {
  const requests = [],
    events = [],
    notices = [],
    leaves = {};
  const storage = new Map(Object.entries(session));
  const window = {
    API: { POST_ADD_PRODUCT: (shop) => `/shops/${shop}/products` },
    VAPI: {
      POST_MY_VENDOR_ADD_PRODUCT: (vendor) => `/vendors/${vendor}/products`,
    },
    sessionStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
    },
    $i18n_global: { t: (key) => key },
  };
  const rules = {};
  vm.runInNewContext(
    compile(
      readFileSync(
        new URL(
          "../../../../../core-js/helper/rules/GlobalRules.ts",
          import.meta.url,
        ),
        "utf8",
      ),
    ),
    { exports: rules, window },
  );
  const exports = {};
  const leaf = (name) =>
    (leaves[name] ??= Vue.defineComponent({
      name,
      inheritAttrs: false,
      props: { product: Object, shop: Object, vendor: Object },
      data: () => ({
        draft: "",
        mediaBusy: false,
        saveBlocked: false,
        workspaceBusy: false,
      }),
      render() {
        return Vue.h(
          "section",
          { ...this.$attrs, "data-editor": name },
          this.draft,
        );
      },
    }));
  vm.runInNewContext(compile(descriptor.script.content), {
    exports,
    window,
    console,
    axios: {
      post: (url, payload) =>
        new Promise((resolve, reject) =>
          requests.push({
            url,
            payload: plain(payload),
            resolve: (data) => resolve({ data }),
            reject,
          }),
        ),
    },
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("ProductType")) return { ProductType: productTypes };
      if (name.includes("ProductCondition"))
        return { ProductCondition: { NEW: { code: "NEW" } } };
      if (name.includes("BusinessModel"))
        return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (name.includes("ShopOptionsHelper")) return helperExports;
      if (name.includes("GlobalRules")) return rules;
      if (name.includes("ScrollHelper"))
        return { default: { scrollToTop() {} } };
      if (name === "@selldone/core-js")
        return { Article: { Types: { Product: {} } } };
      if (name.includes("NotificationService"))
        return {
          default: Object.fromEntries(
            ["showErrorAlert", "showSuccessAlert", "showLaravelError"].map(
              (method) => [method, (...args) => notices.push({ method, args })],
            ),
          ),
        };
      if (name.endsWith(".vue"))
        return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
      throw new Error(`Unexpected Studio dependency: ${name}`);
    },
  });
  const component = exports.default;
  const state = {
    modern: true,
    shop: { id: 42, model: "NORMAL", currencies: ["USD", "EUR"], options: [] },
    vendor: vendorPanel ? { id: 9, name: "Fixture vendor" } : null,
    $route: {
      params: vendorPanel ? { vendor_id: "9" } : {},
      query: { dir: "7" },
      matched: [{ meta: { vendor: vendorPanel } }],
    },
    $refs: { form: { validate: async () => ({ valid: true }) } },
    $el: { querySelector: () => null },
    $emit: (...args) => events.push(args),
    $t: (key) => key,
    $nextTick: (callback) =>
      Promise.resolve().then(() => callback?.call(state)),
    $forceUpdate() {},
    GlobalRules: rules.default,
  };
  Object.assign(state, component.data.call(state), overrides);
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, {
      configurable: true,
      get: getter.bind(state),
    });
  component.created?.call(state);
  Object.assign(
    state,
    { title: "Fixture product", type: productTypes.PHYSICAL },
    overrides,
  );
  return {
    state,
    component,
    requests,
    events,
    notices,
    window,
    rules: rules.default,
    leaf,
  };
}

test("Fast creation restores only an active currency and respects enabled shop types", () => {
  for (const [saved, expected] of [
    ["EUR", "EUR"],
    ["GBP", "USD"],
    ["null", "USD"],
  ]) {
    const { state } = fixture({ session: { "temp-studio-currency": saved } });
    assert.equal(state.currency, expected);
  }
  const { state } = fixture({
    shop: {
      id: 42,
      currencies: ["USD"],
      options: [{ code: "types", value: ["FILE", "SERVICE"] }],
    },
    type: null,
  });
  assert.deepEqual(
    Array.from(state.available_types, (type) => type.code),
    ["FILE", "SERVICE"],
  );
  state.setType(productTypes.PHYSICAL);
  assert.equal(state.type, null);
  state.setType(productTypes.FILE);
  assert.equal(state.type.code, "FILE");
  state.busy_add = true;
  state.setType(productTypes.SERVICE);
  assert.equal(state.type.code, "FILE");
  state.busy_add = false;
  state.product = { id: 31 };
  state.setType(productTypes.SERVICE);
  assert.equal(state.type.code, "FILE", "A created product cannot change type");
  const marketplace = fixture({
    shop: { id: 42, model: "MARKETPLACE", currencies: ["USD"], options: [] },
    type: productTypes.SUBSCRIPTION,
  }).state;
  assert.equal(
    marketplace.can_add,
    false,
    "Marketplace subscriptions retain a vendor owner",
  );
  marketplace.selected_vendor_id = 9;
  assert.equal(marketplace.can_add, true);
});

test("Validation rejects invalid drafts while allowing free products", async () => {
  for (const changes of [
    { title: "" },
    { title: "   " },
    { title: "x".repeat(121) },
    { price: -1 },
    { price: null },
    { price: "" },
    { price: Infinity },
    { price: NaN },
    { currency: null },
    { type: null },
  ]) {
    const { state, requests } = fixture(changes);
    await state.addProduct();
    assert.equal(requests.length, 0, JSON.stringify(changes));
  }
  const { state, requests } = fixture({ price: 0 });
  state.$refs.form.validate = async () => ({ valid: false });
  await state.addProduct();
  assert.equal(requests.length, 0);
  assert.equal(state.busy_add, false);
  state.$refs.form.validate = async () => ({ valid: true });
  const pending = state.addProduct();
  await setImmediate();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].payload.price, 0);
  requests[0].resolve({ error: true, error_msg: "Fixture rejection" });
  await pending;
});

test("Pending validation and unmount cannot create duplicate or stale requests", async () => {
  for (const close of [false, true]) {
    const { state, component, requests } = fixture();
    let validate;
    state.$refs.form.validate = () =>
      new Promise((resolve) => {
        validate = resolve;
      });
    const pending = state.addProduct();
    assert.equal(state.busy_add, true);
    await state.addProduct();
    if (close) component.beforeUnmount.call(state);
    validate({ valid: true });
    await setImmediate();
    assert.equal(requests.length, close ? 0 : 1);
    if (!close)
      requests[0].resolve({ error: true, error_msg: "Fixture rejection" });
    await pending;
    assert.equal(state.busy_add, false);
  }
});

test("Creation keeps the shop/vendor endpoints and all existing payload defaults", async () => {
  for (const vendorPanel of [false, true])
    for (const code of Object.keys(productTypes)) {
      const { state, requests, events } = fixture({
        vendorPanel,
        type: productTypes[code],
        quantity: 12,
        brand: "Fixture brand",
      });
      const pending = state.addProduct(true);
      await setImmediate();
      assert.equal(requests.length, 1);
      assert.equal(
        requests[0].url,
        vendorPanel ? "/vendors/9/products" : "/shops/42/products",
      );
      assert.deepEqual(
        requests[0].payload,
        plain({
          vendor_id: vendorPanel ? 9 : undefined,
          type: code,
          title: "Fixture product",
          condition: "NEW",
          price: 0,
          currency: "USD",
          commission: 0,
          discount: 0,
          status: "Open",
          category_id: "7",
          lead: 0,
          style: null,
          brand: "Fixture brand",
          warranty: null,
          original: true,
          return_warranty: null,
          video: null,
          quantity: code === "SUBSCRIPTION" ? 1 : 12,
        }),
      );
      const product = { id: 31, shop_id: 42, type: code };
      requests[0].resolve({ product });
      await pending;
      assert.equal(state.product, product);
      assert.deepEqual(
        events.map(([event]) => event),
        ["add"],
      );
      assert.equal(events[0][1], product);
      assert.equal(state.tab_product, 2);
      assert.equal(state.busy_add, false);
    }
});

test("Failures keep the draft for retry; direct completion emits add before finish", async () => {
  const { state, requests, events, notices } = fixture();
  let pending = state.addProduct();
  await setImmediate();
  requests[0].resolve({ error: true, error_msg: "Fixture API error" });
  await pending;
  assert.equal(state.title, "Fixture product");
  assert.equal(state.product, null);
  assert.deepEqual(events, []);
  assert.equal(notices.at(-1).method, "showErrorAlert");
  pending = state.addProduct();
  await setImmediate();
  requests[1].reject(new Error("Fixture transport failure"));
  await pending;
  assert.equal(state.busy_add, false);
  assert.deepEqual(events, []);
  assert.equal(notices.at(-1).method, "showLaravelError");
  pending = state.addProduct();
  await setImmediate();
  requests[2].resolve({ product: { id: 31, type: "PHYSICAL" } });
  await pending;
  assert.deepEqual(
    events.map(([event]) => event),
    ["add", "finish"],
  );
  await state.addProduct();
  assert.equal(
    requests.length,
    3,
    "A saved product must never be created again",
  );
});

test("Closing while creation is pending suppresses late UI events", async () => {
  const { state, component, requests, events } = fixture();
  const pending = state.addProduct(true);
  await setImmediate();
  component.beforeUnmount.call(state);
  requests[0].resolve({ product: { id: 31, type: "PHYSICAL" } });
  await pending;
  assert.deepEqual(
    events,
    [["busy", false]],
    "Unmount releases only the parent's busy lock",
  );
});

test("Finish waits for native completion operations and never submits them", () => {
  for (const refs of [
    { imagesEditor: { mediaBusy: true } },
    { imagesEditor: { saveBlocked: true } },
    { inventoryEditor: { workspaceBusy: true } },
    { inventoryEditor: { saveBlocked: true } },
  ]) {
    const { state, events, requests } = fixture({
      product: { id: 31 },
      ...refs,
    });
    state.finish();
    assert.deepEqual(events, []);
    assert.equal(requests.length, 0);
  }
  const { state, events, requests } = fixture({
    product: { id: 31 },
    currency: "EUR",
    quantity: 8,
    brand: "Fixture",
  });
  state.finish();
  assert.deepEqual(events, [["finish"]]);
  assert.equal(requests.length, 0);
  state.startNextProduct();
  assert.equal(state.product, null);
  assert.equal(state.type, null);
  assert.equal(state.title, null);
  assert.equal(state.brand, null);
  assert.equal(state.price, 0);
  assert.equal(state.quantity, 0);
  assert.equal(state.currency, "EUR");
});

const node = (tag, text = "") => ({
  tag,
  text,
  props: {},
  style: {},
  children: [],
  parent: null,
});
const descendants = (element) => [
  element,
  ...element.children.flatMap(descendants),
];
const renderer = Vue.createRenderer({
  createElement: (tag) => node(tag),
  createText: (text) => node("#text", text),
  createComment: (text) => node("#comment", text),
  insert(child, parent, anchor = null) {
    if (child.parent)
      child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(
      index < 0 ? parent.children.length : index,
      0,
      child,
    );
  },
  remove(child) {
    child.parent?.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = null;
  },
  setText: (element, text) => {
    element.text = text;
  },
  setElementText: (element, text) => {
    element.text = text;
    element.children = [];
  },
  patchProp: (element, key, before, value) => {
    element.props[key] = value;
  },
  parentNode: (element) => element.parent,
  nextSibling: (element) =>
    element.parent?.children[element.parent.children.indexOf(element) + 1],
});
const slotStub = (tag = "div") =>
  Vue.defineComponent({
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h(tag, attrs, [
          slots.activator?.({ props: {} }),
          slots.prepend?.(),
          slots.default?.(),
          slots.append?.(),
        ]),
  });

test("The real one-page template keeps optional editors lazy and retains drafts and busy guards", async () => {
  const { component, window, rules, requests } = fixture();
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: "BProductAddStudio.vue",
    id: "studio-mounted-test",
  });
  assert.deepEqual(template.errors, []);
  const output = {};
  vm.runInNewContext(compile(template.code), {
    exports: output,
    require: () => Vue,
  });
  const components = Object.fromEntries(
    Object.keys(component.components).map((name) => [name, slotStub()]),
  );
  const editors = {};
  for (const name of ["BProductEditImages", "BProductInventoryManagement"])
    components[name] = Vue.defineComponent({
      name,
      inheritAttrs: false,
      props: { product: Object, shop: Object, vendor: Object },
      data: () => ({
        draft: "",
        mediaBusy: false,
        saveBlocked: false,
        workspaceBusy: false,
      }),
      mounted() {
        editors[name] = this;
      },
      render() {
        return Vue.h(
          "section",
          { ...this.$attrs, "data-editor": name },
          this.draft,
        );
      },
    });
  components.BProductEditType = Vue.defineComponent({
    emits: ["select"],
    setup:
      (_, { emit }) =>
      () =>
        Vue.h(
          "button",
          {
            type: "button",
            "data-type": "PHYSICAL",
            onClick: () => emit("select", productTypes.PHYSICAL),
          },
          "Physical",
        ),
  });
  const events = [];
  const app = renderer.createApp(
    { ...component, components, render: output.render },
    {
      modern: true,
      shop: { id: 42, model: "NORMAL", currencies: ["USD"], options: [] },
      onBusy: (busy) => events.push(["busy", busy]),
      onFinish: () => events.push(["finish"]),
    },
  );
  for (const name of [
    "VSheet",
    "VRow",
    "VContainer",
    "VCol",
    "VIcon",
    "VListSubheader",
    "VSpacer",
    "VBtn",
    "VExpandTransition",
    "VAlert",
    "VChip",
    "VTooltip",
    "VListItem",
    "VListItemTitle",
    "VListItemSubtitle",
    "UWidgetHeader",
  ])
    app.component(name, slotStub(name === "VBtn" ? "button" : "div"));
  app.component(
    "VForm",
    Vue.defineComponent({
      methods: { validate: async () => ({ valid: true }) },
      render() {
        return Vue.h("form", this.$attrs, this.$slots.default?.());
      },
    }),
  );
  app.component("VTextField", slotStub("input"));
  const failures = [],
    warnings = [];
  app.config.errorHandler = (error) => failures.push(error);
  app.config.warnHandler = (warning) => warnings.push(warning);
  Object.assign(app.config.globalProperties, {
    $route: { params: {}, query: {}, matched: [] },
    $t: (key) => key,
    GlobalRules: rules,
    getShopImagePath: (path) => path,
    $vuetify: Vue.reactive({
      theme: { current: { dark: false } },
      locale: { isRtl: false },
    }),
  });
  // The component's existing created hook reads its isolated VM window/storage.
  assert.ok(window.sessionStorage);
  const host = node("root");
  const state = app.mount(host);
  try {
    assert.equal(state.type, null);
    assert.ok(
      descendants(host).some(({ tag }) => tag === "form"),
      "The form is available before choosing a type",
    );
    assert.equal(
      descendants(host).filter(({ props }) => props["data-editor"]).length,
      0,
    );
    assert.ok(
      descendants(host).some(({ props }) => props.name === "ArrowRight"),
    );
    app.config.globalProperties.$vuetify.locale.isRtl = true;
    await Vue.nextTick();
    assert.ok(
      descendants(host).some(({ props }) => props.name === "ArrowLeft"),
    );
    app.config.globalProperties.$vuetify.locale.isRtl = false;
    descendants(host)
      .find(({ props }) => props["data-type"] === "PHYSICAL")
      .props.onClick();
    state.title = "Free fixture";
    state.price = 0;
    await Vue.nextTick();
    assert.equal(!!state.can_add, true);
    state.product = { id: 31, shop_id: 42, type: "PHYSICAL" };
    state.selectCompletion(2);
    await Vue.nextTick();
    assert.ok(editors.BProductEditImages);
    editors.BProductEditImages.draft = "Unsaved native image draft";
    editors.BProductEditImages.mediaBusy = true;
    await Vue.nextTick();
    assert.equal(
      state.completionBusy,
      true,
      "A lazily mounted editor must update the parent guard",
    );
    state.finish();
    assert.equal(
      events.some(([event]) => event === "finish"),
      false,
    );
    state.selectCompletion(3);
    assert.equal(state.tab_product, 2);
    editors.BProductEditImages.mediaBusy = false;
    await Vue.nextTick();
    state.selectCompletion(3);
    await Vue.nextTick();
    assert.ok(editors.BProductInventoryManagement);
    assert.equal(
      editors.BProductEditImages.draft,
      "Unsaved native image draft",
    );
    editors.BProductInventoryManagement.workspaceBusy = true;
    await Vue.nextTick();
    assert.equal(state.completionBusy, true);
    editors.BProductInventoryManagement.workspaceBusy = false;
    await Vue.nextTick();
    state.selectCompletion(2);
    await Vue.nextTick();
    assert.equal(
      editors.BProductEditImages.draft,
      "Unsaved native image draft",
    );
    assert.equal(
      events.some(([event, busy]) => event === "busy" && busy),
      true,
    );
    state.startNextProduct();
    await Vue.nextTick();
    descendants(host)
      .find(({ props }) => props["data-type"] === "PHYSICAL")
      .props.onClick();
    state.title = "Free product from form";
    await Vue.nextTick();
    const form = descendants(host).find(({ tag }) => tag === "form");
    const pending = form.props.onSubmit({ preventDefault() {} });
    await setImmediate();
    assert.equal(requests.length, 1);
    assert.equal(state.completionBusy, true);
    requests[0].resolve({ product: { id: 32, shop_id: 42, type: "PHYSICAL" } });
    await pending;
    await Vue.nextTick();
    assert.equal(state.completionBusy, false);
    assert.equal(
      events.filter(([event]) => event === "finish").length,
      1,
      "Direct creation clears its busy lock before Finish",
    );
    assert.deepEqual(failures, []);
    assert.deepEqual(warnings, []);
  } finally {
    app.unmount();
  }
});
