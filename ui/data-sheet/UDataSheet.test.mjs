import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse } from "@vue/compiler-sfc";
import ts from "typescript";
import * as Vue from "vue";

const { descriptor, errors } = parse(readFileSync(new URL("./UDataSheet.vue", import.meta.url), "utf8"));
assert.deepEqual(errors, []);
const transpile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const helperExports = {};
vm.runInNewContext(transpile(readFileSync(new URL("./data-sheet.ts", import.meta.url), "utf8")), { exports: helperExports });
const componentSource = transpile(descriptor.script.content);
const plain = value => JSON.parse(JSON.stringify(value));
const pathKey = (...path) => helperExports.sheetPathKey(path);

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// Exercise the real component methods with synthetic pages; never mount or access an API.
function fixture(activeElement = null, options = {}) {
  const exports = {}, events = [], copies = [];
  vm.runInNewContext(componentSource, {
    exports,
    require(name) {
      if (name === "vue") return Vue;
      if (name === "./data-sheet") return helperExports;
      assert.fail(`Unexpected component dependency: ${name}`);
    },
    navigator: { clipboard: { writeText(text) { const copy = { text, ...deferred() }; copies.push(copy); return copy.promise; } } },
    document: { activeElement, createElement: () => ({ getContext: () => ({ measureText: value => ({ width: value.length * 7 }) }) }) },
    getComputedStyle: () => ({ direction: options.direction || "ltr", fontFamily: "Synthetic" }),
    window: options.window === undefined ? { localStorage: options.storage } : options.window,
    fetch: () => assert.fail("The sheet must not make requests"),
    axios: new Proxy({}, { get: () => assert.fail("The sheet must not make requests") }),
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    items: [
      { id: 1, name: "Alex", email: "alex@example.test", data: { profile: { city: "Paris" }, enabled: false } },
      { id: 2, name: "Nora", email: "nora@example.test", data: { profile: { city: "Tokyo" }, budget: 0 } },
    ],
    columns: [
      { key: "name", title: "Contact", fixed: true, sortable: true, width: 224 },
      { key: "email", title: "Email", sortable: true, visible: false },
      { key: "phone", title: "Phone", sortable: false, visible: false },
    ],
    loading: false,
    error: null,
    search: "",
    extraDataKey: "data",
    rowKey: "id",
    rowOffset: 10,
    sortBy: [],
    storageKey: options.storageKey || "",
    $slots: {},
    $refs: { fullscreenTarget: { syntheticTarget: true } },
    $t: key => key,
    $n: value => String(value),
    $emit: (name, payload) => events.push({ name, payload }),
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) Object.defineProperty(state, name, { get: getter.bind(state), configurable: true });
  component.watch.columns.handler.call(state, state.columns);
  return { component, state, events, copies };
}

function chooseExtra(state, ...path) {
  const key = pathKey(...path);
  state.openColumns();
  state.toggleDraft(key, true);
  state.applyColumns();
  return state.visibleColumns.find(column => column.key === key);
}

test("chosen JSON columns survive pagination when the next page lacks their path", () => {
  const { state, component } = fixture();
  const column = chooseExtra(state, "profile", "city");
  assert.equal(state.cellValue(state.items[0], column).value, "Paris");
  assert.equal(state.keyDiscovery.keys.find(key => key.key === column.key).count, 2);

  state.items = [{ id: 3, name: "Sam", data: { another: 7 } }];
  component.watch.items.call(state);
  assert.ok(state.visibleColumns.some(value => value.key === column.key));
  assert.deepEqual(plain(state.cellValue(state.items[0], column)), { exists: false });
  assert.equal(state.keyDiscovery.keys.some(key => key.key === column.key), false);
  state.openColumns();
  assert.equal(state.missingDraftCount, 1);
  state.applyColumns();
  assert.ok(state.visibleColumns.some(value => value.key === column.key));
});

test("removing the selected column clears its cell coordinate and retains the frozen identity", () => {
  const { state } = fixture();
  const column = chooseExtra(state, "profile", "city");
  state.inspectCell(state.items[0], 0, column);
  assert.equal(state.selectedCoordinate, "B11");
  state.openColumns();
  state.toggleDraft(column.key, false);
  state.toggleDraft("name", false);
  state.applyColumns();
  assert.equal(state.selected, null);
  assert.equal(state.selectedCoordinate, "");
  assert.ok(state.visibleColumns.some(value => value.key === "name"));
  assert.equal(state.visibleColumns.some(value => value.key === column.key), false);
});

test("canceling column selection leaves native visibility and JSON columns unchanged", () => {
  const { state } = fixture();
  const before = plain(state.layout);
  state.openColumns();
  state.toggleDraft("email", true);
  state.toggleDraft(pathKey("profile", "city"), true);
  state.closePanel();
  assert.deepEqual(plain(state.layout), before);
  assert.equal(state.visibleColumns.some(column => column.key === "email"), false);
  assert.equal(state.extraColumnCount, 0);
  state.openColumns();
  assert.equal(state.draftKeys.includes("email"), false);
});

test("native sorting emits server intent without reordering page data or sorting JSON fields", () => {
  const { state, events } = fixture();
  state.items.reverse();
  const order = state.items.map(item => item.id);
  state.sortColumn(state.columns[0]);
  assert.deepEqual(plain(events), [{ name: "sort", payload: { key: "name", order: "asc" } }]);
  state.sortBy = [{ key: "name", order: "asc" }];
  state.sortColumn(state.columns[0]);
  assert.deepEqual(plain(events[1]), { name: "sort", payload: { key: "name", order: "desc" } });
  const extra = chooseExtra(state, "profile", "city");
  state.sortColumn({ ...extra, sortable: true });
  state.sortColumn(state.columns[2]);
  state.sortColumn(state.visibleColumns.find(column => column.raw));
  assert.equal(events.length, 2);
  assert.deepEqual(state.items.map(item => item.id), order);
});

test("loading and errors hide stale discovery and inspector data without losing chosen columns", () => {
  const { state, component } = fixture();
  const column = chooseExtra(state, "profile", "city");
  state.inspectCell(state.items[0], 0, column);
  state.loading = true;
  component.watch.loading.call(state, true);
  assert.equal(state.availableItems.length, 0);
  assert.equal(state.keyDiscovery.keys.length, 0);
  assert.equal(state.selectedCell, null);
  assert.equal(state.panel, "");
  assert.ok(state.visibleColumns.some(value => value.key === column.key));
  state.loading = false;
  state.error = "Synthetic failure";
  component.watch.error.call(state, state.error);
  assert.equal(state.availableItems.length, 0);
  assert.equal(state.keyDiscovery.keys.length, 0);
});

test("clipboard preserves exact empty strings and multiline text and reports success only afterward", async () => {
  const { state, copies } = fixture();
  const raw = state.visibleColumns.find(column => column.raw);
  for (const value of ["", "First line\nSecond line\n", 'Quotes: "sample" and Unicode: شهر']) {
    state.items = [{ id: 7, data: value }];
    state.inspectCell(state.items[0], 0, raw);
    const copy = state.copySelected();
    assert.equal(copies.at(-1).text, value);
    assert.equal(state.copyFeedback, "");
    copies.at(-1).resolve();
    await copy;
    assert.equal(state.copyFeedback, "global.data_sheet.copied");
  }
});

test("clipboard failures preserve the complete value for manual copying and missing fields do not copy", async () => {
  const { state, copies } = fixture();
  const column = chooseExtra(state, "profile", "city");
  state.inspectCell(state.items[0], 0, column);
  const copy = state.copySelected();
  copies[0].reject(new Error("Synthetic clipboard denial"));
  await copy;
  assert.equal(state.copyFeedback, "global.data_sheet.copy_failed");
  assert.equal(state.selectedCell.value, "Paris");
  state.items = [{ id: 8, data: {} }];
  state.inspectCell(state.items[0], 0, column);
  await state.copySelected();
  assert.equal(copies.length, 1);
});

test("fullscreen transitions dismiss the inspector while preserving column choices", async () => {
  const { state, component } = fixture();
  const column = chooseExtra(state, "profile", "city");
  state.inspectCell(state.items[0], 0, column);
  const before = plain(state.layout);
  state.$refs.sheet = { closest: () => ({ className: "smart-invert" }), querySelector: () => null };
  await component.watch.fullscreen.call(state, true);
  assert.equal(state.panel, "");
  assert.deepEqual(plain(state.layout), before);
  assert.equal(state.fullscreenTarget, state.$refs.fullscreenTarget);
  assert.equal(state.fullscreenTheme, "dark");
  state.panel = "columns";
  await component.watch.fullscreen.call(state, false);
  assert.equal(state.panel, "");
  assert.equal(state.fullscreenTheme, undefined);
});

test("closing an inspector restores its trigger or the Columns button after a row disappears", async () => {
  const focused = [];
  const trigger = { isConnected: true, focus: () => focused.push("trigger") };
  const { state } = fixture(trigger);
  state.openColumns();
  state.closePanel();
  await Vue.nextTick();
  assert.deepEqual(focused, ["trigger"]);

  state.openColumns();
  trigger.isConnected = false;
  state.$refs.sheet = { querySelector: () => ({ focus: () => focused.push("columns") }) };
  state.closePanel();
  await Vue.nextTick();
  assert.deepEqual(focused, ["trigger", "columns"]);
});

function memoryStorage(values = {}) {
  const entries = new Map(Object.entries(values)), reads = [], writes = [];
  return {
    entries, reads, writes,
    getItem(key) { reads.push(key); return entries.get(key) ?? null; },
    setItem(key, value) { writes.push({ key, value }); entries.set(key, value); },
  };
}

function enableStorage(state) {
  state.storageMounted = true;
  state.loadLayoutScope();
}

test("confirmed column selection, order, labels and widths restore without storing record contents", () => {
  const key = "sheet:user:synthetic-1:shop:synthetic-7", storage = memoryStorage();
  const { state } = fixture(null, { storage, storageKey: key });
  enableStorage(state);
  assert.equal(storage.writes.length, 0);
  const column = chooseExtra(state, "profile", "city");
  state.openColumn(column);
  state.columnLabel = "Home city";
  state.columnSize = 260;
  state.applyColumn();
  state.moveColumn(state.visibleColumns.find(value => value.key === column.key), 1);
  state.resizeKey(state.visibleColumns.find(value => value.key === column.key), 16);
  assert.equal(storage.writes.length, 4);
  const saved = JSON.parse(storage.entries.get(key));
  assert.equal(saved.version, 1);
  assert.ok(saved.columns.some(value => value.key === column.key && value.width === 276 && value.title === "Home city"));
  assert.equal(saved.columns.some(value => value.value || value.sample || value.data || value.items), false);
  for (const text of ["Alex", "Nora", "Paris", "Tokyo", "example.test", "enabled"]) assert.equal(storage.entries.get(key).includes(text), false);
  assert.deepEqual(Object.keys(saved).sort(), ["columns", "version"]);
  for (const metadata of saved.columns) assert.ok(Object.keys(metadata).every(name => ["key", "visible", "width", "title", "path"].includes(name)));

  const reloaded = fixture(null, { storage, storageKey: key }).state;
  reloaded.items = [{ id: 9, data: { different: true } }];
  enableStorage(reloaded);
  const restored = reloaded.visibleColumns.find(value => value.key === column.key);
  assert.equal(restored.title, "Home city");
  assert.equal(restored.width, 276);
  assert.deepEqual(plain(reloaded.visibleColumns.map(value => value.key)), plain(state.visibleColumns.map(value => value.key)));
  assert.equal(reloaded.cellValue(reloaded.items[0], restored).exists, false);
  assert.equal(storage.writes.length, 4);
  reloaded.hideColumn(restored);
  const hiddenReload = fixture(null, { storage, storageKey: key }).state;
  enableStorage(hiddenReload);
  assert.equal(hiddenReload.visibleColumns.some(value => value.key === column.key), false);
});

test("canceling chooser or column settings and unchanged Apply do not save preferences", () => {
  const storage = memoryStorage(), { state } = fixture(null, { storage, storageKey: "sheet:cancel" });
  enableStorage(state);
  state.openColumns(); state.toggleDraft("email", true); state.closePanel();
  state.openColumn(state.visibleColumns[0]); state.columnLabel = "Unconfirmed"; state.columnSize = 260; state.closePanel();
  assert.equal(storage.writes.length, 0);
  state.openColumns(); state.applyColumns();
  state.openColumn(state.visibleColumns[0]); state.applyColumn();
  assert.equal(storage.writes.length, 0);
});

test("width-only preferences preserve translated native captions while explicit custom labels persist", () => {
  const key = "sheet:translated", storage = memoryStorage();
  const { state } = fixture(null, { storage, storageKey: key });
  enableStorage(state);
  state.openColumn(state.visibleColumns[0]);
  state.columnSize = 260;
  state.applyColumn();
  assert.equal(Object.hasOwn(JSON.parse(storage.entries.get(key)).columns[0], "title"), false);

  const translated = fixture(null, { storage, storageKey: key }).state;
  translated.columns[0].title = "مخاطب";
  enableStorage(translated);
  assert.equal(translated.visibleColumns[0].title, "مخاطب");
  assert.equal(translated.visibleColumns[0].width, 260);
  translated.openColumn(translated.visibleColumns[0]);
  translated.columnLabel = "شریک ویژه";
  translated.applyColumn();
  const english = fixture(null, { storage, storageKey: key }).state;
  enableStorage(english);
  assert.equal(english.visibleColumns[0].title, "شریک ویژه");
});

test("storage scope changes isolate users and shops and cannot write the prior layout to a new key", () => {
  const first = "sheet:user:one:shop:one", second = "sheet:user:one:shop:two", third = "sheet:user:two:shop:two";
  const storage = memoryStorage(), { state, component } = fixture(null, { storage, storageKey: first });
  enableStorage(state);
  chooseExtra(state, "profile", "city");
  const firstSnapshot = storage.entries.get(first);

  state.storageKey = second;
  state.persistLayout();
  assert.equal(storage.entries.has(second), false);
  component.watch.storageKey.call(state);
  assert.equal(state.extraColumnCount, 0);
  assert.equal(state.layout.some(column => column.path), false);
  state.openColumns(); state.toggleDraft("email", true); state.applyColumns();
  assert.equal(storage.entries.get(first), firstSnapshot);
  assert.ok(storage.entries.has(second));

  state.storageKey = third; component.watch.storageKey.call(state);
  assert.equal(state.visibleColumns.some(column => column.key === "email"), false);
  assert.equal(storage.entries.has(third), false);
  state.storageKey = first; component.watch.storageKey.call(state);
  assert.equal(state.extraColumnCount, 1);
});

test("corrupt and future-version storage remains untouched until a real confirmed layout change", () => {
  for (const raw of ['{"version":99,"columns":[]}', "not JSON", "x".repeat(30000)]) {
    const storage = memoryStorage({ "sheet:invalid": raw }), { state } = fixture(null, { storage, storageKey: "sheet:invalid" });
    enableStorage(state);
    assert.equal(state.storageNotice, "storage_restore_failed");
    assert.equal(storage.entries.get("sheet:invalid"), raw);
    state.openColumns(); state.applyColumns();
    assert.equal(storage.entries.get("sheet:invalid"), raw);
    assert.equal(storage.writes.length, 0);
    state.openColumns(); state.toggleDraft("email", true); state.applyColumns();
    assert.equal(JSON.parse(storage.entries.get("sheet:invalid")).version, 1);
    assert.equal(state.storageNotice, "");
  }
});

test("unavailable or quota-limited localStorage keeps the viewer usable with truthful neutral feedback", () => {
  const blockedWindow = {};
  Object.defineProperty(blockedWindow, "localStorage", { get() { throw new Error("Synthetic SecurityError"); } });
  const blocked = fixture(null, { storageKey: "sheet:blocked", window: blockedWindow }).state;
  enableStorage(blocked);
  assert.equal(blocked.storageNotice, "storage_restore_failed");
  chooseExtra(blocked, "profile", "city");
  assert.equal(blocked.extraColumnCount, 1);
  assert.equal(blocked.storageNotice, "storage_unavailable");

  const quota = { getItem: () => null, setItem() { throw new Error("Synthetic QuotaExceededError"); } };
  const full = fixture(null, { storageKey: "sheet:quota", storage: quota }).state;
  enableStorage(full); chooseExtra(full, "profile", "city");
  assert.equal(full.extraColumnCount, 1);
  assert.equal(full.storageNotice, "storage_unavailable");

  const disabled = fixture(null, { window: blockedWindow }).state;
  enableStorage(disabled); chooseExtra(disabled, "profile", "city");
  assert.equal(disabled.storageNotice, "");
});

test("pointer resizing writes once on release and discards a drag across storage scopes", () => {
  const storage = memoryStorage(), { state, component } = fixture(null, { storage, storageKey: "sheet:drag-one" });
  enableStorage(state);
  const handlers = new Map();
  const handle = { setPointerCapture() {}, addEventListener(name, callback) { handlers.set(name, callback); }, removeEventListener(name) { handlers.delete(name); } };
  const event = { currentTarget: handle, pointerId: 1, clientX: 10, preventDefault() {} };
  state.startResize(event, state.visibleColumns[0]);
  handlers.get("pointermove")({ clientX: 30 });
  handlers.get("pointermove")({ clientX: 50 });
  assert.equal(storage.writes.length, 0);
  handlers.get("pointerup")({ type: "pointerup" });
  assert.equal(storage.writes.length, 1);
  assert.equal(JSON.parse(storage.entries.get("sheet:drag-one")).columns[0].width, 264);

  state.startResize(event, state.visibleColumns[0]);
  const staleMove = handlers.get("pointermove"), staleRelease = handlers.get("pointerup");
  state.storageKey = "sheet:drag-two";
  component.watch.storageKey.call(state);
  staleMove({ clientX: 100 }); staleRelease({ type: "pointerup" });
  assert.equal(state.visibleColumns[0].width, 224);
  assert.equal(storage.entries.has("sheet:drag-two"), false);
  assert.equal(storage.writes.length, 1);
});

test("saved layouts wait for native columns before restoration and remain scoped when persistence is disabled", () => {
  const storage = memoryStorage({ "sheet:late": JSON.stringify({ version: 1, columns: [{ key: "email", visible: true, width: 260 }] }) });
  const { state, component } = fixture(null, { storage, storageKey: "sheet:late" });
  const nativeColumns = state.columns;
  state.columns = []; enableStorage(state);
  assert.equal(state.storageReady, false);
  assert.equal(storage.reads.length, 0);
  state.columns = nativeColumns; component.watch.columns.handler.call(state, nativeColumns);
  assert.equal(state.storageReady, true);
  assert.ok(state.visibleColumns.some(column => column.key === "email" && column.width === 260));
  state.storageKey = ""; component.watch.storageKey.call(state);
  assert.equal(state.visibleColumns.some(column => column.key === "email"), false);
  assert.equal(storage.writes.length, 0);
});
