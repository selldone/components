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
  <v-list-item prepend-icon="calculate">
    <template v-slot:title>
      Pricing ●
      <u-price :amount="min_price" :currency="product.currency"></u-price>
      <template v-if="min_price !== max_price">
        ~
        <u-price :amount="max_price" :currency="product.currency"></u-price>
      </template>
    </template>
    <template v-slot:subtitle>
      <div v-if="product.price === 0">
        <v-icon class="me-1" color="red">cancel</v-icon>
        The default product price not set yet!
      </div>
      <div v-else>
        <v-icon class="me-1" color="green">check_circle</v-icon>
        Listing pricing is set to
        <u-price :amount="product.price" :currency="product.currency"></u-price>
        .
      </div>

      <div v-if="has_valuation">
        <v-icon class="me-1" color="green">check_circle</v-icon>
        Product has valuation.
      </div>

      <template v-if="isSubscription">
        <div v-if="subscription_prices?.length">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          This product has {{ subscription_prices?.length }} subscription
          pricing plans.
        </div>
        <div v-else>
          <v-icon class="me-1" color="red">cancel</v-icon>
          This product has no subscription pricing plans.
        </div>
      </template>
    </template>
  </v-list-item>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BProductFlowRowPricing",
  components: {},
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
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    min_price() {
      let minPrice = this.product.price;

      this.product.product_variants?.forEach((vendorProduct) => {
        if (vendorProduct.pricing && vendorProduct.price < minPrice) {
          minPrice = vendorProduct.price;
        }
      });

      return minPrice;
    },

    max_price() {
      let maxPrice = this.product.price;

      this.product.product_variants?.forEach((vendorProduct) => {
        if (vendorProduct.pricing && vendorProduct.price > maxPrice) {
          maxPrice = vendorProduct.price;
        }
      });

      return maxPrice;
    },

    has_valuation() {
      return !!this.product.valuation;
    },

    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },
    subscription_prices() {
      return this.product.subscription_prices;
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
