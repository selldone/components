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
  <div class="s--line-chart">
    <apexchart
      v-if="chart_option"
      dir="ltr"
      :type="type"
      :height="height"
      :options="chart_option"
      :series="series"
    />
  </div>
</template>

<script>
import { DateConverter } from "@core/helper/date/DateConverter";

import numeral from "numeral";
import { ChartAnnotations } from "../helper/ChartAnnotations";

export default {
  name: "SLineChart",
  props: {
    type: {
      required: false,
      type: String,
      default: "line",
    },

    timeSeries: {
      required: true,
      type: Object,
    },
    points: {},
    annotations: {},

    hasGrid: {
      default: false,
      type: Boolean,
    },
    marker: {
      default: false,
      type: Boolean,
    },
    yLabel: {
      required: true,
      type: String,
    },
    labelsData: {
      required: true,
      type: Array,
    },
    keys: {
      required: true,
      type: Array,
    },

    colors: {
      required: true,
      type: Array,
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
    yFormatAppend: {
      required: false,
      type: String,
      default: "",
    },

    dataLabelsEnable: {
      type: Boolean,
      default: false,
    },
    height: {
      default: "260px",
    },
    chartId: {},
    chartGroup: {},
    strokeWidth: { default: 3 },

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

  mounted() {
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
            "created_at"
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
          this.colors
        );
      }

      this.chart_option = {
        annotations: this.annotations
          ? this.annotations
          : {
              points: maxPoints,
            },
        points: this.points,

        chart: {
          id: this.chartId,
          group: this.chartGroup,

          //background: "transparent",

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
          /* row: {
             colors: ["#fafafa", "transparent"], // takes an array which will be repeated on columns
             opacity: 0.5
           }*/
        },
        markers: {
          size: this.marker ? 6 : 0,
          hover: {
            size: 10,
          },
        },

        stroke: {
          show: this.type === "line",
          width: this.strokeWidth,
          curve: "smooth",
        },
        dataLabels: {
          enabled: this.dataLabelsEnable,
          formatter: (value, timestamp, index) => {
            return numeral(value).format(this.yFormat);
          },
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
            minWidth: "4px",
          },
        },
        xaxis: {
          // categories: this.timeSeries.arrayOfTimeAbsoluteForceInterpolateZero("created_at"),
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
                (this.yFormatAppend ? ` ${this.yFormatAppend}` : "")
              );
            },
          },
        },
      };
    },
  },
};
</script>

<style scoped>
.s--line-chart {
}
</style>
