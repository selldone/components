import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

const filename = new URL("./BBlogAuthorEdit.vue", import.meta.url).pathname;
const { descriptor, errors } = parse(readFileSync(new URL("./BBlogAuthorEdit.vue", import.meta.url), "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "author-edit-test" });
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: "author-edit-test", compilerOptions: { bindingMetadata: compiled.bindings } }).errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, filename, id: "author-edit-test", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
const script = ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const settle = () => new Promise((resolve) => setImmediate(resolve));
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture() {
  const exports = {}, requests = [], events = [], notices = [];
  const request = (method, url, payload) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    requests.push({ method, url, payload, resolve, reject }); return promise;
  };
  vm.runInNewContext(script, {
    exports, axios: { get: (...args) => request("get", ...args), put: (...args) => request("put", ...args) },
    window: { API: { GET_SHOP_ELIGIBLE_STAFFS: (shop) => `/shop/${shop}/staff`, PUT_SHOP_ARTICLE_AUTHOR: (shop, article) => `/shop/${shop}/article/${article}/author` } },
    require(name) {
      if (name.includes("ShopPermissions")) return { ShopPermissionRegions: { BLOG: { code: "blog" } } };
      if (name.includes("core-js/server")) return { CleanCache() {} };
      if (name.includes("NotificationService")) return { default: Object.fromEntries(["showErrorAlert", "showSuccessAlert", "showLaravelError"].map((method) => [method, (...args) => notices.push([method, ...args])])) };
      return { default: {} };
    },
  });
  const component = exports.default;
  const state = { ...component.data(), shop: { id: 7 }, article: { id: 21, user_id: 2, user: { name: "Original author" }, title: "Unsaved title", body: "<p>Unsaved body</p>" }, selected_user: { id: 8 }, permitted: true, disabled: false, $t: (key) => key, $emit: (...args) => events.push(args), writeShopAccess() { return this.permitted; } };
  let busy = false;
  Object.defineProperty(state, "busy", { get: () => busy, set(value) { if (value === busy) return; busy = value; component.watch.busy.call(state, value); } });
  Object.defineProperty(state, "can_assign", { get: () => component.computed.can_assign.call(state) });
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  return { component, state, requests, events, notices };
}

test("disabled or freshly denied author controls cannot read staff or assign an author", async () => {
  assert.equal(fixture().component.props.disabled.default, false);
  for (const denied of ["disabled", "permission"]) {
    const f = fixture(); if (denied === "disabled") f.state.disabled = true; else f.state.permitted = false;
    assert.deepEqual(plain(await f.state.searchEligibleStaffs("someone")), []);
    f.state.assignAuthor(); assert.equal(f.requests.length, 0);
  }
});

test("assignment forwards busy state, preserves the local draft and uses the existing payload", async () => {
  const f = fixture();
  f.state.assignAuthor();
  assert.equal(f.state.busy, true);
  assert.deepEqual(plain(f.events), [["busy", true]]);
  assert.equal(f.requests[0].url, "/shop/7/article/21/author");
  assert.deepEqual(plain(f.requests[0].payload), { user_id: 8 });
  f.requests[0].resolve({ data: { article: { user_id: 8, user: { name: "New author" }, updated_at: "2026-10-28" } } });
  await settle();
  assert.equal(f.state.article.user.name, "New author");
  assert.equal(f.state.article.title, "Unsaved title");
  assert.equal(f.state.article.body, "<p>Unsaved body</p>");
  assert.deepEqual(plain(f.events), [["busy", true], ["busy", false]]);
});

test("late assignment output cannot change a different record, shop or revoked view", async () => {
  for (const change of ["article", "id", "shop", "permission"]) {
    const f = fixture(); f.state.assignAuthor();
    if (change === "article") f.state.article = { ...f.state.article, id: 99 };
    if (change === "id") f.state.article.id = 99;
    if (change === "shop") f.state.shop.id = 99;
    if (change === "permission") f.state.permitted = false;
    f.requests[0].resolve({ data: { article: { user_id: 8, user: { name: "Stale author" } } } });
    await settle();
    assert.equal(f.state.article.user_id, 2, change);
    assert.equal(f.state.busy, false);
    assert.equal(f.notices.length, 0);
  }
});

test("a failed assignment releases busy state and permits retry", async () => {
  const f = fixture(); f.state.assignAuthor(); f.requests[0].reject(new Error("Synthetic failure"));
  await settle(); assert.equal(f.state.busy, false); assert.equal(f.state.can_assign, true);
  assert.equal(f.notices[0][0], "showLaravelError");
});
