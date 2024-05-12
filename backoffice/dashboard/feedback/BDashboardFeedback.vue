<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
    :sub-title="$t('widgets.overview.title_small')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span> ${$t(
      'widgets.overview.title',
    )} </h5>`"
    extended
    icon="favorite"
  >
    <template v-slot:actions>
      <div v-for="item in available_types" :key="item.key">
        <u-chart-bar
          :colors="[item.color]"
          :dataset="getArray(item.key)"
          :end-date="timeSeries.endDate"
          :height="50"
          :start-date="timeSeries.startDate"
          narrow
        >
          <template v-slot:title>
            <i :class="item.icon" :style="{ color: item.color }" class="me-1" />
            {{ $t(item.name) }}
          </template>
        </u-chart-bar>
      </div>
    </template>

    <template v-slot:bottom>
      <v-container class="text-center" fluid>
        <div class="mb-3 d-flex align-center">
          <span class="text-muted">
            {{
              result_period === "day"
                ? $t("widgets.overview.report_today")
                : result_period === "week"
                  ? $t("widgets.overview.report_last7days")
                  : $t("widgets.overview.report_last30days")
            }}
          </span>
          <v-spacer></v-spacer>

          <v-btn-toggle
            v-model="result_period"
            density="compact"
            mandatory
            rounded="xl"
            selected-class="black-flat"
            variant="outlined"
          >
            <v-btn size="small" value="day">
              <v-icon> fa:fas fa-calendar-day</v-icon>
            </v-btn>
            <v-btn size="small" value="week">
              <v-icon> fa:fas fa-calendar-week</v-icon>
            </v-btn>
            <v-btn size="small" value="month">
              <v-icon> fa:fas fa-calendar</v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-row align="center" dense justify="center">
          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-comments text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.comments
                    : result_period === "week"
                      ? lastWeekData.comments
                      : lastMonthData.comments,
                  "0.[0]a",
                )
              }}

              <up-down-icon :value="upDownState('comments')"></up-down-icon>
            </p>

            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.comments") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-heart text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.likes
                    : result_period === "week"
                      ? lastWeekData.likes
                      : lastMonthData.likes,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('likes')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small> {{ $t("widgets.overview.likes") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-star text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.favorites
                    : result_period === "week"
                      ? lastWeekData.favorites
                      : lastMonthData.favorites,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('favorites')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.favorites") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-bolt text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.powers
                    : result_period === "week"
                      ? lastWeekData.powers
                      : lastMonthData.powers,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('powers')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.powers") }} </small>
            </p>
          </v-col>

          <v-col class="min-width-100" cols="6" lg="2" md="3" sm="4">
            <p class="single-line">
              <i class="fas fa-eye text-muted" />
              {{
                numeralFormat(
                  result_period === "day"
                    ? todayData.views
                    : result_period === "week"
                      ? lastWeekData.views
                      : lastMonthData.views,
                  "0.[0]a",
                )
              }}
              <up-down-icon :value="upDownState('views')"></up-down-icon>
            </p>
            <p class="text-muted mb-0 mr">
              <small>{{ $t("widgets.overview.views") }} </small>
            </p>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </s-widget-box>
</template>

<script>
import SWidgetBox from "../../../ui/widget/box/SWidgetBox.vue";
import UChartBar from "../../../ui/chart/bar/UChartBar.vue";
import UpDownIcon from "../../../ui/icon/UpDownIcon.vue";

export default {
  name: "BDashboardFeedback",
  components: {
    UpDownIcon,
    UChartBar,
    SWidgetBox,
  },
  props: {
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    result_period: "day",

    types: [
      {
        name: "widgets.overview.wishlist",
        key: "wishlist",
        color: "#7B1FA2",
        icon: "fas fa-plus-circle",
        permanent: true,
      },

      {
        name: "widgets.overview.comments",
        key: "comments",
        color: "#1976D2",
        icon: "fas fa-comments",
        permanent: true,
      },
      {
        name: "widgets.overview.likes",
        key: "likes",
        color: "#F44336",
        icon: "fas fa-heart",
      },
      {
        name: "widgets.overview.favorites",
        key: "favorites",
        color: "#FFA000",
        icon: "fas fa-star",
        permanent: true,
      },
      {
        name: "widgets.overview.powers",
        key: "powers",
        color: "#689F38",
        icon: "fas fa-bolt",
      },
      {
        name: "widgets.overview.views",
        key: "views",
        color: "#455A64",
        icon: "fas fa-eye",
        permanent: true,
      },
    ],
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
          this.$route.params.vendor_id &&
          this.$route.matched.some((record) => record.meta.vendor)
      );
    },


    available_types() {
      return this.types.filter(
        (item) => item.permanent || this.getArray(item.key).some((x) => x > 0),
      );
    },

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

    lastMonthData() {
      return this.timeSeries.lastMonthData();
    },
  },
  methods: {
    upDownState(key) {
      if (this.result_period === "day") {
        return (
          (this.todayData ? this.todayData[key] : 0) -
          (this.yesterdayData ? this.yesterdayData[key] : 0)
        );
      } else if (this.result_period === "week") {
        return (
          (this.lastWeekData ? this.lastWeekData[key] : 0) -
          (this.previousWeekData ? this.previousWeekData[key] : 0)
        );
      }
    },

    getArray(key) {
      return this.timeSeries
        .arrayOfForceInterpolateZero(key)
        .map((val) => [val >= 0 ? val : 0]);
    },
  },
};
</script>

<style scoped></style>
