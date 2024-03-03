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
    v-if="!isService || calculated_price"
    :class="{ 'flex-column-reverse': revers_col }"
    class="px-2 mt-2 d-flex flex-grow-0"
  >
    <div class="price">
      <p v-if="discount_value" class="m-0">
        <price-view
          :amount="discount_value + calculated_price"
          class="discount-value"
          line-through
        ></price-view>
      </p>

      <!-- ..................... Tips of pricing ..................... -->
      <v-tooltip
        v-if="product.pricing === PricingTypes.ESTIMATION.code"
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
        v-if="product.pricing === PricingTypes.AGREEMENT.code"
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
      <price-view
        :amount="calculated_price * price_multi"
        class="price-value font-weight-black single-line"
      ></price-view>

      <small v-if="product.unit" class="ms-2">/ {{ product.unit }}</small>

      <span v-if="price_label" class="mx-1">{{ price_label }}</span>

      <span
        v-if="
          currentVariant &&
          smart_price_enable &&
          hasCountableVariants(currentVariant)
        "
        class="mx-1"
        >(
        <s-product-price
          :product="product"
          :shop="shop"
          :variant="currentVariant"
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

    <product-section-box-for-auction
      :current-variant="currentVariant"
      :product="product"
      :shop="shop"
      class="mb-2 min-width-200"
      style="max-width: 70%"
    ></product-section-box-for-auction>
  </div>
</template>

<script>
import { ProductType } from "@core/enums/product/ProductType";
import { PricingTypes } from "@core/enums/product/PricingTypes";
import { ServiceTypes } from "@core/enums/product/ServiceTypes";
import SProductPrice from "../price/SProductPrice.vue";
import { ExtraPricingHelper } from "@core/helper/shop/ExtraPricingHelper";
import { BasketHelper } from "@core/helper/shop/BasketHelper";
import ProductSectionBoxForAuction from "./ProductSectionBoxForAuction.vue";

export default {
  name: "ProductSectionBoxPrice",
  components: { ProductSectionBoxForAuction, SProductPrice },
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
  },

  data: () => ({
    PricingTypes: PricingTypes,
  }),

  computed: {
    theme() {
      return this.shop.theme;
    },

    revers_col() {
      return (
        this.$vuetify.display.xsOnly &&
        this.calculated_price * this.price_multi > 9999999
      ); /*Long number!*/
    },

    outputs() {
      return this.product.outputs;
    },

    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    calculated_price() {
      let out = 0;
      // 🟣 Marketplace 🟣
      if (this.selectedVendorProduct) {
        out = this.CalcPriceProductCurrentCurrency(
          this.shop,
          this.selectedVendorProduct,
          null,
          this.preferences,
          this.product.valuation,
          null,
          this.current_extra_pricing,
        );
      } else {
        out = this.CalcPriceProductCurrentCurrency(
          this.shop,
          this.product,
          this.currentVariant,
          this.preferences,
          this.product.valuation,
          null,
          this.current_extra_pricing,
        );
      }

      return out;
      /*
                if (this.currentVariant && this.currentVariant.price)
                  return this.currentVariant.price;

                let $out =
                  this.product.price * this.getBuyRateValue(this.product.currency);
                if (this.product.commission) $out += this.product.commission;
                if (this.product.discount) $out -= this.product.discount;
                return $out;*/
    },

    //

    discount_value() {
      return this.getProductDiscountAmount(
        this.shop,
        this.product,
        this.currentVariant,
      );
    },

    discount_percent() {
      return this.discountProductPercent(
        this.shop,
        this.product,
        this.currentVariant,
      );
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    price_multi() {
      if (
        this.isService &&
        this.outputs &&
        ServiceTypes[this.outputs.type].form.includes("booking")
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
      return this.currentVariant && this.currentVariant.pricing
        ? this.currentVariant.price_label
        : this.product.price_label;
    },

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
        this.corresponding_item_in_basket?.count,
      );
    },

    corresponding_item_in_basket() {
      return BasketHelper.FindItem(
        this.basket,
        this.product,
        this.currentVariant,
      );
    },

    basket() {
      return this.getBasket(this.product.type);
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
