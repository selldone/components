<template>
  <div class="text-center">
    <span class="display-1 my-3">Waiting for payment...</span>
  </div>
</template>

<script>
import SetupService from "../../../../core/server/SetupService";

export default {
  name: "SPaymentRazorpay",

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
        this.showErrorAlert(null, "Payment package not received!");
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
          user: this.USER() ? this.USER().name /*🥵 User*/ : "Guest" /*🥶 Guest*/,
          address: this.billingAddress,
        },
        theme: {
          color: SetupService.SaminColorDark(),
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
