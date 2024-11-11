<!--
  - Copyright (c) 2023. Selldone® Business OS™
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
  <u-fade-scroll class="sx-menu" :class="{'-rtl':$vuetify.locale.isRtl}">
    <v-tabs
      :direction="$vuetify.display.mdAndUp ? 'vertical' : 'horizontal'"
      :model-value="modelValue"
      :style="{
        'min-width': $vuetify.display.mdAndUp ? undefined : 'max-content',
      }"
      slider-size="7"
      @update:model-value="(val) => $emit('update:modelValue', val)"
    >
      <v-tab
        v-for="(item, i) in items"
        :key="i"
        :value="i"
        class="sx-item"
        stacked
      >
        <div class="single-line align-self-start align-center d-flex">
          <v-icon start>
            {{ item.icon }}
          </v-icon>
          {{ item.title }}
          <v-icon v-if="item.warning" class="mx-1" color="orange" size="small"
            >warning
          </v-icon>
        </div>
        <slot name="item" :item="item"></slot>
      </v-tab>
    </v-tabs>
  </u-fade-scroll>
</template>

<script lang="ts">
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";

export default {
  name: "UTabsFloating",
  components: { UFadeScroll },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    items: { required: true, type: Array },
  },
};
</script>

<style lang="scss" scoped>
.sx-menu {
  position: relative;
  text-align: start;
  margin-bottom: 16px;

  .sx-item {
    text-align: start;
    font-weight: 500;
    align-items: flex-start !important;
  }

  @media only screen and (min-width: 1100px) {
    position: absolute;
    left: 8px;
    top: 86px;
    width: 240px;
    z-index: 1;
  }

  &.-rtl{
    left: 0;
    right: 8px;
    ::v-deep(.v-tab__slider) {
      right: 0;
      left: unset;
    }

  }
}
</style>
