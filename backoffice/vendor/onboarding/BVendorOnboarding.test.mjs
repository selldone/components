import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { parse, compileScript, compileTemplate, compileStyleAsync } from '@vue/compiler-sfc';
import ts from 'typescript';
import * as Vue from 'vue';
import { renderToString } from 'vue/server-renderer';

const filename = new URL('./BVendorOnboarding.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'), { filename: filename.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: 'vendor-onboarding-test' });
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'vendor-onboarding-test', compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const compiled = await compileStyleAsync({ source: style.content, filename: filename.pathname, id: 'data-v-vendor-onboarding-test', scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(compiled.errors, []);
}
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const enumExports = {};
vm.runInNewContext(transpile(readFileSync(new URL('../../../../core-js/enums/vendor/VendorDocumentType.ts', import.meta.url), 'utf8')), { exports: enumExports });
const documentTypes = enumExports.default;
const plain = value => JSON.parse(JSON.stringify(value));
const record = (id = 17, accepted = null) => ({
  id, shop_id: 7, user_id: 99, user: { id: 99, name: 'Native applicant' }, created_at: '2024-12-01T10:00:00Z', accepted_at: accepted, rejected_at: null,
  company: { name: 'Example business', address: 'Example address', postal_code: '12345', phone: '+1 555 0100', email: 'vendor@example.test', web: 'https://example.test' },
  personal: { name: 'Applicant full name', country: 'DK' }, product: { description: 'A complete merchandise description' },
  bank: { name: 'Example bank', account_name: 'Account holder', account_number: '123456', routing_number: '654321', iban: 'EXAMPLE-IBAN', swift: 'EXAMPLE-SWIFT', branch_address: 'Example branch' }, attachments: [],
});
const shop = () => ({ id: 7, vendors: { waiting_count: 3 }, marketplace: { documents: [] } });

function fixture({ request = record(), modern = true, adminMode = true, marketplaceShop = shop() } = {}) {
  const requests = [], events = [], notices = [], calls = [], guides = [], icons = [];
  let renderedState;
  const notification = { showErrorAlert: (...args) => notices.push(['application', ...args]), showLaravelError: (...args) => notices.push(['network', ...args]), showSuccessAlert: (...args) => notices.push(['success', ...args]), openDangerAlert: (...args) => { notices.push(['danger', ...args.slice(0, 3)]); args[3](); } };
  const leaf = name => Vue.defineComponent({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => {
    calls.push({ name, attrs });
    return Vue.h(name === 'v-btn' ? (attrs.href ? 'a' : 'button') : 'div', { class: attrs.class, href: attrs.href, target: attrs.target, rel: attrs.rel, role: attrs.role, tabindex: attrs.tabindex, disabled: attrs.disabled, 'aria-label': attrs['aria-label'], 'aria-checked': attrs['aria-checked'] }, [slots.default?.(), slots['append-inner']?.(), slots.append?.(), slots.prepend?.(), slots.message?.()]);
  } });
  const makeRequest = (method, url, payload, config) => new Promise((resolve, reject) => requests.push({ method, url, payload, config, resolve: data => resolve({ data }), reject }));
  const api = {
    POST_SHOP_VENDOR_REQUESTS_ACCEPT: (sid, id) => `/fixture/shops/${sid}/requests/${id}/accept`,
    GET_SHOP_VENDOR_REQUEST_ATTACHMENT_DOWNLOAD_LINK: (sid, id, attachment) => `/fixture/shops/${sid}/requests/${id}/attachments/${attachment}`,
  };
  const vapi = {
    GET_ADD_VENDOR_REQUEST: sid => `/fixture/vendor/shops/${sid}/request`, POST_SEND_ADD_VENDOR_REQUEST: () => '/fixture/vendor/request',
    POST_VENDOR_REQUEST_UPLOAD_FILES: () => '/fixture/vendor/request/files', DELETE_VENDOR_REQUEST_ATTACHMENT: id => `/fixture/vendor/request/files/${id}`,
  };
  const exports = {};
  vm.runInNewContext(transpile(script.content), {
    exports, window: { API: api, VAPI: vapi },
    FormData: class { constructor() { this.items = []; } append(key, value) { this.items.push([key, value]); } },
    axios: { get: (url, config) => makeRequest('get', url, undefined, config), post: (url, payload, config) => makeRequest('post', url, payload, config), delete: (url, config) => makeRequest('delete', url, undefined, config) },
    require(name) {
      if (name.includes('NotificationService')) return { default: notification };
      if (name.includes('VendorDocumentType')) return { default: documentTypes };
      if (name.includes('FileHelper')) return { FileHelper: { GetFileIcon: name => { icons.push(name); return `/fixture/icons/${name}`; } } };
      if (name.includes('HtmlHelper')) return { SmartConvertTextToHtml: value => { guides.push(value); return value; } };
      if (name.includes('DynamicScriptDirective')) return { default: { getSSRProps: () => ({}) } };
      if (name.includes('DateMixin')) return { default: {} };
      return { default: leaf(name.split('/').at(-1).replace('.vue', '')) };
    },
  });
  const component = exports.default;
  const state = { ...component.data(), modern, adminMode, shop: marketplaceShop, modelValue: request, $t: key => key, $emit: (...args) => events.push(args), $refs: { form: { validate: () => true } }, DeleteItemByID: (items, id) => items.splice(items.findIndex(item => item.id === id), 1) };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state) });
  state.assign();
  async function render() {
    calls.length = 0;
    const rendered = {};
    vm.runInNewContext(transpile(template.code), { exports: rendered, require: () => Vue });
    const data = Object.fromEntries(Object.keys(component.data()).map(key => [key, state[key]]));
    const app = Vue.createSSRApp({ ...component, created() { renderedState = this; }, watch: {}, data: () => ({ ...data }), render: rendered.render }, { modern: state.modern, adminMode: state.adminMode, shop: state.shop, modelValue: state.modelValue });
    Object.assign(app.config.globalProperties, { $t: key => key, GlobalRules: { required: () => () => true, email: () => () => true }, getFromNowString: value => `relative:${value}`, getLocalTimeString: value => `exact:${value}`, getCountryName: value => `Country ${value}`, numeralFormat: value => `bytes:${value}` });
    for (const name of ['v-card', 'v-card-title', 'v-card-text', 'v-card-actions', 'v-icon', 'v-btn', 'v-tooltip', 'v-spacer', 'v-list-subheader', 'v-stepper', 'v-stepper-header', 'v-stepper-item', 'v-expand-transition', 'v-scroll-y-reverse-transition', 'v-form', 'v-text-field', 'v-textarea', 'v-chip', 'v-list-item', 'v-avatar', 'v-file-input', 'v-dialog', 'v-container', 'v-sheet', 'u-loading-progress', 'flag']) app.component(name, leaf(name));
    return renderToString(app);
  }
  return { state, component, requests, events, notices, calls, guides, icons, render, get renderedState() { return renderedState; } };
}
function choose(state, accepted) { state.step = 100; state.setDecision(accepted, true); }
function response(accepted) { return { vendor_request: { accepted_at: accepted ? '2026-10-30T10:00:00Z' : null, rejected_at: accepted ? null : '2026-10-30T11:00:00Z' } }; }

test('modern admin review is opt-in; the legacy/vendor wizard and native fetch remain available', async () => {
  const f = fixture({ modern: false, adminMode: false });
  assert.equal(f.component.props.modern.default, false);
  assert.equal(f.state.modernReview, false);
  const html = await f.render();
  assert.doesNotMatch(html, /b-vendor-onboarding-modern/);
  assert.ok(f.calls.some(call => call.name === 'v-stepper'));
  assert.ok(f.calls.some(call => call.name === 'v-text-field' && call.attrs.modelValue === 'Example business'));
  f.component.created.call(f.state);
  assert.equal(f.requests[0].url, '/fixture/vendor/shops/7/request');
  f.requests[0].resolve({ error: true });
  await Promise.resolve();
  const vendorOptIn = fixture({ modern: true, adminMode: false });
  assert.equal(vendorOptIn.state.modernReview, false);
  assert.doesNotMatch(await vendorOptIn.render(), /b-vendor-onboarding-modern/);
  vendorOptIn.state.acceptRequest(true);
  assert.equal(vendorOptIn.requests.length, 0);
});

test('all six modern sections preserve every company/person/product/bank field as read-only values', async () => {
  const f = fixture();
  assert.deepEqual(plain(f.state.reviewSections.map(tab => tab.value)), [1, 2, 3, 4, 5, 100]);
  const fields = { 1: ['name', 'address', 'postal_code', 'phone', 'email', 'web'], 2: ['name', 'country'], 3: ['description'], 4: ['name', 'account_name', 'account_number', 'routing_number', 'iban', 'swift', 'branch_address'] };
  for (const [step, keys] of Object.entries(fields)) {
    f.state.setReviewStep(Number(step));
    assert.deepEqual(plain(f.state.reviewFields.map(field => field.key)), keys);
    const html = await f.render();
    for (const field of f.state.reviewFields) assert.ok(html.includes(field.key === 'country' ? 'Country DK' : field.value), field.key);
    assert.ok(!f.calls.some(call => ['v-text-field', 'v-textarea', 'v-file-input', 'SCountrySelect'].includes(call.name)));
    assert.equal(f.calls.filter(call => call.name === 'v-btn' && call.attrs['prepend-icon'] === 'save').length, 0);
  }
  f.state.$refs.reviewContent = { scrollTop: 160 };
  f.state.setReviewStep(1);
  assert.equal(f.state.step, 1);
  assert.equal(f.state.$refs.reviewContent.scrollTop, 0);
  f.state.$refs.reviewContent.scrollTop = 80;
  f.state.setReviewStep(999);
  assert.equal(f.state.step, 1);
  assert.equal(f.state.$refs.reviewContent.scrollTop, 80);
});

test('existing accepted/rejected requests start with unchecked native verification choices', async () => {
  const f = fixture({ request: record(17, '2024-12-07T20:25:00Z') });
  assert.equal(f.state.accept, false); assert.equal(f.state.reject, false);
  f.state.step = 100;
  const html = await f.render();
  const verifies = f.calls.filter(call => call.name === 'USmartVerify');
  assert.equal(verifies.length, 2);
  assert.ok(verifies.every(call => call.attrs['model-value'] === false && call.attrs.role === 'checkbox' && call.attrs.tabindex === 0));
  assert.match(html, /exact:2024-12-07T20:25:00Z/);
  f.state.setDecision(true, true); assert.equal(f.state.accept, true); assert.equal(f.state.reject, false);
  f.state.setDecision(false, true); assert.equal(f.state.accept, false); assert.equal(f.state.reject, true);
  f.state.setDecision(false, false); assert.equal(f.state.accept, false); assert.equal(f.state.reject, false);
});

test('native modern verification events and keyboard actions retain exclusive intent', async () => {
  const f = fixture(); f.state.step = 100; await f.render();
  const verifies = f.calls.filter(call => call.name === 'USmartVerify');
  verifies[0].attrs['onUpdate:modelValue'](true);
  assert.equal(f.renderedState.accept, true); assert.equal(f.renderedState.reject, false);
  const event = { key: 'Enter', preventDefault() {} };
  assert.ok(verifies.every(call => Array.isArray(call.attrs.onKeydown)));
  verifies[1].attrs.onKeydown[0](event);
  assert.equal(f.renderedState.accept, false); assert.equal(f.renderedState.reject, true);
  f.renderedState.busy_accept = 'true'; verifies[0].attrs['onUpdate:modelValue'](true);
  assert.equal(f.renderedState.accept, false); assert.equal(f.renderedState.reject, true);
});

test('missing bank, company and document values never gate an explicit administrator decision', async () => {
  const request = { ...record(), company: {}, personal: {}, product: {}, bank: {}, attachments: [] };
  const f = fixture({ request });
  f.state.step = 4; assert.match(await f.render(), /marketplace_requests.modern.review.missing/);
  choose(f.state, true); f.state.$refs.form.validate = () => { throw new Error('read-only review must not validate vendor submission fields'); };
  const done = f.state.acceptRequest(true);
  assert.equal(f.requests.length, 1); assert.deepEqual(plain(f.requests[0].payload), { accept: true });
  f.requests[0].resolve(response(true)); await done;
  assert.equal(request.accepted_at, '2026-10-30T10:00:00Z');
});

test('modern decision boundary requires admin mode, current Decision section, exact intent and no pending save', async () => {
  const f = fixture();
  f.state.acceptRequest(true); assert.equal(f.requests.length, 0);
  f.state.accept = true; f.state.acceptRequest(true); assert.equal(f.requests.length, 0);
  f.state.step = 100; f.state.reject = true; f.state.acceptRequest(true); assert.equal(f.requests.length, 0);
  f.state.reject = false; f.state.acceptRequest('true'); assert.equal(f.requests.length, 0);
  const done = f.state.acceptRequest(true); f.state.acceptRequest(true);
  assert.equal(f.requests.length, 1); assert.equal(f.requests[0].url, '/fixture/shops/7/requests/17/accept');
  f.requests[0].resolve(response(true)); await done; assert.equal(f.state.busy_accept, null);
});

test('success merges native request data, preserves relations and emits updated once for a filtered parent refresh', async () => {
  const f = fixture(); const original = f.state.modelValue; const user = original.user;
  choose(f.state, true); const done = f.state.acceptRequest(true); const data = response(true);
  f.requests[0].resolve(data); await done;
  assert.equal(f.state.modelValue, original); assert.equal(original.user, user);
  assert.deepEqual(f.events.map(event => event[0]), ['update', 'updated', 'close']);
  assert.equal(f.events[0][1], data.vendor_request); assert.equal(f.events[1][1], original);
  assert.equal(f.state.shop.vendors.waiting_count, 2);
  assert.equal(f.state.accept, false); assert.equal(f.state.reject, false);
});

test('re-review clears only the opposite server timestamp and does not decrement pending counts', async () => {
  const f = fixture({ request: record(17, '2024-12-07T20:25:00Z') });
  choose(f.state, false); const rejected = f.state.acceptRequest(false); f.requests[0].resolve(response(false)); await rejected;
  assert.equal(f.state.modelValue.accepted_at, null); assert.equal(f.state.modelValue.rejected_at, '2026-10-30T11:00:00Z');
  assert.equal(f.state.reviewStatus, 'rejected'); assert.equal(f.state.reviewDecisionDate, '2026-10-30T11:00:00Z');
  assert.equal(f.state.shop.vendors.waiting_count, 3);
  choose(f.state, true); const accepted = f.state.acceptRequest(true); f.requests[1].resolve(response(true)); await accepted;
  assert.equal(f.state.modelValue.rejected_at, null); assert.equal(f.state.reviewStatus, 'accepted'); assert.equal(f.state.shop.vendors.waiting_count, 3);
});

test('denied and failed decisions retain explicit intent and allow a current-context retry', async () => {
  for (const network of [false, true]) {
    const f = fixture(); choose(f.state, false); const done = f.state.acceptRequest(false);
    if (network) f.requests[0].reject(new Error('offline fixture')); else f.requests[0].resolve({ error: true, error_msg: 'Denied fixture' });
    await done; assert.equal(f.events.length, 0); assert.equal(f.state.reject, true); assert.equal(f.state.busy_accept, null); assert.equal(f.state.modelValue.accepted_at, null);
    assert.equal(f.notices[0][0], network ? 'network' : 'application');
    const retry = f.state.acceptRequest(false); f.requests[1].resolve(response(false)); await retry;
    assert.equal(f.events.filter(event => event[0] === 'updated').length, 1);
  }
});

test('late successes/errors from a replaced request cannot mutate the new record or finish its busy state', async () => {
  const f = fixture(); const old = f.state.modelValue; choose(f.state, true); const first = f.state.acceptRequest(true);
  f.state.modelValue = record(18); f.component.watch.modelValue.call(f.state); choose(f.state, false); const second = f.state.acceptRequest(false);
  f.requests[0].resolve(response(true)); await first;
  assert.equal(f.state.busy_accept, 'false'); assert.equal(old.accepted_at, null); assert.equal(f.state.modelValue.accepted_at, null); assert.equal(f.events.length, 0);
  f.requests[1].resolve(response(false)); await second;
  assert.equal(f.state.modelValue.id, 18); assert.equal(f.state.reviewStatus, 'rejected'); assert.equal(f.state.shop.vendors.waiting_count, 2);
  const stale = fixture(); choose(stale.state, true); const failed = stale.state.acceptRequest(true); stale.state.modelValue = record(19); stale.state.assign(); stale.requests[0].reject(new Error('late fixture')); await failed;
  assert.equal(stale.notices.length, 0); assert.equal(stale.events.length, 0);
});

test('shop changes, mode changes and component disposal invalidate modern decision responses', async () => {
  for (const change of ['shop', 'mode', 'unmount']) {
    const f = fixture(); choose(f.state, true); const done = f.state.acceptRequest(true);
    if (change === 'shop') { f.state.shop = { ...shop(), id: 8 }; f.component.watch['shop.id'].call(f.state); }
    else if (change === 'mode') { f.state.adminMode = false; f.component.watch.modernReview.call(f.state); }
    else f.component.beforeUnmount.call(f.state);
    f.requests[0].resolve(response(true)); await done;
    assert.equal(f.events.length, 0); assert.equal(f.notices.length, 0); assert.equal(f.state.modelValue.accepted_at, null);
  }
});

test('modern documents retain every configured type, repeated embeds/links and orphaned attachment metadata', async () => {
  const f = fixture();
  f.state.shop.marketplace.documents = Object.values(documentTypes).map(type => ({ type: type.code, title: `Configured ${type.code}`, name: `Native ${type.code}`, guide: `<p>Guide ${type.code}</p>`, link: 'https://example.test/form', code: '<p>Configured form</p>' }));
  f.state.shop.marketplace.documents.push({ type: 'Embed', title: 'Second embed', code: '<p>Second configured form</p>' }, { type: 'Link', title: 'Second link', link: 'https://example.test/second' });
  f.state.modelValue.attachments = [{ id: 44, type: 'Business', name: 'registration.pdf', size: 1536, path: 'private-fixture-do-not-render', note: 'Native file note' }, { id: 45, type: 'FormerType', name: 'prior.jpg', size: 200 }];
  assert.equal(f.state.reviewDocuments.length, Object.keys(documentTypes).length + 3);
  f.state.step = 5; const html = await f.render();
  for (const type of Object.keys(documentTypes)) assert.ok(html.includes(`Configured ${type}`), type);
  for (const value of ['Second embed', 'Second link', 'registration.pdf', 'bytes:1536', 'PDF', 'Native file note', 'prior.jpg']) assert.ok(html.includes(value), value);
  assert.doesNotMatch(html, /private-fixture-do-not-render/);
  const downloads = f.calls.filter(call => call.name === 'v-btn' && call.attrs.href?.includes('/attachments/'));
  assert.deepEqual(downloads.map(call => call.attrs.href), ['/fixture/shops/7/requests/17/attachments/44', '/fixture/shops/7/requests/17/attachments/45']);
  assert.ok(downloads.every(call => call.attrs.target === '_blank' && call.attrs.rel === 'noopener noreferrer'));
  assert.ok(f.calls.filter(call => call.name === 'v-btn' && call.attrs.href?.startsWith('https:')).every(call => call.attrs.target === '_blank' && call.attrs.rel === 'noopener noreferrer'));
  assert.ok(f.icons.includes('registration.pdf')); assert.ok(f.guides.includes('<p>Guide Business</p>'));
  assert.ok(!f.calls.some(call => call.name === 'v-file-input'));
  const embed = f.state.reviewDocuments.find(doc => doc.type === 'Embed'); f.state.showEmbedForm(embed);
  assert.equal(f.state.selected_embed, embed); assert.equal(f.state.dialog_embed, true); assert.equal(f.requests.length, 0);
});

test('empty and unsubmitted configured documents are explicit read-only states', async () => {
  const f = fixture(); f.state.step = 5;
  assert.match(await f.render(), /marketplace_requests.modern.review.emptyDocuments/);
  f.state.shop.marketplace.documents = [{ type: 'Business' }];
  assert.match(await f.render(), /marketplace_requests.modern.review.missingDocument/);
  assert.ok(!f.calls.some(call => call.name === 'v-file-input'));
  assert.equal(f.requests.length, 0);
});

test('legacy administrator decision events and existing counter semantics remain unchanged', async () => {
  const f = fixture({ modern: false, request: record(17, '2024-12-07T20:25:00Z') });
  const done = f.state.acceptRequest(false); f.requests[0].resolve(response(false)); await done;
  assert.deepEqual(f.events.map(event => event[0]), ['update', 'close']);
  assert.equal(f.state.shop.vendors.waiting_count, 2);
});

test('legacy vendor submission, upload, removal and authorized download contracts are preserved', async () => {
  const f = fixture({ modern: false, adminMode: false });
  f.state.saveChange();
  assert.deepEqual(plain(f.requests[0].payload), plain({ shop_id: 7, company: f.state.company, personal: f.state.personal, product: f.state.product, bank: f.state.bank }));
  f.requests[0].resolve({ vendor_request: { id: 17, attachments: [] } }); await Promise.resolve(); await Promise.resolve();
  assert.ok(f.events.some(event => event[0] === 'update:modelValue'));
  const attachment = { id: 44, type: 'Business', name: 'fixture.pdf', size: 100 };
  assert.equal(f.state.getDownloadLink(attachment), '/fixture/shops/7/requests/17/attachments/44');
  f.state.files = { Business: { fixtureFile: true } }; const request = { id: 17, attachments: [] }; f.state.uploadFiles(request);
  const upload = f.requests[1]; assert.equal(upload.url, '/fixture/vendor/request/files'); assert.deepEqual(plain(upload.payload.items), [['shop_id', 7], ['Business', { fixtureFile: true }]]);
  upload.resolve({ attachments: [attachment] }); await Promise.resolve(); await Promise.resolve(); assert.equal(request.attachments[0], attachment);
  f.state.modelValue.attachments = [attachment]; f.state.removeAttachment(attachment);
  const removal = f.requests[2]; assert.equal(removal.url, '/fixture/vendor/request/files/44'); assert.deepEqual(plain(removal.config), { params: { shop_id: 7 } });
  removal.resolve({ id: 44 }); await Promise.resolve(); await Promise.resolve(); assert.equal(f.state.attachments.length, 0);
});
