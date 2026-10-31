import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { compile } from "@vue/compiler-dom";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const prefix = "product_panel.workspace.help";
const files = ["./BProductsWorkspaceHelp.vue", "../header/BProductsPanelHeader.vue"].map((name) => {
  const file = new URL(name, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"));
  assert.deepEqual(errors, []);
  const syntax = ts.createSourceFile(file.pathname, descriptor.script.content, ts.ScriptTarget.Latest, true);
  assert.deepEqual(syntax.parseDiagnostics, []);
  const options = syntax.statements.find(ts.isExportAssignment).expression;
  const section = (name) => options.properties.find((property) => property.name?.getText(syntax) === name)?.initializer.getText(syntax);
  const render = new Function("Vue", "require", compile(descriptor.template.content, { mode: "function", prefixIdentifiers: true }).code)({
    ...Vue,
    resolveComponent: (name) => ({ name }),
    // Inspect real slot bindings without mounting an application or replacing native focus behavior.
    renderSlot: (slots, name, props) => slots[name]?.(props) || [],
  }, () => "local-fixture.svg");
  return { file, descriptor, syntax, options, section, render };
});
const [help, header] = files;
const evaluate = (expression, globals = {}) => new Function(...Object.keys(globals), `return (${expression})`)(...Object.values(globals));
const helpProps = evaluate(help.section("props"));
const helpEmits = evaluate(help.section("emits"));
const messages = Object.fromEntries(["en", "fa"].map((language) => {
  const source = readFileSync(new URL(`../../../../../translate/dashboard/${language}.ts`, import.meta.url), "utf8");
  const syntax = ts.createSourceFile(`${language}.ts`, source, ts.ScriptTarget.Latest, true);
  assert.deepEqual(syntax.parseDiagnostics, []);
  const exports = {};
  new Function("exports", ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText)(exports);
  return [language, exports.default];
}));
const translated = (language, key) => {
  if (!key.startsWith(prefix)) return key;
  const value = key.split(".").reduce((object, part) => object?.[part], messages[language]);
  assert.equal(typeof value, "string", `Missing ${language} translation: ${key}`);
  assert.ok(value.trim());
  return value;
};
function nodes(value, result = []) {
  if (Array.isArray(value)) value.forEach((node) => nodes(node, result));
  else if (value && typeof value === "object") {
    result.push(value);
    if (Array.isArray(value.children)) nodes(value.children, result);
    else if (typeof value.children?.default === "function") nodes(value.children.default(), result);
  }
  return result;
}
const name = (node) => typeof node.type === "string" ? node.type : node.type?.name;
const prop = (node, key) => node.props?.[key] ?? node.props?.[key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)];
const text = (node) => nodes(node).map((child) => typeof child.children === "string" ? child.children : "").join(" ");
const hasClass = (node, value) => String(node.props?.class || "").split(/\s+/).includes(value);
function fixture(modelValue = true, language = "en") {
  const emitted = [];
  const state = { modelValue, $: { uid: 42 }, $slots: {}, $vuetify: { locale: { isRtl: language === "fa" } },
    $t: (key) => translated(language, key), $emit: (...args) => emitted.push(args) };
  return { state, emitted, render: () => help.render(state, []) };
}

test("native fullscreen dialog remains controlled and forwards close without changing the prop", () => {
  assert.equal(helpProps.modelValue.type, Boolean);
  assert.equal(helpProps.modelValue.default, false);
  assert.deepEqual(helpEmits, ["update:modelValue"]);
  const f = fixture(), dialog = f.render();
  assert.equal(name(dialog), "v-dialog");
  assert.equal(prop(dialog, "modelValue"), true);
  assert.ok(Object.hasOwn(dialog.props, "fullscreen"));
  assert.ok(!dialog.props.persistent, "Keep native Escape and backdrop dismissal");
  const content = nodes(dialog), heading = content.find((node) => name(node) === "h1");
  assert.equal(dialog.props["aria-labelledby"], heading.props.id);
  const scrollRegion = content.find((node) => node.props?.role === "region");
  assert.equal(Number(scrollRegion.props.tabindex), 0);
  assert.equal(scrollRegion.props["aria-labelledby"], heading.props.id);
  dialog.props["onUpdate:modelValue"](false);
  content.find((node) => name(node) === "v-btn" && node.props["aria-label"] === "global.actions.close").props.onClick();
  assert.deepEqual(f.emitted, [["update:modelValue", false], ["update:modelValue", false]]);
  assert.equal(f.state.modelValue, true, "Only the owning parent changes the controlled state");
  f.state.modelValue = false;
  assert.equal(prop(f.render(), "modelValue"), false);
  f.state.modelValue = true;
  assert.equal(prop(f.render(), "modelValue"), true);
});

test("activator forwards the native event and ref used for keyboard opening and focus return", () => {
  const f = fixture(false), native = { ref: Vue.ref(null), onClick() {}, "aria-haspopup": "dialog", "aria-expanded": "false" };
  let received;
  f.state.$slots.activator = (slot) => { received = slot; return Vue.h("button", slot.props, "Guide"); };
  const activator = f.render().children.activator({ props: native });
  assert.equal(received.props, native);
  const button = nodes(activator).find((node) => name(node) === "button");
  assert.equal(button.props.ref, native.ref);
  assert.equal(button.props.onClick, native.onClick);
  assert.equal(button.props["aria-haspopup"], "dialog");
});

test("modern header alone launches help while native add, preferences and center slot keep their contracts", () => {
  assert.deepEqual(evaluate(header.section("emits")), ["update:showDeletes", "update:showVendors", "update:showNotes", "click:addProduct", "click:addCategory", "update:tableMode"]);
  const toggleGetter = header.options.properties.find((property) => property.name?.getText(header.syntax) === "computed")
    .initializer.properties.find((property) => property.name?.getText(header.syntax) === "toggles");
  const toggles = evaluate(`({${toggleGetter.getText(header.syntax)}}).toggles`);
  for (const modern of [false, true]) for (const tableMode of [false, true]) for (const vendor of [false, true]) {
    const emitted = [], center = Vue.h("span", { "data-center": "queue" });
    const state = { ...evaluate(header.section("data"), { ShopPublicFeedApi: [] })(), modern, tableMode,
      IS_VENDOR_PANEL: vendor, IS_MARKETPLACE: false, CAN_ADD_PRODUCT: true, CAN_ADD_CATEGORY: true,
      service_google_sheet: null, available_api_feeds: [], SUB_TOOLBAR_CONFIG: {}, shop: { id: 1 },
      $slots: { center: () => center }, getShopImagePath: () => "local-fixture.svg", $t: (key) => key,
      $emit: (...args) => emitted.push(args), showAdvancedOptions() {} };
    state.$props = state;
    state.toggles = toggles.call(state);
    const rendered = nodes(header.render(state, []));
    const launcher = rendered.filter((node) => name(node) === "b-products-workspace-help");
    assert.equal(launcher.length, Number(modern));
    assert.ok(rendered.includes(center));
    if (modern) {
      assert.equal(launcher[0].props.modelValue, false);
      launcher[0].props["onUpdate:modelValue"](true);
      assert.equal(state.workspace_help, true);
      const native = { ref: Vue.ref(null), onClick() {}, "aria-haspopup": "dialog" };
      const button = nodes(launcher[0].children.activator({ props: native })).find((node) => name(node) === "v-btn");
      assert.equal(button.props.onClick, native.onClick);
      assert.equal(button.props.ref, native.ref);
      assert.ok(text(button).includes(`${prefix}.open`));
    }
    const add = rendered.filter((node) => ["v-btn", "u-button-circle"].includes(name(node)) && node.props?.onClick &&
      (node.props.key === "it1" || node.props.key === "it2" || /workspace\.add_(product|category)/.test(text(node))));
    assert.equal(add.length, !modern || tableMode ? 2 : 0);
    add.forEach((node) => node.props.onClick());
    assert.deepEqual(emitted, add.length ? [["click:addProduct"], ["click:addCategory"]] : []);
    const preferences = rendered.filter((node) => name(node) === "v-btn-toggle");
    assert.equal(preferences.length, state.toggles.length);
    preferences.forEach((node, index) => {
      node.props["onUpdate:modelValue"](true);
      assert.deepEqual(emitted.at(-1), [`update:${state.toggles[index].emitKey}`, true]);
    });
  }
});

test("prerequisites precede four ordered chapters in one uninterrupted reading container", () => {
  for (const language of ["en", "fa"]) {
    const rendered = nodes(fixture(true, language).render());
    const chapters = rendered.filter((node) => name(node) === "section" && nodes(node).filter((child) => name(child) === "h2").length === 1);
    assert.equal(chapters.length, 4);
    const reading = rendered.find((node) => Array.isArray(node.children) && chapters.every((chapter) => node.children.includes(chapter)));
    assert.ok(reading, "All chapters are direct siblings in a continuous reading surface");
    const titles = ["photos.title", "importing.title", "sorting.title", "quick_title"];
    chapters.forEach((chapter, index) => {
      const heading = nodes(chapter).find((node) => name(node) === "h2");
      assert.ok(text(heading).includes(translated(language, `${prefix}.${titles[index]}`)));
      if (index < 3) {
        const scene = ["photos", "importing", "sorting"][index];
        assert.ok(text(chapter).includes(translated(language, `${prefix}.${scene}.body`)));
        assert.equal(nodes(chapter).filter((node) => name(node) === "figure").length, 1);
      }
    });
    const prerequisite = rendered.find((node) => typeof node.type === "string" && text(node).trim() === translated(language, `${prefix}.permission_note`));
    assert.ok(prerequisite, "The native drag-and-drop prerequisite and permissions guidance remain visible");
    assert.ok(rendered.indexOf(prerequisite) < rendered.indexOf(reading));
    assert.ok(!nodes(reading).includes(prerequisite), "Prerequisites introduce the guide before any lesson");
    const shortcuts = nodes(chapters[3]).filter((node) => name(node) === "li");
    assert.equal(shortcuts.length, 4);
    ["select", "context", "move", "arrange"].forEach((key, index) => assert.ok(text(shortcuts[index]).includes(translated(language, `${prefix}.quick_tips.${key}`))));
  }
});

test("three localized lessons retain inert fictional artwork and accessible static captions", () => {
  for (const language of ["en", "fa"]) {
    const rendered = nodes(fixture(true, language).render());
    assert.equal(rendered.find((node) => hasClass(node, "b-products-help")).props.dir, language === "fa" ? "rtl" : "ltr");
    const figures = rendered.filter((node) => name(node) === "figure");
    assert.equal(figures.length, 3);
    for (const [index, scene] of ["photos", "importing", "sorting"].entries()) {
      const children = nodes(figures[index]);
      const stage = children.find((node) => hasClass(node, "b-products-help__stage"));
      const caption = children.find((node) => name(node) === "figcaption");
      assert.equal(stage.props["aria-hidden"], "true");
      assert.ok(!nodes(stage).includes(caption));
      const label = children.find((node) => text(node) === translated(language, `${prefix}.illustration`));
      assert.ok(label && !nodes(stage).includes(label), "The illustration label stays accessible outside decorative art");
      assert.ok(text(caption).includes(translated(language, `${prefix}.${scene}.caption`)));
      assert.ok(text(rendered).includes(translated(language, `${prefix}.${scene}.title`)));
      for (const node of nodes(stage)) {
        if (typeof node.type === "symbol") continue;
        assert.equal(typeof node.type, "string", "Artwork must not mount business components");
        assert.ok(!["form", "button", "input", "select", "textarea", "a", "iframe", "video", "audio", "img"].includes(name(node)));
        for (const [key, value] of Object.entries(node.props || {})) {
          assert.ok(!/^on[A-Z]/.test(key), "No artwork event can dispatch a business action");
          assert.ok(!["href", "to", "tabindex", "contenteditable", "aria-live"].includes(key.toLowerCase()));
          if (key === "role") assert.notEqual(value, "button");
        }
        if (name(node) === "svg") assert.equal(node.props.focusable, "false");
        if (hasClass(node, "sd-modern-illustration__action")) assert.ok(["span", "div"].includes(name(node)));
      }
      if (language === "fa") assert.match(text(caption), /[\u0600-\u06ff]/);
    }
    assert.equal(rendered.filter((node) => name(node) === "v-btn").length, 1, "Only Close is an operational dialog control");
    assert.equal(rendered.filter((node) => name(node) === "li").length, 4);
    assert.ok(text(rendered).includes(translated(language, `${prefix}.permission_note`)));
  }
  assert.deepEqual(Object.keys(helpProps), ["modelValue"], "No shop or live product data enters illustrative samples");
  for (const dependency of help.syntax.statements.filter(ts.isImportDeclaration)) assert.match(dependency.moduleSpecifier.text, /^(vue|vuetify)(\/|$)/);
  const keys = (object, parent = "") => Object.entries(object).flatMap(([key, value]) => typeof value === "string" ? [`${parent}${key}`] : keys(value, `${parent}${key}.`));
  assert.deepEqual(keys(messages.en.product_panel.workspace.help), keys(messages.fa.product_panel.workspace.help));
  for (const key of keys(messages.en.product_panel.workspace.help)) {
    translated("en", `${prefix}.${key}`);
    translated("fa", `${prefix}.${key}`);
  }
});

test("the price illustration sorts the same three fictional products instead of filtering one out", () => {
  for (const language of ["en", "fa"]) {
    const figure = nodes(fixture(true, language).render()).find((node) => hasClass(node, "b-products-help__figure--sorting"));
    const groups = ["before", "after"].map((step) => nodes(figure).find((node) => Array.isArray(node.children) &&
      node.children.some((child) => text(child).trim() === translated(language, `${prefix}.sorting.${step}`))));
    assert.ok(groups.every(Boolean), "The example keeps labeled before and after states");
    const prices = groups.map((group, index) => {
      assert.ok(text(group).includes(translated(language, `${prefix}.sorting.${index ? "after" : "before"}`)));
      const values = nodes(group).filter((node) => name(node) === "span" && /^\$\d+$/.test(text(node).trim()));
      assert.equal(values.length, 3);
      return values.map((price) => {
        const direction = nodes(group).filter((node) => node.props?.dir && nodes(node).includes(price)).at(-1)?.props.dir;
        assert.equal(direction, "ltr");
        return Number(text(price).trim().slice(1));
      });
    });
    assert.notDeepEqual(prices[0], prices[0].toSorted((a, b) => a - b));
    assert.deepEqual(prices[1], prices[0].toSorted((a, b) => a - b));
  }
});

test("actual SFC scripts, complete templates and scoped Sass compile without a production build", async () => {
  for (const { descriptor, file } of files) {
    const script = compileScript(descriptor, { id: "products-help-test" });
    const output = ts.transpileModule(script.content, { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
    assert.deepEqual(output.diagnostics, []);
    const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "products-help-test", compilerOptions: { bindingMetadata: script.bindings } });
    assert.deepEqual(template.errors, []);
    for (const style of descriptor.styles) {
      const css = await compileStyleAsync({ source: style.content, filename: file.pathname, id: "products-help-test", scoped: style.scoped, preprocessLang: style.lang });
      assert.deepEqual(css.errors, []);
    }
  }
});

test("illustrations finish within four seconds and reduced motion retains the complete static story", async () => {
  const css = await compileStyleAsync({ source: help.descriptor.styles[0].content, filename: help.file.pathname, id: "products-help-motion-test", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(css.errors, []);
  const durations = [], delays = [], endings = [];
  const seconds = (value) => [...value.matchAll(/([\d.]+)(ms|s)\b/g)].map((match) => Number(match[1]) / (match[2] === "ms" ? 1000 : 1));
  css.rawResult.root.walkDecls("animation", (declaration) => {
    if (declaration.value === "none") return;
    assert.doesNotMatch(declaration.value, /\binfinite\b/);
    for (const token of declaration.value.split(/\s+/)) if (/^\d+(\.\d+)?$/.test(token)) assert.equal(Number(token), 1, "The illustration does not repeat");
    const times = seconds(declaration.value);
    assert.ok(times.length > 0, "Owned CSS motion must have a bounded duration");
    durations.push(times[0]);
    delays.push(times[1] || 0);
  });
  css.rawResult.root.walkDecls("animation-delay", (declaration) => delays.push(...seconds(declaration.value)));
  css.rawResult.root.walkDecls("animation-iteration-count", (declaration) => assert.equal(Number(declaration.value), 1));
  assert.ok(durations.length > 0);
  assert.ok(Math.max(...durations) + Math.max(0, ...delays) <= 4);
  css.rawResult.root.walkAtRules("keyframes", (rule) => {
    const final = rule.nodes.find((frame) => frame.selector?.split(",").some((selector) => /^(100%|to)$/.test(selector.trim())));
    assert.ok(final, "Each story must finish on a deliberate complete frame");
    const values = Object.fromEntries(final.nodes.filter((node) => node.type === "decl").map((node) => [node.prop, node.value]));
    if (values.opacity) assert.equal(Number(values.opacity), 1);
    assert.notEqual(values.visibility, "hidden");
    assert.notEqual(values.display, "none");
    endings.push(values);
  });
  assert.ok(endings.length > 0);
  const reduced = [];
  css.rawResult.root.walkAtRules("media", (rule) => {
    if (/prefers-reduced-motion\s*:\s*reduce/.test(rule.params)) rule.walkDecls((declaration) => reduced.push([declaration.prop, declaration.value]));
  });
  assert.ok(reduced.some(([property, value]) => property === "animation" && value === "none"));
  // Stopping CSS motion reveals the base artwork; opacity must not leave any result in an intermediate hidden frame.
  css.rawResult.root.walkDecls("opacity", (declaration) => {
    for (let parent = declaration.parent; parent; parent = parent.parent) if (parent.type === "atrule" && /keyframes$/.test(parent.name)) return;
    assert.ok(Number(declaration.value) > 0, "The static artwork remains visible when animation is disabled");
  });
});
