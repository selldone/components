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

// Render the real SFC with local control/QR stubs; never open a download or API.
const filename = new URL("./BDashboardShopApplications.vue", import.meta.url);
const source = readFileSync(filename, "utf8");
const { descriptor, errors } = parse(source, { filename: filename.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "apps-workspace" });
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "apps-workspace",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(compiled.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({
    source: style.content,
    filename: filename.pathname,
    id: "apps-workspace",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(result.errors, []);
}
const evaluate = (code, globals) => {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, ...globals },
  );
  return exports;
};
const locales = Object.fromEntries(
  ["en", "fa"].map((locale) => [
    locale,
    evaluate(
      readFileSync(
        new URL(
          `../../../../../translate/dashboard/${locale}.ts`,
          import.meta.url,
        ),
        "utf8",
      ),
    ).default,
  ]),
);

async function fixture({
  modern = true,
  platform = "ios",
  locale = "en",
} = {}) {
  const ios = "https://ios.example.test/custom-store";
  const android = "https://android.example.test/custom-store";
  const origin = "https://business.example.test";
  const storage = new Map();
  const buttons = [];
  const tooltips = [];
  const qrCodes = [];
  let desktopReads = 0;
  let closes = 0;
  let context;
  let toggle;
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name.endsWith("/SetupService"))
      return {
        SetupService: {
          IosApp: () => ios,
          AndroidApp: () => android,
          MainServiceUrl: () => {
            desktopReads++;
            return origin;
          },
        },
      };
    if (/\.(png|svg)$/.test(name)) return name;
    assert.fail(`Unexpected dependency: ${name}`);
  };
  class FixedDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : ["2026-10-27T08:00:00Z"]));
    }
  }
  const globals = {
    require,
    Date: FixedDate,
    localStorage: { setItem: (key, value) => storage.set(key, value) },
  };
  const component = evaluate(descriptor.script.content, globals).default;
  const render = evaluate(compiled.code, globals).render;
  const app = Vue.createSSRApp(
    {
      ...component,
      data: () => ({ ...component.data(), tab: platform }),
      render(...args) {
        context = this;
        return render.apply(this, args);
      },
    },
    { modern, onClose: () => closes++ },
  );
  app.config.globalProperties.$t = (key, values = {}) => {
    if (key === "global.actions.close")
      return locale === "fa" ? "بستن" : "Close";
    const text = key
      .split(".")
      .reduce((value, part) => value?.[part], locales[locale]);
    assert.equal(
      typeof text,
      "string",
      `Missing ${locale} translation: ${key}`,
    );
    return text.replace(/\{(\w+)\}/g, (_, name) => values[name]);
  };
  const wrapper = (tag, capture = () => {}) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () => {
          capture(attrs);
          return Vue.h(tag, attrs, slots.default?.());
        },
    });
  app.component(
    "v-btn",
    wrapper("button", (attrs) => buttons.push(attrs)),
  );
  app.component(
    "v-btn-toggle",
    wrapper("div", (attrs) => {
      toggle = attrs;
    }),
  );
  app.component("v-icon", wrapper("span"));
  for (const name of ["s-widget", "v-row", "v-col", "v-chip", "v-list-item"])
    app.component(name, wrapper("div"));
  app.component(
    "u-qrcode",
    Vue.defineComponent({
      props: ["value", "options"],
      setup: (props) => () => {
        qrCodes.push({ value: props.value, options: props.options });
        return Vue.h("canvas", { "data-qr": props.value });
      },
    }),
  );
  app.directive("tooltip", {
    getSSRProps: ({ value }) => {
      tooltips.push(value);
      return {};
    },
  });
  const html = await renderToString(app);
  return {
    html,
    context,
    buttons,
    toggle,
    tooltips,
    qrCodes,
    storage,
    ios,
    android,
    origin,
    component,
    closes: () => closes,
    desktopReads: () => desktopReads,
  };
}

test("Workspace preserves configured store destinations, QR choice and desktop service origin", async () => {
  const result = await fixture();
  assert.equal(result.component.props.modern.default, false);
  for (const destination of [
    result.ios,
    result.android,
    `${result.origin}/desktop#downloads`,
  ])
    assert.ok(result.html.includes(`href="${destination}"`));
  assert.equal(
    (result.html.match(/target="_blank" rel="noopener noreferrer"/g) || [])
      .length,
    3,
  );
  assert.equal(result.qrCodes.length, 1);
  assert.equal(result.qrCodes[0].value, result.ios);
  assert.equal(result.qrCodes[0].options.color.light, "#fff");
  assert.equal(result.qrCodes[0].options.color.dark, "#111");
  result.toggle["onUpdate:modelValue"]("android");
  assert.equal(result.context.tab, "android");
  assert.equal(result.context.qr, result.android);
  const android = await fixture({ platform: "android" });
  assert.equal(android.qrCodes[0].value, android.android);
  assert.ok(
    android.html.includes(
      'value="android" class="sd-modern-button" variant="text" aria-pressed="true"',
    ),
  );
  for (const brand of ["apple", "windows", "linux"])
    assert.ok(result.html.includes(`fa:fab fa-${brand}`));
  for (const title of [
    "Never miss an order",
    "Manage your orders",
    "Keep products up to date",
  ])
    assert.ok(result.html.includes(title));
  assert.equal(new Set(result.tooltips.map((tooltip) => tooltip.text)).size, 6);
  for (const tooltip of result.tooltips) {
    assert.equal(tooltip.location, "top");
    assert.equal(tooltip.contentClass, "sd-modern-tooltip text-start");
    assert.equal(tooltip.openOnFocus, true);
  }
  assert.equal(result.storage.size, 0);
});

test("Workspace translations render in Persian and close retains the quarterly marker/event", async () => {
  const result = await fixture({ locale: "fa" });
  assert.ok(result.html.includes("فروشگاه شما، روی هر صفحه‌ای."));
  assert.ok(result.html.includes("دریافت نسخهٔ دسکتاپ"));
  assert.ok(result.html.includes('dir="ltr">Windows'));
  result.buttons.find((button) => button["aria-label"] === "بستن").onClick();
  assert.equal(result.storage.get("hide-applications-dashboard-release"), "3");
  assert.equal(result.closes(), 1);
});

test("legacy opt-out keeps its original mobile-only presentation and QR size", async () => {
  const result = await fixture({ modern: false });
  assert.equal(result.html.includes("s--shop-applications-modern"), false);
  assert.equal(result.html.includes("/desktop#downloads"), false);
  assert.equal(result.desktopReads(), 0);
  assert.ok(result.html.includes("Available Now"));
  assert.equal(result.qrCodes[0].options.width, 300);
  assert.equal(result.qrCodes[0].value, result.ios);
  result.buttons.at(-1).onClick();
  assert.equal(result.storage.get("hide-applications-dashboard-release"), "3");
  assert.equal(result.closes(), 1);
});
