import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { JSDOM } from "jsdom";
import { parse, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";
import numeral from "numeral";

// Use a local DOM and real memory routing; no browser or application URL is opened.
const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const key of [
  "window",
  "document",
  "history",
  "Element",
  "SVGElement",
  "HTMLElement",
  "Node",
])
  globalThis[key] = dom.window[key];
const Vue = await import("vue");
const {
  RouterLink,
  createRouter,
  createMemoryHistory,
  isNavigationFailure,
  NavigationFailureType,
} = await import("vue-router");
const file = new URL("./UButtonCircle.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "circle-button-test",
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
const exports = {};
vm.runInNewContext(script.outputText, {
  exports,
  require(path) {
    if (path === "vue") return Vue;
    if (path === "numeral") return { default: numeral };
    if (path.includes("SetupService"))
      return { SetupService: { SelldoneActiveButtonColor: () => "#0066FF" } };
    throw new Error("Unexpected module: " + path);
  },
});
const component = { ...exports.default, render: exports.render };

// Vuetify owns the visual button; this leaf keeps its loading suppression and native RouterLink navigation.
const button = Vue.defineComponent({
  inheritAttrs: false,
  props: ["to", "loading", "href", "target"],
  emits: ["click"],
  setup(props, { emit, slots }) {
    const content = (href, navigate) =>
      Vue.h(
        "a",
        {
          href,
          target: props.target,
          "aria-busy": String(!!props.loading),
          onClick(event) {
            if (props.loading) {
              event.preventDefault();
              return;
            }
            emit("click", event);
            if (navigate) navigate(event);
            else event.preventDefault();
          },
        },
        slots.default?.(),
      );
    return () =>
      props.to
        ? Vue.h(
            RouterLink,
            { to: props.to, custom: true },
            { default: ({ href, navigate }) => content(href, navigate) },
          )
        : content(props.href);
  },
});

function mount(props, router) {
  const host = document.createElement("div");
  document.body.append(host);
  const emitted = [];
  const app = Vue.createApp(component, {
    ...props,
    onClick: (event) => emitted.push(event),
  });
  app.component("v-btn", button);
  for (const tag of ["v-badge", "v-icon", "v-avatar"])
    app.component(tag, {
      inheritAttrs: false,
      setup:
        (_, { slots }) =>
        () =>
          Vue.h("span", slots.default?.()),
    });
  if (router) app.use(router);
  else app.config.globalProperties.$router = undefined;
  const state = app.mount(host);
  return {
    host,
    state,
    emitted,
    click() {
      host
        .querySelector("a")
        .dispatchEvent(
          new window.MouseEvent("click", { bubbles: true, cancelable: true }),
        );
    },
    dispose() {
      app.unmount();
      host.remove();
    },
  };
}

test("circle button template, TypeScript and scoped Sass compile", async () => {
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: file.pathname,
      id: "circle-button-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("aborted and duplicated native navigation release loading so the next click works; unmount removes the hook", async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ["/start", "/overview", "/other"].map((path) => ({
      path,
      component: { render: () => null },
    })),
  });
  await router.push("/start");
  await router.isReady();
  let decide,
    registered = 0,
    removed = 0;
  router.beforeEach((to) =>
    to.path === "/overview"
      ? new Promise((resolve) => {
          decide = resolve;
        })
      : true,
  );
  const afterEach = router.afterEach.bind(router);
  router.afterEach = (callback) => {
    registered++;
    const remove = afterEach(callback);
    return () => {
      removed++;
      remove();
    };
  };
  const settle = () =>
    new Promise((resolve) => {
      const remove = afterEach((_to, _from, failure) => {
        remove();
        resolve(failure);
      });
    });
  const mounted = mount(
    {
      to: { path: "/overview" },
      tooltip: "Overview",
      icon: "dashboard",
      badgeNumber: 3,
    },
    router,
  );
  let disposed = false;
  try {
    assert.equal(mounted.state.formatedNumberValue, "3");
    const abort = settle();
    mounted.click();
    await new Promise((resolve) => setImmediate(resolve));
    await Vue.nextTick();
    assert.equal(mounted.state.in_loading, true);
    assert.equal(
      mounted.host.querySelector("a").getAttribute("aria-busy"),
      "true",
    );
    decide(false);
    assert.equal(
      isNavigationFailure(await abort, NavigationFailureType.aborted),
      true,
    );
    await Vue.nextTick();
    assert.equal(router.currentRoute.value.path, "/start");
    assert.equal(mounted.state.in_loading, false);
    assert.equal(
      mounted.host.querySelector("a").getAttribute("aria-busy"),
      "false",
    );
    assert.equal(registered, 1);

    const success = settle();
    mounted.click();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(mounted.state.in_loading, true);
    decide(true);
    assert.equal(await success, undefined);
    await Vue.nextTick();
    assert.equal(router.currentRoute.value.path, "/overview");
    assert.equal(mounted.state.in_loading, false);

    const duplicated = settle();
    mounted.click();
    assert.equal(
      isNavigationFailure(await duplicated, NavigationFailureType.duplicated),
      true,
    );
    await Vue.nextTick();
    assert.equal(mounted.state.in_loading, false);
    assert.equal(
      mounted.host.querySelector("a").getAttribute("aria-busy"),
      "false",
    );
    assert.equal(mounted.emitted.length, 3);
    assert.equal(mounted.state.clicked, true);

    mounted.dispose();
    disposed = true;
    assert.equal(removed, 1);
    mounted.state.in_loading = true;
    await router.push("/other");
    assert.equal(mounted.state.in_loading, true);
  } finally {
    if (!disposed) mounted.dispose();
  }
});

test("standalone non-route callers retain click and badge behavior without a router", async () => {
  const mounted = mount({
    tooltip: "Action",
    icon: "add",
    badgeNumber: 4,
    persistBadge: true,
  });
  try {
    mounted.click();
    await Vue.nextTick();
    assert.equal(mounted.emitted.length, 1);
    assert.equal(mounted.state.clicked, true);
    assert.equal(mounted.state.badge_value, true);
    assert.equal(mounted.state.in_loading, false);
  } finally {
    mounted.dispose();
  }
});
