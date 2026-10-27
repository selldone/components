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
  <section v-if="modern && referral" class="s--shop-invite-modern text-start">
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"
          ><v-icon>share</v-icon></span
        >
        <div>
          <h2 class="sd-modern-title-text">
            {{ $t("admin_shop.dashboard.modern.referral_program") }}
          </h2>
          <p class="sd-modern-subtitle">{{ $t("invite_friends.title") }}</p>
        </div>
      </div>
      <v-btn
        icon
        class="sd-modern-icon-button"
        variant="text"
        :aria-label="$t('global.actions.close')"
        v-tooltip="$t('global.actions.close')"
        @click="close()"
        ><v-icon>close</v-icon></v-btn
      >
    </header>
    <p class="s--shop-invite-modern__message">{{ $t("invite_friends.msg") }}</p>
    <div class="s--shop-invite-modern__actions">
      <span class="s--shop-invite-modern__identity"
        ><v-avatar size="28"
          ><v-img :src="getUserAvatar(USER_ID(), 'big')">
            <template #error>
              <span class="s--shop-invite-modern__avatar-fallback"
                ><v-icon size="20">person</v-icon></span
              >
            </template>
          </v-img></v-avatar
        >{{ USER().name }}</span
      >
      <s-invite-friends modern />
    </div>
  </section>

  <div v-else-if="referral" class="widget">
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

<script lang="ts">
import SInviteFriends from "../../../invite/friends/SInviteFriends.vue";

export default {
  name: "BDashboardShopInvite",
  components: { SInviteFriends },
  props: {
    modern: { type: Boolean, default: false },
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
.s--shop-invite-modern {
  .sd-modern-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 16px;
    margin-block-end: 20px;
  }
  .sd-modern-title > div {
    min-width: 0;
  }
  &__message {
    margin: 0;
    font-size: 13px;
    line-height: 1.7;
    color: var(--sd-modern-muted);
  }
  &__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-block-start: 24px;
  }
  &__identity {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    color: var(--sd-modern-muted);
    font-size: 13px;
  }
  &__avatar-fallback {
    display: grid;
    width: 100%;
    height: 100%;
    place-items: center;
    background: var(--sd-modern-inset);
  }
}
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>
