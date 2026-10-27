import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import ts from "typescript";

// Compile the real component, using only a synthetic local FilePond API and credentials.
const filename = fileURLToPath(new URL("./SImageUploader.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiled = compileScript(descriptor, { id: "uploader-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename,
  id: "uploader-test",
  compilerOptions: { bindingMetadata: compiled.bindings },
});
assert.deepEqual(template.errors, []);
const transpile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const script = transpile(descriptor.script.content);
const templateExports = {};
vm.runInNewContext(transpile(template.code), {
  exports: templateExports,
  require: (name) => { assert.equal(name, "vue"); return Vue; },
});
const plain = (value) => JSON.parse(JSON.stringify(value));
const metadata = { path: "shops_7_blog-categories_cover.png", url: "/cover.png", size: 123, name: "cover.png", item: null };
const result = (response = { success: true, files: metadata }) => ({ serverId: JSON.stringify(response) });

function fixture(props = {}) {
  const exports = {}, events = [], notices = [], calls = [];
  let credentialReads = 0;
  vm.runInNewContext(script, {
    exports,
    document: { head: { querySelector() { credentialReads++; return { content: "synthetic-csrf" }; } } },
    window: { axios: { defaults: { headers: { common: { Authorization: "synthetic-auth" } } } } },
    require(name) {
      if (name.includes("NotificationService")) return { default: {
        showErrorAlert: (...args) => notices.push(args),
        showLaravelError: (...args) => notices.push(args),
      } };
      if (name.includes("FilePondLoader")) return { default: { loadFilePondComponent: () => ({}) } };
      assert.equal(name, "lodash-es");
      return { isString: (value) => typeof value === "string" };
    },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props).map(([key, value]) => [key, value.default]));
  const queued = { id: "local-file", status: 2 };
  const pond = {
    getFiles: () => [queued],
    processFile: async (id) => { calls.push(id); return result(); },
    removeFiles: (options) => { calls.push(options); },
    abortProcessing: () => { throw new Error("Cancellation must not await an abort promise"); },
  };
  const state = {
    ...defaults, ...component.data(), ...props,
    $refs: { pond },
    $emit: (...args) => events.push(args),
    $nextTick: (callback) => callback(),
    $t: (key) => key,
  };
  for (const [key, method] of Object.entries(component.methods)) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed)) Object.defineProperty(state, key, { get: () => getter.call(state) });
  return { component, state, pond, queued, events, notices, calls, credentialReads: () => credentialReads };
}

async function renderPond(f, props) {
  let attributes;
  const passthrough = Vue.defineComponent({ setup(_, { slots }) { return () => Vue.h("div", null, slots.default?.()); } });
  const pond = Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs }) { attributes = attrs; return () => Vue.h("div"); },
  });
  const listeners = Object.fromEntries(f.component.emits.map((name) => [
    `on${name[0].toUpperCase()}${name.slice(1)}`,
    (...args) => f.events.push([name, ...args]),
  ]));
  const app = Vue.createSSRApp({ ...f.component, components: { FilePond: pond }, render: templateExports.render }, { ...props, ...listeners });
  for (const name of ["VExpandTransition", "VSlideYTransition", "VAvatar", "VImg", "VIcon", "VBtn", "VListItem", "VListItemTitle", "VListItemSubtitle"]) app.component(name, passthrough);
  app.config.globalProperties.$t = (key) => key;
  app.directive("intersect", { getSSRProps: () => ({}) });
  await renderToString(app);
  assert.ok(attributes, "The existing FilePond input remains available");
  return attributes;
}

assert.equal(fixture().component.props.deferUpload.default, false);
for (const deferUpload of [false, true]) {
  const f = fixture({ deferUpload });
  const props = await renderPond(f, { deferUpload, disabled: true });
  assert.equal(props["instant-upload"], !deferUpload);
  assert.equal(props["allow-process"], !deferUpload);
  assert.equal(props.disabled, true);
  assert.equal(f.calls.length, 0, "Choosing a local file does not invoke manual processing");
  const file = { id: "selected" }, error = new Error("Invalid image");
  props.onAddfilestart(file);
  props.onAddfile(null, file);
  props.onRemovefile(error, file);
  assert.deepEqual(f.events.map(([name]) => name), ["onAddFileStart", "onAddFile", "onRemoveFile"]);
  assert.equal(f.events[0][1], file);
  assert.equal(f.events[1][1].error, null);
  assert.equal(f.events[1][1].file, file);
  assert.equal(f.events[2][1].error, error);
  assert.equal(f.events[2][1].file, file);
  if (deferUpload) assert.equal(props.server, null);
  else assert.equal(props.server.revert, null);
}

{
  const f = fixture({ deferUpload: true });
  assert.equal(f.state.server_credential, null);
  assert.equal(f.credentialReads(), 0, "No upload configuration or credential lookup is needed before creation");
  await assert.rejects(f.state.processPendingFile());
  assert.equal(f.calls.length, 0);
  f.state.server = "/shops/7/blog/categories/12/icon";
  const server = f.state.server_credential;
  assert.equal(server.url, f.state.server);
  assert.equal(server.process.method, "POST");
  assert.equal(server.process.withCredentials, true);
  assert.equal(server.process.headers["X-CSRF-TOKEN"], "synthetic-csrf");
  assert.equal(server.process.headers.Authorization, "synthetic-auth");
  assert.equal(server.revert, null, "Retrying a completed malformed response cannot issue a revert request");
}

for (const status of [2, 5, 6]) {
  const f = fixture({ deferUpload: true, server: "/upload", disabled: true });
  f.queued.status = status;
  assert.deepEqual(plain(await f.state.processPendingFile()), metadata);
  assert.deepEqual(f.calls, ["local-file"]);
  assert.deepEqual(f.events, [], "Deferred results are consumed directly by the authorized caller");
}

for (const files of [[], [{ status: 2 }, { status: 2 }], ...[0, 1, 3, 4, 7, 8, 9].map((status) => [{ id: "local-file", status }])]) {
  const f = fixture({ deferUpload: true, server: "/upload" });
  f.pond.getFiles = () => files;
  await assert.rejects(f.state.processPendingFile());
  assert.equal(f.calls.length, 0, "Loading, invalid and multiple-file queues must not start processing");
}
for (const props of [{ server: "/upload" }, { deferUpload: true }]) {
  const f = fixture(props);
  await assert.rejects(f.state.processPendingFile());
  assert.equal(f.calls.length, 0);
}
{
  const f = fixture({ deferUpload: true, server: "/upload" });
  f.state.$refs.pond = null;
  await assert.rejects(f.state.processPendingFile());
}

for (const response of [null, true, "text", [], {}, { error: true, files: metadata }, { success: false, files: metadata }, { files: [] }, { files: {} }, { files: { path: 12 } }, { files: { path: "   " } }]) {
  const f = fixture({ deferUpload: true, server: "/upload" });
  f.pond.processFile = async () => result(response);
  await assert.rejects(f.state.processPendingFile(), "Malformed and failed 2xx payloads are not image success");
  assert.equal(f.pond.getFiles()[0], f.queued, "An invalid response retains the queued file for retry");
}
for (const response of [undefined, [], {}, { serverId: "not-json" }]) {
  const f = fixture({ deferUpload: true, server: "/upload" });
  f.pond.processFile = async () => response;
  await assert.rejects(f.state.processPendingFile());
}
{
  const f = fixture({ deferUpload: true, server: "/upload" });
  f.pond.processFile = async () => { throw new Error("Upload unavailable"); };
  await assert.rejects(f.state.processPendingFile());
  assert.equal(f.pond.getFiles()[0], f.queued);
  f.queued.status = 6;
  f.pond.processFile = async () => result();
  assert.deepEqual(plain(await f.state.processPendingFile()), metadata);
  f.queued.status = 5;
  f.pond.processFile = async () => result({ error: true });
  await assert.rejects(f.state.processPendingFile());
  f.pond.processFile = async () => result();
  assert.deepEqual(plain(await f.state.processPendingFile()), metadata, "A bad 2xx completion can retry the same local file");
}

for (const files of [metadata, [metadata]]) {
  const f = fixture();
  f.state.force_edit = true;
  assert.equal(f.state.handleProcessFile(null, result({ success: true, files })), true);
  assert.equal(f.state.force_edit, false);
  assert.deepEqual(plain(f.events), [["response", { success: true, files }], ["new-path", metadata.path], ["new-url", metadata.url]],
    "Existing immediate single/multiple-file response events remain intact");
}
{
  const f = fixture();
  f.state.force_edit = true;
  f.state.handleProcessFile(new Error("Upload unavailable"));
  assert.deepEqual(f.events, []);
  assert.equal(f.state.force_edit, true);
}
{
  const f = fixture({ deferUpload: true });
  f.state.force_edit = true;
  assert.doesNotThrow(() => f.state.handleProcessFile(null, { serverId: "not-json" }));
  f.state.handleProcessFile(new Error("Old failure"));
  assert.deepEqual(f.events, [], "Delayed deferred events cannot mutate a closed/replaced parent editor");
  assert.equal(f.state.force_edit, true);
}
{
  const f = fixture({ deferUpload: true });
  const pending = new Promise(() => {});
  f.pond.removeFiles = (options) => { f.calls.push(options); return pending; };
  assert.equal(f.state.discardPendingFile(), pending, "Discard does not await FilePond abort completion");
  assert.deepEqual(plain(f.calls), [{ revert: false }]);
  f.state.$refs.pond = null;
  assert.equal(f.state.discardPendingFile(), undefined);
}

console.log("SImageUploader: SFC compilation, deferred queue/configuration, readiness, response validation/retry, default events and discard checks passed.");
