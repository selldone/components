import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

const require = createRequire(import.meta.url);
const Vue = require("vue");
const { renderToString } = require("@vue/server-renderer");
const NOW = Date.parse("2026-11-02T08:30:00Z");
class Clock extends Date {
  constructor(...args) { super(...(args.length ? args : [NOW])); }
  static now() { return NOW; }
}
function evaluate(source, dependencies = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, Date: Clock, Intl, Set, ...globals,
    require: (name) => dependencies[name] || { default: {} },
  });
  return exports;
}
const helpers = evaluate(readFileSync(new URL("./service-appointment.ts", import.meta.url), "utf8"));
const { getServiceTimezone, getServiceClock, getAppointmentDate, getAppointmentHours, formatAppointmentRequest } = helpers;
const { ServiceTypes } = evaluate(readFileSync(new URL("../../../../core-js/enums/product/ServiceTypes.ts", import.meta.url), "utf8"));
const plain = (value) => JSON.parse(JSON.stringify(value));
const pass = Vue.defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => Vue.h("div", { class: attrs.class }, [slots.activator?.({ props: {} }), slots.default?.()]);
  },
});
const button = Vue.defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => Vue.h("button", {
      disabled: attrs.disabled, "aria-label": attrs["aria-label"], "aria-pressed": attrs["aria-pressed"],
    }, slots.default?.());
  },
});
const week = Vue.defineComponent({
  props: ["modelValue", "restrictions"],
  setup: (props) => () => Vue.h("div", { "data-weekly": JSON.stringify(props.restrictions) }),
});
const calendarSource = parse(readFileSync(new URL("../../../ui/date/service-availability/UServiceDateAvailability.vue", import.meta.url), "utf8"));
assert.deepEqual(calendarSource.errors, []);
const calendarUtility = evaluate(readFileSync(new URL("../../../ui/date/service-availability/service-calendar.ts", import.meta.url), "utf8"));
const calendarComponent = evaluate(calendarSource.descriptor.script.content, { "./service-calendar": calendarUtility }).default;
const calendarTemplate = compileTemplate({ source: calendarSource.descriptor.template.content, filename: "UServiceDateAvailability.vue", id: "request-calendar" });
assert.deepEqual(calendarTemplate.errors, []);
calendarComponent.render = evaluate(calendarTemplate.code, { vue: Vue }).render;
const { descriptor, errors } = parse(readFileSync(new URL("./form/SProductServiceForm.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename: "SProductServiceForm.vue", id: "service-request" });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles)
  assert.deepEqual(compileStyle({ source: style.content, filename: "SProductServiceForm.vue", id: "service-request", preprocessLang: style.lang }).errors, []);

function componentFor({ requests = [], notices = [], throttle = (fn) => fn, timers } = {}) {
  const component = evaluate(descriptor.script.content, {
    "../service-appointment": helpers,
    "@selldone/core-js/enums/product/ServiceTypes": { ServiceTypes },
    "lodash-es": { throttle },
    "@selldone/components-vue/plugins/notification/NotificationService.ts": { default: {
      showSuccessAlert: (...args) => notices.push(args), showErrorAlert: (...args) => notices.push(args),
      showLaravelError: (...args) => notices.push(args),
    } },
    "../../../../ui/time/week-picker/UTimeWeekPicker.vue": { default: week },
    "../../../../ui/date/range-picker/UDateRangePicker.vue": { default: pass },
    "../../../../ui/date/service-availability/UServiceDateAvailability.vue": { default: calendarComponent },
  }, {
    axios: { put: (url, payload) => new Promise((resolve) => requests.push({ url, payload, resolve })) },
    window: { XAPI: { PUT_BASKET_ITEM_PREFERENCES: (shop, id) => `/fixture/${shop}/products/${id}/preferences` } },
    setInterval: (callback, delay) => {
      const id = timers ? ++timers.next : 1;
      timers?.active.set(id, { callback, delay });
      return id;
    },
    clearInterval: (id) => timers?.active.delete(id),
  }).default;
  component.render = evaluate(template.code, { vue: Vue }).render;
  return component;
}
function fixture({ outputs = {}, preferences, basket = null, modern = false } = {}) {
  const requests = [];
  const notices = [];
  const component = componentFor({ requests, notices });
  const state = {
    ...component.data(), modern, product: {
      id: 7, outputs: { type: "APPOINTMENT", timezone: "Asia/Dubai", days: { Monday: [24, 12, 13, 14], Tuesday: [24, 8] }, ...outputs },
    }, basket,
    getCurrentLanguage: () => ({ full_locale: "en-US", calendar: { first_day_of_week: 1 } }),
    getShop: () => ({ name: "fixture" }),
    $t: (key) => key,
    $emit: () => {},
    setBasketBill: () => {},
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state) });
  if (preferences) state.basket = { id: 9, items: [{ id: 3, product_id: 7, preferences }] };
  component.created.call(state);
  return { state, component, requests, notices };
}

test("timezone clock, weekday selection and midnight preserve the native service contract", () => {
  const outputs = { timezone: "Asia/Dubai", days: { Monday: [24, 12, 13, 14, 14, 0, 25, "15"], Tuesday: [24, 8] } };
  assert.equal(getServiceTimezone({}), null);
  assert.equal(getServiceTimezone({ timezone: "unknown/zone" }), null);
  assert.deepEqual(plain(getServiceClock("Asia/Dubai", NOW)), { date: "2026-11-02", hour: 12 });
  assert.deepEqual(plain(getAppointmentHours(outputs, "2026-11-02", NOW)), [13, 14]);
  assert.deepEqual(plain(getAppointmentHours(outputs, "2026-11-03", NOW)), [24, 8]);
  assert.deepEqual(plain(getAppointmentHours({ ...outputs, disabled: ["2026-11-03T00:00:00Z"] }, "2026-11-03", NOW)), []);
  assert.deepEqual(plain(getAppointmentHours(outputs, "2026-11-01", NOW)), []);
  assert.deepEqual(plain(getAppointmentHours(outputs, "2026-11-31", NOW)), []);
  assert.equal(getAppointmentDate("2026-11-31"), null);
  assert.equal(formatAppointmentRequest({ date: "2026-11-03", hour: 24 }, "en-US"), "Nov 3, 2026, 00:00");
  assert.equal(formatAppointmentRequest({ date: "2026-11-03", hour: 0 }, "en-US"), null);
  const dst = { timezone: "Europe/Berlin", days: { Sunday: [1, 2, 3] } };
  assert.deepEqual(plain(getAppointmentHours(dst, "2027-03-28", NOW)), [1, 3]);
  assert.deepEqual(plain(getAppointmentHours(dst, "2027-10-31", NOW)), [1, 3]);
});

test("a new dated request preserves legacy weekdays and stays local before adding to cart", () => {
  const { state, requests } = fixture();
  state.preferences.days = { Monday: [13, 14] };
  assert.equal(state.appointmentDate, "2026-11-02");
  state.selectAppointmentHour(12);
  assert.equal(state.preferences.appointment, undefined);
  state.busy = true;
  state.selectAppointmentHour(13);
  assert.equal(state.preferences.appointment, undefined);
  state.busy = false;
  state.selectAppointmentHour(13);
  assert.deepEqual(plain(state.preferences.appointment), { date: "2026-11-02", hour: 13 });
  assert.deepEqual(plain(state.preferences.days), { Monday: [13, 14] });
  state.selectAppointmentDate(new Clock("2026-11-03T12:00:00"));
  assert.equal(state.preferences.appointment, null);
  state.selectAppointmentHour(24);
  assert.deepEqual(plain(state.getPreferences().appointment), { date: "2026-11-03", hour: 24 });
  state.clearAppointmentRequest();
  assert.equal(state.preferences.appointment, null);
  assert.equal(requests.length, 0);
});

test("legacy services retain weekly selection and unrelated subscription/booking preferences", () => {
  const legacy = fixture({ outputs: { timezone: undefined } }).state;
  assert.equal(legacy.appointmentTimezone, null);
  assert.equal(legacy.appointmentDate, null);
  legacy.selectAppointmentHour(13);
  assert.equal(legacy.preferences.appointment, undefined);
  const booking = fixture({ outputs: { type: "BOOKING" } }).state;
  assert.equal(booking.appointmentTimezone, null);
  assert.deepEqual(plain(booking.preferences.dates), []);
  booking.product.outputs.timezone = undefined;
  booking.appointmentNow = Date.parse("2026-11-02T23:30:00Z");
  assert.equal(booking.appointmentToday, "2026-11-02", "Legacy booking uses the backend UTC date fallback");
  booking.product.outputs.timezone = "Asia/Dubai";
  assert.equal(booking.appointmentToday, "2026-11-03");
  legacy.appointmentNow = booking.appointmentNow;
  assert.equal(legacy.appointmentToday, null, "Legacy reserve remains a weekly form without an implied timezone");
  const subscription = fixture({ outputs: { type: "SUBSCRIPTION", subscription: 30 }, modern: true }).state;
  assert.equal(subscription.show, true);
  assert.equal(fixture({ outputs: { type: "SUBSCRIPTION", subscription: 30 } }).state.show, false);
});

test("timezone changes refresh the mounted preview date and clock without losing saved cart requests", async () => {
  const node = (tag, text = "") => ({ tag, text, children: [], parent: null, props: {} });
  const renderer = Vue.createRenderer({
    createElement: node, createText: (text) => node("#text", text), createComment: (text) => node("#comment", text),
    insert(child, parent, anchor) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = parent; const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, child); },
    remove(child) { child.parent?.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
    setText: (element, text) => { element.text = text; }, setElementText: (element, text) => { element.text = text; element.children = []; },
    patchProp: (element, key, previous, value) => { element.props[key] = value; },
    parentNode: (element) => element.parent, nextSibling: (element) => element.parent?.children[element.parent.children.indexOf(element) + 1],
  });
  const requests = [];
  const timers = { next: 0, active: new Map() };
  const product = Vue.reactive({ id: 7, outputs: { type: "APPOINTMENT", days: { Monday: [13, 14], Sunday: [23] } } });
  const app = renderer.createApp(componentFor({ requests, timers }), { product, basket: null, modern: true });
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    getCurrentLanguage: () => ({ full_locale: "en-US", dir: "ltr", calendar: { first_day_of_week: 1, calendar: "gregory" } }),
  });
  for (const name of ["v-menu", "v-card", "v-tooltip", "v-icon", "u-loading-progress", "flag"]) app.component(name, pass);
  app.component("v-btn", button);
  const warnings = [];
  const errors = [];
  app.config.warnHandler = (warning) => warnings.push(warning);
  app.config.errorHandler = (error) => errors.push(error);
  const state = app.mount(node("root"));
  try {
    assert.equal(state.appointmentDate, null);
    assert.equal(timers.active.size, 0);
    product.outputs.timezone = "Asia/Dubai";
    await Vue.nextTick();
    assert.equal(state.appointmentDate, "2026-11-02");
    assert.deepEqual(plain(state.appointmentHours), [13, 14]);
    assert.equal(timers.active.size, 1);
    assert.equal([...timers.active.values()][0].delay, 60000);
    state.selectAppointmentHour(13);
    assert.equal(state.isAppointmentHourSelected(13), true);
    state.appointmentCalendar = true;
    product.outputs.timezone = "Pacific/Honolulu";
    await Vue.nextTick();
    assert.equal(state.appointmentDate, "2026-11-01");
    assert.equal(state.appointmentCalendar, false);
    assert.equal(state.preferences.appointment, null);
    assert.deepEqual(plain(state.appointmentHours), [23]);
    assert.equal(timers.active.size, 1);
    product.outputs.timezone = null;
    await Vue.nextTick();
    assert.equal(state.appointmentDate, null);
    assert.equal(timers.active.size, 0);
    assert.equal(requests.length, 0);
    assert.deepEqual(warnings, []);
    assert.deepEqual(errors, []);
  } finally { app.unmount(); }
  assert.equal(timers.active.size, 0);

  const saved = { date: "2026-11-02", hour: 13, timezone: "Asia/Dubai" };
  const cart = fixture({ preferences: { appointment: saved } });
  cart.state.product.outputs.timezone = "Pacific/Honolulu";
  cart.component.watch.appointmentTimezone.call(cart.state);
  assert.deepEqual(plain(cart.state.preferences.appointment), saved);
  assert.equal(cart.state.appointmentRequestTimezone, "Asia/Dubai");
  assert.equal(cart.state.isAppointmentHourSelected(13), false);
  assert.equal(cart.requests.length, 0);
});

test("existing cart requests send the additive nullable preference without confirming a service", async () => {
  const prefs = { appointment: { date: "2026-11-03", hour: 8, timezone: "Europe/London" }, days: { Tuesday: [8] } };
  const { state, requests, notices } = fixture({ preferences: prefs });
  assert.equal(state.appointmentRequestTimezone, "Europe/London");
  state.clearAppointmentRequest();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].payload.preferences.appointment, null);
  assert.deepEqual(plain(requests[0].payload.preferences.days), { Tuesday: [8] });
  assert.equal("reserved_at" in requests[0].payload, false);
  requests[0].resolve({ data: { item: { id: 3 }, price_multiplier: false } });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(state.busy, false);
  assert.equal(notices.length, 1);
  assert.match(notices[0][1], /success/);
});

test("actual customer template renders compact dated choices, Persian labels and the legacy grid", async () => {
  async function render(outputs, locale = "en-US") {
    const component = componentFor();
    const app = Vue.createSSRApp(component, { product: { id: 7, outputs }, basket: null, modern: true });
    // These are genuine Core/app-global boundaries; no optional helper is supplied.
    app.config.globalProperties.getCurrentLanguage = () => ({ full_locale: locale, dir: locale === "fa-IR" ? "rtl" : "ltr", calendar: { first_day_of_week: 1, calendar: locale === "fa-IR" ? "persian" : "gregory" } });
    app.config.globalProperties.$t = (key) => key;
    for (const name of ["v-menu", "v-card", "v-tooltip", "v-icon", "u-loading-progress", "flag"]) app.component(name, pass);
    app.component("v-btn", button);
    const warnings = [];
    app.config.warnHandler = (warning) => warnings.push(warning);
    const html = await renderToString(app);
    assert.deepEqual(warnings, []);
    return html;
  }
  const outputs = { type: "APPOINTMENT", timezone: "Asia/Dubai", days: { Monday: [13, 14] } };
  const html = await render(outputs);
  assert.match(html, /13:00/);
  assert.match(html, /14:00/);
  assert.match(html, /request_help/);
  assert.doesNotMatch(html, /data-weekly/);
  assert.match(await render({ ...outputs, timezone: undefined }), /data-weekly/);
  const persian = await render(outputs, "fa-IR");
  assert.match(persian, /۱۴۰۵/);
  assert.match(persian, /data-date="2026-10-23"/);
});

test("readonly order request uses the stored timezone and never replaces merchant confirmation", () => {
  const { descriptor: billing } = parse(readFileSync(new URL("../../order/billing/ServiceBillingItem.vue", import.meta.url), "utf8"));
  const component = evaluate(billing.script.content, {
    "../../product/service/service-appointment": helpers,
    "lodash-es": { throttle: (fn) => fn },
    "@selldone/core-js": { Basket: {} },
    "@selldone/core-js/enums/product/ServiceTypes": { ServiceTypes },
  }).default;
  const state = {
    has_reserve: true, outputs: { timezone: "Asia/Dubai" },
    preferences: { appointment: { date: "2026-11-03", hour: 24, timezone: "Europe/London" } },
    getCurrentLanguage: () => ({ full_locale: "en-US" }), reserved_at: "2026-11-03T09:00:00Z",
  };
  Object.defineProperty(state, "requestedAppointmentTimezone", { get: component.computed.requestedAppointmentTimezone.bind(state) });
  assert.equal(state.requestedAppointmentTimezone, "Europe/London");
  assert.equal(component.computed.requestedAppointmentLabel.call(state), "Nov 3, 2026, 00:00");
  assert.equal(state.reserved_at, "2026-11-03T09:00:00Z");
  state.preferences.appointment = null;
  assert.equal(component.computed.requestedAppointmentLabel.call(state), null);
});
