import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

const { descriptor, errors } = parse(
  readFileSync(new URL("./BProductEditInfo.vue", import.meta.url), "utf8"),
);
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const types = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [code, { code, name: code }]),
);
const conditions = {
  NEW: { code: "new", title: "New" },
  USED: { code: "used", title: "Used" },
};
const statuses = Object.fromEntries(
  ["Open", "Close", "Unlisted", "Pending", "Rejected"].map((code) => [code, { code, title: code }]),
);
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture({ type = "PHYSICAL", created = true, modern = true, vendorPanel = false, product = {}, shop = {} } = {}) {
  const requests = [];
  const notices = [];
  const notification = Object.fromEntries(
    ["showErrorAlert", "showLaravelError", "showSuccessAlert"].map((name) => [name, (...args) => notices.push({ name, args })]),
  );
  const axios = {
    post(url, payload) {
      return new Promise((resolve, reject) => requests.push({
        url, payload, reject, resolve: (data) => resolve({ data }),
      }));
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    axios,
    window: {
      API: {
        POST_SET_PRODUCT_VALUATION: (shop, product) => `/fixture/shops/${shop}/products/${product}/valuation`,
        POST_PRODUCT_SET_SHORTCUT_CATEGORIES: (shop, product) => `/fixture/shops/${shop}/products/${product}/shortcuts`,
      },
      VAPI: {
        POST_MY_VENDOR_PRODUCT_SET_SHORTCUT_CATEGORIES: (vendor, product) => `/fixture/vendors/${vendor}/products/${product}/shortcuts`,
      },
    },
    require(name) {
      if (name.includes("NotificationService")) return { default: notification };
      if (name.includes("ProductType")) return { ProductType: types };
      if (name.includes("ProductCondition")) return { ProductCondition: conditions };
      if (name.includes("ProductStatus")) return { ProductStatus: statuses };
      if (name.includes("BusinessModel")) return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (name.includes("ShopLicense")) return { ShopLicense: { COMPANY: { code: "COMPANY" }, ENTERPRISE: { code: "ENTERPRISE" } } };
      if (name.includes("BuyButtonHelper")) return { BuyButtonHelper: { ExtractIconCaption: (value) => value } };
      if (name.includes("ProductExternal")) return { ProductExternal: { getServiceData: () => null } };
      return { default: {} };
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    modern,
    externalActionButtons: true,
    shop: { id: 42, model: "NORMAL", license: "COMPANY", ...shop },
    vendor: vendorPanel ? { id: 9, name: "Fixture vendor" } : null,
    $product: {
      id: created ? 31 : null,
      type,
      title: "Fixture product",
      title_en: "Fixture subtitle",
      unit: "Item",
      price_input: "default",
      unit_float: false,
      condition: "new",
      original: true,
      status: "Open",
      shortcuts: [],
      valuation: null,
      valuation_id: null,
      ...product,
    },
    $route: { params: vendorPanel ? { vendor_id: "9" } : {}, matched: [{ meta: { vendor: vendorPanel } }], query: {} },
    $refs: {},
    $t: (key, values = {}) => key + (Object.keys(values).length ? ":" + JSON.stringify(values) : ""),
    $tm: () => ["Item", "kg"],
    $nextTick: (callback) => Promise.resolve().then(callback),
  };
  state.$shop = state.shop;
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: getter.bind(state) });
  component.created.call(state);
  return { state, component, requests, notices };
}

test("collapsed General digests reflect live unsaved values and sensible empty states", () => {
  const { state, requests } = fixture();
  assert.match(state.unitsDigest, /Item/);
  assert.match(state.identifiersDigest, /digest_identifiers_none/);
  assert.match(state.warrantyDigest, /digest_warranty_none/);
  assert.match(state.profilesDigest, /digest_none/);

  Object.assign(state.$product, {
    unit: "kg", price_input: "area", unit_float: true,
    sku: "DRAFT-42", mpn: "   ", gtin: "12345678", hsn: 0,
    condition: "used", original: false, warranty: "Two years", return_warranty: 30,
  });
  assert.match(state.unitsDigest, /kg · price_input_type\.area\.title/);
  assert.match(state.unitsDigest, /digest_fractional/);
  assert.match(state.identifiersDigest, /SKU: DRAFT-42/);
  assert.match(state.identifiersDigest, /GTIN: 12345678/);
  assert.match(state.identifiersDigest, /HSN: 0/);
  assert.doesNotMatch(state.identifiersDigest, /MPN:|digest_identifiers_none/);
  assert.match(state.identifiersDigest, /Used.*global\.commons\.fake/);
  assert.match(state.warrantyDigest, /Two years.*"days":30/);

  Object.assign(state.$product, {
    price_input: "custom", valuation: { id: 17, title: "Draft dimension form" },
    action: "Reserve this item", external: "https://fixture.invalid/item",
  });
  assert.match(state.unitsDigest, /Draft dimension form/);
  assert.match(state.unitsDigest, /Reserve this item/);
  assert.match(state.unitsDigest, /digest_external/);
  state.$product.sku = "REVISED-42";
  assert.match(state.identifiersDigest, /SKU: REVISED-42/);
  assert.doesNotMatch(state.identifiersDigest, /DRAFT-42/);
  assert.equal(requests.length, 0);
});

test("General type and vendor guards preserve available pricing and verification choices", () => {
  for (const type of Object.keys(types)) {
    const { state } = fixture({ type, product: { unit_float: true, lead: 0 } });
    assert.deepEqual(plain(state.price_input_modes.map((mode) => mode.code)),
      type === "PHYSICAL" ? ["default", "area", "volume", "custom"] : ["default", "custom"]);
    assert.equal(state.unitsDigest.includes("digest_fractional"), type === "PHYSICAL");
    assert.equal(state.unitsDigest.includes("price_input_type.default.title"),
      ["PHYSICAL", "VIRTUAL", "SERVICE"].includes(type));
    assert.equal(state.identifiersDigest.includes("New"), type === "PHYSICAL");
    assert.equal(state.warrantyDigest.includes('"hours":0'), type === "VIRTUAL");
  }

  const marketplace = { model: "MARKETPLACE", marketplace: { need_verify: true } };
  const dynamicLead = fixture({ type: "VIRTUAL", product: { lead: -1 } }).state.warrantyDigest;
  assert.match(dynamicLead, /product_extra_physical.dynamic_lead_time/);
  assert.doesNotMatch(dynamicLead, /"hours":-1/);
  assert.equal(fixture({ created: false, vendorPanel: true, shop: marketplace }).state.$product.status, "Pending");
  assert.equal(fixture({ created: true, vendorPanel: true, shop: marketplace }).state.$product.status, "Open");
  assert.equal(fixture({ created: false, vendorPanel: false, shop: marketplace }).state.$product.status, "Open");
  assert.equal(fixture({ shop: { license: "FREE" } }).state.can_set_external, false);
});

test("profile digests follow selected IDs without displaying stale profile metadata", () => {
  const { state } = fixture({
    shop: { tax_profiles: [{ id: 7, name: "Local tax" }] },
    product: {
      warranty_id: 1, shipping_id: 2, tax_id: 7,
      map_id: 3, map: { id: 3, title: "Warehouse" },
      property_set_id: 4, property_set: { id: 4, title: "Furniture" }, includes: [{ id: 5 }],
    },
  });
  assert.match(state.profilesDigest, /digest_profiles.*"count":2/);
  assert.match(state.profilesDigest, /Local tax.*Warehouse.*Furniture/);
  assert.match(state.profilesDigest, /digest_included.*"count":1/);
  Object.assign(state.$product, { tax_id: 8, map_id: 9, property_set_id: 10 });
  assert.match(state.profilesDigest, /#8.*#9.*#10/);
  assert.doesNotMatch(state.profilesDigest, /Local tax|Warehouse|Furniture/);
  state.$product.type = "SERVICE";
  assert.doesNotMatch(state.profilesDigest, /digest_property|#10/);
});

test("vendor digest follows a changed assignment instead of the previous vendor name", () => {
  const { state } = fixture({
    product: { vendor_id: 9, vendor: { id: 9, name: "Original vendor" } },
  });
  assert.equal(state.vendorDigest, "Original vendor");
  state.$product.vendor_id = 22;
  assert.equal(state.vendorDigest, "#22");
  state.$product.vendor_id = null;
  assert.match(state.vendorDigest, /multi_vendors_title/);
});

test("validation opens only invalid General disclosures and leaves other groups unchanged", () => {
  const { state } = fixture();
  const invalid = { open: false, querySelector: (selector) => selector === ".v-input--error" ? {} : null };
  const validClosed = { open: false, querySelector: () => null };
  const validOpen = { open: true, querySelector: () => null };
  const unrelatedDialog = { open: false, querySelector: () => ({}) };
  state.$refs.general_content = {
    querySelectorAll: (selector) => selector === "details" ? [validClosed, invalid, validOpen] : [],
  };
  state.$refs.unrelatedDialog = unrelatedDialog;
  state.revealValidation();
  assert.equal(invalid.open, true);
  assert.equal(validClosed.open, false);
  assert.equal(validOpen.open, true);
  assert.equal(unrelatedDialog.open, false);
  state.modern = false;
  invalid.open = false;
  state.revealValidation();
  assert.equal(invalid.open, false);
});

test("Discard restores ordinary General drafts while preserving independently saved settings", () => {
  const { state, component } = fixture({ product: {
    category_id: 2, action: "Original action", vendor_id: 9,
    map_id: 3, map: { id: 3, title: "Original map" },
  } });
  component.mounted.call(state);
  assert.equal(state.hasUnsavedChanges, false);
  Object.assign(state.$product, {
    title: "Unsaved title", category_id: 8, action: "Unsaved action", vendor_id: null,
    sku: "New previously absent key", property_set_id: 5, property_set: { id: 5, title: "Draft set" },
  });
  state.$product.map.title = "Unsaved map";
  state.category_id = 8;
  state.live_action = "Unsaved action";
  state.single_vendor = false;
  assert.equal(state.hasUnsavedChanges, true);

  const independent = { shortcuts: [4, 7], valuation_id: 17, valuation: { id: 17, title: "Saved form" }, includes: [{ id: 12 }] };
  Object.assign(state.$product, independent);
  state.discardChanges();
  assert.equal(state.$product.title, "Fixture product");
  assert.equal(state.$product.map.title, "Original map");
  assert.equal(Object.hasOwn(state.$product, "sku"), false);
  assert.equal(Object.hasOwn(state.$product, "property_set_id"), false);
  assert.equal(Object.hasOwn(state.$product, "property_set"), false);
  assert.equal(state.category_id, 2);
  assert.equal(state.live_action, "Original action");
  assert.equal(state.single_vendor, true);
  for (const [key, value] of Object.entries(independent)) assert.equal(state.$product[key], value);
  assert.equal(state.hasUnsavedChanges, false);

  state.$product.title = "Successfully saved title";
  state.markSaved();
  state.$product.title = "Later unsaved title";
  state.discardChanges();
  assert.equal(state.$product.title, "Successfully saved title");
});

test("General Discard restores all four logistic assignment ids and their matching names", () => {
  const pairs = [
    ["warranty_id", "warranty_profile", "WARRANTY"],
    ["return_policy_id", "return_policy_profile", "RETURN_POLICY"],
    ["guide_id", "guide_profile", "GUIDE"],
    ["shipping_id", "shipping_profile", "SHIPPING"],
  ];
  const original = {};
  for (const [index, [column, relation, type]] of pairs.entries()) {
    original[column] = index + 1;
    original[relation] = { id: index + 1, type, name: `Saved ${type}`, info: { languages: ["en"] } };
  }
  const { state, component, requests } = fixture({ product: original });
  component.mounted.call(state);
  state.$product.warranty_profile.name = "Changed metadata name";
  state.$product.warranty_profile.info.languages.push("fa");
  assert.equal(state.hasUnsavedChanges, true);
  for (const [index, [column, relation, type]] of pairs.entries()) {
    state.$product[column] = index + 20;
    state.$product[relation] = { id: index + 20, type, name: `Draft ${type}`, info: { languages: ["fa"] } };
  }
  state.discardChanges();
  for (const [column, relation, type] of pairs) {
    assert.equal(state.$product[column], original[column]);
    assert.equal(state.$product[relation].name, `Saved ${type}`);
    assert.deepEqual(plain(state.$product[relation].info), { languages: ["en"] });
  }
  assert.equal(state.hasUnsavedChanges, false);
  assert.equal(requests.length, 0);
});

test("General Discard removes a newly assigned profile summary when the saved product was unassigned", () => {
  const { state, component } = fixture({ product: { warranty_id: null } });
  component.mounted.call(state);
  Object.assign(state.$product, { warranty_id: 22,
    warranty_profile: { id: 22, type: "WARRANTY", name: "Unsaved warranty", info: null },
  });
  assert.equal(state.hasUnsavedChanges, true);
  state.discardChanges();
  assert.equal(state.$product.warranty_id, null);
  assert.equal(Object.hasOwn(state.$product, "warranty_profile"), false);
  assert.equal(state.hasUnsavedChanges, false);
});

test("independent saves do not clear or create ordinary General dirty state", async () => {
  const { state, requests } = fixture();
  state.markSaved();
  state.shortcuts = [6];
  state.setShortcuts();
  requests[0].resolve({ shortcuts: [6] });
  await setImmediate();
  assert.equal(state.hasUnsavedChanges, false);
  state.$product.title = "Unsaved General title";
  state.setProductValuation(17);
  requests[1].resolve({ valuation: { id: 17, title: "Saved form" } });
  await setImmediate();
  assert.equal(state.hasUnsavedChanges, true);
  state.discardChanges();
  assert.equal(state.$product.title, "Fixture product");
  assert.equal(state.$product.valuation_id, 17);
  assert.deepEqual(plain(state.$product.shortcuts), [6]);
});

test("new product shortcut choices stay local until the product exists", () => {
  const { state, requests } = fixture({ created: false });
  state.shortcuts = [null, 8, 12];
  state.shortcut_dialog = true;
  state.setShortcuts();
  assert.deepEqual(plain(state.$product.shortcuts), [8, 12]);
  assert.equal(state.shortcut_dialog, false);
  assert.equal(requests.length, 0);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} shortcuts retain their independent scoped save`, async () => {
    const { state, requests } = fixture({ vendorPanel });
    state.shortcuts = [8, 12];
    state.shortcut_dialog = true;
    state.setShortcuts();
    assert.equal(state.busy_set_shortcuts, true);
    assert.equal(requests[0].url, vendorPanel ? "/fixture/vendors/9/products/31/shortcuts" : "/fixture/shops/42/products/31/shortcuts");
    assert.deepEqual(plain(requests[0].payload), { shortcuts: [8, 12] });
    requests[0].resolve({ shortcuts: [8, 12] });
    await setImmediate();
    assert.deepEqual(plain(state.$product.shortcuts), [8, 12]);
    assert.equal(state.shortcut_dialog, false);
    assert.equal(state.busy_set_shortcuts, false);
  });
}

test("valuation assignment and removal update only after their own successful save", async () => {
  const { state, requests } = fixture();
  const valuation = { id: 17, title: "Custom dimensions" };
  state.setProductValuation(17);
  assert.equal(state.busy_valuation, true);
  assert.equal(requests[0].url, "/fixture/shops/42/products/31/valuation");
  assert.deepEqual(plain(requests[0].payload), { valuation_id: 17 });
  assert.equal(state.$product.valuation_id, null);
  requests[0].resolve({ valuation });
  await setImmediate();
  assert.equal(state.$product.valuation_id, 17);
  assert.equal(state.$product.valuation, valuation);
  assert.equal(state.busy_valuation, false);

  state.setProductValuation(null);
  requests[1].resolve({ valuation: null });
  await setImmediate();
  assert.equal(state.$product.valuation_id, null);
  assert.equal(state.$product.valuation, null);
});

test("failed independent saves preserve persisted selections and clear loading", async () => {
  const saved = { id: 4, title: "Saved valuation" };
  const { state, requests, notices } = fixture({ product: { shortcuts: [3], valuation: saved, valuation_id: 4 } });
  state.shortcuts = [9];
  state.shortcut_dialog = true;
  state.setShortcuts();
  requests[0].resolve({ error: true, error_msg: "Fixture rejected shortcuts" });
  await setImmediate();
  assert.deepEqual(plain(state.$product.shortcuts), [3]);
  assert.equal(state.shortcut_dialog, true);
  assert.equal(state.busy_set_shortcuts, false);
  assert.equal(notices[0].name, "showErrorAlert");

  state.setProductValuation(99);
  const error = new Error("Fixture valuation failure");
  requests[1].reject(error);
  await setImmediate();
  assert.equal(state.$product.valuation_id, 4);
  assert.equal(state.$product.valuation, saved);
  assert.equal(state.busy_valuation, false);
  assert.equal(notices.at(-1).name, "showLaravelError");
});
