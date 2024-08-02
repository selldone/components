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
    v-if="!has_valid_data"
    class="d-flex align-center justify-center pa-5 text-h3 font-weight-thin op-0-3 ma-auto"
  >
    No Data!
  </div>

  <div
    v-else
    :class="[
      {
        '-vertical': direction === 'vertical',
        '-horizontal': direction === 'horizontal',
        '-dark': dark,
        '-rtl': $vuetify.locale.isRtl,
        '-dense': dense,
      },
      chartClass,
    ]"
    class="u--chart-funnel"
    :style="{
      '--width': width + 'px',
      '--height': height + 'px',
    }"
  >
    <div class="--container thin-scroll scrollable-element-light">
      <svg
        :height="height"
        :width="width"
        :class="{ 'ms-auto': direction === 'vertical' }"
        class="t-all-400"
      >
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
          class="t-all-400"
        ></path>
      </svg>

      <div
        class="--segment"
        :style="{
          height: height + 'px',
          width: width + 'px',
          maxWidth: width + 'px',
        }"
      >
        <div
          v-for="(value, index) in valuesFormatted"
          :key="labels[index].toLowerCase().split(' ').join('-')"
          class="--segment-container"
          :style="
            is_horizontal
              ? { maxWidth: Math.round(width / valuesFormatted.length) + 'px' }
              : {}
          "
        >
          <div v-if="labelValueCurrency" class="--label-value px-1">
            <u-price
              :amount="value"
              :currency="labelValueCurrency"
              compact
            ></u-price>
          </div>
          <div v-else class="--label-value px-1">{{ value }}</div>

          <div v-if="labels" class="--label-title px-1">
            {{ labels[index] }}
          </div>
          <div
            v-if="displayPercentage && percentages()[index] !== 100"
            class="--label-percent-value px-1"
          >
            {{ percentages()[index] }}%
          </div>

          <u-chart-funnel-hover
            v-if="!noHoverDetails"
            :label="labels[index]"
            :vertical="is_vertical"
            :index="index"
            :labels="subLabels"
            :values="values"
            :filterZeros="filterZeros"
            :subLabelImages="subLabelImages"
            :isCurrency="isCurrency"
            :is2d="is2d()"
            :actualValue="actualValue"
            :twoDimPercentages="twoDimPercentages()"
            :isPercentMode="isPercentMode"
            :subLabelBackgrounds="subLabelBackgrounds"
          ></u-chart-funnel-hover>
        </div>
      </div>
    </div>

    <div v-if="is2d() && !noLegend" class="--legend">
      <div v-for="(subLabel, index) in subLabels" :key="index" class="--l-item">
        <div :style="subLabelBackgrounds(index)" class="--l-item-color"></div>
        <div class="--l-item-title">{{ subLabel }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { interpolate } from "polymorph-js";
import TWEEN from "@tweenjs/tween.js";
import numeral from "numeral";
import FunnelGraph from "../../../ui/chart/funnel/core/js/main";
import { generateLegendBackground, getDefaultColors } from "./core/js/graph.js";
import UChartFunnelHover from "@selldone/components-vue/ui/chart/funnel/hover/UChartFunnelHover.vue";

export default {
  name: "UChartFunnel",
  components: { UChartFunnelHover },
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

    noHoverDetails: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    noLegend: {
      type: Boolean,
      default: false,
    },
    dense: Boolean,

    chartClass: {},
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
    isPercentMode() {
      return this.subLabelValue === "percent";
    },
    has_valid_data() {
      return this.values.some((value) => value.some((i) => i > 0.0001));
    },

    is_vertical() {
      return this.direction === "vertical";
    },
    is_horizontal() {
      return this.direction === "horizontal";
    },

    valuesFormatted() {
      if (this.labelValueCurrency) {
        if (this.graph.is2d()) {
          return this.graph.getValues2d();
        }
        return this.values;
      }

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

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.u--chart-funnel {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  position: relative;
  margin: auto;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  text-align: start;

  .--container {
    position: relative;
    flex-grow: 1;
    overflow: auto;
  }

  svg {
    display: block;
  }

  .--label-value {
    font-size: 0.9rem;
    font-weight: 800;
    color: #222;
  }

  .--label-title {
    font-size: 0.8rem;
    color: #444;
    font-weight: 500;
  }

  .--label-percent-value {
    color: #2a333c;
    font-weight: bold;
    font-size: 1rem;
  }

  &.-dense {
    .--label-value {
      font-size: 0.7rem;
    }

    .--label-title {
      font-size: 0.7rem;
    }

    .--label-percent-value {
      font-size: 0.8rem;
    }
  }

  // ------------- Vertical -------------

  &.-vertical {
    .--segment-container:not(:first-child) {
      border-top: 1px dashed #7777777a !important;
    }

    .u--hover-container {
      padding: 4px 8px;
      width: calc(100% - 8px);
      height: calc(100% - 8px);
      left: 4px;
      top: 4px;
      max-width: none;

      right: auto;

      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      .u--hover-label {
        flex-direction: row;

        > :not(:last-child) {
          border-right: solid 1px #aaa;
          padding-right: 4px;
          padding-left: 4px;
        }
      }
    }

    &.-rtl{
      .u--hover-container {
        .u--hover-label {
          > :not(:last-child) {
            border-left: solid 1px #aaa;
            border-right: unset;
          }
        }
      }
    }

    .--segment {
      flex-direction: column;

      .--segment-container {
        border-left: unset !important;
      }
    }
  }

  // ------------- Horizontal -------------

  &:not(.-vertical) {
    &.-rtl {
      .--segment-container:not(:first-child) {
        border-right: 1px dashed silver !important;
      }
    }

    &:not(.-rtl) {
      .--segment-container:not(:first-child) {
        border-left: 1px dashed silver !important;
      }
    }

    .--label-value,
    .--label-title,
    .--label-percent-value {
      text-align: center;
    }

    .--segment {

      .u--hover-container {
        padding: 4px 8px;

        height: calc(100% - 16px);
        top: 4px;
        max-height: var(--height);
        left: 0;
        right: 0;
        margin-left: auto;
        margin-right: auto;
        width: max-content;

        .--label {
          margin-bottom: 0;
        }

        .u--hover-label {
          justify-content: space-evenly;

          li {
            flex-grow: 0;
            padding-top: 0;
            padding-bottom: 0;
          }
        }
      }
    }
  }

  // ------------- RTL -------------
  &.-rtl {
    .-vertical {
      .--segment {
        flex-direction: row-reverse; // Fix: RTL label orders is invalid!
      }
    }
    .--segment {
      left: unset;
      right: 0;
    }
  }

  .--segment {
    box-sizing: border-box;
    position: absolute;
    display: flex;
    min-width: 100%;
    height: 100%;
    top: 0;
    left: 0;

    .--segment-container {
      flex: 1 1 0;
      position: relative;

      .u--hover-container {
        position: absolute;

        box-sizing: border-box;

        opacity: 0;
        transition: opacity 0.1s ease;
        cursor: default;

        ul {
          margin: 0;
          padding: 0;
          list-style-type: none;
        }
      }

      &:hover {
        .u--hover-container {
          opacity: 1;
        }
      }
    }
  }

  .u--hover-container {
    min-width: 100%;
    min-height: 90%;
    display: grid;
    border-radius: 14px;
    text-align: center;
    z-index: 2;
    color: #444;

    margin-left: 0; // Force 100% width!
    margin-right: 0;

    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    text-shadow: #ffffff 0px 0px 6px;
    border: solid thin #eee;

    .u--hover-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100%;
      overflow: auto;
      flex-grow: 1;

      .--label {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.75rem;
        margin-bottom: 8px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .--percent {
        color: #06080b;
        font-weight: 800;
        font-size: 0.9rem;
      }

      li {
        flex-direction: column;
        display: flex;
        padding: 4px;
        flex-grow: 1;
      }

      > * {
        flex-grow: 1;
        min-width: 60px;
      }
    }
  }

  .--legend {
    flex-grow: 0;
    margin-top: 16px;
    margin-bottom: 16px;
    font-size: 8px;

    display: flex;
    justify-content: center;
    width: 100%;

    .--l-item {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #111;
      line-height: 16px;

      &:not(:first-child) {
        margin-inline-start: 8px;
      }

      .--l-item-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-inline-start: 4px;
      }
    }

    .--l-item-title {
      margin: 2px 4px 2px 4px !important;
    }
  }
}
</style>
