import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const { descriptor, errors } = parse(
  readFileSync(new URL("./BProductAddFull.vue", import.meta.url), "utf8"),
);
assert.deepEqual(errors, []);
const compiled = ts.transpileModule(descriptor.script.content, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;

const productTypes = Object.fromEntries(
  ["PHYSICAL", "VIRTUAL", "FILE", "SERVICE", "SUBSCRIPTION"].map((code) => [
    code,
    { code, name: code, color: "fixture-color", image: "fixture.svg" },
  ]),
);
const expectedTabs = {
  PHYSICAL: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11],
  VIRTUAL: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11],
  FILE: [1, 2, 3, 4, 5, 7, 10, 11],
  SERVICE: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11],
  SUBSCRIPTION: [1, 2, 3, 4, 5, 7, 10, 11],
};
const exports = {};
vm.runInNewContext(compiled, {
  exports,
  require(name) {
    if (name.includes("ProductType")) return { ProductType: productTypes };
    if (name.includes("PricingTypes")) return { PricingTypes: { FIX: { code: "FIX" } } };
    if (name.includes("BusinessModel"))
      return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
    if (name.includes("ShopOptionsHelper"))
      return {
        ShopOptionsHelper: {
          GetActiveTypes: (shop) => shop.types || Object.keys(productTypes),
        },
      };
    if (name.includes("TrackSeller")) return { TrackSeller: { onAddProduct() {} } };
    if (name.toLowerCase().includes("slugify")) return { Slugify: { apply: (value) => value } };
    if (name === "@selldone/core-js")
      return { Article: { Types: { Product: { code: "Product" } } } };
    if (name === "vue") return Vue;
    return { default: {} };
  },
});
const component = exports.default;

function fixture({ modern = true, type = "PHYSICAL", created = true, ...overrides } = {}) {
  const state = {
    ...component.data(),
    modern,
    type: productTypes[type],
    shop: { id: 42, model: "NORMAL", types: Object.keys(productTypes) },
    $shop: { id: 42, currencies: ["USD"] },
    $product: {
      id: created ? 31 : null,
      type,
      title: "Fixture product",
      inputs: [],
      outputs: [],
    },
    $route: { params: {}, matched: [], hash: "" },
    $refs: {},
    $t: (key) => key,
    $emit() {},
    $nextTick: (callback) => Promise.resolve().then(callback),
    ...overrides,
  };
  for (const [name, method] of Object.entries(component.methods)) {
    state[name] = method.bind(state);
  }
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(state, name, {
      configurable: true,
      get: getter.bind(state),
    });
  }
  return state;
}

test("The modern preview blocks underlying saves and navigation until it closes", async () => {
  for (const options of [{ modern: true }, { modern: false, modernGeneral: true }]) {
    for (const step of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) {
      const state = fixture({ ...options, step, show_preview: true });
      const calls = [];
      state.editProduct = () => calls.push("product save");
      state.addProduct = () => calls.push("product creation");
      state.$refs.stepForm = { validate: async () => { calls.push("validation"); return { valid: true }; } };
      state.active_editor = {
        calculatePrice: 0,
        saveSpec: () => calls.push("specification save"),
        setExtraInfo: () => calls.push("shipping save"),
        saveChange: () => calls.push("description save"),
      };
      assert.equal(state.flowSubmitDisabled, true);
      assert.equal(state.flowBusy, false, "Reading a preview is not a product request");
      await state.submitStep();
      state.nextStep();
      assert.deepEqual(calls, []);
      assert.equal(state.step, step);
      state.show_preview = false;
      assert.equal(state.flowSubmitDisabled, false);
    }
    const state = fixture({ ...options, step: 3, show_preview: true });
    state.show_preview = false;
    state.nextStep();
    assert.equal(state.step, 4, "Closing the preview restores normal navigation");
  }
  const legacy = fixture({ modern: false, step: 3, show_preview: true });
  assert.equal(legacy.flowSubmitDisabled, false);
  await legacy.submitStep();
  assert.equal(legacy.step, 4, "The legacy inline preview does not block its form");
});

test("Modern preview is deliberate while legacy sections retain automatic previews", () => {
  for (const step of [2, 3, 4, 7, 10]) {
    for (const options of [{ modern: true }, { modern: false, modernGeneral: true }]) {
      assert.equal(fixture({ ...options, step }).force_show_preview, false);
    }
    assert.equal(fixture({ modern: false, step }).force_show_preview, step !== 4);
  }
});

test("Inventory Finish waits for the product save and never saves stock or variant drafts", () => {
  for (const options of [{ modern: true }, { modern: false, modernGeneral: true }]) {
    const state = fixture({ ...options, step: 11 });
    const editor = { workspaceBusy: false, saveBlocked: false, saveVariant() { assert.fail("Variant saves belong to the variant dialog"); } };
    state.active_editor = editor;
    state.stepEditors[11] = editor;
    let completed;
    let finished = 0;
    state.editProduct = (callback) => { completed = callback; };
    state.finish = () => finished++;
    state.nextStep();
    assert.equal(finished, 0, "Failed or unresolved product saving cannot finish");
    completed();
    assert.equal(finished, 1);
    state.nextStep();
    state.step = 7;
    completed();
    assert.equal(finished, 1, "A stale completion cannot finish another tab");
  }
});

test("Inventory requests and pending dialogs guard Finish and section navigation", () => {
  const state = fixture({ modern: false, modernGeneral: true, step: 11, visitedSteps: [11] });
  state.active_editor = { workspaceBusy: true, saveBlocked: false };
  assert.equal(state.flowBusy, true);
  assert.equal(state.flowSubmitDisabled, true);
  assert.equal(state.canSelectStep(7), false);
  state.active_editor.workspaceBusy = false;
  state.active_editor.saveBlocked = true;
  assert.equal(state.flowSubmitDisabled, true);
  assert.equal(state.canSelectStep(7), false);
  state.active_editor.saveBlocked = false;
  assert.equal(state.flowSubmitDisabled, false);
  assert.equal(state.canSelectStep(7), true);
  state.step = 7;
  assert.equal(state.isStepMounted(11), true, "The local options and quantity draft stay mounted in Edit");
  const virtual = fixture({ modern: false, modernGeneral: true, type: "VIRTUAL", step: 7, visitedSteps: [11] });
  assert.equal(virtual.isStepMounted(11), false, "Unconverted inventory types retain active-only mounting in Edit");
});

test("Guided sections keep the correct workflow for all five product types", () => {
  for (const [type, expected] of Object.entries(expectedTabs)) {
    for (const created of [false, true]) {
      const state = fixture({ type, created });
      assert.deepEqual(Array.from(state.flowTabs, (tab) => tab.value), expected, type);
    }
  }
  const legacy = fixture({ modern: false });
  assert.equal(legacy.tabs.filter(Boolean).some((tab) => tab.value === 1), false);
});

test("Guided type selection waits for Continue, while legacy selection advances", () => {
  const guided = fixture({ created: false });
  guided.setType(productTypes.VIRTUAL);
  assert.equal(guided.$product.type, "VIRTUAL");
  assert.equal(guided.type, productTypes.VIRTUAL);
  assert.equal(guided.step, 1);

  const legacy = fixture({ modern: false, created: false });
  legacy.setType(productTypes.FILE);
  assert.equal(legacy.$product.type, "FILE");
  assert.equal(legacy.step, 2);
});

test("Guided navigation respects creation, available sections and in-flight saves", () => {
  const state = fixture({ created: false });
  state.goTo(7);
  assert.equal(state.step, 1);
  state.goTo(2);
  assert.equal(state.step, 2);
  assert.equal(state.canGoBack, true);

  state.$product.id = 31;
  assert.equal(state.canGoBack, false);
  state.goTo(1);
  assert.equal(state.step, 2);
  state.goTo(8);
  assert.equal(state.step, 2, "Physical products have no Output section");
  state.goTo(99);
  assert.equal(state.step, 2);

  state.busy = true;
  state.goTo(7);
  assert.equal(state.step, 2);
  state.busy = false;
  state.active_editor = { busy: true };
  state.goTo(7);
  assert.equal(state.step, 2);
  state.active_editor = null;
  state.goTo(7);
  assert.equal(state.step, 7);
  state.previousStep();
  assert.equal(state.step, 6);
});

test("Edit General saves in place and discards only while idle in the General section", async () => {
  const state = fixture({ modern: false, modernGeneral: true, step: 2 });
  let saved = 0;
  let advanced = 0;
  let revealed = 0;
  let discarded = 0;
  let reset = 0;
  let valid = false;
  state.active_editor = {
    hasUnsavedChanges: true,
    revealValidation: () => revealed++,
    discardChanges: () => discarded++,
  };
  state.$refs.stepForm = {
    validate: async () => ({ valid }),
    resetValidation: () => reset++,
  };
  state.editProduct = () => saved++;
  state.nextStep = () => advanced++;

  await state.submitStep();
  assert.equal(revealed, 1);
  assert.equal(saved, 0);
  valid = true;
  await state.submitStep();
  assert.equal(saved, 1);
  assert.equal(advanced, 0);
  assert.equal(state.step, 2);
  assert.equal(state.generalDirty, true);

  state.busy = true;
  state.discardGeneralChanges();
  state.busy = false;
  state.step = 4;
  state.discardGeneralChanges();
  assert.equal(discarded, 0);
  assert.equal(reset, 0);
  state.step = 2;
  state.discardGeneralChanges();
  assert.equal(discarded, 1);
  assert.equal(reset, 1);
});

test("Guided revisits retain editors without hidden refs replacing the active editor", () => {
  const state = fixture({ step: 2, visitedSteps: [2, 4] });
  const general = { draft: "Unsaved title" };
  const specifications = { draft: "Unsaved specification" };
  state.setStepEditor(general, 2);
  state.setStepEditor(specifications, 4);
  assert.equal(state.active_editor, general);

  state.goTo(4);
  component.watch.step.call(state, state.step);
  assert.equal(state.active_editor, specifications);
  assert.equal(state.isStepMounted(2), true);
  assert.equal(state.stepEditors[2], general);

  state.setStepEditor(general, 2);
  assert.equal(state.active_editor, specifications);
  state.goTo(2);
  component.watch.step.call(state, state.step);
  assert.equal(state.active_editor, general);
  assert.equal(state.isStepMounted(4), true);
  assert.equal(state.stepEditors[4].draft, "Unsaved specification");

  const legacy = fixture({ modern: false, step: 2, visitedSteps: [2, 4] });
  assert.equal(legacy.isStepMounted(2), true);
  assert.equal(legacy.isStepMounted(4), false);

  const edit = fixture({ modern: false, modernGeneral: true, step: 2, visitedSteps: [2, 9, 10] });
  assert.equal(edit.isStepMounted(9), true, "Modern Edit retains the Shipping draft on another section");
  assert.equal(edit.isStepMounted(10), true, "Modern Edit retains the Description draft on another section");
  assert.equal(edit.isStepMounted(4), false, "Unvisited and legacy save handlers retain active-only mounting");
});

test("Survey Continue only navigates because its sections save independently", async () => {
  for (const modern of [false, true]) {
    const state = fixture({ modern, modernGeneral: !modern, step: 3 });
    state.editProduct = () => assert.fail("Survey Continue must not save ordinary product fields");
    state.addProduct = () => assert.fail("Survey Continue must not create another product");
    await state.submitStep();
    assert.equal(state.step, 4);
  }
});

test("The shared action preserves validation and negative-price guards", async () => {
  const state = fixture({ created: false, step: 2 });
  let advances = 0;
  let validations = 0;
  state.nextStep = () => advances++;
  state.$refs.stepForm = {
    async validate() {
      validations++;
      return { valid: false };
    },
  };
  await state.submitStep();
  assert.equal(validations, 1);
  assert.equal(advances, 0);

  state.$refs.stepForm.validate = async () => ({ valid: true });
  await state.submitStep();
  assert.equal(advances, 1);

  state.$product.id = 31;
  state.step = 7;
  state.active_editor = { calculatePrice: -1 };
  assert.equal(state.flowSubmitDisabled, true);
  await state.submitStep();
  assert.equal(advances, 1);
});

test("An in-flight form validation cannot submit the product twice", async () => {
  const state = fixture({ created: false, step: 2 });
  let validate;
  let validations = 0;
  let advances = 0;
  state.$refs.stepForm = {
    validate() {
      validations++;
      return new Promise((resolve) => { validate = resolve; });
    },
  };
  state.nextStep = () => advances++;
  const pending = state.submitStep();
  assert.equal(state.flowBusy, true);
  await state.submitStep();
  assert.equal(validations, 1);
  validate({ valid: true });
  await pending;
  assert.equal(advances, 1);
  assert.equal(state.flowBusy, false);
});

test("Closing the workspace cancels a pending validation before product creation", async () => {
  const state = fixture({ created: false, step: 2 });
  let validate;
  let validations = 0;
  let advances = 0;
  state.$refs.stepForm = {
    validate() {
      validations++;
      return new Promise((resolve) => { validate = resolve; });
    },
  };
  state.nextStep = () => advances++;
  const pending = state.submitStep();
  component.beforeUnmount.call(state);
  validate({ valid: true });
  await pending;
  assert.equal(advances, 0);
  assert.equal(state.flowBusy, false);
  await state.submitStep();
  assert.equal(validations, 1);
});

test("The shared action retains Specification and Shipping save boundaries", async () => {
  const state = fixture({ step: 4 });
  const calls = [];
  state.nextStep = () => calls.push("advance");
  state.active_editor = {
    saveSpec: (goNext) => calls.push(["spec", goNext]),
  };
  await state.submitStep();
  assert.deepEqual(calls, [["spec", true]]);
  state.active_editor.dialog_ai = true;
  await state.submitStep();
  assert.deepEqual(calls, [["spec", true]], "The AI dialog owns Ctrl+S while open");

  state.step = 9;
  state.active_editor = { setExtraInfo: () => calls.push("shipping") };
  await state.submitStep();
  assert.deepEqual(calls, [["spec", true], "shipping"]);
});

test("Shipping shares its guarded dedicated save in Edit and Add and advances only on success", async () => {
  for (const modern of [false, true]) {
    const state = fixture({ modern, modernGeneral: !modern, step: 9 });
    let saves = 0;
    let allowSave = false;
    const shipping = {
      busy: false,
      saveBlocked: false,
      prepareSave: () => allowSave,
      setExtraInfo() { saves++; this.busy = true; },
    };
    state.active_editor = shipping;
    state.editProduct = () => assert.fail("Shipping's native success must not invoke an ordinary product PUT");

    await state.submitStep();
    assert.equal(saves, 0, "An open Shipping service dialog owns submission");
    allowSave = true;
    shipping.saveBlocked = true;
    await state.submitStep();
    assert.equal(saves, 0, "Invalid shipping values must not submit");
    shipping.saveBlocked = false;
    state.busy = true;
    await state.submitStep();
    assert.equal(saves, 0);
    state.busy = false;

    await state.submitStep();
    assert.equal(saves, 1);
    assert.equal(state.step, 9, "Pending native Shipping saves keep this section open");
    assert.equal(state.flowBusy, true);
    await state.submitStep();
    assert.equal(saves, 1, "A pending Shipping save cannot submit twice");
    assert.equal(state.canSelectStep(10), false);

    shipping.busy = false;
    assert.equal(state.step, 9, "A failed native save keeps the Shipping draft open for retry");
    await state.submitStep();
    assert.equal(saves, 2);
    state.nextStep(); // Native success emits next before its own finally releases busy.
    assert.equal(state.step, 10);
    shipping.busy = false;
  }
});

test("Guided saves advance only after success and skip unavailable sections", () => {
  for (const [type, step, destination] of [
    ["PHYSICAL", 5, 6],
    ["FILE", 5, 7],
    ["PHYSICAL", 7, 9],
    ["VIRTUAL", 7, 8],
    ["SUBSCRIPTION", 7, 10],
  ]) {
    const state = fixture({ type, step });
    let saved;
    state.editProduct = (callback) => { saved = callback; };
    state.nextStep();
    assert.equal(state.step, step, "A pending or failed save must keep its section");
    assert.equal(typeof saved, "function");
    saved();
    assert.equal(state.step, destination, type);
  }
});

test("Creation and Finish retain their successful-save boundary", () => {
  const state = fixture({ created: false, step: 2 });
  let saved;
  let finishes = 0;
  state.addProduct = (callback) => { saved = callback; };
  state.nextStep();
  assert.equal(state.step, 2);
  state.$product.id = 31;
  saved();
  assert.equal(state.step, 3);

  state.step = 11;
  state.active_editor = {};
  state.stepEditors[11] = state.active_editor;
  state.editProduct = (callback) => { saved = callback; };
  state.finish = () => finishes++;
  state.nextStep();
  assert.equal(finishes, 0);
  saved();
  assert.equal(finishes, 1);
});

test("Description continues only after the article editor saves", () => {
  for (const options of [{ modern: true }, { modern: false, modernGeneral: true }, { modern: false }]) {
    const state = fixture({ ...options, step: 10 });
    let saved;
    const article = { saveChange: (callback) => { saved = callback; } };
    if (state.modernWorkspace) state.setStepEditor(article, 10);
    else state.$refs.product_article = article;
    state.nextStep();
    assert.equal(state.step, 10);
    saved();
    assert.equal(state.step, 11);
  }
});

test("Description blocks pending or denied saves and ignores stale successful callbacks", async () => {
  for (const modern of [true, false]) {
    const state = fixture({ modern, modernGeneral: !modern, step: 10 });
    let saves = 0, complete;
    const editor = { saveBlocked: true, workspaceBusy: false, saveChange(callback) { saves++; complete = callback; } };
    state.editProduct = () => assert.fail("Description must use the article save endpoint");
    state.setStepEditor(editor, 10);
    await state.submitStep();
    state.nextStep();
    assert.equal(saves, 0, "Unconfirmed metadata and read-only editors cannot save");
    editor.saveBlocked = false;
    editor.workspaceBusy = true;
    state.goTo(7);
    assert.equal(state.step, 10, "An import or article request keeps the active section in place");
    await state.submitStep();
    assert.equal(saves, 0);
    editor.workspaceBusy = false;
    await state.submitStep();
    assert.equal(saves, 1);
    assert.equal(state.step, 10, "A failed article request leaves the current section available for retry");
    state.step = 7;
    complete();
    assert.equal(state.step, 7, "A late success cannot navigate a different section");
    state.step = 10;
    await state.submitStep();
    state.disposed = true;
    complete();
    assert.equal(state.step, 10, "A closed workspace cannot advance");
    state.disposed = false;
    await state.submitStep();
    state.setStepEditor({ saveChange() {} }, 10);
    complete();
    assert.equal(state.step, 10, "A replaced article editor cannot advance the current instance");
  }
});

test("the rendered Guided workspace shows only the active editor while retaining drafts and its sole primary action", async () => {
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: "BProductAddFull.vue",
    id: "guided-product-mounted-test",
  });
  assert.deepEqual(template.errors, []);
  const rendered = {};
  vm.runInNewContext(ts.transpileModule(template.code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports: rendered,
    require: () => Vue,
  });

  const node = (tag, text = "") => ({ tag, text, props: {}, style: {}, children: [], parent: null, scrollTo() {} });
  const renderer = Vue.createRenderer({
    createElement: (tag) => node(tag),
    createText: (text) => node("#text", text),
    createComment: (text) => node("#comment", text),
    insert(child, parent, anchor = null) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = parent;
      const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
    },
    remove(child) {
      child.parent?.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = null;
    },
    setText: (element, text) => { element.text = text; },
    setElementText: (element, text) => { element.text = text; element.children = []; },
    patchProp: (element, key, previous, value) => { element.props[key] = value; },
    parentNode: (element) => element.parent,
    nextSibling: (element) => element.parent?.children[element.parent.children.indexOf(element) + 1],
  });
  const slotStub = (tag = "div") => Vue.defineComponent({
    setup: (props, { attrs, slots }) => () => Vue.h(tag, attrs, slots.default?.()),
  });
  const editorStub = (name) => Vue.defineComponent({
    name,
    inheritAttrs: false,
    props: { externalActionButtons: Boolean, modern: Boolean, workspace: Boolean, productWorkspace: Boolean, active: Boolean, parentBusy: Boolean },
    data: () => ({ draft: "", busy: false, saveCalls: 0 }),
    methods: {
      saveSpec() { this.saveCalls++; },
      setExtraInfo() { this.saveCalls++; },
      saveChange(callback) { this.saveCalls++; this.completeSave = callback; },
    },
    render() {
      const content = Vue.h("section", { ...this.$attrs, "data-editor": name }, [
        Vue.h("input", { value: this.draft, onInput: (event) => { this.draft = event.target.value; } }),
        !this.externalActionButtons && !this.workspace && !this.productWorkspace && Vue.h("button", { class: "native-editor-save" }, "Save"),
      ]);
      // The real Specification editor has a main element and sibling dialogs.
      return name === "BProductEditSpec"
        ? [content, Vue.h("div", { hidden: true, "data-spec-dialog": true })]
        : content;
    },
  });
  const stubs = Object.fromEntries(Object.keys(component.components).map((name) => [name, slotStub()]));
  for (const name of ["Info", "Features", "Spec", "Images", "Price", "Inputs", "Outputs", "Extra"])
    stubs[`BProductEdit${name}`] = editorStub(`BProductEdit${name}`);
  stubs.ArticleViewer = editorStub("ArticleViewer");
  stubs.BProductInventoryManagement = editorStub("BProductInventoryManagement");
  stubs.VForm = Vue.defineComponent({
    methods: { validate: async () => ({ valid: true }) },
    render() { return Vue.h("form", this.$slots.default?.()); },
  });
  let previewRequests = 0;
  const app = renderer.createApp({
    ...component,
    components: stubs,
    methods: { ...component.methods, getRenderedOnGoogle() { previewRequests++; } },
    render: rendered.render,
  }, { modern: true, shop: { id: 42, model: "NORMAL", language: "en" } });
  for (const name of ["VBtn", "VIcon", "VExpandTransition", "VCard", "VCardTitle", "VCardText", "VCardActions", "VSpacer", "VRow", "VChip", "VListSubheader", "VAvatar"])
    app.component(name, slotStub(name === "VBtn" ? "button" : "div"));
  app.component("VDialog", Vue.defineComponent({
    props: { modelValue: Boolean },
    emits: ["update:modelValue"],
    setup: (props, { attrs, slots, emit }) => () => Vue.h("div", attrs, [
      slots.activator?.({ props: { "aria-haspopup": "dialog", onClick: () => emit("update:modelValue", true) } }),
      props.modelValue ? slots.default?.() : null,
    ]),
  }));
  app.component("VTooltip", Vue.defineComponent({
    props: { disabled: Boolean },
    setup(props, { attrs, slots }) {
      const active = Vue.ref(false);
      Vue.watch(() => props.disabled, (disabled) => { if (disabled) active.value = false; });
      const open = () => { if (!props.disabled) active.value = true; };
      const close = () => { active.value = false; };
      return () => Vue.h("div", attrs, [
        slots.activator?.({ props: { "aria-describedby": "fixture-tooltip", onMouseenter: open, onMouseleave: close, onFocus: open, onBlur: close } }),
        active.value && !props.disabled ? slots.default?.() : null,
      ]);
    },
  }));
  app.directive("ctrl", {});
  const failures = [];
  const warnings = [];
  app.config.errorHandler = (error) => failures.push(error);
  app.config.warnHandler = (message) => warnings.push(message);
  app.provide("$shop", { id: 42, currencies: ["USD"] });
  app.provide("$product", Vue.reactive({ id: 31, type: "PHYSICAL", title: "Fixture product", inputs: [], outputs: [] }));
  Object.assign(app.config.globalProperties, {
    $route: { params: {}, matched: [], hash: "" },
    $t: (key) => key,
    $vuetify: Vue.reactive({ display: { smAndUp: true, lgAndUp: true } }),
    USER: () => null,
  });
  const host = node("root");
  const state = app.mount(host);
  const descendants = (element) => [element, ...element.children.flatMap(descendants)];
  const text = (element) => element.text + element.children.map(text).join("");
  const classHas = (element, value) => String(element.props.class || "").split(" ").includes(value);
  const visible = (element) => {
    for (let current = element; current; current = current.parent)
      if (current.style.display === "none" || current.props.hidden) return false;
    return true;
  };
  const visibleEditors = () => descendants(host)
    .filter((element) => element.props["data-editor"] && visible(element))
    .map((element) => element.props["data-editor"]);
  const navigate = async (key) => {
    const target = descendants(host).find((element) =>
      classHas(element, "sd-modern-section-nav__item") && element.children.some((child) => child.tag === "span" && text(child) === `add_product.flow.menu.${key}`),
    );
    assert.ok(target, `Navigation for ${key}`);
    target.props.onClick();
    await Vue.nextTick();
    await Vue.nextTick();
  };
  try {
    await Vue.nextTick();
    const previewLauncher = descendants(host).find((element) => classHas(element, "b-product-add-full__preview-launcher"));
    assert.ok(previewLauncher, "Saved products expose the preview utility");
    const main = descendants(host).find((element) => element.tag === "main");
    const sidebar = descendants(host).find((element) => element.tag === "aside");
    assert.equal(descendants(sidebar).includes(previewLauncher), true);
    assert.equal(descendants(main).includes(previewLauncher), false, "Preview launches outside the edit form");
    assert.equal(descendants(main).some((element) => classHas(element, "seo-preview")), false, "The modern main content does not embed the preview");
    assert.equal(previewLauncher.props["aria-haspopup"], "dialog");
    assert.equal(previewLauncher.props["aria-describedby"], "fixture-tooltip");
    state.rendered_on_google = "<p>Existing search result</p>";
    await Vue.nextTick();
    const hoverPreview = () => descendants(host).find((element) => classHas(element, "b-product-add-full__hover-preview"));
    const loadedRequests = previewRequests;
    previewLauncher.props.onMouseenter();
    await Vue.nextTick();
    assert.ok(hoverPreview(), "Large desktop hover reveals the actual result");
    assert.equal(descendants(hoverPreview()).find((element) => classHas(element, "seo-preview")).props.innerHTML, state.rendered_on_google);
    assert.equal(state.show_preview, false, "Hover does not open the full dialog");
    assert.equal(state.flowSubmitDisabled, false, "An informational peek does not block the form");
    assert.equal(previewRequests, loadedRequests, "Hover reuses the existing result without another request");
    previewLauncher.props.onClick();
    await Vue.nextTick();
    assert.equal(state.show_preview, true);
    assert.equal(state.flowSubmitDisabled, true);
    assert.equal(hoverPreview(), undefined, "Click dismisses the peek while opening the full dialog");
    state.show_preview = false;
    await Vue.nextTick();
    previewLauncher.props.onFocus();
    await Vue.nextTick();
    assert.ok(hoverPreview(), "Keyboard focus can inspect the same result");
    previewLauncher.props.onBlur();
    await Vue.nextTick();
    assert.equal(hoverPreview(), undefined);
    for (const suppress of ["mobile", "saving", "deleting"]) {
      state.$vuetify.display.lgAndUp = suppress !== "mobile";
      state.busy = suppress === "saving";
      state.dialogDeleteProduct = suppress === "deleting";
      await Vue.nextTick();
      previewLauncher.props.onMouseenter();
      previewLauncher.props.onFocus();
      await Vue.nextTick();
      assert.equal(hoverPreview(), undefined, `${suppress} suppresses the desktop peek`);
    }
    state.busy = false;
    state.dialogDeleteProduct = false;
    state.$vuetify.display.lgAndUp = false;
    await Vue.nextTick();
    previewLauncher.props.onClick();
    await Vue.nextTick();
    assert.equal(state.show_preview, true, "Smaller screens retain the click dialog");
    assert.equal(hoverPreview(), undefined);
    state.show_preview = false;
    state.$vuetify.display.lgAndUp = true;
    await Vue.nextTick();
    const general = state.active_editor;
    assert.equal(general.$options.name, "BProductEditInfo");
    await navigate("spec");
    const specifications = state.active_editor;
    const input = descendants(host).find((element) => element.props["data-editor"] === "BProductEditSpec").children[0];
    input.props.onInput({ target: { value: "Unsaved fabric details" } });
    await Vue.nextTick();
    await navigate("general");
    assert.equal(state.active_editor, general);
    await navigate("spec");
    assert.equal(state.active_editor, specifications);
    assert.equal(specifications.draft, "Unsaved fabric details");
    assert.equal(state.stepEditors[2], general);
    assert.equal(state.stepEditors[4], specifications);

    const primary = descendants(host).filter((element) => classHas(element, "sd-modern-button--primary"));
    assert.equal(primary.length, 1);
    assert.equal(descendants(host).some((element) => classHas(element, "native-editor-save")), false);
    await primary[0].props.onClick();
    await Vue.nextTick();
    assert.equal(specifications.saveCalls, 1);
    assert.equal(general.saveCalls, 0);

    for (const [section, editor] of [["inputs", "BProductEditInputs"], ["price", "BProductEditPrice"], ["extra", "BProductEditExtra"]]) {
      await navigate(section);
      assert.deepEqual(visibleEditors(), [editor], `${section} must not show the retained Specification form`);
      assert.equal(state.active_editor.$options.name, editor);
      assert.equal(state.stepEditors[4], specifications);
      assert.equal(specifications.draft, "Unsaved fabric details");
    }
    const shipping = state.active_editor;
    assert.equal(shipping.modern, true);
    assert.equal(shipping.active, true);
    assert.equal(shipping.parentBusy, false);
    shipping.draft = "Unsubmitted package dimensions";
    state.busy = true;
    await Vue.nextTick();
    assert.equal(shipping.parentBusy, true, "The native fields freeze during the parent request");
    state.busy = false;
    await Vue.nextTick();
    await navigate("spec");
    assert.deepEqual(visibleEditors(), ["BProductEditSpec"]);
    assert.equal(state.active_editor, specifications);
    assert.equal(shipping.active, false);
    assert.equal(shipping.externalActionButtons, true);
    assert.equal(shipping.draft, "Unsubmitted package dimensions");
    shipping.$emit("next");
    assert.equal(state.step, 4, "A late event from the hidden Shipping editor cannot advance the current tab");
    await navigate("blog");
    const description = state.active_editor;
    assert.equal(description.$options.name, "ArticleViewer");
    assert.equal(description.workspace, true);
    assert.equal(description.active, true);
    description.draft = "Unsubmitted product story";
    await navigate("price");
    assert.equal(description.active, false);
    assert.equal(descendants(host).some((element) => classHas(element, "b-product-add-full__description-actions")), false, "Inactive Description has no mounted footer or Save shortcut");
    await navigate("blog");
    assert.equal(state.active_editor, description);
    assert.equal(description.draft, "Unsubmitted product story");
    assert.equal(descendants(host).filter((element) => classHas(element, "sd-modern-button--primary") && visible(element)).length, 1);
    assert.equal(descendants(host).some((element) => classHas(element, "native-editor-save") && visible(element)), false);
    state.goTo(11);
    await Vue.nextTick();
    await Vue.nextTick();
    const inventory = state.active_editor;
    assert.equal(inventory.$options.name, "BProductInventoryManagement");
    assert.equal(inventory.modern, true);
    assert.equal(inventory.productWorkspace, true);
    inventory.draft = "Unsubmitted local inventory options";
    assert.deepEqual(visibleEditors(), ["BProductInventoryManagement"]);
    assert.equal(descendants(host).filter((element) => classHas(element, "sd-modern-button--primary") && visible(element)).length, 1, "Inventory has one parent Finish action");
    await navigate("price");
    state.goTo(11);
    await Vue.nextTick();
    await Vue.nextTick();
    assert.equal(state.active_editor, inventory);
    assert.equal(inventory.draft, "Unsubmitted local inventory options");
    assert.equal(warnings.some((message) => message.includes("Runtime directive used on component with non-element root")), false);
    assert.deepEqual(failures, []);
  } finally {
    app.unmount();
  }
});
