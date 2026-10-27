import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(
  new URL("./liveViewData.ts", import.meta.url),
  "utf8",
);
const exports = {};
vm.runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText,
  { exports },
);
const { acceptsSnapshot, liveLocations, clusterLocations } = exports;
const point = (id, lat, lon, active_sessions, cart = 0) => ({
  id,
  lat,
  lon,
  active_sessions,
  add_to_cart: cart,
  orders_placed: 0,
  country_code: "US",
});
const snapshot = () => ({
  shop_id: 7,
  sequence: 100,
  as_of: "2026-10-27T12:00:00Z",
  windows: {
    5: {
      locations: [
        point("a", 10, 10, 0, 4),
        point("event-only", -50, 100, 0, 2),
      ],
    },
    15: { locations: [point("a", 10, 10, 0, 12)] },
  },
  locations: [
    point("a", 10, 10, 2),
    point("b", 11, 11, 3),
    point("distant", -20, -100, 7),
  ],
});

test("a previous tenant or stale transport response cannot replace the current report", () => {
  const next = snapshot();
  assert.equal(acceptsSnapshot(next, 7, null), true);
  assert.equal(acceptsSnapshot(next, 8, null), false);
  assert.equal(acceptsSnapshot(next, 7, { ...next, sequence: 101 }), false);
  assert.equal(
    acceptsSnapshot(next, 7, { ...next }),
    true,
    "cached snapshots remain usable",
  );
  assert.equal(acceptsSnapshot({ ...next, as_of: "invalid" }, 7, null), false);
  assert.equal(acceptsSnapshot({ ...next, windows: {} }, 7, null), false);
});

test("presence and event windows retain independent real values and unknown locations never become map points", () => {
  const next = snapshot();
  next.locations.push(
    point("invalid", NaN, 0, 50),
    point("off-world", 91, 10, 20),
    point("zero", 0, 0, 0),
  );
  assert.equal(liveLocations(null, 5).length, 0);
  const rows = liveLocations(next, 5);
  assert.equal(rows.length, 4);
  assert.equal(rows.find((row) => row.id === "a").active_sessions, 2);
  assert.equal(rows.find((row) => row.id === "a").add_to_cart, 4);
  assert.equal(rows.find((row) => row.id === "event-only").active_sessions, 0);
  assert.equal(
    liveLocations(next, 15).find((row) => row.id === "a").add_to_cart,
    12,
  );
});

test("screen clustering preserves exact totals, grows apart on zoom, and excludes only offscreen marks", () => {
  const rows = liveLocations(snapshot(), 5);
  const project = ([lon, lat]) => [lon + 180, 90 - lat];
  const clusters = clusterLocations(
    rows,
    project,
    { x: 0, y: 0, k: 1 },
    360,
    180,
  );
  assert.equal(clusters.length, 3);
  assert.equal(
    clusters.reduce((sum, group) => sum + group.active_sessions, 0),
    12,
  );
  assert.equal(
    clusters.reduce((sum, group) => sum + group.add_to_cart, 0),
    6,
  );
  assert.equal(clusters.find((group) => group.ids.includes("a")).ids.length, 2);
  const moved = clusterLocations(
    rows,
    project,
    { x: -1000, y: 0, k: 1 },
    360,
    180,
  );
  assert.equal(moved.length, 0);
  const separated = clusterLocations(
    [point("a", 10, 10, 2), point("b", 11, 11, 3)],
    project,
    { x: -9000, y: -3900, k: 50 },
    1000,
    1000,
  );
  assert.equal(separated.length, 2);
});
