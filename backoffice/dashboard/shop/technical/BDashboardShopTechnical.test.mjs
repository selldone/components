import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import * as Vue from "vue";
import { compileScript, compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("./BDashboardShopTechnical.vue", import.meta.url);
const parseFile = url => {
  const result = parse(readFileSync(url, "utf8"), { filename: url.pathname });
  assert.deepEqual(result.errors, []);
  return result.descriptor;
};
const descriptor = parseFile(file);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({ source: style.content, filename: file.pathname, id: "technical-test", scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(result.errors, []);
}
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

// Mount the real wrapper/list and real Guided-mode selection; UI and network boundaries stay local.
function fixture({ modern = true, write = true, shop = { id: 21, name: "first", domain: "first.example.test", domains: [], home: "shop" } } = {}) {
  const lists = [], forms = [], dialogs = [], components = new Set();
  const win = { SERACH_THROTTLE: 0, __STATE: null, __RETURN: null };
  const network = new Proxy({}, { get() { throw Error("Technical wrapper tests must never make a request"); } });
  const evaluate = source => {
    const exports = {};
    new Function("require", "exports", "window", "axios", transpile(source))(dependency, exports, win, network);
    return exports;
  };
  const script = url => evaluate(parseFile(url).script.content).default;
  const sfc = url => {
    const source = parseFile(url);
    const compiledScript = compileScript(source, { id: "technical-test" });
    const compiled = compileTemplate({ source: source.template.content, filename: url.pathname, id: "technical-test", compilerOptions: { bindingMetadata: compiledScript.bindings } });
    assert.deepEqual(compiled.errors, []);
    for (const match of compiled.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) components.add(match[1]);
    return { ...evaluate(compiledScript.content).default, render: evaluate(compiled.code).render };
  };
  const leaf = name => ({
    name, inheritAttrs: false,
    setup: (_, { attrs, slots }) => () => Vue.h("div", { "data-leaf": name, ...attrs }, [slots["top-left"]?.(), slots.default?.()]),
  });
  const cache = new Map();
  function dependency(name) {
    if (name === "vue") return Vue;
    if (/\.(svg|png)$/.test(name)) return name;
    if (name.endsWith("/BDomainsList.vue")) {
      const component = sfc(new URL("../../../domain/list/BDomainsList.vue", import.meta.url));
      return { default: { ...component, render(...args) { if (!lists.includes(this)) lists.push(this); return component.render.apply(this, args); } } };
    }
    if (name.endsWith("/BDomainAdd.vue")) {
      const component = script(new URL("../../../domain/add/BDomainAdd.vue", import.meta.url));
      return { default: { ...component, render() { if (!forms.includes(this)) forms.push(this); return Vue.h("div", { "data-guided": String(this.guidedAdd) }); } } };
    }
    if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    if (name === "lodash-es") return { throttle: callback => callback, delay() {}, isObject: value => value !== null && typeof value === "object", isString: value => typeof value === "string" };
    if (name.includes("/ShopLicense")) return { ShopLicense: {}, Eligible: { CanEditDomain: () => true, CanAddNewDomain: () => true } };
    if (name.includes("/ShopBadges")) return { ShopBadges: {} };
    if (name.includes("/ShopPermissions")) return { ShopPermissionRegions: { SETTINGS: { code: "SETTINGS" } } };
    if (name.endsWith("/SetupService")) return { SetupService: { MainServiceUrl: () => "https://platform.example.test", ShopsDomain: () => "shops.example.test" } };
    if (name.endsWith("/GlobalRules")) return { default: {} };
    if (name.endsWith("/NotificationService.ts")) return { default: network };
    if (name === "@selldone/core-js/enums/payment/Currency") return { Currency: {} };
    if (name === "@selldone/core-js/helper") return { CurrencyHelper: {}, PriceHelper: {} };
    if (name === "numeral") return { default: () => assert.fail("No price formatting is needed by the wrapper") };
    const paths = {
      "@selldone/core-js/helper/domain/DomainsHelper": "../../../../../core-js/helper/domain/DomainsHelper.ts",
      "@selldone/core-js/helper/date/DateConverter": "../../../../../core-js/helper/date/DateConverter.ts",
      "../../enums/language/Calendar": "../../../../../core-js/enums/language/Calendar.ts",
      "@selldone/components-vue/mixin/date/DateMixin.ts": "../../../../mixin/date/DateMixin.ts",
      "@selldone/components-vue/mixin/domain/DomainMixin.ts": "../../../../mixin/domain/DomainMixin.ts",
      "@selldone/components-vue/mixin/currency/CurrencyMixin.ts": "../../../../mixin/currency/CurrencyMixin.ts",
      "@selldone/components-vue/mixin/route/RouteMixin.ts": "../../../../mixin/route/RouteMixin.ts",
    };
    if (paths[name]) {
      if (!cache.has(name)) cache.set(name, evaluate(readFileSync(new URL(paths[name], import.meta.url), "utf8")));
      return cache.get(name);
    }
    assert.fail(`Unexpected dependency: ${name}`);
  }
  const node = (tag, text = "") => ({ tag, text, children: [], parent: null, props: {} });
  const remove = child => { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; };
  const renderer = Vue.createRenderer({
    createElement: tag => node(tag), createText: text => node("text", text), createComment: text => node("comment", text),
    setText: (target, text) => { target.text = text; }, setElementText: (target, text) => { target.text = text; target.children = []; },
    parentNode: target => target.parent, nextSibling: target => target.parent?.children[target.parent.children.indexOf(target) + 1] || null,
    patchProp: (target, key, previous, value) => { target.props[key] = value; }, remove,
    insert(child, parent, anchor = null) { remove(child); child.parent = parent; const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, child); },
  });
  const current = Vue.shallowRef(shop);
  const component = sfc(file);
  const app = renderer.createApp({ render: () => Vue.h(component, { modern, shop: current.value, timeSeries: {} }) });
  Object.assign(app.config.globalProperties, { $t: key => key, $n: value => String(value), $route: { name: "BPageShopDashboard", params: { shop_id: 21 } }, $vuetify: { display: { width: 1200 }, locale: { isRtl: false } }, writeShopAccess: () => write });
  app.config.warnHandler = message => { throw Error(message); };
  app.component("VDialog", {
    props: { modelValue: Boolean }, inheritAttrs: false,
    setup: (props, { attrs, slots }) => () => {
      if (!props.modelValue) return null;
      dialogs.push(attrs);
      return Vue.h("div", slots.default?.());
    },
  });
  app.component("VDataTableServer", { inheritAttrs: false, render: () => Vue.h("table") });
  for (const name of components) {
    const pascal = name.replace(/(^|-)([a-z])/g, (_, dash, letter) => letter.toUpperCase());
    if (!app.component(name) && !app.component(pascal)) app.component(name, leaf(name));
  }
  const container = node("root");
  app.mount(container);
  const elements = (target = container) => [target, ...target.children.flatMap(child => elements(child))];
  return {
    app, current, lists, forms, dialogs, elements,
    get list() { return lists.findLast(instance => !instance.$.isUnmounted); },
    async open() { this.list.showAddDomainDialog(); for (let i = 0; i < 4; i++) await Vue.nextTick(); return forms.at(-1); },
  };
}

test("modern Technical reuses the refined list and its fullscreen three-stage Guided add flow", async () => {
  const f = fixture();
  try {
    assert.equal(f.list.modern, true);
    assert.equal(f.list.refined, true);
    assert.equal(f.list.showHeader, true);
    assert.equal(f.list.shop, f.current.value);
    const form = await f.open();
    assert.equal(form.modern, true);
    assert.equal(form.inline, false);
    assert.deepEqual(form.domain, {});
    assert.equal(form.shop, f.current.value);
    assert.equal(form.guidedAdd, true);
    assert.deepEqual(form.guidedSteps, ["address", "dns", "review"]);
    assert.equal(f.dialogs.at(-1).fullscreen, true);
    assert.equal(f.list.itemsPerPage, 10);
  } finally { f.app.unmount(); }
});

test("legacy opt-out retains its widget and original domain dialog mode", async () => {
  const f = fixture({ modern: false });
  try {
    assert.ok(f.elements().some(element => element.props["data-leaf"] === "SWidgetBox"));
    assert.equal(f.list.modern, false);
    assert.equal(f.list.refined, false);
    assert.equal(f.list.showHeader, false);
    const form = await f.open();
    assert.equal(form.guidedAdd, false);
    assert.equal(f.dialogs.at(-1).fullscreen, true);
  } finally { f.app.unmount(); }
});

test("Settings write denial keeps the shared add launcher unavailable", () => {
  const f = fixture({ write: false });
  try {
    assert.equal(f.elements().some(element => String(element.props.class || "").includes("b-domains-list__add")), false);
    assert.equal(f.forms.length, 0);
  } finally { f.app.unmount(); }
});

test("shop changes discard the old domain list, query and open dialog", async () => {
  const f = fixture();
  try {
    const previous = f.list;
    await f.open();
    previous.search = "first-domain";
    f.current.value = { id: 22, name: "second", domain: "second.example.test", domains: [], home: "shop" };
    await Vue.nextTick();
    assert.equal(previous.$.isUnmounted, true);
    assert.notEqual(f.list, previous);
    assert.equal(f.list.shop, f.current.value);
    assert.equal(f.list.search, null);
    assert.equal(f.list.dialog_set_domain, false);
    assert.equal(f.forms[0].$.isUnmounted, true);
  } finally { f.app.unmount(); }
});

test("null shop never mounts a dependent list, including a reset after readiness", async () => {
  const f = fixture({ shop: null });
  try {
    assert.equal(f.lists.length, 0);
    f.current.value = { id: 23, name: "ready", domain: "ready.example.test", domains: [] };
    await Vue.nextTick();
    assert.equal(f.list.shop.id, 23);
    const previous = f.list;
    f.current.value = null;
    await Vue.nextTick();
    assert.equal(previous.$.isUnmounted, true);
    assert.equal(f.list, undefined);
  } finally { f.app.unmount(); }
});
