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
const logisticExports = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../../../../../core-js/enums/logistic/LogisticProfileType.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: logisticExports });
const { LogisticProfileType } = logisticExports;
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
      if (name.includes("LogisticProfileType")) return { LogisticProfileType };
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
  assert.match(state.unitsDigest, /^kg · .*digest_input.*price_input_type\.area\.title.* · .*digest_fractional$/);
  assert.equal(state.selectedPriceInputMode.code, "area");
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
    const hasPricingInput = ["PHYSICAL", "VIRTUAL", "SERVICE"].includes(type);
    assert.equal(state.unitsDigest.includes("digest_input"), hasPricingInput);
    assert.equal(state.unitsDigest.includes("digest_fractional"), type === "PHYSICAL");
    assert.equal(state.unitsDigest.split(" · ")[0], "Item");
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

test("pricing summary markers follow draft mode changes and Discard without saving", () => {
  const { state, component, requests } = fixture();
  component.mounted.call(state);
  const modes = [
    ["default", "pin"],
    ["area", "aspect_ratio"],
    ["volume", "view_in_ar"],
    ["custom", "calculate"],
  ];
  for (const [code, icon] of modes) {
    state.$product.price_input = code;
    assert.equal(state.selectedPriceInputMode.code, code);
    assert.equal(state.selectedPriceInputMode.icon, icon);
    assert.equal(state.selectedPriceInputMode.title, `price_input_type.${code}.title`);
    assert.equal(state.unitSummaryMarkers[0].icon, icon);
    assert.match(state.unitSummaryMarkers[0].title, new RegExp(`price_input_type\\.${code}\\.title`));
    assert.equal(state.unitsDigest.includes(state.unitSummaryMarkers[0].title), true);
    assert.equal(state.hasUnsavedChanges, code !== "default");
  }
  state.$product.unit_float = true;
  state.discardChanges();
  assert.equal(state.selectedPriceInputMode.code, "default");
  assert.equal(state.$product.unit_float, false);
  assert.deepEqual(plain(state.unitSummaryMarkers.map((marker) => marker.key)), ["input"]);
  assert.match(state.unitsDigest, /price_input_type\.default\.title/);
  assert.doesNotMatch(state.unitsDigest, /digest_fractional/);
  assert.equal(state.hasUnsavedChanges, false);
  assert.equal(requests.length, 0);
});

test("unit summary describes only the active input form and visible fractional setting", () => {
  const { state, requests } = fixture({ product: {
    price_input: "custom", valuation: { id: 17, title: "  Product dimensions  " }, unit_float: true,
  } });
  assert.match(state.unitsDigest, /digest_input_form.*"name":"Product dimensions"/);
  assert.deepEqual(plain(state.unitSummaryMarkers.map((marker) => marker.key)), ["input", "fractional"]);
  state.$product.price_input = "default";
  assert.doesNotMatch(state.unitsDigest, /Product dimensions|digest_input_form/);
  state.$product.price_input = "custom";
  state.$product.valuation.title = "   ";
  assert.match(state.unitsDigest, /price_input_type\.custom\.title/);
  assert.doesNotMatch(state.unitsDigest, /digest_input_form/);
  for (const type of Object.keys(types)) {
    state.$product.type = type;
    assert.equal(state.unitSummaryMarkers.some((marker) => marker.key === "input"), ["PHYSICAL", "VIRTUAL", "SERVICE"].includes(type));
    assert.equal(state.unitSummaryMarkers.some((marker) => marker.key === "fractional"), type === "PHYSICAL");
  }
  assert.equal(requests.length, 0);
});

test("pricing mode fallback respects product types and keeps legacy choice titles", () => {
  for (const type of Object.keys(types)) {
    const { state, requests } = fixture({ type });
    for (const code of ["area", "volume", "custom", "unknown", null, undefined]) {
      state.$product.price_input = code;
      const available = code === "custom" || type === "PHYSICAL" && ["area", "volume"].includes(code);
      assert.equal(state.selectedPriceInputMode.code, available ? code : "default", `${type}: ${code}`);
      assert.equal(state.$product.price_input, code, "Presentation fallback does not rewrite the draft");
    }
    assert.equal(requests.length, 0);
  }
  for (const modern of [false, true]) {
    const { state } = fixture({ modern });
    for (const mode of state.price_input_modes)
      assert.equal(mode.title, `${modern ? "" : "price_input_type.title : "}price_input_type.${mode.code}.title`);
  }
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

test("assigned profile markers follow live IDs and distinguish all four logistic assignments", () => {
  const { state, requests } = fixture({ product: {
    warranty_profile: { id: 1, name: "Stale warranty" }, tax_profile: { id: 7 },
    map: { id: 3, title: "Stale location" }, property_set: { id: 4, title: "Stale set" },
  } });
  assert.deepEqual(plain(state.assignedProfileIcons), [], "Metadata alone does not imply an assignment");
  const expected = [
    ["warranty_id", "ShieldCheck", LogisticProfileType.WARRANTY.title],
    ["return_policy_id", "Undo2", LogisticProfileType.RETURN_POLICY.title],
    ["guide_id", "BookOpen", LogisticProfileType.GUIDE.title],
    ["shipping_id", "Truck", LogisticProfileType.SHIPPING.title],
  ];
  for (const [key] of expected) state.$product[key] = 12;
  assert.deepEqual(plain(state.assignedProfileIcons.map(({ key, icon, title }) => [key, icon, title])), expected);
  for (const [key] of expected) {
    state.$product[key] = null;
    assert.equal(state.assignedProfileIcons.some(item => item.key === key), false);
    state.$product[key] = 24;
    assert.equal(state.assignedProfileIcons.some(item => item.key === key), true);
  }
  assert.equal(requests.length, 0);
});

test("tax summary uses the current string-safe selection and preserves custom or fallback icons", () => {
  const { state } = fixture({ shop: { tax_profiles: [{ id: 7, name: "Current tax", icon: "account_balance" }] },
    product: { tax_id: "7" } });
  const tax = () => state.assignedProfileIcons.find(item => item.key === "tax_id");
  assert.equal(tax().materialIcon, "account_balance");
  assert.equal(tax().title, "global.commons.tax");
  assert.match(state.profilesDigest, /Current tax/);
  state.$product.tax_id = "8";
  assert.equal(tax().icon, "ReceiptText");
  assert.equal(tax().materialIcon, undefined);
  assert.doesNotMatch(state.profilesDigest, /Current tax/);
  state.$product.tax_id = null;
  assert.equal(tax(), undefined, "A previously loaded tax profile cannot leave a stale assigned marker");
});

test("location, included items and property-set markers respect current assignments and product types", () => {
  for (const type of Object.keys(types)) {
    const { state, requests } = fixture({ type, product: { map_id: 3, includes: [{ id: 5 }], property_set_id: 4 } });
    const markers = Object.fromEntries(state.assignedProfileIcons.map(item => [item.key, item]));
    assert.equal(markers.map_id.icon, "MapPin");
    assert.equal(markers.map_id.title, "product_location_profile.title");
    assert.equal(markers.includes.icon, "PackageOpen");
    assert.equal(markers.includes.title, "global.commons.included_in_the_product");
    assert.equal(!!markers.property_set_id, ["PHYSICAL", "VIRTUAL"].includes(type), type);
    if (markers.property_set_id) assert.equal(markers.property_set_id.icon, "Layers");
    Object.assign(state.$product, { map_id: null, includes: [], property_set_id: null });
    assert.deepEqual(plain(state.assignedProfileIcons), []);
    assert.equal(requests.length, 0);
  }
});

test("included tooltip keeps actual item images, a full count and a bounded live preview", () => {
  const includes = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, title: `Item ${i + 1}`, image: i ? `item-${i}.png` : null }));
  const original = plain(includes);
  const { state, requests } = fixture({ product: { includes } });
  const marker = () => state.assignedProfileIcons.find(item => item.key === "includes");
  assert.equal(marker().count, 10);
  assert.equal(state.includedPreviewItems.length, 8);
  assert.equal(state.includedPreviewItems[0].image, null, "An item with no image still has a fallback identity");
  assert.equal(state.includedPreviewItems[1].image, "item-1.png");
  assert.deepEqual(plain(includes), original, "The tooltip does not modify or reorder the assigned items");
  state.$product.includes = [{ id: 25, title: "New item", image: "new.png" }];
  assert.equal(marker().count, 1);
  assert.deepEqual(plain(state.includedPreviewItems), [{ id: 25, title: "New item", image: "new.png" }]);
  state.$product.includes = null;
  assert.equal(marker(), undefined);
  assert.deepEqual(plain(state.includedPreviewItems), []);
  assert.equal(requests.length, 0);
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
