import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { compileStyleAsync, compileTemplate, parse } from "@vue/compiler-sfc";
import * as Vue from "vue";
import ts from "typescript";

const file = new URL("./BClusterAdd.vue", import.meta.url);
const { descriptor, errors } = parse(readFileSync(file, "utf8"));
const template = compileTemplate({
  source: descriptor.template.content,
  filename: file.pathname,
  id: "cluster-add-test",
});
const transpile = (source) =>
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
const plain = (value) => JSON.parse(JSON.stringify(value));
const cluster = () => ({
  id: 8,
  name: "Staff Recommendations",
  description: "Original description",
  color: "#5533AA80",
  parent_id: 7,
  icon: "old-icon",
});
const walk = (node) =>
  Array.isArray(node)
    ? node.flatMap(walk)
    : [
        node,
        ...walk(
          node?.children?.default?.() ||
            (Array.isArray(node?.children) ? node.children : []),
        ),
      ];

function fixture(record = null) {
  const requests = [],
    events = [],
    notices = [],
    confirmations = [];
  const exports = {};
  let nextId = 0;
  const api = {
    POST_SHOP_CLUSTERS_ADD: (shop) => `/shops/${shop}/clusters`,
    PUT_SHOP_CLUSTERS_EDIT: (shop, id) => `/shops/${shop}/clusters/${id}`,
    DELETE_SHOP_CLUSTER: (shop, id) => `/shops/${shop}/clusters/${id}`,
    POST_SHOP_CLUSTER_UPLOAD_ICON: (shop, id) =>
      `/shops/${shop}/clusters/${id}/icon`,
  };
  vm.runInNewContext(transpile(descriptor.script.content), {
    exports,
    window: { API: api },
    FormData: class {
      fields = [];
      append(name, value) {
        this.fields.push([
          name,
          typeof value === "object" ? value : String(value),
        ]);
      }
    },
    axios: Object.fromEntries(
      ["post", "put", "delete"].map((method) => [
        method,
        (url, data, config) =>
          new Promise((resolve, reject) =>
            requests.push({
              method,
              url,
              data,
              config,
              resolve: (body) => resolve({ data: body }),
              reject,
            }),
          ),
      ]),
    ),
    require(name) {
      if (name === "vue") return { useId: () => `cluster-field-${++nextId}` };
      if (name.includes("ShopPermissions"))
        return {
          ShopPermissionRegions: { CATEGORIES: { code: "categories" } },
        };
      if (name.includes("NotificationService"))
        return {
          default: {
            showSuccessAlert: (...args) => notices.push(["success", ...args]),
            showErrorAlert: (...args) => notices.push(["api", ...args]),
            showLaravelError: (error) => notices.push(["network", error]),
            openDangerAlert: (...args) => confirmations.push(args),
          },
        };
      return { default: {} };
    },
  });
  const component = exports.default;
  const state = {
    ...component.data(),
    ...component.setup(),
    cluster: record,
    shop: { id: 42 },
    allowed: true,
    writeShopAccess(region) {
      return this.allowed && region === "categories";
    },
    $t: (key) => key,
    $tm: () => ["Digital Resources"],
    $n: String,
    $emit: (...args) => events.push(args),
    getShopImagePath: (path) => `image:${path}`,
    window: { API: api },
    resetToDefault() {
      Object.assign(this, component.data());
    },
  };
  for (const [name, method] of Object.entries(component.methods))
    state[name] = method.bind(state);
  for (const [name, getter] of Object.entries(component.computed))
    Object.defineProperty(state, name, { get: getter.bind(state) });
  component.created.call(state);
  const renderExports = {};
  vm.runInNewContext(transpile(template.code), {
    exports: renderExports,
    require: () => ({
      ...Vue,
      resolveComponent: (name) => ({ name }),
      withDirectives: (node) => node,
    }),
  });
  const render = () => walk(renderExports.render(state, []));
  return { state, component, requests, events, notices, confirmations, render };
}

function verifyDelete(state) {
  state.tab = "delete";
  state.delete_expanded = true;
  state.setDeleteVerified(true);
}

test("cluster editor template and scoped styles compile", async () => {
  assert.deepEqual(errors, []);
  assert.deepEqual(template.errors, []);
  for (const style of descriptor.styles) {
    const result = await compileStyleAsync({
      source: style.content,
      filename: file.pathname,
      id: "data-v-cluster-add-test",
      scoped: style.scoped,
      preprocessLang: style.lang,
    });
    assert.deepEqual(result.errors, []);
  }
});

test("creation retains multipart metadata and optional photo, emits the saved result and closes", async () => {
  const { state, requests, events } = fixture();
  const photo = { name: "cluster.png", type: "image/png" };
  Object.assign(state, {
    name: "New cluster",
    description: "Resources",
    color: "#5533AA80",
    parent_id: 7,
    selected_file: photo,
  });
  const pending = state.addCluster();
  assert.equal(state.busy, true);
  assert.equal(requests[0].method, "post");
  assert.equal(requests[0].url, "/shops/42/clusters");
  assert.deepEqual(requests[0].data.fields, [
    ["photo", photo],
    ["name", "New cluster"],
    ["description", "Resources"],
    ["parent_id", "7"],
    ["color", "#5533AA80"],
  ]);
  assert.equal(
    requests[0].config.headers["Content-Type"],
    "multipart/form-data",
  );
  state.addCluster();
  assert.equal(requests.length, 1, "a pending create cannot submit twice");
  const saved = { id: 9, name: "New cluster" };
  requests[0].resolve({ cluster: saved });
  await pending;
  assert.deepEqual(events, [["add", saved], ["back"]]);
  assert.equal(state.busy, false);
});

test("editing preserves nullable metadata and keeps image upload separate from Save", async () => {
  const { state, requests, events } = fixture(cluster());
  Object.assign(state, { description: "", parent_id: null, color: null });
  state.handleProcessFile("new-icon");
  assert.equal(state.icon, "new-icon");
  assert.equal(state.cluster.icon, "new-icon");
  assert.equal(requests.length, 0);
  const pending = state.editCluster();
  assert.equal(requests[0].method, "put");
  assert.equal(requests[0].url, "/shops/42/clusters/8");
  assert.deepEqual(plain(requests[0].data), {
    name: "Staff Recommendations",
    description: "",
    color: null,
    parent_id: null,
  });
  const saved = { ...state.cluster, color: null, parent_id: null };
  requests[0].resolve({ cluster: saved });
  await pending;
  assert.deepEqual(events, [["edit", saved], ["back"]]);
});

test("API and network Save failures retain the draft and can be retried", async () => {
  for (const edit of [false, true])
    for (const kind of ["api", "network"]) {
      const { state, requests, events, notices } = fixture(
        edit ? cluster() : null,
      );
      Object.assign(state, {
        name: "Keep this draft",
        description: "Unsaved description",
      });
      const save = () => (edit ? state.editCluster() : state.addCluster());
      const pending = save();
      if (kind === "api")
        requests[0].resolve({ error: true, error_msg: "Invalid parent" });
      else requests[0].reject(new Error("Unavailable"));
      await pending;
      assert.equal(state.name, "Keep this draft");
      assert.equal(state.description, "Unsaved description");
      assert.equal(state.save_error, true);
      assert.equal(state.busy, false);
      assert.equal(events.length, 0);
      assert.equal(notices[0][0], kind);
      const retry = save();
      assert.equal(state.save_error, false);
      requests[1].resolve({ cluster: { id: 8 } });
      await retry;
      assert.equal(events.at(-1)[0], "back");
    }
});

test("direct Save calls respect current access, active section, busy state and field limits", () => {
  const cases = [
    { allowed: false },
    { busy: true },
    { busy_delete: true },
    { tab: "delete" },
    { name: "  " },
    { name: "x".repeat(129) },
    { description: "x".repeat(257) },
  ];
  for (const edit of [false, true])
    for (const values of cases) {
      const { state, requests } = fixture(edit ? cluster() : null);
      Object.assign(state, { name: "Valid name" }, values);
      state.addCluster();
      state.editCluster();
      assert.equal(requests.length, 0, JSON.stringify(values));
    }
});

test("field limits count Unicode characters without rejecting valid emoji names", () => {
  const { state } = fixture(cluster());
  Object.assign(state, {
    name: "🎁".repeat(128),
    description: "🌿".repeat(256),
  });
  assert.equal(state.can_save, true);
  state.name += "🎁";
  assert.equal(state.can_save, false);
  state.name = "Valid name";
  state.description += "🌿";
  assert.equal(state.can_save, false);
});

test("rendered controls retain native parent, nullable alpha picker and immediate image uploader", () => {
  const { state, render } = fixture(cluster());
  const find = (nodes, name) => nodes.find((node) => node?.type?.name === name);
  let nodes = render();
  const color = find(nodes, "u-color-selector");
  assert.ok(Object.hasOwn(color.props, "nullable"));
  assert.notEqual(color.props.noAlpha, true);
  const parent = find(nodes, "b-cluster-input");
  assert.ok(Object.hasOwn(parent.props, "clearable"));
  assert.equal(parent.props["return-object"], false);
  const uploader = find(nodes, "s-image-uploader");
  assert.ok(Object.hasOwn(uploader.props, "auto-compact"));
  assert.ok(Object.hasOwn(uploader.props, "modern"));
  assert.equal(uploader.props["max-file-size"], "2MB");
  assert.equal(uploader.props.server, "/shops/42/clusters/8/icon");
  uploader.props.onNewPath("render-icon");
  assert.equal(state.icon, "render-icon");
  assert.equal(state.cluster.icon, "render-icon");
  state.allowed = false;
  nodes = render();
  assert.equal(
    find(nodes, "u-color-selector"),
    undefined,
    "access loss unmounts the teleported picker",
  );
  assert.equal(find(nodes, "b-cluster-input").props.disabled, true);
  assert.equal(find(nodes, "s-image-uploader").props.disabled, true);
  assert.equal(
    nodes.find((node) => node.type === "fieldset").props.disabled,
    true,
  );
});

test("Delete requires the active disclosure, verification, current access and native final confirmation", async () => {
  const { state, requests, events, confirmations } = fixture(cluster());
  state.setDeleteVerified(true);
  assert.equal(state.accept_delete, false);
  state.deleteClusterDialog();
  state.deleteCluster(state.cluster);
  assert.equal(requests.length, 0);
  assert.equal(confirmations.length, 0);
  verifyDelete(state);
  state.deleteCluster({ id: 9 });
  assert.equal(requests.length, 0);
  state.deleteClusterDialog();
  assert.equal(confirmations.length, 1);
  assert.equal(requests.length, 0);
  const callback = confirmations[0][3];
  callback();
  assert.equal(requests[0].method, "delete");
  assert.equal(requests[0].url, "/shops/42/clusters/8");
  assert.equal(state.busy_delete, true);
  callback();
  assert.equal(requests.length, 1);
  requests[0].resolve({ success: true });
  await new Promise(setImmediate);
  assert.equal(state.busy_delete, false);
  assert.deepEqual(events, [["delete", 8], ["back"]]);
});

test("a stale final confirmation cannot delete after any authorization or resource change", () => {
  const changes = [
    (s) => {
      s.tab = "details";
    },
    (s) => {
      s.delete_expanded = false;
    },
    (s) => {
      s.accept_delete = false;
    },
    (s) => {
      s.allowed = false;
    },
    (s) => {
      s.busy = true;
    },
    (s) => {
      s.busy_delete = true;
    },
    (s) => {
      s.shop.id = 43;
    },
    (s) => {
      s.cluster = { ...cluster(), id: 9 };
    },
    (s) => {
      s.cluster.id = 9;
    },
  ];
  for (const change of changes) {
    const { state, requests, confirmations } = fixture(cluster());
    verifyDelete(state);
    state.deleteClusterDialog();
    change(state);
    confirmations[0][3]();
    assert.equal(requests.length, 0, change.toString());
  }
});

test("delete failures keep the current record and form open for recovery", async () => {
  for (const kind of ["api", "network"]) {
    const { state, requests, events, notices } = fixture(cluster());
    verifyDelete(state);
    const pending = state.deleteCluster(state.cluster);
    if (kind === "api")
      requests[0].resolve({ error: true, error_msg: "Unavailable" });
    else requests[0].reject(new Error("Unavailable"));
    await pending;
    assert.equal(state.cluster.id, 8);
    assert.equal(state.name, "Staff Recommendations");
    assert.equal(state.busy_delete, false);
    assert.equal(events.length, 0);
    assert.equal(notices[0][0], kind);
  }
});

test("leaving Delete, collapsing it, changing cluster or losing access clears verification", () => {
  const { state, component } = fixture(cluster());
  for (const reset of [
    () => {
      state.tab = "details";
      component.watch.tab.call(state);
    },
    () => {
      state.delete_expanded = false;
      component.watch.delete_expanded.call(state, false);
    },
    () => {
      state.allowed = false;
      component.watch.can_write.call(state, false);
    },
    () => {
      state.cluster = { ...cluster(), id: 9, name: "New resource" };
      component.watch.cluster.call(state);
    },
  ]) {
    state.allowed = true;
    verifyDelete(state);
    reset();
    assert.equal(state.accept_delete, false);
  }
  assert.equal(state.name, "New resource");
  assert.equal(state.tab, "details");
  assert.equal(state.delete_expanded, false);
});
