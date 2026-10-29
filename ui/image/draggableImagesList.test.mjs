import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

test("catalog pages render, reorder and remove the selected row through Vue 3 draggable", async () => {
  const dom = new JSDOM('<div id="app"></div>', { pretendToBeVisual: true });
  const previous = new Map();
  for (const key of ['window', 'document', 'navigator', 'Element', 'HTMLElement', 'SVGElement', 'Node', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, value: typeof dom.window[key] === 'function' && ['getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame'].includes(key) ? dom.window[key].bind(dom.window) : dom.window[key] });
  }
  const require = createRequire(import.meta.url), Vue = require('vue');
  let app;
  try {
    const url = new URL('./draggableImagesList.vue', import.meta.url), filename = fileURLToPath(url);
    const { descriptor, errors } = parse(readFileSync(url, 'utf8'), { filename });
    assert.deepEqual(errors, []);
    const script = compileScript(descriptor, { id: 'catalog-pages-test' });
    const template = compileTemplate({ source: descriptor.template.content, filename, id: 'catalog-pages-test', compilerOptions: { bindingMetadata: script.bindings } });
    assert.deepEqual(template.errors, []);
    const evaluate = (source) => {
      const exports = {};
      const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
      vm.runInNewContext(output, { exports, require(name) { if (name === 'vue') return { ...Vue, defineAsyncComponent: () => require('vuedraggable') }; return require(name); } });
      return exports;
    };
    const component = evaluate(script.content).default;
    component.render = evaluate(template.code).render;
    const warnings = [], images = Vue.ref(['/first.jpg', '/second.jpg', '/third.jpg']);
    app = Vue.createApp({ render: () => Vue.h(component, { modelValue: images.value, hasAdd: false, 'onUpdate:modelValue': (value) => { images.value = value; } }) });
    app.config.warnHandler = (warning) => warnings.push(warning);
    app.component('v-btn', { setup(_, { attrs, slots }) { return () => Vue.h('button', attrs, slots.default?.()); } });
    app.component('v-icon', { setup(_, { slots }) { return () => Vue.h('span', slots.default?.()); } });
    const root = app.mount(dom.window.document.querySelector('#app'));
    await Vue.nextTick();
    const list = () => [...dom.window.document.querySelectorAll('.list-group-item')];
    assert.equal(list().length, 3);
    assert.ok(list()[1].style.backgroundImage.includes('/second.jpg'));

    const draggable = root.$.subTree.component.subTree.component.proxy;
    const dragged = list()[2];
    draggable.onDragStart({ item: dragged });
    dragged.parentElement.insertBefore(dragged, list()[0]);
    draggable.onDragUpdate({ item: dragged, from: dragged.parentElement, oldIndex: 2, newIndex: 0 });
    await Vue.nextTick();
    assert.deepEqual([...images.value], ['/third.jpg', '/first.jpg', '/second.jpg']);
    list()[1].querySelector('button').click();
    await Vue.nextTick();
    assert.deepEqual([...images.value], ['/third.jpg', '/second.jpg']);
    assert.equal(list().length, 2);
    assert.deepEqual(warnings, []);
  } finally {
    app?.unmount();
    for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
    dom.window.close();
  }
});
