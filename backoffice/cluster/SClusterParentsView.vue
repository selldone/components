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
  <span v-if="cluster" :class="{ small: small }">
    <!-- -------------------- Parent -------------------- -->
    <!-- 1. Parent > Exist -->
    <span v-if="cluster.parent" class="ms-2">
      <!-- Parent of parent -->

      <span>
        <v-icon size="small">{{
          cluster.parent_id ? "more_horiz" : "home"
        }}</v-icon>
        <v-icon class="mx-1" :small="small">{{
          $t("icons.chevron_next")
        }}</v-icon>
      </span>

      <!-- Parent has image -->
      <v-avatar v-if="cluster.parent.icon" :size="small ? 16 : 24"
        ><img :src="getShopImagePath(cluster.parent.icon, 64)" class="me-1"
      /></v-avatar>
      <!-- Parent has no image  -->
      <v-icon v-else size="small" class="me-1">folder</v-icon>

      {{ cluster.parent.name }}
    </span>

    <!-- 1. Parent > Not exist -->
    <span v-else>
      <v-icon size="small" class="me-1">home</v-icon>
      {{ $t("global.commons.home") }}
    </span>

    <!-- -------------------- Current -------------------- -->

    <v-icon class="mx-1" :small="small">{{ $t("icons.chevron_next") }}</v-icon>

    <v-avatar v-if="cluster.icon" :size="small ? 16 : 24"
      ><img :src="getShopImagePath(cluster.icon, 64)" class="me-1"
    /></v-avatar>
    {{ cluster.name }}
  </span>
</template>

<script>
export default {
  name: "SClusterParentsView",
  props: {
    cluster: {
      type: Object,
      required: true,
    },
    small: { type: Boolean },
  },
};
</script>

<style scoped></style>
