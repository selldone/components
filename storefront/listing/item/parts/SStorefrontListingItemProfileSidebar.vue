<template>
  <v-card class="sld-prof-card sld-prof-side" rounded="xl" variant="flat">
    <v-card-text class="pa-4 pa-sm-6">
      <div class="sld-prof-card__title mb-2">Contact</div>

      <v-btn
        v-if="item?.tel"
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
        v-if="item?.email"
        block
        variant="outlined"
        class="mb-2"
        :href="`mailto:${item.email}`"
      >
        <v-icon start>email</v-icon>
        Email
      </v-btn>

      <v-btn
        v-if="item?.website"
        block
        variant="outlined"
        class="mb-2"
        @click="emitOpenUrl(item.website)"
      >
        <v-icon start>language</v-icon>
        Website
      </v-btn>

      <v-divider class="my-4" />

      <!-- External links (item.links) -->
      <div class="sld-prof-card__title mb-2">Links</div>

      <div v-if="Array.isArray(item?.links) && item.links.length">
        <v-btn
          v-for="(l, i) in item.links"
          :key="i"
          block
          variant="text"
          class="justify-start mb-1 sld-prof-link"
          @click="emitOpenUrl(l)"
        >
          <v-icon start>open_in_new</v-icon>
          <span class="sld-prof-link__txt">{{ linkCaption(l) }}</span>
        </v-btn>
      </div>
      <div v-else class="text-muted small">No links.</div>

      <v-divider class="my-4" />

      <div class="sld-prof-card__title mb-2">Location</div>

      <u-map-image
        v-if="item?.lat && item?.lng"
        :location="{ lat: item.lat, lng: item.lng }"
        aspect-ratio="1"
        class="overflow-hidden rounded-18px border mb-3"
        size="100%"
      />

      <div class="text-muted small sld-prof-wrap">
        <div v-if="item?.address">{{ item.address }}</div>
        <div v-if="item?.city">{{ item.city }}</div>
        <div v-if="item?.country_code">{{ item.country_code }}</div>
      </div>

      <v-btn
        v-if="mapUrl"
        block
        variant="outlined"
        class="mt-3"
        @click="emitOpenUrl(mapUrl)"
      >
        <v-icon start>map</v-icon>
        Open in Maps
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import UMapImage from "@selldone/components-vue/ui/map/image/UMapImage.vue";

export default {
  name: "SStorefrontListingItemProfileSidebar",
  components: { UMapImage },

  props: {
    item: { type: Object, required: true },
    mapUrl: { type: String, default: "" },
  },

  emits: ["open:url"],

  methods: {
    emitOpenUrl(url: string) {
      const u = String(url || "").trim();
      if (!u) return;
      this.$emit("open:url", u);
    },

    cleanPhone(tel: string) {
      return String(tel || "").replace(/[^\d+]/g, "");
    },

    safeParseUrl(url: string): URL | null {
      try {
        const hasProto = url.startsWith("http://") || url.startsWith("https://");
        return new URL(hasProto ? url : `https://${url}`);
      } catch {
        return null;
      }
    },

    linkCaption(url: string) {
      const u = String(url || "").trim();
      if (!u) return "";

      const parsed = this.safeParseUrl(u);
      if (!parsed) return u.length > 42 ? u.slice(0, 39) + "..." : u;

      let host = parsed.hostname || "";
      if (host.startsWith("www.")) host = host.slice(4);

      const path = String(parsed.pathname || "").replace(/\/+$/, "").trim();
      const shortPath = path && path !== "/" ? path.split("/").slice(0, 2).join("/") : "";

      const caption = shortPath ? `${host}${shortPath}` : host;
      return caption.length > 42 ? caption.slice(0, 39) + "..." : caption;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-prof-card {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;

  &__title {
    font-weight: 900;
  }
}

.sld-prof-side {
  position: sticky;
  top: 16px;

  @media (max-width: 1000px) {
    position: static;
    top: auto;
  }
}

.sld-prof-wrap {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.sld-prof-link :deep(.v-btn__content) {
  min-width: 0;
}

.sld-prof-link__txt {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
