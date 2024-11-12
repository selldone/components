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
  <div
    v-if="!isService || calculated_price"
    :class="{ 'flex-column-reverse': revers_col }"
    class="px-2 mt-2 d-flex flex-grow-0"
  >
    <div class="price">
      <p v-if="discount_value" class="m-0">
        <u-price
          :amount="discount_value + calculated_price"
          class="discount-value"
          line-through
        ></u-price>
      </p>

      <!-- ..................... Tips of pricing ..................... -->
      <v-tooltip
        v-if="$product.pricing === PricingTypes.ESTIMATION.code"
        location="top"
        max-width="420"
      >
        <template v-slot:activator="{ props }">
          <span class="d-block" v-bind="props">
            {{ $t("global.commons.starting_price") }}
          </span>
        </template>
        <div>
          {{ $t(PricingTypes.ESTIMATION.message) }}
          <v-img
            :src="PricingTypes.ESTIMATION.image"
            class="mx-auto"
            max-width="250"
          ></v-img>
        </div>
      </v-tooltip>

      <v-tooltip
        v-if="$product.pricing === PricingTypes.AGREEMENT.code"
        location="top"
        max-width="420"
      >
        <template v-slot:activator="{ props }">
          <span class="d-block" v-bind="props">
            {{ $t("global.commons.starting_price") }}
          </span>
        </template>
        <div>
          {{ $t(PricingTypes.AGREEMENT.message) }}
          <v-img
            :src="PricingTypes.AGREEMENT.image"
            class="mx-auto"
            max-width="250"
          ></v-img>
        </div>
      </v-tooltip>
      <!-- ............................................................... -->
      <!-- Price > ⛔ Invalid exchange rate -->
      <u-price-invalid
        v-if="isNaN(calculated_price)"
        :currency="$product.currency"
      >
      </u-price-invalid>

      <u-price
        v-else
        :amount="calculated_price * price_multi"
        class="price-value font-weight-black single-line"
      ></u-price>

      <small v-if="$product.unit" class="ms-2">/ {{ $product.unit }}</small>

      <span v-if="price_label" class="mx-1">{{ price_label }}</span>

      <span
        v-if="$variant && smart_price_enable && hasCountableVariants($variant)"
        class="mx-1"
        >(
        <s-product-price
          :product="$product"
          :variant="$variant"
        ></s-product-price>
        )</span
      >
    </div>
    <v-spacer></v-spacer>

    <!-- 🞇 Discount -->

    <div
      v-if="discount_percent"
      :style="revers_col ? 'align-self: self-end' : ''"
      class="mx-3"
    >
      <p class="discount-text m-2 text-left">
        {{ $t("product_info.discount") }}
      </p>
      <span class="discount-percent text-nowrap"
        >{{ discount_percent }} %
        <v-icon class="ms-1" color="white" size="small">insert_emoticon</v-icon>
      </span>
    </div>
    <v-spacer></v-spacer>

    <!-- ▁▁▁▁▁▁ 🞇 For Auction Inform 🞇 ▁▁▁▁▁▁ -->

    <s-product-section-waiting-auction
      :current-variant="$variant"
      class="mb-2 min-width-200"
      style="max-width: 70%"
    ></s-product-section-waiting-auction>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import { ServiceTypes } from "@selldone/core-js/enums/product/ServiceTypes";
import SProductPrice from "../../../../storefront/product/price/SProductPrice.vue";
import { ExtraPricingHelper } from "@selldone/core-js/helper/shop/ExtraPricingHelper";
import { BasketHelper } from "@selldone/core-js/helper/shop/BasketHelper";
import SProductSectionWaitingAuction from "../auction/SProductSectionWaitingAuction.vue";
import UPriceInvalid from "@selldone/components-vue/ui/price/invalid/UPriceInvalid.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "SProductSectionPrice",
  mixins: [ProductMixin],

  components: { UPriceInvalid, SProductSectionWaitingAuction, SProductPrice },
  inject: ["$shop", "$product", "$variant"],
  props: {
    selectedVendorProduct: {},
    preferences: {},
  },

  data: () => ({
    PricingTypes: PricingTypes,
  }),

  computed: {
    theme() {
      return this.$shop.theme;
    },

    revers_col() {
      return (
        this.$vuetify.display.xs &&
        this.calculated_price * this.price_multi > 9999999
      ); /*Long number!*/
    },

    outputs() {
      return this.$product.outputs;
    },

    isService() {
      return this.$product.type === ProductType.SERVICE.code;
    },

    calculated_price() {
      let out = 0;
      // 🟣 Marketplace 🟣
      if (this.selectedVendorProduct) {
        out = this.CalcPriceProductCurrentCurrency(
          this.$shop,
          this.selectedVendorProduct,
          null,
          this.preferences,
          this.$product.valuation,
          null,
          this.current_extra_pricing,
        );
      } else {
        out = this.CalcPriceProductCurrentCurrency(
          this.$shop,
          this.$product,
          this.$variant,
          this.preferences,
          this.$product.valuation,
          null,
          this.current_extra_pricing,
        );
      }

      return out;
    },

    //

    discount_value() {
      return this.getProductDiscountAmount(
        this.$shop,
        this.$product,
        this.$variant,
      );
    },

    discount_percent() {
      return this.discountProductPercent(
        this.$shop,
        this.$product,
        this.$variant,
      );
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    price_multi() {
      if (
        this.isService &&
        this.outputs &&
        ServiceTypes[this.outputs.type]?.form?.includes("booking")
      ) {
        //console.log("preferences", this.preferences);
        if (
          this.preferences.dates &&
          this.preferences.dates[0] &&
          this.preferences.dates[1]
        ) {
          const diff_days =
            (new Date(this.preferences.dates[1]).getTime() -
              new Date(this.preferences.dates[0]).getTime()) /
            (1000 * 3600 * 24);
          return Math.abs(diff_days);
        }
      }

      return 1;
    },
    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    smart_price_enable() {
      return this.theme && this.theme.smart_price;
    },

    price_label() {
      return this.$variant && this.$variant.pricing
        ? this.$variant.price_label
        : this.$product.price_label;
    },

    // 🌸 Add extra pricing 🌸
    extra_pricings() {
      return ExtraPricingHelper.GetListOfExtraPricings(
        this.$product,
        this.$variant,
        this.selectedVendorProduct,
      );
    },
    current_extra_pricing() {
      return ExtraPricingHelper.FindMatchInList(
        this.extra_pricings,
        this.corresponding_item_in_basket?.count,
      );
    },

    corresponding_item_in_basket() {
      return BasketHelper.FindItem(this.basket, this.$product, this.$variant);
    },

    basket() {
      return this.getBasket(this.$product.type);
    },
  },

  watch: {
    preferences: {
      handler(preferences) {
        //  console.log('Change preferences',preferences)
      },
      deep: true,
    },
  },
  methods: {
    hasCountableVariants(variant) {
      return variant.weight || variant.volume || variant.pack;
    },
  },
};
</script>

<style lang="scss" scoped>
.discount-value {
  color: #222;
  font-size: 1.4rem;
}

.price {
  font-weight: 500;
  color: #4d90fe;
  line-height: 1.5;

  .price-value {
    font-weight: 400;
    font-size: 2.5rem;
  }

  .currency {
    font-size: 1.4em;
    margin-right: 8px;
  }
}

.discount-text {
  color: #c2185b;
}

.discount-percent {
  font-weight: 500;
  background-color: #c2185b;
  color: white;
  border-radius: 0 19px 19px 19px;
  padding: 4px 12px;
}
</style>
