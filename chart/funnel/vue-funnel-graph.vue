<template>
  <div
    class="funnel svg-funnel-js"
    :class="{ 'svg-funnel-js--vertical': direction === 'vertical' }"
  >
    <div class="svg-funnel-js__container">
      <svg :width="width" :height="height">
        <defs>
          <linearGradient
            v-for="(colors, index) in gradientSet"
            :key="index"
            :id="colors.grad_id"
            :gradientTransform="gradientAngle"
          >
            <stop
              :stop-color="color"
              :offset="offsetColor(index, colors.values.length)"
              v-for="(color, index) in colors.values"
              :key="index"
            ></stop>
          </linearGradient>
        </defs>
        <path
          v-for="(path, index) in paths"
          :key="index"
          :fill="colorSet[index].fill"
          :stroke="colorSet[index].fill"
          :d="path"
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
        class="svg-funnel-js__label"
        :class="`label-${index + 1}`"
        v-for="(value, index) in valuesFormatted"
        :key="labels[index].toLowerCase().split(' ').join('-')"
      >
        <div class="label__value">{{ value }}</div>
        <div class="label__title" v-if="labels">{{ labels[index] }}</div>
        <div
          class="label__percentage"
          v-if="displayPercentage && percentages()[index] !== 100"
        >
          {{ percentages()[index] }}%
        </div>
        <div class="label__segment-percentages" v-if="is2d()">
          <ul class="segment-percentage__list">
            <li v-for="(subLabel, j) in subLabels" :key="j">
              <img
                v-if="subLabelImages && subLabelImages.length > j"
                width="16"
                height="16"
                :src="subLabelImages[j]"
                class="d-block mx-auto"
              />
              <currency-icon
                v-else-if="isCurrency"
                :currency="GetCurrency(subLabel)"
                small
              ></currency-icon>
              <span v-else>{{ subLabel }}:</span>
              <span
                class="percentage__list-label"
                v-if="subLabelValue === 'percent'"
                >{{ twoDimPercentages()[index][j] }}%</span
              >
              <span v-else-if="actualValue"
                >{{ actualValue(index, j, values[index][j]) | format }}
              </span>
              <span class="percentage__list-label" v-else>{{
                values[index][j] | format
              }}</span>
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
      <div class="svg-funnel-js__subLabels" v-if="is2d()">
        <div
          :class="`svg-funnel-js__subLabel svg-funnel-js__subLabel-${
            index + 1
          }`"
          v-for="(subLabel, index) in subLabels"
          :key="index"
        >
          <div
            class="svg-funnel-js__subLabel--color"
            :style="subLabelBackgrounds(index)"
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
import FunnelGraph from "funnel-graph-js";
import { formatNumber } from "funnel-graph-js/src/js/number";
import {
  getDefaultColors,
  generateLegendBackground,
} from "funnel-graph-js/src/js/graph";
import "funnel-graph-js/src/scss/main.scss";
import "funnel-graph-js/src/scss/theme.scss";
import CurrencyIcon from "@/Components/ui/currency/CurrencyIcon.vue";

export default {
  name: "VueFunnelGraph",
  components: { CurrencyIcon },
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
    actualValue: {
      // function return action value to show (not normalized value) in currency mode : function(row,col,value)
    },
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
    valuesFormatted() {
      if (this.graph.is2d()) {
        return this.graph.getValues2d().map((value) => formatNumber(value));
      }
      return this.values.map((value) => formatNumber(value));
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
            this.paths.length - this.colors.length
          )
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
        this.gradientDirection
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
            this.$set(this.paths, index, interpolators[index](position.value));
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
  filters: {
    format: function (value) {
      return formatNumber(value);
    },
  },
};
</script>

<style scoped lang="scss">
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
