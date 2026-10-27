const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { parse, compileTemplate } = require('@vue/compiler-sfc');
const ts = require('typescript');
const vue = require('vue');

let direction = 'ltr';
function load(file) {
  const source = fs.readFileSync(file, 'utf8');
  const { descriptor, errors } = parse(source);
  assert.deepEqual(errors, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file, id: 'controls-check' }).errors, []);
  const code = ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: name => name === 'lodash-es' ? { isFunction: value => typeof value === 'function' } : require(name), getComputedStyle: () => ({ direction }) });
  return exports.default;
}
function key(value) {
  return { key: value, prevented: false, preventDefault() { this.prevented = true; } };
}
function singleFixture(component, overrides = {}) {
  const props = vue.reactive({ accessible: true, forceShowAll: true, disabled: false, readonly: false, loading: false, clearable: false, modelValue: 'a', itemValue: 'id', items: [{ id: 'a' }, { id: 'blocked', disabled: true }, { id: 'c' }], ...overrides });
  const events = [], focus = [];
  const state = component.setup(props, { emit: (...event) => events.push(event) });
  state.selectRoot.value = { querySelectorAll: () => props.items.map((_, index) => ({ focus: () => focus.push(index) })) };
  return { props, state, events, focus };
}
async function main() {
  const single = load(path.join(__dirname, 'USmartSelect.vue'));
  const multi = load(path.join(__dirname, '../multi-select/USmartMultiSelect.vue'));
  let fixture = singleFixture(single);
  assert.equal(fixture.state.tabStopItem.value.id, 'a');
  fixture.state.onKeydown(key('ArrowDown'), fixture.props.items[0]);
  assert.equal(fixture.state.localModelValue.value, 'c');
  assert.deepEqual(fixture.events.map(event => event[0]), ['update:modelValue']);
  await vue.nextTick();
  assert.deepEqual(fixture.events.map(event => event[0]), ['update:modelValue', 'change']);
  assert.deepEqual(fixture.focus, [2]);
  direction = 'rtl';
  fixture.state.onKeydown(key('ArrowRight'), fixture.props.items[2]);
  assert.equal(fixture.state.localModelValue.value, 'a');
  fixture.state.onKeydown(key('ArrowLeft'), fixture.props.items[0]);
  assert.equal(fixture.state.localModelValue.value, 'c');
  fixture.state.onKeydown(key('Home'), fixture.props.items[2]);
  assert.equal(fixture.state.localModelValue.value, 'a');
  fixture.state.onKeydown(key('End'), fixture.props.items[0]);
  assert.equal(fixture.state.localModelValue.value, 'c');
  for (const blocked of [{ disabled: true }, { readonly: true }, { loading: true }]) {
    fixture = singleFixture(single, blocked);
    fixture.state.onClickItem(fixture.props.items[2]);
    fixture.state.onKeydown(key('ArrowDown'), fixture.props.items[0]);
    fixture.state.onKeydown(key(' '), fixture.props.items[2]);
    assert.equal(fixture.events.length, 0);
  }
  fixture = singleFixture(single);
  fixture.state.onClickItem(fixture.props.items[1]);
  fixture.state.onKeydown(key('Enter'), fixture.props.items[1]);
  assert.equal(fixture.events.length, 0);
  fixture = singleFixture(single, { modelValue: undefined });
  assert.equal(fixture.state.tabStopItem.value.id, 'a');
  fixture = singleFixture(single, { clearable: true });
  fixture.state.onKeydown(key(' '), fixture.props.items[0]);
  assert.equal(fixture.state.localModelValue.value, undefined);
  fixture = singleFixture(single, { accessible: false });
  fixture.state.onKeydown(key('ArrowDown'), fixture.props.items[0]);
  assert.equal(fixture.events.length, 0);
  fixture.state.onClickItem(fixture.props.items[2]);
  assert.equal(fixture.state.localModelValue.value, 'c');

  const choices = ['a'];
  choices.toggle = function(value) { const index = this.indexOf(value); index < 0 ? this.push(value) : this.splice(index, 1); };
  const events = [];
  const context = { accessible: true, disabled: false, loading: false, modelValue: choices, itemValue: 'id', items: [{ id: 'a' }, { id: 'b' }, { id: 'blocked', disabled: true }], $emit: (name, value) => events.push([name, [...value]]), signalUpdate() {} };
  context.toggle = multi.methods.toggle.bind(context);
  multi.methods.onKeydown.call(context, key(' '), context.items[0]);
  assert.deepEqual([...choices], []);
  assert.deepEqual(events.map(event => event[0]), ['update:modelValue', 'change']);
  multi.methods.onKeydown.call(context, key('Enter'), context.items[1]);
  assert.deepEqual([...choices], ['b']);
  context.toggle('blocked');
  assert.deepEqual([...choices], ['b']);
  for (const property of ['disabled', 'loading']) {
    context[property] = true;
    const count = events.length;
    context.toggle('a');
    multi.methods.onKeydown.call(context, key(' '), context.items[1]);
    assert.equal(events.length, count);
    context[property] = false;
  }
  context.accessible = false;
  multi.methods.onKeydown.call(context, key(' '), context.items[1]);
  assert.deepEqual([...choices], ['b']);
  assert.equal(single.props.accessible.default, false);
  assert.equal(multi.props.accessible.default, false);
  console.log('Both templates compile; keyboard, focus, RTL, event timing, disabled/readonly/loading guards, independent selection, empty selection, and opt-in defaults pass.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
