import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test, { after } from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import { baseParse, compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

const { descriptor, errors } = parse(readFileSync(new URL("./BProductsWindow.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const script = ts.createSourceFile("window.ts", descriptor.script.content, ts.ScriptTarget.Latest, true);
const options = script.statements.find(ts.isExportAssignment).expression;
const methods = options.properties.find(property => property.name?.getText(script) === "methods").initializer.getText(script);
const transpile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const astNodes = node => [node, ...(node.children || []).flatMap(astNodes)];
const catalog = astNodes(baseParse(descriptor.template.content)).find(node => node.tag === "div" && node.props.some(prop => prop.name === "class" && prop.value?.content === "b-products-window__catalog"));
const helpers = catalog.children.filter(node => node.tag === "v-slide-y-transition" && astNodes(node).some(child => child.tag === "u-drop"));
assert.ok(helpers.length, "Render the actual modern and legacy helper areas");
const render = new Function("Vue", compile(`<div>${helpers.map(node => node.loc.source).join("")}</div>`, { mode: "function", prefixIdentifiers: true }).code)({ ...Vue, resolveComponent: name => ({ name }) });
const titleHelper = Object.getOwnPropertyDescriptor(String.prototype, "limitWords");
Object.defineProperty(String.prototype, "limitWords", { configurable: true, value(count) { return this.split(" ").slice(0, count).join(" "); } });
after(() => titleHelper ? Object.defineProperty(String.prototype, "limitWords", titleHelper) : delete String.prototype.limitWords);
function nodes(node, name) {
  if (Array.isArray(node)) return node.flatMap(child => nodes(child, name));
  if (!node || typeof node !== "object") return [];
  const children = Array.isArray(node.children) ? node.children : typeof node.children?.default === "function" ? node.children.default() : [];
  return [...(name === undefined || node.type === name || node.type?.name === name ? [node] : []), ...nodes(children, name)];
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join(" ");
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  return text(typeof node.children?.default === "function" ? node.children.default() : node.children);
}
const prop = (node, name) => node.props?.[name] ?? node.props?.[name.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)];

function fixture({ vendor = false, bundle = false } = {}) {
  const requests = [], notices = [], commits = [];
  let cacheClears = 0;
  const request = (kind, scope, ...args) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    requests.push({ kind, scope, args, resolve, reject });
    return promise;
  };
  const scope = name => ({ product: { changeCategory: (...args) => request("product", name, ...args) } });
  const routes = name => ({
    PUT_MY_VENDOR_SET_CATEGORY_PARENT: (...ids) => ({ scope: name, ids }),
    PUT_SET_CATEGORY_PARENT: (...ids) => ({ scope: name, ids }),
    POST_MY_VENDOR_CLONE_PRODUCT: (...ids) => ({ scope: name, ids }),
    POST_CLONE_PRODUCT: (...ids) => ({ scope: name, ids }),
  });
  const module = { exports: {} };
  vm.runInNewContext(transpile(`module.exports = ${methods}`), {
    module,
    window: { $backoffice: scope("shop"), $vendor: scope("vendor"), API: routes("shop"), VAPI: routes("vendor") },
    axios: {
      put: (route, body) => request("category", route.scope, ...route.ids, body),
      post: (route, body) => request("copy", route.scope, ...route.ids, body),
    },
    CleanCache: () => cacheClears++,
    NotificationService: {
      showSuccessAlert: (...args) => notices.push(["success", ...args]),
      showErrorAlert: (...args) => notices.push(["error", ...args]),
      showLaravelError: error => notices.push(["failure", error]),
    },
  });
  const state = {
    modern: true, IS_VENDOR_PANEL: vendor, vendor: { id: 9 }, shop: { id: 42 }, current_dir_id: 5,
    drag_bundle_products: bundle, selected_products: [1, 2], arrange_folder_mode: false,
    held_items: [], held_folders: [], products: [], folders: [],
    current_dragged_product: null, current_dragged_folder: null,
    draggable: true, inDragState: true, show_spirit_container: false, parent_folders: { title: "Lighting" },
    $t: (key, params = {}) => `${key}${params.name ? ` ${params.name}` : ""}`, $n: value => String(value),
    $store: { commit: (...args) => commits.push(args) },
    getShopImagePath: icon => icon, IMAGE_SIZE_SMALL: 64, ProductType: { PHYSICAL: { image: "physical.svg" } },
    DeleteItemByID(items, id) { const index = items.findIndex(item => item.id === id); if (index >= 0) items.splice(index, 1); },
    AddOrUpdateItemByID(items, item) { const index = items.findIndex(value => value.id === item.id); if (index >= 0) items[index] = item; else items.push(item); },
  };
  for (const [name, method] of Object.entries(module.exports)) state[name] = method.bind(state);
  return { state, requests, notices, commits, cacheClears: () => cacheClears };
}

test("holding keeps product and category identities separate, deduplicates drops and clears drag feedback without requests", () => {
  const f = fixture(), product = { id: 1, title: "Tote" }, category = { id: 1, title: "Accessories" };
  for (const data of [{ product }, { category }, { product: { ...product } }, { category: { ...category } }]) {
    Object.assign(f.state, { current_dragged_product: product, current_dragged_folder: category,
      current_drop_enter_folder: category, dragOverHolder: true, show_spirit_container: true });
    f.state.handleDropInHolder(data);
    for (const name of ["current_dragged_product", "current_dragged_folder", "current_drop_enter_folder"]) assert.equal(f.state[name], null);
    for (const name of ["dragOverHolder", "show_spirit_container"]) assert.equal(f.state[name], false);
  }
  assert.deepEqual(f.state.held_items, [product]);
  assert.deepEqual(f.state.held_folders, [category]);
  assert.equal(f.state.held_items[0], product);
  assert.equal(f.requests.length, 0);
  assert.equal(f.cacheClears(), 0);
});

for (const vendor of [false, true]) for (const kind of ["product", "category"]) {
  const list = kind === "product" ? "products" : "folders", held = kind === "product" ? "held_items" : "held_folders";
  test(`${vendor ? "vendor" : "shop"} ${kind} moves retain the held item until scoped success, then update the destination`, async () => {
    for (const target of [5, 7]) {
      const f = fixture({ vendor }), item = { id: 1, title: "Held item" };
      f.state[held].push(item);
      if (target !== 5) f.state[list].push(item);
      f.state.handleDropInFolder({ [kind]: item }, { id: target });
      assert.equal(f.requests.length, 1);
      const pending = f.requests[0];
      assert.equal(pending.scope, vendor ? "vendor" : "shop");
      assert.deepEqual(pending.args.slice(0, 2), [vendor ? 9 : 42, 1]);
      if (kind === "product") assert.deepEqual(pending.args.slice(2), [target, null]);
      else assert.equal(pending.args[2].parent_id, target);
      assert.deepEqual(f.state[held], [item], "Do not remove before the request succeeds");
      pending.resolve(kind === "product" ? {} : { data: { error: false } });
      await setImmediate();
      assert.deepEqual(f.state[held], []);
      assert.deepEqual(f.state[list], target === 5 ? [item] : []);
      assert.equal(f.notices[0][0], "success");
      assert.deepEqual(f.commits, kind === "product" ? [["setCutProduct", null]] : []);
    }
  });

  test(`${vendor ? "vendor" : "shop"} failed ${kind} moves keep the item available to retry`, async () => {
    const f = fixture({ vendor }), item = { id: 1 };
    f.state[held].push(item); f.state[list].push(item);
    f.state.handleDropInFolder({ [kind]: item }, { id: 7 });
    const error = new Error("Move rejected");
    f.requests[0].reject(error);
    await setImmediate();
    assert.deepEqual(f.state[held], [item]);
    assert.deepEqual(f.state[list], [item]);
    assert.equal(f.notices[0][1], error);
    assert.deepEqual(f.commits, []);
  });
}

test("category validation errors and self-drops keep held categories", async () => {
  const f = fixture(), category = { id: 1 };
  f.state.held_folders.push(category);
  f.state.handleDropInFolder({ category }, category);
  assert.equal(f.requests.length, 0);
  f.state.handleDropInFolder({ category }, { id: 7 });
  f.requests[0].resolve({ data: { error: true, error_msg: "Parent is not allowed" } });
  await setImmediate();
  assert.deepEqual(f.state.held_folders, [category]);
  assert.deepEqual(f.notices, [["error", null, "Parent is not allowed"]]);
});

test("a bundled product move retains its existing SDK bundle and clears selection only on success", async () => {
  const f = fixture({ bundle: true }), product = { id: 1 };
  f.state.products.push(product, { id: 2 }); f.state.held_items.push(product);
  f.state.handleDropInFolder({ product }, { id: 7 });
  assert.deepEqual(f.requests[0].args, [42, 1, 7, [1, 2]]);
  assert.deepEqual(f.state.selected_products, [1, 2]);
  f.requests[0].resolve({});
  await setImmediate();
  assert.equal(f.state.products.length, 0);
  assert.equal(f.state.selected_products.length, 0);
});

test("native duplication uses the existing scope and leaves the original held product", async () => {
  for (const vendor of [false, true]) {
    const f = fixture({ vendor }), product = { id: 1 }, copy = { id: 2 };
    f.state.held_items.push(product);
    f.state.cloneProduct(product.id);
    assert.equal(f.requests[0].scope, vendor ? "vendor" : "shop");
    assert.equal(f.requests[0].args[0], vendor ? 9 : 42);
    assert.equal(f.requests[0].args[1].product_id, 1);
    assert.equal(f.requests[0].args[1].category_id, undefined);
    f.requests[0].resolve({ data: { error: false, product: copy } });
    await setImmediate();
    assert.deepEqual(f.state.held_items, [product]);
    assert.deepEqual(f.state.products, [copy]);
  }
});

test("the Shelf renders named draggable identities and independent hold/move controls without a copy drop target", async () => {
  const f = fixture(), product = { id: 1, title: "Canvas tote", type: "PHYSICAL" }, category = { id: 3, title: "Accessories" };
  f.state.held_items.push(product); f.state.held_folders.push(category);
  for (const modern of [false, true]) {
    f.state.modern = modern;
    const tree = render(f.state, []), drops = nodes(tree, "u-drop"), drags = nodes(tree, "u-drag");
    assert.equal(drops.length, 1, "An idle holder does not show move destinations");
    assert.deepEqual(drags.map(node => prop(node, "transferData")), [{ category }, { product }]);
    assert.deepEqual(drags.map(node => prop(nodes(node, "circle-image")[0], "size")), [modern ? 44 : 60, modern ? 44 : 60]);
    if (modern) {
      assert.equal(prop(drops[0], "role"), "region");
      assert.equal(prop(drops[0], "ariaLabel"), "products_select.modern.holder.title");
      assert.equal(nodes(tree).filter(node => prop(node, "role") === "listitem").length, 2);
      for (const [index, item] of [category, product].entries()) {
        assert.ok(text(drags[index]).includes(item.title));
        assert.ok(prop(drags[index], "ariaLabel").includes(item.title));
        assert.equal(prop(drags[index], "tabindex"), 0);
      }
    }
  }

  f.state.modern = true;
  const productDrag = nodes(render(f.state, []), "u-drag")[1];
  prop(productDrag, "onDrag")();
  assert.equal(f.state.current_dragged_product, product);
  assert.equal(f.state.show_spirit_container, true);
  const drops = nodes(render(f.state, []), "u-drop");
  assert.equal(drops.length, 2, "The product helper offers only holding and moving");
  for (const drop of drops) assert.equal(nodes(drop, "u-drop").length, 1, "Drop targets must not contain another drop target");
  f.state.modern = false;
  assert.equal(nodes(render(f.state, []), "u-drop").length, 1, "The legacy helper has no copy drop target");
  f.state.modern = true;

  const heldAgain = { id: 4, title: "Glass vase", type: "PHYSICAL" };
  prop(drops[0], "onDrop")({ product: heldAgain });
  assert.deepEqual(f.state.held_items, [product, heldAgain]);
  assert.equal(f.requests.length, 0);
  prop(drops[1], "onDrop")({ product });
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].kind, "product");
  assert.deepEqual(f.requests[0].args, [42, 1, 5, null]);
  f.requests[0].resolve({});
  await setImmediate();
  assert.deepEqual(f.state.held_items, [heldAgain]);
  assert.deepEqual(f.state.held_folders, [category]);

  Object.assign(f.state, { current_dragged_folder: category, current_dragged_product: null, show_spirit_container: true });
  assert.equal(nodes(render(f.state, []), "u-drop").length, 2, "Dragging a category shows hold and move, with no copy target");
});

test("the complete product window template compiles with its holder controls", () => {
  const result = compileTemplate({ source: descriptor.template.content, filename: "BProductsWindow.vue", id: "holder-check" });
  assert.deepEqual(result.errors, []);
});
