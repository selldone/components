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

import type {ICurrency} from "@selldone/core-js/enums/payment/Currency";
import {Currency} from "@selldone/core-js/enums/payment/Currency";
import {CurrencyHelper, PriceHelper} from "@selldone/core-js/helper";
import {isObject, isString} from "lodash-es";
import {BasketItem, Shop} from "@selldone/core-js/models";
import numeral from "numeral";

const CurrencyMixin = {
  methods: {
    getCurrencyName: function getCurrencyName(
      currency_code: keyof typeof Currency | ICurrency,
    ) {
      if (!currency_code) return "";

      let currency: ICurrency | null = null;
      if (this.isObject(currency_code)) currency = currency_code as ICurrency;
      else if (isString(currency_code))
        currency = Currency[currency_code as string];
      if (!currency) return "";

      return this.$t(currency!.name);
    },

    GetCurrency(currency: keyof typeof Currency | ICurrency) {
      if (!currency) return null;
      if (typeof currency === "string") {
        return Currency[currency];
      } else if ("code" in currency) {
        return Currency[currency.code];
      }
      return null;
    },

    /**
     *
     * @param currency String
     * @constructor
     */
    SetUserSelectedCurrency(currency: ICurrency | keyof typeof Currency) {
      if (isObject(currency)) currency = (currency as ICurrency).code;

      return CurrencyHelper.SetUserSelectedCurrency(
        this.$localstorage_base_path(),
        currency,
      );
    },

    /**
     *
     * @returns {ICurrency}
     * @constructor
     */
    GetUserSelectedCurrency(): ICurrency {
      return CurrencyHelper.GetUserSelectedCurrency(
        this.$localstorage_base_path(),
      );
    },

    /**
     *
     * @returns {String}
     * @constructor
     */
    GetUserSelectedCurrencyName(
      opt_currency: ICurrency | keyof typeof Currency | null = null,
      unicode = false,
    ): String {
      if (isObject(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return this.$t(
        CurrencyHelper.GetUserSelectedCurrencyName(
          this.GetUserSelectedCurrency(this),
          opt_currency,
          unicode,
        ),
      ) as string;
    },

    /**
     * @return {number}
     */
    GetUserSelectedCurrencyFloats(
      opt_currency: ICurrency | keyof typeof Currency | null = null,
    ) {
      if (isObject(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return CurrencyHelper.GetUserSelectedCurrencyFloats(
        this.GetUserSelectedCurrency(this),
        opt_currency,
      );
    },

    /**
     *
     * @returns {string}
     * @constructor
     */
    GetUserSelectedCurrencyFormat(
      opt_currency: ICurrency | null | string = null,
    ) {
      if (opt_currency && isObject(opt_currency))
        opt_currency = (opt_currency as ICurrency).code;

      return CurrencyHelper.GetUserSelectedCurrencyFormat(
        this.GetUserSelectedCurrency(this),
        opt_currency,
      );
    },

    truncate(num: number, places: number) {
      return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
    },

    getFormatPriceCurrency(price: number, currency: keyof typeof Currency) {
      return new Intl.NumberFormat(window.$language?.full_locale, {
        style: "currency",
        currency: currency,
      }).format(price);
    },

    //―――――――――――――――――――――― Price ――――――――――――――――――――

    getAmountAfterPoint(amount: number) {
      return amount
        .toString()
        .replace(/^[^.]+/, "")
        .substring(0, 9);
    },

    getBasketItemPrice(shop: Shop, item: BasketItem) {
      // Final price saved in basket item (no need to apply discount and commission!)
      const to_currency = this.GetUserSelectedCurrency().code;
      return PriceHelper.getBasketItemPrice(shop, item, to_currency);
    },

    getBasketItemSumPriceDiscount(shop: Shop, item: BasketItem) {
      const to_currency = this.GetUserSelectedCurrency().code;
      return PriceHelper.getBasketItemSumPriceDiscount(shop, item, to_currency);
    },

    //―――――――――――――――――――――― Format ――――――――――――――――――――

    FormatNumberCurrency(
        _value: number,
        _currency: keyof typeof Currency | ICurrency | null = null,
    ) {
      const currency_obj =
          _currency && _currency instanceof Object
              ? _currency
              : _currency
                  ? Currency[_currency]
                  : CurrencyHelper.GetUserSelectedCurrency(
                      this.$localstorage_base_path(),
                  );

      if (!currency_obj) return `${_currency} Not exist 🚨!`;
      const value =
          _value * (currency_obj.alt_factor ? currency_obj.alt_factor : 1);

      if (Math.abs(value) < Math.pow(10, -currency_obj.floats)) return '0.00';

      if (Math.abs(value) < 1e-6) {
        const smallValue = value.toFixed(currency_obj.floats); // Ensures currency_obj.floats decimal places for very small values
        // Maintain consistent format
        return smallValue.replace(/^0\.000000/, "0.000000");
      }

      //console.log('--->',numeral(value).format(currency_obj.format),'value:',value,'format:',currency_obj.format)
      return numeral(value).format(currency_obj.format);
    },


  },
};

export default CurrencyMixin;
