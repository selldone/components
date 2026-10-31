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
const files = {
  extra: "./BProductEditExtra.vue",
  input: "../../extra/input/BProductExtraInput.vue",
  number: "../../../../ui/number/input/UNumberInput.vue",
  services:
    "../../../transportation/transportation/TransportationsEligibleView.vue",
  cube: "../../../../ui/cube/UCube.vue",
  full: "../../add/full/BProductAddFull.vue",
};
const sfc = (name) => {
  const parsed = parse(
    readFileSync(new URL(files[name], import.meta.url), "utf8"),
  );
  assert.deepEqual(parsed.errors, []);
  return parsed.descriptor;
};

function fixture(name = "extra", { product = {}, ...overrides } = {}) {
  const requests = [],
    events = [],
    notices = [],
    modules = {};
  const endpoints = (scope) =>
    new Proxy(
      {},
      {
        get:
          (_, action) =>
          (...ids) =>
            `/fixture/${scope}/${String(action)}/${ids.join("/")}`,
      },
    );
  const request = (method) => (url, payload) =>
    new Promise((resolve, reject) =>
      requests.push({
        method,
        url,
        payload: plain(payload),
        reject,
        resolve: (data) => resolve({ data }),
      }),
    );
  const context = vm.createContext({
    exports: {},
    console,
    structuredClone,
    axios: Object.fromEntries(
      ["put", "post", "delete"].map((method) => [method, request(method)]),
    ),
    window: { API: endpoints("shop"), VAPI: endpoints("vendor") },
    require(path) {
      if (path === "vue") return Vue;
      if (/\.(svg|png)$/.test(path)) return path;
      if (path.includes("ProductType")) return modules.type;
      if (path.includes("NumberHelper")) return modules.number;
      if (path.includes("ShopOptionsHelper")) return modules.options;
      if (path === "../../models") return { Basket: {} };
      if (path === "@selldone/core-js")
        return { Article: { Types: { Product: { code: "Product" } } } };
      if (path.includes("BusinessModel"))
        return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (path.includes("PricingTypes"))
        return { PricingTypes: { FIX: { code: "FIX" } } };
      if (path.includes("Slugify"))
        return { Slugify: { apply: (value) => value } };
      if (path.includes("NotificationService"))
        return {
          default: Object.fromEntries(
            ["showErrorAlert", "showSuccessAlert", "showLaravelError"].map(
              (method) => [method, (...args) => notices.push({ method, args })],
            ),
          ),
        };
      return { default: {} };
    },
  });
  const evaluate = (source) => {
    const exports = {};
    context.exports = exports;
    vm.runInContext(`{${compile(source)}\n}`, context);
    return exports;
  };
  for (const [key, path] of Object.entries({
    type: "enums/product/ProductType.ts",
    number: "helper/number/NumberHelper.ts",
    options: "helper/shop/ShopOptionsHelper.ts",
  }))
    modules[key] = evaluate(
      readFileSync(
        new URL("../../../../../core-js/" + path, import.meta.url),
        "utf8",
      ),
    );
  const descriptor = sfc(name),
    component = evaluate(descriptor.script.content).default;
  const defaults = Object.fromEntries(
    Object.entries(component.props || {})
      .filter(([, value]) => value?.default !== undefined)
      .map(([key, value]) => [
        key,
        typeof value.default === "function" ? value.default() : value.default,
      ]),
  );
  const parent = {
    id: 31,
    shop_id: 42,
    type: "PHYSICAL",
    quantity: 100,
    extra: {
      weight: 4,
      width: 130,
      length: 30,
      height: 40,
      custom: { preserved: [1, false] },
    },
    lead: -1,
    limit_min: 10,
    limit_max: null,
    product_variants: [
      {
        id: 81,
        extra: { weight: 2, width: 3, length: 4, height: 5 },
        lead: 8,
        pricing: true,
      },
      {
        id: 82,
        extra: { weight: 3, width: 4, length: 5, height: 6 },
        lead: 24,
        quantity: 5,
      },
    ],
    ...product,
  };
  const state = {
    ...defaults,
    ...component.data.call({ ...defaults, ...overrides }),
    modern: true,
    active: true,
    shop: {
      id: 42,
      options: [
        { code: "mass_unit", value: "lb" },
        { code: "size_unit", value: "in" },
      ],
    },
    product: parent,
    extra: plain(parent.extra),
    defaultLeadTime: parent.lead,
    $refs: {},
    $slots: {},
    $route: { params: {}, matched: [], hash: "" },
    $vuetify: {
      locale: { isRtl: false },
      display: { width: 1024, smAndUp: true },
    },
    $emit: (...args) => events.push(args),
    $forceUpdate() {},
    $nextTick: (callback) => Promise.resolve().then(() => callback?.()),
    $t: (key, params = {}) =>
      key + (Object.keys(params).length ? ":" + JSON.stringify(params) : ""),
    isObject: (value) =>
      !!value && typeof value === "object" && !Array.isArray(value),
    getShopImagePath: (value) => value,
    ...overrides,
  };
  for (const [key, method] of Object.entries(component.methods || {}))
    state[key] = method.bind(state);
  for (const [key, value] of Object.entries(component.computed || {}))
    Object.defineProperty(state, key, {
      configurable: true,
      get: (typeof value === "function" ? value : value.get).bind(state),
      ...(value.set ? { set: value.set.bind(state) } : {}),
    });
  if (name !== "full") component.created?.call(state);
  return {
    state,
    component,
    descriptor,
    requests,
    events,
    notices,
    context,
    evaluate,
    modules,
  };
}

function renderedNodes(descriptor, state) {
  const result = compileTemplate({
    source: descriptor.template.content,
    filename: "shipping-fixture.vue",
    id: "shipping-check",
  });
  assert.deepEqual(result.errors, []);
  const exports = {};
  vm.runInNewContext(compile(result.code), {
    exports,
    require: () => ({
      ...Vue,
      resolveComponent: (name) => ({ name }),
      resolveDynamicComponent: (name) => ({ name }),
      resolveDirective: () => ({}),
      withDirectives: (node) => node,
      renderSlot: (slots, name, props, fallback) =>
        Vue.h(Vue.Fragment, null, slots?.[name]?.(props) || fallback?.() || []),
    }),
  });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push({ ...node, type: node.type?.name || node.type });
    visit(node.children);
    for (const key of ["default", "order-limits"])
      if (node.children?.[key]) visit(node.children[key]({}));
  }
  visit(exports.render(state, []));
  return nodes;
}

test("native shipping number input keeps localized digits, three-decimal precision and existing min/max bounds", () => {
  const f = fixture("number", {
    modelValue: 4,
    decimal: 3,
    min: 0,
    max: 10000,
  });
  f.component.watch.newValue.call(f.state, "۴.۱۲۳۴");
  assert.deepEqual(f.events.at(-2), ["update:modelValue", 4.123]);
  f.component.watch.newValue.call(f.state, "١٣٠.١٢٣٦");
  assert.deepEqual(f.events.at(-2), ["update:modelValue", 130.124]);
  f.component.watch.newValue.call(f.state, -5);
  assert.deepEqual(f.events.at(-2), ["update:modelValue", 0]);
  f.component.watch.newValue.call(f.state, 20000);
  assert.deepEqual(f.events.at(-2), ["update:modelValue", 10000]);
  f.state.decimal = 0;
  f.state.min = -1;
  f.component.watch.newValue.call(f.state, "-1");
  assert.deepEqual(f.events.at(-2), ["update:modelValue", -1]);
  f.component.watch.newValue.call(f.state, "0");
  assert.deepEqual(f.events.at(-2), ["update:modelValue", 0]);
});

test("native carrier eligibility remains a size/weight fit and includes disabled matching services", () => {
  const f = fixture("services", {
    weight: 4,
    width: 130,
    length: 30,
    height: 40,
  });
  f.state.shop.transportations = [
    { id: 1, max_weight: 4, max_w: 130, max_l: 30, max_h: 40, enable: true },
    { id: 2, max_weight: 9, max_w: 200, max_l: 35, max_h: 45, enable: false },
    { id: 3, max_weight: 3, max_w: 200, max_l: 35, max_h: 45, enable: true },
    { id: 4, max_weight: 9, max_w: 129, max_l: 35, max_h: 45, enable: true },
  ];
  assert.deepEqual(
    Array.from(f.state.eligible_transportations, (item) => item.id),
    [1, 2],
  );
  assert.equal(f.requests.length, 0);
});

test("Shipping modernization is opt-in and initialization normalizes only the local working draft", () => {
  for (const values of [
    { extra: null, lead: null, limit_min: null, limit_max: null },
    { extra: {}, lead: 0, limit_min: 0, limit_max: 0 },
    { lead: -1 },
  ]) {
    const original = {
      id: 31,
      shop_id: 42,
      type: "PHYSICAL",
      quantity: 100,
      ...values,
    };
    const f = fixture("extra", { product: original });
    assert.equal(f.component.props.modern.default, false);
    assert.equal(f.state.hasUnsavedChanges, false);
    assert.equal(f.state.lead, values.lead ?? 0);
    assert.equal(f.state.prepareSave(), true);
    assert.equal(f.requests.length, 0);
    assert.equal(f.events.length, 0);
    if ("extra" in values) assert.equal(f.state.product.extra, values.extra);
    assert.equal(f.state.product.lead, values.lead);
    const legacy = fixture("extra", { modern: false });
    assert.equal(legacy.component.props.active.default, true);
    const nodes = renderedNodes(legacy.descriptor, legacy.state);
    assert.ok(nodes.some((node) => node.type === "s-widget-buttons"));
  }
});

test("ordinary Discard restores only shipping values and keeps current product metadata and independently saved variants", () => {
  const f = fixture();
  const baseline = f.state.savedSnapshot;
  f.state.extra.weight = 9;
  f.state.lead = 72;
  f.state.limit_min = 12;
  f.state.limit_max = 25;
  f.state.bulk = true;
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.equal(f.state.product.extra.weight, 4);
  assert.equal(f.state.product.lead, -1);
  f.state.product.extra.custom = {
    preserved: ["Canonical metadata from another save"],
  };
  f.state.product.product_variants[0].extra.weight = 22;
  f.state.discardChanges();
  assert.equal(f.state.extra.weight, 4);
  assert.equal(f.state.lead, -1);
  assert.equal(Number(f.state.limit_min), 10);
  assert.equal(Number(f.state.limit_max || 0), 0);
  assert.equal(f.state.bulk, false);
  assert.deepEqual(plain(f.state.extra.custom), f.state.product.extra.custom);
  assert.equal(f.state.product.product_variants[0].extra.weight, 22);
  assert.equal(f.state.savedSnapshot, baseline);
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.equal(f.requests.length, 0);
});

test("invalid quantities and preparation reject submission while low-stock warnings and zero values remain saveable", () => {
  const f = fixture("extra", { product: { quantity: 6 } });
  assert.equal(
    f.state.prepareSave(),
    true,
    "Stock below minimum is a warning, not a new Save prohibition",
  );
  for (const [field, value] of [
    ["lead", -2],
    ["lead", 1.5],
    ["limit_min", -1],
    ["limit_min", 2.5],
    ["limit_max", 9],
  ]) {
    const previous = f.state[field];
    f.state[field] = value;
    assert.equal(f.state.prepareSave(), false, `${field}=${value}`);
    f.state.setExtraInfo();
    assert.equal(f.requests.length, 0);
    f.state.discardChanges();
    assert.equal(f.state.hasUnsavedChanges, false);
    f.state[field] = previous;
  }
  for (const field of ["weight", "width", "length", "height"]) {
    f.state.extra[field] = -1;
    assert.equal(f.state.prepareSave(), false, field);
    f.state.discardChanges();
  }
  f.state.extra.weight = 10001;
  assert.equal(f.state.prepareSave(), false);
  f.state.discardChanges();
  f.state.extra = { weight: 0, width: 0, length: 0, height: 0 };
  f.state.lead = 0;
  f.state.limit_min = f.state.limit_max = 0;
  assert.equal(f.state.prepareSave(), true);
  f.state.lead = -1;
  f.state.limit_min = 10;
  f.state.limit_max = 10;
  assert.equal(f.state.prepareSave(), true);
  f.state.limit_max = null;
  assert.equal(f.state.prepareSave(), true);
});

for (const vendor of [false, true]) {
  test(`${vendor ? "Vendor" : "Shop"} Shipping uses its dedicated PUT and canonical success before next`, async () => {
    const f = fixture("extra", {
      $route: vendor
        ? { params: { vendor_id: 8 }, matched: [{ meta: { vendor: true } }] }
        : { params: {}, matched: [] },
    });
    f.state.extra.weight = 7.125;
    f.state.lead = 0;
    f.state.limit_min = 2;
    f.state.limit_max = 20;
    f.state.bulk = true;
    f.state.setExtraInfo();
    f.state.setExtraInfo();
    assert.equal(f.requests.length, 1);
    assert.equal(f.state.busy, true);
    assert.equal(
      f.events.some(([event]) => event === "next"),
      false,
    );
    const request = f.requests[0];
    assert.match(
      request.url,
      vendor
        ? /vendor\/PUT_MY_VENDOR_PRODUCT_EXTRA\/8\/31$/
        : /shop\/PUT_PRODUCT_EXTRA\/42\/31$/,
    );
    assert.deepEqual(request.payload, {
      extra: { weight: 7.125, width: 130, length: 30, height: 40 },
      lead: 0,
      limit_min: 2,
      limit_max: 20,
      bulk: true,
    });
    const response = {
      extra: {
        weight: 7.12,
        width: 131,
        length: 30,
        height: 40,
        custom: { preserved: [1, false], canonical: true },
      },
      lead: 0,
      limit_min: 2,
      limit_max: 20,
      bulk: true,
    };
    request.resolve(response);
    await setImmediate();
    assert.equal(f.state.busy, false);
    assert.equal(f.events.filter(([event]) => event === "next").length, 1);
    assert.equal(f.state.product.extra.weight, 7.12);
    assert.equal(f.state.extra.weight, 7.12);
    assert.equal(f.state.lead, 0);
    assert.equal(
      f.state.bulk,
      false,
      "Apply to variants belongs to this save, not a persistent sync setting",
    );
    assert.equal(f.state.hasUnsavedChanges, false);
    assert.deepEqual(plain(f.state.product.extra.custom), {
      preserved: [1, false],
      canonical: true,
    });
    for (const variant of f.state.product.product_variants) {
      assert.equal(variant.extra.weight, 7.12);
      assert.equal(variant.lead, 0);
      assert.equal(
        variant.id === 81 ? variant.pricing : variant.quantity,
        variant.id === 81 ? true : 5,
      );
    }
  });
}

test("a non-bulk save does not change variant packages, while failed saves preserve the complete draft for retry", async () => {
  const f = fixture(),
    before = plain(f.state.product);
  const baseline = f.state.savedSnapshot;
  f.state.extra.weight = 5;
  f.state.lead = 24;
  f.state.setExtraInfo();
  f.requests[0].resolve({ error: true, error_msg: "Fixture business failure" });
  await setImmediate();
  assert.equal(f.state.busy, false);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.equal(f.state.savedSnapshot, baseline);
  assert.deepEqual(plain(f.state.product), before);
  assert.equal(f.events.length, 0);
  f.state.setExtraInfo();
  f.requests[1].reject(new Error("Fixture transport failure"));
  await setImmediate();
  assert.equal(f.state.busy, false);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.equal(f.state.extra.weight, 5);
  assert.equal(f.state.lead, 24);
  f.state.setExtraInfo();
  f.requests[2].resolve({
    extra: { weight: 5, width: 130, length: 30, height: 40 },
    lead: 24,
    limit_min: 10,
    limit_max: null,
    bulk: false,
  });
  await setImmediate();
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.deepEqual(
    plain(f.state.product.product_variants),
    before.product_variants,
  );
  assert.equal(f.events.filter(([event]) => event === "next").length, 1);
  assert.equal(
    f.notices.filter((item) => item.method !== "showSuccessAlert").length,
    2,
  );
});

test("inherited Shipping settings remain readable and Continue advances without a write", () => {
  const f = fixture("extra", { product: { parent_id: 99 } }),
    before = plain(f.state.product);
  const nodes = renderedNodes(f.descriptor, f.state);
  const input = nodes.find((node) => node.type === "b-product-extra-input");
  assert.equal(input.props.readonly, true);
  f.state.setExtraInfo();
  assert.deepEqual(f.events, [["next"]]);
  assert.equal(f.requests.length, 0);
  assert.deepEqual(plain(f.state.product), before);
});

test("inactive, parent-busy and child-modal guards cover every Shipping submission and Discard path", () => {
  const f = fixture();
  f.state.extra.weight = 8;
  for (const key of ["active", "parentBusy", "busy"]) {
    f.state[key] = key !== "active";
    assert.equal(f.state.prepareSave(), false, key);
    f.state.setExtraInfo();
    if (key !== "active") f.state.discardChanges();
    assert.equal(f.requests.length, 0);
    assert.equal(f.state.extra.weight, 8);
    f.state[key] = key === "active";
  }
  const ref = Object.keys(f.state.$refs)[0] || "shippingInput";
  f.state.$refs[ref] = { prepareSave: () => false };
  assert.equal(f.state.prepareSave(), false);
  f.state.setExtraInfo();
  assert.equal(f.requests.length, 0);
  f.state.$refs[ref].prepareSave = () => true;
  assert.equal(f.state.prepareSave(), true);
});

test("shared modern inputs retain native units, 0/-1 preparation and guarded setters without mount emissions", () => {
  for (const lead of [-1, 0, 48]) {
    const f = fixture("input", { defaultLeadTime: lead, hasBulkAction: true });
    assert.equal(f.component.props.modern.default, false);
    assert.equal(f.state.modernLead, lead);
    assert.equal(f.state.mass_unit, "lb");
    assert.equal(f.state.size_unit, "in");
    assert.equal(f.events.length, 0);
    const nodes = renderedNodes(f.descriptor, f.state);
    const fields = nodes.filter((node) => node.type === "u-number-input");
    assert.equal(fields.length, 5);
    assert.deepEqual(
      fields.slice(0, 4).map((node) => node.props.decimal),
      [3, 3, 3, 3],
    );
    assert.deepEqual(
      fields.slice(0, 4).map((node) => node.props.suffix),
      ["lb", "in", "in", "in"],
    );
    assert.equal(fields[0].props.max, 10000);
    assert.equal(fields.at(-1).props.min, -1);
    assert.deepEqual(
      Array.from(f.state.modernLeads, (item) => item.value),
      [-1, 0, 8, 24, 72, 168],
    );
    assert.match(
      f.state.leadDigest,
      lead === -1
        ? /dynamic_digest/
        : lead === 0
          ? /ready_digest/
          : /days_digest/,
    );
    assert.equal(
      nodes.some(
        (node) => node.props?.to?.name === "BPageShopLogisticWarehouse",
      ),
      true,
    );
  }
  const f = fixture("input", { defaultLeadTime: 0 });
  f.state.modernLead = 0;
  assert.equal(f.events.length, 0);
  f.state.modernLead = -1;
  assert.deepEqual(f.events.at(-1), ["onLeadChange", -1]);
  for (const restriction of ["readonly", "busy"]) {
    const count = f.events.length,
      before = plain(f.state.extra);
    f.state[restriction] = true;
    f.state.modernWeight = 99;
    f.state.modernWidth = 199;
    f.state.modernLength = 299;
    f.state.modernHeight = 399;
    f.state.modernLead = 168;
    f.state.updateBulk(true);
    assert.deepEqual(plain(f.state.extra), before);
    assert.equal(f.events.length, count);
    f.state[restriction] = false;
  }
  const vendor = fixture("input", {
    $route: { params: { vendor_id: 8 }, matched: [{ meta: { vendor: true } }] },
  });
  assert.equal(
    renderedNodes(vendor.descriptor, vendor.state).some(
      (node) => node.props?.to?.name === "BPageShopLogisticWarehouse",
    ),
    false,
  );
  f.state.$refs.services = { menu: true };
  assert.equal(f.state.prepareSave(), false);
  f.state.$refs.services.menu = false;
  assert.equal(f.state.prepareSave(), true);
});

test("service details preserve native identity, read-only overview and modal activity/focus guards", async () => {
  const f = fixture("services"),
    item = {
      id: 1,
      type: "post",
      title: "Fixture carrier",
      logo: "carrier-logo.png",
      enable: false,
    };
  let focused = 0;
  const trigger = {
    isConnected: true,
    disabled: false,
    focus: () => focused++,
  };
  f.state.setActivator(trigger, item);
  f.component.watch.menu.call(f.state, true);
  assert.equal(f.state.menu, true);
  assert.equal(f.state.activator_item, item);
  assert.deepEqual(f.events.at(-1), ["dialog-change", true]);
  const nodes = renderedNodes(f.descriptor, f.state);
  const overview = nodes.find(
    (node) => node.type === "b-transportation-overview",
  );
  assert.equal(overview.props["show-buttons"], false);
  assert.notEqual(overview.props.modern, undefined);
  assert.equal(overview.props.transportation, item);
  f.state.closeDetails();
  f.component.watch.menu.call(f.state, false);
  await setImmediate();
  assert.equal(f.state.menu, false);
  assert.equal(focused, 1);
  f.state.busy = true;
  f.state.setActivator(trigger, item);
  assert.equal(f.state.menu, false);
  assert.equal(f.requests.length, 0);
});

test("modern package preview is proportional, finite and static while legacy callers retain canvas", () => {
  const f = fixture("cube", { x: 130, y: 30, z: 40, unit: "in" });
  assert.equal(f.component.props.modern.default, false);
  assert.equal(f.state.validDimensions, true);
  const nodes = renderedNodes(f.descriptor, f.state);
  assert.equal(
    nodes.some((node) => node.type === "canvas"),
    false,
  );
  assert.equal(nodes.filter((node) => node.type === "polygon").length, 3);
  assert.match(
    nodes.find((node) => node.type === "svg").props["aria-label"],
    /130.*30.*40.*in/,
  );
  assert.equal(
    /NaN|Infinity/.test(JSON.stringify(f.state.modernGeometry)),
    false,
  );
  const geometry = plain(f.state.modernGeometry);
  f.state.x = 20;
  assert.notDeepEqual(plain(f.state.modernGeometry), geometry);
  f.state.y = 0;
  assert.equal(f.state.validDimensions, false);
  assert.equal(
    /NaN|Infinity/.test(JSON.stringify(f.state.modernGeometry)),
    false,
  );
  const legacy = fixture("cube", { modern: false });
  assert.equal(
    renderedNodes(legacy.descriptor, legacy.state).some(
      (node) => node.type === "canvas",
    ),
    true,
  );
});

test("external canonical updates refresh a clean Shipping draft, but retain an unsaved draft and advance its Discard baseline", () => {
  const f = fixture();
  Object.assign(f.state.product, {
    extra: { ...f.state.product.extra, weight: 6 },
    lead: 8,
    limit_min: 2,
  });
  f.component.watch.canonicalSnapshot.call(f.state, f.state.canonicalSnapshot);
  assert.equal(f.state.extra.weight, 6);
  assert.equal(f.state.lead, 8);
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.extra.weight = 9;
  f.state.lead = 72;
  f.state.bulk = true;
  Object.assign(f.state.product, {
    extra: {
      weight: 7,
      width: 130,
      length: 31,
      height: 40,
      serverMetadata: "Current canonical metadata",
    },
    lead: 24,
    limit_min: 3,
  });
  f.component.watch.canonicalSnapshot.call(f.state, f.state.canonicalSnapshot);
  assert.equal(f.state.extra.weight, 9);
  assert.equal(f.state.lead, 72);
  assert.equal(f.state.bulk, true);
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.discardChanges();
  assert.equal(f.state.extra.weight, 7);
  assert.equal(f.state.extra.length, 31);
  assert.equal(f.state.lead, 24);
  assert.equal(f.state.extra.serverMetadata, "Current canonical metadata");
  assert.equal(f.state.extra.custom, undefined);
  assert.equal(f.state.bulk, false);
  assert.equal(f.state.hasUnsavedChanges, false);
});

test("new-product identity and disposed/replaced-request guards prevent stale success from changing another product", async () => {
  for (const reason of ["disposed", "replaced", "id"]) {
    const f = fixture();
    f.state.extra.weight = 7;
    f.state.setExtraInfo();
    const oldProduct = f.state.product;
    if (reason === "disposed") f.component.beforeUnmount.call(f.state);
    else if (reason === "replaced")
      f.state.product = { ...oldProduct, id: 32, extra: { weight: 8 } };
    else f.state.product.id = 32;
    f.requests[0].resolve({
      extra: { weight: 100 },
      lead: 999,
      limit_min: 100,
      limit_max: 200,
      bulk: true,
    });
    await setImmediate();
    assert.equal(f.events.length, 0);
    assert.equal(f.state.busy, false);
    assert.notEqual(f.state.product.extra.weight, 100);
  }
  const f = fixture();
  f.state.extra.weight = 9;
  f.state.bulk = true;
  f.state.product = {
    ...f.state.product,
    id: 32,
    extra: { weight: 8, width: 2, length: 3, height: 4 },
    lead: 0,
  };
  f.component.watch["product.id"].call(f.state);
  assert.equal(f.state.extra.weight, 8);
  assert.equal(f.state.lead, 0);
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.equal(f.state.bulk, false);
});

function parentFixture(mode = "edit", vendor = false) {
  const shipping = fixture("extra", {
    $route: vendor
      ? { params: { vendor_id: 8 }, matched: [{ meta: { vendor: true } }] }
      : { params: {}, matched: [] },
  });
  const full = fixture("full", {
    modern: mode === "add",
    modernGeneral: mode === "edit",
    step: 9,
    type: shipping.modules.type.ProductType.PHYSICAL,
    $product: shipping.state.product,
    $route: shipping.state.$route,
    vendor: vendor ? { id: 8 } : null,
  });
  full.state.setStepEditor(shipping.state, 9);
  full.state.getRenderedOnGoogle = () => {};
  shipping.state.$emit = (...args) => {
    shipping.events.push(args);
    if (args[0] === "next" && full.state.step === 9) full.state.nextStep();
  };
  return { shipping, full };
}

for (const mode of ["edit", "add"]) {
  test(`${mode} Shipping common submit waits for its own dedicated PUT and advances to Description without a generic product PUT`, async () => {
    const { shipping, full } = parentFixture(mode, mode === "add");
    shipping.state.extra.weight = 5;
    const pending = full.state.submitStep();
    assert.equal(shipping.requests.length, 1);
    assert.equal(full.requests.length, 0);
    assert.equal(full.state.step, 9);
    assert.equal(full.state.flowBusy, true);
    await full.state.submitStep();
    assert.equal(shipping.requests.length, 1);
    shipping.requests[0].resolve({ error: true, error_msg: "Fixture failure" });
    await pending;
    await setImmediate();
    assert.equal(full.state.step, 9);
    assert.equal(shipping.state.hasUnsavedChanges, true);
    assert.equal(full.state.flowBusy, false);
    const retry = full.state.submitStep();
    shipping.requests[1].resolve({
      extra: { ...shipping.state.product.extra, weight: 5 },
      lead: -1,
      limit_min: 10,
      limit_max: null,
      bulk: false,
    });
    await retry;
    await setImmediate();
    assert.equal(full.state.step, 10);
    assert.equal(shipping.state.hasUnsavedChanges, false);
    assert.equal(
      full.requests.length,
      0,
      "The dedicated Shipping endpoint already saved this section",
    );
  });
}

test("actual mounted Shipping and native inputs keep their draft/baseline across Edit tabs, without hidden shortcuts or initial drift", async () => {
  const source = fixture(),
    childSource = fixture("input"),
    numberSource = fixture("number", { modelValue: 4 });
  const parent = sfc("full"),
    parentComponent = source.evaluate(parent.script.content).default;
  function findWrapper(node) {
    if (
      node.tag === "div" &&
      node.children?.some((child) => child.tag === "b-product-edit-extra")
    )
      return node;
    for (const child of node.children || []) {
      const found = findWrapper(child);
      if (found) return found;
    }
  }
  const wrapper = findWrapper(parent.template.ast);
  assert.ok(wrapper);
  function render(template) {
    const output = compileTemplate({
      source: template,
      filename: "mounted-shipping.vue",
      id: "mounted-shipping",
    });
    assert.deepEqual(output.errors, []);
    const exports = {};
    vm.runInNewContext(compile(output.code), { exports, require: () => Vue });
    return exports.render;
  }
  const node = (tag, text = "") => ({
    tag,
    text,
    props: {},
    style: {},
    children: [],
    parent: null,
    isConnected: true,
    focus() {},
    scrollIntoView() {},
  });
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
    setText: (node, text) => {
      node.text = text;
    },
    setElementText: (node, text) => {
      node.text = text;
      node.children = [];
    },
    patchProp: (node, key, previous, value) => {
      node.props[key] = value;
    },
    parentNode: (node) => node.parent,
    nextSibling: (node) =>
      node.parent?.children[node.parent.children.indexOf(node) + 1],
  });
  const slotStub = (tag = "div") =>
    Vue.defineComponent({
      setup:
        (_, { attrs, slots }) =>
        () =>
          Vue.h(tag, attrs, slots.default?.()),
    });
  const number = {
    ...numberSource.component,
    render: render(numberSource.descriptor.template.content),
  };
  const input = {
    ...childSource.component,
    render: render(childSource.descriptor.template.content),
    components: {
      UNumberInput: number,
      BProductEditInfoIcon: slotStub("svg"),
      USmartToggle: slotStub("label"),
      UCube: slotStub("svg"),
      TransportationsEligibleView: Vue.defineComponent({
        data: () => ({ menu: false }),
        methods: { closeDetails() {} },
        render: () => null,
      }),
    },
  };
  const editor = {
    ...source.component,
    render: render(source.descriptor.template.content),
    components: {
      BProductExtraInput: input,
      UNumberInput: number,
      BProductEditInfoIcon: slotStub("svg"),
      SWidgetButtons: slotStub(),
    },
  };
  const app = renderer.createApp({
    inject: ["$product"],
    data: () => ({
      step: 9,
      modern: false,
      modernGeneral: true,
      visitedSteps: [2, 9],
      stepEditors: {},
      active_editor: null,
      busy: false,
      TAB_PHYSICAL_EXTRA_INFO: 9,
      shop: source.state.shop,
      replaceHashRoute: false,
    }),
    computed: { modernWorkspace: parentComponent.computed.modernWorkspace },
    methods: {
      isStepMounted: parentComponent.methods.isStepMounted,
      setStepEditor: parentComponent.methods.setStepEditor,
      nextStep() {},
    },
    watch: { step: parentComponent.watch.step },
    components: { BProductEditExtra: editor },
    render: render(wrapper.loc.source),
  });
  for (const name of ["VBtn", "VTooltip", "VTextField", "VChip", "VIcon"])
    app.component(name, slotStub(name === "VBtn" ? "button" : "span"));
  const shortcuts = new Set();
  app.directive("ctrl", {
    mounted: (element) => shortcuts.add(element),
    unmounted: (element) => shortcuts.delete(element),
  });
  const failures = [];
  app.config.errorHandler = (error) => failures.push(error);
  app.config.warnHandler = () => {};
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    isObject: (value) =>
      !!value && typeof value === "object" && !Array.isArray(value),
    $route: { params: {}, matched: [] },
    $vuetify: { locale: { isRtl: false } },
  });
  const product = Vue.reactive({
    id: 31,
    shop_id: 42,
    type: "PHYSICAL",
    quantity: 100,
    extra: { weight: 0, width: 0, length: 0, height: 0, custom: "Preserved" },
    lead: 0,
    limit_min: null,
    limit_max: null,
  });
  app.provide("$product", product);
  const host = node("root"),
    workspace = app.mount(host);
  const descendants = (node) => [node, ...node.children.flatMap(descendants)];
  const saves = () =>
    descendants(host).filter(
      (node) => node.props["aria-keyshortcuts"] === "Control+s",
    );
  try {
    await Vue.nextTick();
    await Vue.nextTick();
    assert.deepEqual(failures, []);
    const shipping = workspace.stepEditors[9];
    assert.ok(shipping);
    assert.equal(shipping.hasUnsavedChanges, false);
    assert.equal(shipping.lead, 0);
    assert.equal(product.extra.weight, 0);
    assert.equal(product.limit_min, null);
    assert.equal(saves().length, 1);
    assert.equal(shortcuts.size, 1);
    const baseline = shipping.savedSnapshot;
    shipping.extra.weight = 7.125;
    shipping.lead = -1;
    shipping.bulk = true;
    await Vue.nextTick();
    assert.equal(shipping.hasUnsavedChanges, true);
    workspace.step = 7;
    await Vue.nextTick();
    await Vue.nextTick();
    assert.equal(workspace.stepEditors[9], shipping);
    assert.equal(shipping.savedSnapshot, baseline);
    assert.equal(shipping.extra.weight, 7.125);
    assert.equal(shipping.lead, -1);
    assert.equal(saves().length, 0);
    assert.equal(shortcuts.size, 0);
    assert.equal(
      host.children.find((node) => node.tag === "div").style.display,
      "none",
    );
    Object.assign(product, {
      extra: {
        weight: 4,
        width: 5,
        length: 6,
        height: 7,
        custom: "Updated canonical metadata",
      },
      lead: 24,
      limit_min: 2,
      limit_max: 10,
    });
    await Vue.nextTick();
    assert.equal(shipping.extra.weight, 7.125);
    assert.equal(shipping.lead, -1);
    workspace.step = 9;
    await Vue.nextTick();
    await Vue.nextTick();
    assert.equal(workspace.active_editor, shipping);
    assert.equal(saves().length, 1);
    assert.equal(shortcuts.size, 1);
    shipping.discardChanges();
    await Vue.nextTick();
    await Vue.nextTick();
    assert.equal(shipping.extra.weight, 4);
    assert.equal(shipping.lead, 24);
    assert.equal(shipping.extra.custom, "Updated canonical metadata");
    assert.equal(shipping.bulk, false);
    assert.equal(shipping.hasUnsavedChanges, false);
    assert.deepEqual(failures, []);
    assert.equal(source.requests.length, 0);
  } finally {
    app.unmount();
  }
});
