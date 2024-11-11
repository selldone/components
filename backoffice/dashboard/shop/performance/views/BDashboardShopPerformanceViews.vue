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
  <div class="h-100 d-flex flex-column">
    <div class="d-flex mb-2">
      <p class="font--14 font-weight-bold flex-grow-1 m-0">
        {{ $t("admin_shop.dashboard.performance.views") }}
      </p>
      <b
        :caption="$t('global.commons.total')"
        class="sub-caption b-12px me-1"
        >{{ numeralFormat(total_views, "0.[0]a") }}</b
      >
    </div>
    <h3 class="font--20">
      <span :title="title">
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
      grid
      type="bar"
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
      return this.timeSeries.hasYesterdayData();
    },

    todayDataOffset() {
      return this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.timeSeries.yesterdayDataOffset();
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
