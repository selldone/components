import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { JSDOM } from "jsdom";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

const filename = new URL("./SArticleFaqs.vue", import.meta.url).pathname;
const { descriptor, errors } = parse(readFileSync(new URL("./SArticleFaqs.vue", import.meta.url), "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "faq-test" });
const template = compileTemplate({ source: descriptor.template.content, filename, id: "faq-test", compilerOptions: { bindingMetadata: compiled.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, filename, id: "faq-test", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
const exports = {};
vm.runInNewContext(ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports, require: () => ({ InlineEditorMixin: {} }),
});
const component = exports.default;
assert.equal(component.props.workspace.default, false);
function fixture(editMode = true) {
  const events = [];
  const state = { workspace: true, editMode, faqs: [{ question: "One", answer: "First" }, { question: "Two", answer: "Second" }], question: "Three", answer: "Third", $emit: (name) => events.push(name), $vuetify: { display: { mdAndUp: true } }, remove: (list, item) => list.splice(list.indexOf(item), 1) };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  return { state, events };
}
const writable = fixture();
writable.state.moveDown(writable.state.faqs[0]);
assert.equal(writable.state.faqs[0].question, "Two");
writable.state.moveUp(writable.state.faqs[1]);
assert.equal(writable.state.faqs[0].question, "One");
writable.state.removeFaq(writable.state.faqs[0]);
writable.state.add();
assert.deepEqual(writable.state.faqs.map((faq) => faq.question), ["Two", "Three"]);
assert.equal(writable.events.filter((event) => event === "change").length, 4);
const readonly = fixture(false);
readonly.state.add();
readonly.state.moveDown(readonly.state.faqs[0]);
readonly.state.moveUp(readonly.state.faqs[1]);
readonly.state.removeFaq(readonly.state.faqs[0]);
readonly.state.onChange();
assert.deepEqual(readonly.state.faqs.map((faq) => faq.question), ["One", "Two"]);
assert.deepEqual(readonly.events, []);
console.log("SArticleFaqs: compiler, workspace mutation guards and dirty events passed.");

const templateExports = {};
vm.runInNewContext(ts.transpileModule(template.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
  exports: templateExports, require: () => Vue,
});

async function renderReader(faqs, workspace = false) {
  const events = [], panelChanges = [];
  const app = Vue.createSSRApp({ ...component, render: templateExports.render }, {
    faqs, workspace, editMode: false,
    "onUpdate:faqs": (value) => events.push(["update:faqs", value]),
    onChange: () => events.push(["change"]),
  });
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $vuetify: { display: { mdAndUp: true }, locale: { isRtl: false } },
  });
  const pass = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
  for (const tag of ["v-slide-y-reverse-transition", "v-expansion-panel", "v-expansion-panel-title", "v-expansion-panel-text", "v-icon"]) app.component(tag, pass);
  app.component("v-expansion-panels", {
    props: ["modelValue"],
    created() { panelChanges.push((value) => this.$emit("update:modelValue", value)); },
    render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); },
  });
  app.component("v-btn", { render() { return Vue.h("button", this.$attrs, this.$slots.default?.()); } });
  app.component("v-text-field", { render() { return Vue.h("input", this.$attrs); } });
  app.component("v-textarea", { render() { return Vue.h("textarea", this.$attrs); } });
  const html = await renderToString(app);
  return { html, document: new JSDOM(html).window.document, events, panelChanges };
}

test("public reader renders persisted question order and rich answer HTML without escaping or mutations", async () => {
  // This is the API's saved array shape after server tag filtering, not an editor draft.
  const faqs = [
    { question: "Second question moved first", answer: '<p>Pricing &amp; setup: <strong>Strong</strong>, <b>bold</b>, <i>italic</i>.</p><ol><li>Connect account</li><li>Read <a href="https://selldone.test/docs">the guide</a>.</li></ol>' },
    { question: "First question moved second", answer: "<p>Keep this answer <strong>second</strong>.</p>" },
    { question: "Why < should stay text & how?", answer: "<p>Third answer.</p>" },
  ];
  for (const faq of faqs) Object.freeze(faq);
  Object.freeze(faqs);
  const snapshot = JSON.stringify(faqs);

  for (const workspace of [false, true]) {
    const reader = await renderReader(faqs, workspace);
    const questions = [...reader.document.querySelectorAll(".faq-item .question > div")];
    const answers = [...reader.document.querySelectorAll(".faq-item .answer > div")];
    assert.deepEqual(questions.map((question) => question.textContent), faqs.map((faq) => faq.question));
    assert.deepEqual(answers.map((answer) => answer.innerHTML), faqs.map((faq) => faq.answer));
    assert.equal(questions[2].children.length, 0);
    assert.equal(answers[0].querySelector("strong").textContent, "Strong");
    assert.equal(answers[0].querySelector("b").textContent, "bold");
    assert.equal(answers[0].querySelector("i").textContent, "italic");
    assert.deepEqual([...answers[0].querySelectorAll("ol > li")].map((item) => item.textContent), ["Connect account", "Read the guide."]);
    assert.equal(answers[0].querySelector("a").getAttribute("href"), "https://selldone.test/docs");
    assert.match(answers[0].textContent, /Pricing & setup/);
    assert.doesNotMatch(reader.html, /&lt;(?:p|strong|ol|li|a)\b|&amp;amp;/);
    assert.equal(reader.document.querySelectorAll("button,input,textarea,[contenteditable],.editable,.widget-buttons").length, 0);
    reader.panelChanges[0]([]);
    reader.panelChanges[0]([0, 1]);
    assert.deepEqual(reader.events, []);
    assert.equal(JSON.stringify(faqs), snapshot);
  }
});

test("empty persisted reader renders no FAQ heading, editing controls or parent changes", async () => {
  const reader = await renderReader(Object.freeze([]));
  assert.equal(reader.document.querySelectorAll(".faq-item,.hr-text,button,input,textarea,[contenteditable]").length, 0);
  assert.deepEqual(reader.events, []);
});
