import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import { parse } from "@vue/compiler-sfc";
import { debounce } from "lodash-es";
import ts from "typescript";

const dom = new JSDOM('<div id="app"></div>');
for (const key of ["window", "document", "Element", "HTMLElement", "SVGElement", "Node"]) globalThis[key] = dom.window[key];
const require = createRequire(import.meta.url), Vue = require("vue");
const { descriptor, errors } = parse(readFileSync(new URL("./SPwaVersionCheck.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function fixture(version = "1227", remote = "1228") {
  const exports = {}, requests = [], failures = [];
  const setup = { PWAVersion: () => version };
  vm.runInNewContext(compiled.outputText, {
    exports, console: { style() {} }, window,
    axios: { get: async (url) => { requests.push(url); return { data: { version: remote } }; } },
    require(name) {
      if (name === "lodash-es") return { debounce: (fn) => debounce(fn, 5) };
      if (name.includes("SetupService")) return { SetupService: setup };
      if (name.includes("NotificationService")) return { default: { showLaravelError: (error) => failures.push(error) } };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  const component = { ...exports.default, render: () => Vue.h("div") };
  const app = Vue.createApp(component);
  const host = document.createElement("div");
  document.body.append(host);
  const instance = app.mount(host);
  return { instance, requests, failures, setup, unmount: () => { app.unmount(); host.remove(); } };
}
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

test("unmount cancels the pending version request", async () => {
  const page = fixture();
  page.unmount();
  await settle();
  assert.deepEqual(page.requests, []);
});

test("lost version metadata skips the delayed request", async () => {
  const page = fixture();
  page.setup.PWAVersion = () => null;
  await settle();
  assert.deepEqual(page.requests, []);
  assert.deepEqual(page.failures, []);
  page.unmount();
});

test("a mounted page still checks its version and shows the update state", async () => {
  const page = fixture();
  await settle();
  assert.deepEqual(page.requests, ["/check/version?v=1227"]);
  assert.equal(page.instance.new_version, true);
  assert.deepEqual(page.failures, []);
  page.unmount();
});
