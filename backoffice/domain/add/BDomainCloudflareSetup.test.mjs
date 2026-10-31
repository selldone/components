import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { parse, compileTemplate, compileStyleAsync } = require('@vue/compiler-sfc');
const ts = require('typescript');
const filename = new URL('./BDomainCloudflareSetup.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, 'utf8'));
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture({ domain = 'store.example.com', records = [
  { type: 'A', host: 'store', value: '203.0.113.42' },
  { type: 'TXT', host: 'store-challenge', value: 'selldone-domain-verification=synthetic-value' },
], disabled = false, failClick = false } = {}) {
  const exports = {}, clicks = [], blobs = [], revoked = [], timers = [];
  let removed = 0;
  const browserUrl = {
    createObjectURL(blob) { blobs.push(blob); return 'blob:synthetic-download'; },
    revokeObjectURL(url) { revoked.push(url); },
  };
  const document = {
    body: { appendChild(element) { assert.equal(element.tagName, 'A'); } },
    createElement(tagName) {
      return { tagName: tagName.toUpperCase(), click() { if (failClick) throw new Error('Synthetic download failure'); clicks.push({ href: this.href, download: this.download }); }, remove() { removed++; } };
    },
  };
  new Function('exports', 'Blob', 'URL', 'document', 'setTimeout', compiled)(exports, Blob, browserUrl, document, callback => timers.push(callback));
  const component = exports.default;
  const state = { ...component.data(), ...component.methods, domain, records, disabled, $t: key => key };
  Object.defineProperty(state, 'dnsFile', { get: () => component.computed.dnsFile.call(state) });
  return { component, state, build: exports.buildDomainDnsFile, clicks, blobs, revoked, timers, removed: () => removed };
}

test('download records retain exact requirements, absolute owners and DNS-only routing tags', () => {
  const { state, build } = fixture();
  const file = state.dnsFile;
  assert.match(file.text, /\$ORIGIN example\.com\.\n\$TTL 300/);
  assert.match(file.text, /store\.example\.com\. 300 IN A 203\.0\.113\.42 ; cf_tags=cf-proxied:false/);
  assert.match(file.text, /store-challenge\.example\.com\. 300 IN TXT "selldone-domain-verification=synthetic-value"/);
  assert.equal(file.filename, 'selldone-dns-store.example.com.txt');
  const cname = build('store.example.com', [
    { type: 'CNAME', host: 'store', value: 'edge.example.net' },
    { type: 'TXT', host: 'store-challenge', value: 'synthetic' },
  ]);
  assert.match(cname.text, /store\.example\.com\. 300 IN CNAME edge\.example\.net\. ; cf_tags=cf-proxied:false/);
  assert.ok(!cname.text.includes(' IN A '));
  assert.ok(!cname.text.includes('cf-proxied:true'));
  const longDomain = ['a'.repeat(63), 'b'.repeat(63), 'c'.repeat(63), 'd'.repeat(61)].join('.');
  assert.ok(build(longDomain, [{ type: 'TXT', host: '@', value: 'synthetic' }]).filename.length < 255);
});

test('nested, country-suffix and wildcard names keep the setup form relative-host convention', () => {
  const { build } = fixture();
  for (const [domain, host, expected, zone] of [
    ['example.com', '@', 'example.com.', 'example.com'],
    ['store.eu.example.com', 'store.eu', 'store.eu.example.com.', 'example.com'],
    ['example.co.uk', '@', 'example.co.uk.', 'example.co.uk'],
    ['store.example.co.uk', 'store', 'store.example.co.uk.', 'example.co.uk'],
    ['*.store.example.com', '*.store', '*.store.example.com.', 'example.com'],
    ['*.example.com', '*', '*.example.com.', 'example.com'],
    ['store.example.com', 'store.example.com.', 'store.example.com.', 'example.com'],
    ['store.example.com', '_selldone-verification.store', '_selldone-verification.store.example.com.', 'example.com'],
  ]) {
    const file = build(domain, [{ type: 'TXT', host, value: 'synthetic' }]);
    assert.ok(file, domain);
    assert.ok(file.text.includes(`$ORIGIN ${zone}.`));
    assert.ok(file.text.includes(`${expected} 300 IN TXT "synthetic"`));
    assert.ok(!file.filename.includes('*'));
  }
});

test('TXT data is quoted safely and split by wire-byte length without changing its bytes', () => {
  const { build } = fixture();
  const quoted = build('example.com', [{ type: 'TXT', host: '@', value: 'quote" slash\\ ; $ORIGIN evil.example' }]);
  assert.ok(quoted.text.includes('"quote\\" slash\\\\ ; $ORIGIN evil.example"'));
  assert.equal(quoted.text.split('\n').filter(line => line.includes('$ORIGIN')).length, 2, 'the second occurrence remains inside one quoted TXT record');
  const value = 'é'.repeat(160);
  const file = build('example.com', [{ type: 'TXT', host: '@', value }]);
  const record = file.text.split('\n').find(line => line.includes(' IN TXT '));
  const chunks = [...record.matchAll(/"([^\"]*)"/g)].map(match => match[1]);
  assert.equal(chunks.length, 2);
  const decoded = chunks.map(chunk => [...chunk.matchAll(/\\(\d{3})|([^\\])/g)].map(match => match[1] ? Number(match[1]) : match[2].charCodeAt(0)));
  assert.ok(decoded.every(bytes => bytes.length <= 255));
  assert.deepEqual(decoded.flat(), [...new TextEncoder().encode(value)]);
});

test('malformed or conflicting records fail closed rather than producing an import file', () => {
  const { build } = fixture();
  for (const [domain, records] of [
    ['example.com\n$INCLUDE evil', [{ type: 'TXT', host: '@', value: 'x' }]],
    ['localhost', [{ type: 'TXT', host: '@', value: 'x' }]],
    ['example.com', [{ type: 'TXT', host: '@\n$INCLUDE', value: 'x' }]],
    ['example.com', [{ type: 'TXT', host: 'outside.example.net.', value: 'x' }]],
    ['example.com', [{ type: 'A', host: '@', value: 'localhost' }]],
    ['example.com', [{ type: 'A', host: '@', value: '256.1.1.1' }]],
    ['example.com', [{ type: 'A', host: '@', value: '01.2.3.4' }]],
    ['example.com', [{ type: 'A', host: '@', value: '1.2.3.4\n@ 300 IN A 9.9.9.9' }]],
    ['example.com', [{ type: 'CNAME', host: 'store', value: 'localhost' }]],
    ['example.com', [{ type: 'CNAME', host: 'store', value: 'store.example.com' }]],
    ['example.com', [{ type: 'TXT', host: '@', value: 'line\nbreak' }]],
    ['example.com', [{ type: 'TXT', host: '@', value: 'x'.repeat(4097) }]],
    ['example.com', [{ type: 'MX', host: '@', value: 'mail.example.net' }]],
    ['example.com', [{ type: 'A', host: 'store', value: '1.2.3.4' }, { type: 'CNAME', host: 'store', value: 'edge.example.net' }]],
    ['example.com', [{ type: 'CNAME', host: 'store', value: 'edge.example.net' }, { type: 'TXT', host: 'store', value: 'x' }]],
    ['example.com', [{ type: 'CNAME', host: 'store', value: 'edge.example.net' }, { type: 'CNAME', host: 'store', value: 'other.example.net' }]],
    ['example.com', []],
    ['example.com', Array.from({ length: 65 }, () => ({ type: 'A', host: '@', value: '1.2.3.4' }))],
  ]) assert.equal(build(domain, records), null, domain + ' rejects invalid records');
});

test('download is a local Blob action, honors disabled state, and cleans up its temporary URL', async () => {
  const f = fixture();
  f.state.downloadRecords();
  assert.deepEqual(f.clicks, [{ href: 'blob:synthetic-download', download: f.state.dnsFile.filename }]);
  assert.equal(f.blobs[0].type, 'text/plain;charset=utf-8');
  assert.equal(await f.blobs[0].text(), f.state.dnsFile.text);
  assert.equal(f.removed(), 1);
  assert.equal(f.state.downloadFailed, false);
  f.timers.forEach(callback => callback());
  assert.deepEqual(f.revoked, ['blob:synthetic-download']);
  assert.equal(f.state.cloudflareUrl, 'https://dash.cloudflare.com/?to=/:account/:zone/dns/records');
  const disabled = fixture({ disabled: true });
  disabled.state.downloadRecords();
  assert.equal(disabled.clicks.length, 0);
  assert.equal(disabled.blobs.length, 0);
  const malformed = fixture({ records: [{ type: 'A', host: '@', value: 'localhost' }] });
  malformed.state.downloadRecords();
  assert.equal(malformed.clicks.length, 0);
});

test('download failures preserve manual recovery and do not leak the generated URL', () => {
  const f = fixture({ failClick: true });
  f.state.downloadRecords();
  assert.equal(f.state.feedback, 'domains_modern.connection.cloudflareSetup.downloadFailed');
  assert.equal(f.state.downloadFailed, true);
  assert.equal(f.removed(), 1);
  f.timers.forEach(callback => callback());
  assert.equal(f.revoked.length, 1);
  f.component.watch.records.call(f.state);
  assert.equal(f.state.feedback, '');
});

test('Vue template and scoped styles compile', async () => {
  const result = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: 'domain-cloudflare-setup' });
  assert.deepEqual(result.errors, []);
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: filename.pathname, id: 'domain-cloudflare-setup', scoped: true, preprocessLang: 'scss' });
  assert.deepEqual(style.errors, []);
});
