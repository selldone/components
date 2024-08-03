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
  <div
    v-if="autoFixedPosition"
    v-intersect="
      (isIntersecting, entries) => onIntersect(isIntersecting, entries)
    "
    class="flex-grow-1"
  >
    <div
      :class="{ '-fixed-bottom': !intersected && !scrollUnder }"
      class="widget-buttons"
    >
      <slot></slot>
    </div>
  </div>
  <div v-else class="widget-buttons">
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SWidgetButtons",
  props: {
    autoFixedPosition: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    intersected: false,
    scrollUnder: false,
  }),
  methods: {
    onIntersect(isIntersecting, entries) {
      this.intersected = isIntersecting;

      // Ensure entries is not undefined and has elements
      if (entries && entries.length > 0) {
        const entry = entries[0];

        // console.log(isIntersecting, "top", entry.boundingClientRect.top);

        // Determine if the user has scrolled past the element
        this.scrollUnder = entry.boundingClientRect.top < 0;
      } else {
        this.scrollUnder = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
