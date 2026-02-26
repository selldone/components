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

<template>
  <v-card
    :class="['sld-item-card', { 'is-top-hover': hoverTop }]"
    rounded="xl"
    variant="flat"
  >
    <!-- ✅ Featured ribbon badge (minimal black flag) -->
    <div v-if="item?.is_featured" class="sld-featured-ribbon" aria-label="Featured">
      <v-icon start>auto_awesome</v-icon>
      {{ $t("global.commons.featured") }}
    </div>

    <div
      class="sld-top-wrap"
      @mouseenter="hoverTop = true"
      @mouseleave="hoverTop = false"
      @click="onOpen"
    >
      <div class="sld-item-grid">
        <!-- Media -->
        <div class="sld-thumb">
          <img
            v-if="coverImage"
            :src="coverImage"
            class="sld-thumb-img"
            alt="cover"
          />
          <div v-else class="sld-thumb-empty">
            <v-icon size="44" class="text-muted">image</v-icon>
          </div>
        </div>

        <!-- Info -->
        <div class="sld-body">
          <div class="sld-top">
            <div class="sld-title">
              {{ item?.title || "Item" }}
            </div>

            <div v-if="item?.subtitle" class="sld-subtitle">
              {{ item.subtitle }}
            </div>

            <div class="sld-meta">
              <div v-if="item?.tel" class="sld-meta-line">
                <v-icon size="18" class="me-2">call</v-icon>
                <span class="sld-ellipsis">{{ item.tel }}</span>
              </div>

              <div v-if="addressText" class="sld-meta-line">
                <v-icon size="18" class="me-2">location_on</v-icon>
                <span class="sld-ellipsis">{{ addressText }}</span>
              </div>

              <div v-if="item?.website" class="sld-meta-line">
                <v-icon size="18" class="me-2">language</v-icon>
                <span class="sld-ellipsis">{{ websiteDomain }}</span>
              </div>
            </div>
          </div>

          <div class="sld-bottom">
            <div class="d-flex align-center flex-wrap gap-2">
              <v-chip
                v-if="item?.category?.title"
                size="x-small"
                variant="tonal"
                class="sld-chip"
              >
                <v-avatar
                  v-if="item?.category?.icon"
                  size="16"
                  class="me-2"
                  start
                  :image="getShopImagePath(item.category.icon)"
                />
                {{ item.category.title }}
              </v-chip>

              <v-chip
                v-if="priceText"
                size="x-small"
                variant="tonal"
                class="sld-chip"
              >
                <v-icon start size="16">paid</v-icon>
                {{ priceText }}
              </v-chip>

              <!-- keep existing chip (design unchanged) -->
              <v-chip
                v-if="item?.is_featured"
                size="x-small"
                variant="tonal"
                class="sld-chip"
              >
                <v-icon start size="16">star</v-icon>
                Featured
              </v-chip>

              <div v-if="hasRating" class="sld-rating">
                <v-rating
                  :model-value="Number(item?.reviews_average_rating || 0)"
                  readonly
                  density="compact"
                  half-increments
                />
                <div class="text-muted small ms-1">
                  {{ Number(item?.reviews_average_rating || 0).toFixed(1) }}
                </div>
              </div>

              <div v-if="badgeThumbs.length" class="sld-badges">
                <div
                  v-for="b in badgeThumbs"
                  :key="String(b.id)"
                  class="sld-badge"
                  :title="b.title || `Badge #${b.id}`"
                >
                  <img
                    v-if="b.image"
                    :src="getShopImagePath(b.image)"
                    class="sld-badge-img"
                    alt="badge"
                  />
                  <div v-else class="sld-badge-fallback">
                    {{ b.id }}
                  </div>
                </div>

                <v-chip
                  v-if="badgeMoreCount > 0"
                  size="x-small"
                  label
                  variant="tonal"
                  class="sld-chip"
                >
                  +{{ badgeMoreCount }}
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions (all click.stop) -->
    <div v-if="showActions" class="sld-actions" @click.stop>
      <button class="sld-action" type="button" @click.stop="onPreview">
        <v-icon size="18" class="me-2">visibility</v-icon>
        <span class="sld-action-text">Show preview</span>
      </button>

      <div class="sld-action-sep"></div>

      <!-- ✅ Compare (toggle + check mark persisted via localStorage) -->
      <button class="sld-action" type="button" @click.stop="toggleCompare">
        <v-icon size="18" class="me-2">
          {{ isCompared ? "check_circle" : "compare_arrows" }}
        </v-icon>
        <span class="sld-action-text">
          {{ isCompared ? "Compared" : "Compare" }}
        </span>
      </button>

      <div class="sld-action-sep"></div>

      <button
        class="sld-action"
        type="button"
        :disabled="!item?.website"
        @click.stop="onWebsite"
      >
        <v-icon size="18" class="me-2">language</v-icon>
        <span class="sld-action-text">{{ $t("global.commons.website") }}</span>
      </button>

      <div class="sld-action-sep"></div>

      <button class="sld-action" type="button" @click.stop="onOpen">
        <v-icon size="18" class="me-2">person</v-icon>
        <span class="sld-action-text">View profile</span>
      </button>

      <div class="sld-action-sep"></div>

      <button
        class="sld-action"
        type="button"
        :disabled="!item?.email"
        @click.stop="onEmail"
      >
        <v-icon size="18" class="me-2">email</v-icon>
        <span class="sld-action-text">Email</span>
      </button>
    </div>
  </v-card>
</template>

<script lang="ts">
import {
  ListingCompareBus,
  ListingCompareStore,
} from "@selldone/components-vue/storefront/listing/compare/ListingCompareStore";

export default {
  name: "SStorefrontListingItemCard",

  inject: ["$shop"],

  props: {
    item: { type: Object, required: true },
    showActions: { type: Boolean, default: true },

    /**
     * Optional: max items in compare list (Store also caps, this is for UI control)
     */
    compareMax: { type: Number, default: 4 },
  },

  emits: ["open", "preview", "website", "email", "compare"],

  data: () => ({
    hoverTop: false,

    // compare state (persisted via localStorage)
    isCompared: false,

    _compare_handler: null as any,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopName(): string {
      return String(this.shop?.name || "").trim();
    },

    itemId(): number {
      const id = parseInt(String((this as any).item?.id || 0), 10);
      return Number.isFinite(id) && id > 0 ? id : 0;
    },

    coverImage(): string {
      const it: any = this.item;
      const media = Array.isArray(it?.media) ? it.media : [];

      const img =
        media.find(
          (m: any) => String(m?.type || "") === "image" && (m.url || m.path),
        ) || media.find((m: any) => String(m?.type || "") === "image");

      const path = img?.url || img?.path || it?.image || "";
      return path ? this.getShopImagePath(path) : "";
    },

    addressText(): string {
      const it: any = this.item;
      const parts = [it?.address, it?.city, it?.country_code]
        .map((x: any) => String(x || "").trim())
        .filter((x: string) => x.length);

      return parts.join(", ");
    },

    priceText(): string {
      const it: any = this.item;
      if (it?.price === null || it?.price === undefined) return "";
      const cur = it?.currency ? String(it.currency) : "";
      const unit = it?.price_unit ? ` (${it.price_unit})` : "";
      return `${it.price} ${cur}${unit}`.trim();
    },

    hasRating(): boolean {
      const it: any = this.item;
      return (
        Number(it?.reviews_count || 0) > 0 ||
        Number(it?.reviews_average_rating || 0) > 0
      );
    },

    websiteDomain(): string {
      const url = String((this as any).item?.website || "").trim();
      return this.extractDomain(url) || url;
    },

    badgeThumbs(): any[] {
      const it: any = this.item;
      const badges = Array.isArray(it?.badges) ? it.badges : [];
      return badges.length ? badges.slice(0, 4) : [];
    },

    badgeMoreCount(): number {
      const it: any = this.item;
      const badges = Array.isArray(it?.badges) ? it.badges : [];
      return badges.length > 4 ? badges.length - 4 : 0;
    },

    compareMaxSafe(): number {
      const n = parseInt(String((this as any).compareMax || 4), 10) || 4;
      return Math.max(1, Math.min(10, n));
    },
  },

  mounted() {
    this.syncCompareState();

    // Live sync (if another card toggles compare, this updates too)
    this._compare_handler = (e: any) => {
      const s = String(e?.detail?.shop || "").trim();
      if (!s || s !== this.shopName) return;
      this.syncCompareState();
    };

    ListingCompareBus.on(this._compare_handler);
  },

  beforeUnmount() {
    if (this._compare_handler) ListingCompareBus.off(this._compare_handler);
  },

  methods: {
    hasListener(name: string): boolean {
      // Vue 3 puts listeners into $attrs (e.g. onOpen, onPreview)
      // @ts-ignore
      const a = (this as any).$attrs || {};
      return !!a[name];
    },

    getCategorySlug(): string {
      const it: any = this.item;

      const slug =
        String(it?.category?.slug || it?.category_slug || "").trim();

      if (slug) return slug;

      // fallback to current route param ":category" if available
      // @ts-ignore
      const routeSlug = this.$route?.params?.category;
      return routeSlug ? String(routeSlug).trim() : "";
    },

    getItemSegment(): string {
      const id = this.itemId;
      if (!id) return "";

      const rawSlug = String((this as any).item?.slug || "").trim();
      const suffix = `-${id}`;

      // If slug already ends with "-{id}", keep it.
      if (rawSlug && rawSlug.endsWith(suffix)) return rawSlug;

      // If slug empty, just use id.
      if (!rawSlug) return String(id);

      // Otherwise append "-id"
      return `${rawSlug}${suffix}`;
    },

    goToProfile() {
      const categorySlug = this.getCategorySlug();
      const itemSeg = this.getItemSegment();
      if (!categorySlug || !itemSeg) return;

      // Uses your router:
      // name: StorefrontListingItemProfile
      // path: /listing/:category/:item
      // @ts-ignore
      this.$router.push({
        name: "StorefrontListingItemProfile",
        params: { category: categorySlug, item: itemSeg },
      });
    },

    syncCompareState() {
      const s = this.shopName;
      const id = this.itemId;
      if (!s || !id) {
        this.isCompared = false;
        return;
      }
      this.isCompared = ListingCompareStore.has(s, id);
    },

    toggleCompare() {
      const s = this.shopName;
      if (!s || !this.itemId) return;

      ListingCompareStore.toggle(s, this.item, this.compareMaxSafe);
      this.syncCompareState();

      this.$emit("compare", { item: this.item, active: this.isCompared });
    },

    onOpen() {
      // If parent explicitly listens, keep old behavior.
      // Otherwise be self-functional and route to profile.
      // @ts-ignore
      if (this.hasListener("onOpen")) {
        this.$emit("open", this.item);
        return;
      }
      this.goToProfile();
    },

    onPreview() {
      // Preview is usually handled by parent (dialog). Keep it as-is.
      this.$emit("preview", this.item);
    },

    onWebsite() {
      const url = String((this as any).item?.website || "").trim();
      if (!url) return;

      const hasProto = url.startsWith("http://") || url.startsWith("https://");
      const finalUrl = hasProto ? url : `https://${url}`;

      this.$emit("website", finalUrl);
      window.open(finalUrl, "_blank", "noopener,noreferrer");
    },

    onEmail() {
      const email = String((this as any).item?.email || "").trim();
      if (!email) return;

      this.$emit("email", email);
      window.location.href = `mailto:${email}`;
    },

    extractDomain(url: string): string {
      try {
        const hasProto = url.startsWith("http://") || url.startsWith("https://");
        const u = new URL(hasProto ? url : `https://${url}`);
        return u.hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-item-card {
  position: relative; /* needed for ribbon positioning */

  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: box-shadow 0.18s ease, transform 0.18s ease;

  &.is-top-hover {
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.10);
    transform: translateY(-1px);
  }
}

/* Minimal "hanging flag" Featured badge (kept as-is from your code) */
.sld-featured-ribbon {
  position: absolute;
  top: 10px;
  right: 12px;
  z-index: 3;
  border-radius: 4px;

  background: #009688;
  color: #fff;

  font-weight: 900;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  padding: 12px 14px 14px;
  line-height: 1;

  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.16);

  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 52% 82%, 0% 100%);
  pointer-events: none;
}

.sld-top-wrap {
  cursor: pointer;
}

.sld-item-grid {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 14px;
  padding: 14px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

.sld-thumb {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.03);
  min-height: 140px;
}

.sld-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.sld-thumb-empty {
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 700px) {
    height: 220px;
  }
}

.sld-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.sld-title {
  font-weight: 900;
  font-size: 18px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.sld-subtitle {
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.55);
  overflow-wrap: anywhere;
}

.sld-meta {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.sld-meta-line {
  display: flex;
  align-items: center;
  min-width: 0;
  color: rgba(0, 0, 0, 0.62);
}

.sld-ellipsis {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sld-bottom {
  margin-top: 12px;
}

.sld-chip {
  background: rgba(0, 0, 0, 0.04) !important;
  margin-inline-end: 2px;
}

.sld-rating {
  display: inline-flex;
  align-items: center;
}

.sld-badges {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sld-badge {
  width: 26px;
  height: 26px;
  border-radius: 9px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(20, 20, 20, 0.08);
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sld-badge-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sld-badge-fallback {
  font-weight: 800;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.55);
}

/* Action bar */
.sld-actions {
  display: flex;
  align-items: stretch;
  border-top: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.012);

  @media (max-width: 700px) {
    flex-wrap: wrap;
  }
}

.sld-action-sep {
  width: 1px;
  background: rgba(20, 20, 20, 0.08);

  @media (max-width: 700px) {
    display: none;
  }
}

.sld-action {
  flex: 1 1 0;
  padding: 12px 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: 0;
  cursor: pointer;
  color: rgba(0, 0, 0, 0.78);
  font-weight: 600;

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }

  @media (max-width: 700px) {
    flex: 1 1 50%;
    border-top: 1px solid rgba(20, 20, 20, 0.08);
  }
}

.sld-action-text {
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>