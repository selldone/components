import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const sources = new Map();
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const packs = Object.fromEntries(["en", "fa"].map((language) => {
  const source = ts.createSourceFile(language, readFileSync(new URL(`../../../translate/dashboard/${language}.ts`, import.meta.url), "utf8"), ts.ScriptTarget.Latest, true);
  assert.deepEqual(source.parseDiagnostics, []);
  const pack = source.statements.find(ts.isExportAssignment).expression;
  const importer = pack.properties.find((property) => property.name?.getText(source) === "importer").initializer;
  const spreadsheet = importer.properties.find((property) => property.name?.getText(source) === "spreadsheet").initializer;
  return [language, new Function(`return (${spreadsheet.getText(source)})`)()];
}));
const copy = (language, key, values = {}) => {
  assert.equal(typeof packs[language][key], "string", `Missing ${language} spreadsheet copy: ${key}`);
  return packs[language][key].replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
};
const categorySource = readFileSync(new URL("../../../core-js/helper/csv/CategoriesCsvFormat.ts", import.meta.url), "utf8");
const categoryContext = vm.createContext({ exports: {} });
vm.runInContext(transpile(categorySource), categoryContext);
const { CategoriesCsvHeaders, CategoriesCsvStyler } = categoryContext.exports;

const element = (type, text = "") => ({ type, text, props: {}, children: [], parent: null });
const remove = (node) => {
  if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
  node.parent = null;
};
const renderer = Vue.createRenderer({
  createElement: element, createText: (text) => element("text", text), createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) {
    remove(node);
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node);
    node.parent = parent;
  },
  remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; }, parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const descendants = (node) => [node, ...node.children.flatMap(descendants)];
const text = (node) => descendants(node).filter((node) => node.type !== "comment").map((node) => node.text).join("");
const hasClass = (node, name) => String(node.props.class || "").split(/\s+/).includes(name);
const kebab = (name) => name.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const stub = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(name, attrs,
  name === "v-dialog" && !attrs.modelValue ? [] : [slots.default?.(), slots["append-inner"]?.(), slots["prepend-inner"]?.()]),
});
const components = new Map();
function loadComponent(relative) {
  if (components.has(relative)) return components.get(relative);
  const file = new URL(relative, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: relative });
  const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: relative,
    compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  sources.set(relative, { descriptor, script, template, file });
  const context = vm.createContext({ exports: {}, require(name) {
    if (name === "vue") return Vue;
    if (name.includes("BSpreadsheetValueInput.vue")) return { default: loadComponent("./value/input/BSpreadsheetValueInput.vue") };
    if (name.includes("BSpreadsheetValueCell.vue")) return { default: loadComponent("./value/cell/BSpreadsheetValueCell.vue") };
    if (name.includes("BSpreadsheetHeaderColumn.vue")) return { default: loadComponent("./header/column/BSpreadsheetHeaderColumn.vue") };
    if (name.includes("ProductVariants.ts")) return { GetVariantIconByCode: () => "category", GetVariantNameByCode: (code) => code };
    if (name.includes("DateMixin")) return { default: { methods: { getFromNowString: (value) => value, getLocalTimeString: (value) => value } } };
    if (name.endsWith(".vue")) return { default: stub(kebab(name.split("/").at(-1).replace(".vue", ""))) };
    throw new Error(`Unexpected spreadsheet dependency: ${name}`);
  } });
  const load = (source) => {
    context.exports = {};
    vm.runInContext(`((exports) => {${transpile(source)}\n})(exports)`, context);
    return context.exports;
  };
  const component = { ...load(script.content).default, render: load(template.code).render };
  components.set(relative, component);
  return component;
}
const Spreadsheet = loadComponent("./BSpreadsheet.vue");
const Input = loadComponent("./value/input/BSpreadsheetValueInput.vue");

async function fixture(t, { modern = true, language = "en", count = 12, headers = [...CategoriesCsvHeaders],
  cols = [...CategoriesCsvHeaders], styler = CategoriesCsvStyler, items } = {}) {
  const calls = { errors: [], warnings: [], translations: [] };
  const props = Vue.reactive({ modern, headers, cols, styler,
    items: items || Array.from({ length: count }, (_, index) => [`category-${index + 1}`, `Title ${index + 1}`, `Description ${index + 1}`, "", ""]),
  });
  let state;
  const component = { ...Spreadsheet, render(...args) { state = this; return Spreadsheet.render.apply(this, args); } };
  const app = renderer.createApp({ render: () => Vue.h(component, props) });
  Object.assign(app.config.globalProperties, {
    $t(key, values = {}) {
      calls.translations.push({ key, values });
      if (!key.startsWith("importer.spreadsheet.")) return key;
      return copy(language, key.replace("importer.spreadsheet.", ""), values);
    },
    $n: (value) => new Intl.NumberFormat(language).format(value),
  });
  const names = new Set([...sources.values()].flatMap(({ template }) => [...template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)].map((match) => match[1])));
  for (const name of names) app.component(name, stub(name));
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  const root = element("root"); app.mount(root); await settle();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  const nodes = (type) => descendants(root).filter((node) => node.type === type);
  const rows = () => nodes("tbody")[0].children.filter((node) => node.type === "tr");
  const cells = (row) => rows()[row].children.filter((node) => node.type === "td");
  const invoke = async (node, event, value) => { for (const handler of [node.props[event]].flat()) handler(value); await settle(); };
  return { props, state, root, calls, nodes, rows, cells, invoke };
}

test("modern preview has localized ranges, row numbers and horizontal-table opt-in; legacy keeps its grid", async (t) => {
  for (const language of ["en", "fa"]) {
    const f = await fixture(t, { language });
    const number = (value) => new Intl.NumberFormat(language).format(value);
    assert.equal(f.rows().length, 10);
    assert.ok(!hasClass(f.nodes("v-table")[0], "bordered-table"));
    assert.ok(hasClass(f.nodes("v-table")[0], "sd-modern-table"));
    const numbers = f.nodes("th").filter((node) => node.props.scope === "row");
    assert.deepEqual(numbers.map(text), Array.from({ length: 10 }, (_, index) => new Intl.NumberFormat(language).format(index + 1)));
    assert.equal(f.nodes("v-text-field").length, 0, "No cell editor until a cell is selected");
    assert.equal(f.nodes("u-smart-toggle").length, 0, "Canonical category columns need no reveal toggle");
    assert.ok(text(f.root).includes(packs[language].preview_title));
    assert.ok(text(f.root).includes(copy(language, "row_range", { from: number(1), to: number(10), total: number(12) })));
    await f.invoke(f.nodes("v-pagination")[0], "onUpdate:modelValue", 2);
    assert.equal(f.rows().length, 2);
    assert.deepEqual(f.nodes("th").filter((node) => node.props.scope === "row").map(text), [11, 12].map((value) => new Intl.NumberFormat(language).format(value)));
    assert.ok(text(f.root).includes(copy(language, "row_range", { from: number(11), to: number(12), total: number(12) })));
  }
  const legacy = await fixture(t, { modern: false });
  assert.ok(hasClass(legacy.nodes("v-table")[0], "bordered-table"));
  assert.equal(legacy.nodes("th").filter((node) => node.props.scope === "row").length, 0);
  assert.equal(legacy.nodes("u-smart-toggle").length, 1);
  assert.equal(legacy.cells(0)[0].props.tabindex, undefined);
});

test("page-two keyboard editing mutates the original row and selection resets without shifting columns", async (t) => {
  const f = await fixture(t);
  await f.invoke(f.nodes("v-pagination")[0], "onUpdate:modelValue", 2);
  const cell = f.cells(0)[1];
  assert.equal(cell.props.tabindex, 0);
  const nested = element("span");
  await f.invoke(cell, "onKeydown", { key: "Enter", target: nested, currentTarget: cell, preventDefault() {} });
  assert.equal(f.state.selected_row, null, "Child controls do not select the containing cell on key events");
  await f.invoke(cell, "onKeydown", { key: "Enter", target: cell, currentTarget: cell, preventDefault() {} });
  assert.ok(hasClass(f.cells(0)[1], "b-spreadsheet__cell--selected"));
  let editor = f.nodes("v-text-field")[0];
  assert.equal(editor.props.modelValue, "Title 11");
  assert.equal(editor.props.label, copy("en", "cell_label", { row: "11", column: "Title" }));
  assert.equal(editor.props.variant, "underlined");
  await f.invoke(editor, "onUpdate:modelValue", "Edited title 11");
  assert.equal(f.props.items[10][1], "Edited title 11"); assert.equal(f.props.items[0][1], "Title 1");
  await f.invoke(f.cells(1)[1], "onKeydown", { key: " ", target: f.cells(1)[1], currentTarget: f.cells(1)[1], preventDefault() {} });
  editor = f.nodes("v-text-field")[0]; assert.equal(editor.props.modelValue, "Title 12", "Selection key remounts the editor with the new value");
  f.state.goFirst(); await settle();
  assert.equal(f.state.page, 1); assert.equal(f.state.selected_row, null); assert.equal(f.state.selected_col, null);
  assert.equal(f.nodes("v-text-field").length, 0);
  await f.invoke(f.cells(0)[1], "onClick"); f.state.showPagedData(); await settle();
  assert.equal(f.state.selected_row, null); assert.equal(f.state.selected_col, null);
  assert.equal(f.props.items[10][1], "Edited title 11");
});

test("Show all columns reveals extra cells without changing page size or the imported dataset", async (t) => {
  const headers = [...CategoriesCsvHeaders, "Extra"];
  const items = Array.from({ length: 12 }, (_, index) => [`c-${index}`, `Title ${index}`, "", "", "", `extra-${index}`]);
  const f = await fixture(t, { headers, items });
  const toggle = f.nodes("u-smart-toggle")[0];
  assert.equal(toggle.props["true-title"], packs.en.show_all_columns);
  assert.ok(hasClass(f.cells(0)[5], "no-display"));
  await f.invoke(toggle, "onUpdate:modelValue", true);
  assert.ok(!hasClass(f.cells(0)[5], "no-display"));
  assert.equal(f.rows().length, 10); assert.equal(f.state.pages_count, 2);
  assert.equal(f.props.items.length, 12); assert.equal(f.props.items[11][5], "extra-11");
  await f.invoke(f.nodes("u-smart-toggle")[0], "onUpdate:modelValue", false);
  assert.ok(hasClass(f.cells(0)[5], "no-display"));
});

test("invalid parent values remain readable and become valid after editing to an existing name or title", async (t) => {
  const f = await fixture(t, { count: 2 });
  f.props.items[1][4] = "missing-parent"; await settle();
  let cell = f.cells(1)[4];
  assert.equal(cell.props["aria-invalid"], "true");
  assert.ok(text(cell).includes("missing-parent"));
  assert.ok(text(cell).includes(packs.en.invalid_value));
  assert.ok(descendants(cell).some((node) => hasClass(node, "b-spreadsheet__invalid")));
  await f.invoke(cell, "onClick");
  await f.invoke(f.nodes("v-text-field")[0], "onUpdate:modelValue", "category-1");
  cell = f.cells(1)[4]; assert.ok(!cell.props["aria-invalid"]);
  assert.ok(!descendants(cell).some((node) => hasClass(node, "b-spreadsheet__invalid")));
  await f.invoke(f.nodes("v-text-field")[0], "onUpdate:modelValue", "Title 1");
  assert.equal(f.state.validate(1, 4, "Title 1"), true);
  assert.equal(f.props.items[1][4], "Title 1");
});

test("typed editor controls preserve their models and native options in modern and legacy modes", async (t) => {
  const definitions = [
    ["Status", { type: "enum", nullable: true, list: [{ code: "ACTIVE" }] }, "ACTIVE", "v-select", "INACTIVE"],
    ["Currency", { type: "currency", list: ["USD", "EUR"] }, "USD", "u-currency-input", "EUR"],
    ["Price", { type: "price", nullable: true }, "12", "u-price-input", "18"],
    ["Image", { type: "image" }, "/local-image.png", "v-text-field", "/updated.png"],
    ["Images", { type: "images" }, "/local-image.png", "v-textarea", "/updated.png,/second.png"],
    ["Date", { type: "date" }, "2026-10-31", "u-date-input", "2026-11-01"],
    ["Json", { type: "json" }, "{}", "v-textarea", '{"name":"value"}'],
    ["Id", { type: "id" }, "1", "u-number-input", "2"],
    ["Title", { type: "text" }, "Title", "v-text-field", "Edited title"],
  ];
  for (const modern of [true, false]) {
    for (const [header, style, value, control, changed] of definitions) {
      const f = await fixture(t, { modern, headers: ["Name", "Currency", header], cols: ["Name", "Currency", header],
        styler: { Name: { type: "text" }, Currency: { type: "currency" }, [header]: style }, items: [["item", "USD", value]],
      });
      await f.invoke(f.cells(0)[2], "onClick");
      const editor = f.nodes(control)[0];
      assert.ok(editor, `Expected ${control} for ${header}`);
      assert.equal(editor.props.modelValue, value);
      assert.equal(editor.props.variant, modern ? "underlined" : "outlined");
      assert.equal(editor.props["hide-details"], modern ? "auto" : undefined);
      if (header === "Status") { assert.equal(editor.props.clearable, true); assert.equal(editor.props["item-value"], "code"); }
      if (header === "Price") assert.equal(editor.props.currency, "USD");
      if (header === "Id") assert.equal(editor.props.min, 1);
      await f.invoke(editor, "onUpdate:modelValue", changed);
      assert.equal(f.props.items[0][2], changed);
    }
  }
});

test("spreadsheet components compile with their native editor and scoped modern styles", async () => {
  assert.ok(Input);
  for (const { descriptor, script, file } of sources.values()) {
    assert.deepEqual(ts.createSourceFile(file.pathname, script.content, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
    for (const style of descriptor.styles) {
      const result = await compileStyleAsync({ source: style.content, filename: file.pathname, id: "spreadsheet-test", scoped: style.scoped, preprocessLang: style.lang });
      assert.deepEqual(result.errors, []);
    }
  }
});
