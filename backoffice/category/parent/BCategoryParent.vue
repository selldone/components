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
  <span v-if="category" :class="{ small: small }">
    <!-- -------------------- Parent -------------------- -->
    <!-- 1. Parent > Exist -->
    <span v-if="category.parent" class="ms-2">
      <!-- Parent of parent -->

      <span>
        <v-icon size="small">{{
          category.parent_id ? "more_horiz" : "home"
        }}</v-icon>
        <v-icon :small="small" class="mx-1">{{
          $t("icons.chevron_next")
        }}</v-icon>
      </span>

      <!-- Parent has image -->
      <v-avatar v-if="category.parent.icon" :size="small ? 16 : 24"
        ><img :src="getShopImagePath(category.parent.icon, 64)" class="me-1"
      /></v-avatar>
      <!-- Parent has no image  -->
      <v-icon v-else class="me-1" size="small">folder</v-icon>

      {{ category.parent.title }}
    </span>

    <!-- 1. Parent > Not exist -->
    <span v-else>
      <v-icon class="me-1" size="small">home</v-icon>
      {{ $t("global.commons.home") }}
    </span>

    <!-- -------------------- Current -------------------- -->

    <template v-if="category.id /*Do not show duplicated home! */">
      <v-icon :small="small" class="mx-1">{{
        $t("icons.chevron_next")
      }}</v-icon>

      <v-avatar v-if="category.icon" :size="small ? 16 : 24"
        ><img :src="getShopImagePath(category.icon, 64)" class="me-1"
      /></v-avatar>
      {{ category.title }}
    </template>
  </span>
</template>

<script lang="ts">
export default {
  name: "BCategoryParent",
  props: {
    category: {
      type: Object,
      required: true,
    },
    small: { type: Boolean },
  },
};
</script>

<style scoped></style>
