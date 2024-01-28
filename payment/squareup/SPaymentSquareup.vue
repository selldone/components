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
        class="text-h3"
      ></price-view>
    </div>

    <!-- ***************** Checkout ************************ -->

    <div
      v-if="success_payment"
      class="pa-3 text-h4 center-absolute text-center zoomIn"
    >
      Payment Successful
    </div>

    <form
      :class="{
        disabled: busy_submit || success_payment,
        'blurred-lg': success_payment,
      }"
      id="payment-form"
      class="blur-animate"
    >
      <v-tabs v-model="tab" light icons-and-text class="mx-n5 mb-6" height="84">
        <v-tabs-slider></v-tabs-slider>

        <v-tab
          v-for="item in tabs"
          :key="item.title"
          :tab-value="item.value"
          class="border mx-3 my-2 rounded-lg tnt"
          style="min-width: 120px"
        >
          {{ item.title }}
          <img
            :src="item.image"
            style="object-fit: contain"
            width="28"
            height="28"
          />
        </v-tab>
      </v-tabs>

      <div id="apple-pay-button"></div>
      <div id="google-pay-button"></div>
      <div id="afterpay-button"></div>

      <div v-show="card && tab === 'Card'">
        <div id="card-container"></div>
        <v-btn
          v-if="square_js_loaded"
          color="#0061e0"
          dark
          x-large
          block
          class="mb-3 mt-8"
          id="submit"
          @click="handlePaymentSubmit(card)"
          :loading="busy_submit"
          >{{ $t("global.actions.pay") }}
          <price-view
            :amount="amount"
            :currency="currency.toUpperCase()"
            class="mx-2"
          ></price-view>
        </v-btn>
      </div>

      <div v-show="tab === 'Giftcard'">
        <div id="gift-card-container"></div>

        <v-btn
          color="#0061e0"
          dark
          x-large
          block
          class="mb-3 mt-8"
          id="submit"
          @click="handlePaymentSubmit(giftCard)"
          :loading="busy_submit"
          >Pay with Gift Card
          <price-view
            :amount="amount"
            :currency="currency.toUpperCase()"
            class="mx-2"
          ></price-view>
        </v-btn>
      </div>

      <div v-show="tab === 'ACH'">
        <fieldset class="buyer-inputs">
          <input
            type="text"
            autocomplete="given-name"
            aria-required="true"
            aria-label="First Name"
            required="required"
            placeholder="Given Name"
            name="givenName"
            spellcheck="false"
          />

          <input
            type="text"
            autocomplete="family-name"
            aria-required="true"
            aria-label="Last Name"
            required="required"
            placeholder="Family Name"
            name="familyName"
            spellcheck="false"
          />
        </fieldset>

        <v-btn
          color="#0061e0"
          dark
          x-large
          block
          class="mb-3 mt-8"
          id="submit"
          @click="achClick()"
          :loading="busy_submit"
          >Pay with Bank Account
          <price-view
            :amount="amount"
            :currency="currency.toUpperCase()"
            class="mx-2"
          ></price-view>
        </v-btn>
      </div>

      <v-alert
        v-if="!!error_message"
        type="error"
        class="my-3 text-start"
        dense
      >
        {{ error_message }}
      </v-alert>
    </form>

    <!-- ***************** Loading form ************************ -->

    <v-progress-circular
      v-if="!square_js_loaded || !card"
      indeterminate
      size="48"
      class="m-3"
    ></v-progress-circular>

    <s-progress-loading
      v-if="!square_js_loaded || busy_submit"
      color="#000"
    ></s-progress-loading>
  </div>
</template>

<script>
import { SetupService } from "@core/server/SetupService";

export default {
  name: "SPaymentSquareup",
  components: {},

  props: {
    script: { require: true, type: String },
    submitUrl: { require: true, type: String },
    appId: {
      // ex. sandbox-sq0...
      require: true,
      type: String,
    },
    transactionId: {
      require: true,
    },

    locationId: {
      // ex. TC4Z3Z...
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
    billingAddress: {},
  },

  data: () => ({
    tab: "Card",

    success_payment: false,
    error_message: null,

    square_js_loaded: false,

    stripe: null,
    elements: null,
    pay_button_loading: false,

    busy_submit: false,

    //----------------------
    payments: null,

    card: null,
    applePay: null,

    googlePay: null,

    giftCard: null,

    ach: null,

    afterpay: null,
  }),

  computed: {
    country_code() {
      if (this.billingAddress?.country_code)
        return this.billingAddress.country_code;
      return SetupService.DefaultCountry();
    },

    tabs() {
      const out = [];
      if (this.card)
        out.push({
          value: "Card",
          title: "Card",
          image: require("./assets/credit-cards.svg"),
        });

      if (this.giftCard)
        out.push({
          value: "Giftcard",
          title: "Giftcard",
          image: require("./assets/giftcard.svg"),
        });

      if (this.ach)
        out.push({
          value: "ACH",
          title: "ACH",
          image: require("./assets/bank.svg"),
        });

      return out;
    },
  },

  watch: {},

  created() {
    this.loadSquareJs();
  },

  mounted() {},

  methods: {
    /**
     * ――――――――――――――――――――― Square > Load JS ――――――――――――――――――――
     */
    loadSquareJs() {
      let t = this;

      try {
        let test = Square; // Check if previously loaded:
        this.square_js_loaded = true;
        this.busy = false;
        console.style(`✔ ❰ Square ❱  Script exist.`);

        this.initElements();
      } catch (e) {
        // Load dynamically:
        $.cachedScript(this.script)
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Square ❱  Load script file start... ▶ status: ${textStatus}`
            );
            t.square_js_loaded = true;
            t.busy = false;
            console.style(`🔔 ❰ Square ❱  Load script file end`);
            t.initElements();
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Square ❱  Failed to load script file: `,
              exception
            );
            this.showErrorAlert(null, "Can not load script!");
          });
      }
    },

    initElements() {
      this.payments = Square.payments(this.appId, this.locationId);

      this.initCard();
      this.initApplePay();
      this.initGooglePlay();
      this.initGiftCard();
      this.initAch();
      this.initAfterPay();
    },

    async tokenize(paymentMethod) {
      const tokenResult = await paymentMethod.tokenize();
      if (tokenResult.status === "OK") {
        return tokenResult.token;
      } else {
        let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
        if (tokenResult.errors) {
          errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
        }

        throw new Error(errorMessage);
      }
    },

    async handlePaymentSubmit(paymentMethod) {
      this.error_message = null;

      try {
        this.busy_submit = true;

        const token = await this.tokenize(paymentMethod);
        console.log("handlePaymentSubmit token", token);

        //statusContainer.innerHTML = "Payment Successful";
        this.success_payment = true;

        this.apiSubmit(token);
      } catch (e) {
        this.busy_submit = false;
        console.error(e);
        this.error_message = "Payment Failed";
      }
    },

    apiSubmit(token) {
      axios
        .post(this.submitUrl, {
          transaction_id: this.transactionId,
          token: token,
        })
        .then(({ data }) => {
          if (!data.error) {
            window.location.href = this.orderUrl;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_submit = false;
        });
    },

    //----------------------------------------------------------------------------------------

    async initCard() {
      // Card payments
      this.card = await this.payments.card();
      await this.card.attach("#card-container");
    },

    //----------------------------------------------------------------------------------------

    async initAch() {
      try {
        // Card payments
        this.ach = await this.payments.ach({
          redirectURI: this.orderUrl,
          transactionId: this.transactionId,
        });

        this.ach.addEventListener("ontokenization", (event) => {
          const { tokenResult, error } = event.detail;

          if (tokenResult.status === "OK") {
            // console.log(`Payment token is ${tokenResult.token}`);

            this.apiSubmit(tokenResult.token);

            //  statusContainer.innerHTML = "Payment Successful";
            this.success_payment = true;
          } else {
            console.error(tokenResult);
            this.error_message = "Payment Failed";
          }
        });
      } catch (e) {
        if (e.name === "PaymentMethodUnsupportedError") {
          console.log(`Ach is unsupported: ${e.message}`);
        } else {
          console.error("Initializing Ach failed", e);
        }
      }
    },
    async achClick() {
      this.busy_submit = true;
      const paymentForm = document.getElementById("payment-form");
      const formData = new FormData(paymentForm);
      // It is expected that the developer performs form field validation
      // which does not occur in this example.
      const accountHolderName = `${formData.get("givenName")} ${formData.get(
        "familyName"
      )}`;

      try {
        await this.ach.tokenize({ accountHolderName });
      } catch (e) {
        console.error(e);
      }
      this.busy_submit = false;
    },

    //----------------------------------------------------------------------------------------

    async initApplePay() {
      try {
        const paymentRequest = this.payments.paymentRequest({
          countryCode: this.country_code,
          currencyCode: this.currency,
          total: {
            amount: "" + this.amount,
            label: "Total",
          },
        });

        this.applePay = await this.payments.applePay(paymentRequest);

        if (this.applePay !== undefined) {
          const applePayButton = document.getElementById("apple-pay-button");
          applePayButton.addEventListener("click", async function (event) {
            await this.handlePaymentSubmit(this.applePay);
          });
        }
      } catch (e) {
        if (e.name === "PaymentMethodUnsupportedError") {
          console.log(`Apple Pay is unsupported: ${e.message}`);
        } else {
          console.error("Initializing Apple Pay failed", e);
        }

        // There are a number of reason why Apple Pay might not be supported.
        // (such as Browser Support, Device Support, Account). Therefore you should
        // handle
        // initialization failures, while still loading other applicable payment
        // methods.
      }
    },

    //----------------------------------------------------------------------------------------

    async initGooglePlay() {
      try {
        const paymentRequest = this.payments.paymentRequest({
          countryCode: this.country_code,
          currencyCode: this.currency,
          total: {
            amount: "" + this.amount,
            label: "Total",
          },
        });

        this.googlePay = await this.payments.googlePay(paymentRequest);

        await this.googlePay.attach("#google-pay-button");
        const googlePayButton = document.getElementById("google-pay-button");

        googlePayButton.addEventListener("click", async function (event) {
          await this.handlePaymentSubmit(this.googlePay);
        });
      } catch (e) {
        if (e.name === "PaymentMethodUnsupportedError") {
          console.log(`Google Play is unsupported: ${e.message}`);
        } else {
          console.error("Initializing Google Play failed", e);
        }

        // There are a number of reason why Apple Pay might not be supported.
        // (such as Browser Support, Device Support, Account). Therefore you should
        // handle
        // initialization failures, while still loading other applicable payment
        // methods.
      }
    },
    //----------------------------------------------------------------------------------------

    async initAfterPay() {
      try {
        const paymentRequest = this.payments.paymentRequest({
          countryCode: this.country_code,
          currencyCode: this.currency,
          total: {
            amount: "" + this.amount,
            label: "Total",
          },
          //  requestShippingContact: true,
        });

        /*
        paymentRequest.addEventListener('afterpay_shippingaddresschanged', function () {
          return {
            shippingOptions: [
              {
                amount: '0.00',
                id: 'shipping-option-1',
                label: 'Free',
                taxLineItems: [
                  {
                    amount: '0.00',
                    label: 'Tax',
                  },
                ],
                total: {
                  amount: '1.00',
                  label: 'total',
                },
              },
            ],
          };
        });*/

        this.afterpay = await this.payments.afterpayClearpay(paymentRequest);
        await this.afterpay.attach("#afterpay-button");

        const afterpayButton = document.getElementById("afterpay-button");
        afterpayButton.addEventListener("click", async function (event) {
          this.handlePaymentSubmit(this.afterpay);
        });
      } catch (e) {
        if (e.name === "PaymentMethodUnsupportedError") {
          console.log(`Afterpay is unsupported: ${e.message}`);
        } else {
          console.error("Initializing Afterpay failed", e);
        }
      }
    },
    //----------------------------------------------------------------------------------------

    async initGiftCard() {
      try {
        this.giftCard = await this.payments.giftCard();

        await this.giftCard.attach("#gift-card-container");
      } catch (e) {
        console.error("Initializing Giftcard failed", e);
      }
    },
  }, // End methods
};
</script>

<style lang="scss" scoped></style>
