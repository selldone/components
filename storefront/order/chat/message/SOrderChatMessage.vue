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
  <article
    v-if="modern"
    class="s-order-chat-message-modern text-start"
    :class="{
      's-order-chat-message-modern--staff': message.officer,
      disabled: busy_delete_message,
    }"
    :aria-busy="busy_delete_message || undefined"
  >
    <v-avatar size="28" class="s-order-chat-message-modern__avatar">
      <v-img v-if="message.user_id" :src="getUserAvatar(message.user_id)" />
      <v-icon v-else size="18" aria-hidden="true">account_circle</v-icon>
    </v-avatar>
    <div class="s-order-chat-message-modern__content">
      <header class="s-order-chat-message-modern__heading">
        <strong class="s-order-chat-message-modern__sender">{{
          message.user_name
        }}</strong>
        <span class="s-order-chat-message-modern__role">
          {{
            $t(
              message.officer
                ? "b_order_chat_box.modern.message_staff"
                : "global.commons.customer",
            )
          }}
        </span>
        <v-tooltip
          location="top"
          content-class="sd-modern-tooltip text-start"
          :open-on-focus="true"
          :open-on-click="true"
        >
          <template #activator="{ props }">
            <time
              v-bind="props"
              :datetime="message.date"
              tabindex="0"
              class="s-order-chat-message-modern__time"
              >{{ getFromNowString(message.date) }}</time
            >
          </template>
          {{ getLocalTimeString(message.date) }}
        </v-tooltip>
      </header>
      <div class="s-order-chat-message-modern__body">{{ message.body }}</div>
    </div>
    <v-tooltip
      v-if="hasDelete && isAdmin && message.officer"
      location="top"
      content-class="sd-modern-tooltip text-start"
      :open-on-focus="true"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="sd-modern-icon-button"
          :aria-label="$t('b_order_chat_box.modern.message_delete')"
          :disabled="busy_delete_message"
          :loading="busy_delete_message"
          icon
          variant="text"
          @click="confirmDeleteMessage()"
        >
          <v-icon size="16" aria-hidden="true">delete_outline</v-icon>
        </v-btn>
      </template>
      {{ $t("b_order_chat_box.modern.message_delete") }}
    </v-tooltip>
  </article>
  <div v-else :class="{ disabled: busy_delete_message }" class="text-start">
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
          color="green"
          label
          size="x-small"
          variant="flat"
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
          variant="flat"
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

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "SOrderChatMessage",
  mixins: [DateMixin],

  inject: ["$shop"],
  props: {
    modern: {
      default: false,
      type: Boolean,
    },
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
    context_unmounted: false,
  }),

  watch: {
    "basket.id"() {
      if (this.modern) this.busy_delete_message = false;
    },
    "$shop.id"() {
      if (this.modern) this.busy_delete_message = false;
    },
    message() {
      if (this.modern) this.busy_delete_message = false;
    },
  },
  beforeUnmount() {
    this.context_unmounted = true;
  },

  methods: {
    confirmDeleteMessage() {
      if (
        !this.hasDelete ||
        !this.isAdmin ||
        !this.message.officer ||
        this.busy_delete_message
      )
        return;

      const message = this.message;
      const basket_id = this.basket.id;
      const shop_id = this.$shop.id;
      NotificationService.openDangerAlert(
        this.$t("b_order_chat_box.modern.message_delete_title"),
        this.$t("b_order_chat_box.modern.message_delete_confirmation"),
        this.$t("global.actions.delete"),
        () => {
          if (!this.context_unmounted && this.message === message && this.basket.id === basket_id && this.$shop.id === shop_id) this.deleteMessage();
        },
      );
    },
    deleteMessage() {
      if (
        this.modern &&
        (!this.hasDelete ||
          !this.isAdmin ||
          !this.message.officer ||
          this.busy_delete_message)
      )
        return;

      const index = this.basket.chat.indexOf(this.message);
      if (this.modern && index < 0) return;

      const modern = this.modern;
      const message = this.message;
      const basket_id = this.basket.id;
      const shop_id = this.$shop.id;
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
            params: {
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
          },
        )
        .then(({ data }) => {
          // A reused message row must not receive another order's chat response.
          if (modern && (this.context_unmounted || this.basket.id !== basket_id || this.$shop.id !== shop_id || this.message !== message)) return;
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.basket.chat = data.chat;
            NotificationService.showSuccessAlert(
              null,
              this.modern
                ? this.$t("b_order_chat_box.modern.message_deleted")
                : "Message has been deleted successfully.",
            );
          }
        })
        .catch((error) => {
          if (modern && (this.context_unmounted || this.basket.id !== basket_id || this.$shop.id !== shop_id || this.message !== message)) return;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (modern && (this.context_unmounted || this.basket.id !== basket_id || this.$shop.id !== shop_id || this.message !== message)) return;
          this.busy_delete_message = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
.s-order-chat-message-modern {
  --sd-modern-icon-button-size: 32px;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 32px;
  align-items: start;
  gap: 10px;
  padding-block: 10px 18px;
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;
  font-weight: 400;

  &__avatar {
    color: var(--sd-modern-muted);
    background: var(--sd-modern-inset);
    border: 1px solid var(--sd-modern-border);
  }

  &__content {
    min-width: 0;
  }

  &__heading {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__sender {
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: 12px;
    font-weight: 500;
    line-height: 19px;
  }

  &__role {
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 18px;
  }

  &__time {
    margin-inline-start: auto;
    color: var(--sd-modern-muted);
    font-size: 11px;
    line-height: 17px;
    font-variant-numeric: tabular-nums;

    &:focus-visible {
      outline: 2px solid rgb(var(--v-theme-primary));
      outline-offset: 3px;
      border-radius: 3px;
    }
  }

  &__body {
    margin-block-start: 6px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font-size: 13px;
    line-height: 21px;
  }

  &--staff &__body {
    padding: 10px 12px;
    background: var(--sd-modern-inset);
    border-radius: 10px;
    border-start-start-radius: 0;
  }

  @media (max-width: 599px), (pointer: coarse) {
    --sd-modern-icon-button-size: 44px;
    grid-template-columns: 28px minmax(0, 1fr) 44px;
    gap: 7px;
  }

  @media (max-width: 599px) {
    &__time {
      width: 100%;
      margin-inline-start: 0;
    }
  }
}
</style>
