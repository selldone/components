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
  <tr class="s--shop-row-customer-payment-record">
    <td>
      <v-icon v-if="sub" class="ms-5 flip-ltr" color="black"
        >keyboard_return
      </v-icon>

      <img :src="getShopImagePath(gateway.icon)" class="mx-2" height="24" />
      {{ gateway.name }}

      <v-chip v-if="isSubscribed" class="m-1" color="#4CAF50" variant="flat" size="small">
        <v-icon size="small" start>credit_score</v-icon>
        Subscribed
      </v-chip>
      <v-chip v-if="isUnsubscribed" class="m-1" color="#ddd" variant="flat" size="small">
        <v-icon size="small" start>credit_card_off</v-icon>
        Unsubscribed
      </v-chip>
    </td>
    <td class="text-left">
      <u-price :amount="payment.amount" :currency="payment.currency"></u-price>
    </td>
    <td class="text-subtitle-2">
      <div class="d-flex pt-2 align-items-center">
        <div>
          <u-payment-card
            v-if="payment.card"
            :card="payment.card"
            :currency="payment.currency"
            :method="payment.method"
            horizontal
          ></u-payment-card>
          <span v-else-if="payment.cod">{{
            $t("process_center.payment_widget.cod")
          }}</span>

          {{ getLocalTimeString(payment.payment_at) }}
          <u-payment-billing-details
            v-if="payment.billing_details"
            :billing-detail="payment.billing_details"
            class="min-width-200 mb-2"
          ></u-payment-billing-details>
        </div>

        <u-map-countries-single
          v-if="payment.card && payment.card.country"
          :country="payment.card.country"
          class="min-width-200 flex-grow-1 m-1"
        ></u-map-countries-single>
      </div>
    </td>
  </tr>
</template>

<script>
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import UPaymentBillingDetails from "../../../../ui/payment/billing-details/UPaymentBillingDetails.vue";
import UMapCountriesSingle from "../../../../ui/map/countries/single/UMapCountriesSingle.vue";

export default {
  name: "SShopRowCustomerPaymentRecord",
  components: { UMapCountriesSingle, UPaymentBillingDetails, UPaymentCard },
  props: {
    payment: {
      require: true,
    },
    sub: {
      default: false,
      type: Boolean,
    },
    isSubscribed: {
      // Show this payment is subscription (recurring payment)
      default: false,
      type: Boolean,
    },

    isUnsubscribed: {
      // Show this payment is subscription but unsubscribed!
      default: false,
      type: Boolean,
    },
  },
  computed: {
    gateway() {
      if (!this.payment) return null;
      return this.payment.gateway;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-row-customer-payment-record {
  text-align: start;
}
</style>
