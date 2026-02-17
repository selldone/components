<!--
  - Copyright (c) 2023-2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved.
  -->

<template>
  <div class="text-start sld-items-wrap">
    <!-- ✅ New search bar (reads shop.listing.search_settings) -->
    <s-storefront-listing-search-bar  class="mb-3" @apply="onApplySearch" />

    <u-loading-progress v-if="busy" />

    <div v-if="items.length" class="sld-items-list">
      <s-storefront-listing-item-card
        v-for="it in items"
        :key="it.id"
        :item="it"
        @open="openItem"
        @preview="openPreview"
      />
    </div>

    <div v-else-if="!busy" class="text-muted py-5 text-center">
      <v-icon class="me-1">sentiment_dissatisfied</v-icon>
      No items found.
    </div>

    <div style="height: 15vh"></div>

    <div class="text-center mt-4" v-if="hasMore">
      <v-btn
        :loading="busy_more"
        :disabled="busy_more"
        variant="outlined"
        @click="loadMore"
      >
        Load more
      </v-btn>
    </div>

    <!-- Preview Dialog -->
    <v-dialog
      v-model="preview_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card rounded="0" class="h-100">
        <v-toolbar flat>
          <v-btn icon variant="text" @click="preview_dialog = false">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title class="font-weight-black">Preview</v-toolbar-title>

          <v-spacer />

          <v-btn v-if="preview_item" variant="text" @click="goToProfileFromPreview">
            <v-icon start>person</v-icon>
            View profile
          </v-btn>
        </v-toolbar>

        <u-loading-progress v-if="preview_busy" />

        <v-card-text class="pt-6">
          <s-storefront-listing-item-profile
            v-if="preview_item_id"
            :item-id="preview_item_id"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SStorefrontListingItemCard from "@selldone/components-vue/storefront/listing/items/card/SStorefrontListingItemCard.vue";
import SStorefrontListingItemProfile from "@selldone/components-vue/storefront/listing/item/SStorefrontListingItemProfile.vue";
import SStorefrontListingSearchBar from "@selldone/components-vue/storefront/listing/search/SStorefrontListingSearchBar.vue";

export default {
  name: "SStorefrontListingItems",

  inject: ["$shop"],

  components: {
    SStorefrontListingItemCard,
    SStorefrontListingItemProfile,
    SStorefrontListingSearchBar,
  },

  props: {
    categoryId: { default: null },

    /**
     * How many image media records to return per item in list endpoint.
     * Backend supports 1..3.
     */
    mediaLimit: { type: Number, default: 1 },
  },

  emits: ["select-item", "preview-item"],

  data: () => ({
    items: [] as any[],
    total: 0,

    busy: false,
    busy_more: false,

    page: 1,
    perPage: 24,

    // search state (set by search bar)
    search_text: null as string | null,

    // Sort is NOT part of search bar anymore (keep internal default; you can control it elsewhere)
    sortBy: "created_at_desc" as string,

    // location
    near_lat: null as number | null,
    near_lng: null as number | null,
    radius_km: null as number | null,

    // filters (meta filters)
    filters: {} as Record<string, any>,

    // Preview
    preview_dialog: false,
    preview_busy: false,
    preview_item: null as any | null,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    offset(): number {
      return (this.page - 1) * this.perPage;
    },

    hasMore(): boolean {
      return (this.items?.length || 0) < (this.total || 0);
    },

    mediaLimitSafe(): number {
      const n = parseInt(String(this.mediaLimit || 1), 10) || 1;
      return Math.max(1, Math.min(3, n));
    },

    preview_item_id(): number | null {
      const id = this.preview_item?.id ? parseInt(String(this.preview_item.id), 10) : 0;
      return id > 0 ? id : null;
    },
  },

  watch: {
    categoryId() {
      this.resetAndFetch();
    },

    mediaLimit() {
      this.resetAndFetch();
    },
  },

  created() {
    this.resetAndFetch();
  },

  methods: {
    parseSort() {
      // Example: "created_at_desc" -> sortBy="created_at", sortDesc=true
      const raw = String(this.sortBy || "created_at_desc");
      const idx = raw.lastIndexOf("_");
      const field = idx > 0 ? raw.substring(0, idx) : raw;
      const dir = idx > 0 ? raw.substring(idx + 1) : "desc";

      return {
        sortBy: field || "created_at",
        sortDesc: dir === "desc",
      };
    },

    onApplySearch(payload: any) {
      // Search bar emits: { search, location, filters }
      this.search_text = payload?.search ? String(payload.search).trim() : null;

      const loc = payload?.location || null;
      const lat = loc?.lat !== null && loc?.lat !== undefined ? Number(loc.lat) : null;
      const lng = loc?.lng !== null && loc?.lng !== undefined ? Number(loc.lng) : null;

      this.near_lat = Number.isFinite(lat as any) ? (lat as number) : null;
      this.near_lng = Number.isFinite(lng as any) ? (lng as number) : null;

      const r = loc?.radius_km !== null && loc?.radius_km !== undefined ? parseInt(String(loc.radius_km), 10) : null;
      this.radius_km = Number.isFinite(r as any) && (r as number) > 0 ? (r as number) : null;

      const f = payload?.filters && typeof payload.filters === "object" ? payload.filters : {};
      this.filters = f || {};

      this.resetAndFetch();
    },

    resetAndFetch() {
      this.page = 1;
      this.items = [];
      this.total = 0;
      this.fetchItems(false);
    },

    buildParams(sortBy: string, sortDesc: boolean) {
      const params: any = {
        offset: this.offset,
        limit: this.perPage,
        media_limit: this.mediaLimitSafe,

        sortBy,
        sortDesc: sortDesc ? "true" : "false",
      };

      const catId =
        this.categoryId !== null && this.categoryId !== undefined
          ? parseInt(String(this.categoryId), 10)
          : 0;

      if (catId > 0) params.category_id = catId;

      const s = String(this.search_text || "").trim();
      if (s.length) params.search = s;

      // Location (send only if valid numbers)
      if (Number.isFinite(this.near_lat as any) && Number.isFinite(this.near_lng as any)) {
        params.lat = this.near_lat;
        params.lng = this.near_lng;

        if (Number.isFinite(this.radius_km as any) && (this.radius_km as number) > 0) {
          params.radius_km = this.radius_km;
        }
      }

      // Filters (send only if non-empty)
      if (this.filters && typeof this.filters === "object" && Object.keys(this.filters).length) {
        params.filters = this.filters;
      }

      return params;
    },

    fetchItems(append: boolean) {
      const shopName = this.shop?.name;
      if (!shopName) return;

      const { sortBy, sortDesc } = this.parseSort();

      if (!append) this.busy = true;
      else this.busy_more = true;

      axios
        .get(window.XAPI.GET_SHOP_LISTING_ITEMS(shopName), {
          params: this.buildParams(sortBy, sortDesc),
        })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          const list = Array.isArray(data.items) ? data.items : [];
          this.total = parseInt(String(data.total ?? list.length), 10) || 0;

          if (!append) {
            this.items = list;
            return;
          }

          // Append without duplicates (safe)
          const map = new Map<number, any>();
          (this.items || []).forEach((r: any) => {
            const id = parseInt(String(r?.id || 0), 10);
            if (id) map.set(id, r);
          });
          list.forEach((r: any) => {
            const id = parseInt(String(r?.id || 0), 10);
            if (id) map.set(id, r);
          });

          this.items = Array.from(map.values());
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy = false;
          this.busy_more = false;
        });
    },

    loadMore() {
      if (!this.hasMore || this.busy_more) return;
      this.page += 1;
      this.fetchItems(true);
    },

    openItem(it: any) {
      this.$emit("select-item", it);
    },

    openPreview(it: any) {
      this.preview_item = it || null;
      this.preview_busy = false;
      this.preview_dialog = true;
      this.$emit("preview-item", it);
    },

    goToProfileFromPreview() {
      if (!this.preview_item) return;
      this.preview_dialog = false;
      this.$emit("select-item", this.preview_item);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-items-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

.sld-items-list {
  display: grid;
  gap: 14px;
}
</style>
