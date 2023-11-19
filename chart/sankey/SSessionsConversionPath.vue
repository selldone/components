<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <chart-sankey
    class="snaky-chart"
    :style="`height:${height}`"
    :data="chartData"
    :config="chartConfig"
  />
</template>

<script>
import { ChartSankey } from "vue-d2b";

export default {
  name: "SessionsConversionPath",
  components: { ChartSankey },

  props: {
    Social: {},
    direct: {},
    search: {},
    other: {},

    SocialDetails: {},

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

      if (this.SocialDetails) {
        Object.keys(this.SocialDetails).forEach((network) => {
          this.chartData.nodes.push({ name: network });
          this.chartData.links.push({
            source: this.$t("global.commons.social"),
            target: network,
            value: this.SocialDetails[network],
          });
        });
      }
    },
  },
};
</script>

<style scoped lang="scss">
.snaky-chart {
  width: 100%;
  height: 500px;
  direction: initial;
}
</style>
