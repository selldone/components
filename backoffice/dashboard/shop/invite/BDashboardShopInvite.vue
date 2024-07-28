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
  <div v-if="referral" class="widget">
    <div>
      <v-avatar class="avatar-gradient -thin" size="64">
        <v-img :src="getUserAvatar(USER_ID(), 'big')"></v-img>
      </v-avatar>

      <template>
        <img
          class="mx-3"
          height="15"
          src="../../../../assets/icons/wire.svg"
          width="15"
        />
        <v-avatar class="avatar-gradient -thin -shop" size="64">
          <v-img v-if="shop.icon" :src="getShopImagePath(shop.icon)"></v-img>
          <v-avatar v-else color="#fff" size="60">
            <v-icon color="#111">storefront</v-icon>
          </v-avatar>
        </v-avatar>
      </template>
    </div>
    <h2 class="text-h4 my-2 text-capitalize line-height-normal fadeIn">
      {{ $t("invite_friends.title") }} + 🎁
    </h2>
    <h3
      class="typo-body my-2 font-weight-light line-height-normal fadeIn delay_200"
    >
      {{ $t("invite_friends.msg") }}
    </h3>

    <s-invite-friends
      class="my-3 widget-buttons w-100"
      large
    ></s-invite-friends>

    <v-btn
      class="absolute-top-end"
      icon
      size="x-large"
      variant="plain"
      @click="close()"
    >
      <v-icon>close</v-icon>
    </v-btn>
  </div>
</template>

<script>
import SInviteFriends from "../../../invite/friends/SInviteFriends.vue";

export default {
  name: "BDashboardShopInvite",
  components: { SInviteFriends },
  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({}),
  computed: {
    referral() {
      return this.USER().referral;
    },
  },
  methods: {
    close() {
      localStorage.setItem(
        "hide-invite-dashboard",
        new Date().getMonth().toString(),
      );
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
