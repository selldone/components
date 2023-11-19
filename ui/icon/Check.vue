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
