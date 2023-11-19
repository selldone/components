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
      <v-icon v-if="sub" class="ms-5 flip-ltr" color="black">keyboard_return</v-icon>


      <img height="24" class="mx-2" :src="getShopImagePath(gateway.icon)" />
      {{ gateway.name }}

      <v-chip v-if="isSubscribed" color="#4CAF50" dark small  class="m-1">   <v-icon small left>credit_score</v-icon> Subscribed</v-chip>
      <v-chip v-if="isUnsubscribed" color="#ddd" dark small  class="m-1">
        <v-icon small left>credit_card_off</v-icon>
        Unsubscribed</v-chip>

    </td>
    <td class="text-left">
      <price-view
        :amount="payment.amount"
        :currency="payment.currency"
      ></price-view>
    </td>
    <td class="subtitle-2">
      <div class="d-flex pt-2 align-items-center">
        <div>
          <payment-card
            v-if="payment.card"
            :method="payment.method"
            :card="payment.card"
            :currency="payment.currency"
            horizontal
          ></payment-card>
          <span v-else-if="payment.cod">{{
            $t("process_center.payment_widget.cod")
          }}</span>

          {{ getLocalTimeString(payment.payment_at) }}
          <s-payment-billing-details
            v-if="payment.billing_details"
            class="min-width-200 mb-2"
            :billing-detail="payment.billing_details"
          ></s-payment-billing-details>
        </div>

        <s-country-world-map
          class="min-width-200 flex-grow-1 m-1"
          v-if="payment.card && payment.card.country"
          :country="payment.card.country"
        ></s-country-world-map>
      </div>
    </td>
  </tr>
</template>

<script>
import PaymentCard from "@components/payment/widgets/PaymentCard.vue";
import SPaymentBillingDetails from "@components/payment/widgets/SPaymentBillingDetails.vue";
import SCountryWorldMap from "@components/map/SCountryWorldMap.vue";
export default {
  name: "SShopRowCustomerPaymentRecord",
  components: { SCountryWorldMap, SPaymentBillingDetails, PaymentCard },
  props: {
    payment: {
      require: true,
    },
    sub: {
      default: false,
      type:Boolean
    },
    isSubscribed: { // Show this payment is subscription (recurring payment)
      default: false,
      type:Boolean
    },

    isUnsubscribed: { // Show this payment is subscription but unsubscribed!
      default: false,
      type:Boolean
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

<style scoped lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-row-customer-payment-record{
  text-align: start;
}
</style>
