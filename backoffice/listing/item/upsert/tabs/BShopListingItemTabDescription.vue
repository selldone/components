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
          >notes</v-icon
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("global.commons.description") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.item_editor.description_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <u-widget-header
      v-if="!modern"
      :title="$t('global.commons.description')"
      icon="notes"
    />
    <v-list-subheader v-if="!modern">
      Provide short and full descriptions for the listing page.
    </v-list-subheader>

    <v-text-field
      :model-value="subtitle"
      :label="$t('global.commons.subtitle')"
      variant="underlined"
      :class="modern ? 'sd-modern-underlined-field' : undefined"
      @update:modelValue="$emit('update:subtitle', $event)"
    />

    <v-textarea
      :model-value="description"
      :label="$t('global.commons.description')"
      variant="underlined"
      :class="modern ? 'sd-modern-underlined-field' : undefined"
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
    modern: { type: Boolean, default: false },
    subtitle: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  emits: ["update:subtitle", "update:description"],
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
