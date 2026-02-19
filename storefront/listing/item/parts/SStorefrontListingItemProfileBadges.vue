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
  <v-card v-if="resolvedBadges.length" class="sld-prof-card" rounded="xl" variant="flat">
    <v-card-text class="pa-4 pa-sm-6">
      <div class="d-flex align-center mb-3">
        <v-icon class="me-2">verified</v-icon>
        <div class="sld-prof-title">Badges</div>
        <v-spacer />
        <v-chip v-if="resolvedBadges.length" size="x-small" label variant="tonal">
          {{ resolvedBadges.length }}
        </v-chip>
      </div>

      <div class="sld-prof-grid">
        <v-tooltip
          v-for="b in resolvedBadges"
          :key="`badge_${b.id}`"
          location="bottom"
          :text="badgeTooltip(b)"
        >
          <template #activator="{ props }">
            <div v-bind="props" class="sld-prof-badge" role="img" :aria-label="badgeTooltip(b)">
              <img
                v-if="b.image"
                :src="getShopImagePath(b.image)"
                class="sld-prof-badge__img"
                :alt="b.title || `Badge #${b.id}`"
                loading="lazy"
              />
              <div v-else class="sld-prof-badge__fallback">
                {{ String(b.id) }}
              </div>

              <div class="sld-prof-badge__caption text-truncate">
                {{ b.title || `Badge #${b.id}` }}
              </div>
            </div>
          </template>
        </v-tooltip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
type BadgeRow = {
  id: number;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
};

declare global {
  interface Window {
    __sld_listing_badges_cache?: Record<
      string,
      {
        byId: Record<number, BadgeRow>;
        fetchedAt: number;
      }
    >;
  }
}

export default {
  name: "SStorefrontListingItemProfileBadges",

  inject: ["$shop"],

  props: {
    badgeIds: { type: Array, default: () => [] }, // number[]
    /**
     * Optional TTL for cache (ms). If null => never refetch.
     * Example: 10 * 60 * 1000 for 10 minutes
     */
    cacheTtl: { type: Number, default: null },
  },

  data: () => ({
    busy: false,
    badgesById: {} as Record<number, BadgeRow>,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopName(): string {
      return String(this.shop?.name || "").trim();
    },

    idsSafe(): number[] {
      const ids = Array.isArray((this as any).badgeIds) ? (this as any).badgeIds : [];
      const out = ids
        .map((x: any) => parseInt(String(x), 10))
        .filter((n: number) => Number.isFinite(n) && n > 0);

      // unique
      return Array.from(new Set(out));
    },

    resolvedBadges(): BadgeRow[] {
      if (!this.idsSafe.length) return [];

      const byId = this.badgesById || {};
      return this.idsSafe.map((id) => {
        return (
          byId[id] || {
            id,
            title: `Badge #${id}`,
            description: null,
            image: null,
          }
        );
      });
    },

    cacheKey(): string {
      // per shop
      return this.shopName ? `shop:${this.shopName}` : "shop:__unknown__";
    },
  },

  watch: {
    shopName: {
      immediate: true,
      handler() {
        this.ensureBadgesLoaded();
      },
    },

    badgeIds: {
      deep: true,
      handler() {
        // Only need to ensure cache is available; no extra fetches if already loaded.
        this.ensureBadgesLoaded();
      },
    },
  },

  methods: {
    badgeTooltip(b: BadgeRow): string {
      const t = String(b?.title || `Badge #${b?.id || ""}`).trim();
      const d = String(b?.description || "").trim();
      return d ? `${t} — ${d}` : t;
    },

    getCache() {
      if (!window.__sld_listing_badges_cache) window.__sld_listing_badges_cache = {};
      return window.__sld_listing_badges_cache;
    },

    isCacheFresh(entry: any): boolean {
      const ttl = (this as any).cacheTtl;
      if (!ttl) return true; // no ttl => always fresh
      const t = entry?.fetchedAt ? Number(entry.fetchedAt) : 0;
      if (!t) return false;
      return Date.now() - t <= ttl;
    },

    async ensureBadgesLoaded() {
      const shopName = this.shopName;
      if (!shopName) return;

      // if we have no badge ids, no need to fetch
      if (!this.idsSafe.length) return;

      const cache = this.getCache();
      const cached = cache[this.cacheKey];

      // use cached when available and fresh
      if (cached && cached.byId && this.isCacheFresh(cached)) {
        this.badgesById = cached.byId;
        return;
      }

      // avoid double fetch
      if (this.busy) return;
      this.busy = true;

      try {
        const { data } = await axios.get(window.XAPI.GET_SHOP_LISTING_ITEM_BADGES(shopName), {
          params: {
            // We can fetch all (max 100). If you prefer only ids, uncomment:
            // ids: this.idsSafe.join(","),
            active_only: "false",
          },
        });

        if (data?.error) return;

        const list = Array.isArray(data?.badges) ? data.badges : [];
        const byId: Record<number, BadgeRow> = {};

        list.forEach((b: any) => {
          const id = parseInt(String(b?.id || 0), 10);
          if (!id) return;
          byId[id] = {
            id,
            title: b?.title ?? null,
            description: b?.description ?? null,
            image: b?.image ?? null,
            is_active: b?.is_active ?? null,
            sort_order: b?.sort_order ?? null,
          };
        });

        // save to window cache
        cache[this.cacheKey] = { byId, fetchedAt: Date.now() };

        this.badgesById = byId;
      } catch (e: any) {
        // keep silent (profile should still render)
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/* Unique SCSS vars */
$sld-prof-badge-size: 64px;
$sld-prof-badge-radius: 16px;
$sld-prof-border: rgba(20, 20, 20, 0.08);
$sld-prof-muted: rgba(0, 0, 0, 0.55);

.sld-prof-card {
  background: #fff;
  border: 1px solid $sld-prof-border;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;
}

.sld-prof-title {
  font-weight: 900;
}

.sld-prof-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.sld-prof-badge {
  width: $sld-prof-badge-size;
  display: grid;
  grid-template-rows: $sld-prof-badge-size auto;
  gap: 6px;
  cursor: default;
}

.sld-prof-badge__img,
.sld-prof-badge__fallback {
  width: $sld-prof-badge-size;
  height: $sld-prof-badge-size;
  border-radius: $sld-prof-badge-radius;
  border: 1px solid $sld-prof-border;
  background: rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.sld-prof-badge__img {
  object-fit: cover;
  display: block;
}

.sld-prof-badge__fallback {
  display: grid;
  place-items: center;
  font-weight: 900;
  font-size: 12px;
  color: $sld-prof-muted;
}

.sld-prof-badge__caption {
  font-size: 12px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.72);
  max-width: $sld-prof-badge-size;
}
</style>
