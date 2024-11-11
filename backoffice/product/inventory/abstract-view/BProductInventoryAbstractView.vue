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
  <s-widget-box
    :icon="
      isFile ? 'storage' : isSubscription ? 'subscriptions' : 'fa:fas fa-boxes'
    "
    :sub-title="
      isSubscription
        ? $t('product_admin.dashboard.inventory.subscribers_title_small')
        : $t('product_admin.dashboard.inventory.title_small')
    "
    :title="
      isSubscription
        ? `<h5 class='align-items-center pb-1'>    <span class='circle bg-pink-soft mr-sm' style='font-size: 6px;'></span>  ${$t(
            'product_admin.dashboard.inventory.subscribers_title',
          )}</h5>`
        : `<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
            'product_admin.dashboard.inventory.title',
          )}</h5>`
    "
    extended
  >
    <template v-slot:actions>
      <h2 class="text-h3 font-weight-black">
        <v-icon
          v-if="isFile"
          :title="$t('global.commons.infinite')"
          size="large"
          >all_inclusive
        </v-icon>

        <span
          v-else-if="isSubscription"
          :class="product.subscribers_count ? 'bg-pink-soft text-gradient' : ''"
          >{{ numeralFormat(product.subscribers_count, "0,0.[0] a") }}</span
        >
        <span v-else>{{ numeralFormat(product.quantity, "0,0.[0] a") }}</span>
      </h2>

      <div
        class="scrollable-element-light"
        style="overflow-x: auto; overflow-y: hidden; display: flex"
      >
        <u-chart-funnel
          :animated="true"
          :colors="colors"
          :direction="direction"
          :display-percentage="false"
          :gradient-direction="gradientDirection"
          :height="140"
          :labels="labels"
          :sub-labels="subLabels"
          :values="values"
          :width="widthFunnelFinance"
          class=""
          dense
          sub-label-value="value"
          no-legend

        />
      </div>
    </template>

    <template v-slot:bottom>
      <v-row class="text-center mt-2">
        <v-col cols="12" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(product.sells, "0,0") }}
          </h4>
          <small>
            <v-icon class="me-1">fa:fas fa-cash-register</v-icon>
            {{ $t("product_admin.dashboard.inventory.total_sell") }}
          </small>
        </v-col>

        <v-col cols="12" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(totalSellsFor30days, "0,0") }}
          </h4>
          <small>
            <v-icon class="me-1">fa:fas fa-calendar</v-icon>
            {{
              $t("product_admin.dashboard.inventory.total_sell_timespan", {
                start: getLocalDateString(timeSeries.startDate),
                end: getLocalDateString(timeSeries.endDate),
              })
            }}
          </small>
        </v-col>

        <v-col cols="12" sm="4">
          <h4 class="text-h4">
            {{ numeralFormat(todayData.sell, "0,0") }}
          </h4>
          <small>
            <v-icon class="me-1">fa:fas fa-calendar-day</v-icon>
            {{ $t("product_admin.dashboard.inventory.total_sell_today") }}
          </small>
        </v-col>
      </v-row>
    </template>
  </s-widget-box>
</template>

<script lang="ts">
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UChartFunnel from "../../../../ui/chart/funnel/UChartFunnel.vue";

export default {
  name: "BProductInventoryAbstractView",
  components: { UChartFunnel, SWidgetBox },
  props: {
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
    colors: [
      ["#0288D1", "#303F9F"], // color set for "Buy" segment
      ["#AFB42B", "#00796B"], // color set for "Buy" segment
    ],
    direction: "horizontal",
    gradientDirection: "horizontal",
  }),

  computed: {
    isFile() {
      return this.product.type === ProductType.FILE.code;
    },

    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },

    subLabels() {
      return this.$tm("product_admin.dashboard.inventory.chart.labels");
    },

    todayData() {
      return this.timeSeries.todayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    widthFunnelFinance() {
      if (!this.timeSeries.count) return 200;
      return 200 + 50 * this.timeSeries.count;
    },

    labels() {
      let out = [];
      this.timeSeries.raw_data.forEach((item) => {
        out.push(this.getLocalTimeString(item.created_at, false, true));
      });

      return out;
    },

    values() {
      let out = [];

      this.timeSeries.raw_data.forEach((item) => {
        let count = item.count ? item.count : 0;
        let sell = item.sell ? item.sell : 0;

        out.push([count, sell]);
      });

      return out;
    },

    totalSellsFor30days() {
      return this.timeSeries.totalOf("sell");
    },
  },
};
</script>

<style lang="scss">

</style>
