<template>
  <div
    class="d-flex align-center mx-n3 "
    :class="{ 'stop-animations disabled': disabled,'py-11 overflow-auto thin-scroll':!dense ,'px-11':!small,'px-6' :small,'pods-small':small}"
    :style="{
      '--pod-color': color,
      '--pod-dot-color': dotColor,
      '--pod-badge-text-color': badgeTextColor,
    }"
  >
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "Pods",
  props: {

    dense: { type: Boolean, default: false },
    small: { type: Boolean, default: false },


    disabled: { type: Boolean, default: false },

    color: {},
    dotColor: {},
    badgeTextColor: {},
  },
};
</script>

<style scoped></style>
