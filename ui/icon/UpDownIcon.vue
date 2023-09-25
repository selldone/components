<template>
  <span>
    <v-icon v-if="value > 0" :color="green" :small="small">
      fas fa-caret-up
    </v-icon>
    <v-icon v-else-if="value < 0" :color="red" :small="small">
      fas fa-caret-down
    </v-icon>
  </span>
</template>

<script>
export default {
  name: "UpDownIcon",
  props: {
    value: {
      require: true,
      type: Number,
    },
    small: {
      require: false,
      type: Boolean,
      default: false,
    },
    red: { default: "red" },
    green: { default: "green" },
  },
};
</script>

<style scoped></style>
