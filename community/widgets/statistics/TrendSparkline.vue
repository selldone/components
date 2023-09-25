<template>
  <v-sparkline
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
  </v-sparkline>
</template>

<script>
export default {
  name: "TrendSparkline",
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
