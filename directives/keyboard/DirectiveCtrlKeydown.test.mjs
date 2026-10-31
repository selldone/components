import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import ts from "typescript";

const script = ts.transpileModule(readFileSync(new URL("./DirectiveCtrlKeydown.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture(t, options = {}) {
  const modifiers = Object.hasOwn(options, "modifiers") ? options.modifiers : { s: true };
  const html = options.html || '<button class="v-btn" type="button" dir="rtl"><span class="v-btn__prepend">save</span><span class="v-btn__content">Save changes</span><span class="v-btn__append"><i>arrow_forward</i></span></button>';
  const dom = new JSDOM(html);
  const { window } = dom;
  const exports = {};
  vm.runInNewContext(script, { exports, window, document: window.document,
    HTMLElement: window.HTMLElement, HTMLButtonElement: window.HTMLButtonElement });
  const directive = exports.default;
  const el = window.document.body.firstElementChild;
  const calls = [];
  const binding = { modifiers, value: (...args) => calls.push(args) };
  directive.mounted(el, binding);
  t.after(() => { directive.beforeUnmount(el); window.close(); });
  const press = options => {
    const event = new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...options });
    window.dispatchEvent(event);
    return event;
  };
  return { directive, el, calls, press };
}

test("Ctrl+S uses the physical key, passes no event argument and leaves other key combinations alone", t => {
  const f = fixture(t);
  for (const options of [{ code: "KeyS" }, { code: "KeyS", metaKey: true }, { code: "KeyK", ctrlKey: true }, { code: "KeyA", key: "s", ctrlKey: true }]) {
    assert.equal(f.press(options).defaultPrevented, false);
  }
  assert.deepEqual(f.calls, []);
  assert.equal(f.press({ code: "KeyS", key: "s", ctrlKey: true }).defaultPrevented, true);
  assert.equal(f.press({ code: "KeyS", key: "س", ctrlKey: true }).defaultPrevented, true);
  assert.deepEqual(f.calls, [[], []]);
});

test("Vuetify Save hint stays readable and direction-isolated without replacing native button content", t => {
  const f = fixture(t);
  const hint = f.el.querySelector(":scope > .sd-modern-save-shortcut__hint");
  assert.ok(hint);
  assert.equal(hint.classList.contains("x-small"), false);
  assert.equal(hint.getAttribute("aria-hidden"), "true");
  assert.equal(f.el.getAttribute("aria-keyshortcuts"), "Control+s");
  assert.equal(hint.textContent, "Ctrl + S");
  assert.equal(hint.querySelector("bdi")?.getAttribute("dir"), "ltr");
  assert.equal(hint.querySelector("bdi")?.textContent, "Ctrl + S");
  assert.equal(hint.style.position, "");
  assert.equal(f.el.querySelector(":scope > .v-btn__content").textContent, "Save changes");
  assert.equal(f.el.querySelector(":scope > .v-btn__prepend").textContent, "save");
  assert.equal(f.el.querySelector(":scope > .v-btn__append > i").textContent, "arrow_forward");
  assert.equal(f.el.querySelectorAll(".v-btn__append").length, 1);
});

test("the shortcut hint preserves an explicit accessible name and keyboard-shortcut declaration", t => {
  const f = fixture(t, { html: '<button class="v-btn" aria-label="Save this draft" aria-keyshortcuts="Control+s Meta+s"><span class="v-btn__content">Save</span></button>' });
  assert.equal(f.el.getAttribute("aria-label"), "Save this draft");
  assert.equal(f.el.getAttribute("aria-keyshortcuts"), "Control+s Meta+s");
  assert.equal(f.el.querySelector(".sd-modern-save-shortcut__hint").getAttribute("aria-hidden"), "true");
  assert.equal(f.el.querySelector(".v-btn__content").textContent, "Save");
});

test("unmount removes the exact listener and cleanup reference", t => {
  const f = fixture(t);
  assert.equal(typeof f.el._handleKeyPress, "function");
  f.directive.beforeUnmount(f.el);
  assert.equal(Object.hasOwn(f.el, "_handleKeyPress"), false);
  assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, false);
  assert.deepEqual(f.calls, []);
  assert.doesNotThrow(() => f.directive.beforeUnmount(f.el));
});

test("non-S shortcuts and non-Vuetify or non-button hosts retain the legacy hint", t => {
  for (const options of [
    { modifiers: { k: true } },
    { html: '<button type="button">Save</button>' },
    { html: '<div class="v-btn">Save</div>' },
  ]) {
    const f = fixture(t, options);
    assert.equal(f.el.querySelector(".sd-modern-save-shortcut__hint"), null);
    const hint = f.el.querySelector(":scope > .x-small");
    assert.ok(hint);
    assert.equal(hint.textContent, options.modifiers ? "Ctrl + K" : "Ctrl + S");
    assert.equal(hint.style.position, "absolute");
    assert.equal(hint.style.top, "4px");
    assert.equal(hint.style.right, "8px");
    assert.equal(f.el.style.position, "relative");
    assert.equal(f.press({ code: options.modifiers ? "KeyK" : "KeyS", ctrlKey: true }).defaultPrevented, true);
    assert.deepEqual(f.calls, [[]]);
  }
});

test("a directive with no modifier has no visual hint and does not intercept keys", t => {
  const f = fixture(t, { modifiers: undefined, html: '<button class="v-btn">Save</button>' });
  assert.equal(f.el.childElementCount, 0);
  assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, false);
  assert.deepEqual(f.calls, []);
});
