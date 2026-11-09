import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import { compile as compileDom } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("BProductLocationRestrictionsList.vue", import.meta.url);
const { descriptor } = parse(readFileSync(file, "utf8"), {
  filename: file.pathname,
});
const exports = {};
vm.runInNewContext(
  ts.transpileModule(descriptor.script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  {
    exports,
    require: () => ({
      default: { showSuccessAlert() {} },
      ProductType: {},
      getCodes: () => ["AR", "DK", "FR"],
    }),
  },
);
const options = exports.default;
const render = new Function(
  "Vue",
  compileDom(descriptor.template.content, { mode: "function" }).code,
)({
  ...Vue,
  resolveComponent: (name) => name,
  resolveDynamicComponent: (name) => name,
});

function widget(locations) {
  const state = {
    ...options.data(),
    modern: true,
    product: { id: 1, locations },
    shop: { id: 1, countries: null },
    locations,
    has_location: !!locations,
    $t: (key) => key,
    $route: { params: {}, matched: [] },
    $el: { querySelector: () => null },
    $nextTick: (callback) => callback(),
    getCountryName: (iso) => `name:${iso}`,
    USER: () => null,
  };
  for (const [name, getter] of Object.entries(options.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  for (const [name, method] of Object.entries(options.methods))
    state[name] = method.bind(state);
  return state;
}

function pickers(state) {
  const nodes = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push(node);
    visit(node.children);
    if (typeof node.children?.default === "function")
      visit(node.children.default());
  };
  visit(render.call(state, state, []));
  return nodes.filter((node) => node.type === "s-country-select");
}

test("every country picker returns ISO alpha-2 codes, the format ProductLocationRule saves", () => {
  for (const locations of [{}, { DK: ["2100"] }]) {
    const found = pickers(widget(locations));
    assert.ok(found.length >= 1);
    for (const picker of found)
      assert.equal(picker.props["item-value"], "alpha2");
  }
});

test("adding a country keeps alpha-2 keys and skips listed countries", () => {
  const state = widget({ DK: ["2100"] });
  state.addCountry("Argentina");
  state.addCountry(null);
  assert.deepEqual(Object.keys(state.locations), ["DK"]);
  assert.equal(state.setting_changed, false);
  state.addCountry("AR");
  // JSON: the payload shape PUT_SET_PRODUCT_LOCATIONS sends (arrays come from the vm realm).
  assert.equal(JSON.stringify(state.locations), '{"DK":["2100"],"AR":[]}');
  assert.equal(state.setting_changed, true);
  assert.deepEqual([...state.addable_countries], ["FR"]);
});

test("a loaded profile is a draft that needs Save", () => {
  const state = widget({});
  state.selected_profile = { title: "EU", locations: { FR: ["75001"] } };
  state.setProfile();
  assert.equal(JSON.stringify(state.locations), '{"FR":["75001"]}');
  assert.equal(state.setting_changed, true);
});
