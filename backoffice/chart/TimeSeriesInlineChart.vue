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
    <div :style="{ minHeight: height + 'px' }">
      <apexchart
        :class="{ 'hover-img-grayscale': hoverGray }"
        :height="height"
        :options="chartOptionsSparkLine"
        :series="seriesSpark"
        :type="type"
        class="text-dark"
        width="100%"
      />
    </div>

    <div class="bottom-bar single-line flex-rtl-row-revert">
      <span>{{ start_date }}</span>
      <v-spacer></v-spacer>
      <span>{{ end_date }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import numeral from "numeral";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "TimeSeriesInlineChart",
  props: {
    timeSeries: {
      required: true,
      type: Object,
    },

    //--------- For finance mode --------
    financeCurrency: {},
    //------------------------------------

    valueTitles: {
      required: false,
      type: Array,
    },
    dark: {
      default: false,
      type: Boolean,
    },
    flatColor: {
      default: false,
      type: Boolean,
    },

    glow: {
      default: false,
      type: Boolean,
    },
    keys: {
      required: true,
      type: Array,
    },
    hoverGray: {
      default: false,
      type: Boolean,
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

    forceAppendZero: {
      default: false,
      type: Boolean,
    },
    forceDays: {
      required: false,
      type: Number,
      default: 30,
    },

    shadow: {
      default: false,
      type: Boolean,
    },
    marker: {
      default: false,
      type: Boolean,
    },

    totalMode: {
      default: false,
      type: Boolean,
    },
    interpolateZero: {
      default: true,
      type: Boolean,
    },
    diffMode: {
      default: false,
      type: Boolean,
    },
    stacked: {
      default: false,
      type: Boolean,
    },
    stroke: {
      default: false,
      type: Boolean,
    },
    startZeroCategoryBug: {
      // Just in product admin !!!    BProductOrdersAbstractView
      default: false,
      type: Boolean,
    },
    animation: {
      default: true,
      type: Boolean,
    },
    grid: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      show_description: false,

      chartOptionsSparkLine: {
        markers: {
          size:
            this.marker &&
            this.timeSeries.days < 31 &&
            this.$vuetify.display.smAndUp
              ? 4
              : 0,
        },

        id: Math.random() * 1000,
        chart: {
          id: this.chartId,
          group: this.chartGroup,
          stacked: this.stacked,

          sparkline: {
            enabled: true,
          },

          fontFamily: "var(--font)",

          dropShadow: {
            enabled: this.shadow,
            top: this.glow ? 0 : 6,
            left: this.glow ? 0 : 4,
            blur: this.glow ? 3 : 5,
            color: this.glow ? this.colors[0] : this.dark ? "#fff" : "#000",
            opacity: this.glow ? 0.95 : 0.45,
          },

          events: {
            /* dataPointMouseEnter: (event, chartContext, config)=> {
              this. onEnter(5,6)
            }*/
          },

          animations: {
            enabled: this.animation,
          },
        },
        colors: this.colors,
        fill: {
          colors: this.colors,
          type: this.dark || this.flatColor ? "color" : "gradient",
          gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.38,
            gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
            inverseColors: false,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100],
            //  colorStops: []
          },
        },

        stroke: {
          curve: "smooth",
          lineCap: "butt",
          colors: this.dark ? ["#fff"] : this.colors,
          width: this.type === "line" ? 2 : this.stroke ? 1 : 0,
          dashArray: 0,
        },
        grid: {
          show: this.grid,
          borderColor: "rgba(120,120,120,0.15)", // Set the color of the grid lines
          strokeDashArray: 2, // Set to 0 to ensure other grid lines are solid
          position: "back",
          xaxis: {
            lines: {
              show: false, // Hide horizontal grid lines to leave only the X-axis line
            },
          },
          yaxis: {
            lines: {
              show: this.grid, // Set to true to show vertical grid lines, false to hide
              width: 1,
            },
          },
          padding: {
            top: 5,
            right: 10,
            bottom: 5,
            left: 10,
          },
        },

        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: this.stacked ? 0 : 1,
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
              // console.log('formatter',value, timestamp, index)
              const days_before =
                value - (this.timeSeries.offset + this.timeSeries.days);
              //   - 1; /* ON BUILD SOME TIME FIX!!!+ (this.startZeroCategoryBug?0:-1)*/ /*Start from 1!*/
              const date = new Date().setStart().addDays(days_before);
              //   console.log(value,date,days_before,'offset',this.timeSeries.offset,'days',this.timeSeries.days)
              return DateConverter.ConvertTimestampToShortString(date);
            },

            /* formatter: (value, timestamp, index) => {
              if (this.days === value) return this.$t("inline_chart.today");
              return this.$t("inline_chart.last_days", {
                days: this.days - value
              });
            }*/
          },
          y: {
            title: {
              formatter: (seriesName) => {
                return seriesName;
              },
            },
            formatter: function (value, timestamp, index) {
              return numeral(value).format("0.[0]a");
            },

            /*   formatter: (value, timestamp, index) => {
              return (
                this.FormatNumberCurrency(value, this.currency) +
                " " +
                this.GetUserSelectedCurrencyName(this.currency)
              );
            }*/
          },
          marker: {
            show: false,
          },
        },
      },
    };
  },

  computed: {
    start_date() {
      return DateConverter.ConvertTimestampToShortString(
        this.timeSeries.startDate,
      );
    },
    end_date() {
      return DateConverter.isToday(this.timeSeries.endDate)
        ? this.$t("global.commons.today")
        : DateConverter.ConvertTimestampToShortString(this.timeSeries.endDate);
    },
    seriesSpark() {
      let seriesSpark = [];

      let i = 0;
      this.keys.forEach((key) => {
        //const series = this.timeSeries.arrayOfInterpolateZero(key,this.offsetDay,this.days);
        let series = this.timeSeries.arrayOfInterpolateZero(
          key,
          this.timeSeries.offset,
          this.timeSeries.days,
          "created_at",
          this.interpolateZero,
          this.financeCurrency,
        );

        //   console.log('series',series)

        if (this.forceAppendZero) {
          // use when append zero for future data!
          const loop = this.forceDays - series.length;
          for (let i = 0; i < loop; i++) {
            series.push({ diff: -(i + 1), val: 0 });
          }
        }
        //  console.log('series after',series)

        //  series=series .reverse()

        let _data = [];
        series.forEach((_item) => {
          _data.push(_item.val);
        });

        // Diff mode:
        let data_diff = [];
        if (this.diffMode) {
          data_diff.push(0);
          for (let i = 1; i < _data.length; i++) {
            data_diff.push(_data[i] - _data[i - 1]);
          }
          _data = data_diff;
        }

        // Normal mode:
        if (!this.totalMode) {
          // Multi chart mode:
          seriesSpark.push({
            data: _data,
            name: this.valueTitles[i],
          });
        }

        // Total mode:
        else {
          // Total single chart mode:
          if (!seriesSpark[0]) {
            seriesSpark.push({
              data: _data,
              name: this.valueTitles[i],
            });
          } else {
            let __data = seriesSpark[0].data;
            for (let i = 0; i < __data.length; i++) {
              __data[i] += _data[i];
            }
          }
        }

        i++;
      });

      return seriesSpark;
    },
  },
  created() {},

  methods: {},
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

.bottom-bar {
  display: flex;
  align-items: center;
  font-size: 10px;
  color: #999;
  font-weight: 300;
  padding: 0 4px; // Chart padding!
  margin: 0 8px;
  border-top: solid thin #eee;
}
</style>
