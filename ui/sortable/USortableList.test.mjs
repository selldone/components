import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { JSDOM } from "jsdom";
import ts from "typescript";

test("sortable lists commit guarded order and cross-list moves through SortableJS", async () => {
  const dom = new JSDOM('<div id="app"></div>', { pretendToBeVisual: true });
  const previous = new Map();
  for (const key of ["window", "document", "Element", "HTMLElement", "SVGElement", "Node", "getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"]) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    const value = dom.window[key];
    globalThis[key] = ["getComputedStyle", "requestAnimationFrame", "cancelAnimationFrame"].includes(key)
      ? value.bind(dom.window) : value;
  }
  const Vue = await import("vue");
  const { default: Sortable } = await import("sortablejs");
  const exports = {};
  const source = readFileSync(new URL("./USortableList.ts", import.meta.url), "utf8");
  const output = ts.transpile(source, { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: false });
  vm.runInNewContext(output, {
    exports, window, HTMLElement,
    require: name => name === "sortablejs" ? { default: Sortable } : Vue,
  });

  const rows = [
    Vue.ref([{ id: "one" }, { id: "two" }, { id: "three" }]),
    Vue.ref([{ id: "other" }]),
  ];
  const events = [], errors = [];
  const disabled = Vue.ref(false);
  const app = Vue.createApp({
    render: () => Vue.h("div", rows.map((model, side) => Vue.h(exports.default, {
      id: `list-${side}`,
      itemKey: "id",
      handle: ".reorder-handle",
      filter: ".ignore",
      delay: 180,
      delayOnTouchOnly: true,
      touchStartThreshold: 3,
      group: { name: "nested-children" },
      tag: side === 0 ? "ol" : "transition-group",
      componentData: side === 1 ? { tag: "ul", name: "move" } : undefined,
      move: ({ draggedContext }) => draggedContext.futureIndex > 0,
      disabled: side === 1 && disabled.value,
      modelValue: model.value,
      "onUpdate:modelValue": value => {
        model.value = value;
        events.push([side, "model"]);
      },
      onChange: change => events.push([side, Object.keys(change)[0]]),
      onEnd: () => events.push([side, "end"]),
    }, {
      item: ({ element, index }) => Vue.h("li", { "data-id": element.id, "data-index": index }, [
        Vue.h("button", { class: "reorder-handle", type: "button" }, element.id),
      ]),
      footer: () => Vue.h("li", { class: "ignore", key: "footer" }, "Add"),
    }))),
  });
  app.config.warnHandler = error => errors.push(error);
  app.config.errorHandler = error => errors.push(error);
  const list = side => document.getElementById(`list-${side}`);
  const item = id => document.querySelector(`[data-id="${id}"]`);
  const engine = side => Sortable.get(list(side));
  const ids = side => [...rows[side].value].map(row => row.id);
  const domIds = side => [...list(side).querySelectorAll(":scope > [data-id]")].map(row => row.dataset.id);
  function event(id, target, oldIndex, newIndex) {
    return { item: item(id), from: list(0), to: list(target), oldIndex, newIndex,
      oldDraggableIndex: oldIndex, newDraggableIndex: newIndex };
  }

  try {
    app.mount("#app");
    await Vue.nextTick();
    assert.equal(list(0).tagName, "OL");
    assert.equal(list(1).tagName, "UL");
    assert.equal(list(0).lastElementChild.className, "ignore");
    assert.equal(item("one").querySelector("button").tabIndex, 0);
    assert.equal(engine(0).option("delayOnTouchOnly"), true);
    assert.equal(engine(0).option("touchStartThreshold"), engine(0).nativeDraggable ? 1 : 3);
    assert.equal(engine(0).option("handle"), ".reorder-handle");

    const reorder = event("three", 0, 2, 1);
    engine(0).option("onStart")(reorder);
    const hovering = { to: list(0), related: item("one"), dragged: reorder.item };
    assert.equal(engine(0).option("onMove")({ ...hovering, willInsertAfter: false }), false);
    assert.equal(engine(0).option("onMove")({ ...hovering, willInsertAfter: true }), true);
    list(0).insertBefore(reorder.item, item("two"));
    engine(0).option("onEnd")(reorder);
    assert.deepEqual(domIds(0), ["one", "two", "three"]);
    await Vue.nextTick();
    assert.deepEqual(domIds(0), ["one", "three", "two"]);
    assert.deepEqual(events.splice(0), [[0, "model"], [0, "moved"], [0, "end"]]);

    const transfer = event("three", 1, 1, 1);
    engine(0).option("onStart")(transfer);
    list(1).insertBefore(transfer.item, list(1).lastElementChild);
    engine(0).option("onEnd")(transfer);
    await Vue.nextTick();
    assert.deepEqual(ids(0), ["one", "two"]);
    assert.deepEqual(ids(1), ["other", "three"]);
    assert.deepEqual(domIds(0), ids(0));
    assert.deepEqual(domIds(1), ids(1));
    assert.equal(item("three").dataset.index, "1");
    assert.deepEqual(events.splice(0), [[1, "model"], [0, "model"], [1, "added"], [0, "removed"], [0, "end"]]);

    disabled.value = true;
    await Vue.nextTick();
    assert.equal(engine(1).option("disabled"), true);
    const blocked = event("two", 1, 1, 0);
    engine(0).option("onStart")(blocked);
    list(1).prepend(blocked.item);
    engine(0).option("onEnd")(blocked);
    await Vue.nextTick();
    assert.deepEqual(domIds(0), ["one", "two"]);
    assert.deepEqual(domIds(1), ["other", "three"]);
    assert.deepEqual(events, [[0, "end"]]);

    events.length = 0;
    const stale = event("two", 1, 1, 0);
    engine(0).option("onStart")(stale);
    rows[0].value = [{ id: "replacement" }, { id: "one" }];
    await Vue.nextTick();
    list(1).prepend(stale.item);
    engine(0).option("onEnd")(stale);
    await Vue.nextTick();
    assert.deepEqual(domIds(0), ["replacement", "one"]);
    assert.deepEqual(domIds(1), ["other", "three"]);
    assert.deepEqual(events, [[0, "end"]]);
    assert.deepEqual(errors, []);
  } finally {
    app.unmount();
    dom.window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
