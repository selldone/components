<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - Select option editor (used inside expandable list)
  - Update: each option has ONLY ONE image input (stored in `image`)
-->

<template>
  <div class="sld-bfb-opt-edit">
    <div class="sld-bfb-opt-edit__grid">
      <!-- Media (single image) -->
      <div class="sld-bfb-opt-edit__media">
        <b-listing-form-builder-image-uploader
          :model-value="String(optProxy.image || '')"
          label="Image (optional)"
          hint="One image per option. Used as the visual for grid/list/chips."
          @update:modelValue="(v) => patch({ image: String(v || '') })"
        />
      </div>

      <!-- Text -->
      <div class="sld-bfb-opt-edit__fields">
        <v-text-field
          :model-value="String(optProxy.title || '')"
          label="Title"
          variant="underlined"
          @update:modelValue="(v) => patch({ title: String(v || '') })"
        />

        <v-textarea
          :model-value="String(optProxy.subtitle || '')"
          label="Subtitle (optional)"
          variant="underlined"
          rows="2"
          auto-grow
          @update:modelValue="(v) => patch({ subtitle: String(v || '') })"
        />

        <v-text-field
          :model-value="String(optProxy.value || '')"
          label="Value"
          variant="underlined"
          hint="Stored value. If empty, the storefront can fall back to title."
          persistent-hint
          @update:modelValue="(v) => patch({ value: String(v || '') })"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BListingFormBuilderImageUploader from "../BListingFormBuilderImageUploader.vue";

export default {
  name: "BListingFormBuilderFieldSelectOption",

  components: { BListingFormBuilderImageUploader },

  props: {
    modelValue: { type: Object, default: () => ({}) },
  },

  emits: ["update:modelValue", "remove"],

  computed: {
    optProxy(): any {
      const v: any =
        this.modelValue && typeof this.modelValue === "object" ? this.modelValue : {};

      // Backward compatibility:
      // - old schemas might have `icon` as an image path
      // - keep ONLY one editor field (image)
      const legacyIcon = String(v.icon ?? "").trim();
      const legacyAsImage = this.looksLikeImagePath(legacyIcon) ? legacyIcon : "";

      return {
        id: v.id || null,
        title: v.title ?? "",
        subtitle: v.subtitle ?? "",
        value: v.value ?? "",

        // single image field:
        image: (v.image ?? null) !== null && String(v.image ?? "").trim() !== ""
          ? String(v.image ?? "").trim()
          : legacyAsImage,

        // keep icon in payload if it existed (do not show in UI)
        icon: v.icon ?? "",
      };
    },
  },

  methods: {
    looksLikeImagePath(s: string): boolean {
      const v = String(s || "").trim();
      if (!v) return false;
      if (v.startsWith("http://") || v.startsWith("https://")) return true;
      if (v.startsWith("shops_")) return true;
      if (/\.(png|jpe?g|webp|svg)$/i.test(v)) return true;
      if (v.includes("/")) return true;
      return false;
    },

    clone(obj: any) {
      try {
        return JSON.parse(JSON.stringify(obj || {}));
      } catch {
        return obj || {};
      }
    },

    patch(p: any) {
      const next = { ...this.clone(this.optProxy), ...(p || {}) };

      // Keep id stable if exists
      if (this.optProxy.id) next.id = this.optProxy.id;

      // If user set an image, prefer it; we keep legacy `icon` untouched (optional).
      // This keeps schema compatible while moving new data into `image`.
      this.$emit("update:modelValue", next);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-opt-edit {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 14px;
    align-items: start;

    @media (max-width: 980px) {
      grid-template-columns: 1fr;
    }
  }

  &__media {
    min-width: 0;
  }

  &__fields {
    min-width: 0;
  }
}
</style>