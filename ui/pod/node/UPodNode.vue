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
    :class="{
      'rounded-circle': circlePod,
      '-dashed': dashed,
      'hover-scale-small force-top': hover,
      '-large': large,
    }"
    :style="{
      '--pod-color': color,
      '--pod-dot-color': dotColor,
      '--pod-badge-text-color': badgeTextColor,
    }"
    class="pod"
    style="aspect-ratio: 1"
  >
    <img
      v-if="isSelldoneIcon || image"
      :class="{ 'rounded-xl': rounded, rounded: !rounded }"
      :src="
        isSelldoneIcon
          ? require('../../../assets/selldone-logo/selldone.svg')
          : image
      "
      class="mb-1 pod-img"
      height="var(--pod-icon-size)"
      width="var(--pod-icon-size)"
    />

    <v-icon
      v-else-if="icon"
      :color="iconColor"
      class="mb-1 pod-icon"
      size="var(--pod-icon-size)"
      >{{ icon }}
    </v-icon>

    <slot></slot>

    <small :title="title" class="d-block">
      <v-icon v-if="titleIcon" :color="titleIconColor" size="x-small"
        >{{ titleIcon }}
      </v-icon>
      {{ title }}</small
    >
  </div>
</template>

<script>
export default {
  name: "UPodNode",
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
