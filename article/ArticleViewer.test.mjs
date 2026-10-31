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
    exports, window, console: { warn() {}, log() {} },
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
    getLocalTimeString: (value) => value || "", getFromNowString: (value) => `relative:${value}`, getShop: () => null,
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

function renderApp(f, slots = {}, reader = null, createApp = Vue.createSSRApp) {
  const component = { ...f.component, created: undefined, mounted: undefined, beforeUnmount: undefined,
    components: { ...f.component.components, SArticleFaqs: reader || f.component.components.SArticleFaqs,
    SArticleEditor: reader ? {
      props: ["title", "body", "edit"],
      render() { return Vue.h("article", this.$attrs, [this.$slots["before-title"]?.(),
        Vue.h("h2", this.title), Vue.h("div", { "data-saved-body": "true", innerHTML: this.body }),
        this.$slots.end?.({ edit: this.edit })]); },
    } : {
      methods: { findAllImages() {} },
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
    }, SArticleWorkspaceFaqs: {
      props: ["modelValue", "active", "editMode", "disabled"],
      render() { return Vue.h("div", { ...this.$attrs, "data-workspace-faqs": "true",
        "data-faqs-active": this.active, "data-faqs-editable": this.editMode && !this.disabled },
        (this.modelValue || []).map((item) => Vue.h("p", item.question))); },
    } },
    data: () => Object.fromEntries(Object.keys(f.component.data()).map((key) => [key, f.state[key]])),
    render: templateExports.render };
  const props = () => Object.fromEntries(Object.keys(f.component.props).map((key) => [key, f.state[key]]));
  const app = createApp({ render: () => Vue.h(component, { ...props(), ref: "viewer" }, slots) });
  app.provide("$shop", f.state.$shop);
  Object.assign(app.config.globalProperties, {
    $t: (key) => key, USER: f.state.USER, USER_ID: f.state.USER_ID,
    writeShopAccess: () => f.state.permitted, getCurrentLanguage: f.state.getCurrentLanguage,
    getLanguageName: f.state.getLanguageName,
    getShop: () => null, getUserAvatar: () => "/avatar.png", getLocalTimeString: (value) => value || "", getFromNowString: f.state.getFromNowString,
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
  return app;
}

async function render(f, slots = {}, reader = null) {
  return renderToString(renderApp(f, slots, reader));
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

test("Product workspace retains article authorization without requiring Blog permission", () => {
  const product = fixture({ articleType: 'product', permitted: false });
  product.state.permitted = false;
  assert.equal(product.state.product_workspace, true);
  assert.equal(product.state.workspace_can_write, true);
  assert.deepEqual(product.permissionChecks, []);
  product.state.can_edit = false;
  assert.equal(product.state.workspace_can_write, false);
  const blog = fixture({ permitted: false });
  blog.state.permitted = false;
  assert.equal(blog.state.workspace_can_write, false);
  assert.deepEqual(blog.permissionChecks, ['blog']);
});

test("new Product descriptions preserve Published defaults and use the current Shop language", () => {
  const product = fixture({ articleType: 'product' });
  product.state.prepareCreateNew(); product.flush();
  assert.equal(product.state.article.published, true);
  assert.equal(product.state.published_state, true);
  assert.equal(product.state.article.lang, 'fa');
  assert.equal(product.state.workspace_ready, true);
  assert.equal(product.state.hasUnsavedChanges, false);
  assert.equal(product.state.saveBlocked, false);
});

test("new Product translations retain the selected language instead of the Shop default", () => {
  const product = fixture({ articleType: 'product', forceLanguage: 'ar' });
  product.state.prepareCreateNew(); product.flush();
  assert.equal(product.state.article.lang, 'ar');
  assert.equal(product.state.forceLanguage, 'ar');
  assert.equal(product.state.can_change_article_language, false);
  assert.equal(product.state.published_state, true);
});

test("saved Product descriptions honor initial review while creation and explicit editing remain editable", () => {
  for (const initialRenderState of ['review', 'editing']) {
    const product = fixture({ articleType: 'product', initialRenderState });
    product.state.onGetArticlePackData(pack()); product.flush();
    assert.equal(product.state.render_state, initialRenderState);
    assert.equal(product.state.hasUnsavedChanges, false);
    assert.equal(product.state.saveBlocked, false);
  }
  const fresh = fixture({ articleType: 'product', initialRenderState: 'review' });
  fresh.state.prepareCreateNew(); fresh.flush();
  assert.equal(fresh.state.isNew, true);
  assert.equal(fresh.state.render_state, 'editing');
});

test("Product preview preserves the native draft and saves its captured body with the existing callback", async () => {
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing', state: 'changed' });
  f.state.$refs.editorContainer.state = 'changed';
  f.state.toggleProductPreview();
  assert.equal(f.state.in_view_mode, true);
  assert.equal(f.state.article.body, '<p>Purified body</p>');
  f.state.$refs.editorContainer.purifyTitle = () => { throw Error('Do not re-read the preview DOM'); };
  f.state.$refs.editorContainer.purifyBody = () => { throw Error('Do not re-read the preview DOM'); };
  let advanced = 0;
  f.state.saveChange(() => advanced++);
  assert.equal(advanced, 0);
  assert.equal(f.requests[0].payload.body, '<p>Purified body</p>');
  assert.equal(f.requests[0].payload.product_id, undefined);
  f.requests[0].resolve({ data: { id: 12 } }); await settle();
  assert.equal(advanced, 1);
  assert.equal(f.state.hasUnsavedChanges, false);
});

test("Product keeps its empty-body save contract and vendor endpoint", async () => {
  const f = fixture({ articleType: 'product', productId: 19, workspace_ready: true, render_state: 'editing',
    $route: { params: { shop_id: 7, vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } });
  f.state.$route = { params: { shop_id: 7, vendor_id: 4 }, matched: [{ meta: { vendor: true } }] };
  f.state.$refs.editorContainer.purifyBody = () => '';
  f.state.saveChange();
  assert.match(f.requests[0].url, /POST_MY_VENDOR_ADD_EDIT_ARTICLE\/4\/product/);
  assert.equal(f.requests[0].payload.body, '');
  assert.equal(f.requests[0].payload.product_id, 19);
  f.requests[0].resolve({ data: { error: true, error_msg: 'Retry' } }); await settle();
  assert.equal(f.state.state, 'changed');
});

test("Product preview never serializes untouched rich blocks", () => {
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing' });
  const body = '<div data-block="catalog">Untouched stored payload</div>';
  f.state.article.body = body;
  const editor = f.state.$refs.editorContainer;
  editor.state = 'no-change';
  editor.purifyBody = () => { throw Error('Untouched DOM must not be serialized'); };
  editor.purifyTitle = () => { throw Error('Untouched title must not be serialized'); };
  f.state.toggleProductPreview();
  assert.equal(f.state.in_view_mode, true);
  assert.equal(f.state.article.body, body);
  f.state.toggleProductPreview();
  assert.equal(f.state.in_edit_mode, true);
  assert.equal(f.state.$refs.editorContainer, editor);
  assert.equal(f.state.article.body, body);
});

test("unconfirmed Product settings, import, schema and inactive editors cannot save", () => {
  for (const pending of ['workspace_setting', 'workspace_schedule', 'workspace_tools', 'workspace_import_pending', 'workspace_schema_pending', 'workspace_faq_pending', 'auto_generate_busy']) {
    const f = fixture({ articleType: 'product', workspace_ready: true });
    f.state[pending] = pending === 'workspace_setting' ? 'status' : true;
    assert.equal(f.state.saveBlocked, true, pending);
    f.state.saveChange(); assert.equal(f.requests.length, 0, pending);
  }
  const inactive = fixture({ articleType: 'product', workspace_ready: true, active: false });
  inactive.state.saveChange(); inactive.state.autoFixArticle(); inactive.state.deleteArticle(); inactive.state.autoGenerate(); inactive.state.openWorkspaceSchedule();
  assert.equal(inactive.requests.length, 0);
  assert.equal(inactive.state.workspace_schedule, false);
});

test("Product workspace renders the shared editor and three digest disclosures without Blog or author controls", async () => {
  const f = fixture({ articleType: 'product', showAuthorInfo: false, workspace_ready: true });
  f.state.article.faqs = [{ question: 'Care?', answer: '<p>Follow the guide.</p>' }];
  f.state.article.structures = [{ '@type': 'Book', name: 'Guide' }];
  const html = await render(f);
  assert.match(html, /s-article-workspace--product/);
  assert.equal((html.match(/<details /g) || []).length, 3);
  assert.match(html, /add_product.description_modern.product_story/);
  assert.doesNotMatch(html, /s-article-workspace__author|s-article-workspace__seo-grid|s-article-workspace__save-state/);
  assert.match(html, /product-workspace="true"/);
  assert.equal(f.state.product_faq_digest, 'add_product.description_modern.faq_digest');
  assert.equal(f.state.product_schema_digest, 'add_product.description_modern.schema_digest');
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

test("Blog Details stays mounted across toggles and SEO while preserving selections and fresh write guards", async () => {
  const node = (type, text = "") => ({ type, text, props: {}, style: { display: "" }, children: [], parent: null });
  const renderer = Vue.createRenderer({
    createElement: node, createText: (text) => node("text", text), createComment: (text) => node("comment", text),
    insert(child, parent, anchor = null) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      parent.children.splice(anchor ? parent.children.indexOf(anchor) : parent.children.length, 0, child); child.parent = parent;
    },
    remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
    setText(child, text) { child.text = text; }, setElementText(child, text) { child.text = text; child.children = []; },
    patchProp(child, key, previous, next) { child.props[key] = next; }, parentNode: (child) => child.parent,
    nextSibling: (child) => child.parent?.children[child.parent.children.indexOf(child) + 1] || null,
  });
  const nodes = (current) => [current, ...current.children.flatMap(nodes)];
  let mounts = 0, options, search;
  const Options = Vue.defineComponent({
    props: ["categoryId", "clusterId", "setCategoryId", "setClusterId", "disabled"],
    setup(values) {
      mounts++; options = values; search = Vue.ref("Pending category search");
      return () => Vue.h("div", { "data-details-options": true, "data-search": search.value,
        "data-category": values.categoryId, "data-cluster": values.clusterId, "data-disabled": values.disabled });
    },
  });
  const f = fixture({ workspace_ready: true, render_state: "editing" });
  f.state = Vue.reactive(f.state);
  const app = renderApp(f, { "extra-header-options": (values) => Vue.h(Options, values) }, null, renderer.createApp);
  const container = node("root"), root = app.mount(container), viewer = root.$refs.viewer;
  try {
    const panel = nodes(container).find((item) => item.props.class === "s-article-workspace__details");
    const fields = nodes(panel).find((item) => item.props["data-details-options"]);
    options.setCategoryId(14); options.setClusterId(15);
    for (const [open, section] of [[true, "edit"], [false, "edit"], [true, "edit"], [true, "seo"], [true, "edit"]]) {
      viewer.workspace_details = open; f.state.workspaceSection = section;
      await Vue.nextTick();
      assert.equal(panel.style.display === "none", !open || section !== "edit");
      assert.equal(nodes(panel).find((item) => item.props["data-details-options"]), fields);
      assert.equal(fields.props["data-category"], 14); assert.equal(fields.props["data-cluster"], 15);
      assert.equal(fields.props["data-search"], "Pending category search");
      assert.equal(mounts, 1, "Hiding Details retains its existing selector instance");
    }
    f.state.permitted = false;
    await Vue.nextTick();
    assert.equal(panel.props.inert, true); assert.equal(fields.props["data-disabled"], true);
    options.setCategoryId(99); options.setClusterId(99);
    assert.equal(viewer.category, 14); assert.equal(viewer.cluster_id, 15);
    assert.equal(f.requests.length, 0, "Toggles, tab changes and denied selections never save the article");
  } finally { app.unmount(); }
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

test("Product Search Console opens only for an active editable saved merchant article and keeps legacy presentation", async () => {
  const product = fixture({ articleType: 'product', workspace_ready: true });
  product.state.showGoogleSearch(); product.flush();
  const html = await render(product);
  const document = new JSDOM(html).window.document;
  const report = document.querySelector('.s-article-product__search');
  assert.ok(report);
  assert.notEqual(report.style.display, 'none');
  assert.ok(report.querySelector('[data-search-console-workspace="true"]'));
  assert.doesNotMatch(report.className, /shadow-paper/);

  for (const blocked of [{ active: false }, { can_edit: false }, { state: 'saving' }, { article: pack(null).article },
    { $route: { params: { shop_id: 7, vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } }]) {
    const f = fixture({ articleType: 'product', workspace_ready: true });
    Object.assign(f.state, blocked);
    f.state.showGoogleSearch(); f.flush();
    assert.equal(f.state.show_google_tank, false);
    assert.equal(f.state.first_load_seo_audit, false);
  }

  for (const blocked of [{ can_edit: false },
    { $route: { params: { shop_id: 7, vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } }]) {
    const f = fixture({ articleType: 'product', first_load_seo_audit: true, show_google_tank: true });
    Object.assign(f.state, blocked);
    assert.doesNotMatch(await render(f), /data-search-console-workspace/);
  }

  const legacy = fixture({ workspace: false, articleType: 'product', first_load_seo_audit: true, show_google_tank: true });
  const legacyDocument = new JSDOM(await render(legacy)).window.document;
  const legacyReport = legacyDocument.querySelector('.shadow-paper');
  assert.ok(legacyReport.querySelector('[data-search-console-workspace="false"]'));
  assert.notEqual(legacyReport.style.display, 'none');
});

test("Product section tabs retain the editor and metadata drafts while grouping SEO and schema under SEO", async () => {
  const f = fixture({ articleType: 'product', productSectionTabs: true, workspace_ready: true, render_state: 'editing', initialRenderState: 'review' });
  assert.equal(f.component.props.productSectionTabs.default, false);
  f.state.article.faqs = [{ question: 'Keep this question', answer: '<p>Pending answer.</p>' }];
  f.state.article.structures = [{ '@type': 'Product', name: 'Pending schema' }];
  let document = new JSDOM(await render(f)).window.document;
  const panels = [...document.querySelectorAll('.s-article-product__disclosure')];
  assert.equal(panels.length, 2);
  assert.ok(panels.every((panel) => panel.style.display === 'none'));
  assert.equal(document.querySelector('.s-article-product__faq').style.display, 'none');
  const rich = '<div data-block="catalog">Untouched rich body</div>';
  f.state.article.body = rich;
  f.state.$refs.editorContainer.state = 'changed';
  f.state.workspaceSection = 'seo'; f.state.syncWorkspaceSection('edit');
  assert.equal(f.state.product_panels.seo, true, 'The SEO tab immediately exposes its actual fields');
  assert.equal(f.state.article.body, '<p>Purified body</p>', 'Leaving a changed writing surface captures it once');
  f.state.article.body = rich;
  f.state.$refs.editorContainer.purifyBody = () => { throw Error('SEO must not serialize the hidden body'); };
  f.state.readyWorkspace(); f.flush();
  assert.equal(f.state.in_edit_mode, true, 'An initial preview setting cannot disable SEO controls');
  document = new JSDOM(await render(f)).window.document;
  assert.equal(document.querySelector('.samin-article-widget').style.display, 'none');
  assert.ok([...document.querySelectorAll('.s-article-product__disclosure')].every((panel) => panel.style.display !== 'none'));
  assert.equal(document.querySelector('.s-article-product__faq').style.display, 'none');
  assert.equal(f.state.article.faqs[0].question, 'Keep this question');
  assert.equal(f.state.article.structures[0].name, 'Pending schema');
  f.state.saveChange();
  assert.equal(f.requests[0].payload.body, rich);
});

test("standalone Product FAQ remains mounted across tabs with independent active state and pending-draft protection", async () => {
  const f = fixture({ articleType: 'product', productSectionTabs: true, workspaceSection: 'faq', workspace_ready: true, render_state: 'editing' });
  const faqs = [{ question: 'Keep this draft question', answer: '<p>Preserve <strong>formatting</strong>.</p>' }];
  f.state.article.faqs = faqs;
  f.state.workspace_faq_pending = true;
  for (const workspaceSection of ['faq', 'seo', 'edit', 'faq']) {
    const previous = f.state.workspaceSection;
    f.state.workspaceSection = workspaceSection; f.state.syncWorkspaceSection(previous);
    const document = new JSDOM(await render(f)).window.document;
    const panel = document.querySelector('section.s-article-product__faq');
    const editor = panel.querySelector('[data-workspace-faqs]');
    assert.equal(document.querySelectorAll('[data-workspace-faqs]').length, 1);
    assert.equal(panel.querySelector('summary'), null, 'The FAQ tab does not add a closed outer disclosure');
    assert.equal(panel.style.display === 'none', workspaceSection !== 'faq');
    assert.equal(editor.getAttribute('data-faqs-active'), String(workspaceSection === 'faq'));
    assert.equal(f.state.article.faqs, faqs, 'Navigation retains the same applied FAQ draft');
    assert.equal(f.state.workspace_faq_pending, true, 'Hiding the editor cannot discard its unapplied dialog draft');
    assert.equal(f.state.saveBlocked, true);
    f.state.saveChange();
    assert.equal(f.requests.length, 0, 'An unapplied FAQ draft prevents every tab from saving');
  }
  f.state.active = false;
  const inactive = new JSDOM(await render(f)).window.document;
  assert.equal(inactive.querySelector('[data-workspace-faqs]').getAttribute('data-faqs-active'), 'false');
  assert.equal(f.state.saveBlocked, true);
});

test("Product FAQ save preserves the rich article body, schedule and metadata while respecting fresh write guards", () => {
  const f = fixture({ articleType: 'product', productSectionTabs: true, workspaceSection: 'faq', workspace_ready: true, render_state: 'editing', schedule_at: '2026-11-01T10:00:00Z' });
  const body = '<div data-block="catalog">Keep this stored article exactly.</div>';
  const faqs = [{ question: 'FAQ update', answer: '<p>Keep <b>rich</b> text.</p>' }];
  f.state.article.body = body; f.state.article.faqs = faqs;
  f.state.article.page_title = 'Pending SEO title'; f.state.isPrivate = true;
  f.state.$refs.editorContainer.purifyBody = () => { throw Error('FAQ save must not read the hidden body'); };
  f.state.$refs.editorContainer.purifyTitle = () => { throw Error('FAQ save must not read the hidden title'); };
  f.state.can_edit = false;
  f.state.saveChange(); assert.equal(f.requests.length, 0);
  f.state.can_edit = true;
  assert.equal(f.state.workspace_save_action, 'global.article.workspace.save_changes');
  assert.equal(f.state.saveBlocked, false);
  f.state.saveChange();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].payload.body, body);
  assert.deepEqual(f.requests[0].payload.faqs, faqs);
  assert.equal(f.requests[0].payload.page_title, 'Pending SEO title');
  assert.equal(f.requests[0].payload.private, true);
  assert.equal(f.requests[0].payload.schedule_at, 'utc:2026-11-01T10:00:00Z');
});

test("Product AddFull retains its original inline FAQ disclosure and active-panel behavior", async () => {
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing' });
  f.state.article.faqs = [{ question: 'Existing inline FAQ', answer: '<p>Preserved answer.</p>' }];
  let document = new JSDOM(await render(f)).window.document;
  assert.equal(document.querySelectorAll('details.s-article-product__disclosure').length, 3);
  assert.equal(document.querySelector('.s-article-product__faq'), null);
  const editor = document.querySelector('[data-workspace-faqs]');
  assert.equal(editor.closest('details').style.display, '');
  assert.equal(editor.getAttribute('data-faqs-active'), 'false');
  f.state.product_panels.faq = true;
  document = new JSDOM(await render(f)).window.document;
  assert.equal(document.querySelector('[data-workspace-faqs]').getAttribute('data-faqs-active'), 'true');
  assert.ok(document.querySelector('[data-workspace-faqs]').closest('details').hasAttribute('open'));
  assert.equal(f.requests.length, 0);
});

test("Product SEO exposes an explicit lazy Search Console report and avoids disconnected or hidden audits", async () => {
  const f = fixture({ articleType: 'product', productSectionTabs: true, workspaceSection: 'seo', workspace_ready: true });
  let document = new JSDOM(await render(f)).window.document;
  assert.match(document.querySelector('.s-article-product__search').textContent, /global.article.search_console.connect_message/);
  assert.doesNotMatch(await render(f), /data-search-console-workspace/);
  f.state.showGoogleSearch(); f.flush();
  assert.equal(f.state.show_google_tank, false);
  for (const configuration of ['search_console', 'search_console_sample']) {
    f.state.$shop[configuration] = true;
    assert.match(await render(f), /add_product.description_modern.view_search_report/);
    assert.doesNotMatch(await render(f), /data-search-console-workspace/);
    f.state.showGoogleSearch(); f.flush();
    assert.equal((await render(f)).match(/data-search-console-workspace="true"/g)?.length, 1);
    for (const blocked of [{ active: false }, { can_edit: false }, { workspaceSection: 'edit' }, { article: pack(null).article },
      { $route: { params: { shop_id: 7, vendor_id: 4 }, matched: [{ meta: { vendor: true } }] } }]) {
      const hidden = fixture({ articleType: 'product', productSectionTabs: true, workspaceSection: 'seo', show_google_tank: true, first_load_seo_audit: true });
      hidden.state.$shop.search_console = true;
      Object.assign(hidden.state, blocked);
      assert.doesNotMatch(await render(hidden), /data-search-console-workspace/);
    }
    f.state.show_google_tank = false;
    delete f.state.$shop[configuration];
  }
  assert.equal(f.requests.length, 0, 'Rendering and report selection use no real HTTP calls in this fixture');
});

test("Product publication and visibility menus show direct checked choices and apply only local draft changes", async () => {
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing' });
  for (const [key, field, options] of [['status', 'published_state', ['global.article.draft', 'global.article.published']],
    ['visibility', 'isPrivate', ['global.article.public', 'global.article.private']]]) {
    f.state.openWorkspaceSetting(key);
    const document = new JSDOM(await render(f)).window.document;
    const menu = document.querySelector('[role="menu"]');
    assert.ok(menu);
    assert.equal(menu.querySelector('[data-field]'), null, 'There is no nested select');
    const choices = [...menu.querySelectorAll('[role="menuitemradio"]')];
    assert.deepEqual(choices.slice(0, 2).map((item) => item.getAttribute('title')), options);
    assert.deepEqual(choices.slice(0, 2).map((item) => item.getAttribute('prepend-icon')), key === 'status' ? ['edit_note', 'rss_feed'] : ['public', 'lock_outline']);
    assert.equal(choices[0].getAttribute('aria-checked'), 'true');
    assert.equal(choices[1].getAttribute('aria-checked'), 'false');
    f.state.selectProductWorkspaceSetting(key, false);
    assert.equal(f.state.state, 'no-change', 'Selecting the current value keeps the draft clean');
    f.state.openWorkspaceSetting(key); f.state.selectProductWorkspaceSetting(key, true);
    assert.equal(f.state[field], true);
    assert.equal(f.state.state, 'changed');
    assert.equal(f.state.workspace_setting, null);
    f.state.state = 'no-change';
  }
  f.state.openWorkspaceSetting('language');
  assert.match(await render(f), /s-article-workspace__setting-actions/, 'The staged language picker remains intact');
  assert.equal(f.requests.length, 0, 'Choosing metadata does not save or publish it');
});

test("direct Product choices recheck current scope and permission before changing metadata", () => {
  for (const change of ['inactive', 'permission', 'busy', 'record', 'generation', 'shop']) {
    const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing' });
    f.state.openWorkspaceSetting('visibility');
    if (change === 'inactive') f.state.active = false;
    if (change === 'permission') f.state.can_edit = false;
    if (change === 'busy') f.state.workspace_importing = true;
    if (change === 'record') f.state.article = pack(99).article;
    if (change === 'generation') f.state._workspaceGeneration++;
    if (change === 'shop') f.state.$route.params.shop_id = 99;
    f.state.selectProductWorkspaceSetting('visibility', true);
    assert.equal(f.state.isPrivate, false, change);
    assert.equal(f.state.workspace_setting, null, change);
    assert.equal(f.requests.length, 0);
  }
});

test("Product scheduling keeps publication locked and opens the existing staged schedule dialog from Status", async () => {
  const scheduled = '2026-11-01T14:00:00+04:00';
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing', schedule_at: scheduled });
  const status = f.state.workspace_controls.find((control) => control.key === 'status');
  assert.equal(status.disabled, false);
  assert.equal(status.value, 'global.article.workspace.scheduled');
  f.state.openWorkspaceSetting('status');
  const document = new JSDOM(await render(f)).window.document;
  const choices = [...document.querySelector('[role="menu"]').querySelectorAll('[role="menuitemradio"]')];
  assert.equal(choices.length, 3);
  assert.ok(choices.slice(0, 2).every((item) => item.hasAttribute('disabled') && item.getAttribute('aria-checked') === 'false'));
  assert.equal(choices[2].getAttribute('aria-checked'), 'true');
  assert.equal(choices[2].getAttribute('subtitle'), 'add_product.description_modern.status_schedule_hint');
  f.state.selectProductWorkspaceSetting('status', true);
  assert.equal(f.state.published_state, false);
  assert.equal(f.state.schedule_at, scheduled);
  f.state.openWorkspaceSchedule();
  assert.equal(f.state.workspace_setting, null);
  assert.equal(f.state.workspace_schedule, true);
  assert.equal(f.state.workspace_schedule_value, scheduled);
  f.state.workspace_schedule_value = null;
  f.state.applyWorkspaceSchedule();
  assert.equal(f.state.schedule_at, null);
  f.state.openWorkspaceSetting('status'); f.state.selectProductWorkspaceSetting('status', true);
  assert.equal(f.state.published_state, true);
  assert.equal(f.requests.length, 0);
});

test("Product scheduled metadata is compact while its tooltip retains exact localized time and timezone", async () => {
  const scheduled = '2026-11-01T14:00:00+04:00';
  const f = fixture({ articleType: 'product', schedule_at: scheduled });
  f.state.getFromNowString = (value) => value === scheduled ? 'in 3 days' : 'unexpected time';
  const metadata = f.state.workspace_metadata.find((field) => field.key === 'schedule');
  assert.equal(metadata.value, 'in 3 days');
  assert.equal(metadata.tooltip, `${scheduled} · ${f.state.workspace_timezone}`);
  const document = new JSDOM(await render(f)).window.document;
  assert.equal(document.querySelector('.s-article-workspace__schedule-copy').getAttribute('tabindex'), '0');
  assert.match(document.querySelector('.s-article-workspace__schedule-copy').textContent, /in 3 days/);
  assert.equal(f.state.schedule_at, scheduled);
});

test("Product AI Write explains its editable draft and never saves generated content automatically", async () => {
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing' });
  const document = new JSDOM(await render(f)).window.document;
  assert.match(document.querySelector('.s-article-product__ai').textContent, /add_product.description_modern.ai_write_hint/);
  f.state.autoGenerate();
  assert.equal(f.requests.length, 1);
  assert.match(f.requests[0].url, /POST_AI_ARTICLE_AUTO_GENERATE\/7\/12/);
  assert.equal(f.state.auto_generate_busy, true);
  f.requests[0].resolve({ data: { title: 'Editable generated title', body: '<p>Editable generated body</p>' } });
  await settle();
  assert.equal(f.state.article.body, '<p>Editable generated body</p>');
  assert.equal(f.state.state, 'changed');
  assert.equal(f.requests.length, 1, 'Generation does not post an article save');
});

test("new Product descriptions retain discoverable disabled AI Write with focusable Save-first help", async () => {
  const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'editing', article: pack(null).article });
  const document = new JSDOM(await render(f)).window.document;
  const action = document.querySelector('.s-article-product__ai-action');
  assert.ok(action);
  assert.equal(action.getAttribute('tabindex'), '0');
  assert.ok(action.querySelector('button.s-article-product__ai').disabled);
  assert.match(action.textContent, /add_product.description_modern.ai_write/);
  assert.match(action.textContent, /global.article.workspace.save_first/);
  f.state.autoGenerate();
  assert.equal(f.requests.length, 0, 'The native saved-article guard prevents generation');
});

test("Blog and Product language controls show full names with forced-language precedence and unknown-code fallback", async () => {
  for (const articleType of ["shop-blog", "product"]) {
    for (const [lang, forceLanguage, expected] of [["en", null, "English"], ["fa", null, "فارسی"],
      ["fa", "en", "English"], ["en", "fa", "فارسی"], ["de", null, "German"], ["bi", null, "Bislama"], ["BI", null, "Bislama"],
      ["en", "bi", "Bislama"], ["!bad", null, "!bad"], ["en", "!bad", "!bad"],
      ["xx-custom", null, "xx-custom"], ["", null, "global.commons.not_set"]]) {
      const f = fixture({ articleType, article: pack(12, { lang }).article, forceLanguage });
      assert.equal(f.state.workspace_controls.find((control) => control.key === "language").value, expected);
      const document = new JSDOM(await render(f)).window.document;
      const control = document.querySelector('button.s-article-workspace__command-button[aria-label="global.article.workspace.language"]');
      assert.ok(control.textContent.includes(expected));
      assert.equal(f.state.article.lang, lang, "Displaying a full language name preserves the stored language");
      assert.equal(f.requests.length, 0);
    }
  }
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

test("Blog and Product workspaces expose one shared inline Word and Auto-fix control without overflow duplicates", async () => {
  for (const props of [{}, { articleType: 'product' }, { articleType: 'product', productSectionTabs: true }]) {
    const f = fixture({ ...props, workspace_ready: true, render_state: 'editing', workspace_tools: true });
    const document = new JSDOM(await render(f)).window.document;
    const command = document.querySelector('.s-article-workspace__command');
    const word = command.querySelector('button[aria-label="global.article.workspace.import_word"]');
    const autoFix = command.querySelector('button[aria-label="global.article.workspace.auto_fix"]');
    assert.ok(word.classList.contains('s-article-workspace__command-button'));
    assert.ok(autoFix.classList.contains('s-article-workspace__command-button'));
    assert.equal(word.disabled, false);
    assert.equal(autoFix.disabled, false);
    assert.match(word.querySelector('img').getAttribute('src'), /extensions\/docx\.svg$/);
    assert.equal(word.querySelector('img').getAttribute('alt'), '');
    assert.match(autoFix.textContent, /auto_fix_high/);
    for (const action of ['import_word', 'auto_fix']) {
      assert.equal(document.querySelectorAll(`button[aria-label="global.article.workspace.${action}"]`).length, 1);
      assert.equal(document.querySelector(`[title="global.article.workspace.${action}"]`), null);
    }
    assert.ok(document.querySelector('[title="global.article.menu.delete"]'), 'Delete stays available in its existing overflow menu');
    assert.equal(f.requests.length, 0);
  }
});

test("inline article tools keep current write, active, busy, pending-import and empty-body guards", async () => {
  for (const articleType of ['shop-blog', 'product']) {
    for (const blocked of ['readonly', 'inactive', 'busy', 'pending', 'empty']) {
      const f = fixture({ articleType, workspace_ready: true, render_state: 'editing' });
      if (blocked === 'readonly') f.state.can_edit = false;
      if (blocked === 'inactive') f.state.active = false;
      if (blocked === 'busy') f.state.workspace_importing = true;
      if (blocked === 'pending') f.state.workspace_import_pending = true;
      if (blocked === 'empty') f.state.article.body = '';
      const document = new JSDOM(await render(f)).window.document;
      const command = document.querySelector('.s-article-workspace__command');
      assert.equal(command.querySelector('button[aria-label="global.article.workspace.import_word"]').disabled, blocked !== 'empty', `${articleType}: ${blocked} Word`);
      assert.equal(command.querySelector('button[aria-label="global.article.workspace.auto_fix"]').disabled, blocked !== 'pending', `${articleType}: ${blocked} Auto-fix`);
    }
  }
});

test("Product review enters editing before Word selection while current editing and Blog imports stay immediate", () => {
  for (const articleType of ['product', 'shop-blog']) {
    for (const render_state of ['review', 'editing']) {
      const f = fixture({ articleType, workspace_ready: true, render_state, workspace_tools: true });
      let selected = 0;
      f.state.$refs.editorContainer.showSelectWord = () => selected++;
      const body = f.state.article.body;
      f.state.openWorkspaceWordImport();
      const deferred = articleType === 'product' && render_state === 'review';
      assert.equal(selected, deferred ? 0 : 1);
      assert.equal(f.state.workspace_tools, false);
      if (articleType === 'product') assert.equal(f.state.in_edit_mode, true);
      f.flush();
      assert.equal(selected, 1);
      assert.equal(f.state.article.body, body);
      assert.equal(f.state.state, 'no-change');
      assert.equal(f.requests.length, 0);
    }
  }
});

test("Word selection rejects blocked requests and rechecks deferred Product import context", () => {
  for (const when of ['before', 'after']) {
    const blocked = ['permission', 'inactive', 'busy', 'pending', 'loading', 'not-found', 'login',
      ...(when === 'after' ? ['section', 'review', 'article', 'generation'] : [])];
    for (const change of blocked) {
      const f = fixture({ articleType: 'product', workspace_ready: true, render_state: 'review' });
      let selected = 0;
      f.state.$refs.editorContainer.showSelectWord = () => selected++;
      if (when === 'after') f.state.openWorkspaceWordImport();
      if (change === 'permission') f.state.can_edit = false;
      if (change === 'inactive') f.state.active = false;
      if (change === 'busy') f.state.workspace_importing = true;
      if (change === 'pending') f.state.workspace_import_pending = true;
      if (change === 'loading') f.state.inLoading = true;
      if (change === 'not-found') f.state.NOT_FOUND_ARTICLE = true;
      if (change === 'login') f.state.NEED_LOGIN = true;
      if (change === 'section') f.state.workspaceSection = 'seo';
      if (change === 'review') f.state.render_state = 'review';
      if (change === 'article') f.state.article = pack(99).article;
      if (change === 'generation') f.state._workspaceGeneration++;
      if (when === 'before') f.state.openWorkspaceWordImport();
      f.flush();
      assert.equal(selected, 0, `${when}: ${change}`);
      if (when === 'before') assert.equal(f.state.render_state, 'review');
      assert.equal(f.requests.length, 0);
    }
  }
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
