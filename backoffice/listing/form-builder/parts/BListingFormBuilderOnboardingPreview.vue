<!--
  - Copyright (c) 2026. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - Onboarding preview chrome (Airbnb-like) for ONE slide
  - Safe: does NOT mutate schema
-->

<template>
  <div class="sld-bfb-onbprev">
    <!-- Header -->
    <div class="sld-bfb-onbprev__header">
      <div class="sld-bfb-onbprev__brand">
        <img
          v-if="shopLogoUrl"
          class="sld-bfb-onbprev__logo"
          :src="shopLogoUrl"
          alt="logo"
        />
        <div v-else class="sld-bfb-onbprev__logo-fallback" aria-hidden="true">
          <v-icon size="18">store</v-icon>
        </div>
      </div>

      <v-spacer />

      <div class="d-flex align-center" style="gap: 10px">
        <v-btn
          variant="outlined"
          rounded="pill"
          class="text-none"
          @click="faq_dialog = true"
        >
          {{ questionsTitle }}
        </v-btn>

        <v-btn
          variant="outlined"
          rounded="pill"
          class="text-none"
          @click="noop"
        >
          Exit
        </v-btn>
      </div>
    </div>

    <!-- Body -->
    <div class="sld-bfb-onbprev__body">
      <s-storefront-listing-onboarding-slide
        v-if="slide"
        :slide="slide"
        :step="stepNumber"
        :model-value="modelValue"
        preview
      />
    </div>

    <!-- Footer -->
    <div class="sld-bfb-onbprev__footer">
      <div class="sld-bfb-onbprev__progress">
        <div
          class="sld-bfb-onbprev__progress-bar"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <div class="d-flex align-center justify-space-between mt-3">
        <div>
          <v-btn
            v-if="!isFirst"
            variant="text"
            class="text-none"
            @click="noop"
          >
            Back
          </v-btn>
        </div>

        <v-btn
          color="black"
          variant="flat"
          class="text-none"
          @click="noop"
        >
          {{ nextLabel }}
        </v-btn>
      </div>
    </div>

    <!-- FAQ dialog (preview) -->
    <v-dialog v-model="faq_dialog" max-width="860" scrollable>
      <v-card rounded="xl" class="text-start">
        <v-toolbar flat>
          <v-btn icon variant="text" @click="faq_dialog = false">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title class="font-weight-black">
            Questions
          </v-toolbar-title>

          <v-spacer />

          <v-btn variant="text" @click="faq_dialog = false">
            <v-icon start>done</v-icon>
            Done
          </v-btn>
        </v-toolbar>

        <v-divider />

        <v-card-text class="pt-4">
          <div v-if="!faqsSafe.length" class="text-muted">
            No FAQs for this step.
          </div>

          <v-expansion-panels v-else variant="accordion">
            <v-expansion-panel v-for="f in faqsSafe" :key="String(f._key)">
              <v-expansion-panel-title class="font-weight-bold">
                {{ f.q || "Question" }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="text-body-2" style="white-space: pre-wrap">
                  {{ f.a || "" }}
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import SStorefrontListingOnboardingSlide from "@selldone/components-vue/storefront/listing/onboarding/SStorefrontListingOnboardingSlide.vue";

export default {
  name: "BListingFormBuilderOnboardingPreview",

  components: { SStorefrontListingOnboardingSlide },

  inject: ["$shop"],

  props: {
    slide: { type: Object, required: true },

    // Optional: to show correct progress (if parent passes them)
    stepIndex: { type: Number, default: 0 }, // 0-based
    totalSteps: { type: Number, default: 1 },

    // Dummy preview value for field slides
    modelValue: { default: null },
  },

  data: () => ({
    faq_dialog: false,
  }),

  computed: {
    shop(): any {
      return (this as any).$shop;
    },

    shopLogoUrl(): string {
      const icon = String(this.shop?.icon || "").trim();
      if (!icon) return "";

      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(icon);

      return icon;
    },

    safeIndex(): number {
      const n = parseInt(String((this as any).stepIndex ?? 0), 10);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    },

    safeTotal(): number {
      const n = parseInt(String((this as any).totalSteps ?? 1), 10);
      return Number.isFinite(n) ? Math.max(1, n) : 1;
    },

    stepNumber(): number {
      return this.safeIndex + 1;
    },

    isFirst(): boolean {
      return this.safeIndex <= 0;
    },

    isLast(): boolean {
      return this.safeIndex >= this.safeTotal - 1;
    },

    progressPercent(): number {
      return Math.round(((this.safeIndex + 1) / (this.safeTotal || 1)) * 100);
    },

    nextLabel(): string {
      if (this.isLast) return "Finish";
      if (this.isFirst) return "Get started";
      return "Next";
    },

    questionsTitle(): string {
      const s: any = (this as any).slide || {};
      const t = String(s.faq_title || "").trim();
      return t || "Questions?";
    },

    faqsSafe(): any[] {
      const s: any = (this as any).slide || {};
      const arr = Array.isArray(s.faqs) ? s.faqs : Array.isArray(s.faq) ? s.faq : [];

      return (Array.isArray(arr) ? arr : [])
        .map((it: any, idx: number) => {
          const o: any = it && typeof it === "object" ? it : {};
          return {
            _key: String(o.id || `faq_${idx}`),
            q: String(o.q ?? o.question ?? "").trim(),
            a: String(o.a ?? o.answer ?? "").trim(),
          };
        })
        .filter((x: any) => x.q || x.a);
    },
  },

  methods: {
    noop() {
      // preview only
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-onbprev {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);

  &__header {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    background: #fff;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  &__logo {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    object-fit: cover;
    display: block;
    border: 1px solid rgba(0, 0, 0, 0.08);
  }

  &__logo-fallback {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: rgba(0, 0, 0, 0.03);
    opacity: 0.75;
  }

  &__body {
    min-height: 520px;
    background: #fff;
  }

  &__footer {
    border-top: 1px solid rgba(0, 0, 0, 0.08);
    padding: 14px 18px;
    background: #fff;
  }

  &__progress {
    height: 3px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: 999px;
    overflow: hidden;
  }

  &__progress-bar {
    height: 100%;
    background: #000;
    border-radius: 999px;
    transition: width 0.2s ease-in-out;
  }
}
</style>