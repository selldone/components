import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const dom = new JSDOM("<main></main>", { url: "http://synthetic.test" });
for (const key of ["window", "document", "Element", "HTMLElement", "SVGElement", "Node", "ShadowRoot"]) globalThis[key] = dom.window[key];
const Vue = await import("vue");
const repository = new URL("../../../../", import.meta.url);
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function moduleAt(path, require = () => { throw new Error("Unexpected module dependency"); }) {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(path, repository), "utf8")), { exports, require, Date, Intl, Array, Object, window: {} });
  return exports;
}
const calendar = moduleAt("components-vue/ui/date/service-availability/service-calendar.ts");
const weekdays = moduleAt("core-js/enums/logistic/WeekDays.ts");
const calendars = moduleAt("core-js/enums/language/Calendar.ts");
const converter = moduleAt("core-js/helper/date/DateConverter.ts", () => calendars);
const objectPrototypes = moduleAt("core-js/prototypes/ObjectPrototypes.ts");
moduleAt("core-js/prototypes/ArrayPrototypes.ts", () => objectPrototypes);
const plain = value => JSON.parse(JSON.stringify(value));
const paths = ["components-vue/ui/time/week-picker/UTimeWeekPicker.vue", "components-vue/ui/date/service-availability/UServiceDateAvailability.vue"];
function componentAt(path) {
  const filename = fileURLToPath(new URL(path, repository));
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "service-controls-test" });
  const template = compileTemplate({ source: descriptor.template.content, filename, id: "service-controls-test", compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  const require = name => {
    if (name === "vue") return Vue;
    if (name.includes("service-calendar")) return calendar;
    if (name.includes("WeekDays")) return weekdays;
    if (name.includes("DateConverter")) return converter;
    throw new Error(`Unexpected dependency ${name}`);
  };
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), { exports, require, Date, Intl, Array, Object });
  const render = {};
  vm.runInNewContext(transpile(template.code), { exports: render, require });
  return { component: { ...exports.default, render: render.render }, descriptor, filename };
}
const weekly = componentAt(paths[0]);
const dates = componentAt(paths[1]);
async function fixture(t, owner, options = {}) {
  const props = Vue.reactive(options), events = [], failures = [], warnings = [];
  const language = Vue.reactive({ full_locale: "en-US", dir: "ltr", calendar: calendars.Calendar.gregory });
  const host = document.createElement("div");document.body.append(host);
  let state;
  const app = Vue.createApp({ render: () => Vue.h(owner.component, { ...props, ref: instance => { state = instance; }, "onUpdate:modelValue": value => events.push(["model", value]), "onUpdate:selection": value => events.push(["selection", value]), onChange: value => events.push(["change", value]) }) });
  app.component("VTooltip", { inheritAttrs: false, setup(props, { slots }) { return () => Vue.h("span", [slots.activator?.({ props: {} })]); } });
  app.component("VIcon", { setup(props, { slots }) { return () => Vue.h("span", slots.default?.()); } });
  app.component("VBtn", { setup(props, { attrs, slots }) { return () => Vue.h("button", attrs, slots.default?.()); } });
  Object.assign(app.config.globalProperties, {
    getCurrentLanguage: () => language,
    $t: (key, values = {}) => key + (Object.keys(values).length ? ":" + JSON.stringify(values) : ""),
    isObject: value => value !== null && typeof value === "object" && !Array.isArray(value),
    remove: (array, value) => { const i = array.indexOf(value); if (i >= 0) array.splice(i, 1); },
  });
  app.config.errorHandler = error => failures.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  app.mount(host);await Vue.nextTick();
  t.after(() => { app.unmount();host.remove();assert.deepEqual(failures, []);assert.deepEqual(warnings, []); });
  const click = async selector => { const element = host.querySelector(selector);assert.ok(element, selector);element.click();await Vue.nextTick(); };
  return { props, language, host, events, get state() { return state; }, click, model: () => events.filter(event => event[0] === "model").at(-1)?.[1] };
}

test("both shared templates and scoped styles compile", async () => {
  for (const owner of [weekly, dates]) for (const style of owner.descriptor.styles) assert.deepEqual((await compileStyleAsync({ source: style.content, filename: owner.filename, id: "service-controls-test", scoped: style.scoped, preprocessLang: style.lang })).errors, []);
});

test("civil dates preserve local dates, leap days and ranges across year and DST boundaries", () => {
  assert.equal(calendar.serviceDateKey("2024-02-29"), "2024-02-29");
  assert.equal(calendar.serviceDateKey("2025-02-29"), null);
  assert.equal(calendar.serviceDateKey("2026-11-12T00:00:00.000Z"), "2026-11-12");
  assert.equal(calendar.serviceDateKey(new Date(2026, 10, 12, 23, 30)), "2026-11-12");
  assert.deepEqual(plain(calendar.serviceDateRange("2027-01-02", "2026-12-30")), ["2026-12-30", "2026-12-31", "2027-01-01", "2027-01-02"]);
  assert.deepEqual(plain(calendar.serviceDateRange("2026-03-07", "2026-03-10")), ["2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10"]);
  assert.deepEqual(plain(calendar.serviceDateRange("invalid", "2026-11-02")), []);
});

test("Gregorian and Persian month arithmetic handles leap months and negative offsets", () => {
  const february = calendar.serviceCalendarMonth("2024-02-20", "gregory");
  assert.equal(february.start, "2024-02-01");assert.equal(february.end, "2024-02-29");assert.equal(february.dates.length, 29);
  assert.equal(calendar.serviceCalendarMonth("2026-01-05", "gregory", -1).start, "2025-12-01");
  const esfand = calendar.serviceCalendarMonth("2025-03-20", "persian");
  assert.equal(esfand.start, "2025-02-19");assert.equal(esfand.end, "2025-03-20");assert.equal(esfand.dates.length, 30);
  assert.equal(calendar.serviceCalendarMonth("2025-03-20", "persian", 1).start, "2025-03-21");
  assert.equal(calendar.serviceCalendarMonth("2025-03-21", "persian", -1).start, esfand.start);
});

test("modern weekly choices preserve literal hours and midnight while emitting immutable changes", async t => {
  const original = { Monday: [9, 24], Tuesday: [10] };
  const f = await fixture(t, weekly, { modern: true, editable: true, modelValue: original });
  assert.equal(f.state.hourRange(9), "09:00–10:00");assert.equal(f.state.hourRange(24), "00:00–01:00");
  const before = plain(original);
  await f.click('.u-time-week-modern__hours button[aria-label$="09:00–10:00"]');
  assert.deepEqual(plain(f.model().Monday), [24]);assert.deepEqual(plain(original), before);assert.notEqual(f.model(), original);
  f.props.modelValue = f.model();await Vue.nextTick();
  f.state.showAllHours = true;await Vue.nextTick();
  assert.equal(f.host.querySelector('.u-time-week-modern__hours button').textContent.trim(), "00:00–01:00");
  await f.click('.u-time-week-modern__hours button[aria-label$="00:00–01:00"]');assert.deepEqual(plain(f.model().Monday), []);
});

test("weekly restrictions, whole-day actions, readonly guards and locale order remain coherent", async t => {
  const f = await fixture(t, weekly, { modern: true, editable: true, modelValue: { Monday: [9] }, restrictions: { Monday: [9, 10] } });
  f.state.setModernDay(true);assert.deepEqual(plain(f.model().Monday), [9, 10]);
  f.props.modelValue = f.model();await Vue.nextTick();f.state.setModernDay(false);assert.deepEqual(plain(f.model().Monday), []);
  f.props.editable = false;await Vue.nextTick();const count = f.events.length;f.state.toggleModernHour(10);f.state.setModernDay(true);assert.equal(f.events.length, count);
  assert.equal([...f.host.querySelectorAll('.u-time-week-modern__hours button')].every(button => button.disabled), true);
  f.language.full_locale = "fa-IR";f.language.dir = "rtl";f.language.calendar = calendars.Calendar.persian;await Vue.nextTick();
  assert.equal(f.state.modernDays[0].value, "Saturday");assert.match(f.host.querySelector('.u-time-week-modern__days button').textContent, /شنبه/);
  f.props.modelValue = { Monday: null };await Vue.nextTick();assert.equal(f.state.hoursForDay("Monday").length, 0);
});

test("legacy weekly callers retain their original rendering and hour payload", async t => {
  const f = await fixture(t, weekly, { editable: true, modelValue: { Monday: [9] } });
  assert.ok(f.host.querySelector('.t-w'));assert.equal(f.host.querySelector('.u-time-week-modern'), null);
  const target = f.host.querySelector('.t-h[day="Monday"][hour="10"]');assert.ok(target);target.click();await Vue.nextTick();
  assert.deepEqual(plain(f.model().Monday), [9, 10]);assert.equal(f.state.modern, false);
});

test("a pointed midnight keeps the selected-date hour24 identity in the modern view", async t => {
  const f = await fixture(t, weekly, { modern: true, editable: false, modelValue: { Monday: [24] }, pointedTimeUtc: new Date(2026, 10, 2, 0).toISOString() });
  f.state.showAllHours = true;await Vue.nextTick();
  const midnight = f.host.querySelector('.u-time-week-modern__hours button[aria-current=true]');
  assert.ok(midnight);assert.match(midnight.textContent, /00:00–01:00/);assert.equal(midnight.getAttribute('aria-pressed'), 'true');
  assert.equal(f.state.isPointed("Monday", 9), false);
});

test("date range selection is temporary until Block or Make available is chosen", async t => {
  const original = ["2026-11-12"];
  const f = await fixture(t, dates, { modelValue: original, min: "2026-11-01" });
  await f.click('[data-date="2026-11-04"]');await f.click('[data-date="2026-11-06"]');
  assert.equal(f.events.some(event => event[0] === "model"), false);assert.deepEqual(plain(f.state.selected), ["2026-11-04", "2026-11-05", "2026-11-06"]);
  f.state.applyAvailability(false);assert.deepEqual(plain(f.model()), ["2026-11-04", "2026-11-05", "2026-11-06", "2026-11-12"]);assert.deepEqual(original, ["2026-11-12"]);
  f.props.modelValue = f.model();await Vue.nextTick();await f.click('[data-date="2026-11-05"]');f.state.applyAvailability(true);
  assert.deepEqual(plain(f.model()), ["2026-11-04", "2026-11-06", "2026-11-12"]);
});

test("customer selections rehydrate, follow external resets and reject blocked ranges", async t => {
  const f = await fixture(t, dates, { editable: false, modelValue: ["2026-11-12"], min: "2026-11-01", selection: ["2026-11-04", "2026-11-05"] });
  assert.equal(f.host.querySelectorAll('[aria-pressed=true]').length, 2);assert.equal(f.host.querySelector('.u-service-date-availability__selection'), null);
  f.props.selection = ["2026-11-10"];await Vue.nextTick();assert.equal(f.host.querySelector('[data-date="2026-11-10"]').getAttribute('aria-pressed'), 'true');
  await f.click('[data-date="2026-11-15"]');assert.equal(f.state.rangeError, true);assert.deepEqual(plain(f.state.selected), ["2026-11-10"]);
  assert.equal(f.host.querySelector('[data-date="2026-11-12"]').disabled, true);
  f.props.selection = [];await Vue.nextTick();assert.equal(f.host.querySelectorAll('[aria-pressed=true]').length, 0);
  f.props.selectionMode = "single";await Vue.nextTick();await f.click('[data-date="2026-11-04"]');await f.click('[data-date="2026-11-06"]');assert.deepEqual(plain(f.state.selected), ["2026-11-06"]);
  f.state.applyAvailability(false);assert.equal(f.events.some(event => event[0] === "model"), false);
});

test("calendar keyboard navigation and Persian month layout use the actual rendered dates", async t => {
  const f = await fixture(t, dates, { editable: false, min: "2026-11-01", allowedDates: key => key !== "2026-11-03" });
  const first = f.host.querySelector('[data-date="2026-11-01"]');first.focus();first.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));await Vue.nextTick();await Vue.nextTick();
  assert.equal(document.activeElement.dataset.date, "2026-11-02");
  assert.equal(f.host.querySelector('[data-date="2026-11-03"]').disabled, true);
  assert.match(f.host.querySelector('[data-date="2026-11-03"]').getAttribute('aria-label'), /refined\.blocked$/);
  assert.match(f.host.querySelector('[data-date="2026-11-02"]').getAttribute('aria-label'), /refined\.available$/);
  assert.match(f.host.querySelector('[role="group"]').getAttribute('aria-label'), /refined\.dates_title$/);
  f.language.full_locale = "fa-IR";f.language.dir = "rtl";f.language.calendar = calendars.Calendar.persian;await Vue.nextTick();
  assert.match(f.host.querySelector('.u-service-date-availability__heading').textContent, /آبان/);
  assert.equal(f.state.month.start, "2026-10-23");assert.equal(f.state.firstWeekday, 6);
  assert.match(f.host.querySelector('[data-date="2026-10-31"]').getAttribute('aria-label'), /refined\.blocked$/);
  const second = f.host.querySelector('[data-date="2026-11-02"]');second.focus();second.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));await Vue.nextTick();await Vue.nextTick();
  assert.equal(document.activeElement.dataset.date, "2026-11-01");
  const before = f.state.month.start;f.state.moveMonth(-1);assert.equal(f.state.month.start, before);f.state.moveMonth(1);assert.equal(f.state.month.start, "2026-11-22");
  f.props.disabled = true;await Vue.nextTick();const count = f.events.length;f.state.selectDate("2026-11-24");f.state.applyAvailability(false);assert.equal(f.events.length, count);
});
