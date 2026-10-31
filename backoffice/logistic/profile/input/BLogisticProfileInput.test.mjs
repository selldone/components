import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const filename = fileURLToPath(new URL("./BLogisticProfileInput.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const plain = value => JSON.parse(JSON.stringify(value));
const settle = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };
const response = (name = "Warranty", id = 12) => ({ profiles: [{ id, name, info: { languages: ["en", "fa"] } }], total: 1 });

function fixture(vendor = false, modern = true) {
  const calls = { reads: [], notices: [] };
  const sdk = mode => ({
    optimize() { return this; }, cancellation() { return this; },
    list(...args) {
      let resolve, reject;
      const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
      const request = { mode, args, resolve, reject, cached: null };
      calls.reads.push(request);
      return { cache(callback) { request.cached = callback; return promise; } };
    },
  });
  const exports = {};
  vm.runInNewContext(ts.transpileModule(descriptor.script.content, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports,
    require(name) {
      if (name.includes("NotificationService")) return { default: { showLaravelError: error => calls.notices.push(error) } };
      if (name.includes("threads")) return { default: { debounceSearch: callback => callback } };
      return {};
    },
    window: { $backoffice: { logistic: { profile: sdk("owner") } }, $vendor: { logistic: { profile: sdk("vendor") } } },
  });
  const component = exports.default;
  const state = { ...component.data(), modern, shop: { id: 7 }, type: { value: "WARRANTY", title: "Warranty" },
    modelValue: 12, $route: { params: vendor ? { vendor_id: "8" } : {}, matched: vendor ? [{ meta: { vendor: true } }] : [] },
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  component.created.call(state);
  return { component, state, calls };
}

test("the native autocomplete compiles with its real bindings and scoped styles", async () => {
  const script = compileScript(descriptor, { id: "logistic-profile-input-test" });
  const template = compileTemplate({ source: descriptor.template.content, filename, id: "logistic-profile-input-test",
    compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({ source: style.content, filename,
    id: "logistic-profile-input-test", scoped: style.scoped, preprocessLang: style.lang })).errors, []);
});

test("owner and vendor retain native bounded list arguments and selected-id/search/type filters", async () => {
  for (const vendor of [false, true]) {
    const f = fixture(vendor), read = f.calls.reads[0];
    assert.equal(f.component.props.modern.default, false);
    assert.equal(read.mode, vendor ? "vendor" : "owner");
    assert.deepEqual(plain(read.args), [vendor ? "8" : 7, 0, 20, { contain: 12, search: "", compact: true, type: "WARRANTY" }]);
    read.resolve(response()); await settle();
    assert.equal(f.state.live_value.name, "Warranty");
    assert.equal(f.state.busy, false);
    f.state.menu = true; f.state.search = "Replacement";
    f.component.watch.search.call(f.state, "Replacement");
    assert.deepEqual(plain(f.calls.reads.at(-1).args[3]), { contain: 12, search: "Replacement", compact: true, type: "WARRANTY" });
    f.calls.reads.at(-1).resolve(response("Replacement")); await settle();
    assert.equal(f.state.live_value.name, "Replacement");
  }
});

test("out-of-order cached/network results cannot replace the current options or finish their loading", async () => {
  const f = fixture(), old = f.calls.reads[0];
  f.state.search = "Current"; f.state.getProfiles();
  const current = f.calls.reads.at(-1);
  old.cached(response("Old cached")); old.reject(new Error("Stale read")); await settle();
  assert.equal(f.state.profiles.length, 0);
  assert.equal(f.state.busy, true);
  assert.equal(f.calls.notices.length, 0);
  current.cached(response("Current cached"));
  assert.equal(f.state.live_value.name, "Current cached");
  current.resolve(response("Current network")); await settle();
  assert.equal(f.state.live_value.name, "Current network");
  assert.equal(f.state.total, 1);
  assert.equal(f.state.busy, false);
});

test("shop/type/vendor changes and unmount discard old options and suppress stale errors", async () => {
  for (const boundary of ["shop", "type", "vendor", "unmount"]) {
    const f = fixture(), old = f.calls.reads[0];
    if (boundary === "shop") { f.state.shop.id = 9; f.component.watch["shop.id"].call(f.state); }
    if (boundary === "type") { f.state.type = { value: "GUIDE" }; f.component.watch.type.call(f.state); }
    if (boundary === "vendor") { f.state.$route.params.vendor_id = "8"; f.component.watch["$route.params.vendor_id"].call(f.state); }
    if (boundary === "unmount") f.component.beforeUnmount.call(f.state);
    old.cached(response("Stale options")); old.reject(new Error("Stale context")); await settle();
    assert.equal(f.state.profiles.length, 0, boundary);
    assert.equal(f.calls.notices.length, 0, boundary);
    if (boundary !== "unmount") {
      assert.equal(f.state.busy, true, boundary);
      f.calls.reads.at(-1).resolve(response("Current context")); await settle();
      assert.equal(f.state.live_value.name, "Current context", boundary);
      assert.equal(f.state.busy, false, boundary);
    }
  }
});

test("a missing selected id refreshes native options, while loaded/cleared values do not refetch", async () => {
  const f = fixture();
  f.calls.reads[0].resolve(response()); await settle();
  f.state.modelValue = 99; f.component.watch.modelValue.call(f.state, 99);
  assert.equal(f.calls.reads.length, 2);
  assert.equal(f.calls.reads.at(-1).args[3].contain, 99);
  f.calls.reads.at(-1).resolve(response("Selected profile", 99)); await settle();
  assert.equal(f.state.live_value.name, "Selected profile");
  f.component.watch.modelValue.call(f.state, 99);
  f.state.modelValue = null; f.component.watch.modelValue.call(f.state, null);
  assert.equal(f.calls.reads.length, 2);
  const legacy = fixture(false, false);
  legacy.state.modelValue = 99; legacy.component.watch.modelValue.call(legacy.state, 99);
  assert.equal(legacy.calls.reads.length, 1);
});

test("a current read error retains previous options and a retry recovers normally", async () => {
  const f = fixture();
  f.calls.reads[0].resolve(response()); await settle();
  f.state.getProfiles();
  f.calls.reads.at(-1).reject(new Error("Synthetic list failure")); await settle();
  assert.equal(f.state.live_value.name, "Warranty");
  assert.equal(f.state.busy, false);
  assert.equal(f.calls.notices.length, 1);
  f.state.getProfiles();
  f.calls.reads.at(-1).resolve(response("Recovered")); await settle();
  assert.equal(f.state.live_value.name, "Recovered");
  assert.equal(f.state.busy, false);
});
