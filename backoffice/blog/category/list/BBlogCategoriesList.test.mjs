import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { parse, compileScript, compileTemplate, compileStyle } from "@vue/compiler-sfc";
import ts from "typescript";

// Synthetic forms and SDK promises only; these checks never contact a shop.
const filename = fileURLToPath(new URL("./BBlogCategoriesList.vue", import.meta.url));
const { descriptor, errors } = parse(readFileSync(filename, "utf8"), { filename });
assert.deepEqual(errors, []);
const compiledScript = compileScript(descriptor, { id: "blog-categories-test" });
assert.deepEqual(compileTemplate({
  source: descriptor.template.content,
  filename,
  id: "blog-categories-test",
  compilerOptions: { bindingMetadata: compiledScript.bindings },
}).errors, []);
for (const style of descriptor.styles) {
  assert.deepEqual(compileStyle({
    source: style.content,
    filename,
    id: "blog-categories-test",
    scoped: style.scoped,
    preprocessLang: style.lang,
  }).errors, []);
}
const script = ts.transpileModule(descriptor.script.content, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const settle = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const category = (id = 12) => ({
  id, category: `Category ${id}`, description: `Description ${id}`,
  star: false, icon: null, articles: 3, visits: 21,
});

function fixture({ modern = true } = {}) {
  const requests = [], notices = [], ticks = [];
  let allowed = true, forceNext = false, validation = () => Promise.resolve({ valid: true });
  let validationCalls = 0, returnedFocus = 0, discardedImages = 0;
  let renderTick = () => Promise.resolve();
  const request = (method, args) => {
    const pending = deferred();
    requests.push({ method, args, forced: method === "list" && forceNext, ...pending });
    if (method === "list") forceNext = false;
    return pending.promise;
  };
  const categories = {
    optimize() { return this; },
    cancellation() { return this; },
    force() { forceNext = true; return this; },
    list(...args) { return request("list", args); },
    add(...args) { return request("add", args); },
    edit(...args) { return request("edit", args); },
    remove(...args) { return request("remove", args); },
  };
  const exports = {};
  vm.runInNewContext(script, {
    exports,
    require: (name) => {
      if (name.includes("NotificationService")) return { default: {
        showLaravelError: (error) => notices.push(["error", error]),
        showSuccessAlert: (...args) => notices.push(["success", ...args]),
      } };
      if (name.includes("utils/thread/threads")) return { default: { debounceSearch: (fn) => fn } };
      if (name.includes("ShopPermissions")) return { ShopPermissionRegions: { BLOG: { code: "BLOG" } } };
      return { default: {} };
    },
    document: { activeElement: { isConnected: true, focus: () => returnedFocus++ } },
    window: {
      $backoffice: { blog: { categories } },
      API: { POST_UPLOAD_SHOP_BLOG_CATEGORY_ICON: (shopId, categoryId) => `/synthetic/shops/${shopId}/categories/${categoryId}/icon` },
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(), modern, shop: { id: 7 },
    $t: (key) => key,
    writeShopAccess: () => allowed,
    $nextTick: (callback) => callback ? ticks.push(callback) : renderTick(),
    $refs: {
      editorForm: { validate: () => { validationCalls++; return validation(); } },
      coverUploader: {
        processPendingFile: () => request("upload", [state.coverServer, state.pending_image_id]),
        discardPendingFile: () => { discardedImages++; },
      },
    },
    $el: { querySelector: () => ({ focus: () => returnedFocus++ }) },
  };
  for (const [name, method] of Object.entries(component.methods)) state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed)) {
    Object.defineProperty(state, name, { get: () => getter.call(state) });
  }
  component.created.call(state);
  return {
    component, state, requests, notices,
    setAccess(value) { allowed = value; },
    setValidation(fn) { validation = fn; },
    setRenderTick(fn) { renderTick = fn; },
    validationCalls: () => validationCalls,
    discardedImages: () => discardedImages,
    returnedFocus: () => returnedFocus,
    flushOneTick() { ticks.shift()?.(); },
    flushTicks() { while (ticks.length) ticks.shift()(); },
  };
}
function open(f, selected = null) {
  f.state.showAddBlogCategoryDialog(selected);
  f.flushTicks();
}
function newDraft(f) {
  open(f);
  f.state.category = "Coffee";
  f.state.description = "Coffee guides";
}
function queueImage(f, id = "queued-cover") {
  const file = { id, filename: `${id}.png` };
  const handlers = f.state.coverHandlers;
  handlers.onAddFileStart(file);
  handlers.onAddFile({ error: null, file });
  return { file, handlers };
}

for (const phase of ["before-render", "before-open"]) {
  for (const change of ["shop", "unmount", "replacement"]) {
    const f = fixture();
    f.state.showAddBlogCategoryDialog(category(12));
    if (phase === "before-open") f.flushOneTick();
    if (change === "shop") {
      f.state.shop = { id: 8 };
      f.component.watch["shop.id"].call(f.state);
    } else if (change === "unmount") {
      f.component.beforeUnmount.call(f.state);
    } else {
      f.state.showAddBlogCategoryDialog(category(13));
    }
    f.flushOneTick();
    assert.equal(f.state.dialog_add, false,
      `A queued ${phase} callback cannot open after ${change}`);
    if (phase === "before-render") assert.equal(f.state.dialog_pre, false);
    f.flushTicks();
    if (change === "replacement") {
      assert.equal(f.state.dialog_add, true);
      assert.equal(f.state.selected.id, 13, "Only the current editor opens");
    } else {
      assert.equal(f.state.dialog_add, false);
    }
    if (change === "shop") {
      f.requests[0].resolve({ categories: [], total: 0 });
      await settle();
    }
  }
}

{
  const f = fixture();
  open(f);
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.star, true, "New categories retain the featured default");
  assert.equal(f.state.force_edit, false);
  assert.equal(f.state.category, "");
  f.state.category = "Coffee";
  f.state.description = "Coffee guides";
  f.state.totalItems = 11;
  const saving = f.state.addCategory();
  await settle();
  assert.equal(f.state.busy_set, true);
  assert.deepEqual(plain(f.requests[0].args), [7, { category: "Coffee", description: "Coffee guides", star: true }]);
  assert.equal(f.requests[0].method, "add");
  f.requests[0].resolve({ category: category() });
  await settle();
  assert.equal(f.requests[1].method, "list");
  assert.equal(f.requests[1].forced, true, "A mutation bypasses cached list totals");
  assert.equal(f.state.totalItems, 11, "POST can upsert a name, so do not increment totals locally");
  f.requests[1].resolve({ categories: [category()], total: 11 });
  await saving;
  assert.equal(f.state.totalItems, 11);
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.state.busy_set, false);
  assert.equal(f.notices[0][0], "success");
  f.state.restoreFocus();
  f.flushTicks();
  assert.equal(f.returnedFocus(), 1);
}

{
  const f = fixture();
  const selected = category();
  const before = plain(selected);
  open(f, selected);
  assert.equal(f.state.star, false, "Editing retains the saved featured state");
  assert.equal(f.state.force_edit, false);
  f.state.category = "A tampered locked name";
  f.state.description = "Updated description";
  const saving = f.state.addCategory();
  await settle();
  assert.equal(f.requests[0].method, "add", "Locked edits use the existing name-based POST upsert");
  assert.equal(f.requests[0].args[1].category, selected.category);
  assert.deepEqual(plain(selected), before, "Draft edits do not alter the table record before saving");
  f.requests[0].resolve({});
  await settle();
  f.requests[1].resolve({ categories: [{ ...selected, description: "Updated description" }], total: 1 });
  await saving;

  open(f, selected);
  f.state.toggleNameLock();
  f.state.category = "Renamed category";
  const renaming = f.state.addCategory();
  await settle();
  assert.equal(f.requests[2].method, "edit", "Only an unlocked rename uses PUT");
  assert.deepEqual(plain(f.requests[2].args), [7, 12, {
    category: "Renamed category", description: selected.description, star: false,
  }]);
  f.requests[2].reject(new Error("Rename failed"));
  await renaming;
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.category, "Renamed category");
  assert.equal(f.state.busy_set, false);
  f.state.toggleNameLock();
  assert.equal(f.state.force_edit, false);
  assert.equal(f.state.category, selected.category, "Relocking restores the saved path/name");
}

{
  const f = fixture();
  f.setAccess(false);
  open(f, category());
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.state.selected, null);
  f.state.dialog_add = true;
  f.state.category = "Coffee";
  f.state.description = "Description";
  await f.state.addCategory();
  f.state.deleteCategory(category());
  assert.equal(f.validationCalls(), 0);
  assert.equal(f.requests.length, 0, "Actions recheck current write access independently of their buttons");
  assert.equal(f.state.dialog_delete, false);
}

{
  const f = fixture();
  open(f);
  f.state.category = " ";
  f.state.description = "Description";
  await f.state.addCategory();
  assert.equal(f.validationCalls(), 0);
  f.state.category = "Coffee";
  f.setValidation(() => Promise.resolve({ valid: false }));
  await f.state.addCategory();
  assert.equal(f.requests.length, 0);
  assert.equal(f.state.dialog_add, true);

  const pending = deferred();
  f.setValidation(() => pending.promise);
  const saving = f.state.addCategory();
  f.setAccess(false);
  pending.resolve({ valid: true });
  await settle();
  assert.equal(f.requests.length, 0, "Revoked access during async validation cannot send a mutation");
  await saving;
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.category, "Coffee");
}

for (const changed of ["closed", "selection", "reopen", "reopen-new", "shop"]) {
  const f = fixture();
  const selected = changed === "reopen-new" ? null : category();
  open(f, selected);
  if (!selected) {
    f.state.category = "Old draft";
    f.state.description = "Old draft description";
  }
  const pending = deferred();
  f.setValidation(() => pending.promise);
  const saving = f.state.addCategory();
  if (changed === "closed") f.state.dialog_add = false;
  if (changed === "selection") open(f, category(13));
  if (changed === "reopen" || changed === "reopen-new") {
    f.state.dialog_add = false;
    // Reopen before the form ref changes; same selected reference (or null) is not sufficient.
    open(f, selected);
    if (!selected) {
      f.state.category = "Replacement draft";
      f.state.description = "Replacement draft description";
    }
  }
  if (changed === "shop") {
    f.state.shop = { id: 8 };
    f.component.watch["shop.id"].call(f.state);
  }
  pending.resolve({ valid: true });
  await settle();
  assert.equal(f.requests.filter(({ method }) => method !== "list").length, 0,
    `A changed ${changed} during validation invalidates the submit`);
  await saving;
  if (changed === "shop") {
    assert.equal(f.requests[0].args[0], 8);
    f.requests[0].resolve({ categories: [], total: 0 });
    await settle();
  }
}

{
  const f = fixture();
  open(f);
  f.state.category = "Coffee";
  f.state.description = "Draft description";
  const saving = f.state.addCategory();
  await settle();
  f.requests[0].reject(new Error("Create failed"));
  await saving;
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.category, "Coffee");
  assert.equal(f.state.description, "Draft description");
  assert.equal(f.state.star, true);
  assert.equal(f.state.busy_set, false);
  assert.equal(f.notices[0][0], "error");
}

{
  const f = fixture();
  f.state.delete_target = category();
  f.state.removeCategory();
  assert.equal(f.requests.length, 0, "Delete requires the local confirmation dialog");
  f.state.deleteCategory(f.state.delete_target);
  assert.equal(f.state.dialog_delete, true);
  f.setAccess(false);
  f.state.removeCategory();
  assert.equal(f.requests.length, 0, "Delete confirmation rechecks fresh write access");
  f.setAccess(true);
  f.state.page = 2;
  f.state.totalItems = 11;
  const deleting = f.state.removeCategory();
  assert.equal(f.state.busy_del, 12);
  assert.equal(f.requests[0].method, "remove");
  assert.deepEqual(plain(f.requests[0].args), [7, 12]);
  f.state.removeCategory();
  assert.equal(f.requests.length, 1, "A pending delete cannot be repeated");
  f.requests[0].resolve({});
  await settle();
  assert.equal(f.state.page, 1, "Deleting the last row of the final page returns to the preceding page");
  assert.equal(f.requests[1].forced, true);
  assert.equal(f.requests[1].args[1], 0);
  f.requests[1].resolve({ categories: [category(13)], total: 10 });
  await deleting;
  assert.equal(f.state.totalItems, 10);
  assert.equal(f.state.dialog_delete, false);
  assert.equal(f.state.busy_del, null);
}

{
  const f = fixture();
  const target = category();
  f.state.deleteCategory(target);
  const deleting = f.state.removeCategory();
  f.requests[0].reject(new Error("Delete failed"));
  await deleting;
  assert.equal(f.state.dialog_delete, true);
  assert.equal(f.state.delete_target, target);
  assert.equal(f.state.busy_del, null);
  assert.equal(f.notices[0][0], "error");
}

for (const [order, expected] of [["asc", false], ["desc", true], [false, false], [true, true]]) {
  const f = fixture();
  f.state.search = "Coffee";
  const loading = f.state.fetchCategories(3, "visits", order);
  assert.equal(f.state.busy_fetch, true);
  assert.deepEqual(plain(f.requests[0].args), [7, 20, 10, {
    search: "Coffee", sortBy: "visits", sortDesc: expected,
  }]);
  f.requests[0].resolve({ categories: [category()], total: 23 });
  await loading;
  assert.equal(f.state.totalItems, 23);
  assert.equal(f.state.pageCount, 3);
  assert.equal(f.state.busy_fetch, false);
}

{
  const f = fixture();
  f.state.page = 4;
  f.state.setSort("visits");
  assert.equal(f.state.page, 1);
  assert.deepEqual(plain(f.state.sortBy), [{ key: "visits", order: "desc" }]);
  f.state.setSort("visits");
  assert.equal(f.state.sortBy[0].order, "asc");
  f.state.page = 3;
  f.state.search = "New search";
  f.component.watch.search.call(f.state);
  assert.equal(f.state.page, 1);
  assert.equal(f.requests[0].args[1], 0);
  assert.equal(f.requests[0].args[3].sortDesc, false);
  f.requests[0].resolve({ categories: [], total: 0 });
  await settle();
  assert.equal(f.state.pageCount, 0);
}

{
  const f = fixture();
  f.state.categories = [category(1)];
  f.state.totalItems = 1;
  const old = f.state.refreshCategories();
  f.state.search = "Current";
  const current = f.state.refreshCategories();
  f.requests[0].resolve({ categories: [category(99)], total: 999 });
  await old;
  assert.deepEqual(plain(f.state.categories), [category(1)]);
  assert.equal(f.state.totalItems, 1);
  assert.equal(f.state.busy_fetch, true);
  f.requests[1].resolve({ categories: [category(2)], total: 22 });
  await current;
  assert.equal(f.state.totalItems, 22);
  assert.equal(f.state.busy_fetch, false);

  const staleFailure = f.state.refreshCategories();
  const latest = f.state.refreshCategories();
  f.requests[2].reject(new Error("Stale failure"));
  await staleFailure;
  assert.equal(f.notices.length, 0);
  assert.equal(f.state.fetch_error, false);
  f.requests[3].reject(new Error("Current failure"));
  await latest;
  assert.equal(f.notices[0][0], "error");
  assert.equal(f.state.fetch_error, true);
  assert.equal(f.state.busy_fetch, false);
  assert.deepEqual(plain(f.state.categories), [category(2)], "Reload failure retains last successful records");
}

{
  const f = fixture();
  open(f, category());
  const saving = f.state.addCategory();
  await settle();
  f.state.shop = { id: 8 };
  f.component.watch["shop.id"].call(f.state);
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.state.dialog_delete, false);
  assert.equal(f.state.selected, null);
  assert.equal(f.state.delete_target, null);
  assert.equal(f.state.totalItems, 0);
  assert.equal(f.requests[1].args[0], 8);
  f.requests[0].resolve({});
  await saving;
  assert.equal(f.requests.length, 2, "An old shop mutation cannot refresh or close a new shop's editor");
  assert.equal(f.notices.length, 0);
  f.requests[1].resolve({ categories: [category(8)], total: 1 });
  await settle();

  const pending = f.state.refreshCategories();
  f.component.beforeUnmount.call(f.state);
  f.requests[2].resolve({ categories: [category(99)], total: 99 });
  await pending;
  assert.deepEqual(plain(f.state.categories), [category(8)], "Unmounted lists ignore late responses");
}

for (const action of ["save", "delete"]) {
  for (const transition of ["unmount", "round-trip"]) {
    for (const outcome of ["success", "failure"]) {
      const f = fixture();
      let pending;
      if (action === "save") {
        open(f, category(12));
        pending = f.state.addCategory();
        await settle();
      } else {
        f.state.deleteCategory(category(12));
        pending = f.state.removeCategory();
      }
      const original = f.requests[0];
      let replacement;
      if (transition === "unmount") {
        f.component.beforeUnmount.call(f.state);
      } else {
        for (const id of [8, 7]) {
          f.state.shop = { id };
          f.component.watch["shop.id"].call(f.state);
        }
        if (action === "save") {
          open(f, category(13));
          replacement = f.state.addCategory();
          await settle();
        } else {
          f.state.deleteCategory(category(13));
          replacement = f.state.removeCategory();
        }
      }
      const count = f.requests.length;
      if (outcome === "success") original.resolve({});
      else original.reject(new Error("Old mutation failed"));
      await pending;
      assert.equal(f.requests.length, count,
        `A ${transition} ${action} completion cannot refetch a newer scope`);
      assert.equal(f.notices.length, 0,
        `A ${transition} ${action} completion cannot show an obsolete ${outcome} notice`);
      if (action === "save") {
        assert.equal(f.state.dialog_add, true);
        assert.equal(f.state.busy_set, true, "An old completion cannot clear the current save state");
        if (replacement) assert.equal(f.state.selected.id, 13);
      } else {
        assert.equal(f.state.dialog_delete, true);
        assert.equal(f.state.busy_del, replacement ? 13 : 12,
          "An old completion cannot clear the current delete state");
        if (replacement) assert.equal(f.state.delete_target.id, 13);
      }
      if (replacement) {
        f.requests[1].resolve({ categories: [], total: 0 });
        f.requests[2].resolve({ categories: [], total: 0 });
        f.requests[3].resolve({});
        await settle();
        assert.equal(f.requests[4].forced, true);
        f.requests[4].resolve({ categories: [category(13)], total: 1 });
        await replacement;
      }
    }
  }
}

{
  const f = fixture();
  f.state.deleteCategory(category(12));
  const deleting = f.state.removeCategory();
  open(f, category(13));
  f.requests[0].resolve({});
  await settle();
  assert.equal(f.requests[1].method, "list",
    "Opening another editor in the same shop must not invalidate a pending delete");
  f.requests[1].resolve({ categories: [category(13)], total: 1 });
  await deleting;
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.selected.id, 13);
  assert.equal(f.state.dialog_delete, false);
  assert.equal(f.state.busy_del, null);
}

{
  const f = fixture();
  const selected = category();
  open(f, selected);
  f.state.categories = [selected];
  f.state.busy_upload = true;
  f.state.updateCover("updated.jpg");
  assert.equal(f.state.busy_upload, false);
  assert.equal(selected.icon, "updated.jpg");
  f.setAccess(false);
  f.state.updateCover("forbidden.jpg");
  assert.equal(selected.icon, "updated.jpg");
  assert.deepEqual(plain(f.state.sortOptions.map(({ value }) => value)), ["category", "star", "visits", "articles"]);
  assert.deepEqual(plain(fixture({ modern: false }).state.sortBy), [], "Legacy callers retain their initial sorting");
}

{
  const f = fixture();
  open(f, category());
  f.state.toggleFeatured();
  assert.equal(f.state.star, true, "Keyboard activation enables featured when editing is allowed");
  f.state.toggleFeatured();
  assert.equal(f.state.star, false, "Keyboard activation can also disable featured");
  f.setAccess(false);
  f.state.toggleFeatured();
  assert.equal(f.state.star, false, "A focused control cannot toggle after write access is revoked");
  f.setAccess(true);
  f.state.busy_set = true;
  f.state.toggleFeatured();
  assert.equal(f.state.star, false, "A pending save prevents keyboard changes to featured");
  f.state.busy_set = false;
  f.state.toggleFeatured();
  assert.equal(f.state.star, true);
  assert.equal(f.requests.length, 0, "Featured activation only changes the local draft");
}

{
  const f = fixture();
  newDraft(f);
  assert.equal(f.state.coverServer, undefined, "An unsaved category has no upload endpoint");
  assert.equal(f.state.image_state, "empty");
  assert.equal(f.state.canSave, true, "The image is optional");
  const handlers = f.state.coverHandlers;
  const first = { id: "first", filename: "first.png" };
  handlers.onAddFileStart(first);
  assert.equal(f.state.pending_image_id, "first");
  assert.equal(f.state.image_state, "loading");
  assert.equal(f.state.canSave, false, "Save waits for local file validation");
  handlers.onAddFile({ error: new Error("Invalid image"), file: first });
  assert.equal(f.state.image_state, "invalid");
  assert.equal(f.state.canSave, false);
  await f.state.addCategory();
  assert.equal(f.requests.length, 0, "An invalid image cannot create a category");
  const second = { id: "second", filename: "second.png" };
  handlers.onAddFileStart(second);
  handlers.onAddFile({ error: null, file: second });
  handlers.onAddFile({ error: new Error("Old validation"), file: first });
  handlers.onRemoveFile({ error: null, file: first });
  assert.equal(f.state.pending_image_id, "second");
  assert.equal(f.state.image_state, "ready", "An older file cannot change the current selection");
  assert.equal(f.state.canSave, true);
  handlers.onRemoveFile({ error: new Error("Remove failed"), file: second });
  assert.equal(f.state.pending_image_id, "second");
  assert.equal(f.state.image_state, "ready", "Failed removal retains the file that is still queued");
  handlers.onRemoveFile({ error: null, file: second });
  assert.equal(f.state.pending_image_id, null);
  assert.equal(f.state.image_state, "empty");
  assert.equal(f.state.canSave, true);
  f.state.closeEditor();
  assert.equal(f.requests.length, 0, "Selecting, removing and cancelling never send a request");
}

{
  const f = fixture();
  newDraft(f);
  queueImage(f);
  f.state.totalItems = 11;
  const saving = f.state.addCategory();
  await settle();
  assert.deepEqual(f.requests.map(({ method }) => method), ["add"]);
  assert.equal(f.state.saved_category, null);
  const saved = category(88);
  f.requests[0].resolve({ category: saved });
  await settle();
  assert.equal(f.state.selected, null, "The new record does not become an existing edit target");
  assert.equal(f.state.saved_category, saved);
  assert.deepEqual(f.requests[1].args, ["/synthetic/shops/7/categories/88/icon", "queued-cover"]);
  assert.equal(f.state.busy_upload, true);
  const star = f.state.star;
  f.state.toggleFeatured();
  assert.equal(f.state.star, star, "Saved metadata stays fixed while its optional image is pending");
  f.requests[1].resolve({ path: "covers/coffee.png" });
  await settle();
  assert.deepEqual(f.requests.map(({ method }) => method), ["add", "upload", "list"]);
  assert.equal(saved.icon, "covers/coffee.png");
  assert.equal(f.requests[2].forced, true);
  assert.equal(f.state.totalItems, 11, "An upsert never invents a new server total");
  f.requests[2].resolve({ categories: [saved], total: 11 });
  await saving;
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.state.busy_upload, false);
  assert.equal(f.state.busy_set, false);
  assert.equal(f.state.categories[0].icon, "covers/coffee.png");
  assert.equal(f.notices.filter(([kind]) => kind === "success").length, 1);
}

for (const finish of ["retry", "remove"]) {
  const f = fixture();
  newDraft(f);
  const { file, handlers } = queueImage(f);
  const saving = f.state.addCategory();
  await settle();
  const saved = category(88);
  f.requests[0].resolve({ category: saved });
  await settle();
  f.requests[1].reject(new Error("Image upload failed"));
  await saving;
  assert.equal(f.state.saved_category, saved);
  assert.equal(f.state.selected, null);
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.image_state, "ready");
  assert.equal(f.state.pending_image_id, file.id);
  assert.equal(f.state.canSave, true);
  assert.equal(f.notices.length, 0, "The existing FilePond error and saved-state notice avoid a duplicate error notification");
  assert.equal(f.requests[2].method, "list");
  assert.equal(f.requests[2].forced, true, "A partial save refreshes real server data");
  f.requests[2].resolve({ categories: [saved], total: 11 });
  await settle();
  if (finish === "remove") handlers.onRemoveFile({ error: null, file });
  const finishing = f.state.addCategory();
  await settle();
  assert.equal(f.validationCalls(), 1, "Image recovery does not resubmit saved metadata");
  if (finish === "retry") {
    assert.equal(f.requests[3].method, "upload");
    assert.equal(f.requests[3].args[0], "/synthetic/shops/7/categories/88/icon");
    f.requests[3].resolve({ path: "covers/retried.png" });
    await settle();
  }
  const refreshed = f.requests.at(-1);
  assert.equal(refreshed.method, "list");
  assert.equal(refreshed.forced, true);
  refreshed.resolve({ categories: [saved], total: 11 });
  await finishing;
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.requests.filter(({ method }) => method === "add").length, 1);
  assert.equal(f.requests.filter(({ method }) => method === "upload").length, finish === "retry" ? 2 : 1);
  assert.equal(f.requests.some(({ method }) => method === "remove"), false,
    "Image failure never deletes a record that POST may have upserted");
}

{
  const f = fixture();
  newDraft(f);
  queueImage(f);
  const saving = f.state.addCategory();
  await settle();
  f.requests[0].reject(new Error("Category create failed"));
  await saving;
  assert.deepEqual(f.requests.map(({ method }) => method), ["add"]);
  assert.equal(f.state.saved_category, null);
  assert.equal(f.state.coverServer, undefined);
  assert.equal(f.state.pending_image_id, "queued-cover");
  assert.equal(f.state.image_state, "ready");
  assert.equal(f.state.dialog_add, true);
}

for (const change of ["reopen", "shop"]) {
  const f = fixture();
  newDraft(f);
  const old = queueImage(f, "old-file");
  if (change === "shop") {
    f.state.shop = { id: 8 };
    f.component.watch["shop.id"].call(f.state);
  } else {
    f.state.closeEditor();
  }
  newDraft(f);
  queueImage(f, "current-file");
  old.handlers.onAddFileStart(old.file);
  old.handlers.onAddFile({ error: new Error("Stale validation"), file: old.file });
  old.handlers.onRemoveFile({ error: null, file: old.file });
  assert.equal(f.state.pending_image_id, "current-file");
  assert.equal(f.state.image_state, "ready", `Old file callbacks cannot change a ${change} draft`);
  if (change === "shop") {
    assert.equal(f.state.saved_category, null);
    f.requests[0].resolve({ categories: [], total: 0 });
    await settle();
  }
  assert.equal(f.requests.some(({ method }) => method !== "list"), false);
}

for (const outcome of ["success", "failure"]) {
  const f = fixture();
  newDraft(f);
  queueImage(f);
  const saving = f.state.addCategory();
  await settle();
  const saved = category(88);
  f.requests[0].resolve({ category: saved });
  await settle();
  const version = f.state.editor_version;
  f.state.closeEditor();
  assert.equal(f.state.editor_version, version + 1);
  assert.equal(f.discardedImages(), 1, "Closing an in-flight image discards/cancels the local uploader queue");
  assert.equal(f.state.saved_category, saved, "Close leaves the already saved category in place");
  assert.equal(f.state.dialog_add, false);
  assert.equal(f.state.busy_upload, false);
  assert.equal(f.requests[2].forced, true);
  newDraft(f);
  queueImage(f, "replacement");
  if (outcome === "success") f.requests[1].resolve({ path: "stale.png" });
  else f.requests[1].reject(new Error("Cancelled old upload"));
  await saving;
  assert.equal(f.state.dialog_add, true);
  assert.equal(f.state.saved_category, null);
  assert.equal(f.state.pending_image_id, "replacement");
  assert.equal(saved.icon, null, "A stale image completion cannot mutate its former saved target");
  assert.equal(f.requests.length, 3, "A closed upload cannot start another list request");
  assert.equal(f.notices.length, 0, "A closed upload cannot announce stale success or failure");
  f.requests[2].resolve({ categories: [saved], total: 1 });
  await settle();
}

for (const change of ["access", "close", "shop", "unmount"]) {
  const f = fixture();
  newDraft(f);
  queueImage(f);
  const tick = deferred();
  f.setRenderTick(() => tick.promise);
  const saving = f.state.addCategory();
  await settle();
  const saved = category(88);
  f.requests[0].resolve({ category: saved });
  await settle();
  assert.equal(f.state.saved_category, saved);
  assert.equal(f.state.busy_upload, true);
  assert.equal(f.requests.length, 1, "Upload waits for the endpoint's rendered category ID");
  if (change === "access") f.setAccess(false);
  if (change === "close") f.state.closeEditor();
  if (change === "shop") {
    f.state.shop = { id: 8 };
    f.component.watch["shop.id"].call(f.state);
  }
  if (change === "unmount") f.component.beforeUnmount.call(f.state);
  tick.resolve();
  await saving;
  assert.equal(f.requests.some(({ method }) => method === "upload"), false,
    `${change} during the render tick prevents the next protected upload`);
  assert.equal(f.requests.filter(({ method }) => method === "add").length, 1);
  assert.equal(f.notices.length, 0);
  if (change === "access") {
    assert.equal(f.state.saved_category, saved);
    assert.equal(f.state.dialog_add, true);
    assert.equal(f.state.busy_set, false);
    assert.equal(f.state.busy_upload, false);
    assert.equal(f.state.canSave, false);
  }
  for (const request of f.requests.filter(({ method }) => method === "list")) {
    request.resolve({ categories: [], total: 0 });
  }
  await settle();
}

for (const change of ["shop", "unmount"]) {
  for (const outcome of ["success", "failure"]) {
    const f = fixture();
    newDraft(f);
    queueImage(f);
    const saving = f.state.addCategory();
    await settle();
    const saved = category(88);
    f.requests[0].resolve({ category: saved });
    await settle();
    assert.equal(f.requests[1].method, "upload");
    if (change === "shop") {
      f.state.shop = { id: 8 };
      f.component.watch["shop.id"].call(f.state);
      newDraft(f);
      queueImage(f, "new-shop-file");
    } else {
      f.component.beforeUnmount.call(f.state);
    }
    const count = f.requests.length;
    if (outcome === "success") f.requests[1].resolve({ path: "old-scope.png" });
    else f.requests[1].reject(new Error("Old scope upload failed"));
    await saving;
    assert.equal(f.requests.length, count, `A ${change} upload completion cannot refresh another scope`);
    assert.equal(f.notices.length, 0);
    assert.equal(saved.icon, null);
    if (change === "shop") {
      assert.equal(f.state.saved_category, null);
      assert.equal(f.state.pending_image_id, "new-shop-file");
      assert.equal(f.state.busy_upload, false);
      f.requests[2].resolve({ categories: [], total: 0 });
      await settle();
    }
  }
}

{
  const f = fixture();
  newDraft(f);
  queueImage(f);
  const valid = deferred();
  f.setValidation(() => valid.promise);
  const saving = f.state.addCategory();
  f.setAccess(false);
  valid.resolve({ valid: true });
  await saving;
  assert.equal(f.requests.length, 0, "Permission revocation during validation prevents both stages");
  assert.equal(f.state.image_state, "ready");
  assert.equal(f.state.saved_category, null);
}

{
  const f = fixture();
  const selected = category(12);
  open(f, selected);
  f.state.categories = [selected];
  assert.equal(f.state.coverServer, "/synthetic/shops/7/categories/12/icon");
  const handlers = f.state.coverHandlers;
  const file = { id: "existing-cover" };
  handlers.onAddFileStart(file);
  handlers.onAddFile({ error: null, file });
  handlers.onRemoveFile({ error: null, file });
  assert.equal(f.state.image_state, "empty", "Existing edits retain their immediate uploader flow");
  assert.equal(f.state.saved_category, null);
  handlers.onProcessFileStart();
  assert.equal(f.state.busy_upload, true);
  handlers["new-path"]("covers/existing.png");
  assert.equal(selected.icon, "covers/existing.png");
  assert.equal(f.state.busy_upload, false);
  f.state.closeEditor();
  open(f, category(13));
  handlers["new-path"]("covers/stale.png");
  handlers.onProcessFileStart();
  assert.equal(selected.icon, "covers/existing.png");
  assert.equal(f.state.busy_upload, false, "A stale existing-cover callback cannot affect a new editor");
}

console.log("BBlogCategoriesList: compilation and isolated CRUD, optional image ordering/retry/cancel, access/render/validation races, server totals, query and stale-response checks passed.");
