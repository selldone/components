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
  <div
    :class="{ expand: show }"
    :style="{ bottom: bottom + 'px', right: right + 'px' }"
    class="chat-box"
  >
    <v-slide-y-reverse-transition>
      <div v-show="show" class="view-box">
        <v-btn
          v-if="!selected_contact"
          class="absolute-top-end"
          dark
          icon
          @click="show = false"
        >
          <v-icon>highlight_off</v-icon>
        </v-btn>

        <v-btn
          v-else
          :caption="$t('global.actions.back')"
          class="m-1 sub-caption -hover absolute-top-end"
          dark
          icon
          @click="selected_contact = null"
        >
          <v-icon>arrow_back</v-icon>
        </v-btn>

        <!-- Header -->
        <div :class="{ 'h-84': selected_contact }" class="box-header">
          <p class="font-weight-bold">
            <v-avatar class="me-1" size="16">
              <v-img :src="getShopImagePath(shop.icon)" />
            </v-avatar>

            {{ shop.title }}
          </p>

          <u-rating-emoji
            v-if="selected_contact && selected_contact.closed"
            v-model="selected_contact.rate"
            class="mt-1"
            dense
            horizontal
            read-only
            x-small
          ></u-rating-emoji>
        </div>

        <s-contacts-list
          v-if="USER()"
          v-model:selected-contact="selected_contact"
          :shop="shop"
          class="chats thin-scroll"
          is-small
        ></s-contacts-list>
        <s-shop-login v-else :shop="shop" class="chat-login"></s-shop-login>
      </div>
    </v-slide-y-reverse-transition>

    <v-scale-transition origin="center center">
      <v-btn
        v-if="!show"
        :color="SaminColorDark"
        class="chat-btn"
        height="60"
        icon
        variant="flat"
        width="60"
        @click="show = true"
        ><img height="24" src="../../../assets/icons/headphones.svg" width="24"
      /></v-btn>
    </v-scale-transition>
  </div>
</template>

<script>
import SContactsList from "../list/SContactsList.vue";
import SShopLogin from "../../../storefront/login/SShopLogin.vue";
import URatingEmoji from "../../../ui/rating/emoji/URatingEmoji.vue";

/**
 * <s-contacts-popup>
 */
export default {
  name: "SContactsPopup",
  components: { URatingEmoji, SShopLogin, SContactsList },
  props: {
    shop: {
      required: true,
      type: Object,
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

<style lang="scss" scoped>
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
