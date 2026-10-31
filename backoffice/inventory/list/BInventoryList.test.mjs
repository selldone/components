import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("./BInventoryList.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "inventory-list-test",
});
assert.deepEqual(template.errors, []);
const plain = (value) => JSON.parse(JSON.stringify(value));
const settled = async () => {
  await setImmediate();
  await Vue.nextTick();
};
const ProductType = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
    code,
    { code, name: "types." + code, image: "/type/" + code },
  ]),
);
const ProductStatus = Object.fromEntries(
  ["Open", "Close", "Pending", "Rejected", "Unlisted"].map((code) => [
    code,
    { code, name: "statuses." + code },
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
  vm.runInNewContext(
    `
    Array.prototype.countUnique = function (key) { return new Set(this.map(value => value[key])).size; };
    String.prototype.limitWords = function (count) { return String(this).split(/\\s+/).slice(0, count).join(' '); };
    ${result.outputText}
  `,
    { exports, require: dependency, ...globals },
  );
  return exports;
}
function debounce(fn) {
  let queued = false,
    args;
  const schedule = function (...values) {
    queued = true;
    args = values;
  };
  schedule.flush = function () {
    if (!queued) return;
    queued = false;
    return fn.apply(this, args);
  };
  schedule.cancel = () => {
    queued = false;
  };
  return schedule;
}
function textOf(value) {
  if (Array.isArray(value)) return value.map(textOf).join("");
  if (value && typeof value === "object") return textOf(value.children);
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}
function watch(Page, key, state, ...args) {
  return (Page.watch[key].handler ?? Page.watch[key]).call(state, ...args);
}

const groupFile = new URL("./group-header/BInventoryListGroupHeader.vue", import.meta.url);
const { descriptor: group, errors: groupErrors } = parse(readFileSync(groupFile, "utf8"));
assert.deepEqual(groupErrors, []);
const groupTemplate = compileTemplate({ source: group.template.content, filename: groupFile.pathname, id: "inventory-group-test" });
assert.deepEqual(groupTemplate.errors, []);
async function renderGroup(product, { modern = true, isMobile = false, isOpen = false, rows } = {}) {
  const leaf = Vue.defineComponent({ setup: (_, { slots }) => () => Vue.h("span", slots.default?.()) });
  const dependency = name => name === "vue" ? Vue : name.includes("ProductType") ? { ProductType } : { default: leaf };
  const Group = evaluate(group.script.content, dependency).default;
  const compiled = evaluate(groupTemplate.code, dependency).render;
  const prices = [], toggled = [];
  let instance, button;
  const capture = node => {
    if (!node || typeof node !== "object") return;
    if (node.type === "button") button = node;
    if (Array.isArray(node.children)) node.children.forEach(capture);
  };
  const item = { items: (rows ?? [{ quantity: 7, calc_price: 11, status: product.status ?? "Open", sku: "CHILD-SKU", mpn: "CHILD-MPN" }]).map(row => ({ raw: { product, ...row } })) };
  const app = Vue.createSSRApp({
    ...Group,
    computed: { ...Group.computed, min_price: () => 11, max_price: () => 22, quantity: () => 7 },
    render(...args) {
      instance = this;
      const node = compiled.apply(this, args);
      capture(node);
      return node;
    },
  }, {
    modern, isMobile, columns: Array(7), isGroupOpen: () => isOpen,
    toggleGroup: value => toggled.push(value), item,
  });
  for (const name of ["v-icon", "v-avatar", "v-img", "v-list-item", "v-list-item-title", "v-list-item-subtitle", "v-spacer", "v-tooltip"]) app.component(name, leaf);
  app.component("u-price", Vue.defineComponent({ props: ["amount", "currency"], setup: props => () => { prices.push({ ...props }); return Vue.h("span", String(props.amount)); } }));
  app.config.globalProperties.$t = (key, values) => [key, ...Object.values(values ?? {})].join(" ");
  app.config.globalProperties.getShopImagePath = icon => icon;
  app.config.globalProperties.IMAGE_SIZE_SMALL = "small";
  const html = await renderToString(app);
  return { html, document: new JSDOM(`<table><tbody>${html}</tbody></table>`).window.document, instance, button, toggled, item, prices };
}

test("modern grouped price ranges keep the selected display currency used by expanded rows", async () => {
  for (const modern of [true, false]) {
    const { prices, html } = await renderGroup({ type: "PHYSICAL", title: "Native GBP product", currency: "GBP" }, { modern, isMobile: true });
    assert.equal(prices.length, 2);
    assert.deepEqual(prices.map(price => price.currency), modern ? [undefined, undefined] : ["GBP", "GBP"]);
    assert.match(html, /Native GBP product/);
    if (modern) assert.match(html, /aria-expanded="false"/);
  }
});

test("group header Vue, TypeScript and scoped Sass compile", async () => {
  await renderGroup({ type: "PHYSICAL", title: "Local group", product_variants: [] });
  for (const style of group.styles) {
    assert.equal(style.scoped, true);
    const styleFile = style.src ? new URL(style.src, groupFile) : groupFile;
    const source = style.src ? readFileSync(styleFile, "utf8") : style.content;
    assert.ok(source.trim());
    const result = await compileStyleAsync({ source, filename: styleFile.pathname, id: "inventory-group-test", scoped: true, preprocessLang: style.lang });
    assert.deepEqual(result.errors, []);
  }
});

test("modern group header shows raw parent identifiers and uses all loaded variants for stock coverage even when group rows are a subset", async () => {
  const parent = { type: "PHYSICAL", status: "Close", title: "Parent product", sku: "0000123-A", mpn: "00 / P-004", currency: "GBP", product_variants: [{ id: 91, quantity: 4, enable: false }, { id: 92, quantity: 0 }, { id: 93, quantity: "2.5" }] };
  const before = plain(parent);
  for (const isOpen of [false, true]) {
    const rendered = await renderGroup(parent, { isOpen, rows: [{ variant_id: 92, quantity: 0, status: "Close", sku: "CHILD-92", mpn: "CHILD-MPN-92" }] });
    assert.equal(rendered.instance.variant_count, 3);
    assert.deepEqual(plain(rendered.instance.stock_summary), { stocked: 2, total: 3, percentage: 67 });
    assert.match(rendered.document.body.textContent, /0000123-A/);
    assert.match(rendered.document.body.textContent, /00 \/ P-004/);
    assert.doesNotMatch(rendered.document.body.textContent, /CHILD-92|CHILD-MPN-92/);
    const button = rendered.document.querySelector("button");
    assert.equal(button.type, "button");
    assert.equal(button.getAttribute("aria-expanded"), String(isOpen));
    assert.equal(button.querySelector("button, a[href], input, select"), null);
    rendered.button.props.onClick();
    assert.equal(rendered.toggled.length, 1);
    assert.equal(Vue.toRaw(rendered.toggled[0]), rendered.item);
    const meter = rendered.document.querySelector('.b-inventory-list-group__stock-bar');
    assert.equal(meter.getAttribute("aria-hidden"), "true");
    assert.equal(meter.querySelector('.b-inventory-list-group__stock-fill').style.width, "67%");
    assert.match(rendered.document.querySelector('.b-inventory-list-group__stock-count').textContent, /group_stock_count 2 3/);
    assert.equal(rendered.document.querySelector('.b-inventory-list-group__percentage').textContent, "67%");
    assert.deepEqual(plain(parent), before);
    assert.equal(rendered.instance.icon, "block", "publication status stays independent of positive stock");
  }
});

test("group stock coverage keeps zero, full and disabled inventory in the same finite variant denominator", async () => {
  for (const [type, variants, expected] of [
    ["PHYSICAL", [{ quantity: 0 }, { quantity: "0" }], { stocked: 0, total: 2, percentage: 0 }],
    ["PHYSICAL", [{ quantity: 2 }, { quantity: 3, enable: false }], { stocked: 2, total: 2, percentage: 100 }],
    ["PHYSICAL", [{ quantity: -1 }, { quantity: 2 }], { stocked: 1, total: 2, percentage: 50 }],
    ["VIRTUAL", [{ quantity: "0.5", enable: false }, { quantity: 0 }], { stocked: 1, total: 2, percentage: 50 }],
  ]) {
    const rendered = await renderGroup({ type, title: "Local group", product_variants: variants });
    assert.equal(rendered.instance.variant_count, variants.length);
    assert.deepEqual(plain(rendered.instance.stock_summary), expected);
    const meter = rendered.document.querySelector('.b-inventory-list-group__stock-bar');
    assert.equal(meter.getAttribute("aria-hidden"), "true");
    assert.equal(meter.querySelector('.b-inventory-list-group__stock-fill').style.width, expected.percentage + "%");
    assert.match(rendered.document.querySelector('.b-inventory-list-group__stock-count').textContent, new RegExp(`group_stock_count ${expected.stocked} ${expected.total}`));
    assert.equal(rendered.document.querySelector('.b-inventory-list-group__percentage').textContent, expected.percentage + "%");
  }
});

test("group headers omit stock ratios for missing, invalid and untracked quantities without inventing variants", async () => {
  for (const [type, variants] of [
    ["PHYSICAL", undefined],
    ["PHYSICAL", null],
    ["PHYSICAL", [{ quantity: null }]],
    ["PHYSICAL", [{ quantity: "" }]],
    ["PHYSICAL", [{ quantity: "   " }]],
    ["PHYSICAL", [{ quantity: true }]],
    ["PHYSICAL", [{ quantity: false }]],
    ["PHYSICAL", [{ quantity: "not a number" }]],
    ["PHYSICAL", [{ quantity: undefined }]],
    ["PHYSICAL", [{ quantity: NaN }]],
    ["PHYSICAL", [{ quantity: Infinity }]],
    ["VIRTUAL", [{ quantity: 2 }, { quantity: null }]],
    ["FILE", [{ quantity: 0 }]],
    ["SERVICE", [{ quantity: 0 }]],
    ["SUBSCRIPTION", [{ quantity: 0 }]],
  ]) {
    const rendered = await renderGroup({ type, title: "Incomplete group", variants: [{ color: "red" }, { color: "blue" }], product_variants: variants });
    assert.equal(rendered.instance.variant_count, Array.isArray(variants) ? variants.length : null);
    assert.equal(rendered.instance.stock_summary, null);
    assert.equal(rendered.document.querySelector('.b-inventory-list-group__stock-bar'), null);
    if (["FILE", "SERVICE", "SUBSCRIPTION"].includes(type)) {
      assert.match(rendered.document.body.textContent, /group_untracked_stock/);
      assert.match(rendered.document.body.textContent, /global.commons.infinite/);
    } else assert.match(rendered.document.body.textContent, /group_stock_unknown/);
  }
});

test("a grouped parent without variants retains parent stock while legacy headers omit the new identifiers and meter", async () => {
  for (const quantity of [0, 3, null]) {
    const parent = { type: "PHYSICAL", title: "Simple product", sku: "000-PARENT", mpn: "000-MPN", quantity, product_variants: [] };
    const modern = await renderGroup(parent);
    assert.equal(modern.instance.variant_count, 0);
    assert.equal(modern.instance.stock_summary, null);
    assert.match(modern.document.body.textContent, /group_no_variants/);
    assert.match(modern.document.body.textContent, new RegExp(quantity === null ? "group_stock_unknown" : quantity > 0 ? "group_in_stock" : "group_out_of_stock"));
    assert.equal(modern.document.querySelector('.b-inventory-list-group__stock-bar'), null);
    const legacy = await renderGroup(parent, { modern: false });
    assert.doesNotMatch(legacy.document.body.textContent, /000-PARENT|000-MPN|group_no_variants/);
    assert.equal(legacy.document.querySelector('.b-inventory-list-group__stock-bar'), null);
  }
});
function stopEvent() {
  return {
    stopped: false,
    stopPropagation() {
      this.stopped = true;
    },
  };
}

function environment(props = {}) {
  const reads = [],
    writes = [],
    calls = [],
    notices = [],
    routes = [],
    temporary = [];
  const leaf = (name) =>
    Vue.defineComponent({
      name,
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          if (name === "v-tooltip") {
            calls.push({ name, attrs });
            return Vue.h(Vue.Fragment, [
              slots.activator?.({ props: {} }),
              slots.default?.(),
            ]);
          }
          const content =
            name === "v-data-table-server"
              ? [
                  Vue.h("table", [
                    Vue.h(
                      "tbody",
                      attrs.items.map((item) =>
                        Vue.h(
                          "tr",
                          { "data-key": item.key },
                          attrs.headers.map((header) =>
                            Vue.h(
                              "td",
                              { "data-column": header.value ?? header.key },
                              slots[`item.${header.value ?? header.key}`]?.({
                                item,
                              }),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ]),
                  slots.bottom?.(),
                  !attrs.items.length && slots["no-data"]?.(),
                ]
              : [
                  slots.default?.(),
                  slots["prepend-inner"]?.(),
                  slots["append-inner"]?.(),
                ];
          calls.push({ name, attrs, text: textOf(content) });
          if (name === "u-price")
            return Vue.h(
              "span",
              { "data-price": attrs.amount, "data-currency": attrs.currency },
              String(attrs.amount),
            );
          return Vue.h(
            name === "RouterLink" || attrs.href ? "a" : "div",
            { "data-leaf": name, class: attrs.class },
            content,
          );
        };
      },
    });
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name === "lodash-es") return { debounce, throttle: (fn) => fn };
    if (name.includes("NotificationService"))
      return {
        default: {
          showErrorAlert: (_, error) => notices.push(["server", error]),
          showLaravelError: (error) => notices.push(["network", error]),
          showSuccessAlert: (_, message) => notices.push(["success", message]),
        },
      };
    if (name.includes("TemporaryDataHelper"))
      return {
        TemporaryDataHelper: { Set: (_, value) => temporary.push(value) },
      };
    if (name.endsWith(".vue"))
      return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    if (name.includes("ProductStatus")) return { ProductStatus };
    if (name.includes("ProductType")) return { ProductType };
    if (name.includes("BusinessModel"))
      return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
    if (name.includes("CurrencyHelper"))
      return {
        CurrencyHelper: { GetUserSelectedCurrency: () => ({ code: "USD" }) },
      };
    if (name.includes("Mixin")) return { default: {} };
    if (/\.(svg|png)$/.test(name)) return name;
    throw new Error("Unexpected dependency " + name);
  };
  const Page = evaluate(descriptor.script.content, dependency, {
    axios: {
      get: (url, config) =>
        new Promise((resolve, reject) =>
          reads.push({ url, config, resolve, reject }),
        ),
      post: (url, body) =>
        new Promise((resolve, reject) =>
          writes.push({ url, body, resolve, reject }),
        ),
    },
    window: {
      SERACH_THROTTLE: 0,
      API: {
        GET_ALL_MY_PRODUCTS: (id) => `/shop/${id}/products`,
        POST_PRODUCT_QUANTITY: (id, product, variant) =>
          `/shop/${id}/products/${product}/quantity/${variant ?? "product"}`,
      },
    },
  }).default;
  Page.render = evaluate(template.code, dependency).render;
  const parameters = {
    shop: { id: 7, model: "NORMAL", currencies: ["USD", "EUR"] },
    modern: true,
    onlyDropshipping: true,
    ...props,
  };
  const helpers = {
    $t: (key, params) => (params ? `${key}:${JSON.stringify(params)}` : key),
    $route: {
      name: "BPageWholesalerInventory",
      params: { shop_id: 7 },
      matched: [],
    },
    $router: {
      push: (route) => {
        routes.push(route);
        return Promise.resolve();
      },
    },
    $vuetify: {
      display: { xs: false, width: 1600 },
      locale: { isRtl: false },
      theme: { current: { dark: false } },
    },
    $nextTick: (callback) => Promise.resolve().then(() => callback?.()),
    $forceUpdate() {},
    IMAGE_SIZE_SMALL: "small",
    getShopImagePath: (icon) => "/shop/" + icon,
    getProductTypeImage: (code) => "/type/" + code,
    CalcPriceProductCurrentCurrency: (_, product, variant) => {
      const price = variant?.pricing ? variant : product;
      return price.price + price.commission - price.discount;
    },
    numeralFormat: (value) => String(value),
    $localstorage_base_path: () => "isolated-inventory",
  };
  function stateFor(data = {}) {
    const state = {
      ...Page.data.call(parameters),
      ...helpers,
      ...parameters,
      ...data,
    };
    for (const [key, method] of Object.entries(Page.methods))
      state[key] = method.bind(state);
    for (const [key, option] of Object.entries(Page.computed)) {
      const computed = typeof option === "function" ? { get: option } : option;
      Object.defineProperty(state, key, {
        get: () => computed.get.call(state),
        set: computed.set
          ? (value) => computed.set.call(state, value)
          : undefined,
      });
    }
    Page.created?.call(state);
    return state;
  }
  const state = stateFor();
  function flatten(products) {
    state.products = products;
    watch(Page, "products", state);
    return state.items;
  }
  async function render(products = [], data = {}, supplied = {}) {
    calls.length = 0;
    const items = flatten(products);
    let instance;
    const app = Vue.createSSRApp(
      {
        ...Page,
        mixins: [],
        watch: {},
        data: () => ({
          ...Page.data.call(parameters),
          products,
          items,
          totalItems: products.length,
          group_mode: false,
          busy_fetch: false,
          ...data,
        }),
        created() {
          Page.created?.call(this);
          instance = this;
        },
      },
      { ...parameters, ...supplied },
    );
    Object.assign(app.config.globalProperties, helpers);
    for (const name of [
      "v-row",
      "v-container",
      "v-spacer",
      "v-divider",
      "v-text-field",
      "v-data-table-server",
      "v-icon",
      "v-img",
      "v-avatar",
      "v-btn",
      "v-tooltip",
      "v-pagination",
      "v-btn-toggle",
      "v-select",
      "v-list",
      "v-list-item",
      "v-list-subheader",
      "v-dialog",
      "v-card",
      "v-card-title",
      "v-card-text",
      "v-card-actions",
      "u-loading-progress",
      "u-price",
    ])
      app.component(name, leaf(name));
    app.component("router-link", leaf("RouterLink"));
    app.directive("copy", { getSSRProps: () => ({ "data-copy": true }) });
    const html = await renderToString(app);
    return { html, document: new JSDOM(html).window.document, instance };
  }
  return {
    Page,
    state,
    parameters,
    reads,
    writes,
    calls,
    notices,
    routes,
    temporary,
    flatten,
    render,
  };
}
const variant = (overrides = {}) => ({
  id: 101,
  quantity: 24,
  pricing: false,
  enable: true,
  sku: "SKU-BLACK",
  mpn: "MPN-BASE",
  image: "black.svg",
  price: 150,
  commission: 2,
  discount: 1,
  currency: "EUR",
  ...overrides,
});
const product = (overrides = {}) => ({
  id: 10,
  title: "Espresso machine",
  title_en: "Complete original product title",
  type: "PHYSICAL",
  icon: "machine.svg",
  quantity: 51,
  original: true,
  status: "Open",
  sku: "PRODUCT-SKU",
  mpn: "PRODUCT-MPN",
  pricing: "FIX",
  price: 129,
  commission: 0,
  discount: 0,
  currency: "USD",
  dis_start: null,
  dis_end: null,
  extra_pricings: [],
  product_variants: [
    variant(),
    variant({
      id: 102,
      quantity: 27,
      pricing: true,
      sku: "SKU-SILVER",
      enable: false,
    }),
  ],
  ...overrides,
});
const success = (products = [], total = products.length) => ({
  data: { products, total },
});

function pricingEnvironment() {
  const { descriptor: pricing } = parse(
    readFileSync(
      new URL(
        "../../product/edit/price/BProductEditPrice.vue",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  const Currency = { USD: { code: "USD" }, EUR: { code: "EUR" } },
    writes = [],
    notices = [];
  const Page = evaluate(
    pricing.script.content,
    (name) => {
      if (name.endsWith(".vue") || name.includes("Mixin"))
        return { default: {} };
      if (name.includes("/Currency")) return { Currency };
      if (name.includes("PricingTypes"))
        return { PricingTypes: { FIX: { code: "FIX" } } };
      if (name.includes("ProductType")) return { ProductType };
      if (name.includes("ColorGenerator")) return { standardDesignColor: [] };
      if (name.includes("PriceHelper")) return { PriceHelper: {} };
      if (name.includes("NotificationService"))
        return {
          default: {
            showLaravelError: (error) => notices.push(error),
            showErrorAlert: (_, error) => notices.push(error),
            showSuccessAlert() {},
          },
        };
      throw new Error("Unexpected pricing dependency " + name);
    },
    {
      axios: {
        put: (url, body) =>
          new Promise((resolve, reject) =>
            writes.push({ url, body, resolve, reject }),
          ),
      },
      window: {
        API: {
          PUT_EDIT_PRODUCT_PRICE: (shop, product, variant) =>
            `/shop/${shop}/products/${product}/price/${variant}`,
        },
      },
    },
  ).default;
  return { Page, Currency, writes, notices };
}

test("real inventory template, TypeScript and scoped Sass compile", async () => {
  environment();
  for (const style of descriptor.styles) {
    assert.equal(style.scoped, true);
    const result = await compileStyleAsync({
      source: style.content,
      filename: file.pathname,
      id: "inventory-list-test",
      scoped: true,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("product pagination and variant rows preserve distinct identities and pricing ownership", () => {
  const f = environment();
  const items = f.flatten([
    product(),
    product({
      id: 20,
      title: "No variants",
      product_variants: [],
      quantity: 0,
    }),
  ]);
  assert.equal(f.state.products.length, 2);
  assert.equal(items.length, 3);
  assert.deepEqual(
    plain(
      items.map(({ key, id, variant_id, code }) => ({
        key,
        id,
        variant_id,
        code,
      })),
    ),
    [
      { key: "10-101", id: 10, variant_id: 101, code: "P-10/V-101" },
      { key: "10-102", id: 10, variant_id: 102, code: "P-10/V-102" },
      { key: 20, id: 20, code: "P-20" },
    ],
  );
  assert.equal(items[0].price, 129);
  assert.equal(items[0].currency, "USD");
  assert.equal(items[1].price, 150);
  assert.equal(items[1].currency, "EUR");
  assert.equal(items[1].disabled, true);
  assert.equal(items[2].quantity, 0);
  assert.equal(f.state.itemsPerPage, 10);
});

test("supplier inventory keeps the existing bounded full-variant server query", () => {
  const f = environment();
  f.state.filters = ["Open", "Pending", "PHYSICAL"];
  f.state.search_type = "exact";
  f.state.search = "P-10";
  f.state.fetchData(3, "title", false);
  assert.deepEqual(plain(f.reads.at(-1)), {
    url: "/shop/7/products",
    config: {
      params: {
        statuses: ["Open", "Pending"],
        types: ["PHYSICAL"],
        offset: 20,
        limit: 10,
        sortBy: "title",
        sortDesc: false,
        dir: "*",
        products_only: true,
        need_full_variants: true,
        optimized: true,
        search_type: "exact",
        search: "P-10",
        with_parent: true,
        with_total: true,
        only_dropshipping: true,
        with_extra_pricings: true,
      },
    },
  });
});

test("legacy and other modern callers retain their own columns and query scope", async () => {
  for (const modern of [false, true]) {
    const f = environment({ modern, onlyDropshipping: false });
    const rendered = await f.render([product()]);
    const table = f.calls.find(
      (call) => call.name === "v-data-table-server",
    ).attrs;
    assert.deepEqual(
      plain(table.headers.map(({ value }) => value)),
      modern
        ? ["title", "id", "sku", "status", "quantity", "price", "change"]
        : [
            "icon",
            "title",
            "id",
            "sku",
            "mpn",
            "original",
            "status",
            "quantity",
            "price",
            "change",
          ],
    );
    assert.match(rendered.document.body.textContent, /Espresso machine/);
    assert.match(rendered.document.body.textContent, /SKU-BLACK/);
    f.state.fetchData();
    assert.equal(f.reads.at(-1).config.params.only_dropshipping, false);
  }
});

test("bulk dialogs retain their own full-shop scope instead of inheriting the inventory query", async () => {
  const f = environment();
  f.state.search = "SKU-BLACK";
  f.state.filters = ["Open"];
  f.state.showBulkPrice();
  f.state.showBulkDiscount();
  await f.render([product()], {
    show_bulk_price: true,
    show_bulk_discount: true,
  });
  for (const name of ["BInventoryBulkPrice", "BInventoryBulkDiscount"]) {
    const attrs = f.calls.find((call) => call.name === name).attrs;
    assert.equal(attrs.shop.id, 7);
    for (const scope of [
      "onlyDropshipping",
      "only-dropshipping",
      "search",
      "filters",
      "category",
      "products",
    ])
      assert.equal(
        attrs[scope],
        undefined,
        name + " keeps its own " + scope + " scope",
      );
  }
  assert.equal(f.writes.length, 0);
});

test("standard and supplier inventory opt both bulk dialogs into modern presentation while legacy callers keep native presentation and events", async () => {
  for (const [modern, onlyDropshipping] of [
    [true, false],
    [true, true],
    [false, false],
    [false, true],
  ]) {
    const f = environment({ modern, onlyDropshipping });
    const { instance } = await f.render([], {
      show_bulk_price: true,
      show_bulk_discount: true,
    });
    for (const [name, model] of [
      ["BInventoryBulkPrice", "show_bulk_price"],
      ["BInventoryBulkDiscount", "show_bulk_discount"],
    ]) {
      const attrs = f.calls.find((call) => call.name === name).attrs;
      assert.equal(attrs.modern, modern);
      assert.equal(attrs.modelValue, true);
      assert.equal(attrs.shop.id, 7);
      attrs["onUpdate:modelValue"](false);
      assert.equal(instance[model], false);
      attrs.onUpdate();
      assert.equal(f.reads.at(-1).url, "/shop/7/products");
      assert.equal(f.reads.at(-1).config.params.only_dropshipping, onlyDropshipping);
    }
    assert.equal(f.reads.length, 2);
    assert.equal(f.writes.length, 0);
  }
});

test("price editor receives the actual product and selected variant for existing quantity tiers", async () => {
  const f = environment(),
    original = product({
      extra_pricings: [
        {
          id: 301,
          variant_id: 102,
          min: 5,
          price: 120,
          commission: 2,
          discount: 1,
        },
      ],
    });
  const item = f.flatten([original])[1];
  f.state.showEditPrice(item);
  await settled();
  assert.equal(f.state.instanceProduct, original);
  assert.equal(f.state.selected_item, item);
  assert.notEqual(f.state.item_clone, item);
  assert.equal(f.state.variant_pricing, true);
  const { instance } = await f.render([original], {
    instanceProduct: original,
    selected_item: item,
    item_clone: f.state.item_clone,
    show_price_dialog: true,
    show_price_dialog_pre: true,
    variant_pricing: true,
  });
  const editor = f.calls.find(
    (call) => call.name === "BProductEditPrice",
  ).attrs;
  assert.equal(Vue.toRaw(editor.product), original);
  assert.equal(editor.variant.id, 102);
  assert.equal(editor["instance-product-id"], 10);
  assert.equal(editor["instance-variant-id"], 102);
  assert.equal(Vue.toRaw(editor["instance-original-product"]), original);
  assert.ok(Object.hasOwn(editor, "instance-mode"));
  assert.ok(Object.hasOwn(editor, "external-action-buttons"));
  assert.equal(editor.modern, true);
  assert.equal(f.writes.length, 0);
  instance.show_price_dialog = false;
  assert.equal(
    item.price,
    150,
    "opening/cancelling the editor does not save a price",
  );
});

test("Unified pricing wrapper retains native identity and controls only for supplier inventory", async () => {
  for (const props of [
    { modern: true, onlyDropshipping: true },
    { modern: false, onlyDropshipping: true },
    { modern: true, onlyDropshipping: false },
  ]) {
    const f = environment(props), original = product(), item = f.flatten([original])[1];
    const { document, instance } = await f.render([original], {
      instanceProduct: original,
      selected_item: item,
      item_clone: { ...item },
      show_price_dialog: true,
      show_price_dialog_pre: true,
      variant_pricing: true,
    });
    const wholesale = props.modern && props.onlyDropshipping;
    const dialog = f.calls.find(call => call.name === "v-dialog").attrs;
    assert.ok(Object.hasOwn(dialog, "fullscreen"));
    assert.ok(Object.hasOwn(dialog, "scrollable"));
    assert.equal(dialog.modelValue, true);
    assert.equal(dialog.persistent, false);
    const title = f.calls.find(call => call.name === "v-card-title");
    const image = f.calls.filter(call => call.name === "UAvatarFolder").at(-1).attrs;
    assert.equal(image.src, "/shop/black.svg");
    assert.equal(image.size, wholesale ? 38 : 48);
    const child = f.calls.find(call => call.name === "BProductEditPrice").attrs;
    assert.equal(child.modern, wholesale);
    assert.equal(Vue.toRaw(child.product), original);
    assert.equal(child.variant.id, 102);
    assert.equal(!!document.querySelector(".b-inventory-list__price-dialog--wholesale"), wholesale);
    const footer = document.querySelector('[data-leaf="v-card-actions"]');
    if (wholesale) {
      assert.match(title.text, /add_product\.pricing\.modern\.dialog_title/);
      assert.match(title.text, /Espresso machine/);
      assert.match(title.text, /P-10\/V-102/);
      const context = document.querySelector(".b-inventory-list__price-context");
      assert.ok(context.querySelector('[data-leaf="VariantItemViewMicro"]'));
      const consequence = document.querySelector(".b-inventory-list__price-consequence");
      assert.equal(consequence.classList.contains("sd-modern-notice"), false);
      const editor = document.querySelector('[data-leaf="BProductEditPrice"]');
      assert.ok(editor.compareDocumentPosition(consequence) & 4, "the reseller consequence follows the complete editor and tiers");
      assert.equal(footer.querySelector(".widget-buttons"), null);
      assert.ok(footer.querySelector(".b-inventory-list__price-actions"));
      const cancel = f.calls.find(call => call.name === "v-btn" && call.text === "global.actions.cancel");
      assert.ok(cancel);
      cancel.attrs.onClick();
      assert.equal(instance.show_price_dialog, false);
      assert.equal(f.writes.length, 0, "Cancel does not save pricing");
    } else {
      assert.doesNotMatch(title.text, /add_product\.pricing\.modern\.dialog_title/);
      assert.match(title.text, /Complete original product title/);
      assert.ok(footer.querySelector(".widget-buttons"));
      assert.equal(document.querySelector(".b-inventory-list__price-consequence"), null);
    }
  }
});

test("pending supplier pricing prevents dismissal and keeps the native save spinner", async () => {
  const f = environment(), original = product(), item = f.flatten([original])[0];
  await f.render([original], {
    instanceProduct: original,
    selected_item: item,
    item_clone: { ...item },
    show_price_dialog: true,
    show_price_dialog_pre: true,
    busy_save_price: true,
  });
  assert.equal(f.calls.find(call => call.name === "v-dialog").attrs.persistent, true);
  const close = f.calls.find(call => call.name === "v-btn" && call.attrs["aria-label"] === "global.actions.close");
  const cancel = f.calls.find(call => call.name === "v-btn" && call.text === "global.actions.cancel");
  const save = f.calls.filter(call => call.name === "v-btn" && call.text.includes("global.actions.save")).at(-1);
  assert.equal(close.attrs.disabled, true);
  assert.equal(cancel.attrs.disabled, true);
  assert.equal(save.attrs.disabled, true);
  assert.equal(save.attrs.loading, true);
  assert.ok(save.attrs.onClick);
});

test("approved wholesale layout has six columns, full copyable identifiers and separate native actions", async () => {
  const f = environment();
  const { document } = await f.render([product()]);
  const table = f.calls.find(
    (call) => call.name === "v-data-table-server",
  ).attrs;
  assert.deepEqual(plain(table.headers.map(({ value }) => value)), [
    "title",
    "sku",
    "status",
    "quantity",
    "price",
    "change",
  ]);
  assert.ok(table.headers.every(({ sortable }) => sortable === false));
  assert.equal(table["onClick:row"], undefined);
  const copied = [...document.querySelectorAll("[data-copy]")].map((element) =>
    element.textContent.trim(),
  );
  for (const value of [
    "P-10/V-101",
    "P-10/V-102",
    "SKU-BLACK",
    "SKU-SILVER",
    "MPN-BASE",
  ])
    assert.ok(copied.includes(value), value + " stays complete and copyable");
  assert.match(document.body.textContent, /Complete original product title/);
  assert.match(document.body.textContent, /inventory_list.table.original/);
  assert.match(document.body.textContent, /inventory_list.table.close_state/);
  assert.equal(
    f.calls.find((call) => call.name === "RouterLink").attrs.to.name,
    "BPageProductDashboard",
  );
  assert.equal(
    f.calls.find((call) => call.name === "RouterLink").attrs.to.params
      .product_id,
    10,
  );
  assert.deepEqual(plain(f.state.sortItems.map(({ value }) => value)), [
    null,
    "title",
    "id",
    "sku",
    "mpn",
    "status",
    "original",
    "quantity",
    "price",
  ]);
});

test("queued price dialogs cannot open after a Shop change or unmount", async () => {
  for (const boundary of ["shop", "unmount"]) {
    const f = environment(),
      [item] = f.flatten([product()]);
    f.state.showEditPrice(item);
    if (boundary === "unmount") f.Page.beforeUnmount.call(f.state);
    else {
      f.state.shop = { id: 8, model: "NORMAL" };
      watch(f.Page, "shop.id", f.state, 8, 7);
    }
    await settled();
    assert.equal(f.state.show_price_dialog, false);
    assert.equal(f.state.show_price_dialog_pre, false);
    assert.equal(f.writes.length, 0);
  }
});

test("switching a variant to shared pricing inherits the complete parent tuple including zero discount", () => {
  const f = pricingEnvironment();
  for (const discount of [7.5, 0]) {
    const original = product({
      currency: "EUR",
      price: 75.5,
      commission: 2.5,
      discount,
      dis_start: "2026-10-01",
      dis_end: "2026-11-01",
      price_label: "Per item",
    });
    const state = {
      instanceMode: true,
      instanceOriginalProduct: original,
      price: 99,
      currency: f.Currency.USD,
      commission: 4,
      discount: 12,
      dis_start: null,
      dis_end: null,
      price_label: null,
    };
    f.Page.methods.setSameAsProduct.call(state);
    assert.deepEqual(
      {
        price: state.price,
        currency: state.currency.code,
        commission: state.commission,
        discount: state.discount,
        dis_start: state.dis_start,
        dis_end: state.dis_end,
        price_label: state.price_label,
      },
      {
        price: 75.5,
        currency: "EUR",
        commission: 2.5,
        discount,
        dis_start: "2026-10-01",
        dis_end: "2026-11-01",
        price_label: "Per item",
      },
    );
  }
});

test("a failed native pricing save retains the dialog and draft for retry", async () => {
  const f = environment(),
    pricing = pricingEnvironment();
  const child = {
    instanceMode: true,
    instanceVariantId: 102,
    instanceProductId: 10,
    variant_pricing: false,
    shop: f.state.shop,
    price: 129,
    currency: pricing.Currency.USD,
    commission: 2,
    discount: 5,
    dis_start: null,
    dis_end: null,
    price_label: "Per item",
    $t: (key) => key,
    $emit(event) {
      if (event === "update:instance") f.state.onUpdatePrice();
    },
    instanceObject: { product: {}, variant: {} },
    instanceOriginalProduct: product(),
  };
  f.state.$refs = {
    price_edit: {
      setProductPrice: () => pricing.Page.methods.setProductPrice.call(child),
    },
  };
  f.state.show_price_dialog = true;
  const save = f.state.savePrice();
  assert.equal(f.state.busy_save_price, true);
  assert.equal(child.busy_update, true);
  assert.equal(pricing.writes[0].url, "/shop/7/products/10/price/102");
  assert.equal(pricing.writes[0].body.pricing, false);
  await f.state.savePrice();
  assert.equal(pricing.writes.length, 1, "a pending save cannot submit twice");
  pricing.writes[0].reject(new Error("native pricing failed"));
  await save;
  assert.equal(f.state.busy_save_price, false);
  assert.equal(child.busy_update, false);
  assert.equal(pricing.notices.length, 1);
  assert.equal(f.state.show_price_dialog, true);
  assert.equal(child.discount, 5);
  const retry = f.state.savePrice();
  assert.equal(pricing.writes.length, 2);
  assert.deepEqual(plain(pricing.writes[1].body), plain(pricing.writes[0].body));
  pricing.writes[1].resolve({ data: { product: { price: 129, discount: 5 }, variant: {} } });
  await retry;
  assert.equal(f.state.busy_save_price, false);
  assert.equal(f.state.show_price_dialog, false, "only a successful native update closes the dialog");
  assert.equal(f.reads.length, 1, "the existing success event refreshes inventory");
});

test("Add/Set accepts only changed whole nonnegative targets and preserves product restrictions", () => {
  const f = environment(),
    item = f.flatten([product()])[0];
  assert.equal(f.state.isChanged(item), false);
  for (const number of [5, "5", -24]) {
    Object.assign(item, { add: true, number });
    assert.equal(f.state.validStock(item), true);
    assert.equal(f.state.isChanged(item), true);
  }
  for (const number of ["", null, undefined, 1.5, -25, Infinity, NaN]) {
    Object.assign(item, { add: true, number });
    assert.equal(f.state.validStock(item), false);
    assert.equal(f.state.isChanged(item), false);
  }
  Object.assign(item, { add: true, number: -1001, quantity: 2000 });
  assert.equal(
    f.state.validStock(item),
    false,
    "Add's delta lower bound remains −1000",
  );
  Object.assign(item, { add: false, number: 0, quantity: 24 });
  assert.equal(f.state.stockTarget(item), 0);
  assert.equal(f.state.isChanged(item), true);
  item.number = 24;
  assert.equal(f.state.isChanged(item), false);
  for (const type of ["VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"])
    assert.equal(f.state.canEditStock({ ...item, type }), false);
  assert.equal(
    f.state.canEditStock({ ...item, product: { parent_id: 42 } }),
    false,
  );
  f.state.shop.model = "MARKETPLACE";
  assert.equal(f.state.canEditStock(item), false);
});

test("pending rows freeze quantity/mode controls while other row drafts remain available", async () => {
  const f = environment();
  await f.render([product()], {
    stock_busy: { "10-101": true },
    busy_fetch: false,
  });
  const inputs = f.calls.filter((call) => call.name === "UNumberInput");
  assert.deepEqual(
    inputs.map(({ attrs }) => attrs.disabled),
    [true, false],
  );
  const modes = f.calls.filter((call) => call.name === "v-btn-toggle");
  assert.deepEqual(
    modes.map(({ attrs }) => attrs.disabled),
    [true, false],
  );
  await f.render([product()], { busy_fetch: true });
  assert.ok(
    f.calls
      .filter((call) => call.name === "UNumberInput")
      .every(({ attrs }) => attrs.disabled),
  );
});

test("stock saves capture absolute quantities and isolate simultaneous rows", async () => {
  const f = environment(),
    [first, second] = f.flatten([product()]);
  Object.assign(f.state, {
    page: 2,
    sortBy: [{ key: "title", order: "asc" }],
    options: { page: 2, sortBy: [{ key: "title", order: "asc" }] },
  });
  first.number = 5;
  second.add = false;
  second.number = 17;
  f.state.updateProductQuantity(first);
  assert.deepEqual(plain(f.writes[0]), {
    url: "/shop/7/products/10/quantity/101",
    body: { quantity: 29 },
  });
  assert.equal(first.quantity, 24, "stock is not committed optimistically");
  assert.equal(f.state.stock_busy[first.key], true);
  f.state.updateProductQuantity(first);
  assert.equal(f.writes.length, 1);
  f.state.updateProductQuantity(second);
  assert.deepEqual(plain(f.writes[1].body), { quantity: 17 });
  assert.equal(f.state.stock_busy[second.key], true);
  first.number = 999;
  f.writes[0].resolve({ data: { quantity: 29 } });
  await settled();
  assert.equal(first.quantity, 29);
  assert.equal(first.number, 0);
  assert.equal(f.state.stock_busy[first.key], undefined);
  assert.equal(f.state.stock_busy[second.key], true);
  assert.equal(second.number, 17);
  assert.equal(f.reads.at(-1).config.params.offset, 10);
  assert.equal(f.reads.at(-1).config.params.sortBy, "title");
  assert.equal(f.reads.at(-1).config.params.sortDesc, false);
  f.writes[1].resolve({ data: { quantity: 17 } });
  await settled();
  assert.equal(second.quantity, 17);
  assert.equal(second.number, 17);
  assert.deepEqual(plain(f.state.stock_busy), {});
});

test("failed stock writes retain the draft and show a working inline Retry", async () => {
  for (const kind of ["server", "network"]) {
    const f = environment(),
      [item] = f.flatten([product()]);
    item.number = -3;
    f.state.updateProductQuantity(item);
    if (kind === "network") f.writes[0].reject(new Error("stock failed"));
    else
      f.writes[0].resolve({ data: { error: true, error_msg: "stock failed" } });
    await settled();
    assert.equal(item.quantity, 24);
    assert.equal(item.number, -3);
    assert.equal(f.state.stock_errors[item.key], true);
    assert.equal(f.state.stock_busy[item.key], undefined);
    assert.equal(f.reads.length, 0);
    const { instance } = await f.render([item.product], {
      items: [item],
      stock_errors: { [item.key]: true },
    });
    const retry = f.calls.find(
      (call) =>
        call.name === "v-btn" && call.text.includes("global.actions.retry"),
    );
    assert.ok(retry);
    retry.attrs.onClick(stopEvent());
    assert.deepEqual(plain(f.writes.at(-1).body), { quantity: 21 });
    f.writes.at(-1).resolve({ data: { quantity: 21 } });
    await settled();
    assert.equal(instance.items[0].quantity, 21);
    assert.equal(instance.stock_errors[item.key], undefined);
  }
});

test("a stock response updates the current visible row after the list replaced its original object", async () => {
  const f = environment(),
    [detached] = f.flatten([product()]);
  detached.number = 5;
  f.state.updateProductQuantity(detached);
  f.state.fetchData(1);
  f.reads.at(-1).resolve(
    success([
      product({
        quantity: 52,
        product_variants: [
          variant({ quantity: 25 }),
          variant({ id: 102, quantity: 27, pricing: true }),
        ],
      }),
    ]),
  );
  await settled();
  watch(f.Page, "products", f.state);
  const current = f.state.items[0];
  assert.notEqual(current, detached);
  assert.equal(current.number, 5);
  f.writes[0].resolve({ data: { quantity: 29 } });
  await settled();
  assert.equal(current.quantity, 29);
  assert.equal(current.number, 0);
  assert.equal(f.state.products[0].product_variants[0].quantity, 29);
});

test("older inventory reads cannot replace a newer list or finish its loading", async () => {
  for (const outcome of ["success", "server", "network"]) {
    const f = environment();
    f.state.fetchData(1);
    const older = f.reads.at(-1);
    f.state.fetchData(2);
    const current = f.reads.at(-1);
    if (outcome === "network") older.reject(new Error("old read"));
    else
      older.resolve(
        outcome === "server"
          ? { data: { error: true, error_msg: "old error" } }
          : success([product({ title: "Old product" })], 99),
      );
    await settled();
    assert.deepEqual(plain(f.state.products), []);
    assert.equal(f.state.busy_fetch, true);
    assert.equal(f.state.fetch_error, false);
    assert.deepEqual(f.notices, []);
    current.resolve(success([product({ title: "Current product" })], 26));
    await settled();
    assert.equal(f.state.products[0].title, "Current product");
    assert.equal(f.state.totalItems, 26);
    assert.equal(f.state.busy_fetch, false);
  }
});

test("post-save refresh rejects older reads and preserves another row's unsaved draft", async () => {
  const f = environment(),
    [first, second] = f.flatten([product()]);
  f.state.totalItems = 1;
  first.number = 5;
  Object.assign(second, { add: false, number: 7 });
  f.state.updateProductQuantity(first);
  f.state.fetchData(1);
  const oldRead = f.reads.at(-1);
  f.writes[0].resolve({ data: { quantity: 29 } });
  await settled();
  const currentRead = f.reads.at(-1);
  assert.notEqual(currentRead, oldRead);
  oldRead.resolve(success([product()], 99));
  await settled();
  assert.equal(f.state.items[0].quantity, 29);
  assert.equal(f.state.totalItems, 1);
  currentRead.resolve(
    success(
      [
        product({
          quantity: 56,
          product_variants: [
            variant({ quantity: 29 }),
            variant({
              id: 102,
              quantity: 27,
              pricing: true,
              sku: "SKU-SILVER",
              enable: false,
            }),
          ],
        }),
      ],
      26,
    ),
  );
  await settled();
  watch(f.Page, "products", f.state);
  assert.equal(f.state.items[0].quantity, 29);
  assert.equal(f.state.items[0].number, 0);
  assert.equal(f.state.items[1].add, false);
  assert.equal(f.state.items[1].number, 7);
  assert.equal(f.state.products[0].quantity, 56);
  assert.equal(f.state.totalItems, 26);
});

test("failed page two retains its page range and retry offset", async () => {
  const f = environment();
  f.state.totalItems = 26;
  f.state.page = 2;
  f.state.fetchData(2);
  f.reads.at(-1).reject(new Error("page two failed"));
  await settled();
  assert.equal(f.state.totalItems, 26);
  assert.equal(f.state.page, 2);
  assert.equal(f.state.pageCount, 3);
  assert.equal(f.state.fetch_error, true);
  assert.deepEqual(plain(f.state.products), []);
  const { instance } = await f.render([], {
    totalItems: 26,
    page: 2,
    fetch_error: true,
  });
  const retry = f.calls.find(
    (call) =>
      call.name === "v-btn" && call.text.includes("global.actions.retry"),
  );
  assert.ok(retry);
  retry.attrs.onClick(stopEvent());
  assert.equal(f.reads.at(-1).config.params.offset, 10);
  assert.equal(instance.pageCount, 3);
});

test("shop changes and unmount ignore old stock/list success, errors and loading completion", async () => {
  for (const boundary of ["shop", "unmount"]) {
    for (const outcome of ["success", "server", "network"]) {
      const f = environment(),
        [item] = f.flatten([product()]);
      item.number = 5;
      f.state.updateProductQuantity(item);
      f.state.fetchData(1);
      const write = f.writes[0],
        read = f.reads[0];
      if (boundary === "unmount") f.Page.beforeUnmount.call(f.state);
      else {
        f.state.shop = { id: 8, model: "NORMAL" };
        watch(f.Page, "shop.id", f.state, 8, 7);
        assert.equal(f.reads.at(-1).url, "/shop/8/products");
      }
      const currentReads = f.reads.length;
      if (outcome === "network") {
        write.reject(new Error("old stock"));
        read.reject(new Error("old list"));
      } else {
        write.resolve(
          outcome === "server"
            ? { data: { error: true, error_msg: "old stock" } }
            : { data: { quantity: 29 } },
        );
        read.resolve(
          outcome === "server"
            ? { data: { error: true, error_msg: "old list" } }
            : success([product({ title: "Wrong shop" })], 99),
        );
      }
      await settled();
      assert.equal(item.quantity, 24);
      assert.deepEqual(f.notices, []);
      assert.equal(
        f.reads.length,
        currentReads,
        "old stock response must not start a current-context refresh",
      );
    }
  }
});
