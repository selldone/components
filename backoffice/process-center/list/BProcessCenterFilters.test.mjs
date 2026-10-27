import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// Exercise draft state only; product/customer suggestions and APIs are never invoked.
const filename = "BProcessCenterFilters.vue";
const { descriptor, errors } = parse(readFileSync(new URL(`./${filename}`, import.meta.url), "utf8"), { filename });
assert.deepEqual(errors, []);
assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: "filters-test" }).errors, []);
assert.deepEqual((await compileStyleAsync({ source: descriptor.styles[0].content, filename, id: "data-v-filters-test", scoped: true, preprocessLang: "scss" })).errors, []);
const exports = {};
vm.runInNewContext(ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports, require: () => ({ default: {} }) });
const component = exports.default;
const plain = (value) => JSON.parse(JSON.stringify(value));
const empty = () => ({ productId: null, customerId: null, updatedAfter: null, customerName: "" });
function fixture(filters = empty(), fixed = {}) {
  const events = [];
  const state = { ...component.data(), filters, fixedProductId: null, fixedCustomerId: null, ...fixed, $emit: (...event) => events.push(plain(event)) };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  Object.defineProperty(state, "normalizedFilters", { get: () => component.computed.normalizedFilters.call(state) });
  const open = () => component.watch.modelValue.handler.call(state, true);
  open();
  return { state, events, open };
}

test("opening clones known fields; cancel and clear do not mutate applied filters", () => {
  const applied = { productId: 7, customerId: 9, updatedAfter: "2026-10-01T00:00:00.000Z", customerName: "Sample" };
  const f = fixture(applied);
  f.state.draft.productId = 11;
  f.state.close();
  assert.equal(applied.productId, 7);
  assert.deepEqual(f.events, [["update:modelValue", false]]);
  f.open();
  assert.equal(f.state.draft.productId, 7);
  f.state.clearDraft();
  assert.deepEqual(plain(f.state.draft), empty());
  assert.equal(applied.productId, 7);
});

test("apply emits only bounded known fields and normalizes dates to UTC", () => {
  const f = fixture();
  Object.assign(f.state.draft, { productId: "12", customerId: 13, updatedAfter: "2026-10-27T10:30:00+04:00", customerName: "x".repeat(140), unknown: "ignored" });
  f.state.applyFilters();
  assert.deepEqual(f.events, [["apply", { productId: 12, customerId: 13, updatedAfter: "2026-10-27T06:30:00.000Z", customerName: "x".repeat(120) }], ["update:modelValue", false]]);
});

test("invalid IDs and dates cannot apply; fixed context wins over draft", () => {
  for (const value of [-1, 0, 1.5, "invalid", {}, Number.MAX_SAFE_INTEGER + 1]) {
    const f = fixture({ ...empty(), productId: value });
    f.state.applyFilters();
    assert.deepEqual(f.events, []);
  }
  for (const updatedAfter of ["invalid-date", 0, false, {}]) {
    const f = fixture({ ...empty(), updatedAfter });
    f.state.applyFilters();
    assert.deepEqual(f.events, []);
  }
  const fixed = fixture({ ...empty(), productId: 99, customerId: 88, customerName: "Other customer" }, { fixedProductId: 7, fixedCustomerId: 9 });
  fixed.state.applyFilters();
  assert.equal(fixed.events[0][1].productId, 7);
  assert.equal(fixed.events[0][1].customerId, 9);
  assert.equal(fixed.events[0][1].customerName, "");
});
