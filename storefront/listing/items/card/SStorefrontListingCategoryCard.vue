<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template>
  <v-card
    :class="['sld-cat-card', { 'sld-cat-card--selected': selected }]"
    rounded="xl"
    variant="flat"
    @click="$emit('select', category)"
  >
    <div class="sld-cat-card__inner">
      <div class="sld-cat-card__media">
        <img
          v-if="imageSrc"
          :src="imageSrc"
          class="sld-cat-card__img"
          alt="category"
        />
        <div v-else class="sld-cat-card__fallback">
          <v-icon size="20">folder</v-icon>
        </div>
      </div>

      <div class="sld-cat-card__title text-truncate">
        {{ category?.title || "Category" }}
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingCategoryCard",

  props: {
    category: { type: Object, required: true },
    selected: { type: Boolean, default: false },
  },

  emits: ["select"],

  computed: {
    imageSrc(): string {
      const c: any = this.category || {};
      const path = c?.image || c?.icon || "";
      return path ? this.getShopImagePath(path) : "";
    },
  },
};
</script>

<style lang="scss" scoped>
/* Local SCSS variables */
$sld-cat-card-h: 54px;
$sld-cat-card-radius: 16px;

.sld-cat-card {
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.08);
  }

  &--selected {
    border-color: rgba(0, 0, 0, 0.55);
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.10);
  }

  &__inner {
    height: $sld-cat-card-h;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    min-width: 0;
  }

  &__media {
    width: 34px;
    height: 34px;
    border-radius: $sld-cat-card-radius;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid rgba(20, 20, 20, 0.08);
    flex: 0 0 auto;
    display: grid;
    place-items: center;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &__fallback {
    color: rgba(0, 0, 0, 0.55);
  }

  &__title {
    font-weight: 900;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.85);
    min-width: 0;
  }
}
</style>