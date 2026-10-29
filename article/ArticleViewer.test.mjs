import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { JSDOM } from "jsdom";
import ts from "typescript";

// Compile the real component and use deferred synthetic HTTP responses only.
const filename = fileURLToPath(new URL("./ArticleViewer.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "article-viewer-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "article-viewer-test", compilerOptions: { bindingMetadata: compiled.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles.filter((style) => style.scoped)) assert.deepEqual(compileStyle({
  source: style.content, filename, id: "article-viewer-test", scoped: true, preprocessLang: style.lang,
}).errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const script = transpile(descriptor.script.content), templateExports = {};
vm.runInNewContext(transpile(template.code), { exports: templateExports, require: (path) => path === "vue" ? Vue : { default: path } });
const types = Object.fromEntries([["Blog", "shop-blog"], ["Product", "product"],
  ["SelldoneBlog", "blog"], ["SelldoneHelp", "help"]].map(([key, code]) => [key, { code }]));
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const passthrough = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
const pack = (id = 12, extra = {}) => ({
  article: { id, parent_id: id + 100, title: `Article ${id}`, body: "<p>Saved body</p>",
    description: "Saved summary", image: "/cover.jpg", lang: "en", user_id: 3,
    published: false, private: false, schedule_at: null, parent: { cluster_id: 8 }, ...extra },
  can_edit: true, category: 7,
});

function fixture(props = {}) {
  const requests = [], notices = [], events = [], ticks = [], permissionChecks = [];
  const exports = {};
  const request = (method, url, payload) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    requests.push({ method, url, payload, resolve, reject });
    return promise;
  };
  const endpoints = new Proxy({}, { get: (_, key) => (...args) => `/${String(key)}/${args.join("/")}` });
  const window = { ARTICLE_API: endpoints, VAPI: endpoints, XAPI: endpoints, GAPI: endpoints,
    API: endpoints, ADMIN_API: endpoints, $storefront: { routes: { SHOP_BLOG_PAGE: "ShopBlog" } } };
  vm.runInNewContext(script, {
    exports, window, console: { warn() {} },
    $: () => ({ text: () => "Saved body", focus() {}, blur() {}, click() {} }),
    axios: Object.fromEntries(["get", "post", "delete"].map((method) => [method, (...args) => request(method, ...args)])),
    require(name) {
      if (name === "@selldone/core-js") return { Article: { Types: types } };
      if (name.includes("ShopPermissions")) return { ShopPermissionRegions: { BLOG: { code: "blog" } } };
      if (name.includes("NotificationService")) return { default: {
        showErrorAlert: (...args) => notices.push(["error", ...args]),
        showSuccessAlert: (...args) => notices.push(["success", ...args]),
        showLaravelError: (...args) => notices.push(["laravel", ...args]),
        openDangerAlert: (...args) => notices.push(["confirm", ...args]),
      } };
      if (name.includes("Slugify")) return { Slugify: { apply: (value) => value } };
      if (name.includes("ShopOptionsHelper")) return { ShopOptionsHelper: { GetLanguages: () => ["en"] } };
      if (name === "lodash-es") return { delay: (callback) => callback() };
      return { default: passthrough };
    },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props).map(([key, value]) => [key, value.default]));
  const state = {
    ...defaults, ...component.data(), workspace: true, workspaceSection: "edit", articleType: "shop-blog",
    can_edit: true, article: pack().article, ...props, _workspaceGeneration: 1,
    $shop: { id: 7, name: "test-store", language: "fa" },
    $route: { params: { shop_id: 7 }, matched: [] },
    $refs: { editorContainer: { gist: () => "Generated summary", firstImage: () => "/first.jpg",
      purifyTitle: () => "Purified title", purifyBody: () => "<p>Purified body</p>",
      findAllImages() {}, setDirection() {} } },
    $t: (key) => key, $emit: (...args) => events.push(args), $nextTick: (callback) => ticks.push(callback),
    USER: () => ({ id: 3, name: "Author" }), USER_ID: () => 3,
    permitted: true,
    writeShopAccess(region) { permissionChecks.push(region); return this.permitted; },
    getCurrentLanguage: () => ({ code: "en" }),
    getLanguageName: (code) => ({ en: "English", fa: "فارسی" })[code] || code,
    convertUTCStringToLocalTimeString: (value) => value ? `local:${value}` : null,
    convertLocalTimeStringToUTCString: (value) => value ? `utc:${value}` : null,
    getLocalTimeString: (value) => value || "", getShop: () => null,
    isString: (value) => typeof value === "string", $router: { replace() {}, go() {} },
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  state.resetToDefault = () => Object.assign(state, component.data.call(state));
  const flush = () => { while (ticks.length) ticks.shift()(); };
  return { component, state, requests, notices, events, ticks, flush, permissionChecks, window };
}

function faqReader() {
  const filename = fileURLToPath(new URL("./faq/SArticleFaqs.vue", import.meta.url));
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
  assert.deepEqual(errors, []);
  const scriptExports = {}, renderExports = {};
  vm.runInNewContext(transpile(descriptor.script.content), { exports: scriptExports, require: () => ({ InlineEditorMixin: {} }) });
  const template = compileTemplate({ source: descriptor.template.content, filename, id: "saved-faq-reader" });
  assert.deepEqual(template.errors, []);
  vm.runInNewContext(transpile(template.code), { exports: renderExports, require: () => Vue });
  return { ...scriptExports.default, render: renderExports.render };
}

async function render(f, slots = {}, reader = null) {
  const component = { ...f.component, created: undefined, mounted: undefined, beforeUnmount: undefined,
    components: { ...f.component.components, SArticleFaqs: reader || f.component.components.SArticleFaqs,
    SArticleEditor: reader ? {
      props: ["title", "body", "edit"],
      render() { return Vue.h("article", this.$attrs, [this.$slots["before-title"]?.(),
        Vue.h("h2", this.title), Vue.h("div", { "data-saved-body": "true", innerHTML: this.body }),
        this.$slots.end?.({ edit: this.edit })]); },
    } : {
      render() { return Vue.h("div", this.$attrs, [this.$slots["before-title"]?.(), this.$slots.default?.()]); },
    }, SArticleWorkspaceComments: {
      props: ["active", "articleId", "shopId", "disabled"],
      render() { return Vue.h("section", { "data-workspace-comments": this.articleId,
        "data-comments-active": this.active, "data-comments-shop": this.shopId,
        "data-comments-disabled": this.disabled }, this.$slots.login?.()); },
    }, SArticleComments: {
      render() { return Vue.h("section", { "data-public-comments": "true" }, this.$slots.login?.()); },
    }, SArticleSearchConsole: {
      props: { workspace: Boolean },
      render() { return Vue.h("div", { ...this.$attrs, "data-search-console-workspace": this.workspace }); },
    } },
    data: () => Object.fromEntries(Object.keys(f.component.data()).map((key) => [key, f.state[key]])),
    render: templateExports.render };
  const props = Object.fromEntries(Object.keys(f.component.props).map((key) => [key, f.state[key]]));
  const app = Vue.createSSRApp({ render: () => Vue.h(component, props, slots) });
  app.provide("$shop", f.state.$shop);
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, USER: f.state.USER, USER_ID: f.state.USER_ID,
    writeShopAccess: () => f.state.permitted, getCurrentLanguage: f.state.getCurrentLanguage,
    getLanguageName: f.state.getLanguageName,
    getShop: () => null, getUserAvatar: () => "/avatar.png", getLocalTimeString: (value) => value || "",
    $route: f.state.$route, $vuetify: { display: { smAndDown: false, mdAndUp: true }, locale: { isRtl: false } }, window: f.window,
  });
  const special = new Set(["v-dialog", "v-menu", "v-btn", "v-select"]);
  for (const tag of new Set(Array.from(descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g), ([, tag]) => tag))) {
    if (!special.has(tag)) app.component(tag, passthrough);
  }
  app.component("flag", passthrough);
  if (reader) for (const tag of ["v-expansion-panels", "v-expansion-panel", "v-expansion-panel-title", "v-expansion-panel-text", "v-slide-y-reverse-transition"]) app.component(tag, passthrough);
  app.component("v-dialog", { props: ["modelValue"], render() { return this.modelValue ? Vue.h("div", this.$slots.default?.()) : null; } });
  app.component("v-menu", { props: ["modelValue"], render() { return Vue.h("div", [this.$slots.activator?.({ props: { "aria-expanded": !!this.modelValue } }), this.modelValue ? this.$slots.default?.() : null]); } });
  app.component("v-btn", { props: ["disabled", "loading"], render() {
    return Vue.h("button", { ...this.$attrs, disabled: this.disabled, "data-loading": this.loading }, this.$slots.default?.());
  } });
  app.component("v-select", { props: ["items", "modelValue", "label", "disabled"], render() {
    const raw = this.items.find((item) => item.value === this.modelValue);
    return Vue.h("label", { "data-field": this.label, "data-disabled": this.disabled },
      this.$slots.selection?.({ item: { raw, title: raw.title } }));
  } });
  return renderToString(app);
}

test("workspace remains opt-in and legacy creation keeps its published default", () => {
  const f = fixture({ workspace: false });
  assert.equal(f.component.props.workspace.default, false);
  assert.equal(f.component.props.workspaceSection.default, "edit");
  f.state.prepareCreateNew(); f.flush();
  assert.equal(f.state.published_state, true);
  assert.equal(f.state.article.published, true);
  assert.equal(f.state.workspace_ready, false);
  assert.equal(f.state.workspace_dirty, false);
});

test("Comments uses an independent persistent workspace surface while legacy callers keep public comments", async () => {
  for (const workspaceSection of ["comments", "article", "edit", "seo", "analytics"]) {
    const f = fixture({ workspaceSection, showComments: true, showAuthorInfo: false });
    const html = await render(f);
    assert.match(html, /data-workspace-comments="12"/);
    assert.match(html, /data-comments-shop="7"/);
    assert.match(html, new RegExp(`data-comments-active="${workspaceSection === "comments"}"`));
    assert.doesNotMatch(html, /data-public-comments/);
    if (workspaceSection === "comments") assert.doesNotMatch(html, /class="s-article-workspace__header"/);
  }
  const legacy = await render(fixture({ workspace: false, showComments: true, showAuthorInfo: false }));
  assert.match(legacy, /data-public-comments="true"/);
  assert.doesNotMatch(legacy, /data-workspace-comments/);
  const unsaved = await render(fixture({ workspaceSection: "comments", showComments: true, isNew: true, showAuthorInfo: false }));
  assert.doesNotMatch(unsaved, /data-workspace-comments|data-public-comments/);
});

test("comment drafts and active writes participate in resource leave guards without saving the article", () => {
  const f = fixture({ workspace_ready: true });
  f.state.workspace_comments_dirty = true;
  assert.equal(f.state.workspace_dirty, false);
  assert.equal(f.state.workspace_has_changes, true);
  f.component.watch.workspace_has_changes.call(f.state, f.state.workspace_has_changes);
  assert.deepEqual(f.events.at(-1), ["workspace-dirty", true]);
  f.state.workspace_comments_busy = true;
  assert.equal(f.state.workspace_busy, true);
  f.state.saveChange(); f.state.autoFixArticle();
  assert.equal(f.requests.length, 0);
  f.state.workspace_comments_busy = false;
  assert.equal(f.state.workspace_has_changes, true);
  f.state.workspace_comments_dirty = false;
  f.component.watch.workspace_has_changes.call(f.state, f.state.workspace_has_changes);
  assert.deepEqual(f.events.at(-1), ["workspace-dirty", false]);
  assert.equal(f.state.article.body, "<p>Saved body</p>");
});

test("a dashboard can own comment management while receiving the existing workspace guards", async () => {
  const f = fixture({ workspaceSection: "comments", showComments: true, showAuthorInfo: false });
  let context;
  const html = await render(f, { "workspace-comments": (value) => {
    context = value;
    return Vue.h("div", { "data-shop-comment-manager": value.article.id });
  } });
  assert.match(html, /data-shop-comment-manager="12"/);
  assert.doesNotMatch(html, /data-workspace-comments|data-public-comments/);
  assert.equal(context.active, true);
  assert.equal(context.disabled, false);
  assert.equal(context.article.id, 12);
  for (const key of ["onDirty", "onBusy", "onCount"]) assert.equal(typeof context[key], "function");
});

test("new workspace articles begin as public drafts in the shop language", () => {
  const f = fixture(); f.state.prepareCreateNew(); f.flush();
  assert.equal(f.state.isNew, true);
  assert.equal(f.state.article.id, null);
  assert.equal(f.state.article.lang, "fa");
  assert.equal(f.state.published_state, false);
  assert.equal(f.state.article.published, false);
  assert.equal(f.state.isPrivate, false);
  assert.equal(f.state.article.private, false);
  assert.equal(f.state.in_edit_mode, true);
  assert.equal(f.state.workspace_dirty, false);
});

test("fresh BLOG write permission is required even for the article author", () => {
  const f = fixture();
  assert.ok(f.state.workspace_can_write);
  f.state.permitted = false;
  assert.equal(f.state.workspace_can_write, false);
  f.state.saveChange(); f.state.autoFixArticle(); f.state.deleteArticle();
  f.state.setWorkspaceCategory(99); f.state.setWorkspaceCluster(99);
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.category, "");
  assert.equal(f.state.cluster_id, null);
  assert.ok(f.permissionChecks.every((region) => region === "blog"));
  f.state.workspace_tools = true; f.state.workspace_schedule = true;
  f.component.watch.workspace_can_write.call(f.state, false);
  assert.equal(f.state.workspace_tools, false);
  assert.equal(f.state.workspace_schedule, false);
  f.state.permitted = true;
  f.component.watch.workspace_can_write.call(f.state, true);
  assert.equal(f.state.in_edit_mode, true, "Restored access makes the edit section editable again");
});

test("section changes preserve unsaved article, SEO, category and cluster state", () => {
  const f = fixture();
  f.state.workspace_ready = true; f.state.render_state = "editing";
  Object.assign(f.state.article, { title: "Unsaved title", body: "<p>Unsaved body</p>", slug: "unsaved", faqs: [{ title: "FAQ" }] });
  f.state.$refs.editorContainer.purifyTitle = () => "Unsaved title";
  f.state.$refs.editorContainer.purifyBody = () => "<p>Unsaved body</p>";
  f.state.setWorkspaceCategory(14); f.state.setWorkspaceCluster(15);
  const before = plain(f.state.article), identity = f.state.article;
  let inspections = 0; f.state.$refs.editorContainer.findAllImages = () => inspections++;
  for (const section of ["article", "seo", "faq", "analytics", "comments", "edit"]) {
    f.state.workspaceSection = section; f.component.watch.workspaceSection.call(f.state); f.flush();
    assert.equal(f.state.in_edit_mode, ["edit", "seo", "faq"].includes(section));
    assert.equal(f.state.article, identity);
    assert.deepEqual(plain(f.state.article), before);
    assert.equal(f.state.workspace_dirty, true);
    assert.equal(f.state.category, 14); assert.equal(f.state.cluster_id, 15);
  }
  assert.equal(inspections, 1);
});

test("preview captures the inline editor DOM before hiding it", () => {
  const f = fixture();
  f.state.workspace_ready = true; f.state.render_state = "editing";
  f.state.onChangeNote();
  f.state.$refs.editorContainer.state = "changed";
  f.state.workspaceSection = "article";
  f.state.syncWorkspaceSection("edit");
  assert.equal(f.state.article.title, "Purified title");
  assert.equal(f.state.article.body, "<p>Purified body</p>");
  assert.equal(f.state.render_state, "review");
  assert.equal(f.state.workspace_dirty, true);
});

test("SEO and FAQ tab changes/save preserve untouched rich body, while leaving a changed Edit captures it once", () => {
  const body = '<p>Keep <strong>all text</strong> and <em>formatting</em>.</p><flip-book style="visibility: hidden">%7B%22pages%22%3A%5B%5D%7D</flip-book>';
  const f = fixture({ workspaceSection: "edit", workspace_ready: true, render_state: "editing" });
  f.state.article.body = body;
  f.state.article.title = "Original title";
  f.state.$refs.editorContainer.state = "no-change";
  f.state.$refs.editorContainer.purifyBody = () => { throw new Error("Untouched body must not be purified"); };
  f.state.$refs.editorContainer.purifyTitle = () => { throw new Error("Untouched title must not be purified"); };
  let previous = "edit";
  for (const section of ["seo", "faq", "article", "faq"]) {
    f.state.workspaceSection = section;
    f.component.watch.workspaceSection.call(f.state, section, previous); f.flush();
    assert.equal(f.state.article.body, body);
    previous = section;
  }
  f.state.saveChange();
  assert.equal(f.requests[0].payload.body, body);
  assert.equal(f.requests[0].payload.title, "Original title");

  const edited = fixture({ workspaceSection: "seo", workspace_ready: true, render_state: "editing" });
  edited.state.$refs.editorContainer.state = "changed";
  edited.state.syncWorkspaceSection("edit");
  assert.equal(edited.state.article.body, "<p>Purified body</p>");
  edited.state.$refs.editorContainer.purifyBody = () => { throw new Error("Already captured body must not be purified twice"); };
  edited.state.$refs.editorContainer.purifyTitle = () => { throw new Error("Already captured title must not be purified twice"); };
  edited.state.workspaceSection = "faq";
  edited.state.syncWorkspaceSection("seo");
  edited.state.saveChange();
  assert.equal(edited.requests[0].payload.body, "<p>Purified body</p>");
});

test("FAQ uses the shared editable draft and save; unapplied FAQ or schema input protects exit and save", async () => {
  const f = fixture({ workspaceSection: "faq" });
  f.state.workspace_ready = true;
  f.state.syncWorkspaceSection();
  assert.equal(f.state.in_edit_mode, true);
  assert.equal(f.state.workspace_heading, "faq_title");
  assert.equal(f.state.workspace_save_action, "global.article.workspace.save_changes");
  for (const pending of ["workspace_faq_pending", "workspace_schema_pending"]) {
    f.state[pending] = true;
    assert.equal(f.state.workspace_has_changes, true);
    f.state.saveChange();
    assert.equal(f.requests.length, 0);
    f.state[pending] = false;
  }
  f.state.article.faqs = [{ question: "Can I deliver locally?", answer: "<p>Yes. <strong>Choose a zone.</strong></p>" }];
  f.state.article.structures = [{ "@type": "HowTo", name: "Delivery", step: [{ "@type": "HowToStep", name: "Choose a zone", text: "Select your city." }] }];
  f.state.onChangeNote();
  f.state.saveChange();
  assert.deepEqual(plain(f.requests[0].payload.faqs), plain(f.state.article.faqs));
  assert.deepEqual(plain(f.requests[0].payload.structures), plain(f.state.article.structures));
  f.requests[0].resolve({ data: { id: 12 } });
  await settle();
  assert.equal(f.state.workspace_has_changes, false);
  f.state.permitted = false;
  f.state.syncWorkspaceSection();
  assert.equal(f.state.in_edit_mode, false);
  f.state.saveChange();
  assert.equal(f.requests.length, 1);
});

test("fresh GET after saving from SEO or FAQ rehydrates metadata and ordered rich FAQ below the article", async () => {
  const reader = faqReader();
  const faqs = [
    { question: "Second question moved first", answer: '<p>Keep <strong>strong</strong>, <b>bold</b> and <i>italic</i>.</p><ol><li>Choose a zone</li><li>Read <a href="https://selldone.test/guide">the guide</a>.</li></ol>' },
    { question: "First question moved second", answer: "<p>Setup &amp; delivery stays second.</p>" },
  ];
  for (const section of ["seo", "faq"]) {
    const writer = fixture({ targetId: 112, workspaceSection: section });
    writer.state.onGetArticlePackData(pack(12, { private: true })); writer.flush();
    const content = { title: "Original article title", body: "<p>Persisted article body sentinel.</p>" };
    Object.assign(writer.state.article, content, { slug: "delivery-guide", page_title: "Delivery guide for your store",
      description: "Choose delivery zones and connect local couriers.", image: "/saved-cover.webp", faqs: plain(faqs),
      structures: [{ "@context": "https://schema.org", "@type": "HowTo", name: "Delivery setup", step: [{ "@type": "HowToStep", name: "Choose a zone", text: "Select a city." }] }] });
    writer.state.$refs.editorContainer.purifyTitle = () => content.title;
    writer.state.$refs.editorContainer.purifyBody = () => content.body;
    writer.state.onChangeNote(); writer.state.saveChange();
    assert.equal(writer.requests.length, 1);
    assert.equal(writer.requests[0].method, "post");
    const payload = plain(writer.requests[0].payload);
    assert.equal(payload.article_id, 12);
    assert.equal(payload.shop_id, 7);
    assert.equal(payload.published, false);
    assert.equal(payload.private, true);
    const savedPack = plain(pack(12, { ...payload, id: 12, parent_id: 112 }));
    writer.requests[0].resolve({ data: { id: 12, article: savedPack.article } }); await settle();
    assert.equal(writer.state.workspace_has_changes, false);

    // A new component and a serialized GET response model a full page reload, not tab reuse.
    const refreshed = fixture({ targetId: 112, workspaceSection: "article", showAuthorInfo: false });
    refreshed.state.updateArticlePage(true);
    assert.equal(refreshed.requests[0].method, "get");
    assert.equal(refreshed.requests[0].url, "/GET_SHOP_BLOG_DATA/test-store/112");
    refreshed.requests[0].resolve({ data: plain(savedPack) }); await settle(); refreshed.flush();
    for (const key of ["slug", "page_title", "description", "image", "faqs", "structures", "title", "body", "published", "private", "lang"]) {
      assert.deepEqual(plain(refreshed.state.article[key]), payload[key], `${section}: ${key}`);
    }
    assert.equal(refreshed.state.workspace_has_changes, false);
    assert.equal(refreshed.state.in_view_mode, true);
    const document = new JSDOM(await render(refreshed, {}, reader)).window.document;
    const body = document.querySelector("[data-saved-body]"), items = [...document.querySelectorAll(".faq-item")];
    assert.equal(body.textContent, "Persisted article body sentinel.");
    assert.deepEqual(items.map((item) => item.querySelector(".question > div").textContent), faqs.map((faq) => faq.question));
    assert.deepEqual(items.map((item) => item.querySelector(".answer > div").innerHTML), faqs.map((faq) => faq.answer));
    assert.ok(body.compareDocumentPosition(items[0]) & document.defaultView.Node.DOCUMENT_POSITION_FOLLOWING);
    assert.equal(body.querySelector(".faq-item"), null);
    assert.equal(items[0].querySelector("strong").textContent, "strong");
    assert.deepEqual([...items[0].querySelectorAll("ol > li")].map((item) => item.textContent), ["Choose a zone", "Read the guide."]);
    assert.equal(items[0].querySelector("a").getAttribute("href"), "https://selldone.test/guide");
    assert.equal(document.querySelector(".faq-item input, .faq-item textarea, .faq-item button"), null);
  }
});

test("mounting the language picker preserves clean state while a real language change marks the draft", () => {
  const f = fixture();
  f.state.workspace_ready = true; f.state.render_state = "editing";
  f.state.setWorkspaceLanguage(f.state.article.lang);
  assert.equal(f.state.state, "no-change");
  f.state.setWorkspaceLanguage("fa");
  assert.equal(f.state.article.lang, "fa");
  assert.equal(f.state.state, "changed");
  f.state.permitted = false;
  f.state.setWorkspaceLanguage("de");
  assert.equal(f.state.article.lang, "fa");
});

test("scheduled article hydration establishes a clean baseline after its change watcher", () => {
  const f = fixture();
  f.state.onGetArticlePackData(pack(12, { schedule_at: "2026-11-01T10:00:00Z" }));
  f.component.watch.schedule_at.call(f.state, f.state.schedule_at);
  assert.equal(f.state.workspace_ready, false);
  assert.equal(f.state.workspace_dirty, false);
  f.flush();
  assert.equal(f.state.workspace_saved_schedule, "local:2026-11-01T10:00:00Z");
  assert.equal(f.state.state, "no-change");
  assert.equal(f.state.workspace_dirty, false);
  f.state.schedule_at = null; f.component.watch.schedule_at.call(f.state, null);
  assert.equal(f.state.workspace_dirty, true);
});

test("late readiness and fetch responses cannot replace a newer resource", async () => {
  const f = fixture();
  f.state.readyWorkspace(); f.state._workspaceGeneration++; f.flush();
  assert.equal(f.state.workspace_ready, false);
  f.state.targetId = 1; f.state.updateArticlePage(true);
  f.state.targetId = 2; f.state.updateArticlePage(true);
  f.requests[0].resolve({ data: pack(1) }); await settle();
  assert.equal(f.state.inLoading, true);
  assert.equal(f.state.article.id, 0);
  f.requests[1].resolve({ data: pack(2) }); await settle(); f.flush();
  assert.equal(f.state.article.id, 2);
  assert.equal(f.state.inLoading, false);
  assert.equal(f.state.workspace_dirty, false);
});

test("save validates content and blocks every busy operation without a request", () => {
  for (const busy of ["workspace_importing", "busy_fix", "saving"]) {
    const f = fixture(); if (busy === "saving") f.state.state = busy; else f.state[busy] = true;
    f.state.saveChange();
    assert.equal(f.requests.length, 0, busy);
    assert.equal(f.notices.length, 0);
  }
  for (const field of ["title", "body"]) {
    const f = fixture();
    f.state.$refs.editorContainer[field === "title" ? "purifyTitle" : "purifyBody"] = () => "";
    f.state.saveChange();
    assert.equal(f.requests.length, 0);
    assert.equal(f.notices[0][0], "error");
    assert.equal(f.state.state, "no-change");
  }
});

test("save preserves the existing payload and marks a new draft saved", async () => {
  const f = fixture(); f.state.prepareCreateNew(); f.flush();
  Object.assign(f.state, { category: 8, cluster_id: 9, schedule_at: "scheduled", state: "changed" });
  Object.assign(f.state.article, { slug: "story", page_title: "Page title", faqs: [{ title: "Question" }], structures: [{ type: "Article" }] });
  f.state.saveChange();
  assert.equal(f.state.state, "saving");
  assert.deepEqual(plain(f.requests[0].payload), {
    type: "shop-blog", article_id: null, slug: "story", page_title: "Page title", title: "Purified title",
    body: "<p>Purified body</p>", image: "/first.jpg", description: "Generated summary", published: false,
    private: false, lang: "fa", parent_id: null, shop_id: 7, category: 8, schedule_at: "utc:scheduled",
    order: 0, star: false, faqs: [{ title: "Question" }], structures: [{ type: "Article" }], cluster_id: 9,
  });
  f.requests[0].resolve({ data: { id: 44, article: { parent_id: 144 }, changes: { slug: "normalized-story" } } });
  await settle();
  assert.equal(f.state.isNew, false);
  assert.equal(f.state.article.id, 44);
  assert.equal(f.state.article.slug, "normalized-story");
  assert.equal(f.state.workspace_saved_schedule, "scheduled");
  assert.equal(f.state.workspace_dirty, false);
  assert.equal(f.events.filter(([name]) => name === "update-article").length, 1);
});

test("late save completion is ignored after resource changes, unmount or permission loss", async () => {
  for (const change of ["generation", "article", "shop", "unmount", "permission"]) {
    const f = fixture(); f.state.saveChange();
    if (change === "generation") f.state._workspaceGeneration++;
    else if (change === "article") f.state.article = pack(88).article;
    else if (change === "shop") f.state.$route.params.shop_id = 99;
    else if (change === "unmount") f.component.beforeUnmount.call(f.state);
    else f.state.permitted = false;
    f.requests[0].resolve({ data: { id: 55 } }); await settle();
    assert.notEqual(f.state.article.id, 55, change);
    assert.equal(f.events.length, 0, change);
    assert.equal(f.notices.length, 0, change);
    if (change === "permission") assert.equal(f.state.state, "changed");
  }
});

test("failed saves retain the draft and allow retry", async () => {
  for (const failure of ["application", "network"]) {
    const f = fixture(); f.state.workspace_ready = true; f.state.saveChange();
    if (failure === "application") f.requests[0].resolve({ data: { error: true, error_msg: "Please retry" } });
    else f.requests[0].reject(new Error("offline"));
    await settle();
    assert.equal(f.state.state, "changed");
    assert.equal(f.state.article.body, "<p>Purified body</p>");
    assert.equal(f.state.workspace_dirty, true);
    f.state.saveChange(); assert.equal(f.requests.length, 2);
    f.requests[1].resolve({ data: { id: 12 } }); await settle();
  }
});

test("auto-fix ignores stale output and retains its busy guard", async () => {
  for (const change of ["generation", "article", "permission"]) {
    const f = fixture(); f.state.render_state = "editing"; f.state.autoFixArticle();
    assert.equal(f.state.busy_fix, true);
    f.state.autoFixArticle(); assert.equal(f.requests.length, 1);
    if (change === "generation") f.state._workspaceGeneration++;
    else if (change === "article") f.state.article = pack(88).article;
    else f.state.permitted = false;
    const body = f.state.article.body;
    f.requests[0].resolve({ data: { body: "<p>Stale generated body</p>" } }); await settle();
    assert.equal(f.state.article.body, body, change);
    assert.equal(f.notices.length, 0);
    if (change === "permission") assert.equal(f.state.busy_fix, false);
  }
});

test("delete confirmation rechecks permission before the protected request", () => {
  const f = fixture(); f.state.openDeleteArticleAlert();
  const confirm = f.notices.find(([name]) => name === "confirm").at(-1);
  assert.equal(typeof confirm, "function");
  f.state.permitted = false; confirm();
  assert.equal(f.requests.length, 0);
});

test("a pending delete confirmation cannot target another article or an unmounted workspace", () => {
  for (const change of ["generation", "article", "unmount"]) {
    const f = fixture(); f.state.openDeleteArticleAlert();
    const confirm = f.notices.find(([name]) => name === "confirm").at(-1);
    if (change === "generation") f.state._workspaceGeneration++;
    else if (change === "article") f.state.article = pack(88).article;
    else f.component.beforeUnmount.call(f.state);
    confirm();
    assert.equal(f.requests.length, 0, change);
  }
});

test("busy Word conversion disables save and freezes content without changing editor mode", async () => {
  const f = fixture({ workspace_importing: true, render_state: "editing", showAuthorInfo: false });
  const html = await render(f);
  assert.match(html, /<button\b(?=[^>]*\bdisabled)(?=[^>]*prepend-icon="save")[^>]*>/);
  assert.match(html, /<div\b(?=[^>]*class="samin-article-widget(?: [^"]*)?")(?=[^>]*\binert)[^>]*>/);
  assert.match(html, /<button\b(?=[^>]*aria-label="global.article.workspace.status")(?=[^>]*\bdisabled)[^>]*>/);
  assert.match(html, /\bedit="true"/, "Freezing does not cancel a pending conversion through an edit-mode change");
  f.state.saveChange(); assert.equal(f.requests.length, 0);
});

test("rendered workspace preserves original publication and visibility icons", async () => {
  for (const value of [false, true]) {
    const f = fixture({ published_state: value, isPrivate: value, showAuthorInfo: false, showShareButtons: false });
    const html = await render(f);
    assert.match(html, new RegExp(value ? "fa:fas fa-rss" : "fa:fas fa-pencil-ruler"));
    assert.match(html, new RegExp(value ? "fa:fas fa-user-lock" : "fa:fas fa-globe"));
  }
});

test("workspace save labels describe the pending publication action independently of visibility", async () => {
  const cases = [
    [{ isNew: false, article: pack(12, { published: true }).article, published_state: true }, "save_changes"],
    [{ isNew: false, published_state: true }, "save_and_publish"],
    [{ isNew: true, published_state: true }, "save_and_publish"],
    [{ isNew: false, article: pack(12, { published: true }).article, published_state: false }, "save_draft"],
    [{ isNew: true, published_state: false }, "save_draft"],
    [{ schedule_at: "2026-11-01T10:00:00.000Z", published_state: false }, "save_and_schedule"],
    [{ workspaceSection: "seo", schedule_at: "2026-11-01T10:00:00.000Z", published_state: false }, "save_changes"],
  ];
  for (const [props, action] of cases) for (const isPrivate of [false, true]) {
    const f = fixture({ ...props, isPrivate, showAuthorInfo: false, showShareButtons: false });
    const key = `global.article.workspace.${action}`;
    assert.equal(f.state.workspace_save_action, key);
    const html = await render(f);
    assert.match(html, new RegExp(`<button\\b(?=[^>]*prepend-icon="save")[^>]*>\\s*${key}\\s*</button>`));
    assert.equal(f.state.isPrivate, isPrivate);
    assert.equal(f.state.published_state, props.published_state);
    assert.equal(f.requests.length, 0, "Label calculation and rendering never save or publish");
  }
});

test("Article metadata describes the current draft with independent visibility, readable language and real scheduling", async () => {
  const strip = (html) => html.match(/<div class="s-article-workspace__metadata"[\s\S]*?<\/dl>[\s\S]*?<\/div>/)?.[0];
  for (const publication of ["published", "draft", "scheduled"]) for (const isPrivate of [false, true]) {
    const published = publication === "published", schedule = publication === "scheduled" ? "2026-11-01T10:00:00.000Z" : null;
    const f = fixture({ workspaceSection: "article", published_state: published, isPrivate,
      article: pack(12, { published, private: isPrivate }).article, schedule_at: schedule,
      showAuthorInfo: false, showShareButtons: false });
    const metadata = strip(await render(f));
    assert.ok(metadata, "The preview supplies metadata through the editor's before-title slot");
    assert.match(metadata, new RegExp(publication === "scheduled" ? "global.article.workspace.scheduled" : `global.article.${publication}`));
    assert.match(metadata, new RegExp(`global.article.${isPrivate ? "private" : "public"}`));
    assert.match(metadata, /English/);
    assert.match(metadata, new RegExp(`sd-modern-status__dot text-${published ? "success" : "warning"}`));
    assert.match(metadata, new RegExp(`sd-modern-status__dot text-${isPrivate ? "error" : "success"}`));
    assert.doesNotMatch(metadata, /<(?:button|input|select|a)\b|<flag\b/);
    if (schedule) {
      assert.match(metadata, /data-metadata="schedule"/);
      assert.ok(metadata.includes(schedule) && metadata.includes(f.state.workspace_timezone));
    } else assert.doesNotMatch(metadata, /data-metadata="schedule"/);
    assert.equal(f.requests.length, 0);
  }
  for (const [lang, forced, expected] of [["fa", null, "فارسی"], ["xx-custom", null, "xx-custom"], ["fa", "en", "English"], ["", null, "global.commons.not_set"]]) {
    const f = fixture({ workspaceSection: "article", article: pack(12, { lang }).article, forceLanguage: forced,
      showAuthorInfo: false, showShareButtons: false });
    assert.ok(strip(await render(f)).includes(expected));
  }
  const pending = fixture({ workspaceSection: "article", workspace_ready: true, published_state: true, isPrivate: true,
    showAuthorInfo: false, showShareButtons: false });
  const metadata = strip(await render(pending));
  assert.match(metadata, /global.article.published/);
  assert.match(metadata, /global.article.private/);
  assert.match(metadata, /global.article.workspace.unsaved/, "Pending metadata never implies that the server baseline was saved");
  assert.equal(pending.state.article.published, false);
  assert.equal(pending.state.article.private, false);
  const fresh = fixture({ showAuthorInfo: false, showShareButtons: false });
  fresh.state.prepareCreateNew(); fresh.flush(); fresh.state.workspaceSection = "article";
  assert.match(strip(await render(fresh)), /global.article.draft[\s\S]*global.article.workspace.unsaved/);
  for (const props of [{ workspaceSection: "edit" }, { workspaceSection: "seo" }, { workspaceSection: "analytics" }, { workspaceSection: "comments" }, { workspace: false }]) {
    const f = fixture({ ...props, showAuthorInfo: false, showShareButtons: false });
    assert.equal(strip(await render(f)), undefined, "Metadata is limited to the workspace Article preview");
  }
});

test("Article Analytics owns one localized Search Console heading and opts its nested report into workspace styling", async () => {
  const f = fixture({ workspaceSection: "analytics", showAuthorInfo: false, showShareButtons: false });
  const html = await render(f);
  assert.equal((html.match(/global\.article\.search_console\.title/g) || []).length, 1);
  assert.equal((html.match(/global\.article\.search_console\.subtitle/g) || []).length, 1);
  assert.match(html, /data-search-console-workspace="true"/);
  assert.match(html, /trademark\/google\.svg/);
  f.state.isNew = true;
  assert.doesNotMatch(await render(f), /data-search-console-workspace/);
});

test("compact settings stage values until Apply; Cancel and same-value Apply keep the draft clean", () => {
  const f = fixture({ workspace_ready: true, render_state: "editing" });
  for (const [key, value, field] of [["status", true, "published_state"], ["visibility", true, "isPrivate"], ["language", "de", "lang"]]) {
    const current = key === "language" ? f.state.article.lang : f.state[field];
    f.state.openWorkspaceSetting(key);
    f.state.workspace_setting_values[key] = value;
    assert.equal(key === "language" ? f.state.article.lang : f.state[field], current);
    f.state.cancelWorkspaceSetting();
    assert.equal(f.state.state, "no-change");
    f.state.openWorkspaceSetting(key);
    assert.equal(f.state.workspace_setting_values[key], current);
    f.state.applyWorkspaceSetting();
    assert.equal(f.state.state, "no-change");
    f.state.openWorkspaceSetting(key);
    f.state.workspace_setting_values[key] = value;
    f.state.applyWorkspaceSetting();
    assert.equal(key === "language" ? f.state.article.lang : f.state[field], value);
    assert.equal(f.state.state, "changed");
    f.state.state = "no-change";
  }
  assert.equal(f.requests.length, 0);
});

test("staged settings recheck current scope, permission and active operation before Apply", () => {
  for (const change of ["permission", "busy", "record", "generation", "shop"]) {
    const f = fixture({ workspace_ready: true, render_state: "editing" });
    f.state.openWorkspaceSetting("visibility");
    f.state.workspace_setting_values.visibility = true;
    if (change === "permission") f.state.permitted = false;
    if (change === "busy") f.state.workspace_importing = true;
    if (change === "record") f.state.article = pack(99).article;
    if (change === "generation") f.state._workspaceGeneration++;
    if (change === "shop") f.state.$route.params.shop_id = 99;
    f.state.applyWorkspaceSetting();
    assert.equal(f.state.isPrivate, false, change);
    assert.equal(f.state.workspace_setting, null);
  }
});

test("schedule changes are staged, applied explicitly and cancel safely; active schedules keep publication fixed", () => {
  const f = fixture({ workspace_ready: true, render_state: "editing" });
  f.state.openWorkspaceSchedule();
  f.state.workspace_schedule_value = "2026-11-01T10:00:00Z";
  assert.equal(f.state.schedule_at, null);
  f.component.watch.workspace_schedule.call(f.state, false);
  assert.equal(f.state.schedule_at, null);
  assert.equal(f.state.state, "no-change");
  f.state.openWorkspaceSchedule();
  f.state.workspace_schedule_value = "2026-11-01T10:00:00Z";
  f.state.applyWorkspaceSchedule();
  f.component.watch.schedule_at.call(f.state, f.state.schedule_at);
  assert.equal(f.state.schedule_at, "2026-11-01T10:00:00Z");
  assert.equal(f.state.published_state, false);
  assert.equal(f.state.workspace_controls.find((control) => control.key === "status").disabled, true);
  f.state.openWorkspaceSchedule();
  f.state.workspace_schedule_value = null;
  f.state.applyWorkspaceSchedule();
  assert.equal(f.state.schedule_at, null);
  assert.equal(f.state.workspace_controls.find((control) => control.key === "status").disabled, false);
});

test("pending author assignment freezes workspace operations and fresh permission guards Word selection", () => {
  const f = fixture({ workspace_ready: true, render_state: "editing" });
  let selected = 0;
  f.state.$refs.editorContainer.showSelectWord = () => selected++;
  f.state.workspace_author_busy = true;
  assert.equal(f.state.workspace_busy, true);
  f.state.openWorkspaceWordImport(); f.state.openWorkspaceSchedule(); f.state.openWorkspaceSetting("status");
  assert.equal(selected, 0); assert.equal(f.state.workspace_schedule, false); assert.equal(f.state.workspace_setting, null);
  f.state.workspace_author_busy = false;
  f.state.permitted = false; f.state.openWorkspaceWordImport();
  assert.equal(selected, 0);
  f.state.permitted = true; f.state.openWorkspaceWordImport();
  assert.equal(selected, 1);
});

test("selecting the same scheduled instant in another representation does not dirty the draft", () => {
  const f = fixture({ workspace_ready: true, render_state: "editing", schedule_at: "2026-11-01T14:00:00+04:00" });
  f.state.openWorkspaceSchedule();
  f.state.workspace_schedule_value = "2026-11-01T10:00:00.000Z";
  f.state.applyWorkspaceSchedule();
  assert.equal(f.state.schedule_at, "2026-11-01T14:00:00+04:00");
  assert.equal(f.state.state, "no-change");
  let opened = 0;
  f.state.$refs.workspaceScheduleInput = { showDialog() { opened++; } };
  f.state.openWorkspaceSchedule();
  f.state.openWorkspaceSchedulePicker();
  assert.equal(opened, 1);
  f.state.permitted = false; f.state.openWorkspaceSchedulePicker();
  assert.equal(opened, 1);
});

test("Auto fix reads new inline content before checking an empty saved body", () => {
  const f = fixture();
  f.state.article.body = "";
  f.state.autoFixArticle();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].payload.body, "<p>Purified body</p>");
});
