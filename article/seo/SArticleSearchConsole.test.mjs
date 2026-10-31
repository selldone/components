import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

// Deferred synthetic reads only; never contact Search Console or start authorization.
const filename = new URL("./SArticleSearchConsole.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename: filename.pathname });
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "search-console-test" });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content,
  filename: filename.pathname, id: "search-console-test", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const templateExports = {};
vm.runInNewContext(transpile(template.code), { exports: templateExports, require: (path) => path === "vue" ? Vue : { default: path } });
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const passthrough = { render() { return Vue.h("div", this.$attrs, this.$slots.default?.()); } };
const report = () => ({
  queries: [{ keys: "delivery%20guide", impressions: 42, clicks: 7, ctr: 0.16, position: 4 }],
  date: [{ keys: "2026-10-01", impressions: 42, clicks: 7, ctr: 0.16, position: 4 }],
  countries: [{ keys: "us", impressions: 42, clicks: 7, ctr: 0.16, position: 4 }],
  appearance: [{ keys: "video", impressions: 42, clicks: 7, ctr: 0.16, position: 4 }],
  domain: "example.test", page: "https://example.test/blog/delivery", start: "2026-10-01", end: "2026-10-28",
  queries_limit: 30, countries_limit: 30, cache: true,
});

function fixture(props = {}) {
  const exports = {}, requests = [], notices = [];
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports, window: {
      location: { href: "http://localhost/test" },
      ARTICLE_API: { GET_ARTICLE_SEO_AUDIT: (shop, article) => `/shop/${shop}/article/${article}/audit` },
      ADMIN_API: { GET_ARTICLE_SEO_AUDIT: (article) => `/admin/article/${article}/audit` },
    },
    axios: { get(url) {
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      requests.push({ url, resolve: (data) => resolve({ data }), reject });
      return promise;
    } },
    require(path) {
      if (path.includes("NotificationService")) return { default: { showLaravelError: (error) => notices.push(error) } };
      if (path.includes("DateConverter")) return { DateConverter: { ConvertTimestampToShortString: (value) => String(value) } };
      if (path === "numeral") return { default: (value) => ({ format: () => String(value) }) };
      return { default: passthrough };
    },
  });
  const component = exports.default;
  const state = { ...component.data(), workspace: true, shop: { id: 7, search_console: true }, article: { id: 12 }, ...props,
    $route: { params: { shop_id: 7 } }, $t: (key) => key, $vuetify: { locale: { isRtl: false } } };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  return { component, state, requests, notices };
}

async function render(f) {
  const app = Vue.createSSRApp({ ...f.component, created: undefined, beforeUnmount: undefined,
    data: () => Object.fromEntries(Object.keys(f.component.data()).map((key) => [key, f.state[key]])),
    render: templateExports.render,
  }, { workspace: f.state.workspace, article: f.state.article, shop: f.state.shop });
  Object.assign(app.config.globalProperties, {
    $t: f.state.$t, $route: f.state.$route,
    getCountryName: (code) => `Country ${code}`, getName: (value) => value,
    numeralFormat: (value) => String(value), $SEO: { CTRScore: () => 25 },
  });
  for (const tag of new Set(Array.from(descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g), ([, name]) => name))) if (tag !== "v-btn") app.component(tag, passthrough);
  app.component("flag", passthrough);
  app.component("apexchart", { props: ["series", "options"], render() { return Vue.h("div", { "data-chart": "performance" }); } });
  app.component("v-btn", { props: ["to", "disabled"], render() {
    return Vue.h(this.to ? "a" : "button", { ...this.$attrs, "data-route-name": this.to?.name, disabled: this.disabled }, this.$slots.default?.());
  } });
  return renderToString(app);
}

test("workspace presentation is opt-in, removes the duplicate brand title and safely discloses a bounded server reason", async () => {
  const f = fixture();
  assert.equal(f.component.props.workspace.default, false);
  f.state.error = true;
  f.state.error_msg = '<b>Local domain is unavailable</b><img src=x onerror="unexpected()">';
  const html = await render(f);
  assert.match(html, /s-article-search-console__notice/);
  assert.match(html, /global.article.search_console.unavailable_title/);
  assert.match(html, /<details[\s\S]*&lt;b&gt;Local domain is unavailable&lt;\/b&gt;/);
  assert.doesNotMatch(html, /<img\b|onerror="unexpected\(\)"|Google Search|py-16/);
  assert.match(html, /global.article.search_console.retry/);
  assert.doesNotMatch(html, /data-route-name=/);
  f.state.error_msg = "x".repeat(5000);
  assert.equal(f.state.error_detail.length, 4000);
});

test("Connect retains its exact existing Shop-panel gate and same-tab destination", async () => {
  for (const [shop, inPanel, expected] of [[{ id: 7, search_console: false }, true, true],
    [{ id: 7, search_console: true }, true, false], [{ id: 7, search_console: false }, false, false], [null, true, false]]) {
    const f = fixture({ shop }); f.state.error = true; f.state.$route.params = inPanel ? { shop_id: 7 } : {};
    assert.equal(f.state.can_connect, expected);
    const html = await render(f);
    assert.equal(html.includes('data-route-name="BPageShopSettingSeo"'), expected);
    assert.doesNotMatch(html, /target="_blank"/);
  }
});

test("successful reports keep the exact endpoint, metric series, all dimensions and real reporting period", async () => {
  const f = fixture();
  f.component.created.call(f.state);
  assert.equal(f.requests[0].url, "/shop/7/article/12/audit");
  f.requests[0].resolve(report()); await settle();
  assert.equal(f.state.busy, false);
  assert.equal(f.state.has_data, true);
  assert.deepEqual(plain(f.state.seriesHistory.map((series) => series.name)), ["Impressions", "Position", "CTR", "Clicks"]);
  assert.equal(f.state.seriesHistory[0].data[0].y, 42);
  for (const [tab, text] of [[0, "delivery guide"], [1, "Country us"], [2, "video"]]) {
    f.state.tab = tab;
    const html = await render(f);
    assert.match(html, /data-chart="performance"/);
    assert.match(html, /sd-modern-table/);
    assert.ok(html.includes(text));
    assert.match(html, /2026-10-01 – 2026-10-28/);
    assert.match(html, /global.article.search_console.keywords/);
  }
  f.state.page = null;
  const periodOnly = await render(f);
  assert.match(periodOnly, /2026-10-01 – 2026-10-28/);
  assert.doesNotMatch(periodOnly, /global.article.search_console.page/);
});

test("empty reports have a clear state, while a populated dimension retains chart and tabs even if another is empty", async () => {
  const f = fixture(); f.state.fetch();
  let html = await render(f);
  assert.match(html, /global.article.search_console.loading/);
  assert.doesNotMatch(html, /global.article.search_console.empty_title/);
  f.requests[0].resolve({ queries: [], countries: [], appearance: [], date: [] }); await settle();
  html = await render(f);
  assert.match(html, /global.article.search_console.empty_title/);
  assert.doesNotMatch(html, /data-chart="performance"/);
  f.state.fetch(); f.requests[1].resolve({ ...report(), queries: [], date: [] }); await settle();
  html = await render(f);
  assert.match(html, /data-chart="performance"/);
  assert.match(html, /global.article.search_console.empty_dimension/);
});

test("same-scope refresh keeps the chart and table mounted without inserting loading text, while failures show unavailable", async () => {
  const f = fixture(); f.state.fetch(); f.requests[0].resolve(report()); await settle();
  f.state.fetch();
  assert.equal(f.requests[1].url, f.requests[0].url);
  let html = await render(f);
  assert.doesNotMatch(html, /s-article-search-console__loading/);
  assert.match(html, /data-chart="performance"/);
  assert.match(html, /s-article-search-console__table/);
  assert.match(html, /delivery guide/);
  f.requests[1].resolve({ error: true, error_msg: "Search service temporarily unavailable" }); await settle();
  html = await render(f);
  assert.match(html, /Search service temporarily unavailable/);
  assert.doesNotMatch(html, /data-chart="performance"/);
  f.state.fetch();
  assert.equal(f.requests[2].url, "/shop/7/article/12/audit");
  f.requests[2].resolve(report()); await settle();
  assert.equal(f.state.error, false);
  assert.match(await render(f), /data-chart="performance"/);
});

test("workspace transport failures expose only server error_msg, with real retry and no Axios/config disclosure", async () => {
  const f = fixture(); f.state.fetch();
  f.requests[0].reject({ message: "Internal Axios detail", config: { note: "Internal config" }, response: { data: { error_msg: "Permission denied" } } });
  await settle();
  assert.equal(f.state.error, true);
  assert.equal(f.state.busy, false);
  const html = await render(f);
  assert.match(html, /Permission denied/);
  assert.doesNotMatch(html, /Internal Axios|Internal config/);
  assert.equal(f.notices.length, 0);
  f.state.fetch(); f.requests[1].reject(new Error("Private transport detail")); await settle();
  assert.equal(f.state.error_detail, "");
  assert.doesNotMatch(await render(f), /Private transport detail/);
});

test("resource switches, overlapping reads and teardown ignore stale reports without releasing the current busy guard", async () => {
  const f = fixture(); f.state.fetch(); f.requests[0].resolve(report()); await settle();
  f.state.fetch();
  f.state.article = { id: 13 }; f.component.watch.audit_scope.call(f.state);
  assert.equal(f.requests[2].url, "/shop/7/article/13/audit");
  assert.equal(f.state.has_data, false, "The prior article's data is cleared before the next read");
  const pending = await render(f);
  assert.match(pending, /global.article.search_console.loading/);
  assert.doesNotMatch(pending, /data-chart="performance"|delivery guide/);
  f.requests[1].resolve(report()); await settle();
  assert.equal(f.state.busy, true);
  assert.equal(f.state.has_data, false);
  f.requests[2].resolve({ ...report(), page: "https://example.test/blog/new" }); await settle();
  assert.equal(f.state.page, "https://example.test/blog/new");
  f.state.shop = { id: 8 }; f.component.watch.audit_scope.call(f.state);
  assert.equal(f.requests[3].url, "/shop/8/article/13/audit");
  f.component.beforeUnmount.call(f.state);
  f.requests[3].resolve(report()); await settle();
  assert.equal(f.state.has_data, false);
  f.state.fetch(); assert.equal(f.requests.length, 4);
});

test("legacy title, HTML error display, load behavior and admin endpoint remain available", async () => {
  const f = fixture({ workspace: false, shop: null });
  f.component.created.call(f.state);
  assert.equal(f.requests[0].url, "/admin/article/12/audit");
  f.requests[0].resolve({ error: true, error_msg: "<strong>Legacy reason</strong>" }); await settle();
  const html = await render(f);
  assert.match(html, /Google Search/);
  assert.match(html, /py-16/);
  assert.match(html, /<strong>Legacy reason<\/strong>/);
  assert.doesNotMatch(html, /s-article-search-console__notice/);
  f.state.fetch(); f.requests[1].reject(new Error("Legacy error")); await settle();
  assert.equal(f.notices.length, 1);
  f.state.fetch(); f.state.article = { id: 13 };
  f.component.watch.audit_scope.call(f.state);
  assert.equal(f.requests.length, 3, "Legacy prop changes retain the existing load-once behavior");
  f.requests[2].resolve(report()); await settle();
  assert.equal(f.state.busy, false, "A legacy prop change cannot leave an accepted read permanently busy");
});
