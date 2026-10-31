import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const plain = (value) => JSON.parse(JSON.stringify(value));
function evaluate(source, require = () => ({ default: {} })) {
  const exports = {};
  const compiled = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  assert.deepEqual(compiled.diagnostics, []);
  vm.runInNewContext(compiled.outputText, { exports, require });
  return exports;
}
const { getOrderAttention, getPaymentDetailRows } = evaluate(readFileSync(new URL("./ProcessCenterPresentation.ts", import.meta.url), "utf8"));

test("attention explanations follow every existing day boundary and rejection precedence", () => {
  const attention = (daysSinceUpdate, more = {}) => getOrderAttention({ queued: true, daysSinceUpdate, ...more });
  for (const [days, state] of [[0, "recent"], [1, "recent"], [1.01, "watching"], [2, "watching"], [2.01, "sad"], [3, "sad"], [3.01, "annoyed"], [5, "annoyed"], [5.01, "mad"], [7, "mad"], [7.01, "angry"], [10, "angry"], [10.01, "urgent"]]) {
    assert.equal(attention(days).titleKey, `admin_shop.orders.physical.modern.attention.${state}.title`);
    assert.equal(attention(days).bodyKey, `admin_shop.orders.physical.modern.attention.${state}.body`);
  }
  assert.equal(attention(20, { queued: false }), null);
  assert.match(attention(20, { queued: false, rejected: true }).titleKey, /\.rejected\.title$/);
  for (const missing of [null, undefined, NaN, -1]) assert.match(attention(missing).titleKey, /\.unknown\.title$/);
});

test("payment help exposes only useful bounded issuer and valid recorded risk", () => {
  assert.deepEqual(plain(getPaymentDetailRows({ card: { bank: "  Credit  ", holder: "private", card_no: "private" }, risk: 0, id: 5 })), [
    { key: "bank", labelKey: "admin_shop.orders.physical.modern.payment.issuer", value: "Credit" },
    { key: "risk", labelKey: "admin_shop.orders.physical.modern.payment.risk", value: "0 / 100" },
  ]);
  assert.equal(getPaymentDetailRows({ card: { bank: "x".repeat(200) }, risk: 100 })[0].value.length, 120);
  assert.equal(getPaymentDetailRows({ risk: 100 })[0].value, "100 / 100");
  for (const risk of [null, undefined, "0", -1, 101, Infinity, NaN, { score: 80 }]) assert.equal(getPaymentDetailRows({ risk }).length, 0);
  assert.equal(getPaymentDetailRows(null).length, 0);
  assert.equal(getPaymentDetailRows({ card: { bank: { value: "not a label" } } }).length, 0);
});

test("stage help is opt-in, keeps five nodes and leaves receiver stage untouched", async () => {
  const filename = "SOrderDeliveryStatusStepper.vue";
  const source = readFileSync(new URL("../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue", import.meta.url), "utf8");
  const { descriptor, errors } = parse(source, { filename });
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename, id: "step-help" });
  assert.deepEqual(template.errors, []);
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, filename, id: "step-help", scoped: true, preprocessLang: "scss" }).errors, []);
  const component = { ...evaluate(descriptor.script.content).default, mixins: [], render: evaluate(template.code, () => Vue).render };
  assert.equal(component.props.modernTooltips.default, false);
  const states = Object.fromEntries(["CheckQueue", "OrderConfirm", "PreparingOrder", "SentOrder", "ToCustomer"].map((code) => [code, { code, name: code, icon: "local_shipping" }]));
  for (const [modernTooltips, modernFinalTooltip] of [[false, false], [true, false], [true, true]]) {
    const helps = [];
    const app = Vue.createSSRApp(component, { states, state: "PreparingOrder", modernTooltips, modernFinalTooltip });
    app.component("v-icon", { setup: (_, { slots }) => () => Vue.h("i", slots.default?.()) });
    app.component("v-tooltip", { setup: (_, { attrs, slots }) => { helps.push(attrs); return () => Vue.h("aside", slots.default?.()); } });
    Object.assign(app.config.globalProperties, { $t: (key) => key, $vuetify: { display: { xs: false }, locale: { isRtl: false } }, ThemeColorDeepDark: "#222" });
    const html = await renderToString(app);
    assert.equal((html.match(/<li\b/g) || []).length, 5);
    assert.equal(helps.length, modernTooltips ? modernFinalTooltip ? 5 : 4 : 0);
    if (modernFinalTooltip) assert.doesNotMatch(html, /title="ToCustomer"/);
    else assert.match(html, /title="ToCustomer"/);
    if (modernTooltips) {
      assert.equal((html.match(/<button\b/g) || []).length, modernFinalTooltip ? 5 : 4);
      assert.match(html, /stages\.completed/);
      assert.match(html, /stages\.current/);
      assert.match(html, /stages\.upcoming/);
      for (const help of helps) assert.equal(help.location, "top");
    }
  }
});
