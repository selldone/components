<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <v-btn variant="elevated" icon density="compact">
    <v-icon size="small">more_vert</v-icon>
    <v-menu open-on-hover activator="parent" location="start center" offset="-32">
      <v-sheet class="mx-1 pa-1" color="#fff" rounded="lg">
        <slot></slot>
      </v-sheet>
    </v-menu>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "UMenuExpandable",
});
</script>

<style scoped lang="scss"></style>
