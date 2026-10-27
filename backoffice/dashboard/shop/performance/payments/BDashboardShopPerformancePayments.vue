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
    class="text-start h-100 d-flex flex-column"
    :class="{
      'b-dashboard-performance-stat b-dashboard-performance-payments': modern,
    }"
  >
    <div
      class="d-flex mb-2"
      :class="{ 'b-dashboard-performance-payments__header': modern }"
    >
      <p
        class="flex-grow-1 m-0"
        :class="
          modern
            ? 'sd-modern-eyebrow d-flex align-center ga-1'
            : 'font--14 font-weight-bold'
        "
      >
        {{ $t("admin_shop.dashboard.performance.payments") }}
        <v-btn
          v-if="modern"
          class="sd-modern-icon-button sd-modern-info-button"
          icon
          variant="text"
          :aria-label="
            $t('global.commons.help') +
            ' · ' +
            $t('admin_shop.dashboard.performance.payments')
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
              {{ $t("admin_shop.dashboard.modern.snapshot_currency_help") }}
            </p>
            <p class="sd-modern-tooltip__body">
              {{ $t("admin_shop.dashboard.modern.snapshot_weekly_help") }}
            </p></v-tooltip
          >
        </v-btn>
      </p>

      <b
        v-if="payments[selected_currency] !== undefined"
        :caption="$t('global.commons.total')"
        class="sub-caption b-12px me-1"
        :class="{ 'b-dashboard-performance-payments__total': modern }"
      >
        <u-price
          :amount="payments[selected_currency]"
          :currency="selected_currency"
        ></u-price>
      </b>
    </div>

    <v-row no-gutters style="min-height: 29px">
      <div class="flex-grow-1" :class="{ 'min-width-200': !modern }">
        <div
          v-for="finance in displayed_finances"
          :key="finance.currency"
          :title="title"
          :class="modern ? 'b-dashboard-performance-stat__payment' : 'font--20'"
        >
          <u-currency-icon
            v-if="modern"
            :currency="finance.currency"
            flag-only
            small
          />
          <span
            v-if="modern"
            class="b-dashboard-performance-stat__currency-code"
            >{{ finance.currency }}</span
          >
          <u-price :amount="finance.pay" :currency="finance.currency"></u-price>

          <u-chip-change
            v-if="!modern || previousSnapshot"
            :currency="finance.currency"
            :title="$t('global.commons.change')"
            :value="changePay(finance.currency)"
            :class="{ 'ms-2': !modern }"
            density="compact"
          >
          </u-chip-change>
          <p
            v-if="modern && weeklyComparison?.[finance.currency]?.available"
            class="b-dashboard-performance-stat__weekly"
          >
            <v-icon
              v-if="weeklyComparison?.[finance.currency].change"
              :icon="
                weeklyComparison?.[finance.currency].change < 0
                  ? 'arrow_drop_down'
                  : 'arrow_drop_up'
              "
              :color="
                weeklyComparison?.[finance.currency].change < 0
                  ? 'error'
                  : 'success'
              "
              size="18"
              aria-hidden="true"
            />
            <span v-if="weeklyComparison?.[finance.currency].new_activity">{{
              $t("admin_shop.dashboard.modern.new_activity")
            }}</span>
            <span v-else
              >{{
                numeralFormat(
                  weeklyComparison?.[finance.currency].value,
                  "0.[0]",
                )
              }}%</span
            >
            <span>{{
              $t(
                weeklyComparison?.[finance.currency].days === 1
                  ? "admin_shop.dashboard.modern.comparison_previous_day"
                  : "admin_shop.dashboard.modern.comparison_previous_days",
                { days: weeklyComparison?.[finance.currency].days },
              )
            }}</span>
          </p>
        </div>
      </div>
      <u-currency-input
        v-if="available_currencies.length > 1"
        v-model="selected_currency"
        :active-currencies="available_currencies"
        :return-object="false"
        :class="
          modern
            ? 'b-dashboard-performance-stat__currency'
            : 'max-w-150 flex-grow-0 my-3'
        "
        dense
        flat
        hide-details
        small
        variant="text"
      ></u-currency-input>
    </v-row>

    <v-spacer></v-spacer>
    <time-series-inline-chart
      v-if="timeSeries"
      :key="modern ? selected_currency : undefined"
      :colors="[
        modern
          ? (GetCurrency(selected_currency)?.gradient[0] ?? '#1976D2')
          : '#1976D2',
      ]"
      :finance-currency="selected_currency"
      :height="48"
      :keys="['pay']"
      :time-series="timeSeries"
      :value-titles="[selected_currency]"
      class="w-100"
      :grid="!modern"
      :flat-color="modern"
      total-mode
      :type="modern ? 'line' : 'bar'"
    ></time-series-inline-chart>
  </div>
</template>

<script lang="ts">
import TimeSeriesInlineChart from "../../../../chart/TimeSeriesInlineChart.vue";
import UChipChange from "../../../../../ui/chip/change/UChipChange.vue";
import UCurrencyInput from "../../../../../ui/currency/input/UCurrencyInput.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import UCurrencyIcon from "../../../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BDashboardShopPerformancePayments",
  mixins: [DateMixin, CurrencyMixin],

  components: {
    UCurrencyIcon,
    UCurrencyInput,
    UChipChange,
    TimeSeriesInlineChart,
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
    selected_currency: null,
  }),
  computed: {
    todayDataOffset() {
      return this.modern ? this.snapshot : this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.modern
        ? this.previousSnapshot
        : this.timeSeries.yesterdayDataOffset();
    },
    available_currencies() {
      return Object.keys(this.payments);
    },
    displayed_finances() {
      const finances = this.todayDataOffset?.finances;
      if (!this.modern || !Array.isArray(finances) || finances.length)
        return finances || [];
      const currencies = this.available_currencies.length
        ? this.available_currencies
        : [this.user_selected_currency];
      return currencies.map((currency) => ({ currency, pay: 0 }));
    },
    title() {
      return !this.todayDataOffset ||
        this.isToday(this.todayDataOffset.created_at)
        ? this.$t("admin_shop.dashboard.performance.title")
        : this.getLocalDateString(this.todayDataOffset.created_at);
    },
    payments() {
      return this.timeSeries.financeTotalOf("pay", true);
    },
    user_selected_currency() {
      return this.GetUserSelectedCurrency().code;
    },
  },
  watch: {
    available_currencies: {
      immediate: true,
      handler(currencies) {
        if (currencies.includes(this.selected_currency)) return;

        this.selected_currency = currencies.includes(
          this.user_selected_currency,
        )
          ? this.user_selected_currency
          : (currencies[0] ?? this.user_selected_currency);
      },
    },
    user_selected_currency(code) {
      if (
        !this.available_currencies.length ||
        this.available_currencies.includes(code)
      ) {
        this.selected_currency = code;
      }
    },
  },

  methods: {
    changePay(currency) {
      //  console.log('currency',currency)

      // console.log('yesterdayData',this.yesterdayData)
      const today_pay = this.todayDataOffset
        ? this.todayDataOffset.finances.find(
            (item) => item.currency === currency,
          )
        : null;
      const yesterday_pay = this.yesterdayDataOffset
        ? this.yesterdayDataOffset.finances.find(
            (item) => item.currency === currency,
          )
        : null;

      // console.log('find yesterday',yesterday_pay)

      return (
        (today_pay ? today_pay.pay : 0) -
        (yesterday_pay ? yesterday_pay.pay : 0)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.b-dashboard-performance-payments {
  container-type: inline-size;
}

@container (max-width: 240px) {
  .b-dashboard-performance-payments__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .b-dashboard-performance-payments__total {
    display: inline-flex;
    align-items: baseline;
    gap: 5px;
    max-width: 100%;
    color: var(--sd-modern-muted);
    font-size: 11px;
    font-weight: 500;
    line-height: 1.5;

    &::after {
      position: static;
      padding: 0;
      transform: none !important;
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
