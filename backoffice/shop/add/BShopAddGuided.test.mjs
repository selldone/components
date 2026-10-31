import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { setImmediate } from "node:timers/promises";
import vm from "node:vm";

// Compile the shared SFC with application dependencies; all HTTP stays in memory.
const require = createRequire(new URL("../../../../../package.json", import.meta.url));
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const { JSDOM } = require("jsdom");
const { compileScript, compileStyleAsync, compileTemplate, parse } = require("@vue/compiler-sfc");
const ts = require("typescript");
const file = new URL("./BShopAdd.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"), { filename: file.pathname });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "shop-add-guided-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "shop-add-guided-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
const plain = (value) => JSON.parse(JSON.stringify(value));
const evaluate = (source, globals = {}) => {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, ...globals });
  return exports;
};
const { Slugify } = evaluate(readFileSync(new URL("../../../../core-js/utils/slugify/slugify.ts", import.meta.url), "utf8"));
const { Currency } = evaluate(readFileSync(new URL("../../../../core-js/enums/payment/Currency.ts", import.meta.url), "utf8"), {
  require: () => ({ default: "/fixture/currency" }),
});
const render = evaluate(template.code, { require: () => Vue }).render;
const settled = async () => { await setImmediate(); await Vue.nextTick(); };
const wallet = (currency, id, balance = 100, locked = 10) => ({
  id, account_number: `100000000000000${id}`, account_name: `Fixture ${currency}`,
  currency, balance, locked, status: "Approved",
});
const usdWallet = wallet("USD", 1), eurWallet = wallet("EUR", 2);
const feeQuote = (fee = 0, currency = "USD", reason = fee ? "additional_shop" : "first_shop", account = null) => ({
  success: true, count: fee ? 1 : 0, fee, currency,
  is_free: fee === 0, charged_from_wallet: fee > 0, reason,
  base_fee: fee ? 25 : 0, base_currency: "USD",
  account_number: account?.account_number ?? null,
  available_balance: account ? account.balance - account.locked : null,
  can_pay: fee === 0 || !!account && account.balance - account.locked >= fee,
});
const auditUrl = "/isolated-api/shop/audit";
const walletsUrl = "/isolated-api/accounts/list-active/*";
const pendingRequest = (e, url) => e.requests.findLast((request) => request.url === url && request.pending);
const loadQuote = async (e, data = feeQuote()) => {
  if (!pendingRequest(e, auditUrl)) e.state.getCreationFee();
  pendingRequest(e, auditUrl).resolve(data);
  await settled();
};
const loadWallets = async (e, accounts = [usdWallet, eurWallet]) => {
  pendingRequest(e, walletsUrl).resolve({ accounts });
  await settled();
};
const paidSelection = async (e, account = usdWallet, fee = 25) => {
  await loadQuote(e, feeQuote(25));
  await loadWallets(e);
  await e.renderForm();
  if (e.state.creation_account?.account_number !== account.account_number)
    e.controls.get("VSelect")[0]["onUpdate:modelValue"](account);
  await loadQuote(e, feeQuote(fee, account.currency, "additional_shop", account));
};
const assertNoBillingUi = (document) => {
  assert.equal(document.querySelector(".b-shop-add__fee"), null);
  assert.equal(document.querySelector(".b-shop-add__wallet-input"), null);
  assert.equal(document.querySelector('[aria-label="add_shop.guided.fee_help"]'), null);
  for (const key of ["fee_title", "fee_free", "fee_no_charge", "wallet_label", "wallet_balance", "wallet_manage"])
    assert.equal(document.body.textContent.includes(`add_shop.guided.${key}`), false);
};

function environment({ guided = true, modern = true, shop, showStepper = true } = {}) {
  const requests = [], events = [], alerts = [], translations = [], controls = new Map();
  const request = (method, url, payload) => new Promise((resolve, reject) => {
    const entry = { method, url, payload, pending: true,
      resolve: (data) => { entry.pending = false; resolve({ data }); },
      reject: (error) => { entry.pending = false; reject(error); } };
    requests.push(entry);
  });
  const window = { API: {
    POST_ADD_SHOP: () => "/isolated-api/shops",
    GET_SHOP_CREATION_FEE: () => "/isolated-api/shop/audit",
    GET_ACTIVE_ACCOUNT_LIST: (currency) => `/isolated-api/accounts/list-active/${currency}`,
    GET_CHECK_SHOP_NAME: () => "/isolated-api/shops/name",
    GET_SEO_PREVIEW_SHOP: (id) => `/isolated-api/shops/${id}/seo`,
    UPLOAD_SHOP_IMAGE: (id) => `/isolated-api/shops/${id}/logo`,
    UPLOAD_SHOP_FAV_ICON: (id) => `/isolated-api/shops/${id}/favicon`,
  } };
  const stub = (name) => Vue.defineComponent({
    name, inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        if (!controls.has(name)) controls.set(name, []);
        controls.get(name).push(attrs);
        if (name === "VDialog" && !attrs.modelValue) return Vue.h(Vue.Comment);
        return Vue.h(name === "VBtn" ? "button" : name === "VIcon" ? "span" : "div", {
          class: attrs.class, disabled: attrs.disabled,
          "data-feature": name, "aria-label": attrs["aria-label"],
        }, [slots.activator?.({ props: {} }), slots.default?.(),
          slots["prepend-inner"]?.(), slots["append-inner"]?.(),
          slots.prepend?.(), slots.title?.(), slots.subtitle?.(), slots.append?.(),
          name === "VSelect" && attrs.modelValue ? slots.selection?.({ item: { raw: attrs.modelValue } }) : null,
          name === "VSelect" ? attrs.items?.map((account) => slots.item?.({ item: { raw: account }, props: {} })) : null]);
      };
    },
  });
  const notifications = Object.fromEntries(["showSuccessAlert", "showErrorAlert", "showLaravelError"]
    .map((name) => [name, (...args) => alerts.push({ name, args })]));
  const component = evaluate(script.content, {
    window,
    axios: {
      post: (url, payload) => request("POST", url, payload),
      get: (url, options) => request("GET", url, options),
    },
    require: (path) => {
      if (path.endsWith(".vue")) return { default: stub(path.split("/").at(-1).replace(".vue", "")) };
      if (path === "lodash-es") return { throttle: (fn) => fn };
      if (path.endsWith("/SetupService")) return { SetupService: { MainServiceUrl: () => "https://example.test" } };
      if (path.includes("NotificationService")) return { default: notifications };
      if (path.includes("/slugify")) return { Slugify };
      if (path.includes("enums/payment/Currency")) return { Currency };
      if (path.includes("enums/wallet/AccountStatus")) return { AccountStatus: { Approved: { code: "Approved" } } };
      if (path.includes("/TrackSeller")) return { TrackSeller: { onAddShop() {} } };
      return { default: {}, UMixinConfetti: {}, ShopURLs: {} };
    },
  }).default;
  const state = {
    ...component.data(), guided, modern, shop, showStepper, readOnly: false,
    hasFirstBack: true, window, ThemeColorDark: "#222",
    $options: component,
    $t: (key, values) => { translations.push({ key, values }); return key; },
    $vuetify: { locale: { isRtl: false } },
    $emit: (...args) => events.push(args),
    getCurrentLanguage: () => ({ locale: "en" }), USER: () => ({ has_deal: false }),
    getShopImagePath: (path) => `/fixture/${path || "empty"}`,
    GetCurrency: (currency) => Currency[currency],
    ShowConfetti() {},
  };
  state.$data = state;
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  component.created.call(state);
  async function renderForm() {
    controls.clear();
    const props = Object.fromEntries(Object.keys(component.props).map((key) => [key, state[key]]));
    const app = Vue.createSSRApp({ components: component.components, props: component.props,
      computed: component.computed,
      data: () => Object.fromEntries(Object.entries(state)
        .filter(([key]) => !(key in props) && !key.startsWith("$"))),
      render(...args) {
        const tree = render.apply(this, args), steps = [];
        const collect = (node) => {
          if (!node || typeof node !== "object") return;
          if (node.type === "button" && node.props?.class?.includes("b-shop-add__step")) steps.push(node.props);
          if (Array.isArray(node.children)) node.children.forEach(collect);
        };
        collect(tree);
        controls.set("StepButton", steps);
        return tree;
      },
    }, props);
    for (const [key, value] of Object.entries(state))
      if (["$t", "$vuetify"].includes(key)) app.config.globalProperties[key] = value;
    for (const name of ["VBtn", "VIcon", "VTooltip", "VTabs", "VTab", "VAvatar", "VDialog", "VSelect", "VListItem",
      "VTextField", "VTextarea", "VListSubheader", "VProgressCircular", "VChip", "VExpandTransition"])
      app.component(name, stub(name));
    app.directive("copy", { getSSRProps: () => ({}) });
    return new JSDOM(await renderToString(app)).window.document;
  }
  return { state, requests, events, alerts, translations, controls, renderForm,
    unmount: () => component.beforeUnmount.call(state) };
}

test("shared shop template, script and scoped styles compile", async () => {
  for (const block of descriptor.styles) {
    const result = await compileStyleAsync({ source: block.content, filename: file.pathname,
      id: "shop-add-guided-test", scoped: block.scoped, preprocessLang: block.lang });
    assert.deepEqual(result.errors, []);
  }
});

test("Guided creation reads before input and shows paid billing on both stages without an initial flash", async () => {
  const e = environment(), s = e.state;
  assert.equal(s.step, 0);
  assert.equal(s.title, "");
  assert.equal(s.name, "");
  assert.equal(e.requests.length, 1);
  assert.equal(e.requests[0].method, "GET");
  assert.equal(e.requests[0].url, "/isolated-api/shop/audit");
  assert.deepEqual(plain(e.requests[0].payload), { params: {} });
  let document = await e.renderForm();
  let content = document.querySelector(".b-shop-add__content");
  assertNoBillingUi(document);
  assert.ok(content.firstElementChild.classList.contains("b-shop-add__panel"));
  assert.ok(content.querySelector(".b-shop-add__panel"));
  assert.equal(content.querySelector('[aria-label="add_shop.guided.fee_help"]'), null);
  await loadQuote(e, feeQuote(25));
  document = await e.renderForm();
  assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
  assert.equal(e.controls.get("VSelect")[0].loading, true);
  await loadWallets(e);
  await e.renderForm();
  e.controls.get("VSelect")[0]["onUpdate:modelValue"](eurWallet);
  await loadQuote(e, feeQuote(37.45, "EUR", "additional_shop", eurWallet));
  document = await e.renderForm();
  content = document.querySelector(".b-shop-add__content");
  assert.ok(content.firstElementChild.classList.contains("b-shop-add__fee"));
  assert.equal(e.controls.get("UPrice")[0].amount, 37.45);
  assert.equal(e.controls.get("UPrice")[0].currency, "EUR");
  s.goTo(1);
  document = await e.renderForm();
  assert.ok(document.querySelector(".b-shop-add__fee"));
  assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
  await loadQuote(e, feeQuote(37.45, "EUR", "additional_shop", eurWallet));
  document = await e.renderForm();
  assert.ok(document.querySelector(".b-shop-add__fee"));
  assert.equal(s.title, "");
  assert.equal(s.name, "");
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  assert.ok(e.requests.every((request) => request.method === "GET"));
  assert.equal(e.events.length, 0);
});

test("Guided creation has two stages, no legacy progress and native required-state disabling", async () => {
  const e = environment(), s = e.state;
  let document = await e.renderForm();
  assert.equal(document.querySelectorAll(".b-shop-add__steps button").length, 2);
  assert.equal(e.controls.has("UProgressStepper"), false);
  assert.equal(e.controls.has("VTabs"), false);
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  assert.equal(document.querySelector(".b-shop-add__later"), null);
  s.title = "   ";
  await e.renderForm();
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  s.title = "Fixture & Studio";
  s.language = "";
  await e.renderForm();
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  s.language = "en";
  document = await e.renderForm();
  assert.equal(e.controls.get("VBtn").at(-1).disabled, false);
  assert.equal(document.querySelectorAll(".b-shop-add__steps button:disabled").length, 0);
  e.controls.get("VBtn").at(-1).onClick();
  assert.equal(s.step, 1);
  assert.equal(s.name, Slugify.apply(s.title));
  assert.equal(e.requests.filter((request) => request.url === auditUrl).length, 2);
  assert.ok(e.requests.every((request) => request.method === "GET"));
  assert.deepEqual(plain(e.requests.at(-1).payload), { params: {} });
  await loadQuote(e);
});

test("Guided step navigation derives the same native slug and preserves an edited name", async () => {
  const e = environment(), s = e.state;
  s.title = "Fixture & Studio";
  await e.renderForm();
  e.controls.get("StepButton")[1].onClick();
  assert.equal(s.step, 1);
  assert.equal(s.name, Slugify.apply(s.title));
  await loadQuote(e);
  s.name = "chosen-handle";
  s.goPrevious();
  const document = await e.renderForm();
  assert.equal(document.querySelectorAll(".b-shop-add__steps button").length, 2);
  e.controls.get("VBtn").at(-1).onClick();
  assert.equal(s.name, "chosen-handle");
  assert.equal(e.requests.filter((request) => request.url === auditUrl).length, 3);
  await loadQuote(e);
});

test("Create posts native shop fields with the selected wallet and exact quote expectations", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio", active: false,
    description: "Fixture description", info: { phone: "+1 202 555 0142" } });
  await paidSelection(e, eurWallet, 22.5);
  await e.renderForm();
  e.controls.get("VBtn").at(-1).onClick();
  assert.equal(s.busy_add_shop, true);
  const post = e.requests.find((request) => request.method === "POST");
  assert.ok(post);
  assert.equal(post.method, "POST");
  assert.equal(post.url, "/isolated-api/shops");
  assert.deepEqual(plain(post.payload), { title: s.title, name: s.name,
    language: "en", active: false, description: s.description, info: plain(s.info),
    account_number: eurWallet.account_number, expected_fee: 22.5, expected_currency: "EUR" });
  await e.renderForm();
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  const shop = { id: 41, ...plain(post.payload) };
  post.resolve({ shop });
  await settled();
  assert.deepEqual(plain(e.events), [["update:shop", shop], ["add", shop]]);
  assert.equal(s.step, 2);
  assert.equal(s.busy_add_shop, false);
});

test("Free creation still sends zero fee/currency expectations and never requires a wallet", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
  await loadQuote(e);
  await e.renderForm();
  assert.equal(e.controls.has("VSelect"), false);
  assert.equal(e.requests.some((request) => request.url === walletsUrl), false);
  assert.equal(s.can_create_with_fee, true);
  s.addShop();
  const post = e.requests.find((request) => request.method === "POST");
  assert.equal(post.payload.expected_fee, 0);
  assert.equal(post.payload.expected_currency, "USD");
  assert.equal("account_number" in post.payload, false);
});

test("free creation hides the entire billing area during loading and on both creation stages", async () => {
  for (const reason of ["first_shop", "agency_plan", "existing_test_shop"]) {
    const e = environment(), s = e.state;
    assertNoBillingUi(await e.renderForm());
    await loadQuote(e, feeQuote(0, "USD", reason));
    assertNoBillingUi(await e.renderForm());
    Object.assign(s, { title: "Fixture Studio", name: "fixture-studio" });
    s.goNext();
    assert.equal(s.step, 1);
    assert.equal(s.busy_creation_fee, true);
    assertNoBillingUi(await e.renderForm());
    await loadQuote(e, feeQuote(0, "USD", reason));
    assertNoBillingUi(await e.renderForm());
    assert.equal(s.can_create_with_fee, true);
    assert.equal(e.requests.some((request) => request.url === walletsUrl), false);
    assert.ok(e.requests.every((request) => request.method === "GET"));
  }
});

test("a failed refresh after a free quote remains visible, blocks creation and can recover", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { title: "Fixture Studio", name: "fixture-studio" });
  await loadQuote(e);
  s.goNext();
  await loadQuote(e, { error: true });
  let document = await e.renderForm();
  assert.ok(document.querySelector(".b-shop-add__fee"));
  assert.ok(document.querySelector('[role="alert"]').textContent.includes("add_shop.guided.fee_error"));
  assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
  assert.equal(document.querySelector(".b-shop-add__wallet-input"), null);
  assert.equal(document.body.textContent.includes("add_shop.guided.fee_free"), false);
  assert.equal(s.can_create_with_fee, false);
  s.addShop();
  assert.equal(e.requests.some((request) => request.method === "POST"), false);
  const retry = e.controls.get("VBtn").find((button) => button.onClick === s.getCreationFee);
  const pending = retry.onClick();
  pendingRequest(e, auditUrl).resolve(feeQuote());
  await pending;
  document = await e.renderForm();
  assertNoBillingUi(document);
  assert.equal(s.can_create_with_fee, true);
});

test("a late wallet response after paid pricing becomes free cannot restore billing or select a wallet", async () => {
  const e = environment(), s = e.state;
  await loadQuote(e, feeQuote(25));
  const wallets = pendingRequest(e, walletsUrl);
  s.goTo(1);
  await loadQuote(e);
  assertNoBillingUi(await e.renderForm());
  const audits = e.requests.filter((request) => request.url === auditUrl).length;
  wallets.resolve({ accounts: [usdWallet, eurWallet] });
  await settled();
  assertNoBillingUi(await e.renderForm());
  assert.equal(s.creation_account, null);
  assert.equal(e.requests.filter((request) => request.url === auditUrl).length, audits);
  assert.ok(e.requests.every((request) => request.method === "GET"));
});

test("paid base pricing requires a wallet and the selector emits the complete selected account", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
  await loadQuote(e, feeQuote(25));
  let document = await e.renderForm();
  assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
  assert.equal(s.can_create_with_fee, false);
  s.addShop();
  assert.equal(e.requests.some((request) => request.method === "POST"), false);
  assert.deepEqual(plain(pendingRequest(e, walletsUrl).payload), { params: { offset: 0, limit: 100 } });
  await s.fetchCreationWallets();
  assert.equal(e.requests.filter((request) => request.url === walletsUrl).length, 1);
  await loadWallets(e, [usdWallet, eurWallet, { ...wallet("USD", 3), status: "Banned" }]);
  document = await e.renderForm();
  const select = e.controls.get("VSelect")[0];
  assert.equal(select["item-value"], "account_number");
  assert.ok("return-object" in select);
  assert.deepEqual(plain(select.items), [usdWallet, eurWallet]);
  select["onUpdate:modelValue"](eurWallet);
  assert.equal(s.creation_account, eurWallet);
  assert.deepEqual(plain(e.requests.at(-1).payload), { params: { account_number: eurWallet.account_number } });
  assert.equal(s.can_create_with_fee, false);
  await loadQuote(e, feeQuote(22.5, "EUR", "additional_shop", eurWallet));
  assert.equal(s.can_create_with_fee, true);
});

test("wallet defaults prefer the first USD, then EUR, then approved wallet without reordering", async () => {
  const aud = wallet("AUD", 3), gbp = wallet("GBP", 4), secondUsd = wallet("USD", 5);
  for (const [accounts, selected] of [
    [[aud, eurWallet, usdWallet, secondUsd], usdWallet],
    [[aud, eurWallet, wallet("EUR", 6)], eurWallet],
    [[{ ...usdWallet, status: "Banned" }, aud, gbp], aud],
  ]) {
    const e = environment(), s = e.state;
    await loadQuote(e, feeQuote(25));
    await loadWallets(e, accounts);
    assert.equal(s.creation_account.account_number, selected.account_number);
    assert.deepEqual(plain(s.creation_wallets.map((account) => account.account_number)),
      accounts.filter((account) => account.status === "Approved").map((account) => account.account_number));
    assert.deepEqual(plain(pendingRequest(e, auditUrl).payload), { params: { account_number: selected.account_number } });
    assert.equal(s.busy_creation_fee, true);
    assert.equal(s.can_create_with_fee, false);
    let document = await e.renderForm();
    assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
    pendingRequest(e, auditUrl).resolve({ error: true });
    await settled();
    document = await e.renderForm();
    assert.equal(s.creation_fee_error, true);
    assert.equal(s.can_create_with_fee, false);
    assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
    assert.ok(e.requests.every((request) => request.method === "GET"));
  }
});

test("a manually selected wallet survives a failed list reload and its retry", async () => {
  const e = environment(), s = e.state;
  await paidSelection(e, eurWallet, 22.5);
  const quotedRequests = e.requests.filter((request) => request.url === auditUrl).length;
  let pending = s.fetchCreationWallets();
  pendingRequest(e, walletsUrl).reject(new Error("Fixture wallet refresh failure"));
  await pending;
  assert.equal(s.creation_account.account_number, eurWallet.account_number);
  assert.equal(s.creation_wallets_error, true);
  pending = s.fetchCreationWallets();
  const accounts = [wallet("USD", 4), usdWallet, eurWallet];
  pendingRequest(e, walletsUrl).resolve({ accounts });
  await pending;
  assert.equal(s.creation_account.account_number, eurWallet.account_number);
  assert.equal(s.creation_wallets_error, false);
  assert.deepEqual(plain(s.creation_wallets.map((account) => account.account_number)),
    accounts.map((account) => account.account_number));
  assert.equal(e.requests.filter((request) => request.url === auditUrl).length, quotedRequests);
  assert.equal(s.creation_fee.currency, "EUR");
});

test("wallet list failures, malformed data and an empty list preserve a safe retry/empty state", async () => {
  for (const failure of ["network", "business", "malformed", "unknown-currency", "empty"]) {
    const e = environment(), s = e.state;
    Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
    await loadQuote(e, feeQuote(25));
    const list = pendingRequest(e, walletsUrl);
    if (failure === "network") list.reject(new Error("Fixture wallet failure"));
    else list.resolve(failure === "business" ? { error: true }
      : failure === "malformed" ? { accounts: null }
      : failure === "unknown-currency" ? { accounts: [wallet("UNKNOWN", 9)] } : { accounts: [] });
    await settled();
    let document = await e.renderForm();
    assert.equal(s.busy_creation_wallets, false);
    assert.equal(s.can_create_with_fee, false);
    assert.equal(s.creation_wallets.length, 0);
    assert.equal(s.creation_wallets_error, failure !== "empty");
    assert.ok(document.body.textContent.includes(failure === "empty"
      ? "add_shop.guided.wallet_empty" : "add_shop.guided.wallet_error"));
    s.addShop();
    assert.equal(e.requests.some((request) => request.method === "POST"), false);
    if (failure !== "empty") {
      const retry = e.controls.get("VBtn").find((button) => button.onClick === s.fetchCreationWallets);
      assert.ok(retry);
      assert.ok(document.body.textContent.includes("add_shop.guided.retry"));
      assert.equal(document.body.textContent.includes("global.actions.retry"), false);
      const retried = retry.onClick();
      pendingRequest(e, walletsUrl).resolve({ accounts: [usdWallet] });
      await retried;
      document = await e.renderForm();
      assert.equal(s.creation_wallets_error, false);
      assert.equal(e.controls.get("VSelect")[0].items.length, 1);
    }
  }
});

test("insufficient funds and mismatched selected-wallet quotes never enable creation", async () => {
  for (const mismatch of ["insufficient", "account", "currency", "balance", "can-pay"]) {
    const e = environment(), s = e.state;
    Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
    await loadQuote(e, feeQuote(25));
    await loadWallets(e);
    s.onCreationWalletChange(eurWallet);
    const data = feeQuote(22.5, "EUR", "additional_shop", eurWallet);
    if (mismatch === "insufficient") Object.assign(data, { available_balance: 1, can_pay: false });
    if (mismatch === "account") data.account_number = usdWallet.account_number;
    if (mismatch === "currency") data.currency = "USD";
    if (mismatch === "balance") data.available_balance = "90";
    if (mismatch === "can-pay") data.can_pay = false;
    await loadQuote(e, data);
    const document = await e.renderForm();
    assert.equal(s.can_create_with_fee, false);
    assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
    assert.equal(s.creation_fee_error, mismatch !== "insufficient");
    if (mismatch === "insufficient") assert.ok(document.body.textContent.includes("add_shop.guided.wallet_insufficient"));
    s.addShop();
    assert.equal(e.requests.some((request) => request.method === "POST"), false);
  }
});

test("unavailable conversion keeps the wallet selectable, shows targeted help and never invents a fee", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
  await loadQuote(e, feeQuote(25));
  await loadWallets(e);
  s.onCreationWalletChange(eurWallet);
  await loadQuote(e, { error: true, code: "shop_creation_conversion_unavailable" });
  let document = await e.renderForm();
  assert.equal(s.creation_conversion_unavailable, true);
  assert.equal(s.creation_fee_error, true);
  assert.equal(s.can_create_with_fee, false);
  assert.equal(s.creation_account.account_number, eurWallet.account_number);
  assert.equal(e.controls.get("VSelect")[0].disabled, false);
  assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
  assert.equal(document.querySelector(".b-shop-add__fee-help-amount"), null);
  assert.ok(document.body.textContent.includes("add_shop.guided.wallet_quote_error"));
  assert.equal(document.body.textContent.includes("add_shop.guided.fee_error"), false);
  assert.ok(document.body.textContent.includes("add_shop.guided.retry"));
  s.addShop();
  assert.equal(e.requests.some((request) => request.method === "POST"), false);
  e.controls.get("VSelect")[0]["onUpdate:modelValue"](usdWallet);
  assert.equal(s.creation_conversion_unavailable, false);
  await loadQuote(e, feeQuote(25, "USD", "additional_shop", usdWallet));
  document = await e.renderForm();
  assert.equal(s.creation_fee_error, false);
  assert.equal(s.can_create_with_fee, true);
  assert.equal(document.body.textContent.includes("add_shop.guided.wallet_quote_error"), false);
  assert.ok(e.requests.every((request) => request.method === "GET"));
});

test("rapid wallet switches ignore outdated quote successes and failures", async () => {
  for (const olderFailure of [false, true]) {
    const e = environment(), s = e.state;
    await loadQuote(e, feeQuote(25));
    await loadWallets(e);
    s.onCreationWalletChange(usdWallet);
    const older = pendingRequest(e, auditUrl);
    s.onCreationWalletChange(eurWallet);
    const latest = pendingRequest(e, auditUrl);
    assert.notEqual(older, latest);
    latest.resolve(feeQuote(22.5, "EUR", "additional_shop", eurWallet));
    await settled();
    if (olderFailure) older.reject(new Error("Fixture old wallet response"));
    else older.resolve(feeQuote(25, "USD", "additional_shop", usdWallet));
    await settled();
    assert.equal(s.creation_account.account_number, eurWallet.account_number);
    assert.equal(s.creation_fee.account_number, eurWallet.account_number);
    assert.equal(s.creation_fee.currency, "EUR");
    assert.equal(s.creation_fee_error, false);
    assert.equal(s.busy_creation_fee, false);
    assert.equal(s.can_create_with_fee, true);
  }
});

test("wallet list responses after unmount cannot repopulate a discarded form", async () => {
  for (const failure of [false, true]) {
    const e = environment(), s = e.state;
    await loadQuote(e, feeQuote(25));
    const pending = pendingRequest(e, walletsUrl);
    e.unmount();
    if (failure) pending.reject(new Error("Fixture late wallet response"));
    else pending.resolve({ accounts: [usdWallet] });
    await settled();
    assert.equal(s.creation_wallets.length, 0);
    assert.equal(s.creation_wallets_error, false);
  }
});

test("IRR wallet quotes keep native rial values for UPrice display and the guarded POST", async () => {
  const e = environment(), s = e.state, irr = wallet("IRR", 3, 10_000_000, 1_000_000);
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
  await loadQuote(e, feeQuote(25));
  await loadWallets(e, [irr]);
  s.onCreationWalletChange(irr);
  await loadQuote(e, feeQuote(4_000_000, "IRR", "additional_shop", irr));
  await e.renderForm();
  assert.equal(Currency.IRR.alt_factor, 0.1);
  assert.equal(e.controls.get("UPrice").filter((price) => price.amount === 4_000_000 && price.currency === "IRR").length, 2);
  s.addShop();
  const post = e.requests.find((request) => request.method === "POST");
  assert.equal(post.payload.account_number, irr.account_number);
  assert.equal(post.payload.expected_fee, 4_000_000);
  assert.equal(post.payload.expected_currency, "IRR");
});

test("a changed server fee refreshes the selected-wallet quote while preserving the draft", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio", description: "Fixture draft" });
  await paidSelection(e, eurWallet, 22.5);
  s.addShop();
  const post = e.requests.find((request) => request.method === "POST");
  post.resolve({ error: true, quote_changed: true });
  await settled();
  assert.equal(s.title, "Fixture Studio");
  assert.equal(s.description, "Fixture draft");
  assert.equal(s.step, 1);
  assert.equal(s.creation_quote_changed, true);
  assert.equal(s.can_create_with_fee, false);
  assert.deepEqual(plain(pendingRequest(e, auditUrl).payload), { params: { account_number: eurWallet.account_number } });
  await loadQuote(e, feeQuote(23, "EUR", "additional_shop", eurWallet));
  assert.equal(s.creation_fee.fee, 23);
  assert.equal(s.can_create_with_fee, true);
  assert.equal(e.requests.filter((request) => request.method === "POST").length, 1);
});

test("business and transport creation failures preserve the draft for correction/retry", async () => {
  for (const failure of ["business", "transport"]) {
    const e = environment(), s = e.state;
    Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
    await loadQuote(e);
    s.addShop();
    if (failure === "business") e.requests[1].resolve({ error: true, error_msg: "Fixture rejection" });
    else e.requests[1].reject(new Error("Fixture network failure"));
    await settled();
    assert.equal(s.step, 1);
    assert.equal(s.name, "fixture-studio");
    assert.equal(s.title, "Fixture Studio");
    assert.equal(s.busy_add_shop, false);
    assert.equal(e.events.length, 0);
    assert.equal(e.alerts[0].name, failure === "business" ? "showErrorAlert" : "showLaravelError");
  }
});

test("paid quotes and native info tooltips show the exact amount/currency without a payment request", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
  await paidSelection(e, eurWallet, 37.45);
  const document = await e.renderForm();
  assert.ok(e.requests.every((request) => request.method === "GET"));
  assert.equal(e.requests[0].url, "/isolated-api/shop/audit");
  assert.equal(e.controls.get("VBtn").at(-1).disabled, false);
  const fee = document.querySelector(".b-shop-add__fee");
  assert.ok(fee);
  const tooltip = e.controls.get("VTooltip")[0];
  assert.equal(tooltip.location, "top");
  assert.equal(tooltip["content-class"], "sd-modern-tooltip text-start");
  assert.ok("open-on-focus" in tooltip);
  assert.ok("open-on-click" in tooltip);
  const help = e.controls.get("VBtn").find((button) => button["aria-label"] === "add_shop.guided.fee_help");
  assert.ok(help);
  assert.equal(help.type, "button");
  assert.ok(help.class.includes("sd-modern-info-button"));
  assert.ok(help.class.includes("sd-modern-icon-button"));
  assert.ok(fee.querySelector('button[aria-label="add_shop.guided.fee_help"]'));
  assert.equal(e.controls.get("UPrice").filter((price) => price.amount === 37.45 && price.currency === "EUR").length, 2);
  assert.ok(fee.textContent.includes("add_shop.guided.fee_wallet"));
  assert.ok(fee.textContent.includes("add_shop.guided.fee_wallet_help"));
  assert.ok(e.translations.some(({ key, values }) => key === "add_shop.guided.fee_wallet_help" && values.currency === "EUR"));
  assert.equal(s.creation_fee_error, false);
});

test("missing/loading/failed quotes block Create and retry recovers through a read-only GET", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
  await e.renderForm();
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  s.addShop();
  assert.equal(e.requests.length, 1);
  assert.equal(s.busy_creation_fee, true);
  let document = await e.renderForm();
  assertNoBillingUi(document);
  assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
  s.addShop();
  assert.equal(e.requests.length, 1);
  e.requests[0].reject(new Error("Fixture unavailable"));
  await settled();
  document = await e.renderForm();
  assert.equal(s.creation_fee, null);
  assert.equal(s.creation_fee_error, true);
  assert.equal(s.busy_creation_fee, false);
  assert.equal(document.querySelector('[aria-label="add_shop.guided.fee_help"]'), null);
  assert.ok(document.querySelector('[role="alert"]').textContent.includes("add_shop.guided.fee_error"));
  assert.ok(document.body.textContent.includes("add_shop.guided.retry"));
  assert.equal(document.body.textContent.includes("global.actions.retry"), false);
  assert.equal(document.body.textContent.includes("Fixture unavailable"), false);
  s.addShop();
  assert.equal(e.requests.length, 1);
  const retry = e.controls.get("VBtn").find((button) => button.onClick === s.getCreationFee);
  assert.ok(retry);
  const retried = retry.onClick();
  assert.equal(s.creation_fee_error, false);
  assert.equal(e.requests[1].method, "GET");
  e.requests[1].resolve(feeQuote());
  await retried;
  await e.renderForm();
  assert.equal(e.controls.get("VBtn").at(-1).disabled, false);
  assert.ok(e.requests.every((request) => request.method === "GET"));
});

test("malformed or rejected fee responses never become Free and cannot post", async () => {
  const valid = feeQuote(25);
  const invalid = [null, { ...valid, success: false }, { ...valid, error: true },
    { ...valid, fee: "25" }, { ...valid, fee: -1 }, { ...valid, fee: NaN },
    { ...valid, fee: Infinity }, { ...valid, currency: "" },
    { ...valid, currency: "             " }, { ...valid, currency: "INVALID-LONG-CODE" },
    { ...valid, currency: "UNKNOWN" },
    { ...valid, is_free: true }, { ...valid, charged_from_wallet: false },
    { ...feeQuote(), is_free: false }, { ...feeQuote(), charged_from_wallet: true }];
  for (const data of invalid) {
    const e = environment(), s = e.state;
    Object.assign(s, { step: 1, title: "Fixture Studio", name: "fixture-studio" });
    await loadQuote(e, data);
    const document = await e.renderForm();
    assert.equal(s.creation_fee, null);
    assert.equal(s.creation_fee_error, true);
    assert.equal(e.controls.get("VBtn").at(-1).disabled, true);
    assert.equal(document.querySelector(".b-shop-add__fee-amount"), null);
    s.addShop();
    assert.equal(e.requests.length, 1);
    assert.equal(e.requests[0].method, "GET");
  }
});

test("re-entering Store name disables stale pricing and requests the latest fee", async () => {
  const e = environment(), s = e.state;
  Object.assign(s, { title: "Fixture Studio", name: "fixture-studio" });
  await paidSelection(e, eurWallet, 22.5);
  s.goTo(1);
  await loadQuote(e, feeQuote(22.5, "EUR", "additional_shop", eurWallet));
  s.goTo(0);
  s.goTo(1);
  assert.equal(s.creation_fee.fee, 22.5);
  assert.equal(s.busy_creation_fee, true);
  assert.equal(s.can_create_with_fee, false);
  const beforePost = e.requests.length;
  s.addShop();
  assert.equal(e.requests.length, beforePost);
  assert.deepEqual(plain(e.requests.at(-1).payload), { params: { account_number: eurWallet.account_number } });
  await loadQuote(e, feeQuote(23, "EUR", "additional_shop", eurWallet));
  await e.renderForm();
  assert.equal(e.controls.get("UPrice")[0].amount, 23);
  assert.equal(e.controls.get("UPrice")[0].currency, "EUR");
});

test("late quote successes and failures after unmount cannot alter the discarded draft", async () => {
  for (const failure of [false, true]) {
    const e = environment(), s = e.state;
    const pending = pendingRequest(e, auditUrl);
    e.unmount();
    if (failure) pending.reject(new Error("Fixture late response"));
    else pending.resolve(feeQuote(25));
    await settled();
    assert.equal(s.creation_fee, null);
    assert.equal(s.creation_fee_error, false);
    assert.equal(e.events.length, 0);
  }
});

test("non-Guided modern settings retain all five tabs and existing fields/upload components", async () => {
  const shop = { id: 41, title: "Fixture Studio", name: "fixture-studio", language: "fa",
    active: true, description: "Fixture description", icon: "fixture-logo.png", info: { phone: "+1 202 555 0142" } };
  const e = environment({ guided: false, shop }), s = e.state;
  let document = await e.renderForm();
  assert.equal(document.querySelector(".b-shop-add__steps"), null);
  assert.equal(e.controls.get("VTab").length, 5);
  assert.equal(e.controls.get("ULanguageInput")[0].modelValue, "fa");
  assert.equal(e.controls.get("USmartSwitch")[0].modelValue, true);
  s.step = 2;
  await e.renderForm();
  assert.equal(e.controls.get("VTextarea")[0].modelValue, shop.description);
  s.step = 3;
  s.readOnly = true;
  await e.renderForm();
  assert.equal(e.controls.get("SCountrySelect").length, 1);
  assert.equal(e.controls.get("VTextField").length, 5);
  assert.ok(e.controls.get("VTextField").every((field) => field.disabled));
  assert.equal(e.controls.get("VTextarea")[0].counter, 600);
  s.step = 4;
  await e.renderForm();
  assert.equal(e.controls.get("SImageUploader").length, 2);
  assert.deepEqual(e.controls.get("SImageUploader").map((input) => input.server),
    ["/isolated-api/shops/41/logo", "/isolated-api/shops/41/favicon"]);
  assert.ok(e.controls.get("SImageUploader").every((input) => input.disabled));
  const legacy = environment({ guided: false, modern: false });
  await legacy.renderForm();
  assert.equal(legacy.controls.get("UProgressStepper").length, 1);
  assert.equal(legacy.controls.get("UTabsRounded")[0].tabs.length, 5);
  for (const current of [e, legacy, environment({ guided: false })]) {
    current.state.goTo(1);
    await current.state.getCreationFee();
    assert.equal(current.requests.some((request) => request.url === "/isolated-api/shop/audit"), false);
  }
  const guidedEdit = environment({ shop });
  guidedEdit.state.goTo(1);
  await guidedEdit.state.getCreationFee();
  document = await guidedEdit.renderForm();
  assert.equal(document.querySelector(".b-shop-add__fee"), null);
  assert.equal(guidedEdit.requests.some((request) => request.url === "/isolated-api/shop/audit"), false);
  Object.assign(legacy.state, { title: "Fixture Studio", name: "fixture-studio", language: "en", step: 1 });
  legacy.state.addShop();
  const legacyPost = legacy.requests.find((request) => request.method === "POST");
  assert.deepEqual(plain(legacyPost.payload), {
    title: "Fixture Studio", name: "fixture-studio", language: "en",
    description: "", active: true, info: {},
  });
});
