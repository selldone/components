<template>
  <div
    class="flex-grow-1 min-width-50"
    :class="{ 'stop-animations': stop }"
    :style="{ '--pod-color': color }"
  >
    <div v-if="forward" class="sph my-2">
      <span v-if="!stop" class="dot -reverse"><slot name="forward"></slot></span>
    </div>
    <div v-if="backward" class="sph my-2">
      <span v-if="!stop" class="dot"><slot name="backward"></slot></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "PodWire",
  props: {
    color: {},
    forward: { type: Boolean, default: false },
    backward: { type: Boolean, default: false },
    stop: { type: Boolean, default: false },
  },
};
</script>

<style scoped></style>
