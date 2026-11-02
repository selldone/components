import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import ts from "typescript";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
function evaluate(source, dependencies = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, Intl, Date, Set, console, window: {},
    setInterval: () => 1, clearInterval() {},
    axios: { put: () => assert.fail("The configuration preview must never make a customer request") },
    require: (name) => {
      if (name === "vue") return Vue;
      if (dependencies[name]) return dependencies[name];
      if (name.endsWith(".vue")) return { default: slotStub };
      throw new Error(`Unresolved test dependency: ${name}`);
    },
  });
  return exports;
}
const slotStub = Vue.defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () => Vue.h("div", attrs, [slots.activator?.({ props: {} }), slots.default?.()]);
  },
});
const buttonStub = Vue.defineComponent({
  setup(_, { attrs, slots }) { return () => Vue.h("button", attrs, slots.default?.()); },
});
function controlStub(name) {
  return Vue.defineComponent({
    props: ["modelValue", "disabled", "label"],
    setup: (props) => () => Vue.h("div", {
      "data-control": name, "data-disabled": props.disabled, "aria-label": props.label,
    }),
  });
}
function compile(relative, dependencies = {}) {
  const { descriptor, errors } = parse(read(relative));
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: relative, id: relative });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles)
    assert.deepEqual(compileStyle({ source: style.content, filename: relative, id: relative, preprocessLang: style.lang }).errors, []);
  const component = evaluate(descriptor.script.content, dependencies).default;
  component.render = evaluate(template.code).render;
  return component;
}
const types = evaluate(read("../../../../../core-js/enums/product/ServiceTypes.ts"));
const weekdays = evaluate(read("../../../../../core-js/enums/logistic/WeekDays.ts"));
const calendars = evaluate(read("../../../../../core-js/enums/language/Calendar.ts"));
const dates = evaluate(read("../../../../../core-js/helper/date/DateConverter.ts"), { "../../enums/language/Calendar": calendars });
const dateMixin = evaluate(read("../../../../mixin/date/DateMixin.ts"), { "@selldone/core-js/helper/date/DateConverter": dates });
const appointmentHelpers = evaluate(read("../../../../storefront/product/service/service-appointment.ts"));
const customerForm = compile("../../../../storefront/product/service/form/SProductServiceForm.vue", {
  "@selldone/core-js/enums/product/ServiceTypes": types,
  "@selldone/components-vue/plugins/notification/NotificationService.ts": { default: {} },
  "lodash-es": { throttle: (fn) => fn },
  "../service-appointment": appointmentHelpers,
});
const component = compile("./BProductServiceManage.vue", {
  "@selldone/core-js/enums/product/ServiceTypes": types,
  "@selldone/core-js/enums/logistic/WeekDays.ts": weekdays,
  "@selldone/components-vue/mixin/date/DateMixin.ts": dateMixin,
  "../../../../ui/time/week-picker/UTimeWeekPicker.vue": { default: controlStub("weekly") },
  "../../../../ui/date/service-availability/UServiceDateAvailability.vue": { default: controlStub("calendar") },
  "../../../../ui/task/editor/UTasksEditor.vue": { default: controlStub("tasks") },
  "../../../../ui/number/input/UNumberInput.vue": { default: controlStub("number") },
  "../../../../storefront/product/service/form/SProductServiceForm.vue": { default: customerForm },
});
const translations = Object.fromEntries(["en", "fa"].map((language) => [language, {
  dashboard: evaluate(read(`../../../../../translate/dashboard/${language}.ts`)).default,
  global: evaluate(read(`../../../../../translate/global/${language}.ts`), {
    [`./colors/${language}`]: evaluate(read(`../../../../../translate/global/colors/${language}.ts`)),
  }).default,
}]));
function translate(language, key, values = {}) {
  const root = key.startsWith("global.") ? translations[language].global : translations[language].dashboard;
  const path = key.startsWith("global.") ? key.slice(7) : key;
  const text = path.split(".").reduce((value, part) => value?.[part], root);
  assert.equal(typeof text, "string", `Missing ${language} translation: ${key}`);
  return text.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}
const plain = (value) => JSON.parse(JSON.stringify(value));
function fixture(outputs = { type: "APPOINTMENT", days: { Monday: [24, 13] } }, options = {}) {
  const state = { ...component.data(), product: { id: 7, type: "SERVICE", outputs: plain(outputs), parent_id: null },
    modern: true, disabled: false, metadataAvailable: true, $t: (key, values) => translate("en", key, values), ...options };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, computed] of Object.entries(component.computed)) Object.defineProperty(state, name, {
    get: (typeof computed === "function" ? computed : computed.get).bind(state),
    set: typeof computed === "object" ? computed.set?.bind(state) : undefined,
  });
  component.created.call(state);
  return state;
}

test("model changes preserve independent drafts while weekly days and membership duration stay distinct", () => {
  const state = fixture();
  state.outputs.days.Monday.push(14);
  state.selectType("SUBSCRIPTION");
  assert.equal(state.duration, 30);
  assert.equal(state.outputs.days, undefined);
  state.duration = 90;
  state.selectType("APPOINTMENT");
  assert.deepEqual(plain(state.outputs.days), { Monday: [24, 13, 14] });
  assert.equal(state.outputs.subscription, undefined);
  state.selectType("SUBSCRIPTION");
  assert.equal(state.duration, 90);
  assert.equal(state.hasUnsavedChanges, true);
  state.discardChanges();
  assert.deepEqual(plain(state.outputs), { type: "APPOINTMENT", days: { Monday: [24, 13] } });
  assert.equal(state.outputs, state.product.outputs);
  assert.equal(state.hasUnsavedChanges, false);
  assert.deepEqual(plain(state.modelDrafts), {});
});

test("legacy membership days survive a model round trip then save canonically", () => {
  const state = fixture({ type: "SUBSCRIPTION", days: 90 });
  assert.equal(state.duration, 90);
  assert.equal(state.hasUnsavedChanges, false);
  state.selectType("APPOINTMENT");
  assert.deepEqual(plain(state.outputs.days), {});
  state.selectType("SUBSCRIPTION");
  assert.equal(state.duration, 90);
  assert.equal(state.prepareSave(), true);
  assert.equal(state.outputs.subscription, 90);
  assert.equal(state.outputs.days, undefined);
  state.markSaved();
  assert.equal(state.hasUnsavedChanges, false);
});

test("initialization resets replaced product drafts without guessing legacy timezones", () => {
  for (const outputs of [null, [], "invalid"]) {
    const state = fixture(outputs);
    assert.deepEqual(plain(state.outputs), { type: null });
    assert.equal(state.hasUnsavedChanges, false);
  }
  const state = fixture({ type: "APPOINTMENT", days: { Monday: [13] } });
  assert.equal(state.outputs.timezone, undefined);
  state.selectType("BOOKING");
  assert.equal(state.outputs.timezone, undefined, "Existing weekly services stay in their legacy mode until timezone selection");
  state.product = { id: 9, type: "SERVICE", outputs: { type: "CHARGE", charge: 20 } };
  component.watch.product.call(state);
  assert.deepEqual(plain(state.outputs), { type: "CHARGE", charge: 20 });
  assert.equal(state.hasUnsavedChanges, false);
  assert.deepEqual(plain(state.modelDrafts), {});
});

test("default tasks, blocked dates and credit drafts remain available when switching back", () => {
  const state = fixture({ type: "DEMAND", tasks: [{ title: "Inspect", progress: 0 }], days: { Monday: [13] } });
  state.selectType("BOOKING");
  state.outputs.disabled = ["2026-11-30"];
  state.setTime("checkin", "16:30");
  state.setTime("checkout", "10:15");
  state.selectType("CHARGE");
  state.outputs.charge = 2000;
  state.selectType("BOOKING");
  assert.deepEqual(plain(state.outputs.disabled), ["2026-11-30"]);
  assert.equal(state.timeValue(state.outputs.checkin), "16:30");
  assert.equal(state.timeValue(state.outputs.checkout), "10:15");
  assert.deepEqual(plain(state.outputs.tasks), [{ title: "Inspect", progress: 0 }]);
  state.selectType("CHARGE");
  assert.equal(state.outputs.charge, 2000);
  assert.equal(state.outputs.tasks, undefined);
  assert.equal(state.outputs.disabled, undefined);
  state.selectType("DEMAND");
  assert.deepEqual(plain(state.outputs.days), { Monday: [13] });
});

test("validation names real invalid fields without mutating failed drafts", () => {
  const cases = [
    [{ type: null }, "choose_model"],
    [{ type: "APPOINTMENT", timezone: "Unknown/zone", days: {} }, "invalid_timezone"],
    [{ type: "SUBSCRIPTION", subscription: 0 }, "invalid_duration"],
    [{ type: "SUBSCRIPTION", subscription: 1.5 }, "invalid_duration"],
    [{ type: "SUBSCRIPTION", subscription: 36501 }, "invalid_duration"],
    [{ type: "CHARGE", charge: -1 }, "invalid_credit"],
    [{ type: "CHARGE", charge: 2147483648 }, "invalid_credit"],
    [{ type: "CUSTOM", tasks: [{ title: " ", progress: 0 }] }, "invalid_tasks"],
    [{ type: "CUSTOM", tasks: [{ title: "Inspect", progress: 101 }] }, "invalid_tasks"],
    [{ type: "BOOKING", checkin: { HH: 24, mm: 0 }, checkout: { HH: 11, mm: 0 } }, "invalid_time"],
  ];
  for (const [outputs, error] of cases) {
    const state = fixture(outputs);
    const before = JSON.stringify(state.product.outputs);
    assert.equal(state.prepareSave(), false, error);
    assert.equal(state.validationMessage, translate("en", `service_design.refined.${error}`));
    assert.equal(JSON.stringify(state.product.outputs), before, error);
  }
  for (const outputs of [{ type: "CHARGE", charge: 0 }, { type: "SUBSCRIPTION", subscription: 36500 }, { type: "APPOINTMENT", days: {} }])
    assert.equal(fixture(outputs).prepareSave(), true);
  const tasks = Array.from({ length: 101 }, () => ({ title: "Inspect", progress: 0 }));
  assert.equal(fixture({ type: "CUSTOM", tasks }).prepareSave(), false);
  assert.equal(fixture({ type: "CUSTOM", tasks: tasks.slice(0, 100) }).prepareSave(), true);
  assert.equal(fixture({ type: "CUSTOM", tasks: [{ title: "x".repeat(1000), progress: 0 }] }).prepareSave(), true);
  assert.equal(fixture({ type: "CUSTOM", tasks: [{ title: "x".repeat(1001), progress: 0 }] }).prepareSave(), false);
});

test("busy and inherited services cannot change, discard or prepare protected drafts", () => {
  for (const inherited of [false, true]) {
    const state = fixture({ type: "SUBSCRIPTION", days: 90 });
    state.product.parent_id = inherited ? 3 : null;
    state.disabled = !inherited;
    const original = JSON.stringify(state.product.outputs);
    state.selectType("BOOKING");
    state.duration = 30;
    state.setTime("checkin", "14:00");
    state.discardChanges();
    assert.equal(JSON.stringify(state.product.outputs), original);
    assert.equal(state.prepareSave(), inherited, "Inherited settings remain unchanged while other product fields may save");
  }
});

test("all seven real templates render the matching controls and safe customer preview in English and Persian", async () => {
  for (const language of ["en", "fa"]) for (const code of Object.keys(types.ServiceTypes)) {
    const state = fixture({ type: null });
    state.selectType(code);
    state.outputs.timezone = "Asia/Dubai";
    const app = Vue.createSSRApp(component, { modern: true, metadataAvailable: true, product: state.product });
    Object.assign(app.config.globalProperties, {
      $t: (key, values) => translate(language, key, values), $n: (value) => new Intl.NumberFormat(language).format(value),
      getCurrentLanguage: () => ({ full_locale: language === "fa" ? "fa-IR" : "en-US", dir: language === "fa" ? "rtl" : "ltr", calendar: { first_day_of_week: 1, calendar: language === "fa" ? "persian" : "gregory" } }),
    });
    for (const name of ["VIcon", "VListSubheader", "VRow", "VDatePicker", "VChip", "VBtnToggle", "VAutocomplete", "VTooltip", "VMenu", "VCard", "UWidgetHeader", "ULoadingProgress", "Flag"]) app.component(name, slotStub);
    app.component("VBtn", buttonStub);
    const warnings = [];
    app.config.warnHandler = (warning) => warnings.push(warning);
    const html = await renderToString(app);
    assert.deepEqual(warnings, [], `${language}/${code}`);
    assert.ok(html.includes(translate(language, `service_design.refined.models.${code}.title`)));
    assert.equal(html.includes('data-control="weekly"'), types.ServiceTypes[code].form.includes("reserve"));
    assert.equal(html.includes('data-control="calendar"'), types.ServiceTypes[code].form.includes("booking"));
    assert.equal(html.includes('data-control="tasks"'), types.ServiceTypes[code].form.includes("tasks"));
    assert.match(html, /b-service-config__preview/);
    if (code === "RENTAL") {
      assert.ok(html.includes(translate(language, "service_design.refined.pickup")));
      assert.ok(html.includes(translate(language, "service_design.refined.return")));
      assert.match(html, /14:00/);
      assert.match(html, /11:00/);
    }
  }
});

test("the actual Outputs wrapper reacts to its mounted service ref and delegates save/discard", async () => {
  const wrapper = compile("../../edit/outputs/BProductEditOutputs.vue", {
    "@selldone/core-js/enums/product/ProductType": { ProductType: { SERVICE: { code: "SERVICE" }, VIRTUAL: { code: "VIRTUAL" }, PHYSICAL: { code: "PHYSICAL" } } },
    "../../service/manage/BProductServiceManage.vue": { default: component },
    "../../../../ui/form/SFormBuilder.vue": { default: controlStub("virtual-output-form") },
  });
  const node = (tag, text = "") => ({ tag, text, children: [], parent: null, props: {}, style: {} });
  const renderer = Vue.createRenderer({
    createElement: node, createText: (text) => node("#text", text), createComment: (text) => node("#comment", text),
    insert(child, parent, anchor) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = parent; const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, child); },
    remove(child) { child.parent?.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
    setText: (element, text) => { element.text = text; }, setElementText: (element, text) => { element.text = text; element.children = []; },
    patchProp: (element, key, previous, value) => { element.props[key] = value; },
    parentNode: (element) => element.parent, nextSibling: (element) => element.parent?.children[element.parent.children.indexOf(element) + 1],
  });
  const product = Vue.reactive({ id: 7, type: "SERVICE", outputs: { type: "CHARGE", charge: 100 } });
  const app = renderer.createApp(wrapper, { product, modern: true, externalActionButtons: true });
  for (const name of ["VIcon", "VListSubheader", "VRow", "VDatePicker", "VChip", "VBtnToggle", "VAutocomplete", "VTooltip", "VMenu", "VCard", "UWidgetHeader", "ULoadingProgress", "Flag"]) app.component(name, slotStub);
  app.component("VBtn", buttonStub);
  app.directive("ctrl", {});
  Object.assign(app.config.globalProperties, {
    $t: (key, values) => translate("en", key, values), $n: String,
    getCurrentLanguage: () => ({ full_locale: "en-US", dir: "ltr", calendar: { first_day_of_week: 1, calendar: "gregory" } }),
  });
  const warnings = [];
  app.config.warnHandler = (warning) => warnings.push(warning);
  const errors = [];
  app.config.errorHandler = (error) => errors.push(error);
  const host = node("root");
  const state = app.mount(host);
  try {
    await Vue.nextTick();
    assert.ok(state.serviceEditor, "The shallowRef receives the actual child instance");
    assert.equal(state.hasUnsavedChanges, false);
    product.outputs.charge = 300;
    await Vue.nextTick();
    assert.equal(state.hasUnsavedChanges, true);
    assert.equal(state.prepareSave(), true);
    state.discardChanges();
    await Vue.nextTick();
    assert.equal(product.outputs.charge, 100);
    assert.equal(state.hasUnsavedChanges, false);
    product.outputs.charge = 400;
    state.markSaved();
    await Vue.nextTick();
    assert.equal(state.hasUnsavedChanges, false);
    product.outputs.charge = -1;
    assert.equal(state.prepareSave(), false);
    assert.equal(state.serviceEditor.validationMessage, translate("en", "service_design.refined.invalid_credit"));
    product.type = "VIRTUAL";
    product.outputs = [];
    await Vue.nextTick();
    assert.equal(state.serviceEditor, null);
    assert.equal(state.hasUnsavedChanges, false);
    assert.equal(state.prepareSave(), true);
    const descendants = (element) => [element, ...element.children.flatMap(descendants)];
    assert.ok(descendants(host).some((element) => element.props["data-control"] === "virtual-output-form"));
    assert.deepEqual(warnings, []);
    assert.deepEqual(errors, []);
  } finally { app.unmount(); }
});
