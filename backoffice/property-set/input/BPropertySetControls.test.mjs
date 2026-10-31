import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import vm from 'node:vm';
import * as Vue from 'vue';
import { renderToString } from '@vue/server-renderer';
import { parse, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import ts from 'typescript';

const inputFile = new URL('./BPropertySetInput.vue', import.meta.url);
const previewFile = new URL('../preview/BProductPropertySetPreview.vue', import.meta.url);
const variantsFile = new URL('../../../../core-js/enums/product/ProductVariants.ts', import.meta.url);
const variantsSource = ts.createSourceFile('variants.ts', readFileSync(variantsFile, 'utf8'), ts.ScriptTarget.Latest, true);
const variantsCode = variantsSource.statements.filter(statement => {
  if (ts.isVariableStatement(statement)) return statement.declarationList.declarations.some(item => item.name.getText(variantsSource) === 'ProductVariants');
  return ts.isFunctionDeclaration(statement) && ['GetVariantNameByCode', 'GetVariantIconByCode'].includes(statement.name?.text);
}).map(statement => statement.getText(variantsSource)).join('\n');
const variantsExports = {};
vm.runInNewContext(ts.transpileModule(variantsCode, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: variantsExports });
const { ProductVariants, GetVariantNameByCode, GetVariantIconByCode } = variantsExports;
const nativeControl = kind => ({ props: ['modelValue', 'disabled', 'placeholder'], render() { return Vue.h('input', { 'data-native': kind, disabled: this.disabled, placeholder: this.placeholder }); } });

function component(file, extra = {}) {
  const { descriptor, errors } = parse(readFileSync(file, 'utf8'));
  assert.deepEqual(errors, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: 'property-set-controls-test' }).errors, []);
  for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, filename: file.pathname, id: 'property-set-controls-test', scoped: style.scoped, preprocessLang: style.lang }).errors, []);
  const ast = ts.createSourceFile('controls.ts', descriptor.script.content, ts.ScriptTarget.Latest, true);
  const options = ast.statements.find(ts.isExportAssignment).expression.getText(ast);
  const exports = {};
  vm.runInNewContext(ts.transpileModule('export default ' + options, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
    exports, defineComponent: Vue.defineComponent,
    ProductVariants, GetVariantNameByCode, GetVariantIconByCode,
    VAutocomplete: nativeControl('autocomplete'), VCombobox: nativeControl('combobox'),
    throttle: callback => callback, window: { SERACH_THROTTLE: 0 },
    require: () => 'legacy-example.jpg', ...extra,
  });
  return { ...exports.default, render: Vue.compile(descriptor.template.content) };
}

function inputFixture(patch = {}) {
  const requests = [], emitted = [], notices = [];
  const input = component(inputFile, {
    window: { SERACH_THROTTLE: 0, API: { GET_PROPERTY_SETS: shop => `/shop/${shop}/property-sets` } },
    axios: { get: (url, options) => new Promise((resolve, reject) => requests.push({ url, options, resolve, reject })) },
    NotificationService: { showLaravelError: error => notices.push(error) },
  });
  const state = {
    ...input.data(), modern: true, disabled: false, returnObject: true, modelValue: { id: 7, title: 'Clothing' },
    $shop: { id: 4 }, isObject: value => value !== null && typeof value === 'object',
    $emit: (...args) => emitted.push(args), ...patch,
  };
  for (const [key, method] of Object.entries(input.methods)) state[key] = method.bind(state);
  return { input, state, requests, emitted, notices };
}

test('modern control only emits valid explicit selections; default clear and legacy free text remain native', () => {
  const { state, emitted } = inputFixture();
  state.selectPropertySet('Unconfirmed text');
  state.selectPropertySet({ title: 'No persisted identity' });
  assert.equal(emitted.length, 0);
  state.selectPropertySet({ id: 9, title: 'Fabric choices' });
  state.selectPropertySet(null);
  assert.equal(emitted[0][1].id, 9);
  assert.equal(emitted[1][1], null);
  state.disabled = true;
  state.selectPropertySet({ id: 10 });
  assert.equal(emitted.length, 2, 'Parent saves freeze the selection');
  state.disabled = false;
  state.modern = false;
  state.selectPropertySet('Legacy free text');
  assert.equal(emitted.at(-1)[1], 'Legacy free text');
});

test('modern searches keep their bounded native shop query without changing the selected draft', async () => {
  const { state, requests, emitted } = inputFixture();
  state.search = 'fabric';
  const pending = state.getPropertySets();
  assert.equal(requests[0].url, '/shop/4/property-sets');
  assert.deepEqual({ ...requests[0].options.params }, { contain: 7, search: 'fabric', offset: 0, count: 20, with_samples: 3 });
  requests[0].resolve({ data: { property_sets: [{ id: 8, title: 'Fabric' }], total: 1 } });
  await pending;
  assert.equal(state.property_sets[0].id, 8);
  assert.equal(state.modelValue.id, 7);
  assert.equal(emitted.length, 0, 'A search cannot clear or replace the unsubmitted assignment');
  assert.equal(state.busy, false);
});

test('stale search completions cannot replace newer choices or clear their loading state', async () => {
  const { state, requests } = inputFixture();
  const old = state.getPropertySets();
  state.search = 'new';
  const current = state.getPropertySets();
  requests[0].resolve({ data: { property_sets: [{ id: 1, title: 'Old' }], total: 1 } });
  await old;
  assert.equal(state.property_sets.length, 0);
  assert.equal(state.busy, true);
  requests[1].resolve({ data: { property_sets: [{ id: 2, title: 'New' }], total: 1 } });
  await current;
  assert.equal(state.property_sets[0].id, 2);
  assert.equal(state.busy, false);
});

test('closing before search completion ignores the response and modern failures keep the selected draft', async () => {
  const { input, state, requests, emitted, notices } = inputFixture();
  const pending = state.getPropertySets();
  input.beforeUnmount.call(state);
  requests[0].resolve({ data: { property_sets: [{ id: 8 }], total: 1 } });
  await pending;
  assert.equal(state.property_sets.length, 0);
  assert.equal(emitted.length, 0);
  const failure = inputFixture();
  const rejected = failure.state.getPropertySets();
  failure.requests[0].reject(new Error('Search unavailable'));
  await rejected;
  assert.equal(failure.notices.length, 1);
  assert.equal(failure.state.modelValue.id, 7);
  assert.equal(failure.state.busy, false);
  assert.equal(notices.length, 0);
});

test('legacy search keeps return-object and ID hydration behavior', async () => {
  for (const returnObject of [true, false]) {
    const { state, requests, emitted } = inputFixture({ modern: false, returnObject });
    const pending = state.getPropertySets();
    requests[0].resolve({ data: { property_sets: [{ id: 7, title: 'Clothing' }], total: 1 } });
    await pending;
    assert.equal(returnObject ? emitted[0][1].id : emitted[0][1], 7);
  }
});

test('preview uses configured names, canonical icons and ordering, then appends only missing native axes', () => {
  const preview = component(previewFile);
  const propertySet = { title: 'Clothing', variants: [
    { code: 'type', name: 'Fabric', icon: 'layers' },
    { code: 'volume', name: 'Size', icon: 'straighten' },
    { code: 'invalid', name: 'Do not invent extra axes', icon: 'add' },
    { code: 'type', name: 'Duplicate', icon: 'close' },
  ] };
  const options = preview.computed.options.call({ propertySet, $t: value => value });
  assert.deepEqual(Array.from(options, item => item.code), ['type', 'volume', 'color', 'style', 'weight', 'pack']);
  assert.equal(options[0].name, 'Fabric');
  assert.equal(options[0].icon, 'layers');
  assert.equal(options[1].name, 'Size');
  assert.equal(options[2].name, ProductVariants.color.name);
  assert.equal(propertySet.variants.length, 4, 'Preview never rewrites the selected set');
});

test('default preview shows the six real native axes without illustrative products', async () => {
  const preview = component(previewFile);
  const html = await renderToString(Vue.createSSRApp(preview, { modern: true }).component('VIcon', { render() { return Vue.h('span', this.$slots.default?.()); } }).mixin({ methods: { $t: value => value } }));
  assert.equal((html.match(/<li>/g) || []).length, 6);
  assert.match(html, /global\.variants\.color/);
  assert.doesNotMatch(html, /Clothing|Digital Gadgets|Training Service|<img/);
});

test('modern and legacy selectors keep native Vuetify controls and the default placeholder', async () => {
  for (const modern of [true, false]) {
    const input = component(inputFile, { axios: { get: async () => ({ data: { property_sets: [], total: 0 } }) }, window: { SERACH_THROTTLE: 0, API: { GET_PROPERTY_SETS: () => '/fixture/property-sets' } } });
    const app = Vue.createSSRApp(input, { modern, modelValue: null });
    app.config.warnHandler = () => {};
    app.provide('$shop', { id: 1 });
    Object.assign(app.config.globalProperties, { $t: value => value, isObject: value => value !== null && typeof value === 'object' });
    const html = await renderToString(app);
    assert.match(html, modern ? /data-native="autocomplete"/ : /data-native="combobox"/);
    assert.equal(html.includes('product_property_set.modern.default_set'), modern);
    await setImmediate();
  }
});
