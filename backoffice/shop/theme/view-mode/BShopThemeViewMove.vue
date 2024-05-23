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
  <v-btn-toggle
    :class="{ '-dark': dark }"
    :model-value="modelValue"
    class="widget-toggle force-horizontal"
    rounded
    selected-class="blue-flat"
    @update:model-value="(v) => $emit('update:modelValue', v)"
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

<script>
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
  },
  data: () => ({
    tab: "colors",

    ModeView: ModeView,
  }),
  methods: {},
});
</script>

<style lang="scss" scoped></style>
