import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function compiled(file) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  return new Function("require", "exports", "window", "console", outputText);
}

const loadPriceHelper = compiled("../../../core-js/helper/price/PriceHelper.ts");
const loadAnalytics = compiled("./GtagEcommerce.ts");
const product = { id: 1, title: "Fixture product", currency: "USD", price: 40 };

function fixture() {
  const warnings = [], errors = [], pixels = [];
  const window = { fbq: (...args) => pixels.push(args) };
  const console = { warn: (...args) => warnings.push(args), error: error => errors.push(error) };
  const priceModule = {}, analyticsModule = {};
  loadPriceHelper(name => {
    if (name.endsWith("/Currency")) return { Currency: { USD: { floats: 2 }, AED: { floats: 2 } } };
    if (name.endsWith("/DateConverter")) return {};
    if (name.endsWith("/StorefrontDebugEvents")) return { StorefrontDebugEvents: { LogWarning() {} } };
    throw new Error(`Unexpected price helper dependency ${name}`);
  }, priceModule, window, console);
  loadAnalytics(name => {
    if (name.endsWith("/PriceHelper")) return priceModule;
    if (name.endsWith("/ProductType")) return {};
    throw new Error(`Unexpected analytics dependency ${name}`);
  }, analyticsModule, window, console);
  return { ...priceModule, ...analyticsModule, warnings, errors, pixels, window };
}

test("product views with absent or invalid shop rates skip priced telemetry quietly", () => {
  const f = fixture();
  const shop = { id: 2 };
  f.GtagEcommerce.MeasuringViewsOfProductDetails(shop, product, "AED", "product-page");
  for (const rate of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    shop.shop_exchange_rates = [{ from: "USD", to: "AED", rate }];
    f.GtagEcommerce.MeasuringViewsOfProductDetails(shop, product, "AED", "product-page");
  }
  assert.deepEqual(f.window.dataLayer, []);
  assert.deepEqual(f.pixels, []);
  assert.deepEqual(f.errors, []);
  assert.deepEqual(f.warnings, []);
  assert.throws(() => f.PriceHelper.priceProductByCurrency({ id: 3 }, product, null, "AED"), /Exchange rate USD\/AED not found/);
});

test("native product price and available direct or inverse rates reach both analytics providers", () => {
  const f = fixture();
  const shop = { id: 4, shop_exchange_rates: [] };
  f.GtagEcommerce.MeasuringViewsOfProductDetails(shop, product, "USD", "product-page");
  shop.shop_exchange_rates = [{ from: "USD", to: "AED", rate: 2 }];
  f.GtagEcommerce.MeasuringViewsOfProductDetails(shop, product, "AED", "product-page");
  shop.shop_exchange_rates = [{ from: "AED", to: "USD", rate: 0.25 }];
  f.GtagEcommerce.MeasuringViewsOfProductDetails(shop, product, "AED", "quick-view");
  assert.deepEqual(f.window.dataLayer.map(event => ({
    currency: event.currencyCode,
    list: event.ecommerce.detail.actionField.list,
    price: event.ecommerce.detail.products[0].price,
  })), [
    { currency: "USD", list: "product-page", price: 40 },
    { currency: "AED", list: "product-page", price: 80 },
    { currency: "AED", list: "quick-view", price: 160 },
  ]);
  assert.deepEqual(f.pixels.map(([, name, payload]) => [name, payload.currency, payload.value]), [
    ["ViewContent", "USD", 40], ["ViewContent", "AED", 80], ["ViewContent", "AED", 160],
  ]);
  assert.deepEqual(f.errors, []);
  assert.deepEqual(f.warnings, []);
});

test("gallery analytics keeps priced items and skips items without a shop rate", () => {
  const f = fixture();
  const localProduct = { ...product, id: 2, currency: "AED" };
  f.GtagEcommerce.MeasuringProductImpressions({ id: 2 }, [product, localProduct], "AED", null, null);

  assert.deepEqual(f.window.dataLayer[0].ecommerce.impressions.map(({ id, price, position }) => [id, price, position]), [[2, 40, 1]]);
  assert.deepEqual(f.pixels[0][2].content_ids, [2]);
  assert.deepEqual(f.errors, []);
  assert.deepEqual(f.warnings, []);
});
