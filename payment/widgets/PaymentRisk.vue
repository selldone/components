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
  name: "PaymentRisk",

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
