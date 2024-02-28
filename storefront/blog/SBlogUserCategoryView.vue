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
  <div :class="{ 'text-black': !dark }" class="text-subtitle-2">
    <v-avatar class="me-1 me-sm-2" size="20">
      <img :alt="user.name" :src="getUserAvatar(user.id)" />
    </v-avatar>
    <span> {{ user.profile?.name ? user.profile.name : user.name }}</span>
    <v-icon v-if="user.verified" class="mx-1" color="blue" size="small"
      >verified
    </v-icon>

    <template v-if="category">
      <v-icon class="mx-0 mx-sm-1">{{ $t("icons.navigate_next") }}</v-icon>

      <v-avatar v-if="category.icon" class="me-1 me-sm-2" rounded size="20">
        <img :alt="category.category" :src="getShopImagePath(category.icon)" />
      </v-avatar>
      {{ category.category }}
    </template>
  </div>
</template>

<script>
export default {
  name: "SBlogUserCategoryView",
  props: {
    user: {
      require: true,
    },
    categoryName: {},
    categories: {},
    dark: {},
  },

  computed: {
    category() {
      return (
        this.categories &&
        this.categoryName &&
        this.categories.find(
          (it) =>
            it.category === this.categoryName || it.id === this.categoryName,
        ) // id : shop blogs    category: Selldone blogs
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.subtitle-2 {
  @media only screen and (max-width: 500px) {
    font-size: 80% !important;
  }
}
</style>
