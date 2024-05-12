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
  <div class="text-center small">
    <u-map-countries-heatmap
      v-if="mapData"
      :country-data="mapData"
      style="height: 84px"
    />

    <flag :iso="country" :squared="false" />
    {{ getCountryName(country) }}
  </div>
</template>

<script>
import UMapCountriesHeatmap from "../../../../ui/map/countries/heatmap/UMapCountriesHeatmap.vue";

export default {
  name: "UMapCountriesSingle",
  components: { UMapCountriesHeatmap },
  props: {
    country: {
      require: true,
      type: String,
    },
  },
  computed: {
    mapData() {
      if (!this.country) return null;
      let out = { X: 0 };
      out[this.country] = 100;
      return out;
    },
  },
};
</script>

<style scoped></style>
