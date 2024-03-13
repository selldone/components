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
  <v-btn
    class="margin-n7px hover-alpha"
    color="primary"
    icon
    size="36"
    variant="plain"
  >
    <v-icon color="#000"> {{ icon }}</v-icon>

    <v-tooltip
      activator="parent"
      :max-width="480"
      content-class="bg-black text-start"
      location="bottom"
    >
      <div class="text-start" v-html="message"></div>
    </v-tooltip>
  </v-btn>
</template>

<script>
/**
 * Using this in v-inputs.
 */
export default {
  name: "TipsButton",
  props: {
    message: {},
    icon: { default: "help" },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

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
