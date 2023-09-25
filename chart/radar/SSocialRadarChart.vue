<template>
  <apexchart
    v-if="series && series.length"
    class="mt-2 mt-sm-0 mx-auto"
    type="radar"
    width="100%"
    :options="options"
    :height="(fullDetails ? 480 : 210)/(small?2:1)"
    :series="series"
  />
</template>

<script>
export default {
  name: "SSocialRadarChart",

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
          fontSize:this.small?'9px': '11px',
          fontWeight: 600,
        },

        plotOptions: {
          radar: {
            size: (this.fullDetails ? 140 : 80)/(this.small?2:1),
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
          size: this.small?2:4,
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
        },
        yaxis: {
          tickAmount: 6,
          labels: {
            formatter: function (val, i) {
              if (i % 2 === 0) {
                return val;
              } else {
                return "";
              }
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
