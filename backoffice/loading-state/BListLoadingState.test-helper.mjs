import { readFileSync } from "node:fs";
import vm from "node:vm";
import * as Vue from "vue";
import ts from "typescript";
import { parse, compileTemplate } from "@vue/compiler-sfc";

// Consumers render the actual presentation; globals replace only the browser visibility boundary.
export function loadListLoadingState(globals = {}) {
  const filename = new URL("./BListLoadingState.vue", import.meta.url);
  const { descriptor, errors } = parse(readFileSync(filename, "utf8"));
  if (errors.length) throw errors[0];
  const template = compileTemplate({ source: descriptor.template.content, filename: filename.pathname, id: "list-loading-state-consumer", compilerOptions: { hoistStatic: false } });
  if (template.errors.length) throw template.errors[0];
  const compiled = ts.transpileModule(descriptor.script.content + "\n" + template.code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, ...globals,
    require(name) {
      if (name === "vue") return Vue;
      throw new Error(`Unexpected loading-state dependency: ${name}`);
    },
  });
  return { ...exports.default, render: exports.render };
}

export default loadListLoadingState();
