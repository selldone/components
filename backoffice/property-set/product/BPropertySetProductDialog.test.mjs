import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import vm from 'node:vm';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import * as Vue from 'vue';
import ts from 'typescript';

const file = new URL('./BPropertySetProductDialog.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, 'utf8'));
assert.deepEqual(errors, []);
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: 'property-set-dialog-test' }).errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

const makeSet = (id, title = 'Set ' + id) => ({ id, title, variants: [{ code: 'style', name: 'Pattern', icon: 'style' }] });

function fixture({ modern = true, vendor = false, open = true, assigned = makeSet(5), ...patch } = {}) {
  const requests = [], events = [], notices = [];
  const notifications = Object.fromEntries(['showSuccessAlert', 'showErrorAlert', 'showLaravelError'].map(name => [name, (...args) => notices.push({ name, args })]));
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'vue') return Vue;
      if (name.includes('NotificationService')) return { default: notifications };
      return { default: {} };
    },
    window: {
      API: { PUT_PRODUCT_SET_PROPERTY_SET: (shop, product) => `/shop/${shop}/product/${product}/property-set` },
      VAPI: { PUT_MY_VENDOR_PRODUCT_SET_PROPERTY_SET: (owner, product) => `/vendor/${owner}/product/${product}/property-set` },
    },
    axios: {
      put(url, payload) {
        return new Promise((resolve, reject) => requests.push({ url, payload, reject, resolve: data => resolve({ data }) }));
      },
    },
  });
  const component = exports.default;
  const state = {
    modern, modelValue: open,
    $shop: { id: 3 }, $vendor: { id: 4 },
    $product: { id: 9, shop_id: 3, vendor_id: vendor ? 4 : null, title: 'Fixture product', property_set_id: assigned?.id ?? null, property_set: assigned, quantity: 41, price: 100, product_variants: [{ id: 2, style: 'Floral', quantity: 41 }] },
    $route: { params: vendor ? { vendor_id: 4 } : {}, matched: vendor ? [{ meta: { vendor: true } }] : [] },
    $t: key => key,
    $emit: (...args) => events.push(args),
    $nextTick: callback => Promise.resolve().then(callback),
    ...patch,
  };
  Object.assign(state, component.data.call(state));
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed || {})) Object.defineProperty(state, name, { configurable: true, get: getter.bind(state) });
  component.created?.call(state);
  const watch = (name, next, previous) => {
    const entry = component.watch?.[name];
    if (typeof entry === 'function') entry.call(state, next, previous);
    else if (typeof entry?.handler === 'function') entry.handler.call(state, next, previous);
  };
  const setOpen = value => { const previous = state.modelValue; state.modelValue = value; watch('modelValue', value, previous); };
  const replaceProduct = product => { const previous = state.$product; state.$product = product; watch('$product', product, previous); };
  return { state, component, requests, events, notices, setOpen, replaceProduct };
}

test('opening the dialog reads its canonical assignment without writing inventory or variants', () => {
  for (const modern of [false, true]) {
    const f = fixture({ modern });
    assert.equal(f.state.property_set, f.state.$product.property_set);
    assert.equal(f.requests.length, 0);
    assert.equal(f.state.$product.quantity, 41);
    assert.equal(f.state.$product.product_variants[0].style, 'Floral');
  }
});

for (const vendor of [false, true]) test(`the ${vendor ? 'vendor' : 'shop'} save sends only the selected assignment and merges the canonical response`, async () => {
  for (const modern of [false, true]) {
    const f = fixture({ vendor, modern });
    const draft = makeSet(8, 'Clothing');
    f.state.property_set = draft;
    f.state.saveProductPropertySet();
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0].url, vendor ? '/vendor/4/product/9/property-set' : '/shop/3/product/9/property-set');
    assert.deepEqual(Object.keys(f.requests[0].payload), ['property_set_id']);
    assert.equal(f.requests[0].payload.property_set_id, 8);
    assert.equal(f.state.busy, true);
    assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
    const canonical = makeSet(8, 'Canonical clothing');
    f.requests[0].resolve({ product: { property_set_id: 8, title: 'Canonical title' }, property_set: canonical });
    await setImmediate();
    assert.equal(f.state.$product.property_set, canonical);
    assert.equal(f.state.$product.title, 'Canonical title');
    assert.equal(f.state.$product.quantity, 41);
    assert.equal(f.state.$product.price, 100);
    assert.equal(f.state.$product.product_variants[0].style, 'Floral');
    assert.equal(f.state.busy, false);
    assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), true);
    assert.equal(f.events.some(([name, value]) => name === 'update:product' && value === f.state.$product), true);
  }
});

test('clearing the selector saves the default fallback without sending a fabricated set', async () => {
  const f = fixture();
  f.state.property_set = null;
  f.state.saveProductPropertySet();
  assert.equal(f.requests.length, 1);
  assert.deepEqual(Object.keys(f.requests[0].payload), ['property_set_id']);
  assert.equal(f.requests[0].payload.property_set_id == null, true);
  f.requests[0].resolve({ product: { property_set_id: null }, property_set: null });
  await setImmediate();
  assert.equal(f.state.$product.property_set, null);
  assert.equal(f.state.$product.property_set_id, null);
});

test('closed dialogs and free-form text cannot submit a property-set assignment', () => {
  const closed = fixture({ open: false });
  closed.state.saveProductPropertySet();
  assert.equal(closed.requests.length, 0);
  for (const value of ['Unselected search text', { title: 'Not a saved set' }]) {
    const f = fixture();
    f.state.property_set = value;
    f.state.saveProductPropertySet();
    assert.equal(f.requests.length, 0);
    assert.equal(f.state.$product.property_set.id, 5);
  }
});

test('Cancel discards the local selection and reopening uses the currently assigned set', () => {
  const f = fixture();
  const assigned = f.state.$product.property_set;
  f.state.property_set = makeSet(8);
  f.state.close();
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.$product.property_set, assigned);
  f.setOpen(false);
  f.setOpen(true);
  assert.equal(f.state.property_set, assigned);
  assert.equal(f.state.$product.quantity, 41);
});

test('validation and network failures retain the chosen draft and allow retry', async () => {
  for (const networkFailure of [false, true]) {
    const f = fixture();
    const draft = makeSet(8);
    f.state.property_set = draft;
    f.state.saveProductPropertySet();
    if (networkFailure) f.requests[0].reject(new Error('Fixture network failure'));
    else f.requests[0].resolve({ error: true, error_msg: 'Fixture validation failure' });
    await setImmediate();
    assert.equal(f.state.property_set, draft);
    assert.equal(f.state.$product.property_set.id, 5);
    assert.equal(f.state.busy, false);
    assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), false);
    assert.equal(f.notices.some(item => item.name === (networkFailure ? 'showLaravelError' : 'showErrorAlert')), true);
    f.state.saveProductPropertySet();
    assert.equal(f.requests.length, 2);
  }
});

test('an in-flight save blocks duplicate writes and closing the modern assignment dialog', async () => {
  const f = fixture();
  f.state.property_set = makeSet(8);
  f.state.saveProductPropertySet();
  f.state.saveProductPropertySet();
  f.state.close();
  assert.equal(f.requests.length, 1);
  assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  f.requests[0].resolve({ error: true, error_msg: 'Fixture rejected save' });
  await setImmediate();
  f.state.close();
  assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), true);
});

test('a response from an older product cannot overwrite the replacement product or close its dialog', async () => {
  const f = fixture();
  f.state.property_set = makeSet(8);
  f.state.saveProductPropertySet();
  const replacement = { id: 10, shop_id: 3, title: 'Replacement product', property_set_id: 11, property_set: makeSet(11) };
  f.replaceProduct(replacement);
  f.requests[0].resolve({ product: { property_set_id: 8, title: 'Old response' }, property_set: makeSet(8) });
  await setImmediate();
  assert.equal(f.state.$product, replacement);
  assert.equal(replacement.property_set_id, 11);
  assert.equal(replacement.title, 'Replacement product');
  assert.equal(f.state.property_set.id, 11);
  assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), false);
});

test('a closed and reopened session ignores an earlier successful assignment response', async () => {
  const f = fixture();
  const original = f.state.$product.property_set;
  f.state.property_set = makeSet(8);
  f.state.saveProductPropertySet();
  f.setOpen(false);
  f.setOpen(true);
  const nextDraft = makeSet(12);
  f.state.property_set = nextDraft;
  f.state.saveProductPropertySet();
  assert.equal(f.requests.length, 2);
  f.requests[0].resolve({ product: { property_set_id: 8 }, property_set: makeSet(8) });
  await setImmediate();
  assert.equal(f.state.$product.property_set, original);
  assert.equal(f.state.property_set, nextDraft);
  assert.equal(f.state.busy, true, 'The earlier completion must not unlock the newer request');
  assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), false);
  const canonical = makeSet(12, 'New session result');
  f.requests[1].resolve({ product: { property_set_id: 12 }, property_set: canonical });
  await setImmediate();
  assert.equal(f.state.$product.property_set, canonical);
  assert.equal(f.state.busy, false);
});

test('unmounting the dialog ignores a pending response', async () => {
  const f = fixture();
  const assigned = f.state.$product.property_set;
  f.state.property_set = makeSet(8);
  f.state.saveProductPropertySet();
  f.component.beforeUnmount?.call(f.state);
  f.requests[0].resolve({ product: { property_set_id: 8 }, property_set: makeSet(8) });
  await setImmediate();
  assert.equal(f.state.$product.property_set, assigned);
  assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), false);
});

test('Escape closes Help first and native dismissal respects a pending save', async () => {
  const f = fixture();
  f.state.helpOpen = true;
  let stopped = 0, prevented = 0;
  f.state.onEscape({ stopPropagation() { stopped++; }, preventDefault() { prevented++; } });
  assert.equal(f.state.helpOpen, false);
  assert.equal(stopped, 1);
  assert.equal(prevented, 1);
  assert.equal(f.events.length, 0, 'Closing Help must not dismiss the selection draft');
  f.state.saveProductPropertySet();
  f.state.onDialogToggle(false);
  assert.equal(f.events.length, 0);
  f.requests[0].resolve({ error: true, error_msg: 'Fixture retry' });
  await setImmediate();
  f.state.onDialogToggle(false);
  assert.equal(f.events.some(([name, value]) => name === 'update:modelValue' && value === false), true);
});
