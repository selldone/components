import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(new URL('../../../../../package.json', import.meta.url));
const { parse, compileScript, compileTemplate, compileStyleAsync } = require('@vue/compiler-sfc');
const ts = require('typescript');
const Vue = require('vue');
const { renderToString } = require('vue/server-renderer');
const { JSDOM } = require('jsdom');
const path = new URL('./BDomainSearchIllustration.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(path, 'utf8'));
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: 'domain-search-art-test' });
const template = compileTemplate({ source: descriptor.template.content, filename: path.pathname, id: 'domain-search-art-test', compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const transpile = source => ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const exports = {};
const dependency = name => {
  if (name === 'vue') return Vue;
  if (name.endsWith('.svg')) return `/local-art/${name.split('/').at(-1)}`;
  throw new Error(`Unexpected illustration dependency: ${name}`);
};
new Function('exports', 'require', transpile(script.content) + '\n' + transpile(template.code))(exports, dependency);
const component = { ...exports.default, render: exports.render };
const prefix = 'domains_modern.workspace.indexingIllustration.';

async function render(props) {
  const app = Vue.createSSRApp(component, props);
  app.config.globalProperties.$t = key => key;
  app.config.warnHandler = message => assert.fail(message);
  return new JSDOM(await renderToString(app)).window.document;
}

test('the draft choice changes the indexing-permission connection without hiding the storefront', async () => {
  for (const indexed of [false, true]) {
    const document = await render({ indexed, pending: true });
    const caption = document.querySelector('figcaption');
    assert.ok(caption.textContent.includes(prefix + (indexed ? 'enabledTitle' : 'disabledTitle')));
    assert.ok(caption.textContent.includes(prefix + (indexed ? 'enabledDescription' : 'disabledDescription')));
    assert.ok(caption.textContent.includes(prefix + 'draftLabel'));
    assert.ok(document.querySelector('.b-domain-search-art__note').textContent.includes(prefix + 'draftCaption'));
    assert.equal(document.querySelector('.b-domain-search-art__stage').classList.contains('b-domain-search-art__stage--excluded'), !indexed);
    assert.ok(document.querySelector('.b-domain-search-art__gate-label').textContent.includes(prefix + (indexed ? 'allowed' : 'excluded')));
    assert.equal(document.querySelectorAll('.b-domain-search-art__store').length, 1);
    assert.equal(document.querySelectorAll('.b-domain-search-art__products > i').length, 3);
    const route = document.querySelector('.b-domain-search-art__wire--wide path').getAttribute('d');
    assert.equal((route.match(/M/g) || []).length, indexed ? 1 : 2);
  }
});

test('saved and unavailable preferences have accurate static captions outside the hidden art', async () => {
  const saved = await render({ indexed: true });
  assert.ok(saved.querySelector('figcaption').textContent.includes(prefix + 'savedLabel'));
  assert.ok(saved.querySelector('.b-domain-search-art__note').textContent.includes(prefix + 'savedCaption'));
  const unavailable = await render({ indexed: true, pending: true, unavailable: true });
  assert.equal(unavailable.querySelector('.b-domain-search-art__preference'), null);
  assert.ok(unavailable.querySelector('.b-domain-search-art__note').textContent.includes(prefix + 'unavailableCaption'));
  assert.ok(unavailable.querySelector('.b-domain-search-art__stage--excluded'));
  for (const document of [saved, unavailable]) {
    const stage = document.querySelector('.b-domain-search-art__stage');
    assert.equal(stage.getAttribute('aria-hidden'), 'true');
    assert.ok(!stage.contains(document.querySelector('figcaption')));
    assert.ok(!stage.contains(document.querySelector('.b-domain-search-art__note')));
    assert.ok(document.querySelector('figcaption').textContent.includes(prefix + 'label'));
  }
});

test('the Google/storefront example stays fictional, local and inert', async () => {
  const document = await render({ indexed: false });
  const stage = document.querySelector('.b-domain-search-art__stage');
  assert.equal(stage.querySelectorAll('button, input, select, textarea, a, form, [href], [tabindex], [contenteditable], [role="button"], [aria-live]').length, 0);
  for (const svg of stage.querySelectorAll('svg')) assert.equal(svg.getAttribute('focusable'), 'false');
  assert.equal(stage.querySelector('img').getAttribute('src'), '/local-art/google.svg');
  assert.ok(stage.textContent.includes('shop.example'));
  assert.equal(component.props.domain, undefined);
  assert.equal(Object.keys(component.methods || {}).length, 0);
  assert.equal(component.mounted, undefined);
  assert.equal(component.created, undefined);
});

test('only the final widget finishes the story and the same choice stays static on return', () => {
  const state = Vue.reactive({ indexed: false, pending: false, unavailable: false, ...component.data(), $t: key => key });
  Object.defineProperty(state, 'allowed', { get: () => component.computed.allowed.call(state) });
  const stop = Vue.watch(() => state.allowed, component.watch.allowed.bind(state), { flush: 'sync' });
  const descendants = node => [node, ...(Array.isArray(node.children) ? node.children.filter(child => child && typeof child === 'object').flatMap(descendants) : [])];
  const scene = () => {
    const nodes = descendants(component.render(state, [], state, state, state, state));
    return {
      stage: nodes.find(node => node.props?.class?.includes('b-domain-search-art__stage')),
      destination: nodes.find(node => node.props?.class?.includes('b-domain-search-art__destination')),
    };
  };
  const finalWidget = scene().destination;
  const target = {};
  finalWidget.props.onAnimationend({ target: {}, currentTarget: target });
  assert.equal(state.animationComplete, false, 'a bubbled child animation must not finish the story');
  finalWidget.props.onAnimationend({ target, currentTarget: target });
  assert.ok(scene().stage.props.class.includes('b-domain-search-art__stage--complete'));
  state.pending = true;
  assert.ok(scene().stage.props.class.includes('b-domain-search-art__stage--complete'), 'showing the same mounted choice remains static');
  state.indexed = true;
  assert.ok(!scene().stage.props.class.includes('b-domain-search-art__stage--complete'), 'a new choice may explain its own sequence');
  stop();
});

test('the brief automatic sequence has a complete reduced-motion and narrow composition', async () => {
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: path.pathname, id: 'domain-search-art-test', scoped: true, preprocessLang: 'scss' });
  assert.deepEqual(style.errors, []);
  assert.ok(!style.code.includes('infinite'));
  for (const declaration of style.code.matchAll(/animation:\s*([^;]+);/g)) {
    if (declaration[1] === 'none') continue;
    const times = [...declaration[1].matchAll(/([\d.]+)s\b/g)].map(match => Number(match[1]));
    assert.ok(times.length > 0);
    assert.ok(times.reduce((sum, value) => sum + value, 0) <= 4);
    assert.match(declaration[1], /both/);
  }
  const reduced = style.code.slice(style.code.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /animation: none/);
  assert.match(reduced, /opacity: 1/);
  assert.match(reduced, /stroke-dashoffset: 0/);
  assert.match(style.code, /@container \(max-width: 370px\)/);
  assert.match(style.code, /:dir\(rtl\)/);
  const completed = style.code.slice(style.code.indexOf('.b-domain-search-art__stage--complete'), style.code.indexOf(':dir(rtl)'));
  assert.match(completed, /animation: none/);
  assert.match(completed, /opacity: 1/);
  assert.match(completed, /stroke-dashoffset: 0/);
});
