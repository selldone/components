import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";

// Render both presentations with local stubs; never open a URL or contact a shop.
const filename = new URL("./UButtonWhatsapp.vue", import.meta.url);
const source = readFileSync(filename, "utf8");
const { descriptor } = parse(source);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: filename.pathname,
  id: "whatsapp-test",
  transformAssetUrls: false,
});
assert.deepEqual(template.errors, []);
const requests = [];
const exports = {};
vm.runInNewContext(
  ts.transpileModule(descriptor.script.content + "\n" + template.code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  {
    exports,
    require(name) {
      if (name === "vue") return Vue;
      if (name.includes("SocialNetwork"))
        return {
          SocialNetwork: { WhatsApp: { code: "whatsapp" } },
          CreateSocialConnectLink(network, phone, options) {
            requests.push({ network, phone, options: { ...options } });
            return `https://example.test/${network}/${phone}?text=${encodeURIComponent(options.text)}`;
          },
        };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  },
);
const component = { ...exports.default, render: exports.render };
const overlay = (kind) =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        Vue.h("section", { "data-overlay": kind, ...attrs }, [
          slots.activator?.({ props: { "aria-describedby": "preview-help" } }),
          Vue.h("div", { id: "preview-help" }, slots.default?.()),
        ]);
    },
  });
const button = Vue.defineComponent({
  inheritAttrs: false,
  props: ["href", "size"],
  setup(props, { attrs, slots }) {
    return () =>
      Vue.h(
        "a",
        { href: props.href, "data-size": props.size, ...attrs },
        slots.default?.(),
      );
  },
});

async function render(props = {}) {
  const app = Vue.createSSRApp(component, {
    user: { name: "Alex", phone: "4512345678" },
    shop: { title: "Test shop" },
    ...props,
  });
  app.component("v-menu", overlay("menu"));
  app.component("v-tooltip", overlay("tooltip"));
  app.component("v-btn", button);
  app.component("v-icon", {
    setup:
      (_, { slots }) =>
      () =>
        Vue.h("span", slots.default?.()),
  });
  app.config.globalProperties.USER = () => ({ name: "Merchant" });
  app.config.globalProperties.$t = (key, values) =>
    key === "global.instance_message"
      ? `${values.name} / ${values.author} / ${values.company}`
      : key;
  return renderToString(app);
}

test("default callers keep the legacy menu and sizes", async () => {
  assert.equal(component.props.modern.default, false);
  const html = await render();
  assert.match(html, /data-overlay="menu"/);
  assert.doesNotMatch(html, /data-overlay="tooltip"/);
  assert.match(html, /bg-black pa-4 rounded-xl text-start/);
  assert.match(html, /data-size="30"/);
  assert.match(html, /aria-label="Call"/);
  assert.match(await render({ xSmall: true }), /data-size="24"/);
});

test("modern callers get one described top tooltip and the shared square button", async () => {
  requests.length = 0;
  const legacy = await render();
  const modern = await render({ modern: true, xSmall: true });
  assert.match(modern, /data-overlay="tooltip"/);
  assert.doesNotMatch(modern, /data-overlay="menu"/);
  assert.match(modern, /location="top"/);
  assert.match(modern, /sd-modern-tooltip text-start/);
  assert.match(modern, /open-on-hover="true"/);
  assert.match(modern, /open-on-focus="true"/);
  assert.match(modern, /persistent="false"/);
  assert.match(modern, /class="sd-modern-icon-button"/);
  assert.match(modern, /data-size="default"/);
  assert.match(modern, /aria-describedby="preview-help"/);
  assert.match(
    modern,
    /aria-label="global.instance_message_title · global.social_network.whatsapp"/,
  );
  assert.match(modern, /height="18" width="18"[^>]*whatsapp\.svg/);
  for (const html of [legacy, modern]) {
    assert.match(html, /4512345678/);
    assert.match(html, /Alex \/ Merchant \/ Test shop/);
  }
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0], requests[1]);
  assert.equal(
    legacy.match(/href="([^"]+)"/)[1],
    modern.match(/href="([^"]+)"/)[1],
  );
});

test("a customer without a phone has no WhatsApp action in either mode", async () => {
  requests.length = 0;
  for (const modern of [false, true]) {
    const html = await render({ modern, user: { name: "Alex" } });
    assert.doesNotMatch(html, /<a\b/);
    if (modern) assert.doesNotMatch(html, /data-overlay=/);
  }
  assert.equal(requests.length, 0);
});
