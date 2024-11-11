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
      :height="height"
      :options="chartOptions"
      :series="series"
      type="heatmap"
    ></apexchart>
  </div>
</template>

<script lang="ts">
export default {
  name: "BooleanHeatmap",
  props: {
    timeSeries: {
      required: true,
    },

    yLabel: {},
    title: {},

    keys: { required: true },
    mainKey: { required: true },

    labelsData: { required: true },
    colors: { required: true },
    height: { default: 200 },
  },
  data: () => ({
    chartOptions: null,
  }),

  created() {
    this.chartOptions = {
      chart: {
        height: this.height,
        type: "heatmap",

        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: this.colors,
      xaxis: {
        type: "datetime",
      },
      yaxis: {
        title: {
          text: this.yLabel,
        },
      },

      title: {
        text: this.title,
      },
      grid: {
        padding: {
          right: 20,
        },
      },
    };
  },

  computed: {
    series() {
      const out = [];

      let i = 0;
      this.keys.forEach((key) => {
        const data = [];
        this.timeSeries.raw_data.forEach((item) => {
          let val = item[key];
          if (typeof val === "boolean") {
            val = val ? 1 : 0;
          }

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
  },
};
</script>

<style scoped></style>
