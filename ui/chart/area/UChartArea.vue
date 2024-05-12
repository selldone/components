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
    v-if="chart_option"
    :height="height"
    :options="chart_option"
    :series="series"
    :type="type"
    class="s--area-chart"
    dir="ltr"
  />
</template>

<script>
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

import numeral from "numeral";
import { colorSet1 } from "@selldone/core-js/helper/color/ColorGenerator";
import { ChartAnnotations } from "../helper/ChartAnnotations.ts";

export default {
  name: "UChartArea",
  props: {
    type: {
      required: false,
      type: String,
      default: "area",
    },
    timeSeries: {
      required: true,
      type: Object,
    },

    points: {},
    annotations: {},

    yLabel: {
      required: true,
      type: String,
    },
    hasGrid: {
      default: false,
      type: Boolean,
    },
    labelsData: {
      required: true,
      type: Array,
    },
    keys: {
      required: true,
      type: Array,
    },
    valuePostfix: {
      required: false,
      type: String,
    },

    colors: {
      required: false,
      type: Array,
      default: () => {
        return colorSet1;
      },
    },

    opacity: {
      required: false,
      type: Number,
      default: 0.8,
    },

    yFormat: {
      required: false,
      type: String,
      default: "0.[000]a",
    },

    dataLabelsEnable: {
      type: Boolean,
      default: false,
    },
    height: {
      default: "260px",
    },
    dark: {
      type: Boolean,
      default: false,
    },

    chartId: {},
    chartGroup: {},

    annotationMaxOn: {
      type: Boolean,
      default: true,
    },
  },

  data: function () {
    return {
      series: [],

      chart_option: null,
    };
  },

  computed: {},
  watch: {
    timeSeries() {
      this.init();
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      this.resetToDefault(); // 🞇 Reset to default

      if (!this.timeSeries) return;

      this.initOption();

      let i = 0;
      this.keys.forEach((item) => {
        this.series.push({
          name: "" + this.labelsData[i],
          data: this.timeSeries.arrayOfForceInterpolateZero(
            item,
            true,
            "created_at",
          ),
        });
        i++;
      });
    },

    initOption() {
      let maxPoints = [];
      if (this.annotationMaxOn) {
        // Create max points annotations:
        maxPoints = ChartAnnotations.CreateMaxPoints(
          this.timeSeries,
          this.keys,
          this.labelsData,
          this.colors,
        );
      }

      this.chart_option = {
        annotations: this.annotations
          ? this.annotations
          : {
              points: maxPoints,
            },

        points: this.points,

        series: [],
        theme: {
          mode: this.dark ? "dark" : "light",
        },

        chart: {
          id: this.chartId,
          group: this.chartGroup,

          width: "100%",

          background: "transparent",

          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 550,
            },
            dynamicAnimation: {
              enabled: true,
              speed: 1000,
            },
          },
          events: {
            /*   mounted: function(chart) {
                                                  let commits = chart.getSeriesTotalXRange(
                                                      chart.w.globals.minX,
                                                      chart.w.globals.maxX
                                                  );
                                              },
                                              updated: function(chart) {
                                                  let commits = chart.getSeriesTotalXRange(
                                                      chart.w.globals.minX,
                                                      chart.w.globals.maxX
                                                  );
                                              }*/
          },

          zoom: {
            enabled: true,
          },

          // 🞇 Toolbar (for line)
          toolbar: {
            show: true,

            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true,
              customIcons: [],
            },
          },

          fontFamily: "var(--font)",
        },
        colors: this.colors,
        stroke: {
          width: 0,
          curve: "smooth",
        },

        bar: {
          columnWidth: "70%",
        },

        dataLabels: {
          enabled: this.dataLabelsEnable,
          formatter: (value, timestamp, index) => {
            return (
              numeral(value).format(this.yFormat) +
              (this.valuePostfix ? ` ${this.valuePostfix}` : "")
            );
          },
        },
        fill: {
          opacity: this.opacity,
          type: "solid",
        },

        yaxis: {
          axisTicks: {
            show: true,
          },
          axisBorder: {
            show: false,
          },
          title: {
            text: this.yLabel,
          },

          labels: {
            formatter: (value, timestamp, index) => {
              return numeral(value).format(this.yFormat);
            },
            minWidth: 12,
          },
        },
        xaxis: {
          //    categories: this.timeSeries.arrayOfTimeAbsoluteForceInterpolateZero("created_at"),
          tickAmount: 4,
          type: "datetime",
          labels: {
            show: true,
            rotate: -45,
            rotateAlways: false,
            hideOverlappingLabels: true,
            showDuplicates: false,
            trim: true,
            minHeight: undefined,
            maxHeight: 60,
            style: {
              colors: [],
              fontSize: "10px",
            },
            offsetX: 0,
            offsetY: 0,
            format: undefined,
            formatter: function (value, timestamp, index) {
              return DateConverter.ConvertTimestampToShortString(value);
            },
          },
        },

        tooltip: {
          x: {
            formatter: function (value, timestamp, index) {
              return DateConverter.ConvertTimestampToShortString(value);
            },
          },

          y: {
            formatter: (value, timestamp, index) => {
              return (
                numeral(value).format(this.yFormat) +
                (this.valuePostfix ? ` ${this.valuePostfix}` : "")
              );
            },
          },
        },

        grid: {
          show: this.hasGrid,
          borderColor: this.SaminColorLight,
          strokeDashArray: [2, 3],
          position: "back",
          xaxis: {
            lines: {
              show: false,
            },
          },
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
      };
    },
  },
};
</script>

<style lang="scss">
.s--area-chart {
  .apexcharts-theme-dark {
    background: transparent !important;
  }

  width: 100%;
}
</style>
