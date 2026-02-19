<template>
  <v-card class="sld-prof-hero" rounded="xl" variant="flat">
    <v-card-text class="pa-4 pa-sm-6">
      <div class="sld-prof-hero__grid">
        <!-- Media -->
        <div class="sld-prof-hero__media">
          <v-carousel
            v-if="images.length"
            :height="heroHeight"
            hide-delimiter-background
            show-arrows="hover"
          >
            <v-carousel-item v-for="(src, i) in images" :key="i">
              <v-img :src="getShopImagePath(src)" :height="heroHeight" cover />
            </v-carousel-item>
          </v-carousel>

          <div
            v-else
            class="sld-prof-hero__empty d-flex align-center justify-center"
            :style="{ height: heroHeight + 'px' }"
          >
            <v-icon size="56" class="text-muted">image</v-icon>
          </div>
        </div>

        <!-- Info -->
        <div class="sld-prof-hero__info">
          <div class="d-flex flex-wrap align-center mb-2">
            <v-chip
              v-if="item?.category?.title"
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
              v-if="company?.name"
              size="small"
              label
              variant="tonal"
              class="me-2 mb-2"
            >
              <v-avatar v-if="company?.logo" size="18" class="me-2">
                <img :src="getShopImagePath(company.logo)" />
              </v-avatar>
              {{ company.name }}
            </v-chip>

            <v-chip
              v-if="item?.is_featured"
              size="small"
              label
              variant="flat"
              color="#000"
              class="mb-2"
            >
              <v-icon start>auto_awesome</v-icon>
              Featured
            </v-chip>
          </div>

          <div class="sld-prof-hero__title">
            {{ item?.title || "Item" }}
          </div>

          <div v-if="item?.subtitle" class="sld-prof-hero__subtitle">
            {{ item.subtitle }}
          </div>

          <!-- ✅ Description under subtitle -->
          <div v-if="item?.description" class="sld-prof-hero__desc">
            {{ item.description }}
          </div>

          <div v-if="priceText" class="sld-prof-hero__price">
            {{ priceText }}
          </div>

          <div class="mt-4 d-flex flex-wrap">
            <v-btn
              v-if="item?.tel"
              class="me-2 mb-2"
              color="black"
              variant="flat"
              :href="`tel:${cleanPhone(item.tel)}`"
            >
              <v-icon start>call</v-icon>
              {{ item.tel }}
            </v-btn>

            <v-btn
              v-if="item?.email"
              class="me-2 mb-2"
              variant="outlined"
              :href="`mailto:${item.email}`"
            >
              <v-icon start>email</v-icon>
              Email
            </v-btn>

            <v-btn
              v-if="item?.website"
              class="me-2 mb-2"
              variant="outlined"
              @click="emitOpenUrl(item.website)"
            >
              <v-icon start>language</v-icon>
              Website
            </v-btn>
          </div>
        </div>
      </div>

      <!-- ✅ Media attachments (video/file/link) under hero -->
      <s-storefront-listing-item-profile-media
        v-if="mediaSafe.length"
        class="mt-5"
        :media="mediaSafe"
        @open:url="emitOpenUrl"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import SStorefrontListingItemProfileMedia from "./SStorefrontListingItemProfileMedia.vue";

export default {
  name: "SStorefrontListingItemProfileHero",
  components: { SStorefrontListingItemProfileMedia },

  props: {
    item: { type: Object, required: true },
    images: { type: Array, default: () => [] },
    heroHeight: { type: Number, default: 360 },
    priceText: { type: String, default: "" },
    company: { type: Object, default: null },
    media: { type: Array, default: () => [] },
  },

  emits: ["open:url"],

  computed: {
    mediaSafe(): any[] {
      return Array.isArray(this.media) ? this.media : [];
    },
  },

  methods: {
    cleanPhone(tel: string) {
      return String(tel || "").replace(/[^\d+]/g, "");
    },

    emitOpenUrl(url: string) {
      const u = String(url || "").trim();
      if (!u) return;
      this.$emit("open:url", u);
    },
  },
};
</script>

<style lang="scss" scoped>
/* SCSS variables (local) */
$sld-prof-title: 30px;
$sld-prof-sub: 14px;
$sld-prof-desc: 13px;

.sld-prof-hero {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;

  &__grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 18px;

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  &__media {
    border-radius: 18px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.03);
  }

  &__empty {
    border-radius: 18px;
    overflow: hidden;
  }

  &__info {
    min-width: 0;
  }

  &__title {
    font-size: $sld-prof-title;
    font-weight: 900;
    line-height: 1.15;
    overflow-wrap: anywhere;
  }

  &__subtitle {
    margin-top: 6px;
    font-size: $sld-prof-sub;
    color: rgba(0, 0, 0, 0.62);
    overflow-wrap: anywhere;
  }

  &__desc {
    margin-top: 10px;
    font-size: $sld-prof-desc;
    color: rgba(0, 0, 0, 0.62);
    white-space: pre-wrap;
    line-height: 1.7;

    /* keep it readable; long descriptions go to Biography section */
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__price {
    margin-top: 14px;
    font-size: 16px;
    font-weight: 800;
  }
}
</style>
