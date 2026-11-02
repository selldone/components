import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";
import { renderToString } from "@vue/server-renderer";
import PrettyModule from "vue-json-pretty";

const JsonViewer = PrettyModule.default || PrettyModule;

const filename = new URL("./BResourceMetadata.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
assert.deepEqual(errors, []);
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const script = transpile(descriptor.script.content);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "resource-metadata-test",
  transformAssetUrls: { includeAbsolute: true },
});
assert.deepEqual(template.errors, []);
const output = {};
vm.runInNewContext(transpile(template.code), {
  exports: output,
  require: (name) => {
    assert.equal(name, "vue");
    return { ...Vue, resolveComponent: (name) => name };
  },
});
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const response = (field, value) => ({
  data: { success: true, [field]: value },
});
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

// All reads and writes use synthetic deferred transports; this file never contacts an API.
function fixture(props = {}) {
  const requests = [],
    events = [],
    exports = {};
  const request = (method, url, body) => {
    const pending = { method, url, body, ...deferred() };
    requests.push(pending);
    return pending.promise;
  };
  vm.runInNewContext(script, {
    exports,
    TextEncoder,
    require(name) {
      assert.ok(
        name === "vue-json-pretty" || name === "vue-json-pretty/lib/styles.css",
        name,
      );
      return { default: JsonViewer };
    },
    axios: {
      get: (url) => request("GET", url),
      put: (url, body) => request("PUT", url, body),
    },
    window: {
      API: { selldone_api_url: "https://dashboard-api.example.test/api" },
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    shop: { id: 42 },
    resource: { id: 31 },
    resourceType: "products",
    readOnly: false,
    active: true,
    parentBusy: false,
    $t: (key) => key,
    $emit: (event, value) => events.push({ event, ...plain(value) }),
    ...props,
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  const seed = (field, value) => state.accept(state.entries[field], value);
  const load = async (field, value) => {
    const pending = state.load(field);
    requests.at(-1).resolve(response(field, value));
    await pending;
  };
  return { component, state, requests, events, seed, load };
}

function rendered(state) {
  const root = output.render(state, []),
    elements = [];
  function visit(node) {
    if (Array.isArray(node)) return node.forEach(visit);
    if (!node || typeof node !== "object") return;
    if (typeof node.type === "string") elements.push(node);
    if (
      node.children &&
      !Array.isArray(node.children) &&
      typeof node.children === "object"
    ) {
      for (const slot of Object.values(node.children))
        if (typeof slot === "function") visit(slot());
    } else visit(node.children);
  }
  visit(root);
  return elements;
}
const hasClass = (element, name) =>
  Vue.normalizeClass(element.props?.class).split(/\s+/).includes(name);
const content = (element) => {
  if (Array.isArray(element)) return element.map(content).join("");
  if (typeof element === "string") return element;
  if (!element || typeof element !== "object") return "";
  if (
    element.children &&
    !Array.isArray(element.children) &&
    typeof element.children === "object"
  )
    return Object.values(element.children)
      .filter((slot) => typeof slot === "function")
      .map((slot) => content(slot()))
      .join("");
  return content(element.children);
};

function edit(
  h,
  field = "public_attributes",
  value = { original: true },
  draft = '{"updated":true}',
) {
  h.state.selected = field;
  h.seed(field, value);
  h.state.edit();
  h.state.entry.draft = draft;
}

test("The real SFC template and scoped SCSS compile with production asset transforms", async () => {
  const style = await compileStyleAsync({
    source: descriptor.styles[0].content,
    filename: filename.pathname,
    id: "resource-metadata-test",
    scoped: true,
    preprocessLang: "scss",
  });
  assert.deepEqual(style.errors, []);
  assert.ok(style.code.includes(".b-resource-metadata"));
});

test("The mounted SFC renders stored markup safely through the actual JSON viewer", async () => {
  const h = fixture({ active: false });
  const runtime = {};
  vm.runInNewContext(transpile(template.code), {
    exports: runtime,
    require: (name) => {
      assert.equal(name, "vue");
      return Vue;
    },
  });
  const unsafe = '<img src="synthetic" onerror="alert(1)">';
  const app = Vue.createSSRApp(
    {
      ...h.component,
      render: runtime.render,
      created() {
        this.accept(this.entry, { markup: unsafe });
      },
    },
    {
      shop: { id: 42 },
      resource: { id: 31 },
      resourceType: "products",
      active: false,
      readOnly: true,
    },
  );
  const slotStub = Vue.defineComponent({
    setup:
      (props, { attrs, slots }) =>
      () =>
        Vue.h("span", attrs, slots.default?.()),
  });
  for (const name of [
    "VBtn",
    "VIcon",
    "VTextarea",
    "VProgressLinear",
    "VProgressCircular",
  ])
    app.component(name, slotStub);
  app.config.globalProperties.$t = (key) => key;
  const warnings = [],
    failures = [];
  app.config.warnHandler = (message) => warnings.push(message);
  app.config.errorHandler = (error) => failures.push(error);
  const html = await renderToString(app);
  assert.ok(html.includes("&lt;img"), "Stored markup is readable escaped text");
  assert.equal(
    /<img\b/i.test(html),
    false,
    "Metadata cannot become executable HTML",
  );
  assert.deepEqual(warnings, []);
  assert.deepEqual(failures, []);
  assert.deepEqual(h.requests, []);
});

test("Metadata reads use the configured dashboard API and one authorized resource field", async () => {
  const h = fixture();
  for (const field of ["public_attributes", "private_attributes", "ai_agent"]) {
    const pending = h.state.load(field);
    assert.equal(h.state.busy, true);
    assert.equal(
      h.requests.at(-1).url,
      `https://dashboard-api.example.test/api/shops/42/products/31/${field}`,
    );
    assert.equal(h.requests.at(-1).method, "GET");
    h.requests.at(-1).resolve(response(field, { nested: { value: field } }));
    await pending;
    assert.equal(h.state.entries[field].loaded, true);
    assert.equal(h.state.entries[field].value.nested.value, field);
  }
  const before = h.requests.length;
  await h.state.load("meta");
  assert.equal(
    h.state.entries.meta.loaded,
    false,
    "Missing system metadata is unavailable, not fabricated empty JSON",
  );
  h.state.resource.meta = { system: "synthetic" };
  await h.state.load("meta");
  assert.equal(h.state.entries.meta.loaded, true);
  assert.equal(
    h.requests.length,
    before,
    "System metadata only uses the authorized resource projection",
  );
  for (const field of ["unknown", "__proto__", "constructor"])
    await h.state.load(field);
  assert.equal(h.requests.length, before);
});

test("Successful null and empty metadata remain distinct from unavailable or failed reads", async () => {
  for (const value of [null, {}, []]) {
    const h = fixture();
    await h.load("public_attributes", value);
    assert.equal(h.state.entry.loaded, true);
    assert.equal(h.state.empty, true);
    const elements = rendered(h.state);
    assert.ok(
      elements.some((element) =>
        hasClass(element, "b-resource-metadata__empty"),
      ),
    );
    assert.equal(
      elements.some((element) =>
        content(element).includes("resource_metadata.unavailable"),
      ),
      false,
    );
  }
  for (const result of [
    { data: { success: true } },
    { data: { success: false } },
    { data: { success: true, public_attributes: undefined } },
  ]) {
    const h = fixture();
    const pending = h.state.load("public_attributes");
    h.requests[0].resolve(result);
    await pending;
    assert.equal(h.state.entry.loaded, false);
    assert.equal(h.state.entry.error, true);
    assert.ok(
      rendered(h.state).some((element) =>
        content(element).includes("resource_metadata.load_error"),
      ),
    );
    assert.equal(
      rendered(h.state).some((element) =>
        hasClass(element, "b-resource-metadata__empty"),
      ),
      false,
    );
  }
});

test("Public and Private saves verify the snapshot and PUT only the selected column", async () => {
  for (const [field, draft, expected] of [
    [
      "public_attributes",
      '{"badge":"Custom","image":"/files/example.webp"}',
      { badge: "Custom", image: "/files/example.webp" },
    ],
    [
      "private_attributes",
      '[{"step":"review","done":false}]',
      [{ step: "review", done: false }],
    ],
    ["public_attributes", "null", null],
  ]) {
    const h = fixture();
    edit(h, field, { original: true }, draft);
    const pending = h.state.save();
    assert.equal(h.state.saving, true);
    assert.equal(
      h.requests.length,
      1,
      "No PUT before checking the saved snapshot",
    );
    assert.equal(h.requests[0].method, "GET");
    h.requests[0].resolve(response(field, { original: true }));
    await settle();
    assert.equal(h.requests[1].method, "PUT");
    assert.equal(h.requests[1].url, h.requests[0].url);
    assert.deepEqual(plain(h.requests[1].body), { [field]: expected });
    h.requests[1].resolve(response(field, expected));
    await pending;
    assert.equal(h.state.saving, false);
    assert.equal(h.state.entry.editing, false);
    assert.equal(h.state.entry.saved, true);
    assert.deepEqual(plain(h.state.entry.value), expected);
    assert.deepEqual(h.events, [{ event: "saved", field, value: expected }]);
  }
});

test("Malformed, scalar and oversized JSON cannot reach any request", async () => {
  for (const draft of [
    "{",
    '"plain text"',
    "42",
    "false",
    '{"text":"' + "a".repeat(65536) + '"}',
    '{"text":"' + "ا".repeat(32768) + '"}',
  ]) {
    const h = fixture();
    edit(h, "public_attributes", {}, draft);
    assert.ok(h.state.validation.error);
    await h.state.save();
    assert.deepEqual(h.requests, []);
    assert.equal(h.state.entry.draft, draft);
  }
});

test("AI Agent and Selldone metadata remain read-only even for a writable merchant", async () => {
  for (const readOnly of [true, false]) {
    for (const field of ["ai_agent", "meta"]) {
      const h = fixture({ readOnly });
      edit(h, field);
      h.state.entry.editing = true;
      assert.equal(h.state.canEdit, false);
      await h.state.save();
      assert.deepEqual(h.requests, []);
      const elements = rendered(h.state);
      assert.ok(
        elements.some((element) =>
          content(element).includes("resource_metadata.readonly"),
        ),
      );
      assert.equal(
        elements.some((element) =>
          hasClass(element, "sd-modern-button--primary"),
        ),
        false,
      );
      assert.equal(
        elements.some((element) => element.type === "v-textarea"),
        false,
      );
    }
  }
  const h = fixture({ readOnly: true });
  edit(h);
  assert.equal(h.state.entry.editing, false);
  await h.state.save();
  assert.deepEqual(h.requests, []);
});

test("Drafts survive sub-tab and inactive visits, failed saves, and ignored refreshes", async () => {
  const h = fixture();
  edit(h, "public_attributes", { original: true }, '{"custom":"unsaved"}');
  const draft = h.state.entry.draft;
  h.state.active = false;
  await h.state.save();
  h.state.active = true;
  h.component.watch.active.call(h.state, true);
  h.state.selected = "private_attributes";
  h.seed("private_attributes", { internal: true });
  h.state.selected = "public_attributes";
  h.component.watch.selected.call(h.state, "public_attributes");
  await h.state.load("public_attributes");
  assert.deepEqual(
    h.requests,
    [],
    "Returning to or refreshing a local draft cannot overwrite it",
  );
  assert.equal(h.state.entry.draft, draft);
  const pending = h.state.save();
  h.requests[0].resolve(response("public_attributes", { original: true }));
  await settle();
  h.requests[1].reject(new Error("Synthetic connection failure"));
  await pending;
  assert.equal(h.state.entry.draft, draft);
  assert.equal(h.state.entry.editing, true);
  assert.equal(h.state.entry.saveError, "resource_metadata.save_error");
  assert.equal(h.state.saving, false);
  assert.deepEqual(h.events, []);
});

test("Snapshot conflicts block PUT and keep the draft until explicit discard and reload", async () => {
  const h = fixture();
  edit(h);
  const draft = h.state.entry.draft;
  const pending = h.state.save();
  h.requests[0].resolve(
    response("public_attributes", { changed: "elsewhere" }),
  );
  await pending;
  assert.equal(h.requests.length, 1);
  assert.equal(h.state.entry.conflict, true);
  assert.equal(h.state.entry.saveError, "resource_metadata.conflict");
  assert.equal(h.state.entry.draft, draft);
  await h.state.save();
  assert.equal(
    h.requests.length,
    1,
    "A known conflict cannot be retried over newer values",
  );
  h.state.discard();
  assert.equal(h.state.entry.editing, false);
  assert.equal(h.requests[1].method, "GET");
  h.requests[1].resolve(
    response("public_attributes", { changed: "elsewhere" }),
  );
  await settle();
  assert.equal(h.state.entry.conflict, false);
  assert.equal(h.state.entry.value.changed, "elsewhere");
});

test("A same-scope refresh keeps loaded JSON visible and overlays one progress indicator", async () => {
  const h = fixture();
  h.seed("public_attributes", { label: "Loaded value" });
  const pending = h.state.load("public_attributes");
  const elements = rendered(h.state);
  assert.equal(h.state.entry.loaded, true);
  assert.equal(h.state.entry.value.label, "Loaded value");
  assert.equal(
    elements.filter((element) => element.type === "v-progress-linear").length,
    1,
  );
  assert.equal(
    elements.some((element) => element.type === "vue-json-pretty"),
    true,
  );
  assert.equal(
    elements.some((element) => hasClass(element, "b-resource-metadata__state")),
    false,
  );
  h.requests[0].resolve(
    response("public_attributes", { label: "Refreshed value" }),
  );
  await pending;
  assert.equal(h.state.entry.value.label, "Refreshed value");
  assert.equal(h.state.busy, false);
});

test("Scope changes clear prior values and drafts and ignore stale GET completions", async () => {
  for (const changed of ["shop", "resource", "resourceType"]) {
    const h = fixture();
    h.seed("public_attributes", { old: "public" });
    h.state.selected = "private_attributes";
    const pending = h.state.load("private_attributes");
    if (changed === "shop") h.state.shop = { id: 43 };
    if (changed === "resource") h.state.resource = { id: 32 };
    if (changed === "resourceType") h.state.resourceType = "discount-codes";
    h.component.watch.scope.handler.call(h.state);
    assert.equal(h.state.entries.public_attributes.loaded, false);
    assert.equal(h.state.entry.draft, "");
    h.requests[0].resolve(response("private_attributes", { old: "private" }));
    await pending;
    assert.equal(h.state.entry.loaded, false);
    assert.equal(h.state.entry.value, null);
    h.requests[1].resolve(response("private_attributes", { current: true }));
    await settle();
    assert.equal(h.state.entry.value.current, true);
    assert.equal(h.state.busy, false);
  }
});

test("Permission reset and denied reads erase all cached metadata and ignore old responses", async () => {
  for (const status of [401, 403, 404]) {
    const h = fixture();
    h.seed("private_attributes", { synthetic: "private" });
    h.state.entries.private_attributes.draft = '{"synthetic":"draft"}';
    const pending = h.state.load("public_attributes");
    h.requests[0].reject({ response: { status } });
    await pending;
    assert.equal(h.state.entries.private_attributes.loaded, false);
    assert.equal(h.state.entries.private_attributes.draft, "");
    assert.equal(h.state.entry.error, true);
    assert.equal(h.state.busy, false);
  }
  const h = fixture();
  edit(h);
  h.state.readOnly = true;
  h.component.watch.readOnly.call(h.state);
  assert.equal(h.state.entry.draft, "");
  assert.equal(h.state.entry.editing, false);
  h.requests[0].resolve(
    response("public_attributes", { current: "read-only" }),
  );
  await settle();
  assert.equal(h.state.canEdit, false);
  await h.state.save();
  assert.equal(h.requests.length, 1);
});

test("Denied save checks or writes erase cached private values without emitting saved data", async () => {
  for (const phase of ["preflight", "put"]) {
    const h = fixture();
    edit(h);
    h.seed("private_attributes", { synthetic: "internal-only" });
    const pending = h.state.save();
    if (phase === "put") {
      h.requests[0].resolve(response("public_attributes", { original: true }));
      await settle();
      assert.equal(h.requests[1].method, "PUT");
    }
    h.requests.at(-1).reject({ response: { status: 403 } });
    await pending;
    assert.equal(h.state.entry.error, true);
    assert.equal(h.state.entry.loaded, false);
    assert.equal(h.state.entry.draft, "");
    assert.equal(h.state.entries.private_attributes.value, null);
    assert.equal(h.state.entries.private_attributes.loaded, false);
    assert.equal(h.state.saving, false);
    assert.deepEqual(h.events, []);
  }
});

test("Stale preflight and PUT completions cannot update another resource or emit saved values", async () => {
  for (const phase of ["preflight", "put", "unmounted"]) {
    const h = fixture();
    edit(h);
    const pending = h.state.save();
    if (phase !== "preflight") {
      h.requests[0].resolve(response("public_attributes", { original: true }));
      await settle();
      assert.equal(h.requests[1].method, "PUT");
    }
    if (phase === "unmounted") h.component.beforeUnmount.call(h.state);
    else {
      h.state.resource = { id: 32 };
      h.component.watch.scope.handler.call(h.state);
      assert.equal(h.state.entry.value, null);
      assert.equal(h.state.entry.draft, "");
    }
    if (phase === "preflight")
      h.requests[0].resolve(response("public_attributes", { original: true }));
    else
      h.requests[1].resolve(response("public_attributes", { updated: true }));
    await pending;
    assert.deepEqual(h.events, []);
    if (phase !== "unmounted") {
      assert.equal(h.state.entry.loaded, false);
      assert.equal(h.state.entry.value, null);
      const read = h.requests.at(-1);
      assert.equal(read.method, "GET");
      assert.ok(read.url.includes("/products/32/"));
      read.resolve(response("public_attributes", { current: "resource" }));
      await settle();
      assert.equal(h.state.entry.value.current, "resource");
    }
    assert.equal(
      h.requests.filter((request) => request.method === "PUT").length,
      phase === "preflight" ? 0 : 1,
    );
  }
});

test("Inactive, unavailable and parent-busy resources cannot start reads or saves", async () => {
  for (const props of [
    { active: false },
    { shop: null },
    { resource: null },
    { resourceType: "../products" },
  ]) {
    const h = fixture(props);
    await h.state.load("public_attributes");
    await h.state.save();
    assert.deepEqual(h.requests, []);
  }
  const h = fixture({ parentBusy: true });
  edit(h);
  h.state.entry.editing = true;
  await h.state.save();
  assert.deepEqual(h.requests, []);
});
