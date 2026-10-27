import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import ts from "typescript";

// Real SFC, validators, SDK URLs and data reset; isolated controls/HTTP only.
const file = new URL("./SInviteFriends.vue", import.meta.url);
const outerFile = new URL(
  "../../dashboard/shop/invite/BDashboardShopInvite.vue",
  import.meta.url,
);
const plain = (value) => JSON.parse(JSON.stringify(value));
function evaluate(source, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, ...globals },
  );
  return exports;
}
async function compile(file) {
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), {
    filename: file.pathname,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "invite-friends-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "invite-friends-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: file.pathname,
      id: "invite-friends-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
  return { descriptor, template };
}
const compiled = await compile(file),
  outerCompiled = await compile(outerFile);
const GlobalRules = evaluate(
  readFileSync(
    new URL("../../../../core-js/helper/rules/GlobalRules.ts", file),
    "utf8",
  ),
).default;
const core = evaluate(
  readFileSync(new URL("../../../mixin/CoreMixin.ts", file), "utf8"),
  { require: () => ({}) },
).default;
const sdk = evaluate(
  readFileSync(new URL("../../../../sdk-backoffice/apis/API.ts", file), "utf8"),
  {
    require: (name) =>
      name.endsWith("/SetupService")
        ? {
            SetupService: {
              GetMetaValue: (key) =>
                key === "selldone-api" ? "/native-api" : "/native-dapi",
            },
          }
        : {},
  },
);
const api = new sdk.API();
const languages = Object.fromEntries(
  ["en", "fa"].map((locale) => {
    const dashboard = evaluate(
      readFileSync(
        new URL(`../../../../translate/dashboard/${locale}.ts`, file),
        "utf8",
      ),
    ).default;
    const global = evaluate(
      readFileSync(
        new URL(`../../../../translate/global/${locale}.ts`, file),
        "utf8",
      ),
      {
        require: () => ({ default: {} }),
      },
    ).default;
    return [locale, { ...dashboard, global }];
  }),
);
function translator(locale) {
  return (key, values = {}) => {
    const value = key
      .split(".")
      .reduce((node, part) => node?.[part], languages[locale]);
    return typeof value === "string"
      ? value.replace(/\{(\w+)\}/g, (_, name) => values[name])
      : key;
  };
}

async function fixture({
  modern = true,
  embedded = true,
  locale = "en",
  initial = {},
  referral = true,
  outer = false,
} = {}) {
  const requests = [],
    alerts = [],
    events = [],
    buttons = [],
    fields = [],
    forms = [],
    sheets = [],
    shares = [],
    copies = [],
    storage = new Map();
  let context, outerContext;
  const user = {
    id: 7,
    name: "Example Sender",
    referral: referral
      ? {
          code: "example-referral",
          registered: 4,
          accepted: 2,
          updated_at: "2026-10-27T08:00:00Z",
        }
      : null,
  };
  const request = (method, url, body, config) =>
    new Promise((resolve, reject) =>
      requests.push({
        method,
        url,
        body,
        config,
        signal: config?.signal,
        resolve: (data) => resolve({ data }),
        reject,
      }),
    );
  const axios = {
    get: (url, config) => request("get", url, undefined, config),
    post: (url, body) => request("post", url, body),
  };
  const Sheet = Vue.defineComponent({
    props: ["modelValue"],
    inheritAttrs: false,
    setup:
      (props, { slots }) =>
      () => {
        sheets.push(props.modelValue);
        return Vue.h(
          "div",
          { "data-native-sheet": props.modelValue ? "open" : "closed" },
          props.modelValue ? slots.default?.() : undefined,
        );
      },
  });
  const Share = Vue.defineComponent({
    inheritAttrs: false,
    setup:
      (_, { attrs }) =>
      () => {
        shares.push(attrs);
        return Vue.h("div", { "data-share-url": attrs.url });
      },
  });
  const globals = {
    axios,
    AbortController,
    window: {
      API: api,
      URLS: { MainServiceUrl: () => "https://business.example.test" },
    },
    localStorage: { setItem: (key, value) => storage.set(key, value) },
  };
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name === "vuetify/components") return { VBottomSheet: Sheet };
    if (name.endsWith("/GlobalRules")) return { default: GlobalRules };
    if (name === "lodash-es") return { throttle: (method) => method };
    if (name.endsWith("DateMixin.ts")) return { default: {} };
    if (name.endsWith("NotificationService.ts"))
      return {
        default: {
          showSuccessAlert: (...args) => alerts.push({ kind: "success", args }),
          showErrorAlert: (...args) => alerts.push({ kind: "error", args }),
          showLaravelError: (...args) => alerts.push({ kind: "laravel", args }),
        },
      };
    if (name.endsWith("UButtonShareGroup.vue")) return { default: Share };
    if (/\.(webp|svg|png)$/.test(name)) return name;
    if (name.endsWith("SInviteFriends.vue")) return { default: Subject };
    assert.fail("Unexpected dependency: " + name);
  };
  globals.require = require;
  const component = evaluate(
    compiled.descriptor.script.content,
    globals,
  ).default;
  const render = evaluate(compiled.template.code, globals).render;
  const Subject = {
    ...component,
    data: () => ({ ...component.data(), ...initial }),
    render(...args) {
      context = this;
      return render.apply(this, args);
    },
  };
  let root = Subject,
    props = { modern, embedded, onClose: () => events.push("close") };
  if (outer) {
    const parent = evaluate(
      outerCompiled.descriptor.script.content,
      globals,
    ).default;
    const parentRender = evaluate(outerCompiled.template.code, globals).render;
    root = {
      ...parent,
      render(...args) {
        outerContext = this;
        return parentRender.apply(this, args);
      },
    };
    props = { modern, shop: { id: 7 }, onClose: () => events.push("close") };
  }
  const app = Vue.createSSRApp(root, props);
  Object.assign(app.config.globalProperties, {
    $t: translator(locale),
    $vuetify: { display: { smAndDown: false } },
    $route: { params: { shop_id: "7" } },
    USER: () => user,
    USER_ID: () => user.id,
    GlobalRules,
    getUserAvatar: (id) => `native-avatar/${id}`,
    getFromNowString: () => "recently",
    getLocalTimeString: () => "2026-10-27 08:00",
    resetToDefault: core.methods.resetToDefault,
    copyToClipboard: (value) => copies.push(value),
  });
  const wrapper = (tag = "div") =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { slots, attrs }) =>
        () =>
          Vue.h(tag, attrs, slots.default?.()),
    });
  for (const name of [
    "v-card",
    "v-card-title",
    "v-card-text",
    "v-card-actions",
    "v-container",
    "v-row",
    "v-col",
    "v-avatar",
    "v-img",
    "v-spacer",
    "v-expansion-panels",
    "v-expansion-panel",
    "v-expansion-panel-title",
    "v-expansion-panel-text",
  ])
    app.component(name, wrapper());
  app.component("v-icon", wrapper("span"));
  app.component(
    "v-form",
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          forms.push(attrs);
          return Vue.h("form", {}, slots.default?.());
        },
    }),
  );
  app.component(
    "v-btn",
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          buttons.push(attrs);
          return Vue.h(
            "button",
            {
              class: attrs.class,
              type: attrs.type || "button",
              disabled: attrs.disabled,
              "aria-label": attrs["aria-label"],
              "data-route": attrs.to?.name,
            },
            slots.default?.(),
          );
        },
    }),
  );
  app.component(
    "v-text-field",
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          fields.push(attrs);
          return Vue.h("label", {}, [
            attrs.label || attrs.placeholder,
            Vue.h("input", {
              type: attrs.type || "text",
              value: attrs.modelValue ?? "",
              readonly: attrs.readonly,
            }),
            slots["append-inner"]?.(),
          ]);
        },
    }),
  );
  app.directive("tooltip", { getSSRProps: () => ({}) });
  app.directive("scroll", { getSSRProps: () => ({}) });
  const html = await renderToString(app);
  return {
    html,
    context,
    outerContext,
    component,
    requests,
    alerts,
    events,
    buttons,
    fields,
    forms,
    sheets,
    shares,
    copies,
    storage,
    user,
  };
}

test("embedded EN/FA form renders immediately with native fields, submit, share and report", async () => {
  for (const locale of ["en", "fa"]) {
    const e = await fixture({ locale });
    assert.equal(e.component.props.embedded.default, false);
    assert.equal(e.component.props.modern.default, false);
    assert.equal(e.context.dialog, false);
    assert.equal(e.sheets.length, 0);
    assert.ok(e.html.includes(translator(locale)("invite_friends.form_title")));
    assert.equal(
      e.fields.find((field) => field.type === "email").label,
      translator(locale)("invite_friends.email_label"),
    );
    assert.equal(
      e.fields.find(
        (field) =>
          field.placeholder ===
          translator(locale)("global.placeholders.friend_name"),
      ).label,
      translator(locale)("invite_friends.name_label"),
    );
    assert.ok(
      e.html.includes(translator(locale)("invite_friends.delivery_note")),
    );
    assert.equal(e.fields.filter((field) => field.type === "email").length, 1);
    assert.equal(e.forms.length, 1);
    assert.equal(
      e.buttons.filter((button) => button.type === "submit").length,
      1,
    );
    assert.equal(
      e.buttons.find((button) => button.type === "submit").disabled,
      true,
    );
    assert.equal(
      e.buttons.some((button) => button.target === "_blank"),
      false,
    );
    assert.equal(
      e.buttons.filter((button) => button.to?.name === "OPageMonetizeReferral")
        .length,
      1,
    );
    assert.equal(
      e.shares[0].url,
      "https://business.example.test?ref=example-referral",
    );
    assert.ok(e.html.includes("4"));
    assert.ok(e.html.includes("2"));
    e.buttons
      .find(
        (button) =>
          button["aria-label"] === translator(locale)("global.actions.close"),
      )
      .onClick();
    assert.deepEqual(e.events, ["close"]);
    assert.equal(e.requests.length, 0);
  }
  const disabled = await fixture({ referral: false });
  assert.equal(disabled.fields.length, 0);
  assert.equal(disabled.buttons.length, 0);
});

test("legacy opt-out retains its activator and closed native sheet; opening exposes the existing form", async () => {
  const closed = await fixture({ modern: false, embedded: false });
  assert.deepEqual(closed.sheets, [false]);
  assert.equal(closed.fields.length, 0);
  assert.equal(closed.buttons.length, 1);
  closed.buttons[0].onClick();
  assert.equal(closed.context.dialog, true);
  const opened = await fixture({
    modern: false,
    embedded: false,
    initial: { dialog: true },
  });
  assert.deepEqual(opened.sheets, [true]);
  assert.equal(
    opened.fields.filter((field) => field.type === "email").length,
    1,
  );
  assert.ok(opened.html.includes("My Affiliate Panel"));
  assert.ok(opened.html.includes("Other Share Options"));
  assert.ok(opened.html.includes("My Invitation Report"));
  assert.equal(opened.requests.length, 0);
});

test("empty/invalid forms are blocked and a busy valid send cannot duplicate the exact native payload", async () => {
  const e = await fixture(),
    s = e.context;
  s.sendInvites();
  s.emails = ["", "invalid-email"];
  s.sendInvites();
  s.emails = ["", "one@example.test", "still-invalid"];
  s.sendInvites();
  assert.equal(e.requests.length, 0);
  s.emails = ["", "one@example.test", "two@example.test"];
  s.names = ["", "Friend One", ""];
  s.count = 2;
  let prevented = false;
  e.forms[0].onSubmit({
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(s.busy, true);
  s.sendInvites();
  s.addNew();
  assert.equal(s.count, 2);
  assert.equal(e.requests.length, 1);
  assert.equal(e.requests[0].method, "post");
  assert.equal(e.requests[0].url, "/native-api/invite/send");
  assert.deepEqual(plain(e.requests[0].body), {
    shop_id: "7",
    invites: [
      { name: "Friend One", email: "one@example.test" },
      { name: "", email: "two@example.test" },
    ],
  });
  e.requests[0].resolve({ error: false, count: 0 });
  await new Promise(setImmediate);
  assert.equal(s.busy, false);
});

test("zero/partial success preserves input; full success resets only data and retains embedded props", async () => {
  for (const count of [0, 1, 2]) {
    const e = await fixture(),
      s = e.context;
    s.emails = ["", "one@example.test", "two@example.test"];
    s.names = ["", "Friend One", "Friend Two"];
    s.valid_mails = ["one@example.test"];
    s.count = 2;
    s.dialog = true;
    const checking = s.checkEmailToInvite(2, s.emails[2]);
    const pending = s.sendInvites();
    e.requests
      .find((request) => request.method === "post")
      .resolve({ error: false, count });
    await pending;
    assert.equal(s.busy, false);
    assert.equal(s.modern, true);
    assert.equal(s.embedded, true);
    assert.equal(s.referral.code, "example-referral");
    const key =
      count === 0
        ? "none_submitted"
        : count === 1
          ? "partly_submitted"
          : "submitted";
    assert.equal(
      s.submission_message,
      translator("en")("invite_friends." + key, { count }),
    );
    assert.equal(
      e.alerts.filter((alert) => alert.kind === "success").length,
      count ? 1 : 0,
    );
    if (count === 2) {
      assert.deepEqual(plain(s.emails), [""]);
      assert.deepEqual(plain(s.names), [""]);
      assert.deepEqual(plain(s.valid_mails), []);
      assert.equal(s.count, 1);
      assert.equal(s.dialog, false);
    } else {
      assert.deepEqual(plain(s.emails), [
        "",
        "one@example.test",
        "two@example.test",
      ]);
      assert.deepEqual(plain(s.names), ["", "Friend One", "Friend Two"]);
      assert.equal(s.count, 2);
      assert.equal(s.dialog, true);
    }
    assert.equal(e.requests[0].signal.aborted, count === 2);
    e.requests[0].resolve({ error: false, email: "two@example.test" });
    await checking;
    if (count === 2) assert.deepEqual(plain(s.valid_mails), []);
  }
});

test("logical/send failures preserve values and expose native error handling", async () => {
  const e = await fixture(),
    s = e.context;
  s.emails = ["", "one@example.test"];
  s.names = ["", "Friend One"];
  let pending = s.sendInvites();
  e.requests[0].resolve({ error: true, error_msg: "Synthetic refusal" });
  await pending;
  assert.equal(e.alerts[0].kind, "error");
  assert.deepEqual(plain(e.alerts[0].args), [null, "Synthetic refusal"]);
  pending = s.sendInvites();
  const error = new Error("Synthetic network failure");
  e.requests[1].reject(error);
  await pending;
  assert.equal(e.alerts[1].kind, "laravel");
  assert.equal(e.alerts[1].args[0], error);
  assert.deepEqual(plain(s.emails), ["", "one@example.test"]);
  assert.equal(s.busy, false);
});

test("blur checks use native email validation and abort superseded or edited values", async () => {
  const e = await fixture(),
    s = e.context;
  s.checkEmailToInvite(1, "");
  s.checkEmailToInvite(1, "invalid-email");
  assert.equal(e.requests.length, 0);
  s.emails = ["", "one@example.test", "two@example.test"];
  const first = s.checkEmailToInvite(1, s.emails[1]);
  const second = s.checkEmailToInvite(2, s.emails[2]);
  assert.equal(e.requests[0].url, "/native-api/invite/check");
  assert.deepEqual(plain(e.requests[0].config.params), {
    email: "one@example.test",
  });
  assert.equal(e.requests[0].signal.aborted, true);
  assert.equal(s.busy_check, 2);
  e.requests[0].resolve({ error: false, email: "one@example.test" });
  await first;
  assert.equal(s.busy_check, 2);
  assert.deepEqual(plain(s.valid_mails), []);
  s.emails[2] = "edited@example.test";
  e.requests[1].resolve({ error: false, email: "two@example.test" });
  await second;
  assert.deepEqual(plain(s.valid_mails), []);
  assert.equal(s.busy_check, null);
  const fresh = s.checkEmailToInvite(2, s.emails[2]);
  e.requests[2].resolve({ error: false, email: "edited@example.test" });
  await fresh;
  assert.deepEqual(plain(s.valid_mails), ["edited@example.test"]);
  s.checkEmailToInvite(2, "edited@example.test");
  assert.equal(e.requests.length, 3);
  assert.equal(e.alerts.length, 0);
});

test("closing, reopening and unmount abort pending checks and ignore their late responses", async () => {
  for (const action of ["close", "showDialog", "beforeUnmount"]) {
    const e = await fixture(),
      s = e.context;
    s.emails = ["", "one@example.test"];
    s.names = ["", "Friend One"];
    const pending = s.checkEmailToInvite(1, s.emails[1]);
    if (action === "beforeUnmount") e.component.beforeUnmount.call(s);
    else s[action]();
    assert.equal(e.requests[0].signal.aborted, true);
    if (action === "beforeUnmount")
      e.requests[0].reject(new Error("Synthetic aborted request"));
    else e.requests[0].resolve({ error: false, email: "one@example.test" });
    await pending;
    assert.deepEqual(plain(s.valid_mails), []);
    assert.equal(e.alerts.length, 0);
    if (action === "close") assert.deepEqual(e.events, ["close"]);
    if (action === "showDialog") {
      assert.equal(s.dialog, true);
      assert.equal(s.count, 1);
      assert.deepEqual(plain(s.emails), [""]);
    }
  }
});

test("six-row cap is enforced by action and rendered Add more availability", async () => {
  const e = await fixture(),
    s = e.context;
  for (let i = 0; i < 9; i++) s.addNew();
  assert.equal(s.count, 6);
  const full = await fixture({
    initial: { count: 6, emails: [""], names: [""] },
  });
  assert.equal(full.fields.filter((field) => field.type === "email").length, 6);
  assert.ok(e.html.includes(translator("en")("global.actions.add_more")));
  assert.ok(!full.html.includes(translator("en")("global.actions.add_more")));
  assert.equal(
    full.buttons.some((button) => button.onClick === full.context.addNew),
    false,
  );
  assert.equal(full.requests.length, 0);
});

test("modern dashboard wrapper forwards embedded form and relays close with native monthly dismissal", async () => {
  const e = await fixture({ outer: true });
  assert.equal(e.context.modern, true);
  assert.equal(e.context.embedded, true);
  assert.equal(e.sheets.length, 0);
  assert.equal(e.fields.filter((field) => field.type === "email").length, 1);
  e.buttons.find((button) => button["aria-label"] === "Close").onClick();
  assert.deepEqual(e.events, ["close"]);
  assert.equal(
    e.storage.get("hide-invite-dashboard"),
    new Date().getMonth().toString(),
  );
  assert.equal(e.requests.length, 0);
});
