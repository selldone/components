import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const helperExports = {};
vm.runInNewContext(transpile(readFileSync(new URL("../../../../../core-js/helper/embed/ProductEmbedHelper.ts", import.meta.url), "utf8")), {
  exports: helperExports, URL,
  window: { location: { origin: "https://dashboard.example" }, URLS: { ProductIframeUrl: (shop, product) => `/iframe/embed/@${shop.name}/product/${product.id}` } },
});
const { descriptor, errors } = parse(readFileSync(new URL("./BProductInfoAbstractView.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const source = ts.createSourceFile("product-info.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = source.statements.find(ts.isExportAssignment).expression.getText(source);
const exports = {};
vm.runInNewContext(transpile("export default " + options), {
  exports, URL, ProductEmbedHelper: helperExports.ProductEmbedHelper,
  DateMixin: {}, ProductMixin: {}, UChipDiscount: {}, UAvatarFolder: {}, BProductBreadcrumbs: {}, SFilesGroup: {},
  BProductTagsInput: {}, BNoteDialog: {}, SCountrySelect: {}, BProductVariantsTable: {}, UTimeProgressBar: {}, SWidgetBox: {},
  ProductType: {}, ProductStatus: {}, MapHelper: {}, defineAsyncComponent: (loader) => loader,
});
const component = exports.default;
function fixture() {
  const state = {
    ...component.data(), shop: { name: "demo" }, product: { id: 31, title: 'Plant "one"' },
    $i18n: { locale: "fa" }, dark: true,
  };
  state.USER = () => ({ preferences: { dark: state.dark } });
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  return state;
}

test("dashboard preview uses the current locale and appearance without adding them to copied code", () => {
  const state = fixture();
  const preview = new URL(state.iframe_preview_src);
  assert.equal(preview.searchParams.get("lang"), "fa");
  assert.equal(preview.searchParams.get("theme"), "dark");
  assert.ok(state.iframe_code.includes('src="https://dashboard.example/iframe/embed/@demo/product/31"'));
  assert.ok(!state.iframe_code.includes("lang=") && !state.iframe_code.includes("theme="));
  state.$i18n.locale = { value: "en" };
  state.dark = false;
  assert.equal(new URL(state.iframe_preview_src).searchParams.get("lang"), "en");
  assert.equal(new URL(state.iframe_preview_src).searchParams.get("theme"), "light");
});

test("Desktop/Mobile preview width is local and opening the dialog resets only that width", () => {
  const state = fixture();
  const code = state.iframe_code, url = state.iframe_preview_src;
  state.embed_preview = "mobile";
  assert.equal(state.iframe_code, code);
  assert.equal(state.iframe_preview_src, url);
  component.methods.showEmbedCode.call(state);
  assert.equal(state.embed_preview, "desktop");
  assert.equal(state.show_iframe_code, true);
  assert.equal(state.iframe_code, code);
});

test("preview and copied code follow the current product instead of retaining a stale opened snapshot", () => {
  const state = fixture();
  state.product = { id: 44, title: "New & <safe> title" };
  assert.equal(new URL(state.iframe_preview_src).pathname, "/iframe/embed/@demo/product/44");
  assert.ok(state.iframe_code.includes('/product/44"'));
  assert.ok(state.iframe_code.includes('title="New &amp; &lt;safe&gt; title"'));
});
