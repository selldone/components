import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Synthetic baskets only: no requests, delivery changes or live output values.
const states = Object.fromEntries(
  [
    "CheckQueue",
    "OrderConfirm",
    "PreparingOrder",
    "SentOrder",
    "ToCustomer",
  ].map((code) => [code, { code }]),
);
const Basket = {
  PhysicalOrderStates: states,
  Status: { Payed: { code: "Payed" } },
};
const plain = (value) => JSON.parse(JSON.stringify(value));
const sourceFile = fileURLToPath(
  new URL("./BOrderDashboardVirtualPreparing.vue", import.meta.url),
);
function resolveModule(name) {
  const resolved = ts.resolveModuleName(
    name,
    sourceFile,
    {
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      allowImportingTsExtensions: true,
    },
    ts.sys,
  ).resolvedModule;
  assert.ok(resolved, `The real module must resolve: ${name}`);
  return readFileSync(resolved.resolvedFileName, "utf8");
}
function evaluate(source, require) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, require },
  );
  return exports;
}
// Real enum exports and DateMixin catch missing module exports or local mixins.
const productTypes = evaluate(
  resolveModule("@selldone/core-js/enums/product/ProductType"),
  (name) => {
    if (name.endsWith(".svg"))
      return { default: `/fixture/${name.split("/").at(-1)}` };
    if (name === "../../models") return { Basket };
    throw new Error(`Unexpected enum import: ${name}`);
  },
);
const DateConverter = {
  convertToLocalTime: (value) => new Date(value),
  GetLocalTimeString: (value) => `local:${value}`,
};
const dateMixin = evaluate(
  resolveModule("@selldone/components-vue/mixin/date/DateMixin.ts"),
  (name) => {
    if (name === "@selldone/core-js/helper/date/DateConverter")
      return { DateConverter };
    throw new Error(`Unexpected date mixin import: ${name}`);
  },
).default;
const countdown = {
  props: ["end"],
  render() {
    return Vue.h("time", { datetime: this.end.toISOString() }, "countdown");
  },
};
async function load(file) {
  const filename = new URL(file, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: filename.pathname,
    id: "virtual-preparation-test",
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: filename.pathname,
      id: "virtual-preparation-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
  const component = evaluate(descriptor.script.content, (name) => {
    if (name === "@selldone/core-js") return { Basket };
    if (name === "@selldone/core-js/enums/product/ProductType")
      return productTypes;
    if (name === "@selldone/components-vue/mixin/date/DateMixin.ts")
      return { default: dateMixin };
    if (name.includes("DateConverter")) return { DateConverter };
    if (name.includes("UCountDown.vue")) return { default: countdown };
    throw new Error(`Unexpected import: ${name}`);
  }).default;
  component.render = evaluate(template.code, () => Vue).render;
  return component;
}
const preparation = await load("./BOrderDashboardVirtualPreparing.vue");
const autoComplete = await load(
  "../../../../storefront/order/auto-complete/SOrderDeliveryAutoComplete.vue",
);
const fixture = {
  status: "Payed",
  reject: false,
  delivery_state: "OrderConfirm",
  items: [
    {
      id: 12,
      product_id: 47,
      product: { title: "Fixture <digital> product" },
      count: 2,
      virtual_items: [
        {
          id: 5,
          data: "PRIVATE_OUTPUT",
          private_attributes: "PRIVATE_ATTRIBUTE",
        },
        { id: 6, data: "SECOND_PRIVATE_OUTPUT" },
        null,
      ],
    },
  ],
};
function context(component, basket, modern = true) {
  const emitted = [];
  const target = {
    basket,
    modern,
    ...component.data?.(),
    $emit: (...args) => emitted.push(args),
  };
  for (const [key, getter] of Object.entries(component.computed || {}))
    Object.defineProperty(target, key, { get: () => getter.call(target) });
  for (const [key, method] of Object.entries(component.methods || {}))
    target[key] = method.bind(target);
  return { target, emitted };
}
assert.equal(preparation.props.modern.default, false);
assert.equal(autoComplete.props.modern.default, false);
assert.equal(preparation.data().ProductType.VIRTUAL.code, "VIRTUAL");
assert.equal(preparation.mixins.includes(dateMixin), true);
for (const stage of Object.keys(states)) {
  for (const status of ["Payed", "Unpaid"]) {
    for (const reject of [false, true]) {
      const { target, emitted } = context(preparation, {
        ...fixture,
        status,
        reject,
        delivery_state: stage,
      });
      const allowed =
        status === "Payed" &&
        !reject &&
        ["OrderConfirm", "PreparingOrder"].includes(stage);
      assert.equal(target.can_prepare, allowed);
      assert.equal(
        target.prominent_action,
        allowed && stage === "OrderConfirm",
      );
      target.preparingOrder();
      assert.equal(emitted.length, allowed ? 1 : 0);
      if (allowed) {
        assert.equal(target.busy, true);
        assert.equal(target.prominent_action, false);
        target.preparingOrder();
        assert.equal(emitted.length, 1, "busy blocks duplicate preparation");
        assert.equal(emitted[0][0], "confirm-preparing");
        emitted[0][1].callback();
        assert.equal(target.busy, false);
      }
    }
  }
}
const legacy = context(preparation, { ...fixture, status: "Unpaid" }, false);
legacy.target.preparingOrder();
assert.equal(legacy.emitted.length, 1, "legacy event contract stays unchanged");
legacy.emitted[0][1].callback();
assert.equal(legacy.target.busy, false);
const metadata = context(preparation, fixture).target.preparation_items;
assert.deepEqual(plain(metadata[0]), {
  id: 12,
  product_id: 47,
  title: "Fixture <digital> product",
  count: 2,
  records: [{ id: 5 }, { id: 6 }],
});
assert.deepEqual(plain(context(preparation, {}).target.preparation_items), []);

const passthrough = {
  render() {
    return Vue.h("div", this.$slots.default?.());
  },
};
const button = {
  props: ["to", "disabled", "loading", "variant", "size", "color"],
  render() {
    return Vue.h(
      this.to ? "a" : "button",
      {
        disabled: this.disabled,
        "data-loading": this.loading,
        "data-variant": this.variant,
        "data-size": this.size,
        "data-color": this.color,
        "data-to": this.to && JSON.stringify(this.to),
      },
      this.$slots.default?.(),
    );
  },
};
const route = { shop_id: "fixture-shop", basket_id: "fixture-basket" };
async function render(component, basket, modern = true, slot) {
  const app = Vue.createSSRApp({
    render: () => Vue.h(component, { basket, modern }, slot),
  });
  app.config.globalProperties.$route = { params: route };
  app.config.globalProperties.$t = (key, values) =>
    values ? `${key} ${values.units}/${values.records}` : key;
  app.config.globalProperties.$tm = () => [];
  app.mixin({
    methods: {
      getProductImage: (id) => `/fixture/products/${id}.png`,
    },
  });
  app.component("v-btn", button);
  app.component("v-icon", passthrough);
  app.component("v-spacer", passthrough);
  app.component("v-list-subheader", passthrough);
  app.component("v-tooltip", {
    render() {
      return Vue.h("aside", [
        this.$slots.activator?.({ props: {} }),
        this.$slots.default?.(),
      ]);
    },
  });
  app.component("u-widget-header", {
    props: ["title"],
    render() {
      return Vue.h("header", [
        Vue.h("h2", this.title),
        this.$slots["append-actions"]?.(),
      ]);
    },
  });
  return renderToString(app);
}
const html = await render(preparation, fixture);
assert.match(html, /Fixture &lt;digital&gt; product/);
assert.match(html, /\/fixture\/products\/47.png/);
assert.match(html, /VIT-5/);
assert.match(html, /VIT-6/);
assert.match(html, /virtual_record_summary 2\/2/);
assert.doesNotMatch(html, /PRIVATE_OUTPUT|PRIVATE_ATTRIBUTE/);
assert.match(html, /BPageOrderVirtualInput/);
assert.match(html, /fixture-shop/);
assert.match(html, /fixture-basket/);
assert.match(html, /data-variant="flat"/);
assert.match(html, /data-size="x-large"/);
const completed = await render(preparation, {
  ...fixture,
  delivery_state: "PreparingOrder",
});
assert.match(completed, /apply_change_action/);
assert.match(completed, /data-variant="outlined"/);
assert.doesNotMatch(completed, /data-size="x-large"/);
const manyRecords = await render(preparation, {
  ...fixture,
  items: [
    { ...fixture.items[0], virtual_items: [1, 2, 3, 4].map((id) => ({ id })) },
  ],
});
assert.match(manyRecords, /<details><summary>/);
assert.match(manyRecords, /VIT-4/);
const delivered = await render(preparation, {
  ...fixture,
  delivery_state: "ToCustomer",
  delivery_at: "2026-10-29T14:22:00Z",
});
assert.match(delivered, /datetime="2026-10-29T14:22:00Z"/);
assert.match(delivered, /local:2026-10-29T14:22:00Z/);
assert.match(delivered, /disabled/);
assert.doesNotMatch(delivered, /data-size="x-large"/);

const schedule = "2026-11-01T15:42:00Z";
for (const stage of Object.keys(states)) {
  const basket = {
    ...fixture,
    delivery_state: stage,
    auto_complete_at: schedule,
  };
  const { target } = context(autoComplete, basket);
  assert.equal(
    target.auto_complete_at.toISOString(),
    "2026-11-01T15:42:00.000Z",
  );
  assert.equal(target.show_modern_schedule, stage === "PreparingOrder");
  const scheduleHtml = await render(autoComplete, basket);
  assert.equal(scheduleHtml.includes("countdown"), stage === "PreparingOrder");
}
for (const changes of [
  { auto_complete_at: null },
  { status: "Unpaid" },
  { reject: true },
]) {
  const basket = {
    ...fixture,
    delivery_state: "PreparingOrder",
    auto_complete_at: schedule,
    ...changes,
  };
  assert.equal(
    context(autoComplete, basket).target.show_modern_schedule,
    false,
  );
  assert.doesNotMatch(await render(autoComplete, basket), /countdown/);
}
assert.match(
  await render(autoComplete, { ...fixture, auto_complete_at: schedule }, false),
  /countdown/,
  "legacy projected-timestamp display is preserved",
);
const slotHtml = await render(preparation, fixture, true, {
  default: () => Vue.h("span", "fixture-schedule-slot"),
});
assert.equal(slotHtml.match(/fixture-schedule-slot/g)?.length, 1);
console.log(
  "Virtual preparation guards, metadata, Form navigation, dates and modern countdown passed.",
);
