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
    :height="height"
    :options="chartOptions"
    :series="series"
    :width="height"
    class="mx-auto d-inline-block"
    type="radialBar"
  />
</template>

<script>
export default {
  name: "SRadialBarsChart",
  props: {
    series: {},
    height: {
      default: 168,
    },
    colors: {
      type: Array,
      default: () => {
        return ["#57adb5"];
      },
    },
    toColors: {
      type: Array,
      default: () => {
        return ["#3F51B5"];
      },
    },
    labels: {
      type: Array,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },

  data: function () {
    return {
      chartOptions: {
        chart: {
          fontFamily: "var(--font)",
          height: this.height,
          sparkline: {
            enabled: true,
          },
        },

        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 225,
            hollow: {
              margin: 0,
              size: this.small ? "35%" : "50%",
              background: "#fff",
              position: "front",
              dropShadow: {
                enabled: true,
                top: 2,
                left: 0,
                blur: 4,
                opacity: 0.24,
              },
            },
            track: {
              background: "#fff",
              strokeWidth: this.small ? "95%" : "67%",
              margin: 0, // margin is in pixels
              dropShadow: {
                enabled: true,
                top: -2,
                left: 0,
                blur: 4,
                opacity: 0.35,
              },
            },
            dataLabels: {
              enabled: !this.small,
              name: {
                offsetY: -5,
                show: !this.small,
                color: "#888",
                fontSize: "10px",
              },
              value: {
                formatter: (val) => {
                  return this.small ? "" : "%" + parseInt(val);
                },
                offsetY: -5,

                color: "#111",
                fontSize: "12px",
                show: true,
              },
            },
          },
        },
        fill: {
          colors: this.$props.toColors,
          type: "gradient",
          gradient: {
            shade: "dark",
            type: "horizontal",
            shadeIntensity: 0.5,
            gradientToColors: this.$props.colors,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100],
          },
        },
        stroke: {
          lineCap: "round",
        },
        labels: this.$props.labels,
      },
    };
  },
};
</script>

<style scoped></style>
