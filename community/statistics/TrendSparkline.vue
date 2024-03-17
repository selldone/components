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
  <u-sparkline
    v-if="value && value.length"
    :auto-draw="autoDraw"
    :fill="fill"
    :gradient="
      (value[value.length - 1] >= value[0]) ^ reverse
        ? ['#2f976e', '#1ca2d7']
        : ['#847', '#F48']
    "
    :height="height"
    :line-width="2"
    :smooth="smooth"
    :value="value"
    padding="3"
    stroke-linecap="round"
  >
  </u-sparkline>
</template>

<script>
import USparkline from "@components/ui/chart/sparkline/USparkline.vue";

export default {
  name: "TrendSparkline",
  components: { USparkline },
  props: {
    value: {
      type: Array,
    },
    height: {
      default: 22,
    },
    fill: {
      default: false,
      type: Boolean,
    },
    autoDraw: {
      default: true,
      type: Boolean,
    },
    smooth: {
      default: 3,
    },
    reverse: {
      // Reverse color
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style scoped></style>
