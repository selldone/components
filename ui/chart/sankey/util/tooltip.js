import { select } from "d3-selection";
import "d3-transition";

import base from "../model/base";
import { isTouchDevice } from "../util/browser.js";

export default function () {
  const $$ = {};

  const tooltip = function (context) {
    const selection = context.selection ? context.selection() : context;
    selection.on(event("mouseover"), mouseover).on(event("mouseout"), mouseout);

    if (isTouchDevice()) {
      selection.on(event("click"), mouseout);
    } else {
      selection.on(event("mousemove"), mousemove);
    }

    return tooltip;
  };

  const getCoords = function (d, i) {
    const box = this.getBoundingClientRect();
    let coords = {};

    // construct at object, if null automatically set it based on cursor event position
    let at = (
      $$.at.call(this, d, i) ||
      (event.clientX > window.innerWidth / 2 ? "center left" : "center right")
    ).split(" ");
    at = { x: at[1], y: at[0] };

    // switch for horizontal coordinate
    switch (at.x) {
      case "left":
        coords.x = box.left;
        break;
      case "center":
        coords.x = box.left + box.width / 2;
        break;
      default: // right
        coords.x = box.left + box.width;
    }

    // switch for vertical coordinate
    switch (at.y) {
      case "bottom":
        coords.y = box.top + box.height;
        break;
      case "center":
        coords.y = box.top + box.height / 2;
        break;
      default: // top
        coords.y = box.top;
    }
    return coords;
  };

  const mouseover = function (event, d) {
    const html = $$.html.call(this, d);
    if (!html) return;
    let tooltipUpdate = $$.container.selectAll(".d2b-tooltip").data([d]);

    const newTooltip = tooltipUpdate
      .enter()
      .append("div")
      .style("opacity", 0)
      .attr("class", "d2b-tooltip");

    newTooltip.append("div").attr("class", "d2b-tooltip-content");

    tooltipUpdate = tooltipUpdate.merge(newTooltip);

   // tooltipUpdate.transition().duration(100).style("opacity", 1); It has bug in production! tooltipUpdate has no transition() method

    $$.dispatch.call("insert", tooltipUpdate, this, d);

    mousemove.call(this, event, d);
  };

  const mousemove = function (event, d) {
    const html = $$.html.call(this, d),
      target = $$.target.call(this, d),
      color = $$.color.call(this, d),
      targetNode = target ? target.node() : this,
      coords = $$.followMouse.call(this, d)
        ? { x: event.clientX, y: event.clientY }
        : getCoords.call(targetNode, d);

    if (!html) return;
    // if (!$$.container.selectAll('.d2b-tooltip').size()) return mouseover(d);

    let tooltipUpdate = $$.container.selectAll(".d2b-tooltip").data([d]);

    let my =
      $$.my.call(this, d) ||
      (event.clientX > window.innerWidth / 2 ? "left" : "right");

    tooltipUpdate
      .attr("class", `d2b-tooltip d2b-tooltip-${my}`)
      .style("top", coords.y + "px")
      .style("left", coords.x + "px")
      .style("border-color", color)
      .select(".d2b-tooltip-content")
      .html(html);

    $$.dispatch.call("move", tooltipUpdate, this, d);
  };

  const mouseout = function (event, d) {
    let tooltipUpdate = $$.container.selectAll(".d2b-tooltip").data([d]);

   // tooltipUpdate.transition().duration(100).style("opacity", 0).remove();  It has bug in production! tooltipUpdate has no transition() method

    $$.dispatch.call("remove", tooltipUpdate, this, d);
  };

  const event = (listener) => {
    return `${listener}.d2b-tooltip`;
  };

  /* Inherit from base model */
  base(tooltip, $$)
    .addProp("container", select("body")) //, null, updateContainer)
    .addMethod("clear", function (context) {
      (context.selection ? context.selection() : context)
        .on(event("mouseover"), null)
        .on(event("mouseout"), null)
        .on(event("mousemove"), null);

      return tooltip;
    })
    .addPropFunctor("followMouse", false)
    .addPropFunctor("color", null)
    .addPropFunctor("my", null)
    .addPropFunctor("at", null)
    .addPropFunctor("target", null)
    .addPropFunctor("html", null)
    .addDispatcher(["insert", "move", "remove"]);

  return tooltip;
}
