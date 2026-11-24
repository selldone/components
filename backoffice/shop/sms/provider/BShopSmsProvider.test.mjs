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
  const output = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, esModuleInterop: false, ignoreDeprecations: "6.0", module: ts.ModuleKind.CommonJS } });
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
const wrapper = tag => Vue.defineComponent({ inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(tag, attrs, [slots.activator?.({ props: {} }), slots.default?.()]) });
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
// Synthetic providers, as the backend catalog returns them (no credential values).
const catalog = {
  recommended: ["fixture-text"],
  providers: [
    { key: "fixture-text", title: "Fixture Text", description: "Synthetic text provider.", logo: "/fixture/text.png", url: "https://text.fixture.test", docs_url: null, countries: ["US"], international: true, plain_text: true, template: "none", verify: true, actions: ["sync_contacts"],
      fields: [
        { key: "user", title: "Fixture user", hint: null, secret: false, required: true, max: 64, options: [] },
        { key: "key", title: "Fixture key", hint: "Synthetic hint", secret: true, required: true, max: 255, options: [] },
        { key: "region", title: "Fixture region", hint: null, secret: false, required: false, max: 16, options: ["eu", "us"] },
      ] },
    { key: "fixture-template", title: "Fixture Template", description: null, logo: null, url: null, docs_url: null, countries: ["DE"], international: false, plain_text: false, template: "named", verify: false, actions: [],
      fields: [{ key: "token", title: "Template token", hint: null, secret: true, required: true, max: 64, options: [] }] },
  ],
};
const service = (driver = "fixture-text") => ({ driver, enable: true, option: "all", errors: 0, error: null, credentials_status: { user: "stored", key: "stored", region: "missing" }, credential_values: { user: "fixture-user", region: null } });

async function fixture(t, { modern = true, saved = service(), phone = "+12025550123", readOnly = false } = {}) {
  const requests = [], notices = [], errors = [], warnings = [], avatarCalls = [];
  const currentShop = Vue.reactive({ id: 7, title: "Fixture SMS shop", sms_service: saved });
  const globals = {
    window: {
      API: { GET_SHOP_SMS_SERVICE: id => `/fixture/shops/${id}/sms-service`, GET_SHOP_SMS_PROVIDERS: id => `/fixture/shops/${id}/sms-providers`, POST_SET_SHOP_SMS_SERVICE: id => `/fixture/shops/${id}/sms-service/set`, POST_RESET_SHOP_SMS_SERVICE: id => `/fixture/shops/${id}/sms-service/reset`, POST_SHOP_SMS_SERVICE_ACTION_SYNC: id => `/fixture/shops/${id}/sms-service/sync` },
      CDN: { GET_USER_AVATAR: (...args) => { avatarCalls.push(args); return "/fixture/avatar.png"; } },
    },
    axios: Object.fromEntries(["get", "post"].map(method => [method, (url, body) => new Promise((resolve, reject) => requests.push({ method, url, body: body === undefined ? undefined : plain(body), resolve, reject }))])),
  };
  const imports = name => {
    if (name === "vue") return Vue;
    if (name.includes("NotificationService")) return { default: new Proxy({}, { get: (_, method) => (...args) => notices.push([method, args]) }) };
    if (name.includes("SmsProviders")) return { SmsProviders };
    if (name.includes("USmartSwitch.vue")) return { default: nativeSwitch };
    if (name.includes("USmartSelect.vue")) return { default: nativeSelect };
    if (name.includes("USmartToggle.vue")) return { default: nativeToggle };
    if (name.includes("USmartVerify.vue")) return { default: nativeVerify };
    if (name.includes("SWidgetButtons.vue")) return { default: nativeButtons };
    if (name.endsWith(".vue")) return { default: wrapper("div") };
    throw new Error(`Unexpected SMS provider import: ${name}`);
  };
  const component = { ...evaluate(provider.descriptor.script.content, imports, globals).default, render: provider.render };
  const core = evaluate(read("../../../../mixin/CoreMixin.ts"), name => name === "lodash-es" ? { isString } : name.includes("country-helper") ? { getCountryName: code => ({ US: "United States", DE: "Germany", TR: "Turkey" })[code] || code } : {}, globals).default;
  const instance = Vue.shallowRef();
  const app = Vue.createApp({ render: () => Vue.h(component, { ref: instance, shop: currentShop, modern, readOnly }) });
  app.mixin(core);
  app.config.globalProperties.$t = translate;
  app.config.globalProperties.$store = { getters: { getUser: { id: 31, name: "Fixture user", phone } } };
  app.config.globalProperties.$vuetify = { display: { xs: false } };
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  app.directive("intersect", { mounted: (_, binding) => binding.value(true, [{ boundingClientRect: { top: 0 } }]) });
  const tags = new Set([provider, selectSource, switchSource, toggleSource, verifySource, buttonsSource].flatMap(source => [...source.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)].map(match => match[1])));
  for (const tag of tags) app.component(tag, tag === "v-btn" ? button : tag === "v-text-field" || tag === "v-select" ? field : tag === "u-widget-header" ? header : wrapper("div"));
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  requests[0].resolve({ data: { sms_service: saved } }); requests[1].resolve({ data: catalog }); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, requests, notices, avatarCalls, shop: currentShop,
    get state() { return instance.value; },
    async action(key) { const node = [...host.querySelectorAll("button")].find(node => node.textContent.includes(key)); assert.ok(node, `Action ${key} is available`); assert.equal(node.disabled, false); node.click(); await settle(); },
    async provider(driver) { instance.value.driver = driver; await settle(); },
    // Save; switching away from a saved provider asks first on the modern page.
    async save() { await this.action("global.actions.save"); if (instance.value.confirm_switch) await this.action("shop_sms_provider.catalog.switch_continue"); },
    options() { return [...host.querySelectorAll(".sms-provider__option-select")].map(node => node.dataset.driver); },
    row(driver) { return [...host.querySelectorAll(".sms-provider__option")].find(node => node.querySelector(`[data-driver="${driver}"]`)); },
    async nativeChoice(title) {
      const node = [...host.querySelectorAll('.s--smart-select .pp.row-hover')].find(node => node.textContent.includes(title));
      assert.ok(node, `Native choice ${title} is available`); node.click(); await settle();
    },
    fields() { return [...host.querySelectorAll("[data-field]")].map(node => node.dataset.field); },
    async token(label, value) { const input = [...host.querySelectorAll("[data-field]")].find(node => node.dataset.field === label)?.querySelector("input"); assert.ok(input); input.value = value; input.dispatchEvent(new window.Event("input", { bubbles: true })); await settle(); },
  };
}

test("SMS provider and native Smart controls compile with production asset transforms", async () => {
  for (const source of [provider, selectSource, switchSource, toggleSource, verifySource, buttonsSource]) for (const style of source.descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: source.file, id: "sms-provider-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
  }
});

test("the backend catalog drives the picker, capabilities and credential fields", async t => {
  for (const modern of [true, false]) {
    const f = await fixture(t, { modern });
    assert.deepEqual(f.requests.slice(0, 2).map(r => r.url), ["/fixture/shops/7/sms-service", "/fixture/shops/7/sms-providers"]);
    assert.deepEqual(plain(f.state.sms_providers.map(p => p.driver)), ["default", "fixture-text"], "No custom provider first, then the recommended providers only");
    assert.equal(f.state.selected_provider.support_text, true);
    assert.equal(f.state.selected_provider.support_template, false);
    assert.deepEqual(f.fields(), ["Fixture user *", "Fixture key", "Fixture region"], "A stored secret shows as stored, never as a value");
    assert.match(f.host.textContent, /shop_sms_provider\.catalog\.stored/);
    assert.ok(f.host.querySelector('a[href="https://text.fixture.test"]'));
    if (modern) {
      assert.ok(f.host.querySelector(".sms-provider__current"), "The saved provider shows as a card");
      assert.equal(f.host.querySelector(".sms-provider__picker"), null);
      await f.action("shop_sms_provider.catalog.change");
      assert.deepEqual(f.options(), ["default", "fixture-text", "fixture-template"], "An open list: recommended first, then every other provider");
      assert.deepEqual(plain(f.state.picker_groups.map(g => g.key)), ["recommended", "all"]);
      f.state.search = "germ"; await settle();
      assert.deepEqual(f.options(), ["fixture-template"], "A search lists its matches at once, by country name too");
      f.state.search = "de"; await settle();
      assert.deepEqual(f.options(), ["default", "fixture-template"], "Or by name and country code");
      f.state.search = "nothing"; await settle();
      assert.deepEqual(f.options(), []);
      assert.match(f.host.textContent, /shop_sms_provider\.catalog\.no_results/);
      f.state.search = ""; await settle();
      f.host.querySelector('[data-driver="fixture-template"]').click(); await settle();
      assert.equal(f.state.driver, "fixture-template");
      assert.equal(f.host.querySelector('[data-driver="fixture-template"]').getAttribute("aria-pressed"), "true");
      await f.action("shop_sms_provider.catalog.cancel_change");
      assert.equal(f.state.driver, "fixture-text", "Cancel returns to the saved provider");
      assert.ok(f.host.querySelector(".sms-provider__current"));
    } else {
      f.state.search = "de"; await settle();
      assert.deepEqual(plain(f.state.sms_providers.map(p => p.driver)), ["default", "fixture-text", "fixture-template"], "Country search keeps the selected provider visible");
      f.state.search = "nothing"; await settle();
      assert.deepEqual(plain(f.state.sms_providers.map(p => p.driver)), ["default", "fixture-text"]);
      f.state.search = ""; await settle();
      assert.deepEqual(plain(f.state.sms_providers.map(p => p.driver)), ["default", "fixture-text"], "Without a search, only recommended providers");
      await f.action("shop_sms_provider.catalog.show_all");
      assert.deepEqual(plain(f.state.sms_providers.map(p => p.driver)), ["default", "fixture-text", "fixture-template"]);
      assert.equal([...f.host.querySelectorAll("button")].some(node => node.textContent.includes("shop_sms_provider.catalog.show_all")), false);
    }
    await f.provider("fixture-template");
    assert.deepEqual(f.fields(), ["Template token *"], "Another provider's secret starts empty");
    assert.match(f.host.textContent, /shop_sms_provider\.catalog\.switch_notice/);
    await f.provider("default");
    assert.deepEqual(f.fields(), []);
    assert.equal(f.host.querySelector(".s--smart-toggle"), null, "Default has no custom-provider test toggle");
    assert.match(f.host.textContent, /SMS fraud/);
    assert.ok(f.host.querySelector(".s-widget-buttons"), "The native auto-fixed action wrapper remains mounted");
    await f.save();
    assert.deepEqual(f.requests.at(-1).body, { enable: true, driver: "default", option: "all", test: false });
    f.requests.at(-1).resolve({ data: { sms_service: { ...service("default"), enable: false } } }); await settle();
  }
});

test("Save sends changed credentials only; a stored secret only after Replace", async t => {
  const f = await fixture(t);
  await f.token("Fixture user *", "changed-user");
  await f.nativeChoice("sms_messages_options.otp.title");
  await f.action("global.actions.save");
  let request = f.requests.at(-1);
  assert.equal(request.url, "/fixture/shops/7/sms-service/set");
  assert.deepEqual(request.body, { enable: true, driver: "fixture-text", credentials: { user: "changed-user", region: null }, otp_verify: false, option: "otp", test: false });
  request.resolve({ data: { sms_service: { ...service(), option: "otp", credential_values: { user: "changed-user", region: null } } } }); await settle();
  assert.ok(f.notices.some(([method]) => method === "showSuccessAlert"));

  await f.action("shop_sms_provider.catalog.replace");
  await f.token("Fixture key *", "new-secret");
  await f.action("global.actions.save");
  assert.deepEqual(f.requests.at(-1).body.credentials, { user: "changed-user", key: "new-secret", region: null });
  f.requests.at(-1).resolve({ data: { sms_service: service() } }); await settle();

  await f.provider("fixture-template");
  await f.token("Template token *", "template-secret");
  await f.action("global.actions.save");
  assert.equal(f.state.confirm_switch, true, "Switching away from a saved provider asks first");
  assert.match(f.host.textContent, /shop_sms_provider\.catalog\.switch_body/);
  await f.action("shop_sms_provider.catalog.switch_continue");
  assert.deepEqual(f.requests.at(-1).body, { enable: true, driver: "fixture-template", credentials: { token: "template-secret" }, option: "otp", test: false });
  f.requests.at(-1).resolve({ data: { sms_service: service("fixture-template") } }); await settle();
});

test("failed saves retain drafts and release busy state; saved provider errors use warning feedback", async t => {
  const f = await fixture(t);
  await f.token("Fixture user *", "retained-user");
  await f.action("global.actions.save");
  f.requests.at(-1).resolve({ data: { error: true, error_msg: "Fixture denied" } }); await settle();
  assert.equal(f.state.credentials.user, "retained-user"); assert.equal(f.state.busy_set, false);
  await f.action("global.actions.save");
  f.requests.at(-1).reject(new Error("Fixture offline")); await settle();
  assert.equal(f.state.credentials.user, "retained-user"); assert.equal(f.state.busy_set, false);
  await f.action("global.actions.save");
  f.requests.at(-1).resolve({ data: { sms_service: { ...service(), error: "Fixture delivery failure" } } }); await settle();
  assert.ok(f.notices.some(([method]) => method === "showErrorAlert"));
  assert.ok(f.notices.some(([method]) => method === "showLaravelError"));
  assert.ok(f.notices.some(([method]) => method === "showWarningAlert"));
});

test("a disabled provider blocks credential input and the validation toggle obeys phone availability", async t => {
  const f = await fixture(t);
  await f.nativeChoice("global.commons.disable");
  assert.equal(f.state.enable, false);
  assert.ok([...f.host.querySelectorAll("[data-field] input")].every(input => input.disabled));
  const replace = [...f.host.querySelectorAll("button")].find(node => node.textContent.includes("shop_sms_provider.catalog.replace"));
  assert.equal(replace.disabled, true);
  assert.equal(f.host.querySelector(".s--smart-toggle"), null);
  await f.action("global.actions.save"); assert.equal(f.requests.at(-1).body.enable, false);
  f.requests.at(-1).resolve({ data: { sms_service: { ...service(), enable: false } } }); await settle();
  const withoutPhone = await fixture(t, { phone: null });
  assert.equal(withoutPhone.host.querySelector(".s--smart-toggle"), null);
});

test("error reset remains available and contact sync stays gated by the native Verify control", async t => {
  const f = await fixture(t, { saved: { ...service(), errors: 12, error: "Fixture error" } });
  await f.action("shop_sms_provider.reset_error");
  const reset = f.requests.at(-1);
  assert.equal(reset.url, "/fixture/shops/7/sms-service/reset"); assert.equal(reset.body, undefined);
  reset.resolve({ data: { sms_service: service() } }); await settle();
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
  await f.provider("fixture-template"); assert.equal(sync(), undefined);
});

test("a provider with its own verification API offers the sign-in code choice; others don't", async t => {
  const f = await fixture(t);
  await f.nativeChoice("shop_sms_provider.catalog.otp_provider");
  assert.equal(f.state.otp_verify, true);
  await f.action("global.actions.save");
  assert.equal(f.requests.at(-1).body.otp_verify, true);
  f.requests.at(-1).resolve({ data: { sms_service: { ...service(), otp_verify: true } } }); await settle();
  await f.provider("fixture-template");
  assert.doesNotMatch(f.host.textContent, /shop_sms_provider\.catalog\.otp_provider/);
});

test("a paused service says so and Resume resets the errors", async t => {
  const f = await fixture(t, { saved: { ...service(), errors: 20, paused: true, errors_limit: 20 } });
  assert.match(f.host.textContent, /shop_sms_provider\.catalog\.paused \{"count":20\}/);
  await f.action("shop_sms_provider.catalog.resume");
  const reset = f.requests.at(-1);
  assert.equal(reset.url, "/fixture/shops/7/sms-service/reset");
  reset.resolve({ data: { sms_service: { ...service(), paused: false } } }); await settle();
  assert.doesNotMatch(f.host.textContent, /shop_sms_provider\.catalog\.paused/);
});

test("the saved provider card tests the saved settings and reports the provider's answer", async t => {
  const f = await fixture(t);
  assert.match(f.host.querySelector(".sms-provider__current").textContent, /Fixture Text/);
  assert.equal(f.state.saved_status.key, "active");
  await f.action("shop_sms_provider.catalog.test_send");
  assert.equal(f.state.test_dialog, true);
  await f.action("shop_sms_provider.catalog.test_send_action");
  const request = f.requests.at(-1);
  assert.equal(request.url, "/fixture/shops/7/sms-service/set");
  assert.deepEqual(request.body, { test: true }, "A test changes no configuration");
  request.resolve({ data: { success: true, sms_service: service(), send_test: { status: "accepted" } } }); await settle();
  assert.match(f.host.querySelector(".sms-provider__test-result").textContent, /test_accepted/);
  await f.action("shop_sms_provider.catalog.test_again");
  f.requests.at(-1).resolve({ data: { error: true, error_msg: "Fixture sender rejected", sms_service: { ...service(), errors: 1 } } }); await settle();
  assert.match(f.host.querySelector(".sms-provider__test-result").textContent, /Fixture sender rejected/);
  assert.equal(f.state.saved_status.key, "errors");
  await f.token("Fixture user *", "unsaved-user");
  assert.match(f.host.querySelector(".sms-provider__current").textContent, /test_save_first/, "A test uses saved settings: unsaved edits block it");
  const testButton = [...f.host.querySelectorAll(".sms-provider__current button")].find(node => node.textContent.includes("shop_sms_provider.catalog.test_send"));
  assert.equal(testButton.disabled, true);
  const noPhone = await fixture(t, { phone: null });
  assert.match(noPhone.host.querySelector(".sms-provider__current").textContent, /test_phone_required/);
});

test("staff without edit access see the provider and its status, with nothing to change", async t => {
  const f = await fixture(t, { readOnly: true, saved: { ...service(), errors: 3 } });
  assert.match(f.host.textContent, /shop_sms_provider\.catalog\.read_only/);
  assert.ok(f.host.querySelector(".sms-provider__current"));
  for (const key of ["shop_sms_provider.catalog.change", "shop_sms_provider.catalog.test_send\n", "global.actions.save", "shop_sms_provider.reset_error", "shop_sms_provider.catalog.replace"])
    assert.equal([...f.host.querySelectorAll("button")].some(node => node.textContent.includes(key.trim())), false, key);
  assert.deepEqual(f.fields(), [], "No credential fields");
  assert.equal(f.requests.length, 2, "Only the two reads");
});

test("a target country lists its own providers first, then worldwide ones; flags and details explain each", async t => {
  const f = await fixture(t);
  await f.action("shop_sms_provider.catalog.change");
  assert.ok(f.row("fixture-text").querySelector(".sms-provider__flags .sms-provider__flag"), "Home countries show as flags");
  assert.equal(f.row("fixture-text").querySelector(".sms-provider__globe"), null, "No globe for a provider that isn't worldwide");
  f.state.target_country = "DE"; await settle();
  assert.deepEqual(plain(f.state.picker_groups.map(g => [g.key, g.items.map(p => p.driver)])), [["local", ["default", "fixture-template"]], ["all", ["fixture-text"]]]);
  assert.match(f.host.textContent, /shop_sms_provider\.catalog\.best_for \{"country":"Germany"\}/);
  f.state.catalog.providers[0].worldwide = true; f.state.catalog = { ...f.state.catalog }; await settle();
  assert.deepEqual(plain(f.state.picker_groups.map(g => g.key)), ["local", "worldwide"], "Worldwide providers stay in the list after the local ones");
  assert.ok(f.row("fixture-text").querySelector(".sms-provider__globe-slot .sms-provider__globe"), "Worldwide providers show the globe first");
  f.state.target_country = null; await settle();
  assert.deepEqual(plain(f.state.picker_groups.map(g => g.key)), ["recommended", "all"]);

  f.row("fixture-template").querySelector(".sms-provider__flags").click(); await settle();
  assert.equal(f.state.info_provider.driver, "fixture-template", "The flags explain where the provider fits");
  f.state.info_provider = null; await settle();
  assert.equal(f.state.driver, "fixture-text", "Opening the details doesn't select the provider");
  f.row("fixture-template").querySelector(".sms-provider__name").click(); await settle();
  assert.equal(f.state.info_provider.driver, "fixture-template");
  assert.match(f.host.querySelector(".sms-provider__country-list").textContent, /Germany/);
  assert.match(f.host.textContent, /shop_sms_provider\.catalog\.info_local/);
  await f.action("shop_sms_provider.catalog.use");
  assert.equal(f.state.driver, "fixture-template", "Use selects the provider from its details");
  assert.equal(f.state.info_provider, null);
});

test("the capabilities of the provider being chosen are named, explained and marked supported or not", async t => {
  const f = await fixture(t);
  const card = f.host.querySelector(".sms-provider__current");
  assert.deepEqual([...card.querySelectorAll("[data-capability]")].map(n => n.dataset.capability), ["text", "verify"], "The card lists what the saved provider supports");
  assert.match(card.textContent, /cap_text_help/, "Each capability explains itself");
  await f.action("shop_sms_provider.catalog.change");
  f.host.querySelector('[data-driver="fixture-template"]').click(); await settle();
  const strip = f.host.querySelector(".sms-provider__selected");
  assert.equal(strip.dataset.driver, "fixture-template", "The strip names the provider it describes");
  assert.match(strip.textContent, /Fixture Template/);
  assert.deepEqual([...strip.querySelectorAll("[data-capability]")].map(n => [n.dataset.capability, n.classList.contains("sms-provider__cap--off")]), [["text", true], ["template", false]]);
  assert.match(strip.textContent, /cap_template_help/);
});
