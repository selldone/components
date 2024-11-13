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
  <div class="text-center">
    <span class="text-h4 my-3">Waiting for payment...</span>
  </div>
</template>

<script lang="ts">
import { SetupService } from "@selldone/core-js/server/SetupService";

export default {
  name: "UPaymentRazorpay",

  props: {
    pack: {
      require: true,
      type: Object,
    },

    currency: {
      require: true,
      type: String,
    },
    amount: {
      require: true,
      type: Number,
    },

    orderUrl: {
      require: true,
      type: String,
    },

    billingName: {},
    billingEmail: {},
    billingPhone: {},
    billingAddress: {},
  },

  mounted() {
    this.payByRazorpay();
  },

  methods: {
    /**
     * ―――――――――――――――――――――― Razorpay > Go to payment link ――――――――――――――――――――
     */
    payByRazorpay() {
      if (!this.pack) {
        NotificationService.showErrorAlert(null, "Payment package not received!");
        return;
      }

      const options = {
        key: this.pack.public_key, // Enter the Key ID generated from the Dashboard
        amount: this.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: this.currency,
        name: this.pack.name,
        description: this.pack.description,
        image: this.pack.image,
        order_id: this.pack.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        callback_url: this.pack.callback_url, // Post method: /payment/razorpay/@{shop_name}/callback
        prefill: {
          name: this.billingName,
          email: this.billingEmail,
          contact: this.billingPhone,
        },
        notes: {
          user: this.USER()
            ? this.USER().name /*🥵 User*/
            : "Guest" /*🥶 Guest*/,
          address: this.billingAddress,
        },
        theme: {
          color: SetupService.ColorThemeDark(),
        },

        remember_customer: true, // Determines whether to allow saving of cards.
      };
      const rzp1 = new Razorpay(options);
      rzp1.open();
    },
  },
};
</script>

<style scoped></style>
