import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";

const require = createRequire(new URL("../../../../../package.json", import.meta.url));
const { parse, compileScript, compileTemplate, compileStyleAsync } = require("@vue/compiler-sfc");
const ts = require("typescript");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { JSDOM } = require("jsdom");
const file = new URL("./BDomainAdd.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "domain-add-test" });
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const code = transpile(script.content);
const template = compileTemplate({
  source: descriptor.template.content, filename: file.pathname, id: "domain-add-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
const plain = value => JSON.parse(JSON.stringify(value));
const rules = {
  ValidateDomain: value => typeof value === "string" && value.includes(".") && !value.includes(" "),
  required: () => value => !!value,
};

function leaf(name) {
  return {
    name, inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => Vue.h("div", { "data-leaf": name }, [
        attrs.value == null ? null : Vue.h("code", String(attrs.value)),
        slots.activator?.({ props: {} }), slots.default?.(),
      ]);
    },
  };
}

function environment(props = {}) {
  const access = { write: true, add: true, edit: true };
  const requests = [], alerts = [], events = [];
  const request = (method, url, payload) => new Promise((resolve, reject) => {
    requests.push({ method, url, payload, resolve: data => resolve({ data }), reject });
  });
  const notifications = {
    showSuccessAlert: (...args) => alerts.push(["success", ...args]),
    showErrorAlert: (...args) => alerts.push(["business", ...args]),
    showLaravelError: (...args) => alerts.push(["transport", ...args]),
  };
  const exports = {};
  const dependency = path => {
    if (path === "vue") return Vue;
    if (path.includes("NotificationService")) return { default: notifications };
    if (path.endsWith("/GlobalRules")) return { default: rules };
    if (path.includes("/ShopLicense")) return { Eligible: {
      CanAddNewDomain: () => access.add, CanEditDomain: () => access.edit,
    } };
    if (path.includes("/ShopPermissions")) return { ShopPermissionRegions: { SETTINGS: { code: "SETTINGS" } } };
    if (path.endsWith(".vue")) return { default: leaf(path.split("/").at(-1).replace(".vue", "")) };
    if (/\.(svg|png)$/.test(path)) return "/isolated-asset.svg";
    throw Error(`Unexpected dependency: ${path}`);
  };
  const api = {
    POST_ADD_DOMAIN: id => `/isolated/shops/${id}/domains`,
    GET_DOMAIN_INFO: (id, domain) => `/isolated/shops/${id}/domains/${domain}`,
    POST_CREATE_CLIENT_FOR_DOMAIN: (id, domain) => `/isolated/shops/${id}/domains/${domain}/client`,
    PUT_EDIT_DOMAIN: (id, domain, param) => `/isolated/shops/${id}/domains/${domain}/${param}`,
  };
  vm.runInNewContext(code, {
    exports, require: dependency, window: { API: api },
    axios: {
      get: url => request("GET", url),
      post: (url, data) => request("POST", url, data),
      put: (url, data) => request("PUT", url, data),
    },
  });
  const component = exports.default;
  const shop = {
    id: 71, icon: "fixture", hash_id: "fixture-ownership", domains: [],
    custom_ips: ["203.0.113.10", "203.0.113.80"],
    custom_ips_ssl_proxy: ["203.0.113.80"], custom_cnames: ["shops.example.test"],
  };
  const helpers = {
    $t: key => key, $n: value => String(value),
    $emit: (...args) => events.push(args),
    $nextTick: callback => Promise.resolve().then(callback),
    $refs: {}, $el: { querySelector: () => null },
    writeShopAccess: () => access.write,
    getShopImagePath: () => "/isolated-shop.svg",
    AddOrUpdateItemByID: (items, item) => {
      const index = items.findIndex(entry => entry.id === item.id);
      if (index < 0) items.push(item); else items[index] = item;
    },
  };
  const form = { ...component.data(), modern: true, inline: false, domain: {}, shop, ...props, ...helpers };
  for (const [name, method] of Object.entries(component.methods)) form[name] = method.bind(form);
  for (const [name, computed] of Object.entries(component.computed)) {
    const getter = typeof computed === "function" ? computed : computed.get;
    Object.defineProperty(form, name, {
      get: () => getter.call(form),
      ...(computed.set ? { set: value => computed.set.call(form, value) } : {}),
    });
  }
  component.created.call(form);
  return { component, form, shop, access, requests, alerts, events, helpers, dependency, api };
}

function ready(fixture, values = {}) {
  Object.assign(fixture.form, {
    input_domain: "store.example.test", guided_step: 3, guided_acknowledged: true, ...values,
  });
}

async function render(state = {}, props = {}) {
  const f = environment(props), fields = [], recordGroups = [];
  let instance;
  const rendered = {};
  vm.runInNewContext(transpile(template.code), { exports: rendered, require: path => path === "vue" ? Vue : f.dependency(path) });
  const component = { ...f.component, render: rendered.render };
  const created = component.created;
  component.created = function () {
    created.call(this); Object.assign(this, state); instance = this;
    this.focusGuidedStep = () => {}; // SSR has no mounted heading or scroll surface.
  };
  component.components = { ...component.components, BDomainDnsRecords: {
    props: ["records"],
    setup(props) {
      recordGroups.push(plain(props.records));
      return () => Vue.h("div", { "data-record-group": "" }, props.records.map(record =>
        Vue.h("code", `${record.type} ${record.host} ${record.value}`)));
    },
  } };
  const app = Vue.createSSRApp(component, { modern: true, inline: false, domain: {}, shop: f.shop, ...props });
  Object.assign(app.config.globalProperties, f.helpers, { GlobalRules: rules, $vuetify: { locale: { isRtl: false } } });
  const tag = name => ({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => Vue.h(name, attrs, [slots.activator?.({ props: {} }), slots.default?.()]);
    },
  });
  app.component("VTextField", {
    inheritAttrs: false,
    props: ["modelValue", "label", "disabled", "rules"],
    setup(props, { attrs, slots }) {
      fields.push({ ...props, ...attrs });
      return () => Vue.h("label", { class: attrs.class }, [props.label, Vue.h("input", { value: props.modelValue, disabled: props.disabled }), slots.message?.()]);
    },
  });
  for (const name of ["VCard", "VCardTitle", "VCardText", "VCardActions", "VIcon", "VTooltip", "VLocaleProvider", "VExpandTransition", "VRadioGroup", "VRadio", "VCheckbox", "VImg", "VTable", "VProgressLinear", "VRow", "VCol", "VTabs", "VTab", "VWindow", "VWindowItem", "VAlert", "VChip", "VListItem", "VListSubheader", "VSelect", "VSlideXReverseTransition", "VSpacer", "ULoadingProgress", "UWidgetHeader", "SWidgetButtons"]) app.component(name, tag("div"));
  app.component("VBtn", tag("button"));
  app.config.warnHandler = message => {
    if (!message.includes("Non-function value encountered")) throw Error(message);
  };
  const html = await renderToString(app);
  return { document: new JSDOM(html).window.document, fields, recordGroups, requests: f.requests, instance };
}

test("Guided is limited to modern modal additions and navigation never fetches or submits", async () => {
  const f = environment();
  assert.equal(f.form.guidedAdd, true);
  assert.equal(f.requests.length, 0);
  f.form.goToGuidedStep(2);
  assert.equal(f.form.guided_step, 1, "an empty address cannot advance");
  f.form.input_domain = "store.example.test";
  f.form.handleDomainEnter();
  assert.equal(f.form.guided_step, 2);
  f.form.goToGuidedStep(3);
  for (const step of [0, 4, "3", null]) f.form.goToGuidedStep(step);
  assert.equal(f.form.guided_step, 3);
  f.form.busy_add = true;
  f.form.goToGuidedStep(1);
  assert.equal(f.form.guided_step, 3);
  assert.equal(f.requests.length, 0, "navigation must not use the mutating domain-info GET or POST");
  for (const props of [{ inline: true }, { modern: false }, { domain: { id: 8, domain: "edit.example.test" } }]) {
    const legacy = environment(props);
    assert.equal(legacy.form.guidedAdd, false);
  }
  await setImmediate();
});

test("the final add action rechecks stage, validity, acknowledgement, access, quota and secure availability", () => {
  for (const restriction of ["stage", "domain", "acknowledgement", "write", "quota", "secure"]) {
    const f = environment(); ready(f);
    if (restriction === "stage") f.form.guided_step = 2;
    if (restriction === "domain") f.form.input_domain = "invalid";
    if (restriction === "acknowledgement") f.form.guided_acknowledged = false;
    if (restriction === "write") f.access.write = false;
    if (restriction === "quota") f.access.add = false;
    if (restriction === "secure") { f.form.show_ssl_ips = true; f.shop.custom_ips_ssl_proxy = []; }
    f.form.setShopDomain();
    assert.equal(f.requests.length, 0, restriction);
    assert.equal(f.form.busy_add, false, restriction);
  }
});

test("all supported hosting choices preserve the existing POST contract and prevent duplicate submissions", async () => {
  for (const [external, secure, method] of [[false, false, "meta"], [false, true, "meta"], [true, false, "meta"], [true, true, "txt"]]) {
    const f = environment(); ready(f, { externally_hosted: external, show_ssl_ips: secure, verification_method: method });
    f.form.setShopDomain(); f.form.setShopDomain();
    assert.equal(f.requests.length, 1);
    const request = f.requests[0];
    assert.equal(request.method, "POST");
    assert.equal(request.url, "/isolated/shops/71/domains");
    assert.deepEqual(plain(request.payload), { domain: "store.example.test", ssl_proxy: !external && secure, externally_hosted: external, verification_method: external ? method : "txt" });
    const domain = { id: 81, domain: "store.example.test" };
    request.resolve({ error: false, domain }); await setImmediate();
    assert.deepEqual(plain(f.events), [["add", domain], ["click:close"]]);
    assert.deepEqual(plain(f.shop.domains), [domain]);
    assert.equal(f.form.busy_add, false);
  }
});

test("ownership failures restore DNS review, preserve configuration and permit a deliberate retry", async () => {
  for (const external of [false, true]) {
    const f = environment(); ready(f, { externally_hosted: external, verification_method: "txt", guided_record_type: "CNAME" });
    const dns = [{ type: "A", ip: "203.0.113.12" }];
    f.form.setShopDomain();
    f.requests[0].resolve({ error: true, error_msg: "Fixture ownership not found", dns });
    await setImmediate();
    assert.equal(f.form.guided_step, 2); assert.equal(f.form.guided_acknowledged, false);
    assert.equal(f.form.input_domain, "store.example.test"); assert.equal(f.form.verification_method, "txt");
    assert.equal(f.form.guided_record_type, "CNAME"); assert.equal(f.form.externally_hosted, external);
    assert.equal(f.form.domain_error_msg, "Fixture ownership not found");
    assert.deepEqual(f.form.last_dns, dns, "Guided retains detected DNS for hosted and external TXT feedback");
    assert.equal(f.form.show_dns, !external); assert.equal(f.events.length, 0);
    f.form.goToGuidedStep(3); f.form.guided_acknowledged = true; f.form.setShopDomain();
    assert.equal(f.requests.length, 2);
    f.requests[1].resolve({ error: false, domain: { id: 82, domain: "store.example.test" } });
    await setImmediate(); assert.equal(f.events[0][0], "add");
  }
});

test("transport failures retain the address and return to actionable DNS instructions", async () => {
  const f = environment(); ready(f, { show_ssl_ips: true });
  f.form.last_domain_check = { approved: true, valid_txt: true, verified: true };
  f.form.setShopDomain();
  assert.equal(f.form.last_domain_check, null, "a new request immediately hides evidence from the preceding attempt");
  f.requests[0].reject(Error("Fixture offline")); await setImmediate();
  assert.equal(f.form.guided_step, 2); assert.equal(f.form.guided_acknowledged, false);
  assert.equal(f.form.input_domain, "store.example.test"); assert.equal(f.form.show_ssl_ips, true);
  assert.equal(f.form.busy_add, false); assert.equal(f.events.length, 0);
  assert.equal(f.alerts.at(-1)[0], "transport");
  assert.equal(f.form.domain_error_msg, "domains_modern.connection.guided.connectionError");
  assert.equal(f.form.last_domain_check, null, "a transport failure cannot reuse an earlier verification result");
});

test("Guided DNS errors retain readable server guidance without rendering HTML", () => {
  const f = environment();
  f.form.domain_error_msg = 'Set TXT<hr>Check <b>store-challenge</b><br/>Keep the complete value.';
  assert.equal(f.form.guidedErrorMessage, 'Set TXT\nCheck store-challenge\nKeep the complete value.');
  f.form.domain_error_msg = '<img src=x onerror=bad>Malformed record';
  assert.equal(f.form.guidedErrorMessage, '<img src=x onerror=bad>Malformed record', 'Unknown markup stays text for Vue to escape');
});

test("failed checks project only typed verification metadata from the actual response", async () => {
  const challenge = [{ type: "TXT", txt: "selldone-domain-verification=fixture-ownership" }];
  for (const [response, expected] of [
    [{ approved: true, valid_txt: false, verified: false, dns_challenge: challenge, challenge_domain: "store-challenge.example.test", verification_host: "store-challenge" },
      { approved: true, valid_txt: false, verified: false, dns_challenge: challenge, challenge_domain: "store-challenge.example.test", verification_host: "store-challenge" }],
    [{ approved: false, valid_txt: true, verified: true, dns_challenge: [], challenge_domain: "_selldone-verification.store.example.test", verification_host: "_selldone-verification.store" },
      { approved: false, valid_txt: true, verified: true, dns_challenge: [], challenge_domain: "_selldone-verification.store.example.test", verification_host: "_selldone-verification.store" }],
    [{ approved: "true", valid_txt: 1, verified: "false", dns_challenge: {}, challenge_domain: ["wrong-type"], verification_host: { host: "wrong-type" } },
      { approved: null, valid_txt: null, verified: null, dns_challenge: null, challenge_domain: null, verification_host: null }],
    [{}, { approved: null, valid_txt: null, verified: null, dns_challenge: null, challenge_domain: null, verification_host: null }],
  ]) {
    const f = environment(); ready(f);
    f.form.setShopDomain();
    f.requests[0].resolve({ error: true, error_msg: "Fixture verification failure", unexpected_field: "must not be retained", ...response });
    await setImmediate();
    assert.deepEqual(plain(f.form.last_domain_check), expected);
    assert.equal(f.form.last_dns, null, "absent detected DNS stays unavailable rather than inventing a successful match");
    assert.equal(f.form.guided_step, 2);
    assert.equal(f.events.length, 0);
  }
});

test("external TXT preserves detected DNS for Guided feedback without changing legacy external failures", async () => {
  const dns = [{ type: "TXT", name: "_selldone-verification.store.example.test", txt: "fixture-old-value" }];
  for (const [modern, verification] of [[true, "txt"], [false, "txt"], [true, "meta"], [false, "meta"]]) {
    const f = environment({ modern });
    ready(f, { externally_hosted: true, verification_method: verification });
    f.form.setShopDomain();
    f.requests[0].resolve({ error: true, error_msg: "Fixture TXT mismatch", dns, valid_txt: false, verified: false });
    await setImmediate();
    assert.deepEqual(f.form.last_dns, modern && verification === "txt" ? dns : null);
    assert.equal(f.form.show_dns, false, "the old Selldone-routing diagnostics stay off for external sites");
    if (modern) {
      assert.equal(f.form.last_domain_check.valid_txt, false);
      assert.equal(f.form.last_domain_check.verified, false);
    } else assert.equal(f.form.last_domain_check, null, "legacy failures do not gain the new Guided feedback state");
    assert.equal(f.events.length, 0);
  }
  const malformed = environment(); ready(malformed);
  malformed.form.setShopDomain();
  malformed.requests[0].resolve({ error: true, error_msg: "Fixture unavailable DNS", dns: { type: "TXT" } });
  await setImmediate();
  assert.equal(malformed.form.last_dns, null, "malformed detected DNS is not passed to the comparison table");
});

test("A and CNAME alternatives use configured targets and retain relative verification hosts", () => {
  const f = environment(); f.form.input_domain = "store.eu.example.com";
  assert.deepEqual(plain(f.form.guidedRecords), [{ type: "A", host: "store.eu", value: "203.0.113.10" }]);
  f.form.guided_record_type = "CNAME";
  assert.deepEqual(plain(f.form.guidedRecords), [{ type: "CNAME", host: "store.eu", value: "shops.example.test" }]);
  f.form.show_ssl_ips = true;
  assert.equal(f.form.canUseGuidedCname, false);
  assert.deepEqual(plain(f.form.guidedRecords), [{ type: "A", host: "store.eu", value: "203.0.113.80" }]);
  for (const [domain, host, txt] of [["example.co.uk", "@", "@"], ["*.store.example.com", "*.store", "*.store-challenge"], ["*.example.com", "*", "*"], ["store.eu.example.com", "store.eu", "store.eu-challenge"]]) {
    f.form.input_domain = domain;
    assert.equal(f.form.domain_verification_title, host); assert.equal(f.form.domain_verification_txt_title, txt);
  }
  f.form.hosting_mode = "external";
  assert.equal(f.form.show_ssl_ips, false); assert.equal(f.form.canUseGuidedCname, false);
  assert.equal(f.form.domain_verification_txt_title, "_selldone-verification.store.eu");
  assert.match(f.form.domain_verification_meta_tag, /content="fixture-ownership"/);
  assert.equal(f.form.domain_verification_url, "https://store.eu.example.com/");
});

test("feedback compares every currently allowed routing alternative and the actual ownership record", () => {
  const f = environment(); f.form.input_domain = "store.eu.example.com";
  Object.assign(f.shop, {
    custom_ips: ["203.0.113.10", "203.0.113.11", "203.0.113.80", "203.0.113.81"],
    custom_ips_ssl_proxy: ["203.0.113.80", "203.0.113.81"],
    custom_cnames: ["route-a.example.test", "route-b.example.test"],
  });
  const ownership = { type: "TXT", host: "store.eu-challenge", value: "selldone-domain-verification=fixture-ownership" };
  const direct = [
    { type: "A", host: "store.eu", value: "203.0.113.10" },
    { type: "A", host: "store.eu", value: "203.0.113.11" },
    { type: "CNAME", host: "store.eu", value: "route-a.example.test" },
    { type: "CNAME", host: "store.eu", value: "route-b.example.test" },
    ownership,
  ];
  for (const selected of ["A", "CNAME"]) {
    f.form.guided_record_type = selected;
    assert.deepEqual(plain(f.form.guidedFeedbackExpected), direct, "the instruction choice must not exclude a valid alternate route");
  }
  f.form.show_ssl_ips = true;
  assert.deepEqual(plain(f.form.guidedFeedbackExpected), [
    { type: "A", host: "store.eu", value: "203.0.113.80" },
    { type: "A", host: "store.eu", value: "203.0.113.81" }, ownership,
  ]);
  f.form.show_ssl_ips = false; f.form.input_domain = "example.com";
  assert.deepEqual(plain(f.form.guidedFeedbackExpected).map(row => row.type), ["A", "A", "TXT"], "apex addresses do not gain the subdomain CNAME alternative");
  f.form.input_domain = "store.eu.example.com"; f.form.hosting_mode = "external"; f.form.verification_method = "txt";
  assert.deepEqual(plain(f.form.guidedFeedbackExpected), [{ type: "TXT", host: "_selldone-verification.store.eu", value: ownership.value }]);
  f.form.verification_method = "meta";
  assert.deepEqual(plain(f.form.guidedFeedbackExpected), [], "HTML verification must not compare DNS routing or TXT values");
});

test("exported instructions contain only the selected routing alternative plus ownership", () => {
  const f = environment(); f.form.input_domain = "store.example.test";
  const ownership = { type: "TXT", host: "store-challenge", value: "selldone-domain-verification=fixture-ownership" };
  assert.deepEqual(plain(f.form.guidedExportRecords), [{ type: "A", host: "store", value: "203.0.113.10" }, ownership]);
  f.form.guided_record_type = "CNAME";
  assert.deepEqual(plain(f.form.guidedExportRecords), [{ type: "CNAME", host: "store", value: "shops.example.test" }, ownership]);
  f.form.show_ssl_ips = true;
  assert.deepEqual(plain(f.form.guidedExportRecords), [{ type: "A", host: "store", value: "203.0.113.80" }, ownership], "secure mode cannot export a stale own-CDN CNAME choice");
  f.form.hosting_mode = "external"; f.form.verification_method = "txt";
  assert.deepEqual(plain(f.form.guidedExportRecords), [{ type: "TXT", host: "_selldone-verification.store", value: ownership.value }]);
  f.form.verification_method = "meta";
  assert.deepEqual(plain(f.form.guidedExportRecords), []);
  f.form.hosting_mode = "selldone"; f.form.input_domain = "invalid";
  assert.deepEqual(plain(f.form.guidedExportRecords), [], "an invalid address has no exportable instructions");
});

test("editing relevant setup choices invalidates the earlier review confirmation", () => {
  const f = environment(); ready(f);
  for (const name of ["input_domain", "externally_hosted", "show_ssl_ips", "guided_record_type", "verification_method"]) {
    f.form.guided_acknowledged = true; f.component.watch[name].call(f.form);
    assert.equal(f.form.guided_acknowledged, false, name);
  }
  f.form.guided_step = 3; f.form.input_domain = "invalid";
  f.component.watch.input_domain.call(f.form);
  assert.equal(f.form.guided_step, 1);
});

test("changing verification inputs invalidates stale attempt evidence while a display-only A/CNAME choice retains it", () => {
  const f = environment(); ready(f);
  for (const name of ["input_domain", "externally_hosted", "show_ssl_ips", "verification_method"]) {
    f.form.last_domain_check = { approved: true, valid_txt: true, verified: true };
    f.form.guided_acknowledged = true;
    f.component.watch[name].call(f.form);
    assert.equal(f.form.last_domain_check, null, name);
    assert.equal(f.form.guided_acknowledged, false, name);
  }
  const check = { approved: false, valid_txt: true, verified: true };
  f.form.last_domain_check = check; f.form.guided_acknowledged = true;
  f.component.watch.guided_record_type.call(f.form);
  assert.equal(f.form.last_domain_check, check, "both direct routing alternatives describe the same attempted configuration");
  assert.equal(f.form.guided_acknowledged, false);
  f.form.last_dns = [{ type: "A", ip: "203.0.113.10" }];
  f.form.domain_error_msg = "Fixture stale error"; f.form.show_dns = true;
  f.form.hosting_mode = "external";
  assert.equal(f.form.last_domain_check, null); assert.equal(f.form.last_dns, null);
  assert.equal(f.form.domain_error_msg, null); assert.equal(f.form.show_dns, false);
});

test("legacy inline additions and existing enable/client repair actions remain available", async () => {
  const inline = environment({ inline: true }); inline.form.input_domain = "inline.example.test";
  inline.form.handleDomainEnter();
  assert.equal(inline.requests[0].method, "POST");
  inline.requests[0].resolve({ error: false, domain: { id: 83 } }); await setImmediate();
  const f = environment({ domain: { id: 12, domain: "edit.example.test", enable: true } });
  assert.equal(f.requests.length, 1); assert.equal(f.requests[0].method, "GET", "preserve the existing edit refresh without calling it during add navigation");
  f.requests[0].resolve({ error: false, domain: { id: 12 }, dns: [], client: { redirect: "https://fixture.example/callback" } });
  await setImmediate();
  f.form.updateShopDomain("enable", f.form.input_domain, false);
  assert.deepEqual(plain(f.requests[1].payload), { value: false }); assert.equal(f.requests[1].method, "PUT");
  f.requests[1].resolve({ error: false, domain: { id: 12, enable: false } }); await setImmediate();
  assert.deepEqual(plain(f.events), [["update", { id: 12, enable: false }], ["click:close"]]);
  f.form.createClientSecret(12); assert.equal(f.requests[2].url, "/isolated/shops/71/domains/12/client");
  f.requests[2].resolve({ error: false, client: { redirect: "https://fixture.example/repaired" } }); await setImmediate();
  assert.equal(f.form.domain_client.redirect, "https://fixture.example/repaired");
});

test("rendered Guided controls expose only the final submit and the selected DNS alternative", async () => {
  const address = await render({ input_domain: "store.example.test", guided_step: 1 });
  assert.equal(address.requests.length, 0);
  const buttons = [...address.document.querySelectorAll("button")];
  assert.ok(buttons.some(node => node.textContent.includes("guided.continue")));
  assert.ok(!buttons.some(node => node.textContent.includes("domains_modern.connection.connect")));
  assert.equal(typeof address.fields[0].onKeydown, "function", "address Enter uses the compiled handler");
  address.fields[0].onKeydown({ key: "Enter", preventDefault() {} });
  assert.equal(address.instance.guided_step, 2, "the actual rendered Enter handler advances to DNS");
  assert.equal(address.requests.length, 0, "the actual rendered Enter handler must not submit");
  const cname = await render({ input_domain: "store.example.test", guided_step: 2, guided_record_type: "CNAME" });
  assert.deepEqual(cname.recordGroups, [[{ type: "CNAME", host: "store", value: "shops.example.test" }], [{ type: "TXT", host: "store-challenge", value: "selldone-domain-verification=fixture-ownership" }]]);
  const external = await render({ input_domain: "store.example.test", externally_hosted: true, verification_method: "meta", guided_step: 2 });
  assert.deepEqual(external.recordGroups, [], "external META verification must not show Selldone routing records");
  assert.match(external.document.body.textContent, /fixture-ownership/);
  const review = await render({ input_domain: "store.example.test", guided_step: 3 });
  const submit = [...review.document.querySelectorAll("button")].find(node => node.textContent.includes("domains_modern.connection.connect"));
  assert.ok(submit); assert.ok(submit.hasAttribute("disabled"));
});

test("domain-add scoped styles compile after the Guided layout change", async () => {
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({ source: style.content, filename: file.pathname, id: "domain-add-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(result.errors, []);
  }
});
