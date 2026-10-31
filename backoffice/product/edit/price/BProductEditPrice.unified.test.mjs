import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import ts from "typescript";

// Real SFC and methods; native child controls and HTTP remain isolated.
const file = new URL("./BProductEditPrice.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "unified-price-test",
});
assert.deepEqual(template.errors, []);
const plain = (value) => JSON.parse(JSON.stringify(value));
const Currency = Object.fromEntries(
  ["USD", "EUR", "GBP"].map((code) => [code, { code, name: code, floats: 2 }]),
);
const ProductType = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
    code,
    { code },
  ]),
);
const PricingTypes = Object.fromEntries(
  ["FIX", "AGREEMENT", "ESTIMATION"].map((code) => [
    code,
    { code, title: code, image: `/${code}.svg`, message: `${code}.help` },
  ]),
);
function evaluate(source, dependency, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, {
    exports,
    require: dependency,
    ...globals,
  });
  return exports;
}
function product(values = {}) {
  const result = {
    id: 31,
    type: "PHYSICAL",
    pricing: "FIX",
    price: 10,
    currency: "USD",
    commission: 0,
    discount: 14.85,
    dis_start: null,
    dis_end: null,
    price_label: null,
    created_at: "2026-01-01",
    extra_pricings: [],
    ...values,
  };
  Object.defineProperty(result.extra_pricings, "sortByKey", {
    configurable: true,
    value(key) {
      return [...this].sort((a, b) => a[key] - b[key]);
    },
  });
  return result;
}
function textOf(value) {
  if (Array.isArray(value)) return value.map(textOf).join("");
  if (value && typeof value === "object") return textOf(value.children);
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}
function environment(overrides = {}) {
  const calls = [],
    writes = [],
    notices = [],
    emits = [],
    prices = [];
  const parent = overrides.product ?? product();
  const variant =
    overrides.variant === null
      ? null
      : { id: 4, pricing: true, ...overrides.variant };
  const parameters = {
    modern: true,
    shop: { id: 7, currencies: ["USD", "EUR", "GBP"] },
    product: parent,
    customObject: {
      ...parent,
      pricing: variant ? true : parent.pricing,
      variant_id: variant?.id,
    },
    variant,
    instanceMode: true,
    instanceOriginalProduct: parent,
    instanceVariantId: variant?.id,
    instanceVariantPricing: true,
    instanceProductId: parent.id,
    instanceObject: { product: parent, variant },
    light: true,
    transparent: true,
    ...overrides,
  };
  const leaf = (name) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          const children =
            name === "v-tooltip"
              ? [slots.activator?.({ props: {} }), slots.default?.()]
              : slots.default?.();
          calls.push({ name, attrs, text: textOf(children) });
          return Vue.h(
            "div",
            { "data-leaf": name, class: attrs.class },
            children,
          );
        };
      },
    });
  const helpers = {
    GetCurrency: (value) =>
      Currency[typeof value === "string" ? value : value?.code],
    GetUserSelectedCurrency: () => Currency.USD,
    $route: { params: {}, matched: [] },
    $vuetify: {
      display: { smAndUp: true, xs: false, width: 1600 },
      theme: { current: { dark: false } },
      locale: { isRtl: false },
    },
    $t: (key) => key,
    require: (path) => path,
    getShopImagePath: (path) => path,
    IMAGE_SIZE_SMALL: "small",
    AddOrUpdateItemByID: (items, item) => {
      const index = items.findIndex((value) => value.id === item.id);
      if (index < 0) items.push(item);
      else Object.assign(items[index], item);
    },
    DeleteItemByID: (items, id) => {
      const index = items.findIndex((value) => value.id === id);
      if (index >= 0) items.splice(index, 1);
    },
  };
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.endsWith(".vue"))
      return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    if (name.includes("CurrencyMixin"))
      return {
        default: {
          methods: {
            GetCurrency: helpers.GetCurrency,
            GetUserSelectedCurrency: helpers.GetUserSelectedCurrency,
          },
        },
      };
    if (name.includes("/Currency")) return { Currency };
    if (name.includes("PricingTypes")) return { PricingTypes };
    if (name.includes("ProductType")) return { ProductType };
    if (name.includes("ColorGenerator"))
      return { standardDesignColor: ["blue"] };
    if (name.includes("PriceHelper"))
      return {
        PriceHelper: {
          priceProductByCurrency(shop, tuple, variant, target) {
            prices.push({ shop, tuple: plain(tuple), variant, target });
            return (
              Number(tuple.price) +
              Number(tuple.commission) -
              Number(tuple.discount)
            );
          },
          discountProductPercent(_, tuple) {
            return Math.round(
              (100 * Number(tuple.discount)) /
                (Number(tuple.price) + Number(tuple.commission)),
            );
          },
        },
      };
    if (name.includes("NotificationService"))
      return {
        default: {
          showErrorAlert: (_, error) => notices.push(["server", error]),
          showLaravelError: (error) => notices.push(["network", error]),
          showSuccessAlert: (_, message) => notices.push(["success", message]),
        },
      };
    if (/\.(svg|png)$/.test(name)) return name;
    throw new Error("Unexpected dependency " + name);
  };
  const Page = evaluate(descriptor.script.content, dependency, {
    axios: {
      put: (url, body) =>
        new Promise((resolve, reject) =>
          writes.push({ url, body, resolve, reject }),
        ),
    },
    window: {
      API: {
        PUT_EDIT_PRODUCT_PRICE: (shop, product, variant) =>
          `/isolated/shops/${shop}/products/${product}/price/${variant ?? "product"}`,
      },
    },
    console,
  }).default;
  const compiled = evaluate(template.code, dependency).render;
  function state(values = {}, computed = {}) {
    const result = {
      ...Page.data.call(parameters),
      ...helpers,
      ...parameters,
      $emit: (...args) => emits.push(args),
      ...values,
    };
    for (const [name, method] of Object.entries(Page.methods))
      result[name] = method.bind(result);
    for (const [name, getter] of Object.entries(Page.computed))
      Object.defineProperty(result, name, {
        configurable: true,
        get: () => (name in computed ? computed[name] : getter.call(result)),
      });
    Page.created?.call(result);
    return result;
  }
  async function render(values = {}) {
    calls.length = 0;
    let instance;
    const app = Vue.createSSRApp(
      {
        ...Page,
        data() {
          return { ...Page.data.call(this), ...values };
        },
        render(...args) {
          instance = this;
          return compiled.apply(this, args);
        },
      },
      parameters,
    );
    for (const name of [
      "v-sheet",
      "v-col",
      "v-row",
      "v-img",
      "v-icon",
      "v-list-subheader",
      "v-btn",
      "v-slide-y-transition",
      "v-slide-y-reverse-transition",
      "v-expand-transition",
      "v-expansion-panels",
      "v-expansion-panel",
      "v-expansion-panel-title",
      "v-expansion-panel-text",
      "v-text-field",
      "v-table",
      "v-radio",
      "v-radio-group",
      "v-tooltip",
      "v-btn-toggle",
      "v-divider",
      "u-widget-header",
      "u-price",
    ])
      app.component(name, leaf(name));
    app.directive("ctrl", { getSSRProps: () => ({}) });
    Object.assign(app.config.globalProperties, helpers);
    const html = await renderToString(app);
    return {
      instance,
      html,
      document: new JSDOM(html).window.document,
      calls: [...calls],
    };
  }
  const fire = (call, event, value) => {
    for (const handler of [].concat(call.attrs[event] ?? [])) handler(value);
  };
  return {
    Page,
    parent,
    parameters,
    calls,
    writes,
    notices,
    emits,
    prices,
    state,
    render,
    fire,
  };
}

test("real tier chart keeps native values and currency with opt-in accessible modern tooltips and count", async () => {
  const chartFile = new URL(
    "../../../extra-pricing/ExtraPricingLevels.vue",
    import.meta.url,
  );
  const { descriptor: chart, errors: chartErrors } = parse(
    readFileSync(chartFile, "utf8"),
  );
  assert.deepEqual(chartErrors, []);
  const compiled = compileTemplate({
    source: chart.template.content,
    filename: chartFile.pathname,
    id: "tier-chart-test",
  });
  assert.deepEqual(compiled.errors, []);
  for (const style of chart.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: chartFile.pathname,
      id: "tier-chart-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
    assert.equal(style.scoped, true);
  }
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("ColorGenerator"))
      return { standardDesignColor: ["blue", "green"] };
    if (name.includes("ObjectPrototypes"))
      return { ApplyAugmentToObject: () => {} };
    throw new Error("Unexpected chart dependency " + name);
  };
  // The chart uses the application's array helpers; install them only in its isolated VM.
  const arrays = readFileSync(
    new URL(
      "../../../../../core-js/prototypes/ArrayPrototypes.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const Chart = evaluate(
    arrays + "\n" + chart.script.content,
    dependency,
  ).default;
  const render = evaluate(compiled.code, dependency).render;
  assert.equal(Chart.props.modern.default, false);
  for (const modern of [false, true]) {
    const tooltips = [],
      prices = [],
      counts = [];
    let instance;
    const app = Vue.createSSRApp(
      {
        ...Chart,
        render(...args) {
          instance = this;
          return render.apply(this, args);
        },
      },
      {
        ...(modern ? { modern: true } : {}),
        product: { currency: "USD" },
        originalPricing: { price: 10, commission: 2, discount: 1 },
        extraPricings: [
          { id: 2, min: 5, price: 8, commission: 0, discount: 1 },
          { id: 3, min: 20, price: 5, commission: 1, discount: 0 },
        ],
        inventoryQuantity: 10,
      },
    );
    app.component(
      "v-tooltip",
      Vue.defineComponent({
        inheritAttrs: false,
        setup(_, { attrs, slots }) {
          tooltips.push(attrs);
          return () => Vue.h("span", slots.default?.());
        },
      }),
    );
    app.component(
      "u-price",
      Vue.defineComponent({
        inheritAttrs: false,
        setup(_, { attrs }) {
          prices.push(attrs);
          return () => Vue.h("span", String(attrs.amount));
        },
      }),
    );
    app.component(
      "v-icon",
      Vue.defineComponent(
        (_, { slots }) =>
          () =>
            Vue.h("span", slots.default?.()),
      ),
    );
    Object.assign(app.config.globalProperties, {
      numeralFormat: String,
      $t: (key, values, choice) => {
        if (values?.count !== undefined) counts.push({ key, values, choice });
        return values ? `${key}:${values.count}` : key;
      },
    });
    const document = new JSDOM(await renderToString(app)).window.document;
    assert.equal(instance.modern, modern);
    assert.equal(instance.max_price, 11);
    assert.equal(instance.max_quantity, 20);
    const bars = [...document.querySelectorAll(".exp-item")];
    assert.deepEqual(
      bars.map((bar) => bar.style.height),
      ["100%", "64%", "55%"],
    );
    assert.deepEqual(
      bars.map((bar) => bar.style.flexGrow),
      ["0", "0.25", "1"],
    );
    assert.equal(tooltips.length, 3);
    assert.ok(
      prices.length > 0 && prices.every((price) => price.currency === "USD"),
    );
    assert.ok(prices.some((price) => price.amount === 5));
    for (const tooltip of tooltips) {
      assert.equal(tooltip.activator, "parent");
      assert.equal(tooltip.location, modern ? "top" : "bottom");
      assert.equal(tooltip["max-width"], modern ? undefined : 360);
      assert.equal(tooltip["open-on-focus"], modern ? true : undefined);
      assert.equal(tooltip["open-on-click"], modern ? true : undefined);
      assert.equal(tooltip.persistent, modern ? false : undefined);
      assert.equal(
        tooltip["content-class"],
        modern ? "sd-modern-tooltip text-start" : "bg-black text-start",
      );
    }
    for (const bar of bars) {
      assert.equal(bar.getAttribute("tabindex"), modern ? "0" : null);
      assert.equal(bar.getAttribute("role"), modern ? "img" : null);
      assert.equal(bar.hasAttribute("aria-label"), modern);
    }
    if (modern) {
      assert.match(document.querySelector("small").textContent, /tier_count:2/);
      assert.deepEqual(plain(counts), [
        {
          key: "add_product.pricing.modern.tier_count",
          values: { count: 2 },
          choice: 2,
        },
      ]);
    } else {
      assert.match(
        document.querySelector("small").textContent,
        /3\s+extra_pricing_levels.extra_pricings/,
      );
      assert.deepEqual(counts, []);
    }
  }
});

test("real date input forwards disabled and blocks opening and clearing without changing legacy disable", async () => {
  const dateFile = new URL(
    "../../../../ui/date/input/UDateInput.vue",
    import.meta.url,
  );
  const { descriptor: date, errors: dateErrors } = parse(
    readFileSync(dateFile, "utf8"),
  );
  assert.deepEqual(dateErrors, []);
  const compiled = compileTemplate({
    source: date.template.content,
    filename: dateFile.pathname,
    id: "native-date-test",
  });
  assert.deepEqual(compiled.errors, []);
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("DateMixin"))
      return {
        default: {
          methods: {
            getLocalTimeString: (value) => value ?? "",
            getFromNowString: () => "",
          },
        },
      };
    if (name.endsWith(".vue"))
      return { default: Vue.defineComponent(() => () => null) };
    throw new Error("Unexpected date dependency " + name);
  };
  const DateInput = evaluate(date.script.content, dependency).default;
  const render = evaluate(compiled.code, dependency).render;
  for (const props of [{}, { disabled: true }, { disable: true }]) {
    const emitted = [];
    let field, instance;
    const app = Vue.createSSRApp(
      {
        ...DateInput,
        render(...args) {
          instance = this;
          return render.apply(this, args);
        },
      },
      {
        modelValue: "2026-11-01T09:30:00.000Z",
        clearable: true,
        ...props,
        "onUpdate:modelValue": (value) => emitted.push(["update", value]),
        onChange: (value) => emitted.push(["change", value]),
      },
    );
    app.component(
      "v-text-field",
      Vue.defineComponent({
        inheritAttrs: false,
        setup(_, { attrs }) {
          field = attrs;
          return () =>
            Vue.h("input", {
              disabled: attrs.disabled,
              value: attrs.modelValue,
            });
        },
      }),
    );
    app.component(
      "v-dialog",
      Vue.defineComponent(() => () => null),
    );
    for (const name of [
      "v-icon",
      "v-spacer",
      "v-btn",
      "v-card-title",
      "v-date-picker",
      "v-card-text",
      "v-card-actions",
      "v-card",
    ])
      app.component(
        name,
        Vue.defineComponent(() => () => null),
      );
    app.directive("dragscroll", { getSSRProps: () => ({}) });
    const document = new JSDOM(await renderToString(app)).window.document;
    assert.equal(field.disabled, !!props.disabled);
    assert.equal(document.querySelector("input").disabled, !!props.disabled);
    field.onClick();
    assert.equal(instance.dialog, !props.disabled && !props.disable);
    instance.dialog = false;
    field["onClick:appendInner"]({ stopPropagation() {} });
    assert.equal(instance.dialog, !props.disabled && !props.disable);
    field["onClick:clear"]();
    await Vue.nextTick();
    assert.deepEqual(
      emitted,
      props.disabled
        ? []
        : [
            ["update", null],
            ["change", null],
          ],
    );
  }
});

test("real tier row renders one Edit and one confirmed Delete in each appearance", async () => {
  const rowFile = new URL(
    "../../extra-pricings/row/BProductExtraPricingRow.vue",
    import.meta.url,
  );
  const { descriptor: row, errors: rowErrors } = parse(
    readFileSync(rowFile, "utf8"),
  );
  assert.deepEqual(rowErrors, []);
  const compiled = compileTemplate({
    source: row.template.content,
    filename: rowFile.pathname,
    id: "tier-row-test",
  });
  assert.deepEqual(compiled.errors, []);
  const confirmations = [],
    emitted = [];
  let deletes = 0,
    buttons = [];
  const leaf = (name) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          if (name === "v-tooltip")
            return Vue.h(Vue.Fragment, slots.activator?.({ props: {} }));
          if (name === "v-btn") buttons.push(attrs);
          return Vue.h(
            name === "v-btn" ? "button" : "span",
            {
              "aria-label": attrs["aria-label"],
              title: attrs.title,
            },
            slots.default?.(),
          );
        };
      },
    });
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.endsWith(".vue")) return { default: leaf(name) };
    if (name.includes("Mixin")) return { default: {} };
    if (name.includes("NotificationService"))
      return {
        default: {
          openDangerAlert: (...args) => confirmations.push(args),
        },
      };
    throw new Error("Unexpected row dependency " + name);
  };
  const Row = evaluate(row.script.content, dependency).default;
  const render = evaluate(compiled.code, dependency).render;
  async function show(modern, readonly = false) {
    buttons = [];
    const app = Vue.createSSRApp(
      {
        ...Row,
        render,
        emits: ["select", "onDelete", "close"],
        methods: { ...Row.methods, deleteNow: () => deletes++ },
      },
      {
        modern,
        readonly,
        shop: { id: 7 },
        product: product({ currency: "USD" }),
        extraPricing: { id: 2, min: 10, price: 20, commission: 1, discount: 2 },
        allExtraPricings: [],
        onSelect: (value) => emitted.push(value),
      },
    );
    for (const name of ["v-btn", "v-icon", "v-tooltip", "u-price"])
      app.component(name, leaf(name));
    Object.assign(app.config.globalProperties, {
      $t: (key) => key,
      $route: { params: {}, matched: [] },
      numeralFormat: String,
      GetCurrency: (code) => Currency[code],
      getCurrencyName: String,
      priceProductByCurrency: (_, tuple) =>
        tuple.price + tuple.commission - tuple.discount,
      discountProductPercent: () => 0,
    });
    const html = await renderToString(app);
    return new JSDOM(`<table><tbody>${html}</tbody></table>`).window.document;
  }
  for (const modern of [true, false]) {
    const document = await show(modern);
    assert.equal(document.querySelectorAll("button").length, 2);
    assert.equal(buttons.length, 2);
    const event = { stopPropagation() {} };
    buttons[0].onClick(event);
    assert.equal(emitted.at(-1).id, 2);
    const beforeDelete = deletes;
    buttons[1].onClick(event);
    assert.equal(deletes, beforeDelete);
    assert.equal(confirmations.length, modern ? 1 : 2);
    confirmations.at(-1)[3]();
    assert.equal(deletes, beforeDelete + 1);
  }
  assert.equal((await show(true, true)).querySelectorAll("button").length, 0);
});

test("Unified editor real template, TypeScript and component-scoped Sass compile", async () => {
  for (const style of descriptor.styles) {
    assert.equal(style.scoped, true);
    const result = await compileStyleAsync({
      source: style.content,
      filename: file.pathname,
      id: "unified-price-test",
      scoped: true,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("modern opt-in keeps native money controls, negative preview and an available instance Save", async () => {
  const f = environment(),
    shown = await f.render();
  assert.equal(f.Page.props.modern.default, false);
  assert.equal(shown.instance.calculatePrice, -4.85);
  assert.ok(shown.document.querySelector(".b-product-edit-price--modern"));
  assert.ok(
    shown.document.querySelector(
      ".b-product-edit-price__receipt [role='status']",
    ),
  );
  assert.ok(
    shown.calls.some(
      (call) =>
        call.name === "u-price" &&
        call.attrs.amount === -4.85 &&
        call.attrs.currency.code === "USD",
    ),
  );
  assert.deepEqual(
    shown.calls
      .filter((call) => call.name === "UPriceInput")
      .map((call) => call.attrs.modelValue),
    [10, 14.85],
  );
  const save = shown.calls.find(
    (call) =>
      call.name === "v-btn" && call.text.includes("global.actions.save"),
  );
  assert.ok(save);
  assert.notEqual(save.attrs.disabled, true);
  assert.doesNotMatch(save.attrs.class ?? "", /(^|\s)disabled(\s|$)/);
  const legacy = await environment({ modern: false }).render();
  assert.equal(
    legacy.document.querySelector(".b-product-edit-price--modern"),
    null,
  );
  assert.ok(legacy.document.querySelector(".widget-box.price-input-form"));
});

test("changing native currency keeps entered monetary amounts and leaves saved parent/tier currency alone", async () => {
  const f = environment(),
    shown = await f.render(),
    currency = shown.calls.find((call) => call.name === "UCurrencyInput");
  assert.deepEqual(plain(currency.attrs["active-currencies"]), [
    "USD",
    "EUR",
    "GBP",
  ]);
  f.fire(currency, "onUpdate:modelValue", Currency.EUR);
  assert.equal(shown.instance.currency.code, "EUR");
  assert.equal(f.parameters.customObject.currency, "EUR");
  assert.equal(shown.instance.price, 10);
  assert.equal(shown.instance.discount, 14.85);
  assert.equal(shown.instance.calculatePrice, -4.85);
  assert.equal(f.prices.at(-1).target, "EUR");
  assert.equal(f.prices.at(-1).tuple.currency, "EUR");
  assert.equal(f.parent.currency, "USD");
  assert.equal(f.writes.length, 0);
});

test("instance Save sends the complete native tuple even for a negative derived total", async () => {
  const f = environment({
      product: product({
        price_label: "/ unit",
        dis_start: "2026-11-01",
        dis_end: "2026-11-01",
      }),
    }),
    state = f.state();
  const pending = state.setProductPrice();
  assert.equal(state.busy_update, true);
  assert.equal(f.writes[0].url, "/isolated/shops/7/products/31/price/4");
  assert.deepEqual(plain(f.writes[0].body), {
    price: 10,
    currency: "USD",
    commission: 0,
    discount: 14.85,
    dis_start: "2026-11-01",
    dis_end: "2026-11-01",
    price_label: "/ unit",
    pricing: true,
  });
  f.writes[0].resolve({ data: { success: true, product: {}, variant: {} } });
  await pending;
  assert.equal(state.busy_update, false);
  assert.equal(f.emits[0][0], "update:instance");
  assert.equal(f.notices.at(-1)[0], "success");
});

test("server and network failures preserve the local tuple and release native loading for retry", async () => {
  for (const kind of ["server", "network"]) {
    const f = environment(),
      state = f.state(),
      pending = state.setProductPrice();
    if (kind === "server")
      f.writes[0].resolve({ data: { error: true, error_msg: "Rejected" } });
    else f.writes[0].reject(new Error("Unavailable"));
    await pending;
    assert.equal(state.busy_update, false);
    assert.equal(state.price, 10);
    assert.equal(state.discount, 14.85);
    assert.equal(f.emits.length, 0);
    assert.equal(f.notices[0][0], kind);
  }
});

test("shared physical variant mode copies the full parent tuple including zero discount and submits shared ownership", async () => {
  const parent = product({
    price: 49,
    currency: "EUR",
    commission: 3,
    discount: 0,
    dis_start: null,
    dis_end: null,
    price_label: "Per item",
  });
  const f = environment({
      product: parent,
      customObject: {
        ...parent,
        variant_id: 4,
        price: 99,
        currency: "USD",
        commission: 7,
        discount: 12,
      },
    }),
    state = f.state();
  state.variant_pricing = false;
  f.Page.watch.variant_pricing.call(state, false);
  assert.deepEqual(
    plain({
      price: state.price,
      currency: state.currency.code,
      commission: state.commission,
      discount: state.discount,
      dis_start: state.dis_start,
      dis_end: state.dis_end,
      price_label: state.price_label,
    }),
    {
      price: 49,
      currency: "EUR",
      commission: 3,
      discount: 0,
      dis_start: null,
      dis_end: null,
      price_label: "Per item",
    },
  );
  assert.equal(state.has_discount_period, false);
  Object.assign(parent, {
    discount: 5,
    dis_start: "2026-11-01",
    dis_end: "2026-11-02",
  });
  f.Page.watch.variant_pricing.call(state, false);
  assert.equal(state.discount, 5);
  assert.equal(state.dis_start, "2026-11-01");
  assert.equal(state.dis_end, "2026-11-02");
  assert.equal(
    state.has_discount_period,
    true,
    "shared parent dates keep scheduling disclosed",
  );
  state.price = 52;
  const pending = state.setProductPrice();
  assert.equal(f.writes[0].body.pricing, false);
  f.writes[0].resolve({
    data: {
      success: true,
      product: { price: 52 },
      variant: { pricing: false },
    },
  });
  await pending;
  assert.equal(
    parent.price,
    52,
    "native response updates the shared parent tuple",
  );
  Object.assign(parent, { dis_start: null, dis_end: null });
  f.Page.watch.variant_pricing.call(state, false);
  assert.equal(state.has_discount_period, false);
  assert.equal(state.dis_start, null);
  assert.equal(state.dis_end, null);
});

test("empty optional values stay disclosed while existing commission, label and dates remain present", async () => {
  const empty = await environment({
    product: product({ discount: 0 }),
  }).render();
  assert.equal(
    empty.calls.filter((call) => call.name === "UPriceInput").length,
    2,
  );
  assert.equal(
    empty.calls.filter((call) => call.name === "v-text-field").length,
    0,
  );
  const populated = await environment({
    product: product({
      commission: 2,
      discount: 5,
      price_label: "/ unit",
      dis_start: "2026-11-01",
      dis_end: "2026-11-01",
    }),
  }).render();
  assert.deepEqual(
    populated.calls
      .filter((call) => call.name === "UPriceInput")
      .map((call) => call.attrs.modelValue),
    [10, 2, 5],
  );
  const label = populated.calls.find((call) => call.name === "v-text-field");
  assert.equal(label.attrs.modelValue, "/ unit");
  assert.equal(Number(label.attrs.counter), 32);
  assert.equal(Number(label.attrs.maxlength ?? label.attrs.maxLength), 32);
  const dates = populated.calls.filter((call) => call.name === "UDateInput");
  assert.equal(dates.length, 2);
  assert.equal(dates[0].attrs.max, "2026-11-01");
  assert.equal(dates[1].attrs.min, "2026-11-01");
  assert.ok(dates.every((call) => Object.hasOwn(call.attrs, "return-utc")));
});

test("turning off scheduling clears both native dates; an empty start keeps the end unavailable", async () => {
  const f = environment({
      product: product({ dis_start: "2026-11-01", dis_end: "2026-11-02" }),
    }),
    state = f.state();
  f.Page.watch.has_discount_period.call(state, false);
  assert.equal(state.dis_start, null);
  assert.equal(state.dis_end, null);
  assert.equal(f.parameters.customObject.dis_start, null);
  assert.equal(f.parameters.customObject.dis_end, null);
  const shown = await environment({
    product: product({ dis_start: null, dis_end: null }),
  }).render({ has_discount_period: true });
  const end = shown.calls.filter((call) => call.name === "UDateInput").at(-1);
  assert.ok(end);
  assert.equal(end.attrs.disabled, true);
});

for (const type of ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"]) {
  test(`${type} retains its native pricing choices, related navigation and quantity-tier availability`, async () => {
    const f = environment({ product: product({ type }), variant: null }),
      shown = await f.render();
    assert.deepEqual(
      plain(shown.instance.available_pricing.map((value) => value.code)),
      type === "SERVICE" ? ["FIX", "AGREEMENT", "ESTIMATION"] : ["FIX"],
    );
    assert.equal(
      shown.calls.some((call) => call.name === "v-radio-group"),
      type === "SERVICE",
    );
    const supportsTiers = ["PHYSICAL", "VIRTUAL"].includes(type);
    assert.equal(
      shown.calls.some(
        (call) =>
          call.name === "v-btn" &&
          call.attrs.onClick === shown.instance.showAddExtraPrice,
      ),
      supportsTiers,
    );
    assert.equal(
      shown.calls.some(
        (call) =>
          call.name === "u-widget-header" &&
          call.attrs.to?.name === "BPageProductInventory",
      ),
      type === "SUBSCRIPTION",
    );
    assert.equal(f.writes.length, 0);
    if (type === "SERVICE") {
      const state = f.state();
      state.pricing = "ESTIMATION";
      const pending = state.setProductPrice();
      assert.equal(f.writes[0].body.pricing, "ESTIMATION");
      assert.match(f.writes[0].url, /\/price\/product$/);
      f.writes[0].resolve({
        data: { success: true, product: { pricing: "ESTIMATION" } },
      });
      await pending;
      assert.equal(f.parent.pricing, "ESTIMATION");
    }
  });
}

test("marketplace and vendor contexts retain native guidance, destinations and scoped tier props", async () => {
  const market = await environment({
    isMarketplace: true,
    product: product({ vendor_id: 8 }),
  }).render();
  assert.ok(
    market.calls.some(
      (call) =>
        call.name === "u-widget-header" &&
        call.attrs.to?.name === "BPageProductVendors",
    ),
  );
  assert.equal(
    market.calls.some(
      (call) =>
        call.name === "v-btn" &&
        call.attrs.onClick === market.instance.showAddExtraPrice,
    ),
    false,
  );
  const vendor = { id: 8 },
    vendorProduct = { id: 91 },
    variant = { id: 4, pricing: true };
  const f = environment({ vendor, vendorProduct, variant }),
    shown = await f.render({
      selected_extra_price: { min: 5 },
      show_add_extra_price: true,
    });
  const tier = shown.calls.find(
    (call) => call.name === "BProductExtraPricingAdd",
  );
  assert.equal(Vue.toRaw(tier.attrs.product), f.parent);
  assert.equal(tier.attrs.variant.id, 4);
  assert.equal(tier.attrs.vendor.id, 8);
  assert.equal(tier.attrs["vendor-product"].id, 91);
  assert.equal(tier.attrs.shop.id, 7);
});

test("quantity tiers stay filtered by variant/vendor and update their own saved collection without a main price write", async () => {
  const original = product({
    extra_pricings: [
      { id: 1, min: 5, variant_id: 4, vendor_id: null },
      { id: 2, min: 8, variant_id: 8, vendor_id: null },
      { id: 3, min: 10, variant_id: 4, vendor_id: 9 },
    ],
  });
  const f = environment({ product: original }),
    shown = await f.render({
      selected_extra_price: { min: 20 },
      show_add_extra_price: true,
    });
  assert.deepEqual(
    plain(shown.instance.extra_pricings_to_show.map((tier) => tier.id)),
    [1],
  );
  const add = shown.calls.find(
    (call) => call.name === "BProductExtraPricingAdd",
  );
  f.fire(add, "onOnAdd", {
    id: 4,
    min: 20,
    variant_id: 4,
    vendor_id: null,
    price: 9,
  });
  assert.equal(original.extra_pricings.find((tier) => tier.id === 4).price, 9);
  f.fire(add, "onOnEdit", { id: 4, min: 20, price: 7 });
  assert.equal(original.extra_pricings.find((tier) => tier.id === 4).price, 7);
  assert.equal(f.writes.length, 0);
  assert.equal(shown.instance.price, 10);
  const row = shown.calls.find(
    (call) => call.name === "BProductExtraPricingRow",
  );
  f.fire(row, "onOnDelete", 1);
  assert.equal(
    original.extra_pricings.some((tier) => tier.id === 1),
    false,
  );
  assert.equal(
    f.writes.length,
    0,
    "tier persistence remains in the native child APIs, separate from main Save",
  );
});
