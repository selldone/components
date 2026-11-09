import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

const root = new URL("../../../../", import.meta.url); // @selldone/
const read = (path) => readFileSync(new URL(path, root), "utf8");
const run = (source, require) => {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require,
      Math,
      Number,
      Intl,
      Object,
      JSON,
      Set,
      getComputedStyle: () => ({ direction: "ltr" }),
    },
  );
  return exports;
};

const thresholds = run(
  read("core-js/enums/product/ProductThresholds.ts"),
  () => ({}),
);
const ProductType = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
    code,
    { code },
  ]),
);
const options = run(
  parse(
    read(
      "components-vue/backoffice/product/thresholding/BProductThresholding.vue",
    ),
  ).descriptor.script.content,
  (name) =>
    name.includes("ProductThresholds")
      ? thresholds
      : name.includes("ProductType")
        ? { ProductType }
        : { default: {} },
).default;

function view(product, { vendor = false } = {}) {
  const state = {
    ...options.data(),
    modern: true,
    $product: product,
    $t: (key, values) => (values ? `${key} ${JSON.stringify(values)}` : key),
    $route: {
      params: vendor ? { vendor_id: 1 } : {},
      matched: vendor ? [{ meta: { vendor: true } }] : [],
    },
  };
  for (const [name, getter] of Object.entries(options.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  for (const [name, method] of Object.entries(options.methods))
    state[name] = method.bind(state);
  options.created.call(state);
  return state;
}
// Product 1 on the local store: custom rules, 3,866 in stock, 774 sold.
const product = () => ({
  type: "PHYSICAL",
  quantity: 3866,
  sells: 774,
  thresholds: {
    custom: true,
    variables: {
      critical: { minSales: 50, maxQuantity: 100 },
      high: { minSales: 10 },
      moderate: { minSales: 2, minQuantity: 20, maxQuantity: 200 },
      low: { minSales: 1, minQuantity: 1, maxQuantity: 20 },
    },
    progress: 0.29,
    carts: 0.15,
  },
});
const keyOf = (condition) => condition?.key ?? null;

test("the shared matcher picks the first rule whose sales and stock both match", () => {
  const { FindProductThresholdCondition: find } = thresholds;
  const rules = [
    { key: "critical", minSales: 50, maxQuantity: 100 },
    { key: "high", minSales: 10 },
    { key: "low", minQuantity: 1, maxQuantity: 20 },
  ];
  assert.equal(keyOf(find(rules, 100, 51)), "critical"); // stock bounds are inclusive
  assert.equal(keyOf(find(rules, 101, 51)), "high");
  assert.equal(keyOf(find(rules, 500, 10)), null); // sales must be strictly greater
  assert.equal(keyOf(find(rules, 20, 0)), "low");
  assert.equal(find(null, 5, 5), null);
});

test("the preview mirrors the storefront for this product's custom rules", () => {
  const state = view(product());
  // It opens on "Selling fast": message, progress bar and cart notice all show.
  assert.equal(state.activePreset, "selling_fast");
  assert.equal(keyOf(state.preview_condition), "critical"); // 140 sold, 60 left
  assert.equal(state.preview_progress, true); // 70% sold
  assert.match(state.preview_message, /have_in_their_bag/); // 12 in carts ≥ 60 × 15%
  state.sim = { ...state.presets[0].sim };
  assert.equal(state.activePreset, "this_product");
  assert.equal(keyOf(state.preview_condition), "high");
  assert.match(
    state.preview_why,
    /why_match .*"level":"b_product_inventory.thresholds.levels.high".*cond_sold/,
  );
  assert.equal(state.preview_progress, false); // 17% sold, needs 29%
  assert.match(
    state.preview_why,
    /why_progress_hidden \{"share":17,"need":29\}/,
  );
  state.sim = { s: 9, d: 30, c: 3 };
  assert.equal(keyOf(state.preview_condition), "high"); // 30 sold beats High's 10 before Low is checked
  state.sim = { s: 9, d: 5, c: 3 };
  assert.equal(keyOf(state.preview_condition), "low");
  assert.equal(state.preview_progress, true); // 36% sold
  assert.match(state.preview_message, /have_in_their_bag/); // 3 in carts ≥ 9 × 15%
  state.sim = { s: 0, d: 30, c: 0 };
  assert.equal(state.preview_condition, null);
  assert.equal(state.preview_visible, false);
});

test("store defaults ignore the product's values and lock editing", () => {
  const state = view(product());
  state.setCustom(false);
  assert.equal(state.setting_changed, true);
  assert.equal(
    state.active_conditions.find((c) => c.key === "high").minSales,
    5,
  );
  assert.equal(state.active_progress, 0.1);
  assert.equal(state.active_carts, 0.1);
  state.setVariable("high", "minSales", "99");
  assert.equal(state.variables.high.minSales, 10); // not editable in defaults mode
  state.discardChanges();
  assert.equal(state.custom, true);
  assert.equal(state.setting_changed, false);
  state.setVariable("high", "minSales", "");
  assert.equal(state.variables.high.minSales, null); // empty box: no limit
  state.setVariable("high", "minSales", "-4.6");
  assert.equal(state.variables.high.minSales, 0);
});

test("vendors see the rules but cannot change them", () => {
  const state = view(product(), { vendor: true });
  assert.equal(state.editable, false);
  state.setCustom(false);
  assert.equal(state.custom, true);
  assert.equal(state.setting_changed, false);
});

test("the map draws the winning rule on top and clicks map back to stock and sales", () => {
  const state = view(product());
  assert.equal(JSON.stringify(state.map_scale), '{"x":250,"y":100}');
  const regions = state.map_regions;
  assert.equal(
    JSON.stringify(regions.map((r) => r.key)),
    '["low","moderate","high","critical"]',
  );
  const critical = regions.at(-1);
  assert.equal(Math.round(critical.x), 4); // stock 1
  assert.equal(Math.round(critical.w), 400); // up to 100 of 250
  assert.equal(
    Math.round(critical.h),
    Math.round((1 - Math.sqrt(51 / 100)) * 220),
  ); // sold above 50, √ scale
  assert.equal(
    JSON.stringify(state.map_ticks.x.map((t) => t.value)),
    "[0,50,100,150,200,250]",
  );
  state.sim = { s: 3866, d: 774, c: 0 };
  assert.equal(JSON.stringify(state.map_point), '{"x":100,"y":100}'); // clamped to the corner
  state.pickPoint({
    clientX: 50,
    clientY: 75,
    currentTarget: {
      getBoundingClientRect: () => ({
        left: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
      }),
    },
  });
  assert.equal(JSON.stringify(state.sim), '{"s":125,"d":6,"c":0}'); // y 25% → (0.25)² × 100
});

test("file products match on sales only", () => {
  const state = view({
    type: "FILE",
    quantity: 0,
    sells: 60,
    thresholds: null,
  });
  assert.equal(state.needs_stock, false);
  assert.equal(keyOf(state.preview_condition), "critical"); // "Selling fast": 140 sold > 100, stock ignored
  state.sim = { ...state.presets[0].sim };
  assert.equal(keyOf(state.preview_condition), "high"); // this file: 60 > 50
  assert.equal(state.preview_progress, false);
  assert.equal(state.preview_cart_message, "");
});

test("every Urgency messages string exists in English and Persian with the same placeholders", () => {
  const dictionaries = ["en", "fa"].map(
    (locale) =>
      run(read(`translate/dashboard/${locale}.ts`), () => ({})).default,
  );
  const source = read(
    "components-vue/backoffice/product/thresholding/BProductThresholding.vue",
  );
  const keys = new Set(
    [...source.matchAll(/b_product_urgency\.([a-z_]+)(?=["'])/g)].map(
      (m) => m[1],
    ),
  );
  for (const preset of [
    "this_product",
    "selling_fast",
    "almost_gone",
    "just_launched",
  ])
    keys.add(`preset_${preset}`);
  for (const key of keys) {
    const [en, fa] = dictionaries.map((d) => d.b_product_urgency?.[key]);
    assert.equal(typeof en, "string", `Missing English: ${key}`);
    assert.equal(typeof fa, "string", `Missing Persian: ${key}`);
    const names = (text) =>
      [...text.matchAll(/\{(\w+)\}/g)]
        .map((m) => m[1])
        .sort()
        .join();
    assert.equal(names(en), names(fa), key);
  }
  for (const d of dictionaries)
    assert.equal(typeof d.add_product.menu.urgency, "string");
});
