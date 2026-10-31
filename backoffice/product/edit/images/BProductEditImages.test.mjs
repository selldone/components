import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const plain = value => JSON.parse(JSON.stringify(value));
const helperExports = {};
vm.runInNewContext(compile(readFileSync(new URL("../../../../ui/youtube/helper/YoutubeHelper.ts", import.meta.url), "utf8")), { exports: helperExports });
const endpoint = scope => new Proxy({}, { get: (_, action) => (...ids) => `/fixture/${scope}/${String(action)}/${ids.join("/")}` });
const files = {
  images: "./BProductEditImages.vue", youtube: "../../../../ui/youtube/preview/UYoutubePreview.vue",
  gallery: "../../images/gallery/BProductImagesGallery.vue", grid: "../../../../ui/uploader/SGalleryUploadGrid.vue",
  video: "../../../../ui/uploader/SVideoUploader.vue",
};

function fixture(name = "images", { modern = true, vendorPanel = false, product = {}, premium = true, ...overrides } = {}) {
  const { descriptor, errors } = parse(readFileSync(new URL(files[name], import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const requests = [], metadata = [], dimensions = [], events = [], notices = [], confirmations = [];
  const context = vm.createContext({
    exports: {}, URL, console: { error() {}, log() {} },
    document: { head: { querySelector: () => null } },
    axios: Object.fromEntries(["post", "delete", "put"].map(method => [method, (url, payload) => new Promise((resolve, reject) => requests.push({ method, url, payload, reject, resolve: data => resolve({ data }) }))])),
    $: { ajax: options => metadata.push(options) },
    window: { API: endpoint("shop"), VAPI: endpoint("vendor"), CDN: { GET_VIDEO_URL: path => `/fixture/video/${path}` }, axios: { defaults: { headers: { common: {} } } } },
    require(path) {
      if (path === "vue") return Vue;
      if (path.includes("YoutubeHelper")) return helperExports;
      if (path.includes("ImageHelper")) return { ImageHelper: class {
        constructor(path) { this.path = path; }
        getImageInfo() { return new Promise((resolve, reject) => dimensions.push({ path: this.path, resolve, reject })); }
      } };
      if (path.includes("ShopLicense")) return { Eligible: { MaxUploadVideosForProduct: shop => shop.videoLimit } };
      if (path.includes("SGridDraggableView")) return { default: { props: { options: { default: () => ({ dragEnabled: true }) } } } };
      if (path.includes("FilePondLoader")) return { default: { loadFilePondComponent: () => ({}) } };
      if (path.includes("NotificationService")) return { default: {
        ...Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map(method => [method, (...args) => notices.push({ method, args })])),
        openDangerAlert: (...args) => confirmations.push(args),
      } };
      return { default: {} };
    },
  });
  vm.runInContext(`{${compile(descriptor.script.content)}\n}`, context);
  const component = context.exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props || {}).filter(([, prop]) => prop?.default !== undefined).map(([key, prop]) => [key, prop.default]));
  const state = {
    ...defaults, ...component.data(), modern,
    product: { id: 31, shop_id: 42, vendor_id: 9, icon: "products/main.webp", style: { contain: false }, video: "dQw4w9WgXcQ", videos: [], images: [], ...product },
    $shop: { id: 42, videoLimit: 2 },
    $route: { params: vendorPanel ? { vendor_id: "9" } : {}, matched: [{ meta: { vendor: vendorPanel } }] },
    $refs: { images: { forceInitializeImages() {} } }, $vuetify: { display: { smAndUp: true }, locale: { isRtl: false } },
    $emit: (...args) => events.push(args), $forceUpdate() {},
    $nextTick: callback => Promise.resolve().then(() => callback.call(state)),
    $t: (key, values = {}) => key + (Object.keys(values).length ? ":" + JSON.stringify(values) : ""),
    getShopImagePath: value => value, numeralFormat: value => String(value),
    USER: () => ({ premium }), showNeedSubscribePremium: () => notices.push({ method: "premium" }),
    AddOrUpdateItemByID(list, value) { const index = list.findIndex(item => item.id === value.id); if (index < 0) list.push(value); else list[index] = value; },
    DeleteItemByID(list, id) { const index = list.findIndex(item => item.id === id); if (index >= 0) list.splice(index, 1); },
    ...overrides,
  };
  for (const [key, method] of Object.entries(component.methods || {})) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed || {})) Object.defineProperty(state, key, { configurable: true, get: getter.bind(state) });
  component.created?.call(state);
  return { state, component, descriptor, requests, metadata, dimensions, events, notices, confirmations, context };
}

function renderedNodes(descriptor, state) {
  const output = compileTemplate({ source: descriptor.template.content, filename: "pictures-fixture.vue", id: "pictures-check" });
  assert.deepEqual(output.errors, []);
  const exports = {};
  vm.runInNewContext(compile(output.code), { exports, require: () => ({
    ...Vue, resolveComponent: name => ({ name }), resolveDynamicComponent: name => ({ name }),
    resolveDirective: () => ({}), withDirectives: node => node,
  }) });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push({ ...node, type: node.type?.name || node.type }); visit(node.children);
    if (node.children?.default) visit(node.children.default({}));
  }
  visit(exports.render(state, []));
  return nodes;
}

test("modern is opt-in and the saved baseline tracks only fit and the canonical YouTube link", () => {
  const { state, component, requests } = fixture();
  assert.equal(component.props.modern.default, false);
  assert.equal(component.props.busySave.default, false);
  assert.equal(state.hasUnsavedChanges, false);
  state.handleProcessFile("products/replacement.webp");
  state.onUploadVideoItem({ id: 8, path: "videos/new.mp4" });
  state.product.images.push({ id: 6, path: "products/gallery.webp" });
  assert.equal(state.hasUnsavedChanges, false, "Already persisted media does not enter the display-settings draft");
  state.video_id = " https://youtu.be/dQw4w9WgXcQ ";
  assert.equal(state.hasUnsavedChanges, false, "Equivalent link formats have the same saved identity");
  state.product.style.contain = true;
  assert.equal(state.hasUnsavedChanges, true);
  state.markSaved();
  assert.equal(state.hasUnsavedChanges, false);
  state.video_id = "9bZkp7q19f0";
  assert.equal(state.hasUnsavedChanges, true);
  assert.equal(requests.length, 0);
});

test("product replacement initializes fit and video without treating the new product as an unsaved draft", () => {
  const { state, component } = fixture("images", { product: { style: [] } });
  assert.deepEqual(plain(state.product.style), { contain: false });
  const previous = state.product;
  state.product = { ...previous, style: null, video: "9bZkp7q19f0" };
  component.watch.product.call(state, state.product, previous);
  assert.equal(state.video_id, "9bZkp7q19f0");
  assert.equal(state.hasUnsavedChanges, false);
});

test("Save & Continue normalizes the real YouTube helper without persisting or marking the draft saved", () => {
  const { state, requests, events } = fixture();
  state.video_id = " https://www.youtube.com/watch?v=9bZkp7q19f0 ";
  state.product.style.contain = true;
  state.submit();
  assert.equal(state.product.video, "9bZkp7q19f0");
  assert.equal(state.video_id, "9bZkp7q19f0");
  assert.equal(events.filter(([name]) => name === "next").length, 1);
  assert.equal(state.hasUnsavedChanges, true, "Only the parent successful PUT may reset the baseline");
  assert.equal(requests.length, 0);
  state.video_id = null;
  assert.equal(state.prepareSave(), true);
  assert.equal(state.product.video, "");
});

test("pending media, parent save and open media dialogs guard both button and external submit", () => {
  const { state, events } = fixture();
  for (const [key, value] of Object.entries({ busy: true, busy_ai: true, busy_upscale: true, busy_main_image_url: true, busy_remove_video: 0, main_uploading: true, video_uploading: true, busySave: true, dialog_main_image_url: true, dialog_replace_bg: true })) {
    const previous = state[key]; state[key] = value;
    assert.equal(state.prepareSave(), false, key);
    state.submit();
    assert.equal(events.some(([name]) => name === "next"), false, key);
    state[key] = previous;
  }
  state.submit();
  assert.equal(events.filter(([name]) => name === "next").length, 1);
});

test("main replacement cancellation resets only the uploader and cannot interrupt an active upload", () => {
  const { state, events } = fixture();
  const icon = state.product.icon;
  state.editing_main_image = true; state.main_uploading = true;
  state.cancelMainReplacement();
  assert.equal(state.main_uploader_key, 0);
  state.main_uploading = false; state.cancelMainReplacement();
  assert.equal(state.main_uploader_key, 1);
  assert.equal(state.editing_main_image, false);
  assert.equal(state.product.icon, icon);
  assert.equal(events.length, 0);
  state.main_uploading = true;
  state.handleProcessFile("products/new.webp");
  assert.equal(state.product.icon, "products/new.webp");
  assert.equal(state.main_uploading, false);
  assert.equal(state.hasUnsavedChanges, false);
  assert.deepEqual(events.at(-1), ["update:icon", "products/new.webp"]);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} URL and video operations retain their immediate scoped endpoints`, async () => {
    const { state, requests, events } = fixture("images", { vendorPanel });
    assert.match(state.upload_video_url, vendorPanel ? /vendor\/POST_MY_VENDOR_PRODUCT_VIDEO_UPLOAD\/9\/31$/ : /shop\/POST_PRODUCT_VIDEO_UPLOAD\/42\/31$/);
    state.showMainImageUrlDialog(); state.main_image_url_input = " https://example.test/image.webp ";
    state.setMainImageUrl();
    assert.match(requests[0].url, vendorPanel ? /vendor\/POST_MY_VENDOR_UPLOAD_PRODUCT_MAIN_IMAGE\/9\/31$/ : /shop\/POST_UPLOAD_PRODUCT_MAIN_IMAGE\/42\/31$/);
    assert.deepEqual(plain(requests[0].payload), { url: "https://example.test/image.webp" });
    assert.equal(state.product.icon, "products/main.webp");
    requests[0].resolve({ files: { path: "products/from-url.webp" } }); await setImmediate();
    assert.equal(state.product.icon, "products/from-url.webp");
    assert.equal(state.dialog_main_image_url, false);
    const video = { id: 8, path: "videos/uploaded.mp4" };
    state.onUploadVideoItem(video); state.removeVideo(video);
    assert.match(requests[1].url, vendorPanel ? /vendor\/DELETE_MY_VENDOR_PRODUCT_VIDEO\/9\/31\/8$/ : /shop\/DELETE_PRODUCT_VIDEO\/42\/31\/8$/);
    assert.equal(state.product.videos.length, 1);
    requests[1].resolve({ id: 8 }); await setImmediate();
    assert.equal(state.product.videos.length, 0);
    assert.equal(state.busy_remove_video, null);
    assert.equal(state.hasUnsavedChanges, false);
    assert.equal(events.some(([name]) => name === "next"), false);
  });
}

test("invalid URLs and failed media operations preserve the existing media and release busy state", async () => {
  const { state, requests, notices } = fixture();
  for (const url of ["javascript:alert(1)", "data:image/png;base64,fixture", "not a URL"]) {
    state.main_image_url_input = url; state.setMainImageUrl();
  }
  assert.equal(requests.length, 0);
  state.main_image_url_input = "https://example.test/fail.webp"; state.setMainImageUrl();
  requests[0].resolve({ error: true, error_msg: "Fixture failure" }); await setImmediate();
  assert.equal(state.product.icon, "products/main.webp");
  assert.equal(state.busy_main_image_url, false);
  const video = { id: 8 }; state.onUploadVideoItem(video); state.removeVideo(video);
  requests[1].reject(new Error("Fixture transport failure")); await setImmediate();
  assert.equal(state.product.videos[0], video);
  assert.equal(state.busy_remove_video, null);
  assert.equal(notices.at(-1).method, "showLaravelError");
});

test("AI eligibility and live digests follow the selected image, studio, vendor and uploaded videos", () => {
  const { state } = fixture();
  assert.equal(state.imageToolsAvailable, true);
  state.need_upscale = true; assert.match(state.imageToolsDigest, /ai.upscale.title/);
  state.need_upscale = false; assert.match(state.imageToolsDigest, /ai.remove_bg.title/);
  state.forStudio = true; assert.equal(state.imageToolsAvailable, false);
  state.forStudio = false; state.product.icon = "https://example.test/image.webp";
  assert.equal(state.imageToolsAvailable, false);
  state.product.icon = null; assert.equal(state.imageToolsAvailable, false);
  assert.equal(fixture("images", { vendorPanel: true }).state.imageToolsAvailable, false);
  state.video_id = ""; assert.match(state.videosDigest, /youtube_empty/);
  state.onUploadVideoItem({ id: 8 }); assert.match(state.videosDigest, /"count":1/);
  state.video_id = "9bZkp7q19f0"; assert.match(state.videosDigest, /youtube_linked/);
});

test("image dimensions ignore stale success, failure and callbacks after unmount", async () => {
  const { state, component, dimensions } = fixture();
  state.product.icon = "products/large.webp"; state.checkNeedsUpscale();
  dimensions[0].resolve({ width: 400, height: 400 }); await setImmediate();
  assert.equal(state.need_upscale, false);
  dimensions[1].resolve({ width: 1600, height: 1200 }); await setImmediate();
  assert.equal(state.need_upscale, false);
  state.product.icon = "products/small.webp"; state.checkNeedsUpscale();
  dimensions[2].resolve({ width: 1200, height: 600 }); await setImmediate();
  assert.equal(state.need_upscale, true);
  state.checkNeedsUpscale(); state.checkNeedsUpscale();
  dimensions[3].reject(new Error("Older image failed")); await setImmediate();
  dimensions[4].resolve({ width: 600, height: 600 }); await setImmediate();
  assert.equal(state.need_upscale, true);
  state.checkNeedsUpscale(); component.beforeUnmount.call(state);
  dimensions[5].resolve({ width: 200, height: 200 }); await setImmediate();
  assert.equal(state.need_upscale, false);
});

test("AI main replacement requires confirmation and premium while Reimagine adds a gallery image immediately", async () => {
  const { state, requests, confirmations } = fixture();
  state.removeBackground();
  assert.equal(requests.length, 0);
  confirmations[0][3]();
  assert.match(requests[0].url, /POST_AI_REMOVE_BACKGROUND_PRODUCT_MAIN_IMAGE\/42\/31$/);
  requests[0].resolve({ product: { icon: "products/transparent.webp" } }); await setImmediate();
  assert.equal(state.product.icon, "products/transparent.webp");
  state.prompt = "Fixture studio"; state.replaceBackground();
  assert.deepEqual(plain(requests[1].payload), { prompt: "Fixture studio" });
  requests[1].resolve({ image: { id: 17, path: "products/generated.webp" } }); await setImmediate();
  assert.equal(state.product.icon, "products/transparent.webp");
  assert.equal(state.product.images[0].id, 17);
  assert.equal(state.hasUnsavedChanges, false);
  const free = fixture("images", { premium: false });
  free.state.removeBackground(); free.state.replaceBackground();
  assert.equal(free.requests.length, 0);
  assert.equal(free.notices.filter(item => item.method === "premium").length, 2);
});

test("the actual modern template binds immediate upload callbacks and defers its sole Save action", () => {
  const { state, descriptor, events } = fixture();
  const nodes = renderedNodes(descriptor, state);
  const uploader = nodes.find(node => node.type === "s-image-uploader");
  assert.equal(uploader.props.modern, "");
  uploader.props.onNewPath("products/rendered.webp");
  assert.equal(state.product.icon, "products/rendered.webp");
  const save = nodes.filter(node => node.props?.["aria-keyshortcuts"] === "Control+s");
  assert.equal(save.length, 1);
  save[0].props.onClick();
  assert.equal(events.filter(([name]) => name === "next").length, 1);
  state.externalActionButtons = true;
  assert.equal(renderedNodes(descriptor, state).filter(node => node.props?.["aria-keyshortcuts"] === "Control+s").length, 0);
  state.forStudio = true;
  assert.equal(renderedNodes(descriptor, state).some(node => node.type === "u-youtube-preview"), false);
});

test("YouTube metadata ignores older results and completion while preserving the current request", () => {
  const { state, component, metadata } = fixture("youtube", { videoId: "dQw4w9WgXcQ" });
  assert.equal(component.props.modern.default, false);
  assert.equal(metadata.length, 1);
  state.videoId = "9bZkp7q19f0"; component.watch.videoId.call(state);
  metadata[0].success({ title: "Old", thumbnail_url: "old.webp" }); metadata[0].complete();
  assert.equal(state.title, null); assert.equal(state.busy, true);
  metadata[1].success({ title: "Current", author_name: "Fixture", thumbnail_url: "new.webp" }); metadata[1].complete();
  assert.equal(state.title, "Current"); assert.equal(state.busy, false);
  assert.match(metadata[1].url, /9bZkp7q19f0/);
  assert.equal(metadata[1].method, "GET");
});

test("invalid YouTube IDs clear metadata without requesting and unmount invalidates pending callbacks", () => {
  const { state, component, metadata } = fixture("youtube", { videoId: "9bZkp7q19f0" });
  state.videoId = "invalid"; state.fetch();
  assert.equal(state.is_valid, false); assert.equal(metadata.length, 1); assert.equal(state.busy, false);
  metadata[0].success({ title: "Old" }); assert.equal(state.title, null);
  state.videoId = "dQw4w9WgXcQ"; state.fetch(); component.beforeUnmount.call(state);
  metadata[1].success({ title: "After unmount" }); metadata[1].complete();
  assert.equal(state.title, null);
  assert.equal(metadata.length, 2);
});

test("YouTube modern fallback keeps source identity and an accessible secure external link", () => {
  const { state, descriptor } = fixture("youtube", { videoId: "9bZkp7q19f0" });
  const nodes = renderedNodes(descriptor, state);
  assert.ok(nodes.some(node => node.children === "9bZkp7q19f0"));
  const link = nodes.find(node => node.props?.href);
  assert.equal(link.props.target, "_blank");
  assert.equal(link.props.rel, "noopener noreferrer");
  assert.ok(link.props["aria-label"]);
  assert.equal(nodes.find(node => node.type === "u-avatar-folder").props.size, 48);
});

test("the actual workspace opts both Add and Edit Pictures into the shared modern editor", () => {
  const { descriptor, errors } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  function findImages(node) { if (node.tag === "b-product-edit-images") return node; for (const child of node.children || []) { const found = findImages(child); if (found) return found; } }
  const element = findImages(descriptor.template.ast);
  assert.ok(element);
  const exports = {};
  vm.runInNewContext(compile(descriptor.script.content), { exports, require: path => path === "vue" ? Vue : { default: {} } });
  for (const [modern, modernGeneral, expected] of [[true, false, true], [false, true, true], [false, false, false]]) {
    const state = { modern, modernGeneral, modernWorkspace: exports.default.computed.modernWorkspace.call({ modern, modernGeneral }), $product: { id: 31 }, busy: true, TAB_IMAGES: 5, setStepEditor() {}, nextStep() {} };
    const editor = renderedNodes({ template: { content: element.loc.source } }, state).find(node => node.type === "b-product-edit-images");
    assert.equal(editor.props.modern, expected);
    assert.equal(editor.props["busy-save"], true);
  }
});

test("Edit Pictures waits for the actual parent PUT success before advancing and resetting its dirty baseline", async () => {
  const { state: editor, context, requests } = fixture();
  const { descriptor } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
  context.exports = {};
  vm.runInContext(`{${compile(descriptor.script.content)}\n}`, context);
  const component = context.exports.default;
  const workspace = {
    modern: false, modernGeneral: true, modernWorkspace: true, busy: false, disposed: false,
    step: 5, hasStep__Inputs: true, active_editor: editor, stepEditors: { 5: editor },
    shop: { id: 42 }, IS_VENDOR_PANEL: false, $product: editor.product,
    $t: key => key, $emit() {},
  };
  for (const [key, method] of Object.entries(component.methods)) workspace[key] = method.bind(workspace);
  workspace.getRenderedOnGoogle = () => {};
  Object.defineProperty(editor, "busySave", { get: () => workspace.busy });
  editor.product.style.contain = true; editor.video_id = "https://youtu.be/9bZkp7q19f0";
  editor.dialog_main_image_url = true; workspace.nextStep();
  assert.equal(requests.length, 0);
  editor.dialog_main_image_url = false; workspace.nextStep();
  assert.equal(requests[0].method, "put");
  assert.match(requests[0].url, /shop\/PUT_EDIT_PRODUCT\/42\/31$/);
  assert.equal(requests[0].payload.video, "9bZkp7q19f0");
  assert.equal(requests[0].payload.style.contain, true);
  assert.equal(workspace.step, 5);
  assert.equal(editor.hasUnsavedChanges, true);
  workspace.nextStep(); assert.equal(requests.length, 1);
  requests[0].resolve({ error: true, error_msg: "Fixture validation failure" }); await setImmediate();
  assert.equal(workspace.step, 5); assert.equal(editor.hasUnsavedChanges, true); assert.equal(workspace.busy, false);
  workspace.nextStep();
  requests[1].resolve({ product: { ...editor.product } }); await setImmediate();
  assert.equal(workspace.step, 6);
  assert.equal(editor.hasUnsavedChanges, false);
  assert.equal(workspace.busy, false);
});

test("pending gallery work and parent saves prevent conflicting modern actions and display edits", () => {
  const { state, descriptor, requests, confirmations } = fixture();
  state.gallery_activity.busy = true;
  assert.equal(state.prepareSave(), false);
  state.gallery_activity.busy = false; state.gallery_activity.dialog = true;
  assert.equal(state.prepareSave(), false);
  state.gallery_activity.dialog = false; state.busySave = true;
  state.removeBackground(); state.removeBackgroundNow(); state.upscaleImage(); state.replaceBackground();
  state.main_image_url_input = "https://example.test/image.webp"; state.setMainImageUrl(); state.removeVideo({ id: 9 });
  assert.equal(requests.length, 0); assert.equal(confirmations.length, 0);
  const nodes = renderedNodes(descriptor, state);
  assert.equal(nodes.find(node => node.type === "u-smart-toggle").props.disabled, true);
  assert.equal(nodes.find(node => node.type === "v-text-field").props.disabled, true);
  assert.equal(nodes.find(node => node.type === "s-image-uploader").props.disabled, true);
});

for (const vendorPanel of [false, true]) {
  test(`${vendorPanel ? "vendor" : "shop"} gallery ALT and order saves persist independently with bounded ALT validation`, async () => {
    const image = { id: 7, variant_id: null, order: 0, alt: "Original", path: "products/gallery.webp" };
    const { state, component, requests, events } = fixture("gallery", { vendorPanel, product: { images: [image] } });
    assert.equal(component.props.modern.default, false);
    state.showEditAlt(image); state.alt_input = "x".repeat(257); state.saveAlt();
    assert.equal(requests.length, 0);
    state.alt_input = "Fixture caption"; state.saveAlt(); state.saveAlt();
    assert.equal(requests.length, 1);
    assert.match(requests[0].url, vendorPanel ? /vendor\/PUT_MY_VENDOR_PRODUCT_IMAGE_ALT\/9\/31\/7$/ : /shop\/PUT_PRODUCT_IMAGE_ALT\/42\/31\/7$/);
    assert.deepEqual(plain(requests[0].payload), { alt: "Fixture caption" });
    assert.equal(state.product.images[0].alt, "Original");
    requests[0].resolve({ image: { ...image, alt: "Fixture caption" } }); await setImmediate();
    assert.equal(state.product.images[0].alt, "Fixture caption"); assert.equal(state.dialog_alt, false);
    state.saveOrders([{ id: 7, order: 2 }]);
    assert.equal(state.mediaBusy, true);
    assert.match(requests[1].url, vendorPanel ? /vendor\/PUT_MY_VENDOR_PRODUCT_IMAGES_ORDER\/9\/31$/ : /shop\/PUT_PRODUCT_IMAGES_ORDER\/42\/31$/);
    assert.equal(state.product.images[0].order, 0);
    requests[1].resolve({}); await setImmediate();
    assert.equal(state.product.images[0].order, 2); assert.equal(state.mediaBusy, false);
    assert.equal(events.some(([name]) => name === "next"), false);
  });
}

test("gallery AI excludes vendors and external image references before any request", () => {
  for (const [vendorPanel, path] of [[true, "products/gallery.webp"], [false, "https://example.test/gallery.webp"]]) {
    const { state, requests } = fixture("gallery", { vendorPanel });
    state.showBackgroundRemove({ id: 7, path }); state.removeBackground({ id: 7, path });
    assert.equal(state.dialog_bg_remove, false); assert.equal(requests.length, 0);
  }
  const { state, events } = fixture("gallery");
  state.gallery_activity.busy = true; state.emitActivity();
  assert.deepEqual(plain(events.at(-1)), ["activity", { busy: true, dialog: false }]);
  state.gallery_activity.busy = false; state.dialog_alt = true; state.emitActivity();
  assert.deepEqual(plain(events.at(-1)), ["activity", { busy: false, dialog: true }]);
});

test("Pictures alone opts into six-dot drag handles and keyboard arrangement persists each move immediately", () => {
  const images = [{ id: 7, order: 0 }, { id: 8, order: 1 }, { id: 9, order: 2 }];
  const { state, component, events } = fixture("grid", { images, hasAlt: true });
  assert.equal(component.props.modern.default, false);
  assert.equal(state.modernProductGallery, true);
  assert.equal(state.grid_options.dragHandle, ".s-gallery-upload-grid__handle");
  const item = id => { const element = { getAttribute: name => name === "image_id" ? String(id) : null }; return { _element: element, getElement: () => element }; };
  const items = images.map(image => item(image.id));
  state.$refs.grid_container = { grid: { getItems: () => items, move(from, to) { items.splice(to, 0, items.splice(from, 1)[0]); } } };
  state.showOrderDialog(); assert.equal(state.dialog_order, true);
  state.moveImage(8, -1);
  assert.deepEqual(plain(events.at(-1)), ["update:orders", [{ id: 8, order: 0 }, { id: 7, order: 1 }, { id: 9, order: 2 }]]);
  assert.deepEqual(state.orderedImages.map(image => image.id), [8, 7, 9]);
  const count = events.length; state.moveImage(8, -1); state.moveImage(9, 1);
  assert.equal(events.length, count);
  state.suppress_handle_click = true; state.dialog_order = false; state.onHandleClick({ detail: 1 });
  assert.equal(state.dialog_order, false, "Drag release does not also open Arrange");
  state.suppress_handle_click = true; state.onHandleClick({ detail: 0 }); assert.equal(state.dialog_order, true);
  const generic = fixture("grid", { images, hasAlt: false });
  assert.equal(generic.state.modernProductGallery, false); assert.equal(generic.state.grid_options.dragHandle, undefined);
  generic.state.showOrderDialog(); assert.equal(generic.state.dialog_order, false);
  const legacy = fixture("grid", { images, hasAlt: true, modern: false });
  assert.equal(legacy.state.grid_options, undefined);
});

test("gallery delete success updates its immediate list while failed removal retains it", async () => {
  const images = [{ id: 7, order: 0 }, { id: 8, order: 1 }];
  const { state, requests, events } = fixture("grid", { images, hasAlt: true, deletePath: image => `/fixture/delete/${image.id}` });
  const removed = [];
  const items = images.map(image => ({ getElement: () => ({ getAttribute: () => String(image.id) }) }));
  state.$refs.grid_container = { getItems: () => items, remove: item => removed.push(item) };
  state.deleteAppImage(images[0], 0);
  assert.equal(state.mediaBusy, true, "The first row uses index zero, which is still busy");
  requests[0].resolve({ error: true, error_msg: "Fixture failure" }); await setImmediate();
  assert.equal(events.length, 0); assert.equal(removed.length, 0); assert.equal(state.mediaBusy, false);
  state.deleteAppImage(images[0], 0); requests[1].resolve({ id: 7 }); await setImmediate();
  assert.deepEqual(events.find(([name]) => name === "update:images")[1].map(image => image.id), [8]);
  assert.equal(removed[0], items[0]);
  assert.equal(events.some(([name]) => name === "next"), false);
});

test("gallery upload activity follows all native queued and processing files without leaking after unmount", async () => {
  const { state, component } = fixture("grid", { images: [], hasAlt: true });
  let files = [{ status: 5 }, { status: 3 }];
  state.$refs.uploader = { $refs: { pond: { getFiles: () => files } } };
  state.refreshUploadBusy(); await setImmediate(); assert.equal(state.mediaBusy, true);
  files = [{ status: 5 }]; state.refreshUploadBusy(); await setImmediate(); assert.equal(state.mediaBusy, false);
  files = [{ status: 3 }]; state.refreshUploadBusy(); component.beforeUnmount.call(state);
  await setImmediate(); assert.equal(state.mediaBusy, false);
});

test("video FilePond activity stays pending across queued files and reports completion after emitting the immediate item", async () => {
  const { state, events } = fixture("video");
  let files = [{ status: 9 }, { status: 3 }];
  state.$refs.pond = { getFiles: () => files };
  state.refreshActivity(); await setImmediate(); assert.deepEqual(events.at(-1), ["activity", true]);
  files = [{ status: 5 }];
  state.handleProcessFile(null, { serverId: JSON.stringify({ files: { path: "videos/new.mp4", url: "/fixture/video", item: { id: 8 } } }) });
  assert.equal(events.find(([name]) => name === "new-item")[1].id, 8);
  await setImmediate(); assert.deepEqual(events.at(-1), ["activity", false]);
});

test("video upload abort/error refreshes native activity and its input honors disabled", async () => {
  const { state, descriptor, events, notices } = fixture("video", { disabled: true });
  let files = [{ status: 3 }]; state.$refs.pond = { getFiles: () => files };
  const pond = renderedNodes(descriptor, state).find(node => node.type === "file-pond");
  assert.equal(pond.props.disabled, true);
  pond.props.onProcessfilestart(); await setImmediate(); assert.deepEqual(events.at(-1), ["activity", true]);
  files = [{ status: 2 }]; pond.props.onProcessfileabort(); await setImmediate(); assert.deepEqual(events.at(-1), ["activity", false]);
  files = [{ status: 6 }];
  state.handleFilePondError({ body: "Fixture upload failed" }); await setImmediate();
  assert.equal(notices.at(-1).method, "showErrorAlert"); assert.deepEqual(events.at(-1), ["activity", false]);
});
