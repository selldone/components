<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="widget-box mb-5">
    <u-widget-header :title="$t('global.commons.general')" icon="tune" />
    <v-list-subheader>
      Select category, optionally set company and badges, then set title/slug
      and status.
    </v-list-subheader>

    <!-- Category (required) -->
    <b-listing-category-input
      :model-value="category"
      :return-object="true"
      :rules="[GlobalRules.required()]"
      variant="outlined"
      prependInnerIcon="folder_open"
      required
      @update:modelValue="$emit('update:category', $event)"
    />

    <hr class="my-3" />



    <!-- Title -->
    <v-text-field
      :model-value="title"
      :label="`${$t('global.sort.title')}*`"
      :rules="[GlobalRules.required()]"
      messages=" "
      variant="underlined"
      @update:modelValue="$emit('update:title', $event)"
      @blur="autoSlug"
    />

    <!-- Slug -->
    <v-text-field
      :model-value="slug"
      :label="$t('global.commons.slug')"
      hint="Optional. If empty, backend generates a unique slug."
      persistent-hint
      variant="underlined"
      @update:modelValue="$emit('update:slug', $event)"
    />
    
    <hr class="my-3" />


    <!-- Company (optional, single select) -->
    <b-listing-company-input
      :model-value="companyId"
      :return-object="false"
      :label="$t('shop_listing.items.company')"
      variant="underlined"
      clearable
      :disabled="false"
      @update:modelValue="$emit('update:companyId', $event)"
      messages="Optional. If set, this item will be linked to the selected company."
    />



    <hr class="my-3" />

    <!-- Badges (optional, multi select via cards) -->
    <b-listing-badge-input
      :model-value="badgeIds"
      :return-object="false"
      :label="$t('shop_listing.items.badges')"
      :disabled="false"
      @update:modelValue="$emit('update:badgeIds', $event)"
    />
    <small class="text-muted d-block mb-3">
      Optional. Select one or more badges to highlight this item on storefront.
    </small>



    <hr class="my-3" />

    <!-- Status -->
    <u-smart-select
      :model-value="status"
      :items="statusOptions"
      item-text="title"
      item-value="value"
      :label="$t('global.commons.status')"
      clearable
      gray-unselected
      class="my-3"
      @update:modelValue="$emit('update:status', $event)"
    />

    <hr />

    <!-- Featured -->
    <u-smart-toggle
      :model-value="isFeatured"
      :true-title="$t('shop_listing.items.is_featured')"
      trueDescription="Show item as featured."
      false-gray
      @update:modelValue="$emit('update:isFeatured', $event)"
    />
  </div>
</template>

<script lang="ts">
import BListingCategoryInput from "@selldone/components-vue/backoffice/listing/category/input/BListingCategoryInput.vue";
import BListingCompanyInput from "@selldone/components-vue/backoffice/listing/company/input/BListingCompanyInput.vue";
import BListingBadgeInput from "@selldone/components-vue/backoffice/listing/badge/input/BListingBadgeInput.vue";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";

export default {
  name: "BShopListingItemTabGeneral",
  components: {
    USmartToggle,
    USmartSelect,
    BListingCategoryInput,
    BListingCompanyInput,
    BListingBadgeInput,
  },

  props: {
    category: { default: null },

    companyId: { default: null }, // number|null
    badgeIds: { type: Array, default: () => [] }, // number[]

    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    status: { default: null },
    isFeatured: { type: Boolean, default: false },

    statusOptions: { type: Array, default: () => [] },
  },

  emits: [
    "update:category",

    "update:companyId",
    "update:badgeIds",

    "update:title",
    "update:slug",
    "update:status",
    "update:isFeatured",
  ],

  methods: {
    autoSlug() {
      if (this.slug) return;
      const s = Slugify.apply(this.title || "");
      if (s) this.$emit("update:slug", s);
    },
  },
};
</script>

<style scoped></style>
