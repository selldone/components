<template>
  <div class="widget-box mb-5">
    <u-widget-header :title="$t('shop_listing.items.opening_hours')" icon="schedule" />
    <v-list-subheader>
      Define opening hours for each weekday.
    </v-list-subheader>

    <b-listing-opening-hours-input
      :model-value="openingHours"
      :label="$t('shop_listing.items.opening_hours')"
      variant="underlined"
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
    openingHours: { type: Array, default: () => [] },
  },

  emits: ["update:openingHours"],
};
</script>

<style scoped></style>
