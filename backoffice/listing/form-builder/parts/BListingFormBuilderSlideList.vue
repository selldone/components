<template>
  <v-card class="sld-bfb-list" rounded="xl" variant="flat">
    <v-card-title class="d-flex align-center">
      <div class="font-weight-black">Steps</div>
      <v-spacer />
      <v-btn size="small" variant="text" @click="$emit('add')">
        <v-icon start>add</v-icon>
        Add
      </v-btn>
    </v-card-title>

    <v-divider />

    <v-card-text class="pa-2">
      <div v-if="localSlides.length" class="sld-bfb-list__items-wrap">
        <draggable
          v-model="localSlides"
          item-key="id"
          class="sld-bfb-list__items"
          handle=".sld-bfb-drag-handle"
          :animation="180"
          :delay="220"
          :delay-on-touch-only="true"
          :touch-start-threshold="3"
          ghost-class="sld-bfb-ghost"
          chosen-class="sld-bfb-chosen"
          drag-class="sld-bfb-dragging"
          @change="onDragChange"
        >
          <template #item="{ element: s, index: i }">
            <b-listing-form-builder-slide-list-item
              :slide="s"
              :index="i"
              :active="String(s?.id) === String(selectedProxy)"
              @select="selectedProxy = s.id"
              @remove="$emit('remove', s.id)"
              @duplicate="$emit('duplicate', s.id)"
              @move-up="$emit('move', { id: s.id, dir: 'up' })"
              @move-down="$emit('move', { id: s.id, dir: 'down' })"
            />
          </template>
        </draggable>
      </div>

      <div v-else class="text-muted pa-3">
        No steps yet. Click <b>Add</b> to create your first step.
      </div>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import draggable from "vuedraggable";
import BListingFormBuilderSlideListItem from "./BListingFormBuilderSlideListItem.vue";

export default {
  name: "BListingFormBuilderSlideList",

  components: { draggable, BListingFormBuilderSlideListItem },

  props: {
    slides: { type: Array, default: () => [] },
    selected: { type: String, default: null },
  },

  // NOTE: keep API compatible with parent (BListingFormBuilder.vue)
  emits: ["update:selected", "add", "remove", "duplicate", "move"],

  data: () => ({
    /**
     * Local list for draggable.
     * We keep slide objects by reference (shallow copy of array),
     * so edits in editor stay reactive.
     */
    localSlides: [] as any[],
  }),

  computed: {
    slidesSafe(): any[] {
      return Array.isArray((this as any).slides) ? (this as any).slides : [];
    },

    /**
     * Only change when order/length changes (not on editing fields),
     * so we avoid unnecessary re-sync loops.
     */
    slidesOrderKey(): string {
      return this.slidesSafe.map((s: any) => String(s?.id ?? "")).join("|");
    },

    selectedProxy: {
      get(): string | null {
        return (this as any).selected || null;
      },
      set(v: string | null) {
        (this as any).$emit("update:selected", v);
      },
    },
  },

  watch: {
    slidesOrderKey: {
      immediate: true,
      handler() {
        // Shallow copy (same slide object refs)
        this.localSlides = this.slidesSafe.slice();
      },
    },
  },

  methods: {
    /**
     * Drag reorder handler:
     * We DO NOT need parent changes.
     * Parent already supports moving one step via `moveSlide({id, dir:'up'|'down'})`,
     * so we emit that multiple times based on index delta.
     */
    onDragChange(evt: any) {
      const moved = evt?.moved;
      if (!moved) return;

      const idRaw = moved?.element?.id;
      const id = idRaw !== undefined && idRaw !== null ? String(idRaw) : "";
      if (!id) return;

      const oldIndex = Number(moved?.oldIndex);
      const newIndex = Number(moved?.newIndex);
      if (!Number.isFinite(oldIndex) || !Number.isFinite(newIndex)) return;

      const delta = newIndex - oldIndex;
      const steps = Math.abs(delta);
      if (!steps) return;

      const dir = delta < 0 ? "up" : "down";

      // Emit N steps to reuse parent's existing move logic.
      for (let i = 0; i < steps; i++) {
        this.$emit("move", { id, dir });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-list {
  background: #fff;
  border: 1px solid rgba(20, 20, 20, 0.08);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
  overflow: visible !important;

  &__items {
    display: grid;
    gap: 10px;
  }
}

/* Draggable states */
.sld-bfb-ghost {
  opacity: 0.45;
}

.sld-bfb-chosen {
  opacity: 0.9;
}

.sld-bfb-dragging {
  opacity: 0.95;
}
</style>