<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div
    :class="
      modern
        ? 'b-listing-item-general sd-modern-widget text-start'
        : 'widget-box mb-5'
    "
  >
    <u-widget-header
      :class="{ 'sd-modern-form-header': modern }"
      :title="$t('global.commons.general')"
      icon="tune"
    />
    <p v-if="modern" class="sd-modern-subtitle">
      {{ $t("shop_listing.item_editor.general_subtitle") }}
    </p>
    <v-list-subheader v-else>
      Select category, optionally set company and badges, then set title/slug
      and status.
    </v-list-subheader>

    <div :class="{ 'sd-modern-form-group sd-modern-underlined-field': modern }">
      <!-- Category (required) -->
      <b-listing-category-input
        ref="categoryInput"
        :model-value="category"
        :return-object="true"
        :rules="[GlobalRules.required()]"
        :variant="modern ? 'underlined' : 'outlined'"
        :label="$t('global.commons.category')"
        prependInnerIcon="folder_open"
        required
        @update:modelValue="$emit('update:category', $event)"
      >
        <template v-if="canCreateCategory" #append-inner>
          <v-btn
            class="sd-modern-icon-button sd-modern-input-action"
            icon
            type="button"
            variant="text"
            :disabled="disabled"
            :aria-label="$t('shop_listing.category_editor.create_trigger')"
            @mousedown.stop.prevent
            @click.stop="openCategoryDialog"
          >
            <v-icon size="16" aria-hidden="true">add</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
              >{{
                $t("shop_listing.category_editor.create_trigger")
              }}</v-tooltip
            >
          </v-btn>
        </template>
      </b-listing-category-input>

      <hr v-if="!modern" class="my-3" />

      <div :class="{ 'sd-modern-form-grid': modern }">
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
          :hint="
            modern
              ? undefined
              : 'Optional. If empty, backend generates a unique slug.'
          "
          :messages="
            modern ? $t('shop_listing.item_editor.slug_hint') : undefined
          "
          persistent-hint
          variant="underlined"
          @update:modelValue="$emit('update:slug', $event)"
        />
      </div>
    </div>

    <hr v-if="!modern" class="my-3" />

    <div :class="{ 'sd-modern-form-group sd-modern-underlined-field': modern }">
      <!-- Company (optional, single select) -->
      <b-listing-company-input
        :model-value="companyId"
        :return-object="false"
        :label="$t('shop_listing.items.company')"
        variant="underlined"
        clearable
        :disabled="false"
        @update:modelValue="$emit('update:companyId', $event)"
        :messages="
          modern
            ? $t('shop_listing.item_editor.company_hint')
            : 'Optional. If set, this item will be linked to the selected company.'
        "
      />
    </div>

    <hr v-if="!modern" class="my-3" />

    <div :class="{ 'sd-modern-form-group sd-modern-underlined-field': modern }">
      <!-- Badges (optional, multi select) -->
      <b-listing-badge-input
        :modern="modern"
        :model-value="badgeIds"
        :return-object="false"
        :label="$t('shop_listing.items.badges')"
        :disabled="false"
        @update:modelValue="$emit('update:badgeIds', $event)"
      >
        <template v-if="badgeManagementRoute" #append-inner>
          <v-btn
            :to="badgeManagementRoute"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
            variant="text"
            icon
            :aria-label="$t('shop_listing.item_editor.manage_badges')"
            class="sd-modern-icon-button sd-modern-input-action"
            @mousedown.stop
            @click.stop
          >
            <v-icon size="16" aria-hidden="true">north_east</v-icon>
            <v-tooltip
              activator="parent"
              location="top"
              content-class="sd-modern-tooltip text-start"
            >
              {{ $t("shop_listing.item_editor.manage_badges_hint") }}
            </v-tooltip>
          </v-btn>
        </template>
      </b-listing-badge-input>
      <small v-if="!modern" class="text-muted d-block mb-3">
        Optional. Select one or more badges to highlight this item on
        storefront.
      </small>
    </div>

    <hr v-if="!modern" class="my-3" />

    <div :class="{ 'sd-modern-form-group': modern }">
      <h3 v-if="modern" class="sd-modern-eyebrow">
        {{ $t("shop_listing.item_editor.publication") }}
      </h3>

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
        :class="{ 'sd-modern-smart-select': modern }"
        :border="modern"
        :accessible="modern"
        @update:modelValue="$emit('update:status', $event)"
      />

      <hr v-if="!modern" />

      <!-- Featured -->
      <u-smart-toggle
        :model-value="isFeatured"
        :true-title="$t('shop_listing.items.is_featured')"
        :true-description="
          modern
            ? $t('shop_listing.item_editor.featured_hint')
            : 'Show item as featured.'
        "
        :border="modern"
        :accessible="modern"
        false-gray
        @update:modelValue="$emit('update:isFeatured', $event)"
      />
    </div>
    <v-dialog
      v-if="canCreateCategory"
      :model-value="category_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
      @update:model-value="
        (open) => !open && $refs.categoryEditor?.requestClose()
      "
    >
      <b-shop-listing-category-upsert
        v-if="category_dialog_pre"
        ref="categoryEditor"
        modern
        has-close
        @close="category_dialog = false"
        @add="finishCategory"
        @edit="finishCategory"
        @saved="selectCreatedCategory"
      />
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BListingCategoryInput from "@selldone/components-vue/backoffice/listing/category/input/BListingCategoryInput.vue";
import BListingCompanyInput from "@selldone/components-vue/backoffice/listing/company/input/BListingCompanyInput.vue";
import BListingBadgeInput from "@selldone/components-vue/backoffice/listing/badge/input/BListingBadgeInput.vue";
import { Slugify } from "@selldone/core-js/utils/slugify/slugify.ts";
import USmartSelect from "@selldone/components-vue/ui/smart/select/USmartSelect.vue";
import USmartToggle from "@selldone/components-vue/ui/smart/toggle/USmartToggle.vue";
import BShopListingCategoryUpsert from "@selldone/components-vue/backoffice/listing/category/upsert/BShopListingCategoryUpsert.vue";
import { ShopPermissionRegions } from "@selldone/core-js/enums/permission/ShopPermissions";

export default {
  name: "BShopListingItemTabGeneral",
  inject: ["$shop"],
  components: {
    BShopListingCategoryUpsert,
    USmartToggle,
    USmartSelect,
    BListingCategoryInput,
    BListingCompanyInput,
    BListingBadgeInput,
  },

  props: {
    modern: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    category: { default: null },

    companyId: { default: null }, // number|null
    badgeIds: { type: Array, default: () => [] }, // number[]

    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    status: { default: null },
    isFeatured: { type: Boolean, default: false },

    statusOptions: { type: Array, default: () => [] },
  },

  data: () => ({
    category_dialog: false,
    category_dialog_pre: false,
    category_dialog_shop_id: null as number | null,
  }),

  computed: {
    badgeManagementRoute(): any | null {
      const vendor =
        this.$route?.params?.vendor_id ||
        this.$route?.matched?.some((record: any) => record?.meta?.vendor);
      if (
        !this.modern ||
        vendor ||
        !this.$shop?.id ||
        !this.writeShopAccess(ShopPermissionRegions.CATEGORIES.code)
      )
        return null;
      return {
        name: "BPageShopListingBadges",
        params: { shop_id: this.$shop.id },
      };
    },
    canCreateCategory(): boolean {
      const vendor =
        this.$route?.params?.vendor_id &&
        this.$route?.matched?.some((record: any) => record?.meta?.vendor);
      return (
        this.modern &&
        !vendor &&
        !!this.$shop?.id &&
        this.writeShopAccess(ShopPermissionRegions.CATEGORIES.code)
      );
    },
  },

  watch: {
    "$shop.id"() {
      this.category_dialog = false;
      this.category_dialog_pre = false;
      this.category_dialog_shop_id = null;
    },
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
    openCategoryDialog() {
      if (!this.canCreateCategory || this.disabled) return;
      const shopId = this.$shop.id;
      this.category_dialog_shop_id = shopId;
      this.category_dialog_pre = false;
      this.$nextTick(() => {
        if (
          !this.canCreateCategory ||
          this.disabled ||
          this.$shop.id !== shopId
        )
          return;
        this.category_dialog_pre = true;
        this.category_dialog = true;
      });
    },

    selectCreatedCategory(category: any) {
      if (
        !category?.id ||
        !this.canCreateCategory ||
        this.$shop.id !== this.category_dialog_shop_id
      )
        return;
      (this.$refs.categoryInput as any)?.selectCategory(category);
    },

    finishCategory(category: any) {
      this.selectCreatedCategory(category);
      this.category_dialog = false;
    },

    autoSlug() {
      if (this.slug) return;
      const s = Slugify.apply(this.title || "");
      if (s) this.$emit("update:slug", s);
    },
  },
};
</script>

<style scoped lang="scss">
.b-listing-item-general {
  padding: 24px;
  border: 0;
  border-radius: 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;

  > .sd-modern-subtitle {
    margin-block: 0 24px;
    font-size: 13px;
    line-height: 21px;
  }
  .sd-modern-form-group {
    margin-block: 24px 0;
    padding-block-start: 0;
    border-block-start: 0;
  }
  .sd-modern-form-group:first-of-type {
    margin-block-start: 0;
  }
  .sd-modern-form-grid {
    margin-block-start: 14px;
  }

  @media (max-width: 600px) {
    padding: 20px 18px;
  }
}
</style>
