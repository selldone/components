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
  <div class="cdc-sections" :style="containerStyles">
    <div
      v-for="(section, idx) in donutSections"
      v-on="section.listeners"
      :key="idx"
      class="cdc-section"
      :class="section.className"
      :style="section.sectionStyles"
    >
      <div
        class="cdc-filler"
        :style="section.fillerStyles"
        :title="section.label"
      ></div>
    </div>
  </div>
</template>

<script>
import { nativeSectionEvents } from "./utils/events";
import { defaultColor } from "./utils/misc";

const sectionClass = {
  LEFT: "cdc-section-left",
  RIGHT: "cdc-section-right",
};

export default {
  props: {
    startAngle: { type: Number, default: 0 },
    sections: { type: Array, default: () => [] },
  },
  computed: {
    containerStyles() {
      return {
        transform: `rotate(${this.startAngle}deg)`,
      };
    },
    donutSections() {
      const maxDegreesPerSection = 180;
      let degreesConsumed = 0;

      let offsetBy = 0;

      const sections = this.sections.map((section) => {
        let [className, offset] = [sectionClass.RIGHT, -180];
        if (degreesConsumed >= maxDegreesPerSection) {
          [className, offset] = [sectionClass.LEFT, 180];
        }

        const degree = offset + section.degree;

        const fillerStyles = {
          backgroundColor: section.color || defaultColor,
          transform: `rotate(${degree}deg)`,
        };
        const sectionStyles = { transform: `rotate(${offsetBy}deg)` };

        degreesConsumed += section.degree;
        if (degreesConsumed === 180) offsetBy = 0;
        else offsetBy += section.degree;

        const listeners = nativeSectionEvents.reduce(
          (acc, { nativeEventName, sectionEventName }) => ({
            ...acc,
            [nativeEventName]: (event) =>
              this.emitEvent(sectionEventName, section, event),
          }),
          {}
        );

        return {
          label: section.label,
          className,
          fillerStyles,
          sectionStyles,
          listeners,
        };
      });

      return sections;
    },
  },
  methods: {
    emitEvent(sectionEventName, section, event) {
      if (section.value === 0) return;
      this.$emit(sectionEventName, section.$section, event);
    },
  },
};
</script>
