<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
    v-bind="$attrs"
    class="my-3 mx-0 mx-md-3 text-start"
    :class="{ widget: last_chat }"
  >
    <template v-if="last_chat">
      <div class="d-flex align-center mb-3">
        <v-avatar :size="32" class="avatar-gradient -thin -staff me-2">
          <v-img
            v-if="last_chat.user_id"
            :src="getUserAvatar(last_chat.user_id)"
          />
          <v-icon v-else>account_circle</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <b>{{ last_chat.user_name }}</b>
          <small class="d-block"
            >{{ getFromNowString(last_chat.date) }} ●
            {{ getLocalDateString(last_chat.date) }}</small
          >
        </div>
      </div>
      <div class="typo-body my-2">
        {{ last_chat.body }}
      </div>
    </template>

    <div class="widget-buttons">
      <v-btn color="primary" size="x-large" @click="dialog_chat = true">
        <v-icon class="me-1">chat</v-icon>
        {{
          last_chat
            ? $t("global.actions.continue_chat")
            : $t("global.actions.add_message")
        }}
      </v-btn>
    </div>
  </div>

  <!-- ██████████████████████ Dialog > Chat ██████████████████████ -->
  <v-dialog
    v-model="dialog_chat"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <v-avatar class="m-2" size="24">
          <v-img :src="getShopImagePath($shop.icon, IMAGE_SIZE_SMALL)" />
        </v-avatar>

        {{ $t("global.commons.chat") }}
      </v-card-title>
      <v-card-text>
        <s-order-chat-box :basket="basket"></s-order-chat-box>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn variant="text" size="x-large" @click="dialog_chat = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SOrderChatBox from "@selldone/components-vue/storefront/order/chat/box/SOrderChatBox.vue";

export default defineComponent({
  name: "SOrderChatWidget",
  components: { SOrderChatBox },
  inject: ["$shop"],

  props: {
    basket: {
      type: Object,
      require: true,
    },
  },
  data: function () {
    return {
      dialog_chat: false,
    };
  },

  computed: {
    chat() {
      return this.basket.chat;
    },

    last_chat() {
      return this.chat && this.chat.length && this.chat[this.chat.length - 1];
    },
  },
});
</script>

<style scoped lang="scss"></style>
