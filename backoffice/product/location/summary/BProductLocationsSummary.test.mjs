import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

const file = new URL("BProductLocationsSummary.vue", import.meta.url);
const { descriptor } = parse(readFileSync(file, "utf8"), {
  filename: file.pathname,
});
const script = compileScript(descriptor, { id: "summary" });
const exports = {};
vm.runInNewContext(
  ts.transpileModule(script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  // A six-country world keeps the store-coverage cases readable.
  {
    exports,
    require: () => ({ getCodes: () => ["AD", "DE", "FR", "IT", "NL", "US"] }),
  },
);
const options = exports.default;

function summary(props) {
  const state = {
    locations: null,
    countries: null,
    limit: 4,
    ...props,
    $t: (key) => key.split(".").pop(),
  };
  for (const [name, getter] of Object.entries(options.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  return {
    label: state.label,
    shown: [...state.shown],
    hidden: [...state.hidden],
    dot: state.dotClass,
  };
}

test("the template compiles", () => {
  assert.deepEqual(
    compileTemplate({
      source: descriptor.template.content,
      filename: file.pathname,
      id: "summary",
    }).errors,
    [],
  );
});

test("a product rule lists its own countries with the overridden-value dot", () => {
  assert.deepEqual(
    summary({
      locations: { DE: ["10115"], FR: [], IT: [], NL: [], US: [] },
      countries: ["DE"],
    }),
    {
      label: "product",
      shown: ["DE", "FR", "IT", "NL"],
      hidden: ["US"],
      dot: "b-product-locations-summary__rule-dot",
    },
  );
  assert.equal(summary({ locations: {} }).label, "product_none");
  assert.equal(summary({ locations: {} }).dot, "sd-modern-status__dot--error");
});

test("without a product rule the store default or everywhere applies", () => {
  assert.deepEqual(summary({}), {
    label: "everywhere",
    shown: [],
    hidden: [],
    dot: "sd-modern-status__dot--success",
  });
  assert.deepEqual(summary({ countries: ["DE", "FR"] }), {
    label: "store",
    shown: ["DE", "FR"],
    hidden: [],
    dot: "sd-modern-status__dot--success",
  });
  // Most of the world reads as the countries it leaves out.
  assert.deepEqual(summary({ countries: ["DE", "FR", "IT", "NL"] }), {
    label: "store_except",
    shown: ["AD", "US"],
    hidden: [],
    dot: "sd-modern-status__dot--success",
  });
  assert.equal(
    summary({ countries: ["AD", "DE", "FR", "IT", "NL", "US"] }).label,
    "store_all",
  );
  assert.deepEqual(summary({ countries: [] }), {
    label: "store_none",
    shown: [],
    hidden: [],
    dot: "sd-modern-status__dot--error",
  });
});
