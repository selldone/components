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
    :icon-to="{
      name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
      params: { product_id: product.id },
      hash: '#price',
    }"
    :sub-title="
      $t('product_admin.dashboard.finance.title_small', {
        start: getLocalDateString(timeSeries.startDate),
        end: getLocalDateString(timeSeries.endDate),
      })
    "
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
      'product_admin.dashboard.finance.title',
    )} </h5>`"
    icon="fa:fas fa-cash-register"
  >
    <v-card
      v-for="(total, currency) in totalPayAmountFor30days"
      :key="currency"
      class="my-2 shadow-paper rounded-2rem"
    >
      <u-currency-icon
        :currency="currency"
        :title="$t('product_admin.dashboard.finance.currency_unit')"
        class="absolute-top-end m-2"
        flag
        small
      ></u-currency-icon>

      <div class="p-2 d-flex border-between text-center">
        <div class="flex-grow-1">
          <u-price
            :amount="GetFinanceValueByCurrency(todayData, currency, 'pay')"
            :currency="currency"
            :large="$vuetify.display.smAndUp"
            class="font-weight-black d-block"
          ></u-price>
          <small>{{ $t("commons.pay_today") }}</small>
        </div>

        <div class="flex-grow-1 hide-on-small-600">
          <u-price
            :amount="GetFinanceValueByCurrency(yesterdayData, currency, 'pay')"
            :currency="currency"
            :large="$vuetify.display.smAndUp"
            class="font-weight-black d-block"
          ></u-price>
          <small>{{ $t("commons.pay_yesterday") }}</small>
        </div>

        <div class="flex-grow-1">
          <u-price
            :amount="total"
            :currency="currency"
            :large="$vuetify.display.smAndUp"
            class="font-weight-black d-block"
          ></u-price>
          <small>{{ $t("commons.pay_last30days") }}</small>
        </div>
      </div>

      <v-card-subtitle class="py-0">
        {{ $t("product_admin.dashboard.finance.sell_daily") }}:
      </v-card-subtitle>
      <v-card-text>
        <finance-inline-chart
          :colors="GetCurrency(currency).gradient"
          :currency="currency"
          :days="timeSeries.days"
          :finance-keys="['sell', 'pay']"
          :timeSeries="timeSeries"
          :value-titles="[
            $t('admin_shop.dashboard.finance.table.sell'),
            $t('admin_shop.dashboard.finance.table.pay'),
          ]"
          height="68"
        ></finance-inline-chart>
      </v-card-text>
    </v-card>

    <v-row class="mt-8" no-gutters>
      <v-col cols="12" sm="6">
        <v-btn-toggle
          v-model="finance_key"
          :title="$t('product_admin.dashboard.finance.select_mode_title')"
          mandatory
          rounded="xl"
          style="height: 64px"
        >
          <v-btn
            v-for="item in finance_keys"
            :key="item.val"
            :value="item.val"
            size="small"
            stacked
          >
            <img :src="item.image" height="24" />

            <div class="mt-1 tnt">{{ item.title }}</div>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <s-chart-funnel-finance
      :finance-key="finance_key"
      :shop="shop"
      :timeSeries="timeSeries"
      bordered
      class="mt-5"
      style="min-height: 160px"
    ></s-chart-funnel-finance>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import SChartFunnelFinance from "../../../chart/funnel/finance/SChartFunnelFinance.vue";
import FinanceInlineChart from "../../../chart/FinanceInlineChart.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";

export default {
  name: "BProductFinanceCharts",
  components: {
    UCurrencyIcon,
    FinanceInlineChart,
    SChartFunnelFinance,
    SWidgetBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    finance_key: "sell",
  }),

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    finance_keys() {
      return [
        {
          val: "sell",
          title: this.$t("product_admin.dashboard.finance.modes.sell"),
          image: require("../../../../assets/icons/price.svg"),
        },
        {
          val: "pay",
          title: this.$t("product_admin.dashboard.finance.modes.payment"),
          image: require("../../../../assets/icons/payment.svg"),
        },
        {
          val: "discount",
          title: this.$t("product_admin.dashboard.finance.modes.discount"),
          image: require("../../../../assets/icons/discount.svg"),
        },
      ];
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    totalPayAmountFor30days() {
      return this.timeSeries.financeTotalOf("pay");
    },
  },
  created() {},

  methods: {},
};
</script>

<style scoped></style>
