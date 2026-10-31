import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import { debounce, throttle } from "lodash-es";
import * as Vue from "vue";
import ts from "typescript";

const files = {
  rating: "../../rating/input/BProductRatingInput.vue",
  pros: "../../pros/input/BProductProsInput.vue",
  cons: "../../cons/input/BProductConsInput.vue",
  badges: "../../badges/manage/BProductBadgesManage.vue",
  tags: "../../tags/input/BProductTagsInput.vue",
};
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture(name, { vendorPanel = false, readOnly = false, modern = true, product = {} } = {}) {
  const { descriptor, errors } = parse(readFileSync(new URL(files[name], import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const requests = [];
  const notices = [];
  const cacheWrites = [];
  const request = (method, url, payload) => new Promise((resolve, reject) => requests.push({
    method, url, payload, reject, resolve: (data) => resolve({ data }),
  }));
  const route = { params: vendorPanel ? { vendor_id: "9" } : {}, matched: [{ meta: { vendor: vendorPanel } }] };
  const endpoints = (scope) => new Proxy({}, { get: (_, action) => (...ids) => `/fixture/${scope}/${String(action)}/${ids.join("/")}` });
  const tagsEndpoint = (scope) => ({ set: (...args) => new Promise((resolve, reject) => requests.push({
    method: "tags", scope, args, resolve, reject,
  })) });
  const context = vm.createContext({
    exports: {},
    FormData,
    axios: Object.fromEntries(["get", "post", "put", "delete"].map((method) => [method, (url, payload) => request(method, url, payload)])),
    window: {
      API: endpoints("shop"), VAPI: endpoints("vendor"),
      $backoffice: { product: { tags: tagsEndpoint("shop") } },
      $vendor: { product: { tags: tagsEndpoint("vendor") } },
    },
    require(path) {
      if (path === "vue") return Vue;
      if (path === "lodash-es") return { debounce, throttle };
      if (path.includes("NotificationService")) return { default: Object.fromEntries(
        ["showSuccessAlert", "showErrorAlert", "showLaravelError"].map((method) => [method, (...args) => notices.push({ method, args })]),
      ) };
      if (path.includes("BackofficeLocalStorages")) return { BackofficeLocalStorages: {
        GetProductCachedTags: () => [], SetProductCachedTags: (...args) => cacheWrites.push(args),
      } };
      return { default: {} };
    },
  });
  vm.runInContext("Array.prototype.unique = function () { return Array.from(new Set(this)); };", context);
  const draft = (value) => vm.runInContext(`(${JSON.stringify(value)})`, context);
  vm.runInContext(ts.transpileModule(descriptor.script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, context);
  const component = context.exports.default;
  const state = {
    ...component.data(), modern, readOnly,
    product: draft({ id: 31, shop_id: 42, ratings: [], pros: {}, cons: {}, badges: [], tags: [], ...product }),
    IS_VENDOR_PANEL: vendorPanel, $route: route,
    $t: (key, values = {}) => key + (Object.keys(values).length ? ":" + JSON.stringify(values) : ""),
    $tm: () => ["Quality", "Value", "Support"], $forceUpdate() {}, $emit() {},
    $localstorage_base_path: () => "/fixture", isObject: (value) => !!value && typeof value === "object" && !Array.isArray(value),
    AddOrUpdateItemByID(list, value) {
      const index = list.findIndex((item) => item.id === value.id);
      if (index < 0) list.push(value); else list[index] = value;
    },
    DeleteItemByID(list, id) {
      const index = list.findIndex((item) => item.id === id);
      if (index >= 0) list.splice(index, 1);
    },
  };
  for (const [key, method] of Object.entries(component.methods || {})) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed || {})) {
    delete state[key];
    Object.defineProperty(state, key, { get: getter.bind(state) });
  }
  // Tests supply the badge catalog directly; its optional initial read is unrelated.
  if (name === "badges") state.fetchShopBadges = () => {};
  component.created?.call(state);
  return { state, component, descriptor, requests, notices, cacheWrites, draft };
}

function renderedNodes(descriptor, state) {
  const output = compileTemplate({ source: descriptor.template.content, filename: "fixture.vue", id: "survey-check" });
  assert.deepEqual(output.errors, []);
  const exports = {};
  vm.runInNewContext(ts.transpileModule(output.code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: () => ({
    ...Vue, resolveComponent: (name) => name, resolveDynamicComponent: (name) => name,
    withDirectives: (node) => node,
  }) });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push(node);
    visit(node.children);
    if (node.children?.default) visit(node.children.default({}));
  }
  visit(exports.render(state, []));
  return nodes;
}

test("survey averages preserve actual zero scores and the rendered stars stay read-only", () => {
  const { state, descriptor } = fixture("rating", { product: { ratings: [
    { id: 1, name: "Quality", value: 0, count: 2 }, { id: 2, name: "Value", value: 9, count: 2 },
  ] } });
  assert.equal(state.ratingAverage({ value: 9, count: 0 }), null);
  assert.equal(state.ratingAverage(state.product.ratings[0]), 0);
  assert.equal(state.ratingAverage(state.product.ratings[1]), 4.5);
  const stars = renderedNodes(descriptor, state).filter((node) => node.type === "v-rating");
  assert.equal(stars.length, 2);
  assert.ok(stars.every((node) => node.props.readonly === true || node.props.readonly === ""));
  assert.ok(stars.every((node) => node.props.inert === true || node.props.inert === ""));
  assert.ok(stars.every((node) => node.props["aria-hidden"] === "true" || node.props["aria-hidden"] === true));
  assert.deepEqual(stars.map((node) => node.props.modelValue ?? node.props["model-value"]), [0, 4.5]);
  const scores = renderedNodes(descriptor, state).filter((node) => node.type === "span" && node.props?.["aria-label"]?.includes("customer_average"));
  assert.equal(scores.length, 2);
  assert.match(scores[0].props["aria-label"], /0\.0.*5/);
  assert.match(scores[1].props["aria-label"], /4\.5.*5/);
});

test("rating criteria enforce five entries and update only after their independent save succeeds", async () => {
  const { state, requests, draft } = fixture("rating");
  state.product.ratings = draft(Array.from({ length: 5 }, (_, id) => ({ id, name: `Criterion ${id}` })));
  state.addRatingField("Sixth");
  assert.equal(requests.length, 0);
  state.product.ratings.pop();
  state.addRatingField("Support");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "post");
  assert.deepEqual(plain(requests[0].payload), { name: "Support" });
  assert.equal(state.product.ratings.length, 4);
  state.addRatingField("Double click");
  assert.equal(requests.length, 1);
  requests[0].resolve({ rating: { id: 8, name: "Support", count: 0, value: 0 } });
  await setImmediate();
  assert.equal(state.product.ratings.length, 5);
  assert.equal(state.busy_rating, false);
});

for (const name of ["pros", "cons"]) {
  const title = name === "pros" ? "Strength" : "Limitation";
  const suffix = name === "pros" ? "Pros" : "Cons";
  test(`${name} Add respects the count and title/detail limits before its own request`, async () => {
    const { state, requests, draft } = fixture(name);
    const add = () => state[`add${suffix}`]();
    state[`${name}_name`] = "x".repeat(33);
    state[`${name}_value`] = "Detail";
    add();
    state[`${name}_name`] = title;
    state[`${name}_value`] = "x".repeat(129);
    add();
    assert.equal(requests.length, 0);
    state[`${name}_name`] = "x".repeat(32);
    state[`${name}_value`] = "x".repeat(128);
    state.product[name] = draft(Object.fromEntries(Array.from({ length: 5 }, (_, index) => [`Item ${index}`, "Detail"])));
    state[`create${suffix}List`]();
    add();
    assert.equal(requests.length, 0);
    delete state.product[name]["Item 4"];
    state[`create${suffix}List`]();
    add();
    assert.equal(requests.length, 1);
    assert.equal(Object.keys(state.product[name]).length, 4);
    state[`${name}_name`] = "Other";
    add();
    assert.equal(requests.length, 1);
    requests[0].resolve({ [name]: { Saved: "Returned by server" } });
    await setImmediate();
    assert.deepEqual(plain(state.product[name]), { Saved: "Returned by server" });
    assert.equal(state[`busy_${name}`], false);
    assert.equal(state[`${name}_name`], "");
  });

  test(`${name} edit failures preserve the stored feature and keep its editor open`, async () => {
    const { state, requests } = fixture(name, { product: { [name]: { [title]: "Original detail" } } });
    state.showEdit({ name: title, value: "Original detail" });
    state.input_name = "Changed";
    state.input_value = "Changed detail";
    state.updateValue();
    assert.deepEqual(plain(requests[0].payload), { key: title, name: "Changed", value: "Changed detail" });
    requests[0].resolve({ error: true, error_msg: "Fixture failure" });
    await setImmediate();
    assert.deepEqual(plain(state.product[name]), { [title]: "Original detail" });
    assert.equal(state.edit_dialog, true);
    assert.equal(state.busy_update, false);
  });
}

test("the marketplace-managed survey, pros and cons cannot mutate through direct modern actions", () => {
  for (const name of ["rating", "pros", "cons"]) {
    const { state, requests } = fixture(name, { vendorPanel: true, readOnly: true });
    if (name === "rating") {
      state.addRatingField("Quality");
      state.deleteRatingField({ id: 1, name: "Quality" });
    } else {
      const suffix = name === "pros" ? "Pros" : "Cons";
      state[`${name}_name`] = "Title";
      state[`${name}_value`] = "Detail";
      state[`add${suffix}`]();
      state.showEdit({ name: "Title", value: "Detail" });
      state[`delete${suffix}`]({ name: "Title" });
      state.updateValue();
      assert.equal(state.edit_dialog, false);
    }
    assert.equal(requests.length, 0, name);
  }
});

test("legacy vendor editors retain the original vendor-scoped save endpoints", async () => {
  for (const name of ["rating", "pros", "cons"]) {
    const { state, requests } = fixture(name, { vendorPanel: true, modern: false });
    if (name === "rating") state.addRatingField("Quality");
    else {
      state[`${name}_name`] = "Title";
      state[`${name}_value`] = "Detail";
      state[name === "pros" ? "addPros" : "addCons"]();
    }
    assert.equal(requests.length, 1, name);
    assert.match(requests[0].url, /\/vendor\/POST_MY_VENDOR_.*\/9\/31$/);
    requests[0].resolve({ error: true, error_msg: "Fixture failure" });
    await setImmediate();
  }
});

test("badge catalog creation never assigns the new catalog item to the product", async () => {
  const { state, requests } = fixture("badges", { product: { badges: [4] } });
  state.badges = [4];
  state.title_input = "New catalog badge";
  state.show_add = true;
  state.addNewBadge();
  assert.match(requests[0].url, /POST_ADD_CUSTOM_BADGE\/42$/);
  requests[0].resolve({ badge: { id: 8, title: "New catalog badge" } });
  await setImmediate();
  assert.equal(state.all_badges[0].id, 8);
  assert.ok(state.all_badges_filter.some((badge) => badge.id === 8));
  assert.deepEqual(plain(state.badges), [4]);
  assert.deepEqual(plain(state.product.badges), [4]);
  assert.equal(requests.length, 1);
});

test("badge reorder preserves IDs and the existing three-second throttled independent save", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 10000 });
  const { state, requests } = fixture("badges");
  state.badges = [4, 7, 9];
  state.moveBadge(0, -1);
  assert.equal(requests.length, 0);
  state.moveBadge(2, -1);
  assert.deepEqual(plain(state.badges), [4, 9, 7]);
  assert.equal(requests.length, 1);
  requests[0].resolve({ badges: [4, 9, 7] });
  await setImmediate();
  state.moveBadge(1, -1);
  t.mock.timers.tick(2999);
  assert.equal(requests.length, 1);
  t.mock.timers.tick(1);
  assert.equal(requests.length, 2);
  assert.deepEqual(plain(requests[1].payload), { badges: [9, 4, 7] });
  requests[1].resolve({ badges: [9, 4, 7] });
  await setImmediate();
  assert.deepEqual(plain(state.product.badges), [9, 4, 7]);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} badge and tag saves retain their own scope and automatic/null semantics`, async () => {
    const badge = fixture("badges", { vendorPanel });
    badge.state.badges = null;
    badge.state.saveProductBadgesNow();
    assert.match(badge.requests[0].url, vendorPanel ? /\/vendor\/POST_MY_VENDOR_SET_PRODUCT_BADGE\/9\/31$/ : /\/shop\/POST_SET_PRODUCT_BADGE\/42\/31$/);
    assert.deepEqual(plain(badge.requests[0].payload), { badges: null });
    badge.requests[0].resolve({ badges: null });
    await setImmediate();
    assert.equal(badge.state.product.badges, null);

    const tags = fixture("tags", { vendorPanel });
    tags.state.tags = tags.draft(["SUMMER", "summer", "Sale", null, ""]);
    tags.state.change = true;
    tags.state.setTags();
    assert.equal(tags.requests[0].scope, vendorPanel ? "vendor" : "shop");
    assert.deepEqual(plain(tags.requests[0].args), [vendorPanel ? "9" : 42, 31, ["summer", "sale"]]);
    assert.deepEqual(plain(tags.state.product.tags), []);
    tags.requests[0].resolve({ tags: ["summer", "sale"] });
    await setImmediate();
    assert.deepEqual(plain(tags.state.product.tags), ["summer", "sale"]);
    assert.equal(tags.cacheWrites.length, 1);
  });
}

test("tags debounce for 1.5 seconds and flush the last local draft once on unmount", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 10000 });
  const { state, component, requests, draft } = fixture("tags", { product: { tags: ["saved"] } });
  state.tags.push("DRAFT");
  assert.deepEqual(plain(state.product.tags), ["saved"]);
  state.change = true;
  state.onChange();
  t.mock.timers.tick(1499);
  assert.equal(requests.length, 0);
  t.mock.timers.tick(1);
  assert.equal(requests.length, 1);
  requests[0].resolve({ tags: ["saved", "draft"] });
  await setImmediate();
  state.tags = draft(["LAST"]);
  state.change = true;
  state.onChange();
  component.beforeUnmount.call(state);
  assert.equal(requests.length, 2);
  requests[1].resolve({ tags: ["last"] });
  await setImmediate();
  t.mock.timers.tick(1500);
  assert.equal(requests.length, 2);
  assert.deepEqual(plain(state.product.tags), ["last"]);
});

test("unmounting one tag editor does not cancel another editor’s pending save", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 10000 });
  const first = fixture("tags");
  const second = fixture("tags");
  // Vue binds the same Options method definition for both mounted instances.
  second.state.onChange.cancel();
  second.state.onChange = first.component.methods.onChange.bind(second.state);
  first.component.created.call(second.state);
  for (const entry of [first, second]) {
    entry.state.tags = entry.draft(["Draft"]);
    entry.state.change = true;
    entry.state.onChange();
  }
  first.component.beforeUnmount.call(first.state);
  assert.equal(first.requests.length, 1);
  assert.equal(second.requests.length, 0);
  t.mock.timers.tick(1500);
  assert.equal(first.requests.length, 1);
  assert.equal(second.requests.length, 1);
  first.requests[0].resolve({ tags: ["draft"] });
  second.requests[0].resolve({ tags: ["draft"] });
  await setImmediate();
});

test("badge editors keep independent throttles and flush the last reorder once on unmount", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 10000 });
  const first = fixture("badges");
  const second = fixture("badges", { product: { id: 32 } });
  second.state.saveProductBadges.cancel?.();
  second.state.saveProductBadges = first.component.methods.saveProductBadges.bind(second.state);
  first.component.created.call(second.state);
  first.state.badges = [4];
  first.state.saveProductBadges();
  first.requests[0].resolve({ badges: [4] });
  await setImmediate();
  first.state.badges = [9, 4];
  first.state.saveProductBadges();
  second.state.badges = [7];
  second.state.saveProductBadges();
  assert.equal(second.requests.length, 1, "A second product must save independently of the first product's throttle");
  second.requests[0].resolve({ badges: [7] });
  await setImmediate();
  first.component.beforeUnmount.call(first.state);
  assert.equal(first.requests.length, 2);
  assert.deepEqual(plain(first.requests[1].payload), { badges: [9, 4] });
  first.requests[1].resolve({ badges: [9, 4] });
  await setImmediate();
  t.mock.timers.tick(3000);
  assert.equal(first.requests.length, 2);
  assert.equal(second.requests.length, 1);
});
