import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";
import numeral from "numeral";

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
const searchHelpers = {};
vm.runInNewContext(transpile(readFileSync(new URL("./article-search-console.ts", import.meta.url), "utf8")), { exports: searchHelpers });
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
      if (path === "numeral") return { default: numeral };
      if (path === "./article-search-console") return searchHelpers;
      return { default: passthrough };
    },
  });
  const component = exports.default;
  const state = { ...component.data(), blog: false, workspace: true, shop: { id: 7, search_console: true }, article: { id: 12 }, ...props,
    $route: { params: { shop_id: 7 } }, $t: (key) => key, $vuetify: { locale: { isRtl: false } } };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  return { component, state, requests, notices, charts: [] };
}

async function render(f) {
  f.charts.length = 0;
  const app = Vue.createSSRApp({ ...f.component, created: undefined, beforeUnmount: undefined,
    data: () => Object.fromEntries(Object.keys(f.component.data()).map((key) => [key, f.state[key]])),
    render: templateExports.render,
  }, { blog: f.state.blog, workspace: f.state.workspace, article: f.state.article, shop: f.state.shop });
  Object.assign(app.config.globalProperties, {
    $t: f.state.$t, $route: f.state.$route,
    getCountryName: (code) => `Country ${code}`, getName: (value) => value,
    numeralFormat: (value) => String(value), $SEO: { CTRScore: () => 25 },
  });
  for (const tag of new Set(Array.from(descriptor.template.content.matchAll(/<([a-z][\w-]*-[\w-]+)/g), ([, name]) => name))) if (tag !== "v-btn") app.component(tag, passthrough);
  app.component("flag", passthrough);
  app.component("apexchart", { props: ["series", "options"], render() { f.charts.push({ series: this.series, options: this.options, key: this.$.vnode.key }); return Vue.h("div", { "data-chart": "performance" }); } });
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

test("Blog audit calculations preserve observed zero, missing fields and leading or internal calendar gaps", () => {
  const input = [
    { keys: "2026-10-04", clicks: "0", impressions: "0", position: null },
    { keys: "2026-10-02", clicks: "3", impressions: "30", ctr: 0.1, position: "2" },
    { keys: "2026-10-05", clicks: 1, impressions: 10, position: 4 },
  ];
  const original = JSON.stringify(input);
  const days = searchHelpers.searchDays(input);
  assert.deepEqual(plain(searchHelpers.searchTotals(days)), { clicks: 4, impressions: 40, ctr: 0.1, position: 2.5 });
  const points = searchHelpers.searchPoints(days, "clicks", "2026-10-01", "2026-10-06");
  assert.deepEqual(plain(points.map((point) => point.y)), [null, 3, null, 0, 1, null]);
  assert.equal(JSON.stringify(input), original);
  assert.equal(searchHelpers.searchDays([{ keys: "2026-02-30", clicks: 3 }]).length, 0);
  const missing = searchHelpers.searchDays([{ keys: "2026-10-01", clicks: null, impressions: 20 },
    { keys: "2026-10-02", clicks: 1, impressions: 10, position: 4 }]);
  assert.deepEqual(plain(searchHelpers.searchTotals(missing)), { clicks: null, impressions: 30, ctr: null, position: null });
  assert.deepEqual(plain(searchHelpers.searchTotals([])), { clicks: null, impressions: null, ctr: null, position: null });
  const invalid = searchHelpers.searchDays([{ keys: "2026-10-01", clicks: 2, impressions: 1, ctr: 0.5, position: 0 },
    { keys: "2026-10-02", ctr: 1.5, position: -1 }]);
  assert.deepEqual(plain(invalid.map(({ ctr, position }) => ({ ctr, position }))), [{ ctr: null, position: null }, { ctr: null, position: null }]);
  assert.equal(searchHelpers.searchTotals(invalid.slice(0, 1)).ctr, null);
  for (const value of [null, undefined, "", "bad", Infinity, -1]) assert.equal(searchHelpers.searchNumber(value), null);
});

test("Blog click shares use only returned rows and never replace unavailable clicks with zero", () => {
  const shares = searchHelpers.searchShares([{ keys: "us", clicks: "2" }, { keys: "gb", clicks: 1 }, { keys: "de", clicks: 0 }]);
  assert.equal(shares.total, 3);
  assert.deepEqual(plain(shares.rows.map((row) => row.share)), [2 / 3, 1 / 3, 0]);
  assert.equal(searchHelpers.searchShares([{ keys: "us", clicks: null }, { keys: "gb", clicks: 1 }]).total, null);
  assert.equal(searchHelpers.searchShares([{ keys: "us", clicks: 0 }]).rows[0].share, null);
});

test("Blog opt-in renders the approved metrics, selected daily line, scientific shares and every returned table dimension", async () => {
  const f = fixture({ blog: true, workspace: false, shop: null });
  assert.equal(f.component.props.blog.default, false);
  f.component.created.call(f.state);
  assert.equal(f.requests[0].url, "/admin/article/12/audit");
  f.requests[0].resolve({ ...report(), countries: [{ keys: "us", clicks: 6 }, { keys: "gb", clicks: 1 }] }); await settle();
  let html = await render(f);
  assert.match(html, /s-article-search-blog__header/);
  assert.match(html, /back_to_article/);
  assert.match(html, /returned_days/);
  assert.equal(f.charts.length, 5);
  assert.equal(f.charts.at(-1).options.chart.type, "line");
  assert.equal(f.charts.at(-1).options.chart.animations.enabled, false);
  assert.deepEqual(plain(f.charts.at(-1).series[0].data.map((point) => point.y)), [7, null]);
  assert.match(html, /s-article-search-blog__callout/);
  assert.match(html, /85\.71%/);
  assert.match(html, /distribution_hint/);
  assert.match(html, /delivery guide/);
  assert.doesNotMatch(html, /py-16|shadow-paper|u-progress-score/);
  const clicksChartKey = f.charts.at(-1).key;
  f.state.blogMetric = "ctr";
  f.state.blogDistribution = "appearance";
  f.state.tab = 2;
  html = await render(f);
  assert.match(html, /video/);
  assert.equal(f.charts.at(-1).series[0].data[0].y, 7 / 42);
  assert.equal(f.charts.at(-1).options.yaxis.labels.formatter(0.25), "25%");
  assert.notEqual(f.charts.at(-1).key, clicksChartKey, "Changing metric units must mount a new chart so the installed wrapper preserves formatter callbacks");
  f.state.blogMetric = "position";
  await render(f);
  assert.equal(f.charts.at(-1).options.yaxis.labels.formatter(7.3999999999999995), "7.4");
  const previousReportKey = f.charts.at(-1).key;
  f.component.watch.date.call(f.state);
  await render(f);
  assert.notEqual(f.charts.at(-1).key, previousReportKey, "A refreshed daily report must also preserve formatter callbacks");
  assert.equal(f.state.blogRowLimit, null);
  f.state.tab = 1;
  assert.match(await render(f), /Country us/);
  assert.equal(f.state.blogRowLimit, 30);
  assert.equal(f.state.rowLabel({ keys: "%E0%A4%A" }, "queries"), "%E0%A4%A");
  f.state.start = { invalid: true };
  f.state.end = 42;
  assert.doesNotMatch(await render(f), /s-article-search-blog__period/);
});

test("Blog missing article context never queries, then clears previous data on reset and ignores stale responses", async () => {
  const f = fixture({ blog: true, workspace: false, shop: null, article: null });
  f.component.created.call(f.state);
  assert.equal(f.requests.length, 0);
  assert.match(await render(f), /search_console.loading/);
  f.state.article = { id: 12 }; f.component.watch.audit_scope.call(f.state);
  f.requests[0].resolve(report()); await settle();
  assert.equal(f.state.has_data, true);
  f.state.fetch();
  f.state.article = null; f.component.watch.audit_scope.call(f.state);
  assert.equal(f.state.has_data, false);
  assert.equal(f.requests.length, 2);
  f.requests[1].resolve(report()); await settle();
  assert.equal(f.state.has_data, false);
  assert.equal(f.state.busy, false);
  assert.doesNotMatch(await render(f), /data-chart|delivery guide/);
});

test("Blog errors, null reports, empty dimensions and same-scope retries remain honest and safe", async () => {
  const f = fixture({ blog: true, workspace: false, shop: null });
  f.state.fetch(); f.requests[0].resolve({ error: true, error_msg: '<img src=x onerror="bad()">Local Search Console unavailable' }); await settle();
  let html = await render(f);
  assert.match(html, /Local Search Console unavailable/);
  assert.doesNotMatch(html, /<img src="x"|onerror="bad\(\)"|data-chart/);
  f.state.fetch(); f.requests[1].resolve({ queries: [], date: null, countries: [], appearance: [] }); await settle();
  assert.match(await render(f), /search_console.empty_title/);
  f.state.fetch(); f.requests[2].resolve({ ...report(), date: [], countries: [] }); await settle();
  html = await render(f);
  assert.match(html, /daily_empty/);
  assert.match(html, /distribution_empty/);
  assert.doesNotMatch(html, /data-chart/);
  f.state.fetch();
  assert.match(await render(f), /delivery guide/);
  f.requests[3].reject({ response: { data: { error_msg: "Permission denied" } }, config: { private: "not displayed" } }); await settle();
  html = await render(f);
  assert.match(html, /Permission denied/);
  assert.doesNotMatch(html, /not displayed/);
  for (const malformed of [null, {}, { message: "denied" }]) {
    f.state.fetch(); f.requests.at(-1).resolve(malformed); await settle();
    html = await render(f);
    assert.equal(f.state.error, true);
    assert.match(html, /unavailable_title/);
    assert.doesNotMatch(html, /data-chart|delivery guide|empty_title/);
  }
  f.state.fetch();
  f.requests.at(-1).resolve({ queries: [], date: [], countries: [], appearance: [] }); await settle();
  assert.equal(f.state.error, false);
  assert.match(await render(f), /search_console.empty_title/);
});
