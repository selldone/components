import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import vm from "node:vm";
import { baseParse, compile } from "@vue/compiler-dom";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BProductsWindow.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const syntax = ts.createSourceFile(
  "window.ts",
  descriptor.script.content,
  ts.ScriptTarget.Latest,
  true,
);
const options = syntax.statements.find(ts.isExportAssignment).expression;
const section = (name) =>
  options.properties
    .find((property) => property.name?.getText(syntax) === name)
    ?.initializer.getText(syntax);
const componentCode = ts.transpileModule(
  `export default { props: ${section("props")}, data: ${section("data")}, computed: ${section("computed")}, methods: ${section("methods")}, watch: ${section("watch")}, mounted: ${options.properties
    .find((p) => p.name?.getText(syntax) === "mounted")
    .getText(syntax)
    .replace(/^mounted\(\)/, "function()")}, beforeUnmount: ${options.properties
    .find((p) => p.name?.getText(syntax) === "beforeUnmount")
    .getText(syntax)
    .replace(/^beforeUnmount\(\)/, "function()")} }`,
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
const breadcrumbs = {};
vm.runInNewContext(
  ts.transpileModule(
    readFileSync(
      new URL(
        "../breadcrumbs/helper/BProductBreadcrumbsHelper.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText,
  { exports: breadcrumbs },
);
const fragments = {};
function findFragments(node) {
  if (
    node.props?.some(
      (p) =>
        p.type === 6 && p.name === "id" && p.value?.content === "manage-panel",
    )
  )
    fragments.catalog = node.loc.source;
  if (
    node.tag === "v-menu" &&
    node.props.some(
      (p) => p.name === "model" && p.exp?.content === "showProductMenu",
    )
  )
    fragments.menu = node.loc.source;
  for (const child of node.children || []) findFragments(child);
}
findFragments(baseParse(descriptor.template.content));
assert.ok(fragments.catalog && fragments.menu);
const render = Object.fromEntries(
  Object.entries(fragments).map(([name, source]) => [
    name,
    new Function(
      "Vue",
      compile(source, { mode: "function", prefixIdentifiers: true }).code,
    )({
      ...Vue,
      resolveComponent: (name) => ({ name }),
      withDirectives: (node, directives) => {
        node.testDirectives = directives;
        return node;
      },
    }),
  ]),
);
const helpers = [
  [
    String.prototype,
    "limitWords",
    function (n) {
      return this.split(" ").slice(0, n).join(" ");
    },
  ],
  [
    Array.prototype,
    "toggle",
    function (value) {
      const index = this.indexOf(value);
      if (index < 0) this.push(value);
      else this.splice(index, 1);
      return this;
    },
  ],
];
const originals = helpers.map(([object, name]) =>
  Object.getOwnPropertyDescriptor(object, name),
);
helpers.forEach(([object, name, value]) =>
  Object.defineProperty(object, name, { configurable: true, value }),
);
after(() =>
  helpers.forEach(([object, name], index) =>
    originals[index]
      ? Object.defineProperty(object, name, originals[index])
      : delete object[name],
  ),
);
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const prop = (node, name) =>
  node.props?.[name] ??
  node.props?.[name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
function nodes(node, name, found = [], ancestors = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => nodes(child, name, found, ancestors));
    return found;
  }
  if (!node || typeof node !== "object") return found;
  if (name === undefined || node.type === name || node.type?.name === name)
    found.push({ node, ancestors });
  if (Array.isArray(node.children))
    nodes(node.children, name, found, [...ancestors, node]);
  else if (node.children && typeof node.children === "object")
    for (const slot of Object.values(node.children))
      if (typeof slot === "function")
        nodes(slot(), name, found, [...ancestors, node]);
  return found;
}
const product = (id) => ({
  id,
  title: `Product ${id}`,
  type: "PHYSICAL",
  category_id: 10,
  status: "Open",
  icon: "product.svg",
  note: [],
});
const category = (id) => ({
  id,
  title: `Category ${id}`,
  name: `category-${id}`,
  icon: "category.svg",
  note: [],
  is_empty: false,
});
function fixture({
  modern = true,
  mini = false,
  vendor = false,
  display = "lg",
  selectedList = [],
  set = null,
} = {}) {
  const requests = [],
    emitted = [],
    calls = [],
    routes = [],
    listeners = {},
    notifications = [];
  const sdk = (scope) => ({
    optimize(ttl) {
      this.ttl = ttl;
      return this;
    },
    cancellation() {
      return this;
    },
    list(id, offset, limit, params) {
      let resolve, reject;
      const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
      promise.cache = (callback) => {
        requests.at(-1).cached = callback;
        return promise;
      };
      requests.push({
        scope,
        id,
        offset,
        limit,
        params,
        ttl: this.ttl,
        resolve,
        reject,
      });
      return promise;
    },
  });
  const exports = {};
  vm.runInNewContext(componentCode, {
    exports,
    clearTimeout,
    Slugify: { apply: (value) => value },
    Category: {},
    Product: {},
    BProductBreadcrumbsHelper: breadcrumbs.BProductBreadcrumbsHelper,
    ScrollHelper: {
      scrollToElement: (...args) =>
        calls.push({ name: "scrollToElement", args }),
    },
    ProductStatus: Object.fromEntries(
      ["Open", "Close", "Pending", "Rejected", "Unlisted"].map((code) => [
        code,
        { code, name: code },
      ]),
    ),
    ProductType: Object.fromEntries(
      ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
        code,
        { code },
      ]),
    ),
    ShopURLs: {
      GetProductLink: () => "/local/product",
      GetCategoryLink: () => "/local/category",
    },
    BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } },
    ShopPermissionRegions: { PRODUCTS: { code: "PRODUCTS" } },
    isObject: (value) => value !== null && typeof value === "object",
    window: {
      $backoffice: { product: sdk("shop") },
      $vendor: { product: sdk("vendor") },
    },
    document: {
      activeElement: { tagName: "BODY" },
      addEventListener: (name, listener) => {
        listeners[name] = listener;
      },
      removeEventListener: (name) => {
        delete listeners[name];
      },
    },
    NotificationService: {
      showLaravelError: (error) => notifications.push(error),
    },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(
    Object.entries(component.props).map(([name, value]) => [
      name,
      value.default ?? (value.type?.name === "Boolean" ? false : undefined),
    ]),
  );
  const state = {
    ...defaults,
    ...component.data(),
    modern,
    mini,
    set,
    shop: {
      id: 7,
      model: "PHYSICAL",
      marketplace: { product: true, category: true },
    },
    vendor: vendor ? { id: 4 } : null,
    $route: {
      name: vendor ? "VPageVendorProducts" : "BPageShopProductsList",
      query: {},
      params: vendor ? { vendor_id: 4 } : {},
      matched: [{ meta: { vendor } }],
    },
    $vuetify: {
      display: {
        lgAndUp: display === "lg",
        md: display === "md",
        sm: display === "sm",
      },
    },
    $store: { getters: { getCopyProduct: null, getCutProduct: null } },
    $refs: {},
    $emit: (name, ...args) => emitted.push({ name, args }),
    $router: { push: (route) => routes.push(route) },
    $t: (key) => key,
    $nextTick: (callback) => callback(),
    writeShopAccess: () => true,
    getShopImagePath: (value) => value,
    numeralFormat: (value) => String(value),
    IMAGE_SIZE_SMALL: 64,
    products: Array.from({ length: 8 }, (_, index) => product(index + 101)),
    products_count: 19,
    folders: Array.from({ length: 9 }, (_, index) => category(index + 11)),
    selected_products: [],
    selectedList,
    multiSelectProducts: true,
    draggable: true,
    showNotes: false,
    addProductButton: false,
    canSelectProduct: true,
    withFullVariant: true,
    withProductTranslations: true,
    withCategoryTranslations: true,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  const view = () => render.catalog(state, []);
  const spy = (name) => {
    state[name] = (...args) => calls.push({ name, args });
  };
  return {
    state,
    component,
    requests,
    emitted,
    calls,
    routes,
    listeners,
    notifications,
    view,
    spy,
  };
}

test("catalog template and component-scoped presentation Sass compile", () => {
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: file.pathname,
      id: "list-view-test",
    }).errors,
    [],
  );
  for (const style of descriptor.styles.filter((style) => !style.src))
    assert.deepEqual(
      compileStyle({
        source: style.content,
        filename: file.pathname,
        id: "data-v-list-view-test",
        scoped: style.scoped,
        preprocessLang: style.lang,
      }).errors,
      [],
    );
});

test("modern catalog groups never animate browsing in either view or loading state", () => {
  for (const modern of [false, true])
    for (const mini of [false, true])
      for (const busy of [false, true])
        for (const page of [1, 2]) {
          const f = fixture({ modern, mini });
          f.state.busy_fetch = busy;
          f.state.product_page = page;
          const [group] = nodes(f.view(), "v-fade-transition");
          assert.ok(group);
          assert.equal(
            prop(group.node, "disabled"),
            modern || (busy && page !== 1),
          );
        }
});

test("the list renderer opts in only for modern large mode, including existing vendor callers", () => {
  for (const modern of [false, true])
    for (const mini of [false, true])
      for (const vendor of [false, true]) {
        const f = fixture({ modern, mini, vendor }),
          tree = f.view();
        const products = nodes(
          tree,
          `b-product-window-product-${mini ? "mini" : "large"}`,
        );
        const categories = nodes(
          tree,
          `b-product-window-category-${mini ? "mini" : "large"}`,
        );
        assert.equal(products.length, 8);
        assert.equal(categories.length, mini ? 9 : 8);
        assert.equal(
          nodes(tree, `b-product-window-product-${mini ? "large" : "mini"}`)
            .length,
          0,
        );
        for (const { node } of [...products, ...categories])
          assert.equal(Boolean(prop(node, "modernList")), modern && !mini);
        for (const entries of [categories, products])
          entries.forEach(({ ancestors }, index) => {
            const column = ancestors.findLast(
              (node) => node.type?.name === "v-col",
            );
            assert.equal(
              prop(column, "style")?.["--b-products-list-row"],
              modern && !mini ? index + 4 : undefined,
            );
          });
        if (!mini)
          for (const { node } of products)
            assert.equal(prop(node, "multiSelectProducts"), true);
        else
          for (const { node } of [...products, ...categories])
            assert.equal(prop(node, "modernList"), undefined);
      }
});

test("normal pages use eight categories locally and the current server product page without another slice", () => {
  const f = fixture();
  assert.equal(f.state.max_folders_per_page, 8);
  assert.equal(f.state.max_products_per_page, 8);
  f.state.folder_page = 2;
  f.state.product_page = 2;
  const tree = f.view();
  assert.deepEqual(
    nodes(tree, "b-product-window-category-large").map(
      ({ node }) => prop(node, "category").id,
    ),
    [19],
  );
  assert.deepEqual(
    nodes(tree, "b-product-window-product-large").map(
      ({ node }) => prop(node, "product").id,
    ),
    [101, 102, 103, 104, 105, 106, 107, 108],
  );
  assert.equal(f.requests.length, 0);
  for (const [display, size] of [
    ["lg", 48],
    ["md", 24],
    ["sm", 16],
    ["xs", 12],
  ]) {
    const mini = fixture({ mini: true, display });
    assert.equal(mini.state.max_folders_per_page, size);
    assert.equal(mini.state.max_products_per_page, size);
  }
});

test("shared item tracks restart on each native page with the modern move target above the grid", () => {
  const f = fixture();
  f.state.folder_page = 2;
  f.state.product_page = 3;
  f.state.show_spirit_container = true;
  const tree = f.view(),
    columns = nodes(tree, "v-col");
  assert.equal(columns[0].node.key, "f19");
  assert.equal(columns.some(({ node }) => node.key === "drop-box"), false);

  const descendants = node => [node, ...(node.children || []).flatMap(descendants)];
  const elements = descendants(baseParse(descriptor.template.content));
  const helper = elements.find(node => node.tag === "v-slide-y-transition" && node.loc.source.includes("products_select.modern.holder.title"));
  const catalog = elements.find(node => node.props?.some(p => p.name === "id" && p.value?.content === "manage-panel"));
  const presentation = descriptor.template.content.slice(helper.loc.start.offset, catalog.loc.end.offset);
  const renderPresentation = new Function("Vue", compile(presentation, { mode: "function", prefixIdentifiers: true }).code)({
    ...Vue, resolveComponent: name => ({ name }), withDirectives: node => node,
  });
  f.state.held_items.push(f.state.products[0]);
  f.state.$n = value => String(value);
  const rendered = renderPresentation(f.state, []), all = nodes(rendered);
  const move = nodes(rendered, "u-drop").find(({ node }) => prop(node, "class")?.includes("b-products-window__holder-target"));
  assert.ok(move, "The held product has a move destination above the item tracks");
  assert.equal(move.ancestors.some(node => node.type?.name === "v-col"), false);
  assert.ok(all.findIndex(({ node }) => node === move.node) < all.findIndex(({ node }) => prop(node, "id") === "manage-panel"));

  const legacy = fixture({ modern: false });
  legacy.state.show_spirit_container = true;
  assert.equal(nodes(legacy.view(), "v-col")[0].node.key, "drop-box");
  const category = nodes(tree, "b-product-window-category-large")[0];
  const categoryColumn = category.ancestors.findLast(
    (node) => node.type?.name === "v-col",
  );
  assert.equal(categoryColumn.key, "f19");
  assert.equal(prop(categoryColumn, "style")["--b-products-list-row"], 4);
  for (const [index, entry] of nodes(
    tree,
    "b-product-window-product-large",
  ).entries()) {
    const column = entry.ancestors.findLast(
      (node) => node.type?.name === "v-col",
    );
    assert.equal(column.key, f.state.products[index].id);
    assert.equal(prop(column, "style")["--b-products-list-row"], index + 4);
    assert.equal(prop(entry.node, "product"), f.state.products[index]);
  }
  assert.equal(f.state.folder_page, 2);
  assert.equal(f.state.product_page, 3);
  assert.equal(f.requests.length, 0);
});

test("products-only layout follows returned categories only in the modern normal catalog", () => {
  for (const modern of [false, true])
    for (const mini of [false, true])
      for (const set of [null, "spec"])
        for (const count of [0, 1])
          for (const context of [
            { query: {}, filters: [], search: null },
            { query: { types: "PHYSICAL" }, filters: [], search: null },
            {
              query: { types: "FILE", search: "guide" },
              filters: ["Open", "FILE"],
              search: "guide",
            },
          ]) {
            const f = fixture({ modern, mini, set });
            f.state.folders = Array.from({ length: count }, (_, index) =>
              category(index + 11),
            );
            f.state.$route.query = context.query;
            f.state.filters = context.filters;
            f.state.search = context.search;
            const expected = modern && !mini && set !== "spec" && count === 0;
            assert.equal(f.state.list_products_only, expected);
            f.state.busy_fetch = true;
            f.state.products = [];
            f.state.products_count = 0;
            assert.equal(
              f.state.list_products_only,
              expected,
              "Loading and product count do not hide returned categories",
            );
            assert.equal(f.state.$route.query, context.query);
            assert.equal(f.state.filters, context.filters);
            assert.equal(f.state.search, context.search);
            assert.equal(f.requests.length, 0);
          }
});

test("products-only catalog retains native paging and selection when categories return", () => {
  const f = fixture();
  f.state.folders = [];
  f.state.folder_page = 2;
  f.state.product_page = 2;
  f.state.filters = ["Open", "PHYSICAL"];
  f.state.search = "Product";
  f.state.selected_products = [101];
  let tree = f.view();
  assert.equal(f.state.list_products_only, true);
  assert.equal(nodes(tree, "b-product-window-category-large").length, 0);
  assert.equal(nodes(tree, "b-product-window-product-large").length, 8);
  const pagers = nodes(tree, "v-pagination");
  assert.equal(pagers.length, 1, "No category or duplicate product pager");
  assert.equal(prop(pagers[0].node, "length"), 3);
  assert.equal(prop(pagers[0].node, "modelValue"), 2);
  pagers[0].node.props["onUpdate:modelValue"](3);
  const select = nodes(tree, "input").find(
    ({ node }) =>
      node.props["aria-label"] ===
      "product_panel.workspace.list_view.select_page",
  ).node;
  select.props.onChange({ target: { checked: true } });
  assert.deepEqual(
    Array.from(f.state.selected_products),
    f.state.products.map((item) => item.id),
  );
  f.state.busy_fetch = true;
  assert.equal(prop(nodes(f.view(), "v-pagination")[0].node, "disabled"), true);
  f.state.busy_fetch = false;
  f.state.folders = Array.from({ length: 9 }, (_, index) =>
    category(index + 11),
  );
  tree = f.view();
  assert.equal(f.state.list_products_only, false);
  assert.equal(nodes(tree, "b-product-window-category-large").length, 1);
  assert.equal(nodes(tree, "v-pagination").length, 2);
  assert.equal(f.state.folder_page, 2);
  assert.equal(f.state.product_page, 3);
  assert.equal(f.state.products_count, 19);
  assert.equal(f.state.search, "Product");
  assert.deepEqual(f.state.filters, ["Open", "PHYSICAL"]);
  assert.deepEqual(
    Array.from(f.state.selected_products),
    f.state.products.map((item) => item.id),
  );
  assert.equal(f.requests.length, 0);
});

test("the original Back action stays available once in empty leaf categories", () => {
  for (const count of [0, 1])
    for (const parent of [null, category(30)]) {
      const f = fixture();
      f.state.folders = Array.from({ length: count }, (_, index) =>
        category(index + 11),
      );
      const back = () =>
        nodes(f.view(), "button").filter(({ node }) =>
          String(node.props?.class || "")
            .split(/\s+/)
            .includes("b-products-window__back"),
        );
      assert.equal(
        back().length,
        0,
        "Global filtered views have no parent action",
      );
      f.state.parent_folders = { ...category(40), parent };
      assert.equal(back().length, 1);
      assert.equal(back()[0].node.props.disabled, false);
      f.spy("selectFolder");
      back()[0].node.props.onClick({});
      assert.equal(f.calls.at(-1).name, "selectFolder");
      assert.equal(f.calls.at(-1).args[0], parent);
      f.state.busy_fetch = true;
      assert.equal(back()[0].node.props.disabled, true);
      assert.equal(f.requests.length, 0);
    }
});

test("native category/product pagers keep their group, position and independent page models in every view", () => {
  for (const modern of [false, true])
    for (const mini of [false, true]) {
      const f = fixture({ modern, mini });
      f.state.folders = Array.from(
        { length: f.state.max_folders_per_page + 1 },
        (_, index) => category(index + 11),
      );
      f.state.products_count = f.state.max_products_per_page * 2 + 1;
      const pagers = nodes(f.view(), "v-pagination");
      assert.equal(pagers.length, 2, "Each group owns one native pager");
      const grouped = {};
      for (const kind of ["categories", "products"]) {
        const entries = pagers.filter(({ ancestors }) =>
          ancestors.some((node) =>
            String(node.props?.class || "")
              .split(/\s+/)
              .includes(`b-products-window__${kind}`),
          ),
        );
        assert.equal(entries.length, 1, `${kind} has no duplicate pager`);
        const { node, ancestors } = entries[0];
        grouped[kind] = node;
        assert.equal(prop(node, "modelValue"), 1);
        assert.equal(prop(node, "length"), kind === "categories" ? 2 : 3);
        const group = ancestors.find((ancestor) =>
          String(ancestor.props?.class || "")
            .split(/\s+/)
            .includes(`b-products-window__${kind}`),
        );
        const order = nodes(group).map(({ node }) =>
          typeof node.type === "string" ? node.type : node.type?.name,
        );
        const row = `b-product-window-${kind === "categories" ? "category" : "product"}-${mini ? "mini" : "large"}`;
        if (modern && !mini) {
          assert.ok(order.indexOf("h2") >= 0);
          assert.ok(order.indexOf("h2") < order.indexOf("v-pagination"));
          assert.ok(order.indexOf("v-pagination") < order.indexOf(row));
          assert.equal(
            node.props["aria-label"],
            `product_panel.workspace.list_view.${kind}`,
          );
        } else {
          assert.ok(order.lastIndexOf(row) < order.indexOf("v-pagination"));
        }
      }
      assert.equal(Boolean(prop(grouped.products, "disabled")), false);
      grouped.categories.props["onUpdate:modelValue"](2);
      assert.equal(f.state.folder_page, 2);
      assert.equal(f.state.product_page, 1);
      assert.equal(f.requests.length, 0);
      grouped.products.props["onUpdate:modelValue"](3);
      assert.equal(f.state.folder_page, 2);
      assert.equal(f.state.product_page, 3);
      f.spy("fetchData");
      f.component.watch.product_page.call(f.state);
      f.component.watch.max_products_per_page.call(f.state);
      assert.deepEqual(
        f.calls.map((call) => call.name),
        ["fetchData", "fetchData"],
      );
      assert.equal(f.component.watch.folder_page, undefined);
      f.state.busy_fetch = true;
      const productPager = nodes(f.view(), "v-pagination").find(
        ({ ancestors }) =>
          ancestors.some((node) =>
            String(node.props?.class || "")
              .split(/\s+/)
              .includes("b-products-window__products"),
          ),
      ).node;
      assert.equal(prop(productPager, "disabled"), true);
    }
});

test("zero, single and multiple category/product pages control pager visibility independently", () => {
  const visible = ({ node, ancestors }) =>
    [node, ...ancestors].every(
      (ancestor) =>
        !ancestor.testDirectives?.some(
          ([directive, value]) => directive === Vue.vShow && !value,
        ),
    );
  for (const modern of [false, true])
    for (const mini of [false, true])
      for (const [categoryPages, productPages] of [
        [0, 0],
        [1, 1],
        [2, 0],
        [0, 3],
        [2, 3],
      ]) {
        const f = fixture({ modern, mini });
        f.state.folders = Array.from(
          { length: categoryPages * f.state.max_folders_per_page },
          (_, index) => category(index + 11),
        );
        f.state.products_count = productPages * f.state.max_products_per_page;
        const pagers = nodes(f.view(), "v-pagination").filter(visible);
        for (const [kind, count] of [
          ["categories", categoryPages],
          ["products", productPages],
        ]) {
          const groupPagers = pagers.filter(({ ancestors }) =>
            ancestors.some((node) =>
              String(node.props?.class || "")
                .split(/\s+/)
                .includes(`b-products-window__${kind}`),
            ),
          );
          assert.equal(
            groupPagers.length,
            count > 1 ? 1 : 0,
            `${kind}: ${count} pages`,
          );
        }
        assert.equal(f.requests.length, 0);
      }
});

test("modern folder navigation never requests scrolling in either view, while legacy browsing keeps its scroll", () => {
  for (const modern of [false, true])
    for (const mini of [false, true])
      for (const vendor of [false, true])
        for (const set of [null, "spec"]) {
          const f = fixture({ modern, mini, vendor, set });
          f.component.watch.current_dir_id.call(f.state);
          assert.deepEqual(
            f.calls,
            modern
              ? []
              : [
                  {
                    name: "scrollToElement",
                    args: ["#sort_tools", 0, "smooth"],
                  },
                ],
          );
          if (f.state.isSpecImport) continue;
          for (const folder of [category(10), null])
            f.state.selectFolder(folder);
          assert.deepEqual(plain(f.routes.map((route) => route.query)), [
            { dir: 10, "no-scroll": true },
            { "no-scroll": true },
          ]);
        }
});

test("every modern breadcrumb preserves scroll without changing named routes, hierarchy or current-folder guards", () => {
  for (const modern of [false, true])
    for (const vendor of [false, true])
      for (const dialogMode of [false, true]) {
        const f = fixture({ modern, vendor });
        f.state.dialogMode = dialogMode;
        f.state.parent_folders = {
          ...category(14),
          parent: {
            ...category(13),
            parent: { ...category(12), parent: category(11) },
          },
        };
        const items = plain(f.state.hierarchy_items);
        assert.deepEqual(
          items.map((item) => item.to.query.dir),
          ["", 11, 12, 13, 14],
        );
        assert.deepEqual(
          items.map((item) => item.disabled),
          [false, false, false, false, true],
        );
        for (const item of items) {
          assert.equal(item.to.query["no-scroll"], modern || dialogMode);
          assert.equal(
            item.to.name,
            dialogMode
              ? undefined
              : vendor
                ? "VPageVendorProducts"
                : "BPageShopProductsList",
          );
        }
      }
});

test("removing the last type restores folder browsing and preserves other filters and query state", async () => {
  for (const mini of [false, true])
    for (const dir of [undefined, "10"]) {
      const f = fixture({ mini });
      f.state.$route.query = {
        types: "PHYSICAL",
        "no-scroll": "true",
        dir,
        search: "plant",
      };
      f.state.current_dir_id = dir ? 10 : null;
      f.state.filters = ["Open", "PHYSICAL", "VIRTUAL"];
      f.state.folders = [];
      f.state.product_page = 3;
      f.state.folder_page = 2;

      // The shared selector removes only the closed chip before notifying its caller.
      f.state.filters = ["Open", "VIRTUAL"];
      f.state.onFilterChange();
      assert.deepEqual(plain(f.routes[0].query.types), ["VIRTUAL"]);
      assert.equal(
        f.requests.length,
        0,
        "The route watcher owns the updated read",
      );
      f.state.$route.query = f.routes[0].query;
      f.component.watch["$route.query"].call(f.state, f.state.$route.query);
      assert.deepEqual(plain(f.requests[0].params.types), ["VIRTUAL"]);
      assert.deepEqual(plain(f.state.filters), ["Open", "VIRTUAL"]);

      f.state.filters = ["Open"];
      f.state.onFilterChange();
      const query = f.routes[1].query;
      assert.equal(query.types, undefined);
      assert.equal(query.dir, dir);
      assert.equal(query.search, "plant");
      assert.equal(query["no-scroll"], "true");
      f.state.$route.query = query;
      f.component.watch["$route.query"].call(f.state, query);
      assert.equal(f.state.product_page, 1);
      assert.equal(f.state.folder_page, 1);
      const request = f.requests.at(-1);
      assert.deepEqual(plain(request.params.types), []);
      assert.deepEqual(plain(request.params.statuses), ["Open"]);
      assert.equal(request.params.dir, dir ? 10 : null);
      assert.equal(request.params.products_only, false);
      assert.equal(request.params.with_parent, true);
      const folders = [category(11)];
      request.resolve({
        folders,
        products: [product(101)],
        total: 1,
        parent: dir ? category(10) : null,
      });
      await settle();
      assert.equal(f.state.folders, folders);
      assert.equal(f.state.list_products_only, false);
    }
});

test("server reads preserve native offset/limit, flags, vendor endpoint, cache and later-page folders", async () => {
  for (const vendor of [false, true]) {
    const f = fixture({ vendor });
    f.state.product_page = 2;
    f.state.filters = ["Open", "FILE"];
    f.state.search = "fixture";
    const folders = f.state.folders,
      parent = f.state.parent_folders;
    f.state.fetchData();
    const request = f.requests[0];
    assert.equal(request.scope, vendor ? "vendor" : "shop");
    assert.equal(request.id, vendor ? 4 : 7);
    assert.equal(request.offset, 8);
    assert.equal(request.limit, 8);
    assert.equal(request.ttl, 30);
    assert.deepEqual(plain(request.params.statuses), ["Open"]);
    assert.deepEqual(plain(request.params.types), ["FILE"]);
    assert.equal(request.params.with_parent, false);
    assert.equal(request.params.products_only, true);
    assert.equal(request.params.with_product_variants, true);
    assert.equal(request.params.with_product_translations, true);
    assert.equal(request.params.with_category_translations, true);
    assert.equal(request.params.with_total, true);
    assert.equal(request.params.search, "fixture");
    assert.equal(typeof request.cached, "function");
    const current = [product(205)];
    request.resolve({
      products: current,
      total: 17,
      folders: [],
      parent: category(30),
    });
    await settle();
    assert.equal(f.state.products, current);
    assert.equal(f.state.products_count, 17);
    assert.equal(f.state.folders, folders);
    assert.equal(f.state.parent_folders, parent);
    assert.equal(f.state.busy_fetch, false);
    f.state.fetchData();
    assert.equal(
      f.requests.length,
      1,
      "An unchanged query remains deduplicated",
    );
    f.state.fetchData(true);
    assert.equal(f.requests[1].ttl, 0);
    f.requests[1].resolve({ products: current, total: 17 });
    await settle();
  }
});

test("selection, note and image-edit callbacks retain their native payloads", () => {
  const f = fixture(),
    row = nodes(f.view(), "b-product-window-product-large")[0].node;
  const product = prop(row, "product");
  row.props.onOnSelect();
  assert.deepEqual(Array.from(f.state.selected_products), [product.id]);
  row.props.onOnSelect();
  assert.deepEqual(Array.from(f.state.selected_products), []);
  row.props.onSelect();
  assert.deepEqual(f.emitted.at(-1), { name: "select", args: [product] });
  row.props.onOnShowNote();
  assert.equal(f.state.note_product_item, product);
  assert.equal(f.state.note_product_dialog, true);
  let prevented = false;
  row.props["onClick:image"]({
    preventDefault: () => {
      prevented = true;
    },
  });
  assert.equal(f.routes[0].name, "BPageProductEdit");
  assert.deepEqual(f.routes[0].params, { product_id: product.id });
  assert.equal(f.routes[0].hash, "#images");
  assert.ok(prevented);
});

test("Ctrl and Meta keep the original keyboard selection visibility", () => {
  const f = fixture();
  f.component.mounted.call(f.state);
  for (const event of [
    { key: "Control", ctrlKey: true },
    { key: "Meta", metaKey: true },
  ]) {
    f.listeners.keydown(event);
    assert.equal(
      prop(
        nodes(f.view(), "b-product-window-product-large")[0].node,
        "showSelect",
      ),
      true,
    );
    f.listeners.keyup({});
    assert.equal(f.state.press_ctrl, false);
  }
  f.component.beforeUnmount.call(f.state);
  assert.equal(Object.keys(f.listeners).length, 0);
});

test("category/product drag containers, context menus and drop hooks remain around the native rows", () => {
  const f = fixture();
  for (const name of [
    "showMenu",
    "onDragStart",
    "onDragEnd",
    "onDropEnter",
    "onDropLeave",
    "handleDropInFolder",
    "onDropArrangeProduct",
    "dragenterProduct",
  ])
    f.spy(name);
  const tree = f.view();
  for (const [kind, component] of [
    ["category", "b-product-window-category-large"],
    ["product", "b-product-window-product-large"],
  ]) {
    const entry = nodes(tree, component)[0],
      item = prop(entry.node, kind);
    const drag = entry.ancestors.findLast(
      (node) => node.type?.name === "u-drag",
    );
    assert.ok(drag);
    assert.equal(prop(drag, "transferData")[kind], item);
    assert.equal(prop(drag, "draggable"), true);
    drag.props.onDrag({});
    assert.equal(f.calls.at(-1).name, "onDragStart");
    assert.equal(f.calls.at(-1).args[0][kind], item);
    drag.props.onDragend({});
    assert.equal(f.calls.at(-1).name, "onDragEnd");
    const column = entry.ancestors.findLast(
      (node) => node.type?.name === "v-col",
    );
    column.props.onContextmenu({});
    assert.equal(f.calls.at(-1).name, "showMenu");
    assert.equal(f.calls.at(-1).args[kind === "product" ? 1 : 2], item);
    if (kind === "category") {
      const drop = entry.ancestors.findLast(
        (node) => node.type?.name === "u-drop",
      );
      assert.ok(drop);
      drop.props.onDrop({ product: f.state.products[0] });
      assert.equal(f.calls.at(-1).name, "handleDropInFolder");
      assert.equal(f.calls.at(-1).args[1], item);
    } else {
      column.props.onDrop({});
      assert.equal(f.calls.at(-1).name, "onDropArrangeProduct");
      assert.equal(f.calls.at(-1).args[0], item);
    }
  }
});

test("category editing/select mode guards and product information guards remain unchanged", () => {
  for (const set of [null, "spec"])
    for (const selectMode of [false, true])
      for (const canSelectCategory of [false, true]) {
        const f = fixture({ set, modern: set !== "spec" });
        f.state.selectMode = selectMode;
        f.state.canSelectCategory = canSelectCategory;
        const tree = f.view(),
          row = nodes(tree, "b-product-window-category-large")[0].node;
        assert.equal(prop(row, "showEditButton"), !set && !selectMode);
        const buttons = nodes(tree, "v-btn")
          .map(({ node }) => node)
          .filter((node) =>
            String(node.props.class).split(" ").includes("selected-icon"),
          );
        assert.equal(buttons.length, selectMode && canSelectCategory ? 8 : 0);
        if (buttons.length) {
          buttons[0].props.onClick({ stopPropagation() {} });
          assert.equal(f.emitted.at(-1).name, "select-category");
          assert.equal(f.emitted.at(-1).args[0], f.state.folders[0]);
        }
        const product = nodes(tree, "b-product-window-product-large")[0].node;
        assert.equal(prop(product, "showPrice"), !set);
        assert.equal(prop(product, "showRatting"), !set);
        assert.equal(prop(product, "showStatistics"), !set);
      }
});

test("category note actions stay visible once and retain the real category callback", () => {
  for (const modern of [false, true])
    for (const mini of [false, true]) {
      const f = fixture({ modern, mini });
      f.state.folders[1].note = [{ body: "Existing note" }];
      const buttons = nodes(f.view(), "b-note-button").map(({ node }) => node);
      assert.equal(buttons.length, 1);
      buttons[0].props.onClick({ stopPropagation() {} });
      assert.equal(f.state.note_category_item, f.state.folders[1]);
      assert.equal(f.state.note_category_dialog, true);
      f.state.showNotes = true;
      assert.equal(
        nodes(f.view(), "b-note-button").length,
        Math.min(f.state.folders.length, f.state.max_folders_per_page),
      );
    }
});

test("native blank context keeps its exact background guard in modern list mode", () => {
  for (const modern of [false, true])
    for (const mini of [false, true])
      for (const target of [
        "manage-panel",
        "list-background",
        "nested-content",
      ]) {
        const f = fixture({ modern, mini });
        let prevented = false;
        const event = {
          target: {
            id: target,
            classList: {
              contains: (name) =>
                target === "list-background" &&
                name === "b-products-window__list-background",
            },
          },
          clientX: 11,
          clientY: 22,
          preventDefault: () => {
            prevented = true;
          },
        };
        f.state.showMenu(event, null, null);
        const allowed =
          target === "manage-panel" ||
          (modern && !mini && target === "list-background");
        assert.equal(f.state.showProductMenu, allowed);
        assert.equal(prevented, allowed);
        if (allowed) {
          assert.equal(f.state.x, 11);
          assert.equal(f.state.y, 22);
        }
      }
});

test("keyboard More clicks anchor to the control while mouse context coordinates stay unchanged", () => {
  const f = fixture(),
    item = f.state.products[0];
  const currentTarget = {
    getBoundingClientRect: () => ({ x: 20, width: 60, bottom: 120 }),
  };
  for (const [type, clientX, clientY, x, y] of [
    ["click", 0, 0, 50, 120],
    ["click", 11, 22, 11, 22],
    ["contextmenu", 11, 22, 11, 22],
    ["contextmenu", 0, 0, 0, 0],
  ]) {
    f.state.showMenu(
      {
        type,
        clientX,
        clientY,
        currentTarget,
        target: {},
        preventDefault() {},
      },
      item,
      null,
    );
    assert.equal(f.state.x, x);
    assert.equal(f.state.y, y);
    assert.equal(f.state.currentProductForMenu, item);
    assert.equal(f.state.currentCategoryForMenu, null);
    assert.equal(f.state.showProductMenu, true);
  }
});

test("native common selection acts on current product IDs only and external image updates remain callable", () => {
  const f = fixture();
  const row = nodes(render.menu(f.state, []), "v-list-item")
    .map(({ node }) => node)
    .find((node) => String(node.props.onClick).includes("selectAllProducts"));
  assert.ok(row);
  row.props.onClick({});
  assert.deepEqual(
    Array.from(f.state.selected_products),
    f.state.products.map((product) => product.id),
  );
  const selected = nodes(render.menu(f.state, []), "v-list-item")
    .map(({ node }) => node)
    .find((node) => String(node.props.onClick).includes("selectAllProducts"));
  selected.props.onClick({});
  assert.equal(f.state.selected_products.length, 0);
  assert.equal(
    f.state.updateProductMainImage("101", "updated-product.svg"),
    true,
  );
  assert.equal(f.state.products[0].icon, "updated-product.svg");
  assert.equal(f.state.updateCategoryImage("11", "updated-category.svg"), true);
  assert.equal(f.state.folders[0].icon, "updated-category.svg");
  assert.equal(f.state.updateProductMainImage("999", "missing.svg"), false);
  assert.equal(f.state.updateCategoryImage("999", "missing.svg"), false);
  assert.equal(f.requests.length, 0);
});
