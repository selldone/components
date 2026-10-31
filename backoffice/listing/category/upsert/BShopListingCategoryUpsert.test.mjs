import assert from "node:assert/strict";
import { File } from "node:buffer";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { createRenderer, effectScope, nextTick, reactive, watch } from "vue";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";

const filename = new URL("./BShopListingCategoryUpsert.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
  filename: filename.pathname,
});
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "listing-category-check" });
assert.deepEqual(
  compileTemplate({
    source: descriptor.template.content,
    filename: filename.pathname,
    id: "listing-category-check",
    compilerOptions: { bindingMetadata: compiled.bindings },
  }).errors,
  [],
);
for (const style of descriptor.styles)
  assert.deepEqual(
    (
      await compileStyleAsync({
        source: style.content,
        filename: filename.pathname,
        id: "listing-category-check",
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
const flush = () => new Promise(setImmediate);

class TestFormData {
  fields = new Map();
  append(name, value) {
    this.fields.set(name, value);
  }
  get(name) {
    return this.fields.get(name);
  }
  entries() {
    return this.fields.entries();
  }
}

function fixture(t, { category = null, modern = false, shop } = {}) {
  const requests = [],
    notices = [],
    emitted = [],
    revoked = [],
    exports = {};
  let previewNumber = 0;
  vm.runInNewContext(script.outputText, {
    exports,
    require(name) {
      if (name.endsWith(".vue")) return { default: {} };
      if (name.includes("ShopPermissions"))
        return {
          ShopPermissionRegions: { CATEGORIES: { code: "categories" } },
        };
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
    File,
    FormData: TestFormData,
    URL: {
      createObjectURL: () => `blob:category-test-${++previewNumber}`,
      revokeObjectURL: (value) => revoked.push(value),
    },
    axios: {
      post: (url, payload, options) =>
        new Promise((resolve, reject) =>
          requests.push({ url, payload, options, resolve, reject }),
        ),
    },
    window: {
      API: {
        POST_SHOP_LISTING_CATEGORY_ADD: (id) =>
          `/shops/${id}/listing/categories`,
        POST_SHOP_LISTING_CATEGORY_EDIT: (id, categoryId) =>
          `/shops/${id}/listing/categories/${categoryId}`,
      },
    },
  });
  const component = exports.default;
  const state = reactive({
    ...component.data(),
    category,
    modern,
    hasClose: true,
    $shop: shop === undefined ? { id: 7 } : shop,
    $route: { params: {}, matched: [] },
    $refs: { form: { validate: async () => ({ valid: true }) } },
    $t: (key) => key,
    $emit: (...args) => emitted.push(args),
    getShopImagePath: (path) => `/shop-images/${path}`,
    writeShopAccess: () => true,
  });
  for (const [name, fn] of Object.entries(component.methods))
    state[name] = fn.bind(state);
  for (const [name, fn] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => fn.call(state) });
  const scope = effectScope();
  scope.run(() => {
    for (const [name, config] of Object.entries(component.watch || {})) {
      const handler = typeof config === "function" ? config : config.handler;
      watch(() => state[name], handler.bind(state), {
        immediate: !!config.immediate,
        deep: !!config.deep,
      });
    }
  });
  t.after(() => scope.stop());
  function succeed(record = { id: 81, title: "Category", slug: "category" }) {
    assert.ok(requests.length);
    requests.at(-1).resolve({ data: { category: record } });
    return record;
  }
  return { state, component, requests, notices, emitted, revoked, succeed };
}

test("create retains every native multipart field and optional file", async (t) => {
  const f = fixture(t);
  const photo = new File(["cover"], "cover.png", { type: "image/png" });
  const icon = new File(["icon"], "icon.png", { type: "image/png" });
  Object.assign(f.state.form, {
    title: "  Rooms  ",
    slug: "  rooms  ",
    description: "  A description  ",
    parent_id: 3,
    design_id: 9,
    price_format: "  per night  ",
    sort_order: 0,
    is_active: true,
    icon: "  shops_icon  ",
    form_schema: [{ type: "text", name: "size", default: "Large" }],
  });
  f.state.photo_file = photo;
  f.state.icon_file = icon;
  const pending = f.state.save();
  assert.equal(f.requests[0].url, "/shops/7/listing/categories");
  assert.deepEqual(Object.fromEntries(f.requests[0].payload.entries()), {
    title: "Rooms",
    slug: "rooms",
    description: "A description",
    parent_id: "3",
    design_id: "9",
    price_format: "per night",
    sort_order: "0",
    is_active: "true",
    icon: "shops_icon",
    form_schema: '[{"type":"text","name":"size","default":"Large"}]',
    photo,
    icon_photo: icon,
  });
  assert.equal(
    f.requests[0].options.headers["Content-Type"],
    "multipart/form-data",
  );
  const saved = f.succeed();
  await pending;
  await flush();
  assert.deepEqual(plain(f.emitted), [["add", saved]]);
  assert.equal(f.state.busy_save, false);
});

test("edit retains explicit parent/design clearing, zero sorting and empty schema", async (t) => {
  const f = fixture(t, {
    category: { id: 11, title: "Existing", parent_id: 3, design_id: 9 },
  });
  Object.assign(f.state.form, {
    parent_id: null,
    design_id: null,
    sort_order: 0,
    is_active: false,
    form_schema: [],
  });
  const pending = f.state.save();
  assert.equal(f.requests[0].url, "/shops/7/listing/categories/11");
  const payload = f.requests[0].payload;
  assert.equal(payload.get("parent_id"), "");
  assert.equal(payload.get("design_id"), "");
  assert.equal(payload.get("sort_order"), "0");
  assert.equal(payload.get("is_active"), "false");
  assert.equal(payload.get("form_schema"), "[]");
  assert.equal(payload.get("photo"), undefined);
  assert.equal(payload.get("icon_photo"), undefined);
  f.succeed({ id: 11 });
  await pending;
  await flush();
  assert.equal(f.emitted[0][0], "edit");
});

test("create omits blank relations and title/shop validation never submits", async (t) => {
  const missing = fixture(t, { shop: null, modern: true });
  missing.state.form.title = "Category";
  await missing.state.save();
  assert.equal(missing.requests.length, 0);
  const f = fixture(t, { modern: true });
  await f.state.save();
  assert.equal(f.requests.length, 0);
  assert.ok(f.state.form_error);
  f.state.form.title = "Category";
  const pending = f.state.save();
  assert.equal(f.requests[0].payload.get("parent_id"), undefined);
  assert.equal(f.requests[0].payload.get("design_id"), undefined);
  f.succeed();
  await pending;
});

test("modern initial forms are clean and reverted details, schema and files become clean", async (t) => {
  const category = {
    id: 11,
    title: "Existing",
    is_active: true,
    form_schema: [{ type: "text", name: "size", default: "Large" }],
  };
  const f = fixture(t, { modern: true, category });
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.form.title = "Changed";
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.form.title = "Existing";
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.form.form_schema[0].default = "Small";
  assert.equal(category.form_schema[0].default, "Large");
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.form.form_schema[0].default = "Large";
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.icon_file = new File(["icon"], "icon.png");
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.icon_file = null;
  await nextTick();
  assert.equal(f.state.hasUnsavedChanges, false);
  const fresh = fixture(t, { modern: true });
  assert.equal(fresh.state.hasUnsavedChanges, false);
});

test("object schemas and stored previews initialize without mutating the supplied category", async (t) => {
  const category = {
    id: 11,
    title: "Existing",
    form_schema: { previous: [{ type: "text", name: "size" }] },
    image: "shops_cover",
    icon: "shops_icon",
  };
  const f = fixture(t, { modern: true, category });
  assert.deepEqual(plain(f.state.form.form_schema), category.form_schema);
  f.state.form.form_schema.previous[0].name = "changed";
  assert.equal(category.form_schema.previous[0].name, "size");
  assert.equal(f.state.previewCover, "/shop-images/shops_cover");
  assert.equal(f.state.previewIcon, "/shop-images/shops_icon");
  assert.equal(
    f.state.makePreview(null, "shops_fallback"),
    "/shop-images/shops_fallback",
  );
  assert.equal(f.state.makePreview(null), "");
  f.state.photo_file = new File(["cover"], "cover.png");
  await nextTick();
  assert.match(f.state.previewCover, /^blob:category-test-/);
  f.state.photo_file = null;
  await nextTick();
  assert.equal(f.state.previewCover, "/shop-images/shops_cover");
});

test("Close confirms only dirty modern forms and blocks dismissal while saving", (t) => {
  const clean = fixture(t, { modern: true });
  clean.state.requestClose();
  assert.deepEqual(plain(clean.emitted), [["close"]]);
  const f = fixture(t, { modern: true });
  f.state.form.title = "Draft";
  f.state.requestClose();
  assert.equal(f.state.discard_dialog, true);
  assert.deepEqual(f.emitted, []);
  f.state.discard_dialog = false;
  assert.equal(f.state.form.title, "Draft");
  f.state.busy_save = true;
  f.state.requestClose();
  f.state.discardChanges();
  assert.deepEqual(f.emitted, []);
  f.state.busy_save = false;
  f.state.requestClose();
  f.state.discardChanges();
  assert.deepEqual(plain(f.emitted), [["close"]]);
  assert.equal(f.requests.length, 0);
  const legacy = fixture(t);
  legacy.state.form.title = "Draft";
  legacy.state.requestClose();
  assert.deepEqual(plain(legacy.emitted), [["close"]]);
});

test("modern saves preserve stored object schemas until an explicit Clear", async (t) => {
  const schema = { previous: [{ type: "text", name: "size" }] };
  const f = fixture(t, {
    modern: true,
    category: { id: 11, title: "Existing", form_schema: schema },
  });
  let pending = f.state.save();
  assert.deepEqual(
    JSON.parse(f.requests[0].payload.get("form_schema")),
    schema,
  );
  f.succeed({ id: 11 });
  await pending;
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.clearFields();
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.deepEqual(plain(f.state.form.form_schema), []);
  pending = f.state.save();
  assert.equal(f.requests.at(-1).payload.get("form_schema"), "[]");
  f.succeed({ id: 11 });
  await pending;
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.deepEqual(schema, { previous: [{ type: "text", name: "size" }] });
});

test("modern writes and schema clearing require current Categories permission and exclude vendors", async (t) => {
  const f = fixture(t, { modern: true });
  f.state.form.title = "Draft";
  f.state.form.form_schema = [{ type: "text", name: "keep" }];
  f.state.writeShopAccess = () => false;
  assert.equal(f.state.fieldsDisabled, true);
  assert.equal(await f.state.save(), false);
  f.state.clearFields();
  assert.equal(f.state.form.form_schema.length, 1);
  assert.equal(f.requests.length, 0);
  f.state.writeShopAccess = () => true;
  f.state.$refs.form.validate = () => {
    f.state.writeShopAccess = () => false;
    return { valid: true };
  };
  assert.equal(await f.state.save(), false);
  assert.equal(f.requests.length, 0);
  f.state.writeShopAccess = () => true;
  f.state.$refs.form.validate = () => ({ valid: true });
  f.state.$route = { params: { vendor_id: "12" }, matched: [] };
  assert.equal(await f.state.save(), false);
  f.state.$route = { params: {}, matched: [{ meta: { vendor: true } }] };
  assert.equal(await f.state.save(), false);
  assert.equal(f.requests.length, 0);
});

test("duplicates and failed responses keep drafts and release saving state", async (t) => {
  const f = fixture(t, { modern: true });
  f.state.form.title = "Draft";
  let pending = f.state.save();
  await f.state.save();
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve({ data: { error: true, error_msg: "Denied" } });
  await pending;
  await flush();
  assert.equal(f.state.busy_save, false);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.deepEqual(f.emitted, []);
  pending = f.state.save();
  f.requests.at(-1).resolve({ data: { category: {} } });
  await pending;
  await flush();
  assert.equal(f.state.busy_save, false);
  assert.equal(f.state.hasUnsavedChanges, true);
  pending = f.state.save();
  f.requests.at(-1).reject(new Error("Network unavailable"));
  await pending;
  await flush();
  assert.equal(f.state.busy_save, false);
  assert.equal(f.state.form.title, "Draft");
  assert.equal(f.notices.filter(([kind]) => kind === "error").length, 3);
});

test("successful modern save clears only submitted draft state", async (t) => {
  const f = fixture(t, { modern: true });
  f.state.form.title = "Submitted";
  const pending = f.state.save();
  f.state.form.description = "Entered while saving";
  f.succeed({ id: 81, title: "Submitted", slug: "submitted" });
  await pending;
  await flush();
  assert.equal(f.state.form.description, "Entered while saving");
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.equal(f.state.effectiveCategoryId, 81);
  assert.deepEqual(
    f.emitted.map(([event]) => event),
    ["saved"],
  );
  const next = f.state.save();
  assert.equal(f.requests.at(-1).url, "/shops/7/listing/categories/81");
  f.succeed({ id: 81, title: "Submitted", slug: "submitted" });
  await next;
  await flush();
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.equal(f.emitted.at(-1)[0], "edit");
});

test("successful upload clears the submitted files while retaining newer selections", async (t) => {
  const f = fixture(t, { modern: true });
  const first = new File(["first"], "first.png");
  const later = new File(["later"], "later.png");
  f.state.form.title = "Category";
  f.state.photo_file = [first];
  f.state.icon_file = [first];
  const pending = f.state.save();
  assert.equal(f.requests[0].payload.get("photo"), first);
  f.state.photo_file = [later];
  f.succeed({ id: 81, title: "Category", image: "shops_saved_cover" });
  await pending;
  await nextTick();
  assert.equal(f.state.photo_file[0], later);
  assert.equal(f.state.icon_file, null);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.deepEqual(
    f.emitted.map(([event]) => event),
    ["saved"],
  );
});

test("an edited category kept open after upload previews the latest saved images", async (t) => {
  const f = fixture(t, {
    modern: true,
    category: {
      id: 11,
      title: "Existing",
      image: "shops_old_cover",
      icon: "shops_old_icon",
    },
  });
  f.state.photo_file = new File(["cover"], "cover.png");
  f.state.icon_file = new File(["icon"], "icon.png");
  await nextTick();
  const pending = f.state.save();
  f.state.form.description = "Entered while saving";
  f.succeed({
    id: 11,
    title: "Existing",
    image: "shops_new_cover",
    icon: "shops_new_icon",
  });
  await pending;
  await nextTick();
  assert.equal(f.state.photo_file, null);
  assert.equal(f.state.icon_file, null);
  assert.equal(f.state.previewCover, "/shop-images/shops_new_cover");
  assert.equal(f.state.previewIcon, "/shop-images/shops_new_icon");
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.equal(f.state.form.description, "Entered while saving");
  assert.deepEqual(
    f.emitted.map(([event]) => event),
    ["saved"],
  );
});

test("Vue defaults to legacy presentation and permits explicit modern opt-in", (t) => {
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
    app.provide("$shop", { id: 7 });
    Object.assign(app.config.globalProperties, {
      $t: (key) => key,
      getShopImagePath: (path) => `/shop-images/${path}`,
      writeShopAccess: () => true,
    });
    const instance = app.mount({});
    t.after(() => app.unmount());
    assert.equal(instance.modern, !!props.modern);
  }
});
