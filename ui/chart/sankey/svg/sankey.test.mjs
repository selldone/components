import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { select } from "d3-selection";
import createSankey from "./sankey.js";

// Render the native SVG generator; no browser, network or application state is involved.
const dom = new JSDOM("<svg><g></g></svg>", { pretendToBeVisual: true });
const root = dom.window.document.querySelector("g");
const chart = createSankey()
  .size({ width: 600, height: 240 })
  .nodeDraggableY(true);
chart.sankey().nodeWidth(7).nodePadding(24).nodeSort(null);
const data = {
  nodes: [
    { name: "Source", amount: 0 },
    { name: "Other", amount: 5 },
    { name: "Destination", amount: 15 },
  ],
  links: [
    { source: "Source", target: "Destination", value: 10 },
    { source: "Other", target: "Destination", value: 5 },
  ],
};
const original = JSON.stringify(data);
const render = () => select(root).datum(data).call(chart);
const nodes = () => [...root.querySelectorAll(".d2b-sankey-node")];
const values = () => [...root.querySelectorAll(".d2b-sankey-node-value")];

render();
assert.equal(nodes().length, 3);
assert.equal(
  values().length,
  0,
  "Legacy charts retain their single text label",
);
for (const node of nodes()) {
  assert.equal(node.querySelectorAll("text").length, 1);
  assert.equal(
    +node.querySelector("text").getAttribute("y"),
    (node.__data__.y1 - node.__data__.y0) / 2 + 5,
  );
}

const calls = [];
chart.nodeValueLabel((node, value) => {
  calls.push([node, value]);
  return node.amount;
});
render();
assert.equal(values().length, 3);
assert.equal(values()[0].textContent, "0", "A recorded zero remains visible");
assert.equal(calls[0][0], data.nodes[0]);
assert.equal(
  calls[0][1],
  10,
  "The accessor receives the original node and D3 value separately",
);
for (const node of nodes()) {
  const title = node.querySelector("text");
  const amount = node.querySelector(".d2b-sankey-node-value");
  const atEnd = node.__data__.x0 >= 300;
  assert.equal(+title.getAttribute("x"), atEnd ? -7 : 14);
  assert.equal(amount.getAttribute("x"), title.getAttribute("x"));
  assert.equal(amount.classList.contains("d2b-text-anchor-end"), atEnd);
  assert.equal(+amount.getAttribute("y") - +title.getAttribute("y"), 15);
  assert.equal(
    +title.querySelector("tspan").getAttribute("y"),
    +title.getAttribute("y"),
    "Wrapped title lines move with the title baseline",
  );
  assert.equal(typeof select(node).on("mousedown.drag"), "function");
}

// Exercise D3's installed drag handler and check that both labels stay in the native group.
const source = nodes()[0];
const startY = source.__data__.y0;
source.dispatchEvent(
  new dom.window.MouseEvent("mousedown", {
    bubbles: true,
    view: dom.window,
    button: 0,
    clientX: 10,
    clientY: 20,
  }),
);
dom.window.dispatchEvent(
  new dom.window.MouseEvent("mousemove", {
    bubbles: true,
    view: dom.window,
    buttons: 1,
    clientX: 10,
    clientY: 35,
  }),
);
dom.window.dispatchEvent(
  new dom.window.MouseEvent("mouseup", {
    bubbles: true,
    view: dom.window,
    button: 0,
    clientX: 10,
    clientY: 35,
  }),
);
assert.equal(source.__data__.y0, startY + 15);
assert.equal(source.querySelectorAll("text").length, 2);
assert.equal(source.querySelector(".d2b-sankey-node-value").textContent, "0");
assert.equal(
  source.getAttribute("transform"),
  `translate(${source.__data__.x0}, ${source.__data__.y0})`,
);

chart.nodeValueLabel((node) => (node.name === "Other" ? null : node.amount));
render();
assert.equal(values().length, 2);
const unannotated = nodes().find((node) => node.__data__.key === "Other");
assert.equal(unannotated.querySelector(".d2b-sankey-node-value"), null);
assert.equal(
  +unannotated.querySelector("text").getAttribute("y"),
  (unannotated.__data__.y1 - unannotated.__data__.y0) / 2 - 2,
  "Unannotated nodes retain the same title alignment as annotated siblings",
);

for (const absent of [null, undefined, ""]) {
  chart.nodeValueLabel(absent);
  render();
  assert.equal(
    values().length,
    0,
    "Removing the option clears stale amount labels",
  );
  for (const node of nodes())
    assert.equal(node.querySelectorAll("text").length, 1);
}
assert.equal(
  JSON.stringify(data),
  original,
  "Layout and drag never mutate source amounts or links",
);
dom.window.close();
console.log(
  "Native Sankey: legacy default, optional/zero amounts, left/right placement, reset and native dragging passed.",
);
