<template>
  <span v-if="value !== null && value!==undefined">
    <v-icon
      v-if="value"
      color="green"
      :small="small"
      @click="$emit('input', !value)"
    >
      {{ trueIcon }}
    </v-icon>
    <v-icon v-else color="red" :small="small" @click="$emit('input', !value)">
      {{ falseIcon }}
    </v-icon>
  </span>
</template>

<script>
export default {
  name: "Check",
  props: {
    value: {},
    small: {
      type: Boolean,
      default: false,
    },
    trueIcon: { default: "check" },
    falseIcon: { default: "close" },
  },
};
</script>

<style scoped></style>
