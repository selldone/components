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
  <div>
    <apexchart
      v-if="data_series && option"
      :options="option"
      :series="data_series"
      class="text-dark"
      height="70"
      type="bar"
      width="100%"
    />

    <div class="d-flex mt-2 small op-0-5" dir="rtl">
      {{ $t("inline_chart.today") }}
      <v-spacer></v-spacer>
      {{ $t("inline_chart.last_days", { days: "30" }) }}
    </div>
  </div>
</template>

<script>
import { colorSet3 } from "@selldone/core-js/helper/color/ColorGenerator";

export default {
  name: "InlineChartByDiffDays",

  props: {
    dataPack: {},
    dataKeys: {},
    dataLabels: {},
    formatter: {},
    colors: {
      default: colorSet3,
    },

    chartId: {},
    chartGroup: {},
  },

  data: () => ({
    option: null,
  }),

  computed: {
    data_series() {
      if (!this.dataPack) return null;

      let day = 0;
      let list = {};
      while (day < 30) {
        const found = this.dataPack.find((item) => item.day === -day);

        this.dataKeys.forEach((key) => {
          let data = list[key];
          if (!data) {
            list[key] = [];
            data = list[key];
          }

          if (found) data.unshift(found[key]);
          else data.unshift(0);
        });

        day++;
      }
      let out = [];
      let index = 0;
      this.dataKeys.forEach((key) => {
        out.push({ data: list[key], name: this.dataLabels[index++] });
      });

      return out;
    },
  },

  created() {
    this.option = this.chartOptionsSparkLine();
  },

  methods: {
    chartOptionsSparkLine() {
      const t = this;
      return {
        chart: {
          id: this.chartId,
          group: this.chartGroup,

          animations: {
            enabled: false,
          },

          sparkline: {
            enabled: true,
          },

          fontFamily: "var(--font)",
        },
        markers: {
          size: 0,
        },
        dataLabels: {
          enabled: false,
        },

        fill: {
          colors: this.colors,
        },

        plotOptions: {
          bar: {
            columnWidth: "70%",
          },
        },

        xaxis: {
          crosshairs: {
            width: 1,
          },
        },
        tooltip: {
          fixed: {
            enabled: false,
          },
          x: {
            show: true,
            formatter: (value, timestamp, index) => {
              if (30 === value) return "Today";
              return `${30 - value} days ago`;
            },
          },
          y: {
            title: {
              formatter: (seriesName) => {
                return seriesName;
              },
            },
            formatter: (value, timestamp, index) => {
              if (t.formatter) return t.formatter(value, timestamp, index);
              return (
                this.FormatNumberCurrency(value, this.gateway.currency) +
                " " +
                this.GetUserSelectedCurrencyName(this.gateway.currency)
              );
            },
          },
          marker: {
            show: false,
          },
        },
      };
    },
  },
};
</script>

<style scoped></style>
