import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(new URL("../../../../../package.json", import.meta.url));
const { parse, compileScript, compileTemplate } = require("@vue/compiler-sfc");
const { compile } = require("@vue/compiler-dom");
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
const renderTree = new Function("Vue", compile(descriptor.template.content, {
  mode: "function", prefixIdentifiers: true,
}).code)({ ...Vue, resolveComponent: name => ({ name }) });
const descendants = node => Array.isArray(node) ? node.flatMap(descendants) :
  node && typeof node === "object" ? [node, ...(Array.isArray(node.children) ? node.children.flatMap(descendants) : [])] : [];

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

function fixture(items = Object.values(entries), config = {}) {
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
    if (name.includes("/ShopLicense")) return { Eligible: { CanEditDomain: () => config.eligible !== false } };
    if (name.includes("/ShopPermissions")) return { ShopPermissionRegions: { SETTINGS: { code: "SETTINGS" } } };
    if (name.includes("/NotificationService")) return { default: config.notification || {} };
    if (name.endsWith(".vue")) return { default: leaf(name.split("/").at(-1).replace(".vue", "")) };
    return { default: {} };
  };
  const exports = {};
  const network = config.http || new Proxy({}, { get() { throw Error("Navigation tests must never make a request"); } });
  win.API = { PUT_EDIT_DOMAIN: (shop, domain, param) => `fixture:${shop}:${domain}:${param}` };
  new Function("require", "exports", "window", "axios", transpile(script.content))(dependency, exports, win, network);
  const component = exports.default;
  const data = { ...RouteMixin.data(), ...component.data(), page: 3, search: "fixture search", options: { page: 3, sortBy: [{ key: "domain", order: "asc" }] } };
  const globals = {
    shop: { id: 71, home: "shop", domain: "https://store.example.test", domains: [] },
    modern: true, refined: true, showHeader: false,
    $route: { name: "BPageShopSettingDomain", params: { shop_id: "999" } },
    $router: { push: route => { order.push("push"); pushes.push(route); return route; } },
    $t: key => key, $n: value => String(value), $nextTick: callback => callback?.(),
    $refs: {}, $attrs: {}, $emit() {},
    $vuetify: { display: { width: 1200 }, locale: { isRtl: false } },
    writeShopAccess: () => config.permitted !== false, GetDomainHomeName: value => `home:${value}`,
    GetCurrency: () => ({ flag: "gb" }), getLanguageName: value => value,
  };
  const state = { ...globals, $data: data };
  for (const key of Object.keys(data)) Object.defineProperty(state, key, { get: () => data[key], set: value => { data[key] = value; }, configurable: true });
  for (const [key, method] of Object.entries({ ...RouteMixin.methods, ...component.methods })) state[key] = method.bind(state);
  for (const [key, computed] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => computed.call(state), configurable: true });
  const cache = state.cacheRouteState;
  state.cacheRouteState = key => { order.push("cache"); return cache(key); };
  const cell = (key, item) => descendants(renderTree(state, [])).find(node => node.type?.name === "v-data-table-server").children[`item.${key}`]({ item });
  return { component, RouteMixin, state, globals, data, dependency, win, pushes, order, items, cell };
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

const visibilityButton = (f, item) => descendants(f.cell("visibility", item)).find(node => node.type === "button");
const connectionLink = (f, item) => descendants(f.cell("connection", item)).find(node => node.type?.name === "router-link");

test("inline visibility is a named plain toggle only for supported, permitted addresses", () => {
  const external = { ...entries.custom, domain: { ...entries.custom.domain, externally_hosted: true } };
  for (const item of [...Object.values(entries), external]) {
    const f = fixture([item]);
    const button = visibilityButton(f, item);
    assert.equal(button.props.type, "button");
    assert.equal(button.props["aria-pressed"], true);
    assert.ok(button.props["aria-label"].includes("domains_modern.list.disable_action"));
    assert.ok(button.props["aria-label"].includes(item.domain?.domain || item.url));
    assert.equal(button.props.disabled, false);
    assert.equal(descendants(renderTree(f.state, [])).filter(node => node.type?.name === "u-loading-progress").length, 0);
    for (const field of ["busy_fetch", "busy_update"]) {
      f.state[field] = true;
      assert.equal(visibilityButton(f, item).props.disabled, true);
      assert.equal(descendants(renderTree(f.state, [])).filter(node => node.type?.name === "u-loading-progress").length, field === "busy_update" ? 1 : 0);
      f.state[field] = false;
    }
  }
  const off = { ...entries.custom, enable: false };
  assert.ok(visibilityButton(fixture([off]), off).props["aria-label"].includes("domains_modern.list.enable_action"));
  for (const config of [{ permitted: false }, { eligible: false }]) {
    const f = fixture([entries.custom], config);
    assert.equal(visibilityButton(f, entries.custom), undefined);
    f.state.updateFlowDomain(entries.custom, { param: "enable", value: false });
    assert.equal(f.state.busy_update, false, "denied intents cannot reach the HTTP method");
  }
  for (const item of [{ ...entries.custom, domain: undefined }, { ...entries.local, official: "unknown" }, { ...entries.custom, enable: undefined }]) {
    const f = fixture([item]);
    assert.equal(visibilityButton(f, item), undefined);
    f.state.updateFlowDomain(item, { param: "enable", value: false });
    assert.equal(f.state.busy_update, false);
  }
});

function writeFixture(item, handler) {
  const requests = [], notices = [];
  const f = fixture([item], {
    http: { put: (url, payload) => { requests.push([url, payload]); return handler(); } },
    notification: Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map(name => [name, (...args) => notices.push([name, ...args])])),
  });
  f.state.shop.domains = item.domain ? [{ ...item.domain, enable: item.enable }] : [];
  f.state.domains = [...f.state.shop.domains];
  if (item.official) f.state.shop[item.official] = { enable: item.enable };
  const accept = (items, value) => {
    const index = items.findIndex(entry => entry.id === value.id);
    if (index < 0) items.push(value); else items[index] = value;
  };
  f.state.AddOrUpdateItemByID = accept;
  f.state.UpdateItemByID = accept;
  return { ...f, requests, notices };
}

test("inline toggle submits once and applies only the server-confirmed custom, local or subdomain result", async () => {
  for (const source of [...Object.values(entries), { ...entries.custom, domain: { ...entries.custom.domain, externally_hosted: true } }]) {
    for (const enabled of [false, true]) {
      const item = structuredClone({ ...source, enable: enabled });
      let resolve;
      const pending = new Promise(done => { resolve = done; });
      const f = writeFixture(item, () => pending);
      const button = visibilityButton(f, item);
      let stopped = 0;
      const event = { stopPropagation() { stopped++; } };
      const saving = button.props.onClick(event);
      assert.equal(stopped, 1);
      assert.equal(f.state.busy_update, true);
      assert.equal(item.enable, enabled, "no optimistic update before confirmation");
      assert.equal(visibilityButton(f, item).props["aria-busy"], true);
      button.props.onClick(event);
      assert.deepEqual(f.requests, [[`fixture:71:${item.domain?.domain || item.official}:enable`, { value: !enabled }]]);
      const saved = item.domain ? { ...item.domain, enable: !enabled, primary: false } : { enable: !enabled };
      resolve({ data: item.domain ? { domain: saved } : { [item.official]: saved } });
      await saving;
      assert.equal(f.state.busy_update, false);
      assert.equal(f.state.busy_update_param, null);
      if (item.domain) {
        assert.deepEqual(f.state.domains[0], saved);
        assert.deepEqual(f.state.shop.domains[0], saved);
      } else assert.deepEqual(f.state.shop[item.official], saved);
      assert.equal(f.notices[0][0], "showSuccessAlert");
      assert.deepEqual(f.pushes, [], "visibility never opens the row overview");
    }
  }
});

test("failed visibility changes retain saved state, release pending state and permit retry", async () => {
  for (const failure of [() => Promise.resolve({ data: { error: true, error_msg: "Fixture denied" } }), () => Promise.reject(new Error("Fixture offline"))]) {
    const item = structuredClone(entries.custom);
    let attempt = 0;
    const saved = { ...item.domain, enable: false };
    const f = writeFixture(item, () => ++attempt === 1 ? failure() : Promise.resolve({ data: { domain: saved } }));
    const before = structuredClone(f.state.domains);
    await visibilityButton(f, item).props.onClick({ stopPropagation() {} });
    assert.deepEqual(f.state.domains, before);
    assert.equal(f.state.busy_update, false);
    assert.equal(f.state.busy_update_param, null);
    assert.notEqual(f.notices[0][0], "showSuccessAlert");
    await visibilityButton(f, item).props.onClick({ stopPropagation() {} });
    assert.equal(f.requests.length, 2);
    assert.deepEqual(f.state.domains[0], saved);
  }
});

test("attention links retain read access and focus the same address's HTTPS details without a request", () => {
  for (const issue of [{ ssl: false }, { ssl: true, error: "Fixture connection failed" }]) {
    const item = { ...entries.custom, approved: true, ...issue };
    const f = fixture([item], { permitted: false, eligible: false });
    const link = connectionLink(f, item);
    assert.deepEqual(link.props.to, { name: "BPageDomainConnection", params: { shop_id: 71, domain_key: "24" }, query: { section: "ssl" } });
    assert.ok(link.props["aria-label"].includes("domains_modern.list.connection_details"));
    let stopped = 0;
    link.props.onClick({ stopPropagation() { stopped++; } });
    assert.equal(stopped, 1);
    assert.equal(f.win.__RETURN.HIGHLIGHT_ID, "24");
    assert.equal(f.win.__RETURN.search, "fixture search");
    assert.deepEqual(f.pushes, [], "the native RouterLink owns navigation");
  }
  for (const item of [entries.custom, entries.local, entries.sub, { ...entries.custom, ssl: false, error: "External", domain: { ...entries.custom.domain, externally_hosted: true } }]) {
    assert.equal(connectionLink(fixture([item]), item), undefined, "healthy and externally managed statuses remain plain");
  }
});
