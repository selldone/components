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
  <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->

  <v-row v-if="extra_pricings?.length" class="px-2 mt-2" dense>
    <v-col
      v-for="(extra_pricing, i) in extra_pricings"
      :key="extra_pricing.id"
      :class="{ disabled: total_quantity < extra_pricing.min }"
      cols="6"
      md="3"
      sm="4"
      @click="
        $emit('select', extra_pricing);
        selected_id = extra_pricing.id;
      "
    >
      <div
        :class="{ '-selected': current_extra_pricing?.id === extra_pricing.id }"
        class="ex-price"
      >
        <price-view :amount="calculatedPrice(extra_pricing)"></price-view>
        <small> {{ intervals_string[i] }}</small>
        <v-progress-linear
          v-if="
            total_quantity > 0 && (quantity >= 0 || isLoading(extra_pricing))
          "
          :color="default_color"
          :indeterminate="isLoading(extra_pricing)"
          :model-value="Math.min((100 * quantity) / extra_pricing.min, 100)"
          class="ex-prog"
        ></v-progress-linear>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { PricingTypes } from "@core/enums/product/PricingTypes";
import { ExtraPricingHelper } from "@core/helper/shop/ExtraPricingHelper";
import numeral from "numeral";

export default {
  name: "ProductSectionBoxExtraPricings",
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

    currentVariant: {},
    selectedVendorProduct: {},

    preferences: {},
    quantity: {}, // Items count in the cart
  },

  data: () => ({
    PricingTypes: PricingTypes,
    selected_id: null, //uSed to show loading after click!
  }),

  computed: {
    // 🌸 Add extra pricing 🌸
    extra_pricings() {
      return ExtraPricingHelper.GetListOfExtraPricings(
        this.product,
        this.currentVariant,
        this.selectedVendorProduct,
      );
    },
    current_extra_pricing() {
      return ExtraPricingHelper.FindMatchInList(
        this.extra_pricings,
        this.quantity,
      );
    },

    total_quantity() {
      if (this.selectedVendorProduct)
        return this.selectedVendorProduct.quantity;
      else if (this.currentVariant) return this.currentVariant.quantity;

      return this.product.quantity;
    },

    theme() {
      return this.shop.theme;
    },
    default_color() {
      return this.theme && this.theme.color_buy
        ? this.theme.color_buy
        : "#0061e0";
    },

    intervals_string() {
      const prices = this.extra_pricings;
      let result = [];
      for (let i = 0; i < prices.length; i++) {
        let min = prices[i].min;
        let nextMin = i < prices.length - 1 ? prices[i + 1].min : Infinity;
        let max = nextMin - 1;
        if (max > min && nextMin !== Infinity) {
          result.push(
            `${numeral(min).format("0,0")} ~ ${numeral(max).format("0,0")}`,
          );
        } else {
          result.push(`+ ${numeral(min).format("0,0")}`);
        }
      }
      return result;
    },
  },

  watch: {
    quantity() {
      this.selected_id = null;
    },
  },
  methods: {
    isLoading(extra_pricing) {
      return (
        this.selected_id === extra_pricing.id &&
        this.quantity !== extra_pricing.min
      );
    },

    calculatedPrice(extra_pricing) {
      extra_pricing.currency = this.product.currency; // Need currency to calculate!

      return this.CalcPriceProductCurrentCurrency(
        this.shop,
        extra_pricing,
        null,
        this.preferences,
        this.product.valuation,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.ex-price {
  border: thin #eee solid;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4px;
  user-select: none;
  cursor: pointer;
  position: relative;
  transition: all 0.25s;
  overflow: hidden;

  &:hover {
    box-shadow: 0px 7px 15px 8px rgba(113, 112, 112, 0.24);
  }

  &.-selected {
    box-shadow: 0px 7px 15px 8px rgba(113, 112, 112, 0.24);
  }

  .ex-prog {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
  }
}
</style>
