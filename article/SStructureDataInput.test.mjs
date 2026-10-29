import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import test from 'node:test';
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import ts from 'typescript';

const filename = fileURLToPath(new URL('./SStructureDataInput.vue', import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: 'structure-input-test' });
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: 'structure-input-test', compilerOptions: { bindingMetadata: script.bindings } }).errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, filename, id: 'structure-input-test', scoped: style.scoped, preprocessLang: style.lang }).errors, []);
const exports = {};
vm.runInNewContext(ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports, require: () => ({ default: {} }) });
const component = exports.default;
const plain = value => JSON.parse(JSON.stringify(value));
function fixture(props = {}) {
  const events = [];
  const state = { ...component.data(), workspace: true, modelValue: undefined, name: 'step', type: ['@HowToStep'], label: '', $: { uid: 1 }, $t: key => key, $nextTick() {}, ...props,
    $emit(name, value) { events.push([name, value]); },
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  return { state, events };
}

test('workspace mounting never creates values or silently overwrites saved nested JSON', () => {
  for (const type of ['text', 'duration', '@Person', '@Book', ['@HowToStep']]) {
    const f = fixture({ type }); component.created.call(f.state);
    assert.equal(f.events.length, 0);
    assert.equal(f.state.modelValue, undefined);
  }
  const saved = { '@type': 'Person', name: 'Saved', custom: true };
  const f = fixture({ type: '@Person', modelValue: saved }); component.created.call(f.state);
  assert.deepEqual(saved, { '@type': 'Person', name: 'Saved', custom: true });
});

test('passive child mount defaults cannot populate the draft, including saved nested fields', () => {
  for (const [type, modelValue, defaultValue] of [['number', undefined, 0], ['currency', undefined, null], ['number', 7, 0], ['currency', 'USD', null]]) {
    const f = fixture({ type, modelValue });
    f.state.onInput(defaultValue);
    assert.equal(f.events.length, 0, `${type} mount emission is ignored before user interaction`);
    assert.equal(f.state.modelValue, modelValue);
  }
});

test('real user editing can enter zero and clear a stored currency while no-op emissions stay quiet', () => {
  const number = fixture({ type: 'number', modelValue: undefined });
  number.state.inputTouched = true;
  number.state.onInput(0);
  assert.deepEqual(number.events[0], ['update:modelValue', 0]);
  const currency = fixture({ type: 'currency', modelValue: 'USD' });
  currency.state.inputTouched = true;
  currency.state.onInput(null);
  assert.deepEqual(currency.events[0], ['update:modelValue', null]);
  currency.state.onInput('USD');
  assert.equal(currency.events.length, 1);
  currency.state.modelValue = undefined;
  currency.state.onInput(null);
  assert.equal(currency.events.length, 1);
});

test('array operations create correctly typed entries without changing the supplied array', () => {
  const f = fixture({ modelValue: [] });
  f.state.addItem();
  assert.deepEqual(plain(f.events[0]), ['update:modelValue', [{ '@type': 'HowToStep' }]]);
  assert.equal(f.state.modelValue.length, 0);
  f.state.modelValue = [{ '@type': 'HowToStep', name: 'First' }, { '@type': 'HowToStep', name: 'Second' }];
  f.state.updateItem(0, { '@type': 'HowToStep', name: 'Updated' });
  assert.equal(f.state.modelValue[0].name, 'First');
  assert.equal(f.events[1][1][0].name, 'Updated');
  f.state.removeItem(0);
  assert.equal(f.state.modelValue.length, 2);
  assert.equal(f.events[2][1][0].name, 'Second');
});

test('object updates preserve extra saved properties and the canonical nested type', () => {
  const f = fixture({ type: '@Book', modelValue: { '@type': 'Book', isbn: '123', custom: { keep: true } } });
  f.state.updateProperty('bookEdition', 'Second');
  assert.deepEqual(plain(f.events[0][1]), { '@type': 'Book', isbn: '123', custom: { keep: true }, bookEdition: 'Second' });
  assert.equal(f.state.modelValue.bookEdition, undefined);
});

test('adding an entry focuses its first editable field after rendering', () => {
  let afterRender, focused = false;
  const f = fixture({ modelValue: [], $nextTick(callback) { afterRender = callback; }, $el: { querySelectorAll() { return [{ querySelector() { return { focus() { focused = true; } }; } }]; } } });
  f.state.addItem();
  assert.equal(focused, false);
  afterRender();
  assert.equal(focused, true);
});

test('all recursive blueprints remain available including Offer countries and Book editions', () => {
  const f = fixture();
  assert.deepEqual(plain(f.state.blueprints['@Offer'].eligibleRegion), ['@Country']);
  assert.equal(f.state.blueprints['@Book'].isbn, 'text');
  assert.equal(f.state.blueprints['@Book'].bookEdition, 'text');
  assert.equal(f.state.blueprints['@Organization'].sameAs, 'url');
  for (const type of Object.values(f.state.blueprints).flatMap(blueprint => Object.values(blueprint))) {
    const child = Array.isArray(type) ? type[0] : type;
    if (typeof child === 'string' && child.startsWith('@')) assert.ok(f.state.blueprints[child], child);
  }
  f.state.type = '@HowToStep';
  assert.deepEqual(Object.keys(f.state.editableBlueprint), ['name', 'text', 'url', 'itemListElement', 'image']);
  assert.ok(!('@type' in f.state.editableBlueprint));
});

test('legacy initialization retains the existing eager value contract', () => {
  const f = fixture({ workspace: false, type: '@Person' });
  component.created.call(f.state);
  assert.deepEqual(plain(f.events[0]), ['update:modelValue', { '@type': 'Person' }]);
});
