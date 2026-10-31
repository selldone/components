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
  <div class="b-account-charge-method">
    <div class="b-account-charge-method__fields">
      <slot name="method" :busy="busy_buy || showSelectGateway" />
      <div
        v-if="!personal_information_verified"
        class="b-account-charge-method__notice"
        role="status"
      >
        <v-icon size="18" aria-hidden="true">person_outline</v-icon>
        <p>
          {{ $t("account_page.deposit.modern.kyc_required") }}
          <router-link :to="{ name: 'BPageShuttleIdentity' }">{{
            $t("account_page.deposit.modern.verify_identity")
          }}</router-link>
        </p>
      </div>
      <!-- ------------------- Deposit Form ------------------- -->
      <div class="b-account-charge-method__amount">
        <label
          :for="`account-charge-bank-${account.account_number}`"
          class="b-account-charge-method__label"
          >{{ $t("account_page.deposit.modern.amount")
          }}<span aria-hidden="true">*</span></label
        >
        <u-price-input
          :id="`account-charge-bank-${account.account_number}`"
          v-model="amount"
          :decimal="currency.floats"
          :disabled="
            !personal_information_verified || busy_buy || showSelectGateway
          "
          :aria-label="$t('account_page.deposit.modern.amount')"
          :aria-describedby="`account-charge-bank-help-${account.account_number}`"
          class="sd-modern-underlined-field"
          required
          hide-details
          variant="underlined"
          suffix=""
          dir="ltr"
          inputmode="decimal"
        >
          <template #append-inner
            ><span>{{ input_currency }}</span></template
          >
        </u-price-input>
        <p
          :id="`account-charge-bank-help-${account.account_number}`"
          class="b-account-charge-method__note"
        >
          {{
            $t("account_page.deposit.modern.amount_help", {
              currency: input_currency,
            })
          }}
          <span v-if="charge_amount > 0">
            · <u-price :amount="charge_amount" :currency="account.currency"
          /></span>
        </p>
      </div>
      <b-account-tax
        v-if="personal_information_verified"
        v-model="account.company_id"
        v-model:vat-percent="vat_percent"
        modern
        auto-collapse
        has-vat-calculation
        read-only
        @update:calculation-state="vat_state = $event"
      >
        <template #append-inner>
          <v-btn
            :to="{
              name: 'BPageAccountEdit',
              params: { account_number: account.account_number },
            }"
            variant="text"
            color="primary"
            class="sd-modern-button sd-modern-button--inline"
          >
            {{ $t("account_page.deposit.modern.company_change")
            }}<v-icon size="16" class="ms-1" aria-hidden="true">{{
              $t("icons.chevron_next")
            }}</v-icon>
          </v-btn>
        </template>
      </b-account-tax>
    </div>
    <aside class="b-account-charge-method__context">
      <div class="b-account-charge-method__wallet"><slot name="account" /></div>
      <div
        class="b-account-charge-method__summary"
        aria-live="polite"
        :aria-busy="vat_state === 'loading'"
      >
        <h3>{{ $t("account_page.deposit.modern.summary") }}</h3>
        <dl class="b-account-charge-method__facts">
          <div>
            <dt>{{ $t("account_page.deposit.modern.wallet_credit") }}</dt>
            <dd>
              <u-price :amount="charge_amount" :currency="account.currency" />
            </dd>
          </div>
          <div>
            <dt>
              {{ $t("account_page.deposit.modern.vat") }}
              <span v-if="vat_state === 'ready'">{{ vat_percent }}%</span>
              <button
                type="button"
                class="sd-modern-info-button"
                :aria-label="$t('account_page.deposit.modern.vat_help')"
              >
                <v-icon size="14" aria-hidden="true">info_outline</v-icon
                ><v-tooltip
                  activator="parent"
                  location="top"
                  content-class="sd-modern-tooltip text-start"
                  open-on-focus
                  open-on-click
                  >{{ $t("account_page.deposit.modern.vat_help") }}</v-tooltip
                >
              </button>
            </dt>
            <dd>
              <u-price
                v-if="vat_state === 'ready'"
                :amount="vat"
                :currency="account.currency"
              /><span v-else>—</span>
            </dd>
          </div>
          <div class="b-account-charge-method__total">
            <dt>{{ $t("account_page.deposit.modern.total") }}</dt>
            <dd>
              <u-price
                v-if="vat_state === 'ready'"
                :amount="bill.sum"
                :currency="account.currency"
              /><span v-else>—</span>
            </dd>
          </div>
        </dl>
        <p
          v-if="personal_information_verified && vat_state !== 'ready'"
          class="b-account-charge-method__note"
        >
          {{
            $t(
              vat_state === "loading"
                ? "account_page.deposit.modern.vat_loading"
                : "account_page.deposit.modern.vat_error",
            )
          }}
        </p>
      </div>
    </aside>
    <div class="b-account-charge-method__actions">
      <p
        v-if="!is_available"
        class="b-account-charge-method__notice"
        role="status"
      >
        {{ $t("account_page.deposit.modern.no_gateway") }}
      </p>
      <v-btn
        :disabled="!can_pay"
        :loading="busy_buy"
        color="primary"
        variant="elevated"
        class="sd-modern-button sd-modern-button--primary"
        prepend-icon="credit_card"
        @click.stop="showDialog()"
        >{{ $t("account_page.deposit.modern.continue_payment") }}</v-btn
      >
      <p class="b-account-charge-method__note">
        {{
          $t(
            charge_amount > 0
              ? "account_page.deposit.modern.provider_next"
              : "account_page.deposit.modern.amount_required",
          )
        }}
      </p>
    </div>
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
      :payment-amount="charge_amount"
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
</template>

<script lang="ts">
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UPaymentForm from "../../../../../ui/payment/form/UPaymentForm.vue";

import BAccountTax from "../../../../account/tax/BAccountTax.vue";
import { delay } from "lodash-es";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAccountChargePaymentFromBank",
  mixins: [CurrencyMixin],
  components: {
    BAccountTax,

    UPaymentForm,
    UPriceInput,
  },

  emits: ["request:refresh"],
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
    vat_state: "loading",

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

    input_currency() {
      const name = this.$t(
        this.account.currency === "IRR"
          ? "transaction_form.modern.rial"
          : this.currency.name,
      );
      return name === this.account.currency
        ? name
        : `${this.account.currency} · ${name}`;
    },
    charge_amount() {
      const amount = Number(this.amount);
      return Number.isFinite(amount) && amount > 0 ? amount : 0;
    },

    can_pay() {
      return (
        this.charge_amount > 0 &&
        Number.isFinite(this.bill.sum) &&
        this.personal_information_verified &&
        this.is_available &&
        this.vat_state === "ready" &&
        !this.busy_buy &&
        !this.exist_payment_form &&
        !this.showSelectGateway
      );
    },

    vat() {
      /**
       * Calculated Selldone VAT
       */
      return (this.charge_amount * this.vat_percent) / 100;
    },

    bill() {
      return {
        items_price: this.charge_amount,
        sum: this.charge_amount + this.vat,
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
    const amount = Number(this.$route.query.charge);
    if (Number.isFinite(amount) && amount > 0) this.amount = amount;
  },

  methods: {
    showDialog() {
      if (!this.can_pay) return;
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
      if (
        !this.charge_amount ||
        !this.personal_information_verified ||
        !this.is_available ||
        this.vat_state !== "ready" ||
        !Number.isFinite(this.bill.sum) ||
        this.busy_buy
      )
        return;
      this.busy_buy = true;

      axios
        .post(
          window.API.POST_REQUEST_CHARGE_ACCOUNT(
            this.account.account_number,
            gateway,
          ),
          {
            ...params,
            amount: this.charge_amount,
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
            NotificationService.showErrorAlert(
              null,
              data.error_msg,
              data.error_detail,
            );
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
      this.$emit("request:refresh");
    },

    delayedHide() {
      this.showSelectGateway = false;

      delay(() => {
        this.exist_payment_form = false;
        // Billing stays mounted, so keep its latest calculation when resetting the payment draft.
        const { vat_percent, vat_state } = this;
        this.resetToDefault(); // 🞇 Reset to default
        this.vat_percent = vat_percent;
        this.vat_state = vat_state;
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

<style lang="scss" scoped></style>
