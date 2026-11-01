const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const Vue = require("vue");
const { renderToString } = require("vue/server-renderer");
const {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} = require("@vue/compiler-sfc");
const { JSDOM } = require("jsdom");
const ts = require("typescript");
const postcss = require("postcss");

const filename = path.join(__dirname, "ShopOnboardingAiTab.vue");
const publicUrl = "https://mcp.example.test/shop-tools/sse";
const connection = (active_connections = 0, mcp_url = publicUrl) => ({
  active_connections,
  mcp_url,
});
const plain = (value) => JSON.parse(JSON.stringify(value));

function evaluate(source, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, ...globals });
  return exports;
}
function translator(locale) {
  const messages = {
    onboarding: evaluate(
      readFileSync(
        path.resolve(
          __dirname,
          "../../../../translate/service/onboarding",
          locale + ".ts",
        ),
        "utf8",
      ),
    ).default,
  };
  return (key, values = {}) => {
    const message = key
      .split(".")
      .reduce((value, part) => value?.[part], messages);
    assert.equal(
      typeof message,
      "string",
      "Missing " + locale + " translation: " + key,
    );
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
function fixture(
  t,
  { writeText = async () => {}, missingClipboard = false } = {},
) {
  const dom = new JSDOM('<textarea readonly rows="1"></textarea>');
  const writes = [],
    buttons = [],
    emitted = [];
  const denied = () =>
    assert.fail(
      "AI onboarding must not request data, authorize or mutate a connection",
    );
  const globals = {
    window: Object.assign(dom.window, { fetch: denied }),
    document: dom.window.document,
    URL: dom.window.URL,
    navigator: missingClipboard
      ? {}
      : {
          clipboard: {
            writeText(value) {
              writes.push(value);
              return writeText(value);
            },
          },
        },
    axios: new Proxy({}, { get: denied }),
    fetch: denied,
    require: (name) => {
      assert.equal(
        name,
        "vue",
        "New instance helpers must load their actual owning dependency",
      );
      return Vue;
    },
  };
  const parsed = parse(readFileSync(filename, "utf8"), { filename });
  assert.deepEqual(parsed.errors, []);
  const descriptor = parsed.descriptor;
  const script = compileScript(descriptor, { id: "onboarding-ai-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename,
    id: "onboarding-ai-test",
    compilerOptions: { bindingMetadata: script.bindings },
  });
  assert.deepEqual(template.errors, []);
  const component = evaluate(script.content, globals).default;
  component.render = evaluate(template.code, globals).render;
  function state({
    locale = "en",
    shopId = 42,
    data = connection(),
    loading = false,
    error = false,
    nextTick = () => Promise.resolve(),
  } = {}) {
    const value = Vue.reactive({
      ...component.data(),
      shop: { id: shopId },
      connection: data,
      loading,
      error,
      $t: translator(locale),
      $refs: { urlField: dom.window.document.querySelector("textarea") },
      $nextTick: nextTick,
    });
    for (const [name, method] of Object.entries(component.methods))
      value[name] = method.bind(value);
    for (const [name, getter] of Object.entries(component.computed))
      Object.defineProperty(value, name, { get: () => getter.call(value) });
    const stops = Object.entries(component.watch).map(([name, definition]) =>
      Vue.watch(
        () => name.split(".").reduce((current, part) => current?.[part], value),
        (...args) =>
          (typeof definition === "function"
            ? definition
            : definition.handler
          ).apply(value, args),
        { flush: definition.flush },
      ),
    );
    value.$refs.urlField.value = value.mcp_url;
    stops.push(
      Vue.watch(
        () => value.mcp_url,
        (url) => {
          value.$refs.urlField.value = url;
        },
        { flush: "sync" },
      ),
    );
    t.after(() => stops.forEach((stop) => stop()));
    return value;
  }
  async function render({
    locale = "en",
    shopId = 42,
    data = connection(),
    loading = false,
    error = false,
    provider = "chatgpt",
  } = {}) {
    buttons.length = 0;
    let context;
    const app = Vue.createSSRApp(
      {
        ...component,
        created() {
          this.provider = provider;
          context = this;
        },
      },
      {
        shop: { id: shopId },
        connection: data,
        loading,
        error,
        onRefresh: () => emitted.push("refresh"),
      },
    );
    app.config.globalProperties.$t = translator(locale);
    app.config.warnHandler = (message) => {
      throw Error(message);
    };
    const failures = [];
    app.config.errorHandler = (error) => failures.push(error);
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
      "VBtn",
      Vue.defineComponent({
        inheritAttrs: false,
        setup:
          (_, { attrs, slots }) =>
          () => {
            buttons.push(attrs);
            return Vue.h(
              attrs.href || attrs.to ? "a" : "button",
              {
                ...attrs,
                "data-route": attrs.to ? JSON.stringify(attrs.to) : undefined,
              },
              slots.default?.(),
            );
          },
      }),
    );
    const html = await renderToString(app);
    assert.deepEqual(
      failures,
      [],
      "Render errors and missing helpers must fail the test",
    );
    return {
      html,
      document: new JSDOM(html).window.document,
      context,
      buttons: [...buttons],
    };
  }
  return {
    component,
    descriptor,
    dom,
    writes,
    buttons,
    emitted,
    state,
    render,
  };
}

test("AI onboarding compiles and retains a finite, reduced-motion-safe inert illustration", async (t) => {
  const f = fixture(t);
  assert.equal(f.component.props.shop.required, true);
  assert.equal(f.component.props.connection.default, null);
  for (const style of f.descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename,
      id: "onboarding-ai-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
    const css = postcss.parse(result.code);
    let reducedMotion = false;
    css.walkDecls(/^animation/, (declaration) => {
      assert.equal(/\binfinite\b/.test(declaration.value), false);
      if (declaration.prop === "animation") {
        const seconds = [
          ...declaration.value.matchAll(/([\d.]+)(ms|s)\b/g),
        ].reduce(
          (sum, match) =>
            sum + Number(match[1]) / (match[2] === "ms" ? 1000 : 1),
          0,
        );
        assert.ok(seconds <= 4, "Illustration finishes in four seconds");
      }
    });
    css.walkAtRules("media", (rule) => {
      if (/prefers-reduced-motion\s*:\s*reduce/.test(rule.params))
        rule.walkDecls("animation", (declaration) => {
          if (declaration.value === "none") reducedMotion = true;
        });
    });
    assert.equal(reducedMotion, true);
  }
  const screen = await f.render();
  const figure = screen.document.querySelector("figure");
  assert.ok(figure.querySelector("figcaption").textContent.trim());
  assert.equal(figure.querySelectorAll("button, a, input, iframe").length, 0);
  assert.equal(
    figure.querySelector('[aria-hidden="true"]').querySelectorAll("svg")
      .length > 0,
    true,
  );
  assert.equal(f.writes.length, 0);
});

test("EN/FA instructions expose three providers, the returned readonly URL, refresh and safe native management", async (t) => {
  for (const locale of ["en", "fa"]) {
    const f = fixture(t);
    const screen = await f.render({ locale });
    assert.equal(
      screen.document.querySelector("h4").textContent,
      translator(locale)("onboarding.modern.ai.title"),
    );
    const providers = [
      ...screen.document.querySelectorAll(".s-onboarding-ai__providers button"),
    ];
    assert.equal(providers.length, 3);
    assert.equal(
      providers.filter(
        (button) => button.getAttribute("aria-pressed") === "true",
      ).length,
      1,
    );
    const field = screen.document.querySelector("textarea");
    assert.equal(field.value, publicUrl);
    assert.equal(field.readOnly, true);
    assert.equal(field.dir, "ltr");
    const manage = screen.buttons.find((button) => button.to);
    assert.deepEqual(plain(manage.to), {
      name: "BPageShopDashboard",
      params: { shop_id: 42 },
      query: { dashboard: "ai-agents" },
    });
    assert.equal(manage.target, "_blank");
    assert.equal(manage.rel, "noopener noreferrer");
    const refresh = screen.buttons.find(
      (button) => button["prepend-icon"] === "refresh",
    );
    refresh.onClick();
    assert.deepEqual(f.emitted, ["refresh"]);
    assert.equal(f.writes.length, 0);
  }
});

test("provider changes retain the same server URL and use only their native public guide links", async (t) => {
  const f = fixture(t);
  const expected = {
    chatgpt: "https://developers.openai.com/api/docs/guides/custom-mcp-server",
    claude:
      "https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp",
    custom: "https://selldone.com/mcp",
  };
  for (const provider of Object.keys(expected)) {
    const screen = await f.render({ provider });
    assert.equal(screen.context.mcp_url, publicUrl);
    assert.equal(screen.context.provider, provider);
    const guide = screen.buttons.find((button) => button.href);
    assert.equal(guide.href, expected[provider]);
    assert.equal(guide.target, "_blank");
    assert.equal(guide.rel, "noopener noreferrer");
  }
  assert.equal(f.writes.length, 0);
});

test("missing/loading/error data never invents a URL or an active connection", async (t) => {
  const f = fixture(t);
  for (const data of [
    null,
    {},
    connection(null, null),
    connection(undefined, null),
  ]) {
    const screen = await f.render({ data });
    assert.equal(screen.context.mcp_url, "");
    assert.equal(screen.context.connected, false);
    assert.equal(screen.document.querySelector("textarea"), null);
  }
  const pending = await f.render({ data: null, loading: true });
  assert.match(
    pending.document.querySelector(".s-onboarding-ai__unavailable").textContent,
    new RegExp(translator("en")("onboarding.modern.ai.loading")),
  );
  const failed = await f.render({ data: null, error: true });
  assert.ok(
    failed.document
      .querySelector(".s-onboarding-ai__status")
      .textContent.includes(
        translator("en")("onboarding.modern.ai.refresh_error"),
      ),
  );
  for (const count of [0, null, undefined, -1, "2", 1.5]) {
    const screen = await f.render({ data: connection(count) });
    assert.equal(screen.context.connected, false);
  }
  const active = await f.render({ data: connection(2) });
  assert.equal(active.context.connected, true);
  assert.ok(
    active.document
      .querySelector(".s-onboarding-ai__status")
      .textContent.includes(translator("en")("onboarding.modern.ai.connected")),
  );
  assert.equal(f.writes.length, 0);
});

test("only valid credential-free public HTTPS or local development HTTP URLs are copyable", async (t) => {
  const f = fixture(t);
  for (const invalid of [
    null,
    "",
    "not a URL",
    "javascript:alert(1)",
    "ftp://mcp.example.test/sse",
    "http://mcp.example.test/sse",
    "https://user:password@mcp.example.test/sse",
    publicUrl + "?token=fixture-only",
    publicUrl + "#fragment",
  ]) {
    const value = f.state({ data: connection(0, invalid) });
    assert.equal(value.mcp_url, "");
    await value.copyUrl();
  }
  assert.equal(f.writes.length, 0);
  for (const local of [
    "http://localhost:9000/mcp",
    "http://127.0.0.1:9000/mcp",
    "http://[::1]:9000/mcp",
  ]) {
    const screen = await f.render({ data: connection(0, local) });
    assert.equal(screen.context.local_url, true);
    assert.equal(screen.context.mcp_url, local);
    assert.ok(screen.document.querySelector(".s-onboarding-ai__local-note"));
  }
});

test("copy writes the returned URL exactly once while pending and reports actual completion", async (t) => {
  const pending = deferred();
  const f = fixture(t, { writeText: () => pending.promise });
  const value = f.state();
  const copy = value.copyUrl();
  await value.copyUrl();
  assert.deepEqual(f.writes, [publicUrl]);
  assert.equal(value.copy_state, "copying");
  pending.resolve();
  await copy;
  assert.equal(value.copy_state, "copied");
  assert.equal(
    value.$refs.urlField.selectionEnd - value.$refs.urlField.selectionStart,
    0,
  );
});

test("clipboard refusal or unavailable API selects the actual readonly field for manual copy", async (t) => {
  for (const options of [
    {
      writeText: async () => {
        throw Error("Clipboard denied");
      },
    },
    { missingClipboard: true },
  ]) {
    const f = fixture(t, options);
    const value = f.state();
    await value.copyUrl();
    assert.equal(value.copy_state, "failed");
    assert.equal(f.dom.window.document.activeElement, value.$refs.urlField);
    assert.equal(value.$refs.urlField.readOnly, true);
    assert.equal(value.$refs.urlField.value, publicUrl);
    assert.equal(value.$refs.urlField.selectionStart, 0);
    assert.equal(value.$refs.urlField.selectionEnd, publicUrl.length);
  }
});

test("URL/shop resets and unmount invalidate pending clipboard success or fallback", async (t) => {
  for (const kind of ["url", "shop", "unmount"]) {
    for (const outcome of ["success", "failure"]) {
      const pending = deferred();
      const f = fixture(t, { writeText: () => pending.promise });
      const value = f.state();
      value.provider = "claude";
      const copy = value.copyUrl();
      if (kind === "url")
        value.connection = connection(0, "https://new.example.test/mcp");
      else if (kind === "shop") value.shop.id = 77;
      else f.component.beforeUnmount.call(value);
      if (outcome === "success") pending.resolve();
      else pending.reject(Error("Old copy denied"));
      await copy;
      assert.equal(value.copy_state, "");
      assert.equal(
        value.$refs.urlField.selectionEnd - value.$refs.urlField.selectionStart,
        0,
      );
      if (kind === "shop") assert.equal(value.provider, "chatgpt");
      if (kind === "unmount") {
        await value.copyUrl();
        assert.equal(f.writes.length, 1);
      }
    }
  }
});

test("a reset during fallback rendering cannot select the new URL or override a newer copy", async (t) => {
  const tick = deferred(),
    reached = deferred();
  const f = fixture(t, {
    writeText: async () => {
      throw Error("Clipboard denied");
    },
  });
  const value = f.state({
    nextTick: () => {
      reached.resolve();
      return tick.promise;
    },
  });
  const copy = value.copyUrl();
  await reached.promise;
  value.connection = connection(0, "https://next.example.test/mcp");
  tick.resolve();
  await copy;
  assert.equal(value.copy_state, "");
  assert.equal(
    value.$refs.urlField.selectionEnd - value.$refs.urlField.selectionStart,
    0,
  );

  const older = deferred(),
    newer = deferred();
  const promises = [older, newer];
  const separate = fixture(t, { writeText: () => promises.shift().promise });
  const current = separate.state();
  const first = current.copyUrl();
  current.connection = connection(0, "https://next.example.test/mcp");
  const second = current.copyUrl();
  newer.resolve();
  await second;
  older.reject(Error("Old copy denied"));
  await first;
  assert.equal(current.copy_state, "copied");
  assert.deepEqual(separate.writes, [
    publicUrl,
    "https://next.example.test/mcp",
  ]);
});
