import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyle, compileTemplate, parse } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import * as Vue from "vue";
import ts from "typescript";
import component, { loadListLoadingState } from "./BListLoadingState.test-helper.mjs";

const file = new URL("./BListLoadingState.vue", import.meta.url);
const source = readFileSync(file, "utf8");
const { descriptor, errors } = parse(source);
assert.deepEqual(errors, []);
const messages = Object.fromEntries(["en", "fa"].map(language => {
  const exports = {};
  const compiled = ts.transpileModule(readFileSync(new URL(`../../../translate/dashboard/${language}.ts`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(compiled, { exports });
  return [language, exports.default];
}));
const kinds = ["product", "category", "order", "customer", "content", "discount", "campaign", "affiliate", "shipping", "location", "domain", "payment", "automation", "team", "app", "log", "records"];
function translate(language, calls = []) {
  return key => {
    calls.push(key);
    const result = key.split(".").reduce((value, part) => value?.[part], messages[language]);
    assert.equal(typeof result, "string", `Missing ${language} text: ${key}`);
    return result;
  };
}
async function render(props = {}, language = "en") {
  const calls = [];
  const app = Vue.createSSRApp(component, props);
  app.config.globalProperties.$t = translate(language, calls);
  app.config.warnHandler = message => { throw new Error(message); };
  return { html: await renderToString(app), calls };
}

test("actual SFC template, TypeScript and scoped Sass compile", () => {
  assert.deepEqual(ts.createSourceFile("loading-state.ts", descriptor.script.content, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "loading-state-test" }).errors, []);
  const style = compileStyle({ source: descriptor.styles[0].content, filename: file.pathname, id: "loading-state-test", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(style.errors, []);
});

test("all subjects render localized pending copy and complete inert Pipeline nodes", async () => {
  for (const language of ["en", "fa"]) for (const kind of kinds) {
    const { html, calls } = await render({ kind }, language);
    assert.match(html, new RegExp(`data-loading-kind="${kind}"`));
    assert.ok(html.includes(messages[language].dashboard_loading_state[kind]));
    assert.ok(html.includes(messages[language].dashboard_loading_state.description));
    assert.deepEqual(calls, [`dashboard_loading_state.${kind}`, "dashboard_loading_state.description"]);
    assert.equal((html.match(/class="b-list-loading-state__row /g) || []).length, 3);
    assert.equal((html.match(/class="b-list-loading-state__packet /g) || []).length, 2);
    assert.match(html, /viewBox="0 0 320 160"/);
    assert.match(html, /role="status" aria-live="polite" aria-atomic="true"/);
    assert.match(html, /class="b-list-loading-state__art sd-modern-illustration" aria-hidden="true"/);
    assert.ok(!/role="progressbar"|<button|<a\b|undefined|dashboard_loading_state\./.test(html));
  }
});

test("default and unrecognized subjects safely use generic records", async () => {
  for (const kind of [undefined, "unknown", "__proto__", "constructor"]) {
    const { html, calls } = await render(kind === undefined ? {} : { kind });
    assert.match(html, /data-loading-kind="records"/);
    assert.deepEqual(calls, ["dashboard_loading_state.records", "dashboard_loading_state.description"]);
  }
});

test("localized owner overrides are escaped and empty strings suppress copy", async () => {
  for (const language of ["en", "fa"]) {
    const title = language === "fa" ? "دریافت <اطلاعات>" : "Loading <records>";
    const { html, calls } = await render({ title, description: "Scoped & pending" }, language);
    assert.ok(html.includes(title.replace("<", "&lt;").replace(">", "&gt;")));
    assert.match(html, /Scoped &amp; pending/);
    assert.deepEqual(calls, []);
  }
  const { html, calls } = await render({ title: "", description: "" });
  assert.ok(!/<h3\b|<p\b/.test(html));
  assert.deepEqual(calls, []);
});

test("compact refresh uses one inline packet and refresh copy without description", async () => {
  for (const language of ["en", "fa"]) {
    const { html, calls } = await render({ kind: "product", compact: true, description: "Do not show" }, language);
    assert.match(html, /b-list-loading-state--compact/);
    assert.match(html, /viewBox="0 0 48 16"/);
    assert.ok(html.includes(messages[language].dashboard_loading_state.refreshing));
    assert.ok(!/<h3\b|<p\b|Do not show|__server|__row/.test(html));
    assert.deepEqual(calls, ["dashboard_loading_state.refreshing"]);
  }
});

function mountedVisibility({ hidden = false, observerAvailable = true, compact = false } = {}) {
  const listeners = new Map();
  const removed = [];
  const document = {
    hidden,
    addEventListener(name, callback) { assert.equal(name, "visibilitychange"); listeners.set(name, callback); },
    removeEventListener(name, callback) { removed.push([name, callback]); if (listeners.get(name) === callback) listeners.delete(name); },
  };
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = []; this.disconnected = false; observers.push(this); }
    observe(target) { this.targets.push(target); }
    disconnect() { this.disconnected = true; this.targets = []; }
  }
  const renderer = Vue.createRenderer({
    patchProp(element, name, previous, next) { element.props[name] = next; },
    insert() {}, remove() {}, createElement: type => ({ type, props: {} }),
    createText: () => ({}), createComment: () => ({}), setText() {}, setElementText() {},
    parentNode: () => null, nextSibling: () => null,
  });
  const app = renderer.createApp(loadListLoadingState({ document, ...(observerAvailable ? { IntersectionObserver: Observer } : {}) }), { compact });
  app.config.globalProperties.$t = translate("en");
  app.config.warnHandler = message => { throw new Error(message); };
  app.config.errorHandler = error => { throw error; };
  const state = app.mount({});
  return { app, state, document, listeners, removed, observers };
}

test("actual mounted component pauses offscreen and hidden, resumes only when both are visible, then cleans up", async () => {
  for (const compact of [false, true]) {
    const f = mountedVisibility({ compact });
    await Vue.nextTick();
    assert.equal(f.observers.length, 1);
    const observer = f.observers[0];
    assert.equal(observer.targets.length, 1);
    assert.equal(f.state.motionVisible, false);
    observer.callback([{ isIntersecting: true }]);
    await Vue.nextTick();
    assert.equal(f.state.motionVisible, true);
    assert.ok(!f.state.$el.props.class.includes("--paused"));
    f.document.hidden = true;
    f.listeners.get("visibilitychange")();
    await Vue.nextTick();
    assert.equal(f.state.motionVisible, false);
    assert.ok(f.state.$el.props.class.includes("--paused"));
    observer.callback([{ isIntersecting: false }]);
    f.document.hidden = false;
    f.listeners.get("visibilitychange")();
    await Vue.nextTick();
    assert.equal(f.state.motionVisible, false);
    observer.callback([{ isIntersecting: true }]);
    await Vue.nextTick();
    assert.equal(f.state.motionVisible, true);
    const callback = f.listeners.get("visibilitychange");
    f.app.unmount();
    assert.equal(observer.disconnected, true);
    assert.equal(f.listeners.size, 0);
    assert.equal(f.removed.length, 1);
    assert.equal(f.removed[0][1], callback);
  }
});

test("initial document hide and browsers without IntersectionObserver retain correct motion gating", async () => {
  const f = mountedVisibility({ hidden: true, observerAvailable: false });
  await Vue.nextTick();
  assert.equal(f.state.motionVisible, false);
  assert.equal(f.observers.length, 0);
  f.document.hidden = false;
  f.listeners.get("visibilitychange")();
  await Vue.nextTick();
  assert.equal(f.state.motionVisible, true);
  f.app.unmount();
  assert.equal(f.listeners.size, 0);
});

test("reduced motion leaves the complete geometry static and pending activity never fabricates progress", () => {
  const style = descriptor.styles[0].content;
  assert.match(style, /prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none;\s*offset-distance:\s*56%;\s*opacity:\s*\.6/);
  assert.match(style, /&--paused &__packet\s*\{\s*animation-play-state:\s*paused/);
  assert.equal((style.match(/animation:\s*list-loading-transit 2.9s linear infinite/g) || []).length, 1);
  assert.ok(!/setTimeout|setInterval|fetch\(|axios|\$router|progressbar|aria-valuenow/.test(source));
  assert.ok(!/\b(?:href|tabindex|contenteditable)\s*=|@(?:click|submit)|https?:|data:/.test(descriptor.template.content));
  assert.ok(!/opacity:\s*0|animation:/.test(style.slice(style.indexOf("&__server"), style.indexOf("&__compact-art"))));
});

test("approved geometry, responsive sizing, inherited fonts, RTL and theme roles remain component scoped", () => {
  const style = descriptor.styles[0].content;
  assert.equal(descriptor.styles[0].scoped, true);
  assert.match(style, /width:\s*320px;\s*max-width:\s*100%;\s*aspect-ratio:\s*2/);
  assert.match(style, /min-height:\s*300px/);
  assert.match(style, /font-size:\s*17px;\s*font-weight:\s*500;\s*line-height:\s*25px/);
  assert.match(style, /font-size:\s*13px;\s*font-weight:\s*400;\s*line-height:\s*22px/);
  assert.match(style, /&--compact\s*\{[^}]*min-height:\s*0;\s*padding:\s*0/);
  assert.match(style, /:dir\(rtl\)[^{]*\{\s*transform:\s*scaleX\(-1\)/);
  assert.match(style, /--v-theme-surface/);
  assert.match(style, /--v-theme-on-surface/);
  assert.match(style, /--sd-modern-illustration-accent-rgb/);
  assert.ok(!/--v-theme-primary|#[0-9a-f]{3}|:global|\.v-theme-|left:|right:/.test(style));
});
