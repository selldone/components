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
  <span>
    <v-icon
      v-if="value > 0"
      :color="green"
      :size="size ? size : small ? 'small' : undefined"
    >
      fa:fas fa-caret-up
    </v-icon>
    <v-icon
      v-else-if="value < 0"
      :color="red"
      :size="size ? size : small ? 'small' : undefined"
    >
      fa:fas fa-caret-down
    </v-icon>
  </span>
</template>

<script lang="ts">
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
    size: {},
  },
};
</script>

<style scoped></style>
