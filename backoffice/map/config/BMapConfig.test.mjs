import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const components = [
  new URL("./BMapConfig.vue", import.meta.url),
  new URL("../driver/options/BMapDriverOptions.vue", import.meta.url),
  new URL("../driver/mapbox/options/BMapDriverMapboxOptions.vue", import.meta.url),
];
let config;
for (const filename of components) {
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename: filename.pathname });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "map-config-check" });
  assert.deepEqual(compileTemplate({
    source: descriptor.template.content, filename: filename.pathname, id: "map-config-check",
    compilerOptions: { bindingMetadata: script.bindings },
  }).errors, []);
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename: filename.pathname, id: "map-config-check", scoped: style.scoped, preprocessLang: style.lang,
  })).errors, []);
  if (!config) config = descriptor.script.content;
}

const options = enable => [{ code: "shop_map", value: { enable, driver: "Mapbox" } }];
function fixture(enabled = false) {
  const requests = [], notices = [];
  let allowed = true;
  const helper = {
    GetShopMap: shop => shop.options.find(item => item.code === "shop_map")?.value || { enable: false },
    IsEnableShopMap: shop => !!helper.GetShopMap(shop).enable,
  };
  const result = ts.transpileModule(config, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  const exports = {};
  vm.runInNewContext(result.outputText, {
    exports,
    require: name => {
      if (name.endsWith(".vue")) return { default: {} };
      if (name.includes("ShopOptionsHelper")) return { ShopOptionsHelper: helper };
      if (name.includes("ShopPermissions")) return { ShopPermissionRegions: { CHANNELS: { code: "channels" } } };
      if (name.includes("NotificationService")) return { default: {
        showSuccessAlert: (...args) => notices.push(["success", ...args]),
        showErrorAlert: (...args) => notices.push(["error", ...args]),
        showLaravelError: error => notices.push(["network", error.message]),
      } };
      if (name === "@selldone/core-js") return {
        Map: { Providers: { Mapbox: { code: "Mapbox", title: "Mapbox", icon: "mapbox.svg" } } }, ShopURLs: {},
      };
      throw new Error("Unexpected dependency: " + name);
    },
    axios: { post: (url, payload) => new Promise((resolve, reject) => requests.push({ url, payload, resolve, reject })) },
    window: { API: { POST_SET_SHOP_OPTIONS_SHOP_MAP: id => "/shops/" + id + "/map" } },
  });
  const component = exports.default;
  const state = {
    ...component.data(), shop: { id: 1, options: options(enabled) },
    writeShopAccess: region => { assert.equal(region, "channels"); return allowed; },
    $t: key => key,
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  component.watch.shop.handler.call(state);
  return { state, component, requests, notices, deny: () => { allowed = false; } };
}

test("confirmed map state initializes the control and only confirmed enable opens map links", () => {
  const f = fixture();
  assert.equal(f.state.enable, false);
  f.state.enable = true;
  f.state.openMaps();
  assert.equal(f.state.show_map_urls, false, "Unsaved draft enable must not make map pages available");
  f.state.shop.options = options(true);
  f.component.watch["shop.options"].handler.call(f.state);
  assert.equal(f.state.enable, true);
  assert.equal(f.state.provider.title, "Mapbox");
  f.state.openMaps();
  assert.equal(f.state.show_map_urls, true);
  f.state.shop.options = options(false);
  f.component.watch["shop.options"].handler.call(f.state);
  assert.equal(f.state.enable, false);
  assert.equal(f.state.show_map_urls, false);
});

test("immediate saving preserves the existing URL/payload and accepts server-confirmed options", async () => {
  const f = fixture();
  f.state.enable = true;
  const saved = f.state.setEnable();
  assert.equal(f.state.busy_set, true);
  assert.equal(f.state.persistedEnable, false);
  assert.equal(f.requests[0].url, "/shops/1/map");
  assert.deepEqual(JSON.parse(JSON.stringify(f.requests[0].payload)), { enable: true, driver: "Mapbox" });
  await f.state.setEnable();
  assert.equal(f.requests.length, 1, "A second click must not send a duplicate save");
  const confirmed = options(true);
  f.requests[0].resolve({ data: { options: confirmed } });
  await saved;
  assert.equal(f.state.shop.options, confirmed);
  assert.equal(f.state.enable, true);
  assert.equal(f.state.persistedEnable, true);
  assert.equal(f.state.busy_set, false);
  assert.equal(f.notices[0][0], "success");
});

test("write denial at the request boundary restores the persisted choice and performs no request", async () => {
  const f = fixture(true);
  f.state.enable = false;
  f.deny();
  await f.state.setEnable();
  assert.equal(f.state.enable, true);
  assert.equal(f.requests.length, 0);
  assert.equal(f.notices.length, 0);
});

test("server rejection, malformed options and transport failure roll back the local draft", async () => {
  for (const mode of ["rejected", "malformed", "network"]) {
    const f = fixture(true);
    const original = f.state.shop.options;
    f.state.enable = false;
    const saved = f.state.setEnable();
    if (mode === "network") f.requests[0].reject(new Error("Offline"));
    else f.requests[0].resolve({ data: mode === "rejected" ? { error: true, error_msg: "Denied" } : { options: {} } });
    await saved;
    assert.equal(f.state.shop.options, original);
    assert.equal(f.state.enable, true);
    assert.equal(f.state.busy_set, false);
    assert.equal(f.notices.length, 1);
    assert.notEqual(f.notices[0][0], "success");
  }
});

test("a late save cannot replace another shop's state or clear its pending save", async () => {
  const f = fixture();
  const firstShop = f.state.shop;
  f.state.enable = true;
  const first = f.state.setEnable();
  f.state.shop = { id: 2, options: options(true) };
  f.component.watch.shop.handler.call(f.state);
  f.state.enable = false;
  const second = f.state.setEnable();
  f.requests[0].resolve({ data: { options: options(true) } });
  await first;
  assert.equal(firstShop.options[0].value.enable, false);
  assert.equal(f.state.shop.options[0].value.enable, true);
  assert.equal(f.state.busy_set, true);
  assert.equal(f.notices.length, 0);
  f.requests[1].resolve({ data: { options: options(false) } });
  await second;
  assert.equal(f.state.shop.options[0].value.enable, false);
  assert.equal(f.state.busy_set, false);
});

test("shop identity mutation and unmount invalidate in-flight responses", async () => {
  for (const mode of ["id", "unmount"]) {
    const f = fixture();
    f.state.enable = true;
    const saved = f.state.setEnable();
    if (mode === "id") { f.state.shop.id = 2; f.component.watch["shop.id"].call(f.state); }
    else f.component.beforeUnmount.call(f.state);
    f.requests[0].resolve({ data: { options: options(true) } });
    await saved;
    assert.equal(f.state.shop.options[0].value.enable, false);
    assert.equal(f.notices.length, 0);
  }
});
