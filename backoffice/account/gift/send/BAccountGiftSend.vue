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
  <v-bottom-sheet
    v-model="send_gift_dialog"
    content-class="rounded-t-xl rounded-b-0"
    :persistent="busy"
    width="590px"
    max-width="98vw"
    scrollable
  >
    <v-card class="b-account-gift sd-modern-canvas text-start" rounded="t-xl">
      <header class="b-account-gift__header">
        <v-icon size="24" aria-hidden="true">card_giftcard</v-icon>
        <div>
          <h2>{{ $t("shuttle_gifts.send_title") }}</h2>
          <p>{{ $t("shuttle_gifts.send_subtitle") }}</p>
        </div>
        <v-tooltip location="top" content-class="sd-modern-tooltip text-start">
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="sd-modern-icon-button"
              :disabled="busy"
              :aria-label="$t('shuttle_gifts.close')"
              @click="send_gift_dialog = false"
            >
              <v-icon size="18" aria-hidden="true">close</v-icon>
            </button>
          </template>
          {{ $t("shuttle_gifts.close") }}
        </v-tooltip>
      </header>
      <v-form
        ref="form"
        class="b-account-gift__body"
        @submit.prevent="sendGift"
      >
        <div class="b-account-gift__fields sd-modern-widget">
          <b-account-input
            v-model="account_from"
            :chip="false"
            :disabled="busy"
            :label="$t('shuttle_gifts.source_wallet')"
            :rules="[GlobalRules.required()]"
            class="sd-modern-underlined-field"
            variant="underlined"
          ></b-account-input>

          <s-user-input
            v-model="receiver"
            :disabled="busy"
            :label="$t('shuttle_gifts.receiver')"
            :messages="$t('shuttle_gifts.receiver_hint')"
            :rules="[GlobalRules.required()]"
            class="sd-modern-underlined-field"
            placeholder="name@example.com"
            variant="underlined"
          ></s-user-input>

          <u-price-input
            v-model="amount"
            :currency="currency"
            :disabled="!currency || busy"
            :label="$t('shuttle_gifts.amount')"
            :rules="[GlobalRules.required()]"
            class="sd-modern-underlined-field"
            placeholder="0.00"
            required
            variant="underlined"
          />
          <v-textarea
            v-model="message"
            :disabled="busy"
            :label="$t('shuttle_gifts.message_label')"
            :messages="$t('shuttle_gifts.message_hint')"
            class="sd-modern-underlined-field"
            rows="2"
            auto-grow
            max-rows="4"
            counter="256"
            maxlength="256"
            variant="underlined"
          />
        </div>
        <dl v-if="currency" class="b-account-gift__totals">
          <div>
            <dt>{{ $t("shuttle_gifts.gift_amount") }}</dt>
            <dd>
              <u-price :amount="Number(amount) || 0" :currency="currency" />
            </dd>
          </div>
          <div>
            <dt>{{ $t("shuttle_gifts.fee") }}</dt>
            <dd><u-price :amount="fee" :currency="currency" /></dd>
          </div>
          <div class="b-account-gift__total">
            <dt>{{ $t("shuttle_gifts.total_reserved") }}</dt>
            <dd><u-price :amount="totalReserved" :currency="currency" /></dd>
          </div>
        </dl>
        <p class="sd-modern-notice b-account-gift__notice">
          <v-icon size="17" aria-hidden="true">info_outline</v-icon>
          <span class="sd-modern-notice__content">{{
            $t("shuttle_gifts.send_notice")
          }}</span>
        </p>
        <p
          v-if="currency && totalReserved > availableBalance"
          class="sd-modern-notice b-account-gift__notice"
          role="alert"
        >
          <v-icon size="17" color="warning" aria-hidden="true"
            >error_outline</v-icon
          >
          <span class="sd-modern-notice__content">{{
            $t("shuttle_gifts.insufficient_balance")
          }}</span>
        </p>
        <footer class="b-account-gift__actions">
          <v-btn
            class="sd-modern-button"
            variant="text"
            :disabled="busy"
            @click="send_gift_dialog = false"
            >{{ $t("shuttle_gifts.cancel") }}</v-btn
          >
          <v-btn
            :disabled="!canSend"
            :loading="busy"
            type="submit"
            class="sd-modern-button sd-modern-button--primary"
            color="primary"
            prepend-icon="send"
            variant="elevated"
          >
            {{ $t("shuttle_gifts.send_action") }}
          </v-btn>
        </footer>
      </v-form>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import BAccountInput from "../../../account/input/BAccountInput.vue";
import SUserInput from "../../../user/input/SUserInput.vue";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

export default {
  name: "BAccountGiftSend",
  mixins: [TemplateMixin, CurrencyMixin],
  components: { SUserInput, BAccountInput, UPriceInput },
  emits: ["update:modelValue", "sent"],
  props: {
    modelValue: {},
  },

  data: () => ({
    busy: false,

    // send gift:
    send_gift_dialog: false,
    receiver: "",
    amount: 0,
    message: "",
    account_from: null,
  }),

  computed: {
    currency() {
      return this.account_from?.currency;
    },
    fee() {
      return Number.isFinite(Number(this.amount)) && Number(this.amount) > 0
        ? Number(this.amount) * 0.01
        : 0;
    },
    totalReserved() {
      return this.fee ? Number(this.amount) + this.fee : 0;
    },
    availableBalance() {
      if (!this.account_from) return 0;
      const balance = Number(this.account_from.balance);
      const locked = Number(this.account_from.locked);
      return Number.isFinite(balance) && Number.isFinite(locked)
        ? balance - locked
        : 0;
    },
    validGift() {
      return (
        !!this.account_from?.account_number &&
        !!this.currency &&
        typeof this.receiver === "string" &&
        !!this.receiver.trim() &&
        Number.isFinite(Number(this.amount)) &&
        Number(this.amount) > 0 &&
        (this.message || "").length <= 256 &&
        this.availableBalance >= this.totalReserved
      );
    },
    canSend() {
      return this.send_gift_dialog && !this.busy && this.validGift;
    },
  },

  watch: {
    modelValue(value) {
      this.send_gift_dialog = value;
    },
    send_gift_dialog(value) {
      this.$emit("update:modelValue", value);
    },
  },
  created() {
    this.send_gift_dialog = this.modelValue;
  },
  methods: {
    async sendGift() {
      if (!this.canSend) return;
      this.busy = true;
      try {
        const validation = await this.$refs.form?.validate();
        if (
          validation?.valid === false ||
          !this.validGift ||
          !this.send_gift_dialog
        )
          return;
        await axios
          .post(window.API.POST_SEND_GIFT(), {
            receiver: this.receiver,
            amount: this.amount,
            currency: this.currency,
            message: this.message,
            account_number: this.account_from.account_number,
          })
          .then(({ data }) => {
            if (!data.error) {
              NotificationService.showAwardAlert(
                null,
                this.$t("send_gift_dialog.notifications.send_success", {
                  amount: this.FormatNumberCurrency(
                    data.gift.amount,
                    data.gift.currency,
                  ),
                  currency: data.gift.currency,
                  receiver: data.receiver,
                }),
              );
              this.account_from = null;
              this.send_gift_dialog = false;
              this.$emit("sent", data.gift);
            } else {
              NotificationService.showErrorAlert(null, data.error_msg);
            }
          })
          .catch((error) => {
            NotificationService.showLaravelError(error);
          });
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style scoped lang="scss" src="../gift-form.scss"></style>
