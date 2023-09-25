<template>
  <v-img
    @click="
      (e) => {
        fullscreen && success ? showFullscreen(e) : undefined;
      }
    "
    :src="src"
    :width="width"
    :height="height"
    :aspect-ratio="aspectRatio"
    :max-height="maxHeight"
    :min-height="minHeight"
    :class="{
      'fullscreen-able-icon': fullscreen && success,
      'circular-ribbons': !success && !error,
      'error-load-image': error,
    }"
    @load="success = true"
    @error="error = true"
    class="flex-grow-0"
  >
    <div class="loader"></div>
    <slot v-if="success || error || !src"></slot>
  </v-img>
</template>

<script>
export default {
  name: "CommunityImage",
  components: {},
  props: {
    fullscreen: {
      type: Boolean,
      default: false,
    },
    src: {},
    aspectRatio: {},
    width:{},
    height:{},
    maxHeight:{},
    minHeight:{},
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
