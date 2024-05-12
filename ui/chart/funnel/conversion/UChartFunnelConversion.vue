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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <u-chart-funnel
    :animated="true"
    :class="{ dense: dense, dark: isDark, 'no-legend': noLegend }"
    :colors="colors"
    :direction="direction"
    :display-percentage="true"
    :gradient-direction="direction"
    :height="height"
    :labels="labels"
    :sub-labels="subLabels"
    :values="values"
    :width="width"
    class="funnel-chart-simple mx-auto my-2 overflow-hidden d-block px-3 py-2 ps-md-12 text-start"
    style="width: max-content"
  ></u-chart-funnel>
</template>
<script>
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";

export default {
  name: "UChartFunnelConversion",
  components: { UChartFunnel },

  props: {
    model: {
      require: true,
      type: Object,
    },

    width: {
      default: 240,
    },
    height: {
      default: 470,
    },
    direction: {
      default: "vertical",
    },

    dense: {
      type: Boolean,
      default: false,
    },

    subLabels: {
      type: Array,
      default: () => ["conversion"],
    },

    keys: {
      type: Array,
      default: () => ["sends", "delivers", "views", "clicks", "buys"],
    },
    labels: {
      type: Array,
      default: () => ["Sends", "Delivers", "Views", "Clicks", "Buys"],
    },

    colors: {
      type: Array,
      default: () => [
        ["#C2185B", "#FF3C8E", "#FFA000", "#388E3C", "#0288D1"], // color set for "Impressions" segment
      ],
    },
    isDark: {
      type: Boolean,
      default: false,
    },
    noLegend: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      //  labels: ["Sends", "Delivers", "Views", "Clicks", "Buys"],
      //   subLabels: ["Email conversion"],
      /*
            colors: [
             ["#C2185B", "#FF3C8E", "#FFA000", "#388E3C", "#0288D1"] // color set for "Impressions" segment
            ]*/
    };
  },
  computed: {
    values() {
      const out = [];

      this.keys.forEach((key) => {
        out.push([this.model[key]]);
      });
      /*
      return [
        [this.email.sends ],
        [this.email.delivers ],
        [this.email.views ],
        [this.email.clicks ],
        [this.email.buys ]
      ];
    }*/

      return out;
    },
  },

  watch: {},

  mounted() {},
  created() {},

  methods: {},
};
</script>

<style lang="scss">
.svg-funnel-js {
  &.dense {
    .svg-funnel-js__labels {
      line-height: normal !important;

      .svg-funnel-js__label {
        padding: 0 !important;
      }

      .label__value {
        line-height: normal !important;
        margin: 0 !important;
      }
    }
  }
}
</style>
