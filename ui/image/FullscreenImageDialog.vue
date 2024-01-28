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
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.display.mdAndDown"
    max-width="1200"
    content-class="thin-scroll"
  >
    <v-card
      class="pointer-zoom-out position-relative d-flex align-items-center"
      @click="dialog = false"
      style="z-index: 999999"
      color="#000000e3"
      tile
    >
      <v-img :src="image" width="100%" height="100%"> </v-img>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "FullscreenImageDialog",
  components: {},
  props: {},
  data: () => ({
    dialog: false,
    image: null,
  }),
  mounted() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Listen for show loading data from server
    this.EventBus.$on("fullscreen-image", (image) => {
      this.image = image;
      this.dialog = true;
    });
  },
  beforeDestroy() {
    this.EventBus.$off("fullscreen-image");
  },
};
</script>

<style scoped lang="scss"></style>
