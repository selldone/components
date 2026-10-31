import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} from "@vue/compiler-sfc";

async function load(path) {
  const filename = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
    filename: filename.pathname,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "map-editor-test" });
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: filename.pathname,
      id: "map-editor-test",
      compilerOptions: { bindingMetadata: script.bindings },
    }).errors,
    [],
  );
  for (const style of descriptor.styles)
    assert.deepEqual(
      (
        await compileStyleAsync({
          source: style.content,
          filename: filename.pathname,
          id: "map-editor-test",
          scoped: style.scoped,
          preprocessLang: style.lang,
        })
      ).errors,
      [],
    );
  return descriptor.script.content;
}
const addSource = await load("./BMapTagAdd.vue");
const productsSource = await load("../products/BMapTagProducts.vue");
const plain = (value) => JSON.parse(JSON.stringify(value));
const item = () => ({
  id: 8,
  title: "HQ",
  location: { lat: 0, lng: 0 },
  address: "Fixture address",
  country: "DK",
  city: "Copenhagen",
  building: "B",
  unit: "4",
  postal: "1234",
  phone: "fixture-phone",
  name: "Fixture",
  message: "Notes",
  tags: ["Art"],
});

function fixture(source = addSource) {
  const requests = [],
    notifications = [],
    confirmations = [],
    emitted = [],
    mapCalls = [];
  let canWrite = true;
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  const exports = {};
  const notification = {
    showSuccessAlert: (...args) => notifications.push(["success", ...args]),
    showErrorAlert: (...args) => notifications.push(["error", ...args]),
    showLaravelError: (error) =>
      notifications.push(["exception", error.message]),
    openDangerAlert: (...args) => confirmations.push(args),
  };
  const axios = Object.fromEntries(
    ["get", "post", "put", "delete"].map((method) => [
      method,
      (...args) =>
        new Promise((resolve, reject) =>
          requests.push({ method, args: plain(args), resolve, reject }),
        ),
    ]),
  );
  vm.runInNewContext(compiled.outputText, {
    exports,
    axios,
    window: {
      SERACH_THROTTLE: 0,
      API: {
        PUT_EDIT_SHOP_MAP_TAG: (shop, id) => `/shops/${shop}/tags/${id}`,
        POST_CREATE_SHOP_MAP_TAG: (shop) => `/shops/${shop}/tags`,
        DELETE_SHOP_MAP_TAG: (shop, id) => `/shops/${shop}/tags/${id}`,
        GET_SHOP_MAP_TAG_PRODUCTS: (shop, id) =>
          `/shops/${shop}/tags/${id}/products`,
      },
    },
    require: (name) => {
      if (name.includes("MapHelper"))
        return { MapHelper: { GetMapImage: (...args) => args.join(",") } };
      if (name.includes("ShopPermissions"))
        return { ShopPermissionRegions: { CHANNELS: { code: "CHANNELS" } } };
      if (name.includes("BusinessModel"))
        return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (name.includes("NotificationService"))
        return { default: notification };
      if (name === "lodash-es") return { throttle: (fn) => fn };
      return { default: {} };
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    shop: { id: 1, model: "PHYSICAL" },
    currentItem: item(),
    mapTag: item(),
    writeShopAccess: () => canWrite,
    $t: (key) => key,
    $emit: (...args) => emitted.push(plain(args)),
    showMap: (...args) => mapCalls.push(args),
    closeMap: () => {},
    $refs: {},
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  if (source === addSource) {
    state.dialog = true;
    state.loadDraft();
  }
  return {
    state,
    component,
    requests,
    notifications,
    confirmations,
    emitted,
    mapCalls,
    deny() {
      canWrite = false;
      component.watch.can_write?.call(state, false);
    },
  };
}

test("editor drafts preserve complete address fields without mutating the source and support zero coordinates", () => {
  const f = fixture();
  f.state.draft.title = "Changed";
  f.state.draft.location.lat = 12;
  assert.equal(f.state.currentItem.title, "HQ");
  assert.equal(f.state.currentItem.location.lat, 0);
  f.state.loadDraft();
  assert.equal(f.state.map_url, "0,0,15");
  f.state.showSelectLocation();
  assert.equal(f.mapCalls.length, 1);
  const picked = {
    location: { lat: 55, lng: 12 },
    address: "New fixture",
    city: "New city",
    unit: "5",
    name: "Receiver",
    phone: "new fixture phone",
    message: "New notes",
  };
  f.mapCalls[0][3](picked);
  assert.deepEqual(plain(f.state.draft), { ...item(), ...picked });
  assert.equal(f.state.currentItem.unit, "4");
});

test("save requires an open writable valid draft and sends the unchanged complete payload", async () => {
  const denied = fixture();
  denied.deny();
  await denied.state.saveTag();
  assert.equal(denied.requests.length, 0);
  const f = fixture();
  f.state.draft.title = "   ";
  await f.state.saveTag();
  assert.equal(f.requests.length, 0);
  f.state.draft.title = "HQ";
  f.state.draft.location = null;
  await f.state.saveTag();
  assert.equal(f.requests.length, 0);
  f.state.loadDraft();
  const saving = f.state.saveTag();
  assert.equal(f.requests[0].method, "put");
  assert.deepEqual(f.requests[0].args, ["/shops/1/tags/8", item()]);
  await f.state.saveTag();
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve({ data: { map_tag: { ...item(), title: "Saved" } } });
  await saving;
  assert.equal(f.emitted[0][0], "edit");
  assert.equal(f.state.dialog, false);
  const add = fixture();
  add.state.currentItem = {
    title: "New",
    location: { lat: 1, lng: 2 },
    tags: [],
  };
  add.state.loadDraft();
  const creating = add.state.saveTag();
  assert.equal(add.requests[0].method, "post");
  add.requests[0].resolve({ data: { map_tag: { id: 9, ...add.state.draft } } });
  await creating;
  assert.equal(add.emitted[0][0], "add");
});

test("server failures retain the draft, and stale save/picker callbacks cannot mutate a new resource", async () => {
  const f = fixture();
  const saving = f.state.saveTag();
  f.requests[0].resolve({ data: { error: true, error_msg: "Fixture error" } });
  await saving;
  assert.equal(f.state.dialog, true);
  assert.equal(f.state.busy_save, false);
  assert.equal(f.notifications[0][0], "error");
  f.state.showSelectLocation();
  const callback = f.mapCalls[0][3];
  const stale = f.state.saveTag();
  f.state.currentItem = { ...item(), id: 10, title: "Next" };
  f.component.watch.currentItem.call(f.state);
  callback({ title: "Stale picker" });
  assert.equal(f.state.draft.title, "Next");
  f.requests[1].resolve({ data: { map_tag: item() } });
  await stale;
  assert.deepEqual(f.emitted, []);
  assert.equal(f.state.dialog, true);
});

test("removal requires disclosure, explicit verify, final confirmation and current permission", async () => {
  const f = fixture();
  f.state.confirmRemove();
  assert.equal(f.confirmations.length, 0);
  f.state.delete_open = true;
  f.state.accept_delete = true;
  f.state.confirmRemove();
  assert.equal(f.confirmations.length, 1);
  assert.equal(f.requests.length, 0);
  f.deny();
  f.confirmations[0][3]();
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.accept_delete, false);
  const valid = fixture();
  valid.state.delete_open = true;
  valid.state.accept_delete = true;
  valid.state.confirmRemove();
  const removing = valid.confirmations[0][3]();
  assert.equal(valid.requests[0].method, "delete");
  valid.requests[0].resolve({ data: { id: 8 } });
  await removing;
  assert.deepEqual(valid.emitted, [["delete", 8]]);
  assert.equal(valid.state.dialog, false);
  for (const id of [undefined, 99]) {
    const invalid = fixture();
    invalid.state.delete_open = true;
    invalid.state.accept_delete = true;
    const removing = invalid.state.removeLocation();
    invalid.requests[0].resolve({ data: { id } });
    await removing;
    assert.deepEqual(invalid.emitted, []);
    assert.equal(invalid.state.dialog, true);
    assert.equal(invalid.state.busy_delete, false);
    assert.equal(invalid.notifications[0][0], "exception");
  }
});

test("closing the critical disclosure or changing/closing the resource resets verification", () => {
  const f = fixture();
  f.state.delete_open = true;
  f.state.toggleVerification();
  assert.equal(f.state.accept_delete, true);
  f.state.busy_save = true;
  f.state.toggleVerification();
  assert.equal(f.state.accept_delete, true);
  f.state.busy_save = false;
  f.state.delete_open = true;
  f.state.accept_delete = true;
  f.state.onDeleteToggle({ target: { open: false } });
  assert.equal(f.state.accept_delete, false);
  f.state.delete_open = true;
  f.state.accept_delete = true;
  f.component.watch.dialog.call(f.state, false);
  assert.equal(f.state.accept_delete, false);
  assert.equal(f.state.delete_open, false);
});

test("assigned products preserve server pagination/sort and reject stale responses or disposed fetches", async () => {
  const f = fixture(productsSource);
  f.state.page = 3;
  f.state.search = "fixture";
  const fetching = f.state.fetchProducts(3, "sku", false);
  assert.deepEqual(f.requests[0].args, [
    "/shops/1/tags/8/products",
    {
      params: {
        search: "fixture",
        offset: 20,
        limit: 10,
        sortBy: "sku",
        sortDesc: false,
      },
    },
  ]);
  f.requests[0].resolve({ data: { total: 25, products: [{ id: 2 }] } });
  await fetching;
  assert.equal(f.state.products[0].id, 2);
  const stale = f.state.fetchProducts(1, "title", true);
  f.state.mapTag = { id: 9 };
  f.component.watch.scope_key.call(f.state);
  f.requests[1].resolve({ data: { total: 99, products: [{ id: 99 }] } });
  await stale;
  assert.deepEqual(plain(f.state.products), []);
  f.requests[2].resolve({ data: { total: 0, products: [] } });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(f.state.pageCount, 1);
  f.component.beforeUnmount.call(f.state);
  await f.state.retry();
  assert.equal(f.requests.length, 3);
});

test("assigned-product failures expose recovery while preserving scope and native data", async () => {
  const f = fixture(productsSource);
  const request = f.state.retry();
  f.requests[0].reject(new Error("Fixture failure"));
  await request;
  assert.equal(f.state.failed, true);
  assert.equal(f.state.busy_fetch, false);
  const retry = f.state.retry();
  f.requests[1].resolve({
    data: {
      total: 1,
      products: [
        { id: 3, price: 10, discount: 2, currency: "EUR", sku: "SKU" },
      ],
    },
  });
  await retry;
  assert.equal(f.state.failed, false);
  assert.deepEqual(plain(f.state.products[0]), {
    id: 3,
    price: 10,
    discount: 2,
    currency: "EUR",
    sku: "SKU",
  });
});
