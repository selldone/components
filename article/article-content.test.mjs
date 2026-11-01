import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import postcss from "postcss";
import * as sass from "sass";
import { parse, compileStyleAsync } from "@vue/compiler-sfc";

const path = (name) => fileURLToPath(new URL(name, import.meta.url));
const shared = sass.compile(path("./article-content.scss")).css;
const { descriptor, errors } = parse(
  readFileSync(path("./SArticleEditor.vue"), "utf8"),
);
assert.deepEqual(errors, []);
const globalStyles = await Promise.all(
  descriptor.styles
    .filter((style) => !style.scoped)
    .map(async (style) => {
      const result = await compileStyleAsync({
        source: style.content,
        filename: path("./SArticleEditor.vue"),
        id: "article-prose",
        preprocessLang: "scss",
      });
      assert.deepEqual(result.errors, []);
      return result.code;
    }),
);
const outer = sass.compile(path("./Article.scss"), {
  loadPaths: [path("../../../node_modules")],
}).css;
const rules = (css) => {
  const result = [];
  postcss.parse(css).walkRules((rule) => {
    if (!rule.parent.name?.endsWith("keyframes")) result.push(rule);
  });
  return result;
};
const sharedRules = rules(shared),
  allRules = rules(outer + globalStyles.join("\n"));

function applied(element, property, source = sharedRules, before = false) {
  return source.flatMap((rule) => {
    const selectors = rule.selectors.filter((selector) =>
      before
        ? /::?before\b/.test(selector)
        : !/::[\w-]+|:(before|after)\b/.test(selector),
    );
    if (
      !selectors.some((selector) =>
        element.matches(
          before ? selector.replace(/::?before\b/g, "") : selector,
        ),
      )
    )
      return [];
    return rule.nodes.filter(
      (node) => node.type === "decl" && (!property || node.prop === property),
    );
  });
}

const protectedClasses = [
  "medium-insert-buttons",
  "medium-insert-images",
  "medium-insert-images-safe",
  "medium-insert-embeds",
  "medium-insert-embed",
  "embed-raw-html",
  "code-editor",
  "images-compare",
  "flip-book",
  "image-overlay-canvas",
  "a-article-addon-tools",
  "filepond--root",
  "link-preview",
  "link-preview-big",
  "s--link-preview",
  "s--link-preview-card",
];
const protectedMarkup =
  protectedClasses
    .map(
      (name) =>
        `<div class="${name}"><h2>Control</h2><p>Caption <a href="#native">native link</a> <u>native underline</u></p><ul><li>Option</li></ul><blockquote>Embedded quote</blockquote></div>`,
    )
    .join("") +
  `
  <article-flowchart><figure><figcaption><h2>Diagram</h2><p>Summary</p></figcaption><details><ol><li>Text alternative</li></ol></details></figure></article-flowchart>
  <table><tbody><tr><td><p>Cell</p><ol><li>Cell item</li></ol></td></tr></tbody></table>
  <pre><code>Code remains code</code></pre>
  ${["twitter-tweet", "instagram-media", "tiktok-embed", "reddit-embed-bq"].map((name) => `<blockquote class="${name}"><p>Social post</p></blockquote>`).join("")}`;
function fixture(mode) {
  const dom =
    new JSDOM(`<section style="font-family: Georgia; font-size:19px; color:#345; line-height:1.8">
    <div class="master-article-container"><div class="article"><div class="s--article-editor-container for-rtl">
      <div class="s-article-editor__body u-article-body-${mode}" dir="rtl">
        <p id="paragraph">A paragraph with <strong>emphasis</strong>.</p><h2 id="heading">Heading</h2>
        <ol id="ordered" type="I" start="7" reversed><li id="item" value="12"><p id="item-paragraph">A long item wraps without losing its marker.</p><ul id="nested"><li id="nested-item">Nested item</li></ul></li></ol>
        <ul id="unordered"><li id="bullet">A bullet</li></ul>
        <blockquote id="quote"><p id="quotation">Words with a <a href="#source">source</a>.</p><cite id="citation">Author</cite><div class="embed-raw-html" id="nested-protected"><p>Embed inside a quote <a href="#native">native link</a></p><cite>Embed credit</cite></div></blockquote><hr id="rule">
        <div id="protected">${protectedMarkup}</div>
      </div>
    </div></div></div>
  </section>`);
  return {
    dom,
    document: dom.window.document,
    get: (id) => dom.window.document.getElementById(id),
  };
}

test("shared prose rhythm reaches both real reading and editing body classes", () => {
  for (const mode of ["view", "edit"]) {
    const { dom, get } = fixture(mode);
    for (const [id, property] of [
      ["paragraph", "margin-block"],
      ["heading", "line-height"],
      ["ordered", "padding-inline"],
      ["nested", "margin-block"],
      ["item", "display"],
      ["quotation", "margin-block"],
      ["quote", "border-inline-start"],
      ["rule", "border-block-start"],
    ])
      assert.ok(
        applied(get(id), property).length,
        `${mode}: ${id} receives ${property}`,
      );
    assert.equal(applied(get("item"), "display").at(-1).value, "list-item");
    assert.equal(applied(get("ordered"), "font-size").at(-1).value, "inherit");
    assert.equal(applied(get("item"), "line-height").at(-1).value, "inherit");
    dom.window.close();
  }
});

test("component-owned controls, diagrams, embeds, captions and tables keep their own presentation", () => {
  for (const mode of ["view", "edit"]) {
    const { dom, document } = fixture(mode);
    for (const element of document.querySelectorAll(
      "#protected :is(p,h2,ul,ol,li,blockquote,pre,a,u), #nested-protected, #nested-protected :is(p,a,cite)",
    ))
      assert.deepEqual(
        applied(element).map((item) => `${item.prop}: ${item.value}`),
        [],
        `${mode}: ${element.outerHTML} is outside shared prose`,
      );
    dom.window.close();
  }
});

test("compiled shared editor styles retain native list attributes and never generate duplicate counters", () => {
  for (const mode of ["view", "edit"]) {
    const { dom, get } = fixture(mode);
    assert.equal(get("ordered").start, 7);
    assert.equal(get("ordered").reversed, true);
    assert.equal(get("ordered").type, "I");
    assert.equal(get("item").value, 12);
    for (const id of [
      "ordered",
      "item",
      "nested",
      "nested-item",
      "unordered",
      "bullet",
    ]) {
      const declarations = applied(get(id), null, allRules);
      assert.equal(
        declarations.some((item) =>
          ["counter-reset", "counter-increment"].includes(item.prop),
        ),
        false,
        id,
      );
      assert.equal(
        declarations.some(
          (item) =>
            item.prop === "list-style" || item.prop === "list-style-type",
        ),
        false,
        `${id}: author type stays native`,
      );
      assert.equal(
        applied(get(id), "content", allRules, true).some(
          (item) => !["none", "normal", "unset"].includes(item.value),
        ),
        false,
        `${id}: no duplicate marker`,
      );
    }
    dom.window.close();
  }
});

test("prose inherits the host font and quote ink while its decorative glyph stays isolated", () => {
  const { dom, get, document } = fixture("view");
  assert.equal(document.querySelector("section").style.fontFamily, "Georgia");
  for (const id of [
    "paragraph",
    "heading",
    "ordered",
    "item",
    "quote",
    "quotation",
    "citation",
  ])
    for (const declaration of applied(get(id), "font-family", allRules))
      assert.equal(
        declaration.value,
        "inherit",
        `${id}: host font is preserved`,
      );
  assert.equal(applied(get("quote"), "background").at(-1).value, "transparent");
  assert.equal(applied(get("quote"), "color").at(-1).value, "inherit");
  assert.ok(
    applied(get("quote"), "inset-inline-start", sharedRules, true).length,
  );
  dom.window.close();
});
