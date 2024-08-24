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
    v-if="pack?.html"
    class="pointer-pointer footer-badge-container"
    v-html="pack.html"
  ></div>
  <div
    v-else-if="pack"
    :class="{ 'pointer-pointer': pack.url }"
    class="footer-badge-container"
    rel="nofollow"
    target="_blank"
    @click="pack.url ? window.open(pack.url) : ''"
  >
    <v-img v-if="pack.image" :src="pack.image" aspect-ratio="1" width="100%" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SFooterSectionBox",
  components: {},
  inject: ["$shop"],
  props: {
    pack: Object,
  },
  data: () => ({
  }),
});
</script>

<style scoped lang="scss">
.footer-badge-container {
  margin: 0 auto;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: min-content;
  min-height: 100%;

  transition: all 0.65s;
  border-radius: 6px;
  padding: 6px;
  //background-color: #f0f0f0;
  max-width: 120px;

  &:hover {
    // box-shadow: 10px 10px 10px 0px rgba(0, 0, 0, 0.3);
    filter: drop-shadow(3px 13px 11px rgba(0, 0, 0, 0.3));
    transition: all 0.5s;
    z-index: 2;
  }
}
</style>
