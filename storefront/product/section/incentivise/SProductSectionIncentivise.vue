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
    <div v-if="show_progress" style="max-width: 360px" class="mt-1">
      <v-progress-linear
        :model-value="sells"
        :max="sells + quantity"
        :color="sells > 0.8 * (sells + quantity) ? '#D32F2F' : 'green'"
        class="my-1"
        rounded-bar
        rounded
      ></v-progress-linear>
      <div class="d-flex align-center justify-space-between small">
        <span v-if="sells > 0"
          >{{ $t("product_section_incentivise.total_sold") }}:
          <b>{{ numeralFormat(sells, "0.[0]a") }}</b></span
        >
        <span v-if="has_quantity > 0"
          >{{ $t("product_section_incentivise.available_items") }}:
          <b>{{ numeralFormat(quantity, "0.[0]a") }}</b></span
        >
      </div>
    </div>
  </div>
</template>

<script>
import { MapHelper } from "@selldone/core-js/helper/map/MapHelper";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import numeral from "numeral";

export default {
  name: "SProductSectionIncentivise",
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

  data: () => ({
    MapHelper: MapHelper,
  }),

  computed: {
    has_quantity() {
      return (
        this.product.type === ProductType.PHYSICAL.code ||
        this.product.type === ProductType.VIRTUAL.code
      );
    },
    quantity() {
      return this.product.quantity;
    },

    sells() {
      return this.product.sells;
    },
    show_progress() {
      return this.sells > 0 && this.sells / (this.quantity + this.sells) > 0.1;
    },
    in_carts() {
      return this.product.in_carts;
    },
    message() {
      if (
        this.product.type === ProductType.SUBSCRIPTION.code ||
        this.product.type === ProductType.SERVICE.code
      )
        return null;

      const is_physical = this.product.type === ProductType.PHYSICAL.code;
      const is_virtual = this.product.type === ProductType.VIRTUAL.code;
      const is_file = this.product.type === ProductType.FILE.code;
      let conditions = [];

      if (is_physical || is_virtual) {
        if (!this.quantity) return null; // if quantity is not set, don't show any message
        conditions = [
          {
            minSells: 50,
            maxQuantity: 100,
            message: this.$t(
              "product_section_incentivise.physical.popular_selling_with_low_quantity",
            ),
          },
          {
            minSells: 5,
            maxQuantity: Infinity,
            message: this.$t(
              "product_section_incentivise.physical.has_sell_has_quantity",
            ),
          },
          {
            minQuantity: 20,
            maxQuantity: 200,
            message: this.$t(
              "product_section_incentivise.physical.just_has_low_quantity",
            ),
          },
          {
            minQuantity: 1,
            maxQuantity: 20,
            message: this.$t(
              "product_section_incentivise.physical.just_has_very_low_quantity",
            ),
          },
        ];
      } else if (is_file) {
        conditions = [
          {
            minSells: 100,
            message: this.$t(
              "product_section_incentivise.file.very_popular_selling",
            ),
          },
          {
            minSells: 50,
            message: this.$t(
              "product_section_incentivise.file.popular_selling",
            ),
          },
          {
            minSells: 10,
            message: this.$t(
              "product_section_incentivise.file.has_normal_selling",
            ),
          },
          {
            minSells: 1,
            message: this.$t(
              "product_section_incentivise.file.just_release_has_some_sales",
            ),
          },
        ];
      }

      const cartMessage =
        (is_physical || is_virtual) && this.in_carts >= this.quantity * 0.1 // if added to cart more than 10% of stock
          ? `<b>${numeral(this.in_carts).format("0a")}</b> others have this in their carts!`
          : "";

      for (const condition of conditions) {
        const isSellsInRange =
          condition.minSells === undefined || this.sells > condition.minSells;
        const isQuantityInRange =
          (condition.minQuantity === undefined ||
            this.quantity >= condition.minQuantity) &&
          (condition.maxQuantity === undefined ||
            this.quantity <= condition.maxQuantity);

        if (isSellsInRange && isQuantityInRange) {
          return `${condition.message} ${cartMessage}`;
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
