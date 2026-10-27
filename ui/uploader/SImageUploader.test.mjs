import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
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
for (const style of descriptor.styles) assert.deepEqual(compileStyle({
  source: style.content, filename, id: "uploader-test", scoped: style.scoped, preprocessLang: style.lang,
}).errors, []);
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
  const exports = {}, events = [], notices = [], calls = [], urls = [], revoked = [];
  let credentialReads = 0;
  vm.runInNewContext(script, {
    exports,
    Blob,
    URL: {
      createObjectURL: (file) => { urls.push(file); return `blob:local-preview-${urls.length}`; },
      revokeObjectURL: (url) => revoked.push(url),
    },
    document: {
      head: { querySelector() { credentialReads++; return { content: "synthetic-csrf" }; } },
      removeEventListener() {},
    },
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
    browse: () => calls.push("browse"),
    addFile: async (file) => { calls.push(file); },
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
  return { component, state, pond, queued, events, notices, calls, urls, revoked, credentialReads: () => credentialReads };
}

async function renderPond(f, props, data = {}) {
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
  const app = Vue.createSSRApp({ ...f.component, data: () => ({ ...f.component.data(), ...data }), components: { FilePond: pond }, render: templateExports.render }, { ...props, ...listeners });
  for (const name of ["VExpandTransition", "VSlideYTransition", "VAvatar", "VImg", "VIcon", "VBtn", "VListItem", "VListItemTitle", "VListItemSubtitle"]) app.component(name, passthrough);
  app.config.globalProperties.$t = (key) => key;
  app.component("VTooltip", Vue.defineComponent({ setup(_, { slots }) { return () => Vue.h("span", null, slots.activator?.({ props: {} })); } }));
  app.directive("intersect", { getSSRProps: () => ({}) });
  f.renderedHtml = await renderToString(app);
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

assert.equal(fixture().component.props.thumbnail.default, false);
{
  const f = fixture({ thumbnail: true, deferUpload: true });
  const props = await renderPond(f, {
    thumbnail: true, deferUpload: true, allowMultiple: true, maxFiles: 4,
    label: "Image", chooseLabel: "Choose image", editLabel: "Edit image", removeLabel: "Remove image", hint: "Up to 2MB.",
  });
  assert.equal(props["allow-multiple"], false);
  assert.equal(props["max-files"], 1);
  assert.equal(typeof props.onInit, "function");
  assert.ok(f.renderedHtml.includes("s-image-uploader__transport"));
  assert.ok(f.renderedHtml.includes("Up to 2MB."));
  assert.ok(!f.renderedHtml.split("uploader-container")[0].includes("global.image_uploader.max_size"), "Custom guidance replaces the visible default limit caption");
  f.state.browseThumbnail();
  assert.deepEqual(f.calls, [], "The native input must be initialized before browsing");
  f.state.thumbnail_ready = true;
  f.state.browseThumbnail();
  assert.deepEqual(f.calls, ["browse"]);
  f.state.disabled = true;
  f.state.browseThumbnail();
  f.state.dropThumbnail({ dataTransfer: { files: [new Blob(["image"])] } });
  assert.deepEqual(f.calls, ["browse"], "Disabled controls cannot choose or drop a file");
}
{
  const f = fixture({ thumbnail: true, deferUpload: true });
  const first = { id: "first", filename: "first.png", file: new Blob(["first"], { type: "image/png" }) };
  const second = { id: "second", filename: "second.png", file: new Blob(["second"], { type: "image/png" }) };
  f.state.handleAddFileStart(first);
  assert.equal(f.state.thumbnail_loading, true);
  f.state.handleAddFile(null, first);
  assert.equal(f.state.thumbnail_loading, false);
  assert.equal(f.state.thumbnailSource, "blob:local-preview-1");
  assert.equal(f.state.thumbnailFilename, "first.png");
  assert.equal(f.calls.length, 0, "Previewing a queued image cannot start an upload");
  await assert.rejects(f.state.processPendingFile(), "A category URL is still required before upload");
  f.state.handleAddFileStart(second);
  assert.deepEqual(f.revoked, ["blob:local-preview-1"]);
  f.state.handleRemoveFile(null, first);
  assert.equal(f.state.thumbnail_file_id, "second", "Late removal of a replaced file cannot clear the new queue");
  f.state.handleAddFile({ main: "Image too large", sub: "Maximum 2MB" }, second);
  assert.equal(f.state.thumbnail_loading, false);
  assert.equal(f.state.thumbnailSource, undefined);
  assert.equal(f.state.thumbnail_error, "Image too large · Maximum 2MB");
  await renderPond(f, { thumbnail: true, deferUpload: true }, { thumbnail_error: f.state.thumbnail_error });
  assert.ok(f.renderedHtml.includes('role="alert"'));
  assert.ok(f.renderedHtml.includes("Maximum 2MB"), "Hidden FilePond validation stays visible");
  f.state.handleRemoveFile(null, second);
  assert.equal(f.state.thumbnail_error, "");
  assert.equal(f.state.thumbnail_file_id, null);
  f.state.handleAddFileStart(second);
  f.state.handleAddFile(null, second);
  assert.equal(f.state.thumbnailSource, "blob:local-preview-2");
  f.component.beforeUnmount.call(f.state);
  assert.deepEqual(f.revoked, ["blob:local-preview-1", "blob:local-preview-2"]);
}
{
  const f = fixture({ thumbnail: true, deferUpload: true, server: "/upload", disabled: true });
  f.state.thumbnail_file_id = f.queued.id;
  let resolve;
  f.pond.processFile = (id) => { f.calls.push(id); return new Promise((yes) => { resolve = yes; }); };
  const uploading = f.state.processPendingFile();
  assert.equal(f.state.thumbnail_processing, true);
  f.state.handleProcessProgress(f.queued, .5);
  await renderPond(f, { thumbnail: true, deferUpload: true }, { thumbnail_processing: true, thumbnail_progress: .5 });
  assert.ok(f.renderedHtml.includes('role="status"'));
  assert.ok(f.renderedHtml.includes("50%"));
  resolve(result());
  assert.deepEqual(plain(await uploading), metadata);
  assert.equal(f.state.thumbnail_processing, false);
  assert.deepEqual(f.calls, [f.queued.id], "One explicit call processes the stable queue once, even while disabled");
  f.queued.status = 6;
  f.pond.processFile = async () => { throw new Error("Upload unavailable"); };
  await assert.rejects(f.state.processPendingFile());
  assert.equal(f.state.thumbnail_processing, false);
  assert.equal(f.state.thumbnail_error, "Upload unavailable");
}
{
  const f = fixture({ thumbnail: true, deferUpload: true });
  f.state.thumbnail_ready = true;
  f.state.thumbnail_file_id = "pending";
  f.state.removeThumbnail();
  assert.deepEqual(plain(f.calls), [{ revert: false }]);
  assert.deepEqual(f.events, [], "The native remove event, rather than a duplicate synthetic event, owns parent queue updates");
}
{
  const f = fixture({ thumbnail: true, image: "/saved.png" });
  f.state.thumbnail_file_id = "uploaded";
  f.state.handleProcessFile(null, { ...result(), id: "uploaded" });
  assert.equal(f.state.thumbnail_file_id, null, "Immediate upload success is a persisted image, rather than a removable pending file");
  await renderPond(f, { thumbnail: true, image: "/saved.png", editLabel: "Edit image", removeLabel: "Remove image" });
  assert.ok(f.renderedHtml.includes("Edit image"));
  assert.ok(!f.renderedHtml.includes("Remove image"), "No delete affordance is offered for an existing image without caller clear support");
}

console.log("SImageUploader: SFC/SCSS compilation, default/deferred behavior, thumbnail preview/browse/error/progress/cleanup, response retry and discard checks passed.");
