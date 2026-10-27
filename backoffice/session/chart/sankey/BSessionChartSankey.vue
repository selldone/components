<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <u-chart-sankey
    :config="(c) => chartConfig(c)"
    :data="chartData"
    :style="`height:${height}`"
    class="snaky-chart"
    :class="{ 'snaky-chart--modern': modern }"
    @rendered="decorateSources"
    @chart-updated="decorateSources($event.currentTarget)"
  />
</template>

<script lang="ts">
import UChartSankey from "../../../../ui/chart/sankey/UChartSankey.vue";
import { Brands } from "@selldone/core-js/enums/social/Brands.ts";

export default {
  name: "BSessionChartSankey",
  components: { UChartSankey },

  props: {
    modern: Boolean,
    Social: {},
    direct: {},
    search: {},
    other: {},

    socialDetails: {},

    height: {
      require: false,
      default: "200px",
    },
  },
  data() {
    return {
      mode: "mono",

      chartData: {
        nodes: [],
        links: [],
      },

      chartConfig(config) {
        config.sankey().sankey().nodePadding(16);

        config.sankey().nodeDraggableY(true);
        // .nodeDraggableX(true)
      },
    };
  },
  computed: {},

  watch: {
    Social() {
      this.refreshChart();
    },
    search() {
      this.refreshChart();
    },
    other() {
      this.refreshChart();
    },
    direct() {
      if (this.modern) this.refreshChart();
    },
    socialDetails: {
      deep: true,
      handler() {
        if (this.modern) this.refreshChart();
      },
    },
  },

  mounted() {
    this.refreshChart();
  },
  methods: {
    decorateSources(root) {
      if (!this.modern || !root?.querySelectorAll) return;
      root.querySelectorAll(".d2b-sankey-node").forEach((node) => {
        const datum = node.__data__;
        if (!datum) return;
        const name = datum.data?.name;
        const brand =
          name === this.$t("global.commons.organic_search")
            ? Brands.find((item) => item.name === "Google")
            : Brands.find(
                (item) => item.name.toLowerCase() === name?.toLowerCase(),
              );
        let image = node.querySelector(".snaky-chart__source-icon");
        if (!brand || datum.sourceLinks?.length) {
          image?.remove();
          return;
        }
        if (!image) {
          image = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "image",
          );
          image.classList.add("snaky-chart__source-icon");
          image.setAttribute("aria-hidden", "true");
          image.setAttribute("pointer-events", "none");
          node.appendChild(image);
        }
        const label = node.querySelector("text");
        const end = label?.classList.contains("d2b-text-anchor-end");
        const width = Math.max(0, datum.x1 - datum.x0);
        const height = Math.max(0, datum.y1 - datum.y0);
        const iconSize = height < 12 ? 10 : 12;
        const plotHeight =
          node.closest(".d2b-chart-container")?.__size__?.height ||
          parseFloat(this.height);
        // Keep tiny terminal icons inside the plot without changing their native node geometry.
        const center = Math.max(
          iconSize / 2,
          Math.min(plotHeight - iconSize / 2, datum.y0 + height / 2),
        );
        image.setAttribute("href", brand.icon);
        image.setAttribute("width", String(iconSize));
        image.setAttribute("height", String(iconSize));
        image.setAttribute("x", String(end ? -5 - iconSize : width + 5));
        image.setAttribute("y", String(center - datum.y0 - iconSize / 2));
        const labelX = String(end ? -9 - iconSize : width + iconSize + 9);
        label?.setAttribute("x", labelX);
        label
          ?.querySelectorAll("tspan")
          .forEach((span) => span.setAttribute("x", labelX));
      });
    },
    refreshChart() {
      this.chartData.nodes = [
        { name: this.$t("global.commons.sessions") },
        { name: this.$t("global.commons.direct") },
        { name: this.$t("global.commons.social") },
        { name: this.$t("global.commons.organic_search") },
        { name: this.$t("global.commons.other") },
      ];
      this.chartData.links = [
        {
          source: this.$t("global.commons.sessions"),
          target: this.$t("global.commons.direct"),
          value: this.direct,
        },

        {
          source: this.$t("global.commons.sessions"),
          target: this.$t("global.commons.social"),
          value: this.Social,
        },
        {
          source: this.$t("global.commons.sessions"),
          target: this.$t("global.commons.organic_search"),
          value: this.search,
        },

        {
          source: this.$t("global.commons.sessions"),
          target: this.$t("global.commons.other"),
          value: this.other,
        },
      ];

      if (this.socialDetails) {
        Object.keys(this.socialDetails).forEach((network) => {
          this.chartData.nodes.push({ name: network });
          this.chartData.links.push({
            source: this.$t("global.commons.social"),
            target: network,
            value: this.socialDetails[network],
          });
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.snaky-chart {
  width: 100%;
  height: 500px;
  direction: initial;
}

.snaky-chart--modern :deep(svg) {
  overflow: visible;
}
</style>
