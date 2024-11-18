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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <!-- ―――――――――― Navigation drawer (Mobile & Instance app) : Action ―――――――――― -->
  <v-btn
    v-bind="$attrs"
    icon
    size="large"
    @click.stop="drawer = !drawer"
    aria-label="Open Main Menu"
  >
    <v-icon> menu</v-icon>
  </v-btn>

  <!-- ―――――――――― Navigation drawer (Mobile & Instance app) : Menu ―――――――――― -->
  <s-shop-navigation-drawer v-model="drawer"></s-shop-navigation-drawer>
</template>

<script lang="ts">
import SShopNavigationDrawer from "@selldone/components-vue/storefront/menu/side/SShopNavigationDrawer.vue";

export default {
  name: "SHeaderSectionDrawerMenu",
  components: {
    SShopNavigationDrawer,
  },
  inject: ["$shop"],

  props: {},
  data: () => ({
    menu: false,

    drawer: false,
  }),

  computed: {
    user() {
      return this.$store.getters.getUser;
    },
    profile() {
      return this.user && this.user.profile;
    },

    theme() {
      if (!this.$shop) return null;
      return this.$shop.theme;
    },
  },

  watch: {},

  created() {},

  mounted() {},
  beforeUnmount() {},

  methods: {},
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
