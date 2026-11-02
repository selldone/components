import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { isFunction, isString } from "lodash-es";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// Real provider, Smart controls, action wrapper and CoreMixin; all HTTP is synthetic.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const name of ["window", "document", "Element", "SVGElement", "HTMLElement", "Node"])
  globalThis[name] = dom.window[name];
const getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
const Vue = await import("vue");
const read = file => readFileSync(new URL(file, import.meta.url), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
function evaluate(source, imports = () => ({}), globals = {}) {
  const output = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
  assert.deepEqual(output.diagnostics, []);
  const exports = {};
  vm.runInNewContext(output.outputText, { exports, require: imports, console, getComputedStyle, ...globals });
  return exports;
}
function compile(file) {
  const { descriptor, errors } = parse(read(file)); assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: file, id: "sms-provider-test", transformAssetUrls: { includeAbsolute: true } });
  assert.deepEqual(template.errors, []);
  return { file, descriptor, code: template.code, render: evaluate(template.code, name => name === "vue" ? Vue : {}).render };
}
const provider = compile("./BShopSmsProvider.vue");
const selectSource = compile("../../../../ui/smart/select/USmartSelect.vue");
const switchSource = compile("../../../../ui/smart/switch/USmartSwitch.vue");
const toggleSource = compile("../../../../ui/smart/toggle/USmartToggle.vue");
const verifySource = compile("../../../../ui/smart/verify/USmartVerify.vue");
const buttonsSource = compile("../../../../ui/widget/buttons/SWidgetButtons.vue");
const { SmsProviders } = evaluate(read("../../../../../core-js/enums/sms/SmsProviders.ts"), name => ({ default: "/fixture/" + name.split("/").at(-1) }));
const nativeSelect = { ...evaluate(selectSource.descriptor.script.content, name => name === "vue" ? Vue : { isFunction }).default, render: selectSource.render };
const nativeSwitch = { ...evaluate(switchSource.descriptor.script.content, name => name === "vue" ? Vue : { default: nativeSelect }).default, render: switchSource.render };
const nativeToggle = { ...evaluate(toggleSource.descriptor.script.content).default, render: toggleSource.render };
const nativeVerify = { ...evaluate(verifySource.descriptor.script.content).default, render: verifySource.render };
const nativeButtons = { ...evaluate(buttonsSource.descriptor.script.content, name => name === "vue" ? Vue : {}).default, render: buttonsSource.render };
const wrapper = tag => Vue.defineComponent({ inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(tag, attrs, slots.default?.()) });
const button = Vue.defineComponent({
  inheritAttrs: false, props: ["disabled", "loading", "href", "prependIcon", "appendIcon"],
  setup: (props, { attrs, slots }) => () => Vue.h(props.href ? "a" : "button", { ...attrs, href: props.href, disabled: props.disabled || props.loading }, slots.default?.()),
});
const field = Vue.defineComponent({
  inheritAttrs: false, props: ["modelValue", "disabled", "label"], emits: ["update:modelValue"],
  setup: (props, { attrs, emit }) => () => Vue.h("label", { ...attrs, "data-field": props.label }, [props.label, Vue.h("input", { value: props.modelValue ?? "", disabled: props.disabled, onInput: event => emit("update:modelValue", event.target.value) })]),
});
const header = Vue.defineComponent({
  props: ["title", "addCaption", "addLoading"], emits: ["click:add"],
  setup: (props, { emit }) => () => Vue.h("header", [props.title, props.addCaption ? Vue.h("button", { disabled: props.addLoading, onClick: () => emit("click:add") }, props.addCaption) : null]),
});
const translate = (key, values) => key + (values ? " " + JSON.stringify(values) : "");
const service = (driver = "twilio") => ({ driver, enable: true, token_1: "fixture-one", token_2: "fixture-two", token_3: "fixture-three", token_4: "fixture-four", token_5: "fixture-five", network: "cloud", option: "all", errors: 0, error: null });

async function fixture(t, { modern = true, saved = service(), phone = "+12025550123" } = {}) {
  const requests = [], notices = [], errors = [], warnings = [], avatarCalls = [];
  const currentShop = Vue.reactive({ id: 7, title: "Fixture SMS shop", sms_service: saved });
  const globals = {
    window: {
      API: { GET_SHOP_SMS_SERVICE: id => `/fixture/shops/${id}/sms-service`, POST_SET_SHOP_SMS_SERVICE: id => `/fixture/shops/${id}/sms-service/set`, POST_RESET_SHOP_SMS_SERVICE: id => `/fixture/shops/${id}/sms-service/reset`, POST_SHOP_SMS_SERVICE_ACTION_SYNC: id => `/fixture/shops/${id}/sms-service/sync` },
      CDN: { GET_USER_AVATAR: (...args) => { avatarCalls.push(args); return "/fixture/avatar.png"; } },
    },
    axios: Object.fromEntries(["get", "post"].map(method => [method, (url, body) => new Promise((resolve, reject) => requests.push({ method, url, body: body === undefined ? undefined : plain(body), resolve, reject }))])),
  };
  const imports = name => {
    if (name === "vue") return Vue;
    if (name.includes("NotificationService")) return { default: new Proxy({}, { get: (_, method) => (...args) => notices.push([method, args]) }) };
    if (name.includes("SmsProviders")) return { SmsProviders };
    if (name.includes("SetupService")) return { SetupService: { LocalServiceCountry: () => "US" } };
    if (name.includes("USmartSwitch.vue")) return { default: nativeSwitch };
    if (name.includes("USmartSelect.vue")) return { default: nativeSelect };
    if (name.includes("USmartToggle.vue")) return { default: nativeToggle };
    if (name.includes("USmartVerify.vue")) return { default: nativeVerify };
    if (name.includes("SWidgetButtons.vue")) return { default: nativeButtons };
    if (name.endsWith(".vue")) return { default: wrapper("div") };
    throw new Error(`Unexpected SMS provider import: ${name}`);
  };
  const component = { ...evaluate(provider.descriptor.script.content, imports, globals).default, render: provider.render };
  const core = evaluate(read("../../../../mixin/CoreMixin.ts"), name => name === "lodash-es" ? { isString } : {}, globals).default;
  const instance = Vue.shallowRef();
  const app = Vue.createApp({ render: () => Vue.h(component, { ref: instance, shop: currentShop, modern }) });
  app.mixin(core);
  app.config.globalProperties.$t = translate;
  app.config.globalProperties.$store = { getters: { getUser: { id: 31, name: "Fixture user", phone } } };
  app.config.globalProperties.$vuetify = { display: { xs: false } };
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  app.directive("intersect", { mounted: (_, binding) => binding.value(true, [{ boundingClientRect: { top: 0 } }]) });
  const tags = new Set([provider, selectSource, switchSource, toggleSource, verifySource, buttonsSource].flatMap(source => [...source.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)].map(match => match[1])));
  for (const tag of tags) app.component(tag, tag === "v-btn" ? button : tag === "v-text-field" ? field : tag === "u-widget-header" ? header : wrapper("div"));
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  requests[0].resolve({ data: { sms_service: saved } }); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, requests, notices, avatarCalls, shop: currentShop,
    get state() { return instance.value; },
    async action(key) { const node = [...host.querySelectorAll("button")].find(node => node.textContent.includes(key)); assert.ok(node, `Action ${key} is available`); assert.equal(node.disabled, false); node.click(); await settle(); },
    async provider(driver) { instance.value.driver = driver; await settle(); },
    async nativeChoice(title) {
      const node = [...host.querySelectorAll('.s--smart-select .pp.row-hover')].find(node => node.textContent.includes(title));
      assert.ok(node, `Native choice ${title} is available`); node.click(); await settle();
    },
    async token(label, value) { const input = [...host.querySelectorAll("[data-field]")].find(node => node.dataset.field === label)?.querySelector("input"); assert.ok(input); input.value = value; input.dispatchEvent(new window.Event("input", { bubbles: true })); await settle(); },
  };
}

test("SMS provider and native Smart controls compile with production asset transforms", async () => {
  for (const source of [provider, selectSource, switchSource, toggleSource, verifySource, buttonsSource]) for (const style of source.descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: source.file, id: "sms-provider-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
  }
});

test("modern and legacy provider variants preserve catalogue, capability and conditional inputs", async t => {
  for (const modern of [true, false]) {
    const f = await fixture(t, { modern });
    assert.equal(f.requests[0].url, "/fixture/shops/7/sms-service");
    assert.equal(f.state.sms_providers.length, 4);
    assert.equal(f.host.querySelectorAll("[data-field]").length, 4, "Twilio retains four positional token inputs");
    assert.ok(f.host.querySelector('a[href="https://www.twilio.com"]'));
    await f.provider("kavenegar");
    assert.equal(f.host.querySelectorAll("[data-field]").length, 2);
    assert.equal(f.state.selected_provider.support_template, true);
    await f.provider("default");
    assert.equal(f.host.querySelectorAll("[data-field]").length, 0);
    assert.equal(f.host.querySelector(".s--smart-toggle"), null, "Default has no custom-provider test toggle");
    assert.match(f.host.textContent, /SMS fraud/);
    assert.ok(f.host.querySelector(".s-widget-buttons"), "The native auto-fixed action wrapper remains mounted");
    await f.action("global.actions.save");
    assert.equal(f.requests.at(-1).body.driver, "default");
    f.requests.at(-1).resolve({ data: { sms_service: { ...service("default"), enable: false } } }); await settle();
  }
});

test("common Save preserves all five tokens, network, delivery scope and optional validation flag", async t => {
  const f = await fixture(t, { saved: service("smsit") });
  await f.token("Auth token", "changed-fixture-token");
  await f.nativeChoice("Cloud Version");
  await f.nativeChoice("Decentralize Version");
  await f.nativeChoice("sms_messages_options.otp.title");
  f.host.querySelector('.s--smart-toggle .pa-2').click(); await settle();
  assert.equal(f.state.test, true);
  await f.action("global.actions.save");
  const request = f.requests.at(-1);
  assert.equal(request.url, "/fixture/shops/7/sms-service/set");
  assert.deepEqual(request.body, { enable: true, driver: "smsit", token_1: "changed-fixture-token", token_2: "fixture-two", token_3: "fixture-three", token_4: "fixture-four", token_5: "fixture-five", option: "otp", network: "decentralize", test: true });
  assert.equal(f.state.busy_set, true);
  const saved = { ...service("smsit"), ...request.body };
  request.resolve({ data: { sms_service: saved } }); await settle();
  assert.deepEqual(plain(f.shop.sms_service), saved); assert.equal(f.state.busy_set, false);
  assert.ok(f.notices.some(([method]) => method === "showSuccessAlert"));
});

test("failed saves retain drafts and release busy state; saved provider errors use warning feedback", async t => {
  const f = await fixture(t);
  await f.token("Auth token", "retained-fixture-token");
  await f.action("global.actions.save");
  f.requests.at(-1).resolve({ data: { error: true, error_msg: "Fixture denied" } }); await settle();
  assert.equal(f.state.tokens[0], "retained-fixture-token"); assert.equal(f.state.busy_set, false);
  await f.action("global.actions.save");
  f.requests.at(-1).reject(new Error("Fixture offline")); await settle();
  assert.equal(f.state.tokens[0], "retained-fixture-token"); assert.equal(f.state.busy_set, false);
  await f.action("global.actions.save");
  f.requests.at(-1).resolve({ data: { sms_service: { ...service(), error: "Fixture delivery failure" } } }); await settle();
  assert.ok(f.notices.some(([method]) => method === "showErrorAlert"));
  assert.ok(f.notices.some(([method]) => method === "showLaravelError"));
  assert.ok(f.notices.some(([method]) => method === "showWarningAlert"));
});

test("disabled modern provider blocks token/network/scope input and the validation toggle obeys phone availability", async t => {
  const f = await fixture(t, { saved: service("smsit") });
  await f.nativeChoice("global.commons.disable");
  assert.equal(f.state.enable, false);
  assert.ok([...f.host.querySelectorAll("[data-field] input")].every(input => input.disabled));
  const before = { option: f.state.option, network: f.state.network };
  await f.nativeChoice("sms_messages_options.otp.title");
  assert.equal(f.state.option, before.option, "Disabled native Smart Select cannot change delivery scope");
  assert.equal(f.host.querySelector(".s--smart-toggle"), null);
  await f.action("global.actions.save"); assert.equal(f.requests.at(-1).body.enable, false);
  f.requests.at(-1).resolve({ data: { sms_service: { ...service("smsit"), enable: false } } }); await settle();
  const withoutPhone = await fixture(t, { phone: null });
  assert.equal(withoutPhone.host.querySelector(".s--smart-toggle"), null);
});

test("error reset remains available and SMS-iT sync stays gated by the native Verify control", async t => {
  const f = await fixture(t, { saved: { ...service("smsit"), errors: 12, error: "Fixture error" } });
  await f.action("shop_sms_provider.reset_error");
  const reset = f.requests.at(-1);
  assert.equal(reset.url, "/fixture/shops/7/sms-service/reset"); assert.equal(reset.body, undefined);
  reset.resolve({ data: { sms_service: service("smsit") } }); await settle();
  assert.equal(f.state.busy_reset, false); assert.equal(f.state.sms_service.errors, 0);
  const sync = () => [...f.host.querySelectorAll("button")].find(node => node.textContent.includes("shop_sms_provider.sync_action.action"));
  assert.ok(sync()); assert.equal(sync().disabled, true);
  f.host.querySelector('.s--smart-verify .pp').click(); await settle();
  assert.equal(f.state.check, true); assert.equal(sync().disabled, false);
  assert.ok(f.avatarCalls.length, "Native Verify uses the actual Core avatar/user helpers");
  sync().click(); await settle();
  const request = f.requests.at(-1);
  assert.equal(request.url, "/fixture/shops/7/sms-service/sync"); assert.equal(request.body, undefined);
  request.resolve({ data: { message: "Fixture synchronization queued" } }); await settle();
  assert.equal(f.state.busy_sync, false);
  await f.provider("twilio"); assert.equal(sync(), undefined);
});
