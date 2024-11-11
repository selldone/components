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
  <div :class="{ dark: dark }" class="overflow-x-auto">
    <v-row
      :style="{ minWidth: 5 * 110 + 'px' }"
      align="center"
      class="pa-9"
      group
      justify="center"
      no-gutters
      tag="div"
    >
      <v-scroll-x-transition
        v-for="(it, i) in items"
        :key="'a-' + it.title"
        group
        leave-absolute
      >
        <div :key="`a-${it.title}`" class="pod x-small">
          <v-icon :color="it.color" size="24">{{ it.icon }}</v-icon>
          {{ it.title }}
        </div>

        <div
          v-if="i < items.length - 1"
          :key="`b-${i}`"
          class="flex-grow-1 sph"
        >
          <span class="dot -reverse"></span>
        </div>
      </v-scroll-x-transition>
    </v-row>
  </div>
</template>

<script lang="ts">
export default {
  name: "BShopOptionsCheckoutModePods",
  props: {
    shop: { required: false },
    mode: {},

    dark: {
      default: false,
      type: Boolean,
    },
  },

  computed: {
    on_checkout() {
      return this.mode === "on-checkout";
    },
    login_free() {
      return this.mode === "login-free";
    },
    items() {
      if (this.on_checkout) {
        return [
          { title: "Guest", icon: "person_outline" },
          { title: "Add to cart", icon: "add_shopping_cart" },
          { title: this.$t("global.commons.checkout"), icon: "shopping_bag" },
          {
            title: this.$t("global.commons.login"),
            icon: "login",
            color: "green",
          },
          { title: this.$t("global.commons.payment"), icon: "payment" },
        ];
      } else if (this.login_free) {
        return [
          { title: "Guest", icon: "person_outline" },
          { title: "Add to cart", icon: "add_shopping_cart" },
          { title: this.$t("global.commons.checkout"), icon: "shopping_bag" },
          { title: this.$t("global.commons.payment"), icon: "payment" },
          {
            title: this.$t("global.commons.login"),
            icon: "login",
            color: "amber",
          },
        ];
      }
      return [
        { title: "Guest", icon: "person_outline" },
        { title: "Add to cart", icon: "add_shopping_cart" },
        {
          title: this.$t("global.commons.login"),
          icon: "login",
          color: "green",
        },
        { title: this.$t("global.commons.checkout"), icon: "shopping_bag" },
        { title: this.$t("global.commons.payment"), icon: "payment" },
      ];
    },
  },
};
</script>

<style scoped></style>
