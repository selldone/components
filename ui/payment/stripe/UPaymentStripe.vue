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
      <v-icon size="x-small">arrow_drop_down</v-icon>
      <br />
      <u-price
        :amount="amount"
        :currency="currency.toUpperCase()"
        class="text-h3"
        x-large
      ></u-price>
    </div>

    <!-- ***************** Checkout ************************ -->

    <form :class="{ disabled: busy_pay }">
      <div id="payment-element">
        <!-- Mount the Payment Element here -->
      </div>

      <v-alert
        v-if="!!error_message"
        class="my-3 text-start"
        density="compact"
        type="error"
      >
        {{ error_message }}
      </v-alert>

      <v-btn
        v-if="!loading_form"
        id="submit"
        :class="{ disabled: !form_completed }"
        :loading="busy_pay"
        block
        class="mb-3 mt-8 zoomIn"
        color="#0061e0"
        size="x-large"
        @click="confirmPayment"
        >{{ $t("global.actions.pay") }}
        <u-price
          :amount="amount"
          :currency="currency.toUpperCase()"
          class="mx-2"
        ></u-price>
      </v-btn>
    </form>

    <!-- ***************** Loading form ************************ -->

    <v-progress-circular
      v-if="loading_form"
      class="my-5 mx-auto d-block"
      indeterminate
      size="48"
    ></v-progress-circular>

    <!-- ***************** Processing ************************ -->

    <u-loading-progress v-if="loading_form || busy_pay"></u-loading-progress>
  </div>
</template>

<script lang="ts">
export default {
  name: "UPaymentStripe",
  components: {},

  props: {
    theme: {
      type: Object,
    },

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

    /**
     * {'name' => $name, 'phone' => $phone, 'email' => $email, 'country' => $country, 'state' => $state, 'city' => $city, 'address' => $address, 'no' => $no, 'unit' => $unit, 'postal' => $postal, 'ip' => $ip}
     */
    billingAddress: {}, //Object
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
    address_for_stripe() {
      if (!this.billingAddress?.address || !this.billingAddress?.country)
        return null;
      return {
        line1: this.billingAddress.address,
        line2:
          "No " + this.billingAddress.no + " Unit " + this.billingAddress.unit,
        city: this.billingAddress.city,
        state: this.billingAddress.state,
        country: this.billingAddress.country,
        postal_code: this.billingAddress.postal,
      };
    },
  },

  watch: {},

  created() {},

  mounted() {
    this.stripe = Stripe(this.publicKey);

    const is_custom_theme = !!this.theme?.theme;

    let appearance = {
      theme: this.theme?.theme ? this.theme.theme : "none",
      layout: this.theme?.layout ? this.theme.layout : "tabs", // Can be tabs , accordion
      labels: this.theme?.labels ? this.theme.labels : "above", // Enables switching between labels above form fields and floating labels within the form fields; it can be either above or floating
      variables:
        is_custom_theme || this.theme?.variables
          ? this.theme?.variables
          : {
              fontFamily: ' "Gill Sans", sans-serif',
              fontLineHeight: "1.5",
              borderRadius: "10px",
              colorBackground: "#F6F8FA",
            },
      rules:
        is_custom_theme || this.theme?.rules
          ? this.theme?.rules
          : {
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

    // Remove null values:
    appearance = Object.fromEntries(
      Object.entries(appearance).filter(
        ([key, value]) => value !== null && value !== undefined,
      ),
    );

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

    const _billingDetails = {};
    if (this.billingName) _billingDetails.name = this.billingName;
    if (this.billingEmail) _billingDetails.email = this.billingEmail;
    if (this.billingPhone) _billingDetails.phone = this.billingPhone;
    if (this.address_for_stripe)
      _billingDetails.address = this.address_for_stripe;

    let _defaultValues = {};
    if (Object.values(_billingDetails).length > 0) {
      _defaultValues = {
        billingDetails: _billingDetails,
      };
    }

    const paymentElement = this.elements.create("payment", {
      defaultValues: _defaultValues,
    });
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
