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
  const state = { ...component.data(), filters, fixedProductId: null, fixedCustomerId: null, allowProduct: true, allowCustomer: true, allowUpdatedAfter: true, ...fixed, $emit: (...event) => events.push(plain(event)) };
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

test("filter capabilities default to enabled and strip unsupported leftovers without validating them", () => {
  for (const name of ["allowProduct", "allowCustomer", "allowUpdatedAfter"]) {
    assert.equal(component.props[name].default, true);
  }
  const applied = { productId: 7, customerId: 9, updatedAfter: "2026-10-01T00:00:00.000Z", customerName: "Sample" };
  for (const [flag, fields] of [
    ["allowProduct", { productId: null }],
    ["allowCustomer", { customerId: null, customerName: "" }],
    ["allowUpdatedAfter", { updatedAfter: null }],
  ]) {
    const f = fixture(applied);
    f.state[flag] = false;
    if (flag === "allowProduct") f.state.draft.productId = "invalid";
    if (flag === "allowCustomer") f.state.draft.customerId = "invalid";
    if (flag === "allowUpdatedAfter") f.state.draft.updatedAfter = "invalid";
    f.state.applyFilters();
    assert.deepEqual(f.events, [["apply", { ...applied, ...fields }], ["update:modelValue", false]]);
    f.open();
    assert.deepEqual(plain(f.state.draft), { ...applied, ...fields });
    assert.deepEqual(applied, { productId: 7, customerId: 9, updatedAfter: "2026-10-01T00:00:00.000Z", customerName: "Sample" });
  }
});

test("unavailable pickers preserve and validate fixed contextual restrictions through clear and apply", () => {
  const f = fixture({ productId: 99, customerId: 88, customerName: "Other customer", updatedAfter: "invalid" }, {
    fixedProductId: "7", fixedCustomerId: "9", allowProduct: false, allowCustomer: false, allowUpdatedAfter: false,
  });
  assert.deepEqual(plain(f.state.draft), empty());
  Object.assign(f.state.draft, { productId: "invalid", customerId: {}, customerName: "Other customer", updatedAfter: "invalid" });
  assert.deepEqual(plain(f.state.normalizedFilters), { ...empty(), productId: 7, customerId: 9 });
  f.state.clearDraft();
  f.state.applyFilters();
  assert.deepEqual(f.events, [["apply", { ...empty(), productId: 7, customerId: 9 }], ["update:modelValue", false]]);
  for (const fixed of [{ fixedProductId: "invalid" }, { fixedCustomerId: -1 }]) {
    const invalid = fixture(empty(), { allowProduct: false, allowCustomer: false, ...fixed });
    invalid.state.applyFilters();
    assert.deepEqual(invalid.events, []);
  }
});

test("cancel preserves applied filters while reopen and apply keep only the current supported draft", () => {
  const applied = Object.freeze({ productId: 7, customerId: 9, updatedAfter: "2026-10-01T00:00:00.000Z", customerName: "Sample" });
  const f = fixture(applied, { allowProduct: false });
  f.state.draft.customerId = 11;
  f.state.draft.customerName = "Draft customer";
  f.state.close();
  assert.deepEqual(f.events, [["update:modelValue", false]]);
  assert.equal(applied.customerId, 9);
  f.open();
  assert.deepEqual(plain(f.state.draft), { ...applied, productId: null });
  f.state.draft.customerId = 12;
  f.state.draft.customerName = " New customer ";
  f.state.applyFilters();
  assert.deepEqual(f.events.slice(1), [["apply", { ...applied, productId: null, customerId: 12, customerName: "New customer" }], ["update:modelValue", false]]);
  assert.equal(applied.customerId, 9);
});
