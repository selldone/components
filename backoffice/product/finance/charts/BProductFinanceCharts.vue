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
  <component
    :is="modern ? 'section' : 's-widget-box'"
    :class="{
      'b-product-analytics b-product-finance-modern sd-modern-widget text-start':
        modern,
    }"
    :icon-to="{
      name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
      params: { product_id: product.id },
      hash: '#price',
    }"
    :sub-title="
      modern
        ? undefined
        : $t('product_admin.dashboard.finance.title_small', {
            start: getLocalDateString(timeSeries.startDate),
            end: getLocalDateString(timeSeries.endDate),
          })
    "
    :title="
      modern
        ? undefined
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
            'product_admin.dashboard.finance.title',
          )} </h5>`
    "
    :icon="modern ? undefined : 'fa:fas fa-cash-register'"
  >
    <header v-if="modern" class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon size="18" aria-hidden="true">payments</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("b_product_dashboard.analytics.finance_title") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("b_product_dashboard.analytics.finance_subtitle") }}
          </p>
        </div>
      </div>
      <v-btn
        :to="{
          name: IS_VENDOR_PANEL ? 'Vendor_AddProduct' : 'BPageProductEdit',
          params: { product_id: product.id },
          hash: '#price',
        }"
        variant="text"
        class="sd-modern-button sd-modern-button--small"
        >{{ $t("b_product_dashboard.analytics.price_settings") }}</v-btn
      >
    </header>
    <div :class="{ 'b-product-finance-modern__currencies': modern }">
      <v-card
        v-for="(total, currency) in totalPayAmountFor30days"
        :key="currency"
        :class="
          modern
            ? 'b-product-finance-modern__currency'
            : 'my-2 shadow-paper rounded-2rem'
        "
        :elevation="modern ? 0 : undefined"
      >
        <u-currency-icon
          :currency="currency"
          :title="$t('product_admin.dashboard.finance.currency_unit')"
          :class="modern ? 'me-2' : 'absolute-top-end m-2'"
          flag
          small
        ></u-currency-icon>
        <span v-if="modern" class="b-product-finance-modern__code">{{
          currency
        }}</span>

        <div
          :class="
            modern
              ? 'b-product-finance-modern__summary'
              : 'p-2 d-flex border-between text-center'
          "
        >
          <div class="flex-grow-1">
            <u-price
              :amount="GetFinanceValueByCurrency(todayData, currency, 'pay')"
              :currency="currency"
              :large="!modern && $vuetify.display.smAndUp"
              :class="
                modern
                  ? 'b-product-finance-modern__amount d-block'
                  : 'font-weight-black d-block'
              "
            ></u-price>
            <small>{{ $t("commons.pay_today") }}</small>
          </div>

          <div
            :class="modern ? 'flex-grow-1' : 'flex-grow-1 hide-on-small-600'"
          >
            <u-price
              :amount="
                GetFinanceValueByCurrency(yesterdayData, currency, 'pay')
              "
              :currency="currency"
              :large="!modern && $vuetify.display.smAndUp"
              :class="
                modern
                  ? 'b-product-finance-modern__amount d-block'
                  : 'font-weight-black d-block'
              "
            ></u-price>
            <small>{{ $t("commons.pay_yesterday") }}</small>
          </div>

          <div class="flex-grow-1">
            <u-price
              :amount="total"
              :currency="currency"
              :large="!modern && $vuetify.display.smAndUp"
              :class="
                modern
                  ? 'b-product-finance-modern__amount d-block'
                  : 'font-weight-black d-block'
              "
            ></u-price>
            <small>{{
              $t(
                modern
                  ? "b_product_dashboard.analytics.period_paid"
                  : "commons.pay_last30days",
              )
            }}</small>
          </div>
        </div>

        <v-card-subtitle v-if="!modern" class="py-0">
          {{ $t("product_admin.dashboard.finance.sell_daily") }}:
        </v-card-subtitle>
        <v-card-text :class="{ 'pa-0': modern }">
          <finance-inline-chart
            :colors="GetCurrency(currency).gradient"
            :currency="currency"
            :days="timeSeries.days"
            :finance-keys="['sell', 'pay']"
            :timeSeries="timeSeries"
            :modern="modern"
            :value-titles="[
              $t('admin_shop.dashboard.finance.table.sell'),
              $t('admin_shop.dashboard.finance.table.pay'),
            ]"
            :height="modern ? 170 : 68"
          ></finance-inline-chart>
        </v-card-text>
      </v-card>
    </div>
    <p
      v-if="modern && !Object.keys(totalPayAmountFor30days).length"
      class="sd-modern-subtitle"
    >
      {{ $t("b_product_dashboard.analytics.no_finance") }}
    </p>

    <v-row :class="modern ? 'mt-6' : 'mt-8'" no-gutters>
      <v-col cols="12" :sm="modern ? 12 : 6">
        <h3 v-if="modern" class="b-product-finance-modern__composition">
          {{ $t(`b_product_dashboard.analytics.currency_${finance_key}_title`) }}
        </h3>
        <v-btn-toggle
          v-model="finance_key"
          :title="$t('product_admin.dashboard.finance.select_mode_title')"
          mandatory
          :class="{ 'b-product-finance-modern__modes sd-modern-button-group': modern }"
          rounded="xl"
          :style="{ height: modern ? 'auto' : '64px' }"
        >
          <v-btn
            v-for="item in finance_keys"
            :key="item.val"
            :value="item.val"
            size="small"
            :stacked="!modern"
          >
            <img
              :src="item.image"
              :height="modern ? 16 : 24"
              :alt="item.title"
            />

            <div :class="modern ? 'ms-2 tnt' : 'mt-1 tnt'">
              {{ item.title }}
            </div>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <s-chart-funnel-finance
      :finance-key="finance_key"
      :shop="shop"
      :timeSeries="timeSeries"
      :modern="modern"
      :bordered="!modern"
      class="mt-5"
      style="min-height: 160px"
    ></s-chart-funnel-finance>
  </component>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import SChartFunnelFinance from "../../../chart/funnel/finance/SChartFunnelFinance.vue";
import FinanceInlineChart from "../../../chart/FinanceInlineChart.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "BProductFinanceCharts",
  mixins: [DateMixin, CurrencyMixin],

  components: {
    UCurrencyIcon,
    FinanceInlineChart,
    SChartFunnelFinance,
    SWidgetBox,
  },
  props: {
    modern: Boolean,
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

<style scoped lang="scss">
.b-product-finance-modern {
  &__currencies {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  &__currency {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    background: transparent;
    border: 0;
    border-radius: 0;
    overflow: visible;
  }
  &__code {
    font-size: 13px;
    font-weight: 500;
  }
  &__summary {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-block: 12px;
  }
  &__summary > div {
    min-width: 0;
  }
  &__currency > .v-card-text {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }
  &__summary small {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }
  &__amount {
    font-size: 18px;
    font-weight: 500;
    line-height: 28px;
  }
  &__composition {
    margin-block: 0 12px;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__modes {
    max-width: 100%;
  }
  @media (max-width: 700px) {
    &__currencies {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 400px) {
    &__summary {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
}
</style>
