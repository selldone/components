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
  <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Receipt Payment Dialog ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

  <v-bottom-sheet
    v-model="showReceiptPayment"
    :width="640"
    content-class="rounded-t-xl overflow-hidden"
    max-width="98vw"
    scrollable
  >
    <v-card
      v-if="receipt_number"
      :color="ThemeColorDark"
      class="scrollable-element-dark text-start"
      min-height="360px"
      theme="dark"
    >
      <u-loading-ellipsis v-if="!receipt" />

      <v-card-title v-if="receipt" class="d-flex align-center">
        {{ $t("receipt_payment_dialog.title") }}
        <v-spacer></v-spacer>
        <u-currency-icon
          :currency="receipt.currency"
          flag
          gradient
        ></u-currency-icon>
      </v-card-title>

      <v-card-text>
        <b-account-transaction-form
          v-if="receipt"
          :receipt-number="receipt.receipt_number"
          @completed="
            () => {
              showReceiptPayment = false;
              receipt_number = null;
            }
          "
        />
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import BAccountTransactionForm from "../../../../account/transaction/form/BAccountTransactionForm.vue";
import ULoadingEllipsis from "../../../../../ui/loading/ellipsis/ULoadingEllipsis.vue";
import UCurrencyIcon from "../../../../../ui/currency/icon/UCurrencyIcon.vue";
import { throttle } from "lodash-es";
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import { EventBus } from "@selldone/core-js/events/EventBus.ts";

export default {
  name: "BAccountReceiptPaymentDialog",
  mixins: [TemplateMixin],

  components: { UCurrencyIcon, ULoadingEllipsis, BAccountTransactionForm },
  props: {},

  data: () => ({
    receipt: null,
    busy: false,

    // Receipt payment dialog:
    showReceiptPayment: false,
    receipt_number: null,
  }),

  watch: {},

  created() {
    EventBus.$on(
      "receipt-payment-dialog",
      throttle((receipt_number) => {
        this.receipt_number = receipt_number;
        this.showReceiptPayment = !!this.receipt_number;

        this.getReceiptInfo();
      }, 800),
    );
  },
  beforeUnmount() {
    EventBus.$off("receipt-payment-dialog");
  },

  methods: {
    getReceiptInfo() {
      this.busy = false;
      this.receipt = null;

      let t = this;

      axios
        .get(window.API.GET_RECEIPT_INFO(this.receipt_number))
        .then(({ data }) => {
          if (!data.error) {
            this.receipt = data.receipt;
          } else {
            t.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          console.error(error);
          t.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
