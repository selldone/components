import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import ts from "typescript";

// Compile the real component; fixtures never bootstrap an app or contact a server.
const filename = fileURLToPath(new URL("./SArticleSeoEditor.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "article-seo-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "article-seo-test", compilerOptions: { bindingMetadata: compiled.bindings } });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({
  source: style.content, filename, id: "article-seo-test", scoped: style.scoped,
  preprocessLang: style.lang,
}).errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const passthrough = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
const score = { props: ["value"], render() { return Vue.h("i", { "data-score": this.value }); } };
const scriptExports = {}, templateExports = {};
vm.runInNewContext(transpile(descriptor.script.content), {
  exports: scriptExports,
  require: (name) => ({ default: name.includes("UProgressScore") ? score : passthrough }),
});
vm.runInNewContext(transpile(template.code), { exports: templateExports, require: () => Vue });
const component = scriptExports.default;
const plain = (value) => JSON.parse(JSON.stringify(value));
function fixture({ workspace = false, productWorkspace = false, disabled = false, image = "/article/cover.jpg", images = [] } = {}) {
  const events = [], scores = [], controls = [];
  const state = {
    ...component.data(), workspace, productWorkspace, disabled, images,
    article: { title: "Article title", description: "Saved summary", slug: "saved-slug", page_title: "Saved page title", image },
    $emit: (...args) => events.push(args),
    $nextTick(callback) { callback.call(this); },
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  const seo = Object.fromEntries(["GetPageURLScore", "GetPageTitleScore", "GetPageDescription"].map((key) => [key, (value) => { scores.push([key, value]); return 84; }]));
  return { state, events, scores, controls, seo };
}
async function render(f) {
  const data = Object.fromEntries(Object.keys(component.data()).map((key) => [key, f.state[key]]));
  const app = Vue.createSSRApp({ ...component, data: () => data, render: templateExports.render }, {
    workspace: f.state.workspace, productWorkspace: f.state.productWorkspace, disabled: f.state.disabled, article: f.state.article, images: f.state.images,
    onChange: () => f.events.push(["change"]),
  });
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.$SEO = f.seo;
  const field = { props: ["modelValue", "disabled", "label", "messages", "counter", "persistentCounter", "placeholder", "persistentPlaceholder"], emits: ["update:modelValue", "change"], render() {
    f.controls.push({ label: this.label, counter: this.counter, placeholder: this.placeholder,
      persistentCounter: this.persistentCounter,
      maxlength: this.$attrs.maxlength,
      update: (value) => this.$emit("update:modelValue", value), change: () => this.$emit("change") });
    return Vue.h("label", { "data-label": this.label }, [this.label,
      Vue.h("input", { value: this.modelValue, disabled: this.disabled }),
      Vue.h("small", this.messages), this.$slots["append-inner"]?.()]);
  } };
  for (const name of ["VExpandTransition", "VScaleTransition", "VAvatar", "VImg", "VIcon", "VBtn", "VCard"]) app.component(name, passthrough);
  app.component("VTextField", field);
  app.component("VTextarea", field);
  return renderToString(app);
}

test("workspace is opt-in and legacy remains a collapsed SEO summary", async () => {
  assert.equal(component.props.workspace.default, false);
  assert.equal(component.props.disabled.default, false);
  const f = fixture();
  component.mounted.call(f.state);
  let html = await render(f);
  assert.match(html, /article-edit-placeholder/);
  assert.match(html, /s--shadow-no-padding/);
  assert.doesNotMatch(html, /<input/);
  assert.equal(f.events.length, 0);
  f.state.openMenu();
  html = await render(f);
  assert.match(html, /data-label="URL"/);
  assert.equal((html.match(/data-score=/g) || []).length, 3);
  assert.deepEqual(plain(f.events), [["open-menu"]]);
});

test("workspace opens with search details, informational counters and no legacy SEO scores", async () => {
  const f = fixture({ workspace: true });
  f.state.refresh();
  const html = await render(f);
  assert.match(html, /s--article-seo-editor--workspace/);
  assert.match(html, /sd-modern-underlined-field/);
  assert.doesNotMatch(html, /article-edit-placeholder|s--shadow-no-padding|absolute-top-start|absolute-top-end/);
  assert.match(html, /global.article.workspace.url_slug/);
  assert.match(html, /global.article.workspace.page_title/);
  assert.match(html, /global.article.workspace.meta_description/);
  assert.match(html, /global.article.workspace.search_details/);
  assert.match(html, /global.article.workspace.search_details_hint/);
  assert.match(html, /global.article.workspace.meta_description_hint/);
  assert.deepEqual(f.scores, []);
  assert.doesNotMatch(html, /data-score=/);
  assert.deepEqual(f.controls.map(({ counter }) => counter), ["128", "128", "256"]);
  assert.ok(f.controls.every(({ persistentCounter }) => persistentCounter === true), "Workspace counters remain visible without input focus");
  assert.ok(f.controls.every(({ maxlength }) => maxlength === undefined), "Counters do not truncate metadata");
  assert.equal(f.controls[1].placeholder, "Article title");
  component.mounted.call(f.state);
  assert.deepEqual(plain(f.events), [["open-menu"]]);
  component.watch.images.call(f.state);
  assert.deepEqual(plain(f.events), [["open-menu"]], "An image refresh does not request images again");
});

test("Product metadata explains product URL and title semantics while Blog retains article guidance", async () => {
  const product = fixture({ workspace: true, productWorkspace: true });
  product.state.refresh();
  const html = await render(product);
  assert.match(html, /add_product.description_modern.description_slug_hint/);
  assert.match(html, /add_product.description_modern.product_page_title_hint/);
  assert.equal(product.controls[1].placeholder, undefined, "A product title fallback must not imply the description heading");
  const blog = fixture({ workspace: true });
  blog.state.refresh();
  const blogHtml = await render(blog);
  assert.match(blogHtml, /global.article.workspace.url_hint/);
  assert.match(blogHtml, /global.article.workspace.page_title_hint/);
  assert.equal(blog.controls[1].placeholder, "Article title");
  assert.equal(component.props.productWorkspace.default, false);
});

test("workspace model updates change the article draft immediately without blur or a save request", async () => {
  const f = fixture({ workspace: true });
  f.state.refresh();
  await render(f);
  const [slug, title, description] = f.controls;
  slug.update("live-slug");
  title.update("");
  description.update("A live summary");
  assert.equal(f.state.article.slug, "live-slug");
  assert.equal(f.state.article.page_title, "", "Empty page title preserves the article-title fallback");
  assert.equal(f.state.article.description, "A live summary");
  assert.deepEqual(plain(f.events), [["change"], ["change"], ["change"]]);
  slug.change();
  assert.equal(f.events.length, 3, "Blur does not duplicate a workspace model update");

  const legacy = fixture();
  legacy.state.refresh();
  legacy.state.opened = true;
  await render(legacy);
  legacy.controls[0].update("legacy-slug");
  assert.equal(legacy.state.article.slug, "saved-slug", "Legacy fields retain their change-event timing");
  legacy.controls[0].change();
  assert.equal(legacy.state.article.slug, "legacy-slug");
});

test("field and cover changes retain the article mutation and change-event contract", () => {
  const f = fixture({ workspace: true, images: ["/article/second.jpg"] });
  f.state.refresh();
  Object.assign(f.state, { slug: "new-slug", page_title: "New page title", description: "New summary" });
  f.state.onChange();
  assert.deepEqual(plain(f.state.article), { title: "Article title", slug: "new-slug", page_title: "New page title", description: "New summary", image: "/article/cover.jpg" });
  f.state.onSelectImage("/article/second.jpg");
  assert.equal(f.state.article.image, "/article/second.jpg");
  assert.deepEqual(plain(f.events), [["change"], ["change"]]);
});

test("disabled editors cannot mutate article data or cover selection", async () => {
  for (const workspace of [false, true]) {
    const f = fixture({ workspace, disabled: true });
    f.state.refresh();
    f.state.opened = true;
    const before = plain(f.state.article), cover = f.state.coverImage;
    Object.assign(f.state, { slug: "forbidden", page_title: "Forbidden", description: "Forbidden" });
    f.state.onChange();
    f.state.onSelectImage("/forbidden.jpg");
    assert.deepEqual(plain(f.state.article), before);
    assert.equal(f.state.coverImage, cover);
    assert.deepEqual(f.events, []);
    assert.equal((await render(f)).match(/<input\b[^>]*\bdisabled/g)?.length, 3);
  }
});

test("workspace image refresh never inserts a missing cover or displays invalid entries", () => {
  const empty = fixture({ workspace: true, image: undefined });
  empty.state.article.image = undefined;
  empty.state.refresh();
  assert.deepEqual(empty.state.images, []);
  assert.equal(empty.state.hasImage, false);
  const f = fixture({ workspace: true, image: null, images: [undefined, "/article/first.jpg"] });
  f.state.refresh();
  assert.deepEqual(plain(f.state.displayImages), ["/article/first.jpg"]);
  assert.equal(f.state.coverImage, "/article/first.jpg");
  assert.equal(f.state.article.image, null, "Refresh alone does not save an automatic cover choice");
});

test("workspace image choices include the current cover once without mutating supplied images", async () => {
  const images = ["/article/second.jpg", "/article/cover.jpg", "/article/second.jpg"];
  const f = fixture({ workspace: true, images });
  f.state.refresh();
  assert.deepEqual(plain(f.state.displayImages), ["/article/second.jpg", "/article/cover.jpg"]);
  assert.deepEqual(images, ["/article/second.jpg", "/article/cover.jpg", "/article/second.jpg"]);
  const html = await render(f);
  assert.equal((html.match(/<button\b/g) || []).length, 2, "Image options use native keyboard-accessible buttons");
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /global.article.workspace.sharing_image_hint/);
  const moves = [], inspections = [];
  const scroll = { querySelector: () => ({ getBoundingClientRect: () => ({ left: 400, right: 490 }) }),
    getBoundingClientRect: () => ({ left: 0, right: 300 }), scrollBy: (options) => moves.push(options) };
  f.state.$refs = { workspaceCovers: { $refs: { scroll }, onScroll: (value) => inspections.push(value) } };
  f.state.onSelectImage("/article/second.jpg");
  assert.equal(f.state.article.image, "/article/second.jpg", "The chosen sharing image remains the article cover");
  assert.deepEqual(plain(f.state.displayImages), ["/article/second.jpg", "/article/cover.jpg"], "Choosing a cover does not reorder the image strip");
  assert.deepEqual(plain(moves), [{ left: 190, behavior: "auto" }], "Only the image strip scrolls to reveal an offscreen selection");
  assert.equal(inspections[0], scroll, "Existing fade-scroll arrows refresh after selection");
});

test("workspace shows useful guidance when there are no article images", async () => {
  const f = fixture({ workspace: true, image: null });
  f.state.refresh();
  const html = await render(f);
  assert.match(html, /global.article.workspace.no_article_images/);
  assert.match(html, /global.article.workspace.no_article_images_hint/);
  assert.doesNotMatch(html, /<button\b/);
  assert.equal(f.state.article.image, null);
  assert.deepEqual(f.events, []);
});

test("replacing the workspace article refreshes all editable metadata without emitting a save", () => {
  const f = fixture({ workspace: true });
  f.state.refresh();
  f.state.article = { slug: "second", page_title: null, description: null, image: null };
  component.watch.article.call(f.state);
  assert.equal(f.state.slug, "second");
  assert.equal(f.state.page_title, null);
  assert.equal(f.state.description, "");
  assert.deepEqual(f.events, []);
});
