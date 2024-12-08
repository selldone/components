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
  <v-autocomplete
    v-model="currency"
    :bg-color="transparent ? 'transparent' : undefined"
    :chips="chips"
    :class="{ 'icon-only-cur': iconOnly, 'small-field': small }"
    :clearable="clearable"
    :color="color"
    :density="dense ? 'compact' : undefined"
    :disabled="disabled"
    :flat="flat"
    :hide-details="hideDetails"
    :item-title="(i) => (i.name ? $t(i.name) : i)"
    :items="currencies"
    :label="label"
    :loading="loading"
    :messages="messages ? messages : undefined"
    :multiple="multiple"
    :placeholder="placeholder"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :return-object="returnObject"
    :rounded="rounded"
    :single-line="singleLine"
    :theme="dark ? 'dark' : 'light'"
    :variant="
      variant
        ? variant
        : solo && filled
          ? 'solo-filled'
          : filled
            ? 'filled'
            : solo
              ? 'solo'
              : outlined
                ? 'outlined'
                : 'underlined'
    "
    item-value="code"
    @update:model-value="(val) => $emit('change', val)"
    :persistent-placeholder="persistentPlaceholder"
    aria-label="Select Currency"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item
        :subtitle="item.raw.country ? $t(item.raw.country) : undefined"
        :title="item.raw.name ? $t(item.raw.name) : undefined"
        class="text-start"
        v-bind="props"
      >
        <template v-slot:prepend>
          <flag
            v-if="item.raw.flag"
            :iso="item.raw.flag"
            :squared="false"
            class="me-3"
          />
          <img
            v-else-if="item.raw.icon"
            :src="item.raw.icon"
            class="me-3"
            height="20"
            width="20"
          />
        </template>

        <template v-slot:append>
          <u-currency-icon
            :currency="item.raw"
            class="mx-1"
            small
          ></u-currency-icon>
        </template>
      </v-list-item>
    </template>

    <template v-slot:chip="{ item, parent }">
      <v-chip
        v-if="chips"
        :color="dark ? '#111' : '#fff'"
        class="ma-1"
        closable
        @click:close="parent.selectItem(item.raw)"
      >
        <flag
          v-if="item.raw.flag"
          :iso="item.raw.flag"
          :squared="false"
          class="me-2"
          style="min-width: 16px"
        />
        <img
          v-else-if="item.raw.icon"
          :src="item.raw.icon"
          class="me-2"
          height="20"
          width="20"
        />

        <span>
          {{ item.raw.name ? $t(item.raw.name) : item.raw }}
        </span>
      </v-chip>
      <template v-else>
        <flag
          v-if="item.raw.flag"
          :iso="item.raw.flag"
          :squared="false"
          class="me-2"
          style="min-width: 16px"
        />
        <img
          v-else-if="item.raw.icon"
          :src="item.raw.icon"
          class="me-2"
          height="20"
          width="20"
        />

        <span>
          {{ item.raw.name ? $t(item.raw.name) : item.raw }}
        </span>
      </template>
    </template>

    <template v-slot:append-inner>
      <u-currency-icon
        v-if="!multiple && currencyObject && showCurrencySign"
        :currency="currencyObject"
        small
      ></u-currency-icon>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UCurrencyIcon from "../icon/UCurrencyIcon.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "UCurrencyInput",
  mixins: [CurrencyMixin],
  components: { UCurrencyIcon },

  emits: ["update:modelValue", "change"],
  props: {
    modelValue: {},
    label: {},
    messages: {},
    color: {},

    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {},
    outlined: {
      default: false,
      type: Boolean,
    },

    multiple: {
      default: false,
      type: Boolean,
    },
    chips: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },

    returnObject: {
      default: false,
      type: Boolean,
    },
    singleLine: Boolean,
    hideDetails: {
      default: false,
      type: Boolean,
    },
    iconOnly: {
      default: false,
      type: Boolean,
    },
    showCurrencySign: {
      default: false,
      type: Boolean,
    },
    variant: {
      //type: String as () => NonNullable<"flat" | "text" | "elevated" | "tonal" | "outlined" | "plain">,
      //default: null,
    },

    solo: {
      default: false,
      type: Boolean,
    },

    activeCurrencies: {
      require: false,
      type: Array,
    },
    dense: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },

    flat: {
      default: false,
      type: Boolean,
    },
    prependIcon: {},
    prependInnerIcon: {},
    placeholder: {},
    clearable: {
      default: false,
      type: Boolean,
    },
    small: {
      default: false,
      type: Boolean,
    },
    loading: {
      default: false,
      type: Boolean,
    },
    transparent: {
      default: false,
      type: Boolean,
    },
    persistentPlaceholder: Boolean,
  },

  data: () => ({
    currency: Currency.USD,
  }),

  computed: {
    currencies() {
      let out = [];
      for (let key in Currency) {
        if (this.activeCurrencies && !this.activeCurrencies.includes(key))
          continue;

        let item = Currency[key];
        if (item.enable) out.push(item);
      }
      return out;
    },

    currencyObject() {
      if (this.returnObject) return this.currency;
      return this.GetCurrency(this.currency);
    },
  },

  watch: {
    currency(currency) {
      this.$emit(
        "update:modelValue",
        currency
          ? this.returnObject
            ? this.currencyObject
            : this.currencyObject.code
          : null,
      );
    },
    modelValue(currency) {
      this.currency = currency;
    },
  },
  created() {
    this.currency = this.GetCurrency(this.modelValue);

    if (this.currency && !this.returnObject) this.currency = this.currency.code;

    console.log("currency", this.currency, "modelValue", this.modelValue);
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

:not(.v-locale--is-rtl) {
  .icon-only-cur {
    .v-input__control {
      .v-select__slot {
        .v-select__selections {
          margin-left: -8px !important;
        }

        .v-input__append-inner {
          margin-right: -16px !important;
        }
      }
    }
  }
}

.v-locale--is-rtl {
  .icon-only-cur {
    .v-input__control {
      .v-select__slot {
        .v-select__selections {
          margin-right: -8px !important;
          margin-left: auto !important;
        }

        .v-input__append-inner {
          margin-left: -16px !important;
          margin-right: auto !important;
        }
      }
    }
  }
}
</style>
