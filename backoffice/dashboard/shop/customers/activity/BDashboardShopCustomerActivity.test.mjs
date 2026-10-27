import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("./BDashboardShopCustomerActivity.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const compiled = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "customer-activity-test",
});
assert.deepEqual(compiled.errors, []);
const translate = (key, values = {}) =>
  key + (Object.keys(values).length ? " " + JSON.stringify(values) : "");
const plain = (value) => JSON.parse(JSON.stringify(value));
const row = (id, at = "2026-10-27T08:00:00Z") => ({
  id,
  user_id: id + 100,
  name: "Customer " + id,
  at,
});
const report = (shop = 7) => ({
  shop_id: shop,
  as_of: "2026-10-27T08:05:00Z",
  joined: Array.from({ length: 5 }, (_, i) => row(15 - i)),
  active: Array.from({ length: 5 }, (_, i) => row(25 - i)),
  purchasers: Array.from({ length: 5 }, (_, i) => row(35 - i)),
  active_scope: {
    source: "shop_customer_login_at",
    hours: 24,
    note: "shop_login_or_recorded_activity",
    continuous: false,
  },
});

function environment({ shop = { id: 7 }, active = true, hidden = false } = {}) {
  const requests = [],
    listeners = new Map(),
    document = {
      hidden,
      addEventListener: (event, callback) => listeners.set(event, callback),
      removeEventListener: (event, callback) => {
        if (listeners.get(event) === callback) listeners.delete(event);
      },
    },
    axios = {
      get: (url, options) =>
        new Promise((resolve, reject) =>
          requests.push({
            url,
            signal: options.signal,
            resolve: (data) => resolve({ data }),
            reject,
          }),
        ),
    },
    exports = {},
    require = (name) => {
      if (name === "vue") return Vue;
      if (name.endsWith("UAvatarText.vue")) {
        assert.equal(existsSync(new URL(name, file)), true);
        return {
          default: Vue.defineComponent({
            props: ["name", "size"],
            setup: (props) => () =>
              Vue.h("span", { class: "native-avatar-fallback" }, props.name),
          }),
        };
      }
      assert.fail("Unexpected dependency: " + name);
    };
  vm.runInNewContext(
    ts.transpileModule(descriptor.script.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require,
      axios,
      document,
      AbortController,
      window: {
        API: {
          GET_SHOP_CUSTOMERS: (id) => `/native-api/shops/${id}/customers`,
        },
      },
    },
  );
  const component = exports.default,
    state = {
      ...component.data(),
      shop,
      active,
      $t: translate,
      $i18n: { locale: "en" },
    };
  for (const [key, method] of Object.entries(component.methods))
    state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(component.computed))
    Object.defineProperty(state, key, { get: () => getter.call(state) });
  return { state, component, requests, document, listeners };
}

test("only visible active Customers mounts read the fixed native summary, with no parallel reads", async () => {
  const e = environment({ active: false }),
    s = e.state;
  e.component.mounted.call(s);
  assert.equal(e.requests.length, 0);
  s.active = true;
  e.document.hidden = true;
  e.component.watch.active.call(s, true);
  assert.equal(e.requests.length, 0);
  e.document.hidden = false;
  e.listeners.get("visibilitychange")();
  s.load();
  assert.equal(e.requests.length, 1);
  assert.equal(
    e.requests[0].url,
    "/native-api/shops/7/customers/activity-summary",
  );
  assert.equal(s.loading, true);
  e.requests[0].resolve(report());
  await setImmediate();
  assert.equal(s.loading, false);
  assert.equal(s.error, null);
  assert.equal(s.report.shop_id, 7);
  const invalid = environment({ shop: { id: "not-a-shop" } });
  invalid.component.mounted.call(invalid.state);
  assert.equal(invalid.requests.length, 0);
});

test("shop changes, hiding and unmount abort requests and reject late identities", async () => {
  const e = environment(),
    s = e.state;
  e.component.mounted.call(s);
  s.shop = { id: 8 };
  e.component.watch.shopId.call(s);
  assert.equal(e.requests[0].signal.aborted, true);
  assert.equal(
    e.requests[1].url,
    "/native-api/shops/8/customers/activity-summary",
  );
  e.requests[0].resolve(report(7));
  await setImmediate();
  assert.equal(s.report, null);
  e.requests[1].resolve(report(8));
  await setImmediate();
  assert.equal(s.report.shop_id, 8);
  s.load();
  e.document.hidden = true;
  e.listeners.get("visibilitychange")();
  assert.equal(e.requests[2].signal.aborted, true);
  e.requests[2].resolve(report(8));
  await setImmediate();
  assert.equal(s.report.shop_id, 8);
  e.document.hidden = false;
  s.load();
  e.component.beforeUnmount.call(s);
  assert.equal(e.requests[3].signal.aborted, true);
  assert.equal(e.listeners.size, 0);
  e.requests[3].resolve({ ...report(8), joined: [row(99)] });
  await setImmediate();
  assert.equal(s.report.joined[0].id, 15);
  s.load();
  assert.equal(e.requests.length, 4);
});

test("transient and logical failures retry; native access denial clears every identity", async () => {
  const e = environment(),
    s = e.state;
  e.component.mounted.call(s);
  e.requests[0].resolve(report());
  await setImmediate();
  s.load();
  e.requests[1].reject({ response: { status: 503 } });
  await setImmediate();
  assert.equal(s.error, "load_error");
  assert.equal(s.report.joined.length, 5);
  s.load();
  e.requests[2].resolve({ error: true, code: 999 });
  await setImmediate();
  assert.equal(s.error, "load_error");
  assert.equal(s.report.joined.length, 5);
  s.load();
  e.requests[3].resolve({ error: true, code: 201 });
  await setImmediate();
  assert.equal(s.error, "denied");
  assert.equal(s.report, null);
  assert.equal(s.loading, false);
  for (const status of [401, 403, 404]) {
    s.report = report();
    s.load();
    e.requests.at(-1).reject({ response: { status } });
    await setImmediate();
    assert.equal(s.report, null);
    assert.equal(s.error, "denied");
  }
  s.report = report();
  s.load();
  e.requests.at(-1).resolve({ error: true, code: 1 });
  await setImmediate();
  assert.equal(s.report, null);
  assert.equal(s.error, "denied");
});

test("cross-shop and malformed reports cannot replace the current real summary", async () => {
  const e = environment(),
    s = e.state;
  e.component.mounted.call(s);
  e.requests[0].resolve(report());
  await setImmediate();
  s.load();
  e.requests[1].resolve(report(99));
  await setImmediate();
  assert.equal(s.report.shop_id, 7);
  assert.equal(s.error, "load_error");
  s.load();
  e.requests[2].resolve({ ...report(), as_of: "unknown" });
  await setImmediate();
  assert.equal(s.error, "load_error");
  assert.equal(s.report.as_of, "2026-10-27T08:05:00Z");
  assert.equal(s.validTime(null), false);
  assert.equal(s.validTime(""), false);
  assert.equal(
    s.formatTime(null),
    "admin_shop.dashboard.customer_activity.unknown_time",
  );
  s.$i18n.locale = "fa";
  assert.match(s.formatTime("2026-10-27T08:00:00Z"), /[۰-۹]/);
});

async function html(
  value,
  { error = null, loading = false, imageSlot = "default" } = {},
) {
  const e = environment(),
    module = { exports: {} };
  vm.runInNewContext(
    ts.transpileModule(compiled.code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports: module.exports,
      require: (name) => {
        assert.equal(name, "vue");
        return Vue;
      },
    },
  );
  const component = {
    ...e.component,
    data: () => ({ ...e.component.data(), report: value, error, loading }),
    render: module.exports.render,
  };
  const app = Vue.createSSRApp(component, {
    shop: { id: 7 },
    orderQue: { unrelated: "queue-data" },
    timeSeries: { unrelated: "report-data" },
  });
  app.config.globalProperties.$t = translate;
  app.config.globalProperties.$i18n = { locale: "en" };
  app.config.globalProperties.getUserAvatar = (id) => `native-avatar/${id}`;
  for (const name of ["v-btn", "v-icon", "v-avatar", "v-img"])
    app.component(
      name,
      Vue.defineComponent({
        inheritAttrs: false,
        setup:
          (_, { slots, attrs }) =>
          () =>
            Vue.h(
              name === "v-btn" ? "button" : "span",
              attrs,
              name === "v-img" ? slots[imageSlot]?.() : slots.default?.(),
            ),
      }),
    );
  app.component(
    "router-link",
    Vue.defineComponent({
      props: ["to"],
      setup:
        (props, { slots, attrs }) =>
        () =>
          Vue.h(
            "a",
            {
              ...attrs,
              href: `/shop/${props.to.params.shop_id}/customer/${props.to.params.customer_id}`,
            },
            slots.default?.(),
          ),
    }),
  );
  app.directive("tooltip", { getSSRProps: () => ({}) });
  return renderToString(app);
}

test("actual template keeps five rows per group, native customer targets and no contact PII", async () => {
  const value = report();
  value.joined = [...value.joined, row(10)];
  value.joined[0] = {
    ...value.joined[0],
    user_id: null,
    name: null,
    at: null,
    email: "do-not-render@example.test",
    phone: "private-phone",
  };
  const output = await html(value);
  assert.equal(
    (output.match(/class="b-dashboard-customer-activity__row"/g) || []).length,
    15,
  );
  assert.ok(output.includes('href="/shop/7/customer/15"'));
  assert.ok(!output.includes('href="/shop/7/customer/115"'));
  assert.ok(!output.includes('href="/shop/7/customer/10"'));
  assert.ok(output.includes("native-avatar-fallback"));
  assert.ok(output.includes("native-avatar/125"));
  assert.ok(output.includes("customer_activity.unknown_name"));
  assert.ok(output.includes("customer_activity.unknown_time"));
  assert.ok(output.includes('datetime="2026-10-27T08:00:00Z"'));
  assert.ok(!output.includes("do-not-render@example.test"));
  assert.ok(!output.includes("private-phone"));
  assert.ok(!output.includes("orderque="));
  assert.ok(!output.includes("timeseries="));
  for (const key of [
    "joined_scope",
    "active_scope",
    "purchasers_scope",
    "updated",
  ])
    assert.ok(output.includes("customer_activity." + key));
  assert.deepEqual(
    plain(value.joined.map((item) => item.id)),
    [15, 14, 13, 12, 11, 10],
  );
});

test("actual template distinguishes loading, denied, empty and unknown groups", async () => {
  assert.ok(
    (await html(null, { loading: true })).includes("customer_activity.loading"),
  );
  const denied = await html(null, { error: "denied" });
  assert.ok(denied.includes("customer_activity.denied"));
  assert.equal((denied.match(/customer_activity.empty_/g) || []).length, 0);
  const empty = await html({
    ...report(),
    joined: [],
    active: [],
    purchasers: null,
  });
  assert.ok(empty.includes("customer_activity.empty_joined"));
  assert.ok(empty.includes("customer_activity.empty_active"));
  assert.ok(empty.includes("customer_activity.unavailable"));
  assert.ok(!empty.includes("customer_activity.empty_purchasers"));
});

test("pending and failed native avatar images retain each customer's initials fallback", async () => {
  for (const imageSlot of ["placeholder", "error"]) {
    const output = await html(report(), { imageSlot });
    assert.equal(
      (output.match(/class="native-avatar-fallback"/g) || []).length,
      15,
    );
    assert.ok(output.includes("native-avatar/115"));
    assert.match(
      output,
      /class="native-avatar-fallback"[^>]*>Customer 15<\/span>/,
    );
  }
});
