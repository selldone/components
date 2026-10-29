import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";

// Use the application's compiler dependencies, not the package's nested copies.
const require = createRequire(new URL("../../../../../package.json", import.meta.url));
const { compileScript, compileStyleAsync, compileTemplate, parse } = require("@vue/compiler-sfc");
const ts = require("typescript");
const file = new URL("./BCompanyAdd.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "company-add-test" });
const code = ts.transpileModule(script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const draft = {
  name: "Fixture Studio",
  website: "https://example.com",
  email: "fixture@example.com",
  address: "Fixture company address",
  phone: "+1 202 555 0142",
  mobile: "+1 202 555 0143",
  tax: "US12300000",
  country: "US",
};

function environment({ modern = true, company } = {}) {
  const requests = [], alerts = [], events = [];
  let focusCount = 0;
  const exports = {};
  const notifications = {
    showSuccessAlert: (...args) => alerts.push({ type: "success", args }),
    showErrorAlert: (...args) => alerts.push({ type: "business", args }),
    showLaravelError: (...args) => alerts.push({ type: "transport", args }),
  };
  const request = (method, url, payload) => new Promise((resolve, reject) => {
    requests.push({ method, url, payload, resolve: (data) => resolve({ data }), reject });
  });
  vm.runInNewContext(code, {
    exports,
    require: (path) => {
      if (path === "vue") return { useId: () => "company-add-fixture" };
      if (path.includes("NotificationService")) return { default: notifications };
      if (path.endsWith("/SetupService")) return { SetupService: { DefaultCountry: () => "US" } };
      if (path.endsWith("/country.model")) return { Country: { EuropeCountriesAlpha2: ["DK", "DE"] } };
      return { default: {} };
    },
    axios: {
      post: (url, payload) => request("POST", url, payload),
      put: (url, payload) => request("PUT", url, payload),
    },
    window: {
      API: {
        POST_ADD_COMPANY: () => "/isolated-api/company",
        PUT_EDIT_COMPANY: (id) => `/isolated-api/company/${id}`,
      },
    },
  });
  const component = exports.default;
  const form = {
    ...component.data(), ...component.setup?.(), modern, company, hasBack: true,
    $t: (key) => key,
    $emit: (...args) => events.push(args),
    $nextTick: (callback) => Promise.resolve().then(callback),
    $el: { querySelector: () => ({ focus: () => { focusCount++; } }) },
  };
  for (const [name, method] of Object.entries(component.methods)) form[name] = method.bind(form);
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(form, name, { get: () => getter.call(form) });
  }
  component.created.call(form);
  return { component, form, requests, alerts, events, focusCount: () => focusCount };
}

test("company form template and scoped styles compile", async () => {
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "company-add-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  for (const block of descriptor.styles) {
    const style = await compileStyleAsync({
      source: block.content, filename: file.pathname, id: "company-add-test",
      scoped: block.scoped, preprocessLang: block.lang,
    });
    assert.deepEqual(style.errors, []);
  }
});

test("creation defaults and existing-company assignment retain legacy state", () => {
  const { component, form } = environment();
  assert.equal(component.props.modern.default, false);
  assert.equal(form.country, "US");
  assert.equal(form.lock, false);
  assert.equal(form.verify_check, true);
  for (const key of Object.keys(draft)) assert.ok(key in form, key);
  const company = { id: 41, ...draft, country: "DK", logo: "fixture-logo.png", golden: true };
  const edit = environment({ modern: false, company }).form;
  for (const key of Object.keys(draft)) assert.equal(edit[key], company[key]);
  assert.equal(edit.company, company);
  assert.equal(edit.lock, true);
  assert.equal(edit.verify_check, true);
  assert.equal(edit.isEuropean, true);
});

test("modern submission validates then posts exactly the eight company fields", async () => {
  const { form, requests, alerts, events } = environment();
  Object.assign(form, draft, { unrelated: "must not be sent" });
  const pending = form.submitCompany(Promise.resolve({ valid: true }));
  await setImmediate();
  assert.equal(requests.length, 1);
  assert.equal(form.busy, true);
  assert.equal(requests[0].method, "POST");
  assert.equal(requests[0].url, "/isolated-api/company");
  assert.deepEqual(plain(requests[0].payload), draft);
  const company = { id: 42, ...draft, verified: false, register: false };
  requests[0].resolve({ company });
  await pending;
  await setImmediate();
  assert.equal(form.busy, false);
  assert.equal(events[0][0], "add");
  assert.equal(events[0][1], company);
  assert.equal(alerts[0].type, "success");
});

test("invalid modern form, unchecked verification, busy and locked states cannot post", async () => {
  const invalid = environment();
  Object.assign(invalid.form, draft);
  await invalid.form.submitCompany(Promise.resolve({ valid: false }));
  assert.equal(invalid.requests.length, 0);
  assert.equal(invalid.form.busy, false);
  assert.equal(invalid.form.formError, true);
  assert.equal(invalid.focusCount(), 1);
  for (const state of [{ verify_check: false }, { busy: true }, { lock: true }]) {
    const guarded = environment();
    Object.assign(guarded.form, draft, state);
    await guarded.form.submitCompany(Promise.resolve({ valid: true }));
    assert.equal(guarded.requests.length, 0);
  }
});

test("submission rechecks verification and availability after native async validation", async () => {
  for (const state of [{ verify_check: false }, { busy: true }, { lock: true }, { modern: false }]) {
    const { form, requests } = environment();
    Object.assign(form, draft);
    let finishValidation;
    const validation = new Promise((resolve) => { finishValidation = resolve; });
    const pending = form.submitCompany(validation);
    Object.assign(form, state);
    finishValidation({ valid: true });
    await pending;
    assert.equal(requests.length, 0);
  }
});

test("direct modern create calls also respect verification, busy and lock guards", () => {
  for (const state of [{ verify_check: false }, { busy: true }, { lock: true }]) {
    const { form, requests } = environment();
    Object.assign(form, draft, state);
    form.addCompany();
    assert.equal(requests.length, 0);
  }
});

test("legacy creation preserves its existing payload and add event", async () => {
  const { form, requests, events } = environment({ modern: false });
  Object.assign(form, draft);
  const pending = form.addCompany();
  assert.equal(requests.length, 1);
  assert.deepEqual(plain(requests[0].payload), draft);
  const company = { id: 43, ...draft };
  requests[0].resolve({ company });
  await pending;
  await setImmediate();
  assert.equal(events[0][0], "add");
  assert.equal(events[0][1], company);
  assert.equal(form.busy, false);
});

test("editing uses PUT and updates the existing company identity before emitting edit", async () => {
  const company = { id: 44, ...draft, logo: "fixture-logo.png", golden: true };
  const { form, requests, alerts, events } = environment({ modern: false, company });
  form.lock = false;
  form.name = "Updated fixture";
  const pending = form.editCompany();
  assert.equal(requests[0].method, "PUT");
  assert.equal(requests[0].url, "/isolated-api/company/44");
  assert.deepEqual(plain(requests[0].payload), { ...draft, name: "Updated fixture" });
  const updated = { id: 44, ...draft, name: "Updated fixture", register: false };
  requests[0].resolve({ success: true, company: updated });
  await pending;
  await setImmediate();
  assert.equal(form.company, company);
  assert.equal(company.name, updated.name);
  assert.equal(company.logo, "fixture-logo.png");
  assert.equal(company.golden, true);
  assert.equal(company.register, false);
  assert.equal(events[0][0], "edit");
  assert.equal(events[0][1], updated);
  assert.equal(alerts[0].type, "success");
  assert.equal(form.busy, false);
});

for (const kind of ["business", "transport"]) {
  test(`${kind} failure preserves the draft and permits a successful retry`, async () => {
    const { form, requests, alerts, events } = environment();
    Object.assign(form, draft);
    const pending = form.submitCompany(Promise.resolve({ valid: true }));
    await setImmediate();
    const failure = new Error("Fixture network failure");
    if (kind === "business") requests[0].resolve({ error: true, error_msg: "Fixture business error" });
    else requests[0].reject(failure);
    await pending;
    await setImmediate();
    assert.equal(form.busy, false);
    assert.equal(form.requestError, true);
    assert.equal(alerts[0].type, kind);
    if (kind === "transport") assert.equal(alerts[0].args[0], failure);
    assert.equal(events.length, 0);
    for (const key of Object.keys(draft)) assert.equal(form[key], draft[key]);
    const retry = form.submitCompany(Promise.resolve({ valid: true }));
    await setImmediate();
    assert.equal(requests.length, 2);
    assert.deepEqual(plain(requests[1].payload), draft);
    const company = { id: 45, ...draft };
    requests[1].resolve({ company });
    await retry;
    await setImmediate();
    assert.equal(form.busy, false);
    assert.equal(form.requestError, false);
    assert.equal(events[0][0], "add");
    assert.equal(events[0][1], company);
  });
}

test("cancel emits back without submitting or clearing the draft", () => {
  const { form, requests, events } = environment();
  Object.assign(form, draft);
  form.back();
  assert.deepEqual(events, [["back"]]);
  assert.equal(requests.length, 0);
  for (const key of Object.keys(draft)) assert.equal(form[key], draft[key]);
});
