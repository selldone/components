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
  <v-avatar :size="size">
    <v-sheet
      :color="color"
      :style="{ 'font-size': size * 0.32 + 'px' }"
      class="text-uppercase d-flex align-center justify-center av-image"
      rounded="circle"
    >
      <span>{{ text }}</span>
    </v-sheet>
  </v-avatar>
</template>

<script>
import { StringToColour } from "@selldone/core-js/helper/color/ColorGenerator";

export default {
  name: "UAvatarText",
  props: {
    name: { required: true },
    size: {},
  },
  computed: {
    text() {
      if (!this.name) return "-";
      let out = "";

      out = this.name
        .split(" ")
        .map((word) => word[0])
        .join("");

      if (out.length < 2 && this.name.length >= 2) out = out + this.name[1];

      return out.substring(0, 2);
    },
    color() {
      return StringToColour(this.name ? this.name : "-", -15);
    },
  },
};
</script>

<style scoped></style>
