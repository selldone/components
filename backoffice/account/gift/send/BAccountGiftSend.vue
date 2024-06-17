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
    content-class="rounded-t-xl"
    dark
    width="720px"
    max-width="98vw"
    scrollable
  >
    <v-card :color="SaminColorDarkDeep" class="text-start" rounded="t-xl">
      <v-card-title>
        {{ $t("send_gift_dialog.title") }}
      </v-card-title>

      <v-card-text>
        <b-account-input
          v-model="account_from"
          :chip="false"
          :label="$t('send_gift_dialog.account_from_input')"
          :messages="$t('send_gift_dialog.account_from_input_message')"
          class="max-width-field-large mx-auto my-2"
          variant="outlined"
        ></b-account-input>

        <s-user-input
          v-model="receiver"
          :label="$t('send_gift_dialog.receiver_input')"
          :messages="$t('send_gift_dialog.receiver_input_message')"
          :rules="[GlobalRules.required()]"
          class="max-width-field mx-auto my-4"
          placeholder="john@mail.com or 457151234..."
        ></s-user-input>

        <v-text-field
          v-model="message"
          :label="$t('send_gift_dialog.message_input')"
          :messages="$t('send_gift_dialog.message_input_message')"
          class="max-width-field mx-auto my-4"
          count="256"
          variant="underlined"
        ></v-text-field>

        <u-price-input
          v-model="amount"
          :currency="currency"
          :disabled="!currency"
          :label="$t('send_gift_dialog.amount_input')"
          :outlined="false"
          :rounded="false"
          :rules="[GlobalRules.required()]"
          class="max-width-field mx-auto my-4 strong-field"
          dark
          placeholder="0.00"
          required
          variant="underlined"
        >
        </u-price-input>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            :class="{
              disabled: !amount || !currency || !receiver || !account_from,
            }"
            :loading="busy"
            append-icon="send"
            color="primary"
            prepend-icon="redeem"
            size="x-large"
            variant="elevated"
            @click="sendGift()"
          >
            <u-price
              :amount="amount"
              :currency="currency"
              class="me-2"
            ></u-price>
            {{ $t("send_gift_dialog.send_action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import BAccountInput from "../../../account/input/BAccountInput.vue";
import SUserInput from "../../../user/input/SUserInput.vue";

export default {
  name: "BAccountGiftSend",
  components: { SUserInput, BAccountInput, UPriceInput },
  emits: ["update:modelValue"],
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
    sendGift() {
      if (this.busy) return;
      this.busy = true;
      axios
        .post(window.API.POST_SEND_GIFT(), {
          receiver: this.receiver,
          amount: this.amount,
          currency: this.currency,
          message: this.message,
          account_number: this.account_from.account_number,
        })
        .then(({ data }) => {
          if (!data.error) {
            this.showAwardAlert(
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
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
