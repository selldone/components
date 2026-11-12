import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const productTypes = Object.fromEntries(["PHYSICAL", "FILE", "VIRTUAL", "SERVICE", "SUBSCRIPTION"].map((code) => [code, {
  code, name: code, description: `${code} description`, image: `${code}.svg`, enable: true,
}]));
function evaluate(source, imports, extra = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics.filter((d) => d.category === ts.DiagnosticCategory.Error), []);
  vm.runInNewContext(result.outputText, {
    exports,
    require: (name) => {
      assert.ok(Object.hasOwn(imports, name), `Unexpected dependency: ${name}`);
      return imports[name];
    },
    ...extra,
  });
  return exports;
}

const { ShopOptionsHelper } = evaluate(read("../../../../../core-js/helper/shop/ShopOptionsHelper.ts"), {
  "../../enums/product/ProductType": { ProductType: productTypes },
  "../../enums/shop/options/LabelingOptions": { LabelingModes: {} },
});
const source = read("./BProductEditType.vue");
const { descriptor, errors } = parse(source);
assert.deepEqual(errors, []);
const { default: typeComponent } = evaluate(descriptor.script.content, {
  vue: Vue,
  "../../../product/widgets/OrderTypeMinimalFlow.vue": { default: { render: () => null } },
  "@selldone/core-js/enums/product/ProductType": { ProductType: productTypes },
  "@selldone/core-js/helper/shop/ShopOptionsHelper": { ShopOptionsHelper },
  "../../../product/add/drop-shipping/BProductAddDropshipping.vue": { default: { render: () => null } },
  "@selldone/core-js/enums/shop/ShopLicense": { Eligible: { CanReselling: (shop) => shop.reselling } },
  "../info/BProductEditInfoIcon.vue": { default: { render: () => null } },
});
const template = compileTemplate({ source: descriptor.template.content, filename: "BProductEditType.vue", id: "type-test", transformAssetUrls: false });
assert.deepEqual(template.errors, []);
typeComponent.render = evaluate(template.code, { vue: Vue }).render;

async function render({ vendor = false, eligible = true, disabled = false, ...props } = {}) {
  const app = Vue.createSSRApp(typeComponent, {
    modern: true, hasAddDropshipping: true, hasAddConnectOs: true, disabled,
    shop: { id: 7, options: [{ code: "types", value: ["PHYSICAL", "FILE"] }], reselling: eligible },
    ...props,
  });
  Object.assign(app.config.globalProperties, {
    $route: { params: vendor ? { vendor_id: "9" } : {}, matched: [{ meta: { vendor } }] },
    $t: (key) => key,
    USER: () => null,
  });
  const wrapper = Vue.defineComponent({
    props: { modelValue: { default: undefined } },
    setup: (props, { attrs, slots }) => () => props.modelValue === false ? null : Vue.h("div", attrs, [slots.activator?.({ props: {} }), slots.default?.()]),
  });
  for (const name of new Set([...descriptor.template.content.matchAll(/<(v-[a-z-]+)/g)].map((match) => match[1]))) app.component(name, wrapper);
  app.component("RouterLink", wrapper);
  app.config.warnHandler = (message) => { throw new Error(message); };
  return renderToString(app);
}

test("manual product types and merchant imports render without the retired SKU repository", async () => {
  const html = await render();
  assert.match(html, /value="PHYSICAL"/);
  assert.match(html, /value="FILE"/);
  assert.doesNotMatch(html, /value="SUBSCRIPTION"/);
  assert.match(html, /global\.commons\.drop_shipping/);
  assert.match(html, /Connect OS/);
  assert.doesNotMatch(html, /by_sku|repository|SKU/);
  assert.equal(typeComponent.props.hasAddSku, undefined);
});

test("vendor type selection remains available and merchant-only imports retain their guards", async () => {
  const vendor = await render({ vendor: true });
  assert.match(vendor, /value="PHYSICAL"/);
  assert.doesNotMatch(vendor, /Connect OS|global\.commons\.drop_shipping/);
  const ineligible = await render({ eligible: false });
  assert.match(ineligible, /product_studio\.your_license_is_not_eligible/);
  assert.match(ineligible, /<button[^>]*disabled/);
  const disabled = await render({ disabled: true });
  assert.match(disabled, /<input[^>]*disabled/);
});

test("barcode scanning still submits a normal search within the current shop", () => {
  const scanner = parse(read("../../../../storefront/search/SStorefrontSearchBox.vue")).descriptor;
  const storage = new Map(), events = [];
  const { default: component } = evaluate(scanner.script.content, {
    "@selldone/core-js/helper/local-storage/StorefrontLocalStorages": { StorefrontLocalStorages: { GetUserShopSearchHistory: (base) => `${base}search-history` } },
    "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue": { default: {} },
    "@selldone/components-vue/mixin/template/TemplateMixin.ts": { default: {} },
    "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue": { default: {} },
    vue: Vue,
  }, { localStorage: { setItem: (key, value) => storage.set(key, value) } });
  const state = {
    ...component.data(), $route: { query: {} },
    $emit: (...args) => events.push(args), $localstorage_base_path: () => "shop/@demo/",
    show_scanner: true, menu: true,
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  state.onScan("6291234567890");
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [["onSearch", { search_type: null, search: "6291234567890" }]]);
  assert.equal(state.show_scanner, false);
  assert.equal(state.menu, false);
  assert.equal(storage.get("shop/@demo/search-history"), '["6291234567890"]');
});
