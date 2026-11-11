import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test, { after } from 'node:test';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import ts from 'typescript';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import { throttle } from 'lodash-es';

// Vue's DOM renderer and Sortable must see document before either module loads.
const dom = new JSDOM('<!doctype html><html><body><main id="files"></main></body></html>', { pretendToBeVisual: true, url: 'https://selldone.test/' });
const globals = ['window', 'document', 'Node', 'Element', 'HTMLElement', 'SVGElement', 'navigator', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'];
const previousGlobals = new Map(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
for (const name of globals) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: dom.window[name] });
const Vue = await import('vue');
const { default: Draggable } = await import('vuedraggable');
after(() => {
  dom.window.close();
  for (const name of globals) {
    const previous = previousGlobals.get(name);
    if (previous) Object.defineProperty(globalThis, name, previous);
    else delete globalThis[name];
  }
});

const componentFile = new URL('./BProductInventoryManagementFile.vue', import.meta.url);
const repository = new URL('../../../../../../../', import.meta.url);
const transpile = text => ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const helpers = new Map();
function helper(path) {
  if (helpers.has(path)) return helpers.get(path);
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(path, repository), 'utf8')), {
    exports, Array, console, window: { $language: { full_locale: 'en-US', calendar: { calendar: 'gregory' } } },
    require(name) {
      if (name.includes('DateConverter')) return helper('@selldone/core-js/helper/date/DateConverter.ts');
      if (name.includes('Calendar')) return helper('@selldone/core-js/enums/language/Calendar.ts');
      if (name.includes('ObjectPrototypes')) return helper('@selldone/core-js/prototypes/ObjectPrototypes.ts');
      if (name.includes('ProductType')) return { ProductType: Object.fromEntries(['PHYSICAL', 'FILE', 'SERVICE', 'SUBSCRIPTION'].map(code => [code, { code }])) };
      if (name.includes('LabelingOptions')) return helper('@selldone/core-js/enums/shop/options/LabelingOptions.ts');
      throw new Error(`Unexpected helper ${name}`);
    },
  });
  helpers.set(path, exports);
  return exports;
}
helper('@selldone/core-js/prototypes/ArrayPrototypes.ts');

const stub = (name, mounted) => ({ name, inheritAttrs: false, props: ['modelValue'], mounted, setup(props, { slots, attrs }) {
  return () => name === 'VDialog' && !props.modelValue ? null : Vue.h(name === 'VBtn' ? 'button' : 'div', attrs, [slots.activator?.({ props: {} }), slots.prepend?.(), slots.default?.(), slots['append-inner']?.(), slots.append?.()]);
} });
function load(onUploaderMounted) {
  const { descriptor, errors } = parse(readFileSync(componentFile, 'utf8'), { filename: fileURLToPath(componentFile) });
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: fileURLToPath(componentFile), id: 'real-draggable-files', compilerOptions: { hoistStatic: false } });
  assert.deepEqual(template.errors, []);
  const exports = {};
  const endpoint = new Proxy({}, { get: (_, key) => (...ids) => '/fixture/' + String(key) + '/' + ids.join('/') });
  vm.runInNewContext(transpile(descriptor.script.content + '\n' + template.code), {
    exports, console, setInterval, clearInterval, FormData, window: { API: endpoint, VAPI: endpoint },
    require(name) {
      if (name === 'vue') return { ...Vue, defineAsyncComponent: () => Draggable };
      if (name === 'lodash-es') return { throttle };
      if (name.includes('DateMixin')) return helper('@selldone/components-vue/mixin/date/DateMixin.ts');
      if (name.includes('ShopOptionsHelper')) return helper('@selldone/core-js/helper/shop/ShopOptionsHelper.ts');
      if (name.includes('ShopLicense')) return { Eligible: { GetFileUploadLimitMB: () => 2000, GetMaxCapacityMB: () => 300000 } };
      if (name.includes('NotificationService')) return { default: {} };
      if (name.includes('FilePondLoader')) return { default: { loadFilePondComponent: () => stub('FilePond') } };
      if (name.includes('BProductFileUploader')) return { default: stub('BProductFileUploader', onUploaderMounted) };
      if (name === '@selldone/core-js/utils') return { FileHelper: { GetFileExtensionImage: () => '/fixture/file.svg' } };
      if (name.endsWith('.vue')) return { default: stub(name.split('/').at(-1).replace('.vue', '')) };
      throw new Error(`Unexpected file-manager dependency ${name}`);
    },
  });
  return { ...exports.default, render: exports.render };
}

test('actual vuedraggable mounts nonempty file rows with live Sortable contexts and lets the custom uploader finish mounting', async t => {
  let uploaderMounts = 0;
  const failures = [], component = load(() => uploaderMounts++);
  const product = Vue.reactive({ id: 9, shop_id: 3, vendor_id: 4, files: [
    { id: 1, name: 'lesson.mp3', size: 2000, downloads: 3, sample: false, created_at: '2026-11-10 10:00:00', download_at: '2026-11-11 10:00:00' },
    { id: 2, name: 'sample.pdf', size: 1000, downloads: 0, sample: true, created_at: '2026-11-10 10:00:00', download_at: null },
  ] });
  const app = Vue.createApp(component, { modern: true, product, shop: { id: 3, capacity: 1024, options: [] } });
  Object.assign(app.config.globalProperties, { $t: key => key, $route: { params: {}, matched: [] }, USER: () => ({ permissions: false }), numeralFormat: value => String(value), $store: { dispatch() {} }, $vuetify: { locale: { isRtl: false } } });
  for (const name of ['VIcon', 'VBtn', 'VTooltip', 'VRow', 'VCol', 'VListSubheader', 'VListItem', 'VListItemTitle', 'VListItemSubtitle', 'VListItemAction', 'VAvatar', 'VChip', 'VExpandTransition', 'VExpansionPanels', 'VExpansionPanel', 'VExpansionPanelTitle', 'VExpansionPanelText', 'VProgressLinear', 'VList', 'VMenu', 'VContainer', 'VDialog', 'VCard', 'VCardText', 'VCardTitle', 'VCardActions', 'VTextField', 'VLocaleProvider', 'VRadioGroup', 'VRadio', 'UWidgetHeader', 'ULoadingProgress']) app.component(name, stub(name));
  app.config.errorHandler = error => failures.push(error);
  app.config.warnHandler = warning => failures.push(warning);
  t.after(() => { app.unmount(); assert.deepEqual(failures, []); });
  const manager = app.mount('#files');
  await Vue.nextTick();
  const assertContexts = ids => {
    const list = document.querySelector('ul.b-product-files__list');
    assert.ok(list, 'the real Sortable list mounted');
    const rows = [...list.children];
    assert.equal(rows.length, ids.length);
    rows.forEach((row, index) => {
      assert.equal(row.tagName, 'LI');
      assert.equal(row.__draggable_context?.element.id, ids[index], 'each real row has the correct underlying record');
      assert.equal(row.__draggable_context?.index, index);
    });
  };
  assertContexts([1, 2]);
  assert.equal(uploaderMounts, 1, 'a row-context error must not interrupt the custom uploader mount queue');
  assert.ok(document.querySelector('time').getAttribute('title'), 'the full manager used its real DateMixin');
  const sizeHeading = [...document.querySelectorAll('[role="columnheader"]')].find(heading => heading.textContent.includes('global.commons.size'));
  sizeHeading.querySelector('button').click();
  await Vue.nextTick(); assertContexts([2, 1]);
  assert.deepEqual(product.files.map(file => file.id), [1, 2], 'real draggable view sorting keeps saved order intact');
  assert.equal(sizeHeading.getAttribute('aria-sort'), 'ascending');
  assert.ok([...document.querySelectorAll('.b-product-files__drag')].every(button => button.disabled));
  document.querySelector('.b-product-files__sort-reset').click();
  await Vue.nextTick(); assertContexts([1, 2]);
  assert.ok([...document.querySelectorAll('.b-product-files__drag')].every(button => !button.disabled));
  manager.files = [product.files[1], product.files[0]];
  await Vue.nextTick(); assertContexts([2, 1]);
  manager.files = [];
  await Vue.nextTick(); assertContexts([]);
  assert.deepEqual(failures, []);
});
