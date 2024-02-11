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
  <img
    v-if="region_object"
    :height="height"
    :src="region_object.src"
    :title="region_object.name"
    :width="height * 1.5"
    class="no-inv"
  />
</template>

<script>
import USState from "./assets/us/USState";
import CanadaState from "./assets/ca/CanadaState";
import IndiaState from "./assets/in/IndiaState";

export default {
  name: "SStateFlag",
  props: {
    country: { required: true },
    region: { required: true },
    height: { default: 24 },
  },

  computed: {
    region_object() {
      if (!this.region) return null;

      // US:
      if (this.country.toLowerCase() === "us") {
        return this.find(USState);
      }
      // Canada
      else if (this.country.toLowerCase() === "ca") {
        return this.find(CanadaState);
      }
      // India
      else if (this.country.toLowerCase() === "in") {
        return this.find(IndiaState);
      }
      return null;
    },
  },

  methods: {
    find(array) {
      const region = this.region.toLowerCase();
      return array.find(
        (item) =>
          item.code.toLowerCase() === region ||
          item.name.toLowerCase() === region,
      );
    },
  },
};
</script>

<style scoped></style>
