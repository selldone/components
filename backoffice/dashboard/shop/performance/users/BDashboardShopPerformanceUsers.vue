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
    <p
      class="mb-2"
      :class="
        modern
          ? 'sd-modern-eyebrow d-flex align-center ga-1'
          : 'font--14 font-weight-bold'
      "
    >
      {{ $t("admin_shop.dashboard.performance.users") }}
      <v-btn
        v-if="modern"
        class="sd-modern-icon-button sd-modern-info-button"
        icon
        variant="text"
        :aria-label="
          $t('global.commons.help') +
          ' · ' +
          $t('admin_shop.dashboard.performance.users')
        "
      >
        <v-icon icon="info_outline" size="16" aria-hidden="true" />
        <v-tooltip
          activator="parent"
          location="top"
          :open-on-click="true"
          :open-on-focus="true"
          interactive
          content-class="sd-modern-tooltip text-start"
        >
          <p class="sd-modern-tooltip__body">
            {{
              $t("admin_shop.dashboard.modern.snapshot_users_brief", {
                days: timeSeries.days,
              })
            }}
          </p>
        </v-tooltip>
      </v-btn>
    </p>
    <h3 :class="modern ? 'b-dashboard-performance-stat__value' : 'font--20'">
      <span>
        {{
          modern && !Number.isFinite(todayDataOffset?.users)
            ? "—"
            : numeralFormat(
                todayDataOffset ? todayDataOffset.users : 0,
                "0.[00]a",
              )
        }}
      </span>

      <u-chip-change
        v-if="has_yesterdayData"
        :title="$t('global.commons.change')"
        :value="change_users"
        class="ms-2"
        density="compact"
      ></u-chip-change>
    </h3>
    <p
      v-if="modern && weeklyComparison?.available"
      class="b-dashboard-performance-stat__weekly"
    >
      <span>{{ $t("global.commons.new_users") }} ·</span>
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
      :height="48"
      :keys="['users_add']"
      :time-series="timeSeries"
      :value-titles="[$t('global.commons.new_users')]"
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
  name: "BDashboardShopPerformanceUsers",
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

    change_users() {
      return this.todayDataOffset.users_add;
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
