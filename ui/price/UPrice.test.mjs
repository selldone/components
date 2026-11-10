import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyle, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import { isObject, isString } from "lodash-es";
import numeral from "numeral";
import ts from "typescript";

const modules = {};
function evaluate(path) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports,
    require(name) {
      if (/\.(svg|png)$/.test(name)) return name;
      if (name.includes("CurrencyMixin")) return { default: modules.mixin };
      if (name.includes("CurrencyHelper")) return modules.helper;
      if (name.includes("/Currency")) return modules.currency;
      if (name === "@selldone/core-js/helper") return modules.helper;
      if (name === "@selldone/core-js/models" || /StorefrontLocalStorages|SetupService|TrackConfig/.test(name)) return {};
      if (name === "lodash-es") return { isObject, isString };
      assert.equal(name, "numeral");
      return { default: numeral };
    },
  });
  return exports;
}
modules.currency = evaluate("../../../core-js/enums/payment/Currency.ts");
modules.helper = evaluate("../../../core-js/helper/currency/CurrencyHelper.ts");
modules.mixin = evaluate("../../mixin/currency/CurrencyMixin.ts").default;
const filename = new URL("./UPrice.vue", import.meta.url).pathname;
const { descriptor, errors } = parse(readFileSync(new URL("./UPrice.vue", import.meta.url), "utf8"), { filename });
assert.deepEqual(errors, []);
const script = ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const componentExports = {};
vm.runInNewContext(script, { exports: componentExports, require: name => name.includes("CurrencyMixin") ? { default: modules.mixin } : modules.helper });
const template = compileTemplate({ source: descriptor.template.content, filename, id: "data-v-price-test", scoped: true });
assert.deepEqual(template.errors, []);
const templateExports = {};
vm.runInNewContext(ts.transpileModule(template.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: templateExports, require: () => Vue });
const style = compileStyle({ source: descriptor.styles[0].content, filename, id: "data-v-price-test", scoped: true, preprocessLang: "scss" });
assert.deepEqual(style.errors, []);
const component = { ...componentExports.default, __scopeId: "data-v-price-test", render: templateExports.render };

async function render(props = {}, { ancestorClass = "", rootClass = "", reverse = false } = {}) {
  const app = Vue.createSSRApp({ render: () => Vue.h("div", { class: ancestorClass }, Vue.h(component, { amount: 120, currency: "USD", ...props, class: rootClass })) });
  app.provide("$productEmbedCurrency", modules.currency.Currency.USD);
  Object.assign(app.config.globalProperties, {
    $t: key => key,
    isObject,
    getShop: () => ({ theme: { reverse_currency: reverse } }),
    numeralFormat: (value, format) => numeral(value).format(format),
  });
  app.component("VTooltip", { render: () => null });
  const dom = new JSDOM(`<style>${style.code}.old-amount{display:block;width:400px}.text-decoration-line-through{text-decoration:line-through!important}</style>${await renderToString(app)}`);
  const price = dom.window.document.querySelector(".u--price");
  const value = price?.querySelector(".u--price__value");
  const strokes = value ? [...dom.window.document.styleSheets[0].cssRules].filter(rule => rule.selectorText?.includes("::after") && rule.selectorText.split(",").some(selector => value.matches(selector.trim().replace(/::after$/, "")))) : [];
  return { dom, price, value, strokes };
}

test("discount uses one intrinsic stroke across the original currency, integer and smaller fraction", async () => {
  for (const options of [{}, { reverse: true }, { rootClass: "old-amount" }, { rootClass: "text-decoration-line-through" }, { ancestorClass: "text-decoration-line-through" }]) {
    const f = await render({ lineThrough: !options.rootClass?.includes("text-decoration") && !options.ancestorClass }, options);
    assert.equal(f.strokes.length, 1);
    assert.equal(f.dom.window.getComputedStyle(f.value).display, "inline-block");
    assert.equal(f.dom.window.getComputedStyle(f.value).whiteSpace, "nowrap");
    assert.equal(f.value.querySelector(".small").textContent, ".00");
    assert.equal(f.value.textContent.replace(/\s/g, ""), options.reverse ? "120.00$" : "$120.00");
    assert.equal(f.price.querySelector(":scope > span > .small"), f.value.querySelector(".small"), "Existing fractional typography selectors keep their direct-child contract");
    assert.equal(f.value.querySelectorAll(".line-through,.text-decoration-line-through").length, 0);
    assert.equal(parseFloat(f.strokes[0].style.getPropertyValue("inset-inline")), 0);
    assert.equal(f.strokes[0].style.getPropertyValue("inset-block-start"), "50%");
    assert.equal(f.strokes[0].style.getPropertyValue("border-block-start"), "1px solid currentColor");
    assert.equal(f.strokes[0].style.getPropertyValue("pointer-events"), "none");
    if (options.rootClass === "old-amount") assert.equal(f.dom.window.getComputedStyle(f.price).width, "400px");
    f.dom.window.close();
  }
});

test("plain, compact, negative and named currencies retain native formatting without a second decoration", async () => {
  const plain = await render();
  assert.equal(plain.strokes.length, 0);
  plain.dom.window.close();
  const negative = await render({ amount: -120.5, lineThrough: true });
  assert.equal(negative.value.textContent.replace(/\s/g, ""), "$-120.50");
  negative.dom.window.close();
  const compact = await render({ amount: 1200, compact: true, lineThrough: true });
  assert.equal(compact.value.querySelector(".small"), null);
  assert.equal(compact.value.textContent.replace(/\s/g, ""), "$1.2k");
  compact.dom.window.close();
  const named = await render({ currency: "IRR", lineThrough: true });
  assert.ok(named.value.querySelector(".cur-name"));
  assert.equal(named.strokes.length, 1);
  assert.equal(named.dom.window.getComputedStyle(named.value).whiteSpace, "nowrap", "A named currency stays on the same atomic price line");
  named.dom.window.close();
});

test("hidden zero and invalid amounts never acquire the discount stroke", async () => {
  for (const props of [{ amount: 0, notShowZero: true }, { amount: null }, { amount: undefined }, { amount: "unavailable" }]) {
    const f = await render({ ...props, lineThrough: true });
    assert.ok(!f.value);
    assert.equal(f.strokes.length, 0);
    f.dom.window.close();
  }
});
