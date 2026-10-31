import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import ts from "typescript";

// Real dialog templates/scripts; imported controls and report reads stay local.
const plain = (value) => JSON.parse(JSON.stringify(value));
async function compileScopedStyles(descriptor, file, id) {
  const compiled = [];
  for (const style of descriptor.styles) {
    assert.equal(style.scoped, true);
    const sourceFile = style.src ? new URL(style.src, file) : file;
    const source = style.src ? readFileSync(sourceFile, "utf8") : style.content;
    assert.ok(source.trim(), "compile actual inline or external scoped styles");
    const result = await compileStyleAsync({
      source,
      filename: sourceFile.pathname,
      id,
      scoped: true,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
    compiled.push(result.code);
  }
  return compiled.join("\n");
}
function evaluate(source, require, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(
    `String.prototype.limitWords = function () { return String(this); };\n${result.outputText}`,
    {
      exports,
      require,
      Date,
      window: {
        API: {
          POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_LIST: (id) =>
            `/local/shops/${id}/price-preview`,
          GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_LIST: (id) =>
            `/local/shops/${id}/discount-preview`,
        },
      },
      axios: new Proxy(
        {},
        {
          get() {
            throw new Error("No API calls in dialog presentation tests");
          },
        },
      ),
      ...globals,
    },
  );
  return exports;
}

const { formatDiscountPeriod } = evaluate(
  readFileSync(new URL("./formatDiscountPeriod.ts", import.meta.url), "utf8"),
  (name) => {
    throw new Error("Unexpected period helper dependency " + name);
  },
);

function bulkFixture(path, props = {}, data = {}) {
  const file = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "bulk-contract-test",
  });
  assert.deepEqual(template.errors, []);
  const reads = [],
    writes = [],
    notices = [],
    events = [],
    calls = [];
  const request = (list, url, body) =>
    new Promise((resolve, reject) => list.push({ url, body, resolve, reject }));
  const leaf = (name) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          calls.push({ name, attrs });
          if (name === "u-price")
            return Vue.h(
              "span",
              { "data-price": attrs.amount, "data-currency": attrs.currency },
              String(attrs.amount),
            );
          if (name === "v-data-table-server")
            return Vue.h("div", { class: ["v-data-table", attrs.class] }, [
              Vue.h("table", [
                Vue.h(
                  "tbody",
                  attrs.items.map((item) =>
                    Vue.h(
                      "tr",
                      attrs.headers.map((header) =>
                        Vue.h(
                          "td",
                          { "data-column": header.value ?? header.key },
                          slots[`item.${header.value ?? header.key}`]?.({
                            item,
                          }),
                        ),
                      ),
                    ),
                  ),
                ),
              ]),
              slots.bottom?.(),
              !attrs.items.length && slots["no-data"]?.(),
            ]);
          return Vue.h(
            name === "v-btn" ? "button" : name === "v-icon" ? "span" : "div",
            { ...attrs, "data-leaf": name },
            [
              slots.activator?.({ props: {} }),
              slots.label?.(),
              slots.default?.(),
            ],
          );
        };
      },
    });
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("formatDiscountPeriod")) return { formatDiscountPeriod };
    if (name === "lodash-es") return { throttle: (fn) => fn };
    if (name.includes("BusinessModel"))
      return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
    if (name.endsWith(".vue"))
      return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    if (name.includes("NotificationService"))
      return {
        default: {
          showSuccessAlert: () => notices.push(["success"]),
          showErrorAlert: (_, message) => notices.push(["server", message]),
          showLaravelError: (error) => notices.push(["network", error.message]),
        },
      };
    throw new Error("Unexpected dependency " + name);
  };
  const Page = evaluate(descriptor.script.content, dependency, {
    axios: {
      get: (url, options) => request(reads, url, options),
      post: (url, body) => request(writes, url, body),
    },
    window: {
      API: {
        POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE: (id) =>
          `/local/shops/${id}/prices`,
        POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_LIST: (id) =>
          `/local/shops/${id}/price-preview`,
        POST_SHOP_WAREHOUSE_BULK_CHANGE_PRICE_REPORT: (id) =>
          `/local/shops/${id}/price-report`,
        POST_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT: (id) =>
          `/local/shops/${id}/discounts`,
        GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_LIST: (id) =>
          `/local/shops/${id}/discount-preview`,
        GET_SHOP_WAREHOUSE_BULK_CHANGE_DISCOUNT_REPORT: (id) =>
          `/local/shops/${id}/discount-report`,
      },
    },
  }).default;
  Page.render = evaluate(template.code, dependency).render;
  const parameters = {
    shop: { id: 7, model: "NORMAL", currencies: ["USD", "EUR"] },
    modelValue: true,
    ...props,
  };
  const helpers = {
    $t: (key) => key,
    $i18n: { locale: "en" },
    $emit: (...args) => events.push(args),
    $nextTick: (callback) => Promise.resolve().then(() => callback?.()),
    resetToDefault() {
      Object.assign(this, Page.data.call(this));
    },
    $vuetify: {
      display: { xs: false, width: 1100 },
      theme: { current: { dark: false } },
    },
    getShopImagePath: (icon) => `/local/${icon}`,
  };
  const state = {
    ...Page.data.call(parameters),
    ...parameters,
    ...helpers,
    ...data,
  };
  for (const [name, method] of Object.entries(Page.methods))
    state[name] = method.bind(state);
  for (const [name, computed] of Object.entries(Page.computed))
    Object.defineProperty(state, name, {
      get: () => (computed.get ?? computed).call(state),
    });
  async function render(modern, overrides = {}) {
    calls.length = 0;
    let instance;
    const app = Vue.createSSRApp(
      {
        ...Page,
        render(...args) {
          instance = this;
          return Page.render.apply(this, args);
        },
        watch: {},
        created() {},
        data: () => ({ ...Page.data.call(parameters), ...data, ...overrides }),
      },
      { ...parameters, modern },
    );
    for (const name of [
      "v-dialog",
      "v-card",
      "v-card-title",
      "v-card-text",
      "v-card-actions",
      "v-tabs",
      "v-tab",
      "v-window",
      "v-window-item",
      "v-list-subheader",
      "v-expand-transition",
      "v-avatar",
      "v-icon",
      "v-img",
      "v-chip",
      "v-btn",
      "v-tooltip",
      "v-spacer",
      "v-pagination",
      "v-data-table-server",
      "u-widget-header",
      "u-loading-progress",
      "u-price",
    ])
      app.component(name, leaf(name));
    Object.assign(app.config.globalProperties, helpers);
    const html = await renderToString(app);
    return {
      html,
      document: new JSDOM(html).window.document,
      calls: [...calls],
      instance,
    };
  }
  return {
    Page,
    descriptor,
    state,
    calls,
    reads,
    writes,
    notices,
    events,
    render,
  };
}

const settled = async () => {
  await setImmediate();
  await Vue.nextTick();
};

test("shared discount period text preserves open boundaries and formats Date, ISO and zero timestamps in the current locale", () => {
  const start = new Date("2026-11-01T08:30:00.000Z"),
    end = "2026-11-03T19:00:00.000Z";
  for (const locale of ["en", "fa"]) {
    for (const [from, to, key] of [
      [null, null, "schedule_no_dates"],
      [undefined, "", "schedule_no_dates"],
      [start, null, "schedule_start_only"],
      [null, end, "schedule_end_only"],
      [start, end, "schedule_period"],
      [0, null, "schedule_start_only"],
      ["invalid date", "invalid date", "schedule_no_dates"],
    ]) {
      const originalTime = start.valueOf();
      let values;
      const result = formatDiscountPeriod(from, to, locale, (name, context) => {
        values = context;
        return name;
      });
      assert.equal(result, `inventory_list.bulk_discount_dialog.modern.${key}`);
      const formatter = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      if (from === start) assert.equal(values.start, formatter.format(start));
      if (from === 0) assert.equal(values.start, formatter.format(new Date(0)));
      if (to === end) assert.equal(values.end, formatter.format(new Date(end)));
      if (from === null || from === undefined) assert.equal(values.start, "");
      if (to === null || to === "") assert.equal(values.end, "");
      assert.equal(start.valueOf(), originalTime);
    }
  }
});

test("bulk price Apply sends every native mode's unchanged scope and values and closes only on success", async () => {
  for (const mode of ["percent", "constant", "ending", "marketplace"]) {
    const f = bulkFixture(
      "./price/BInventoryBulkPrice.vue",
      {},
      {
        mode,
        bulk_check: true,
        preview: true,
        bulk_category: 42,
        bulk_vendor: 9,
        bulk_percent: -12.5,
        bulk_constant: -150,
        bulk_currency: "EUR",
        bulk_ending: 0,
        marketplace_listing_price_fix_strategy: "max",
      },
    );
    const expected = {
      mode,
      category: 42,
      vendor: 9,
      percent: -12.5,
      constant: -150,
      currency: "EUR",
      ending: 0,
      strategy: "max",
    };
    f.state.setBulkPrice();
    assert.equal(f.state.busy_bulk, true);
    assert.equal(f.writes[0].url, "/local/shops/7/prices");
    assert.deepEqual(plain(f.writes[0].body), expected);
    assert.equal(f.state.preview, true);
    f.writes[0].resolve({ data: { success: true, count: 0 } });
    await settled();
    assert.equal(f.state.busy_bulk, false);
    assert.equal(f.state.preview, false);
    assert.deepEqual(plain(f.events), [
      ["update", { success: true, count: 0 }],
      ["update:modelValue", false],
    ]);
    assert.deepEqual(f.notices, [["success"]]);
  }
});

test("bulk price failures retain the preview and signed/zero draft values for retry", async () => {
  for (const outcome of ["server", "network"]) {
    const f = bulkFixture(
      "./price/BInventoryBulkPrice.vue",
      {},
      {
        mode: "ending",
        bulk_check: true,
        preview: true,
        bulk_ending: 0,
        bulk_constant: -150,
        bulk_currency: "USD",
      },
    );
    const before = plain(f.state.params);
    f.state.setBulkPrice();
    if (outcome === "server")
      f.writes[0].resolve({
        data: { error: true, error_msg: "Rejected local draft" },
      });
    else f.writes[0].reject(new Error("Local transport failed"));
    await settled();
    assert.equal(f.state.preview, true);
    assert.equal(f.state.bulk_check, true);
    assert.equal(f.state.busy_bulk, false);
    assert.deepEqual(plain(f.state.params), before);
    assert.deepEqual(f.events, []);
    assert.equal(f.notices[0][0], outcome);
  }
});

test("bulk price confirmation and pending Apply guards work at the method boundary", async () => {
  const f = bulkFixture(
    "./price/BInventoryBulkPrice.vue",
    {},
    { bulk_check: false, preview: false },
  );
  f.state.showPreview();
  f.state.setBulkPrice();
  assert.equal(f.state.preview, false);
  assert.equal(f.state.busy_bulk, false);
  assert.equal(f.writes.length, 0);
  f.state.bulk_check = true;
  f.state.busy_bulk = true;
  f.state.showPreview();
  f.state.setBulkPrice();
  assert.equal(f.state.preview, false);
  assert.equal(f.writes.length, 0);
  f.state.busy_bulk = false;
  f.state.showPreview();
  assert.equal(f.state.preview, true);
  f.state.setBulkPrice();
  f.state.setBulkPrice();
  assert.equal(f.writes.length, 1, "a pending Apply cannot submit twice");
  f.writes[0].resolve({ data: { success: true } });
  await settled();
});

test("bulk price report keeps category/vendor scope and only requires currency for currency-specific modes", async () => {
  const f = bulkFixture(
    "./price/BInventoryBulkPrice.vue",
    {},
    { bulk_category: 42, bulk_vendor: 9, bulk_percent: 0, bulk_ending: 0 },
  );
  f.state.mode = "marketplace";
  f.state.fetchReport();
  await settled();
  assert.equal(f.reads.length, 0);
  for (const mode of ["constant", "ending"]) {
    f.state.mode = mode;
    f.state.bulk_currency = null;
    f.state.fetchReport();
    await settled();
    assert.equal(f.reads.length, 0);
  }
  f.state.mode = "percent";
  f.state.fetchReport();
  await settled();
  assert.equal(f.reads[0].url, "/local/shops/7/price-report");
  assert.equal(f.reads[0].body.params.currency, null);
  assert.deepEqual(plain(f.reads[0].body.params), plain(f.state.params));
  f.reads[0].resolve({ data: { count_products: 0, count_variants: 0 } });
  await settled();
  assert.deepEqual(plain(f.state.report), {
    count_products: 0,
    count_variants: 0,
  });
  assert.equal(f.state.busy_report, false);
});

for (const [name, path] of [
  ["price", "./price/BInventoryBulkPrice.vue"],
  ["discount", "./discount/BInventoryBulkDiscount.vue"],
])
  test(`modern bulk ${name} confirmation supports Enter and Space and blocks changes during Apply`, async () => {
    const f = bulkFixture(path);
    for (const busy_bulk of [false, true]) {
      const rendered = await f.render(true, { bulk_check: false, busy_bulk });
      const verify = rendered.calls.find(
        (call) => call.name === "USmartVerify",
      ).attrs;
      assert.equal(verify.role, "checkbox");
      assert.equal(verify.tabindex, "0");
      assert.equal(verify["aria-checked"], false);
      assert.equal(verify["aria-disabled"], busy_bulk);
      assert.equal(verify.disabled, busy_bulk);
      for (const [key, expected] of [
        ["ArrowDown", false],
        ["Enter", !busy_bulk],
        [" ", false],
      ]) {
        let prevented = false;
        for (const handler of [].concat(verify.onKeydown))
          handler({
            key,
            preventDefault() {
              prevented = true;
            },
          });
        assert.equal(rendered.instance.bulk_check, expected);
        assert.equal(prevented, key !== "ArrowDown");
      }
    }
    const legacy = await f.render(false);
    const verify = legacy.calls.find(
      (call) => call.name === "USmartVerify",
    ).attrs;
    assert.equal(verify.role, undefined);
    assert.equal(verify.onKeydown, undefined);
    assert.equal(f.writes.length, 0);
  });

test("bulk discount report, preview and Apply preserve category, percentage and explicit date boundaries", async () => {
  for (const [percent, start, end] of [
    [0, null, null],
    [0.5, "2026-11-01T08:30:00.000Z", "2026-11-03T19:00:00.000Z"],
    [
      90,
      new Date("2026-11-01T08:30:00.000Z"),
      new Date("2026-11-03T19:00:00.000Z"),
    ],
    [10, "2026-11-01T08:30:00.000Z", null],
  ]) {
    const draft = {
      bulk_category: 42,
      bulk_percent: percent,
      dis_start: start,
      dis_end: end,
      bulk_check: true,
      preview: false,
      dialog_pre: false,
    };
    const expected = { category: 42, percent, dis_start: start, dis_end: end };
    const before = plain(expected);
    const f = bulkFixture("./discount/BInventoryBulkDiscount.vue", {}, draft);
    f.state.fetchReport();
    await settled();
    assert.equal(f.state.busy_report, true);
    assert.equal(f.reads[0].url, "/local/shops/7/discount-report");
    assert.deepEqual(plain(f.reads[0].body.params), before);
    assert.equal(f.reads[0].body.params.dis_start, start);
    assert.equal(f.reads[0].body.params.dis_end, end);
    f.reads[0].resolve({ data: { count_products: 0, count_variants: 0 } });
    await settled();
    assert.equal(f.state.busy_report, false);
    assert.equal(f.state.report.count_products, 0);
    f.state.showPreviewList();
    await settled();
    assert.equal(f.state.preview, true);
    assert.equal(f.state.dialog_pre, true);
    const rendered = await f.render(true, {
      ...draft,
      preview: true,
      dialog_pre: true,
    });
    const preview = rendered.calls.find(
      (call) => call.name === "BInventoryBulkPreview",
    ).attrs;
    assert.equal(preview.url, "/local/shops/7/discount-preview");
    assert.equal(preview.modern, true);
    assert.ok(Object.hasOwn(preview, "discount-update"));
    assert.deepEqual(plain(preview.params), before);
    f.state.setBulkDiscount();
    assert.equal(f.state.busy_bulk, true);
    assert.equal(f.state.preview, true);
    assert.equal(f.writes[0].url, "/local/shops/7/discounts");
    assert.deepEqual(plain(f.writes[0].body), before);
    assert.deepEqual(plain(expected), before, "native dates remain unmodified");
    f.writes[0].resolve({ data: { success: true, count_products: 0 } });
    await settled();
    assert.equal(f.state.busy_bulk, false);
    assert.equal(f.state.preview, false);
    assert.deepEqual(plain(f.events), [
      ["update", { success: true, count_products: 0 }],
      ["update:modelValue", false],
    ]);
  }
});

test("bulk discount failure retains percentage, date draft and preview for retry", async () => {
  for (const outcome of ["server", "network"]) {
    const draft = {
      bulk_category: 42,
      bulk_percent: 0,
      dis_start: null,
      dis_end: "2026-11-03T19:00:00.000Z",
      bulk_check: true,
      preview: true,
      dialog_pre: true,
    };
    const f = bulkFixture("./discount/BInventoryBulkDiscount.vue", {}, draft);
    f.state.setBulkDiscount();
    const expected = plain(f.writes[0].body);
    if (outcome === "server")
      f.writes[0].resolve({
        data: { error: true, error_msg: "Invalid final date pair" },
      });
    else f.writes[0].reject(new Error("Local transport failed"));
    await settled();
    for (const [key, value] of Object.entries(draft))
      assert.equal(f.state[key], value);
    assert.equal(f.state.busy_bulk, false);
    assert.deepEqual(f.events, []);
    assert.equal(f.notices[0][0], outcome);
    f.state.setBulkDiscount();
    assert.deepEqual(plain(f.writes[1].body), expected);
    f.writes[1].resolve({ data: { success: true } });
    await settled();
    assert.equal(f.state.preview, false);
  }
});

test("bulk discount native UTC date and percentage controls keep their limits and clear both boundaries through their real bindings", async () => {
  const f = bulkFixture("./discount/BInventoryBulkDiscount.vue");
  const start = "2026-11-01T08:30:00.000Z",
    end = "2026-11-03T19:00:00.000Z";
  for (const modern of [false, true]) {
    const rendered = await f.render(modern, {
      bulk_category: 42,
      bulk_percent: 0.5,
      bulk_check: true,
      dis_start: start,
      dis_end: end,
    });
    const percent = rendered.calls.find(
      (call) => call.name === "UNumberInput",
    ).attrs;
    assert.equal(percent.modelValue, 0.5);
    assert.equal(percent.min, 0);
    assert.equal(percent.max, 90);
    assert.equal(percent.decimal, 1);
    assert.equal(percent.step, 0.5);
    const dates = rendered.calls
      .filter((call) => call.name === "UDateInput")
      .map((call) => call.attrs);
    assert.equal(dates[0].modelValue, start);
    assert.equal(dates[0].max, end);
    assert.equal(dates[1].modelValue, end);
    assert.equal(dates[1].min, start);
    assert.equal(dates[1].disabled, false);
    for (const date of dates) assert.ok(Object.hasOwn(date, "return-utc"));
    if (modern)
      assert.match(
        rendered.document.querySelector(".b-inventory-bulk-discount__period")
          .textContent,
        /schedule_period/,
      );
    dates[1]["onUpdate:modelValue"](null);
    dates[0]["onUpdate:modelValue"](null);
    percent["onUpdate:modelValue"](0);
    rendered.instance.setBulkDiscount();
    assert.deepEqual(plain(f.writes.at(-1).body), {
      category: 42,
      percent: 0,
      dis_start: null,
      dis_end: null,
    });
    f.writes.at(-1).resolve({ data: { success: true } });
    await settled();
    const blank = await f.render(modern, { dis_start: null, dis_end: null });
    if (modern)
      assert.match(
        blank.document.querySelector(".b-inventory-bulk-discount__period")
          .textContent,
        /schedule_no_dates/,
      );
    assert.equal(
      blank.calls.filter((call) => call.name === "UDateInput")[1].attrs
        .disabled,
      true,
    );
  }
});

test("bulk discount guards unverified preview, queued verification changes and duplicate Apply", async () => {
  const f = bulkFixture("./discount/BInventoryBulkDiscount.vue");
  f.state.showPreviewList();
  f.state.setBulkDiscount();
  await settled();
  assert.equal(f.state.preview, false);
  assert.equal(f.state.dialog_pre, false);
  assert.equal(f.writes.length, 0);
  f.state.bulk_check = true;
  f.state.busy_bulk = true;
  f.state.showPreviewList();
  f.state.setBulkDiscount();
  await settled();
  assert.equal(f.state.preview, false);
  assert.equal(f.writes.length, 0);
  f.state.busy_bulk = false;
  f.state.showPreviewList();
  f.state.bulk_check = false;
  await settled();
  assert.equal(f.state.preview, false, "queued preview rechecks verification");
  f.state.bulk_check = true;
  f.state.showPreviewList();
  f.state.busy_bulk = true;
  await settled();
  assert.equal(f.state.preview, false, "queued preview rechecks pending Apply");
  f.state.busy_bulk = false;
  f.state.showPreviewList();
  await settled();
  assert.equal(f.state.preview, true);
  f.state.setBulkDiscount();
  f.state.setBulkDiscount();
  assert.equal(f.writes.length, 1);
  f.writes[0].resolve({ data: { success: true } });
  await settled();
});

test("bulk discount restores a pinned category after every reopen and retains its read-only category UI", async () => {
  const category = { id: 42, title: "Pinned category" };
  const f = bulkFixture("./discount/BInventoryBulkDiscount.vue", { category });
  f.Page.created.call(f.state);
  await settled();
  assert.equal(f.state.bulk_category, 42);
  f.reads[0].resolve({ data: { count_products: 8, count_variants: 10 } });
  await settled();
  for (let opened = 0; opened < 2; opened++) {
    f.state.bulk_category = 99;
    f.state.bulk_percent = 90;
    f.state.bulk_check = true;
    f.Page.watch.modelValue.call(f.state, true);
    await settled();
    assert.equal(f.state.bulk_category, 42);
    assert.equal(f.state.bulk_percent, 0);
    assert.equal(f.state.bulk_check, false);
    assert.equal(f.reads.at(-1).body.params.category, 42);
    f.reads.at(-1).resolve({ data: { count_products: 8, count_variants: 10 } });
    await settled();
  }
  for (const modern of [false, true]) {
    const rendered = await f.render(modern, { bulk_category: 42 });
    assert.ok(rendered.calls.some((call) => call.name === "BCategoryParent"));
    assert.equal(
      rendered.calls.some((call) => call.name === "BCategoryInput"),
      false,
    );
    assert.match(rendered.html, /Pinned category/);
  }
});

test("bulk preview preserves sorting, page and request scope while display currency overrides only its read", async () => {
  const params = {
    mode: "percent",
    category: 42,
    vendor: 9,
    percent: -12.5,
    constant: -150,
    ending: 0,
    currency: "EUR",
    strategy: "max",
  };
  for (const hasCurrency of [false, true]) {
    const f = bulkFixture(
      "./preview/BInventoryBulkPreview.vue",
      { url: "/local/shops/7/preview", params, hasCurrency },
      {
        currency: "USD",
        page: 3,
        sortBy: [{ key: "price", order: "asc" }],
        search: "existing term",
        pending: true,
      },
    );
    f.state.fetchPage();
    assert.equal(f.state.busy_fetch, true);
    assert.deepEqual(plain(f.reads[0].body.params), {
      ...params,
      currency: hasCurrency ? "USD" : "EUR",
      search: "existing term",
      pending: true,
      offset: 20,
      limit: 10,
      sortBy: "price",
      sortDesc: false,
    });
    assert.equal(
      params.currency,
      "EUR",
      "preview never mutates the Apply parameters",
    );
    f.reads[0].resolve({ data: { products: [{ id: 12 }], total: 27 } });
    await settled();
    assert.equal(f.state.totalItems, 27);
    assert.equal(f.state.pageCount, 3);
    assert.equal(f.state.busy_fetch, false);
  }
});

test("legacy and modern bulk previews show a proposed zero and retain discount/date changes", async () => {
  const product = {
    id: 12,
    title: "Zero base price sample",
    title_en: "Existing full product title",
    icon: "sample.svg",
    price: 24.3,
    new_price: 0,
    currency: "USD",
    discount: 5,
    new_discount: 0,
    dis_start: "2026-10-01",
    dis_end: "2026-10-31",
    new_dis_start: null,
    new_dis_end: null,
  };
  const f = bulkFixture(
    "./preview/BInventoryBulkPreview.vue",
    {
      url: "/local/shops/7/preview",
      params: { mode: "constant" },
      hasCurrency: true,
    },
    { products: [product], totalItems: 1, currency: "USD" },
  );
  assert.equal(f.Page.props.modern.default, false);
  for (const modern of [false, true]) {
    const rendered = await f.render(modern);
    const priceColumn = rendered.document.querySelector(
      `td[data-column="${modern ? "new_price" : "price"}"]`,
    );
    assert.ok(
      priceColumn.querySelector('[data-price="0"]'),
      "zero is a displayed price, not missing data",
    );
    assert.ok(
      rendered.document.querySelector(
        'td[data-column="discount"] [data-price="0"]',
      ),
    );
    const dates = rendered.calls
      .filter((call) => call.name === "UTimeProgressBar")
      .map((call) => ({
        start: call.attrs["start-time"],
        end: call.attrs["end-time"],
      }));
    assert.deepEqual(dates, [
      { start: "2026-10-01", end: "2026-10-31" },
      { start: null, end: null },
    ]);
    const table = rendered.calls.find(
      (call) => call.name === "v-data-table-server",
    ).attrs;
    assert.deepEqual(plain(table.items), [product]);
    assert.equal(
      table.headers.some(
        (header) => (header.key ?? header.value) === "discount",
      ),
      true,
    );
    assert.equal(
      table.headers.find((header) => (header.key ?? header.value) === "price")
        .sortable,
      true,
    );
    assert.equal(
      !!rendered.document.querySelector(".b-inventory-bulk-preview--modern"),
      modern,
    );
    if (modern)
      assert.match(
        rendered.html,
        /bulk_price_dialog\.modern\.preview_currency_help/,
      );
  }
});

test("modern discount preview separates zero replacement discounts and cleared schedules while retaining native read scope and sorting", async () => {
  const params = { category: 42, percent: 0, dis_start: null, dis_end: null };
  const product = {
    id: 31,
    title: "Existing local product",
    title_en: "Original title",
    icon: "local.svg",
    price: 100,
    new_price: 100,
    currency: "USD",
    discount: 10,
    new_discount: 0,
    dis_start: "2026-10-01T00:00:00Z",
    dis_end: "2026-10-31T00:00:00Z",
    new_dis_start: null,
    new_dis_end: null,
  };
  const f = bulkFixture(
    "./preview/BInventoryBulkPreview.vue",
    {
      url: "/local/shops/7/discount-preview",
      params,
      hasCurrency: true,
      discountUpdate: true,
    },
    {
      products: [product],
      totalItems: 31,
      page: 3,
      currency: "USD",
      search: "existing term",
      sortBy: [{ key: "discount", order: "desc" }],
    },
  );
  assert.equal(f.Page.props.discountUpdate.default, false);
  const rendered = await f.render(true);
  const table = rendered.calls.find(
    (call) => call.name === "v-data-table-server",
  ).attrs;
  assert.deepEqual(
    plain(table.headers).map((header) => header.value),
    ["title", "price", "discount", "new_discount"],
  );
  assert.equal(
    table.headers.find((header) => header.value === "discount").sortable,
    true,
  );
  assert.equal(
    table.headers.find((header) => header.value === "new_discount").sortable,
    false,
  );
  assert.equal(
    rendered.document
      .querySelector('[data-column="price"] [data-price]')
      .getAttribute("data-price"),
    "100",
  );
  assert.equal(
    rendered.document
      .querySelector('[data-column="discount"] [data-price]')
      .getAttribute("data-price"),
    "10",
  );
  assert.equal(
    rendered.document
      .querySelector('[data-column="new_discount"] [data-price]')
      .getAttribute("data-price"),
    "0",
  );
  const periods = rendered.calls
    .filter((call) => call.name === "UTimeProgressBar")
    .map((call) => [call.attrs["start-time"], call.attrs["end-time"]]);
  assert.deepEqual(periods, [
    [product.dis_start, product.dis_end],
    [null, null],
  ]);
  assert.match(
    rendered.document.querySelector('[data-column="discount"]').textContent,
    /schedule_period/,
  );
  assert.match(
    rendered.document.querySelector('[data-column="new_discount"]').textContent,
    /schedule_no_dates/,
  );
  f.state.fetchPage();
  assert.equal(f.reads[0].url, "/local/shops/7/discount-preview");
  assert.deepEqual(plain(f.reads[0].body.params), {
    ...params,
    currency: "USD",
    offset: 20,
    limit: 10,
    sortBy: "discount",
    sortDesc: true,
    search: "existing term",
    pending: false,
  });
  assert.deepEqual(params, {
    category: 42,
    percent: 0,
    dis_start: null,
    dis_end: null,
  });
  f.reads[0].resolve({ data: { products: [product], total: 31 } });
  await settled();
  for (const new_discount of [undefined, null, 10]) {
    const unchanged = await f.render(true, {
      products: [
        {
          ...product,
          new_discount,
          new_dis_start: product.dis_start,
          new_dis_end: product.dis_end,
        },
      ],
    });
    const proposed = unchanged.document.querySelector(
      '[data-column="new_discount"]',
    );
    assert.equal(
      proposed.querySelector("[data-price]").getAttribute("data-price"),
      "10",
    );
    assert.match(proposed.textContent, /preview_unchanged/);
    assert.deepEqual(
      unchanged.calls
        .filter((call) => call.name === "UTimeProgressBar")
        .map((call) => [call.attrs["start-time"], call.attrs["end-time"]]),
      [
        [product.dis_start, product.dis_end],
        [product.dis_start, product.dis_end],
      ],
    );
  }
  const legacy = await f.render(false);
  assert.equal(
    legacy.document.querySelector('[data-column="new_discount"]'),
    null,
  );
  assert.equal(
    legacy.document
      .querySelector('[data-column="discount"]')
      .querySelectorAll("[data-price]").length,
    2,
  );
});

test("bulk preview keeps loaded rows during refresh and ignores older response, error and loading completion", async () => {
  for (const olderOutcome of ["success", "server", "network"]) {
    const existing = [{ id: 12, price: 24.3 }];
    const f = bulkFixture(
      "./preview/BInventoryBulkPreview.vue",
      {
        url: "/local/shops/7/preview",
        params: { mode: "percent", percent: 10 },
        hasCurrency: true,
      },
      { currency: "USD", products: existing, totalItems: 27 },
    );
    f.state.fetchPage();
    const older = f.reads[0];
    assert.deepEqual(f.state.products, existing);
    f.state.page = 2;
    f.state.fetchPage();
    const current = f.reads[1];
    if (olderOutcome === "network") older.reject(new Error("Older transport"));
    else
      older.resolve({
        data:
          olderOutcome === "server"
            ? { error: true, error_msg: "Older server" }
            : { products: [{ id: 99 }], total: 99 },
      });
    await settled();
    assert.deepEqual(f.state.products, existing);
    assert.equal(f.state.totalItems, 27);
    assert.equal(f.state.busy_fetch, true);
    assert.equal(f.state.fetch_error, false);
    assert.deepEqual(f.notices, []);
    current.resolve({ data: { products: [{ id: 13 }], total: 28 } });
    await settled();
    assert.deepEqual(plain(f.state.products), [{ id: 13 }]);
    assert.equal(f.state.totalItems, 28);
    assert.equal(f.state.busy_fetch, false);
  }
});

test("failed bulk preview retains its page and rows with a working modern Retry", async () => {
  const f = bulkFixture(
    "./preview/BInventoryBulkPreview.vue",
    {
      url: "/local/shops/7/preview",
      params: { mode: "ending", ending: 0 },
      hasCurrency: false,
    },
    { page: 2, totalItems: 27, products: [{ id: 12 }] },
  );
  f.state.fetchPage();
  f.reads[0].reject(new Error("Local preview failure"));
  await settled();
  assert.equal(f.state.fetch_error, true);
  assert.equal(f.state.busy_fetch, false);
  assert.equal(f.state.page, 2);
  assert.deepEqual(plain(f.state.products), [{ id: 12 }]);
  const rendered = await f.render(true, {
    fetch_error: true,
    products: [],
    page: 2,
  });
  assert.ok(rendered.document.querySelector('[role="alert"]'));
  const retry = rendered.calls.find(
    (call) => call.name === "v-btn" && call.attrs.onClick,
  );
  assert.ok(retry);
  const before = f.reads.length;
  retry.attrs.onClick();
  await settled();
  assert.equal(f.reads.length, before + 1);
  assert.equal(f.reads.at(-1).body.params.offset, 10);
  f.reads.at(-1).resolve({ data: { products: [], total: 0 } });
  await settled();
});

test("bulk preview unmount prevents a late read from changing data or finishing another lifecycle", async () => {
  for (const outcome of ["success", "server", "network"]) {
    const f = bulkFixture(
      "./preview/BInventoryBulkPreview.vue",
      {
        url: "/local/shops/7/preview",
        params: { mode: "percent", percent: 0 },
      },
      { products: [{ id: 12 }], totalItems: 27 },
    );
    f.state.fetchPage();
    f.Page.beforeUnmount.call(f.state);
    if (outcome === "network")
      f.reads[0].reject(new Error("Unmounted preview"));
    else
      f.reads[0].resolve({
        data:
          outcome === "server"
            ? { error: true, error_msg: "Unmounted server response" }
            : { products: [{ id: 99 }], total: 99 },
      });
    await settled();
    assert.deepEqual(plain(f.state.products), [{ id: 12 }]);
    assert.equal(f.state.totalItems, 27);
    assert.deepEqual(f.notices, []);
  }
});

const illustrationFile = new URL(
  "./price/BInventoryBulkPriceIllustration.vue",
  import.meta.url,
);
const illustration = parse(readFileSync(illustrationFile, "utf8"));
assert.deepEqual(illustration.errors, []);
const illustrationTemplate = compileTemplate({
  source: illustration.descriptor.template.content,
  filename: illustrationFile.pathname,
  id: "bulk-price-illustration-test",
});
assert.deepEqual(illustrationTemplate.errors, []);
const Currency = evaluate(
  readFileSync(
    new URL("../../../../core-js/enums/payment/Currency.ts", import.meta.url),
    "utf8",
  ),
  (name) => {
    assert.match(name, /\.(svg|png)$/);
    return { default: "/local/currency-icon" };
  },
).Currency;
const PriceHelper = evaluate(
  readFileSync(
    new URL("../../../../core-js/helper/price/PriceHelper.ts", import.meta.url),
    "utf8",
  ),
  (name) => {
    if (name.includes("/Currency")) return { Currency };
    if (name.includes("/DateConverter")) return { DateConverter: {} };
    if (name.includes("/product.model")) return { Product: {} };
    if (name.includes("/StorefrontDebugEvents"))
      return { StorefrontDebugEvents: {} };
    throw new Error("Unexpected price helper dependency " + name);
  },
).PriceHelper;
const illustrationDependency = (name) => {
  if (name === "vue") return Vue;
  if (name.includes("formatDiscountPeriod")) return { formatDiscountPeriod };
  if (name.includes("/Currency")) return { Currency };
  if (name.includes("/PriceHelper")) return { PriceHelper };
  throw new Error("Unexpected illustration dependency " + name);
};
const Illustration = evaluate(
  illustration.descriptor.script.content,
  illustrationDependency,
).default;
const illustrationRender = evaluate(
  illustrationTemplate.code,
  illustrationDependency,
).render;

async function renderIllustration(
  props,
  Page = Illustration,
  render = illustrationRender,
) {
  let instance;
  const app = Vue.createSSRApp(
    {
      ...Page,
      render(...args) {
        instance = this;
        return render.apply(this, args);
      },
    },
    props,
  );
  app.component("v-icon", {
    setup(_, { attrs, slots }) {
      return () => Vue.h("span", attrs, slots.default?.());
    },
  });
  app.config.globalProperties.$t = (key, values) =>
    [key, ...Object.values(values ?? {})].join(" ");
  app.config.globalProperties.$i18n = { locale: "en" };
  const html = await renderToString(app);
  return { instance, document: new JSDOM(html).window.document };
}

const discountIllustrationFile = new URL(
  "./discount/BInventoryBulkDiscountIllustration.vue",
  import.meta.url,
);
const discountIllustration = parse(
  readFileSync(discountIllustrationFile, "utf8"),
);
assert.deepEqual(discountIllustration.errors, []);
const discountIllustrationTemplate = compileTemplate({
  source: discountIllustration.descriptor.template.content,
  filename: discountIllustrationFile.pathname,
  id: "bulk-discount-illustration-test",
});
assert.deepEqual(discountIllustrationTemplate.errors, []);
const DiscountIllustration = evaluate(
  discountIllustration.descriptor.script.content,
  illustrationDependency,
).default;
const discountIllustrationRender = evaluate(
  discountIllustrationTemplate.code,
  illustrationDependency,
).render;

test("bulk discount illustration replaces the fictional existing discount including zero and fractional percentages without changing inputs", async () => {
  for (const [percent, discount, payable] of [
    [0, 0, 100],
    [0.5, 0.5, 99.5],
    [90, 90, 10],
    [-1, null, null],
    [91, null, null],
    [NaN, null, null],
    [Infinity, null, null],
  ]) {
    const props = Object.freeze({ percent });
    const { instance, document } = await renderIllustration(
      props,
      DiscountIllustration,
      discountIllustrationRender,
    );
    assert.equal(instance.discountAmount, discount);
    assert.equal(instance.payable, payable);
    assert.ok(Object.is(props.percent, percent));
    const current = document.querySelector(
      ".b-bulk-discount-illustration__card",
    );
    assert.match(
      current.querySelector(".b-bulk-discount-illustration__total bdi")
        .textContent,
      /^90\.00/,
    );
    const result = document.querySelector(
      ".b-bulk-discount-illustration__card--result",
    );
    const rows = result.querySelectorAll(
      ".b-bulk-discount-illustration__row bdi",
    );
    assert.match(rows[0].textContent, /^100\.00/);
    assert.ok(rows[1].textContent.startsWith(instance.formatNumber(discount)));
    assert.ok(
      result
        .querySelector(".b-bulk-discount-illustration__total bdi")
        .textContent.startsWith(instance.formatNumber(payable)),
    );
    if (discount !== null) {
      assert.match(
        instance.summary,
        new RegExp(
          instance.formatNumber(discount).replace(".", "\\.") + " USD",
        ),
      );
      assert.match(
        instance.summary,
        new RegExp(instance.formatNumber(payable).replace(".", "\\.") + " USD"),
      );
    }
  }
});

test("bulk discount illustration reflects open and bounded schedules without mutating dates and remains inert with reduced motion", async () => {
  for (const [start, end, key] of [
    [null, null, "schedule_no_dates"],
    ["2026-11-01T08:30:00.000Z", null, "schedule_start_only"],
    [null, "2026-11-03T19:00:00.000Z", "schedule_end_only"],
    [
      new Date("2026-11-01T08:30:00.000Z"),
      new Date("2026-11-03T19:00:00.000Z"),
      "schedule_period",
    ],
    [0, null, "schedule_start_only"],
    ["invalid date", "invalid date", "schedule_no_dates"],
  ]) {
    const props = Object.freeze({ percent: 10, start, end });
    const before = plain(props);
    const { instance, document } = await renderIllustration(
      props,
      DiscountIllustration,
      discountIllustrationRender,
    );
    assert.match(instance.periodText, new RegExp(key));
    assert.deepEqual(plain(props), before);
    assert.match(
      document.querySelector("figcaption").textContent,
      /illustration_label/,
    );
    const stage = document.querySelector(
      ".b-bulk-discount-illustration__stage",
    );
    assert.equal(stage.getAttribute("aria-hidden"), "true");
    assert.equal(stage.querySelector("svg").getAttribute("focusable"), "false");
    assert.equal(stage.querySelectorAll("path").length, 2);
    assert.equal(
      document.querySelector("button, input, select, a[href], [tabindex]"),
      null,
    );
  }
  const css = await compileScopedStyles(
    discountIllustration.descriptor,
    discountIllustrationFile,
    "bulk-discount-illustration-test",
  );
  assert.doesNotMatch(css, /animation[^;]*\binfinite\b/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation:\s*none/);
  for (const [, duration, unit] of css.matchAll(
    /animation:[^;]*?\s([\d.]+)(ms|s)\b/g,
  ))
    assert.ok(Number(duration) / (unit === "ms" ? 1000 : 1) <= 4);
});

test("bulk price illustration uses fictional USD percent examples and selected-currency fixed precision without changing its inputs", async () => {
  const cases = [
    [{ mode: "percent", percent: 0, currency: "IRR" }, "USD", 2, 100],
    [{ mode: "percent", percent: 0.5 }, "USD", 2, 100.5],
    [{ mode: "percent", percent: -0.5 }, "USD", 2, 99.5],
    [{ mode: "percent", percent: -90 }, "USD", 2, 10],
    [{ mode: "percent", percent: 90 }, "USD", 2, 190],
    [{ mode: "constant", constant: -100, currency: "USD" }, "USD", 2, 0],
    [{ mode: "constant", constant: -150, currency: "USD" }, "USD", 2, -50],
    [{ mode: "constant", constant: 0, currency: "USD" }, "USD", 2, 100],
    [{ mode: "constant", constant: 12.345, currency: "USD" }, "USD", 2, 112.35],
    [{ mode: "constant", constant: 0.6, currency: "JPY" }, "JPY", 0, 101],
    [
      { mode: "constant", constant: 12.3456, currency: "KWD" },
      "KWD",
      3,
      112.346,
    ],
    [{ mode: "constant", constant: 12 }, "USD", 2, null],
    [{ mode: "percent", percent: NaN }, "USD", 2, null],
    [{ mode: "constant", constant: Infinity, currency: "USD" }, "USD", 2, null],
  ];
  for (const [props, currency, precision, expected] of cases) {
    const before = { ...props };
    const { instance, document } = await renderIllustration(props);
    assert.equal(instance.exampleCurrency, currency);
    assert.equal(instance.precision, precision);
    assert.equal(instance.result, expected);
    assert.deepEqual(props, before);
    const amount = document.querySelector(
      ".b-bulk-price-illustration__card--result .b-bulk-price-illustration__amount bdi",
    ).textContent;
    assert.equal(
      amount,
      expected === null ? "—" : instance.formatNumber(expected),
    );
    if (expected === 0) assert.equal(amount, "0.00");
    if (expected < 0)
      assert.match(
        document.querySelector(".b-bulk-price-illustration__note").textContent,
        /negative_example/,
      );
    if (props.mode === "percent" && props.percent === 0)
      assert.match(
        document.querySelector(".b-bulk-price-illustration__note").textContent,
        /zero_example/,
      );
  }
});

test("bulk price illustration applies normalized endings across decimal and integer block boundaries", async () => {
  for (const [currency, ending, expected] of [
    ["USD", 0, 24],
    ["USD", 0.5, 24.5],
    ["USD", 0.99, 24.99],
    ["USD", 0.999, 21],
    ["USD", 1, 21],
    ["USD", 9.99, 29.99],
    ["USD", 10, 10],
    ["USD", 99.99, 99.99],
    ["USD", 100, 100],
    ["JPY", 0.6, 21],
    ["KWD", 0.9994, 24.999],
    ["KWD", 0.9996, 21],
    ["USD", -1, null],
    ["USD", NaN, null],
    [null, 0.99, null],
  ]) {
    const { instance } = await renderIllustration({
      mode: "ending",
      currency,
      ending,
    });
    assert.equal(instance.result, expected, `${currency} ending ${ending}`);
  }
});

test("bulk price illustration keeps marketplace strategies illustrative and its real SVG noninteractive with reduced motion", async () => {
  for (const [strategy, expected] of [
    [null, null],
    ["min", 100],
    ["max", 120],
  ]) {
    const { instance, document } = await renderIllustration({
      mode: "marketplace",
      strategy,
      currency: "USD",
    });
    assert.equal(instance.samplePrice, 110);
    assert.equal(instance.result, expected);
    assert.match(
      document.querySelector("figcaption").textContent,
      /illustration_label/,
    );
    assert.match(
      document.querySelector(".b-bulk-price-illustration__summary").textContent,
      /marketplace_help/,
    );
    const stage = document.querySelector(".b-bulk-price-illustration__stage");
    assert.equal(stage.getAttribute("aria-hidden"), "true");
    assert.equal(stage.querySelector("svg").getAttribute("focusable"), "false");
    assert.equal(
      document.querySelector("button, input, select, a[href], [tabindex]"),
      null,
    );
    assert.equal(stage.querySelectorAll("path").length, 2);
  }
  for (const style of illustration.descriptor.styles) {
    assert.equal(style.scoped, true);
    const result = await compileStyleAsync({
      source: style.content,
      filename: illustrationFile.pathname,
      id: "bulk-price-illustration-test",
      scoped: true,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
    assert.doesNotMatch(result.code, /animation[^;]*\binfinite\b/);
    assert.match(result.code, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
    assert.match(result.code, /animation:\s*none/);
  }
});

const singlePriceFile = new URL(
  "../../product/edit/price/BProductEditPrice.vue",
  import.meta.url,
);
const singlePrice = parse(readFileSync(singlePriceFile, "utf8"));
assert.deepEqual(singlePrice.errors, []);
const singlePriceTemplate = compileTemplate({
  source: singlePrice.descriptor.template.content,
  filename: singlePriceFile.pathname,
  id: "single-price-dialog-test",
});
assert.deepEqual(singlePriceTemplate.errors, []);

test("single-price editor Vue, TypeScript and scoped Sass compile", async () => {
  for (const style of singlePrice.descriptor.styles) {
    assert.equal(style.scoped, true);
    const result = await compileStyleAsync({
      source: style.content,
      filename: singlePriceFile.pathname,
      id: "single-price-dialog-test",
      scoped: true,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("single-price modern presentation preserves controls and enables keyboard variant-price choices", async () => {
  const calls = [];
  const currency = { code: "USD", name: "USD" };
  const leaf = (name) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          calls.push({ name, attrs });
          return Vue.h(
            "div",
            { ...attrs, "data-leaf": name },
            slots.default?.(),
          );
        };
      },
    });
  const dependency = (name) => {
    if (name === "vue") return Vue;
    if (name.endsWith(".vue"))
      return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    if (name.includes("CurrencyMixin"))
      return {
        default: {
          methods: {
            GetCurrency: () => currency,
            GetUserSelectedCurrency: () => currency,
          },
        },
      };
    if (name.includes("/Currency")) return { Currency: { USD: currency } };
    if (name.includes("PricingTypes"))
      return {
        PricingTypes: {
          FIX: { code: "FIX" },
          AGREEMENT: { code: "AGREEMENT" },
          ESTIMATION: { code: "ESTIMATION" },
        },
      };
    if (name.includes("ProductType"))
      return {
        ProductType: Object.fromEntries(
          ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map(
            (code) => [code, { code }],
          ),
        ),
      };
    if (name.includes("ColorGenerator"))
      return { standardDesignColor: ["blue"] };
    if (name.includes("PriceHelper"))
      return {
        PriceHelper: {
          priceProductByCurrency: (_, value) =>
            value.price + value.commission - value.discount,
          discountProductPercent: () => 10,
        },
      };
    if (name.includes("NotificationService")) return { default: {} };
    throw new Error("Unexpected dependency " + name);
  };
  const Page = evaluate(
    singlePrice.descriptor.script.content,
    dependency,
  ).default;
  const compiled = evaluate(singlePriceTemplate.code, dependency).render;
  assert.equal(Page.props.modern.default, false);
  async function render(modern) {
    calls.length = 0;
    let instance;
    const choices = [];
    const capture = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.props?.class?.includes("selection-box")) choices.push(node);
      if (Array.isArray(node.children)) node.children.forEach(capture);
    };
    const product = {
      id: 31,
      type: "PHYSICAL",
      pricing: "FIX",
      price: 100,
      currency: "USD",
      commission: 2,
      discount: 10,
      dis_start: "2026-10-01",
      dis_end: "2026-10-31",
      created_at: "2026-01-01",
      price_label: "/ unit",
    };
    const custom = { ...product, variant_id: 4 };
    const app = Vue.createSSRApp(
      {
        ...Page,
        render(...args) {
          instance = this;
          const node = compiled.apply(this, args);
          capture(node);
          return node;
        },
      },
      {
        shop: { id: 7, currencies: ["USD"] },
        product,
        customObject: custom,
        instanceMode: true,
        instanceVariantPricing: true,
        instanceOriginalProduct: product,
        instanceVariantId: 4,
        light: true,
        transparent: true,
        ...(modern === undefined ? {} : { modern }),
      },
    );
    for (const name of [
      "v-sheet",
      "v-col",
      "v-row",
      "v-img",
      "v-icon",
      "v-tooltip",
      "v-list-subheader",
      "v-btn",
      "v-slide-y-transition",
      "v-slide-y-reverse-transition",
      "v-expand-transition",
      "v-expansion-panels",
      "v-expansion-panel",
      "v-expansion-panel-title",
      "v-expansion-panel-text",
      "v-text-field",
      "v-table",
      "v-radio",
      "v-radio-group",
      "u-widget-header",
      "u-price",
    ])
      app.component(name, leaf(name));
    app.directive("ctrl", { getSSRProps: () => ({}) });
    Object.assign(app.config.globalProperties, {
      $t: (key) => key,
      $route: { params: {}, matched: [] },
      $vuetify: { display: { smAndUp: true } },
    });
    const html = await renderToString(app);
    return {
      html,
      document: new JSDOM(html).window.document,
      calls: [...calls],
      choices,
      instance,
    };
  }
  const legacy = await render();
  const modern = await render(true);
  assert.equal(
    legacy.document.querySelector(".b-product-edit-price--modern"),
    null,
  );
  assert.ok(legacy.document.querySelector(".widget-box.price-input-form"));
  assert.ok(
    modern.document.querySelector(
      ".b-product-edit-price--modern.sd-modern-form",
    ),
  );
  assert.ok(
    modern.document.querySelector(".price-input-form.sd-modern-widget"),
  );
  const header = modern.calls.find(
    (call) => call.name === "u-widget-header",
  ).attrs;
  assert.match(header.class, /sd-modern-form-header/);
  for (const state of [legacy, modern]) {
    const prices = state.calls.filter((call) => call.name === "UPriceInput");
    assert.deepEqual(
      prices.map((call) => call.attrs.modelValue),
      [100, 2, 10],
    );
    const dates = state.calls.filter((call) => call.name === "UDateInput");
    assert.deepEqual(
      dates.map((call) => call.attrs.modelValue),
      ["2026-10-01", "2026-10-31"],
    );
    assert.equal(dates[0].attrs.max, "2026-10-31");
    assert.equal(dates[1].attrs.min, "2026-10-01");
    assert.ok(
      state.calls.some(
        (call) =>
          call.name === "v-text-field" && call.attrs.modelValue === "/ unit",
      ),
    );
    assert.match(
      state.html,
      state === modern ? /modern\.quantity_pricing/ : /extra_pricings\.title/,
    );
  }
  assert.equal(modern.choices.length, 2);
  for (const choice of modern.choices) {
    assert.equal(choice.props.role, "button");
    assert.equal(choice.props.tabindex, "0");
  }
  for (const [index, key, expected] of [
    [1, " ", false],
    [0, "Enter", true],
  ]) {
    let prevented = false;
    const event = {
      key,
      preventDefault() {
        prevented = true;
      },
    };
    for (const handler of [].concat(modern.choices[index].props.onKeydown))
      handler(event);
    assert.equal(prevented, true);
    assert.equal(modern.instance.variant_pricing, expected);
  }
});

for (const [name, path, title] of [
  ["price", "./price/BInventoryBulkPrice.vue", "bulk_price_dialog.title"],
  [
    "discount",
    "./discount/BInventoryBulkDiscount.vue",
    "inventory_list.bulk_discount_dialog.title",
  ],
]) {
  const file = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: `bulk-${name}-test`,
  });
  assert.deepEqual(template.errors, []);

  function setup() {
    const calls = [],
      reports = [];
    const leaf = (name) =>
      Vue.defineComponent({
        inheritAttrs: false,
        setup(_, { attrs, slots }) {
          return () => {
            calls.push({ name, attrs });
            return Vue.h(
              name === "v-btn" ? "button" : "div",
              { ...attrs, "data-leaf": name },
              [slots.label?.(), slots.default?.()],
            );
          };
        },
      });
    const dependency = (source) => {
      if (source === "vue") return Vue;
      if (source.includes("formatDiscountPeriod"))
        return { formatDiscountPeriod };
      if (source === "lodash-es") return { throttle: (fn) => fn };
      if (source.includes("BusinessModel"))
        return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (source.endsWith(".vue"))
        return { default: leaf(source.split("/").at(-1).replace(".vue", "")) };
      if (source.includes("NotificationService")) return { default: {} };
      throw new Error("Unexpected dependency " + source);
    };
    const Page = {
      ...evaluate(descriptor.script.content, dependency).default,
      render: evaluate(template.code, dependency).render,
    };
    async function render(modern) {
      calls.length = 0;
      const category = { id: 42, title: "Existing category" };
      const app = Vue.createSSRApp(
        {
          ...Page,
          data() {
            return {
              ...Page.data.call(this),
              bulk_category: 42,
              bulk_vendor: 9,
              bulk_check: true,
              bulk_percent: 5,
              bulk_constant: 12.5,
              bulk_currency: "USD",
              bulk_ending: 99,
              marketplace_listing_price_fix_strategy: "min",
              mode: "constant",
              dis_start: "2026-10-01T00:00:00Z",
              dis_end: "2026-10-31T00:00:00Z",
              report: { count_products: 8, count_variants: 10 },
              preview: true,
              dialog_pre: true,
            };
          },
          methods: {
            ...Page.methods,
            fetchReport() {
              reports.push(this.bulk_category);
            },
          },
        },
        {
          modelValue: true,
          shop: { id: 7, model: "MARKETPLACE", currencies: ["USD"] },
          category,
          ...(modern === undefined ? {} : { modern }),
        },
      );
      for (const component of [
        "v-dialog",
        "v-card",
        "v-card-title",
        "v-card-text",
        "v-card-actions",
        "v-tabs",
        "v-tab",
        "v-window",
        "v-window-item",
        "v-list-subheader",
        "v-expand-transition",
        "v-avatar",
        "v-icon",
        "v-tooltip",
        "v-chip",
        "v-btn",
        "u-widget-header",
        "u-loading-progress",
      ])
        app.component(component, leaf(component));
      app.config.globalProperties.$t = (key) => key;
      app.config.globalProperties.$i18n = { locale: "en" };
      app.config.globalProperties.getShopImagePath = (icon) => `/local/${icon}`;
      const html = await renderToString(app);
      return {
        html,
        document: new JSDOM(html).window.document,
        calls: [...calls],
      };
    }
    return { Page, render, reports };
  }

  test(`${name} dialog Vue, TypeScript and scoped Sass compile`, async () => {
    setup();
    await compileScopedStyles(descriptor, file, `bulk-${name}-test`);
  });

  test(`${name} modern presentation is opt-in and retains report, Verify, preview and Apply data`, async () => {
    const f = setup();
    assert.equal(f.Page.props.modern.default, false);
    const legacy = await f.render();
    const modern = await f.render(true);
    assert.equal(legacy.document.querySelector(".sd-modern-canvas"), null);
    assert.ok(legacy.document.querySelector(".widget-box"));
    assert.equal(
      modern.document.querySelectorAll(
        `.sd-modern-canvas.b-inventory-bulk-${name}`,
      ).length,
      2,
    );
    assert.ok(modern.document.querySelector(".sd-modern-widget"));
    assert.ok(modern.document.querySelector(".b-inventory-bulk-dialog__grid"));
    assert.match(modern.html, new RegExp(title.replaceAll(".", "\\.")));
    for (const state of [legacy, modern]) {
      assert.match(state.html, /8/);
      if (name === "discount") assert.match(state.html, /10/);
      assert.equal(
        state.calls.find((call) => call.name === "USmartVerify").attrs
          .modelValue,
        true,
      );
      const preview = state.calls.find(
        (call) => call.name === "BInventoryBulkPreview",
      ).attrs;
      assert.match(preview.url, new RegExp(`/local/shops/7/${name}-preview$`));
      assert.equal(preview.params.category, 42);
      assert.equal(preview.params.percent, 5);
      assert.ok(
        state.calls.find(
          (call) =>
            call.name === "v-btn" &&
            call.attrs.onClick &&
            call.attrs.variant === "elevated",
        ),
      );
    }
    const before = legacy.calls.find(
      (call) => call.name === "BInventoryBulkPreview",
    ).attrs;
    const after = modern.calls.find(
      (call) => call.name === "BInventoryBulkPreview",
    ).attrs;
    assert.deepEqual(plain(after.params), plain(before.params));
    assert.equal(after["has-currency"], before["has-currency"]);
    if (name === "price") {
      assert.equal(after.params.vendor, 9);
      assert.equal(after.params.currency, "USD");
      assert.equal(after.params.constant, 12.5);
      assert.equal(after.params.mode, "constant");
      assert.ok(modern.calls.some((call) => call.name === "BVendorInput"));
      assert.ok(
        modern.calls.some(
          (call) => call.name === "v-tab" && call.attrs.value === "marketplace",
        ),
      );
      assert.ok(
        modern.document.querySelector(".b-inventory-bulk-dialog__tabs"),
      );
      assert.equal(after.modern, true);
      assert.equal(before.modern, false);
      for (const state of [legacy, modern]) {
        const percent = state.calls.find(
          (call) => call.name === "UNumberInput",
        ).attrs;
        assert.equal(percent.decimal, 1);
        assert.equal(percent.min, -90);
        assert.equal(percent.max, 90);
        assert.equal(percent.step, 0.5);
        assert.equal(percent.suffix, state === modern ? "%" : undefined);
        assert.equal(
          percent["prepend-inner-icon"],
          state === modern ? undefined : "fa:fas fa-percent",
        );
        const prices = state.calls.filter(
          (call) => call.name === "UPriceInput",
        );
        assert.equal(prices[0].attrs.modelValue, 12.5);
        assert.ok(Object.hasOwn(prices[0].attrs, "allow-negative"));
        assert.equal(prices[1].attrs.modelValue, 99);
        assert.ok(!Object.hasOwn(prices[1].attrs, "allow-negative"));
        const strategy = state.calls.find(
          (call) => call.name === "USmartSelect",
        ).attrs;
        assert.deepEqual(
          plain(strategy.items).map((item) => item.value),
          ["min", "max"],
        );
      }
    } else {
      assert.equal(after.params.dis_start, "2026-10-01T00:00:00Z");
      assert.equal(after.params.dis_end, "2026-10-31T00:00:00Z");
      assert.ok(modern.calls.some((call) => call.name === "BCategoryParent"));
      const dates = modern.calls
        .filter((call) => call.name === "UDateInput")
        .map((call) => call.attrs);
      assert.equal(dates.length, 2);
      assert.equal(dates[0].max, after.params.dis_end);
      assert.equal(dates[1].min, after.params.dis_start);
      for (const date of dates) assert.ok(Object.hasOwn(date, "return-utc"));
    }
    const legacyApply = legacy.calls.findLast(
      (call) => call.name === "v-btn" && call.attrs.variant === "elevated",
    ).attrs;
    const modernApply = modern.calls.findLast(
      (call) => call.name === "v-btn" && call.attrs.variant === "elevated",
    ).attrs;
    assert.equal(legacyApply.color, name === "price" ? "success" : "#C2185B");
    assert.equal(modernApply.color, "primary");
    assert.match(modernApply.class, /sd-modern-button/);
  });
}
