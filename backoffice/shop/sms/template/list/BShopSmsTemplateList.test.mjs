import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = new URL("../../../../../../../", import.meta.url);
const require = createRequire(new URL("package.json", root));
const { JSDOM } = require("jsdom");
const { build } = require("esbuild");
const ts = require("typescript");
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const browser = new JSDOM("<!doctype html><html><body></body></html>");
for (const key of ["window", "document", "Element", "HTMLElement", "SVGElement", "Node"])
  globalThis[key] = browser.window[key];
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const observers = [];
globalThis.ResizeObserver = class {
  constructor(callback) { this.callback = callback; this.targets = new Set(); observers.push(this); }
  observe(target) { this.targets.add(target); }
  unobserve(target) { this.targets.delete(target); }
  disconnect() { this.targets.clear(); this.disconnected = true; }
};
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;
const Vue = require("vue");
const read = path => readFileSync(new URL(path, root), "utf8");
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const realm = vm.createContext({ window, document, console, Date, Intl, ResizeObserver, setTimeout, clearTimeout });
function evaluate(source, imports = () => ({}), globals = {}) {
  const exports = {};
  const output = ts.transpileModule(source, { reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  assert.deepEqual(output.diagnostics, []);
  Object.assign(realm, { moduleExports: exports, moduleImports: imports }, globals);
  vm.runInContext(`(function(exports, require) { ${output.outputText}\n})(moduleExports, moduleImports)`, realm);
  return exports;
}

const { Calendar } = evaluate(read("@selldone/core-js/enums/language/Calendar.ts"));
const { Language } = evaluate(read("@selldone/core-js/enums/language/Language.ts"), () => ({ Calendar }));
const { DateConverter } = evaluate(read("@selldone/core-js/helper/date/DateConverter.ts"), () => ({ Calendar }));
const DateMixin = evaluate(read("@selldone/components-vue/mixin/date/DateMixin.ts"), () => ({ DateConverter })).default;
const CoreMixin = evaluate(read("@selldone/components-vue/mixin/CoreMixin.ts"), name => {
  if (name.endsWith("/Language")) return { Language };
  return {};
}).default;
evaluate(read("@selldone/core-js/prototypes/StringPrototypes.ts"));

const bundle = await build({
  stdin: { contents: 'export { createVuetify } from "vuetify"; export { VDataTableServer } from "vuetify/components/VDataTable";', resolveDir: fileURLToPath(root) },
  bundle: true, write: false, format: "cjs", platform: "node", loader: { ".css": "empty" }, external: ["vue"], logLevel: "silent",
});
const native = { exports: {} };
vm.runInNewContext(bundle.outputFiles[0].text, { module: native, exports: native.exports, require, window, document,
  Element, HTMLElement, SVGElement, Node, ResizeObserver, console, setTimeout, clearTimeout, requestAnimationFrame, cancelAnimationFrame });
const { createVuetify, VDataTableServer } = native.exports;
const source = readFileSync(new URL("./BShopSmsTemplateList.vue", import.meta.url), "utf8");
const { descriptor, errors } = parse(source);
assert.deepEqual(errors, []);
const compiled = compileTemplate({ source: descriptor.template.content, filename: "BShopSmsTemplateList.vue", id: "sms-list-test",
  transformAssetUrls: { includeAbsolute: true } });
assert.deepEqual(compiled.errors, []);
const render = evaluate(compiled.code, name => name === "vue" ? Vue : { default: "/fixture-asset" }).render;
const catalogs = Object.fromEntries(["dashboard", "global"].map(namespace =>
  [namespace, evaluate(read(`@selldone/translate/${namespace}/en.ts`)).default]));
const translate = (key, values = {}) => {
  const parts = key.split(".");
  const dictionary = catalogs[parts[0] === "global" ? "global" : "dashboard"];
  const message = (parts[0] === "global" ? parts.slice(1) : parts).reduce((value, part) => value?.[part], dictionary);
  assert.equal(typeof message, "string", `Missing translation: ${key}`);
  return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
};
const leaf = Vue.defineComponent({ inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h("div", attrs, [slots.activator?.({ props: {} }), slots.default?.()]) });
const button = Vue.defineComponent({ inheritAttrs: false, props: ["disabled", "loading"],
  setup: (props, { attrs, slots }) => () => Vue.h("button", { ...attrs, disabled: props.disabled || props.loading }, slots.default?.()) });
const dialog = Vue.defineComponent({ props: ["modelValue"], setup: (props, { slots }) => () => props.modelValue ? Vue.h("div", slots.default?.()) : null });
const editor = Vue.defineComponent({ props: ["template"], emits: ["add", "edit", "close"],
  setup: (props, { emit }) => () => Vue.h("div", { "data-editor": props.template?.id ?? "new" }, [
    Vue.h("button", { "data-editor-add": true, onClick: () => emit("add", record({ id: 13 })) }, "Complete fixture add"),
    Vue.h("button", { "data-editor-edit": true, onClick: () => emit("edit", { ...props.template, enable: false }) }, "Complete fixture edit"),
  ]) });
const menu = Vue.defineComponent({ props: ["items", "loading"], setup: props => () => Vue.h("div", { "data-row-actions": true },
  props.items.map(item => Vue.h("button", { disabled: item.disabled || props.loading, onClick: item.click }, item.title))) });
const record = (overrides = {}) => ({ id: 11, code: "paid-en", language: "en", mode: "text", enable: true,
  text: "Your payment was received for order SM-123.", user_id: 7, updated_at: "2026-11-01T12:30:00Z", errors: 3, ...overrides });

async function fixture(t, { modern = true, viewport = 1600, phone = "+12025550123", service = { driver: "kavenegar", enable: true }, verification = false, deleteError = false } = {}) {
  window.innerWidth = viewport;
  window.$language = Language.en;
  window.SERACH_THROTTLE = 0;
  window.CDN = { GET_USER_AVATAR: id => `/fixture-avatar/${id}`, GET_SHOP_IMAGE_PATH: () => "/fixture-shop" };
  window.API = {
    GET_SHOP_SMS_TEMPLATES: id => `/fixture/shops/${id}/templates`,
    POST_SHOP_SMS_TEMPLATE_RESET_ERRORS: (id, template) => `/fixture/shops/${id}/templates/${template}/reset`,
    POST_SHOP_SMS_TEMPLATE_SEND_TEST: (id, template) => `/fixture/shops/${id}/templates/${template}/test`,
    DELETE_SHOP_SMS_TEMPLATE: (id, template) => `/fixture/shops/${id}/templates/${template}`,
  };
  const requests = [], notices = [], failures = [], warnings = [], changed = [];
  const rows = [record(), record({ id: 12, code: "paid-fa", language: "fa", mode: "template", enable: false })];
  const request = (method, url, payload) => {
    requests.push({ method, url, payload });
    return Promise.resolve({ data: method === "GET" ? { templates: rows, total: rows.length } :
      method === "DELETE" ? (deleteError ? { error: true, error_msg: "Fixture deletion rejected" } : { id: rows[0].id }) : { template: { ...rows[0], errors: 0 }, response: {}, request: {} } });
  };
  const notifications = new Proxy({}, { get: (_, key) => (...args) => notices.push({ key, args }) });
  const options = evaluate(descriptor.script.content, name => {
    if (name.endsWith("DateMixin.ts")) return { default: DateMixin };
    if (name.includes("NotificationService")) return { default: notifications };
    if (name.endsWith("/SmsProviders")) return { SmsProviders: [{ driver: "kavenegar", title: "Kavenegar", support_text: true, support_template: true }] };
    if (name === "lodash-es") return { throttle: callback => callback };
    if (name.endsWith("USmartMenu.vue")) return { default: menu };
    if (name.endsWith("BShopSmsTemplateEditor.vue")) return { default: editor };
    if (name.endsWith(".css")) return {};
    if (name.endsWith(".vue") || name === "vue-json-pretty") return { default: leaf };
    throw new Error(`Unexpected list dependency: ${name}`);
  }, { axios: { get: (url, payload) => request("GET", url, payload), post: (url, payload) => request("POST", url, payload),
    delete: url => request("DELETE", url) } }).default;
  const component = { ...options, render };
  const instance = Vue.shallowRef();
  const shop = Vue.reactive({ id: 1, title: "Fixture store", sms_service: service });
  const sms = Vue.reactive({ code: "shop-order-payment", title: "Payment received", verification, sample: "Fixture sample" });
  const app = Vue.createApp({ render: () => Vue.h(component, { ref: instance, modern, hidePreview: true, shop, sms,
    onTemplatesChanged: () => changed.push(true) }) });
  app.use(createVuetify());
  app.mixin(CoreMixin);
  app.config.globalProperties.$t = translate;
  app.config.globalProperties.$store = { getters: { getUser: { id: 7, phone } } };
  app.config.warnHandler = warning => warnings.push(warning);
  app.config.errorHandler = error => failures.push(error);
  app.directive("copy", {});
  app.component("v-data-table-server", VDataTableServer);
  app.component("v-btn", button);
  app.component("v-dialog", dialog);
  for (const match of compiled.code.matchAll(/_resolveComponent\("([^"]+)"\)/g))
    if (!["v-data-table-server", "v-btn", "v-dialog"].includes(match[1]) && !options.components?.[Vue.camelize(Vue.capitalize(match[1]))]) app.component(match[1], leaf);
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  const listObserver = observers.find(observer => observer.targets.has(instance.value.$el));
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(failures, []); assert.deepEqual(warnings, []);
    if (listObserver) assert.equal(listObserver.disconnected, true, "The list releases its observer on unmount"); });
  assert.deepEqual(failures, []);
  assert.deepEqual(warnings, []);
  return { host, requests, notices, shop, sms, rows, changed, get state() { return instance.value; },
    async resize(width) { assert.ok(listObserver, "The modern list observes its own container");
      listObserver.callback([{ target: instance.value.$el, contentRect: { width } }]); await settle(); },
    action(label) { return [...host.querySelectorAll("[data-row-actions] button")].find(node => node.textContent.startsWith(label)); },
  };
}

test("native SMS table reflows from its own container without fetching again", async t => {
  const f = await fixture(t);
  await f.resize(900);
  assert.equal(f.host.querySelector("tbody .v-data-table__td-title"), null);
  assert.equal(f.host.querySelectorAll("tbody tr").length, 2);
  const reads = f.requests.length;
  for (const width of [620, 360]) {
    await f.resize(width);
    assert.ok(f.host.querySelector("tbody .v-data-table__td-title"), "A narrow widget reflows despite a wide viewport");
    const row = f.host.querySelector("tbody tr");
    for (const key of ["shop_sms.modern.template", "global.commons.language", "global.commons.message", "shop_sms.modern.status"])
      assert.ok(row.textContent.includes(translate(key)), `Native mobile caption: ${key}`);
    assert.match(row.textContent, /paid-en/);
    assert.match(row.textContent, /Your payment was received/);
    assert.match(row.textContent, /Enabled/);
    assert.ok(row.querySelector('img[src="/fixture-avatar/7"]'), "The real Core helper retains the last-editor avatar");
    const otherRow = f.host.querySelectorAll("tbody tr")[1];
    assert.match(otherRow.textContent, /paid-fa/);
    assert.match(otherRow.textContent, /Disabled/);
    assert.equal(row.querySelectorAll("[data-row-actions] button").length, 4);
  }
  await f.resize(900);
  assert.equal(f.host.querySelector("tbody .v-data-table__td-title"), null);
  assert.equal(f.requests.length, reads, "Layout changes must not repeat the template request");
});

test("legacy table keeps the native viewport breakpoint", async t => {
  const f = await fixture(t, { modern: false, viewport: 500 });
  assert.ok(f.host.querySelector("tbody .v-data-table__td-title"));
  window.innerWidth = 1600; window.dispatchEvent(new window.Event("resize")); await settle();
  assert.equal(f.host.querySelector("tbody .v-data-table__td-title"), null);
});

test("SMS list keeps add/provider/OTP gates and row operations on their existing template", async t => {
  const f = await fixture(t);
  const add = [...f.host.querySelectorAll("button")].find(node => node.textContent.includes(translate("shop_sms.modern.add_template")));
  assert.equal(add.disabled, false);
  f.shop.sms_service.enable = false; await settle(); assert.equal(add.disabled, true);
  f.shop.sms_service = { driver: "default", enable: true }; await settle(); assert.equal(add.disabled, true);
  f.shop.sms_service = null; await settle(); assert.equal(add.disabled, true);
  assert.match(f.host.textContent, /paid-en/, "Existing templates remain readable without a configured provider");
  f.shop.sms_service = { driver: "kavenegar", enable: true }; await settle();
  f.action(translate("global.commons.edit")).click(); await settle();
  assert.equal(f.state.selected_template.id, 11);
  assert.equal(f.host.querySelector("[data-editor]").dataset.editor, "11");
  f.action(translate("shop_sms.template.menu.reset_error")).click(); await settle();
  assert.equal(f.requests.at(-1).url, "/fixture/shops/1/templates/11/reset");
  assert.equal(f.requests.at(-1).method, "POST");
  f.action(translate("shop_sms.template.menu.send_test")).click(); await settle();
  assert.equal(f.requests.at(-1).url, "/fixture/shops/1/templates/11/test");
  f.action(translate("global.actions.delete")).click(); await settle();
  assert.equal(f.notices.at(-1).key, "openDangerAlert");
  const before = f.requests.length;
  assert.equal(typeof f.notices.at(-1).args[3], "function");
  assert.equal(f.requests.length, before, "Opening delete confirmation does not send a request");
  f.notices.at(-1).args[3](); await settle();
  assert.equal(f.requests.at(-1).url, "/fixture/shops/1/templates/11");
  assert.equal(f.requests.at(-1).method, "DELETE");
  assert.equal(f.state.templates.some(item => item.id === 11), false);
  f.sms.verification = true; await settle();
  assert.equal(f.host.querySelector("table"), null);
  assert.equal(add.disabled, true);
});

test("send-test stays unavailable without the current user's phone", async t => {
  const f = await fixture(t, { phone: null });
  const send = f.action(translate("shop_sms.template.menu.send_test"));
  assert.equal(send.disabled, true);
  send.click(); await settle();
  assert.equal(f.requests.some(request => request.method === "POST"), false);
});

test("selected SMS context stays explicit and only successful count mutations invalidate the catalogue", async t => {
  const f = await fixture(t);
  const header = f.host.querySelector(".b-shop-sms-template-list__header");
  assert.equal(header.querySelector("h2").textContent, f.sms.title);
  assert.equal(header.querySelector("code").textContent, f.sms.code);
  assert.match(header.textContent, /Custom SMS templates/);
  assert.equal(f.changed.length, 0);

  f.state.search = "paid"; await settle();
  f.state.active = true; await settle();
  f.state.page = 2; await settle();
  assert.equal(f.changed.length, 0, "Filtered/paginated reads never publish their totals as catalogue counts");

  f.state.showDialog(); await settle();
  f.host.querySelector("[data-editor-add]").click(); await settle();
  assert.equal(f.changed.length, 1, "One successful add invalidates the catalogue once");
  f.state.showDialog(f.rows[0]); await settle();
  f.host.querySelector("[data-editor-edit]").click(); await settle();
  assert.equal(f.changed.length, 1, "Editing does not change the number of templates");
  f.action(translate("shop_sms.template.menu.reset_error")).click(); await settle();
  assert.equal(f.changed.length, 1, "Resetting diagnostics does not invalidate a template count");

  f.action(translate("global.actions.delete")).click(); await settle();
  assert.equal(f.changed.length, 1, "Opening deletion confirmation cannot change a count");
  f.notices.at(-1).args[3](); await settle();
  assert.equal(f.changed.length, 2, "One successful delete invalidates the catalogue once");
});

test("failed deletion leaves catalogue counts unchanged", async t => {
  const f = await fixture(t, { deleteError: true });
  f.action(translate("global.actions.delete")).click(); await settle();
  f.notices.at(-1).args[3](); await settle();
  assert.equal(f.changed.length, 0);
  assert.ok(f.state.templates.some(row => row.id === 11));
  assert.equal(f.notices.at(-1).key, "showErrorAlert");
});
