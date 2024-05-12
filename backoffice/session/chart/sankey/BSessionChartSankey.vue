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
  />
</template>

<script>
import UChartSankey from "../../../../ui/chart/sankey/UChartSankey.vue";

export default {
  name: "BSessionChartSankey",
  components: { UChartSankey },

  props: {
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
  },

  mounted() {
    this.refreshChart();
  },
  methods: {
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
</style>
