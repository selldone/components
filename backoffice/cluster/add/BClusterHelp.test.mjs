import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import { JSDOM } from "jsdom";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BClusterHelp.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "cluster-help-test",
});
assert.deepEqual(template.errors, []);
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const componentExports = {},
  renderExports = {};
vm.runInNewContext(transpile(descriptor.script.content), {
  exports: componentExports,
});
vm.runInNewContext(transpile(template.code), {
  exports: renderExports,
  require: () => Vue,
});

test("cluster explanation renders an inert, localized figure in both directions", async () => {
  for (const [isRtl, labels] of [
    [
      false,
      [
        "Illustration",
        "How clusters work",
        "Existing resources stay independent.",
        "Page",
        "Incentive",
        "Campaign",
        "Cluster",
        "Quick access",
        "Parent cluster",
      ],
    ],
    [
      true,
      [
        "تصویرسازی",
        "کلاسترها چطور کار می‌کنند؟",
        "منابع مستقل باقی می‌مانند.",
        "صفحه",
        "مشوق",
        "کمپین",
        "کلاستر",
        "دسترسی سریع",
        "کلاستر والد",
      ],
    ],
  ]) {
    const keys = [
      "eyebrow",
      "title",
      "summary",
      "page",
      "incentive",
      "campaign",
      "folder",
      "quick_access",
      "parent",
    ];
    const translations = Object.fromEntries(
      keys.map((key, index) => [
        `classification_clusters.editor.help.${key}`,
        labels[index],
      ]),
    );
    const app = Vue.createSSRApp({
      ...componentExports.default,
      render: renderExports.render,
    });
    app.config.globalProperties.$vuetify = { locale: { isRtl } };
    app.config.globalProperties.$t = (key) => translations[key] ?? key;
    const dom = new JSDOM(await renderToString(app));
    const document = dom.window.document;
    const figure = document.querySelector("figure");
    assert.equal(figure.classList.contains("b-cluster-help--rtl"), isRtl);
    const caption = figure.querySelector("figcaption");
    assert.ok(caption.textContent.includes(labels[0]));
    assert.ok(caption.textContent.includes(labels[2]));
    const stage = figure.querySelector('[aria-hidden="true"]');
    assert.ok(stage);
    assert.equal(
      stage.querySelectorAll(
        "button,input,select,textarea,form,a[href],[tabindex],[contenteditable],[role=button],[aria-live]",
      ).length,
      0,
    );
    assert.equal(stage.querySelectorAll(".b-cluster-help__resource").length, 3);
    for (const label of labels.slice(3))
      assert.ok(stage.textContent.includes(label));
    for (const svg of stage.querySelectorAll("svg"))
      assert.equal(svg.getAttribute("focusable"), "false");
    dom.window.close();
  }
});

test("illustration styles compile with finite motion and a complete reduced-motion state", async () => {
  const style = await compileStyleAsync({
    source: descriptor.styles[0].content,
    filename: file.pathname,
    id: "data-v-cluster-help-test",
    scoped: true,
    preprocessLang: descriptor.styles[0].lang,
  });
  assert.deepEqual(style.errors, []);
  const animations = [...style.code.matchAll(/animation:\s*([^;]+);/g)].map(
    (match) => match[1],
  );
  assert.ok(animations.length > 0);
  for (const animation of animations) {
    assert.ok(!animation.includes("infinite"));
    for (const time of animation.matchAll(/([\d.]+)(m?s)\b/g)) {
      assert.ok(Number(time[1]) * (time[2] === "s" ? 1000 : 1) <= 4000);
    }
  }
  assert.ok(style.code.includes("prefers-reduced-motion: reduce"));
  assert.ok(animations.includes("none"));
});
