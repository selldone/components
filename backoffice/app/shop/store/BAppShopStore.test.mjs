import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";

const repository = new URL("../../../../../../", import.meta.url);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function evaluate(source, globals = {}) {
  const exports = {};
  vm.runInNewContext(transpile(source), { exports, ...globals });
  return exports;
}
const read = relative => readFileSync(new URL(relative, repository), "utf8");
function sourceModule(relative, base = repository) {
  const url = new URL(relative, base);
  return evaluate(readFileSync(url, "utf8"), { require: name => sourceModule(name.endsWith(".ts") ? name : name + ".ts", url) });
}
const { Application } = evaluate(read("@selldone/core-js/models/application/application.model.ts"), { require: name => name });
const dictionaries = Object.fromEntries(["en", "fa"].map(locale => [locale, {
  ...sourceModule(`@selldone/translate/dashboard/${locale}.ts`).default,
  global: sourceModule(`@selldone/translate/global/${locale}.ts`).default,
}]));
const plain = value => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve)); };
const sampleApp = (id, code = `example-${id}`) => ({ id, code, name: `Example app ${id}`, mode: "PUBLIC", icon: null, enable: true });
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function component(relative, globals = {}) {
  const { descriptor, errors } = parse(read(relative));
  assert.deepEqual(errors, []);
  return { descriptor, options: evaluate(descriptor.script.content, globals).default };
}
function stateFor(options, base) {
  const state = Vue.reactive({ ...base, ...options.data?.call(base) });
  for (const [name, method] of Object.entries(options.methods || {})) state[name] = method.bind(state);
  for (const [name, computed] of Object.entries(options.computed || {})) {
    const getter = typeof computed === "function" ? computed : computed.get;
    Object.defineProperty(state, name, { configurable: true, get: () => getter.call(state) });
  }
  const scope = Vue.effectScope();
  scope.run(() => {
    for (const [path, specification] of Object.entries(options.watch || {})) {
      const watcher = typeof specification === "function" ? { handler: specification } : specification;
      const handler = typeof watcher.handler === "string" ? state[watcher.handler] : watcher.handler.bind(state);
      Vue.watch(() => path.split(".").reduce((value, key) => value?.[key], state), handler, watcher);
    }
  });
  return { state, dispose() { options.beforeUnmount?.call(state); scope.stop(); options.unmounted?.call(state); } };
}
function renderElements(descriptor, state) {
  const compiled = compileTemplate({ source: descriptor.template.content, filename: "app-store-test.vue", id: "catalog-test" });
  assert.deepEqual(compiled.errors, []);
  const { render } = evaluate(compiled.code, { require: () => ({ ...Vue, resolveComponent: name => ({ name }), withDirectives: (node, directives) => Object.assign(node, { testDirectives: directives }) }) });
  const elements = [];
  const visit = node => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    elements.push({ ...node, type: typeof node.type === "object" ? node.type.name : node.type });
    if (Array.isArray(node.children)) visit(node.children);
    else if (node.children && typeof node.children === "object") for (const slot of Object.values(node.children)) if (typeof slot === "function") visit(slot({ props: {}, item: { raw: state.categories?.[0] || {} }, items: state.apps?.map(raw => ({ raw, id: raw.id })) || [] }));
  };
  visit(render(state, []));
  return elements;
}

function fixture({ category, width = 1280, shop = { id: 7 } } = {}) {
  const requests = [], notices = [], events = [];
  const request = (method, url, payload) => { const value = { method, url, payload, ...deferred() }; requests.push(value); return value.promise; };
  const API = {
    GET_APPSTORE_LIST: id => `/synthetic/shops/${id}/catalog`,
    GET_SHOP_APP_INFO: (id, code) => `/synthetic/shops/${id}/apps/${code}`,
    POST_ADD_ENTERPRISE_APP: id => `/synthetic/shops/${id}/enterprise`,
  };
  const loaded = component("@selldone/components-vue/backoffice/app/shop/store/BAppShopStore.vue", {
    require(name) {
      if (name === "vue") return Vue;
      if (name === "@selldone/core-js") return { Application };
      if (name.includes("NotificationService")) return { default: {
        showSuccessAlert: () => notices.push("success"), showErrorAlert: () => notices.push("error"), showLaravelError: () => notices.push("error"),
      } };
      if (name.endsWith(".vue") || name === "@lucide/vue") return { default: {} };
      assert.fail(`Unexpected Store dependency: ${name}`);
    },
    window: { API },
    axios: { get: (url, params) => request("GET", url, params), post: (url, payload) => request("POST", url, payload) },
    fetch: () => assert.fail("Only deferred local request fixtures are allowed"),
  });
  const display = Vue.reactive({ width, mdAndDown: width < 1280, smAndDown: width < 960, mdAndUp: width >= 960, smAndUp: width >= 600, xs: width < 600 });
  const base = {
    shop, active: true,
    $route: { params: { shop_id: 999 }, query: { category } },
    $vuetify: { display },
    $emit: (...args) => events.push(args),
    $nextTick: Vue.nextTick,
    $t: (key, values = {}) => {
      const text = key.split(".").reduce((value, part) => value?.[part], dictionaries.en);
      return typeof text === "string" ? text.replace(/\{([^}]+)\}/g, (_, name) => String(values[name] ?? name)) : key;
    },
  };
  const bound = stateFor(loaded.options, base);
  loaded.options.created?.call(bound.state);
  return { ...bound, ...loaded, requests, notices, events, display };
}

async function nativeOptions(f, page = 1, sortBy = []) {
  const iterator = renderElements(f.descriptor, f.state).find(node => node.type === "v-data-iterator");
  iterator.props["onUpdate:page"](page);
  iterator.props["onUpdate:options"]({ page, itemsPerPage: f.state.itemsPerPage, sortBy, search: f.state.search });
  await settle();
}
async function resolve(request, data) { request.resolve({ data }); await settle(); }

test("missing and replaced shop context cannot render controls or establish an empty catalog", async () => {
  const f = fixture({ shop: null });
  f.state.fetchAppsList(1);
  assert.equal(f.requests.length, 0);
  assert.equal(renderElements(f.descriptor, f.state).some(node => node.type === "v-container"), false);
  assert.equal(f.state.emptyStateLoaded, false);
  f.state.shop = { id: 7 };
  await settle();
  assert.equal(f.requests.length, 1);
  await resolve(f.requests[0], { apps: [], total: 0 });
  assert.equal(f.state.emptyStateLoaded, true);
  f.state.shop = null;
  await settle();
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.emptyStateLoaded, false);
  assert.equal(f.state.apps.length, 0);
  f.dispose();
});

test("category, native pagination and responsive limits retain the server request contract", async () => {
  const category = Object.values(Application.ApplicationCategories)[0].code;
  const f = fixture({ category });
  await nativeOptions(f);
  assert.equal(f.requests.length, 1, "Initial category and iterator options must share one pending read");
  assert.equal(f.requests[0].url, "/synthetic/shops/7/catalog");
  assert.deepEqual(plain(f.requests[0].payload.params), { offset: 0, limit: 18, sortDesc: false, search: "", categories: [category] });
  await resolve(f.requests[0], { apps: Array.from({ length: 18 }, (_, index) => sampleApp(index + 1)), total: 43 });
  assert.equal(f.state.pageCount, 3);
  assert.equal(f.state.emptyStateLoaded, true);
  assert.equal(f.state.rangeStart, 1);
  assert.equal(f.state.rangeEnd, 18);
  await nativeOptions(f, 2, [{ key: "name", order: "desc" }]);
  assert.equal(f.requests[1].payload.params.offset, 18);
  assert.equal(f.requests[1].payload.params.sortBy, "name");
  assert.equal(f.requests[1].payload.params.sortDesc, true);
  assert.equal(f.state.apps[0].id, 1, "Cached cards remain readable during page refresh");
  await resolve(f.requests[1], { apps: [sampleApp(2)], total: 43 });
  for (const [width, limit] of [[640, 12], [320, 6]]) {
    f.display.width = width;
    await nativeOptions(f, 1);
    assert.equal(f.requests.at(-1).payload.params.limit, limit);
    await resolve(f.requests.at(-1), { apps: [sampleApp(3)], total: 43 });
    assert.equal(f.state.pageCount, Math.ceil(43 / limit));
  }
  f.state.selected_category = null;
  await settle();
  assert.equal(f.state.page, 1);
  assert.equal(f.state.apps.length, 0);
  assert.deepEqual(f.events.at(-1), ["select", null]);
  assert.equal(f.requests.at(-1).payload.params.categories, null);
  await resolve(f.requests.at(-1), { apps: [], total: 0 });
  assert.equal(f.state.emptyStateLoaded, true);
  assert.equal(f.state.rangeStart, 0);
  assert.equal(f.state.rangeEnd, 0);
  f.dispose();
});

test("new category/scope reads replace stale requests and failure keeps a real retry state", async () => {
  const f = fixture();
  await nativeOptions(f);
  const first = f.requests[0];
  f.state.selected_category = Object.values(Application.ApplicationCategories)[1].code;
  await settle();
  const second = f.requests.at(-1);
  assert.notEqual(first, second);
  await resolve(first, { apps: [sampleApp(100)], total: 1 });
  assert.equal(f.state.apps.length, 0);
  assert.equal(f.state.busy, true);
  await resolve(second, { apps: [sampleApp(2)], total: 1 });
  assert.equal(f.state.apps[0].id, 2);
  assert.equal(f.state.busy, false);
  f.state.shop = { id: 8 };
  await settle();
  assert.equal(f.state.apps.length, 0);
  assert.equal(f.requests.at(-1).url, "/synthetic/shops/8/catalog");
  f.requests.at(-1).reject(new Error("Synthetic catalog failure"));
  await settle();
  assert.equal(f.state.list_error, true);
  assert.equal(f.state.emptyStateLoaded, false);
  assert.equal(f.state.busy, false);
  const retry = renderElements(f.descriptor, f.state).find(node => node.type === "v-btn" && node.props?.onClick && Vue.normalizeClass(node.props.class).includes("sd-modern-button") && node.props.variant === "outlined");
  assert.ok(retry, "Failed reads retain the actual Retry action");
  retry.props.onClick();
  await settle();
  assert.equal(f.state.list_error, false);
  await resolve(f.requests.at(-1), { apps: [], total: 0 });
  assert.equal(f.state.emptyStateLoaded, true);
  f.dispose();
});

test("details use the owning shop and reject older selection, hidden and unmounted responses", async () => {
  const f = fixture();
  await nativeOptions(f);
  await resolve(f.requests[0], { apps: [sampleApp(1), sampleApp(2)], total: 2 });
  f.state.editPluginDialog(sampleApp(1));
  const older = f.requests.at(-1);
  f.state.editPluginDialog(sampleApp(2));
  const current = f.requests.at(-1);
  assert.equal(current.url, "/synthetic/shops/7/apps/example-2");
  await resolve(older, { app: sampleApp(1), shop_app: null });
  assert.equal(f.state.app, null);
  assert.equal(f.state.busy_fetch_id, 2);
  const shopApp = { id: 12, app_id: 2, shop_id: 7, enable: true };
  await resolve(current, { app: sampleApp(2), shop_app: shopApp });
  assert.equal(f.state.dialog_app_edit, true);
  const dialog = renderElements(f.descriptor, f.state).find(node => node.type === "b-app-config-dialog");
  assert.deepEqual(plain(dialog.props.app), sampleApp(2));
  assert.equal(dialog.props.shop.id, 7);
  assert.deepEqual(plain(dialog.props["shop-app"]), shopApp);
  dialog.props["onUpdate:shopApp"](null);
  assert.equal(f.state.shop_app, null);
  dialog.props["onUpdate:modelValue"](false);
  assert.equal(f.state.dialog_app_edit, false);
  f.state.editPluginDialog(sampleApp(1));
  const hidden = f.requests.at(-1);
  f.state.active = false;
  await settle();
  await resolve(hidden, { app: sampleApp(1), shop_app: null });
  assert.equal(f.state.dialog_app_edit, false);
  assert.equal(f.state.app, null);
  const count = f.requests.length;
  f.state.editPluginDialog(sampleApp(1));
  assert.equal(f.requests.length, count);
  f.state.active = true;
  await settle();
  f.state.editPluginDialog(sampleApp(2));
  const unmounted = f.requests.at(-1);
  f.dispose();
  await resolve(unmounted, { app: sampleApp(2), shop_app: null });
  assert.equal(f.state.app, null);
});

test("failed target pages never relabel cached rows and can retry the same authorized page", async () => {
  const f = fixture();
  await nativeOptions(f);
  await resolve(f.requests[0], { apps: Array.from({ length: 18 }, (_, index) => sampleApp(index + 1)), total: 43 });
  await nativeOptions(f, 2);
  assert.equal(f.state.rangeStart, 1);
  assert.equal(f.state.rangeEnd, 18);
  f.requests.at(-1).reject(new Error("Synthetic second-page failure"));
  await settle();
  assert.equal(f.state.apps[0].id, 1);
  assert.equal(f.state.list_error, true);
  const iterator = renderElements(f.descriptor, f.state).find(node => node.type === "v-data-iterator");
  assert.equal(iterator.testDirectives[0][1], false, "The failed page must not present cached rows as target-page results");
  f.state.fetchAppsList(f.state.page, null, false);
  await resolve(f.requests.at(-1), { apps: Array.from({ length: 18 }, (_, index) => sampleApp(index + 19)), total: 43 });
  assert.equal(f.state.rangeStart, 19);
  assert.equal(f.state.rangeEnd, 36);
  assert.equal(f.state.list_error, false);
  f.dispose();
});

test("enterprise access validates and locks locally, preserves failure drafts and clears every close", async () => {
  const f = fixture();
  await nativeOptions(f);
  await resolve(f.requests[0], { apps: [sampleApp(1)], total: 1 });
  f.state.selected_category = Object.values(Application.ApplicationCategories)[0].code;
  await settle();
  await resolve(f.requests.at(-1), { apps: [sampleApp(1)], total: 1 });
  const initialCount = f.requests.length;
  f.state.show_add_enterprise = true;
  f.state.credential = "   ";
  f.state.addCredential();
  assert.equal(f.requests.length, initialCount);
  assert.equal(f.state.busy_add_credential, false);
  f.state.credential = "synthetic-enterprise-credential";
  const input = renderElements(f.descriptor, f.state).find(node => node.type === "v-text-field");
  assert.equal(input.props.type, "password");
  assert.equal(input.props.autocomplete, "off");
  f.state.addCredential();
  const first = f.requests.at(-1);
  assert.equal(first.url, "/synthetic/shops/7/enterprise");
  assert.deepEqual(Object.keys(first.payload), ["credential"]);
  assert.equal(f.state.busy_add_credential, true);
  const pending = renderElements(f.descriptor, f.state);
  assert.equal(pending.find(node => node.type === "v-dialog").props.persistent, true);
  assert.equal(pending.find(node => node.type === "v-text-field").props.disabled, true);
  assert.equal(pending.find(node => node.type === "v-btn" && node.props?.type === "submit").props.loading, true);
  f.state.addCredential();
  assert.equal(f.requests.at(-1), first, "A duplicate submit must not create another request");
  await resolve(first, { error: true, error_msg: "Synthetic credential rejection" });
  assert.equal(f.state.show_add_enterprise, true);
  assert.equal(f.state.credential, "synthetic-enterprise-credential");
  assert.equal(f.state.busy_add_credential, false);
  f.state.addCredential();
  f.requests.at(-1).reject(new Error("Synthetic network failure"));
  await settle();
  assert.equal(f.state.credential, "synthetic-enterprise-credential");
  assert.equal(f.state.show_add_enterprise, true);
  assert.equal(f.state.busy_add_credential, false);
  f.state.addCredential();
  await resolve(f.requests.at(-1), { error: false, app: { ...sampleApp(2), mode: "ENTERPRISE" } });
  assert.equal(f.state.credential, "");
  assert.equal(f.state.show_add_enterprise, false);
  assert.equal(f.state.selected_category, undefined);
  assert.equal(f.state.page, 1);
  assert.equal(f.requests.at(-1).method, "GET");
  assert.equal(f.requests.at(-1).payload.params.categories, null);
  assert.equal(f.requests.at(-1).payload.params.offset, 0);
  const authorized = Array.from({ length: 7 }, (_, index) => ({ ...sampleApp(index + 1), mode: index === 1 ? "ENTERPRISE" : "PUBLIC" }));
  await resolve(f.requests.at(-1), { apps: authorized, total: 7 });
  assert.deepEqual(plain(f.state.apps), authorized);
  assert.equal(f.state.totalItems, 7, "Membership and totals come from the authorized catalog response");
  f.state.show_add_enterprise = true;
  f.state.credential = "synthetic-replacement";
  f.state.addCredential();
  await resolve(f.requests.at(-1), { error: false, app: { ...sampleApp(2), mode: "ENTERPRISE" } });
  await resolve(f.requests.at(-1), { apps: authorized, total: 7 });
  assert.equal(f.state.totalItems, 7);
  assert.ok(f.requests.filter(request => request.method === "POST").every(request => request.url.endsWith("/enterprise")), "Granting access must not install an app");
  f.state.show_add_enterprise = true;
  await settle();
  f.state.credential = "synthetic-cancelled";
  f.state.show_add_enterprise = false;
  await settle();
  assert.equal(f.state.credential, "");
  f.state.show_add_enterprise = true;
  f.state.credential = "synthetic-old-scope";
  f.state.addCredential();
  const stale = f.requests.at(-1);
  f.state.shop = { id: 8 };
  await settle();
  await resolve(stale, { error: false, app: sampleApp(99) });
  assert.equal(f.state.credential, "");
  assert.equal(f.state.apps.some(app => app.id === 99), false);
  f.state.active = false;
  await settle();
  f.state.credential = "synthetic-hidden";
  const count = f.requests.length;
  f.state.addCredential();
  assert.equal(f.requests.length, count);
  f.dispose();
  assert.equal(f.state.credential, "");
});

test("the real detail sheet keeps app/shop context, model updates and close forwarding", async () => {
  const events = [];
  const loaded = component("@selldone/components-vue/backoffice/app/config/dialog/BAppConfigDialog.vue", { require: () => ({ default: {} }) });
  const app = sampleApp(3), shopApp = { id: 42, app_id: 3, shop_id: 7, enable: true };
  const f = stateFor(loaded.options, { app, shopApp, shop: { id: 7 }, modelValue: true, $vuetify: { display: { mdAndDown: true } }, $emit: (...event) => events.push(event) });
  loaded.options.created.call(f.state);
  await settle();
  const elements = renderElements(loaded.descriptor, f.state);
  const sheet = elements.find(node => node.type === "v-bottom-sheet");
  const detail = elements.find(node => node.type === "b-app-detail");
  assert.equal(sheet.props.modelValue, true);
  assert.equal(sheet.props.fullscreen, true);
  assert.deepEqual(plain(detail.props.app), app);
  assert.deepEqual(plain(detail.props["shop-app"]), shopApp);
  assert.equal(detail.props["shop-id"], 7);
  detail.props["onUpdate:shopApp"](null);
  assert.deepEqual(events.at(-1), ["update:shopApp", null]);
  detail.props.onClose();
  await settle();
  assert.equal(f.state.value_local, false);
  assert.deepEqual(events.at(-1), ["update:modelValue", false]);
  f.state.modelValue = false;
  await settle();
  f.state.modelValue = true;
  await settle();
  assert.equal(f.state.value_local, true);
  sheet.props["onUpdate:modelValue"](false);
  await settle();
  assert.deepEqual(events.at(-1), ["update:modelValue", false]);
  f.dispose();
});
