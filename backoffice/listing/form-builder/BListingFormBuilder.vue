<template>
  <v-container class="sld-bfb" maxWidth="1900">
    <div class="sld-bfb__grid">
      <!-- Left: steps -->
      <div class="sld-bfb__left">
        <b-listing-form-builder-slide-list
          :slides="slidesLocal"
          :selected="selectedId"
          @update:selected="selectedId = $event"
          @add="addSlide"
          @remove="removeSlide"
          @duplicate="duplicateSlide"
          @move="moveSlide"
        />
      </div>

      <!-- Right: editor -->
      <div class="sld-bfb__right">
        <v-alert
          v-if="!selectedSlide"
          type="info"
          variant="tonal"
          border="start"
          class="mb-0"
        >
          Select a step to edit.
        </v-alert>

        <b-listing-form-builder-slide-editor
          v-else
          :slide="selectedSlide"
          :step-index="selectedIndex"
          :total-steps="totalSteps"
          @update:slide="onUpdateSlide"
        />
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
  },

  emits: ["update:modelValue"],

  data: () => ({
    slidesLocal: [] as Slide[],
    selectedId: null as string | null,

    // prevents “emit -> parent -> prop -> reset local -> emit ...”
    _lastEmittedSig: "" as string,
  }),

  computed: {
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
</style>