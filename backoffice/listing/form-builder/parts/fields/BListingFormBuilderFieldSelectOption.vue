<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - Select option editor (used inside expandable list)
-->

<template>
  <div class="sld-bfb-opt-edit">
    <div class="sld-bfb-opt-edit__grid">
      <!-- Media -->
      <div class="sld-bfb-opt-edit__media">
        <b-listing-form-builder-image-uploader
          :model-value="String(optProxy.icon || '')"
          label="Icon (optional)"
          hint="Shown in grid/list/chips. Upload a small square image."
          @update:modelValue="(v) => patch({ icon: String(v || '') })"
        />

        <div class="mt-2">
          <b-listing-form-builder-image-uploader
            :model-value="String(optProxy.image || '')"
            label="Image (optional)"
            hint="Used when the storefront design supports larger thumbnails."
            @update:modelValue="(v) => patch({ image: String(v || '') })"
          />
        </div>
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
          hint="Stored value. If empty, title can be used as value by the storefront."
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
      return {
        id: v.id || null,
        title: v.title ?? "",
        subtitle: v.subtitle ?? "",
        value: v.value ?? "",
        icon: v.icon ?? "",
        image: v.image ?? "",
      };
    },
  },

  methods: {
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