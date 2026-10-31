import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileScript, compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const filename = new URL("./BVendorPayoutPods.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename: filename.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "vendor-money-flow-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "vendor-money-flow-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
const compiledStyles = [];
for (const style of descriptor.styles) {
  assert.equal(style.scoped, true);
  const result = await compileStyleAsync({
    source: style.content,
    filename: filename.pathname,
    id: "data-v-vendor-money-flow-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(result.errors, []);
  compiledStyles.push(result.code);
}
const css = compiledStyles.join("\n");
const transpile = source => {
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  return result.outputText;
};
const translations = Object.fromEntries(["en", "fa"].map(locale => {
  const result = {};
  const path = new URL(`../../../../../translate/dashboard/${locale}.ts`, import.meta.url);
  vm.runInNewContext(transpile(readFileSync(path, "utf8")), { exports: result });
  return [locale, result.default];
}));
const escapeHtml = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const stageTags = html => [...html.matchAll(/<button\b([^>]*\bdata-stage="([^"]+)"[^>]*)>/g)].map(([, attributes, stage]) => ({
  stage,
  current: attributes.includes('aria-current="location"'),
  highlighted: /class="[^"]*b-vendor-payout-flow__node--highlighted/.test(attributes),
}));

function fixture({ locale = "en", ...props } = {}) {
  const tooltips = [], buttons = [], operations = [], warnings = [], exports = {}, rendered = {};
  const forbidden = name => (...args) => {
    operations.push([name, args]);
    assert.fail(`The explanatory diagram must not perform ${name}`);
  };
  vm.runInNewContext(transpile(script.content), {
    exports,
    require(name) {
      if (name === "vue") return Vue;
      if (name.endsWith("/assets/trademark/stripe.svg")) return { default: "/fixture/stripe.svg" };
      assert.fail(`Unexpected diagram dependency: ${name}`);
    },
    axios: Object.fromEntries(["get", "post", "put", "delete"].map(method => [method, forbidden(`HTTP ${method}`)])),
    fetch: forbidden("fetch"),
    setTimeout: forbidden("timer"),
    setInterval: forbidden("repeating timer"),
    window: { location: { assign: forbidden("navigation") } },
  });
  vm.runInNewContext(transpile(template.code), { exports: rendered, require: () => Vue });
  const component = { ...exports.default, render: rendered.render };
  const defaults = { shop: { id: 7, title: "Fixture marketplace", icon: "fixture-shop.svg" }, vendor: { id: 17, name: "Fixture vendor" } };
  const translate = (key, values = {}) => {
    const value = key.split(".").reduce((current, part) => current?.[part], translations[locale]);
    assert.equal(typeof value, "string", `Missing ${locale} translation: ${key}`);
    return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
  };
  function appFor(children) {
    const app = Vue.createSSRApp({ render: () => children() });
    Object.assign(app.config.globalProperties, {
      $t: translate,
      $vuetify: { locale: { isRtl: locale === "fa" } },
      getShopImagePath: path => `/fixture/images/${path}`,
    });
    app.config.warnHandler = message => warnings.push(message);
    app.component("v-icon", Vue.defineComponent({
      inheritAttrs: false,
      setup: (_, { attrs, slots }) => () => Vue.h("span", { class: attrs.class, "aria-hidden": attrs["aria-hidden"] }, slots.default?.()),
    }));
    app.component("v-btn", Vue.defineComponent({
      inheritAttrs: false,
      setup: (_, { attrs, slots }) => () => {
        buttons.push({ ...attrs });
        return Vue.h("button", { ...attrs, type: attrs.type ?? "button" }, slots.default?.());
      },
    }));
    app.component("v-tooltip", Vue.defineComponent({
      inheritAttrs: false,
      setup: (_, { attrs, slots }) => () => {
        tooltips.push({ ...attrs });
        return Vue.h("span", { role: "tooltip" }, slots.default?.());
      },
    }));
    return app;
  }
  async function render(otherInstances = []) {
    tooltips.length = buttons.length = warnings.length = 0;
    return renderToString(appFor(() => otherInstances.length === 0
      ? Vue.h(component, { ...defaults, ...props })
      : Vue.h("div", [props, ...otherInstances].map((instance, key) => Vue.h(component, { ...defaults, ...instance, key })))));
  }
  return { component, render, tooltips, buttons, operations, warnings };
}

test("all stages emphasize the requested location, including both collection nodes and transaction context", async () => {
  for (const stage of ["order", "fulfillment", "collection", "wallet", "stripe", "bank", "manual", "payout", "transactions"]) {
    const current = fixture({ activeStage: stage });
    const nodes = stageTags(await current.render());
    assert.equal(nodes.length, 9);
    const expected = stage === "transactions" ? ["wallet", "payout"] : [stage];
    assert.ok(nodes.some(node => node.current), stage);
    for (const node of nodes) {
      assert.equal(node.current, expected.includes(node.stage), `${stage}: ${node.stage}`);
      assert.equal(node.highlighted, node.current);
    }
    assert.deepEqual(current.warnings, []);
    assert.deepEqual(current.operations, []);
  }
});

test("legacy highlights remain compatible while explicit or invalid stages never imply payment status", async () => {
  const cases = [
    [{}, []],
    [{ highlightWallet: true }, ["wallet"]],
    [{ highlightPayout: true }, ["payout"]],
    [{ highlightTransactions: true }, ["wallet", "payout"]],
    [{ highlightWallet: true, highlightPayout: true, highlightTransactions: true }, ["wallet"]],
    [{ activeStage: "stripe", highlightWallet: true, highlightPayout: true }, ["stripe"]],
    [{ activeStage: "unknown", highlightWallet: true }, []],
    [{ activeStage: "", highlightWallet: true }, []],
  ];
  for (const [props, expected] of cases) {
    const current = fixture(props);
    const html = await current.render();
    const highlighted = [...new Set(stageTags(html).filter(node => node.current).map(node => node.stage))];
    assert.deepEqual(highlighted, expected);
    assert.ok(html.includes(escapeHtml(translations.en.vendor_money_flow.context_hint)));
    assert.equal(current.warnings.length, ["unknown", ""].includes(props.activeStage) ? 1 : 0);
  }
  assert.equal(await fixture({ modern: false, highlightWallet: true }).render(), await fixture({ modern: true, highlightWallet: true }).render());
});

test("both locales render order routing, virtual accounting, connected transfer, external bank record and corrections", async () => {
  assert.deepEqual(Object.keys(translations.en.vendor_money_flow), Object.keys(translations.fa.vendor_money_flow));
  for (const locale of ["en", "fa"]) {
    const current = fixture({ locale, activeStage: "wallet" });
    const html = await current.render();
    const copy = translations[locale].vendor_money_flow;
    assert.match(html, new RegExp(`dir="${locale === "fa" ? "rtl" : "ltr"}"`));
    for (const key of Object.keys(copy)) assert.ok(html.includes(escapeHtml(copy[key])), `${locale}: ${key}`);
    assert.deepEqual(current.warnings, []);
    assert.deepEqual(current.operations, []);
  }
  const en = translations.en.vendor_money_flow, fa = translations.fa.vendor_money_flow;
  assert.match(en.credit_help, /Order creation alone does not add this credit/);
  assert.match(en.auto_help, /matching enabled gateway/);
  assert.match(en.stripe_account_help, /not a transfer directly to the vendor’s bank/);
  assert.match(en.manual_note, /no funds and makes no Stripe request/);
  assert.match(en.result_help, /Only the recorded amount is deducted/);
  assert.match(en.adjustments_help, /does not itself reverse a previous Stripe transfer/);
  assert.match(fa.credit_help, /ایجاد سفارش به‌تنهایی/);
  assert.match(fa.manual_note, /درخواستی به Stripe نمی‌فرستد/);
  assert.match(fa.result_help, /فقط مبلغ ثبت‌شده کسر می‌شود/);
});

test("all node and connection explanations retain shared top hover/focus/tap help without operational controls", async () => {
  const current = fixture();
  const html = await current.render();
  assert.ok(current.tooltips.length > stageTags(html).length);
  for (const tooltip of current.tooltips) {
    assert.equal(tooltip.activator, "parent");
    assert.equal(tooltip.location, "top");
    assert.ok(Object.hasOwn(tooltip, "open-on-focus"));
    assert.ok(Object.hasOwn(tooltip, "open-on-click"));
    assert.match(tooltip["content-class"], /sd-modern-tooltip/);
  }
  for (const button of current.buttons) {
    assert.equal(button.href, undefined);
    assert.equal(button.to, undefined);
    assert.equal(button.onClick, undefined);
    assert.notEqual(button.type, "submit");
  }
  for (const [, attributes] of html.matchAll(/<button\b([^>]*)>/g)) assert.match(attributes, /type="button"/);
  for (const [svg] of html.matchAll(/<svg\b[^>]*>/g)) {
    assert.match(svg, /aria-hidden="true"/);
    assert.match(svg, /focusable="false"/);
  }
  assert.doesNotMatch(html, /<(?:form|input|select|textarea|a)\b/);
  assert.deepEqual(current.operations, []);
});

test("caller identity is escaped and connected metadata does not infer an active route or connection health", async () => {
  const vendor = { id: 17, name: '<script>alert("fixture")</script>' };
  const plain = fixture({ vendor });
  const connected = fixture({ vendor: { ...vendor, connect_links: [{ connected: true, icon: "invented.svg" }] } });
  const html = await plain.render();
  assert.equal(html, await connected.render());
  assert.ok(html.includes(escapeHtml(vendor.name)));
  assert.doesNotMatch(html, /<script\b/);
  assert.equal(stageTags(html).some(node => node.current), false);
  const withoutVendor = await fixture({ vendor: null }).render();
  assert.ok(withoutVendor.includes(translations.en.vendor_money_flow.wallet_title));
  assert.doesNotMatch(withoutVendor, /Fixture vendor/);
  assert.deepEqual(plain.operations, []);
});

test("multiple diagrams have independent emphasis and no shared SVG definition IDs", async () => {
  const current = fixture({ activeStage: "payout" });
  const html = await current.render([{ activeStage: "wallet" }]);
  assert.deepEqual(stageTags(html).filter(node => node.current).map(node => node.stage), ["payout", "wallet"]);
  assert.equal([...html.matchAll(/<figure\b/g)].length, 2);
  for (const [svg] of html.matchAll(/<svg\b[\s\S]*?<\/svg>/g)) assert.doesNotMatch(svg, /\bid=|(?:href|url)=["']?#/);
});

test("scoped responsive styles retain complete static content with bounded and reduced motion", async () => {
  assert.match(css, /data-v-vendor-money-flow-test/);
  assert.match(css, /@container\s*\(max-width:\s*760px\)/);
  assert.match(css, /@container\s*\(max-width:\s*460px\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /animation:\s*none/);
  assert.doesNotMatch(css, /\binfinite\b/);
  const animation = css.match(/animation:\s*(vendor-flow-travel[\w-]*)\s+([\d.]+)s/);
  assert.ok(animation, "The motion duration must be explicit and bounded");
  assert.ok(css.includes(`@keyframes ${animation[1]}`));
  const duration = Number(animation[2]);
  const html = await fixture().render();
  const delays = [...html.matchAll(/--flow-delay:\s*([\d.]+)s/g)].map(([, value]) => Number(value));
  assert.ok(duration > 0 && Math.max(...delays, 0) + duration <= 3);
  assert.equal(stageTags(html).length, 9);
});
