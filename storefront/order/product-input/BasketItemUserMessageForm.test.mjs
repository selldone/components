import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate } from "@vue/compiler-sfc";

const file = new URL("./BasketItemUserMessageForm.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "basket-item-message-test",
});
assert.deepEqual(template.errors, []);

function evaluate(source, require) {
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  const exports = {};
  vm.runInNewContext(result.outputText, {
    exports,
    require,
    axios: new Proxy({}, {
      get: () => () => assert.fail("Read-only input rendering must not call HTTP"),
    }),
  });
  return exports;
}

const fieldCalls = [];
const htmlCalls = [];
const inputFields = Vue.defineComponent({
  name: "SBasketProductInputs",
  inheritAttrs: false,
  setup: (_, { attrs }) => () => {
    fieldCalls.push(attrs);
    return Vue.h("div", { "data-input-fields": "" });
  },
});
const component = evaluate(descriptor.script.content, (name) => {
  if (name.endsWith("SBasketProductInputs.vue")) return { default: inputFields };
  if (name.includes("HtmlHelper")) return {
    FORM_BUILDER_TAGS: [],
    SmartConvertTextToHtml: (value, ...options) => {
      htmlCalls.push({ value, options });
      return `<p data-converted>${String(value).replaceAll("<", "&lt;")}</p>`;
    },
  };
  return { default: {} };
}).default;
component.render = evaluate(template.code, () => Vue).render;

async function renderItem(item, props = {}) {
  fieldCalls.length = 0;
  htmlCalls.length = 0;
  let state;
  const app = Vue.createSSRApp({
    ...component,
    created() {
      component.created.call(this);
      state = {
        show: this.show,
        percent: this.fill_percent,
        files: this.uploaded_files,
        fieldCount: this.inputs_length,
      };
    },
  }, {
    basket: { items: [item] },
    product: item.product,
    variantId: item.variant_id,
    readonly: true,
    isAdmin: true,
    forceShow: true,
    ...props,
  });
  const passthrough = Vue.defineComponent({
    setup: (_, { slots }) => () => Vue.h("div", slots.default?.()),
  });
  for (const name of ["v-sheet", "v-expand-transition", "v-icon", "v-btn", "v-progress-linear"]) {
    app.component(name, passthrough);
  }
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.isBoolean = (value) => typeof value === "boolean";
  const html = await renderToString(app);
  assert.match(html, /data-input-fields/);
  assert.equal(state.show, true);
  assert.equal(fieldCalls.length, 1);
  assert.equal(fieldCalls[0].readonly, props.readonly ?? true);
  assert.equal(fieldCalls[0].modern, props.modern ?? false);
  assert.equal(fieldCalls[0]["is-admin"], true);
  assert.deepEqual({ ...fieldCalls[0].modelValue }, item.message);
  assert.doesNotMatch(html, /global\.basket_item_message\.save_actions/);
  return { ...state, html };
}

test("read-only input creation tolerates omitted files and preserves projected files and completed values", async () => {
  const item = {
    id: 17,
    product_id: 42,
    variant_id: null,
    product: {
      id: 42,
      inputs: [
        { name: "engraving", type: "text", title: "Engraving" },
        { name: "gift", type: "switch", title: "Gift" },
      ],
    },
    message: { engraving: "Customer text", gift: false },
  };
  const omitted = await renderItem(item);
  assert.deepEqual(Array.from(omitted.files), []);
  assert.equal(omitted.percent, 100);

  const empty = await renderItem({ ...item, message: {} });
  assert.equal(empty.percent, 0);

  const files = [{ id: 8, key: "artwork", filename: "artwork.pdf" }];
  const projected = await renderItem({
    ...item,
    product: {
      ...item.product,
      inputs: [{ name: "artwork", type: "file", title: "Artwork" }],
    },
    message: {},
    files,
  });
  assert.equal(projected.files, files);
  assert.equal(fieldCalls[0].uploadedFiles, files);
  assert.equal(projected.percent, 100);
});

test("forced note-only forms remain visible without a save action", async () => {
  const note = { name: "instructions", type: "note", title: "Packing instructions" };
  const item = {
    id: 17,
    product_id: 42,
    variant_id: null,
    product: { id: 42, inputs: [note] },
    message: {},
  };
  const result = await renderItem(item);
  assert.equal(result.fieldCount, 0);
  assert.equal(result.percent, 0);
  assert.equal(fieldCalls[0].product.inputs[0], note);
  // Notes are informational even when the containing storefront form is editable.
  await renderItem(item, { readonly: false });
});

test("legacy untyped text and forced product instructions are visible through the existing converter", async () => {
  const item = {
    id: 17,
    product_id: 42,
    variant_id: null,
    product: {
      id: 42,
      inputs: [{ name: "engraving", title: "Engraving" }],
      message: "Check spelling <before packing>",
    },
    message: { engraving: "Customer text" },
  };
  const result = await renderItem(item);
  assert.equal(result.fieldCount, 1);
  assert.equal(result.percent, 100);
  assert.equal(fieldCalls[0].product.inputs[0].name, "engraving");
  assert.match(result.html, /data-converted/);
  assert.match(result.html, /Check spelling &lt;before packing>/);
  assert.equal(htmlCalls.length, 1);
  assert.equal(htmlCalls[0].value, item.product.message);
  assert.deepEqual(Array.from(htmlCalls[0].options.slice(0, 2)), [false, false]);
});

test("modern read-only form forwards its opt-in without legacy forced-view padding or empty action footer", async () => {
  const item = {
    id: 17, product_id: 42, variant_id: null,
    product: { id: 42, inputs: [{ name: "engraving", type: "text", title: "Engraving" }] },
    message: { engraving: "Customer text" },
  };
  const modern = await renderItem(item, { modern: true });
  assert.match(modern.html, /basket-item-user-message-form--modern-readonly/);
  assert.doesNotMatch(modern.html, /max-w-640|widget-buttons|py-3 px-2/);
  assert.equal(fieldCalls[0].class, "");
  const legacy = await renderItem(item);
  assert.equal(fieldCalls[0].class, "max-w-640 mx-auto py-5");
  assert.match(legacy.html, /py-3 px-2/);
  assert.match(legacy.html, /widget-buttons/);
});
