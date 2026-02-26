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
          @update:slide="onUpdateSlide"
        />
      </div>
    </div>
  </v-container>
</template>

<script lang="ts">
import BListingFormBuilderSlideList from "./parts/BListingFormBuilderSlideList.vue";
import BListingFormBuilderSlideEditor from "./parts/BListingFormBuilderSlideEditor.vue";

type Slide = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  tip?: string | null;
  layout?: string | null;
  image?: string | null;
  field?: any | null;
};

export default {
  name: "BListingFormBuilder",

  components: {
    BListingFormBuilderSlideList,
    BListingFormBuilderSlideEditor,
  },

  props: {
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

    uid(): string {
      return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    },

    clone<T>(v: T): T {
      return JSON.parse(JSON.stringify(v));
    },

    normalizeSlides(list: any[]): Slide[] {
      const out: Slide[] = (list || []).map((x: any) => {
        const s: Slide = this.clone(x || {});
        if (!s.id) s.id = this.uid();
        if (!s.layout) s.layout = "split";
        if (!s.field || typeof s.field !== "object") {
          s.field = { type: "text", name: "", title: "", required: false };
        }
        return s;
      });

      // Ensure at least one slide (optional; keep empty if you want)
      return out;
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

      const slide: Slide = {
        id: this.uid(),
        title: "",
        subtitle: "",
        tip: "",
        layout: "split",
        image: null,
        field: {
          type: "text",
          name: "",
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

      const copy = this.clone(next[i]);
      copy.id = this.uid();

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

    moveSlide(payload: { id: string; dir: "up" | "down" }) {
      const id = payload?.id;
      const dir = payload?.dir;
      if (!id || (dir !== "up" && dir !== "down")) return;

      const next = this.clone(this.slidesLocal || []);
      const i = next.findIndex((s) => String(s.id) === String(id));
      if (i < 0) return;

      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= next.length) return;

      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;

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