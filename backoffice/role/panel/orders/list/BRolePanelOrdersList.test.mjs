import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";

// Compile the real component; HTTP and the UI leaves never reach the local/live app.
function evaluate(source, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, ...globals });
  return exports;
}
const Basket = evaluate(
  readFileSync(
    new URL(
      "../../../../../../core-js/models/shop/order/basket/basket.model.ts",
      import.meta.url,
    ),
    "utf8",
  ),
  { require: (name) => ({ default: name, Product: { ProductType: {} } }) },
).Basket;
const ProductType = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE"].map((code) => [
    code,
    { code, basket: `/test/${code}.svg`, basket_code: "SM" },
  ]),
);
const requests = [],
  calls = [];
const plain = (value) => JSON.parse(JSON.stringify(value));
const leaf = (name) =>
  Vue.defineComponent({
    name,
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () => {
        calls.push({ name, attrs });
        const children =
          name === "v-data-table-server"
            ? [
                ...attrs.items.flatMap((item) =>
                  attrs.headers.flatMap(
                    (header) => slots[`item.${header.value}`]?.({ item }) || [],
                  ),
                ),
                slots.bottom?.(),
                ...(!attrs.items.length ? [slots["no-data"]?.()] : []),
              ]
            : [slots.activator?.({ props: {} }), slots.default?.()];
        return Vue.h("div", { "data-leaf": name }, children);
      },
  });
const isolated = {
  require: (name) =>
    name === "vue"
      ? Vue
      : name === "@selldone/core-js"
        ? { Basket }
        : name.includes("ProductType")
          ? { ProductType }
          : {
              default: name.endsWith(".vue")
                ? leaf(name.split("/").at(-1).replace(".vue", ""))
                : {},
            },
  axios: {
    get: (url, config) =>
      new Promise((resolve, reject) =>
        requests.push({ url, config, resolve, reject }),
      ),
  },
  window: { API: { GET_MY_ROLE_TASKS: (id) => `/isolated/roles/${id}/tasks` } },
};
const filename = new URL("./BRolePanelOrdersList.vue", import.meta.url)
  .pathname;
const { descriptor, errors } = parse(
  readFileSync(new URL("./BRolePanelOrdersList.vue", import.meta.url), "utf8"),
  { filename },
);
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename,
  id: "role-list-test",
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({
    source: style.content,
    filename,
    id: "data-v-role-list-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(result.errors, []);
}
const List = {
  ...evaluate(descriptor.script.content, isolated).default,
  render: evaluate(template.code, isolated).render,
};
function fixture(modern = true) {
  const state = {
    role: { id: 7, level: "checking" },
    shop: { id: 3 },
    type: ProductType.PHYSICAL,
    modern,
    selectedId: null,
    $t: (key) => key,
    events: [],
  };
  Object.assign(state, List.data.call(state));
  state.$emit = (...args) => state.events.push(args);
  for (const [key, fn] of Object.entries(List.methods))
    state[key] = fn.bind(state);
  for (const [key, fn] of Object.entries(List.computed))
    Object.defineProperty(state, key, { get: () => fn.call(state) });
  return state;
}
const order = {
  id: 21,
  price: 0.00002884,
  discount: 0.0000009,
  delivery_price: 0,
  currency: "BTC",
  status: "Payed",
  delivery_state: "CheckQueue",
  basket_item_returns: [{ item_id: 2, count: 1 }],
  reserved_at: "2026-01-02T01:02:03Z",
};
async function render(modern, width, rows = [order], data = {}) {
  calls.length = 0;
  const app = Vue.createSSRApp(
    {
      ...List,
      mixins: [],
      watch: {},
      data() {
        return {
          ...List.data.call(this),
          orders: rows,
          totalItems: rows.length,
          ...data,
        };
      },
    },
    {
      role: { id: 7 },
      shop: { id: 3 },
      type: ProductType.PHYSICAL,
      modern,
      selectedId: 21,
    },
  );
  for (const name of [
    "v-btn-toggle",
    "v-btn",
    "v-icon",
    "v-img",
    "v-tooltip",
    "v-data-table-server",
    "v-pagination",
    "u-loading-progress",
    "u-price",
  ])
    app.component(name, leaf(name));
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $vuetify: { display: { xs: width < 600, width } },
    getStatusColor: () => "green",
    getStatusString: (value) => value,
    getDeliveryStateString: (value) => value,
    getFromNowString: () => "2 days ago",
    getLocalTimeString: (value) => value,
  });
  return renderToString(app);
}

test("modern opt-in preserves payment defaults, five server sort fields and legacy columns", () => {
  assert.equal(List.props.modern.default, false);
  const state = fixture();
  assert.deepEqual(plain(state.status), ["Payed", "COD"]);
  assert.deepEqual(plain(state.paymentStatuses.map((item) => item.code)), [
    "Reserved",
    "Payed",
    "COD",
    "Canceled",
  ]);
  assert.deepEqual(
    plain(
      state.tableHeaders
        .filter((header) => header.sortable)
        .map((header) => header.value),
    ),
    ["id", "price", "status", "delivery_state", "reserved_at"],
  );
  assert.deepEqual(
    plain(fixture(false).tableHeaders.map((header) => header.value)),
    [
      "type",
      "id",
      "price",
      "status",
      "delivery_state",
      "basket_item_returns",
      "reserved_at",
    ],
  );
});

test("current success emits bounded rows and selection remains controlled", async () => {
  const state = fixture();
  state.totalItems = 41;
  const pending = state.fetchOrders(3, "price", false);
  assert.equal(
    state.totalItems,
    41,
    "loading must not reset Vuetify pagination to page one",
  );
  assert.deepEqual(plain(requests.at(-1).config.params), {
    offset: 20,
    limit: 10,
    sortBy: "price",
    sortDesc: false,
    statuses: ["Payed", "COD"],
  });
  assert.deepEqual(state.events, [["scope-change"]]);
  state.selectOrder(order);
  assert.equal(state.events.length, 1);
  requests.at(-1).resolve({ data: { total: 41, orders: [order] } });
  await pending;
  assert.equal(state.busy_fetch, false);
  assert.equal(state.load_error, false);
  assert.deepEqual(plain(state.events.slice(1)), [
    ["total-tasks", 41],
    ["loaded", { orders: [order], total: 41, page: 3 }],
  ]);
  assert.equal(state.rowProps({ item: order })["aria-selected"], false);
  state.selectedId = order.id;
  assert.equal(state.rowProps({ item: order })["aria-selected"], true);
  state.selectOrder(order);
  assert.deepEqual(plain(state.events.at(-1)), ["select", order]);
  state.selectOrder({ ...order, id: 999 });
  assert.deepEqual(plain(state.events.at(-1)), ["select", order]);
});

test("same-role refresh retains rows while pending and failed selections stay blocked", async () => {
  const state = fixture();
  const initial = state.fetchOrders(1);
  requests.at(-1).resolve({ data: { total: 20, orders: [order] } });
  await initial;
  const pending = state.fetchOrders(2);
  const older = requests.at(-1);
  assert.deepEqual(plain(state.orders), [order]);
  const current = state.fetchOrders(2, "price", false);
  assert.deepEqual(plain(state.orders), [order], "overlapping refreshes retain the same role's rows");
  state.selectOrder(order);
  assert.equal(state.events.filter(([name]) => name === "select").length, 0);
  older.resolve({ data: { total: 99, orders: [{ ...order, id: 999 }] } });
  await pending;
  assert.deepEqual(plain(state.orders), [order]);
  requests.at(-1).reject(new Error("refresh failed"));
  await current;
  assert.deepEqual(plain(state.orders), [order]);
  state.selectOrder(order);
  assert.equal(state.events.filter(([name]) => name === "select").length, 0);
  state.role = { id: 8, level: "packing" };
  const switched = state.fetchOrders(1);
  assert.deepEqual(plain(state.orders), [], "a different role must clear the previous role's rows immediately");
  requests.at(-1).resolve({ data: { total: 0, orders: [] } });
  await switched;
});

test("stale role and page responses cannot repopulate the list or change loading state", async () => {
  const state = fixture();
  const old = state.fetchOrders(1);
  const previous = requests.at(-1);
  state.role = { id: 8, level: "packing" };
  const current = state.fetchOrders(2, "reserved_at", true);
  const latest = requests.at(-1);
  previous.resolve({ data: { total: 99, orders: [{ ...order, id: 999 }] } });
  await old;
  assert.deepEqual(plain(state.orders), []);
  assert.equal(state.busy_fetch, true);
  latest.resolve({ data: { total: 20, orders: [order] } });
  await current;
  assert.deepEqual(plain(state.orders), [order]);
  assert.equal(state.events.filter(([name]) => name === "loaded").length, 1);

  const unmounted = state.fetchOrders(3);
  List.beforeUnmount.call(state);
  requests.at(-1).resolve({ data: { total: 99, orders: [{ id: 999 }] } });
  await unmounted;
  assert.deepEqual(plain(state.orders), [order], "an unmounted read cannot replace retained rows");
});

test("failure is explicit, retry recovers, duplicate native options do not double fetch", async () => {
  const state = fixture();
  const pending = state.fetchOrders(1, "id", true);
  const count = requests.length;
  state.updateOptions({ page: 1, sortBy: [{ key: "id", order: "desc" }] });
  assert.equal(requests.length, count);
  requests.at(-1).reject(new Error("isolated failure"));
  await pending;
  assert.equal(state.load_error, true);
  assert.equal(state.busy_fetch, false);
  assert.deepEqual(plain(state.orders), []);
  assert.equal(state.events.filter(([name]) => name === "loaded").length, 0);
  const retry = state.fetchOrders(1, "id", true);
  requests.at(-1).resolve({ data: { total: 0, orders: [] } });
  await retry;
  assert.equal(state.load_error, false);
  assert.equal(state.totalItems, 0);
});

test("desktop and mobile retain exact prices, payment, stage, returns, date, sorting and paging", async () => {
  for (const width of [1455, 390, 320]) {
    const html = await render(true, width);
    const table = calls.find(
      ({ name }) => name === "v-data-table-server",
    ).attrs;
    assert.equal(table.mobile, width < 600);
    assert.equal(table["items-per-page"], 10);
    assert.deepEqual(
      plain(
        table.headers
          .filter((header) => header.sortable)
          .map((header) => header.value),
      ),
      ["id", "price", "status", "delivery_state", "reserved_at"],
    );
    assert.match(html, /SM-21/);
    assert.match(html, /CheckQueue/);
    assert.match(html, /Payed/);
    assert.match(html, /2026-01-02T01:02:03Z/);
    assert.ok(
      calls.some(
        ({ name, attrs }) =>
          name === "u-price" &&
          attrs.amount === order.price &&
          attrs.currency === "BTC",
      ),
    );
    assert.ok(
      calls.some(
        ({ name, attrs }) =>
          name === "u-price" &&
          attrs.amount === order.discount &&
          attrs.currency === "BTC",
      ),
    );
    assert.ok(
      calls.some(
        ({ name, attrs }) =>
          name === "u-price" && attrs.amount === 0 && attrs.currency === "BTC",
      ),
    );
    assert.ok(calls.some(({ name }) => name === "ReturnRequestButtonBadge"));
    assert.ok(
      calls.some(
        ({ name, attrs }) =>
          name === "v-btn-toggle" &&
          attrs.mandatory === "" &&
          attrs.multiple === "",
      ),
    );
    assert.ok(
      calls.some(
        ({ name, attrs }) =>
          name === "v-pagination" &&
          attrs.class.includes("sd-modern-pagination"),
      ),
    );
  }
  const legacy = await render(false, 390);
  assert.ok(calls.some(({ name }) => name === "SOrderStatusesSelect"));
  assert.ok(calls.some(({ name }) => name === "SOrderStatusView"));
  assert.match(legacy, /SM-21/);
  const failed = await render(true, 390, [], { load_error: true });
  assert.match(failed, /role_workspace.load_error/);
  assert.match(failed, /role_workspace.retry/);
  assert.doesNotMatch(failed, /role_workspace.empty_title/);
});
