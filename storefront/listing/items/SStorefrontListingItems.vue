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
    <!-- ✅ Search bar -->
    <s-storefront-listing-search-bar class="mb-3" @apply="onApplySearch" />

    <u-loading-progress v-if="busy" />

    <!-- ✅ Subcategories grid (only when API returns it) -->
    <s-storefront-listing-subcategories-grid
      v-if="subcategories.length"
      class="mb-3"
      :categories="subcategories"
      :selected-id="categoryIdSafe"
      @select="onSelectSubcategory"
    />

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
      <v-card rounded="0" class="text-start">
        <v-toolbar flat>
          <v-btn icon variant="text" @click="preview_dialog = false">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title class="font-weight-black">Preview</v-toolbar-title>

          <v-spacer />

          <v-btn
            v-if="preview_item"
            variant="text"
            @click="goToProfileFromPreview"
          >
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
import SStorefrontListingSubcategoriesGrid from "./card/SStorefrontListingSubcategoriesGrid.vue";

export default {
  name: "SStorefrontListingItems",

  inject: ["$shop"],

  components: {
    SStorefrontListingItemCard,
    SStorefrontListingItemProfile,
    SStorefrontListingSearchBar,
    SStorefrontListingSubcategoriesGrid,
  },

  props: {
    /**
     * Optional legacy support (numeric category id).
     * If not provided, this component resolves category from route param ":category" (slug).
     */
    categoryId: { default: null },

    /**
     * Backend supports 1..3.
     */
    mediaLimit: { type: Number, default: 1 },
  },

  emits: ["select-item", "preview-item", "select-category"],

  data: () => ({
    items: [] as any[],
    subcategories: [] as any[],
    total: 0,

    busy: false,
    busy_more: false,

    page: 1,
    perPage: 24,

    // search state
    search_text: null as string | null,
    sortBy: "created_at_desc" as string,

    // location
    near_lat: null as number | null,
    near_lng: null as number | null,
    radius_km: null as number | null,

    // filters
    filters: {} as Record<string, any>,

    // Preview
    preview_dialog: false,
    preview_busy: false,
    preview_item: null as any | null,

    // category resolving
    categories_db: [] as any[],
    route_category_id: null as number | null,

    // request guards
    _fetch_seq: 0,
    _route_sync_seq: 0,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopName(): string {
      return String(this.shop?.name || "").trim();
    },

    routeCategorySlug(): string | null {
      // router: /listing/:category?
      // @ts-ignore
      const raw = this.$route?.params?.category;
      const s = raw !== undefined && raw !== null ? String(raw).trim() : "";
      return s.length ? s : null;
    },

    categoryIdFromProp(): number | null {
      const raw = (this as any).categoryId;
      const n = raw !== null && raw !== undefined ? parseInt(String(raw), 10) : 0;
      return Number.isFinite(n) && n > 0 ? n : null;
    },

    /**
     * ✅ Single watcher key to avoid double initial calls.
     * This replaces multiple immediate watchers that used to fire together on mount.
     */
    routeSyncKey(): string {
      const shop = this.shopName ? this.shopName.toLowerCase() : "";
      const slug = this.routeCategorySlug ? this.routeCategorySlug.toLowerCase() : "";
      const propId = this.categoryIdFromProp ? String(this.categoryIdFromProp) : "";
      return `${shop}|${propId}|${slug}`;
    },

    categoryIdSafe(): number | null {
      // priority:
      // 1) explicit prop categoryId (legacy)
      // 2) resolved from route slug
      return this.categoryIdFromProp || this.route_category_id || null;
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
    /**
     * ✅ ONE watcher, one fetch.
     * Fixes the "first load = 2 requests" issue.
     */
    routeSyncKey: {
      immediate: true,
      handler() {
        this.syncCategoryFromRouteAndFetch();
      },
    },

    mediaLimit() {
      this.resetAndFetch();
    },
  },

  methods: {
    parseSort() {
      const raw = String(this.sortBy || "created_at_desc");
      const idx = raw.lastIndexOf("_");
      const field = idx > 0 ? raw.substring(0, idx) : raw;
      const dir = idx > 0 ? raw.substring(idx + 1) : "desc";
      return { sortBy: field || "created_at", sortDesc: dir === "desc" };
    },

    onApplySearch(payload: any) {
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

    /**
     * ✅ Subcategory click must NAVIGATE (route change).
     * Route: /listing/:category?  -> use subcategory.slug (no id).
     */
    onSelectSubcategory(cat: any) {
      if (!cat || typeof cat !== "object") return;

      const slug = String(cat?.slug || "").trim();
      if (!slug) return;

      this.$emit("select-category", cat);

      // @ts-ignore
      this.$router?.push(`/listing/${encodeURIComponent(slug)}`);
    },

    resetAndFetch() {
      this.page = 1;
      this.items = [];
      this.subcategories = [];
      this.total = 0;
      this.fetchItems(false);
    },

    buildParams(sortBy: string, sortDesc: boolean) {
      const params: any = {
        offset: this.offset,
        limit: this.perPage,
        media_limit: this.mediaLimitSafe,
        sortBy,
        sortDesc: sortDesc ? "true" : "false", // GET -> string (Laravel friendly)
      };

      if (this.categoryIdSafe) params.category_id = this.categoryIdSafe;

      const s = String(this.search_text || "").trim();
      if (s.length) params.search = s;

      if (Number.isFinite(this.near_lat as any) && Number.isFinite(this.near_lng as any)) {
        params.lat = this.near_lat;
        params.lng = this.near_lng;

        if (Number.isFinite(this.radius_km as any) && (this.radius_km as number) > 0) {
          params.radius_km = this.radius_km;
        }
      }

      if (this.filters && typeof this.filters === "object" && Object.keys(this.filters).length) {
        params.filters = this.filters;
      }

      return params;
    },

    fetchItems(append: boolean) {
      const shopName = this.shopName;
      if (!shopName) return;

      const { sortBy, sortDesc } = this.parseSort();
      const seq = ++this._fetch_seq;

      if (!append) this.busy = true;
      else this.busy_more = true;

      axios
        .get(window.XAPI.GET_SHOP_LISTING_ITEMS(shopName), {
          params: this.buildParams(sortBy, sortDesc),
        })
        .then(({ data }) => {
          if (seq !== this._fetch_seq) return;

          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }

          const list = Array.isArray(data.items) ? data.items : [];
          this.total = parseInt(String(data.total ?? list.length), 10) || 0;

          this.subcategories = Array.isArray(data.subcategories) ? data.subcategories : [];

          if (!append) {
            this.items = list;
            return;
          }

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
          if (seq !== this._fetch_seq) return;
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

    //──────────────────────────────────────────────────────────────
    // Slug -> ID resolving (cached per shop)
    //──────────────────────────────────────────────────────────────

    async syncCategoryFromRouteAndFetch() {
      const seq = ++this._route_sync_seq;

      const shopName = this.shopName;
      if (!shopName) return;

      // If using prop categoryId, skip slug resolving.
      if (this.categoryIdFromProp) {
        this.route_category_id = null;
        this.resetAndFetch();
        return;
      }

      await this.ensureCategoriesLoaded();
      if (seq !== this._route_sync_seq) return;

      const slug = this.routeCategorySlug;

      if (!slug) {
        this.route_category_id = null;
        this.resetAndFetch();
        return;
      }

      // Allow numeric fallback (e.g. /listing/12)
      const numeric = parseInt(slug, 10);
      if (Number.isFinite(numeric) && numeric > 0 && String(numeric) === slug) {
        this.route_category_id = numeric;
        this.resetAndFetch();
        return;
      }

      const found = (this.categories_db || []).find((c: any) => {
        const s = String(c?.slug || "").trim();
        return s && s.toLowerCase() === slug.toLowerCase();
      });

      this.route_category_id = found?.id ? parseInt(String(found.id), 10) || null : null;

      this.resetAndFetch();
    },

    async ensureCategoriesLoaded(): Promise<void> {
      const shopName = this.shopName;
      if (!shopName) return;

      const w: any = window as any;
      if (!w.__SLD_LISTING_CATS_CACHE__) w.__SLD_LISTING_CATS_CACHE__ = {};

      const key = `shop:${shopName.toLowerCase()}`;
      const cached = w.__SLD_LISTING_CATS_CACHE__[key];

      // Cache TTL (10 minutes)
      const ttlMs = 10 * 60 * 1000;

      if (cached && Array.isArray(cached.categories) && Date.now() - (cached.ts || 0) < ttlMs) {
        this.categories_db = cached.categories;
        return;
      }

      try {
        const { data } = await axios.get(window.XAPI.GET_SHOP_LISTING_CATEGORIES(shopName), {
          params: { offset: 0, limit: 100 },
        });

        if (data?.error) {
          NotificationService.showErrorAlert(null, data.error_msg);
          this.categories_db = [];
          return;
        }

        const list = Array.isArray(data.categories) ? data.categories : [];
        this.categories_db = list;

        w.__SLD_LISTING_CATS_CACHE__[key] = { ts: Date.now(), categories: list };
      } catch (e: any) {
        NotificationService.showLaravelError(e);
        this.categories_db = [];
      }
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