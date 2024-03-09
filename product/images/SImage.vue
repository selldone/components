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
    v-bind="$attrs"
    :alt="alt"
    :cover="autoCover && white_background != null ? !white_background : cover"
    :src="src"
    :lazy-src="lazySrc"
    :aspect-ratio="aspectRatio"
    :eager="eager"
    :height="height"
    :width="width"
    @load="onImageLoad()"
    @loadstart="loading=true"
    class="position-relative blur-animate"
    :class="{'blurred':loading}"
  >
    <slot></slot>
    <template v-slot:placeholder>
      <v-progress-circular :color="444" class="op-0-5 center-absolute" indeterminate :size="84" :width="4" ></v-progress-circular>
    </template>
  </v-img>
</template>

<script>
export default {
  name: "SImage",
  components: {},
  emits: ["white-background"],
  props: {
    alt: {},
    cover: Boolean,
    src: {},
    lazySrc: {},
    aspectRatio: {},
    eager: Boolean,
    height: {},
    width: {},
    detectWhiteBackground: Boolean,
    autoCover: Boolean,
  },

  data: () => ({
    white_background: null,
    loading:false,

  }),

  computed: {},

  watch: {},
  created() {},

  methods: {
    /**
     * Detect image background is white or not
     */
    onImageLoad() {
      this.loading=false;
      if (!this.detectWhiteBackground) return;

      this.$nextTick(() => {
        try{
          const imgElement = this.$el.querySelector("img");

          // Create a canvas and get the context
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set canvas size to match image
          canvas.width = imgElement.naturalWidth;
          canvas.height = imgElement.naturalHeight;

          // Draw the image onto the canvas
          ctx.drawImage(imgElement, 0, 0);

          // Get the first row of pixels
          const firstRowPixels = ctx.getImageData(0, 0, canvas.width, 1).data;

          // Check if the first row is white
          let isWhiteBackground = true;
          for (let i = 0; i < firstRowPixels.length; i += 4) {
            const r = firstRowPixels[i];
            const g = firstRowPixels[i + 1];
            const b = firstRowPixels[i + 2];
            const a = firstRowPixels[i + 3];
            // Check if the pixel is not white (255, 255, 255) and not fully transparent (a = 0)
            // You may need to adjust the tolerance for white as necessary
            if ((r < 255 || g < 255 || b < 255) && a !== 0) {
              isWhiteBackground = false;
              break;
            }
          }
          this.white_background = isWhiteBackground;
          this.$emit("white-background", isWhiteBackground);

          if (isWhiteBackground) {
            // console.log("The background is white.");
          } else {
            //  console.log("The background is not white.");
          }
        }catch (e) {
         // console.error(e)
        }
      });
    },
  },

  mounted() {},
  beforeUnmount() {},
};
</script>

<style lang="scss" scoped></style>
