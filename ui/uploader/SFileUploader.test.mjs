import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { parse } from "@vue/compiler-sfc";

const { descriptor } = parse(readFileSync(new URL("./SFileUploader.vue", import.meta.url), "utf8"));
const context = {
  exports: {},
  console: { log() {} },
  require(name) {
    if (name.includes("FilePondLoader")) return { default: { loadFilePondComponent: () => ({}) } };
    if (name.includes("NotificationService")) return { default: {} };
    throw new Error(`Unexpected import: ${name}`);
  },
};
vm.runInNewContext(ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, context);
const processFile = context.exports.default.methods.handleProcessFile;

function process(response, error = null) {
  const events = [];
  const result = processFile.call({ $emit: (...args) => events.push(args) }, error, {
    serverId: JSON.stringify(response),
  });
  return { events: JSON.parse(JSON.stringify(events)), result };
}

test("antivirus check results reach the parent without requiring stored-file metadata", () => {
  for (const response of [
    { virus_detected: false, scan_status: "clean" },
    { virus_detected: true, scan_status: "infected" },
    { error: true, virus_detected: null, scan_status: "unavailable" },
  ]) {
    assert.deepEqual(process(response), { events: [["response", response]], result: true });
  }
});

test("ordinary single and multiple uploads keep their original response, path and URL events", () => {
  const file = { path: "fixture/saved.pdf", url: "/fixture/saved.pdf" };
  for (const files of [file, [file]]) {
    const response = { files };
    assert.deepEqual(process(response), {
      result: true,
      events: [["response", response], ["new-path", file.path], ["new-url", file.url]],
    });
  }
});

test("a failed FilePond operation emits no successful response or file events", () => {
  assert.deepEqual(process({}, { body: "Upload failed" }), { events: [], result: undefined });
});
