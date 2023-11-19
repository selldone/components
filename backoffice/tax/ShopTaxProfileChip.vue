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
  <v-chip v-if="profile" title="Tax profile" :small="small" :dark="dark" :color="dark?'#111':'#fafafa'">
    <v-icon :color="profile.icon" left  :small="small">{{profile.icon}}</v-icon>
    {{profile.name }}
  </v-chip>
</template>

<script>

export default {
  name: "ShopTaxProfileChip",
  props: {
    shop: { required: true },
    profileId: { required: true },
    small: { type: Boolean },
    dark: { type: Boolean },
  },
  computed: {
    profiles() {
      return this.shop.tax_profiles
    },
    profile() {
      return this.profiles?.find(p=>p.id===this.profileId)
    },
  },
};
</script>

<style scoped></style>
