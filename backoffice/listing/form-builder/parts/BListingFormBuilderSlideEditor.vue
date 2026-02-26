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
  <div class="sld-bfb-se">
    <div class="sld-bfb-se__grid">
      <!-- Editor (center) -->
      <v-card rounded="lg" variant="outlined" class="sld-bfb-se__editor">
        <v-card-text class="text-start">
          <div class="d-flex align-center mb-3">
            <div class="font-weight-black">Slide</div>
            <v-spacer />
            <v-chip size="x-small" variant="tonal" label>
              {{ local?.type || "field" }}
            </v-chip>
          </div>

          <v-select
            :model-value="slideTypeProxy"
            :items="slideTypeOptions"
            item-title="title"
            item-value="value"
            label="Slide type"
            variant="underlined"
            @update:modelValue="onChangeSlideType"
          />

          <b-listing-form-builder-layout-picker
            :model-value="local?.layout"
            class="mt-2"
            @update:modelValue="(v) => patchSlide({ layout: v })"
          />

          <div class="mt-4">
            <div class="font-weight-bold mb-2">Slide content</div>

            <v-text-field
              :model-value="titleProxy"
              label="Title"
              variant="underlined"
              @update:modelValue="(v) => (titleProxy = v)"
            />

            <v-textarea
              :model-value="subtitleProxy"
              label="Subtitle"
              variant="underlined"
              auto-grow
              rows="2"
              @update:modelValue="(v) => (subtitleProxy = v)"
            />

            <v-textarea
              :model-value="tipsProxy"
              label="Tips"
              variant="underlined"
              auto-grow
              rows="2"
              @update:modelValue="(v) => (tipsProxy = v)"
            />

            <b-listing-form-builder-image-uploader
              :model-value="local?.image"
              label="Illustration image"
              class="mt-3"
              @update:modelValue="(v) => patchSlide({ image: v })"
            />
          </div>

          <v-divider class="my-4" />

          <div v-if="local?.type === 'field'">
            <div class="font-weight-bold mb-2">Input settings</div>

            <b-listing-form-builder-field-editor
              :model-value="local?.field"
              @update:modelValue="(f) => patchSlide({ field: f })"
            />
          </div>

          <div v-else class="text-muted">
            This slide is informational (no input).
          </div>
        </v-card-text>
      </v-card>

      <!-- Preview (right) -->
      <v-card rounded="lg" variant="outlined" class="sld-bfb-se__preview">
        <v-card-text class="text-start">
          <div class="d-flex align-center mb-3">
            <div class="font-weight-black">Preview</div>
            <v-spacer />
            <v-chip size="x-small" variant="tonal" label>Storefront</v-chip>
          </div>

          <div class="sld-bfb-se__preview-wrap">
            <!-- The real storefront onboarding slide component (preview mode) -->
            <s-storefront-listing-onboarding-slide :slide="local" preview />
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script lang="ts">
import BListingFormBuilderLayoutPicker from "./BListingFormBuilderLayoutPicker.vue";
import BListingFormBuilderImageUploader from "./BListingFormBuilderImageUploader.vue";
import BListingFormBuilderFieldEditor from "./fields/BListingFormBuilderFieldEditor.vue";

// ✅ Storefront slide renderer (real end-user UI) — used as preview in dashboard.
import SStorefrontListingOnboardingSlide from "@selldone/components-vue/storefront/listing/onboarding/SStorefrontListingOnboardingSlide.vue";

export default {
  name: "BListingFormBuilderSlideEditor",

  components: {
    BListingFormBuilderLayoutPicker,
    BListingFormBuilderImageUploader,
    BListingFormBuilderFieldEditor,

    SStorefrontListingOnboardingSlide,
  },

  props: {
    slide: { type: Object, required: true },
  },

  emits: ["update:slide"],

  data: () => ({
    local: null as any,
    _syncing: false,
  }),

  computed: {
    slideTypeOptions(): any[] {
      return [
        { title: "Question / Input", value: "field" },
        { title: "Informational (no input)", value: "info" },
      ];
    },

    slideTypeProxy: {
      get(): string {
        return String(this.local?.type || "field");
      },
      set(v: string) {
        this.onChangeSlideType(v);
      },
    },

    titleProxy: {
      get(): string {
        return String(this.local?.title || "");
      },
      set(v: string) {
        this.patchSlide({ title: String(v || "") });
      },
    },

    subtitleProxy: {
      get(): string {
        return String(this.local?.subtitle || "");
      },
      set(v: string) {
        this.patchSlide({ subtitle: String(v || "") });
      },
    },

    tipsProxy: {
      get(): string {
        return String(this.local?.tips || "");
      },
      set(v: string) {
        this.patchSlide({ tips: String(v || "") });
      },
    },
  },

  watch: {
    slide: {
      immediate: true,
      handler(v: any) {
        this._syncing = true;
        this.local = this.ensureSlideDefaults(this.clone(v || {}));
        this._syncing = false;
      },
    },
  },

  methods: {
    clone(obj: any) {
      try {
        return JSON.parse(JSON.stringify(obj || {}));
      } catch {
        return {};
      }
    },

    makeUid(prefix = "sld") {
      try {
        // @ts-ignore
        if (globalThis.crypto?.getRandomValues) {
          // @ts-ignore
          const a = globalThis.crypto.getRandomValues(new Uint32Array(2));
          return `${prefix}_${a[0].toString(16)}${a[1].toString(16)}`;
        }
      } catch {
        // ignore
      }
      return `${prefix}_${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    },

    ensureFieldStub(field?: any) {
      const f: any = field && typeof field === "object" ? field : {};
      if (!f.uid) f.uid = this.makeUid("fld");
      if (!f.type) f.type = "text";
      if (!f.name) f.name = "field";
      if (f.title === undefined || f.title === null) f.title = "";
      if (f.required === undefined || f.required === null) f.required = false;
      return f;
    },

    ensureSlideDefaults(slide: any) {
      const s: any = slide || {};

      if (!s.id) s.id = this.makeUid("sld");

      // Backward compatibility
      if (!s.type) {
        s.type = s.field ? "field" : "info";
      }

      if (!s.layout) s.layout = "split_right";

      if (s.title === undefined || s.title === null) s.title = "";
      if (s.subtitle === undefined || s.subtitle === null) s.subtitle = "";
      if (s.tips === undefined || s.tips === null) s.tips = "";
      if (s.image === undefined || s.image === null) s.image = "";

      if (s.type === "info") {
        s.field = null;
      } else {
        s.field = this.ensureFieldStub(s.field);
      }

      return s;
    },

    patchSlide(patch: any) {
      if (!this.local) return;
      const next = this.ensureSlideDefaults({ ...this.clone(this.local), ...(patch || {}) });
      this.local = next;
      if (!this._syncing) this.$emit("update:slide", this.clone(next));
    },

    onChangeSlideType(v: any) {
      const type = String(v || "field");
      if (type === "info") {
        this.patchSlide({ type: "info", field: null });
        return;
      }

      // field
      const currentField = this.local?.field;
      this.patchSlide({ type: "field", field: this.ensureFieldStub(currentField) });
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-se {
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    align-items: start;
  }

  @media (max-width: 1100px) {
    &__grid {
      grid-template-columns: 1fr;
    }
  }

  &__preview-wrap {
    background: #fff;
    border-radius: 14px;
    overflow: hidden;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }
}
</style>