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
          >contact_phone</v-icon
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("global.commons.contact") }}
          </h2>
          <p class="sd-modern-subtitle">
            {{ $t("shop_listing.item_editor.contact_subtitle") }}
          </p>
        </div>
      </div>
    </header>
    <u-widget-header
      v-if="!modern"
      :title="$t('global.commons.contact')"
      icon="contact_phone"
    />
    <v-list-subheader v-if="!modern">
      Contact fields and public links.
    </v-list-subheader>

    <div
      :class="
        modern ? 'sd-modern-form-grid b-listing-item-tab__fields' : undefined
      "
    >
      <v-text-field
        :model-value="tel"
        :label="$t('global.commons.tel')"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:tel', $event)"
      />

      <v-text-field
        :model-value="email"
        :label="$t('global.commons.email')"
        variant="underlined"
        :class="modern ? 'sd-modern-underlined-field' : undefined"
        @update:modelValue="$emit('update:email', $event)"
      />

      <v-text-field
        :model-value="website"
        :class="
          modern
            ? 'sd-modern-underlined-field b-listing-item-tab__full'
            : undefined
        "
        :label="$t('global.commons.website')"
        variant="underlined"
        @update:modelValue="$emit('update:website', $event)"
      />

      <hr v-if="!modern" class="my-3" />

      <b-listing-links-input
        :modern="modern"
        :class="
          modern
            ? 'b-listing-item-tab__full sd-modern-underlined-field'
            : undefined
        "
        :model-value="links"
        :label="$t('global.commons.links')"
        variant="underlined"
        @update:modelValue="$emit('update:links', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import BListingLinksInput from "@selldone/components-vue/backoffice/listing/links/input/BListingLinksInput.vue";

export default {
  name: "BShopListingItemTabContact",
  components: { BListingLinksInput },

  props: {
    modern: { type: Boolean, default: false },
    tel: { type: String, default: "" },
    email: { type: String, default: "" },
    website: { type: String, default: "" },
    links: { type: Array, default: () => [] },
  },

  emits: ["update:tel", "update:email", "update:website", "update:links"],
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
.b-listing-item-tab__full {
  grid-column: 1 / -1;
}

@media (max-width: 600px) {
  .b-listing-item-tab--modern {
    padding: 18px;
  }
}
</style>
