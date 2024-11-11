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
  <div :style="placementStyles.container" class="cdc-container">
    <div ref="donut" :style="donutStyles" class="cdc">
      <u-chart-donut-piece
        :sections="donutSections"
        :start-angle="startAngle"
        v-on="sectionListeners"
      >
      </u-chart-donut-piece>
      <div :style="overlayStyles" class="cdc-overlay">
        <div :style="donutTextStyles" class="cdc-text">
          <slot>{{ text }}</slot>
        </div>
      </div>
    </div>

    <slot name="legend">
      <div v-if="hasLegend" :style="placementStyles.legend" class="cdc-legend">
        <span
          v-for="(item, idx) in legend"
          :key="idx"
          :title="item.percent"
          class="cdc-legend-item"
        >
          <span :style="item.styles" class="cdc-legend-item-color"></span>
          <span>{{ item.label }}</span>
        </span>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { nativeSectionEvents } from "./utils/events";
import defaultColors from "./utils/colors";
import { placement, placementStyles, sectionValidator } from "./utils/misc";
import UChartDonutPiece from "./piece/UChartDonutPiece.vue";

import "../../../ui/chart/donut/styles/main.scss";

export default {
  name: "UChartDonut",
  components: { UChartDonutPiece },

  props: {
    // diameter of the donut
    size: { type: Number, default: 250, validator: (v) => v > 0 },

    // unit to use for `size`
    unit: { type: String, default: "px" },

    // percentage of donut ring's thickness
    thickness: {
      type: Number,
      default: 20,
      validator: (v) => v >= 0 && v <= 100,
    },

    // text in the middle of the donut, this can also be passed using the default slot
    text: { type: String, default: null },

    autoAdjustTextSize: { type: Boolean, default: true },

    // color to use for the middle of the donut
    // set this to `transparent` or `thickness` to 100 to make a pie chart instead
    background: { type: String, default: "#ffffff" },

    // color to use for the empty ring areas
    foreground: { type: String, default: "#eeeeee" },

    // sections of the donut, must have a `value` property
    // other valid properties are `label` and `color` (default is `dodgerblue`)
    sections: {
      type: Array,
      default: () => [],
      validator(sections) {
        for (let i = 0; i < sections.length; ++i) {
          /* istanbul ignore if - already covered by unit tests for sectionValidator */
          if (!sectionValidator(sections[i])) return false;
        }
        return true;
      },
    },
    total: { type: Number, default: 100, validator: (v) => v > 0 },
    hasLegend: { type: Boolean, default: false },
    legendPlacement: {
      type: String,
      default: placement.BOTTOM,
      validator: (val) => !!placement[val.toUpperCase()],
    },

    // degree angle at which the first section begins
    startAngle: { type: Number, default: 0 },
  },
  watch: {
    autoAdjustTextSize(val) {
      if (val) window.addEventListener("resize", this.resizeListener);
      else window.removeEventListener("resize", this.resizeListener);
      this.recalcFontSize();
    },
    size() {
      this.recalcFontSize();
    },
    unit() {
      this.recalcFontSize();
    },
  },
  data() {
    return {
      donutEl: null,
      fontSize: "1em",

      resizeListener: null,
    };
  },
  computed: {
    donutSections() {
      let valueTotal = this.sections.reduce((a, c) => a + c.value, 0);
      if (typeof valueTotal !== "number") return [];
      valueTotal = Number(valueTotal.toFixed(2));

      if (valueTotal > this.total) {
        const err = `Sum of all the sections' values (${valueTotal}) should not exceed \`total\` (${this.total})`;
        throw new Error(err);
      }
      const degreesInACircle = 360;
      const degreesInASection = 180;

      let consumedDegrees = 0;
      let currentDefaultColorIdx = 0;

      const sections = [];
      this.sections.forEach((section) => {
        const valToDeg = degreesInACircle * (section.value / this.total);

        let degreeArr = [valToDeg];

        if (valToDeg > degreesInASection) {
          degreeArr = [degreesInASection, valToDeg - degreesInASection];
        }

        const color = section.color || defaultColors[currentDefaultColorIdx++];

        degreeArr.forEach((degree) => {
          // limit to 2 decimal digits to avoid floating point arithmetic issues
          const consumedWithCurrent = Number(
            (consumedDegrees + degree).toFixed(2),
          );
          if (consumedWithCurrent > degreesInASection) {
            const remainingDegreesInCurrentSection =
              degreesInASection - consumedDegrees;

            sections.push(
              {
                ...section,
                degree: remainingDegreesInCurrentSection,
                color,
                $section: section,
              },
              {
                ...section,
                degree: degree - remainingDegreesInCurrentSection,
                color,
                $section: section,
              },
            );
          } else {
            sections.push({ ...section, degree, color, $section: section });
          }

          consumedDegrees += degree;

          if (consumedDegrees >= degreesInASection) {
            consumedDegrees -= degreesInASection;
          }
        });
      });
      return sections;
    },
    legend() {
      /* istanbul ignore if - legend isn't rendered at all because of v-if="hasLegend" */
      if (!this.hasLegend) return null;
      let currentDefaultColorIdx = 0;

      return this.sections.map((section, idx) => ({
        label: section.label || `Section ${idx + 1}`,
        percent: `${section.value} (${(section.value / this.total) * 100}%)`,
        styles: {
          backgroundColor:
            section.color || defaultColors[currentDefaultColorIdx++],
        },
      }));
    },
    placementStyles() {
      if (!this.hasLegend) return {};
      return placementStyles[this.legendPlacement];
    },
    donutStyles() {
      const size = `${this.size}${this.unit}`;
      const styles = {
        width: size,
        paddingBottom: size,
        backgroundColor: this.foreground,
      };
      return styles;
    },
    overlayStyles() {
      const availablePercent = 100;
      const size = availablePercent - this.thickness;

      const sizePercent = `${size}%`;
      const pos = `calc(50% - ${size / 2}%)`;

      return {
        height: sizePercent,
        width: sizePercent,
        top: pos,
        left: pos,
        backgroundColor: this.background,
      };
    },
    donutTextStyles() {
      const { fontSize } = this;
      return { fontSize };
    },
    sectionListeners() {
      return nativeSectionEvents.reduce(
        (acc, { sectionEventName }) => ({
          ...acc,
          [sectionEventName]: (...args) =>
            this.emitSectionEvent(sectionEventName, ...args),
        }),
        {},
      );
    },
  },
  methods: {
    recalcFontSize() {
      if (!this.autoAdjustTextSize) {
        this.fontSize = "1em";
        return;
      }

      const scaleDownBy = 0.08;
      let widthInPx = this.size;

      this.$nextTick(() => {
        if (this.unit !== "px") {
          /* istanbul ignore else */
          if (this.donutEl) widthInPx = this.donutEl.clientWidth;
          else widthInPx = null;
        }

        this.fontSize = widthInPx
          ? `${(widthInPx * scaleDownBy).toFixed(2)}px`
          : "1em";
      });
    },
    emitSectionEvent(sectionEventName, ...args) {
      this.$emit(sectionEventName, ...args);
    },
  },
  created() {
    this.resizeListener = this.recalcFontSize.bind(this);
  },
  mounted() {
    this.donutEl = this.$refs.donut;

    if (this.autoAdjustTextSize) {
      this.recalcFontSize();
      window.addEventListener("resize", this.resizeListener);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeListener);
  },
};
</script>
