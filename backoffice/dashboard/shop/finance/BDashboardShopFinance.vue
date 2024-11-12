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
  <div>
    <s-widget-box
      :icon-to="{ name: 'BPageShopFinanceReport' }"
      :title="title"
      class="mb-5"
      icon="multiline_chart"
    >
      <v-row class="my-0">
        <!-- ------------------------------ Today Payments ------------------------------ -->

        <v-col
          class="border-end-grater-xs p-3 px-4 text-center"
          cols="12"
          sm="4"
        >
          <b-dashboard-shop-performance-payments
            :shop="shop"
            :time-series="timeSeries"
          >
          </b-dashboard-shop-performance-payments>
        </v-col>

        <!-- ------------------------------ Today Sales ------------------------------ -->

        <v-col
          class="border-end-grater-xs p-3 px-4 text-center"
          cols="12"
          sm="4"
        >
          <b-dashboard-shop-performance-orders
            :shop="shop"
            :time-series="timeSeries"
          ></b-dashboard-shop-performance-orders>
        </v-col>

        <!-- Footer > Pie chart -->

        <v-col
          class="p-3 text-center d-flex align-center justify-center flex-column"
          cols="12"
          sm="4"
        >
          <s-donut-chart
            v-if="pie_chart_total"
            :has-legend="false"
            :sections="pie_values"
            :size="64"
            :thickness="40"
            :total="pie_chart_total"
            unit="px"
          >
            <span style="font-size: 10px; font-weight: 500">{{
              numeralFormat(pie_chart_total, "0.[0]a")
            }}</span>
          </s-donut-chart>
          <p class="text-muted my-2">
            <small>
              {{
                pie_chart_total
                  ? $t("admin_shop.dashboard.finance.pie.title")
                  : $t("admin_shop.dashboard.finance.pie.no_data")
              }}
            </small>
          </p>
        </v-col>
      </v-row>
    </s-widget-box>

    <s-widget-box
      :icon-to="{ name: 'BPageShopFinanceReport' }"
      :sub-title="$t('admin_shop.dashboard.finance.title_small')"
      :title="$t('admin_shop.dashboard.finance.title')"
      class="mb-5"
      icon="bar_chart"
    >
      <p>
        <b class="text-capitalize me-2">{{
          $t("admin_shop.dashboard.finance.total_30days_title")
        }}</b>

        <small>({{ $t("admin_shop.dashboard.finance.last_30_day") }})</small>
      </p>

      <v-card
        v-for="(total, currency, i) in totalPayFor30days"
        :key="currency"
        :style="{ 'animation-delay': 100 + i * 100 + 'ms' }"
        class="my-2 border rounded-2rem fadeIn"
        flat
      >
        <u-currency-icon
          :currency="GetCurrency(currency)"
          :title="$t('global.commons.currency')"
          class="absolute-top-end m-2"
          gradient
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
              :amount="
                GetFinanceValueByCurrency(yesterdayData, currency, 'pay')
              "
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
          {{ $t("admin_shop.dashboard.finance.table.sell_daily") }}:
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
    </s-widget-box>

    <!-- Actions > Report for 30 days -->

    <v-row class="overflow-x-auto my-3" no-gutters>
      <v-btn-toggle
        v-model="mode_funnel"
        class="rounded-toggles"
        multiple
        rounded
        selected-class="black-flat"
        style="height: 64px"
      >
        <v-btn class="min-width-100" value="pay" variant="text">
          <v-icon v-if="mode_funnel.includes('pay')" class="me-1"
            >check
          </v-icon>
          {{ $t("admin_shop.dashboard.finance.pay_amount") }}
        </v-btn>
        <v-btn class="min-width-100" value="sell" variant="text">
          <v-icon v-if="mode_funnel.includes('sell')" class="me-1"
            >check
          </v-icon>
          {{ $t("admin_shop.dashboard.finance.sell_amount") }}
        </v-btn>
        <v-btn class="min-width-100" value="discount" variant="text">
          <v-icon
            v-if="mode_funnel.includes('discount')"
            class="me-1"
            size="small"
            >check
          </v-icon>
          {{ $t("admin_shop.dashboard.finance.discount_amount") }}
        </v-btn>
        <v-btn class="min-width-100" value="count" variant="text">
          <v-icon v-if="mode_funnel.includes('count')" class="me-1"
            >check
          </v-icon>
          {{ $t("admin_shop.dashboard.finance.sell_count") }}
        </v-btn>
      </v-btn-toggle>
    </v-row>

    <!-- Actions > Payment Amount Chart -->
    <v-expand-transition>
      <s-widget-box
        v-if="mode_funnel.includes('pay')"
        :icon-to="{ name: 'BPageShopFinanceReport' }"
        :sub-title="$t('admin_shop.dashboard.finance.title_small')"
        :title="$t('admin_shop.dashboard.finance.pay_amount_chart_title')"
        class="mb-5"
        icon="multiline_chart"
      >
        <s-chart-funnel-finance
          :shop="shop"
          :time-series="timeSeries"
          bordered
          finance-key="pay"
          class="mx-n5"

        />
      </s-widget-box>
    </v-expand-transition>

    <!-- Actions > Sell Amount Chart -->
    <v-expand-transition>
      <s-widget-box
        v-if="mode_funnel.includes('sell')"
        :icon-to="{ name: 'BPageShopFinanceReport' }"
        :sub-title="$t('admin_shop.dashboard.finance.title_small')"
        :title="$t('admin_shop.dashboard.finance.sell_amount_chart_title')"
        class="mb-5"
        icon="multiline_chart"
      >
        <s-chart-funnel-finance
          :shop="shop"
          :time-series="timeSeries"
          bordered
          finance-key="sell"
          class="mx-n5"
        />
      </s-widget-box>
    </v-expand-transition>

    <!-- Actions > Discount Amount Chart -->
    <v-expand-transition>
      <s-widget-box
        v-if="mode_funnel.includes('discount')"
        :icon-to="{ name: 'BPageShopFinanceReport' }"
        :sub-title="$t('admin_shop.dashboard.finance.title_small')"
        :title="$t('admin_shop.dashboard.finance.discount_amount_chart_title')"
        class="mb-5"
        icon="multiline_chart"
      >
        <s-chart-funnel-finance
          :shop="shop"
          :time-series="timeSeries"
          bordered
          finance-key="discount"
          class="mx-n5"
        />
      </s-widget-box>
    </v-expand-transition>

    <!-- Actions > Count Chart -->
    <v-expand-transition>
      <s-widget-box
        v-if="mode_funnel.includes('count')"
        :icon-to="{ name: 'BPageShopFinanceReport' }"
        :sub-title="$t('admin_shop.dashboard.finance.sell_count_chart_title')"
        :title="$t('global.commons.carts')"
        class="mb-5"
        icon="multiline_chart"
      >
        <s-chart-funnel-data
          :colors="colors"
          :keys="[
            'sell_products_physical',
            'sell_products_virtual',
            'sell_products_file',
            'sell_products_service',
            'sell_products_subscription',
            'sell_avocados',
          ]"
          :shop="shop"
          :sub-label-images="subLabelImages"
          :sub-labels="subLabels"
          :time-series="timeSeries"
          bordered
          class="mx-n5"
        />
      </s-widget-box>
    </v-expand-transition>

    <!-- █████████████████████████ Gateways █████████████████████████ -->

    <s-widget-box
      :icon-to="{ name: 'BPageShopFinanceGateways' }"
      :title="$t('admin_shop.dashboard.finance.active_gateways')"
      class="mb-5"
      icon="payment"
      sub-title="This is a compilation of payment gateways integrated into your store. Customers have the option to make payments in any currency through a single payment gateway. Employ multiple gateways for various currencies only if you wish to establish distinct pricing for each currency."
    >
      <v-row class="my-2" no-gutters>
        <v-chip
          v-for="item in currencies"
          :key="item.code"
          class="ma-1"
          color="#111"
          variant="outlined"
        >
          <u-currency-icon
            :currency="item"
            class="ms-n1"
            flag
            small
          ></u-currency-icon>

          <b class="small ms-1">{{ getCurrencyName(item.code) }}</b>
        </v-chip>

        <v-btn
          :to="{ name: 'BPageShopFinanceExchange' }"
          icon
          title="Manage currencies"
          variant="text"
        >
          <v-icon>more_horiz</v-icon>
        </v-btn>
      </v-row>

      <v-btn
        v-if="!currencies.length"
        :to="{ name: 'BPageShopFinanceExchange' }"
        color="red"
        variant="flat"
      >
        <v-icon color="#fff"> add</v-icon>
        <span class="text-white">
          {{ $t("admin_shop.dashboard.info.currencies_alert") }}
        </span>
      </v-btn>

      <v-data-table
        :group-by="[
          {
            key: 'currency',
            order: 'asc',
          },
        ]"
        :headers="gateway_headers"
        :items="_shop_gateways"
        :items-per-page="100"
        class="bg-transparent"
        item-key="id"
      >
        <template
          v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
        >
          <tr>
            <td :colspan="columns.length - 1">
              <VBtn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                class="me-2"
                size="small"
                variant="text"
                @click="toggleGroup(item)"
              ></VBtn>

              <u-currency-icon
                :currency="item.value"
                flag
                small
              ></u-currency-icon>

              <b class="small ms-1 me-3">{{ getCurrencyName(item.value) }}</b>

              <v-chip
                v-for="_g in item.items"
                :key="_g.id"
                :variant="
                  _g.raw.enable && _g.raw.gateway.enable ? 'text' : 'plain'
                "
                class="ma-1"
                color="#111"
              >
                <v-img
                  :src="getShopImagePath(_g.raw.gateway.icon)"
                  class="me-1"
                  height="24"
                  width="24"
                ></v-img>

                <b class="small ms-1">{{ _g.raw.gateway.name }}</b>
              </v-chip>
            </td>

            <td class="text-end" colspan="1">
              <small>
                {{ getCountryFromCurrency(item.value) }}
              </small>
            </td>
          </tr>
        </template>

        <template v-slot:item.name="{ item }">
          <img
            :class="{ 'img-grayscale': !item.enable }"
            :src="getShopImagePath(item.gateway.icon)"
            class="m-2 rounded-8px"
            height="24px"
            width="auto"
          />

          {{ item.gateway.name }}
        </template>

        <template v-slot:item.state="{ item }">
          <v-chip
            v-if="!item.gateway.enable"
            class="ma-1"
            color="red"
            size="small"
            title="This payment globally disabled on Selldone."
            variant="flat"
          >
            <v-icon start>warning</v-icon>
            Globally Disabled
          </v-chip>

          <v-chip
            v-if="item.livemode"
            class="ma-1"
            color="green"
            size="small"
            variant="flat"
          >
            <v-icon start>paid</v-icon>
            Live Mode
          </v-chip>
          <v-chip
            v-else
            class="ma-1"
            color="orange"
            size="small"
            variant="flat"
          >
            <v-icon start>science</v-icon>
            Debug Mode
          </v-chip>
        </template>
        <template v-slot:item.type="{ item }">
          {{
            item.gateway.cod
              ? $t("global.commons.COD")
              : item.gateway.cash
                ? $t("global.commons.cash")
                : item.gateway.dir
                  ? $t("global.commons.dir_payment")
                  : $t("global.commons.online")
          }}
        </template>
        <template v-slot:item.enable="{ item }">
          <v-chip color="#333" size="small">
            <v-icon v-if="item.enable" color="success" size="x-small" start
              >lens
            </v-icon>
            <v-icon v-else color="red" size="x-small" start>lens</v-icon>
            {{ $t(item.enable ? "global.active" : "global.inactive") }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            :to="{
              name: 'BPageGatewayDashboard',
              params: { gateway_code: item.gateway.code },
            }"
            color="primary"
            variant="text"
          >
            <v-icon class="me-1" start>edit</v-icon>
            {{ $t("global.actions.edit") }}
          </v-btn>
        </template>
      </v-data-table>
    </s-widget-box>
  </div>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import BDashboardShopPerformancePayments from "../../../dashboard/shop/performance/payments/BDashboardShopPerformancePayments.vue";
import BDashboardShopPerformanceOrders from "../../../dashboard/shop/performance/orders/BDashboardShopPerformanceOrders.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";
import FinanceInlineChart from "../../../chart/FinanceInlineChart.vue";
import SChartFunnelData from "../../../chart/funnel/data/SChartFunnelData.vue";
import SChartFunnelFinance from "../../../chart/funnel/finance/SChartFunnelFinance.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BDashboardShopFinance",
  mixins: [DateMixin],

  components: {
    BDashboardShopPerformanceOrders,
    BDashboardShopPerformancePayments,
    UCurrencyIcon,
    FinanceInlineChart,
    SChartFunnelData,
    SChartFunnelFinance,
    SWidgetBox,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    shopGateways: {
      required: true,
      type: Array,
    },

    timeSeries: {
      required: true,
      type: Object,
    },
    pay: {
      default: false,
      type: Boolean,
    },
    sell: {
      default: false,
      type: Boolean,
    },
    discount: {
      default: false,
      type: Boolean,
    },
    count: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      gateway_headers: [
        { title: "Gateway", value: "name" },
        { title: this.$t("global.commons.State"), value: "state" },
        { title: this.$t("global.commons.type"), value: "type" },
        { title: this.$t("global.commons.enable"), value: "enable" },
        { title: "", value: "actions", align: "end" },
      ],

      subLabels: [
        this.$t("global.product_types.physical"),
        this.$t("global.product_types.virtual"),
        this.$t("global.product_types.file"),
        this.$t("global.product_types.service"),
        this.$t("global.product_types.subscription"),
        this.$t("global.commons.avocado"),
      ],
      subLabelImages: [
        ProductType.PHYSICAL.image,
        ProductType.VIRTUAL.image,
        ProductType.FILE.image,
        ProductType.SERVICE.image,
        ProductType.SUBSCRIPTION.image,
        require("../../../../assets/icons/avocado.svg"),
      ],

      mode_funnel: [],
    };
  },

  created() {
    if (this.pay) this.mode_funnel.push("pay");
    if (this.sell) this.mode_funnel.push("sell");
    if (this.discount) this.mode_funnel.push("discount");
    if (this.count) this.mode_funnel.push("count");
  },

  computed: {
    _shop_gateways() {
      return this.shopGateways.map((item) => {
        return {
          ...item,
          currency: item.gateway.currency,
        };
      });
    },

    todayDataOffset() {
      return this.timeSeries.todayDataOffset();
    },

    title() {
      return !this.todayDataOffset ||
        this.isToday(this.todayDataOffset.created_at)
        ? this.$t("admin_shop.dashboard.performance.title")
        : this.getLocalDateString(this.todayDataOffset.created_at);
    },

    currencies() {
      let out = [];
      for (let key in Currency) {
        let item = Currency[key];
        if (
          item.enable &&
          this.shop.currencies &&
          this.shop.currencies.includes(key)
        )
          out.push(item);
      }
      return out;
    },

    colors() {
      return [
        ProductType.PHYSICAL.colors,
        ProductType.VIRTUAL.colors,
        ProductType.FILE.colors,
        ProductType.SERVICE.colors,
        ProductType.SUBSCRIPTION.colors,
        ["#333", "#111"],
      ];
    },
    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    totalPayFor30days() {
      return this.timeSeries.financeTotalOf("pay");
    },

    pie_values() {
      return [
        {
          value: this.todayData.sell_products_physical,
          label: this.$t(ProductType.PHYSICAL.name),
          color: ProductType.PHYSICAL.color,
        },
        {
          value: this.todayData.sell_products_virtual,
          label: this.$t(ProductType.VIRTUAL.name),
          color: ProductType.VIRTUAL.color,
        },
        {
          value: this.todayData.sell_products_file,
          label: this.$t(ProductType.FILE.name),
          color: ProductType.FILE.color,
        },
        {
          value: this.todayData.sell_products_service,
          label: this.$t(ProductType.SERVICE.name),
          color: ProductType.SERVICE.color,
        },
        {
          value: this.todayData.sell_products_subscription,
          label: this.$t(ProductType.SUBSCRIPTION.name),
          color: ProductType.SUBSCRIPTION.color,
        },
      ];
    },

    pie_chart_total() {
      return (
        this.todayData.sell_products_virtual +
        this.todayData.sell_products_physical +
        this.todayData.sell_products_file +
        this.todayData.sell_products_service +
        this.todayData.sell_products_subscription
      );
    },
  },
  methods: {
    getCountryFromCurrency(currency) {
      return CurrencyHelper.GetCountryByCurrencyCode(currency);
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
