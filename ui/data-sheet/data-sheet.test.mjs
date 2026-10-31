import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("./data-sheet.ts", import.meta.url), "utf8");
const exports = {};
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  reportDiagnostics: true,
});
assert.deepEqual(compiled.diagnostics, []);
vm.runInNewContext(compiled.outputText, { exports });
const { sheetPathKey, sheetPathLabel, readSheetPath, sheetValueType, formatSheetValue, discoverSheetKeys, restoreSheetLayout } = exports;
const plain = (value) => JSON.parse(JSON.stringify(value));

test("literal path segments stay distinct from nested, slash, empty and Unicode keys", () => {
  const payload = { "a.b": 1, a: { b: 2 }, "a/b": 3, "": 4, "شهر": "تهران" };
  const paths = [["a.b"], ["a", "b"], ["a/b"], [""], ["شهر"]];
  assert.equal(new Set(paths.map(sheetPathKey)).size, paths.length);
  assert.equal(sheetPathLabel(["a.b"]), '["a.b"]');
  assert.equal(sheetPathLabel(["a", "b"]), "a.b");
  assert.equal(sheetPathLabel([]), "");
  for (const [index, path] of paths.entries()) {
    assert.equal(readSheetPath(payload, path).value, [1, 2, 3, 4, "تهران"][index]);
  }
});

test("own-property reads distinguish missing, undefined, null, false, zero and empty values", () => {
  const payload = { missingParent: null, defined: undefined, nil: null, no: false, zero: 0, empty: "", list: [], object: {} };
  assert.equal(readSheetPath(payload, ["absent"]).exists, false);
  assert.equal(readSheetPath(payload, ["defined"]).exists, true);
  assert.equal(readSheetPath(payload, ["missingParent", "child"]).exists, false);
  assert.equal(sheetValueType(undefined, false), "missing");
  assert.equal(sheetValueType(undefined), "undefined");
  assert.equal(sheetValueType(null), "null");
  assert.equal(sheetValueType([]), "array");
  assert.equal(sheetValueType({}), "object");
  assert.equal(formatSheetValue(undefined, { exists: false }), "—");
  assert.equal(formatSheetValue(undefined), "undefined");
  assert.equal(formatSheetValue(null), "null");
  assert.equal(formatSheetValue(false), "false");
  assert.equal(formatSheetValue(0), "0");
  assert.equal(formatSheetValue(""), '""');
  assert.equal(formatSheetValue([]), "[]");
  assert.equal(formatSheetValue({}), "{}");
});

test("catalog counts and samples describe only the currently loaded page", () => {
  const page = [
    { data: { profile: { city: "Paris" }, enabled: false, budget: 0, notes: null, list: ["one", "two"] } },
    { data: { profile: { city: "Tokyo" }, enabled: true, notes: "Contact me", list: [] } },
    { data: { profile: {}, enabled: null, notes: "" } },
    { noData: true },
  ];
  const before = JSON.stringify(page);
  const catalog = discoverSheetKeys(page);
  const find = (...path) => catalog.keys.find((key) => key.key === sheetPathKey(path));
  assert.equal(catalog.total, 4);
  assert.equal(catalog.truncated, false);
  assert.equal(find("profile", "city").count, 2);
  assert.equal(find("budget").sample, 0);
  assert.equal(find("enabled").sample, false);
  assert.deepEqual(plain(find("enabled").types), ["boolean", "null"]);
  assert.equal(find("notes").sample, "Contact me");
  assert.deepEqual(plain(find("list").types), ["array"]);
  assert.equal(catalog.keys.some((key) => key.path.includes("0")), false);
  assert.equal(JSON.stringify(page), before);
  assert.equal(discoverSheetKeys([{ data: { another: 1 } }]).keys.some((key) => key.key === sheetPathKey(["profile", "city"])), false);
  assert.equal(readSheetPath({ another: 1 }, ["profile", "city"]).exists, false);
});

test("nonnull arrays and primitives introduce whole-root columns that preserve mixed null values", () => {
  const catalog = discoverSheetKeys([
    { extra: [1, 2] }, { extra: 0 }, { extra: false }, { extra: null }, { extra: "" }, {},
  ], "extra");
  assert.equal(catalog.keys.length, 1);
  const root = catalog.keys[0];
  assert.equal(root.key, sheetPathKey([]));
  assert.deepEqual(plain(root.path), []);
  assert.equal(root.count, 5);
  assert.deepEqual(plain(root.types), ["array", "number", "boolean", "null", "string"]);
});

test("null, undefined and missing roots offer no extra keys while nested null keys remain available", () => {
  const empty = discoverSheetKeys([{ data: null }, { data: undefined }, {}, { data: {} }]);
  assert.equal(empty.keys.length, 0);
  assert.equal(empty.total, 4);
  assert.equal(empty.truncated, false);
  const nested = discoverSheetKeys([{ data: { answer: null } }, { data: null }, { data: { answer: undefined } }]);
  assert.equal(nested.keys.length, 1);
  assert.equal(nested.keys[0].key, sheetPathKey(["answer"]));
  assert.equal(nested.keys[0].count, 2);
  assert.deepEqual(plain(nested.keys[0].types), ["null", "undefined"]);
  assert.equal(readSheetPath(null, []).value, null, "Existing root-column values retain their original semantics");
});

test("prototype-like JSON keys remain literal data without prototype traversal or writes", () => {
  const data = JSON.parse('{"__proto__":{"polluted":true},"constructor":{"name":"literal"}}');
  const inherited = Object.create({ secret: "inherited" });
  inherited.visible = "own";
  Object.defineProperty(inherited, "expensive", { enumerable: true, get() { throw new Error("Getter must not execute"); } });
  assert.equal(readSheetPath({}, ["constructor"]).exists, false);
  assert.equal(readSheetPath(inherited, ["secret"]).exists, false);
  assert.equal(readSheetPath(inherited, ["expensive"]).exists, false);
  assert.equal(readSheetPath(data, ["__proto__", "polluted"]).value, true);
  const catalog = discoverSheetKeys([{ data }, { data: inherited }]);
  assert.ok(catalog.keys.some((key) => key.key === sheetPathKey(["__proto__", "polluted"])));
  assert.ok(catalog.keys.some((key) => key.key === sheetPathKey(["visible"])));
  assert.equal(catalog.keys.some((key) => key.path.includes("secret") || key.path.includes("expensive")), false);
  assert.equal({}.polluted, undefined);
});

test("wide and deeply nested JSON stays bounded while retained counts remain exact", () => {
  const wide = Object.fromEntries(Array.from({ length: 250 }, (_, i) => [`field${i}`, i]));
  const catalog = discoverSheetKeys([{ data: wide }, { data: wide }, { data: { field0: false } }]);
  assert.equal(catalog.keys.length, 200);
  assert.equal(catalog.truncated, true);
  assert.equal(catalog.keys.find((key) => key.key === sheetPathKey(["field0"])).count, 3);
  let deep = { leaf: "end" };
  for (let i = 0; i < 15; i++) deep = { child: deep };
  const nested = discoverSheetKeys([{ data: deep }]);
  assert.equal(nested.truncated, true);
  assert.equal(Math.max(...nested.keys.map((key) => key.path.length)), 8);
});

test("cycles terminate safely without confusing repeated non-circular references", () => {
  const circular = { name: "cycle" };
  circular.self = circular;
  const catalog = discoverSheetKeys([{ data: circular }]);
  assert.equal(catalog.truncated, true);
  assert.ok(catalog.keys.length <= 2);
  assert.match(formatSheetValue(circular, { maxLength: Infinity }), /\[Circular\]/);
  const shared = { count: 2 };
  assert.equal(formatSheetValue({ first: shared, second: shared }, { maxLength: Infinity }), '{"first":{"count":2},"second":{"count":2}}');
});

test("previews are bounded while explicit full values preserve JSON and long text", () => {
  assert.equal(formatSheetValue("x".repeat(500)).length, 200);
  assert.equal(formatSheetValue("x".repeat(500), { maxLength: 32 }), "x".repeat(31) + "…");
  assert.equal(formatSheetValue("x".repeat(500), { maxLength: Infinity }).length, 500);
  const payload = { tag: "one", count: 0, enabled: false, nil: null };
  assert.equal(formatSheetValue(payload, { pretty: true, maxLength: Infinity }), JSON.stringify(payload, null, 2));
});

const layoutDefaults = () => [
  { key: "name", visible: true, width: 224, fixed: true },
  { key: "agents", visible: true, width: 140 },
  { key: "tags", visible: true, width: 150 },
  { key: "phone", visible: false, width: 180 },
  { key: "__sheet_extra_data__", visible: true, width: 120, raw: true },
];

test("layout order, selection, labels and widths round-trip as presentation metadata only", () => {
  const columns = [
    { key: "name", visible: true, width: 246 },
    { key: "tags", visible: false, width: 180 },
    { key: sheetPathKey(["profile", "city"]), path: ["profile", "city"], title: "City of residence", width: 205, visible: true },
    { key: "agents", visible: true, width: 130 },
    { key: "phone", visible: true, width: 180 },
    { key: "__sheet_extra_data__", visible: true, width: 120 },
  ];
  const stored = JSON.parse(JSON.stringify({ version: 1, columns }));
  assert.deepEqual(plain(restoreSheetLayout(stored, layoutDefaults())), columns);
  const envelope = { version: 1, columns: [{ ...columns[0], data: { private: "never persisted" }, sample: "example value", fixed: false, raw: true }] };
  const normalized = restoreSheetLayout(envelope, layoutDefaults());
  assert.equal(JSON.stringify(normalized).includes("never persisted"), false);
  assert.equal(JSON.stringify(normalized).includes("example value"), false);
  assert.equal(Object.hasOwn(normalized[0], "raw"), false);
  assert.equal(Object.hasOwn(normalized[0], "fixed"), false);
});

test("layout restore rejects unsupported, malformed or excessive envelopes without mutating them", () => {
  const validColumn = { key: "name", visible: true, width: 224 };
  const invalid = [null, [], {}, { version: 2, columns: [] }, { version: "1", columns: [] }, { version: 1, columns: {} },
    { version: 1, columns: Array.from({ length: 257 }, () => validColumn) },
    { version: 1, columns: [validColumn, validColumn] },
    { version: 1, columns: [{ key: "name", visible: "true", width: 224 }] },
    { version: 1, columns: [{ key: "name", visible: true, width: 94 }] },
    { version: 1, columns: [{ key: "name", visible: true, width: 481 }] },
    { version: 1, columns: [{ key: "name", visible: true, width: NaN }] },
    { version: 1, columns: [{ key: "name", visible: true, width: Infinity }] },
    { version: 1, columns: [{ key: "name", visible: true, width: 224, title: "x".repeat(121) }] },
    { version: 1, columns: [{ key: "name", visible: true, width: 224, title: {} }] }];
  for (const saved of invalid) {
    const before = JSON.stringify(saved);
    assert.equal(restoreSheetLayout(saved, layoutDefaults()), null);
    assert.equal(JSON.stringify(saved), before);
  }
});

test("extra paths remain selected when absent from a new page and malformed path identifiers are rejected", () => {
  const path = ["profile", "a.b", "کشور"];
  const extra = { key: sheetPathKey(path), path, visible: true, width: 170 };
  const restored = restoreSheetLayout({ version: 1, columns: [extra] }, layoutDefaults());
  assert.deepEqual(plain(restored.find(column => column.key === extra.key).path), path);
  assert.equal(restored.find(column => column.key === extra.key).visible, true);
  for (const invalid of [
    { ...extra, key: "extra:profile.a.b" },
    { ...extra, path: ["another"] },
    { ...extra, path: "profile.a.b" },
    { ...extra, path: Array(9).fill("level") },
    { ...extra, path: ["x".repeat(161)] },
    { key: sheetPathKey(Array(4).fill("x".repeat(150))), path: Array(4).fill("x".repeat(150)), visible: true, width: 170 },
    { key: extra.key, visible: true, width: 170 },
  ]) assert.equal(restoreSheetLayout({ version: 1, columns: [invalid] }, layoutDefaults()), null);
});

test("schema changes discard stale native fields, append new defaults, and preserve mandatory columns", () => {
  const saved = { version: 1, columns: [
    { key: "removed_native", visible: true, width: 180 },
    { key: "agents", visible: false, width: 130 },
    { key: "__sheet_extra_data__", visible: false, width: 140 },
    { key: "name", visible: false, width: 190 },
  ] };
  const normalized = restoreSheetLayout(saved, layoutDefaults());
  assert.deepEqual(plain(normalized.map(column => column.key)), ["name", "agents", "__sheet_extra_data__", "tags", "phone"]);
  assert.equal(normalized[0].visible, true);
  assert.equal(normalized.find(column => column.key === "__sheet_extra_data__").visible, true);
  assert.equal(normalized.find(column => column.key === "agents").visible, false);
  assert.equal(normalized.find(column => column.key === "phone").visible, false);
  assert.equal(normalized[0].width, 190);
});

test("prototype strings are harmless literal metadata and inherited or getter properties are not decoded", () => {
  const path = ["__proto__", "constructor", "prototype"];
  const stored = JSON.parse(JSON.stringify({ version: 1, columns: [
    { key: "__proto__", visible: true, width: 170 },
    { key: sheetPathKey(path), path, visible: true, width: 170 },
  ] }));
  const normalized = restoreSheetLayout(stored, layoutDefaults());
  assert.equal(normalized.some(column => column.key === "__proto__"), false);
  assert.deepEqual(plain(normalized.find(column => column.path).path), path);
  assert.equal({}.polluted, undefined);
  assert.equal(restoreSheetLayout(Object.create({ version: 1, columns: [] }), layoutDefaults()), null);
  const getter = { columns: [] };
  Object.defineProperty(getter, "version", { get() { throw new Error("Must not execute"); } });
  assert.equal(restoreSheetLayout(getter, layoutDefaults()), null);
  const entry = { key: "name", width: 170 };
  Object.defineProperty(entry, "visible", { get() { throw new Error("Must not execute"); } });
  assert.equal(restoreSheetLayout({ version: 1, columns: [entry] }, layoutDefaults()), null);
});

test("large but individually valid path metadata is bounded as one envelope", () => {
  const columns = Array.from({ length: 200 }, (_, index) => {
    const path = [`field${index}`, "x".repeat(150), "y".repeat(150)];
    return { key: sheetPathKey(path), path, visible: true, width: 170, title: "Readable title" };
  });
  assert.equal(restoreSheetLayout({ version: 1, columns }, layoutDefaults()), null);
});
