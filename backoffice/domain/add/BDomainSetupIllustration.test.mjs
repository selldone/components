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
const path = new URL('./BDomainSetupIllustration.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(path, 'utf8'));
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: 'domain-setup-art-test' });
const template = compileTemplate({ source: descriptor.template.content, filename: path.pathname, id: 'domain-setup-art-test', compilerOptions: { bindingMetadata: script.bindings } });
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
const prefix = 'domains_modern.connection.illustration.';

async function render(props) {
  const app = Vue.createSSRApp(component, props);
  app.config.globalProperties.$t = key => key;
  app.config.warnHandler = message => assert.fail(message);
  const document = new JSDOM(await renderToString(app)).window.document;
  return document;
}

test('each selected mode explains its own hosting or certificate owner', async () => {
  for (const [props, mode] of [
    [{ kind: 'hosting' }, 'hosted'],
    [{ kind: 'hosting', external: true }, 'external'],
    [{ kind: 'connection' }, 'direct'],
    [{ kind: 'connection', secure: true }, 'secure'],
  ]) {
    const document = await render(props);
    const caption = document.querySelector('figcaption');
    assert.ok(caption.textContent.includes(prefix + mode + 'Title'));
    assert.ok(caption.textContent.includes(prefix + mode + 'Summary'));
    assert.ok(caption.textContent.includes(prefix + 'label'));
    if (mode === 'hosted') {
      assert.equal(document.querySelectorAll('.b-domain-art__layout').length, 2);
      assert.match(document.body.textContent, /standardLayout/);
      assert.match(document.body.textContent, /customLayout/);
      assert.match(document.body.textContent, /noServer/);
    } else if (mode === 'external') {
      assert.equal(document.querySelectorAll('.b-domain-art__host-choice').length, 2);
      assert.match(document.body.textContent, /Cloudflare Pages/);
      assert.match(document.body.textContent, /yourServer/);
      assert.match(document.body.textContent, /yourCode/);
      assert.ok(!document.querySelector('.b-domain-art__hosted'));
    } else {
      assert.equal(document.querySelectorAll('.b-domain-art__traffic-node').length, 2);
      assert.ok(document.querySelector('.b-domain-art__edge'));
      assert.equal(document.body.textContent.includes(prefix + 'managedCertificate'), mode === 'secure');
    }
  }
});

test('illustrations stay inert and expose one static explanation outside decorative artwork', async () => {
  for (const props of [{ kind: 'hosting' }, { kind: 'hosting', external: true }, { kind: 'connection' }, { kind: 'connection', secure: true }]) {
    const document = await render(props);
    const stage = document.querySelector('.b-domain-art__stage');
    assert.equal(stage.getAttribute('aria-hidden'), 'true');
    assert.equal(stage.querySelectorAll('button, input, select, textarea, a, form, [tabindex], [contenteditable], [role="button"], [aria-live]').length, 0);
    for (const svg of stage.querySelectorAll('svg')) assert.equal(svg.getAttribute('focusable'), 'false');
    for (const image of stage.querySelectorAll('img')) assert.ok(image.getAttribute('src').startsWith('/local-art/'));
    for (const simulated of stage.querySelectorAll('.sd-modern-illustration__action')) assert.equal(simulated.tagName, 'SPAN');
    assert.ok(!stage.contains(document.querySelector('figcaption')));
  }
  assert.equal(Object.keys(component.methods || {}).length, 0);
  assert.equal(component.mounted, undefined);
  assert.equal(component.created, undefined);
});

test('motion finishes within four seconds and reduced-motion retains the full static story', async () => {
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: path.pathname, id: 'domain-setup-art-test', scoped: true, preprocessLang: 'scss' });
  assert.deepEqual(style.errors, []);
  assert.ok(!style.code.includes('infinite'));
  const delays = [...style.code.matchAll(/animation-delay:\s*([\d.]+)s/g)].map(match => Number(match[1]));
  for (const declaration of style.code.matchAll(/animation:\s*([^;]+);/g)) {
    if (declaration[1] === 'none') continue;
    const times = [...declaration[1].matchAll(/([\d.]+)s\b/g)].map(match => Number(match[1]));
    assert.ok(times.length > 0);
    assert.ok(times.reduce((sum, value) => sum + value, 0) <= 4);
    assert.ok(times[0] + Math.max(0, ...delays) <= 4);
  }
  const reduced = style.code.slice(style.code.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.match(reduced, /animation: none/);
  assert.match(reduced, /opacity: 1/);
  assert.match(reduced, /transform: none/);
  assert.match(reduced, /stroke-dashoffset: 0/);
  assert.match(style.code, /@container \(max-width: 420px\)/);
});
