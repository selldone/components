import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { parse, compileScript, compileTemplate } from "@vue/compiler-sfc";
import ts from "typescript";

function source(name) {
  const filename = new URL(name, import.meta.url).pathname;
  const { descriptor, errors } = parse(readFileSync(new URL(name, import.meta.url), "utf8"), { filename });
  assert.deepEqual(errors, []);
  const script = compileScript(descriptor, { id: name });
  assert.deepEqual(compileTemplate({ source: descriptor.template.content, filename, id: name, compilerOptions: { bindingMetadata: script.bindings } }).errors, []);
  return ts.transpileModule(script.content, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
}

const flowExports = {};
vm.runInNewContext(source("BProductFlow.vue"), {
  exports: flowExports,
  require: name => name.endsWith(".svg") ? name : { default: {}, ProductType: {}, BusinessModel: {}, SubscriptionMode: {} },
});
const flowSteps = flowExports.default.computed.flowSteps;
function steps(overrides = {}) {
  return flowSteps.call({
    $product: { type: "PHYSICAL", icon: "product.png" },
    $t: key => key, getShopImagePath: value => `/images/${value}`,
    getProductTypeImage: value => `/types/${value}.svg`,
    isMarketplace: false, has_valuation: false, isService: false, isSubscription: false,
    ribbon_link_type: null, connect: null, ...overrides,
  });
}
const ids = values => Array.from(values, step => step.id);
assert.deepEqual(ids(steps()), ["purchase", "cart", "pricing", "incentives", "tax", "checkout", "payment", "fulfillment"]);
assert.deepEqual(ids(steps({ isService: true })).slice(-3), ["confirmation", "payment", "fulfillment"]);
assert.deepEqual(ids(steps({ isMarketplace: true, has_valuation: true })).slice(0, 5), ["purchase", "cart", "vendor", "pricing", "valuation"]);
const linked = steps({ isSubscription: true, ribbon_link_type: { image: "physical.svg" }, connect: { name: "Channel", icon: "channel.png" } });
assert.deepEqual(ids(linked).slice(-3), ["recurring", "linked", "connect"]);
assert.equal(linked.at(-1).backward, true);
assert.equal(linked.at(-1).title, "Channel");
assert.equal(linked.at(-2).image, "physical.svg");
assert.equal(steps({ $product: { type: "FILE" } })[1].image, undefined);

// Product-specific settings show on their step: its own sales locations, then per-order limits.
const t = (key, values) => values ? `${key} ${JSON.stringify(values)}` : key;
const located = steps({ $t: t, getCountryName: iso => `name:${iso}`, $product: { type: "PHYSICAL", locations: { DE: ["10115", "10117"], FR: [] }, limit_min: "2", limit_max: 0 } });
assert.deepEqual(ids(located).slice(0, 3), ["purchase", "locations", "cart"]);
assert.deepEqual([...located[1].flags], ["DE", "FR"]);
assert.equal(located[1].note, undefined);
assert.match(located[1].help, /^b_product_dashboard\.flow\.help\.locations b_product_dashboard\.flow\.locations_allowed /);
assert.match(located[1].help, /name:DE\\",\\"count\\":2}, .*name:FR\\",\\"count\\":0}/);
assert.equal(located[2].note, 'b_product_dashboard.flow.limit_min {"count":2}');
assert.equal(located[2].help, 'b_product_dashboard.flow.help.cart b_product_dashboard.flow.limit_help_min {"min":2}');
const unlocated = steps({ $t: t, $product: { type: "PHYSICAL", locations: {}, limit_min: 2, limit_max: 10 } });
assert.equal(unlocated[1].note, "b_product_inventory.locations.scope.product_none");
assert.equal(unlocated[2].note, 'b_product_dashboard.flow.limit_min {"count":2} · b_product_dashboard.flow.limit_max {"count":10}');
assert.match(unlocated[2].help, /limit_help_range \{"min":2,"max":10\}$/);
assert.match(steps({ $t: t, $product: { type: "PHYSICAL", limit_max: 5 } })[1].help, /limit_help_max \{"max":5\}$/);
assert.ok(steps().every(step => step.help === `b_product_dashboard.flow.help.${step.id}`));

function options(name) {
  const exports = {};
  vm.runInNewContext(source(name), { exports, require: () => ({ defineComponent: value => value, ProductType: {} }) });
  return exports.default;
}
const tax = options("row/tax/BProductFlowRowTax.vue").computed.taxEnabled;
assert.equal(tax.call({ isSubscription: false, current_tax_profile: { enable: false }, $shop: { tax: { enable: true } } }), false);
assert.equal(tax.call({ isSubscription: false, current_tax_profile: null, $shop: { tax: { enable: true } } }), true);
assert.equal(tax.call({ isSubscription: false, current_tax_profile: null, $shop: {} }), undefined);
assert.equal(tax.call({ isSubscription: true, current_tax_profile: null, $shop: { tax: { enable: true } } }), undefined);
const location = options("errors/location/BProductFlowErrorsLocation.vue").computed.subtitle;
assert.equal(location.call({ no_location_error: false, invalid_location_error: true, $t: key => key }), "product_flow.location_errors.invalid_location_error_subtitle");
assert.equal(location.call({ no_location_error: true, invalid_location_error: false, $t: key => key }), "product_flow.location_errors.no_location_error_subtitle");

// The modern diagram is the shared SArticleFlow: one linear block, compact, never stored in an article.
const flowBlock = flowExports.default.computed.flowBlock;
const located2 = steps({ $t: t, getCountryName: iso => iso, $product: { type: "PHYSICAL", locations: { CA: [], DK: [], US: [], AR: [], AM: [] }, limit_min: 10 } });
const block = flowBlock.call({ flowSteps: located2, $t: key => key });
assert.equal(block.type, "flow");
assert.equal(block.animated, true);
assert.deepEqual(Array.from(block.nodes, node => node.id), ["purchase", "locations", "cart", "pricing", "incentives", "tax", "checkout", "payment", "fulfillment"]);
assert.equal(block.nodes[1].caption, 'b_product_dashboard.flow.locations_more {"count":2}');
assert.equal(block.nodes[2].caption, 'b_product_dashboard.flow.limit_min {"count":10}');
assert.equal(block.nodes[3].caption, "");
assert.ok(block.nodes.every(node => node.description && node.outcome === null));
assert.equal(JSON.stringify(block.edges), JSON.stringify(located2.slice(1).map((step, index) => ({ from: located2[index].id, to: step.id, label: "" }))));
const connected = steps({ $t: t, connect: { name: "Channel", icon: "channel.png" } });
assert.equal(connected.at(-1).note, "b_product_dashboard.flow.two_way");
console.log("Product flow: native step branches, product notes and the shared flowchart block passed.");
