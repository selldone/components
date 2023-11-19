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
  <div
    class="text-start px-lg-4 px-3 mt-4 mt-md-2"
    :class="{ dark: dark }"
  >
    <b v-if="!!this.$slots.title">
      <slot name="title"></slot>
    </b>
    <p v-if="!!this.$slots['sub-title']" class="small text-muted">
      <slot name="sub-title"></slot>
    </p>
    <p v-if="!!this.$slots.info">
      <i class="fas fa-dot-circle text-success "></i>
      <slot name="info"></slot>
    </p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "SimpleInnerTitle",
  props: {
    dark: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped lang="scss">
.dark {
  color: white;

  .small {
    &.text-muted {
      color: rgba(255, 255, 255, 0.87);
    }
  }
}
</style>
