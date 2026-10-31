import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const directory = new URL("./", import.meta.url);
const plain = (value) => JSON.parse(JSON.stringify(value));

function component(relative) {
  const filename = new URL(relative, directory);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename: fileURLToPath(filename) });
  assert.deepEqual(errors, []);
  const script = ts.transpileModule(descriptor.script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true,
  });
  assert.deepEqual(script.diagnostics, []);
  const exports = {};
  vm.runInNewContext(script.outputText, { exports, require: () => ({ default: {} }) });
  return exports.default;
}

function fixture(definition, props = {}) {
  const emitted = [];
  const state = { ...(definition.data?.() || {}), ...props, $t: (key) => key, $emit: (...args) => emitted.push(args) };
  for (const [name, method] of Object.entries(definition.methods || {})) state[name] = method.bind(state);
  for (const [name, value] of Object.entries(definition.computed || {})) {
    const getter = typeof value === "function" ? value : value.get;
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  }
  return { state, emitted };
}

const builder = component("BListingFormBuilder.vue");

test("legacy model data loads without adding field defaults or mutating the caller", () => {
  const source = [{ title: "Legacy", items: [{ title: "Item" }], custom: { keep: true } }];
  const before = plain(source);
  const { state, emitted } = fixture(builder);
  builder.watch.modelValue.handler.call(state, source);
  assert.ok(state.slidesLocal[0].id);
  assert.equal(state.slidesLocal[0].field, undefined);
  assert.deepEqual(plain(state.slidesLocal[0].custom), { keep: true });
  assert.deepEqual(source, before);
  assert.equal(emitted.length, 0);
});

test("adding and editing a step emit independent copies with the existing schema", () => {
  const { state, emitted } = fixture(builder);
  state.addSlide();
  assert.equal(state.selectedSlide.field.type, "text");
  assert.equal(state.selectedSlide.layout, "split_right");
  const saved = emitted.at(-1)[1];
  state.onUpdateSlide({ ...state.selectedSlide, title: "Changed", custom: { retained: 7 } });
  assert.equal(saved[0].title, "");
  assert.equal(state.selectedSlide.title, "Changed");
  assert.deepEqual(plain(state.selectedSlide.custom), { retained: 7 });
});

test("duplicate regenerates step and field identities while preserving option keys and data", () => {
  const { state } = fixture(builder);
  builder.watch.modelValue.handler.call(state, [{ id: "original", field: { uid: "field", name: "stable_key", type: "select", options: [{ id: "option", image: "image-path", value: "A" }] }, faqs: [{ q: "Why?", a: "Because" }], custom: [1, 2] }]);
  state.duplicateSlide("original");
  const [original, copy] = state.slidesLocal;
  assert.notEqual(copy.id, original.id);
  assert.notEqual(copy.field.uid, original.field.uid);
  assert.equal(copy.field.name, "stable_key");
  assert.deepEqual(plain(copy.field.options), plain(original.field.options));
  assert.deepEqual(plain(copy.faqs), plain(original.faqs));
  assert.deepEqual(plain(copy.custom), [1, 2]);
  assert.equal(state.selectedId, copy.id);
});

test("move actions accept numeric and named directions and refuse the boundary", () => {
  const { state } = fixture(builder);
  builder.watch.modelValue.handler.call(state, [{ id: "a" }, { id: "b" }, { id: "c" }]);
  state.moveSlide({ id: "b", dir: -1 });
  assert.deepEqual(plain(state.slidesLocal.map(s => s.id)), ["b", "a", "c"]);
  state.moveSlide({ id: "b", dir: "up" });
  assert.deepEqual(plain(state.slidesLocal.map(s => s.id)), ["b", "a", "c"]);
  state.moveSlide({ id: "b", dir: "down" });
  assert.deepEqual(plain(state.slidesLocal.map(s => s.id)), ["a", "b", "c"]);
});

test("the step rail refreshes edited titles even when IDs and order are unchanged", () => {
  const list = component("parts/BListingFormBuilderSlideList.vue");
  const { state } = fixture(list, { slides: [{ id: "a", title: "Before" }] });
  list.watch.slides.handler.call(state);
  state.slides = [{ id: "a", title: "After" }];
  list.watch.slides.handler.call(state);
  assert.equal(state.localSlides[0].title, "After");
  state.localSlides.push({ id: "local" });
  assert.equal(state.slides.length, 1);
});

test("information steps retain their input and preserve legacy info/FAQ schema locations", () => {
  const editor = component("parts/BListingFormBuilderSlideEditor.vue");
  const { state } = fixture(editor, { local: { id: "a", type: "field", field: { name: "key", type: "text" }, info: { items: [] }, faq: [] } });
  state.onChangeSlideType("info");
  assert.equal(state.local.field.name, "key");
  state.onChangeSlideType("field");
  assert.equal(state.local.field.name, "key");
  state.onUpdateInfoItems([{ id: "i", title: "Information", description: "Details", image: "image-path" }]);
  assert.equal(state.local.info.items[0].title, "Information");
  assert.equal(state.local.info_items, undefined);
  state.onUpdateFaqs([{ id: "q", question: "Question?", answer: "Answer" }]);
  assert.equal(state.local.faq[0].q, "Question?");
  assert.equal(state.local.faqs, undefined);
});

test("field presets retain official names, chips multiple selection and blank number bounds", () => {
  const editor = component("parts/fields/BListingFormBuilderFieldEditor.vue");
  const { state } = fixture(editor, { local: { uid: "u", title: "Question", name: "stable", required: true } });
  state.onTypeChange("select:chips");
  assert.equal(state.local.multiple, true);
  assert.equal(state.local.variant, "chips");
  assert.equal(state.local.options.length, 1);
  state.onTypeChange("official:contact");
  assert.equal(state.local.name, "contact");
  assert.equal(state.local.title, "Question");
  state.onTypeChange("number");
  assert.equal(state.local.min, null);
  assert.equal(state.local.max, null);
});

test("all builder components, templates and scoped styles compile", async () => {
  const files = ["BListingFormBuilder.vue", ...readdirSync(new URL("parts/", directory)).filter(f => f.endsWith(".vue")).map(f => "parts/" + f), ...readdirSync(new URL("parts/fields/", directory)).filter(f => f.endsWith(".vue")).map(f => "parts/fields/" + f)];
  for (const file of files) {
    const filename = fileURLToPath(new URL(file, directory));
    const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
    assert.deepEqual(errors, [], file);
    const compiled = compileScript(descriptor, { id: "listing-builder-test" });
    assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: "listing-builder-test", compilerOptions: { bindingMetadata: compiled.bindings } }).errors, [], file);
    for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({ source: style.content, filename, id: "listing-builder-test", scoped: style.scoped, preprocessLang: style.lang })).errors, [], file);
  }
});
