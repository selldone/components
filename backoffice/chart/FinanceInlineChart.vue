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
  <div
    ref="chartContainer"
    class="position-relative"
    :class="{ 'b-finance-inline-chart-modern': modern }"
  >
    <apexchart
      :height="height"
      :key="modern ? chartWidth : undefined"
      :options="chartOptionsSparkLine"
      :series="seriesSpark"
      :type="modern ? 'line' : type"
      class="text-dark"
      :width="modern && chartWidth ? chartWidth : '100%'"
    />

    <div v-if="!modern" class="d-flex small op-0-5 top-header flex-rtl-reverse">
      <span>{{ $t("inline_chart.last_days", { days: days }) }}</span>
      <i class="fas fa-arrow-left mx-1"></i>
      <v-spacer></v-spacer>

      <i class="fas fa-arrow-right mx-1"></i>
      <span>{{ $t("inline_chart.today") }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "FinanceInlineChart",
  mixins: [CurrencyMixin],
  props: {
    modern: Boolean,
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
      chartWidth: 0,
      chartObserver: null,
      chartFrame: null,
      show_description: false,

      chartOptionsSparkLine: null,
    };
  },

  computed: {
    seriesSpark() {
      if (this.modern) {
        return this.financeKeys.map((key, index) => ({
          name: this.valueTitles?.[index] || key,
          type: index === 0 ? "column" : "line",
          data: this.timeSeries.raw_data.map((row) => [
            DateConverter.convertToLocalTime(row.created_at, true)?.getTime(),
            row.finances?.find(
              (finance) => finance.currency === this.currency,
            )?.[key] ?? 0,
          ]),
        }));
      }
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
  mounted() {
    if (!this.modern || !this.$refs.chartContainer) return;
    let pendingWidth = this.chartWidth;
    this.chartObserver = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      if (width <= 0) return;
      pendingWidth = width;
      if (this.chartFrame !== null || width === this.chartWidth) return;
      // Redraw after observer delivery so Apex cannot trigger a same-cycle resize loop.
      this.chartFrame = requestAnimationFrame(() => {
        this.chartFrame = null;
        if (pendingWidth !== this.chartWidth) this.chartWidth = pendingWidth;
      });
    });
    this.chartObserver.observe(this.$refs.chartContainer);
  },
  beforeUnmount() {
    this.chartObserver?.disconnect();
    if (this.chartFrame !== null) cancelAnimationFrame(this.chartFrame);
    this.chartFrame = null;
  },

  methods: {
    cal() {
      if (this.modern) {
        this.chartOptionsSparkLine = {
          chart: {
            type: "line",
            background: "transparent",
            fontFamily: "var(--font)",
            toolbar: { show: false },
            zoom: { enabled: false },
            animations: { enabled: false },
          },
          colors: this.financeKeys.map(() => this.colors[0]),
          stroke: {
            width: this.financeKeys.map((_, index) => (index === 0 ? 0 : 2)),
            dashArray: this.financeKeys.map((_, index) =>
              index === 0 ? 0 : 4,
            ),
            curve: "straight",
          },
          fill: {
            type: "solid",
            opacity: this.financeKeys.map((_, index) =>
              index === 0 ? 0.65 : 1,
            ),
          },
          dataLabels: { enabled: false },
          plotOptions: { bar: { columnWidth: "55%", borderRadius: 1 } },
          legend: { show: true, fontSize: "11px", fontWeight: 400 },
          xaxis: {
            type: "datetime",
            tickAmount: 3,
            labels: {
              style: { fontSize: "11px" },
              formatter: (value) =>
                DateConverter.ConvertTimestampToShortString(value),
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
          },
          yaxis: {
            labels: {
              style: { fontSize: "11px" },
              formatter: (value) =>
                this.FormatNumberCurrency(value, this.currency),
            },
          },
          grid: {
            borderColor: "rgba(128,128,128,.18)",
            strokeDashArray: 4,
            xaxis: { lines: { show: false } },
          },
          tooltip: {
            shared: true,
            intersect: false,
            x: {
              formatter: (value) =>
                DateConverter.ConvertTimestampToShortString(value),
            },
            y: {
              formatter: (value) =>
                this.FormatNumberCurrency(value, this.currency) +
                " " +
                this.currency,
            },
          },
        };
        return;
      }
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
.b-finance-inline-chart-modern {
  min-width: 0;
  width: 100%;
  max-width: 100%;
}
.b-finance-inline-chart-modern :deep(.vue-apexcharts) {
  min-width: 0;
  max-width: 100%;
}
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
