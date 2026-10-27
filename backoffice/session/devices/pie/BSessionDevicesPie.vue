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
    :height="modern ? (small ? 180 : 220) : fullDetails ? 160 : 120"
    :options="modern ? modern_options : options"
    :series="series"
    class="mt-2 mt-sm-0"
    :type="type"
    width="100%"
  />
</template>

<script lang="ts">
import numeral from "numeral";
import { Analytics } from "@selldone/core-js";

export default {
  name: "BSessionDevicesPie",

  props: {
    modern: Boolean,
    type: {
      type: String,
      default: "donut",
    },
    small: Boolean,
    tickAmount: {
      type: Number,
      default: 5,
    },
    fullDetails: {
      type: Boolean,
      default: false,
    },

    desktop: {},
    tablet: {},
    mobile: {},
    colors: {
      type: Array,
      default: () => ["#FFA000", "#E91E63", "#9C27B0"],
    },
  },

  data: function () {
    return {
      options: {
        chart: {
          fontFamily: "var(--font)",
        },
        colors: this.colors,

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

        yaxis: {
          tickAmount: this.tickAmount,
          labels: {
            style: {
              fontSize: this.small ? "8px" : "10px",
            },
            formatter: function (value) {
              return numeral(value).format("0.[0]a");
            },
          },
        },

        tooltip: {
          y: {
            formatter: function (value) {
              return numeral(value).format("0.[0]a");
            },
          },
        },
      },
    };
  },

  computed: {
    modern_options() {
      const theme = this.$vuetify.theme;
      const colors =
        theme.computedThemes?.[theme.name]?.colors || theme.current.colors;
      const surface =
        colors.surface || (theme.current.dark ? "#22242a" : "#ffffff");
      const onSurface =
        colors["on-surface"] || (theme.current.dark ? "#f1f2f6" : "#24272e");
      return {
        ...this.options,
        chart: {
          ...this.options.chart,
          background: "transparent",
          foreColor: onSurface,
        },
        theme: { mode: this.$vuetify.theme.current.dark ? "dark" : "light" },
        stroke: { colors: [surface], width: 2 },
        fill: { opacity: 0.7 },
        legend: {
          ...this.options.legend,
          fontSize: "12px",
          fontWeight: 400,
          labels: { colors: onSurface },
          markers: {
            customHTML: Analytics.DeviceType.map(
              (type) => () =>
                `<i class="${type.icon.replace("fa:", "")}" aria-hidden="true" style="color:${type.color}"></i>`,
            ),
          },
        },
        yaxis: {
          ...this.options.yaxis,
          labels: {
            ...this.options.yaxis.labels,
            style: { fontSize: "11px", colors: onSurface },
          },
        },
        tooltip: {
          ...this.options.tooltip,
          theme: this.$vuetify.theme.current.dark ? "dark" : "light",
        },
      };
    },
    series() {
      return [this.desktop, this.mobile, this.tablet];
    },
  },
};
</script>

<style scoped></style>
