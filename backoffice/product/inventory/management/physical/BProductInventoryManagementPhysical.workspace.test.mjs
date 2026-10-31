import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setImmediate } from 'node:timers/promises';
import test from 'node:test';
import vm from 'node:vm';
import { parse, compileTemplate } from '@vue/compiler-sfc';
import ts from 'typescript';

const physicalFile = new URL('./BProductInventoryManagementPhysical.vue', import.meta.url);
const wrapperFile = new URL('../BProductInventoryManagement.vue', import.meta.url);
const productTypes = Object.fromEntries(['PHYSICAL', 'VIRTUAL', 'FILE', 'SERVICE', 'SUBSCRIPTION'].map(code => [code, { code }]));

function readComponent(file, context = {}) {
  const { descriptor, errors } = parse(readFileSync(file, 'utf8'));
  assert.deepEqual(errors, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: 'inventory-workspace' }).errors, []);
  const source = ts.createSourceFile('inventory.ts', descriptor.script.content, ts.ScriptTarget.Latest, true);
  const options = source.statements.find(ts.isExportAssignment).expression.getText(source);
  const exports = {};
  vm.runInNewContext(ts.transpileModule('export default ' + options, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, ProductType: productTypes, BusinessModel: { MARKETPLACE: { code: 'MARKETPLACE' } },
    BProductInventoryManagementSubscription: {}, BProductInventoryManagementService: {}, BProductInventoryManagementFile: {},
    BProductInventoryManagementPhysical: {}, BProductInventoryManagementVirtual: {}, BPropertySetProductDialog: {},
    BProductVariantsOptionButton: {}, BProductVariantsBulkAdd: {}, USmartMenu: {}, UNumberInput: {}, BProductVariantAdd: {}, BProductVariantItem: {},
    ProductVariants: {}, GetVariantIconByCode: key => key,
    GetVariantNameByCode: (key, product) => product.property_set?.variants?.find(item => item.code === key)?.name || 'axis.' + key,
    ...context,
  });
  return exports.default;
}

function fixture(patch = {}) {
  const requests = [], notices = [];
  const endpoint = scope => new Proxy({}, { get: (_, name) => (...ids) => `/fixture/${scope}/${String(name)}/${ids.join('/')}` });
  const request = (url, payload, wrap = true) => new Promise((resolve, reject) => requests.push({
    url, payload, reject, resolve: data => resolve(wrap ? { data } : data),
  }));
  const component = readComponent(physicalFile, {
    axios: { post: (url, payload) => request(url, payload) },
    window: {
      API: endpoint('shop'), VAPI: endpoint('vendor'),
      $backoffice: { product: { setQuantity: (...args) => request('/fixture/shop/quantity', args, false) } },
      $vendor: { product: { setQuantity: (...args) => request('/fixture/vendor/quantity', args, false) } },
    },
    NotificationService: Object.fromEntries(['showSuccessAlert', 'showErrorAlert', 'showLaravelError'].map(name => [name, (...args) => notices.push({ name, args })])),
  });
  const state = {
    modern: true, productWorkspace: true, variantsCountPerPage: 10,
    product: { id: 9, shop_id: 3, vendor_id: 4, type: 'PHYSICAL', quantity: 12, product_variants: [] },
    shop: { id: 3 }, vendor: { id: 4 }, withTrashed: false,
    $route: { params: {}, query: {}, matched: [] }, $router: { replace() {} },
    $t: key => ({ 'axis.color': 'Color', 'axis.style': 'Style', 'axis.weight': 'Weight', 'b_product_inventory.default_property_set': 'Default Property Set', 'add_product.inventory_modern.no_options': 'No options selected' })[key] || key,
    $nextTick: callback => callback(), $forceUpdate() {}, getId: Number,
    AddOrUpdateItemByID(list, value) { const index = list.findIndex(item => item.id === value.id); if (index < 0) list.push(value); else list[index] = value; },
    ...patch,
  };
  Object.assign(state, component.data.call(state));
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  component.created.call(state);
  return { state, component, requests, notices };
}

test('workspace is opt-in and the shared wrapper preserves all native type branches', () => {
  const wrapper = readComponent(wrapperFile);
  assert.equal(wrapper.props.productWorkspace.default, false);
  assert.equal(readComponent(physicalFile).props.productWorkspace.default, false);
  for (const [type, name] of [['PHYSICAL', 'isPhysical'], ['VIRTUAL', 'isVirtual'], ['FILE', 'isFile'], ['SERVICE', 'isService'], ['SUBSCRIPTION', 'isSubscription']]) {
    assert.equal(wrapper.computed[name].call({ product: { type } }), true);
  }
});

test('collapsed option digest follows current axes and actual property-set names', () => {
  const product = { quantity: 10, property_set: { title: 'Workshop set', variants: [{ code: 'style', name: 'Pattern' }] }, product_variants: [{ id: 2, color: '#fff', style: 'Floral', weight: '100gr' }] };
  const { state } = fixture({ product });
  assert.equal(state.options_digest, 'Color · Pattern · Weight · Workshop set');
  state.has_style = false;
  assert.equal(state.options_digest, 'Color · Weight · Workshop set');
  state.product.property_set.title = 'Renamed set';
  assert.equal(state.options_digest, 'Color · Weight · Renamed set');
});

test('simple products show a truthful no-options digest with the default property-set fallback', () => {
  const { state } = fixture();
  assert.equal(state.options_digest, 'No options selected · Default Property Set');
  assert.equal(Boolean(state.hasVariants), false);
});

test('axis selection keeps the native local draft boundary without sending requests or changing stock', () => {
  const product = { quantity: 12, product_variants: [{ id: 2, style: 'Floral', quantity: 7 }] };
  const { state, requests } = fixture({ product });
  state.has_style = false;
  state.has_weight = true;
  state.reassign();
  assert.equal(state.product_variants[0].style, undefined);
  assert.equal(state.product_variants[0].weight, '0 gr');
  assert.equal(state.product_variants[0].quantity, 7);
  assert.equal(product.quantity, 12);
  assert.equal(requests.length, 0);
});

test('workspace busy and dialog guards reflect only real independent operations', () => {
  const { state } = fixture();
  assert.equal(state.workspaceBusy, false);
  assert.equal(state.saveBlocked, false);
  for (const key of ['busy_count', 'busy_save']) {
    state[key] = true;
    assert.equal(state.workspaceBusy, true);
    state[key] = false;
  }
  for (const key of ['dialog', 'dialog_bulk', 'edit_property_set_dialog']) {
    state[key] = true;
    assert.equal(state.saveBlocked, true);
    state[key] = false;
  }
  const wrapper = readComponent(wrapperFile), context = { physicalEditor: state };
  state.dialog = true;
  assert.equal(wrapper.computed.saveBlocked.call(context), true);
  state.busy_save = true;
  assert.equal(wrapper.computed.workspaceBusy.call(context), true);
  assert.equal(wrapper.computed.workspaceBusy.call({ physicalEditor: null }), false);
});

test('variant editor links keep the Edit section hash and leave the Add catalog route alone', () => {
  for (const [workspace, productId] of [[true, 9], [true, null], [false, 9]]) {
    const navigations = [];
    const { state, component } = fixture({
      productWorkspace: workspace,
      $route: { params: productId ? { product_id: productId } : {}, query: {}, hash: '#variants', matched: [] },
      $router: { replace: target => navigations.push(target) },
    });
    component.watch.current_item.call(state, { id: 2 });
    if (workspace && !productId) assert.equal(navigations.length, 0, 'Add must preserve its underlying catalog route');
    else {
      assert.equal(navigations[0].query.variant_id, 2);
      assert.equal(navigations[0].hash, workspace ? '#variants' : undefined);
    }
  }
});

for (const vendor of [false, true]) test(`stock saves independently through the native ${vendor ? 'vendor' : 'shop'} quantity action`, async () => {
  const { state, requests } = fixture(vendor ? { $route: { params: { vendor_id: 4 }, query: {}, matched: [{ meta: { vendor: true } }] } } : {});
  state.quantity = 21;
  state.setDefaultQuantity();
  assert.equal(state.workspaceBusy, true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, `/fixture/${vendor ? 'vendor' : 'shop'}/quantity`);
  assert.deepEqual(requests[0].payload, [vendor ? 4 : 3, 9, 21]);
  requests[0].resolve({ quantity: 21 });
  await setImmediate();
  assert.equal(state.product.quantity, 21);
  assert.equal(state.old_quantity, 21);
  assert.equal(state.workspaceBusy, false);
});

test('failed variant saves retain their open dialog and draft while clearing the request guard', async () => {
  const { state, requests } = fixture();
  state.dialog = true;
  const variant = { id: 7, sku: 'CAT-7', quantity: 0, enable: false };
  state.addOrUpdateProductVariant(variant);
  assert.equal(state.workspaceBusy, true);
  assert.equal(requests[0].url, '/fixture/shop/POST_EDIT_VARIANT/3/9/7');
  assert.equal(requests[0].payload, variant);
  requests[0].resolve({ error: true, error_msg: 'Validation failed' });
  await setImmediate();
  assert.equal(state.dialog, true);
  assert.equal(state.workspaceBusy, false);
  assert.equal(state.saveBlocked, true);
});

test('native pagination remains bounded when page size or available records change', () => {
  const product = { quantity: 30, product_variants: Array.from({ length: 23 }, (_, id) => ({ id: id + 1, color: '#fff' })) };
  const { state, component } = fixture({ product });
  state.page = 3;
  assert.equal(state.paged_variants.length, 3);
  state.page_size = 20;
  component.watch.page_size.call(state);
  assert.equal(state.page, 1);
  state.page = 9;
  state.clampPage();
  assert.equal(state.page, 2);
});
