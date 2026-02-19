<!--
  - Copyright (c) 2026. Selldone® Business OS™
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
      :label="$t('global.commons.links')"
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
