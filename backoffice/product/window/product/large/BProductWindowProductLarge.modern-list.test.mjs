import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import vm from "node:vm";
import { compile } from "@vue/compiler-dom";
import { parse, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BProductWindowProductLarge.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function evaluate(code, globals = {}) {
  const exports = {};
  vm.runInNewContext(code, { exports, require: (path) => {
    if (path === "../../models") return { Basket: {} };
    assert.ok(path.endsWith(".svg"), "Only local enum assets may be required");
    return path;
  }, ...globals });
  return exports;
}
const enums = Object.fromEntries(["ProductType", "ProductStatus", "ProductCondition", "PricingTypes"].map((name) => [
  name, evaluate(transpile(readFileSync(new URL("../../../../../../core-js/enums/product/" + name + ".ts", import.meta.url), "utf8")))[name],
]));
const syntax = ts.createSourceFile("product.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = syntax.statements.find(ts.isExportAssignment).expression.getText(syntax);
const component = evaluate(transpile("export default " + options), {
  ...enums, ProductMixin: {}, DateMixin: {}, CircleImage: {}, UPriceInvalid: {},
  BNoteButton: {}, ProductVariantsView: {}, UTimeProgressBar: {},
  window: { CDN: { GET_CONNECT_ICON: (id) => "/fixture/connect/" + id } },
}).default;
const render = new Function("Vue", "require", compile(descriptor.template.content, {
  mode: "function", prefixIdentifiers: true,
}).code)({ ...Vue, resolveComponent: (name) => ({ name }), resolveDynamicComponent: (name) => name,
  withDirectives: (node, directives) => Object.assign(node, { testDirectives: directives }),
}, (path) => path);
const previousLimitWords = Object.getOwnPropertyDescriptor(String.prototype, "limitWords");
Object.defineProperty(String.prototype, "limitWords", { configurable: true, value(n) { return this.split(" ").slice(0, n).join(" "); } });
after(() => previousLimitWords ? Object.defineProperty(String.prototype, "limitWords", previousLimitWords) : delete String.prototype.limitWords);
const plain = (value) => JSON.parse(JSON.stringify(value));
const event = (extra = {}) => ({ ctrlKey: false, metaKey: false, stopPropagation() {}, preventDefault() {}, ...extra });
function children(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node.children)) return node.children;
  if (node.children && typeof node.children === "object")
    return Object.values(node.children).filter((value) => typeof value === "function").flatMap((slot) => slot());
  return typeof node.children === "string" ? [node.children] : [];
}
function all(node) { return Array.isArray(node) ? node.flatMap(all) : node && typeof node === "object" ? [node, ...children(node).flatMap(all)] : []; }
const named = (tree, name) => all(tree).filter((node) => node.type === name || node.type?.name === name);
const hasClass = (node, name) => String(node.props?.class || "").split(/\s+/).includes(name);
const byClass = (tree, name) => all(tree).find((node) => hasClass(node, name));
function text(node) { return Array.isArray(node) ? node.map(text).join("") : typeof node === "string" ? node : children(node).map(text).join(""); }
function fixture(props = {}, patch = {}) {
  const emitted = [], routes = [], prices = [];
  const defaults = Object.fromEntries(Object.entries(component.props).map(([key, config]) => [key, config === Boolean ? false : config.default]));
  const product = { id: 31, title: "Fixture product", title_en: "Secondary title", type: "PHYSICAL", status: "Open",
    icon: "fixture.png", price: 20, currency: "EUR", commission: 2, discount: 3, unit: "piece", quantity: 3,
    sells: 12, visits: 81, pricing: "FIX", original: true, condition: "new", variants: [], note: [], rate: 4.5, rate_count: 2,
    ...props.product };
  const state = { ...defaults, ...component.data(), modernList: true, multiSelectProducts: true,
    showEditButton: true, showPrice: true, showStatistics: true, showRatting: true, ...props, product, shop: { id: 7 },
    $: { uid: 123 }, $route: { params: {}, matched: [] }, $store: { getters: { getUploadingKeeper: {} } },
    $router: { push: (route) => routes.push(route) }, $emit: (...args) => emitted.push(args),
    $t: (key, values) => key + (values ? " " + JSON.stringify(values) : ""),
    IMAGE_SIZE_SMALL: 64, getShopImagePath: (path) => "/fixture/" + path, getProductTypeImage: () => "type.svg",
    getProductTypeName: (type) => type, getFromNowString: () => "2 hours ago", numeralFormat: (value) => String(value ?? 0),
    CalcPriceProductCurrentCurrency: (...args) => { prices.push(args); return state.converted; },
    discountProductPercent: () => 15, converted: 24, ...patch };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return { state, emitted, routes, prices, view: () => render(state, []), click: (node, e = event()) => node.props.onClick(e) };
}

test("modern row is opt-in and both SFC branches compile", () => {
  assert.equal(component.props.modernList.default, false);
  assert.equal(component.props.multiSelectProducts.default, false);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "product-list-test" }).errors, []);
  assert.deepEqual(compileStyle({ source: descriptor.styles[0].content, filename: file.pathname, id: "data-v-product-list-test", scoped: true, preprocessLang: "scss" }).errors, []);
  const old = fixture({ modernList: false });
  assert.equal(named(old.view(), "s-widget").length, 1);
  assert.equal(named(old.view(), "article").length, 0);
  old.click(named(old.view(), "s-widget")[0]);
  assert.deepEqual(old.emitted, [["select"]]);
});

test("row, product checkbox and modifier selection emit the original events", () => {
  const f = fixture();
  f.click(byClass(f.view(), "b-product-list__row"));
  assert.deepEqual(f.emitted.pop(), ["select"]);
  for (const modifier of [{ ctrlKey: true }, { metaKey: true }]) {
    f.click(byClass(f.view(), "b-product-list__name"), event(modifier));
    assert.deepEqual(f.emitted.pop(), ["onSelect", f.state.product]);
  }
  const checkbox = named(f.view(), "input")[0];
  checkbox.props.onChange(event());
  assert.deepEqual(f.emitted.pop(), ["onSelect", f.state.product]);
  f.state.multiSelectProducts = false;
  assert.equal(named(f.view(), "input").length, 0);
  f.click(byClass(f.view(), "b-product-list__name"), event({ ctrlKey: true }));
  assert.deepEqual(f.emitted.pop(), ["select"]);
  f.state.showSelect = true;
  f.click(byClass(f.view(), "b-product-list__name"));
  assert.deepEqual(f.emitted.pop(), ["onSelect", f.state.product]);
});

test("details are independent of Edit and native route/event payloads survive", () => {
  const f = fixture();
  const details = () => named(f.view(), "v-btn").find((node) => node.props["aria-controls"]);
  assert.equal(details().props["aria-expanded"], false);
  f.click(details()); assert.equal(details().props["aria-expanded"], true);
  assert.equal(byClass(f.view(), "b-product-list__details").testDirectives[0][1], true);
  const edit = byClass(f.view(), "b-product-list__edit");
  assert.deepEqual(plain(edit.props.to), { name: "BPageProductEdit", params: { product_id: 31 }, hash: "#general" });
  f.click(byClass(f.view(), "b-product-list__price-value"));
  assert.equal(f.routes.pop().hash, "#price");
  const imageEvent = event(); f.click(byClass(f.view(), "b-product-list__image"), imageEvent);
  assert.deepEqual(f.emitted.pop(), ["click:image", imageEvent]);
  const more = named(f.view(), "v-btn").find((node) => String(node.props["aria-label"]).includes("more_product"));
  const menuEvent = event(); f.click(more, menuEvent);
  assert.deepEqual(f.emitted.pop(), ["contextmenu", menuEvent]);
  f.state.showEditButton = false;
  assert.equal(byClass(f.view(), "b-product-list__edit"), undefined);
  assert.ok(details());
  f.click(byClass(f.view(), "b-product-list__price-value"));
  assert.equal(f.routes.length, 0);
});

test("converted price reuses the current helper and raw details retain native currency and timing", () => {
  const variant = { id: 5, price: 8 };
  const f = fixture({ filterVariant: variant, product: { dis_start: "start", dis_end: "end", created_at: "created" } });
  assert.equal(f.state.price_converted, 24);
  assert.deepEqual(f.prices.pop(), [f.state.shop, variant, null]);
  const amounts = named(f.view(), "u-price").map((node) => [node.props.amount, node.props.currency]);
  assert.deepEqual(amounts, [[24, undefined], [20, "EUR"], [2, "EUR"], [3, "EUR"]]);
  const timing = named(f.view(), "u-time-progress-bar")[0];
  assert.equal(timing.props["start-time"], "start"); assert.equal(timing.props["end-time"], "end");
  assert.equal(timing.props.modern, "");
  for (const invalid of [null, NaN]) { f.state.converted = invalid; assert.equal(named(f.view(), "u-price-invalid").length, 1); }
  f.state.converted = 0;
  assert.ok(byClass(f.view(), "b-product-list__price-warning"));
});

test("native field flags, file stock, reviews and status meaning remain accurate", () => {
  const f = fixture();
  assert.ok(byClass(f.view(), "b-product-list__stock-warning"));
  f.state.product.type = "FILE"; f.state.product.quantity = 0;
  assert.equal(f.state.quantity, 999);
  assert.ok(text(byClass(f.view(), "b-product-list__stock")).includes("∞"));
  f.state.product.rate_count = 0;
  assert.ok(text(f.view()).includes("list_view.no_reviews"));
  for (const [status, expected] of [["Open", "success"], ["Close", "error"], ["Rejected", "error"], ["Pending", "warning"], ["Unlisted", null]]) {
    f.state.product.status = status;
    const marker = byClass(f.view(), "sd-modern-status__dot");
    assert.equal(expected ? hasClass(marker, "sd-modern-status__dot--" + expected) : String(marker.props.class).includes("__dot--"), Boolean(expected));
    const statusLabel = byClass(f.view(), "b-product-list__status");
    const help = named(statusLabel, "v-tooltip");
    assert.equal(help.length, status === "Open" ? 0 : 1);
    if (help.length) {
      assert.ok(text(help[0]).includes(enums.ProductStatus[status].description));
      assert.equal(statusLabel.props.tabindex, 0);
    }
  }
  for (const guard of [{ showPrice: false }, { compactMode: true }, { extended: false }, { showStatistics: false, showRatting: false }]) {
    const g = fixture(guard);
    if (guard.showPrice === false) assert.equal(named(g.view(), "u-price").length, 0);
    else if (guard.compactMode || guard.extended === false) assert.equal(named(g.view(), "u-time-progress-bar").length, 0);
    assert.equal(named(g.view(), "v-rating").length, guard.showPrice === false ? 1 : 0);
  }
});

test("vendor ownership guard, variants, media, upload progress and notes are retained", () => {
  const f = fixture({ showNotes: true, shortcut: true, filterVariant: { id: 4 }, product: {
    connect_id: 2, parent_id: 9, ar_src: "ar.glb", video: "video.mp4", reselling: true,
    original: false, condition: "used", vendors: [{ id: 8, name: "Assigned vendor", enable: true }], variants: [{ id: 4 }, { id: 6 }],
  } });
  assert.deepEqual(plain(named(f.view(), "product-variants-view")[0].props.variants), [{ id: 4 }]);
  assert.ok(text(f.view()).includes("Assigned vendor"));
  assert.ok(text(f.view()).includes("global.commons.fake"));
  assert.equal(named(f.view(), "router-link").length, 3);
  assert.ok(byClass(f.view(), "b-product-list__image").props["drop-image"]);
  f.state.$store.getters.getUploadingKeeper = { upload: { target: { product: 31 }, progress: 47 } };
  assert.ok(named(f.view(), "v-progress-circular").some((node) => node.props["model-value"] === 47));
  f.click(named(f.view(), "b-note-button")[0]);
  assert.deepEqual(f.emitted.pop(), ["onShowNote", f.state.product]);
  f.state.$route = { params: { vendor_id: 8 }, matched: [{ meta: { vendor: true } }] };
  assert.equal(f.state.disabled, true);
  assert.equal(named(f.view(), "article")[0].props.inert, true);
  f.click(byClass(f.view(), "b-product-list__name"));
  assert.equal(f.emitted.length, 0);
  f.state.product.vendor = { id: 8, name: "Owner vendor", enable: true, icon: "vendor.png" };
  assert.equal(f.state.disabled, false);
  assert.equal(byClass(f.view(), "b-product-list__edit").props.to.name, "Vendor_AddProduct");
  assert.equal(named(f.view(), "router-link").length, 2);
  f.state.restoring = true;
  assert.equal(named(f.view(), "article")[0].props["aria-busy"], true);
});

test("compact image preserves row selection without gaining an image editor or drop target", () => {
  const f = fixture({ compactMode: true });
  const image = byClass(f.view(), "b-product-list__image");
  assert.equal(image.props["drop-image"], undefined);
  assert.equal(image.props.role, undefined);
  assert.equal(image.props.tabindex, undefined);
  assert.equal(named(image, "v-tooltip").length, 0);
  f.click(image);
  assert.deepEqual(f.emitted, [["select"]]);
  f.state.showSelect = true;
  f.click(image);
  assert.deepEqual(f.emitted.pop(), ["onSelect", f.state.product]);
});

test("inline variants reuse native data and keep the complete Details disclosure", () => {
  const variants = [
    { id: 1, color: "#000000", type: "M", style: "Crew" },
    { id: 2, color: "#ffffff", type: "L", style: "Long variant label" },
    { id: 3, color: "#ff0000", type: "XL", pack: "2" },
  ];
  const f = fixture({ product: { variants } });
  const inline = byClass(f.view(), "b-product-list__variants");
  assert.equal(inline.type.name, "product-variants-view");
  assert.equal(inline.props.variants, variants);
  assert.equal(inline.props["single-line"], "");
  assert.equal(inline.props.limit, 3);
  const complete = () => named(byClass(f.view(), "b-product-list__details"), "product-variants-view")[0];
  assert.equal(complete().props.variants, variants);
  assert.equal(complete().props.limit, undefined);
  f.state.filterVariant = variants[1];
  for (const node of named(f.view(), "product-variants-view")) assert.deepEqual(node.props.variants, [variants[1]]);
  for (const guard of ["compactMode", "extended"]) {
    f.state[guard] = guard === "compactMode";
    assert.equal(byClass(f.view(), "b-product-list__variants"), undefined);
    assert.ok(complete());
    f.state[guard] = guard !== "compactMode";
  }
  f.state.modernList = false;
  assert.equal(byClass(f.view(), "b-product-list__variants"), undefined);
  assert.equal(named(f.view(), "product-variants-view").length, 1);
  assert.deepEqual(f.emitted, []);
});
