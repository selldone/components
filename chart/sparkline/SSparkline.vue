<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
      :type="type"
      :height="height"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import numeral from "numeral";

export default defineComponent({
  name: "SSparkline",
  components: {},
  props: {
    value: {
      type: Array,
      required: true,
    },
    name: {},
    height: {
      type: String,
      default: "350",
    },
    type: {
      type: String,
      default: "area",
    },
    gradient: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: "#3069b7",
    },
    strokeColor: {
      type: String,
      default: "#3069b7",
    },
    strokeWidth: {
      type: Number,
      default: 2,
    },
    padding: {
      type: Number,
      default: 0,
    },
    smooth: Boolean,
    reversed: Boolean,
  },
  data() {
    return {
      series: [
        {
          name: this.name,
          data: this.value,
          color:this.color
        },
      ],
      chartOptions: {},
    };
  },
  watch: {
    // Watch for changes in props and update chart options
    type() {
      this.updateChartOptions();
    },
    gradient() {
      this.updateChartOptions();
    },
    color() {
      this.updateChartOptions();
    },
    strokeWidth() {
      this.updateChartOptions();
    },
    padding() {
      this.updateChartOptions();
    },
  },
  methods: {
    updateChartOptions() {
      this.chartOptions = {
        chart: {
          type: this.type,
          sparkline: {
            enabled: true,
          },
          offsetY: this.padding,
        },
        stroke: {
          curve: this.smooth ? "smooth" : "straight",
          width: this.strokeWidth,
          colors: [this.strokeColor],
        },
        fill: {
          type: this.gradient ? "gradient" : "solid",
          colors: [this.color],
          gradient: this.gradient
            ? {
                shadeIntensity: 1,
                opacityFrom: 1,
                opacityTo: 0,
                stops: [0, 100],
              }
            : null,
        },
        xaxis: {
          type: "numeric",
        },
        tooltip: {
          fixed: {
            enabled: false,
          },
          x: {
            show: false,
          },
          y: {
            title: {
              formatter: function (seriesName) {
                return "";
              },
            },

              formatter: function (value, timestamp, index) {
                return numeral(value).format("0.[0]a");
              },


          },
          marker: {
            show: false,
          },
        },

        yaxis: {
          reversed: this.reversed,
        },

      };
    },
  },
  created() {
    this.updateChartOptions();
  },
});
</script>

<style scoped lang="scss"></style>
