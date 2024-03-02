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
  <div
    :class="{ 'stop-animations': stop }"
    :style="{ '--pod-color': color }"
    class="flex-grow-1 min-width-50"
  >
    <div v-if="forward" class="sph my-2">
      <span v-if="!stop" class="dot -reverse"
        ><slot name="forward"></slot
      ></span>
    </div>
    <div v-if="backward" class="sph my-2">
      <span v-if="!stop" class="dot"><slot name="backward"></slot></span>
    </div>
  </div>
</template>

<script>
export default {
  name: "SPodWire",
  props: {
    color: {},
    forward: { type: Boolean, default: false },
    backward: { type: Boolean, default: false },
    stop: { type: Boolean, default: false },
  },
};
</script>

<style scoped></style>
