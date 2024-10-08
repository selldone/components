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
  <div :class="{ disabled: busy_delete_message }" class="text-start">
    <div class="d-flex align-center">
      <v-avatar
        :class="{
          '-staff': message.officer,
        }"
        :size="32"
        class="avatar-gradient -thin me-2"
      >
        <v-img v-if="message.user_id" :src="getUserAvatar(message.user_id)" />
        <v-icon v-else>account_circle</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <b>{{ message.user_name }}</b>
        <!-- Show it from admin to customer -->
        <v-chip
          v-if="!isAdmin && message.officer"
          class="mx-2"
          color="#F44336"
          label
          size="x-small"
        >
          {{ $t("global.commons.admin") }}
        </v-chip>
        <!-- Show it from customer to admin -->
        <v-chip
          v-else-if="isAdmin && !message.officer"
          class="mx-2"
          color="#1976D2"
          label
          size="x-small"
        >
          {{ $t("global.commons.customer") }}
        </v-chip>

        <small class="d-block"
          >{{ getFromNowString(message.date) }} ●
          {{ getLocalDateString(message.date) }}</small
        >
      </div>

      <v-btn
        v-if="
          hasDelete &&
          ((isAdmin && message.officer) || (!isAdmin && !message.officer))
        "
        :class="{ disabled: busy_delete_message }"
        :loading="busy_delete_message"
        :title="$t('global.actions.delete')"
        color="red"
        icon
        variant="text"
        @click="deleteMessage()"
      >
        <v-icon>close</v-icon>
      </v-btn>
    </div>
    <div class="typo-body my-2">
      {{ message.body }}
    </div>
  </div>
</template>

<script>
export default {
  name: "SOrderChatMessage",
  emits: ["showSuccessAlert", "showErrorAlert", "showLaravelError"],
  inject:['$shop'],
  props: {

    basket: {
      require: true,
      type: Object,
    },

    isAdmin: {
      default: false,
      type: Boolean,
    },
    message: {
      require: true,
      type: Object,
    },

    hasDelete: {
      default: false,
      type: Boolean,
    },
  },

  data: () => ({
    busy_delete_message: null,
  }),

  methods: {
    deleteMessage() {
      const index = this.basket.chat.indexOf(this.message);

      this.busy_delete_message = true;
      axios
        .delete(
          !this.isAdmin
            ? window.XAPI.DELETE_CUSTOMER_BASKET_CHAT_MESSAGE(
                this.$shop.name,
                this.basket.id,
                index,
              )
            : window.API.DELETE_BASKET_CHAT_MESSAGE(
                this.$shop.id,
                this.basket.id,
                index,
              ),
            {
              params:{
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
              }
            }
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.basket.chat = data.chat;
            this.showSuccessAlert(
              null,
              "Message has been deleted successfully.",
            );
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_message = false;
        });
    },
  },
};
</script>

<style scoped></style>
