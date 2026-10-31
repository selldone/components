import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const file = new URL("./SBasketProductInputs.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "product-inputs-test" });
assert.deepEqual(template.errors, []);
const htmlCalls = [];
function evaluate(source, require) {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
  assert.deepEqual(result.diagnostics, []);
  const exports = {};
  vm.runInNewContext(result.outputText, {
    exports, require,
    axios: new Proxy({}, { get: () => () => assert.fail("Read-only rendering must not issue HTTP requests") }),
  });
  return exports;
}
const component = evaluate(descriptor.script.content, (name) => {
  if (name.includes("HtmlHelper")) return {
    FORM_BUILDER_TAGS: [],
    SmartConvertTextToHtml: (value, ...options) => {
      htmlCalls.push({ value, options });
      return `<p data-converted>${String(value).replaceAll("<", "&lt;")}</p>`;
    },
  };
  if (name.includes("FileHelper")) return { FileHelper: { GetFileIcon: () => null } };
  return { default: {} };
}).default;
component.render = evaluate(template.code, () => Vue).render;

async function render(values) {
  const fields = [], copied = [], emissions = [];
  htmlCalls.length = 0;
  const app = Vue.createSSRApp({ ...component, components: {}, mixins: [] }, {
    modelValue: {}, product: { inputs: [] }, files: {}, readonly: true, modern: true,
    "onUpdate:files": (files) => emissions.push(files), ...values,
  });
  for (const name of ["v-text-field", "v-select", "u-smart-switch", "v-file-input"]) {
    app.component(name, {
      inheritAttrs: false,
      setup: (_, { attrs }) => () => { fields.push({ name, attrs }); return Vue.h("div", { "data-native": name }); },
    });
  }
  app.component("v-fade-transition", { setup: (_, { slots }) => () => Vue.h("div", slots.default?.()) });
  app.component("v-icon", { setup: (_, { slots }) => () => Vue.h("span", slots.default?.()) });
  app.component("v-list-subheader", { setup: (_, { slots }) => () => Vue.h("span", slots.default?.()) });
  app.component("v-btn", { setup: (_, { slots }) => () => Vue.h("button", slots.default?.()) });
  app.directive("copy", { getSSRProps(binding) { copied.push(binding.value); return {}; } });
  Object.assign(app.config.globalProperties, {
    $t: (key) => ({ "global.actions.yes": "Yes", "global.actions.no": "No", "order_input.not_provided": "Not provided" })[key] ?? key,
    numeralFormat: (value) => value,
    getLocalTimeString: () => "Recorded date",
    getFromNowString: () => "Recorded date",
  });
  return { html: await renderToString(app), fields, copied, emissions };
}

test("modern read-only values preserve text, zero, false and arrays without editable controls or synthetic defaults", async () => {
  const product = { inputs: [
    { name: "text", title: "Engraving" },
    { name: "zero", title: "Zero", type: "text" },
    { name: "gift", title: "Gift", type: "switch" },
    { name: "confirmed", title: "Confirmed", type: "switch" },
    { name: "finish", title: "Finish", type: "select", multiple: true },
    { name: "missing", title: "Missing", type: "text", default: "Synthetic default" },
    { name: "empty", title: "Empty", type: "select", multiple: true },
    { name: "note", title: "Check <before packing>", type: "note" },
  ] };
  const modelValue = { text: "Customer <text>", zero: 0, gift: false, confirmed: true, finish: ["Natural", "Matte"], empty: [] };
  const before = JSON.stringify(modelValue);
  const result = await render({ product, modelValue });
  assert.match(result.html, /s-basket-product-inputs--modern-readonly/);
  assert.match(result.html, /Customer &lt;text&gt;/);
  assert.match(result.html, />0<\/bdi>/);
  assert.match(result.html, />No<\/bdi>/);
  assert.match(result.html, />Yes<\/bdi>/);
  assert.match(result.html, /Natural, Matte/);
  assert.equal((result.html.match(/Not provided/g) ?? []).length, 2);
  assert.doesNotMatch(result.html, /Synthetic default/);
  assert.equal(JSON.stringify(modelValue), before);
  assert.equal(result.fields.length, 0);
  assert.equal(result.copied.length, 5);
  assert.match(result.html, /type="button"[^>]*aria-label="global.actions.copy: Customer &lt;text&gt;"/);
  assert.match(result.html, /aria-label="global.actions.copy: 0"/);
  assert.match(result.html, /aria-label="global.actions.copy: No"/);
  assert.equal(htmlCalls[0].value, "Check <before packing>");
  assert.deepEqual(Array.from(htmlCalls[0].options.slice(0, 2)), [false, false]);
});

test("legacy read-only and modern editable calls retain their native controls and default initialization", async () => {
  for (const props of [{ modern: false, readonly: true }, { modern: true, readonly: false }]) {
    const modelValue = { gift: false, finish: "Natural" };
    const product = { inputs: [
      { name: "text", title: "Engraving", default: "Native default" },
      { name: "gift", title: "Gift", type: "switch" },
      { name: "finish", title: "Finish", type: "select", selects: ["Natural", "Matte"] },
    ] };
    const result = await render({ ...props, product, modelValue });
    assert.doesNotMatch(result.html, /s-basket-product-inputs--modern-readonly/);
    assert.equal(modelValue.text, "Native default");
    assert.deepEqual(result.fields.map((field) => field.name), ["v-text-field", "u-smart-switch", "v-select"]);
    result.fields.forEach((field) => assert.equal(field.attrs.disabled, props.readonly));
    assert.equal(result.fields[1].attrs.modelValue, false);
    assert.equal(result.fields[2].attrs.modelValue, "Natural");
    assert.equal(result.copied.length, 0);
  }
});

test("projected attachments retain native download permission and read-only deletion guards", async () => {
  const values = {
    product: { inputs: [{ name: "artwork", title: "Artwork", type: "file" }] },
    uploadedFiles: [{ id: 8, key: "artwork", filename: "recorded-artwork.pdf", size: 24 }],
  };
  const allowed = await render({ ...values, isAdmin: true });
  assert.match(allowed.html, /Artwork/);
  assert.match(allowed.html, /recorded-artwork.pdf/);
  assert.match(allowed.html, /download/);
  assert.doesNotMatch(allowed.html, />close<|data-native="v-file-input"/);
  const denied = await render({ ...values, isAdmin: false });
  assert.match(denied.html, /recorded-artwork.pdf/);
  assert.doesNotMatch(denied.html, /download/);
  const omitted = await render({ product: values.product });
  assert.match(omitted.html, /s-basket-product-inputs__field--empty/);
  assert.doesNotMatch(omitted.html, /download|Not provided/);
});
