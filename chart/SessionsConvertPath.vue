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
