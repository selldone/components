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
  <div class="inline-block position-relative">
    <v-progress-circular
      :color="color"
      :model-value="value"
      :rotate="360"
      :size="size"
      :width="width"
    >
      <v-icon :color="color" :size="size * 0.6" class="center-absolute"
        >{{
          value > 85
            ? "check_circle"
            : value > 50
              ? "horizontal_rule"
              : "thumb_down_alt"
        }}
      </v-icon>
    </v-progress-circular>
  </div>
</template>

<script lang="ts">
export default {
  name: "UProgressScore",
  props: {
    value: {},
    min: { default: 0 },
    max: { default: 100 },
    size: { default: 26 },
    width: { default: 4 },
  },

  computed: {
    color() {
      return this.value > 85 ? "green" : this.value > 50 ? "amber" : "red";
    },
  },
};
</script>

<style scoped></style>
