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
    :title="`<h5 class='align-items-center pb-1'>⚡ Purchase flow</h5>`"
    class="b--product-flow"
    sub-title="This is the purchase flow and health check of your product."
  >
    <v-list :lines="3" class="border-between-vertical" rounded="xl">
      <!-- --------------- Connect --------------- -->
      <b-product-flow-row-connect
        :product="product"
        :shop="shop"
      ></b-product-flow-row-connect>

      <!-- --------------- Product Health --------------- -->
      <b-product-flow-row-health
        :product="product"
        :shop="shop"
      ></b-product-flow-row-health>

      <!-- ⬬⬬⬬⬬ Error > Marketplace ⬬⬬⬬⬬ -->
      <b-product-flow-errors-vendor
        :product="product"
        :shop="shop"
      ></b-product-flow-errors-vendor>

      <!-- ⬬⬬⬬⬬ Error > File Empty ⬬⬬⬬⬬ -->
      <b-product-flow-errors-file
        :product="product"
        :shop="shop"
      ></b-product-flow-errors-file>

      <!-- --------------- Pricing --------------- -->
      <b-product-flow-row-pricing
        :product="product"
        :shop="shop"
      ></b-product-flow-row-pricing>

      <!-- ⬬⬬⬬⬬ Error > File Empty ⬬⬬⬬⬬ -->
      <b-product-flow-errors-subscription
        :product="product"
        :shop="shop"
      ></b-product-flow-errors-subscription>

      <!-- --------------- Selling location restriction --------------- -->
      <b-product-flow-row-location
        :product="product"
        :shop="shop"
      ></b-product-flow-row-location>

      <!-- ⬬⬬⬬⬬ Error > Location restriction ⬬⬬⬬⬬ -->
      <b-product-flow-errors-location
        :product="product"
        :shop="shop"
      ></b-product-flow-errors-location>

      <!-- --------------- Tax --------------- -->
      <b-product-flow-row-tax
        :product="product"
        :shop="shop"
      ></b-product-flow-row-tax>

      <!-- --------------- Vendor --------------- -->
      <b-product-flow-row-vendor
        :product="product"
        :shop="shop"
      ></b-product-flow-row-vendor>
    </v-list>

    <!-- --------------- Pods --------------- -->

    <u-pods-panel color="#ddd">
      <u-pod-node icon="add_shopping_cart" title="Purchase"></u-pod-node>
      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        :image="getShopImagePath(product.icon, 64)"
        icon="inventory"
        title="Add to cart"
      ></u-pod-node>

      <template v-if="isMarketplace">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node icon="store" title="Vendor"></u-pod-node>
      </template>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node icon="monetization_on" title="Pricing"></u-pod-node>

      <template v-if="has_valuation">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node
          :image="require('../../../assets/icons/valuation.svg')"
          title="Valuation"
        ></u-pod-node>
      </template>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node icon="emoji_emotions" title="Incentives"></u-pod-node>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        :image="require('../../../assets/icons/tax-3d.svg')"
        title="Tax"
      ></u-pod-node>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node icon="shopping_bag" title="Checkout"></u-pod-node>

      <template v-if="product.type === ProductType.SERVICE.code">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node icon="assignment_turned_in" title="Confirmation"></u-pod-node>
      </template>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node icon="credit_score" title="Payment"></u-pod-node>

      <u-pod-wire forward></u-pod-wire>
      <u-pod-node
        :image="getProductTypeImage(product.type)"
        title="Fulfillment"
      ></u-pod-node>

      <template v-if="isSubscription">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node icon="repeat" title="Recurring payment"></u-pod-node>
      </template>

      <template v-if="isSubscription && ribbon_link_type">
        <u-pod-wire forward></u-pod-wire>
        <u-pod-node :image="ribbon_link_type.image" title="+ Order"></u-pod-node>
      </template>

      <template v-if="connect">
        <u-pod-wire backward forward></u-pod-wire>
        <u-pod-node
          :image="getShopImagePath(connect.icon)"
          :title="connect.name"
        ></u-pod-node>
      </template>
    </u-pods-panel>
  </s-widget-box>
</template>

<script>
import UPodsPanel from "../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../ui/pod/wire/UPodWire.vue";
import { SubscriptionMode } from "@selldone/core-js/enums/subscription/SubscriptionMode";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import SWidgetBox from "../../../ui/widget/box/SWidgetBox.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import BProductFlowErrorsVendor from "../../product/flow/errors/vendor/BProductFlowErrorsVendor.vue";
import BProductFlowRowConnect from "../../product/flow/row/connect/BProductFlowRowConnect.vue";
import BProductFlowRowHealth from "../../product/flow/row/health/BProductFlowRowHealth.vue";
import BProductFlowRowPricing from "../../product/flow/row/pricing/BProductFlowRowPricing.vue";
import BProductFlowRowLocation from "../../product/flow/row/location/BProductFlowRowLocation.vue";
import BProductFlowRowTax from "../../product/flow/row/tax/BProductFlowRowTax.vue";
import BProductFlowRowVendor from "../../product/flow/row/vendor/BProductFlowRowVendor.vue";
import BProductFlowErrorsFile from "../../product/flow/errors/file/BProductFlowErrorsFile.vue";
import BProductFlowErrorsLocation from "../../product/flow/errors/location/BProductFlowErrorsLocation.vue";
import BProductFlowErrorsSubscription from "../../product/flow/errors/subscription/BProductFlowErrorsSubscription.vue";

export default {
  name: "FlowProduct",
  components: {
    BProductFlowErrorsSubscription,
    BProductFlowErrorsLocation,
    BProductFlowErrorsFile,
    BProductFlowRowVendor,
    BProductFlowRowTax,
    BProductFlowRowLocation,
    BProductFlowRowPricing,
    BProductFlowRowHealth,
    BProductFlowRowConnect,
    BProductFlowErrorsVendor,
    SWidgetBox,
    UPodWire,
    UPodNode,
    UPodsPanel,
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
  },

  data: function () {
    return {};
  },

  computed: {
    isMarketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    isPhysical() {
      return this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product.type === ProductType.VIRTUAL.code;
    },
    isService() {
      return this.product.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },

    ribbon() {
      return this.product.ribbon;
    },
    subscription_mode() {
      return SubscriptionMode[this.ribbon?.mode];
    },
    ribbon_link_type() {
      return this.subscription_mode?.link_type;
    },

    has_valuation() {
      return !!this.product.valuation;
    },

    connect() {
      return this.product.connect;
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
.b--product-flow {
  ::v-deep(.v-list) {
    .v-list-item .v-list-item__prepend .v-icon {
      opacity: 1 !important;

    }
    .v-list-item-subtitle{
      --v-medium-emphasis-opacity:1;
    }
  }
}
</style>
