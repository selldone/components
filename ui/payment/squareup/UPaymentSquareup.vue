<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
      class="blur-animate"
    >
      <v-tabs v-model="tab" class="mx-n5 mb-6" height="84" stacked>
        <v-tab
          v-for="item in tabs"
          :key="item.title"
          :value="item.value"
          class="border mx-3 rounded-lg tnt"
          style="min-width: 120px"
        >
          {{ item.title }}
          <img
            :src="item.image"
            height="28"
            style="object-fit: contain"
            width="28"
          />
        </v-tab>
      </v-tabs>

      <v-window v-model="tab">
        <v-window-item value="Card" eager>
          <div :id="`card-container-${master_id}`"></div>
          <v-btn
            v-if="square_js_loaded"
            :loading="busy_submit"
            block
            class="mt-2 mb-8"
            color="#0061e0"
            size="x-large"
            @click="handlePaymentSubmit(card)"
            >{{ $t("global.actions.pay") }}
            <u-price
              :amount="amount"
              :currency="currency.toUpperCase()"
              class="mx-2"
            ></u-price>
          </v-btn>
        </v-window-item>

        <v-window-item value="Giftcard" eager>
          <div :id="`gift-container-${master_id}`"></div>

          <v-btn
            :loading="busy_submit"
            block
            class="mt-2 mb-8"
            color="#0061e0"
            size="x-large"
            @click="handlePaymentSubmit(giftCard)"
            >Pay with Gift Card
            <u-price
              :amount="amount"
              :currency="currency.toUpperCase()"
              class="mx-2"
            ></u-price>
          </v-btn>
        </v-window-item>

        <v-window-item value="ACH" eager>
          <v-row class="my-0">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="give_name"
                aria-label="First Name"
                aria-required="true"
                autocomplete="given-name"
                placeholder="Given Name"
                required="required"
                spellcheck="false"
                type="text"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="family_name"
                aria-label="Last Name"
                aria-required="true"
                autocomplete="family-name"
                placeholder="Family Name"
                required="required"
                spellcheck="false"
                type="text"
                variant="outlined"
                hide-details
              />
            </v-col>
          </v-row>

          <v-btn
            :loading="busy_submit"
            block
            class="mt-2 mb-8"
            color="#0061e0"
            size="x-large"
            @click="achClick()"
            >Pay with Bank Account
            <u-price
              :amount="amount"
              :currency="currency.toUpperCase()"
              class="mx-2"
            ></u-price>
          </v-btn>
        </v-window-item>
      </v-window>

      <div id="apple-pay-button"></div>
      <div id="google-pay-button"></div>
      <div id="afterpay-button"></div>

      <v-sheet v-if="!!error_message" class="my-3 text-start pa-3 border">
        <v-icon color="red" class="me-1">cancel</v-icon>
        <span v-html="error_message"> </span>
      </v-sheet>
    </form>

    <!-- ***************** Loading form ************************ -->

    <v-progress-circular
      v-if="!square_js_loaded || !card"
      class="my-5 mx-auto d-block"
      indeterminate
      size="48"
    ></v-progress-circular>

    <u-loading-progress
      v-if="!square_js_loaded || busy_submit"
      color="#000"
    ></u-loading-progress>
  </div>
</template>

<script lang="ts">


import { SetupService } from "@selldone/core-js/server/SetupService";
import {ScriptHelper} from "@selldone/components-vue/plugins/jquery/ScriptHelper";

export default {
  name: "UPaymentSquareup",
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

    master_id: Math.random().toString(36).substring(7),

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

    //----------------------
    give_name: null,
    family_name: null,
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
        ScriptHelper.CachedScript(this.script)
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Square ❱  Load script file start... ▶ status: ${textStatus}`,
            );
            t.square_js_loaded = true;
            t.busy = false;
            console.style(`🔔 ❰ Square ❱  Load script file end`);
            t.initElements();
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Square ❱  Failed to load script file: `,
              exception,
            );
            t.showErrorAlert(null, "Can not load Square script!");
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
      console.log("tokenResult", tokenResult);
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
        this.error_message = `Payment Failed<br><div class="text-subtitle-2">${e.message}</div>`;
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
      try {
        console.log("Initializing Card...");
        this.card = await this.payments.card();
        await this.card.attach(`#card-container-${this.master_id}`);
        console.log("Card initialized successfully.");

      } catch (e) {
        console.error(e);
      }
    },

    //----------------------------------------------------------------------------------------

    async initAch() {
      try {
        console.log(
          "Initializing Ach",
          "redirectURI",
          this.orderUrl,
          "transactionId",
          this.transactionId,
        );
        // Card payments
        this.ach = await this.payments.ach({
          redirectURI: this.orderUrl,
          transactionId: this.transactionId,
        });

        this.ach.addEventListener("ontokenization", (event) => {
          console.log("ontokenization listener", event.detail);
          if (event.detail.error) {
            this.error_message = event.detail.error.message;
          }
          if (!event.detail.tokenResult) return;

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
      // It is expected that the developer performs form field validation
      // which does not occur in this example.
      const accountHolderName = `${this.give_name} ${this.family_name}`;
      console.log("accountHolderName", accountHolderName);

      try {
        await this.ach.tokenize({
          accountHolderName: accountHolderName,
          intent: "CHARGE",
          amount: {
            total: this.amount,
            currencyCode: this.currency,
          },
        });
      } catch (e) {
        console.error("Ach Error!", e);
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
          applePayButton.addEventListener("click", async  (event) =>{
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

        googlePayButton.addEventListener("click", async  (event)=> {
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
        paymentRequest.addEventListener('afterpay_shippingaddresschanged',  ()=> {
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
        afterpayButton.addEventListener("click", async  (event) =>{
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

        await this.giftCard.attach(`#gift-container-${this.master_id}`);
      } catch (e) {
        console.error("Initializing Giftcard failed", e);
      }
    },
  }, // End methods
};
</script>

<style lang="scss" scoped></style>
