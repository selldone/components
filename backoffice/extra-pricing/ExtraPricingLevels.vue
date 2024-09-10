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
  <div class="text-center">
    <div :style="{ height: height }" class="exp-container">
      <div
        v-for="(item, i) in sorted_list"
        :key="i"
        :class="{
          disabled: activeExtraPriceId && activeExtraPriceId !== item.id,
        }"
        :style="{
          height: `${Math.round(
            (100 * (item.price - item.discount + item.commission)) / max_price,
          )}%`,
          'flex-grow': `${item.min / max_quantity}`,
          backgroundColor:
            inventoryQuantity !== null && item.min > inventoryQuantity
              ? '#000'
              : getColor(i),
        }"
        class="exp-item"
      >
        <v-tooltip
          activator="parent"
          max-width="360"
          content-class="bg-black text-start"
          location="bottom"
        >
          <div>
            {{ $t("extra_pricing_levels.min_quantity") }}:
            <b class="ms-1">{{ numeralFormat(item.min, "0.[0] a") }}</b>
          </div>
          <div>
            {{ $t("global.commons.price") }}:

            <template v-if="originalPricing">
              <u-price
                  :amount="originalPricing.price"
                  :currency="product.currency"
                  class="ms-1"
              ></u-price>
              <v-icon class="mx-2" size="small"
              >{{ $t("icons.arrow_end") }}
              </v-icon>
            </template>

            <u-price
              :amount="item.price"
              :currency="product.currency"
              class="ms-1"
            ></u-price>

          </div>
          <div>
            {{ $t("global.commons.discount") }}:
            <template v-if="originalPricing">
              <u-price
                  :amount="originalPricing.discount"
                  :currency="product.currency"
                  class="ms-1"
              ></u-price>
              <v-icon class="mx-2" size="small"
              >{{ $t("icons.arrow_end") }}
              </v-icon>
            </template>

            <u-price
              :amount="item.discount"
              :currency="product.currency"
              class="ms-1"
            ></u-price>
          </div>
          <div
            v-if="inventoryQuantity !== null && item.min > inventoryQuantity"
          >
            <b>🍁 {{ $t("extra_pricing_levels.range_is_out_of_stock") }}</b>
          </div>
        </v-tooltip>
      </div>
    </div>
    <small>
      <v-icon size="x-small">add</v-icon>
      {{ items.length }}
      {{ $t("extra_pricing_levels.extra_pricings") }}.</small
    >
  </div>
</template>

<script>
import { standardDesignColor } from "@selldone/core-js/helper/color/ColorGenerator";

export default {
  name: "ExtraPricingLevels",
  props: {
    product: {
      required: true,
      type: Object,
    },
    extraPricings: {
      type: Array,
      required: true,
    },
    /**
     * Original pricing: product, variant, vendorProduct
     */
    originalPricing: {
      type: Object,
    },
    activeExtraPriceId: {},
    height: { default: "24px" },
    inventoryQuantity: { default: null }, // total quantity of item. If provided then gray not valid ranges!
  },
  computed: {
    sorted_list() {
      return this.items.sortByKey("min", true);
    },
    max_price() {
      if (!this.items.length) return 1;

      let max_item = this.items[0];
      this.items.forEach(
        (i) =>
          (max_item =
            i.price + i.commission - i.discount >
            max_item.price + max_item.commission - max_item.discount
              ? i
              : max_item),
      );

      return max_item.price + max_item.commission - max_item.discount;
    },
    max_quantity() {
      return this.items.maxByKey("min")?.min;
    },

    items() {
      if (this.originalPricing)
        return [
          {
            ...this.originalPricing,
            min: 0,
          },
          ...this.extraPricings,
        ];

      return this.extraPricings;
    },
  },
  methods: {
    getColor(i) {
      if (this.originalPricing) {
        if (i === 0) return "#aaa";
        return standardDesignColor[(i - 1) % standardDesignColor.length];
      }
      return standardDesignColor[i % standardDesignColor.length];
    },
  },
};
</script>

<style lang="scss" scoped>
.exp-container {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  .exp-item {
    flex-grow: 0;
    background: #eee;
    transition: all 0.3s;
    position: relative;
    margin: 0 1px;
    border-radius: 4px;
    min-width: 4px;

    &:hover {
      transform: scale(1.2);
      z-index: 1;
    }
  }
}
</style>
