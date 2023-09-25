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
    }"
  >
    <img
      v-if="isSelldoneIcon || image"
      class="mb-1 pod-img"
      width="var(--pod-icon-size)"
      height="var(--pod-icon-size)"
      :class="{ 'rounded-xl': rounded, rounded: !rounded }"
      :src="
        isSelldoneIcon ? require('@/Components/assets/selldone-logo/selldone.svg') : image
      "
    />

    <v-icon
      v-else-if="icon"
      size="var(--pod-icon-size)"
      :color="iconColor"
      class="mb-1 pod-icon"
      >{{ icon }}</v-icon
    >

    <small class="d-block" :title="title">
      <v-icon v-if="titleIcon" x-small :color="titleIconColor">{{
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
  },
};
</script>

<style scoped></style>
