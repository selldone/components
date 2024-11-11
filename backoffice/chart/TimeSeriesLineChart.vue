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
  <div id="wrapper">
    <div id="chart-line2">
      <apexchart
        :height="height"
        :options="chartOptions"
        :series="seriesLine"
        type="line"
      ></apexchart>
    </div>
    <div id="chart-line">
      <apexchart
        :height="height / 2"
        :options="chartOptionsLine"
        :series="series"
        type="area"
      ></apexchart>
    </div>
  </div>
</template>

<script lang="ts">
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "TimeSeriesLineChart",
  components: {},
  props: {
    timeSeries: {
      required: true,
    },

    yLabel: {},
    keys: { required: true },
    mainKey: { required: true },

    labelsData: { required: true },
    colors: { required: true },
    mainColors: {},
    height: { default: 200 },
    annotations: {},

    fullDate: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    id: 0,

    chartOptions: null,

    chartOptionsLine: null,
  }),

  created() {
    // Create random ID:
    this.id = Math.round(Math.round(100000));

    this.chartOptions = {
      annotations: this.annotations ? this.annotations : {},
      chart: {
        id: "chartA" + this.id,
        type: "line",
        height: this.height,
        toolbar: {
          autoSelected: "pan",
          show: false,
        },
      },
      colors: this.colors,
      stroke: {
        width: 2,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
      },
      markers: {
        size: 0,
      },
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        title: {
          text: this.yLabel,
        },
      },

      tooltip: {
        x: {
          formatter: (value, timestamp, index) => {
            return DateConverter.ConvertTimestampToShortString(
              value,
              false,
              this.fullDate,
            );
          },
        },
      },
    };
    this.chartOptionsLine = {
      chart: {
        id: "chartB" + this.id,
        height: this.height / 2,
        type: "area",
        brush: {
          target: "chartA" + this.id,
          enabled: true,
        },
        selection: {
          enabled: true,
          xaxis: {
            //  min: new Date("19 Jun 2020").getTime(),
            //  max: new Date().getTime(),
          },
        },
      },
      colors: this.mainColors ? this.mainColors : ["#333", "#555"],
      stroke: {
        width: 0,
      },

      fill: {
        type: "solid",
      },
      xaxis: {
        type: "datetime",
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        tickAmount: 2,
        title: {
          //    text: this.yLabel,
        },
      },
    };
  },

  computed: {
    seriesLine() {
      const out = [];

      let i = 0;
      this.keys.forEach((key) => {
        const data = [];
        this.timeSeries.raw_data.forEach((item) => {
          const val = item[key];
          const date = item["created_at"];

          data.push({
            x: new Date(date).getTime(),
            y: val,
          });
        });

        out.push({
          name: "" + this.labelsData[i],

          data: data,
        });

        i++;
      });

      return out;
    },

    series() {
      const out = [];

      const data = [];

      this.timeSeries.raw_data.forEach((item) => {
        const val = item[this.mainKey];
        const date = item["created_at"];

        data.push({
          x: new Date(date).getTime(),
          y: val,
        });
      });

      out.push({
        data: data,
      });

      return out;
    },
  },
};
</script>

<style scoped></style>
