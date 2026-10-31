import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { JSDOM } from "jsdom";
import ts from "typescript";

// Compile real components; keep identity, clipboard and link creation local.
const calls = [];
const copied = [];
const feedback = [];
const copyNodes = [];
const links = [];
function evaluate(source, require, globals = {}) {
  const exports = {};
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  vm.runInNewContext(result.outputText, { exports, require, ...globals });
  return exports;
}
const clipboardDOM = new JSDOM("<!doctype html><body></body>");
const clipboardDocument = clipboardDOM.window.document;
Object.defineProperty(clipboardDOM.window.HTMLElement.prototype, "innerText", {
  get() {
    return this.textContent;
  },
});
clipboardDocument.execCommand = (command) => {
  assert.equal(command, "copy");
  copied.push(clipboardDocument.querySelector("textarea").value);
  return true;
};
const CopyDirective = evaluate(
  readFileSync(
    new URL("../../../directives/copy/CopyDirective.ts", import.meta.url),
    "utf8",
  ),
  (name) => {
    if (name.includes("NotificationService"))
      return {
        default: {
          showSuccessAlert: (title, message) =>
            feedback.push({ title, message }),
        },
      };
    throw new Error(`Unexpected dependency: ${name}`);
  },
  { document: clipboardDocument },
).default;
async function load(path, require) {
  const filename = new URL(path, import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
    filename: filename.pathname,
  });
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: filename.pathname,
    id: "user-box-test",
    transformAssetUrls: false,
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: filename.pathname,
      id: "data-v-user-box-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
  return {
    ...evaluate(descriptor.script.content, require).default,
    render: evaluate(template.code, require).render,
  };
}
const Whatsapp = await load(
  "../../../ui/button/whatsapp/UButtonWhatsapp.vue",
  (name) => {
    if (name === "vue") return Vue;
    if (name.includes("SocialNetwork"))
      return {
        SocialNetwork: { WhatsApp: { code: "whatsapp" } },
        CreateSocialConnectLink(network, phone, options) {
          links.push({ network, phone, options: { ...options } });
          return `https://example.test/${network}/${phone}?text=${encodeURIComponent(options.text)}`;
        },
      };
    throw new Error(`Unexpected dependency: ${name}`);
  },
);
const UserBox = await load("./BUserBox.vue", (name) => {
  if (name === "vue") return Vue;
  if (name.endsWith("UButtonWhatsapp.vue")) return { default: Whatsapp };
  if (name.includes("RouteMixin")) return { RouteMixin: {} };
  if (name.includes("DateMixin")) return { default: {} };
  throw new Error(`Unexpected dependency: ${name}`);
});

const leaf = (name, tag = "div") =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        calls.push({ name, attrs });
        return Vue.h(tag, { ...attrs, "data-leaf": name }, slots.default?.());
      };
    },
  });
const overlay = (kind) =>
  Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        const activators =
          slots.activator?.({ props: { "aria-describedby": "user-help" } }) ??
          [];
        calls.push({ name: kind, attrs, activators });
        return Vue.h("section", { "data-overlay": kind }, [
          ...activators,
          Vue.h("div", { id: "user-help", role: "tooltip" }, slots.default?.()),
        ]);
      };
    },
  });
const user = {
  id: 12,
  name: "Sample owner",
  verified: true,
  email: "owner@example.test",
  phone: "+1 202 555 0143",
};
async function render(props = {}) {
  calls.length = 0;
  copyNodes.length = 0;
  const app = Vue.createSSRApp(UserBox, { user, ...props });
  app.component("v-avatar", leaf("avatar"));
  app.component("v-img", leaf("image", "img"));
  app.component("v-row", leaf("row"));
  app.component("v-icon", leaf("icon", "span"));
  app.component("v-btn", leaf("button", "a"));
  app.component("v-tooltip", overlay("tooltip"));
  app.component("v-menu", overlay("menu"));
  app.directive("copy", {
    getSSRProps: (binding, node) => {
      copyNodes.push({ binding, node });
      return { "data-copy": true };
    },
  });
  Object.assign(app.config.globalProperties, {
    getUserAvatar: (id) => `/avatar/${id}`,
    getFromNowString: () => "2 hours ago",
    USER: () => ({ name: "Merchant" }),
    $t: (key, values) =>
      key === "global.instance_message"
        ? `${values.name} / ${values.author} / ${values.company}`
        : key,
  });
  return renderToString(app);
}
const activators = () => calls.flatMap((call) => call.activators ?? []);
const copyActions = () =>
  copyNodes.filter(
    ({ node }) =>
      node.type === "button" && node.props?.class === "b-user-box__value",
  );

test("default callers retain legacy avatar sizes, contacts and WhatsApp operation", async () => {
  assert.equal(UserBox.props.modern.default, false);
  const html = await render();
  assert.match(html, /Sample owner/);
  assert.match(html, /owner@example.test/);
  assert.match(html, /\+1 202 555 0143/);
  assert.equal(calls.find((call) => call.name === "avatar").attrs.size, 42);
  assert.equal(
    calls.find((call) => call.name === "image").attrs.src,
    "/avatar/12",
  );
  assert.equal((html.match(/data-copy="true"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /b-user-box--modern|sd-modern-icon-button/);
  assert.equal(calls.find((call) => call.name === "button").attrs.size, 28);
  assert.equal(
    calls.find((call) => call.name === "menu").attrs["open-on-hover"],
    "",
  );
  await render({ small: true });
  assert.equal(calls.find((call) => call.name === "avatar").attrs.size, 32);
});

test("modern owner uses the real identity and described verification/contact controls", async () => {
  const html = await render({ modern: true, avatarClass: "sample-avatar" });
  assert.match(html, /b-user-box--modern text-start/);
  assert.match(html, /Sample owner/);
  assert.match(html, /owner@example.test/);
  assert.equal(calls.find((call) => call.name === "avatar").attrs.size, 25);
  assert.match(
    calls.find((call) => call.name === "avatar").attrs.class,
    /sample-avatar/,
  );
  assert.equal(
    calls.find((call) => call.name === "image").attrs.src,
    "/avatar/12",
  );
  const verification = calls.find((call) =>
    call.activators?.some(
      (node) => node.props?.["aria-label"] === "global.commons.verified_user",
    ),
  );
  for (const option of ["open-on-hover", "open-on-focus", "open-on-click"])
    assert.equal(verification.attrs[option], "");
  assert.equal(verification.attrs.location, "top");
  assert.equal(
    verification.attrs["content-class"],
    "sd-modern-tooltip text-start",
  );
  assert.equal(
    verification.activators[0].props["aria-describedby"],
    "user-help",
  );
  let stopped = false;
  verification.activators[0].props.onClick({
    stopPropagation() {
      stopped = true;
    },
  });
  assert.equal(stopped, true);
  assert.equal(calls.filter((call) => call.name === "menu").length, 0);
  assert.equal(copyActions().length, 2);
});

test("text copy uses the real directive, current full values and feedback without row navigation", async () => {
  copied.length = 0;
  feedback.length = 0;
  clipboardDocument.body.innerHTML = await render({ modern: true });
  let navigated = 0;
  clipboardDocument
    .querySelector(".b-user-box--modern")
    .addEventListener("click", () => navigated++);
  const elements = clipboardDocument.querySelectorAll("button[data-copy]");
  const actions = copyActions();
  for (const [index, [field, value]] of [
    ["email", user.email],
    ["phone", user.phone],
  ].entries()) {
    const element = elements[index];
    const { node, binding } = actions[index];
    assert.equal(element.type, "button");
    assert.equal(
      node.props["aria-label"],
      `global.actions.copy global.commons.${field}: ${value}`,
    );
    assert.equal(
      binding.value,
      undefined,
      "unbound copy reads the current text instead of caching a value",
    );
    assert.equal(element.textContent.trim(), value);
    assert.equal(element.classList.contains("sd-modern-icon-button"), false);
    element.addEventListener("click", node.props.onClick);
    CopyDirective.mounted(element, binding);
    assert.equal(element.classList.contains("animate-underline"), true);
    const click = new clipboardDOM.window.MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    });
    element.querySelector("bdi").dispatchEvent(click);
    assert.equal(copied.at(-1), value);
    assert.equal(click.defaultPrevented, false);
    assert.deepEqual(feedback.at(-1), {
      title: null,
      message: "Copied successfully.",
    });
    assert.equal(clipboardDocument.querySelector("textarea"), null);
    const updated =
      field === "email"
        ? "Complete.Updated.Owner.With.Long.Name@example.test"
        : "+98 912 345 6789";
    element.querySelector("bdi").textContent = updated;
    CopyDirective.updated(element, binding);
    element
      .querySelector("bdi")
      .dispatchEvent(
        new clipboardDOM.window.MouseEvent("click", { bubbles: true }),
      );
    assert.equal(copied.at(-1), updated);
    CopyDirective.unmounted(element);
    const count = copied.length;
    element.click();
    assert.equal(
      copied.length,
      count,
      "directive cleanup removes its copy listener",
    );
  }
  assert.equal(navigated, 0);
});

test("native call and WhatsApp keep their independent links and stop row navigation", async () => {
  links.length = 0;
  await render();
  const legacyLink = calls.find((call) => call.name === "button").attrs.href;
  await render({ modern: true });
  const call = activators().find((node) =>
    node.props?.href?.startsWith("tel:"),
  );
  assert.equal(call.type, "a");
  assert.equal(call.props.href, `tel:${user.phone}`);
  assert.equal(call.props.target, undefined);
  assert.equal(call.props.class, "sd-modern-icon-button");
  assert.equal(call.props["aria-label"], `global.actions.call ${user.phone}`);
  assert.equal(call.props["aria-describedby"], "user-help");
  const tooltip = calls.find((entry) => entry.activators?.includes(call));
  assert.equal(tooltip.attrs.location, "top");
  assert.equal(tooltip.attrs["content-class"], "sd-modern-tooltip text-start");
  for (const option of ["open-on-hover", "open-on-focus"])
    assert.equal(tooltip.attrs[option], "");
  let stopped = false,
    prevented = false;
  call.props.onClick({
    stopPropagation() {
      stopped = true;
    },
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(stopped, true);
  assert.equal(prevented, false);
  const whatsapp = calls.find((call) => call.name === "button").attrs;
  stopped = false;
  whatsapp.onClick({
    stopPropagation() {
      stopped = true;
    },
  });
  assert.equal(stopped, true);
  assert.equal(whatsapp.href, legacyLink);
  assert.equal(whatsapp.target, "_blank");
  assert.equal(whatsapp.class, "sd-modern-icon-button");
  assert.deepEqual(links[0], links[1]);
  assert.deepEqual(links[1], {
    network: "whatsapp",
    phone: user.phone,
    options: { text: "Sample owner / Merchant / global.selldone" },
  });
});

test("missing contacts stay absent, and default/modern modes preserve ban and block indicators", async () => {
  for (const contacts of [{ email: user.email }, { phone: user.phone }, {}]) {
    const html = await render({
      modern: true,
      user: { id: user.id, name: user.name, ...contacts },
    });
    assert.equal(copyActions().length, Object.keys(contacts).length);
    assert.equal(
      activators().filter((node) => node.props?.href?.startsWith("tel:"))
        .length,
      contacts.phone ? 1 : 0,
    );
    assert.equal(
      calls.filter((call) => call.name === "button").length,
      contacts.phone ? 1 : 0,
    );
    assert.doesNotMatch(html, /global.commons.verified_user/);
    if (!contacts.email) assert.doesNotMatch(html, /global.commons.email/);
    if (!contacts.phone) assert.doesNotMatch(html, /global.commons.phone/);
  }
  for (const modern of [false, true]) {
    const withoutContacts = await render({
      modern,
      user: { id: user.id, name: user.name },
    });
    assert.doesNotMatch(
      withoutContacts,
      /global.commons.email|global.commons.phone|data-leaf="row"|data-leaf="button"/,
    );
    const html = await render({
      modern,
      user: { ...user, ban: "spam", block_at: "2026-10-29", block_hours: 3 },
    });
    assert.match(html, /User banned for spam/);
    assert.match(html, /Blocked by system at 2 hours ago for 3 hours!/);
    assert.match(html, />block<|>block\s*</);
    assert.match(html, /crisis_alert/);
    assert.match(await render({ modern, user: null }), /Not set!/);
  }
});
