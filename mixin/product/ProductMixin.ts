/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

import {Currency} from "@selldone/core-js/enums/payment/Currency";
import {PriceHelper} from "@selldone/core-js/helper/price/PriceHelper";

import {Shop} from "@selldone/core-js/models/shop/shop.model";
import type {ProductVariant} from "@selldone/core-js/models/shop/product/product_variant.model";
import {Product} from "@selldone/core-js/models/shop/product/product.model";
import {CurrencyHelper, VendorProduct} from "@selldone/core-js";

const ProductMixin = {
  methods: {
    //―――――――――――――――――――――― Price ――――――――――――――――――――

    /**
     * Get product price (final price)
     * @param shop
     * @param product         Original product : in normal mode | Vendor product : in marketplace mode
     * @param variant
     * @param preferences     Preferences by user (Used in valuation - custom pricing input)
     * @param valuation       Valuation (Pricing forms), Get independently because in marketplace mode we receive vendor product instead of original product.
     * @returns {number}
     */
    CalcPriceProductCurrentCurrency(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      preferences = null,
      valuation = null,
      subscription_price = null, // 🎗️ Subscription
      current_extra_pricing = null, // 🌸 Add extra pricing 🌸
    ) {
      //console.log('CalcPriceProductCurrentCurrency',product,variant)
      const to_currency = CurrencyHelper.GetUserSelectedCurrency(
        this.$localstorage_base_path(),
      ).code;
      return this.priceProductByCurrency(
        shop,
        product,
        variant,
        to_currency,
        preferences,
        valuation,
        subscription_price,
        current_extra_pricing,
      );
    },
    priceProductByCurrency(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      to_currency: keyof typeof Currency,
      preferences = null,
      valuation = null,
      subscription_price = null, // 🎗️ Subscription
      current_extra_pricing = null, // 🌸 Add extra pricing 🌸
    ) {
      try {
        return PriceHelper.priceProductByCurrency(
          shop,
          product,
          variant,
          to_currency,
          preferences,
          valuation,
          subscription_price,
          current_extra_pricing,
        );
      } catch (e) {
        console.error(
          "⚡ To address the issue, navigate to Shop > Accounting > Exchange > Add Exchange Rate.",
          product.currency,
          "->",
          to_currency,
        );
        return "🚨";
      }
    },

    /**
     * Calculate discount (final & check date of discount)
     * @param shop
     * @param product
     * @param variant
     * @returns {*}
     */
    getProductDiscountAmount(shop: Shop, product: Product, variant = null) {
      const to_currency = CurrencyHelper.GetUserSelectedCurrency(
        this.$localstorage_base_path(),
      ).code;
      return this.getProductDiscountAmountByCurrency(
        shop,
        product,
        variant,
        to_currency,
      );
    },
    getProductDiscountAmountByCurrency(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      to_currency: keyof typeof Currency,
    ) {
      try {
        return PriceHelper.getProductDiscountAmountByCurrency(
          shop,
          product,
          variant,
          to_currency,
        );
      } catch (e) {
        console.error(
          "⚡ To address the issue, navigate to Shop > Accounting > Exchange > Add Exchange Rate.",
          product.currency,
          "->",
          to_currency,
        );
        return "🚨";
      }
    },

    discountProductPercent(
      shop: Shop,
      product: Product,
      variant: ProductVariant | null = null,
      to_currency?: keyof typeof Currency | null,
    ) {
      if (!to_currency) to_currency = product.currency; // It's percent!

      return PriceHelper.discountProductPercent(
        shop,
        product,
        variant,
        to_currency!,
      );
    },

    /**
     * Lead -1: Unknown | 0: Instance
     * @param product
     * @param variant
     * @param vendor_product
     */
    leadProduct(
      product: Product,
      variant: ProductVariant | null = null,
      vendor_product: VendorProduct | null = null,
    ) {
      if (!product) return 0;

      // Marketplace:
      if (vendor_product && vendor_product.lead >= 0) {
        return vendor_product.lead;
      }

      // Variant:
      if (variant && variant.lead >= 0) {
        return variant.lead;
      }
      return product.lead;
    },
  },
};

export default ProductMixin;
