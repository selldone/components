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
  <v-list-item v-if="customer" class="text-start">
    <template v-slot:prepend>
      <v-avatar class="avatar-gradient -thin -customer" size="48">
        <v-img v-if="customer.user_id" :src="getUserAvatar(customer.user_id)" />
        <v-icon v-else size="large">person_outline</v-icon>
      </v-avatar>
    </template>

    <v-list-item-title>
      <b>{{ customer.name }}</b>
    </v-list-item-title>
    <v-list-item-subtitle>
      <small v-if="customer.email" class="d-block">
        <v-icon class="me-1" size="small">email</v-icon>
        {{ customer.email }}</small
      >
      <small v-if="customer.phone" class="d-block">
        <v-icon class="me-1" size="small">phone</v-icon>
        {{ customer.phone }}</small
      >
    </v-list-item-subtitle>
  </v-list-item>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "BShopCustomerBox",
  props: {
    customer: {
      type: Object,
    },
  },
});
</script>

<style lang="scss" scoped></style>
