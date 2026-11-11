import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import numeral from "numeral";
import ts from "typescript";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const file = new URL("./BProductFileUploader.vue", import.meta.url);
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const dictionaries = Object.fromEntries(
  ["en", "fa"].map((locale) => {
    const exports = {};
    vm.runInNewContext(
      transpile(
        readFileSync(
          new URL(
            `../../../../../../translate/dashboard/${locale}.ts`,
            import.meta.url,
          ),
          "utf8",
        ),
      ),
      { exports },
    );
    return [locale, exports.default];
  }),
);
const translate = (locale, key, values = {}) => {
  const text = key
    .split(".")
    .reduce((value, part) => value?.[part], dictionaries[locale]);
  assert.equal(typeof text, "string", `Missing ${locale} copy: ${key}`);
  return text.replace(/\{(\w+)\}/g, (_, name) => values[name]);
};
const palette = { exports: {} };
vm.runInNewContext(
  transpile(
    readFileSync(
      new URL(
        "../../../../../ui/chart/donut-leader/donutSlices.ts",
        import.meta.url,
      ),
      "utf8",
    ),
  ),
  palette,
);
const node = (type, text = "") => ({
  type,
  text,
  props: {},
  style: {},
  children: [],
  parent: null,
});
const renderer = Vue.createRenderer({
  createElement: (type) => node(type),
  createText: (value) => node("text", value),
  createComment: (value) => node("comment", value),
  insert(child, parent, anchor = null) {
    if (child.parent)
      child.parent.children.splice(child.parent.children.indexOf(child), 1);
    parent.children.splice(
      anchor ? parent.children.indexOf(anchor) : parent.children.length,
      0,
      child,
    );
    child.parent = parent;
  },
  remove(child) {
    if (child.parent)
      child.parent.children.splice(child.parent.children.indexOf(child), 1);
  },
  setText(child, value) {
    child.text = value;
  },
  setElementText(child, value) {
    child.text = value;
    child.children = [];
  },
  patchProp(child, key, previous, next) {
    child.props[key] = next;
  },
  parentNode: (child) => child.parent,
  nextSibling: (child) =>
    child.parent?.children[child.parent.children.indexOf(child) + 1] || null,
});
const all = (root, predicate) => [
  ...(predicate(root) ? [root] : []),
  ...root.children.flatMap((child) => all(child, predicate)),
];
const text = (root) => root.text + root.children.map(text).join("");
const record = (id, status, patch = {}) => ({
  id,
  name: `file-${id}.pdf`,
  size: 1000,
  sent: 250,
  progress: 25,
  speed: null,
  eta: null,
  history: [],
  attempts: [],
  status,
  errorKey: null,
  canRetry: false,
  canDismiss: false,
  completedOrder: null,
  ...patch,
});

function load(createQueue, browser) {
  const { descriptor, errors } = parse(readFileSync(file, "utf8"), {
    filename: fileURLToPath(file),
  });
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: fileURLToPath(file),
    id: "product-file-uploader",
    transformAssetUrls: { includeAbsolute: true },
    compilerOptions: { hoistStatic: false },
  });
  assert.deepEqual(template.errors, []);
  const context = {
    exports: {},
    console,
    Number,
    Function,
    window: browser,
    require(name) {
      if (name === "vue")
        return {
          ...Vue,
          TransitionGroup: {
            props: ["tag"],
            inheritAttrs: false,
            setup:
              (props, { attrs, slots }) =>
              () =>
                Vue.h(props.tag || "div", attrs, slots.default?.()),
          },
        };
      if (name === "numeral") return { default: numeral };
      if (name.includes("ProductFileUploadQueue"))
        return {
          createProductFileUploadQueue: createQueue,
          PRODUCT_FILE_UPLOAD_COUNT_LIMIT: 20,
        };
      if (name.endsWith("donutSlices")) return palette.exports;
      if (name === "@selldone/core-js/utils")
        return {
          FileHelper: { GetFileExtensionImage: () => "/fixture-file.svg" },
        };
      throw new Error(`Unexpected uploader dependency: ${name}`);
    },
  };
  vm.runInNewContext(
    transpile(descriptor.script.content + "\n" + template.code),
    context,
  );
  return {
    component: { ...context.exports.default, render: context.exports.render },
    descriptor,
  };
}

async function fixture(t, initial = [], patch = {}, locale = "en") {
  const records = Vue.reactive(initial),
    calls = [],
    emitted = [],
    errors = [],
    warnings = [];
  let options,
    instance,
    rejected = [];
  const { reducedMotion = false, ...propPatch } = patch;
  const queue = {
    records,
    add(files, limits) {
      calls.push(["add", files, limits]);
      return { added: [], rejected };
    },
    cancel(id) {
      calls.push(["cancel", id]);
    },
    retry(id) {
      calls.push(["retry", id]);
    },
    dismiss(id) {
      calls.push(["dismiss", id]);
    },
    clearCompleted() {
      calls.push(["clear"]);
      records.splice(
        0,
        records.length,
        ...records.filter((row) => row.status !== "done"),
      );
      options.onChange(records);
    },
    dispose() {
      calls.push(["dispose"]);
      options.onChange([]);
    },
  };
  const { component, descriptor } = load(
    (value) => {
      options = value;
      return queue;
    },
    { matchMedia: () => ({ matches: reducedMotion }) },
  );
  const props = Vue.reactive({
    authorize: () => Promise.resolve({ fixture: true }),
    confirm: () => Promise.resolve(true),
    recover: () => Promise.resolve({ kind: "available" }),
    maxFileBytes: 2000000,
    availableBytes: 8000000,
    existingFiles: [{ id: "91", name: "existing.pdf" }],
    disabled: false,
    ...propPatch,
  });
  const renderedComponent = {
    ...component,
    render(...args) {
      instance = this;
      return component.render.apply(this, args);
    },
  };
  const app = renderer.createApp({
    render: () =>
      Vue.h(renderedComponent, {
        ...props,
        onChange: (value) => emitted.push(value),
        onRemovePending: (value) => calls.push(["remove-pending", value]),
      }),
  });
  app.config.globalProperties.$t = (key, values) =>
    translate(locale, key, values);
  app.config.errorHandler = (error) => errors.push(error);
  app.config.warnHandler = (warning) => warnings.push(warning);
  app.component("VBtn", {
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("button", attrs, slots.default?.()),
  });
  app.component("VIcon", {
    inheritAttrs: false,
    setup:
      (_, { attrs, slots }) =>
      () =>
        Vue.h("icon", attrs, slots.default?.()),
  });
  app.component("VTooltip", {
    inheritAttrs: false,
    setup:
      (_, { slots, attrs }) =>
      () =>
        Vue.h("tooltip", attrs, [
          slots.activator?.({ props: {} }),
          slots.default?.(),
        ]),
  });
  app.component("VPagination", {
    inheritAttrs: false,
    setup:
      (_, { attrs }) =>
      () =>
        Vue.h("pagination", attrs),
  });
  const root = node("root");
  app.mount(root);
  await Vue.nextTick();
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
    assert.deepEqual(warnings, []);
  });
  return {
    root,
    props,
    records,
    calls,
    emitted,
    descriptor,
    options,
    queue,
    get state() {
      return instance;
    },
    reject: (value) => {
      rejected = value;
    },
    unmount,
    find: (predicate) => all(root, predicate)[0],
    all: (predicate) => all(root, predicate),
  };
}

test("every active and actionable row remains visible while only the three most recently confirmed rows remain", async (t) => {
  const active = [
    "queued",
    "authorizing",
    "uploading",
    "confirming",
    "error",
    "cancelled",
  ].map((status, index) => record(index + 1, status));
  const completed = [1, 5, 2, 4, 3].map((order, index) =>
    record(index + 20, "done", { completedOrder: order, progress: 100 }),
  );
  const f = await fixture(t, [...active, ...completed]);
  assert.equal(f.state.rows.length, 9);
  assert.deepEqual(
    Array.from(f.state.rows, (row) => row.id),
    [1, 2, 3, 4, 5, 6, 21, 23, 24],
  );
  assert.equal(f.state.completedPageCount, 2);
  assert.equal(f.state.activeCount, 4);
  assert.ok(!text(f.root).includes("file-20.pdf"));
  assert.ok(text(f.root).includes("file-1.pdf"));
  const before = JSON.stringify(f.props.existingFiles);
  f.find(
    (value) =>
      value.type === "button" &&
      text(value) ===
        translate("en", "product_file.modern.uploader.clear_completed"),
  ).props.onClick();
  await Vue.nextTick();
  assert.equal(f.records.length, 6);
  assert.equal(JSON.stringify(f.props.existingFiles), before);
});

test("the empty queue has localized inert artwork and no invented upload measurements", async (t) => {
  for (const locale of ["en", "fa"]) {
    const f = await fixture(t, [], {}, locale);
    const empty = f.find((value) =>
      String(value.props.class || "").includes(
        "b-product-file-uploader__empty",
      ),
    );
    assert.ok(empty);
    assert.ok(
      text(empty).includes(
        translate(locale, "product_file.modern.uploader.queue_empty"),
      ),
    );
    assert.ok(
      text(empty).includes(
        translate(locale, "product_file.modern.uploader.queue_empty_hint"),
      ),
    );
    const stage = all(
      empty,
      (value) => value.props["aria-hidden"] === "true",
    )[0];
    assert.ok(stage);
    assert.equal(
      all(stage, (value) => ["button", "input", "a"].includes(value.type))
        .length,
      0,
    );
    assert.ok(
      all(stage, (value) =>
        String(value.props.class || "").includes(
          "sd-modern-illustration__icon",
        ),
      ).length >= 2,
    );
    assert.equal(
      all(empty, (value) => value.props.role === "progressbar").length,
      0,
    );
    assert.deepEqual(f.calls, []);
  }
});

test("completed history pages keep all actionable rows, preserve the chosen page and clamp after clearing", async (t) => {
  const actionable = ["queued", "uploading", "error", "cancelled"].map(
    (status, index) => record(index + 1, status),
  );
  const completed = [1, 2, 3, 4, 5].map((order) =>
    record(order + 10, "done", { completedOrder: order }),
  );
  const f = await fixture(t, [...actionable, ...completed]);
  const pager = () => f.find((value) => value.type === "pagination");
  assert.equal(pager().props.length, 2);
  assert.deepEqual(
    Array.from(f.state.rows, (row) => row.id),
    [1, 2, 3, 4, 15, 14, 13],
  );
  pager().props["onUpdate:modelValue"](2);
  await Vue.nextTick();
  assert.deepEqual(
    Array.from(f.state.rows, (row) => row.id),
    [1, 2, 3, 4, 12, 11],
  );
  assert.ok(text(f.root).includes("4–5 of 5 completed uploads"));
  f.records.push(record(16, "done", { completedOrder: 6 }));
  await Vue.nextTick();
  assert.equal(f.state.completedPage, 2);
  assert.deepEqual(
    Array.from(f.state.rows, (row) => row.id),
    [1, 2, 3, 4, 13, 12, 11],
  );
  assert.ok(text(f.root).includes("4–6 of 6 completed uploads"));
  f.queue.clearCompleted();
  await Vue.nextTick();
  assert.equal(f.state.completedPage, 1);
  assert.equal(pager(), undefined);
  assert.deepEqual(
    Array.from(f.state.rows, (row) => row.id),
    [1, 2, 3, 4],
  );
});

test("native selection and drop pass current limits without fabricating requests and allow reselecting the same file", async (t) => {
  const f = await fixture(t);
  const selected = new File(["fixture"], "one.pdf");
  const event = { target: { files: [selected], value: "selected" } };
  f.state.pickedFiles(event);
  assert.equal(event.target.value, "");
  assert.equal(f.calls[0][1][0], selected);
  assert.equal(f.calls[0][2].maxFileBytes, 2000000);
  assert.equal(f.calls[0][2].availableBytes, 8000000);
  assert.equal(f.options.isFileAvailable(91), true);
  f.props.existingFiles = [];
  await Vue.nextTick();
  assert.equal(f.options.isFileAvailable(91), false);
  f.props.disabled = true;
  await Vue.nextTick();
  f.state.dropFiles({ dataTransfer: { files: [selected] } });
  assert.equal(f.calls.length, 1);
});

test("cancel, retry and dismiss controls call their actual controller operations and never dismiss active rows", async (t) => {
  const f = await fixture(t, [
    record(1, "uploading"),
    record(2, "error", {
      canRetry: true,
      canDismiss: true,
      errorKey: "network",
    }),
    record(3, "confirming"),
  ]);
  const buttons = (label) =>
    f.all(
      (value) =>
        value.type === "button" &&
        value.props["aria-label"] ===
          translate("en", `product_file.modern.uploader.${label}`),
    );
  assert.equal(buttons("cancel").length, 1);
  assert.equal(buttons("queue_remove").length, 1);
  buttons("cancel")[0].props.onClick();
  buttons("retry")[0].props.onClick();
  buttons("queue_remove")[0].props.onClick();
  assert.deepEqual(f.calls, [
    ["cancel", 1],
    ["retry", 2],
    ["dismiss", 2],
  ]);
});

test("every failed upload has labeled desktop Retry and a compact localized mobile action using the same safe recovery", async (t) => {
  const errorKeys = [
    "too_large",
    "capacity",
    "file_limit",
    "duplicate",
    "authorize",
    "unsupported",
    "expired",
    "pending_reservation",
    "network",
  ];
  const f = await fixture(t, [
    ...errorKeys.map((errorKey, index) =>
      record(index + 1, "error", { errorKey }),
    ),
    record(99, "cancelled", { errorKey: "cancelled_reservation" }),
  ]);
  const buttons = f.all(
    (value) =>
      value.type === "button" &&
      value.props["aria-label"] ===
        translate("en", "product_file.modern.uploader.retry"),
  );
  const desktop = buttons.filter((button) =>
    String(button.props.class)
      .split(" ")
      .includes("b-product-file-uploader__retry"),
  );
  const compact = buttons.filter((button) =>
    String(button.props.class)
      .split(" ")
      .includes("b-product-file-uploader__retry-icon"),
  );
  assert.equal(desktop.length, errorKeys.length + 1);
  assert.equal(compact.length, desktop.length);
  for (const button of desktop) {
    assert.equal(
      text(button),
      translate("en", "product_file.modern.uploader.retry"),
    );
    assert.equal(button.props["prepend-icon"], "refresh");
    assert.equal(button.props.icon, undefined);
    button.props.onClick();
  }
  for (const button of compact) {
    assert.equal(button.props.icon, "");
    assert.ok(button.props.class.includes("sd-modern-icon-button"));
    assert.equal(text(button), "refresh");
    assert.equal(
      button.parent.props.text,
      translate("en", "product_file.modern.uploader.retry"),
    );
    assert.equal(button.parent.props.location, "top");
    button.props.onClick();
  }
  assert.deepEqual(f.calls, [
    ...errorKeys.map((_, index) => ["retry", index + 1]),
    ["retry", 99],
    ...errorKeys.map((_, index) => ["retry", index + 1]),
    ["retry", 99],
  ]);
});

test("validation Retry opens native selection and validates the chosen file again without losing a cancelled selection", async (t) => {
  const f = await fixture(t);
  f.reject([{ name: "large.pdf", size: 9999999, errorKey: "too_large" }]);
  f.state.addFiles([new File(["fixture"], "large.pdf")]);
  await Vue.nextTick();
  const original = f.state.rows[0].id;
  let pickerOpens = 0;
  f.find((value) => value.type === "input").click = () => pickerOpens++;
  f.find(
    (value) =>
      value.type === "button" &&
      value.props["aria-label"] ===
        translate("en", "product_file.modern.uploader.retry"),
  ).props.onClick();
  assert.equal(pickerOpens, 1);
  assert.equal(
    f.state.rows[0].id,
    original,
    "opening or cancelling the picker preserves the failed row",
  );
  assert.ok(
    text(f.root).includes(
      translate("en", "product_file.modern.uploader.reselect_hint"),
    ),
  );
  f.reject([]);
  const picked = new File(["smaller fixture"], "small.pdf");
  f.state.pickedFiles({ target: { files: [picked], value: "selected" } });
  await Vue.nextTick();
  assert.equal(f.state.rejections.length, 0);
  assert.equal(f.calls.at(-1)[0], "add");
  assert.equal(f.calls.at(-1)[1][0], picked);
  assert.equal(f.calls.at(-1)[2].maxFileBytes, f.props.maxFileBytes);
});

test("pending recovery emits bounded metadata for parent confirmation and exposes a safe public retry method", async (t) => {
  const recovering = [],
    signal = new AbortController().signal;
  const f = await fixture(
    t,
    [
      record(1, "error", {
        fileId: 91,
        errorKey: "pending_reservation",
        canRetry: true,
      }),
    ],
    {
      recover: (...args) => {
        recovering.push(args);
        return Promise.resolve({ kind: "pending", fileItem: { id: 91 } });
      },
    },
  );
  const file = new File(["fixture"], "one.pdf");
  assert.equal((await f.options.recover(file, 91, signal)).kind, "pending");
  assert.deepEqual(recovering[0], [file, 91, signal]);
  f.find(
    (value) =>
      value.type === "button" &&
      text(value) ===
        translate("en", "product_file.modern.uploader.remove_incomplete"),
  ).props.onClick();
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls)), [
    ["remove-pending", { id: 1, fileId: 91, name: "file-1.pdf" }],
  ]);
  f.state.retryRecord(1);
  assert.deepEqual(f.calls.at(-1), ["retry", 1]);
  f.props.disabled = true;
  await Vue.nextTick();
  assert.equal(f.state.retryRecord(1), false);
  assert.equal(f.calls.length, 2);
});

test("queue height animation restarts from the current height and honors reduced motion", async (t) => {
  const f = await fixture(t),
    animations = [];
  const frame = f.find(
    (value) => value.props.class === "b-product-file-uploader__content-frame",
  );
  const body = f.find(
    (value) => value.props.class === "b-product-file-uploader__content-body",
  );
  frame.animate = (frames, options) => {
    const animation = {
      frames,
      options,
      cancelled: false,
      cancel() {
        this.cancelled = true;
      },
    };
    animations.push(animation);
    return animation;
  };
  body.getBoundingClientRect = () => ({ height: 240 });
  f.state.contentHeight = 140;
  f.state.animateContentHeight();
  assert.deepEqual(JSON.parse(JSON.stringify(animations[0].frames)), [
    { height: "140px" },
    { height: "240px" },
  ]);
  assert.equal(animations[0].options.duration, 220);
  assert.equal(frame.style.overflow, "hidden");
  f.state.contentHeight = 180;
  body.getBoundingClientRect = () => ({ height: 320 });
  f.state.animateContentHeight();
  assert.equal(animations[0].cancelled, true);
  assert.equal(animations[1].frames[0].height, "180px");
  animations[1].onfinish();
  assert.equal(frame.style.overflow, "");
  const reduced = await fixture(t, [], { reducedMotion: true });
  const reducedFrame = reduced.find(
    (value) => value.props.class === "b-product-file-uploader__content-frame",
  );
  const reducedBody = reduced.find(
    (value) => value.props.class === "b-product-file-uploader__content-body",
  );
  let called = false;
  reducedFrame.animate = () => {
    called = true;
  };
  reducedBody.getBoundingClientRect = () => ({ height: 320 });
  reduced.state.contentHeight = 140;
  reduced.state.animateContentHeight();
  assert.equal(called, false);
});

test("rejected files show localized bounded metadata and can leave the queue without deleting product files", async (t) => {
  const f = await fixture(t);
  f.reject([{ name: "too-big.pdf", size: 9999999, errorKey: "too_large" }]);
  f.state.addFiles([new File(["fixture"], "too-big.pdf")]);
  await Vue.nextTick();
  assert.match(text(f.root), /maximum allowed size/);
  assert.equal(f.state.rows.length, 1);
  f.state.dismiss(f.state.rows[0]);
  await Vue.nextTick();
  assert.equal(f.state.rows.length, 0);
  assert.equal(f.props.existingFiles.length, 1);
  assert.equal(f.calls.filter((call) => call[0] === "dismiss").length, 0);
});

test("cancellation guidance is passive and neutral while genuine transfer errors stay urgent", async (t) => {
  const f = await fixture(t, [
    record(1, "cancelled", {
      errorKey: "cancelled_reservation",
      canDismiss: true,
    }),
    record(2, "error", {
      errorKey: "network",
      canRetry: true,
      canDismiss: true,
    }),
  ]);
  const guidance = f.all(
    (value) => value.props.class === "b-product-file-uploader__error",
  );
  assert.equal(guidance[0].props.role, "status");
  const info = all(guidance[0], (value) => value.type === "icon")[0];
  assert.equal(info.props.color, undefined);
  assert.equal(text(info), "info_outline");
  assert.equal(guidance[1].props.role, "alert");
  const error = all(guidance[1], (value) => value.type === "icon")[0];
  assert.equal(error.props.color, "error");
  assert.equal(text(error), "error_outline");
});

test("failure feedback sits outside the narrow identity column and successful rows reserve no feedback wrapper", async (t) => {
  const f = await fixture(t, [
    record(1, "done", { completedOrder: 1, progress: 100 }),
    record(2, "uploading"),
    record(3, "error", { errorKey: "expired", fileId: 91, canDismiss: true }),
  ]);
  const feedback = f.all(
    (value) => value.props.class === "b-product-file-uploader__feedback",
  );
  assert.equal(feedback.length, 1);
  assert.ok(
    String(feedback[0].parent.props.class).includes(
      "b-product-file-uploader__record",
    ),
  );
  assert.match(text(feedback[0]), /expired/);
  assert.ok(
    text(feedback[0]).includes(
      translate("en", "product_file.modern.uploader.recovery"),
    ),
  );
  const identities = f.all(
    (value) => value.props.class === "b-product-file-uploader__identity",
  );
  assert.ok(
    identities.every(
      (identity) =>
        !all(identity, (value) =>
          ["alert", "status"].includes(value.props.role),
        ).length,
    ),
  );
});

test("retained attempts expand into a labeled MB-per-second/sample-index graph without fake default speed", async (t) => {
  const previous = [1000000, 3000000, 2000000];
  const f = await fixture(t, [
    record(1, "authorizing", {
      history: [],
      attempts: [
        { number: 1, status: "error", history: previous },
        { number: 2, status: "authorizing", history: [] },
      ],
    }),
  ]);
  assert.equal(f.state.rows[0].trace.samples.length, 3);
  assert.equal(f.state.rows[0].graph.series.length, 1);
  assert.equal(f.all((value) => value.props.role === "region").length, 0);
  f.find(
    (value) =>
      value.type === "button" && value.props["aria-expanded"] === false,
  ).props.onClick();
  await Vue.nextTick();
  const region = f.find((value) => value.props.role === "region");
  assert.ok(region);
  assert.match(text(region), /MB\/s/);
  assert.match(text(region), /Sample index/);
  assert.match(text(region), /Attempt 1/);
  assert.equal(f.state.rows[0].graph.peak, 3000000);
  assert.equal(f.state.rows[0].graph.count, 3);
  assert.equal(f.state.records[0].speed, null);
  const plot = all(
    region,
    (value) => value.props.class === "b-product-file-uploader__history-plot",
  )[0];
  assert.equal(plot.props.preserveAspectRatio, "none");
  assert.equal(plot.props.viewBox, "38 16 234 84");
  assert.equal(
    all(
      plot,
      (value) => value.type === "text" && Object.hasOwn(value.props, "x"),
    ).length,
    0,
    "axis labels stay outside the stretching vector plot",
  );
  assert.equal(
    all(plot, (value) => value.type === "polyline")[0].props.points,
    f.state.rows[0].graph.series[0].points,
  );
  f.records[0].attempts = [{ number: 1, status: "done", history: [1000000] }];
  await Vue.nextTick();
  const single = f.find(
    (value) =>
      value.type === "line" &&
      value.props.class === "b-product-file-uploader__history-series",
  );
  assert.ok(single, "one real sample still has a visible mark");
  assert.equal(
    single.props.y1,
    16,
    "the observed peak stays at the actual plot maximum",
  );
  assert.equal(single.props.y2, 16);
  assert.equal(single.props.x1, "38");
  assert.equal(single.props.x2, "38.01");
  assert.equal(
    f.state.formatRate(100),
    "<0.01",
    "a positive low rate must not label the axis zero",
  );
});

test("live announcements change only with status and parent events contain safe upload metadata", async (t) => {
  const f = await fixture(t, [
    record(1, "uploading", {
      fileId: 91,
      file: new File(["fixture"], "one.pdf"),
      descriptor: { fixture: true },
    }),
  ]);
  f.options.onChange(f.records);
  const announcement = f.state.announcement;
  f.records[0].speed = 1234;
  f.records[0].progress = 55;
  f.options.onChange(f.records);
  assert.equal(f.state.announcement, announcement);
  assert.deepEqual(
    Object.keys(f.emitted.at(-1)[0]).sort(),
    [
      "errorKey",
      "eta",
      "fileId",
      "id",
      "name",
      "progress",
      "sent",
      "size",
      "speed",
      "status",
    ].sort(),
  );
  f.records[0].status = "confirming";
  f.options.onChange(f.records);
  assert.notEqual(f.state.announcement, announcement);
  f.unmount();
  assert.equal(f.calls.at(-1)[0], "dispose");
  assert.equal(Array.isArray(f.emitted.at(-1)), true);
  assert.equal(f.emitted.at(-1).length, 0);
});

test("long queue filenames expose their complete value through the shared touch/focus tooltip", async (t) => {
  const name = `${"long-file-name-".repeat(15)}.zip`;
  const f = await fixture(t, [record(1, "queued", { name })]);
  const button = f.find(
    (value) => value.type === "button" && value.props["aria-label"] === name,
  );
  assert.ok(button);
  button.props.onClick();
  await Vue.nextTick();
  assert.equal(f.state.nameTooltip, 1);
  button.props.onKeydown({ key: "Escape", stopPropagation() {} });
  await Vue.nextTick();
  assert.equal(f.state.nameTooltip, null);
});

test("real uploader compiles with scoped mobile/reduced-motion styles and English/Persian state and error copy", async (t) => {
  for (const locale of ["en", "fa"]) {
    const f = await fixture(
      t,
      [
        record(1, "error", {
          fileId: 91,
          errorKey: "expired",
          canDismiss: true,
        }),
      ],
      {},
      locale,
    );
    assert.ok(
      text(f.root).includes(
        translate(locale, "product_file.modern.uploader.recovery"),
      ),
    );
    for (const status of [
      "queued",
      "authorizing",
      "uploading",
      "confirming",
      "done",
      "error",
      "cancelled",
    ])
      translate(locale, `product_file.modern.uploader.status.${status}`);
    for (const key of [
      "too_large",
      "capacity",
      "file_limit",
      "duplicate",
      "authorize",
      "network",
      "transfer",
      "timeout",
      "expired",
      "confirmation",
      "unsupported",
      "cancelled_reservation",
      "removed",
    ])
      translate(locale, `product_file.modern.uploader.errors.${key}`);
    for (const style of f.descriptor.styles)
      assert.deepEqual(
        (
          await compileStyleAsync({
            source: style.content,
            filename: fileURLToPath(file),
            id: "product-file-uploader",
            scoped: style.scoped,
            preprocessLang: style.lang,
          })
        ).errors,
        [],
      );
  }
});
