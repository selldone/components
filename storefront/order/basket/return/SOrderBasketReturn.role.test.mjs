import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Real component and enums, with an isolated deferred transport instead of HTTP.
const root = new URL("../../../../", import.meta.url);
function evaluate(source, require, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require, ...globals });
  return exports;
}
const read = (path) => readFileSync(new URL(path, root), "utf8");
const { ShopRoles } = evaluate(read("../core-js/enums/staff/ShopRoles.ts"), (path) => ({ default: path }));
const { BasketItemReturn } = evaluate(read("../core-js/models/shop/order/basket/basket_item_return.model.ts"), () => ({}));
const requests = [], notices = [];
const notifications = Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"].map(
  (name) => [name, (...args) => notices.push({ name, args })],
));
const filename = new URL("./SOrderBasketReturn.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
compileScript(descriptor, { id: "return-role-test" });
const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "return-role-test" });
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const result = await compileStyleAsync({ source: style.content, filename: filename.pathname,
    id: "return-role-test", scoped: style.scoped, preprocessLang: style.lang });
  assert.deepEqual(result.errors, []);
}
const component = evaluate(descriptor.script.content, (path) => {
  if (path.endsWith("NotificationService.ts")) return { default: notifications };
  if (path.endsWith("/ShopRoles")) return { ShopRoles };
  if (path === "@selldone/core-js") return { BasketItemReturn };
  return { default: {} };
}, {
  axios: { post: (url, payload) => {
    let resolve, reject;
    const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
    requests.push({ url, payload, resolve, reject });
    return promise;
  } },
  window: {
    API: {
      POST_MY_ROLE_TASK_ACTION: (role, basket, action) => `role/${role}/basket/${basket}/${action}`,
      POST_UPDATE_RETURN_REQUEST_STATE: (shop, basket, item) => `shop/${shop}/basket/${basket}/item/${item}/return`,
    },
    CDN: { GET_SHOP_TEMP_FILE_PATH: (path) => `/fixture/return/${path}` },
  },
}).default;

function fixture(overrides = {}) {
  requests.length = notices.length = 0;
  const item = { id: 51, product_id: 9, product: { title: "Fixture product", title_en: "Fixture alternate title" },
    variant: { title: "Fixture variant" }, return_request: {
      id: 61, count: 2, state: "Pending", reason: "U1", note: "Fixture return note",
      created_at: "2026-01-08T12:00:00Z", image: "image.jpg", video: "video.mp4", voice: "voice.mp3",
    } };
  const context = {
    ...component.data(), modern: true, isRolePanel: true, isAdmin: false,
    role: { id: 7, level: ShopRoles.PhysicalOrdersSupport.code, accepted: true },
    basket: { id: 40, delivery_at: "2026-01-05T12:00:00Z", items: [item] },
    events: [], $route: { params: { shop_id: 33, basket_id: 40 }, query: {} }, $t: (key) => key,
    $emit(...event) { this.events.push(event); }, ...overrides,
  };
  for (const [name, method] of Object.entries(component.methods)) context[name] = method.bind(context);
  for (const [name, computed] of Object.entries(component.computed)) {
    Object.defineProperty(context, name, { get: () => computed.call(context) });
  }
  return { context, item };
}

// A shop admin flag cannot elevate a different role inside the role workspace.
for (const role of Object.values(ShopRoles)) {
  const { context, item } = fixture({ role: { id: 7, level: role.code, accepted: true }, isAdmin: true });
  assert.equal(context.canManage, role.code === ShopRoles.PhysicalOrdersSupport.code);
  if (!context.canManage) {
    context.updateReturnState(item, "Accepted");
    assert.equal(requests.length, 0);
  }
}
for (const overrides of [{ role: null }, { role: { level: ShopRoles.PhysicalOrdersSupport.code, accepted: false } },
  { role: { level: ShopRoles.PhysicalOrdersSupport.code } },
  { isRolePanel: false, isAdmin: false }]) {
  const { context, item } = fixture(overrides);
  context.updateReturnState(item, "Accepted");
  assert.equal(requests.length, 0);
}
for (const state of ["Pending", "accepted", "ACCEPT", "", null, undefined]) {
  const { context, item } = fixture();
  context.updateReturnState(item, state);
  assert.equal(requests.length, 0, `Invalid decision ${state}`);
}
for (const select of [(item) => ({ ...item }), (item) => ({ ...item, id: 99 }),
  (item) => { item.return_request = null; return item; },
  (item) => { item.return_request.state = "Accepted"; return item; }]) {
  const { context, item } = fixture();
  context.updateReturnState(select(item), "Accepted");
  assert.equal(requests.length, 0, "Only a current basket item and a changed valid decision may submit");
}

// A single pending request owns busy state and the decision can later be changed.
{
  const { context, item } = fixture();
  const operation = context.updateReturnState(item, "Accepted");
  assert.equal(context.busy_item, "Accepted51");
  assert.deepEqual(context.events, [["busy", true]]);
  context.updateReturnState(item, "Rejected");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "role/7/basket/40/return-request");
  assert.equal(requests[0].payload.item_id, item.id);
  assert.equal(requests[0].payload.state, "Accepted");
  requests[0].resolve({ data: { return_request: { ...item.return_request, state: "Accepted" } } });
  await operation;
  assert.equal(item.return_request.state, "Accepted");
  assert.equal(context.busy_item, null);
  assert.deepEqual(context.events.map(([event, value]) => [event, event === "updated" ? value.id : value]),
    [["busy", true], ["updated", 51], ["busy", false]]);
  for (const state of ["Rejected", "Accepted"]) {
    const next = context.updateReturnState(item, state);
    requests.at(-1).resolve({ data: { return_request: { ...item.return_request, state } } });
    await next;
    assert.equal(item.return_request.state, state);
    assert.equal(context.busy_item, null);
  }
}
for (const failure of ["api", "transport"]) {
  const { context, item } = fixture();
  const operation = context.updateReturnState(item, "Accepted");
  if (failure === "api") requests[0].resolve({ data: { error: true, error_msg: "Fixture failure" } });
  else requests[0].reject(new Error("Fixture failure"));
  await operation;
  assert.equal(item.return_request.state, "Pending");
  assert.equal(context.busy_item, null);
  assert.equal(notices[0].name, failure === "api" ? "showErrorAlert" : "showLaravelError");
  assert.deepEqual(context.events, [["busy", true], ["busy", false]]);
}

const changes = [
  (context) => { context.basket = { ...context.basket }; },
  (context) => { context.role = { ...context.role, id: 8 }; },
  (context) => { context.role.level = ShopRoles.PhysicalOrdersChecking.code; },
  (context) => { context.role.accepted = false; },
  (context) => { context.basket.items = []; },
  (context) => { context.basket.items = context.basket.items.map((item) => ({ ...item })); },
  (context) => component.beforeUnmount.call(context),
];
for (const change of changes) for (const reject of [false, true]) {
  const { context, item } = fixture();
  const original = item.return_request;
  const operation = context.updateReturnState(item, "Accepted");
  change(context);
  if (reject) requests[0].reject(new Error("Stale fixture failure"));
  else requests[0].resolve({ data: { return_request: { ...original, state: "Accepted" } } });
  await operation;
  assert.equal(item.return_request, original, "A stale operation must not replace the old item");
  assert.equal(notices.length, 0, "A stale operation must not toast");
  assert.equal(context.events.some(([event]) => event === "updated"), false);
  if (context.request_version === 1) assert.equal(context.busy_item, null);
  else assert.deepEqual(context.events, [["busy", true]], "Unmounted instances must not emit callbacks");
}
{
  const { context, item } = fixture({ isRolePanel: false, isAdmin: true, role: null });
  assert.equal(context.canManage, true);
  const operation = context.updateReturnState(item, "Rejected");
  assert.equal(requests[0].url, "shop/33/basket/40/item/51/return");
  requests[0].resolve({ data: { return_request: { ...item.return_request, state: "Rejected" } } });
  await operation;
  assert.equal(item.return_request.state, "Rejected");
}

const render = evaluate(template.code, (path) => path === "vue" ? Vue : "/fixture/icon.svg").render;
async function screen(overrides = {}, state = "Pending") {
  const { context, item } = fixture(overrides);
  item.return_request.state = state;
  const passthrough = { inheritAttrs: false, setup: (_, { slots, attrs }) => () => Vue.h("div", attrs,
    [slots.label?.(), slots.default?.()]) };
  const image = { props: ["src"], setup: (props) => () => Vue.h("img", { src: props.src }) };
  const button = { setup: (_, { slots, attrs }) => () => Vue.h("button", attrs, slots.default?.()) };
  const localComponents = Object.fromEntries(Object.keys(component.components).map((key) => [key, passthrough]));
  localComponents.CircleImage = image;
  const app = Vue.createSSRApp({ ...component, mixins: [], components: localComponents, render,
    methods: { ...component.methods, getProductImage: (id) => `/fixture/product/${id}.png`,
      getLocalTimeString: (value) => `date:${value}`, getFromOtherTimeString: () => "elapsed:3 days" },
  }, { modern: context.modern, basket: context.basket, role: context.role,
    isRolePanel: context.isRolePanel, isAdmin: context.isAdmin });
  for (const name of new Set(Array.from(template.code.matchAll(/resolveComponent\("([^"]+)"/g), (match) => match[1]))) {
    app.component(name, name === "v-btn" ? button : name === "v-img" ? image : passthrough);
  }
  Object.assign(app.config.globalProperties, { $route: context.$route, $t: context.$t, require: () => "/fixture/icon.svg" });
  return new JSDOM(await renderToString(app)).window.document;
}
for (const modern of [true, false]) {
  const document = await screen({ modern });
  assert.equal(document.querySelectorAll("button").length, 2);
  for (const text of ["Fixture product", "Fixture alternate title", "Fixture return note", "RR-61", "2",
    "global.return_order_reason.physical.U1", "date:2026-01-05T12:00:00Z", "date:2026-01-08T12:00:00Z", "elapsed:3 days"]) {
    assert.ok(document.body.textContent.includes(text), `Return detail retained: ${text}`);
  }
  for (const path of ["image.jpg", "video.mp4", "voice.mp3"]) {
    const link = document.querySelector(`a[href="/fixture/return/${path}"]`);
    assert.ok(link, `Attachment retained: ${path}`);
    assert.equal(link.target, "_blank");
    assert.equal(link.rel, "noopener noreferrer");
  }
}
for (const level of [ShopRoles.PhysicalOrdersChecking.code, ShopRoles.PhysicalOrdersPackaging.code, ShopRoles.PhysicalOrdersDelivery.code]) {
  assert.equal((await screen({ role: { id: 7, level, accepted: true }, isAdmin: true })).querySelectorAll("button").length, 0);
}
for (const state of ["Accepted", "Rejected"]) {
  const buttons = [...(await screen({}, state)).querySelectorAll("button")];
  assert.equal(buttons[state === "Accepted" ? 0 : 1].disabled, true);
  assert.equal(buttons[state === "Accepted" ? 1 : 0].disabled, false);
}
assert.equal((await screen({ isRolePanel: false, isAdmin: true })).querySelectorAll("button").length, 2);
console.log("Return SFC: role boundary, valid/member decisions, busy/errors/stale/unmount safety, changeable decisions and native details/attachments/admin rendering passed.");
