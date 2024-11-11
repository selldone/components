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
  <v-img
    :aspect-ratio="aspectRatio"
    :class="{
      'fullscreen-able-icon': fullscreen && success,
      'circular-ribbons': !success && !error,
      'error-load-image': error,
    }"
    :height="height"
    :max-height="maxHeight"
    :min-height="minHeight"
    :src="src"
    :width="width"
    class="flex-grow-0"
    @click="
      (e) => {
        fullscreen && success ? showFullscreen(e) : undefined;
      }
    "
    @error="error = true"
    @load="success = true"
    cover
  >
    <div class="loader"></div>
    <slot v-if="success || error || !src"></slot>
  </v-img>
</template>

<script lang="ts">
export default {
  name: "CImageView",
  components: {},
  props: {
    fullscreen: {
      type: Boolean,
      default: false,
    },
    src: {},
    aspectRatio: {},
    width: {},
    height: {},
    maxHeight: {},
    minHeight: {},
  },

  data() {
    return {
      success: false, // success image load!
      error: false, // Error in load image!
    };
  },

  mounted() {},

  methods: {},
};
</script>

<style lang="scss"></style>
