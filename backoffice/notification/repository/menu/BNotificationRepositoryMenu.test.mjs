import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { compileTemplate, compileStyleAsync, parse } from "@vue/compiler-sfc";
import { JSDOM } from "jsdom";
import ts from "typescript";
import { createI18n } from "vue-i18n";

// The real menu, notification formatter and DateMixin run without a shop connection.
const file = new URL("./BNotificationRepositoryMenu.vue", import.meta.url);
const core = new URL("../../../../../core-js/", import.meta.url);
const root = new URL("../../../../../../", import.meta.url);
const dom = new JSDOM("", { url: "http://localhost:9000/" });
const sandbox = vm.createContext({
  document: dom.window.document,
  URL,
  console,
});
sandbox.self = sandbox;
sandbox.window = { $language: { full_locale: "en-US" } };
const plain = (value) => JSON.parse(JSON.stringify(value));
const tick = () => new Promise((resolve) => setImmediate(resolve));
function evaluate(
  source,
  require = () => {
    throw new Error("Unexpected import");
  },
) {
  const exports = {};
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  vm.runInContext(`(function(exports, require) { ${compiled}\n })`, sandbox)(
    exports,
    require,
  );
  return exports;
}
const html = evaluate(
  readFileSync(new URL("helper/html/HtmlHelper.ts", core), "utf8"),
);
const { Calendar } = evaluate(
  readFileSync(new URL("enums/language/Calendar.ts", core), "utf8"),
);
const { DateConverter } = evaluate(
  readFileSync(new URL("helper/date/DateConverter.ts", core), "utf8"),
  () => ({ Calendar }),
);
const DateMixin = evaluate(
  readFileSync(
    new URL("../../../../mixin/date/DateMixin.ts", import.meta.url),
    "utf8",
  ),
  () => ({ DateConverter }),
).default;
const { NotificationRepositoryType } = evaluate(
  readFileSync(
    new URL("enums/notification/NotificationRepositoryType.ts", core),
    "utf8",
  ),
  () => ({
    ProductType: Object.fromEntries(
      ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
        code,
        { code },
      ]),
    ),
  }),
);
const { NotificationHelper } = evaluate(
  readFileSync(
    new URL("enums/notification/NotificationHelper.ts", core),
    "utf8",
  ),
  (name) =>
    name.includes("NotificationRepositoryType")
      ? { NotificationRepositoryType }
      : html,
);
const messages = Object.fromEntries(
  ["en", "fa"].map((locale) => [
    locale,
    evaluate(
      readFileSync(
        new URL(`@selldone/translate/dashboard/${locale}.ts`, root),
        "utf8",
      ),
    ).default,
  ]),
);
const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages,
  missingWarn: false,
  fallbackWarn: false,
  warnHtmlMessage: false,
});
function setLocale(locale) {
  sandbox.window.$language = {
    full_locale: locale === "fa" ? "fa-IR" : "en-US",
  };
  i18n.global.locale.value = locale;
  const translate = i18n.global.t;
  sandbox.window.$t = translate;
  return translate;
}
setLocale("en");
const { descriptor, errors } = parse(readFileSync(file, "utf8"), {
  filename: file.pathname,
});
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "notification-menu-test",
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const compiled = await compileStyleAsync({
    source: style.content,
    filename: file.pathname,
    id: "notification-menu-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(compiled.errors, []);
}
const render = evaluate(template.code, () => Vue).render;
const rows = [
  {
    id: 11,
    type: "NEW_PRODUCT",
    count: 3,
    read_at: null,
    created_at: "2026-11-10T08:00:00Z",
    data: { shop: { id: 7, title: "Example shop" }, product_ids: [31, 32, 33] },
  },
  {
    id: 12,
    type: "NEW_CATEGORY",
    count: 2,
    read_at: null,
    created_at: "2026-11-09T08:00:00Z",
    data: { shop: { id: 7, title: "Example shop" }, category_ids: [4, 5] },
  },
  {
    id: 13,
    type: "MENTION_NOTE",
    count: 1,
    read_at: "2026-11-09T09:00:00Z",
    created_at: "2026-11-08T08:00:00Z",
    message: "**Review** the photos",
    data: {
      shop: { id: 7 },
      user: { name: "Ada" },
      note: { target_type: "product", target_id: 31, element_id: 22 },
    },
  },
  {
    id: 14,
    type: "MENTION_TIMELINE",
    count: 1,
    read_at: null,
    created_at: "2026-11-07T08:00:00Z",
    message: "Check the shipment",
    data: {
      shop: { id: 7 },
      user: { name: "Sam" },
      basket: { id: 105, type: "PHYSICAL" },
    },
  },
];
{
  const helper = new NotificationHelper({ $t: setLocale("en") });
  sandbox.window.$t = (key) => key;
  const descriptions = {
    en: "<b>3</b> new products added to <b>Example shop</b>.",
    fa: "<b>3</b> محصول جدید به <b>Example shop</b> اضافه شد.",
  };
  for (const locale of ["en", "fa"]) {
    i18n.global.locale.value = locale;
    assert.equal(
      helper.getTitle(rows[0]),
      messages[locale].notification_repository_menu.types.product_title,
      "notification titles use their caller's locale after another app replaces window.$t",
    );
    assert.equal(helper.getDescription(rows[0]), descriptions[locale]);
  }
  setLocale("en");
  assert.equal(
    new NotificationHelper().getTitle(rows[0]),
    messages.en.notification_repository_menu.types.product_title,
    "legacy no-argument callers retain their global translator",
  );
}
function fixture({
  response = { data: { notifications: plain(rows) } },
  readResponse = { data: { read_at: "2026-11-11T08:00:00Z" } },
  locale = "en",
} = {}) {
  const requests = [];
  const translate = setLocale(locale);
  sandbox.window.API = {
    GET_MY_NOTIFICATIONS_REPOSITORY: () => "/test/notifications",
    POST_READ_MY_NOTIFICATIONS_REPOSITORY: () => "/test/notifications/read",
  };
  sandbox.axios = {
    get: (url, options) => {
      requests.push(["get", url, plain(options)]);
      return response instanceof Error
        ? Promise.reject(response)
        : Promise.resolve(response);
    },
    post: (url, body) => {
      requests.push(["post", url, plain(body)]);
      return readResponse instanceof Error
        ? Promise.reject(readResponse)
        : Promise.resolve(readResponse);
    },
  };
  const component = evaluate(descriptor.script.content, (name) => {
    if (name.includes("NotificationRepositoryType"))
      return { NotificationRepositoryType };
    if (name.includes("NotificationHelper")) return { NotificationHelper };
    if (name.includes("DateMixin")) return { default: DateMixin };
    if (name.includes("ProductsDenseImagesCirclesLinks"))
      return { default: thumbnails };
    throw new Error(`Unexpected menu import: ${name}`);
  }).default;
  const state = {
    ...component.data(),
    $route: { params: { shop_id: 7 } },
    $t: translate,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, get] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => get.call(state) });
  return { component, state, requests, translate };
}
const thumbnails = Vue.defineComponent({
  props: ["ids", "maxCount", "toProduct", "toCategory"],
  setup:
    (props, { attrs }) =>
    () =>
      Vue.h(
        "div",
        { ...attrs, "data-thumbnail-count": props.maxCount },
        props.ids.slice(0, props.maxCount).map((id) => {
          const target = String(id).startsWith("c-")
            ? props.toCategory(String(id).slice(2))
            : props.toProduct(id);
          return Vue.h(
            "a",
            { "data-thumbnail-to": JSON.stringify(target) },
            String(id),
          );
        }),
      ),
});
{
  const { state, component, requests } = fixture();
  component.created.call(state);
  assert.equal(state.busy, true);
  await tick();
  assert.deepEqual(requests, [
    ["get", "/test/notifications", { params: { shop_id: 7, mode: "new" } }],
  ]);
  assert.equal(state.notifications.length, 4);
  assert.equal(
    state.unread_count,
    3,
    "unread count counts records, not their product quantities",
  );
  state.mode = "unread";
  component.watch.mode.call(state);
  await tick();
  assert.equal(requests.at(-1)[2].params.mode, "unread");
  state.$route.params.shop_id = 8;
  component.watch.shop_id.call(state, 8, 7);
  await tick();
  assert.equal(requests.at(-1)[2].params.shop_id, 8);
  assert.equal(state.busy, false);
}
{
  const { state, component, requests } = fixture();
  state.notifications = plain(rows);
  assert.deepEqual(plain(state.unread_ids_without_click), [12]);
  component.watch.menu.call(state, true);
  await tick();
  assert.deepEqual(requests, [
    ["post", "/test/notifications/read", { shop_id: 7, ids: [12] }],
  ]);
  assert.equal(state.notifications[1].local_read, true);
  assert.equal(state.notifications[1].read_at, "2026-11-11T08:00:00Z");
  assert.equal(state.unread_count, 2);
  state.onClickNotification(state.notifications[0]);
  await tick();
  assert.deepEqual(requests.at(-1)[2].ids, [11]);
  assert.equal(state.notifications[0].local_read, true);
  assert.equal(state.notifications[0].read_at, "2026-11-11T08:00:00Z");
  const count = requests.length;
  state.onClickNotification(state.notifications[0]);
  state.onClickNotification(state.notifications[2]);
  state.readNotifications([]);
  state.busy_read = true;
  state.readNotifications([14]);
  assert.equal(
    requests.length,
    count,
    "read/busy/empty guards prevent repeated writes",
  );
}
{
  const { state } = fixture({ readResponse: { data: { error: true } } });
  state.notifications = plain(rows);
  state.onClickNotification(state.notifications[0]);
  await tick();
  assert.equal(
    state.notifications[0].local_read,
    undefined,
    "failed reads do not mark a notification read",
  );
  assert.equal(state.busy_read, false);
  assert.equal(state.notifications[0].read_at, null);
  assert.equal(state.unread_count, 3);
}
async function renderMenu(
  initial = {},
  { locale = "en", shopId = 7, width = 1040, dark = false } = {},
) {
  const fixtureData = fixture({ locale });
  const seenRows = [];
  const warnings = [],
    renderErrors = [];
  const app = Vue.createSSRApp({
    ...fixtureData.component,
    created() {},
    data: () => ({
      ...fixtureData.component.data(),
      notifications: plain(rows),
      menu: true,
      ...initial,
    }),
    render,
  });
  app.config.warnHandler = (message) => warnings.push(message);
  app.config.errorHandler = (error) => renderErrors.push(error);
  app.config.globalProperties.$t = fixtureData.translate;
  app.config.globalProperties.$route = { params: { shop_id: shopId } };
  app.config.globalProperties.USER = () => ({ preferences: { dark } });
  app.config.globalProperties.$vuetify = {
    display: { width, xs: width < 600 },
    locale: { isRtl: locale === "fa" },
  };
  // This formatter is an actual application-global boundary, unlike the explicitly owned DateMixin.
  app.config.globalProperties.numeralFormat = (value) =>
    new Intl.NumberFormat(locale).format(value);
  app.directive("tooltip", {});
  const wrapper = (tag) =>
    Vue.defineComponent({
      inheritAttrs: false,
      setup:
        (_, { attrs, slots }) =>
        () =>
          Vue.h(tag, attrs, slots.default?.()),
    });
  for (const tag of [
    "v-sheet",
    "v-list",
    "v-btn-toggle",
    "v-list-item-title",
    "v-list-item-subtitle",
    "v-list-item-action",
    "v-avatar",
    "v-spacer",
    "v-row",
    "v-progress-linear",
  ])
    app.component(tag, wrapper("div"));
  app.component("v-icon", wrapper("span"));
  app.component("v-menu", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("div", [slots.activator?.({ props: {} }), slots.default?.()]),
  });
  app.component("v-badge", {
    props: ["modelValue", "content"],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h("span", [
          slots.default?.(),
          props.modelValue
            ? Vue.h("span", { "data-bell-count": "" }, props.content)
            : null,
        ]),
  });
  app.component("v-btn", {
    props: ["to"],
    setup:
      (props, { attrs, slots }) =>
      () =>
        Vue.h(
          props.to ? "a" : "button",
          {
            ...attrs,
            "data-to": props.to ? JSON.stringify(props.to) : undefined,
          },
          slots.default?.(),
        ),
  });
  app.component("v-list-item", {
    props: ["to"],
    setup:
      (props, { attrs, slots }) =>
      () => {
        seenRows.push({ target: props.to, onClick: attrs.onClick });
        return Vue.h(
          "div",
          {
            ...attrs,
            "data-to": props.to ? JSON.stringify(props.to) : undefined,
          },
          [slots.prepend?.(), slots.default?.(), slots.append?.()],
        );
      },
  });
  const document = new JSDOM(await renderToString(app)).window.document;
  if (renderErrors.length) throw renderErrors[0];
  assert.deepEqual(
    warnings,
    [],
    "nonempty rendering must not hide unresolved helpers or components",
  );
  return { ...fixtureData, document, seenRows };
}
{
  const { state, requests } = fixture();
  state.notifications = plain(rows);
  const document = new JSDOM("", { url: "http://localhost:9000/" }).window
    .document;
  const outer = document.createElement("a");
  outer.href = "/products";
  const copy = document.createElement("div");
  const title = document.createElement("span");
  title.textContent = "New products added";
  const link = document.createElement("a");
  link.href = "#help";
  link.textContent = "Related help";
  copy.append(title, link);
  outer.append(copy);
  document.body.append(outer);
  copy.addEventListener("click", state.onMessageClick);
  outer.addEventListener("click", (event) => {
    event.preventDefault();
    state.onClickNotification(state.notifications[0]);
  });
  link.click();
  await tick();
  assert.equal(
    requests.length,
    0,
    "a nested message link keeps independent navigation",
  );
  title.click();
  await tick();
  assert.deepEqual(
    requests,
    [["post", "/test/notifications/read", { shop_id: 7, ids: [11] }]],
    "clicking ordinary title text inside the row anchor reaches the native read handler exactly once",
  );
  assert.equal(state.notifications[0].read_at, "2026-11-11T08:00:00Z");
  title.click();
  await tick();
  assert.equal(requests.length, 1, "a confirmed read is not written again");
  const rendered = await renderMenu({ notifications: state.notifications });
  const readRow = rendered.document.querySelector(".b-notification-menu__row");
  assert.ok(readRow.classList.contains("b-notification-menu__row--read"));
  assert.equal(readRow.querySelector(".b-notification-menu__unread"), null);
  assert.equal(
    rendered.document.querySelector("[data-bell-count]").textContent,
    "2",
  );
}
{
  const { state } = fixture();
  state.mode = "unread";
  state.notifications = plain(rows).filter(
    (notification) => !notification.read_at,
  );
  state.onClickNotification(state.notifications[0]);
  await tick();
  assert.deepEqual(
    plain(state.notifications.map((notification) => notification.id)),
    [12, 14],
  );
  assert.equal(state.unread_count, 2);
  const rendered = await renderMenu({
    notifications: state.notifications,
    mode: "unread",
  });
  assert.equal(
    rendered.document.querySelectorAll(".b-notification-menu__row").length,
    2,
  );
}
{
  const notifications = plain(rows);
  notifications[0].local_read = true;
  assert.equal(notifications[0].read_at, null);
  const { document } = await renderMenu({ notifications });
  const localReadRow = document.querySelector(".b-notification-menu__row");
  assert.ok(localReadRow.classList.contains("b-notification-menu__row--read"));
  assert.equal(localReadRow.querySelector(".b-notification-menu__unread"), null);
  assert.equal(document.querySelector("[data-bell-count]").textContent, "2");
}
{
  const { document, seenRows, requests } = await renderMenu();
  assert.equal(
    document.querySelector(".b-notification-menu").getAttribute("theme"),
    "light",
  );
  assert.equal(
    document.querySelector('button[value="new"]').getAttribute("aria-pressed"),
    "true",
  );
  assert.equal(
    document
      .querySelector('button[value="unread"]')
      .getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(
    document.querySelectorAll(".b-notification-menu__row").length,
    4,
  );
  assert.equal(
    document.querySelectorAll(".b-notification-menu__row--read").length,
    1,
  );
  assert.equal(
    document.querySelectorAll(".b-notification-menu__unread").length,
    3,
  );
  assert.deepEqual(
    [...document.querySelectorAll(".b-notification-menu__count")].map((node) =>
      node.textContent.trim(),
    ),
    ["3", "2"],
  );
  assert.equal(document.querySelector("[data-bell-count]").textContent, "3");
  assert.equal(
    document.querySelector(".b-notification-menu__title").textContent,
    messages.en.notification_repository_menu.types.product_title,
  );
  assert.match(
    document.querySelector(".b-notification-menu__message").innerHTML,
    /<b>3<\/b>.*<b>Example shop<\/b>/,
  );
  assert.ok(
    document
      .querySelectorAll(".b-notification-menu__title")[2]
      .querySelector("b"),
  );
  assert.deepEqual(plain(seenRows[2].target), {
    name: "BPageProductDashboard",
    params: { shop_id: 7, product_id: 31 },
    query: { element_id: 22 },
  });
  assert.deepEqual(plain(seenRows[3].target), {
    name: "BPageOrderPhysicalTimeline",
    params: { shop_id: 7, basket_id: 105 },
  });
  assert.equal(seenRows[0].target.name, "BPageShopProductsList");
  assert.match(seenRows[0].target.query.search, /^new~/);
  const thumbnailTargets = [
    ...document.querySelectorAll("[data-thumbnail-to]"),
  ].map((node) => JSON.parse(node.dataset.thumbnailTo));
  assert.deepEqual(thumbnailTargets[0], {
    name: "BPageProductDashboard",
    params: { product_id: 31, shop_id: 7 },
  });
  assert.deepEqual(thumbnailTargets[3], {
    name: "BPageShopProductsList",
    query: { dir: "4", shop_id: 7 },
  });
  assert.ok(
    [...document.querySelectorAll("[data-thumbnail-count]")].every(
      (node) => node.dataset.thumbnailCount === "10",
    ),
  );
  assert.ok(
    [...document.querySelectorAll("a[data-to]")].some(
      (node) =>
        JSON.parse(node.dataset.to).name === "BShopAutomationNotifications",
    ),
  );
  assert.equal(
    requests.length,
    0,
    "rendering alone must not fetch or mark items read",
  );
  seenRows[0].onClick({});
  await tick();
  assert.deepEqual(
    requests,
    [["post", "/test/notifications/read", { shop_id: 7, ids: [11] }]],
    "native row click still marks exactly that notification read",
  );
}
{
  const { document } = await renderMenu(
    { notifications: [], mode: "unread" },
    { locale: "fa", width: 390 },
  );
  for (const key of [
    "title",
    "new",
    "unread",
    "empty_title",
    "empty_description",
  ])
    assert.ok(
      document.body.textContent.includes(
        messages.fa.notification_repository_menu[key],
      ),
      `Persian ${key} is rendered`,
    );
  assert.ok(
    !document.body.textContent.includes("notification_repository_menu."),
  );
  assert.equal(
    document.querySelector('button[value="new"]').getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(
    document
      .querySelector('button[value="unread"]')
      .getAttribute("aria-pressed"),
    "true",
  );
  const darkMenu = await renderMenu({}, { dark: true });
  assert.equal(
    darkMenu.document
      .querySelector(".b-notification-menu")
      .getAttribute("theme"),
    "dark",
  );
  const globalMenu = await renderMenu({}, { shopId: null });
  assert.ok(
    ![...globalMenu.document.querySelectorAll("a[data-to]")].some(
      (node) =>
        JSON.parse(node.dataset.to).name === "BShopAutomationNotifications",
    ),
  );
  const persian = await renderMenu({}, { locale: "fa", width: 390 });
  assert.equal(
    persian.document.querySelector(".b-notification-menu__title").textContent,
    messages.fa.notification_repository_menu.types.product_title,
  );
  assert.ok(
    persian.document
      .querySelector(".b-notification-menu__message")
      .querySelector("b"),
  );
  assert.equal(persian.document.querySelectorAll("time").length, 4);
  assert.match(
    persian.document.querySelector("time").textContent,
    /[\u0600-\u06ff]/,
  );
}
{
  const { state } = fixture();
  const sanitized = state.messageHtml(
    '<p onclick="bad()">Hello<br><b>strong</b></p><ul><li>One</li></ul><script>bad()</script><svg><a onload="bad()">x</a></svg><a href="javascript:bad()">unsafe</a><a href="https://user:pass@example.test">credentials</a><a href="https://example.test/help" style="color:red">Help</a>',
  );
  const document = new JSDOM(sanitized).window.document;
  assert.ok(document.querySelector("p br"));
  assert.equal(document.querySelector("b").textContent, "strong");
  assert.equal(document.querySelector("li").textContent, "One");
  assert.equal(
    document.querySelector("script, svg, [onclick], [onload], [style]"),
    null,
  );
  assert.equal(document.querySelectorAll("a[href]").length, 1);
  assert.equal(
    document.querySelector("a[href]").getAttribute("target"),
    "_blank",
  );
  assert.equal(
    document.querySelector("a[href]").getAttribute("rel"),
    "noopener noreferrer",
  );
  let stopped = 0;
  state.onMessageClick({
    target: document.querySelector("a[href]"),
    currentTarget: document.body,
    stopPropagation: () => stopped++,
  });
  state.onMessageClick({
    target: document.querySelector("b"),
    currentTarget: document.body,
    stopPropagation: () => stopped++,
  });
  assert.equal(
    stopped,
    1,
    "message links keep their own navigation without triggering the row",
  );
  const unknown = await renderMenu({
    notifications: [
      {
        id: 20,
        type: "UNKNOWN",
        count: 1,
        created_at: rows[0].created_at,
        message: "**Original** message",
      },
    ],
  });
  assert.match(
    unknown.document.querySelector(".b-notification-menu__title").innerHTML,
    /<b>Original<\/b>/,
  );
}
console.log(
  "PASS notification menu: native requests/read guards, routes, grouped thumbnails, localized rendering and safe formatted content.",
);
