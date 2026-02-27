<!--
  Storefront onboarding FAQ dialog (per-slide).
  Shows a list of Q/A items (accordion).

  Props:
    - v-model: boolean (open/close)
    - faqs: array [{q,a}]
-->

<template>
  <v-dialog v-model="model" max-width="560">
    <v-card rounded="xl" class="sld-onb-faq">
      <v-card-title class="d-flex align-center">
        <div class="font-weight-black">{{ titleSafe }}</div>
        <v-spacer />
        <v-btn icon variant="text" @click="model = false">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pt-4">
        <div v-if="!faqsSafe.length" class="text-muted py-8 text-center">
          No FAQs for this step.
        </div>

        <v-expansion-panels
          v-else
          variant="accordion"
          class="sld-onb-faq__panels"
        >
          <v-expansion-panel
            v-for="f in faqsSafe"
            :key="f._key"
            rounded="lg"
          >
            <v-expansion-panel-title class="font-weight-bold">
              {{ f.q }}
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div class="sld-onb-faq__answer">
                {{ f.a }}
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
type FaqRow = { _key: string; q: string; a: string };

export default {
  name: "SStorefrontListingOnboardingFaqDialog",

  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: "Questions" },
    faqs: { type: Array, default: () => [] },
  },

  emits: ["update:modelValue"],

  computed: {
    model: {
      get(): boolean {
        return !!(this as any).modelValue;
      },
      set(v: boolean) {
        (this as any).$emit("update:modelValue", !!v);
      },
    },

    titleSafe(): string {
      const t = String((this as any).title || "").trim();
      return t || "Questions";
    },

    faqsSafe(): FaqRow[] {
      const arr: any[] = Array.isArray((this as any).faqs) ? (this as any).faqs : [];
      return arr
        .map((r: any, i: number) => {
          const o = r && typeof r === "object" ? r : {};
          const q = String(o.q || o.question || o.title || "").trim();
          const a = String(o.a || o.answer || o.text || o.description || "").trim();
          if (!q && !a) return null;

          return {
            _key: String(o.id || `faq_${i}`),
            q: q || `Question ${i + 1}`,
            a,
          };
        })
        .filter((x: any) => !!x);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-onb-faq {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sld-onb-faq__answer {
  white-space: pre-wrap;
  line-height: 1.65;
  opacity: 0.92;
}

.sld-onb-faq__panels :deep(.v-expansion-panel-title) {
  padding-top: 14px;
  padding-bottom: 14px;
}
</style>