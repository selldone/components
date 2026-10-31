import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import {
  parse,
  compileScript,
  compileTemplate,
  compileStyleAsync,
} from "@vue/compiler-sfc";

const filename = new URL("./BMapTagsList.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), {
  filename: filename.pathname,
});
assert.deepEqual(errors, []);
const script = compileScript(descriptor, { id: "map-tags-list-test" });
assert.deepEqual(
  compileTemplate({
    source: descriptor.template.content,
    filename: filename.pathname,
    id: "map-tags-list-test",
    compilerOptions: { bindingMetadata: script.bindings },
  }).errors,
  [],
);
for (const style of descriptor.styles)
  assert.deepEqual(
    (
      await compileStyleAsync({
        source: style.content,
        filename: filename.pathname,
        id: "map-tags-list-test",
        scoped: style.scoped,
        preprocessLang: style.lang,
      })
    ).errors,
    [],
  );

const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
function fixture() {
  const requests = [],
    notifications = [],
    throttles = [];
  const result = ts.transpileModule(descriptor.script.content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    reportDiagnostics: true,
  });
  assert.deepEqual(result.diagnostics, []);
  const exports = {};
  vm.runInNewContext(result.outputText, {
    exports,
    require: (name) => {
      if (name.includes("NotificationService"))
        return {
          default: { showLaravelError: (error) => notifications.push(error) },
        };
      if (name.includes("BusinessModel"))
        return { BusinessModel: { MARKETPLACE: { code: "MARKETPLACE" } } };
      if (name.includes("ShopPermissions"))
        return { ShopPermissionRegions: { CHANNELS: { code: "CHANNELS" } } };
      if (name === "lodash-es")
        return {
          throttle: (callback) => {
            const task = { callback, queued: false, cancelled: false };
            throttles.push(task);
            const run = () => {
              task.queued = true;
            };
            run.cancel = () => {
              task.cancelled = true;
              task.queued = false;
            };
            return run;
          },
        };
      return { default: {} };
    },
    window: {
      SERACH_THROTTLE: 250,
      API: { GET_SHOP_MAP_TAGS: (id) => "/shops/" + id + "/map-tags" },
    },
    axios: {
      get: (url, options) =>
        new Promise((resolve, reject) =>
          requests.push({ url, options, resolve, reject }),
        ),
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    shop: { id: 1, model: "SHOP" },
    scopeShopId: 1,
    canWrite: true,
    $t: (key) => key,
    $n: (value) => String(value),
    writeShopAccess: () => state.canWrite,
  };
  for (const [name, fn] of Object.entries(component.methods))
    state[name] = fn.bind(state);
  for (const [name, get] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: () => get.call(state) });
  component.created.call(state);
  const queryChanged = () => component.watch.requestKey.handler.call(state);
  const setSearch = (value) => {
    state.search = value;
    component.watch.search.call(state);
  };
  const flush = () => {
    for (const task of throttles)
      if (task.queued) {
        task.queued = false;
        task.callback();
      }
  };
  return {
    state,
    component,
    requests,
    notifications,
    throttles,
    queryChanged,
    setSearch,
    flush,
  };
}
const response = (map_tags = [], total = map_tags.length) => ({
  data: { map_tags, total },
});

test("native fields, supported sorts and marketplace-only vendor counts remain available", () => {
  const f = fixture();
  assert.deepEqual(
    plain(f.state.headers.map(({ key, sortable }) => [key, sortable])),
    [
      ["lat", true],
      ["tags", true],
      ["products_count", false],
      ["range", true],
      ["user_id", true],
      ["actions", false],
    ],
  );
  f.state.shop.model = "MARKETPLACE";
  assert.equal(
    f.state.headers.find((x) => x.key === "vendors_count").sortable,
    false,
  );
});

test("the existing server query retains pagination, search and native sort arguments", async () => {
  const f = fixture();
  f.state.page = 3;
  f.state.appliedSearch = "gallery";
  f.state.sortBy = [{ key: "range", order: "desc" }];
  const run = f.state.fetchLocations();
  assert.equal(f.requests[0].url, "/shops/1/map-tags");
  assert.deepEqual(plain(f.requests[0].options.params), {
    search: "gallery",
    offset: 20,
    limit: 10,
    sortBy: "range",
    sortDesc: true,
  });
  f.requests[0].resolve(response([{ id: 4 }], 24));
  await run;
  assert.equal(f.state.totalItems, 24);
  assert.equal(f.state.map_tags[0].id, 4);
  assert.equal(f.state.busy_fetch, false);
});

test("new search input invalidates an old response and applies from page one after throttling", async () => {
  const f = fixture();
  f.state.page = 3;
  const old = f.state.fetchLocations();
  f.setSearch("  art  ");
  f.requests[0].resolve(response([{ id: 99 }], 28));
  await old;
  assert.deepEqual(plain(f.state.map_tags), []);
  assert.equal(f.state.busy_fetch, true);
  f.flush();
  assert.equal(f.state.page, 1);
  assert.equal(f.state.appliedSearch, "  art  ");
  f.queryChanged();
  assert.equal(f.requests[1].options.params.offset, 0);
  assert.equal(f.requests[1].options.params.search, "  art  ");
  f.requests[1].resolve(response([{ id: 2 }], 1));
  await settle();
  assert.equal(f.state.map_tags[0].id, 2);
});

test("late successes and failures cannot replace the current query or its error state", async () => {
  const f = fixture();
  const old = f.state.fetchLocations();
  f.state.appliedSearch = "new";
  const current = f.state.fetchLocations();
  f.requests[0].reject(new Error("Old failure"));
  await old;
  assert.equal(f.state.load_failed, false);
  assert.equal(f.notifications.length, 0);
  f.requests[1].resolve(response([{ id: 2 }]));
  await current;
  assert.equal(f.state.map_tags[0].id, 2);
});

test("shop changes clear local selection, filters and records before the new scoped read", async () => {
  const f = fixture();
  f.state.scopeShopId = 1;
  const old = f.state.fetchLocations();
  f.state.map_tags = [{ id: 9 }];
  f.state.dialog = true;
  f.state.dialogShopId = 1;
  f.state.current_item = { id: 9 };
  f.state.page = 3;
  f.state.appliedSearch = "old shop";
  f.state.search = "old shop";
  f.state.shop = { id: 2, model: "SHOP" };
  f.queryChanged();
  assert.equal(f.state.dialog, false);
  assert.equal(f.state.dialogShopId, null);
  assert.deepEqual(plain(f.state.current_item), {});
  assert.deepEqual(plain(f.state.map_tags), []);
  assert.equal(f.state.search, "");
  assert.equal(f.state.appliedSearch, "");
  assert.equal(f.state.page, 1);
  assert.equal(f.requests[1].url, "/shops/2/map-tags");
  assert.equal(f.requests[1].options.params.offset, 0);
  f.requests[0].resolve(response([{ id: 99 }], 99));
  await old;
  assert.equal(f.state.totalItems, 0);
  f.requests[1].resolve(response([{ id: 3 }], 1));
  await settle();
  assert.equal(f.state.map_tags[0].id, 3);
  assert.equal(f.state.busy_fetch, false);
});

test("malformed/error responses show a recoverable error and retry clears it", async () => {
  const f = fixture();
  const malformed = f.state.fetchLocations();
  f.requests[0].resolve({ data: { map_tags: "bad", total: null } });
  await malformed;
  assert.equal(f.state.load_failed, true);
  assert.equal(f.state.busy_fetch, false);
  assert.equal(f.notifications.length, 1);
  const retry = f.state.fetchLocations();
  assert.equal(f.state.load_failed, false);
  f.requests[1].resolve(response());
  await retry;
  assert.equal(f.state.load_failed, false);
  assert.equal(f.state.totalItems, 0);
  assert.equal(f.state.pageCount, 1);
});

test("add needs write access while a real current row remains inspectable without it", () => {
  const f = fixture();
  f.state.canWrite = false;
  f.state.showAdd();
  assert.equal(f.state.dialog, false);
  f.state.showEdit({ id: 8 });
  assert.equal(f.state.dialog, false);
  f.state.map_tags = [{ id: 8 }];
  f.state.showEdit(f.state.map_tags[0]);
  assert.equal(f.state.dialog, true);
  assert.equal(f.state.dialogShopId, 1);
});

test("saved events preserve totals without duplicates and reject stale-shop events", () => {
  const f = fixture();
  let refreshes = 0;
  f.state.fetchLocations = () => refreshes++;
  f.state.dialogShopId = 1;
  f.state.totalItems = 1;
  f.state.map_tags = [{ id: 1 }];
  f.state.onAdded({ id: 2, title: "New" });
  f.state.onAdded({ id: 2, title: "Updated" });
  assert.equal(f.state.totalItems, 2);
  assert.equal(f.state.map_tags.length, 2);
  assert.equal(f.state.map_tags[0].title, "Updated");
  f.state.onEdited({ id: 2, title: "Edited" });
  assert.equal(f.state.map_tags[0].title, "Edited");
  f.state.shop.id = 2;
  f.state.onAdded({ id: 3 });
  f.state.onEdited({ id: 2, title: "Stale" });
  assert.equal(f.state.totalItems, 2);
  assert.equal(f.state.map_tags[0].title, "Edited");
  assert.equal(refreshes, 3);
});

test("deletion clamps the final page and ignores a duplicate or mismatched event", () => {
  const f = fixture();
  let refreshes = 0;
  f.state.fetchLocations = () => refreshes++;
  f.state.dialogShopId = 1;
  f.state.current_item = { id: 21 };
  f.state.map_tags = [{ id: 21 }];
  f.state.totalItems = 21;
  f.state.page = 3;
  f.state.onDeleted(20);
  assert.equal(f.state.totalItems, 21);
  f.state.onDeleted(21);
  assert.equal(f.state.totalItems, 20);
  assert.equal(f.state.page, 2);
  assert.equal(f.state.dialog, false);
  f.state.onDeleted(21);
  assert.equal(f.state.totalItems, 20);
  assert.equal(refreshes, 0);
  f.queryChanged();
  assert.equal(refreshes, 1);
});

test("unmount cancels throttled work and blocks in-flight updates", async () => {
  const f = fixture();
  const pending = f.state.fetchLocations();
  f.setSearch("new");
  f.component.beforeUnmount.call(f.state);
  assert.equal(f.throttles[0].cancelled, true);
  f.requests[0].resolve(response([{ id: 5 }], 5));
  await pending;
  assert.deepEqual(plain(f.state.map_tags), []);
  assert.equal(f.state.totalItems, 0);
});
