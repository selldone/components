import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { setImmediate } from "node:timers/promises";
import test from "node:test";
import vm from "node:vm";
import { compileTemplate, parse } from "@vue/compiler-sfc";
import { JSDOM } from "jsdom";
import * as Vue from "vue";
import ts from "typescript";

const compile = source => ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const plain = value => JSON.parse(JSON.stringify(value));
const files = { inputs: "./BProductEditInputs.vue", preview: "./BProductInputsPreview.vue", builder: "../../../../ui/form/SFormBuilder.vue", row: "../../../../ui/form/item/SFormBuilderRow.vue" };
const nativeFields = () => [
  { type: null, title: "Name", name: "name", hint: "Public hint", custom: { preserved: [1, false, null] } },
  { type: "select", title: "Packaging", name: "packaging", selects: ["Paper", "Box"], multiple: true },
  { type: "switch", title: "Receipt", name: "receipt", default: false, hint_true: "Yes hint", hint_false: "No hint" },
  { type: "file", title: "Reference", name: "reference", multiple: true, types: ["pdf", "custom"] },
  { type: "note", title: "<b>Useful note</b>" },
];

function fixture(name = "inputs", { product = {}, ...overrides } = {}) {
  const { descriptor, errors } = parse(readFileSync(new URL(files[name], import.meta.url), "utf8"));
  assert.deepEqual(errors, []);
  const document = new JSDOM("", { url: "https://fixture.invalid/" }).window.document;
  const requests = [], events = [], notices = [];
  const endpoints = scope => new Proxy({}, { get: (_, action) => (...ids) => `/fixture/${scope}/${String(action)}/${ids.join("/")}` });
  const html = {}, checkout = {}, row = {};
  const context = vm.createContext({
    exports: {}, document, URL, self: {}, KeyboardEvent: document.defaultView.KeyboardEvent,
    axios: { put: (url, payload) => new Promise((resolve, reject) => requests.push({ url, payload, reject, resolve: data => resolve({ data }) })) },
    window: { API: endpoints("shop"), VAPI: endpoints("vendor") },
    require(path) {
      if (path === "vue") return Vue;
      if (path.includes("HtmlHelper")) return html;
      if (path.includes("BShopCheckoutFormPreview")) return checkout;
      if (path.includes("SFormBuilderRow")) return row;
      if (path.includes("Slugify")) return { Slugify: { apply: value => value } };
      if (path.includes("NotificationService")) return { default: Object.fromEntries(["showErrorAlert", "showSuccessAlert", "showLaravelError"].map(method => [method, (...args) => notices.push({ method, args })])) };
      return { default: {} };
    },
  });
  const evaluate = (source, exports) => { context.exports = exports; vm.runInContext(`{${compile(source)}\n}`, context); };
  evaluate(readFileSync(new URL("../../../../../core-js/helper/html/HtmlHelper.ts", import.meta.url), "utf8"), html);
  const checkoutDescriptor = parse(readFileSync(new URL("../../../shop/options/checkout-form/preview/BShopCheckoutFormPreview.vue", import.meta.url), "utf8")).descriptor;
  evaluate(checkoutDescriptor.script.content, checkout);
  const rowDescriptor = parse(readFileSync(new URL(files.row, import.meta.url), "utf8")).descriptor;
  evaluate(rowDescriptor.script.content, row);
  const exports = {}; evaluate(descriptor.script.content, exports);
  const component = exports.default;
  const defaults = Object.fromEntries(Object.entries(component.props || {}).filter(([, prop]) => prop?.default !== undefined).map(([key, prop]) => [key, typeof prop.default === "function" ? prop.default() : prop.default]));
  const state = {
    ...defaults, ...component.data(), modern: true,
    product: { id: 31, shop_id: 42, title: "Fixture product", message: "Instructions", inputs: nativeFields(), ...product },
    structure: [], $refs: {}, $el: document.createElement("div"),
    $emit: (...args) => events.push(args), $forceUpdate() {},
    $nextTick: callback => Promise.resolve().then(() => callback?.call(state)),
    $t: (key, values = {}) => key + (Object.keys(values).length ? ":" + JSON.stringify(values) : ""),
    getShopImagePath: path => path,
    ...overrides,
  };
  for (const [key, method] of Object.entries(component.methods || {})) state[key] = method.bind(state);
  for (const [key, value] of Object.entries(component.computed || {})) Object.defineProperty(state, key, {
    configurable: true, get: (typeof value === "function" ? value : value.get).bind(state),
    ...(value.set ? { set: value.set.bind(state) } : {}),
  });
  component.created?.call(state);
  return { state, component, descriptor, requests, events, notices, context, document };
}

function renderedNodes(descriptor, state) {
  const output = compileTemplate({ source: descriptor.template.content, filename: "customer-input-fixture.vue", id: "customer-input-check" });
  assert.deepEqual(output.errors, []);
  const exports = {};
  vm.runInNewContext(compile(output.code), { exports, require: () => ({
    ...Vue, resolveComponent: name => ({ name }), resolveDynamicComponent: name => ({ name }),
    resolveDirective: () => ({}), withDirectives: node => node,
    renderSlot: (slots, name, props, fallback) => Vue.h(Vue.Fragment, null, slots?.[name]?.(props) || fallback?.() || []),
  }) });
  const nodes = [];
  function visit(node) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    nodes.push({ ...node, type: node.type?.name || node.type }); visit(node.children);
    if (node.children?.default) visit(node.children.default({}));
    if (node.children?.item) (state.structure || []).forEach((element, index) => visit(node.children.item({ element, index })));
  }
  visit(exports.render(state, [])); return nodes;
}

test("modern is opt-in and empty/null/undefined schemas stay empty without initial mutations or requests", () => {
  for (const inputs of [undefined, null, []]) {
    const { state, component, requests, events } = fixture("inputs", { product: { message: undefined, inputs } });
    assert.equal(component.props.modern.default, false);
    assert.equal(state.product.inputs, inputs);
    assert.deepEqual(plain(state.inputs), []);
    assert.equal(state.hasUnsavedChanges, false);
    assert.equal(requests.length, 0); assert.equal(events.length, 0);
    const builder = fixture("builder", { structure: state.inputs, focused: true, compact: true, hasFile: true });
    assert.equal(builder.events.length, 0);
  }
});

test("dirty state includes instructions, nested native schema and order while discard restores an independent complete copy", () => {
  const { state, requests } = fixture();
  const original = plain(state.product.inputs), originalMessage = state.product.message;
  state.message = "A".repeat(300);
  state.inputs[0].custom.preserved.push("Late draft"); state.inputs.reverse();
  assert.equal(state.hasUnsavedChanges, true);
  const draft = state.inputs;
  state.discardChanges();
  assert.equal(state.product.message, originalMessage);
  assert.deepEqual(plain(state.inputs), original);
  assert.notEqual(state.inputs, draft);
  assert.equal(state.hasUnsavedChanges, false);
  state.inputs[0].custom.preserved.push("Second draft"); state.discardChanges();
  assert.deepEqual(plain(state.inputs), original, "A restored draft must not mutate its saved baseline");
  assert.equal(requests.length, 0);
});

test("an unchanged product ID does not reset the baseline on nested edits; a new product closes transient editors", () => {
  const { state, component } = fixture();
  state.inputs[0].title = "Changed";
  assert.equal(state.hasUnsavedChanges, true);
  state.previewOpen = state.arrangeOpen = state.instructionsOpen = true;
  state.product = { id: 32, inputs: null, message: null };
  component.watch["product.id"].call(state);
  assert.equal(state.previewOpen, false); assert.equal(state.arrangeOpen, false); assert.equal(state.instructionsOpen, false);
  assert.equal(state.hasUnsavedChanges, false);
});

for (const restriction of ["inherited", "saving"]) {
  test(`${restriction} inputs freeze setters and discard while preserving the native schema`, () => {
    const { state, descriptor } = fixture("inputs", { product: restriction === "inherited" ? { parent_id: 8 } : {}, busy: restriction === "saving" });
    const before = plain(state.product);
    state.message = "Denied change"; state.inputs = []; state.discardChanges();
    assert.equal(state.readOnly, true); assert.deepEqual(plain(state.product), before);
    const nodes = renderedNodes(descriptor, state);
    assert.equal(nodes.find(node => node.type === "s-form-builder").props["read-only"], true);
    assert.equal(nodes.find(node => node.type === "v-textarea").props.disabled, true);
  });
}

test("Preview, Arrange and busy guard every submit path; inherited inputs may continue without local changes", () => {
  const { state, events, requests } = fixture();
  state.message = "Local change";
  for (const key of ["previewOpen", "arrangeOpen", "busy"]) {
    state[key] = true; state.submit(); state.discardChanges();
    assert.equal(state.product.message, "Local change"); assert.equal(events.length, 0);
    state[key] = false;
  }
  state.submit();
  assert.deepEqual(events, [["next"]]); assert.equal(state.hasUnsavedChanges, true); assert.equal(requests.length, 0);
  const inherited = fixture("inputs", { product: { parent_id: 8 } }); inherited.state.submit();
  assert.deepEqual(inherited.events, [["next"]]);
});

test("the rendered modern editor uses the native five-type builder without adding Required or key-value controls", () => {
  const { state, descriptor } = fixture();
  const nodes = renderedNodes(descriptor, state), builder = nodes.find(node => node.type === "s-form-builder");
  assert.equal(builder.props.modern, ""); assert.equal(builder.props.compact, ""); assert.equal(builder.props["has-file"], "");
  assert.equal(builder.props["has-required"], undefined); assert.equal(builder.props["has-key-value"], undefined);
  builder.props.onDialogChange(true); assert.equal(state.saveBlocked, true);
  state.externalActionButtons = true;
  assert.equal(renderedNodes(descriptor, state).some(node => node.props?.["aria-keyshortcuts"] === "Control+s"), false);
});

test("preview snapshots and answers are isolated from the editable product and close resets local answers", () => {
  const { state, component, events, requests } = fixture("preview");
  const before = plain(state.product);
  component.watch.modelValue.handler.call(state, true);
  assert.equal(state.answers[2], false); assert.deepEqual(plain(state.answers[1]), []);
  state.fields[0].custom.preserved.push("Preview-only change"); state.answers[0] = "Synthetic answer";
  assert.deepEqual(plain(state.product), before);
  state.close();
  assert.deepEqual(plain(state.fields), []); assert.deepEqual(plain(state.answers), []);
  assert.deepEqual(events, [["update:modelValue", false]]); assert.equal(requests.length, 0);
  state.openPreview(); assert.equal(state.answers[0], "");
  component.watch["product.id"].call(state); assert.equal(state.fields.length, 0);
});

test("preview uses the real shared sanitizer and cannot load merchant media, execute HTML or navigate", () => {
  const { state, document } = fixture("preview");
  const html = state.sanitizeNote('<b>Safe</b>\n<script>window.compromised=1</script><img src="https://example.test/private.png" alt="Image description" onerror="alert(1)"><a href="javascript:alert(1)">Bad</a><a href="https://example.test">External</a><svg onload="alert(1)"><circle /></svg><iframe src="https://example.test"></iframe><p onclick="alert(1)">Text');
  const container = document.createElement("div"); container.innerHTML = html;
  assert.equal(container.querySelector("b").textContent, "Safe");
  assert.ok(container.textContent.includes("Image description"));
  assert.equal(container.querySelectorAll("script,img,iframe,svg,[onerror],[onclick],[href]").length, 0);
  assert.ok(container.querySelector("br"));
});

test("note-only and empty previews have no answer controls; file preview is informational without an uploader", () => {
  for (const inputs of [null, [{ type: "note", title: "Note only" }]]) {
    const { state, descriptor } = fixture("preview", { product: { message: "", inputs } }); state.openPreview();
    assert.equal(state.hasContent, false);
    assert.equal(renderedNodes(descriptor, state).some(node => ["v-text-field", "v-select", "u-smart-switch", "input"].includes(node.type)), false);
  }
  const { state, descriptor } = fixture("preview", { product: { message: "", inputs: [{ type: "file", title: "Reference", multiple: true }] } }); state.openPreview();
  const nodes = renderedNodes(descriptor, state);
  assert.equal(state.hasContent, true);
  assert.ok(nodes.some(node => node.props?.["aria-disabled"] === "true"));
  assert.equal(nodes.some(node => ["v-file-input", "s-image-uploader", "input"].includes(node.type)), false);
});

test("the actual workspace opts Add and Edit into modern Customer input and preserves the legacy branch", () => {
  const { descriptor } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
  function find(node) { if (node.tag === "b-product-edit-inputs") return node; for (const child of node.children || []) { const value = find(child); if (value) return value; } }
  const element = find(descriptor.template.ast); assert.ok(element);
  const exports = {}; vm.runInNewContext(compile(descriptor.script.content), { exports, require: path => path === "vue" ? Vue : { default: {} } });
  for (const [modern, modernGeneral, expected] of [[true, false, true], [false, true, true], [false, false, false]]) {
    const state = { modern, modernGeneral, modernWorkspace: exports.default.computed.modernWorkspace.call({ modern, modernGeneral }), $product: { id: 31 }, busy: true, TAB_INPUTS: 6, setStepEditor() {}, nextStep() {} };
    const editor = renderedNodes({ template: { content: element.loc.source } }, state).find(node => node.type === "b-product-edit-inputs");
    assert.equal(editor.props.modern, expected); assert.equal(editor.props.busy, true);
  }
});

test("compact builder controls are isolated from legacy and existing focused Checkout callers", () => {
  for (const [modern, focused, compact, expected] of [[false, true, true, false], [true, false, true, false], [true, true, false, false], [true, true, true, true]]) {
    const { state, component, descriptor } = fixture("builder", { modern, focused, compact, structure: nativeFields(), hasFile: true });
    assert.equal(component.props.compact.default, false);
    assert.equal(state.compactMode, expected);
    state.showOrderDialog(); assert.equal(state.dialog_order, expected);
    const nodes = renderedNodes(descriptor, state);
    const drag = nodes.find(node => node.type === "draggable");
    assert.equal(drag.props.handle, ".drag--handle");
    assert.equal(nodes.some(node => node.type === "v-dialog"), expected);
    assert.equal(nodes.find(node => node.type === "s-form-builder-row").props.compact, expected);
  }
});

test("native schema edits and keyboard reorder preserve runtime identity without adding persisted IDs", () => {
  const fields = nativeFields();
  const { state, events, requests, component } = fixture("builder", { structure: fields, focused: true, compact: true, hasFile: true });
  assert.deepEqual(plain(state.item_types.map(item => item.value)), [null, "select", "switch", "file", "note"]);
  const first = fields[0], second = fields[1], key = state.fieldKey(first);
  assert.equal(state.fieldKey(Vue.reactive(first)), key);
  state.moveField(1, -1);
  assert.equal(state.structure[0], second); assert.equal(state.structure[1], first);
  assert.equal(state.activeItem, first); assert.equal(state.fieldKey(state.structure[1]), key);
  assert.deepEqual(first.custom, { preserved: [1, false, null] });
  const count = events.length; state.moveField(0, -1); assert.equal(events.length, count);
  state.removeField(1); assert.equal(state.activeItem, state.structure[1]);
  state.addField("file");
  assert.deepEqual(plain(state.structure.at(-1)), { name: "", title: "", type: "file" });
  assert.equal(state.activeItem, state.structure.at(-1));
  assert.equal(state.structure.some(field => Object.hasOwn(field, "id")), false);
  component.watch.dialog_order.handler.call(state, true);
  assert.deepEqual(events.at(-1), ["dialog-change", true]);
  assert.equal(requests.length, 0);
});

test("read-only compact builder prevents add/remove/reorder and opening Arrange", () => {
  const fields = nativeFields(), before = plain(fields);
  const { state, descriptor, events } = fixture("builder", { structure: fields, focused: true, compact: true, readOnly: true });
  state.addField(null); state.removeField(0); state.moveField(0, 1); state.showOrderDialog();
  assert.deepEqual(plain(fields), before); assert.equal(events.length, 0); assert.equal(state.dialog_order, false);
  assert.equal(renderedNodes(descriptor, state).find(node => node.type === "draggable").props.disabled, true);
});

test("closing Arrange restores its connected row trigger and ignores a detached trigger", async () => {
  const { state, component, document, events } = fixture("builder", { structure: nativeFields(), focused: true, compact: true });
  const trigger = document.createElement("button"); document.body.append(trigger);
  state.showOrderDialog(trigger);
  component.watch.dialog_order.handler.call(state, true);
  assert.equal(state.dialog_order, true);
  state.dialog_order = false; component.watch.dialog_order.handler.call(state, false);
  await setImmediate();
  assert.equal(document.activeElement, trigger);
  assert.deepEqual(events.at(-1), ["dialog-change", false]);
  let staleFocus = 0;
  state.showOrderDialog({ isConnected: false, disabled: false, focus() { staleFocus++; } });
  state.dialog_order = false; component.watch.dialog_order.handler.call(state, false);
  await setImmediate(); assert.equal(staleFocus, 0);
});

test("a locked schema field protects only its identifier and retains its native editable label and removal", () => {
  const item = { ...nativeFields()[0], locked: true };
  const { state, descriptor, events } = fixture("row", { item, itemTypes: [{ value: null, title: "Text", icon: "text_fields" }], focused: true, compact: true, selected: true });
  const fields = renderedNodes(descriptor, state).filter(node => node.type === "v-text-field");
  const identifier = fields.find(node => node.props.modelValue === item.name);
  const title = fields.find(node => node.props.modelValue === item.title);
  assert.equal(identifier.props.disabled, true); assert.equal(identifier.props.readonly, true);
  assert.equal(title.props.disabled, false);
  title.props["onUpdate:modelValue"]("Updated locked-field label");
  assert.equal(item.title, "Updated locked-field label"); assert.equal(item.name, "name");
  state.removeField(); assert.deepEqual(events.at(-1), ["remove"]);
  state.readOnly = true; const count = events.length; state.removeField(); state.arrangeFields({ detail: 0 });
  assert.equal(events.length, count);
});

test("compact digests describe all native types and drag release does not open keyboard Arrange", () => {
  const { state, component, events } = fixture("row", { item: nativeFields()[0], itemTypes: [], focused: true, compact: true });
  assert.match(state.compactDigest, /Public hint/);
  state.item = nativeFields()[1]; assert.match(state.compactDigest, /"count":2/); assert.match(state.compactDigest, /multiple_choices/);
  state.item = nativeFields()[2]; assert.match(state.compactDigest, /default_no/);
  state.item = nativeFields()[3]; assert.match(state.compactDigest, /multiple_files.*pdf, custom/);
  state.item = { type: "note", title: "<b>Note heading</b><br>Helpful body" };
  assert.equal(state.compactTitle, "Note heading"); assert.match(state.compactDigest, /Helpful body/);
  assert.equal(state.compactDigest.includes("<b>"), false);
  component.watch.collapse.call(state, true); state.arrangeFields({ detail: 1 }); assert.equal(events.length, 0);
  const trigger = { focus() {} };
  component.watch.collapse.call(state, true); state.arrangeFields({ detail: 0, currentTarget: trigger }); assert.deepEqual(events.at(-1), ["arrange", trigger]);
});

for (const [key, ref] of [["selects", "choicesInput"], ["types", "fileTypesInput"]]) {
  test(`compact ${key} Plus delegates to the existing native Enter handler and respects editing guards`, () => {
    const { state, document } = fixture("row", { item: nativeFields()[1], focused: true, compact: true });
    const element = document.createElement("div"), input = document.createElement("input"); element.append(input);
    const control = { $el: element, search: "Custom token" }, received = [];
    state.$refs[ref] = control;
    input.addEventListener("keydown", event => {
      received.push([event.key, event.bubbles, event.cancelable]);
      // The existing combobox owns selection and clears its search after Enter.
      control.search = "";
    });
    state.addToken(key);
    assert.deepEqual(received, [["Enter", true, true]]); assert.equal(control.search, "");
    for (const restriction of ["readOnly", "compact"]) {
      const previous = state[restriction]; state[restriction] = restriction === "readOnly";
      control.search = "Preserved search"; state.addToken(key);
      assert.equal(received.length, 1); assert.equal(control.search, "Preserved search"); state[restriction] = previous;
    }
    control.search = "   "; state.addToken(key); state.addToken("unsupported");
    assert.equal(received.length, 1);
  });
}

for (const [modern, vendorPanel] of [[false, false], [true, false], [false, true], [true, true]]) {
  test(`${vendorPanel ? "Vendor" : "Shop"} ${modern ? "Add" : "Edit"} Customer input keeps its draft/tab on failed PUT and marks saved only after successful retry`, async () => {
    const { state: editor, context, requests } = fixture();
    const { descriptor } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
    context.exports = {}; vm.runInContext(`{${compile(descriptor.script.content)}\n}`, context);
    const workspace = {
      modern, modernGeneral: !modern, modernWorkspace: true, busy: false, disposed: false,
      step: 6, active_editor: editor, stepEditors: { 6: editor }, type: { code: "PHYSICAL" },
      flowTabs: [{ value: 6 }, { value: 7 }], flowStepIndex: 0, completedSteps: [],
      shop: { id: 42 }, vendor: { id: 9 }, IS_VENDOR_PANEL: vendorPanel, $product: editor.product, $t: key => key, $emit() {},
    };
    for (const [key, method] of Object.entries(context.exports.default.methods)) workspace[key] = method.bind(workspace);
    for (const key of ["flowBusy", "flowSubmitDisabled"]) Object.defineProperty(workspace, key, { get: context.exports.default.computed[key].bind(workspace) });
    workspace.getRenderedOnGoogle = () => {};
    Object.defineProperty(editor, "busy", { get: () => workspace.busy });
    editor.message = "Updated instructions"; editor.inputs[0].title = "Updated label";
    editor.previewOpen = true; await workspace.submitStep(); workspace.nextStep(); assert.equal(requests.length, 0);
    editor.previewOpen = false; editor.arrangeOpen = true; await workspace.submitStep(); assert.equal(requests.length, 0);
    editor.arrangeOpen = false;
    editor.previewOpen = false; workspace.nextStep(); workspace.nextStep();
    assert.equal(requests.length, 1); assert.match(requests[0].url, vendorPanel ? /vendor\/PUT_MY_VENDOR_EDIT_PRODUCT\/9\/31$/ : /shop\/PUT_EDIT_PRODUCT\/42\/31$/);
    assert.equal(requests[0].payload.message, "Updated instructions");
    assert.deepEqual(plain(requests[0].payload.inputs[0].custom), { preserved: [1, false, null] });
    assert.equal(workspace.step, 6); assert.equal(editor.hasUnsavedChanges, true);
    editor.message = "Blocked during PUT"; editor.inputs = [];
    assert.equal(editor.message, "Updated instructions"); assert.equal(editor.inputs.length, 5);
    requests[0].resolve({ error: true, error_msg: "Fixture save failure" }); await setImmediate();
    assert.equal(workspace.step, 6); assert.equal(editor.hasUnsavedChanges, true); assert.equal(workspace.busy, false);
    workspace.nextStep(); requests[1].reject(new Error("Fixture transport failure")); await setImmediate();
    assert.equal(workspace.step, 6); assert.equal(editor.hasUnsavedChanges, true); assert.equal(workspace.busy, false);
    workspace.nextStep(); requests[2].resolve({ product: { ...editor.product } }); await setImmediate();
    assert.equal(workspace.step, 7); assert.equal(editor.hasUnsavedChanges, false);
  });
}

test("a successful Price PUT also refreshes the mounted Customer input baseline while a failed PUT leaves its draft dirty", async () => {
  const { state: editor, context, requests } = fixture();
  const { descriptor } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
  context.exports = {}; vm.runInContext(`{${compile(descriptor.script.content)}\n}`, context);
  const workspace = {
    modern: true, modernWorkspace: true, busy: false, disposed: false, step: 6,
    active_editor: editor, stepEditors: { 6: editor }, type: { code: "PHYSICAL" },
    flowTabs: [{ value: 6 }, { value: 7 }], shop: { id: 42 }, IS_VENDOR_PANEL: false,
    $product: editor.product, $t: key => key, $emit() {},
  };
  for (const [key, method] of Object.entries(context.exports.default.methods)) workspace[key] = method.bind(workspace);
  Object.defineProperty(workspace, "flowBusy", { get: context.exports.default.computed.flowBusy.bind(workspace) });
  Object.defineProperty(editor, "busy", { get: () => workspace.busy });
  workspace.getRenderedOnGoogle = () => {};
  editor.message = "Instructions saved from Price"; editor.inputs[0].title = "Label saved from Price";
  const originalBaseline = editor.savedSnapshot;
  workspace.goTo(7); workspace.setStepEditor({}, 7);
  assert.equal(workspace.step, 7); assert.equal(workspace.stepEditors[6], editor);
  workspace.editProduct();
  assert.equal(requests[0].payload.message, "Instructions saved from Price");
  assert.equal(requests[0].payload.inputs[0].title, "Label saved from Price");
  requests[0].resolve({ error: true, error_msg: "Fixture Price save failure" }); await setImmediate();
  assert.equal(editor.hasUnsavedChanges, true); assert.equal(editor.savedSnapshot, originalBaseline);
  workspace.editProduct(); requests[1].resolve({ product: plain(editor.product) }); await setImmediate();
  assert.equal(editor.hasUnsavedChanges, false);
  assert.notEqual(editor.savedSnapshot, originalBaseline);
  editor.inputs[0].title = "A later unsaved edit"; editor.message = "A later unsaved instruction";
  editor.discardChanges();
  assert.equal(editor.inputs[0].title, "Label saved from Price");
  assert.equal(editor.message, "Instructions saved from Price");
});

test("the actual Edit Inputs wrapper retains its editor and Discard baseline across navigation while removing inactive Save and Ctrl+S", async () => {
  const child = fixture();
  const { descriptor: parent } = parse(readFileSync(new URL("../../add/full/BProductAddFull.vue", import.meta.url), "utf8"));
  function findWrapper(node) {
    if (node.tag === "div" && node.children?.some(child => child.tag === "b-product-edit-inputs")) return node;
    for (const child of node.children || []) { const found = findWrapper(child); if (found) return found; }
  }
  const wrapper = findWrapper(parent.template.ast); assert.ok(wrapper);
  const parentExports = {};
  vm.runInNewContext(compile(parent.script.content), { exports: parentExports, require: path => path === "vue" ? Vue : { default: {} } });
  function render(source) {
    const result = compileTemplate({ source, filename: "mounted-inputs.vue", id: "mounted-inputs" }); assert.deepEqual(result.errors, []);
    const exports = {}; vm.runInNewContext(compile(result.code), { exports, require: () => Vue }); return exports.render;
  }
  const node = (tag, text = "") => ({ tag, text, props: {}, style: {}, children: [], parent: null, focus() {} });
  const renderer = Vue.createRenderer({
    createElement: tag => node(tag), createText: text => node("#text", text), createComment: text => node("#comment", text),
    insert(child, parent, anchor = null) {
      if (child.parent) child.parent.children.splice(child.parent.children.indexOf(child), 1);
      child.parent = parent; const index = anchor ? parent.children.indexOf(anchor) : -1;
      parent.children.splice(index < 0 ? parent.children.length : index, 0, child);
    },
    remove(child) { child.parent?.children.splice(child.parent.children.indexOf(child), 1); child.parent = null; },
    setText: (node, text) => { node.text = text; }, setElementText: (node, text) => { node.text = text; node.children = []; },
    patchProp: (node, key, previous, value) => { node.props[key] = value; },
    parentNode: node => node.parent, nextSibling: node => node.parent?.children[node.parent.children.indexOf(node) + 1],
  });
  const slotStub = (tag = "div") => Vue.defineComponent({ setup: (_, { attrs, slots }) => () => Vue.h(tag, attrs, slots.default?.()) });
  const editor = {
    ...child.component, render: render(child.descriptor.template.content),
    components: {
      SFormBuilder: Vue.defineComponent({ setup: (_, { slots }) => () => Vue.h("section", slots["toolbar-actions"]?.()) }),
      BProductInputsPreview: Vue.defineComponent({ render: () => null }),
      BProductEditInfoIcon: slotStub("svg"), SWidgetButtons: slotStub(),
    },
  };
  const actualParent = parentExports.default;
  const app = renderer.createApp({
    inject: ["$product"],
    data: () => ({ step: 6, modern: false, modernGeneral: true, visitedSteps: [2, 4, 5, 6], stepEditors: {}, active_editor: null, busy: false, TAB_INPUTS: 6, replaceHashRoute: false }),
    computed: { modernWorkspace: actualParent.computed.modernWorkspace },
    methods: { isStepMounted: actualParent.methods.isStepMounted, setStepEditor: actualParent.methods.setStepEditor, nextStep() {} },
    watch: { step: actualParent.watch.step },
    components: { BProductEditInputs: editor }, render: render(wrapper.loc.source),
  });
  for (const name of ["VBtn", "VTooltip", "VTextarea"]) app.component(name, slotStub(name === "VBtn" ? "button" : name === "VTextarea" ? "textarea" : "span"));
  const shortcuts = new Set();
  app.directive("ctrl", { mounted: element => shortcuts.add(element), unmounted: element => shortcuts.delete(element) });
  const failures = []; app.config.errorHandler = error => failures.push(error);
  app.config.warnHandler = () => {};
  app.config.globalProperties.$t = key => key;
  const product = Vue.reactive({ id: 31, message: "Saved instruction", inputs: nativeFields() });
  app.provide("$product", product);
  const host = node("root"), workspace = app.mount(host);
  const descendants = node => [node, ...node.children.flatMap(descendants)];
  const text = node => node.text + node.children.map(text).join("");
  const saves = () => descendants(host).filter(node => node.props["aria-keyshortcuts"] === "Control+s");
  try {
    await Vue.nextTick();
    const inputs = workspace.stepEditors[6]; assert.ok(inputs);
    const baseline = inputs.savedSnapshot;
    inputs.message = "Unsaved instruction"; inputs.inputs[0].title = "Unsaved label";
    await Vue.nextTick(); assert.equal(inputs.hasUnsavedChanges, true); assert.equal(saves().length, 1); assert.equal(shortcuts.size, 1);
    workspace.step = 7; await Vue.nextTick(); await Vue.nextTick();
    assert.equal(workspace.stepEditors[6], inputs, "Inputs keeps its exact mounted component instance");
    assert.equal(inputs.savedSnapshot, baseline); assert.equal(inputs.hasUnsavedChanges, true);
    assert.equal(saves().length, 0); assert.equal(shortcuts.size, 0, "Inactive Inputs has no mounted Ctrl+S directive");
    assert.equal(host.children.find(node => node.tag === "div").style.display, "none");
    assert.equal(workspace.isStepMounted(2), true);
    assert.equal(workspace.isStepMounted(4), false); assert.equal(workspace.isStepMounted(5), false, "Other Edit sections retain their active-only mounting");
    workspace.step = 6; await Vue.nextTick(); await Vue.nextTick();
    assert.equal(workspace.active_editor, inputs); assert.equal(inputs.hasUnsavedChanges, true);
    assert.equal(saves().length, 1); assert.equal(shortcuts.size, 1);
    const discard = descendants(host).find(node => node.tag === "button" && text(node) === "add_product.inputs_modern.discard"); assert.ok(discard);
    discard.props.onClick(); await Vue.nextTick();
    assert.equal(product.message, "Saved instruction"); assert.equal(product.inputs[0].title, "Name"); assert.equal(inputs.hasUnsavedChanges, false);
    assert.deepEqual(failures, []);
  } finally { app.unmount(); }
});
