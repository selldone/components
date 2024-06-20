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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div>
    <!-- ====== Select Gateway Dialog ===== -->

    <v-bottom-sheet
      v-model="showSelectGateway"
      :width="640"
      max-width="98vw"
      persistent
      scrollable
      content-class="rounded-t-xl"
    >
      <u-payment-form
        ref="payment_form_master"
        :address="payment_form_address"
        :amount="payment_form_amount"
        :available-gateways="availableGateways"
        :bill="bill"
        :billingAddress="billingAddress"
        :billingEmail="billingEmail"
        :billingName="billingName"
        :billingPhone="billingPhone"
        :currency="currency"
        :custom-shop-name="mainSellerShop.name"
        :mode="special_payment_mode"
        :order-url="order_url"
        :pack="pack"
        :payment-amount="bill ? bill.sum : 0"
        :payment-fields="payment_fields"
        :payment-form-method="payment_form_method"
        :payment-form-url="payment_form_url"
        @close="showSelectGateway = false"
        @select-gateway="buyCharge"
      />
    </v-bottom-sheet>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Payment Form to submit programmatically ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <form
      ref="form_payment_internal"
      :action="payment_form_url"
      :method="payment_form_method"
      hidden
    >
      <input
        v-for="(item, key) in payment_fields"
        :key="key"
        :name="key"
        :value="item"
        type="hidden"
      />
    </form>
  </div>
</template>

<script>
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UPaymentForm from "../../ui/payment/form/UPaymentForm.vue";

export default {
  name: "DropshipChargePaymentDialog",
  components: { UPaymentForm },

  props: {
    shop: {
      // Admin shop
      required: true,
      type: Object,
    },
    mainSellerShop: {
      // Main seller shop
      required: true,
      type: Object,
    },

    resellerAccount: {
      required: true,
      type: Object,
    },
    availableGateways: {
      required: true,
      type: Array,
    },
    amount: {
      required: true,
    },
  },
  data: () => ({
    special_payment_mode: null, // null , stripe ,

    pack: null,

    busy: false,

    showSelectGateway: false,

    //-------------- Data for create payment ---------------

    type: null,

    product_id: null,
    variant_id: null,

    //-------------- Extra info (For virtual: user_message) ---------------

    extra_info: null,

    //-------------- Selected prize variant ---------------
    prize_selected_variant_id: null,

    //-------------- Payment Form ---------------
    payment_form_method: "GET",
    payment_fields: null,
    payment_form_url: null,

    payment_form_address: null,
    payment_form_amount: null,

    acceptCOD: false,

    //-------------- Payment Progress timeout ---------------

    size: 86,
    paymentQue: [],

    interval: null,

    busy_loading_payment: null,

    order_url: null, // Redirect url (used for Stripe)

    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingAddress: "",
  }),

  computed: {
    bill() {
      return {
        items_price: this.amount,
        sum: this.amount,
        currency: this.resellerAccount.currency,
        tax: 0,
        tax_included: false,
        delivery_price: null,
      };
    },
    currency() {
      return Currency[this.resellerAccount.currency];
    },
  },

  watch: {
    showSelectGateway(show) {
      if (!show) {
        this.$emit("close");
      }
    },
  },

  created() {
    this.showSelectGateway = true;
  },

  mounted() {},

  methods: {
    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Create charge ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬

    buyCharge({ gateway, amount_check, params, callback_paypal }) {
      console.log("gateway", gateway);
      console.log("params", params);

      this.buyBasketProduct(gateway, amount_check, params, callback_paypal);
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― Buy ▶ Charge ―――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    buyBasketProduct(gateway, amount_check, params, callback_paypal) {
      this.busy = true;

      axios
        .post(
          window.API.POST_DROP_SHIPPING_RESELLER_ACCOUNT_CHARGE(
            this.shop.id,
            this.resellerAccount.id,
            gateway,
          ),
          {
            price: amount_check,
            currency: this.currency.code,
            return: window.location.href,

            ...params,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            // Fill payment form:
            this.fillPaymentForm(data);

            // Billing extract:// TODO: must receive a billing info from server and add this step to dropshipping and basket payment! Feed billing info to stripe!
            if (this.USER()) {
              this.billingName = this.USER().name;
              this.billingEmail = this.USER().email;
              this.billingPhone = this.USER().phone;
              this.billingAddress = null;
            }

            // Set redirect URL:
            this.order_url = data.order_url;

            // ➔ Payment by QR code:
            if (data.address) {
              // Show qr code!
              this.showSuccessAlert(
                this.$t("master_payment.notifications.pay_title"),
                this.$t("master_payment.notifications.qr_code_payment"),
              );
            }
            // ➔ Payment by Stripe:
            else if (data.mode === "stripe") {
              this.pack = data.pack;
            }
            // ➔ Payment by paypal:
            else if (data.mode === "paypal") {
              //Nothing only prevent close form!
            }

            // ➔ Payment by online gateway:
            else {
              this.showSelectGateway = false;
              this.showSuccessAlert(
                this.$t("master_payment.notifications.pay_title"),
                this.$t(
                  "master_payment.notifications.connecting_to_online_gateway",
                ),
              );
              // Redirect by BuySellForm!!!
            }
          } else {
            this.showErrorAlert(null, data.error_msg);
            this.showSelectGateway = false;
          }

          // ➔ Payment by paypal:
          if (data.mode === "paypal") {
            if (callback_paypal) callback_paypal(data, null);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
          this.showSelectGateway = false;
        })
        .finally(() => {
          this.busy = false;
        });
    },

    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Handle Data ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    fillPaymentForm(data) {
      this.special_payment_mode = data.mode;
      // Fill payment form:
      this.payment_form_method = data.method;
      this.payment_fields = data.fields;
      this.payment_form_url = data.link;
      this.payment_form_address = data.address;
      this.payment_form_amount = data.amount;

      if (data.link && data.method)
        this.$nextTick(() => {
          this.$refs.form_payment_internal.submit();
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
