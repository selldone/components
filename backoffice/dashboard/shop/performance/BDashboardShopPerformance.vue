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
    :active="true"
    :sub-title="$t('admin_shop.dashboard.performance.title_small')"
    :title="title"
  >
    <template v-slot:top-left>
      <img :src="performance_icon" height="24" width="24" />
    </template>
    <template v-slot:actions>
      <v-container v-if="has_todayData" class="text-start" fluid>
        <v-row>
          <!-- ━━━━━━━━━━━━━━━━━━━━ BDashboardShopPerformance > Users ━━━━━━━━━━━━━━━━━━━━ -->

          <v-col class="border-end-grater-md" cols="6" md="3">
            <b-dashboard-shop-performance-users
              :shop="shop"
              :time-series="timeSeries"
            ></b-dashboard-shop-performance-users>
          </v-col>

          <!-- ━━━━━━━━━━━━━━━━━━━━ BDashboardShopPerformance > Views ━━━━━━━━━━━━━━━━━━━━ -->

          <v-col class="border-end-grater-md" cols="6" md="3">
            <b-dashboard-shop-performance-views
              :shop="shop"
              :time-series="timeSeries"
            ></b-dashboard-shop-performance-views>
          </v-col>

          <!-- ━━━━━━━━━━━━━━━━━━━━ BDashboardShopPerformance > Sales ━━━━━━━━━━━━━━━━━━━━ -->

          <v-col class="border-end-grater-md" cols="12" md="3" sm="6">
            <b-dashboard-shop-performance-orders
              :shop="shop"
              :time-series="timeSeries"
            ></b-dashboard-shop-performance-orders>
          </v-col>

          <!-- ━━━━━━━━━━━━━━━━━━━━ BDashboardShopPerformance > Payments ━━━━━━━━━━━━━━━━━━━━ -->

          <v-col cols="12" md="3" sm="6">
            <b-dashboard-shop-performance-payments
              :shop="shop"
              :time-series="timeSeries"
            >
            </b-dashboard-shop-performance-payments>
          </v-col>
        </v-row>
      </v-container>
      <p
        v-else
        class="py-2 text-center text-h4 font-weight-light op-0-5 pen usn"
      >
        <v-icon class="me-1">sentiment_very_dissatisfied</v-icon>
        {{ $t("admin_shop.dashboard.performance.no_visitor_today") }}
      </p>
    </template>
  </s-widget-box>
</template>

<script>
import BDashboardShopPerformancePayments from "../../../dashboard/shop/performance/payments/BDashboardShopPerformancePayments.vue";
import BDashboardShopPerformanceOrders from "../../../dashboard/shop/performance/orders/BDashboardShopPerformanceOrders.vue";
import BDashboardShopPerformanceUsers from "../../../dashboard/shop/performance/users/BDashboardShopPerformanceUsers.vue";
import BDashboardShopPerformanceViews from "../../../dashboard/shop/performance/views/BDashboardShopPerformanceViews.vue";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

export default {
  name: "BDashboardShopPerformance",
  components: {
    BDashboardShopPerformanceViews,
    BDashboardShopPerformanceUsers,
    BDashboardShopPerformanceOrders,
    BDashboardShopPerformancePayments,
    SWidgetBox,
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
    start_date: null,
    end_date: null,
  }),

  computed: {
    title() {
      return !this.todayDataOffset ||
        this.isToday(this.todayDataOffset.created_at)
        ? this.$t("admin_shop.dashboard.performance.title")
        : this.getLocalDateString(this.todayDataOffset.created_at);
    },

    has_todayData() {
      return this.timeSeries.hasTodayDataOffset();
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

    performance_icon() {
      if (!this.has_todayData)
        return require("../../../dashboard/shop/performance/assets/shop-performance/shop-perfomance-normal.svg");

      if (this.today_sells > 4 * this.yesterday_sells)
        return require("../../../dashboard/shop/performance/assets/shop-performance/shop-perfomance-excelent.svg");
      else if (this.today_sells > 2 * this.yesterday_sells)
        return require("../../../dashboard/shop/performance/assets/shop-performance/shop-perfomance-well.svg");
      else if (this.today_sells > 1.5 * this.yesterday_sells)
        return require("../../../dashboard/shop/performance/assets/shop-performance/shop-perfomance-good.svg");
      else if (
        this.today_sells === 0 ||
        this.today_sells < 0.5 * this.yesterday_sells
      )
        return require("../../../dashboard/shop/performance/assets/shop-performance/shop-perfomance-bad.svg");

      return require("../../../dashboard/shop/performance/assets/shop-performance/shop-perfomance-normal.svg");
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
