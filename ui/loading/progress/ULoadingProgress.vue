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
  <div :class="{ '-relative': relative }" class="loader-to-bar">
    <v-progress-linear
      :color="color"
      :height="height"
      :stream="stream"
      indeterminate
      rounded
      rounded-bar
    ></v-progress-linear>
  </div>
</template>

<script>
export default {
  name: "ULoadingProgress",
  props: {
    color: {
      default: "success",
    },
    relative: { type: Boolean },
    height: {},
    stream: Boolean,
  },
  computed: {},
};
</script>

<style scoped></style>
