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
    :active="true"
    :title="`<h5 class='align-items-center pb-1'>    <span class='circle bg-primary mr-sm' style='font-size: 6px;'></span>  ${$t(
      'admin_shop.dashboard.products.title',
    )} </h5>`"
    extended
    :sub-title="$t( 'admin_shop.dashboard.products.title_small' )"
  >
    <template v-slot:top-left>
      <v-btn
        :to="{ name: 'BPageShopProductsList', hash: '#add' }"
        class="icon-add"
        icon
        variant="text"
      >
        <v-icon>fa:fas fa-boxes</v-icon>
      </v-btn>
    </template>
    <template v-slot:actions>
      <div class="d-flex">
        <div class="min-width-100">
          <h2 class="text-h3 font-weight-black">
            {{ numeralFormat(total_products, "0,0") }}
          </h2>
          <small>{{
            $t("admin_shop.dashboard.products.total_products")
          }}</small>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <u-chart-bar
        v-for="item in available_types"
        :key="item.code"
        :class="{ disabled: !item.enable }"
        :colors="[item.color]"
        :dataset="getArray(`total_products_${item.code.toLowerCase()}`)"
        :end-date="timeSeries.endDate"
        :height="60"
        :start-date="timeSeries.startDate"
        class="py-5 text-center"
        narrow
      >
        <template v-slot:title>
          <img :src="item.image" class="me-1" height="20" />
          {{ $t(item.name) }}
          /
          <span class="font-weight-black ms-1">
            {{
              numeralFormat(
                lastDayData[`total_products_${item.code.toLowerCase()}`],
                "0,0a",
              )
            }}
          </span>
        </template>
      </u-chart-bar>

      <!-- ------------------- Importing Products Que ------------------- -->

      <b-shop-products-import-processing :shop="shop">
      </b-shop-products-import-processing>
    </template>
  </s-widget-box>
</template>

<script>
import BShopProductsImportProcessing from "../../../product/importer/processing/BShopProductsImportProcessing.vue";

import UChartBar from "../../../../ui/chart/bar/UChartBar.vue";
import { ShopOptionsHelper } from "@selldone/core-js/helper/shop/ShopOptionsHelper";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

export default {
  name: "BDashboardShopProducts",
  components: {
    UChartBar,
    BShopProductsImportProcessing,
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

  data: () => ({}),

  computed: {
    option_types() {
      return ShopOptionsHelper.GetActiveTypes(this.shop);
    },
    available_types() {
      return Object.values(ProductType).filter((t) =>
        this.option_types.includes(t.code),
      );
    },

    lastDayData() {
      return this.timeSeries.lastDayData();
    },
    yesterdayData() {
      return this.timeSeries.yesterdayData();
    },

    total_products() {
      return (
        this.lastDayData.total_products_virtual +
        this.lastDayData.total_products_physical +
        this.lastDayData.total_products_file +
        this.lastDayData.total_products_service +
        this.lastDayData.total_products_subscription
      );
    },
  },
  methods: {
    getArray(key) {
      return this.timeSeries
        .arrayOfForceInterpolateByLastValue(key, false, "created_at")
        .map((val) => [val >= 0 ? val : 0]);
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
