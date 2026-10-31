<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - FAQ editor for a single slide
-->

<template>
  <v-card rounded="lg" variant="outlined" class="sld-bfb-faqe">
    <v-card-title class="d-flex align-center py-2">
      <div class="font-weight-black">{{ $t('shop_listing.form_builder.faqs') }}</div>
      <v-spacer />
      <v-btn size="small" variant="text" :class="{ 'sd-modern-button sd-modern-button--inline': listingFormBuilderModern }" @click="addFaq">
        <v-icon start>add</v-icon>
        {{ $t('shop_listing.form_builder.add_question') }}
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-2">
      <div v-if="!faqsLocal.length" class="text-muted pa-3">
        {{ $t('shop_listing.form_builder.no_questions') }}
      </div>

      <draggable
        v-else
        v-model="faqsLocal"
        item-key="id"
        handle=".sld-bfb-faqe__drag"
        ghost-class="sld-bfb-faqe__ghost"
        :animation="160"
        :delay="180"
        :delayOnTouchOnly="true"
        @end="emitNow"
      >
        <template #item="{ element, index }">
          <v-card rounded="lg" variant="flat" class="sld-bfb-faqe__row">
            <div class="d-flex align-center mb-2">
              <span class="sld-bfb-faqe__drag" :title="$t('shop_listing.form_builder.drag_reorder')">
                <v-icon size="18">drag_indicator</v-icon>
              </span>

              <div class="ms-2 font-weight-black">
                {{ $t('shop_listing.form_builder.question_number', { number: index + 1 }) }}
              </div>

              <v-spacer />

              <v-btn
                icon
                size="x-small"
                variant="text"
                :class="{ 'sd-modern-icon-button': listingFormBuilderModern }"
                :aria-label="$t('shop_listing.form_builder.remove')"
                :title="$t('shop_listing.form_builder.remove')"
                @click="removeFaq(String(element.id))"
              >
                <v-icon size="18" aria-hidden="true">delete</v-icon>
                <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip">{{ $t('shop_listing.form_builder.remove') }}</v-tooltip>
              </v-btn>
            </div>

            <v-text-field
              :model-value="String(element.q || '')"
              :label="$t('shop_listing.form_builder.question')"
              variant="underlined"
              @update:modelValue="(v) => patchFaq(String(element.id), { q: String(v || '') })"
            />

            <v-textarea
              :model-value="String(element.a || '')"
              :label="$t('shop_listing.form_builder.answer')"
              variant="underlined"
              rows="2"
              auto-grow
              @update:modelValue="(v) => patchFaq(String(element.id), { a: String(v || '') })"
            />
          </v-card>
        </template>
      </draggable>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import draggable from "vuedraggable";

type FaqItem = {
  id: string;
  q: string;
  a: string;
};

export default {
  name: "BListingFormBuilderFaqEditor",
  inject: { listingFormBuilderModern: { default: false } },

  components: { draggable },

  props: {
    modelValue: { type: Array, default: () => [] },
  },

  emits: ["update:modelValue"],

  data: () => ({
    faqsLocal: [] as FaqItem[],
    _syncing: false,
  }),

  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler(v: any) {
        this._syncing = true;
        this.faqsLocal = this.normalizeList(v);
        this._syncing = false;
      },
    },
  },

  methods: {
    clone(v: any) {
      try {
        return JSON.parse(JSON.stringify(v));
      } catch {
        return v;
      }
    },

    makeUid(prefix = "faq") {
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

    ensureFaq(it: any): FaqItem {
      const o: any = it && typeof it === "object" ? it : {};

      const id = String(o.id || this.makeUid("faq"));

      // Backward compatible keys:
      const q = String(o.q ?? o.question ?? "").trimEnd();
      const a = String(o.a ?? o.answer ?? "").trimEnd();

      return { id, q, a };
    },

    normalizeList(v: any): FaqItem[] {
      const arr = Array.isArray(v) ? v : [];
      return arr.map((x) => this.ensureFaq(this.clone(x))).filter((x) => !!x.id);
    },

    emitNow() {
      if (this._syncing) return;
      const out = this.normalizeList(this.faqsLocal);
      this.$emit("update:modelValue", this.clone(out));
    },

    addFaq() {
      const next = this.normalizeList(this.faqsLocal);
      next.push(this.ensureFaq({}));
      this.faqsLocal = next;
      this.emitNow();
    },

    removeFaq(id: string) {
      const next = this.normalizeList(this.faqsLocal).filter((x) => String(x.id) !== String(id));
      this.faqsLocal = next;
      this.emitNow();
    },

    patchFaq(id: string, patch: Partial<FaqItem>) {
      const next = this.normalizeList(this.faqsLocal).map((x) => {
        if (String(x.id) !== String(id)) return x;
        return this.ensureFaq({ ...x, ...(patch || {}) });
      });

      this.faqsLocal = next;
      this.emitNow();
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-faqe {
  background: #fff;

  &__row {
    border: 1px solid rgba(0, 0, 0, 0.06);
    background: rgba(0, 0, 0, 0.012);
    padding: 10px;
    margin-bottom: 10px;
  }

  &__drag {
    width: 26px;
    height: 26px;
    border-radius: 10px;
    border: 1px solid rgba(0, 0, 0, 0.10);
    background: rgba(0, 0, 0, 0.03);
    display: grid;
    place-items: center;
    cursor: grab;
  }

  :deep(.sld-bfb-faqe__ghost) {
    opacity: 0.6;
  }
}
</style>