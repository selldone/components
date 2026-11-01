import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const root = new URL("../../../../../../", import.meta.url);
const modules = new Map();
function load(url) {
  if (modules.has(url.href)) return modules.get(url.href);
  if (/\.(svg|png|webp)$/.test(url.pathname)) return { default: url.pathname };
  const exports = {};
  modules.set(url.href, exports);
  const compiled = ts.transpileModule(readFileSync(url, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  vm.runInNewContext(
    compiled.outputText,
    {
      exports,
      window: {},
      require(name) {
        assert.ok(
          name.startsWith(".") || name.startsWith("@selldone/core-js/"),
          `Unexpected dependency: ${name}`,
        );
        const dependency = name.startsWith("@selldone/core-js/")
          ? new URL(name, root)
          : new URL(name, url);
        if (!/\.(ts|svg|png|webp)$/.test(dependency.pathname))
          dependency.pathname += ".ts";
        return load(dependency);
      },
    },
    { filename: url.pathname },
  );
  return exports;
}

// Resolve the actual helper, existing Caution factory and canonical provider lists.
// Only bitmap/vector imports are replaced; no production helper is injected by the test.
const { getTechnicalCautions } = load(
  new URL("./technicalHealthChecks.ts", import.meta.url),
);
const { EmailProviders } = load(
  new URL("@selldone/core-js/enums/email/EmailProviders.ts", root),
);
const { SmsProviders } = load(
  new URL("@selldone/core-js/enums/sms/SmsProviders.ts", root),
);
const dictionaries = Object.fromEntries(
  ["en", "fa"].map((locale) => [
    locale,
    load(new URL(`@selldone/translate/dashboard/${locale}.ts`, root)).default,
  ]),
);
const translate =
  (locale) =>
  (key, params = {}) => {
    const value = key
      .split(".")
      .reduce((current, part) => current?.[part], dictionaries[locale]);
    assert.equal(
      typeof value,
      "string",
      `Localized health copy: ${locale}/${key}`,
    );
    return value.replace(/\{(\w+)\}/g, (_, name) => {
      assert.ok(
        Object.hasOwn(params, name),
        `Missing interpolation: ${key}/${name}`,
      );
      return params[name];
    });
  };
const plain = (value) => JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};
const shop = (fields = {}) => ({
  id: 326,
  active: true,
  sample: false,
  currencies: ["USD"],
  shop_gateways: [],
  domains: [],
  sub: null,
  mail_service: null,
  sms_service: null,
  ...fields,
});
const domain = (fields = {}) => ({
  id: 51,
  domain: "shop.example.test",
  primary: true,
  enable: true,
  approved: true,
  error: null,
  ...fields,
});
const gateway = (fields = {}, definition = {}) => ({
  id: 71,
  enable: true,
  livemode: true,
  gateway: {
    id: 901,
    code: "TEST.USD",
    name: "Fixture payment method",
    enable: true,
    currency: "USD",
    cash: false,
    cod: false,
    dir: false,
    ...definition,
  },
  ...fields,
});
const service = (driver, fields = {}) => ({
  id: 81,
  driver,
  enable: true,
  errors: 100,
  error: "private-provider-error-must-stay-hidden",
  token: "fixture-credential-must-stay-hidden",
  ...fields,
});
const checks = (fields = {}, locale = "en") =>
  getTechnicalCautions(shop(fields), translate(locale));
const key = (code) => `${code}:shop:326`;
const byCode = (items, code) =>
  items.filter((item) => item.diagnosticKey.startsWith(code + ":"));
const keys = (items) => plain(items.map((item) => item.diagnosticKey));

test("seven localized checks retain existing caution shape, exact native shop routes and immutable source", () => {
  const input = freeze(
    shop({
      active: false,
      sub: domain({ id: 1, enable: false }),
      domains: [domain({ error: "private-domain-error-must-stay-hidden" })],
      shop_gateways: [gateway({}, { enable: false })],
      mail_service: service(EmailProviders[0].driver),
      sms_service: service(
        SmsProviders.find((item) => item.driver !== "default").driver,
      ),
    }),
  );
  const before = JSON.stringify(input);
  const routes = {
    inactive: { name: "BPageShopSettingInfo", params: { shop_id: 326 } },
    primary_disabled: {
      name: "BPageShopSettingDomain",
      params: { shop_id: 326 },
    },
    domain_error: {
      name: "BPageDomainOverview",
      params: { shop_id: 326, domain_key: "51" },
    },
    payment_disabled: {
      name: "BPageShopFinanceGateways",
      params: { shop_id: 326 },
    },
    test_payments: {
      name: "BPageShopFinanceGateways",
      params: { shop_id: 326 },
    },
    email_errors: { name: "BPageShopSettingEmail", params: { shop_id: 326 } },
    sms_errors: { name: "BPageShopSettingSms", params: { shop_id: 326 } },
  };
  for (const locale of ["en", "fa"]) {
    const observed = [
      ...getTechnicalCautions(input, translate(locale)),
      ...checks({ shop_gateways: [gateway({ livemode: false })] }, locale),
    ];
    assert.equal(observed.length, 7);
    for (const [code, to] of Object.entries(routes)) {
      const [item] = byCode(observed, code);
      assert.ok(item, `Expected check: ${code}`);
      assert.equal(item.type, "warning");
      assert.equal(item.score, null);
      assert.equal(typeof item.title, "string");
      assert.equal(typeof item.message, "string");
      assert.equal(typeof item.action, "string");
      assert.ok(item.title.length && item.message.length && item.action.length);
      assert.deepEqual(plain(item.to), to);
      assert.equal(JSON.stringify(item).includes("must-stay-hidden"), false);
    }
  }
  assert.equal(JSON.stringify(input), before);
});

test("unloaded, malformed, sample and unknown states create no invented problems", () => {
  for (const input of [
    null,
    undefined,
    false,
    0,
    "shop",
    [],
    {},
    { id: null },
    { id: 0 },
    { id: -1 },
  ])
    assert.deepEqual(plain(getTechnicalCautions(input, translate("en"))), []);
  for (const sample of [
    shop({ sample: true, active: false }),
    shop({ sample: true, mail_service: service("mailgun") }),
  ])
    assert.deepEqual(plain(getTechnicalCautions(sample, translate("en"))), []);
  for (const value of [undefined, null, true, 0, 1, "false", "true", [], {}])
    assert.equal(byCode(checks({ active: value }), "inactive").length, 0);
  assert.deepEqual(plain(checks()), []);
  for (const value of [
    null,
    undefined,
    {},
    "missing",
    [null, false, 4, "bad", [], {}],
  ]) {
    assert.doesNotThrow(() => checks({ domains: value, shop_gateways: value }));
    assert.deepEqual(
      plain(checks({ domains: value, shop_gateways: value })),
      [],
    );
  }
});

test("primary disabled checks use explicit primary/disabled flags and aggregate sub/custom records", () => {
  assert.deepEqual(keys(checks({ sub: domain({ enable: false }) })), [
    key("primary_disabled"),
  ]);
  assert.deepEqual(
    keys(
      checks({
        domains: [domain({ enable: false }), domain({ id: 52, enable: false })],
      }),
    ),
    [key("primary_disabled")],
  );
  assert.deepEqual(
    keys(
      checks({
        sub: domain({ enable: false }),
        domains: [domain({ enable: false })],
      }),
    ),
    [key("primary_disabled")],
  );
  for (const primary of [undefined, null, false, 1, "true"])
    assert.equal(
      byCode(
        checks({ domains: [domain({ primary, enable: false })] }),
        "primary_disabled",
      ).length,
      0,
    );
  for (const enable of [undefined, null, true, 0, "false"])
    assert.equal(
      byCode(checks({ sub: domain({ enable }) }), "primary_disabled").length,
      0,
    );
  assert.equal(
    byCode(
      checks({ domains: [domain({ primary: false, enable: false })] }),
      "primary_disabled",
    ).length,
    0,
  );
});

test("domain errors require a loaded approved enabled primary and disclose only its domain name", () => {
  const input = {
    domains: [domain({ error: "private-domain-error-must-stay-hidden" })],
  };
  const [item] = checks(input);
  assert.equal(item.diagnosticKey, "domain_error:domain:51");
  assert.ok(item.message.includes("shop.example.test"));
  for (const field of ["primary", "enable", "approved"])
    for (const value of [undefined, null, false, 1, "true"])
      assert.equal(
        byCode(
          checks({
            domains: [domain({ error: "recorded error", [field]: value })],
          }),
          "domain_error",
        ).length,
        0,
      );
  for (const value of [undefined, null, "", "  ", false, 1, [], {}])
    assert.equal(
      byCode(checks({ domains: [domain({ error: value })] }), "domain_error")
        .length,
      0,
    );
  for (const fields of [
    { id: null },
    { id: 0 },
    { id: -1 },
    { id: "bad" },
    { domain: null },
    { domain: "  " },
  ])
    assert.equal(
      byCode(
        checks({ domains: [domain({ error: "recorded error", ...fields })] }),
        "domain_error",
      ).length,
      0,
    );
  const tenSecondaries = Array.from({ length: 10 }, (_, index) =>
    domain({ id: index + 1, primary: false, error: "recorded error" }),
  );
  assert.deepEqual(
    plain(checks({ domains: tenSecondaries, domain: "external.example.test" })),
    [],
  );
});

test("enabled payment methods with a known global disabled flag warn without inventing a checkout outage", () => {
  assert.deepEqual(
    keys(
      checks({
        shop_gateways: [
          gateway({}, { enable: false }),
          gateway({ id: 72 }, { enable: false }),
        ],
      }),
    ),
    [key("payment_disabled")],
  );
  for (const value of [undefined, null, false, 0, 1, "true"])
    assert.equal(
      byCode(
        checks({
          shop_gateways: [gateway({ enable: value }, { enable: false })],
        }),
        "payment_disabled",
      ).length,
      0,
    );
  for (const value of [undefined, null, true, 0, "false"])
    assert.equal(
      byCode(
        checks({ shop_gateways: [gateway({}, { enable: value })] }),
        "payment_disabled",
      ).length,
      0,
    );
  for (const cash of [true, undefined, null, 0, "false"])
    assert.equal(
      byCode(
        checks({ shop_gateways: [gateway({}, { enable: false, cash })] }),
        "payment_disabled",
      ).length,
      0,
    );
  for (const flag of ["cod", "dir"])
    for (const value of [true, false, undefined, null, 0, "false", [], {}])
      assert.equal(
        byCode(
          checks({
            shop_gateways: [gateway({}, { enable: false, [flag]: value })],
          }),
          "payment_disabled",
        ).length,
        1,
        "A disabled global method is unavailable regardless of COD/direct metadata",
      );
  for (const currencies of [null, undefined, [], {}, ["EUR"], ["UNKNOWN"]])
    assert.equal(
      byCode(
        checks({ currencies, shop_gateways: [gateway({}, { enable: false })] }),
        "payment_disabled",
      ).length,
      0,
    );
  assert.equal(
    byCode(
      checks({
        currencies: ["UNKNOWN"],
        shop_gateways: [gateway({}, { enable: false, currency: "UNKNOWN" })],
      }),
      "payment_disabled",
    ).length,
    0,
  );
  assert.deepEqual(
    plain(checks({ shop_gateways: [], currencies: ["USD"] })),
    [],
    "Free/gift/catalog-only shops do not acquire a blanket no-payment warning",
  );
  assert.deepEqual(
    plain(
      checks({ shop_gateways: [gateway({ livemode: false }, { cod: true })] }),
    ),
    [],
  );
  assert.deepEqual(
    plain(
      checks({ shop_gateways: [gateway({ livemode: false }, { dir: true })] }),
    ),
    [],
  );
});

test("saved test-mode warnings require an active non-sample shop, enabled automatic gateway and current known currency", () => {
  assert.deepEqual(
    keys(
      checks({
        shop_gateways: [
          gateway({ livemode: false }),
          gateway({ id: 72, livemode: false }),
        ],
      }),
    ),
    [key("test_payments")],
  );
  for (const active of [undefined, null, false, 0, 1, "true"])
    assert.equal(
      byCode(
        checks({ active, shop_gateways: [gateway({ livemode: false })] }),
        "test_payments",
      ).length,
      0,
    );
  for (const livemode of [undefined, null, true, 0, "false"])
    assert.equal(
      byCode(
        checks({ shop_gateways: [gateway({ livemode })] }),
        "test_payments",
      ).length,
      0,
    );
  for (const flag of ["enable", "cash", "cod", "dir"])
    for (const value of flag === "enable"
      ? [undefined, null, false, 1, "true"]
      : [true, undefined, null, 0, "false"])
      assert.equal(
        byCode(
          checks({
            shop_gateways: [gateway({ livemode: false }, { [flag]: value })],
          }),
          "test_payments",
        ).length,
        0,
      );
  for (const currencies of [null, undefined, [], {}, ["EUR"], ["UNKNOWN"]])
    assert.equal(
      byCode(
        checks({ currencies, shop_gateways: [gateway({ livemode: false })] }),
        "test_payments",
      ).length,
      0,
    );
  assert.equal(
    byCode(
      checks({
        currencies: ["UNKNOWN"],
        shop_gateways: [gateway({ livemode: false }, { currency: "UNKNOWN" })],
      }),
      "test_payments",
    ).length,
    0,
  );
  assert.equal(
    byCode(
      checks({
        shop_gateways: [gateway({ livemode: false }, { currency: null })],
      }),
      "test_payments",
    ).length,
    0,
  );
});

test("email and SMS recorded error warnings use real custom providers and the exact integer 100 boundary", () => {
  for (const [field, code, providers] of [
    ["mail_service", "email_errors", EmailProviders],
    [
      "sms_service",
      "sms_errors",
      SmsProviders.filter((item) => item.driver !== "default"),
    ],
  ]) {
    for (const provider of providers) {
      for (const errors of [100, 101, "100", "101", "100.0", " 100 "])
        assert.equal(
          byCode(
            checks({ [field]: service(provider.driver, { errors }) }),
            code,
          ).length,
          1,
          `${code}/${provider.driver}/${errors}`,
        );
    }
    const driver = providers[0].driver;
    for (const errors of [
      undefined,
      null,
      "",
      " ",
      0,
      99,
      "99",
      -1,
      100.5,
      "100.5",
      NaN,
      Infinity,
      "Infinity",
      [],
      [100],
      {},
      true,
    ])
      assert.equal(
        byCode(checks({ [field]: service(driver, { errors }) }), code).length,
        0,
        `${code}: ignore unknown/noninteger counter ${String(errors)}`,
      );
    for (const enable of [undefined, null, false, 0, 1, "true"])
      assert.equal(
        byCode(checks({ [field]: service(driver, { enable }) }), code).length,
        0,
      );
    for (const driver of [undefined, null, "", "default", "unknown-provider"])
      assert.equal(
        byCode(checks({ [field]: service(driver) }), code).length,
        0,
      );
    for (const invalid of [null, undefined, [], "custom", false, {}])
      assert.equal(byCode(checks({ [field]: invalid }), code).length, 0);
  }
});

test("dismissal identities survive changing counters/rawerrors and remain distinct between resources", () => {
  for (const [field, code, driver] of [
    ["mail_service", "email_errors", EmailProviders[0].driver],
    [
      "sms_service",
      "sms_errors",
      SmsProviders.find((item) => item.driver !== "default").driver,
    ],
  ]) {
    const first = checks({ [field]: service(driver) })[0];
    const changed = checks({
      [field]: service(driver, { errors: 301, error: "changed private error" }),
    })[0];
    assert.equal(first.diagnosticKey, changed.diagnosticKey);
    assert.notEqual(
      first.diagnosticKey,
      checks({ [field]: service(driver, { id: 82 }) })[0].diagnosticKey,
    );
    assert.ok(first.diagnosticKey.startsWith(code + ":"));
  }
  const first = checks({
    domains: [domain({ error: "first private error" })],
  })[0];
  const changed = checks({
    domains: [domain({ error: "later private error" })],
  })[0];
  assert.equal(first.diagnosticKey, changed.diagnosticKey);
});
