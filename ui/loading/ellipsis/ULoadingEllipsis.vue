<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="text-center">
    <u-lottie
      v-if="!cssMode"
      :height="height"
      :options="{ animationData: animation, loop: true }"
      :speed="1"
      width="200px"
    />
    <div v-else :class="{ light: light }" class="lds-ellipsis">
      <div />
      <div />
      <div />
      <div />
    </div>
  </div>
</template>

<script lang="ts">
/**
 * <u-loading-ellipsis>
 */
export default {
  name: "ULoadingEllipsis",
  props: {
    height: {
      default: "84px",
    },
    cssMode: {
      type: Boolean,
      default: false,
    },
    light: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    animation() {
      return require("./loading.json");
    },
  },
};
</script>

<style scoped></style>
