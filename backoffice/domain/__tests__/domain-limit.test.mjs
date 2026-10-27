import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";

function loadModule(path, globals = {}) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const script = path.endsWith(".vue")
    ? parse(source).descriptor.script.content
    : source;
  const exports = {};
  const require = (name) => {
    if (name.includes("/ShopLicense")) return license;
    if (name === "lodash-es") return { throttle: (callback) => callback };
    return { default: {} };
  };
  new Function(
    "require",
    "exports",
    ...Object.keys(globals),
    ts.transpileModule(script, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
  )(require, exports, ...Object.values(globals));
  return exports;
}

const license = loadModule("../../../../core-js/enums/shop/ShopLicense.ts");
const { Eligible } = license;
const add = loadModule("../add/BDomainAdd.vue").default;

function shop(count = 1, override) {
  return {
    license: "COMPANY",
    domains: Array.from({ length: count }, (_, id) => ({ id: id + 1 })),
    ...(override !== undefined && {
      agency_client: { agency: {}, plan: { domains: override } },
    }),
  };
}

test("a refreshed domain list releases stale COMPANY domain slots", async () => {
  const domains = [{ id: 1, domain: "example.test" }];
  const list = loadModule("../list/BDomainsList.vue", {
    window: { API: { GET_SHOP_DOMAINS: () => "/test/domains" } },
    axios: { get: async () => ({ data: { domains, total: 1 } }) },
  }).default;
  const state = {
    ...list.data(),
    shop: shop(5),
    $route: { params: { shop_id: 1 } },
    show_subdomains: true,
  };
  assert.equal(add.computed.can_add_new_domain.call(state), false);
  list.methods.fetchDomains.call(state, 1);
  await setImmediate();

  assert.equal(state.domains.length, 1);
  assert.equal(state.totalItems, 3); // Two hosted preview URLs do not consume custom-domain slots.
  assert.equal(add.computed.can_add_new_domain.call(state), true);
});

test("filtered and incomplete pages cannot replace the shop's domain quota snapshot", async () => {
  for (const [page, search, total] of [
    [1, "example", 1],
    [2, null, 1],
    [1, null, 11],
  ]) {
    let respond;
    const list = loadModule("../list/BDomainsList.vue", {
      window: { API: { GET_SHOP_DOMAINS: () => "/test/domains" } },
      axios: {
        get: () =>
          new Promise((resolve) => {
            respond = resolve;
          }),
      },
    }).default;
    const state = {
      ...list.data(),
      shop: shop(5),
      $route: { params: { shop_id: 1 } },
      show_subdomains: false,
      search,
    };
    list.methods.fetchDomains.call(state, page);
    state.search = null;
    respond({ data: { domains: [{ id: 1 }], total } });
    await setImmediate();

    assert.equal(state.shop.domains.length, 5);
    assert.equal(add.computed.can_add_new_domain.call(state), false);
  }
});

test("refreshing domains preserves the shop snapshot's primary and active priority", async () => {
  const domains = Array.from({ length: 6 }, (_, index) => ({
    id: index + 1,
    primary: index === 5,
    enable: index >= 3,
    approved: index === 4,
  }));
  const list = loadModule("../list/BDomainsList.vue", {
    window: { API: { GET_SHOP_DOMAINS: () => "/test/domains" } },
    axios: { get: async () => ({ data: { domains, total: domains.length } }) },
  }).default;
  const state = {
    ...list.data(),
    shop: { ...shop(), domains: [domains[5], ...domains.slice(0, 5)] },
    $route: { params: { shop_id: 1 } },
    show_subdomains: true,
  };
  list.methods.fetchDomains.call(state, 1);
  await setImmediate();

  assert.deepEqual(
    state.shop.domains.map(({ id }) => id),
    [6, 5, 4, 1, 2, 3],
  );
  assert.equal(Eligible.CanEditDomain(state.shop, 6), true);
  assert.deepEqual(
    state.domains.map(({ id }) => id),
    [1, 2, 3, 4, 5, 6],
  );
});

test("COMPANY permits four domains and blocks a sixth", () => {
  assert.equal(Eligible.CanAddNewDomain(shop(1)), true);
  assert.equal(Eligible.CanAddNewDomain(shop(4)), true);
  assert.equal(Eligible.CanAddNewDomain(shop(5)), false);
});

test("zero agency overrides preserve the license limit, including numeric strings", () => {
  for (const override of [null, 0, "0"]) {
    const current = shop(1, override);
    assert.equal(Eligible.DomainsLimit(current), 5);
    assert.equal(add.computed.can_add_new_domain.call({ shop: current }), true);
    assert.equal(Eligible.CanEditDomain(current, 1), true);
  }
});

test("real agency domain limits remain enforced", () => {
  assert.equal(Eligible.CanAddNewDomain(shop(1, 1)), false);
  assert.equal(Eligible.CanAddNewDomain(shop(1, "1")), false);
  assert.equal(Eligible.CanAddNewDomain(shop(4, "5")), true);
  assert.equal(Eligible.CanAddNewDomain(shop(5, "5")), false);
});
