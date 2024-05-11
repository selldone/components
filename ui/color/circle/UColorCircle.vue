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
  <span
    :class="{ '-border': !borderLess }"
    :style="{ '--size': size + 'px' }"
    :title="GetNameOfColor(color)"
    class="s--color-circle no-inv"
  >
    <span :style="{ backgroundImage: gradient }" class="-color"></span>
  </span>
</template>

<script>
import { ColorHelper } from "@selldone/core-js/helper/color/ColorHelper";

export default {
  name: "UColorCircle",
  props: {
    color: {},
    size: { default: 24, type: Number },
    borderLess: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    colors() {
      return ColorHelper.ExtractColors(this.color);
    },
    gradient() {
      return this.createLinearGradient(this.colors);
    },
  },
  methods: {
    createLinearGradient(colors) {
      if (!colors) return null;
      const numColors = colors.length;
      const percentage = 100 / numColors;
      let gradient = "linear-gradient(145deg,";

      for (let i = 0; i < numColors; i++) {
        const startPos = i * percentage;
        const endPos = (i + 1) * percentage;

        gradient += `${colors[i]} ${startPos}%, ${colors[i]} ${endPos}%`;

        if (i < numColors - 1) {
          gradient += ", ";
        }
      }

      gradient += ")";

      return gradient;
    },
  },
};
</script>

<style lang="scss">
.s--color-circle {
  border-radius: 50%;
  display: inline-flex;

  line-height: 0;
  padding: calc(var(--size) / 12);

  &.-border {
    background: #fff;

    border: 1px solid #dee2e6;
  }

  .-color {
    display: inline-block;
    border-radius: 50%;
    width: var(--size);
    height: var(--size);
    pointer-events: none;
    user-select: none;
    vertical-align: middle;
  }
}
</style>
