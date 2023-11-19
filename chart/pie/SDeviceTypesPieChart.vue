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
  <apexchart
    v-if="series && series.length"
    class="mt-2 mt-sm-0"
    type="donut"
    width="100%"
    :options="options"
    :height="fullDetails ? 160 : 120"
    :series="series"
  />
</template>

<script>
export default {
  name: "SDeviceTypesPieChart",

  props: {
    fullDetails: {
      type: Boolean,
      default: false,
    },

    desktop: {},
    tablet: {},
    mobile: {},
  },

  data: function () {
    return {
      options: {
        chart: {
          fontFamily: "var(--font)",
        },
        colors: ["#FFA000", "#E91E63", "#9C27B0"],

        labels: [
          this.$t("device_types.desktop"),
          this.$t("device_types.mobile"),
          this.$t("device_types.tablet"),
        ],
        legend: {
          show: this.$props.fullDetails,
          position: "bottom",
          fontSize: "9px",
          fontWeight: 600,
        },

        dataLabels: {
          enabled: false,

        },

        plotOptions: {
          pie: {
            donut: {
              size: "30%",
            },
          },
        },
      },
    };
  },

  computed: {
    series() {
      return [this.desktop, this.mobile, this.tablet];
    },
  },
};
</script>

<style scoped></style>
