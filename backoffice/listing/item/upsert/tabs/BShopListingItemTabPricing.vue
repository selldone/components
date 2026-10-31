<template>
  <div
    :class="
      modern
        ? 'b-listing-item-tab b-listing-item-tab--modern sd-modern-widget text-start'
        : 'widget-box mb-5'
    "
  >
    <header v-if="modern" class="sd-modern-header b-listing-item-tab__header">
      <div class="sd-modern-title">
        <v-icon
          class="sd-modern-icon sd-modern-icon--plain"
          size="22"
          aria-hidden="true"
          >price_change</v-icon
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("global.commons.finance") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.item_editor.pricing_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <u-widget-header
      v-if="!modern"
      :title="$t('global.commons.finance')"
      icon="price_change"
    />
    <v-list-subheader v-if="!modern">
      Optional pricing data for filters and UI display.
    </v-list-subheader>

    <div
      :class="
        modern ? 'sd-modern-form-grid b-listing-item-tab__fields' : undefined
      "
    >
      <u-currency-input
        :model-value="currency"
        :label="$t('global.commons.currency')"
        :return-object="false"
        :active-currencies="activeCurrencies"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:currency', $event)"
      />

      <u-price-input
        :model-value="price"
        :decimal="currencyObject?.floats || 2"
        :label="$t('global.sort.price')"
        :suffix="currency"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : 'strong-field'"
        @update:modelValue="$emit('update:price', $event)"
      />

      <u-price-input
        :model-value="priceTo"
        :decimal="currencyObject?.floats || 2"
        :label="$t('shop_listing.items.price_to')"
        :suffix="currency"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : 'strong-field'"
        @update:modelValue="$emit('update:priceTo', $event)"
      />

      <v-text-field
        :model-value="priceUnit"
        :label="$t('shop_listing.items.price_unit')"
        :hint="
          modern
            ? $t('shop_listing.item_editor.price_unit_hint')
            : 'Example: fixed, per_hour, per_night, ...'
        "
        persistent-hint
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:priceUnit', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import UPriceInput from "@selldone/components-vue/ui/price/input/UPriceInput.vue";
import UCurrencyInput from "@selldone/components-vue/ui/currency/input/UCurrencyInput.vue";

export default {
  name: "BShopListingItemTabPricing",
  components: { UPriceInput, UCurrencyInput },

  props: {
    modern: { type: Boolean, default: false },
    currency: { type: String, default: "" },
    price: { default: null },
    priceTo: { default: null },
    priceUnit: { type: String, default: "" },

    currencyObject: { default: null },
    activeCurrencies: { type: Array, default: () => [] },
  },

  emits: [
    "update:currency",
    "update:price",
    "update:priceTo",
    "update:priceUnit",
  ],
};
</script>

<style scoped>
.b-listing-item-tab--modern {
  padding: 24px;
  border: 0;
  border-radius: 16px;
  box-shadow: none;
  font-size: 14px;
  line-height: 1.6;
}
.b-listing-item-tab--modern .sd-modern-title-text {
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
}
.b-listing-item-tab--modern .sd-modern-subtitle {
  margin-block-start: 5px;
  font-size: 13px;
  line-height: 21px;
}
.b-listing-item-tab__header {
  margin-block-end: 24px;
}

@media (max-width: 600px) {
  .b-listing-item-tab--modern {
    padding: 18px;
  }
}
</style>
