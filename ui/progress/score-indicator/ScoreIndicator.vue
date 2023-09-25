<template>
  <div class="inline-block position-relative">
    <v-progress-circular
      :rotate="360"
      :size="size"
      :width="width"
      :value="value"
      :color="color"
    >
      <v-icon :color="color" :size="size*0.6" class="center-absolute">{{
        value > 85 ? "check_circle" : value > 50 ? "horizontal_rule" : "thumb_down_alt"
      }}</v-icon>
    </v-progress-circular>
  </div>
</template>

<script>
export default {
  name: "ScoreIndicator",
  props: {
    value: {},
    min: { default: 0 },
    max: { default: 100 },
    size:{default:26},
    width:{default:4},
  },

  computed: {
    color() {
      return this.value > 85 ? "green" : this.value > 50 ? "amber" : "red";
    },
  },
};
</script>

<style scoped></style>
