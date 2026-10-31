import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import { createI18n } from "vue-i18n";

const filename = new URL("./UColorPlateName.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "color-plate-test" }).errors, []);
const exports = {};
vm.runInNewContext(ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, {
  exports,
  window: { $tm: () => ({ "#000000": "Wrong app color" }) },
});
const component = exports.default;

function fixture() {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: { global: { colors: { "#ff0000": "Red", "#0000ff": "Blue" } } },
      fa: { global: { colors: { "#ff0000": "قرمز", "#0000ff": "آبی" } } },
    },
  });
  const events = [];
  const state = { ...component.data(), modelValue: " #ff0000 ", $tm: i18n.global.tm, $emit: (...args) => events.push(args) };
  for (const [key, getter] of Object.entries(component.computed)) {
    Object.defineProperty(state, key, { get: () => getter.call(state) });
  }
  return { state, i18n, events };
}

test("color names follow the component app locale despite a different window translator", () => {
  const { state, i18n } = fixture();
  assert.deepEqual(Array.from(state.filteredColors, item => item.name), ["Blue", "Red"]);
  i18n.global.locale.value = "fa";
  assert.deepEqual(new Set(Array.from(state.filteredColors, item => item.name)), new Set(["آبی", "قرمز"]));
  state.q = "قرمز";
  assert.deepEqual(Array.from(state.filteredColors, item => item.hex), ["#ff0000"]);
  assert.equal(Object.keys(component.computed.colorsMap.call({})).length, 0, "No installed translator keeps the empty-map fallback");
});

test("hex filtering and color selection keep their existing value and event contracts", () => {
  const { state, events } = fixture();
  assert.equal(state.selectedHex, "#ff0000");
  state.q = "0000FF";
  assert.deepEqual(Array.from(state.filteredColors, item => item.name), ["Blue"]);
  state.dialog = true;
  component.methods.select.call(state, "#0000ff");
  assert.deepEqual(events, [["update:modelValue", "#0000ff"], ["select", "#0000ff"]]);
  assert.equal(state.dialog, false);
});
