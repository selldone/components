<!--
  Storefront Listing Onboarding (Airbnb-like)
  This component renders ONE slide (step).

  Usage (preview):
    <s-storefront-listing-onboarding-slide :slide="slide" preview />

  Usage (real):
    <s-storefront-listing-onboarding-slide :slide="slide" v-model="value" />
-->

<template>
  <div class="sld-onb-slide" :class="`-layout-${layout}`">
    <div class="sld-onb-slide__inner">
      <div class="sld-onb-slide__content">
        <div v-if="step" class="sld-onb-step">Step {{ step }}</div>

        <div v-if="title" class="sld-onb-title">{{ title }}</div>
        <div v-if="subtitle" class="sld-onb-subtitle">{{ subtitle }}</div>
        <div v-if="tips" class="sld-onb-tips">{{ tips }}</div>

        <div v-if="hasField" class="sld-onb-input">
          <s-storefront-listing-onboarding-field-renderer
            :field="safeSlide.field"
            :model-value="valueProxy"
            :preview="preview"
            @update:modelValue="onUpdateValue"
          />
        </div>
      </div>

      <div v-if="imageUrl" class="sld-onb-slide__media">
        <img class="sld-onb-illustration" :src="imageUrl" alt="" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SStorefrontListingOnboardingFieldRenderer from "./SStorefrontListingOnboardingFieldRenderer.vue";

export default {
  name: "SStorefrontListingOnboardingSlide",

  components: {
    SStorefrontListingOnboardingFieldRenderer,
  },

  props: {
    slide: { type: Object, required: true },

    // If true, the slide becomes self-contained and will not emit user inputs to parent.
    preview: { type: Boolean, default: false },

    // Value for this slide's input (only used when preview=false)
    modelValue: { default: null },

    // Optional step indicator
    step: { type: Number, default: null },
  },

  emits: ["update:modelValue"],

  data: () => ({
    previewValue: null as any,
  }),

  computed: {
    safeSlide(): any {
      const s: any = this.slide || {};
      return {
        id: s.id || "",
        type: s.type || (s.field ? "field" : "info"),
        layout: s.layout || "split_right",
        title: s.title || "",
        subtitle: s.subtitle || "",
        tips: s.tips || "",
        image: s.image || "",
        field: s.field || null,
      };
    },

    layout(): string {
      // Backward/forward compatible layout normalization.
      // Form builder currently uses: split_right | split_left | stacked | centered
      // This renderer supports: split_right | split_left | media_top | media_bottom | center
      const l = String(this.safeSlide.layout || "split_right");
      if (l === "centered") return "center";
      if (l === "stacked") return "media_top";
      return l;
    },

    title(): string {
      return String(this.safeSlide.title || "");
    },

    subtitle(): string {
      return String(this.safeSlide.subtitle || "");
    },

    tips(): string {
      return String(this.safeSlide.tips || "");
    },

    hasField(): boolean {
      return this.safeSlide.type !== "info" && !!this.safeSlide.field;
    },

    imageUrl(): string {
      const img = String(this.safeSlide.image || "").trim();
      if (!img) return "";
      if (img.startsWith("http://") || img.startsWith("https://")) return img;

      // Selldone global helper (available in storefront & dashboard)
      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(img);
      return img;
    },

    valueProxy(): any {
      return this.preview ? this.previewValue : this.modelValue;
    },
  },

  watch: {
    // Keep preview value in sync with provided value when opening editor.
    modelValue: {
      immediate: true,
      handler(v: any) {
        if (!this.preview) return;
        this.previewValue = v;
      },
    },

    slide: {
      immediate: true,
      handler() {
        // reset preview value on slide change (preview mode)
        if (this.preview) this.previewValue = null;
      },
    },
  },

  methods: {
    onUpdateValue(v: any) {
      if (this.preview) {
        this.previewValue = v;
        return;
      }
      this.$emit("update:modelValue", v);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-onb-slide {
  background: #fff;
  padding: 34px 28px;
  min-height: 420px;

  &__inner {
    display: grid;
    grid-template-columns: 1fr 420px;
    gap: 28px;
    align-items: center;
  }

  &__content {
    max-width: 640px;
  }

  &__media {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.sld-onb-step {
  font-size: 12px;
  font-weight: 700;
  opacity: 0.65;
  margin-bottom: 10px;
}

.sld-onb-title {
  font-size: 34px;
  font-weight: 900;
  line-height: 1.12;
}

.sld-onb-subtitle {
  margin-top: 10px;
  font-size: 15px;
  opacity: 0.82;
}

.sld-onb-tips {
  margin-top: 12px;
  font-size: 13px;
  opacity: 0.7;
}

.sld-onb-input {
  margin-top: 18px;
}

.sld-onb-illustration {
  width: 100%;
  max-width: 420px;
  max-height: 320px;
  object-fit: contain;
}

/* Layout variations */
.sld-onb-slide.-layout-split_left {
  .sld-onb-slide__inner {
    grid-template-columns: 420px 1fr;
  }
  .sld-onb-slide__content {
    order: 2;
  }
  .sld-onb-slide__media {
    order: 1;
  }
}

.sld-onb-slide.-layout-center {
  padding: 28px 18px;

  .sld-onb-slide__inner {
    grid-template-columns: 1fr;
  }

  .sld-onb-slide__content {
    max-width: 720px;
    margin: 0 auto;
    text-align: center;
  }

  .sld-onb-slide__media {
    margin-top: 16px;
  }
}

.sld-onb-slide.-layout-media_top {
  .sld-onb-slide__inner {
    grid-template-columns: 1fr;
  }

  .sld-onb-slide__media {
    order: 1;
    margin-bottom: 14px;
  }

  .sld-onb-slide__content {
    order: 2;
    max-width: 720px;
    margin: 0 auto;
  }
}

.sld-onb-slide.-layout-media_bottom {
  .sld-onb-slide__inner {
    grid-template-columns: 1fr;
  }

  .sld-onb-slide__content {
    order: 1;
    max-width: 720px;
    margin: 0 auto;
  }

  .sld-onb-slide__media {
    order: 2;
    margin-top: 14px;
  }
}

@media (max-width: 900px) {
  .sld-onb-slide {
    padding: 22px 14px;
    &__inner {
      grid-template-columns: 1fr;
    }
    &__content {
      max-width: 100%;
    }
    &__media {
      margin-top: 12px;
    }
  }

  .sld-onb-title {
    font-size: 26px;
  }
}
</style>
