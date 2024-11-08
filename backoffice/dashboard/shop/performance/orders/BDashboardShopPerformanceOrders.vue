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
  <div class="text-start h-100 d-flex flex-column">
    <div class="d-flex mb-2">
      <p class="font--14 font-weight-bold flex-grow-1 m-0">
        {{ $t("admin_shop.dashboard.performance.orders") }}
      </p>
      <b
        :caption="$t('global.commons.total')"
        class="sub-caption b-12px me-1"
        >{{ numeralFormat(total_sells, "0.[0]a") }}</b
      >
    </div>

    <h3 class="font--20">
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
      grid
      total-mode
      type="bar"
    ></time-series-inline-chart>
  </div>
</template>

<script>
import UChipChange from "../../../../../ui/chip/change/UChipChange.vue";
import TimeSeriesInlineChart from "../../../../chart/TimeSeriesInlineChart.vue";
import { isEmpty } from "lodash-es";

export default {
  name: "BDashboardShopPerformanceOrders",
  components: { TimeSeriesInlineChart, UChipChange },
  props: {
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
      return !isEmpty(this.yesterdayDataOffset);
    },

    todayDataOffset() {
      return this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.timeSeries.yesterdayDataOffset();
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
