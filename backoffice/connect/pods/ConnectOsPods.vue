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
  <v-row align="center" class="mb-2" justify="start" no-gutters>
    <div class="pod">
      <v-avatar
        v-if="shop && shop.icon"
        class="avatar-gradient -thin -shop"
        size="24"
        ><img :src="getShopImagePath(shop.icon, 64)"
      /></v-avatar>
      <v-icon v-else>storefront</v-icon>
      <small class="d-block">{{ shop ? shop.title : "Shop" }}</small>
    </div>

    <div class="flex-grow-1">
      <div v-if="read" class="sph my-3">
        <span class="dot"></span>
      </div>

      <div v-if="write" class="sph my-3">
        <span class="dot -reverse"></span>
      </div>
    </div>

    <div
      :class="{ 'pp hover-scale-tiny': clickConnect }"
      class="pod -rounded"
      @click="$emit('click:connect')"
    >
      <v-icon :class="{ 'fa-spin fa-spin-reverse': syncing }" color="primary"
        >sync
      </v-icon>
      <small class="d-block" dir="ltr"
        >Connect <span class="text-gradient bg-desert-hump">OS</span></small
      >
    </div>

    <div class="flex-grow-1">
      <div v-if="read" class="sph my-3">
        <span class="dot"></span>
      </div>

      <div v-if="write" class="sph my-3">
        <span class="dot -reverse"></span>
      </div>
    </div>
    <div class="pod">
      <v-avatar class="" rounded size="24"
        ><img :src="getShopImagePath(connect.icon, 64)"
      /></v-avatar>
      <small class="d-block">{{ connect.name }}</small>
    </div>
  </v-row>
</template>

<script>
export default {
  name: "ConnectOsPods",
  emits: ["click:connect"],
  props: {
    shop: { required: false },
    connect: { required: true },

    read: { default: false, type: Boolean },
    write: { default: false, type: Boolean },

    syncing: { default: false, type: Boolean },

    clickConnect: { default: false, type: Boolean },
  },
};
</script>

<style scoped></style>
