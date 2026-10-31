import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import { throttle } from "lodash-es";
import * as Vue from "vue";
import ts from "typescript";

const filename = "BProductAddDropshippingShops.vue";
const normalize = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => {
  await Vue.nextTick();
  await new Promise(setImmediate);
  await Vue.nextTick();
};
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const node = (tag, text = "") => ({
  tag, tagName: tag.toUpperCase(), text, props: {}, children: [], parent: null, style: {},
  addEventListener() {}, removeEventListener() {},
});
const renderer = Vue.createRenderer({
  createElement: (tag) => node(tag), createText: (text) => node("#text", text),
  createComment: (text) => node("#comment", text),
  insert(child, parent, anchor) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = parent;
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
  },
  remove(child) {
    child.parent?.children.splice(child.parent.children.indexOf(child), 1);
    child.parent = null;
  },
  setText: (element, text) => { element.text = text; },
  setElementText: (element, text) => { element.text = text; element.children = []; },
  patchProp: (element, key, _previous, value) => { element.props[key] = value; },
  parentNode: (element) => element.parent,
  nextSibling: (element) => element.parent?.children[element.parent.children.indexOf(element) + 1],
});
const descendants = (element) => [element, ...element.children.flatMap(descendants)];
const text = (element) => element.text + element.children.map(text).join("");
const stub = (tag = "div") => Vue.defineComponent({
  inheritAttrs: false,
  setup: (_props, { attrs, slots }) => () => Vue.h(tag, attrs, [
    slots.activator?.({ props: {} }), slots.default?.(),
  ]),
});

function fixture(t, { countries = ["US", "DE"], localCountry = "FR", render = false } = {}) {
  const calls = { get: [], post: [], errors: [], success: [], selected: [] };
  const axios = Object.fromEntries(["get", "post"].map((verb) => [verb, (url, payload) => {
    const pending = deferred();
    calls[verb].push({ url, payload, ...pending });
    return pending.promise;
  }]));
  const { descriptor, errors } = parse(readFileSync(new URL(`./${filename}`, import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports, axios, AbortController, setTimeout, clearTimeout,
    window: {
      SERACH_THROTTLE: 10,
      API: {
        GET_DROP_SHIPPING_SHOPS: (id) => `/shops/${id}/reseller/shops`,
        POST_REQUEST_DROPSHIP_ACCESS: (id) => `/shops/${id}/reseller/access`,
      },
    },
    require(name) {
      if (name === "lodash-es") return { throttle };
      if (name === "vue") return Vue;
      if (name.includes("SetupService")) return { SetupService: { LocalServiceCountry: () => localCountry } };
      if (name.includes("NotificationService")) return { default: {
        showErrorAlert: (...args) => calls.errors.push(args),
        showLaravelError: (...args) => calls.errors.push(args),
        showSuccessAlert: (...args) => calls.success.push(args),
      } };
      return { default: {} };
    },
  });
  const component = exports.default;
  let renderFunction = () => null;
  if (render) {
    const template = compileTemplate({ source: descriptor.template.content, filename, id: "supplier-test" });
    assert.deepEqual(template.errors, []);
    const rendered = {};
    vm.runInNewContext(transpile(template.code), { exports: rendered, require: () => Vue });
    renderFunction = rendered.render;
  }
  const table = Vue.defineComponent({
    props: ["items", "headers"], emits: ["click:row"],
    setup: (props, { emit, slots }) => () => Vue.h("table", [
      ...(props.items || []).map((item) => Vue.h("tr", {
        onClick: (event) => emit("click:row", event, { item }),
      }, (props.headers || []).map((header) => Vue.h("td", slots[`item.${header.key || header.value}`]?.({ item }))))),
      !props.items?.length && slots["no-data"]?.(), slots.bottom?.(),
    ]),
  });
  const componentNames = new Set([
    ...Object.keys(component.components || {}),
    ...Array.from(descriptor.template.content.matchAll(/<(v-[\w-]+|u-[\w-]+|s-[\w-]+|flag)(?:\s|>)/g), (match) => match[1]),
  ]);
  const components = Object.fromEntries(Array.from(componentNames, (name) => [name, stub(name === "v-btn" ? "button" : "div")]));
  components.VDataTableServer = table;
  components["v-data-table-server"] = table;
  const shop = Vue.reactive({ id: 42, countries });
  const app = renderer.createApp({ ...component, components, render: renderFunction }, {
    shop, onSelect: (item) => calls.selected.push(item),
  });
  const warnings = [], failures = [];
  app.config.warnHandler = (warning) => warnings.push(warning);
  app.config.errorHandler = (error) => failures.push(error);
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, $vuetify: { display: { xs: false, width: 1200 } },
    IMAGE_SIZE_SMALL: "small", getShopImagePath: (value) => value,
    numeralFormat: (value) => String(value), getCountryName: (code) => `Country ${code}`,
  });
  app.directive("copy", { mounted: (element, binding) => { element.copyValue = binding.value ?? text(element); } });
  const host = node("root");
  const state = app.mount(host);
  t.after(() => { if (!state.disposed) app.unmount(); assert.deepEqual(failures, []); assert.deepEqual(warnings, []); });
  const response = async (index, shops = [], total = shops.length) => {
    calls.get[index].resolve({ data: { error: false, shops, total } });
    await settle();
  };
  return { state, calls, shop, response, host, app };
}

test("the first query uses the shop country or local fallback before it starts", async (t) => {
  for (const [countries, localCountry, expected] of [
    [["US", "DE"], "FR", "US"], [[], "FR", "FR"], [null, "", null],
  ]) {
    const { state, calls, response } = fixture(t, { countries, localCountry });
    assert.equal(calls.get.length, 1);
    assert.equal(state.country, expected);
    assert.equal(calls.get[0].payload.params.country, expected);
    await response(0);
    assert.equal(calls.get.length, 1);
  }
});

test("queries retain native endpoint, offset, sort and country/access filters", async (t) => {
  const { state, calls, response } = fixture(t);
  await response(0, [{ id: 91 }], 35);
  assert.equal(state.pageCount, 4);
  state.search = "supplier fixture";
  state.country = "DE";
  state.show_all = true;
  state.sortBy = [{ key: "drop_shipping_score", order: "asc" }];
  state.changePage(3);
  assert.equal(calls.get[1].url, "/shops/42/reseller/shops");
  assert.deepEqual(normalize(calls.get[1].payload.params), {
    offset: 20, limit: 10, sortBy: "drop_shipping_score", sortDesc: false,
    search: "supplier fixture", country: "DE", show_all: true,
  });
  await response(1, [{ id: 92 }], 35);
  assert.deepEqual(normalize(state.drop_shops), [{ id: 92 }]);
  for (const page of [0, 5, 3]) state.changePage(page);
  assert.equal(calls.get.length, 2, "Invalid or unchanged pages do not refetch");
});

test("changed filters and native sorting start at page one with one query", async (t) => {
  const { state, calls, response } = fixture(t);
  await response(0);
  state.page = 4;
  state.country = "DE";
  state.filterChanged();
  assert.equal(state.page, 1);
  assert.equal(calls.get.length, 2);
  assert.equal(calls.get[1].payload.params.offset, 0);
  await response(1);
  state.page = 3;
  state.setSort([{ key: "title", order: "asc" }]);
  assert.equal(state.page, 1);
  assert.equal(calls.get.length, 3);
  assert.equal(calls.get[2].payload.params.sortBy, "title");
  assert.equal(calls.get[2].payload.params.sortDesc, false);
  await response(2);
  state.page = 2;
  state.toggleSortDirection();
  assert.equal(state.page, 1);
  assert.equal(calls.get[3].payload.params.sortDesc, true);
  await response(3);
  state.changeSort("drop_shipping_products");
  assert.equal(calls.get[4].payload.params.sortBy, "drop_shipping_products");
  await response(4);
  state.changeSort("created_at");
  assert.equal(state.sortKey, "created_at");
  assert.equal(calls.get[5].payload.params.sortBy, null, "Latest added preserves the native default sort");
  await response(5);
  state.changeSort("created_at");
  assert.equal(calls.get.length, 6);
});

test("clear filters resets the full query once and search throttles cancel on exit", async (t) => {
  const { state, calls, response, app } = fixture(t);
  await response(0);
  state.search = "fixture";
  state.country = "DE";
  state.show_all = true;
  state.page = 7;
  state.resetFilters();
  assert.equal(state.page, 1);
  assert.equal(state.country, null);
  assert.ok(!state.search);
  assert.equal(state.show_all, true);
  assert.equal(calls.get.length, 2);
  assert.equal(calls.get[1].payload.params.offset, 0);
  await response(1);
  state.search = "first";
  state.searchThrottled();
  state.search = "second";
  state.searchThrottled();
  const beforeExit = calls.get.length;
  app.unmount();
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(calls.get.length, beforeExit, "An abandoned search cannot start another request");
});

test("only the latest matching shop response can replace rows or end loading", async (t) => {
  const { state, calls, response, shop, app } = fixture(t);
  state.search = "new query";
  state.filterChanged();
  await response(0, [{ id: 1 }], 100);
  assert.equal(state.busy_fetch, true);
  assert.deepEqual(normalize(state.drop_shops), []);
  await response(1, [{ id: 2 }], 1);
  assert.equal(state.busy_fetch, false);
  assert.deepEqual(normalize(state.drop_shops), [{ id: 2 }]);
  state.fetchDropShops();
  shop.id = 77;
  shop.countries = ["CA"];
  await settle();
  assert.equal(calls.get.at(-1).url, "/shops/77/reseller/shops");
  await response(2, [{ id: 3 }], 1);
  assert.deepEqual(normalize(state.drop_shops), [], "Prior shop rows must not leak into the new shop");
  await response(3, [{ id: 4 }], 1);
  assert.deepEqual(normalize(state.drop_shops), [{ id: 4 }]);
  state.fetchDropShops();
  state.fetchDropShops();
  await response(5, [{ id: 5 }], 1);
  calls.get[4].reject(new Error("An obsolete query failed"));
  await settle();
  assert.equal(state.busy_fetch, false);
  assert.equal(state.fetch_error, false);
  assert.deepEqual(normalize(state.drop_shops), [{ id: 5 }]);
  assert.equal(calls.errors.length, 0);
  state.fetchDropShops();
  app.unmount();
  await response(6, [{ id: 6 }], 1);
  assert.deepEqual(normalize(state.drop_shops), [{ id: 5 }], "Disposed responses cannot mutate the abandoned view");
});

test("server and transport errors release loading and can recover to a genuine empty result", async (t) => {
  const { state, calls, response, host } = fixture(t, { render: true });
  assert.match(text(host), /waiting_load_data/);
  assert.doesNotMatch(text(host), /empty_title/);
  calls.get[0].resolve({ data: { error: true, error_msg: "Fixture denied" } });
  await settle();
  assert.equal(state.busy_fetch, false);
  assert.equal(Boolean(state.fetch_error), true);
  assert.equal(calls.errors.length, 1);
  assert.match(text(host), /load_error/);
  const retry = descendants(host).find((element) => element.tag === "button" && text(element).endsWith("retry"));
  assert.ok(retry);
  retry.props.onClick();
  assert.equal(state.busy_fetch, true);
  calls.get[1].reject(new Error("Fixture offline"));
  await settle();
  assert.equal(state.busy_fetch, false);
  assert.equal(Boolean(state.fetch_error), true);
  assert.equal(calls.errors.length, 2);
  state.fetchDropShops();
  await response(2, [], 0);
  assert.equal(state.busy_fetch, false);
  assert.equal(Boolean(state.fetch_error), false);
  assert.equal(state.totalItems, 0);
  assert.deepEqual(normalize(state.drop_shops), []);
  assert.match(text(host), /empty_title/);
  assert.doesNotMatch(text(host), /load_error/);
  const clear = descendants(host).find((element) => element.tag === "button" && text(element).endsWith("clear_filters"));
  assert.ok(clear);
  clear.props.onClick();
  assert.equal(calls.get.length, 4);
  assert.equal(calls.get[3].payload.params.show_all, true);
  assert.equal(calls.get[3].payload.params.country, null);
  await response(3, [{ id: 98, title: "Recovered supplier", countries: [] }], 1);
  assert.match(text(host), /Recovered supplier/);
});

test("access requests use the supplier ID and reject own-shop, pending and duplicate writes", async (t) => {
  const { state, calls, response } = fixture(t);
  await response(0);
  for (const supplier of [
    { id: 42 }, { id: 91, dropship_access: { status: "ACCEPT" } },
    { id: 92, dropship_access: { status: "PENDING" } },
  ]) state.requestAccount(supplier);
  assert.equal(calls.post.length, 0);
  const supplier = Vue.reactive({ id: 93, dropship_access: { status: "REJECT" } });
  state.requestAccount(supplier);
  state.requestAccount(supplier);
  state.requestAccount({ id: 94 });
  assert.equal(calls.post.length, 1);
  assert.equal(calls.post[0].url, "/shops/42/reseller/access");
  assert.deepEqual(normalize(calls.post[0].payload), { shop_id: 93 });
  calls.post[0].resolve({ data: { error: true, error_msg: "Fixture rejected" } });
  await settle();
  assert.equal(supplier.dropship_access.status, "REJECT");
  assert.equal(state.busy_request, null);
  assert.equal(calls.success.length, 0);
  state.requestAccount(supplier);
  calls.post[1].reject(new Error("Fixture offline"));
  await settle();
  assert.equal(supplier.dropship_access.status, "REJECT");
  assert.equal(state.busy_request, null);
  state.requestAccount(supplier);
  calls.post[2].resolve({ data: { error: false, request: { status: "PENDING", id: 501 } } });
  await settle();
  assert.deepEqual(normalize(supplier.dropship_access), { status: "PENDING", id: 501 });
  assert.equal(calls.success.length, 1);
  assert.equal(state.busy_request, null);
  assert.deepEqual(calls.selected, []);
});

test("compiled inline copy and access actions do not open the supplier row", async (t) => {
  const { calls, response, host } = fixture(t, { render: true });
  await response(0, [{ id: 91, name: "fixture-supplier", title: "Fixture supplier", countries: ["US"] }]);
  const row = descendants(host).find((element) => element.tag === "tr");
  assert.ok(row);
  const click = (element) => {
    let stopped = false;
    const event = { stopPropagation: () => { stopped = true; }, preventDefault() {} };
    for (let current = element; current && !stopped; current = current.parent) {
      const handlers = current.props.onClick;
      for (const handler of Array.isArray(handlers) ? handlers : handlers ? [handlers] : []) handler(event);
    }
  };
  const handle = descendants(row).find((element) => element.copyValue != null);
  assert.ok(handle, "The complete supplier handle retains inline v-copy");
  assert.match(String(handle.copyValue), /fixture-supplier/);
  click(handle);
  assert.deepEqual(calls.selected, []);
  const countryHelp = descendants(row).find((element) => String(element.props.class).includes("__country-help"));
  assert.ok(countryHelp);
  click(countryHelp);
  assert.deepEqual(calls.selected, []);
  const request = descendants(row).find((element) => element.tag === "button" && text(element).includes("request_access"));
  assert.ok(request);
  click(request);
  assert.equal(calls.post.length, 1);
  assert.deepEqual(calls.selected, []);
  const viewProducts = descendants(row).find((element) => element.tag === "button" && text(element).includes("view_products"));
  click(viewProducts);
  assert.equal(calls.selected.length, 1, "The explicit View products action opens the supplier exactly once");
  calls.selected.length = 0;
  click(row);
  assert.equal(calls.selected.length, 1);
  assert.equal(calls.selected[0].id, 91);
  calls.post[0].resolve({ data: { error: false, request: { status: "PENDING" } } });
  await settle();
});
