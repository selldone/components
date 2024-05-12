<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <v-row align="center" class="mb-2" justify="start" no-gutters>
    <div class="pod">
      <div>
        <img
          class="m-1"
          height="20"
          src="../../../../assets/trademark/instagram.svg"
          width="20"
        />
        <img
          class="m-1"
          height="20"
          src="../../../../assets/trademark/snapchat.svg"
          width="20"
        />
        <img
          class="m-1"
          height="20"
          src="../../../../assets/trademark/tik-tok.svg"
          width="20"
        />
      </div>
    </div>

    <div class="flex-grow-1 sph">
      <span class="dot -reverse"></span>
    </div>

    <div class="pod">
      <div>
        <v-avatar v-if="userId" :size="24" class="my-1 avatar-gradient -thin">
          <v-img :src="getUserAvatar(userId)" />
        </v-avatar>
        <v-icon v-else>account_circle</v-icon>
        <small class="d-block">{{ userName }}</small>
      </div>
    </div>

    <div class="flex-grow-1 sph">
      <span class="dot -reverse"></span>
    </div>

    <div class="pod">
      <v-icon>storefront</v-icon>
      <small class="d-block">{{ shop.title }}</small>
    </div>
  </v-row>
</template>

<script>
export default {
  name: "BAffiliatePosPods",
  props: {
    userId: {},
    userName: {},
    shop: { required: true },
  },
};
</script>

<style scoped></style>
