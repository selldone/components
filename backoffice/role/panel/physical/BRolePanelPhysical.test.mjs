import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { setImmediate } from "node:timers/promises";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";

// Real SFCs/core enums. Every HTTP request is a deferred local stub, never an app request.
const requests = [],
  notices = [],
  calls = [],
  taskInstances = [];
const plain = (value) => JSON.parse(JSON.stringify(value));
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
const readCore = (path) =>
  readFileSync(
    new URL(`../../../../../core-js/${path}`, import.meta.url),
    "utf8",
  );
const Basket = evaluate(readCore("models/shop/order/basket/basket.model.ts"), {
  require: (name) => ({ default: name, Product: { ProductType: {} } }),
}).Basket;
const ShopRoles = evaluate(readCore("enums/staff/ShopRoles.ts"), {
  require: (name) => ({ default: name }),
}).ShopRoles;
const ProductType = evaluate(readCore("enums/product/ProductType.ts"), {
  require: (name) => (name.endsWith(".svg") ? { default: name } : { Basket }),
}).ProductType;
const states = Basket.PhysicalOrderStates;
const roleNames = [
  "PhysicalOrdersChecking",
  "PhysicalOrdersPackaging",
  "PhysicalOrdersDelivery",
  "PhysicalOrdersSupport",
];
const leaf = (name) =>
  Vue.defineComponent({
    name,
    inheritAttrs: false,
    setup: (_, { attrs, slots }) => {
      const local =
        name === "BRolePanelTask"
          ? { choices: Vue.ref([]), mounts: 0, unmounts: 0 }
          : null;
      if (local) {
        taskInstances.push(local);
        Vue.onMounted(() => local.mounts++);
        Vue.onBeforeUnmount(() => local.unmounts++);
      }
      return () => {
        calls.push({ name, attrs });
        return Vue.h("div", { "data-leaf": name }, [
          slots.activator?.({ props: {} }),
          slots.default?.(),
          local ? local.choices.value.join(",") : null,
        ]);
      };
    },
  });
const dependency = (name) => {
  if (name === "vue") return Vue;
  if (name === "@selldone/core-js") return { Basket };
  if (name.includes("ShopRoles")) return { ShopRoles };
  if (name.includes("ProductType")) return { ProductType };
  if (name.includes("NotificationService"))
    return {
      default: Object.fromEntries(
        ["showErrorAlert", "showSuccessAlert", "showLaravelError"].map(
          (key) => [key, (...args) => notices.push([key, ...args])],
        ),
      ),
    };
  return {
    default: name.endsWith(".vue")
      ? leaf(name.split("/").at(-1).replace(".vue", ""))
      : {},
  };
};
const isolated = {
  require: dependency,
  window: {
    API: {
      GET_MY_ROLE_TASK: (role, id) => `/isolated/roles/${role}/tasks/${id}`,
      POST_MY_ROLE_TASK_ACTION: (role, id, action) =>
        `/isolated/roles/${role}/tasks/${id}/${action}`,
    },
  },
  axios: Object.fromEntries(
    ["get", "post"].map((method) => [
      method,
      (url, payload) =>
        new Promise((resolve, reject) =>
          requests.push({ method, url, payload, resolve, reject }),
        ),
    ]),
  ),
};
async function load(path) {
  const file = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), {
    filename: file.pathname,
  });
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file.pathname,
    id: "role-task-test",
  });
  assert.deepEqual(template.errors, []);
  for (const block of descriptor.styles) {
    const result = await compileStyleAsync({
      source: block.content,
      filename: file.pathname,
      id: "data-v-role-task-test",
      scoped: block.scoped,
      preprocessLang: block.lang,
    });
    assert.deepEqual(result.errors, []);
  }
  return {
    ...evaluate(descriptor.script.content, isolated).default,
    render: evaluate(template.code, isolated).render,
  };
}
const Physical = await load("./BRolePanelPhysical.vue");
const Task = await load("./BRolePanelTask.vue");
const NativeCart = await load(
  "../../../order/dashboard/cart/BOrderDashboardCart.vue",
);
const NativePreparing = await load(
  "../../../order/dashboard/preparing/BOrderDashboardPreparing.vue",
);
const role = (level = roleNames[0], id = 7) => ({ id, level, accepted: true });
const basket = (id = 21, overrides = {}) => ({
  id,
  status: Basket.Status.Payed.code,
  delivery_state: states.CheckQueue.code,
  price: 0.00002884,
  currency: "BTC",
  reserved_at: "2026-01-01T01:02:03Z",
  items: [],
  ...overrides,
});
function fixture(level = roleNames[0], width = 1455) {
  const state = {
    role: role(level),
    shop: { id: 3 },
    timeSeries: {},
    dark: false,
    USER: () => ({ preferences: { dark: false } }),
    $vuetify: { display: { width } },
    $t: (key) => key,
  };
  Object.assign(state, Physical.data.call(state));
  for (const [key, fn] of Object.entries(Physical.methods))
    state[key] = fn.bind(state);
  for (const [key, fn] of Object.entries(Physical.computed))
    Object.defineProperty(state, key, { get: () => fn.call(state) });
  return state;
}
const settle = async () => {
  await Vue.nextTick();
  await setImmediate();
  await Vue.nextTick();
};
const document = new JSDOM("<!doctype html><html><body></body></html>").window
  .document;
const renderer = Vue.createRenderer({
  createElement: (tag) => document.createElement(tag),
  createText: (text) => document.createTextNode(text),
  createComment: (text) => document.createComment(text),
  insert: (element, parent, anchor = null) =>
    parent.insertBefore(element, anchor),
  remove: (element) => element.parentNode?.removeChild(element),
  setText: (element, text) => {
    element.nodeValue = text;
  },
  setElementText: (element, text) => {
    element.textContent = text;
  },
  parentNode: (element) => element.parentNode,
  nextSibling: (element) => element.nextSibling,
  querySelector: (selector) => document.querySelector(selector),
  patchProp: (element, key, old, value) => {
    if (key === "style" && value && typeof value === "object")
      Object.assign(element.style, value);
    else if (!key.startsWith("on") && value !== undefined && value !== null)
      element.setAttribute(key, String(value));
  },
});
function mountPhysical(width = 1455, withTemplate = false, userDark = false) {
  const props = Vue.reactive({
    role: role(),
    shop: { id: 3 },
    timeSeries: {},
    dark: false,
  });
  const user = Vue.reactive({ preferences: { dark: userDark } });
  const display = Vue.reactive({ width });
  const Component = {
    ...Physical,
    render: withTemplate ? Physical.render : () => null,
  };
  const app = renderer.createApp({ render: () => Vue.h(Component, props) });
  for (const name of [
    "v-dialog",
    "v-card",
    "v-card-title",
    "v-card-text",
    "v-btn",
    "v-icon",
    "v-progress-circular",
  ])
    app.component(name, leaf(name));
  Object.assign(app.config.globalProperties, {
    $vuetify: { display },
    $t: (key) => key,
    USER: () => user,
  });
  const target = document.createElement("div");
  document.body.append(target);
  const root = app.mount(target);
  return {
    app,
    props,
    display,
    user,
    target,
    get instance() {
      return root.$.subTree.component.proxy;
    },
  };
}

test("desktop auto-selects first authorized row; mobile waits for an explicit choice", async () => {
  for (const width of [1455, 1101, 1100, 900, 390, 320]) {
    const state = fixture(roleNames[0], width),
      count = requests.length;
    state.onOrdersLoaded({ orders: [basket(), basket(22)] });
    assert.equal(requests.length, count + (width > 1100 ? 1 : 0));
    assert.equal(state.selected?.id || null, width > 1100 ? 21 : null);
    if (width <= 1100) {
      state.selectTask(basket());
      assert.equal(state.dialog, true);
    }
    requests.at(-1).resolve({ data: { basket: basket() } });
    await settle();
    assert.equal(state.basket.id, 21);
  }
});

test("stale task reads, role changes and unmount never reveal a previous assignment", async () => {
  const mounted = mountPhysical(),
    state = mounted.instance;
  state.selectTask(basket());
  const old = requests.at(-1);
  state.selectTask(basket(22));
  const latest = requests.at(-1);
  old.resolve({ data: { basket: basket() } });
  await settle();
  assert.equal(state.basket, null);
  assert.equal(state.busy_fetch, true);
  latest.resolve({ data: { basket: basket(22) } });
  await settle();
  assert.equal(state.basket.id, 22);
  const pending = state.fetchBasket(),
    request = requests.at(-1);
  mounted.props.role = role(roleNames[1], 8);
  await Vue.nextTick();
  assert.equal(state.selected, null);
  assert.equal(state.basket, null);
  request.resolve({ data: { basket: basket(22) } });
  await pending;
  assert.equal(state.basket, null);
  state.selectTask(basket(23));
  const unmounted = requests.at(-1);
  mounted.app.unmount();
  unmounted.resolve({ data: { basket: basket(23) } });
  await settle();
  assert.equal(state.basket, null);
});

test("denied/failed task reads expose retry and invalid responses do not become a task", async () => {
  const mounted = mountPhysical(1455, true),
    state = mounted.instance;
  state.selectTask(basket());
  requests.at(-1).reject({ response: { status: 403 } });
  await settle();
  assert.equal(state.load_error, true);
  assert.equal(state.busy_fetch, false);
  assert.equal(state.basket, null);
  assert.match(mounted.target.textContent, /role_workspace.task_load_error/);
  assert.match(mounted.target.textContent, /role_workspace.retry/);
  const retry = state.fetchBasket();
  requests.at(-1).resolve({ data: { basket: basket() } });
  await retry;
  assert.equal(state.load_error, false);
  assert.equal(state.basket.id, 21);
  const invalid = state.fetchBasket();
  requests.at(-1).resolve({ data: { basket: basket(999) } });
  await invalid;
  assert.equal(state.load_error, true);
  assert.equal(state.basket, null);
  mounted.app.unmount();
});

test("revoking accepted assignment invalidates the task scope and blocks a write immediately", async () => {
  const mounted = mountPhysical(),
    state = mounted.instance;
  state.selectTask(basket());
  requests.at(-1).resolve({ data: { basket: basket() } });
  await settle();
  const previousScope = state.roleScope;
  const pending = state.fetchBasket(),
    request = requests.at(-1),
    count = requests.length;
  mounted.props.role.accepted = false;
  assert.notEqual(state.roleScope, previousScope);
  let released = 0;
  state.updateState({
    state: states.OrderConfirm.code,
    callback: () => released++,
  });
  assert.equal(requests.length, count);
  assert.equal(released, 1);
  await Vue.nextTick();
  assert.equal(state.selected, null);
  assert.equal(state.basket, null);
  assert.equal(state.busy_fetch, false);
  assert.equal(state.dialog, false);
  request.resolve({ data: { basket: basket() } });
  await pending;
  assert.equal(state.basket, null);
  mounted.app.unmount();
});

test("a single task instance preserves unsaved choices while expanding and returning inline", async () => {
  taskInstances.length = 0;
  const mounted = mountPhysical(1455, true),
    state = mounted.instance;
  state.selectTask(basket());
  requests.at(-1).resolve({ data: { basket: basket() } });
  await settle();
  assert.equal(taskInstances.length, 1);
  const task = taskInstances[0];
  task.choices.value = [4, 9];
  state.dialog = true;
  await settle();
  assert.equal(taskInstances.length, 1);
  assert.equal(task.unmounts, 0);
  assert.equal(state.dialog_target.textContent, "4,9");
  state.closeTask(false);
  await settle();
  assert.equal(taskInstances.length, 1);
  assert.equal(task.unmounts, 0);
  assert.deepEqual(task.choices.value, [4, 9]);
  mounted.display.width = 390;
  await settle();
  assert.equal(state.dialog, true);
  mounted.app.unmount();
  assert.equal(task.unmounts, 1);
});

test("mobile dialog honors global dark preference and the explicit dark prop", async () => {
  const mounted = mountPhysical(390, true, true),
    state = mounted.instance;
  state.selectTask(basket());
  requests.at(-1).resolve({ data: { basket: basket() } });
  await settle();
  assert.equal(state.dialogDark, true);
  assert.equal(
    calls.findLast(({ name }) => name === "v-card").attrs.theme,
    "dark",
  );
  assert.equal(
    calls.findLast(({ name }) => name === "BRolePanelTask").attrs.dark,
    true,
  );
  mounted.user.preferences.dark = false;
  await settle();
  assert.equal(state.dialogDark, false);
  assert.equal(
    calls.findLast(({ name }) => name === "v-card").attrs.theme,
    "light",
  );
  assert.equal(
    calls.findLast(({ name }) => name === "BRolePanelTask").attrs.dark,
    false,
  );
  mounted.props.dark = true;
  await settle();
  assert.equal(state.dialogDark, true);
  assert.equal(
    calls.findLast(({ name }) => name === "v-card").attrs.theme,
    "dark",
  );
  mounted.app.unmount();
});

test("each role can only request its exact state transition and only for Paid or COD orders", () => {
  const allowed = {
    PhysicalOrdersChecking: {
      CheckQueue: ["OrderConfirm"],
      OrderConfirm: ["OrderConfirm"],
      PreparingOrder: ["OrderConfirm"],
    },
    PhysicalOrdersPackaging: {
      OrderConfirm: ["PreparingOrder"],
      PreparingOrder: ["PreparingOrder"],
    },
    PhysicalOrdersDelivery: {
      PreparingOrder: ["SentOrder"],
      SentOrder: ["ToCustomer"],
    },
    PhysicalOrdersSupport: {},
  };
  for (const level of roleNames)
    for (const from of Object.keys(states))
      for (const to of Object.keys(states)) {
        const state = fixture(level);
        state.selected = basket();
        state.basket = basket(21, { delivery_state: from });
        assert.equal(
          state.canUpdate(to),
          !!allowed[level][from]?.includes(to),
          `${level}: ${from} → ${to}`,
        );
      }
  for (const status of Object.values(Basket.Status).map(({ code }) => code)) {
    const state = fixture();
    state.selected = basket();
    state.basket = basket(21, { status });
    assert.equal(
      state.canUpdate(states.OrderConfirm.code),
      [Basket.Status.Payed.code, Basket.Status.COD.code].includes(status),
    );
  }
  for (const overrides of [{ reject: true }, { id: 999 }]) {
    const state = fixture();
    state.selected = basket();
    state.basket = basket(21, overrides);
    assert.equal(state.canUpdate(states.OrderConfirm.code), false);
  }
  const revoked = fixture();
  revoked.selected = basket();
  revoked.basket = basket();
  revoked.role.accepted = false;
  assert.equal(revoked.canUpdate(states.OrderConfirm.code), false);
});

test("writes preserve empty checking list, reject duplicate actions and release every callback", async () => {
  const state = fixture();
  state.selected = basket();
  state.basket = basket();
  let released = 0;
  const write = state.updateState({
    state: states.OrderConfirm.code,
    list: [],
    callback: () => released++,
  });
  const request = requests.at(-1),
    count = requests.length;
  assert.equal(request.method, "post");
  assert.equal(request.url, "/isolated/roles/7/tasks/21/update-status");
  assert.deepEqual(plain(request.payload), {
    state: "OrderConfirm",
    list: [],
    delivery_info: null,
  });
  state.updateState({
    state: states.OrderConfirm.code,
    callback: () => released++,
  });
  assert.equal(requests.length, count);
  assert.equal(released, 1);
  state.closeTask(false);
  assert.equal(state.busy_update_state, true);
  request.resolve({
    data: {
      delivery_state: states.OrderConfirm.code,
      delivery_at: "2026-01-01",
    },
  });
  await write;
  assert.equal(released, 2);
  assert.equal(state.busy_update_state, false);
  assert.equal(state.selected.done, true);
  assert.equal(
    requests.at(-1).method,
    "get",
    "refresh after a completed write",
  );
  requests.at(-1).resolve({
    data: {
      basket: basket(21, { delivery_state: states.OrderConfirm.code }),
    },
  });
  await settle();
  const denied = state.updateState({
    state: states.OrderConfirm.code,
    callback: () => released++,
  });
  requests.at(-1).reject({ response: { status: 403 } });
  await denied;
  assert.equal(released, 3);
  assert.equal(state.busy_update_state, false);
  requests.at(-1).resolve({ data: { basket: basket() } });
  await settle();
  state.role.level = roleNames[3];
  state.updateState({
    state: states.OrderConfirm.code,
    callback: () => released++,
  });
  assert.equal(released, 4);
  const supportCount = requests.length;
  state.support_busy = true;
  state.selectTask(basket(99));
  state.updateState({
    state: states.OrderConfirm.code,
    callback: () => released++,
  });
  assert.equal(released, 5);
  assert.equal(state.selected.id, 21);
  assert.equal(requests.length, supportCount);
});

test("writes completing after unmount release callbacks without notification or another request", async () => {
  const state = fixture();
  state.selected = basket();
  state.basket = basket();
  let released = 0;
  const pending = state.updateState({
    state: states.OrderConfirm.code,
    callback: () => released++,
  });
  const request = requests.at(-1),
    count = requests.length,
    noticeCount = notices.length;
  Physical.beforeUnmount.call(state);
  request.resolve({ data: { delivery_state: states.OrderConfirm.code } });
  await pending;
  assert.equal(requests.length, count);
  assert.equal(notices.length, noticeCount);
  assert.equal(released, 1);
  assert.equal(state.selected.done, undefined);
});

async function renderTask(
  level,
  order = basket(),
  paymentLoaded = false,
  dark = false,
) {
  calls.length = 0;
  const events = [];
  const app = Vue.createSSRApp(
    {
      ...Task,
      mixins: [],
      data() {
        return { ...Task.data.call(this), payment_loaded: paymentLoaded };
      },
    },
    {
      basket: order,
      role: role(level),
      shop: { id: 3 },
      expandable: true,
      dark,
      onUpdateState: (value) => events.push(["update-state", value]),
      onFetchOrder: () => events.push(["fetch-order"]),
      onBusy: (value) => events.push(["busy", value]),
    },
  );
  for (const name of [
    "v-btn",
    "v-icon",
    "v-tooltip",
    "u-price",
    "v-theme-provider",
  ])
    app.component(name, leaf(name));
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    getDeliveryStateString: (value) => value,
    getStatusString: (value) => value,
    getLocalTimeString: (value) => value,
  });
  const html = await renderToString(app);
  return { html, events };
}

test("task passes dark theme to native descendants and its delivery stepper", async () => {
  await renderTask(roleNames[0], basket(), false, true);
  assert.equal(
    calls.find(({ name }) => name === "v-theme-provider").attrs.theme,
    "dark",
  );
  assert.equal(
    calls.find(({ name }) => name === "SOrderDeliveryStatusStepper").attrs.dark,
    true,
  );
  await renderTask(roleNames[0]);
  assert.equal(
    calls.find(({ name }) => name === "v-theme-provider").attrs.theme,
    undefined,
  );
  assert.equal(
    calls.find(({ name }) => name === "SOrderDeliveryStatusStepper").attrs.dark,
    false,
  );
});
test("task uses only the matching native role widget and forwards exact native action payloads", async () => {
  const native = [
    "BOrderDashboardCart",
    "BOrderDashboardPreparing",
    "BOrderDashboardDelivery",
    "SOrderBasketReturn",
  ];
  for (let index = 0; index < roleNames.length; index++) {
    const { html, events } = await renderTask(roleNames[index]);
    const matching = calls.filter(({ name }) => native.includes(name));
    assert.equal(matching.length, 1);
    assert.equal(matching[0].name, native[index]);
    assert.equal(matching[0].attrs.modern, "");
    assert.equal(matching[0].attrs["is-role-panel"], "");
    assert.equal(matching[0].attrs.basket.price, 0.00002884);
    assert.ok(
      calls.some(
        ({ name, attrs }) =>
          name === "u-price" &&
          attrs.amount === 0.00002884 &&
          attrs.currency === "BTC",
      ),
    );
    assert.match(html, /SM-21/);
    const callback = () => {};
    if (index === 0) {
      matching[0].attrs.onConfirmOrder({ list: [], callback });
      assert.equal(events[0][1].state, states.OrderConfirm.code);
      assert.deepEqual(events[0][1].list, []);
      assert.equal(events[0][1].callback, callback);
      assert.ok(
        !calls.some(({ name }) => name === "BOrderDashboardPayment"),
        "Payment stays lazy until its disclosure opens",
      );
      await renderTask(roleNames[index], basket(), true);
      assert.ok(
        calls.some(
          ({ name, attrs }) =>
            name === "BOrderDashboardPayment" && attrs["is-role-panel"] === "",
        ),
      );
    }
    if (index === 1) {
      matching[0].attrs.onConfirmPreparing({ callback });
      assert.equal(events[0][1].state, states.PreparingOrder.code);
      assert.equal(events[0][1].delivery_info, undefined);
      assert.equal(events[0][1].callback, callback);
    }
    if (index === 2) {
      matching[0].attrs.onConfirmSend({ callback });
      matching[0].attrs.onConfirmReceived({ callback });
      assert.deepEqual(
        events.map(([, value]) => value.state),
        [states.SentOrder.code, states.ToCustomer.code],
      );
    }
    if (index === 3) {
      matching[0].attrs.onBusy(true);
      assert.deepEqual(events, [["busy", true]]);
      assert.match(html, /role_workspace.no_returns/);
    }
    if (index !== 0)
      assert.ok(!calls.some(({ name }) => name === "BOrderDashboardPayment"));
  }
  for (const status of [
    Basket.Status.Reserved.code,
    Basket.Status.Canceled.code,
  ]) {
    await renderTask(roleNames[0], basket(21, { status }));
    assert.equal(
      calls.find(({ name }) => name === "BOrderDashboardCart").attrs.inert,
      true,
    );
  }
});

test("native checking permits an empty item selection and native packing keeps optional fields optional", () => {
  let emitted;
  const checking = {
    modern: true,
    busy: false,
    readonly: false,
    isActionDisabled: false,
    basket: basket(),
    $refs: { basket_items_list: { getCheckedItems: () => [] } },
    $emit: (name, value) => {
      emitted = [name, value];
    },
  };
  Object.defineProperty(checking, "isConfirmDisabled", {
    get: () => NativeCart.computed.isConfirmDisabled.call(checking),
  });
  NativeCart.methods.orderConfirm.call(checking);
  assert.equal(emitted[0], "confirm-order");
  assert.deepEqual(plain(emitted[1].list), []);
  assert.equal(checking.busy, true);
  emitted[1].callback();
  assert.equal(checking.busy, false);
  const packing = {
    modern: true,
    busy: false,
    isActive: true,
    basket: basket(21, { delivery_state: states.OrderConfirm.code }),
    delivery_info: {},
    $emit: (name, value) => {
      emitted = [name, value];
    },
  };
  Object.defineProperty(packing, "is_ready_action_disabled", {
    get: () => NativePreparing.computed.is_ready_action_disabled.call(packing),
  });
  NativePreparing.methods.preparingOrder.call(packing);
  assert.equal(emitted[0], "confirm-preparing");
  assert.equal(packing.busy, true);
  assert.deepEqual(plain(emitted[1].delivery_info), { volume: {} });
  emitted[1].callback();
  assert.equal(packing.busy, false);
});
