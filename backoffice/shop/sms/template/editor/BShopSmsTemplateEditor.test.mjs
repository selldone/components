import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { isFunction, isString } from "lodash-es";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// Actual editor, native choices/text fields and Core helpers; HTTP is fixture-only.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const name of ["window", "document", "Document", "Element", "SVGElement", "HTMLElement", "HTMLInputElement", "HTMLTextAreaElement", "Node", "DOMParser", "NodeFilter"])
  globalThis[name] = dom.window[name];
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
const Vue = await import("vue");
const require = createRequire(import.meta.url);
const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const plain = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
function evaluate(source, imports = () => ({}), globals = {}) {
  const output = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  });
  assert.deepEqual(output.diagnostics, []);
  const exports = {};
  vm.runInNewContext(output.outputText, { exports, require: imports, console, setTimeout, clearTimeout, window, document, DOMParser, NodeFilter, getComputedStyle, ...globals });
  return exports;
}
function compile(path) {
  const { descriptor, errors } = parse(read(path));
  assert.deepEqual(errors, []);
  const output = compileTemplate({ source: descriptor.template.content, filename: path, id: "sms-editor-test", transformAssetUrls: { includeAbsolute: true } });
  assert.deepEqual(output.errors, []);
  return { descriptor, code: output.code, render: evaluate(output.code, name => name === "vue" ? Vue : {}).render };
}
const editor = compile("./BShopSmsTemplateEditor.vue");
const choices = compile("../../../../../ui/smart/select/USmartSelect.vue");
const switches = compile("../../../../../ui/smart/switch/USmartSwitch.vue");
const smart = { ...evaluate(choices.descriptor.script.content, name => name === "vue" ? Vue : { isFunction }).default, render: choices.render };
const smartSwitch = { ...evaluate(switches.descriptor.script.content, name => name === "vue" ? Vue : { default: smart }).default, render: switches.render };
const { Calendar } = evaluate(read("../../../../../../core-js/enums/language/Calendar.ts"));
const { Language } = evaluate(read("../../../../../../core-js/enums/language/Language.ts"), () => ({ Calendar }));
const { ShopOptionsHelper } = evaluate(read("../../../../../../core-js/helper/shop/ShopOptionsHelper.ts"));
const { SmsTemplateMode } = evaluate(read("../../../../../../core-js/enums/sms/SmsTemplateMode.ts"));
const { SmsProviders } = evaluate(read("../../../../../../core-js/enums/sms/SmsProviders.ts"), name => ({ default: "/fixture/" + name.split("/").at(-1) }));
const bundle = await build({
  stdin: {
    contents: 'export { createVuetify } from "vuetify"; export { VTextField } from "vuetify/components/VTextField"; export { VTextarea } from "vuetify/components/VTextarea";',
    resolveDir: fileURLToPath(new URL("../../../../../../../", import.meta.url)),
  },
  bundle: true, write: false, format: "cjs", platform: "node", loader: { ".css": "empty" }, external: ["vue"], logLevel: "silent",
});
const nativeModule = { exports: {} };
vm.runInNewContext(bundle.outputFiles[0].text, {
  module: nativeModule, exports: nativeModule.exports, require, console, process,
  window, document, Node, Element, HTMLElement, HTMLInputElement, HTMLTextAreaElement, SVGElement, ResizeObserver, getComputedStyle,
  setTimeout, clearTimeout, requestAnimationFrame: callback => setTimeout(callback, 0), cancelAnimationFrame: clearTimeout,
});
const native = nativeModule.exports;
const wrapper = tag => Vue.defineComponent({
  inheritAttrs: false,
  setup: (_, { attrs, slots }) => () => Vue.h(tag, attrs, [slots.activator?.({ props: {} }), slots.default?.()]),
});
const button = Vue.defineComponent({
  props: ["disabled", "loading"],
  setup: (props, { attrs, slots }) => () => Vue.h("button", { ...attrs, disabled: props.disabled || props.loading }, slots.default?.()),
});
const languageInput = Vue.defineComponent({
  props: ["modelValue", "availableLanguages", "disabled"], emits: ["update:modelValue"],
  setup: (props, { emit }) => () => Vue.h("select", {
    "data-language-picker": "", value: props.modelValue || "", disabled: props.disabled,
    onChange: event => emit("update:modelValue", event.target.value || null),
  }, [Vue.h("option", { value: "" }, "Default"), ...(props.availableLanguages || []).map(code => Vue.h("option", { value: code }, Language[code]?.title || code))]),
});
const shop = (id = 7, driver = "kavenegar", enable = true) => ({
  id, title: `Editor fixture ${id}`, icon: "fixture-shop.png", language: "en",
  options: [{ code: "languages", value: ["en", "fa"] }], sms_service: { driver, enable },
});
const message = (code = "avocado-order-submit-seller") => ({
  code, title: "New Avocado order", icon: "sms", params: { param1: "Shop name", param2: "Buyer name", param3: "Order ID" },
  body: "Store: :param1\nBuyer: :param2\nOrder: :param3",
  sample: "Store: <b>Example store</b><br>Buyer: <b>Alex</b><br>Order: <b>AVO-246</b>",
});
const existing = (mode = "text") => ({
  id: 12, code: "avocado-order-submit-seller", enable: true, language: "en", mode,
  text: "Hello :param2, your order is :param3.", data: [{ key: "template", value: "approved-pattern" }],
});

async function fixture(t, initial = {}) {
  const requests = [], notices = [], events = [], errors = [], warnings = [];
  const props = Vue.reactive({ modern: true, shop: shop(), sms: message(), template: null, ...initial });
  const request = (method, url, payload) => new Promise((resolve, reject) => requests.push({ method, url, payload: plain(payload), resolve, reject }));
  const globals = {
    window: { API: {
      POST_SHOP_SMS_ADD_TEMPLATE: id => `/fixture/shops/${id}/templates`,
      PUT_SHOP_SMS_EDIT_TEMPLATE: (id, templateId) => `/fixture/shops/${id}/templates/${templateId}`,
      GET_SHOP_SMS_TEMPLATE_DEFAULT_BODY: (id, code, language) => `/fixture/shops/${id}/defaults/${code}/${language}`,
    }, CDN: { GET_SHOP_IMAGE_PATH: () => "/fixture/shop.png" } },
    axios: Object.fromEntries(["get", "post", "put"].map(method => [method, (url, payload) => request(method, url, payload)])),
  };
  const core = evaluate(read("../../../../../mixin/CoreMixin.ts"), name => name.includes("/Language") ? { Language } : name === "lodash-es" ? { isString } : {}, globals).default;
  const dependencies = name => {
    if (name === "vue") return Vue;
    if (name.includes("USmartSwitch")) return { default: smartSwitch };
    if (name.includes("USmartSelect")) return { default: smart };
    if (name.includes("ULanguageInput")) return { default: languageInput };
    if (name.includes("SmsTemplateMode")) return { SmsTemplateMode };
    if (name.includes("SmsProviders")) return { SmsProviders: initial.providers || SmsProviders };
    if (name.includes("ShopOptionsHelper")) return { ShopOptionsHelper };
    if (name.includes("NotificationService")) return { default: new Proxy({}, { get: (_, method) => (...args) => notices.push([method, args]) }) };
    if (name === "vue-json-pretty") return { default: Vue.defineComponent({ props: ["data"], setup: value => () => Vue.h("pre", JSON.stringify(value.data)) }) };
    if (name.endsWith(".css")) return {};
    if (name.endsWith(".vue")) return { default: wrapper("div") };
    throw new Error(`Unexpected editor dependency: ${name}`);
  };
  const component = { ...evaluate(editor.descriptor.script.content, dependencies, globals).default, render: editor.render };
  const instance = Vue.shallowRef();
  const app = Vue.createApp({ render: () => Vue.h(component, {
    ...props, ref: instance,
    onAdd: value => events.push(["add", plain(value)]),
    onEdit: value => events.push(["edit", plain(value)]),
    onClose: () => events.push(["close"]),
  }) });
  app.use(native.createVuetify({ ssr: { clientWidth: 1280, clientHeight: 900 } }));
  app.mixin(core);
  app.config.globalProperties.$t = (key, values) => key + (values ? " " + JSON.stringify(values) : "");
  app.config.globalProperties.$n = String;
  app.config.globalProperties.$store = { getters: { getUser: { id: 1, phone: "+10000000000" } } };
  app.config.globalProperties.$i18n = { locale: "en" };
  app.config.globalProperties.require = name => "/fixture/" + name.split("/").at(-1);
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => {
    if (warning !== 'Data property "isFunction" is already defined in Methods.') warnings.push(warning);
  };
  const names = new Set([...([editor.code, choices.code, switches.code].join("\n")).matchAll(/_resolveComponent\("([^"]+)"\)/g)].map(match => match[1]));
  for (const name of names)
    if (!["v-btn", "v-textarea", "v-text-field"].includes(name)) app.component(name, wrapper("div"));
  app.component("v-btn", button);
  app.component("v-textarea", native.VTextarea);
  app.component("v-text-field", native.VTextField);
  app.directive("copy", {});
  const host = document.createElement("div"); document.body.append(host);
  app.mount(host); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, requests, notices, events, props,
    get state() { return instance.value; },
    async setProps(values) { Object.assign(props, values); await settle(); },
    async step(number) { instance.value.goToStep(number); await settle(); },
    async input(value) { const input = host.querySelector("textarea"); assert.ok(input); input.value = value; input.dispatchEvent(new window.Event("input", { bubbles: true })); await settle(); return input; },
    async chooseMode(code) {
      const item = [...host.querySelectorAll('[role="radio"]')].find(node => node.textContent.includes(SmsTemplateMode[code].title));
      assert.ok(item, `Native ${code} mode choice is rendered`); item.click(); await settle(); return item;
    },
    async language(code) { const input = host.querySelector("[data-language-picker]"); input.value = code || ""; input.dispatchEvent(new window.Event("change", { bubbles: true })); await settle(); },
    async reply(request, data) { request.resolve({ data }); await settle(); },
  };
}

test("Guided editor, native controls and scoped Sass compile", async () => {
  for (const [name, source] of [["editor", editor], ["choices", choices], ["switch", switches]])
    for (const style of source.descriptor.styles) {
      const output = await compileStyleAsync({ source: style.content, filename: name + ".vue", id: "sms-editor-test", scoped: style.scoped, preprocessLang: style.lang });
      assert.deepEqual(output.errors, []);
    }
});

test("Guided steps retain drafts and submit only from Review, preserving failures", async t => {
  const f = await fixture(t);
  const next = () => [...f.host.querySelectorAll("button")].find(node => node.textContent.includes("shop_sms.guided.continue"));
  assert.equal(f.state.currentStep, 1);
  assert.ok(next(), "Continue has a visible localized label");
  assert.ok(next().textContent.includes("arrow_forward"), "Continue retains its direction icon");
  assert.equal(next().disabled, true, "A format is required before continuing");
  next().click(); await settle();
  assert.equal(f.state.currentStep, 1);
  await f.chooseMode("text");
  assert.equal(next().disabled, false);
  next().click(); await settle();
  assert.equal(f.state.currentStep, 2);
  await f.input(" \n ");
  assert.equal(next().disabled, true, "The message is required before Review");
  next().click(); await settle();
  assert.equal(f.state.currentStep, 2);
  await f.input("Hello :param2, order :param3 is ready.");
  f.state.addTemplate(); await settle();
  assert.equal(f.requests.filter(r => r.method === "post").length, 0, "Message step cannot save");
  await f.step(1); await f.language(null);
  next().click(); await settle();
  assert.equal(f.state.language, null, "Default language remains a real null value");
  assert.equal(f.state.text, "Hello :param2, order :param3 is ready.");
  assert.equal(next().disabled, false);
  next().click(); await settle();
  assert.equal(f.state.currentStep, 3);
  assert.equal(next(), undefined, "Review exposes Save instead of Continue");
  f.state.addTemplate(); f.state.addTemplate(); await settle();
  const writes = f.requests.filter(r => r.method === "post");
  assert.equal(writes.length, 1, "Busy saves cannot submit twice");
  assert.equal(writes[0].url, "/fixture/shops/7/templates");
  assert.equal(writes[0].payload.language, null);
  assert.equal(writes[0].payload.text, "Hello :param2, order :param3 is ready.");
  await f.reply(writes[0], { error: true, error_msg: "Fixture validation failure" });
  assert.equal(f.state.busy, false);
  assert.equal(f.state.currentStep, 3);
  assert.equal(f.state.text, writes[0].payload.text);
  assert.deepEqual(f.events, []);
  f.state.addTemplate(); await settle();
  const success = f.requests.filter(r => r.method === "post").at(-1);
  await f.reply(success, { template: { id: 99, ...success.payload } });
  assert.deepEqual(f.events.map(([name]) => name), ["add", "close"]);
  assert.equal(f.events[0][1].id, 99);
});

test("legacy editing keeps the message and Save available without Guided step navigation", async t => {
  const record = existing();
  const f = await fixture(t, { modern: false, template: record });
  assert.equal(f.state.currentStep, 1);
  assert.equal([...f.host.querySelectorAll("button")].some(node => node.textContent.includes("shop_sms.guided.continue")), false);
  await f.input("Legacy local draft for :param2");
  assert.equal(record.text, "Hello :param2, your order is :param3.");
  const save = [...f.host.querySelectorAll("button")].find(node => node.textContent.includes("global.actions.save_changes"));
  assert.ok(save); assert.equal(save.disabled, false);
  save.click(); await settle();
  const write = f.requests.find(request => request.method === "put");
  assert.equal(write.url, "/fixture/shops/7/templates/12");
  assert.equal(write.payload.text, "Legacy local draft for :param2");
  await f.reply(write, { template: { ...record, ...write.payload } });
  assert.deepEqual(f.events.map(([name]) => name), ["edit", "close"]);
});

test("editing locks format, clones mappings and retains save while delivery is disabled", async t => {
  const record = existing();
  const f = await fixture(t, { shop: shop(7, "kavenegar", false), template: record });
  assert.equal(f.state.mode, "text");
  const unsupportedChange = await f.chooseMode("template");
  assert.equal(unsupportedChange.getAttribute("aria-disabled"), "true");
  assert.equal(f.state.mode, "text");
  f.state.data[0].value = "local-draft";
  assert.equal(record.data[0].value, "approved-pattern", "Editing must not mutate the owner’s row before Save");
  await f.step(2); await f.input("Updated message for :param2"); await f.step(3);
  f.state.editTemplate(); await settle();
  const write = f.requests.find(r => r.method === "put");
  assert.ok(write, "Existing templates remain editable while delivery is paused");
  assert.equal(write.url, "/fixture/shops/7/templates/12");
  assert.equal(write.payload.mode, "text");
  assert.equal(write.payload.data[0].value, "local-draft");
  await f.reply(write, { error: true, error_msg: "Fixture denied" });
  assert.equal(f.state.text, "Updated message for :param2");
  assert.equal(record.text, "Hello :param2, your order is :param3.");
  assert.equal(record.data[0].value, "approved-pattern");
});

test("unsupported provider formats and unavailable Add flows cannot send a write", async t => {
  const f = await fixture(t, { shop: shop(7, "twilio") });
  const disabled = await f.chooseMode("template");
  assert.equal(disabled.getAttribute("aria-disabled"), "true");
  assert.notEqual(f.state.mode, "template");
  f.state.mode = "template"; f.state.currentStep = 3; f.state.addTemplate(); await settle();
  assert.equal(f.requests.filter(r => r.method !== "get").length, 0);
  await f.setProps({ shop: shop(8, "kavenegar", false) });
  f.state.mode = "text"; f.state.text = "Local notification"; f.state.currentStep = 3; f.state.addTemplate(); await settle();
  assert.equal(f.requests.filter(r => r.method !== "get").length, 0);
  await f.setProps({ shop: shop(9, "default") });
  f.state.mode = "text"; f.state.text = "Local notification"; f.state.currentStep = 3; f.state.addTemplate(); await settle();
  assert.equal(f.requests.filter(r => r.method !== "get").length, 0);
});

test("preview replacement handles exact parameters, literal values and missing samples safely", async t => {
  const f = await fixture(t);
  const output = f.state.resolveTextPreview(":param1 | :param10 | :param2 | :param99", {
    param1: "<img src=x>", param10: "ten", param2: "$&",
  });
  assert.equal(output.text, "<img src=x> | ten | $& | :param99");
  assert.equal(output.unresolved.length, 1);
  assert.deepEqual(plain(f.state.extractSampleValues(f.props.sms.body, f.props.sms.sample)), {
    param1: "Example store", param2: "Alex", param3: "AVO-246",
  });
  await f.setProps({ sms: {
    ...message("markup-sample"),
    sample: "Store: <b>&lt;img src=x onerror=alert(1)&gt;</b><br>Buyer: <b>$&</b><br>Order: <b>AVO-246</b>",
  } });
  await f.chooseMode("text"); await f.step(2); await f.input(":param1 :param2 :param10");
  assert.match(f.state.text_preview.text, /<img src=x onerror=alert\(1\)>/);
  assert.match(f.state.text_preview.text, /\$& :param10/);
  assert.equal(f.host.querySelector('img[src="x"]'), null, "Sample values render as text, never authored HTML");
});

test("parameter insertion replaces the actual native textarea selection and restores its caret", async t => {
  const f = await fixture(t); await f.chooseMode("text"); await f.step(2);
  const input = await f.input("Hello | world");
  input.focus(); input.setSelectionRange(6, 7);
  f.state.rememberTextSelection({ target: input });
  f.state.insertParameter("param2"); await settle();
  assert.equal(f.state.text, "Hello :param2 world");
  assert.equal(input.value, f.state.text);
  assert.equal(input.selectionStart, 13);
  assert.equal(input.selectionEnd, 13);
  assert.equal(document.activeElement, input);
});

test("default-language cache restores callbacks without replacing a newer draft or plain-text state", async t => {
  const f = await fixture(t); await f.chooseMode("text"); await f.step(2);
  f.state.language = null; await settle();
  f.state.getDefaultText(); await settle();
  const textDefault = f.requests.at(-1);
  assert.match(textDefault.url, /\/default$/);
  assert.equal(textDefault.payload.params.mode, "text");
  await f.reply(textDefault, { body: "Default :param2", tokens: {}, language: "en" });
  assert.equal(f.state.text, "Default :param2");
  const count = f.requests.length;
  f.state.text = "Changed local draft";
  f.state.getDefaultText(); await settle();
  assert.equal(f.requests.length, count, "The requested default-language alias reuses its cached response");
  assert.equal(f.state.text, "Default :param2");
  f.state.text = "Plain draft to retain";
  f.state.mode = "template"; await settle();
  const templateDefault = f.requests.at(-1);
  assert.equal(templateDefault.payload.params.mode, "template");
  await f.reply(templateDefault, { body: "Pattern %token2", tokens: { "%token2": "Buyer" }, language: "en" });
  assert.equal(f.state.sample_template, "Pattern %token2");
  f.state.sample_template = null; f.state.sample_template_tokens = [];
  const templateCount = f.requests.length;
  f.state.getDefaultTemplate(); await settle();
  assert.equal(f.requests.length, templateCount);
  assert.equal(f.state.sample_template, "Pattern %token2");
  assert.deepEqual(plain(f.state.sample_template_tokens), { "%token2": "Buyer" });
  assert.equal(f.state.text, "Plain draft to retain", "Structured defaults never become the plain-text draft");
  f.state.mode = "text"; f.state.language = "fa"; await settle();
  f.state.getDefaultText(); await settle();
  const pending = f.requests.at(-1);
  f.state.text = "New text typed while waiting";
  await f.reply(pending, { body: "Obsolete reset", tokens: {}, language: "fa" });
  assert.equal(f.state.text, "New text typed while waiting");
  assert.equal(f.state.busy_default, false);
});

test("Kavenegar keeps its fixed pattern key while other provider mappings remain available", async t => {
  const f = await fixture(t); await f.chooseMode("template");
  await f.reply(f.requests.at(-1), { body: "Pattern %token", tokens: { "%token": "Shop" }, language: "en" });
  assert.equal(f.state.is_kavenegar, true);
  assert.deepEqual(plain(f.state.data), [{ key: "template", value: f.props.sms.code }]);
  assert.equal(f.state.isPermanent("template"), true);
  assert.deepEqual(plain(f.state.provider_token_rows).map(row => row.token), ["%token", "%token2", "%token3"]);
  await f.step(2);
  assert.ok(f.host.querySelector('.b-shop-sms-template-editor__parameter--fixed'));
  assert.equal(f.host.querySelector('.b-shop-sms-template-editor__parameter--fixed button'), null);
  const fixedKey = f.host.querySelector('.b-shop-sms-template-editor__fixed-key');
  assert.ok(fixedKey);
  assert.match(fixedKey.textContent, /template/);
  const dynamicProvider = {
    ...SmsProviders.find(provider => provider.driver === "kavenegar"),
    driver: "fixture-dynamic", title: "Fixture dynamic provider",
    template: { has_dynamic_parameters: true, permanent_params: ["template"] },
  };
  const dynamic = await fixture(t, { shop: shop(8, "fixture-dynamic"), providers: [...SmsProviders, dynamicProvider] });
  await dynamic.chooseMode("template");
  await dynamic.reply(dynamic.requests.at(-1), { body: "Pattern {{buyer}}", tokens: {}, language: "en" });
  await dynamic.step(2);
  assert.equal(dynamic.state.is_kavenegar, false);
  assert.match(dynamic.host.textContent, /shop_sms\.template_edit\.template\.add_new_parameter/);
  dynamic.state.data.push({ key: "buyer", value: "param2" }); await settle();
  assert.equal(dynamic.state.preview_data.buyer, "param2", "Modern configuration previews preserve the raw saved alias");
  assert.equal(dynamic.state.isPermanent("buyer"), false);
});

test("an existing structural override retains an empty mapping and the message-code fallback", async t => {
  const record = { ...existing("template"), data: [] };
  const f = await fixture(t, { shop: shop(7, "twilio"), template: record });
  const sample = f.requests.findLast(request => request.method === "get");
  if (sample) await f.reply(sample, { body: "", tokens: {}, language: "en" });
  assert.deepEqual(plain(f.state.data), []);
  assert.deepEqual(plain(f.state.preview_data), {}, "The saved configuration preview retains the empty mapping");
  f.state.data.push({ key: " ", value: "param2" }); await settle();
  assert.equal(f.state.can_continue_message, false, "Existing mapping rows still require a real key");
  f.state.data = []; await settle();
  await f.step(2); await f.step(3);
  assert.equal(f.state.currentStep, 3);
  assert.equal(f.state.canSubmitTemplate(), true, "An empty mapping still has a valid code fallback");
  f.state.editTemplate(); await settle();
  const write = f.requests.find(request => request.method === "put");
  assert.ok(write);
  assert.deepEqual(write.payload.data, []);
  assert.equal(write.payload.code, record.code);
  await f.reply(write, { template: { ...record, ...write.payload } });
  assert.deepEqual(f.events.map(([name]) => name), ["edit", "close"]);
});

test("scope changes discard stale defaults and save results without applying another shop’s response", async t => {
  const f = await fixture(t); await f.chooseMode("text"); await f.step(2);
  f.state.getDefaultText(); await settle();
  const oldDefault = f.requests.at(-1);
  await f.setProps({ shop: shop(8), sms: message("other-message") });
  assert.equal(f.state.currentStep, 1);
  assert.equal(f.state.busy_default, false);
  await f.reply(oldDefault, { body: "Old shop text", tokens: {}, language: "en" });
  assert.notEqual(f.state.text, "Old shop text");
  assert.equal(f.notices.length, 0);
  await f.chooseMode("text"); await f.step(2); await f.input("Current shop draft"); await f.step(3);
  f.state.addTemplate(); await settle();
  const oldWrite = f.requests.find(r => r.method === "post");
  assert.equal(oldWrite.url, "/fixture/shops/8/templates");
  await f.setProps({ shop: shop(9), sms: message("third-message") });
  await f.reply(oldWrite, { template: { id: 88, code: "other-message" } });
  assert.deepEqual(f.events, []);
  assert.equal(f.state.currentStep, 1);
  assert.equal(f.state.busy, false);
});
