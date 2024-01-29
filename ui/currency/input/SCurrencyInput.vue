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
    :items="currencies"
    :item-title="(i) => $t(i.name)"
    item-value="code"
    :label="label"
    :messages="messages"
    :color="color"
    :rounded="rounded"
    :theme="dark ? 'dark' : 'light'"
    :return-object="returnObject"
    :disabled="disabled"
    :hide-details="hideDetails"
    :density="dense ? 'compact' : undefined"
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
    :class="{ 'icon-only-cur': iconOnly, 'small-field': small }"
    :flat="flat"
    @update:model-value="(val) => $emit('change', val)"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :clearable="clearable"

    :loading="loading"
    :placeholder="placeholder"
    :bg-color="transparent ? 'transparent' : undefined"
    :multiple="multiple"
    :chips="chips"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item v-bind="props" :title="$t(item.raw.name)" :subtitle="$t(item.raw.country)" class="text-start" >
        <template v-slot:prepend>
          <flag
            v-if="item.raw.flag"
            class="me-3"
            :iso="item.raw.flag"
            :squared="false"
          />
          <img
            v-else-if="item.raw.icon"
            class="me-3"
            :src="item.raw.icon"
            width="20"
            height="20"
          />
        </template>

        <template v-slot:append>
          <s-currency-icon
            :currency="item.raw"
            class="mx-1"
            small
          ></s-currency-icon>
        </template>
      </v-list-item>
    </template>

    <template v-slot:chip="{ item, parent }">
      <v-chip
        v-if="chips"
        closable
        @click:close="parent.selectItem(item.raw)"
        class="ma-1"
        :color="dark ? '#111' : '#fff'"
      >
        <flag
          v-if="item.raw.flag"
          class="me-2"
          :iso="item.raw.flag"
          :squared="false"
          style="min-width: 16px"
        />
        <img
          v-else-if="item.raw.icon"
          class="me-2"
          :src="item.raw.icon"
          width="20"
          height="20"
        />

        <span>
          {{ $t(item.raw.name) }}
        </span>
      </v-chip>
      <template v-else>
        <flag
          v-if="item.raw.flag"
          class="me-2"
          :iso="item.raw.flag"
          :squared="false"
          style="min-width: 16px"
        />
        <img
          v-else-if="item.raw.icon"
          class="me-2"
          :src="item.raw.icon"
          width="20"
          height="20"
        />

        <span>
          {{ $t(item.raw.name) }}
        </span>
      </template>
    </template>

    <template v-slot:append-inner>
      <s-currency-icon
        v-if="!multiple && currencyObject && showCurrencySign"
        :currency="currencyObject"
        small
      ></s-currency-icon>
    </template>
  </v-autocomplete>
</template>

<script>
import { Currency } from "@core/enums/payment/Currency";
import SCurrencyIcon from "../icon/SCurrencyIcon.vue";

export default {
  name: "SCurrencyInput",
  components: { SCurrencyIcon },
  props: {
    modelValue: {},
    label: {},
    messages: {},
    color: {},

    dark: {
      default: false,
      type: Boolean,
    },
    rounded: {
      default: false,
      type: Boolean,
    },
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
      default: true,
      type: Boolean,
    },

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

    currencyIcon() {
      return this.currencyObject ? this.currencyObject.icon : null;
    },

    currencyName() {
      return this.currencyObject ? this.currencyObject.name : "";
    },
  },

  watch: {
    currency(currency) {
      this.$emit("update:modelValue", currency);
    },
    modelValue(currency) {
      this.currency = currency;
    },
  },
  created() {
    this.currency = this.GetCurrency(this.modelValue);
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

:not(.v-application--is-rtl) {
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

.v-application--is-rtl {
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
