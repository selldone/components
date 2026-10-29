import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import * as Vue from 'vue';
import { renderToString } from '@vue/server-renderer';
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import { JSDOM } from 'jsdom';
import ts from 'typescript';

// Local draft state and inert HTML only: no article endpoint or saved record is used.
const file = new URL('./SArticleWorkspaceFaqs.vue', import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, 'utf8'), { filename: file.pathname });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: 'workspace-faq-test' });
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: 'workspace-faq-test', compilerOptions: { bindingMetadata: compiled.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, filename: file.pathname, id: 'workspace-faq-test', scoped: style.scoped, preprocessLang: style.lang }).errors, []);
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const templateExports = {};
vm.runInNewContext(transpile(template.code), { exports: templateExports, require: () => Vue });
const plain = (value) => JSON.parse(JSON.stringify(value));
const source = () => [{ question: 'Can I connect my store?', answer: '<p>Yes. <strong>Connect your account.</strong></p>', context: { keep: true } }, { question: 'Can vendors manage delivery?', answer: 'Each vendor can manage delivery.' }];

function fixture(props = {}, browser = true) {
  const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://selldone.test/article' });
  const document = dom.window.document, exports = {}, events = [], ticks = [], observers = [];
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports, require: (name) => { assert.equal(name, 'vue'); return Vue; }, URL,
    ...(browser ? { document } : {}),
    ResizeObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe(element) { this.element = element; } disconnect() { this.disconnected = true; } },
  });
  const component = exports.default;
  const state = { ...component.data(), modelValue: source(), editMode: true, disabled: false, active: true, dialog_id: 'faq-editor-test', ...props, $refs: {}, $vuetify: { display: { width: 1200 } }, $t: (key) => key,
    $nextTick: (callback) => ticks.push(callback), $emit: (...args) => events.push(args) };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  let previous = state.pendingDraft;
  for (const key of ['dialog_open', 'mode', 'question', 'answer', 'original_question', 'original_answer']) {
    let value = state[key]; Object.defineProperty(state, key, { get: () => value, set(next) { value = next; const current = state.pendingDraft; if (current !== previous) { previous = current; component.watch.pendingDraft.call(state, current); } } });
  }
  return { component, state, events, document, dom, observers, sanitize: exports.sanitizeFaqAnswer, flush: () => { while (ticks.length) ticks.shift()(); } };
}

test('workspace SFC compiles; default data is opt-in draft state without initializing the parent array', () => {
  const f = fixture({ modelValue: null });
  assert.equal(f.component.props.editMode.default, true);
  assert.equal(f.component.props.active.default, true);
  assert.deepEqual(plain(f.state.items), []);
  assert.deepEqual(f.events, []);
  f.state.openEditor(); assert.equal(f.state.dialog_open, true);
});

test('Add stages question and HTML answer until explicit Apply, without mutating the input array', () => {
  const f = fixture(), before = plain(f.state.modelValue);
  f.state.openEditor(); f.state.question = ' New question '; f.state.answer = '<p>A <b>formatted</b> answer.</p>';
  assert.equal(f.state.pendingDraft, true); assert.deepEqual(plain(f.state.modelValue), before);
  assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  f.state.apply();
  const next = f.events.find(([name]) => name === 'update:modelValue')[1];
  assert.equal(next.length, 3); assert.equal(next[2].question, 'New question'); assert.equal(next[2].answer, '<p>A <b>formatted</b> answer.</p>');
  assert.deepEqual(plain(f.state.modelValue), before); assert.equal(f.state.dialog_open, false); assert.equal(f.state.pendingDraft, false);
  assert.ok(f.events.some(([name]) => name === 'change')); assert.deepEqual(f.events.filter(([name]) => name === 'pending-change').map(([, value]) => value), [true, false]);
});

test('Edit preserves existing HTML and other record metadata; unchanged Apply is not a change', () => {
  const f = fixture(); f.state.openEditor(0);
  assert.equal(f.state.answer, source()[0].answer); f.state.apply(); assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  f.state.openEditor(0); f.state.question = 'Updated question'; f.state.apply();
  const next = f.events.find(([name]) => name === 'update:modelValue')[1];
  assert.deepEqual(plain(next[0]), { ...source()[0], question: 'Updated question' });
  assert.equal(f.state.modelValue[0].question, source()[0].question);
});

test('required validation rejects whitespace and markup-only answers while retaining the draft', () => {
  const f = fixture(); f.state.openEditor(); f.state.question = '  '; f.state.answer = '<p>Answer</p>'; f.state.apply();
  assert.equal(f.state.invalid, true); assert.match(f.state.error, /required/); assert.equal(f.state.dialog_open, true);
  f.state.question = 'Question'; f.state.answer = '<p><br>&nbsp;</p><script>alert(1)</script>'; f.state.apply();
  assert.equal(f.state.invalid, true); assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  f.state.answer = '<p>Valid answer</p>'; f.state.apply(); assert.equal(f.state.dialog_open, false);
});

test('Delete requires the removal dialog and fresh target; confirming removes only from the returned draft', () => {
  const f = fixture(); f.state.openEditor(0); f.state.removeQuestion(); assert.equal(f.events.length, 0);
  f.state.requestClose(); f.state.openRemoval(0); assert.equal(f.state.mode, 'remove'); assert.equal(f.state.dialog_open, true);
  f.state.removeQuestion(); const next = f.events.find(([name]) => name === 'update:modelValue')[1];
  assert.deepEqual(plain(next), [source()[1]]); assert.equal(f.state.modelValue.length, 2);
});

test('ordering is bounded, immutable and retains all HTML and metadata', () => {
  const f = fixture(); f.state.move(0, -1); f.state.move(1, 1); f.state.move(-1, 1); f.state.move(0, 2);
  assert.equal(f.events.length, 0);
  f.state.move(0, 1); assert.deepEqual(plain(f.events[0][1]), [source()[1], source()[0]]); assert.deepEqual(plain(f.state.modelValue), source());
  f.state.openEditor(0); f.state.move(0, 1); assert.equal(f.events.filter(([name]) => name === 'update:modelValue').length, 1);
});

test('Cancel/Escape path confirms dirty close; Keep editing preserves values; Discard publishes nothing', () => {
  const f = fixture(); f.state.openEditor(0); f.state.answer += '<p>More</p>'; f.state.requestClose();
  assert.equal(f.state.discard_open, true); assert.equal(f.state.dialog_open, true);
  f.state.keepEditing(); assert.equal(f.state.discard_open, false); assert.match(f.state.answer, /More/);
  f.state.requestClose(); f.state.discardChanges();
  assert.equal(f.state.dialog_open, false); assert.equal(f.state.pendingDraft, false); assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
});

test('opening another question requires discarding an unapplied draft', () => {
  const f = fixture(); f.state.openEditor(0); f.state.question = 'Unsaved'; f.state.openEditor(1);
  assert.equal(f.state.editing_index, 0); assert.equal(f.state.discard_open, true); f.state.discardChanges();
  assert.equal(f.state.editing_index, 1); assert.equal(f.state.question, source()[1].question); assert.equal(f.state.pendingDraft, false);
});

test('sibling tabs hide overlays and retain draft; an old discard action cannot run after returning', () => {
  const f = fixture(); f.state.openEditor(0); f.state.answer += ' unsaved'; f.state.requestClose();
  f.state.active = false; f.component.watch.active.call(f.state, false);
  assert.equal(f.state.dialog_open, true); assert.equal(f.state.pendingDraft, true); assert.equal(f.state.discard_open, false);
  f.state.active = true; f.state.discardChanges(); assert.equal(f.state.dialog_open, true); assert.match(f.state.answer, /unsaved/);
});

test('current permission, active section and teardown guard every mutation and stale confirmation', () => {
  for (const props of [{ editMode: false }, { active: false }]) {
    const f = fixture(props); f.state.openEditor(); f.state.openRemoval(0); f.state.move(0, 1);
    assert.equal(f.state.dialog_open, false); assert.deepEqual(f.events, []);
  }
  const f = fixture(); f.state.openEditor(0); f.state.question = 'Unsaved'; f.state.editMode = false;
  f.state.apply(); f.state.formatAnswer('b'); f.state.removeQuestion(); assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  f.state.requestClose(); f.component.beforeUnmount.call(f.state); f.state.editMode = true; f.state.discardChanges(); f.state.apply(); f.state.move(0, 1);
  assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false); assert.deepEqual(f.events.at(-1), ['pending-change', false]);
});

test('a replaced or externally changed question cannot be overwritten or deleted by an old editor', () => {
  for (const mode of ['edit', 'remove']) {
    const f = fixture(); mode === 'edit' ? f.state.openEditor(0) : f.state.openRemoval(0); f.state.question = 'My change';
    f.state.modelValue = [{ ...f.state.modelValue[0], question: 'New server question' }, f.state.modelValue[1]];
    mode === 'edit' ? f.state.apply() : f.state.removeQuestion();
    assert.match(f.state.error, /changed_target/); assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  }
});

test('format controls wrap only the selected HTML-source range and keep the selection focused', () => {
  const f = fixture(); f.state.openEditor(); f.state.answer = 'A formatted answer';
  const textarea = f.document.createElement('textarea'); textarea.value = f.state.answer; textarea.setSelectionRange(2, 11); f.document.body.append(textarea);
  f.state.$refs.answerInput = { $el: { querySelector: () => textarea } }; f.state.formatAnswer('b'); f.flush();
  assert.equal(f.state.answer, 'A <b>formatted</b> answer'); assert.equal(f.document.activeElement, textarea); assert.equal(textarea.selectionStart, 5); assert.equal(textarea.selectionEnd, 14);
  const before = f.state.answer; f.state.formatAnswer('script'); assert.equal(f.state.answer, before);
});

test('local reader preview preserves allowed formatting but removes active HTML, unsafe links and attributes', () => {
  const f = fixture(); const input = '<p onclick="bad()">Read <strong>this</strong> <a href="https://example.test/help" target="_blank" onmouseover="bad()">guide</a>.</p><img src="x" onerror="bad()"><script>bad()</script><svg onload="bad()"></svg><a href="java&#x0a;script:bad()">bad link</a><a href="mailto:help@example.test">Email</a>';
  const out = f.sanitize(input);
  assert.match(out, /<strong>this<\/strong>/); assert.match(out, /href="https:\/\/example.test\/help"/); assert.match(out, /href="mailto:help@example.test"/);
  assert.doesNotMatch(out, /onclick|onerror|onmouseover|script|<img|<svg|target=/i); assert.match(out, /<a>bad link<\/a>/); assert.equal(f.state.answerText('<p>Text &amp; more</p>'), 'Text & more');
  const ssr = fixture({}, false); assert.equal(ssr.sanitize('<b>Text</b>'), '&lt;b&gt;Text&lt;/b&gt;');
});

async function render(f) {
  const component = { ...f.component, render: templateExports.render, data: () => ({ ...f.component.data() }) };
  const app = Vue.createSSRApp(component, { modelValue: f.state.modelValue, editMode: f.state.editMode, disabled: f.state.disabled });
  Object.assign(app.config.globalProperties, { $t: (key) => key, $vuetify: { display: { width: 1200 } } });
  const pass = { render() { return Vue.h('div', this.$attrs, this.$slots.default?.()); } };
  for (const tag of new Set(Array.from(descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g), ([, name]) => name))) if (!['v-dialog', 'v-tooltip', 'v-btn'].includes(tag)) app.component(tag, pass);
  app.component('v-dialog', { props: ['modelValue'], render() { return this.modelValue ? Vue.h('div', { role: 'dialog' }, this.$slots.default?.()) : null; } });
  app.component('v-tooltip', { render() { return Vue.h('div', this.$slots.activator?.({ props: {} })); } });
  app.component('v-btn', { props: ['disabled'], render() { return Vue.h('button', { ...this.$attrs, disabled: this.disabled }, this.$slots.default?.()); } });
  return renderToString(app);
}

test('preview has the same question order, escaped labels and safe answer HTML in native rendering', async () => {
  const f = fixture({ modelValue: [{ question: '<img src=x onerror=bad()>', answer: '<p>Safe <b>bold</b></p><script>bad()</script>' }, source()[1]], editMode: false });
  const html = await render(f);
  assert.match(html, /&lt;img src=x onerror=bad\(\)&gt;/); assert.match(html, /Safe <b>bold<\/b>/); assert.doesNotMatch(html, /<script|<img src=x/);
  assert.equal((html.match(/<details/g) || []).length, 2); assert.ok(html.indexOf('&lt;img') < html.indexOf('Can vendors manage delivery?'));
  assert.match(html, /disabled/); assert.doesNotMatch(html, /role="dialog"/);
});

test('temporary busy disables FAQ mutations without claiming read-only access, and editing resumes afterwards', async () => {
  const f = fixture();
  assert.equal(f.component.props.disabled.default, false);
  f.state.openEditor(0); f.state.answer += '<p>Retained draft.</p>';
  const draft = f.state.answer;
  f.state.disabled = true;
  f.state.apply(); f.state.openRemoval(0); f.state.removeQuestion(); f.state.move(0, 1); f.state.formatAnswer('b');
  assert.equal(f.state.dialog_open, true); assert.equal(f.state.answer, draft);
  assert.equal(f.events.some(([name]) => name === 'update:modelValue'), false);
  const document = new JSDOM(await render(f)).window.document;
  const controls = [...document.querySelectorAll('button')];
  assert.equal(controls.length, 9); assert.ok(controls.every((button) => button.disabled));
  assert.equal(document.querySelector('.s-article-workspace-faqs__readonly'), null);
  f.state.disabled = false; f.state.apply();
  assert.equal(f.events.filter(([name]) => name === 'update:modelValue').length, 1);
  assert.equal(f.events.find(([name]) => name === 'update:modelValue')[1][0].answer, draft);
  const readonly = fixture({ editMode: false });
  assert.ok(new JSDOM(await render(readonly)).window.document.querySelector('.s-article-workspace-faqs__readonly'));
});

test('clipping help follows measured two-line overflow and releases observers', () => {
  const f = fixture(), seen = [], element = { scrollHeight: 60, clientHeight: 38, scrollWidth: 100, clientWidth: 100 };
  const directive = f.component.directives.overflowCheck; directive.mounted(element, { value: (value) => seen.push(value) });
  assert.deepEqual(seen, [true]); element.scrollHeight = 38; f.observers[0].callback(); assert.equal(seen.at(-1), false);
  directive.beforeUnmount(element); assert.equal(f.observers[0].disconnected, true); assert.equal(element._articleFaqOverflow, undefined);
});
