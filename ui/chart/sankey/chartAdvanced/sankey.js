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

import functor from "../util/functor.js";

import {sankeyCenter, sankeyJustify, sankeyLeft, sankeyRight,} from "d3-sankey";

/**
 * d2b.chartSankeyAdvanced(chart, datum) configures the input chart and formats a returned datum set
 */
export default function (chart, datum) {
  const nodeConfig = datum.node || {};
  const linkConfig = datum.link || {};
  const nodeTooltipConfig = nodeConfig.tooltip || {};
  const linkTooltipConfig = linkConfig.tooltip || {};

  // Chart Frame Config
  chart
    .chartFrame()
    .chartPadding(0)
    .size.conditionally(datum.size)
    .padding.conditionally(datum.padding);

  // Node Tooltip Config
  chart
    .nodeTooltip()
    .followMouse.conditionally(nodeTooltipConfig.followMouse)
    .my.conditionally(nodeTooltipConfig.my)
    .at.conditionally(nodeTooltipConfig.at)
    .html.proxy((d) => {
      const data = d.data;
      const value = d.value;
      if (data.tooltip !== undefined) {
        return data.tooltip;
      } else if (nodeTooltipConfig.html !== undefined) {
        return functor(nodeTooltipConfig.html)(data, value);
      }
    });

  // Link Tooltip Config
  chart
    .linkTooltip()
    .followMouse.conditionally(linkTooltipConfig.followMouse)
    .my.conditionally(linkTooltipConfig.my)
    .at.conditionally(linkTooltipConfig.at)
    .html.proxy((d) => {
      const data = d.data;
      const source = d.source.data;
      const target = d.target.data;
      if (data.tooltip !== undefined) {
        return data.tooltip;
      } else if (linkTooltipConfig.html !== undefined) {
        return functor(linkTooltipConfig.html)(data, source, target);
      }
    });

  // Sankey Config
  const sankey = chart
    .sankey()
    .nodeLabel((d) => d.name)
    .linkValue((d) => d.value)
    .nodeLabelWrapLength.conditionally(nodeConfig.labelWrapLength)
    .nodeDraggableX.conditionally(nodeConfig.draggableX)
    .nodeDraggableY.conditionally(nodeConfig.draggableY)
    .nodeColor.proxy((d, i, k) => d.color || functor(nodeConfig.color)(d, k))
    .linkSourceColor.proxy(
      (d, i, s) => d.sourceColor || functor(linkConfig.sourceColor)(d, s),
    )
    .linkTargetColor.proxy(
      (d, i, t) => d.targetColor || functor(linkConfig.targetColor)(d, t),
    );

  // D3 Sankey Config
  const d3Sankey = sankey.sankey();
  if (nodeConfig.align !== undefined) {
    let nodeAlign =
      typeof nodeConfig.align === "function" ? nodeConfig.align : sankeyJustify;
    switch (nodeConfig.align) {
      case "left":
        nodeAlign = sankeyLeft;
        break;
      case "right":
        nodeAlign = sankeyRight;
        break;
      case "center":
        nodeAlign = sankeyCenter;
        break;
    }
    d3Sankey.nodeAlign(nodeAlign);
  }
  if (datum.iterations !== undefined) d3Sankey.iterations(datum.iterations);
  if (nodeConfig.padding !== undefined)
    d3Sankey.nodePadding(nodeConfig.padding);
  if (nodeConfig.sort !== undefined)
    d3Sankey.nodeSort(
      nodeConfig.sort === null
        ? null
        : (a, b) => nodeConfig.slice(0).sort(a.data, b.data),
    );

  return datum;
}
