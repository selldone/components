import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { baseParse, compile } from "@vue/compiler-dom";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";

register(`data:text/javascript,${encodeURIComponent("export async function load(url, context, next) { if (url.endsWith('.css')) return { format: 'module', source: '', shortCircuit: true }; return next(url, context); }")}`, import.meta.url);
const { VDataTableServer } = await import("vuetify/components/VDataTable");
const { VIcon } = await import("vuetify/components/VIcon");
const { VDataIterator } = await import("vuetify/components/VDataIterator");
const { createVuetify } = await import("vuetify");
const root = new URL("../../../../", import.meta.url);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function component(path) {
  const { descriptor, errors } = parse(readFileSync(new URL(path, import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({ source: descriptor.template.content, filename: path, id: "pending-table", compilerOptions: { hoistStatic: false } });
  assert.deepEqual(template.errors, []);
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content + "\n" + template.code), {
    exports, require(name) { if (name === "vue") return Vue; throw new Error(`Unexpected dependency: ${name}`); },
  });
  return { ...exports.default, render: exports.render };
}
const BListLoadingState = component("./BListLoadingState.vue");
const BListEmptyState = component("../empty-state/BListEmptyState.vue");
const messages = Object.fromEntries(["en", "fa"].map(locale => {
  const exports = {};
  vm.runInNewContext(transpile(readFileSync(new URL(`@selldone/translate/dashboard/${locale}.ts`, root), "utf8")), { exports });
  return [locale, exports.default];
}));

// Keep the real owner's slot registration: registering an unconditional slot hides refresh rows.
const owner = parse(readFileSync(new URL("src/Applications/Backoffice/pages/shop/incentives/coupon/BPageShopIncentivesCoupon.vue", root), "utf8")).descriptor;
const walk = node => [node, ...(node.children || []).flatMap(walk)];
const table = walk(baseParse(owner.template.content)).find(node => node.tag === "v-data-table-server");
const binding = name => table.props.find(prop => prop.type === 7 && prop.name === "bind" && prop.arg?.content === name)?.loc.source;
assert.ok(binding("items") && binding("loading"), "Owner must pass actual rows and busy state");
const slot = name => table.children.find(node => node.tag === "template" && node.props.some(prop => prop.type === 7 && prop.name === "slot" && prop.arg?.content === name))?.loc.source;
assert.ok(slot("loading") && slot("no-data"));
const render = new Function("Vue", compile(`<v-data-table-server ${binding("items")} ${binding("loading")} :headers="headers" :items-length="coupons.length" :mobile="mobile" hide-default-footer>${slot("loading")}${slot("no-data")}</v-data-table-server>`, { mode: "function", prefixIdentifiers: true }).code)(Vue);

async function view({ coupons = [], busy_fetch = false, emptyStateLoaded = false, mobile = false, locale = "en" } = {}) {
  const failures = [];
  const app = Vue.createSSRApp({
    components: { VDataTableServer, VIcon, BListLoadingState, BListEmptyState },
    data: () => ({ coupons, busy_fetch, emptyStateLoaded, mobile, search: "", totalItems: coupons.length, headers: [{ title: "Name", key: "title" }] }),
    render,
  });
  app.use(createVuetify());
  app.config.globalProperties.$t = key => {
    const message = key.split(".").reduce((value, part) => value?.[part], messages[locale]);
    if (key.startsWith("dashboard_")) assert.equal(typeof message, "string", `Missing ${locale}: ${key}`);
    return message ?? key;
  };
  app.config.warnHandler = message => failures.push(message);
  app.config.errorHandler = error => { throw error; };
  const html = await renderToString(app);
  assert.deepEqual(failures, []);
  return html;
}

for (const locale of ["en", "fa"]) for (const mobile of [false, true]) {
  test(`real native table keeps pending, refresh, empty and failure distinct (${locale}, mobile=${mobile})`, async () => {
    const pending = await view({ busy_fetch: true, locale, mobile });
    assert.match(pending, /b-list-loading-state/);
    assert.doesNotMatch(pending, /b-list-empty-state/);

    const rows = Object.freeze([Object.freeze({ id: 7, title: "Existing record" })]);
    const refreshing = await view({ coupons: rows, busy_fetch: true, emptyStateLoaded: true, locale, mobile });
    assert.match(refreshing, /Existing record/);
    assert.doesNotMatch(refreshing, /b-list-loading-state|v-data-table-rows-loading/);
    assert.equal(rows[0].title, "Existing record");

    const empty = await view({ emptyStateLoaded: true, locale, mobile });
    assert.match(empty, /b-list-empty-state/);
    assert.doesNotMatch(empty, /b-list-loading-state/);

    const unavailable = await view({ emptyStateLoaded: false, locale, mobile });
    assert.doesNotMatch(unavailable, /b-list-loading-state|b-list-empty-state/);
  });
}

test("the real app iterator uses its native loader slot and keeps cards during refresh", async () => {
  const appOwner = parse(readFileSync(new URL("../app/shop/store/BAppShopStore.vue", import.meta.url), "utf8")).descriptor;
  const iterator = walk(baseParse(appOwner.template.content)).find(node => node.tag === "v-data-iterator");
  const busy = iterator.props.find(prop => prop.type === 7 && prop.name === "bind" && prop.arg?.content === "loading");
  const loader = iterator.children.find(node => node.tag === "template" && node.props.some(prop => prop.name === "slot" && prop.arg?.content === "loader"));
  assert.ok(busy && loader, "Use VDataIterator's loader slot, not a table's loading slot");
  const iteratorRender = new Function("Vue", compile(`<v-data-iterator :items="apps" ${busy.loc.source}>${loader.loc.source}<template #default="{ items }"><span v-for="item in items" :key="item.raw.id">{{ item.raw.title }}</span></template></v-data-iterator>`, { mode: "function", prefixIdentifiers: true }).code)(Vue);
  for (const apps of [[], Object.freeze([Object.freeze({ id: 8, title: "Existing app" })])]) {
    const failures = [];
    const app = Vue.createSSRApp({
      components: { VDataIterator, BListLoadingState },
      data: () => ({ apps, busy: true }), render: iteratorRender,
    });
    app.use(createVuetify());
    app.config.globalProperties.$t = key => key.split(".").reduce((value, part) => value?.[part], messages.en) ?? key;
    app.config.warnHandler = message => failures.push(message);
    app.config.errorHandler = error => { throw error; };
    const html = await renderToString(app);
    assert.deepEqual(failures, []);
    if (apps.length) {
      assert.match(html, /Existing app/);
      assert.doesNotMatch(html, /b-list-loading-state/);
    } else assert.match(html, /b-list-loading-state/);
  }
});
