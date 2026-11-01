import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compile } from "@vue/compiler-dom";
import { compileStyle, compileTemplate, parse } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BListEmptyState.vue", import.meta.url);
const source = readFileSync(file, "utf8");
const { descriptor, errors } = parse(source);
assert.deepEqual(errors, []);
const transpile = value => ts.transpileModule(value, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const exports = {};
vm.runInNewContext(transpile(descriptor.script.content), {
  exports,
  require(name) { assert.equal(name, "vue"); return Vue; },
});
const component = exports.default;
component.render = new Function("Vue", compile(descriptor.template.content, {
  mode: "function", prefixIdentifiers: true,
}).code)(Vue);
const messages = Object.fromEntries(["en", "fa"].map(language => {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(`../../../translate/dashboard/${language}.ts`, import.meta.url), "utf8")), { exports });
  return [language, exports.default];
}));
const kinds = ["product", "category", "order", "customer", "content", "discount", "campaign", "affiliate", "shipping", "location", "domain", "payment", "automation", "team", "app", "log", "records"];
const families = {
  product: "catalog", category: "catalog", order: "parcel", customer: "people",
  content: "document", discount: "ticket", campaign: "mail", affiliate: "people",
  shipping: "delivery", location: "map", domain: "connection", payment: "finance", automation: "connection",
  team: "people", app: "connection", log: "document", records: "document",
};
const text = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
async function render(props = {}, language = "en", slot) {
  const calls = [];
  const app = Vue.createSSRApp({ render: () => Vue.h(component, props, slot ? { default: slot } : undefined) });
  app.config.globalProperties.$t = key => {
    calls.push(key);
    const value = key.split(".").reduce((object, part) => object?.[part], messages[language]);
    assert.equal(typeof value, "string", `Missing ${language} text: ${key}`);
    return value;
  };
  app.config.warnHandler = message => { throw new Error(message); };
  return { html: await renderToString(app), calls };
}

test("real script/template and component-scoped Sass compile without missing helpers", () => {
  assert.deepEqual(ts.createSourceFile("empty-state.ts", descriptor.script.content, ts.ScriptTarget.Latest, true).parseDiagnostics, []);
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "empty-state-test" }).errors, []);
  const style = compileStyle({ source: descriptor.styles[0].content, filename: file.pathname, id: "empty-state-test", scoped: true, preprocessLang: "scss" });
  assert.deepEqual(style.errors, []);
});

test("every subject renders its own real English/Persian guidance and relevant local SVG", async () => {
  for (const language of ["en", "fa"]) for (const kind of kinds) {
    const { html, calls } = await render({ kind }, language);
    assert.match(html, new RegExp(`data-empty-kind="${kind}"`));
    assert.match(html, new RegExp(`data-empty-art="${families[kind]}"`));
    assert.match(html, new RegExp(text(messages[language].dashboard_empty_state[kind].title)));
    assert.match(html, new RegExp(text(messages[language].dashboard_empty_state[kind].description)));
    assert.deepEqual(calls, [`dashboard_empty_state.${kind}.title`, `dashboard_empty_state.${kind}.description`]);
    assert.equal((html.match(/<svg\b/g) || []).length, 1);
    assert.match(html, /aria-hidden="true" focusable="false"/);
    assert.ok(!html.includes("undefined") && !html.includes("dashboard_empty_state."));
  }
});

test("the default and unknown subject fall back to records without reading inherited object keys", async () => {
  for (const kind of [undefined, "unknown", "__proto__", "constructor"]) {
    const { html, calls } = await render(kind === undefined ? {} : { kind });
    assert.match(html, /data-empty-kind="records"/);
    assert.match(html, /data-empty-art="document"/);
    assert.deepEqual(calls, ["dashboard_empty_state.records.title", "dashboard_empty_state.records.description"]);
  }
});

test("caller copy is escaped, can be suppressed, and never replaced with unrelated creation guidance", async () => {
  const { html, calls } = await render({ kind: "order", title: "No matches <script>", description: "Try another filter & period." });
  assert.match(html, /No matches &lt;script&gt;/);
  assert.match(html, /Try another filter &amp; period\./);
  assert.deepEqual(calls, []);
  assert.ok(!html.includes("<script>"));
  const hidden = await render({ title: "", description: "" });
  assert.ok(!/<h3(?:\s|>)/.test(hidden.html) && !/<p(?:\s|>)/.test(hidden.html));
  assert.deepEqual(hidden.calls, []);
});

test("the empty state invents no actions; a caller-owned native slot is retained unchanged", async () => {
  const empty = await render();
  assert.ok(!empty.html.includes("<button") && !empty.html.includes("<a "));
  assert.ok(!empty.html.includes("b-list-empty-state__actions"));
  let invoked = 0;
  const action = Vue.h("button", { type: "button", disabled: true, "data-native-action": "add", onClick: () => invoked++ }, "Add item");
  const slotted = await render({}, "en", () => action);
  assert.match(slotted.html, /b-list-empty-state__actions/);
  assert.match(slotted.html, /<button type="button" disabled data-native-action="add">Add item<\/button>/);
  assert.equal(invoked, 0);
  action.props.onClick();
  assert.equal(invoked, 1, "The component does not intercept or forward the existing action through another handler");
});

test("artwork is inert and contains no remote media, credentials, navigation or business side effects", () => {
  const artwork = descriptor.template.content.slice(descriptor.template.content.indexOf("<svg"), descriptor.template.content.indexOf("</svg>") + 6);
  assert.ok(!/<(?:button|input|select|textarea|form|a|image|foreignObject)\b/i.test(artwork));
  assert.ok(!/\b(?:href|tabindex|contenteditable)\s*=|@(?:click|submit)|\bon\w+=|https?:|data:/i.test(artwork));
  assert.ok(!/fetch\(|axios|setTimeout|setInterval|\$router|onMounted|created\(|mounted\(/.test(descriptor.script.content));
  assert.ok(!/mixins\s*:/.test(descriptor.script.content));
});

test("motion is finite and under three seconds, with a complete static reduced-motion finish", () => {
  const style = descriptor.styles[0].content;
  const durations = [...style.matchAll(/animation:\s*empty-state-[\w-]+\s+([\d.]+)s/g)].map(match => Number(match[1]));
  assert.equal(durations.length, 2);
  assert.ok(durations.every(duration => duration > 0 && duration <= 3));
  assert.ok(!/infinite|animation-delay|animation-iteration-count|\btransition\s*:/.test(style));
  assert.match(style, /prefers-reduced-motion:\s*reduce[\s\S]*animation:\s*none/);
  assert.equal((style.match(/100%\s*\{\s*opacity:\s*1;\s*transform:\s*translateY\(0\)/g) || []).length, 2);
  assert.ok(!/opacity:\s*0/.test(style.slice(0, style.indexOf("@keyframes"))));
});

test("shared sizing, independent art colors and wrapping stay scoped and theme-aware", () => {
  const style = descriptor.styles[0].content;
  assert.equal(descriptor.styles[0].scoped, true);
  assert.match(descriptor.template.content, /class="b-list-empty-state text-start"/);
  assert.match(style, /width:\s*180px;\s*max-width:\s*100%/);
  assert.match(style, /font-size:\s*18px;\s*font-weight:\s*500;\s*line-height:\s*26px/);
  assert.match(style, /font-size:\s*14px;\s*font-weight:\s*400;\s*line-height:\s*23px/);
  assert.match(style, /flex-wrap:\s*wrap/);
  assert.match(style, /--sd-modern-illustration-accent-rgb/);
  assert.match(style, /--v-theme-surface/);
  assert.match(style, /--v-theme-on-surface/);
  assert.ok(!/--v-theme-primary|:global|(?:^|\n)\s*body\s*\{|\.v-theme-|left:|right:/.test(style));
});
