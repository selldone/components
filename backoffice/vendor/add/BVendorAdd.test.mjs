import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";

const filename = new URL("./BVendorAdd.vue", import.meta.url).pathname;
const { descriptor, errors } = parse(readFileSync(new URL("./BVendorAdd.vue", import.meta.url), "utf8"), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "vendor-editor-test" });
const template = compileTemplate({ source: descriptor.template.content, filename, id: "vendor-editor-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({ source: style.content, filename, id: "data-v-vendor-editor-test", scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(result.errors, []);
}
const transpile = source => {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
  assert.deepEqual(result.diagnostics, []);
  return result.outputText;
};
const plain = value => JSON.parse(JSON.stringify(value));
const record = () => ({
  id: 17, shop_id: 7, name: "Fixture vendor", description: "Public description", enable: true, access: true,
  email: "contact@example.test", invite: null, user_id: 9, user: { id: 9, name: "Fixture owner", email: "owner@example.test" },
  address: "Fixture address", web: "https://example.test", tel: "12345", country: "DK", state: "Fixture state",
  business: true, business_name: "Fixture company", tax_id: "Fixture tax", bank: "Fixture bank",
  bank_info: { account_name: "Fixture account", account_number: "123", routing_number: "456", iban: "Fixture IBAN", swift: "Fixture SWIFT", branch_address: "Fixture branch" },
  page: { id: 23, title: "Fixture page", visits: 12 }, slug: "fixture-vendor", map_id: null, map: null, pricing_id: 6,
  augment: [{ key: "headline", value: "Fixture headline", type: "text" }], static: { shipping_services: 3, shipping_couriers: 2 },
  warehouse: { title: "Fixture pickup", location: { lat: 55.6, lng: 12.5 } },
});
const payload = state => ({
  invite: state.invite_email, enable: state.enable, access: state.access, name: state.name, description: state.description,
  email: state.email, address: state.address, web: state.web, tel: state.tel, bank: state.bank, bank_info: state.bank_info,
  user_id: state.user_id, page_id: state.page?.id, slug: state.slug, map_id: state.map_id, pricing_id: state.pricing_id,
  country: state.country, state: state.state, business: state.business, business_name: state.business_name, tax_id: state.tax_id, augment: state.augment,
});

function fixture({ vendor = record(), vendorPanel = false, routeVendor = vendorPanel ? 17 : null, resourceSlots = {} } = {}) {
  const requests = [], sdkRequests = [], events = [], notices = [], confirmations = [], calls = [];
  const leaf = name => Vue.defineComponent({
    name, inheritAttrs: false,
    setup: (_, { attrs, slots }) => {
      const section = Vue.inject("vendor-editor-test-section", null);
      if (name === "v-window-item") Vue.provide("vendor-editor-test-section", attrs.value);
      return () => {
        calls.push({ name, attrs: { ...attrs }, section });
        if (name === "v-dialog" && !attrs.modelValue) return null;
        const children = [slots.default?.(), slots["append-inner"]?.(), slots.activator?.({ props: {} }), slots.email?.()];
        return Vue.h(name === "v-btn" ? (attrs.href ? "a" : "button") : name === "v-form" ? "form" : "div", {
          class: attrs.class, id: attrs.id, href: attrs.href, type: attrs.type, disabled: attrs.disabled,
          target: attrs.target, rel: attrs.rel, "aria-label": attrs["aria-label"],
        }, children);
      };
    },
  });
  const request = (method, url, data) => new Promise((resolve, reject) => requests.push({ method, url, data, resolve: data => resolve({ data }), reject }));
  const api = {
    POST_SHOP_ADD_VENDOR: shop => `/fixture/shops/${shop}/vendors`,
    PUT_SHOP_EDIT_VENDOR: (shop, id) => `/fixture/shops/${shop}/vendors/${id}`,
    DELETE_SHOP_EDIT_VENDOR: (shop, id) => `/fixture/shops/${shop}/vendors/${id}`,
    POST_UPLOAD_VENDOR_ICON: (shop, id) => `/fixture/shops/${shop}/vendors/${id}/icon`,
    POST_SHOP_VENDOR_SEND_INVITE_EMAIL: (shop, id) => `/fixture/shops/${shop}/vendors/${id}/invite`,
  };
  const vapi = {
    PUT_ADD_VENDOR_UPDATE_MY_VENDOR_PROFILE: id => `/fixture/my-vendors/${id}/profile`,
    POST_MY_VENDOR_UPLOAD_VENDOR_ICON: id => `/fixture/my-vendors/${id}/icon`,
  };
  const sdk = scope => ({ page: { getPageAugment: (...args) => new Promise((resolve, reject) => sdkRequests.push({ scope, args, resolve, reject })) } });
  const window = { API: api, VAPI: vapi, $backoffice: sdk("admin"), $vendor: sdk("vendor") };
  const notification = {
    showSuccessAlert: (...args) => notices.push(["success", ...args]),
    showErrorAlert: (...args) => notices.push(["application", ...args]),
    showLaravelError: (...args) => notices.push(["network", ...args]),
    openDangerAlert: (...args) => confirmations.push(args),
  };
  const helpers = {
    getShopImagePath: (path, size) => `/fixture/images/${path || "empty"}/${size || "original"}`,
    getUserAvatar: id => `/fixture/users/${id}/avatar`, numeralFormat: value => String(value ?? 0),
    getLocalTimeString: value => String(value), getFromNowString: value => String(value),
  };
  const urls = {
    MainShopUrl: () => "https://marketplace.example.test",
    GetVendorListingPageUrl: (_, value) => value ? `https://marketplace.example.test/vendors/${value.id}` : null,
    GetVendorLandingPageUrl: (_, value) => `https://marketplace.example.test/pages/${value.page?.id}/${value.slug}`,
  };
  const exports = {};
  vm.runInNewContext(transpile(script.content), {
    exports, window, axios: Object.fromEntries(["post", "put", "delete"].map(method => [method, (url, data) => request(method, url, data)])),
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("NotificationService")) return { default: notification };
      if (name.includes("SetupService")) return { SetupService: { DefaultCountry: () => "DK" } };
      if (name.includes("MapHelper")) return { MapHelper: { GetMapImage: () => "/fixture/map", GenerateFullAddressFromMapInfo: value => value.address } };
      if (name.includes("slugify")) return { Slugify: { apply: value => value.toLowerCase().replaceAll(" ", "-") } };
      if (name.includes("DateMixin")) return { default: { methods: helpers } };
      if (name === "@selldone/core-js") return { ShopURLs: urls };
      assert.ok(name.endsWith(".vue"), `Unexpected dependency: ${name}`);
      return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    },
  });
  const component = exports.default;
  const shop = { id: 7, title: "Fixture marketplace", icon: "shop.svg", marketplace: { shipping: true, documents: [{ type: "License", title: "Fixture requirement" }] } };
  const route = { params: { vendor_id: routeVendor }, matched: [{ meta: vendorPanel ? { vendor: true } : {} }] };
  const state = {
    ...component.data(), shop, vendor, dialogMode: true, $route: route, $: { uid: 7 }, $slots: resourceSlots,
    $refs: { form: { validate: async () => ({ valid: true, errors: [] }) } },
    $t: key => key, $emit: (...args) => events.push(args),
    resetToDefault() { Object.assign(this, component.data()); },
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state) });
  component.created.call(state);
  let renderedState;
  async function render() {
    calls.length = 0;
    const rendered = {};
    vm.runInNewContext(transpile(template.code), { exports: rendered, require: () => Vue });
    const data = Object.fromEntries(Object.keys(component.data()).map(key => [key, state[key]]));
    const renderedComponent = { ...component, render: rendered.render, watch: {}, created() { renderedState = this; }, data: () => ({ ...data }) };
    const app = Vue.createSSRApp({ render: () => Vue.h(renderedComponent, { shop: state.shop, vendor: state.vendor, dialogMode: state.dialogMode }, resourceSlots) });
    Object.assign(app.config.globalProperties, helpers, { $t: key => key, $route: state.$route, window, GlobalRules: { required: () => value => !!value, email: () => () => true } });
    for (const name of ["v-card", "v-card-title", "v-card-text", "v-card-actions", "v-avatar", "v-img", "v-icon", "v-btn", "v-tooltip", "v-form", "v-window", "v-window-item", "v-btn-toggle", "v-text-field", "v-textarea", "v-dialog", "flag", "i18n-t"]) app.component(name, leaf(name));
    app.directive("copy", {});
    return renderToString(app);
  }
  return { state, component, requests, sdkRequests, events, notices, confirmations, calls, render, get renderedState() { return renderedState; } };
}
const complete = async (request, data) => { request.resolve(data); await setImmediate(); };

test("section identities remain stable as optional documents, page fields and shipping appear or disappear", () => {
  const { state, component } = fixture();
  assert.deepEqual(plain(state.sections.map(section => section.value)), ["profile", "contact", "business", "payout", "documents", "page", "shipping", "access", "critical"]);
  state.tab = "shipping";
  state.augment = [];
  state.shop.marketplace.documents = [];
  component.watch.sections.call(state);
  assert.equal(state.tab, "shipping");
  assert.deepEqual(plain(state.sections.map(section => section.value)), ["profile", "contact", "business", "payout", "shipping", "access", "critical"]);
  state.shop.marketplace.shipping = false;
  component.watch.sections.call(state);
  assert.equal(state.tab, "profile");
  const panel = fixture({ vendorPanel: true }).state;
  assert.deepEqual(plain(panel.sections.map(section => section.value)), ["profile", "contact", "business", "payout", "documents", "page", "shipping"]);
  assert.equal(fixture({ routeVendor: 17 }).state.IS_VENDOR_PANEL, false);
});

test("related resources follow profile navigation only for an existing admin vendor and supplied slots", async () => {
  const resourceSlots = { products: () => Vue.h("section", "Fixture products") };
  const current = fixture({ resourceSlots });
  assert.deepEqual(plain(current.state.resource_sections.map(section => section.value)), ["products"]);
  let html = await current.render();
  assert.ok(html.indexOf("vendor_add.menu.critical_zone") < html.indexOf("vendor_add.editor.related_resources"));
  assert.match(html, /vendor_add\.editor\.products/);
  assert.doesNotMatch(html, /Fixture products/);
  for (const options of [{ vendor: null }, { vendorPanel: true }, { resourceSlots: {} }]) {
    const hidden = fixture({ resourceSlots, ...options });
    assert.deepEqual(plain(hidden.state.resource_sections), []);
    html = await hidden.render();
    assert.doesNotMatch(html, /vendor_add\.editor\.related_resources|Fixture products/);
  }
});

test("opening a below-fold resource announces its heading without losing the vendor draft", () => {
  const { state, requests } = fixture({ resourceSlots: { orders: () => null } });
  const actions = [];
  state.name = "Unsaved vendor draft";
  state.$nextTick = callback => callback();
  state.$refs.heading = {
    focus: options => actions.push(["focus", plain(options)]),
    scrollIntoView: options => actions.push(["scroll", plain(options)]),
  };
  state.openResource("orders");
  assert.equal(state.tab, "orders");
  assert.equal(state.name, "Unsaved vendor draft");
  assert.deepEqual(actions, [["focus", { preventScroll: true }], ["scroll", { block: "start", behavior: "instant" }]]);
  assert.deepEqual(requests, []);
});

test("resource selection mounts only the selected vendor-bound list outside the form and retains profile drafts", async () => {
  const mounted = [];
  const resourceSlots = Object.fromEntries(["products", "orders", "wallets", "payments"].map(name => [name, ({ vendor }) => {
    mounted.push({ name, vendor });
    return Vue.h("section", { "data-fixture-resource": name }, `Fixture ${name}`);
  }]));
  const { state, component, render, calls, requests } = fixture({ resourceSlots });
  const originalSections = plain(state.sections.map(section => section.value));
  state.name = "Unsaved name";
  state.email = "unsaved@example.test";
  Object.assign(state, { critical_open: true, accept_delete: true });
  for (const name of ["products", "orders", "wallets", "payments"]) {
    mounted.length = 0;
    state.tab = name;
    component.watch.tab.call(state);
    assert.equal(state.critical_open, false);
    assert.equal(state.accept_delete, false);
    assert.equal(state.active_resource.value, name);
    assert.equal(state.active_section.value, name);
    const html = await render();
    assert.deepEqual(mounted.map(value => value.name), [name]);
    assert.equal(mounted[0].vendor.id, state.vendor.id);
    assert.ok(html.indexOf(`data-fixture-resource="${name}"`) > html.indexOf("</form>"));
    assert.doesNotMatch(html, /global\.actions\.save_changes|vendor_add\.editor\.save_scope/);
    assert.ok(calls.some(call => call.name === "v-text-field" && call.attrs.modelValue === "Unsaved name"));
    assert.equal(state.name, "Unsaved name");
    assert.equal(state.email, "unsaved@example.test");
    assert.deepEqual(plain(state.sections.map(section => section.value)), originalSections);
    assert.equal(requests.length, 0);
  }
  state.tab = "profile";
  assert.equal(state.active_resource, undefined);
  assert.match(await render(), /global\.actions\.save_changes/);
});

test("create mode safely explains shipping and logo availability without mounting existing-vendor children", async () => {
  const { state, render, calls } = fixture({ vendor: null });
  state.tab = "shipping";
  const html = await render();
  assert.match(html, /vendor_add\.editor\.warehouse_create_first/);
  assert.match(html, /vendor_add\.editor\.logo_after_create/);
  for (const name of ["BInventoryWarehouse", "BVendorDocumentsList", "SImageUploader", "BTranslationButtonVendor", "USmartVerify"]) assert.equal(calls.some(call => call.name === name), false, name);
  assert.deepEqual(plain(state.sections.map(section => section.value)), ["profile", "contact", "business", "payout", "shipping"]);
  assert.equal(state.country, "DK");
  assert.equal(state.enable, true);
  assert.equal(state.access, true);
});

test("existing admin rendering keeps canonical uploader, translations, page, documents, warehouse and editable native fields", async () => {
  const current = fixture();
  const { state, render, calls } = current;
  await render();
  assert.deepEqual(calls.filter(call => call.name === "v-window-item").map(call => call.attrs.value), plain(state.sections.map(section => section.value)));
  const uploader = calls.find(call => call.name === "SImageUploader").attrs;
  assert.equal(uploader.server, "/fixture/shops/7/vendors/17/icon");
  assert.equal(uploader.maxFileSize, "2MB");
  assert.ok(Object.hasOwn(uploader, "auto-compact"));
  uploader.onNewPath("fixture-icon.svg");
  assert.equal(state.vendor.icon, "fixture-icon.svg");
  const translations = calls.filter(call => call.name === "BTranslationButtonVendor");
  assert.deepEqual(translations.map(call => call.attrs["translation-key"]), ["name", "description"]);
  for (const child of translations) { assert.equal(child.attrs.vendor, state.vendor); assert.equal(child.attrs.shop, state.shop); }
  const page = calls.find(call => call.name === "BPageInput").attrs;
  assert.equal(page.shop, state.shop);
  assert.ok(Object.hasOwn(page, "clearable"));
  assert.equal(page.publishedOnly, undefined);
  const docs = calls.find(call => call.name === "BVendorDocumentsList").attrs;
  const warehouse = calls.find(call => call.name === "BInventoryWarehouse").attrs;
  for (const child of [docs, warehouse]) { assert.equal(child.vendor, state.vendor); assert.equal(child.shop, state.shop); }
  const updatedWarehouse = { title: "Saved pickup", location: { lat: 1, lng: 2 } };
  warehouse["onUpdate:warehouse"](updatedWarehouse);
  assert.equal(state.vendor.warehouse, updatedWarehouse);
  const inputLabels = calls.filter(call => ["v-text-field", "v-textarea"].includes(call.name)).map(call => call.attrs.label);
  for (const label of ["global.commons.name", "global.commons.description", "global.commons.email", "global.address_info.state", "global.commons.address", "global.commons.website", "global.commons.tel", "global.commons.business_name", "global.commons.tax_id", "global.commons.bank_name", "global.commons.bank_account_name", "global.commons.bank_account_number", "global.commons.bank_routing_number", "IBAN", "SWIFT / BIC", "global.commons.bank_branch_address"]) assert.ok(inputLabels.includes(label), label);
  assert.equal(calls.find(call => call.name === "SCountrySelect").attrs["item-value"], "alpha2");
  assert.ok(calls.some(call => call.name === "VPricingInput" && call.attrs.shop === state.shop));
  assert.ok(calls.some(call => call.name === "USmartSwitch" && call.attrs.label === "vendor_add.inputs.enable.label"));
  assert.ok(calls.some(call => call.name === "USmartSwitch" && call.attrs.label === "vendor_add.inputs.access.label" && !call.attrs.disabled));
  const listing = calls.find(call => call.name === "v-btn" && call.attrs.href === state.vendor_listing_page_url).attrs;
  assert.equal(listing.target, "_blank");
  assert.equal(listing.rel, "noopener noreferrer");
  const editOwner = calls.find(call => call.name === "v-btn" && call.attrs["aria-label"] === "global.actions.edit");
  editOwner.attrs.onClick();
  assert.equal(current.renderedState.user_edit, true);
  state.vendor.enable = false;
  await render();
  assert.equal(calls.find(call => call.name === "v-btn" && call.attrs.href === state.vendor_listing_page_url).attrs.disabled, true);
  assert.equal(calls.find(call => call.name === "v-btn" && call.attrs.href === state.vendor_landing_page_url).attrs.disabled, true);
});

test("vendor public Listing link follows section tabs while the marketplace editor keeps its header action", async () => {
  for (const external of [false, true]) {
    const current = fixture({ vendorPanel: true });
    current.state.$route.matched[0].meta.external = external;
    for (const enable of [true, false]) {
      current.state.vendor.enable = enable;
      const dom = new JSDOM(await current.render());
      const document = dom.window.document;
      const links = [...document.querySelectorAll("a")].filter(link => link.getAttribute("href") === current.state.vendor_listing_page_url);
      assert.equal(links.length, 1);
      assert.equal(links[0].closest(".b-vendor-editor__top"), null);
      const group = links[0].closest(".b-vendor-editor__public-page");
      assert.ok(group?.parentElement.matches(".b-vendor-editor__nav"));
      assert.ok(group.previousElementSibling?.matches(".sd-modern-section-nav__item"));
      assert.equal(links[0].getAttribute("target"), "_blank");
      assert.equal(links[0].getAttribute("rel"), "noopener noreferrer");
      const action = current.calls.find(call => call.name === "v-btn" && call.attrs.href === current.state.vendor_listing_page_url);
      assert.equal(action.attrs.disabled, !enable);
      assert.equal(action.attrs["append-icon"], "north_east");
      dom.window.close();
    }
  }
  const admin = fixture({ routeVendor: 17 });
  const dom = new JSDOM(await admin.render());
  const link = [...dom.window.document.querySelectorAll("a")].find(link => link.getAttribute("href") === admin.state.vendor_listing_page_url);
  assert.ok(link.closest(".b-vendor-editor__top-actions"));
  assert.equal(dom.window.document.querySelector(".b-vendor-editor__public-page"), null);
  dom.window.close();
});

test("vendor-panel rendering retains native profile integration while hiding admin-only controls", async () => {
  const { state, render, calls } = fixture({ vendorPanel: true });
  state.map_dialog = true;
  await render();
  assert.equal(calls.find(call => call.name === "SImageUploader").attrs.server, "/fixture/my-vendors/17/icon");
  for (const name of ["SUserInput", "BPageInput", "BMapTagInput", "USmartVerify"]) assert.equal(calls.some(call => call.name === name), false, name);
  assert.equal(calls.some(call => call.name === "USmartSwitch" && ["vendor_add.inputs.enable.label", "vendor_add.inputs.access.label"].includes(call.attrs.label)), false);
  assert.equal(calls.filter(call => call.name === "BTranslationButtonVendor").length, 2);
  assert.ok(calls.some(call => call.name === "BVendorDocumentsList"));
  assert.ok(calls.some(call => call.name === "BInventoryWarehouse"));
  assert.equal(state.can_manage_vendor, false);
  await state.addVendor();
  assert.equal(calls.some(call => call.name === "BPageInput"), false);
});

test("contact and payout are directly reachable sections with their complete native fields and no nested tab controls", async () => {
  const { state, render, calls } = fixture();
  for (const tab of ["contact", "payout"]) {
    state.tab = tab;
    await render();
    assert.equal(state.active_section.value, tab);
    assert.equal(calls.find(call => call.name === "v-window").attrs.modelValue, tab);
    assert.ok(calls.some(call => call.name === "v-window-item" && call.attrs.value === tab));
    assert.equal(calls.some(call => call.name === "v-btn-toggle"), false);
    const fields = calls.filter(call => call.section === tab && call.name === "v-text-field").map(call => call.attrs.label);
    const expected = tab === "contact"
      ? ["global.commons.email", "global.address_info.state", "global.commons.address", "global.commons.website", "global.commons.tel"]
      : ["global.commons.bank_name", "global.commons.bank_account_name", "global.commons.bank_account_number", "global.commons.bank_routing_number", "IBAN", "SWIFT / BIC", "global.commons.bank_branch_address"];
    assert.deepEqual(fields, expected);
  }
  assert.ok(calls.some(call => call.section === "contact" && call.name === "SCountrySelect"));
  assert.ok(calls.some(call => call.section === "contact" && call.name === "UPodsPanel"));
  assert.ok(calls.some(call => call.section === "business" && call.name === "VPricingInput"));
});

test("asynchronous form errors block requests and reveal the relevant profile or contact section", async () => {
  for (const field of ["name", "email"]) {
    const { state, requests } = fixture();
    state.tab = "business";
    let resolveValidation;
    state.$refs.form.validate = () => new Promise(resolve => { resolveValidation = resolve; });
    const pending = state.updateVendor();
    assert.equal(requests.length, 0);
    resolveValidation({ valid: false, errors: [{ id: state.field_ids[field] }] });
    await pending;
    assert.equal(requests.length, 0);
    assert.equal(state.busy, false);
    assert.equal(state.tab, field === "name" ? "profile" : "contact");
  }
  const add = fixture({ vendor: null });
  add.state.$refs.form.validate = async () => ({ valid: false, errors: [{ id: add.state.field_ids.name }] });
  await add.state.addVendor();
  assert.equal(add.requests.length, 0);
});

test("creation preserves the complete native payload, permits no default plan and emits add then close", async () => {
  const { state, requests, events } = fixture({ vendor: null });
  Object.assign(state, { name: "New fixture", description: "Draft", invite_email: "invite@example.test", email: "contact@example.test", bank_info: { iban: "Fixture IBAN" }, business: true, business_name: "Fixture company", tax_id: "Fixture tax", page: { id: 23 }, slug: "new-fixture", augment: [{ key: "headline", type: "text", value: "Draft" }], map_id: 4 });
  const expected = plain(payload(state));
  await state.addVendor();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "post");
  assert.equal(requests[0].url, "/fixture/shops/7/vendors");
  assert.deepEqual(plain(requests[0].data), expected);
  assert.equal(requests[0].data.pricing_id, null);
  await state.addVendor();
  assert.equal(requests.length, 1);
  const saved = { ...record(), name: "New fixture" };
  await complete(requests[0], { vendor: saved });
  assert.deepEqual(events, [["add", saved], ["close"]]);
  assert.equal(state.busy, false);
  assert.equal(state.name, null);
});

test("admin and vendor-profile updates preserve payload, correct endpoint, passed-object identity and events", async () => {
  for (const options of [{}, { vendorPanel: true }, { routeVendor: 17 }]) {
    const { state, requests, events } = fixture(options);
    const original = state.vendor;
    state.name = "Changed fixture";
    state.enable = false;
    state.access = false;
    const expected = plain(payload(state));
    await state.updateVendor();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].method, "put");
    assert.equal(requests[0].url, options.vendorPanel ? "/fixture/my-vendors/17/profile" : "/fixture/shops/7/vendors/17");
    assert.deepEqual(plain(requests[0].data), expected);
    await state.updateVendor();
    assert.equal(requests.length, 1);
    const saved = { id: 17, name: "Saved fixture" };
    await complete(requests[0], { vendor: saved });
    assert.equal(state.vendor, original);
    assert.equal(original.name, "Saved fixture");
    assert.deepEqual(events, [["update", saved], ["close"]]);
    assert.equal(state.busy, false);
  }
  const panel = fixture({ vendor: null, vendorPanel: true });
  await panel.state.addVendor();
  assert.equal(panel.requests.length, 0);
  assert.equal(panel.notices[0][0], "application");
});

test("application and network save errors preserve drafts and allow retry without success events", async () => {
  for (const network of [false, true]) {
    const { state, requests, notices, events } = fixture();
    state.name = "Unsaved fixture";
    await state.updateVendor();
    if (network) { requests[0].reject(new Error("Fixture failure")); await setImmediate(); }
    else await complete(requests[0], { error: true, error_msg: "Fixture validation failure" });
    assert.equal(state.name, "Unsaved fixture");
    assert.equal(state.vendor.name, "Fixture vendor");
    assert.equal(state.busy, false);
    assert.deepEqual(events, []);
    assert.equal(notices[0][0], network ? "network" : "application");
    await state.updateVendor();
    assert.equal(requests.length, 2);
    await complete(requests[1], { vendor: { id: 17, name: "Unsaved fixture" } });
  }
});

test("owner lookup and invitation controls distinguish a draft invitation from the stored resend action", async () => {
  const draft = fixture({ vendor: null });
  await draft.render();
  const lookup = draft.calls.find(call => call.name === "SUserInput").attrs;
  assert.ok(Object.hasOwn(lookup, "can-invite"));
  lookup["onUpdate:modelValue"]("invite@example.test");
  assert.equal(draft.renderedState.invite_email, "invite@example.test");
  assert.equal(draft.renderedState.email, "invite@example.test");
  draft.renderedState.email = "preserved@example.test";
  lookup["onUpdate:modelValue"]("other@example.test");
  assert.equal(draft.renderedState.email, "preserved@example.test");
  draft.state.invite_email = draft.renderedState.invite_email;
  let html = await draft.render();
  assert.match(html, /vendor_add\.editor\.invitation_draft/);
  assert.equal(draft.calls.some(call => call.name === "v-btn" && call.attrs["append-icon"] === "send"), false);
  const invited = record();
  Object.assign(invited, { user_id: null, user: null, invite: "stored@example.test" });
  const existing = fixture({ vendor: invited });
  html = await existing.render();
  assert.match(html, /vendor_add\.editor\.invitation_pending/);
  existing.calls.find(call => call.name === "v-btn" && call.attrs["append-icon"] === "send").attrs.onClick();
  assert.equal(existing.requests[0].url, "/fixture/shops/7/vendors/17/invite");
  assert.equal(existing.requests[0].method, "post");
  await complete(existing.requests[0], { success: true });
  assert.deepEqual(existing.events, []);
});

test("page schema loading preserves admin/vendor adapters and clearing the page removes custom fields", async () => {
  for (const vendorPanel of [false, true]) {
    const { state, sdkRequests } = fixture({ vendorPanel });
    const original = state.vendor.augment;
    state.loadArgumentStructure(23);
    assert.equal(sdkRequests.length, 1);
    assert.equal(sdkRequests[0].scope, vendorPanel ? "vendor" : "admin");
    assert.deepEqual(plain(sdkRequests[0].args), [vendorPanel ? 17 : 7, 23, original]);
    const fields = [{ key: "headline", type: "text", value: "Returned field" }];
    sdkRequests[0].resolve({ augment: fields });
    await setImmediate();
    assert.equal(state.augment, fields);
    assert.equal(state.busy_load, false);
    state.loadArgumentStructure(null);
    assert.deepEqual(plain(state.augment), []);
    assert.equal(sdkRequests.length, 1);
  }
});

test("removal checks admin context, current section, open disclosure, verification and busy state before confirmation or DELETE", () => {
  const cases = [
    { vendor: null }, { vendorPanel: true },
    { values: { tab: "profile" } }, { values: { critical_open: false } }, { values: { accept_delete: false } },
    { values: { busy: true } }, { values: { busy_delete: true } },
  ];
  for (const { values, ...options } of cases) {
    const { state, requests, confirmations } = fixture(options);
    Object.assign(state, { tab: "critical", critical_open: true, accept_delete: true }, values);
    state.showRemove();
    state.remove();
    assert.equal(confirmations.length, 0);
    assert.equal(requests.length, 0);
  }
  for (const invalidate of [state => { state.vendor = { ...record(), id: 18 }; }, state => { state.tab = "profile"; }, state => { state.critical_open = false; }, state => { state.accept_delete = false; }, state => { state.$route.matched = [{ meta: { vendor: true } }]; state.$route.params.vendor_id = 17; }]) {
    const { state, requests, confirmations } = fixture();
    Object.assign(state, { tab: "critical", critical_open: true, accept_delete: true });
    state.showRemove();
    assert.equal(confirmations.length, 1);
    assert.equal(requests.length, 0);
    invalidate(state);
    confirmations[0][3]();
    assert.equal(requests.length, 0);
  }
});

test("critical intent resets when hidden, and confirmed removal retains the native request and events", async () => {
  const { state, component, requests, confirmations, events } = fixture();
  Object.assign(state, { tab: "critical", critical_open: true, accept_delete: true });
  state.onCriticalToggle({ target: { open: false } });
  assert.equal(state.accept_delete, false);
  state.accept_delete = true;
  state.onCriticalToggle({ target: { open: true } });
  component.watch.tab.call(state);
  assert.equal(state.critical_open, false);
  assert.equal(state.accept_delete, false);
  Object.assign(state, { tab: "critical", critical_open: true, accept_delete: true });
  state.showRemove();
  confirmations[0][3]();
  state.remove();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "delete");
  assert.equal(requests[0].url, "/fixture/shops/7/vendors/17");
  await complete(requests[0], { id: 17 });
  assert.deepEqual(events, [["remove", 17], ["close"]]);
  assert.equal(state.busy_delete, false);
});
