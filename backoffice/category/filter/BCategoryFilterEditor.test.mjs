import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";

const file = new URL("./BCategoryFilterEditor.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "category-filter-test" });
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "category-filter-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const windowSource = parse(readFileSync(new URL("../../product/window/BProductsWindow.vue", import.meta.url), "utf8"));
assert.deepEqual(windowSource.errors, []);
const astNodes = (node) => [node, ...(node.children || []).flatMap(astNodes)];
const filterDialog = astNodes(baseParse(windowSource.descriptor.template.content)).find((node) => node.tag === "v-dialog" && node.props.some((prop) => prop.name === "model" && prop.exp?.content === "dialog_root_filter"));
assert.ok(filterDialog, "Use the actual catalog host's guarded filter dialog");
const renderFilterDialog = new Function("Vue", compile(filterDialog.loc.source, { mode: "function", prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: (name) => ({ name }) });
function dialogEditor(node) {
  if (Array.isArray(node)) return node.map(dialogEditor).find(Boolean);
  if (!node || typeof node !== "object") return undefined;
  if (node.type?.name === "b-category-filter-editor") return node.props;
  return dialogEditor(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
const assetFile = new URL("../../../ui/variant/asset/image/UVariantAssetImage.vue", import.meta.url);
const { descriptor: assetSource, errors: assetErrors } = parse(readFileSync(assetFile, "utf8"));
assert.deepEqual(assetErrors, []);
const assetTemplate = compileTemplate({ source: assetSource.template.content, filename: assetFile.pathname, id: "category-filter-asset-test" });
assert.deepEqual(assetTemplate.errors, []);
const transpile = (source) => ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const plain = (value) => JSON.parse(JSON.stringify(value));
const enabled = (value) => value === true || value === "";
const prop = (node, key) => node.props[key] ?? node.props[key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const packs = Object.fromEntries(["en", "fa"].map((language) => {
  const load = (kind) => {
    const source = readFileSync(new URL(`../../../../translate/${kind}/${language}.ts`, import.meta.url), "utf8");
    assert.deepEqual(ts.createSourceFile(`${language}.ts`, source, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
    const exports = {};
    new Function("exports", "require", transpile(source).outputText)(exports, (name) => {
      assert.equal(name, `./colors/${language}`);
      const colors = {};
      new Function("exports", transpile(readFileSync(new URL(`../../../../translate/global/colors/${language}.ts`, import.meta.url), "utf8")).outputText)(colors);
      return colors;
    });
    return exports.default;
  };
  return [language, { ...load("dashboard"), global: load("global") }];
}));
const variantSource = ts.createSourceFile("variants.ts", readFileSync(new URL("../../../../core-js/enums/product/ProductVariants.ts", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true);
const variantLiteral = variantSource.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations)
  .find((declaration) => declaration.name.getText(variantSource) === "ProductVariants").initializer.getText(variantSource);
const element = (type, text = "") => ({ type, text, props: {}, style: {}, children: [], parent: null });
const remove = (node) => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; };
const renderer = Vue.createRenderer({
  createElement: (type) => element(type), createText: (text) => element("text", text), createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) { remove(node); const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, node); node.parent = parent; },
  remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; }, parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const stub = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(name, attrs, [slots.label?.(), slots.default?.()]) });
const descendants = (node) => [node, ...node.children.flatMap(descendants)];
const text = (node) => node.type === "comment" ? "" : node.text + node.children.map(text).join(" ");
const renderedVNodes = (node) => !node ? [] : [node, ...(node.component ? renderedVNodes(node.component.subTree) : Array.isArray(node.children) ? node.children.flatMap(renderedVNodes) : [])];
const saved = () => ({ prices: [{ currency: "USD", min: 12, max: 45 }, { currency: "EUR", min: 10, max: 40 }, { currency: null, min: 0, max: 0 }],
  brands: ["Example", "Sample"], colors: ["#ff0000", "#0000ff"], styles: ["Linen {sample-texture}", "Plain"], volumes: ["S", "M"],
  weights: ["1kg", "2kg"], packs: ["1", "2"], types: ["Cotton", "Linen"], Finish: ["Alpha Beta Gamma Delta", "Matte"], ignore: [] });

async function fixture(t, { filters = saved(), categoryId = 31, language = "en", custom = null, canonical = null, hideContext, embedded, catalogHost = false } = {}) {
  const calls = { requests: [], notifications: [], emitted: [], colors: [], format: [], currencyNames: [], imagePaths: [], errors: [], warnings: [], translations: [], closedWithFilters: [] };
  const variants = new Function(`return (${variantLiteral})`)();
  if (canonical) Object.assign(variants.volume, canonical);
  const originals = plain(variants);
  let asset;
  const currency = stub("u-currency-icon");
  const context = vm.createContext({ exports: {}, console, window: { API: {
    GET_CATEGORY_FILTER: (shop, category) => `/fixture/${shop}/categories/${category}/edit/filter`,
    PUT_EDIT_CATEGORY_FILTER: (shop, category) => `/fixture/${shop}/categories/${category}/edit/filter`,
  } }, axios: Object.fromEntries(["get", "put"].map((method) => [method, (url, body) => new Promise((resolve, reject) => calls.requests.push({ method, url, body: body && plain(body), resolve, reject }))])),
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("ProductVariants")) return { ProductVariants: variants };
      if (name.includes("ShopOptionsHelper")) return { ShopOptionsHelper: { GetCustomVariants: (shop) => shop.options?.find((option) => option.code === "variants")?.value || {} } };
      if (name.includes("ColorHelper")) return { GetNameOfColor: (value) => { calls.colors.push(value); return `Color name ${value}`; } };
      if (name.includes("CurrencyMixin")) return { default: { methods: {
        FormatNumberCurrency(value, code) { calls.format.push([value, code]); return `${code}:${value}`; },
        getCurrencyName(code) { calls.currencyNames.push(code); return `Currency ${code}`; },
      } } };
      if (name.includes("NotificationService")) return { default: Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map((method) => [method, (...args) => calls.notifications.push({ method, args })])) };
      if (name.endsWith("UVariantAssetImage.vue")) return { default: asset };
      if (name.endsWith("UCurrencyIcon.vue")) return { default: currency };
      if (name.endsWith(".vue")) return { default: stub(name.split("/").at(-1)) };
      if (["ObjectPrototypes", "ColorGenerator", "ShopTransportations"].some((dependency) => name.endsWith(dependency))) return {};
      throw new Error(`Unexpected filter dependency: ${name}`);
    } });
  const runModule = (source) => vm.runInContext(`(() => {${transpile(source).outputText}\n})()`, context);
  // Use the same string/array extensions as the application, inside the isolated SFC realm.
  for (const name of ["String", "Array"]) runModule(readFileSync(new URL(`../../../../core-js/prototypes/${name}Prototypes.ts`, import.meta.url), "utf8"));
  context.exports = {};
  runModule(assetSource.script.content);
  asset = context.exports.default;
  runModule(assetTemplate.code);
  asset.render = context.exports.render;
  context.exports = {};
  runModule(descriptor.script.content);
  const component = context.exports.default;
  context.exports = {};
  runModule(template.code);
  const render = context.exports.render;
  let state;
  const compiled = { ...component, render(...args) { state = this; return render.apply(this, args); } };
  const props = Vue.reactive({ shop: { id: 19, title: "Fixture catalog", options: custom ? [{ code: "variants", value: custom }] : [] }, category: { id: categoryId, title: categoryId === "root" ? undefined : "Fixture category", filters: filters && plain(filters) }, ...(hideContext === undefined ? {} : { hideContext }), ...(embedded === undefined ? {} : { embedded }) });
  const translate = (key, parameters = {}) => {
    calls.translations.push(key);
    const value = key.split(".").reduce((object, part) => object?.[part], packs[language]);
    if (/^(add_category|global)\./.test(key)) assert.equal(typeof value, "string", `Missing ${language} copy: ${key}`);
    return (typeof value === "string" ? value : key).replace(/\{(\w+)\}/g, (all, key) => parameters[key] ?? all);
  };
  let host;
  if (catalogHost) {
    props.shop.filters = filters && plain(filters); props.hideContext = true;
    const state = { IS_VENDOR_PANEL: false, shop: props.shop, parent_folders: categoryId === "root" ? null : props.category, hierarchy_items: [], $t: translate, getShopImagePath: (icon) => `/fixture-images/${icon}` };
    let opened = true;
    Object.defineProperty(state, "dialog_root_filter", { get: () => opened, set(value) { opened = value; if (!value) calls.closedWithFilters.push(plain((state.parent_folders || state.shop).filters)); } });
    host = { state, editor: dialogEditor(renderFilterDialog(state, [])) };
  }
  const app = renderer.createApp({ render: () => Vue.h(compiled, { ...props,
    "onEdit-filters": (value) => { calls.emitted.push(["edit-filters", value]); host?.editor.onEditFilters(value); },
    onCancel: () => { calls.emitted.push(["cancel"]); host?.editor.onCancel(); },
  }) });
  Object.assign(app.config.globalProperties, { $t: translate, $shop: props.shop, $route: { params: { shop_id: 19 } }, $vuetify: { locale: { isRtl: language === "fa" } },
    getShopImagePath(path) { calls.imagePaths.push(path); return `/fixture-images/${path}`; },
    remove(list, value) { const index = list.indexOf(value); if (index >= 0) list.splice(index, 1); } });
  app.provide("$shop", props.shop);
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) app.component(match[1], stub(match[1]));
  const root = element("root");
  app.mount(root);
  await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const nodes = (name) => descendants(root).filter((node) => node.type === name);
  const action = (method) => nodes("v-btn").find((node) => node.props.onClick === state[method] || String(node.props.onClick).includes(method));
  const click = async (node) => { assert.ok(node, "Native action exists"); assert.ok(!enabled(node.props.disabled)); for (const handler of [node.props.onClick].flat()) handler({ preventDefault() {}, stopPropagation() {} }); await settle(); };
  const read = async (data = { filters: filters && plain(filters), spec_keys: ["Finish", "Care", "Composition"] }) => { calls.requests[0].resolve({ data }); await settle(); };
  const checks = () => nodes("v-checkbox-btn");
  const dimension = (key) => checks()[state.present_variants_in_filter.findIndex((item) => item.value === key)];
  const setDimension = async (key, value) => { const node = dimension(key); assert.ok(node, `Native dimension ${key} is available`); node.props["onUpdate:modelValue"](value); await settle(); };
  return { state, props, calls, root, host, nodes, action, click, read, checks, dimension, setDimension, component, variants, originals, translate };
}

test("category and root reads use native routes and loading controls without mutating saved data", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId });
    assert.deepEqual(f.calls.requests.map(({ method, url }) => [method, url]), [["get", `/fixture/19/categories/${categoryId}/edit/filter`]]);
    assert.equal(f.state.busy_get_specs, true);
    assert.equal(prop(f.nodes("v-select")[0], "disabled"), true);
    assert.equal(prop(f.action("editCategoryFilter"), "disabled"), true);
    assert.equal(prop(f.action("cancelFilters"), "disabled"), true);
    assert.ok(f.checks().every((node) => prop(node, "disabled") === true));
    await f.setDimension("brands", false);
    assert.deepEqual(plain(f.state.ignore), [], "Loading prevents dimension updates");
    await f.read();
    assert.equal(f.state.busy_get_specs, false);
    assert.ok(f.nodes("h2").some((node) => text(node).includes(f.translate(`add_category.edit_filter.modern.${categoryId === "root" ? "root_title" : "category_title"}`))), "The shared editor names the root or category being edited");
    assert.ok(text(f.root).includes(f.translate(`add_category.edit_filter.modern.${categoryId === "root" ? "root_scope" : "category_scope"}`)));
    assert.ok(!enabled(prop(f.action("editCategoryFilter"), "disabled")), "Regeneration remains available without local changes");
    assert.deepEqual(plain(f.state.selected_specs), ["Finish"]);
    await f.setDimension("brands", false);
    assert.deepEqual(plain(f.props.category.filters.ignore), []);
    assert.deepEqual(plain(f.state.filters.ignore), []);
    assert.deepEqual(plain(f.state.ignore), ["brands"]);
    assert.equal(f.calls.requests.length, 1);
  }
});

test("hideContext removes only the shared heading while forms, values and Save remain active", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId }); await f.read();
    const contexts = () => f.nodes("div").filter((node) => String(node.props.class).split(/\s+/).includes("b-category-filter-editor__context"));
    assert.equal(f.state.hideContext, false, "Embedded callers keep their heading by default"); assert.equal(contexts().length, 1);
    await f.setDimension("brands", false);
    f.props.hideContext = true; await settle();
    assert.equal(contexts().length, 0); assert.equal(f.checks().length, 10); assert.equal(f.nodes("v-select").length, 1);
    assert.equal(f.nodes("u-currency-icon").length, 2); assert.ok(f.nodes("details").length > 0);
    assert.deepEqual(plain(f.state.ignore), ["brands"]); assert.deepEqual(plain(f.state.selected_specs), ["Finish"]);
    assert.equal(f.calls.requests.length, 1, "Heading visibility does not read or write data");
    await f.click(f.action("editCategoryFilter"));
    const request = f.calls.requests[1]; assert.equal(request.method, "put"); assert.equal(request.url, `/fixture/19/categories/${categoryId}/edit/filter`);
    assert.deepEqual(request.body, { list: ["Finish"], ignore: ["brands"] });
    request.resolve({ data: { filters: { ...saved(), ignore: ["brands"] } } }); await settle();
    assert.equal(contexts().length, 0); assert.equal(f.calls.emitted[0][0], "edit-filters");
    await f.setDimension("price", false); await f.click(f.action("cancelFilters"));
    assert.deepEqual(plain(f.state.ignore), ["brands"]); assert.deepEqual(f.calls.emitted.at(-1), ["cancel"]);
    f.props.hideContext = false; await settle(); assert.equal(contexts().length, 1);
  }
});

test("native dimension visibility retains forced, saved and ignored buckets", async (t) => {
  for (const [filters, keys, compact] of [[null, [], true], [{ prices: [] }, ["price", "discount", "original"], true],
    [{ prices: [], ignore: ["colors", "types"] }, ["price", "discount", "original", "colors", "types"], false],
    [saved(), ["brands", "price", "discount", "original", "colors", "styles", "volumes", "weights", "packs", "types"], false]]) {
    const f = await fixture(t, { filters }); await f.read({ filters, spec_keys: [] });
    assert.deepEqual(plain(f.state.present_variants_in_filter.map((item) => item.value)), keys);
    assert.equal(f.state.compact_empty, compact);
    assert.equal(f.checks().length, compact ? 0 : keys.length);
    if (!compact) keys.forEach((key) => {
      assert.equal(prop(f.dimension(key), "modelValue"), !f.state.ignore.includes(key));
      assert.equal(prop(f.dimension(key), "label"), f.state.suggested_list.find((item) => item.value === key).text);
    });
  }
});

test("spec selection, native clear and individual removal stay local and use existing keys", async (t) => {
  const f = await fixture(t); await f.read();
  assert.equal(f.nodes("v-select").length, 1, "No Tags, product-type or status selector is introduced");
  const select = () => f.nodes("v-select")[0];
  assert.deepEqual(plain(prop(select(), "items")), ["Finish", "Care", "Composition"]);
  assert.equal(prop(select(), "aria-label"), f.translate("add_category.edit_filter.spec_input"));
  for (const flag of ["multiple", "chips", "clearable", "closableChips"]) assert.ok(enabled(prop(select(), flag)));
  select().props["onUpdate:modelValue"](["Finish", "Care"]); await settle();
  assert.deepEqual(plain(f.state.selected_specs), ["Finish", "Care"]);
  const pending = f.nodes("details").find((node) => node.props["data-spec-group"] === "Care");
  assert.ok(text(pending).includes(f.translate("add_category.edit_filter.modern.pending_values")), "Newly selected specs do not invent generated values");
  // Native closable chips remove one selection through the same controlled VSelect event.
  select().props["onUpdate:modelValue"](["Care"]); await settle();
  assert.deepEqual(plain(f.state.selected_specs), ["Care"]);
  select().props["onUpdate:modelValue"]([]); await settle();
  assert.deepEqual(plain(f.state.selected_specs), []);
  assert.ok(f.state.filters.Finish);
  assert.equal(f.calls.requests.length, 1);
  const manyKeys = Array.from({ length: 36 }, (_, index) => `Technical ${index}`);
  f.state.spec_keys = manyKeys;
  select().props["onUpdate:modelValue"](manyKeys); await settle();
  assert.equal(f.state.selected_specs.length, 36, "Specs have no engine-style 32-item limit");
  assert.equal(prop(select(), "items").length, 36);
});

test("generated values preserve real color, variant-asset, spec and currency renderers", async (t) => {
  const f = await fixture(t); await f.read();
  const chips = f.nodes("v-chip");
  assert.ok(chips.some((node) => text(node).includes("Color name #ff0000")), "Color previews stay inside their labeled value chip");
  assert.ok(chips.some((node) => text(node).includes("Linen")), "Smart Variant Asset values retain a chip with their readable name");
  assert.ok(chips.every((node) => !node.props.onClick && !enabled(node.props.closable)), "Generated chips remain read-only output");
  assert.ok(f.nodes("v-icon").some((node) => node.props.color === "#ff0000" && text(node).includes("brightness_1")));
  assert.ok(f.calls.colors.includes("#ff0000"));
  assert.ok(text(f.root).includes("Color name #ff0000"));
  const asset = renderedVNodes(f.state.$.subTree).find((node) => node.type?.name === "UVariantAssetImage" && node.props.value === "Linen {sample-texture}");
  assert.ok(asset, "The real asset SFC receives the untouched variant value");
  assert.equal(asset.props.size, 16);
  assert.equal(asset.component.proxy.name, "sample-texture");
  const image = f.nodes("img").find((node) => node.props.alt === "Linen {sample-texture}");
  assert.equal(image.props.width, 16); assert.equal(image.props.height, 16);
  assert.equal(image.props.src, "/fixture-images/shops_19_variant-assets_sample-texture.png");
  assert.ok(text(image.parent).includes("Linen"));
  assert.ok(!text(image.parent).includes("{sample-texture}"), "Only display text removes the asset annotation");
  assert.ok(text(f.root).includes("Alpha Beta Gamma"));
  assert.ok(!text(f.root).includes("Alpha Beta Gamma Delta"));
  const currencies = f.nodes("u-currency-icon");
  assert.deepEqual(currencies.map((node) => node.props.currency), ["USD", "EUR"]);
  currencies.forEach((node) => {
    assert.ok(enabled(prop(node, "flag")));
    assert.ok(enabled(prop(node, "small")));
    assert.ok(!enabled(prop(node, "caption")), "Compact currencies have no duplicate lower caption");
  });
  for (const [amount, currency] of [[12, "USD"], [45, "USD"], [10, "EUR"], [40, "EUR"]]) {
    assert.ok(f.calls.format.some(([value, code]) => value === amount && code === currency));
    assert.ok(text(f.root).includes(`${currency}:${amount}`));
  }
  for (const code of ["USD", "EUR"]) {
    assert.ok(f.nodes("bdi").some((node) => text(node) === code), "Each currency keeps its code inline beside the native icon");
    assert.ok(!text(f.root).includes(`Currency ${code}`), "Currency names do not add a second visible line");
  }
});

test("canonical and shop-custom variant names/icons survive both languages without global mutation", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language, canonical: { name: "Canonical size", icon: "canonical-size" },
      custom: { volume: "Tailored measurement", volume_icon: "ruler", pack: "Bundle quantity", pack_icon: "package", type: "Fabric composition", type_icon: "texture" } });
    await f.read();
    for (const [key, label, icon] of [["volumes", "Tailored measurement", "ruler"], ["packs", "Bundle quantity", "package"], ["types", "Fabric composition", "texture"]]) {
      const item = f.state.suggested_list.find((item) => item.value === key);
      assert.equal(item.text, label); assert.equal(item.icon, icon);
      assert.ok(text(f.root).includes(label));
    }
    assert.deepEqual(plain(f.variants), f.originals);
    assert.ok(f.calls.translations.some((key) => key.startsWith("add_category.edit_filter")));
  }
  const fallback = await fixture(t, { canonical: { name: "Canonical size", icon: "canonical-size" } }); await fallback.read();
  assert.equal(fallback.state.suggested_list.find((item) => item.value === "volumes").text, "Canonical size");
  assert.equal(fallback.state.suggested_list.find((item) => item.value === "volumes").icon, "canonical-size");
});

test("draft toggles and disclosures do not regenerate saved values", async (t) => {
  const f = await fixture(t); await f.read();
  const before = plain(f.state.filters), draft = plain(f.state.selected_specs);
  const details = f.nodes("details");
  assert.ok(details.length > 1);
  assert.deepEqual(details.map((node) => node.props["data-filter-group"]).filter(Boolean).sort(), ["brands", "colors", "styles", "volumes", "weights", "packs", "types", "price"].sort());
  for (const open of [true, false]) for (const node of details) { node.open = open; node.props.onToggle?.({ target: node, currentTarget: node }); }
  await settle();
  assert.deepEqual(plain(f.state.filters), before);
  assert.deepEqual(plain(f.state.selected_specs), draft);
  assert.deepEqual(plain(f.state.ignore), []);
  assert.equal(f.calls.requests.length, 1);
  await f.setDimension("brands", false);
  assert.ok(text(f.root).includes("Example"), "The old Brand values remain until Save regenerates them");
  await f.setDimension("price", false);
  assert.equal(f.nodes("u-currency-icon").length, 0, "Price alone responds immediately to draft ignore");
  assert.deepEqual(plain(f.state.filters), before);
});

test("Save sends native string keys/ignore and Cancel restores the latest successful response", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId }); await f.read();
    f.state.selected_specs = ["Finish", 12]; await f.setDimension("brands", false);
    await f.click(f.action("editCategoryFilter"));
    const request = f.calls.requests[1];
    assert.equal(request.method, "put"); assert.equal(request.url, `/fixture/19/categories/${categoryId}/edit/filter`);
    assert.deepEqual(request.body, { list: ["Finish", "12"], ignore: ["brands"] });
    assert.equal(f.state.busy_edit, true);
    assert.equal(prop(f.action("editCategoryFilter"), "loading"), true);
    assert.equal(prop(f.action("cancelFilters"), "disabled"), true);
    const response = { prices: [{ currency: "USD", min: 15, max: 50 }], ignore: ["brands"], Finish: ["New saved finish"] };
    request.resolve({ data: { success: true, filters: response } }); await settle();
    assert.equal(f.state.busy_edit, false);
    assert.deepEqual(plain(f.state.filters), response);
    assert.deepEqual(f.calls.emitted.map(([event]) => event), ["edit-filters"], "Successful save stays open");
    assert.equal(f.calls.emitted[0][1], response);
    assert.ok(!text(f.root).includes("Example"), "Ignored Brand buckets are absent after regeneration");
    await f.setDimension("brands", true);
    assert.ok(!text(f.root).includes("Example"), "Re-enabling needs another Save to regenerate removed data");
    f.state.selected_specs = [];
    await f.click(f.action("cancelFilters"));
    assert.deepEqual(plain(f.state.selected_specs), ["Finish"]);
    assert.deepEqual(plain(f.state.ignore), ["brands"]);
    assert.deepEqual(plain(f.state.filters), response, "Cancel cannot undo an earlier successful Save");
    assert.deepEqual(f.calls.emitted.map(([event]) => event), ["edit-filters", "cancel"]);
    assert.equal(f.calls.requests.length, 2);
  }
});

test("catalog regeneration commits the current target before closing and errors keep its draft open", async (t) => {
  for (const categoryId of [31, "root"]) for (const outcome of ["success", "application-error", "network-error"]) {
    const f = await fixture(t, { categoryId, catalogHost: true }); await f.read();
    const target = categoryId === "root" ? f.props.shop : f.props.category, original = plain(target.filters);
    assert.equal(f.host.editor.category.id, categoryId);
    await f.setDimension("brands", false);
    f.nodes("v-select")[0].props["onUpdate:modelValue"](["Finish", "Care"]); await settle();
    await f.click(f.action("editCategoryFilter"));
    const request = f.calls.requests[1];
    assert.equal(request.url, `/fixture/19/categories/${categoryId}/edit/filter`);
    assert.deepEqual(request.body, { list: ["Finish", "Care"], ignore: ["brands"] });
    assert.equal(f.host.state.dialog_root_filter, true); assert.deepEqual(plain(target.filters), original); assert.deepEqual(f.calls.closedWithFilters, []);
    const filters = { ...saved(), ignore: ["brands"], Care: ["Saved value"] }; delete filters.brands;
    if (outcome === "success") request.resolve({ data: { filters } });
    else if (outcome === "application-error") request.resolve({ data: { error: true, error_msg: "Fixture denied" } });
    else request.reject(new Error("Fixture network failure"));
    await settle(); assert.equal(f.state.busy_edit, false);
    if (outcome === "success") {
      assert.equal(f.host.state.dialog_root_filter, false); assert.deepEqual(plain(target.filters), filters);
      assert.deepEqual(f.calls.closedWithFilters, [filters], "The saved filters reach the target before the dialog closes");
      assert.deepEqual(plain(f.calls.emitted), [["edit-filters", filters]]);
    } else {
      assert.equal(f.host.state.dialog_root_filter, true); assert.deepEqual(plain(target.filters), original); assert.deepEqual(f.calls.closedWithFilters, []);
      assert.deepEqual(plain(f.state.ignore), ["brands"]); assert.deepEqual(plain(f.state.selected_specs), ["Finish", "Care"]); assert.deepEqual(f.calls.emitted, []);
    }
  }
});

test("catalog Cancel restores the draft without saving and the native vendor host stays unavailable", async (t) => {
  for (const categoryId of [31, "root"]) {
    const f = await fixture(t, { categoryId, catalogHost: true }); await f.read(); await f.setDimension("brands", false); await f.click(f.action("cancelFilters"));
    assert.equal(f.host.state.dialog_root_filter, false); assert.deepEqual(plain(f.state.ignore), []); assert.deepEqual(plain(f.state.selected_specs), ["Finish"]);
    assert.equal(f.calls.requests.length, 1); assert.deepEqual(f.calls.emitted, [["cancel"]]); assert.deepEqual(f.calls.closedWithFilters, [saved()]);
  }
  assert.equal(dialogEditor(renderFilterDialog({ IS_VENDOR_PANEL: true }, [])), undefined);
});

test("failed saves keep draft and generated values for application and network errors", async (t) => {
  for (const network of [false, true]) {
    const f = await fixture(t); await f.read();
    const before = plain(f.state.filters);
    f.state.selected_specs = ["Care"]; await f.setDimension("styles", false);
    await f.click(f.action("editCategoryFilter"));
    if (network) f.calls.requests[1].reject(new Error("Fixture connection error"));
    else f.calls.requests[1].resolve({ data: { error: true, error_msg: "Fixture permission denied" } });
    await settle();
    assert.equal(f.state.busy_edit, false);
    assert.deepEqual(plain(f.state.selected_specs), ["Care"]);
    assert.deepEqual(plain(f.state.ignore), ["styles"]);
    assert.deepEqual(plain(f.state.filters), before);
    assert.deepEqual(f.calls.emitted, []);
    assert.equal(f.calls.notifications.at(-1).method, network ? "showLaravelError" : "showErrorAlert");
    if (!network) assert.equal(f.calls.notifications.at(-1).args[1], "Fixture permission denied");
  }
});

test("clearing selected specs saves an empty list without clearing native dimension filters", async (t) => {
  const f = await fixture(t); await f.read();
  f.nodes("v-select")[0].props["onUpdate:modelValue"]([]); await settle();
  await f.click(f.action("editCategoryFilter"));
  assert.deepEqual(f.calls.requests[1].body, { list: [], ignore: [] });
  const response = saved(); delete response.Finish;
  f.calls.requests[1].resolve({ data: { success: true, filters: response } }); await settle();
  assert.deepEqual(plain(f.state.selected_specs), []);
  assert.deepEqual(plain(f.state.filters), response);
  assert.equal(f.nodes("u-currency-icon").length, 2);
  assert.equal(f.calls.emitted[0][0], "edit-filters");
});

test("read errors retain initial saved values and release loading without a write", async (t) => {
  for (const network of [false, true]) {
    const initial = saved(), f = await fixture(t, { filters: initial });
    if (network) f.calls.requests[0].reject(new Error("Fixture read failure"));
    else await f.read({ error: true, error_msg: "Fixture category access denied" });
    await settle();
    assert.equal(f.state.busy_get_specs, false);
    assert.deepEqual(plain(f.state.filters), initial);
    assert.equal(f.calls.requests.length, 1);
    assert.equal(f.calls.notifications.at(-1).method, network ? "showLaravelError" : "showErrorAlert");
  }
});

test("embedded filter saves are inline without Cancel and preserve standalone completion events", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language, embedded: true });
    assert.equal(f.nodes("v-card-actions").length, 0);
    assert.equal(f.action("cancelFilters"), undefined);
    assert.ok(text(f.root).includes(f.translate("add_category.edit_filter.modern.save_scope")));
    assert.ok(enabled(prop(f.action("editCategoryFilter"), "disabled")));
    await f.read();
    await f.setDimension("brands", false);
    await f.click(f.action("editCategoryFilter"));
    assert.deepEqual(f.calls.requests[1].body, { list: ["Finish"], ignore: ["brands"] });
    const filters = { ...saved(), ignore: ["brands"] };
    f.calls.requests[1].resolve({ data: { filters } }); await settle();
    assert.deepEqual(plain(f.calls.emitted), [["edit-filters", filters]]);
    assert.equal(f.nodes("v-card-actions").length, 0);
    assert.ok(f.action("editCategoryFilter"), "The embedded workspace stays available after save");
  }
  const standalone = await fixture(t); await standalone.read();
  assert.equal(standalone.state.embedded, false);
  assert.equal(standalone.nodes("v-card-actions").length, 1);
  assert.ok(standalone.action("cancelFilters"));
});

test("one compact empty state requires a successful read and contains its own save action", async (t) => {
  for (const language of ["en", "fa"]) for (const embedded of [false, true]) {
    const f = await fixture(t, { language, embedded, filters: null });
    const emptyTitles = ["variants", "specs", "saved"].map((name) => f.translate(`add_category.edit_filter.modern.empty_${name}_title`));
    const compactTitle = f.translate("add_category.edit_filter.modern.compact_empty_title");
    const compactStates = () => f.nodes("section").filter((node) => String(node.props.class).split(/\s+/).includes("b-category-filter-editor__empty-state"));
    assert.equal(f.nodes("v-progress-linear").length, 1);
    assert.equal(compactStates().length, 0);
    assert.ok(!text(f.root).includes(compactTitle));
    assert.ok(emptyTitles.every((title) => !text(f.root).includes(title)));
    f.state.editCategoryFilter(); f.state.getCategoryFilter(); await settle();
    assert.equal(f.calls.requests.length, 1, "Read/save calls cannot duplicate an initial read");
    await f.read({ filters: null, spec_keys: [] });
    assert.equal(f.state.read_ready, true);
    assert.equal(f.nodes("v-progress-linear").length, 0);
    assert.equal(compactStates().length, 1);
    assert.ok(text(compactStates()[0]).includes(compactTitle));
    assert.ok(text(compactStates()[0]).includes(f.translate("add_category.edit_filter.modern.compact_empty_help")));
    assert.ok(emptyTitles.every((title) => !text(f.root).includes(title)), "Three repeated empty cards are replaced by one state");
    assert.equal(f.nodes("v-card-actions").length, 0);
    assert.equal(f.nodes("v-select").length, 0);
    assert.equal(f.checks().length, 0);
    assert.equal(f.nodes("table").length, 0);
    assert.equal(f.state.has_saved_values, false);
    assert.ok(!enabled(prop(f.action("editCategoryFilter"), "disabled")), "An empty category can still regenerate");
    const buttons = descendants(compactStates()[0]).filter((node) => node.type === "v-btn");
    assert.equal(buttons.filter((node) => node.props.onClick === f.state.editCategoryFilter || String(node.props.onClick).includes("editCategoryFilter")).length, 1);
    assert.equal(f.action("cancelFilters") !== undefined, !embedded);
  }
  const onlyMetadata = await fixture(t, { filters: { ignore: ["price"], prices: [{ currency: null, min: 0, max: 0 }] } });
  await onlyMetadata.read({ filters: { ignore: ["price"], prices: [{ currency: null, min: 0, max: 0 }] }, spec_keys: [] });
  assert.equal(onlyMetadata.state.has_saved_values, false, "Ignored dimensions and invalid currency rows are not saved values");
  assert.equal(onlyMetadata.state.compact_empty, true);
  assert.equal(onlyMetadata.nodes("table").length, 0);
});

test("compact empty state handles null, empty objects and empty variant arrays without hiding real configuration", async (t) => {
  for (const filters of [null, {}, { prices: [] }, { prices: [], colors: [], brands: [] }, { ignore: ["price"], prices: [] }]) {
    const f = await fixture(t, { filters, embedded: true }); await f.read({ filters, spec_keys: [] });
    assert.equal(f.state.compact_empty, true);
    assert.equal(f.nodes("v-card-actions").length, 0);
    await f.click(f.action("editCategoryFilter"));
    assert.deepEqual(f.calls.requests[1].body, { list: [], ignore: filters?.ignore || [] });
  }
  for (const [filters, spec_keys] of [[{ Finish: [] }, []], [{ colors: [], ignore: ["colors"] }, []], [{ prices: [] }, ["Finish"]], [{ colors: ["#ff0000"] }, []]]) {
    const f = await fixture(t, { filters, embedded: true }); await f.read({ filters, spec_keys });
    assert.equal(f.state.compact_empty, false);
    assert.equal(f.nodes("v-select").length, 1, "Specifications and saved spec drafts remain editable");
    assert.ok(f.checks().length >= 3, "Normal forced and ignored controls remain available when configuration exists");
    if (filters.ignore?.includes("colors")) assert.equal(prop(f.dimension("colors"), "modelValue"), false);
    if (filters.Finish) assert.deepEqual(plain(prop(f.nodes("v-select")[0], "modelValue")), ["Finish"]);
  }
});

test("standalone compact saves retain pending/error state and apply successful results before host closure", async (t) => {
  for (const outcome of ["success", "application-error", "network-error"]) {
    const f = await fixture(t, { filters: null, catalogHost: true }); await f.read({ filters: null, spec_keys: [] });
    await f.click(f.action("editCategoryFilter"));
    assert.equal(f.host.state.dialog_root_filter, true);
    assert.ok(enabled(prop(f.action("cancelFilters"), "disabled")));
    assert.equal(f.nodes("v-card-actions").length, 0);
    const filters = { prices: [], ignore: [] };
    if (outcome === "success") f.calls.requests[1].resolve({ data: { filters } });
    else if (outcome === "application-error") f.calls.requests[1].resolve({ data: { error: true, error_msg: "Fixture denied" } });
    else f.calls.requests[1].reject(new Error("Fixture network failure"));
    await settle();
    if (outcome === "success") {
      assert.equal(f.host.state.dialog_root_filter, false);
      assert.deepEqual(plain(f.calls.emitted), [["edit-filters", filters]]);
      assert.deepEqual(f.calls.closedWithFilters, [filters]);
    } else {
      assert.equal(f.host.state.dialog_root_filter, true);
      assert.equal(f.state.compact_empty, true);
      assert.deepEqual(f.calls.emitted, []);
      assert.ok(!enabled(prop(f.action("editCategoryFilter"), "disabled")));
    }
  }
  const cancel = await fixture(t, { filters: null, catalogHost: true }); await cancel.read({ filters: null, spec_keys: [] });
  await cancel.click(cancel.action("cancelFilters"));
  assert.equal(cancel.host.state.dialog_root_filter, false);
  assert.deepEqual(cancel.calls.emitted, [["cancel"]]);
  assert.equal(cancel.calls.requests.length, 1);
});

test("unavailable reads never become compact empty results before successful retry", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language, embedded: true, filters: null });
    f.calls.requests[0].reject(new Error("Fixture initial read failure")); await settle();
    assert.equal(f.state.compact_empty, false);
    assert.ok(text(f.root).includes(f.translate("add_category.edit_filter.modern.load_error")));
    assert.ok(!text(f.root).includes(f.translate("add_category.edit_filter.modern.compact_empty_title")));
    await f.click(f.action("getCategoryFilter"));
    assert.equal(f.state.compact_empty, false);
    assert.ok(enabled(prop(f.action("editCategoryFilter"), "disabled")));
    f.calls.requests[1].resolve({ data: { filters: null, spec_keys: [] } }); await settle();
    assert.equal(f.state.compact_empty, true);
    assert.ok(text(f.root).includes(f.translate("add_category.edit_filter.modern.compact_empty_title")));
  }
});

test("missing specification choices keep saved chips removable and preserve independent filters", async (t) => {
  const filters = { prices: [], Finish: [], ignore: ["colors"] };
  const f = await fixture(t, { filters }); await f.read({ filters, spec_keys: [] });
  assert.ok(text(f.root).includes(f.translate("add_category.edit_filter.modern.empty_specs_title")));
  const select = f.nodes("v-select")[0];
  assert.deepEqual(plain(prop(select, "modelValue")), ["Finish"]);
  assert.ok(!enabled(prop(select, "disabled")));
  assert.ok(enabled(prop(select, "closableChips")));
  select.props["onUpdate:modelValue"]([]); await settle();
  await f.click(f.action("editCategoryFilter"));
  assert.deepEqual(f.calls.requests[1].body, { list: [], ignore: ["colors"] });
});

test("failed reads keep cached output and drafts, show retry and block writes until success", async (t) => {
  for (const language of ["en", "fa"]) for (const network of [false, true]) {
    const initial = saved(), f = await fixture(t, { language, filters: initial });
    f.state.selected_specs = ["Finish", "Care"]; f.state.ignore = ["brands"];
    if (network) f.calls.requests[0].reject(new Error("Fixture read failed"));
    else f.calls.requests[0].resolve({ data: { error: true, error_msg: "Fixture access denied" } });
    await settle();
    assert.equal(f.state.load_error, true);
    assert.equal(f.state.read_ready, false);
    assert.ok(text(f.root).includes(f.translate("add_category.edit_filter.modern.load_error")));
    assert.ok(!text(f.root).includes(f.translate("add_category.edit_filter.modern.empty_specs_title")));
    assert.deepEqual(plain(f.state.filters), initial);
    assert.deepEqual(plain(f.state.selected_specs), ["Finish", "Care"]);
    assert.deepEqual(plain(f.state.ignore), ["brands"]);
    assert.ok(text(f.root).includes("Example"), "Cached output remains visible through a failed read");
    assert.ok(enabled(prop(f.action("editCategoryFilter"), "disabled")));
    f.state.editCategoryFilter(); await settle(); assert.equal(f.calls.requests.length, 1);
    await f.click(f.action("getCategoryFilter"));
    assert.equal(f.state.busy_get_specs, true);
    assert.equal(f.state.load_error, false);
    assert.deepEqual(plain(f.state.selected_specs), ["Finish", "Care"], "Retry does not discard the draft before it succeeds");
    assert.deepEqual(plain(f.state.filters), initial);
    f.state.getCategoryFilter(); f.state.editCategoryFilter(); await settle();
    assert.equal(f.calls.requests.length, 2);
    f.calls.requests[1].resolve({ data: { filters: initial, spec_keys: ["Finish", "Care"] } }); await settle();
    assert.equal(f.state.read_ready, true);
    await f.click(f.action("editCategoryFilter"));
    f.state.editCategoryFilter(); f.state.getCategoryFilter(); await settle();
    assert.equal(f.calls.requests.length, 3, "An in-flight regeneration cannot be duplicated or interrupted by a read");
  }
});

test("the shared default SFC preserves public events and compiles TS/template/scoped Sass", async () => {
  const syntax = ts.createSourceFile(file.pathname, script.content, ts.ScriptTarget.Latest, true);
  assert.deepEqual(syntax.parseDiagnostics, []);
  assert.deepEqual(transpile(script.content).diagnostics, []);
  const options = syntax.statements.find(ts.isExportAssignment).expression;
  const props = options.properties.find((property) => property.name?.getText(syntax) === "props").initializer;
  assert.deepEqual(props.properties.map((property) => property.name.getText(syntax)).sort(), ["category", "embedded", "hideContext", "shop"]);
  const emitted = options.properties.find((property) => property.name?.getText(syntax) === "emits").initializer;
  assert.deepEqual(new Function(`return (${emitted.getText(syntax)})`)(), ["edit-filters", "cancel"]);
  const copy = (language) => packs[language].add_category.edit_filter.modern;
  assert.deepEqual(Object.keys(copy("en")).sort(), Object.keys(copy("fa")).sort());
  for (const key of Object.keys(copy("en"))) {
    for (const language of ["en", "fa"]) assert.ok(typeof copy(language)[key] === "string" && copy(language)[key].trim());
    assert.deepEqual([...copy("en")[key].matchAll(/\{\w+\}/g)].map(([value]) => value).sort(), [...copy("fa")[key].matchAll(/\{\w+\}/g)].map(([value]) => value).sort());
  }
  for (const style of descriptor.styles) {
    const output = await compileStyleAsync({ source: style.content, filename: file.pathname, id: "category-filter-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(output.errors, []);
    assert.ok(style.scoped);
  }
});
