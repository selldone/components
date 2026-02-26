<template>
  <div class="sld-bfb-step" :class="{ '-active': active }" @click="$emit('select')">
    <!-- ✅ Drag handle (long drag / desktop drag) -->
    <div
      class="sld-bfb-step__drag sld-bfb-drag-handle"
      title="Drag to reorder"
      @mousedown.stop
      @click.stop
    >
      <v-icon size="18">drag_indicator</v-icon>
    </div>

    <div class="sld-bfb-step__num">{{ index + 1 }}</div>

    <div class="sld-bfb-step__meta">
      <div class="sld-bfb-step__title">
        {{ titleSafe }}
      </div>
      <div class="sld-bfb-step__sub">
        {{ layoutLabel }}
      </div>
    </div>

    <div class="sld-bfb-step__actions" @click.stop>
      <v-btn icon size="x-small" variant="text" :disabled="index === 0" @click="$emit('move-up')">
        <v-icon size="18">keyboard_arrow_up</v-icon>
      </v-btn>

      <v-btn icon size="x-small" variant="text" @click="$emit('move-down')">
        <v-icon size="18">keyboard_arrow_down</v-icon>
      </v-btn>

      <v-menu location="bottom" offset="10">
        <template #activator="{ props }">
          <v-btn icon size="x-small" variant="text" v-bind="props">
            <v-icon size="18">more_horiz</v-icon>
          </v-btn>
        </template>

        <v-list density="compact" class="text-start" lines="one">
          <v-list-item @click="$emit('duplicate')">
            <template #prepend><v-icon size="18">content_copy</v-icon></template>
            <v-list-item-title>Duplicate</v-list-item-title>
          </v-list-item>

          <v-list-item @click="$emit('remove')">
            <template #prepend><v-icon size="18">delete</v-icon></template>
            <v-list-item-title>Remove</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BListingFormBuilderSlideListItem",

  props: {
    slide: { type: Object, required: true },
    index: { type: Number, required: true },
    active: { type: Boolean, default: false },
  },

  emits: ["select", "remove", "duplicate", "move-up", "move-down"],

  computed: {
    titleSafe(): string {
      const t = String((this as any).slide?.title || "").trim();
      return t || "Untitled step";
    },

    layoutLabel(): string {
      const l = String((this as any).slide?.layout || "split_right");
      const map: Record<string, string> = {
        split_right: "Split (image right)",
        split_left: "Split (image left)",
        stacked: "Stacked",
        centered: "Centered",
      };
      return map[l] || l;
    },
  },
};
</script>

<style lang="scss" scoped>
.sld-bfb-step {
  border: 1px solid rgba(20, 20, 20, 0.10);
  border-radius: 16px;
  padding: 10px 10px;

  display: grid;
  grid-template-columns: 26px 34px 1fr auto;
  gap: 10px;
  align-items: center;

  cursor: pointer;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);

  transition: border-color 0.12s ease, background 0.12s ease;

  &:hover {
    border-color: rgba(20, 20, 20, 0.18);
    background: rgba(255, 255, 255, 0.98);
  }

  &.-active {
    border: 3px solid rgba(0, 0, 0, 0.70);
    background: rgba(0, 0, 0, 0.03);
  }

  &__drag {
    width: 26px;
    height: 26px;
    border-radius: 10px;

    display: grid;
    place-items: center;

    color: rgba(0, 0, 0, 0.55);
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(20, 20, 20, 0.08);

    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  &__num {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.05);
    display: grid;
    place-items: center;
    font-weight: 900;
  }

  &__meta {
    min-width: 0;
  }

  &__title {
    font-weight: 900;
    font-size: 13px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__sub {
    margin-top: 2px;
    font-size: 11px;
    color: rgba(0, 0, 0, 0.55);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }
}
</style>