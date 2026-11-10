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
  const el = options.selector ? window.document.querySelector(options.selector) : window.document.body.firstElementChild;
  // JSDOM does not lay out elements; model the browser's display-none geometry boundary.
  el.getClientRects = () => {
    for (let node = el; node; node = node.parentElement) {
      if (window.getComputedStyle(node).display === "none") return [];
    }
    return [{}];
  };
  const calls = [];
  const binding = { modifiers, value: (...args) => calls.push(args) };
  directive.mounted(el, binding);
  t.after(() => { directive.beforeUnmount(el); window.close(); });
  const press = options => {
    const event = new window.KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...options });
    window.dispatchEvent(event);
    return event;
  };
  return { directive, el, calls, press, window };
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

test("hidden, visibility-hidden and disconnected Save buttons do not intercept Ctrl+S", t => {
  for (const hide of [
    f => { f.el.style.display = "none"; },
    f => { f.el.parentElement.style.display = "none"; },
    f => { f.el.style.visibility = "hidden"; },
    f => { f.el.remove(); },
  ]) {
    const f = fixture(t);
    hide(f);
    assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, false);
    assert.deepEqual(f.calls, []);
  }
});

test("disabled and loading Save buttons suppress browser Save without invoking their callback", t => {
  for (const block of [
    el => { el.disabled = true; },
    el => { el.setAttribute("aria-disabled", "true"); },
    el => { el.setAttribute("aria-busy", "true"); },
    el => { el.classList.add("v-btn--loading"); },
    el => { const fieldset = el.ownerDocument.createElement("fieldset"); fieldset.disabled = true; el.replaceWith(fieldset); fieldset.append(el); },
  ]) {
    const f = fixture(t);
    block(f.el);
    assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, true);
    assert.deepEqual(f.calls, []);
  }
});

test("the highest active non-tooltip overlay owns Save independently of DOM order", t => {
  const f = fixture(t, {
    html: '<div class="v-overlay v-dialog v-overlay--active" style="z-index: 2020"><button id="front" class="v-btn">Front Save</button></div><div class="v-overlay v-dialog v-overlay--active" style="z-index: 2010"><button id="underlying" class="v-btn">Underlying Save</button></div><div class="v-overlay v-tooltip v-overlay--active" style="z-index: 9000"></div>',
    selector: "#underlying",
  });
  const front = f.window.document.querySelector("#front");
  front.getClientRects = () => [{}];
  const frontCalls = [];
  f.directive.mounted(front, { modifiers: { s: true }, value: () => frontCalls.push("save") });
  t.after(() => f.directive.beforeUnmount(front));
  assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, true);
  assert.deepEqual(f.calls, []);
  assert.deepEqual(frontCalls, ["save"]);
});

test("an active dialog blocks a page Save button while tooltips alone do not", t => {
  const f = fixture(t);
  const overlay = f.window.document.createElement("div");
  overlay.className = "v-overlay v-overlay--active v-dialog";
  overlay.style.zIndex = "2000";
  f.window.document.body.append(overlay);
  assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, false);
  assert.deepEqual(f.calls, []);
  overlay.classList.replace("v-dialog", "v-tooltip");
  assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, true);
  assert.deepEqual(f.calls, [[]]);
});

test("only one eligible Save directive handles Ctrl+S and already handled events are ignored", t => {
  const f = fixture(t);
  const second = f.window.document.createElement("button");
  second.className = "v-btn";
  second.getClientRects = () => [{}];
  f.window.document.body.append(second);
  const secondCalls = [];
  f.directive.mounted(second, { modifiers: { s: true }, value: () => secondCalls.push("save") });
  t.after(() => f.directive.beforeUnmount(second));
  assert.equal(f.press({ code: "KeyS", ctrlKey: true }).defaultPrevented, true);
  assert.deepEqual(f.calls, [[]]);
  assert.deepEqual(secondCalls, []);
  const handled = new f.window.KeyboardEvent("keydown", { code: "KeyS", ctrlKey: true, cancelable: true });
  handled.preventDefault();
  f.window.dispatchEvent(handled);
  assert.deepEqual(f.calls, [[]]);
  assert.deepEqual(secondCalls, []);
});

test("non-S Vuetify shortcuts retain their existing callback behavior", t => {
  const f = fixture(t, { modifiers: { k: true } });
  f.el.disabled = true;
  f.el.style.display = "none";
  assert.equal(f.press({ code: "KeyK", ctrlKey: true }).defaultPrevented, true);
  assert.deepEqual(f.calls, [[]]);
});
