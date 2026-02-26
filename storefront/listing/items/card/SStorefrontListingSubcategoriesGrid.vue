<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template>
  <div v-if="categoriesSafe.length" class="sld-subcats">
    <div class="sld-subcats__head">
      <v-icon size="18" class="me-2">folder_open</v-icon>
      <div class="sld-subcats__title">Subcategories</div>
    </div>

    <div class="sld-subcats__grid" role="list">
      <s-storefront-listing-category-card
        v-for="c in categoriesSafe"
        :key="String(c.id)"
        :category="c"
        :selected="selectedIdSafe === toId(c?.id)"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import SStorefrontListingCategoryCard from "./SStorefrontListingCategoryCard.vue";

export default {
  name: "SStorefrontListingSubcategoriesGrid",
  components: { SStorefrontListingCategoryCard },

  props: {
    categories: { type: Array, default: () => [] },
    selectedId: { type: [Number, String, null], default: null },
  },

  emits: ["select"],

  computed: {
    categoriesSafe(): any[] {
      return Array.isArray(this.categories) ? this.categories : [];
    },

    selectedIdSafe(): number | null {
      const n = this.toId(this.selectedId);
      return n > 0 ? n : null;
    },
  },

  methods: {
    toId(v: any): number {
      const n = v !== null && v !== undefined ? parseInt(String(v), 10) : 0;
      return Number.isFinite(n) && n > 0 ? n : 0;
    },
  },
};
</script>

<style lang="scss" scoped>
/* Local SCSS variables */
$sld-gap: 10px;

.sld-subcats {
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 18px;
  padding: 12px 12px 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.05);

  &__head {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }

  &__title {
    font-weight: 900;
    color: rgba(0, 0, 0, 0.78);
  }

  &__grid {
    display: grid;
    gap: $sld-gap;
    grid-template-columns: repeat(4, minmax(0, 1fr));

    @media (max-width: 980px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 520px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>