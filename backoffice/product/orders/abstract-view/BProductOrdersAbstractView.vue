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
    :color="ThemeColorDark"
    :sub-title="$t('product_admin.dashboard.orders.title_small')"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-amber mr-sm' style='font-size: 6px;'></span>  ${$t(
      'product_admin.dashboard.orders.title',
    )} </h5>`"
    dark
    icon="ring_volume"
    icon_color="#fff"
  >
    <template v-slot:actions>
      <h2 class="text-h3 font-weight-black">
        {{ numeralFormat(totalPendingOrders, "0,0.[0] a") }}
      </h2>
    </template>

    <div class="my-2 small">
      {{ $t("product_admin.dashboard.orders.physical_orders_title") }}
    </div>

    <orders-que :order-que="orderQue" :type="product.type" dark></orders-que>

    <v-spacer></v-spacer>
    <div class="my-2 small">
      {{
        isFile
          ? $t("product_admin.dashboard.orders.downloads_count_in_period", {
              start: getLocalDateString(timeSeries.startDate),
              end: getLocalDateString(timeSeries.endDate),
            })
          : $t("product_admin.dashboard.orders.send_count_in_period", {
              start: getLocalDateString(timeSeries.startDate),
              end: getLocalDateString(timeSeries.endDate),
            })
      }}
    </div>

    <time-series-inline-chart
      :colors="[productType.color]"
      :height="80"
      :keys="['send']"
      :time-series="timeSeries"
      :value-titles="[
        (isFile
          ? $t('global.actions.download')
          : $t('global.delivery_state.to_customer')) + ' : ',
      ]"
      class="w-100 pointer-pointer"
      dark
      glow
      start-zero-category-bug
      type="bar"
    ></time-series-inline-chart>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import OrdersQue from "../../../order-que/OrdersQue.vue";
import TimeSeriesInlineChart from "../../../chart/TimeSeriesInlineChart.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

export default {
  name: "BProductOrdersAbstractView",
  mixins: [TemplateMixin],

  components: { TimeSeriesInlineChart, OrdersQue, SWidgetBox },
  props: {
    product: {
      required: true,
      type: Object,
    },
    timeSeries: {
      required: true,
      type: Object,
    },

    orderQue: {
      required: true,
      type: Array,
    },
  },

  data: () => ({      ProductType: ProductType,
  }),

  computed: {
    productType() {
      return ProductType[this.product.type];
    },
    isFile() {
      return this.product.type === ProductType.FILE.code;
    },

    totalPendingOrders() {
      let out = 0;
      this.orderQue.forEach((item) => (out += item.count));
      return out;
    },
  },

  methods: {},
};
</script>

<style scoped></style>
