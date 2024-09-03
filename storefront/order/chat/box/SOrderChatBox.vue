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
            ? $t("global.order_chat.seller.history.subtitle")
            : $t("global.order_chat.customer.history.subtitle")
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
            ? $t("global.order_chat.seller.new_message.subtitle")
            : $t("global.order_chat.customer.new_message.subtitle")
        }}
      </v-list-subheader>

      <div class="d-flex align-center my-3">
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
        flat
        rounded="xl"
        variant="solo-filled"
      ></v-textarea>

      <div class="widget-buttons">
        <v-btn
          :class="{ disabled: !body_input }"
          :disabled="!body_input"
          :loading="busy_add"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addChat"
        >
          {{ $t("global.actions.send") }}

          <v-icon end class="flip-rtl">send</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- █████████████████████ Secure Order Link █████████████████████ -->

    <div v-if="isAdmin && order_link" class="widget-box -large mb-5">
      <s-widget-header title="Order Link" icon="shopping_bag"></s-widget-header>
      <v-list-subheader>
        You can share the order link with the customer.

        <span v-if="has_guest_checkout">
          Guest shoppers can automatically view their order in the same browser.
          However, if the customer is a guest and you need to share the order
          details, you can create a secure link for them.</span
        >
      </v-list-subheader>

      <u-text-copy-box
        v-if="order_link"
        :value="order_link"
        message="Customer Order URL"
        small-width-mode
      >
        <template v-slot:append-message>
          <v-chip
            size="x-small"
            color="#673AB7"
            label
            variant="flat"
            class="mx-2"
            >Authentication
          </v-chip>
        </template>
      </u-text-copy-box>

      <div v-if="has_guest_checkout" class="position-relative">
        <u-text-copy-box
          :value="secure_link"
          message="Secure Order URL"
          small-width-mode
        >
          <template v-slot:append-message>
            <v-chip
              size="x-small"
              color="#C2185B"
              label
              variant="flat"
              class="mx-2"
              >Guest
            </v-chip>
          </template>
        </u-text-copy-box>
        <div
          v-if="!secure_link"
          style="
            position: absolute;
            left: 8px;
            right: 8px;
            top: 4px;
            bottom: 4px;
            backdrop-filter: blur(8px);
            background-color: #ffffff33;
            border-radius: 18px;
          "
          class="d-flex align-center justify-center text-black pp flex-column"
          @click="createSecureLink"
        >
          Click to create... <small>[valid for 30 days]</small>

          <u-loading-progress
            v-if="busy_secure_link"
            color="blue"
          ></u-loading-progress>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SOrderChatMessage from "../message/SOrderChatMessage.vue";
import UTextCopyBox from "@selldone/components-vue/ui/text/copy-box/UTextCopyBox.vue";
import { ShopOptionsHelper, ShopURLs } from "@selldone/core-js/helper";
import { Product } from "@selldone/core-js";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";
import ProductType = Product.ProductType;

export default {
  name: "SOrderChatBox",

  components: {
    ULoadingProgress,
    UTextCopyBox,
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

    secure_link: null,
    busy_secure_link: false,
  }),

  computed: {
    has_guest_checkout() {
      return ShopOptionsHelper.HasGuestCheckout(this.shop);
    },
    user() {
      return this.USER();
    },
    chat() {
      return this.basket.chat;
    },

    order_link() {
      if (this.basket.type === ProductType.PHYSICAL) {
        return (
          ShopURLs.MainShopUrl(this.shop) +
          `/orders/physical/SM-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.VIRTUAL) {
        return (
          ShopURLs.MainShopUrl(this.shop) +
          `/orders/virtual/SV-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.FILE) {
        return (
          ShopURLs.MainShopUrl(this.shop) + `/orders/file/SF-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.SERVICE) {
        return (
          ShopURLs.MainShopUrl(this.shop) +
          `/orders/service/SS-${this.basket.id}`
        );
      } else if (this.basket.type === ProductType.SUBSCRIPTION) {
        return (
          ShopURLs.MainShopUrl(this.shop) +
          `/orders/subscription/SN-${this.basket.id}`
        );
      }

      return null;
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

            /**
                 This property holds the signature from the URL query parameters.
                 The signature is a cryptographic hash that ensures the integrity and authenticity
                 of the URL, preventing tampering. It's typically generated by shop staff when creating
                 secure, time-limited URLs to display order details.
                 */

            signature: this.$route.query.signature,
            /**
                 This property holds the timestamp from the URL query parameters.
                 The timestamp indicates when the URL was created and is used to ensure the URL's validity
                 within a specific time frame. Like the signature, this is also generated by shop staff
                 when creating secure URLs to display order details.
                 */
            timestamp: this.$route.query.timestamp,
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

    createSecureLink() {
      this.busy_secure_link = true;

      axios
        .post(
          window.API.POST_BASKET_CREATE_SECURE_LINK(
            this.shop.id,
            this.basket.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.secure_link = data.url;
            this.showSuccessAlert(
              null,
              "Secure link has been created successfully.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_secure_link = null;
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
