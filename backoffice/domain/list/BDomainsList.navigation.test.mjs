import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(new URL("../../../../../package.json", import.meta.url));
const { parse, compileScript, compileTemplate } = require("@vue/compiler-sfc");
const ts = require("typescript");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { JSDOM } = require("jsdom");
const file = new URL("./BDomainsList.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "domains-navigation-test" });
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const template = compileTemplate({
  source: descriptor.template.content, filename: file.pathname, id: "domains-navigation-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);

const entries = {
  custom: { official: false, url: "https://store.example.test", enable: true, indexed: true, ssl: true, domain: { id: 24, domain: "store.example.test", home: "blog", currencies: [], languages: [] } },
  local: { official: "local", url: "http://localhost:9000/@fixture", enable: true, ssl: true },
  sub: { official: "sub", url: "https://fixture.example.test", enable: true, ssl: true },
};

function leaf(name) {
  return {
    name, inheritAttrs: false,
    setup(_, { slots }) {
      return () => Vue.h("div", { "data-leaf": name }, [slots.activator?.({ props: {} }), slots.default?.()]);
    },
  };
}

function fixture(items = Object.values(entries)) {
  const pushes = [], order = [], win = { SERACH_THROTTLE: 0, __STATE: null, __RETURN: null };
  const routeExports = {};
  new Function("require", "exports", "window", transpile(readFileSync(new URL("../../../mixin/route/RouteMixin.ts", import.meta.url), "utf8")))(
    name => name === "vue" ? Vue : { delay() {} }, routeExports, win,
  );
  const RouteMixin = routeExports.RouteMixin;
  const dependency = name => {
    if (name === "vue") return Vue;
    if (name === "lodash-es") return { throttle: callback => callback };
    if (name.endsWith("/RouteMixin.ts")) return { RouteMixin };
    if (name.includes("/DomainsHelper")) return { DomainsHelper: { GetShopDomains: () => items } };
    if (name.includes("/ShopLicense")) return { Eligible: { CanEditDomain: () => true } };
    if (name.includes("/ShopPermissions")) return { ShopPermissionRegions: { SETTINGS: { code: "SETTINGS" } } };
    if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    return { default: {} };
  };
  const exports = {};
  const network = new Proxy({}, { get() { throw Error("Navigation tests must never make a request"); } });
  new Function("require", "exports", "window", "axios", transpile(script.content))(dependency, exports, win, network);
  const component = exports.default;
  const data = { ...RouteMixin.data(), ...component.data(), page: 3, search: "fixture search", options: { page: 3, sortBy: [{ key: "domain", order: "asc" }] } };
  const globals = {
    shop: { id: 71, home: "shop", domain: "https://store.example.test", domains: [] },
    modern: true, refined: true, showHeader: false,
    $route: { name: "BPageShopSettingDomain", params: { shop_id: "999" } },
    $router: { push: route => { order.push("push"); pushes.push(route); return route; } },
    $t: key => key, $n: value => String(value), $nextTick: callback => callback?.(),
    $refs: {}, $emit() {},
    $vuetify: { display: { width: 1200 }, locale: { isRtl: false } },
    writeShopAccess: () => true, GetDomainHomeName: value => `home:${value}`,
    GetCurrency: () => ({ flag: "gb" }), getLanguageName: value => value,
  };
  const state = { ...globals, $data: data };
  for (const key of Object.keys(data)) Object.defineProperty(state, key, { get: () => data[key], set: value => { data[key] = value; }, configurable: true });
  for (const [key, method] of Object.entries({ ...RouteMixin.methods, ...component.methods })) state[key] = method.bind(state);
  for (const [key, computed] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => computed.call(state), configurable: true });
  const cache = state.cacheRouteState;
  state.cacheRouteState = key => { order.push("cache"); return cache(key); };
  return { component, RouteMixin, state, globals, data, dependency, win, pushes, order, items };
}

async function renderRefined() {
  const f = fixture([entries.custom]), buttons = [], links = [], toggles = [];
  const compiled = {};
  new Function("require", "exports", transpile(template.code))(name => name === "vue" ? Vue : f.dependency(name), compiled);
  const component = { ...f.component, render: compiled.render };
  const tag = name => ({
    inheritAttrs: false,
    setup(_, { attrs, slots }) { return () => Vue.h(name, attrs, [slots.activator?.({ props: {} }), slots.default?.()]); },
  });
  const app = Vue.createSSRApp(component, { shop: f.state.shop, modern: true, refined: true });
  Object.assign(app.config.globalProperties, f.globals);
  app.component("VDataTableServer", {
    props: ["items", "headers"],
    setup(props, { attrs, slots }) {
      return () => Vue.h("table", { class: attrs.class }, [Vue.h("tbody", props.items.map(item => {
        const input = { item, internalItem: item, isExpanded: () => false, toggleExpand: value => toggles.push(value) };
        return Vue.h("tr", ["url", "home", "connection", "visibility", "actions"].map(key => Vue.h("td", slots[`item.${key}`]?.(input))));
      }))]);
    },
  });
  app.component("VBtn", {
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      buttons.push(attrs);
      return () => Vue.h(attrs.href ? "a" : "button", attrs, slots.default?.());
    },
  });
  app.component("RouterLink", {
    props: ["to"], inheritAttrs: false,
    setup(props, { attrs, slots }) {
      links.push({ to: props.to, ...attrs });
      return () => Vue.h("a", { ...attrs, href: `#${props.to.name}` }, slots.default?.());
    },
  });
  app.component("VDialog", { props: ["modelValue"], setup(props, { slots }) { return () => props.modelValue ? Vue.h("div", slots.default?.()) : null; } });
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) {
    const pascal = match[1].replace(/(^|-)([a-z])/g, (_, _dash, letter) => letter.toUpperCase());
    if (!app.component(match[1]) && !app.component(pascal)) app.component(match[1], tag("div"));
  }
  app.config.warnHandler = message => {
    if (!message.includes("Non-function value encountered")) throw Error(message);
  };
  const html = await renderToString(app);
  return { ...f, buttons, links, toggles, document: new JSDOM(html).window.document };
}

test("every address opens an explicit current-shop domain overview with optional child context", () => {
  const f = fixture();
  for (const [kind, item] of Object.entries(entries)) {
    const key = kind === "custom" ? "24" : kind;
    assert.deepEqual(f.state.domainRoute(item), { name: "BPageDomainOverview", params: { shop_id: 71, domain_key: key }, query: {} });
    assert.deepEqual(f.state.domainRoute(item, "BPageDomainSettings", "scope"), { name: "BPageDomainSettings", params: { shop_id: 71, domain_key: key }, query: { section: "scope" } });
  }
  f.state.writeShopAccess = () => false;
  f.state.openDomain(entries.custom, "BPageDomainStorefront");
  assert.equal(f.pushes[0].name, "BPageDomainStorefront", "read-only users can navigate to a protected read view");
  assert.equal(f.pushes[0].params.shop_id, 71, "the current authorized shop wins over inherited/stale route params");
});

test("navigation caches the list state and selected record before routing", () => {
  const f = fixture();
  f.state.openDomain(entries.custom, "BPageDomainConnection");
  assert.deepEqual(f.order, ["cache", "push"]);
  assert.equal(f.win.__RETURN.page, 3);
  assert.equal(f.win.__RETURN.search, "fixture search");
  assert.deepEqual(f.win.__RETURN.options, f.data.options);
  assert.equal(f.win.__RETURN.HIGHLIGHT_ID, "24");
  assert.equal(f.win.__RETURN.ROUTE_NAME, "BPageShopSettingDomain");
  assert.deepEqual(f.win.__RETURN.ROUTE_PARAMS, f.state.$route.params);
});

test("row clicks leave embedded links, actions and native controls independent", () => {
  const f = fixture();
  const document = new JSDOM('<div id="row"><span id="plain">Address</span><a><span id="link">Link</span></a><button><svg><path id="icon"></path></svg></button><input id="input"><select id="select"></select><textarea id="text"></textarea><details><summary id="summary">Details</summary></details></div>').window.document;
  for (const id of ["link", "icon", "input", "select", "text", "summary"]) f.state.openDomainRow({ target: document.getElementById(id) }, { item: entries.custom });
  assert.equal(f.pushes.length, 0);
  assert.equal(f.win.__RETURN, null, "an embedded operation must not replace the return snapshot");
  f.state.openDomainRow({ target: document.getElementById("plain") }, { item: entries.sub });
  assert.deepEqual(f.pushes, [{ name: "BPageDomainOverview", params: { shop_id: 71, domain_key: "sub" }, query: {} }]);
});

test("the rendered refined row keeps native address navigation without a copy box or duplicate row actions", async () => {
  const f = await renderRefined();
  assert.equal(f.document.querySelectorAll('[data-leaf="UTextCopyBox"]').length, 0);
  assert.equal(f.links.length, 1);
  assert.deepEqual(f.links[0].to, { name: "BPageDomainOverview", params: { shop_id: 71, domain_key: "24" }, query: {} });
  let stopped = 0;
  const event = { stopPropagation() { stopped++; } };
  const expand = f.buttons.find(button => button["aria-label"] === "domains_modern.workspace.details");
  expand.onClick(event);
  assert.equal(f.toggles.length, 1); assert.equal(f.pushes.length, 0);
  const external = f.buttons.find(button => button["aria-label"] === "user_dashboard.shops.modern.open_in_new_tab");
  external.onClick(event);
  assert.equal(external.target, "_blank"); assert.equal(external.rel, "noopener noreferrer");
  assert.equal(f.pushes.length, 0, "the native external link is independent of workspace routing");
  const settings = f.buttons.find(button => button["aria-label"] === "domains_modern.workspace.openSettings");
  settings.onClick(event);
  assert.deepEqual(f.pushes, [{ name: "BPageDomainOverview", params: { shop_id: 71, domain_key: "24" }, query: {} }]);
  assert.equal(f.win.__RETURN.HIGHLIGHT_ID, "24");
  assert.equal(stopped, 3);
});
