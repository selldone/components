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
  <div
    class="chat-box"
    :style="{ bottom: bottom + 'px', right: right + 'px' }"
    :class="{ expand: show }"
  >
    <v-slide-y-reverse-transition>
      <div v-show="show" class="view-box">
        <v-btn
          v-if="!selected_contact"
          icon
          @click="show = false"
          class="absolute-top-end"
          dark
          ><v-icon>highlight_off</v-icon></v-btn
        >

        <v-btn
          v-else
          @click="selected_contact = null"
          class="m-1 sub-caption -hover absolute-top-end"
          :caption="$t('global.actions.back')"
          icon
          dark
          ><v-icon>arrow_back</v-icon></v-btn
        >

        <!-- Header -->
        <div class="box-header" :class="{ 'h-84': selected_contact }">
          <p class="font-weight-bold">
            <v-avatar class="me-1" size="16">
              <v-img :src="getShopImagePath(shop.icon)" />
            </v-avatar>

            {{ shop.title }}

            <v-btn
              v-if="isAdmin && $route.name !== 'ShopUsers_ContactForm'"
              class="ms-2 zoomIn"
              icon
              :to="{ name: 'ShopUsers_ContactForm' }"
              tile
              title="Open contacts page"
              dark
              small
              ><v-icon small>launch</v-icon></v-btn
            >
          </p>

          <emoji-rating
            v-if="selected_contact && selected_contact.closed"
            v-model="selected_contact.rate"
            x-small
            dense
            class="mt-1"
            read-only
            horizontal
          ></emoji-rating>
        </div>

        <shop-chats-list
          v-if="USER()"
          is-small
          class="chats thin-scroll"
          :shop="shop"
          :selected-contact.sync="selected_contact"
          :is-admin="isAdmin"
        ></shop-chats-list>
        <s-shop-login v-else class="chat-login"></s-shop-login>
      </div>
    </v-slide-y-reverse-transition>

    <v-scale-transition origin="center center">
      <v-btn
        class="chat-btn"
        v-if="!show"
        @click="show = true"
        fab
        height="60"
        width="60"
        depressed
        :color="SaminColorDark"
        ><img
          width="24"
          height="24"
          src="../../assets/icons/headphones.svg"
      /></v-btn>
    </v-scale-transition>
  </div>
</template>

<script>
import ShopChatsList from "./ShopChatsList.vue";
import SShopLogin from "@components/login/SShopLogin.vue";
import EmojiRating from "@components/ui/rating/emoji-rating/EmojiRating.vue";

export default {
  name: "ShopContactsChatPopup",
  components: { EmojiRating, SShopLogin, ShopChatsList },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    isAdmin: {
      default: false,
      type: Boolean,
    },
    bottom: {
      default: 8,
    },
    right: {
      default: 24,
    },
  },

  data: () => ({
    show: false,
    selected_contact: null,
  }),
};
</script>

<style scoped lang="scss">
.chat-box {
  position: fixed;
  bottom: 8px;
  right: 24px;
  z-index: 99; //999 : overlap by dialogs!
  //max-height: calc(100vh - 32px);
  transition: all 0.6s ease-in-out;
  display: flex;
  flex-direction: column;
  max-height: 800px;

  &.expand {
    @media screen and (max-width: 500px) {
      max-width: 100%;
      left: 0;
      right: 0 !important;
      padding: 0px !important;
      .view-box {
        width: 100% !important;
        max-width: 100% !important;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
    }
    @media screen and (max-height: 800px) {
      max-height: 100%;
      height: 100%;
      top: 0;
      right: 0 !important;
      padding: 8px;
      .view-box {
        height: 100%;
        max-height: 100%;
      }
    }

    z-index: 99999999;
  }

  .view-box {
    width: 400px;
    // height: 680px;
    // max-height: calc(100% - 16px);
    max-width: calc(100vw - 48px);
    background: #fff;
    box-shadow: 0 12px 20px 0 rgba(0, 0, 0, 0.15) !important;
    transition: all 0.65s;

    z-index: 99;
    position: relative;
    border-radius: 18px;
    overflow: hidden;

    display: flex;
    flex-direction: column;

    .box-header {
      border-bottom: solid thin #1c1520;
      padding: 12px 8px;
      background-color: var(--theme-dark);
      color: #fff;
      //
      text-align: start;

      &.h-84 {
        height: 84px;
      }
      p {
        margin: 0;
      }
    }

    .chats {
      padding: 0 8px 12px 8px;
      overflow-y: auto;
      flex-grow: 1;
      min-height: 50vh;
    }
    .chat-login {
      height: 550px;
      max-height: calc(100vh - 130px);
      padding: 0 8px;
      scrollbar-width: thin;
      overflow-y: auto;
      background-color: #fafafa;
    }
  }
  .chat-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 998;
  }
}
</style>
