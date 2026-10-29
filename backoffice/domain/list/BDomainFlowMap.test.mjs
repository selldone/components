import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const localRequire = createRequire(import.meta.url);
const vue = localRequire('@vue/compiler-sfc');
const ts = localRequire('typescript');
const root = new URL('../', import.meta.url);

function fixture(file) {
  const source = fs.readFileSync(new URL(file, root), 'utf8');
  const { descriptor, errors } = vue.parse(source, { filename: file });
  assert.deepEqual(errors, []);
  const exports = {};
  const dependency = name => {
    if (name === 'lodash-es') return { throttle: fn => fn };
    if (name === 'vue') return { defineComponent: value => value };
    return { __esModule: true, default: {}, ShopPermissionRegions: { SETTINGS: { code: 'SETTINGS' } } };
  };
  const compiled = ts.transpileModule(descriptor.script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function('require', 'exports', 'window', 'axios', compiled)(dependency, exports, { SERACH_THROTTLE: 0 }, new Proxy({}, { get() { throw Error('Network access is not permitted in map tests'); } }));
  const component = exports.default;
  const events = [], calls = [];
  const state = {
    ...component.data(), ...component.methods,
    shop: { id: 71, home: 'shop', domains: [] }, item: null,
    modern: true, refined: true, readOnly: false, busyUpdate: false, busyRepair: false,
    busy_update: false, busy_add_client: false,
    $t: key => key, $emit: (...args) => events.push(args),
    $nextTick: fn => fn?.(), $refs: {},
    $vuetify: { locale: { isRtl: false }, display: { width: 1200 } },
    writeShopAccess: () => true,
    GetDomainHomeName: value => 'home:' + value,
  };
  for (const [key, computed] of Object.entries(component.computed || {})) Object.defineProperty(state, key, {
    configurable: true, get: () => (typeof computed === 'function' ? computed : computed.get).call(state),
    ...(typeof computed !== 'function' && computed.set ? { set: value => computed.set.call(state, value) } : {}),
  });
  return { component, state, events, calls };
}

const entries = {
  local: { official: 'local', url: 'http://localhost:9000/@test', enable: true, ssl: true, indexed: false, primary: false },
  sub: { official: 'sub', url: 'https://test.example.test', enable: true, ssl: true, indexed: true, primary: false },
  custom: { url: 'https://custom.example.test', enable: false, indexed: false, primary: false, ssl: false, domain: { id: 4, domain: 'custom.example.test', home: 'blog', ssl_proxy: false } },
  external: { url: 'https://external.example.test', enable: true, indexed: true, primary: false, ssl: true, domain: { id: 5, domain: 'external.example.test', home: 'blog', externally_hosted: true } },
};
const clone = value => structuredClone(value);

function testMapStates() {
  const expected = {
    local: ['access', 'connection', 'home', 'live', 'repair', 'sitemap'],
    sub: ['access', 'connection', 'home', 'live', 'repair', 'search', 'sitemap'],
    custom: ['access', 'connection', 'home', 'live', 'repair', 'search', 'settings', 'sitemap'],
    external: ['access', 'connection', 'home', 'live', 'search', 'settings'],
  };
  for (const [kind, item] of Object.entries(entries)) {
    const f = fixture('list/BDomainFlowMap.vue'); f.state.item = clone(item);
    const nodes = f.state.stages.flatMap(stage => [stage.main, stage.child]).filter(Boolean);
    assert.deepEqual(nodes.map(node => node.id).sort(), expected[kind].sort(), kind + ' capabilities');
    assert.equal(nodes.find(node => node.id === 'live').href || null, item.enable ? item.url : null, kind + ' live access');
    assert.equal(!!f.state.isExternal, kind === 'external');
    assert.equal(!!f.state.isOfficial, kind === 'local' || kind === 'sub');
  }
  const primary = fixture('list/BDomainFlowMap.vue');
  primary.state.item = { ...clone(entries.custom), primary: true };
  assert.equal(primary.state.homeValue, 'shop', 'primary domains display the shared shop home');
}

function testMapUpdates() {
  for (const [kind, item] of Object.entries(entries)) {
    const f = fixture('list/BDomainFlowMap.vue'); f.state.item = clone(item);
    for (const param of ['enable', 'indexed', 'primary']) {
      f.events.length = 0; f.state.updateValue(param, true);
      assert.deepEqual(f.events, kind === 'local' && param !== 'enable' ? [] : [['update-domain', { param, value: true }]], kind + ':' + param);
    }
  }
  const f = fixture('list/BDomainFlowMap.vue'); f.state.item = clone(entries.custom);
  for (const key of ['readOnly', 'busyUpdate']) {
    f.state[key] = true;
    for (const param of ['enable', 'indexed', 'primary']) f.state.updateValue(param, true);
    assert.deepEqual(f.events, [], key + ' update denial'); f.state[key] = false;
  }
  f.state.updateValue('primary', false); f.state.updateValue('unknown', true);
  for (const value of ['false', null, undefined, 0, 1, {}, []]) f.state.updateValue('enable', value);
  assert.deepEqual(f.events, [], 'primary false, unknown and nonboolean intents are denied');
  f.state.item.primary = true; f.state.updateValue('primary', true);
  assert.deepEqual(f.events, [], 'an already-primary domain cannot be reselected');
  f.state.item.primary = false; f.state.activate('repair');
  assert.deepEqual(f.events, [], 'opening repair details does not run repair');
  f.state.performRepair();
  assert.deepEqual(f.events, [['repair']], 'repair requires the explicit CTA');
  for (const restriction of ['readOnly', 'busyRepair']) {
    f.events.length = 0; f.state[restriction] = true; f.state.performRepair();
    assert.deepEqual(f.events, [], restriction + ' repair denial'); f.state[restriction] = false;
  }
  f.events.length = 0; f.state.item = clone(entries.external); f.state.performRepair();
  assert.deepEqual(f.events, [], 'external sites have no Selldone sign-in repair');
  f.state.item = clone(entries.custom);
  f.state.updateValue('enable', false); f.state.updateValue('indexed', false);
  assert.deepEqual(f.events, [['update-domain', { param: 'enable', value: false }], ['update-domain', { param: 'indexed', value: false }]], 'valid disable and de-index updates preserve false');
}

function testMapNavigation() {
  const f = fixture('list/BDomainFlowMap.vue'); f.state.item = clone(entries.custom);
  for (const [node, expected] of [['settings', 'settings'], ['connection', 'edit-domain'], ['home', 'home'], ['sitemap', 'sitemap']]) {
    f.events.length = 0; f.state.activate(node);
    assert.deepEqual(f.events, [[expected]], node + ' existing action');
  }
  f.events.length = 0; f.state.readOnly = true;
  for (const node of ['settings', 'connection', 'home']) f.state.activate(node);
  assert.deepEqual(f.events, [], 'read-only nodes never emit protected actions');
  f.state.item = clone(entries.sub); f.state.activate('home');
  assert.deepEqual(f.events, [['default-home']], 'inherited home remains navigable with read-only access');
  f.events.length = 0; f.state.item = clone(entries.external); f.state.readOnly = false;
  for (const node of ['home', 'sitemap', 'repair']) f.state.activate(node);
  assert.deepEqual(f.events, [], 'external sites do not invoke Selldone content/discovery/recovery actions');
  for (const [width, expectedColumns] of [[650,4],[596,4],[450,2],[284,2],[250,1]]) {
    f.state.availableWidth = width;
    assert.equal(f.state.columns, expectedColumns, 'balanced responsive columns at ' + width);
  }
}

function listFixture() {
  const f = fixture('list/BDomainsList.vue');
  for (const method of ['updateShopDomain', 'showEditDomainDialog', 'showSetHomeDialog', 'showSetting', 'showFlowSetting', 'createClientSecret']) f.state[method] = (...args) => f.calls.push([method, ...args]);
  return f;
}

function testParentUpdates() {
  for (const [kind, item] of Object.entries(entries)) {
    const f = listFixture();
    for (const param of ['enable', 'indexed', 'primary']) {
      f.calls.length = 0; f.state.updateFlowDomain(clone(item), { param, value: true });
      assert.deepEqual(f.calls, kind === 'local' && param !== 'enable' ? [] : [['updateShopDomain', param, item.domain?.domain || item.official, true]], kind + ':' + param + ' parent');
    }
  }
  const f = listFixture();
  f.state.writeShopAccess = () => false;
  f.state.updateFlowDomain(clone(entries.custom), { param: 'enable', value: true });
  f.state.writeShopAccess = () => true; f.state.busy_update = true;
  f.state.updateFlowDomain(clone(entries.custom), { param: 'enable', value: true });
  f.state.busy_update = false;
  f.state.updateFlowDomain(clone(entries.custom), { param: 'primary', value: false });
  f.state.updateFlowDomain(clone(entries.custom), { param: 'unknown', value: true });
  for (const value of ['true', null, undefined, 0, 1, {}, []]) f.state.updateFlowDomain(clone(entries.custom), { param: 'enable', value });
  for (const change of [null, undefined, {}]) f.state.updateFlowDomain(clone(entries.custom), change);
  f.state.updateFlowDomain({ ...clone(entries.custom), primary: true }, { param: 'primary', value: true });
  assert.deepEqual(f.calls, [], 'parent denies missing write access, busy, unknown, primary false/reselection');
  f.state.updateFlowDomain(clone(entries.custom), { param: 'enable', value: false });
  f.state.updateFlowDomain(clone(entries.custom), { param: 'indexed', value: false });
  assert.deepEqual(f.calls, [['updateShopDomain', 'enable', entries.custom.domain.domain, false], ['updateShopDomain', 'indexed', entries.custom.domain.domain, false]], 'parent preserves valid false updates');
}

function testParentRouting() {
  for (const [kind, item] of Object.entries(entries)) {
    const f = listFixture();
    f.state.handleFlowAction(clone(item), 'edit-domain');
    assert.equal(f.calls.length, item.domain ? 1 : 0, kind + ' edit route');
    if(item.domain) assert.equal(f.calls[0][0], 'showEditDomainDialog');
    f.calls.length = 0; f.state.handleFlowAction(clone(item), 'settings', 'currencies');
    assert.deepEqual(f.calls, item.domain ? [['showFlowSetting', item.domain, 'currencies']] : [], kind + ' currency route');
    f.calls.length = 0; f.state.handleFlowAction(clone(item), 'home');
    assert.deepEqual(f.calls, item.domain && kind !== 'external' ? [['showSetHomeDialog', item.domain]] : [], kind + ' home route');
    f.events.length = 0; f.state.handleFlowAction(clone(item), 'default-home');
    assert.deepEqual(f.events, item.official ? [['show-default-home']] : [], kind + ' inherited home route');
    f.state.show_sitemap = false; f.state.handleFlowAction(clone(item), 'sitemap');
    assert.equal(f.state.show_sitemap, kind !== 'external', kind + ' sitemap route');
    if(kind !== 'external') assert.equal(f.state.sitemap_base_url, item.url);
    f.calls.length = 0; f.state.handleFlowAction(clone(item), 'repair');
    assert.deepEqual(f.calls, kind !== 'external' ? [['createClientSecret', item.domain?.id || item.official]] : [], kind + ' repair route');
  }
  const f = listFixture(); f.state.writeShopAccess = () => false;
  for (const action of ['edit-domain', 'settings', 'home', 'repair']) f.state.handleFlowAction(clone(entries.custom), action);
  assert.deepEqual(f.calls, [], 'parent permission gates all protected actions');
  f.state.writeShopAccess = () => true; f.state.busy_add_client = true;
  f.state.handleFlowAction(clone(entries.custom), 'repair');
  assert.deepEqual(f.calls, [], 'parent suppresses duplicate repair');
}

function testScopeFocus() {
  const f = fixture('list/BDomainsList.vue');
  f.state.showSetting = domain => f.calls.push(['showSetting', domain]);
  f.state.showFlowSetting(entries.custom.domain, 'currencies');
  assert.equal(f.state.setting_section, 'currencies');
  assert.deepEqual(f.calls, [['showSetting', entries.custom.domain]]);
  f.state.$refs.domainSetting = { focusSection: section => f.calls.push(['focusSection', section]) };
  f.state.focusFlowSetting();
  assert.deepEqual(f.calls.at(-1), ['focusSection', 'currencies']);
  f.state.showFlowSetting(entries.custom.domain, 'unknown');
  assert.equal(f.state.setting_section, null);
  for (const scope of ['currencies', 'languages']) {
    assert.equal(f.state.domainScopeHelp(entries.local, scope), 'domains_modern.map.' + (scope === 'currencies' ? 'officialCurrencyHelp' : 'officialLanguageHelp'));
    f.state.writeShopAccess = () => false;
    assert.equal(f.state.domainScopeHelp(entries.custom, scope), 'domains_modern.map.' + (scope === 'currencies' ? 'currencyScopeReadOnlyHelp' : 'languageScopeReadOnlyHelp'));
  }
  const settings = fixture('setting/BDomainSetting.vue');
  for (const section of ['languages', 'currencies', 'ssl']) {
    const calls = [];
    const element = { scrollIntoView: options => calls.push(['scroll', options.block]), querySelector: () => ({ focus: () => calls.push(['focus']), click: () => { throw Error('Focus must not open or change a selector'); } }) };
    settings.state.$refs[section === 'ssl' ? 'sslSection' : section + 'Input'] = { $el: element };
    settings.state.focusSection(section);
    assert.deepEqual(calls, [['scroll', 'center'], ['focus']], section + ' existing selector focus');
    settings.state.modern = false; settings.state.focusSection(section);
    assert.equal(calls.length, 2, 'legacy settings must not auto-focus'); settings.state.modern = true;
  }
}

test('domain map exposes the supported capabilities of each address', testMapStates);
test('map controls block read-only, busy and unsupported updates', testMapUpdates);
test('node actions preserve capability boundaries and balanced responsive rows', testMapNavigation);
test('parent enforces domain mutation intents independently', testParentUpdates);
test('map actions use existing domain flows and permission gates', testParentRouting);
test('scope shortcuts focus the matching existing settings field', testScopeFocus);
