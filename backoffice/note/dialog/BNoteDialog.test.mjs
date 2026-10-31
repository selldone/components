import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compile } from "@vue/compiler-dom";
import { compileScript, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BNoteDialog.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "note-dialog-test" });
const syntax = ts.createSourceFile(
  "note.ts",
  script.content,
  ts.ScriptTarget.Latest,
  true,
);
const options = syntax.statements
  .find(ts.isExportAssignment)
  .expression.getText(syntax);
const componentCode = ts.transpileModule(`export default ${options}`, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const render = new Function(
  "Vue",
  compile(descriptor.template.content, {
    mode: "function",
    prefixIdentifiers: true,
  }).code,
)({
  ...Vue,
  resolveComponent: (name) => ({ name }),
  renderSlot: (slots, name) => slots[name]?.() || null,
});
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
const enabled = (value) => value === true || value === "";

function nodes(node, name, found = []) {
  if (Array.isArray(node)) {
    node.forEach((child) => nodes(child, name, found));
    return found;
  }
  if (!node || typeof node !== "object") return found;
  if (node.type?.name === name) found.push(node);
  if (Array.isArray(node.children)) nodes(node.children, name, found);
  else if (typeof node.children?.default === "function")
    nodes(node.children.default(), name, found);
  return found;
}
function text(node) {
  if (Array.isArray(node)) return node.map(text).join("");
  if (typeof node === "string") return node;
  if (!node || typeof node !== "object") return "";
  return text(
    typeof node.children?.default === "function"
      ? node.children.default()
      : node.children,
  );
}
const note = (body, user = 1) => ({
  body,
  user_id: user,
  user_name: `Staff ${user}`,
  date: "2026-10-29T10:24:00Z",
});
function fixture(
  initial = [note("First saved note"), note("Second saved note", 2)],
) {
  const requests = [],
    notifications = [],
    emitted = [],
    callbacks = [];
  const exports = {};
  vm.runInNewContext(componentCode, {
    exports,
    DateMixin: {},
    axios: Object.fromEntries(
      ["post", "delete"].map((method) => [
        method,
        (url, body) =>
          new Promise((resolve, reject) =>
            requests.push({ method, url, body, resolve, reject }),
          ),
      ]),
    ),
    NotificationService: Object.fromEntries(
      ["showSuccessAlert", "showErrorAlert", "showLaravelError"].map((name) => [
        name,
        (...args) => notifications.push({ name, args }),
      ]),
    ),
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    $: { uid: 45 },
    modelValue: true,
    title: "Fixture resource",
    icon: "fixture-resource.svg",
    target: { note: initial },
    addUrl: () => {
      callbacks.push({ method: "add" });
      return "/local/notes";
    },
    deleteUrl: (index) => {
      callbacks.push({ method: "delete", index });
      return `/local/notes/${index}`;
    },
    $t: (key) => key,
    $slots: {
      "pre-messages": () =>
        Vue.h("p", "Caller-owned request and contact details"),
    },
    $emit: (name, value) => {
      emitted.push({ name, value });
      if (name === "update:modelValue") state.modelValue = value;
    },
    getUserAvatar: (id) => `fixture-avatar-${id}.svg`,
    USER_ID: () => 9,
    USER: () => ({ name: "Current staff" }),
    getFromNowString: () => "2 hours ago",
    getLocalTimeString: () => "Oct 29, 2026, 10:24",
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  const view = () => {
    const tree = render(state, []),
      buttons = nodes(tree, "v-btn");
    const handles = (button, name) =>
      button.props?.onClick === state[name] ||
      String(button.props?.onClick).includes(name);
    return {
      tree,
      sheet: nodes(tree, "v-bottom-sheet")[0],
      textarea: nodes(tree, "v-textarea")[0],
      add: buttons.find((button) => handles(button, "addNote")),
      deletes: buttons.filter((button) => handles(button, "deleteMessage")),
      closes: buttons.filter(
        (button) =>
          text(button).includes("global.actions.close") ||
          button.props?.["aria-label"] === "global.actions.close",
      ),
    };
  };
  const type = (body) => view().textarea.props["onUpdate:modelValue"](body);
  const add = () => {
    const button = view().add;
    assert.ok(button && !button.props.disabled);
    button.props.onClick({});
  };
  const remove = (index) => view().deletes[index].props.onClick({});
  return {
    component,
    state,
    requests,
    notifications,
    emitted,
    callbacks,
    view,
    type,
    add,
    remove,
  };
}

test("public props, native bottom sheet, caller slot and message order remain available", () => {
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: file.pathname,
      id: "note-dialog-test",
    }).errors,
    [],
  );
  const f = fixture(),
    view = f.view();
  assert.deepEqual(
    Object.keys(f.component.props).sort(),
    ["addUrl", "deleteUrl", "icon", "modelValue", "target", "title"].sort(),
  );
  assert.deepEqual(Array.from(f.component.emits), ["update:modelValue"]);
  assert.ok(view.sheet);
  assert.equal(
    view.sheet.props.modelValue ?? view.sheet.props["model-value"],
    true,
  );
  assert.ok(enabled(view.sheet.props.scrollable));
  assert.ok(!enabled(view.sheet.props.persistent));
  assert.equal(f.state.notes, f.state.target.note);
  assert.ok(
    text(view.tree).includes("Caller-owned request and contact details"),
  );
  assert.ok(text(view.tree).includes("2 hours ago"));
  assert.ok(text(view.tree).includes("Oct 29, 2026, 10:24"));
  assert.ok(
    text(view.tree).indexOf("Caller-owned request") <
      text(view.tree).indexOf("First saved note"),
  );
  assert.ok(
    text(view.tree).indexOf("First saved note") <
      text(view.tree).indexOf("Second saved note"),
  );
  assert.ok(
    nodes(view.tree, "v-img").some(
      (image) => image.props.src === "fixture-resource.svg",
    ),
  );
  assert.equal(f.requests.length, 0);
});

test("empty and populated targets do not introduce a permission mode or request on render", () => {
  for (const initial of [null, [], [note("A long\n\nmultiline note")]]) {
    const f = fixture(initial);
    assert.ok(f.view().textarea);
    assert.ok(f.view().add);
    assert.equal(f.view().deletes.length, initial?.length || 0);
    assert.equal(f.requests.length, 0);
  }
});

test("1024 remains an advisory counter and the Add guard only rejects empty input", () => {
  const f = fixture([]),
    input = f.view().textarea;
  assert.equal(Number(input.props.counter), 1024);
  assert.equal(input.props.maxlength ?? input.props.maxLength, undefined);
  assert.equal(input.props.rows, 3);
  assert.ok(enabled(input.props.autoGrow ?? input.props["auto-grow"]));
  for (const body of [null, "", " ", "x".repeat(1025)]) {
    f.type(body);
    assert.equal(Boolean(f.view().add.props.disabled), !body);
    assert.equal(f.state.body_input, body);
  }
  assert.equal(f.requests.length, 0);
});

test("Add sends the original body through the caller callback and adopts the server array without closing", async () => {
  const f = fixture([]),
    body = "  Keep original whitespace\nSecond line  ";
  f.type(body);
  f.add();
  assert.equal(f.state.busy_add, true);
  assert.equal(f.view().add.props.loading, true);
  assert.deepEqual(f.callbacks, [{ method: "add" }]);
  assert.equal(f.requests[0].method, "post");
  assert.equal(f.requests[0].url, "/local/notes");
  assert.deepEqual(plain(f.requests[0].body), { body });
  assert.equal(f.state.target.note.length, 0);
  const saved = [note("Server-normalized body")];
  f.requests[0].resolve({ data: { note: saved } });
  await settle();
  assert.equal(f.state.target.note, saved);
  assert.equal(f.state.notes, saved);
  assert.equal(f.state.body_input, null);
  assert.ok(!f.state.busy_add);
  assert.equal(f.state.modelValue, true);
  assert.deepEqual(f.emitted, []);
  assert.equal(f.notifications.at(-1).name, "showSuccessAlert");
});

test("Add application, validation/access and network errors retain the draft and saved notes", async () => {
  for (const failure of ["server", "validation", "access", "network"]) {
    const f = fixture(),
      original = f.state.target.note,
      body = failure === "validation" ? "x".repeat(1025) : "Unsaved draft";
    f.type(body);
    f.add();
    const error = new Error("Local simulated network failure");
    if (failure === "network") f.requests[0].reject(error);
    else
      f.requests[0].resolve({
        data: { error: true, error_msg: `${failure} rejected` },
      });
    await settle();
    assert.equal(f.state.target.note, original);
    assert.equal(f.state.body_input, body);
    assert.equal(f.state.modelValue, true);
    assert.ok(!f.state.busy_add);
    assert.equal(
      f.notifications.at(-1).name,
      failure === "network" ? "showLaravelError" : "showErrorAlert",
    );
    assert.equal(
      f.notifications.at(-1).args.at(-1),
      failure === "network" ? error : `${failure} rejected`,
    );
  }
});

test("Close buttons and native Escape/backdrop model updates preserve drafts on reopen", () => {
  const dismissals = [
    "Escape/backdrop",
    ...fixture()
      .view()
      .closes.map((_, index) => index),
  ];
  for (const dismissal of dismissals) {
    const f = fixture();
    f.type("Keep this draft");
    const view = f.view();
    assert.ok(view.closes.length);
    if (dismissal === "Escape/backdrop")
      view.sheet.props["onUpdate:modelValue"](false);
    else view.closes[dismissal].props.onClick({});
    assert.deepEqual(f.emitted.at(-1), {
      name: "update:modelValue",
      value: false,
    });
    assert.equal(f.state.body_input, "Keep this draft");
    f.state.modelValue = true;
    assert.equal(f.view().textarea.props.modelValue, "Keep this draft");
    assert.equal(f.requests.length, 0);
  }
});

test("Delete immediately passes the original array index and replaces notes from the response", async () => {
  const f = fixture(),
    original = f.state.target.note;
  f.type("Independent draft");
  f.remove(1);
  assert.deepEqual(f.callbacks, [{ method: "delete", index: 1 }]);
  assert.equal(f.requests[0].method, "delete");
  assert.equal(f.requests[0].url, "/local/notes/1");
  assert.equal(f.state.busy_delete_message, 1);
  const buttons = f.view().deletes;
  assert.equal(buttons.length, 2);
  assert.equal(buttons[1].props.loading, true);
  assert.ok(!buttons[0].props.loading);
  assert.ok(buttons.every((button) => button.props.disabled === true));
  const saved = [original[0]];
  f.requests[0].resolve({ data: { note: saved } });
  await settle();
  assert.equal(f.state.target.note, saved);
  assert.equal(f.state.body_input, "Independent draft");
  assert.equal(f.state.busy_delete_message, null);
  assert.equal(f.state.modelValue, true);
  assert.equal(f.notifications.at(-1).name, "showSuccessAlert");
});

test("Delete application/access and network failures preserve notes and the draft", async () => {
  for (const network of [false, true]) {
    const f = fixture(),
      original = f.state.target.note;
    f.type("Keep draft");
    f.remove(0);
    const error = new Error("Local delete failed");
    if (network) f.requests[0].reject(error);
    else
      f.requests[0].resolve({
        data: { error: true, error_msg: "Access denied" },
      });
    await settle();
    assert.equal(f.state.target.note, original);
    assert.equal(f.state.body_input, "Keep draft");
    assert.equal(f.state.busy_delete_message, null);
    assert.equal(
      f.notifications.at(-1).name,
      network ? "showLaravelError" : "showErrorAlert",
    );
    assert.equal(
      f.notifications.at(-1).args.at(-1),
      network ? error : "Access denied",
    );
  }
});

test("closing does not cancel a pending add/delete or clear a failed draft", async () => {
  for (const operation of ["add", "delete"])
    for (const success of [false, true]) {
      const f = fixture();
      f.type("Pending draft");
      if (operation === "add") f.add();
      else f.remove(0);
      const view = f.view();
      assert.ok(
        view.closes.every(
          (button) => !button.props.disabled && !button.props.loading,
        ),
      );
      view.sheet.props["onUpdate:modelValue"](false);
      assert.equal(f.state.modelValue, false);
      assert.ok(
        operation === "add"
          ? f.state.busy_add
          : f.state.busy_delete_message === 0,
      );
      const saved = [note("Returned while closed")];
      f.requests[0].resolve({
        data: success
          ? { note: saved }
          : { error: true, error_msg: "Rejected" },
      });
      await settle();
      assert.equal(f.state.modelValue, false);
      assert.ok(!f.state.busy_add);
      assert.equal(f.state.busy_delete_message, null);
      if (success) assert.equal(f.state.target.note, saved);
      assert.equal(
        f.state.body_input,
        operation === "add" && success ? null : "Pending draft",
      );
    }
});

test("add and delete loading states stay independent", async () => {
  const f = fixture();
  f.type("Still pending");
  f.add();
  assert.equal(f.state.busy_add, true);
  assert.equal(f.state.busy_delete_message, null);
  assert.ok(
    f.view().deletes.every((button) => button.props.disabled === false),
  );
  f.remove(1);
  assert.equal(f.requests.length, 2);
  assert.equal(f.state.busy_add, true);
  assert.equal(f.state.busy_delete_message, 1);
  f.requests[1].resolve({ data: { note: [f.state.target.note[0]] } });
  await settle();
  assert.equal(f.state.busy_delete_message, null);
  assert.equal(f.state.busy_add, true);
  f.requests[0].reject(new Error("Local add failure"));
  await settle();
  assert.ok(!f.state.busy_add);
  assert.equal(f.state.body_input, "Still pending");
});
