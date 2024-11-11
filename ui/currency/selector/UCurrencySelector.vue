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
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Icon Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
  <div v-if="iconOnly" class="inline-block">
    <u-button-circle
      :color="iconColor"
      :tooltip="selectedCurrency"
      dense
      @click="dialog = true"
    >
      <template v-slot:default>
        <u-currency-icon
          :currency="selectedCurrency"
          :style="{ color: iconColor }"
        ></u-currency-icon>
      </template>
      <template v-slot:tooltip>
        <flag :iso="GetCurrency(selectedCurrency).flag" :squared="false" />
      </template>
    </u-button-circle>

    <v-dialog
      v-model="dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>{{ $t("global.commons.currency") }}</v-card-title>
        <v-card-text class="text-start">
          <v-row class="border-between-vertical my-8 max-widget-width mx-auto">
            <v-col
              v-for="currency in currencies"
              :key="currency.code"
              class="pp row-hover"
              cols="12"
              @click="
                (selectedCurrency = currency.code),
                  selectCurrency(currency.code);
                dialog = false;
              "
            >
              <flag :iso="currency.flag" :squared="false" class="mx-1" />

              <span style="min-width: 64px"
                ><u-currency-icon
                  :caption="false"
                  :currency="currency"
                  class="me-2"
                ></u-currency-icon
              ></span>
              {{ $t(currency.name) }}
            </v-col>
          </v-row>
          <div class="min-height-10vh"></div>
        </v-card-text>
        <v-card-actions></v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <v-autocomplete
    v-else
    v-model="selectedCurrency"
    :bg-color="bgColor"
    :class="{ '-small': small }"
    :color="color"
    :density="dense ? 'compact' : 'default'"
    :flat="flat"
    :hide-details="hideDetails"
    :item-title="(i) => $t(i.name)"
    :items="currencies"
    :label="$t('global.currency_selector.label')"
    :loading="loading"
    :menu-props="{ minWidth: '200px' }"
    :multiple="false"
    :return-object="false"
    :rounded="rounded"
    :single-line="singleLine"
    :style="{ 'max-width': maxWidth, 'min-width': minWidth }"
    :theme="dark ? 'dark' : 'light'"
    :variant="
      variant
        ? variant
        : solo
          ? 'solo'
          : filled
            ? 'filled'
            : outlined
              ? 'outlined'
              : undefined
    "
    class="s--currency-selector"
    item-value="code"
    @update:model-value="selectCurrency"
    aria-label="Select Currency"
  >
    <template v-slot:item="{ item, props }">
      <v-list-item :title="$t(item.raw.name)" v-bind="props">
        <template v-slot:prepend>
          <u-currency-icon
            :currency="item.raw"
            class="me-3"
            small
          ></u-currency-icon>
        </template>

        <template v-slot:append>
          <flag
            v-if="item.raw.flag"
            :iso="item.raw.flag"
            :squared="false"
            class="ms-2"
          />
          <img
            v-else-if="item.raw.icon"
            :src="item.raw.icon"
            class="ms-2"
            height="20"
            width="20"
          />
        </template>
      </v-list-item>
    </template>

    <template v-slot:selection="{ item }">
      <u-currency-icon
        :currency="item.raw"
        :flag="flag || flagMode"
        :flag-only="flagMode"
        small
      />

      <span v-if="!icon" class="ms-3">{{ $t(item.raw.name) }}</span>
    </template>
    <template v-if="$slots['append-inner']" v-slot:append-inner>
      <slot name="append-inner"></slot>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";

/**
 * Change currency
 * Save in local storage
 */
export default {
  name: "UCurrencySelector",
  components: { UCurrencyIcon },
  emits: ["change"],
  props: {
    modelValue: {},
    /**
     * If shop is not provided, it will show all currencies
     */
    shop: {},
    dark: {
      type: Boolean,
      default: false,
    },
    flat: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    solo: {
      default: false,
      type: Boolean,
    },
    singleLine: {
      default: false,
      type: Boolean,
    },
    filled: {
      default: false,
      type: Boolean,
    },
    dense: {
      default: false,
      type: Boolean,
    },
    small: {
      default: false,
      type: Boolean,
    },
    noRouteQuery: {
      default: false,
      type: Boolean,
    },
    icon: {
      default: false,
      type: Boolean,
    },
    rounded: { },
    loading: { default: false, type: Boolean },
    maxWidth: {
      default: "220px",
    },
    minWidth: {
      default: "120px",
    },
    bgColor: {},

    saveLocalStorage: {
      //true: for shop admin & false: for main service pricing
      default: true,
      type: Boolean,
    },
    flag: {
      // Show flag
      default: false,
      type: Boolean,
    },

    flagMode: {
      // Show flag instead of unicode!
      default: false,
      type: Boolean,
    },
    color: {},
    hideDetails: {
      default: false,
      type: Boolean,
    },

    iconOnly: { type: Boolean, default: false }, // Show circle button (shop top header)
    iconColor: {},

    variant: {
      type: String,
      //ts  type: String as () => NonNullable<"flat" | "text" | "elevated" | "tonal" | "outlined" | "plain">,
    },
  },

  data: () => ({
    selectedCurrency: null,

    //---------------------------
    dialog: false,
  }),

  computed: {
    currencies() {
      if (!this.shop) return Object.values(Currency).filter((i) => i.enable);
      let out = [];

      for (let key in Currency) {
        let item = Currency[key];
        if (
          item.enable &&
          this.shop.currencies &&
          this.shop.currencies.includes(key)
        )
          out.push(item);
      }

      if (!out.length) out.push(Currency.USD);

      return out;
    },
  },

  watch: {
    currencies() {
      this.validateCurrentCurrency();
    },
    modelValue() {
      this.selectedCurrency = this.modelValue;
    },

    "$route.query.currency"(val) {
      // Current currency (From route query to update multiple currency fields in the shop page)
      if (this.noRouteQuery || !val) return;
      this.selectedCurrency = val;
    },
  },

  methods: {
    selectCurrency(currency) {
      console.log("currency", currency,'save',this.saveLocalStorage);

      if (this.saveLocalStorage) {
        if (this.SetUserSelectedCurrency)
          this.SetUserSelectedCurrency(currency); // Backoffice (Deprecated we should change it!)

        if (window.$storefront)
          window.$storefront.currency = this.isObject(currency)
            ? currency
            : Currency[currency]; // Storefront
      }

      let query = {};
      Object.assign(query, this.$route.query); // Reset to default!
      query.currency = currency;

      if (!this.noRouteQuery) this.$router.replace({ query: query });

      this.$emit("change", currency);
    },

    validateCurrentCurrency() {
      let selectedCurrency_valid = this.currencies.some((item) => {
        return item.code === this.selectedCurrency;
      });

      if (!selectedCurrency_valid) {
        this.selectedCurrency = this.currencies[0].code;
        this.selectCurrency(this.selectedCurrency); // Auto select currency!
      }
    },
  },

  created() {
    if (this.saveLocalStorage) {
      this.selectedCurrency = this.GetUserSelectedCurrency().code;
    } else {
      this.selectedCurrency = this.modelValue;
    }

    if (this.shop) {
      this.validateCurrentCurrency();
    }
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

.s--currency-selector {
  &.-small {
    .v-field {
      --v-field-input-padding-top: 1px;
      --v-field-input-padding-bottom: 1px;
      --v-field-padding-start: 2px;
      --v-input-control-height: 36px;
      font-size: 14px;
    }
  }
}
</style>
