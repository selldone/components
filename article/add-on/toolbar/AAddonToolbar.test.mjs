import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import jquery from "jquery";
import { JSDOM } from "jsdom";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as sass from "sass";
import ts from "typescript";

const files = ["./AAddonToolbar.vue", "../catalog/AAddonCatalog.vue", "../comparison/AAddonComparison.vue", "../canvas/AAddonCanvas.vue", "../canvas/editor/AAddonCanvasEditor.vue", "../code-editor/AAddonCodeEditor.vue", "../catalog/dialog/AAddonCatalogDialog.vue", "../comparison/dialog/AAddonComparisonDialog.vue", "../code-editor/dialog/AAddonCodeEditorDialog.vue"];
const scripts = new Map();
for (const relative of files) {
  const url = new URL(relative, import.meta.url), filename = fileURLToPath(url);
  const { descriptor, errors } = parse(readFileSync(url, "utf8"), { filename });
  assert.deepEqual(errors, []);
  const compiled = compileScript(descriptor, { id: "addon-test" });
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: "addon-test", compilerOptions: { bindingMetadata: compiled.bindings } }).errors, []);
  for (const style of descriptor.styles) {
    if (style.src) sass.compile(fileURLToPath(new URL(style.src, url)));
    else assert.deepEqual(compileStyle({ source: style.content, filename, id: "addon-test", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
  }
  scripts.set(relative, descriptor.script.content);
}
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function fixture() {
  const dom = new JSDOM('<div class="editor-host"><div id="editable_body" class="medium-editor-element" contenteditable="true"><p>Before</p><div class="flip-book a-article-addon--editable" contenteditable="false"><div class="a-article-addon-tools"></div></div><p>After</p></div></div>');
  const document = dom.window.document, $ = jquery(dom.window), editor = document.querySelector('#editable_body'), element = editor.children[1];
  const actions = [], confirmations = [], events = [], ticks = [];
  const listeners = new Map();
  const eventBus = {
    $on(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
    $off(name, callback) { if (callback) listeners.get(name)?.delete(callback); else listeners.delete(name); },
    $emit(name, payload) { for (const callback of listeners.get(name) || []) callback(payload); },
  };
  const core = { options: { enabled: true }, getEditor: () => ({ options: { elementsContainer: document.body } }), triggerInput: () => actions.push("input"), moveCaret: (paragraph) => actions.push(["caret", paragraph[0]]), hideAddons: () => actions.push("hide") };
  $(editor).data("plugin_mediumInsert", core);
  const globals = { exports: {}, $, jQuery: $, window: dom.window, document, console: { log() {}, error() {} }, setTimeout, clearTimeout };
  vm.runInNewContext(transpile(readFileSync(new URL('./article-addon-context.ts', import.meta.url), "utf8")), globals);
  const contextModule = globals.exports;
  function component(relative) {
    const exports = {};
    vm.runInNewContext(transpile(scripts.get(relative)), {
      ...globals, exports,
      ResizeObserver: class { constructor(callback) { this.callback = callback; } observe() {} disconnect() { actions.push("disconnect"); } },
      require(name) {
        if (name === 'vue') return { defineComponent: (component) => component };
        if (name.includes('article-addon-context')) return contextModule;
        if (name.includes('EventBus')) return { EventBus: eventBus, EventName: new Proxy({}, { get: (_, key) => key }) };
        if (name.includes('NotificationService')) return { default: { openDangerAlert: (...args) => confirmations.push(args.at(-1)) } };
        return { default: {} };
      },
    });
    return exports.default;
  }
  function state(relative, additions = {}) {
    const definition = component(relative);
    const result = { ...(typeof definition.data === 'function' ? definition.data.call({ editable: true }) : {}), editable: true, element, $el: element, $refs: {}, $forceUpdate() {}, $t: (key) => key, $emit: (name, value) => events.push([name, value]), ...additions };
    result.$nextTick = (callback) => ticks.push(() => callback.call(result));
    for (const [name, method] of Object.entries(definition.methods || {})) result[name] = method.bind(result);
    for (const [name, getter] of Object.entries(definition.computed || {})) Object.defineProperty(result, name, { get: () => getter.call(result) });
    return { state: result, definition };
  }
  const flush = () => { while (ticks.length) ticks.shift()(); };
  return { dom, $, document, editor, element, core, actions, confirmations, events, globals, contextModule, state, flush, eventBus };
}

test("paragraphs and movement target only the current editable owner and notify the existing editor", () => {
  const f = fixture(), { state } = f.state('./AAddonToolbar.vue');
  state.addEnterBefore();
  const before = f.element.previousElementSibling;
  assert.equal(before.outerHTML, '<p><br></p>');
  state.addEnterAfter();
  assert.equal(f.element.nextElementSibling.outerHTML, '<p><br></p>');
  assert.equal(f.actions.filter((action) => action === 'input').length, 2);
  state.moveBlock(-1);
  assert.equal(f.element.nextElementSibling, before);
  state.moveBlock(1);
  assert.equal(f.element.previousElementSibling, before);
  state.requestEdit();
  assert.equal(f.events.at(-1)[0], 'click:edit');
  state.pinned = true; state.onFocusOut({ relatedTarget: f.element.firstElementChild });
  assert.equal(state.pinned, true);
  state.onFocusOut({ relatedTarget: f.editor.firstElementChild });
  assert.equal(state.pinned, false);
  const snapshot = f.editor.innerHTML;
  f.editor.parentElement.setAttribute('inert', '');
  state.addEnterAfter(); state.moveBlock(1); state.requestEdit();
  assert.equal(f.editor.innerHTML, snapshot);
  f.editor.parentElement.removeAttribute('inert');
  f.editor.parentElement.style.display = 'none';
  assert.equal(state.editorContext(), null, 'Preview keeps DOM mounted but blocks delayed edits');
  f.editor.parentElement.style.display = '';
  f.core.options.enabled = false;
  assert.equal(state.editorContext(), null);
  f.dom.window.close();
});

test("removal confirms the exact block and rechecks current permission, scope and attachment", () => {
  const f = fixture(), { state } = f.state('./AAddonToolbar.vue');
  state.requestRemoval();
  f.editor.setAttribute('contenteditable', 'false');
  f.confirmations[0]();
  assert.equal(f.element.isConnected, true);
  f.editor.setAttribute('contenteditable', 'true');
  state.requestRemoval();
  const original = state.element;
  state.element = f.document.createElement('div');
  f.editor.append(state.element);
  f.confirmations[1]();
  assert.equal(original.isConnected, true);
  state.element = original;
  state.requestRemoval(); f.confirmations[2]();
  assert.equal(original.isConnected, false);
  assert.equal(f.actions.filter((action) => action === 'input').length, 1);
  f.dom.window.close();
});

test("catalog Cancel keeps its original pages; save and deletion callbacks reject a frozen draft", () => {
  const f = fixture(), original = { max_height: 40, pages: ['/a.jpg'] };
  let dialog;
  const { state } = f.state('../catalog/AAddonCatalog.vue', { muted_pack: original, ShowFlipBookGlobalDialog: (...args) => { dialog = args; } });
  state.showEdit('size');
  dialog[0].pages.push('/b.jpg');
  assert.deepEqual(original.pages, ['/a.jpg']);
  f.editor.parentElement.setAttribute('inert', '');
  dialog[1](dialog[0]); dialog[2]();
  assert.equal(state.muted_pack, original);
  assert.equal(f.element.isConnected, true);
  f.editor.parentElement.removeAttribute('inert');
  dialog[1](dialog[0]); f.flush();
  assert.equal(state.muted_pack.pages.length, 2);
  assert.ok(f.actions.includes('input'));
  let refreshes = 0; state.onChange = () => refreshes++;
  state.onIntersect(false); assert.equal(refreshes, 0);
  state.onIntersect(true); assert.equal(refreshes, 1);
  f.dom.window.close();
});

test("code confirmation uses its captured language rather than a later tab selection", () => {
  const f = fixture(); let dialog;
  const { state } = f.state('../code-editor/AAddonCodeEditor.vue', { selected_lang: 'js', codes: { js: 'old JS', css: 'old CSS' }, ShowCodeEditorGlobalDialog: (...args) => { dialog = args; } });
  state.showEdit(); state.selected_lang = 'css'; dialog[2]('new JS'); f.flush();
  assert.equal(state.codes.js, 'new JS');
  assert.equal(state.codes.css, 'old CSS');
  f.editor.parentElement.style.display = 'none'; dialog[2]('stale');
  assert.equal(state.codes.js, 'new JS');
  f.dom.window.close();
});

test("closing one editor removes only its own global add-on dialog listener", () => {
  for (const [file, event] of [
    ['../catalog/dialog/AAddonCatalogDialog.vue', 'ARTICLE_FLIP_BOOK_SHOW'],
    ['../comparison/dialog/AAddonComparisonDialog.vue', 'ARTICLE_COMPARE_IMAGES_SHOW'],
    ['../code-editor/dialog/AAddonCodeEditorDialog.vue', 'ARTICLE_CODE_EDITOR_SHOW'],
  ]) {
    const f = fixture();
    const first = f.state(file, { masterId: 'first' }), second = f.state(file, { masterId: 'second' });
    first.definition.mounted.call(first.state); second.definition.mounted.call(second.state);
    f.eventBus.$emit(event, { masterId: 'first', pack: {}, code: 'first' });
    assert.equal(first.state.show_dialog, true, file);
    assert.equal(second.state.show_dialog, false, file);
    first.definition.beforeUnmount.call(first.state);
    f.eventBus.$emit(event, { masterId: 'second', pack: {}, code: 'second' });
    assert.equal(second.state.show_dialog, true, file);
    second.definition.beforeUnmount.call(second.state);
    f.dom.window.close();
  }
});

test("canvas uses current width and fresh guards while retaining its JSON coordinate space", () => {
  const f = fixture();
  f.element.classList.add('image-overlay-canvas');
  const canvasRoot = f.document.createElement('div'), canvas = f.document.createElement('canvas');
  f.element.append(canvasRoot); canvasRoot.append(canvas);
  const ctx = new Proxy({}, { get(target, key) { return target[key] || (() => {}); } });
  canvas.getContext = () => ctx;
  const { state, definition } = f.state('../canvas/editor/AAddonCanvasEditor.vue', { $el: canvasRoot, $refs: { canvas }, image: '/background.jpg', ratio: 1, rects: [{ startX: 50, startY: 50, w: 100, h: 100 }] });
  definition.mounted.call(state);
  state._canvasResize.callback([{ contentRect: { width: 312 } }]);
  assert.equal(state.width, 312); assert.equal(state.scale, 0.5);
  assert.equal(state.bg_image, '/background.jpg');
  const pointer = (name, x, y) => { const event = new f.dom.window.Event(name); Object.defineProperties(event, { offsetX: { value: x }, offsetY: { value: y }, pointerId: { value: 1 } }); canvas.dispatchEvent(event); };
  pointer('pointerdown', 30, 30); pointer('pointermove', 40, 40); pointer('pointerup', 40, 40);
  assert.equal(state.rects[0].startX, 70); assert.equal(state.rects[0].startY, 70);
  assert.ok(f.events.some(([name]) => name === 'change'));
  const changes = f.events.filter(([name]) => name === 'change').length;
  pointer('pointerdown', 40, 40); pointer('pointermove', 50, 50); pointer('pointercancel', 50, 50);
  assert.equal(state.rects[0].startX, 90);
  assert.equal(f.events.filter(([name]) => name === 'change').length, changes + 1, 'cancelled moves still notify persisted coordinate changes');
  state.setRatio(0); assert.ok(!f.events.some(([name, value]) => name === 'update:ratio' && value === 0));
  state.setRatio(1.2); assert.ok(f.events.some(([name, value]) => name === 'update:ratio' && value === 1.2));
  f.editor.parentElement.setAttribute('inert', '');
  const count = state.rects.length;
  state.clearAll(); state.RemoveSelected(); state.setBg('/new.jpg'); state.setSelected('caption', 'blocked');
  assert.equal(state.rects.length, count);
  assert.ok(!f.events.some(([name, value]) => name === 'update:image' && value === '/new.jpg'));
  definition.beforeUnmount.call(state);
  assert.ok(f.actions.includes('disconnect'));
  f.dom.window.close();
});

test("all four plugins retain fallback tools but do not add duplicate controls to Vue blocks", () => {
  const plugins = [
    ['catalog', 'ArticleAddonCatalogPlugin', 'FlipBookAddon', 'medium-insert-flip-book-active'],
    ['comparison', 'ArticleAddonComparisonPlugin', 'ImagesCompareAddon', 'medium-insert-images-compare-active'],
    ['canvas', 'ArticleAddonCanvasPlugin', 'ImageOverlayCanvasAddon', 'medium-insert-image-overlay-canvas-active'],
    ['code-editor', 'ArticleAddonCodeEditorPlugin', 'CodeEditorAddon', 'medium-insert-code-editor-active'],
  ];
  for (const [folder, file, addon, activeClass] of plugins) {
    const f = fixture();
    f.dom.window.MediumInsert = { Templates: { 'src/js/templates/images-toolbar.hbs': () => '<div class="medium-insert-images-toolbar2"></div>' } };
    f.$.fx.off = true;
    vm.runInNewContext(transpile(readFileSync(new URL('../'+folder+'/plugin/'+file+'.ts', import.meta.url), 'utf8')), { ...f.globals, require: () => ({ default: f.$ }) });
    f.$(f.editor)['mediumInsert'+addon]({});
    const plugin = f.$(f.editor).data('plugin_mediumInsert'+addon);
    plugin.$currentImage = f.$(f.element);
    f.element.classList.add(activeClass);
    plugin.addToolbar();
    assert.equal(f.document.querySelectorAll('.medium-insert-images-toolbar2').length, 0, file);
    f.element.querySelector('.a-article-addon-tools').remove();
    plugin.addToolbar();
    assert.equal(f.document.querySelectorAll('.medium-insert-images-toolbar2').length, 1, file);
    f.core.options.enabled = false; plugin.deleteAction({ which: 8 });
    assert.equal(f.element.isConnected, true);
    f.dom.window.close();
  }
});

test("the actual article serializer keeps only the original four JSON payloads", () => {
  const f = fixture();
  const url = new URL('../../SArticleEditor.vue', import.meta.url);
  const { descriptor } = parse(readFileSync(url, 'utf8'));
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), { ...f.globals, exports, require(name) { if (name === 'vue') return { defineComponent: (component) => component }; if (name === 'lodash-es') return { debounce: (fn) => fn }; return { default: {} }; } });
  const payloads = { 'code-editor': { js: 'const value = 1;' }, 'images-compare': { original: '/a.jpg', compare: '/b.jpg', max_width: 20, dim: 'em' }, 'flip-book': { max_height: 40, pages: ['/catalog.jpg'] }, 'image-overlay-canvas': { rects: [{ startX: 50, startY: 50, w: 100, h: 100 }], bg: '/canvas.jpg', ratio: 1 } };
  f.editor.replaceChildren();
  for (const [name, payload] of Object.entries(payloads)) {
    const block = f.document.createElement('div'); block.className = name+' a-article-addon--editable'; block.setAttribute('data', JSON.stringify(payload)); block.innerHTML = '<div class="a-article-addon-tools"><button>Editor tools</button></div>'; f.editor.append(block);
  }
  const output = exports.default.methods.purifyBody.call({ EDITABLE_BODY_ID: 'editable_body' });
  const saved = new JSDOM(output).window.document;
  for (const [name, payload] of Object.entries(payloads)) assert.deepEqual(JSON.parse(decodeURIComponent(saved.querySelector(name).textContent)), payload);
  assert.ok(!output.includes('a-article-addon-tools'));
  f.dom.window.close();
});
