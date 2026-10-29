import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Exercise the real handlers with synthetic records and deferred requests only.
const read = (file) => readFileSync(new URL(file, import.meta.url), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const tick = async () => {
  await new Promise((resolve) => setImmediate(resolve));
  await Vue.nextTick();
};
function evaluate(source, require = () => ({}), globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, require, ...globals },
  );
  return exports;
}

const calls = [],
  alerts = [],
  confirmations = [];
const axios = Object.fromEntries(
  ["get", "post", "put", "delete"].map((method) => [
    method,
    (url, payload) => {
      let resolve, reject;
      const promise = new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      });
      calls.push({
        method,
        url,
        payload,
        resolve: (data) => resolve({ data }),
        reject,
      });
      return promise;
    },
  ]),
);
const notifications = Object.fromEntries(
  ["showErrorAlert", "showSuccessAlert", "showLaravelError"].map((name) => [
    name,
    (...args) => alerts.push([name, ...args]),
  ]),
);
notifications.openDangerAlert = (...args) => confirmations.push(args);
const fixtureWindow = {
  API: {
    POST_BASKET_CHAT_ADD_MESSAGE: (shop, order) =>
      `/fixture/shops/${shop}/orders/${order}/chat`,
    POST_BASKET_SEND_ORDER_UPDATE_STATUS_EMAIL: (shop, order) =>
      `/fixture/shops/${shop}/orders/${order}/email`,
    GET_SHOP_TEMPLATE_MESSAGES: (shop) => `/fixture/shops/${shop}/replies`,
    POST_SHOP_TEMPLATE_MESSAGE_ADD: (shop) => `/fixture/shops/${shop}/replies`,
    PUT_SHOP_TEMPLATE_MESSAGE_EDIT: (shop, id) =>
      `/fixture/shops/${shop}/replies/${id}`,
    GET_SHOP_EMAIL_RENDER_URL: (shop, type) =>
      `/fixture/shops/${shop}/email/${type}`,
    POST_BASKET_CREATE_SECURE_LINK: (shop, order) =>
      `/fixture/shops/${shop}/orders/${order}/guest`,
    POST_POS_BASKET_CREATE_SECURE_LINK: (shop, order) =>
      `/fixture/shops/${shop}/pos/${order}/guest`,
    DELETE_BASKET_CHAT_MESSAGE: (shop, order, index) =>
      `/fixture/shops/${shop}/orders/${order}/chat/${index}`,
  },
  XAPI: {
    DELETE_CUSTOMER_BASKET_CHAT_MESSAGE: (shop, order, index) =>
      `/fixture/customer/${shop}/orders/${order}/chat/${index}`,
  },
};

const files = [
  "./BOrderChatBox.vue",
  "../../share/BOrderShare.vue",
  "../../../../storefront/order/chat/message/SOrderChatMessage.vue",
  "../../../../ui/smart/suggestion/USmartSuggestion.vue",
];
const components = {},
  componentNames = {};
let component, renderNames;
for (const file of files) {
  const { descriptor, errors } = parse(read(file));
  assert.deepEqual(errors, [], file);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: "order-chat-test",
  });
  assert.deepEqual(template.errors, [], file);
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({
      source: style.content,
      filename: file,
      id: "order-chat-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(compiled.errors, [], file);
  }
  if (file !== files[3]) {
    const loaded = evaluate(
      descriptor.script.content,
      (name) => {
        if (name === "vue") return Vue;
        if (name === "@selldone/core-js/models")
          return {
            Product: {
              ProductType: {
                PHYSICAL: "PHYSICAL",
                VIRTUAL: "VIRTUAL",
                FILE: "FILE",
                SERVICE: "SERVICE",
                SUBSCRIPTION: "SUBSCRIPTION",
              },
            },
          };
        if (name === "@selldone/core-js/helper")
          return {
            ShopOptionsHelper: {
              HasGuestCheckout: (shop) => shop.guest_checkout !== false,
            },
            ShopURLs: { MainShopUrl: () => "https://shop.example.invalid" },
          };
        if (name.includes("DateMixin"))
          return {
            default: {
              methods: {
                getFromNowString: () => "Fixture relative date",
                getLocalTimeString: () => "Fixture exact datetime",
              },
            },
          };
        return {
          default: name.includes("NotificationService") ? notifications : {},
        };
      },
      { axios, window: fixtureWindow, $t: (key) => key },
    ).default;
    loaded.render = evaluate(template.code, () => Vue).render;
    components[file] = loaded;
    componentNames[file] = [
      ...template.code.matchAll(/resolveComponent\("([^"]+)"/g),
    ].map((match) => match[1]);
    if (file === files[0]) {
      component = loaded;
      renderNames = componentNames[file];
    }
  }
}
const t = (key) => key;
const globalMethods = {
  USER: () => ({ name: "Fixture staff" }),
  USER_ID: () => 8,
  getUserAvatar: (id) => `/fixture/avatar/${id}.png`,
  getBasketOrderCode: (basket) => `FIX-${basket.id}`,
  AddOrUpdateItemByID(items, item) {
    const index = items.findIndex((row) => row.id === item.id);
    if (index < 0) items.unshift(item);
    else items.splice(index, 1, item);
  },
};
function context(values = {}, definition = component) {
  const state = {
    modern: true,
    ...definition.data(),
    ...globalMethods,
    basket: {
      id: 25,
      chat: [],
      buyer: { name: "Fixture buyer", email: "buyer@example.invalid" },
    },
    $shop: { id: 7, mail_service: { enable: true, errors: 0 } },
    $t: t,
    $route: { query: { signature: "fixture-only-signature", timestamp: "0" } },
    $refs: {},
    $nextTick: (callback) => Vue.nextTick(callback),
    ...values,
  };
  for (const [name, method] of Object.entries(definition.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(definition.computed || {}))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  return state;
}

assert.equal(component.props.modern.default, false);
for (const body_input of [null, "", " \n\t ", "a".repeat(1025)]) {
  const state = context({ body_input }),
    before = calls.length;
  assert.equal(state.canSendMessage, false);
  state.addChat();
  assert.equal(calls.length, before);
}
let state = context({ body_input: "Valid draft", busy_add: true });
let before = calls.length;
state.addChat();
assert.equal(calls.length, before);
state = context({ body_input: "  Exact draft\nwith newline  " });
state.addChat();
let request = calls.at(-1);
assert.equal(state.busy_add, true);
assert.equal(request.method, "post");
assert.equal(request.url, "/fixture/shops/7/orders/25/chat");
assert.deepEqual(plain(request.payload), {
  body: "  Exact draft\nwith newline  ",
});
before = calls.length;
state.addChat();
assert.equal(calls.length, before);
const chat = [{ body: "Fixture reply", officer: true }];
request.resolve({ chat });
await tick();
assert.equal(state.body_input, null);
assert.equal(state.basket.chat, chat);
assert.equal(Boolean(state.busy_add), false);
assert.equal(alerts.at(-1)[0], "showSuccessAlert");
for (const failure of ["server", "network"]) {
  state.body_input = "Keep failed draft";
  state.addChat();
  if (failure === "server")
    calls
      .at(-1)
      .resolve({ error: true, error_msg: "Fixture validation error" });
  else calls.at(-1).reject(new Error("Fixture disconnected"));
  await tick();
  assert.equal(state.body_input, "Keep failed draft");
  assert.equal(Boolean(state.busy_add), false);
  assert.equal(state.basket.chat, chat);
}
state = context({ modern: false, body_input: " " });
state.addChat();
assert.equal(calls.at(-1).payload.body, " ");
calls.at(-1).resolve({ chat: [] });
await tick();

state = context({ body_input: "Existing draft", dialog_templates: true });
const template = "Hi {buyer_name}, order {order_id}; {buyer_name} / {order_id}";
before = calls.length;
state.setTemplate(template);
assert.equal(state.body_input, "Existing draft");
assert.equal(state.dialog_replace, true);
assert.equal(state.pending_template_body, template);
assert.equal(calls.length, before);
state.busy_add = true;
state.applyPendingTemplate();
assert.equal(state.body_input, "Existing draft");
state.setTemplate("Other reply");
assert.equal(state.pending_template_body, template);
let focused = 0;
state.$refs.modernMessage = {
  $el: { querySelector: () => ({ focus: () => focused++ }) },
};
state.busy_add = false;
state.applyPendingTemplate();
await tick();
assert.equal(
  state.body_input,
  "Hi Fixture buyer, order FIX-25; {buyer_name} / {order_id}",
);
assert.equal(state.pending_template_body, null);
assert.equal(state.dialog_replace, false);
assert.equal(state.dialog_templates, false);
assert.equal(focused, 1);
assert.equal(calls.length, before);
state = context({ body_input: " \n " });
state.setTemplate("{buyer_name} / {order_id}");
assert.equal(state.body_input, "Fixture buyer / FIX-25");
assert.equal(state.dialog_replace, false);
state = context({ modern: false, body_input: "Legacy draft" });
state.setTemplate(template);
assert.equal(
  state.body_input,
  "Hi Fixture buyer, order FIX-25; {buyer_name} / {order_id}",
);
assert.equal(state.dialog_replace, false);
assert.equal(
  context({ basket: { id: 25 } }).personalizeTemplate("Hi {buyer_name}"),
  "Hi global.commons.guest",
);

state = context({ template_body: "Hello buyer" });
let selection;
const field = {
  selectionStart: 6,
  selectionEnd: 11,
  focus: () => focused++,
  setSelectionRange: (...range) => (selection = range),
};
state.$refs.templateBody = { $el: { querySelector: () => field } };
state.insertTemplateVariable("{buyer_name}");
await tick();
assert.equal(state.template_body, "Hello {buyer_name}");
assert.deepEqual(selection, [18, 18]);
state.template_body = "a".repeat(1000);
field.selectionStart = field.selectionEnd = 1000;
state.insertTemplateVariable("{order_id}");
assert.equal(state.template_body.length, 1000);

for (const invalid of [
  { template_title: " " },
  { template_body: "\n" },
  { template_title: "a".repeat(65) },
  { template_body: "a".repeat(1001) },
  { busy_save_template: true },
]) {
  state = context({
    template_title: "Fixture reply",
    template_body: "Fixture message",
    ...invalid,
  });
  before = calls.length;
  assert.equal(state.canSaveTemplate, false);
  state.saveTemplate();
  assert.equal(calls.length, before);
}
state = context({
  dialog_templates: true,
  template_title: "Old",
  template_body: "Old",
  selected_template: { id: 2 },
});
state.showAddTemplateMessage();
assert.equal(state.dialog_templates, false);
assert.equal(state.dialog_add_template, true);
assert.equal(state.template_title, null);
assert.equal(state.template_body, null);
assert.equal(state.selected_template, null);
state.template_title = "a".repeat(64);
state.template_body = "b".repeat(1000);
state.saveTemplate();
request = calls.at(-1);
assert.equal(request.method, "post");
assert.equal(request.url, "/fixture/shops/7/replies");
assert.deepEqual(plain(request.payload), {
  title: state.template_title,
  body: state.template_body,
});
const reply = { id: 4, title: "Saved fixture", body: "Saved body" };
request.resolve({ template: reply });
await tick();
assert.equal(state.templates[0], reply);
assert.equal(state.dialog_add_template, false);
assert.equal(Boolean(state.busy_save_template), false);
state.showEditTemplateMessage(reply);
assert.equal(state.template_body, reply.body);
assert.equal(state.selected_template, reply);
state.template_body = "Edited fixture";
state.saveTemplate();
request = calls.at(-1);
assert.equal(request.method, "put");
assert.equal(request.url, "/fixture/shops/7/replies/4");
request.resolve({ template: { ...reply, body: "Edited fixture" } });
await tick();
assert.equal(state.templates.length, 1);
assert.equal(state.templates[0].body, "Edited fixture");
for (const failure of ["server", "network"]) {
  state.showEditTemplateMessage(reply);
  state.saveTemplate();
  if (failure === "server")
    calls.at(-1).resolve({ error: true, error_msg: "Fixture reply error" });
  else calls.at(-1).reject(new Error("Fixture reply disconnected"));
  await tick();
  assert.equal(state.dialog_add_template, true);
  assert.equal(state.template_body, reply.body);
  assert.equal(Boolean(state.busy_save_template), false);
}

state = context({ templates: [reply] });
for (const failure of ["server", "network"]) {
  state.fetchMessageTemplates();
  request = calls.at(-1);
  assert.equal(request.method, "get");
  assert.equal(request.url, "/fixture/shops/7/replies");
  assert.deepEqual(plain(request.payload), {
    params: { offset: 0, limit: 20 },
  });
  before = calls.length;
  state.fetchMessageTemplates();
  assert.equal(calls.length, before);
  if (failure === "server")
    request.resolve({ error: true, error_msg: "Fixture load error" });
  else request.reject(new Error("Fixture load disconnected"));
  await tick();
  assert.equal(state.templates_failed, true);
  assert.equal(Boolean(state.busy_fetch_templates), false);
  assert.equal(state.templates[0], reply);
}
state.fetchMessageTemplates();
assert.equal(state.templates_failed, false);
calls.at(-1).resolve({ templates: [] });
await tick();
assert.equal(state.templates.length, 0);
assert.equal(state.templates_failed, false);

state = context({
  basket: {
    id: 25,
    buyer: { name: "No buyer email" },
    customer: { email: "fallback@example.invalid" },
  },
});
assert.equal(state.statusEmailRecipient, "fallback@example.invalid");
for (const mail_service of [
  null,
  { enable: false },
  { enable: true, errors: 100 },
  { enable: true, errors: 101 },
]) {
  state.$shop.mail_service = mail_service;
  before = calls.length;
  assert.equal(state.emailServiceReady, false);
  state.sendOrderUpdateEmail();
  assert.equal(calls.length, before);
}
state.$shop.mail_service = { enable: true, errors: 99 };
state.busy_send_update = true;
before = calls.length;
state.sendOrderUpdateEmail();
assert.equal(calls.length, before);
state.busy_send_update = false;
state.basket.customer.email = "";
state.sendOrderUpdateEmail();
assert.equal(calls.length, before);
state.basket.customer.email = "fallback@example.invalid";
state.email_preview = true;
state.sendOrderUpdateEmail();
request = calls.at(-1);
assert.equal(request.url, "/fixture/shops/7/orders/25/email");
assert.deepEqual(plain(request.payload), { email: true });
request.resolve({});
await tick();
assert.equal(state.email_preview, false);
assert.equal(Boolean(state.busy_send_update), false);
for (const failure of ["server", "network"]) {
  state.email_preview = true;
  state.sendOrderUpdateEmail();
  if (failure === "server")
    calls.at(-1).resolve({ error: true, error_msg: "Fixture mail error" });
  else calls.at(-1).reject(new Error("Fixture mail disconnected"));
  await tick();
  assert.equal(state.email_preview, true);
  assert.equal(Boolean(state.busy_send_update), false);
}
state = context({ modern: false, $shop: { id: 7 }, basket: { id: 25 } });
before = calls.length;
state.sendOrderUpdateEmail();
assert.equal(calls.length, before + 1);
calls.at(-1).resolve({});
await tick();

// Mount the compiled template to check Cancel and the actual basket watcher.
const node = (type, text = "") => ({
  type,
  text,
  props: {},
  children: [],
  parent: null,
});
const renderer = Vue.createRenderer({
  createElement: node,
  createText: (text) => node("text", text),
  createComment: (text) => node("comment", text),
  setText: (target, text) => (target.text = text),
  setElementText: (target, text) => {
    target.text = text;
    target.children = [];
  },
  patchProp: (target, key, previous, value) => (target.props[key] = value),
  parentNode: (target) => target.parent,
  nextSibling: (target) =>
    target.parent?.children[target.parent.children.indexOf(target) + 1] ?? null,
  insert(target, parent, anchor) {
    target.parent = parent;
    const index = parent.children.indexOf(anchor);
    parent.children.splice(
      index < 0 ? parent.children.length : index,
      0,
      target,
    );
  },
  remove(target) {
    if (target.parent)
      target.parent.children.splice(target.parent.children.indexOf(target), 1);
  },
});
const passthrough = {
  inheritAttrs: false,
  setup:
    (_, { slots, attrs }) =>
    () =>
      Vue.h("widget", attrs, [slots.default?.()]),
};
const button = {
  inheritAttrs: false,
  setup:
    (_, { slots, attrs }) =>
    () =>
      Vue.h("button", attrs, slots.default?.()),
};
const dialog = {
  props: ["modelValue"],
  setup:
    (props, { slots }) =>
    () =>
      props.modelValue ? Vue.h("dialog", {}, slots.default?.()) : null,
};
const root = node("root"),
  basket = Vue.reactive({ id: 25, chat: [], buyer: { name: "Fixture buyer" } });
const app = renderer.createApp(
  {
    ...component,
    created: undefined,
    components: Object.fromEntries(
      Object.keys(component.components).map((name) => [name, passthrough]),
    ),
  },
  { basket, modern: true },
);
app.provide("$shop", { id: 7 });
app.mixin({ methods: globalMethods });
Object.assign(app.config.globalProperties, {
  $t: t,
  $tm: () => [],
  $route: { params: { shop_id: 7 } },
});
for (const name of renderNames)
  app.component(
    name,
    name === "v-btn"
      ? button
      : ["v-dialog", "v-bottom-sheet"].includes(name)
        ? dialog
        : passthrough,
  );
app.config.warnHandler = () => {};
const mounted = app.mount(root);
mounted.body_input = "Preserved by Cancel";
mounted.setTemplate(template);
await tick();
const flatten = (target) => [target, ...target.children.flatMap(flatten)];
const text = (target) =>
  target.type === "comment"
    ? ""
    : target.text + target.children.map(text).join("");
const cancel = flatten(root).find(
  (target) =>
    target.type === "button" && text(target).includes("global.actions.cancel"),
);
assert(cancel);
before = calls.length;
cancel.props.onClick();
await tick();
assert.equal(mounted.dialog_replace, false);
assert.equal(mounted.body_input, "Preserved by Cancel");
assert.equal(calls.length, before);
mounted.dialog_templates =
  mounted.dialog_add_template =
  mounted.dialog_replace =
  mounted.email_preview =
    true;
mounted.pending_template_body = "Pending fixture";
basket.id = 26;
await tick();
assert.equal(mounted.body_input, null);
assert.equal(mounted.pending_template_body, null);
for (const name of [
  "dialog_templates",
  "dialog_replace",
  "dialog_add_template",
  "email_preview",
])
  assert.equal(mounted[name], false);
app.unmount();
state = context({
  modern: false,
  body_input: "Legacy draft",
  email_preview: true,
});
component.watch["basket.id"].call(state);
assert.equal(state.body_input, "Legacy draft");
assert.equal(state.email_preview, true);

const finish = (request, outcome, data) =>
  outcome === "network"
    ? request.reject(new Error("Fixture delayed failure"))
    : request.resolve(
        outcome === "server"
          ? { error: true, error_msg: "Fixture delayed validation" }
          : data,
      );
const boxSnapshot = (state, busy) =>
  plain({
    body: state.body_input,
    chat: state.basket.chat,
    templates: state.templates,
    editor: state.dialog_add_template,
    email: state.email_preview,
    failed: state.templates_failed,
    busy: state[busy],
  });
const operations = [
  ["addChat", "busy_add", { chat: [{ body: "Old response" }] }],
  ["sendOrderUpdateEmail", "busy_send_update", {}],
  ["fetchMessageTemplates", "busy_fetch_templates", { templates: [reply] }],
  ["saveTemplate", "busy_save_template", { template: reply }],
];
for (const [method, busy, response] of operations) {
  for (const change of [
    "shop",
    "unmount",
    ...(["addChat", "sendOrderUpdateEmail"].includes(method) ? ["basket"] : []),
  ]) {
    for (const outcome of ["success", "server", "network"]) {
      state = context({
        body_input: "Original draft",
        template_title: "Original reply",
        template_body: "Original body",
        dialog_add_template: true,
        email_preview: true,
      });
      state[method]();
      const old = calls.at(-1);
      if (change === "unmount") component.beforeUnmount.call(state);
      else {
        if (change === "basket") state.basket.id++;
        else state.$shop.id++;
        state[busy] = false;
        state.body_input = "Current draft";
        state.templates = [{ id: 91, title: "Current shop reply" }];
        state[method]();
      }
      const current = calls.at(-1),
        snapshot = boxSnapshot(state, busy),
        noticeCount = alerts.length;
      finish(old, outcome, response);
      await tick();
      assert.deepEqual(
        boxSnapshot(state, busy),
        snapshot,
        `${method}: ${change} ignores old ${outcome} and finally`,
      );
      assert.equal(alerts.length, noticeCount);
      if (current !== old) {
        current.resolve(response);
        await tick();
      }
    }
  }
  state = context({
    modern: false,
    body_input: "Legacy original",
    template_title: "Legacy reply",
    template_body: "Legacy body",
  });
  state[method]();
  request = calls.at(-1);
  state.basket.id++;
  state.$shop.id++;
  component.beforeUnmount.call(state);
  request.resolve(response);
  await tick();
  assert.equal(
    Boolean(state[busy]),
    false,
    `${method}: legacy request lifecycle retained`,
  );
}
state = context({
  body_input: "Draft",
  pending_template_body: "Reply",
  busy_add: true,
  busy_send_update: true,
  busy_save_template: true,
  dialog_templates: true,
  dialog_replace: true,
  dialog_add_template: true,
  email_preview: true,
  templates: [reply],
});
state.$shop.id++;
component.watch["$shop.id"].call(state);
assert.equal(state.body_input, null);
assert.equal(state.pending_template_body, null);
assert.equal(state.templates.length, 0);
assert.equal(state.busy_add, false);
assert.equal(state.busy_send_update, false);
assert.equal(state.busy_save_template, false);
assert.equal(calls.at(-1).url, "/fixture/shops/8/replies");
calls.at(-1).resolve({ templates: [] });
await tick();
state = context({
  busy_save_template: true,
  template_title: "Keep title",
  template_body: "Keep body",
  selected_template: reply,
});
state.showAddTemplateMessage();
state.showEditTemplateMessage({ id: 9, title: "Other", body: "Other" });
assert.equal(state.template_title, "Keep title");
assert.equal(state.template_body, "Keep body");
assert.equal(state.selected_template, reply);

const share = components[files[1]],
  messageComponent = components[files[2]];
const shareContext = (values = {}) =>
  context({ basket: { id: 25, type: "PHYSICAL" }, ...values }, share);
const messageContext = (values = {}) => {
  const message = {
    officer: true,
    body: "Fixture staff reply",
    date: "2026-10-28T10:00:00Z",
  };
  return context(
    {
      isAdmin: true,
      hasDelete: true,
      message,
      basket: { id: 25, chat: [message] },
      ...values,
    },
    messageComponent,
  );
};
assert.equal(share.props.modern.default, false);
assert.equal(messageComponent.props.modern.default, false);
for (const [definition, make, method, busy, response] of [
  [
    share,
    shareContext,
    "createSecureLink",
    "busy_secure_link",
    { url: "fixture-guest-access" },
  ],
  [
    messageComponent,
    messageContext,
    "deleteMessage",
    "busy_delete_message",
    { chat: [] },
  ],
]) {
  for (const change of [
    "basket",
    "shop",
    "unmount",
    ...(definition === messageComponent ? ["message"] : []),
  ]) {
    for (const outcome of ["success", "server", "network"]) {
      state = make();
      state[method]();
      const old = calls.at(-1);
      if (change === "unmount") definition.beforeUnmount.call(state);
      else {
        if (change === "basket") {
          state.basket.id++;
          definition.watch["basket.id"].call(state);
        }
        if (change === "shop") {
          state.$shop.id++;
          definition.watch["$shop.id"].call(state);
        }
        if (change === "message") {
          state.message = { officer: true, body: "Current message" };
          state.basket.chat = [state.message];
          definition.watch.message.call(state);
        }
        assert.equal(state[busy], false);
        state[method]();
      }
      const current = calls.at(-1),
        chat = state.basket.chat,
        secureLink = state.secure_link,
        noticeCount = alerts.length;
      finish(old, outcome, response);
      await tick();
      assert.equal(
        state[busy],
        true,
        `${method}: old ${change} finally does not clear current busy state`,
      );
      assert.equal(state.basket.chat, chat);
      assert.equal(state.secure_link, secureLink);
      assert.equal(alerts.length, noticeCount);
      if (current !== old) {
        current.resolve(response);
        await tick();
        assert.equal(Boolean(state[busy]), false);
      }
    }
  }
  state = make({ modern: false });
  state[method]();
  request = calls.at(-1);
  state.basket.id++;
  state.$shop.id++;
  definition.beforeUnmount.call(state);
  request.resolve(response);
  await tick();
  assert.equal(Boolean(state[busy]), false);
  if (definition === share) assert.equal(state.secure_link, response.url);
  else assert.equal(state.basket.chat, response.chat);
}
for (const watcher of ["basket.id", "$shop.id"]) {
  state = shareContext({
    secure_link: "fixture-previous-access",
    dialog_guest: true,
    busy_secure_link: true,
  });
  share.watch[watcher].call(state);
  assert.equal(state.secure_link, null);
  assert.equal(state.dialog_guest, false);
  assert.equal(state.busy_secure_link, false);
  state = shareContext({
    modern: false,
    secure_link: "fixture-legacy-access",
    dialog_guest: true,
    busy_secure_link: true,
  });
  share.watch[watcher].call(state);
  assert.equal(state.secure_link, "fixture-legacy-access");
  assert.equal(state.dialog_guest, true);
  assert.equal(state.busy_secure_link, true);
}
for (const change of ["basket", "shop", "message", "unmount", "permission"]) {
  state = messageContext();
  before = calls.length;
  state.confirmDeleteMessage();
  assert.equal(calls.length, before);
  if (change === "basket") state.basket.id++;
  if (change === "shop") state.$shop.id++;
  if (change === "message") state.message = { officer: true };
  if (change === "unmount") messageComponent.beforeUnmount.call(state);
  if (change === "permission") state.isAdmin = false;
  confirmations.at(-1)[3]();
  assert.equal(
    calls.length,
    before,
    `Deletion confirmation rejects changed ${change}`,
  );
}
state = messageContext();
state.confirmDeleteMessage();
confirmations.at(-1)[3]();
request = calls.at(-1);
assert.equal(request.method, "delete");
assert.equal(request.url, "/fixture/shops/7/orders/25/chat/0");
assert.deepEqual(plain(request.payload), {
  params: { signature: "fixture-only-signature", timestamp: "0" },
});
request.resolve({ chat: [] });
await tick();
assert.equal(state.busy_delete_message, false);
state = messageContext({ modern: false, isAdmin: false });
state.$shop.name = "fixture-shop";
state.message.officer = false;
state.deleteMessage();
request = calls.at(-1);
assert.equal(request.url, "/fixture/customer/fixture-shop/orders/25/chat/0");
request.resolve({ chat: [] });
await tick();
assert.equal(alerts.at(-1)[2], "Message has been deleted successfully.");

// Render synthetic untrusted copy to verify interpolation remains escaped.
const unsafe = '<img src=x onerror="fixture()">\n<script>fixture()</script>';
const ssrStub = {
  inheritAttrs: false,
  setup:
    (_, { slots, attrs }) =>
    () =>
      Vue.h("widget", attrs, [
        slots.activator?.({ props: {} }),
        slots.default?.(),
      ]),
};
for (const file of [files[0], files[2]]) {
  const definition = components[file];
  const rendered = Vue.createSSRApp(
    {
      ...definition,
      created: undefined,
      components: Object.fromEntries(
        Object.keys(definition.components || {}).map((name) => [name, ssrStub]),
      ),
      data: () => ({
        ...definition.data(),
        dialog_templates: true,
        templates: [{ id: 5, title: unsafe, body: unsafe }],
      }),
    },
    {
      modern: true,
      basket: { id: 25, chat: [], buyer: { name: "Fixture buyer" } },
      message: {
        body: unsafe,
        user_name: unsafe,
        officer: true,
        date: "2026-10-28T10:00:00Z",
      },
    },
  );
  rendered.provide("$shop", { id: 7 });
  rendered.mixin({ methods: globalMethods });
  Object.assign(rendered.config.globalProperties, {
    $t: t,
    $tm: () => [],
    $route: { params: { shop_id: 7 } },
  });
  for (const name of componentNames[file])
    rendered.component(
      name,
      ["v-dialog", "v-bottom-sheet"].includes(name) ? dialog : ssrStub,
    );
  rendered.config.warnHandler = () => {};
  const html = await renderToString(rendered);
  assert(
    html.includes(
      "&lt;img src=x onerror=&quot;fixture()&quot;&gt;\n&lt;script&gt;fixture()&lt;/script&gt;",
    ),
  );
  assert(!html.includes("<img src=x"));
  assert(!html.includes("<script>fixture()"));
}

const dictionaries = ["en", "fa"].map(
  (locale) =>
    evaluate(read(`../../../../../translate/dashboard/${locale}.ts`)).default
      .b_order_chat_box.modern,
);
function keys(value, prefix = "") {
  return Object.entries(value).flatMap(([name, entry]) =>
    typeof entry === "object"
      ? keys(entry, prefix + name + ".")
      : (assert.equal(typeof entry, "string"),
        assert(entry.trim()),
        [prefix + name]),
  );
}
assert.deepEqual(keys(dictionaries[0]).sort(), keys(dictionaries[1]).sort());
for (const file of files.slice(0, 3)) {
  for (const [, key] of read(file).matchAll(
    /b_order_chat_box\.modern\.([a-z_.]+)/g,
  )) {
    for (const dictionary of dictionaries)
      assert.equal(
        typeof key
          .split(".")
          .reduce((value, part) => value?.[part], dictionary),
        "string",
        key,
      );
  }
}
console.log(
  "PASS: order chat SFC/styles, composer/reply/mail behavior, context changes and late callbacks, guarded sharing/deletion, escaped rendered copy, legacy behavior, and EN/FA keys. Mock requests only.",
);
