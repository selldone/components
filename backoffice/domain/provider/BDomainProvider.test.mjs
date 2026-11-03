import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const { parse, compileScript, compileTemplate, compileStyle } = require("@vue/compiler-sfc");
const { compile } = require("@vue/compiler-dom");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { JSDOM } = require("jsdom");
const ts = require("typescript");
const file = new URL("./BDomainProvider.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const providerExports = {};
new Function("require", "exports", transpile(readFileSync(new URL("./domain-provider.ts", import.meta.url), "utf8")))(name => {
  assert.ok(name.endsWith(".svg"), "Provider artwork must use an existing local asset");
  return name;
}, providerExports);
const dateExports = {};
new Function("require", "exports", "window", transpile(readFileSync(new URL("../../../mixin/date/DateMixin.ts", import.meta.url), "utf8")))(
  () => ({ DateConverter: {} }), dateExports, { $language: { full_locale: "en-US", calendar: { calendar: "gregory" } } },
);
const script = compileScript(descriptor, { id: "domain-provider-test" });
const exported = {};
new Function("require", "exports", transpile(script.content))(name => {
  if (name.endsWith("/DateMixin.ts")) return { default: dateExports.default };
  if (name === "./domain-provider.ts") return providerExports;
  return assert.fail(name);
}, exported);
const component = exported.default;
const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "domain-provider-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const renderExports = {};
new Function("require", "exports", transpile(template.code))(name => name === "vue" ? Vue : assert.fail(name), renderExports);
const rawRender = new Function("Vue", compile(descriptor.template.content, { mode: "function", prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: name => ({ name }) });
const t = (key, values) => `${key}${values ? " " + JSON.stringify(values) : ""}`;
const checked = (id = "cloudflare", source = "response_headers") => ({ id, source, checked_at: "2026-11-01T06:30:00Z" });
const item = connection_provider => ({ official: false, url: "https://store.example.test", domain: { id: 7, domain: "store.example.test" }, connection_provider });

async function render(value) {
  const app = Vue.createSSRApp({ ...component, render: renderExports.render }, { item: value });
  app.config.globalProperties.$t = t;
  app.config.warnHandler = message => { throw Error(message); };
  app.component("VTooltip", {
    inheritAttrs: false,
    setup(_, { attrs, slots }) { return () => Vue.h("div", { "data-location": attrs.location, "data-open-click": attrs["open-on-click"], "data-open-focus": attrs["open-on-focus"] }, [slots.activator?.({ props: { "aria-describedby": "provider-help" } }), Vue.h("div", { id: "provider-help", role: "tooltip" }, slots.default?.())]); },
  });
  app.component("VIcon", { inheritAttrs: false, setup(_, { attrs, slots }) { return () => Vue.h("span", { ...attrs, "data-icon": true }, slots.default?.()); } });
  return new JSDOM(await renderToString(app)).window.document;
}

test("component template and scoped Sass compile", () => {
  for (const style of descriptor.styles) assert.deepEqual(compileStyle({ source: style.content, filename: file.pathname, id: "data-v-domain-provider", scoped: style.scoped, preprocessLang: style.lang }).errors, []);
});

test("shared resolver preserves saved-evidence precedence and never mutates its input", () => {
  const value = Object.freeze({
    connection_provider: Object.freeze(checked("cloudflare")),
    domain: Object.freeze({ connection_provider: Object.freeze(checked("fastly")) }),
  });
  assert.equal(providerExports.resolveDomainProvider(value).id, "cloudflare");
  assert.deepEqual(value.connection_provider, checked("cloudflare"));
  assert.deepEqual(value.domain.connection_provider, checked("fastly"));
  assert.equal(providerExports.resolveDomainProvider({ ...value, connection_provider: {} }).kind, "not_checked");
});

test("verified common providers use canonical local logos and real registered date formatting", async () => {
  for (const [id, name, asset] of [["cloudflare", "Cloudflare", "cloudflare.svg"], ["google_cloud", "Google Cloud", "google-cloud.svg"]]) {
    const document = await render(item(checked(id)));
    assert.ok(document.querySelector("button").getAttribute("aria-label").includes(name));
    assert.ok(document.querySelector("img").getAttribute("src").endsWith(asset));
    assert.equal(document.querySelector("img").getAttribute("alt"), "");
    assert.ok(document.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.detected"));
    assert.equal(document.querySelector("time").getAttribute("datetime"), checked().checked_at);
    assert.ok(document.querySelector("time").textContent.includes("2026"));
    assert.ok(document.querySelector("time").textContent.includes("Nov"));
    assert.ok(!document.querySelector("time").textContent.includes("undefined"));
  }
});

test("built-in addresses and confirmed direct destinations share the Selldone cloud without conflating their meaning", async () => {
  for (const official of ["local", "sub"]) {
    const document = await render({ ...item(checked("cloudflare")), official });
    assert.ok(document.querySelector("button").getAttribute("aria-label").includes("Selldone"));
    assert.ok(document.querySelector("svg image").getAttribute("href").endsWith("selldone.svg"));
    assert.ok(document.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.builtin"));
    assert.equal(document.querySelector("time"), null);
  }
  const direct = await render(item(checked("selldone", "destination")));
  assert.ok(direct.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.direct"));
  const header = await render(item(checked("selldone")));
  assert.ok(header.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.not_checked"));
  assert.ok(!header.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.direct"));
});

test("known providers without a local logo retain their accessible names with a neutral cloud fallback", async () => {
  for (const [id, name] of [["cloudfront", "CloudFront"], ["fastly", "Fastly"], ["akamai", "Akamai"], ["azure", "Azure"], ["vercel", "Vercel"], ["bunny", "Bunny"], ["arvancloud", "ArvanCloud"]]) {
    const document = await render(item(checked(id)));
    assert.ok(document.querySelector("button").getAttribute("aria-label").includes(name));
    assert.equal(document.querySelector("img"), null);
    assert.equal(document.querySelector('[data-icon="true"]').textContent, "cloud_queue");
    assert.ok(document.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.detected"));
  }
});

test("missing and malformed evidence stays not checked while a completed unknown result is distinct", async () => {
  for (const saved of [undefined, null, {}, checked({ toString: null }), checked("__proto__"), checked("https://untrusted.example/logo.svg"), checked("cloudflare", "setup_choice"), checked("cloudflare", "destination"), { ...checked(), checked_at: "not-a-date" }, { ...checked(), checked_at: "1" }, { ...checked(), checked_at: "2026-11-01" }, { ...checked(), checked_at: null }, { ...checked(), checked_at: checked().checked_at + " ".repeat(36) }]) {
    const document = await render(item(saved));
    assert.equal(document.querySelector("img"), null);
    assert.ok(document.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.not_checked"));
    assert.equal(document.querySelector("time"), null);
  }
  const unknown = await render(item(checked("unknown")));
  assert.ok(unknown.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.unknown "));
  assert.ok(!unknown.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.not_checked"));
  assert.ok(unknown.querySelector("time"));
});

test("check timestamps enforce calendar dates, bounded offsets and ISO precision", async () => {
  for (const checked_at of ["0999-01-01T00:00:00Z", "2026-02-29T06:30:00Z", "2026-02-31T06:30:00Z", "2026-11-01T24:30:00Z", "2026-11-01T06:30:00+14:01", "2026-11-01T06:30:00-15:00", "2026-11-01T06:30:00.1234567Z"]) {
    const document = await render(item({ ...checked(), checked_at }));
    assert.ok(document.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.not_checked"), checked_at);
  }
  for (const checked_at of ["2024-02-29T06:30:00Z", "2026-11-01T06:30:00.123456Z", "2026-11-01T06:30:00+14:00", "2026-11-01T06:30:00-03:30"]) {
    const document = await render(item({ ...checked(), checked_at }));
    assert.equal(document.querySelector("time").getAttribute("datetime"), checked_at);
  }
});

test("saved model responses retain provider evidence without trusting extra info fields or setup flags", async () => {
  for (const field of ["connection_provider", "info"]) {
    const model = { id: 7, domain: "store.example.test", [field]: field === "info" ? { connection_provider: { ...checked(), logo: "https://untrusted.example/a.svg", name: "Spoof" } } : checked() };
    const document = await render({ domain: model });
    assert.ok(document.querySelector("img").getAttribute("src").endsWith("cloudflare.svg"));
    assert.ok(!document.documentElement.outerHTML.includes("untrusted.example"));
    assert.ok(!document.documentElement.outerHTML.includes("Spoof"));
  }
  for (const value of [null, { domain: { ssl_proxy: true, approved: true } }, { url: "https://*.selldone.com", domain: { domain: "*.selldone.com", ssl_proxy: true } }, { domain: { externally_hosted: true, provider: "cloudflare" } }]) {
    const document = await render(value);
    assert.ok(document.querySelector('[role="tooltip"]').textContent.includes("domains_modern.provider.not_checked"));
    assert.equal(document.querySelector("img"), null);
  }
});

test("provider help keeps a focused first click open, dismisses with Escape and isolates row navigation", () => {
  const state = { ...component.data(), item: item(checked()), $t: t };
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  const tree = rawRender(state, []);
  assert.equal(tree.props.location, "top");
  assert.equal(tree.props["open-on-focus"], "");
  assert.equal(tree.props["open-on-click"], "");
  assert.equal(tree.props.modelValue, false);
  tree.props["onUpdate:modelValue"](true);
  const button = tree.children.activator({ props: { onClick: () => { state.help = !state.help; } } })[0];
  assert.equal(button.type, "button");
  assert.equal(button.props.type, "button");
  let stopped = 0;
  for (const handler of [].concat(button.props.onClick)) handler({ stopPropagation() { stopped++; } });
  assert.equal(state.help, true, "the component click runs after the activator toggle and retains the focused tooltip");
  assert.equal(stopped, 1);
  button.props.onKeydown({ key: "Escape", stopPropagation() { stopped++; } });
  assert.equal(state.help, false);
  assert.equal(stopped, 2);
  tree.props["onUpdate:modelValue"](true);
  assert.equal(state.help, true, "framework hover/focus updates remain connected");
  tree.props["onUpdate:modelValue"](false);
  assert.equal(state.help, false, "framework outside/hover dismissal remains connected");
});
