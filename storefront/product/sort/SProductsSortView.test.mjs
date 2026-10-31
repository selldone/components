import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import { compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import { throttle } from "lodash-es";
import ts from "typescript";

function evaluate(source, require = () => ({})) {
  const exports = {};
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  assert.deepEqual(output.diagnostics, []);
  vm.runInNewContext(output.outputText, { exports, require, window: { SERACH_THROTTLE: 0 } });
  return exports;
}
const file = new URL("./SProductsSortView.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const ModeView = evaluate(readFileSync(new URL("../../../../core-js/enums/shop/ModeView.ts", import.meta.url), "utf8")).ModeView;
const component = evaluate(descriptor.script.content, (name) => name === "lodash-es" ? { throttle } : { ModeView }).default;
const render = new Function("Vue", compile(descriptor.template.content, { mode: "function", prefixIdentifiers: true }).code)({
  ...Vue, resolveComponent: (name) => ({ name }),
  renderSlot: (slots, name) => slots[name]?.() || [],
});
const locales = Object.fromEntries(["en", "fa"].map((locale) => [locale, {
  ...evaluate(readFileSync(new URL(`../../../../translate/dashboard/${locale}.ts`, import.meta.url), "utf8")).default,
  global: evaluate(readFileSync(new URL(`../../../../translate/global/${locale}.ts`, import.meta.url), "utf8")).default,
}]));
function nodes(node, name, result = []) {
  if (Array.isArray(node)) { node.forEach((child) => nodes(child, name, result)); return result; }
  if (!node || typeof node !== "object") return result;
  if (node.type === name || node.type?.name === name) result.push(node);
  if (Array.isArray(node.children)) nodes(node.children, name, result);
  else for (const slot of Object.values(node.children || {})) if (typeof slot === "function") nodes(slot({ props: {} }), name, result);
  return result;
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object" || node.type === Vue.Comment) return "";
  return text(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
function fixture({ locale = "en", modern = false, ...props } = {}) {
  const emitted = [];
  const state = {
    modern, onlyAvailable: false, hasViewMode: false, forceCollapse: false, hasSearch: true, twoLine: false,
    smallSortButtons: false, mandatory: false, loading: false, modelValue: null, activeClass: "dark-flat", viewMode: ModeView.NORMAL,
    search: null, $slots: {}, $vuetify: { display: { lgAndUp: true, mdAndDown: false } }, $route: { query: {} },
    $emit: (...args) => emitted.push(args),
    $t: (key, params = {}) => {
      const value = key.split(".").reduce((item, part) => item?.[part], locales[locale]);
      return typeof value === "string" ? value.replace(/\{(\w+)\}/g, (_, part) => params[part] ?? `{${part}}`) : key;
    },
    ...props,
  };
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  return { state, emitted, tree: render(state, []) };
}
const expectedSorts = ["most_visited", "most_popular", "newest", "bestselling", "cheapest", "most_expensive"];
const tips = ["normal", "product", "quotes", "tax", "new_products"];

test("sorter template/TypeScript and scoped Sass compile with modern opt-in off by default", async () => {
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "sort-view-test" }).errors, []);
  const style = await compileStyleAsync({ source: descriptor.styles[0].content, filename: file.pathname, id: "data-v-sort-view-test", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(style.errors, []);
  assert.equal(component.props.modern.default, false);
});

test("each desktop and collapsed sort option has localized modern help without changing sort values or menu activation", () => {
  for (const locale of ["en", "fa"]) for (const modern of [false, true]) for (const forceCollapse of [false, true]) {
    const f = fixture({ locale, modern, forceCollapse });
    const toggle = nodes(f.tree, "v-btn-toggle").find((node) => String(node.props.class || "").split(/\s+/).includes("hide-on-small-900"));
    if (!forceCollapse) {
      const buttons = nodes(toggle, "v-btn");
      assert.deepEqual(buttons.map((button) => button.props.value), expectedSorts);
      buttons.forEach((button, index) => {
        const tooltip = nodes(button, "v-tooltip");
        assert.equal(tooltip.length, modern ? 1 : 0);
        if (modern) assert.equal(text(tooltip[0]), f.state.$t("products_sort_view.modern.sort_by", { sort: f.state.items[index].name }));
      });
      toggle.props["onUpdate:modelValue"]("newest");
      toggle.props["onUpdate:modelValue"](null);
      assert.deepEqual(f.emitted.splice(0), [["update:modelValue", "newest"], ["update:modelValue", null]]);
    }
    const menu = nodes(f.tree, "v-menu")[0];
    const click = () => {}, keydown = () => {};
    const activator = menu.children.activator({ props: { onClick: click, onKeydown: keydown, "aria-haspopup": "menu" } })[0];
    assert.equal(activator.props.onClick, click);
    assert.equal(activator.props.onKeydown, keydown);
    const entries = nodes(menu.children.default(), "v-list-item");
    assert.equal(entries.length, 6);
    entries.forEach((entry, index) => {
      entry.props.onClick({});
      const tooltip = nodes(entry, "v-tooltip");
      assert.equal(tooltip.length, modern ? 1 : 0);
      if (modern) {
        assert.equal(text(tooltip[0]), f.state.$t("products_sort_view.modern.sort_by", { sort: f.state.items[index].name }));
        assert.equal(tooltip[0].props.location, "top");
        assert.equal(entry.props["aria-label"], text(tooltip[0]));
      }
    });
    assert.deepEqual(f.emitted, expectedSorts.map((code) => ["update:modelValue", code]));
  }
});

test("modern availability choices expose their own mode while legacy keeps the native single-button inversion", () => {
  assert.ok(component.emits.includes("update:only-available"));
  for (const locale of ["en", "fa"]) for (const modern of [false, true]) for (const onlyAvailable of [false, true]) {
    const f = fixture({ locale, modern, onlyAvailable });
    const group = nodes(f.tree, "v-btn-toggle").find((node) => String(node.props.class || "").split(/\s+/).includes("s-products-sort-view__availability-group"));
    assert.equal(!!group, modern);
    if (modern) {
      assert.equal(group.props["model-value"] ?? group.props.modelValue, onlyAvailable);
      assert.notEqual(group.props.mandatory, undefined);
      assert.notEqual(group.props.mandatory, false);
      assert.equal(group.props["selected-class"] ?? group.props.selectedClass, "s-products-sort-view__availability--selected");
      const buttons = nodes(group, "v-btn");
      assert.deepEqual(buttons.map((button) => button.props.value), [false, true]);
      buttons.forEach((button, index) => {
        const value = index === 1;
        assert.equal(button.props["aria-label"], f.state.$t(value ? "sort.only_available" : "global.commons.all"));
        assert.equal(button.props["aria-pressed"], value === onlyAvailable);
        assert.equal(nodes(button, "span").length, 0, "Modern availability choices remain icon-only");
        const icon = nodes(button, "v-icon")[0];
        assert.equal(icon.props.icon ?? text(icon).trim(), value ? "check_circle_outline" : "all_inclusive");
        const tooltip = nodes(button, "v-tooltip");
        assert.equal(tooltip.length, 1);
        assert.equal(text(tooltip[0]), locales[locale].products_sort_view.modern[value ? "show_available" : "show_all"]);
        assert.equal(tooltip[0].props.location, "top");
      });
      group.props["onUpdate:modelValue"](!onlyAvailable);
    } else {
      const button = nodes(f.tree, "v-btn")[0];
      assert.equal(text(nodes(button, "span")[0]).trim(), f.state.$t(onlyAvailable ? "sort.only_available" : "global.commons.all"));
      assert.notEqual(button.props.stacked, undefined);
      assert.notEqual(button.props.stacked, false);
      assert.equal(button.props.height, "46");
      assert.equal(button.props.variant, "text");
      assert.equal(text(nodes(button, "v-icon")[0]).trim(), onlyAvailable ? "check_box" : "all_inclusive");
      assert.equal(nodes(button, "v-tooltip").length, 0);
      assert.equal(button.props["aria-label"], undefined);
      assert.equal(button.props["aria-pressed"], undefined);
      button.props.onClick({});
    }
    assert.deepEqual(f.emitted, [["update:only-available", !onlyAvailable]]);
  }
});

test("modern inline help retains every search syntax while legacy help stays inside the field", () => {
  for (const locale of ["en", "fa"]) for (const modern of [false, true]) {
    const f = fixture({ locale, modern });
    const field = nodes(f.tree, "v-text-field")[0];
    const help = nodes(f.tree, "v-tooltip").find((tooltip) => nodes(tooltip, "li").length === 5);
    assert.ok(help);
    assert.deepEqual(nodes(help, "li").map((item) => item.props.innerHTML), tips.map((key) => locales[locale].products_sort_view.search_tips[key]));
    assert.equal(nodes(field, "v-tooltip").length, modern ? 0 : 1);
    assert.equal(help.props.location, modern ? "top" : "bottom");
    assert.equal(help.props["content-class"], modern ? "sd-modern-tooltip text-start" : "bg-black rounded-xl");
    if (modern) {
      assert.equal(help.props["open-on-click"], true);
      assert.equal(help.props["open-on-focus"], true);
      const button = nodes(f.tree, "v-btn").find((node) => String(node.props.class).includes("sd-modern-info-button"));
      assert.equal(button.props["aria-label"], locales[locale].products_sort_view.search_tips.title);
    }
  }
  assert.equal(nodes(fixture({ modern: true, hasSearch: false }).tree, "v-text-field").length, 0);
});

test("search query initialization, updates, clear and desktop autofocus retain their native contracts", () => {
  for (const modern of [false, true]) {
    const f = fixture({ modern, loading: true });
    f.state.$route.query.search = "P360";
    component.created.call(f.state);
    assert.equal(f.state.search, "P360");
    component.watch["$route.query.search"].call(f.state, 'tax:VAT');
    assert.equal(f.state.search, "tax:VAT");
    const field = nodes(render(f.state, []), "v-text-field")[0];
    assert.equal(field.props.autofocus, true);
    assert.equal(field.props.loading, true);
    assert.ok("clearable" in field.props);
    field.props["onUpdate:modelValue"](null);
    assert.equal(f.state.search, null);
    component.watch.search.cancel();
    component.watch.search.call(f.state, null, "tax:VAT");
    component.watch.search.cancel();
    assert.deepEqual(f.emitted, [["update:search", null]]);
    f.state.$vuetify.display.lgAndUp = false;
    assert.equal(nodes(render(f.state, []), "v-text-field")[0].props.autofocus, false);
  }
});
