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
  <div class="text-start sld-cats">
    <u-loading-progress v-if="busy" />

    <v-slide-group
      ref="group"
      v-model="internal_root"
      show-arrows
      class="sld-cat-slider"
      :center-active="false"
      :scrollToActive="false"
      mandatory
    >
      <!-- All -->
      <v-slide-group-item :value="null" v-slot="{ isSelected, toggle }">
        <button
          type="button"
          class="sld-cat-card"
          :class="{ '-active': isSelected }"
          @click="onSelectAll(toggle)"
        >
          <div class="sld-thumb -all">
            <v-icon size="22">all_inbox</v-icon>
          </div>

          <div class="sld-meta">
            <div class="sld-title">All</div>
          </div>
        </button>
      </v-slide-group-item>

      <!-- Root categories only -->
      <v-slide-group-item
        v-for="c in rootCategories"
        :key="String(c.id)"
        :value="toId(c.id) || null"
        v-slot="{ isSelected, toggle }"
      >
        <button
          type="button"
          class="sld-cat-card"
          :class="{ '-active': isSelected }"
          :title="c.title"
          @click="onSelectRoot(c, toggle)"
        >
          <div class="sld-thumb">
            <img
              v-if="c.icon"
              :src="getShopImagePath(c.icon)"
              alt="icon"
              class="sld-img"
            />
            <v-icon v-else size="22">folder</v-icon>
          </div>

          <div class="sld-meta">
            <div class="sld-title">
              {{ c.title }}
            </div>
          </div>

          <!-- Each category has its OWN menu (hover + click) -->
          <v-menu
            v-if="hasChildren(toId(c.id))"
            v-model="openMap[toId(c.id)]"
            location="bottom"
            offset="10"
            open-on-hover
            :close-on-content-click="true"
          >
            <template #activator="{ props }">
              <span
                v-bind="props"
                class="sld-subbtn"
                :class="{ '-open': !!openMap[toId(c.id)] }"
                title="Show subcategories"
                @click.stop="openMap[toId(c.id)] = true"
              >
                <v-icon size="20">keyboard_arrow_down</v-icon>
              </span>
            </template>

            <v-list density="compact" class="sld-submenu text-start" lines="one">
              <v-list-item
                v-for="sc in childrenOf(toId(c.id))"
                :key="`sub_${toId(sc.id)}`"
                class="text-start"
                @mousedown.prevent
                @click.stop="onSelectSubcategory(toId(c.id), sc)"
              >
                <template #prepend>
                  <v-avatar v-if="sc.icon" size="22" class="rounded-lg">
                    <img :src="getShopImagePath(sc.icon)" alt="icon" />
                  </v-avatar>
                  <v-icon v-else size="18">subdirectory_arrow_right</v-icon>
                </template>

                <v-list-item-title class="font-weight-bold text-start">
                  {{ sc.title || "Subcategory" }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </button>
      </v-slide-group-item>
    </v-slide-group>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

type CatsCacheEntry = {
  ts: number;
  categories: any[];
  promise?: Promise<any[]>;
};

export default {
  name: "SStorefrontListingCategories",

  inject: ["$shop"],

  data: () => ({
    categories: [] as any[],
    busy: false,

    /**
     * Slide-group highlights ONLY the root category id (or null for All).
     * Actual route selection is via slug (path param) + optional query for subcategory.
     */
    internal_root: null as number | null,

    /** Per-category menu open state */
    openMap: {} as Record<number, boolean>,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopName(): string {
      return String(this.shop?.name || "").trim();
    },

    routeCategorySlug(): string {
      // /listing/:category?
      // @ts-ignore
      const raw = this.$route?.params?.category;
      return raw ? String(raw).trim() : "";
    },

    routeSubSlug(): string {
      // optional: /listing/:category?sub=child-slug
      // @ts-ignore
      const raw = this.$route?.query?.sub;
      return raw ? String(raw).trim() : "";
    },

    // id -> category
    byId(): Record<number, any> {
      const out: Record<number, any> = {};
      (this.categories || []).forEach((c: any) => {
        const id = this.toId(c?.id);
        if (id) out[id] = c;
      });
      return out;
    },

    // slug -> category
    bySlug(): Record<string, any> {
      const out: Record<string, any> = {};
      (this.categories || []).forEach((c: any) => {
        const slug = this.slugOf(c);
        if (slug) out[slug] = c;
      });
      return out;
    },

    // childId -> parentId
    parentMap(): Record<number, number> {
      const map: Record<number, number> = {};
      (this.categories || []).forEach((c: any) => {
        const id = this.toId(c?.id);
        if (!id) return;
        const pid = this.getParentId(c);
        if (pid) map[id] = pid;
      });
      return map;
    },

    // parentId -> children[]
    childrenMap(): Record<number, any[]> {
      const map: Record<number, any[]> = {};

      (this.categories || []).forEach((c: any) => {
        const id = this.toId(c?.id);
        if (!id) return;

        const pid = this.getParentId(c);
        if (!pid) return;

        if (!map[pid]) map[pid] = [];
        map[pid].push(c);
      });

      // stable sort inside each parent
      Object.keys(map).forEach((k) => {
        const pid = parseInt(k, 10);
        map[pid] = (map[pid] || []).sort((a: any, b: any) => {
          const ao = Number(a?.sort_order ?? 0);
          const bo = Number(b?.sort_order ?? 0);
          if (ao !== bo) return ao - bo;

          return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, {
            sensitivity: "base",
          });
        });
      });

      return map;
    },

    // root categories only
    rootCategories(): any[] {
      const roots = (this.categories || []).filter((c: any) => !this.getParentId(c));

      return roots.sort((a: any, b: any) => {
        const ao = Number(a?.sort_order ?? 0);
        const bo = Number(b?.sort_order ?? 0);
        if (ao !== bo) return ao - bo;

        return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, {
          sensitivity: "base",
        });
      });
    },

    /**
     * Current category chosen by route param (slug),
     * but the slider must highlight the ROOT.
     */
    currentRootIdFromRoute(): number | null {
      const slug = this.routeCategorySlug;
      if (!slug) return null;

      const c = this.bySlug[slug] || null;
      if (!c) return null;

      const id = this.toId(c?.id);
      if (!id) return null;

      return this.getRootId(id) || id;
    },
  },

  watch: {
    /**
     * ✅ This is the only place that triggers fetching.
     * Because we use a global cache + in-flight promise dedupe,
     * even if multiple instances mount, the network call happens only once.
     */
    shopName: {
      immediate: true,
      handler() {
        this.ensureCategoriesLoaded();
      },
    },

    // keep slider highlight synced to route (slug)
    routeCategorySlug: {
      immediate: true,
      handler() {
        this.syncRootHighlightFromRoute();
      },
    },
  },

  methods: {
    //──────────────────────────────────────────────────────────────
    // ONE-TIME fetch with global cache + in-flight dedupe
    //──────────────────────────────────────────────────────────────
    async ensureCategoriesLoaded() {
      const shopName = this.shopName;
      if (!shopName) return;

      const w = window as any;
      if (!w.__SLD_LISTING_CATS_CACHE__) w.__SLD_LISTING_CATS_CACHE__ = {} as Record<string, CatsCacheEntry>;

      const key = `shop:${shopName.toLowerCase()}`;
      const ttlMs = 10 * 60 * 1000; // 10 minutes

      const entry: CatsCacheEntry | undefined = w.__SLD_LISTING_CATS_CACHE__[key];

      // fresh cache
      if (entry?.categories && Array.isArray(entry.categories) && Date.now() - (entry.ts || 0) < ttlMs) {
        this.categories = entry.categories;
        this.syncRootHighlightFromRoute();
        return;
      }

      // in-flight request (dedupe across instances)
      if (entry?.promise) {
        this.busy = true;
        try {
          const list = await entry.promise;
          this.categories = Array.isArray(list) ? list : [];
          this.syncRootHighlightFromRoute();
        } finally {
          this.busy = false;
        }
        return;
      }

      // create a single promise in cache
      this.busy = true;

      const p = axios
        .get(window.XAPI.GET_SHOP_LISTING_CATEGORIES(shopName), { params: { offset: 0, limit: 100 } })
        .then(({ data }) => {
          if (data?.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            return [] as any[];
          }
          return Array.isArray(data.categories) ? data.categories : [];
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          return [] as any[];
        })
        .finally(() => {
          // clear promise after resolve (keep categories+ts)
          const cur: CatsCacheEntry | undefined = w.__SLD_LISTING_CATS_CACHE__[key];
          if (cur) delete cur.promise;
        });

      w.__SLD_LISTING_CATS_CACHE__[key] = {
        ts: Date.now(),
        categories: [],
        promise: p,
      };

      try {
        const list = await p;
        w.__SLD_LISTING_CATS_CACHE__[key].categories = list;
        w.__SLD_LISTING_CATS_CACHE__[key].ts = Date.now();

        this.categories = list;
        this.syncRootHighlightFromRoute();
      } finally {
        this.busy = false;
      }
    },

    //──────────────────────────────────────────────────────────────
    // Helpers
    //──────────────────────────────────────────────────────────────
    toId(v: any): number {
      const n = v !== null && v !== undefined ? parseInt(String(v), 10) : 0;
      return Number.isFinite(n) && n > 0 ? n : 0;
    },

    slugOf(c: any): string {
      const s = c?.slug ? String(c.slug).trim() : "";
      return s;
    },

    getParentId(c: any): number {
      const raw =
        c?.parent_id ??
        c?.parentId ??
        c?.parent?.id ??
        c?.parent?.parent_id ??
        null;

      const pid = this.toId(raw);
      return pid || 0;
    },

    getRootId(id: number): number {
      const seen = new Set<number>();
      let cur = id;

      while (cur && this.parentMap[cur]) {
        if (seen.has(cur)) break;
        seen.add(cur);
        cur = this.parentMap[cur];
      }

      return cur || id;
    },

    childrenOf(parentId: number): any[] {
      if (!parentId) return [];
      return this.childrenMap[parentId] || [];
    },

    hasChildren(parentId: number): boolean {
      const arr = this.childrenOf(parentId);
      return Array.isArray(arr) && arr.length > 0;
    },

    closeAllMenus() {
      Object.keys(this.openMap || {}).forEach((k) => {
        this.openMap[parseInt(k, 10)] = false;
      });
    },

    syncRootHighlightFromRoute() {
      this.internal_root = this.currentRootIdFromRoute;
    },

    goListing(categorySlug?: string, subSlug?: string) {
      const cat = categorySlug ? String(categorySlug).trim() : "";

      const query: any = {};
      if (subSlug) query.sub = String(subSlug).trim();

      // @ts-ignore
      this.$router.push({
        name: "StorefrontListing",
        params: { category: cat || undefined },
        query,
      });
    },

    onSelectAll(toggle: Function) {
      toggle();
      this.closeAllMenus();
      this.goListing("", "");
    },

    onSelectRoot(c: any, toggle: Function) {
      toggle();
      this.closeAllMenus();
      this.goListing(this.slugOf(c), "");
    },

    onSelectSubcategory(parentId: number, sc: any) {
      const parent = parentId ? this.byId[parentId] : null;

      const rootSlug = parent ? this.slugOf(parent) : "";
      const subSlug = this.slugOf(sc);

      if (parentId) this.internal_root = parentId;
      if (parentId) this.openMap[parentId] = false;

      this.goListing(rootSlug, subSlug || "");
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-cats {
  .sld-cat-slider {
    padding: 2px 0;
  }

  :deep(.v-slide-group__prev),
  :deep(.v-slide-group__next) {
    min-width: 32px;
    width: 32px;
    opacity: 0.85;
  }

  :deep(.v-slide-group__content) {
    gap: 10px;
    padding: 6px 2px;
  }
}

.sld-cat-card {
  position: relative;
  appearance: none;
  border: 1px solid rgba(20, 20, 20, 0.10);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 16px;

  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;

  width: 210px;
  max-width: 74vw;
  flex: 0 0 auto;

  cursor: pointer;
  text-align: left;

  transition: border-color 0.12s ease, background 0.12s ease;

  &:hover {
    border-color: rgba(20, 20, 20, 0.18);
    background: rgba(255, 255, 255, 0.96);
  }

  &.-active {
    border: 3px solid rgba(0, 0, 0, 0.70);
    background: rgba(0, 0, 0, 0.03);
  }
}

.sld-thumb {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  overflow: hidden;

  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(20, 20, 20, 0.08);

  display: grid;
  place-items: center;
  flex: 0 0 auto;

  .sld-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &.-all {
    background: rgba(0, 0, 0, 0.06);
  }
}

.sld-meta {
  min-width: 0;
  padding-right: 34px;
}

.sld-title {
  font-weight: 900;
  font-size: 14px;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sld-subbtn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);

  width: 28px;
  height: 28px;
  border-radius: 12px;

  border: 1px solid rgba(20, 20, 20, 0.10);
  background: rgba(0, 0, 0, 0.03);
  color: rgba(0, 0, 0, 0.72);

  display: grid;
  place-items: center;

  cursor: pointer;

  transition: transform 0.14s ease, background 0.14s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &.-open {
    transform: translateY(-50%) rotate(180deg);
  }
}

.sld-submenu {
  min-width: 280px;
  max-width: 420px;
  text-align: left;

  :deep(.v-list-item-title),
  :deep(.v-list-item-subtitle),
  :deep(.v-list-item__content) {
    text-align: left;
    justify-content: flex-start;
  }
}

@media (max-width: 520px) {
  .sld-cat-card {
    width: 190px;
    padding: 8px 9px;
    gap: 9px;
  }

  .sld-thumb {
    width: 44px;
    height: 44px;
    border-radius: 13px;
  }
}
</style>