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
  <s-widget-box
    :active="true"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mx-sm' style='font-size: 6px;'></span> ${$t(
      'gift_card.dashboard.count_widget.title',
    )} <span class='fw-normal mx-xs small'>${$t(
      'gift_card.dashboard.count_widget.title_small',
    )}  </span>  </h5>`"
    extended
    icon="fa:fas fa-credit-card"
  >
    <template v-slot:actions>
      <apexchart
        :options="options"
        :series="series"
        dir="ltr"
        height="200"
        type="line"
        width="100%"
      />
    </template>

    <template v-slot:bottom>
      <v-row>
        <v-col class="p-3 px-4 text-center" cols="12" sm="4">
          <h6>
            {{ numeralFormat(giftCardType.count, "0,0a") }}
          </h6>
          <p class="text-muted mb-0">
            <small>
              <i class="fas fa-calendar-check text-muted me-1" />{{
                $t("gift_card.dashboard.count_widget.total_cards")
              }}
            </small>
          </p>
        </v-col>

        <v-col class="p-3 px-4 text-center" cols="12" sm="4">
          <h6>
            {{ numeralFormat(totalUsed30Days, "0,0a") }}
          </h6>
          <p class="text-muted mb-0">
            <small
              ><i class="fas fa-calendar-day text-muted me-1" />
              {{
                $t("gift_card.dashboard.count_widget.used_cards_30days")
              }}</small
            >
          </p>
        </v-col>

        <v-col class="p-3 px-4 text-center" cols="12" sm="4">
          <h6>
            {{ numeralFormat(todayData.used, "0,0a") }}
          </h6>
          <p class="text-muted mb-0">
            <small
              ><i class="fas fa-calendar-day text-muted me-1" />
              {{ $t("gift_card.dashboard.count_widget.used_today") }}
            </small>
          </p>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

import numeral from "numeral";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "BGiftcardStatisticsCount",
  components: { SWidgetBox },
  props: {
    giftCardType: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {
      options: {
        colors: ["#303F9F", "#FBC02D"],

        chart: {
          stacked: false,

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

        // 🞇 Stroke chart
        stroke: {
          curve: "smooth",
          colors: "#303F9F",
          width: 2,
          dashArray: 0,
        },

        // 🞇 Bar chart
        plotOptions: {
          bar: {
            horizontal: false,
            endingShape: "flat",
            columnWidth: "50%",
            distributed: false,
            colors: {
              backgroundBarColors: [],
              backgroundBarOpacity: 1,
            },
            dataLabels: {
              position: "top",
              maxItems: 100,
              hideOverflowingLabels: true,
            },
          },
        },

        xaxis: {
          categories: [],
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
        },

        yaxis: [
          // 🞧 Y axis ▶ ratings
          {
            seriesName: this.$t(
              "gift_card.dashboard.count_widget.chart.new_cards",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t("gift_card.dashboard.count_widget.chart.new_cards"),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0a");
              },
            },
          },
          // 🞧 Y axis ▶ rating value
          {
            opposite: true,
            seriesName: this.$t(
              "gift_card.dashboard.count_widget.chart.used_cards",
            ),
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: false,
            },
            title: {
              text: this.$t(
                "gift_card.dashboard.count_widget.chart.used_cards",
              ),
            },

            labels: {
              formatter: function (value, timestamp, index) {
                return numeral(value).format("0a");
              },
            },
          },
        ],
      },

      series: [
        {
          type: "line",
          name: this.$t("gift_card.dashboard.count_widget.chart.new_card_name"),
          data: [],
        },

        {
          type: "column",
          name: this.$t(
            "gift_card.dashboard.count_widget.chart.used_card_name",
          ),
          data: [],
        },
      ],
    };
  },

  computed: {
    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },
    lastWeekData() {
      return this.timeSeries.lastWeekData();
    },

    previousWeekData() {
      return this.timeSeries.previousWeekData();
    },

    totalUsed30Days() {
      return this.timeSeries.totalOf("used");
    },
  },

  created() {
    this.options.xaxis.categories =
      this.timeSeries.arrayOfTimeAbsoluteForceInterpolateZero("created_at");

    this.series[0].data = this.timeSeries.arrayOfForceInterpolateZero(
      "added",
      true,
      "created_at",
    );

    this.series[1].data = this.timeSeries.arrayOfForceInterpolateZero(
      "used",
      true,
      "created_at",
    );
  },
  mounted() {},
  beforeUnmount() {},
};
</script>

<style lang="scss" scoped>
h6 {
  font-size: 1.5rem;
  font-weight: 400;
}
</style>
