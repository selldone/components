<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - All rights reserved.
-->

<template>
  <div v-if="items.length" class="sld-compare-bar">
    <div class="sld-compare-panel">
      <!-- Left -->
      <div class="sld-left">
        <div class="sld-header">
          <div class="sld-title">
            Compare
            <span class="sld-count">{{ items.length }}</span>
          </div>
        </div>

        <!-- Horizontal list (always horizontal, never wrap) -->
        <div class="sld-items" aria-label="Compare items">
          <div
            v-for="it in items"
            :key="`cmp_${it.id}`"
            class="sld-tile"
            :title="it.title || ''"
          >
            <!-- Remove (top-right of tile) -->
            <button
              class="sld-remove"
              type="button"
              title="Remove"
              @click.stop="remove(it.id)"
            >
              <v-icon size="16">close</v-icon>
            </button>

            <div class="sld-main">
              <div class="sld-thumb">
                <img
                  v-if="it.image"
                  :src="getShopImagePath(it.image)"
                  class="sld-thumb-img"
                  alt="thumb"
                />
                <div v-else class="sld-thumb-empty">
                  <v-icon size="18">image</v-icon>
                </div>
              </div>

              <div class="sld-meta">
                <div class="sld-name">
                  {{ it.title || `Item #${it.id}` }}
                </div>

                <div class="sld-sub">
                  <span v-if="it.category?.title" class="sld-cat">
                    {{ it.category.title }}
                  </span>

                  <span v-if="hasRating(it)" class="sld-rate">
                    <span class="sld-star">★</span>
                    {{ Number(it.reviews_average_rating || 0).toFixed(1) }}
                  </span>

                  <span v-if="priceText(it)" class="sld-price">
                    {{ priceText(it) }}
                  </span>
                </div>

                <!-- View profile (inside each tile) -->
                <div class="sld-actions">
                  <v-btn
                    size="x-small"
                    variant="text"
                    class="sld-view"
                    @click.stop="goProfile(it)"
                  >
                    <v-icon start size="16">person</v-icon>
                    View profile
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right -->
      <div class="sld-right">
        <v-btn
          color="black"
          variant="flat"
          size="small"
          class="sld-btn"
          :disabled="items.length < 2"
          @click="goCompare"
        >
          <v-icon start>compare_arrows</v-icon>
          Compare
        </v-btn>

        <v-btn variant="text" size="small" class="sld-btn" @click="clear">
          Clear
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  ListingCompareBus,
  ListingCompareStore,
  type ListingCompareMini,
} from "../ListingCompareStore";

export default {
  name: "SStorefrontListingCompareBar",

  inject: ["$shop"],

  data: () => ({
    items: [] as ListingCompareMini[],
    _handler: null as any,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopName(): string {
      return String(this.shop?.name || "").trim();
    },
  },

  mounted() {
    this.load();

    this._handler = (e: any) => {
      const s = String(e?.detail?.shop || "").trim();
      if (!s) return;
      if (s !== this.shopName) return;
      this.load();
    };

    ListingCompareBus.on(this._handler);
  },

  beforeUnmount() {
    if (this._handler) ListingCompareBus.off(this._handler);
  },

  methods: {
    load() {
      if (!this.shopName) return;
      this.items = ListingCompareStore.read(this.shopName);
    },

    remove(id: number) {
      if (!this.shopName) return;
      ListingCompareStore.remove(this.shopName, id);
    },

    clear() {
      if (!this.shopName) return;
      ListingCompareStore.clear(this.shopName);
    },

    hasRating(it: any): boolean {
      return (
        Number(it?.reviews_count || 0) > 0 ||
        Number(it?.reviews_average_rating || 0) > 0
      );
    },

    priceText(it: any): string {
      if (it?.price === null || it?.price === undefined) return "";
      const cur = it?.currency ? String(it.currency) : "";
      const unit = it?.price_unit ? ` (${it.price_unit})` : "";
      return `${it.price} ${cur}${unit}`.trim();
    },

    /**
     * Your public profile route:
     * /@{shop}/listing/:category/:item
     *
     * In storefront router you shared:
     * path: "/listing" ... children include ":category/:item"
     *
     * Here we navigate inside that nested router:
     * /listing/{categorySlug}/{itemSlug}-{id}
     */
    goProfile(it: any) {
      const categorySlug = String(it?.category?.slug || it?.category_slug || "").trim();
      if (!categorySlug) return;

      const id = parseInt(String(it?.id || 0), 10) || 0;
      if (!id) return;

      const slugRaw = String(it?.slug || "").trim();
      const itemSegment = this.ensureSlugHasId(slugRaw, id);

      this.$router.push(`/listing/${encodeURIComponent(categorySlug)}/${encodeURIComponent(itemSegment)}`);
    },

    ensureSlugHasId(slugRaw: string, id: number): string {
      const slug = String(slugRaw || "").trim();

      // If backend already sends "larry-j-kramer-3" as slug, keep it.
      // If slug ends with "-{id}", keep it.
      const suffix = `-${id}`;
      if (slug && slug.endsWith(suffix)) return slug;

      // If slug is only id or empty, use id.
      if (!slug) return String(id);

      // Otherwise append id.
      return `${slug}${suffix}`;
    },

    goCompare() {
      const ids = this.items.map((x) => x.id).join(",");
      this.$router.push({ path: "/listing/compare", query: { ids } });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-compare-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  pointer-events: none;
}

.sld-compare-panel {
  pointer-events: auto;
  width: 100%;
  border-top: 1px solid rgba(20, 20, 20, 0.10);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(18px);
  box-shadow: 0 -10px 24px rgba(0, 0, 0, 0.08);

  display: flex;
  align-items: flex-start;
  gap: 12px;

  padding: 10px 12px;
}

.sld-left {
  flex: 1;
  min-width: 0;
}

.sld-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sld-title {
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sld-count {
  font-size: 12px;
  font-weight: 900;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}

.sld-items {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
  min-width: 0;
}

.sld-items::-webkit-scrollbar {
  height: 8px;
}
.sld-items::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
}
.sld-items::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}

.sld-tile {
  position: relative;
  flex: 0 0 auto;

  width: 340px;
  max-width: 85vw;

  padding: 10px 10px 8px 10px;

  border: 1px solid rgba(20, 20, 20, 0.10);
  background: rgba(0, 0, 0, 0.02);

  display: flex;
  align-items: flex-start;
}

.sld-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.sld-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 0;
  background: rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.75);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.sld-thumb {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
  flex: 0 0 auto;
  margin-top: 2px;
}

.sld-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.sld-thumb-empty {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(0, 0, 0, 0.45);
}

.sld-meta {
  min-width: 0;
  flex: 1;
  text-align: left;
  padding-right: 18px; // space for remove button
}

.sld-name {
  font-weight: 900;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sld-sub {
  margin-top: 2px;
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
  overflow: hidden;
}

.sld-cat {
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.sld-rate,
.sld-price {
  flex: 0 0 auto;
}

.sld-star {
  margin-right: 4px;
  color: rgba(0, 0, 0, 0.65);
}

.sld-actions {
  margin-top: 6px;
  display: flex;
  align-items: flex-start;
}

.sld-view {
  padding: 0 !important;
  min-height: unset !important;
  height: auto !important;
  text-transform: none;
  color: rgba(0, 0, 0, 0.78);
}

.sld-right {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.sld-btn {
  border-radius: 10px;
}

@media (max-width: 520px) {
  .sld-title {
    display: none;
  }

  .sld-tile {
    width: 300px;
  }
}
</style>
