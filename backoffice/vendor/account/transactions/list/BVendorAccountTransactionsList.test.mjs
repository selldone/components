import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import ts from "typescript";

const filename = new URL(
  "./BVendorAccountTransactionsList.vue",
  import.meta.url,
);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "vendor-transactions-test",
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  const compiled = await compileStyleAsync({
    source: style.content,
    filename: filename.pathname,
    id: "data-v-vendor-transactions-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  });
  assert.deepEqual(compiled.errors, []);
}
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));

function fixture() {
  const requests = [],
    notices = [];
  const exports = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports,
    axios: {
      get(url, payload) {
        return new Promise((resolve, reject) =>
          requests.push({
            url,
            payload,
            resolve: (data) => resolve({ data }),
            reject,
          }),
        );
      },
    },
    window: {
      SERACH_THROTTLE: 0,
      API: {
        GET_SHOP_VENDOR_ACCOUNT_TRANSACTIONS: (shop, account) =>
          `/fixture/shops/${shop}/wallets/${account}/transactions`,
      },
    },
    require(name) {
      if (name.includes("NotificationService"))
        return {
          default: {
            showErrorAlert: (...args) => notices.push(["application", ...args]),
            showLaravelError: (...args) => notices.push(["network", ...args]),
          },
        };
      if (name === "lodash-es") return { throttle: (fn) => fn };
      return { default: {} };
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    shop: { id: 42 },
    account: { id: 7, balance: -18, currency: "USD" },
    modern: true,
    $t: (key) => key,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: getter.bind(state) });
  return { component, state, requests, notices };
}

test("legacy is the default; all five server sort fields and both directions remain available", () => {
  const { component, state } = fixture();
  assert.equal(component.props.modern.default, false);
  const fields = ["amount", "source", "officer_id", "note", "created_at"];
  assert.deepEqual(plain(state.headers.map((header) => header.value)), fields);
  for (const order of ["asc", "desc"]) {
    state.sortBy = [{ key: "created_at", order }];
    for (const [index, field] of fields.entries()) {
      state.sortItems[index].click();
      assert.deepEqual(plain(state.sortBy), [{ key: field, order }]);
    }
    state.sortItems.at(-1).click();
    assert.deepEqual(plain(state.sortBy), [
      { key: "created_at", order: order === "asc" ? "desc" : "asc" },
    ]);
  }
});

test("ledger labels distinguish order credit/refund and payout/reversal with their actual direction", () => {
  const { state } = fixture();
  for (const [source, amount, label, direction] of [
    ["ORDER", 40, "order_fee", "marketplace_to_wallet"],
    ["ORDER", -40, "order_refund", "wallet_to_marketplace"],
    ["PAYOUT", -40, "payout", "wallet_to_bank"],
    ["PAYOUT", 40, "reverse_fund", "bank_to_wallet"],
  ]) {
    assert.equal(
      state.transactionSource({ source, amount }),
      `vendor_account_transactions.${label}`,
    );
    assert.equal(
      state.transactionDirection({ source, amount }),
      `marketplace_wallets.transactions.${direction}`,
    );
  }
  assert.equal(
    state.transactionSource({ source: "ADJUSTMENT", amount: 1 }),
    "ADJUSTMENT",
  );
  assert.equal(
    state.transactionDirection({ source: "ADJUSTMENT", amount: 1 }),
    "",
  );
  assert.equal(
    state.transactionSource({ amount: 1 }),
    "marketplace_wallets.transactions.unknown_source",
  );
});

test("first load, pagination and search keep shop/account and existing query arguments", async () => {
  const { component, state, requests } = fixture();
  component.created.call(state);
  assert.equal(requests[0].url, "/fixture/shops/42/wallets/7/transactions");
  assert.deepEqual(plain(requests[0].payload.params), {
    offset: 0,
    limit: 10,
    sortBy: null,
    sortDesc: true,
    search: null,
  });
  requests[0].resolve({ transactions: [{ id: 1, amount: -18 }], total: 23 });
  await setImmediate();
  assert.equal(state.pageCount, 3);
  assert.equal(state.transactions[0].amount, -18);
  Object.assign(state, {
    page: 3,
    search: "refund",
    sortBy: [{ key: "amount", order: "asc" }],
  });
  component.watch.page.call(state);
  assert.deepEqual(plain(requests[1].payload.params), {
    offset: 20,
    limit: 10,
    sortBy: "amount",
    sortDesc: false,
    search: "refund",
  });
  component.watch.search.call(state);
  assert.equal(state.page, 1);
  component.watch.page.call(state);
  assert.equal(requests[2].payload.params.offset, 0);
});

test("denied and failed reads preserve records and expose a recoverable error", async () => {
  for (const network of [false, true]) {
    const { state, requests, notices } = fixture();
    state.transactions = [{ id: 1 }];
    state.totalItems = 1;
    state.fetchRequests();
    if (network) requests[0].reject(new Error("Fixture failure"));
    else requests[0].resolve({ error: true, error_msg: "Denied" });
    await setImmediate();
    assert.equal(state.fetch_error, true);
    assert.equal(state.busy_fetch, false);
    assert.deepEqual(plain(state.transactions), [{ id: 1 }]);
    assert.equal(notices[0][0], network ? "network" : "application");
    state.fetchRequests();
    requests[1].resolve({ transactions: [], total: 0 });
    await setImmediate();
    assert.equal(state.fetch_error, false);
    assert.equal(state.totalItems, 0);
  }
});

test("changing wallets clears its old rows and ignores late responses or unmounted reads", async () => {
  const { component, state, requests } = fixture();
  state.fetchRequests();
  state.transactions = [{ id: 1 }];
  state.totalItems = 1;
  state.account = { id: 8, currency: "DKK" };
  component.watch.account.call(state, state.account);
  assert.deepEqual(plain(state.transactions), []);
  assert.equal(state.totalItems, 0);
  assert.equal(requests[1].url, "/fixture/shops/42/wallets/8/transactions");
  requests[1].resolve({ transactions: [{ id: 8 }], total: 1 });
  requests[0].resolve({ transactions: [{ id: 7 }], total: 999 });
  await setImmediate();
  assert.deepEqual(plain(state.transactions), [{ id: 8 }]);
  assert.equal(state.totalItems, 1);
  state.fetchRequests();
  component.beforeUnmount.call(state);
  requests[2].resolve({ transactions: [{ id: 99 }], total: 999 });
  await setImmediate();
  assert.deepEqual(plain(state.transactions), [{ id: 8 }]);
  state.account = null;
  component.watch.account.call(state, null);
  assert.equal(requests.length, 3);
  assert.equal(state.busy_fetch, false);
});

test("modern template preserves signed native-currency amount, officer, full note and both dates", async () => {
  const { component } = fixture();
  const flowContexts = [];
  const vendor = { id: 17, name: "Fixture vendor" };
  const exports = {};
  vm.runInNewContext(transpile(template.code), { exports, require: () => Vue });
  const record = {
    id: 1,
    amount: -42.25,
    currency: "DKK",
    source: "PAYOUT",
    officer_id: 12,
    officer: { name: "Fixture Officer" },
    note: "A complete note\nwith a second line",
    created_at: "2026-10-29T10:00:00Z",
  };
  const longNote =
    "A complete payment reference that must remain available beyond the compact two-line preview.\n" +
    "The second line preserves the original multiline note and its final reference number 1234567890.";
  const longRecord = { ...record, id: 2, note: longNote };
  const wrapper = {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("div", slots.default?.()),
  };
  const app = Vue.createSSRApp(
    {
      ...component,
      components: {
        BVendorPayoutPods: {
          inheritAttrs: false,
          setup(_, { attrs }) {
            flowContexts.push(attrs);
            return () => Vue.h("figure");
          },
        },
        USmartMenu: wrapper,
        UCurrencyIcon: wrapper,
      },
      render: exports.render,
      data: () => ({
        ...component.data(),
        transactions: [record, longRecord],
        totalItems: 2,
      }),
    },
    {
      shop: { id: 42 },
      account: { id: 7, balance: -42.25, currency: "DKK", vendor },
      modern: true,
    },
  );
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $vuetify: { display: { width: 1024, xs: false } },
    getFromNowString: () => "relative-date",
    getLocalTimeString: () => "exact-date",
    getUserAvatar: (id) => `/fixture/avatar/${id}`,
  });
  for (const name of [
    "VContainer",
    "VSpacer",
    "VTextField",
    "VIcon",
    "VTooltip",
    "VAvatar",
    "VImg",
    "VBtn",
    "VPagination",
    "ULoadingProgress",
    "UWidgetHeader",
    "VListSubheader",
  ])
    app.component(name, wrapper);
  app.component("UPrice", {
    props: ["amount", "currency"],
    setup: (props) => () =>
      Vue.h("span", { "data-currency": props.currency }, String(props.amount)),
  });
  app.component("VDataTableServer", {
    props: ["items", "headers"],
    setup:
      (props, { slots }) =>
      () =>
        Vue.h("table", [
          Vue.h(
            "tbody",
            props.items.map((item) =>
              Vue.h(
                "tr",
                props.headers.map((header) =>
                  Vue.h("td", slots[`item.${header.value}`]?.({ item })),
                ),
              ),
            ),
          ),
        ]),
  });
  const html = await renderToString(app);
  assert.equal(flowContexts.length, 1);
  assert.equal(flowContexts[0]["active-stage"], "wallet");
  assert.equal(flowContexts[0].vendor, vendor);
  assert.equal(flowContexts[0].shop.id, 42);
  assert.ok(Object.hasOwn(flowContexts[0], "modern"));
  assert.match(html, /data-currency="DKK"[^>]*>-42\.25/);
  for (const value of [
    "Fixture Officer",
    "A complete note",
    "with a second line",
    "relative-date",
    "exact-date",
    "vendor_account_transactions.payout",
    "marketplace_wallets.transactions.wallet_to_bank",
  ])
    assert.ok(html.includes(value), value);
  assert.ok(!html.includes("vendor_account_transactions.reverse_fund"));
  const disclosures = [
    ...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g),
  ].map((match) => match[1]);
  const noteDisclosure = disclosures.find((content) => content.includes(longNote));
  assert.ok(
    noteDisclosure,
    "the complete multiline note is available in its disclosure",
  );
  assert.match(noteDisclosure, /<summary>/);
  assert.ok(noteDisclosure.includes("marketplace_wallets.transactions.show_note"));
  assert.ok(
    !disclosures.some((content) => content.includes(record.note)),
    "short notes remain fully visible without a disclosure",
  );
});
