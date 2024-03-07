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
  <v-tooltip color="#000" location="bottom" max-width="420">
    <template v-slot:activator="{ props }">
      <v-btn  variant="plain" icon size="32"  v-bind="props">
        <v-icon>help_center</v-icon>
      </v-btn>
    </template>
    <div class="pa-2 text-start">
      <slot></slot>
    </div>
  </v-tooltip>
</template>

<script>
export default {
  name: "STooltipInfoButton",
};
</script>

<style scoped></style>
