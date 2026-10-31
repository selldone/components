import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";

const filename = fileURLToPath(new URL("./BTaxProfileInput.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "tax-profile-input-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "tax-profile-input-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const node = (type, text = "") => ({ type, text, props: {}, children: [], parent: null });
const renderer = Vue.createRenderer({
  createElement: type => node(type), createText: text => node("text", text), createComment: text => node("comment", text),
  insert(child, parent, anchor = null) {
    if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
    parent.children.splice(anchor ? parent.children.indexOf(anchor) : parent.children.length, 0, child); child.parent = parent;
  },
  remove(child) { if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1); },
  setText(child, text) { child.text = text; }, setElementText(child, text) { child.text = text; child.children = []; },
  patchProp(child, key, old, value) { child.props[key] = value; }, parentNode: child => child.parent,
  nextSibling: child => child.parent?.children[child.parent.children.indexOf(child) + 1] || null,
});
const nodes = current => [current, ...current.children.flatMap(nodes)];
const text = current => nodes(current).map(item => item.text).join(" ").replace(/\s+/g, " ").trim();
const tKey = key => key.replace("product_tax_profile.refined.", "");
const profile = (extra = {}) => ({ id: 12, name: "Appliances", enable: true, fix: true,
  fix_vat: 20, shipping: true, fix_shipping: 5, included: false, ...extra });

async function fixture(t, extra = {}, attributes = {}) {
  const context = vm.createContext({ exports: {}, require: name => {
    assert.equal(name, "vue"); return Vue;
  } });
  vm.runInContext(`(() => { ${transpile(script.content)} })()`, context);
  const component = context.exports.default;
  context.exports = {};
  vm.runInContext(`(() => { ${transpile(template.code)} })()`, context);
  component.render = context.exports.render;
  const state = Vue.reactive({ shop: { tax_profiles: [profile()] }, modelValue: 12, ...extra });
  const calls = { native: null, updates: [], errors: [], warnings: [] };
  const select = Vue.defineComponent({ name: "VSelect", inheritAttrs: false,
    props: { modelValue: {}, returnObject: Boolean, items: Array, variant: String, flat: Boolean,
      solo: Boolean, bgColor: String, label: String, placeholder: String, clearable: Boolean,
      hideDetails: Boolean, messages: String, menuProps: Object },
    setup(props, { attrs, slots, emit }) {
      return () => {
        calls.native = { props, attrs, emit };
        const chosen = props.items.find(item => item.id === (props.returnObject ? props.modelValue?.id : props.modelValue));
        return Vue.h("native-select", attrs, [slots["prepend-inner"]?.(),
          chosen && slots.selection?.({ item: { raw: chosen } }),
          ...props.items.map(item => Vue.h("option", { id: item.id }, slots.item?.({ item: { raw: item }, props: { title: item.name } }))),
        ]);
      };
    },
  });
  const app = renderer.createApp({ render: () => Vue.h(component, { ...state, ...attributes,
    "onUpdate:modelValue": value => calls.updates.push(value) }) });
  app.component("VSelect", select);
  for (const name of ["VListItem", "VListItemTitle", "VIcon", "VChip"]) app.component(name,
    Vue.defineComponent({ name, inheritAttrs: false,
      setup(_, { attrs, slots }) { return () => Vue.h(name, attrs, [slots.prepend?.(), slots.title?.(), slots.subtitle?.(), slots.default?.(), slots.append?.()]); },
    }));
  app.config.globalProperties.$t = tKey;
  app.config.warnHandler = warning => calls.warnings.push(warning);
  app.config.errorHandler = error => calls.errors.push(error);
  const root = node("root"); app.mount(root); await Vue.nextTick();
  t.after(() => { app.unmount(); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.warnings, []); });
  return { state, calls, root, component, options: () => nodes(root).filter(item => item.type === "option") };
}

test("native selector, both presentation branches and scoped styles compile", async () => {
  for (const style of descriptor.styles) assert.deepEqual((await compileStyleAsync({
    source: style.content, filename, id: "tax-profile-input-test", scoped: style.scoped,
  })).errors, []);
});

test("legacy callers keep defaults, finance attributes and native object selection/clear", async t => {
  const item = profile();
  const f = await fixture(t, { modelValue: item, returnObject: true, variant: "outlined", flat: true,
    solo: true, backgroundColor: "surface" }, { label: "Finance picker", disabled: true });
  assert.equal(f.component.props.modern.default, false);
  assert.equal(f.calls.native.props.label, "Finance picker");
  assert.equal(f.calls.native.props.variant, "outlined");
  assert.equal(f.calls.native.props.returnObject, true);
  assert.equal(f.calls.native.props.flat, true);
  assert.equal(f.calls.native.props.solo, true);
  assert.equal(f.calls.native.props.bgColor, "surface");
  assert.equal(f.calls.native.attrs.disabled, true);
  assert.match(text(f.root), /Goods:/);
  const selected = profile({ id: 14, name: "Another profile" });
  f.calls.native.emit("update:modelValue", selected);
  f.calls.native.emit("update:modelValue", null);
  assert.equal(f.calls.updates[0], selected);
  assert.equal(f.calls.updates[1], null);
});

test("modern selector shows only the name while native options retain correct tax facts", async t => {
  const f = await fixture(t, { modern: true, shop: { tax_profiles: [
    profile(), profile({ id: 13, name: "Shipping off", shipping: false, fix_shipping: 99 }),
    profile({ id: 14, name: "Location", fix: false, included: true }),
    profile({ id: 15, name: "Provider", meta: { external_tax: { enabled: true, provider: "stripe_tax" } } }),
    profile({ id: 16, name: "Disabled", enable: false, fix_vat: 99 }),
  ] } });
  const chosen = nodes(f.root).find(item => item.props.class === "b-tax-profile-input__selection");
  assert.equal(text(chosen), "Appliances");
  assert.equal(f.calls.native.props.label, "label_selected");
  assert.equal(f.calls.native.props.hideDetails, true);
  assert.equal(f.calls.native.props.messages, undefined);
  const options = f.options().map(text);
  assert.match(options[0], /goods: 20% · shipping: 5%/);
  assert.match(options[0], /tax_excluded/);
  assert.match(options[1], /shipping: not_applied/);
  assert.doesNotMatch(options[1], /99%/);
  assert.match(options[2], /by_location · tax_included/);
  assert.match(options[3], /provider_stripe · tax_excluded/);
  assert.doesNotMatch(options[3], /20%/);
  assert.match(options[4], /disabled/);
  assert.doesNotMatch(options[4], /99%|tax_excluded/);
});

test("clearing inherits defaults without synthetic profiles or changed native ID events", async t => {
  const f = await fixture(t, { modern: true, modelValue: null });
  assert.equal(f.calls.native.props.placeholder, "store_default");
  assert.equal(f.options().length, 1);
  assert.equal(nodes(f.root).some(item => item.type === "VChip"), false);
  f.calls.native.emit("update:modelValue", 13);
  f.calls.native.emit("update:modelValue", null);
  assert.deepEqual(f.calls.updates, [13, null]);
  f.state.shop = { tax_profiles: [profile({ id: 14, name: "Current shop" })] };
  await Vue.nextTick();
  assert.equal(f.options().length, 1);
  assert.match(text(f.options()[0]), /Current shop/);
  assert.doesNotMatch(text(f.root), /Appliances/);
  f.state.shop = {}; await Vue.nextTick();
  assert.equal(f.options().length, 0);
});

test("external metadata must be enabled and name a provider before suppressing internal facts", async t => {
  const f = await fixture(t, { modern: true, shop: { tax_profiles: [
    profile({ meta: { external_tax: { enabled: false, provider: "stripe_tax" } } }),
    profile({ id: 13, meta: { external_tax: { enabled: true } } }),
    profile({ id: 14, meta: { external_tax: { enabled: true, provider: "other" } } }),
  ] } });
  const options = f.options().map(text);
  assert.match(options[0], /goods: 20%/);
  assert.match(options[1], /goods: 20%/);
  assert.match(options[2], /external · tax_excluded/);
});
