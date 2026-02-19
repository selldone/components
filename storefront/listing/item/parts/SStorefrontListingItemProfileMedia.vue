<template>
  <div class="sld-prof-media">
    <div class="sld-prof-media__head">
      <v-icon class="me-2">perm_media</v-icon>
      <div class="sld-prof-media__title">Media</div>
      <div class="sld-prof-media__hint">Video, links, files</div>
    </div>

    <div class="sld-prof-media__grid">
      <button
        v-for="m in mediaSafe"
        :key="String(m.id || `${m.type}_${m.sort_order}`)"
        type="button"
        class="sld-prof-media__card"
        @click="openMedia(m)"
      >
        <div class="sld-prof-media__top">
          <v-icon size="18" class="me-2">{{ typeIcon(m) }}</v-icon>
          <div class="sld-prof-media__type">{{ typeTitle(m) }}</div>
          <v-spacer />
          <div class="sld-prof-media__domain">{{ domainOf(m) }}</div>
        </div>

        <div class="sld-prof-media__line">
          <div class="sld-prof-media__alt">
            {{ altOrFallback(m) }}
          </div>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "SStorefrontListingItemProfileMedia",

  props: {
    media: { type: Array, default: () => [] },
  },

  emits: ["open:url"],

  computed: {
    mediaSafe(): any[] {
      const list = Array.isArray(this.media) ? this.media : [];
      return list.filter((m: any) => !!m);
    },
  },

  methods: {
    typeKey(m: any): string {
      return String(m?.type || "link").toLowerCase();
    },

    typeTitle(m: any): string {
      const t = this.typeKey(m);
      if (t === "video") return "Video";
      if (t === "file") return "File";
      return "Link";
    },

    typeIcon(m: any): string {
      const t = this.typeKey(m);
      if (t === "video") return "smart_display";
      if (t === "file") return "description";
      return "link";
    },

    resolveUrl(m: any): string {
      const url = String(m?.url || "").trim();
      if (url) return url;

      // local path fallback:
      const path = String(m?.path || "").trim();
      if (!path) return "";

      // getShopImagePath exists globally in your project (works for stored paths)
      // @ts-ignore
      return typeof this.getShopImagePath === "function" ? this.getShopImagePath(path) : path;
    },

    safeParseUrl(raw: string): URL | null {
      try {
        const hasProto = raw.startsWith("http://") || raw.startsWith("https://");
        return new URL(hasProto ? raw : `https://${raw}`);
      } catch {
        return null;
      }
    },

    domainOf(m: any): string {
      const u = this.resolveUrl(m);
      if (!u) return "—";

      const parsed = this.safeParseUrl(u);
      if (!parsed) return "local";

      let host = parsed.hostname || "";
      if (host.startsWith("www.")) host = host.slice(4);
      return host || "—";
    },

    altOrFallback(m: any): string {
      const alt = String(m?.alt || "").trim();
      if (alt) return alt;

      const u = this.resolveUrl(m);
      if (!u) return "Open";

      const parsed = this.safeParseUrl(u);
      if (!parsed) {
        // show last part of path-ish string
        const parts = u.split("/").filter(Boolean);
        const last = parts.length ? parts[parts.length - 1] : u;
        return last.length > 64 ? last.slice(0, 61) + "…" : last;
      }

      const path = (parsed.pathname || "").replace(/\/+$/, "");
      const last = path.split("/").filter(Boolean).pop() || "";
      if (last) return last.length > 64 ? last.slice(0, 61) + "…" : last;

      return parsed.hostname || "Open";
    },

    openMedia(m: any) {
      const url = this.resolveUrl(m);
      if (!url) return;
      this.$emit("open:url", url);
    },
  },
};
</script>

<style lang="scss" scoped>
/* SCSS variables */
$sld-prof-media-title: 14px;
$sld-prof-media-sub: 12px;

.sld-prof-media {
  &__head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-bottom: 10px;
  }

  &__title {
    font-weight: 900;
    font-size: $sld-prof-media-title;
  }

  &__hint {
    font-size: $sld-prof-media-sub;
    color: rgba(0, 0, 0, 0.48);
  }

  &__grid {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @media (max-width: 820px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    text-align: left;
    border: 1px solid rgba(20, 20, 20, 0.08);
    background: rgba(0, 0, 0, 0.015);
    border-radius: 16px;
    padding: 12px 12px;
    cursor: pointer;
    transition: background 0.12s ease, border-color 0.12s ease;
  }

  &__card:hover {
    background: rgba(0, 0, 0, 0.03);
    border-color: rgba(20, 20, 20, 0.14);
  }

  &__top {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  &__type {
    font-weight: 900;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.85);
    white-space: nowrap;
  }

  &__domain {
    font-weight: 800;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.55);
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__line {
    margin-top: 6px;
  }

  &__alt {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.62);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
