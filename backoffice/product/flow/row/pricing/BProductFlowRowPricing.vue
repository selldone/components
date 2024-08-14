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
      {{ $t("product_flow.pricing.title") }}
      ●
      <u-price :amount="min_price" :currency="product.currency"></u-price>
      <template v-if="min_price !== max_price">
        ~
        <u-price :amount="max_price" :currency="product.currency"></u-price>
      </template>
    </template>
    <template v-slot:subtitle>
      <div v-if="product.price === 0">
        <v-icon class="me-1" color="red">cancel</v-icon>
        {{ $t("product_flow.pricing.no_product_price_msg") }}
      </div>
      <div v-else>
        <v-icon class="me-1" color="green">check_circle</v-icon>
        {{ $t("product_flow.pricing.listing_pricing_msg") }}

        <u-price :amount="product.price" :currency="product.currency"></u-price>
      </div>

      <div v-if="has_valuation">
        <v-icon class="me-1" color="green">check_circle</v-icon>
        {{ $t("product_flow.pricing.has_valuation_msg") }}
      </div>

      <template v-if="isSubscription">
        <div v-if="subscription_prices?.length">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          {{
            $t("product_flow.pricing.subscription_pricing_msg", {
              count: subscription_prices?.length,
            })
          }}
        </div>
        <div v-else>
          <v-icon class="me-1" color="red">cancel</v-icon>
          {{ $t("product_flow.pricing.has_no_subscription_pricing_msg") }}
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
