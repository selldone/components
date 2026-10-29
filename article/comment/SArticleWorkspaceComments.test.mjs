import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

// Deferred synthetic requests only. Never read a live comment or submit a real mutation.
const filename = new URL("./SArticleWorkspaceComments.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename: filename.pathname });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "workspace-comments-test" });
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname,
  id: "workspace-comments-test", compilerOptions: { bindingMetadata: compiled.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content,
  filename: filename.pathname, id: "workspace-comments-test", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const templateExports = {};
vm.runInNewContext(transpile(template.code), { exports: templateExports, require: () => Vue });
const dateExports = {};
vm.runInNewContext(transpile(readFileSync(new URL('../../mixin/date/DateMixin.ts', import.meta.url), 'utf8')), {
  exports: dateExports, console,
  window: { $language: { full_locale: 'en-US', calendar: { calendar: 'gregory' } } },
  require: () => ({ DateConverter: { GetLocalTimeString: (value) => `TIME:${value}` } }),
});
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const passthrough = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
const comment = (id = 10, user = 3, extra = {}) => ({ id, article_id: 12, user_id: user,
  user: { id: user, name: `Author ${user}` }, body: `Comment ${id}`, reply: null, deleted_at: null,
  created_at: `2026-10-${String(id).padStart(2, "0")}T10:00:00Z`, updated_at: "2026-10-28T10:00:00Z", ...extra });
const page = (comments = [comment(9, 4)], mine = [comment()], extra = {}) => ({
  comments, my_comments: mine, count: comments.length + mine.filter((row) => !row.deleted_at).length,
  offset: 10, more: false, ...extra,
});

function fixture(props = {}) {
  const exports = {}, requests = [], events = [], ticks = [], observers = [];
  const request = (method, url, payload) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    requests.push({ method, url, payload, resolve: (data) => resolve({ data }), reject });
    return promise;
  };
  vm.runInNewContext(transpile(descriptor.script.content), {
    require(path) { if (path.includes('DateMixin')) return { default: dateExports.default }; throw new Error(`Unexpected import: ${path}`); },
    exports, window: {
      GAPI: { GET_COMMENTS: (id) => `/articles/${id}/comments` },
      ARTICLE_API: { POST_ADD_COMMENT: (id) => `/article/${id}/comment`, PUT_UPDATE_COMMENT: (id) => `/comment/${id}`, DELETE_COMMENT: (id) => `/comment/${id}` },
    },
    axios: Object.fromEntries(["get", "post", "put", "delete"].map((method) => [method, (...args) => request(method, ...args)])),
    ResizeObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this); }
      observe(element) { this.element = element; }
      disconnect() { this.disconnected = true; }
    },
  });
  const component = exports.default;
  const state = { ...component.data(), articleId: 12, articleUserId: 3, shopId: 7, forProduct: false,
    isShop: true, isSelldone: false, active: true, disabled: false, ...props,
    session: { user: { id: 3, name: "Me" } },
    $refs: { rowButtons: [] }, $t: (key) => key, $emit: (...args) => events.push(args), $nextTick: (callback) => ticks.push(callback),
    USER() { return this.session.user; }, USER_ID() { return this.session.user?.id; },
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  let dirty = state.dirty;
  for (const key of ["mode", "draft", "original"]) {
    let value = state[key];
    Object.defineProperty(state, key, { get: () => value, set(next) {
      value = next;
      if (state.dirty !== dirty) { dirty = state.dirty; component.watch.dirty.call(state, dirty); }
    } });
  }
  let busy = state.busy_write;
  Object.defineProperty(state, "busy_write", { get: () => busy, set(value) {
    if (busy !== value) { busy = value; component.watch.busy_write.call(state, value); }
  } });
  component.created.call(state);
  const flush = () => { while (ticks.length) ticks.shift()(); };
  return { component, state, requests, events, observers, flush };
}

async function loaded(data = page(), props) {
  const f = fixture(props); f.requests[0].resolve(data); await settle(); return f;
}
async function render(f) {
  const app = Vue.createSSRApp({ ...f.component, created: undefined, beforeUnmount: undefined,
    data: () => Object.fromEntries(Object.keys(f.component.data()).map((key) => [key, f.state[key]])), render: templateExports.render,
  }, Object.fromEntries(Object.keys(f.component.props).map((key) => [key, f.state[key]])));
  Object.assign(app.config.globalProperties, { USER: () => f.state.USER(), USER_ID: () => f.state.USER_ID(), $t: f.state.$t,
    getUserAvatar: (id) => `/avatar/${id}` });
  const special = new Set(["v-btn", "v-tooltip", "v-dialog", "v-textarea"]);
  for (const tag of new Set(Array.from(descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g), ([, name]) => name))) if (!special.has(tag)) app.component(tag, passthrough);
  app.component("v-btn", { props: ["disabled", "loading"], render() { return Vue.h("button", { ...this.$attrs, disabled: this.disabled, "data-loading": this.loading }, this.$slots.default?.()); } });
  app.component("v-tooltip", { inheritAttrs: false, props: ["disabled"], render() { return Vue.h(Vue.Fragment, [this.$slots.activator?.({ props: { "data-tooltip-activator": true } }), !this.disabled ? Vue.h("span", { "data-tooltip": true }, this.$slots.default?.()) : null]); } });
  app.component("v-dialog", { props: ["modelValue"], render() { return this.modelValue ? Vue.h("div", this.$slots.default?.()) : null; } });
  app.component("v-textarea", { props: ["modelValue"], render() { return Vue.h("textarea", this.$attrs, this.modelValue); } });
  return renderToString(app);
}

test("initial fetch is lazy; enabling an active instance retries, sibling tabs preserve a comment draft", async () => {
  const f = fixture({ active: false });
  assert.equal(f.requests.length, 0);
  f.state.active = true; f.component.watch.active.call(f.state, true);
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve(page()); await settle();
  f.state.startEdit(f.state.active_own); f.state.draft = "Unsaved comment";
  f.state.cancelEditor(); assert.equal(f.state.discard_open, true);
  f.state.active = false; f.component.watch.active.call(f.state, false);
  assert.equal(f.state.discard_open, false); assert.equal(f.state.pending_action, null);
  f.state.fetchComments(true); f.state.saveComment();
  assert.equal(f.requests.length, 1);
  f.state.active = true; f.component.watch.active.call(f.state, true);
  assert.equal(f.state.draft, "Unsaved comment");
  assert.equal(f.requests.length, 1);
  const disabled = fixture({ disabled: true });
  assert.equal(disabled.requests.length, 0);
  disabled.state.disabled = false; disabled.component.watch.disabled.call(disabled.state, false);
  assert.equal(disabled.requests.length, 1);
});

test("all pages use the excluded-mine offset, dedupe own history, sort newest first and count only active rows", async () => {
  const history = comment(4, 3, { deleted_at: "2026-10-20", reply: "Removal reason" });
  const f = await loaded(page([comment(9, 4)], [comment(), history], { count: 3, more: true }));
  assert.deepEqual(plain(f.requests[0].payload.params), { offset: 0, limit: 10, product: false, myself: true });
  assert.equal(f.state.active_count, 2);
  f.state.fetchComments(false);
  assert.equal(f.requests[1].payload.params.offset, 10);
  assert.equal(f.requests[1].payload.params.myself, true);
  f.requests[1].resolve(page([comment(8, 5)], [comment(), history], { count: 3, offset: 20 })); await settle();
  assert.deepEqual(plain(f.state.comments.map((row) => row.id)), [10, 9, 8, 4]);
  assert.equal(f.state.active_count, 3);
  assert.equal(f.state.total, 3);
  assert.deepEqual(f.events.filter(([name]) => name === "count").map(([, count]) => count), [3, 3]);
});

test("failed loading and load-more retain their offset and data for a genuine retry", async () => {
  const f = fixture(); f.requests[0].reject(new Error("Internal transport detail")); await settle();
  assert.equal(f.state.loaded, false);
  assert.equal(f.state.busy_read, false);
  assert.match(f.state.read_error, /load_error_description/);
  f.state.fetchComments(f.state.failed_refresh);
  f.requests[1].resolve(page(undefined, undefined, { more: true })); await settle();
  f.state.fetchComments(false); f.requests[2].resolve({ error: true, error_msg: "Service unavailable" }); await settle();
  assert.equal(f.state.offset, 10);
  assert.equal(f.state.comments.length, 2);
  f.state.fetchComments(f.state.failed_refresh);
  assert.equal(f.requests[3].payload.params.offset, 10);
  assert.equal(f.requests[3].payload.params.myself, true);
});

test("own active comment selects Edit, deleted history permits Add and still supports owner editing", async () => {
  const f = await loaded(); f.state.openComposer();
  assert.equal(f.state.mode, "edit"); assert.equal(f.state.expanded_id, 10);
  const history = comment(4, 3, { deleted_at: "2026-10-20", reply: "Removal reason" });
  const old = await loaded(page([], [history], { count: 0 }));
  old.state.openComposer(); assert.equal(old.state.mode, "add");
  old.state.cancelEditor(); old.state.startEdit(history);
  assert.equal(old.state.mode, "edit");
  old.state.confirmDelete(history); assert.equal(old.state.mode, "edit");
  old.state.saveComment();
  assert.equal(old.requests.at(-1).method, "put");
  assert.equal(old.requests.at(-1).url, "/comment/4");
});

test("only current-user records from this article can be edited or deleted, even if the user owns the article", async () => {
  const f = await loaded(page([comment(9, 4), comment(8, 3, { article_id: 99 }), comment(7, 3, { user: { id: 5, name: "Mismatch" } })], []));
  assert.ok(!f.state.comments.some((row) => row.article_id === 99));
  for (const row of f.state.comments) {
    f.state.startEdit(row); f.state.confirmDelete(row); f.state.deleteComment(); f.state.saveComment();
  }
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.mode, "view");
  f.state.comments = [comment()]; f.state.loaded = true; f.state.confirmDelete(comment());
  f.state.session.user = { id: 8 };
  f.state.deleteComment();
  assert.equal(f.requests.length, 1, "A delayed confirmation rechecks the current user");
});

test("save validates nonempty text, preserves long accepted comments and merges updates without losing user identity", async () => {
  const f = await loaded(); f.state.startEdit(f.state.active_own);
  f.state.draft = "  "; f.state.saveComment(); assert.equal(f.requests.length, 1);
  const body = "Long accepted comment ".repeat(300);
  f.state.draft = body; f.state.saveComment();
  assert.equal(f.requests.length, 2);
  assert.deepEqual(plain(f.requests[1].payload), { comment_id: 10, body: body.trim() });
  const updated = { ...comment(), body: body.trim() }; delete updated.user;
  f.requests[1].resolve({ error: false, comment: updated }); await settle();
  assert.equal(f.state.comments.find((row) => row.id === 10).user.name, "Author 3");
  assert.equal(f.state.dirty, false);
  assert.equal(f.state.busy_write, false);
  assert.ok(f.events.some(([name, value]) => name === "dirty" && value === true));
  assert.deepEqual(f.events.filter(([name]) => name === "busy").map(([, value]) => value), [true, false]);
});

test("failed writes preserve draft and retry; creating and deleting use server counts and exact existing payloads", async () => {
  const f = await loaded(page([], [], { count: 0 })); f.state.openComposer(); f.state.draft = "My new comment";
  f.state.saveComment(); f.requests[1].resolve({ error: true, error_msg: "Please try again" }); await settle();
  assert.equal(f.state.draft, "My new comment"); assert.equal(f.state.dirty, true);
  f.state.saveComment();
  assert.equal(f.requests[2].url, "/article/12/comment");
  assert.deepEqual(plain(f.requests[2].payload), { body: "My new comment" });
  f.requests[2].resolve({ error: false, comment: comment(10, 3, { body: "My new comment" }), count: 6 }); await settle();
  assert.equal(f.state.total, 6); assert.equal(f.state.dirty, false);
  f.state.confirmDelete(f.state.active_own); f.state.deleteComment();
  assert.equal(f.requests[3].method, "delete"); assert.equal(f.requests[3].url, "/comment/10");
  f.requests[3].resolve({ success: true, comment: comment(10, 3, { deleted_at: "2026-10-28" }), count: 5 }); await settle();
  assert.equal(f.state.total, 5); assert.equal(f.state.comments.length, 0);
  assert.deepEqual(f.events.filter(([name]) => name === "count").map(([, count]) => count), [0, 6, 5]);
});

test("dirty close, Escape, refresh and opening another row use safe discard, with focus returning to that row", async () => {
  const f = await loaded(); let focused = 0;
  f.state.$refs.rowButtons = [{ dataset: { commentId: "10" }, focus() { focused++; } }];
  f.state.startEdit(f.state.active_own); f.state.draft = "Keep this draft";
  f.state.escapeEditor();
  assert.equal(f.state.discard_open, true); assert.equal(f.state.draft, "Keep this draft");
  f.state.discard_open = false; f.state.pending_action = null;
  assert.equal(f.state.dirty, true);
  f.state.requestRefresh(); assert.equal(f.requests.length, 1);
  f.state.discardChanges(); f.flush();
  assert.equal(f.requests.length, 2); assert.equal(f.state.dirty, false);
  f.requests[1].resolve(page()); await settle();
  f.state.startEdit(f.state.active_own); f.state.draft = "Changed"; f.state.cancelEditor(); f.state.discardChanges(); f.flush();
  assert.equal(focused, 1);
});

test("identity changes and teardown reject old reads, writes and pending discard actions", async () => {
  for (const change of ["article", "shop", "user", "unmount"]) {
    const f = await loaded(); f.state.startEdit(f.state.active_own); f.state.draft = "Changed"; f.state.saveComment();
    if (change === "unmount") f.component.beforeUnmount.call(f.state);
    else {
      if (change === "article") f.state.articleId = 13;
      if (change === "shop") f.state.shopId = 8;
      if (change === "user") f.state.session.user = { id: 8 };
      f.component.watch.identity.call(f.state);
    }
    f.requests[1].resolve({ comment: comment(10, 3, { body: "Old response" }), error: false }); await settle();
    assert.ok(!f.state.comments.some((row) => row.body === "Old response"), change);
    if (change === "unmount") assert.deepEqual(f.events.filter(([name]) => name === "busy").at(-1), ["busy", false]);
    else assert.equal(f.state.busy_write, false, change);
  }
  const f = fixture(); f.state.articleId = 13; f.component.watch.identity.call(f.state);
  f.requests[0].resolve(page()); await settle();
  assert.equal(f.state.comments.length, 0); assert.equal(f.state.busy_read, true);
  const pending = await loaded(); pending.state.startEdit(pending.state.active_own); pending.state.draft = "Changed"; pending.state.confirmDelete(pending.state.active_own);
  pending.state.shopId = 8; pending.component.watch.identity.call(pending.state); pending.state.discardChanges();
  assert.equal(pending.state.mode, "view");
});

test("disabled and busy controls cannot mutate, and duplicate clicks cannot submit twice", async () => {
  const f = await loaded(); f.state.startEdit(f.state.active_own); f.state.draft = "Changed";
  f.state.disabled = true; f.state.saveComment(); assert.equal(f.requests.length, 1);
  f.state.disabled = false; f.state.saveComment(); f.state.saveComment(); f.state.deleteComment(); f.state.fetchComments(true);
  assert.equal(f.requests.length, 2);
});

test("rendering escapes bodies/replies, preserves history reasons and associates row descriptions without moderation actions", async () => {
  const own = comment(10, 3, { body: '<script>unexpected()</script>', deleted_at: "2026-10-20", reply: '<img src=x onerror="unexpected()">' });
  const f = await loaded(page([comment(9, 4)], [own], { count: 1 })); f.state.toggleComment(own);
  const html = await render(f);
  assert.match(html, /&lt;script&gt;unexpected\(\)&lt;\/script&gt;/);
  assert.match(html, /&lt;img src=x onerror=/);
  assert.doesNotMatch(html, /<script\b|<img src="x"|PUT_SHOP|Approve|Spam/);
  assert.match(html, /global.article.workspace.comments_list.removal_reason/);
  assert.match(html, /sd-modern-status__dot--error/);
  assert.match(html, /aria-describedby="article-12-comment-10-excerpt article-12-comment-10-status article-12-comment-10-date"/);
  assert.match(html, /id="article-12-comment-10-excerpt"/);
  assert.match(html, /<button\b(?=[^>]*data-tooltip-activator="true")(?=[^>]*class="s-article-workspace-comments__open )[^>]*>/);
  assert.match(html, /hover-scale force-top/);
  assert.match(html, /October 28, 2026/);
  assert.match(html, /TIME:/);
});

test("rows and expanded details render their own date helpers without global date injections", async () => {
  const f = await loaded();
  f.state.toggleComment(f.state.active_own);
  const html = await render(f);
  assert.match(html, /<time[^>]*>October 28, 2026<\/time>/);
  assert.match(html, /TIME:2026-10-28T10:00:00Z/);
  assert.equal((html.match(/class="s-article-workspace-comments__entry(?:[ "])/g) || []).length, 2);
  assert.match(html, /s-article-workspace-comments__footer/);
});

test("excerpt help follows actual clipping and releases its ResizeObserver", () => {
  const f = fixture({ active: false }), values = [], element = { scrollHeight: 40, clientHeight: 40, scrollWidth: 100, clientWidth: 100 };
  const directive = f.component.directives.overflowCheck;
  directive.mounted(element, { value: (value) => values.push(value) });
  assert.equal(values.at(-1), false);
  element.scrollHeight = 80; f.observers[0].callback(); assert.equal(values.at(-1), true);
  element.scrollHeight = 40; directive.updated(element, { value: (value) => values.push(value) }); assert.equal(values.at(-1), false);
  directive.beforeUnmount(element); assert.equal(f.observers[0].disconnected, true);
  assert.equal(element._articleCommentOverflow, undefined);
});
