import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("./BBoxesList.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture({ vendor = true, write = true, modern = true } = {}) {
  const calls = [], confirmations = [], refreshes = [], permissionCalls = [], notices = [];
  const permissions = { write };
  const api = () => ({
    POST_MY_VENDOR_BOXES_ADD: (owner) => `vendor/${owner}/boxes`,
    PUT_MY_VENDOR_BOXES_EDIT: (owner, id) => `vendor/${owner}/boxes/${id}`,
    DELETE_MY_VENDOR_BOX: (owner, id) => `vendor/${owner}/boxes/${id}`,
    POST_SHOP_BOXES_ADD: (owner) => `shop/${owner}/boxes`,
    PUT_SHOP_BOXES_EDIT: (owner, id) => `shop/${owner}/boxes/${id}`,
    DELETE_SHOP_BOX: (owner, id) => `shop/${owner}/boxes/${id}`,
  });
  const transport = (method) => (url, payload) => {
    let resolve, reject;
    const result = new Promise((yes, no) => { resolve = yes; reject = no; });
    calls.push({ method, url, payload, resolve: (data) => resolve({ data }), reject });
    return result;
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    axios: { post: transport("post"), put: transport("put"), delete: transport("delete") },
    window: { API: api(), VAPI: api() },
    require(name) {
      if (name === "lodash-es") return { throttle: (fn) => fn };
      if (name.includes("ShopPermissions")) return { ShopPermissionRegions: { LOGISTIC: { code: "LOGISTIC" } } };
      if (name.includes("vendor_member.model")) return { VendorMemberTypes: { VendorMemberRegionCode: { SHIPPING: "SHIPPING" } } };
      if (name.includes("NotificationService")) return { default: {
        openDangerAlert: (...args) => confirmations.push(args),
        showErrorAlert: (...args) => notices.push(["error", ...args]),
        showSuccessAlert: (...args) => notices.push(["success", ...args]),
        showLaravelError: (...args) => notices.push(["network", ...args]),
      } };
      return { default: {}, ShopOptionsHelper: {} };
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(), modern,
    $shop: { id: 13 }, $vendor: vendor ? { id: 9 } : null,
    $t: (key, params) => params ? `${key}:${JSON.stringify(params)}` : key,
    writeVendorAccess(owner, region) {
      permissionCalls.push(["vendor", owner.id, region]);
      return permissions.write;
    },
    writeShopAccess(region) {
      permissionCalls.push(["shop", this.$shop.id, region]);
      return permissions.write;
    },
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: getter.bind(state) });
  state.fetchBoxes = (...args) => refreshes.push(args);
  return { state, component, permissions, calls, confirmations, refreshes, permissionCalls, notices };
}

test("shared box template compiles after contextual permission guards", () => {
  const result = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "shared-box-access" });
  assert.deepEqual(result.errors, []);
});

test("vendor writes require SHIPPING while shop writes require LOGISTIC", () => {
  const vendor = fixture();
  assert.equal(vendor.state.canManageBoxes, true);
  assert.deepEqual(vendor.permissionCalls.at(-1), ["vendor", 9, "SHIPPING"]);
  const shop = fixture({ vendor: false });
  assert.equal(shop.state.canManageBoxes, true);
  assert.deepEqual(shop.permissionCalls.at(-1), ["shop", 13, "LOGISTIC"]);
  shop.state.$shop = null;
  assert.equal(shop.state.canManageBoxes, false);
});

test("read-only contexts cannot open an editor, submit a draft or request deletion", () => {
  for (const vendor of [true, false]) {
    const { state, calls, confirmations } = fixture({ vendor, write: false });
    state.openCreateDialog();
    state.openEditDialog({ id: 4, name: "Fixture" });
    assert.equal(state.dialog, false);
    Object.assign(state, { dialog: true, formOwner: state.ownerKey });
    state.form = { id: 4, name: "Fixture", length: 20, width: 20, height: 10, weight: 1 };
    state.submit();
    state.removeBox({ id: 4, name: "Fixture" });
    assert.equal(calls.length, 0);
    assert.equal(confirmations.length, 0);
  }
});

test("permission loss and owner changes close drafts and prevent stale submissions", () => {
  const { state, component, permissions, calls } = fixture();
  state.openCreateDialog();
  permissions.write = false;
  state.submit();
  assert.equal(calls.length, 0);
  component.watch.canManageBoxes.call(state, false);
  assert.equal(state.dialog, false);
  assert.equal(state.formOwner, null);

  permissions.write = true;
  state.openCreateDialog();
  state.form.name = "Fixture";
  state.$vendor = { id: 10 };
  state.submit();
  assert.equal(calls.length, 0);
  component.watch.ownerKey.call(state);
  assert.equal(state.dialog, false);
  assert.equal(state.formOwner, null);
});

test("authorized create and update preserve contextual native endpoints and field payloads", async () => {
  for (const vendor of [true, false]) {
    for (const edit of [false, true]) {
      const { state, calls, refreshes } = fixture({ vendor });
      const box = { id: 4, name: "Fixture", length: 20, width: 30, height: 10, weight: 1 };
      if (edit) state.openEditDialog(box);
      else { state.openCreateDialog(); Object.assign(state.form, box); }
      state.submit();
      assert.equal(calls.length, 1);
      assert.equal(calls[0].method, edit ? "put" : "post");
      assert.equal(calls[0].url, `${vendor ? "vendor/9" : "shop/13"}/boxes${edit ? "/4" : ""}`);
      assert.deepEqual(plain(calls[0].payload), { name: "Fixture", length: 20, width: 30, height: 10, weight: 1 });
      calls[0].resolve({ error: false });
      await new Promise(setImmediate);
      assert.equal(state.dialog, false);
      assert.equal(state.busy, false);
      assert.equal(refreshes.length, 1);
    }
  }
});

test("modern removal waits for confirmation and rechecks permission and owner at action time", () => {
  for (const change of ["permission", "owner"]) {
    const { state, permissions, calls, confirmations } = fixture();
    state.removeBox({ id: 4, name: "Fixture" });
    assert.equal(calls.length, 0);
    assert.equal(confirmations.length, 1);
    if (change === "permission") permissions.write = false;
    else state.$vendor = { id: 10 };
    confirmations[0][3]();
    assert.equal(calls.length, 0);
  }
});

test("confirmed modern removal sends one native request and keeps failures recoverable", async () => {
  const { state, calls, confirmations, refreshes } = fixture();
  state.removeBox({ id: 4, name: "Fixture" });
  const confirm = confirmations[0][3];
  const pending = confirm();
  confirm();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "vendor/9/boxes/4");
  calls[0].resolve({ error: true, error_msg: "Fixture failed deletion" });
  await pending;
  assert.equal(state.busy, false);
  assert.equal(refreshes.length, 0);
  confirm();
  assert.equal(calls.length, 1, "a used confirmation cannot issue another delete");
  state.removeBox({ id: 4, name: "Fixture" });
  confirmations[1][3]();
  calls[1].resolve({ error: false });
  await new Promise(setImmediate);
  assert.equal(refreshes.length, 1);
});

test("legacy removal retains its immediate flow with current permission and busy guards", () => {
  const { state, calls, confirmations, permissions } = fixture({ modern: false });
  permissions.write = false;
  state.removeBox({ id: 4 });
  assert.equal(calls.length, 0);
  permissions.write = true;
  state.removeBox({ id: 4 });
  state.removeBox({ id: 4 });
  assert.equal(calls.length, 1);
  assert.equal(confirmations.length, 0);
});

test("a completed old-owner write cannot refresh or close the new owner's view", async () => {
  const { state, calls, refreshes, notices } = fixture();
  state.openCreateDialog();
  state.form.name = "Fixture";
  state.submit();
  state.$vendor = { id: 10 };
  calls[0].resolve({ error: false });
  await new Promise(setImmediate);
  assert.equal(refreshes.length, 0);
  assert.equal(notices.length, 0);
});
