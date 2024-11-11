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
  <div>
    <v-avatar rounded size="24"
      ><img v-if="connect.icon" :src="getShopImagePath(connect.icon, 64)" />
      <v-icon v-else>hub</v-icon>
    </v-avatar>
    <b class="mx-1">{{ connect.name }} | </b>
    This product created by Connect
    <span class="text-gradient bg-desert-hump">OS</span>, do not change
    {{ field }}!
  </div>
</template>

<script lang="ts">
export default {
  name: "BProductConnectLocked",
  props: {
    connect: { required: true, type: Object },
    field: {},
  },
};
</script>

<style scoped></style>
