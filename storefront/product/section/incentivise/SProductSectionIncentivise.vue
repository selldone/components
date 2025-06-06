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
  <div
    v-if="message"
    class="s--product-section-incentivise px-2 mb-2 flex-grow-0"
  >
    <div v-html="message"></div>
    <div
      v-if="has_progress && show_progress"
      style="max-width: 360px"
      class="mt-1"
    >
      <v-progress-linear
        :model-value="sells"
        :max="sells + quantity"
        :color="sells > 0.8 * (sells + quantity) ? '#D32F2F' : 'green'"
        class="my-1"
        rounded-bar
        rounded
        height="10"
        striped
      ></v-progress-linear>
      <div class="d-flex align-center justify-space-between small">
        <span v-if="sells > 0"
          >{{ $t("global.product_section_incentivise.total_sold") }}:
          <b>{{ numeralFormat(sells, "0.[0]a") }}</b></span
        >
        <span v-if="has_quantity > 0"
          >{{ $t("global.product_section_incentivise.available_items") }}:
          <b>{{ numeralFormat(quantity, "0.[0]a") }}</b></span
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import numeral from "numeral";
import { GenerateProductThresholdsConditions } from "@selldone/core-js/enums/product/ProductThresholds.ts";

export default {
  name: "SProductSectionIncentivise",
  components: {},
  inject: ["$shop", "$product"],
  props: {
    variant: {
      required: false,
      type: Object,
    },
    vendorProduct: {
      required: false,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {
    /**
     * Custom thresholds for the product
     */
    thresholds() {
      return this.$product.thresholds;
    },
    carts_threshold_portion() {
      return this.thresholds?.custom ? this.thresholds.carts : 0.1;
    },
    progress_threshold_portion() {
      return this.thresholds?.custom ? this.thresholds.progress : 0.1;
    },

    has_quantity() {
      return (
        this.$product.type === ProductType.PHYSICAL.code ||
        this.$product.type === ProductType.VIRTUAL.code
      );
    },
    quantity() {
      if (this.vendorProduct) {
        return this.vendorProduct.quantity;
      } else if (this.variant) {
        return this.variant.quantity;
      }
      return this.$product.quantity;
    },

    sells() {
      return this.$product.sells;
    },
    has_progress() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },
    has_in_cart_count() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },

    show_progress() {
      return (
        this.sells / (this.quantity + this.sells) >= this.progress_threshold_portion
      );
    },
    in_carts() {
      return this.$product.in_carts;
    },
    message() {
      if (
        this.$product.type === ProductType.SUBSCRIPTION.code ||
        this.$product.type === ProductType.SERVICE.code
      )
        return null;

      const is_physical = this.$product.type === ProductType.PHYSICAL.code;
      const is_virtual = this.$product.type === ProductType.VIRTUAL.code;

      if (is_physical || is_virtual) {
        if (!this.quantity) return null; // if quantity is not set, don't show any message
      }

      let conditions = GenerateProductThresholdsConditions(this.$product);

      // console.log("conditions", conditions,'quantity',this.quantity,'sells',this.sells);
      const cartMessage =
        this.has_in_cart_count &&
        this.in_carts >= this.quantity * this.carts_threshold_portion // if added to cart more than 10% of stock
          ? this.$t("global.product_section_incentivise.have_in_their_bag", {
              in_carts: numeral(this.in_carts).format("0a"),
            })
          : "";

      for (const condition of conditions) {
        const isSellsInRange =
          condition.minSales == null || this.sells > condition.minSales;
        const isQuantityInRange =
          (condition.minQuantity == null ||
            this.quantity >= condition.minQuantity) &&
          (condition.maxQuantity == null ||
            this.quantity <= condition.maxQuantity);

        // console.log(condition,"isSellsInRange", isSellsInRange,'isQuantityInRange',isQuantityInRange);
        if (isSellsInRange && isQuantityInRange) {
          return `${this.$t(condition.message)} ${cartMessage}`;
        }
      }

      return cartMessage;
    },
  },

  watch: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.s--product-section-incentivise {
  font-size: 0.9rem;

  @media (max-width: 420px) {
    font-size: 0.8rem;
  }
}
</style>
