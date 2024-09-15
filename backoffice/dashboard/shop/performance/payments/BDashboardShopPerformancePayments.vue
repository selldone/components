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
  <div class="text-start h-100 d-flex flex-column">
    <div class="d-flex mb-2">
      <p class="font--14 font-weight-bold flex-grow-1 m-0">
        {{ $t("admin_shop.dashboard.performance.payments") }}
      </p>

      <b v-if="payments[selected_currency]" :caption="$t('global.commons.total')" class="sub-caption b-12px me-1">
        <u-price
          :amount="payments[selected_currency]"
          :currency="selected_currency"
        ></u-price>
      </b>
    </div>

    <v-row no-gutters style="min-height: 29px">
      <div class="flex-grow-1 min-width-200">
        <div
          v-for="finance in todayDataOffset.finances"
          :key="finance.currency"
          :title="title"
          class="font--20"
        >
          <u-price :amount="finance.pay" :currency="finance.currency"></u-price>

          <u-chip-change
            :currency="finance.currency"
            :title="$t('global.commons.change')"
            :value="changePay(finance.currency)"
            class="ms-2"
            density="compact"
          >
          </u-chip-change>
        </div>
      </div>
      <u-currency-input
        v-if="available_currencies.length > 1"
        v-model="selected_currency"
        :active-currencies="available_currencies"
        :return-object="false"
        class="max-w-150 flex-grow-0 my-3"
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
      :colors="['#1976D2']"
      :finance-currency="selected_currency"
      :height="48"
      :keys="['pay']"
      :time-series="timeSeries"
      :value-titles="[selected_currency]"
      class="w-100"
      grid
      total-mode
      type="bar"
    ></time-series-inline-chart>
  </div>
</template>

<script>
import TimeSeriesInlineChart from "../../../../chart/TimeSeriesInlineChart.vue";
import UChipChange from "../../../../../ui/chip/change/UChipChange.vue";
import UCurrencyInput from "../../../../../ui/currency/input/UCurrencyInput.vue";

export default {
  name: "BDashboardShopPerformancePayments",
  components: { UCurrencyInput, UChipChange, TimeSeriesInlineChart },
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
    selected_currency: null,
  }),
  computed: {
    todayDataOffset() {
      return this.timeSeries.todayDataOffset();
    },
    yesterdayDataOffset() {
      return this.timeSeries.yesterdayDataOffset();
    },
    available_currencies() {
      return Object.keys(this.payments);
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
    user_selected_currency(code) {
      if (this.available_currencies.includes(code)) {
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

  created() {
    if (this.available_currencies.includes(this.user_selected_currency)) {
      this.selected_currency = this.user_selected_currency;
    } else if (this.available_currencies.length)
      this.selected_currency = this.available_currencies[0];
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
