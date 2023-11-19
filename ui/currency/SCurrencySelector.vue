<template>
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Icon Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
  <div v-if="iconOnly" class="inline-block">
    <circle-button
      dense
      :color="iconColor"
      :tooltip="selectedCurrency"
      @click="dialog = true"
    >
      <template v-slot:default>
        <currency-icon
          :currency="selectedCurrency"
          :style="{ color: iconColor }"
        ></currency-icon>
      </template>
      <template v-slot:tooltip>
        <flag :iso="GetCurrency(selectedCurrency).flag" :squared="false" />
      </template>
    </circle-button>

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
              cols="12"
              v-for="currency in currencies"
              :key="currency.code"
              class="pp row-hover"
              @click="
                (selectedCurrency = currency.code),
                  selectCurrency(currency.code);
                dialog = false;
              "
            >
              <flag :iso="currency.flag" :squared="false" class="mx-1" />

              <span style="min-width: 64px"
                ><currency-icon
                  :currency="currency"
                  :caption="false"
                  class="me-2"
                ></currency-icon
              ></span>
              {{ $t(currency.name) }}
            </v-col>
          </v-row>
          <div class="min-height-10vh"></div>
        </v-card-text>
        <v-card-actions> </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
  <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal Mode ▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

  <v-autocomplete
    v-else
    v-model="selectedCurrency"
    :items="currencies"
    :label="$t('global.currency_selector.label')"
    :hide-details="hideDetails"
    :rounded="rounded"
    :style="{ 'max-width': maxWidth }"
    @change="selectCurrency"
    item-value="code"
    :item-text="(i) => $t(i.name) + ' ' + i.code + ' ' + i.country"
    :return-object="false"
    :dark="dark"
    :light="light"
    :solo="solo"
    :filled="filled"
    :dense="dense"
    :outlined="outlined"
    :background-color="backgroundColor"
    :single-line="singleLine"
    :loading="loading"
    :multiple="false"
    :flat="flat"
    :color="color"
    :class="{ 'small-field': small }"
    :menu-props="{ minWidth: '200px' }"
    class="fix-new-line-input"
  >
    <template v-slot:item="{ item }">
      <currency-icon :currency="item" class="mx-1" small></currency-icon>
      <span class="px-3"> {{ $t(item.name) }}</span>

      <v-spacer></v-spacer>
      <flag v-if="item.flag" class="ms-2" :iso="item.flag" :squared="false" />
      <img
        v-else-if="item.icon"
        class="ms-2"
        :src="item.icon"
        width="20"
        height="20"
      />
    </template>

    <template v-slot:selection="{ item }">
      <currency-icon small :currency="item" :flag="flag || flagMode" class="mx-1" :flag-only="flagMode" />

      <span v-if="!icon" class="px-3">{{ $t(item.name) }}</span>
    </template>
  </v-autocomplete>
</template>

<script>
import { Currency } from "@core/enums/payment/Currency";
import CurrencyIcon from "./CurrencyIcon.vue";

export default {
  name: "SCurrencySelector",
  components: { CurrencyIcon },
  props: {
    value: {},
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
    rounded: {
      default: false,
      type: Boolean,
    },
    loading: { default: false, type: Boolean },
    maxWidth: {
      default: "220px",
    },
    backgroundColor: {},

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
    value() {
      this.selectedCurrency = this.value;
    },

    "$route.query.currency"(val) {
      // Current currency (From route query to update multiple currency fields in the shop page)
      if (this.noRouteQuery || !val) return;
      this.selectedCurrency = val;
    },
  },

  methods: {
    selectCurrency(currency) {
      console.log("currency", currency);

      if (this.saveLocalStorage){
        if( this.SetUserSelectedCurrency) this.SetUserSelectedCurrency(currency); // Backoffice (Deprecated we should change it!)
        if( window.$storefront) window.$storefront.currency=this.isObject(currency)?currency:Currency[currency];// Storefront

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
      this.selectedCurrency = this.value;
    }

    if (this.shop) {
      this.validateCurrentCurrency();
    }
  },
};
</script>

<style lang="scss">
.fix-new-line-input.v-autocomplete.v-input--is-focused {
  input {
    min-width: 44px !important; // Prevent new line in narrow field when a value selected before!
  }
}
</style>
