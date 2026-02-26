<!--
  Airbnb-like onboarding wizard for listing creation.

  - Renders slides defined by the form builder schema.
  - Custom fields are stored inside `payload.meta`.
  - Official fields are stored directly on the payload (or merged if object).

  v-model returns the full payload (compatible with ShopListingItem columns + meta).
-->

<template>
  <div class="sld-onb-wizard">
    <div class="sld-onb-wizard__content">
      <s-storefront-listing-onboarding-slide
        v-if="currentSlide"
        :slide="currentSlide"
        :step="stepIndex + 1"
        :model-value="currentValue"
        :preview="preview"
        @update:modelValue="onUpdateCurrentValue"
      />
    </div>

    <div class="sld-onb-wizard__footer">
      <div class="sld-onb-progress">
        <div class="sld-onb-progress__bar" :style="{ width: progressPercent + '%' }" />
      </div>

      <div class="d-flex align-center justify-space-between mt-3">
        <v-btn variant="text" class="text-none" :disabled="stepIndex <= 0" @click="back">
          Back
        </v-btn>

        <div class="d-flex align-center" style="gap: 10px">
          <v-btn
            v-if="showSaveExit"
            variant="outlined"
            class="text-none"
            @click="$emit('save-exit')"
          >
            Save &amp; exit
          </v-btn>

          <v-btn
            color="black"
            variant="flat"
            class="text-none"
            @click="next"
          >
            {{ isLast ? 'Finish' : 'Next' }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SStorefrontListingOnboardingSlide from "./SStorefrontListingOnboardingSlide.vue";

export default {
  name: "SStorefrontListingOnboarding",

  components: {
    SStorefrontListingOnboardingSlide,
  },

  props: {
    schema: { type: Object, required: true },
    modelValue: { type: Object, default: () => ({ meta: {} }) },

    // In preview mode we still allow interactions, but no submit is emitted.
    preview: { type: Boolean, default: false },

    // Show optional save & exit button
    showSaveExit: { type: Boolean, default: true },
  },

  emits: ["update:modelValue", "finish", "save-exit"],

  data: () => ({
    stepIndex: 0,
  }),

  computed: {
    slides(): any[] {
      const s = this.schema || {};
      return Array.isArray(s.slides) ? s.slides : [];
    },

    currentSlide(): any | null {
      return this.slides[this.stepIndex] || null;
    },

    isLast(): boolean {
      return this.stepIndex >= this.slides.length - 1;
    },

    progressPercent(): number {
      const total = this.slides.length || 1;
      return Math.round(((this.stepIndex + 1) / total) * 100);
    },

    currentValue(): any {
      const slide = this.currentSlide;
      const field = slide?.field;
      if (!slide || slide.type === "info" || !field) return null;

      const payload = this.modelValue || {};

      const type = String(field.type || "");
      const name = String(field.name || "");

      if (type.startsWith("official:")) {
        // Group official fields return an object and are merged later.
        if (name === "price") {
          return {
            price: payload.price ?? null,
            price_to: payload.price_to ?? null,
            currency: payload.currency ?? "",
            price_unit: payload.price_unit ?? "",
          };
        }

        if (name === "location") {
          return {
            country_code: payload.country_code ?? "",
            city: payload.city ?? "",
            address: payload.address ?? "",
            lat: payload.lat ?? null,
            lng: payload.lng ?? null,
          };
        }

        if (name === "contact") {
          return {
            tel: payload.tel ?? "",
            email: payload.email ?? "",
            website: payload.website ?? "",
          };
        }

        // Single official field
        return payload[name] ?? null;
      }

      // Custom field => payload.meta[name]
      const meta = payload.meta && typeof payload.meta === "object" ? payload.meta : {};
      return meta[name] ?? null;
    },
  },

  watch: {
    // reset index if schema changes significantly
    schema: {
      deep: false,
      handler() {
        if (this.stepIndex >= this.slides.length) this.stepIndex = 0;
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

    emitPayload(next: any) {
      this.$emit("update:modelValue", next);
    },

    onUpdateCurrentValue(v: any) {
      const slide = this.currentSlide;
      const field = slide?.field;
      if (!slide || slide.type === "info" || !field) return;

      const payload = this.clone(this.modelValue || {});
      if (!payload.meta || typeof payload.meta !== "object") payload.meta = {};

      const type = String(field.type || "");
      const name = String(field.name || "");

      if (type.startsWith("official:")) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
          // merge group object
          Object.assign(payload, v);
        } else {
          payload[name] = v;
        }
      } else {
        payload.meta[name] = v;
      }

      this.emitPayload(payload);
    },

    back() {
      if (this.stepIndex <= 0) return;
      this.stepIndex -= 1;
    },

    next() {
      if (this.isLast) {
        if (!this.preview) this.$emit("finish", this.modelValue);
        return;
      }
      this.stepIndex += 1;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-onb-wizard {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sld-onb-wizard__content {
  min-height: 460px;
}

.sld-onb-wizard__footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 14px 18px;
  background: #fff;
}

.sld-onb-progress {
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  overflow: hidden;

  &__bar {
    height: 100%;
    background: #000;
    border-radius: 999px;
    transition: width 0.2s ease-in-out;
  }
}
</style>
