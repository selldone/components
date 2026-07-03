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
  <v-chip
    v-if="profile"
    :color="dark ? '#111' : '#fafafa'"
    :size="size"
    title="Tax profile"
    variant="flat"
  >
    <v-icon :color="profile.icon" :small="small" start
      >{{ profile.icon }}
    </v-icon>
    {{ profile.name?.limitWords(3) }}
  </v-chip>
</template>

<script lang="ts">
export default {
  name: "BTaxProfileChip",
  props: {
    shop: { required: true },
    profileId: { required: true },
    dark: { type: Boolean },
    size:{},
  },
  computed: {
    profiles() {
      return this.shop.tax_profiles;
    },
    profile() {
      return this.profiles?.find((p) => p.id === this.profileId);
    },
  },
};
</script>

<style scoped></style>
