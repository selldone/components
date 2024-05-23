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
  <tr
    :class="{
      'bg-amber': transaction.status === 'RequireAction',
      'bg-cyan text-white': transaction.status === 'Processing',
      'bg-red text-white': transaction.status === 'Canceled',
    }"
    class="text-start"
  >
    <td class="py-1">
      <img :src="getShopImagePath(transaction.logo)" class="mx-2" height="24" />
      {{ transaction.name }}
      <b class="ms-2 small">({{ $t("global.commons.payment_not_settled") }})</b>
      <i
        v-if="transaction.status === 'Processing'"
        class="fa fa-spinner fa-spin fa-fw mx-2"
      ></i>

      <v-chip
        class="mx-2 my-1 pointer-event-none"
        color="#fff"
        size="small"
        variant="flat"
      >
        <v-icon
          :color="transaction.livemode ? 'green' : 'amber'"
          size="small"
          start
          >{{ transaction.livemode ? "check" : "science" }}
        </v-icon>
        {{
          transaction.livemode
            ? $t("global.commons.livemode")
            : $t("global.commons.debug")
        }}
      </v-chip>

      <!-- ⬬⬬⬬⬬⬬⬬⬬ DIR Action (Direct payment) ⬬⬬⬬⬬⬬⬬⬬ -->
      <!-- ------------------------ Payment receipt in direct payment ----------------------------- -->

      <div v-if="transaction.dir" class="p-2">
        <div
          v-if="payment_receipt"
          class="d-inline-block pa-2 border rounded-lg"
        >
          <v-img
            :src="getShopImagePath(payment_receipt)"
            class="pointer-zoom-in"
            rounded="lg"
            width="160"
            @click="showFullscreen"
          ></v-img>
        </div>
        <v-alert v-else border="bottom" color="red"
          >{{
            $t(
              "process_center.payment_widget.payment_receipt_not_uploaded_error",
            )
          }}
        </v-alert>

        <p class="mt-2">
          <i class="fas fa-info-circle me-1"></i>
          {{ $t("process_center.payment_widget.dir_pay_info") }}
        </p>

        <v-btn
          :class="{
            disabled:
              transaction.status === TransactionStatus.RequireAction.code,
          }"
          class="my-3"
          color="#fff"
          rounded
          size="large"
          @click="$emit('show-confirm-payment-dir', transaction)"
        >
          <v-icon
            v-if="transaction.status === TransactionStatus.Processing.code"
            class="me-2 blink-me"
            color="success"
            size="small"
            >fiber_manual_record
          </v-icon>

          {{ $t("process_center.payment_widget.action_dir_pay") }}
        </v-btn>
      </div>
    </td>
    <td class="text-left">
      <u-price
        :amount="transaction.amount"
        :currency="transaction.currency"
      ></u-price>
    </td>
    <td class="text-subtitle-2">
      {{ $t("global.commons.issued_at") }}:
      {{ getLocalTimeString(transaction.issued_at) }}
      <br />
      {{ $t("global.commons.last_status") }}: {{ transaction.status }}
    </td>
    <td class="text-center">
      <v-btn
        v-if="transaction.unique_id"
        :loading="busyCheck"
        class="mx-2"
        size="small"
        variant="flat"
        @click="
          $emit('check:payment', {
            gateway_code: transaction.gateway_code,
            unique_id: transaction.unique_id,
            gateway_name: transaction.name,
          })
        "
      >
        <v-icon>refresh</v-icon>
        check
        <img
          :src="getShopImagePath(transaction.logo)"
          class="mx-1"
          height="20"
        />
      </v-btn>
    </td>
  </tr>
</template>

<script>
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";

export default {
  name: "BOrderPaymentRowPending",
  props: {
    transaction: {
      require: true,
    },
    busyCheck: {},
  },
  data: () => ({
    TransactionStatus: TransactionStatus,
    dialog_confirm_dir: false,
  }),

  computed: {
    payment_receipt() {
      return (
        this.transaction.billing_details &&
        this.transaction.billing_details.receipt
      );
    },
  },
};
</script>

<style scoped></style>
