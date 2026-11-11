import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import vm from 'node:vm';
import * as Vue from 'vue';
import ts from 'typescript';
import { throttle } from 'lodash-es';
import { parse, compileTemplate, compileStyleAsync } from '@vue/compiler-sfc';
import EmptyState from '../../../../empty-state/BListEmptyState.test-helper.mjs';

const file = new URL('./BProductInventoryManagementFile.vue', import.meta.url);
const repository = new URL('../../../../../../../', import.meta.url);
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const source = path => readFileSync(new URL(path, repository), 'utf8');
const helpers = new Map();
function helper(path) {
  if (helpers.has(path)) return helpers.get(path);
  const exports = {};
  vm.runInNewContext(transpile(source(path)), {
    exports, console, Array, window: { $language: { full_locale: 'en-US', calendar: { calendar: 'gregory' } } },
    require(name) {
      if (name.includes('DateConverter')) return helper('@selldone/core-js/helper/date/DateConverter.ts');
      if (name.includes('Calendar')) return helper('@selldone/core-js/enums/language/Calendar.ts');
      if (name.includes('ObjectPrototypes')) return helper('@selldone/core-js/prototypes/ObjectPrototypes.ts');
      if (name.includes('ProductType')) return { ProductType: Object.fromEntries(['PHYSICAL', 'FILE', 'SERVICE', 'SUBSCRIPTION'].map(code => [code, { code }])) };
      if (name.includes('LabelingOptions')) return helper('@selldone/core-js/enums/shop/options/LabelingOptions.ts');
      throw new Error(`Unexpected source helper: ${name}`);
    },
  });
  helpers.set(path, exports);
  return exports;
}
helper('@selldone/core-js/prototypes/ArrayPrototypes.ts');

const stub = name => ({ name, inheritAttrs: false, props: ['modelValue'], setup(props, { attrs, slots }) {
  return () => name === 'VDialog' && !props.modelValue ? null : Vue.h(name, { ...attrs, modelValue: props.modelValue }, [slots.activator?.({ props: {} }), slots.prepend?.(), slots.default?.(), slots['append-inner']?.(), slots.append?.()]);
} });
const Draggable = {
  name: 'Draggable', inheritAttrs: false, props: ['modelValue'], emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) { return () => Vue.h('draggable', { ...attrs, 'onUpdate:modelValue': value => emit('update:modelValue', value) }, props.modelValue.map((element, index) => slots.item({ element, index }))); },
};

function load(dependencies = {}) {
  const { descriptor, errors } = parse(readFileSync(file, 'utf8'), { filename: fileURLToPath(file) });
  assert.deepEqual(errors, []);
  const compiled = compileTemplate({ source: descriptor.template.content, filename: fileURLToPath(file), id: 'file-inventory-test', transformAssetUrls: { includeAbsolute: true }, compilerOptions: { hoistStatic: false } });
  assert.deepEqual(compiled.errors, []);
  const context = vm.createContext({ exports: {}, console: { ...console, style() {} }, setInterval, clearInterval, FormData, ...dependencies, require(name) {
    if (name === 'vue') return { ...Vue, defineAsyncComponent: () => Draggable };
    if (name === 'lodash-es') return { throttle };
    if (name.includes('DateMixin')) return helper('@selldone/components-vue/mixin/date/DateMixin.ts');
    if (name.includes('ShopOptionsHelper')) return helper('@selldone/core-js/helper/shop/ShopOptionsHelper.ts');
    if (name.includes('ShopLicense')) return { Eligible: { GetFileUploadLimitMB: () => 2000, GetMaxCapacityMB: () => 300000 } };
    if (name.includes('NotificationService')) return { default: dependencies.notifications };
    if (name.includes('FilePondLoader')) return { default: { loadFilePondComponent: () => stub('FilePond') } };
    if (name === '@selldone/core-js/utils') return { FileHelper: { GetFileExtensionImage: name => `/fixture/${name.split('.').at(-1)}.svg` } };
    if (name.includes('BListEmptyState')) return { default: EmptyState };
    if (name.endsWith('.vue')) return { default: stub(name.split('/').at(-1).replace('.vue', '')) };
    throw new Error(`Unexpected component dependency: ${name}`);
  } });
  vm.runInContext(transpile(descriptor.script.content + '\n' + compiled.code), context);
  return { component: { ...context.exports.default, render: context.exports.render }, descriptor };
}

function fixture(patch = {}) {
  const requests = [], notices = [], confirmations = [];
  const endpoint = scope => new Proxy({}, { get: (_, name) => (...ids) => `/fixture/${scope}/${String(name)}/${ids.join('/')}` });
  const request = method => (url, payload) => new Promise((resolve, reject) => requests.push({ method, url, payload, reject, resolve: data => resolve({ data }) }));
  const notifications = {
    ...Object.fromEntries(['showSuccessAlert', 'showErrorAlert', 'showLaravelError'].map(name => [name, (...args) => notices.push({ name, args })])),
    openDangerAlert: (...args) => confirmations.push(args.at(-1)),
  };
  const axios = Object.fromEntries(['get', 'put', 'delete', 'post'].map(method => [method, request(method)]));
  const { component, descriptor } = load({ axios, notifications, window: { API: endpoint('shop'), VAPI: endpoint('vendor') } });
  const state = {
    modern: true, forStudio: false, content: null,
    shop: { id: 3, capacity: 1024, options: [{ code: 'checkout', value: { mode: 'on-checkout' } }] },
    product: { id: 9, shop_id: 3, vendor_id: 4, files: records() },
    $route: { name: 'BPageProductInventory', params: {}, matched: [] }, $t: key => key,
    AddOrUpdateItemByID(list, item) { const index = list.findIndex(row => row.id === item.id); if (index < 0) list.push(item); else list.splice(index, 1, item); },
    DeleteItemByID(list, id) { const index = list.findIndex(row => row.id === id); if (index >= 0) list.splice(index, 1); },
    remove(list, value) { const index = list.indexOf(value); if (index >= 0) list.splice(index, 1); },
    $forceUpdate() {}, $nextTick: Vue.nextTick, $store: { dispatch() {} }, ...patch,
  };
  Object.assign(state, component.data.call(state));
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, definition] of Object.entries(component.computed)) Object.defineProperty(state, name, {
    configurable: true,
    get: () => (typeof definition === 'function' ? definition : definition.get).call(state),
    ...(definition.set ? { set: value => definition.set.call(state, value) } : {}),
  });
  return { component, descriptor, state, requests, notices, confirmations };
}
const records = () => [
  { id: 1, name: 'lesson-01.mp3', size: 3000, downloads: 12, sample: false, created_at: '2026-11-10 10:00:00', download_at: '2026-11-11 10:00:00' },
  { id: 2, name: 'workbook.pdf', size: 5000, downloads: 4, sample: true, created_at: '2026-11-10 11:00:00', download_at: null },
];
const plain = value => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await setImmediate(); await Vue.nextTick(); };

test('native uploader retains multiple files, capacity bounds and the completion refresh', async () => {
  const f = fixture({ modern: false });
  assert.equal(f.component.props.modern.default, false);
  assert.equal(f.state.max_file_size_mb, 2000);
  assert.equal(f.state.max_total_files_mb, 300000);
  assert.equal(f.state.free_capacity_mb, 299999);
  f.state.fetchFiles = () => f.requests.push({ method: 'refresh' });
  f.state.handleProcessFile(null, {});
  f.state.handleProcessFile(new Error('fixture failed'), {});
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].method, 'refresh');
});

test('keyboard reordering respects boundaries and busy state before persisting the new order', async () => {
  const f = fixture();
  const file = f.state.files[0];
  f.state.moveFile(file, -1);
  assert.equal(f.requests.length, 0);
  f.state.busy_fetch = true;
  f.state.moveFile(file, 1);
  assert.equal(f.requests.length, 0);
  f.state.busy_fetch = false;
  f.state.moveFile(file, 1);
  assert.deepEqual(f.state.product.files.map(row => row.id), [2, 1]);
  assert.deepEqual(plain(f.requests[0].payload), { sort: [2, 1] });
  assert.match(f.requests[0].url, /PUT_SET_PRODUCT_FILES_SORT\/3\/9$/);
  f.requests[0].resolve({}); await settle();
  assert.equal(Boolean(f.state.busy_sort), false);
});

test('column sorting is stable, numeric where appropriate and never mutates or persists the manual collection', () => {
  const f = fixture();
  const rows = [
    { ...records()[0], id: 1, name: 'chapter10.pdf', size: 100, downloads: 8, sample: false },
    { ...records()[0], id: 2, name: 'chapter2.pdf', size: 300, downloads: 1, sample: true },
    { ...records()[0], id: 3, name: 'Chapter2.pdf', size: 200, downloads: 1, sample: false },
    { ...records()[0], id: 4, name: 'alpha.pdf', size: 300, downloads: 0, sample: true },
  ];
  f.state.product.files = Object.freeze(rows.map(Object.freeze));
  const manual = f.state.files;
  for (const [key, ascending, descending] of [
    ['name', [4, 2, 3, 1], [1, 2, 3, 4]],
    ['sample', [1, 3, 2, 4], [2, 4, 1, 3]],
    ['downloads', [4, 2, 3, 1], [1, 2, 3, 4]],
    ['size', [1, 3, 2, 4], [2, 4, 3, 1]],
  ]) {
    f.state.setFileSort(key);
    assert.deepEqual(Array.from(f.state.display_files, row => row.id), ascending, `${key} ascending`);
    f.state.setFileSort(key);
    assert.deepEqual(Array.from(f.state.display_files, row => row.id), descending, `${key} descending`);
    assert.equal(f.state.files, manual);
    assert.deepEqual(f.state.files.map(row => row.id), [1, 2, 3, 4]);
    f.state.setFileSort('');
    assert.equal(f.state.display_files, manual);
    assert.equal(f.state.file_sort_desc, false);
  }
  assert.equal(f.requests.length, 0);
});

test('sorted mode rejects drag models and keyboard persistence while legacy ordering remains available', () => {
  const f = fixture();
  const manual = f.state.files;
  f.state.setFileSort('name');
  f.state.display_files = manual.slice().reverse();
  f.state.moveFile(manual[0], 1);
  f.state.changeFilesOrder();
  assert.equal(f.state.files, manual);
  assert.equal(f.requests.length, 0);
  f.state.modern = false;
  assert.equal(f.state.display_files, manual);
  f.state.display_files = manual.slice().reverse();
  assert.deepEqual(f.state.files.map(row => row.id), [2, 1]);
});

test('rename retains the original extension and closes only after successful persistence', async () => {
  const f = fixture(), file = f.state.files[0];
  f.state.renameFile(file);
  f.state.rename_name = 'new-name';
  const failed = f.state.saveFileName();
  assert.equal(f.requests[0].payload.name, 'new-name.mp3');
  f.requests[0].resolve({ error: true, error_msg: 'Fixture validation failure' });
  await failed; await settle();
  assert.equal(f.state.rename_file.id, file.id);
  assert.equal(f.state.rename_name, 'new-name');
  assert.equal(file.name, 'lesson-01.mp3');
  const saved = f.state.saveFileName();
  f.requests[1].resolve({ file: { ...file, name: 'new-name.mp3' } });
  await saved; await settle();
  assert.equal(f.state.rename_dialog, false);
  assert.equal(f.state.files[0].name, 'new-name.mp3');
});

test('sample access honors the 50 MB boundary and retains the draft after failure', async () => {
  const f = fixture(), file = f.state.files[0];
  file.size = 50 * 1024 + 1;
  assert.equal(await f.state.setSample(file, true), false);
  assert.equal(f.requests.length, 0);
  file.size = 50 * 1024;
  f.state.editAccess(file); f.state.access_sample = true;
  const failed = f.state.saveAccess();
  assert.deepEqual(plain(f.requests[0].payload), { sample: true });
  f.requests[0].reject(new Error('Fixture network failure'));
  await failed; await settle();
  assert.equal(f.state.access_file.id, file.id);
  assert.equal(f.state.access_sample, true);
  const saved = f.state.saveAccess();
  f.requests[1].resolve({ file: { ...file, sample: true } });
  await saved; await settle();
  assert.equal(f.state.access_dialog, false);
  assert.equal(f.state.files[0].sample, true);
});

for (const vendor of [false, true]) test(`${vendor ? 'vendor' : 'shop'} file operations keep their authenticated routes and content scope`, async () => {
  const f = fixture({ content: { id: 77, files: records() }, ...(vendor ? { $route: { params: { vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } } : {}) });
  const scope = vendor ? 'vendor' : 'shop';
  assert.match(f.state.getFileUrl(f.state.files[0]), new RegExp(`/fixture/${scope}/DOWNLOAD_`));
  const upload = f.state.getUploadUrl('fixture.pdf', 1000);
  assert.match(f.requests[0].url, new RegExp(`/fixture/${scope}/GET_`));
  assert.deepEqual(plain(f.requests[0].payload), { params: { content_id: 77, filename: 'fixture.pdf', size: 1000 } });
  f.requests[0].resolve({ success: true }); await upload; await settle();
  f.state.files = [f.state.files[1], f.state.files[0]];
  f.state.changeFilesOrder();
  assert.deepEqual(plain(f.requests[1].payload), { content_id: 77, sort: [2, 1] });
  f.requests[1].resolve({}); await settle();
  f.state.fetchFiles();
  assert.deepEqual(plain(f.requests[2].payload), { params: { content_id: 77 } });
  f.requests[2].resolve({ files: [] }); await settle();
  assert.deepEqual(f.state.content.files, []);
  assert.equal(f.state.product.files.length, 2);
  f.component.methods.fetchFiles.cancel?.();
});

test('deletion requires the existing confirmation and preserves data on failed requests', async () => {
  const f = fixture(), file = f.state.files[0];
  f.state.deleteFile(file);
  assert.equal(f.requests.length, 0);
  assert.equal(f.confirmations.length, 1);
  f.confirmations[0]();
  assert.match(f.requests[0].url, /DELETE_PRODUCT_FILE\/3\/9\/1$/);
  f.requests[0].reject(new Error('Fixture network failure')); await settle();
  assert.equal(f.state.files.length, 2);
  assert.equal(f.state.busy_delete, null);
  f.state.deleteFile(file); f.confirmations[1]();
  f.requests[1].resolve({ capacity: 512 }); await settle();
  assert.deepEqual(f.state.files.map(row => row.id), [2]);
  assert.equal(f.state.shop.capacity, 512);
});

test('deletion checks active uploads before opening and again when its confirmation is accepted', () => {
  const f = fixture(), file = f.state.files[0];
  f.state.uploading_array = [file.id];
  f.state.deleteFile(file);
  assert.equal(f.confirmations.length, 0);
  f.state.uploading_array = [];
  f.state.deleteFile(file);
  assert.equal(f.confirmations.length, 1);
  f.state.uploading_array = [file.id];
  f.confirmations[0]();
  assert.equal(f.requests.length, 0, 'an upload starting during confirmation prevents deletion');
  f.state.uploading_array = [];
  f.state.deleteFile(file);
  f.state.busy_fetch = true;
  f.confirmations[1]();
  assert.equal(f.requests.length, 0, 'a newly busy library prevents deletion');
  f.state.busy_fetch = false;
  f.state.deleteFile(file);
  f.state.files = f.state.files.filter(row => row.id !== file.id);
  f.confirmations[2]();
  assert.equal(f.requests.length, 0, 'a file removed while confirmation was open cannot be deleted again');
});

for (const vendor of [false, true]) test(`modern ${vendor ? 'vendor' : 'shop'} authorization preserves protected routes, content scope and cancellation`, async () => {
  const f = fixture({ content: { id: 77, files: records() }, ...(vendor ? { $route: { params: { vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } } : {}) });
  const controller = new AbortController();
  const pending = f.state.authorizeModernUpload({ name: 'new.pdf', size: 2048 }, controller.signal);
  const request = f.requests[0];
  assert.match(request.url, new RegExp(`/fixture/${vendor ? 'vendor/GET_MY_VENDOR_PRODUCT_FILE_UPLOAD_URL/4' : 'shop/GET_PRODUCT_FILE_UPLOAD_URL/3'}/9$`));
  assert.equal(request.payload.signal, controller.signal);
  assert.deepEqual(plain(request.payload.params), { content_id: 77, filename: 'new.pdf', size: 2048 });
  const reserved = { id: 3, name: 'new.pdf', size: 2, uploading: true };
  const descriptor = { success: true, capacity: 2048, file_item: reserved };
  request.resolve(descriptor);
  assert.equal(await pending, descriptor);
  await settle();
  assert.equal(f.state.shop.capacity, 2048);
  assert.equal(f.state.content.files.at(-1), reserved);
  assert.equal(f.state.product.files.length, 2);
  assert.equal(f.state.busy_request, false);
  const failed = f.state.authorizeModernUpload({ name: 'denied.pdf', size: 1024 }, controller.signal);
  f.requests[1].resolve({ error: true, error_msg: 'Private fixture authorization detail' });
  await assert.rejects(failed, /Upload authorization failed/);
  await settle();
  assert.deepEqual(f.notices, [], 'quiet authorization leaves bounded error presentation to the uploader');
});

test('concurrent reservations keep both files, request locks and the latest capacity despite response order', async () => {
  const f = fixture(), signal = new AbortController().signal;
  const first = f.state.authorizeModernUpload({ name: 'first.pdf', size: 1024 }, signal);
  const second = f.state.authorizeModernUpload({ name: 'second.pdf', size: 1024 }, signal);
  f.requests[1].resolve({ success: true, capacity: 4096, file_item: { id: 4, name: 'second.pdf', uploading: true } });
  await second;
  assert.equal(f.state.busy_request, true);
  f.requests[0].resolve({ success: true, capacity: 3072, file_item: { id: 3, name: 'first.pdf', uploading: true } });
  await first;
  assert.equal(f.state.busy_request, false);
  assert.equal(f.state.shop.capacity, 4096);
  assert.deepEqual(f.state.files.map(file => file.id), [1, 2, 4, 3]);
});

for (const changed of ['product', 'shop', 'content', 'aborted']) test(`modern upload authorization discards a response after ${changed} changes`, async () => {
  const f = fixture(), controller = new AbortController();
  const originalProduct = f.state.product, originalShop = f.state.shop;
  const pending = f.state.authorizeModernUpload({ name: 'new.pdf', size: 2048 }, controller.signal);
  if (changed === 'aborted') controller.abort();
  else if (changed === 'content') f.state.content = { id: 77, files: [] };
  else f.state[changed] = { ...f.state[changed] };
  f.requests[0].resolve({ success: true, capacity: 9000, file_item: { id: 3, name: 'new.pdf', uploading: true } });
  await assert.rejects(pending, /Upload scope changed/);
  await settle();
  assert.equal(originalShop.capacity, 1024);
  assert.equal(originalProduct.files.length, 2);
  assert.deepEqual(f.notices, []);
});

test('modern confirmation uses a fresh file read and remains false for pending, missing or failed files', async () => {
  const f = fixture();
  const file = f.state.files[0];
  for (const [response, expected] of [
    [{ files: [{ ...file, uploading: true }] }, false],
    [{ files: [] }, false],
    [{ error: true, error_msg: 'Private fixture read detail' }, false],
    [{ files: [{ ...file, uploading: false }] }, true],
  ]) {
    const index = f.requests.length;
    const confirming = f.state.confirmModernUpload(file);
    assert.equal(f.state.busy_fetch, true);
    assert.match(f.requests[index].url, /GET_PRODUCT_FILES\/3\/9$/);
    assert.equal(f.requests[index].method, 'get');
    f.requests[index].resolve(response);
    assert.equal(await confirming, expected);
  }
  const index = f.requests.length;
  const failed = f.state.confirmModernUpload(file);
  f.requests[index].reject(new Error('Fixture disconnected'));
  assert.equal(await failed, false);
  await settle();
  assert.equal(f.state.fetch_error, true);
  assert.deepEqual(f.notices, [], 'quiet confirmation does not expose request or provider details');
});

test('a confirmation read cannot update or confirm a different product or content', async () => {
  for (const changed of ['product', 'content']) {
    const f = fixture(), file = f.state.files[0];
    const originalFiles = f.state.files;
    const confirming = f.state.confirmModernUpload(file);
    if (changed === 'content') f.state.content = { id: 77, files: [] };
    else f.state.product = { id: 10, shop_id: 3, files: [] };
    f.requests[0].resolve({ files: [{ ...file, uploading: false }] });
    assert.equal(await confirming, false);
    assert.equal(originalFiles.length, 2);
    assert.deepEqual(f.state.files, []);
  }
});

for (const vendor of [false, true]) test(`modern ${vendor ? 'vendor' : 'shop'} recovery freshly distinguishes available, pending and complete files by ID before name`, async () => {
  const f = fixture({ content: { id: 77, files: records() }, ...(vendor ? { $route: { params: { vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } } : {}) });
  const signal = new AbortController().signal;
  const retryFile = { name: 'retry.pdf', size: 2048 };
  for (const [files, expected] of [
    [[], { kind: 'available' }],
    [[{ id: 7, name: 'renamed.pdf', uploading: true }, { id: 8, name: retryFile.name, uploading: false }], { kind: 'pending', id: 7 }],
    [[{ id: 8, name: retryFile.name, uploading: true }], { kind: 'pending', id: 8 }],
    [[{ id: 8, name: retryFile.name, uploading: false }], { kind: 'complete', id: 8 }],
  ]) {
    const recovering = f.state.recoverModernUpload(retryFile, 7, signal);
    const request = f.requests.at(-1);
    assert.equal(request.method, 'get');
    assert.match(request.url, new RegExp(`/fixture/${vendor ? 'vendor/GET_MY_VENDOR_PRODUCT_FILES/4' : 'shop/GET_PRODUCT_FILES/3'}/9$`));
    assert.equal(request.payload.signal, signal);
    assert.deepEqual(plain(request.payload.params), { content_id: 77 });
    request.resolve({ files });
    const result = await recovering;
    assert.equal(result.kind, expected.kind);
    assert.equal(result.fileItem?.id, expected.id);
    if (expected.id) assert.equal(result.fileItem, files.find(item => item.id === expected.id));
    assert.equal(f.state.content.files, files);
  }
  assert.equal(f.confirmations.length, 0);
  assert.ok(f.requests.every(request => request.method === 'get'), 'recovery never deletes or reserves a file automatically');
});

test('modern recovery fails quietly after failed reads, aborts or a shop/product/content scope change', async () => {
  for (const changed of ['failed', 'network', 'aborted', 'shop', 'product', 'content']) {
    const f = fixture(), controller = new AbortController();
    const originalFiles = f.state.files;
    const recovering = f.state.recoverModernUpload({ name: 'retry.pdf' }, 7, controller.signal);
    if (changed === 'aborted') controller.abort();
    if (changed === 'shop') f.state.shop = { ...f.state.shop, id: 4 };
    if (changed === 'product') f.state.product = { id: 10, shop_id: 3, files: [] };
    if (changed === 'content') f.state.content = { id: 77, files: [] };
    if (changed === 'network') f.requests[0].reject(new Error('Fixture disconnected'));
    else f.requests[0].resolve(changed === 'failed' ? { error: true, error_msg: 'Private fixture read detail' } : { files: [{ id: 7, name: 'retry.pdf', uploading: false }] });
    await assert.rejects(recovering, /Upload recovery unavailable/, changed);
    assert.equal(originalFiles.length, 2);
    assert.deepEqual(f.notices, [], 'quiet recovery leaves bounded feedback to the queue');
    assert.equal(f.confirmations.length, 0);
    assert.equal(f.requests.length, 1);
  }
});

test('removing a recovered upload that is complete or missing only retries after a fresh read', async () => {
  for (const files of [[{ id: 7, name: 'retry.pdf', uploading: false }], []]) {
    const retries = [];
    const f = fixture({ $refs: { modernUploader: { retryRecord: id => retries.push(id) } } });
    f.state.files.push({ id: 7, name: 'retry.pdf', uploading: true });
    const removing = f.state.removePendingUpload({ id: 42, fileId: 7 });
    assert.equal(f.requests[0].method, 'get');
    assert.deepEqual(retries, []);
    f.requests[0].resolve({ files });
    await removing;
    assert.deepEqual(retries, [42]);
    assert.equal(f.confirmations.length, 0);
    assert.equal(f.requests.length, 1, 'a complete or missing file must never be deleted');
  }
});

test('pending-upload removal does nothing after a failed refresh, scope change or active upload', async () => {
  for (const changed of ['failed', 'network', 'shop', 'product', 'content', 'active']) {
    const retries = [];
    const f = fixture({ $refs: { modernUploader: { retryRecord: id => retries.push(id) } } });
    const removing = f.state.removePendingUpload({ id: 42, fileId: 7 });
    if (changed === 'shop') f.state.shop = { ...f.state.shop, id: 4 };
    if (changed === 'product') f.state.product = { id: 10, shop_id: 3, files: [] };
    if (changed === 'content') f.state.content = { id: 77, files: [] };
    if (changed === 'active') f.state.uploading_array = [7];
    if (changed === 'network') f.requests[0].reject(new Error('Fixture disconnected'));
    else f.requests[0].resolve(changed === 'failed' ? { error: true, error_msg: 'Private fixture read detail' } : { files: [{ id: 7, name: 'retry.pdf', uploading: true }] });
    await removing;
    assert.deepEqual(retries, [], changed);
    assert.equal(f.confirmations.length, 0, changed);
    assert.equal(f.requests.length, 1, changed);
    assert.deepEqual(f.notices, []);
  }
});

test('pending-upload removal requires native confirmation, rechecks, then retries exactly once after successful deletion', async () => {
  const retries = [];
  const f = fixture({ $refs: { modernUploader: { retryRecord: id => retries.push(id) } } });
  const pendingFile = { id: 7, name: 'retry.pdf', uploading: true };
  const removing = f.state.removePendingUpload({ id: 42, fileId: 7 });
  f.requests[0].resolve({ files: [...records(), pendingFile] });
  await removing;
  assert.equal(f.confirmations.length, 1);
  assert.equal(f.requests.length, 1, 'fresh discovery alone cannot delete the pending reservation');
  assert.deepEqual(retries, []);
  const confirming = f.confirmations[0]();
  assert.equal(f.requests[1].method, 'get', 'accepting the native confirmation triggers another fresh read');
  assert.equal(f.requests.filter(request => request.method === 'delete').length, 0);
  f.requests[1].resolve({ files: [...records(), pendingFile] });
  await confirming;
  assert.equal(f.requests[2].method, 'delete');
  assert.match(f.requests[2].url, /DELETE_PRODUCT_FILE\/3\/9\/7$/);
  assert.deepEqual(retries, [], 'retry waits until deletion succeeds');
  f.requests[2].resolve({ capacity: 512 }); await settle();
  assert.deepEqual(retries, [42]);
  assert.deepEqual(f.state.files.map(file => file.id), [1, 2]);
  assert.equal(f.state.shop.capacity, 512);
  assert.equal(f.state.busy_delete, null);
});

test('a pending file completed or removed while its confirmation was open is retried without DELETE', async () => {
  for (const files of [[{ id: 7, name: 'retry.pdf', uploading: false }], []]) {
    const retries = [];
    const f = fixture({ $refs: { modernUploader: { retryRecord: id => retries.push(id) } } });
    const removing = f.state.removePendingUpload({ id: 42, fileId: 7 });
    f.requests[0].resolve({ files: [{ id: 7, name: 'retry.pdf', uploading: true }] });
    await removing;
    const confirming = f.confirmations[0]();
    f.requests[1].resolve({ files });
    await confirming;
    assert.deepEqual(retries, [42]);
    assert.ok(f.requests.every(request => request.method === 'get'));
    assert.equal(f.state.files, files);
  }
});

test('the confirmed recovery recheck retains scope, active-upload and failed-read guards', async () => {
  for (const changed of ['shop-before', 'product-before', 'content-before', 'shop-after', 'product-after', 'content-after', 'active', 'busy', 'failed', 'network']) {
    const retries = [];
    const f = fixture({ $refs: { modernUploader: { retryRecord: id => retries.push(id) } } });
    const pendingFile = { id: 7, name: 'retry.pdf', uploading: true };
    const removing = f.state.removePendingUpload({ id: 42, fileId: 7 });
    f.requests[0].resolve({ files: [pendingFile] }); await removing;
    if (changed === 'shop-before') f.state.shop = { ...f.state.shop, id: 4 };
    if (changed === 'product-before') f.state.product = { id: 10, shop_id: 3, files: [] };
    if (changed === 'content-before') f.state.content = { id: 77, files: [] };
    const confirming = f.confirmations[0]();
    if (changed.endsWith('-before')) assert.equal(f.requests.length, 1, 'a changed scope prevents even the recheck');
    else {
      if (changed === 'shop-after') f.state.shop = { ...f.state.shop, id: 4 };
      if (changed === 'product-after') f.state.product = { id: 10, shop_id: 3, files: [] };
      if (changed === 'content-after') f.state.content = { id: 77, files: [] };
      if (changed === 'active') f.state.uploading_array = [7];
      if (changed === 'busy') f.state.busy_sort = true;
      if (changed === 'network') f.requests[1].reject(new Error('Fixture disconnected'));
      else f.requests[1].resolve(changed === 'failed' ? { error: true, error_msg: 'Private fixture read detail' } : { files: [pendingFile] });
    }
    await confirming;
    assert.deepEqual(retries, [], changed);
    assert.ok(f.requests.every(request => request.method === 'get'), changed);
    assert.deepEqual(f.notices, []);
  }
});

test('a failed confirmed pending-file deletion keeps the reservation and never retries', async () => {
  for (const failure of ['application', 'network', 'success_false']) {
    const retries = [];
    const f = fixture({ $refs: { modernUploader: { retryRecord: id => retries.push(id) } } });
    const pendingFile = { id: 7, name: 'retry.pdf', uploading: true };
    const removing = f.state.removePendingUpload({ id: 42, fileId: 7 });
    f.requests[0].resolve({ files: [pendingFile] }); await removing;
    const confirming = f.confirmations[0]();
    f.requests[1].resolve({ files: [pendingFile] }); await confirming;
    if (failure === 'network') f.requests[2].reject(new Error('Fixture disconnected'));
    else f.requests[2].resolve(failure === 'success_false' ? { success: false, capacity: 0 } : { error: true, error_msg: 'Fixture deletion denied' });
    await settle();
    assert.deepEqual(retries, []);
    assert.equal(f.state.files[0], pendingFile);
    assert.equal(f.state.busy_delete, null);
    assert.equal(f.state.shop.capacity, 1024);
    assert.equal(f.notices.length, 1);
    assert.notEqual(f.notices[0].name, 'showSuccessAlert');
    if (failure === 'success_false') assert.equal(f.notices[0].args[1], 'global.notification.error_message');
  }
});

test('an in-flight deletion cannot mutate a changed shop, product or content, continue its retry or clear a newer delete lock', async () => {
  for (const changed of ['shop', 'product', 'content']) {
    for (const network of [false, true]) {
      const retries = [];
      const f = fixture({
        ...(changed === 'content' ? { content: { id: 77, files: records() } } : {}),
        $refs: { modernUploader: { retryRecord: id => retries.push(id) } },
      });
      const pendingFile = { ...f.state.files[0], uploading: true };
      f.state.files = [pendingFile, f.state.files[1]];
      const originalFiles = f.state.files, originalShop = f.state.shop;
      f.state.deleteFile(pendingFile, () => f.state.$refs.modernUploader.retryRecord(42));
      const confirming = f.confirmations[0]();
      f.requests[0].resolve({ files: originalFiles });
      await confirming;
      assert.equal(f.requests[1].method, 'delete');
      if (changed === 'shop') f.state.shop = { ...f.state.shop, id: 4, capacity: 7777 };
      if (changed === 'product') f.state.product = { id: 10, shop_id: 3, files: records() };
      if (changed === 'content') f.state.content = { id: 78, files: records() };
      const currentFiles = f.state.files, currentCapacity = f.state.shop.capacity, newerDelete = { id: 999 };
      f.state.busy_delete = newerDelete;
      if (network) f.requests[1].reject(new Error('Fixture old-scope disconnect'));
      else f.requests[1].resolve({ success: true, capacity: 0 });
      await settle();
      assert.deepEqual(originalFiles.map(file => file.id), [1, 2]);
      assert.equal(f.state.files, currentFiles);
      assert.deepEqual(currentFiles.map(file => file.id), [1, 2]);
      assert.equal(originalShop.capacity, 1024);
      assert.equal(f.state.shop.capacity, currentCapacity);
      assert.equal(f.state.busy_delete, newerDelete);
      assert.deepEqual(retries, []);
      assert.deepEqual(f.notices, [], 'old-scope responses do not notify the new workspace');
    }
  }
});

test('successful pending-file deletion releases its exact lock and waits for the uploader prop flush before retry', async () => {
  for (const changed of ['none', 'new_lock', 'scope']) {
    let finishFlush;
    const flush = new Promise(resolve => { finishFlush = resolve; });
    const retries = [], f = fixture({ $nextTick: () => flush });
    const pending = { id: 7, name: 'retry.pdf', uploading: true };
    f.state.files = [pending];
    f.state.deleteFile(pending, () => { assert.equal(f.state.busy_delete, null); retries.push(42); });
    const confirming = f.confirmations[0]();
    f.requests[0].resolve({ files: [pending] }); await confirming;
    assert.equal(f.requests[1].method, 'delete');
    f.requests[1].resolve({ success: true, capacity: 0 }); await settle();
    assert.equal(f.state.busy_delete, null, 'the deleting operation releases its own lock first');
    assert.deepEqual(retries, [], 'a successful response alone cannot retry against a still-disabled child');
    const nextLock = { id: 99 };
    if (changed === 'new_lock') f.state.busy_delete = nextLock;
    if (changed === 'scope') f.state.product = { id: 10, shop_id: 3, files: [] };
    finishFlush(); await settle();
    assert.deepEqual(retries, changed === 'none' ? [42] : []);
    if (changed === 'new_lock') assert.equal(f.state.busy_delete, nextLock);
  }
});

test('modern upload changes synchronize active file progress and clean completed items from the global keeper', () => {
  const dispatched = [];
  const f = fixture({ $store: { dispatch: action => dispatched.push(plain(action)) } });
  f.state.uploading_array = [99, 1];
  f.state.updateModernUploads([
    { fileId: 1, name: 'first.pdf', status: 'uploading', progress: 64 },
    { fileId: 2, name: 'second.pdf', status: 'authorizing', progress: null },
    { fileId: 3, name: 'third.pdf', status: 'confirming', progress: 100 },
    { fileId: 4, name: 'done.pdf', status: 'done', progress: 100 },
    { fileId: 5, name: 'failed.pdf', status: 'error', progress: 20 },
    { fileId: 6, name: 'cancelled.pdf', status: 'cancelled', progress: 20 },
    { fileId: 7, name: 'reserved.pdf', status: 'queued' },
    { fileId: null, name: 'waiting.pdf', status: 'queued' },
  ]);
  assert.deepEqual(Array.from(f.state.uploading_array), [1, 2, 3, 7]);
  assert.deepEqual(plain(f.state.uploading_progress), { 1: 64, 2: 0, 3: 100, 7: 0 });
  assert.deepEqual(dispatched, [
    { type: 'removeUploadingFile', file_id: 99 },
    { type: 'addUploadingFile', file_id: 1, name: 'first.pdf', progress: 64 },
    { type: 'addUploadingFile', file_id: 2, name: 'second.pdf', progress: 0 },
    { type: 'addUploadingFile', file_id: 3, name: 'third.pdf', progress: 100 },
    { type: 'addUploadingFile', file_id: 7, name: 'reserved.pdf', progress: 0 },
  ]);
  dispatched.length = 0;
  f.state.updateModernUploads([{ fileId: 1, name: 'first.pdf', status: 'done', progress: 100 }]);
  assert.deepEqual(Array.from(f.state.uploading_array), []);
  assert.deepEqual(plain(f.state.uploading_progress), {});
  assert.deepEqual(dispatched, [1, 2, 3, 7].map(file_id => ({ type: 'removeUploadingFile', file_id })));
  f.state.updateModernUploads([{ fileId: 8, name: 'last.pdf', status: 'uploading', progress: 25 }]);
  f.component.beforeUnmount.call(f.state);
  assert.deepEqual(dispatched.at(-1), { type: 'removeUploadingFile', file_id: 8 });
  assert.deepEqual(Array.from(f.state.uploading_array), []);
});

test('the actual Vue template and scoped Sass compile with production asset transformation', async () => {
  const f = fixture();
  for (const style of f.descriptor.styles) {
    const result = await compileStyleAsync({ source: style.content, filename: fileURLToPath(file), id: 'data-v-file-inventory-test', scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(result.errors, []);
  }
});

test('all referenced modern file copy resolves in English and Persian with matching interpolation placeholders', () => {
  const paths = new Set([...readFileSync(file, 'utf8').matchAll(/["'](product_file\.modern\.[\w.]+)["']/g)].map(match => match[1]));
  assert.ok(paths.size, 'the component references its modern file copy');
  const dictionaries = ['en', 'fa'].map(locale => {
    const exports = {};
    vm.runInNewContext(transpile(source(`@selldone/translate/dashboard/${locale}.ts`)), { exports });
    return exports.default;
  });
  for (const path of paths) {
    const [english, persian] = dictionaries.map(dictionary => path.split('.').reduce((value, key) => value?.[key], dictionary));
    assert.equal(typeof english, 'string', `Missing English copy: ${path}`);
    assert.equal(typeof persian, 'string', `Missing Persian copy: ${path}`);
    assert.ok(english.trim(), `Empty English copy: ${path}`);
    assert.ok(persian.trim(), `Empty Persian copy: ${path}`);
    const placeholders = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    assert.deepEqual(placeholders(english), placeholders(persian), path);
  }
});

const node = (type, text = '') => ({ type, text, props: {}, style: {}, children: [], parent: null });
const renderer = Vue.createRenderer({
  createElement: type => node(type), createText: text => node('text', text), createComment: text => node('comment', text),
  insert(child, parent, anchor = null) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    parent.children.splice(anchor ? parent.children.indexOf(anchor) : parent.children.length, 0, child); child.parent = parent;
  },
  remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
  setText(child, text) { child.text = text; }, setElementText(child, text) { child.text = text; child.children = []; },
  patchProp(child, key, previous, next) { child.props[key] = next; }, parentNode: child => child.parent,
  nextSibling: child => child.parent?.children[child.parent.children.indexOf(child) + 1] || null,
});
const walk = (value, predicate) => [...(predicate(value) ? [value] : []), ...value.children.flatMap(child => walk(child, predicate))];
async function rendered(t, patch = {}) {
  const f = fixture(patch), failures = [];
  const props = Vue.reactive({ modern: patch.modern ?? true, product: f.state.product, shop: f.state.shop, content: f.state.content });
  let state;
  const app = renderer.createApp({ render: () => Vue.h({ ...f.component, render(...args) { state = this; return f.component.render.apply(this, args); } }, props) });
  Object.assign(app.config.globalProperties, {
    $t: key => key, $route: f.state.$route, $vuetify: { locale: { isRtl: !!patch.rtl }, theme: { current: { colors: { primary: '#126bea' } } } }, USER: () => ({ permissions: !!patch.permissions }),
    numeralFormat: value => String(value), AddOrUpdateItemByID: f.state.AddOrUpdateItemByID, DeleteItemByID: f.state.DeleteItemByID,
    remove: f.state.remove, $store: f.state.$store,
  });
  for (const name of ['VIcon', 'VBtn', 'VTooltip', 'VRow', 'VCol', 'VListSubheader', 'VListItem', 'VListItemTitle', 'VListItemSubtitle', 'VListItemAction', 'VAvatar', 'VChip', 'VExpandTransition', 'VExpansionPanels', 'VExpansionPanel', 'VExpansionPanelTitle', 'VExpansionPanelText', 'VProgressLinear', 'VList', 'VMenu', 'VContainer', 'VDialog', 'VCard', 'VCardText', 'VCardTitle', 'VCardActions', 'VTextField', 'VLocaleProvider', 'VRadioGroup', 'VRadio', 'UWidgetHeader', 'ULoadingProgress']) app.component(name, stub(name));
  app.config.warnHandler = warning => failures.push(warning);
  app.config.errorHandler = error => failures.push(error);
  const root = node('root'); app.mount(root); await settle();
  t.after(() => { app.unmount(); f.component.methods.fetchFiles.cancel?.(); assert.deepEqual(failures, []); });
  return { ...f, state, props, root, all: predicate => walk(root, predicate) };
}

test('nonempty rows render with their real DateMixin, a scoped custom uploader and protected downloads', async t => {
  const f = await rendered(t);
  assert.equal(typeof f.state.getLocalTimeString, 'function');
  assert.ok(f.state.getLocalTimeString(f.state.files[0].created_at));
  const uploader = f.all(node => node.type === 'BProductFileUploader')[0];
  assert.equal(f.all(node => node.type === 'FilePond').length, 0);
  assert.equal(uploader.props['max-file-bytes'], 2000 * 1024 * 1024);
  assert.equal(uploader.props['available-bytes'], 300000 * 1024 * 1024 - f.state.shop.capacity * 1024);
  assert.equal(uploader.props['existing-files'], f.state.files);
  assert.equal(uploader.props.authorize, f.state.authorizeModernUpload);
  assert.equal(uploader.props.confirm, f.state.confirmModernUpload);
  assert.equal(uploader.props.recover, f.state.recoverModernUpload);
  assert.equal(uploader.props.onRemovePending, f.state.removePendingUpload);
  assert.equal(uploader.props.disabled, false);
  const downloads = f.all(node => node.props.href?.includes('DOWNLOAD_PRODUCT_FILE'));
  assert.equal(downloads.length, 2);
  assert.ok(downloads.every(node => node.props.target === '_blank'));
  assert.equal(f.all(node => node.text === 'product_file.modern.no_downloads').length, 0, 'a missing download timestamp does not erase a positive download count');
});

test('modern uploader changes update parent locks and global progress without legacy aggregate controls', async t => {
  const dispatched = [];
  const f = await rendered(t, { $store: { dispatch: action => dispatched.push(plain(action)) } });
  const uploader = () => f.all(node => node.type === 'BProductFileUploader')[0];
  assert.equal(f.all(node => node.type === 'VExpansionPanels').length, 0);
  uploader().props.onChange([{ fileId: 1, name: 'lesson-01.mp3', status: 'uploading', progress: 72 }]);
  await settle();
  assert.deepEqual(Array.from(f.state.uploading_array), [1]);
  assert.equal(f.state.uploading_progress[1], 72);
  assert.deepEqual(dispatched.at(-1), { type: 'addUploadingFile', file_id: 1, name: 'lesson-01.mp3', progress: 72 });
  assert.equal(f.all(node => node.type === 'UTextValueBox').length, 0);
  assert.equal(f.all(node => node.type === 'USparkline').length, 0, 'per-file upload measurements belong to the custom uploader');
  f.state.busy_fetch = true;
  await settle();
  assert.equal(uploader().props.disabled, true);
  f.state.busy_fetch = false;
  uploader().props.onChange([{ fileId: 1, name: 'lesson-01.mp3', status: 'done', progress: 100 }]);
  await settle();
  assert.deepEqual(Array.from(f.state.uploading_array), []);
  assert.deepEqual(dispatched.at(-1), { type: 'removeUploadingFile', file_id: 1 });
});

test('an in-flight deletion disables uploader Retry and prevents another native delete without adding global loading', async t => {
  const f = await rendered(t);
  const uploader = () => f.all(node => node.type === 'BProductFileUploader')[0];
  f.state.deleteFile(f.state.files[0]);
  f.confirmations[0](); await settle();
  assert.equal(f.requests[0].method, 'delete');
  assert.equal(f.state.file_busy, false, 'a row delete keeps its existing loader');
  assert.equal(uploader().props.disabled, true, 'the queue cannot retry while its reservation is being deleted');
  assert.equal(f.all(node => node.type === 'ULoadingProgress').length, 0);
  f.state.deleteFile(f.state.files[1]);
  assert.equal(f.confirmations.length, 1);
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve({ success: true, capacity: 0 }); await settle();
  assert.equal(uploader().props.disabled, false);
});

test('legacy uploader retains native FilePond configuration and staff-only transport options', async t => {
  const f = await rendered(t, { modern: false });
  const pond = f.all(node => node.type === 'FilePond')[0];
  assert.equal(f.all(node => node.type === 'BProductFileUploader').length, 0);
  assert.equal(pond.props['allow-image-preview'], true);
  assert.equal(pond.props['allow-multiple'], true);
  assert.equal(pond.props.maxFileSize, '2000MB');
  assert.equal(pond.props.maxTotalFileSize, '299999MB');
  assert.equal(typeof pond.props.server.process, 'function');
  assert.equal(pond.props.onProcessfile, f.state.handleProcessFile);
  assert.equal(f.all(node => node.type === 'VExpansionPanels').length, 0, 'ordinary users cannot see staff transport controls');
  const staff = await rendered(t, { modern: false, permissions: true });
  assert.equal(staff.all(node => node.type === 'VExpansionPanels').length, 1);
});

test('legacy upload details retain their existing speed, time and sparkline controls', async t => {
  const f = await rendered(t, { modern: false });
  f.state.uploading_array = [1];
  f.state.upload_speed = 2048;
  f.state.remain_seconds = 65;
  await settle();
  const metric = label => f.all(node => node.type === 'UTextValueBox' && node.props.label === label)[0];
  assert.equal(metric('global.commons.speed').props.value, '2048');
  assert.equal(metric('global.commons.time').props.value, '00:01:05');
  const sparkline = f.all(node => node.type === 'USparkline')[0];
  assert.equal(sparkline.props.height, 24);
  assert.equal(sparkline.props.color, 'blue');
  assert.equal(f.all(node => String(node.props.class || '').split(' ').includes('b-product-files__transfer')).length, 0);
  f.state.uploading_array = [];
  await settle();
  assert.equal(metric('global.commons.time').props.value, 'global.commons.finished');
});

test('RTL rename keeps the editable base name LTR and preserves its isolated read-only extension in the saved payload', async t => {
  const f = await rendered(t, { rtl: true });
  f.state.renameFile(f.state.files[0]); await settle();
  const provider = f.all(node => node.type === 'VLocaleProvider')[0];
  const field = f.all(node => node.type === 'VTextField')[0];
  const extension = f.all(node => node.type === 'bdi' && node.props.class === 'b-product-files__extension')[0];
  assert.equal(provider.props.rtl, false);
  assert.equal(field.props.dir, 'ltr');
  assert.equal(extension.text, '.mp3');
  field.props['onUpdate:modelValue']('درس مقدماتی');
  const saved = f.state.saveFileName();
  assert.equal(f.requests[0].payload.name, 'درس مقدماتی.mp3');
  f.requests[0].resolve({ file: { ...f.state.files[0], name: 'درس مقدماتی.mp3' } });
  await saved; await settle();
  assert.equal(f.state.rename_dialog, false);
});

test('legacy subscription files retain their own list and omit paid/sample product controls', async t => {
  const f = await rendered(t, { modern: false, content: { id: 77, files: records() } });
  assert.equal(f.all(node => node.type === 'UWidgetHeader' && node.props.title === 'global.commons.upload').length, 1);
  assert.equal(f.all(node => node.props.title === 'Toggle free/paid mode.').length, 0);
  assert.equal(f.all(node => node.props.to?.name === 'BPageShopSettingFlow').length, 0);
  f.state.editAccess(f.state.files[0]);
  assert.equal(f.state.access_dialog, false);
});

test('vendor rendering keeps storage and merchant checkout settings hidden', async t => {
  const f = await rendered(t, { $route: { params: { vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } });
  assert.equal(f.all(node => String(node.props.class || '').split(' ').includes('b-product-files__storage')).length, 0);
  assert.equal(f.all(node => node.props.to?.name === 'BPageShopSettingFlow').length, 0);
  assert.equal(f.all(node => node.props.href?.includes('/fixture/vendor/DOWNLOAD_')).length, 2);
});

test('successful empty, pending and failed lists remain distinct', async t => {
  const f = await rendered(t, { product: { id: 9, shop_id: 3, vendor_id: 4, files: [] } });
  const empty = () => f.all(node => String(node.props.class || '').split(' ').includes('b-list-empty-state')).length;
  assert.equal(empty(), 1);
  f.state.busy_fetch = true; await settle(); assert.equal(empty(), 0);
  f.state.busy_fetch = false; f.state.fetch_error = true; await settle(); assert.equal(empty(), 0);
  assert.ok(f.all(node => node.props.role === 'alert').length);
});

test('the rendered draggable event persists its reordered model rather than the previous order', async t => {
  const f = await rendered(t);
  const draggable = f.all(node => node.type === 'draggable')[0];
  draggable.props['onUpdate:modelValue']([f.state.files[1], f.state.files[0]]);
  assert.deepEqual(f.state.product.files.map(row => row.id), [2, 1]);
  assert.deepEqual(plain(f.requests[0].payload), { sort: [2, 1] });
  f.requests[0].resolve({}); await settle();
});

test('desktop headers and mobile controls share local sorting, accessible direction and an explicit manual reset', async t => {
  const f = await rendered(t);
  const classes = name => f.all(node => String(node.props.class || '').split(' ').includes(name));
  const text = node => walk(node, () => true).map(node => node.text).join(' ');
  const headings = () => f.all(node => node.props.role === 'columnheader' && node.props['aria-sort']);
  const header = key => headings().find(node => text(node).includes(key));
  const drag = () => f.all(node => node.type === 'draggable')[0];
  const rowNames = () => classes('b-product-files__name').map(node => text(node).trim());
  assert.equal(headings().length, 4);
  assert.ok(headings().every(node => node.props['aria-sort'] === 'none'));
  assert.equal(drag().props.disabled, false);
  const sizeHeading = header('global.commons.size');
  walk(sizeHeading, node => node.type === 'button')[0].props.onClick();
  await settle();
  assert.equal(header('global.commons.size').props['aria-sort'], 'ascending');
  assert.equal(drag().props.disabled, true);
  assert.ok(classes('b-product-files__drag').every(node => node.props.disabled));
  const direction = classes('b-product-files__sort-direction')[0];
  assert.equal(direction.type, 'VBtn');
  assert.ok(Object.hasOwn(direction.props, 'icon'));
  assert.ok(direction.props.class.includes('sd-modern-icon-button'));
  assert.equal(direction.props['aria-label'], 'product_file.modern.descending', 'the accessible name describes the next action');
  const directionTooltip = f.all(node => node.type === 'VTooltip' && node.props.text === 'product_file.modern.descending')[0];
  assert.equal(directionTooltip.props.location, 'top');
  assert.equal(directionTooltip.props['content-class'], 'sd-modern-tooltip');
  assert.ok(classes('b-product-files__sort-reset')[0].props.class.includes('sd-modern-button--inline'));
  const select = classes('b-product-files__mobile-sort')[0].children.find(node => node.type === 'select');
  select.props.onChange({ target: { value: 'downloads' } });
  await settle();
  assert.equal(f.state.file_sort_key, 'downloads');
  assert.deepEqual(rowNames(), ['workbook.pdf', 'lesson-01.mp3']);
  classes('b-product-files__sort-direction')[0].props.onClick();
  await settle();
  assert.equal(header('global.commons.downloads').props['aria-sort'], 'descending');
  assert.equal(classes('b-product-files__sort-direction')[0].props['aria-label'], 'product_file.modern.ascending');
  assert.deepEqual(rowNames(), ['lesson-01.mp3', 'workbook.pdf']);
  drag().props['onUpdate:modelValue']([f.state.files[1], f.state.files[0]]);
  await settle();
  assert.deepEqual(f.state.product.files.map(row => row.id), [1, 2]);
  assert.equal(f.requests.length, 0, 'view sorting and a stray drag event cannot persist backend order');
  assert.ok(f.all(node => node.text === 'product_file.modern.sorted_order_hint').length);
  classes('b-product-files__sort-reset')[0].props.onClick();
  await settle();
  assert.equal(drag().props.disabled, false);
  assert.ok(headings().every(node => node.props['aria-sort'] === 'none'));
  assert.equal(classes('b-product-files__sort-reset').length, 0);
  assert.ok(f.all(node => node.text === 'product_file.drag_sort_msg').length);
  f.state.busy_fetch = true;
  await settle();
  assert.equal(drag().props.disabled, true, 'drag options cannot override the explicit busy guard');
});
