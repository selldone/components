import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import {
  compileScript,
  compileStyle,
  compileTemplate,
  parse,
} from "@vue/compiler-sfc";
import { renderToString } from "@vue/server-renderer";
import { JSDOM } from "jsdom";
import * as Vue from "vue";
import ts from "typescript";

const evaluate = (source, dependencies = {}) => {
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
      require: (name) => dependencies[name] || { default: {} },
      window: {
        $language: { full_locale: "en-US", calendar: { calendar: "gregory" } },
      },
    },
  );
  return exports;
};
const dateMixin = evaluate(
  readFileSync(
    new URL("../../../mixin/date/DateMixin.ts", import.meta.url),
    "utf8",
  ),
);
const slugify = evaluate(
  readFileSync(
    new URL("../../../../core-js/utils/slugify/slugify.ts", import.meta.url),
    "utf8",
  ),
);
const filename = new URL("./SArticleAuthorBox.vue", import.meta.url).pathname;
const { descriptor, errors } = parse(
  readFileSync(new URL("./SArticleAuthorBox.vue", import.meta.url), "utf8"),
  { filename },
);
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "article-author-badge-test" });
const template = compileTemplate({
  source: descriptor.template.content,
  filename,
  id: "article-author-badge-test",
  compilerOptions: { bindingMetadata: script.bindings },
});
assert.deepEqual(template.errors, []);
for (const style of descriptor.styles)
  assert.deepEqual(
    compileStyle({
      source: style.content,
      filename,
      id: "article-author-badge-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    }).errors,
    [],
  );
const component = {
  ...evaluate(script.content, {
    vue: Vue,
    "@selldone/components-vue/mixin/date/DateMixin.ts": dateMixin,
    "@selldone/core-js/utils/slugify/slugify.ts": slugify,
  }).default,
  components: {
    AFeedbackContentViolationReport: {
      render() {
        return null;
      },
    },
  },
  render: evaluate(template.code, { vue: Vue }).render,
};

async function render(profile) {
  const article = {
    user_id: 7,
    user: { id: 7, name: "Writer Name", verified: true, profile },
  };
  const app = Vue.createSSRApp(component, { article });
  app.config.warnHandler = (message) => {
    throw Error(message);
  };
  Object.assign(app.config.globalProperties, {
    $t: (key) =>
      key === "global.commons.verified_user" ? "Verified user" : key,
    USER: () => null,
    USER_ID: () => null,
    getUserAvatar: () => "/author.png",
  });
  const passthrough = {
    render() {
      return Vue.h("div", this.$attrs, this.$slots.default?.());
    },
  };
  for (const tag of new Set(
    Array.from(
      descriptor.template.content.matchAll(/<(v-[\w-]+)/g),
      ([, tag]) => tag,
    ),
  )) {
    app.component(tag, passthrough);
  }
  app.component("router-link", passthrough);
  app.component("a-feedback-content-violation-report", {
    render() {
      return null;
    },
  });
  return new JSDOM(await renderToString(app)).window.document;
}

test("the author box renders the canonical verified profile badge with a readable icon label", async () => {
  const document = await render({
    name: "Public writer",
    description: "Biography",
    verified: true,
  });
  const badge = document.querySelector(
    '.author-name [role="img"][aria-label="Verified user"]',
  );
  assert.ok(badge);
  assert.equal(badge.getAttribute("aria-hidden"), "false");
  assert.equal(badge.textContent.trim(), "verified");
  assert.equal(badge.getAttribute("size"), "14");
  assert.equal(badge.getAttribute("color"), "primary");
  assert.match(
    document.querySelector(".author-name").textContent,
    /Public writer/,
  );
  assert.equal(
    document.querySelector(".author-description").textContent,
    "Biography",
  );
});

test("unverified, unknown and missing public profiles never inherit the account verified flag", async () => {
  for (const profile of [
    { name: "Public writer", verified: false },
    { name: "Public writer" },
    null,
    undefined,
  ]) {
    const document = await render(profile);
    assert.equal(
      document.querySelector('.author-name [aria-label="Verified user"]'),
      null,
    );
    assert.match(
      document.querySelector(".author-name").textContent,
      profile ? /Public writer/ : /Writer Name/,
    );
  }
});
