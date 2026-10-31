import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";

function compile(name) {
  const file = new URL(name, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "import-processing-test" });
  const template = compileTemplate({ source: descriptor.template.content, filename: file.pathname, id: "import-processing-test", compilerOptions: { bindingMetadata: script.bindings } });
  assert.deepEqual(template.errors, []);
  return { script, template };
}
const { script, template } = compile("./BShopProductsImportProcessing.vue");
const iconSource = compile("./BShopProductsImportProcessingIcon.vue");
const transpile = (source) => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const settle = async () => { await Vue.nextTick(); await new Promise(setImmediate); await Vue.nextTick(); };
const element = (type, text = "") => ({ type, text, props: {}, style: {}, children: [], parent: null });
const remove = (node) => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); node.parent = null; };
const renderer = Vue.createRenderer({
  createElement: element, createText: (text) => element("text", text), createComment: (text) => element("comment", text),
  insert(node, parent, anchor = null) { remove(node); const index = anchor ? parent.children.indexOf(anchor) : -1; parent.children.splice(index < 0 ? parent.children.length : index, 0, node); node.parent = parent; },
  remove, setText(node, text) { node.text = text; }, setElementText(node, text) { node.text = text; node.children = []; },
  patchProp(node, key, previous, next) { node.props[key] = next; }, parentNode: (node) => node.parent,
  nextSibling: (node) => node.parent?.children[node.parent.children.indexOf(node) + 1] || null,
});
const descendants = (node) => [node, ...node.children.flatMap(descendants)];
const text = (node) => node.type === "comment" ? "" : node.text + node.children.map(text).join(" ");
const stub = (name) => ({ name, inheritAttrs: false, setup: (_, { attrs, slots }) => () => Vue.h(name, attrs, slots.default?.()) });
const copy = {
  "product_import_processing.refined_title": "Import in progress",
  "product_import_processing.refined_subtitle": "Products and images are being processed.",
};

function fakeClock() {
  let now = 0, nextId = 1;
  const active = new Map();
  const cleared = [];
  return {
    active, cleared,
    setInterval(callback, delay) { const id = nextId++; active.set(id, { callback, delay, due: now + delay }); return id; },
    clearInterval(id) { cleared.push(id); active.delete(id); },
    advance(milliseconds) {
      const target = now + milliseconds;
      while (true) {
        const next = [...active.values()].filter((timer) => timer.due <= target).sort((a, b) => a.due - b.due)[0];
        if (!next) break;
        now = next.due;
        next.due += next.delay;
        next.callback();
      }
      now = target;
    },
  };
}

async function fixture(t, { modern = false, vendor = false, products = 12, images = 7 } = {}) {
  const calls = { requests: [], notifications: [], errors: [], warnings: [] };
  const clock = fakeClock();
  const info = (scope) => (id) => new Promise((resolve, reject) => calls.requests.push({ scope, id, resolve, reject }));
  const window = { $backoffice: { product: { importer: { info: info("shop") } } }, $vendor: { product: { importer: { info: info("vendor") } } } };
  const require = (name) => {
    if (name === "vue") return Vue;
    if (name.includes("NotificationService")) return { default: { showLaravelError: (error) => calls.notifications.push(error) } };
    if (name.endsWith("BShopProductsImportProcessingIcon.vue")) return { default: { ...load(iconSource.script.content).default, render: load(iconSource.template.code).render } };
    throw new Error(`Unexpected processing dependency: ${name}`);
  };
  const load = (source) => { const exports = {}; vm.runInNewContext(transpile(source), { exports, require, window, setInterval: clock.setInterval, clearInterval: clock.clearInterval }); return exports; };
  const component = { ...load(script.content).default, render: load(template.code).render };
  const shop = Vue.reactive({ id: 42, importing: products, "images-que": images });
  const collapsed = Vue.ref(false);
  const app = renderer.createApp({ render: () => Vue.h("div", [
    collapsed.value
      ? Vue.h("button", { "aria-label": "Expand import progress", onClick: () => { collapsed.value = false; } }, "Expand")
      : Vue.h(component, { shop, modern }, { default: () => Vue.h("button", { "aria-label": "Collapse import progress", onClick: () => { collapsed.value = true; } }, "Collapse") }),
  ]) });
  Object.assign(app.config.globalProperties, {
    $route: { params: vendor ? { vendor_id: 73 } : { shop_id: 42 }, matched: [{ meta: { vendor } }] },
    $t: (key) => copy[key] ?? key,
    numeralFormat: (value) => String(value),
  });
  for (const match of template.code.matchAll(/_resolveComponent\("([^"]+)"\)/g)) app.component(match[1], stub(match[1]));
  app.config.errorHandler = (error) => calls.errors.push(error);
  app.config.warnHandler = (warning) => calls.warnings.push(warning);
  const root = element("root");
  app.mount(root); await settle();
  let mounted = true;
  const unmount = () => { if (mounted) { app.unmount(); mounted = false; } };
  t.after(() => { unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); assert.equal(clock.active.size, 0); });
  const links = () => descendants(root).filter((node) => node.props.to?.name);
  const click = async (label) => { const button = descendants(root).find((node) => node.props["aria-label"] === label); assert.ok(button, label); button.props.onClick(); await settle(); };
  return { root, shop, calls, clock, links, click, unmount };
}

const productRoute = (vendor) => vendor ? "VendorProductsImportQuePage" : "BPageShopProductsProductsQue";
const imageRoute = (vendor) => vendor ? "VendorProductsImageImportQuePage" : "BPageShopProductsImagesQue";
const modes = [false, true];

test("legacy and Refined preserve queue states/routes, visible processing copy and accessible outline icons", async (t) => {
  for (const modern of modes) for (const vendor of modes) for (const [products, images] of [[12, 7], [12, 0], [0, 7], [0, 0]]) {
    const f = await fixture(t, { modern, vendor, products, images });
    assert.deepEqual(f.links().map((node) => node.props.to.name), [products && productRoute(vendor), images && imageRoute(vendor)].filter(Boolean));
    if (products) {
      const link = f.links().find((node) => node.props.to.name === productRoute(vendor));
      assert.match(text(link), /global\.commons\.products/);
      assert.match(text(link), /12/);
    }
    if (images) {
      const link = f.links().find((node) => node.props.to.name === imageRoute(vendor));
      assert.match(text(link), /global\.commons\.images/);
      assert.match(text(link), /7/);
    }
    assert.equal(descendants(f.root).some((node) => node.props["aria-label"] === "Collapse import progress"), Boolean(products || images));
    if (modern && (products || images)) {
      const nodes = descendants(f.root);
      const title = nodes.find((node) => /^(h[1-6]|p)$/.test(node.type) && text(node).trim() === copy["product_import_processing.refined_title"]);
      const subtitle = nodes.find((node) => node.type === "p" && text(node) === copy["product_import_processing.refined_subtitle"]);
      assert.ok(title, "The processing title remains in the visible content");
      assert.ok(subtitle, "The processing subtitle remains in the visible content");
      for (const node of [title, subtitle]) {
        assert.ok(!node.props.hidden && node.props["aria-hidden"] !== "true");
        assert.notEqual(node.style.display, "none");
      }
      const icons = nodes.filter((node) => node.type === "svg");
      assert.equal(icons.length, 1 + 2 * f.links().length, "Leading refresh plus queue and navigation icons");
      assert.ok(nodes.indexOf(icons[0]) < nodes.indexOf(title), "Refresh precedes the status copy");
      for (const icon of icons) {
        assert.equal(icon.props.viewBox, "0 0 24 24");
        assert.equal(icon.props.fill, "none");
        assert.equal(icon.props.stroke, "currentColor");
        assert.equal(String(icon.props["stroke-width"]), "2");
        assert.equal(String(icon.props["aria-hidden"]), "true");
        assert.equal(String(icon.props.focusable), "false");
        assert.ok(descendants(icon).some((node) => ["path", "polyline", "rect", "circle", "line"].includes(node.type)), "Outline geometry is rendered");
      }
    }
  }
});

test("mount reads immediately, polls every 30 seconds, prevents overlapping reads and applies both counts", async (t) => {
  for (const modern of modes) for (const vendor of modes) {
    const f = await fixture(t, { modern, vendor });
    assert.equal(f.calls.requests.length, 1);
    assert.equal(f.calls.requests[0].scope, vendor ? "vendor" : "shop");
    assert.equal(f.calls.requests[0].id, vendor ? 73 : 42);
    assert.deepEqual([...f.clock.active.values()].map((timer) => timer.delay), [30_000]);
    f.clock.advance(29_999); assert.equal(f.calls.requests.length, 1);
    f.clock.advance(1); assert.equal(f.calls.requests.length, 1, "pending initial request prevents overlap");
    f.calls.requests[0].resolve({ importing: 4, "images-que": 2 }); await settle();
    assert.equal(f.shop.importing, 4); assert.equal(f.shop["images-que"], 2);
    assert.match(text(f.links()[0]), /4/); assert.match(text(f.links()[1]), /2/);
    f.clock.advance(29_999); assert.equal(f.calls.requests.length, 1);
    f.clock.advance(1); assert.equal(f.calls.requests.length, 2);
    f.clock.advance(60_000); assert.equal(f.calls.requests.length, 2, "a pending poll also prevents overlap");
    f.calls.requests[1].resolve({ importing: 0, "images-que": 1 }); await settle();
    assert.equal(f.shop.importing, 0); assert.equal(f.shop["images-que"], 1);
    assert.deepEqual(f.links().map((node) => node.props.to.name), [imageRoute(vendor)]);
  }
});

test("failed reads retain displayed counts, notify through the existing service and permit the next poll", async (t) => {
  for (const modern of modes) for (const vendor of modes) {
    const f = await fixture(t, { modern, vendor });
    const error = new Error("Synthetic queue-info failure");
    f.calls.requests[0].reject(error); await settle();
    assert.deepEqual(f.calls.notifications, [error]);
    assert.equal(f.shop.importing, 12); assert.equal(f.shop["images-que"], 7);
    assert.equal(f.links().length, 2);
    f.clock.advance(30_000); assert.equal(f.calls.requests.length, 2);
    f.calls.requests[1].resolve({ importing: 5, "images-que": 3 }); await settle();
    assert.equal(f.shop.importing, 5); assert.equal(f.shop["images-que"], 3);
    assert.equal(f.calls.notifications.length, 1);
  }
});

test("both queues reaching zero hides the summary and stops subsequent polling", async (t) => {
  for (const modern of modes) for (const vendor of modes) {
    const f = await fixture(t, { modern, vendor });
    f.calls.requests[0].resolve({ importing: 0, "images-que": 0 }); await settle();
    assert.equal(f.links().length, 0);
    assert.equal(descendants(f.root).some((node) => node.props["aria-label"] === "Collapse import progress"), false);
    assert.equal(f.clock.active.size, 0);
    f.clock.advance(120_000); assert.equal(f.calls.requests.length, 1);
  }
});

test("unmount clears the polling interval even while a read is pending", async (t) => {
  for (const modern of modes) for (const vendor of modes) {
    const f = await fixture(t, { modern, vendor });
    f.unmount();
    assert.equal(f.clock.active.size, 0);
    assert.ok(f.clock.cleared.length);
    f.clock.advance(90_000); assert.equal(f.calls.requests.length, 1);
    f.calls.requests[0].resolve({ importing: 3, "images-que": 1 }); await settle();
    assert.equal(f.clock.active.size, 0);
  }
});

test("the caller-owned collapse slot stops polling and expanding remounts an immediate fresh read", async (t) => {
  for (const modern of modes) {
    const f = await fixture(t, { modern });
    f.calls.requests[0].resolve({ importing: 8, "images-que": 3 }); await settle();
    await f.click("Collapse import progress");
    assert.equal(f.links().length, 0); assert.equal(f.clock.active.size, 0);
    f.clock.advance(90_000); assert.equal(f.calls.requests.length, 1);
    await f.click("Expand import progress");
    assert.equal(f.calls.requests.length, 2); assert.equal(f.clock.active.size, 1);
    assert.equal(f.links().length, 2);
    f.calls.requests[1].resolve({ importing: 6, "images-que": 2 }); await settle();
    assert.equal(f.shop.importing, 6); assert.equal(f.shop["images-que"], 2);
  }
});
