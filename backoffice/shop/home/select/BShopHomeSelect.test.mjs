import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

function fixture(overrides = {}) {
  const filename = "BShopHomeSelect.vue";
  const source = readFileSync(new URL(filename, import.meta.url), "utf8");
  const { descriptor, errors } = parse(source, { filename });
  assert.deepEqual(errors, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: "home-test" }).errors, []);
  const requests = [], pending = [], notices = [];
  const notification = {
    showSuccessAlert: (...args) => notices.push(["success", ...args]),
    showErrorAlert: (...args) => notices.push(["error", ...args]),
    showLaravelError: (...args) => notices.push(["network", ...args]),
  };
  const axios = { put(url, payload) {
    requests.push([url, payload]);
    return new Promise((resolve, reject) => pending.push({ resolve, reject }));
  } };
  const api = {
    PUT_SHOP_DOMAIN_HOME_PAGE: (shop, domain) => `/shops/${shop}/domains/${domain}/home`,
    PUT_SHOP_HOME_PAGE: shop => `/shops/${shop}/home`,
  };
  const imports = name => name === "lodash-es" ? { throttle: fn => fn } : name.includes("NotificationService") ? { default: notification } : {};
  const exports = {};
  const compiled = ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "exports", "axios", "window", compiled)(imports, exports, axios, { API: api });
  const component = exports.default;
  const state = {
    ...component.data(), ...component.methods,
    shop: { id: 7, home: "shop" }, domain: { domain: "store.example.test", home: "/saved", primary: false },
    modern: true, readOnly: false, home_page: "/draft", old_page: "/saved", $t: key => key,
    ...overrides,
  };
  Object.entries(component.computed).forEach(([name, getter]) =>
    Object.defineProperty(state, name, { get: () => getter.call(state) }),
  );
  return { component, state, requests, pending, notices };
}

test("the shared modern preview follows draft modes and domain default inheritance without saving", () => {
  const f = fixture();
  for (const home of ["shop", "avocado", "hyper", "community", "blog", "map", 42, "43", "/", "/custom/index.html"]) {
    f.state.home_page = home;
    assert.equal(f.state.modernPreviewHome, home);
    assert.equal(f.state.domain.home, "/saved");
    assert.equal(f.state.shop.home, "shop");
  }
  f.state.home_page = null;
  for (const inherited of ["blog", "community", 42, "/inherited", null]) {
    f.state.shop.home = inherited;
    assert.equal(f.state.modernPreviewHome, inherited || "shop");
  }
  f.state.domain = null;
  f.state.shop.home = "blog";
  assert.equal(f.state.modernPreviewHome, "shop", "clearing the shop-wide choice uses the storefront fallback");
  assert.deepEqual(f.requests, []);
});

test("the primary-domain preview starts from shop default and keeps a newer unsaved path", () => {
  const f = fixture({
    shop: { id: 7, home: "blog" },
    domain: { domain: "primary.example.test", home: "avocado", primary: true },
  });
  let pageFetches = 0;
  f.state.fetchPages = () => { pageFetches++; };
  f.component.created.call(f.state);
  assert.equal(pageFetches, 1);
  assert.equal(f.state.home_page, "blog");
  assert.equal(f.state.modernPreviewHome, "blog");
  f.state.home_page = "/unsaved";
  f.state.shop.home = "map";
  assert.equal(f.state.modernPreviewHome, "/unsaved");
  assert.equal(f.state.domain.home, "avocado");
  assert.deepEqual(f.requests, []);
});

test("business failure retains the saved baseline and permits retry of the same home", async () => {
  const f = fixture();
  f.state.setHomePage();
  assert.equal(f.state.old_page, "/saved");
  assert.equal(f.state.busy_set, true);
  assert.deepEqual(f.requests[0], ["/shops/7/domains/store.example.test/home", { page_id: "/draft" }]);
  f.pending[0].resolve({ data: { error: true, error_msg: "Fixture rejection" } });
  await setImmediate();
  assert.equal(f.state.old_page, "/saved");
  assert.equal(f.state.home_page, "/draft");
  assert.equal(f.state.domain.home, "/saved");
  assert.equal(f.state.busy_set, false);
  assert.equal(f.notices[0][0], "error");
  f.state.setHomePage();
  assert.equal(f.requests.length, 2);
  f.pending[1].resolve({ data: { home: "/draft" } });
  await setImmediate();
  assert.equal(f.state.old_page, "/draft");
  assert.equal(f.state.domain.home, "/draft");
  assert.equal(f.state.busy_set, false);
});

test("network failure keeps an unchanged draft retryable", async () => {
  const f = fixture();
  f.state.setHomePage();
  f.pending[0].reject(new Error("Fixture network failure"));
  await setImmediate();
  assert.equal(f.state.old_page, "/saved");
  assert.equal(f.state.home_page, "/draft");
  assert.equal(f.state.busy_set, false);
  assert.equal(f.notices[0][0], "network");
  f.state.setHomePage();
  assert.equal(f.requests.length, 2);
  f.pending[1].resolve({ data: { home: "/draft" } });
  await setImmediate();
});

test("success acknowledges only the submitted value and preserves a newer unsaved input", async () => {
  const f = fixture({ domain: { domain: "store.example.test", home: "/saved", primary: true } });
  f.state.setHomePage();
  f.state.home_page = "/newer";
  f.pending[0].resolve({ data: { home: "/draft" } });
  await setImmediate();
  assert.equal(f.state.old_page, "/draft");
  assert.equal(f.state.home_page, "/newer");
  assert.equal(f.state.domain.home, "/draft");
  assert.equal(f.state.shop.home, "/draft");
  assert.equal(f.notices[0][0], "success");
  f.state.setHomePage();
  assert.deepEqual(f.requests[1][1], { page_id: "/newer" });
  f.pending[1].resolve({ data: { home: "/newer" } });
  await setImmediate();
});

test("default shop saves and existing read-only or unchanged guards retain their behavior", async () => {
  const f = fixture({ domain: null });
  f.state.setHomePage();
  assert.deepEqual(f.requests[0], ["/shops/7/home", { page_id: "/draft" }]);
  f.state.setHomePage();
  f.state.setHomePageNow();
  assert.equal(f.requests.length, 1, "pending saves cannot submit a second request");
  f.pending[0].resolve({ data: { home: "/draft" } });
  await setImmediate();
  assert.equal(f.state.shop.home, "/draft");
  assert.equal(f.state.old_page, "/draft");
  f.state.setHomePage();
  assert.equal(f.requests.length, 1);
  f.state.readOnly = true;
  f.state.home_page = "/blocked";
  f.state.setHomePage();
  f.state.setHomePageNow();
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.old_page, "/draft");
});
