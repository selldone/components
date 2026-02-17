<template>
  <div class="widget-box mb-5">
    <u-widget-header :title="$t('global.commons.contact')" icon="contact_phone" />
    <v-list-subheader>
      Contact fields and public links.
    </v-list-subheader>

    <v-text-field
      :model-value="tel"
      :label="$t('global.commons.tel')"
      variant="underlined"
      @update:modelValue="$emit('update:tel', $event)"
    />

    <v-text-field
      :model-value="email"
      :label="$t('global.commons.email')"
      variant="underlined"
      @update:modelValue="$emit('update:email', $event)"
    />

    <v-text-field
      :model-value="website"
      :label="$t('global.commons.website')"
      variant="underlined"
      @update:modelValue="$emit('update:website', $event)"
    />

    <hr class="my-3" />

    <b-listing-links-input
      :model-value="links"
      :label="$t('shop_listing.items.links')"
      variant="underlined"
      @update:modelValue="$emit('update:links', $event)"
    />
  </div>
</template>

<script lang="ts">
import BListingLinksInput from "@selldone/components-vue/backoffice/listing/links/input/BListingLinksInput.vue";

export default {
  name: "BShopListingItemTabContact",
  components: { BListingLinksInput },

  props: {
    tel: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    links: { type: Array, default: () => [] },
  },

  emits: ["update:tel", "update:email", "update:website", "update:links"],
};
</script>

<style scoped></style>
