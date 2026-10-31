import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";

// Compile and render only; this test never reads a shop or opens a connection.
const filename = new URL("./BDashboardShopOnlineStaffs.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
let now = Date.parse("2026-10-27T08:30:00Z");
let interval;
let cleared;
function evaluate(source, require = () => Vue) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS },
    }).outputText,
    {
      exports,
      require,
      Date: class extends Date {
        constructor(...args) {
          super(...(args.length ? args : [now]));
        }
        static now() {
          return now;
        }
      },
      window: { $language: { full_locale: "en-US" } },
      setInterval: (callback, delay) => {
        interval = { callback, delay };
        return 17;
      },
      clearInterval: (id) => {
        cleared = id;
      },
    },
  );
  return exports;
}
const { Calendar } = evaluate(
  readFileSync(
    new URL(
      "../../../../../core-js/enums/language/Calendar.ts",
      import.meta.url,
    ),
    "utf8",
  ),
);
const { DateConverter } = evaluate(
  readFileSync(
    new URL(
      "../../../../../core-js/helper/date/DateConverter.ts",
      import.meta.url,
    ),
    "utf8",
  ),
  (name) => {
    assert.ok(name.endsWith("/Calendar"));
    return { Calendar };
  },
);
const DateMixin = evaluate(
  readFileSync(
    new URL("../../../../mixin/date/DateMixin.ts", import.meta.url),
    "utf8",
  ),
  (name) => {
    assert.equal(name, "@selldone/core-js/helper/date/DateConverter");
    return { DateConverter };
  },
).default;
const component = evaluate(descriptor.script.content, (name) => {
  assert.equal(name, "@selldone/components-vue/mixin/date/DateMixin");
  return { default: DateMixin };
}).default;
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: component.name,
});
assert.deepEqual(compiled.errors, []);
const render = evaluate(compiled.code).render;
const messages = {
  staff: "Staff",
  agent: "AI agent",
  connected: "Connected",
  recently_active: "Recently active",
  recent_activity_help: "A request was recorded in the last 30 minutes.",
  connected_agents: "Connected AI agents",
  last_activity: "Last activity",
  no_activity: "No requests yet",
  requests_today: "Requests today",
  view_agents: "View AI agents",
};
const wrapper = (tag) =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h(tag, attrs, slots.default?.()),
  });
const tooltip = Vue.defineComponent({
  inheritAttrs: false,
  setup:
    (_, { slots }) =>
    () =>
      Vue.h(Vue.Fragment, [
        slots.activator?.({ props: { "aria-describedby": "details" } }),
        Vue.h("span", { role: "tooltip" }, slots.default?.()),
      ]),
});
const dialog = Vue.defineComponent({
  inheritAttrs: false,
  setup:
    (_, { slots }) =>
    () =>
      slots.activator?.({ props: {} }),
});
const identities = [
  { provider: "ChatGPT" },
  {
    provider: "Codex",
    provider_code: "codex",
    provider_icon: "https://example.invalid/assets/img/mcp-agents/codex.svg",
  },
  { provider: "Claude", provider_code: "claude" },
  {
    provider: "Custom tool",
    provider_code: "codex",
    avatar_url: "/storage/shops/7/ai-agents/custom.webp",
  },
  { provider: "Other tool", provider_code: "unknown" },
  {
    provider: "Claude",
    provider_icon: "/assets/img/mcp-agents/not-allowed.svg",
  },
  { provider: "Anthropic" },
  { provider: "OpenAI" },
];
const agents = Object.freeze([
  ...Array.from({ length: 12 }, (_, id) =>
    Object.freeze({
      id,
      name: `Connection ${id}`,
      provider: "Codex",
      ...identities[id],
      is_active: true,
      last_used_at: id ? null : "2026-10-27T08:00:00Z",
      request_count: id ? 0 : 3,
    }),
  ),
  Object.freeze({ id: 20, name: "Revoked", is_active: false }),
  Object.freeze({ id: 21, name: "Pending", status: "pending" }),
]);
async function presence({
  mobile = false,
  connections = agents,
  staffs = [{ id: 1, name: "Test staff", email: "staff@example.test" }],
} = {}) {
  let vnode;
  let navigations = 0;
  const app = Vue.createSSRApp(
    {
      ...component,
      render(...args) {
        vnode = render.apply(this, args);
        return vnode;
      },
    },
    {
      staffs,
      agents: connections,
      onAgents: () => navigations++,
    },
  );
  Object.assign(app.config.globalProperties, {
    $vuetify: { display: { xs: mobile } },
    $t: (key) => messages[key.split(".").at(-1)] || key,
    getUserAvatar: (id) => `/test-avatar/${id}`,
  });
  for (const [name, stub] of Object.entries({
    "v-tooltip": tooltip,
    "v-dialog": dialog,
    "v-avatar": wrapper("span"),
    "v-img": wrapper("img"),
    "v-icon": wrapper("span"),
    "v-btn": wrapper("button"),
    "v-card": wrapper("article"),
  }))
    app.component(name, stub);
  app.directive("tooltip", { getSSRProps: () => ({}) });
  const html = await renderToString(app);
  const buttons = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (node.type === "button") buttons.push(node);
    if (Array.isArray(node.children)) node.children.forEach(visit);
  }
  visit(vnode);
  return { html, buttons, navigations: () => navigations };
}

const desktop = await presence();
assert.equal(
  (desktop.html.match(/class="[^"]*__avatar--agent[^"]*"/g) || []).length,
  9,
);
assert.equal(
  (desktop.html.match(/class="b-dashboard-online-staffs__group"/g) || [])
    .length,
  1,
);
for (const provider of ["chatgpt", "codex", "claude", "unknown"])
  assert.ok(
    desktop.html.includes(`src="/assets/img/mcp-agents/${provider}.svg"`),
  );
assert.ok(
  desktop.html.includes('src="/storage/shops/7/ai-agents/custom.webp"'),
);
assert.equal(desktop.html.includes("not-allowed.svg"), false);
assert.equal(desktop.html.includes("https://example.invalid/assets"), false);
assert.ok(desktop.html.includes("Test staff, staff@example.test, Staff"));
assert.ok(desktop.html.includes("Connection 0, ChatGPT, AI agent, Connected"));
assert.ok(desktop.html.includes("Connected, Recently active"));
assert.equal((desktop.html.match(/__avatar--recent/g) || []).length, 1);
assert.ok(desktop.html.includes("Last activity: 30 minutes ago"));
assert.ok(desktop.html.includes("Requests today: 3"));
assert.ok(desktop.html.includes("No requests yet"));
assert.equal(desktop.html.includes("Revoked"), false);
assert.equal(desktop.html.includes("Pending"), false);
assert.equal(desktop.html.includes("undefined"), false);
assert.match(desktop.html, />\s*\+3/);
assert.equal(/Connection[^\"]*global.commons.online/.test(desktop.html), false);
const agentNavigation = desktop.buttons.filter(
  (button) => button.props.onClick,
);
assert.equal(agentNavigation.length, 2);
agentNavigation.forEach((button) => button.props.onClick());
assert.equal(desktop.navigations(), 2);

const mobile = await presence({ mobile: true });
assert.equal(
  (mobile.html.match(/class="[^"]*__avatar--agent[^"]*"/g) || []).length,
  3,
);
assert.match(mobile.html, />\s*\+9/);
const crowded = await presence({
  mobile: true,
  staffs: Array.from({ length: 12 }, (_, id) => ({
    id,
    name: `Staff ${id}`,
    email: `staff${id}@example.test`,
  })),
});
assert.equal(
  (crowded.html.match(/class="b-dashboard-online-staffs__avatar"/g) || [])
    .length,
  2,
);
assert.equal(
  (crowded.html.match(/class="[^"]*__avatar--agent[^"]*"/g) || []).length,
  2,
);
assert.match(crowded.html, /aria-haspopup="dialog"/);
assert.match(crowded.html, />\s*\+10/);
const empty = await presence({ connections: [] });
assert.equal(empty.html.includes("Connected AI agents"), false);
assert.equal(empty.html.includes("__avatar--agent"), false);

const activity = { ...component.data() };
const recent = (overrides = {}) =>
  component.methods.recentlyActive.call(activity, {
    is_active: true,
    last_used_at: "2026-10-27T08:00:00Z",
    ...overrides,
  });
assert.equal(recent(), true, "Exactly thirty minutes remains recent");
for (const last_used_at of [
  null,
  "invalid",
  "2026-10-27T07:59:59.999Z",
  "2026-10-27T08:30:00.001Z",
])
  assert.equal(recent({ last_used_at }), false);
for (const overrides of [
  { is_active: false },
  { is_sample: true },
  { display_only: true },
])
  assert.equal(
    recent(overrides),
    false,
    "Inactive and illustrative agents never glow",
  );
component.mounted.call(activity);
assert.equal(interval.delay, 60_000);
now += 60_000;
interval.callback();
assert.equal(
  recent(),
  false,
  "Recent activity ages out without another response",
);
component.beforeUnmount.call(activity);
assert.equal(cleared, 17, "Aging clock is removed with the component");

now = Date.parse("2026-10-27T09:30:00Z");
const skewed = { ...component.data() };
component.watch.serverTime.handler.call(skewed, "2026-10-27T08:30:00Z");
const withSkew = (last_used_at) =>
  component.methods.recentlyActive.call(skewed, {
    is_active: true,
    last_used_at,
  });
assert.equal(
  withSkew("2026-10-27T08:00:00Z"),
  true,
  "The server clock controls the thirty-minute boundary",
);
assert.equal(
  withSkew("2026-10-27T08:30:00.001Z"),
  false,
  "Future server timestamps do not glow",
);
component.mounted.call(skewed);
now += 60_000;
interval.callback();
assert.equal(
  withSkew("2026-10-27T08:00:00Z"),
  false,
  "The received server clock keeps aging",
);
component.beforeUnmount.call(skewed);
for (const value of [null, "invalid"]) {
  component.watch.serverTime.handler.call(skewed, value);
  assert.equal(skewed.activity_offset, 0);
  assert.equal(
    skewed.activity_now,
    now,
    "Unavailable server time falls back to the local clock",
  );
}
console.log(
  "AI agent presence: projection, preview, navigation and recent activity checks passed.",
);
