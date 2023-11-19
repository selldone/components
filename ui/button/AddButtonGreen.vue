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
  <div
    class="add-new-btn-widget position-relative "
    :class="{ 'no-fade': !src, 'widget-hover': !small, disabled: loading ,'h-100':fillHeight}"
    @click.stop="$emit('click')"
    :style="{ 'border-radius': radius, minHeight: minHeight, height: height }"
  >
    <v-img :src="src" contain class="sprite flip-image-rtl"> </v-img>
    <div class="center-content px-2">
      <v-icon
        dark
        :class="{ 'mb-3': !small }"
        :size="small ? 24 : 36"
        v-text="icon"
      >
      </v-icon>
      <div class="-title" :class="{ small: small, 'inline-block': horizontal }">
        {{ caption }}
      </div>
      <p class="-message" v-if="message" :class="`${space ? 'mt-5' : ''} ${classMessage}`">
        {{ message }}
      </p>
      <slot></slot>
    </div>
    <v-progress-circular
      v-if="loading"
      class="center-absolute"
    ></v-progress-circular>
  </div>
</template>

<script>
export default {
  name: "AddButtonGreen",

  props: {
    icon: {},
    src: {},
    caption: {},
    message: {},
    radius: {
      default: "8px",
    },
    minHeight: {
      default: "200px",
    },
    height: {
      default: "max-content",
    },
    small: {
      type: Boolean,
      default: false,
    },
    fillHeight: {
      type: Boolean,
      default: true,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
    space: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    classMessage: {},
  },
};
</script>

<style scoped></style>
