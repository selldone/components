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
  <div class="pt-3">
    <div class="text-start mb-6">
      <small>{{ $t("global.commons.total_payment") }} </small>
      <v-icon x-small>arrow_drop_down</v-icon><br />
      <price-view
        :amount="amount"
        :currency="currency.toUpperCase()"
        x-large
        class="display-2"
      ></price-view>
    </div>

    <!-- ***************** Checkout ************************ -->

    <form :class="{ disabled: busy_pay }">
      <div id="payment-element">
        <!-- Mount the Payment Element here -->
      </div>

      <v-alert v-if="!!error_message" type="error" class="my-3 text-start" dense>
        {{ error_message }}
      </v-alert>

      <v-btn
        v-if="!loading_form"
        color="#0061e0"
        dark
        x-large
        block
        class="mb-3 mt-8 zoomIn"
        id="submit"
        @click="confirmPayment"
        :loading="busy_pay"
        :class="{ disabled: !form_completed }"
        >{{ $t("global.actions.pay") }}
        <price-view
          :amount="amount"
          :currency="currency.toUpperCase()"
          class="mx-2"
        ></price-view>
      </v-btn>
    </form>

    <!-- ***************** Loading form ************************ -->

    <v-progress-circular
      v-if="loading_form"
      indeterminate
      size="48"
      class="m-3"
    ></v-progress-circular>

    <!-- ***************** Processing ************************ -->

    <progress-loading v-if="loading_form || busy_pay"></progress-loading>
  </div>
</template>

<script>
import SetupService from "../../../../core/server/SetupService";

export default {
  name: "SPaymentStripe",
  components: {},

  props: {
    publicKey: {
      require: true,
      type: String,
    },

    clientSecret: {
      require: true,
      type: String,
    },

    paymentId: {
      require: true,
      type: String,
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

  data: () => ({
    stripe: null,
    elements: null,
    pay_button_loading: false,
    loading_form: true,
    error_message: null,
    busy_pay: false,
    form_completed: false,
  }),

  computed: {
    country_code() {
      if (this.billingAddress && this.billingAddress.country_code)
        return this.billingAddress.country_code;
      return SetupService.DefaultCountry();
    },
  },

  watch: {},

  created() {},

  mounted() {
    this.stripe = Stripe(this.publicKey);

    const appearance = {
      theme: "none",
      variables: {
        fontFamily: ' "Gill Sans", sans-serif',
        fontLineHeight: "1.5",
        borderRadius: "10px",
        colorBackground: "#F6F8FA",
      },
      rules: {
        ".Input": {
          border: "none",
        },
        ".Input:disabled, .Input--invalid:disabled": {
          color: "lightgray",
        },
        ".Tab": {
          padding: "10px 12px 8px 12px",
          border: "none",
        },
        ".Tab:hover": {
          border: "none",
          boxShadow:
            "0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
        },
        ".Tab--selected, .Tab--selected:focus, .Tab--selected:hover": {
          border: "none",
          backgroundColor: "#fff",
          boxShadow:
            "0 0 0 1.5px #262626, 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)",
          color: "#262626",
        },
        ".Label": {
          fontWeight: "500",
        },
      },
    };

    const shop = this.getShop();

    this.elements = this.stripe.elements({
      clientSecret: this.clientSecret,
      appearance,
      business: {
        /**
         * The name of your business. Your business name will be used to render mandate text for some payment methods.
         */
        name: shop?.title ? shop.title : "Selldone",
      },
    });
    const paymentElement = this.elements.create("payment");
    paymentElement.mount("#payment-element");

    paymentElement.on("ready", (event) => {
      // Handle ready event
      // console.log("paymentElement -> ready ...", event);
      this.loading_form = false;
    });

    paymentElement.on("change", (event) => {
      // console.log("paymentElement -> event", event);

      this.form_completed = event.complete;
    });
  },

  methods: {
    confirmPayment() {
      this.busy_pay = true;
      this.error_message = null;
      this.stripe
        .confirmPayment({
          elements: this.elements,
          confirmParams: {
            // Return URL where the customer should be redirected after the PaymentIntent is confirmed.
            return_url: this.orderUrl,

            payment_method_data: {
              billing_details: {
                name: this.billingName,
                email: this.billingEmail,
                phone: this.billingPhone,
                //address:this.billingAddress,
              },
            },
          },
          receipt_email: this.USER()
            ? this.USER().email /*🥵 User*/
            : null /*🥶 Guest*/,
          //Stripe can send an email receipt to your customer using your brand logo and color theme, which are configurable in the Dashboard.
        })
        .then(({ error }) => {
          this.busy_pay = false;

          if (error) {
            if (
              error.type === "card_error" ||
              error.type === "validation_error"
            ) {
              // Inform the customer that there was an error.
              this.error_message = error.message;
            } else {
              this.error_message = error.message;
            }
          } else {
            this.error_message =
              "We had a problem with payment process service.";
            console.error(error);
          }
        });
    },
  }, // End methods
};
</script>

<style lang="scss" scoped></style>
