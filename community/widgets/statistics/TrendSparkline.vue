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
  <s-sparkline
    v-if="value && value.length"
    :smooth="smooth"
    :gradient="
      (value[value.length - 1] >= value[0]) ^ reverse
        ? ['#2f976e', '#1ca2d7']
        : ['#847', '#F48']
    "
    :line-width="2"
    :value="value"
    :auto-draw="autoDraw"
    :height="height"
    padding="3"
    stroke-linecap="round"
    :fill="fill"
  >
  </s-sparkline>
</template>

<script>
import SSparkline from "@components/chart/sparkline/SSparkline.vue";

export default {
  name: "TrendSparkline",
  components: {SSparkline},
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
