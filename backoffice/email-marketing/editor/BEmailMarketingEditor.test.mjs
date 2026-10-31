import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import {
  parse,
  compileTemplate,
  compileStyle,
  compileScript,
} from "@vue/compiler-sfc";
import ts from "typescript";

const require = createRequire(import.meta.url);
const read = (relative) =>
  readFileSync(new URL(relative, import.meta.url), "utf8");
const plain = (value) => JSON.parse(JSON.stringify(value));
const flush = () => new Promise((resolve) => setImmediate(resolve));
const requests = [];
const notices = [];
const downloads = [];
const fonts = [];
const fileLoads = [];
const rules = new Proxy({}, { get: () => () => () => true });

// Requests and file operations are disposable stubs; this test cannot send mail or write shop data.
function request(method, url, payload) {
  let resolve, reject;
  const promise = new Promise((ok, fail) => {
    resolve = ok;
    reject = fail;
  });
  requests.push({ method, url, payload, resolve, reject });
  return promise;
}
const api = new Proxy(
  {},
  {
    get:
      (_, key) =>
      (...ids) =>
        `/test/${String(key)}/${ids.join("/")}`,
  },
);
const notification = {
  showSuccessAlert: (...args) => notices.push(["success", ...args]),
  showErrorAlert: (...args) => notices.push(["error", ...args]),
  showLaravelError: (...args) => notices.push(["network", ...args]),
};
function evaluate(script, imports = {}) {
  const exports = {};
  vm.runInNewContext(
    ts.transpileModule(script, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    {
      exports,
      require(name) {
        if (imports[name]) return imports[name];
        if (name === "vue") return require("vue");
        if (name === "lodash-es") return { debounce: (callback) => callback };
        if (name.includes("NotificationService"))
          return { __esModule: true, default: notification };
        if (name.includes("GlobalRules"))
          return { __esModule: true, default: rules };
        if (name.includes("SetupService"))
          return {
            SetupService: {
              DefaultCurrency: () => "USD",
              ShopsDomain: () => "example.test",
            },
          };
        if (name.includes("ShopPermissions"))
          return {
            ShopPermissionRegions: { MARKETING: { code: "marketing" } },
          };
        if (name.includes("EmailProviders"))
          return {
            EmailProviders: [
              { driver: "smtp", title: "SMTP", icon: "smtp.svg" },
            ],
          };
        if (name === "webfontloader")
          return {
            load: (config) => fonts.push(config),
            default: { load: (config) => fonts.push(config) },
          };
        if (name.includes("ScrollHelper"))
          return {
            __esModule: true,
            default: { scrollToTop() {}, scrollToElement() {} },
          };
        if (name === "@selldone/core-js")
          return {
            FileHelper: {
              DownloadText: (...args) => downloads.push(args),
              LoadFile: () =>
                new Promise((resolve, reject) =>
                  fileLoads.push({ resolve, reject }),
                ),
            },
          };
        return { __esModule: true, default: {}, InlineEditorMixin: {} };
      },
      window: { API: api, innerWidth: 1200 },
      axios: {
        ...Object.fromEntries(
          ["get", "post", "put"].map((method) => [
            method,
            (url, payload) => request(method, url, payload),
          ]),
        ),
        request: ({ method, url, data }) =>
          request(method.toLowerCase(), url, data),
      },
      setTimeout,
      clearTimeout,
      console,
    },
  );
  return exports;
}
function sfc(relative, name) {
  const source = read(relative);
  const { descriptor, errors } = parse(source);
  assert.deepEqual(errors, []);
  const template = compileTemplate({
    source: descriptor.template.content,
    filename: name,
    id: "email-editor-check",
  });
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    assert.equal(style.scoped, true, `${name} styles stay feature-scoped.`);
    assert.deepEqual(
      compileStyle({
        source: style.content,
        filename: name,
        id: "email-editor-check",
        scoped: true,
        preprocessLang: style.lang,
      }).errors,
      [],
    );
  }
  return { source, descriptor, template };
}
const editor = sfc("./BEmailMarketingEditor.vue", "BEmailMarketingEditor.vue");
const nativeSections = evaluate(
  read("./section/structure/EmailSectionStructures.ts"),
).default;
const { EmailOptionsHelper } = evaluate(
  read("./section/options/EmailOptionsHelper.ts"),
);
const component = evaluate(editor.descriptor.script.content, {
  "./section/structure/EmailSectionStructures": {
    __esModule: true,
    default: nativeSections,
  },
  "./section/options/EmailOptionsHelper.ts": { EmailOptionsHelper },
}).default;
const vue = require("vue");
const { renderToString } = require("@vue/server-renderer");
const attr = (record, name) =>
  Object.entries(record.attrs).find(
    ([key]) =>
      key.replaceAll("-", "").toLowerCase() ===
      name.replaceAll("-", "").toLowerCase(),
  )?.[1];
async function renderNative(view, definition, props, data = {}) {
  const records = [];
  const renderExports = {};
  vm.runInNewContext(
    ts.transpileModule(view.template.code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    { exports: renderExports, require: () => vue },
  );
  const inert = (name) =>
    vue.defineComponent({
      inheritAttrs: false,
      setup(_props, { attrs, slots }) {
        return () => {
          records.push({ name, attrs: { ...attrs } });
          const children = Object.values(slots).flatMap((slot) =>
            slot({
              props: {},
              item: {
                raw:
                  name === "VCombobox"
                    ? Object.assign(new String("Inter"), {
                        toColor: () => "#777777",
                      })
                    : "Inter",
              },
              element: { type: "SUBSCRIBED", subscribed: true },
              index: 0,
            }),
          );
          return vue.h("div", { "data-native": name }, children);
        };
      },
    });
  const app = vue.createSSRApp(
    {
      ...definition,
      data() {
        return { ...definition.data.call(this), ...data };
      },
      render: renderExports.render,
      components: Object.fromEntries(
        Object.keys(definition.components || {}).map((name) => [
          name,
          inert(name),
        ]),
      ),
    },
    props,
  );
  app.config.warnHandler = () => {};
  const tags = new Set(
    Array.from(
      view.source.matchAll(/<((?:v|u|s|b)-[a-z-]+)/g),
      ([, tag]) => tag,
    ),
  );
  for (const tag of tags) {
    const name = tag
      .split("-")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join("");
    app.component(name, inert(name));
  }
  Object.assign(app.config.globalProperties, {
    $t: (key) => key,
    $tm: () => [],
    $n: String,
    $route: {
      name: "BPageEmailMarketingEdit",
      params: { shop_id: 7, email_id: props.email?.id },
    },
    $router: { push() {} },
    $i18n: { locale: "en" },
    $vuetify: { theme: { current: { dark: false, colors: {} } } },
    GlobalRules: rules,
    readShopAccess: () => readAccess,
    writeShopAccess: () => writeAccess,
    USER: () => ({ id: 11 }),
    getShopImagePath: () => "shop.svg",
    getShopIcon: () => "shop.svg",
    getUserAvatar: () => "user.svg",
    getLocalTimeString: String,
    getLocalDateString: String,
    require: () => "asset.svg",
    isRTL: () => false,
  });
  app.config.warnHandler = () => {};
  const requestsBefore = requests.length;
  const html = await renderToString(app);
  assert.equal(
    requests.length,
    requestsBefore,
    "Rendering the editor cannot save or send mail.",
  );
  return { records, html };
}
const drawerSfc = sfc(
  "./section/BEmailMarketingEditorSection.vue",
  "BEmailMarketingEditorSection.vue",
);
const rowSfc = sfc(
  "./section/row/BEmailMarketingEditorSectionRow.vue",
  "BEmailMarketingEditorSectionRow.vue",
);
const drawer = evaluate(drawerSfc.descriptor.script.content).default;
const row = evaluate(rowSfc.descriptor.script.content).default;
const { Customer } = evaluate(
  read("../../../../core-js/models/shop/customer/customer.model.ts"),
  { "../club": { Club: { Levels: {} } } },
);
const funnelSfc = sfc(
  "../../customer/funnel/BCustomersFunnel.vue",
  "BCustomersFunnel.vue",
);
const funnel = evaluate(funnelSfc.descriptor.script.content, {
  "@selldone/core-js": {
    Customer,
    FileHelper: { DownloadBlobFile: (...args) => downloads.push(args) },
  },
}).default;
const filterDesignSfc = sfc(
  "../../customer/filter/design/BCustomersFilterDesign.vue",
  "BCustomersFilterDesign.vue",
);
const filterDesign = evaluate(
  filterDesignSfc.descriptor.script.content,
).default;
assert.equal(funnel.data().filter_types, Customer.Filters);
assert.deepEqual(Object.keys(Customer.Filters).sort(), [
  "LAST_BUY_DATE",
  "LEVEL",
  "LIMIT",
  "LOCATION",
  "LOGIN_DATE",
  "NOT_PURCHASED",
  "REGISTER_DATE",
  "SEGMENTS",
  "SEX",
  "SUBSCRIBED",
]);
assert.equal(funnel.props.readOnly.default, false);
assert.equal(filterDesign.props.readOnly.default, false);
const frozenRules = Object.freeze([
  Object.freeze({ type: "SUBSCRIBED", subscribed: true }),
  Object.freeze({ type: "LIMIT", limit: 24 }),
]);
const frozenPermanent = Object.freeze([
  Object.freeze({ type: "SUBSCRIBED", subscribed: true }),
]);
const readonlyEvents = [];
let reportRefreshes = 0,
  segmentReads = 0;
const readonlyFunnel = {
  ...funnel.data(),
  shop: { id: 7 },
  readOnly: true,
  modelValue: frozenRules,
  permanentFilters: frozenPermanent,
  $t: (key) => key,
  $emit: (...args) => readonlyEvents.push(args),
  refreshFunnel() {
    reportRefreshes++;
  },
  fetchSegments() {
    segmentReads++;
  },
};
funnel.created.call(readonlyFunnel);
assert.equal(reportRefreshes, 1);
assert.equal(segmentReads, 1);
assert.equal(
  readonlyEvents.length,
  0,
  "Opening a readonly audience cannot rewrite saved or permanent filters.",
);
const readonlyDesigner = {
  ...filterDesign.data(),
  readOnly: true,
  modern: true,
  modelValue: frozenRules,
  permanentFilters: frozenPermanent,
  types: Customer.Filters,
  $emit: (...args) => readonlyEvents.push(args),
};
for (const [name, method] of Object.entries(filterDesign.methods))
  readonlyDesigner[name] = method.bind(readonlyDesigner);
readonlyDesigner.moveItem(1, -1);
readonlyDesigner.deleteItem(1);
readonlyDesigner.addDialog("LIMIT");
readonlyDesigner.editDialog(frozenRules[1]);
readonlyDesigner.add();
assert.equal(readonlyEvents.length, 0);
assert.equal(
  filterDesign.computed.dragOptions.call(readonlyDesigner).disabled,
  true,
);
assert.equal(readonlyDesigner.canMoveItem(1, 0), false);
filterDesign.created.call({ ...readonlyDesigner, modelValue: null });
assert.equal(
  readonlyEvents.length,
  0,
  "A missing readonly model is not initialized through an update event.",
);
readonlyDesigner.show_add = true;
readonlyDesigner.add_item = { type: "LIMIT", limit: 50 };
readonlyDesigner.drag = true;
filterDesign.watch.readOnly.call(readonlyDesigner, true);
assert.equal(readonlyDesigner.show_add, false);
assert.equal(readonlyDesigner.add_item, null);
assert.equal(readonlyDesigner.drag, false);
filterDesign.created.call({
  ...readonlyDesigner,
  modelValue: null,
  readOnly: false,
});
assert.deepEqual(
  plain(readonlyEvents.pop()),
  ["update:modelValue", []],
  "Default editable callers retain null-model initialization.",
);
const fixedRules = [
  { type: "SUBSCRIBED", subscribed: true },
  { type: "LIMIT", limit: 24 },
  { type: "LOCATION", countries: ["US"] },
];
const fixedEvents = [];
const fixedDesigner = {
  ...filterDesign.data(),
  readOnly: false,
  modern: true,
  modelValue: fixedRules,
  permanentFilters: [{ type: "SUBSCRIBED", subscribed: true }],
  types: Customer.Filters,
  $emit: (...args) => fixedEvents.push(args),
};
for (const [name, method] of Object.entries(filterDesign.methods))
  fixedDesigner[name] = method.bind(fixedDesigner);
fixedDesigner.editDialog(fixedRules[0]);
fixedDesigner.deleteItem(0);
fixedDesigner.moveItem(0, 1);
fixedDesigner.moveItem(1, -1);
assert.equal(fixedDesigner.show_add, false);
assert.equal(
  fixedEvents.length,
  0,
  "The permanent Subscribed row cannot be edited, deleted or reordered.",
);
assert.equal(
  fixedDesigner.canMoveItem(2, 0),
  false,
  "An optional rule cannot cross the fixed first rule.",
);
assert.equal(fixedDesigner.canMoveItem(0, 2), false);
for (const [index, target] of [
  [-1, 1],
  [1, -1],
  [3, 1],
  [1, 3],
]) {
  assert.equal(
    fixedDesigner.canMoveItem(index, target),
    false,
    "Drag destinations outside the current filter list are rejected.",
  );
}
assert.equal(fixedRules[0].subscribed, true);
fixedDesigner.moveItem(1, 1);
assert.deepEqual(
  plain(fixedEvents[0][1].map((rule) => rule.type)),
  ["SUBSCRIBED", "LOCATION", "LIMIT"],
  "Optional rules remain reorderable below Subscribed.",
);
assert.deepEqual(
  fixedRules.map((rule) => rule.type),
  ["SUBSCRIBED", "LIMIT", "LOCATION"],
  "Reordering emits a new list without mutating the parent draft in place.",
);
const fixedView = await renderNative(filterDesignSfc, filterDesign, {
  modern: true,
  readOnly: false,
  modelValue: fixedRules,
  permanentFilters: fixedDesigner.permanentFilters,
  types: Customer.Filters,
});
const drag = fixedView.records.find((record) => record.name === "draggable");
assert(drag);
assert.equal(attr(drag, "item-key"), "type");
assert.equal(attr(drag, "disabled"), false);
assert.equal(
  attr(drag, "handle"),
  ".b-customers-filter-design-modern__handle",
  "Modern filters drag only by their dedicated handle, leaving edit actions usable.",
);
assert.equal(
  attr(drag, "move")({ draggedContext: { index: 2, futureIndex: 0 } }),
  false,
);
assert.equal(
  attr(drag, "move")({ draggedContext: { index: 1, futureIndex: 2 } }),
  true,
);
assert(
  !fixedView.html.includes('class="b-customers-filter-design-modern__actions"'),
  "The fixed rule has no edit/reorder/delete action group.",
);
assert(
  fixedView.records.some(
    (record) =>
      record.name === "VIcon" &&
      attr(record, "class") ===
        "b-customers-filter-design-modern__handle--fixed",
  ),
  "Subscribed exposes a muted position marker rather than a draggable handle.",
);
assert(
  !fixedView.records.some((record) =>
    String(attr(record, "class") || "")
      .split(/\s+/)
      .includes("b-customers-filter-design-modern__handle"),
  ),
  "The mandatory row is excluded from the sortable handle selector.",
);
assert.equal(
  attr(
    fixedView.records.find((record) => record.name === "BCustomersFilterItem"),
    "modern",
  ),
  true,
  "Modern filter rows pass their presentation mode to the native item.",
);
const draftRules = Object.freeze([
  Object.freeze({ type: "SUBSCRIBED", subscribed: true }),
  Object.freeze({ type: "LEVEL", levels: Object.freeze(["BRONZE"]) }),
]);
const draftEvents = [];
const draftDesigner = {
  ...filterDesign.data(),
  readOnly: false,
  modern: true,
  modelValue: draftRules,
  permanentFilters: frozenPermanent,
  types: Customer.Filters,
  $t: (key) => key,
  $emit: (...args) => draftEvents.push(args),
  AddOrUpdateItemByID: evaluate(read("../../../mixin/CoreMixin.ts")).default
    .methods.AddOrUpdateItemByID,
};
for (const [name, method] of Object.entries(filterDesign.methods))
  draftDesigner[name] = method.bind(draftDesigner);
draftDesigner.editDialog(draftRules[1]);
assert.notEqual(draftDesigner.add_item, draftRules[1]);
assert.notEqual(draftDesigner.add_item.levels, draftRules[1].levels);
draftDesigner.add_item.levels.push("GOLD");
draftDesigner.show_add = false;
assert.deepEqual(draftRules[1].levels, ["BRONZE"]);
assert.equal(
  draftEvents.length,
  0,
  "Closing an unapplied filter emits no changes.",
);
draftDesigner.editDialog(draftRules[1]);
assert.deepEqual(plain(draftDesigner.add_item.levels), ["BRONZE"]);
draftDesigner.add_item.levels = ["SILVER"];
draftDesigner.add();
const appliedRules = draftEvents.pop();
assert.equal(appliedRules[0], "update:modelValue");
assert.notEqual(appliedRules[1], draftRules);
assert.equal(appliedRules[1][0], draftRules[0]);
assert.deepEqual(plain(appliedRules[1][1]), {
  type: "LEVEL",
  levels: ["SILVER"],
});
assert.deepEqual(draftRules[1].levels, ["BRONZE"]);
assert.equal(draftDesigner.show_add, false);
assert.equal(draftDesigner.add_item, null);
draftDesigner.addDialog("LIMIT");
draftDesigner.add_item.limit = 15;
draftDesigner.add();
assert.deepEqual(
  plain(draftEvents.pop()[1].map((rule) => rule.type)),
  ["SUBSCRIBED", "LEVEL", "LIMIT"],
  "Adding a rule appends it to a fresh draft without changing fixed-rule order.",
);
assert.equal(draftRules.length, 2);
assert.equal(
  draftDesigner.getInputLabel({ title: "Custom field" }, "custom"),
  "Custom field",
  "Custom filter definitions retain their supplied field titles.",
);
const inputComponents = {
  date: "UDateInput",
  boolean: "USmartSwitch",
  number: "UNumberInput",
  enum: "VSelect",
  countries: "SCountrySelect",
  segments: "VCombobox",
};
const sampleInputs = {
  start: "2026-10-20T00:00:00.000Z",
  end: "2026-11-05T00:00:00.000Z",
  levels: ["BRONZE"],
  subscribed: true,
  sex: ["MALE"],
  countries: ["US"],
  limit: 15,
  segments: ["VIP"],
  or: false,
};
for (const definition of Object.values(Customer.Filters)) {
  const dialogView = await renderNative(
    filterDesignSfc,
    filterDesign,
    {
      modern: true,
      modelValue: draftRules,
      types: Customer.Filters,
      segments: ["VIP"],
    },
    {
      show_add: true,
      add_type: definition,
      add_item: { type: definition.type, ...sampleInputs },
    },
  );
  for (const [key, input] of Object.entries(definition.inputs || {})) {
    const field = dialogView.records.find(
      (record) =>
        record.name === inputComponents[input.type] &&
        attr(record, "label") === `user_funnel.workspace.fields.${key}`,
    );
    assert(field, `${definition.type}.${key} keeps its named native control.`);
    assert.deepEqual(plain(attr(field, "model-value")), sampleInputs[key]);
    if (input.type === "date") {
      assert.equal(attr(field, "return-utc"), "");
      assert.equal(attr(field, "clearable"), "");
    }
    if (input.type === "boolean") {
      assert.equal(attr(field, "accessible"), true);
      assert.equal(attr(field, "aria-label"), attr(field, "label"));
    }
    if (input.type === "enum") {
      assert.equal(attr(field, "multiple"), input.multiple);
      assert.equal(attr(field, "item-value"), input.item_value || "code");
      assert.deepEqual(plain(attr(field, "items")), plain(input.items));
    }
    if (input.type === "countries") {
      assert.equal(attr(field, "item-value"), "alpha2");
      assert.equal(attr(field, "multiple"), "");
    }
    if (input.type === "segments") {
      const logic = dialogView.records.find(
        (record) =>
          record.name === "USmartSwitch" &&
          attr(record, "label") === "user_funnel.workspace.logic",
      );
      assert(logic);
      assert.equal(attr(logic, "accessible"), true);
      assert.equal(attr(logic, "aria-label"), "user_funnel.workspace.logic");
      assert.equal(attr(logic, "model-value"), false);
      assert.equal(
        attr(logic, "false-title"),
        "user_funnel.workspace.all_segments",
      );
      assert.equal(
        attr(logic, "true-title"),
        "user_funnel.workspace.any_segment",
      );
    }
  }
  if (!definition.inputs)
    assert(dialogView.html.includes("user_funnel.workspace.no_options"));
}
const customDefinition = {
  type: "CUSTOM",
  title: "Custom filter",
  description: "Custom filter settings",
  inputs: { custom: { type: "combobox", title: "Custom tags" } },
};
const customView = await renderNative(
  filterDesignSfc,
  filterDesign,
  {
    modern: true,
    modelValue: draftRules,
    types: { ...Customer.Filters, CUSTOM: customDefinition },
    segments: ["VIP"],
  },
  {
    show_add: true,
    add_type: customDefinition,
    add_item: { type: "CUSTOM", custom: ["VIP"] },
  },
);
const customField = customView.records.find(
  (record) =>
    record.name === "VCombobox" && attr(record, "label") === "Custom tags",
);
assert(
  customField,
  "Custom combobox filters retain their native input branch.",
);
assert.deepEqual(plain(attr(customField, "model-value")), ["VIP"]);
assert.equal(attr(customField, "multiple"), "");
fixedDesigner.modern = false;
fixedDesigner.editDialog(fixedRules[0]);
assert.equal(
  fixedDesigner.show_add,
  true,
  "Default legacy editing keeps its original behavior.",
);
assert.equal(fixedDesigner.canMoveItem(2, 0), true);
const readonlyView = await renderNative(
  funnelSfc,
  { ...funnel, created() {} },
  {
    modern: true,
    readOnly: true,
    shop: { id: 7 },
    modelValue: frozenRules,
    permanentFilters: frozenPermanent,
    "onUpdate:modelValue": (...args) =>
      readonlyEvents.push(["update:modelValue", ...args]),
  },
);
const nativeDesigner = readonlyView.records.find(
  (record) => record.name === "BCustomersFilterDesign",
);
assert(nativeDesigner);
assert.equal(attr(nativeDesigner, "read-only"), true);
attr(nativeDesigner, "onUpdate:modelValue")([{ type: "LIMIT", limit: 99 }]);
assert(
  !readonlyEvents.some(([event]) => event === "update:modelValue"),
  "Readonly designer updates are not forwarded to the saved email draft.",
);
assert(
  readonlyView.records.some(
    (record) =>
      record.name === "VBtn" &&
      attr(record, "prepend-icon") === "refresh" &&
      !attr(record, "disabled"),
  ),
);
assert(
  readonlyView.records.some(
    (record) =>
      record.name === "VBtn" &&
      attr(record, "prepend-icon") === "download" &&
      !attr(record, "disabled"),
  ),
  "Readonly recipients retain report Refresh and Download controls.",
);
assert.equal(funnel.props.showFunnel.default, false);
const funnelReport = (counts) =>
  Object.freeze(
    counts.map((count, index) =>
      Object.freeze({ label: `Stage ${index + 1}`, count }),
    ),
  );
const funnelCases = [
  { counts: [45, 45, 45], shares: [1, 1, 1], removed: [0, 0, 0] },
  { counts: [100, 40, 0], shares: [1, 0.4, 0], removed: [0, 60, 40] },
  { counts: [0, 0], shares: [null, null], removed: [0, 0] },
  { counts: [null, 0], shares: [null, null], removed: [0, 0] },
  { counts: [100, null, 20], shares: [1, null, 0.2], removed: [0, 0, 0] },
  { counts: [100, 120], shares: [1, 1.2], removed: [0, 0] },
  {
    counts: [100, -1, NaN, Infinity],
    shares: [1, null, null, null],
    removed: [0, 0, 0, 0],
  },
];
for (const { counts, shares, removed } of funnelCases) {
  const report = funnelReport(counts);
  const stages = funnel.computed.funnelStages.call({ funnel_date: report });
  assert.deepEqual(
    Array.from(stages, (stage) => stage.count),
    counts,
    "A recognizable silhouette must not invent or replace server counts.",
  );
  assert.deepEqual(
    Array.from(stages, (stage) => stage.share),
    shares,
  );
  assert.deepEqual(
    Array.from(stages, (stage) => stage.removed),
    removed,
  );
  assert.deepEqual(
    Array.from(stages, (stage) => stage.hasCount),
    counts.map((count) => Number.isFinite(count) && count >= 0),
  );
  assert.deepEqual(
    Array.from(stages, (stage) => stage.label),
    report.map((stage) => stage.label),
  );
  for (const [index, stage] of stages.entries()) {
    assert(Number.isFinite(stage.top) && Number.isFinite(stage.height));
    assert(stage.top >= 0 && stage.height >= 0);
    assert(stage.top + stage.height <= 360);
    if (index) assert(stage.top > stages[index - 1].top);
  }
}
for (const report of [null, []]) {
  assert.deepEqual(
    plain(funnel.computed.funnelStages.call({ funnel_date: report })),
    [],
  );
}
const manyFunnelStages = funnel.computed.funnelStages.call({
  funnel_date: funnelReport(Array(100).fill(1)),
});
assert(
  manyFunnelStages.every(
    (stage) => Number.isFinite(stage.top) && stage.height >= 0,
  ),
  "Dense or unexpected reports cannot produce negative SVG rectangle heights.",
);
const visualFunnelDefinition = { ...funnel, created() {} };
const visualFunnelProps = {
  modern: true,
  showFunnel: true,
  readOnly: true,
  shop: { id: 7 },
  modelValue: frozenRules,
};
for (const counts of [
  [45, 45, 45],
  [100, 40, 0],
  [0, 0],
  [null, 0],
]) {
  const report = funnelReport(counts);
  const view = await renderNative(
    funnelSfc,
    visualFunnelDefinition,
    visualFunnelProps,
    {
      funnel_date: report,
    },
  );
  assert(view.html.includes('class="b-customers-funnel-modern__visual"'));
  assert.equal(
    [...view.html.matchAll(/class="b-customers-funnel-modern__visual-step"/g)]
      .length,
    counts.length,
  );
  assert(view.html.includes('aria-hidden="true"'));
  assert(!view.html.includes('class="b-customers-funnel-modern__steps"'));
  const rects = [...view.html.matchAll(/<rect\b[^>]*class="([^"]*)"[^>]*>/g)];
  assert.equal(rects.length, counts.length);
  assert.deepEqual(
    rects.map(([, classes]) => classes.includes("__fill--empty")),
    counts.map((count) => !(Number.isFinite(count) && count > 0)),
    "Zero and unavailable counts must not receive a positive-flow fill.",
  );
  const displayedCounts = [
    ...view.html.matchAll(/<strong>([^<]*)<\/strong>/g),
  ].map(([, value]) => value);
  assert.deepEqual(
    displayedCounts,
    counts.map((count) =>
      Number.isFinite(count) && count >= 0 ? String(count) : "—",
    ),
  );
  assert(!view.html.includes("NaN") && !view.html.includes("Infinity"));
  assert(
    view.records.some(
      (record) =>
        record.name === "VBtn" && attr(record, "prepend-icon") === "refresh",
    ),
  );
  assert(
    view.records.some(
      (record) =>
        record.name === "VBtn" && attr(record, "prepend-icon") === "download",
    ),
  );
}
const compactFunnel = await renderNative(
  funnelSfc,
  visualFunnelDefinition,
  { ...visualFunnelProps, showFunnel: false },
  { funnel_date: funnelReport([45, 45, 45]) },
);
assert(compactFunnel.html.includes('class="b-customers-funnel-modern__steps"'));
assert(
  !compactFunnel.html.includes('class="b-customers-funnel-modern__visual"'),
  "Email's compact audience report stays unchanged unless the caller opts into the funnel.",
);
for (const state of [
  { funnel_date: [] },
  { funnel_date: null },
  { funnel_date: funnelReport([45]), funnel_error: true },
  { funnel_date: funnelReport([45]), busy_refresh: true },
]) {
  const view = await renderNative(
    funnelSfc,
    visualFunnelDefinition,
    visualFunnelProps,
    state,
  );
  assert(!view.html.includes('class="b-customers-funnel-modern__visual"'));
}
let reportIndex = requests.length;
funnel.methods.refreshFunnel.call(readonlyFunnel);
assert.equal(requests[reportIndex].url, "/test/POST_FUNNEL_USERS_COUNT/7");
assert.equal(requests[reportIndex].payload.filters, frozenRules);
requests[reportIndex].resolve({
  data: { error: false, funnel_date: [{ label: "Subscribed", count: 24 }] },
});
await flush();
assert(
  readonlyEvents.some(
    ([event, count]) => event === "update:count" && count === 24,
  ),
);
assert(!readonlyEvents.some(([event]) => event === "update:modelValue"));
reportIndex = requests.length;
funnel.methods.downloadExcel.call(readonlyFunnel);
assert.equal(requests[reportIndex].url, "/test/POST_FUNNEL_USERS_DATA/7");
assert.equal(requests[reportIndex].payload.filters, frozenRules);
requests[reportIndex].resolve({ data: "disposable-report-stub", headers: {} });
await flush();
assert.equal(readonlyFunnel.busy_download, false);
assert.equal(drawer.props.modern.default, false);
assert.equal(row.props.modern.default, false);
const drawerState = { ...drawer.data(), shop: { id: 7 }, email: null };
assert.equal(drawer.computed.uploadUrl.call(drawerState), null);
drawerState.email = { id: 13 };
assert.equal(
  drawer.computed.uploadUrl.call(drawerState),
  "/test/POST_UPLOAD_IMAGE_EMAIL/7/13",
);
const nativeOptions = [
  { type: "text", key: "title", object: { title: "Draft" } },
];
drawer.methods.showEmailSectionEditor.call(drawerState, nativeOptions);
assert.equal(drawerState.dialog_options, nativeOptions);
assert.equal(drawerState.dialog_show, true);
const rowEvents = [];
const rowState = {
  option: { key: "font_title", object: {} },
  loadedFonts: [],
  $emit: (...args) => rowEvents.push(args),
};
const fontLoadsBefore = fonts.length;
row.methods.onSelectFont.call(rowState, "Inter");
row.methods.onSelectFont.call(rowState, "Inter");
assert.equal(rowState.option.object.font_title, "Inter");
assert.deepEqual(rowState.loadedFonts, ["Inter"]);
assert.equal(fonts.length, fontLoadsBefore + 1);
row.methods.onUpdate.call(rowState);
assert.deepEqual(rowEvents, [["blur"]]);
const fontObject = { font_title: "Inter" };
const fontRender = await renderNative(rowSfc, row, {
  modern: true,
  shop: { id: 7 },
  option: {
    type: "font",
    object: fontObject,
    key: "font_title",
    label: "Font",
  },
  loadedFonts: [],
  uploadUrl: null,
});
const fontControl = fontRender.records.find(
  (record) => record.name === "VCombobox",
);
assert(fontControl);
assert.equal(attr(fontControl, "model-value"), "Inter");
attr(fontControl, "onBlur")({ type: "blur" });
assert.equal(
  fontObject.font_title,
  "Inter",
  "Modern font blur retains the selected font instead of storing a DOM event.",
);
const imageRender = await renderNative(rowSfc, row, {
  modern: true,
  shop: { id: 7 },
  option: {
    type: "image",
    object: { image: "existing.png" },
    key: "image",
    label: "Image",
  },
  loadedFonts: [],
  uploadUrl: null,
});
const uploader = imageRender.records.find(
  (record) => record.name === "SImageUploader",
);
assert(uploader, "The existing image uploader remains available.");
assert.equal(attr(uploader, "disabled"), true);
assert.equal(attr(uploader, "image"), "existing.png");
assert.match(imageRender.html, /email_builder\.workspace\.save_before_upload/);

let readAccess = true;
let writeAccess = true;
const structure = () => ({
  color_1: "#0066ef",
  color_2: "#8873ce",
  font_title: "Roboto",
  font_text: "Inter",
  header: { title: "Autumn collection", align: "center" },
  footer: { message: "Thank you" },
  sections: [{ type: "text", title: "Draft copy", text: "Local draft" }],
});
const savedEmail = () => ({
  id: 13,
  shop_id: 7,
  name: "Autumn campaign",
  currency: "EUR",
  schedule_at: null,
  structure: structure(),
  filter: [{ type: "SUBSCRIBED", subscribed: true }],
  subject: "The new collection",
  from: "team",
  cluster_id: 9,
  sent: false,
  in_que: false,
  approve: null,
});
function fixture(overrides = {}) {
  const emitted = [];
  const routes = [];
  const props = {
    shop: {
      id: 7,
      name: "test-shop",
      title: "Test shop",
      currencies: ["USD", "EUR"],
      user_id: 11,
      preferences: {},
    },
    email: savedEmail(),
    initialConfig: null,
    structure: structure(),
    service: { enable: true, cost: 0.01 },
    mailService: { enable: true, driver: "smtp", host: "mail.example.test" },
    hasEditMode: true,
    ...overrides,
  };
  const state = {
    ...props,
    $props: props,
    $refs: {
      form: { validate: () => Promise.resolve({ valid: true }) },
      send_form: { validate: () => Promise.resolve({ valid: true }) },
      section_editor: {
        showEmailSectionEditor: (value) => emitted.push(["options", value]),
      },
      scale_container: { clientHeight: 600 },
    },
    $emit: (...args) => emitted.push(args),
    $router: { push: (route) => routes.push(route) },
    $route: {
      name: "BPageEmailMarketingEdit",
      params: { shop_id: 7, email_id: props.email?.id },
    },
    readShopAccess: () => readAccess,
    writeShopAccess: () => writeAccess,
    USER: () => ({ id: 11 }),
    MergeObjects: (target, patch) => Object.assign(target, patch),
    $t: (key, params = {}) => key + (params.name ? ` ${params.name}` : ""),
    $tm: () => [],
    $n: (value) => String(value),
    $i18n: { locale: "en" },
    $vuetify: { theme: { current: { dark: false, colors: {} } } },
    GlobalRules: rules,
    $nextTick: (callback) => callback?.(),
  };
  Object.assign(state, component.data.call(state));
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  component.created.call(state);
  return Object.assign(state, { emitted, routes });
}

const requestsBeforeOpening = requests.length;
const existing = fixture();
assert.equal(existing.mail_name, "Autumn campaign");
assert.equal(existing.mail_currency, "EUR");
assert.equal(existing.mail_subject, "The new collection");
assert.equal(existing.mail_from, "team");
assert.equal(existing.cluster_id, 9);
assert.equal(existing.filter, existing.email.filter);
assert.deepEqual(plain(fonts.at(-1)), {
  google: { families: ["Roboto", "Inter"] },
});

const create = fixture({
  email: null,
  initialConfig: { name: "New draft", currency: "EUR", cluster_id: 4 },
});
assert.equal(create.mail_name, "New draft");
assert.equal(create.mail_currency, "EUR");
assert.equal(create.cluster_id, 4);
const invalidCurrency = fixture({
  email: null,
  initialConfig: { name: "New draft", currency: "INVALID" },
});
assert.equal(invalidCurrency.mail_currency, "USD");
assert.equal(
  requests.length,
  requestsBeforeOpening,
  "Opening create/edit never writes a draft automatically.",
);

const rendered = await renderNative(editor, component, existing.$props);
assert(
  !rendered.records.some((record) => record.name === "UCurrencyInput"),
  "Persisted currency is immutable context, not an editable input.",
);
const currencyIcon = rendered.records.find(
  (record) => record.name === "UCurrencyIcon",
);
assert(currencyIcon);
assert.equal(attr(currencyIcon, "currency"), "EUR");
const lockedCurrency = rendered.records.find(
  (record) => attr(record, "class") === "b-email-editor__currency-field",
);
assert(lockedCurrency);
assert.notEqual(attr(lockedCurrency, "readonly"), undefined);
assert.equal(attr(lockedCurrency, "model-value"), "EUR");
assert.equal(attr(lockedCurrency, "onUpdate:modelValue"), undefined);
const createRendered = await renderNative(editor, component, create.$props);
const currencyInput = createRendered.records.find(
  (record) => record.name === "UCurrencyInput",
);
assert(currencyInput);
assert.equal(attr(currencyInput, "return-object"), false);
assert.deepEqual(plain(attr(currencyInput, "active-currencies")), [
  "USD",
  "EUR",
]);
const recipients = rendered.records.find(
  (record) => record.name === "BCustomersFunnel",
);
assert(recipients, "The native recipient funnel stays mounted in the editor.");
assert.equal(vue.toRaw(attr(recipients, "model-value")), existing.email.filter);
assert.deepEqual(plain(attr(recipients, "permanent-filters")), [
  { type: "SUBSCRIBED", subscribed: true },
]);
const nativeDrawer = rendered.records.find(
  (record) => record.name === "BEmailMarketingEditorSection",
);
assert(nativeDrawer);
assert.equal(vue.toRaw(attr(nativeDrawer, "email")), existing.email);
assert.notEqual(attr(nativeDrawer, "modern"), undefined);
assert.equal(
  existing.cost,
  null,
  "An uncalculated audience has no estimated cost yet.",
);
assert(
  !rendered.records.some((record) => record.name === "UPrice"),
  "Unknown cost is not displayed as a zero-priced estimate.",
);
assert.match(rendered.html, /email_builder\.workspace\.cost_unavailable/);
const zeroCost = await renderNative(editor, component, existing.$props, {
  users_count: 0,
});
assert(
  zeroCost.records.some(
    (record) =>
      record.name === "UPrice" &&
      attr(record, "amount") === 0 &&
      attr(record, "currency") === "EUR",
  ),
);
const noService = await renderNative(
  editor,
  component,
  { ...existing.$props, service: null },
  { users_count: 40 },
);
assert(!noService.records.some((record) => record.name === "UPrice"));
const readonlyEditor = await renderNative(editor, component, {
  ...existing.$props,
  email: { ...savedEmail(), sent: true },
});
const readonlyRecipients = readonlyEditor.records.find(
  (record) => record.name === "BCustomersFunnel",
);
assert(readonlyRecipients);
assert.equal(
  attr(readonlyRecipients, "read-only"),
  true,
  "Sent emails use the native readonly rules path without blocking report controls.",
);
assert.deepEqual(plain(existing.editorSections.map((section) => section.key)), [
  "general",
  "audience",
  "design",
  "send",
]);
const sectionsBefore = plain(existing.structure);
for (const section of ["general", "audience", "design", "send"]) {
  const selected = await renderNative(editor, component, existing.$props, {
    active_section: section,
  });
  const panels = [
    ...selected.html.matchAll(
      /<section[^>]*class="[^"]*b-email-editor__panel[^>]*>/g,
    ),
  ];
  assert.equal(
    panels.length,
    4,
    "Every section remains mounted while local navigation changes.",
  );
  assert.equal(
    panels.filter(([markup]) => /display:none/.test(markup)).length,
    3,
  );
  assert.equal(
    (selected.html.match(/aria-current="location"/g) || []).length,
    1,
  );
  assert(
    selected.records.some(
      (record) =>
        record.name === "BCustomersFunnel" &&
        vue.toRaw(attr(record, "model-value")) === existing.email.filter,
    ),
  );
  assert(
    selected.records.some(
      (record) =>
        record.name === "VTextField" &&
        attr(record, "id") === "mail_name" &&
        attr(record, "model-value") === "Autumn campaign",
    ),
  );
  assert(
    selected.records.some(
      (record) => record.name === "VForm" && attr(record, "onSubmit"),
    ),
    "Native save/send form handling stays available.",
  );
}
assert.deepEqual(
  plain(existing.structure),
  sectionsBefore,
  "Navigating sections retains the unsaved design.",
);
for (const action of rendered.records.filter(
  (record) =>
    record.name === "VBtn" &&
    attr(record, "color") === "primary" &&
    attr(record, "variant") === "flat",
)) {
  assert(
    attr(action, "prepend-icon"),
    "Every main action retains its purpose icon.",
  );
}

// Keep the native four block structures and option references, rather than rebuilding email content.
assert.deepEqual(Object.keys(nativeSections).sort(), [
  "image",
  "product",
  "text",
  "two-columns",
]);
for (const type of Object.keys(nativeSections)) {
  const draft = fixture();
  const before = draft.structure.sections.length;
  draft.addSection(type, before - 1);
  assert.equal(draft.structure.sections.length, before + 1);
  assert.equal(draft.structure.sections.at(-1).type, type);
  assert.notEqual(draft.structure.sections.at(-1), nativeSections[type]);
  draft.deleteSection(before);
  assert.equal(draft.structure.sections.length, before);
}
const optionStructure = structure();
const pageOptions = EmailOptionsHelper.GeneratePageOptions(
  optionStructure,
).flatMap((group) => group.children);
assert.deepEqual(plain(pageOptions.map((option) => option.key)), [
  "max_width",
  "page_color",
  "sections_color",
  "color_1",
  "color_2",
  "font_title",
  "font_text",
]);
assert(pageOptions.every((option) => option.object === optionStructure));
for (const [type, generate] of [
  ["product", "GenerateProductOptions"],
  ["image", "GenerateImageOptions"],
  ["two-columns", "GenerateTwoColumnsOptions"],
  ["text", "GenerateTextOptions"],
]) {
  const block = structuredClone(nativeSections[type]);
  const options = EmailOptionsHelper[generate](block).flatMap(
    (group) => group.children || [group],
  );
  assert(options.length > 0);
  assert(options.some((option) => option.object === block));
}

const payloadKeys = [
  "cluster_id",
  "currency",
  "filter",
  "from",
  "name",
  "schedule_at",
  "structure",
  "subject",
];
const updatedEmail = (state, patch = {}) => ({
  ...state.email,
  name: state.mail_name,
  structure: state.structure,
  filter: state.filter,
  ...patch,
});
const response = (email) => ({ data: { error: false, email } });
async function settle(operation, requestIndex, result) {
  requests[requestIndex].resolve(result);
  await operation;
  await flush();
}

const edit = fixture();
edit.mail_name = "Updated draft";
edit.mail_currency = "USD";
let index = requests.length;
let operation = edit.saveEmail();
await flush();
assert.equal(requests.length, index + 1);
assert.equal(requests[index].method, "put");
assert.equal(requests[index].url, "/test/PUT_UPDATE_EMAIL/7/13");
assert.deepEqual(Object.keys(requests[index].payload).sort(), payloadKeys);
assert.equal(
  requests[index].payload.currency,
  "EUR",
  "A persisted email keeps its original currency at the write boundary.",
);
assert.equal(requests[index].payload.structure, edit.structure);
assert.equal(requests[index].payload.filter, edit.filter);
assert.equal(requests[index].payload.name, "Updated draft");
await edit.saveEmail();
assert.equal(
  requests.length,
  index + 1,
  "An in-flight save cannot create a duplicate write.",
);
await settle(operation, index, response(updatedEmail(edit)));
assert.equal(edit.busy_save, false);
assert(
  edit.emitted.some(
    ([event, email]) =>
      event === "update:email" && email.name === "Updated draft",
  ),
);

const inactiveCurrency = fixture();
inactiveCurrency.shop.currencies = ["USD"];
index = requests.length;
operation = inactiveCurrency.saveEmail();
await flush();
assert.equal(
  requests.length,
  index + 1,
  "An existing email remains editable if its immutable currency is no longer active for new emails.",
);
assert.equal(requests[index].payload.currency, "EUR");
await settle(operation, index, response(updatedEmail(inactiveCurrency)));
const invalidNewCurrency = fixture({ email: null });
invalidNewCurrency.mail_name = "New draft";
invalidNewCurrency.mail_currency = "INVALID";
index = requests.length;
await invalidNewCurrency.saveEmail();
assert.equal(
  requests.length,
  index,
  "New emails still require an active currency.",
);

index = requests.length;
operation = create.saveEmail();
await flush();
assert.equal(requests.length, index + 1);
assert.equal(requests[index].method, "post");
assert.equal(requests[index].url, "/test/POST_CREATE_EMAIL/7");
assert.deepEqual(Object.keys(requests[index].payload).sort(), payloadKeys);
assert.equal(requests[index].payload.currency, "EUR");
await settle(
  operation,
  index,
  response({ ...savedEmail(), id: 14, name: "New draft" }),
);
assert(
  create.routes.some(
    (route) =>
      route.name === "BPageEmailMarketingEdit" && route.params.email_id === 14,
  ),
);

for (const kind of ["sent", "read", "write", "form", "empty-name"]) {
  readAccess = kind !== "read";
  writeAccess = kind !== "write";
  const denied = fixture();
  if (kind === "sent") denied.email.sent = true;
  if (kind === "form")
    denied.$refs.form.validate = () => Promise.resolve({ valid: false });
  if (kind === "empty-name") denied.mail_name = "   ";
  const before = requests.length;
  await denied.saveEmail();
  await flush();
  assert.equal(requests.length, before, `${kind} cannot save.`);
}
readAccess = writeAccess = true;

const sending = fixture();
sending.users_count = 40;
index = requests.length;
operation = sending.SaveAndSendMail(true);
await flush();
assert.equal(
  requests.length,
  index + 1,
  "Send first persists the current draft.",
);
assert.equal(requests[index].url, "/test/PUT_UPDATE_EMAIL/7/13");
await sending.SaveAndSendMail(true);
assert.equal(
  requests.length,
  index + 1,
  "Repeated Send does not duplicate the save or queue request.",
);
requests[index].resolve(response(updatedEmail(sending)));
await flush();
assert.equal(requests.length, index + 2);
assert.equal(requests[index + 1].url, "/test/POST_SEND_EMAIL/7/13");
requests[index + 1].resolve(
  response(updatedEmail(sending, { in_que: true, approve: "PENDING" })),
);
await operation;
await flush();
assert.equal(sending.busy_send, false);

const cancel = fixture({ service: null, mailService: { enable: false } });
cancel.email.in_que = true;
cancel.users_count = 0;
cancel.mail_name = "";
cancel.$refs.form.validate = () => Promise.resolve({ valid: false });
index = requests.length;
operation = cancel.SaveAndSendMail(false);
await flush();
assert.equal(
  requests.length,
  index + 1,
  "Cancel remains available independently of audience, provider and form validity.",
);
assert.equal(requests[index].url, "/test/POST_CANCEL_EMAIL/7/13");
await cancel.SaveAndSendMail(false);
assert.equal(requests.length, index + 1);
await settle(
  operation,
  index,
  response(updatedEmail(cancel, { in_que: false })),
);
assert.equal(cancel.busy_send, false);

for (const failure of ["logical", "network"]) {
  const retry = fixture();
  index = requests.length;
  operation = retry.saveEmail();
  await flush();
  if (failure === "logical")
    requests[index].resolve({
      data: { error: true, error_msg: "Save failed" },
    });
  else requests[index].reject(new Error("Local stub failure"));
  await operation;
  await flush();
  assert.equal(retry.busy_save, false);
  assert(!retry.emitted.some(([event]) => event === "update:email"));
  const beforeRetry = requests.length;
  operation = retry.saveEmail();
  await flush();
  assert.equal(
    requests.length,
    beforeRetry + 1,
    "A failed request can be retried.",
  );
  await settle(operation, beforeRetry, response(updatedEmail(retry)));
}

for (const failure of ["save-error", "send-error", "send-network"]) {
  const failedSend = fixture();
  failedSend.users_count = 12;
  index = requests.length;
  operation = failedSend.SaveAndSendMail(true);
  await flush();
  assert.equal(requests[index].method, "put");
  if (failure === "save-error") {
    requests[index].resolve({
      data: { error: true, error_msg: "Save failed" },
    });
    await operation;
    await flush();
    assert.equal(
      requests.length,
      index + 1,
      "A failed save cannot be followed by a Send request.",
    );
  } else {
    requests[index].resolve(response(updatedEmail(failedSend)));
    await flush();
    assert.equal(requests[index + 1].url, "/test/POST_SEND_EMAIL/7/13");
    if (failure === "send-error")
      requests[index + 1].resolve({
        data: { error: true, error_msg: "Queue failed" },
      });
    else requests[index + 1].reject(new Error("Local queue failure"));
    await operation;
    await flush();
  }
  assert.equal(failedSend.busy_save, false);
  assert.equal(failedSend.busy_send, false);
  assert.equal(failedSend.email.in_que, false);
}

for (const restriction of [
  "sent",
  "read",
  "write",
  "provider",
  "audience",
  "form",
  "new",
]) {
  const deniedSend = fixture(restriction === "new" ? { email: null } : {});
  deniedSend.users_count = restriction === "audience" ? 0 : 12;
  if (restriction === "sent") deniedSend.email.sent = true;
  if (restriction === "read") readAccess = false;
  if (restriction === "write") writeAccess = false;
  if (restriction === "provider") deniedSend.service = null;
  if (restriction === "form")
    deniedSend.$refs.send_form.validate = () =>
      Promise.resolve({ valid: false });
  const before = requests.length;
  await deniedSend.SaveAndSendMail(true);
  await flush();
  assert.equal(requests.length, before, `${restriction} cannot queue mail.`);
  readAccess = writeAccess = true;
}

const validating = fixture();
let finishValidation;
validating.$refs.form.validate = () =>
  new Promise((resolve) => {
    finishValidation = resolve;
  });
index = requests.length;
operation = validating.saveEmail();
writeAccess = false;
finishValidation({ valid: true });
await operation;
assert.equal(
  requests.length,
  index,
  "Authorization is fresh after asynchronous validation.",
);
writeAccess = true;

for (const invalidEmail of [
  null,
  { ...savedEmail(), id: 99 },
  { ...savedEmail(), shop_id: 99 },
]) {
  const invalidResponse = fixture();
  const before = invalidResponse.emitted.length;
  index = requests.length;
  operation = invalidResponse.saveEmail();
  await flush();
  await settle(operation, index, response(invalidEmail));
  assert.equal(
    invalidResponse.emitted.length,
    before,
    "A response for another resource cannot update this editor.",
  );
  assert.equal(invalidResponse.busy_save, false);
}

for (const change of ["email", "shop", "access", "unmount"]) {
  const staleQueue = fixture();
  staleQueue.email.in_que = true;
  index = requests.length;
  operation = staleQueue.SaveAndSendMail(false);
  await flush();
  const before = staleQueue.emitted.length;
  const oldEmail = updatedEmail(staleQueue, { in_que: false });
  if (change === "email") staleQueue.email = { ...savedEmail(), id: 99 };
  if (change === "shop") staleQueue.shop = { ...staleQueue.shop, id: 99 };
  if (change === "access") writeAccess = false;
  if (change === "unmount") component.beforeUnmount.call(staleQueue);
  await settle(operation, index, response(oldEmail));
  assert.equal(
    staleQueue.emitted.length,
    before,
    `${change} discards a late queue response.`,
  );
  writeAccess = true;
}

for (const change of ["email", "shop", "access", "unmount"]) {
  const stale = fixture();
  index = requests.length;
  operation = stale.saveEmail();
  await flush();
  const emittedBefore = stale.emitted.length;
  const noticesBefore = notices.length;
  const oldEmail = updatedEmail(stale, { name: "Late response" });
  if (change === "email") stale.email = { ...savedEmail(), id: 99 };
  if (change === "shop") stale.shop = { ...stale.shop, id: 99 };
  if (change === "access") writeAccess = false;
  if (change === "unmount") component.beforeUnmount.call(stale);
  await settle(operation, index, response(oldEmail));
  assert.equal(
    stale.emitted.length,
    emittedBefore,
    `${change} discards a stale save response.`,
  );
  assert.equal(stale.routes.length, 0);
  assert.equal(notices.length, noticesBefore);
  writeAccess = true;
}

for (const restriction of ["sent", "write", "read"]) {
  readAccess = restriction !== "read";
  writeAccess = restriction !== "write";
  const readonly = fixture();
  if (restriction === "sent") readonly.email.sent = true;
  readonly.structure.sections.push({ type: "text", title: "Second block" });
  const before = plain(readonly.structure);
  const emittedBefore = readonly.emitted.length;
  readonly.addSection("text", 0);
  readonly.deleteSection(0);
  readonly.moveDown(readonly.structure.sections[0]);
  readonly.moveUp(readonly.structure.sections[1]);
  readonly.addFooter();
  readonly.removeFooter();
  readonly.addHeader();
  readonly.removeHeader();
  readonly.addAction(readonly.structure.sections[0]);
  readonly.addProperty(readonly.structure.sections[0], "added", true);
  readonly.deleteProperty(readonly.structure.sections[0], "title");
  readonly.forceUpdateContent();
  assert.deepEqual(
    plain(readonly.structure),
    before,
    `${restriction} cannot mutate block data.`,
  );
  assert.equal(readonly.emitted.length, emittedBefore);
}
readAccess = writeAccess = true;

for (const change of ["none", "email", "access", "unmount"]) {
  const importing = fixture();
  const before = importing.emitted.length;
  const fileIndex = fileLoads.length;
  const importOperation = importing.loadFileTemplate({
    name: "template.smail",
  });
  const imported = structure();
  imported.sections[0].title = "Imported block";
  if (change === "email") importing.email = { ...savedEmail(), id: 99 };
  if (change === "access") writeAccess = false;
  if (change === "unmount") component.beforeUnmount.call(importing);
  fileLoads[fileIndex].resolve(imported);
  await importOperation;
  await flush();
  if (change === "none") {
    assert(
      importing.emitted
        .slice(before)
        .some(
          ([event, value]) =>
            event === "update:structure" && value === imported,
        ),
    );
  } else {
    assert.equal(
      importing.emitted.length,
      before,
      `${change} discards a late template import.`,
    );
  }
  writeAccess = true;
}

// The visible journey must keep optional timing and actual review state in order.
const sendFlow = sfc(
  "./flow/BEmailMarketingSendFlow.vue",
  "BEmailMarketingSendFlow.vue",
);
const flowDefinition = evaluate(
  compileScript(sendFlow.descriptor, {
    id: "email-send-flow-check",
    inlineTemplate: true,
  }).content,
  {
    vuetify: {
      useLocale: () => ({ isRtl: vue.ref(false) }),
      useTheme: () => ({ current: vue.ref({}) }),
    },
  },
).default;
for (const [props, expectedSteps, expectedStatus] of [
  [{ email: null }, ["draft", "review", "provider", "recipients"], null],
  [
    { email: { in_que: true, approve: "PENDING" } },
    ["draft", "review", "provider", "recipients"],
    "pending",
  ],
  [
    {
      email: { in_que: true, approve: "ACCEPT" },
      scheduleEnabled: true,
      scheduleAt: "2030-01-01T10:00:00Z",
    },
    ["draft", "review", "schedule", "provider", "recipients"],
    "accepted",
  ],
  [
    { email: { approve: "REJECT" } },
    ["draft", "review", "provider", "recipients"],
    "rejected",
  ],
  [
    { email: { sent: true, approve: "ACCEPT" } },
    ["draft", "review", "provider", "recipients"],
    "sent",
  ],
]) {
  const app = vue.createSSRApp(flowDefinition, props);
  app.config.warnHandler = () => {};
  app.config.globalProperties.$t = (key) => key;
  const html = await renderToString(app);
  assert.deepEqual(
    Array.from(html.matchAll(/data-flow-node="([^"]+)"/g), ([, step]) => step),
    expectedSteps,
  );
  if (expectedStatus)
    assert(html.includes(`email_builder.workspace.${expectedStatus}`));
  else assert(!html.includes('class="sd-modern-status__dot"'));
}

console.log(
  "Email editor: scoped SFCs, native blocks/options, guarded save/send/cancel, retry and resource lifetime checks passed.",
);
