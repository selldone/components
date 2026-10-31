import assert from "node:assert/strict";
import { File } from "node:buffer";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const sources = {
  upload: read("../../../utils/upload/UploadHelper.ts"),
  converter: read("../../../utils/converters/FileFormatConverterOnline.ts"),
  temporary: read("../../../utils/temporary-data/TemporaryDataHelper.ts"),
  mixin: read("./SpreadsheetMixin.ts"),
};
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const plain = (value) => JSON.parse(JSON.stringify(value));

function environment() {
  const calls = { requests: [], notices: [], uploads: [], parses: [], events: [], errors: [], warnings: [] };
  const axios = { post(url, body, config) {
    return new Promise((resolve, reject) => calls.requests.push({ url, body, config, resolve, reject }));
  } };
  const notifications = Object.fromEntries(["showErrorAlert", "showLaravelError"].map((method) => [method, (...args) => calls.notices.push({ method, args })]));
  const window = {
    API: { POST_CONVERTER_EXCEL_CSV: (id) => `/fixture/shops/${id}/converter/excel/csv` },
    VAPI: { POST_MY_VENDOR_CONVERTER_EXCEL_CSV: (id) => `/fixture/vendors/${id}/converter/excel/csv` },
  };
  let UploadHelper, FileFormatConverterOnline, TemporaryDataHelper;
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name === "axios") return { default: axios };
    if (name.includes("NotificationService")) return { default: notifications };
    if (name.includes("UploadHelper")) return { UploadHelper };
    if (name.includes("FileFormatConverterOnline")) return { FileFormatConverterOnline };
    if (name.includes("TemporaryDataHelper")) return { TemporaryDataHelper };
    if (name.includes("BSpreadsheetConversionProgress.vue")) return { default: { render: () => Vue.h("conversion-progress") } };
    throw new Error(`Unexpected conversion dependency: ${name}`);
  };
  const load = (source) => {
    const result = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }, reportDiagnostics: true });
    assert.deepEqual(result.diagnostics, []);
    const exports = {};
    vm.runInNewContext(result.outputText, { exports, require, window, FormData, File, console });
    return exports;
  };
  ({ UploadHelper } = load(sources.upload));
  ({ FileFormatConverterOnline } = load(sources.converter));
  ({ TemporaryDataHelper } = load(sources.temporary));
  const Mixin = load(sources.mixin).default;
  return { calls, Mixin, FileFormatConverterOnline };
}

const element = (type, text = "") => ({ type, text, props: {}, style: {}, children: [], parent: null });
const remove = (node) => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; };
const renderer = Vue.createRenderer({
  createElement: element, createText: (text) => element("text", text), createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) { remove(node); const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, node); node.parent = parent; },
  remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; }, parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const descendants = (node) => [node, ...node.children.flatMap(descendants)];

async function fixture(t, { vendor = false } = {}) {
  const { calls, Mixin } = environment();
  const controls = Vue.reactive({ valid: true, count: 1, converting: false });
  const temporary = Vue.reactive({ value: null });
  const route = Vue.reactive({ params: { shop_id: 19, ...(vendor ? { vendor_id: 73 } : {}) }, matched: [{ meta: { vendor } }] });
  let state;
  const Host = {
    mixins: [Mixin],
    data: () => ({ headers: ["Old header"], items: [["Old row"]] }),
    methods: {
      parseFile() {
        calls.parses.push(this.file);
        this.headers = this.file ? ["Name"] : null;
        this.items = this.file ? [[this.file]] : null;
        this.$emit("update:valid", Boolean(this.file));
        this.$emit("update:totalItems", this.items?.length || 0);
      },
    },
    render() { state = this; return Vue.h("div"); },
  };
  const app = renderer.createApp({ render: () => Vue.h("div", [
    Vue.h(Host, {
      "onUpdate:valid": (value) => { controls.valid = value; calls.events.push(["valid", value]); },
      "onUpdate:totalItems": (value) => { controls.count = value; },
      "onUpdate:converting": (value) => { controls.converting = value; calls.events.push(["converting", value]); },
    }),
    Vue.h("button", { disabled: !controls.valid || !controls.count || controls.converting }, "Continue"),
  ]) });
  Object.assign(app.config.globalProperties, {
    $route: route,
    $store: {
      getters: { get getRouteTemporaryDataPass() { return temporary.value; } },
      commit(name, value) { assert.equal(name, "setRouteTemporaryDataPass"); temporary.value = value; },
      dispatch(value) { calls.uploads.push(value); },
    },
  });
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  const root = element("root"); app.mount(root); await settle();
  let mounted = true;
  const unmount = () => { if (mounted) { app.unmount(); mounted = false; } };
  t.after(() => { unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const choose = async (file) => { state.selectFile(file); await settle(); };
  const continueButton = () => descendants(root).find((node) => node.type === "button");
  return { state, calls, controls, route, choose, continueButton, unmount };
}

test("shop and vendor Excel conversions remain pending through upload and parse only the confirmed result", async (t) => {
  for (const vendor of [false, true]) for (const extension of ["xls", "XLSX"]) {
    const f = await fixture(t, { vendor });
    const file = new File(["Synthetic workbook bytes"], `Category import.${extension}`);
    assert.equal(f.continueButton().props.disabled, false);
    await f.choose([file]);
    assert.equal(f.state.converting_file, true);
    assert.equal(f.controls.converting, true);
    assert.equal(f.controls.valid, false);
    assert.equal(f.state.headers, null); assert.equal(f.state.items, null);
    assert.equal(f.continueButton().props.disabled, true);
    assert.deepEqual(f.calls.parses, []);
    const request = f.calls.requests[0];
    assert.equal(request.url, vendor ? "/fixture/vendors/73/converter/excel/csv" : "/fixture/shops/19/converter/excel/csv");
    assert.equal(request.config.withCredentials, true);
    assert.deepEqual([...request.body.keys()], ["file"]);
    const uploaded = request.body.get("file");
    assert.equal(uploaded.name, file.name); assert.equal(await uploaded.text(), await file.text());
    request.config.onUploadProgress({ loaded: 4, total: 8 });
    assert.equal(f.calls.uploads[0].type, "addUploadingFile");
    assert.equal(f.calls.uploads[0].file_id, file.name); assert.equal(f.calls.uploads[0].name, file.name);
    assert.equal(f.calls.uploads[0].color, "amber"); assert.equal(f.calls.uploads[0].target, null);
    assert.ok(f.calls.uploads[0].progress > 0 && f.calls.uploads[0].progress < 100);
    request.resolve({ data: "Name,Title\nfixture,Fixture category" }); await settle();
    assert.equal(f.state.converting_file, false); assert.equal(f.controls.converting, false);
    assert.equal(f.state.converted_file, true);
    assert.deepEqual(f.calls.parses, ["Name,Title\nfixture,Fixture category"]);
    assert.equal(f.continueButton().props.disabled, false);
    assert.deepEqual(f.calls.events.filter(([name]) => name === "converting"), [["converting", true], ["converting", false]]);
    assert.deepEqual(plain(f.calls.uploads.filter(({ type }) => type === "removeUploadingFile")), [{ type: "removeUploadingFile", file_id: file.name }]);
    assert.deepEqual(f.calls.notices, []);
  }
});

test("application and network errors release conversion busy state without restoring old valid rows", async (t) => {
  for (const vendor of [false, true]) for (const outcome of ["application", "network"]) {
    const f = await fixture(t, { vendor });
    const file = new File(["Synthetic workbook bytes"], "failure.xlsx");
    await f.choose(file);
    assert.equal(f.state.converting_file, true); assert.equal(f.continueButton().props.disabled, true);
    const error = new Error("Synthetic upload failure");
    if (outcome === "application") f.calls.requests[0].resolve({ data: { error: true, error_msg: "Fixture workbook rejected" } });
    else f.calls.requests[0].reject(error);
    await settle();
    assert.equal(f.state.converting_file, false); assert.equal(f.controls.converting, false);
    assert.equal(f.continueButton().props.disabled, true); assert.equal(f.controls.valid, false);
    assert.equal(f.state.headers, null); assert.equal(f.state.items, null); assert.equal(f.state.converted_file, false);
    assert.deepEqual(f.calls.parses, []);
    assert.equal(f.calls.notices.length, 1);
    assert.equal(f.calls.notices[0].method, outcome === "application" ? "showErrorAlert" : "showLaravelError");
    assert.deepEqual(f.calls.notices[0].args, outcome === "application" ? [null, "Fixture workbook rejected"] : [error]);
    assert.deepEqual(plain(f.calls.uploads), [{ type: "removeUploadingFile", file_id: file.name }]);
    assert.deepEqual(f.calls.events.filter(([name]) => name === "converting"), [["converting", true], ["converting", false]]);
  }
});

test("a stale workbook completion cannot replace or unlock a newer pending workbook", async (t) => {
  for (const sameFile of [false, true]) {
    const f = await fixture(t);
    const first = new File(["First workbook"], "first.xlsx");
    const second = sameFile ? first : new File(["Second workbook"], "second.xls");
    await f.choose(first); await f.choose(second);
    f.calls.requests[0].resolve({ data: "Stale CSV" }); await settle();
    assert.equal(f.state.converting_file, true); assert.equal(f.controls.converting, true);
    assert.equal(f.continueButton().props.disabled, true); assert.equal(Vue.toRaw(f.state.file), second);
    assert.deepEqual(f.calls.parses, []);
    f.calls.requests[1].resolve({ data: "Current CSV" }); await settle();
    assert.equal(f.state.converting_file, false); assert.equal(f.continueButton().props.disabled, false);
    assert.deepEqual(f.calls.parses, ["Current CSV"]);
    assert.equal(f.calls.uploads.filter(({ type }) => type === "removeUploadingFile").length, 2);
  }
});

test("clear, CSV replacement and unmount invalidate a pending conversion without leaking upload cleanup", async (t) => {
  for (const action of ["clear", "csv", "unmount"]) {
    const f = await fixture(t);
    const original = new File(["Synthetic workbook bytes"], "pending.xlsx");
    await f.choose(original);
    let expectedParses;
    if (action === "unmount") {
      f.unmount(); expectedParses = [];
      assert.equal(f.state.converting_file, false);
      assert.equal(f.controls.converting, false, "Unmount must release the parent even after its watcher stops");
    }
    else {
      const replacement = action === "csv" ? new File(["Name\nReplacement"], "replacement.csv") : null;
      await f.choose(replacement); expectedParses = replacement ? [replacement] : [];
      assert.equal(f.state.converting_file, false); assert.equal(f.controls.converting, false);
      assert.equal(f.continueButton().props.disabled, action === "clear");
    }
    f.calls.requests[0].resolve({ data: "Stale CSV" }); await settle();
    assert.deepEqual(f.calls.parses, expectedParses);
    assert.deepEqual(plain(f.calls.uploads), [{ type: "removeUploadingFile", file_id: original.name }]);
    if (action === "clear" || action === "unmount") assert.equal(f.state.file, null);
    else assert.equal(f.state.file.name, "replacement.csv");
  }
});

test("both Excel converter entry points return their settled upload lifecycle without changing callback arguments", async () => {
  for (const vendor of [false, true]) {
    const { calls, FileFormatConverterOnline } = environment();
    const vue = { $store: { dispatch: (value) => calls.uploads.push(value) } };
    const file = new File(["Synthetic workbook"], "direct.xls");
    const parsed = [];
    const completion = FileFormatConverterOnline[vendor ? "VendorConvertToCsv" : "ConvertToCsv"](vue, 42, file, (data) => parsed.push(data));
    assert.equal(typeof completion?.then, "function");
    let finished = false; completion.then(() => { finished = true; }); await settle(); assert.equal(finished, false);
    calls.requests[0].resolve({ data: "Converted CSV" }); await completion;
    assert.equal(finished, true); assert.deepEqual(parsed, ["Converted CSV"]);
    assert.deepEqual(plain(calls.uploads), [{ type: "removeUploadingFile", file_id: file.name }]);
  }
});

test("shop and vendor route changes discard pending conversions even after returning to the original scope", async (t) => {
  for (const [vendor, parameter] of [[false, "shop_id"], [true, "shop_id"], [true, "vendor_id"]]) for (const returnToOriginal of [false, true]) {
    const f = await fixture(t, { vendor });
    await f.choose(new File(["Old scope workbook"], "old-scope.xlsx"));
    assert.equal(f.state.converting_file, true); assert.equal(f.controls.converting, true);
    const original = f.route.params[parameter];
    f.route.params[parameter] = original + 1; await settle();
    assert.equal(f.state.converting_file, false); assert.equal(f.controls.converting, false);
    assert.equal(f.controls.valid, false); assert.equal(f.continueButton().props.disabled, true);
    assert.equal(f.state.file, null); assert.equal(f.state.headers, null); assert.equal(f.state.items, null);
    if (returnToOriginal) { f.route.params[parameter] = original; await settle(); }
    f.calls.requests[0].resolve({ data: "Stale scope CSV" }); await settle();
    assert.deepEqual(f.calls.parses, []); assert.equal(f.controls.valid, false);
    assert.equal(f.state.converting_file, false); assert.equal(f.controls.converting, false);
    await f.choose(new File(["Current scope workbook"], "current-scope.xls"));
    const current = f.calls.requests[1];
    assert.equal(current.url, vendor ? `/fixture/vendors/${f.route.params.vendor_id}/converter/excel/csv` : `/fixture/shops/${f.route.params.shop_id}/converter/excel/csv`);
    assert.equal(f.controls.converting, true); assert.equal(f.continueButton().props.disabled, true);
    current.resolve({ data: "Current scope CSV" }); await settle();
    assert.deepEqual(f.calls.parses, ["Current scope CSV"]);
    assert.equal(f.controls.valid, true); assert.equal(f.continueButton().props.disabled, false);
    assert.equal(f.state.converting_file, false); assert.equal(f.controls.converting, false);
  }
});
