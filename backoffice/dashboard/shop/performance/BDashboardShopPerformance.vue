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
  <section
    v-if="modern"
    class="b-dashboard-performance sd-modern-widget text-start"
  >
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="20" aria-hidden="true">insights</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">{{ title }}</h2>
          <p class="sd-modern-subtitle">
            {{ $t("admin_shop.dashboard.performance.title_small") }}
          </p>
        </div>
      </div>
      <v-dialog
        max-width="560"
        scrollable
        aria-labelledby="shop-snapshot-details-title"
      >
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="sd-modern-button sd-modern-button--inline"
            variant="text"
            v-tooltip="$t('global.commons.detail')"
          >
            <v-icon start size="small">info_outline</v-icon>
            {{ $t("global.commons.detail") }}
          </v-btn>
        </template>
        <template #default="{ isActive }">
          <v-card
            class="b-dashboard-performance-details sd-modern-widget text-start"
          >
            <header class="sd-modern-header">
              <h2 id="shop-snapshot-details-title" class="sd-modern-title-text">
                {{ $t("admin_shop.dashboard.modern.snapshot_details_title") }}
              </h2>
              <v-btn
                icon
                class="sd-modern-icon-button"
                variant="text"
                :aria-label="$t('global.actions.close')"
                v-tooltip="$t('global.actions.close')"
                @click="isActive.value = false"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </header>
            <v-card-text class="pa-0">
              <dl class="sd-modern-form-meta">
                <div>
                  <dt class="sd-modern-label">
                    {{ $t("admin_shop.dashboard.modern.snapshot_day") }}
                  </dt>
                  <dd>
                    {{
                      todayDataOffset?.created_at
                        ? getLocalDateString(todayDataOffset.created_at)
                        : $t("global.commons.not_available")
                    }}
                  </dd>
                </div>
                <div>
                  <dt class="sd-modern-label">
                    {{
                      $t("admin_shop.dashboard.modern.snapshot_previous_day")
                    }}
                  </dt>
                  <dd>
                    {{
                      yesterdayDataOffset?.created_at
                        ? getLocalDateString(yesterdayDataOffset.created_at)
                        : $t("global.commons.not_available")
                    }}
                  </dd>
                </div>
              </dl>
              <p>{{ $t("admin_shop.dashboard.modern.snapshot_day_help") }}</p>
              <p>{{ $t("admin_shop.dashboard.modern.snapshot_users_help") }}</p>
              <p>
                {{
                  $t("admin_shop.dashboard.modern.snapshot_period_help", {
                    days: timeSeries.days,
                  })
                }}
              </p>
              <p class="mb-0">
                {{ $t("admin_shop.dashboard.modern.snapshot_currency_help") }}
              </p>
              <p class="mt-3 mb-0">
                {{ $t("admin_shop.dashboard.modern.snapshot_weekly_help") }}
              </p>
            </v-card-text>
          </v-card>
        </template>
      </v-dialog>
    </header>
    <div
      v-if="has_todayData"
      class="sd-modern-stat-grid b-dashboard-performance__stats"
    >
      <b-dashboard-shop-performance-users
        :shop="shop"
        :time-series="timeSeries"
        :snapshot="snapshot_rows.current"
        :previous-snapshot="snapshot_rows.previous"
        :weekly-comparison="weekly_comparisons.users"
        modern
      />
      <b-dashboard-shop-performance-views
        :shop="shop"
        :time-series="timeSeries"
        :snapshot="snapshot_rows.current"
        :previous-snapshot="snapshot_rows.previous"
        :weekly-comparison="weekly_comparisons.views"
        modern
      />
      <b-dashboard-shop-performance-orders
        :shop="shop"
        :time-series="timeSeries"
        :snapshot="snapshot_rows.current"
        :previous-snapshot="snapshot_rows.previous"
        :weekly-comparison="weekly_comparisons.orders"
        modern
      />
      <b-dashboard-shop-performance-payments
        :shop="shop"
        :time-series="timeSeries"
        :snapshot="snapshot_rows.current"
        :previous-snapshot="snapshot_rows.previous"
        :weekly-comparison="weekly_comparisons.payments"
        modern
      />
    </div>
  </section>
  <s-widget-box
    v-else
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

<script lang="ts">
import BDashboardShopPerformancePayments from "../../../dashboard/shop/performance/payments/BDashboardShopPerformancePayments.vue";
import BDashboardShopPerformanceOrders from "../../../dashboard/shop/performance/orders/BDashboardShopPerformanceOrders.vue";
import BDashboardShopPerformanceUsers from "../../../dashboard/shop/performance/users/BDashboardShopPerformanceUsers.vue";
import BDashboardShopPerformanceViews from "../../../dashboard/shop/performance/views/BDashboardShopPerformanceViews.vue";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { getPeriodComparison, getReportSnapshot } from "./periodComparison.ts";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";

export default {
  name: "BDashboardShopPerformance",
  mixins: [DateMixin],

  components: {
    BDashboardShopPerformanceViews,
    BDashboardShopPerformanceUsers,
    BDashboardShopPerformanceOrders,
    BDashboardShopPerformancePayments,
    SWidgetBox,
  },
  props: {
    modern: { type: Boolean, default: false },
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
    snapshot_rows() {
      return getReportSnapshot(this.timeSeries);
    },
    weekly_comparisons() {
      // The displayed snapshot may be yesterday when midnight precedes the next data refresh.
      const snapshot_date = DateConverter.convertToLocalTime(
        this.todayDataOffset?.created_at,
        true,
      );
      const order_keys = [
        "sell_products_physical",
        "sell_products_virtual",
        "sell_products_file",
        "sell_products_service",
        "sell_avocados",
        "hyper_pays",
      ];
      const currencies = new Set(
        (this.timeSeries.raw_data || []).flatMap((row) =>
          (row.finances || []).map((finance) => finance.currency),
        ),
      );
      return {
        users: getPeriodComparison(
          this.timeSeries,
          (row) => row.users_add,
          snapshot_date,
        ),
        views: getPeriodComparison(
          this.timeSeries,
          (row) => row.views,
          snapshot_date,
        ),
        orders: getPeriodComparison(
          this.timeSeries,
          (row) =>
            order_keys.every((key) => Number.isFinite(row[key]))
              ? order_keys.reduce((sum, key) => sum + row[key], 0)
              : null,
          snapshot_date,
        ),
        payments: Object.fromEntries(
          [...currencies].map((currency) => [
            currency,
            getPeriodComparison(
              this.timeSeries,
              (row) => {
                if (!Array.isArray(row.finances)) return null;
                const finances = row.finances.filter(
                  (finance) => finance.currency === currency,
                );
                return finances.every((finance) => Number.isFinite(finance.pay))
                  ? finances.reduce((sum, finance) => sum + finance.pay, 0)
                  : null;
              },
              snapshot_date,
            ),
          ]),
        ),
      };
    },
    title() {
      return !this.todayDataOffset ||
        this.isToday(this.todayDataOffset.created_at)
        ? this.$t("admin_shop.dashboard.performance.title")
        : this.getLocalDateString(this.todayDataOffset.created_at);
    },

    has_todayData() {
      return this.modern
        ? !!this.snapshot_rows.current
        : this.timeSeries.hasTodayDataOffset();
    },

    todayDataOffset() {
      return this.modern
        ? this.snapshot_rows.current
        : this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.modern
        ? this.snapshot_rows.previous
        : this.timeSeries.yesterdayDataOffset();
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
.b-dashboard-performance-details {
  .sd-modern-header {
    margin-block-end: 16px;
  }
  .v-card-text {
    font-size: 13px;
    line-height: 1.7;
  }
  .v-card-text > p {
    margin-block-end: 12px;
  }
}
.b-dashboard-performance {
  &__stats {
    padding-block: 4px 0;
    gap: 28px;
  }

  &__stats > * {
    min-width: 0;
  }

  :deep(.b-dashboard-performance-stat__value) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    margin-block: 8px 4px;
    font-size: 28px;
    font-weight: 600;
    line-height: 1.35;
    font-variant-numeric: tabular-nums;
  }

  :deep(.b-dashboard-performance-stat__payment) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 20px;
    font-weight: 600;
    line-height: 1.5;
  }

  :deep(.b-dashboard-performance-stat__currency) {
    flex: 0 0 100%;
    max-width: 150px;
    margin-block: 4px;
  }

  :deep(.b-dashboard-performance-stat__currency-code) {
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 500;
  }

  :deep(.b-dashboard-performance-stat .s--change-chip) {
    color: var(--sd-modern-muted) !important;
    background-color: transparent !important;
    padding-inline: 0;
    font-size: 12px;
  }

  // Modern chips have no inset; Vuetify's negative start margin clips the caret.
  :deep(.b-dashboard-performance-stat .s--change-chip .v-icon--start) {
    margin-inline-start: 0;
    margin-inline-end: 4px;
    flex-shrink: 0;
  }

  :deep(.b-dashboard-performance-stat__weekly) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 3px;
    margin-block: 0 16px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
  }

  :deep(
    .b-dashboard-performance-stat__payment
      > .b-dashboard-performance-stat__weekly
  ) {
    flex-basis: 100%;
    margin-block-end: 4px;
  }

  @media (max-width: 600px) {
    &__stats {
      gap: 28px 20px;
    }
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
