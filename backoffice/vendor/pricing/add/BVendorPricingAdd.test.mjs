import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parse, compileScript, compileTemplate, compileStyleAsync } from '@vue/compiler-sfc';
import ts from 'typescript';
import * as Vue from 'vue';
import { renderToString } from 'vue/server-renderer';

const filename = new URL('./BVendorPricingAdd.vue', import.meta.url).pathname;
const { descriptor, errors } = parse(readFileSync(new URL('./BVendorPricingAdd.vue', import.meta.url), 'utf8'), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: 'vendor-pricing-test' });
const template = compileTemplate({ source: descriptor.template.content, filename, id: 'vendor-pricing-test', compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({ source: style.content, filename, id: 'data-v-vendor-pricing-test', scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(result.errors, []);
}
const transpile = source => {
  const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
  assert.deepEqual(result.diagnostics, []);
  return result.outputText;
};
const plain = value => JSON.parse(JSON.stringify(value));
const pricing = (id = 17, shop = 7) => ({ id, shop_id: shop, title: 'Digital products', commission: 20, description: 'Digital vendor offers', translations: { fa: { title: 'محصولات دیجیتال' } } });
const samples = Array.from({ length: 20 }, (_, i) => `Native suggestion ${i + 1}`);
const methods = { add: 'addPricing', update: 'editricing', remove: 'remove' };

function fixture(record = null, modern = true) {
  const requests = [], events = [], notices = [], calls = [];
  const leaf = name => Vue.defineComponent({
    name, inheritAttrs: false,
    setup: (_, { attrs, slots }) => () => {
      calls.push({ name, attrs });
      const children = [slots.default?.(), slots['append-inner']?.(), slots.message?.({ message: attrs['error-messages'] || attrs.messages || ' ' })];
      return Vue.h(name === 'v-btn' ? 'button' : 'div', { class: attrs.class, type: attrs.type, form: attrs.form, disabled: attrs.disabled, role: attrs.role, tabindex: attrs.tabindex, 'aria-label': attrs['aria-label'], 'aria-checked': attrs['aria-checked'] }, children);
    },
  });
  const notification = { showErrorAlert: (...args) => notices.push(['application', ...args]), showLaravelError: (...args) => notices.push(['network', ...args]) };
  const request = (method, url, payload) => new Promise((resolve, reject) => requests.push({ method, url, payload, resolve: data => resolve({ data }), reject }));
  const exports = {};
  const globals = {
    exports,
    require: name => name === 'vue' ? Vue : ({ default: name.includes('NotificationService') ? notification : leaf(name.split('/').at(-1).replace('.vue', '')) }),
    window: { API: {
      POST_SHOP_ADD_VENDOR_PRICINGS: shop => `/fixture/shops/${shop}/pricings`,
      PUT_SHOP_EDIT_VENDOR_PRICINGS: (shop, id) => `/fixture/shops/${shop}/pricings/${id}`,
      DELETE_SHOP_EDIT_VENDOR_PRICINGS: (shop, id) => `/fixture/shops/${shop}/pricings/${id}`,
    } },
    axios: { post: (url, payload) => request('post', url, payload), put: (url, payload) => request('put', url, payload), delete: url => request('delete', url) },
  };
  vm.runInNewContext(transpile(script.content), globals);
  const component = exports.default;
  const state = { ...component.data(), modern, pricing: record, shop: { id: 7 }, $t: key => key, $emit: (...args) => events.push(args), resetToDefault() { Object.assign(this, component.data()); } };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state) });
  state.assign();
  async function render() {
    calls.length = 0;
    const rendered = {};
    vm.runInNewContext(transpile(template.code), { exports: rendered, require: () => Vue });
    const app = Vue.createSSRApp({ ...component, render: rendered.render, watch: {}, created() { this.assign(); this.busy = state.busy; this.busy_delete = state.busy_delete; }, data: () => ({ ...component.data(), title: state.title, commission: state.commission, description: state.description, critical_open: state.critical_open, accept_delete: state.accept_delete, busy: state.busy, busy_delete: state.busy_delete }) }, { modern, pricing: state.pricing, shop: state.shop });
    app.mixin({ methods: { resetToDefault() { Object.assign(this.$data, component.data()); } } });
    for (const name of ['v-card', 'v-card-title', 'v-card-text', 'v-card-actions', 'v-text-field', 'v-textarea', 'v-btn', 'v-icon', 'v-tooltip', 'v-list-subheader', 'u-widget-header']) app.component(name, leaf(name));
    Object.assign(app.config.globalProperties, { $t: key => key, $tm: () => samples });
    return renderToString(app);
  }
  return { state, component, requests, events, notices, calls, render };
}
function prepare(state, action) {
  if (action === 'add') Object.assign(state, { title: 'New plan', description: null, commission: 0 });
  if (action === 'remove') Object.assign(state, { critical_open: true, accept_delete: true });
}
const success = (action, id) => action === 'remove' ? { id } : { pricing: { id, title: 'Saved plan', commission: 30 } };

test('modern is opt-in and the legacy form retains native fields, initialization, payload and events', async () => {
  const { state, component, requests, events, render, calls } = fixture(null, false);
  assert.equal(component.props.modern.default, false);
  assert.equal(state.commission, 0);
  assert.equal(state.title, null);
  assert.equal(state.description, null);
  const html = await render();
  assert.doesNotMatch(html, /marketplace_pricings\.modern/);
  assert.ok(calls.some(call => call.name === 'u-widget-header' && call.attrs.title === 'vendor_pricing_add.title'));
  Object.assign(state, { title: ' Legacy title ', description: null, commission: 0 });
  const done = state.addPricing();
  assert.deepEqual(plain(requests[0].payload), { title: ' Legacy title ', description: null, commission: 0 });
  requests[0].resolve(success('add', 17));
  await done;
  assert.deepEqual(plain(events), [['add', success('add', 17).pricing], ['close']]);
  assert.equal(state.busy, false);
});

test('modern rendering retains all suggestions, native input bounds and existing title/description translation contexts', async () => {
  const { render, calls, state } = fixture(pricing());
  const html = await render();
  for (const key of ['editTitle', 'sharedTitle', 'sharedHelp', 'assignmentHelp', 'detailsTitle', 'detailsHelp', 'ruleTitle', 'ruleHelp', 'raw', 'sale', 'removeHelp']) assert.ok(html.includes(`marketplace_pricings.modern.${key}`), key);
  const sections = [...html.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map(match => match[1]);
  assert.equal(sections.length, 2);
  assert.match(html, /class="sd-modern-content b-vendor-pricing-add__content"/);
  assert.match(html, /<form\b[^>]*class="b-vendor-pricing-add__form"/);
  assert.ok(html.indexOf('marketplace_pricings.modern.assignmentHelp') < html.indexOf('<form'));
  assert.ok(sections[0].includes('marketplace_pricings.modern.detailsTitle'));
  assert.ok(sections[0].includes('b-vendor-pricing-add__description'));
  assert.ok(sections[1].includes('marketplace_pricings.modern.ruleTitle'));
  assert.match(sections[1], /aria-live="polite"[\s\S]*marketplace_pricings\.modern\.raw[\s\S]*<bdi>100<\/bdi>[\s\S]*marketplace_pricings\.modern\.sale[\s\S]*<bdi>120<\/bdi>/);
  const translations = calls.filter(call => call.name === 'BTranslationButtonVendorPricing');
  assert.deepEqual(translations.map(call => call.attrs['translation-key']), ['title', 'description']);
  for (const call of translations) {
    assert.equal(call.attrs.pricing, state.pricing);
    assert.equal(call.attrs.shop, state.shop);
  }
  const suggestion = calls.find(call => call.name === 'USmartSuggestion').attrs;
  assert.equal(suggestion.samples, samples);
  suggestion.onSelect('Native suggestion 20');
  assert.equal(calls.find(call => call.name === 'UNumberInput').attrs.min, 0);
  assert.equal(calls.find(call => call.name === 'UNumberInput').attrs.max, 1000);
  assert.equal(calls.find(call => call.name === 'UNumberInput').attrs.suffix, '%');
  assert.equal(calls.find(call => call.name === 'UNumberInput').attrs.messages, 'marketplace_pricings.modern.commissionHelp');
  assert.equal(calls.find(call => call.name === 'v-text-field').attrs.maxlength, '255');
  assert.ok(calls.find(call => call.name === 'v-text-field').attrs.required !== undefined);
  assert.equal(calls.find(call => call.name === 'v-textarea').attrs.required, undefined);
  assert.ok(html.indexOf('</form>') < html.indexOf('<details'));
  assert.ok(calls.some(call => call.name === 'USmartVerify' && call.attrs.role === 'checkbox' && call.attrs.tabindex === 0));
  const created = fixture();
  const createHtml = await created.render();
  assert.match(createHtml, /marketplace_pricings\.modern\.addTitle/);
  assert.equal(created.calls.filter(call => call.name === 'BTranslationButtonVendorPricing').length, 0);
  assert.equal(created.calls.filter(call => call.name === 'USmartVerify').length, 0);
});

test('the editor retains plan guidance and native inputs without its own assigned-products launcher', async () => {
  for (const [record, modern] of [[null, true], [pricing(), true], [pricing(), false]]) {
    const context = fixture(record, modern);
    const html = await context.render();
    assert.equal(context.component.props.productsRoute, undefined);
    assert.equal(context.calls.some(call => call.name === 'v-btn' && call.attrs.to), false);
    assert.doesNotMatch(html, /marketplace_pricings\.modern\.viewProducts|b-vendor-pricing-add__products/);
    if (modern) for (const key of ['sharedTitle', 'sharedHelp', 'assignmentHelp']) assert.ok(html.includes(`marketplace_pricings.modern.${key}`));
    for (const name of ['v-text-field', 'v-textarea', 'UNumberInput']) assert.ok(context.calls.some(call => call.name === name), name);
    assert.equal(context.requests.length, 0);
    assert.equal(context.events.length, 0);
    assert.equal(context.state.title, record?.title ?? null);
  }
});

test('Vue reactive component context preserves plain pricing identity and permits a valid draft', () => {
  const { component } = fixture();
  const record = pricing();
  const state = Vue.reactive({ ...component.data(), modern: true, pricing: record, shop: { id: 7 }, resetToDefault() { Object.assign(this, component.data()); } });
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state) });
  state.assign();
  assert.equal(state.hasCurrentContext, true);
  assert.equal(state.canSubmitModern, true);
});

test('create/edit fixed-footer submit buttons remain associated with their input form while legacy stays native', async () => {
  for (const record of [null, pricing()]) {
    const { render, calls } = fixture(record);
    const html = await render();
    const form = html.match(/<form\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/form>/);
    assert.ok(form, 'The input form has a rendered identifier');
    assert.match(form[2], /b-vendor-pricing-add__field/);
    assert.match(form[2], /b-vendor-pricing-add__description/);
    assert.doesNotMatch(form[2], /<button\b[^>]*\btype="submit"/);
    const primary = calls.find(call => call.name === 'v-btn' && call.attrs.type === 'submit');
    assert.ok(primary, 'The primary action remains a native submit control');
    assert.equal(primary.attrs.form, form[1]);
    const renderedPrimary = html.match(/<button\b(?=[^>]*\btype="submit")(?=[^>]*\bform="([^"]+)")[^>]*>/);
    assert.ok(renderedPrimary);
    assert.equal(renderedPrimary[1], form[1]);
    const footerIndex = html.indexOf('class="b-vendor-pricing-add__actions"');
    assert.ok(footerIndex > form.index + form[0].length, 'The fixed footer is outside the scrolling input form');
    assert.ok(renderedPrimary.index > footerIndex);
    if (record) assert.ok(footerIndex > html.indexOf('</details>'), 'Critical controls stay in the body before the footer');
    assert.ok(html.includes(`marketplace_pricings.modern.${record ? 'save' : 'create'}`));
  }
  const legacy = fixture(pricing(), false);
  const legacyHtml = await legacy.render();
  assert.doesNotMatch(legacyHtml, /<form\b|b-vendor-pricing-add__actions/);
  assert.equal(legacy.calls.some(call => call.name === 'v-btn' && call.attrs.form != null), false);
  assert.ok(legacy.calls.some(call => call.name === 'v-card-actions'));
});

test('modern title and finite percentage validation rejects invalid writes while zero and 1000 remain valid', async () => {
  for (const title of ['', '   ', 'x'.repeat(256), null, 12]) {
    const { state, requests } = fixture();
    Object.assign(state, { title, commission: 10 });
    state.addPricing();
    assert.equal(requests.length, 0, String(title));
  }
  for (const commission of [null, undefined, '', ' ', 'bad', NaN, Infinity, -1, 1000.01, false, []]) {
    const { state, requests } = fixture();
    Object.assign(state, { title: 'Valid plan', commission });
    state.addPricing();
    assert.equal(requests.length, 0, String(commission));
  }
  for (const commission of [0, 1000, '25']) {
    const { state, requests, events } = fixture();
    Object.assign(state, { title: '  Valid plan  ', commission, description: null });
    const done = state.addPricing();
    assert.deepEqual(plain(requests[0].payload), { title: 'Valid plan', commission: Number(commission), description: null });
    state.addPricing();
    state.editricing();
    state.remove();
    assert.equal(requests.length, 1);
    requests[0].resolve(success('add', 17));
    await done;
    assert.equal(events[0][0], 'add');
  }
});

test('formula is markup on raw100, and fixed commission, discounts and currency are not new plan settings', () => {
  const { state } = fixture();
  for (const [commission, expected] of [[0, 100], [25, 125], [100, 200], [1000, 1100]]) {
    state.commission = commission;
    assert.equal(state.examplePrice, expected);
  }
  state.commission = Infinity;
  assert.equal(state.examplePrice, null);
});

test('edit/remove require a valid assigned shop record and cannot submit an old draft before watcher reset', () => {
  for (const record of [null, {}, { ...pricing(), id: null }, pricing(17, 8)]) {
    const { state, requests } = fixture(record);
    Object.assign(state, { title: 'Valid', commission: 10, critical_open: true, accept_delete: true });
    state.editricing();
    state.remove();
    assert.equal(requests.length, 0);
  }
  const { state, requests } = fixture(pricing());
  state.pricing = pricing(18);
  Object.assign(state, { critical_open: true, accept_delete: true });
  state.editricing();
  state.remove();
  assert.equal(requests.length, 0);
  state.pricing = null;
  state.addPricing();
  assert.equal(requests.length, 0);
});

test('critical disclosure/intent guards reset on collapse, close, record/shop change and unmount', () => {
  const { state, component, requests, events } = fixture(pricing());
  state.remove();
  state.accept_delete = true;
  state.remove();
  assert.equal(requests.length, 0);
  state.onCriticalToggle({ target: { open: true } });
  state.toggleDeleteIntent();
  assert.equal(state.accept_delete, false);
  state.toggleDeleteIntent();
  assert.equal(state.canRemoveModern, true);
  state.onCriticalToggle({ target: { open: false } });
  assert.equal(state.accept_delete, false);
  for (const reset of [() => state.requestClose(), () => component.watch.pricing.call(state), () => component.watch['shop.id'].call(state), () => component.beforeUnmount.call(state)]) {
    Object.assign(state, { critical_open: true, accept_delete: true });
    reset();
    assert.equal(state.critical_open, false);
    assert.equal(state.accept_delete, false);
  }
  assert.deepEqual(plain(events), [['close']]);
});

test('current edit/removal retain native request scope and events without mutating the passed pricing', async () => {
  for (const action of ['update', 'remove']) {
    const original = pricing();
    const { state, requests, events } = fixture(original);
    prepare(state, action);
    state.title = ' Updated title ';
    const done = state[methods[action]]();
    assert.equal(requests[0].url, '/fixture/shops/7/pricings/17');
    assert.equal(requests[0].method, action === 'update' ? 'put' : 'delete');
    if (action === 'update') assert.deepEqual(plain(requests[0].payload), { title: 'Updated title', description: original.description, commission: 20 });
    state[methods[action]]();
    assert.equal(requests.length, 1);
    requests[0].resolve(success(action, 17));
    await done;
    assert.deepEqual(plain(events), [[action, action === 'remove' ? 17 : success(action, 17).pricing], ['close']]);
    assert.equal(original.title, 'Digital products');
    assert.equal(state.busy, false);
    assert.equal(state.busy_delete, false);
    assert.equal(state.accept_delete, false);
  }
});

test('stale success/application/network errors cannot close or unlock a newer record/shop action', async () => {
  for (const action of ['add', 'update', 'remove']) for (const context of ['record', 'shop']) for (const outcome of ['success', 'application', 'network']) {
    const { state, component, requests, events, notices } = fixture(action === 'add' ? null : pricing());
    prepare(state, action);
    const oldDone = state[methods[action]]();
    if (context === 'shop') {
      state.shop = { id: 8 };
      if (state.pricing) state.pricing = pricing(18, 8);
      component.watch['shop.id'].call(state);
    } else {
      state.pricing = pricing(18);
      component.watch.pricing.call(state);
    }
    const current = state.pricing;
    const nextAction = state.pricing ? action === 'remove' ? 'remove' : 'update' : 'add';
    prepare(state, nextAction);
    const newDone = state[methods[nextAction]]();
    assert.equal(requests.length, 2, `${action}/${context}/${outcome}`);
    if (outcome === 'network') requests[0].reject(new Error('Old failure'));
    else requests[0].resolve(outcome === 'success' ? success(action, 17) : { error: true, error_msg: 'Old failure' });
    await oldDone;
    assert.equal(state.pricing, current);
    if (current) assert.equal(current.title, 'Digital products');
    assert.equal(nextAction === 'remove' ? state.busy_delete : state.busy, true);
    assert.equal(events.length, 0);
    assert.equal(notices.length, 0);
    state[methods[nextAction]]();
    assert.equal(requests.length, 2);
    const id = current?.id || 19;
    requests[1].resolve(success(nextAction, id));
    await newDone;
    assert.deepEqual(plain(events), [[nextAction, nextAction === 'remove' ? id : success(nextAction, id).pricing], ['close']]);
    assert.equal(state.busy, false);
    assert.equal(state.busy_delete, false);
  }
});

test('current request errors preserve drafts, notify once and permit a guarded retry', async () => {
  for (const action of ['add', 'update', 'remove']) for (const network of [false, true]) {
    const { state, requests, events, notices } = fixture(action === 'add' ? null : pricing());
    prepare(state, action);
    const title = state.title;
    const done = state[methods[action]]();
    if (network) requests[0].reject(new Error('Current failure'));
    else requests[0].resolve({ error: true, error_msg: 'Current failure' });
    await done;
    assert.equal(events.length, 0);
    assert.equal(notices[0][0], network ? 'network' : 'application');
    assert.equal(notices.length, 1);
    assert.equal(state.title, title);
    assert.equal(state.busy, false);
    assert.equal(state.busy_delete, false);
    const retry = state[methods[action]]();
    state[methods[action]]();
    assert.equal(requests.length, 2);
    requests[1].resolve(success(action, 17));
    await retry;
    assert.equal(events[0][0], action);
  }
});

test('a native event listener replacing the record cannot close or release its new request', async () => {
  for (const action of ['add', 'update', 'remove']) {
    const { state, component, requests, events } = fixture(action === 'add' ? null : pricing());
    let nextDone;
    state.$emit = (...args) => {
      events.push(args);
      if (args[0] === action && requests.length === 1) {
        state.pricing = pricing(18);
        component.watch.pricing.call(state);
        nextDone = state.editricing();
      }
    };
    prepare(state, action);
    const done = state[methods[action]]();
    requests[0].resolve(success(action, 17));
    await done;
    assert.equal(events.length, 1);
    assert.equal(state.pricing.id, 18);
    assert.equal(state.busy, true);
    requests[1].resolve(success('update', 18));
    await nextDone;
    assert.deepEqual(events.map(args => args[0]), [action, 'update', 'close']);
    assert.equal(state.busy, false);
  }
});

test('unmount invalidates every modern callback without emitting or notifying', async () => {
  for (const action of ['add', 'update', 'remove']) {
    const { state, component, requests, events, notices } = fixture(action === 'add' ? null : pricing());
    prepare(state, action);
    const done = state[methods[action]]();
    state.requestClose();
    assert.equal(events.length, 0);
    component.beforeUnmount.call(state);
    requests[0].resolve(success(action, 17));
    await done;
    assert.equal(events.length, 0);
    assert.equal(notices.length, 0);
  }
});
