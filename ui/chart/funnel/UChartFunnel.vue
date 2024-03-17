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
  <div
    :class="{ 'svg-funnel-js--vertical': direction === 'vertical' }"
    class="funnel svg-funnel-js"
  >
    <div class="svg-funnel-js__container">
      <svg :height="height" :width="width">
        <defs>
          <linearGradient
            v-for="(colors, index) in gradientSet"
            :id="colors.grad_id"
            :key="index"
            :gradientTransform="gradientAngle"
          >
            <stop
              v-for="(color, index) in colors.values"
              :key="index"
              :offset="offsetColor(index, colors.values.length)"
              :stop-color="color"
            ></stop>
          </linearGradient>
        </defs>
        <path
          v-for="(path, index) in paths"
          :key="index"
          :d="path"
          :fill="colorSet[index].fill"
          :stroke="colorSet[index].fill"
        ></path>
      </svg>
    </div>

    <transition-group
      class="svg-funnel-js__labels"
      name="appear"
      tag="div"
      v-on:enter="enterTransition"
      v-on:leave="leaveTransition"
    >
      <div
        v-for="(value, index) in valuesFormatted"
        :key="labels[index].toLowerCase().split(' ').join('-')"
        :class="`label-${index + 1}`"
        class="svg-funnel-js__label"
      >
        <div v-if="labelValueCurrency" class="label__value">
          <u-price
            :amount="value"
            :currency="labelValueCurrency"
          ></u-price>
        </div>
        <div v-else class="label__value">{{ value }}</div>

        <div v-if="labels" class="label__title">{{ labels[index] }}</div>
        <div
          v-if="displayPercentage && percentages()[index] !== 100"
          class="label__percentage"
        >
          {{ percentages()[index] }}%
        </div>
        <div
          v-if="
            is2d() && (!filterZeros || values[index].some((x) => x > 0.0001))
          "
          class="label__segment-percentages"
          style="min-width: max-content"
        >
          <ul class="segment-percentage__list">
            <li v-for="(subLabel, j) in subLabels" :key="j">
              <template v-if="!filterZeros || values[index][j] > 0.0001">
                <img
                  v-if="subLabelImages && subLabelImages.length > j"
                  :src="subLabelImages[j]"
                  class="d-block mx-auto"
                  height="16"
                  width="16"
                />

                <div v-if="isCurrency" class="d-flex flex-column py-1">
                  <u-currency-icon
                    :currency="GetCurrency(subLabel)"
                    class="mb-1"
                    flag
                    small
                  ></u-currency-icon>

                  <u-price
                    :amount="values[index][j]"
                    :currency="subLabel"
                    class="body-title"
                  ></u-price>
                </div>

                <template v-else>
                  {{ subLabel }}:

                  <span
                    v-if="subLabelValue === 'percent'"
                    class="percentage__list-label"
                    >{{ twoDimPercentages()[index][j] }}%</span
                  >
                  <span v-else-if="actualValue"
                    >{{
                      numeralFormat(
                        actualValue(index, j, values[index][j]),
                        "0.[0]a",
                      )
                    }}
                  </span>
                  <span v-else class="percentage__list-label">{{
                    numeralFormat(values[index][j], "0.[0]a")
                  }}</span>
                </template>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </transition-group>
    <transition
      name="fade"
      v-on:enter="enterTransition"
      v-on:leave="leaveTransition"
    >
      <div v-if="is2d()" class="svg-funnel-js__subLabels">
        <div
          v-for="(subLabel, index) in subLabels"
          :key="index"
          :class="`svg-funnel-js__subLabel svg-funnel-js__subLabel-${
            index + 1
          }`"
        >
          <div
            :style="subLabelBackgrounds(index)"
            class="svg-funnel-js__subLabel--color"
          ></div>
          <div class="svg-funnel-js__subLabel--title">{{ subLabel }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { interpolate } from "polymorph-js";
import TWEEN from "@tweenjs/tween.js";

import UCurrencyIcon from "@components/ui/currency/icon/UCurrencyIcon.vue";
import numeral from "numeral";
import FunnelGraph from "@components/ui/chart/funnel/core/js/main";
import {
  generateLegendBackground,
  getDefaultColors,
} from "@components/ui/chart/funnel/core/js/graph";
import "@components/ui/chart/funnel/core/scss/main.scss";
import "@components/ui/chart/funnel/core/scss/theme.scss";

export default {
  name: "UChartFunnel",
  components: { UCurrencyIcon },
  props: {
    animated: {
      type: Boolean,
      default: false,
    },
    width: [String, Number],
    height: [String, Number],
    values: Array,
    labels: Array,
    colors: {
      type: Array,
      default() {
        return [];
      },
    },
    subLabels: Array,
    subLabelImages: Array,

    subLabelValue: {
      type: String,
      default: "percent",
    },
    direction: {
      type: String,
      default: "horizontal",
    },
    gradientDirection: {
      type: String,
      default: "horizontal",
    },
    displayPercentage: {
      type: Boolean,
      default: true,
    },

    isCurrency: {
      // Load currency symbols!
      type: Boolean,
      default: false,
    },
    filterZeros: {
      // Do not show zero values on hover
      type: Boolean,
      default: false,
    },
    actualValue: {
      // function return action value to show (not normalized value) in currency mode : function(row,col,value)
    },

    labelValueCurrency: {},
  },
  data() {
    return {
      paths: [],
      prevPaths: [], // paths before update, used for animations
      graph: null,
      tween: null,
      defaultColors: getDefaultColors(10),
    };
  },
  computed: {
    is_vertical() {
      return this.direction === "vertical";
    },
    is_horizontal() {
      return this.direction === "horizontal";
    },

    valuesFormatted() {
      if (this.graph.is2d()) {
        return this.graph
          .getValues2d()
          .map((value) => numeral(value).format("0.[0]a"));
      }
      return this.values.map((value) => numeral(value).format("0.[0]a"));
    },

    colorSet() {
      const colorSet = [];
      let gradientCount = 0;

      for (let i = 0; i < this.paths.length; i++) {
        const values = this.graph.is2d() ? this.getColors[i] : this.getColors;
        const fillMode =
          typeof values === "string" || values.length === 1
            ? "solid"
            : "gradient";
        if (fillMode === "gradient") gradientCount += 1;

        let grad_id = "funnel-gr-" + this.gradientDirection;
        if (Array.isArray(values))
          values.forEach((col) => {
            // console.log('col',col)
            if (Array.isArray(col) && col.length) col = col[0]; // Empty data error bug fix!
            grad_id += col.replace("#", "-");
          });

        colorSet.push({
          values,
          fillMode,
          fill: fillMode === "solid" ? values : `url('#${grad_id}')`,
          grad_id: grad_id,
        });
      }
      return colorSet;
    },
    gradientSet() {
      const gradientSet = [];
      this.colorSet.forEach((colors) => {
        if (colors.fillMode === "gradient") {
          gradientSet.push(colors);
        }
      });
      return gradientSet;
    },
    getColors() {
      if (this.colors instanceof Array && this.colors.length === 0) {
        return getDefaultColors(this.is2d() ? this.values[0].length : 2);
      }
      if (this.colors.length < this.paths.length) {
        return [...this.colors].concat(
          [...this.defaultColors].splice(
            this.paths.length,
            this.paths.length - this.colors.length,
          ),
        );
      }
      return this.colors;
    },
    gradientAngle() {
      return `rotate(${this.gradientDirection === "vertical" ? 90 : 0})`;
    },
  },
  methods: {
    enterTransition(el, done) {
      if (!this.animated) done();
      setTimeout(() => done(), 700);
    },
    leaveTransition(el, done) {
      if (!this.animated) done();
      setTimeout(() => done(), 700);
    },
    is2d() {
      return this.graph.is2d();
    },
    percentages() {
      return this.graph.createPercentages();
    },
    twoDimPercentages() {
      if (!this.is2d()) {
        return [];
      }
      return this.graph.getPercentages2d();
    },
    subLabelBackgrounds(index) {
      if (!this.is2d()) {
        return [];
      }
      return generateLegendBackground(
        this.getColors[index],
        this.gradientDirection,
      );
    },
    offsetColor(index, length) {
      return `${Math.round((100 * index) / (length - 1))}%`;
    },
    makeAnimations() {
      if (this.tween !== null) {
        this.tween.stop();
      }
      const interpolators = [];
      const dimensionChanged = this.prevPaths.length !== this.paths.length;

      let origin = { x: 0.5, y: 0.5 };
      if (dimensionChanged) {
        origin = { x: 0, y: 0.5 };
        if (this.graph.isVertical()) {
          origin = { x: 1, y: 1 };
        }
        if (!this.graph.is2d()) {
          origin = { x: 0, y: 1 };
        }
      }

      this.paths.forEach((path, index) => {
        let oldPath = this.prevPaths[index] || this.graph.getPathMedian(index);
        if (dimensionChanged) oldPath = this.graph.getPathMedian(index);
        const interpolator = interpolate([oldPath, path], {
          addPoints: 1,
          origin,
          optimize: "fill",
          precision: 1,
        });

        interpolators.push(interpolator);
      });

      function animate() {
        if (TWEEN.update()) {
          requestAnimationFrame(animate);
        }
      }

      const position = { value: 0 };
      this.tween = new TWEEN.Tween(position)
        .to({ value: 1 }, 700)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
          for (let index = 0; index < this.paths.length; index++) {
            // this.$set(this.paths, index, interpolators[index](position.value));
            this.paths[index] = interpolators[index](position.value);
          }
        });

      this.tween.start();
      animate();
    },
    drawPaths() {
      this.prevPaths = this.paths;
      this.paths = [];
      const definitions = this.graph.getPathDefinitions();

      definitions.forEach((d) => {
        this.paths.push(d);
      });
    },
  },
  created() {
    this.graph = new FunnelGraph({
      height: this.height,
      width: this.width,
      direction: this.direction,
      data: {
        labels: this.labels,
        values: this.values,
      },
    });
    this.drawPaths();
    try {
      if (this.animated) this.makeAnimations();
    } catch (e) {}
  },
  watch: {
    values() {
      this.graph.setValues(this.values);
      this.drawPaths();
      try {
        if (this.animated) this.makeAnimations();
      } catch (e) {}
    },
    direction() {
      this.graph
        .setDirection(this.direction)
        .setWidth(this.width)
        .setHeight(this.height);
      this.drawPaths();
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.appear-enter-active,
.appear-leave-active {
  transition: all 0.7s ease-in-out;
}

.appear-enter-to,
.appear-leave {
  max-width: 100%;
  max-height: 100%;
  opacity: 1;
}

.appear-enter,
.appear-leave-to {
  max-width: 0;
  max-height: 0;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-to,
.fade-leave {
  opacity: 1;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
