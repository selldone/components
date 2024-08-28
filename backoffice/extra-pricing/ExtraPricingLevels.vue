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
        :title="
          `${$t('extra_pricing_levels.min_quantity')}: ${item.min} | ${$t('global.commons.price')}: ${ConvertPriceToString(item.price, product.currency)} | ${$t('global.commons.discount')}: ${item.discount}` +
          (inventoryQuantity !== null && item.min > inventoryQuantity
            ? ` | 🍁 ${$t('extra_pricing_levels.range_is_out_of_stock')}`
            : '')
        "
        class="exp-item"
      ></div>
    </div>
    <small>
      <v-icon size="x-small">add</v-icon>
      {{ extraPricings.length }} {{$t('extra_pricing_levels.extra_pricings')}}.</small
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
    activeExtraPriceId: {},
    height: { default: "24px" },
    inventoryQuantity: { default: null }, // total quantity of item. If provided then gray not valid ranges!
  },
  computed: {
    sorted_list() {
      return this.extraPricings.sortByKey("min", true);
    },
    max_price() {
      if (!this.extraPricings.length) return 1;

      let max_item = this.extraPricings[0];
      this.extraPricings.forEach(
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
      return this.extraPricings.maxByKey("min")?.min;
    },
  },
  methods: {
    getColor(i) {
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
      transform: scale(1.1) translateY(-1px);
      z-index: 1;
    }
  }
}
</style>
