import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

const filename = fileURLToPath(new URL("./BAiAutoTranslate.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const bindings = compileScript(descriptor, { id: "auto-translate-test" }).bindings;
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "auto-translate-test", compilerOptions: { bindingMetadata: bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content,
  filename, id: "auto-translate-test", scoped: true, preprocessLang: style.lang }).errors, []);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function stub(name) {
  return Vue.defineComponent({ name, inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const record = { name, attrs, text: "" };
      Vue.inject("records").push(record);
      return () => {
        const children = slots.default?.() || [];
        record.text = children.map(node => typeof node.children === "string" ? node.children : "").join("");
        return Vue.h("div", {}, children);
      };
    },
  });
}

async function render(props = {}, check) {
  const records = [], events = [], scriptExports = {}, renderExports = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports: scriptExports, require: () => ({ default: stub("USmartVerify") }),
  });
  vm.runInNewContext(transpile(template.code), {
    exports: renderExports, require: name => name === "vue" ? Vue : {},
  });
  const component = scriptExports.default;
  component.render = renderExports.render;
  if (check !== undefined) component.data = () => ({ check });
  const app = Vue.createSSRApp(component, {
    shop: { id: 7 }, modelValue: true, fromLanguage: "en", toLanguage: "fa", ...props,
    onRequestTranslate: value => events.push(["translate", value]),
    "onUpdate:modelValue": value => events.push(["model", value]),
  });
  app.provide("records", records);
  for (const name of ["v-bottom-sheet", "v-card", "v-card-title", "v-card-text", "v-card-actions", "v-btn", "v-icon", "v-list-subheader", "flag"]) app.component(name, stub(name));
  app.config.globalProperties.$t = (key, values) => key + (values ? JSON.stringify(values) : "");
  app.config.globalProperties.getLanguageObject = code => ({ title: code === "en" ? "English" : "فارسی", flag: code === "en" ? "us" : "ir" });
  const html = await renderToString(app);
  const button = key => records.find(record => record.name === "v-btn" && record.text.includes(key));
  return { html, records, events, button };
}

test("modern translation preserves source/target context, confirmation and exact request event", async () => {
  const view = await render({ modern: true });
  assert.match(view.html, /translate_dialog_subtitle.*English.*فارسی/);
  assert.doesNotMatch(view.html, /not free|early adopter|Enterprise-grade/);
  const confirm = view.records.find(record => record.name === "USmartVerify");
  assert.equal(confirm.attrs.modelValue, true);
  const translate = view.button("translate_dialog_action");
  assert.ok(translate);
  assert.equal(Boolean(translate.attrs.disabled), false);
  translate.attrs.onClick();
  assert.deepEqual(view.events, [["translate", "fa"]]);
  view.button("global.actions.cancel").attrs.onClick();
  assert.deepEqual(view.events.at(-1), ["model", false]);
});

test("unchecked or busy modern translation has a native disabled action and cannot emit", async () => {
  for (const [check, busy] of [[false, false], [true, true]]) {
    const view = await render({ modern: true, busy }, check);
    const translate = view.button("translate_dialog_action");
    assert.equal(translate.attrs.disabled, true);
    translate.attrs.onClick();
    assert.deepEqual(view.events, []);
    if (busy) {
      assert.equal(view.button("global.actions.cancel").attrs.disabled, true);
      assert.equal(view.records.find(record => record.name === "USmartVerify").attrs.disabled, true);
    }
  }
});

test("legacy callers keep their existing content, checked default and translation event", async () => {
  const view = await render();
  assert.match(view.html, /early adopter/);
  assert.doesNotMatch(view.html, /translate_dialog_title/);
  assert.equal(view.records.find(record => record.name === "USmartVerify").attrs.modelValue, true);
  const buttons = view.records.filter(record => record.name === "v-btn");
  buttons.at(-1).attrs.onClick();
  assert.deepEqual(view.events, [["translate", "fa"]]);
});
