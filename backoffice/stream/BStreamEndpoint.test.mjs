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
import ts from "typescript";
import * as Vue from "vue";

const path = new URL("./BStreamEndpoint.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(path, "utf8"));
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const compiled = transpile(descriptor.script.content);
const translations = {};
vm.runInNewContext(
  transpile(
    readFileSync(
      new URL("../../../translate/dashboard/en.ts", import.meta.url),
      "utf8",
    ),
  ),
  { exports: translations },
);
const translate = (key, values = {}) => {
  const value = key
    .split(".")
    .reduce((current, part) => current?.[part], translations.default);
  assert.equal(typeof value, "string", `Missing translation: ${key}`);
  return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
};
const plain = (value) => JSON.parse(JSON.stringify(value));
const hasClass = (node, name) =>
  Vue.normalizeClass(node.props?.class).split(/\s+/).includes(name);
const settle = () => new Promise((resolve) => setImmediate(resolve));
const webStream = { agent: "web", access_key: "synthetic-source" };
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

// Synthetic local fixtures only: every request and clipboard write is deferred.
function fixture({ clipboardAvailable = true, initialize = true } = {}) {
  const requests = [],
    copies = [],
    notices = [],
    exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name.includes("NotificationService"))
        return {
          default: { showLaravelError: (error) => notices.push(error) },
        };
      if (name.includes("SetupService"))
        return { SetupService: { GetApiSubdomain: () => "xapi.example.test" } };
      assert.fail(`Unexpected import: ${name}`);
    },
    axios: {
      get: (url, options) => {
        const request = { url, options, ...deferred() };
        requests.push(request);
        return request.promise;
      },
    },
    fetch: () => assert.fail("The illustration must not send requests"),
    setTimeout: () => assert.fail("The illustration must not schedule timers"),
    setInterval: () => assert.fail("The illustration must not schedule timers"),
    navigator: clipboardAvailable
      ? {
          clipboard: {
            writeText: (text) => {
              const copy = { text, ...deferred() };
              copies.push(copy);
              return copy.promise;
            },
          },
        }
      : {},
    window: {
      API: {
        GET_SHOP_STREAMS: (shop) =>
          `https://api.example.test/shops/${shop}/streams`,
      },
      XAPI: {
        POST_STREAM_USER_ADD: (host, shop, key) =>
          `https://${host}/shops/${shop}/audience/${key}`,
      },
    },
  });
  const component = exports.default;
  const state = { shop: { id: 7 }, $t: translate, ...component.data() };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  if (initialize)
    for (const hook of ["created", "beforeMount", "mounted"])
      component[hook]?.call(state);
  const selectShop = (id) => {
    state.shop = { id };
    component.watch["shop.id"].call(state);
  };
  return { state, requests, copies, notices, selectShop };
}

function renderedElements(state) {
  const output = {};
  const result = compileTemplate({
    source: descriptor.template.content,
    filename: path.pathname,
    id: "stream-form-render-test",
  });
  assert.deepEqual(result.errors, []);
  vm.runInNewContext(transpile(result.code), {
    exports: output,
    require: (name) => {
      assert.equal(name, "vue");
      return { ...Vue, resolveComponent: (name) => name };
    },
  });
  const elements = [];
  function visit(node, parents = [], ancestorProps = []) {
    if (Array.isArray(node))
      return node.forEach((child) => visit(child, parents, ancestorProps));
    if (!node || typeof node !== "object") return;
    if (typeof node.type === "string") {
      elements.push({ ...node, parents, ancestorProps });
      parents = [...parents, node.type];
      ancestorProps = [...ancestorProps, node.props || {}];
    }
    if (
      node.children &&
      !Array.isArray(node.children) &&
      typeof node.children === "object"
    ) {
      for (const slot of Object.values(node.children))
        if (typeof slot === "function") visit(slot(), parents, ancestorProps);
    } else visit(node.children, parents, ancestorProps);
  }
  visit(output.render(state, []));
  return elements;
}

function sample({ configured = true, valid = true, values = {} } = {}) {
  const source = fixture({ initialize: false }).state.sampleCode;
  let submit;
  const requests = [],
    button = { disabled: false },
    status = { textContent: "" };
  Object.defineProperty(status, "innerHTML", {
    set: () => assert.fail("Errors must render as text"),
  });
  const fields = {
    email: " visitor@example.test ",
    name: " Alex ",
    phone: " ",
    interest: " New collection ",
    consent: "on",
    ...values,
  };
  const form = {
    reportValidity: () => valid,
    addEventListener: (event, handler) => {
      assert.equal(event, "submit");
      submit = handler;
    },
    querySelector: (selector) => {
      if (selector === 'button[type="submit"]') return button;
      if (selector === '[role="status"]') return status;
      assert.fail(`Unexpected selector: ${selector}`);
    },
  };
  let script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, "Example must include runnable JavaScript");
  if (configured)
    script = script.replaceAll(
      "SELLDONE_STREAM_ENDPOINT",
      "https://xapi.example.test/shops/7/audience/synthetic-source",
    );
  vm.runInNewContext(script, {
    document: {
      querySelector: (selector) => {
        assert.equal(selector, "#stream-form");
        return form;
      },
    },
    FormData: class {
      constructor(input) {
        assert.equal(input, form);
      }
      get(name) {
        return fields[name] ?? null;
      }
    },
    fetch: (url, options) => {
      const request = { url, options, ...deferred() };
      requests.push(request);
      return request.promise;
    },
  });
  return {
    requests,
    button,
    status,
    submit: () => submit({ preventDefault() {} }),
  };
}

test("Stream form template and scoped styles compile", async () => {
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "stream-form-test" });
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: path.pathname,
      id: "stream-form-test",
      compilerOptions: { bindingMetadata: script.bindings },
    }).errors,
    [],
  );
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: path.pathname,
      id: "stream-form-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
    assert.equal(style.scoped, true);
  }
});

test("ready-to-copy AI prompt uses the default brief without exposing the endpoint", () => {
  const f = fixture();
  assert.ok(f.state.aiPrompt.includes(translate("stream_form.brief_default")));
  assert.equal("brief" in f.state, false);
  const prompt = f.state.aiPrompt;
  f.state.brief = "A local property must not change the ready-to-copy prompt";
  assert.equal(f.state.aiPrompt, prompt);
  f.state.streams = [webStream];
  const endpoint = f.state.post_endpoint;
  assert.ok(endpoint.includes(webStream.access_key));
  for (const text of [f.state.aiPrompt, f.state.sampleCode]) {
    assert.ok(text.includes("SELLDONE_STREAM_ENDPOINT"));
    assert.ok(!text.includes(endpoint));
    assert.ok(!text.includes(webStream.access_key));
  }
  assert.ok(f.state.aiPrompt.includes(f.state.examplePayload));
  assert.equal(typeof JSON.parse(f.state.examplePayload).data, "object");
  assert.equal(f.requests.length, 1);
});

test("endpoint stays visible outside disclosures and illustration has no playback controls", () => {
  const f = fixture();
  f.state.streams = [webStream];
  const elements = renderedElements(f.state);
  const endpoint = elements.find(
    (node) => node.type === "code" && node.children === f.state.post_endpoint,
  );
  assert.ok(endpoint, "Loaded endpoint must be visible");
  assert.ok(!endpoint.parents.includes("details"));
  assert.ok(
    !elements.some((node) =>
      ["form", "input", "textarea", "v-textarea"].includes(node.type),
    ),
  );
  assert.ok(!elements.some((node) => node.props?.onSubmit));
  assert.ok(
    !elements.some(
      (node) =>
        node.ancestorProps.some((props) =>
          hasClass({ props }, "b-stream-endpoint__illustration"),
        ) && ["button", "v-btn"].includes(node.type),
    ),
    "The explanatory illustration has no playback controls",
  );
  assert.equal(f.requests.length, 1);
  assert.equal(f.copies.length, 0);
});

test("illustration uses inert shared artwork while Copy AI remains a real primary action", async () => {
  const f = fixture();
  const elements = renderedElements(f.state);
  assert.ok(
    elements.some(
      (node) =>
        node.type === "figure" && hasClass(node, "sd-modern-illustration"),
    ),
  );
  const stage = elements.find((node) =>
    hasClass(node, "b-stream-endpoint__stage"),
  );
  assert.equal(stage?.props["aria-hidden"], "true");
  const artwork = elements.filter((node) =>
    node.ancestorProps.some((props) =>
      hasClass({ props }, "b-stream-endpoint__stage"),
    ),
  );
  assert.ok(artwork.length > 0);
  for (const node of artwork) {
    assert.ok(
      ![
        "form",
        "input",
        "select",
        "textarea",
        "button",
        "a",
        "v-btn",
        "v-form",
        "v-text-field",
      ].includes(node.type),
      `Illustrative ${node.type} must not be interactive`,
    );
    assert.ok(
      !Object.keys(node.props || {}).some((name) =>
        /^on[A-Z]|^(?:href|src|action)$/.test(name),
      ),
    );
    assert.notEqual(node.props?.role, "button");
    assert.ok(node.props?.tabindex == null || Number(node.props.tabindex) < 0);
  }
  const fakeAction = artwork.find((node) =>
    hasClass(node, "sd-modern-illustration__action"),
  );
  assert.ok(fakeAction);
  assert.equal(fakeAction.type, "div");
  assert.ok(!hasClass(fakeAction, "sd-modern-button--primary"));
  assert.ok(!artwork.some((node) => node.type === "v-icon"));
  const icons = artwork.filter((node) =>
    hasClass(node, "sd-modern-illustration__icon"),
  );
  assert.equal(icons.length, 4);
  for (const icon of icons) {
    assert.equal(icon.type, "svg");
    assert.equal(icon.props.viewBox, "0 0 24 24");
  }
  const copy = elements.find(
    (node) =>
      node.type === "v-btn" && hasClass(node, "sd-modern-button--primary"),
  );
  assert.ok(copy);
  assert.equal(copy.props.color, "primary");
  assert.ok(!hasClass(copy, "sd-modern-illustration__action"));
  const pending = copy.props.onClick();
  assert.equal(f.copies.length, 1);
  assert.equal(f.copies[0].text, f.state.aiPrompt);
  f.copies[0].resolve();
  await pending;
  assert.equal(f.state.feedback, translate("stream_form.copied"));
  assert.equal(f.requests.length, 1);
});

test("shared illustration styles own contrasting action colors and consistent nonprimary artwork", async () => {
  const sharedPath = new URL(
    "../../../../src/Applications/Backoffice/style/modern-design.scss",
    import.meta.url,
  );
  const shared = await compileStyleAsync({
    source: readFileSync(sharedPath, "utf8"),
    filename: sharedPath.pathname,
    id: "illustration-system-test",
    preprocessLang: "scss",
  });
  assert.deepEqual(shared.errors, []);
  const feature = await compileStyleAsync({
    source: descriptor.styles[0].content,
    filename: path.pathname,
    id: "illustration-feature-test",
    scoped: true,
    preprocessLang: "scss",
  });
  assert.deepEqual(feature.errors, []);
  const tokens = {},
    action = {},
    icon = {};
  shared.rawResult.root.walkRules((rule) => {
    const target =
      rule.selector === ".sd-modern-illustration"
        ? tokens
        : rule.selector === ".sd-modern-illustration__action"
          ? action
          : rule.selector === ".sd-modern-illustration__icon"
            ? icon
            : null;
    if (target)
      rule.walkDecls((declaration) => {
        target[declaration.prop] = declaration.value;
      });
    if (rule.selector.includes(".sd-modern-illustration"))
      assert.doesNotMatch(rule.toString(), /--v-theme-(?:on-)?primary\b/);
  });
  assert.equal(action["pointer-events"], "none");
  assert.equal(icon.fill, "none");
  assert.equal(icon.stroke, "currentColor");
  assert.equal(icon["stroke-width"], "1.6");
  assert.equal(icon["stroke-linecap"], "round");
  assert.equal(icon["stroke-linejoin"], "round");
  feature.rawResult.root.walkRules((rule) => {
    if (
      /\.b-stream-endpoint__(?:stage|route|demo|illustration)\b/.test(
        rule.selector,
      )
    )
      assert.doesNotMatch(rule.toString(), /--v-theme-(?:on-)?primary\b/);
    if (rule.selector.startsWith(".b-stream-endpoint__demo-submit["))
      rule.walkDecls((declaration) =>
        assert.ok(
          !/^(?:color|background(?:-color)?)$/.test(declaration.prop),
          "Fake action colors belong to the shared primitive",
        ),
      );
  });
  feature.rawResult.root.walkAtRules("keyframes", (rule) =>
    assert.doesNotMatch(rule.toString(), /--v-theme-(?:on-)?primary\b/),
  );
  const luminance = (rgb) =>
    rgb
      .map((value) => value / 255)
      .map((value) =>
        value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
      )
      .reduce(
        (sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index],
        0,
      );
  for (const [surface, ink] of [
    ["255, 255, 255", "25, 25, 25"],
    ["25, 25, 25", "245, 245, 245"],
  ]) {
    const values = {
      ...tokens,
      "--v-theme-surface": surface,
      "--v-theme-on-surface": ink,
    };
    const resolve = (value, depth = 0) => {
      assert.ok(depth < 10, "Illustration tokens must resolve without cycles");
      assert.equal(typeof value, "string");
      return value.replace(/var\((--[\w-]+)\)/g, (_, name) =>
        resolve(values[name], depth + 1),
      );
    };
    const channels = (value) => {
      const resolved = resolve(value).match(/^rgb\(([\d,\s]+)\)$/);
      assert.ok(resolved, "Action colors must resolve to theme RGB colors");
      return resolved[1]
        .trim()
        .split(/[,\s]+/)
        .map(Number);
    };
    const foreground = luminance(channels(action.color));
    const background = luminance(
      channels(action.background || action["background-color"]),
    );
    assert.ok(
      (Math.max(foreground, background) + 0.05) /
        (Math.min(foreground, background) + 0.05) >=
        4.5,
      "Illustrative action text needs readable light/dark theme contrast",
    );
  }
});

test("illustration settles on a complete example within four seconds and honors reduced motion", async () => {
  const css = await compileStyleAsync({
    source: descriptor.styles[0].content,
    filename: path.pathname,
    id: "stream-motion-test",
    scoped: descriptor.styles[0].scoped,
    preprocessLang: descriptor.styles[0].lang,
  });
  let reducedMotion = false;
  css.rawResult.root.walkAtRules("media", (rule) => {
    if (/prefers-reduced-motion\s*:\s*reduce/.test(rule.params))
      rule.walkDecls("animation", (declaration) => {
        if (declaration.value === "none") reducedMotion = true;
      });
  });
  assert.ok(reducedMotion, "Reduced motion must disable CSS animations");

  const durations = [],
    delays = [];
  const seconds = (value) => {
    const match = value.match(/([\d.]+)(ms|s)\b/);
    assert.ok(match, `Expected a concrete animation time: ${value}`);
    return Number(match[1]) / (match[2] === "ms" ? 1000 : 1);
  };
  css.rawResult.root.walkDecls("animation", (declaration) => {
    if (declaration.value === "none") return;
    assert.ok(
      !/\binfinite\b/.test(declaration.value),
      "The example must not loop",
    );
    assert.ok(
      /\b(?:both|forwards)\b/.test(declaration.value),
      "The final frame remains visible",
    );
    durations.push(seconds(declaration.value));
  });
  css.rawResult.root.walkDecls("animation-delay", (declaration) => {
    delays.push(seconds(declaration.value));
  });
  assert.ok(durations.length > 0);
  assert.ok(Math.max(...durations) + Math.max(0, ...delays) <= 4);

  const endings = new Map();
  css.rawResult.root.walkAtRules("keyframes", (rule) => {
    const finalFrame = rule.nodes.find((node) =>
      node.selector
        ?.split(",")
        .some((part) => /^(?:100%|to)$/.test(part.trim())),
    );
    assert.ok(finalFrame, `${rule.params} needs a complete final frame`);
    endings.set(
      rule.params,
      Object.fromEntries(
        finalFrame.nodes.map((node) => [node.prop, node.value]),
      ),
    );
  });
  const ending = (name) =>
    [...endings].find(([key]) => key.startsWith(name))[1];
  assert.equal(ending("stream-form-type")["clip-path"], "inset(0)");
  assert.equal(ending("stream-form-record").opacity, "1");
  assert.equal(ending("stream-form-record").transform, "translateY(0)");
});

test("clipboard success waits for completion and failures reveal manual-copy text", async () => {
  const f = fixture();
  const pending = f.state.copyText(f.state.aiPrompt, "prompt");
  assert.equal(f.copies[0].text, f.state.aiPrompt);
  assert.equal(f.state.feedback, "");
  f.copies[0].resolve();
  await pending;
  assert.equal(f.state.feedback, translate("stream_form.copied"));
  for (const section of ["prompt", "sample", "endpoint"]) {
    const failed = f.state.copyText("Synthetic copy text", section);
    assert.equal(f.state.feedback, "");
    f.copies.at(-1).reject(new Error("Clipboard denied"));
    await failed;
    assert.equal(f.state.feedback, translate("stream_form.copy_failed"));
  }
  assert.equal(f.state.show_prompt, true);
  assert.equal(f.state.show_sample, true);
  const unavailable = fixture({ clipboardAvailable: false });
  await unavailable.state.copyText(unavailable.state.sampleCode, "sample");
  assert.equal(
    unavailable.state.feedback,
    translate("stream_form.copy_failed"),
  );
  assert.equal(unavailable.state.show_sample, true);
});

test("opening loads the endpoint once, blocks duplicate loads and remains retryable", async () => {
  const f = fixture();
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.post_endpoint, null);
  await f.state.fetchStreams();
  assert.equal(f.requests.length, 1);
  assert.equal(f.state.busy_fetch, true);
  assert.equal(f.requests[0].url, "https://api.example.test/shops/7/streams");
  assert.deepEqual(plain(f.requests[0].options.params), {
    offset: 0,
    limit: 10,
    sortBy: null,
    sortDesc: null,
    search: null,
  });
  f.requests[0].reject(new Error("Synthetic GET failure"));
  await settle();
  assert.equal(f.state.busy_fetch, false);
  assert.equal(f.state.post_endpoint, null);
  assert.equal(f.notices.length, 1);
  const retry = f.state.fetchStreams();
  f.requests[1].resolve({ data: { streams: [webStream] } });
  await retry;
  assert.equal(
    f.state.post_endpoint,
    "https://xapi.example.test/shops/7/audience/synthetic-source",
  );
});

test("shop changes clear endpoint state and ignore stale success or failure", async () => {
  const f = fixture();
  f.state.streams = [webStream];
  f.state.feedback = "Previous copy feedback";
  assert.equal(f.requests.length, 1);
  f.selectShop(8);
  assert.equal(f.state.post_endpoint, null);
  assert.equal(f.state.feedback, "");
  f.requests[0].resolve({ data: { streams: [webStream] } });
  await settle();
  assert.equal(f.state.post_endpoint, null);
  assert.equal(f.requests.length, 2);
  assert.equal(f.requests[1].url, "https://api.example.test/shops/8/streams");
  assert.equal(f.state.busy_fetch, true);
  f.selectShop(9);
  f.requests[1].reject(new Error("Stale request failed"));
  await settle();
  assert.equal(f.notices.length, 0);
  assert.equal(f.requests.length, 3);
  assert.equal(f.requests[2].url, "https://api.example.test/shops/9/streams");
  assert.equal(f.state.post_endpoint, null);
  f.requests[2].resolve({ data: { streams: [webStream] } });
  await settle();
  assert.equal(f.state.busy_fetch, false);
  assert.equal(
    f.state.post_endpoint,
    "https://xapi.example.test/shops/9/audience/synthetic-source",
  );
});

test("example refuses unconfigured endpoints and invalid forms without sending", async () => {
  const placeholder = sample({ configured: false });
  await placeholder.submit();
  assert.equal(placeholder.requests.length, 0);
  assert.match(
    placeholder.status.textContent,
    /Replace the endpoint placeholder/,
  );
  assert.equal(placeholder.button.disabled, false);
  const invalid = sample({ valid: false });
  await invalid.submit();
  assert.equal(invalid.requests.length, 0);
  assert.equal(invalid.button.disabled, false);
});

test("example sends structured JSON once while pending and shows confirmed success", async () => {
  const f = sample();
  const pending = f.submit();
  assert.equal(f.button.disabled, true);
  assert.equal(f.status.textContent, "Submitting…");
  await f.submit();
  assert.equal(f.requests.length, 1);
  const { url, options } = f.requests[0];
  assert.equal(
    url,
    "https://xapi.example.test/shops/7/audience/synthetic-source",
  );
  assert.equal(options.method, "POST");
  assert.equal(options.credentials, "omit");
  assert.deepEqual(plain(options.headers), {
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  assert.deepEqual(JSON.parse(options.body), {
    email: "visitor@example.test",
    name: "Alex",
    phone: null,
    data: { interest: "New collection", consent: true },
    tags: ["custom-form"],
  });
  f.requests[0].resolve({ ok: true, json: async () => ({ success: true }) });
  await pending;
  assert.equal(f.status.textContent, "Your details were saved.");
  assert.equal(f.button.disabled, false);
});

test("example never reports success for business, HTTP, parsing or network failures", async (t) => {
  const failures = [
    [
      "HTTP 200 business error",
      {
        ok: true,
        json: async () => ({
          error: true,
          error_msg: "<strong>Could not save</strong>",
        }),
      },
      "<strong>Could not save</strong>",
    ],
    [
      "missing success flag",
      { ok: true, json: async () => ({}) },
      "Could not save your details. Please try again.",
    ],
    [
      "non-2xx despite success flag",
      {
        ok: false,
        json: async () => ({ success: true, message: "Request blocked" }),
      },
      "Request blocked",
    ],
    [
      "non-JSON response",
      {
        ok: false,
        json: async () => {
          throw new SyntaxError("Unexpected response format");
        },
      },
      "Unexpected response format",
    ],
    [
      "network error",
      new Error("Synthetic network failure"),
      "Synthetic network failure",
    ],
  ];
  for (const [name, response, message] of failures)
    await t.test(name, async () => {
      const f = sample();
      const pending = f.submit();
      if (response instanceof Error) f.requests[0].reject(response);
      else f.requests[0].resolve(response);
      await pending;
      assert.equal(f.status.textContent, message);
      assert.notEqual(f.status.textContent, "Your details were saved.");
      assert.equal(f.button.disabled, false);
    });
});
