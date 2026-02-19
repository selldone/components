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
        :company="companyResolved"
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

          <s-storefront-listing-item-profile-meta
            :sections="metaSections"
          />
        </div>

        <!-- RIGHT -->
        <div class="sld-prof__right">
          <s-storefront-listing-item-profile-sidebar
            :item="item"
            :map-url="mapUrl"
            @open:url="openUrl"
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

    <div v-else-if="!busy" class="text-muted py-5 text-center">
      No data.
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import SStorefrontListingMessageForm from "@selldone/components-vue/storefront/listing/messages/SStorefrontListingMessageForm.vue";
import SStorefrontListingItemReviews from "@selldone/components-vue/backoffice/listing/item/SStorefrontListingItemReviews.vue";

// Child components (new)
import SStorefrontListingItemProfileHero from "./parts/SStorefrontListingItemProfileHero.vue";
import SStorefrontListingItemProfileBadges from "./parts/SStorefrontListingItemProfileBadges.vue";
import SStorefrontListingItemProfileBio from "./parts/SStorefrontListingItemProfileBio.vue";
import SStorefrontListingItemProfileMeta from "./parts/SStorefrontListingItemProfileMeta.vue";
import SStorefrontListingItemProfileSidebar from "./parts/SStorefrontListingItemProfileSidebar.vue";

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
  },

  inject: ["$shop"],

  props: {
    itemId: { type: Number, required: true },
  },

  data: () => ({
    busy: false,
    error_text: "",
    item: null as any | null,

    // Keep only what you might need later; do not fetch extra here.
    companies_db: [] as any[],
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
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

    companyResolved(): any | null {
      // If API provides company object:
      if (this.item?.company && typeof this.item.company === "object") return this.item.company;

      const id = this.item?.company_id ? parseInt(String(this.item.company_id), 10) : 0;
      if (!id) return null;

      const found = (this.companies_db || []).find(
        (c: any) => parseInt(String(c?.id || ""), 10) === id,
      );

      return found || { id, name: `Company #${id}`, logo: null };
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
    itemId: {
      immediate: true,
      handler() {
        this.fetchItem();
      },
    },
  },

  methods: {
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
      const shopName = this.shop?.name;
      const id = parseInt(String(this.itemId || 0), 10);
      if (!shopName || !id) return;

      this.busy = true;
      this.error_text = "";
      this.item = null;

      axios
        .get(window.XAPI.GET_SHOP_LISTING_ITEM(shopName, id))
        .then(({ data }) => {
          if (data?.error) {
            this.error_text = data.error_msg || "Item not found.";
            return;
          }
          this.item = data.item || null;
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => (this.busy = false));
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
