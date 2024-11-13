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
  <div :class="`vue-world-map map_svg_${map_id}`">
    <u-map-countries-svg :css-inline="css" :has-tooltip="hasTooltip">
      <template v-if="hasTooltip" v-slot="{ country }">
        <div v-if="country" class="d-flex">
          <small>{{ getCountryName(country) }}</small>
          <v-spacer></v-spacer>
          <flag :iso="country" :squared="false" />
        </div>
        <slot :country="country"></slot>
      </template>
    </u-map-countries-svg>
  </div>
</template>

<script lang="ts">
import { scale } from "chroma-js";
import UMapCountriesSvg from "../../../../ui/map/countries/svg/UMapCountriesSvg.vue";
import {
  getBaseCss,
  getCombinedCssString,
  getDynamicMapCss,
} from "./dynamic-map-css.ts";

export default {
  name: "UMapCountriesHeatmap",

  components: { UMapCountriesSvg },
  watch: {
    countryData() {
      this.renderMapCSS();
    },
    highColor() {
      this.chromaScale = scale([this.lowColor, this.highColor]);
      this.renderMapCSS();
    },
    lowColor() {
      this.chromaScale = scale([this.lowColor, this.highColor]);
      this.renderMapCSS();
    },
  },
  props: {
    lowColor: {
      type: String,
      default: "#fde2e2",
    },
    highColor: {
      type: String,
      default: "#d83737",
    },
    countryData: {
      type: Object,
      required: true,
    },
    defaultCountryFillColor: {
      type: String,
      default: "#dadada",
    },
    countryStrokeColor: {
      type: String,
      default: "black",
    },
    hasTooltip: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      map_id: "0",
      //node: document.createElement('style'),
      chromaScale: scale([this.$props.lowColor, this.$props.highColor]),
      css: "",
    };
  },

  methods: {
    renderMapCSS() {
      const baseCss = getBaseCss(this.map_id, this.$props);
      const dynamicMapCss = getDynamicMapCss(
        this.map_id,
        this.countryData,
        this.chromaScale,
      );
      this.css = getCombinedCssString(baseCss, dynamicMapCss);
    },
  },
  created() {
    this.map_id = Math.round(Math.random() * 10000);
  },
  mounted() {
    //  document.body.appendChild(this.$data.node);
    this.renderMapCSS();
  },
};
</script>

<style>
.vue-world-map {
  height: 100%;
}
</style>
