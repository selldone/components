<template>
  <div class="widget-box mb-5">
    <u-widget-header :title="$t('global.commons.finance')" icon="price_change" />
    <v-list-subheader>
      Optional pricing data for filters and UI display.
    </v-list-subheader>

    <u-currency-input
      :model-value="currency"
      :label="$t('global.commons.currency')"
      :return-object="false"
      :active-currencies="activeCurrencies"
      variant="underlined"
      @update:modelValue="$emit('update:currency', $event)"
    />

    <u-price-input
      :model-value="price"
      :decimal="currencyObject?.floats || 2"
      :label="$t('global.sort.price')"
      :suffix="currency"
      variant="underlined"
      class="strong-field"
      @update:modelValue="$emit('update:price', $event)"
    />

    <u-price-input
      :model-value="priceTo"
      :decimal="currencyObject?.floats || 2"
      :label="$t('shop_listing.items.price_to')"
      :suffix="currency"
      variant="underlined"
      class="strong-field"
      @update:modelValue="$emit('update:priceTo', $event)"
    />

    <v-text-field
      :model-value="priceUnit"
      :label="$t('shop_listing.items.price_unit')"
      hint="Example: fixed, per_hour, per_night, ..."
      persistent-hint
      variant="underlined"
      @update:modelValue="$emit('update:priceUnit', $event)"
    />
  </div>
</template>

<script lang="ts">
import UPriceInput from "@selldone/components-vue/ui/price/input/UPriceInput.vue";
import UCurrencyInput from "@selldone/components-vue/ui/currency/input/UCurrencyInput.vue";

export default {
  name: "BShopListingItemTabPricing",
  components: { UPriceInput, UCurrencyInput },

  props: {
    currency: { type: String, default: "" },
    price: { default: null },
    priceTo: { default: null },
    priceUnit: { type: String, default: "" },

    currencyObject: { default: null },
    activeCurrencies: { type: Array, default: () => [] },
  },

  emits: ["update:currency", "update:price", "update:priceTo", "update:priceUnit"],
};
</script>

<style scoped></style>
