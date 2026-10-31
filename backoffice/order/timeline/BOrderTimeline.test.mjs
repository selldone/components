import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as Vue from "vue";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

// Exercise actual parent handlers and compiled templates with synthetic records only.
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 };
function evaluate(source, require = () => ({}), globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions }).outputText, {
    exports, require, ...globals,
  });
  return exports;
}
const read = name => readFileSync(new URL(name, import.meta.url), "utf8");
const timelineStatus = evaluate(read("../../../../core-js/enums/timeline/TimelineStatus.ts")).default;
const { TimelineEmailType } = evaluate(read("../../../../core-js/enums/timeline/TimelineEmailType.ts"));
const presentation = evaluate(read("./timelinePresentation.ts"));
const plain = value => JSON.parse(JSON.stringify(value));
const tick = async () => { await new Promise(resolve => setImmediate(resolve)); await Vue.nextTick(); };

function fakeHttp() {
  const calls = [];
  const request = (method, url, payload) => {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    calls.push({ method, url, payload, resolve: data => resolve({ data }), reject });
    return promise;
  };
  return { calls, api: Object.fromEntries(["get", "post", "put", "delete"].map(method => [method, (url, payload) => request(method, url, payload)])) };
}
function fakeNotifications() {
  const alerts = [], confirmations = [];
  return {
    alerts, confirmations,
    api: {
      showErrorAlert: (...args) => alerts.push(["error", ...args]),
      showSuccessAlert: (...args) => alerts.push(["success", ...args]),
      showWarningAlert: (...args) => alerts.push(["warning", ...args]),
      showLaravelError: (...args) => alerts.push(["request-error", ...args]),
      openDangerAlert: (...args) => confirmations.push(args),
    },
  };
}
const api = {
  API: {
    GET_ORDER_TIMELINE: (shop, type, order) => `/fixture/shops/${shop}/orders/${type}/${order}/timeline`,
    GET_ORDER_EMAIL_PREVIEW: (shop, order, type) => `/fixture/shops/${shop}/orders/${order}/email/${type}`,
    POST_ORDER_RESEND_EMAIL: (shop, id) => `/fixture/shops/${shop}/timeline/${id}/resend`,
  },
  VAPI: {
    GET_VENDOR_ORDER_TIMELINE: (vendor, type, order) => `/fixture/vendors/${vendor}/orders/${type}/${order}/timeline`,
    GET_MY_VENDOR_ORDER_EMAIL_PREVIEW: (vendor, order, type) => `/fixture/vendors/${vendor}/orders/${order}/email/${type}`,
  },
  CDN: { GET_CONNECT_ICON: id => `/fixture/connect/${id}.svg`, GET_USER_AVATAR: id => `/fixture/avatar/${id}.png`, GET_DELIVERY_SERVICE_ICON: id => `/fixture/delivery/${id}.svg` },
  $language: { full_locale: "en-US", calendar: { calendar: "gregory" } },
};
const { Basket } = evaluate(read("../../../../core-js/models/shop/order/basket/basket.model.ts"), path => ({ default: path }));
const { ProductType } = evaluate(read("../../../../core-js/enums/product/ProductType.ts"), path => path.endsWith("/models") ? { Basket } : { default: path });
const nativeModule = path => {
  if (path.includes("/ProductType")) return { ProductType };
  if (path.endsWith("/models")) return { Basket };
  if (path === "@selldone/core-js") return { Basket, Order: {} };
  return { default: path };
};
const coreMixin = evaluate(read("../../../mixin/CoreMixin.ts"), nativeModule, { window: api }).default;
const productMixin = evaluate(read("../../../mixin/product/ProductMixin.ts"), nativeModule, { window: api }).default;
const { Calendar } = evaluate(read("../../../../core-js/enums/language/Calendar.ts"));
const { DateConverter } = evaluate(read("../../../../core-js/helper/date/DateConverter.ts"), () => ({ Calendar }), { window: api });
const dateMixin = evaluate(read("../../../mixin/date/DateMixin.ts"), () => ({ DateConverter }), { window: api }).default;
const { DeliveryServiceHelper } = evaluate(read("../../../../core-js/helper/logistic/delivery-service/DeliveryServiceHelper.ts"), () => ({ BackofficeLocalStorages: { IMAGE_SIZE_SMALL: "fixture-small" } }), { window: api });
const translate = (key, values = {}) => key === "timeline.info" ? "Recorded information" : key;
function load(name, http, notifications) {
  const filename = new URL(name, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  assert.deepEqual(errors, []);
  const component = evaluate(descriptor.script.content, path => {
    if (path === "vue") return Vue;
    if (path.endsWith("timelinePresentation.ts")) return presentation;
    if (path.includes("TimelineStatus")) return { default: timelineStatus };
    if (path.includes("TimelineEmailType")) return { TimelineEmailType };
    if (path.includes("ProductMixin")) return { default: productMixin };
    if (path.includes("DateMixin")) return { default: dateMixin };
    if (path.includes("NotificationService")) return { default: notifications.api };
    if (path.includes("ShopTransportations")) return { ShopTransportations: { Motorbike: { code: "Motorbike", icon: "/fixture/motorbike.svg", name: "motorbike" } } };
    if (path.includes("Reactions")) return { Reactions: {} };
    if (path.includes("Brands")) return { Brands: {} };
    if (path === "@selldone/core-js") return {
      CampaignLink: { Medium: {} }, Club: { Levels: {} },
      Order: { RejectReasons: {} }, DeliveryServiceHelper,
      MapHelper: { GenerateFullAddressFromMapInfo: info => info?.address ?? "" },
    };
    return { default: {} };
  }, { axios: http.api, window: api }).default;
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "grouped-order-timeline-test" });
  assert.deepEqual(template.errors, []);
  component.render = evaluate(template.code, () => Vue).render;
  component.testComponentNames = Array.from(template.code.matchAll(/resolveComponent\("([^"]+)"/g), match => match[1]);
  component.testStyles = descriptor.styles;
  return component;
}
const route = vendor => ({ params: vendor ? { vendor_id: 9 } : {}, matched: [{ meta: { vendor } }] });
function context(component, values = {}) {
  const defaults = Object.fromEntries(Object.entries(component.props ?? {}).map(([name, prop]) => [name, prop.default]));
  const state = {
    ...defaults, ...component.data?.(),
    shop: { id: 7 }, order: { id: 25 }, vendor: { id: 9 }, isPhysical: true,
    $route: route(false), $t: translate,
    AddOrUpdateItemByID(items, item) { const index = items.findIndex(row => row.id === item.id); if (index < 0) items.unshift(item); else items.splice(index, 1, item); },
    DeleteItemByID(items, id) { const index = items.findIndex(row => row.id === id); if (index >= 0) items.splice(index, 1); },
    ...values,
  };
  for (const [key, method] of Object.entries(component.methods ?? {})) state[key] = method.bind(state);
  for (const [key, get] of Object.entries(component.computed ?? {})) Object.defineProperty(state, key, { get: () => get.call(state) });
  return state;
}
const http = fakeHttp(), notifications = fakeNotifications();
const parent = load("./BOrderTimeline.vue", http, notifications);
assert.equal(parent.props.modern.default, false);
assert.equal(context(parent).useModernTimeline, false);
assert.equal(context(parent, { modern: true }).useModernTimeline, true);
assert.equal(context(parent, { modern: true, $route: route(true) }).useModernTimeline, true);
assert.equal(context(parent, { modern: true, orderType: "pos" }).timelineOrderType, "pos");
assert.equal(context(parent, { modern: true, orderType: "pos" }).base_url, "/fixture/shops/7/orders/physical/25/timeline", "Presentation type must not change the native endpoint flags");
for (const [flag, type] of [["isPhysical", "physical"], ["isVirtual", "virtual"], ["isFile", "file"], ["isService", "service"], ["isPos", "pos"], ["isDropShopping", "dropshipping"], ["isAvocado", "avocado"], ["isHyper", "hyper"]]) {
  assert.equal(context(parent, { isPhysical: false, [flag]: true }).base_url, `/fixture/shops/7/orders/${type}/25/timeline`);
}
assert.equal(context(parent, { $route: route(true) }).base_url, "/fixture/vendors/9/orders/physical/25/timeline");
for (const [flag, type] of [["isPhysical", "physical"], ["isVirtual", "virtual"], ["isFile", "file"], ["isService", "service"]]) {
  for (const modern of [false, true]) {
    const vendor = context(parent, { modern, isPhysical: false, [flag]: true, $route: route(true), order: { id: 90, basket_id: 1046 } });
    assert.equal(vendor.base_url, `/fixture/vendors/9/orders/${type}/90/timeline`, "The parent basket ID is never a vendor-order API ID");
  }
}
assert.equal(context(parent, { message: "😊".repeat(1024) }).noteLength, 1024);
assert.equal(context(parent, { message: "😊".repeat(1025) }).noteLength, 1025);

const unknown = context(parent);
assert.equal(unknown.getTimelineTitleHtml({ type: "custom-event", data: { message: "Historical message" } }), "custom-event Historical message");
assert.equal(unknown.getTimelineTitleHtml({ type: "custom-event", data: { message: 17 } }), "custom-event 17");
assert.equal(unknown.getTimelineTitleHtml({ type: "custom-event", data: null }), "custom-event");
assert.equal(unknown.getTimelineTitleHtml({ type: "info", data: { message: "Recorded information" } }), "Recorded information");
assert.match(unknown.getTimelineTitleHtml({ type: "note", data: { message: "**Important** __detail__ Motorbike " } }), /<strong>Important<\/strong> <i>detail<\/i>.*motorbike\.svg/);

const state = context(parent, { modern: true });
const timelineUrl = state.base_url;
const old = { id: 3, type: "buy", data: {}, created_at: "2026-10-28T10:00:00Z" };
const pinned = { id: 1, type: "note", pin: true, data: { message: "Pinned" } };
state.fetchTimeline(); assert.equal(state.busy, true);
assert.equal(http.calls.at(-1).method, "get"); assert.equal(http.calls.at(-1).url, timelineUrl);
http.calls.at(-1).resolve({ timelines: [old, pinned] }); await tick();
assert.equal(state.busy, false); assert.equal(state.load_error, false); assert.equal(state.timelines[0], pinned);
state.fetchTimeline();http.calls.at(-1).resolve({ error: true, error_msg: "Fixture error" });await tick();
assert.equal(state.load_error, true);assert.equal(state.timelines[0], pinned);assert.equal(state.busy, false);
state.fetchTimeline();http.calls.at(-1).reject(new Error("Fixture disconnected"));await tick();
assert.equal(state.load_error, true);assert.equal(state.busy, false);
state.fetchTimeline();assert.equal(state.load_error, false);http.calls.at(-1).resolve({ timelines: [old] });await tick();
assert.equal(state.load_error, false);assert.equal(state.timelines.length, 1);

state.message = "Fixture note 😊"; state.mentions = { users: [41] }; state.show_add = true;
state.addNewNote();const add = http.calls.at(-1);
assert.equal(add.method, "post");assert.equal(add.url, timelineUrl);
assert.deepEqual(plain(add.payload), { message: "Fixture note 😊", mentions: { users: [41] } });
const whileSaving = http.calls.length;state.addNewNote();assert.equal(http.calls.length, whileSaving);
const note = { id: 5, type: "note", pin: false, data: { message: "Fixture note 😊" }, editing: true };
add.resolve({ timeline: note });await tick();
assert.equal(state.saving, false);assert.equal(state.show_add, false);assert.equal(state.message, "");assert.deepEqual(plain(state.mentions), {});
state.message = "Retain failed draft";state.mentions = { users: [41] };state.show_add = true;state.addNewNote();
http.calls.at(-1).resolve({ error: true, error_msg: "Fixture validation" });await tick();
assert.equal(state.message, "Retain failed draft");assert.deepEqual(plain(state.mentions), { users: [41] });assert.equal(state.show_add, true);assert.equal(state.saving, false);
state.showEdit(note, true);assert.equal(note.editing, true);
state.showEdit(note, false);assert.equal(note.editing, false);
note.data.message = "Updated fixture";note.editing = true;state.editNote(note);
const edit = http.calls.at(-1);assert.equal(edit.method, "put");assert.equal(edit.url, `${timelineUrl}/5`);
assert.deepEqual(plain(edit.payload), { message: "Updated fixture", pin: false });
edit.resolve({ timeline: note });await tick();assert.equal(state.busy_edit, null);assert.equal(note.editing, false);
state.togglePinItem(note);const pin = http.calls.at(-1);
assert.deepEqual(plain(pin.payload), { message: "Updated fixture", pin: true });
pin.resolve({ timeline: note });await tick();assert.equal(state.timelines[0], note);
const countBeforeDelete = http.calls.length;state.showDeleteNoteDialog(note);
assert.equal(http.calls.length, countBeforeDelete);notifications.confirmations.at(-1).at(-1)();
const deletion = http.calls.at(-1);assert.equal(deletion.method, "delete");assert.equal(deletion.url, `${timelineUrl}/5`);
deletion.resolve({ id: 5 });await tick();assert.equal(state.busy_delete, null);assert.equal(state.timelines.some(row => row.id === 5), false);

const mail = { id: 12, type: "email-payment", data: { can_resend: true } };
state.clickItem({ id: 13, type: "email-unknown", data: {} });assert.equal(state.show_email, false);
state.clickItem(mail);const preview = http.calls.at(-1);
assert.equal(state.show_email, true);assert.equal(preview.method, "get");
assert.equal(preview.url, "/fixture/shops/7/orders/25/email/email-payment");assert.deepEqual(plain(preview.payload), { params: { timeline_id: 12 } });
preview.resolve("<main>Current template fixture</main>");await tick();assert.equal(state.email_html, "<main>Current template fixture</main>");assert.equal(state.busy_email, false);
state.showEmailView(mail);http.calls.at(-1).reject(new Error("Fixture preview failed"));await tick();
assert.equal(state.show_email, false);assert.equal(state.busy_email, false);
const vendorState = context(parent, { modern: true, $route: route(true), order: { id: 90, basket_id: 1046, type: "PHYSICAL" } });
vendorState.showEmailView(mail);const vendorPreview = http.calls.at(-1);
assert.equal(vendorPreview.url, "/fixture/vendors/9/orders/90/email/email-payment");
assert.deepEqual(plain(vendorPreview.payload), { params: { timeline_id: 12 } });
vendorPreview.resolve("<main>Vendor fixture</main>");await tick();
const beforeVendorResend = http.calls.length;vendorState.resendEmail(mail);assert.equal(http.calls.length, beforeVendorResend);
const vendorUrl = "/fixture/vendors/9/orders/physical/90/timeline";
vendorState.fetchTimeline();
assert.equal(http.calls.at(-1).url, vendorUrl);
http.calls.at(-1).resolve({ timelines: [] });await tick();
vendorState.message = "Vendor fixture note";vendorState.mentions = { users: [42] };
vendorState.addNewNote();
assert.equal(http.calls.at(-1).url, vendorUrl);
assert.deepEqual(plain(http.calls.at(-1).payload), { message: "Vendor fixture note", mentions: { users: [42] } });
const vendorNote = { id: 73, type: "note", data: { message: "Vendor fixture note" }, pin: false };
http.calls.at(-1).resolve({ timeline: vendorNote });await tick();
vendorNote.data.message = "Edited vendor fixture";vendorState.editNote(vendorNote);
assert.equal(http.calls.at(-1).url, `${vendorUrl}/73`);
assert.deepEqual(plain(http.calls.at(-1).payload), { message: "Edited vendor fixture", pin: false });
http.calls.at(-1).resolve({ timeline: vendorNote });await tick();
vendorState.togglePinItem(vendorNote);
assert.equal(http.calls.at(-1).url, `${vendorUrl}/73`);
assert.equal(http.calls.at(-1).payload.pin, true);
http.calls.at(-1).resolve({ timeline: vendorNote });await tick();
const beforeVendorDelete = http.calls.length;
vendorState.showDeleteNoteDialog(vendorNote);
assert.equal(http.calls.length, beforeVendorDelete, "Vendor note deletion retains its confirmation");
notifications.confirmations.at(-1).at(-1)();
assert.equal(http.calls.at(-1).method, "delete");assert.equal(http.calls.at(-1).url, `${vendorUrl}/73`);
http.calls.at(-1).resolve({ id: 73 });await tick();
assert.equal(vendorState.timelines.length, 0);
const beforeResend = http.calls.length;state.resendEmail(mail);assert.equal(http.calls.length, beforeResend);
notifications.confirmations.at(-1).at(-1)();const resend = http.calls.at(-1);
assert.equal(resend.method, "post");assert.equal(resend.url, "/fixture/shops/7/timeline/12/resend");assert.equal(resend.payload, undefined);
resend.resolve({ timeline: { ...mail, data: { resend: "2026-10-28T20:00:00Z" } } });await tick();assert.equal(state.busy_resend, null);

function memoryRenderer() {
  const element = (type, text = "") => ({ type, text, props: {}, style: { display: "" }, children: [], parent: null });
  const insert = (node, parent, anchor = null) => {
    if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1);
    const index = anchor ? parent.children.indexOf(anchor) : -1;
    parent.children.splice(index < 0 ? parent.children.length : index, 0, node);node.parent = parent;
  };
  return { root: element("root"), renderer: Vue.createRenderer({
    createElement: element, createText: text => element("text", text), createComment: text => element("comment", text),
    setText: (node, text) => { node.text = text; }, setComment: (node, text) => { node.text = text; },
    setElementText: (node, text) => { node.text = text; node.children = []; },
    parentNode: node => node.parent, nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1] ?? null,
    patchProp: (node, key, before, value) => { node.props[key] = value; }, insert,
    remove: node => { if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1); },
    insertStaticContent: (content, parent, anchor) => { const node = element("static", content);insert(node, parent, anchor);return [node, node]; },
  }) };
}
const flatten = node => [node, ...node.children.flatMap(flatten)];
const text = node => node.text + node.children.map(text).join("");
const eventObject = () => ({ stopPropagation() {}, preventDefault() {} });
const passthrough = {
  inheritAttrs: false,
  setup: (_, { slots, attrs }) => () => Vue.h("widget", attrs, [slots.activator?.({ props: {} }), slots.prepend?.(), slots.title?.(), slots.default?.(), slots.append?.()]),
};
const button = { inheritAttrs: false, setup: (_, { slots, attrs }) => () => Vue.h("button", attrs, slots.default?.()) };
const globals = {
  $route: route(false), $t: translate, $te: () => true, $vuetify: { display: { mdAndUp: true, xs: false } },
  isObject: value => value !== null && typeof value === "object",
  copyToClipboard() {},
};
async function mount(component, props, overrides = {}, custom = {}) {
  const host = memoryRenderer();const app = host.renderer.createApp({ ...component, created: undefined, mounted: undefined, ...overrides }, props);
  app.mixin(coreMixin);
  Object.assign(app.config.globalProperties, globals, custom.globals);
  const stubs = Object.fromEntries(component.testComponentNames.map(name => [name, name === "v-btn" ? button : passthrough]));
  for (const [name, stub] of Object.entries({ ...stubs, ...custom.stubs })) app.component(name, stub);
  app.config.warnHandler = () => {};
  const state = app.mount(host.root);await Vue.nextTick();return { app, state, host };
}
let groupedProps, groupedEmit;
const groupedStub = {
  props: ["shop", "order", "orderType", "timelines", "getTitle", "busy", "failed", "showAdd", "busyEdit", "busyDelete", "busyResend"],
  emits: ["add-note", "preview", "resend", "edit", "save", "cancel-edit", "pin", "delete", "retry"],
  setup(props, { slots, emit }) { groupedProps = props;groupedEmit = emit;return () => Vue.h("grouped", {}, slots.composer?.()); },
};
const mountedParent = await mount(parent, { shop: { id: 7 }, order: { id: 25 }, modern: true, isPhysical: true, orderType: "virtual" }, {
  components: { ...Object.fromEntries(Object.keys(parent.components).map(name => [name, passthrough])), BOrderTimelineGrouped: groupedStub },
});
assert.equal(groupedProps.orderType, "virtual");assert.equal(groupedProps.order.id, 25);
const delegatedNote = { id: 31, type: "note", data: { message: "Delegated note" }, pin: false };
groupedEmit("edit", delegatedNote);assert.equal(delegatedNote.editing, true);
groupedEmit("cancel-edit", delegatedNote);assert.equal(delegatedNote.editing, false);
groupedEmit("add-note");await Vue.nextTick();assert.equal(mountedParent.state.show_add, true);
mountedParent.state.message = "😊".repeat(1024);await Vue.nextTick();
let addButton = flatten(mountedParent.host.root).find(node => node.type === "button" && text(node).includes("global.commons.add_note"));
assert.equal(addButton.props.disabled, false);
mountedParent.state.message += "😊";await Vue.nextTick();
addButton = flatten(mountedParent.host.root).find(node => node.type === "button" && text(node).includes("global.commons.add_note"));
assert.equal(addButton.props.disabled, true);
mountedParent.app.unmount();
groupedProps = undefined;
const mountedLegacy = await mount(parent, { shop: { id: 7 }, order: { id: 25 }, isPhysical: true }, {
  components: { ...Object.fromEntries(Object.keys(parent.components).map(name => [name, passthrough])), BOrderTimelineGrouped: groupedStub },
  data: () => ({ ...parent.data(), timelines: [old] }),
});
assert.equal(groupedProps, undefined);assert.equal(mountedLegacy.state.useModernTimeline, false);
const legacyAdd = flatten(mountedLegacy.host.root).find(node => node.type === "button" && text(node).includes("global.commons.add_note"));
assert.equal(legacyAdd.props.size, "x-large");assert.equal(legacyAdd.props.variant, "text");mountedLegacy.app.unmount();
const mountedVendor = await mount(parent, { shop: { id: 7 }, order: { id: 25 }, vendor: { id: 9 }, modern: true, isPhysical: true }, {
  components: { ...Object.fromEntries(Object.keys(parent.components).map(name => [name, passthrough])), BOrderTimelineGrouped: groupedStub },
}, { globals: { $route: route(true) } });
assert.equal(groupedProps.order.id, 25);assert.equal(mountedVendor.state.useModernTimeline, true);mountedVendor.app.unmount();

const eventComponent = load("./BOrderTimelineEvent.vue", http, notifications);
const groupedComponent = load("./BOrderTimelineGrouped.vue", http, notifications);
const menuStub = {
  props: ["items"],
  setup(props) { return () => Vue.h("menu", {}, props.items.map(item => Vue.h("button", { onClick: item.click }, item.title))); },
};
const priceStub = { props: ["amount", "currency"], setup: props => () => Vue.h("price", { amount: props.amount, currency: props.currency }, String(props.amount)) };
const flagStub = { props: ["currency"], setup: props => () => Vue.h("currency", { currency: props.currency }) };
const mapStub = { props: ["location"], setup: props => () => Vue.h("map-action", { location: props.location }) };
eventComponent.components = {
  ...Object.fromEntries(Object.keys(eventComponent.components).map(name => [name, passthrough])),
  USmartMenu: menuStub, UPrice: priceStub, UCurrencyIcon: flagStub, UMapGeoButton: mapStub,
};
const order = Vue.reactive({ id: 25, type: "PHYSICAL" });
const record = (id, type, data = {}) => Vue.reactive({ id, type, data, created_at: "2026-10-28T19:46:00Z" });
const sms = record(25, "sms-payment", { phone: "fixture-phone" });
const message = record(24, "email-payment", { can_resend: true });
const standaloneNote = record(23, "note", { message: "Internal fixture" });
const savedPayment = record(22, "payment", { payment: { amount: -5, currency: "USD", message: "Basket-25" } });
const recorded = [], getTitle = item => `Recorded <strong>${item.type}</strong>`;
const listeners = Object.fromEntries(["preview", "resend", "edit", "save", "cancel-edit", "pin", "delete", "retry"].map(name => ["on" + name.split("-").map(word => word[0].toUpperCase() + word.slice(1)).join(""), item => recorded.push([name, item])]));
const mountedGroup = await mount(groupedComponent, {
  shop: { id: 7 }, order, orderType: "physical", timelines: [sms, message, standaloneNote, savedPayment], getTitle, ...listeners,
}, { components: { ...groupedComponent.components, BOrderTimelineEvent: eventComponent } }, {
  stubs: Object.fromEntries(eventComponent.testComponentNames.map(name => [name, name === "v-btn" ? button : passthrough])),
});
const article = id => flatten(mountedGroup.host.root).find(node => node.type === "article" && node.props["data-timeline-event"] === id);
const action = (node, label) => flatten(node).find(child => child.type === "button" && text(child).includes(label));
assert.equal(mountedGroup.state.visibleCount, 4);
assert.equal(mountedGroup.state.sections[0].rows[0].bundle, true);
assert.equal(mountedGroup.state.sections[0].rows[0].items[1], message);
assert(article(25));assert(article(24));assert(article(23));assert(article(22));
action(article(24), "order_timeline.modern.preview_email").props.onClick(eventObject());
assert.equal(recorded.at(-1)[0], "preview");assert.equal(recorded.at(-1)[1], message);
action(article(24), "global.actions.resend").props.onClick(eventObject());
assert.equal(recorded.at(-1)[0], "resend");assert.equal(recorded.at(-1)[1], message);
for (const [label, name] of [["order_timeline.pin_action", "pin"], ["global.actions.edit", "edit"], ["global.actions.delete", "delete"]]) {
  action(article(23), label).props.onClick();assert.equal(recorded.at(-1)[0], name);assert.equal(recorded.at(-1)[1], standaloneNote);
}
assert.equal(flatten(article(22)).find(node => node.type === "price").props.amount, -5);
assert.equal(flatten(article(22)).find(node => node.type === "price").props.currency, "USD");
assert(text(article(22)).includes("Basket-25"));
assert(text(article(22)).includes("SM-25"), "The actual CoreMixin resolves the known order label");
const toggle = flatten(mountedGroup.host.root).find(node => node.type === "button" && node.props["aria-controls"]);
assert.equal(toggle.props["aria-expanded"], true);toggle.props.onClick();await Vue.nextTick();
assert.equal(toggle.props["aria-expanded"], false);
const bundleItems = flatten(mountedGroup.host.root).find(node => node.props.id === toggle.props["aria-controls"]);
assert.equal(bundleItems.style.display, "none");
mountedGroup.state.filter = "payment";await Vue.nextTick();
assert.equal(mountedGroup.state.visibleCount, 1);assert(article(22));assert.equal(article(24), undefined);
mountedGroup.state.filter = "note";await Vue.nextTick();
assert.equal(mountedGroup.state.visibleCount, 1);assert(article(23));
standaloneNote.editing = true;await Vue.nextTick();
action(article(23), "global.actions.save").props.onClick();assert.equal(recorded.at(-1)[0], "save");assert.equal(recorded.at(-1)[1], standaloneNote);
action(article(23), "global.actions.cancel").props.onClick();assert.equal(recorded.at(-1)[0], "cancel-edit");assert.equal(recorded.at(-1)[1], standaloneNote);
order.id = 26;await Vue.nextTick();assert.equal(mountedGroup.state.filter, "all");assert.equal(Object.keys(mountedGroup.state.expandedBundles).length, 0);
mountedGroup.app.unmount();

const failedGroup = await mount(groupedComponent, { shop: { id: 7 }, order, timelines: [], getTitle, failed: true, onRetry: () => recorded.push(["retry"]) }, {
  components: { ...groupedComponent.components, BOrderTimelineEvent: eventComponent },
});
assert(text(failedGroup.host.root).includes("order_timeline.modern.load_error"));
assert(!text(failedGroup.host.root).includes("order_timeline.modern.empty_title"));
action(failedGroup.host.root, "order_timeline.modern.retry").props.onClick();assert.equal(recorded.at(-1)[0], "retry");
failedGroup.app.unmount();

async function mountedEvent(item, extra = {}) {
  return mount(eventComponent, { shop: { id: 7 }, order: { id: 25, type: "PHYSICAL" }, orderType: "physical", item, getTitle, ...extra });
}
for (const type of ["future-event", "constructor", "__proto__", "sms-vendor"]) {
  let formatterCalls = 0;
  const unknownEvent = await mountedEvent(record(40, type, { message: "<script>fixture-script</script>" }), { getTitle() { formatterCalls++;return "unsafe formatter must not run"; } });
  assert.equal(formatterCalls, 0);assert(text(unknownEvent.host.root).includes(type));
  assert(text(unknownEvent.host.root).includes("<script>fixture-script</script>"));
  assert.equal(flatten(unknownEvent.host.root).some(node => String(node.props.innerHTML ?? "").includes("fixture-script")), false);
  unknownEvent.app.unmount();
}
for (const [type, data, expected] of [
  ["email-buy", { can_resend: true }, true], ["email-payment", { can_resend: true }, true], ["email-vendor", { can_resend: true }, true],
  ["email-update", { can_resend: true }, false], ["email-unknown", { can_resend: true }, false],
  ["email-payment", { can_resend: true, resend: "2026-10-28T20:00:00Z" }, false],
  ["email-payment", {}, false],
]) {
  const view = await mountedEvent(record(41, type, data));
  assert.equal(!!action(view.host.root, "global.actions.resend"), expected, `${type} resend eligibility`);
  if (data.resend) assert(text(view.host.root).includes("order_timeline.modern.resent_at"));
  view.app.unmount();
}
for (const amount of [0, -5, "8.25"]) {
  const view = await mountedEvent(record(42, "payment", { payment: { amount, currency: "USD", message: "Recorded adjustment" } }));
  assert.equal(flatten(view.host.root).find(node => node.type === "price").props.amount, amount);view.app.unmount();
}
for (const payment of [{}, { amount: null }, { amount: "" }, { amount: "invalid" }, { amount: 9 }]) {
  const view = await mountedEvent(record(43, "payment", { payment }));
  assert.equal(flatten(view.host.root).some(node => node.type === "price"), false, "No missing currency or malformed amount may use an implied currency");
  if (payment.amount === "invalid") assert(text(view.host.root).includes("global.commons.invalid"));
  view.app.unmount();
}
const otherReference = await mountedEvent(record(44, "payment", { payment: { amount: 4, currency: "USD", message: "Basket-999" } }));
assert(text(otherReference.host.root).includes("Basket-999"));
assert.equal(flatten(otherReference.host.root).some(node => node.type === "button" && node.props["aria-label"] === "order_timeline.modern.recorded_reference"), false);otherReference.app.unmount();
const vendorOrder = { id: 90, basket_id: 1046, type: "PHYSICAL" };
const vendorHeader = await mount(groupedComponent, { shop: { id: 7 }, order: vendorOrder, orderType: "physical", timelines: [], getTitle }, {}, { globals: { $route: route(true) } });
const headerText = text(flatten(vendorHeader.host.root).find(node => String(node.props.class).includes("b-order-timeline-grouped__context")));
assert(headerText.includes("SM-1046"));assert(headerText.includes("VND-90"));assert(!headerText.includes("SM-90"));
vendorHeader.app.unmount();
for (const reference of ["Vendor Order-90", "Vendor Order-91", "Basket-90", "Basket-1046"]) {
  const view = await mount(eventComponent, { shop: { id: 7 }, order: vendorOrder, orderType: "physical", getTitle,
    item: record(47, "payment", { payment: { amount: -25, currency: "USD", message: reference } }) }, {}, { globals: { $route: route(true) } });
  const readable = flatten(view.host.root).find(node => node.type === "button" && node.props["aria-label"] === "order_timeline.modern.recorded_reference");
  assert.equal(!!readable, reference === "Vendor Order-90", "Only the exact current vendor reference is resolved");
  if (readable) assert(text(readable).includes("VND-90"));
  assert(text(view.host.root).includes(reference), "The original saved reference remains available");
  assert.equal(flatten(view.host.root).find(node => node.type === "price").props.amount, -25);
  view.app.unmount();
}
for (const resend of [undefined, "2026-10-28T20:00:00Z"]) {
  const view = await mount(eventComponent, { shop: { id: 7 }, order: vendorOrder, orderType: "physical", getTitle,
    item: record(48, "email-payment", { can_resend: true, resend }) }, {}, { globals: { $route: route(true) } });
  assert.equal(!!action(view.host.root, "global.actions.resend"), false, "Vendor email resend remains unavailable");
  assert(action(view.host.root, "order_timeline.modern.preview_email"), "Native vendor email preview stays available");
  if (resend) assert(text(view.host.root).includes("order_timeline.modern.resent_at"), "A recorded resend time remains readable");
  view.app.unmount();
}
const address = { address: "Fixture address", location: { lat: 1, lng: 2 } };
const addressView = await mountedEvent(record(45, "edit-receiver-info", { old: address }));
assert(text(addressView.host.root).includes("Fixture address"));
assert.equal(flatten(addressView.host.root).filter(node => node.type === "map-action").length, 1);addressView.app.unmount();
const deliveryView = await mountedEvent({ ...record(46, "send", { image: "/fixture/event.svg", delivery_service_id: 13, delivery_user_id: 14, connect_id: 15 }), by: { id: 16, name: "Fixture operator" } });
const deliveryNodes = flatten(deliveryView.host.root);
assert(deliveryNodes.some(node => node.props.src === "/fixture/event.svg"));
assert(deliveryNodes.some(node => node.props.src === "/fixture/delivery/13.svg"));
assert(deliveryNodes.some(node => node.props.src === "/fixture/connect/15.svg"));
assert(deliveryNodes.some(node => node.props.src === "/fixture/avatar/16.png"));deliveryView.app.unmount();
for (const component of [parent, groupedComponent, eventComponent]) {
  for (const style of component.testStyles) {
    const result = await compileStyleAsync({ source: style.content, filename: `${component.name}.vue`, id: "timeline-test", scoped: style.scoped, preprocessLang: style.lang });
    assert.deepEqual(result.errors, []);
  }
}
console.log("BOrderTimeline: native API/confirmations, recovery, real declared mixins, note limits, compiled grouped/standalone actions, safe unknowns, references, amounts and resend eligibility passed.");
