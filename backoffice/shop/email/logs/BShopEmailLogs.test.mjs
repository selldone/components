import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// The actual email delivery log with stubbed Vuetify controls; HTTP never reaches Laravel.
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
const { descriptor, errors } = parse(read("./BShopEmailLogs.vue"));
assert.deepEqual(errors, []);
const compiled = compileTemplate({ source: descriptor.template.content, filename: "BShopEmailLogs.vue", id: "email-logs-test", transformAssetUrls: { includeAbsolute: true } });
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
  id, code: "order-payment", mailable: "OrderPaymentEmail", driver: "resend", recipient: "bu•••@example.test", recipients: 1,
  status, reason: null, error_type: null, error_message: null, duration_ms: 240, exchanges: null, created_at: "2026-11-24T11:00:00Z", ...extra,
});
const catalog = { providers: [{ key: "resend", title: "Resend", logo: "/fixture/resend.png" }, { key: "gmail", title: "Gmail", logo: null }] };

async function fixture(t, props = {}) {
  const requests = [], notices = [], copied = [], emitted = [], errors = [], warnings = [];
  const globals = {
    window: { API: { GET_SHOP_EMAIL_LOGS: id => `/fixture/shops/${id}/email/logs` } },
    axios: { get: (url, config) => new Promise((resolve, reject) => requests.push({ url, params: config?.params && JSON.parse(JSON.stringify(config.params)), resolve, reject })) },
  };
  const imports = name => {
    if (name.includes("NotificationService")) return { __esModule: true, default: new Proxy({}, { get: (_, method) => (...args) => notices.push([method, args]) }) };
    throw new Error(`Unexpected import ${name}`);
  };
  const component = { ...evaluate(descriptor.script.content, imports, globals).default, render };
  const instance = Vue.shallowRef();
  const app = Vue.createApp({
    render: () => Vue.h(component, {
      ref: instance, shop: { id: 7 }, catalog, onOpenProvider: () => emitted.push("open-provider"),
      messages: [{ code: "order-payment", title: "Payment received" }, { code: "login-code", title: "Sign-in code" }], ...props,
    }),
  });
  app.config.globalProperties.$t = (key, values) => key + (values ? " " + JSON.stringify(values) : "");
  app.config.globalProperties.$i18n = { locale: "en" };
  app.config.globalProperties.copyToClipboard = text => copied.push(text);
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  for (const name of new Set([...compiled.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)].map(m => m[1])))
    app.component(name, name === "v-btn" ? button : name === "v-select" ? select : wrapper("div"));
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, requests, notices, copied, emitted, get state() { return instance.value; },
    async answer(request, data) { request.resolve({ data }); await settle(); },
    async click(selector) { host.querySelector(selector).click(); await settle(); },
  };
}

test("email log template, script and scoped Sass compile", async () => {
  for (const style of descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: "BShopEmailLogs.vue", id: "email-logs-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
  }
});

test("entries show status, email, recipient, provider and why; counts and the email filter narrow the list", async t => {
  const f = await fixture(t);
  assert.deepEqual(f.requests.map(r => r.url), ["/fixture/shops/7/email/logs"], "Provider names come from the page's catalog, not another request");
  assert.deepEqual(f.requests[0].params, { offset: 0, limit: 20 });
  await f.answer(f.requests[0], {
    logs: [
      entry(4, "failed", { error_type: "account", error_message: "Resend returned HTTP 401: API key is invalid" }),
      entry(3, "skipped", { reason: "no_provider", driver: null, code: "login-code", duration_ms: null }),
      entry(2, "sent", { code: "test", driver: "gmail", recipients: 3 }),
      entry(1, "sent", { code: null, mailable: "LegacyEmail", driver: "mystery" }),
    ],
    total: 4, summary: { sent: 2, failed: 1, skipped: 1 }, retention_days: 7,
  });
  const rows = [...f.host.querySelectorAll(".b-email-logs__row")];
  assert.equal(rows.length, 4);
  assert.match(rows[0].textContent, /Payment received/);
  assert.match(rows[0].textContent, /bu•••@example\.test/);
  assert.match(rows[0].textContent, /Resend/);
  assert.match(rows[0].textContent, /shop_emails\.logs\.error\.account\.title/);
  assert.ok(rows[0].querySelector('img[src="/fixture/resend.png"]'), "The provider's logo");
  assert.match(rows[1].textContent, /Sign-in code/);
  assert.match(rows[1].textContent, /shop_emails\.logs\.no_provider/);
  assert.match(rows[1].textContent, /shop_emails\.logs\.reason\.no_provider\.title/);
  assert.match(rows[2].textContent, /shop_emails\.logs\.codes\.test/, "Emails without a template are named by the log");
  assert.match(rows[2].textContent, /shop_emails\.logs\.more_recipients \{"count":2\}/);
  assert.match(rows[2].querySelector(".b-email-logs__logo").textContent, /^G$/, "Initials without a logo");
  assert.match(rows[3].textContent, /LegacyEmail/, "Without a code the email class names it");
  assert.match(rows[3].textContent, /mystery/, "An unknown provider shows its key");
  assert.deepEqual([...f.host.querySelectorAll(".b-email-logs__tile strong")].map(n => n.textContent), ["2", "1", "1"]);

  await f.click('.b-email-logs__tile[data-status="skipped"]');
  assert.deepEqual(f.requests.at(-1).params, { offset: 0, limit: 20, status: "skipped" });
  assert.equal(f.host.querySelector('.b-email-logs__tile[data-status="skipped"]').getAttribute("aria-pressed"), "true");
  await f.click('.b-email-logs__tile[data-status="skipped"]');
  assert.deepEqual(f.requests.at(-1).params, { offset: 0, limit: 20 }, "Pressing the active count clears the filter");

  const choice = f.host.querySelector("[data-select]");
  assert.deepEqual([...choice.options].slice(1).map(o => o.value), ["order-payment", "login-code", "test", "order-notification", "marketing", "subscription"]);
  choice.value = "order-notification"; choice.dispatchEvent(new window.Event("change")); await settle();
  assert.deepEqual(f.requests.at(-1).params, { offset: 0, limit: 20, code: "order-notification" });
  assert.ok([...choice.options].some(o => o.textContent === "shop_emails.logs.codes.order_notification"));
});

test("details explain the failure, list the API calls, copy the redacted entry and lead to the provider", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], {
    logs: [
      entry(9, "failed", {
        error_type: "account", error_message: "Resend returned HTTP 401: API key is invalid",
        exchanges: [{ method: "POST", url: "https://api.resend.com/emails", status: 401, duration_ms: 84, response: '{"name":"validation_error","message":"API key is invalid"}', error: null },
                    { method: "POST", url: "https://api.resend.com/emails", status: null, duration_ms: 20000, response: null, error: "Connection timed out" }],
      }),
      entry(8, "failed", { error_type: "recipient", error_message: 'Expected response code "250" but got code "550"' }),
      entry(7, "sent"),
    ],
    total: 3, summary: { sent: 1, failed: 2, skipped: 0 }, retention_days: 7,
  });
  assert.equal(f.host.querySelector(".b-email-logs__details"), null);
  await f.click('[data-log="9"]');
  const details = f.host.querySelector(".b-email-logs__details");
  assert.match(details.textContent, /shop_emails\.logs\.error\.account\.help/);
  assert.match(details.querySelector(".b-email-logs__answer").textContent, /API key is invalid/);
  const calls = [...details.querySelectorAll(".b-email-logs__exchange")];
  assert.equal(calls.length, 2);
  assert.match(calls[0].textContent, /https:\/\/api\.resend\.com\/emails/);
  assert.equal(calls[0].querySelector(".b-email-logs__code-badge").dataset.tone, "warning");
  assert.match(calls[0].querySelector(".b-email-logs__response").textContent, /"name": "validation_error"/, "JSON answers are pretty-printed");
  assert.equal(calls[1].querySelector(".b-email-logs__code-badge").dataset.tone, "error");
  assert.match(calls[1].textContent, /Connection timed out/);
  await f.click(".b-email-logs__fix");
  assert.deepEqual(f.emitted, ["open-provider"], "Settings problems are fixed in Email provider");
  await f.click(".b-email-logs__actions button");
  assert.equal(JSON.parse(f.copied[0]).error_message, "Resend returned HTTP 401: API key is invalid");
  await f.click('[data-log="9"]');
  assert.equal(f.host.querySelector(".b-email-logs__details"), null, "A second click closes the details");

  await f.click('[data-log="8"]');
  assert.equal(f.host.querySelector(".b-email-logs__fix"), null, "A rejected address is not a settings problem");
  assert.equal(f.host.querySelector(".b-email-logs__exchanges"), null, "SMTP answers have no HTTP calls");
  await f.click('[data-log="7"]');
  assert.match(f.host.querySelector('.b-email-logs__item--open:last-child .b-email-logs__explain').textContent, /shop_emails\.logs\.sent_title \{"provider":"Resend"\}/);
});

test("load more appends the next page; a failed read is shown and can be retried; empty states follow the filters", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], { logs: [entry(5, "sent")], total: 2, summary: { sent: 2, failed: 0, skipped: 0 }, retention_days: 7 });
  assert.match(f.host.querySelector(".b-email-logs__more").textContent, /shop_emails\.logs\.load_more \{"count":1\}/);
  await f.click(".b-email-logs__more button");
  assert.deepEqual(f.requests.at(-1).params, { offset: 1, limit: 20 });
  await f.answer(f.requests.at(-1), { logs: [entry(4, "sent")], total: 2, summary: { sent: 2, failed: 0, skipped: 0 }, retention_days: 7 });
  assert.deepEqual(JSON.parse(JSON.stringify(f.state.logs.map(l => l.id))), [5, 4]);
  assert.equal(f.host.querySelector(".b-email-logs__more"), null);

  await f.click(".b-email-logs__head button");
  f.requests.at(-1).reject(new Error("offline")); await settle();
  assert.ok(f.host.querySelector(".b-email-logs__notice"));
  assert.equal(f.notices.at(-1)[0], "showLaravelError");
  await f.click(".b-email-logs__notice button");
  await f.answer(f.requests.at(-1), { logs: [], total: 0, summary: { sent: 0, failed: 0, skipped: 0 }, retention_days: 7 });
  assert.equal(f.host.querySelector(".b-email-logs__empty strong").textContent, "shop_emails.logs.empty");
  assert.match(f.host.querySelector(".b-email-logs__head p").textContent, /shop_emails\.logs\.subtitle \{"period":"shop_emails\.logs\.period_days \{\\"days\\":7\}"\}/);
  await f.click('.b-email-logs__tile[data-status="failed"]');
  await f.answer(f.requests.at(-1), { logs: [], total: 0, summary: { sent: 0, failed: 0, skipped: 0 }, retention_days: 7 });
  assert.equal(f.host.querySelector(".b-email-logs__empty strong").textContent, "shop_emails.logs.empty_filtered");
});

test("a one-day plan window reads as 24 hours", async t => {
  const f = await fixture(t);
  await f.answer(f.requests[0], { logs: [], total: 0, summary: { sent: 0, failed: 0, skipped: 0 }, retention_days: 1 });
  assert.match(f.host.querySelector(".b-email-logs__head p").textContent, /period_24h/);
  assert.match(f.host.querySelector(".b-email-logs__empty p").textContent, /period_24h/);
});

test("a stale answer from an earlier filter is ignored", async t => {
  const f = await fixture(t);
  const first = f.requests[0];
  await f.click('.b-email-logs__tile[data-status="failed"]');
  await f.answer(f.requests.at(-1), { logs: [entry(2, "failed", { error_type: "internal" })], total: 1, summary: { sent: 0, failed: 1, skipped: 0 }, retention_days: 7 });
  await f.answer(first, { logs: [entry(1, "sent")], total: 1, summary: { sent: 1, failed: 1, skipped: 0 }, retention_days: 7 });
  assert.deepEqual(JSON.parse(JSON.stringify(f.state.logs.map(l => l.id))), [2]);
});
