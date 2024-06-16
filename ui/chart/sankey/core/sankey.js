/*
 * Copyright (c) 2024. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

import {select} from "d3-selection";
import "d3-transition";

import base from "../model/base.js";
import chartFrame from "../util/chartFrame.js";
import tooltip from "../util/tooltip.js";
import sankey from "../svg/sankey.js";
import chartSankeyAdvanced from "../chartAdvanced/sankey.js";

export default function () {
  const $$ = {};

  function chart(context) {
    context.call($$.chartFrame);

    const selection = context.selection ? context.selection() : context;

    selection.each(function (datum) {
      update.call(this, datum, context !== selection ? context : null);
    });

    selection.dispatch("chart-sankey-updated", { bubbles: true });
    selection.dispatch("chart-updated", { bubbles: true });

    return chart;
  }

  function update(datum, transition) {
    const el = select(this),
      selection = el.select(".d2b-chart-container"),
      size = selection.node().__size__;

    let sankeyChart = selection.selectAll(".d2b-sankey-chart").data((d) => [d]),
      sankeyChartEnter = sankeyChart
        .enter()
        .append("g")
        .attr("class", "d2b-sankey-chart");

    sankeyChart = sankeyChart.merge(sankeyChartEnter);

    if (transition) {
      sankeyChart = sankeyChart.transition(transition);
    }

    sankeyChart.call($$.sankey.size(size));

    sankeyChart.selectAll(".d2b-sankey-link").call($$.linkTooltip);

    sankeyChart.selectAll(".d2b-sankey-node").call($$.nodeTooltip);

    return chart;
  }

  const defaultNodeTooltip = tooltip()
    .html((d) => {
      return `
          <b>${d.key}</b>:
          ${d.value}
        `;
    })
    .color((d) => d.color)
    .followMouse(true);

  const defaultLinkTooltip = tooltip()
    .html((d) => {
      return `
          <b>${d.source.key}</b>
          <i class='fas fa fa-arrow-right d2b-sankey-link-arrow' aria-hidden='true'></i>
          <b>${d.target.key}</b>:
          ${d.value}
        `;
    })
    .color("#444")
    .followMouse(true);

  // configure the model
  base(chart, $$)
    .addProp(
      "chartFrame",
      chartFrame().legendEnabled(false).breadcrumbsEnabled(false),
    )
    .addProp("sankey", sankey())
    .addProp("nodeTooltip", defaultNodeTooltip)
    .addProp("linkTooltip", defaultLinkTooltip)
    .addAdvancedConfig(chartSankeyAdvanced);

  return chart;
}
