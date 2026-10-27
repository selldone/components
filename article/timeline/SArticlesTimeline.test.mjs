import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import ts from "typescript";

// Compile the real SFC and exercise synthetic HTTP promises; never boot or contact an application.
const filename = fileURLToPath(new URL("./SArticlesTimeline.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiledScript = compileScript(descriptor, { id: "timeline-test" });
const template = compileTemplate({
  source: descriptor.template.content, filename, id: "timeline-test",
  compilerOptions: { bindingMetadata: compiledScript.bindings },
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  assert.deepEqual(compileStyle({
    source: style.content, filename, id: "timeline-test", scoped: style.scoped,
    preprocessLang: style.lang,
  }).errors, []);
}
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const script = transpile(descriptor.script.content);
const templateExports = {};
vm.runInNewContext(transpile(template.code), {
  exports: templateExports,
  require: (name) => { assert.equal(name, "vue"); return Vue; },
});
const types = {
  Blog: { code: "shop-blog", color: "green" },
  Product: { code: "product", color: "blue" },
  SelldoneBlog: { code: "blog", color: "pink" },
  SelldoneHelp: { code: "help", color: "orange" },
  Company: { code: "company", color: "gray" },
};
const article = (id, schedule_at, parent_type = "shop-blog") => ({
  id, schedule_at, parent_type, parent_id: id + 100,
  title: `Article ${id}`, description: `Description ${id}`,
  image: null, updated_at: "2026-03-01T12:00:00Z",
});
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));

function fixture({ modern = true, type = "shop-blog", shopId = 7, vendorId, vendorPanel = false, currentArticleId } = {}) {
  const requests = [], notices = [];
  const language = { full_locale: "en-US", calendar: { calendar: "gregory" } };
  const exports = {};
  const axios = {
    get(url) {
      assert.equal(typeof url, "string", "Only a supported endpoint may be requested");
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      requests.push({ url, resolve, reject });
      return promise;
    },
  };
  vm.runInNewContext(script, {
    exports, axios, Intl, Date,
    require(name) {
      if (name === "@selldone/core-js") return { Article: { Types: types } };
      if (name.includes("NotificationService")) return { default: {
        showErrorAlert: (...args) => notices.push(args),
        showLaravelError: (...args) => notices.push(args),
      } };
      return { default: {} };
    },
    window: {
      $language: language,
      ARTICLE_API: { GET_SHOP_ARTICLES_TIMELINE: (id) => `/shop/${id}/timeline` },
      VAPI: { GET_MY_VENDOR_SHOP_ARTICLES_TIMELINE: (id) => `/vendor/${id}/timeline` },
      ADMIN_API: { GET_SAMIN_ARTICLES_TIMELINE: () => "/admin/timeline" },
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(), modern, articleType: type, shopId, currentArticleId,
    $route: { params: { vendor_id: vendorId }, matched: [{ meta: { vendor: vendorPanel } }] },
    $vuetify: { display: { mdAndDown: false } },
    $t: (key) => key,
    $n: (value) => String(value),
    convertToLocalTime: (value) => value ? new Date(value.date || value) : null,
    getLocalTimeString: (value) => value || "",
    getProductImage: (id) => `/products/${id}.jpg`,
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(state, name, { enumerable: true, get: () => getter.call(state) });
  }
  return { component, state, requests, notices, language };
}
function scopeChanged(f, key) {
  const watcher = f.component.watch[key];
  const handler = typeof watcher === "object" ? watcher.handler : watcher;
  assert.ok(handler, `${key} invalidates the request scope`);
  return typeof handler === "string" ? f.state[handler]() : handler.call(f.state);
}
async function render(f) {
  const passthrough = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { slots }) { return () => Vue.h("div", null, [slots.label?.(), slots.default?.()]); },
  });
  const button = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) { return () => Vue.h("button", {
      disabled: attrs.disabled,
      "data-route": attrs.to?.name,
      "data-parent": attrs.to ? Object.values(attrs.to.params || {})[0] : undefined,
    }, slots.default?.()); },
  });
  const tooltip = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { slots }) { return () => Vue.h("span", null,
      slots.activator ? slots.activator({ props: {} }) : slots.default?.()); },
  });
  const data = { ...f.state }, props = {};
  for (const name of Object.keys(f.component.props)) { props[name] = data[name]; delete data[name]; }
  const globals = {};
  for (const name of Object.keys(data).filter((name) => name.startsWith("$"))) {
    globals[name] = data[name];
    delete data[name];
  }
  const app = Vue.createSSRApp({ props: f.component.props, data: () => data, render: templateExports.render }, props);
  Object.assign(app.config.globalProperties, globals);
  for (const name of ["VTimeline", "VTimelineItem", "VAvatar", "VIcon", "VImg", "ULoadingProgress", "UTextValueDashed"]) app.component(name, passthrough);
  app.component("VBtn", button);
  app.component("VTooltip", tooltip);
  app.component("RouterLink", button);
  return renderToString(app);
}

assert.equal(fixture().component.props.modern.default, false, "Shared timeline modernization is opt-in");
for (const [type, vendorId, vendorPanel, expected] of [
  ["shop-blog", undefined, false, "/shop/7/timeline"],
  ["product", undefined, false, "/shop/7/timeline"],
  ["shop-blog", 23, true, "/vendor/23/timeline"],
  ["product", 23, true, "/vendor/23/timeline"],
  ["shop-blog", 23, false, "/shop/7/timeline"],
  ["blog", 23, true, "/admin/timeline"],
  ["help", undefined, false, "/admin/timeline"],
]) {
  const f = fixture({ type, vendorId, vendorPanel });
  f.component.created.call(f.state);
  assert.equal(f.requests[0].url, expected);
  assert.equal(f.state.busy, true);
  f.requests[0].resolve({ data: { timeline: [] } });
  await settle();
  assert.equal(f.state.busy, false);
  assert.equal(f.state.load_error, false, "A successfully loaded empty queue is not an error");
}

for (const modern of [true, false]) {
  const f = fixture({ modern, currentArticleId: 12 });
  for (const [type, name, parameter] of [
    ["shop-blog", "BPageShopBlogsEdit", "blog_id"],
    ["product", "ProductAdmin_EditArticle", "product_id"],
    ["blog", "Blog", "blog_id"],
    ["help", "OPageHelp", "help_id"],
  ]) {
    assert.deepEqual(plain(f.state.getArticleLink(article(12, "2026-10-28T10:00:00Z", type))), {
      name, params: { [parameter]: 112 },
    });
  }
  assert.equal(f.state.getArticleLink(article(12, "2026-10-28T10:00:00Z", "company")), null);
  f.state.timeline = [article(12, "2026-10-28T10:00:00Z"), article(13, "2026-10-28T11:00:00Z", "product")];
  const html = await render(f);
  const buttons = html.match(/<button\b[^>]*>/g) || [];
  assert.match(buttons.find((tag) => tag.includes('data-parent="112"')) || "", /\sdisabled(?:\s|>)/,
    "The current article action stays disabled");
  assert.doesNotMatch(buttons.find((tag) => tag.includes('data-parent="113"')) || "", /\sdisabled(?:\s|>)/,
    "Other records retain their normal action");
  assert.ok(html.includes("Description 12"));
}

{
  const previousTimezone = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const f = fixture();
    const records = [
      article(9, "2026-03-08T04:30:00Z"),
      article(4, "2026-03-08T06:30:00Z", "product"),
      article(20, "2026-03-08T07:30:00Z", "help"),
    ];
    f.state.timeline = records;
    assert.deepEqual(plain(f.state.timelineGroups.map(({ key }) => key)), ["2026-3-7", "2026-3-8"],
      "Grouping follows the local day, not the UTC date or fixed 24-hour buckets");
    assert.deepEqual(plain(f.state.timelineGroups.map(({ articles }) => articles.map(({ id }) => id))), [[9], [4, 20]],
      "Grouping preserves server order, past dates and non-blog entries");
    assert.equal(f.state.timelineGroups[0].date, records[0].schedule_at);
    const options = { weekday: "long", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" };
    for (const entry of records) assert.equal(f.state.formatTimelineDate(entry.schedule_at, options),
      new Intl.DateTimeFormat("en-US", { ...options, calendar: "gregory" }).format(new Date(entry.schedule_at)));
    f.language.full_locale = "fa-IR";
    f.language.calendar.calendar = "persian";
    assert.equal(f.state.formatTimelineDate(records[0].schedule_at, options),
      new Intl.DateTimeFormat("fa-IR", { ...options, calendar: "persian" }).format(new Date(records[0].schedule_at)),
      "Visible dates use the application's selected locale and calendar");
    f.state.timeline = [article(1, "2025-11-01T12:00:00Z"), article(2, "2026-11-01T12:00:00Z"), article(3, "invalid"), article(4, "invalid")];
    assert.equal(f.state.timelineGroups.length, 4, "Year boundaries and invalid records must not collapse unrelated entries");
    assert.deepEqual(plain(f.state.timelineGroups.slice(2).map(({ key }) => key)), ["invalid-3", "invalid-4"]);
    assert.equal(f.state.formatTimelineDate("invalid", options), "—");
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
}

for (const failure of ["network", "api", "malformed"]) {
  const f = fixture();
  f.state.timeline = [article(1, "2026-01-01T10:00:00Z")];
  const loading = f.state.fetchData();
  if (failure === "api") f.requests[0].resolve({ data: { error: true, error_msg: "Denied" } });
  else if (failure === "malformed") f.requests[0].resolve({ data: { timeline: {} } });
  else f.requests[0].reject(new Error("Network unavailable"));
  await loading;
  assert.equal(f.state.busy, false);
  assert.equal(f.state.load_error, true, "Rejected and failed API reads remain distinct from an empty queue");
  const html = await render(f);
  assert.ok(html.includes('role="alert"'), "A failed read provides an accessible visible error");
  const retry = f.state.fetchData();
  assert.equal(f.state.busy, true);
  assert.equal(f.state.load_error, false);
  f.requests[1].resolve({ data: { timeline: [] } });
  await retry;
  assert.equal(f.state.load_error, false);
  assert.deepEqual(plain(f.state.timeline), []);
}

{
  const f = fixture({ type: "unsupported" });
  await f.state.fetchData();
  assert.equal(f.requests.length, 0, "An unknown timeline type must not request an invalid URL");
  assert.equal(f.state.busy, false);
  assert.equal(f.state.load_error, true);
}

{
  const f = fixture();
  const old = f.state.fetchData(), current = f.state.fetchData();
  f.requests[0].resolve({ data: { timeline: [article(99, "2026-10-01T10:00:00Z")] } });
  await old;
  assert.equal(f.state.busy, true);
  assert.deepEqual(plain(f.state.timeline), []);
  f.requests[1].resolve({ data: { timeline: [article(2, "2026-10-02T10:00:00Z")] } });
  await current;
  assert.equal(f.state.timeline[0].id, 2);
  const stale = f.state.fetchData(), latest = f.state.fetchData();
  f.requests[2].reject(new Error("Obsolete failure"));
  await stale;
  assert.equal(f.state.load_error, false);
  assert.equal(f.state.busy, true);
  assert.equal(f.notices.length, 0);
  f.requests[3].resolve({ data: { timeline: [] } });
  await latest;
}

for (const key of ["shopId", "articleType", "$route.params.vendor_id"]) {
  const f = fixture({ vendorId: 23, vendorPanel: key === "$route.params.vendor_id" });
  const old = f.state.fetchData();
  f.state.timeline = [article(1, "2026-01-01T10:00:00Z")];
  if (key === "shopId") f.state.shopId = 8;
  if (key === "articleType") f.state.articleType = "help";
  if (key === "$route.params.vendor_id") f.state.$route.params.vendor_id = 24;
  scopeChanged(f, key);
  assert.deepEqual(plain(f.state.timeline), [], "A new request scope clears the previous scope's records");
  assert.equal(f.requests[1].url, key === "shopId" ? "/shop/8/timeline" : key === "articleType" ? "/admin/timeline" : "/vendor/24/timeline");
  f.requests[0].resolve({ data: { timeline: [article(99, "2026-10-01T10:00:00Z")] } });
  await old;
  assert.deepEqual(plain(f.state.timeline), []);
  f.requests[1].resolve({ data: { timeline: [article(8, "2026-10-02T10:00:00Z")] } });
  await settle();
  assert.equal(f.state.timeline[0].id, 8);
}

{
  const f = fixture();
  const loading = f.state.fetchData();
  f.component.beforeUnmount.call(f.state);
  f.requests[0].resolve({ data: { timeline: [article(99, "2026-10-01T10:00:00Z")] } });
  await loading;
  assert.deepEqual(plain(f.state.timeline), [], "Unmounted timelines ignore late completions");
  assert.equal(f.notices.length, 0);
}

console.log("SArticlesTimeline: SFC compilation, routing/current record, local-day/calendar/DST grouping, read lifecycle, error/retry and scope-race checks passed.");
