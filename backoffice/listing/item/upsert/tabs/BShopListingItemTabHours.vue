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
          >schedule</v-icon
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("shop_listing.items.opening_hours") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.item_editor.hours_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <u-widget-header
      v-if="!modern"
      :title="$t('shop_listing.items.opening_hours')"
      icon="schedule"
    />
    <v-list-subheader v-if="!modern">
      Define opening hours for each weekday.
    </v-list-subheader>

    <b-listing-opening-hours-input
      :modern="modern"
      :model-value="openingHours"
      :label="$t('shop_listing.items.opening_hours')"
      variant="underlined"
      :class="modern ? 'sd-modern-underlined-field' : undefined"
      @update:modelValue="$emit('update:openingHours', $event)"
    />
  </div>
</template>

<script lang="ts">
import BListingOpeningHoursInput from "@selldone/components-vue/backoffice/listing/opening-hours/input/BListingOpeningHoursInput.vue";

export default {
  name: "BShopListingItemTabHours",
  components: { BListingOpeningHoursInput },

  props: {
    modern: { type: Boolean, default: false },
    openingHours: { type: Array, default: () => [] },
  },

  emits: ["update:openingHours"],
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
