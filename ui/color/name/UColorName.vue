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
  <span class="s--color-name">
    {{ color_name }}
  </span>
</template>

<script lang="ts">
import { GetNameOfColor } from "@selldone/core-js/helper";

export default {
  name: "UColorName",
  props: {
    color: {},
  },
  computed: {
    color_name() {
      return GetNameOfColor(this.color);
    },
  },
  methods: {},
};
</script>

<style lang="scss">
.s--color-name {
}
</style>
