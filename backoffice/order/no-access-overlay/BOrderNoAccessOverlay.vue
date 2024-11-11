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
    class="s--card-window-content min-height-60vh mx-3 v-card d-flex flex-column justify-center"
  >
    <div class="text-muted ma-auto pa-2">
      <div class="ma-3 d-flex align-center justify-center">
        <v-avatar class="rounded-lg ma-1" color="#222" size="48">
          <v-icon color="#fff">shopping_bag</v-icon>
        </v-avatar>
      </div>

      <h1 class="font-weight-thin text-h3">
        You have no access to this order.
      </h1>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "BOrderNoAccessOverlay",
};
</script>

<style scoped></style>
