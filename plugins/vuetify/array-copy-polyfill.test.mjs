import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Run the polyfill in a sandbox whose Array lacks the ES2023 copy methods, like Chrome 107.
const source = readFileSync(
  new URL("./array-copy-polyfill.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});

function sandbox({ native = false } = {}) {
  const context = vm.createContext({ exports: {} });
  if (!native)
    vm.runInContext(
      "delete Array.prototype.toSorted; delete Array.prototype.toReversed;",
      context,
    );
  vm.runInContext(outputText, context);
  return context;
}

test("adds toSorted and toReversed that copy instead of mutating", () => {
  const result = vm.runInContext(
    `const thresholds = { lg: 1280, xs: 0, md: 960 };
     const entries = Object.entries(thresholds);
     const sorted = entries.toSorted((a, b) => a[1] - b[1]).map(([n]) => n);
     const list = [3, 1, 2];
     JSON.stringify({
       sorted,
       defaultOrder: list.toSorted(),
       reversed: list.toReversed(),
       untouched: list,
       holes: [2, , 1].toSorted(),
       enumerable: Object.keys(Array.prototype),
     });`,
    sandbox(),
  );
  assert.deepEqual(JSON.parse(result), {
    sorted: ["xs", "md", "lg"],
    defaultOrder: [1, 2, 3],
    reversed: [2, 1, 3],
    untouched: [3, 1, 2],
    holes: [1, 2, null],
    enumerable: [],
  });
});

test("keeps native implementations when the browser has them", () => {
  const context = sandbox({ native: true });
  assert.equal(
    vm.runInContext(
      "Array.prototype.toSorted.toString().includes('[native code]')",
      context,
    ),
    true,
  );
});
