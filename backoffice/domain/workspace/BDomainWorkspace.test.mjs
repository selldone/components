import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";
import { reactive, watch } from "vue";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";

const clone = (value) => structuredClone(value);
const custom = () => ({
  url: "https://store.example.com",
  site_map: "https://store.example.com/sitemap",
  official: false,
  enable: true,
  indexed: false,
  primary: false,
  approved: true,
  ssl: false,
  domain: {
    id: 11,
    domain: "store.example.com",
    enable: true,
    indexed: false,
    primary: false,
    https: true,
    languages: ["en"],
    currencies: ["USD"],
    home: null,
    ssl_proxy: false,
  },
});

function fixture(file = "BDomainWorkspace.vue", item = custom()) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const { descriptor, errors } = parse(source, { filename: file });
  assert.deepEqual(errors, []);
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: file,
      id: "workspace-test",
    }).errors,
    [],
  );
  let permitted = true,
    eligible = true,
    confirmation = null;
  const requests = [],
    events = [],
    notifications = [],
    exports = {};
  const response = { handler: async () => ({ data: { success: true } }) };
  const http = Object.fromEntries(
    ["get", "post", "put", "delete"].map((method) => [
      method,
      (...args) => {
        requests.push([method, ...args]);
        return response.handler(method, ...args);
      },
    ]),
  );
  const notification = {
    showLaravelError: (error) => notifications.push(error),
    showSuccessAlert: (...args) => notifications.push(args),
    openDangerAlert: (...args) => {
      confirmation = args.at(-1);
    },
  };
  const dependency = (name) => {
    if (name.endsWith("/html/HtmlHelper"))
      return {
        StripTags: (value) => String(value || "").replace(/<[^>]*>/g, ""),
      };
    if (name.includes("/ShopLicense"))
      return { Eligible: { CanEditDomain: () => eligible } };
    if (name.includes("/ShopPermissions"))
      return { ShopPermissionRegions: { SETTINGS: { code: "SETTINGS" } } };
    if (name === "@selldone/core-js/helper")
      return { ShopOptionsHelper: { GetLanguages: () => ["en", "fa"] } };
    if (name.includes("/DateConverter"))
      return {
        DateConverter: { convertToLocalTime: (value) => new Date(value) },
      };
    return {
      __esModule: true,
      default: name.includes("NotificationService") ? notification : {},
    };
  };
  const script = ts.transpileModule(descriptor.script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const api = new Proxy(
    {},
    {
      get:
        (_, name) =>
        (...args) =>
          `${String(name)}:${args.join(":")}`,
    },
  );
  new Function("require", "exports", "window", "axios", script)(
    dependency,
    exports,
    { API: api },
    http,
  );
  const component = exports.default;
  const state = {
    ...(component.data?.() || {}),
    ...component.methods,
    item: clone(item),
    shop: {
      id: 7,
      domains: [clone(item.domain)].filter(Boolean),
      home: "shop",
      custom_ips: ["192.0.2.1", "192.0.2.2"],
      custom_ips_ssl_proxy: ["192.0.2.2"],
      custom_cnames: ["edge.example.net", "edge2.example.net"],
      hash_id: "test-ownership",
      currencies: ["USD"],
    },
    section: "overview",
    settingSection: "access",
    $refs: {},
    $nextTick: (fn) => fn?.(),
    $watch: (source, handler, options) =>
      watch(source, handler, { ...options, flush: "sync" }),
    $t: (key) => key,
    $emit: (...args) => events.push(args),
    writeShopAccess: () => permitted,
    getLanguageName: (value) => value,
    GetDomainHomeName: (value) => `home:${value}`,
    getLocalDateString: (value) => value,
    AddOrUpdateItemByID: (items, value) => {
      const found = items.find((item) => item.id === value.id);
      if (found) Object.assign(found, value);
      else items.push(value);
    },
    DeleteItemByID: (items, id) => {
      const index = items.findIndex((item) => item.id === id);
      if (index >= 0) items.splice(index, 1);
    },
  };
  Object.entries(component.computed || {}).forEach(([key, getter]) =>
    Object.defineProperty(state, key, {
      configurable: true,
      get: () => getter.call(state),
    }),
  );
  Object.entries(component.methods || {}).forEach(([key, method]) => {
    state[key] = method.bind(state);
  });
  component.created?.call(state);
  return {
    component,
    state,
    requests,
    events,
    notifications,
    response,
    source,
    allow: (value) => {
      permitted = value;
    },
    license: (value) => {
      eligible = value;
    },
    confirm: () => confirmation?.(),
  };
}

test("mount and safe refresh never make a request; unrelated dirty drafts survive", () => {
  const f = fixture();
  f.component.mounted.call(f.state);
  assert.deepEqual(f.requests, []);
  assert.equal(f.state.hasUnsavedChanges, false);
  f.state.draft.languages = ["fa"];
  f.state.item.domain.languages = ["de"];
  f.state.item.enable = false;
  f.state.syncDrafts();
  assert.deepEqual(f.state.draft.languages, ["fa"]);
  assert.deepEqual(f.state.baseline.languages, ["de"]);
  assert.equal(f.state.draft.enable, false);
  assert.equal(f.state.hasUnsavedChanges, true);
});

test("sitemap closes on section or resource exit without saving the indexing draft", () => {
  const f = fixture();
  f.state.section = "search";
  f.state.draft.indexed = true;
  f.state.showSitemap = true;
  f.component.watch.section.call(f.state, "settings");
  assert.equal(f.state.showSitemap, false);
  assert.equal(f.state.draft.indexed, true);
  assert.equal(f.state.changed("indexed"), true);
  assert.deepEqual(f.requests, []);
  f.state.showSitemap = true;
  f.state.resetResource();
  assert.equal(f.state.showSitemap, false);
});

test("Overview ends with the exact hosted sitemap link and a read-only copy action", async () => {
  const f = fixture();
  const { descriptor } = parse(f.source);
  const template = compileTemplate({ source: descriptor.template.content, filename: "BDomainWorkspace.vue", id: "overview-sitemap-test" });
  const rendering = {};
  new Function("require", "exports", ts.transpileModule(template.code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText)(() => Vue, rendering);
  const explicit = custom();
  explicit.site_map = "https://store.example.com/sitemap/catalog.xml?locale=fa";
  const external = custom();
  external.domain.externally_hosted = true;
  const wildcard = custom();
  wildcard.url = "https://*.example.test";
  wildcard.site_map = "https://*.example.test/sitemap";
  f.allow(false);
  f.license(false);
  for (const [item, url] of [
    [explicit, explicit.site_map],
    [{ official: "local", url: "https://example.test/@shop", enable: false }, "https://example.test/@shop/sitemap"],
    [{ official: "sub", url: "https://shop.example.test", indexed: false }, "https://shop.example.test/sitemap"],
    [external, null],
    [wildcard, null],
  ]) {
    f.state.item = clone(item);
    let copy;
    const copied = [];
    f.state.copyToClipboard = value => copied.push(value);
    const app = Vue.createSSRApp({ render: () => rendering.render(f.state, []) });
    app.config.warnHandler = () => {};
    app.component("VDialog", { render: () => null });
    app.component("VBtn", {
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        if (!copy && attrs["aria-label"] === "domains_modern.workspace.copySitemap") copy = attrs.onClick;
        return () => Vue.h("button", attrs, slots.default?.());
      },
    });
    const document = new JSDOM(await renderToString(app)).window.document;
    const row = document.querySelector(".b-domain-workspace__overview-sitemap");
    if (!url) {
      assert.equal(row, null);
      continue;
    }
    assert.ok(row.closest(".b-domain-workspace__overview-list").lastElementChild.contains(row));
    const link = row.querySelector("a");
    assert.equal(link.getAttribute("href"), url);
    assert.equal(link.querySelector("bdi").textContent, url);
    assert.equal(link.querySelector("bdi").getAttribute("dir"), "ltr");
    assert.equal(link.getAttribute("target"), "_blank");
    assert.equal(link.getAttribute("rel"), "noopener noreferrer");
    assert.equal(row.querySelector("button").disabled, false);
    let stopped = false;
    copy({ stopPropagation() { stopped = true; } });
    assert.equal(stopped, true);
    assert.deepEqual(copied, [url]);
  }
  assert.deepEqual(f.requests, []);
  assert.deepEqual(f.events, []);
});

test("quick editors preview independently and cancel without discarding shared drafts", () => {
  const f = fixture();
  f.state.draft.indexed = true;
  f.state.draft.languages = ["fa"];
  f.state.operationError = "Earlier synthetic DNS error";
  f.state.operationMessage = "Earlier synthetic SSL message";
  f.state.openQuickEdit("indexed");
  assert.equal(f.state.quickField, "indexed");
  assert.equal(f.state.quickValue, true);
  assert.equal(f.state.operationError, "");
  assert.equal(f.state.operationMessage, "");
  f.state.quickValue = false;
  assert.equal(f.state.draft.indexed, true);
  f.state.closeQuickEdit();
  assert.equal(f.state.quickField, "");
  assert.equal(f.state.draft.indexed, true);
  assert.deepEqual(f.state.draft.languages, ["fa"]);
  assert.deepEqual(f.requests, []);

  const clean = fixture();
  clean.state.openQuickEdit("enable");
  clean.state.quickValue = false;
  assert.equal(clean.state.hasUnsavedChanges, true);
  assert.equal(clean.state.draft.enable, true);
  clean.state.closeQuickEdit();
  assert.equal(clean.state.hasUnsavedChanges, false);
  clean.state.openQuickEdit("primary");
  assert.equal(clean.state.quickField, "");
});

test("quick saves use the existing sparse write and failures preserve a retryable draft", async () => {
  for (const field of ["enable", "indexed"]) {
    const f = fixture();
    const value = !f.state.item[field];
    const other = field === "enable" ? "indexed" : "enable";
    f.state.draft[other] = !f.state.item[other];
    f.state.draft.languages = ["fa"];
    f.state.openQuickEdit(field);
    f.state.quickValue = value;
    f.response.handler = async () => ({
      data: { success: false, error_msg: "Synthetic preference rejection" },
    });
    await f.state.saveQuickEdit();
    assert.deepEqual(f.requests[0], [
      "put",
      `PUT_EDIT_DOMAIN:7:store.example.com:${field}`,
      { value },
    ]);
    assert.equal(f.state.quickField, field);
    assert.equal(f.state.draft[field], value);
    assert.equal(f.state.item[field], !value);
    assert.equal(f.state.quickCanSave, true);
    assert.equal(f.state.operationError, "Synthetic preference rejection");
    f.response.handler = async () => ({
      data: { success: true, domain: { id: 11, [field]: value } },
    });
    await f.state.saveQuickEdit();
    assert.equal(f.requests.length, 2);
    assert.equal(f.state.quickField, "");
    assert.equal(f.state.item[field], value);
    assert.equal(f.state.draft[field], value);
    assert.equal(f.state.changed(field), false);
    assert.equal(f.state.changed(other), true);
    assert.deepEqual(f.state.draft.languages, ["fa"]);
  }
});

test("returning a quick choice to its saved value discards only that local draft without a request", async () => {
  const f = fixture();
  f.state.draft.enable = false;
  f.state.draft.indexed = true;
  f.state.openQuickEdit("enable");
  f.state.quickValue = true;
  assert.equal(f.state.quickCanSave, true);
  await f.state.saveQuickEdit();
  assert.equal(f.state.quickField, "");
  assert.equal(f.state.draft.enable, true);
  assert.equal(f.state.changed("enable"), false);
  assert.equal(f.state.draft.indexed, true);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.deepEqual(f.requests, []);
});

test("quick controls recheck permission, license, busy state and built-in indexing limits", async () => {
  for (const denied of ["permission", "license", "busy"]) {
    const f = fixture();
    if (denied === "permission") f.allow(false);
    if (denied === "license") f.license(false);
    if (denied === "busy") f.state.busy = "dns";
    f.state.openQuickEdit("enable");
    assert.equal(f.state.quickField, "", denied);
    f.state.quickField = "enable";
    f.state.quickValue = false;
    assert.equal(f.state.quickCanSave, false, denied);
    await f.state.saveQuickEdit();
    assert.equal(f.state.draft.enable, true, denied);
    assert.deepEqual(f.requests, [], denied);
  }
  const local = fixture("BDomainWorkspace.vue", {
    official: "local",
    url: "https://example.test/@shop",
    enable: true,
    indexed: false,
    primary: false,
  });
  local.state.openQuickEdit("indexed");
  assert.equal(local.state.quickField, "");
  local.state.quickField = "indexed";
  local.state.quickValue = true;
  assert.equal(local.state.quickCanSave, false);
  await local.state.saveQuickEdit();
  assert.deepEqual(local.requests, []);

  const busy = fixture();
  busy.state.openQuickEdit("enable");
  busy.state.busy = "enable";
  assert.equal(busy.state.closeQuickEdit(), false);
  assert.equal(busy.state.quickField, "enable");
});

test("quick editors close on navigation or access loss and stale saves cannot update another resource", async () => {
  const f = fixture();
  f.state.draft.languages = ["fa"];
  f.state.openQuickEdit("indexed");
  f.component.watch.section.call(f.state, "connection");
  assert.equal(f.state.quickField, "");
  assert.deepEqual(f.state.draft.languages, ["fa"]);
  f.state.openQuickEdit("enable");
  f.allow(false);
  f.component.watch.canWrite.call(f.state, false);
  assert.equal(f.state.quickField, "");
  assert.deepEqual(f.state.draft.languages, ["fa"]);

  const stale = fixture();
  let resolve;
  stale.response.handler = () =>
    new Promise((done) => {
      resolve = done;
    });
  stale.state.openQuickEdit("indexed");
  stale.state.quickValue = true;
  const pending = stale.state.saveQuickEdit();
  stale.state.item.domain.id = 12;
  stale.state.item.domain.domain = "other.example.com";
  stale.state.dnsCheckState = "review";
  stale.state.resetResource();
  resolve({ data: { success: true, domain: { id: 11, indexed: true } } });
  await pending;
  assert.equal(stale.state.quickField, "");
  assert.equal(stale.state.item.domain.id, 12);
  assert.equal(stale.state.item.indexed, false);
  assert.equal(stale.state.draft.indexed, false);
  assert.equal(stale.state.dnsCheckState, "notChecked");
  assert.deepEqual(stale.events, []);
});

test("health summarizes saved setup and explicit evidence without starting a lookup", () => {
  const f = fixture();
  f.component.mounted.call(f.state);
  f.state.item.ssl = true;
  f.state.item.certificate = { "Expiry Date": "2099-01-01" };
  f.state.draft.enable = false;
  f.state.draft.indexed = true;
  assert.equal(f.state.healthSummary.state, "notChecked");
  assert.equal(f.state.healthSummary.source, "savedSetup");
  assert.equal(f.state.healthSummary.action, "check");
  f.state.dnsCheckState = "review";
  assert.equal(f.state.healthSummary.state, "dnsReview");
  assert.equal(f.state.healthSummary.source, "checkResult");
  f.state.item.error = "Saved connection issue";
  assert.equal(f.state.healthSummary.state, "issue");
  f.state.item.enable = false;
  assert.equal(f.state.healthSummary.state, "disabled");
  assert.equal(f.state.healthSummary.action, "enable");

  f.state.item.enable = true;
  f.state.item.error = null;
  f.state.item.domain.externally_hosted = true;
  f.state.item.approved = false;
  assert.equal(f.state.healthSummary.state, "ownership");
  f.state.item.approved = true;
  assert.equal(f.state.healthSummary.state, "external");
  f.state.item.domain.externally_hosted = false;
  f.state.dnsCheckState = "notChecked";
  f.state.item.certificate["Expiry Date"] = "2000-01-01";
  assert.equal(f.state.healthSummary.state, "certificateExpired");
  assert.equal(f.state.healthSummary.action, "ssl");
  const managed = fixture("BDomainWorkspace.vue", {
    official: "sub",
    name: "Sub domain",
    url: "https://shop.example.test",
    enable: true,
    indexed: true,
    primary: false,
  });
  assert.equal(managed.state.healthSummary.state, "managed");
  assert.equal(managed.state.healthSummary.action, "open");
  assert.equal(managed.state.address, "shop.example.test");
  assert.deepEqual(managed.requests, []);
  assert.deepEqual(f.requests, []);
});

test("current permission and license guard every domain write and explicit lookup", async () => {
  for (const denied of ["permission", "license"]) {
    const f = fixture();
    f.state.draft.enable = false;
    f.state.draft.https = false;
    denied === "permission" ? f.allow(false) : f.license(false);
    await f.state.changeParam("enable", false);
    await f.state.changeParam("primary", true);
    await f.state.saveSettings("https");
    await f.state.checkSsl();
    await f.state.checkDns();
    await f.state.repairClient();
    assert.deepEqual(f.requests, [], denied);
  }
});

test("local addresses allow enable only and current primary cannot be unset", async () => {
  const f = fixture("BDomainWorkspace.vue", {
    official: "local",
    url: "https://example.test/@shop",
    name: "@shop",
    enable: true,
    indexed: false,
    primary: false,
  });
  await f.state.changeParam("indexed", true);
  await f.state.changeParam("primary", true);
  await f.state.saveSettings("https");
  await f.state.checkDns();
  assert.deepEqual(f.requests, []);
  f.response.handler = async () => ({
    data: { success: true, local: { enable: false } },
  });
  await f.state.changeParam("enable", false);
  assert.deepEqual(f.requests[0], [
    "put",
    "PUT_EDIT_DOMAIN:7:local:enable",
    { value: false },
  ]);
  const current = fixture();
  current.state.item.primary = true;
  await current.state.changeParam("primary", false);
  await current.state.changeParam("primary", true);
  assert.deepEqual(current.requests, []);
});

test("external domains retain primary and scope operations without hosted DNS or SSL actions", async () => {
  const item = custom();
  item.domain.externally_hosted = true;
  const f = fixture("BDomainWorkspace.vue", item);
  await f.state.checkDns();
  await f.state.checkSsl();
  await f.state.saveSettings("https");
  assert.deepEqual(f.requests, []);
  assert.deepEqual(f.state.requiredRecords, []);
  f.state.verificationMethod = "txt";
  assert.deepEqual(
    f.state.requiredRecords.map((record) => [record.type, record.host]),
    [["TXT", "_selldone-verification.store"]],
  );
  f.response.handler = async () => ({
    data: { success: true, domain: { ...item.domain, primary: true } },
  });
  await f.state.changeParam("primary", true);
  assert.equal(f.requests[0][1], "PUT_EDIT_DOMAIN:7:store.example.com:primary");
  assert.equal(f.state.item.primary, true);
});

test("settings submit only their sparse group and success:false keeps the draft unsaved", async () => {
  const f = fixture();
  f.state.draft.https = false;
  f.response.handler = async () => ({
    data: { success: false, domain: { ...f.state.item.domain, https: false } },
  });
  assert.equal(await f.state.saveSettings("https"), false);
  assert.deepEqual(f.requests[0], [
    "post",
    "POST_SET_DOMAIN_SETTING:7:11",
    { https: false },
  ]);
  assert.equal(f.state.hasUnsavedChanges, true);
  assert.equal(f.state.item.domain.https, true);
  assert.deepEqual(f.events, []);
  f.response.handler = async () => ({
    data: { success: true, domain: { ...f.state.item.domain, https: false } },
  });
  await f.state.saveSettings("https");
  assert.equal(f.state.hasUnsavedChanges, false);
});

test("late responses cannot update another shop/domain or emit its refresh", async () => {
  const f = fixture();
  let resolve;
  f.response.handler = () =>
    new Promise((done) => {
      resolve = done;
    });
  const pending = f.state.changeParam("enable", false);
  f.state.item.domain.id = 12;
  f.state.item.domain.domain = "other.example.com";
  f.state.resetResource();
  resolve({
    data: {
      success: true,
      domain: { id: 11, domain: "store.example.com", enable: false },
    },
  });
  await pending;
  assert.equal(f.state.item.domain.id, 12);
  assert.equal(f.state.item.enable, true);
  assert.deepEqual(f.events, []);
  assert.equal(f.state.busy, "");
});

test("explicit DNS check retains diagnostics without treating stored approval as ownership evidence", async () => {
  const f = fixture();
  f.response.handler = async () => ({
    data: {
      error: true,
      error_msg: "<b>Review target</b>",
      dns: [{ host: "store.example.com", type: "A", ip: "192.0.2.9" }],
      domain: { approved: true },
    },
  });
  await f.state.checkDns();
  assert.equal(f.requests[0][1], "GET_DOMAIN_INFO:7:store.example.com");
  assert.equal(f.state.detectedDns.length, 1);
  assert.equal(f.state.dnsVerification.approved, undefined);
  assert.equal(
    f.state.feedbackRecords.some((record) => record.type === "TXT"),
    false,
  );
  assert.equal(f.state.dnsError, "<b>Review target</b>");
  assert.equal(f.state.operationError, "");
  assert.deepEqual(f.notifications, []);
  assert.equal(f.source.includes("v-html"), false);
});

test("only current explicit DNS evidence can produce accepted health", async () => {
  const route = [{ host: "store.example.com", type: "A", ip: "192.0.2.1" }];
  for (const [name, data, expected] of [
    [
      "error overrides route evidence",
      { error: true, approved: true, dns: route },
      "error",
    ],
    ["missing diagnostics", { approved: true }, "unavailable"],
    ["malformed diagnostics", { approved: true, dns: {} }, "unavailable"],
    ["unapproved without diagnostics", { approved: false }, "unavailable"],
    ["unapproved with diagnostics", { approved: false, dns: [] }, "review"],
    [
      "top-level rejection wins",
      { approved: false, domain: { approved: true }, dns: route },
      "review",
    ],
    ["explicit accepted A", { approved: true, dns: route }, "accepted"],
    [
      "nested approval and lowercase CNAME",
      {
        domain: { approved: true },
        dns: [{ type: "cname", target: "edge.example.net" }],
      },
      "accepted",
    ],
    [
      "ownership-only TXT is not routing",
      { approved: true, dns: [{ type: "TXT", txt: "synthetic-proof" }] },
      "unavailable",
    ],
    ["empty route list", { approved: true, dns: [] }, "unavailable"],
    ["stored approval alone is insufficient", { dns: route }, "unavailable"],
  ]) {
    const f = fixture();
    assert.equal(f.state.item.approved, true);
    f.response.handler = async () => ({ data: clone(data) });
    await f.state.checkDns();
    assert.equal(f.state.dnsCheckState, expected, name);
    assert.equal(f.requests.length, 1, name);
    assert.equal(f.state.healthSummary.source, "checkResult", name);
    assert.equal(
      f.state.healthSummary.state === "dnsAccepted",
      expected === "accepted",
      name,
    );
  }
});

test("a failed fresh DNS lookup invalidates an earlier accepted health result", async () => {
  const f = fixture();
  f.state.dnsCheckState = "accepted";
  f.response.handler = async () => {
    throw new Error("Synthetic transport failure");
  };
  await f.state.checkDns();
  assert.equal(f.state.dnsCheckState, "error");
  assert.equal(f.state.healthSummary.state, "dnsReview");
  assert.equal(f.state.healthSummary.source, "checkResult");
  assert.equal(f.state.busy, "");
  assert.equal(f.requests.length, 1);
});

test("DNS and SSL business failures stay separate and preserve unrelated operation feedback", async () => {
  const f = fixture();
  f.state.operationError = "Earlier save rejection";
  f.state.operationMessage = "Earlier repair result";
  f.state.sslError = "Earlier SSL detail";
  f.response.handler = async () => ({
    data: { success: false, message: "Synthetic DNS rejection", dns: [] },
  });
  await f.state.checkDns();
  assert.equal(f.state.dnsCheckState, "error");
  assert.equal(f.state.dnsError, "Synthetic DNS rejection");
  assert.equal(f.state.dnsMessage, "");
  assert.equal(f.state.sslError, "Earlier SSL detail");
  f.response.handler = async () => ({
    data: { success: false, error_msg: "<b>Synthetic SSL rejection</b>" },
  });
  await f.state.checkSsl();
  assert.equal(f.state.sslError, "<b>Synthetic SSL rejection</b>");
  assert.equal(f.state.sslMessage, "");
  assert.equal(f.state.dnsError, "Synthetic DNS rejection");
  assert.equal(f.state.operationError, "Earlier save rejection");
  assert.equal(f.state.operationMessage, "Earlier repair result");
  assert.equal(f.requests[1][1], "POST_DOMAIN_CHECK_SSL:7:11");
  assert.deepEqual(f.events, [["refresh"], ["refresh"]]);
  assert.deepEqual(f.notifications, []);
});

test("SSL confirmation accepts current domain data while preserving drafts and DNS feedback", async () => {
  const f = fixture();
  f.state.draft.https = false;
  f.state.draft.languages = ["fa"];
  f.state.dnsMessage = "Earlier DNS result";
  f.state.detectedDns = [{ type: "A", ip: "192.0.2.1" }];
  f.response.handler = async () => ({
    data: {
      success: true,
      domain: {
        id: 11,
        ssl: true,
        certificate: { "Expiry Date": "2099-01-01" },
      },
    },
  });
  await f.state.checkSsl();
  assert.deepEqual(f.requests, [["post", "POST_DOMAIN_CHECK_SSL:7:11"]]);
  assert.deepEqual(f.state.sslResult, { ssl: true, skipped: false });
  assert.equal(f.state.sslMessage, "domains_modern.workspace.sslCheckSuccess");
  assert.equal(f.state.sslError, "");
  assert.equal(f.state.item.ssl, true);
  assert.equal(f.state.item.certificate["Expiry Date"], "2099-01-01");
  assert.equal(f.state.draft.https, false);
  assert.deepEqual(f.state.draft.languages, ["fa"]);
  assert.equal(f.state.dnsMessage, "Earlier DNS result");
  assert.equal(f.state.detectedDns.length, 1);
  assert.deepEqual(f.notifications, []);

  f.response.handler = async () => ({
    data: {
      success: true,
      domain: { id: 11, ssl: false },
      message: "Probe rejected",
    },
  });
  await f.state.checkSsl();
  assert.equal(f.state.sslError, "Probe rejected");
  assert.equal(f.state.sslMessage, "");
  assert.equal(f.state.item.ssl, false);
  assert.equal(f.state.item.certificate["Expiry Date"], "2099-01-01");
  assert.equal(f.state.certificateState, "unknown");
});

test("checks retain transport detail inline and do not invent SSL confirmation", async () => {
  for (const method of ["checkDns", "checkSsl"]) {
    const f = fixture();
    f.response.handler = async () => {
      throw {
        response: {
          data: { errors: { domain: ["Synthetic permission failure"] } },
        },
      };
    };
    await f.state[method]();
    assert.equal(
      f.state[method === "checkDns" ? "dnsError" : "sslError"],
      "Synthetic permission failure",
    );
    assert.equal(f.state.operationError, "");
    assert.equal(f.state.busy, "");
    assert.deepEqual(f.notifications, []);
    assert.deepEqual(f.events, [["refresh"]]);
  }
  const f = fixture();
  f.state.item.ssl = true;
  f.state.item.certificate = { "Expiry Date": "2099-01-01" };
  f.response.handler = async () => ({ data: {} });
  await f.state.checkSsl();
  assert.equal(
    f.state.sslMessage,
    "domains_modern.workspace.sslCheckUnavailable",
  );
  assert.equal(f.state.sslResult.ssl, null);
  assert.equal(
    f.state.item.ssl,
    true,
    "missing response evidence does not overwrite saved state",
  );
  assert.equal(f.state.item.certificate["Expiry Date"], "2099-01-01");
  f.response.handler = async () => ({
    data: { success: true, skipped: true, domain: { id: 11, ssl: true } },
  });
  await f.state.checkSsl();
  assert.equal(f.state.sslResult.skipped, true);
  assert.equal(
    f.state.sslMessage,
    "domains_modern.workspace.sslCheckUnavailable",
  );
  f.response.handler = async () => {
    throw new Error("Synthetic network detail");
  };
  await f.state.checkSsl();
  assert.equal(f.state.sslError, "Synthetic network detail");
  assert.equal(f.state.sslMessage, "");
  assert.deepEqual(f.notifications, []);
});

test("retries clear only their own feedback and stale checks cannot populate a different resource", async () => {
  for (const method of ["checkDns", "checkSsl"]) {
    const f = fixture();
    f.state.dnsError = "Previous DNS failure";
    f.state.dnsMessage = "Previous DNS message";
    f.state.detectedDns = [{ type: "A", ip: "192.0.2.9" }];
    f.state.sslError = "Previous SSL failure";
    f.state.sslMessage = "Previous SSL message";
    f.state.sslResult = { ssl: true, skipped: false };
    f.state.item.certificate = { "Expiry Date": "2099-01-01" };
    let resolve;
    f.response.handler = () =>
      new Promise((done) => {
        resolve = done;
      });
    const pending = f.state[method]();
    const own = method === "checkDns" ? "dns" : "ssl",
      other = own === "dns" ? "ssl" : "dns";
    assert.equal(f.state[own + "Error"], "");
    assert.equal(f.state[own + "Message"], "");
    assert.notEqual(f.state[other + "Error"], "");
    assert.equal(f.state.item.certificate["Expiry Date"], "2099-01-01");
    if (own === "dns") assert.equal(f.state.detectedDns, null);
    else assert.equal(f.state.sslResult, null);
    await f.state[method]();
    assert.equal(f.requests.length, 1, "busy check prevents duplicates");
    f.state.item.domain.id = 12;
    f.state.item.domain.domain = "other.example.com";
    f.state.resetResource();
    resolve({
      data: {
        success: false,
        error_msg: "Stale failure",
        domain: { id: 11, ssl: false },
      },
    });
    await pending;
    assert.equal(f.state.item.domain.id, 12);
    assert.equal(f.state.dnsError, "");
    assert.equal(f.state.dnsMessage, "");
    assert.equal(f.state.detectedDns, null);
    assert.equal(f.state.sslError, "");
    assert.equal(f.state.sslMessage, "");
    assert.equal(f.state.sslResult, null);
    assert.deepEqual(f.events, []);
    assert.deepEqual(f.notifications, []);
  }
});

test("DNS and SSL messages render only in their own Connection sections as plain text", async () => {
  const f = fixture();
  const { descriptor } = parse(f.source);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: "BDomainWorkspace.vue",
    id: "inline-check-test",
  });
  const rendering = {};
  new Function(
    "require",
    "exports",
    ts.transpileModule(template.code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(() => Vue, rendering);
  f.state.dnsError = "DNS <b>synthetic</b> detail";
  f.state.sslMessage = "SSL synthetic result";
  f.state.sslResult = { ssl: true, skipped: false };
  for (const section of [
    "connection",
    "overview",
    "storefront",
    "search",
    "settings",
  ]) {
    f.state.section = section;
    const app = Vue.createSSRApp({
      render: () => rendering.render(f.state, []),
    });
    app.config.warnHandler = () => {};
    app.component("VDialog", { render: () => null });
    const html = await renderToString(app),
      document = new JSDOM(html).window.document;
    const dns = document.querySelector(".b-domain-workspace__dns-result"),
      ssl = document.querySelector(".b-domain-workspace__ssl-result");
    if (section === "connection") {
      assert.ok(dns.textContent.includes("DNS <b>synthetic</b> detail"));
      assert.equal(dns.getAttribute("role"), "alert");
      assert.equal(dns.querySelector("b"), null);
      assert.ok(ssl.textContent.includes("SSL synthetic result"));
      assert.equal(ssl.getAttribute("role"), "status");
      assert.equal(
        dns.closest("section").querySelector(".b-domain-workspace__ssl-result"),
        null,
      );
    } else {
      assert.equal(dns, null, section);
      assert.equal(ssl, null, section);
      assert.equal(
        document.body.textContent.includes("synthetic"),
        false,
        section,
      );
    }
  }
  f.state.section = "connection";
  f.state.sslResult.skipped = true;
  const app = Vue.createSSRApp({ render: () => rendering.render(f.state, []) });
  app.config.warnHandler = () => {};
  app.component("VDialog", { render: () => null });
  const document = new JSDOM(await renderToString(app)).window.document;
  const icon = document.querySelector(".b-domain-workspace__ssl-result v-icon");
  assert.equal(icon.textContent.trim(), "info_outline");
  assert.equal(icon.getAttribute("color"), null);
});

test("the Overview check opens Connection before the explicit DNS request", async () => {
  const f = fixture();
  await f.state.runHealthAction();
  assert.deepEqual(f.events[0], ["navigate", "connection", undefined]);
  assert.equal(f.requests[0][1], "GET_DOMAIN_INFO:7:store.example.com");
});

test("repair no-op with a real client preserves server message; absence is a failure", async () => {
  for (const present of [false, true]) {
    const f = fixture();
    f.response.handler = async () => ({
      data: {
        success: false,
        client: present
          ? { redirect_uris: ["https://store.example.com/selldone-callback"] }
          : null,
        message: present ? "Client already exists" : "Client unavailable",
      },
    });
    await f.state.repairClient();
    assert.equal(
      f.state.operationMessage,
      present ? "Client already exists" : "",
    );
    assert.equal(f.state.operationError, present ? "" : "Client unavailable");
    assert.equal(
      f.state.callback,
      present ? "https://store.example.com/selldone-callback" : "",
    );
  }
});

test("deletion requires current remove section, verification and a fresh guard after confirmation", async () => {
  const f = fixture();
  f.state.section = "settings";
  f.state.settingSection = "remove";
  f.state.removeExpanded = true;
  f.state.deleteDomain();
  assert.deepEqual(f.requests, []);
  f.state.verifyRemoval(true);
  f.state.deleteDomain();
  f.allow(false);
  f.confirm();
  assert.deepEqual(f.requests, []);
  f.allow(true);
  f.state.deleteDomain();
  f.state.settingSection = "access";
  f.confirm();
  assert.deepEqual(f.requests, []);
  f.state.settingSection = "remove";
  f.state.draft.languages = ["fa"];
  f.response.handler = async () => ({ data: { success: true, id: 11 } });
  f.state.deleteDomain();
  await f.confirm();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.requests[0][0], "delete");
  assert.deepEqual(f.events, [["deleted", 11]]);
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.equal(f.state.isBusy, false);
});

test("home static drafts and in-flight saves participate in resource exit guards", () => {
  const f = fixture();
  const home = reactive({
    static_page_mode: true,
    home_page: "/",
    old_page: "/",
    busy_set: false,
  });
  f.state.$refs.homeSelect = home;
  f.state.observeHome();
  home.home_page = "/dist";
  assert.equal(f.state.hasUnsavedChanges, true);
  home.old_page = "/dist";
  home.busy_set = true;
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.equal(f.state.isBusy, true);
  home.busy_set = false;
  assert.equal(f.state.isBusy, false);
  f.component.beforeUnmount.call(f.state);
});

test("clean home selection follows primary and authoritative refresh while dirty paths remain", async () => {
  const f = fixture();
  f.state.item.domain.home = "blog";
  const home = reactive({
    static_page_mode: false,
    home_page: "blog",
    old_page: "blog",
    busy_set: false,
  });
  f.state.$refs.homeSelect = home;
  f.state.observeHome();
  f.state.item.primary = true;
  f.state.syncDrafts();
  assert.equal(home.home_page, "shop");
  assert.equal(home.old_page, "shop");
  home.static_page_mode = true;
  home.home_page = "/draft";
  f.state.shop.home = "map";
  f.state.syncDrafts();
  assert.equal(home.home_page, "/draft");
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.item.primary = false;
  await f.state.changeParam("primary", true);
  assert.deepEqual(f.requests, []);
  f.component.beforeUnmount.call(f.state);
});

test("a queued native home choice is busy until completion; failure keeps draft and releases busy", async () => {
  const f = fixture();
  const home = reactive({
    static_page_mode: false,
    home_page: "shop",
    old_page: "shop",
    busy_set: false,
  });
  f.state.$refs.homeSelect = home;
  f.state.observeHome();
  home.home_page = "blog";
  assert.equal(f.state.isBusy, true);
  assert.equal(f.state.hasUnsavedChanges, true);
  await f.state.changeParam("enable", false);
  await f.state.checkDns();
  assert.deepEqual(f.requests, []);
  home.busy_set = true;
  home.busy_set = false;
  assert.equal(f.state.isBusy, false);
  assert.equal(f.state.hasUnsavedChanges, true);
  f.state.syncHome();
  assert.equal(home.home_page, "blog");
  f.component.beforeUnmount.call(f.state);
});

test("clearing a nullable scope becomes clean after a successful unrestricted save", async () => {
  const f = fixture();
  f.state.draft.languages = null;
  f.response.handler = async () => ({
    data: {
      success: true,
      domain: { ...f.state.item.domain, languages: null },
    },
  });
  await f.state.saveSettings("scope");
  assert.equal(f.state.hasUnsavedChanges, false);
  assert.deepEqual(f.requests[0][2], { languages: [], currencies: ["USD"] });
});

test("DNS choices keep A/CNAME alternatives separate and preserve nested/country/wildcard hosts", () => {
  const f = fixture();
  f.state.routeType = "CNAME";
  assert.deepEqual(
    f.state.requiredRecords.map((record) => record.type),
    ["CNAME", "TXT"],
  );
  assert.equal(f.state.requiredRecords[0].value, "edge.example.net");
  f.state.item.domain.ssl_proxy = true;
  assert.deepEqual(
    f.state.requiredRecords.map((record) => record.type),
    ["A", "TXT"],
  );
  assert.equal(f.state.requiredRecords[0].value, "192.0.2.2");
  for (const [domain, host, owner] of [
    ["store.eu.example.com", "store.eu", "store.eu-challenge"],
    ["example.co.uk", "@", "@"],
    ["*.store.example.com", "*.store", "*.store-challenge"],
  ]) {
    f.state.item.domain.domain = domain;
    assert.equal(f.state.relativeHost, host);
    assert.equal(f.state.verificationHost, owner);
  }
});

test("certificate validity requires usable expiry evidence and callbacks include expected URL fallback", () => {
  const f = fixture();
  f.state.item.certificate = {};
  assert.equal(f.state.certificateState, "unknown");
  f.state.item.certificate["Expiry Date"] = "invalid";
  assert.equal(f.state.certificateState, "unknown");
  f.state.item.certificate["Expiry Date"] = "2000-01-01";
  assert.equal(f.state.certificateState, "expired");
  f.state.item.ssl = true;
  assert.equal(f.state.connectionNeedsAttention, true);
  f.state.item.certificate["Expiry Date"] = "2099-01-01";
  f.state.item.ssl = false;
  assert.equal(f.state.certificateState, "unknown");
  f.state.item.ssl = true;
  assert.equal(f.state.certificateState, "valid");
  assert.equal(f.state.connectionNeedsAttention, false);
  for (const issue of [
    "2098-01-01",
    "invalid",
    "",
    "2099-01-01",
    "2100-01-01",
  ]) {
    f.state.item.certificate["Issue Date"] = issue;
    assert.equal(f.state.certificateState, "unknown", `issue ${issue}`);
  }
  f.state.item.certificate["Issue Date"] = "2000-01-01";
  assert.equal(f.state.certificateState, "valid");
  for (const validity of ["expired", "invalid", "", false]) {
    f.state.item.certificate.Validity = validity;
    assert.equal(f.state.certificateState, "unknown", `validity ${validity}`);
  }
  for (const validity of ["valid", "expiring", null]) {
    f.state.item.certificate.Validity = validity;
    assert.equal(f.state.certificateState, "valid", `validity ${validity}`);
  }
  f.state.item.certificate.Validity = "invalid";
  f.state.item.certificate["Issue Date"] = "2098-01-01";
  f.state.item.certificate["Expiry Date"] = "2000-01-01";
  f.state.item.ssl = false;
  assert.equal(f.state.certificateState, "expired");
  f.state.item.callback_url = "https://store.example.com/selldone-callback";
  assert.equal(f.state.callback, f.state.item.callback_url);
  f.state.item.client = {
    redirect: "",
    redirect_uris: ["https://store.example.com/login-callback"],
  };
  assert.equal(f.state.callback, "https://store.example.com/login-callback");
});

test("customer preview follows saved home types, primary/default inheritance and external hosting", () => {
  const f = fixture(),
    preview = fixture("BDomainStorefrontPreview.vue");
  preview.state.external = false;
  for (const [home, kind] of [
    ["shop", "shop"],
    ["blog", "blog"],
    ["community", "community"],
    ["map", "map"],
    ["avocado", "avocado"],
    ["hyper", "hyper"],
    [17, "landing"],
    ["17", "landing"],
    ["custom-page", "landing"],
    ["/index.html", "static"],
  ]) {
    f.state.item.domain.home = home;
    assert.equal(f.state.configuredHome, home);
    assert.equal(f.state.homeLabel, `home:${home}`);
    preview.state.home = f.state.configuredHome;
    assert.equal(preview.state.kind, kind);
  }
  f.state.shop.home = "blog";
  for (const home of [null, ""]) {
    f.state.item.domain.home = home;
    assert.equal(f.state.configuredHome, "blog");
  }
  f.state.item.domain.home = "map";
  f.state.item.primary = true;
  assert.equal(f.state.configuredHome, "blog");
  f.state.$refs.homeSelect = { home_page: "community" };
  assert.equal(
    f.state.configuredHome,
    "blog",
    "unsaved selector draft is separate",
  );
  f.state.item.domain.externally_hosted = true;
  preview.state.external = true;
  assert.equal(preview.state.kind, "external");
  assert.equal(f.state.homeLabel, "domains_modern.map.externalHome");
  f.state.item = { official: "local", enable: true };
  assert.equal(f.state.configuredHome, "blog");
  f.state.shop.home = null;
  assert.equal(f.state.configuredHome, null);
  preview.state.home = f.state.configuredHome;
  preview.state.external = false;
  assert.equal(preview.state.kind, "shop");
  assert.deepEqual(f.requests, []);
  assert.deepEqual(preview.requests, []);
});

test("customer page illustrations render distinct inert layouts without real data or controls", async () => {
  const f = fixture("BDomainCustomerPreview.vue");
  const { descriptor } = parse(f.source);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: "BDomainCustomerPreview.vue",
    id: "customer-preview-test",
  });
  const rendering = {};
  new Function(
    "require",
    "exports",
    ts.transpileModule(template.code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(() => Vue, rendering);
  const layouts = new Set();
  for (const kind of [
    "shop",
    "blog",
    "community",
    "map",
    "avocado",
    "hyper",
    "landing",
    "static",
    "external",
  ]) {
    const app = Vue.createSSRApp(
      { ...f.component, render: rendering.render },
      { kind },
    );
    app.config.globalProperties.$t = (key) => key;
    const html = await renderToString(app);
    const document = new JSDOM(html).window.document;
    assert.equal(
      document.body.firstElementChild.getAttribute("aria-hidden"),
      "true",
    );
    assert.ok(document.querySelector("svg"), kind);
    assert.equal(
      document.querySelector(
        "button, a, input, textarea, select, form, [tabindex], [href], [src], [contenteditable], [role=button], [aria-live]",
      ),
      null,
      kind,
    );
    for (const svg of document.querySelectorAll("svg"))
      assert.equal(svg.getAttribute("focusable"), "false", kind);
    layouts.add(document.body.textContent + document.body.innerHTML);
  }
  assert.equal(layouts.size, 9);
  assert.deepEqual(f.requests, []);
});

test("overview flow uses real hosting distinctions and keeps responsive snake order", () => {
  const f = fixture("BDomainWorkspaceFlow.vue");
  assert.deepEqual(
    f.state.nodes.map((node) => node.section),
    ["settings", "connection", "storefront", "storefront"],
  );
  f.state.availableWidth = 500;
  assert.equal(f.state.columns, 2);
  assert.deepEqual(
    [0, 1, 2, 3].map((index) => f.state.placement(index)),
    [
      { gridRow: 1, gridColumn: 1 },
      { gridRow: 1, gridColumn: 2 },
      { gridRow: 2, gridColumn: 2 },
      { gridRow: 2, gridColumn: 1 },
    ],
  );
  f.state.item.domain.externally_hosted = true;
  assert.equal(f.state.nodes[2].title, "domains_modern.connection.external");
  assert.equal(f.state.nodes[3].caption, "domains_modern.map.externalHome");
  f.state.item = {
    official: "sub",
    name: "Sub domain",
    url: "https://actual.example.test",
    enable: true,
  };
  assert.equal(f.state.nodes[0].title, "actual.example.test");
});
