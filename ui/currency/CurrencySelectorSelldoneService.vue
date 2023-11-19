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
  <s-currency-selector
    v-model="user_currency"
    :dark="dark"
    :light="light"
    :outlined="outlined"
    :solo="solo"
    :singleLine="singleLine"
    :filled="filled"
    :dense="dense"
    :noRouteQuery="noRouteQuery"
    :icon="icon"
    :rounded="rounded"
    :loading="busy_currency"
    @change="setUserCurrency"
    :save-local-storage="false"
    :hideDetails="hideDetails"
    :maxWidth="maxWidth"
    :flagMode="flagMode"
    :flat="flat"
    flag
    :background-color="backgroundColor"
  ></s-currency-selector>
</template>

<script>
import SetupService from "@core/server/SetupService";
import SCurrencySelector from "./SCurrencySelector.vue";

export default {
  name: "CurrencySelectorSelldoneService",
  components: { SCurrencySelector },

  props:{

    dark: {
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
    rounded: {
      default: false,
      type: Boolean,
    },
    maxWidth: {
    },
    flagMode: {
      // Show flag instead of unicode!
      default: false,
      type: Boolean,
    },
    hideDetails: {
      default: false,
      type: Boolean,
    },
    backgroundColor: {},

  },
  data: () => ({
    user_currency: SetupService.DefaultCurrency(),
    busy_currency: false,


  }),
  watch: {
    USER(user) {
      this.initializeUserCurrency();
    },
    '$store.getters.getUserCurrency'(currency){
      this.user_currency=currency
    }
  },

  methods: {
    initializeUserCurrency() {
      if (
        this.USER() &&
        this.USER().preferences &&
        this.USER().preferences.currency
      ) {
        this.user_currency = this.USER().preferences.currency;
      }else if(this.$store.getters.getUserCurrency){
        this.user_currency = this.$store.getters.getUserCurrency
      }
      this.$store.commit("setUserCurrency", this.user_currency);

    },
    setUserCurrency(currency) {
      //console.log('setUserCurrency',currency)
      this.user_currency = currency;
      this.$store.commit("setUserCurrency", currency);


      if (this.USER()) {
        let preferences = Object.assign({}, this.USER().preferences); // User data embed in html on load!
        if (!preferences) preferences = {};

        preferences.currency = currency;

        this.busy_currency = true;

        this.savePreferences(
          preferences,
          (preferences) => {},
          () => {
            this.busy_currency = false;
          }
        );
      }
    },
  },

  created() {
    this.initializeUserCurrency();
  },
};
</script>

<style scoped></style>
