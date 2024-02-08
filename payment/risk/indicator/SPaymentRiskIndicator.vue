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
  <v-avatar
    :color="riskColor"
    class="text-white persian"
    :size="small ? 28 : 42"
  >
    {{ risk }}
  </v-avatar>
</template>

<script>
import chroma from "chroma-js";

export default {
  name: "SPaymentRiskIndicator",

  data: function() {
    return {
      chromaScale: chroma.scale(["#00796B", "#FFA000", "#D32F2F"])
    };
  },

  props: {
    risk: {},
    small: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    riskColor() {
      let scaleValue = this.risk / 100;
      return this.chromaScale(scaleValue).hex();
    }
  }
};
</script>

<style scoped></style>
