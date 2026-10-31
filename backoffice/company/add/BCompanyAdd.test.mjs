import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";

// Use the application's compiler dependencies, not the package's nested copies.
const require = createRequire(
  new URL("../../../../../package.json", import.meta.url),
);
const {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} = require("@vue/compiler-sfc");
const ts = require("typescript");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { JSDOM } = require("jsdom");
const file = new URL("./BCompanyAdd.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), {
  filename: file.pathname,
});
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "company-add-test" });
const code = ts.transpileModule(script.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const countryExports = {};
vm.runInNewContext(
  ts.transpileModule(
    readFileSync(
      new URL(
        "../../../../core-js/models/general/country/country.model.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText,
  { exports: countryExports },
);
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
  const requests = [],
    alerts = [],
    events = [];
  let focusCount = 0;
  const exports = {};
  const notifications = {
    showSuccessAlert: (...args) => alerts.push({ type: "success", args }),
    showErrorAlert: (...args) => alerts.push({ type: "business", args }),
    showLaravelError: (...args) => alerts.push({ type: "transport", args }),
  };
  const request = (method, url, payload) =>
    new Promise((resolve, reject) => {
      requests.push({
        method,
        url,
        payload,
        resolve: (data) => resolve({ data }),
        reject,
      });
    });
  vm.runInNewContext(code, {
    exports,
    require: (path) => {
      if (path === "vue") return { useId: () => "company-add-fixture" };
      if (path.includes("NotificationService"))
        return { default: notifications };
      if (path.endsWith("/SetupService"))
        return { SetupService: { DefaultCountry: () => "US" } };
      if (path.endsWith("/country.model"))
        return { Country: countryExports.Country };
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
    ...component.data(),
    ...component.setup?.(),
    modern,
    company,
    hasBack: true,
    $t: (key) => key,
    $emit: (...args) => events.push(args),
    $nextTick: (callback) => Promise.resolve().then(callback),
    $el: {
      querySelector: () => ({
        focus: () => {
          focusCount++;
        },
      }),
    },
    $refs: {},
  };
  for (const [name, method] of Object.entries(component.methods))
    form[name] = method.bind(form);
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(form, name, { get: () => getter.call(form) });
  }
  component.created.call(form);
  return {
    component,
    form,
    requests,
    alerts,
    events,
    focusCount: () => focusCount,
  };
}

const catalogs = new Map();
function translator(locale) {
  if (!catalogs.has(locale)) {
    const roots = {};
    for (const namespace of ["dashboard", "global"]) {
      const path = new URL(
        `../../../../translate/${namespace}/${locale}.ts`,
        import.meta.url,
      );
      const ast = ts.createSourceFile(
        path.pathname,
        readFileSync(path, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      roots[namespace] = ast.statements.find(ts.isExportAssignment).expression;
    }
    catalogs.set(locale, roots);
  }
  return (key, values = {}) => {
    const parts = key.split(".");
    let node =
      catalogs.get(locale)[parts[0] === "global" ? "global" : "dashboard"];
    for (const part of parts[0] === "global" ? parts.slice(1) : parts) {
      node = node?.properties?.find(
        (property) => property.name?.text === part,
      )?.initializer;
    }
    assert.ok(
      node && ts.isStringLiteralLike(node),
      `Missing ${locale} translation: ${key}`,
    );
    return node.text.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
  };
}

async function renderCompany(
  locale,
  { modern = true, company, state = {} } = {},
) {
  const component = environment({ modern, company }).component;
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "company-render-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(template.code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require: (path) =>
        path === "vue" ? Vue : { default: "/isolated/europe.svg" },
    },
  );
  component.render = exports.render;
  const created = component.created;
  component.created = function () {
    created.call(this);
    Object.assign(this, state);
  };
  const records = [];
  const field = (kind) => ({
    props: {
      modelValue: {},
      label: {},
      messages: {},
      rules: Array,
      readonly: Boolean,
      disabled: Boolean,
      required: Boolean,
      itemValue: {},
      variant: {},
    },
    setup(props, { attrs, slots }) {
      records.push({ kind, props: { ...props, ...attrs } });
      return () =>
        Vue.h("label", { "data-field": kind }, [
          Vue.h("span", props.label),
          Vue.h("input", {
            value: props.modelValue,
            readonly: props.readonly,
            disabled: props.disabled,
            "aria-required": props.required || !!props.rules?.length,
          }),
          Vue.h("small", props.messages),
          slots["append-inner"]?.(),
        ]);
    },
  });
  const uploader = {
    props: {
      image: {},
      server: {},
      maxFileSize: {},
      autoCompact: Boolean,
      modern: Boolean,
      label: {},
      editLabel: {},
      hint: {},
      clearable: Boolean,
      disabled: Boolean,
      deferUpload: Boolean,
    },
    setup(props, { attrs }) {
      records.push({ kind: "logo", props: { ...props, ...attrs } });
      return () =>
        Vue.h("div", { "data-logo": "" }, [
          Vue.h("img", { src: props.image, alt: props.label }),
          props.label,
          props.hint,
          props.editLabel,
        ]);
    },
  };
  component.components = {
    SCountrySelect: field("country"),
    SImageUploader: uploader,
    USmartVerify: {
      props: ["modelValue", "trueTitle", "trueDescription", "disabled"],
      setup(props, { attrs }) {
        records.push({ kind: "verify", props: { ...props, ...attrs } });
        return () =>
          Vue.h("div", attrs, [props.trueTitle, props.trueDescription]);
      },
    },
  };
  const tag = (name) => ({
    setup(_, { attrs, slots }) {
      return () =>
        Vue.h(name, attrs, [
          slots.activator?.({ props: {} }),
          slots.default?.(),
        ]);
    },
  });
  const app = Vue.createSSRApp(component, { modern, company, hasBack: false });
  app.config.globalProperties.$t = translator(locale);
  app.config.globalProperties.GlobalRules = {
    required: () => (value) => !!value || "required",
  };
  app.config.globalProperties.getShopImagePath = (path) =>
    `/isolated-images/${path}`;
  app.config.globalProperties.window = {
    API: {
      POST_UPLOAD_COMPANY_IMAGE: (id, type) =>
        `/isolated-api/company/${id}/${type}`,
    },
  };
  app.config.warnHandler = (message) => {
    if (!message.includes("Non-function value encountered"))
      throw new Error(message);
  };
  app.component("VTextField", field("text"));
  for (const name of [
    "VCard",
    "VCardTitle",
    "VCardText",
    "VCardActions",
    "VIcon",
    "VTooltip",
    "VListSubheader",
    "UWidgetHeader",
  ])
    app.component(name, tag("div"));
  app.component("VForm", tag("form"));
  app.component("VBtn", tag("button"));
  app.component("flag", {
    props: ["iso"],
    setup(props) {
      return () => Vue.h("span", { "data-flag": props.iso });
    },
  });
  const html = await renderToString(app);
  return {
    document: new JSDOM(html).window.document,
    records,
    t: translator(locale),
  };
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
      source: block.content,
      filename: file.pathname,
      id: "company-add-test",
      scoped: block.scoped,
      preprocessLang: block.lang,
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
  const company = {
    id: 41,
    ...draft,
    country: "DK",
    logo: "fixture-logo.png",
    golden: true,
  };
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
  for (const state of [
    { verify_check: false },
    { busy: true },
    { lock: true },
  ]) {
    const guarded = environment();
    Object.assign(guarded.form, draft, state);
    await guarded.form.submitCompany(Promise.resolve({ valid: true }));
    assert.equal(guarded.requests.length, 0);
  }
});

test("submission rechecks verification and availability after native async validation", async () => {
  for (const state of [
    { verify_check: false },
    { busy: true },
    { lock: true },
    { modern: false },
  ]) {
    const { form, requests } = environment();
    Object.assign(form, draft);
    let finishValidation;
    const validation = new Promise((resolve) => {
      finishValidation = resolve;
    });
    const pending = form.submitCompany(validation);
    Object.assign(form, state);
    finishValidation({ valid: true });
    await pending;
    assert.equal(requests.length, 0);
  }
});

test("direct modern create calls also respect verification, busy and lock guards", () => {
  for (const state of [
    { verify_check: false },
    { busy: true },
    { lock: true },
  ]) {
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
  const { form, requests, alerts, events } = environment({
    modern: false,
    company,
  });
  form.lock = false;
  form.name = "Updated fixture";
  const pending = form.editCompany();
  assert.equal(requests[0].method, "PUT");
  assert.equal(requests[0].url, "/isolated-api/company/44");
  assert.deepEqual(plain(requests[0].payload), {
    ...draft,
    name: "Updated fixture",
  });
  const updated = {
    id: 44,
    ...draft,
    name: "Updated fixture",
    register: false,
  };
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
    if (kind === "business")
      requests[0].resolve({ error: true, error_msg: "Fixture business error" });
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

test("modern editing starts locked and requires validation, accuracy and availability", async () => {
  const company = { id: 51, ...draft };
  const initial = environment({ company });
  assert.equal(initial.form.isModernEdit, true);
  assert.equal(initial.form.lock, true);
  assert.equal(initial.form.verify_check, true);
  await initial.form.submitCompany(Promise.resolve({ valid: true }));
  initial.form.editCompany();
  assert.equal(initial.requests.length, 0);
  initial.form.toggleEditLock();
  assert.equal(initial.form.lock, false);
  await initial.form.submitCompany(Promise.resolve({ valid: false }));
  assert.equal(initial.requests.length, 0);
  assert.equal(initial.form.formError, true);
  assert.equal(initial.focusCount(), 1);
  for (const state of [
    { verify_check: false },
    { busy: true },
    { lock: true },
  ]) {
    const guarded = environment({ company: { ...company } });
    Object.assign(guarded.form, { lock: false, ...state });
    await guarded.form.submitCompany(Promise.resolve({ valid: true }));
    guarded.form.editCompany();
    assert.equal(guarded.requests.length, 0);
  }
});

test("modern editing sends exactly eight raw fields and merges only the server response", async () => {
  const company = {
    id: 52,
    ...draft,
    logo: "fixture-logo.png",
    register: true,
    golden: true,
  };
  const { form, requests, alerts, events } = environment({ company });
  form.toggleEditLock();
  Object.assign(form, {
    name: " Updated fixture ",
    website: "not-a-url",
    email: "not-an-email",
    mobile: "not-a-number",
    unrelated: "excluded",
  });
  const pending = form.submitCompany(Promise.resolve({ valid: true }));
  await setImmediate();
  await form.submitCompany(Promise.resolve({ valid: true }));
  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "PUT");
  assert.equal(requests[0].url, "/isolated-api/company/52");
  assert.deepEqual(plain(requests[0].payload), {
    ...draft,
    name: " Updated fixture ",
    website: "not-a-url",
    email: "not-an-email",
    mobile: "not-a-number",
  });
  assert.equal(company.register, true);
  const updated = { id: 52, ...requests[0].payload, register: false };
  requests[0].resolve({ company: updated });
  await pending;
  assert.equal(form.company, company);
  assert.equal(company.name, updated.name);
  assert.equal(company.logo, "fixture-logo.png");
  assert.equal(company.golden, true);
  assert.equal(company.register, false);
  assert.deepEqual(events, [["edit", updated]]);
  assert.equal(alerts.at(-1).type, "success");
  assert.equal(form.busy, false);
});

for (const kind of ["business", "validation"]) {
  test(`modern edit ${kind} failure preserves all entered values for retry`, async () => {
    const company = { id: 53, ...draft, register: true };
    const { form, requests, alerts, events } = environment({ company });
    form.toggleEditLock();
    form.name = "Retry fixture";
    form.tax = " DK123 ";
    const expected = { ...draft, name: form.name, tax: form.tax };
    const pending = form.submitCompany(Promise.resolve({ valid: true }));
    await setImmediate();
    const failure = {
      response: {
        status: 422,
        data: { errors: { tax: ["isolated validation failure"] } },
      },
    };
    if (kind === "business")
      requests[0].resolve({ error: true, error_msg: "isolated refusal" });
    else requests[0].reject(failure);
    await pending;
    for (const key of Object.keys(expected))
      assert.equal(form[key], expected[key]);
    assert.equal(form.requestError, true);
    assert.equal(form.busy, false);
    assert.equal(company.name, draft.name);
    assert.equal(company.register, true);
    assert.equal(events.length, 0);
    assert.equal(
      alerts.at(-1).type,
      kind === "business" ? "business" : "transport",
    );
    if (kind === "validation") assert.equal(alerts.at(-1).args[0], failure);
    const retry = form.submitCompany(Promise.resolve({ valid: true }));
    await setImmediate();
    assert.deepEqual(plain(requests[1].payload), expected);
    requests[1].resolve({ company: { id: 53, ...expected } });
    await retry;
    assert.equal(form.requestError, false);
    assert.equal(events.at(-1)[0], "edit");
  });
}

test("modern edit rechecks lock, verification, busy and company after validation", async () => {
  for (const state of [
    { verify_check: false },
    { busy: true },
    { lock: true },
  ]) {
    const { form, requests } = environment({ company: { id: 54, ...draft } });
    form.toggleEditLock();
    let finish;
    const pending = form.submitCompany(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    Object.assign(form, state);
    finish({ valid: true });
    await pending;
    assert.equal(requests.length, 0);
  }
  const { form, component, requests } = environment({
    company: { id: 54, ...draft },
  });
  form.toggleEditLock();
  let finish;
  const pending = form.submitCompany(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  form.company = { id: 55, ...draft, name: "Next company" };
  component.watch.company.call(form);
  form.toggleEditLock();
  finish({ valid: true });
  await pending;
  assert.equal(requests.length, 0);
  assert.equal(form.name, "Next company");
});

test("late edit replies cannot change another company or emit after unmount", async () => {
  for (const invalidation of ["company", "unmount"]) {
    for (const failure of [false, true]) {
      const company = { id: 56, ...draft };
      const { form, component, requests, alerts, events } = environment({
        company,
      });
      form.toggleEditLock();
      const pending = form.editCompany();
      if (invalidation === "company") {
        form.company = { id: 57, ...draft, name: "Current company" };
        component.watch.company.call(form);
      } else component.beforeUnmount.call(form);
      if (failure) requests[0].reject(new Error("isolated stale failure"));
      else
        requests[0].resolve({
          company: { id: 56, ...draft, name: "Stale company" },
        });
      await pending;
      assert.equal(company.name, draft.name);
      assert.equal(
        form.company.name,
        invalidation === "company" ? "Current company" : draft.name,
      );
      assert.equal(events.length, 0);
      assert.equal(alerts.length, 0);
    }
  }
});

test("editing lock and accuracy controls cannot alter state while saving", () => {
  const { form } = environment({ company: { id: 58, ...draft } });
  form.updateVerification(false);
  assert.equal(form.verify_check, true);
  form.toggleEditLock();
  form.updateVerification(false);
  assert.equal(form.verify_check, false);
  form.updateVerification(true);
  form.busy = true;
  form.toggleEditLock();
  form.updateVerification(false);
  assert.equal(form.lock, false);
  assert.equal(form.verify_check, true);
});

test("logo completion is independent of editing lock and never updates another company", () => {
  const company = { id: 59, ...draft, logo: "old-logo.png" };
  const { form, requests } = environment({ company });
  assert.equal(form.lock, true);
  form.setCompanyLogo("uploaded-logo.png", company.id);
  assert.equal(company.logo, "uploaded-logo.png");
  form.setCompanyLogo("wrong-company.png", 60);
  assert.equal(company.logo, "uploaded-logo.png");
  assert.equal(requests.length, 0);
  assert.equal(form.lock, true);
});

test("tax identity uses the native country model rather than a replacement country list", () => {
  const { form } = environment({ company: { id: 60, ...draft } });
  for (const country of ["DK", "DO", "IS", "US", "JP", null]) {
    form.country = country;
    assert.equal(
      form.isEuropean,
      country && countryExports.Country.EuropeCountriesAlpha2.includes(country),
    );
  }
});

test("modern edit renders every native field, localized guidance and independent immediate logo uploader", async () => {
  for (const locale of ["en", "fa"]) {
    const company = {
      id: 61,
      ...draft,
      country: "DK",
      logo: "fixture-logo.png",
    };
    const { document, records, t } = await renderCompany(locale, { company });
    assert.equal(
      document.querySelector("h1").textContent,
      t("add_company.modern.edit_title"),
    );
    for (const name of [
      "business_title",
      "billing_title",
      "contact_title",
      "edit_documents_help",
    ])
      assert.ok(
        document.body.textContent.includes(t(`add_company.modern.${name}`)),
        name,
      );
    assert.ok(
      document.body.textContent.includes(
        t("add_company.modern.edit_locked_help"),
      ),
    );
    assert.ok(
      document.querySelector(
        `[aria-label="${t("add_company.modern.edit_unlock")}"]`,
      ),
    );
    const fields = records.filter((record) => record.kind === "text");
    assert.equal(fields.length, 7);
    assert.deepEqual(
      fields.map((record) => record.props.modelValue).sort(),
      Object.entries(draft)
        .filter(([name]) => name !== "country")
        .map(([, value]) => value)
        .sort(),
    );
    for (const { props } of fields) {
      assert.ok(props.label.endsWith(" *"), props.label);
      assert.equal(props.rules.length, 1);
      assert.equal(props.rules[0](""), "required");
      assert.equal(props.rules[0]("non-empty raw value"), true);
    }
    const fieldByLabel = (key) =>
      fields.find((record) => record.props.label === t(key) + " *").props;
    assert.equal(
      fieldByLabel("add_company.modern.name_label").messages,
      t("add_company.modern.review_warning"),
    );
    assert.equal(
      fieldByLabel("add_company.modern.address_label").messages,
      t("add_company.modern.review_warning"),
    );
    assert.notEqual(
      fieldByLabel("add_company.modern.tax_label").messages,
      t("add_company.modern.review_warning"),
    );
    const country = records.find((record) => record.kind === "country").props;
    assert.equal(country.modelValue, "DK");
    assert.equal(country.itemValue, "alpha2");
    assert.equal(country.required, true);
    assert.equal(country.readonly, true);
    assert.ok(document.querySelector('[data-flag="DK"]'));
    const logo = records.find((record) => record.kind === "logo").props;
    assert.equal(logo.image, "/isolated-images/fixture-logo.png");
    assert.equal(logo.server, "/isolated-api/company/61/logo");
    assert.equal(logo.maxFileSize, "512KB");
    assert.equal(logo.autoCompact, true);
    assert.equal(logo.modern, true);
    assert.equal(logo.disabled, false);
    assert.equal(logo.clearable, false);
    assert.equal(logo.deferUpload, false);
    assert.equal(logo.label, t("add_company.modern.logo_label"));
    assert.ok(
      document.body.textContent.includes(
        t("add_company.modern.logo_upload_help"),
      ),
    );
    assert.equal(typeof logo.onNewPath, "function");
    const verify = records.find((record) => record.kind === "verify").props;
    assert.equal(verify.modelValue, true);
    assert.equal(verify.disabled, true);
    assert.equal(
      document.querySelector('button[type="submit"]').disabled,
      true,
    );
    const unlocked = await renderCompany(locale, {
      company: { ...company },
      state: { lock: false },
    });
    assert.equal(
      unlocked.document.querySelector('button[type="submit"]').disabled,
      false,
    );
    assert.equal(
      unlocked.records.find((record) => record.kind === "country").props
        .readonly,
      false,
    );
    assert.equal(
      unlocked.records.find((record) => record.kind === "verify").props
        .disabled,
      false,
    );
    const failed = await renderCompany(locale, {
      company: { ...company },
      state: { lock: false, requestError: true },
    });
    assert.ok(
      failed.document.body.textContent.includes(
        t("add_company.modern.edit_load_error"),
      ),
    );
    assert.ok(
      !failed.document.body.textContent.includes(
        t("add_company.modern.load_error"),
      ),
    );
  }
});

test("new-company rendering retains its existing creation copy, native fields and absence of logo upload", async () => {
  for (const locale of ["en", "fa"]) {
    const { document, records, t } = await renderCompany(locale);
    assert.equal(
      document.querySelector("h1").textContent,
      t("add_company.modern.title"),
    );
    assert.equal(records.filter((record) => record.kind === "text").length, 7);
    assert.equal(
      records.filter((record) => record.kind === "country").length,
      1,
    );
    assert.equal(records.filter((record) => record.kind === "logo").length, 0);
    assert.ok(
      document.body.textContent.includes(
        t("add_company.modern.documents_help"),
      ),
    );
    assert.ok(
      !document.body.textContent.includes(
        t("add_company.modern.edit_locked_help"),
      ),
    );
  }
});
