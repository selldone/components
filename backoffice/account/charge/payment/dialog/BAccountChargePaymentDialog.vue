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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="widget-box">
    <u-widget-header
      :title="$t('account_page.deposit.form.title')"
      icon="add_box"
    ></u-widget-header>

    <v-list-subheader>
      {{ $t("account_page.deposit.form.sub_title") }}
    </v-list-subheader>

    <u-pods-panel color="#fff">
      <u-pod-node icon="credit_card" title="Your Bank"></u-pod-node>
      <u-pod-wire forward></u-pod-wire>

      <u-pod-node is-selldone-icon title="This Wallet"></u-pod-node>
    </u-pods-panel>

    <div v-if="!personal_information_verified" class="py-5">
      <v-icon class="me-1" color="red">warning</v-icon>
      Please, first complete your KYC,
      <span class="text-muted"
        ><v-icon size="small">fingerprint</v-icon> Identity information</span
      >,
      <router-link :to="{ name: 'BPageShuttleIdentity' }"
        ><b>here</b></router-link
      >
      . It takes only 60 seconds.
    </div>
    <!-- ------------------- Deposit Form ------------------- -->

    <u-price-input
      v-model="amount"
      :decimal="currency.floats"
      :disabled="!personal_information_verified"
      :label="`${$t('account_page.deposit.form.amount_input')}*`"
      :messages="`${FormatNumberCurrency(
        amount,
        account.currency,
      )} ${GetUserSelectedCurrencyName(account.currency)}`"
      class="strong-field"
      required
      suffix=""
    >
      <template v-slot:append-inner>
        <u-currency-icon :currency="currency" flag gradient></u-currency-icon>
      </template>
    </u-price-input>

    <b-account-tax
      v-if="personal_information_verified"
      v-model="account.company_id"
      v-model:vat-percent="vat_percent"
      auto-collapse
      has-vat-calculation
      read-only
    >
      <template v-slot:append-inner>
        <div>
          <v-btn
            :to="{
              name: 'BPageAccountEdit',
              params: { account_number: account.account_number },
            }"
            class="nbt"
            >Change linked business profile
            <v-icon class="ms-1">{{ $t("icons.chevron_next") }}</v-icon>
          </v-btn>
        </div>
      </template>
    </b-account-tax>

    <div class="my-5 text-muted small">
      <ul>
        <li>
          You can transfer funds between virtual accounts in Selldone. In this
          case, you should have the virtual account number XXXX-XXXX-XXXX-XXXX.
        </li>
        <li>
          You <b>can not</b> withdraw from your virtual wallets to bank account
          - because of money laundering and legal issues.
        </li>
      </ul>
    </div>

    <div class="widget-buttons">
      <v-btn
        :disabled="!(amount > 0) || !is_available"
        color="primary"
        rounded
        size="x-large"
        stacked
        variant="elevated"
        @click.stop="showDialog()"
      >
        <div>
          {{ $t("account_page.deposit.form.charge_action") }}

          <u-price
            v-if="amount > 0"
            :amount="amount"
            :currency="account.currency"
            class="ms-2"
          >
          </u-price>

          <template v-if="vat > 0">
            <span class="mx-2">+</span>
            <u-price :amount="vat" :currency="account.currency" class="me-1">
            </u-price>
            <span class="small">VAT</span></template
          >
        </div>
        <div v-if="amount <= 0" class="small mt-1">
          ⚠ Please enter an amount to charge.
        </div>
        <div v-if="!is_available" class="small mt-1">
          ⚠ Unfortunately no payment gateway is available.
        </div>
      </v-btn>
    </div>

    <div class="small text-end mt-2 text-muted">
      <v-icon color="green" size="x-small" style="vertical-align: text-top"
        >shield
      </v-icon>
      Payments are secured by
      <img
        height="16"
        src="../../../../../assets/trademark/stripe.svg"
        alt="Stripe"
      />
    </div>

    <!-- ████████████████████████ PAYMENT > Start ████████████████████████ -->

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Select Gateway Dialog ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

    <v-bottom-sheet
      v-model="showSelectGateway"
      max-width="98vw"
      width="640"
      persistent
      scrollable
      content-class="rounded-t-xl"
    >
      <u-payment-form
        v-if="exist_payment_form"
        ref="payment_form"
        :address="payment_form_address"
        :amount="payment_form_amount"
        :available-gateways="gateways"
        :bill="bill"
        :billingAddress="billingAddress"
        :billingEmail="billingEmail"
        :billingName="billingName"
        :billingPhone="billingPhone"
        :currency="currency"
        :discount-code="null"
        :mode="special_payment_mode"
        :order-url="order_url"
        :pack="pack"
        :payment-amount="amount"
        :payment-fields="payment_fields"
        :payment-form-method="payment_form_method"
        :payment-form-url="payment_form_url"
        :qr-code="payment_form_qr_code"
        :timeout="timeout"
        is-official-samin
        @close="delayedHide()"
        @onEndPayment="
          (data) => {
            onFinishCharge(data);
          }
        "
        @select-gateway="depositToAccount"
      />
    </v-bottom-sheet>

    <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Payment Form to submit programmatically ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

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
    <!-- ████████████████████████ PAYMENT > End ████████████████████████ -->
  </div>
</template>

<script lang="ts">
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UPaymentForm from "../../../../../ui/payment/form/UPaymentForm.vue";
import UCurrencyIcon from "../../../../../ui/currency/icon/UCurrencyIcon.vue";
import UPodWire from "../../../../../ui/pod/wire/UPodWire.vue";
import UPodsPanel from "../../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../../ui/pod/node/UPodNode.vue";

import BAccountTax from "../../../../account/tax/BAccountTax.vue";
import { delay } from "lodash-es";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAccountChargePaymentDialog",
  mixins: [CurrencyMixin],
  components: {
    BAccountTax,

    UPodNode,
    UPodsPanel,
    UPodWire,
    UCurrencyIcon,
    UPaymentForm,
    UPriceInput,
  },

  props: {
    account: {
      required: true,
      type: Object,
    },

    gateways: {
      required: true,
      type: Array,
    },
  },

  data: () => ({
    //▅▅▅▅▅▅▅▅▅▅ Payment Config ▅▅▅▅▅▅▅▅▅▅

    special_payment_mode: null, // null , stripe ,

    pack: null,

    amount: 0,
    vat_percent: 0,

    showSelectGateway: false,
    exist_payment_form: false,

    busy_buy: false,

    //▅▅▅▅▅▅▅▅▅▅ Payment Form ▅▅▅▅▅▅▅▅▅▅
    payment_form_method: "GET",
    payment_fields: null,
    payment_form_url: null,

    payment_form_address: null,
    payment_form_amount: null,
    payment_form_qr_code: null,

    timeout: null,
    timeout_instance: null,

    order_url: null, // Redirect url (used for Stripe)

    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingAddress: "",
  }),
  computed: {
    currency() {
      return Currency[this.account.currency];
    },

    vat() {
      /**
       * Calculated Selldone VAT
       */
      return (this.amount * this.vat_percent) / 100;
    },

    bill() {
      return {
        items_price: this.amount,
        sum: this.amount + this.vat,
        currency: this.account.currency,
        tax: this.vat,
        tax_included: this.vat > 0,
        delivery_price: null,
      };
    },

    is_available() {
      return this.gateways.length > 0;
    },

    personal_information_verified() {
      return this.USER().personal_information_verified;
    },
  },

  watch: {},
  created() {
    if (this.$route.query.charge) this.amount = this.$route.query.charge;
  },

  methods: {
    showDialog() {
      this.showSelectGateway = true;
      this.exist_payment_form = true;
    },

    /**
     * ――――――――――――――――――――― Create charge ――――――――――――――――――――
     * Create a charge and transaction for it.
     *
     * @param gateway
     * @param params
     * @param callback_paypal
     */
    depositToAccount({ gateway, params, callback_paypal }) {
      this.busy_buy = true;

      axios
        .post(
          window.API.POST_REQUEST_CHARGE_ACCOUNT(
            this.account.account_number,
            gateway,
          ),
          {
            amount: this.amount,
            ...params,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            // Payment succeeded:
            /* if (data.success) {
                        NotificationService.showSuccessAlert(
                          "Payment confirmed",
                          "Your payment received and processing now."
                        );
                      } else {*/

            // Fill payment form:
            this.fillPaymentForm(data);

            // Billing extract:// TODO: must receive a billing info from server and add this step to dropshipping and basket payment! Feed billing info to stripe!
            this.billingName = this.USER().name;
            this.billingEmail = this.USER().email;
            this.billingPhone = this.USER().phone;
            this.billingAddress = null;

            // Set redirect URL:
            this.order_url = data.order_url;

            // ―――――――― Interval check payment mode ――――――――                Use: blockchain
            if (
              data.interval_check &&
              data.gateway_code &&
              data.transaction_id &&
              data.unique_id &&
              data.timeout &&
              data.interval
            ) {
              // Start poll interval to fetch payment status:
              this.$refs.payment_form.pollIntervalPaymentStatus(
                data.gateway_code,
                data.transaction_id,
                data.unique_id,
                data.timeout * 1000,
                data.interval * 1000,
              );
            }

            // ―――――――― QR Code ――――――――  ➔ Payment by QR code              Use: blockchain
            if (data.address && data.amount && data.qr_code) {
              // 1. Set time out to remove QR code: Time out in form!
              /*  this.timeout_instance = setTimeout(() => {
                          this.delayedHide();
                        }, this.timeout);*/

              // 2. Show success alert:
              NotificationService.showSuccessAlert(
                this.$t("account_page.deposit.notifications.qr_title"),
                this.$t("account_page.deposit.notifications.qr_message", {
                  currency: this.$t(this.currency.name),
                }),
              );
              // 3. Show qr code:
              this.$nextTick(function () {
                this.showSelectGateway = true;
              });
            }

            // ―――――――― Stripe ――――――――    ➔ Payment by Stripe
            else if (data.mode === "stripe") {
              this.pack = data.pack;
              this.$nextTick(function () {
                this.showSelectGateway = true;
              });
            }

            // ―――――――― Paypal ――――――――     ➔ Payment by paypal
            else if (data.mode === "paypal") {
              // Nothing only prevent close form!
            }

            // ―――――――― Other ―――――――― ➔ Payment by online gateway
            else {
              this.delayedHide();
              NotificationService.showSuccessAlert(
                this.$t("master_payment.notifications.pay_title"),
                this.$t(
                  "master_payment.notifications.connecting_to_online_gateway",
                ),
              );
              // Now redirect by auto form submit...
            }
          }

          // Error response:
          else {
            NotificationService.showErrorAlert(null, data.error_msg, data.error_detail);
            this.delayedHide();
          }

          // ➔ Payment by paypal:
          if (data.mode === "paypal") {
            if (callback_paypal) callback_paypal(data, null);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          this.delayedHide();
        })
        .finally(() => {
          this.busy_buy = false;
        });
    },

    onFinishCharge(data) {
      console.log("on finish payment", data);
      this.$emit("request:refresh");
    },

    delayedHide() {
      this.showSelectGateway = false;

      delay(() => {
        this.exist_payment_form = false;

        this.resetToDefault(); // 🞇 Reset to default
      }, 500);
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

      this.payment_form_qr_code = data.qr_code;

      // important for blockchain payment:
      this.timeout = data.timeout * 1000;

      if (data.link && data.method)
        this.$nextTick(() => {
          this.$refs.form_payment_internal.submit();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-size: 1.6rem;
  text-align: right;
}

p {
  text-align: right;
}
</style>
