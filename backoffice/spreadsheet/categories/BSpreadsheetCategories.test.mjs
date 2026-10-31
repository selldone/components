import assert from "node:assert/strict";
import { File } from "node:buffer";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import Papa from "papaparse";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const file = new URL("./BSpreadsheetCategories.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "category-csv-test" });
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "category-csv-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const mixinSource = readFileSync(new URL("../mixins/SpreadsheetMixin.ts", import.meta.url), "utf8");
const temporarySource = readFileSync(new URL("../../../utils/temporary-data/TemporaryDataHelper.ts", import.meta.url), "utf8");
const categorySource = readFileSync(new URL("../../../../core-js/helper/csv/CategoriesCsvFormat.ts", import.meta.url), "utf8");
const productSource = ts.createSourceFile("products.ts", readFileSync(new URL("../../../../core-js/helper/csv/product/ProductsCsvFormat.ts", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true);
const productHeaders = productSource.statements.filter(ts.isVariableStatement).flatMap((statement) => statement.declarationList.declarations).find((declaration) => declaration.name.getText(productSource) === "ProductsCsvHeaders");
const productClass = productSource.statements.find((statement) => ts.isClassDeclaration(statement) && statement.name.text === "ProductsCsvFormat");
const productValidation = `export const ProductsCsvHeaders = ${productHeaders.initializer.getText(productSource)};\n${productClass.getText(productSource)}`;
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const categoryPacks = Object.fromEntries(["en", "fa"].map((language) => {
  const source = ts.createSourceFile(`${language}.ts`, readFileSync(new URL(`../../../../translate/dashboard/${language}.ts`, import.meta.url), "utf8"), ts.ScriptTarget.Latest, true);
  assert.deepEqual(source.parseDiagnostics, []);
  const pack = source.statements.find(ts.isExportAssignment).expression;
  const importer = pack.properties.find((property) => property.name?.getText(source) === "importer").initializer;
  const workspace = importer.properties.find((property) => property.name?.getText(source) === "category_workspace").initializer;
  return [language, new Function(`return (${workspace.getText(source)})`)()];
}));
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
const stub = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(name, attrs, [slots["prepend-inner"]?.(), slots.default?.(), name === "v-file-input" && attrs.modelValue ? slots.selection?.({ fileNames: ["native-shortened-name.csv"], totalBytesReadable: "12.3 kB" }) : null]) });

async function fixture(t, { modern = true, language = "en", deferred = false, temporary = null } = {}) {
  const calls = { parses: [], conversions: [], events: [], notices: [], routes: [], temporary: [], sheet: [], errors: [], warnings: [] };
  const storeState = Vue.reactive({ value: temporary });
  let SpreadsheetMixin, TemporaryDataHelper, core;
  const sheet = { name: "BSpreadsheet", inheritAttrs: false, methods: { goFirst() { calls.sheet.push("first"); }, showPagedData() { calls.sheet.push("page"); } }, setup: (_, { attrs }) => () => Vue.h("b-spreadsheet", attrs) };
  const readCsv = async (file) => typeof file === "string" ? file : typeof file.text === "function" ? file.text() : file.content;
  const context = vm.createContext({ exports: {}, console, File,
    require(name) {
      if (name === "vue") return Vue;
      if (name.endsWith(".svg")) return { default: "/fixture/excel.svg" };
      if (name === "@selldone/core-js") return core;
      if (name === "papaparse") return { parse(file, config) {
        const pending = { file, config }; calls.parses.push(pending);
        if (!deferred) readCsv(file).then((content) => config.complete(Papa.parse(content, { skipEmptyLines: config.skipEmptyLines })), config.error);
      } };
      if (name.includes("SpreadsheetMixin")) return { default: SpreadsheetMixin };
      if (name.includes("BSpreadsheetConversionProgress.vue")) return { default: stub("conversion-progress") };
      if (name.includes("TemporaryDataHelper")) return { TemporaryDataHelper };
      if (name.includes("FileFormatConverterOnline")) return { FileFormatConverterOnline: { ConvertToCsv(vue, shopId, file, callback) {
        return new Promise((resolve) => calls.conversions.push({ file, callback(data) { callback(data); resolve(); }, resolve }));
      }, VendorConvertToCsv() { throw new Error("Unexpected vendor conversion request"); } } };
      if (name.endsWith("BSpreadsheet.vue")) return { default: sheet };
      if (name.includes("NotificationService")) return { default: Object.fromEntries(["showSuccessAlert", "showErrorAlert"].map((method) => [method, (...args) => calls.notices.push({ method, args })])) };
      throw new Error(`Unexpected CSV dependency ${name}`);
    },
  });
  const load = (source) => { context.exports = {}; vm.runInContext(`((exports) => {${transpile(source)}\n})(exports)`, context); return context.exports; };
  core = { ...load(categorySource), ...load(productValidation) };
  TemporaryDataHelper = load(temporarySource).TemporaryDataHelper;
  SpreadsheetMixin = load(mixinSource).default;
  const component = load(script.content).default;
  const render = load(template.code).render;
  let state;
  const compiled = { ...component, render(...args) { state = this; return render.apply(this, args); } };
  const props = Vue.reactive({ modern, canSelectFile: true });
  const app = renderer.createApp({ render: () => Vue.h(compiled, { ...props, "onUpdate:totalItems": (value) => calls.events.push(["total", value]), "onUpdate:valid": (value) => calls.events.push(["valid", value]), "onUpdate:converting": (value) => calls.events.push(["converting", value]) }) });
  Object.assign(app.config.globalProperties, { $t(key) {
    const value = categoryPacks[language][key.replace("importer.category_workspace.", "")];
    assert.equal(typeof value, "string", `Missing ${language} category import copy: ${key}`); return value;
  }, $route: { params: { shop_id: 19 }, matched: [] }, $router: { push(route) { calls.routes.push(route); } },
    $store: { getters: { get getRouteTemporaryDataPass() { return storeState.value; } }, commit(name, data) { assert.equal(name, "setRouteTemporaryDataPass"); calls.temporary.push(data); storeState.value = data; } },
  });
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) app.component(match[1], stub(match[1]));
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  const root = element("root"); app.mount(root); await settle();
  let mounted = true;
  const unmount = () => { if (mounted) { app.unmount(); mounted = false; } };
  t.after(() => { unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const nodes = (name) => descendants(root).filter((node) => node.type === name);
  const choose = async (file) => { for (const handler of [nodes("v-file-input")[0].props["onUpdate:modelValue"]].flat()) handler(file); await settle(); };
  const finish = async (index, content) => { const request = calls.parses[index]; request.config.complete(Papa.parse(content ?? await readCsv(request.file), { skipEmptyLines: request.config.skipEmptyLines })); await settle(); };
  const csv = (rows) => Papa.unparse([core.CategoriesCsvHeaders, ...rows]);
  return { state, props, calls, nodes, choose, finish, csv, core, storeState, app, unmount };
}

test("modern spreadsheet input keeps its native single-line label, accessible selection, clear and size", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language });
    const input = f.nodes("v-file-input")[0];
    assert.equal(input.props.accept, ".csv,.xls,.xlsx"); assert.equal(input.props.clearable, ""); assert.equal(input.props["show-size"], "");
    assert.equal(input.props["aria-label"], categoryPacks[language].file_label);
    assert.equal(input.props.variant, "plain");
    assert.equal(input.props.label, categoryPacks[language].file_label); assert.equal(input.props["single-line"], true);
    assert.equal(input.props["prepend-inner-icon"], undefined);
    const spreadsheetIcon = f.nodes("img")[0];
    assert.match(spreadsheetIcon.props.src, /\/excel\.svg$/);
    assert.equal(spreadsheetIcon.props.width, "24"); assert.equal(spreadsheetIcon.props.height, "24");
    assert.equal(spreadsheetIcon.props.alt, "");
    assert.equal(input.props["center-affix"], true);
    const file = new File([f.csv([["a", "Category A", "", "", ""]])], `${"long-category-name-".repeat(12)}.csv`, { type: "text/csv" });
    await f.choose(file);
    assert.equal(f.nodes("v-file-input")[0].props["aria-label"], `${categoryPacks[language].file_label}: ${file.name}`);
    assert.equal(Vue.toRaw(f.nodes("v-file-input")[0].props.modelValue), file);
    assert.equal(f.nodes("v-file-input")[0].props.label, categoryPacks[language].file_label);
    assert.equal(f.nodes("img")[0], spreadsheetIcon);
    const filename = f.nodes("bdi").find((node) => node.props.class === "b-spreadsheet-categories__filename");
    assert.equal(filename.text, file.name); assert.equal(filename.props.title, file.name);
    assert.equal(f.nodes("bdi").find((node) => node.props.class === "b-spreadsheet-categories__size").text, "12.3 kB");
    await f.choose(null);
    assert.equal(f.nodes("v-file-input")[0].props.modelValue, null);
    assert.equal(f.nodes("v-file-input")[0].props["aria-label"], categoryPacks[language].file_label);
    assert.equal(f.nodes("v-file-input")[0].props.label, categoryPacks[language].file_label);
    assert.equal(f.nodes("bdi").length, 0);
    await f.choose([file]);
    assert.equal(Vue.toRaw(f.nodes("v-file-input")[0].props.modelValue), file);
    assert.equal(f.state.parse_state, "ready"); assert.equal(f.calls.conversions.length, 0);
    await f.choose(null);
    assert.equal(f.nodes("b-spreadsheet")[0].props.modern, true);
    f.props.canSelectFile = false; await settle(); assert.equal(f.nodes("v-file-input")[0].props.disabled, true);
    const legacy = await fixture(t, { modern: false }); assert.equal(legacy.nodes("v-file-input")[0].props.variant, "outlined"); assert.equal(legacy.nodes("b-spreadsheet")[0].props.modern, false);
    assert.equal(legacy.nodes("v-file-input")[0].props.label, "Select categories .csv / .xls / .xlsx file"); assert.equal(legacy.nodes("v-file-input")[0].props["single-line"], false);
    assert.equal(legacy.nodes("img").length, 1);
  }
});

test("temporary CSV text becomes a named native File with the actual UTF-8 byte size", async (t) => {
  const seed = await fixture(t);
  const csv = seed.csv([["a", "دسته‌بندی آزمایشی", "", "", ""]]);
  const f = await fixture(t, { temporary: { file: csv, converted_file: true } });
  const nativeFile = f.nodes("v-file-input")[0].props.modelValue;
  assert.ok(nativeFile instanceof File);
  assert.equal(nativeFile.name, "categories.csv");
  assert.equal(nativeFile.size, Buffer.byteLength(csv, "utf8"));
  assert.equal(await nativeFile.text(), csv);
  assert.equal(f.state.parse_state, "ready"); assert.equal(f.state.items.length, 1);
  assert.equal(f.nodes("bdi").find((node) => node.props.class === "b-spreadsheet-categories__filename").text, "categories.csv");
  await f.choose(null);
  assert.equal(f.nodes("v-file-input")[0].props.modelValue, null);
  assert.equal(f.state.parse_state, "idle"); assert.equal(f.state.items, null);
});

test("converted CSV text keeps the original workbook name through File and File-array selection", async (t) => {
  for (const modern of [true, false]) for (const extension of ["xls", "XLS", "xlsx", "XLSX"]) for (const asArray of [false, true]) {
    const f = await fixture(t, { modern });
    const original = new File(["synthetic workbook"], `My categories.${extension}`);
    const csv = f.csv([["a", "Category A", "", "", ""]]);
    await f.choose(asArray ? [original] : original);
    assert.equal(f.calls.conversions.length, 1); assert.equal(f.calls.parses.length, 0);
    assert.equal(Vue.toRaw(f.calls.conversions[0].file), original);
    f.calls.conversions[0].callback(csv); await settle();
    const nativeFile = f.nodes("v-file-input")[0].props.modelValue;
    assert.ok(nativeFile instanceof File); assert.equal(nativeFile.name, "My categories.csv");
    assert.equal(nativeFile.size, Buffer.byteLength(csv, "utf8"));
    assert.equal(await nativeFile.text(), csv);
    assert.equal(f.state.parse_state, "ready"); assert.equal(f.state.converted_file, true);
    assert.equal(f.state.items.length, 1);
    f.nodes("b-spreadsheet")[0].props.items[0][1] = "Edited workbook title";
    const batches = [];
    assert.equal(await f.state.generateCategoriesJson((data) => batches.push(plain(data)), 100, 3000, () => assert.fail("Converted preview is valid")), true);
    assert.equal(batches[0][1][1], "Edited workbook title");
  }
});

test("Excel selection invalidates old rows and ignores conversions after replacement, clear or unmount", async (t) => {
  const f = await fixture(t);
  const csv = f.csv([["old", "Old category", "", "", ""]]);
  await f.choose(new File([csv], "old.csv")); assert.equal(f.state.parse_state, "ready");
  const first = new File(["synthetic workbook"], "first.xlsx");
  const second = new File(["synthetic workbook"], "second.xls");
  await f.choose(first);
  assert.equal(f.state.converting_file, true);
  assert.equal(f.state.items, null); assert.equal(f.state.parse_state, "idle");
  assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
  let errors = 0;
  assert.equal(await f.state.generateCategoriesJson(() => assert.fail("No old rows while conversion is pending or has failed"), 100, 3000, () => errors++), false);
  assert.equal(errors, 1);
  await f.choose(second);
  const before = f.calls.parses.length;
  f.calls.conversions[0].callback(csv); await settle();
  assert.equal(f.state.converting_file, true, "An old response cannot finish the current workbook conversion");
  assert.equal(f.calls.parses.length, before); assert.equal(Vue.toRaw(f.state.file), second);
  assert.equal(f.state.items, null);
  f.calls.conversions[1].callback(f.csv([["second", "Second category", "", "", ""]])); await settle();
  assert.equal(f.state.converting_file, false);
  assert.equal(f.state.items[0][0], "second");
  await f.choose(first);
  await f.choose(new File([f.csv([["replacement", "Replacement CSV", "", "", ""]])], "replacement.csv"));
  const replacement = f.calls.parses.length;
  f.calls.conversions[2].callback(csv); await settle();
  assert.equal(f.calls.parses.length, replacement); assert.equal(f.state.items[0][0], "replacement");
  await f.choose(first); await f.choose(null);
  assert.equal(f.state.converting_file, false);
  const cleared = f.calls.parses.length;
  f.calls.conversions[3].callback(csv); await settle();
  assert.equal(f.calls.parses.length, cleared); assert.equal(f.state.items, null); assert.equal(f.state.file, null);
  await f.choose(second); f.unmount();
  f.calls.conversions[4].callback(csv); await settle();
  assert.equal(f.calls.parses.length, cleared); assert.equal(f.state.file, null);
});

test("a handled conversion failure releases busy state while category import remains invalid", async (t) => {
  const f = await fixture(t);
  await f.choose(new File([f.csv([["old", "Old category", "", "", ""]])], "old.csv"));
  const workbook = new File(["Synthetic workbook bytes"], "rejected.xls");
  await f.choose(workbook);
  assert.equal(f.state.converting_file, true);
  assert.equal(f.state.items, null);
  assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
  const before = f.calls.parses.length;
  f.calls.conversions[0].resolve(); await settle();
  assert.equal(f.state.converting_file, false);
  assert.equal(f.calls.parses.length, before);
  assert.equal(f.state.items, null);
  assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
  assert.deepEqual(f.calls.events.filter(([name]) => name === "converting"), [["converting", true], ["converting", false]]);
  let errors = 0;
  assert.equal(await f.state.generateCategoriesJson(() => assert.fail("A failed workbook must not be importable"), 100, 3000, () => errors++), false);
  assert.equal(errors, 1);
});

test("real CSV parsing preserves categories and edited row values in sequential native batches", async (t) => {
  const f = await fixture(t);
  const rows = Array.from({ length: 5 }, (_, index) => [`category-${index}`, `Title ${index}`, "Description", "", ""]);
  await f.choose({ name: "categories.csv", content: f.csv(rows) });
  assert.equal(f.state.parse_state, "ready");
  assert.deepEqual(plain(f.state.headers), plain(f.core.CategoriesCsvHeaders));
  assert.deepEqual(plain(f.state.items), rows);
  assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], true);
  assert.equal(f.calls.events.filter(([name]) => name === "total").at(-1)[1], 5);
  f.nodes("b-spreadsheet")[0].props.items[0][1] = "Edited category title";
  const batches = [];
  let release;
  const result = f.state.generateCategoriesJson(async (data, progress, end) => { batches.push({ data: plain(data), progress, end }); if (batches.length === 1) await new Promise((resolve) => { release = resolve; }); }, 2, 3000, () => assert.fail("Valid rows cannot fail generation"));
  await settle(); assert.equal(batches.length, 1, "Later batches wait for the current request");
  release(); assert.equal(await result, true);
  assert.deepEqual(batches.map(({ progress, end }) => [progress, end]), [[40, false], [80, false], [100, true]]);
  assert.ok(batches.every(({ data }) => JSON.stringify(data[0]) === JSON.stringify(f.core.CategoriesCsvHeaders)));
  assert.equal(batches[0].data[1][1], "Edited category title");
  assert.deepEqual(batches.flatMap(({ data }) => data.slice(1)).map((row) => row[0]), rows.map((row) => row[0]));
});

test("invalid, empty, header-only and malformed CSV files never remain valid", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language });
    for (const [content, expected] of [["Unknown,Header\nwrong,data", "invalid"], ["", "empty"], [f.csv([]), "empty"], [f.csv([]) + "\n\n , , , , \n", "empty"], ['Name,Title,Description,Image,Parent\n"unclosed', "error"]]) {
      await f.choose({ name: "categories.csv", content });
      assert.equal(f.state.parse_state, expected);
      assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
    }
    let errors = 0; assert.equal(await f.state.generateCategoriesJson(() => assert.fail("No empty batch"), 100, 3000, () => errors++), false); assert.equal(errors, 1);
  }
});

test("clear and replacement invalidate immediately and ignore stale parser completions/errors", async (t) => {
  const f = await fixture(t, { deferred: true });
  const first = { name: "first.csv", content: f.csv([["first", "First", "", "", ""]]) };
  const second = { name: "second.csv", content: f.csv([["second", "Second", "", "", ""]]) };
  await f.choose(first); await f.finish(0); assert.equal(f.state.parse_state, "ready");
  await f.choose(second); assert.equal(f.state.parse_state, "reading"); assert.equal(f.state.items, null); assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
  f.calls.parses[0].config.error(); await settle(); assert.equal(f.state.parse_state, "reading");
  await f.finish(0); assert.equal(f.state.parse_state, "reading");
  await f.choose(null); assert.equal(f.state.parse_state, "idle"); assert.equal(f.state.file, null); assert.equal(f.state.input_files, null);
  await f.finish(1); assert.equal(f.state.items, null); assert.equal(f.calls.events.filter(([name]) => name === "total").at(-1)[1], 0);
  await f.choose(second); f.calls.parses[2].config.error(); await settle(); assert.equal(f.state.parse_state, "error"); assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
});

test("product CSV routing hands the same local file through TemporaryData and retains invalid category status", async (t) => {
  const f = await fixture(t);
  const file = { name: "products.csv", content: Papa.unparse([f.core.ProductsCsvHeaders, f.core.ProductsCsvHeaders.map(() => "value")]) };
  await f.choose(file);
  assert.equal(f.calls.routes.length, 1); assert.equal(f.calls.routes[0].name, "BPageShopProductsImporter");
  assert.equal(Vue.toRaw(f.calls.temporary.at(-1).file), file); assert.equal(f.state.preventClearTemporaryDataFlag, true);
  assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
});

test("temporary category files load on mount and clearing temporary data resets validity locally", async (t) => {
  const seed = await fixture(t); const file = { name: "temporary.csv", content: seed.csv([["a", "Category A", "", "", ""]]) };
  const f = await fixture(t, { temporary: { file, converted_file: true } });
  assert.equal(f.state.parse_state, "ready"); assert.equal(f.state.converted_file, true);
  f.storeState.value = null; await settle();
  assert.equal(f.state.parse_state, "idle"); assert.equal(f.state.items, null); assert.equal(f.state.converted_file, false);
  assert.equal(f.calls.events.filter(([name]) => name === "valid").at(-1)[1], false);
});

test("category SFC preserves generator arity and compiles scoped modern styling", async () => {
  assert.deepEqual(ts.createSourceFile(file.pathname, script.content, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({ source: style.content, filename: file.pathname, id: "category-csv-test", scoped: style.scoped, preprocessLang: style.lang })).errors, []);
  assert.match(descriptor.script.content, /async generateCategoriesJson\(\s*callback,\s*chunk_size = 100,\s*delay = 3000,\s*onError,?\s*\)/);
  assert.ok(!descriptor.script.content.includes("console.log"));
});
