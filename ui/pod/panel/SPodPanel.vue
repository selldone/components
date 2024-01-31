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
  name: "SPodPanel",
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
