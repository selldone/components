<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <div class="pod-cut">
    <u-pod-node v-bind="$attrs"></u-pod-node>
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
