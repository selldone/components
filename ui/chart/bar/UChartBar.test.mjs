import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import { JSDOM } from "jsdom";
import ts from "typescript";

const file = new URL("./UChartBar.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "bar-zero-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "bar-zero-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
const style = await compileStyleAsync({
  source: descriptor.styles[0].content,
  filename: file.pathname,
  id: "bar-zero-test",
  scoped: true,
  preprocessLang: "scss",
});
assert.deepEqual(style.errors, []);
const wrapper = Vue.defineComponent({
  inheritAttrs: false,
  setup:
    (_, { slots }) =>
    () =>
      Vue.h("span", {}, slots.default?.()),
});
function evaluate(source) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require: (name) => {
        if (name === "vue") return Vue;
        if (name.includes("DateConverter"))
          return {
            DateConverter: {
              ConvertTimestampToShortString: () => "Oct 1",
              isToday: () => false,
            },
          };
        return { default: wrapper };
      },
    },
  );
  return exports;
}
const component = evaluate(descriptor.script.content).default;
const render = evaluate(template.code).render;
async function fixture(
  dataset,
  { fit = true, grouped = false, selected = null } = {},
) {
  let context;
  const start = new Date("2026-10-01T12:00:00Z");
  start.addDays = (days) => new Date(start.getTime() + days * 86400000);
  const app = Vue.createSSRApp(
    {
      ...component,
      data: () => ({
        ...component.data(),
        uid: "bar-fixture",
        selected,
        index: selected ? 0 : null,
        show_tooltip: !!selected,
      }),
      render(...args) {
        context = this;
        return render.apply(this, args);
      },
    },
    {
      dataset,
      fit,
      grouped,
      colors: ["#1976d2", "#c2185b"],
      labels: ["Visits", "Orders"],
      startDate: start,
      height: 28,
      showTitle: false,
      hideDates: true,
    },
  );
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    numeralFormat: (value) => String(value),
    getLocalDateString: (date) => date.toISOString().slice(0, 10),
  });
  app.component("v-icon", wrapper);
  app.component("v-spacer", wrapper);
  app.component("v-tooltip", wrapper);
  const html = await renderToString(app);
  const document = new JSDOM(html).window.document;
  return { context, document, html };
}
const plain = (value) => JSON.parse(JSON.stringify(value));
function barNodes(node, out = []) {
  if (!node || typeof node !== "object") return out;
  if (Vue.normalizeClass(node.props?.class).split(" ").includes("--bars"))
    out.push(node);
  if (Array.isArray(node.children))
    node.children.forEach((child) => barNodes(child, out));
  return out;
}

test("observed zero fit histories have one neutral reference without fake bars or changed values", async () => {
  for (const grouped of [false, true]) {
    const dataset = Array.from({ length: 30 }, () => [0, 0]);
    const { context, document, html } = await fixture(dataset, {
      grouped,
      selected: [0, 0],
    });
    assert.equal(
      document.querySelectorAll(".x--chart-bar--zero .--plot").length,
      1,
    );
    assert.equal(document.querySelectorAll(".--bars").length, 30);
    assert.equal(document.querySelectorAll(".--bar").length, 60);
    document
      .querySelectorAll(".--bar")
      .forEach((bar) => assert.equal(bar.style.height, "0%"));
    assert.deepEqual(plain(context.normalized), dataset);
    assert.deepEqual(plain(context.maxs), [0, 0]);
    assert.ok(html.includes("Visits: 0"));
    assert.ok(html.includes("Orders: 0"));
    assert.ok(html.includes("2026-10-01"));
    const targets = barNodes(context.$.subTree);
    assert.equal(targets.length, 30);
    targets[1].props.onFocus();
    await Vue.nextTick();
    assert.equal(context.index, 1);
    assert.deepEqual(plain(context.selected), [0, 0]);
    assert.equal(context.show_tooltip, true);
    assert.equal(targets[1].props.tabindex, 0);
    assert.ok(
      targets[1].props["aria-label"].includes(
        "2026-10-02. Visits: 0, Orders: 0",
      ),
    );
    targets[1].props.onKeydown({ key: "Escape" });
    assert.equal(context.show_tooltip, false);
  }
  assert.match(
    style.code,
    /x--chart-bar--fit\.x--chart-bar--zero\s+\.--plot[^{}]*::after/,
  );
  assert.match(
    style.code,
    /border-block-end:\s*1px solid rgba\(var\(--v-theme-on-surface\), 0\.22\)/,
  );
  assert.match(style.code, /pointer-events:\s*none/);
});

test("unknown slots stay hidden and all-unknown or empty data has no zero reference", async () => {
  for (const dataset of [[], [[null], [null]], [[undefined]], [[NaN]]]) {
    const { context, document } = await fixture(dataset);
    assert.equal(document.querySelector(".x--chart-bar--zero"), null);
    assert.equal(context.zero_baseline, false);
  }
  const mixed = await fixture([[0], [null]], { selected: [null] });
  assert.equal(mixed.context.zero_baseline, true);
  assert.deepEqual(plain(mixed.context.normalized), [[0], [null]]);
  assert.equal(
    mixed.document.querySelectorAll(".--bar")[1].style.visibility,
    "hidden",
  );
  assert.ok(mixed.html.includes("—"));
  assert.equal(
    mixed.document.querySelectorAll(".--bars")[1].getAttribute("aria-label"),
    "2026-10-02. Visits: —",
  );
});

test("nonzero, signed and legacy histories retain their existing geometry and tooltip values", async () => {
  for (const dataset of [[[0], [4]], [[0], [-2]], [["0"]]]) {
    const { context, document } = await fixture(dataset);
    assert.equal(context.zero_baseline, false);
    assert.equal(document.querySelector(".x--chart-bar--zero"), null);
  }
  const positive = await fixture([[0], [4]], { selected: [4] });
  assert.deepEqual(plain(positive.context.normalized), [[0], [100]]);
  assert.equal(
    positive.document.querySelectorAll(".--bar")[1].style.height,
    "100%",
  );
  assert.deepEqual(plain(positive.context.selected), [4]);
  const legacy = await fixture([[0], [0]], { fit: false });
  assert.equal(legacy.document.querySelector(".x--chart-bar--fit"), null);
  assert.equal(legacy.document.querySelector(".x--chart-bar--zero"), null);
  assert.deepEqual(plain(legacy.context.normalized), [[0], [0]]);
  assert.equal(
    legacy.document.querySelector(".--bars").getAttribute("tabindex"),
    null,
  );
  assert.equal(legacy.document.querySelector(".--bar").style.padding, "1px");
  assert.equal(legacy.document.querySelector(".--bar").style.margin, "0px 1px");
});
