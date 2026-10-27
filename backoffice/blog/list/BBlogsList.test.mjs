import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

// Exercise list orchestration with synthetic promises; never contact a shop API.
const filename = new URL("./BBlogsList.vue", import.meta.url).pathname;
const source = readFileSync(new URL("./BBlogsList.vue", import.meta.url), "utf8");
const { descriptor, errors } = parse(source, { filename });
assert.deepEqual(errors, []);
const compiledScript = compileScript(descriptor, { id: "blog-list-test" });
assert.deepEqual(
  compileTemplate({
    source: descriptor.template.content,
    filename,
    id: "blog-list-test",
    compilerOptions: { bindingMetadata: compiledScript.bindings },
  }).errors,
  [],
);
for (const style of descriptor.styles) {
  assert.deepEqual(
    compileStyle({
      source: style.content,
      filename,
      id: "blog-list-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    }).errors,
    [],
  );
}
const script = ts.transpileModule(descriptor.script.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const article = (id, categoryId = 12) => ({
  id,
  parent_id: id + 100,
  title: `Article ${id}`,
  parent: { category: { id: categoryId, category: `Category ${categoryId}` } },
});

function fixture({ modern = true } = {}) {
  const requests = [], notices = [];
  const blog = {
    optimize() { return this; },
    cancellation() { return this; },
    list(...args) {
      const request = { args };
      const promise = new Promise((resolve, reject) => {
        request.resolve = resolve;
        request.reject = reject;
      });
      requests.push(request);
      return {
        cache(callback) {
          request.cached = callback;
          return promise;
        },
      };
    },
  };
  const exports = {};
  vm.runInNewContext(script, {
    exports,
    require: (name) => {
      if (name.includes("NotificationService")) {
        return { default: { showLaravelError: (error) => notices.push(error) } };
      }
      if (name === "lodash-es") return { throttle: (callback) => callback };
      return { default: {} };
    },
    window: { SERACH_THROTTLE: 0, $backoffice: { blog } },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    modern,
    shop: { id: 7 },
    $t: (key) => key,
    $vuetify: { display: { width: 1200, mdAndUp: true, xs: false } },
  };
  for (const [name, method] of Object.entries(component.methods)) {
    state[name] = method.bind(state);
  }
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  }
  component.created.call(state);
  return { component, state, requests, notices };
}

{
  const f = fixture();
  f.state.page = 4;
  f.state.search = "Coffee";
  f.state.cluster_id = 23;
  f.state.sortBy = [{ key: "views", order: "asc" }];
  f.state.filterCategory({ id: 12, category: "Coffee guides", icon: "category.jpg" });
  assert.equal(f.state.page, 1, "A category click returns to the first result page");
  assert.equal(f.state.busy_fetch, true);
  assert.deepEqual(plain(f.requests[0].args), [
    7, 0, 10,
    { search: "Coffee", sortBy: "views", sortDesc: false, cluster_id: 23, category_id: 12 },
  ]);
  f.requests[0].resolve({ articles: [article(1)], total: 31 });
  await settle();
  assert.equal(f.state.totalItems, 31, "Use the server total, not this page's row count");
  assert.equal(f.state.pageCount, 4);
  assert.deepEqual(plain(f.state.articles), [article(1)]);
  assert.equal(f.state.busy_fetch, false);
  assert.equal(f.state.fetch_error, false);

  f.state.page = 3;
  f.state.filterCategory(null);
  assert.equal(f.state.page, 1);
  assert.equal(f.state.category, null);
  assert.deepEqual(plain(f.requests[1].args), [
    7, 0, 10,
    { search: "Coffee", sortBy: "views", sortDesc: false, cluster_id: 23 },
  ], "Clearing only the category preserves search, cluster and ordering");
  f.requests[1].resolve({ articles: [], total: 0 });
  await settle();
  assert.equal(f.state.totalItems, 0);
  assert.equal(f.state.pageCount, 0);
}

for (const [order, expected] of [["asc", false], ["desc", true], [false, false], [true, true]]) {
  const f = fixture();
  f.state.itemsPerPage = 10;
  f.state.category = { id: 12, category: "Coffee" };
  f.state.fetchArticles(3, "updated_at", order);
  assert.equal(f.requests[0].args[1], 20, "Pagination requests a server offset");
  assert.equal(f.requests[0].args[2], 10);
  assert.equal(f.requests[0].args[3].sortDesc, expected, `Normalize ${String(order)} ordering to a boolean`);
  assert.equal(f.requests[0].args[3].category_id, 12);
  f.requests[0].resolve({ articles: [article(3)], total: 23 });
  await settle();
  assert.equal(f.state.pageCount, 3);
}

{
  const f = fixture();
  f.state.articles = [article(5)];
  f.state.totalItems = 1;
  f.state.refreshArticles();
  f.state.filterCategory({ id: 13, category: "New selection" });
  const oldRequest = f.requests[0], currentRequest = f.requests[1];
  oldRequest.cached({ articles: [article(99)], total: 999 });
  assert.deepEqual(plain(f.state.articles), [article(5)]);
  oldRequest.resolve({ articles: [article(98)], total: 998 });
  await settle();
  assert.deepEqual(plain(f.state.articles), [article(5)]);
  assert.equal(f.state.totalItems, 1);
  assert.equal(f.state.busy_fetch, true, "An older completion cannot end the current loading state");
  currentRequest.cached({ articles: [article(6, 13)], total: 22 });
  assert.equal(f.state.totalItems, 22);
  assert.equal(f.state.busy_fetch, true);
  currentRequest.resolve({ articles: [article(7, 13)], total: 21 });
  await settle();
  assert.deepEqual(plain(f.state.articles), [article(7, 13)]);
  assert.equal(f.state.totalItems, 21);
  assert.equal(f.state.busy_fetch, false);
}

{
  const f = fixture();
  f.state.refreshArticles();
  f.state.filterCategory({ id: 13, category: "Current selection" });
  f.requests[0].reject(new Error("Stale request failed"));
  await settle();
  assert.equal(f.state.fetch_error, false);
  assert.equal(f.state.busy_fetch, true);
  assert.equal(f.notices.length, 0, "A stale request cannot show an error for a current selection");
  f.requests[1].resolve({ articles: [article(7, 13)], total: 1 });
  await settle();
  assert.equal(f.state.busy_fetch, false);
}

{
  const f = fixture();
  f.state.search = "Guide";
  f.state.cluster_id = 23;
  f.state.category = { id: 12, category: "Coffee" };
  f.state.sortBy = [{ key: "comments_count", order: "desc" }];
  f.state.articles = [article(5)];
  f.state.totalItems = 1;
  f.state.refreshArticles();
  const failure = new Error("Network unavailable");
  f.requests[0].reject(failure);
  await settle();
  assert.equal(f.state.busy_fetch, false);
  assert.equal(f.state.fetch_error, true);
  assert.equal(f.notices[0], failure);
  assert.deepEqual(plain(f.state.articles), [article(5)], "Failure retains the last successful data");

  f.state.refreshArticles();
  assert.equal(f.state.fetch_error, false);
  assert.equal(f.state.busy_fetch, true);
  assert.deepEqual(plain(f.requests[1].args[3]), {
    search: "Guide", sortBy: "comments_count", sortDesc: true, cluster_id: 23, category_id: 12,
  }, "Retry preserves the selected query");
  f.requests[1].resolve({ articles: [article(6)], total: 6 });
  await settle();
  assert.equal(f.state.fetch_error, false);
  assert.equal(f.state.busy_fetch, false);
  assert.equal(f.state.totalItems, 6);
}

{
  const f = fixture();
  f.state.search = "Old query";
  f.state.cluster_id = 23;
  f.state.category = { id: 12, category: "Coffee" };
  f.state.page = 4;
  f.state.clearFilters();
  assert.equal(f.state.hasFilters, false);
  assert.equal(f.state.page, 1);
  assert.deepEqual(plain(f.requests[0].args), [
    7, 0, 10, { search: "", sortBy: "updated_at", sortDesc: true, cluster_id: null },
  ]);
  f.requests[0].resolve({ articles: [], total: 0 });
  await settle();

  f.state.page = 3;
  f.state.search = "New query";
  f.component.watch.search.call(f.state, "New query", "");
  assert.equal(f.state.page, 1);
  assert.equal(f.requests[1].args[1], 0);
  f.requests[1].resolve({ articles: [], total: 0 });
  await settle();
}

{
  const f = fixture();
  f.state.filterCategory({ id: 12, category: "Previous shop" });
  f.state.shop = { id: 8 };
  f.component.watch["shop.id"].call(f.state);
  assert.equal(f.state.category, null, "A category belongs to the previous shop");
  assert.equal(f.state.totalItems, 0);
  assert.deepEqual(plain(f.state.articles), []);
  assert.equal(f.requests[1].args[0], 8);
  f.requests[0].resolve({ articles: [article(99)], total: 99 });
  await settle();
  assert.deepEqual(plain(f.state.articles), []);
  assert.equal(f.state.busy_fetch, true);
  f.requests[1].resolve({ articles: [article(8)], total: 1 });
  await settle();
  assert.deepEqual(plain(f.state.articles), [article(8)]);

  f.state.refreshArticles();
  f.component.beforeUnmount.call(f.state);
  f.requests[2].cached({ articles: [article(98)], total: 98 });
  f.requests[2].resolve({ articles: [article(97)], total: 97 });
  await settle();
  assert.deepEqual(plain(f.state.articles), [article(8)], "Unmounted lists ignore late responses");
}

{
  const modern = fixture();
  assert.deepEqual(plain(modern.state.sortBy), [{ key: "updated_at", order: "desc" }]);
  assert.deepEqual(plain(modern.state.sortOptions.map(({ value }) => value)), [
    "title", "updated_at", "user_id", "parent_id", "published", "power", "comments_count", "views",
  ], "Narrow layouts retain all existing sortable fields");
  const legacy = fixture({ modern: false });
  assert.deepEqual(plain(legacy.state.sortBy), [], "Other shared-list callers retain their initial sorting");
}

console.log("BBlogsList: source compilation and isolated category, query, pagination, request-race and retry checks passed.");
