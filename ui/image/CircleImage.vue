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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-avatar
    :class="{ 'hover-scale': scaleOnHover }"
    :color="transparent ? 'transparent' : dark ? SaminColorDarkDeep : '#fafafa'"
    :size="size"
    @error="loading = false"
    @load="loading = false"
  >
    <v-img v-if="src" :src="src" aspect-ratio="1" cover>
      <template v-slot:placeholder>
        <v-progress-circular
          v-if="loading"
          :size="size > 32 ? 24 : size * 0.7"
          class="center-absolute"
          color="#eee"
          indeterminate
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

<style lang="scss" scoped></style>
