<!--
  - Copyright (c) 2024. Selldone® Business OS™
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

<template>
  <div v-if="modern" class="b-theme-view-mode text-start">
    <div class="b-theme-view-mode__heading">
      <span class="b-theme-view-mode__label">
        <v-icon v-if="icon" :icon="icon" size="14" aria-hidden="true" />
        {{ label }}
      </span>
      <span class="b-theme-view-mode__current">{{ selectedMode }}</span>
    </div>
    <v-btn-toggle
      :model-value="modelValue"
      :aria-label="label"
      role="group"
      :disabled="readOnly"
      class="b-theme-view-mode__choices"
      selected-class="b-theme-view-mode__choice--selected"
      mandatory
      @update:model-value="updateMode"
    >
      <v-btn v-for="item in viewModes" :key="item.code" :value="item.code"
             class="b-theme-view-mode__choice" variant="text" rounded="lg"
             :aria-label="item.title" :aria-pressed="modelValue === item.code">
        <v-icon :icon="item.icon" size="19" aria-hidden="true" />
        <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start"
                   open-on-focus>
          <span class="font-weight-medium">{{ item.title }}</span><br />
          {{ $t('shop_theme.studio.view_modes.' + item.code) }}
        </v-tooltip>
      </v-btn>
    </v-btn-toggle>
  </div>
  <v-btn-toggle
    v-else
    :class="{ '-dark': dark,pen:readOnly }"
    :model-value="modelValue"
    :disabled="readOnly"
    class="widget-toggle force-horizontal"
    rounded
    selected-class="blue-flat"
    @update:model-value="updateMode"

  >
    <div v-if="icon || label" class="widget-toggle-label border-end">
      <v-icon>{{ icon }}</v-icon>
      <span class="x-small">{{ label }}</span>
    </div>
    <v-btn
      v-for="item in ModeView"
      :key="item.code"
      :value="item.code"
      color="#fff"
      min-height="54"
      size="large"
    >
      <div class="d-flex align-center flex-column">
        <v-icon class="mb-1">{{ item.icon }}</v-icon>
        <span class="small">{{ $t(item.title) }}</span>
      </div>
    </v-btn>
  </v-btn-toggle>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ModeView } from "@selldone/core-js/enums/shop/ModeView";

export default defineComponent({
  name: "BShopThemeViewMove",
  components: {},
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    icon: {},
    label: {},
    dark: Boolean,
    readOnly:Boolean,
    modern: Boolean,
  },
  data: () => ({
    ModeView: ModeView,
  }),
  computed: {
    viewModes() {
      return Object.values(ModeView).map((item) => ({
        ...item,
        title: this.$t(item.title),
      }));
    },
    selectedMode() {
      return this.viewModes.find((item) => item.code === this.modelValue)?.title || '';
    },
  },
  methods: {
    updateMode(value) {
      if (!this.readOnly) this.$emit('update:modelValue', value);
    },
  },
});
</script>

<style lang="scss" scoped>
.b-theme-view-mode {
  width: max-content;
  max-width: 100%;
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  & + & { margin-block-start: 22px; }
  &__heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-block-end: 8px; }
  &__label { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 400; line-height: 18px; }
  &__label > .v-icon, &__current { color: var(--sd-modern-muted); }
  &__current { min-width: 0; font-size: 12px; line-height: 18px; overflow-wrap: anywhere; }
  &__choices.v-btn-toggle { display: inline-flex; width: max-content; max-width: 100%; height: auto; gap: 6px; padding: 4px; overflow: visible; border-radius: 12px; background: rgba(var(--v-theme-on-surface), .045); }
  &__choice.v-btn { flex: 0 0 44px; width: 44px; min-width: 44px; height: 44px; min-height: 44px; margin: 0; padding: 0; color: rgb(var(--v-theme-on-surface)); background: transparent; border: 0; box-shadow: none; }
  &__choice--selected.v-btn { background: rgb(var(--v-theme-surface)); box-shadow: var(--sd-modern-selected-shadow); }
  &__choice :deep(.v-btn__overlay) { opacity: 0 !important; }
  &__choice.v-btn:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  @media (hover: hover) and (pointer: fine) { &__choice.v-btn:hover { background: rgb(var(--v-theme-surface)); } }
}
</style>
