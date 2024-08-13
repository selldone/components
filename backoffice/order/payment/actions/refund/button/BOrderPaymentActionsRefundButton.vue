<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
  <template v-if="gateway?.actions?.includes('refund')">
    <v-btn
      variant="elevated"
      class="tnt"
      v-bind="$attrs"
      @click="refund_dialog = true"
    >
      <img :src="getShopImagePath(gateway.logo)" height="24" />

      <span class="me-2 ms-1">|</span> {{$t('global.commons.refund')}}
      <u-price
        v-if="suggestedAmount"
        :amount="suggestedAmount"
        :currency="payment.currency"
        class="ms-2"
      ></u-price>
    </v-btn>

    <b-order-payment-actions-refund-dialog
      v-model="refund_dialog"
      :payment="payment"
    ></b-order-payment-actions-refund-dialog>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import BOrderPaymentActionsRefundDialog from "@selldone/components-vue/backoffice/order/payment/actions/refund/dialog/BOrderPaymentActionsRefundDialog.vue";

export default defineComponent({
  name: "BOrderPaymentActionsRefundButton",
  components: { BOrderPaymentActionsRefundDialog, UPrice },

  props: {
    payment: {
      required: true,
      type: Object,
    },
    suggestedAmount: {
      required: false,
      type: Number,
    },
  },

  data() {
    return {
      refund_dialog: false,
    };
  },

  computed: {
    gateway() {
      return this.payment.gateway;
    },
  },
});
</script>

<style scoped lang="scss"></style>
