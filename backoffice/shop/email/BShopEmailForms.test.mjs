import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// Real form components, CoreMixin and native toggles; all requests remain fixture promises.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const key of ["window", "document", "Element", "SVGElement", "HTMLElement", "Node"])
  globalThis[key] = dom.window[key];
const Vue = await import("vue");
const read = file => readFileSync(new URL(file, import.meta.url), "utf8");
const plain = value => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
function evaluate(source, imports, globals = {}) {
  const output = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, esModuleInterop: false, ignoreDeprecations: "6.0", module: ts.ModuleKind.CommonJS } });
  assert.deepEqual(output.diagnostics, []);
  const exports = {};
  vm.runInNewContext(output.outputText, { exports, require: imports, console, ...globals });
  return exports;
}
function compile(file) {
  const { descriptor, errors } = parse(read(file));
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: file, id: "email-forms-test", transformAssetUrls: { includeAbsolute: true } });
  assert.deepEqual(template.errors, []);
  return { file, descriptor, template, render: evaluate(template.code, name => name === "vue" ? Vue : { default: "/fixture/asset.svg" }).render };
}
const provider = compile("./provider/BShopEmailProvider.vue");
const editor = compile("./template/editor/BShopEmailTemplateEditor.vue");
const toggleSource = compile("../../../ui/smart/toggle/USmartToggle.vue");
const nativeToggle = { ...evaluate(toggleSource.descriptor.script.content, () => ({})).default, render: toggleSource.render };
const { EmailProviders } = evaluate(read("../../../../core-js/enums/email/EmailProviders.ts"), () => ({ default: "/fixture/provider.svg" }));
const translate = (key, values = {}) => key + (Object.keys(values).length ? " " + JSON.stringify(values) : "");
const wrapper = tag => Vue.defineComponent({ inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(tag, attrs, slots.default?.()) });
const button = Vue.defineComponent({
  inheritAttrs: false, props: ["disabled", "loading", "href", "prependIcon", "appendIcon", "icon"],
  setup: (props, { attrs, slots }) => () => Vue.h(props.href ? "a" : "button", { ...attrs, href: props.href, disabled: props.disabled || props.loading }, slots.default?.()),
});
const dialog = Vue.defineComponent({ inheritAttrs: false, props: ["modelValue"], setup: (props, { attrs, slots }) => () => props.modelValue ? Vue.h("div", { ...attrs, role: "dialog" }, slots.default?.()) : null });
const tooltip = Vue.defineComponent({ inheritAttrs: false, setup: (_, { slots }) => () => slots.activator?.({ props: {} }) });
const field = tag => Vue.defineComponent({
  inheritAttrs: false, props: ["modelValue", "label", "type", "disabled", "items"], emits: ["update:modelValue", "click:append-inner"],
  setup: (props, { attrs, emit, slots }) => () => Vue.h("label", { ...attrs, "data-field": props.label }, [
    props.label,
    Vue.h(tag, { value: props.modelValue ?? "", type: props.type || "text", disabled: props.disabled, onInput: event => emit("update:modelValue", event.target.value) }),
    slots.append?.(),
  ]),
});
const smartSelect = Vue.defineComponent({
  inheritAttrs: false, props: ["modelValue", "label", "items", "itemValue", "disabled"], emits: ["update:modelValue", "change"],
  setup: (props, { attrs, emit }) => () => Vue.h("label", { ...attrs, "data-field": props.label }, [
    props.label, Vue.h("select", {
      value: props.modelValue, disabled: props.disabled,
      onChange: event => { emit("update:modelValue", event.target.value); emit("change", event.target.value); },
    }, (props.items || []).map(item => Vue.h("option", { value: typeof item === "string" ? item : item[props.itemValue || "value"] }, typeof item === "string" ? item : item.title))),
  ]),
});
const smartSwitch = Vue.defineComponent({
  props: ["modelValue", "trueTitle", "falseTitle"], emits: ["update:modelValue"],
  setup: (props, { emit }) => () => Vue.h("button", { role: "switch", "aria-checked": !!props.modelValue, onClick: () => emit("update:modelValue", !props.modelValue) }, props.modelValue ? props.trueTitle : props.falseTitle),
});
const image = Vue.defineComponent({
  inheritAttrs: false, props: ["modelValue", "file", "label"], emits: ["update:modelValue", "update:file"],
  setup: (props, { attrs, emit }) => () => Vue.h("div", { ...attrs, "data-image": props.label }, [
    Vue.h("input", { "data-image-reference": "", value: props.modelValue || "", onInput: event => emit("update:modelValue", event.target.value) }),
    Vue.h("input", { "data-image-file": "", type: "file", onChange: event => emit("update:file", event.target.files?.[0] || null) }),
  ]),
});
const account = { id: 31, name: "Fixture account", email: "account@example.test" };
const shop = () => ({ id: 7, title: "Fixture shop", name: "fixture-shop", mail_service: null });
const service = (driver = "smtp") => ({ driver, enable: true, host: "smtp.example.test", port: 587, from: "shop@example.test", from_name: "Fixture sender", api: "fixture-api", username: "fixture-user", password: "fixture-password", endpoint: "fixture-endpoint", encryption: "tls", errors: 0, error: null });
const savedTemplate = () => ({ enable: true, subject: "Fixture subject", title: "Fixture title", category: "Fixture category", message: "<p>Fixture HTML</p>", header_image: "shops/7/fixture-header.png", footer_image: "shops/7/fixture-footer.png", footer: "<p>Fixture footer</p>", action: "Fixture action", header_logo: true, user_id: 31 });
const defaults = { subject: "Default subject", title: "Default title", message: "Default message", category: "Default category", action: "Default action" };

async function fixture(t, source, props = {}) {
  const requests = [], notices = [], updates = [], warnings = [], errors = [], avatarCalls = [];
  const fixtureShop = shop();
  const globals = {
    FormData: dom.window.FormData,
    getComputedStyle: window.getComputedStyle.bind(window),
    window: {
      API: {
        GET_SHOP_MAIL_SERVICE: id => `/fixture/shops/${id}/mail-service`,
        GET_SHOP_EMAIL_PROVIDERS: id => `/fixture/shops/${id}/email-providers`,
        POST_SET_SHOP_MAIL_SERVICE: id => `/fixture/shops/${id}/mail-service/set`,
        POST_RESET_SHOP_MAIL_SERVICE: id => `/fixture/shops/${id}/mail-service/reset`,
        POST_SHOP_MAIL_SERVICE_TEST: id => `/fixture/shops/${id}/mail-service/test`,
        GET_SHOP_MAIL_TEMPLATE: (id, code) => `/fixture/shops/${id}/templates/${code}`,
        POST_SET_SHOP_MAIL_TEMPLATE: id => `/fixture/shops/${id}/templates`,
        GET_SHOP_EMAIL_RENDER_URL: (id, code) => `/fixture/shops/${id}/templates/${code}/render`,
      },
      CDN: { GET_USER_AVATAR: (...args) => { avatarCalls.push(args); return "/fixture/avatar.png"; } },
    },
    axios: Object.fromEntries(["get", "post"].map(method => [method, (url, body, config) => new Promise((resolve, reject) => requests.push({ method, url, body, config, resolve, reject }))])),
  };
  const leaf = wrapper("div");
  const imports = name => {
    if (name === "vue") return Vue;
    if (name.includes("NotificationService")) return { default: new Proxy({}, { get: (_, method) => (...args) => notices.push([method, args]) }) };
    if (name.includes("EmailProviders")) return { EmailProviders };
    if (name.includes("USmartToggle.vue")) return { default: nativeToggle };
    if (name.includes("USmartSwitch.vue")) return { default: smartSwitch };
    if (name.includes("USmartSelect.vue")) return { default: smartSelect };
    if (name.includes("USmartImage.vue")) return { default: image };
    if (name.includes("UNumberInput.vue")) return { default: field("input") };
    if (name.endsWith(".vue")) return { default: leaf };
    if (name.endsWith(".svg")) return { default: "/fixture/asset.svg" };
    throw new Error(`Unexpected email-form import: ${name}`);
  };
  const component = { ...evaluate(source.descriptor.script.content, imports, globals).default, render: source.render };
  const core = evaluate(read("../../../mixin/CoreMixin.ts"), () => ({}), globals).default;
  const instance = Vue.shallowRef();
  const app = Vue.createApp({ render: () => Vue.h(component, { ...props, ref: instance, shop: fixtureShop, onUpdate: value => updates.push(value) }) });
  app.mixin(core);
  app.config.globalProperties.$t = translate;
  app.config.globalProperties.$store = { getters: { getUser: account } };
  app.config.errorHandler = error => errors.push(error);
  app.config.warnHandler = warning => warnings.push(warning);
  app.directive("copy", {});
  const tags = new Set([source, toggleSource].flatMap(item => [...item.template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)].map(match => match[1])));
  for (const tag of tags)
    app.component(tag, tag === "v-btn" ? button : tag === "v-dialog" ? dialog : tag === "v-tooltip" ? tooltip : tag === "v-text-field" || tag === "v-combobox" ? field("input") : tag === "v-textarea" ? field("textarea") : tag === "v-select" ? smartSelect : leaf);
  const host = document.createElement("div"); document.body.append(host); app.mount(host); await settle();
  t.after(() => { app.unmount(); host.remove(); assert.deepEqual(errors, []); assert.deepEqual(warnings, []); });
  return {
    host, requests, notices, updates, avatarCalls, shop: fixtureShop,
    get state() { return instance.value; },
    async readComplete(data) { requests[0].resolve({ data }); await settle(); },
    async action(key) { const node = [...host.querySelectorAll("button")].find(node => node.textContent.includes(key)); assert.ok(node, `Action ${key} is rendered`); assert.equal(node.disabled, false); node.click(); await settle(); },
    async input(label, value) { const input = [...host.querySelectorAll("[data-field]")].find(node => node.dataset.field === label)?.querySelector("input,textarea,select"); assert.ok(input, `Field ${label} is rendered`); input.value = value; input.dispatchEvent(new dom.window.Event(input.tagName === "SELECT" ? "change" : "input", { bubbles: true })); await settle(); },
  };
}
async function editorFixture(t, props = {}, value = savedTemplate()) {
  const f = await fixture(t, editor, { code: "order-payment", template: { title: "Fixture order template" }, params: ["order_id"], ...props });
  await f.readComplete({ mail_template: value, default: defaults });
  f.state.dialog = true; await settle(); return f;
}

const catalogField = (key, title, extra = {}) => ({ key, title, hint: null, type: "text", secret: false, required: true, options: [], default: null, suggestions: [], max: 255, ...extra });
const catalogSecret = (key, title, extra = {}) => catalogField(key, title, { type: "secret", secret: true, ...extra });
const smtpFields = (host, port, encryption, required = true, passwordTitle = "Password") => [
  catalogField("host", "SMTP server", { default: host, suggestions: host ? ["smtp-relay.example.test"] : [] }),
  catalogField("port", "Port", { type: "number", default: port }),
  catalogField("encryption", "Encryption", { type: "select", options: ["tls", "ssl", "none"], default: encryption }),
  catalogField("username", "Email address", { required }),
  catalogSecret("password", passwordTitle, { required }),
];
const catalog = () => ({
  recommended: ["sendgrid", "gmail", "smtp"],
  providers: [
    { key: "sendgrid", title: "SendGrid", description: "API delivery", kind: "api", group: "delivery", logo: null, url: "https://sendgrid.test", docs_url: "https://docs.sendgrid.test",
      fields: [catalogSecret("api", "API key", { hint: "Mail Send access" }), catalogField("endpoint", "Data region", { type: "select", options: ["global", "eu"], default: "global" })] },
    { key: "mailpace", title: "MailPace", description: "Private delivery", kind: "api", group: "delivery", logo: "/fixture/mailpace.svg", url: null, docs_url: null, fields: [catalogSecret("api", "Server token")] },
    { key: "gmail", title: "Gmail", description: "Google mailbox", kind: "smtp", group: "mailbox", logo: null, url: null, docs_url: "https://gmail.test/guide", fields: smtpFields("smtp.gmail.com", 587, "tls", true, "App password") },
    { key: "zoho_mail", title: "Zoho Mail", description: "Zoho mailbox", kind: "smtp", group: "mailbox", logo: null, url: null, docs_url: null, fields: smtpFields("smtp.zoho.com", 465, "ssl") },
    { key: "smtp", title: "Custom SMTP", description: "Any server", kind: "smtp", group: "custom", logo: "/fixture/smtp.svg", url: null, docs_url: null, fields: smtpFields(null, 587, "tls", false) },
  ],
});
// A saved service as the backend returns it: secret values never come back, only their stored/missing status.
const savedService = (extra = {}) => ({ driver: "smtp", enable: true, host: "smtp.example.test", port: 587, from: "shop@example.test", from_name: "Fixture sender", username: "fixture-user", endpoint: null, encryption: "tls", errors: 0, error: null, credentials_status: { api: "missing", password: "stored" }, ...extra });
async function providerFixture(t, value = savedService(), props = {}) {
  const f = await fixture(t, provider, props);
  await f.readComplete({ mail_service: value });
  if (!props.catalog) { f.requests[1].resolve({ data: catalog() }); await settle(); }
  return f;
}
const captions = f => [...f.host.querySelectorAll(".b-shop-email-provider__picker-caption")].map(node => node.textContent.trim());
const rows = f => [...f.host.querySelectorAll(".b-shop-email-provider__option-select")].map(node => node.dataset.driver);
const choose = async (f, driver) => { f.host.querySelector(`.b-shop-email-provider__option-select[data-driver="${driver}"]`).click(); await settle(); };
const inputValue = (f, label) => [...f.host.querySelectorAll("[data-field]")].find(node => node.dataset.field === label)?.querySelector("input,select")?.value;
const saveButton = f => f.host.querySelector(".b-shop-email-provider__action");

test("provider and editor templates, scripts and scoped Sass compile with production asset handling", async () => {
  for (const source of [provider, editor]) for (const style of source.descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: source.file, id: "email-forms-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
    assert.equal(/(^|[\s,}])\.(smart-invert|v-locale--is-rtl)\s*\{|:global\(/.test(output.code), false, "No rule escapes the component scope");
  }
});

test("the saved provider is a card; Change opens an always-open picker grouped by kind that searches", async t => {
  const f = await providerFixture(t);
  assert.deepEqual(f.requests.slice(0, 2).map(r => r.url), ["/fixture/shops/7/mail-service", "/fixture/shops/7/email-providers"]);
  const card = f.host.querySelector(".b-shop-email-provider__current");
  assert.match(card.textContent, /Custom SMTP/);
  assert.equal(card.querySelector(".b-shop-email-provider__status").dataset.status, "active");
  assert.equal(card.querySelector('[data-kind="smtp"]').textContent.trim(), "shop_email_provider.catalog.kind_smtp");
  assert.match(card.textContent, /shop@example\.test/);
  assert.equal(f.host.querySelector(".b-shop-email-provider__picker"), null);

  await f.action("shop_email_provider.catalog.change");
  assert.deepEqual(captions(f), ["shop_email_provider.catalog.recommended", "shop_email_provider.catalog.group_delivery", "shop_email_provider.catalog.group_mailbox"]);
  assert.deepEqual(rows(f), ["sendgrid", "gmail", "smtp", "mailpace", "zoho_mail"], "Recommended first, then the rest by group");
  assert.ok(f.host.querySelector('.b-shop-email-provider__option--active .b-shop-email-provider__option-select[data-driver="smtp"]'));

  f.state.search = "zoho"; await settle();
  assert.deepEqual(rows(f), ["zoho_mail"]);
  f.state.search = "google"; await settle();
  assert.deepEqual(rows(f), ["gmail"], "Descriptions are searched too");
  f.state.search = "nothing-like-this"; await settle();
  assert.deepEqual(rows(f), []);
  assert.match(f.host.querySelector(".b-shop-email-provider__picker-empty").textContent, /catalog\.no_results/);

  await f.action("shop_email_provider.catalog.cancel_change");
  assert.ok(f.host.querySelector(".b-shop-email-provider__current"));
  assert.equal(f.state.search, "");
});

test("a known SMTP provider prefills its server; Save waits for the login and sends only that provider's values", async t => {
  const f = await providerFixture(t);
  await f.action("shop_email_provider.catalog.change");
  await choose(f, "gmail");
  assert.equal(inputValue(f, "SMTP server *"), "smtp.gmail.com");
  assert.equal(inputValue(f, "Port *"), "587");
  assert.equal(inputValue(f, "Encryption *"), "tls");
  assert.equal(inputValue(f, "Email address *"), "", "The previous provider's login is not carried over");
  assert.match(f.host.textContent, /catalog\.prefilled \{"provider":"Gmail"\}/);
  assert.match(f.host.textContent, /catalog\.switch_notice \{"from":"Custom SMTP"\}/);
  assert.match(f.host.querySelector(".b-shop-email-provider__missing").textContent, /Email address, App password/);
  assert.equal(saveButton(f).disabled, true);
  assert.equal(f.host.querySelector('[data-field="App password *"] input').type, "password");
  assert.equal(f.host.querySelector(".b-shop-email-provider__link").getAttribute("href"), "https://gmail.test/guide");

  await f.input("Email address *", "store@example.test");
  await f.input("App password *", "app-secret");
  assert.equal(f.host.querySelector(".b-shop-email-provider__missing"), null);
  saveButton(f).click(); await settle();
  assert.equal(f.requests.length, 2, "Switching from a saved provider asks first");
  assert.match(f.host.querySelector('[role="dialog"]').textContent, /switch_body/);
  await f.action("shop_email_provider.catalog.switch_continue");

  const request = f.requests.at(-1);
  assert.equal(request.url, "/fixture/shops/7/mail-service/set");
  assert.deepEqual(plain(request.body), { enable: true, driver: "gmail", from: "shop@example.test", from_name: "Fixture sender", host: "smtp.gmail.com", port: 587, encryption: "tls", username: "store@example.test", password: "app-secret" });
  const saved = savedService({ driver: "gmail", host: "smtp.gmail.com", username: "store@example.test", credentials_status: { api: "missing", password: "stored" } });
  request.resolve({ data: { mail_service: saved } }); await settle();
  assert.deepEqual(plain(f.shop.mail_service), saved);
  assert.equal(f.state.changing, false);
  assert.match(f.host.querySelector(".b-shop-email-provider__current").textContent, /Gmail/);
  assert.ok(f.notices.some(([method, args]) => method === "showSuccessAlert" && args[1] === "shop_email_provider.messages.saved"));
});

test("stored secrets are never shown: an edit keeps them, Replace sends a new one", async t => {
  const f = await providerFixture(t);
  const stored = f.host.querySelector('.b-shop-email-provider__stored[data-field="password"]');
  assert.match(stored.textContent, /catalog\.stored/);
  assert.equal(f.host.querySelector('input[type="password"]'), null);
  assert.equal(saveButton(f).disabled, true, "Nothing to save yet");

  await f.input("SMTP server *", "smtp2.example.test");
  saveButton(f).click(); await settle();
  assert.deepEqual(plain(f.requests.at(-1).body), { enable: true, driver: "smtp", from: "shop@example.test", from_name: "Fixture sender", host: "smtp2.example.test", port: 587, encryption: "tls", username: "fixture-user" }, "An untouched stored password stays out of the request");
  f.requests.at(-1).resolve({ data: { mail_service: savedService({ host: "smtp2.example.test" }) } }); await settle();

  await f.action("shop_email_provider.catalog.replace");
  await f.input("Password", "new-password");
  saveButton(f).click(); await settle();
  assert.equal(plain(f.requests.at(-1).body).password, "new-password");
  f.requests.at(-1).reject(new Error("Fixture offline")); await settle();
  f.state.cancelReplace("password"); await settle();
  assert.ok(f.host.querySelector('.b-shop-email-provider__stored[data-field="password"]'));
});

test("an API provider shows its key and region select, and a switch drops the SMTP values", async t => {
  const f = await providerFixture(t);
  await f.action("shop_email_provider.catalog.change");
  await choose(f, "sendgrid");
  assert.equal(inputValue(f, "Data region *"), "global");
  assert.deepEqual([...f.host.querySelectorAll('[data-field="Data region *"] option')].map(o => o.value), ["global", "eu"]);
  assert.equal(f.host.querySelector(".b-shop-email-provider__help"), null, "SMTP port help only for SMTP providers");
  await f.input("API key *", "SG.fixture");
  await f.input("Data region *", "eu");
  saveButton(f).click(); await settle();
  await f.action("shop_email_provider.catalog.switch_continue");
  assert.deepEqual(plain(f.requests.at(-1).body), { enable: true, driver: "sendgrid", from: "shop@example.test", from_name: "Fixture sender", api: "SG.fixture", endpoint: "eu" });

  // Back to the saved provider: its stored values return.
  await choose(f, "smtp");
  assert.equal(inputValue(f, "SMTP server *"), "smtp.example.test");
  assert.ok(f.host.querySelector('.b-shop-email-provider__stored[data-field="password"]'));
});

test("without a saved service the picker opens at once; failures keep the draft and release Save", async t => {
  const f = await providerFixture(t, null);
  assert.equal(f.host.querySelector(".b-shop-email-provider__current"), null);
  assert.ok(rows(f).length);
  await choose(f, "smtp");
  await f.input("SMTP server *", "retained.example.test");
  await f.input("shop_email_provider.inputs.from.label *", "store@example.test");
  await f.input("shop_email_provider.inputs.from_name.label *", "Store");
  saveButton(f).click(); await settle();
  assert.equal(f.state.confirm_switch, false, "A first provider needs no switch confirmation");
  f.requests.at(-1).resolve({ data: { error: true, error_msg: "Fixture denied" } }); await settle();
  assert.equal(f.state.values.host, "retained.example.test"); assert.equal(f.state.busy_set, false);
  saveButton(f).click(); await settle();
  f.requests.at(-1).reject(new Error("Fixture offline")); await settle();
  assert.equal(f.state.values.host, "retained.example.test"); assert.equal(f.state.busy_set, false);
  assert.equal(f.shop.mail_service, null);
  assert.ok(f.notices.some(([method]) => method === "showErrorAlert"));
  assert.ok(f.notices.some(([method]) => method === "showLaravelError"));
});

test("the test email uses the saved settings only, and error reset updates the counters", async t => {
  const f = await providerFixture(t, savedService({ errors: 12, error: "Fixture delivery error" }));
  assert.match(f.host.querySelector(".b-shop-email-provider__errors").textContent, /Fixture delivery error/);
  await f.action("shop_email_provider.actions.send_test_email");
  assert.match(f.host.querySelector('[role="dialog"]').textContent, /account@example\.test/);
  await f.action("shop_email_provider.catalog.test_send");
  const testRequest = f.requests.at(-1);
  assert.equal(testRequest.url, "/fixture/shops/7/mail-service/test");
  assert.equal(testRequest.body, undefined, "No arbitrary recipient is added to the API");
  testRequest.resolve({ data: { success: true, to: "account@example.test" } }); await settle();
  assert.match(f.host.querySelector('[role="dialog"]').textContent, /catalog\.test_accepted/);

  await f.action("shop_email_provider.actions.reset_errors");
  const reset = f.requests.at(-1);
  assert.equal(reset.url, "/fixture/shops/7/mail-service/reset"); assert.equal(reset.body, undefined);
  reset.resolve({ data: { mail_service: savedService() } }); await settle();
  assert.equal(f.state.mail_service.errors, 0);
  assert.equal(f.host.querySelector(".b-shop-email-provider__errors"), null);

  await f.input("SMTP server *", "unsaved.example.test");
  const testButton = [...f.host.querySelectorAll("button")].find(node => node.textContent.includes("shop_email_provider.actions.send_test_email"));
  assert.equal(testButton.disabled, true, "A test always uses saved settings");
  assert.match(f.host.textContent, /catalog\.test_save_first/);
});

test("read-only staff see the saved provider without any edit control", async t => {
  const f = await providerFixture(t, savedService(), { readOnly: true });
  assert.ok(f.host.querySelector(".b-shop-email-provider__read-only"));
  assert.ok(f.host.querySelector(".b-shop-email-provider__current"));
  assert.equal(f.host.querySelector(".b-shop-email-provider__current-actions"), null);
  assert.equal(f.host.querySelector(".b-shop-email-provider__picker"), null);
  assert.equal(f.host.querySelector(".b-shop-email-provider__connection"), null);
  assert.equal(saveButton(f), null);
});

test("a catalog passed by the page is used without another request", async t => {
  const f = await providerFixture(t, savedService(), { catalog: catalog() });
  assert.deepEqual(f.requests.map(r => r.url), ["/fixture/shops/7/mail-service"]);
  assert.match(f.host.querySelector(".b-shop-email-provider__current").textContent, /Custom SMTP/);
});

test("editor sends unchanged multipart fields and files, updates images and closes only after success", async t => {
  const f = await editorFixture(t);
  const preview = f.host.querySelector('a[href="/fixture/shops/7/templates/order-payment/render"]');
  assert.ok(preview, "Preview uses the current shop/code server render route");
  assert.equal(preview.getAttribute("target"), "_blank");
  assert.equal(preview.getAttribute("rel"), "noopener noreferrer");
  await f.input("b_shop_email_template_editor.subject", "Draft subject");
  const headerFile = new dom.window.File(["fixture header"], "fixture-header.png", { type: "image/png" });
  const footerFile = new dom.window.File(["fixture footer"], "fixture-footer.png", { type: "image/png" });
  f.state.header_image_file = headerFile; f.state.footer_image_file = footerFile;
  await f.action("global.actions.save");
  const request = f.requests.at(-1), data = request.body;
  assert.equal(request.url, "/fixture/shops/7/templates");
  assert.deepEqual(plain(request.config), { headers: { "Content-Type": "multipart/form-data" } });
  assert.equal(data.get("code"), "order-payment"); assert.equal(data.get("enable"), "true");
  for (const [key, value] of Object.entries({ subject: "Draft subject", title: "Fixture title", category: "Fixture category", message: "<p>Fixture HTML</p>", header_image: "shops/7/fixture-header.png", footer_image: "shops/7/fixture-footer.png", footer: "<p>Fixture footer</p>", action: "Fixture action", header_logo: "true" })) assert.equal(data.get(key), value);
  assert.equal(data.get("header_image_file").name, "fixture-header.png");
  assert.equal(data.get("footer_image_file").name, "fixture-footer.png");
  assert.equal(f.state.dialog, true); assert.equal(f.state.busy_set, true); assert.equal(f.updates.length, 0);
  const saved = { ...savedTemplate(), subject: "Draft subject", header_image: "shops/7/new-header.png", footer_image: "shops/7/new-footer.png" };
  request.resolve({ data: { mail_template: saved } }); await settle();
  assert.equal(f.state.dialog, false); assert.equal(f.state.busy_set, false);
  assert.equal(f.state.header_image_file, null); assert.equal(f.state.footer_image_file, null);
  assert.equal(f.state.header_image, saved.header_image); assert.equal(f.state.footer_image, saved.footer_image);
  assert.deepEqual(plain(f.updates), [saved]);
  assert.ok(f.avatarCalls.length, "The actual CoreMixin avatar helper is used for the saved editor identity");
});

test("editor failures keep the dialog, draft text, image files and saved references intact", async t => {
  const f = await editorFixture(t);
  await f.input("b_shop_email_template_editor.subject", "Retained subject");
  const headerFile = new dom.window.File(["fixture"], "draft-header.png", { type: "image/png" });
  f.state.header_image_file = headerFile;
  await f.action("global.actions.save");
  f.requests.at(-1).resolve({ data: { error: true, error_msg: "Fixture invalid" } }); await settle();
  assert.equal(f.state.dialog, true); assert.equal(f.state.subject, "Retained subject");
  assert.equal(f.state.header_image_file, headerFile); assert.equal(f.state.busy_set, false);
  await f.action("global.actions.save");
  f.requests.at(-1).reject(new Error("Fixture offline")); await settle();
  assert.equal(f.state.dialog, true); assert.equal(f.state.subject, "Retained subject");
  assert.equal(f.state.header_image_file, headerFile); assert.equal(f.state.busy_set, false);
  assert.equal(f.state.header_image, "shops/7/fixture-header.png"); assert.equal(f.updates.length, 0);
});

test("editor optional and untrusted parameter names render as plain text", async t => {
  const f = await editorFixture(t, { params: ["order_id", '<img src="x" onerror="fixture()">'] });
  assert.deepEqual(plain(f.state.parameter_names.slice(0, 5)), ["shop_title", "shop_domain", "shop_mail", "shop_address", "shop_phone"]);
  assert.ok([...f.host.querySelectorAll("code")].some(node => node.textContent === ':<img src="x" onerror="fixture()">'));
  assert.equal(f.host.querySelector('img[src="x"]'), null);
  const withoutParams = await editorFixture(t, { params: null });
  assert.equal(withoutParams.state.parameter_names.length, 5);
});

test("Workspace navigation and custom/default toggling retain text, native image models and logo choice", async t => {
  const f = await editorFixture(t);
  const navigate = async key => {
    const section = f.state.editor_sections.find(item => item.key === key);
    const control = [...f.host.querySelectorAll('.b-shop-email-template-editor__nav button')].find(node => node.textContent.includes(section.label));
    assert.ok(control, `Workspace section ${key} is available`); control.click(); await settle();
    assert.equal(f.state.active_section, key);
    assert.equal(control.getAttribute("aria-current"), "location");
  };
  await f.input("b_shop_email_template_editor.subject", "Workspace draft subject");
  const subjectInput = f.host.querySelector('[data-field="b_shop_email_template_editor.subject"] input');
  const contentSection = subjectInput.closest('.b-shop-email-template-editor__section');
  assert.notEqual(contentSection.style.display, "none");
  await navigate("header");
  assert.equal(contentSection.style.display, "none", "Inactive content is hidden through the actual v-show directive");
  const header = f.host.querySelector('[data-image="b_shop_email_template_editor.header_image"]');
  const headerSection = header.closest('.b-shop-email-template-editor__section');
  assert.notEqual(headerSection.style.display, "none");
  const fileInput = header.querySelector('[data-image-file]');
  const headerFile = new dom.window.File(["fixture header draft"], "workspace-header.png", { type: "image/png" });
  Object.defineProperty(fileInput, "files", { configurable: true, value: [headerFile] });
  fileInput.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  const reference = header.querySelector('[data-image-reference]');
  reference.value = "shops/7/workspace-header.png"; reference.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await settle();
  f.host.querySelectorAll('.s--smart-toggle [role="switch"]')[1].click(); await settle();
  assert.equal(f.state.header_logo, false);
  await navigate("footer");
  assert.equal(headerSection.style.display, "none");
  await f.input("b_shop_email_template_editor.footer", "<p>Workspace footer</p>");
  await navigate("action");
  await f.input("b_shop_email_template_editor.button_caption", "Workspace action");
  await navigate("content");
  assert.notEqual(contentSection.style.display, "none");
  assert.equal(f.host.querySelector('[data-field="b_shop_email_template_editor.subject"] input'), subjectInput, "Section navigation preserves the mounted text control");
  assert.equal(f.host.querySelector('[data-image="b_shop_email_template_editor.header_image"] [data-image-file]'), fileInput, "Section navigation preserves the native image-picker boundary");
  const customization = f.host.querySelector('.s--smart-toggle [role="switch"]');
  customization.click(); await settle(); assert.equal(f.state.enable, false);
  f.host.querySelector('.s--smart-toggle [role="switch"]').click(); await settle(); assert.equal(f.state.enable, true);
  assert.equal(f.state.subject, "Workspace draft subject");
  assert.equal(f.state.footer, "<p>Workspace footer</p>"); assert.equal(f.state.action, "Workspace action");
  assert.equal(f.state.header_image, "shops/7/workspace-header.png"); assert.equal(f.state.header_image_file, headerFile);
  assert.equal(f.state.header_logo, false);
  assert.equal(f.requests.length, 1, "Local navigation and toggles do not save or upload files");
});

test("the editor launcher can be a view's primary action without repeating the custom state", async t => {
  const launcher = f => f.host.querySelector(".b-shop-email-template-editor__launcher button");
  const standard = await editorFixture(t);
  assert.equal(launcher(standard).getAttribute("variant"), "outlined");
  assert.equal(launcher(standard).getAttribute("color"), null);
  assert.ok(launcher(standard).querySelector(".b-shop-email-template-editor__custom"), "A standalone launcher still shows the custom state");
  const primary = await editorFixture(t, { primary: true });
  assert.equal(launcher(primary).getAttribute("variant"), "elevated");
  assert.equal(launcher(primary).getAttribute("color"), "primary");
  assert.ok(launcher(primary).classList.contains("sd-modern-button--primary"));
  assert.equal(launcher(primary).querySelector(".b-shop-email-template-editor__custom"), null, "The host page states custom/default itself");
});
