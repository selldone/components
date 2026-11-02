import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";

const require = createRequire(import.meta.url);
const filename = new URL("BAppDetailGallery.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const evaluate = (source, globals = {}) => {
  const exports = {};
  vm.runInNewContext(transpile(source), { exports, require, ...globals });
  return exports;
};
const options = evaluate(descriptor.script.content).default;
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "app-gallery-test" });
assert.deepEqual(template.errors, []);
const { render } = evaluate(template.code, { require: () => ({ ...Vue, resolveComponent: name => ({ name }) }) });

// Exercise the real globally installed Core helper with only its CDN boundary replaced.
const coreSource = readFileSync(new URL("../../../../mixin/CoreMixin.ts", import.meta.url), "utf8");
const coreTree = ts.createSourceFile("CoreMixin.ts", coreSource, ts.ScriptTarget.Latest, true);
let imageMethod;
const findImageMethod = node => {
  if (ts.isMethodDeclaration(node) && node.name.getText(coreTree) === "getShopImagePath") imageMethod = node.getText(coreTree);
  ts.forEachChild(node, findImageMethod);
};
findImageMethod(coreTree);
assert.ok(imageMethod);
const paths = [];
const getShopImagePath = evaluate(`export const get = ({ ${imageMethod} }).getShopImagePath;`, {
  window: { CDN: { GET_SHOP_IMAGE_PATH(path) { paths.push(path); return `/synthetic/${path}`; } } },
}).get;
const records = count => Object.freeze(Array.from({ length: count }, (_, index) => Object.freeze({ app_id: 8, path: `image-${index + 1}.webp`, order: index + 1 })));
function fixture(app = { id: 8, name: "Example app", images: [] }, rtl = false) {
  const state = Vue.reactive({ app, $vuetify: { locale: { isRtl: rtl }, theme: { current: { dark: false } } }, getShopImagePath, $t: (key, values = {}) => key === "app_config.gallery_image" ? `Screenshot ${values.current} of ${values.total}` : key === "app_config.gallery_more" ? `View all ${values.total}` : key === "app_config.gallery_title" ? "Screenshots" : key === "app_config.gallery_previews" ? "Previews" : key === "app_config.gallery_count_one" ? `${values.total} image` : key === "app_config.gallery_count" ? `${values.total} images` : key, ...options.data() });
  for (const [name, method] of Object.entries(options.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(options.computed)) Object.defineProperty(state, name, { get: () => getter.call(state) });
  const scope = Vue.effectScope();
  scope.run(() => Vue.watch(() => state.images, options.watch.images.bind(state)));
  const elements = () => {
    const result = [];
    const visit = node => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== "object") return;
      result.push({ ...node, type: node.type?.name || node.type });
      if (Array.isArray(node.children)) visit(node.children);
      else if (node.children && typeof node.children === "object") for (const slot of Object.values(node.children)) if (typeof slot === "function") visit(slot({ props: { onClick: () => { state.viewer = true; } } }));
    };
    visit(render(state, []));
    return result;
  };
  return { state, elements, dispose: () => scope.stop() };
}

test("the mosaic and native viewer templates and scoped styles compile", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({ source: style.content, filename: filename.pathname, id: "app-gallery-test", scoped: style.scoped })).errors, []);
});

test("empty and missing galleries reserve no content; 1/2/3/4/many retain ordered real references", () => {
  for (const app of [null, {}, { images: null }, { images: [] }]) {
    const f = fixture(app);
    assert.equal(f.elements().some(node => node.type === "section"), false);
    f.dispose();
  }
  for (const count of [1, 2, 3, 4, 5, 9]) {
    const images = records(count), f = fixture({ name: "Example app", images });
    assert.deepEqual(f.state.images.map(image => image.path), images.map(image => image.path));
    const elements = f.elements(), tiles = elements.filter(node => node.type === "button");
    assert.equal(tiles.length, Math.min(count, 4));
    assert.equal(tiles[0].props["aria-label"], `Screenshot 1 of ${count}`);
    assert.ok(elements.some(node => node.type === "h2" && node.children === "Previews"));
    assert.ok(elements.some(node => node.type === "span" && node.children === `${count} ${count === 1 ? "image" : "images"}`));
    assert.equal(elements.some(node => node.props?.class === "b-app-gallery__more"), count > 4);
    assert.ok(paths.includes(images[0].path));
    assert.equal(images.length, count);
    f.state.$vuetify.theme.current.dark = true;
    assert.ok(f.elements().some(node => node.type === "section" && node.props.class.includes("b-app-gallery--dark")));
    f.dispose();
  }
});

test("preview activation selects its image, all remaining images are reachable, and navigation stops at each end", () => {
  const f = fixture({ name: "Example app", images: records(7) });
  const tile = f.elements().filter(node => node.type === "button")[3];
  for (const click of [].concat(tile.props.onClick)) click();
  assert.equal(f.state.viewer, true);
  assert.equal(f.state.currentIndex, 3);
  assert.equal(f.state.currentImage.path, "image-4.webp");
  const seen = [];
  f.state.currentIndex = 0;
  for (let index = 0; index < 7; index++) { seen.push(f.state.currentImage.path); f.state.moveImage(1); }
  assert.deepEqual(seen, records(7).map(image => image.path));
  assert.equal(f.state.currentIndex, 6);
  for (let index = 0; index < 8; index++) f.state.moveImage(-1);
  assert.equal(f.state.currentIndex, 0);
  const dialog = f.elements().find(node => node.type === "v-dialog");
  assert.equal(dialog.props.fullscreen, "");
  dialog.props["onUpdate:modelValue"](false);
  assert.equal(f.state.viewer, false);
  f.dispose();
});

test("keyboard navigation mirrors in RTL while Escape remains owned by the native dialog", () => {
  for (const rtl of [false, true]) {
    const f = fixture({ name: "Example app", images: records(3) }, rtl);
    let prevented = 0;
    const key = value => f.state.onViewerKeydown({ key: value, preventDefault: () => prevented++ });
    key(rtl ? "ArrowLeft" : "ArrowRight"); assert.equal(f.state.currentIndex, 1);
    key(rtl ? "ArrowRight" : "ArrowLeft"); assert.equal(f.state.currentIndex, 0);
    key("Escape"); assert.equal(prevented, 2);
    f.dispose();
  }
});

test("replacing app scope or clearing images closes the viewer without retaining the prior selection", async () => {
  const f = fixture({ id: 8, name: "Example app", images: records(5) });
  f.state.viewer = true; f.state.currentIndex = 4;
  f.state.app = { id: 9, name: "Different app", images: records(1) };
  await Vue.nextTick();
  assert.equal(f.state.viewer, false); assert.equal(f.state.currentIndex, 0);
  f.state.viewer = true;
  f.state.app = null;
  await Vue.nextTick();
  assert.equal(f.state.viewer, false); assert.equal(f.state.images.length, 0);
  assert.equal(f.elements().some(node => node.type === "section"), false);
  f.dispose();
});
