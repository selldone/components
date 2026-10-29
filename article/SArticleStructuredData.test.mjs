import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import ts from "typescript";

// Exercise the real SFC with JSON-only fixtures; no application or API is started.
const filename = fileURLToPath(new URL("./SArticleStructuredData.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "article-structures-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "article-structures-test", compilerOptions: { bindingMetadata: compiled.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({
  source: style.content, filename, id: "article-structures-test", scoped: style.scoped, preprocessLang: style.lang,
}).errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {}, templateExports = {};
const passthrough = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
vm.runInNewContext(transpile(descriptor.script.content), {
  exports, require(name) { return name.endsWith(".svg") ? name : { default: passthrough }; },
});
vm.runInNewContext(transpile(template.code), { exports: templateExports, require: () => Vue });
const component = exports.default;
const plain = (value) => JSON.parse(JSON.stringify(value));
const book = () => ({ "@context": "https://schema.org", "@type": "Book", name: "Saved book", author: { "@type": "Person", name: "Saved author" }, workExample: [{ name: "First edition" }] });

function fixture(props = {}) {
  const events = [], removals = [];
  const state = { ...component.data(), workspace: true, editMode: true, modelValue: [book()], ...props,
    $t: (key) => key,
    $emit(name, value) { events.push([name, value]); if (name === "update:modelValue") state.modelValue = value; },
    remove(list, value) { removals.push([list, value]); list.splice(list.indexOf(value), 1); },
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  return { state, events, removals };
}
async function render(f) {
  const data = Object.fromEntries(Object.keys(component.data()).map((key) => [key, f.state[key]]));
  const app = Vue.createSSRApp({ ...component, data: () => data, render: templateExports.render }, {
    workspace: f.state.workspace, editMode: f.state.editMode, modelValue: f.state.modelValue,
  });
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.$vuetify = { display: { smAndDown: false } };
  app.directive("copy", {});
  for (const tag of new Set(Array.from(descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g), ([, tag]) => tag))) {
    if (tag !== "v-dialog") app.component(tag, passthrough);
  }
  app.component("v-dialog", { props: ["modelValue"], render() { return this.modelValue ? Vue.h("div", this.$slots.default?.()) : null; } });
  return renderToString(app);
}

test("workspace remains opt-in and legacy edits retain their original mutation pipeline", () => {
  assert.equal(component.props.workspace.default, false);
  const f = fixture({ workspace: false, editMode: false });
  const original = f.state.modelValue[0];
  f.state.showDialog(original);
  assert.equal(f.state.dialog, true);
  assert.equal(f.state.structure_data, original);
  f.state.structure_data.author.name = "Legacy author";
  f.state.saveChange();
  assert.equal(original.author.name, "Legacy author");
  assert.equal(f.events.length, 0);
  f.state.removeStructure(original);
  assert.equal(f.removals.length, 1);
  assert.equal(f.state.modelValue.length, 0);
});

test("workspace editing isolates nested values until confirmation and cancellation discards them", () => {
  const f = fixture(); const original = f.state.modelValue[0], before = plain(original);
  f.state.showDialog(original);
  assert.notEqual(f.state.structure_data, original);
  f.state.structure_data.author.name = "Unsaved author";
  f.state.structure_data.workExample.push({ name: "Unsaved edition" });
  assert.deepEqual(plain(original), before);
  f.state.closeDialog();
  assert.deepEqual(plain(original), before);
  assert.equal(f.state.structure_data, null);
  assert.equal(f.events.length, 0);
  f.state.showDialog(original);
  f.state.structure_data.author.name = "Confirmed author";
  f.state.saveChange();
  assert.equal(f.state.modelValue[0].author.name, "Confirmed author");
  assert.deepEqual(plain(original), before);
  assert.deepEqual(f.events.map(([name]) => name), ["update:modelValue", "change"]);
});

test("new workspace structures keep the existing type and array model contract", () => {
  const f = fixture(); f.state.showDialog(); f.state.saveChange();
  assert.equal(f.state.modelValue.length, 1, "No structure is added before a schema is selected");
  f.state.selectType(f.state.types.find((type) => type["@type"] === "Course"));
  f.state.structure_data.name = "Course title";
  f.state.saveChange();
  assert.deepEqual(plain(f.state.modelValue[1]), { "@context": "https://schema.org", "@type": "Course", name: "Course title" });
  assert.equal(f.events.filter(([name]) => name === "change").length, 1);
  const empty = fixture({ modelValue: null });
  empty.state.showDialog(); empty.state.selectType(empty.state.types[0]); empty.state.saveChange();
  assert.equal(empty.events[0][0], "update:modelValue");
  assert.equal(empty.state.modelValue.length, 1);
  assert.equal(empty.events[1][0], "change");
});

test("readonly workspace initialization and methods cannot change the article model", () => {
  const f = fixture({ editMode: false, modelValue: null });
  component.created.call(f.state);
  f.state.showDialog(); f.state.selectType(f.state.types[0]); f.state.saveChange(); f.state.removeStructure(book());
  assert.equal(f.state.modelValue, null);
  assert.equal(f.state.dialog, false);
  assert.equal(f.events.length, 0);
});

test("permission loss blocks pending mutation even before the watcher closes its dialog", () => {
  const f = fixture(), original = f.state.modelValue[0], before = plain(original);
  f.state.showDialog(original); f.state.structure_data.author.name = "Forbidden";
  f.state.editMode = false;
  f.state.selectType(f.state.types[1]); f.state.saveChange(); f.state.removeStructure(original);
  assert.deepEqual(plain(original), before);
  assert.equal(f.state.modelValue.length, 1);
  assert.equal(f.events.length, 0);
  component.watch.editMode.call(f.state, false);
  assert.equal(f.state.dialog, false);
  assert.equal(f.state.structure_data, null);
});

test("replacing the parent model or removing its selected entry invalidates pending edits", () => {
  const f = fixture(); f.state.showDialog(f.state.modelValue[0]);
  const previous = f.state.modelValue;
  f.state.modelValue = [book()]; f.state.saveChange();
  assert.equal(f.events.length, 0);
  component.watch.modelValue.call(f.state, f.state.modelValue, previous);
  assert.equal(f.state.dialog, false);
  f.state.showDialog(f.state.modelValue[0]); f.state.modelValue.splice(0, 1); f.state.saveChange();
  assert.equal(f.state.modelValue.length, 0);
  assert.equal(f.events.length, 0);
});

test("workspace removal updates the existing array once and emits a dirty notification", () => {
  const f = fixture(); const original = f.state.modelValue[0];
  f.state.removeStructure(original); f.state.removeStructure(original);
  assert.equal(f.state.modelValue.length, 0);
  assert.equal(f.events.length, 2);
  assert.equal(f.events[0][0], "update:modelValue");
  assert.equal(f.events[1][0], "change");
  assert.equal(f.removals.length, 0);
});

test("rendered workspace keeps saved structures visible and hides readonly mutation controls", async () => {
  const readonly = await render(fixture({ editMode: false }));
  assert.match(readonly, /global.article.workspace.structure_title/);
  assert.match(readonly, /Saved book/);
  assert.doesNotMatch(readonly, /delete_outline|prepend-icon="add"|widget-box/);
  assert.match(readonly, /structure_json/);
  const editable = await render(fixture());
  assert.match(editable, /delete_outline/);
  assert.match(editable, /prepend-icon="add"/);
  const legacy = await render(fixture({ workspace: false, editMode: false }));
  assert.match(legacy, /Structured data/);
  assert.match(legacy, /widget-box/);
  assert.match(legacy, /absolute-top-end/);
});

test("changing a new type and closing typed data both require a deliberate discard", () => {
  const f = fixture();
  f.state.showDialog(); f.state.selectType(f.state.types[0]);
  assert.equal(f.state.dialogDirty, false);
  f.state.structure_data.name = 'Typed title';
  assert.equal(f.state.dialogDirty, true);
  f.state.changeType();
  assert.equal(f.state.pendingAction, 'type');
  assert.equal(f.state.structure_data.name, 'Typed title');
  f.state.discardPending();
  assert.equal(f.state.selected_type, null);
  f.state.selectType(f.state.types.find(type => type['@type'] === 'Recipe'));
  assert.equal(f.state.structure_data['@type'], 'Recipe');
  f.state.structure_data.name = 'Recipe'; f.state.requestClose();
  assert.equal(f.state.dialog, true);
  assert.equal(f.state.pendingAction, 'close');
  f.state.discardPending();
  assert.equal(f.state.dialog, false);
  assert.equal(f.state.modelValue.length, 1);
});

test("an existing type is fixed and unrecognized stored schemas stay available through JSON", async () => {
  const f = fixture(); f.state.showDialog(f.state.modelValue[0]);
  f.state.selectType(f.state.types[1]); f.state.changeType();
  assert.equal(f.state.selected_type['@type'], 'Book');
  assert.equal(f.state.structure_data['@type'], 'Book');
  const custom = { '@type': 'CustomType', extension: { keep: [1, 2] } };
  const read = fixture({ modelValue: [custom], editMode: false });
  read.state.showJson(custom);
  assert.equal(read.state.jsonView, true);
  assert.equal(read.state.dialogDirty, false);
  read.state.saveChange();
  assert.deepEqual(plain(read.state.modelValue), [custom]);
  assert.match(await render(read), /CustomType/);
});

test("tab visibility hides a staged dialog without throwing away typed data", () => {
  const f = fixture({ active: true }); f.state.showDialog(f.state.modelValue[0]);
  f.state.structure_data.name = 'Pending title';
  f.state.active = false;
  assert.equal(f.state.dialog, true);
  assert.equal(f.state.dialogDirty, true);
  assert.equal(f.state.structure_data.name, 'Pending title');
  component.watch.dialogDirty.call(f.state, true);
  assert.deepEqual(f.events[0], ['pending-change', true]);
});
