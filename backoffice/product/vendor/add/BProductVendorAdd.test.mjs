import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import { createRenderer, nextTick } from "vue";
import ts from "typescript";

const { descriptor, errors } = parse(
  readFileSync(new URL("./BProductVendorAdd.vue", import.meta.url), "utf8"),
);
assert.deepEqual(errors, []);
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const compiled = transpile(descriptor.script.content);
const plain = (value) => JSON.parse(JSON.stringify(value));

function sourceModule(path, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(
    transpile(readFileSync(new URL(path, import.meta.url), "utf8")),
    {
      exports,
      window: {},
      require(name) {
        assert.ok(name in dependencies, `Unexpected module: ${name}`);
        return dependencies[name];
      },
    },
  );
  return exports;
}
const { DateConverter } = sourceModule(
  "../../../../../core-js/helper/date/DateConverter.ts",
  { "../../enums/language/Calendar": { Calendar: {} } },
);
const currencies = {
  USD: { floats: 2 },
  EUR: { floats: 2 },
  IRR: { floats: 0 },
};
const { PriceHelper } = sourceModule(
  "../../../../../core-js/helper/price/PriceHelper.ts",
  {
    "../../enums/payment/Currency": { Currency: currencies },
    "../date/DateConverter": { DateConverter },
    "../../enums/debug/StorefrontDebugEvents": { StorefrontDebugEvents: {} },
  },
);
const fields = [
  "vendor_id",
  "variant_id",
  "pricing_id",
  "enable",
  "raw_price",
  "price",
  "currency",
  "commission",
  "discount",
  "dis_start",
  "dis_end",
  "quantity",
  "lead",
];
const offer = () => ({
  id: 70,
  vendor_id: 9,
  variant_id: 31,
  pricing_id: 6,
  enable: false,
  raw_price: 42.12,
  price: 50.54,
  currency: "EUR",
  commission: 2.5,
  discount: 3.25,
  dis_start: "2026-10-01T00:00:00.000Z",
  dis_end: "2026-11-01T23:59:59.000Z",
  quantity: 14,
  lead: 8,
  pricing: null,
  vendor: { id: 9, name: "Fixture vendor", icon: "vendor.svg" },
});

function fixture({
  editing = true,
  vendorPanel = false,
  now = Date.now(),
  ...overrides
} = {}) {
  const requests = [],
    sdkRequests = [],
    events = [],
    notices = [];
  const notification = Object.fromEntries(
    ["showErrorAlert", "showLaravelError", "showWarningAlert"].map((name) => [
      name,
      (...args) => notices.push({ name, args }),
    ]),
  );
  const axios = Object.fromEntries(
    ["post", "put", "delete"].map((method) => [
      method,
      (url, payload) =>
        new Promise((resolve, reject) => {
          requests.push({
            method,
            url,
            payload,
            resolve: (data) => resolve({ data }),
            reject,
          });
        }),
    ]),
  );
  const sdk = (scope) => ({
    product: {
      vendor: {
        list(...args) {
          const request = { scope, args };
          const promise = new Promise((resolve, reject) => {
            Object.assign(request, { resolve, reject });
          });
          promise.cache = (callback) => {
            request.cached = callback;
            return promise;
          };
          sdkRequests.push(request);
          return promise;
        },
      },
    },
  });
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    axios,
    Date: class extends Date {
      constructor(...args) {
        super(...(args.length ? args : [now]));
      }
      static now() {
        return now;
      }
    },
    window: {
      API: {
        POST_ADD_PRODUCT_VENDOR: (shop, product) =>
          `/fixture/shops/${shop}/products/${product}/vendors`,
        PUT_EDIT_PRODUCT_VENDOR: (shop, product, id) =>
          `/fixture/shops/${shop}/products/${product}/vendors/${id}`,
        DELETE_PRODUCT_VENDOR: (shop, product, id) =>
          `/fixture/shops/${shop}/products/${product}/vendors/${id}`,
      },
      VAPI: {
        PUT_MY_VENDOR_INVENTORY_UPDATE_PRODUCT: (vendor, id) =>
          `/fixture/vendors/${vendor}/inventory/${id}`,
        DELETE_MY_VENDOR__INVENTORY_PRODUCT: (vendor, id) =>
          `/fixture/vendors/${vendor}/inventory/${id}`,
      },
      $backoffice: sdk("shop"),
      $vendor: sdk("vendor"),
    },
    require(name) {
      if (name.includes("NotificationService"))
        return { default: notification };
      if (name.includes("PriceHelper")) return { PriceHelper };
      if (name === "@selldone/core-js") return { DateConverter };
      if (name.includes("ProductType"))
        return {
          ProductType: Object.fromEntries(
            ["FILE", "PHYSICAL", "VIRTUAL", "SUBSCRIPTION"].map((code) => [
              code,
              { code },
            ]),
          ),
        };
      if (name.includes("ColorGenerator"))
        return { standardDesignColor: ["#123", "#456"] };
      return { default: {} };
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    shop: { id: 42 },
    vendor: undefined,
    product: {
      id: 17,
      type: "PHYSICAL",
      currency: "USD",
      price: 100,
      commission: 4,
      discount: 5,
      dis_start: null,
      dis_end: null,
      lead: -1,
      product_variants: [{ id: 31, quantity: 1 }],
      extra_pricings: [],
    },
    vendorProduct: editing ? offer() : undefined,
    $product: { id: 17 },
    $route: {
      params: vendorPanel ? { vendor_id: "9" } : {},
      matched: [{ meta: { vendor: vendorPanel } }],
    },
    $t: (key) => key,
    $emit: (...args) => events.push(args),
    $nextTick: (callback) =>
      Promise.resolve().then(() => callback?.call(state)),
    resetToDefault: () => Object.assign(state, component.data()),
    GetCurrency: (code) => currencies[code],
    AddOrUpdateItemByID(items, value) {
      const existing = items.find((item) => item.id === value.id);
      if (existing) Object.assign(existing, value);
      else items.push(value);
    },
    discountProductPercent: () => 25,
    priceProductByCurrency: (...args) => ({ kind: "price", args }),
    ...overrides,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: getter.bind(state) });
  component.created.call(state);
  function mount() {
    // Vue runs the real created/watch/nextTick hooks against an in-memory host.
    const renderer = createRenderer({
      insert(node, parent) {
        node.parent = parent;
      },
      remove(node) {
        node.parent = null;
      },
      createElement: () => ({}),
      createText: () => ({}),
      createComment: () => ({}),
      setText() {},
      setElementText() {},
      patchProp() {},
      parentNode: (node) => node.parent,
      nextSibling: () => null,
    });
    const app = renderer.createApp(
      { ...component, render: () => null },
      {
        shop: state.shop,
        vendor: state.vendor,
        product: state.product,
        vendorProduct: state.vendorProduct,
      },
    );
    app.provide("$product", state.$product);
    Object.assign(app.config.globalProperties, {
      $route: state.$route,
      $t: state.$t,
      GetCurrency: state.GetCurrency,
      AddOrUpdateItemByID: state.AddOrUpdateItemByID,
      priceProductByCurrency: state.priceProductByCurrency,
      discountProductPercent: state.discountProductPercent,
      resetToDefault() {
        Object.assign(this, component.data());
      },
    });
    return { app, state: app.mount({}) };
  }
  return {
    component,
    state,
    requests,
    sdkRequests,
    events,
    notices,
    mount,
  };
}
const payload = (state) =>
  Object.fromEntries(fields.map((field) => [field, state[field]]));
const allowRemoval = (state) =>
  Object.assign(state, { tab: 3, critical_open: true, accept_delete: true });

function disabledBinding(tag, state) {
  const visit = (node) =>
    node.tag === tag ? node : node.children?.map(visit).find(Boolean);
  const node = visit(descriptor.template.ast);
  const expression = node?.props.find(
    (prop) => prop.name === "bind" && prop.arg?.content === "disabled",
  )?.exp.content;
  assert.ok(expression, `Missing disabled binding on ${tag}`);
  return vm.runInNewContext(expression, {
    IS_VENDOR_PANEL: state.IS_VENDOR_PANEL,
    is_edit_mode: state.is_edit_mode,
    vendorProduct: state.vendorProduct,
  });
}

test("edit hydration preserves every saved offer field and its discount period", () => {
  const { state } = fixture();
  assert.deepEqual(
    plain(payload(state)),
    Object.fromEntries(fields.map((field) => [field, offer()[field]])),
  );
  assert.equal(state.has_discount_period, true);
  assert.equal(state.accept_delete, false);
  assert.equal(state.is_edit_mode, true);
  assert.equal(state.vendor_icon, "vendor.svg");
});

test("a new offer keeps product defaults and the vendor's assigned pricing", () => {
  const { state } = fixture({
    editing: false,
    vendor: { id: 9, pricing_id: 6 },
  });
  assert.deepEqual(plain(payload(state)), {
    vendor_id: null,
    variant_id: null,
    pricing_id: 6,
    enable: true,
    raw_price: 100,
    price: 100,
    currency: "USD",
    commission: 4,
    discount: 5,
    dis_start: null,
    dis_end: null,
    quantity: 10,
    lead: -1,
  });
  assert.equal(state.is_edit_mode, false);
});

test("the rendered input bindings lock vendor identity and an already assigned variant", () => {
  for (const [options, expectedVendor, expectedVariant] of [
    [{}, true, true],
    [{ vendorProduct: { ...offer(), variant_id: null } }, true, false],
    [{ editing: false }, false, false],
    [{ editing: false, vendorPanel: true }, true, true],
  ]) {
    const { state } = fixture(options);
    assert.equal(
      Boolean(disabledBinding("b-vendor-input", state)),
      expectedVendor,
    );
    assert.equal(
      Boolean(disabledBinding("u-smart-variant", state)),
      expectedVariant,
    );
  }
});

test("adding uses the shop-scoped endpoint and the complete existing API payload", async () => {
  const { state, requests, events } = fixture({ editing: false });
  Object.assign(state, offer());
  state.addVendorProduct();
  assert.equal(state.busy, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "post");
  assert.equal(requests[0].url, "/fixture/shops/42/products/17/vendors");
  assert.deepEqual(plain(requests[0].payload), plain(payload(state)));
  const saved = {
    id: 80,
    product: { quantity: 52 },
    variant: { id: 31, quantity: 52 },
  };
  const vendor = { id: 9 };
  requests[0].resolve({ vendor_product: saved, vendor });
  await setImmediate();
  assert.equal(state.product.quantity, 52);
  assert.equal(state.product.product_variants[0].quantity, 52);
  assert.deepEqual(events, [["add", saved], ["add-vendor", vendor], ["close"]]);
  assert.equal(state.busy, false);
});

test("vendor-panel add is rejected without sending any request", () => {
  const { state, requests, notices } = fixture({
    editing: false,
    vendorPanel: true,
  });
  state.addVendorProduct();
  assert.equal(requests.length, 0);
  assert.equal(state.busy, false);
  assert.equal(notices[0].name, "showWarningAlert");
});

for (const vendorPanel of [false, true]) {
  const scope = vendorPanel ? "vendor" : "shop";
  test(`${scope}-panel save preserves endpoint scope, all fields and update events`, async () => {
    const { state, requests, events } = fixture({ vendorPanel });
    state.updateVendor();
    assert.equal(state.busy, true);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, "put");
    assert.equal(
      requests[0].url,
      vendorPanel
        ? "/fixture/vendors/9/inventory/70"
        : "/fixture/shops/42/products/17/vendors/70",
    );
    assert.deepEqual(plain(requests[0].payload), plain(payload(state)));
    const saved = {
      id: 70,
      product: { quantity: 7 },
      variant: { id: 32, quantity: 7 },
    };
    requests[0].resolve({ vendor_product: saved });
    await setImmediate();
    assert.equal(state.product.quantity, 7);
    assert.deepEqual(plain(state.product.product_variants), [
      { id: 31, quantity: 1 },
      { id: 32, quantity: 7 },
    ]);
    assert.deepEqual(events, [["update", saved], ["close"]]);
    assert.equal(state.busy, false);
  });

  test(`${scope}-panel removal preserves scope and refreshes returned product and variant`, async () => {
    const { state, requests, events } = fixture({ vendorPanel });
    allowRemoval(state);
    state.requestRemove();
    state.remove();
    assert.equal(state.busy_delete, true);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, "delete");
    assert.equal(
      requests[0].url,
      vendorPanel
        ? "/fixture/vendors/9/inventory/70"
        : "/fixture/shops/42/products/17/vendors/70",
    );
    requests[0].resolve({
      id: 70,
      product: { quantity: 0 },
      variant: { id: 31, quantity: 0 },
    });
    await setImmediate();
    assert.equal(state.product.quantity, 0);
    assert.equal(state.product.product_variants[0].quantity, 0);
    assert.deepEqual(events, [["remove", 70], ["close"]]);
    assert.equal(state.busy_delete, false);
  });
}

test("a route parameter alone cannot switch requests into the vendor panel", () => {
  const { state, requests } = fixture({
    $route: { params: { vendor_id: "99" }, matched: [{ meta: {} }] },
  });
  state.updateVendor();
  assert.equal(requests[0].url, "/fixture/shops/42/products/17/vendors/70");
});

for (const method of ["addVendorProduct", "updateVendor", "remove"]) {
  for (const failure of ["response", "network"]) {
    test(`${method} reports ${failure} errors, unlocks its button and leaves the editor open`, async () => {
      const { state, requests, events, notices } = fixture({
        editing: method !== "addVendorProduct",
      });
      if (method === "remove") {
        allowRemoval(state);
        state.requestRemove();
      }
      state[method]();
      assert.equal(requests.length, 1);
      const error = new Error("Fixture network failure");
      if (failure === "response")
        requests[0].resolve({
          error: true,
          error_msg: "Fixture validation failure",
        });
      else requests[0].reject(error);
      await setImmediate();
      assert.equal(method === "remove" ? state.busy_delete : state.busy, false);
      assert.deepEqual(events, []);
      assert.equal(notices.length, 1);
      assert.equal(
        notices[0].name,
        failure === "response" ? "showErrorAlert" : "showLaravelError",
      );
      assert.equal(
        notices[0].args.at(-1),
        failure === "response" ? "Fixture validation failure" : error,
      );
    });
  }
}

test("clearing the discount period removes both boundaries", () => {
  const { state, component } = fixture();
  component.watch.has_discount_period.call(state, false);
  assert.equal(state.dis_start, null);
  assert.equal(state.dis_end, null);
});

test("automatic pricing uses the existing precision helper for the selected currency", () => {
  const { state, component } = fixture();
  state.pricing = { commission: 17.5 };
  state.raw_price = 12.34;
  state.onChangeVendorPrice();
  assert.equal(state.price, 14.5);
  component.watch.price.call(state);
  assert.equal(state.raw_price_final_input, 14.5);
  state.currency = "IRR";
  state.raw_price = 103;
  component.watch.pricing.call(state);
  assert.equal(state.price, 121);
});

test("price previews keep seller costs, discount dates, fixed commission and currency", () => {
  const { state } = fixture();
  assert.deepEqual(plain(state.calculatePrice), {
    kind: "price",
    args: [
      state.shop,
      {
        price: 50.54,
        currency: "EUR",
        commission: 2.5,
        discount: 3.25,
        dis_start: offer().dis_start,
        dis_end: offer().dis_end,
      },
      null,
      "EUR",
    ],
  });
  assert.deepEqual(plain(state.vendorPaymentCalc), {
    kind: "price",
    args: [
      state.shop,
      { price: 42.12, currency: "EUR", commission: 0, discount: 3.25 },
      null,
      "EUR",
    ],
  });
  assert.equal(state.marketplaceFeeCalc, 2.5 + 50.54 - 42.12);
  assert.equal(state.discount_percent, 25);
});

test("discount percentage uses the real price helper and presents zero safely", () => {
  const { state } = fixture({
    discountProductPercent:
      PriceHelper.discountProductPercent.bind(PriceHelper),
  });
  Object.assign(state, { price: 0, commission: 0, discount: 0 });
  assert.equal(state.discount_percent, 0);
  Object.assign(state, { price: 80, commission: 20, discount: 25 });
  assert.equal(state.discount_percent, 25);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} variant lookup preserves SDK scope, cached results and duplicate exclusion`, async () => {
    const { state, sdkRequests } = fixture({ editing: false, vendorPanel });
    state.vendor_id = 9;
    state.variant_id = 31;
    state.getVendorProductVariants();
    assert.equal(state.busy_vpv, true);
    assert.equal(sdkRequests.length, 1);
    assert.equal(sdkRequests[0].scope, vendorPanel ? "vendor" : "shop");
    assert.deepEqual(plain(sdkRequests[0].args), [
      vendorPanel ? "9" : 42,
      17,
      0,
      100,
      { sortBy: "id", vendor_id: 9 },
    ]);
    sdkRequests[0].cached({ vendor_products: [{ variant_id: 31 }] });
    assert.deepEqual(plain(state.added_variants_ids), [31]);
    assert.equal(state.variant_id, null);
    sdkRequests[0].resolve({
      vendor_products: [{ variant_id: 31 }, { variant_id: 32 }],
    });
    await setImmediate();
    assert.deepEqual(plain(state.added_variants_ids), [31, 32]);
    assert.equal(state.busy_vpv, false);
  });
}

test("variant lookup skips edit mode and missing vendors, and reports failed requests", async () => {
  const editing = fixture();
  editing.state.getVendorProductVariants();
  assert.equal(editing.sdkRequests.length, 0);
  const adding = fixture({ editing: false });
  adding.state.getVendorProductVariants();
  assert.equal(adding.sdkRequests.length, 0);
  adding.state.vendor_id = 9;
  adding.state.getVendorProductVariants();
  const error = new Error("Fixture variant lookup failure");
  adding.sdkRequests[0].reject(error);
  await setImmediate();
  assert.equal(adding.state.busy_vpv, false);
  assert.equal(adding.notices[0].name, "showLaravelError");
  assert.equal(adding.notices[0].args[0], error);
});

test("tier editing selects the saved tier independently of unsaved offer prices", () => {
  const { state } = fixture();
  const tier = { id: 101, vendor_product_id: 70, min: 10, price: 40 };
  const otherOfferTier = { id: 102, vendor_product_id: 71, min: 20, price: 30 };
  state.product.extra_pricings.push(tier, otherOfferTier);
  assert.deepEqual(plain(state.extra_pricings), [tier]);
  state.showEditExtraPricing(tier);
  assert.equal(state.selected_extra_price, tier);
  assert.equal(state.show_add_extra_price, true);
});

test("inverse automatic pricing saves and displays the same currency-rounded target", () => {
  const { state, component } = fixture();
  state.pricing = { commission: 20 };
  state.onChangeVendorTargetPrice(99.99);
  assert.equal(state.raw_price, 83.33);
  assert.equal(state.price, 100);
  component.watch.price.call(state);
  assert.equal(state.raw_price_final_input, 100);
  state.pricing = null;
  state.onChangeVendorTargetPrice(17.25);
  assert.equal(state.raw_price, 17.25);
  assert.equal(state.price, 17.25);
});

test("every ordinary offer field participates in unsaved-change detection", async () => {
  const { state } = fixture();
  await setImmediate();
  assert.equal(state.isDirty, false);
  for (const field of fields) {
    const previous = state[field];
    state[field] =
      typeof previous === "boolean" ? !previous : `${previous}-changed`;
    assert.equal(state.isDirty, true, `${field} changed`);
    state[field] = previous;
    assert.equal(state.isDirty, false, `${field} restored`);
  }
});

test("real Vue hydration and pricing watchers establish a clean initial snapshot", async () => {
  for (const editing of [false, true]) {
    const { mount } = fixture({
      editing,
      ...(editing
        ? {
            vendorProduct: {
              ...offer(),
              raw_price: 12.34,
              price: 14.5,
              pricing: { commission: 17.5 },
            },
          }
        : {}),
    });
    const mounted = mount();
    try {
      await nextTick();
      await nextTick();
      assert.equal(mounted.state.isDirty, false);
      mounted.state.quantity++;
      await nextTick();
      assert.equal(mounted.state.isDirty, true);
      mounted.state.pricing = { commission: 20 };
      mounted.state.raw_price = 83.33;
      mounted.state.onChangeVendorPrice();
      await nextTick();
      assert.equal(mounted.state.price, 100);
      assert.equal(mounted.state.raw_price_final_input, 100);
    } finally {
      mounted.app.unmount();
    }
  }
});

test("section navigation and independently saved tiers leave the offer clean", async () => {
  const { state } = fixture();
  await setImmediate();
  state.selectSection(1);
  state.show_commission = true;
  state.show_add_extra_price = true;
  state.selected_extra_price = { id: 101, price: 30 };
  state.product.extra_pricings.push({
    id: 101,
    vendor_product_id: 70,
    price: 30,
  });
  state.forceupdate();
  assert.equal(state.isDirty, false);
});

test("reassigning an offer resets verification and the unsaved snapshot", async () => {
  const { state, component } = fixture();
  await setImmediate();
  allowRemoval(state);
  state.requestRemove();
  assert.equal(state.show_remove_confirmation, true);
  state.quantity = 100;
  assert.equal(state.isDirty, true);
  state.vendorProduct = { ...offer(), id: 71, quantity: 8 };
  component.watch.vendorProduct.call(state);
  await setImmediate();
  assert.equal(state.quantity, 8);
  assert.equal(state.accept_delete, false);
  assert.equal(state.critical_open, false);
  assert.equal(state.show_remove_confirmation, false);
  assert.equal(state.isDirty, false);
});

test("clean close is immediate; dirty close waits for explicit confirmation", async () => {
  const clean = fixture();
  await setImmediate();
  clean.state.requestClose();
  assert.deepEqual(clean.events, [["close"]]);
  assert.equal(clean.state.show_discard_confirmation, false);

  const dirty = fixture();
  await setImmediate();
  dirty.state.quantity++;
  dirty.state.requestClose();
  assert.deepEqual(dirty.events, []);
  assert.equal(dirty.state.show_discard_confirmation, true);
  assert.equal(dirty.requests.length, 0);
  dirty.state.discardChanges();
  assert.equal(dirty.state.show_discard_confirmation, false);
  assert.deepEqual(dirty.events, [["close"]]);
});

test("section changes clear critical verification before re-entering removal", async () => {
  const { mount } = fixture();
  const mounted = mount();
  const state = mounted.state;
  try {
    state.selectSection(3);
    await nextTick();
    state.critical_open = true;
    state.accept_delete = true;
    state.requestRemove();
    assert.equal(state.canRemove, true);
    state.selectSection(1);
    await nextTick();
    assert.equal(state.tab, 1);
    assert.equal(state.critical_open, false);
    assert.equal(state.accept_delete, false);
    assert.equal(state.show_remove_confirmation, false);
    state.selectSection(3);
    await nextTick();
    assert.equal(state.tab, 3);
    assert.equal(state.canRemove, false);
  } finally {
    mounted.app.unmount();
  }
});

const blockedRemovalStates = [
  [
    "no saved offer",
    (state) => {
      state.vendorProduct = undefined;
    },
  ],
  [
    "vendor-owned product",
    (state) => {
      state.product.vendor_id = 9;
    },
  ],
  [
    "another section",
    (state) => {
      state.tab = 0;
    },
  ],
  [
    "collapsed critical controls",
    (state) => {
      state.critical_open = false;
    },
  ],
  [
    "verification not accepted",
    (state) => {
      state.accept_delete = false;
    },
  ],
  [
    "save in flight",
    (state) => {
      state.busy = true;
    },
  ],
  [
    "removal in flight",
    (state) => {
      state.busy_delete = true;
    },
  ],
];

test("both removal entry points reject every incomplete or protected state", () => {
  for (const [name, block] of blockedRemovalStates) {
    const { state, requests } = fixture();
    allowRemoval(state);
    block(state);
    assert.equal(state.canRemove, false, name);
    state.requestRemove();
    state.remove();
    assert.equal(requests.length, 0, name);
    assert.equal(state.show_remove_confirmation, false, name);
  }
});

test("removal requires explicit confirmation and prevents duplicate submissions", async () => {
  const { state, requests } = fixture();
  allowRemoval(state);
  state.requestRemove();
  assert.equal(requests.length, 0);
  assert.equal(state.busy_delete, false);
  assert.equal(state.show_remove_confirmation, true);
  state.remove();
  assert.equal(requests.length, 1);
  assert.equal(state.busy_delete, true);
  state.requestRemove();
  state.remove();
  assert.equal(requests.length, 1);
  assert.equal(state.show_remove_confirmation, false);
  requests[0].resolve({ id: 70 });
  await setImmediate();
  assert.equal(state.busy_delete, false);
});

test("confirmation rechecks ownership, section, verification and busy state", () => {
  for (const [name, block] of blockedRemovalStates) {
    const { state, requests } = fixture();
    allowRemoval(state);
    state.requestRemove();
    assert.equal(state.show_remove_confirmation, true, name);
    block(state);
    state.remove();
    assert.equal(requests.length, 0, name);
  }
});

test("canceling removal or collapsing its controls clears verification through Vue watchers", async () => {
  const { mount } = fixture();
  const mounted = mount();
  const state = mounted.state;
  try {
    state.selectSection(3);
    await nextTick();
    state.critical_open = true;
    state.accept_delete = true;
    state.requestRemove();
    await nextTick();
    state.show_remove_confirmation = false;
    await nextTick();
    assert.equal(state.accept_delete, false);
    assert.equal(state.canRemove, false);
    state.accept_delete = true;
    state.requestRemove();
    state.critical_open = false;
    await nextTick();
    assert.equal(state.accept_delete, false);
    assert.equal(state.show_remove_confirmation, false);
  } finally {
    mounted.app.unmount();
  }
});

test("closing is blocked during an outstanding save or removal", async () => {
  for (const busyField of ["busy", "busy_delete"]) {
    const { state, events } = fixture();
    await setImmediate();
    state.quantity++;
    state[busyField] = true;
    state.requestClose();
    assert.deepEqual(events, []);
    assert.equal(state.show_discard_confirmation, false);
  }
});

test("equivalent date representations do not create unsaved changes", async () => {
  const { state } = fixture();
  await setImmediate();
  state.dis_start = { date: offer().dis_start };
  state.dis_end = new Date(offer().dis_end);
  assert.equal(state.isDirty, false);
  state.dis_end = new Date(new Date(offer().dis_end).getTime() + 1);
  assert.equal(state.isDirty, true);
});

test("discount period labels preserve the start-exclusive and end-inclusive date boundaries", () => {
  const now = Date.parse("2026-10-15T12:00:00.000Z");
  const date = (offset) => new Date(now + offset).toISOString();
  const { state } = fixture({ now });
  for (const [start, end, expected] of [
    [null, null, "discountPeriodUnset"],
    [date(1), null, "discountPeriodUpcoming"],
    [date(0), null, "discountPeriodUpcoming"],
    [date(-1), null, "discountPeriodActive"],
    [null, date(-1), "discountPeriodExpired"],
    [null, date(0), "discountPeriodActive"],
    [null, date(1), "discountPeriodActive"],
    [{ date: date(-1) }, { date: date(1) }, "discountPeriodActive"],
  ]) {
    state.dis_start = start;
    state.dis_end = end;
    assert.equal(state.discountPeriodStatus, expected);
  }
});
