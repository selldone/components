const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const { renderToString } = require("@vue/server-renderer");
const { createSSRApp, h } = require("vue");
const { createI18n } = require("vue-i18n");
const ts = require("typescript");

function evaluate(source, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, {
    exports,
    require: name => name === "lodash-es"
      ? { isFunction: value => typeof value === "function" }
      : require(name),
    ...globals,
  });
  return exports;
}

const filename = path.join(__dirname, "USmartSelect.vue");
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ source: descriptor.template.content, filename, id: "smart-select-i18n" });
assert.deepEqual(template.errors, []);
// A second app can replace window.$t with a translator missing dashboard keys.
const component = evaluate(descriptor.script.content, { $t: key => key }).default;
component.render = evaluate(template.code).render;

const messages = Object.fromEntries(["en", "fa"].map(locale => {
  const pack = evaluate(readFileSync(path.join(__dirname, `../../../../translate/dashboard/${locale}.ts`), "utf8")).default;
  return [locale, { business_model: pack.business_model }];
}));
const models = Object.keys(messages.en.business_model.modern.models);
const items = models.map(code => ({
  code,
  name: `business_model.modern.models.${code}.title`,
  description: `business_model.modern.models.${code}.description`,
}));

async function render(i18n, props = {}) {
  const app = createSSRApp(component, {
    items, itemText: "name", itemDescription: "description", itemValue: "code",
    modelValue: "marketplace", forceShowAll: true, accessible: true,
    ...props,
  });
  app.use(i18n);
  app.mixin({ methods: { isString: value => typeof value === "string" } });
  const slot = (_, { slots }) => h("div", slots.default?.());
  for (const name of ["v-slide-y-transition", "v-sheet", "v-icon", "v-list-subheader", "v-progress-circular", "v-avatar"]) app.component(name, slot);
  return renderToString(app);
}

test("titles and descriptions use the mounted app's translations despite a different global translator", async () => {
  const i18n = createI18n({ legacy: false, locale: "en", fallbackLocale: "en", messages });
  for (const locale of ["en", "fa", "en"]) {
    i18n.global.locale.value = locale;
    const html = await render(i18n);
    for (const code of models) {
      const expected = messages[locale].business_model.modern.models[code];
      assert.ok(html.includes(`<b>${expected.title}</b>`), `${locale}: ${code} title must translate`);
      assert.ok(html.includes(expected.description), `${locale}: ${code} description must translate`);
    }
    assert.ok(!html.includes("business_model.modern.models."), `${locale}: no raw translation keys`);
  }
});

test("title translation keeps the app's fallback locale", async () => {
  const i18n = createI18n({ legacy: false, locale: "fr", fallbackLocale: "en", messages, missingWarn: false, fallbackWarn: false });
  const html = await render(i18n);
  assert.ok(html.includes("<b>Normal Store</b>"));
  assert.ok(!html.includes("business_model.modern.models."));
});

test("function labels, plain choices and existing HTML labels keep their rendering contract", async () => {
  const i18n = createI18n({ legacy: false, locale: "en", messages, missingWarn: false });
  const functional = await render(i18n, {
    items: [{ code: "a" }], itemText: item => `<em>Choice ${item.code}</em>`, itemDescription: undefined,
  });
  assert.ok(functional.includes("<b><em>Choice a</em></b>"));
  const plain = await render(i18n, { items: ["Plain choice"], itemText: undefined, itemValue: undefined, itemDescription: undefined });
  assert.ok(plain.includes("<b>Plain choice</b>"));
});
