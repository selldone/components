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
  <!-- █████████████████████ Chat Messages █████████████████████ -->

  <div>
    <div v-if="chat" class="widget-box -large mb-5">
      <s-widget-header
        :title="$t('global.commons.messages')"
        icon="3p"
      ></s-widget-header>
      <v-list-subheader>
        {{
          isAdmin
            ? "Messages history between you and the customer."
            : "Messages history between you and the seller."
        }}
      </v-list-subheader>
      <s-order-chat-message
        v-for="(message, i) in chat"
        :key="i"
        :basket="basket"
        :is-admin="isAdmin"
        :message="message"
        :shop="shop"
        class="my-2 c-bubble"
        has-delete
      >
      </s-order-chat-message>
    </div>

    <div class="widget-box -large mb-5">
      <s-widget-header
        :title="$t('global.actions.add_new_message')"
        icon="add_comment"
      ></s-widget-header>
      <v-list-subheader>
        {{
          isAdmin
            ? "Here, you have the ability to directly exchange messages with customers."
            : "Here, you have the ability to directly communicate with the seller by sending messages."
        }}
      </v-list-subheader>

      <div class="d-flex align-center mt-3">
        <v-avatar :size="32" class="avatar-gradient -thin -user me-2">
          <v-img v-if="USER_ID()" :src="getUserAvatar(USER_ID())" />
          <v-icon v-else>account_circle</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <b>{{ user ? user.name : $t("global.commons.guest") }}</b>
          <small class="d-block">{{ $t("global.commons.now") }}</small>
        </div>
      </div>

      <v-textarea
        v-model="body_input"
        :counter="1024"
        :label="$t('global.commons.message')"
        auto-grow
        bg-color="#fafafa"
        flat rounded="xl"
        variant="solo-filled"
      ></v-textarea>

      <div class="widget-buttons">
        <v-btn
          :class="{ disabled: !body_input }"
          :loading="busy_add"
          color="primary"
          size="x-large"
          variant="flat"
          @click="addChat"
        >
          <v-icon start>add</v-icon>
          {{ $t("global.actions.add") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import SOrderChatMessage from "../message/SOrderChatMessage.vue";

export default {
  name: "SOrderChatBox",

  components: {
    SOrderChatMessage,
  },

  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },

    isAdmin: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    busy_add: false,
    body_input: null,
  }),

  computed: {
    user() {
      return this.USER();
    },
    chat() {
      return this.basket.chat;
    },
  },

  watch: {},

  created() {},

  methods: {
    addChat() {
      this.busy_add = true;

      axios
        .post(
          !this.isAdmin
            ? window.XAPI.POST_CUSTOMER_BASKET_CHAT_ADD_MESSAGE(
                this.shop.name,
                this.basket.id,
              )
            : window.API.POST_BASKET_CHAT_ADD_MESSAGE(
                this.shop.id,
                this.basket.id,
              ),
          {
            body: this.body_input,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.body_input = null;
            this.basket.chat = data.chat;
            this.showSuccessAlert(null, "Message has been added successfully.");
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.c-bubble {
  background-color: #fff;
  border-radius: 18px;
  text-align: start;
  padding: 8px 12px;
}
</style>
