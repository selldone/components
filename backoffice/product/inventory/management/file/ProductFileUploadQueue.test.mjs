import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import * as Vue from 'vue';
import ts from 'typescript';

const source = readFileSync(new URL('./ProductFileUploadQueue.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const settle = async () => { for (let index = 0; index < 5; index++) await Promise.resolve(); await Vue.nextTick(); };

class LocalFile {
  constructor(name, size = 1000) { this.name = name; this.size = size; }
  arrayBuffer() { throw new Error('The queue must never read the whole file'); }
  text() { throw new Error('The queue must never read file contents'); }
}
class LocalFormData {
  fields = [];
  append(...args) { this.fields.push(args); }
}
const limits = patch => ({ maxFileBytes: 2000 * 1048576, availableBytes: 10000 * 1048576, existingFiles: [], ...patch });
const descriptor = (id = 1, patch = {}) => ({ attributes: { method: 'POST', action: '/fixture/private-upload' }, inputs: { policy: 'LOCAL TEST POLICY', key: 'fixture-file' }, headers: {}, file_item: { id }, ...patch });

function fixture() {
  const requests = [], authorizations = [], confirmations = [], recoveries = [], recoveryResults = [], snapshots = [], available = new Set(), timers = new Map();
  let time = 0, nextTimer = 0;
  class LocalXHR {
    upload = {};
    headers = {};
    status = 0;
    aborted = false;
    constructor() { requests.push(this); }
    open(method, action, async) { Object.assign(this, { method, action, async }); }
    setRequestHeader(key, value) { this.headers[key] = value; }
    send(body) { this.body = body; }
    abort() { this.aborted = true; this.onabort?.(); }
    progress(loaded, total, milliseconds = 1000, computable = true) { time += milliseconds; this.upload.onprogress?.({ loaded, total, lengthComputable: computable }); }
    load(status = 204) { this.status = status; this.onload?.(); }
  }
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require: name => { assert.equal(name, 'vue'); return Vue; }, File: LocalFile, FormData: LocalFormData, XMLHttpRequest: LocalXHR, AbortController, URL,
    location: { href: 'https://selldone.test/app/', origin: 'https://selldone.test' },
    document: { querySelector: selector => { assert.equal(selector, 'meta[name="csrf-token"]'); return { getAttribute: key => { assert.equal(key, 'content'); return 'LOCAL FIXTURE CSRF'; } }; } },
    setInterval: callback => { const id = ++nextTimer; timers.set(id, callback); return id; }, clearInterval: id => timers.delete(id),
  });
  const queue = exports.createProductFileUploadQueue({
    authorize(file, signal) { const task = deferred(); authorizations.push({ file, signal, ...task }); return task.promise; },
    confirm(file, signal) { const task = deferred(); confirmations.push({ file, signal, ...task }); return task.promise; },
    async recover(file, fileId, signal) {
      recoveries.push({ file, fileId, signal });
      return recoveryResults.length ? recoveryResults.shift() : fileId && available.has(fileId) ? { kind: 'pending', fileItem: { id: fileId } } : { kind: 'available' };
    },
    isFileAvailable: id => available.has(id),
    now: () => time,
    onChange: records => snapshots.push(JSON.parse(JSON.stringify(records))),
  });
  const authorize = async (index = 0, value = descriptor(index + 1)) => { available.add(Number(value.file_item.id)); authorizations[index].resolve(value); await settle(); };
  return { queue, requests, authorizations, confirmations, recoveries, recoveryResults, snapshots, available, timers, authorize, advance: milliseconds => { time += milliseconds; }, tick: milliseconds => { time += milliseconds; for (const callback of [...timers.values()]) callback(); } };
}

test('large files use the original native body with exact returned method, headers and credentials, without whole-file reads', async () => {
  const f = fixture(), file = new LocalFile('large-video.mp4', 1750 * 1048576);
  const result = f.queue.add([file], limits());
  assert.equal(result.added.length, 1);
  assert.equal(result.rejected.length, 0);
  assert.ok(Vue.isReactive(f.queue.records));
  await f.authorize(0, descriptor(1, { direct_file: true, attributes: { method: 'PUT', action: '/fixture/direct-upload' }, headers: { 'Content-Type': 'application/octet-stream', 'X-Fixture': 'allowed' } }));
  const xhr = f.requests[0];
  assert.equal(xhr.body, file);
  assert.equal(xhr.method, 'PUT');
  assert.equal(xhr.withCredentials, false);
  assert.deepEqual(xhr.headers, { 'Content-Type': 'application/octet-stream', 'X-Fixture': 'allowed' });
  assert.equal(f.queue.records[0].status, 'uploading');
  assert.doesNotMatch(JSON.stringify(f.queue.records), /LOCAL TEST POLICY|fixture-file|private-upload|direct-upload|attributes|arrayBuffer/);
  f.queue.dispose();
  await settle();
});

test('form uploads append every input before the original file and honor credentialed local descriptors', async () => {
  const f = fixture(), file = new LocalFile('notes.txt');
  f.queue.add([file], limits());
  await f.authorize(0, descriptor(1, { with_credentials: true }));
  const xhr = f.requests[0];
  assert.equal(xhr.method, 'POST');
  assert.equal(xhr.withCredentials, true);
  assert.deepEqual(xhr.body.fields.map(field => field[0]), ['policy', 'key', 'file']);
  assert.equal(xhr.body.fields.at(-1)[1], file);
  assert.equal(xhr.body.fields.at(-1)[2], file.name);
  assert.deepEqual(xhr.headers, { 'X-CSRF-TOKEN': 'LOCAL FIXTURE CSRF' }, 'credentialed local requests preserve cookie-auth CSRF while the browser owns the multipart boundary');
  f.queue.dispose(); await settle();
});

test('the local backend empty-array headers and inputs contract reaches transfer and confirmed completion', async () => {
  const f = fixture(), file = new LocalFile('local-contract.txt');
  f.queue.add([file], limits());
  await f.authorize(0, descriptor(1, { with_credentials: true, headers: [], inputs: [] }));
  assert.equal(f.queue.records[0].status, 'uploading');
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].withCredentials, true);
  assert.deepEqual(f.requests[0].headers, { 'X-CSRF-TOKEN': 'LOCAL FIXTURE CSRF' });
  assert.deepEqual(f.requests[0].body.fields.map(field => field[0]), ['file']);
  assert.equal(f.requests[0].body.fields[0][1], file);
  f.requests[0].responseText = '{"success":true}';
  f.requests[0].load(200); await settle();
  assert.equal(f.queue.records[0].status, 'confirming');
  f.confirmations[0].resolve(true); await settle();
  assert.equal(f.queue.records[0].status, 'done');
  f.queue.dispose(); await settle();
});

test('nonempty header arrays remain invalid upload descriptors', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('invalid-headers.txt')], limits());
  await f.authorize(0, descriptor(1, { headers: ['invalid-header'] }));
  assert.equal(f.queue.records[0].errorKey, 'unsupported');
  assert.equal(f.requests.length, 0);
  f.queue.dispose(); await settle();
});

test('CSRF from the app meta stays on credentialed same-origin requests and preserves explicit descriptor headers', async () => {
  for (const [patch, expected] of [
    [{ with_credentials: true, attributes: { method: 'POST', action: 'https://storage.test/upload' } }, {}],
    [{ with_credentials: false }, {}],
    [{ with_credentials: true, headers: { 'x-xsrf-token': 'EXPLICIT FIXTURE TOKEN' } }, { 'x-xsrf-token': 'EXPLICIT FIXTURE TOKEN' }],
  ]) {
    const f = fixture();
    f.queue.add([new LocalFile('csrf.txt')], limits());
    await f.authorize(0, descriptor(1, patch));
    assert.deepEqual(f.requests[0].headers, expected);
    assert.doesNotMatch(JSON.stringify(f.queue.records), /LOCAL FIXTURE CSRF|EXPLICIT FIXTURE TOKEN/);
    f.queue.dispose(); await settle();
  }
});

test('local HTTP 200 business errors retry the same file transfer instead of getting stuck confirming', async () => {
  for (const body of [{ error: true, error_msg: 'PRIVATE LOCAL ERROR' }, { success: false }]) {
    const f = fixture(), file = new LocalFile('local-business-error.txt');
    f.queue.add([file], limits()); await f.authorize(0, descriptor(1, { with_credentials: true }));
    const row = f.queue.records[0];
    f.requests[0].responseText = JSON.stringify(body);
    f.requests[0].load(200); await settle();
    assert.equal(row.status, 'error'); assert.equal(row.errorKey, 'transfer'); assert.equal(row.canRetry, true);
    assert.equal(f.confirmations.length, 0);
    assert.doesNotMatch(JSON.stringify(row), /PRIVATE LOCAL ERROR|error_msg/);
    assert.equal(f.queue.retry(row), true);
    await settle();
    assert.equal(f.requests.length, 2); assert.equal(f.authorizations.length, 1);
    assert.equal(f.requests[1].body.fields.at(-1)[1], file);
    f.requests[1].responseText = '{"success":true}';
    f.requests[1].load(200); await settle();
    assert.equal(row.status, 'confirming'); assert.equal(f.confirmations.length, 1);
    f.confirmations[0].resolve(true); await settle();
    assert.equal(row.status, 'done');
    f.queue.dispose(); await settle();
  }
});

test('local JSON response validation is bounded while remote signed responses remain status-only', async () => {
  for (const text of ['not valid JSON', JSON.stringify({ success: true, detail: 'x'.repeat(64 * 1024) })]) {
    const f = fixture();
    f.queue.add([new LocalFile('bounded-response.txt')], limits()); await f.authorize(0, descriptor(1, { with_credentials: true }));
    f.requests[0].responseText = text;
    f.requests[0].load(200); await settle();
    assert.equal(f.queue.records[0].errorKey, 'transfer'); assert.equal(f.confirmations.length, 0);
    f.queue.dispose(); await settle();
  }
  for (const with_credentials of [false, true]) {
    const f = fixture();
    f.queue.add([new LocalFile('remote-signed.txt')], limits());
    await f.authorize(0, descriptor(1, { with_credentials, attributes: { method: 'PUT', action: 'https://storage.test/signed-upload' }, direct_file: true }));
    Object.defineProperty(f.requests[0], 'responseText', { get() { throw new Error('Remote upload bodies must not be inspected'); } });
    f.requests[0].load(204); await settle();
    assert.equal(f.queue.records[0].status, 'confirming'); assert.equal(f.confirmations.length, 1);
    f.confirmations[0].resolve(true); await settle();
    assert.equal(f.queue.records[0].status, 'done');
    f.queue.dispose(); await settle();
  }
});

test('multipart progress excludes form overhead and a subsecond transfer retains its observed final sample', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('small.txt', 1000)], limits()); await f.authorize();
  const row = f.queue.records[0], xhr = f.requests[0];
  xhr.progress(1000, 2000, 100);
  assert.equal(row.sent, 500, 'half the request maps to half the file, not a prematurely complete file');
  assert.equal(row.progress, 50);
  xhr.progress(2000, 2000, 100);
  assert.equal(row.speed, null, 'normal measurement waits for its interval');
  xhr.load(); await settle();
  assert.equal(row.status, 'confirming');
  assert.deepEqual([...row.history], [5000], 'a terminal measurement retains the actual short-file transfer');
  assert.equal(f.timers.size, 0);
  f.confirmations[0].resolve(true); await settle();
  f.queue.dispose(); await settle();
});

test('stalled uploads clear stale speed and ETA, append observed zero and stop their timer on cancellation', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('stall.txt', 1000)], limits()); await f.authorize();
  const row = f.queue.records[0];
  f.requests[0].progress(100, 1000);
  assert.equal(row.speed, 100); assert.equal(row.eta, 9);
  f.tick(3000);
  assert.equal(row.speed, 0); assert.equal(row.eta, null); assert.equal(row.history.at(-1), 0);
  assert.equal(f.timers.size, 1);
  f.queue.cancel(row); await settle();
  assert.equal(f.timers.size, 0);
  f.queue.dispose(); await settle();
});

test('validation honors exact byte, capacity, duplicate and twenty-file limits before authorization', async () => {
  const f = fixture(), maximum = 2000 * 1048576;
  const result = f.queue.add([new LocalFile('existing.txt'), new LocalFile('oversize.mp4', maximum + 1), new LocalFile('allowed.mp4', maximum), new LocalFile('allowed.mp4', 1)], limits({ existingFiles: [{ id: 90, name: 'existing.txt' }] }));
  assert.deepEqual(Array.from(result.rejected, row => row.errorKey), ['duplicate', 'too_large', 'duplicate']);
  assert.equal(result.added[0].size, maximum);
  assert.equal(f.authorizations.length, 1);
  const capacity = f.queue.add([new LocalFile('no-space.txt', 100)], limits({ availableBytes: maximum + 99 }));
  assert.equal(capacity.rejected[0].errorKey, 'capacity', 'queued bytes are reserved locally before a server row appears');
  const full = f.queue.add([new LocalFile('twenty-first.txt', 1)], limits({ existingFiles: Array.from({ length: 20 }, (_, id) => ({ id: 100 + id, name: `existing-${id}` })) }));
  assert.equal(full.rejected[0].errorKey, 'file_limit');
  f.queue.dispose(); await settle();
});

test('capacity accounting does not subtract queue bytes twice once the library includes their reservation', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('first.txt', 200)], limits({ availableBytes: 300 }));
  await f.authorize();
  const result = f.queue.add([new LocalFile('next.txt', 100)], limits({ availableBytes: 100, existingFiles: [{ id: 1, name: 'first.txt' }] }));
  assert.equal(result.added.length, 1);
  assert.equal(result.rejected.length, 0);
  f.queue.dispose(); await settle();
});

test('completed history does not reserve capacity or block selecting a deleted completed filename again', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('reselect.txt', 200)], limits({ availableBytes: 200 })); await f.authorize();
  f.requests[0].load(); await settle();
  f.confirmations[0].resolve(true); await settle();
  f.available.clear();
  const result = f.queue.add([new LocalFile('reselect.txt', 200)], limits({ availableBytes: 200 }));
  assert.equal(result.added.length, 1); assert.equal(result.rejected.length, 0);
  assert.equal(f.queue.records.length, 2, 'done history remains available beside the new upload');
  f.queue.dispose(); await settle();
});

test('concurrency stays at two and completion waits for actual confirmation', async () => {
  const f = fixture();
  f.queue.add(['one.txt', 'two.txt', 'three.txt'].map(name => new LocalFile(name)), limits());
  assert.equal(f.authorizations.length, 2);
  assert.deepEqual(Array.from(f.queue.records, record => record.status), ['authorizing', 'authorizing', 'queued']);
  await f.authorize(0); await f.authorize(1);
  f.requests[1].load(); await settle();
  assert.equal(f.queue.records[1].status, 'confirming');
  assert.equal(f.queue.records[1].progress, 100);
  assert.equal(f.authorizations.length, 2, 'confirming operations retain their bounded slot');
  f.confirmations[0].resolve(true); await settle();
  assert.equal(f.queue.records[1].status, 'done');
  assert.equal(f.queue.records[1].completedOrder, 1);
  assert.equal(f.authorizations.length, 3);
  f.requests[0].load(); await settle();
  f.confirmations[1].resolve(true); await settle();
  assert.equal(f.queue.records[0].completedOrder, 2, 'latest completion follows completion order, not selection order');
  f.queue.clearCompleted();
  assert.deepEqual(Array.from(f.queue.records, record => record.name), ['three.txt']);
  f.queue.dispose(); await settle();
});

test('progress is observed and whole-attempt histories retain early and late trends within 120 points', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('measurements.bin', 10000)], limits()); await f.authorize();
  const row = f.queue.records[0], xhr = f.requests[0];
  assert.equal(row.speed, null); assert.equal(row.eta, null); assert.deepEqual([...row.history], []);
  xhr.progress(50, 10000, 500);
  assert.equal(row.sent, 50); assert.equal(row.progress, 0.5); assert.equal(row.speed, null);
  xhr.progress(100, 10000, 500);
  assert.equal(row.speed, 100); assert.equal(row.eta, 99); assert.deepEqual([...row.history], [100]);
  xhr.progress(200, 10000, 500, false);
  assert.equal(row.progress, null, 'non-computable progress never creates a percentage');
  xhr.progress(400, 10000, 500);
  assert.equal(row.speed, 300); assert.equal(row.eta, 32);
  for (let index = 1; index <= 130; index++) xhr.progress(400 + index, 10000);
  assert.ok(row.history.length <= 120);
  assert.equal(row.history[0], 200, 'early adjacent samples retain their weighted trend after downsampling');
  assert.equal(row.history.at(-1), 1, 'late measured speed also remains visible');
  xhr.onerror(); await settle();
  assert.equal(row.status, 'error'); assert.equal(row.errorKey, 'network');
  assert.equal(row.attempts[0].status, 'error'); assert.ok(row.attempts[0].history.length <= 120);
  f.queue.dispose(); await settle();
});

test('retry reuses the same reservation, restarts bytes and preserves bounded failed-attempt graphs', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('retry.txt')], limits()); await f.authorize();
  const row = f.queue.records[0];
  for (let attempt = 1; attempt <= 7; attempt++) {
    const xhr = f.requests.at(-1);
    xhr.progress(100, 1000);
    xhr.load(500); await settle();
    assert.equal(row.errorKey, 'transfer'); assert.equal(row.canRetry, true);
    assert.equal(f.queue.retry(row.id), true);
    await settle();
    assert.equal(row.sent, 0);
    assert.equal(f.authorizations.length, 1, 'retry must not request a duplicate pending filename');
  }
  assert.equal(row.attempts.length, 5);
  assert.deepEqual(Array.from(row.attempts, attempt => attempt.number), [4, 5, 6, 7, 8]);
  assert.deepEqual([...row.attempts[0].history], [100]);
  f.queue.dispose(); await settle();
});

test('cancelling authorization retains the eventual descriptor for retry but never sends bytes late', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('cancel-signing.txt')], limits());
  const row = f.queue.records[0];
  assert.equal(f.queue.cancel(row), true);
  assert.equal(row.status, 'cancelled'); assert.equal(row.canRetry, false); assert.equal(row.canDismiss, false);
  assert.equal(f.authorizations[0].signal.aborted, false, 'metadata may finish solely to retain the already reserved row');
  await f.authorize();
  assert.equal(f.requests.length, 0);
  assert.equal(row.fileId, 1); assert.equal(row.canRetry, true); assert.equal(row.canDismiss, true);
  assert.equal(row.errorKey, 'cancelled_reservation');
  assert.equal(f.queue.retry(row), true);
  await settle();
  assert.equal(f.requests.length, 1); assert.equal(f.authorizations.length, 1);
  f.queue.dispose(); await settle();
});

test('upload cancellation aborts native XHR immediately and suppresses late callbacks through retry', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('cancel-bytes.txt')], limits()); await f.authorize();
  const row = f.queue.records[0], previous = f.requests[0];
  previous.progress(100, 1000);
  f.advance(100);
  assert.equal(f.queue.cancel(row.id), true); assert.equal(previous.aborted, true);
  await settle(); assert.equal(row.status, 'cancelled');
  assert.equal(row.speed, null); assert.equal(row.eta, null, 'terminal sampling cannot restore live metrics on cancellation');
  assert.equal(f.queue.retry(row), true);
  previous.progress(1000, 1000); previous.load(); previous.onerror();
  await settle();
  assert.equal(row.status, 'uploading'); assert.equal(row.sent, 0);
  assert.equal(f.confirmations.length, 0);
  f.queue.dispose(); await settle();
});

test('a 2xx acknowledgement prevents cancellation and confirmation retry never resends file bytes', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('confirm.txt')], limits()); await f.authorize();
  const row = f.queue.records[0];
  f.requests[0].progress(1000, 1000);
  f.requests[0].load();
  assert.equal(f.queue.cancel(row), false, 'even before the promise resumes, acknowledged bytes cannot be claimed cancelled');
  await settle(); assert.equal(row.status, 'confirming');
  f.confirmations[0].resolve(false); await settle();
  assert.equal(row.status, 'error'); assert.equal(row.errorKey, 'confirmation');
  f.advance(120 * 60 * 1000);
  assert.equal(f.queue.retry(row), true); await settle();
  assert.equal(f.requests.length, 1); assert.equal(f.authorizations.length, 1);
  assert.equal(f.confirmations.length, 2);
  assert.deepEqual([...row.history], [1000], 'confirmation retry keeps the actual transfer history');
  f.confirmations[1].resolve(true); await settle();
  assert.equal(row.status, 'done'); assert.equal(row.canRetry, false);
  f.queue.dispose(); await settle();
});

test('expired pending reservations keep Retry available without sending or signing until explicit removal', async () => {
  const f = fixture(), file = new LocalFile('expired.txt');
  f.queue.add([file], limits()); await f.authorize();
  const row = f.queue.records[0];
  f.requests[0].onerror(); await settle();
  f.advance(110 * 60 * 1000);
  assert.equal(f.queue.retry(row), true); await settle();
  assert.equal(row.errorKey, 'pending_reservation'); assert.equal(row.canRetry, true); assert.equal(row.canDismiss, true);
  assert.equal(f.recoveries.length, 1); assert.equal(f.authorizations.length, 1); assert.equal(f.requests.length, 1);
  f.available.clear();
  assert.equal(f.queue.retry(row), true); await settle();
  assert.equal(f.authorizations.length, 2, 'fresh available result permits a new reservation after removal');
  assert.equal(f.authorizations[1].file, file);
  await f.authorize(1, descriptor(2));
  assert.equal(row.fileId, 2); assert.equal(f.requests.length, 2);
  f.queue.dispose(); await settle();
});

test('unknown signing outcomes and invalid descriptors retain their File for safe fresh-state retry', async () => {
  for (const invalid of [false, true]) {
    const f = fixture(), file = new LocalFile('unknown.txt');
    f.queue.add([file], limits());
    if (invalid) { f.available.add(1); f.authorizations[0].resolve(descriptor(1, { attributes: { method: 'DELETE', action: '/fixture/private-action' } })); }
    else f.authorizations[0].reject(new Error('PRIVATE RESPONSE MUST NOT ENTER UI'));
    await settle();
    const row = f.queue.records[0];
    assert.equal(row.status, 'error'); assert.equal(row.errorKey, invalid ? 'unsupported' : 'authorize');
    assert.equal(row.canRetry, true); assert.equal(row.canDismiss, true);
    if (invalid) assert.equal(row.fileId, 1, 'safe reservation identity survives invalid transport metadata');
    f.recoveryResults.push({ kind: 'pending', fileItem: { id: invalid ? 1 : 77 } });
    assert.equal(f.queue.retry(row), true); await settle();
    assert.equal(row.errorKey, 'pending_reservation'); assert.equal(row.canRetry, true);
    assert.equal(f.recoveries[0].file, file); assert.equal(f.requests.length, 0); assert.equal(f.authorizations.length, 1);
    assert.doesNotMatch(JSON.stringify(row), /PRIVATE RESPONSE|private-action|LOCAL TEST POLICY/);
    f.available.clear();
    assert.equal(f.queue.retry(row), true); await settle();
    assert.equal(f.authorizations.length, 2); assert.equal(f.authorizations[1].file, file);
    await f.authorize(1, descriptor(2));
    assert.equal(row.status, 'uploading'); assert.equal(f.requests.length, 1);
    f.queue.dispose(); await settle();
  }
});

test('fresh complete recovery confirms without a signed descriptor or another binary request', async () => {
  for (const failedDuring of ['authorize', 'transfer']) {
    const f = fixture(), file = new LocalFile('already-complete.txt');
    f.queue.add([file], limits());
    if (failedDuring === 'authorize') f.authorizations[0].reject(new Error('LOCAL FIXTURE response lost'));
    else { await f.authorize(); f.requests[0].progress(100, 1000); f.requests[0].onerror(); }
    await settle();
    const row = f.queue.records[0], originalRequestCount = f.requests.length;
    f.recoveryResults.push({ kind: 'complete', fileItem: { id: failedDuring === 'authorize' ? 55 : 1 } });
    assert.equal(f.queue.retry(row), true); await settle();
    assert.equal(f.recoveries[0].file, file);
    assert.equal(f.authorizations.length, 1); assert.equal(f.requests.length, originalRequestCount);
    assert.equal(row.status, 'confirming'); assert.equal(f.confirmations.length, 1);
    assert.equal(f.confirmations[0].file.id, row.fileId);
    if (failedDuring === 'transfer') assert.deepEqual([...row.history], [100], 'server recovery preserves the observed original graph');
    f.confirmations[0].resolve(true); await settle();
    assert.equal(row.status, 'done'); assert.equal(row.canRetry, false);
    f.queue.dispose(); await settle();
  }
});

test('a different pending identity cannot reuse an old descriptor or its acknowledged-transfer flag', async () => {
  const f = fixture();
  f.queue.add([new LocalFile('changed-reservation.txt')], limits()); await f.authorize();
  const row = f.queue.records[0];
  f.requests[0].load(); await settle();
  f.confirmations[0].resolve(false); await settle();
  f.recoveryResults.push({ kind: 'pending', fileItem: { id: 99 } });
  assert.equal(f.queue.retry(row), true); await settle();
  assert.equal(row.fileId, 99); assert.equal(row.errorKey, 'pending_reservation'); assert.equal(row.canRetry, true);
  assert.equal(f.requests.length, 1); assert.equal(f.authorizations.length, 1); assert.equal(f.confirmations.length, 1);
  f.queue.dispose(); await settle();
});

test('scope disposal aborts a fresh retry assessment and prevents late recovery from authorizing again', async () => {
  const f = fixture(), assessment = deferred();
  f.queue.add([new LocalFile('scope-recovery.txt')], limits());
  f.authorizations[0].reject(new Error('LOCAL FIXTURE authorization response lost')); await settle();
  f.recoveryResults.push(assessment.promise);
  assert.equal(f.queue.retry(f.queue.records[0]), true); await settle();
  assert.equal(f.recoveries.length, 1);
  f.queue.dispose();
  assert.equal(f.recoveries[0].signal.aborted, true);
  assessment.resolve({ kind: 'available' }); await settle();
  assert.equal(f.authorizations.length, 1); assert.equal(f.requests.length, 0); assert.equal(f.queue.records.length, 0);
});

test('scope disposal aborts active work, clears private references and ignores late authorization or transport completion', async () => {
  const signing = fixture();
  signing.queue.add([new LocalFile('scope.txt')], limits());
  signing.queue.dispose();
  assert.equal(signing.authorizations[0].signal.aborted, true);
  await signing.authorize();
  assert.equal(signing.requests.length, 0); assert.equal(signing.queue.records.length, 0);
  assert.equal(signing.queue.add([new LocalFile('later.txt')], limits()).added.length, 0);
  const transferring = fixture();
  transferring.queue.add([new LocalFile('scope-upload.txt')], limits()); await transferring.authorize();
  transferring.queue.dispose();
  assert.equal(transferring.requests[0].aborted, true);
  transferring.requests[0].load(); await settle();
  assert.equal(transferring.confirmations.length, 0); assert.equal(transferring.queue.records.length, 0);
});
