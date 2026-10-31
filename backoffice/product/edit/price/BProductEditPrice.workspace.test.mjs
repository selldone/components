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
class PricingRows extends Array {
  sortByKey(key) {
    return this.slice().sort((a, b) => a[key] - b[key]);
  }
  maxByKey(key) {
    return this.slice().sort((a, b) => b[key] - a[key])[0];
  }
}
const files = {
  price: "./BProductEditPrice.vue",
  input: "../../../../ui/price/input/UPriceInput.vue",
  add: "../../extra-pricings/add/BProductExtraPricingAdd.vue",
  row: "../../extra-pricings/row/BProductExtraPricingRow.vue",
  chart: "../../../extra-pricing/ExtraPricingLevels.vue",
  full: "../../add/full/BProductAddFull.vue",
};
const sfc = (name) =>
  parse(readFileSync(new URL(files[name], import.meta.url), "utf8")).descriptor;

function fixture(name = "price", { product = {}, ...overrides } = {}) {
  const requests = [],
    events = [],
    notices = [],
    confirmations = [];
  const modules = {};
  const endpoint = (scope) =>
    new Proxy(
      {},
      {
        get:
          (_, action) =>
          (...ids) =>
            `/isolated/${scope}/${String(action)}/${ids.join("/")}`,
      },
    );
  const request = (method) => (url, payload) =>
    new Promise((resolve, reject) =>
      requests.push({
        method,
        url,
        payload,
        reject,
        resolve: (data) => resolve({ data }),
      }),
    );
  const context = vm.createContext({
    exports: {},
    console,
    axios: Object.fromEntries(
      ["post", "put", "delete"].map((method) => [method, request(method)]),
    ),
    window: { API: endpoint("shop"), VAPI: endpoint("vendor") },
    require(path) {
      if (path === "vue") return Vue;
      if (/\.(svg|png)$/.test(path)) return path;
      if (path.includes("CurrencyMixin")) return { default: {} };
      if (path.includes("/Currency")) return modules.currency;
      if (path.includes("PricingTypes")) return modules.pricing;
      if (path.includes("ProductType")) return modules.type;
      if (path.includes("Calendar")) return modules.calendar;
      if (path.includes("DateConverter")) return modules.date;
      if (path === "@selldone/core-js")
        return {
          ...modules.date,
          Article: { Types: { Product: { code: "Product" } } },
        };
      if (path.includes("BusinessModel"))
        return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (path.includes("ShopOptionsHelper"))
        return {
          ShopOptionsHelper: {
            GetActiveTypes: () => Object.keys(modules.type.ProductType),
          },
        };
      if (path.includes("Slugify"))
        return { Slugify: { apply: (value) => value } };
      if (path.includes("PriceHelper")) return modules.price;
      if (path.includes("NumberHelper")) return modules.number;
      if (path.includes("StorefrontDebugEvents"))
        return { StorefrontDebugEvents: { LogWarning() {} } };
      if (path === "../../models") return { Basket: {} };
      if (path.includes("ColorGenerator"))
        return { standardDesignColor: ["blue", "green"] };
      if (path.includes("NotificationService"))
        return {
          default: {
            ...Object.fromEntries(
              ["showErrorAlert", "showSuccessAlert", "showLaravelError"].map(
                (method) => [
                  method,
                  (...args) => notices.push({ method, args }),
                ],
              ),
            ),
            openDangerAlert: (...args) => confirmations.push(args.at(-1)),
          },
        };
      return { default: {} };
    },
  });
  function evaluate(source) {
    const exports = {};
    context.exports = exports;
    vm.runInContext(`{${compile(source)}\n}`, context);
    return exports;
  }
  for (const [key, path] of Object.entries({
    currency: "enums/payment/Currency.ts",
    pricing: "enums/product/PricingTypes.ts",
    type: "enums/product/ProductType.ts",
    calendar: "enums/language/Calendar.ts",
    date: "helper/date/DateConverter.ts",
    price: "helper/price/PriceHelper.ts",
    number: "helper/number/NumberHelper.ts",
  })) {
    modules[key] = evaluate(
      readFileSync(
        new URL("../../../../../core-js/" + path, import.meta.url),
        "utf8",
      ),
    );
  }
  const descriptor = sfc(name),
    component = evaluate(descriptor.script.content).default;
  const tiers = [
    {
      id: 8,
      min: 10,
      price: 30,
      commission: 0,
      discount: 2,
      variant_id: null,
      vendor_id: null,
    },
  ];
  const parent = {
    id: 31,
    shop_id: 42,
    type: "PHYSICAL",
    pricing: "FIX",
    price: 50.6,
    commission: 0,
    discount: 5,
    currency: "USD",
    dis_start: null,
    dis_end: null,
    price_label: null,
    created_at: "2026-01-01",
    extra_pricings: tiers,
    ...product,
  };
  parent.extra_pricings = PricingRows.from(parent.extra_pricings);
  const defaults = Object.fromEntries(
    Object.entries(component.props || {})
      .filter(([, value]) => value?.default !== undefined)
      .map(([key, value]) => [
        key,
        typeof value.default === "function" ? value.default() : value.default,
      ]),
  );
  const Currency = modules.currency.Currency,
    PriceHelper = modules.price.PriceHelper;
  const state = {
    ...defaults,
    ...component.data.call({ ...defaults, ...overrides }),
    modern: true,
    workspace: true,
    shop: { id: 42, currencies: ["USD", "EUR", "IRR", "KWD"] },
    product: parent,
    extraPricing: tiers[0],
    allExtraPricings: tiers,
    modelValue: true,
    $refs: {},
    $route: { params: {}, matched: [] },
    $vuetify: {
      locale: { isRtl: false },
      display: { width: 1024, smAndUp: true, xs: false },
    },
    $emit: (...args) => events.push(args),
    $nextTick: (callback) => Promise.resolve().then(() => callback?.()),
    $t: (key, params = {}) =>
      key + (Object.keys(params).length ? ":" + JSON.stringify(params) : ""),
    GetCurrency: (value) =>
      Currency[typeof value === "string" ? value : value?.code],
    GetUserSelectedCurrency: () => Currency.USD,
    getCurrencyName: (code) => code,
    priceProductByCurrency:
      PriceHelper.priceProductByCurrency.bind(PriceHelper),
    discountProductPercent:
      PriceHelper.discountProductPercent.bind(PriceHelper),
    AddOrUpdateItemByID(items, item) {
      const index = items.findIndex((x) => x.id === item.id);
      if (index < 0) items.push(item);
      else Object.assign(items[index], item);
    },
    DeleteItemByID(items, id) {
      const index = items.findIndex((x) => x.id === id);
      if (index >= 0) items.splice(index, 1);
    },
    ...overrides,
  };
  for (const [key, method] of Object.entries(component.methods || {}))
    state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed || {}))
    Object.defineProperty(state, key, {
      configurable: true,
      get: (typeof getter === "function" ? getter : getter.get).bind(state),
    });
  if (name !== "full") component.created?.call(state);
  return {
    state,
    component,
    descriptor,
    requests,
    events,
    notices,
    confirmations,
    evaluate,
    context,
    modules,
  };
}

function renderedNodes(descriptor, state) {
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: "workspace-price.vue",
    id: "workspace-price-test",
  });
  assert.deepEqual(compiled.errors, []);
  const exports = {};
  vm.runInNewContext(compile(compiled.code), {
    exports,
    require: () => ({
      ...Vue,
      resolveComponent: (name) => ({ name }),
      resolveDirective: () => ({}),
      withDirectives: (node) => node,
    }),
  });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push({ ...node, type: node.type?.name || node.type });
    visit(node.children);
    if (node.children?.default) visit(node.children.default({}));
  }
  visit(exports.render(state, []));
  return nodes;
}

const edit = (state, key, value) => {
  state[key] = value;
  state.setValue(key, key === "currency" ? value.code : value);
};

test("workspace modern is opt-in, zero is valid and Inventory instance mode retains its native branch", () => {
  const ordinary = fixture("price", { product: { price: 0, discount: 0 } });
  assert.equal(ordinary.component.props.modern.default, false);
  assert.equal(ordinary.state.workspaceMode, true);
  assert.equal(ordinary.state.calculatePrice, 0);
  assert.equal(ordinary.state.hasUnsavedChanges, false);
  assert.equal(ordinary.state.prepareSave(), true);
  assert.equal(ordinary.requests.length, 0);
  assert.equal(ordinary.events.length, 0);
  for (const values of [
    { modern: false },
    {
      instanceMode: true,
      customObject: { ...ordinary.state.product, variant_id: null },
    },
  ]) {
    const f = fixture("price", values);
    assert.equal(f.state.workspaceMode, false);
    assert.equal(f.state.savedSnapshot, "");
    assert.equal(
      renderedNodes(f.descriptor, f.state).some((node) =>
        node.props?.class?.includes?.("b-product-edit-price__workspace-footer"),
      ),
      false,
    );
  }
});

test("actual native PriceHelper preserves fixed discount, currency precision and schedule-free main receipt", () => {
  const { state, modules } = fixture();
  edit(state, "price", 100);
  edit(state, "commission", 20);
  edit(state, "discount", 30);
  assert.equal(state.calculatePrice, 90);
  assert.equal(state.discount_percent, 25);
  edit(state, "price", 200);
  assert.equal(state.discount, 30);
  assert.equal(state.calculatePrice, 190);
  edit(state, "price", 1000);
  edit(state, "commission", 0);
  edit(state, "discount", 5);
  assert.equal(state.discount_percent, 0.5);
  state.dis_start = "2000-01-01";
  state.dis_end = "2000-01-02";
  assert.equal(state.calculatePrice, 995);
  assert.equal(state.formatWorkspaceAmount(50.6, "USD"), "50.60 USD");
  assert.equal(state.formatWorkspaceAmount(50.6, "IRR"), "51 IRR");
  assert.equal(state.formatWorkspaceAmount(1.234, "KWD"), "1.234 KWD");
  edit(state, "currency", modules.currency.Currency.EUR);
  assert.equal(state.price, 1000);
  assert.equal(state.product.price, 1000);
  assert.equal(state.product.currency, "EUR");
  assert.equal(state.savedPriceCurrency, "USD");
  assert.equal(state.workspaceTierProduct.currency, "USD");
});

test("Focused variant form keeps local price drafts, fixed product currency and separately scoped tiers", () => {
  const draft = { price: 13.14, currency: "USD", commission: 0, discount: 5, pricing: true };
  const f = fixture("price", {
    customObject: draft,
    variant: { id: 2 },
    product: { extra_pricings: [
      { id: 8, min: 10, price: 30, variant_id: null, vendor_id: null },
      { id: 9, min: 20, price: 11, variant_id: 2, vendor_id: null },
      { id: 10, min: 30, price: 12, variant_id: 3, vendor_id: null },
    ] },
  });
  assert.equal(f.state.variantFormMode, true);
  edit(f.state, "price", 17);
  assert.equal(draft.price, 17);
  assert.equal(f.state.product.price, 50.6);
  edit(f.state, "currency", f.modules.currency.Currency.EUR);
  assert.equal(f.state.currency.code, "USD");
  assert.equal(draft.currency, "USD");
  assert.deepEqual(Array.from(f.state.extra_pricings_to_show, item => item.id), [9]);
  const nodes = renderedNodes(f.descriptor, f.state);
  assert.equal(nodes.some(node => node.type === "u-currency-input"), false);
  assert.equal(nodes.some(node => node.props?.class?.includes?.("b-product-edit-price__workspace-footer")), false);
  f.state.showAddExtraPrice();
  assert.equal(f.state.show_add_extra_price, true);
  assert.equal(f.state.selected_extra_price.price, 17);
  assert.equal(f.requests.length, 0);
});

test("Focused unsaved variant cannot display or edit product-level quantity tiers", () => {
  const f = fixture("price", {
    customObject: { price: 10, currency: "USD", commission: 0, discount: 0 },
  });
  assert.equal(f.state.variantFormMode, true);
  assert.equal(f.state.product.extra_pricings.length, 1);
  assert.equal(f.state.extra_pricings_to_show.length, 0);
  f.state.showAddExtraPrice();
  f.state.showEditExtraPricing(f.state.product.extra_pricings[0]);
  assert.equal(f.state.show_add_extra_price, false);
  assert.equal(f.state.selected_extra_price, null);
  const nodes = renderedNodes(f.descriptor, f.state);
  assert.equal(nodes.some(node => node.type === "extra-pricing-levels"), false);
  assert.equal(nodes.some(node => node.props?.onClick === f.state.showAddExtraPrice), false);
  assert.equal(f.requests.length, 0);
});

test("workspace money fields delegate localized parsing and precision to the real UPriceInput", () => {
  const f = fixture(),
    controls = renderedNodes(f.descriptor, f.state).filter(
      (node) => node.type === "u-price-input",
    );
  assert.equal(controls.length, 3);
  assert.ok(
    controls.every((node) => node.props.currency === f.state.currencyObject),
  );
  const native = fixture("input", { modelValue: 0, currency: "USD" });
  native.state.model = "۱,۲۳۴.۵۶۷";
  native.state.updateNumberValue();
  assert.equal(native.state.numberValue, 1234.57);
  native.state.model = "١٢.٣٤";
  native.state.updateNumberValue();
  assert.equal(native.state.numberValue, 12.34);
  native.state.currency = "IRR";
  native.state.updateNumberValue();
  assert.equal(native.state.numberValue, 12);
  native.state.model = "-3";
  native.state.updateNumberValue();
  assert.equal(native.state.numberValue, 0);
});

test("tuple dirty/discard restores only main settings and leaves independently updated tiers untouched", () => {
  const { state, descriptor, requests } = fixture(),
    baseline = plain(state.product);
  edit(state, "price", 77);
  edit(state, "price_label", "Per bottle");
  edit(state, "pricing", "AGREEMENT");
  state.product.extra_pricings[0].price = 19;
  state.product.extra_pricings.push({ id: 9, min: 100, price: 10 });
  assert.equal(state.hasUnsavedChanges, true);
  state.discardChanges();
  for (const key of [
    "price",
    "currency",
    "commission",
    "discount",
    "dis_start",
    "dis_end",
    "price_label",
    "pricing",
  ])
    assert.equal(state.product[key], baseline[key]);
  assert.equal(state.product.extra_pricings[0].price, 19);
  assert.equal(state.product.extra_pricings.length, 2);
  assert.equal(state.hasUnsavedChanges, false);
  assert.equal(requests.length, 0);
  state.product.price = 81.4;
  state.markSaved();
  edit(state, "price", 90);
  state.discardChanges();
  assert.equal(state.price, 81.4);
  for (const invalid of ["negative", "dates"]) {
    if (invalid === "negative") edit(state, "discount", 100);
    else {
      state.has_discount_period = true;
      edit(state, "dis_start", "2030-01-02");
      edit(state, "dis_end", "2030-01-01");
    }
    assert.equal(state.saveBlocked, true);
    const discardButton = renderedNodes(descriptor, state).find(
      (node) =>
        node.type === "v-btn" && node.props?.onClick === state.discardChanges,
    );
    assert.equal(discardButton.props.disabled, false);
    discardButton.props.onClick();
    assert.equal(state.price, 81.4);
    assert.equal(state.saveBlocked, false);
    assert.equal(state.hasUnsavedChanges, false);
    assert.equal(requests.length, 0);
  }
});

test("schedule clears both dates, accepts equal dates, and main negative blocks all submit paths", () => {
  const { state, component, events, requests } = fixture();
  state.has_discount_period = true;
  assert.equal(
    state.hasUnsavedChanges,
    false,
    "the open schedule alone is presentation; only dates persist",
  );
  edit(state, "dis_start", "2030-01-02T12:00:00Z");
  edit(state, "dis_end", "2030-01-02T12:00:00Z");
  assert.equal(state.prepareSave(), true);
  edit(state, "dis_end", "2030-01-01T12:00:00Z");
  assert.equal(state.prepareSave(), false);
  component.watch.has_discount_period.call(state, false);
  state.has_discount_period = false;
  assert.equal(state.dis_start, null);
  assert.equal(state.dis_end, null);
  assert.equal(state.product.dis_start, null);
  assert.equal(state.product.dis_end, null);
  edit(state, "discount", 100);
  state.submit();
  assert.equal(events.length, 0);
  assert.equal(requests.length, 0);
  edit(state, "discount", 5);
  state.submit();
  assert.deepEqual(events, [["next"]]);
  assert.equal(requests.length, 0);
});

test("busy, hidden and modal states guard main editing, submit and discard", async () => {
  for (const restriction of [
    "busy",
    "tierActivity",
    "tierEditor",
    "show_add_extra_price",
    "active",
  ]) {
    const f = fixture();
    edit(f.state, "price", 70);
    if (restriction === "tierEditor") f.state.$refs.tierEditor = { busy: true };
    else f.state[restriction] = restriction !== "active";
    assert.equal(f.state.prepareSave(), false);
    f.state.submit();
    assert.equal(f.events.length, 0);
    if (["busy", "tierActivity", "tierEditor"].includes(restriction)) {
      edit(f.state, "price", 90);
      f.state.discardChanges();
      assert.equal(f.state.price, 70);
      assert.equal(f.state.product.price, 70);
      const nodes = renderedNodes(f.descriptor, f.state);
      assert.ok(
        nodes
          .filter((node) =>
            [
              "u-price-input",
              "u-currency-input",
              "u-date-input",
              "v-text-field",
            ].includes(node.type),
          )
          .every((node) => node.props.disabled),
      );
    }
  }
  for (const picker of ["workspaceStartDate", "workspaceEndDate"]) {
    const { price, full } = parentFixture();
    price.state.$refs[picker] = { dialog: true };
    assert.equal(price.state.prepareSave(), false);
    price.state.submit();
    assert.equal(price.events.length, 0);
    await full.state.submitStep();
    full.state.nextStep();
    assert.equal(full.requests.length, 0, "the native date dialog owns Ctrl+S");
    price.state.$refs[picker].dialog = false;
    assert.equal(price.state.prepareSave(), true);
    await full.state.submitStep();
    assert.equal(full.requests.length, 1);
    full.requests[0].resolve({ product: { ...price.state.product } });
    await setImmediate();
    assert.equal(full.state.step, 9);
  }
});

test("closed digests describe configured values and saved-currency tiers without pretending an expired discount applies now", () => {
  const { state } = fixture("price", {
    product: {
      dis_start: "2000-01-01T00:00:00Z",
      dis_end: "2000-01-02T00:00:00Z",
      extra_pricings: [
        { id: 1, min: 100, price: 20, commission: 2, discount: 1 },
        { id: 2, min: 10, price: 30, commission: 0, discount: 2 },
        { id: 3, min: 2, price: 1, commission: 0, discount: 0, variant_id: 9 },
        { id: 4, min: 3, price: 2, commission: 0, discount: 0, vendor_id: 8 },
      ],
    },
  });
  assert.equal(state.discountPeriodStatus, "ended");
  assert.match(state.discountDigest, /5\.00 USD.*10%.*period_ended/);
  assert.match(state.additionalDigest, /no_commission.*no_label/);
  assert.match(state.quantityDigest, /"count":10,"amount":"21\.00 USD"/);
  assert.equal(state.calculatePrice, 45.6);
  edit(state, "commission", 1.2);
  edit(state, "price_label", "Per item");
  assert.match(state.additionalDigest, /1\.20 USD.*Per item/);
  edit(state, "discount", 0);
  assert.match(state.discountDigest, /no_discount/);
  assert.equal(state.dis_end, "2000-01-02T00:00:00Z");
});

test("product contexts retain native service methods, subscription plans and marketplace guidance", () => {
  for (const type of [
    "PHYSICAL",
    "VIRTUAL",
    "FILE",
    "SERVICE",
    "SUBSCRIPTION",
  ]) {
    const f = fixture("price", { product: { type } });
    const nodes = renderedNodes(f.descriptor, f.state);
    const actions = nodes.filter((node) => node.type === "v-btn");
    const hasQuantity = nodes.some(
      (node) => node.type === "extra-pricing-levels",
    );
    assert.equal(hasQuantity, ["PHYSICAL", "VIRTUAL"].includes(type), type);
    assert.deepEqual(
      Array.from(f.state.available_pricing, (value) => value.code),
      type === "SERVICE" ? ["FIX", "AGREEMENT", "ESTIMATION"] : ["FIX"],
    );
    assert.equal(
      actions.some((node) => node.props?.to?.name === "BPageProductInventory"),
      type === "SUBSCRIPTION",
    );
    assert.equal(
      actions.some((node) => node.props?.to?.name === "BPageShopFinanceTax"),
      true,
    );
  }
  const marketplace = fixture("price", { isMarketplace: true });
  const nodes = renderedNodes(marketplace.descriptor, marketplace.state);
  assert.equal(
    nodes.some((node) => node.type === "extra-pricing-levels"),
    false,
  );
  assert.equal(
    nodes.some((node) => node.props?.to?.name === "BPageProductVendors"),
    true,
  );
});

test("Add tier uses the native full draft tuple while tier currency remains the saved product currency", () => {
  const { state, modules } = fixture();
  edit(state, "price", 81);
  edit(state, "commission", 2);
  edit(state, "discount", 7);
  edit(state, "dis_start", "2030-01-01T00:00:00Z");
  edit(state, "dis_end", "2030-02-01T00:00:00Z");
  edit(state, "currency", modules.currency.Currency.EUR);
  state.showAddExtraPrice();
  for (const key of ["price", "commission", "discount", "dis_start", "dis_end"])
    assert.equal(state.selected_extra_price[key], state[key]);
  assert.equal(state.selected_extra_price.min, 100);
  assert.equal(state.workspaceTierProduct.currency, "USD");
  assert.equal(state.show_add_extra_price, true);
  const selected = state.selected_extra_price;
  state.show_add_extra_price = false;
  state.busy = true;
  state.showAddExtraPrice();
  assert.equal(state.show_add_extra_price, false);
  assert.equal(state.selected_extra_price, selected);
});

function parentFixture({
  type = "PHYSICAL",
  mode = "edit",
  vendor = false,
} = {}) {
  const price = fixture("price", { product: { type } });
  const full = fixture("full", {
    modern: mode === "add",
    modernGeneral: mode === "edit",
    step: 7,
    type: price.modules.type.ProductType[type],
    $product: price.state.product,
    $route: vendor
      ? { params: { vendor_id: 8 }, matched: [{ meta: { vendor: true } }] }
      : { params: {}, matched: [] },
    vendor: vendor ? { id: 8 } : null,
  });
  full.state.getRenderedOnGoogle = () => {};
  full.state.setStepEditor(price.state, 7);
  return { price, full };
}

test("Edit and Add Price submit exactly one native owner PUT and advance only after canonical success", async () => {
  for (const mode of ["edit", "add"]) {
    const { price, full } = parentFixture({ mode });
    edit(price.state, "price", 70);
    await full.state.submitStep();
    assert.equal(full.requests.length, 1);
    assert.equal(full.state.step, 7);
    assert.equal(full.state.busy, true);
    assert.equal(price.state.hasUnsavedChanges, true);
    const request = full.requests[0];
    assert.equal(request.method, "put");
    assert.equal(request.url, "/isolated/shop/PUT_EDIT_PRODUCT/42/31");
    assert.equal(request.payload.price, 70);
    assert.equal(request.payload.discount, 5);
    assert.equal(request.payload.currency, "USD");
    await full.state.submitStep();
    full.state.nextStep();
    assert.equal(full.requests.length, 1);
    request.resolve({ product: { ...price.state.product, price: 69.99 } });
    await setImmediate();
    assert.equal(full.state.busy, false);
    assert.equal(full.state.step, 9);
    assert.equal(price.state.price, 69.99);
    assert.equal(price.state.hasUnsavedChanges, false);
    assert.equal(
      full.events.some(([event]) => event === "edit"),
      true,
    );
  }
});

test("failed owner saves retain the Price draft and position, then allow a successful retry", async () => {
  for (const failure of ["server", "transport"]) {
    const { price, full } = parentFixture();
    edit(price.state, "price", 70);
    await full.state.submitStep();
    if (failure === "server")
      full.requests[0].resolve({
        error: true,
        error_msg: "Fixture validation",
      });
    else full.requests[0].reject(new Error("Fixture offline"));
    await setImmediate();
    assert.equal(full.state.step, 7);
    assert.equal(full.state.busy, false);
    assert.equal(price.state.hasUnsavedChanges, true);
    assert.equal(price.state.price, 70);
    assert.equal(full.events.length, 0);
    assert.equal(
      full.notices[0].method,
      failure === "server" ? "showErrorAlert" : "showLaravelError",
    );
    await full.state.submitStep();
    assert.equal(full.requests.length, 2);
    full.requests[1].resolve({ product: { ...price.state.product } });
    await setImmediate();
    assert.equal(full.state.step, 9);
    assert.equal(price.state.hasUnsavedChanges, false);
  }
});

test("parent shared footer and direct next both respect Price's negative, date, modal, hidden and pending-tier guards", async () => {
  for (const restriction of ["negative", "dates", "modal", "hidden", "tier"]) {
    const { price, full } = parentFixture();
    if (restriction === "negative") edit(price.state, "discount", 100);
    if (restriction === "dates") {
      price.state.has_discount_period = true;
      edit(price.state, "dis_start", "2030-01-02");
      edit(price.state, "dis_end", "2030-01-01");
    }
    if (restriction === "modal") price.state.show_add_extra_price = true;
    if (restriction === "hidden") price.state.active = false;
    if (restriction === "tier") price.state.tierActivity = true;
    assert.equal(full.state.flowSubmitDisabled, true, restriction);
    await full.state.submitStep();
    full.state.nextStep();
    assert.equal(full.requests.length, 0, restriction);
    assert.equal(full.state.step, 7);
  }
});

test("saved Price revisits keep their snapshot and inactive Price has no mounted shortcut button", () => {
  const { price, full } = parentFixture();
  edit(price.state, "price", 70);
  full.state.visitedSteps = [2, 7];
  assert.equal(full.state.isStepMounted(7), true);
  full.state.goTo(4);
  full.component.watch.step.call(full.state, 4);
  assert.equal(full.state.isStepMounted(7), true);
  assert.equal(full.state.active_editor, null);
  price.state.active = false;
  price.state.hasButtonNext = true;
  price.state.externalActionButtons = true;
  const nodes = renderedNodes(price.descriptor, price.state);
  assert.equal(
    nodes.some((node) => node.props?.["aria-keyshortcuts"] === "Control+s"),
    false,
  );
  full.state.goTo(7);
  full.component.watch.step.call(full.state, 7);
  price.state.active = true;
  assert.equal(full.state.active_editor, price.state);
  assert.equal(price.state.hasUnsavedChanges, true);
  price.state.discardChanges();
  assert.equal(price.state.price, 50.6);
});

test("an ordinary save from another tab refreshes a mounted Price baseline, but never a replaced editor", async () => {
  for (const replaced of [false, true]) {
    const { price, full } = parentFixture();
    edit(price.state, "price", 70);
    full.state.step = 2;
    full.state.editProduct();
    if (replaced) full.state.stepEditors[7] = {};
    full.requests[0].resolve({
      product: { ...price.state.product, price: 68 },
    });
    await setImmediate();
    assert.equal(price.state.hasUnsavedChanges, replaced);
    assert.equal(price.state.price, replaced ? 70 : 68);
  }
});

test("vendor Price saves retain the native vendor endpoint and type-specific next section", async () => {
  for (const [type, next] of [
    ["VIRTUAL", 8],
    ["SERVICE", 8],
    ["FILE", 10],
    ["SUBSCRIPTION", 10],
  ]) {
    const { price, full } = parentFixture({ type, vendor: true });
    await full.state.submitStep();
    assert.equal(
      full.requests[0].url,
      "/isolated/vendor/PUT_MY_VENDOR_EDIT_PRODUCT/8/31",
    );
    full.requests[0].resolve({ product: { ...price.state.product } });
    await setImmediate();
    assert.equal(full.state.step, next, type);
  }
});

test("workspace tier dialog cancels locally and validates native thresholds without blocking a negative tier total", () => {
  const f = fixture("add", {
    extraPricing: { min: 20, price: 10, commission: 0, discount: 20 },
  });
  assert.equal(f.state.validationError, null);
  assert.equal(f.state.calculatePrice, -10);
  f.state.clone_extra_pricing.price = 9;
  f.state.closeDialog();
  assert.equal(f.state.extraPricing.price, 10);
  assert.equal(f.requests.length, 0);
  assert.deepEqual(f.events, [["update:modelValue", false]]);
  for (const min of [0, 1, 2.5, "invalid"]) {
    f.state.clone_extra_pricing.min = min;
    f.state.addExtraPricing();
    assert.match(f.state.validationError, /tier_min_invalid/);
    assert.equal(f.requests.length, 0);
  }
  f.state.clone_extra_pricing.min = 10;
  assert.match(f.state.validationError, /tier_min_duplicate/);
  f.state.clone_extra_pricing.min = 20;
  f.state.clone_extra_pricing.dis_start = "2030-01-02";
  f.state.clone_extra_pricing.dis_end = "2030-01-01";
  assert.match(f.state.validationError, /tier_dates_invalid/);
  f.state.clone_extra_pricing.dis_end = "2030-01-02";
  assert.equal(f.state.validationError, null);
  f.state.allExtraPricings = Array.from({ length: 10 }, (_, id) => ({
    id: id + 1,
    min: 100 + id,
  }));
  assert.match(f.state.validationError, /tier_limit/);
  f.state.clone_extra_pricing.id = 8;
  assert.equal(f.state.validationError, null);
});

test("workspace Add/Edit tier saves only through its own native endpoint and keeps rejected drafts open", async () => {
  for (const editing of [false, true]) {
    const f = fixture("add", {
      extraPricing: {
        ...(editing ? { id: 8 } : {}),
        min: 20,
        price: 10,
        commission: 1,
        discount: 20,
      },
    });
    const save = () =>
      editing ? f.state.editExtraPricing() : f.state.addExtraPricing();
    save();
    assert.equal(f.state.busy, true);
    save();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].method, editing ? "put" : "post");
    assert.match(
      f.requests[0].url,
      editing
        ? /PUT_PRODUCT_EDIT_EXTRA_PRICINGS\/42\/31\/8$/
        : /POST_PRODUCT_ADD_EXTRA_PRICINGS\/42\/31$/,
    );
    assert.equal(f.requests[0].payload.discount, 20);
    f.requests[0].resolve({ error: true, error_msg: "Fixture rejected" });
    await setImmediate();
    assert.equal(f.state.busy, false);
    assert.equal(f.events.length, 0);
    assert.equal(f.state.clone_extra_pricing.discount, 20);
    save();
    f.requests[1].resolve({
      extra_pricing: { ...f.state.clone_extra_pricing, id: 8 },
    });
    await setImmediate();
    assert.equal(f.events[0][0], editing ? "onEdit" : "onAdd");
    assert.deepEqual(f.events[1], ["update:modelValue", false]);
    assert.equal(f.state.product.price, 50.6);
  }
});

test("tier delete requires confirmation and its activity lock does not disable its own confirmation", async () => {
  const f = fixture("row");
  f.state.deleteNow();
  assert.equal(f.requests.length, 0);
  f.state.showDelete();
  assert.equal(f.state.confirm_delete, true);
  assert.equal(f.requests.length, 0);
  f.component.watch.workspaceActivity.call(f.state, f.state.workspaceActivity);
  assert.deepEqual(f.events, [["activity", true]]);
  // The parent disables every row while this row owns the open confirmation.
  f.state.disabled = true;
  f.state.deleteNow();
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.busy_delete, true);
  f.state.deleteNow();
  assert.equal(f.requests.length, 1);
  f.requests[0].reject(new Error("Fixture offline"));
  await setImmediate();
  assert.equal(f.state.confirm_delete, true);
  assert.equal(f.state.busy_delete, false);
  f.state.deleteNow();
  f.requests[1].resolve({ id: 8 });
  await setImmediate();
  assert.equal(f.state.confirm_delete, false);
  assert.equal(f.state.busy_delete, false);
  assert.equal(
    f.events.some(([event, id]) => event === "onDelete" && id === 8),
    true,
  );
  f.component.watch.workspaceActivity.call(f.state, f.state.workspaceActivity);
  assert.deepEqual(f.events.at(-1), ["activity", false]);
  assert.equal(f.state.product.extra_pricings.length, 1);
});
