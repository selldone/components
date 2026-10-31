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
  <div
    class="text-start h-100 d-flex flex-column"
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
        {{ $t("admin_shop.dashboard.performance.orders") }}
        <v-btn
          v-if="modern"
          class="sd-modern-icon-button sd-modern-info-button"
          icon
          variant="text"
          :aria-label="
            $t('global.commons.help') +
            ' · ' +
            $t('admin_shop.dashboard.performance.orders')
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
                $t("admin_shop.dashboard.modern.snapshot_orders_brief", {
                  days: timeSeries.days,
                })
              }}
            </p>
          </v-tooltip>
        </v-btn>
      </p>
      <b
        :caption="$t('global.commons.total')"
        class="sub-caption b-12px me-1"
        >{{ numeralFormat(total_sells, "0.[0]a") }}</b
      >
    </div>

    <h3 :class="modern ? 'b-dashboard-performance-stat__value' : 'font--20'">
      <span :title="title">
        {{ numeralFormat(today_sells, "0.[00]a") }}
      </span>

      <u-chip-change
        v-if="has_yesterdayData"
        :title="$t('global.commons.change')"
        :value="change_sells"
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
      :height="48"
      :keys="[
        'sell_products_physical',
        'sell_products_virtual',
        'sell_products_file',
        'sell_products_service',
        'sell_avocados',
        'hyper_pays',
      ]"
      :time-series="timeSeries"
      :value-titles="[$t('global.commons.success_orders')]"
      class="w-100"
      :grid="!modern"
      :flat-color="modern"
      total-mode
      :type="modern ? 'line' : 'bar'"
    ></time-series-inline-chart>
  </div>
</template>

<script lang="ts">
import UChipChange from "../../../../../ui/chip/change/UChipChange.vue";
import TimeSeriesInlineChart from "../../../../chart/TimeSeriesInlineChart.vue";
import { isEmpty } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BDashboardShopPerformanceOrders",
  mixins: [DateMixin],

  components: { TimeSeriesInlineChart, UChipChange },
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

  computed: {
    title() {
      return !this.todayDataOffset ||
        this.isToday(this.todayDataOffset.created_at)
        ? this.$t("admin_shop.dashboard.performance.title")
        : this.getLocalDateString(this.todayDataOffset.created_at);
    },

    has_yesterdayData() {
      if (this.modern) return !!this.previousSnapshot;
      return !isEmpty(this.yesterdayDataOffset);
    },

    todayDataOffset() {
      return this.modern ? this.snapshot : this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.modern
        ? this.previousSnapshot
        : this.timeSeries.yesterdayDataOffset();
    },

    total_sells() {
      return (
        this.timeSeries.totalOf("sell_products_physical") +
        this.timeSeries.totalOf("sell_products_virtual") +
        this.timeSeries.totalOf("sell_products_file") +
        this.timeSeries.totalOf("sell_products_service") +
        this.timeSeries.totalOf("sell_avocados") +
        this.timeSeries.totalOf("hyper_pays")
      );
    },

    today_sells() {
      if (!this.todayDataOffset) return 0;
      return (
        this.todayDataOffset.sell_products_physical +
        this.todayDataOffset.sell_products_virtual +
        this.todayDataOffset.sell_products_file +
        this.todayDataOffset.sell_products_service +
        this.todayDataOffset.sell_avocados +
        this.todayDataOffset.hyper_pays
      );
    },
    yesterday_sells() {
      if (!this.yesterdayDataOffset) return 0;
      return (
        this.yesterdayDataOffset.sell_products_physical +
        this.yesterdayDataOffset.sell_products_virtual +
        this.yesterdayDataOffset.sell_products_file +
        this.yesterdayDataOffset.sell_products_service +
        this.yesterdayDataOffset.sell_avocados +
        this.yesterdayDataOffset.hyper_pays
      );
    },
    change_sells() {
      return this.today_sells - this.yesterday_sells;
    },
  },
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
