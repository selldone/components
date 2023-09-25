<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-avatar
    :size="size"
    :color="transparent ? 'transparent' : dark ? SaminColorDarkDeep : '#fafafa'"
    :class="{ 'hover-scale': scaleOnHover }"
    @error="loading = false"
    @load="loading = false"
  >
    <v-img v-if="src" :src="src" aspect-ratio="1">
      <template v-slot:placeholder>
        <v-progress-circular
          v-if="loading"
          :size="size > 32 ? 24 : size * 0.7"
          indeterminate
          color="#eee"
          class="center-absolute"
        />
      </template>
    </v-img>

    <v-icon v-else-if="icon">
      {{ icon }}
    </v-icon>
  </v-avatar>
</template>

<script>
export default {
  name: "CircleImage",

  data: () => ({
    loading: true,
  }),

  props: {
    src: {
      required: false,
      type: String,
    },

    size: {
      required: false,
      default: 24,
    },

    scaleOnHover: {
      required: false,
      type: Boolean,
      default: false,
    },

    icon: {
      required: false,
      type: String,
    },

    dark: {
      default: false,
      type: Boolean,
    },
    transparent: {
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style scoped lang="scss"></style>
