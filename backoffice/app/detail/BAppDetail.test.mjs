import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import numeral from "numeral";

const repository = new URL("../../../../../", import.meta.url);
const detailFile = "@selldone/components-vue/backoffice/app/detail/BAppDetail.vue";
const read = path => readFileSync(new URL(path, repository), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await Vue.nextTick(); await new Promise(resolve => setImmediate(resolve)); };
function evaluate(source, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, self: globals.window || {}, ...globals });
  return exports;
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function sourceModule(relative, globals = {}, cache = new Map()) {
  const url = new URL(relative, repository);
  if (cache.has(url.href)) return cache.get(url.href);
  const value = evaluate(readFileSync(url, "utf8"), { ...globals, require: name => {
    if (name.endsWith(".vue") || name === "@lucide/vue") return { default: {} };
    if (name.includes("NotificationService")) return { default: globals.notification };
    if (name === "vue") return Vue;
    if (name === "@selldone/core-js") return { Application };
    const next = name.startsWith("@selldone/") ? new URL(name, repository) : new URL(name, url);
    if (!next.pathname.endsWith(".ts")) next.pathname += ".ts";
    return sourceModule(next.href, globals, cache);
  } });
  cache.set(url.href, value);
  return value;
}
const { Application } = evaluate(read("@selldone/core-js/models/application/application.model.ts"), { require: name => name });
const dictionaries = Object.fromEntries(["en", "fa"].map(locale => [locale, {
  ...sourceModule(`@selldone/translate/dashboard/${locale}.ts`).default,
  global: sourceModule(`@selldone/translate/global/${locale}.ts`).default,
}]));
const sampleApp = (code = "example-insights") => ({
  id: 19, code, name: "Example Insights", icon: null, logo: null, category: Object.keys(Application.ApplicationCategories)[0],
  description: "Synthetic app description", note: "", rate: 4.5, rate_count: 2, installs: 23,
  updated_at: "2026-11-02T00:00:00Z", company: { name: "Example developer", email: "example@example.invalid", address: "Example address" },
  public: [{ name: "property", title: "Property ID" }], private: [{ name: "connection", title: "Private connection" }],
  production: { variables: [{ key: "label", title: "Reporting label" }] }, images: [], permissions: ["read-store"], edit_access: true,
});
const sampleShopApp = () => ({ id: 29, shop_id: 7, app_id: 19, enable: false, public: { property: "example-property" }, private: { connection: "synthetic-private-draft" }, variables: { label: "Example label" } });

function renderedNodes(descriptor, state) {
  const compiled = compileTemplate({ source: descriptor.template.content, filename: "detail-contract.vue", id: "detail-test", transformAssetUrls: { includeAbsolute: true } });
  assert.deepEqual(compiled.errors, []);
  const renderer = evaluate(compiled.code, { require: () => ({ ...Vue, resolveComponent: name => ({ name }), withDirectives: (node, directives) => Object.assign(node, { testDirectives: directives }) }) }).render;
  const elements = [];
  const visit = node => {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    elements.push({ ...node, type: typeof node.type === "object" ? node.type.name : node.type });
    if (Array.isArray(node.children)) visit(node.children);
    else if (node.children && typeof node.children === "object") for (const slot of Object.values(node.children)) if (typeof slot === "function") visit(slot({ props: {} }));
  };
  visit(renderer(state, [])); return elements;
}

function fixture({ app = sampleApp(), shopApp = sampleShopApp(), shopId = 7, locale = "en" } = {}) {
  const requests = [], notices = [], events = [], confirmations = [];
  const request = (method, url, payload) => { const value = { method, url, payload, ...deferred() }; requests.push(value); return value.promise; };
  const notification = {
    showSuccessAlert: () => notices.push("success"), showErrorAlert: () => notices.push("error"), showLaravelError: () => notices.push("error"),
    openDangerAlert: (...args) => confirmations.push(args),
  };
  const runtime = {
    notification, window: { API: {
      POST_SET_APP_INFO: (id, code) => `/synthetic/shops/${id}/apps/${code}`,
      DELETE_APP: (id, code) => `/synthetic/shops/${id}/apps/${code}`,
      PUT_SET_REVIEW: (id, code) => `/synthetic/shops/${id}/reviews/${code}`,
    }, CDN: { GET_SHOP_IMAGE_PATH: () => "", GET_USER_AVATAR: () => "" } },
    axios: { post: (url, payload) => request("POST", url, payload), put: (url, payload) => request("PUT", url, payload), delete: url => request("DELETE", url) },
  };
  const { descriptor, errors } = parse(read(detailFile));
  assert.deepEqual(errors, []);
  const options = evaluate(descriptor.script.content, { ...runtime, require: name => {
    if (name.includes("NotificationService")) return { default: notification };
    if (name === "@selldone/core-js") return { Application };
    if (name === "vue") return Vue;
    if (name.endsWith(".vue") || name === "@lucide/vue") return { default: {} };
    return sourceModule(name.endsWith(".ts") ? name : name + ".ts", runtime);
  } }).default;
  // Core is installed in every real caller; optional helpers come only from the component's own real mixins.
  const core = evaluate(read("@selldone/components-vue/mixin/CoreMixin.ts"), { ...runtime, require: () => ({}) }).default;
  const base = {
    app, shopApp, shopId, dark: false, $attrs: {}, $refs: {},
    $route: { name: "ExamplePage", params: {} }, $store: { getters: { getUser: { id: 31 } } },
    $vuetify: { theme: { current: { dark: false } }, locale: { isRtl: locale === "fa" } },
    $emit: (...event) => events.push(event), $nextTick: Vue.nextTick,
    numeralFormat: (value, format) => numeral(value).format(format),
    $t: (key, values = {}) => {
      const value = key.split(".").reduce((record, part) => record?.[part], dictionaries[locale]);
      return typeof value === "string" ? value.replace(/\{([^}]+)\}/g, (_, name) => String(values[name] ?? name)) : key;
    },
  };
  const state = Vue.reactive({ ...base, ...options.data?.call(base) });
  for (const owner of [core, ...(options.mixins || []), options]) {
    for (const [name, method] of Object.entries(owner.methods || {})) state[name] = method.bind(state);
    for (const [name, specification] of Object.entries(owner.computed || {})) {
      const getter = typeof specification === "function" ? specification : specification.get;
      Object.defineProperty(state, name, { configurable: true, get: () => getter.call(state) });
    }
  }
  const scope = Vue.effectScope();
  scope.run(() => { for (const [path, spec] of Object.entries(options.watch || {})) {
    const watcher = typeof spec === "function" ? { handler: spec } : spec;
    Vue.watch(() => path.split(".").reduce((value, key) => value?.[key], state), typeof watcher.handler === "string" ? state[watcher.handler] : watcher.handler.bind(state), watcher);
  } });
  options.created?.call(state);
  const render = () => renderedNodes(descriptor, state);
  return { state, options, render, requests, notices, events, confirmations, dispose() { options.beforeUnmount?.call(state); scope.stop(); options.unmounted?.call(state); } };
}
async function resolve(request, data) { request.resolve({ data }); await settle(); }

test("install/save retains exact app context, four config maps and independent completion/error state", async () => {
  const f = fixture();
  assert.deepEqual(plain(f.state.public), { property: "example-property" });
  assert.deepEqual(plain(f.state.private), { connection: "synthetic-private-draft" });
  assert.equal(f.state.enable, false);
  f.state.setPlugin();
  assert.equal(f.requests[0].url, "/synthetic/shops/7/apps/example-insights");
  assert.deepEqual(plain(f.requests[0].payload), { private: { connection: "synthetic-private-draft" }, public: { property: "example-property" }, enable: false, variables: { label: "Example label" } });
  assert.equal(f.state.busy_save, true);
  await resolve(f.requests[0], { error: false, shop_app: { id: 29 } });
  assert.deepEqual(plain(f.events.at(-1)), ["update:shopApp", { id: 29, public: {}, private: {}, variables: {} }]);
  assert.equal(f.state.busy_save, false);
  f.state.setPlugin(); await resolve(f.requests.at(-1), { error: true, error_msg: "Synthetic rejection" });
  assert.equal(f.state.public.property, "example-property"); assert.equal(f.state.busy_save, false);
  f.state.setPlugin(); f.requests.at(-1).reject(new Error("Synthetic failure")); await settle();
  assert.equal(f.state.busy_save, false); assert.equal(f.notices.at(-1), "error");
  f.dispose();
});

test("uninstall requests require real confirmation and retain success events and error recovery", async () => {
  const f = fixture(); f.state.deleteApp();
  assert.equal(f.requests.length, 0); assert.equal(f.state.delete_mode, true); assert.equal(typeof f.state.confirm_delete, "function");
  const cancelledConfirmation = f.state.confirm_delete;
  await settle();
  f.state.delete_mode = false; await settle(); assert.equal(f.state.confirm_delete, null); assert.equal(f.requests.length, 0);
  cancelledConfirmation(); assert.equal(f.requests.length, 0, "A captured cancelled confirmation cannot delete the app");
  f.state.deleteApp(); f.state.confirm_delete(); assert.equal(f.requests[0].method, "DELETE");
  assert.equal(f.requests[0].url, "/synthetic/shops/7/apps/example-insights");
  await resolve(f.requests[0], { error: true, error_msg: "Synthetic rejection" });
  assert.equal(f.state.busy_delete, false); assert.equal(f.events.length, 0);
  f.state.deleteApp(); f.state.confirm_delete(); await resolve(f.requests.at(-1), { error: false, id: 29 });
  assert.deepEqual(plain(f.events.slice(-2)), [["delete", 29], ["update:shopApp", null]]);
  assert.equal(f.state.busy_delete, false); f.state.close(); assert.deepEqual(f.events.at(-1), ["close"]); f.dispose();
});

test("reviews retain existing drafts, payload, returned review and failure recovery", async () => {
  const app = { ...sampleApp(), my_review: { rate: 4, message: "Existing example review" } };
  const f = fixture({ app }); assert.equal(f.state.user_rate, 4); assert.equal(f.state.user_message, app.my_review.message);
  f.state.rate_mode = true; f.state.user_rate = 5; f.state.user_message = "Updated example review"; f.state.saveAppRate();
  assert.equal(f.requests[0].url, "/synthetic/shops/7/reviews/example-insights");
  assert.deepEqual(plain(f.requests[0].payload), { rate: 5, message: "Updated example review" });
  await resolve(f.requests[0], { error: true, error_msg: "Synthetic rejection" });
  assert.equal(f.state.rate_mode, true); assert.equal(f.state.busy_review, false);
  f.state.saveAppRate(); await resolve(f.requests.at(-1), { error: false, app_review: { rate: 5, message: "Updated example review" } });
  assert.deepEqual(plain(f.state.app.my_review), { rate: 5, message: "Updated example review" });
  assert.equal(f.state.rate_mode, false); assert.equal(f.state.busy_review, false); f.dispose();
  const fractional = fixture({ app: { ...sampleApp(), my_review: { rate: 4.5, message: null } } });
  const controls = fractional.render();
  assert.ok(controls.some(node => node.type === "option" && node.props.value === 4.5), "Existing fractional ratings remain selectable without changing the saved value");
  assert.equal(Number(controls.find(node => node.type === "textarea").props.maxlength), 640);
  assert.equal(fractional.state.user_message, null);
  fractional.state.saveAppRate(); assert.deepEqual(plain(fractional.requests[0].payload), { rate: 4.5, message: null });
  await resolve(fractional.requests[0], { error: false, app_review: { rate: 4.5, message: null } }); fractional.dispose();
});

test("schema fields, false private gate, native read-only controls and real Open app route remain reachable", () => {
  const f = fixture({ app: { ...sampleApp(), edit_access: false } });
  const nodes = f.render(); const fields = nodes.filter(n => n.type === "v-text-field");
  assert.ok(fields.some(n => n.props.label === "Property ID"));
  assert.equal(fields.find(n => n.props.label === "Property ID").props.disabled, true);
  assert.equal(fields.some(n => n.props.label === "Private connection"), false);
  assert.equal(fields.find(n => n.props.label === "Reporting label")?.props.disabled, true);
  assert.equal(nodes.find(n => n.type === "input" && n.props.type === "checkbox")?.props.disabled, true);
  assert.ok(nodes.some(n => n.type === "v-btn" && n.props.disabled && n.props.onClick));
  const open = nodes.find(n => n.type === "v-btn" && n.props.to);
  assert.deepEqual(plain(open.props.to), { name: "BPageApplication", params: { shop_id: 7, app_code: "example-insights" } });
  assert.equal(nodes.find(n => n.type === "b-app-comments").props["app-code"], "example-insights");
  assert.equal(nodes.find(n => n.type === "b-app-detail-gallery").props.app, f.state.app);
  f.state.$route = { name: "BPageApplication", params: { app_code: f.state.app.code } };
  assert.equal(f.render().some(n => n.type === "v-btn" && n.props.to), false); f.dispose();
});

test("missing/reset app and shop context clears drafts and cannot render protected config or post", async () => {
  const f = fixture();
  f.state.shopApp = null; await settle();
  assert.deepEqual(plain(f.state.public), {}); assert.deepEqual(plain(f.state.private), {}); assert.deepEqual(plain(f.state.variables), {});
  f.state.shopId = null; f.state.app = null; await settle();
  assert.doesNotThrow(() => f.render()); f.state.setPlugin(); f.state.deleteApp(); f.state.saveAppRate();
  assert.equal(f.requests.length, 0); assert.equal(f.confirmations.length, 0);
  f.state.app = sampleApp("replacement-app"); f.state.shopId = 8; f.state.shopApp = sampleShopApp(); await settle();
  assert.equal(f.state.user_rate, 3); assert.equal(f.state.user_message, "");
  assert.equal(f.render().find(n => n.type === "b-app-comments").props["app-code"], "replacement-app"); f.dispose();
});

test("optional metadata and public browse-only context render without Backoffice helpers", () => {
  for (const locale of ["en", "fa"]) {
    const f = fixture({ app: { ...sampleApp(), company: null, permissions: null, public: null, private: null, production: null, edit_access: false }, shopApp: null, shopId: null, locale });
    assert.doesNotThrow(() => f.render());
    f.state.setPlugin(); f.state.deleteApp(); assert.equal(f.requests.length, 0); assert.equal(f.confirmations.length, 0); f.dispose();
  }
});

test("permission loss, scope changes and unmount invalidate protected drafts, confirmations and stale responses", async () => {
  const f = fixture();
  f.state.setPlugin(); f.state.setPlugin(); assert.equal(f.requests.length, 1, "Saving has a real duplicate-request guard");
  const oldSave = f.requests[0];
  f.state.shopApp = null; f.state.shopId = 8; await settle();
  await resolve(oldSave, { error: false, shop_app: { id: 99, private: { connection: "old-scope" } } });
  assert.equal(f.events.some(event => event[0] === "update:shopApp"), false);
  assert.deepEqual(plain(f.state.private), {});
  f.state.shopApp = sampleShopApp(); await settle(); f.state.deleteApp();
  const confirm = f.state.confirm_delete;
  f.state.app = { ...sampleApp("replacement-app"), edit_access: false }; await settle();
  confirm(); assert.equal(f.requests.length, 1, "A stale confirmation cannot delete the current or previous app");
  assert.deepEqual(plain(f.state.private), {});
  f.state.setPlugin(); f.state.deleteApp(); assert.equal(f.requests.length, 1); assert.equal(f.state.delete_mode, false); assert.equal(f.state.confirm_delete, null);
  f.state.public.property = "Unsaved public draft"; f.state.variables.label = "Unsaved variable draft";
  f.state.app.edit_access = true; await settle();
  assert.deepEqual(plain(f.state.private), { connection: "synthetic-private-draft" });
  assert.notEqual(f.state.private, f.state.shopApp.private, "Regrant restores a separate draft, not the prop object");
  assert.equal(f.state.public.property, "Unsaved public draft"); assert.equal(f.state.variables.label, "Unsaved variable draft");
  f.state.app.edit_access = false; await settle(); assert.deepEqual(plain(f.state.private), {});
  f.state.saveAppRate(); assert.equal(f.requests.at(-1).method, "PUT", "Review access is independent of configuration edit_access");
  const oldReview = f.requests.at(-1); f.dispose();
  await resolve(oldReview, { error: false, app_review: { rate: 1, message: "old response" } });
  assert.equal(f.state.app.my_review, undefined);
});

test("actual native comments pagination loads each complete ten-comment page", async () => {
  const requests = [], notices = [];
  const { descriptor, errors } = parse(read("@selldone/components-vue/backoffice/app/comments/BAppComments.vue")); assert.deepEqual(errors, []);
  const notification = { showErrorAlert: () => notices.push("error"), showLaravelError: () => notices.push("error") };
  const runtime = { notification, window: { GAPI: { GET_APP_COMMENTS: code => `/synthetic/comments/${code}` } }, axios: { get: (url, payload) => { const req = { url, payload, ...deferred() }; requests.push(req); return req.promise; } } };
  const options = evaluate(descriptor.script.content, { ...runtime, require: name => name.includes("NotificationService") ? { default: notification } : sourceModule(name, runtime) }).default;
  const state = Vue.reactive({ ...options.data(), appCode: "example-insights", numeralFormat: value => String(value), $t: value => value });
  for (const [name, method] of Object.entries(options.methods)) state[name] = method.bind(state);
  Object.defineProperty(state, "pageCount", { get: () => options.computed.pageCount.call(state) });
  options.created.call(state); await resolve(requests[0], { comments: [], total: 21 });
  const compiled = compileTemplate({ source: descriptor.template.content, filename: "BAppComments.vue", id: "comments-test" }); assert.deepEqual(compiled.errors, []);
  const renderer = evaluate(compiled.code, { require: () => ({ ...Vue, resolveComponent: name => name }) }).render;
  const tree = renderer(state, []);
  const pagination = tree.children.find(node => node?.type === "v-pagination"); assert.ok(pagination);
  const selectPage = async page => { for (const handler of [].concat(pagination.props["onUpdate:modelValue"])) handler(page); await settle(); };
  await selectPage(2);
  await settle(); assert.equal(state.page, 2); assert.equal(requests.length, 2);
  assert.equal(requests[1].url, "/synthetic/comments/example-insights"); assert.deepEqual(plain(requests[1].payload), { params: { offset: 10, limit: 10 } });
  await selectPage(3); assert.deepEqual(plain(requests[2].payload), { params: { offset: 20, limit: 10 } });
  await resolve(requests[2], { comments: [{ id: 21 }], total: 21 });
  await resolve(requests[1], { comments: [{ id: 11 }], total: 21 });
  assert.equal(state.page, 3); assert.equal(state.comments[0].id, 21); assert.equal(state.busy, false);
  await selectPage(2); requests.at(-1).reject(new Error("Synthetic page failure")); await settle();
  assert.equal(state.page, 3, "Failed pages retain a truthful page label for the cached comments"); assert.equal(state.comments[0].id, 21);
  await selectPage(2); await resolve(requests.at(-1), { comments: [{ id: 11 }], total: 21 }); assert.equal(state.page, 2); assert.equal(state.comments[0].id, 11);
  await selectPage(3); options.beforeUnmount.call(state); requests.at(-1).reject(new Error("Synthetic stale failure")); await settle();
  assert.equal(state.comments[0].id, 11); assert.deepEqual(notices, ["error"]);
});

test("actual public caller gates app/shop readiness, rejects stale reads and recovers the current scope", async () => {
  const requests = [], events = [], notices = [];
  const { descriptor, errors } = parse(read("src/Applications/Selldone/pages/app-store/pages/AppStore_App.vue")); assert.deepEqual(errors, []);
  const options = evaluate(descriptor.script.content, {
    require: name => name.includes("NotificationService") ? { default: { showErrorAlert: () => notices.push("error"), showLaravelError: () => notices.push("error") } } : { default: {} },
    window: { API: { GET_SHOP_APP_INFO: (id, code) => `/synthetic/shops/${id}/info/${code}` }, GAPI: { GET_APP_INFO: code => `/synthetic/public/${code}` } },
    axios: { get: url => { const req = { url, ...deferred() }; requests.push(req); return req.promise; } },
  }).default;
  const state = Vue.reactive({ ...options.data(), shop: { id: 7 }, $route: { params: { app_code: "example-a" } }, $emit: (...event) => events.push(event), $t: value => value, $router: { go() {} } });
  for (const [name, method] of Object.entries(options.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(options.computed)) Object.defineProperty(state, name, { configurable: true, get: () => getter.call(state) });
  const scope = Vue.effectScope();
  scope.run(() => { for (const [path, spec] of Object.entries(options.watch || {})) {
    const watcher = typeof spec === "function" ? { handler: spec } : spec;
    Vue.watch(() => path.split(".").reduce((value, key) => value?.[key], state), typeof watcher.handler === "string" ? state[watcher.handler] : watcher.handler.bind(state), watcher);
  } });
  const detail = () => renderedNodes(descriptor, state).find(node => node.type === "b-app-detail");
  options.created.call(state); assert.equal(detail(), undefined); assert.equal(requests[0].url, "/synthetic/shops/7/info/example-a");
  await resolve(requests[0], { error: false, app: sampleApp("example-a"), shop_app: sampleShopApp() });
  assert.equal(detail().props["shop-id"], 7);
  state.shop = { id: 8 }; await settle(); assert.equal(detail(), undefined); assert.equal(state.shop_app, null);
  assert.equal(requests.at(-1).url, "/synthetic/shops/8/info/example-a"); const oldShopRead = requests.at(-1);
  state.$route.params.app_code = "example-b"; await settle(); const current = requests.at(-1); assert.equal(current.url, "/synthetic/shops/8/info/example-b");
  await resolve(oldShopRead, { error: false, app: sampleApp("example-a"), shop_app: sampleShopApp() }); assert.equal(detail(), undefined);
  await resolve(current, { error: false, app: sampleApp("example-b"), shop_app: { ...sampleShopApp(), shop_id: 8 } });
  assert.equal(detail().props.app.code, "example-b"); assert.equal(detail().props["shop-id"], 8); assert.equal(detail().props["shop-app"].shop_id, 8);
  state.shop = null; await settle(); assert.equal(detail(), undefined); assert.equal(requests.at(-1).url, "/synthetic/public/example-b");
  requests.at(-1).reject(new Error("Synthetic current read failure")); await settle(); assert.equal(detail(), undefined); assert.equal(state.fetchError, true);
  const retry = renderedNodes(descriptor, state).find(node => node.type === "v-btn" && node.props.onClick); assert.ok(retry); retry.props.onClick();
  await resolve(requests.at(-1), { error: false, app: { ...sampleApp("example-b"), edit_access: false } });
  assert.equal(detail().props["shop-id"], null); assert.equal(detail().props["shop-app"], null); assert.equal(state.busy, false);
  state.shop = { id: 9 }; await settle(); const unmounted = requests.at(-1); options.beforeUnmount.call(state); scope.stop();
  await resolve(unmounted, { error: false, app: sampleApp("example-b"), shop_app: sampleShopApp() }); assert.equal(state.app, null);
  assert.ok(events.some(event => event[0] === "update:parentBusy" && event[1] === false)); assert.deepEqual(notices, ["error"]);
});
