import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

// A local DOM only; no browser or application URL is opened.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const key of ["window", "document", "Element", "SVGElement", "HTMLElement", "Node"])
  globalThis[key] = dom.window[key];
const Vue = await import("vue");

const file = new URL("./UNotificationServer.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "notification-server-test",
});
assert.deepEqual(template.errors, []);
const script = ts.transpileModule(
  descriptor.script.content + "\n" + template.code,
  {
    reportDiagnostics: true,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  },
);
assert.deepEqual(script.diagnostics, []);

// The countdown as the bar sees it: like the real one it reports its end at once when the
// end is already behind, and the test can end it by hand.
let countdown = null;
const UCountDown = Vue.defineComponent({
  name: "UCountDown",
  props: ["end"],
  emits: ["end"],
  setup(props, { emit }) {
    countdown = { end: props.end, finish: () => emit("end") };
    if (new Date(props.end).getTime() <= Date.now()) emit("end");
    return () => Vue.h("ul", { class: "vuejs-countdown" });
  },
});

const exports = {};
vm.runInNewContext(script.outputText, {
  exports,
  require(path) {
    if (path === "vue") return Vue;
    // The real helper is new Date(value) as well.
    if (path === "@selldone/core-js")
      return {
        DateConverter: {
          convertToLocalTime: (value) => (value ? new Date(value) : null),
        },
      };
    if (path.endsWith("/UCountDown.vue"))
      return { __esModule: true, default: UCountDown };
    if (path.endsWith("/UTimeLaps.vue"))
      return { __esModule: true, default: { render: () => null } };
    throw new Error("Unexpected module: " + path);
  },
});
const component = { ...exports.default, render: exports.render };

const passthrough = (tag) =>
  Vue.defineComponent({
    setup: (_, { slots }) => () => Vue.h(tag, slots.default?.()),
  });

function mount(notification) {
  countdown = null;
  const host = document.createElement("div");
  document.body.appendChild(host);
  const app = Vue.createApp(component, { notification });
  app.config.globalProperties.$t = (key) => key;
  app.config.globalProperties.$vuetify = { display: { smAndUp: true } };
  app.config.warnHandler = (message) => {
    throw new Error(message);
  };
  app.component("v-sheet", passthrough("section"));
  app.component("v-btn", passthrough("a"));
  app.component("v-icon", passthrough("i"));
  app.component("v-spacer", passthrough("span"));
  app.mount(host);
  return {
    bar: () => host.querySelector("section"),
    unmount: () => {
      app.unmount();
      host.remove();
    },
  };
}

// The async countdown settles after a macrotask.
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Vue.nextTick();
};

const message = "<strong>Platform update</strong> in progress.";
const isoIn = (seconds) => new Date(Date.now() + seconds * 1000).toISOString();

test("a banner whose end already passed never opens", async () => {
  const { bar, unmount } = mount({ message, end_at: isoIn(-60) });
  await settle();
  assert.equal(bar(), null);
  assert.equal(countdown, null);
  unmount();
});

test("a running banner counts down to the server's instant and closes at its end", async () => {
  const end_at = isoIn(3600);
  const { bar, unmount } = mount({ message, color: "#141414", end_at });
  await settle();
  assert.ok(bar(), "the bar opens");
  assert.ok(bar().textContent.includes("Platform update"));
  assert.ok(bar().textContent.includes("global.commons.ends_in"));
  // The ISO 8601 UTC value the server sends is the instant the countdown runs to.
  assert.equal(countdown.end.getTime(), new Date(end_at).getTime());

  countdown.finish();
  await Vue.nextTick();
  assert.equal(bar(), null, "the bar hides once the countdown ends");
  unmount();
});

test("a banner without an end stays open without a countdown", async () => {
  const { bar, unmount } = mount({ message, action_text: "Status", action_url: "/status" });
  await settle();
  assert.ok(bar());
  assert.ok(!bar().textContent.includes("global.commons.ends_in"));
  assert.equal(countdown, null);
  assert.equal(bar().querySelector("a").getAttribute("href"), "/status");
  unmount();
});
