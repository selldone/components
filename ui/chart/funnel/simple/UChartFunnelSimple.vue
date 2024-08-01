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
  <u-chart-funnel
    v-if="show_funnel"
    :animated="true"
    :class="{ 'dense p-0': dense, dark: isDark}"
    :colors="colors"
    :direction="direction"
    :display-percentage="displayPercentage"
    :gradient-direction="gradientDirection"
    :height="height"
    :labels="labels"
    :sub-labels="subLabels"
    :values="values"
    :width="width"
    :dark="isDark"
  ></u-chart-funnel>
</template>

<script>
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";

export default {
  name: "UChartFunnelSimple",
  components: { UChartFunnel },

  props: {
    value: {
      type: Array,
      require: true,
    },
    labels: {
      type: Array,
      require: true,
    },
    subLabels: {
      type: Array,
      require: true,
    },
    height: {
      default: 300,
    },
    width: {
      default: 150,
    },
    dense: {
      type: Boolean,
      default: false,
    },

    isDark: {
      type: Boolean,
      default: false,
    },
    noLegend: {
      type: Boolean,
      default: false,
    },

    displayPercentage: {
      type: Boolean,
      default: false,
    },
    colors: {
      type: Array,
      default: () => {
        return [
          //  ["#FFB178", "#FF3C8E"], // color set for "Impressions" segment
          ["#A0BBFF", "#EC77FF"], // color set for "Add To Cart" segment
          ["#A0F9FF", "#7795FF"], // color set for "Buy" segment
        ];
      },
    },
  },
  data() {
    return {
      show_funnel: false,

      // labels: ["Impressions", "Add To Cart", "Buy"],
      // subLabels: ["Cart"],
      /* values: [
        // with the given Labels and SubLabels here's what the values represent:
        //
        // Direct, Social, Ads
        //    |      |     |
        //    v      v     v
        [3000], // Segments of "Impressions" from top to bottom
        [3000], // Segments of "Add To Cart"
        [600] // Segments of "Buy"
      ],*/
      /* colors: [
        //  ["#FFB178", "#FF3C8E"], // color set for "Impressions" segment
        ["#A0BBFF", "#EC77FF"], // color set for "Add To Cart" segment
        ["#A0F9FF", "#7795FF"] // color set for "Buy" segment
      ],*/
      direction: "vertical",
      gradientDirection: "vertical",
    };
  },

  computed: {
    values() {
      let out = [];
      this.value.forEach((item) => {
        if (out.length >= this.labels.length) return;
        if (Array.isArray(item)) out.push(item);
        else out.push([item]);
      });
      return out;
    },
  },
  methods: {
    onResize() {
      this.rerender_force();
    },

    rerender_force() {
      this.show_funnel = false;
      this.$nextTick(function () {
        this.show_funnel = true;
      });
    },
  },
  beforeUnmount() {},
  mounted() {
    this.onResize();
  },
};
</script>

<style lang="scss">

</style>
