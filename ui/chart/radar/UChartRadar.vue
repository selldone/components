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
    :height="(fullDetails ? 480 : 210) / (small ? 2 : 1)"
    :options="options"
    :series="series"
    class="mt-2 mt-sm-0 mx-auto"
    type="radar"
    width="100%"
  />
</template>

<script>
export default {
  name: "UChartRadar",

  props: {
    fullDetails: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    social: {},
  },

  data: function () {
    return {};
  },

  computed: {
    series() {
      const out = [];
      if (this.social) {
        Object.keys(this.social).forEach((key) => {
          out.push(this.social[key]);
        });
      }
      return [
        {
          name: "Lead",
          data: out,
        },
      ];
    },

    options() {
      const labels = [];

      if (this.social) {
        Object.keys(this.social).forEach((key) => {
          labels.push(key);
        });
      }

      return {
        chart: {
          fontFamily: "var(--font)",
          type: "radar",

          toolbar: {
            show: this.fullDetails,
          },
        },
        //  colors: ["#FFA000", "#E91E63", "#9C27B0"],

        labels: labels,
        legend: {
          show: this.fullDetails,
          position: "bottom",
          fontSize: this.small ? "9px" : "11px",
          fontWeight: 600,
        },

        plotOptions: {
          radar: {
            size: (this.fullDetails ? 140 : 80) / (this.small ? 2.5 : 1),
            polygons: {
              strokeColors: "#e9e9e9",
              fill: {
                colors: ["#f8f8f8", "#fff"],
              },
            },
          },
        },
        colors: ["#0097A7"],

        markers: {
          size: this.small ? 2 : 4,
          colors: ["#fff"],
          strokeColor: "#1976D2",
          strokeWidth: 2,
        },

        tooltip: {
          y: {
            formatter: function (val) {
              return val;
            },
          },
        },
        xaxis: {
          categories: labels,
          labels:{
            style: {
              fontSize: this.small ? "8px" : "10px",
            },

          }
        },
        yaxis: {
          tickAmount: 6,
          labels: {
            formatter:  (val, i)=> {
              if (i % (this.small?4:2) === 0) {
                return val;
              } else {
                return "";
              }
            },

            style: {
              fontSize: this.small ? "8px" : "10px",
            },
          },

        },

        dataLabels: {
          enabled: false,
        },
      };
    },
  },
};
</script>

<style scoped></style>
