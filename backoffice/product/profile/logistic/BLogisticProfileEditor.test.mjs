import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const filename = fileURLToPath(new URL("./BLogisticProfileEditor.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "logistic-profile-editor-test" });
const template = compileTemplate({ source: descriptor.template.content, filename, id: "logistic-profile-editor-test",
  compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const node = (type, text = "") => ({ type, text, props: {}, children: [], parent: null, querySelector() { return null; } });
const all = root => [root, ...root.children.flatMap(all)];
const renderer = Vue.createRenderer({
  createElement: type => node(type), createText: text => node("text", text), createComment: text => node("comment", text),
  insert(child, parent, anchor = null) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    parent.children.splice(anchor ? parent.children.indexOf(anchor) : parent.children.length, 0, child); child.parent = parent;
  },
  remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
  setText(entry, text) { entry.text = text; }, setElementText(entry, text) { entry.text = text; entry.children = []; },
  patchProp(entry, key, before, after) { entry.props[key] = after; }, parentNode: entry => entry.parent,
  nextSibling: entry => entry.parent?.children[entry.parent.children.indexOf(entry) + 1] || null,
});
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const articles = () => [
  { id: 11, lang: "en", title: "Original English", body: "<p>Shared English</p>", metadata: { value: "saved" } },
  { id: 12, lang: "fa", title: "فارسی", body: "<p>محتوای مشترک</p>" },
];

async function fixture(t, options = {}) {
  const calls = { requests: [], notices: [], confirms: [], states: [], editors: [], observers: [] };
  const leaf = (name, gated = false) => Vue.defineComponent({ name, props: { modelValue: [Boolean, String] },
    setup(props, { attrs, slots }) { return () => gated && !props.modelValue ? null : Vue.h(name, attrs,
      [slots.activator?.({ props: {} }), slots.default?.(), slots.actions?.(), slots["append-actions"]?.()]); },
  });
  const Editor = Vue.defineComponent({ name: "SArticleEditor", inheritAttrs: false,
    props: { title: String, body: String, edit: Boolean, onlyView: Boolean, workspace: Boolean, uploadUrl: String },
    setup(props, { attrs, emit, expose }) {
      const record = { props, emit, title: "Clean title", body: "<p>Clean rich content</p>", purifications: [], fields: {} };
      calls.editors.push(record);
      expose({ $refs: record.fields, purifyTitle() { record.purifications.push("title"); return record.title; },
        purifyBody() { record.purifications.push("body"); return record.body; } });
      return () => Vue.h("native-article-editor", { ...attrs, ...props });
    },
  });
  const notifications = {
    showSuccessAlert: (...args) => calls.notices.push(["success", ...args]),
    showErrorAlert: (...args) => calls.notices.push(["error", ...args]),
    showLaravelError: error => calls.notices.push(["failure", error]),
    openDangerAlert: (...args) => calls.confirms.push(args.at(-1)),
  };
  const endpoints = new Proxy({}, { get: (_, key) => (...args) => `/${String(key)}/${args.join("/")}` });
  const axios = Object.fromEntries(["post", "delete"].map(method => [method, (url, payload) => {
    let resolve, reject;
    const result = new Promise((yes, no) => { resolve = yes; reject = no; });
    calls.requests.push({ method, url, payload, resolve, reject }); return result;
  }]));
  class Observer {
    constructor(callback) { this.callback = callback; calls.observers.push(this); }
    observe(element) { this.element = element; } disconnect() { this.disconnected = true; }
  }
  const exports = {};
  const require = name => {
    if (name === "vue") return Vue;
    if (name.includes("ShopOptionsHelper")) return { ShopOptionsHelper: { GetLanguages: shop => shop.languages } };
    if (name.includes("NotificationService")) return { default: notifications };
    return { default: name.includes("SArticleEditor.vue") ? Editor : leaf(name.includes("BAiAutoTranslate") ? "BAiAutoTranslate" : "native-ui", name.includes("BAiAutoTranslate")) };
  };
  const evaluate = source => new Function("exports", "require", "window", "axios", "MutationObserver", transpile(source))(
    exports, require, { API: endpoints, ARTICLE_API: endpoints }, axios, Observer);
  evaluate(script.content); const Form = exports.default;
  evaluate(template.code); Form.render = exports.render;
  const state = Vue.reactive({ shop: { id: 7, languages: ["en", "fa", "fr"] }, profile: { id: 31 }, articles: articles(), modern: true, editable: true, ...options });
  const holder = node("root"); let form;
  const app = renderer.createApp({ setup: () => () => Vue.h(Form, { ...state,
    ref: value => { form = value; }, "onDraft-state": value => calls.states.push(value),
  }) });
  for (const name of ["VBtn", "VIcon", "VList", "VListItem", "VListItemTitle", "VTooltip", "VRow", "VSpacer", "VExpandTransition", "VListSubheader", "ULoadingProgress"])
    app.component(name, leaf(name));
  app.component("VMenu", leaf("VMenu", true));
  app.config.warnHandler = () => {};
  Object.assign(app.config.globalProperties, {
    window: { API: endpoints, ARTICLE_API: endpoints },
    $t: key => key, getLanguageName: code => ({ en: "English", fa: "فارسی", fr: "Français" })[code] || code,
    AddOrUpdateItemByID(array, item) { const index = array.findIndex(value => value.id === item.id); if (index < 0) array.push(item); else array.splice(index, 1, item); },
    DeleteItemByID(array, id) { const index = array.findIndex(value => value.id === id); if (index >= 0) array.splice(index, 1); },
  });
  app.mount(holder); await settle();
  t.after(() => app.unmount());
  return { form, state, calls, holder, app, nodes: name => all(holder).filter(entry => String(entry.props.class || "").split(" ").includes(name)),
    currentEditor: () => calls.editors.at(-1) };
}

test("modern starts in one readable widget with native editor and detached shared content", async t => {
  const f = await fixture(t);
  assert.equal(f.nodes("b-logistic-profile-editor__widget").length, 1);
  assert.equal(f.nodes("b-logistic-profile-editor__language").length, 2);
  assert.equal(f.currentEditor().props.onlyView, true);
  assert.equal(f.currentEditor().props.edit, false);
  assert.equal(f.currentEditor().props.uploadUrl, "/UPLOAD_ARTICLE_BLOG_IMAGE/7");
  assert.notEqual(f.form.article, f.state.articles[0]);
  assert.notEqual(f.form.article.metadata, f.state.articles[0].metadata);
  assert.deepEqual(f.calls.states.at(-1), { dirty: false, busy: false });
});

test("Edit blocks parent synchronously and Cancel restores local content without undoing earlier saved shared content", async t => {
  const f = await fixture(t);
  f.form.startEdit();
  assert.deepEqual(f.calls.states.at(-1), { dirty: true, busy: false });
  await settle();
  assert.equal(f.currentEditor().props.edit, true);
  f.form.article.title = "Unsaved"; f.form.article.metadata.value = "unsaved";
  f.currentEditor().emit("change");
  f.form.selectArticle(f.state.articles[1]);
  assert.equal(f.form.article.id, 11);
  f.form.cancelEdit(); await settle();
  assert.equal(f.form.article.title, "Original English");
  assert.equal(f.state.articles[0].metadata.value, "saved");
  assert.deepEqual(f.calls.states.at(-1), { dirty: false, busy: false });
  f.form.startEdit(); await settle(); f.currentEditor().emit("change"); f.form.saveArticle();
  assert.equal(f.calls.requests.length, 1);
  assert.deepEqual(f.calls.states.at(-1), { dirty: true, busy: true });
  assert.deepEqual(f.calls.requests[0].payload, { article_id: 11, language: "en", title: "Clean title", body: "<p>Clean rich content</p>" });
  assert.deepEqual(f.currentEditor().purifications, ["title", "body"]);
  f.form.saveArticle(); f.form.cancelEdit(); assert.equal(f.calls.requests.length, 1);
  f.calls.requests[0].resolve({ data: { article: { ...articles()[0], title: "Saved shared" } } }); await settle();
  assert.equal(f.form.editing, false); assert.equal(f.state.articles[0].title, "Saved shared");
  f.form.startEdit(); await settle(); f.form.article.title = "Discard later edit"; f.form.cancelEdit();
  assert.equal(f.form.article.title, "Saved shared"); assert.equal(f.state.articles[0].title, "Saved shared");
});

test("failed content saves retain the editable draft and can retry", async t => {
  const f = await fixture(t);
  f.form.startEdit(); await settle(); f.currentEditor().emit("change"); f.form.article.title = "Keep draft";
  f.form.saveArticle(); f.calls.requests[0].resolve({ data: { error: true, error_msg: "Rejected" } }); await settle();
  assert.equal(f.form.article.title, "Keep draft"); assert.equal(f.form.editing, true);
  assert.equal(f.form.busy_save, false); assert.equal(f.form.changed, true);
  f.form.saveArticle(); f.calls.requests[1].reject(new Error("offline")); await settle();
  assert.equal(f.form.article.title, "Keep draft"); assert.deepEqual(f.calls.states.at(-1), { dirty: true, busy: false });
});

test("new-language Cancel does not mutate saved articles; duplicate languages cannot be saved", async t => {
  const f = await fixture(t);
  f.form.addNew(); await settle();
  assert.equal(f.form.article.lang, "fr"); assert.equal(f.form.editing, true);
  assert.equal(f.state.articles.length, 2);
  f.currentEditor().emit("change"); assert.equal(f.form.changed, false);
  const fields = f.form.$refs.editor.$refs;
  fields.editable_title = { textContent: "" };
  fields.editable_body = { textContent: "", querySelector: () => null };
  f.currentEditor().emit("change"); assert.equal(f.form.changed, false);
  fields.editable_title.textContent = "Ready title";
  f.currentEditor().emit("change"); assert.equal(f.form.changed, true);
  fields.editable_title.textContent = "";
  f.currentEditor().emit("change"); assert.equal(f.form.changed, true);
  f.currentEditor().emit("change"); f.form.article.lang = "fa"; f.form.saveArticle();
  assert.equal(f.calls.requests.length, 0);
  f.form.cancelEdit(); assert.equal(f.form.article.id, 11); assert.equal(f.state.articles.length, 2);
});

test("native conversion and inline media prevent save while Cancel can discard pending media", async t => {
  const f = await fixture(t);
  f.form.startEdit(); await settle(); f.currentEditor().emit("change");
  f.currentEditor().emit("workspace-busy", true);
  f.form.saveArticle(); assert.equal(f.calls.requests.length, 0); assert.equal(f.calls.states.at(-1).busy, true);
  f.currentEditor().emit("workspace-busy", false);
  const observer = f.calls.observers.at(-1);
  observer.element.querySelector = () => ({}); observer.callback();
  assert.equal(f.form.media_busy, true); f.form.saveArticle(); assert.equal(f.calls.requests.length, 0);
  f.form.cancelEdit(); await settle();
  assert.equal(f.form.editing, false); assert.equal(f.form.article.title, "Original English");
  assert.deepEqual(f.calls.states.at(-1), { dirty: false, busy: false });
});

test("translation keeps its native endpoint and saved result, denying duplicate or unavailable targets", async t => {
  const f = await fixture(t);
  f.form.requestAutoTranslate("fa"); f.form.requestAutoTranslate("de"); assert.equal(f.calls.requests.length, 0);
  f.form.showTranslate("fr"); f.form.selectArticle(f.state.articles[1]); f.form.requestAutoTranslate("fr");
  assert.equal(f.calls.requests.length, 0);
  f.form.selectArticle(f.state.articles[0]);
  f.form.showTranslate("fr"); assert.equal(f.form.translate_dialog, true);
  f.form.requestAutoTranslate("fr"); f.form.requestAutoTranslate("fr"); assert.equal(f.calls.requests.length, 1);
  assert.equal(f.calls.requests[0].url, "/POST_SHOP_LOGISTIC_PROFILE_AUTO_TRANSLATE/7/31/11");
  assert.deepEqual(f.calls.requests[0].payload, { language: "fr" });
  f.calls.requests[0].resolve({ data: { article: { id: 13, lang: "fr", title: "French", body: "<p>Français</p>" } } }); await settle();
  assert.equal(f.form.article.id, 13); assert.equal(f.state.articles.length, 3);
  assert.equal(f.form.busy_translate, false); assert.equal(f.form.translate_dialog, false);
  assert.deepEqual(f.calls.states.at(-1), { dirty: false, busy: false });
});

test("deletion requires current confirmation and protects the final language", async t => {
  const f = await fixture(t);
  f.form.deleteArticle(); assert.equal(f.calls.confirms.length, 1);
  f.form.selectArticle(f.state.articles[1]); f.calls.confirms[0](); assert.equal(f.calls.requests.length, 0);
  f.form.deleteArticle(); f.calls.confirms[1]();
  assert.equal(f.calls.requests[0].url, "/DELETE_SHOP_LOGISTIC_PROFILE_ARTICLE/7/31/12");
  f.calls.requests[0].resolve({ data: { id: 12 } }); await settle();
  assert.equal(f.state.articles.length, 1); assert.equal(f.form.article.id, 11);
  assert.equal(f.form.busy_delete, false);
  f.form.deleteArticle(); f.form.deleteArticleNow(); assert.equal(f.calls.requests.length, 1);
});

test("profile switch and unmount discard stale successes and failures", async t => {
  const f = await fixture(t);
  f.form.startEdit(); await settle(); f.currentEditor().emit("change"); f.form.saveArticle();
  f.state.profile = { id: 99 }; f.state.articles = [{ id: 44, lang: "en", title: "New profile", body: "New" }]; await settle();
  f.calls.requests[0].resolve({ data: { article: { ...articles()[0], title: "Stale result" } } }); await settle();
  assert.equal(f.form.article.id, 44); assert.equal(f.state.articles.length, 1); assert.equal(f.calls.notices.length, 0);
  f.form.startEdit(); await settle(); f.currentEditor().emit("change"); f.form.saveArticle(); f.app.unmount();
  f.calls.requests[1].reject(new Error("late offline")); await settle(); assert.equal(f.calls.notices.length, 0);
});

test("read-only vendors retain language reading and deny every write method", async t => {
  const f = await fixture(t, { editable: false });
  assert.equal(f.nodes("b-logistic-profile-editor__add-language").length, 0);
  assert.equal(f.nodes("b-logistic-profile-editor__more").length, 0);
  assert.equal(f.nodes("b-logistic-profile-editor__edit").length, 0);
  f.form.selectArticle(f.state.articles[1]); assert.equal(f.form.article.lang, "fa");
  f.form.startEdit(); f.form.addNew(); f.form.saveArticle(); f.form.showTranslate("fr"); f.form.requestAutoTranslate("fr"); f.form.deleteArticle(); f.form.deleteArticleNow();
  assert.equal(f.calls.requests.length, 0); assert.equal(f.calls.confirms.length, 0); assert.equal(f.form.editing, false);
  assert.equal(f.currentEditor().props.onlyView, true);
});

test("legacy caller keeps immediate native editing and original language/save behavior", async t => {
  const f = await fixture(t, { modern: false });
  assert.equal(f.form.article, f.state.articles[0]);
  assert.equal(f.currentEditor().props.edit, true);
  assert.equal(f.calls.states.length, 0);
  f.form.addNew(); await settle(); assert.equal(f.form.article.lang, "fr");
  f.form.saveArticle(); assert.equal(f.calls.requests[0].payload.language, "fr");
  f.calls.requests[0].resolve({ data: { article: { id: 13, lang: "fr", title: "Legacy", body: "Rich" } } }); await settle();
  assert.equal(f.form.article.id, 13); assert.equal(f.form.busy_save, false);
});

test("feature-scoped modern SCSS compiles", async () => {
  const result = await compileStyleAsync({ source: descriptor.styles[0].content, filename,
    id: "data-v-logistic-profile-editor-test", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(result.errors, []);
});
