import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { parse, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

// Fixture dates only: "today" is fixed and every date is a local calendar day.
const fixedNow = new Date("2026-10-27T12:00:00");
class FixtureDate extends Date {
  constructor(...args) {
    super(...(args.length ? args : [fixedNow]));
  }
}
const dayBefore = (days, end = false) => {
  const date = new FixtureDate();
  date.setDate(date.getDate() - days);
  date.setHours(end ? 23 : 0, end ? 59 : 0, end ? 59 : 0, end ? 999 : 0);
  return date;
};
const DateConverter = {
  convertToLocalTime: (value) =>
    value == null ? null : new FixtureDate(value),
  GetStartOfDateBefore: (days) => dayBefore(days),
  GetEndOfDateBefore: (days) => dayBefore(days, true),
};
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const load = (path, context = {}) => {
  const exports = {};
  vm.runInNewContext(
    transpile(readFileSync(new URL(path, import.meta.url), "utf8")),
    {
      exports,
      Date: FixtureDate,
      require: (name) => {
        if (name.includes("DateConverter")) return { DateConverter };
        if (name.endsWith("customRange.ts")) return range;
        return { default: {} };
      },
      ...context,
    },
  );
  return exports;
};
const range = load("./customRange.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));

test("a custom window spans both calendar dates and stays inside the day limit", () => {
  assert.deepEqual(
    plain(range.customRangeWindow(dayBefore(89), dayBefore(0, true))),
    { offset: 0, days: 89 },
    "Ninety inclusive days end today",
  );
  assert.equal(range.customRangeWindow(dayBefore(90), dayBefore(0)), null);
  assert.deepEqual(
    plain(
      range.customRangeWindow("2026-10-20T12:00:00", "2026-10-23T12:00:00"),
    ),
    { offset: 4, days: 3 },
  );
  assert.deepEqual(
    plain(range.customRangeWindow(dayBefore(29), dayBefore(0), 30)),
    { offset: 0, days: 29 },
  );
  assert.equal(range.customRangeWindow(dayBefore(30), dayBefore(0), 30), null);
  assert.deepEqual(plain(range.customRangeWindow(dayBefore(3), dayBefore(3))), {
    offset: 3,
    days: 0,
  });
  for (const [start, end] of [
    ["2026-10-25", "2026-10-20"],
    ["2026-10-20", "2026-10-28"],
    ["2026-01-01", "2026-10-20"],
    ["invalid", "2026-10-20"],
    [null, "2026-10-20"],
    ["2026-10-20", undefined],
  ])
    assert.equal(range.customRangeWindow(start, end), null);
  assert.equal(
    range.calendarDayNumber("2026-10-27") -
      range.calendarDayNumber("2026-10-20"),
    7,
  );
  assert.equal(range.calendarDayNumber("not a date"), null);
});

test("the dialog drafts the open period, applies only a valid window and closes", () => {
  const { descriptor, errors } = parse(
    readFileSync(
      new URL("./UTimeSpanCustomDialog.vue", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: "UTimeSpanCustomDialog.vue",
      id: "custom-dialog-test",
    }).errors,
    [],
  );
  // The SFC script is loaded on its own; the template compiles above.
  const script = {};
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports: script,
    Date: FixtureDate,
    require: (name) => {
      if (name.includes("DateConverter")) return { DateConverter };
      if (name.endsWith("customRange.ts")) return range;
      return { default: {} };
    },
  });
  const dialog = script.default;
  const emitted = [];
  const state = {
    ...dialog.data(),
    modelValue: false,
    start: dayBefore(29),
    end: dayBefore(0, true),
    maxDays: 30,
    $emit: (...args) => emitted.push(plain(args)),
  };
  for (const [key, method] of Object.entries(dialog.methods))
    state[key] = method.bind(state);
  for (const [key, getter] of Object.entries(dialog.computed))
    Object.defineProperty(state, key, { get: () => getter.call(state) });
  assert.equal(state.window, null, "Nothing is drafted until the dialog opens");
  state.apply();
  assert.deepEqual(emitted, [], "An invalid draft never applies");
  dialog.watch.modelValue.handler.call(state, true);
  assert.deepEqual(plain(state.window), { offset: 0, days: 29 });
  assert.equal(
    range.calendarDayNumber(state.min_date),
    range.calendarDayNumber(dayBefore(29)),
    "The earliest selectable day honors the menu's limit",
  );
  state.draft_start = dayBefore(40);
  assert.equal(state.window, null);
  state.draft_start = "2026-10-20T12:00:00";
  state.draft_end = "2026-10-23T12:00:00";
  state.apply();
  assert.equal(emitted[0][0], "apply");
  assert.deepEqual(emitted[0][1], {
    offset: 4,
    days: 3,
    start: "2026-10-20T12:00:00",
    end: "2026-10-23T12:00:00",
  });
  assert.deepEqual(emitted[1], ["update:modelValue", false]);
});
