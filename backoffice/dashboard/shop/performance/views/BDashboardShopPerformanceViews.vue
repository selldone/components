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
  <div
    class="h-100 d-flex flex-column text-start"
    :class="{ 'b-dashboard-performance-stat': modern }"
  >
    <div class="d-flex mb-2" :class="{ 'flex-wrap ga-1': modern }">
      <p
        class="flex-grow-1 m-0"
        :class="
          modern
            ? 'sd-modern-eyebrow d-flex align-center ga-1'
            : 'font--14 font-weight-bold'
        "
      >
        {{ $t("admin_shop.dashboard.performance.views") }}
        <v-btn
          v-if="modern"
          class="sd-modern-icon-button sd-modern-info-button"
          icon
          variant="text"
          :aria-label="
            $t('global.commons.help') +
            ' · ' +
            $t('admin_shop.dashboard.performance.views')
          "
        >
          <v-icon icon="info_outline" size="16" aria-hidden="true" />
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-click="true"
            :open-on-focus="true"
            interactive
            :max-width="360"
            content-class="sd-modern-tooltip text-start"
          >
            <p class="sd-modern-tooltip__body">
              {{ $t("admin_shop.dashboard.modern.snapshot_day_help") }}
            </p>
            <p class="sd-modern-tooltip__body">
              {{
                $t("admin_shop.dashboard.modern.snapshot_period_help", {
                  days: timeSeries.days,
                })
              }}
            </p>
            <p class="sd-modern-tooltip__body">
              {{ $t("admin_shop.dashboard.modern.snapshot_weekly_help") }}
            </p></v-tooltip
          >
        </v-btn>
      </p>
      <b
        :caption="$t('global.commons.total')"
        class="sub-caption b-12px me-1"
        >{{ numeralFormat(total_views, "0.[0]a") }}</b
      >
    </div>
    <h3 :class="modern ? 'b-dashboard-performance-stat__value' : 'font--20'">
      <span>
        {{
          numeralFormat(todayDataOffset ? todayDataOffset.views : 0, "0.[00]a")
        }}
      </span>

      <u-chip-change
        v-if="has_yesterdayData"
        :title="$t('global.commons.change')"
        :value="change_views"
        class="ms-2"
        density="compact"
      ></u-chip-change>
    </h3>
    <p
      v-if="modern && weeklyComparison?.available"
      class="b-dashboard-performance-stat__weekly"
    >
      <v-icon
        v-if="weeklyComparison.change"
        :icon="
          weeklyComparison.change < 0 ? 'arrow_drop_down' : 'arrow_drop_up'
        "
        :color="weeklyComparison.change < 0 ? 'error' : 'success'"
        size="18"
        aria-hidden="true"
      />
      <span v-if="weeklyComparison.new_activity">{{
        $t("admin_shop.dashboard.modern.new_activity")
      }}</span>
      <span v-else>{{ numeralFormat(weeklyComparison.value, "0.[0]") }}%</span>
      <span>{{
        $t(
          weeklyComparison.days === 1
            ? "admin_shop.dashboard.modern.comparison_previous_day"
            : "admin_shop.dashboard.modern.comparison_previous_days",
          { days: weeklyComparison.days },
        )
      }}</span>
    </p>
    <v-spacer></v-spacer>
    <time-series-inline-chart
      v-if="timeSeries"
      :colors="['#1976D2']"
      :days="timeSeries.days"
      :height="48"
      :keys="['views']"
      :offset_day="timeSeries.offset"
      :time-series="timeSeries"
      :value-titles="[$t('global.commons.views')]"
      class="w-100"
      :grid="!modern"
      :flat-color="modern"
      :type="modern ? 'line' : 'bar'"
    ></time-series-inline-chart>
  </div>
</template>

<script lang="ts">
import UChipChange from "../../../../../ui/chip/change/UChipChange.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import TimeSeriesInlineChart from "../../../../chart/TimeSeriesInlineChart.vue";

export default {
  name: "BDashboardShopPerformanceViews",
  components: {
    TimeSeriesInlineChart,
    UChipChange,
  },
  props: {
    modern: { type: Boolean, default: false },
    weeklyComparison: { type: Object, default: null },
    snapshot: { type: Object, default: null },
    previousSnapshot: { type: Object, default: null },
    shop: {
      required: true,
      type: Object,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    ProductType: ProductType,

    series: [
      {
        type: "line",
        name: "",
        data: [],
      },

      {
        type: "column",
        name: "",
        data: [],
      },
    ],
    funnel_value: [0, 0, 0, 0],
    //funnel_value:[50,10,5,20],

    start_date: null,
    end_date: null,
  }),

  computed: {
    has_yesterdayData() {
      if (this.modern) return !!this.previousSnapshot;
      return this.timeSeries.hasYesterdayData();
    },

    todayDataOffset() {
      return this.modern ? this.snapshot : this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.modern
        ? this.previousSnapshot
        : this.timeSeries.yesterdayDataOffset();
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    change_views() {
      return this.todayDataOffset.views - this.yesterdayDataOffset.views;
    },

    total_views() {
      return this.timeSeries.totalOf("views");
    },
  },

  watch: {},

  methods: {},

  created() {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
