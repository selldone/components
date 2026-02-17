<template>
  <div class="widget-box mb-5">
    <u-widget-header :title="$t('global.commons.description')" icon="notes" />
    <v-list-subheader>
      Provide short and full descriptions for the listing page.
    </v-list-subheader>

    <v-text-field
      :model-value="subtitle"
      :label="$t('global.commons.subtitle')"
      variant="underlined"
      @update:modelValue="$emit('update:subtitle', $event)"
    />

    <v-textarea
      :model-value="description"
      :label="$t('global.commons.description')"
      variant="underlined"
      auto-grow
      rows="3"
      @update:modelValue="$emit('update:description', $event)"
    />
  </div>
</template>

<script lang="ts">
export default {
  name: "BShopListingItemTabDescription",
  props: {
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  emits: ["update:subtitle", "update:description"],
};
</script>

<style scoped></style>
