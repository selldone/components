import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("./SStorefrontMasterPaymentDialog.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const { outputText } = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: false },
});

async function buyBasket(data, user = null, gateway = "dir_usd") {
  const history = [];
  const completed = [];
  const redirects = [];
  const errorAlerts = [];
  const notification = {
    showSuccessAlert() {},
    showErrorAlert: (_title, message) => errorAlerts.push(message),
    showLaravelError: (error) => errorAlerts.push(error),
  };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports,
    require(name) {
      if (name.includes("NotificationService")) return { default: notification };
      if (name.includes("StorefrontLocalStorages")) {
        return {
          StorefrontLocalStorages: {
            GetShopGuestCode: () => "active-basket-code",
            AddCurrentGuestCodeToHistory: (...args) => history.push(args),
          },
        };
      }
      if (name.includes("BasketHelper")) {
        return { BasketHelper: { IsServiceAndNeedPricing: () => false } };
      }
      return { default: {} };
    },
    window: { XAPI: { POST_BUY_BASKET: () => "/checkout" } },
    axios: {
      async post(_url, payload) {
        assert.equal(payload.code, user ? undefined : "active-basket-code");
        return { data };
      },
    },
  });

  const dialog = {
    $shop: { name: "example-shop" },
    $t: (key) => key,
    type: data.order_type,
    order: { id: 21 },
    bill: { order_id: 21, delivery_price: 0 },
    currency: { code: "USD" },
    USER: () => user,
    GetCurrentShopUrl: () => "https://shop.example.test",
    $nextTick: (callback) => queueMicrotask(callback),
    $refs: {
      form_payment_internal: { submit: () => redirects.push([...history]) },
    },
    fillPaymentForm: exports.default.methods.fillPaymentForm,
    delayedHide() {},
    onFinishPayment(result) {
      completed.push({ result, history: [...history] });
    },
  };
  exports.default.methods.buyBasketProduct.call(dialog, gateway, 10);
  await new Promise(setImmediate);
  assert.equal(dialog.busy_buy, false);
  return { history, completed, redirects, errorAlerts };
}

test("saves the submitted guest order code before Bank Transfer completes", async () => {
  for (const type of ["VIRTUAL", "SERVICE"]) {
    const response = { dir: true, basket_id: 21, order_type: type, code: "submitted-order-code" };
    const { completed, errorAlerts } = await buyBasket(response);
    assert.deepEqual(errorAlerts, []);
    assert.deepEqual(completed, [{ result: response, history: [[type, 21, response.code]] }]);
  }
});

test("keeps guest order access before redirecting to the hosted payment page", async () => {
  const response = {
    method: "GET", link: "https://payment.example.test/invoice",
    basket_id: 21, order_type: "VIRTUAL", code: "submitted-order-code",
  };
  const { redirects, errorAlerts } = await buyBasket(response, null, "xendit_php");
  assert.deepEqual(errorAlerts, []);
  assert.deepEqual(redirects, [[["VIRTUAL", 21, response.code]]]);
});

test("keeps authenticated and failed checkouts out of guest order history", async () => {
  const response = { dir: true, basket_id: 21, order_type: "VIRTUAL", code: "submitted-order-code" };
  const authenticated = await buyBasket(response, { id: 7 });
  assert.deepEqual(authenticated.history, []);
  assert.deepEqual(authenticated.errorAlerts, []);
  assert.equal(authenticated.completed.length, 1);

  const rejected = await buyBasket({ ...response, error: true, error_msg: "Checkout rejected" });
  assert.deepEqual(rejected.history, []);
  assert.deepEqual(rejected.completed, []);
  assert.deepEqual(rejected.errorAlerts, ["Checkout rejected"]);
});
