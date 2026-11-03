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
  const domainExports = {};
  new Function("require", "exports", transpile(readFileSync(new URL("../../../mixin/domain/DomainMixin.ts", import.meta.url), "utf8")))(
    name => name.replace("@selldone/components-vue/", "/fixture-assets/"), domainExports,
  );
  const DomainMixin = domainExports.default;
  const dependency = name => {
    if (name === "vue") return Vue;
    if (name === "lodash-es") return { throttle: callback => callback };
    if (name.endsWith("/RouteMixin.ts")) return { RouteMixin };
    if (name.endsWith("/DomainMixin.ts")) return { default: DomainMixin };
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
    $t: (key, values) => key === 'domains_modern.list.sslManager' ? `SSL · ${values.provider}` : key === 'domains_modern.list.open_domain' ? `Open domain: ${values.domain}` : key, $n: value => String(value), $nextTick: callback => callback?.(),
    $refs: {}, $attrs: {}, $emit() {},
    $vuetify: { display: { width: 1200 }, locale: { isRtl: false }, theme: { current: { dark: false } } },
    writeShopAccess: () => config.permitted !== false,
    GetCurrency: () => ({ flag: "gb" }), getLanguageName: value => value,
  };
  const state = { ...globals, $data: data };
  for (const key of Object.keys(data)) Object.defineProperty(state, key, { get: () => data[key], set: value => { data[key] = value; }, configurable: true });
  for (const [key, method] of Object.entries({ ...RouteMixin.methods, ...DomainMixin.methods, ...component.methods })) state[key] = method.bind(state);
  for (const [key, computed] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => computed.call(state), configurable: true });
  const cache = state.cacheRouteState;
  state.cacheRouteState = key => { order.push("cache"); return cache(key); };
  const cell = (key, item) => descendants(renderTree(state, [])).find(node => node.type?.name === "v-data-table-server").children[`item.${key}`]({ item });
  return { component, RouteMixin, state, globals, data, dependency, win, pushes, order, items, cell };
}

async function renderRefined(items = [entries.custom], config = {}) {
  const f = fixture(items, config), buttons = [], links = [], toggles = [];
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
      return () => Vue.h("table", { class: attrs.class }, [Vue.h("tbody", props.items.flatMap(item => {
        const input = { item, internalItem: item, isExpanded: () => false, toggleExpand: value => toggles.push(value) };
        return [Vue.h("tr", ["url", "home", "connection", "visibility", "actions"].map(key => Vue.h("td", slots[`item.${key}`]?.(input)))), ...(config.expanded ? [slots['expanded-row']?.({ item, columns: props.headers })] : [])];
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

test("overridden home pages show their canonical destination icon while inherited homes keep the default mark", async () => {
  for (const [home, asset] of [
    ["shop", "store.svg"], ["avocado", "avocado.svg"], ["hyper", "hyper.svg"],
    ["blog", "blog.svg"], ["community", "community.png"], ["map", "map-tag.svg"],
    ["/collections/new", "static-pages.svg"], [84, "landing-page.svg"],
  ]) {
    const item = structuredClone(entries.custom);
    item.domain.home = home;
    const f = await renderRefined([item]);
    const icon = f.document.querySelector(".b-domains-list__destination img");
    assert.equal(icon.getAttribute("src"), `/fixture-assets/assets/icons/${asset}`);
    assert.equal(icon.getAttribute("alt"), "");
    assert.equal(icon.getAttribute("width"), "20");
  }
  for (const value of [{ home: null }, { home: "avocado", primary: true }]) {
    const item = structuredClone(entries.custom);
    item.domain.home = value.home;
    item.primary = !!value.primary;
    const f = await renderRefined([item]);
    assert.equal(f.document.querySelector(".b-domains-list__destination img"), null);
    assert.equal(f.document.querySelector(".b-domains-list__destination").firstElementChild.textContent, "home");
  }
});

test("maintenance stays explicit in custom-domain visibility, with disabled access taking precedence", async () => {
  const summary = { supported: true, enabled: true, has_html: true, byte_size: 512, updated_at: '2026-11-03T00:00:00Z', reason: null };
  for (const nested of [false, true]) for (const enabled of [false, true]) for (const permitted of [false, true]) {
    const item = structuredClone(entries.custom);
    item.enable = enabled;
    if (nested) item.domain.maintenance_summary = { ...summary, has_html: false };
    else item.maintenance_summary = summary;
    const f = await renderRefined([item], { permitted, expanded: true });
    const status = f.document.querySelector('td:nth-child(4) .sd-modern-status');
    assert.equal(status.textContent, enabled ? 'domains_modern.maintenance.status' : 'domains_modern.list.disabled');
    assert(status.querySelector(enabled ? '.sd-modern-status__dot--warning' : '.sd-modern-status__dot--error'));
    assert.match(f.document.querySelector('.b-domains-list__details .sd-modern-notice').textContent, enabled ? /maintenance.serving_hint/ : /maintenance.configured_disabled/);
    assert.equal(f.document.querySelector('.b-domains-list__details').textContent.includes('maintenance.missing_html'), nested, 'missing HTML never falls through to a normal-store claim');
    assert.equal(f.document.querySelector('.b-domains-list__details .b-domain-storefront-preview'), null, 'the compact list does not duplicate the customer-view preview');
  }
  for (const item of [
    { ...entries.local, maintenance_summary: summary },
    { ...entries.sub, maintenance_summary: summary },
    { ...entries.custom, maintenance_summary: { ...summary, supported: false } },
    { ...entries.custom, maintenance_summary: { ...summary, enabled: false } },
    { ...entries.custom, maintenance_summary: summary, domain: { ...entries.custom.domain, externally_hosted: true } },
    entries.custom,
  ]) {
    const f = await renderRefined([item], { expanded: true });
    assert.equal(f.document.querySelector('td:nth-child(4) .sd-modern-status').textContent, 'domains_modern.list.enabled');
    assert.equal(f.document.querySelector('.b-domains-list__details .sd-modern-notice'), null);
  }
});

test("connection rows explain configured SSL management independently of the public provider", async () => {
  for (const [entry, managed] of [
    [entries.local, true],
    [entries.sub, true],
    [{ ...entries.custom, connection_provider: { id: 'cloudflare' }, domain: { ...entries.custom.domain, ssl_proxy: true } }, true],
    [{ ...entries.custom, connection_provider: { id: 'selldone' }, domain: { ...entries.custom.domain, ssl_proxy: false } }, false],
    [{ ...entries.custom, domain: { ...entries.custom.domain, ssl_proxy: true, externally_hosted: true } }, false],
  ]) {
    const f = await renderRefined([entry]);
    const connection = f.document.querySelector('td:nth-child(3)');
    const manager = connection.querySelector('.b-domains-list__ssl-manager');
    assert.equal(manager.tagName, 'BUTTON');
    assert.equal(manager.getAttribute('type'), 'button');
    assert.equal(manager.textContent.trim(), `SSL · domains_modern.map.${managed ? 'selldoneEdge' : 'externalEdge'}`);
    assert.ok(connection.textContent.includes(`domains_modern.connection.${managed ? 'sslSecureHint' : 'sslOwnHint'}`));
    assert.equal(f.pushes.length, 0);
  }
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
  const external = f.buttons.find(button => button["aria-label"] === "Open domain: store.example.test");
  assert.equal(external.href, entries.custom.url);
  assert.ok(f.document.querySelector('.b-domains-list__row-actions').textContent.includes("Open domain: store.example.test"));
  external.onClick(event);
  assert.equal(external.target, "_blank"); assert.equal(external.rel, "noopener noreferrer");
  assert.equal(f.pushes.length, 0, "the native external link is independent of workspace routing");
  const settings = f.buttons.find(button => button["aria-label"] === "domains_modern.workspace.openSettings");
  settings.onClick(event);
  assert.deepEqual(f.pushes, [{ name: "BPageDomainOverview", params: { shop_id: 71, domain_key: "24" }, query: {} }]);
  assert.equal(f.win.__RETURN.HIGHLIGHT_ID, "24");
  assert.equal(stopped, 3);
  const sub = await renderRefined([entries.sub]);
  assert.ok(sub.buttons.some(button => button["aria-label"] === "Open domain: fixture.example.test" && button.href === entries.sub.url));
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
  f.state.shop.domains = item.domain ? [{ ...item.domain, enable: item.enable, indexed: item.indexed }] : [];
  f.state.domains = [...f.state.shop.domains];
  if (item.official) f.state.shop[item.official] = { enable: item.enable, indexed: item.indexed };
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

function expandedMap(f, item) {
  const table = descendants(renderTree(f.state, [])).find(node => node.type?.name === "v-data-table-server");
  return descendants(table.children["expanded-row"]({ columns: f.state.refinedHeaders, item })).find(node => node.type?.name === "b-domain-flow-map");
}
const normalizedProps = props => Object.fromEntries(Object.entries(props).map(([key, value]) => [key.startsWith('aria-') || key.startsWith('data-') ? key : Vue.camelize(key), value]));

function loadOptions(path, dependency) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const { descriptor, errors } = parse(source, { filename: path });
  assert.deepEqual(errors, []);
  const options = {};
  new Function("require", "exports", transpile(descriptor.script.content))(dependency, options);
  return { component: options.default, descriptor };
}
const domainMixin = {};
new Function("require", "exports", transpile(readFileSync(new URL("../../../mixin/domain/DomainMixin.ts", import.meta.url), "utf8")))(name => name, domainMixin);
const nativeToggle = loadOptions("../../../ui/smart/toggle/USmartToggle.vue", name => { throw Error("Unexpected native toggle import: " + name); }).component;
const nativeMap = loadOptions("./BDomainFlowMap.vue", name => {
  if (name.endsWith("/DomainMixin.ts")) return domainMixin;
  if (name.endsWith("USmartToggle.vue")) return { default: nativeToggle };
  if (name.endsWith("/DateConverter")) return { DateConverter: {} };
  throw Error("Unexpected map import: " + name);
});
const renderMapTree = new Function("Vue", compile(nativeMap.descriptor.template.content, {
  mode: "function", prefixIdentifiers: true,
}).code)({ ...Vue, resolveComponent: name => ({ name }), resolveDynamicComponent: name => name });

function indexingControl(f, item) {
  const owner = expandedMap(f, item);
  owner.props = normalizedProps(owner.props);
  const state = { ...nativeMap.component.data(), ...owner.props, busyRepair: false, $t: key => key, $vuetify: f.state.$vuetify,
    $nextTick: callback => callback?.(), $refs: {},
    $emit: (event, change) => event === "update-domain" && owner.props.onUpdateDomain(change),
  };
  for (const [key, method] of Object.entries({ ...domainMixin.default.methods, ...nativeMap.component.methods })) state[key] = method.bind(state);
  for (const [key, computed] of Object.entries(nativeMap.component.computed)) Object.defineProperty(state, key, { get: () => computed.call(state) });
  const tree = descendants(renderMapTree(state, []));
  const toggles = tree.filter(node => node.type?.name === "u-smart-toggle");
  for (const toggle of toggles) toggle.props = normalizedProps(toggle.props);
  return { owner, state, tree, primary: toggles[0], search: toggles[1],
    click() {
      const props = toggles[1].props;
      return nativeToggle.methods.toggle.call({ ...props, modelValue: props.modelValue, $nextTick: callback => callback(),
        $emit: (event, value) => event === "update:modelValue" && props["onUpdate:modelValue"](value),
      });
    },
  };
}

test("expanded details allow indexing alone with truthful permission, license, local and pending reasons", () => {
  const sub = { ...entries.sub, indexed: true };
  for (const [item, config, allowed, reason] of [
    [sub, { eligible: false }, true, ""],
    [entries.custom, {}, true, ""],
    [entries.custom, { permitted: false }, false, "indexingLockedPermission"],
    [entries.custom, { eligible: false }, false, "indexingLockedLicense"],
    [sub, { permitted: false }, false, "indexingLockedPermission"],
  ]) {
    const f = fixture([item], config), view = indexingControl(f, item);
    assert.equal(view.owner.props.readOnly, true);
    assert.equal(view.owner.props.indexingEditable, allowed);
    assert.equal(view.primary.props.readonly, true, "Primary keeps its original lock");
    assert.equal(view.search.props.readonly, !allowed);
    assert.equal(view.owner.props.indexingLockedReason, reason ? `domains_modern.map.${reason}` : "");
    if (reason) assert(view.tree.some(node => node.props?.role === "status" && node.children === `domains_modern.map.${reason}`));
    view.state.updateValue("primary", true);
    view.owner.props.onUpdateDomain({ param: "primary", value: true });
    assert.equal(f.state.busy_update, false, "indexing override cannot submit Primary");
  }
  const local = fixture([entries.local]);
  assert.equal(local.state.canIndexDomain(entries.local), false);
  assert.equal(local.state.indexingLockReason(entries.local), "domains_modern.map.indexingLockedLocal");
  assert.equal(indexingControl(local, entries.local).search, undefined, "local URL has no unsupported indexing control");
  const dark = fixture([sub], { permitted: false });
  dark.state.$vuetify.theme.current.dark = true;
  assert.equal(indexingControl(dark, sub).primary.props.dark, true);
  assert.equal(indexingControl(dark, sub).search.props.dark, true);
  for (const [pending, reason] of [["busy_update", "domains_modern.map.indexingSaving"], ["busy_fetch", "global.commons.loading"]]) {
    const f = fixture([sub]); f.state[pending] = true;
    const view = indexingControl(f, sub);
    assert.equal(view.search.props.readonly, true);
    assert.equal(view.search.props.loading, true);
    assert.equal(view.owner.props.indexingLockedReason, reason);
  }
});

test("the native expanded indexing toggle autosaves once, retains the saved value while pending and reports one success", async () => {
  for (const source of [entries.custom, { ...entries.sub, indexed: true }]) {
    for (const indexed of [false, true]) {
      const item = structuredClone({ ...source, indexed });
      let resolve;
      const f = writeFixture(item, () => new Promise(done => { resolve = done; }));
      const view = indexingControl(f, item);
      view.click();
      assert.equal(f.state.busy_update, true);
      assert.equal(item.indexed, indexed);
      assert.equal(indexingControl(f, item).search.props.modelValue, indexed);
      view.click();
      for (const handler of [view.search.props.onKeydown].flat()) handler({ key: "Enter", preventDefault() {} });
      assert.deepEqual(f.requests, [[`fixture:71:${item.domain?.domain || item.official}:indexed`, { value: !indexed }]]);
      const saved = { ...(item.domain || f.state.shop.sub), indexed: !indexed };
      resolve({ data: item.domain ? { domain: saved } : { sub: saved } });
      await new Promise(done => setImmediate(done));
      assert.equal(f.state.busy_update, false);
      assert.equal(f.state.busy_update_param, null);
      assert.equal(item.domain ? f.state.domains[0].indexed : f.state.shop.sub.indexed, !indexed);
      assert.deepEqual(f.notices.map(notice => notice[0]), ["showSuccessAlert"]);
      assert.deepEqual(f.pushes, [], "autosave never opens another workspace or Save step");
    }
  }
});

test("indexing failures keep saved data, release the control and allow a later retry", async () => {
  for (const failure of [() => Promise.resolve({ data: { error: true, error_msg: "Denied" } }),
    () => Promise.resolve({ data: { success: false, error_msg: "Rejected" } }), () => Promise.reject(new Error("Offline"))]) {
    const item = structuredClone(entries.custom), saved = { ...item.domain, indexed: false };
    let attempt = 0;
    const f = writeFixture(item, () => ++attempt === 1 ? failure() : Promise.resolve({ data: { domain: saved } }));
    const before = structuredClone(f.state.domains);
    indexingControl(f, item).click();
    await new Promise(done => setImmediate(done));
    assert.deepEqual(f.state.domains, before);
    assert.equal(f.state.busy_update, false);
    assert.equal(f.state.busy_update_param, null);
    assert.equal(f.notices.some(notice => notice[0] === "showSuccessAlert"), false);
    indexingControl(f, item).click();
    await new Promise(done => setImmediate(done));
    assert.equal(f.requests.length, 2);
    assert.equal(f.state.domains[0].indexed, false);
    assert.equal(f.notices.filter(notice => notice[0] === "showSuccessAlert").length, 1);
  }
});

test("indexing rechecks current authorization before writing and ignores stale completions", async () => {
  for (const kind of ["permission", "license", "local"]) {
    const item = structuredClone(kind === "local" ? { ...entries.local, indexed: false } : entries.custom);
    const f = writeFixture(item, () => { throw Error("Denied control must not submit"); });
    const staleView = indexingControl(f, item);
    if (kind === "permission") f.state.writeShopAccess = () => false;
    if (kind === "license") f.state.can_edit_domain = () => false;
    if (kind === "local") staleView.owner.props.onUpdateDomain({ param: "indexed", value: true });
    else staleView.click();
    assert.equal(f.requests.length, 0);
  }
  for (const kind of ["shop", "shopId", "permission", "license", "removed", "unmount"]) {
    const item = structuredClone(entries.custom);
    let resolve;
    const f = writeFixture(item, () => new Promise(done => { resolve = done; }));
    const saving = f.state.updateFlowDomain(item, { param: "indexed", value: false });
    const before = structuredClone(f.state.domains);
    if (kind === "shop") { f.state.shop = { ...f.state.shop, id: 72, domains: [] }; f.component.watch['shop.id'].call(f.state); }
    if (kind === "shopId") { f.state.shop.id = 72; f.component.watch["shop.id"].call(f.state); }
    if (kind === "permission") f.state.writeShopAccess = () => false;
    if (kind === "license") f.state.can_edit_domain = () => false;
    if (kind === "removed") { f.state.domains = []; f.state.shop.domains = []; }
    if (kind === "unmount") f.component.beforeUnmount.call(f.state);
    resolve({ data: { domain: { ...item.domain, indexed: false } } });
    await saving;
    assert.deepEqual(f.state.domains, kind === "removed" ? [] : before, kind);
    assert.deepEqual(f.notices, [], `${kind} ignores both model and notification`);
    assert.equal(f.state.busy_update, false);
  }
});

test("a same-shop metadata refresh preserves a pending indexing update and releases its busy state", async () => {
  const item = structuredClone(entries.custom);
  let resolve;
  const f = writeFixture(item, () => new Promise(done => { resolve = done; }));
  const saving = f.state.updateFlowDomain(item, { param: "indexed", value: false });
  f.state.shop = structuredClone(f.state.shop);
  assert.equal(f.state.busy_update, true);
  resolve({ data: { domain: { ...item.domain, indexed: false } } });
  await saving;
  assert.equal(f.state.shop.domains[0].indexed, false);
  assert.equal(f.state.domains[0].indexed, false);
  assert.equal(f.state.busy_update, false);
  assert.deepEqual(f.notices.map(notice => notice[0]), ["showSuccessAlert"]);
});

test("unconfirmed or mismatched autosave responses retain the saved model and show a failure instead of success", async () => {
  for (const item of [entries.custom, { ...entries.sub, indexed: true }]) {
    const branch = item.domain ? 'domain' : 'sub';
    const saved = { ...(item.domain || {}), indexed: false };
    for (const data of [{}, '<html>Unexpected login page</html>', null, { [branch]: {} },
      { [branch]: { ...saved, indexed: 'false' } }, { [branch]: { ...saved, indexed: true } },
      { [item.domain ? 'sub' : 'domain']: saved },
      ...(item.domain ? [{ domain: { ...saved, id: 99 } }, { domain: { ...saved, domain: 'another.example.test' } }] : []),
    ]) {
      const f = writeFixture(item, () => Promise.resolve({ data }));
      const before = structuredClone(f.state.domains), sub = structuredClone(f.state.shop.sub);
      await f.state.updateFlowDomain(item, { param: 'indexed', value: false });
      assert.deepEqual(f.state.domains, before);
      assert.deepEqual(f.state.shop.sub, sub);
      assert.equal(f.state.busy_update, false);
      assert.equal(f.notices.length, 1);
      assert.deepEqual(f.notices[0], ['showErrorAlert', 'global.notification.error', 'domains_modern.list.update_failed']);
    }
  }
});

test("a stale completion cannot clear a newer shop's pending indexing request or show a notice", async () => {
  for (const failOld of [false, true]) {
    const item = structuredClone(entries.custom), pending = [];
    const f = writeFixture(item, () => new Promise((resolve, reject) => pending.push({ resolve, reject })));
    const old = f.state.updateFlowDomain(item, { param: 'indexed', value: false });
    f.state.shop = { id: 72, home: 'shop', domains: [], sub: { indexed: true } };
    f.state.domains = [];
    f.component.watch['shop.id'].call(f.state);
    const current = f.state.updateFlowDomain({ ...entries.sub, indexed: true }, { param: 'indexed', value: false });
    if (failOld) pending[0].reject(new Error('Old transport failed'));
    else pending[0].resolve({ data: { domain: { ...item.domain, indexed: false } } });
    await old;
    assert.equal(f.state.busy_update, true);
    assert.equal(f.state.busy_update_param, 'indexed-sub');
    assert.deepEqual(f.notices, []);
    pending[1].resolve({ data: { sub: { indexed: false } } });
    await current;
    assert.equal(f.state.busy_update, false);
    assert.equal(f.state.shop.sub.indexed, false);
    assert.deepEqual(f.notices.map(notice => notice[0]), ['showSuccessAlert']);
  }
});
