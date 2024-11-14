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
  <v-card class="text-start" flat>
    <v-card-title></v-card-title>
    <v-card-text>
      <div class="widget-box mb-5">
        <u-widget-header
          icon="remove_shopping_cart"
          :title="$t('vendor_order_refund.title')"
        >
        </u-widget-header>

        <v-list-subheader>
          <div v-html="$t('vendor_order_refund.subtitle')"></div>
        </v-list-subheader>

        <!-- Visual fund flow -->
        <div class="text-center d-flex align-center justify-center" dir="ltr">
          <div class="min-width-100">
            <v-icon>business</v-icon>
            <small class="d-block">{{ $t("global.commons.you") }}</small>
          </div>
          <v-icon class="rotate-180 mb-4">trending_flat</v-icon>
          <div class="min-width-100">
            <v-icon>wallet</v-icon>
            <small class="d-block">{{
              $t("global.commons.vendor_wallet")
            }}</small>
          </div>
        </div>

        <u-currency-input
          :label="$t('global.commons.currency')"
          :return-object="false"
          :model-value="currency"
          disabled
          variant="underlined"
        ></u-currency-input>
        <u-price-input
          v-model="amount"
          :currency="currency"
          :error-messages="
            amount > sum_transactions
              ? $t('vendor_order_refund.inputs.amount.error_message')
              : undefined
          "
          :label="$t('global.commons.amount')"
          :messages="`Remains amount: ${sum_transactions} ${currency}`"
          class="strong-field"
          variant="underlined"
        ></u-price-input>

        <v-textarea
          v-model="note"
          :label="$t('global.commons.note')"
          append-inner-icon="sticky_note_2"
          auto-grow
          :messages="$t('vendor_order_refund.inputs.note.message')"
          persistent-placeholder
          :placeholder="$t('vendor_order_refund.inputs.note.placeholder')"
          rows="2"
          variant="underlined"
        >
        </v-textarea>
        <u-smart-suggestion
          :samples="$tm('suggestions.vendor_refund_order.note')"
          @select="(v) => (note = v)"
        ></u-smart-suggestion>
      </div>
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :class="{ disabled: !amount || amount > sum_transactions }"
          :loading="busy"
          color="red"
          size="x-large"
          variant="flat"
          @click="reverseTransfer"
        >
          <v-icon class="me-1"> money_off</v-icon>
          {{
            amount >= sum_transactions
              ? $t("global.actions.refund")
              : $t("global.actions.partial_refund")
          }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";


export default {
  name: "BVendorOrderRefund",
  mixins: [],
  components: {
    USmartSuggestion,
    UCurrencyInput,
    UPriceInput,
  },
  props: {
    shop: {
      required: true,
    },

    vendorOrder: {
      require: true,
      type: Object,
    },
  },
  data: () => ({
    busy: false,

    amount: 0,
    note: null,
  }),
  computed: {
    currency() {
      return this.vendorOrder.currency;
    },
    payments() {
      return this.vendorOrder.payments;
    },

    transactions() {
      return this.vendorOrder.transactions;
    },

    sum_transactions() {
      return this.transactions.sumByKey("amount");
    },

    /*
       sum_payments() {
      return this.payments.sumByKey("amount");
    },

    remains_amount() {
      return this.sum_payments;
    },*/
  },

  watch: {
    payment() {
      this.assign();
    },
  },

  created() {},

  methods: {
    //――――――――――――――――――――――― Revers transfer ―――――――――――――――――――――――
    reverseTransfer() {
      this.busy = true;

      axios
        .post(
          window.API.POST_BASKET_REFUND_VENDOR_ORDER(
            this.shop.id,
            this.vendorOrder.id,
          ),
          {
            currency: this.currency,
            amount: (this.reverse ? -1 : 1) * this.amount,
            note: this.note,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.$emit("add:transaction", data.transaction);
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
