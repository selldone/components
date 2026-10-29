const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const {
  compileScript,
  compileStyleAsync,
  compileTemplate,
  parse,
} = require("@vue/compiler-sfc");
const { JSDOM } = require("jsdom");
const ts = require("typescript");

const filename = path.join(__dirname, "ShopOnboardingMigrationTab.vue");
const plain = (value) => JSON.parse(JSON.stringify(value));
function evaluate(source, globals = {}) {
  const exports = {};
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(compiled.diagnostics, []);
  vm.runInNewContext(compiled.outputText, { exports, ...globals });
  return exports;
}
function translator(locale) {
  const messages = evaluate(
    readFileSync(
      path.resolve(
        __dirname,
        `../../../../translate/service/onboarding/${locale}.ts`,
      ),
      "utf8",
    ),
  ).default;
  return (key, values = {}) => {
    const message = key
      .replace(/^onboarding\./, "")
      .split(".")
      .reduce((current, name) => current?.[name], messages);
    assert.equal(typeof message, "string", `Missing ${locale} message: ${key}`);
    return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
  };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
function fixture({
  writeText = async () => {},
  missingClipboard = false,
} = {}) {
  const dom = new JSDOM(
    '<details><summary>Prompt</summary><pre tabindex="0"></pre></details>',
  );
  const writes = [],
    buttons = [];
  const source = readFileSync(filename, "utf8");
  const parsed = parse(source, { filename });
  assert.deepEqual(parsed.errors, []);
  const script = compileScript(parsed.descriptor, { id: "migration-test" });
  const globals = {
    navigator: missingClipboard
      ? {}
      : {
          clipboard: {
            writeText(text) {
              writes.push(text);
              return writeText(text);
            },
          },
        },
    document: dom.window.document,
    window: dom.window,
    axios: new Proxy(
      {},
      {
        get() {
          assert.fail("Migration UI must not call an API");
        },
      },
    ),
    require: (name) => (name === "vue" ? Vue : name),
  };
  const component = evaluate(script.content, globals).default;
  const template = compileTemplate({
    source: parsed.descriptor.template.content,
    filename,
    id: "migration-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  component.render = evaluate(template.code, globals).render;
  function state({
    locale = "en",
    shopId = 42,
    nextTick = () => Promise.resolve(),
  } = {}) {
    const state = Vue.reactive({
      ...component.data(),
      modern: true,
      shop: { id: shopId },
      $t: translator(locale),
      $refs: {
        promptDisclosure: dom.window.document.querySelector("details"),
        promptText: dom.window.document.querySelector("pre"),
      },
      $nextTick: nextTick,
    });
    for (const [name, method] of Object.entries(component.methods))
      state[name] = method.bind(state);
    for (const [name, getter] of Object.entries(component.computed))
      Object.defineProperty(state, name, { get: () => getter.call(state) });
    const stop = Vue.watch(
      () => state.migrationPrompt,
      () => component.watch.migrationPrompt.handler.call(state),
      { flush: component.watch.migrationPrompt.flush },
    );
    state.$refs.promptText.textContent = state.migrationPrompt;
    return { state, stop };
  }
  async function render({ locale = "en", modern = true } = {}) {
    buttons.length = 0;
    let context;
    const app = Vue.createSSRApp(
      {
        ...component,
        created() {
          context = this;
          component.created.call(this);
        },
      },
      { modern, shop: { id: 42 }, timeSeries: {} },
    );
    app.config.globalProperties.$t = translator(locale);
    const wrapper = (tag) =>
      Vue.defineComponent({
        inheritAttrs: false,
        setup:
          (_, { attrs, slots }) =>
          () =>
            Vue.h(tag, attrs, slots.default?.()),
      });
    app.component("VCard", wrapper("article"));
    app.component("VCardText", wrapper("div"));
    app.component("VImg", wrapper("div"));
    app.component(
      "VIcon",
      Vue.defineComponent({
        props: ["icon", "size"],
        setup:
          (props, { slots }) =>
          () =>
            Vue.h("span", { "data-icon": props.icon }, slots.default?.()),
      }),
    );
    app.component(
      "UWidgetHeader",
      Vue.defineComponent({
        props: ["title"],
        setup: (props) => () => Vue.h("h3", props.title),
      }),
    );
    app.component(
      "VBtn",
      Vue.defineComponent({
        inheritAttrs: false,
        props: [
          "to",
          "href",
          "target",
          "rel",
          "color",
          "variant",
          "active",
          "loading",
          "disabled",
        ],
        setup:
          (props, { attrs, slots }) =>
          () => {
            const children = slots.default?.();
            buttons.push({ ...props, ...attrs, children });
            return Vue.h(
              props.to || props.href ? "a" : "button",
              {
                ...attrs,
                href: props.href,
                target: props.target,
                rel: props.rel,
                "data-route": props.to ? JSON.stringify(props.to) : undefined,
              },
              children,
            );
          },
      }),
    );
    const html = await renderToString(app);
    return {
      html,
      document: new JSDOM(html).window.document,
      context,
      buttons: [...buttons],
    };
  }
  return {
    component,
    descriptor: parsed.descriptor,
    dom,
    writes,
    state,
    render,
  };
}

test("Migration compiles script, template and scoped Sass with legacy default", async () => {
  const f = fixture();
  assert.equal(f.component.props.modern.default, false);
  for (const style of f.descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename,
      id: "migration-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("EN/FA modern UI keeps native new-tab connectors, real MCP guide and selectable current-shop prompt", async () => {
  for (const locale of ["en", "fa"]) {
    const f = fixture();
    const screen = await f.render({ locale });
    assert.equal(
      screen.document.querySelector("h4").textContent,
      translator(locale)("onboarding.modern.migration.ai_title"),
    );
    const routes = screen.buttons.filter((button) => button.to);
    assert.equal(routes.length, 2);
    for (const link of routes) {
      assert.deepEqual(plain(link.to), {
        name: "BPageShopChannelConnect",
        add: true,
      });
      assert.equal(link.target, "_blank");
      assert.equal(link.rel, "noopener noreferrer");
      assert.equal(link.variant, "text");
      assert.equal(link.color, "primary");
      assert.equal(link.active, false);
    }
    const guide = screen.buttons.find((button) => button.href);
    assert.equal(guide.href, "https://selldone.com/mcp");
    assert.equal(guide.target, "_blank");
    assert.equal(guide.rel, "noopener noreferrer");
    assert.equal(
      (screen.document.body.textContent.match(/north_east/g) || []).length,
      3,
    );
    assert.ok(screen.document.querySelector('[data-icon="fa:fab fa-openai"]'));
    assert.ok(screen.document.querySelector('[data-icon="fa:fab fa-claude"]'));
    assert.ok(screen.document.querySelector("details > summary"));
    const prompt = screen.document.querySelector("pre");
    assert.equal(prompt.textContent, screen.context.migrationPrompt);
    assert.equal(prompt.getAttribute("dir"), "auto");
    assert.equal(prompt.getAttribute("tabindex"), "0");
    assert.ok(prompt.textContent.includes("#42"));
    assert.ok(prompt.textContent.includes("OAuth/MCP"));
    assert.ok(!prompt.textContent.includes("{shop}"));
    assert.equal(f.writes.length, 0);
  }
});

test("legacy Shopify/WooCommerce keeps its original destinations without AI or new-tab changes", async () => {
  const f = fixture();
  const screen = await f.render({ modern: false });
  assert.equal(screen.buttons.length, 2);
  for (const button of screen.buttons) {
    assert.deepEqual(plain(button.to), {
      name: "BPageShopChannelConnect",
      add: true,
    });
    assert.equal(button.target, undefined);
  }
  assert.equal(screen.document.querySelector("details"), null);
  assert.equal(screen.document.querySelector("pre"), null);
  assert.equal(f.writes.length, 0);
});

test("copy writes the exact localized prompt once, blocks repeats and reports completion", async () => {
  for (const locale of ["en", "fa"]) {
    const pending = deferred();
    const f = fixture({ writeText: () => pending.promise });
    const { state, stop } = f.state({ locale });
    const copy = state.copyPrompt();
    await state.copyPrompt();
    assert.deepEqual(f.writes, [state.migrationPrompt]);
    assert.equal(state.copy_state, "copying");
    pending.resolve();
    await copy;
    assert.equal(state.copy_state, "copied");
    assert.equal(
      state.copyMessage,
      translator(locale)("onboarding.modern.migration.copy_success"),
    );
    stop();
  }
});

test("clipboard refusal or unavailable API opens and selects the actual prompt for manual copy", async () => {
  for (const options of [
    {
      writeText: async () => {
        throw new Error("Clipboard denied");
      },
    },
    { missingClipboard: true },
  ]) {
    const f = fixture(options);
    const { state, stop } = f.state();
    await state.copyPrompt();
    assert.equal(state.copy_state, "selected");
    assert.equal(state.$refs.promptDisclosure.open, true);
    assert.equal(f.dom.window.getSelection().toString(), state.migrationPrompt);
    assert.equal(f.dom.window.document.activeElement, state.$refs.promptText);
    stop();
  }
});

test("shop and locale changes invalidate pending copy feedback; unmount prevents fallback mutations", async () => {
  for (const change of ["shop", "locale", "unmount"]) {
    const pending = deferred();
    const f = fixture({ writeText: () => pending.promise });
    const { state, stop } = f.state();
    const copy = state.copyPrompt();
    if (change === "shop") state.shop.id = 77;
    else if (change === "locale") state.$t = translator("fa");
    else f.component.beforeUnmount.call(state);
    pending.reject(new Error("Old copy denied"));
    await copy;
    assert.notEqual(state.copy_state, "selected");
    assert.notEqual(state.copy_state, "copied");
    assert.equal(state.$refs.promptDisclosure.open, false);
    assert.equal(f.dom.window.getSelection().toString(), "");
    stop();
  }
});

test("shop change while fallback awaits rendering never selects or reports the new shop's prompt", async () => {
  const tick = deferred();
  const rendering = deferred();
  const f = fixture({
    writeText: async () => {
      throw new Error("Clipboard denied");
    },
  });
  const { state, stop } = f.state({
    nextTick: () => {
      rendering.resolve();
      return tick.promise;
    },
  });
  const copy = state.copyPrompt();
  await rendering.promise;
  assert.equal(state.$refs.promptDisclosure.open, true);
  state.shop.id = 99;
  state.$refs.promptText.textContent = state.migrationPrompt;
  tick.resolve();
  await copy;
  assert.equal(state.copy_state, "");
  assert.equal(f.dom.window.getSelection().toString(), "");
  stop();
});

test("an old copy cannot override a newer shop's successful copy; unavailable shops never copy", async () => {
  const older = deferred(),
    newer = deferred();
  const pending = [older, newer];
  const f = fixture({ writeText: () => pending.shift().promise });
  const { state, stop } = f.state();
  const oldCopy = state.copyPrompt();
  state.shop.id = 77;
  const newCopy = state.copyPrompt();
  newer.resolve();
  await newCopy;
  older.reject(new Error("Old copy denied"));
  await oldCopy;
  assert.equal(state.copy_state, "copied");
  assert.equal(state.$refs.promptDisclosure.open, false);
  assert.ok(f.writes[0].includes("#42"));
  assert.ok(f.writes[1].includes("#77"));
  stop();

  const unavailable = fixture();
  const missing = unavailable.state({ shopId: null });
  await missing.state.copyPrompt();
  assert.equal(missing.state.migrationPrompt, "");
  assert.equal(unavailable.writes.length, 0);
  missing.stop();
});
