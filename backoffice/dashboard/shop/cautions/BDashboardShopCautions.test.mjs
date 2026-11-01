import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import { JSDOM } from "jsdom";
import ts from "typescript";

const browser = new JSDOM(
  "<!doctype html><html><head></head><body></body></html>",
);
for (const key of [
  "window",
  "document",
  "Element",
  "SVGElement",
  "HTMLElement",
  "Node",
])
  globalThis[key] = browser.window[key];
const Vue = await import("vue");
const root = new URL("../../../../../../", import.meta.url);
const read = (file) => readFileSync(new URL(file, root), "utf8");
function evaluate(
  source,
  require = () => assert.fail("Unexpected dependency"),
) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports, require, window, console },
  );
  return exports;
}
const { ShopCautionHelper } = evaluate(
  read("@selldone/core-js/helper/shop/ShopCautionHelper.ts"),
);
const asset = (name) => {
  assert.match(name, /\.(svg|png)$/);
  return { default: name };
};
const { Currency } = evaluate(
  read("@selldone/core-js/enums/payment/Currency.ts"),
  asset,
);
const { EmailProviders } = evaluate(
  read("@selldone/core-js/enums/email/EmailProviders.ts"),
  asset,
);
const { SmsProviders } = evaluate(
  read("@selldone/core-js/enums/sms/SmsProviders.ts"),
  asset,
);
const { getTechnicalCautions } = evaluate(
  read(
    "@selldone/components-vue/backoffice/dashboard/shop/cautions/technicalHealthChecks.ts",
  ),
  (name) => {
    if (name.endsWith("/Currency")) return { Currency };
    if (name.endsWith("/EmailProviders")) return { EmailProviders };
    if (name.endsWith("/SmsProviders")) return { SmsProviders };
    assert.equal(name, "@selldone/core-js/helper/shop/ShopCautionHelper");
    return { ShopCautionHelper };
  },
);
function compile(file, require) {
  const { descriptor, errors } = parse(read(file));
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "health-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: "health-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  return {
    component: {
      ...evaluate(descriptor.script.content, require).default,
      render: evaluate(template.code, (name) => {
        assert.equal(name, "vue");
        return Vue;
      }).render,
    },
    descriptor,
  };
}
const legacy = compile(
  "@selldone/components-vue/backoffice/alert/cation/BAlertCation.vue",
  (name) => {
    assert.ok(name.endsWith("/UChartRadialBar.vue"));
    return { default: { render: () => null } };
  },
).component;
const { component, descriptor } = compile(
  "@selldone/components-vue/backoffice/dashboard/shop/cautions/BDashboardShopCautions.vue",
  (name) => {
    if (name === "vue") return Vue;
    if (name.endsWith("/BAlertCation.vue")) return { default: legacy };
    if (name === "./technicalHealthChecks") return { getTechnicalCautions };
    assert.equal(name, "@selldone/core-js/helper/shop/ShopCautionHelper");
    return { ShopCautionHelper };
  },
);
const styles = await compileStyleAsync({
  source: descriptor.styles[0].content,
  filename: "BDashboardShopCautions.vue",
  id: "health-test",
  preprocessLang: "scss",
});
assert.deepEqual(styles.errors, []);
const dictionaries = Object.fromEntries(
  ["en", "fa"].map((locale) => [
    locale,
    {
      ...evaluate(read(`@selldone/translate/dashboard/${locale}.ts`)).default,
      global: evaluate(read(`@selldone/translate/global/${locale}.ts`), () => ({
        default: {},
      })).default,
      icons: evaluate(
        read(
          `@selldone/translate/global/icons/${locale === "fa" ? "rtl" : "ltr"}.ts`,
        ),
      ).default,
    },
  ]),
);
const translate = (locale, key, params = {}) => {
  const value = key
    .split(".")
    .reduce((part, name) => part?.[name], dictionaries[locale]);
  assert.equal(
    typeof value,
    "string",
    `Localized health copy: ${locale}/${key}`,
  );
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name]);
};
const plain = (value) => JSON.parse(JSON.stringify(value));
const readyShop = (id = 1) => ({
  id,
  info: { location: { lat: 1, lng: 2 }, days_open: [1], time_open: "09:00" },
  description: "A local test shop",
  icon: "test-shop.webp",
  shop_gateways: [{ gateway: { currency: "USD" } }],
  accounts: [{ currency: "USD" }],
  currencies: ["USD"],
  socials: [{}],
  clubs: [{}],
  sub: { primary: true },
  domains: [{ domain: "shop.example.test", approved: true, primary: true }],
});
const emptyShop = (id = 1) => ({
  id,
  info: {},
  currencies: [],
  shop_gateways: [],
  accounts: [],
  domains: [],
  socials: [],
  clubs: [],
  sub: {},
});
async function fixture({
  shop = emptyShop(),
  modern = true,
  locale = "en",
} = {}) {
  window.$i18n_global = { t: (key, params) => translate(locale, key, params) };
  const props = Vue.shallowReactive({ shop, modern });
  const app = Vue.createApp({ render: () => Vue.h(component, props) });
  const warnings = [];
  app.config.warnHandler = (message) => {
    // Exercise invalid upstream readiness without masking render/helper errors.
    if (
      props.shop === null &&
      message.startsWith('Invalid prop: type check failed for prop "shop".')
    ) {
      warnings.push(message);
      return;
    }
    throw new Error(message);
  };
  app.config.errorHandler = (error) => {
    throw error;
  };
  Object.assign(app.config.globalProperties, {
    $t: (key, params) => translate(locale, key, params),
    $vuetify: { locale: { isRtl: locale === "fa" } },
  });
  const wrapper = {
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("div", attrs, slots.default?.()),
  };
  for (const name of ["v-icon", "v-sheet", "v-expand-transition"])
    app.component(name, wrapper);
  app.component("v-btn", {
    inheritAttrs: false,
    props: ["to", "disabled"],
    setup:
      (props, { attrs, slots }) =>
      () =>
        Vue.h(
          props.to ? "a" : "button",
          {
            ...attrs,
            disabled: props.disabled,
            ...(props.to
              ? {
                  href: `/native/${props.to.name}`,
                  "data-route": JSON.stringify(props.to),
                }
              : {}),
          },
          slots.default?.(),
        ),
  });
  app.component("v-tooltip", {
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("span", { role: "tooltip", ...attrs }, slots.default?.()),
  });
  const host = document.createElement("div");
  host.dir = locale === "fa" ? "rtl" : "ltr";
  document.body.append(host);
  app.mount(host);
  await Vue.nextTick();
  return {
    host,
    props,
    warnings,
    rows: () => [
      ...host.querySelectorAll(".s--shop-dashboard-cations-modern__row"),
    ],
    async update(shop) {
      props.shop = shop;
      await Vue.nextTick();
    },
    async dismiss(index = 0) {
      this.rows()[index].querySelector("button").click();
      await Vue.nextTick();
    },
    unmount() {
      app.unmount();
      host.remove();
    },
  };
}

test("actual helper priorities and the three-reminder cap survive all native caution types", async () => {
  const shops = [
    emptyShop(),
    { ...readyShop(), accounts: [], currencies: [] },
    { ...readyShop(), domains: [], sub: {} },
    {
      ...readyShop(),
      domains: [
        { domain: "pending.example.test", approved: false, primary: true },
      ],
    },
    {
      ...readyShop(),
      info: {},
      description: null,
      icon: null,
      socials: [],
      clubs: [],
    },
  ];
  for (const locale of ["en", "fa"])
    for (const shop of shops) {
      const before = plain(shop);
      const f = await fixture({ shop, locale });
      try {
        const expected = ShopCautionHelper.Generate(shop).slice(0, 3);
        assert.equal(f.rows().length, expected.length);
        assert.deepEqual(
          f.rows().map((row) => row.querySelector("h3").textContent),
          plain(expected.map((item) => item.title)),
        );
        expected.forEach((item, index) => {
          const row = f.rows()[index];
          assert.equal(
            row.getAttribute("aria-label"),
            `${translate(locale, "global.commons." + item.type)} · ${item.title}`,
          );
          if (item.type !== "info")
            assert.ok(
              row.querySelector(`.sd-modern-status__dot--${item.type}`),
            );
          for (const message of Array.isArray(item.message)
            ? item.message
            : [item.message])
            assert.ok(row.textContent.includes(message));
          const link = row.querySelector("a");
          if (item.to) {
            assert.deepEqual(
              JSON.parse(link.getAttribute("data-route")),
              plain(item.to),
            );
            assert.ok(link.textContent.includes(item.action));
          } else assert.equal(link, null);
        });
        assert.deepEqual(plain(shop), before);
      } finally {
        f.unmount();
      }
    }
});

test("profile checklist is natively collapsed with every source message, native action and explicit profile score", async () => {
  const shop = {
    ...readyShop(),
    info: {},
    description: null,
    socials: [],
    clubs: [],
  };
  for (const locale of ["en", "fa"]) {
    const f = await fixture({ shop, locale });
    try {
      const [item] = ShopCautionHelper.Generate(shop);
      const details = f.host.querySelector("details");
      assert.equal(details.open, false);
      assert.ok(
        details
          .querySelector("summary")
          .textContent.includes(
            translate(
              locale,
              "admin_shop.dashboard.technical.health_checklist",
              { count: item.message.length },
            ),
          ),
      );
      assert.ok(
        details
          .querySelector("summary")
          .textContent.includes(
            translate(
              locale,
              "admin_shop.dashboard.technical.profile_completion",
              { score: item.score },
            ),
          ),
      );
      details.querySelector("summary").click();
      assert.equal(details.open, true);
      assert.deepEqual(
        [...details.querySelectorAll(":scope > ul > li > span")].map(
          (node) => node.textContent,
        ),
        plain(item.message),
      );
      assert.equal(
        details.querySelector("a").getAttribute("href"),
        "/native/BPageShopSettingInfo",
      );
    } finally {
      f.unmount();
    }
  }
});

test("dismissal promotes the next real priority, is stable across same-shop refresh and resets on shop/null context changes", async () => {
  const shop = emptyShop();
  const f = await fixture({ shop });
  try {
    const original = ShopCautionHelper.Generate(shop);
    const before = plain(shop);
    const firstLabel = translate(
      "en",
      "admin_shop.dashboard.technical.dismiss_reminder",
      { title: original[0].title },
    );
    assert.equal(
      f.rows()[0].querySelector("button").getAttribute("aria-label"),
      firstLabel,
    );
    assert.equal(
      f.rows()[0].querySelector('[role="tooltip"]').textContent,
      firstLabel,
    );
    await f.dismiss();
    assert.equal(f.rows().length, 3);
    assert.deepEqual(
      f.rows().map((row) => row.querySelector("h3").textContent),
      plain(original.slice(1, 4).map((item) => item.title)),
    );
    await f.update(plain(shop));
    assert.equal(
      f.rows()[0].querySelector("h3").textContent,
      original[1].title,
    );
    await f.update(emptyShop(2));
    assert.equal(
      f.rows()[0].querySelector("h3").textContent,
      original[0].title,
    );
    for (let remaining = original.length; remaining > 0; remaining--)
      await f.dismiss();
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    assert.deepEqual(plain(shop), before);
    await f.update(null);
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    await f.update(shop);
    assert.equal(f.rows().length, 3);
  } finally {
    f.unmount();
  }
});

test("same-title domain reminders retain distinct identity and changed conditions do not inherit an obsolete dismissal", async () => {
  const shop = {
    ...readyShop(),
    domains: [
      { domain: "one.example.test", approved: false, primary: true },
      { domain: "two.example.test", approved: false, primary: false },
    ],
  };
  const f = await fixture({ shop });
  try {
    await f.dismiss();
    assert.equal(f.rows().length, 1);
    assert.ok(f.rows()[0].textContent.includes("two.example.test"));
    await f.update({
      ...shop,
      domains: [
        { domain: "changed.example.test", approved: false, primary: true },
      ],
    });
    assert.equal(f.rows().length, 1);
    assert.ok(f.rows()[0].textContent.includes("changed.example.test"));
  } finally {
    f.unmount();
  }
});

test("ready and unavailable shops render no synthetic health report; null-to-ready data needs no optional helper globals", async () => {
  const f = await fixture({ shop: null });
  try {
    assert.equal(f.warnings.length, 1);
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    await f.update(emptyShop());
    assert.equal(f.rows().length, 3);
    await f.update(readyShop());
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    window.$i18n_global = null;
    const error = console.error;
    console.error = () => {};
    try {
      await f.update(emptyShop(2));
    } finally {
      console.error = error;
    }
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
  } finally {
    f.unmount();
  }
});

test("legacy caller keeps the actual alert component, complete messages, first-three cap and native CTA", async () => {
  const f = await fixture({ modern: false });
  try {
    const expected = ShopCautionHelper.Generate(f.props.shop).slice(0, 3);
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    assert.equal(f.host.querySelector("details"), null);
    assert.equal(f.host.querySelectorAll(".b--alert-cation").length, 3);
    for (const item of expected) {
      assert.ok(f.host.textContent.includes(item.title));
      assert.ok(f.host.textContent.includes(item.message));
    }
    assert.deepEqual(
      [...f.host.querySelectorAll("a")].map((node) =>
        JSON.parse(node.getAttribute("data-route")),
      ),
      plain(expected.filter((item) => item.to).map((item) => item.to)),
    );
    f.host.querySelector(".b--alert-cation button").click();
    await Vue.nextTick();
    assert.equal(f.host.querySelectorAll(".b--alert-cation").length, 2);
  } finally {
    f.unmount();
  }
});

const shopWithTechnicalIssues = (id = 1) => ({
  ...readyShop(id),
  active: false,
  sub: { primary: true, enable: false },
  domains: [
    {
      id: 42,
      domain: "recorded.example.test",
      primary: true,
      enable: true,
      approved: true,
      error: "A recorded diagnostic",
    },
  ],
  mail_service: {
    id: 11,
    enable: true,
    driver: "smtp",
    errors: 100,
    error: "unrendered-mail-diagnostic",
  },
  sms_service: {
    id: 12,
    enable: true,
    driver: "twilio",
    errors: "100",
    error: "unrendered-sms-diagnostic",
  },
});

test("modern technical warnings are capped with native Show more/fewer, current-shop CTAs and context reset", async () => {
  for (const locale of ["en", "fa"]) {
    const f = await fixture({ shop: shopWithTechnicalIssues(), locale });
    try {
      const expected = getTechnicalCautions(f.props.shop, (key, params) =>
        translate(locale, key, params),
      );
      assert.equal(expected.length, 5);
      assert.equal(f.rows().length, 3);
      const more = () =>
        f.host.querySelector(".s--shop-dashboard-cations-modern__more");
      assert.equal(more().getAttribute("aria-expanded"), "false");
      assert.ok(
        more().textContent.includes(
          translate(locale, "admin_shop.dashboard.technical.show_more", {
            count: 2,
          }),
        ),
      );
      more().click();
      await Vue.nextTick();
      assert.equal(f.rows().length, 5);
      assert.equal(more().getAttribute("aria-expanded"), "true");
      assert.ok(
        more().textContent.includes(
          translate(locale, "admin_shop.dashboard.technical.show_less"),
        ),
      );
      assert.deepEqual(
        f.rows().map((row) => row.querySelector("h3").textContent),
        plain(expected.map((item) => item.title)),
      );
      assert.deepEqual(
        [...f.host.querySelectorAll("a")].map((link) =>
          JSON.parse(link.getAttribute("data-route")),
        ),
        plain(expected.map((item) => item.to)),
      );
      assert.equal(
        f.host.textContent.includes("unrendered-mail-diagnostic"),
        false,
      );
      assert.equal(
        f.host.textContent.includes("unrendered-sms-diagnostic"),
        false,
      );
      more().click();
      await Vue.nextTick();
      assert.equal(f.rows().length, 3);
      more().click();
      await Vue.nextTick();
      await f.update(shopWithTechnicalIssues(2));
      assert.equal(f.rows().length, 3);
      assert.equal(more().getAttribute("aria-expanded"), "false");
    } finally {
      f.unmount();
    }
  }
});

test("diagnostic dismissal survives counter/message changes and expires when the real issue clears", async () => {
  const shop = {
    ...readyShop(),
    mail_service: { id: 7, enable: true, driver: "smtp", errors: 100 },
  };
  const f = await fixture({ shop });
  try {
    assert.equal(f.rows().length, 1);
    await f.dismiss();
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    await f.update({
      ...shop,
      mail_service: {
        ...shop.mail_service,
        errors: 101,
        error: "Changed recorded error",
        private_attributes: { irrelevant: true },
      },
    });
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    await f.update({
      ...shop,
      mail_service: {
        ...shop.mail_service,
        errors: 0,
        error: "Old diagnostic text",
      },
    });
    assert.equal(f.host.querySelector(".sd-modern-widget"), null);
    await f.update(shop);
    assert.equal(f.rows().length, 1);
    await f.dismiss();
    await f.update({ ...shop, mail_service: { ...shop.mail_service, id: 8 } });
    assert.equal(f.rows().length, 1);
  } finally {
    f.unmount();
  }
});

test("base errors retain priority over new warnings and legacy callers never receive modern diagnostics or expansion", async () => {
  const shop = { ...emptyShop(), active: false };
  const f = await fixture({ shop });
  try {
    assert.deepEqual(
      f.rows().map((row) => row.querySelector("h3").textContent),
      plain(
        ShopCautionHelper.Generate(shop)
          .slice(0, 3)
          .map((item) => item.title),
      ),
    );
    f.host.querySelector(".s--shop-dashboard-cations-modern__more").click();
    await Vue.nextTick();
    assert.equal(f.rows().length, ShopCautionHelper.Generate(shop).length + 1);
    assert.ok(
      f.host.textContent.includes(
        translate("en", "admin_shop.dashboard.technical.checks.inactive.title"),
      ),
    );
  } finally {
    f.unmount();
  }
  const legacy = await fixture({
    shop: shopWithTechnicalIssues(),
    modern: false,
  });
  try {
    assert.equal(
      legacy.host.querySelector(".sd-modern-widget, .b--alert-cation, button"),
      null,
    );
  } finally {
    legacy.unmount();
  }
});
