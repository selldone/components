import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as VueRuntime from "vue";
import { createRenderer, effectScope, nextTick, reactive, watch } from "vue";
import { renderToString } from "@vue/server-renderer";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";

const filename = new URL("./BShopListingItemUpsert.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
  filename: filename.pathname,
});
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "listing-item-editor-check" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "listing-item-editor-check",
  compilerOptions: { bindingMetadata: compiled.bindings },
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles)
  assert.deepEqual(
    (
      await compileStyleAsync({
        source: style.content,
        filename: filename.pathname,
        id: "listing-item-editor-check",
        scoped: style.scoped,
        preprocessLang: style.lang,
      })
    ).errors,
    [],
  );
const script = ts.transpileModule(descriptor.script.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  reportDiagnostics: true,
});
assert.deepEqual(script.diagnostics, []);
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture(
  t,
  { item = null, modern = false, vendor = false, shop } = {},
) {
  const requests = [],
    notices = [],
    emitted = [],
    exports = {};
  const endpoints = {
    POST_SHOP_LISTING_ITEM_ADD: (id) => `/shops/${id}/listing/items`,
    POST_SHOP_LISTING_ITEM_EDIT: (id, itemId) =>
      `/shops/${id}/listing/items/${itemId}`,
  };
  const vendorEndpoints = {
    POST_MY_VENDOR_LISTING_ITEM_ADD: (id) => `/vendors/${id}/listing/items`,
    POST_MY_VENDOR_LISTING_ITEM_EDIT: (id, itemId) =>
      `/vendors/${id}/listing/items/${itemId}`,
  };
  vm.runInNewContext(script.outputText, {
    exports,
    require(name) {
      if (name.endsWith(".vue") || name.includes("CurrencyMixin"))
        return { default: {} };
      if (name.includes("NotificationService"))
        return {
          default: {
            showErrorAlert: (...args) => notices.push(["error", ...args]),
            showLaravelError: (error) => notices.push(["error", error.message]),
            showSuccessAlert: (...args) => notices.push(["success", ...args]),
          },
        };
      throw new Error(name);
    },
    axios: {
      post: (url, payload) =>
        new Promise((resolve, reject) =>
          requests.push({ url, payload, resolve, reject }),
        ),
    },
    window: { API: endpoints, VAPI: vendorEndpoints },
  });
  const component = exports.default;
  const state = reactive({
    ...component.data(),
    item,
    modern,
    hasClose: true,
    $shop:
      shop === undefined
        ? { id: 7, currency: "USD", listing: { default_currency: "EUR" } }
        : shop,
    $route: vendor
      ? { params: { vendor_id: "12" }, matched: [{ meta: { vendor: true } }] }
      : { params: {}, matched: [] },
    $refs: { form: { validate: async () => ({ valid: true }) } },
    $t: (key) => key,
    $emit: (...args) => emitted.push(args),
    GetCurrency: (code) => ({ code }),
  });
  for (const [name, fn] of Object.entries(component.methods))
    state[name] = fn.bind(state);
  for (const [name, fn] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => fn.call(state) });
  const scope = effectScope();
  scope.run(() => {
    watch(() => state.item, component.watch.item.handler.bind(state), {
      immediate: true,
    });
    watch(
      () => state.form.category,
      component.watch["form.category"].handler.bind(state),
    );
  });
  t.after(() => scope.stop());
  function validItem() {
    state.form.title = "  Example item  ";
    state.form.category = { id: 4, title: "Services" };
  }
  function succeed(
    record = { id: 81, slug: "example-item", status: "pending" },
  ) {
    assert.ok(requests.length, "a save request must exist");
    requests.at(-1).resolve({ data: { item: record } });
    return record;
  }
  return { state, requests, notices, emitted, component, validItem, succeed };
}

async function renderedEditor(t, { modern, tab = "general", item = null }) {
  const { component } = fixture(t, { modern, item });
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(template.code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      require: (name) => {
        assert.equal(name, "vue");
        return VueRuntime;
      },
    },
  );
  const slotStub = (tag = "div") => ({
    render() {
      return VueRuntime.h(tag, null, this.$slots.default?.());
    },
  });
  const app = VueRuntime.createSSRApp(
    {
      ...component,
      components: Object.fromEntries(
        Object.keys(component.components).map((name) => [name, slotStub()]),
      ),
      render: exports.render,
      created() {
        this.tab = tab;
      },
    },
    { modern, hasClose: true, item },
  );
  for (const name of [
    "VCard",
    "VCardTitle",
    "VCardText",
    "VForm",
    "VTabs",
    "VTab",
    "VWindow",
    "VWindowItem",
    "VListSubheader",
    "VIcon",
    "VTooltip",
    "VExpandTransition",
    "VAlert",
    "VSpacer",
    "VChip",
    "UWidgetHeader",
  ])
    app.component(name, slotStub());
  app.component("VBtn", slotStub("button"));
  app.component("VCardActions", slotStub("footer"));
  app.component("VDialog", {
    props: ["modelValue"],
    render() {
      return this.modelValue
        ? VueRuntime.h("div", { role: "dialog" }, this.$slots.default?.())
        : null;
    },
  });
  app.provide("$shop", { id: 7, currency: "USD", listing: null });
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $n: (value) => String(value),
    USER: () => ({ preferences: { dark: false } }),
    $vuetify: { display: { mdAndUp: true }, locale: { isRtl: false } },
    GetCurrency: (code) => ({ code }),
  });
  const html = await renderToString(app);
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
  assert.ok(footer, "the actual editor template renders a footer");
  return {
    html,
    footer,
    buttonCount: [...footer.matchAll(/<button\b/g)].length,
  };
}

test("new items use listing defaults and edited items normalize without losing zero values", async (t) => {
  const f = fixture(t);
  assert.equal(f.state.form.currency, "EUR");
  assert.equal(f.state.form.status, null);
  assert.equal(f.state.effectiveItemId, null);
  assert.equal(f.state.tabs.length, 7);
  assert.equal(f.state.tabs.at(-1).value, "media");

  f.state.item = {
    id: 40,
    title: "Existing",
    category_id: 4,
    company: { id: 3 },
    badges: [{ id: 2 }, { id: "5" }, { id: 0 }, { id: "invalid" }],
    price: 0,
    price_to: 0,
    lat: 0,
    lng: 0,
    links: [
      "  https://example.test/a  ",
      { url: " https://example.test/b " },
      "",
      null,
    ],
    meta: { untouched: { keep: true } },
  };
  await nextTick();
  assert.equal(f.state.isEdit, true);
  assert.equal(f.state.form.company_id, 3);
  assert.deepEqual(plain(f.state.form.badge_ids), [2, 5]);
  assert.deepEqual(plain(f.state.form.links), [
    "https://example.test/a",
    "https://example.test/b",
  ]);
  for (const key of ["price", "price_to", "lat", "lng"])
    assert.equal(f.state.form[key], 0);
  assert.deepEqual(plain(f.state.form.meta_extra), {
    untouched: { keep: true },
  });
});

test("creation preserves the complete existing payload including zero prices and coordinates", async (t) => {
  const f = fixture(t);
  f.validItem();
  Object.assign(f.state.form, {
    slug: "  sample  ",
    company_id: "9",
    badge_ids: [2, 5],
    subtitle: "  Subtitle  ",
    description: "  Description  ",
    status: "published",
    price: 0,
    price_to: 125,
    currency: " USD ",
    price_unit: " hour ",
    country_code: " AE ",
    city: " Dubai ",
    address: " Address ",
    lat: 0,
    lng: 0,
    tel: " +1000 ",
    email: " demo@example.test ",
    website: " https://example.test ",
    is_featured: true,
    links: ["https://example.test/about"],
    opening_hours: [{ day: "mon", open: "09:00", close: "17:00" }],
    meta_extra: { custom: { retain: true } },
  });
  const pending = f.state.save();
  assert.equal(f.requests[0].url, "/shops/7/listing/items");
  assert.deepEqual(plain(f.requests[0].payload), {
    title: "Example item",
    slug: "sample",
    company_id: 9,
    badge_ids: [2, 5],
    subtitle: "Subtitle",
    description: "Description",
    category_id: 4,
    status: "published",
    price: 0,
    price_to: 125,
    currency: "USD",
    price_unit: "hour",
    country_code: "AE",
    city: "Dubai",
    address: "Address",
    lat: 0,
    lng: 0,
    tel: "+1000",
    email: "demo@example.test",
    website: "https://example.test",
    is_featured: "1",
    links: ["https://example.test/about"],
    opening_hours: [{ day: "mon", open: "09:00", close: "17:00" }],
    meta: { custom: { retain: true } },
  });
  f.succeed();
  assert.equal(await pending, true);
});

test("blank optional values retain their null/empty-array contract on edit", async (t) => {
  const f = fixture(t, { item: { id: 31, title: "Existing", category_id: 4 } });
  f.state.form.currency = "";
  for (const key of ["price", "price_to", "lat", "lng"]) f.state.form[key] = "";
  const pending = f.state.save();
  const payload = f.requests[0].payload;
  assert.equal(f.requests[0].url, "/shops/7/listing/items/31");
  for (const key of [
    "slug",
    "subtitle",
    "description",
    "company_id",
    "badge_ids",
    "status",
    "price",
    "price_to",
    "currency",
    "price_unit",
    "country_code",
    "city",
    "address",
    "lat",
    "lng",
    "tel",
    "email",
    "website",
    "links",
    "opening_hours",
  ])
    assert.equal(payload[key], null, key);
  assert.equal(payload.is_featured, "0");
  assert.deepEqual(plain(payload.meta), {});
  f.succeed({ id: 31 });
  assert.equal(await pending, true);
  assert.equal(f.emitted[0][0], "edit");
});

test("vendor create/edit use only the vendor endpoints", async (t) => {
  const f = fixture(t, { vendor: true });
  f.validItem();
  let pending = f.state.save({ silentEmit: true });
  assert.equal(f.requests[0].url, "/vendors/12/listing/items");
  f.succeed();
  await pending;
  pending = f.state.save({ silentEmit: true });
  assert.equal(f.requests[1].url, "/vendors/12/listing/items/81");
  f.succeed();
  await pending;
});

test("Next validates first, autosaves silently, and advances only after successful create/edit", async (t) => {
  const f = fixture(t);
  await f.state.nextTab();
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.tab, "general");
  assert.ok(f.state.form_error);
  f.state.form.title = "Valid title";
  await f.state.nextTab();
  assert.equal(f.requests.length, 0);
  f.validItem();
  let pending = f.state.nextTab();
  assert.equal(f.state.tab, "general");
  assert.equal(f.state.busy_save, true);
  f.succeed();
  await pending;
  assert.equal(f.state.tab, "description");
  assert.equal(f.state.effectiveItemId, 81);
  assert.equal(f.state.form.slug, "example-item");
  pending = f.state.nextTab();
  assert.equal(f.requests[1].url, "/shops/7/listing/items/81");
  f.succeed();
  await pending;
  assert.equal(f.state.tab, "pricing");
  assert.deepEqual(f.emitted, []);
  assert.deepEqual(f.notices, []);
  f.state.prevTab();
  assert.equal(f.state.tab, "description");
  assert.equal(f.requests.length, 2);
});

test("failed Next keeps the current step and reports the quiet error inline", async (t) => {
  const f = fixture(t);
  f.validItem();
  const pending = f.state.nextTab();
  f.requests[0].resolve({ data: { error: true, error_msg: "Not allowed" } });
  await pending;
  assert.equal(f.state.tab, "general");
  assert.equal(f.state.form_error, "Not allowed");
  assert.equal(f.state.busy_save, false);
  assert.deepEqual(f.emitted, []);
  assert.deepEqual(f.notices, []);
});

test("media creation keeps the editor open, establishes an item ID, and switches to Media", async (t) => {
  const f = fixture(t);
  f.validItem();
  const pending = f.state.save({
    goMediaAfterCreate: true,
    silentEmit: true,
    quiet: false,
  });
  f.succeed();
  assert.equal(await pending, true);
  assert.equal(f.state.effectiveItemId, 81);
  assert.equal(f.state.tab, "media");
  assert.deepEqual(f.emitted, []);
  assert.equal(f.notices.filter(([kind]) => kind === "success").length, 1);
});

test("the modern primary action creates for Media without closing, then saves normally", async (t) => {
  const f = fixture(t, { modern: true });
  assert.equal(f.state.needsMediaCreation, false);
  f.state.tab = "media";
  assert.equal(f.state.needsMediaCreation, true);
  f.validItem();
  let pending = f.state.save({
    goMediaAfterCreate: f.state.needsMediaCreation,
    silentEmit: f.state.needsMediaCreation,
    quiet: false,
  });
  const created = f.succeed();
  assert.equal(await pending, true);
  assert.equal(f.state.tab, "media");
  assert.equal(f.state.needsMediaCreation, false);
  assert.deepEqual(plain(f.emitted), [["saved", created]]);

  pending = f.state.save({
    goMediaAfterCreate: f.state.needsMediaCreation,
    silentEmit: f.state.needsMediaCreation,
    quiet: false,
  });
  assert.equal(f.requests[1].url, "/shops/7/listing/items/81");
  const edited = f.succeed({ id: 81, title: "Finished item" });
  assert.equal(await pending, true);
  assert.deepEqual(plain(f.emitted), [
    ["saved", created],
    ["edit", edited],
  ]);
});

test("failed modern Media creation neither announces a saved item nor changes its identity", async (t) => {
  const f = fixture(t, { modern: true });
  f.validItem();
  f.state.tab = "media";
  const pending = f.state.save({ goMediaAfterCreate: true, silentEmit: true });
  f.requests[0].resolve({ data: { error: true, error_msg: "Denied" } });
  assert.equal(await pending, false);
  assert.equal(f.state.needsMediaCreation, true);
  assert.equal(f.state.effectiveItemId, null);
  assert.deepEqual(f.emitted, []);
  assert.equal(f.state.busy_save, false);
});

test("unchanged modern forms close directly; reverted fields and nested values stay clean", async (t) => {
  for (const item of [
    null,
    {
      id: 31,
      title: "Existing",
      category_id: 4,
      links: ["https://example.test"],
      meta: { extra: { nested: "original" } },
    },
  ]) {
    const f = fixture(t, { modern: true, item });
    assert.equal(f.state.hasUnsavedChanges, false);
    const original = plain(f.state.form);
    f.state.form.title = "Changed title";
    assert.equal(f.state.hasUnsavedChanges, true);
    f.state.form.title = original.title;
    assert.equal(f.state.hasUnsavedChanges, false);
    f.state.form.links.push("https://example.test/second");
    assert.equal(f.state.hasUnsavedChanges, true);
    f.state.form.links.pop();
    assert.equal(f.state.hasUnsavedChanges, false);
    if (item) {
      f.state.form.meta_extra.extra.nested = "Changed";
      assert.equal(f.state.hasUnsavedChanges, true);
      f.state.form.meta_extra.extra.nested = "original";
      assert.equal(f.state.hasUnsavedChanges, false);
    }
    f.state.requestClose();
    assert.equal(f.state.discard_dialog, false);
    assert.deepEqual(plain(f.emitted), [["close"]]);
    assert.equal(f.requests.length, 0);
  }
});

test("category resolution, lazy schema defaults and opening-hours normalization do not dirty untouched forms", async (t) => {
  const f = fixture(t, {
    modern: true,
    shop: {
      id: 7,
      listing: {
        form_schema: [
          { name: "defaulted", type: "text", default: "Default value" },
          { name: "enabled", type: "switch" },
          { name: "attributes", type: "key_value" },
        ],
      },
    },
    item: {
      id: 31,
      title: "Existing",
      category_id: 4,
      opening_hours: [{ day: "mon", open: "09:00", close: "18:00" }],
      meta: { extra: { first: 1, second: 2 } },
    },
  });
  f.state.form.category = {
    id: 4,
    title: "Loaded category",
    form_schema: [
      { name: "category_default", type: "text", default: "Category" },
    ],
  };
  await nextTick();
  Object.assign(f.state.form.listing_fields, {
    defaulted: "Default value",
    enabled: false,
    attributes: [{ key: "", value: "" }],
  });
  f.state.form.category_fields.category_default = "Category";
  f.state.form.meta_extra.extra = { second: 2, first: 1 };
  f.state.form.opening_hours = [
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
    "sat",
    "sun",
  ].map((day) => ({
    day,
    closed: day !== "mon",
    open: day === "mon" ? "09:00" : null,
    close: day === "mon" ? "18:00" : null,
  }));
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.form.category_fields.category_default = "Changed";
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.form.category_fields.category_default = "Category";
  f.state.form.opening_hours[0].close = "19:00";
  assert.equal(f.state.hasUnsavedChanges, true);
});

test("dirty close offers confirmation, cancellation preserves the draft and discard closes without saving", (t) => {
  const f = fixture(t, { modern: true });
  f.state.form.title = "Unsaved draft";
  f.state.requestClose();
  assert.equal(f.state.discard_dialog, true);
  assert.deepEqual(f.emitted, []);
  f.state.discard_dialog = false;
  assert.equal(f.state.form.title, "Unsaved draft");
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.deepEqual(f.emitted, []);
  f.state.requestClose();
  f.state.discardChanges();
  assert.equal(f.state.discard_dialog, false);
  assert.deepEqual(plain(f.emitted), [["close"]]);
  assert.equal(f.requests.length, 0);
});

test("busy writes block close/discard, and pending media drafts participate in confirmation", (t) => {
  const f = fixture(t, { modern: true });
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.media_dirty = true;
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.requestClose();
  assert.equal(f.state.discard_dialog, true);
  for (const key of ["busy_save", "media_saving"]) {
    f.state[key] = true;
    assert.equal(f.state.isSaving, true);
    f.state.discardChanges();
    f.state.requestClose();
    assert.deepEqual(f.emitted, []);
    assert.equal(f.state.discard_dialog, true);
    f.state[key] = false;
  }
  f.state.discard_dialog = false;
  f.state.media_dirty = false;
  f.state.requestClose();
  assert.deepEqual(plain(f.emitted), [["close"]]);

  const legacy = fixture(t);
  legacy.state.form.title = "Legacy change";
  legacy.state.requestClose();
  assert.equal(legacy.state.discard_dialog, false);
  assert.deepEqual(plain(legacy.emitted), [["close"]]);
});

test("media reports pending drafts and writes reactively, while legacy callers receive no new events", async (t) => {
  const mediaFilename = new URL(
    "./tabs/BShopListingItemTabMedia.vue",
    import.meta.url,
  );
  const { descriptor } = parse(readFileSync(mediaFilename, "utf8"));
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(descriptor.script.content, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    { exports, require: () => ({ default: {} }) },
  );
  const component = exports.default;
  const emitted = [];
  const state = reactive({
    ...component.data(),
    modern: true,
    $emit: (...args) => emitted.push(args),
  });
  const dirty = () => component.computed.hasUnsavedChanges.call(state);
  const busy = () => component.computed.isSaving.call(state);
  const scope = effectScope();
  scope.run(() => {
    for (const [name, getter] of [
      ["hasUnsavedChanges", dirty],
      ["isSaving", busy],
    ])
      watch(getter, component.watch[name].handler.bind(state), {
        immediate: component.watch[name].immediate,
      });
  });
  t.after(() => scope.stop());
  assert.deepEqual(plain(emitted), [
    ["dirty-change", false],
    ["saving-change", false],
  ]);
  state.media = [{ id: 5, type: "image", alt: "Saved image" }];
  state.media_filter = "image";
  state.busy_fetch = true;
  assert.equal(dirty(), false);
  assert.equal(busy(), false);
  state.upload_files = [{ name: "pending-image.png" }];
  assert.equal(dirty(), true);
  await nextTick();
  assert.deepEqual(plain(emitted.at(-1)), ["dirty-change", true]);
  state.upload_files = [];
  await nextTick();
  assert.deepEqual(plain(emitted.at(-1)), ["dirty-change", false]);
  state.url_form.type = "video";
  assert.equal(dirty(), false);
  for (const [key, value] of [
    ["url", "https://example.test"],
    ["alt", "Draft"],
    ["is_main", true],
  ]) {
    const previous = state.url_form[key];
    state.url_form[key] = value;
    assert.equal(dirty(), true);
    state.url_form[key] = previous;
    assert.equal(dirty(), false);
  }
  component.methods.openEdit.call(state, {
    id: 5,
    type: "image",
    alt: "Saved image",
    sort_order: 2,
  });
  assert.equal(dirty(), false);
  state.edit_form.sort_order = "2";
  assert.equal(dirty(), false);
  state.edit_form.alt = "Unsaved alt";
  assert.equal(dirty(), true);
  state.edit_form.alt = "Saved image";
  assert.equal(dirty(), false);
  state.replace_file = { name: "replacement.png" };
  assert.equal(dirty(), true);
  state.replace_file = null;
  state.edit_dialog = false;
  assert.equal(dirty(), false);
  for (const [key, value] of [
    ["busy_upload", true],
    ["busy_add_url", true],
    ["busy_save_edit", true],
    ["busy_media_action", 5],
  ]) {
    const previous = state[key];
    state[key] = value;
    assert.equal(busy(), true);
    await nextTick();
    assert.deepEqual(plain(emitted.at(-1)), ["saving-change", true]);
    state[key] = previous;
    assert.equal(busy(), false);
    await nextTick();
    assert.deepEqual(plain(emitted.at(-1)), ["saving-change", false]);
  }
  const eventCount = emitted.length;
  state.modern = false;
  state.url_form.url = "https://example.test/legacy";
  state.busy_upload = true;
  await nextTick();
  assert.equal(emitted.length, eventCount);
});

test("failed saves keep changes dirty; successful saves reset the baseline including generated values", async (t) => {
  const f = fixture(t, { modern: true });
  f.validItem();
  assert.equal(f.state.hasUnsavedChanges, true);
  let pending = f.state.save({ silentEmit: true });
  f.requests[0].resolve({ data: { error: true, error_msg: "Denied" } });
  assert.equal(await pending, false);
  assert.equal(f.state.hasUnsavedChanges, true);
  pending = f.state.save({ silentEmit: true, goMediaAfterCreate: true });
  const saved = f.succeed();
  assert.equal(await pending, true);
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.equal(f.state.form.slug, saved.slug);
  assert.equal(f.state.form.status, saved.status);
  f.state.requestClose();
  assert.equal(f.state.discard_dialog, false);
  assert.deepEqual(plain(f.emitted), [["saved", saved], ["close"]]);
});

test("edits made during a save or pending media stay unsaved and keep the modern editor open", async (t) => {
  for (const pendingMedia of [false, true]) {
    const f = fixture(t, {
      modern: true,
      item: { id: 31, title: "Existing", category_id: 4 },
    });
    f.state.form.title = "Submitted title";
    const pending = f.state.save();
    if (pendingMedia) {
      f.state.media_dirty = true;
    } else {
      f.state.form.title = "Typed during save";
    }
    const saved = f.succeed({ id: 31, title: "Submitted title" });
    assert.equal(await pending, true);
    assert.equal(f.state.hasUnsavedChanges, true);
    assert.deepEqual(plain(f.emitted), [["saved", saved]]);
    f.state.requestClose();
    assert.equal(f.state.discard_dialog, true);
    if (pendingMedia) f.state.media_dirty = false;
    else f.state.form.title = "Submitted title";
    assert.equal(f.state.hasUnsavedChanges, false);
  }
});

test("clearing a submitted slug or status while creating remains an unsaved edit", async (t) => {
  const f = fixture(t, { modern: true });
  f.validItem();
  f.state.form.slug = "custom-slug";
  f.state.form.status = "draft";
  const pending = f.state.save();
  f.state.form.slug = "";
  f.state.form.status = null;
  const saved = f.succeed({ id: 81, slug: "custom-slug", status: "draft" });
  assert.equal(await pending, true);
  assert.equal(f.state.form.slug, "");
  assert.equal(f.state.form.status, null);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.deepEqual(plain(f.emitted), [["saved", saved]]);
  f.state.requestClose();
  assert.equal(f.state.discard_dialog, true);
  f.state.form.slug = "custom-slug";
  f.state.form.status = "draft";
  assert.equal(f.state.hasUnsavedChanges, false);
});

test("modern required-field failures return to General while legacy keeps its active tab", async (t) => {
  for (const modern of [false, true]) {
    const f = fixture(t, { modern });
    f.state.tab = "media";
    assert.equal(f.state.needsMediaCreation, modern);
    assert.equal(await f.state.save(), false);
    assert.equal(f.state.tab, modern ? "general" : "media");
    assert.ok(f.state.form_error);
    assert.equal(f.requests.length, 0);
    f.state.form.title = "Valid title";
    f.state.tab = "contact";
    assert.equal(await f.state.save(), false);
    assert.equal(f.state.tab, modern ? "general" : "contact");
    assert.equal(f.requests.length, 0);
    assert.deepEqual(f.emitted, []);
  }
});

test("the modern template has one contextual footer action and no duplicate Media create action", async (t) => {
  for (const [tab, item, label] of [
    ["general", null, "shop_listing.items.add_title"],
    ["media", null, "shop_listing.item_editor.create_for_media"],
    [
      "media",
      { id: 31, title: "Existing", category_id: 4 },
      "shop_listing.item_editor.save_changes",
    ],
  ]) {
    const rendered = await renderedEditor(t, { modern: true, tab, item });
    assert.equal(rendered.buttonCount, 1);
    assert.ok(rendered.footer.includes(label));
    for (const removed of [
      "global.actions.close",
      "global.actions.back",
      "shop_listing.item_editor.save_continue",
    ])
      assert.equal(rendered.footer.includes(removed), false);
    assert.equal(
      rendered.html.includes("shop_listing.item_editor.step"),
      false,
    );
    if (tab === "media" && !item)
      assert.equal(rendered.html.split(label).length - 1, 1);
  }
  const legacy = await renderedEditor(t, { modern: false });
  assert.equal(legacy.buttonCount, 4);
  for (const label of [
    "global.actions.close",
    "global.actions.back",
    "global.actions.next",
    "global.actions.save",
  ])
    assert.ok(legacy.footer.includes(label));
});

test("manual Save emits add once and later edit without emitting close", async (t) => {
  const f = fixture(t);
  f.validItem();
  let pending = f.state.save();
  const added = f.succeed();
  await pending;
  assert.deepEqual(plain(f.emitted), [["add", added]]);
  pending = f.state.save();
  const edited = f.succeed({ id: 81, title: "Changed" });
  await pending;
  assert.deepEqual(plain(f.emitted), [
    ["add", added],
    ["edit", edited],
  ]);
});

test("busy saves cannot send duplicate requests; API errors and rejection release busy state", async (t) => {
  const f = fixture(t);
  f.validItem();
  const pending = f.state.save();
  assert.equal(await f.state.save(), false);
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.busy_save, true);
  f.requests[0].reject(new Error("Network unavailable"));
  assert.equal(await pending, false);
  assert.equal(f.state.busy_save, false);
  assert.equal(f.notices[0][0], "error");
  assert.deepEqual(f.emitted, []);
  for (const data of [{ error: true, error_msg: "Denied" }, { item: {} }]) {
    const failed = f.state.save();
    f.requests.at(-1).resolve({ data });
    assert.equal(await failed, false);
    assert.equal(f.state.busy_save, false);
  }
  assert.equal(f.notices.filter(([kind]) => kind === "success").length, 0);
  assert.deepEqual(f.emitted, []);
});

test("missing shop context and invalid title/category never submit", async (t) => {
  const missing = fixture(t, { shop: null });
  missing.validItem();
  assert.equal(await missing.state.save(), false);
  assert.equal(missing.requests.length, 0);
  const invalid = fixture(t);
  assert.equal(await invalid.state.save(), false);
  invalid.state.form.title = "Title";
  assert.equal(await invalid.state.save(), false);
  assert.equal(invalid.requests.length, 0);
});

test("category schemas override shared keys while unknown metadata survives schema changes", async (t) => {
  const category = {
    id: 4,
    title: "Services",
    form_schema: [
      { type: "select", name: "overlap", multiple: true },
      { type: "switch", name: "enabled" },
      { type: "key-value", name: "attributes" },
      { type: "note", title: "Category guidance" },
    ],
  };
  const f = fixture(t, {
    shop: {
      id: 7,
      listing: {
        form_schema: [
          { type: "text", name: "shared" },
          { type: "text", name: "overlap" },
          { type: "note", title: "Shared guidance" },
        ],
      },
    },
    item: {
      id: 31,
      title: "Existing",
      category,
      meta: {
        shared: "  Kept  ",
        overlap: ["  One  ", ""],
        enabled: 0,
        attributes: [{ key: "  Size  ", value: "  Large  " }],
        unknown: { keep: true },
      },
    },
  });
  assert.equal(f.state.hasListingFormTab, true);
  assert.equal(f.state.hasCategoryFormTab, true);
  assert.equal(f.state.tabs.length, 9);
  assert.equal(f.state.tabs.at(-1).value, "media");
  assert.equal(
    f.state.listingSchemaEffective.some((field) => field.name === "overlap"),
    false,
  );
  assert.deepEqual(plain(f.state.buildFinalMetaPayload()), {
    unknown: { keep: true },
    shared: "Kept",
    overlap: ["One"],
    enabled: false,
    attributes: [{ key: "Size", value: "Large" }],
  });
  f.state.tab = "form_category";
  f.state.form.category = { id: 8, title: "Other", form_schema: [] };
  await nextTick();
  assert.equal(f.state.hasCategoryFormTab, false);
  assert.equal(f.state.tab, "general");
  const retained = f.state.buildFinalMetaPayload();
  assert.deepEqual(plain(retained.unknown), { keep: true });
  assert.deepEqual(plain(retained.attributes), [
    { key: "  Size  ", value: "  Large  " },
  ]);
  assert.deepEqual(plain(retained.overlap), ["  One  ", ""]);
  assert.equal(retained.enabled, 0);
});

test("modern and legacy modes preserve identical saves and schema normalization", async (t) => {
  const legacy = fixture(t),
    modern = fixture(t, { modern: true });
  for (const f of [legacy, modern]) {
    f.validItem();
    f.state.form.price = 0;
    const pending = f.state.save({ silentEmit: true, quiet: true });
    f.succeed();
    assert.equal(await pending, true);
  }
  assert.deepEqual(
    plain(modern.requests[0].payload),
    plain(legacy.requests[0].payload),
  );
  assert.deepEqual(plain(modern.state.tabs), plain(legacy.state.tabs));
});

test("Vue resolves legacy callers to modern=false and permits an explicit modern opt-in", (t) => {
  const { component } = fixture(t);
  const renderer = createRenderer({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert() {},
    remove() {},
    patchProp() {},
    setText() {},
    setComment() {},
    setElementText() {},
    parentNode: () => null,
    nextSibling: () => null,
  });
  for (const props of [{}, { modern: true }]) {
    const app = renderer.createApp({ ...component, render: () => null }, props);
    app.provide("$shop", { id: 7, listing: null });
    app.config.globalProperties.$t = (key) => key;
    const instance = app.mount({});
    t.after(() => app.unmount());
    assert.equal(instance.modern, !!props.modern);
  }
});

function categoryChild(relativePath, values = {}, globals = {}) {
  const { descriptor } = parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  );
  const exports = {},
    requests = [],
    emitted = [];
  vm.runInNewContext(
    ts.transpileModule(descriptor.script.content, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      ...globals,
      require(name) {
        if (name === "lodash-es") return { throttle: (fn) => fn };
        if (name.includes("ShopPermissions"))
          return {
            ShopPermissionRegions: { CATEGORIES: { code: "categories" } },
          };
        return { default: {} };
      },
      axios: {
        get: (url, options) =>
          new Promise((resolve, reject) =>
            requests.push({ url, options, resolve, reject }),
          ),
      },
      window: {
        API: { GET_SHOP_LISTING_CATEGORIES: (id) => `/shops/${id}/categories` },
        XAPI: {
          GET_SHOP_LISTING_CATEGORIES: (name) =>
            `/storefront/${name}/categories`,
        },
      },
    },
  );
  const component = exports.default;
  const state = reactive({
    ...component.data(),
    modern: true,
    allowed: true,
    modelValue: null,
    returnObject: true,
    activeOnly: false,
    limit: 30,
    parentId: null,
    withTrashed: false,
    $shop: { id: 7, name: "demo" },
    $route: { params: {}, matched: [] },
    $refs: {},
    $emit: (...args) => emitted.push(args),
    $nextTick: (callback) => nextTick(callback),
    writeShopAccess() {
      return this.allowed;
    },
    ...values,
  });
  for (const [name, fn] of Object.entries(component.methods))
    state[name] = fn.bind(state);
  for (const [name, fn] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => fn.call(state) });
  return { state, component, emitted, requests };
}

test("inline category creation requires current Backoffice Categories access and keeps the item draft", async () => {
  const f = categoryChild("./tabs/BShopListingItemTabGeneral.vue", {
    title: "Keep this draft",
  });
  const selected = [];
  f.state.$refs.categoryInput = {
    selectCategory: (category) => selected.push(category),
  };
  for (const values of [
    { modern: false, allowed: true },
    { modern: true, allowed: false },
    { modern: true, allowed: true, disabled: true },
    {
      modern: true,
      allowed: true,
      $route: {
        params: { vendor_id: 3 },
        matched: [{ meta: { vendor: true } }],
      },
    },
  ]) {
    Object.assign(f.state, {
      disabled: false,
      $route: { params: {}, matched: [] },
      ...values,
    });
    f.state.openCategoryDialog();
    await nextTick();
    assert.equal(f.state.category_dialog, false);
  }
  Object.assign(f.state, {
    modern: true,
    allowed: true,
    disabled: false,
    $route: { params: {}, matched: [] },
  });
  f.state.openCategoryDialog();
  await nextTick();
  assert.equal(f.state.category_dialog, true);
  const category = {
    id: 91,
    title: "New category",
    form_schema: [{ name: "size" }],
  };
  f.state.finishCategory(category);
  assert.equal(selected.length, 1);
  assert.equal(selected[0].id, 91);
  assert.equal(f.state.category_dialog, false);
  assert.equal(f.state.title, "Keep this draft");
  assert.deepEqual(f.emitted, []);
  f.state.allowed = false;
  f.state.selectCreatedCategory(category);
  assert.equal(selected.length, 1);
  f.state.allowed = true;
  f.state.$shop = { id: 8, name: "other" };
  f.state.selectCreatedCategory(category);
  assert.equal(selected.length, 1);
});

test("a category created inline stays selected when an older search response arrives", async () => {
  const f = categoryChild("../../category/input/BListingCategoryInput.vue");
  const oldRequest = f.state.getCategories();
  const category = {
    id: 91,
    title: "New category",
    form_schema: [{ name: "size" }],
  };
  f.state.selectCategory(category);
  f.state.modelValue = category;
  f.requests[0].resolve({
    data: { categories: [{ id: 2, title: "Old result" }], total: 1 },
  });
  await oldRequest;
  assert.equal(f.state.selectedCategory.id, 91);
  assert.equal(f.state.categories.length, 1);
  assert.deepEqual(plain(f.emitted), [["update:modelValue", category]]);
  const refresh = f.state.getCategories();
  assert.equal(f.requests[1].options.params.contain, 91);
  f.requests[1].resolve({ data: { categories: [category], total: 1 } });
  await refresh;
  assert.equal(f.state.selectedCategory.id, 91);
  assert.equal(f.state.busy, false);
});

test("category lookups ignore superseded responses and reset their cache when shop context changes", async () => {
  const f = categoryChild("../../category/input/BListingCategoryInput.vue");
  const oldRequest = f.state.getCategories();
  f.state.$shop = { id: 8, name: "other" };
  f.component.watch.contextKey.call(f.state);
  assert.equal(f.state.categories.length, 0);
  assert.equal(f.requests[1].url, "/shops/8/categories");
  f.requests[1].resolve({
    data: { categories: [{ id: 8, title: "Current shop" }], total: 1 },
  });
  await nextTick();
  f.requests[0].resolve({
    data: { categories: [{ id: 7, title: "Previous shop" }], total: 1 },
  });
  await oldRequest;
  assert.equal(f.state.categories[0].id, 8);
  assert.equal(f.state.busy, false);
});

test("accepting a created category supports ID models and replaces cached rows without duplicates", () => {
  const f = categoryChild("../../category/input/BListingCategoryInput.vue", {
    returnObject: false,
  });
  f.state.selectCategory({ id: 91, title: "First" });
  f.state.selectCategory({ id: 91, title: "Updated" });
  f.state.selectCategory({ title: "Invalid response" });
  assert.equal(f.state.categories.length, 1);
  assert.equal(f.state.total, 1);
  assert.equal(f.state.categories[0].title, "Updated");
  assert.deepEqual(plain(f.emitted), [
    ["update:modelValue", 91],
    ["update:modelValue", 91],
  ]);
});

test("category lookup identity follows the endpoint rather than unrelated shop metadata", async () => {
  const f = categoryChild("../../category/input/BListingCategoryInput.vue");
  const pending = f.state.getCategories();
  f.state.$shop.name = "renamed";
  f.requests[0].resolve({
    data: { categories: [{ id: 91, title: "Current" }] },
  });
  await pending;
  assert.equal(f.state.categories[0].id, 91);
  assert.equal(f.state.busy, false);
});

test("badge management uses the current authorized Backoffice shop and is unavailable to vendor or legacy callers", () => {
  const f = categoryChild("./tabs/BShopListingItemTabGeneral.vue", {
    $shop: { id: 8, name: "current" },
  });
  assert.deepEqual(plain(f.state.badgeManagementRoute), {
    name: "BPageShopListingBadges",
    params: { shop_id: 8 },
  });
  f.state.$shop = { id: 17, name: "next" };
  assert.equal(f.state.badgeManagementRoute.params.shop_id, 17);
  for (const values of [
    { modern: false },
    { allowed: false },
    { $shop: null },
    { $shop: { id: 0 } },
    {
      $route: {
        params: { vendor_id: 3 },
        matched: [{ meta: { vendor: true } }],
      },
    },
  ]) {
    Object.assign(f.state, {
      modern: true,
      allowed: true,
      $shop: { id: 8, name: "current" },
      $route: { params: {}, matched: [] },
      ...values,
    });
    assert.equal(f.state.badgeManagementRoute, null);
  }
});

test("badge selection retains ID and object models, removal, clearing and disabled guards", () => {
  const badges = [
    { id: 2, title: "Gold", is_active: true },
    { id: 3, title: "Verified", is_active: true },
  ];
  const f = categoryChild("../../badge/input/BListingBadgeInput.vue", {
    badges,
    returnObject: false,
    modelValue: [3],
  });
  f.state.toggle(badges[0]);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", [3, 2]]);
  f.state.modelValue = f.emitted.at(-1)[1];
  f.state.toggle(badges[1]);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", [2]]);
  f.state.modelValue = f.emitted.at(-1)[1];
  f.state.removeById(2);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", []]);
  f.state.clearAll();
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", []]);
  const count = f.emitted.length;
  f.state.disabled = true;
  f.state.toggle(badges[0]);
  f.state.removeById(2);
  f.state.clearAll();
  assert.equal(f.emitted.length, count);
  f.state.disabled = false;
  f.state.toggle({ id: 0 });
  assert.equal(f.emitted.length, count);

  const objects = categoryChild("../../badge/input/BListingBadgeInput.vue", {
    badges,
    returnObject: true,
    modelValue: [badges[0]],
  });
  objects.state.toggle(badges[1]);
  assert.deepEqual(plain(objects.emitted.at(-1)), [
    "update:modelValue",
    badges,
  ]);
  objects.state.emitValueFromIds([2, 2, -1, 99]);
  assert.deepEqual(plain(objects.emitted.at(-1)), [
    "update:modelValue",
    [badges[0]],
  ]);
});

test("native badge selection preserves ID and object output, deduplication, clearing and disabled state", () => {
  const badges = [
    { id: 2, title: "Gold", is_active: true },
    { id: 3, title: "Verified", is_active: true },
  ];
  const f = categoryChild("../../badge/input/BListingBadgeInput.vue", {
    badges,
    returnObject: false,
  });
  f.state.updateSelection([3, 2, 3, 0, -1]);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", [3, 2]]);
  f.state.updateSelection(null);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", []]);

  f.state.returnObject = true;
  f.state.updateSelection([2, 3, 2, 99]);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", badges]);
  f.state.updateSelection(null);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", []]);

  const count = f.emitted.length;
  f.state.disabled = true;
  f.state.updateSelection([2]);
  f.state.updateSelection(null);
  assert.equal(f.emitted.length, count);
  assert.equal(f.requests.length, 0);
});

test("clipped URL and form-selection help remeasures current content and releases only its own observer", () => {
  for (const relativePath of [
    "../../links/input/BListingLinksInput.vue",
    "./tabs/BShopListingItemTabForm.vue",
  ]) {
    const observers = [];
    const f = categoryChild(
      relativePath,
      {},
      {
        ResizeObserver: class {
          constructor(callback) {
            this.callback = callback;
            this.disconnects = 0;
            observers.push(this);
          }
          observe(element) {
            this.element = element;
          }
          disconnect() {
            this.disconnects++;
          }
        },
      },
    );
    const directive = f.component.directives.overflowCheck;
    const elements = [
      { scrollWidth: 300, clientWidth: 100 },
      { scrollWidth: 100, clientWidth: 100 },
    ];
    const initial = [[], []];
    elements.forEach((element, index) => {
      directive.mounted(element, {
        value: (clipped) => initial[index].push(clipped),
      });
    });
    assert.deepEqual(initial, [[true], [false]]);
    assert.equal(observers.length, 2);
    assert.equal(observers[0].element, elements[0]);
    assert.equal(observers[1].element, elements[1]);

    const updated = [];
    elements[0].clientWidth = 400;
    directive.updated(elements[0], {
      value: (clipped) => updated.push(clipped),
    });
    assert.deepEqual(updated, [false]);
    assert.deepEqual(initial[0], [true]);
    elements[0].scrollWidth = 500;
    observers[0].callback();
    assert.deepEqual(updated, [false, true]);
    elements[1].clientWidth = 50;
    observers[1].callback();
    assert.deepEqual(initial[1], [false, true]);

    directive.beforeUnmount(elements[0]);
    assert.equal(observers[0].disconnects, 1);
    assert.equal(observers[1].disconnects, 0);
    assert.deepEqual(Object.keys(elements[0]).sort(), [
      "clientWidth",
      "scrollWidth",
    ]);
    directive.beforeUnmount(elements[1]);
    assert.equal(observers[1].disconnects, 1);
    assert.deepEqual(Object.keys(elements[1]).sort(), [
      "clientWidth",
      "scrollWidth",
    ]);
  }
});

test("ellipsized link presentation preserves the complete URL in normalization and model updates", () => {
  const f = categoryChild("../../links/input/BListingLinksInput.vue", {
    autoHttps: true,
  });
  const longUrl = `https://example.test/${"long-path/".repeat(80)}?source=listing`;
  assert.equal(f.state.normalizeLink(longUrl), longUrl);
  f.state.onUpdate([longUrl, longUrl, "example.test/about", ""]);
  const expected = [longUrl, "https://example.test/about"];
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", expected]);
  f.state.modelValue = f.emitted.at(-1)[1];
  assert.deepEqual(plain(f.state.proxy), expected);
  f.state.onUpdate(null);
  assert.deepEqual(plain(f.emitted.at(-1)), ["update:modelValue", []]);
});

test("badge search retains active/deleted filters and searches title and description locally", () => {
  const f = categoryChild("../../badge/input/BListingBadgeInput.vue", {
    activeOnly: true,
    badges: [
      { id: 2, title: "Gold", description: "Premium quality", is_active: true },
      { id: 3, title: "Verified", description: "Trusted", is_active: true },
      { id: 4, title: "Hidden", is_active: false },
      { id: 5, title: "Removed", is_active: true, deleted_at: "2026-10-30" },
    ],
  });
  assert.deepEqual(
    plain(f.state.filteredBadges.map((badge) => badge.id)),
    [2, 3],
  );
  f.state.search = "  QUALITY  ";
  assert.deepEqual(plain(f.state.filteredBadges.map((badge) => badge.id)), [2]);
  f.state.search = "verified";
  assert.deepEqual(plain(f.state.filteredBadges.map((badge) => badge.id)), [3]);
  f.state.search = "";
  f.state.activeOnly = false;
  assert.deepEqual(
    plain(f.state.filteredBadges.map((badge) => badge.id)),
    [2, 3, 4],
  );
  f.state.withTrashed = true;
  assert.deepEqual(
    plain(f.state.filteredBadges.map((badge) => badge.id)),
    [2, 3, 4, 5],
  );
  assert.equal(f.requests.length, 0);
});
