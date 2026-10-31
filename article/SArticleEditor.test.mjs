import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { JSDOM } from "jsdom";
import jquery from "jquery";
import numeral from "numeral";
import axios from "axios";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

// Exercise the real component with manually completed synthetic HTTP; never boot an editor or upload files.
const filename = fileURLToPath(new URL("./SArticleEditor.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "article-editor-test" });
const template = compileTemplate({
  source: descriptor.template.content, filename, id: "article-editor-test",
  compilerOptions: { bindingMetadata: compiled.bindings },
});
assert.deepEqual(template.errors, []);
// Legacy global styles remain untouched; compile the new opt-in scoped treatment.
for (const style of descriptor.styles.filter((style) => style.scoped)) assert.deepEqual(compileStyle({
  source: style.content, filename, id: "article-editor-test", scoped: true, preprocessLang: style.lang,
}).errors, []);
const script = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const documentFile = (name = "story.docx", size = 100) => ({ name, size });
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture(props = {}, browser) {
  const exports = {}, requests = [], events = [], notices = [], ticks = [], dispatches = [], apps = [], warnings = [];
  const timers = new Map(), placeholders = new Map();
  let timerId = 0;
  const dispatchResult = { forwarded: true };
  const window = browser?.window || {};
  window.axios = { post(url, form, config) {
    let resolve, reject, complete;
    const request = { url, file: form.get("file"), form, config,
      success: (data) => resolve({ data }), failure: (data) => reject({ response: { data } }), finish: () => complete() };
    requests.push(request);
    const chain = { then(callback) { resolve = callback; return chain; }, catch(callback) { reject = callback; return chain; }, finally(callback) { complete = callback; return chain; } };
    return chain;
  } };
  vm.runInNewContext(script, {
    exports, window, console: { log() {}, error() {}, warn: (...args) => warnings.push(args) },
    FormData: browser?.FormData || class { values = new Map(); append(key, value) { this.values.set(key, value); } get(key) { return this.values.get(key); } },
    setTimeout(callback) { timers.set(++timerId, callback); return timerId; },
    clearTimeout(id) { timers.delete(id); },
    document: browser?.document || {
      querySelectorAll: (selector) => [...(placeholders.get(selector) || [])],
      createElement: () => ({}),
    },
    $: browser?.$ || (() => ({ remove() {}, attr() {}, each() {} })),
    require(name) {
      if (name === "vue") return {
        defineComponent: (component) => component,
        h: (component, props) => ({ component, props }),
        createApp(component) {
          const app = {
            unmounts: 0,
            use() {},
            mount(container) { app.rendered = component.render(); app.root = container.firstElementChild = { isConnected: false }; },
            unmount() { app.unmounts++; app.root.isConnected = false; },
          };
          apps.push(app);
          return app;
        },
      };
      if (name.includes("components-mandetory")) return { installGlobalComponents() {} };
      if (name === "medium-editor") return { default: class { subscribe() {} } };
      if (name === "lodash-es") return { debounce: (callback) => callback };
      if (name.includes("FileFormatConverterOnline")) return { FileFormatConverterOnline: {
        ConvertWordToHtml: (context, url, file, success) => requests.push({ context, url, file, success }),
      } };
      if (name.includes("NotificationService")) return { default: {
        showErrorAlert: (...args) => notices.push(["error", ...args]),
        showSuccessAlert: (...args) => notices.push(["success", ...args]),
      } };
      return { default: {} };
    },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props).map(([key, value]) => [key, value.default]));
  let clicks = 0, directions = 0;
  const state = {
    ...defaults, ...component.data(), edit: true, title: "Original title", body: "<p>Original body</p>",
    wordConverterUrl: "/converter/shop/7", MASTER_ID: "article-test", ...props,
    $refs: { file_input: { value: "", files: [], click() { clicks++; } } },
    $store: { dispatch(action) { dispatches.push(action); return dispatchResult; } },
    $nextTick: (callback) => ticks.push(callback),
    $t: (key) => key,
    $emit(name, value) {
      events.push([name, value]);
      if (name === "update:title") state.title = value;
      if (name === "update:body") state.body = value;
    },
  };
  let busy = state.word_import_busy;
  Object.defineProperty(state, "word_import_busy", {
    get: () => busy,
    set(value) { if (busy === value) return; busy = value; component.watch.word_import_busy.call(state, value); },
  });
  let importDialog = state.word_import_dialog;
  Object.defineProperty(state, "word_import_dialog", {
    get: () => importDialog,
    set(value) { if (importDialog === value) return; importDialog = value; component.watch.word_import_dialog.call(state, value); },
  });
  Object.defineProperty(state, "canImportWord", { get: () => component.computed.canImportWord.call(state) });
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  component.created.call(state);
  state.geti18n = () => ({});
  state.setDirection = () => { directions++; };
  state.refresh = () => {};
  state.onEdited = () => events.push(["change", { title: state.title, body: state.body }]);
  const finish = (index = requests.length - 1) => requests[index].finish ? requests[index].finish() : requests[index].context.$store.dispatch({ type: "removeUploadingFile", file_id: requests[index].file.name });
  const flush = () => { while (ticks.length) ticks.shift()(); };
  const flushTimers = () => { for (const [id, callback] of [...timers]) { timers.delete(id); callback(); } };
  const addBlock = (tag) => {
    const selector = `#${state.MASTER_ID} ${tag}`;
    const element = {
      innerHTML: encodeURIComponent("{}"),
      closest: () => ({}),
      parentNode: { replaceChild(root) {
        root.isConnected = true;
        root.closest = (master) => master === `#${state.MASTER_ID}` ? {} : null;
        placeholders.set(selector, placeholders.get(selector).filter((item) => item !== element));
      } },
    };
    placeholders.set(selector, [...(placeholders.get(selector) || []), element]);
  };
  return { component, state, requests, events, notices, ticks, dispatches, dispatchResult, window, warnings, finish, flush, flushTimers, addBlock, apps, clicks: () => clicks, directions: () => directions };
}

assert.equal(fixture().component.props.workspace.default, false);
{
  const f = fixture({ workspace: true });
  let delayed = 0;
  f.state.onEditedDebounced = () => delayed++;
  f.component.methods.onEdited.call(f.state);
  assert.equal(f.state.state, "changed");
  assert.ok(f.events.some(([name]) => name === "change"), "Workspace drafts are dirty before immediate preview or navigation");
  assert.equal(delayed, 0);
  f.state.workspace = false;
  f.component.methods.onEdited.call(f.state);
  assert.equal(delayed, 1, "Legacy callers retain debounce");
}
{
  const f = fixture();
  f.state.showSelectWord();
  assert.equal(f.clicks(), 1, "Legacy entry still opens the native picker immediately");
  const file = documentFile();
  f.state.loadWordFile([file]);
  assert.equal(f.requests[0].context, f.state);
  assert.equal(f.requests[0].file, file);
  assert.equal(f.state.title, "Original title");
  f.requests[0].success({ title: "Imported", body: "<p>Converted</p>" });
  assert.equal(f.state.title, "", "Legacy clear/nextTick replacement remains intact");
  f.flush();
  assert.equal(f.state.title, "Imported");
  assert.equal(f.state.body, "<p>Converted</p>");
  assert.ok(!f.events.some(([name]) => name === "workspace-busy"));
  f.state.loadWordFile([documentFile("bad.txt")]);
  f.state.loadWordFile([documentFile("big.odt", 8 * 1024 * 1024 + 1)]);
  assert.equal(f.requests.length, 1);
  assert.equal(f.notices.filter(([name]) => name === "error").length, 2);
}

{
  const f = fixture({ workspace: true });
  f.state.showSelectWord();
  assert.equal(f.state.word_import_dialog, true);
  assert.equal(f.clicks(), 0, "Workspace entry presents the explanation before picking");
  f.state.chooseWordFile();
  assert.equal(f.clicks(), 1);
  const file = documentFile("STORY.ODT", 8 * 1024 * 1024);
  // Native FileList is live; resetting the picker must happen after retaining its selected file.
  const input = f.state.$refs.file_input;
  let files = [file];
  Object.defineProperty(input, "files", { get: () => files });
  Object.defineProperty(input, "value", { set() { files = []; } });
  f.state.onSelectWordFile();
  assert.equal(f.state.word_import_file, file);
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.title, "Original title");
  assert.equal(f.state.body, "<p>Original body</p>");
  assert.equal(f.state.word_import_busy, false);
  f.state.closeWordImport();
  assert.equal(f.state.word_import_dialog, false);
  assert.equal(f.state.word_import_file, null);
  assert.equal(f.requests.length, 0, "Cancel discards a local selection without conversion");
}

for (const [file, key] of [[documentFile("story.doc"), "invalid_format"], [documentFile("large.docx", 8 * 1024 * 1024 + 1), "too_large"]]) {
  const f = fixture({ workspace: true });
  f.state.stageWordFile([file]);
  f.state.confirmWordImport();
  assert.equal(f.state.word_import_file, null);
  assert.equal(f.state.word_import_error, `global.article.workspace_word.${key}`);
  assert.equal(f.requests.length, 0);
}

{
  const f = fixture({ workspace: true });
  const file = documentFile();
  f.state.loadWordFile([file]);
  assert.equal(f.requests.length, 0, "External/drag entry also stages instead of bypassing confirmation");
  f.state.confirmWordImport();
  f.state.confirmWordImport();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].url, "/converter/shop/7");
  assert.equal(f.requests[0].file, file);
  assert.equal(f.state.word_import_busy, true);
  assert.equal(f.state.title, "Original title");
  assert.equal(f.requests[0].form.get("file"), file);
  assert.equal(f.requests[0].config.withCredentials, true);
  assert.equal(f.requests[0].config.headers, undefined, "Browser supplies the multipart boundary");
  f.requests[0].config.onUploadProgress({ loaded: 50, total: 100 });
  assert.equal(f.dispatches[0].type, "addUploadingFile"); assert.equal(f.dispatches[0].file_id, file.name); assert.equal(f.dispatches[0].color, "amber");
  f.finish();
  assert.equal(f.state.word_import_busy, false);
  assert.equal(f.state.word_import_error, "global.article.workspace_word.import_failed");
  assert.equal(f.state.word_import_file, file);
  assert.equal(f.state.title, "Original title");
  assert.equal(f.state.body, "<p>Original body</p>");
  f.state.confirmWordImport();
  assert.equal(f.requests.length, 2, "Failed conversions retry the retained local file");
  f.requests[1].success({ title: "Imported", body: "<p>Converted</p>" });
  f.finish();
  f.flush();
  assert.equal(f.state.word_import_dialog, false);
  assert.equal(f.state.word_import_file, null);
  assert.equal(f.state.title, "Imported");
  assert.equal(f.state.body, "<p>Converted</p>");
  assert.equal(f.directions(), 1);
  assert.deepEqual(plain(f.events.filter(([name]) => name === "workspace-busy")), [["workspace-busy", true], ["workspace-busy", false], ["workspace-busy", true], ["workspace-busy", false]]);
  assert.equal(f.dispatches.length, 3, "Progress and every completion preserve the existing upload keeper");
}

for (const props of [{ onlyView: true }, { edit: false }, { wordConverterUrl: "" }]) {
  const f = fixture({ workspace: true, ...props });
  f.state.showSelectWord();
  f.state.chooseWordFile();
  f.state.stageWordFile([documentFile()]);
  f.state.confirmWordImport();
  assert.equal(f.state.word_import_dialog, false);
  assert.equal(f.clicks(), 0);
  assert.equal(f.requests.length, 0);
}
for (const key of ["onlyView", "edit", "wordConverterUrl", "suffixId", "unmount", "workspace"]) {
  const f = fixture({ workspace: true });
  f.state.stageWordFile([documentFile()]);
  f.state.confirmWordImport();
  if (key === "unmount") f.component.beforeUnmount.call(f.state);
  else {
    const previous = f.state[key];
    f.state[key] = key === "onlyView" ? true : key === "edit" || key === "workspace" ? false : "other-scope";
    f.component.watch[key].call(f.state, f.state[key], previous);
  }
  f.requests[0].success({ title: "Stale", body: "<p>Stale</p>" });
  f.finish();
  f.flush();
  assert.equal(f.state.title, "Original title", `${key} invalidates late converted content`);
  assert.equal(f.state.body, "<p>Original body</p>");
  assert.equal(f.state.word_import_busy, false);
  assert.equal(f.notices.length, 0);
  assert.equal(f.events.filter(([name]) => name === "workspace-busy").at(-1)[1], false);
  assert.equal(f.dispatches.length, 1, "Stale completion still clears the original global upload keeper");
}
{
  const f = fixture({ workspace: true });
  f.state.stageWordFile([documentFile()]);
  f.state.confirmWordImport();
  f.requests[0].success({ title: null, body: [] });
  f.finish();
  assert.equal(f.state.title, "Original title");
  assert.equal(f.state.body, "<p>Original body</p>");
  assert.equal(f.state.word_import_error, "global.article.workspace_word.import_failed");
}

{
  const f = fixture({ workspace: true, noMediumInsert: true });
  f.state.refresh = f.component.methods.refresh.bind(f.state);
  f.state.resetToDefault = () => Object.assign(f.state, f.component.data());
  const file = documentFile();
  f.state.stageWordFile([file]);
  f.state.confirmWordImport();
  const request = f.state.word_import_request;
  f.state.refresh();
  assert.equal(f.state.word_import_request, request, "An unchanged editor refresh preserves the accepted import generation");
  assert.equal(f.state.word_import_file, file);
  assert.equal(f.state.word_import_dialog, true);
  assert.equal(f.state.word_import_busy, true);
  assert.deepEqual(f.events.filter(([name]) => name === "workspace-busy"), [["workspace-busy", true]]);
  f.requests[0].success({ title: "Current import", body: "<p>Current body</p>" });
  f.finish();
  f.flush();
  assert.equal(f.state.title, "Current import");
  assert.equal(f.state.word_import_busy, false);
}

{
  const f = fixture({ workspace: true, noMediumInsert: true });
  f.state.refresh = f.component.methods.refresh.bind(f.state);
  f.state.resetToDefault = () => Object.assign(f.state, f.component.data());
  f.state.stageWordFile([documentFile("old.docx")]);
  f.state.confirmWordImport();
  const oldRequest = f.state.word_import_request;
  f.state.onlyView = true;
  f.component.watch.onlyView.call(f.state);
  f.flush();
  f.state.onlyView = false;
  f.component.watch.onlyView.call(f.state);
  f.flush();
  f.state.stageWordFile([documentFile("new.docx")]);
  f.state.confirmWordImport();
  assert.ok(f.state.word_import_request > oldRequest, "Permission revoke/restore cannot reuse an old import generation");
  f.requests[0].success({ title: "Old response", body: "<p>Old body</p>" });
  f.finish(0);
  f.flush();
  assert.equal(f.state.title, "Original title");
  assert.equal(f.state.body, "<p>Original body</p>");
  assert.equal(f.state.word_import_busy, true, "An old completion cannot release the current import's busy guard");
  f.requests[1].success({ title: "New response", body: "<p>New body</p>" });
  f.finish(1);
  f.flush();
  assert.equal(f.state.title, "New response");
  assert.equal(f.state.word_import_busy, false);
}

{
  const f = fixture({ onlyView: true });
  f.state.resetToDefault = () => Object.assign(f.state, f.component.data());
  f.state.word_import_request = 5;
  f.component.methods.refresh.call(f.state);
  assert.equal(f.state.word_import_request, 0, "Legacy editor refresh retains its original full data reset");
}

{
  const f = fixture({ workspace: true }), other = fixture({ MASTER_ID: "other-editor" });
  for (const tag of ["code-editor", "images-compare", "flip-book", "image-overlay-canvas"]) f.addBlock(tag);
  other.addBlock("image-overlay-canvas");
  for (const editor of [f, other]) {
    editor.state.reRenderAll(); editor.flush(); editor.flushTimers();
  }
  assert.equal(f.apps.length, 4, "Every add-on kind retains its independently mounted app");
  assert.equal(f.state._addonApps.length, 4);
  f.state.reRenderAll(); f.flush(); f.flushTimers();
  assert.equal(f.apps.length, 4, "Rerendering connected blocks never mounts duplicate apps");
  assert.ok(f.apps.every((app) => app.unmounts === 0));

  f.apps[0].root.isConnected = false;
  f.component.methods.onEdited.call(f.state);
  assert.equal(f.apps[0].unmounts, 1, "The existing deletion/input flow releases the removed block immediately");
  assert.equal(f.state._addonApps.length, 3);
  for (const app of f.apps) app.root.isConnected = false;
  f.addBlock("image-overlay-canvas");
  f.state.reRenderAll(); f.flush(); f.flushTimers();
  assert.ok(f.apps.slice(0, 4).every((app) => app.unmounts === 1), "Replacing the article body disposes the old apps exactly once");
  assert.equal(f.state._addonApps.length, 1);
  assert.equal(other.apps[0].unmounts, 0, "Cleanup remains confined to its editor instance");

  f.addBlock("flip-book");
  f.state.reRenderAll(); f.flush();
  f.component.beforeUnmount.call(f.state);
  f.flushTimers();
  assert.equal(f.apps.length, 5, "A queued replacement cannot mount after editor teardown");
  assert.equal(f.apps[4].unmounts, 1, "Editor teardown releases the remaining live app");
  assert.equal(f.state._addonApps.length, 0);
  f.state.reRenderAll(); f.flush(); f.flushTimers();
  assert.equal(f.apps.length, 5);
  assert.equal(other.apps[0].unmounts, 0);
  other.component.beforeUnmount.call(other.state);
  assert.equal(other.apps[0].unmounts, 1);

  const pending = fixture();
  pending.addBlock("image-overlay-canvas");
  pending.state.reRenderAll();
  pending.component.beforeUnmount.call(pending.state);
  pending.flush(); pending.flushTimers();
  assert.equal(pending.apps.length, 0, "A queued nextTick cannot mount after editor teardown");
}

console.log("SArticleEditor: SFC/scoped SCSS, legacy import, workspace staging/confirm/retry, size/format/read-only, busy forwarding, refresh, stale completion and add-on app lifecycle checks passed.");

test("empty workspace imports a picked Word file only after confirmation and accepts a document without a heading", () => {
  const f = fixture({ workspace: true, title: "", body: "" });
  f.state.showSelectWord(); f.state.chooseWordFile();
  assert.equal(f.clicks(), 1);
  f.state.onSelectWordFile();
  assert.equal(f.state.word_import_file, null); assert.equal(f.requests.length, 0);
  assert.equal(f.state.title, ""); assert.equal(f.state.body, "");
  const file = documentFile("new-article.docx");
  f.state.$refs.file_input.files = [file]; f.state.onSelectWordFile();
  assert.equal(f.state.word_import_file, file); assert.equal(f.requests.length, 0);
  f.state.confirmWordImport();
  assert.equal(f.requests.length, 1); assert.equal(f.requests[0].url, "/converter/shop/7");
  const body = '<p>Imported <b>Word</b> content &amp; details.</p><ol><li>First step</li></ol>';
  f.requests[0].success({ title: "", body }); f.finish(); f.flush();
  assert.equal(f.state.title, ""); assert.equal(f.state.body, body);
  assert.equal(f.state.word_import_dialog, false); assert.equal(f.state.word_import_busy, false);
  assert.equal(f.events.filter(([name]) => name === "change").length, 1);
});

test("workspace Word drop accepts native file drags with an empty MIME then validates the selected file", () => {
  const f = fixture({ workspace: true, title: "", body: "" });
  let prevented = 0;
  const event = { dataTransfer: { types: ["Files"], items: [{ kind: "file", type: "" }], files: [documentFile("new-article.docx")] }, preventDefault() { prevented++; } };
  f.state.dragover(event);
  assert.equal(f.state.show_drop, true); assert.equal(prevented, 1);
  f.state.drop(event);
  assert.equal(f.state.show_drop, false); assert.equal(f.state.word_import_file.name, "new-article.docx");
  assert.equal(prevented, 2); assert.equal(f.requests.length, 0);
  event.dataTransfer.files = [documentFile("not-word.pdf")]; f.state.drop(event);
  assert.equal(f.state.word_import_file, null); assert.match(f.state.word_import_error, /invalid_format/);
  const text = fixture({ workspace: true });
  text.state.dragover({ ...event, dataTransfer: { types: ["text/plain"], items: [{ kind: "string", type: "text/plain" }] } });
  assert.equal(text.state.show_drop, false); assert.equal(prevented, 3);
  const readonly = fixture({ workspace: true, onlyView: true });
  readonly.state.dragover(event); readonly.state.drop(event);
  assert.equal(readonly.state.show_drop, false); assert.equal(readonly.state.word_import_file, null);
});

async function renderEditor(f, props, slots = {}) {
  const templateExports = {};
  vm.runInNewContext(ts.transpileModule(template.code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, {
    exports: templateExports, require: () => Vue,
  });
  // Render actual template/computed HTML without booting MediumEditor or add-on dialogs.
  const inert = { render() { return null; } };
  const reader = { ...f.component, created: undefined, mounted: undefined, beforeUnmount: undefined,
    components: Object.fromEntries(Object.keys(f.component.components).map((name) => [name, inert])),
    data: () => Object.fromEntries(Object.keys(f.component.data()).map((key) => [key, f.state[key]])),
    methods: { ...f.component.methods, reRenderAll() {} },
    render: templateExports.render };
  const app = Vue.createSSRApp({ render: () => Vue.h(reader, props, slots) });
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.numeralFormat = (value, format) => numeral(value).format(format);
  app.config.globalProperties.getLanguageName = (language) => ({ en: "English", fa: "فارسی" }[language] || language);
  const pass = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
  for (const tag of new Set([...descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g)].map(([, name]) => name))) if (!["v-dialog", "v-btn"].includes(tag)) app.component(tag, pass);
  app.component("v-dialog", { props: ["modelValue"], render() { return this.modelValue ? Vue.h("div", { role: "dialog" }, this.$slots.default?.()) : null; } });
  app.component("v-btn", { props: ["disabled"], render() { return Vue.h("button", { ...this.$attrs, disabled: this.disabled }, this.$slots.default?.()); } });
  return renderToString(app);
}

test("Word selection shows readable file size and rejects empty documents before upload", async () => {
  const dom = new JSDOM("<!doctype html><body></body>"), $ = jquery(dom.window);
  const props = { workspace: true, edit: true, noMediumInsert: true, title: "", body: "" };
  const f = fixture(props, { window: dom.window, document: dom.window.document, $ });
  const file = new dom.window.File([new Uint8Array(8271)], "selected.docx");
  f.state.stageWordFile([file]);
  dom.window.document.body.innerHTML = await renderEditor(f, props);
  const metadata = dom.window.document.querySelector(".s-article-word-import__filename");
  assert.match(metadata.textContent, /selected\.docx/); assert.match(metadata.textContent, /8\.3\s?KB/);
  assert.equal(f.requests.length, 0);
  f.state.stageWordFile([new dom.window.File([], "empty.docx")]); f.state.confirmWordImport();
  assert.equal(f.state.word_import_file, null); assert.match(f.state.word_import_error, /invalid_format/);
  assert.equal(f.requests.length, 0); assert.equal(f.state.title, ""); assert.equal(f.state.body, "");
  dom.window.document.body.innerHTML = await renderEditor(f, props);
  assert.equal(dom.window.document.querySelector(".s-article-word-import__filename"), null);
  assert.match(dom.window.document.querySelector('[role="alert"]').textContent, /invalid_format/);
  const confirm = [...dom.window.document.querySelectorAll("button")].find((button) => button.textContent.includes("global.article.workspace_word.confirm"));
  assert.equal(confirm.disabled, true);
});

test("Word import keeps a bounded file/converter error through completion, renders it as text, and safely retries", async () => {
  const fallback = "global.article.workspace_word.import_failed";
  for (const [data, expected] of [
    [{ errors: { file: ["<b>Choose a valid Word file.</b>", "Unused second error"] }, error_msg: "Lower priority" }, "<b>Choose a valid Word file.</b>"],
    [{ errors: { file: "The file failed to upload." } }, "The file failed to upload."],
    [{ error_msg: "  Could not convert\nthis document.  " }, "Could not convert this document."],
    [{ errors: { file: ["x".repeat(300)] } }, "x".repeat(240)],
    [{ errors: { file: [{}] }, error_msg: {} , message: "Private exception", trace: ["Private trace"] }, fallback],
    [undefined, fallback],
  ]) {
    const dom = new JSDOM("<!doctype html><body></body>"), $ = jquery(dom.window);
    const props = { workspace: true, edit: true, noMediumInsert: true, title: "Original", body: "<p>Keep original body.</p>" };
    const f = fixture(props, { window: dom.window, document: dom.window.document, $ });
    const file = documentFile(); f.state.stageWordFile([file]); f.state.confirmWordImport();
    f.requests[0].failure(data); f.finish(); f.flush();
    assert.equal(f.state.word_import_error, expected); assert.equal(f.state.word_import_busy, false);
    assert.equal(f.state.title, props.title); assert.equal(f.state.body, props.body); assert.equal(f.state.word_import_file, file);
    dom.window.document.body.innerHTML = await renderEditor(f, props);
    const alert = dom.window.document.querySelector('[role="alert"]');
    assert.equal(alert.textContent, expected); assert.equal(alert.children.length, 0);
    assert.doesNotMatch(alert.textContent, /Private exception|Private trace|Unused second error|Lower priority/);
    f.state.confirmWordImport(); assert.equal(f.state.word_import_error, ""); assert.equal(f.state.word_import_busy, true);
    f.requests[1].success({ title: "Retried", body: "<p>Retry succeeded.</p>" }); f.finish(1); f.flush();
    assert.equal(f.state.title, "Retried"); assert.equal(f.state.word_import_error, ""); assert.equal(f.state.word_import_busy, false);
  }
  const stale = fixture({ workspace: true }); stale.state.stageWordFile([documentFile()]); stale.state.confirmWordImport();
  stale.state.onlyView = true; stale.component.watch.onlyView.call(stale.state);
  stale.requests[0].failure({ errors: { file: ["Old resource error"] } }); stale.finish();
  assert.equal(stale.state.word_import_error, "");
});

test("confirmed workspace import uses real Axios/native multipart and completes success or failure without touching shared converters", async () => {
  for (const result of ["success", "application-error", "http-error", "http-string-error", "http-auth-error", "synchronous-error"]) {
    const dom = new JSDOM("<!doctype html><body></body>"), $ = jquery(dom.window);
    const f = fixture({ workspace: true }, { window: dom.window, document: dom.window.document, $, FormData: dom.window.FormData });
    const file = new dom.window.File([new Uint8Array(8271)], "native.docx");
    const requests = [];
    const httpPayload = result === "http-error" ? { errors: { file: ["Choose another document."] } } : result === "http-auth-error" ? "<!doctype html><html><body>Two Factor Authentication Private fixture response.</body></html>" : "Never expose this raw response.";
    f.window.axios = axios.create({ adapter: async (config) => {
      requests.push(config);
      assert.ok(config.data instanceof dom.window.FormData);
      assert.deepEqual([...config.data.keys()], ["file"]); assert.equal(config.data.get("file").size, 8271);
      assert.equal(config.withCredentials, true);
      config.onUploadProgress({ loaded: 50, total: 100 });
      if (result.startsWith("http")) throw { response: { status: 422, data: httpPayload } };
      return { status: 200, statusText: "OK", headers: {}, config,
        data: result === "application-error" ? { error: true, error_msg: "Could not convert this document." } : { title: "Imported", body: "<p>Native multipart result.</p>" } };
    } });
    if (result === "synchronous-error") f.window.axios.post = () => { throw new Error("Never display this exception."); };
    f.state.stageWordFile([file]); f.state.confirmWordImport();
    await new Promise((resolve) => setImmediate(resolve)); f.flush();
    assert.equal(f.state.word_import_busy, false);
    assert.equal(f.dispatches.filter((action) => action.type === "removeUploadingFile").length, 1);
    assert.deepEqual(plain(f.warnings), result.startsWith("http") ? [["Word import failed", JSON.stringify({ status: 422 })]] : []);
    assert.equal(f.requests.length, 0, "The legacy converter is not called by the workspace branch");
    if (result === "success") { assert.equal(f.state.body, "<p>Native multipart result.</p>"); assert.equal(f.state.word_import_error, ""); }
    else {
      assert.equal(f.state.body, "<p>Original body</p>"); assert.equal(f.state.word_import_file, file);
      assert.equal(f.state.word_import_error, result === "http-error" ? "Choose another document." : result === "application-error" ? "Could not convert this document." : "global.article.workspace_word.import_failed");
    }
  }
});

test("render and body serialization unwrap style spans while preserving rich children in legacy and workspace articles", async () => {
  const body = '<span>INVALID_ROOT_SENTINEL<b>Discard this invalid root.</b></span>' +
    '<p><span style="font-size:18px">Intro <b>Bold &amp; clear</b> and <i>italic</i>; <a href="https://example.test/guide">read the guide</a>.</span></p>' +
    '<blockquote><span style="font-size:20px">Quote <b>bold</b> and <i>italic</i>.</span></blockquote>' +
    '<ol><li><p><span style="font-size:15px">Step <b>one</b> with <i>emphasis</i>.</span></p></li><li><p>Step two.</p></li></ol>';
  for (const workspace of [false, true]) {
    const dom = new JSDOM("<!doctype html><body></body>"), $ = jquery(dom.window);
    const props = { workspace, edit: true, noMediumInsert: true, title: "Word formatting", body };
    const f = fixture(props, { window: dom.window, document: dom.window.document, $ });
    dom.window.document.body.innerHTML = await renderEditor(f, props);
    const editable = dom.window.document.querySelector(".u-article-body-edit");
    function assertRichContent(element) {
      assert.equal(element.querySelector("p > b").textContent, "Bold & clear");
      assert.equal(element.querySelector("p > i").textContent, "italic");
      assert.equal(element.querySelector("p > a").getAttribute("href"), "https://example.test/guide");
      assert.equal(element.querySelector("blockquote > b").textContent, "bold");
      assert.equal(element.querySelector("blockquote > i").textContent, "italic");
      assert.deepEqual([...element.querySelectorAll("ol > li")].map((item) => item.textContent), ["Step one with emphasis.", "Step two."]);
      assert.equal(element.querySelector("ol > li p > b").textContent, "one");
      assert.equal(element.querySelectorAll("p > span, blockquote > span").length, 0);
      assert.doesNotMatch(element.innerHTML, /INVALID_ROOT_SENTINEL|&lt;b&gt;|font-size/);
    }
    assertRichContent(editable);
    assertRichContent(dom.window.document.querySelector(".u-article-body-view"));
    f.state.EDITABLE_BODY_ID = f.component.computed.EDITABLE_BODY_ID.call(f.state);
    let saved = dom.window.document.createElement("div"); saved.innerHTML = f.state.purifyBody(); assertRichContent(saved);
    // Pasted/imported wrappers may reach the editable DOM after the reader was rendered.
    editable.innerHTML = body;
    saved = dom.window.document.createElement("div"); saved.innerHTML = f.state.purifyBody(); assertRichContent(saved);
    assert.equal(f.state.body, body); assert.deepEqual(f.events, []);
  }
});

test("real reader template puts the FAQ end slot after article body and excludes it from saved body HTML", async () => {
  const dom = new JSDOM("<!doctype html><body></body>"), $ = jquery(dom.window);
  const props = { workspace: true, edit: false, onlyView: false, noMediumInsert: true,
    suffixId: "-faq-reader", title: "Saved title", body: "<p>ARTICLE_BODY_SENTINEL</p>" };
  const f = fixture(props, { window: dom.window, document: dom.window.document, $ });
  let slotEdit;
  dom.window.document.body.innerHTML = await renderEditor(f, props, {
    end: ({ edit }) => { slotEdit = edit; return Vue.h("section", { "data-article-faqs": "true" }, "FAQ_END_SENTINEL"); },
  });
  const body = dom.window.document.querySelector(".review-style .u-article-body-view");
  const faq = dom.window.document.querySelector("[data-article-faqs]");
  assert.equal(body.innerHTML, props.body);
  assert.equal(slotEdit, false);
  assert.equal(faq.textContent, "FAQ_END_SENTINEL");
  assert.ok(body.compareDocumentPosition(faq) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(dom.window.document.querySelector(".s--article-editor-container").contains(faq), false);
  f.state.EDITABLE_BODY_ID = f.component.computed.EDITABLE_BODY_ID.call(f.state);
  assert.equal(f.state.purifyBody(), props.body);
  assert.equal(f.requests.length, 0);
  assert.deepEqual(f.events, []);
});

test("product word count reads inert article text without counting serialized blocks or controls", () => {
  const dom = new JSDOM("<!doctype html><body><p>Outside the editor</p></body>"), $ = jquery(dom.window);
  const body = '<p>Hello&nbsp;world.</p><h2>Next heading</h2><p>سلام به شما</p><code-editor>serialized payload ignored</code-editor><div class="medium-insert-buttons">Image menu</div><script>ignored words</script>';
  const f = fixture({ workspace: true, productWorkspace: true, body }, { window: dom.window, document: dom.window.document, $ });
  assert.equal(f.component.computed.productWordCount.call(f.state), 7);
  assert.equal(f.state.body, body);
  assert.equal(dom.window.document.body.textContent, "Outside the editor");
  assert.equal(f.requests.length, 0);
  f.state.body = '<p><img src="/image-in-body.png"></p>';
  assert.equal(f.component.computed.productWordCount.call(f.state), 0);
  f.state.productWorkspace = false;
  assert.equal(f.component.computed.productWordCount.call(f.state), 0);
});

test("native product editing updates the word count without publishing or serializing the body model", () => {
  const dom = new JSDOM('<!doctype html><body><div contenteditable="true"><p>Saved text</p></div></body>'), $ = jquery(dom.window);
  const f = fixture({ workspace: true, productWorkspace: true, body: "<p>Saved text</p>" }, { window: dom.window, document: dom.window.document, $ });
  const body = dom.window.document.querySelector("[contenteditable]");
  f.state.$refs.editable_body = body;
  const count = () => f.component.computed.productWordCount.call(f.state);
  assert.equal(count(), 2);
  body.innerHTML = '<p>New words while typing</p><div class="code-editor">Theme copy edit controls</div><div class="image-overlay-canvas">Canvas edit menu</div>';
  f.component.methods.onEdited.call(f.state);
  assert.equal(count(), 4);
  assert.equal(f.state.body, "<p>Saved text</p>");
  assert.equal(f.events.filter(([name]) => name === "update:body").length, 0);
  assert.equal(f.requests.length, 0);

  body.innerHTML = "<p><br></p>";
  f.component.methods.onEdited.call(f.state);
  assert.equal(count(), 0, "Deleting the live content must not fall back to the saved body");
  f.state.edit = false;
  assert.equal(count(), 2, "The reader uses the parent-owned body rather than hidden editable DOM");

  const empty = fixture({ workspace: true, productWorkspace: true, body: "" }, { window: dom.window, document: dom.window.document, $ });
  empty.state.$refs.editable_body = body;
  assert.equal(empty.component.computed.productWordCount.call(empty.state), 0);
  body.innerHTML = "<p>First new words</p>";
  empty.component.methods.onEdited.call(empty.state);
  assert.equal(empty.component.computed.productWordCount.call(empty.state), 3);
  assert.equal(empty.state.body, "");
  assert.equal(empty.requests.length, 0);
});

test("leaving a product description closes unconfirmed Word staging and ignores a late conversion", () => {
  const f = fixture({ workspace: true, productWorkspace: true });
  f.state.stageWordFile([documentFile()]);
  assert.equal(f.state.word_import_dialog, true);
  assert.ok(f.events.some(([name, value]) => name === "workspace-pending" && value === true));
  f.state.active = false;
  f.component.watch.active.call(f.state, false);
  assert.equal(f.state.word_import_dialog, false);
  assert.equal(f.state.word_import_file, null);
  assert.equal(f.state.body, "<p>Original body</p>");
  assert.ok(f.events.some(([name, value]) => name === "workspace-pending" && value === false));
  f.state.showSelectWord(); f.state.stageWordFile([documentFile()]); f.state.confirmWordImport();
  assert.equal(f.requests.length, 0);

  f.state.active = true;
  f.state.stageWordFile([documentFile()]); f.state.confirmWordImport();
  assert.equal(f.requests.length, 1);
  f.state.active = false;
  f.component.watch.active.call(f.state, false);
  f.requests[0].success({ title: "Late title", body: "<p>Late conversion</p>" }); f.finish(); f.flush();
  assert.equal(f.state.body, "<p>Original body</p>");
  assert.equal(f.state.title, "Original title");
  assert.equal(f.state.word_import_busy, false);
});

test("product Insert content reuses the native palette and preserves existing rich blocks", () => {
  const dom = new JSDOM('<!doctype html><body><div id="body" contenteditable="true"><p>Story text</p><code-editor>original serialized block</code-editor><div class="medium-insert-buttons"><button class="medium-insert-buttons-show">+</button><ul class="medium-insert-buttons-addons"><li><button type="button" data-addon="images">Image</button></li><li><button type="button" data-addon="embeds">Embed</button></li></ul></div></div></body>');
  const $ = jquery(dom.window), body = dom.window.document.querySelector("#body"), originalBlock = body.querySelector("code-editor");
  const f = fixture({ workspace: true, productWorkspace: true }, { window: dom.window, document: dom.window.document, $ });
  f.state.$refs.editable_body = body;
  const calls = [];
  const insert = {
    addButtons() {}, moveCaret() {}, positionButtons() {}, showButtons() {},
    hideButtons() { calls.push("hide-buttons"); },
    hideAddons() { $(body).find(".medium-insert-buttons-addons").hide(); },
    toggleAddons() { $(body).find(".medium-insert-buttons-addons").show(); },
  };
  $(body).data("plugin_mediumInsert", insert);
  f.state.showProductInsert();
  assert.equal(body.querySelector("code-editor"), originalBlock);
  assert.equal(originalBlock.textContent, "original serialized block");
  assert.equal(body.querySelectorAll("p").length, 2);
  assert.equal(body.querySelectorAll(".medium-insert-active").length, 1);
  assert.equal(dom.window.document.activeElement.dataset.addon, "images");
  assert.notEqual($(body).find(".medium-insert-buttons-addons").css("display"), "none");
  f.state.showProductInsert();
  assert.equal(body.querySelectorAll("p").length, 2, "Repeated opening reuses the trailing empty paragraph");
  for (const key of ["active", "edit", "productWorkspace"]) {
    f.state[key] = false; f.state.showProductInsert(); f.state[key] = true;
  }
  for (const key of ["onlyView", "noMediumInsert", "word_import_busy"]) {
    f.state[key] = true; f.state.showProductInsert(); f.state[key] = false;
  }
  assert.equal(body.querySelectorAll("p").length, 2);
  f.state.editor_body = { getExtensionByName: () => ({ hideToolbar() { calls.push("hide-toolbar"); } }) };
  f.state.hideProductTools();
  assert.deepEqual(calls, ["hide-buttons", "hide-toolbar"]);
  assert.equal($(body).find(".medium-insert-buttons-addons").css("display"), "none");
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.body, "<p>Original body</p>");
});

test("product editor renders its title label and live article metadata without changing legacy markup", async () => {
  const dom = new JSDOM("<!doctype html><body></body>"), $ = jquery(dom.window);
  const props = { workspace: true, productWorkspace: true, edit: true, noMediumInsert: true, language: "fa", title: "عنوان", body: "<p>سلام به شما</p>" };
  const f = fixture(props, { window: dom.window, document: dom.window.document, $ });
  dom.window.document.body.innerHTML = await renderEditor(f, props);
  const editor = dom.window.document.querySelector(".s-article-editor--product-workspace");
  assert.ok(editor);
  const label = editor.querySelector(".s-article-editor__title-label");
  assert.match(label.textContent, /description_modern.title_label/);
  assert.equal(editor.querySelector(".s-article-editor__title").getAttribute("aria-labelledby"), label.id);
  assert.equal(editor.querySelector(".u-article-body-edit").getAttribute("aria-label"), "add_product.description_modern.body_label");
  assert.ok(editor.querySelector(".s-article-editor__product-meta"));
  assert.equal(f.component.computed.productWordCount.call(f.state), 3);
  dom.window.document.body.innerHTML = await renderEditor(f, { ...props, productWorkspace: false });
  assert.equal(dom.window.document.querySelector(".s-article-editor__title-label"), null);
  assert.equal(dom.window.document.querySelector(".s-article-editor__product-meta"), null);
  assert.equal(dom.window.document.querySelector(".u-article-body-edit").hasAttribute("aria-label"), false);
});

test("empty Product descriptions use their selected language direction while written content and legacy editors keep detection", () => {
  const f = fixture({ workspace: true, productWorkspace: true });
  f.state.getLanguageObject = code => ({ dir: ['fa', 'ar'].includes(code) ? 'rtl' : 'ltr' });
  for (const language of ['fa', 'ar', 'en']) {
    f.state.language = language;
    for (const innerText of ['', ' \n\t ', '\u00a0']) {
      const element = { innerText, style: {} }, linked = { style: {} };
      f.state.applyDirection(element, '', linked);
      const direction = language === 'en' ? 'ltr' : 'rtl';
      assert.equal(element.style.direction, direction, `${language}: ${JSON.stringify(innerText)}`);
      assert.equal(element.style.textAlign, direction === 'rtl' ? 'right' : 'left');
      assert.equal(linked.style.direction, direction);
    }
  }
  for (const [language, innerText, expected] of [['fa', 'English description', 'ltr'], ['en', 'توضیح محصول', 'rtl']]) {
    f.state.language = language;
    const element = { innerText, style: {} };
    f.state.applyDirection(element);
    assert.equal(element.style.direction, expected);
  }
  f.state.productWorkspace = false; f.state.language = 'fa';
  const legacy = { innerText: '', style: {} };
  f.state.applyDirection(legacy);
  assert.equal(legacy.style.direction, 'ltr');
  f.state.productWorkspace = true; delete f.state.getLanguageObject;
  const withoutLanguageHelper = { innerText: '', style: {} };
  f.state.applyDirection(withoutLanguageHelper);
  assert.equal(withoutLanguageHelper.style.direction, 'ltr');
});

test("changing Product description language refreshes direction without changing the draft or legacy editor", () => {
  const f = fixture({ workspace: true, productWorkspace: true, language: 'en' });
  f.state.language = 'fa'; f.component.watch.language.call(f.state);
  assert.equal(f.directions(), 1);
  assert.equal(f.state.body, '<p>Original body</p>');
  assert.equal(f.state.title, 'Original title');
  assert.equal(f.events.length, 0);
  f.state.productWorkspace = false;
  f.state.language = 'ar'; f.component.watch.language.call(f.state);
  assert.equal(f.directions(), 1);
});
