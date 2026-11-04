import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import ts from "typescript";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} from "@vue/compiler-sfc";

const dom = new JSDOM(
  '<!doctype html><html><body><div id="app"></div></body></html>',
  { url: "https://dashboard.example.test/shuttle/shop/7/domain/11" },
);
for (const name of [
  "window",
  "document",
  "Element",
  "HTMLElement",
  "SVGElement",
  "Node",
  "navigator",
]) {
  Object.defineProperty(globalThis, name, {
    value: name === "window" ? dom.window : dom.window[name],
    configurable: true,
  });
}
const Vue = await import("vue");
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => {
  await Vue.nextTick();
  await new Promise(setImmediate);
  await Vue.nextTick();
};
const bytes = (value) => new TextEncoder().encode(value).byteLength;
const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
};
const summary = (extra = {}) => ({
  mode: "default",
  has_code: true,
  head_bytes: 0,
  body_bytes: bytes("<p>Saved</p>"),
  updated_at: "2026-11-03T00:00:00Z",
  supported: true,
  reason: null,
  ...extra,
});
const item = (extra = {}) => ({
  enable: true,
  loading_summary: summary(),
  domain: { id: 11, domain: "store.example.test", externally_hosted: false },
  ...extra,
});
const page = (extra = {}) => ({
  loading_summary: summary(),
  limits: { head_bytes: 15360, body_bytes: 3072 },
  implementation_guide:
    "Server guide: use the startup message; never execute code in the operator app.",
  code: { head: "", body: "<p>Saved</p>" },
  ...extra,
});
const reply = (owner, extra = {}) => ({
  success: true,
  domain: { id: 11 },
  loading_summary: summary({
    mode: owner.mode,
    head_bytes: bytes(owner.head.trim()),
    body_bytes: bytes(owner.body.trim()),
    has_code: !!owner.body.trim(),
  }),
  ...extra,
});
function execute(source, imports = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      TextEncoder,
      ...globals,
      require(name) {
        assert(name in imports, "Unexpected import: " + name);
        return imports[name];
      },
    },
  );
  return exports;
}
async function component(relative, imports = {}, globals = {}) {
  const filename = fileURLToPath(new URL(relative, import.meta.url));
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
    filename,
  });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: "loading-test" });
  const template = compileTemplate({
    source: descriptor.template.content,
    filename,
    id: "loading-test",
    compilerOptions: { bindingMetadata: script.bindings },
    transformAssetUrls: { includeAbsolute: true },
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const compiled = await compileStyleAsync({
      source: style.content,
      filename,
      id: "loading-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(compiled.errors, []);
  }
  return {
    ...execute(script.content, { vue: Vue, ...imports }, globals).default,
    render: execute(template.code, { vue: Vue }).render,
  };
}
const SelectBoundary = Vue.defineComponent({
  inheritAttrs: false,
  props: ["items", "modelValue", "disabled", "readonly"],
  emits: ["update:modelValue", "change"],
  setup:
    (props, { attrs, emit }) =>
    () =>
      Vue.h(
        "div",
        { class: attrs.class, role: "radiogroup" },
        props.items.map((choice) =>
          Vue.h(
            "button",
            {
              type: "button",
              role: "radio",
              "data-choice": String(choice.id),
              "aria-checked": props.modelValue === choice.id,
              disabled: props.disabled || props.readonly || choice.disabled,
              onClick() {
                emit("update:modelValue", choice.id);
                emit("change", choice.id);
              },
            },
            choice.title,
          ),
        ),
      ),
});
// Exercise the real SmartSwitch mapping and watchers; only its unrelated select presentation is a boundary.
const SmartSwitch = await component(
  "../../../ui/smart/switch/USmartSwitch.vue",
  { "../select/USmartSelect.vue": { default: SelectBoundary } },
);
const samplesModule = execute(
  readFileSync(new URL("./domain-loading-samples.ts", import.meta.url), "utf8"),
);
const shell = (tag) =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h(tag, attrs, slots.default?.()),
  });
const Button = Vue.defineComponent({
  inheritAttrs: false,
  props: ["disabled", "loading"],
  setup:
    (props, { attrs, slots }) =>
    () =>
      Vue.h(
        "button",
        {
          ...attrs,
          type: "button",
          disabled: props.disabled,
          "aria-busy": props.loading,
        },
        slots.default?.(),
      ),
});
// Renders its content only while open; the extra control stands in for Escape or an outside click.
const Dialog = Vue.defineComponent({
  inheritAttrs: false,
  props: ["modelValue"],
  emits: ["update:modelValue"],
  setup:
    (props, { attrs, emit, slots }) =>
    () =>
      props.modelValue
        ? Vue.h("div", { role: "dialog", "aria-label": attrs["aria-label"] }, [
            slots.default?.(),
            Vue.h(
              "button",
              {
                type: "button",
                onClick: () => emit("update:modelValue", false),
              },
              "dismiss-dialog",
            ),
          ])
        : null,
});
const coreSource = readFileSync(
  new URL("../../../mixin/CoreMixin.ts", import.meta.url),
  "utf8",
);
const clipboardMethod = coreSource.match(
  /    copyToClipboard\([^]*?\n    \},/,
)?.[0];
assert(
  clipboardMethod,
  "The clipboard call must use the actual globally installed Core method.",
);
async function fixture(t, initial = {}) {
  const reads = [],
    writes = [],
    events = [],
    copies = [],
    errors = [];
  const transport =
    (calls) =>
    (...args) => {
      const pending = deferred();
      calls.push({ args, ...pending });
      return pending.promise;
    };
  const Loading = await component(
    "./BDomainLoading.vue",
    {
      "../../../ui/smart/switch/USmartSwitch.vue": { default: SmartSwitch },
      "./domain-loading-samples.ts": samplesModule,
    },
    {
      window: {
        API: {
          GET_DOMAIN_LOADING: (shop, domain) =>
            "/shops/" + shop + "/domain/" + domain + "/loading",
          POST_DOMAIN_LOADING: (shop, domain) =>
            "/shops/" + shop + "/domain/" + domain + "/loading",
        },
      },
      axios: { get: transport(reads), post: transport(writes) },
    },
  );
  const clipboard = execute(
    "export default { methods: {" + clipboardMethod + "} }",
    {},
    {
      ExecuteCopyToClipboard: (_owner, value, title, message) =>
        copies.push([value, title, message]),
    },
  ).default;
  const props = Vue.reactive({ shop: { id: 7 }, item: item(), ...initial });
  const owner = Vue.ref();
  const app = Vue.createApp({
    render: () =>
      Vue.h(Loading, {
        ...props,
        ref: owner,
        onSaved: (data) => events.push(["saved", plain(data)]),
        onState: (data) => events.push(["state", plain(data)]),
      }),
  });
  app.mixin(clipboard);
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.$vuetify = {
    theme: { current: { dark: false } },
  };
  app.config.warnHandler = (message) => errors.push(message);
  app.config.errorHandler = (error) => errors.push(error);
  app.component("v-icon", shell("span"));
  app.component("v-progress-linear", shell("span"));
  app.component("v-btn", Button);
  app.component("v-dialog", Dialog);
  for (const name of ["v-card", "v-card-text", "v-card-actions", "v-btn-group"])
    app.component(name, shell("div"));
  app.component("v-tooltip", { render: () => null });
  app.mount(dom.window.document.getElementById("app"));
  let mounted = true;
  const unmount = () => {
    if (mounted) {
      app.unmount();
      mounted = false;
    }
  };
  t.after(() => {
    unmount();
    assert.deepEqual(errors, []);
  });
  const root = () => dom.window.document.getElementById("app");
  const button = (key) =>
    [...root().querySelectorAll("button")].find((element) =>
      element.textContent.includes(key),
    );
  const input = async (field, value) => {
    const element =
      root().querySelectorAll("textarea")[field === "head" ? 0 : 1];
    element.value = value;
    element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    await settle();
  };
  const choose = async (custom) => {
    root()
      .querySelector('[data-choice="' + custom + '"]')
      .click();
    await settle();
  };
  const open = async (data = page()) => {
    props.active = true;
    await settle();
    reads.at(-1).resolve({ data });
    await settle();
  };
  return {
    props,
    reads,
    writes,
    events,
    copies,
    owner,
    root,
    button,
    input,
    choose,
    open,
    unmount,
  };
}

test("ordinary Overview stays lazy; active loading reads source once and local tab hiding retains drafts", async (t) => {
  const f = await fixture(t);
  assert.equal(f.reads.length, 0);
  await f.open();
  assert.deepEqual(plain(f.reads[0].args), [
    "/shops/7/domain/11/loading",
    { params: { include_code: true } },
  ]);
  await f.choose(true);
  await f.input("body", "<p>Unsaved draft</p>");
  f.props.active = false;
  await settle();
  f.props.active = true;
  await settle();
  assert.equal(f.reads.length, 1);
  assert.equal(f.writes.length, 0);
  assert.equal(f.owner.value.body, "<p>Unsaved draft</p>");
  assert.equal(f.owner.value.dirty, true);
});

test("an active Loading tab defers source reads during another parent operation and starts once unlocked", async (t) => {
  const f = await fixture(t, { active: true, disabled: true });
  await settle();
  f.owner.value.load();
  await settle();
  assert.equal(f.reads.length, 0);
  assert.equal(f.owner.value.busy, false);
  assert.equal(
    f.events.some(([name, state]) => name === "state" && state.busy),
    false,
  );
  f.props.disabled = false;
  await settle();
  assert.equal(f.reads.length, 1);
  assert.equal(f.owner.value.busy, true);
  f.owner.value.load();
  assert.equal(f.reads.length, 1);
  f.reads[0].resolve({ data: page() });
  await settle();
  assert.equal(f.owner.value.editable, true);
  f.props.readOnly = true;
  await settle();
  await f.choose(true);
  f.owner.value.save();
  assert.equal(f.owner.value.mode, "default");
  assert.equal(f.writes.length, 0);
});

test("real switch stages modes; each save sends only changed fields and one canonical success message", async (t) => {
  const f = await fixture(t);
  await f.open();
  for (const [field, value] of [
    ["mode", "custom"],
    ["head", "<script>const state={data:1};</script>"],
    ["body", "<p>Changed</p>"],
  ]) {
    if (field === "mode") await f.choose(true);
    else await f.input(field, value);
    f.button("save_changes").click();
    await settle();
    assert.deepEqual(plain(f.writes.at(-1).args), [
      "/shops/7/domain/11/loading",
      { [field]: value },
    ]);
    const count = f.writes.length;
    f.button("save_changes").click();
    f.owner.value.save();
    await settle();
    assert.equal(f.writes.length, count, "pending save cannot be duplicated");
    f.writes.at(-1).resolve({ data: reply(f.owner.value) });
    await settle();
    assert.equal(f.owner.value.dirty, false);
    assert.equal(f.owner.value.saved, true);
    assert.equal(
      [...f.root().querySelectorAll('[role="status"]')].filter((el) =>
        el.textContent.includes("domains_modern.loading.saved"),
      ).length,
      1,
    );
  }
  assert.equal(f.events.filter(([name]) => name === "saved").length, 3);
});

test("source and server guide remain inert text; clipboard uses the actual global Core method", async (t) => {
  const f = await fixture(t, { readOnly: true });
  const malicious =
    '<script>window.operatorAttack=true</script><img src=x onerror="operatorAttack()">';
  const guide = "<iframe srcdoc='<script>attack()</script>'></iframe>";
  await f.open(
    page({
      code: { head: malicious, body: malicious },
      implementation_guide: guide,
      loading_summary: summary({
        mode: "custom",
        head_bytes: bytes(malicious),
        body_bytes: bytes(malicious),
      }),
    }),
  );
  assert.equal(f.root().querySelector("script,img,iframe,object"), null);
  assert.equal(f.root().querySelector("textarea").value, malicious);
  assert.equal(f.root().querySelector("textarea").readOnly, true);
  assert.equal(f.root().querySelector("pre").textContent, guide);
  assert.equal(f.button("save_changes"), undefined);
  f.button("copy_ai").click();
  await settle();
  assert.deepEqual(f.copies, [[guide, null, null]]);
  assert.equal(f.writes.length, 0);
});

test("UTF-8 caps and NUL/data URI validation match the API while ordinary JavaScript data objects work", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.choose(true);
  await f.input("head", "é".repeat(7680));
  await f.input("body", "é".repeat(1536));
  assert.equal(f.owner.value.canSave, true);
  await f.input("head", "é".repeat(7681));
  assert.match(f.owner.value.headError, /too_large/);
  await f.input("head", "<script>const state={data:1};</script>");
  assert.equal(f.owner.value.headError, "");
  await f.input("body", "é".repeat(1537));
  assert.match(f.owner.value.bodyError, /too_large/);
  for (const invalid of [
    "x\0y",
    '<img src="data:image/png;base64,abc">',
    '<img src="DATA:,payload">',
    "<style>p{background:url(data:;base64,abc)}</style>",
  ]) {
    await f.input("body", invalid);
    assert.match(f.owner.value.bodyError, /invalid_code/);
    assert.equal(f.owner.value.canSave, false);
  }
  await f.input("body", "   ");
  assert.match(f.owner.value.bodyError, /body_required/);
  assert.equal(f.writes.length, 0);
});

test("failed saves retain draft and permit retry; discard restores only the last acknowledged baseline", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.choose(true);
  await f.input("body", "<p>Retry draft</p>");
  f.button("save_changes").click();
  await settle();
  f.writes[0].reject(new Error("synthetic failure"));
  await settle();
  assert.match(f.root().textContent, /save_failed/);
  assert.equal(f.owner.value.body, "<p>Retry draft</p>");
  assert.equal(f.owner.value.dirty, true);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
  f.button("save_changes").click();
  await settle();
  assert.deepEqual(plain(f.writes[1].args[1]), {
    mode: "custom",
    body: "<p>Retry draft</p>",
  });
  f.writes[1].resolve({ data: reply(f.owner.value) });
  await settle();
  await f.input("head", "<style>p{color:red}</style>");
  f.button("discard").click();
  await settle();
  assert.equal(f.owner.value.head, "");
  assert.equal(f.owner.value.body, "<p>Retry draft</p>");
  assert.equal(f.owner.value.dirty, false);
});

test("malformed reads require explicit retry before any write; invalid configuration can restore default", async (t) => {
  const f = await fixture(t);
  f.props.active = true;
  await settle();
  f.reads[0].resolve({
    data: {
      loading_summary: summary(),
      limits: { head_bytes: 999999, body_bytes: 3072 },
      code: null,
      implementation_guide: "guide",
    },
  });
  await settle();
  assert.equal(f.owner.value.loaded, false);
  assert.match(f.root().textContent, /load_failed/);
  f.button("retry").click();
  await settle();
  f.reads[1].resolve({
    data: page({
      loading_summary: summary({
        mode: "custom",
        has_code: false,
        head_bytes: null,
        body_bytes: null,
        reason: "invalid_configuration",
      }),
      code: null,
    }),
  });
  await settle();
  assert.equal(f.owner.value.canSave, false);
  assert.equal(f.button("restore_default").disabled, false);
  f.button("restore_default").click();
  await settle();
  assert.deepEqual(plain(f.writes[0].args[1]), { mode: "default" });
  f.writes[0].resolve({
    data: reply(f.owner.value, {
      loading_summary: summary({
        mode: "default",
        has_code: false,
        head_bytes: null,
        body_bytes: null,
        reason: "invalid_configuration",
      }),
    }),
  });
  await settle();
  assert.equal(f.owner.value.saved, true);
});

test("replacing corrupt custom code sends a complete repair including the untouched empty head", async (t) => {
  const f = await fixture(t);
  await f.open(
    page({
      loading_summary: summary({
        mode: "custom",
        has_code: false,
        head_bytes: null,
        body_bytes: null,
        reason: "invalid_configuration",
      }),
      code: null,
    }),
  );
  assert.equal(f.owner.value.head, "");
  assert.equal(f.owner.value.mode, "custom");
  assert.equal(f.owner.value.canSave, false);
  await f.input("body", "<p>Repaired loading</p>");
  assert.equal(f.owner.value.canSave, true);
  f.button("save_changes").click();
  await settle();
  assert.deepEqual(plain(f.writes[0].args[1]), {
    mode: "custom",
    head: "",
    body: "<p>Repaired loading</p>",
  });
  f.writes[0].resolve({ data: reply(f.owner.value) });
  await settle();
  assert.equal(f.owner.value.saved, true);
  assert.equal(f.owner.value.dirty, false);
  assert.equal(f.owner.value.summary.reason, null);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 1);
});

test("read-only, external, unsupported and other-operation guards prevent saves", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.choose(true);
  for (const prop of ["readOnly", "disabled"]) {
    f.props[prop] = true;
    await settle();
    f.owner.value.save();
    await f.choose(false);
    assert.equal(f.owner.value.mode, "custom");
    assert.equal(f.writes.length, 0);
    f.props[prop] = false;
    await settle();
  }
  f.props.item = item({ domain: { id: 11, externally_hosted: true } });
  await settle();
  f.owner.value.save();
  assert.equal(f.writes.length, 0);
  assert.match(f.root().textContent, /domains_modern.loading.external/);
});

test("external and built-in resources make no source request; migration-unsupported replies stay read-only", async (t) => {
  const f = await fixture(t, {
    active: true,
    item: item({ domain: { id: 11, externally_hosted: true } }),
  });
  assert.equal(f.reads.length, 0);
  f.props.item = { official: "sub", domain: null };
  await settle();
  assert.equal(f.reads.length, 0);
  f.props.item = item();
  await settle();
  f.reads[0].resolve({
    data: page({
      loading_summary: summary({
        mode: null,
        supported: false,
        reason: "migration_required",
      }),
      code: null,
    }),
  });
  await settle();
  assert.match(f.root().textContent, /unavailable/);
  assert.equal(f.owner.value.editable, false);
  f.owner.value.setMode(true);
  f.owner.value.save();
  assert.equal(f.writes.length, 0);
});

test("only canonical matching replies acknowledge a save; malformed or mismatched metadata stays retryable", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.input("head", "<style>p{color:red}</style>");
  const valid = reply(f.owner.value);
  for (const bad of [
    {},
    "<html>wrong reply</html>",
    { ...valid, success: false },
    { ...valid, domain: { id: 12 } },
    { ...valid, loading_summary: summary({ mode: "custom" }) },
    { ...valid, loading_summary: { mode: "default", supported: true } },
    { ...valid, loading_summary: summary({ head_bytes: 1 }) },
  ]) {
    f.owner.value.save();
    await settle();
    f.writes.at(-1).resolve({ data: bad });
    await settle();
    assert.equal(f.owner.value.dirty, true);
    assert.equal(f.owner.value.saved, false);
    assert.match(f.owner.value.error, /save_failed/);
  }
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
  f.owner.value.save();
  await settle();
  f.writes.at(-1).resolve({ data: valid });
  await settle();
  assert.equal(f.owner.value.dirty, false);
});

test("resource changes discard stale GETs and do not let an old finally clear the current pending read", async (t) => {
  const f = await fixture(t, { active: true });
  const oldRead = f.reads[0];
  f.props.item = item({ domain: { id: 12, domain: "next.example.test" } });
  await settle();
  assert.equal(f.reads.length, 2);
  oldRead.resolve({
    data: page({ code: { head: "", body: "<p>Obsolete</p>" } }),
  });
  await settle();
  assert.equal(f.owner.value.loaded, false);
  assert.equal(f.owner.value.busy, true);
  f.reads[1].resolve({
    data: page({ code: { head: "", body: "<p>Current</p>" } }),
  });
  await settle();
  assert.equal(f.owner.value.body, "<p>Current</p>");
  f.props.shop = { id: 8 };
  await settle();
  assert.equal(f.owner.value.loaded, false);
  assert.equal(f.owner.value.body, "");
  assert.match(f.reads[2].args[0], /shops\/8\/domain\/12/);
});

test("code-only sparse saves accept an authoritative concurrent mode and normalize sent fragments like native HTTP", async (t) => {
  const f = await fixture(t);
  await f.open(page({ loading_summary: summary({ mode: "custom" }) }));
  const head = "<style>p{opacity:.9}</style>";
  await f.input("head", " \t" + head + "\n ");
  f.button("save_changes").click();
  await settle();
  assert.deepEqual(plain(f.writes[0].args[1]), { head: " \t" + head + "\n " });
  f.writes[0].resolve({
    data: reply(f.owner.value, {
      loading_summary: summary({ mode: "default", head_bytes: bytes(head) }),
    }),
  });
  await settle();
  assert.equal(f.owner.value.saved, true);
  assert.equal(
    f.owner.value.mode,
    "default",
    "omitted mode preserves another writer's saved choice",
  );
  assert.equal(f.owner.value.head, head);
  assert.equal(
    f.owner.value.body,
    "<p>Saved</p>",
    "an unsent source is not invented from metadata",
  );
  assert.equal(f.owner.value.dirty, false);
  const body = "\u00a0<p>Non-ASCII whitespace</p>\u00a0";
  const canonicalBody = "<p>Non-ASCII whitespace</p>";
  await f.choose(true);
  await f.input("body", body);
  f.button("save_changes").click();
  await settle();
  assert.deepEqual(plain(f.writes[1].args[1]), { mode: "custom", body });
  f.writes[1].resolve({
    data: reply(f.owner.value, {
      loading_summary: summary({
        mode: "custom",
        head_bytes: bytes(head),
        body_bytes: bytes(canonicalBody),
      }),
    }),
  });
  await settle();
  assert.equal(
    f.owner.value.body,
    canonicalBody,
    "native Laravel TrimStrings removes invisible Unicode edge characters",
  );
  assert.equal(f.owner.value.dirty, false);
});

test("component normalization matches the actual Laravel JSON request middleware for Unicode and visible edge characters", async (t) => {
  const f = await fixture(t);
  const invisible = [
    "\u00a0",
    "\u200b",
    "\u200c",
    "\u200d",
    "\u200f",
    "\u00ad",
    "\u034f",
    "\u061c",
    "\u0085",
    "\u2028",
    "\u2029",
    "\u{1d173}",
    "\u{e0020}",
  ];
  const samples = [
    "",
    " \t\n\r\v\0\f",
    " \t\n<p>ASCII edges</p>\r\v\0 ",
    ...invisible.map((mark) => mark + "<p>inside" + mark + "text</p>" + mark),
    "🛍️<p>Visible emoji</p>🛍️",
    "\u200d👩‍💻\u200f",
    "\u{e0021}<p>Non-space tag</p>\u{e007f}",
  ];
  // Run only Composer autoload and this real middleware against memory Requests: no app bootstrap, DB or shared state.
  const native = spawnSync(
    "php",
    [
      "-r",
      String.raw`
require 'vendor/autoload.php';
$samples = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
$middleware = new \App\Http\Middleware\TrimStrings();
$result = [];
foreach ($samples as $value) {
    $request = \Illuminate\Http\Request::create('/shops/7/domain/11/loading', 'POST', [], [], [], ['CONTENT_TYPE' => 'application/json'], json_encode(['head' => $value, 'body' => $value], JSON_THROW_ON_ERROR));
    $result[] = $middleware->handle($request, static fn ($cleaned) => [$cleaned->input('head'), $cleaned->input('body')]);
}
echo json_encode($result, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
`,
    ],
    {
      cwd: fileURLToPath(new URL("../../../../../Backend/", import.meta.url)),
      input: JSON.stringify(samples),
      encoding: "utf8",
      timeout: 10000,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    },
  );
  assert.equal(native.error, undefined);
  assert.equal(native.status, 0, native.stderr);
  assert.equal(native.stderr, "");
  const expected = JSON.parse(native.stdout);
  assert.equal(expected.length, samples.length);
  for (let index = 0; index < samples.length; index++) {
    assert.equal(expected[index][0], expected[index][1]);
    assert.equal(
      f.owner.value.normalized(samples[index]),
      expected[index][0],
      "native trim mismatch for " + JSON.stringify(samples[index]),
    );
  }
  assert.equal(f.reads.length, 0);
});

test("a requested mode contradiction is rejected even when the rest of the save reply is canonical", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.choose(true);
  f.owner.value.save();
  await settle();
  f.writes[0].resolve({
    data: reply(f.owner.value, {
      loading_summary: summary({ mode: "default" }),
    }),
  });
  await settle();
  assert.equal(f.owner.value.mode, "custom");
  assert.equal(f.owner.value.dirty, true);
  assert.equal(f.owner.value.saved, false);
  assert.match(f.owner.value.error, /save_failed/);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
});

test("stale POSTs and revoked edit eligibility never acknowledge the old draft", async (t) => {
  const f = await fixture(t);
  await f.open();
  await f.choose(true);
  f.owner.value.save();
  await settle();
  const old = f.writes[0],
    data = reply(f.owner.value);
  f.props.item = item({ domain: { id: 12 } });
  await settle();
  old.resolve({ data });
  await settle();
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
  assert.equal(f.owner.value.busy, true);
  f.reads.at(-1).resolve({ data: page() });
  await settle();
  await f.choose(true);
  f.owner.value.save();
  await settle();
  const pending = f.writes.at(-1),
    current = reply(f.owner.value, { domain: { id: 12 } });
  f.props.readOnly = true;
  await settle();
  pending.resolve({ data: current });
  await settle();
  assert.equal(f.owner.value.saving, false);
  assert.equal(f.owner.value.dirty, true);
  assert.equal(f.events.filter(([name]) => name === "saved").length, 0);
});

test("unmount invalidates late source and save responses without saved events or render warnings", async (t) => {
  const f = await fixture(t, { active: true });
  const owner = f.owner.value;
  f.unmount();
  f.reads[0].resolve({ data: page() });
  await settle();
  assert.equal(owner.loaded, false);
  const g = await fixture(t);
  await g.open();
  await g.choose(true);
  g.owner.value.save();
  await settle();
  const data = reply(g.owner.value);
  g.unmount();
  g.writes[0].resolve({ data });
  await settle();
  assert.equal(g.events.filter(([name]) => name === "saved").length, 0);
});

const pickButton = (f, id) =>
  f.root().querySelector("#" + f.owner.value.fieldId("sample", id));
const emptyPage = () =>
  page({
    code: { head: "", body: "" },
    loading_summary: summary({ head_bytes: 0, body_bytes: 0, has_code: false }),
  });

test("samples are tiny inert HTML/CSS that pass the API validation, respect reduced motion and escape shop text", async (t) => {
  const f = await fixture(t, { shop: { id: 7, title: 'Tom & "Jerry" <b>' } });
  await f.open();
  const samples = f.owner.value.samples;
  assert.deepEqual(plain(samples.map((sample) => sample.id)), [
    "pulse",
    "ring",
    "bar",
    "skeleton",
    "bag",
    "midnight",
  ]);
  for (const sample of samples) {
    const code = sample.head + sample.body;
    assert.equal(f.owner.value.validateCode(sample.head, 15360), "");
    assert.equal(f.owner.value.validateCode(sample.body, 3072), "");
    assert(bytes(code) < 3072, sample.id + " stays under 3 KB");
    assert.match(sample.head, /@media \(prefers-reduced-motion: reduce\)/);
    assert.doesNotMatch(
      code,
      /<script|<link|<img|<iframe|@import|url\(|https?:|\bsrc=/i,
    );
    assert.match(sample.body, /role="status"/);
    assert.doesNotMatch(code, /\{\{|<b>/);
    // The API trims fragments; untrimmed samples would stop matching after a save.
    assert.equal(sample.head.trim(), sample.head);
    assert.equal(sample.body.trim(), sample.body);
  }
  assert.match(samples[0].body, /Tom &#38; &#34;Jerry&#34; &#60;b&#62;/);
  assert.match(samples[1].body, />global\.commons\.loading…</);
});

test("picking a sample fills both fragments, marks it current and swaps unmodified samples without asking", async (t) => {
  const f = await fixture(t, { shop: { id: 7, title: "Rocketlox" } });
  await f.open(emptyPage());
  await f.choose(true);
  const frames = [
    ...f.root().querySelectorAll(".b-domain-loading__thumb iframe"),
  ];
  assert.equal(frames.length, 6);
  for (const frame of frames) {
    // Even trusted samples get no scripts and no same-origin access.
    assert.equal(frame.getAttribute("sandbox"), "");
    assert.match(
      frame.getAttribute("srcdoc"),
      /^<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none';/,
    );
    assert.match(frame.getAttribute("srcdoc"), /animation-play-state:paused/);
  }
  pickButton(f, "pulse").click();
  await settle();
  const pulse = f.owner.value.samples[0];
  const [head, body] = f.root().querySelectorAll("textarea");
  assert.equal(head.value, pulse.head);
  assert.equal(body.value, pulse.body);
  assert.equal(
    f.root().querySelector(".b-domain-loading__lines").textContent,
    pulse.head
      .split("\n")
      .map((_, index) => index + 1)
      .join("\n"),
  );
  assert.equal(pickButton(f, "pulse").getAttribute("aria-pressed"), "true");
  assert.equal(pickButton(f, "ring").getAttribute("aria-pressed"), "false");
  assert.equal(f.root().querySelector(".b-domain-loading__replace"), null);
  pickButton(f, "pulse").dispatchEvent(new dom.window.Event("mouseenter"));
  await settle();
  assert.doesNotMatch(frames[0].getAttribute("srcdoc"), /animation-play-state/);
  pickButton(f, "pulse").dispatchEvent(new dom.window.Event("mouseleave"));
  pickButton(f, "ring").click();
  await settle();
  assert.equal(f.owner.value.currentSampleId, "ring");
  assert.equal(f.owner.value.pendingSample, null);
  const ring = f.owner.value.samples[1];
  f.button("save_changes").click();
  await settle();
  assert.deepEqual(plain(f.writes[0].args), [
    "/shops/7/domain/11/loading",
    { mode: "custom", head: ring.head, body: ring.body },
  ]);
});

test("a sample never silently replaces custom code: cancel keeps it, replace swaps it and discard restores it", async (t) => {
  const f = await fixture(t);
  const saved = { head: "<style>p{color:red}</style>", body: "<p>Mine</p>" };
  await f.open(
    page({
      code: saved,
      loading_summary: summary({
        mode: "custom",
        head_bytes: bytes(saved.head),
        body_bytes: bytes(saved.body),
      }),
    }),
  );
  pickButton(f, "bag").click();
  await settle();
  const notice = f.root().querySelector(".b-domain-loading__replace");
  assert.equal(notice.getAttribute("role"), "alert");
  assert.equal(dom.window.document.activeElement, notice);
  assert.deepEqual(
    [f.owner.value.head, f.owner.value.body],
    [saved.head, saved.body],
  );
  f.button("global.actions.cancel").click();
  await settle();
  assert.equal(f.root().querySelector(".b-domain-loading__replace"), null);
  assert.equal(dom.window.document.activeElement, pickButton(f, "bag"));
  assert.equal(f.owner.value.dirty, false);
  pickButton(f, "bag").click();
  await settle();
  f.button("domains_modern.loading.replace").click();
  await settle();
  assert.equal(f.owner.value.currentSampleId, "bag");
  assert.equal(f.owner.value.dirty, true);
  assert.equal(dom.window.document.activeElement, pickButton(f, "bag"));
  // An edited sample is the merchant's own code again.
  await f.input("body", f.owner.value.body + "<p>Edited</p>");
  pickButton(f, "pulse").click();
  await settle();
  assert.equal(f.owner.value.pendingSample, "pulse");
  f.button("discard").click();
  await settle();
  assert.equal(f.owner.value.pendingSample, null);
  assert.deepEqual(
    [f.owner.value.head, f.owner.value.body],
    [saved.head, saved.body],
  );
  pickButton(f, "pulse").click();
  await settle();
  f.props.item = item({ domain: { id: 12 } });
  await settle();
  assert.equal(f.owner.value.pendingSample, null);
  assert.equal(f.writes.length, 0);
});

test("Show preview renders the current draft only inside the storefront's sandboxed loading document", async (t) => {
  const f = await fixture(t);
  await f.open(emptyPage());
  await f.choose(true);
  const preview = () => f.button("domains_modern.loading.preview");
  assert.equal(preview().disabled, true);
  const body = f.root().querySelectorAll("textarea")[1];
  assert.equal(body.getAttribute("aria-invalid"), "true");
  const described = body.getAttribute("aria-describedby").split(" ");
  assert.equal(described.length, 2);
  assert.equal(
    dom.window.document.getElementById(described[1]).getAttribute("role"),
    "alert",
  );
  assert.equal(
    f.root().querySelector(`label[for="${body.id}"]`).textContent,
    "domains_modern.loading.body",
  );
  const head =
    '<style>p{color:red}</style><script>parent.document.title="owned"</script>';
  const draft = '<p>Draft "quoted" & </iframe><img src=x onerror=alert(1)></p>';
  await f.input("head", head);
  await f.input("body", draft);
  preview().click();
  await settle();
  const frame = f.root().querySelector('[role="dialog"] iframe');
  assert.equal(frame.getAttribute("sandbox"), "allow-scripts");
  assert.equal(frame.getAttribute("referrerpolicy"), "no-referrer");
  assert.equal(
    frame.getAttribute("srcdoc"),
    `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline' https:; img-src https:; font-src https:; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'"><meta name="referrer" content="no-referrer"><meta name="viewport" content="width=device-width, initial-scale=1">${head}</head><body>${draft}</body></html>`,
  );
  // The draft never becomes dashboard DOM.
  assert.equal(f.root().querySelector("script,img,object"), null);
  assert(f.root().querySelector(".b-domain-loading__screen--desktop iframe"));
  f.owner.value.device = "phone";
  await settle();
  assert(f.root().querySelector(".b-domain-loading__screen--phone iframe"));
  f.button("dismiss-dialog").click();
  await settle();
  assert.equal(f.root().querySelector('[role="dialog"]'), null);
  assert.equal(dom.window.document.activeElement, preview());
  preview().click();
  await settle();
  assert(f.root().querySelector('[role="dialog"] iframe'));
  f.props.item = item({ domain: { id: 12 } });
  await settle();
  assert.equal(f.root().querySelector('[role="dialog"]'), null);
  assert.equal(f.writes.length, 0);
});

test("read-only staff can preview saved custom code without samples or save actions", async (t) => {
  const f = await fixture(t, { readOnly: true });
  const saved = { head: "", body: "<p>Saved</p>" };
  await f.open(
    page({
      code: saved,
      loading_summary: summary({
        mode: "custom",
        body_bytes: bytes(saved.body),
      }),
    }),
  );
  assert.equal(f.root().querySelector(".b-domain-loading__samples"), null);
  assert.equal(f.button("save_changes"), undefined);
  f.button("domains_modern.loading.preview").click();
  await settle();
  assert.match(
    f.root().querySelector('[role="dialog"] iframe').getAttribute("srcdoc"),
    /<body><p>Saved<\/p><\/body>/,
  );
  assert.equal(f.writes.length, 0);
});
