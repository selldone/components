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
    class="pod"
    style="aspect-ratio: 1"
    :style="{
      '--pod-color': color,
      '--pod-dot-color': dotColor,
      '--pod-badge-text-color': badgeTextColor,
    }"
    :class="{
      'rounded-circle': circlePod,
      '-dashed': dashed,
      'hover-scale-small force-top': hover,
      '-large':large
    }"
  >
    <img
      v-if="isSelldoneIcon || image"
      class="mb-1 pod-img"
      width="var(--pod-icon-size)"
      height="var(--pod-icon-size)"
      :class="{ 'rounded-xl': rounded, rounded: !rounded }"
      :src="
        isSelldoneIcon ? require('@components/assets/selldone-logo/selldone.svg') : image
      "
    />

    <v-icon
      v-else-if="icon"
      size="var(--pod-icon-size)"
      :color="iconColor"
      class="mb-1 pod-icon"
      >{{ icon }}</v-icon
    >
    <slot></slot>

    <small class="d-block" :title="title">
      <v-icon v-if="titleIcon" size="x-small" :color="titleIconColor">{{
        titleIcon
      }}</v-icon>
      {{ title }}</small
    >
  </div>
</template>

<script>
export default {
  name: "Pod",
  props: {
    icon: {},
    image: {},
    title: {},
    rounded: {
      type: Boolean,
      default: false,
    },
    circlePod: {
      type: Boolean,
      default: false,
    },
    /**
     * Small icon before title
     */
    titleIcon: {},
    titleIconColor: {},

    isSelldoneIcon: { type: Boolean, default: false },

    color: {},
    iconColor: { default: "#111" },
    dotColor: {},
    badgeTextColor: {},

    dashed: {
      type: Boolean,
      default: false,
    },

    hover: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped></style>
