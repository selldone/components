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
  <span
    v-if="!notShowZero || amount"
    :class="{
      medium: medium,
      large: large,
      'x-large': xLarge,
      dark: dark,
      '-invalid': !is_valid_amount,
    }"
    :style="{ 'min-height': minHeight }"
    class="u--price"
  >
    <span v-if="isUnicode && !at_end">{{
      GetUserSelectedCurrencyName(currency_code, true)
    }}</span>

    <span :class="{ 'line-through': lineThrough }">
      {{ absolute_part
      }}<span class="small">{{
        is_valid_amount ? getAmountAfterPoint(formatted_number) : ""
      }}</span>
    </span>
    <span v-if="!isUnicode" class="mx-2 cur-name">{{
      GetUserSelectedCurrencyName(currency_code, true)
    }}</span>

    <span v-if="isUnicode && at_end" class="mx-1">{{
      GetUserSelectedCurrencyName(currency_code, true)
    }}</span>

    <v-tooltip
      v-if="!is_valid_amount"
      activator="parent"
      location="bottom"
      max-width="320"
      content-class="text-start"
    >
      <b>Invalid amount!</b> <br />
      {{
        `⚡ To address the issue, navigate to Shop > Accounting > Exchange > Add Exchange Rate.`
      }}
      <hr />
      <div>
        Amount: {{ amount === null || amount === undefined ? "Null" : amount }},
        Currency: {{ currency_code }}
      </div>
    </v-tooltip>
  </span>
</template>

<script>
import { CurrencyHelper } from "@selldone/core-js/helper/currency/CurrencyHelper";

export default {
  name: "UPrice",
  props: {
    amount: {},
    currency: {}, // null: apply user selected currency (+ Accept currency object / string code)
    lineThrough: {
      type: Boolean,
      default: false,
    },
    medium: {
      type: Boolean,
      default: false,
    },

    large: {
      type: Boolean,
      default: false,
    },
    xLarge: {
      type: Boolean,
      default: false,
    },
    minHeight: {
      default: "unset",
    },
    dark: {
      type: Boolean,
      default: false,
    },
    notShowZero: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    /**
     * At times, when the number is incorrect (like when an exchange rate is unavailable), we might return an error message or an emoji.
     * @returns {boolean}
     */
    is_valid_amount() {
      return (
        this.amount !== null && this.amount !== undefined && !isNaN(this.amount)
      );
    },

    currency_code() {
      return this.isObject(this.currency) ? this.currency.code : this.currency;
    },
    formatted_number() {
      if (!this.is_valid_amount) return null;
      return this.FormatNumberCurrency(this.amount, this.currency_code);
    },
    absolute_part() {
      if (!this.is_valid_amount) return this.amount;
      return this.formatted_number.split(".")[0];
    },
    currency_name() {
      return this.GetUserSelectedCurrencyName(this.currency_code, true);
    },
    isUnicode() {
      return (
        this.currency_name ===
        CurrencyHelper.GetUserSelectedCurrencyUnicode(
          this.GetUserSelectedCurrency(this),
          this.currency_code,
        )
      );
    },

    shop() {
      return this.getShop();
    },
    // ―――――――――――――――――――――― Reverse currency sign position ――――――――――――――――――――――

    at_end() {
      if (this.shop && this.shop.theme && this.shop.theme.reverse_currency)
        return true;

      return CurrencyHelper.GetUserSelectedCurrencySignAtEnd(
        this.GetUserSelectedCurrency(this),
        this.currency_code,
      );
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.u--price {
  font-weight: 600;
  unicode-bidi: plaintext;
  unicode-bidi: -webkit-isolate; // Solve invalid sign position in safari
  transition: all 0.5s;

  span {
    unicode-bidi: initial;
  }

  &.-invalid {
    color: red;
  }

  &.dark {
    color: #fff;

    .line-through {
      text-decoration-color: rgba(255, 255, 255, 0.8);
    }
  }

  .small {
    font-size: 0.7em !important;
    font-weight: 500;
  }

  .line-through {
    text-decoration-line: line-through;
    text-decoration-color: #666;
  }

  &.medium {
    font-size: 1.3rem;
  }

  &.large {
    font-size: 1.6rem;
  }

  &.x-large {
    font-size: 2.4rem;
  }

  .cur-name {
    font-size: 10px !important;
  }
}
</style>
