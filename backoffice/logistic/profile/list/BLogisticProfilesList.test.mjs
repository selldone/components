import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import * as Vue from "vue";
import { renderToString } from "vue/server-renderer";
import { parse, compileScript, compileTemplate, compileStyleAsync } from "@vue/compiler-sfc";
import ts from "typescript";

// Render the real row-action slot with local controls; no HTTP or shop data.
const filename = fileURLToPath(new URL("./BLogisticProfilesList.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "logistic-profile-list-test" });
const template = compileTemplate({ source: descriptor.template.content, filename,
  id: "logistic-profile-list-test", compilerOptions: { bindingMetadata: script.bindings } });
assert.deepEqual(template.errors, []);
const compiled = ts.transpileModule(descriptor.script.content + "\n" + template.code, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exports = {};
vm.runInThisContext(`(function(require,exports,window){${compiled}})`)(name => {
  if (name === "vue") return Vue;
  if (name === "lodash-es") return { throttle: callback => callback };
  if (name.includes("LogisticProfileType")) return { LogisticProfileType: {} };
  if (name.includes("DateMixin") || name.includes("NotificationService")) return { default: {} };
  throw new Error(`Unexpected dependency: ${name}`);
}, exports, { SERACH_THROTTLE: 500 });
const plain = value => JSON.parse(JSON.stringify(value));

async function fixture(modern) {
  const profile = { id: 12, name: "Warranty" };
  const routes = [], selected = [], buttons = [], tooltips = [];
  let table;
  const app = Vue.createSSRApp({ ...exports.default, render: exports.render }, {
    modern, shop: { id: 7 }, onShowProducts: item => selected.push(item),
  });
  Object.assign(app.config.globalProperties, {
    $t: key => key, $vuetify: { display: { xs: false, smAndDown: false } },
    $router: { push: route => routes.push(route) },
  });
  app.component("v-data-table-server", Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        table = attrs;
        return Vue.h("section", slots["item.actions"]?.({ item: profile }));
      };
    },
  }));
  app.component("v-btn", Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        buttons.push(attrs);
        return Vue.h("button", attrs, slots.default?.());
      };
    },
  }));
  app.component("v-tooltip", Vue.defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => {
        tooltips.push(attrs);
        return Vue.h("span", slots.default?.());
      };
    },
  }));
  for (const name of ["v-row", "v-spacer", "v-text-field", "v-icon", "u-loading-progress", "router-link", "v-img", "v-avatar", "v-pagination"]) {
    app.component(name, Vue.defineComponent({
      setup(_, { slots }) { return () => Vue.h("div", slots.default?.()); },
    }));
  }
  await renderToString(app);
  return { table, profile, routes, selected, buttons, tooltips };
}

test("the profile-list template, script and scoped styles compile", async () => {
  for (const style of descriptor.styles) {
    assert.deepEqual((await compileStyleAsync({ source: style.content, filename,
      id: "logistic-profile-list-test", scoped: style.scoped, preprocessLang: style.lang })).errors, []);
  }
});

test("legacy headers and row navigation remain unchanged with no action column", async () => {
  const f = await fixture(false);
  assert.deepEqual(f.table.headers.map(header => header.value), ["type", "name", "user_id", "info.languages", "updated_at"]);
  assert.equal(f.buttons.length, 0);
  assert.equal(f.selected.length, 0);
  f.table["onClick:row"]({}, { item: f.profile });
  assert.deepEqual(plain(f.routes), [{ name: "LogisticProfilePage_Dashboard", params: { profile_id: 12 } }]);
});

test("modern actions link to Settings and emit the selected profile without row navigation", async () => {
  const f = await fixture(true);
  const column = f.table.headers.at(-1);
  assert.equal(column.value, "actions");
  assert.equal(column.sortable, false);
  assert.equal(column.width, 104);
  assert.deepEqual(f.buttons.map(button => button["aria-label"]), ["shop_logistic_profiles.assigned_products", "global.actions.edit"]);
  assert.deepEqual(plain(f.buttons[1].to), { name: "LogisticProfilePage_Setting", params: { profile_id: 12 } });
  for (const button of f.buttons) assert.equal(button.class, "sd-modern-icon-button");
  for (const tooltip of f.tooltips) {
    assert.equal(tooltip.location, "top");
    assert.equal(tooltip["open-on-focus"], true);
    assert.equal(tooltip["content-class"], "sd-modern-tooltip text-start");
  }
  let stopped = 0;
  const event = () => ({ stopPropagation() { stopped++; } });
  f.buttons[0].onClick(event());
  assert.equal(stopped, 1);
  assert.equal(f.selected[0], f.profile);
  assert.equal(f.routes.length, 0);
  f.buttons[1].onClick(event());
  assert.equal(stopped, 2);
  assert.equal(f.routes.length, 0, "The Edit link must not also invoke row navigation");
  assert.equal(f.selected.length, 1);
  f.table["onClick:row"]({}, { item: f.profile });
  assert.deepEqual(plain(f.routes), [{ name: "LogisticProfilePage_Dashboard", params: { profile_id: 12 } }]);
});
