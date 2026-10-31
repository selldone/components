<template>
  <v-container class="sld-bfb text-start" :class="{ 'sld-bfb--modern': modern }" :max-width="modern ? 1040 : 1900">
    <div class="sld-bfb__grid">
      <!-- Left: steps -->
      <div class="sld-bfb__left">
        <b-listing-form-builder-slide-list
          :slides="slidesLocal"
          :selected="selectedId"
          :modern="modern"
          @update:selected="selectedId = $event"
          @add="addSlide"
          @remove="removeSlide"
          @duplicate="duplicateSlide"
          @move="moveSlide"
        />
      </div>

      <!-- Right: editor -->
      <div class="sld-bfb__right">
        <div v-if="modern && !selectedSlide" class="sd-modern-widget sd-modern-empty-state">
          <v-icon aria-hidden="true">view_quilt</v-icon>
          <h2>{{ $t('shop_listing.form_builder.no_steps') }}</h2>
          <p>{{ $t('shop_listing.form_builder.select_step') }}</p>
        </div>

        <v-alert
          v-else-if="!selectedSlide"
          type="info"
          variant="tonal"
          border="start"
          class="mb-0"
        >
          Select a step to edit.
        </v-alert>

        <section v-else :class="{ 'sd-modern-widget sld-bfb__workspace': modern }">
          <header v-if="modern" class="sld-bfb__toolbar">
            <span>{{ $t('shop_listing.form_builder.step_position', { step: selectedIndex + 1, total: slidesLocal.length }) }}</span>
            <div class="sd-modern-actions">
              <v-tooltip v-for="action in stepActions" :key="action.key" location="top" content-class="sd-modern-tooltip">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button" :aria-label="action.label" :disabled="action.disabled" @click="runStepAction(action.key)">
                    <v-icon aria-hidden="true">{{ action.icon }}</v-icon>
                  </v-btn>
                </template>
                {{ action.label }}
              </v-tooltip>
            </div>
          </header>
          <b-listing-form-builder-slide-editor
            :key="selectedId"
            :slide="selectedSlide"
            :modern="modern"
            :step-index="selectedIndex"
            :total-steps="totalSteps"
            @update:slide="onUpdateSlide"
          />
        </section>
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import BListingFormBuilderSlideList from "./parts/BListingFormBuilderSlideList.vue";
import BListingFormBuilderSlideEditor from "./parts/BListingFormBuilderSlideEditor.vue";

type Slide = Record<string, any> & {
  id: string;
};

export default {
  name: "BListingFormBuilder",

  components: {
    BListingFormBuilderSlideList,
    BListingFormBuilderSlideEditor,
  },

  props: {
    /**
     * IMPORTANT:
     * We keep modelValue as-is (array of slides).
     * DO NOT normalize into a different schema shape.
     */
    modelValue: { type: Array, default: () => [] },
    modern: { type: Boolean, default: false },
  },

  provide() {
    return { listingFormBuilderModern: this.modern };
  },

  emits: ["update:modelValue"],

  data: () => ({
    slidesLocal: [] as Slide[],
    selectedId: null as string | null,

    // prevents “emit -> parent -> prop -> reset local -> emit ...”
    _lastEmittedSig: "" as string,
  }),

  computed: {
    stepActions(): any[] {
      return [
        { key: "up", icon: "arrow_upward", label: this.$t("shop_listing.form_builder.move_up"), disabled: this.selectedIndex === 0 },
        { key: "down", icon: "arrow_downward", label: this.$t("shop_listing.form_builder.move_down"), disabled: this.selectedIndex >= this.slidesLocal.length - 1 },
        { key: "duplicate", icon: "content_copy", label: this.$t("shop_listing.form_builder.duplicate"), disabled: false },
        { key: "remove", icon: "delete_outline", label: this.$t("shop_listing.form_builder.remove"), disabled: false },
      ];
    },
    totalSteps(): number {
      return (this.slidesLocal?.length || 0) || 1;
    },

    selectedIndex(): number {
      const id = this.selectedId;
      if (!id) return 0;
      const i = (this.slidesLocal || []).findIndex((s) => String(s?.id) === String(id));
      return i >= 0 ? i : 0;
    },

    selectedSlide(): Slide | null {
      const id = this.selectedId;
      if (!id) return null;
      return (this.slidesLocal || []).find((s) => String(s?.id) === String(id)) || null;
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      deep: false,
      handler(v: any) {
        const sig = this.signature(v);

        // If this prop update is exactly what we emitted last, do nothing.
        if (sig && sig === this._lastEmittedSig) return;

        // ✅ Minimal normalization ONLY (do not inject field/layout/type defaults)
        const normalized = this.normalizeSlides(Array.isArray(v) ? v : []);
        this.slidesLocal = normalized;

        // Keep selection stable
        if (this.selectedId) {
          const exists = normalized.some((s) => String(s.id) === String(this.selectedId));
          if (!exists) this.selectedId = normalized[0]?.id || null;
        } else {
          this.selectedId = normalized[0]?.id || null;
        }
      },
    },
  },

  methods: {
    runStepAction(action: string) {
      if (!this.selectedId) return;
      if (action === "duplicate") this.duplicateSlide(this.selectedId);
      else if (action === "remove") this.removeSlide(this.selectedId);
      else this.moveSlide({ id: this.selectedId, dir: action });
    },
    signature(v: any): string {
      try {
        return JSON.stringify(v ?? null);
      } catch {
        return String(v ?? "");
      }
    },

    uid(prefix = "sld"): string {
      return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    },

    clone<T>(v: T): T {
      return JSON.parse(JSON.stringify(v));
    },

    /**
     * ✅ Minimal & safe:
     * - ensures every slide has an id
     * - does NOT add/override: type/layout/field/etc.
     */
    normalizeSlides(list: any[]): Slide[] {
      const arr = Array.isArray(list) ? list : [];
      return arr
        .map((x: any) => {
          const s: any = this.clone(x || {});
          if (!s.id) s.id = this.uid("sld");
          return s as Slide;
        })
        .filter((s: any) => !!s?.id);
    },

    emitSlides(next: Slide[]) {
      const clean = this.clone(next);
      const sig = this.signature(clean);
      this._lastEmittedSig = sig;
      this.$emit("update:modelValue", clean);
    },

    setSlides(next: Slide[]) {
      this.slidesLocal = next;
      this.emitSlides(next);
    },

    addSlide() {
      const next = this.clone(this.slidesLocal || []);

      // ✅ New slides can have defaults (this does not break old schemas)
      const slide: any = {
        id: this.uid("sld"),

        type: "field",
        layout: "split_right",

        title: "",
        subtitle: "",
        tips: "",
        image: "",

        field: {
          uid: this.uid("fld"),
          type: "text",
          name: "field",
          title: "",
          placeholder: "",
          required: false,
        },
      };

      next.push(slide);
      this.setSlides(next);
      this.selectedId = slide.id;
    },

    duplicateSlide(id: string) {
      const next = this.clone(this.slidesLocal || []);
      const i = next.findIndex((s) => String(s.id) === String(id));
      if (i < 0) return;

      const copy: any = this.clone(next[i]);
      copy.id = this.uid("sld");

      // ✅ If there is a field with uid, regenerate it (helps editor UI)
      if (copy.field && typeof copy.field === "object") {
        copy.field = { ...copy.field };
        if (copy.field.uid) copy.field.uid = this.uid("fld");
      }

      next.splice(i + 1, 0, copy);
      this.setSlides(next);
      this.selectedId = copy.id;
    },

    removeSlide(id: string) {
      const next = this.clone(this.slidesLocal || []);
      const i = next.findIndex((s) => String(s.id) === String(id));
      if (i < 0) return;

      next.splice(i, 1);
      this.setSlides(next);

      if (!next.length) {
        this.selectedId = null;
        return;
      }

      // pick neighbor
      const newIndex = Math.min(i, next.length - 1);
      this.selectedId = next[newIndex]?.id || null;
    },

    /**
     * ✅ FIX:
     * SlideList currently emits: { id, dir: -1 } or { id, dir: 1 }
     * We support BOTH numeric and string directions.
     */
    moveSlide(payload: any) {
      const id = payload?.id;
      const dirRaw = payload?.dir;

      if (!id) return;

      let delta = 0;

      // numeric (-1/+1)
      const n = Number(dirRaw);
      if (Number.isFinite(n) && (n === -1 || n === 1)) {
        delta = n;
      } else {
        // string ("up"/"down")
        const s = String(dirRaw || "").toLowerCase();
        if (s === "up") delta = -1;
        if (s === "down") delta = 1;
      }

      if (!delta) return;

      const next = this.clone(this.slidesLocal || []);
      const i = next.findIndex((s) => String(s.id) === String(id));
      if (i < 0) return;

      const j = i + delta;
      if (j < 0 || j >= next.length) return;

      // reorder
      const [moved] = next.splice(i, 1);
      next.splice(j, 0, moved);

      this.setSlides(next);
      this.selectedId = id;
    },

    onUpdateSlide(updated: any) {
      if (!updated || !updated.id) return;

      const next = this.clone(this.slidesLocal || []);
      const i = next.findIndex((s) => String(s.id) === String(updated.id));
      if (i < 0) return;

      next.splice(i, 1, this.clone(updated));
      this.setSlides(next);
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb {
  width: 100%;
}

.sld-bfb__grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.sld-bfb__left,
.sld-bfb__right {
  min-width: 0;
}

.sld-bfb--modern {
  padding: 0;
  --sd-modern-border: rgba(var(--v-theme-on-surface), 0.09);
  --sd-modern-muted: rgba(var(--v-theme-on-surface), 0.66);
  --sd-modern-inset: rgba(var(--v-theme-on-surface), 0.025);
  --sd-modern-selected-shadow: 0 2px 8px rgba(var(--v-theme-on-surface), 0.09);
  font-size: 13px;
  line-height: 21px;

  .sld-bfb__grid { grid-template-columns: 154px minmax(0, 1fr); gap: 22px; align-items: start; }
  .sld-bfb__workspace { padding: 25px 26px; }
  .sld-bfb__toolbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-block-end: 22px; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  .sld-bfb__toolbar .sd-modern-actions { gap: 6px; }

  :deep(.sld-bfb-field) { border: 0; border-radius: 0; background: transparent; box-shadow: none; }
  :deep(.sld-bfb-field > .v-card-text) { padding: 0; }
  :deep(.sld-bfb-field > .v-card-text > .d-flex) { display: none !important; }
  :deep(.sld-bfb-field > .v-card-text > .v-divider) { display: none; }
  :deep(.sld-bfb-field .v-alert) { background: var(--sd-modern-inset); border: 0; border-radius: 10px; color: rgb(var(--v-theme-on-surface)); font-size: 12px; line-height: 20px; padding: 14px 16px; }
  :deep(.sld-bfb-field .v-alert__underlay), :deep(.sld-bfb-field .v-alert__border) { display: none; }
  :deep(.sld-bfb-field .v-alert__prepend .v-icon) { color: var(--sd-modern-muted); font-size: 18px; }
  :deep(.sld-bfb-field .v-text-field), :deep(.sld-bfb-field .v-textarea), :deep(.sld-bfb-select .v-text-field), :deep(.sld-bfb-select .v-select) { margin-block-end: 12px; }
  :deep(.sld-bfb-opt-edit__grid), :deep(.sld-bfb-iie__grid) { grid-template-columns: 1fr; gap: 22px; }
  :deep(.sld-bfb-iie), :deep(.sld-bfb-faqe) { border: 0; border-radius: 0; background: transparent; }
  :deep(.sld-bfb-iie > .v-card-title), :deep(.sld-bfb-faqe > .v-card-title), :deep(.sld-bfb-iie > .v-card-text), :deep(.sld-bfb-faqe > .v-card-text) { padding-inline: 0 !important; }
  :deep(.sld-bfb-iie > .v-divider), :deep(.sld-bfb-faqe > .v-divider) { display: none; }
  :deep(.sld-bfb-iie__row), :deep(.sld-bfb-faqe__row) { padding: 20px 0; border: 0; border-block-start: 1px solid var(--sd-modern-border); border-radius: 0; background: transparent; }
  :deep(.sld-bfb-opt) { border: 0; border-block-start: 1px solid var(--sd-modern-border); border-radius: 0; background: transparent; box-shadow: none; }
  :deep(.sld-bfb-opt__head) { padding: 14px 0; gap: 10px; background: transparent; }
  :deep(.sld-bfb-opt__title), :deep(.sld-bfb-opt__subtitle) { white-space: normal; overflow-wrap: anywhere; }
  :deep(.sld-bfb-opt__body) { padding: 18px 0; background: transparent; border-radius: 0; }
  :deep(.sld-bfb-opt__title), :deep(.sld-bfb-iie .font-weight-black), :deep(.sld-bfb-faqe .font-weight-black), :deep(.sld-bfb-select .font-weight-black), :deep(.sld-bfb-up .font-weight-black) { font-size: 13px; line-height: 21px; font-weight: 500 !important; }
  :deep(.sld-bfb-up__box) { border-color: var(--sd-modern-border); background: var(--sd-modern-inset); box-shadow: 0 2px 7px rgba(var(--v-theme-on-surface), 0.07); }
  :deep(.sld-bfb-up__row) { grid-template-columns: 140px minmax(0, 1fr); gap: 18px; }
  :deep(.sld-bfb-up__meta) { min-width: 0; }
  :deep(.sld-bfb-up__meta > .small) { font-size: 12px; line-height: 19px; color: var(--sd-modern-muted); }
  :deep(.sld-bfb-up__meta > .d-flex) { gap: 12px !important; }
  :deep(.sld-bfb-select > .v-divider) { margin-block: 24px !important; }
  :deep(.sld-bfb-select__settings) { display: grid !important; grid-template-columns: 1fr 1fr; gap: 24px !important; align-items: start !important; }
  :deep(.sld-bfb-select__settings > .s--smart-toggle) { grid-column: 1 / -1; margin-inline-start: 0 !important; }
  :deep(.sld-bfb-select__settings > .v-select) { max-width: none !important; }
  :deep(.sld-bfb-select .v-chip) { background: transparent; color: var(--sd-modern-muted); font-size: 11px; }
  :deep(.sld-bfb-opt__meta) { gap: 8px; }
  :deep(.sld-bfb-opt__subtitle), :deep(.sld-bfb-select > .small) { color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; }

  @media (max-width: 760px) {
    .sld-bfb__grid { grid-template-columns: 130px minmax(0, 1fr); gap: 16px; }
    .sld-bfb__workspace { padding: 23px 20px; }
  }
  @media (max-width: 600px) {
    .sld-bfb__grid { grid-template-columns: 1fr; }
    .sld-bfb__workspace { padding: 22px 16px; }
    :deep(.sld-bfb-up__row) { grid-template-columns: 1fr; gap: 14px; }
    :deep(.sld-bfb-select__settings), :deep(.sld-bfb-fcfg > .sld-bfb-row) { grid-template-columns: 1fr; }
    :deep(.sld-bfb-opt__head) { display: grid; grid-template-columns: 20px 34px minmax(0, 1fr); }
    :deep(.sld-bfb-opt__meta) { grid-column: 2 / -1; justify-self: end; }
  }
}
</style>
