<template>
  <v-autocomplete
    v-model="currency"
    :items="currencies"
    :item-text="(i) => $t(i.name) + ' ' + i.code + ' ' + i.country"
    item-value="code"
    :label="label"
    :messages="messages"
    :color="color"
    :rounded="rounded"
    :outlined="outlined"
    :dark="dark"
    :return-object="returnObject"
    :disabled="disabled"
    :hide-details="hideDetails"
    :solo="solo"
    :dense="dense"
    :filled="filled"
    :class="{ 'icon-only-cur': iconOnly, 'small-field': small }"
    :flat="flat"
    @change="(val) => $emit('change', val)"
    :prepend-icon="prependIcon"
    :prepend-inner-icon="prependInnerIcon"
    :clearable="clearable"
    :menu-props="{ minWidth: '200px' }"
    :loading="loading"
    :placeholder="placeholder"
    :background-color="transparent ? 'transparent' : undefined"
    :multiple="multiple"
    :chips="chips"
  >
    <template v-slot:item="{ item }">
      <span>{{ $t(item.name) }}</span>
      <flag v-if="item.flag" class="ms-2" :iso="item.flag" :squared="false" />
      <img
        v-else-if="item.icon"
        class="ms-2"
        :src="item.icon"
        width="20"
        height="20"
      />

      <v-spacer />

      <currency-icon :currency="item" class="mx-1" small></currency-icon>
    </template>

    <template v-slot:selection="{ item, parent }">
      <v-chip
        v-if="chips"
        close
        @click:close="parent.selectItem(item)"
        class="ma-1"
        :color="dark?'#111':'#fff'"
        :dark="dark"
      >
        <span v-if="item && !hideText">
          {{ $t(item.name) }}
        </span>

        <flag
          v-if="item.flag"
          class="ms-2"
          :iso="item.flag"
          :squared="false"
          style="min-width: 16px"
        />
        <img
          v-else-if="item.icon"
          class="ms-2"
          :src="item.icon"
          width="20"
          height="20"
        />
      </v-chip>
      <template v-else>
        <span v-if="item && !hideText">
          {{ $t(item.name) }}
        </span>

        <flag
          v-if="item.flag"
          class="ms-2"
          :iso="item.flag"
          :squared="false"
          style="min-width: 16px"
        />
        <img
          v-else-if="item.icon"
          class="ms-2"
          :src="item.icon"
          width="20"
          height="20"
        />
      </template>
    </template>

    <template v-slot:append>
      <currency-icon
        v-if="!multiple && currencyObject"
        :currency="currencyObject"
        small
      ></currency-icon>
    </template>
  </v-autocomplete>
</template>

<script>
import { Currency } from "@core/enums/payment/Currency";
import CurrencyIcon from "./CurrencyIcon.vue";

export default {
  name: "CurrencyList",
  components: { CurrencyIcon },
  props: {
    value: {},
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
    hideText: {
      default: false,
      type: Boolean,
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
      this.$emit("input", currency);
    },
    value(currency) {
      this.currency = currency;
    },
  },
  created() {
    this.currency = this.value;
  },
};
</script>

<style lang="scss">
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
