<!--
  - Selldone® Business OS™
  - Backoffice Listing Form Builder
  - Slide editor (supports: info / field, info variants, and per-slide FAQs)
  - IMPORTANT: Keep schema backward-compatible (do NOT inject defaults into saved schema).
-->

<template>
  <div class="sld-bfb-se">
    <div v-if="!local" class="text-muted pa-4">
      Select a step to edit.
    </div>

    <div v-else class="sld-bfb-se__grid">
      <!-- ================= Left: Editor ================= -->
      <div>
        <!-- Slide basics -->
        <v-card rounded="xl" variant="flat" class="mb-3">
          <v-card-title class="font-weight-black">Step</v-card-title>
          <v-divider />

          <v-card-text>
            <div class="d-grid" style="gap: 10px">
              <v-select
                :model-value="slideTypeSafe"
                :items="slideTypeOptions"
                item-title="title"
                item-value="value"
                label="Step type"
                variant="underlined"
                @update:modelValue="onChangeSlideType"
              />

              <!-- Only for info slides: choose presentation -->
              <v-select
                v-if="isInfo"
                :model-value="infoVariantSafe"
                :items="infoVariantOptions"
                item-title="title"
                item-value="value"
                label="Info layout"
                variant="underlined"
                @update:modelValue="onChangeInfoVariant"
              />

              <b-listing-form-builder-layout-picker
                :model-value="String(local.layout || 'split_right')"
                @update:modelValue="(v) => patchSlide({ layout: String(v || 'split_right') })"
              />

              <v-text-field
                :model-value="localTitle"
                label="Title"
                variant="underlined"
                @update:modelValue="(v) => (localTitle = String(v || ''))"
              />

              <v-textarea
                :model-value="localSubtitle"
                label="Subtitle"
                variant="underlined"
                rows="2"
                auto-grow
                @update:modelValue="(v) => (localSubtitle = String(v || ''))"
              />

              <v-textarea
                :model-value="localTips"
                label="Tips (optional)"
                variant="underlined"
                rows="2"
                auto-grow
                @update:modelValue="(v) => (localTips = String(v || ''))"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Media / Items -->
        <v-card rounded="xl" variant="flat" class="mb-3">
          <v-card-title class="font-weight-black">
            {{ isInfoItemsList ? "Items" : "Illustration" }}
          </v-card-title>
          <v-divider />

          <v-card-text>
            <!-- ✅ Informative itemized list -->
            <b-listing-form-builder-info-items-editor
              v-if="isInfoItemsList"
              :model-value="infoItemsSafe"
              @update:modelValue="onUpdateInfoItems"
            />

            <!-- ✅ Default: single image -->
            <b-listing-form-builder-image-uploader
              v-else
              :model-value="String(local.image || '')"
              label="Slide image"
              hint="Optional. Used as the right-side illustration (Airbnb style)."
              @update:modelValue="(v) => patchSlide({ image: String(v || '') })"
            />
          </v-card-text>
        </v-card>

        <!-- Field (only when type=field) -->
        <v-card v-if="isField" rounded="xl" variant="flat" class="mb-3">
          <v-card-title class="font-weight-black">Input</v-card-title>
          <v-divider />
          <v-card-text>
            <!-- ✅ FIX: use modelValue/update:modelValue (FieldEditor API) -->
            <b-listing-form-builder-field-editor
              :model-value="local.field"
              @update:modelValue="onUpdateField"
            />
          </v-card-text>
        </v-card>

        <!-- FAQs (per-slide) -->
        <v-card rounded="xl" variant="flat" class="mb-3">
          <v-card-title class="d-flex align-center">
            <div class="font-weight-black">Questions (FAQs)</div>
            <v-spacer />
            <v-chip
              v-if="faqCount > 0"
              size="x-small"
              variant="tonal"
              class="me-2"
            >
              {{ faqCount }}
            </v-chip>

            <v-btn size="small" variant="text" @click="faq_dialog = true">
              <v-icon start>help_outline</v-icon>
              Edit FAQs
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text>
            <v-text-field
              :model-value="String(local.faq_title || '')"
              label="Questions button title (optional)"
              variant="underlined"
              @update:modelValue="(v) => patchSlide({ faq_title: String(v || '') })"
            />

            <div class="text-muted small mt-1">
              These FAQs belong to this step only. The storefront onboarding wizard can show them when the user clicks
              <b>Questions</b>.
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- ================= Right: Preview ================= -->
      <div>
        <div class="text-muted small mb-2">Preview</div>

        <b-listing-form-builder-onboarding-preview
          :slide="local"
          :step-index="stepIndexSafe"
          :total-steps="totalStepsSafe"
          :model-value="previewValue"
        />

        <div class="text-muted small mt-2">
          Preview is non-interactive and shows the final storefront chrome & layout.
        </div>
      </div>
    </div>

    <!-- FAQs dialog -->
    <v-dialog v-model="faq_dialog" max-width="920" scrollable>
      <v-card rounded="xl" class="text-start">
        <v-toolbar flat>
          <v-btn icon variant="text" @click="faq_dialog = false">
            <v-icon>close</v-icon>
          </v-btn>

          <v-toolbar-title class="font-weight-black">
            FAQs for this step
          </v-toolbar-title>

          <v-spacer />

          <v-btn variant="text" @click="faq_dialog = false">
            <v-icon start>done</v-icon>
            Done
          </v-btn>
        </v-toolbar>

        <v-divider />

        <v-card-text class="pt-4">
          <b-listing-form-builder-faq-editor
            :model-value="faqsSafe"
            @update:modelValue="onUpdateFaqs"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import BListingFormBuilderLayoutPicker from "./BListingFormBuilderLayoutPicker.vue";
import BListingFormBuilderImageUploader from "./BListingFormBuilderImageUploader.vue";
import BListingFormBuilderFieldEditor from "./fields/BListingFormBuilderFieldEditor.vue";
import BListingFormBuilderInfoItemsEditor from "./BListingFormBuilderInfoItemsEditor.vue";
import BListingFormBuilderFaqEditor from "./BListingFormBuilderFaqEditor.vue";
import BListingFormBuilderOnboardingPreview from "./BListingFormBuilderOnboardingPreview.vue";

export default {
  name: "BListingFormBuilderSlideEditor",

  components: {
    BListingFormBuilderLayoutPicker,
    BListingFormBuilderImageUploader,
    BListingFormBuilderFieldEditor,
    BListingFormBuilderInfoItemsEditor,
    BListingFormBuilderFaqEditor,
    BListingFormBuilderOnboardingPreview,
  },

  props: {
    slide: { type: Object, required: true },

    stepIndex: { type: Number, default: 0 }, // 0-based
    totalSteps: { type: Number, default: 1 },
  },

  emits: ["update:slide"],

  data: () => ({
    local: null as any | null,
    _syncing: false,

    faq_dialog: false,
  }),

  computed: {
    stepIndexSafe(): number {
      const n = parseInt(String((this as any).stepIndex ?? 0), 10);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    },

    totalStepsSafe(): number {
      const n = parseInt(String((this as any).totalSteps ?? 1), 10);
      return Number.isFinite(n) ? Math.max(1, n) : 1;
    },

    slideTypeOptions(): any[] {
      return [
        { title: "Informative (no input)", value: "info" },
        { title: "Input (field)", value: "field" },
      ];
    },

    infoVariantOptions(): any[] {
      return [
        { title: "Hero illustration (single image)", value: "hero" },
        { title: "Itemized list (Airbnb style)", value: "items_list" },
      ];
    },

    slideTypeSafe(): string {
      const t = String(this.local?.type || "").trim();
      if (t === "info" || t === "field") return t;
      return this.local?.field ? "field" : "info";
    },

    isInfo(): boolean {
      return this.slideTypeSafe === "info";
    },

    isField(): boolean {
      return this.slideTypeSafe === "field";
    },

    infoVariantSafe(): string {
      const v = String(this.local?.info_variant || "").trim();
      if (v === "hero" || v === "items_list") return v;

      const hasItems = this.getInfoItemsRaw().length > 0;
      return hasItems ? "items_list" : "hero";
    },

    isInfoItemsList(): boolean {
      return this.isInfo && this.infoVariantSafe === "items_list";
    },

    infoItemsSafe(): any[] {
      return this.ensureInfoItems(this.getInfoItemsRaw());
    },

    faqsSafe(): any[] {
      const raw = this.getFaqsRaw();
      return this.ensureFaqs(raw);
    },

    faqCount(): number {
      return (Array.isArray(this.faqsSafe) ? this.faqsSafe.length : 0) || 0;
    },

    localTitle: {
      get(): string {
        return String(this.local?.title || "");
      },
      set(v: string) {
        this.patchSlide({ title: String(v || "") });
      },
    },

    localSubtitle: {
      get(): string {
        return String(this.local?.subtitle || "");
      },
      set(v: string) {
        this.patchSlide({ subtitle: String(v || "") });
      },
    },

    localTips: {
      get(): string {
        return String(this.local?.tips || "");
      },
      set(v: string) {
        this.patchSlide({ tips: String(v || "") });
      },
    },

    previewValue(): any {
      if (!this.isField) return null;

      const t = String(this.local?.field?.type || "text");
      if (t === "switch") return false;
      if (t === "number") return 1;
      if (t === "select") return null;
      if (t === "textarea") return "Example text...";
      return "";
    },
  },

  watch: {
    slide: {
      immediate: true,
      handler(v: any) {
        this._syncing = true;
        this.local = this.clone(v || {});
        if (this.local && !this.local.id) this.local.id = this.makeUid("sld");
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

    hasOwn(obj: any, key: string): boolean {
      return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
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

    ensureInfoItems(items: any) {
      const arr = Array.isArray(items) ? items : [];
      return arr
        .map((it: any) => {
          const o: any = it && typeof it === "object" ? { ...it } : {};
          if (!o.id) o.id = this.makeUid("inf");
          if (o.title === undefined || o.title === null) o.title = "";
          if (o.description === undefined || o.description === null) o.description = "";
          if (o.image === undefined || o.image === null) o.image = "";
          return o;
        })
        .filter((x: any) => !!x?.id);
    },

    ensureFaqs(list: any) {
      const arr = Array.isArray(list) ? list : [];
      return arr
        .map((it: any) => {
          const o: any = it && typeof it === "object" ? { ...it } : {};
          if (!o.id) o.id = this.makeUid("faq");
          const q = String(o.q ?? o.question ?? "").trimEnd();
          const a = String(o.a ?? o.answer ?? "").trimEnd();
          return { id: String(o.id), q, a };
        })
        .filter((x: any) => !!x?.id);
    },

    getInfoItemsRaw(): any[] {
      const s: any = this.local || {};
      if (Array.isArray(s.info_items)) return s.info_items;
      if (Array.isArray(s.items)) return s.items;
      if (s.info && typeof s.info === "object" && Array.isArray(s.info.items)) return s.info.items;
      return [];
    },

    onUpdateInfoItems(items: any[]) {
      const nextItems = this.ensureInfoItems(items);

      const s: any = this.local || {};
      if (this.hasOwn(s, "info_items")) {
        this.patchSlide({ info_items: nextItems });
        return;
      }

      if (this.hasOwn(s, "items")) {
        this.patchSlide({ items: nextItems });
        return;
      }

      if (s.info && typeof s.info === "object" && this.hasOwn(s.info, "items")) {
        this.patchSlide({ info: { ...this.clone(s.info), items: nextItems } });
        return;
      }

      this.patchSlide({ info_items: nextItems });
    },

    getFaqsRaw(): any[] {
      const s: any = this.local || {};
      if (Array.isArray(s.faqs)) return s.faqs;
      if (Array.isArray(s.faq)) return s.faq;
      return [];
    },

    onUpdateFaqs(list: any[]) {
      const nextFaqs = this.ensureFaqs(list);

      const s: any = this.local || {};
      if (this.hasOwn(s, "faqs")) {
        this.patchSlide({ faqs: nextFaqs });
        return;
      }

      if (this.hasOwn(s, "faq")) {
        this.patchSlide({ faq: nextFaqs });
        return;
      }

      this.patchSlide({ faqs: nextFaqs });
    },

    patchSlide(patch: any) {
      if (!this.local) return;

      const next = {
        ...this.clone(this.local),
        ...(patch || {}),
      };

      if (!next.id) next.id = this.makeUid("sld");

      this.local = next;

      if (!this._syncing) {
        this.$emit("update:slide", this.clone(next));
      }
    },

    // ✅ FIX: apply field changes into slide object
    onUpdateField(f: any) {
      this.patchSlide({ field: f });
    },

    onChangeSlideType(v: any) {
      const type = String(v || "field");

      if (type === "info") {
        this.patchSlide({ type: "info" });
        return;
      }

      const currentField = this.local?.field;
      this.patchSlide({
        type: "field",
        field: currentField ? currentField : this.ensureFieldStub(currentField),
      });
    },

    onChangeInfoVariant(v: any) {
      const vv = String(v || "hero");
      this.patchSlide({ info_variant: vv === "items_list" ? "items_list" : "hero" });
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
}
</style>