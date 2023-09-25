<template>
  <span
    class="s--color-circle no-inv"
    :style="{ '--size': size + 'px' }"
    :title="GetNameOfColor(color)"
    :class="{ '-border': !borderLess }"
  >
    <span class="-color" :style="{ backgroundImage: gradient }"></span>
  </span>
</template>

<script>
import { ColorHelper } from "../../../../core/helper/color/ColorHelper";

export default {
  name: "ColorCircle",
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
