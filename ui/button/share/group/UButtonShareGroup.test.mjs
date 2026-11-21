import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test, { after } from "node:test";
import { JSDOM } from "jsdom";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import ts from "typescript";

const { window } = new JSDOM("<!doctype html><body></body>");
const globals = ["window", "document", "navigator", "Element", "SVGElement"];
const previous = Object.fromEntries(globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
for (const name of globals) {
  Object.defineProperty(globalThis, name, { configurable: true, value: window[name] });
}
after(() => {
  for (const name of globals) {
    if (previous[name]) Object.defineProperty(globalThis, name, previous[name]);
    else delete globalThis[name];
  }
  window.close();
});

const Vue = await import("vue");
let twitterUser = "FixtureShop";
function evaluate(source) {
  const exports = {};
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  new Function("require", "exports", outputText)(name => {
    if (name === "vue") return Vue;
    if (name.endsWith("/SetupService")) return { SetupService: { GetTwitterAccount: () => twitterUser } };
    throw new Error(`Unexpected fixture dependency ${name}`);
  }, exports);
  return exports;
}

const filename = "UButtonShareGroup.vue";
const { descriptor, errors } = parse(readFileSync(new URL(`./${filename}`, import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const template = compileTemplate({ filename, source: descriptor.template.content, id: "share-group-test" });
assert.deepEqual(template.errors, []);
const component = { ...evaluate(descriptor.script.content).default, render: evaluate(template.code).render };

const url = "https://shop.example.test/product?variant=one%20two&ref=fixture#details";
const title = "چای ☕ & Honey 🍯";
const description = "A + B?";
const quote = "My #favorite";
const media = "https://images.example.test/item.png?size=42";

function fixture(t, overrides = {}) {
  const host = document.createElement("div");
  const opened = [], copied = [], events = [];
  window.open = (...args) => { opened.push(args); return null; };
  document.body.append(host);
  const app = Vue.createApp(component, {
    url, title, description, quote, media, hashtags: "one-two,other & more",
    onShare: code => events.push(["share", code]), onEmbed: () => events.push(["embed"]),
    ...overrides,
  });
  app.config.globalProperties.$t = key => key;
  app.config.globalProperties.copyToClipboard = value => copied.push(value);
  app.mount(host);
  t.after(() => { app.unmount(); host.remove(); });
  return { host, opened, copied, events, link: code => host.querySelector(`a.share-network-${code}`) };
}

test("all existing providers keep their payload fields and escape user content", t => {
  const f = fixture(t);
  const links = [...f.host.querySelectorAll("a[href]")];
  assert.deepEqual(links.map(link => link.getAttribute("aria-label")), [
    "facebook", "twitter", "linkedin", "line", "pinterest", "reddit", "telegram", "whatsapp", "skype", "sms", "email",
  ]);
  assert.equal(f.host.querySelector("a a"), null);
  for (const link of links) assert.equal(link.rel, "noopener noreferrer");
  const params = code => Object.fromEntries(new URL(f.link(code).href).searchParams);
  const message = `${title}\r\n${url}\r\n${description}`;
  assert.deepEqual(params("facebook"), { u: url, title, description, quote, hashtag: "#onetwo" });
  assert.deepEqual(params("twitter"), { text: title, url, hashtags: "onetwo,other & more", via: "FixtureShop" });
  assert.deepEqual(params("linkedin"), { url });
  assert.equal(decodeURIComponent(new URL(f.link("line").href).search.slice(1)), message);
  assert.deepEqual(params("pinterest"), { url, media, description: title });
  assert.deepEqual(params("reddit"), { url, title });
  assert.deepEqual(params("telegram"), { url, text: `${title}\r\n${description}` });
  assert.deepEqual(params("whatsapp"), { text: message });
  assert.deepEqual(params("skype"), { url: message });
  assert.deepEqual(params("sms"), { body: message });
  assert.deepEqual(params("email"), { subject: title, body: `${url}\r\n${description}` });
});

test("web, SMS, email, copy and embed keep their existing click actions", t => {
  const f = fixture(t, { embedMode: true, networks: ["facebook", "sms", "email", "copy", "embed"], embedCode: "Fixture embed" });
  for (const code of ["facebook", "sms", "email"]) f.link(code).click();
  assert.deepEqual(f.opened.map(([href, target]) => [new URL(href).protocol, target]), [
    ["https:", "_blank"], ["sms:", "_blank"], ["mailto:", "_blank"],
  ]);
  assert.match(f.opened[0][2], /^popup,noopener,noreferrer,width=626,height=436,left=-?\d+,top=-?\d+$/);
  assert.equal(f.opened[1][2], "noopener,noreferrer");
  assert.equal(f.opened[2][2], "noopener,noreferrer");
  f.host.querySelector("button.copy").click();
  f.host.querySelector("button.embed").click();
  assert.deepEqual(f.events, [["share", "facebook"], ["share", "sms"], ["share", "email"], ["share", "copy"], ["embed"]]);
  assert.deepEqual(f.copied, [url, "Fixture embed"]);
});

test("protects URLs and email headers and keeps native iOS SMS formatting", t => {
  const invalid = fixture(t, { url: "javascript:alert(1)", networks: ["facebook", "email"] });
  for (const code of ["facebook", "email"]) {
    const link = invalid.link(code);
    assert.equal(link.hasAttribute("href"), false);
    assert.equal(link.getAttribute("aria-disabled"), "true");
    link.click();
  }
  assert.deepEqual(invalid.events, []);
  assert.deepEqual(invalid.opened, []);

  Object.defineProperty(window.navigator, "userAgent", { configurable: true, value: "iPhone" });
  twitterUser = "";
  t.after(() => { delete window.navigator.userAgent; twitterUser = "FixtureShop"; });
  const f = fixture(t, { title: "Share\r\nBcc: example@example.test\ud800", hashtags: "", media: "javascript:alert(1)" });
  assert.match(f.link("sms").getAttribute("href"), /^sms:&body=/);
  assert.equal(new URL(f.link("email").href).searchParams.get("subject"), "Share Bcc: example@example.test\ufffd");
  assert.equal(new URL(f.link("pinterest").href).searchParams.get("media"), "");
  assert.deepEqual([...new URL(f.link("twitter").href).searchParams.keys()], ["text", "url"]);
});
