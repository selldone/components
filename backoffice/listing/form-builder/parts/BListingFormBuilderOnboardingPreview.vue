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
  <div class="sld-bfb-onbprev text-start" :class="{ 'sld-bfb-onbprev--modern': modern }">
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

      <div class="sld-bfb-onbprev__header-actions d-flex align-center" style="gap: 10px">
        <v-btn
          variant="outlined"
          :rounded="modern ? 'lg' : 'pill'"
          class="text-none"
          :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
          @click="faq_dialog = true"
        >
          {{ questionsTitle }}
        </v-btn>

        <v-btn
          variant="outlined"
          :rounded="modern ? 'lg' : 'pill'"
          class="text-none"
          :class="{ 'sd-modern-button sd-modern-button--compact': modern }"
          @click="noop"
        >
          {{ $t('shop_listing.form_builder.exit') }}
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
            {{ $t('global.actions.back') }}
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
      <v-card rounded="xl" class="text-start" :class="{ 'sd-modern-widget sld-bfb-onbprev__faq-dialog': modern }">
        <v-toolbar flat>
          <v-tooltip location="top" content-class="sd-modern-tooltip"><template #activator="{ props }"><v-btn v-bind="props" icon variant="text" :class="{ 'sd-modern-icon-button': modern }" :aria-label="$t('global.actions.close')" @click="faq_dialog = false"><v-icon aria-hidden="true">close</v-icon></v-btn></template>{{ $t('global.actions.close') }}</v-tooltip>

          <v-toolbar-title class="font-weight-black">
            {{ $t('shop_listing.form_builder.faqs') }}
          </v-toolbar-title>

          <v-spacer />

          <v-btn variant="text" @click="faq_dialog = false">
            <v-icon start>done</v-icon>
            {{ $t('shop_listing.form_builder.done') }}
          </v-btn>
        </v-toolbar>

        <v-divider />

        <v-card-text class="pt-4">
          <div v-if="!faqsSafe.length" class="text-muted">
            {{ $t('shop_listing.form_builder.no_questions') }}
          </div>

          <v-expansion-panels v-else variant="accordion">
            <v-expansion-panel v-for="f in faqsSafe" :key="String(f._key)">
              <v-expansion-panel-title class="font-weight-bold">
                {{ f.q || $t('shop_listing.form_builder.question') }}
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
    modern: { type: Boolean, default: false },
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
      if (this.isLast) return this.$t("global.actions.finish");
      if (this.isFirst) return this.$t("shop_listing.form_builder.get_started");
      return this.$t("global.actions.next");
    },

    questionsTitle(): string {
      const s: any = (this as any).slide || {};
      const t = String(s.faq_title || "").trim();
      return t || this.$t("shop_listing.form_builder.questions");
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

.sld-bfb-onbprev--modern {
  background: rgb(var(--v-theme-surface));
  border-color: var(--sd-modern-border);
  border-radius: 15px;
  .sld-bfb-onbprev__header { background: transparent; border-color: var(--sd-modern-border); padding: 16px 20px; gap: 12px; flex-wrap: wrap; }
  .sld-bfb-onbprev__header-actions { flex-wrap: wrap; gap: 8px !important; max-width: 100%; min-width: 0; }
  .sld-bfb-onbprev__header-actions > .v-btn { max-width: 100%; min-width: 0; white-space: normal; height: auto; }
  .sld-bfb-onbprev__header-actions :deep(.v-btn__content) { white-space: normal; overflow-wrap: anywhere; }
  .sld-bfb-onbprev__body { background: transparent; min-height: 310px; }
  .sld-bfb-onbprev__footer { background: transparent; border-color: var(--sd-modern-border); padding: 16px 20px; }
  .sld-bfb-onbprev__progress { background: var(--sd-modern-border); }
  .sld-bfb-onbprev__progress-bar { background: rgb(var(--v-theme-primary)); }
  :deep(.sld-onb-slide) { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); padding: 32px; }
  :deep(.sld-onb-slide__content) { min-width: 0; }
  :deep(.sld-onb-slide__content:only-child) { grid-column: 1 / -1; }
  :deep(.sld-onb-opt) { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); border-color: var(--sd-modern-border); text-align: start; }
  :deep(.sld-onb-opt:hover), :deep(.sld-onb-opt.-selected) { background: var(--sd-modern-inset); border-color: rgba(var(--v-theme-on-surface), 0.4); }
  :deep(.sld-onb-map) { border-color: var(--sd-modern-border); background: repeating-linear-gradient(45deg, rgba(var(--v-theme-on-surface), 0.03), rgba(var(--v-theme-on-surface), 0.03) 10px, rgba(var(--v-theme-on-surface), 0.015) 10px, rgba(var(--v-theme-on-surface), 0.015) 20px); }
  :deep(.sld-onb-map__badge) { background: rgb(var(--v-theme-surface)); color: rgb(var(--v-theme-on-surface)); border-color: var(--sd-modern-border); }
  :deep(.sld-onb-items__sep) { background: var(--sd-modern-border); }
  :deep(.sld-onb-title) { font-size: 22px; font-weight: 500; line-height: 30px; }
  :deep(.sld-onb-subtitle), :deep(.sld-onb-tips) { font-size: 13px; line-height: 21px; }
  :deep(.sld-onb-slide__inner) { padding: 0; gap: 24px; }
  @media (max-width: 600px) {
    :deep(.sld-onb-slide) { padding: 20px; }
  }
}
.sld-bfb-onbprev__faq-dialog {
  :deep(.v-toolbar) { background: transparent; }
  :deep(.v-toolbar-title) { font-size: 16px; line-height: 24px; font-weight: 500 !important; }
}
</style>
