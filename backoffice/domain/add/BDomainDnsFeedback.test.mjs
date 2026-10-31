import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { parse, compileTemplate, compileStyleAsync } = require('@vue/compiler-sfc');
const ts = require('typescript');
const filename = new URL('./BDomainDnsFeedback.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
const script = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
new Function('exports', script)(exports);
const component = exports.default;
const proof = 'selldone-domain-verification=synthetic-current-proof';
const expected = [
  { type: 'A', host: 'store', value: '203.0.113.24' },
  { type: 'CNAME', host: 'store', value: 'origin.example.test' },
  { type: 'TXT', host: 'store-challenge', value: proof },
];

function fixture(props = {}) {
  const state = { expected, detected: null, domain: 'store.example.test', secure: false, verification: {}, ...props };
  Object.entries(component.methods).forEach(([key, method]) => { state[key] = method.bind(state); });
  Object.entries(component.computed).forEach(([key, getter]) => {
    Object.defineProperty(state, key, { get: () => getter.call(state) });
  });
  return state;
}

test('known configured records are green independently and challenge answers are retained', () => {
  const s = fixture({ detected: [{ type: 'A', host: 'STORE.EXAMPLE.TEST.', ip: '203.0.113.24' }],
    verification: { dns_challenge: [{ type: 'TXT', host: 'store-challenge.example.test', txt: proof }], challenge_domain: 'store-challenge.example.test' } });
  assert.deepEqual(s.rows.map(r => [r.type, r.status]), [['A', 'correct'], ['TXT', 'correct']]);
  assert.equal(s.rows.filter(r => r.expected).length, 0, 'A and CNAME are alternative ways to route the same address');
  const duplicate = fixture({ detected: [{ type: 'TXT', host: 'store-challenge.example.test', txt: proof }],
    verification: { dns_challenge: [{ type: 'TXT', host: 'store-challenge.example.test', txt: proof }], challenge_domain: 'store-challenge.example.test' } });
  assert.equal(duplicate.observedRecords.length, 1);
});

test('direct CDN addresses remain an origin review rather than a false error', () => {
  const s = fixture({ expected: expected.slice(0, 2), detected: [{ type: 'A', host: 'store.example.test', ip: '198.51.100.10' }], verification: { approved: false } });
  assert.equal(s.rows[0].status, 'checkOrigin');
  assert.equal(s.rows[0].hint, 'originHint');
  assert.equal(s.rows.length, 1);
  s.verification = { approved: true };
  assert.equal(s.rows[0].status, 'correct', 'An explicit server routing verdict is authoritative');
});

test('secure routing identifies each mismatched origin without hiding correct siblings', () => {
  const s = fixture({ expected: [expected[0]], secure: true, detected: [
    { type: 'A', host: 'store.example.test', ip: '203.0.113.24' },
    { type: 'A', host: 'store.example.test', ip: '198.51.100.10' },
  ], verification: { approved: false } });
  assert.deepEqual(s.rows.map(r => r.status), ['correct', 'different']);
  assert.equal(s.rows[1].hint, 'differentHint');
});

test('an absent routing verdict does not turn an unfamiliar address into a confirmed error', () => {
  const s = fixture({ expected: [expected[0]], secure: true, detected: [
    { type: 'A', host: 'store.example.test', ip: '198.51.100.10' },
  ] });
  assert.equal(s.rows[0].status, 'checkOrigin');
});

test('an unchecked challenge is never reported as a missing or verified ownership record', () => {
  const noResult = fixture();
  assert.equal(noResult.observedRecords, null);
  assert.deepEqual(noResult.rows, []);
  const queriedBase = fixture({ detected: [] });
  assert.deepEqual(queriedBase.rows.map(r => [r.type, r.status]), [['A / CNAME', 'missing'], ['TXT', 'notChecked']]);
  assert.equal(queriedBase.rows[0].hint, 'routingHint');
  queriedBase.verification = { dns_challenge: [], challenge_domain: 'store-challenge.example.test' };
  assert.deepEqual(queriedBase.rows.map(r => r.status), ['missing', 'missing']);
});

test('external TXT uses its explicitly checked host and never invents routing requirements', () => {
  const s = fixture({ expected: [{ type: 'TXT', host: '_selldone-verification.store', value: proof }],
    detected: [], verification: { verified: false, verification_host: '_selldone-verification.store.example.test' } });
  assert.equal(s.rows.length, 1);
  assert.equal(s.rows[0].type, 'TXT');
  assert.equal(s.rows[0].status, 'missing');
});

test('token location is checked before current-value or failed-ownership statuses', () => {
  const s = fixture({ expected: [expected[2]], detected: [{ type: 'TXT', host: 'wrong.example.test', txt: proof }],
    verification: { valid_txt: false, dns_challenge: [], challenge_domain: 'store-challenge.example.test' } });
  assert.equal(s.rows[0].status, 'wrongHost');
  assert.equal(s.rows[0].hint, 'hostHint');
  assert.equal(s.rows[1].status, 'missing');
  const wildcard = fixture({ domain: '*.example.test', expected: [{ type: 'TXT', host: '*', value: proof }],
    detected: [{ type: 'TXT', host: 'child.example.test', txt: proof }] });
  assert.equal(wildcard.rows[0].status, 'wrongHost', 'TXT proof is not inferred from routing wildcard expansion');
});

test('different bcrypt proofs stay unknown unless the server explicitly rejected ownership', () => {
  const s = fixture({ expected: [expected[2]], detected: [{ type: 'TXT', host: 'store-challenge.example.test', txt: 'selldone-domain-verification=another-synthetic-hash' }] });
  assert.equal(s.rows[0].status, 'notChecked');
  s.verification = { valid_txt: true };
  assert.equal(s.rows.length, 1, 'A confirmed ownership requirement must not gain a false missing row');
  assert.equal(s.rows[0].status, 'notChecked', 'Global ownership success does not identify an individual candidate');
  s.verification = { valid_txt: false };
  assert.equal(s.rows[0].status, 'different');
  assert.equal(s.rows[0].hint, 'ownershipHint');
});

test('CNAME normalization, nested hosts, country suffixes and wildcard routing retain their meaning', () => {
  const cname = fixture({ expected: expected.slice(0, 2), detected: [{ type: 'CNAME', host: 'store.example.test.', target: 'ORIGIN.EXAMPLE.TEST.' }] });
  assert.equal(cname.rows.length, 1);
  assert.equal(cname.rows[0].status, 'correct');
  for (const [domain, host, observed] of [
    ['shop.eu.example.test', 'shop.eu', 'shop.eu.example.test'],
    ['example.co.uk', '@', 'example.co.uk'],
    ['*.store.example.test', '*.store', 'test-wildcard-challenge.store.example.test'],
  ]) {
    const s = fixture({ domain, expected: [{ type: 'A', host, value: '203.0.113.24' }], detected: [{ type: 'A', host: observed, ip: '203.0.113.24' }] });
    assert.equal(s.rows[0].status, 'correct', domain);
  }
  const unrelated = fixture({ expected: [expected[0]], detected: [{ type: 'NS', host: 'example.test', target: 'ns.example.net' }, { type: 'TXT', host: 'example.test', txt: 'v=spf1 -all' }] });
  assert.deepEqual(unrelated.rows.slice(0,2).map(r => r.status), ['notRequired', 'notRequired']);
});

test('semantic feedback renders untrusted record text as text and keeps clear statuses', async () => {
  const { createSSRApp, defineComponent, h } = require('vue');
  const { renderToString } = require('@vue/server-renderer');
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'dns-feedback', ssr: true, ssrCssVars: descriptor.cssVars });
  assert.deepEqual(template.errors, []);
  const templateExports = {};
  new Function('require', 'exports', ts.transpileModule(template.code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText)(require, templateExports);
  const app = createSSRApp({ ...component, ssrRender: templateExports.ssrRender }, {
    expected: [expected[0]], domain: 'store.example.test',
    detected: [{ type: 'A', host: 'store.example.test', ip: '203.0.113.24' },
      { type: 'TXT', host: 'elsewhere.test', txt: '<img src=x onerror=alert(1)>' }],
  });
  app.config.globalProperties.$t = key => key;
  app.component('VIcon', defineComponent({ setup: (_, { slots }) => () => h('span', { class: 'v-icon' }, slots.default?.()) }));
  app.component('VTooltip', defineComponent({ setup: (_, { slots }) => () => h('span', [slots.activator?.({ props: {} }), slots.default?.()]) }));
  const html = await renderToString(app);
  assert.ok(html.includes('role="table"'));
  assert.ok(html.includes('role="columnheader"'));
  assert.ok(html.includes('feedback.correct'));
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<img src=x'));
});

test('scoped responsive feedback styles compile without a build', async () => {
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: filename.pathname, id: 'dns-feedback', scoped: true, preprocessLang: 'scss' });
  assert.deepEqual(style.errors, []);
});
