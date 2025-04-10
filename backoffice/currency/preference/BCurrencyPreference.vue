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
  <u-currency-selector
    v-model="user_currency"
    :bg-color="bgColor"
    :dark="dark"
    :dense="dense"
    :filled="filled"
    :flag-mode="flagMode"
    :flat="flat"
    :hideDetails="hideDetails"
    :icon="icon"
    :light="light"
    :max-width="maxWidth"
    :noRouteQuery="noRouteQuery"
    :outlined="outlined"
    :rounded="rounded"
    :save-local-storage="false"
    :singleLine="singleLine"
    :solo="solo"
    :variant="variant"
    flag
    @change="setUserCurrency"
  >
    <template v-slot:append-inner>
      <v-progress-circular
        v-if="busy_currency"
        indeterminate
        size="24"
      ></v-progress-circular>
    </template>
  </u-currency-selector>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { SetupService } from "@selldone/core-js/server/SetupService";
import UCurrencySelector from "../../../ui/currency/selector/UCurrencySelector.vue";

/**
 * Change user language preference
 * Save in database
 */
export default {
  name: "BCurrencyPreference",
  components: { UCurrencySelector },
  emits: ["change"],

  props: {
    dark: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
    variant: {},
    outlined: {
      type: Boolean,
      default: false,
    },
    solo: {
      default: false,
      type: Boolean,
    },
    flat: {
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
    noRouteQuery: {
      default: false,
      type: Boolean,
    },
    icon: {
      default: false,
      type: Boolean,
    },
    rounded: {  },
    maxWidth: {},
    flagMode: {
      // Show flag instead of unicode!
      default: false,
      type: Boolean,
    },
    hideDetails: {
      default: false,
      type: Boolean,
    },
    bgColor: {},

  },
  data: () => ({
    user_currency: SetupService.DefaultCurrency(),
    busy_currency: false,
  }),
  watch: {
    USER() {
      this.initializeUserCurrency();
    },
    "$store.getters.getUserCurrency"(currency) {
      this.user_currency = currency;
    },
  },

  methods: {
    initializeUserCurrency() {
      if (
        this.USER() &&
        this.USER().preferences &&
        this.USER().preferences.currency
      ) {
        this.user_currency = this.USER().preferences.currency;
      } else if (this.$store.getters.getUserCurrency) {
        this.user_currency = this.$store.getters.getUserCurrency;
      }
      this.$store.commit("setUserCurrency", this.user_currency);
    },
    setUserCurrency(currency) {
      this.user_currency = currency;
      this.$store.commit("setUserCurrency", currency);

      if (this.USER()) {
        this.busy_currency = true;

        this.savePreferencesKey("currency", currency)
          .catch((error) => {
            NotificationService.showLaravelError(error);
          })
          .finally(() => {
            this.busy_currency = false;
          });
      }
    },
  },

  created() {
    this.initializeUserCurrency();
  },
};
</script>

<style scoped></style>
