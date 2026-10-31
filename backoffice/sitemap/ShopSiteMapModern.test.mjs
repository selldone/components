import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

function fixture(file = "ShopSiteMapModern.vue") {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const { descriptor, errors } = parse(source, { filename: file });
  assert.deepEqual(errors, []);
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: file,
      id: "sitemap-test",
    }).errors,
    [],
  );
  const requests = [],
    pending = [],
    exports = {};
  const axios = {
    get: (...args) => {
      requests.push(args);
      return new Promise((resolve, reject) =>
        pending.push({ resolve, reject }),
      );
    },
  };
  const require = (name) =>
    name.includes("HtmlHelper")
      ? {
          StripTags: (value) =>
            typeof value === "string" ? value.replace(/<[^>]+>/g, "") : "",
        }
      : { default: {} };
  const output = ts.transpileModule(descriptor.script.content, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText;
  new Function("require", "exports", "axios", "window", output)(
    require,
    exports,
    axios,
    {
      API: {
        GET_MY_SHOP_CATEGORIES: (id) => `categories:${id}`,
        GET_SHOP_PAGES: (id) => `pages:${id}`,
      },
    },
  );
  const component = exports.default,
    state = {
      ...component.data(),
      shop: { id: 7, title: "Demo" },
      baseUrl: "https://store.example.test",
      modern: false,
    };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, get] of Object.entries(component.computed || {}))
    Object.defineProperty(state, name, { get: () => get.call(state) });
  return { component, state, requests, pending, descriptor, source };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("modern opt-in keeps legacy callers unchanged and never double-fetches", async () => {
  const legacy = fixture("ShopSiteMap.vue");
  legacy.state.modern = true;
  legacy.component.created.call(legacy.state);
  assert.deepEqual(legacy.requests, []);
  legacy.state.modern = false;
  legacy.component.created.call(legacy.state);
  assert.deepEqual(
    legacy.requests.map(([url]) => url),
    ["categories:7", "pages:7"],
  );
  legacy.pending[0].resolve({ data: { categories: [] } });
  legacy.pending[1].resolve({ data: { pages: [] } });
  await settle();

  const modern = fixture();
  modern.component.created.call(modern.state);
  assert.deepEqual(
    modern.requests.map(([url]) => url),
    ["categories:7", "pages:7"],
  );
  assert.equal(modern.requests[0][1].params.limit, 5);
  assert.equal(modern.requests[0][1].params.offset, 0);
  assert.equal(modern.requests[0][1].params.children, true);
  assert.equal(modern.requests[0][1].params.parent, true);
  assert.equal(modern.state.lists.categories.loading, true);
  modern.pending[0].resolve({ data: { categories: [], total: 0 } });
  modern.pending[1].resolve({ data: { pages: [], total: 0 } });
  await settle();
  assert.equal(modern.state.lists.categories.loading, false);
  assert.equal(modern.state.lists.categories.total, 0);
  assert.equal(modern.state.lists.categories.error, false);
});

test("preview limits both lists to five rows and preserves the real remaining count", async () => {
  for (const kind of ["categories", "pages"]) {
    const f = fixture();
    const first = f.state.loadList(kind);
    await f.state.loadList(kind);
    assert.equal(f.requests.length, 1);
    assert.equal(f.requests[0][1].params.offset, 0);
    assert.equal(f.requests[0][1].params.limit, 5);
    f.pending[0].resolve({
      data: {
        [kind]: Array.from({ length: 1000 }, (_, index) => ({
          id: index + 1,
          name: "item-" + (index + 1),
          title: "Item " + (index + 1),
          image: "image.webp",
          published: true,
          private_attributes: "not-used",
          ai_agent: "not-used",
        })),
        total: 1000,
      },
    });
    await first;
    assert.deepEqual(
      f.state.lists[kind].items.map(({ id }) => id),
      [1, 2, 3, 4, 5],
    );
    assert.equal(f.state.lists[kind].total, 1000);
    assert.equal(
      f.state.lists[kind].total - f.state.lists[kind].items.length,
      995,
    );
    assert.equal("private_attributes" in f.state.lists[kind].items[0], false);
    assert.equal("ai_agent" in f.state.lists[kind].items[0], false);

    const retry = f.state.loadList(kind);
    assert.equal(f.requests[1][1].params.offset, 0);
    assert.equal(f.requests[1][1].params.limit, 5);
    f.pending[1].resolve({ data: { [kind]: [{ id: 10 }], total: 1 } });
    await retry;
    assert.deepEqual(
      f.state.lists[kind].items.map(({ id }) => id),
      [10],
    );
    assert.equal(f.state.lists[kind].total, 1);
  }
});

test("business, network and malformed failures remain visible and retryable", async () => {
  const f = fixture();
  for (const result of [
    { data: { error: true } },
    { data: { success: false, categories: [] } },
    { data: { categories: null } },
  ]) {
    const request = f.state.loadList("categories");
    f.pending.at(-1).resolve(result);
    await request;
    assert.equal(f.state.lists.categories.error, true);
    assert.equal(f.state.lists.categories.total, null);
    assert.equal(f.state.lists.categories.loading, false);
  }
  const failed = f.state.loadList("categories");
  f.pending.at(-1).reject(new Error("offline"));
  await failed;
  assert.equal(f.state.lists.categories.error, true);
  const retry = f.state.loadList("categories");
  f.pending.at(-1).resolve({
    data: {
      categories: [
        {
          id: 8,
          title: "Category",
          icon: "icon.webp",
          products: 4,
          categories: 2,
        },
      ],
      total: 1,
    },
  });
  await retry;
  assert.equal(f.state.lists.categories.error, false);
  assert.equal(f.state.lists.categories.items[0].products, 4);
  assert.equal(f.state.lists.categories.items[0].categories, 2);
});

test("late results cannot leak between shops or update a closed sitemap", async () => {
  const f = fixture();
  f.component.created.call(f.state);
  f.state.shop = { id: 9 };
  f.component.watch["shop.id"].call(f.state);
  f.pending[0].resolve({ data: { categories: [{ id: 1 }], total: 1 } });
  f.pending[1].resolve({ data: { pages: [{ id: 2 }], total: 1 } });
  await settle();
  assert.deepEqual(f.state.lists.categories.items, []);
  assert.deepEqual(f.state.lists.pages.items, []);
  assert.deepEqual(
    f.requests.slice(2).map(([url]) => url),
    ["categories:9", "pages:9"],
  );
  f.component.beforeUnmount.call(f.state);
  f.pending[2].resolve({ data: { categories: [{ id: 3 }], total: 1 } });
  f.pending[3].reject(new Error("closed"));
  await settle();
  assert.deepEqual(f.state.lists.categories.items, []);
  const requestCount = f.requests.length;
  await f.state.loadList("pages");
  assert.equal(f.requests.length, requestCount);
});

test("root paths, unsafe schemes, publication and route placeholders retain honest links", () => {
  const f = fixture();
  f.state.baseUrl = "http://localhost:9000/@demo/?old=1#hash";
  assert.equal(f.state.rootUrl, "http://localhost:9000/@demo");
  assert.equal(f.state.sitemapUrl, "http://localhost:9000/@demo/sitemap");
  assert.equal(
    f.state.resourceHref("categories", { id: 1, name: "home & living" }),
    "http://localhost:9000/@demo/?dir=home%20%26%20living",
  );
  assert.equal(
    f.state.resourceHref("pages", { name: "hello/world", published: true }),
    "http://localhost:9000/@demo/pages/hello%2Fworld",
  );
  assert.equal(
    f.state.resourceHref("pages", { name: "draft", published: false }),
    "",
  );
  assert.equal(
    f.state.plainTitle("<strong>Plain</strong> title"),
    "Plain title",
  );
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "https://user:password@example.test",
    "invalid",
  ]) {
    f.state.baseUrl = value;
    assert.equal(f.state.rootUrl, "");
    assert.equal(f.state.sitemapUrl, "");
    assert.equal(f.state.resourceHref("categories", { id: 1 }), "");
  }
  const routes = f.state.routeGroups.flatMap(({ routes }) => routes);
  assert.deepEqual(
    routes.filter(({ pattern }) => pattern).map(({ path }) => path),
    ["/product/:id", "/blog/:id", "/blog/:slug-:id"],
  );
  for (const path of [
    "/",
    "/about-us",
    "/contact-us",
    "/blog",
    "/login",
    "/sitemap",
    "/faq",
    "/terms",
    "/privacy",
    "/user",
    "/avocado",
    "/hyper",
    "/community",
    "/listing",
  ])
    assert.ok(
      routes.some((route) => route.path === path),
      path,
    );
  assert.equal(f.source.includes("v-html"), false);
});

test("modern scoped styles compile without owning the application shell", async () => {
  const f = fixture();
  const style = await compileStyleAsync({
    source: f.descriptor.styles[0].content,
    filename: "ShopSiteMapModern.vue",
    id: "sitemap-test",
    scoped: true,
    preprocessLang: "scss",
  });
  assert.deepEqual(style.errors, []);
});
