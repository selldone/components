import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Synthetic connect orders only: no requests, no provider calls, no live values.
const Connect = {
  Modes: Object.fromEntries(
    ["Migration", "Dropshipping", "Marketplace", "Accounting", "Other"].map(
      (code) => [code, { code, title: `connect_mode.${code}.title` }],
    ),
  ),
};
// Values built inside the component realm are compared after a JSON round trip.
const plain = (value) => JSON.parse(JSON.stringify(value));
const notifications = [];
const NotificationService = new Proxy(
  {},
  { get: (_, name) => (...args) => notifications.push([name, ...args]) },
);
const sourceFile = fileURLToPath(
  new URL("./BOrderConnectItem.vue", import.meta.url),
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
const DateConverter = {
  getFromNowString: (value) => `ago:${value}`,
};
const dateMixin = evaluate(
  resolveModule("@selldone/components-vue/mixin/date/DateMixin.ts"),
  (name) => {
    if (name === "@selldone/core-js/helper/date/DateConverter")
      return { DateConverter };
    throw new Error(`Unexpected date mixin import: ${name}`);
  },
).default;
const stepper = {
  props: ["state", "states", "showCaption"],
  render() {
    return Vue.h(
      "ol",
      { "data-state": this.state },
      Object.values(this.states).map((item) =>
        Vue.h("li", { "data-code": item.code }, item.name),
      ),
    );
  },
};
const menu = {
  props: { items: Array, title: String, modern: Boolean },
  render() {
    return Vue.h(
      "ul",
      { "data-menu": this.title, "data-modern": String(!!this.modern) },
      this.items.map((item) =>
        Vue.h("li", { "data-disabled": String(!!item.disabled) }, item.title),
      ),
    );
  },
};
const passthrough = {
  render() {
    return Vue.h("div", this.$slots.default?.());
  },
};
async function load(file, imports) {
  const filename = new URL(file, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: filename.pathname,
    id: "connect-test",
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: filename.pathname,
      id: "connect-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
    // A bare `.smart-invert {` rule would invert the whole layout (the :global pitfall).
    for (const rule of result.code.match(/[^{}]+\{/g) || [])
      if (rule.includes(".smart-invert"))
        assert.match(rule, /b-order-connect-item-modern/, rule.trim());
  }
  const component = evaluate(descriptor.script.content, (name) => {
    for (const [key, value] of Object.entries(imports))
      if (name.includes(key)) return value;
    throw new Error(`Unexpected import: ${name}`);
  }).default;
  component.render = evaluate(template.code, () => Vue).render;
  return component;
}
const item = await load("./BOrderConnectItem.vue", {
  "@selldone/core-js": { Connect },
  "DateMixin.ts": { default: dateMixin },
  "NotificationService.ts": { default: NotificationService },
  "SOrderDeliveryStatusStepper.vue": { default: stepper },
  "USmartMenu.vue": { default: menu },
  "UTextValueDashed.vue": { default: passthrough },
  "UAvatarFolder.vue": { default: passthrough },
});
const list = await load("../list/BOrderConnectsList.vue", {
  "BOrderConnectItem.vue": { default: item },
  "UWidgetHeader.vue": {
    default: {
      props: ["title", "icon"],
      render() {
        return Vue.h("header", [
          Vue.h("h2", { "data-icon": this.icon }, [
            this.$slots.title?.(),
            this.title,
          ]),
        ]);
      },
    },
  },
});
assert.equal(item.props.modern.default, false);
assert.equal(list.props.modern.default, false);

const t = (key, values) => (values?.time ? `${key}|${values.time}` : key);
const connect = { id: 7, name: "Fixture <provider>", icon: "p.png", mode: "Dropshipping", confirm: true };
const order = (extra = {}) => ({
  id: 31,
  connect_id: 7,
  connect,
  created_at: "c1",
  sync_at: null,
  confirm_at: null,
  fulfill_at: null,
  cancel_at: null,
  price: 12.4,
  currency: "USD",
  service_costs: { shipping: "3.00", subtotal: "9.40" },
  retail_costs: null,
  error: null,
  ...extra,
});
const basket = {
  items: [
    { id: 1, product_id: 47, product: { connect_id: 7, title: "Fixture <tee>" }, count: 2, check: true },
    { id: 2, product_id: 48, product: { connect_id: 7, title: "Other" }, count: 1, check: false },
    { id: 3, product_id: 49, product: { connect_id: 9, title: "Foreign" }, count: 1, check: true },
  ],
};
function context(connectOrder, modern = true) {
  const emitted = [];
  const target = {
    basket,
    connectOrder,
    shop: { id: 1 },
    modern,
    ...item.data(),
    $t: t,
    $emit: (...args) => emitted.push(args),
    getName: (key) => `name:${key}`,
    getFromNowString: dateMixin.methods.getFromNowString,
  };
  for (const [key, getter] of Object.entries(item.computed))
    Object.defineProperty(target, key, { get: () => getter.call(target) });
  for (const [key, method] of Object.entries(item.methods))
    target[key] = method.bind(target);
  return { target, emitted };
}

// Stage precedence, status label and the single visible next step.
const expectations = [
  [{}, "created_at", "awaiting_sync", "order_connect_list.sync"],
  [{ sync_at: "s1" }, "sync_at", "awaiting_confirmation", "order_connect_list.confirm_action"],
  [{ sync_at: "s1", confirm_at: "k1" }, "confirm_at", "awaiting_fulfillment", null],
  [{ sync_at: "s1", confirm_at: "k1", fulfill_at: "f1" }, "fulfill_at", "fulfilled", null],
  [{ sync_at: "s1", cancel_at: "x1" }, "cancel_at", "canceled", null],
];
for (const [extra, state, status, next] of expectations) {
  const { target } = context(order(extra));
  assert.equal(target.state, state, JSON.stringify(extra));
  assert.equal(target.status_code, status);
  assert.equal(target.next_action?.title ?? null, next);
}
// A provider without a confirmation step goes straight to fulfillment after sync.
{
  const { target } = context(order({ sync_at: "s1", connect: { ...connect, confirm: false } }));
  assert.equal(target.status_code, "awaiting_fulfillment");
  assert.equal(target.next_action, null);
  assert.deepEqual(plain(Object.keys(target.states)), ["created_at", "sync_at", "fulfill_at"]);
}
// Stage names carry the relative time only once a step is recorded.
{
  const { target } = context(order({ sync_at: "s1" }));
  assert.equal(target.states.created_at.name, "order_connect_list.stages.created|ago:c1");
  assert.equal(target.states.sync_at.name, "order_connect_list.stages.synced|ago:s1");
  assert.equal(target.states.confirm_at.name, "order_connect_list.stages.confirm");
  assert.equal(target.states.fulfill_at.name, "order_connect_list.stages.fulfill");
}
// Canceled orders only keep the steps that happened plus the cancel step.
{
  const { target } = context(order({ cancel_at: "x1" }));
  assert.deepEqual(plain(Object.keys(target.states)), ["created_at", "cancel_at"]);
  assert.equal(target.states.cancel_at.name, "order_connect_list.stages.canceled|ago:x1");
}
// Menu guards are unchanged: closed orders block address/sync, confirmed blocks confirm.
{
  const open = context(order()).target.menu_items;
  const disabled = (entries) => plain(entries.map((entry) => !!entry.disabled));
  assert.deepEqual(disabled(open), [false, false, false, false, false]);
  const fulfilled = context(order({ sync_at: "s1", confirm_at: "k1", fulfill_at: "f1" })).target.menu_items;
  assert.deepEqual(disabled(fulfilled), [true, true, true, false, false]);
  const canceled = context(order({ cancel_at: "x1" })).target.menu_items;
  assert.deepEqual(disabled(canceled), [true, true, true, false, true]);
  const migration = context(order({ connect: { ...connect, mode: "Migration" } })).target.menu_items;
  assert.equal(migration.length, 4, "cancel stays limited to dropshipping, marketplace and other");
  const { target, emitted } = context(order());
  target.menu_items[0].click();
  assert.equal(emitted[0][0], "show-edit-address");
  emitted[0][1](true);
  assert.equal(target.busy_edit, true);
}
// Cost groups keep only recorded groups and label keys through getName.
assert.deepEqual(plain(context(order()).target.cost_groups), [
  {
    key: "service_costs",
    rows: [
      { key: "shipping", label: "name:shipping", value: "3.00" },
      { key: "subtotal", label: "name:subtotal", value: "9.40" },
    ],
  },
]);
assert.deepEqual(plain(context(order({ service_costs: {}, retail_costs: null })).target.cost_groups), []);
// Items belong to this provider only.
assert.deepEqual(plain(context(order()).target.items.map((entry) => entry.id)), [1, 2]);

async function render(connectOrder, modern = true) {
  const app = Vue.createSSRApp({
    render: () =>
      Vue.h(list, {
        basket: { ...basket, connect_orders: [connectOrder] },
        shop: { id: 1 },
        modern,
      }),
  });
  app.config.globalProperties.$t = t;
  app.mixin({
    methods: {
      getName: (key) => `name:${key}`,
      getProductImage: (id) => `/fixture/products/${id}.png`,
      getShopImagePath: (path) => `/fixture/shop/${path}`,
    },
  });
  const button = {
    props: ["loading", "variant", "icon"],
    render() {
      return Vue.h("button", { "data-variant": this.variant, "data-loading": String(!!this.loading) }, this.$slots.default?.());
    },
  };
  const badge = {
    props: ["color", "content"],
    render() {
      return Vue.h("span", { "data-badge": this.content, "data-color": this.color }, this.$slots.default?.());
    },
  };
  app.component("v-btn", button);
  app.component("v-badge", badge);
  app.component("v-tooltip", {
    render() {
      return Vue.h("aside", [this.$slots.activator?.({ props: {} }), this.$slots.default?.()]);
    },
  });
  for (const name of ["v-icon", "v-avatar", "v-img", "v-list-subheader", "v-row", "v-col", "v-menu", "v-sheet", "v-container", "v-spacer", "u-loading-progress", "u-price"])
    app.component(name, passthrough);
  return renderToString(app);
}
const html = await render(order({ error: "Access <token> invalid" }));
assert.match(html, /sd-modern-widget b-order-connect-modern/);
assert.match(html, /data-icon="hub"/);
assert.match(html, /order_connect_list\.help/);
assert.match(html, /connect_mode\.Dropshipping\.title/);
assert.match(html, /Fixture &lt;provider&gt;/);
assert.match(html, /order_connect_list\.status\.awaiting_sync/);
assert.match(html, /sd-modern-status__dot--warning/);
assert.match(html, /\/fixture\/shop\/p\.png/);
assert.match(html, /\/fixture\/products\/47\.png/);
assert.doesNotMatch(html, /\/fixture\/products\/49\.png/, "foreign items stay out");
assert.match(html, /data-badge="2" data-color="success"/);
assert.match(html, /data-badge="1" data-color="error"/);
assert.match(html, /data-variant="outlined"[^>]*>[\s\S]*?order_connect_list\.sync/);
assert.match(html, /data-menu="order_connect_list\.menu_title" data-modern="true"/);
assert.match(html, /data-state="created_at"/);
assert.match(html, /order_connect_list\.stages\.created\|ago:c1/);
assert.match(html, /role="alert"[\s\S]*Access &lt;token&gt; invalid/);
assert.match(html, /name:shipping/);
assert.doesNotMatch(html, /text-gradient/);
const fulfilled = await render(order({ sync_at: "s1", confirm_at: "k1", fulfill_at: "f1", retail_costs: null, service_costs: null }));
assert.doesNotMatch(fulfilled, /data-variant="outlined"/, "no next step once fulfilled");
assert.match(fulfilled, /sd-modern-status__dot--success/);
assert.match(fulfilled, /order_connect_list\.costs_unavailable/);
assert.doesNotMatch(fulfilled, /role="alert"/);
const legacy = await render(order(), false);
assert.match(legacy, /widget shadow/);
assert.match(legacy, /text-gradient/);
assert.match(legacy, /data-modern="false"/);
assert.doesNotMatch(legacy, /sd-modern-widget/);
assert.equal(notifications.length, 0);
console.log("Connect OS card stages, status, next step, menu guards, costs and modern/legacy rendering passed.");
