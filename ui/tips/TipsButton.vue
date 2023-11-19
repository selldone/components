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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-tooltip bottom :max-width="480" color="#000">
    <template v-slot:activator="{ on }">
      <v-btn
        color="primary"
        class="margin-n7px hover-alpha"
        dark
        v-on="on"
        icon
        @click="$emit('click')"
      >
        <v-icon color="#000"> {{icon}} </v-icon>
      </v-btn>
    </template>
    <div v-html="message" class="text-start"></div>
  </v-tooltip>
</template>

<script>
/**
 * Using this in v-inputs.
 */
export default {
  name: "TipsButton",
  props: {
    message: {},
    icon:{default:'help'}
  },
};
</script>

<style scoped lang="scss">
.hover-alpha {
  opacity: 0.4;
  transition: all 0.3s;
  -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
  &:hover {
    opacity: 1;
    -webkit-filter: grayscale(0%); /* Safari 6.0 - 9.0 */
    filter: grayscale(0%);
  }
}
</style>
