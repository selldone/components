import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

function fixture(name = "row", overrides = {}) {
  const files = { table: "./BProductArTable.vue", row: "./row/BProductArTableRow.vue", files: "./files/BProductArFiles.vue", uploader: "../../../../ui/uploader/SArModelUploader.vue" };
  const { descriptor, errors } = parse(readFileSync(new URL(files[name], import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const confirmations = [], requests = [], notices = [], events = [];
  const endpoint = (...values) => "/isolated/" + values.join("/");
  const isolatedWindow = {
    API: { POST_UPLOAD_PRODUCT_3D_MODEL: (...ids) => endpoint("upload", ...ids) },
    CDN: { GET_SHOP_3D_MODEL_PATH: (...ids) => endpoint("files", ...ids) },
    URLS: { ARViewURL: (...ids) => endpoint("preview", ...ids) },
    $backoffice: { product: { ar: { remove: (...ids) => new Promise((resolve, reject) => {
      requests.push({ ids, resolve, reject });
    }) } } },
  };
  const exports = {};
  vm.runInNewContext(compile(descriptor.script.content), {
    exports, console: { ...console, log() {} }, window: isolatedWindow,
    document: { head: { querySelector: () => null } },
    require(path) {
      if (path === "vue") return Vue;
      if (path.includes("FilePondLoader")) return { default: { loadFilePondComponent: () => ({}) } };
      if (path.includes("ShopLicense")) return { Eligible: { CanAdd3DModel: shop => shop.license !== "FREE" } };
      if (path.includes("NotificationService")) return { default: {
        openDangerAlert: (...args) => confirmations.push({ args, confirm: args.at(-1) }),
        showLaravelError: error => notices.push(error),
        showErrorAlert: (...args) => notices.push(args),
      } };
      return { default: {} };
    },
  });
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props || {})
    .filter(([, prop]) => prop?.default !== undefined || prop?.name === "Boolean" || prop?.type?.name === "Boolean")
    .map(([key, prop]) => [key, prop.default === undefined ? false : typeof prop.default === "function" ? prop.default() : prop.default]));
  const product = {
    id: 31, title: "Cat cactus pot", icon: "product.jpg", parent_id: null,
    ar: { src: "main-glb", src_file: "scene.glb", name_src: "main.glb", size_src: 1024 },
    product_variants: [],
  };
  const state = {
    ...defaults, ...component.data?.call(defaults), modern: true, editable: true, enabled: true,
    shop: { id: 42, name: "isolated-shop", license: "ENTERPRISE" }, product, variant: null,
    window: isolatedWindow, $refs: {},
    $emit: (...args) => events.push(args),
    $nextTick: callback => Promise.resolve().then(() => callback.call(state)),
    $t: (key, params = {}) => key + (Object.keys(params).length ? ":" + JSON.stringify(params) : ""),
    $vuetify: { display: { xs: false, smAndUp: true, smAndDown: false }, locale: { isRtl: false } },
    getShopImagePath: value => value, getProductImage: value => value,
    getShopImage: value => value,
    numeralFormat: (value, format) => `${value}:${format}`,
    ...overrides,
  };
  for (const [key, method] of Object.entries(component.methods || {})) state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed || {})) {
    Object.defineProperty(state, key, { configurable: true,
      get: (typeof getter === "function" ? getter : getter.get).bind(state) });
  }
  return { state, component, descriptor, requests, confirmations, notices, events };
}

function renderedNodes({ descriptor, state }) {
  const compiled = compileTemplate({ source: descriptor.template.content, filename: "product-ar-test.vue", id: "product-ar-test" });
  assert.deepEqual(compiled.errors, []);
  const exports = {};
  vm.runInNewContext(compile(compiled.code), { exports, require: () => ({
    ...Vue, resolveComponent: name => ({ name }), resolveDynamicComponent: name => ({ name }), resolveDirective: () => ({}),
    withDirectives: node => node,
  }) });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push({ ...node, type: node.type?.name || node.type });
    visit(node.children);
    if (node.children && !Array.isArray(node.children)) {
      for (const slot of Object.values(node.children)) {
        if (typeof slot === "function") visit(slot({ props: {} }));
      }
    }
  }
  visit(exports.render(state, []));
  return nodes;
}

test("modern AR UI remains opt-in and row access defaults preserve existing callers", () => {
  assert.equal(fixture("table").component.props.modern.default ?? false, false);
  const { component } = fixture();
  assert.equal(component.props.modern.default ?? false, false);
  assert.equal(component.props.enabled.default, true);
  assert.equal(component.props.editable.default, false);
});

test("modern list keeps every variant and counts GLB or USDZ ownership after model updates", () => {
  const f = fixture("table");
  f.state.product.product_variants = [
    { id: 7, product_id: 31, ar: { src: "variant-glb" } },
    { id: 8, product_id: 31, ar: { ios: "variant-ios" } },
    { id: 9, product_id: 31, ar: null },
    { id: 10, product_id: 31, ar: {} },
  ];
  assert.equal(f.state.own_model_count, 2);
  let rows = renderedNodes(f).filter(node => node.type === "b-product-ar-table-row");
  assert.equal(rows.length, 5);
  assert.equal(rows[0].props.variant, undefined);
  assert.ok(rows.every(node => node.props.modern === "" && node.props.enabled && node.props.editable));
  assert.deepEqual(rows.slice(1).map(node => node.props.variant.id), [7, 8, 9, 10]);
  f.state.product.product_variants[2].ar = { src: "new-upload" };
  assert.equal(f.state.own_model_count, 3);
  f.state.product.product_variants[0].ar = null;
  assert.equal(f.state.own_model_count, 2);
  f.state.product.product_variants = undefined;
  assert.equal(f.state.own_model_count, 0);
  rows = renderedNodes(f).filter(node => node.type === "b-product-ar-table-row");
  assert.equal(rows.length, 1);
  assert.equal(f.requests.length, 0);
});

test("modern AR waits for product and shop readiness and resets digest activity when its product changes", () => {
  const f = fixture("table", { product: null, shop: null });
  assert.equal(renderedNodes(f).some(node => node.type === "b-product-ar-table-row"), false);
  f.state.shop = { id: 42, license: "ENTERPRISE" };
  assert.equal(renderedNodes(f).some(node => node.type === "b-product-ar-table-row"), false);
  f.state.product = { id: 31, ar: null, product_variants: [] };
  assert.equal(renderedNodes(f).filter(node => node.type === "b-product-ar-table-row").length, 1);
  f.state.product.product_variants = Array.from({ length: 7 }, (_, index) => ({ id: index + 1, ar: null }));
  let nodes = renderedNodes(f);
  assert.equal(nodes.filter(node => node.type === "b-product-ar-table-row").length, 6);
  const more = () => renderedNodes(f).find(node => node.type === "v-btn" && ["expand_more", "expand_less"].includes(node.props?.["append-icon"]));
  assert.equal(more().props.disabled, false);
  more().props.onClick();
  assert.equal(renderedNodes(f).filter(node => node.type === "b-product-ar-table-row").length, 8);
  f.state.setRowActivity("variant-7", true);
  assert.equal(more().props.disabled, true);
  f.component.watch.workspaceBusy.handler.call(f.state, f.state.workspaceBusy);
  assert.deepEqual(f.events.at(-1), ["activity", true]);
  f.state.product = null; f.component.watch.product.call(f.state);
  f.component.watch.workspaceBusy.handler.call(f.state, f.state.workspaceBusy);
  assert.deepEqual(f.events.at(-1), ["activity", false]);
  assert.equal(f.state.show_all, false);
  assert.equal(renderedNodes(f).some(node => node.type === "b-product-ar-table-row"), false);
  f.state.product = { id: 32, ar: null, product_variants: [] };
  f.state.shop = null;
  assert.equal(renderedNodes(f).some(node => node.type === "b-product-ar-table-row"), false);
});

test("free-license and imported products retain distinct access and license navigation", () => {
  const f = fixture("table");
  f.state.shop.license = "FREE";
  let nodes = renderedNodes(f);
  assert.equal(f.state.can_add_3d_model, false);
  assert.ok(nodes.filter(node => node.type === "b-product-ar-table-row").every(node => !node.props.enabled));
  assert.ok(nodes.some(node => node.props?.to?.name === "BPageShopSettingLicense"));
  f.state.shop.license = "ENTERPRISE";
  f.state.product.parent_id = 99;
  nodes = renderedNodes(f);
  assert.equal(f.state.add_by_dropShipping, true);
  assert.ok(nodes.filter(node => node.type === "b-product-ar-table-row").every(node => node.props.enabled && !node.props.editable));
  assert.equal(nodes.some(node => node.props?.to?.name === "BPageShopSettingLicense"), false);
  f.state.modern = false;
  nodes = renderedNodes(f);
  assert.ok(nodes.some(node => node.type === "v-table"));
  assert.ok(nodes.filter(node => node.type === "b-product-ar-table-row").every(node => !node.props.modern));
});

test("variant fallback follows the complete AR object and never inherits a missing format", () => {
  const f = fixture("row", { variant: { id: 7, ar: null }, expanded: true });
  assert.equal(f.state.inherited_ar, f.state.product.ar);
  assert.ok(renderedNodes(f).some(node => node.children === "product_ar.inherited_note"));
  for (const ar of [{}, { ios: "own-ios" }]) {
    f.state.variant.ar = ar;
    assert.equal(f.state.inherited_ar, null);
    assert.equal(f.state.files.find(file => file.type === "src").available, false);
  }
  f.state.variant.ar = null;
  f.state.product.ar = null;
  assert.equal(f.state.inherited_ar, null);
  assert.ok(renderedNodes(f).some(node => node.children === "product_ar.no_model"));
});

test("main and expandable variant views retain the native variant identity and file owner", () => {
  const main = fixture();
  assert.ok(renderedNodes(main).some(node => node.type === "section" && node.props?.class.includes("b-product-ar-row__main")));
  const f = fixture("row", { variant: { id: 7, color: "#abcdef", style: "floral{asset}", ar: { src: "own-glb" } } });
  let nodes = renderedNodes(f);
  const identity = nodes.find(node => node.type === "variant-item-view-micro");
  assert.equal(identity.props["product-variant"], f.state.variant);
  const expand = nodes.find(node => node.type === "button" && node.props?.["aria-controls"] === f.state.detail_id);
  assert.equal(expand.props["aria-expanded"], false);
  expand.props.onClick();
  nodes = renderedNodes(f);
  assert.equal(f.state.expanded, true);
  assert.ok(nodes.some(node => node.type === "tr" && node.props?.id === f.state.detail_id));
  const fileList = nodes.find(node => node.type === "b-product-ar-files");
  assert.equal(fileList.props.files[0].folder, "own-glb");
  assert.equal(fileList.props.onPreview, f.state.openPreview);
  assert.equal(fileList.props.onUploadBusy, f.state.setUploadBusy);
  assert.equal(fileList.props["onUpdate:ar"], f.state.updateAr);
  assert.equal(fileList.props.onRemove, f.state.deleteFile);
});

test("compact variant identity shows its code once and expanded files span all columns", () => {
  const f = fixture("row", { variant: { id: 7, ar: { src: "own-glb" } }, expanded: true });
  const nodes = renderedNodes(f);
  const text = node => typeof node === "string" ? node
    : Array.isArray(node) ? node.map(text).join("")
      : node && typeof node === "object" ? text(node.children) : "";
  const row = nodes.find(node => node.type === "tr" && node.props?.class?.split(" ").includes("b-product-ar-row"));
  const cells = row.children.filter(node => node.type === "td");
  assert.equal(cells.length, 3);
  assert.equal(text(cells[0]).match(/SPV7/g)?.length, 1);
  assert.equal(text(cells.slice(1)).includes("SPV7"), false);
  assert.equal(Number(nodes.find(node => node.props?.id === f.state.detail_id).children[0].props.colspan), 3);
  const table = fixture("table");
  table.state.product.product_variants = [f.state.variant];
  assert.equal(renderedNodes(table).filter(node => node.type === "th").length, 3);
});

test("file metadata keeps distinct format names, original filenames, folder references and sizes", () => {
  const f = fixture("row", { variant: { id: 7, ar: {
    src: "web-folder", ios: "ios-folder", src_file: "scene.glb", ios_file: "scene.usdz",
    name_src: "long-original-web.glb", name_ios: "original-phone.usdz", size_src: 1234, size_ios: 5678,
  } } });
  const [web, ios] = f.state.files;
  assert.equal(web.name, "long-original-web.glb");
  assert.equal(ios.name, "original-phone.usdz");
  assert.equal(web.size, 1234);
  assert.equal(ios.size, 5678);
  assert.equal(web.format, "GLB");
  assert.equal(ios.format, "USDZ");
  assert.match(web.url, /web-folder\/scene.glb\?download=true$/);
  assert.match(ios.url, /ios-folder\/scene.usdz\?download=true$/);
  f.state.enabled = false;
  assert.ok(f.state.files.every(file => file.url === undefined));
});

test("file actions keep GLB-only preview, per-format download/delete and missing-format upload", () => {
  const row = fixture("row", { variant: { id: 7, ar: { src: "web", ios: "phone", size_src: 1234, size_ios: 5678 } } });
  const f = fixture("files", { files: row.state.files });
  let nodes = renderedNodes(f);
  const buttons = () => nodes.filter(node => node.type === "v-btn");
  assert.equal(buttons().filter(node => node.props["aria-label"] === "product_ar.preview").length, 1);
  const downloads = buttons().filter(node => node.props["aria-label"] === "product_ar.download");
  assert.equal(downloads.length, 2);
  assert.ok(downloads.every(node => node.props.target === "_blank" && node.props.rel === "noopener noreferrer"));
  const removes = buttons().filter(node => node.props["aria-label"] === "product_ar.remove");
  removes[1].props.onClick();
  assert.deepEqual(f.events[0], ["remove", "ios"]);
  f.state.files = [{ ...row.state.files[0], available: false }, row.state.files[1]];
  nodes = renderedNodes(f);
  const uploaders = nodes.filter(node => node.type === "s-ar-model-uploader");
  assert.equal(uploaders.length, 2);
  assert.equal(uploaders[0].props["has-file"], false);
  assert.equal(uploaders[1].props["has-file"], true);
  f.state.editable = false;
  nodes = renderedNodes(f);
  assert.equal(buttons().filter(node => node.props["aria-label"] === "product_ar.remove").length, 0);
  assert.equal(buttons().filter(node => node.props["aria-label"] === "product_ar.download").length, 1);
  assert.equal(nodes.filter(node => node.type === "s-ar-model-uploader").length, 0);
  f.state.enabled = false;
  nodes = renderedNodes(f);
  assert.ok(buttons().every(node => node.props.disabled));
  assert.ok(buttons().every(node => !node.props.href));
});

test("modern model files stay inline with independent GLB and USDZ uploads and immediate canonical updates", () => {
  for (const variant of [null, { id: 7, ar: { src: "old-glb", ios: "old-usdz" } }]) {
    const f = fixture("row", { variant });
    f.state.product.ar.ios = "main-usdz";
    const originalMain = f.state.product.ar;
    f.state.openEditor("ios");
    const nodes = renderedNodes(f);
    assert.equal(f.state.item_edit, false);
    assert.equal(f.state.expanded, true);
    assert.equal(nodes.some(node => node.type === "v-dialog" && node.props.modelValue), false);
    assert.equal(nodes.some(node => node.type === "s-ar-model-uploader"), false);
    const fileList = nodes.find(node => node.type === "b-product-ar-files");
    const fileFixture = fixture("files", { files: fileList.props.files, ar: fileList.props.ar });
    const uploaders = renderedNodes(fileFixture).filter(node => node.type === "s-ar-model-uploader");
    assert.equal(uploaders.length, 2);
    for (const [index, type] of ["src", "ios"].entries()) {
      assert.equal(uploaders[index].props.modern, "");
      assert.equal(uploaders[index].props["max-file-size"], "20MB");
      assert.equal(uploaders[index].props.server, `/isolated/upload/42/31/${type}/${variant?.id ?? ""}`);
      assert.equal(typeof uploaders[index].props["onUpdate:ar"], "function");
    }
    assert.equal(nodes.some(node => node.type === "v-btn-toggle"), false);
    if (!variant) assert.ok(nodes.some(node => node.children === "product_ar.upload_immediate"));

    const oldIos = f.state.ar.ios;
    const afterWebUpload = { ...f.state.ar, src: "new-glb", src_file: "scene.glb" };
    uploaders[0].props["onUpdate:ar"](afterWebUpload);
    assert.equal(fileFixture.events.at(-1)[0], "update:ar");
    fileList.props["onUpdate:ar"](fileFixture.events.at(-1)[1]);
    assert.equal(f.state.ar.ios, oldIos);
    const afterIosUpload = { ...f.state.ar, ios: "new-usdz", ios_file: "scene.usdz" };
    uploaders[1].props["onUpdate:ar"](afterIosUpload);
    fileList.props["onUpdate:ar"](fileFixture.events.at(-1)[1]);
    assert.equal(f.state.ar.src, "new-glb");
    assert.equal(f.state.ar.ios, "new-usdz");
    assert.equal(f.state.item_edit, false);
    const refreshedFiles = renderedNodes(f).find(node => node.type === "b-product-ar-files");
    const refreshedUploaders = renderedNodes(fixture("files", { files: refreshedFiles.props.files, ar: refreshedFiles.props.ar })).filter(node => node.type === "s-ar-model-uploader");
    assert.ok(refreshedUploaders.every(node => node.props.ar === afterIosUpload));
    if (variant) assert.equal(f.state.product.ar, originalMain);
    assert.equal(f.requests.length, 0);
  }
  const f = fixture();
  f.state.openPreview();
  assert.equal(f.state.show, true);
  assert.equal(renderedNodes(f).find(node => node.type === "iframe").props.src, "/isolated/preview/isolated-shop/31/default/main-glb?preview=modern&lang=en");

  const legacy = fixture("row", { modern: false, file_type: "ios", item_edit: true });
  const legacyNodes = renderedNodes(legacy);
  assert.equal(legacyNodes.filter(node => node.type === "s-ar-model-uploader").length, 1);
  assert.ok(legacyNodes.some(node => node.type === "v-btn-toggle"));
  assert.equal(legacyNodes.find(node => node.type === "s-ar-model-uploader").props.server, "/isolated/upload/42/31/ios/");
  assert.ok(legacyNodes.filter(node => node.type === "v-dialog").every(node => ["", true].includes(node.props.fullscreen) && ["", true].includes(node.props.scrollable)));
});

test("denied editors cannot open, expose an upload server or accept a late uploader update", () => {
  for (const override of [{ editable: false }, { enabled: false }, { active: false }]) {
    const f = fixture("row", override), original = f.state.product.ar;
    f.state.openEditor("ios");
    f.state.updateAr({ src: "unexpected" });
    assert.equal(f.state.item_edit, false);
    assert.equal(f.state.server, null);
    assert.equal(f.state.getUploadServer("src"), null);
    assert.equal(f.state.getUploadServer("ios"), null);
    assert.equal(f.state.product.ar, original);
    assert.equal(renderedNodes(f).some(node => node.type === "s-ar-model-uploader"), false);
  }
  const free = fixture("row", { enabled: false });
  free.state.openPreview();
  assert.equal(free.state.show, false);
});

test("upload activity disables only the peer card and each format owns its own busy state", () => {
  const f = fixture();
  f.state.openEditor("src");
  const fileList = () => renderedNodes(f).find(node => node.type === "b-product-ar-files");
  const fileFixture = () => fixture("files", { files: fileList().props.files, ar: fileList().props.ar });
  const uploadersForRow = () => renderedNodes(fileFixture()).filter(node => node.type === "s-ar-model-uploader");
  let uploaders = uploadersForRow();
  assert.ok(uploaders.every(node => node.props.disabled === false));
  uploaders[0].props.onBusy(true);
  fileList().props.onUploadBusy("src", true);
  assert.equal(f.state.upload_busy.src, true);
  assert.equal(f.state.upload_busy.ios, false);
  uploaders = uploadersForRow();
  assert.equal(uploaders[0].props.disabled, false);
  assert.equal(uploaders[1].props.disabled, true);
  f.state.setUploadBusy("ios", true);
  uploaders[0].props.onBusy(false);
  fileList().props.onUploadBusy("src", false);
  assert.equal(f.state.upload_busy.src, false);
  assert.equal(f.state.upload_busy.ios, true);
  uploaders = uploadersForRow();
  assert.equal(uploaders[0].props.disabled, true);
  assert.equal(uploaders[1].props.disabled, false);
  uploaders[1].props.onBusy(false);
  fileList().props.onUploadBusy("ios", false);
  assert.ok(uploadersForRow().every(node => !node.props.disabled));
  assert.equal(f.requests.length, 0);
});

test("native uploader forwards disabled state and releases activity after abort, removal, error and teardown", () => {
  const f = fixture("uploader", { modern: false, server: "/isolated/uploader" });
  assert.equal(f.component.props.disabled.default ?? false, false);
  let pond = renderedNodes(f).find(node => node.type === "file-pond");
  assert.equal(pond.props.disabled, false);
  f.state.disabled = true;
  pond = renderedNodes(f).find(node => node.type === "file-pond");
  assert.equal(pond.props.disabled, true);
  f.state.disabled = false;
  pond = renderedNodes(f).find(node => node.type === "file-pond");
  for (const start of ["onAddfilestart", "onProcessfilestart"]) {
    pond.props[start]();
    assert.deepEqual(f.events.at(-1), ["busy", true]);
  }
  for (const stop of ["onProcessfileabort", "onRemovefile"]) {
    pond.props[stop]();
    assert.deepEqual(f.events.at(-1), ["busy", false]);
  }
  pond.props.onError({ body: "Isolated upload rejected" });
  assert.deepEqual(f.events.at(-1), ["busy", false]);
  assert.deepEqual(f.notices[0], [null, "Isolated upload rejected"]);
  f.component.beforeUnmount.call(f.state);
  assert.deepEqual(f.events.at(-1), ["busy", false]);
});

test("native uploader emits its canonical AR before unlock and failed processing does not emit a replacement", () => {
  const f = fixture("uploader", { modern: false, server: "/isolated/uploader" });
  const pond = renderedNodes(f).find(node => node.type === "file-pond");
  const ar = { src: "saved-glb", ios: "kept-usdz" };
  pond.props.onProcessfile(null, { serverId: JSON.stringify({ files: { path: "isolated-model" }, ar }) });
  const update = f.events.find(([event]) => event === "update:ar");
  assert.deepEqual(JSON.parse(JSON.stringify(update[1])), ar);
  assert.deepEqual(f.events.at(-1), ["busy", false]);
  const updateCount = f.events.filter(([event]) => event === "update:ar").length;
  pond.props.onProcessfile(new Error("Isolated processing failure"), {});
  assert.equal(f.events.filter(([event]) => event === "update:ar").length, updateCount);
  assert.deepEqual(f.events.at(-1), ["busy", false]);
  assert.throws(() => pond.props.onProcessfile(null, { serverId: "{invalid" }), { name: "SyntaxError" });
  assert.equal(f.events.filter(([event]) => event === "update:ar").length, updateCount);
  assert.deepEqual(f.events.at(-1), ["busy", false]);
});

test("modern AR file selection and drop preserve the native single-file upload boundary", async () => {
  const f = fixture("uploader", { modern: true, hasFile: false, format: "GLB", server: "/isolated/ar-upload", maxFileSize: "20MB", label: "Choose GLB" });
  const calls = [];
  f.state.$refs.pond = {
    browse: () => calls.push("browse"),
    addFile: file => { calls.push(file); return Promise.resolve(); },
    getFiles: () => [],
  };
  const picker = () => renderedNodes(f).find(node => node.type === "v-btn" && node.props.onClick === f.state.browseModel);
  const pond = () => renderedNodes(f).find(node => node.type === "file-pond").props;
  assert.equal(f.component.props.modern.default ?? false, false);
  assert.equal(picker().props.disabled, true);
  f.state.browseModel(); f.state.dropModel({ dataTransfer: { files: [{}] } });
  assert.deepEqual(calls, []);
  pond().onInit();
  assert.equal(picker().props.disabled, false);
  picker().props.onClick();
  const first = { name: "first.glb" }, second = { name: "second.glb" };
  await f.state.dropModel({ dataTransfer: { files: [first, second] } });
  assert.deepEqual(calls, ["browse", first]);
  for (const key of ["disabled", "upload_active"]) {
    f.state[key] = true;
    assert.equal(picker().props.disabled, true);
    f.state.browseModel(); f.state.dropModel({ dataTransfer: { files: [second] } });
    assert.deepEqual(calls, ["browse", first], key);
    f.state[key] = false;
  }
  f.state.dropModel({}); f.state.dropModel({ dataTransfer: { files: [] } });
  assert.deepEqual(calls, ["browse", first]);
  assert.equal(pond()["allow-multiple"], false);
  assert.equal(pond()["max-files"], 1);
  assert.equal(pond().maxFileSize, "20MB");
  assert.equal(pond().name, "file");
  assert.equal(pond()["accepted-file-types"], undefined, "The established backend validates AR formats whose browser MIME types vary");
  assert.equal(pond().server.url, "/isolated/ar-upload");
  assert.equal(pond().server.process.method, "POST");
  assert.equal(pond().server.process.withCredentials, true);
  assert.equal(pond().server.revert, null);
  f.state.hasFile = true;
  assert.equal(picker().props.variant, "text", "Replacing a saved model stays a quiet text action");
  f.component.beforeUnmount.call(f.state);
  f.state.browseModel(); f.state.dropModel({ dataTransfer: { files: [second] } });
  assert.deepEqual(calls, ["browse", first]);
});

test("modern AR upload activity follows queued, settled, removed and unmounted native files", async () => {
  const f = fixture("uploader", { modern: true });
  let files = [];
  f.state.$refs.pond = { getFiles: () => files };
  for (const status of [1, 3, 7, 9]) {
    files = [{ status }]; f.state.refreshActivity(); await setImmediate();
    assert.equal(f.state.has_files, true);
    assert.equal(f.state.upload_active, true);
    assert.deepEqual(f.events.at(-1), ["busy", true]);
  }
  for (const status of [2, 5, 6]) {
    files = [{ status }]; f.state.refreshActivity(); await setImmediate();
    assert.equal(f.state.has_files, true, "Native failure, retry and completion rows remain available");
    assert.equal(f.state.upload_active, false);
    assert.deepEqual(f.events.at(-1), ["busy", false]);
  }
  files = []; f.state.refreshActivity(); await setImmediate();
  assert.equal(f.state.has_files, false);
  files = [{ status: 8 }];
  f.state.handleFilePondError({ body: "Isolated validation failed before upload" });
  await setImmediate();
  assert.equal(f.state.has_files, true, "Validation errors retain the native failed file even before upload starts");
  assert.equal(f.state.upload_active, false);
  assert.deepEqual(f.events.at(-1), ["busy", false]);
  files = [{ status: 3 }]; f.state.refreshActivity(); f.component.beforeUnmount.call(f.state);
  assert.deepEqual(f.events.at(-1), ["busy", false]);
  const eventCount = f.events.length;
  await setImmediate();
  assert.equal(f.events.length, eventCount);
});

test("AR workspace activity aggregates each independent row and deletion until every operation finishes", () => {
  const f = fixture("table");
  assert.equal(f.state.workspaceBusy, false);
  f.state.setRowActivity("main", true);
  f.state.setRowActivity("variant-7", true);
  assert.equal(f.state.workspaceBusy, true);
  f.state.setRowActivity("main", false);
  assert.equal(f.state.workspaceBusy, true);
  f.state.setRowActivity("variant-7", false);
  assert.equal(f.state.workspaceBusy, false);
  const row = fixture("row");
  row.state.setUploadBusy("src", true);
  assert.equal(row.state.workspaceBusy, true);
  row.state.setUploadBusy("src", false);
  row.state.busy_delete_ios = true;
  assert.equal(row.state.workspaceBusy, true);
  row.state.busy_delete_ios = false;
  assert.equal(row.state.workspaceBusy, false);
});

test("inline variant controls cannot collapse active uploads, deletes or previews and recover after settling", () => {
  const f = fixture("row", { variant: { id: 7, ar: null }, expanded: true });
  for (const [target, key] of [[f.state.upload_busy, "src"], [f.state.upload_busy, "ios"], [f.state, "busy_delete_src"], [f.state, "busy_delete_ios"], [f.state, "show"]]) {
    target[key] = true;
    assert.equal(f.state.workspaceBusy, true);
    f.component.watch.workspaceBusy.handler.call(f.state, f.state.workspaceBusy);
    assert.deepEqual(f.events.at(-1), ["activity", true]);
    const expanders = renderedNodes(f).filter(node => node.props?.["aria-controls"] === f.state.detail_id);
    assert.equal(expanders.length, 2);
    assert.ok(expanders.every(node => node.props.disabled));
    f.state.toggleExpanded();
    assert.equal(f.state.expanded, true, key);
    target[key] = false;
    f.state.toggleExpanded();
    assert.equal(f.state.expanded, false);
    f.state.toggleExpanded();
    assert.equal(f.state.expanded, true);
  }
  f.component.watch.workspaceBusy.handler.call(f.state, f.state.workspaceBusy);
  assert.deepEqual(f.events.at(-1), ["activity", false]);
});

test("GLB and USDZ upload routes retain the exact shop, product, format and variant scope", () => {
  for (const variant of [null, { id: 7, ar: null }]) {
    const { state, requests } = fixture("row", { variant });
    for (const type of ["src", "ios"]) {
      state.file_type = type;
      assert.equal(state.server, `/isolated/upload/42/31/${type}/${variant?.id ?? ""}`);
    }
    assert.equal(requests.length, 0);
  }
});

test("downloads retain independent filenames, storage folders and legacy fallback names", () => {
  const variant = { id: 7, ar: { src: "variant-glb", ios: "variant-usdz", src_file: "cat.glb", ios_file: "cat.usdz" } };
  const { state } = fixture("row", { variant });
  assert.equal(state.getFileUrl("src"), "/isolated/files/isolated-shop/31/7/variant-glb/cat.glb?download=true");
  assert.equal(state.getFileUrl("ios"), "/isolated/files/isolated-shop/31/7/variant-usdz/cat.usdz?download=true");
  variant.ar = { src: "legacy-glb", ios: "legacy-usdz" };
  assert.equal(state.getFileUrl("src"), "/isolated/files/isolated-shop/31/7/legacy-glb/scene.gltf?download=true");
  assert.equal(state.getFileUrl("ios"), "/isolated/files/isolated-shop/31/7/legacy-usdz/scene.usdz?download=true");
  assert.equal(state.files[0].format, "GLTF");
  assert.equal(state.files[0].name, "scene.gltf");
  const legacyFiles = fixture("files", { files: state.files });
  assert.ok(renderedNodes(legacyFiles).some(node => node.type === "bdi" && node.children === "GLTF"));
  variant.ar.src_file = "original.GLTF";
  assert.equal(state.files[0].format, "GLTF");
  assert.equal(state.files[0].name, "original.GLTF");
  state.variant = null;
  assert.equal(state.getFileUrl("src"), "/isolated/files/isolated-shop/31/default/main-glb/scene.glb?download=true");
  assert.equal(state.getFileUrl("ios"), null);
});

test("preview URLs keep the main/default or exact selected variant's GLB folder", () => {
  const { state, requests } = fixture();
  assert.equal(state.getArViewUrl(), "/isolated/preview/isolated-shop/31/default/main-glb?preview=modern&lang=en");
  state.variant = { id: 7, ar: { src: "variant-glb" } };
  assert.equal(state.getArViewUrl(), "/isolated/preview/isolated-shop/31/7/variant-glb?preview=modern&lang=en");
  state.$i18n = { locale: "fa" };
  assert.equal(state.getArViewUrl(), "/isolated/preview/isolated-shop/31/7/variant-glb?preview=modern&lang=fa");
  state.$i18n.locale = "ar";
  assert.equal(state.getArViewUrl(), "/isolated/preview/isolated-shop/31/7/variant-glb?preview=modern&lang=en");
  state.modern = false;
  assert.equal(state.getArViewUrl(), "/isolated/preview/isolated-shop/31/7/variant-glb");
  state.variant = null;
  assert.equal(state.getArViewUrl(), "/isolated/preview/isolated-shop/31/default/main-glb");
  state.variant = { id: 7, ar: null };
  assert.equal(state.getArViewUrl(), null);
  assert.equal(requests.length, 0);
});

test("modern 3D preview uses a bounded desktop shell and fullscreen tablet and phone shells", () => {
  for (const [xs, smAndDown] of [[false, false], [false, true], [true, true]]) {
    const f = fixture("row", { variant: { id: 7, ar: { src: "variant-glb" } } });
    f.state.$vuetify.display.xs = xs;
    f.state.$vuetify.display.smAndDown = smAndDown;
    assert.equal(renderedNodes(f).some(node => node.type === "iframe"), false);
    f.state.openPreview();
    const nodes = renderedNodes(f);
    const dialog = nodes.find(node => node.type === "v-dialog" && node.props.modelValue);
    assert.equal(dialog.props.fullscreen, smAndDown);
    assert.equal(dialog.props.scrollable, false);
    assert.equal(dialog.props["max-width"], 1180);
    const card = nodes.find(node => node.type === "v-card");
    assert.ok(card.props.class.includes("text-start"));
    const closes = nodes.filter(node => node.type === "v-btn" && node.props?.["aria-label"] === "global.actions.close");
    assert.equal(closes.length, 1, "The preview has one accessible header close action");
    assert.equal(nodes.some(node => node.type === "v-card-title"), false, "A duplicate footer cannot reduce the model stage on mobile");
    const frame = nodes.find(node => node.type === "iframe");
    assert.equal(frame.props.src, "/isolated/preview/isolated-shop/31/7/variant-glb?preview=modern&lang=en");
    assert.equal(frame.props.title, "product_ar.preview_title");
    assert.equal(frame.props.allowfullscreen, "1");
    assert.equal(frame.props.style, undefined, "The modern stage determines iframe size without the legacy 70vh and 320px minimum");
    assert.equal(f.state.workspaceBusy, true);
    closes[0].props.onClick();
    assert.equal(f.state.show, false);
    assert.equal(f.state.workspaceBusy, false);
    assert.equal(renderedNodes(f).some(node => node.type === "iframe"), false, "Closing destroys the WebGL frame");
    f.state.openPreview(); f.state.enabled = false;
    assert.equal(renderedNodes(f).some(node => node.type === "iframe"), false, "A permission loss cannot retain the modern model frame");
  }
  const legacy = fixture("row", { modern: false });
  legacy.state.openPreview();
  const nodes = renderedNodes(legacy);
  const dialog = nodes.find(node => node.type === "v-dialog" && node.props.modelValue);
  assert.equal(dialog.props.fullscreen, true);
  assert.equal(dialog.props.scrollable, true);
  assert.equal(dialog.props["max-width"], undefined);
  assert.equal(nodes.find(node => node.type === "iframe").props.src, "/isolated/preview/isolated-shop/31/default/main-glb");
  assert.equal(nodes.find(node => node.type === "iframe").props.style.height, "70vh");
});

test("native upload completion updates only its product or selected variant and preserves its native workspace", () => {
  for (const variant of [null, { id: 7, ar: null }]) {
    const { state, requests } = fixture("row", { variant });
    const oldProductAr = state.product.ar;
    const result = { src: "saved-glb", ios: "saved-usdz" };
    state.updateAr(result);
    assert.equal(variant ? variant.ar : state.product.ar, result);
    if (variant) assert.equal(state.product.ar, oldProductAr);
    assert.equal(state.item_edit, false);
    assert.equal(requests.length, 0);
  }
  const legacy = fixture("row", { modern: false });
  legacy.state.updateAr({ src: "legacy-upload" });
  assert.equal(legacy.state.item_edit, true);
});

test("write denial cannot open a delete confirmation or issue a request", () => {
  for (const override of [{ editable: false }, { enabled: false }, { active: false }]) {
    const f = fixture("row", override);
    f.state.deleteFile("src");
    f.state.deleteFile("ios");
    assert.equal(f.confirmations.length, 0);
    assert.equal(f.requests.length, 0);
    assert.equal(f.state.busy_delete_src, false);
    assert.equal(f.state.busy_delete_ios, false);
  }
});

test("file removal waits for confirmation and preserves the exact target and other format", async () => {
  for (const format of ["src", "ios"]) {
    for (const variant of [null, { id: 7, ar: { src: "variant-glb", ios: "variant-usdz" } }]) {
      const f = fixture("row", { variant });
      f.state.product.ar.ios = "main-usdz";
      const mainAr = f.state.product.ar;
      f.state.deleteFile(format);
      assert.equal(f.confirmations.length, 1);
      assert.equal(f.requests.length, 0);
      f.confirmations[0].confirm();
      assert.equal(f.state[`busy_delete_${format}`], true);
      assert.deepEqual(Array.from(f.requests[0].ids), [42, 31, format, variant?.id ?? null]);
      const remaining = { [format === "src" ? "ios" : "src"]: "kept-other-format" };
      f.requests[0].resolve({ ar: remaining });
      await setImmediate();
      assert.equal(variant ? variant.ar : f.state.product.ar, remaining);
      if (variant) assert.equal(f.state.product.ar, mainAr);
      assert.equal(f.state.busy_delete_src, false);
      assert.equal(f.state.busy_delete_ios, false);
      assert.equal(f.notices.length, 0);
    }
  }
});

test("access is checked again after the delete confirmation was opened", () => {
  for (const key of ["editable", "enabled"]) {
    const f = fixture();
    const original = f.state.product.ar;
    f.state.deleteFile("src");
    assert.equal(f.confirmations.length, 1);
    f.state[key] = false;
    f.confirmations[0].confirm();
    assert.equal(f.requests.length, 0);
    assert.equal(f.state.product.ar, original);
    assert.equal(f.state.busy_delete_src, false);
  }
});

test("failed deletion keeps the model, reports the native error, unlocks and permits retry", async () => {
  const f = fixture();
  const original = f.state.product.ar, error = new Error("Isolated request rejected");
  f.state.deleteFile("src");
  f.confirmations[0].confirm();
  f.requests[0].reject(error);
  await setImmediate();
  assert.equal(f.state.product.ar, original);
  assert.equal(f.state.busy_delete_src, false);
  assert.equal(f.notices[0], error);
  f.state.deleteFile("src");
  f.confirmations[1].confirm();
  f.requests[1].resolve({ ar: null });
  await setImmediate();
  assert.equal(f.state.product.ar, null);
  assert.equal(f.state.busy_delete_src, false);
});
