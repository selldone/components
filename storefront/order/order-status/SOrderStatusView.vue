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
  <div
    v-if="statusObject"
    class="s--order-status-view"
    :class="{ '-rtl': $vuetify.locale.isRtl }"
  >
    <div class="inline-block position-relative">
      <img
        :src="
          gatewayProcessing
            ? require('../../../assets/icons/gateway-processing.svg')
            : paymentRequireCapture
              ? require('../../../assets/icons/require_capture.svg')
              : statusObject.src
        "
        class="me-1"
        height="24"
        width="24"
        alt="Status"
      />

      <span v-if="processing" class="sup-icon">
        <i class="fa-spin fas fa-cog text-blue" style="font-size: 16px"></i>
      </span>
      <span v-else-if="ticked" class="sup-icon">
        <v-icon color="success" size="small">check_circle</v-icon>
      </span>

      <span v-else-if="canceled" class="sup-icon">
        <v-icon color="red" size="small">cancel</v-icon>
      </span>

      <span v-if="paymentRequireCapture" class="sup-icon"
        ><i
          class="fa-pulse fas fa-spinner text-green"
          style="font-size: 16px"
        ></i
      ></span>
    </div>

    <small class="d-block text-ellipsis">{{ title }}</small>
    <u-time-progress-bar
      v-if="gatewayProcessing"
      :created-time="gatewayProcessing.created_at"
      :end-time="gatewayProcessing.expire_at"
      :start-time="gatewayProcessing.issued_at"
      class="min-width-100"
      small
    ></u-time-progress-bar>
  </div>
  <div v-if="payment?.card" class="d-flex justify-end justify-sm-center">
    <u-payment-card
      :card="payment.card"
      horizontal
      show-country
      small
    ></u-payment-card>
  </div>
</template>

<script lang="ts">
import UTimeProgressBar from "../../../ui/time/progress-bar/UTimeProgressBar.vue";
import { Basket } from "@selldone/core-js";
import UPaymentCard from "@selldone/components-vue/ui/payment/card/UPaymentCard.vue";

export default {
  name: "SOrderStatusView",
  components: { UPaymentCard, UTimeProgressBar },
  props: {
    /**
     * Order status (Payed, ...)
     */
    status: {
      require: true,
    },
    gatewayProcessing: {},

    /**
     * Payment details
     */
    payment: {},

    paymentRequireCapture: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    statusObject() {
      // Tips: For billing status is: PENDING , PAYED , CANCELED  (Is upper case!) TODO: Correct it!
      return Object.values(Basket.Status).find(
        (i) => i.code.toLowerCase() === this.status.toLowerCase(),
      );
    },
    ticked() {
      return [
        Basket.Status.Payed.code.toLowerCase(),
        Basket.Status.COD.code.toLowerCase(),
      ].includes(this.status.toLowerCase());
    },

    canceled() {
      return this.status === Basket.Status.Canceled.code;
    },
    processing() {
      return !!this.gatewayProcessing;
    },
    title() {
      if (this.paymentRequireCapture)
        return this.$t("global.basket_status.payment_require_capture");

      if (
        this.gatewayProcessing &&
        this.gatewayProcessing.transaction_type === "dir"
      )
        return this.$t("global.basket_status.receipt_added");
      else if (this.gatewayProcessing)
        return this.$t("global.basket_status.payment_processing");

      return this.$t(this.statusObject.title);
    },
  },
};
</script>

<style lang="scss" scoped>
// ---------------------------------------- Over icon (Ex. Tick) ----------------------------------------
.s--order-status-view {
  position: relative;
  text-align: center;

  .sup-icon {
    left: -10px;
    top: -5px;
    position: absolute !important;
    background: #fff;
    border-radius: 50%;
    padding: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    min-height: 20px;
    width: 20px;
    height: 20px;
  }

  &.-rtl {
    .sup-icon {
      right: -10px;
      left: unset;
    }
  }
}
</style>
