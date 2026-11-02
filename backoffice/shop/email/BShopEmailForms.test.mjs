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
  const output = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
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
  setup: (props, { attrs, emit }) => () => Vue.h("label", { ...attrs, "data-field": props.label }, [
    props.label,
    Vue.h(tag, { value: props.modelValue ?? "", type: props.type || "text", disabled: props.disabled, onInput: event => emit("update:modelValue", event.target.value) }),
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
    app.component(tag, tag === "v-btn" ? button : tag === "v-dialog" ? dialog : tag === "v-tooltip" ? tooltip : tag === "v-text-field" ? field("input") : tag === "v-textarea" ? field("textarea") : tag === "v-select" ? smartSelect : leaf);
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
async function providerFixture(t, value = service()) { const f = await fixture(t, provider); await f.readComplete({ mail_service: value }); return f; }
async function editorFixture(t, props = {}, value = savedTemplate()) {
  const f = await fixture(t, editor, { code: "order-payment", template: { title: "Fixture order template" }, params: ["order_id"], ...props });
  await f.readComplete({ mail_template: value, default: defaults });
  f.state.dialog = true; await settle(); return f;
}

test("provider and editor templates, scripts and scoped Sass compile with production asset handling", async () => {
  for (const source of [provider, editor]) for (const style of source.descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: source.file, id: "email-forms-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
  }
});

test("all four providers retain their exact configuration fields and common encryption/sender controls", async t => {
  const f = await providerFixture(t);
  const expected = { mailgun: ["Domain", "API Key", "Endpoint"], postmark: ["API Key", "Stream ID"], ses: ["Secret Key", "Region", "Key"], smtp: ["SMTP Host", "SMTP Port", "SMTP Username", "SMTP Password"] };
  for (const [driver, labels] of Object.entries(expected)) {
    await f.input("shop_email_provider.provider", driver);
    const actual = [...f.host.querySelectorAll("[data-field]")].map(node => node.dataset.field);
    for (const label of labels) assert.ok(actual.includes(label), `${driver} retains ${label}`);
    assert.deepEqual(actual.filter(label => !label.startsWith("shop_email_provider.")).sort(), [...labels].sort(), `${driver} does not expose another provider's fields`);
    assert.ok(actual.includes("shop_email_provider.inputs.from.label"));
    assert.ok(actual.includes("shop_email_provider.inputs.from_name.label"));
    assert.ok(actual.includes("shop_email_provider.encryption.title"));
    const secure = f.host.querySelector('input[type="password"]');
    assert.ok(secure, `${driver} keeps private entry hidden`);
  }
});

test("provider Save retains the complete enable/configuration/sender payload and applies success", async t => {
  const f = await providerFixture(t);
  await f.input("SMTP Host", "draft-smtp.example.test");
  await f.input("shop_email_provider.inputs.from_name.label", "Draft sender");
  await f.action("global.actions.save");
  const request = f.requests.at(-1);
  assert.equal(request.url, "/fixture/shops/7/mail-service/set");
  assert.deepEqual(plain(request.body), { enable: true, driver: "smtp", host: "draft-smtp.example.test", port: 587, from: "shop@example.test", from_name: "Draft sender", api: "fixture-api", username: "fixture-user", password: "fixture-password", endpoint: "fixture-endpoint", encryption: "tls" });
  assert.equal(f.state.busy_set, true); assert.equal(f.shop.mail_service, null);
  const saved = { ...service(), ...plain(request.body) };
  request.resolve({ data: { mail_service: saved } }); await settle();
  assert.equal(f.state.busy_set, false); assert.deepEqual(plain(f.shop.mail_service), saved);
  assert.ok(f.notices.some(([method]) => method === "showSuccessAlert"));
});

test("provider failures retain drafts and release Save, and no service remains a usable unsaved form", async t => {
  const f = await providerFixture(t, null);
  assert.equal(f.state.busy, false); assert.equal(f.state.mail_service, null);
  await f.input("shop_email_provider.provider", "smtp");
  await f.input("SMTP Host", "retained.example.test");
  await f.action("global.actions.save");
  f.requests.at(-1).resolve({ data: { error: true, error_msg: "Fixture denied" } }); await settle();
  assert.equal(f.state.host, "retained.example.test"); assert.equal(f.state.busy_set, false);
  await f.action("global.actions.save");
  f.requests.at(-1).reject(new Error("Fixture offline")); await settle();
  assert.equal(f.state.host, "retained.example.test"); assert.equal(f.state.busy_set, false);
  assert.equal(f.shop.mail_service, null);
  assert.ok(f.notices.some(([method]) => method === "showErrorAlert"));
  assert.ok(f.notices.some(([method]) => method === "showLaravelError"));
});

test("disabling a provider keeps its configuration editable and saves the disabled flag", async t => {
  const f = await providerFixture(t);
  f.host.querySelector('button[role="switch"]').click(); await settle();
  assert.equal(f.state.enable, false);
  assert.ok(f.host.querySelector('[data-field="SMTP Host"] input'));
  assert.ok(![...f.host.querySelectorAll("button")].some(node => node.textContent.includes("shop_email_provider.actions.send_test_email")));
  await f.action("global.actions.save");
  const request = f.requests.at(-1);
  assert.equal(request.body.enable, false); assert.equal(request.body.host, "smtp.example.test");
  request.resolve({ data: { mail_service: { ...service(), enable: false } } }); await settle();
  assert.equal(f.shop.mail_service.enable, false);
});

test("provider test sends only the existing signed-in-account request and error reset updates counts", async t => {
  const f = await providerFixture(t, { ...service(), errors: 12, error: "Fixture delivery error" });
  assert.match(f.host.textContent, /account@example\.test/);
  await f.action("shop_email_provider.actions.send_test_email");
  const testRequest = f.requests.at(-1);
  assert.equal(testRequest.url, "/fixture/shops/7/mail-service/test");
  assert.equal(testRequest.body, undefined, "No arbitrary recipient is added to the API");
  testRequest.resolve({ data: {} }); await settle();
  assert.equal(f.state.busy_send_test, false);
  await f.action("shop_email_provider.actions.reset_errors");
  const reset = f.requests.at(-1);
  assert.equal(reset.url, "/fixture/shops/7/mail-service/reset"); assert.equal(reset.body, undefined);
  reset.resolve({ data: { mail_service: service() } }); await settle();
  assert.equal(f.state.busy_reset, false); assert.equal(f.state.mail_service.errors, 0);
  assert.equal(f.host.querySelector('[role="alert"]'), null);
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
