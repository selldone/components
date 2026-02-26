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
  <div class="text-start sld-prof">
    <u-loading-progress v-if="busy" />

    <v-alert
      v-if="error_text"
      type="error"
      variant="tonal"
      border="start"
      class="mb-4"
    >
      {{ error_text }}
    </v-alert>

    <div v-if="item" class="sld-prof__wrap">
      <!-- HERO -->
      <s-storefront-listing-item-profile-hero
        :item="item"
        :images="images"
        :hero-height="heroHeight"
        :price-text="priceText"
        :company="item.company"
        :media="mediaAttachments"
        @open:url="openUrl"
      />

      <!-- BADGES (optimized: uses badge_ids + internal cache in component) -->
      <s-storefront-listing-item-profile-badges
        v-if="Array.isArray(item.badge_ids) && item.badge_ids.length"
        class="mt-4"
        :badge-ids="item.badge_ids"
      />

      <!-- MAIN CONTENT GRID -->
      <div class="mt-4 sld-prof__grid">
        <!-- LEFT -->
        <div class="sld-prof__left">
          <s-storefront-listing-item-profile-bio
            class="mb-4"
            :title="bioTitle"
            :text="bioText"
          />

          <s-storefront-listing-item-profile-meta :sections="metaSections" />
        </div>

        <!-- RIGHT -->
        <div class="sld-prof__right">
          <s-storefront-listing-item-profile-sidebar
            :item="item"
            :map-url="mapUrl"
            @open:url="openUrl"
          />

          <s-storefront-listing-item-profile-hours
            v-if="hasOpeningHours"
            class="mt-4"
            :opening-hours="item.opening_hours"
          />

          <s-storefront-listing-message-form
            v-if="item"
            class="mt-4"
            :item-id="item.id"
            :item-title="item.title"
            @sent="() => {}"
          />
        </div>
      </div>

      <s-storefront-listing-item-reviews
        v-if="item?.id"
        :item-id="item.id"
        class="mt-4"
      />
    </div>

    <div v-else-if="!busy" class="text-muted py-5 text-center">No data.</div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SStorefrontListingMessageForm from "@selldone/components-vue/storefront/listing/messages/SStorefrontListingMessageForm.vue";
import SStorefrontListingItemReviews from "@selldone/components-vue/backoffice/listing/item/SStorefrontListingItemReviews.vue";

// Child components
import SStorefrontListingItemProfileHero from "./parts/SStorefrontListingItemProfileHero.vue";
import SStorefrontListingItemProfileBadges from "./parts/SStorefrontListingItemProfileBadges.vue";
import SStorefrontListingItemProfileBio from "./parts/SStorefrontListingItemProfileBio.vue";
import SStorefrontListingItemProfileMeta from "./parts/SStorefrontListingItemProfileMeta.vue";
import SStorefrontListingItemProfileSidebar from "./parts/SStorefrontListingItemProfileSidebar.vue";
import SStorefrontListingItemProfileHours from "@selldone/components-vue/storefront/listing/item/parts/SStorefrontListingItemProfileHours.vue";

export default {
  name: "SStorefrontListingItemProfile",

  components: {
    SStorefrontListingMessageForm,
    SStorefrontListingItemReviews,

    SStorefrontListingItemProfileHero,
    SStorefrontListingItemProfileBadges,
    SStorefrontListingItemProfileBio,
    SStorefrontListingItemProfileMeta,
    SStorefrontListingItemProfileSidebar,
    SStorefrontListingItemProfileHours,
  },

  inject: ["$shop"],

  props: {
    /**
     * Legacy support: numeric item id.
     * If not provided, we resolve from route param ":item" using "slug-id" format.
     */
    itemId: { type: Number, default: null },
  },

  data: () => ({
    busy: false,
    error_text: "",
    item: null as any | null,

    _fetch_seq: 0,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopName(): string {
      return String(this.shop?.name || "").trim();
    },

    routeItemSegment(): string {
      // router: /listing/:category/:item
      // @ts-ignore
      const raw = this.$route?.params?.item;
      return raw !== undefined && raw !== null ? String(raw).trim() : "";
    },

    effectiveItemId(): number | null {
      // 1) prop
      const p = this.itemId !== null && this.itemId !== undefined ? parseInt(String(this.itemId), 10) : 0;
      if (Number.isFinite(p) && p > 0) return p;

      // 2) route param "slug-id" (or "id")
      return this.extractIdFromSlugId(this.routeItemSegment);
    },

    fetchKey(): string {
      // single watcher -> prevents double initial fetch
      return `${this.shopName || ""}|${this.effectiveItemId || 0}`;
    },

    heroHeight(): number {
      // @ts-ignore
      return this.$vuetify?.display?.smAndDown ? 260 : 360;
    },

    images(): string[] {
      const media = Array.isArray(this.item?.media) ? this.item.media : [];
      return media
        .filter((m: any) => String(m?.type || "") === "image")
        .sort(
          (a: any, b: any) =>
            (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0) ||
            (a.sort_order ?? 0) - (b.sort_order ?? 0),
        )
        .map((m: any) => m.url || m.path)
        .filter((x: any) => !!x);
    },

    mediaAttachments(): any[] {
      const media = Array.isArray(this.item?.media) ? this.item.media : [];
      return media
        .filter((m: any) => String(m?.type || "") !== "image")
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    },

    hasOpeningHours(): boolean {
      const oh: any = this.item?.opening_hours;
      if (!oh) return false;
      if (Array.isArray(oh)) return oh.length > 0;
      if (typeof oh === "object") return Object.keys(oh).length > 0;
      return false;
    },

    priceText(): string {
      if (this.item?.price === null || this.item?.price === undefined) return "";
      const cur = this.item?.currency ? String(this.item.currency) : "";
      const unit = this.item?.price_unit ? ` (${this.item.price_unit})` : "";
      return `${this.item.price} ${cur}${unit}`.trim();
    },

    bioText(): string {
      const meta = this.item?.meta;
      const bio =
        meta && typeof meta === "object" && !Array.isArray(meta) ? meta.biography : null;

      if (bio && typeof bio === "string" && bio.trim()) return bio;

      if (this.item?.description && String(this.item.description).trim()) {
        return String(this.item.description);
      }

      return "";
    },

    bioTitle(): string {
      const meta = this.item?.meta;
      const hasBio =
        meta &&
        typeof meta === "object" &&
        !Array.isArray(meta) &&
        typeof meta.biography === "string" &&
        String(meta.biography || "").trim().length > 0;

      return hasBio ? "Biography" : "Description";
    },

    mapUrl(): string {
      const lat = this.item?.lat;
      const lng = this.item?.lng;

      if (lat !== null && lat !== undefined && lng !== null && lng !== undefined) {
        return `https://www.google.com/maps?q=${encodeURIComponent(String(lat) + "," + String(lng))}`;
      }

      const parts = [this.item?.address, this.item?.city, this.item?.country_code]
        .map((x: any) => String(x || "").trim())
        .filter((x: string) => x.length);

      if (parts.length) return `https://www.google.com/maps?q=${encodeURIComponent(parts.join(", "))}`;
      return "";
    },

    metaSections(): any[] {
      const meta = this.item?.meta;
      if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [];

      const out: any[] = [];
      Object.keys(meta).forEach((k) => {
        if (k === "biography") return;

        const v = meta[k];
        if (v === null || v === undefined) return;
        if (typeof v === "string" && !v.trim()) return;
        if (Array.isArray(v) && !v.length) return;

        if (
          Array.isArray(v) &&
          v.every((x) => x && typeof x === "object" && "key" in x && "value" in x)
        ) {
          out.push({ key: k, title: this.humanize(k), kind: "kv_list", value: v });
          return;
        }

        if (Array.isArray(v)) {
          out.push({ key: k, title: this.humanize(k), kind: "array", value: v });
          return;
        }

        if (typeof v === "object") {
          out.push({ key: k, title: this.humanize(k), kind: "object", value: v });
          return;
        }

        out.push({ key: k, title: this.humanize(k), kind: "text", value: v });
      });

      return out.sort((a, b) => String(a.title).localeCompare(String(b.title)));
    },
  },

  watch: {
    // Single source of truth for fetching (prevents double fetch on first load)
    fetchKey: {
      immediate: true,
      handler() {
        this.fetchItem();
      },
    },
  },

  methods: {
    extractIdFromSlugId(raw: any): number | null {
      const s = String(raw ?? "").trim();
      if (!s) return null;

      // "123"
      if (/^\d+$/.test(s)) {
        const n = parseInt(s, 10);
        return n > 0 ? n : null;
      }

      // "...-123" (ONLY last dash-number is id)
      const m = s.match(/-(\d+)$/);
      if (!m) return null;

      const id = parseInt(m[1], 10);
      return id > 0 ? id : null;
    },

    openUrl(url: string) {
      const u = String(url || "").trim();
      if (!u) return;

      const hasProto = u.startsWith("http://") || u.startsWith("https://");
      const finalUrl = hasProto ? u : `https://${u}`;

      window.open(finalUrl, "_blank", "noopener,noreferrer");
    },

    humanize(key: string) {
      return String(key || "")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },

    fetchItem() {
      const shopName = this.shopName;
      const id = this.effectiveItemId;

      if (!shopName || !id) return;

      const seq = ++this._fetch_seq;

      this.busy = true;
      this.error_text = "";
      this.item = null;

      axios
        .get(window.XAPI.GET_SHOP_LISTING_ITEM(shopName, id))
        .then(({ data }) => {
          if (seq !== this._fetch_seq) return;

          if (data?.error) {
            this.error_text = data.error_msg || "Item not found.";
            return;
          }

          this.item = data.item || null;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          if (seq !== this._fetch_seq) return;
          this.busy = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
/* SCSS variables (local to this component) */
$sld-prof-max: 1100px;

.sld-prof {
  &__wrap {
    max-width: $sld-prof-max;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 16px;
    align-items: start;

    @media (max-width: 1000px) {
      grid-template-columns: 1fr;
    }
  }
}
</style>