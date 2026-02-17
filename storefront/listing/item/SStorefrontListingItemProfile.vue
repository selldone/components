<template>
  <div class="text-start">
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

    <div v-if="item" class="profile-wrap">
      <!-- HERO -->
      <v-card class="apple-card" rounded="xl" variant="flat">
        <v-card-text class="pa-4 pa-sm-6">
          <div class="hero-grid">
            <div class="hero-media">
              <v-carousel
                v-if="images.length"
                :height="heroHeight"
                hide-delimiter-background
                show-arrows="hover"
              >
                <v-carousel-item v-for="(src, i) in images" :key="i">
                  <v-img
                    :src="getShopImagePath(src)"
                    :height="heroHeight"
                    cover
                  />
                </v-carousel-item>
              </v-carousel>

              <div
                v-else
                class="hero-empty d-flex align-center justify-center"
                :style="{ height: heroHeight + 'px' }"
              >
                <v-icon size="56" class="text-muted">image</v-icon>
              </div>
            </div>

            <div class="hero-info">
              <div class="d-flex flex-wrap align-center mb-2">
                <v-chip
                  v-if="item.category?.title"
                  size="small"
                  label
                  variant="tonal"
                  class="me-2 mb-2"
                >
                  <v-avatar v-if="item.category?.icon" size="18" class="me-2">
                    <img :src="getShopImagePath(item.category.icon)" />
                  </v-avatar>
                  {{ item.category.title }}
                </v-chip>

                <v-chip
                  v-if="companyResolved?.name"
                  size="small"
                  label
                  variant="tonal"
                  class="me-2 mb-2"
                >
                  <v-avatar v-if="companyResolved?.logo" size="18" class="me-2">
                    <img :src="getShopImagePath(companyResolved.logo)" />
                  </v-avatar>
                  {{ companyResolved.name }}
                </v-chip>

                <v-chip
                  v-if="item.is_featured"
                  size="small"
                  label
                  variant="tonal"
                  class="mb-2"
                >
                  <v-icon start size="18">star</v-icon>
                  Featured
                </v-chip>
              </div>

              <div class="title-wrap text-h3 font-weight-black lh-tight">
                {{ item.title || "Item" }}
              </div>

              <div v-if="item.subtitle" class="text-muted mt-1 wrap-anywhere">
                {{ item.subtitle }}
              </div>

              <div v-if="priceText" class="mt-3 text-h6 font-weight-bold">
                {{ priceText }}
              </div>

              <!-- Primary actions -->
              <div class="mt-4 d-flex flex-wrap">
                <v-btn
                  v-if="item.tel"
                  class="me-2 mb-2"
                  color="black"
                  variant="flat"
                  :href="`tel:${cleanPhone(item.tel)}`"
                >
                  <v-icon start>call</v-icon>
                  {{ item.tel }}
                </v-btn>

                <v-btn
                  v-if="item.email"
                  class="me-2 mb-2"
                  variant="outlined"
                  :href="`mailto:${item.email}`"
                >
                  <v-icon start>email</v-icon>
                  Email
                </v-btn>

                <v-btn
                  v-if="item.website"
                  class="me-2 mb-2"
                  variant="outlined"
                  @click="openUrl(item.website)"
                >
                  <v-icon start>language</v-icon>
                  Website
                </v-btn>
              </div>

              <div v-if="item.slug" class="mt-2 small text-muted wrap-anywhere">
                /{{ item.slug }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- BADGES -->
      <v-card
        v-if="badgesResolved.length"
        class="apple-card mt-4"
        rounded="xl"
        variant="flat"
      >
        <v-card-text class="pa-4 pa-sm-6">
          <div class="d-flex align-center mb-3">
            <v-icon class="me-2">verified</v-icon>
            <div class="text-subtitle-1 font-weight-bold">Badges</div>
          </div>

          <div class="d-flex flex-wrap">
            <div
              v-for="b in badgesResolved"
              :key="String(b.id)"
              class="badge-tile me-3 mb-3"
              :title="b.title || `Badge #${b.id}`"
            >
              <img
                v-if="b.image"
                :src="getShopImagePath(b.image)"
                class="badge-img"
                alt="badge"
              />
              <div v-else class="badge-fallback">
                {{ String(b.id) }}
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- MAIN CONTENT GRID -->
      <div class="mt-4 content-grid">
        <!-- LEFT -->
        <div>
          <!-- Biography / Description -->
          <v-card class="apple-card mb-4" rounded="xl" variant="flat">
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-center mb-2">
                <v-icon class="me-2">notes</v-icon>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ bioTitle }}
                </div>
              </div>

              <div
                class="text-muted wrap-anywhere"
                style="white-space: pre-wrap; line-height: 1.7"
              >
                {{ bioText || "-" }}
              </div>
            </v-card-text>
          </v-card>

          <!-- Meta sections -->
          <v-card
            v-for="section in metaSections"
            :key="section.key"
            class="apple-card mb-4"
            rounded="xl"
            variant="flat"
          >
            <v-card-text class="pa-4 pa-sm-6">
              <div class="d-flex align-center mb-2">
                <v-icon class="me-2">info</v-icon>
                <div class="text-subtitle-1 font-weight-bold">
                  {{ section.title }}
                </div>
              </div>

              <!-- key_value list -->
              <div v-if="section.kind === 'kv_list'">
                <div v-for="(r, i) in section.value" :key="i" class="kv-row">
                  <div class="kv-key wrap-anywhere">
                    {{ r.key }}
                  </div>
                  <div
                    class="kv-value wrap-anywhere"
                    style="white-space: pre-wrap; line-height: 1.7"
                  >
                    {{ r.value }}
                  </div>
                </div>
              </div>

              <!-- array -->
              <div
                v-else-if="section.kind === 'array'"
                class="d-flex flex-wrap"
              >
                <v-chip
                  v-for="(x, i) in section.value"
                  :key="i"
                  size="small"
                  label
                  variant="outlined"
                  class="me-2 mb-2 wrap-anywhere"
                >
                  {{ x }}
                </v-chip>
              </div>

              <!-- object -->
              <pre
                v-else-if="section.kind === 'object'"
                class="text-muted wrap-anywhere"
                style="white-space: pre-wrap; font-size: 12px; line-height: 1.6"
                >{{ prettyJson(section.value) }}</pre
              >

              <!-- text -->
              <div
                v-else
                class="text-muted wrap-anywhere"
                style="white-space: pre-wrap; line-height: 1.7"
              >
                {{ section.value }}
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- RIGHT -->
        <div>
          <v-card class="apple-card side-card" rounded="xl" variant="flat">
            <v-card-text class="pa-4 pa-sm-6">
              <div class="text-subtitle-1 font-weight-bold mb-2">Contact</div>

              <v-btn
                v-if="item.tel"
                block
                color="black"
                variant="flat"
                class="mb-2"
                :href="`tel:${cleanPhone(item.tel)}`"
              >
                <v-icon start>call</v-icon>
                Call
              </v-btn>

              <v-btn
                v-if="item.email"
                block
                variant="outlined"
                class="mb-2"
                :href="`mailto:${item.email}`"
              >
                <v-icon start>email</v-icon>
                Email
              </v-btn>

              <v-btn
                v-if="item.website"
                block
                variant="outlined"
                class="mb-2"
                @click="openUrl(item.website)"
              >
                <v-icon start>language</v-icon>
                Website
              </v-btn>

              <v-divider class="my-4" />

              <div class="text-subtitle-1 font-weight-bold mb-2">Links</div>

              <div v-if="Array.isArray(item.links) && item.links.length">
                <v-btn
                  v-for="(l, i) in item.links"
                  :key="i"
                  block
                  variant="text"
                  class="justify-start mb-1 link-btn"
                  @click="openUrl(l)"
                >
                  <v-icon start>open_in_new</v-icon>
                  <span class="wrap-anywhere">{{ linkCaption(l) }}</span>
                </v-btn>
              </div>
              <div v-else class="text-muted small">No links.</div>

              <v-divider class="my-4" />

              <div class="text-subtitle-1 font-weight-bold mb-2">Location</div>

              <u-map-image
                v-if="item.lat && item.lng"
                :location="{ lat: item.lat, lng: item.lng }"
                aspect-ratio="1"
                class="overflow-hidden rounded-18px border mb-3"
                size="100%"
              ></u-map-image>

              <div class="text-muted small wrap-anywhere">
                <div v-if="item.address">{{ item.address }}</div>
                <div v-if="item.city">{{ item.city }}</div>
                <div v-if="item.country_code">{{ item.country_code }}</div>
              </div>

              <v-btn
                v-if="mapUrl"
                block
                variant="outlined"
                class="mt-3"
                @click="openUrl(mapUrl)"
              >
                <v-icon start>map</v-icon>
                Open in Maps
              </v-btn>
            </v-card-text>
          </v-card>

          <s-storefront-listing-message-form
            v-if="item"
            class="mt-4"
            :item-id="item.id"
            :item-title="item.title"
            @sent="() => {}"
          />
        </div>
      </div>

      <s-storefront-listing-item-reviews v-if="item?.id" :item-id="item.id" class="mt-4" />
    </div>

    <div v-else-if="!busy" class="text-muted py-5 text-center">No data.</div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import UMapImage from "@selldone/components-vue/ui/map/image/UMapImage.vue";
import SStorefrontListingItemReviews from "@selldone/components-vue/backoffice/listing/item/SStorefrontListingItemReviews.vue";
import SStorefrontListingMessageForm from "@selldone/components-vue/storefront/listing/messages/SStorefrontListingMessageForm.vue";

export default {
  name: "SStorefrontListingItemProfile",

  components: {
    SStorefrontListingMessageForm,
    UMapImage,
    SStorefrontListingItemReviews,
  },

  inject: ["$shop"],

  props: {
    itemId: { type: Number, required: true },
  },

  data: () => ({
    busy: false,
    error_text: "",
    item: null as any | null,

    badges_db: [] as any[],
    companies_db: [] as any[],
    _badges_loaded: false,
    _companies_loaded: false,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    heroHeight(): number {
      // Vuetify display helper is globally available in your project
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

    priceText(): string {
      if (this.item?.price === null || this.item?.price === undefined)
        return "";
      const cur = this.item?.currency ? String(this.item.currency) : "";
      const unit = this.item?.price_unit ? ` (${this.item.price_unit})` : "";
      return `${this.item.price} ${cur}${unit}`.trim();
    },

    bioText(): string {
      const meta = this.item?.meta;
      const bio =
        meta && typeof meta === "object" && !Array.isArray(meta)
          ? meta.biography
          : null;
      if (bio && typeof bio === "string" && bio.trim()) return bio;
      if (this.item?.description && String(this.item.description).trim())
        return String(this.item.description);
      return "";
    },

    bioTitle(): string {
      const meta = this.item?.meta;
      const hasBio =
        meta &&
        typeof meta === "object" &&
        !Array.isArray(meta) &&
        typeof meta.biography === "string";
      return hasBio ? "Biography" : "Description";
    },

    badgesResolved(): any[] {
      if (Array.isArray(this.item?.badges) && this.item.badges.length)
        return this.item.badges;

      const ids = Array.isArray(this.item?.badge_ids)
        ? this.item.badge_ids
        : [];
      if (!ids.length) return [];

      const map = new Map<number, any>();
      (this.badges_db || []).forEach((b: any) => {
        const id = parseInt(String(b?.id || ""), 10);
        if (id) map.set(id, b);
      });

      return ids.map((id: any) => {
        const n = parseInt(String(id), 10);
        return map.get(n) || { id: n, title: null, image: null };
      });
    },

    companyResolved(): any | null {
      if (this.item?.company && typeof this.item.company === "object")
        return this.item.company;

      const id = this.item?.company_id
        ? parseInt(String(this.item.company_id), 10)
        : 0;
      if (!id) return null;

      const found = (this.companies_db || []).find(
        (c: any) => parseInt(String(c?.id || ""), 10) === id,
      );
      return found || { id, name: `Company #${id}`, logo: null };
    },

    mapUrl(): string {
      const lat = this.item?.lat;
      const lng = this.item?.lng;

      if (
        lat !== null &&
        lat !== undefined &&
        lng !== null &&
        lng !== undefined
      ) {
        return `https://www.google.com/maps?q=${encodeURIComponent(String(lat) + "," + String(lng))}`;
      }

      const parts = [
        this.item?.address,
        this.item?.city,
        this.item?.country_code,
      ]
        .map((x: any) => String(x || "").trim())
        .filter((x: string) => x.length);

      if (parts.length) {
        return `https://www.google.com/maps?q=${encodeURIComponent(parts.join(", "))}`;
      }

      return "";
    },

    metaSections(): any[] {
      const meta = this.item?.meta;
      if (!meta || typeof meta !== "object" || Array.isArray(meta)) return [];

      const out: any[] = [];
      const keys = Object.keys(meta);

      keys.forEach((k) => {
        const v = meta[k];
        if (k === "biography") return;

        if (v === null || v === undefined) return;
        if (typeof v === "string" && !v.trim()) return;
        if (Array.isArray(v) && !v.length) return;

        if (
          Array.isArray(v) &&
          v.every(
            (x) => x && typeof x === "object" && "key" in x && "value" in x,
          )
        ) {
          out.push({
            key: k,
            title: this.humanize(k),
            kind: "kv_list",
            value: v,
          });
          return;
        }

        if (Array.isArray(v)) {
          out.push({
            key: k,
            title: this.humanize(k),
            kind: "array",
            value: v,
          });
          return;
        }

        if (typeof v === "object") {
          out.push({
            key: k,
            title: this.humanize(k),
            kind: "object",
            value: v,
          });
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
    cleanPhone(tel: string) {
      return String(tel || "").replace(/[^\d+]/g, "");
    },

    openUrl(url: string) {
      const u = String(url || "").trim();
      if (!u) return;

      const hasProto = u.startsWith("http://") || u.startsWith("https://");
      const finalUrl = hasProto ? u : `https://${u}`;

      window.open(finalUrl, "_blank", "noopener,noreferrer");
    },

    prettyJson(obj: any) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch {
        return "-";
      }
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

    linkCaption(url: string) {
      const u = String(url || "").trim();
      if (!u) return "";

      const parsed = this.safeParseUrl(u);
      if (!parsed) {
        // Fallback: show shortened raw string
        return u.length > 42 ? u.slice(0, 39) + "..." : u;
      }

      // Prefer hostname (Apple-like)
      let host = parsed.hostname || "";
      if (host.startsWith("www.")) host = host.slice(4);

      // Optional: add a short path hint if useful (kept minimal)
      const path = String(parsed.pathname || "")
        .replace(/\/+$/, "")
        .trim();

      const shortPath =
        path && path !== "/"
          ? path.split("/").slice(0, 2).join("/") // first 1-2 segments
          : "";

      const caption = shortPath ? `${host}${shortPath}` : host;

      // Final clamp
      return caption.length > 42 ? caption.slice(0, 39) + "..." : caption;
    },

    safeParseUrl(url: string): URL | null {
      try {
        const hasProto =
          url.startsWith("http://") || url.startsWith("https://");
        return new URL(hasProto ? url : `https://${url}`);
      } catch {
        return null;
      }
    },
  },
};
</script>

<style scoped>
.profile-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

/* Fix: Vuetify cards often use overflow:hidden; that can crop text/shadows */
.apple-card {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;
}

/* Responsive grids */
.hero-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 18px;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}

.hero-media {
  border-radius: 18px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.03);
}

.hero-info {
  min-width: 0;
}

.title-wrap {
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Main layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1000px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Sticky only on desktop */
.side-card {
  position: sticky;
  top: 16px;
}

@media (max-width: 1000px) {
  .side-card {
    position: static;
    top: auto;
  }
}

.wrap-anywhere {
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Badge tiles */
.badge-tile {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(20, 20, 20, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.badge-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-fallback {
  font-weight: 800;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.55);
}

/* key/value block */
.kv-row {
  padding: 14px;
  border-radius: 16px;
  border: 1px solid rgba(20, 20, 20, 0.08);
  background: rgba(0, 0, 0, 0.02);
  margin-bottom: 12px;
}

.kv-key {
  font-weight: 800;
  margin-bottom: 8px;
}

.kv-value {
  color: rgba(0, 0, 0, 0.65);
}

/* Avoid truncation inside link buttons */
.link-btn :deep(.v-btn__content) {
  min-width: 0;
}
</style>
