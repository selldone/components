<!--
  Airbnb-like onboarding wizard for listing creation.

  - Header: shop logo (left), Questions / Exit (right)
  - Footer: progress + Back/Next (Get started / Finish)
  - FAQs are stored per-slide (slide.faqs) and shown in Questions dialog.

  v-model returns the full payload (compatible with ShopListingItem columns + meta).
-->

<template>
  <div class="sld-onb-wizard">
    <!-- ───────────────────────── Header ───────────────────────── -->
    <div class="sld-onb-wizard__header">
      <div class="sld-onb-wizard__brand">
        <img
          v-if="shopLogo"
          class="sld-onb-wizard__logo"
          :src="shopLogo"
          alt="logo"
        />
      </div>

      <div class="sld-onb-wizard__top-actions">
        <v-btn
          variant="outlined"
          rounded="pill"
          class="text-none"
          @click="faq_dialog = true"
        >
          Questions?
        </v-btn>

        <v-btn
          variant="outlined"
          rounded="pill"
          class="text-none"
          @click="$emit('exit')"
        >
          Exit
        </v-btn>
      </div>
    </div>

    <!-- FAQ dialog -->
    <s-storefront-listing-onboarding-faq-dialog
      v-model="faq_dialog"
      :faqs="currentFaqs"
      :title="currentFaqTitle"
    />

    <!-- ───────────────────────── Content ───────────────────────── -->
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

    <!-- ───────────────────────── Footer ───────────────────────── -->
    <div class="sld-onb-wizard__footer">
      <div class="sld-onb-progress">
        <div
          class="sld-onb-progress__bar"
          :style="{ width: progressPercent + '%' }"
        />
      </div>

      <div class="sld-onb-wizard__nav">
        <div>
          <v-btn
            v-if="stepIndex > 0"
            variant="text"
            class="text-none"
            @click="back"
          >
            Back
          </v-btn>
        </div>

        <div class="d-flex align-center" style="gap: 10px">
          <v-btn
            color="black"
            variant="flat"
            class="text-none"
            @click="next"
          >
            {{ nextLabel }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SStorefrontListingOnboardingSlide from "./SStorefrontListingOnboardingSlide.vue";
import SStorefrontListingOnboardingFaqDialog from "./SStorefrontListingOnboardingFaqDialog.vue";

type FaqRow = { _key: string; q: string; a: string };

export default {
  name: "SStorefrontListingOnboarding",

  components: {
    SStorefrontListingOnboardingSlide,
    SStorefrontListingOnboardingFaqDialog,
  },

  inject: ["$shop"],

  props: {
    schema: { type: Object, required: true },
    modelValue: { type: Object, default: () => ({ meta: {} }) },

    // In preview mode we still allow interactions, but no finish is emitted.
    preview: { type: Boolean, default: false },
  },

  emits: ["update:modelValue", "finish", "exit"],

  data: () => ({
    stepIndex: 0,
    faq_dialog: false,
  }),

  computed: {
    shop(): any {
      // @ts-ignore
      return (this as any).$shop || null;
    },

    shopLogo(): string {
      const icon = String(this.shop?.icon || "").trim();
      if (!icon) return "";

      // @ts-ignore
      const fn = (this as any).getShopImagePath;
      if (typeof fn === "function") return fn(icon);

      return icon;
    },

    slides(): any[] {
      const s: any = this.schema || {};
      return Array.isArray(s.slides) ? s.slides : [];
    },

    currentSlide(): any | null {
      return this.slides[this.stepIndex] || null;
    },

    isLast(): boolean {
      return this.stepIndex >= this.slides.length - 1;
    },

    nextLabel(): string {
      if (this.isLast) return "Finish";
      if (this.stepIndex === 0) return "Get started";
      return "Next";
    },

    /**
     * ✅ Progress style like Airbnb:
     * first slide => 0%
     * last slide  => 100%
     */
    progressPercent(): number {
      const total = this.slides.length || 1;
      if (total <= 1) return 100;

      const denom = Math.max(1, total - 1);
      const p = (this.stepIndex / denom) * 100;
      return Math.max(0, Math.min(100, Math.round(p)));
    },

    currentFaqTitle(): string {
      const s: any = this.currentSlide || {};
      return String(s.faq_title || s.faqTitle || "Questions").trim() || "Questions";
    },

    /**
     * ✅ FAQs for current slide (safe-normalized)
     * Supported shapes:
     * - slide.faqs = [{q,a}] or [{question,answer}] or [{title,text}]
     * - slide.faq = [...] (fallback)
     */
    currentFaqs(): FaqRow[] {
      const s: any = this.currentSlide || {};
      const raw =
        Array.isArray(s.faqs) ? s.faqs :
          Array.isArray(s.faq) ? s.faq :
            Array.isArray(s.help) ? s.help :
              [];

      return (raw || [])
        .map((r: any, i: number) => {
          const o = r && typeof r === "object" ? r : {};
          const q = String(o.q || o.question || o.title || "").trim();
          const a = String(o.a || o.answer || o.text || o.description || "").trim();
          if (!q && !a) return null;

          return {
            _key: String(o.id || `${String(s.id || "slide")}_faq_${i}`),
            q: q || `Question ${i + 1}`,
            a,
          };
        })
        .filter((x: any) => !!x);
    },

    currentValue(): any {
      const slide: any = this.currentSlide;
      const field = slide?.field;

      if (!slide || slide.type === "info" || !field) return null;

      const payload: any = this.modelValue || {};
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
    schema: {
      deep: false,
      handler() {
        if (this.stepIndex >= this.slides.length) this.stepIndex = 0;
      },
    },

    // close FAQs when slide changes
    stepIndex() {
      this.faq_dialog = false;
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
      const slide: any = this.currentSlide;
      const field = slide?.field;

      if (!slide || slide.type === "info" || !field) return;

      const payload = this.clone(this.modelValue || {});
      if (!payload.meta || typeof payload.meta !== "object") payload.meta = {};

      const type = String(field.type || "");
      const name = String(field.name || "");

      if (type.startsWith("official:")) {
        if (v && typeof v === "object" && !Array.isArray(v)) {
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
  min-height: 100vh;
  background: #fff;

  display: grid;
  grid-template-rows: auto 1fr auto;

  /* optional nice frame in dialog/embedded preview */
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

/* Header */
.sld-onb-wizard__header {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  background: #fff;
}

.sld-onb-wizard__brand {
  min-width: 0;
  display: flex;
  align-items: center;
}

.sld-onb-wizard__logo {
  height: 34px;
  width: auto;
  object-fit: contain;
  display: block;
}

.sld-onb-wizard__top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Content */
.sld-onb-wizard__content {
  min-height: 460px;
}

/* Footer */
.sld-onb-wizard__footer {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  padding: 14px 18px 16px;
  background: #fff;
}

.sld-onb-progress {
  height: 3px;
  background: rgba(0, 0, 0, 0.10);
  border-radius: 999px;
  overflow: hidden;
}

.sld-onb-progress__bar {
  height: 100%;
  background: #000;
  border-radius: 999px;
  transition: width 0.2s ease-in-out;
}

.sld-onb-wizard__nav {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 700px) {
  .sld-onb-wizard__header {
    padding: 12px 12px;
  }

  .sld-onb-wizard__logo {
    height: 30px;
  }

  .sld-onb-wizard__footer {
    padding: 12px 12px 14px;
  }
}
</style>