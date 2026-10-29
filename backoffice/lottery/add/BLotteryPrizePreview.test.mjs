import assert from "node:assert/strict";
import { File } from "node:buffer";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import { compile } from "@vue/compiler-dom";
import * as Vue from "vue";
import ts from "typescript";

// Render the real SFC locally without browser image loads or shop requests.
function mountPreview(initialProps = {}) {
  const { descriptor, errors } = parse(
    readFileSync(
      new URL("./BLotteryPrizePreview.vue", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(errors, []);
  const created = [];
  const revoked = [];
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(descriptor.script.content, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      File,
      URL: {
        createObjectURL: (file) => {
          const url = `blob:lottery-preview-${created.length + 1}`;
          created.push({ file, url });
          return url;
        },
        revokeObjectURL: (url) => revoked.push(url),
      },
    },
  );
  const component = exports.default;
  component.render = new Function(
    "Vue",
    compile(descriptor.template.content, {
      mode: "function",
      prefixIdentifiers: true,
    }).code,
  )(Vue);
  const node = (tag, text = "") => ({
    tag,
    text,
    props: {},
    children: [],
    parent: null,
  });
  const remove = (child) => {
    if (child.parent) {
      const siblings = child.parent.children;
      siblings.splice(siblings.indexOf(child), 1);
      child.parent = null;
    }
  };
  const renderer = Vue.createRenderer({
    createElement: (tag) => node(tag),
    createText: (text) => node("#text", text),
    createComment: (text) => node("#comment", text),
    insert: (child, parent, anchor = null) => {
      remove(child);
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(
        index < 0 ? parent.children.length : index,
        0,
        child,
      );
      child.parent = parent;
    },
    remove,
    setText: (target, text) => {
      target.text = text;
    },
    setElementText: (target, text) => {
      target.text = text;
      target.children = [];
    },
    patchProp: (target, key, previous, value) => {
      target.props[key] = value;
    },
    parentNode: (target) => target.parent,
    nextSibling: (target) =>
      target.parent?.children[target.parent.children.indexOf(target) + 1] ||
      null,
  });
  const props = Vue.reactive({
    title: "20% off",
    description: "A discount on your next order.",
    image: "shops/1/lottery/prize.png",
    color: "#673AB7",
    selectedFile: null,
    ...initialProps,
  });
  let instance;
  const app = renderer.createApp({
    render: () =>
      Vue.h(component, {
        ...props,
        ref: (value) => {
          instance = value;
        },
      }),
  });
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.getShopImagePath = (path) =>
    `/local-test/${path}`;
  for (const [name, tag] of [
    ["v-img", "img"],
    ["v-btn", "button"],
    ["v-btn-toggle", "div"],
    ["v-icon", "i"],
    ["v-avatar", "span"],
  ]) {
    app.component(name, {
      inheritAttrs: false,
      setup:
        (unused, { attrs, slots }) =>
        () =>
          Vue.h(tag, attrs, slots.default?.()),
    });
  }
  const warnings = [];
  app.config.warnHandler = (message) => warnings.push(message);
  const root = node("root");
  app.mount(root);
  function descendants(target = root) {
    return [target, ...target.children.flatMap((child) => descendants(child))];
  }
  const text = () =>
    descendants()
      .filter((item) => item.tag !== "#comment")
      .map((item) => item.text)
      .join(" ");
  return {
    props,
    created,
    revoked,
    root,
    descendants,
    text,
    warnings,
    get instance() {
      return instance;
    },
    unmount: () => app.unmount(),
  };
}

test("saved image, title, description and hover color follow live props", async () => {
  const preview = mountPreview();
  assert.equal(
    preview.instance.imageSource,
    "/local-test/shops/1/lottery/prize.png",
  );
  assert.match(preview.text(), /20% off/);
  assert.match(preview.text(), /A discount on your next order\./);
  preview.props.title = "هدیهٔ بعدی شما";
  preview.props.description = "توضیحات جایزهٔ تازه";
  preview.props.color = "#00897B";
  preview.props.image = "shops/1/lottery/new.webp";
  await Vue.nextTick();
  assert.match(preview.text(), /هدیهٔ بعدی شما/);
  assert.match(preview.text(), /توضیحات جایزهٔ تازه/);
  assert.equal(preview.instance.effectiveColor, "#00897B");
  assert.equal(
    preview.instance.imageSource,
    "/local-test/shops/1/lottery/new.webp",
  );
  const buttons = preview.descendants().filter((item) => item.tag === "button");
  assert.equal(buttons[0].props["aria-pressed"], true);
  assert.equal(buttons[1].props["aria-pressed"], false);
  buttons[1].props.onClick();
  await Vue.nextTick();
  assert.equal(preview.instance.hoverPreview, true);
  assert.equal(buttons[1].props["aria-pressed"], true);
  const selectedSlice = preview
    .descendants()
    .find((item) =>
      String(item.props.class).includes(
        "b-lottery-prize-preview__slice--hover",
      ),
    );
  assert.equal(selectedSlice.props.style.backgroundColor, "#00897B");
  assert.equal(preview.props.color, "#00897B");
  preview.props.color = null;
  await Vue.nextTick();
  assert.equal(preview.instance.effectiveColor, "#FFA000");
  assert.deepEqual(preview.warnings, []);
  preview.unmount();
});

test("file replacement, native-array values and clearing revoke only owned URLs", async () => {
  const first = new File(["first"], "first.png", { type: "image/png" });
  const second = new File(["second"], "second.webp", { type: "image/webp" });
  const preview = mountPreview({ selectedFile: first });
  assert.equal(preview.created.length, 1);
  assert.equal(preview.created[0].file, first);
  assert.equal(preview.instance.imageSource, preview.created[0].url);
  preview.props.selectedFile = [second];
  await Vue.nextTick();
  assert.deepEqual(preview.revoked, [preview.created[0].url]);
  assert.equal(preview.created[1].file, second);
  assert.equal(preview.instance.imageSource, preview.created[1].url);
  assert.equal(preview.props.selectedFile[0], second);
  preview.props.selectedFile = [];
  await Vue.nextTick();
  assert.deepEqual(
    preview.revoked,
    preview.created.map(({ url }) => url),
  );
  assert.equal(
    preview.instance.imageSource,
    "/local-test/shops/1/lottery/prize.png",
  );
  preview.unmount();
  assert.equal(preview.revoked.length, 2);
});

test("unsupported and oversized local files do not allocate preview URLs or alter the selection", async () => {
  const preview = mountPreview();
  for (const file of [
    new File(["<svg/>"], "prize.svg", { type: "image/svg+xml" }),
    new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png", {
      type: "image/png",
    }),
  ]) {
    preview.props.selectedFile = file;
    await Vue.nextTick();
    assert.equal(preview.created.length, 0);
    assert.equal(preview.instance.previewImageUnavailable, true);
    assert.equal(preview.props.selectedFile, file);
  }
  preview.props.selectedFile = null;
  await Vue.nextTick();
  assert.equal(preview.instance.previewImageUnavailable, false);
  preview.unmount();
});

test("unmount disposes the active local image URL", () => {
  const file = new File(["image"], "prize.jpg", { type: "image/jpeg" });
  const preview = mountPreview({ selectedFile: file });
  assert.equal(preview.created.length, 1);
  preview.unmount();
  assert.deepEqual(preview.revoked, [preview.created[0].url]);
});

test("neutral slice fills meet the six rendered separator lines", () => {
  const preview = mountPreview();
  try {
    const { descriptor } = parse(
      readFileSync(
        new URL("./BLotteryPrizePreview.vue", import.meta.url),
        "utf8",
      ),
    );
    const gradient = descriptor.styles
      .map(({ content }) => content)
      .join("\n")
      .match(/repeating-conic-gradient\([\s\S]*?\);/)?.[0];
    assert.ok(gradient, "The wheel has its neutral repeating fill.");
    const start = Number(gradient.match(/from\s+(-?[\d.]+)deg/)[1]);
    const stops = [...gradient.matchAll(/(?:^|[\s,])([\d.]+)deg/g)].map(
      (match) => Number(match[1]),
    );
    const period = Math.max(...stops);
    assert.ok(period > 0 && 360 % period === 0);
    const normalize = (angle) => ((angle % 360) + 360) % 360;
    const boundaries = [];
    for (let turn = 0; turn < 360; turn += period) {
      for (const stop of new Set(stops.filter((value) => value < period))) {
        boundaries.push(normalize(start + turn + stop));
      }
    }
    const separators = preview
      .descendants()
      .filter((item) =>
        String(item.props.class).includes("b-lottery-prize-preview__separator"),
      );
    assert.equal(separators.length, 6);
    // CSS rotations begin at the right; conic-gradient angles begin at the top.
    const separatorAngles = separators.map((item) =>
      normalize(
        Number(item.props.style.transform.match(/rotate\((-?[\d.]+)deg\)/)[1]) +
          90,
      ),
    );
    assert.deepEqual(
      boundaries.sort((a, b) => a - b),
      separatorAngles.sort((a, b) => a - b),
    );
  } finally {
    preview.unmount();
  }
});
