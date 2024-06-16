import { sankey as sankeyGenerator, sankeyLinkHorizontal } from "d3-sankey";
import { select } from "d3-selection";
import { drag as d3Drag } from "d3-drag";
import "d3-transition";

import base from "../model/base.js";
import color from "../util/color.js";
import textWrap from "../util/textWrap.js";

// sankey svg generator
export default function () {
  const $$ = {};

  /* Update Function */
  const sankey = function (context) {
    const selection = context.selection ? context.selection() : context;

    selection.each(function (datum) {
      const transition = context === selection ? null : context;

      const el = select(this),
        size = $$.size(datum),
        sankeyLink = sankeyLinkHorizontal();

      // map node data wrapper
      const nodesData = $$.nodes(datum).map((d, i) => {
        const key = $$.nodeKey(d, i);

        return {
          key: key,
          label: $$.nodeLabel(d, i, key),
          color: $$.nodeColor(d, i, key),
          draggableX: $$.nodeDraggableX(d, i),
          draggableY: $$.nodeDraggableY(d, i),
          preserveDragging: $$.nodePreserveDragging(d, i),
          wrapLength: $$.nodeLabelWrapLength(d, i),
          data: d,
          index: i,
        };
      });

      // map link data wrapper
      const linksData = $$.links(datum).map((d, i) => {
        let source = $$.linkSource(d, i),
          target = $$.linkTarget(d, i);

        if (typeof source !== "object")
          source = nodesData.find((node) => node.key === source);
        if (typeof target !== "object")
          target = nodesData.find((node) => node.key === target);

        const key = $$.linkKey(d, i, source.key, target.key);

        return {
          sourceKey: source.key,
          targetKey: target.key,
          key: key,
          keyTrim: key.replace(/ /g, ""),
          sourceColor: $$.linkSourceColor(d, i, source.color),
          targetColor: $$.linkTargetColor(d, i, target.color),
          value: $$.linkValue(d, i),
          source: source,
          target: target,
          data: d,
          index: i,
        };
      });

      // config sankey
      $$.sankey
        .size([size.width, size.height])
        .nodeId((d) => d.key)
        .nodes(nodesData)
        .links(linksData);

      const nodeWidth = $$.sankey.nodeWidth();

      // get sankey graph layout and filter out those that have a falsy value
      let graph = $$.sankey.nodes(nodesData).links(linksData)();
      graph.links = graph.links.filter((n) => !!n.value);
      graph.nodes = graph.nodes.filter((n) => !!n.value);
      graph = $$.sankey.nodes(graph.nodes).links(graph.links)();

      // render link gradients
      let linkDefs = el.selectAll(".d2b-sankey-link-defs").data([graph.links]),
        linksDefsEnter = linkDefs
          .enter()
          .append("defs")
          .attr("class", "d2b-sankey-link-defs");

      linkDefs = linkDefs.merge(linksDefsEnter);

      let linkGradient = linkDefs.selectAll(".d2b-def-gradient").data(
          (d) => d,
          (d) => d.keyTrim,
        ),
        linkGradientEnter = linkGradient
          .enter()
          .append("linearGradient")
          .attr("class", "d2b-def-gradient"),
        linkGradientExit = linkGradient.exit();

      linkGradientEnter
        .append("stop")
        .attr("class", "d2b-gradient-from")
        .attr("offset", "0%");

      linkGradientEnter
        .append("stop")
        .attr("class", "d2b-gradient-to")
        .attr("offset", "100%");

      linkGradient = linkGradient.merge(linkGradientEnter);

      if (transition) {
        linkGradientExit = linkGradientExit.transition(transition);
        linkGradient = linkGradient.transition(transition);
      }

      linkGradientExit.remove();

      linkGradient.attr("id", (d) => d.keyTrim);

      linkGradient
        .select(".d2b-gradient-from")
        .attr("stop-color", (d) => d.sourceColor);

      linkGradient
        .select(".d2b-gradient-to")
        .attr("stop-color", (d) => d.targetColor);

      // render links
      let links = el.selectAll(".d2b-sankey-links").data([graph.links]),
        linksEnter = links
          .enter()
          .append("g")
          .attr("class", "d2b-sankey-links");

      links = links.merge(linksEnter);

      let link = links.selectAll(".d2b-sankey-link").data(
          (d) => d,
          (d) => d.key,
        ),
        linkEnter = link.enter().append("g").attr("class", "d2b-sankey-link"),
        linkExit = link.exit();

      const linkStatic = (link = link.merge(linkEnter));

      if (transition) {
        link = link.transition(transition);
        linkExit = linkExit.transition(transition);
      }

      // render nodes
      let nodes = el.selectAll(".d2b-sankey-nodes").data([graph.nodes]),
        nodesEnter = nodes
          .enter()
          .append("g")
          .attr("class", "d2b-sankey-nodes");

      nodes = nodes.merge(nodesEnter);

      let node = nodes.selectAll(".d2b-sankey-node").data(
          (d) => d,
          (d) => d.key,
        ),
        nodeEnter = node.enter().append("g").attr("class", "d2b-sankey-node"),
        nodeExit = node.exit();

      const nodeStatic = (node = node.merge(nodeEnter));

      if (transition) {
        node = node.transition(transition);
        nodeExit = nodeExit.transition(transition);
      }

      // setup node dragging and preserve previous dragging
      node.each(function (d) {
        if (d.draggableX || d.draggableY) {
          const nodeElement = this;
          select(this)
            .classed("d2b-draggable", true)
            .call(
              d3Drag().on("drag", function (event) {
                drag(event, d, nodeElement);
              }),
            );
        } else {
          select(this).classed("d2b-draggable", false).on(".drag", null);
        }

        if (d.preserveDragging) {
          if (this.__dragX0 !== undefined) {
            d.x0 = this.__dragX0 * size.width;
            d.x1 = d.x0 + nodeWidth;
          }

          if (this.__dragY0 !== undefined) {
            const height = d.y1 - d.y0;
            d.y0 = this.__dragY0 * size.height;
            d.y1 = d.y0 + height;
          }
        }
      });

      $$.sankey.update(graph);

      linkEnter
        .style("opacity", 0)
        .append("path")
        .attr("d", sankeyLink)
        .style("stroke", (d) => `url(#${d.keyTrim})`)
        .style("stroke-width", (d) => `${d.width}px`);

      linkExit.style("opacity", 0).remove();

      nodeEnter
        .attr("transform", (d) => `translate(${d.x0}, ${d.y0})`)
        .style("opacity", 0);

      nodeEnter
        .append("rect")
        .attr("width", Math.max(0, nodeWidth))
        .attr("height", (d) => Math.max(0, d.y1 - d.y0));

      nodeEnter.append("text").attr("x", labelX).attr("y", labelY);

      nodeExit.style("opacity", 0).remove();

      updater(transition);

      function labelX(d) {
        return labelLeft(d) ? nodeWidth + 5 : -5;
      }

      function labelLeft(d) {
        return d.x0 < size.width / 2;
      }

      function labelY(d) {
        return 5 + Math.max(0, d.y1 - d.y0) / 2;
      }

      function drag(event, d, nodeElement) {
        if (d.draggableX) {
          d.x0 = Math.max(0, Math.min(size.width - nodeWidth, d.x0 + event.dx));
          d.x1 = d.x0 + nodeWidth;
          nodeElement.__dragX0 = d.x0 / size.width; // save drag position as a percent of the width
        }
        if (d.draggableY) {
          const height = d.y1 - d.y0;
          d.y0 = Math.max(
            0,
            Math.min(size.height - (d.y1 - d.y0), d.y0 + event.dy),
          );
          d.y1 = d.y0 + height;
          nodeElement.__dragY0 = d.y0 / size.height; // save drag position as a percent of the height
        }
        $$.sankey.update(graph);
        updater();
        selection.dispatch("chart-updated", { bubbles: true });
      }

      // set attributes on defined nodes and links
      function updater(transition = false) {
        nodeStatic
          .select("text")
          .classed("d2b-text-anchor-end", (d) => !labelLeft(d))
          .call(
            textWrap,
            function (d) {
              return d.label;
            },
            function (d) {
              return d.wrapLength;
            },
            "middle",
          );

        const l = transition ? link : linkStatic,
          n = transition ? node : nodeStatic;

        l.style("opacity", 1)
          .select("path")
          .attr("d", sankeyLink)
          .style("stroke", (d) => `url(#${d.keyTrim})`)
          .style("stroke-width", (d) => `${d.width}px`);

        // fix for rectangular link gradients
        l.each(function (d) {
          const l = select(this);

          // special case draw a rect
          if (Math.abs(d.y1 - d.y0) < 0.00001) {
            let rect = l.selectAll("rect").data([d]),
              rectEnter = rect.enter().append("rect"),
              width = d.target.x0 - d.source.x1;

            rect = rect.merge(rectEnter);

            if (transition) rect = rect.transition(transition);

            rect
              .attr("x", d.source.x1 + Math.min(0, width))
              .attr("y", d.y0 - d.width / 2)
              .attr("height", Math.max(0, d.width))
              .attr("width", Math.abs(d.target.x0 - d.source.x1))
              .style("fill", `url(#${d.keyTrim})`);

            l.select("path").style("display", "none");
          } else {
            l.select("rect").remove();
            l.select("path").style("display", "");
          }
        });

        n.attr("transform", (d) => `translate(${d.x0}, ${d.y0})`).style(
          "opacity",
          1,
        );

        n.select("rect")
          .attr("width", Math.max(0, nodeWidth))
          .attr("height", (d) => Math.max(0, d.y1 - d.y0))
          .style("fill", (d) => d.color);

        n.select("text").attr("x", labelX).attr("y", labelY);
      }
    });

    selection.dispatch("svg-sankey-updated", { bubbles: true });

    return sankey;
  };

  /* Inherit from base model */
  base(sankey, $$)
    .addProp("sankey", sankeyGenerator())
    .addPropFunctor("size", { width: 960, height: 500 })
    .addPropFunctor("nodes", (d) => d.nodes)
    .addPropFunctor("nodeKey", (d) => d.name)
    .addPropFunctor("nodeLabel", (d, i, key) => key)
    .addPropFunctor("nodeLabelWrapLength", Infinity)
    .addPropFunctor("nodeDraggableX", false)
    .addPropFunctor("nodeDraggableY", false)
    .addPropFunctor("nodePreserveDragging", true)
    .addPropFunctor("nodeColor", (d, i, key) => color(key))
    .addPropFunctor("links", (d) => d.links)
    .addPropFunctor("linkSource", (d) => d.source)
    .addPropFunctor("linkSourceColor", (d, i, sourceColor) => {
      return sourceColor;
    })
    .addPropFunctor("linkTarget", (d) => d.target)
    .addPropFunctor("linkTargetColor", (d, i, targetColor) => {
      return targetColor;
    })
    .addPropFunctor("linkKey", (d, i, sourceKey, targetKey) => {
      return `${sourceKey}-${targetKey}`;
    })
    .addPropFunctor("linkValue", (d) => d.value);

  return sankey;
}
