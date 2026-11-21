import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

test("smart rows mount, reorder and refresh through the local sortable list", async () => {
  const dom = new JSDOM('<div id="app"></div>', { pretendToBeVisual: true });
  for (const key of ["window", "document", "Element", "HTMLElement", "SVGElement", "Node", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"])
    globalThis[key] = typeof dom.window[key] === "function" && ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key) ? dom.window[key].bind(dom.window) : dom.window[key];
  const require = createRequire(import.meta.url), Vue = require("vue");
  const Sortable = require("sortablejs");
  const sortableModule = {};
  vm.runInNewContext(ts.transpile(readFileSync(new URL("../../sortable/USortableList.ts", import.meta.url), "utf8"), { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: false }), {
    exports: sortableModule, window, HTMLElement,
    require: name => name === "sortablejs" ? { default: Sortable } : Vue,
  });
  const filename = new URL("./USmartDraggable.vue", import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "smart-draggable-test" });
  assert.deepEqual(template.errors, []);
  const output = ts.transpileModule(descriptor.script.content + "\n" + template.code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const exports = {};
  vm.runInNewContext(output.outputText, {
    exports,
    require(name) {
      if (name === "vue") return { ...Vue, defineAsyncComponent: () => sortableModule.default };
      if (name.includes("USmartMenu")) return { default: { render: () => Vue.h("span") } };
      throw new Error(`Unexpected dependency ${name}`);
    },
  });
  const component = { ...exports.default, render: exports.render };
  const rows = Vue.ref(["first", "second", "third"]), failures = [], warnings = [];
  const app = Vue.createApp({ render: () => Vue.h(component, {
    modelValue: rows.value, "onUpdate:modelValue": (value) => { rows.value = value; },
  }) });
  app.config.errorHandler = (error) => failures.push(error);
  app.config.warnHandler = (warning) => warnings.push(warning);
  app.config.globalProperties.isString = (value) => typeof value === "string";
  app.component("v-icon", { render: () => Vue.h("i") });
  app.component("v-list-subheader", { render: () => Vue.h("small") });
  app.component("v-img", { render: () => Vue.h("img") });
  app.mount(document.querySelector("#app"));
  try {
    await Vue.nextTick();
    assert.deepEqual(failures, []);
    const items = () => [...document.querySelectorAll("li")];
    assert.equal(items().length, 3);
    const dragged = items()[2];
    const list = dragged.parentElement;
    const sortable = Sortable.get(list);
    const event = { item: dragged, from: list, to: list, oldIndex: 2, newIndex: 0, oldDraggableIndex: 2, newDraggableIndex: 0 };
    sortable.option("onStart")(event);
    list.insertBefore(dragged, items()[0]);
    sortable.option("onEnd")(event);
    await Vue.nextTick();
    assert.deepEqual([...rows.value], ["third", "first", "second"]);
    rows.value = ["new", "third"];
    await Vue.nextTick();
    assert.deepEqual(items().map((item) => item.textContent.trim()), ["new", "third"]);
    assert.deepEqual(failures, []);
    assert.deepEqual(warnings, []);
  } finally {
    app.unmount();
    dom.window.close();
  }
});
