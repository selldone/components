<template>
  <v-dialog
    v-model="dialog"
    :fullscreen="$vuetify.breakpoint.mdAndDown"
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
