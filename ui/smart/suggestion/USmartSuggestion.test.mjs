import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test, { after } from "node:test";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyle,
} from "@vue/compiler-sfc";
import { isObject } from "lodash-es";
import ts from "typescript";

// Actual component/render code with local Vuetify stubs; no DOM, HTTP or shop data.
const filename = new URL("./USmartSuggestion.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
  filename: filename.pathname,
});
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "smart-suggestion-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "smart-suggestion-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles) {
  assert.deepEqual(
    compileStyle({
      source: style.content,
      filename: filename.pathname,
      id: "smart-suggestion-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    }).errors,
    [],
  );
}
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

// Use the project's real prototype helpers without loading unrelated bootstrap code.
const originals = [
  [
    String.prototype,
    "limitWords",
    Object.getOwnPropertyDescriptor(String.prototype, "limitWords"),
  ],
  [
    Array.prototype,
    "random",
    Object.getOwnPropertyDescriptor(Array.prototype, "random"),
  ],
];
for (const [file, start, end] of [
  [
    "StringPrototypes.ts",
    "String.prototype.limitWords =",
    "String.prototype.wordsCount =",
  ],
  ["ArrayPrototypes.ts", "Array.prototype.random =", "\n};"],
]) {
  const source = readFileSync(
    new URL(`../../../../core-js/prototypes/${file}`, import.meta.url),
    "utf8",
  );
  const offset = source.indexOf(start);
  const until = source.indexOf(end, offset + start.length);
  vm.runInThisContext(
    transpile(
      source.slice(offset, end === "\n};" ? until + end.length : until),
    ),
  );
}
after(() => {
  for (const [prototype, name, original] of originals) {
    if (original) Object.defineProperty(prototype, name, original);
    else delete prototype[name];
  }
});
const seasonExports = {};
vm.runInThisContext(
  `(function(exports){${transpile(readFileSync(new URL("./Seasons.ts", import.meta.url), "utf8"))}})`,
)(seasonExports);
class PreviewDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : ["2026-05-15T12:00:00Z"]));
  }
}
const exports = {};
vm.runInThisContext(
  `(function(require,exports,Date){${transpile(descriptor.script.content + "\n" + template.code)}})`,
)(
  (name) => {
    if (name === "vue") return Vue;
    if (name === "lodash-es") return { isObject };
    if (name === "./Seasons.ts") return seasonExports;
    throw Error(`Unexpected dependency: ${name}`);
  },
  exports,
  PreviewDate,
);

const passthrough = (tag) =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => Vue.h(tag, attrs, slots.default?.());
    },
  });
async function render(props = {}, { openLegacy = false } = {}) {
  const buttons = [],
    items = [],
    tooltips = [],
    selected = [];
  let instance;
  const component = {
    ...exports.default,
    render: exports.render,
    created() {
      instance = this;
      if (openLegacy) {
        this.dialog_pre = true;
        this.dialog = true;
      }
    },
  };
  const app = Vue.createSSRApp(component, {
    ...props,
    onSelect: (value) => selected.push(value),
  });
  app.config.globalProperties.$t = (key) => key;
  app.component(
    "v-btn",
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          const children = slots.default?.();
          buttons.push({ ...attrs });
          return Vue.h("button", attrs, children);
        };
      },
    }),
  );
  app.component(
    "v-list-item",
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs, slots }) {
        return () => {
          items.push({ ...attrs });
          return Vue.h("li", attrs, slots.default?.());
        };
      },
    }),
  );
  app.component(
    "v-tooltip",
    Vue.defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => {
          tooltips.push({ ...attrs });
          return Vue.h("span", { "data-tooltip": attrs.text });
        };
      },
    }),
  );
  app.component(
    "v-menu",
    Vue.defineComponent({
      inheritAttrs: false,
      props: ["modelValue"],
      emits: ["update:modelValue"],
      setup(_, { attrs, slots, emit }) {
        return () =>
          Vue.h("section", { "data-overlay": "menu", ...attrs }, [
            slots.activator?.({
              props: {
                "aria-haspopup": "menu",
                onClick: () => emit("update:modelValue", true),
              },
            }),
            slots.default?.(),
          ]);
      },
    }),
  );
  for (const [name, tag] of [
    ["v-slide-group", "article"],
    ["v-slide-group-item", "div"],
    ["v-dialog", "aside"],
    ["v-card", "section"],
    ["v-card-text", "div"],
    ["v-card-actions", "footer"],
    ["v-list", "ul"],
    ["v-list-item-title", "strong"],
    ["v-list-item-subtitle", "small"],
    ["v-icon", "i"],
  ])
    app.component(name, passthrough(tag));
  return {
    html: await renderToString(app),
    buttons,
    items,
    tooltips,
    selected,
    instance,
  };
}
const samples = [
  "Coffee",
  "Guides",
  "Brand stories",
  "Foodie Finds",
  "Health Tips",
];

test("existing callers retain the slide group, complete dialog and close lifecycle", async () => {
  assert.equal(exports.default.props.modern.default, false);
  const f = await render({ samples, noRandom: true }, { openLegacy: true });
  assert.match(f.html, /<article\b/);
  assert.match(f.html, /fullscreen/);
  assert.doesNotMatch(f.html, /data-overlay="menu"/);
  assert.equal(f.items.length, samples.length);
  f.items[4].onClick();
  assert.deepEqual(f.selected, [samples[4]]);
  await Vue.nextTick();
  assert.equal(f.instance.dialog_pre, false);
  f.instance.showDialog();
  assert.equal(f.instance.dialog_pre, true);
  await Vue.nextTick();
  assert.equal(f.instance.dialog, true);
});

test("modern mode shows the first three, with every sample in the native menu", async () => {
  const f = await render({
    samples,
    modern: true,
    noRandom: true,
    moreLabel: "More category suggestions",
  });
  assert.deepEqual(
    f.buttons.slice(0, 3).map((button) => button["aria-label"]),
    samples.slice(0, 3),
  );
  assert.equal(f.buttons.length, 4);
  assert.equal(f.items.length, samples.length);
  assert.match(f.html, /data-overlay="menu"/);
  assert.doesNotMatch(f.html, /<aside\b|<article\b/);
  assert.match(f.html, /min\(320px, calc\(100vw - 32px\)\)/);
  assert.equal(f.buttons[3]["aria-label"], "More category suggestions");
  assert.equal(f.buttons[3]["aria-haspopup"], "menu");
  f.buttons[3].onClick();
  assert.equal(f.instance.menu, true);
  f.items[4].onClick();
  assert.deepEqual(f.selected, [samples[4]]);
  assert.equal(f.instance.menu, false, "Selecting a menu item closes it");
  f.buttons[0].onClick();
  assert.deepEqual(f.selected, [samples[4], samples[0]]);
});

test("a shorter preview retains the complete suggestion menu", async () => {
  const f = await render({
    samples,
    modern: true,
    noRandom: true,
    previewCount: 2,
  });
  assert.equal(f.buttons.length, 3);
  assert.deepEqual(
    f.buttons.slice(0, 2).map((button) => button["aria-label"]),
    samples.slice(0, 2),
  );
  assert.equal(f.items.length, samples.length);
  f.items[4].onClick();
  assert.deepEqual(f.selected, [samples[4]]);
});

test("custom object keys retain their labels and exact emitted values in both modes", async () => {
  const objects = [
    { id: 0, label: "Zero" },
    { id: "blue", label: "Blue" },
    { id: 42, label: "Forty two" },
    { id: "last", label: "Last" },
  ];
  for (const modern of [false, true]) {
    const f = await render(
      { samples: objects, titleKey: "label", valueKey: "id", modern },
      { openLegacy: !modern },
    );
    assert.equal(
      f.instance.samples_processed,
      objects,
      "Object samples are never randomized or rewritten",
    );
    assert.equal(f.items.length, objects.length);
    f.items[0].onClick();
    f.items[3].onClick();
    assert.deepEqual(f.selected, [0, "last"]);
    assert.match(f.html, /Forty two/);
    if (modern) {
      f.buttons[1].onClick();
      assert.deepEqual(f.selected, [0, "last", "blue"]);
    }
  }
});

test("noRandom keeps source order while default randomization retains all samples", async () => {
  const original = [...samples];
  for (const modern of [false, true]) {
    const stable = await render({ samples, modern, noRandom: true });
    assert.equal(stable.instance.samples_processed, samples);
    const random = await render({ samples, modern });
    assert.deepEqual(
      [...random.instance.samples_processed].sort(),
      [...samples].sort(),
    );
    assert.notEqual(random.instance.samples_processed, samples);
    assert.deepEqual(
      samples,
      original,
      "Randomizing never changes the supplied array",
    );
  }
});

test("season suffixes remain part of the emitted suggestion", async () => {
  for (const modern of [false, true]) {
    const f = await render({
      samples: ["Coffee"],
      modern,
      addSession: true,
      noRandom: true,
    });
    const value = "Coffee | global.seasons.spring 2026";
    assert.deepEqual(f.instance.samples_processed, [value]);
    f.buttons[modern ? 0 : 1].onClick();
    assert.deepEqual(f.selected, [value]);
  }
});

test("truncated quick labels keep their full accessible name and explanatory tooltip", async () => {
  const full = "One two three four five six";
  const f = await render({
    samples: [full, "Coffee", "Guides"],
    modern: true,
    noRandom: true,
    moreLabel: "More suggestions",
  });
  assert.equal(f.buttons[0]["aria-label"], full);
  assert.match(f.html, /One two three four…/);
  assert.deepEqual(
    f.tooltips.map((tooltip) => tooltip.text),
    [full, "More suggestions"],
  );
  for (const tooltip of f.tooltips) {
    assert.equal(tooltip.location, "top");
    assert.equal(tooltip["open-on-focus"], true);
    assert.equal(tooltip["open-on-hover"], true);
    assert.equal(tooltip.persistent, false);
  }
});

test("absent, empty and non-array samples do not display either picker", async () => {
  for (const modern of [false, true]) {
    for (const value of [undefined, [], "Coffee"]) {
      const f = await render({ samples: value, modern });
      assert.equal(f.buttons.length, 0);
      assert.equal(f.items.length, 0);
      assert.equal(f.tooltips.length, 0);
    }
  }
});
