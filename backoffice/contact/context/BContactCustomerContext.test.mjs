import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";

const path = new URL("./BContactCustomerContext.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(path, "utf8"));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const plain = (value) => JSON.parse(JSON.stringify(value));
const linked = (extra = {}) => ({
  state: "linked",
  customer: { id: 12, user_id: 41, name: "Synthetic customer" },
  payments: [
    { amount: 120, currency: "USD" },
    { amount: 75, currency: "EUR" },
  ],
  payments_state: "available",
  orders: [],
  orders_state: "empty",
  activity: { state: "unavailable" },
  links: { customer: true, activity: false, orders: false, pos_orders: false },
  ...extra,
});

// Deferred local fixtures only; this suite cannot connect to a customer or shop.
function fixture() {
  const requests = [],
    exports = {};
  vm.runInNewContext(
    ts.transpileModule(descriptor.script.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require: (name) =>
        name.includes("SupportCategory")
          ? { SupportCategory: {} }
          : { default: {} },
      axios: {
        get: (url) =>
          new Promise((resolve, reject) =>
            requests.push({ url, resolve, reject }),
          ),
      },
      window: {
        $language: { full_locale: "en-US" },
        API: {
          GET_SHOP_CONTACT_CUSTOMER_CONTEXT: (shop, contact) =>
            `/test/shops/${shop}/contacts/${contact}/customer-context`,
        },
      },
    },
  );
  const component = exports.default;
  const state = {
    shop: { id: 7 },
    contact: { id: 31, name: "Sender snapshot", email: "sender@example.test" },
    $t: (key) => key,
    getLocalDateString: (value) => value,
    getBasketOrderProcessTo: (order) =>
      order.type === "PHYSICAL"
        ? {
            name: "BPageOrderPhysicalDashboard",
            params: { basket_id: order.id },
          }
        : null,
    ...component.data(),
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  const select = (contact) => {
    state.contact = contact;
    component.watch.contextKey.handler.call(state);
  };
  component.watch.contextKey.handler.call(state);
  return { state, component, requests, select };
}

test("context template compiles with native links and disclosures", () => {
  assert.deepEqual(errors, []);
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: path.pathname,
      id: "contact-context-test",
    }).errors,
    [],
  );
});

test("selection immediately clears the old customer and ignores stale success and failure", async () => {
  const f = fixture();
  assert.equal(f.requests[0].url, "/test/shops/7/contacts/31/customer-context");
  f.requests[0].resolve({ data: linked() });
  await settle();
  assert.equal(f.state.customer.id, 12);
  f.select({ id: 32, name: "Second sender" });
  assert.equal(f.state.context, null);
  assert.equal(f.state.currency, null);
  assert.equal(f.state.senderName, "Second sender");
  f.select({ id: 33, name: "Third sender" });
  f.requests[2].resolve({ data: linked({ customer: { id: 19 } }) });
  await settle();
  f.requests[1].resolve({ data: linked({ customer: { id: 18 } }) });
  await settle();
  assert.equal(f.state.customer.id, 19);
  assert.equal(f.state.error, false);
  f.select({ id: 34 });
  f.select({ id: 35 });
  f.requests[3].reject({ response: { status: 403 } });
  await settle();
  assert.equal(f.state.error, false);
  assert.equal(f.state.busy, true);
  f.requests[4].resolve({ data: linked() });
  await settle();
});

test("guest, missing profile and restricted responses never fabricate customer metrics", async () => {
  const f = fixture();
  for (const state of ["guest", "not_found", "restricted"]) {
    f.requests.at(-1).resolve({
      data: {
        state,
        customer: null,
        payments_state: "unavailable",
        orders_state: "unavailable",
        activity: { state: "unavailable" },
        links: {},
      },
    });
    await settle();
    assert.equal(f.state.customer, null);
    assert.equal(f.state.senderName, "Sender snapshot");
    assert.equal(f.state.selectedPayment, undefined);
    assert.equal(f.state.payments.length, 0);
    assert.equal(f.state.orders.length, 0);
    assert.equal(f.state.activityAvailable, false);
    f.state.fetchContext();
  }
  f.requests.at(-1).resolve({ data: { state: "guest" } });
  await settle();
});

test("currencies remain separate and retry preserves selection while partial errors stay unavailable", async () => {
  const f = fixture();
  f.requests[0].resolve({ data: linked() });
  await settle();
  assert.deepEqual(plain(f.state.selectedPayment), {
    amount: 120,
    currency: "USD",
  });
  f.state.currency = "EUR";
  assert.equal(f.state.selectedPayment.amount, 75);
  f.state.fetchContext(true);
  assert.equal(f.state.customer.id, 12);
  assert.equal(f.state.currency, "EUR");
  f.requests[1].resolve({
    data: linked({
      payments: [{ amount: 0, currency: "EUR" }],
      orders_state: "error",
    }),
  });
  await settle();
  assert.equal(f.state.selectedPayment.amount, 0);
  assert.equal(f.state.currency, "EUR");
  assert.equal(
    f.state.sectionMessage("error", "no_orders"),
    "shop_contacts.modern.context.section_error",
  );
  f.state.fetchContext(true);
  f.requests[2].resolve({
    data: linked({ payments_state: "restricted", orders_state: "restricted" }),
  });
  await settle();
  assert.equal(f.state.selectedPayment, undefined);
  assert.equal(f.state.orders.length, 0);
  assert.equal(
    f.state.sectionMessage("restricted", "no_orders"),
    "shop_contacts.modern.context.restricted",
  );
});

test("failed requests recover and revoked access clears retained context", async () => {
  const f = fixture();
  f.requests[0].reject(new Error("Synthetic network failure"));
  await settle();
  assert.equal(f.state.error, true);
  assert.equal(f.state.busy, false);
  f.state.fetchContext(true);
  f.requests[1].resolve({ data: linked() });
  await settle();
  assert.equal(f.state.error, false);
  f.state.fetchContext(true);
  f.requests[2].reject({ response: { status: 403 } });
  await settle();
  assert.equal(f.state.context, null);
  assert.equal(f.state.currency, null);
  assert.equal(f.state.error, true);
  f.state.fetchContext(true);
  f.requests[3].resolve({ data: linked() });
  await settle();
  assert.ok(f.state.customer);
  f.state.fetchContext(true);
  f.requests[4].resolve({ data: { error: true, code: 201 } });
  await settle();
  assert.equal(f.state.context, null);
  assert.equal(f.state.currency, null);
  assert.equal(f.state.error, true);
});

test("activity preserves missing-day gaps and buy-action totals without inferring orders", async () => {
  const f = fixture();
  f.requests[0].resolve({
    data: linked({
      activity: {
        state: "available",
        period_days: 30,
        period_start: "2026-10-01",
        period_end: "2026-10-30",
        latest: { device: "Desktop", os: "Synthetic OS", channel: "direct" },
        series: [
          { date: "2026-10-01", products_views: 8 },
          { date: "2026-10-03", products_views: 0 },
        ],
        totals: { products_views: 8, add_baskets: 2, buys: 4 },
      },
    }),
  });
  await settle();
  assert.equal(f.state.chartDays.length, 30);
  assert.deepEqual(plain(f.state.chartDays.slice(0, 3)), [
    { date: "2026-10-01", views: 8 },
    { date: "2026-10-02", views: null },
    { date: "2026-10-03", views: 0 },
  ]);
  assert.equal(f.state.chartPeak, 8);
  assert.equal(f.state.activity.totals.buys, 4);
  assert.equal(f.state.orders.length, 0);
  assert.equal(f.state.recordedChannel, "direct");
  assert.equal(f.state.recordedDevice, "Desktop · Synthetic OS");
  assert.equal(f.state.dateLabel("2026-10-01"), "October 1, 2026");
});

test("customer and order routes preserve shop identity and independently gate POS and online access", async () => {
  const f = fixture();
  f.requests[0].resolve({ data: linked() });
  await settle();
  const online = { id: 16, type: "PHYSICAL", channel: "online" },
    pos = { id: 18, channel: "pos" };
  assert.equal(f.state.orderRoute(online), null);
  assert.equal(f.state.orderRoute(pos), null);
  f.state.context.links.orders = true;
  assert.deepEqual(plain(f.state.orderRoute(online)), {
    name: "BPageOrderPhysicalDashboard",
    params: { basket_id: 16, shop_id: 7 },
  });
  assert.equal(f.state.orderRoute(pos), null);
  f.state.context.links.pos_orders = true;
  assert.deepEqual(plain(f.state.orderRoute(pos)), {
    name: "BPageOrderPosDashboard",
    params: { basket_id: 18, shop_id: 7 },
  });
  assert.deepEqual(plain(f.state.customerRoute("BPageCustomerDashboard")), {
    name: "BPageCustomerDashboard",
    params: { shop_id: 7, customer_id: 12 },
  });
});

test("the compact order summary keeps the newest three supplied orders", async () => {
  const f = fixture();
  f.requests[0].resolve({
    data: linked({
      orders_state: "available",
      orders: [31, 30, 29, 28, 27].map((id) => ({ id, channel: "online" })),
    }),
  });
  await settle();
  assert.deepEqual(
    plain(f.state.orders.map((order) => order.id)),
    [31, 30, 29],
  );
});

test("unmount and deselection invalidate pending requests", async () => {
  const f = fixture();
  f.select(null);
  assert.equal(f.state.busy, false);
  assert.equal(f.requests.length, 1);
  f.requests[0].resolve({ data: linked() });
  await settle();
  assert.equal(f.state.context, null);
  f.select({ id: 32 });
  f.component.beforeUnmount.call(f.state);
  f.requests[1].resolve({ data: linked() });
  await settle();
  assert.equal(f.state.context, null);
});
