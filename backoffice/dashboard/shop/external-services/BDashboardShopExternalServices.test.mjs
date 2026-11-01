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
import { JSDOM } from "jsdom";
import ts from "typescript";

// Real components, catalogs and locale sources; only UI leaves and asset URLs are isolated.
const root = new URL("../../../../../../", import.meta.url);
const filename = new URL(
  "./BDashboardShopExternalServices.vue",
  import.meta.url,
);
const modules = new Map();
const descriptors = new Map();
const denied = () =>
  assert.fail(
    "Service status must not request, test, save or mutate a provider",
  );

function evaluate(code, file) {
  const exports = {};
  const compiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  vm.runInNewContext(compiled.outputText, {
    exports,
    require: (name) => {
      if (name === "vue") return Vue;
      assert.ok(
        name.startsWith("@selldone/") || name.startsWith("."),
        `Unexpected dependency: ${name}`,
      );
      return load(new URL(name, name.startsWith("@selldone/") ? root : file));
    },
    axios: new Proxy({}, { get: () => denied }),
    fetch: denied,
    window: { fetch: denied, open: denied },
  });
  return exports;
}
function load(url) {
  if (/\.(svg|png)$/.test(url.pathname))
    return {
      __esModule: true,
      default: `/fixture-assets/${url.pathname.split("/").at(-1)}`,
    };
  if (!/\.(ts|vue)$/.test(url.pathname)) url = new URL(url.href + ".ts");
  if (modules.has(url.href)) return modules.get(url.href);
  const source = readFileSync(url, "utf8");
  if (!url.pathname.endsWith(".vue")) {
    const result = evaluate(source, url);
    modules.set(url.href, result);
    return result;
  }
  const { descriptor, errors } = parse(source, { filename: url.pathname });
  assert.deepEqual(errors, []);
  descriptors.set(url.href, descriptor);
  const script = compileScript(descriptor, { id: "services-test" });
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: url.pathname,
    id: "services-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(compiled.errors, []);
  const component = evaluate(script.content, url).default;
  component.render = evaluate(compiled.code, url).render;
  const result = { __esModule: true, default: component };
  modules.set(url.href, result);
  return result;
}

const component = load(filename).default;
const SmsProviders = load(
  new URL("@selldone/core-js/enums/sms/SmsProviders.ts", root),
).SmsProviders;
const EmailProviders = load(
  new URL("@selldone/core-js/enums/email/EmailProviders.ts", root),
).EmailProviders;
const messages = Object.fromEntries(
  ["en", "fa"].map((locale) => [
    locale,
    {
      ...load(new URL(`@selldone/translate/dashboard/${locale}.ts`, root))
        .default,
      global: load(new URL(`@selldone/translate/global/${locale}.ts`, root))
        .default,
    },
  ]),
);
function translator(locale) {
  return (key, values = {}) => {
    const message = key
      .split(".")
      .reduce((value, part) => value?.[part], messages[locale]);
    assert.equal(
      typeof message,
      "string",
      `Missing ${locale} translation: ${key}`,
    );
    return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
  };
}
function appFor({
  modern,
  shop = { id: 7 },
  locale = "en",
  createApp = Vue.createSSRApp,
} = {}) {
  const props = Vue.reactive({ shop });
  if (modern !== undefined) props.modern = modern;
  const links = [],
    tooltips = [];
  const app = createApp({ render: () => Vue.h(component, props) });
  app.config.globalProperties.$t = translator(locale);
  app.config.warnHandler = (message) => {
    throw Error(message);
  };
  app.config.errorHandler = (error) => {
    throw error;
  };
  const wrapper = (tag) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () =>
          Vue.h(tag, attrs, [
            slots.prepend?.(),
            slots.default?.(),
            slots.append?.(),
          ]),
    });
  app.component(
    "VBtn",
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          links.push(attrs);
          return Vue.h(
            attrs.to || attrs.href ? "a" : "button",
            {
              href: attrs.to ? `/route/${attrs.to.name}` : attrs.href,
              class: attrs.class,
              "aria-label": attrs["aria-label"],
              target: attrs.target,
              rel: attrs.rel,
            },
            slots.default?.(),
          );
        },
    }),
  );
  app.component("RouterLink", app.component("VBtn"));
  app.component(
    "VIcon",
    Vue.defineComponent({
      props: ["icon", "size", "color"],
      setup:
        (props, { slots }) =>
        () =>
          Vue.h("span", { "data-icon": props.icon }, slots.default?.()),
    }),
  );
  app.component(
    "VImg",
    Vue.defineComponent({
      props: ["src"],
      setup: (props) => () => Vue.h("img", { src: props.src }),
    }),
  );
  app.component(
    "SWidget",
    Vue.defineComponent({
      props: ["title", "subTitle"],
      setup:
        (props, { slots }) =>
        () =>
          Vue.h("section", { "data-legacy-widget": "" }, [
            Vue.h("h2", props.title),
            Vue.h("p", props.subTitle),
            slots["top-left"]?.(),
            slots.default?.(),
          ]),
    }),
  );
  for (const [name, tag] of Object.entries({
    VList: "ul",
    VListItem: "li",
    VListItemTitle: "h3",
    VListItemSubtitle: "p",
    VListItemAction: "div",
    VAvatar: "span",
    VChip: "span",
    VSpacer: "div",
    VBadge: "span",
  }))
    app.component(name, wrapper(tag));
  app.directive("tooltip", {
    getSSRProps: ({ value }) => {
      tooltips.push(value);
      return {};
    },
    mounted: (_, { value }) => tooltips.push(value),
  });
  return { app, props, links, tooltips };
}
async function render(options) {
  const fixture = appFor({ modern: true, ...options });
  const html = await renderToString(fixture.app);
  return { ...fixture, html, document: new JSDOM(html).window.document };
}
function mount(t, options) {
  const dom = new JSDOM("<div id='app'></div>");
  const document = dom.window.document;
  const renderer = Vue.createRenderer({
    insert: (node, parent, anchor) => parent.insertBefore(node, anchor || null),
    remove: (node) => node.remove(),
    createElement: (tag) => document.createElement(tag),
    createText: (text) => document.createTextNode(text),
    createComment: (text) => document.createComment(text),
    setText: (node, text) => {
      node.nodeValue = text;
    },
    setElementText: (node, text) => {
      node.textContent = text;
    },
    parentNode: (node) => node.parentNode,
    nextSibling: (node) => node.nextSibling,
    patchProp(node, key, previous, value) {
      if (/^on[A-Z]/.test(key)) {
        const event = key.slice(2).toLowerCase();
        if (previous) node.removeEventListener(event, previous);
        if (value) node.addEventListener(event, value);
      } else if (value === null || value === undefined || value === false)
        node.removeAttribute(key);
      else node.setAttribute(key, value === true ? "" : String(value));
    },
  });
  const fixture = appFor({
    modern: true,
    ...options,
    createApp: renderer.createApp,
  });
  fixture.app.mount(document.querySelector("#app"));
  t.after(() => {
    fixture.app.unmount();
    dom.window.close();
  });
  return { ...fixture, document };
}

test("real services script/template/scoped Sass compile, with legacy still the default", async () => {
  assert.equal(component.props.modern.default, false);
  assert.equal(component.props.shop.required, true);
  const descriptor = descriptors.get(filename.href);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: filename.pathname,
      id: "services-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("EN/FA modern services share one heading, two rows and exact native settings routes", async () => {
  for (const locale of ["en", "fa"]) {
    const f = await render({ locale });
    const t = translator(locale);
    assert.equal(f.document.querySelectorAll("h2").length, 1);
    assert.equal(
      f.document.querySelector("h2").textContent.trim(),
      t("admin_shop.dashboard.technical.services_title"),
    );
    const rows = [...f.document.querySelectorAll("article")];
    assert.equal(rows.length, 2);
    assert.deepEqual(
      rows.map((row) => row.querySelector("h3").textContent),
      ["SMS", t("global.commons.email")],
    );
    assert.deepEqual(
      f.links.map((link) => link.to.name),
      ["BPageShopSettingSms", "BPageShopSettingEmail"],
    );
    assert.deepEqual(
      [...f.document.querySelectorAll("a")].map((link) =>
        link.getAttribute("href"),
      ),
      ["/route/BPageShopSettingSms", "/route/BPageShopSettingEmail"],
    );
    for (const [index, link] of f.links.entries()) {
      assert.equal(
        link["aria-label"],
        t("admin_shop.dashboard.technical.service_settings", {
          service: rows[index].querySelector("h3").textContent,
        }),
      );
      assert.equal(link.target, undefined);
      assert.equal(link.onClick, undefined);
      assert.equal(f.tooltips[index].location, "top");
      assert.equal(f.tooltips[index].openOnFocus, true);
    }
    assert.equal(
      f.document.querySelectorAll("button, input, textarea, form").length,
      0,
    );
  }
});

test("null and missing service data show Default without inventing enablement or an error count", async () => {
  for (const locale of ["en", "fa"]) {
    for (const missing of [{}, { sms_service: null, mail_service: null }]) {
      const f = await render({ locale, shop: { id: 7, ...missing } });
      const providers = [
        ...f.document.querySelectorAll(
          ".s--shop-dashboard-services__provider > p",
        ),
      ];
      assert.deepEqual(
        providers.map((node) => node.textContent.trim()),
        [
          SmsProviders.find((provider) => provider.driver === "default").title,
          translator(locale)("global.commons.default"),
        ],
      );
      assert.equal(
        f.document.querySelectorAll(
          ".s--shop-dashboard-services__state, details",
        ).length,
        0,
      );
      assert.ok(f.document.querySelector('[data-icon="chat_bubble_outline"]'));
      assert.ok(f.document.querySelector('[data-icon="mail_outline"]'));
    }
  }
});

test("configured providers retain the real catalog titles and icons", async () => {
  for (const [property, catalog, index] of [
    ["sms_service", SmsProviders, 0],
    ["mail_service", EmailProviders, 1],
  ]) {
    for (const provider of catalog) {
      const f = await render({
        shop: {
          id: 7,
          [property]: { driver: provider.driver, enable: true, errors: 0 },
        },
      });
      const row = f.document.querySelectorAll("article")[index];
      assert.equal(
        row
          .querySelector(".s--shop-dashboard-services__provider > p")
          .textContent.trim(),
        provider.title,
      );
      const image = row.querySelector("img");
      if (property === "sms_service" && provider.driver === "default")
        assert.equal(image, null);
      else assert.equal(image.getAttribute("src"), provider.icon);
      assert.ok(row.querySelector(".sd-modern-status__dot--success"));
      assert.ok(
        row
          .querySelector(".s--shop-dashboard-services__state")
          .textContent.includes(translator("en")("global.commons.enable")),
      );
    }
  }
});

test("unknown drivers stay visible and configured disabled/zero/unknown counters keep their meanings", async () => {
  for (const locale of ["en", "fa"]) {
    for (const errors of [undefined, null, 0, 8]) {
      const driver = 'future-provider <img src="x" onerror="fixture()">';
      const f = await render({
        locale,
        shop: {
          id: 7,
          sms_service: { driver, enable: false, errors },
          mail_service: { driver, enable: false, errors },
        },
      });
      for (const row of f.document.querySelectorAll("article")) {
        assert.equal(
          row
            .querySelector(".s--shop-dashboard-services__provider > p")
            .textContent.trim(),
          driver,
        );
        assert.equal(row.querySelector("img"), null);
        const state = row.querySelector(".s--shop-dashboard-services__state");
        assert.ok(
          state.textContent.includes(
            translator(locale)("global.commons.disable"),
          ),
        );
        const count = state
          .querySelector(":scope > span:last-child")
          .textContent.trim();
        assert.equal(
          count,
          `${translator(locale)("admin_shop.dashboard.modern.service_errors")} · ${errors ?? translator(locale)("admin_shop.dashboard.technical.not_reported")}`,
        );
        assert.equal(
          state.querySelector(".sd-modern-status__dot--success"),
          null,
        );
      }
    }
  }
});

test("long last errors remain escaped in a native disclosure that resets only for a new shop/error", async (t) => {
  const error =
    '<script>fixture()</script><img src="x" onerror="fixture()"> & failure\n' +
    "details ".repeat(200);
  const f = mount(t, {
    shop: {
      id: 7,
      sms_service: { driver: "twilio", enable: false, errors: 4, error },
    },
  });
  let disclosure = f.document.querySelector("details");
  assert.equal(disclosure.open, false);
  assert.equal(disclosure.querySelector('[role="alert"]').textContent, error);
  assert.equal(disclosure.querySelector("script, img"), null);
  disclosure.querySelector("summary").click();
  assert.equal(disclosure.open, true);
  f.props.shop.sms_service.errors = 5;
  await Vue.nextTick();
  assert.equal(f.document.querySelector("details"), disclosure);
  assert.equal(
    disclosure.open,
    true,
    "An unchanged diagnostic keeps its native disclosure state",
  );
  f.props.shop.sms_service.error = "A new error";
  await Vue.nextTick();
  assert.equal(disclosure.isConnected, false);
  disclosure = f.document.querySelector("details");
  assert.equal(disclosure.open, false);
  assert.equal(
    disclosure.querySelector('[role="alert"]').textContent,
    "A new error",
  );
  disclosure.querySelector("summary").click();
  assert.equal(disclosure.open, true);
  f.props.shop = { ...f.props.shop, id: 8 };
  await Vue.nextTick();
  assert.equal(disclosure.isConnected, false);
  disclosure = f.document.querySelector("details");
  assert.equal(
    disclosure.open,
    false,
    "A different shop cannot inherit an open diagnostic",
  );
  f.props.shop.sms_service = null;
  await Vue.nextTick();
  assert.equal(f.document.querySelector("details"), null);
  assert.equal(
    f.document.querySelector(".s--shop-dashboard-services__state"),
    null,
  );
});

test("omitted modern prop preserves the legacy widget, status/error contents and native routes", async () => {
  const shop = {
    id: 7,
    sms_service: {
      driver: "twilio",
      enable: false,
      errors: 3,
      error: "Fixture SMS failure",
    },
    mail_service: {
      driver: "mailgun",
      enable: false,
      errors: 2,
      error: "Fixture mail failure",
    },
  };
  const omitted = await render({ modern: undefined, shop });
  const explicit = await render({ modern: false, shop });
  assert.equal(omitted.html, explicit.html);
  assert.ok(omitted.document.querySelector("[data-legacy-widget]"));
  assert.equal(
    omitted.document.querySelector(".s--shop-dashboard-services"),
    null,
  );
  assert.equal(omitted.document.querySelectorAll("li").length, 2);
  assert.ok(omitted.document.body.textContent.includes("SMS setting"));
  assert.ok(omitted.document.body.textContent.includes("Email setting"));
  assert.ok(omitted.document.body.textContent.includes("Fixture SMS failure"));
  assert.ok(omitted.document.body.textContent.includes("Fixture mail failure"));
  assert.equal(
    omitted.document.querySelectorAll('[color="#D32F2F"]').length,
    4,
  );
  assert.deepEqual(
    omitted.links.map((link) => link.to.name),
    ["BPageShopSettingSms", "BPageShopSettingEmail"],
  );
});
