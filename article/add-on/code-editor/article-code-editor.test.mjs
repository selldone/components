import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} from "@vue/compiler-sfc";
import ts from "typescript";

const dom = new JSDOM("<!doctype html><body></body>", {
  pretendToBeVisual: true,
});
for (const name of [
  "window",
  "document",
  "Element",
  "HTMLElement",
  "SVGElement",
  "Node",
  "navigator",
])
  Object.defineProperty(globalThis, name, {
    value: name === "window" ? dom.window : dom.window[name],
    configurable: true,
  });
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
const Vue = await import("vue");
const Prism = (await import("prismjs")).default;
for (const grammar of ["c", "cpp", "markup-templating", "php", "python"])
  await import(`prismjs/components/prism-${grammar}.js`);
const { PrismEditor } = await import("vue-prism-editor");
const $ = (await import("jquery")).default;
function load(source, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      ...globals,
      require(name) {
        assert(name in imports, "Unexpected import: " + name);
        return imports[name];
      },
    },
  );
  return exports;
}
const eventModuleName = "@selldone/components-vue/utils/events/EventBus.ts";
const eventModule = load(
  readFileSync(
    new URL("../../../utils/events/EventBus.ts", import.meta.url),
    "utf8",
  ),
  { vue: Vue },
);
const articleMixin = load(
  readFileSync(
    new URL("../../../mixin/article/ArticleMixin.ts", import.meta.url),
    "utf8",
  ),
  { [eventModuleName]: eventModule },
);
const context = load(
  readFileSync(
    new URL("../toolbar/article-addon-context.ts", import.meta.url),
    "utf8",
  ),
  {},
  { $ },
);
const highlightImports = { prismjs: { default: Prism } };
for (const grammar of ["c", "cpp", "markup-templating", "php", "python"])
  highlightImports[`prismjs/components/prism-${grammar}`] = {};
const highlighting = load(
  readFileSync(new URL("./article-code-highlight.ts", import.meta.url), "utf8"),
  highlightImports,
);
async function component(path, imports) {
  const url = new URL(path, import.meta.url),
    filename = fileURLToPath(url);
  const { descriptor, errors } = parse(readFileSync(url, "utf8"), { filename });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: path });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename,
    id: path,
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.src
        ? readFileSync(new URL(style.src, url), "utf8")
        : style.content,
      filename,
      id: path,
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
  return {
    ...load(script.content, imports, { document: dom.window.document, $ })
      .default,
    render: load(template.code, { vue: Vue }).render,
  };
}
const notification = {
  default: {
    showErrorAlert: () => assert.fail("Unexpected missing language"),
    openDangerAlert() {},
  },
};
const Toolbar = await component("../toolbar/AAddonToolbar.vue", {
  "./article-addon-context": context,
  "@selldone/components-vue/plugins/notification/NotificationService.ts":
    notification,
});
const commonImports = {
  "prismjs/themes/prism.css": {},
  "vue-prism-editor": { PrismEditor },
  "vue-prism-editor/dist/prismeditor.min.css": {},
};
const Viewer = await component("./AAddonCodeEditor.vue", {
  ...commonImports,
  "../toolbar/AAddonToolbar.vue": { default: Toolbar },
  "../../../mixin/article/ArticleMixin.ts": articleMixin,
  "@selldone/components-vue/plugins/notification/NotificationService.ts":
    notification,
  "../toolbar/article-addon-context": context,
  "./article-code-highlight": highlighting,
});
const Dialog = await component("./dialog/AAddonCodeEditorDialog.vue", {
  ...commonImports,
  [eventModuleName]: eventModule,
  "../article-code-highlight": highlighting,
});

function mount(Component, props, target = document.body) {
  const host = document.createElement("div");
  target.append(host);
  const app = Vue.createApp(Component, props);
  app.config.warnHandler = (message) => {
    throw Error(message);
  };
  app.config.errorHandler = (error) => {
    throw error;
  };
  app.config.globalProperties.$t = (key) => key;
  app.component("v-tooltip", { setup: () => () => null });
  app.component("v-icon", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("span", { "aria-hidden": "true" }, slots.default?.()),
  });
  for (const tag of [
    "v-card",
    "v-card-title",
    "v-card-text",
    "v-card-actions",
    "v-list",
    "v-list-item",
    "v-spacer",
  ])
    app.component(tag, {
      setup:
        (_, { slots }) =>
        () =>
          Vue.h("div", slots.default?.()),
    });
  app.component("v-btn", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("button", { type: "button" }, slots.default?.()),
  });
  app.component("v-menu", {
    props: ["modelValue"],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h("div", [
          slots.activator?.({ props: {} }),
          ...(props.modelValue ? slots.default?.() || [] : []),
        ]),
  });
  app.component("v-bottom-sheet", {
    props: ["modelValue"],
    setup:
      (props, { slots }) =>
      () =>
        props.modelValue ? Vue.h("div", slots.default?.()) : null,
  });
  const instance = app.mount(host);
  return {
    app,
    instance,
    host,
    close() {
      app.unmount();
      host.remove();
    },
  };
}
async function settle() {
  await Vue.nextTick();
  await Vue.nextTick();
}
function nativeEditor() {
  let enabled = true,
    inputs = 0;
  const element = document.createElement("div");
  element.className = "medium-editor-element";
  element.contentEditable = "true";
  element.setAttribute("contenteditable", "true");
  document.body.append(element);
  const core = {
    options: {
      get enabled() {
        return enabled;
      },
    },
    triggerInput() {
      inputs++;
    },
    hideAddons() {},
    moveCaret() {},
  };
  $(element).data("plugin_mediumInsert", core);
  return {
    element,
    core,
    disable() {
      enabled = false;
    },
    get inputs() {
      return inputs;
    },
  };
}

test("selected languages use their real Prism grammar, and unknown sources stay escaped", () => {
  for (const [language, grammar, source] of [
    ["html", "markup", '<script>alert("safe")</script>'],
    ["js", "js", "const count = 3;"],
    ["css", "css", "body { color: red; }"],
    ["c", "c", "int main(void) { return 0; }"],
    ["C++", "cpp", "std::vector<int> values;"],
    ["php", "php", '<?php echo "safe";'],
    ["python", "python", 'def run():\n  return "safe"'],
  ])
    assert.equal(
      highlighting.highlightArticleCode(source, language),
      Prism.highlight(source, Prism.languages[grammar], grammar),
    );
  for (const language of ["unknown", "__proto__", "constructor"])
    assert.equal(
      highlighting.highlightArticleCode(
        '<img src=x onerror="alert(1)"> &',
        language,
      ),
      '&lt;img src=x onerror="alert(1)"> &amp;',
    );
});

test("readonly language/theme controls preserve authored schema and source, without opening edit", async () => {
  const codes = {
    html: '<svg onload="alert(1)"></svg>',
    "C++": "std::vector<int> x;",
    custom: "<unknown>",
  };
  const original = JSON.stringify(codes),
    view = mount(Viewer, { codes });
  try {
    await settle();
    assert.equal(
      view.host.querySelectorAll(".a-article-addon-tools").length,
      0,
    );
    assert.equal(view.host.querySelectorAll("svg,img,script").length, 0);
    assert.equal(view.host.querySelector("textarea").readOnly, true);
    assert.equal(
      view.host.querySelector("textarea").getAttribute("aria-label"),
      "global.article.code_editor.code_label",
    );
    view.host.querySelectorAll(".a-article-code__language")[1].click();
    await settle();
    assert.equal(view.instance.selected_lang, "C++");
    assert.equal(view.host.querySelector("pre").textContent, codes["C++"]);
    view.host.querySelector(".a-article-code__theme").click();
    await settle();
    assert(view.host.querySelector(".code-editor").classList.contains("-dark"));
    assert.equal(
      view.host.querySelector(".code-editor").getAttribute("data"),
      original,
    );
    assert.equal(JSON.stringify(codes), original);
  } finally {
    view.close();
  }
});

test("real native edit lifecycle cancels drafts, applies only the selected language, and preserves serialization", async () => {
  const owner = nativeEditor(),
    codes = { html: "<p>Original</p>", "C++": "int a = 1;" };
  const dialog = mount(Dialog, { masterId: "article-test" });
  const view = mount(
    Viewer,
    { codes, editable: true, masterId: "article-test" },
    owner.element,
  );
  try {
    await settle();
    assert.equal(
      view.host.querySelectorAll(".a-article-addon-tools").length,
      1,
    );
    const edit = () =>
      view.host.querySelector(".a-article-addon-tools__button").click();
    edit();
    await settle();
    assert.equal(dialog.host.querySelector("textarea").readOnly, false);
    assert.equal(
      dialog.host.querySelector("textarea").getAttribute("aria-label"),
      "global.article.code_editor.code_label",
    );
    const input = dialog.host.querySelector("textarea");
    input.value = "draft";
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
    dialog.host.querySelector(".a-article-code-dialog__close").click();
    await settle();
    assert.equal(codes.html, "<p>Original</p>");
    assert.equal(owner.inputs, 0);
    edit();
    await settle();
    assert.equal(dialog.host.querySelector("textarea").value, codes.html);
    const source =
      "<script>window.shouldNeverRun = true</script>\n  <p>Updated & safe</p>";
    const next = dialog.host.querySelector("textarea");
    next.value = source;
    next.dispatchEvent(new window.Event("input", { bubbles: true }));
    dialog.host
      .querySelector(".a-article-code-dialog__actions button:last-child")
      .click();
    await settle();
    assert.equal(codes.html, source);
    assert.equal(codes["C++"], "int a = 1;");
    assert.equal(owner.inputs, 1);
    assert.deepEqual(
      JSON.parse(view.host.querySelector(".code-editor").getAttribute("data")),
      codes,
    );
    assert.equal(window.shouldNeverRun, undefined);
    assert.equal(dialog.instance.show_dialog, false);
  } finally {
    view.close();
    dialog.close();
    owner.element.remove();
  }
});

test("delayed code apply and delete reject disabled, hidden and detached native owners", async () => {
  for (const loss of ["disabled", "hidden", "detached"]) {
    const owner = nativeEditor(),
      codes = { html: "original" };
    const dialog = mount(Dialog, { masterId: "article-test" });
    const view = mount(
      Viewer,
      { codes, editable: true, masterId: "article-test" },
      owner.element,
    );
    try {
      await settle();
      view.instance.showEdit();
      await settle();
      const { callback, deleteCallback } = dialog.instance;
      if (loss === "disabled") owner.disable();
      else if (loss === "hidden") owner.element.hidden = true;
      else owner.element.remove();
      callback("stale edit");
      deleteCallback();
      await settle();
      assert.equal(codes.html, "original");
      assert.equal(owner.inputs, 0);
      assert.equal(view.host.querySelectorAll(".code-editor").length, 1);
    } finally {
      view.close();
      dialog.close();
      owner.element.remove();
    }
  }
});

test("dialog master scope, native dismissal and listener teardown prevent stale draft writes", async () => {
  let saved = 0,
    deleted = 0;
  const dialog = mount(Dialog, { masterId: "target" });
  const open = (masterId) =>
    eventModule.EventBus.$emit(eventModule.EventName.ARTICLE_CODE_EDITOR_SHOW, {
      masterId,
      code: "original",
      language: "python",
      callback() {
        saved++;
      },
      deleteCallback() {
        deleted++;
      },
    });
  try {
    open("other");
    await settle();
    assert.equal(dialog.instance.show_dialog, false);
    open("target");
    await settle();
    assert.equal(dialog.instance.show_dialog, true);
    dialog.instance.show_dialog = false;
    await settle();
    dialog.instance.setValue();
    dialog.instance.deleteValue();
    assert.equal(saved, 0);
    assert.equal(deleted, 0);
    assert.equal(dialog.instance.callback, null);
  } finally {
    dialog.close();
  }
  open("target");
  await settle();
  assert.equal(saved, 0);
});
