import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// The actual SMS log component with stubbed Vuetify controls; HTTP never reaches Laravel.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const name of ["window", "document", "Element", "SVGElement", "HTMLElement", "Node"]) globalThis[name] = dom.window[name];
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
const Vue = await import("vue");
const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
function evaluate(source, imports = () => ({}), globals = {}) {
  const output = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  assert.deepEqual(output.diagnostics, []);
  const exports = {};
  vm.runInNewContext(output.outputText, { exports, require: imports, console, setTimeout, clearTimeout, Intl, Date, JSON, ...globals });
  return exports;
}
const { descriptor, errors } = parse(read("./BShopSmsLogs.vue"));
assert.deepEqual(errors, []);
const compiled = compileTemplate({ source: descriptor.template.content, filename: "BShopSmsLogs.vue", id: "sms-logs-test", transformAssetUrls: { includeAbsolute: true } });
assert.deepEqual(compiled.errors, []);
const render = evaluate(compiled.code, name => (name === "vue" ? Vue : {})).render;

const wrapper = tag => Vue.defineComponent({ inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(tag, attrs, [slots.activator?.({ props: {} }), slots.default?.()]) });
const button = Vue.defineComponent({
  props: ["disabled", "loading"],
  setup: (props, { attrs, slots }) => () => Vue.h("button", { ...attrs, disabled: props.disabled || props.loading }, slots.default?.()),
});
const select = Vue.defineComponent({
  props: ["modelValue", "items"], emits: ["update:modelValue"],
  setup: (props, { emit }) => () => Vue.h("select", { "data-select": "", onChange: e => emit("update:modelValue", e.target.value || null) },
    [Vue.h("option", { value: "" }, "all"), ...(props.items || []).map(item => Vue.h("option", { value: item.value }, item.title))]),
});

const entry = (id, status, extra = {}) => ({
  id, code: "shop-order-payment", language: "en", driver: "netgsm", account: "shop", mode: "text", template: null,
  recipient: "+90••••••4567", status, reason: null, error_type: null, error_message: null, duration_ms: 120, exchanges: null,
  created_at: "2026-11-24T11:00:00Z", ...extra,
});

async function fixture(t) {
  const requests = [], notices = [], copied = [], errors = [], warnings = [];
  const globals = {
    window: { API: { GET_SHOP_SMS_LOGS: id => `/fixture/shops/${id}/sms/logs`, GET_SHOP_SMS_PROVIDERS: id => `/fixture/shops/${id}/sms/providers` } },
    axios: { get: (url, config) => new Promise((resolve, reject) => requests.push({ url, params: config?.params && JSON.parse(JSON.stringify(config.params)), resolve, reject })) },
  };
  const imports = name => {
    if (name.includes("NotificationService")) return { __esModule: true, default: new Proxy({}, { get: (_, method) => (...args) => notices.push([method, args]) }) };
    throw new Error(`Unexpected import ${name}`);
  };
  const component = { ...evaluate(descriptor.script.content, imports, globals).default, render };
  const instance = Vue.shallowRef();
  const app = Vue.createApp({ render: () => Vue.h(component, { ref: instance, shop: { id: 7 }, messages: [{ code: "shop-order-payment", title: "Payment received" }, { code: "shop-login", title: "Sign-in code", verification: true }] }) });
  app.config.globalProperties.$t = (key, values) => key + (values ? " " + JSON.stringify(values) : "");
  app.config.globalProperties.$i18n = { locale: "en" };
  app.config.globalProperties.getLanguageName = code => ({ en: "English" })[code] || code;
  app.config.globalProperties.copyToClipboard = text => copied.push(text);
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  for (const name of new Set([...compiled.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)].map(m => m[1])))
    app.component(name, name === "v-btn" ? button : name === "v-select" ? select : wrapper("div"));
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, requests, notices, copied, get state() { return instance.value; },
    logRequests() { return requests.filter(r => r.url.endsWith("/logs")); },
    async answer(request, data) { request.resolve({ data }); await settle(); },
    async click(selector) { host.querySelector(selector).click(); await settle(); },
  };
}

test("SMS log template, script and scoped Sass compile", async () => {
  for (const style of descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: "BShopSmsLogs.vue", id: "sms-logs-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
  }
});

test("entries show status, message, provider and why; counts filter the list", async t => {
  const f = await fixture(t);
  assert.deepEqual(f.requests.map(r => r.url), ["/fixture/shops/7/sms/logs", "/fixture/shops/7/sms/providers"]);
  assert.deepEqual(f.requests[0].params, { offset: 0, limit: 20 });
  await f.answer(f.requests[1], { providers: [{ key: "netgsm", title: "Netgsm", logo: "/fixture/netgsm.png" }] });
  await f.answer(f.requests[0], {
    logs: [entry(3, "failed", { error_type: "account", error_message: "Invalid sender header" }), entry(2, "skipped", { reason: "codes_only", driver: null, mode: null }), entry(1, "sent")],
    total: 3, summary: { sent: 1, failed: 1, skipped: 1 }, retention_days: 7,
  });
  const rows = [...f.host.querySelectorAll(".b-sms-logs__row")];
  assert.equal(rows.length, 3);
  assert.match(rows[0].textContent, /Payment received/);
  assert.match(rows[0].textContent, /\+90••••••4567/);
  assert.match(rows[0].textContent, /Netgsm/);
  assert.match(rows[0].textContent, /shop_sms\.logs\.error\.account\.title/);
  assert.match(rows[1].textContent, /shop_sms\.logs\.reason\.codes_only\.title/);
  assert.ok(rows[0].querySelector('img[src="/fixture/netgsm.png"]'), "The provider's logo");
  assert.deepEqual([...f.host.querySelectorAll(".b-sms-logs__tile strong")].map(n => n.textContent), ["1", "1", "1"]);

  await f.click('.b-sms-logs__tile[data-status="failed"]');
  assert.deepEqual(f.logRequests().at(-1).params, { offset: 0, limit: 20, status: "failed" });
  assert.equal(f.host.querySelector('.b-sms-logs__tile[data-status="failed"]').getAttribute("aria-pressed"), "true");
  await f.click('.b-sms-logs__tile[data-status="failed"]');
  assert.deepEqual(f.logRequests().at(-1).params, { offset: 0, limit: 20 }, "Pressing the active count clears the filter");

  const choice = f.host.querySelector("[data-select]");
  choice.value = "test"; choice.dispatchEvent(new window.Event("change")); await settle();
  assert.deepEqual(f.logRequests().at(-1).params, { offset: 0, limit: 20, code: "test" });
  assert.ok([...choice.options].some(o => o.textContent === "shop_sms.logs.test_send"), "Test sends can be filtered too");
});

test("details explain the failure, list the provider calls and copy the redacted entry", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], {
    logs: [entry(9, "failed", {
      error_type: "recipient", error_message: "Number is blocked",
      exchanges: [{ method: "POST", url: "https://api.netgsm.test/sms/v3/send", status: 422, duration_ms: 84, response: '{"code":"NO_DELIVERABLE_MESSAGES"}', error: null },
                  { method: "POST", url: "https://api.netgsm.test/auth", status: null, duration_ms: 10000, response: null, error: "Connection timed out" }],
    })],
    total: 1, summary: { sent: 0, failed: 1, skipped: 0 }, retention_days: 7,
  });
  assert.equal(f.host.querySelector(".b-sms-logs__details"), null);
  await f.click('[data-log="9"]');
  const details = f.host.querySelector(".b-sms-logs__details");
  assert.match(details.textContent, /shop_sms\.logs\.error\.recipient\.help/);
  assert.match(details.querySelector(".b-sms-logs__answer").textContent, /Number is blocked/);
  const calls = [...details.querySelectorAll(".b-sms-logs__exchange")];
  assert.equal(calls.length, 2);
  assert.match(calls[0].textContent, /https:\/\/api\.netgsm\.test\/sms\/v3\/send/);
  assert.equal(calls[0].querySelector(".b-sms-logs__code-badge").dataset.tone, "warning");
  assert.match(calls[0].querySelector(".b-sms-logs__response").textContent, /"code": "NO_DELIVERABLE_MESSAGES"/, "JSON answers are pretty-printed");
  assert.equal(calls[1].querySelector(".b-sms-logs__code-badge").dataset.tone, "error");
  assert.match(calls[1].textContent, /Connection timed out/);
  await f.click(".b-sms-logs__actions button");
  assert.equal(JSON.parse(f.copied[0]).error_message, "Number is blocked");
  await f.click('[data-log="9"]');
  assert.equal(f.host.querySelector(".b-sms-logs__details"), null, "A second click closes the details");
});

test("load more appends the next page; a failed read is shown and can be retried", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], { logs: [entry(5, "sent")], total: 2, summary: { sent: 2, failed: 0, skipped: 0 }, retention_days: 7 });
  assert.match(f.host.querySelector(".b-sms-logs__more").textContent, /shop_sms\.logs\.load_more \{"count":1\}/);
  await f.click(".b-sms-logs__more button");
  assert.deepEqual(f.logRequests().at(-1).params, { offset: 1, limit: 20 });
  await f.answer(f.logRequests().at(-1), { logs: [entry(4, "sent")], total: 2, summary: { sent: 2, failed: 0, skipped: 0 }, retention_days: 7 });
  assert.deepEqual(JSON.parse(JSON.stringify(f.state.logs.map(l => l.id))), [5, 4]);
  assert.equal(f.host.querySelector(".b-sms-logs__more"), null);

  f.state.refresh(); await settle();
  f.logRequests().at(-1).reject(new Error("offline")); await settle();
  assert.ok(f.host.querySelector(".b-sms-logs__notice"));
  assert.ok(f.notices.some(([method]) => method === "showLaravelError"));
  assert.equal(f.state.busy, false);
});

test("an empty period says what will appear here", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], { logs: [], total: 0, summary: { sent: 0, failed: 0, skipped: 0 }, retention_days: 7 });
  const empty = f.host.querySelector(".b-sms-logs__empty").textContent;
  assert.ok(empty.includes("shop_sms.logs.empty_help") && empty.includes("shop_sms.logs.period_days") && empty.includes('7'), "The plan's window in days");
});

test("a one-day plan window reads as 24 hours", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], { logs: [], total: 0, summary: { sent: 0, failed: 0, skipped: 0 }, retention_days: 1 });
  assert.match(f.host.querySelector(".b-sms-logs__head").textContent, /shop_sms\.logs\.period_24h/);
  assert.doesNotMatch(f.host.querySelector(".b-sms-logs__head").textContent, /period_days/);
});
