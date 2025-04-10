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
    <td :colspan="transaction.dir ? 3 : 1" class="py-2">
      <img :src="getShopImagePath(transaction.logo)" class="mx-2" height="24" />
      {{ transaction.name }}
      <b class="ms-2 small">({{ $t("global.commons.payment_not_settled") }})</b>

      <v-chip
        v-if="!transaction.livemode"
        class="mx-2 pointer-event-none my-1"
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

      <i
        v-if="transaction.status === 'Processing'"
        class="fa fa-spinner fa-spin fa-fw mx-2"
      ></i>

      <div
        v-if="
          transaction.status === 'RequireAction' &&
          !transaction.expired &&
          !transaction.cod &&
          !transaction.cash &&
          !transaction.dir
        "
      >
        <v-btn
          class="mx-2 my-1"
          color="primary"
          size="small"
          variant="elevated"
          @click="
            TryToPayOrder(
              transaction.gateway_code,
              transaction.id,
              $route.params.basket_id,
            )
          "
        >
          <v-icon class="me-1" size="small">fa:fas fa-shopping-bag</v-icon>
          {{ $t("global.actions.pay_now") }}
          <img
            v-if="transaction.icon"
            :src="getShopImagePath(transaction.icon)"
            class="ms-2 me-n1"
            height="18"
            width="18"
          />
        </v-btn>

        <v-btn
          class="mx-2 my-1"
          color="#fff"
          size="small"
          variant="elevated"
          @click="changePaymentMethod(transaction)"
        >
          <v-icon class="me-1" size="small">fa:fas fa-credit-card</v-icon>
          {{ $t("global.actions.change_payment_method") }}
        </v-btn>
      </div>

      <!-- ------------------------ Payment receipt in direct payment ----------------------------- -->
      <s-image-uploader
        v-if="transaction.dir && transaction.status !== 'Succeeded'"
        :image="payment_receipt ? getShopImagePath(payment_receipt) : undefined"
        :label="
          payment_receipt
            ? $t('pending_payment.upload_payment_receipt_done')
            : $t('pending_payment.upload_payment_receipt')
        "
        :placeholder-image="
          require('../../../../assets/placeholders/image/payment-check.png')
        "
        :server="
          window.XAPI.POST_UPLOAD_DIRECT_PAYMENT_RECEIPT(
            shop_name,
            transaction.id,
            transaction.currency,
          )
        "
        :extra-params="{
          code: order?.code /*Guest Code*/,
        }"
        allow-image-transform
        auto-compact
        class="mt-2"
        max-file-size="16MB"
        @new-path="
          (path) => {
            transaction.billing_details = { receipt: path };
            transaction.status = 'Processing';
            fetchBasketAndShop();
          }
        "
      ></s-image-uploader>
      <v-img
        v-else-if="transaction.dir && payment_receipt"
        :src="getShopImagePath(payment_receipt)"
        class="pointer-zoom-in rounded-2rem"
        width="240"
        @click="showFullscreen"
      ></v-img>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Public Form Info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <!-- Payment card to card or money transfer bank info in DIR (Direct) payments-->

      <v-card
        v-if="public_form"
        class="p-4 rounded-18px mx-auto"
        flat
        light
        max-width="420"
      >
        <small class="text-black op-0-6">
          {{ $t("pending_payment.public_form_title") }}
          <v-icon size="small">arrow_drop_down</v-icon>
        </small>
        <div v-for="(val, key) in public_form" :key="key" class="py-1">
          <div v-if="key.toLowerCase() === 'qr'" class="text-center">
            <div v-if="val.includes('::')" class="text-start">
              {{ extractLabel(val, key) }}:
            </div>

            <u-qrcode
              :options="{
                width: 280,
                color: { dark: '#333', light: '#FFFFFF00' },
              }"
              :value="extractValue(val)"
            />
          </div>

          <div v-else>
            <p class="mt-2 mb-1 small text-black">
              {{ extractLabel(val, key) }}:
            </p>
            <h3 style="unicode-bidi: plaintext">{{ extractValue(val) }}</h3>
          </div>
        </div>
      </v-card>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Direct Payment > Issue Information ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div v-if="transaction.dir" class="max-widget-width my-3">
        <u-text-value-dashed>
          <template v-slot:label>
            <v-icon class="me-1" style="color: currentColor">loupe</v-icon>
            {{ $t("global.commons.issued_at") }}
          </template>
          {{ getLocalTimeString(transaction.issued_at) }}
        </u-text-value-dashed>

        <u-text-value-dashed>
          <template v-slot:label>
            <v-icon class="me-1" style="color: currentColor"
              >flip_camera_android
            </v-icon>
            {{ $t("global.commons.last_status") }}
          </template>
          {{ getTransactionStatusName(transaction.status) }}
        </u-text-value-dashed>
      </div>
    </td>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Normal Payment > Issue Information ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <td v-if="!transaction.dir" class="text-left">
      <u-price
        :amount="transaction.amount"
        :currency="transaction.currency"
      ></u-price>
    </td>
    <td v-if="!transaction.dir">
      <span class="me-1 small">
        <v-icon class="me-1" size="small" style="color: currentColor"
          >loupe</v-icon
        >
        {{ $t("global.commons.issued_at") }}:</span
      >
      {{ getLocalTimeString(transaction.issued_at) }}
      <br />
      <span class="me-1 small">
        <v-icon class="me-1" size="small" style="color: currentColor"
          >flip_camera_android</v-icon
        >
        {{ $t("global.commons.last_status") }}:</span
      >
      {{ getTransactionStatusName(transaction.status) }}
    </td>
  </tr>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";
import SImageUploader from "../../../../ui/uploader/SImageUploader.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import ImageMixin from "@selldone/components-vue/mixin/image/ImageMixin.ts";

export default {
  name: "SShopRowCustomerPendingPayment",
  mixins: [DateMixin, ImageMixin],
  components: { UTextValueDashed, SImageUploader },
  props: {
    transaction: {
      require: true,
    },
    order: {
      require: true,
    },
  },

  computed: {
    payment_receipt() {
      return (
        this.transaction.billing_details &&
        this.transaction.billing_details.receipt
      );
    },
    public_form() {
      return this.transaction.dir && this.transaction.public_form;
    },
  },
  methods: {
    getTransactionStatusName(status) {
      if (!TransactionStatus[status]) return "NOT FOUND!";
      return this.$t(TransactionStatus[status].name);
    },

    extractLabel(val, def) {
      const arr = val.split("::");
      if (arr.length < 2) return def;
      return arr[0];
    },
    extractValue(val) {
      const arr = val.split("::");
      if (arr.length < 2) return val;
      arr.splice(0, 1);
      return arr.join("::");
    },

    changePaymentMethod(transaction) {
      NotificationService.openConfirmationAlert(
        "Change the payment method",
        "Are you sure about switching payment methods?",
        "Yes, Show payment options",
        () => {
          this.TryToPayOrder(
            transaction.gateway_code,
            transaction.id,
            this.$route.params.basket_id,
            true,
          );
        },
      );
    },
  },
};
</script>

<style scoped></style>
