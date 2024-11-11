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
  <div class="position-relative">
    <apexchart
      :height="height"
      :options="chartOptionsSparkLine"
      :series="seriesSpark"
      :type="type"
      class="text-dark"
      width="100%"
    />

    <div class="d-flex small op-0-5 top-header flex-rtl-reverse">
      <span>{{ $t("inline_chart.last_days", { days: days }) }}</span>
      <i class="fas fa-arrow-left mx-1"></i>
      <v-spacer></v-spacer>

      <i class="fas fa-arrow-right mx-1"></i>
      <span>{{ $t("inline_chart.today") }}</span>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "FinanceInlineChart",
  props: {
    timeSeries: {
      required: true,
      type: Object,
    },

    valueTitles: {
      required: false,
      type: Array,
    },
    dimensionIsCurrency: {
      required: false,
      type: Boolean,
      default: false,
    },

    currency: {
      required: true,
      type: String,
    },
    financeKeys: {
      required: true,
      type: Array,
    },

    days: {
      required: false,
      type: Number,
      default: 30,
    },
    height: {
      required: false,
      default: 70,
    },
    type: {
      required: false,
      type: String,
      default: "bar",
    },
    colors: {
      required: false,
      type: Array,
      default() {
        return ["#FFA000", "#8BC34A"];
      },
    },
    chartId: {},
    chartGroup: {},
  },

  data() {
    return {
      show_description: false,

      chartOptionsSparkLine: null,
    };
  },

  computed: {
    seriesSpark() {
      let seriesSpark = [];

      let i = 0;
      this.financeKeys.forEach((financeKey) => {
        const series = this.timeSeries.financeArrayOfByCurrencyInTimespan(
          financeKey,
          this.currency,
          0,
          this.days,
        );
        let _data = [];

        series.forEach((_item) => {
          _data.push(_item.val);
        });

        seriesSpark.push({
          data: _data,
          name: this.valueTitles[i],
        });
        i++;
      });

      return seriesSpark;
    },
  },

  watch: {
    colors() {
      this.cal();
    },
  },

  created() {
    this.cal();
  },

  methods: {
    cal() {
      this.chartOptionsSparkLine = {
        chart: {
          id: this.chartId,
          group: this.chartGroup,

          sparkline: {
            enabled: true,
          },

          fontFamily: "var(--font)",

          animations: {
            enabled: false,
          },
        },
        colors: this.colors,

        fill: {
          colors: this.colors,
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.13,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            colorStops: [],
          },
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"],
        },

        plotOptions: {
          bar: {
            borderRadius: 1,
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
              if (this.days === value) return this.$t("inline_chart.today");
              return this.$t("inline_chart.last_days", {
                days: this.days - value,
              });
            },
          },
          y: {
            title: {
              formatter: (seriesName) => {
                return seriesName;
              },
            },
            formatter: (value, timestamp, index) => {
              return (
                this.FormatNumberCurrency(value, this.currency) +
                " " +
                this.GetUserSelectedCurrencyName(this.currency)
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

<style lang="scss" scoped>
.top-header {
  position: absolute;
  top: 8px;
  width: 100%;
  left: 0;

  @media only screen and (max-width: 600px) {
    visibility: hidden !important;
  }
}
</style>
