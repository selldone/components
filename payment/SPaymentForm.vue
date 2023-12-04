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
  <!-- ========================== Payment Methods ========================== -->

  <v-card
    tile
    style="
      position: relative;
      border-radius: 18px 18px 0 0 !important;
      min-height: 180px !important;
    "
    class="overflow-hidden"
  >
    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Top Bar ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-toolbar v-if="!busy && !qrCode" flat color="transparent">
      <currency-icon :currency="currency" gradient></currency-icon>

      <v-toolbar-title class="body-title px-3">
        {{ $t("global.payment_form.title") }}
        <b v-if="currency"
          >| {{ currency.code }} <flag :iso="currency.flag" :squared="false"
        /></b>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Success timeout ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <time-lapse
          v-if="success_end_countdown"
          :duration-ms="8000"
          color="green"
          class="ms-2"
          width="3"
          size="20"
          @end="$emit('close')"
        >
        </time-lapse>
      </v-toolbar-title>

      <v-spacer />

      <img
        v-if="hasClub && getClub()"
        :src="getCustomerClubLevel(getClub().level).icon"
        width="32px"
        height="32px"
      />

      <circle-button
        class="z2"
        icon="close"
        :tooltip="$t('global.actions.close')"
        @click="$emit('close')"
      />
    </v-toolbar>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Loading View ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <div v-if="busy" class="py-8 text-muted">
      <s-progress-loading> </s-progress-loading>

      <b class="d-block text-success mb-1">
        <v-icon class="me-1" color="success">shield</v-icon>
        {{ $t("global.commons.creating_secure_payment") }}</b
      >
      {{ $t("global.commons.waiting_connecting_payment") }}
    </div>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Paypal ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="in_paypal_message">
      <v-alert v-if="paypal_success_message" type="success" class="mt-3">
        <h3 class="mb-2">Payment completed</h3>
        <p class="small">Thanks for your order!</p>
        {{ paypal_success_message }}
      </v-alert>

      <v-alert v-if="paypal_error_message" type="error">
        <h3>Oops, payment failed.</h3>
        <p class="small">
          It looks like your order could not be paid at this time. Please try
          again or select a different payment option.
        </p>
        {{ paypal_error_message }}

        <v-btn class="m-2" @click="reset()">Back to payment</v-btn>
      </v-alert>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Normal Form ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
    <v-card-text
      v-if="
        !busy &&
        !qrCode &&
        !isStripe &&
        !in_paypal_message &&
        !isRazorpay &&
        !isPayPalStandard &&
        !isMercadopago &&
        !isPaymob &&
        !isSquareup
      "
    >
      <div>
        <!-- Gift Cards -->
        <select-gift-cards
          class="mt-3"
          v-model="selected_gift_cards"
          v-if="hasGiftCardField && !isFree"
          :gift-cards="giftcards"
          multiple
          return-object
          rounded
          filled
          :loading="busy_gift_cards"
        >
        </select-gift-cards>

        <div class="text-start">
          <small>{{ $t("global.commons.total_payment") }} </small>
          <v-icon x-small>arrow_drop_down</v-icon><br />

          <div class="d-flex align-center">
            <price-view
              :amount="total_amount_remain_for_pay"
              :currency="currency.code"
              class="display-2"
            ></price-view>

            <v-chip
              v-if="isSelldoneSubscription"
              label
              color="#111"
              dark
              small
              class="ma-2"
              ><v-icon small left>add_card</v-icon> Add card to the
              wallet.</v-chip
            >
            <v-tooltip v-else-if="bill" top color="transparent">
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                  small
                  class="ms-2"
                  style="vertical-align: top"
                  ><v-icon small>info</v-icon></v-btn
                >
              </template>

              <v-simple-table dense class="border rounded-18px">
                <template v-slot:default>
                  <tbody class="text-start">
                    <tr>
                      <td>{{ $t("global.commons.amount") }}</td>

                      <td>
                        <price-view
                          :amount="bill.items_price"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>

                    <tr v-if="bill.items_discount">
                      <td>
                        <v-icon small>fas fa-gift</v-icon>
                        {{ $t("global.commons.discount") }}
                      </td>

                      <td>
                        <price-view
                          :amount="-bill.items_discount"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>

                    <tr v-if="bill.offer">
                      <td>
                        <v-icon small>fas fa-gift</v-icon>
                        {{ $t("global.commons.offer") }}
                      </td>

                      <td>
                        <price-view
                          :amount="-bill.offer"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>

                    <tr v-if="bill.delivery_price !== null">
                      <td>
                        <v-icon small>fas fa-shipping-fast</v-icon>
                        {{ $t("global.commons.shipping") }}
                      </td>

                      <td>
                        <price-view
                          v-if="bill.delivery_price >= 0"
                          :amount="bill.delivery_price"
                          :currency="currency.code"
                        ></price-view>
                        <span v-else>{{ $t("global.commons.not_paid") }}</span>
                      </td>
                    </tr>

                    <tr v-if="bill.discount_code">
                      <td>
                        <v-icon small>fas fa-percentage</v-icon>
                        {{ $t("global.commons.discount_code") }}
                      </td>
                      <td>
                        <price-view
                          :amount="-bill.discount_code"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>
                    <tr v-if="bill.club">
                      <td>
                        <v-icon small>fas fa-gem</v-icon>
                        {{ $t("global.commons.customer_club") }}
                      </td>
                      <td>
                        <price-view
                          :amount="-bill.club"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>
                    <tr v-if="bill.coupon">
                      <td>
                        <v-icon small>fas fa-ticket-alt</v-icon>
                        {{ $t("global.commons.coupon") }}
                      </td>
                      <td>
                        <price-view
                          :amount="-bill.coupon"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>

                    <tr v-if="bill.lottery">
                      <td>
                        <v-icon small>fas fa-dice</v-icon>
                        {{ $t("global.commons.prize") }}
                      </td>
                      <td>
                        <price-view
                          :amount="-bill.lottery"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>

                    <tr v-if="bill.tax">
                      <td>
                        <v-icon small>fas fa-coins</v-icon>
                        {{ $t("global.commons.tax") }}
                      </td>
                      <td>
                        <price-view
                          v-if="!bill.tax_included"
                          :amount="bill.tax"
                          :currency="currency.code"
                        ></price-view>
                        <span v-else>{{
                          $t("global.commons.tax_included")
                        }}</span>
                      </td>
                    </tr>

                    <tr v-if="total_amount_by_gift_cards">
                      <td>
                        <v-icon small>card_giftcard</v-icon>
                        {{ $t("global.commons.gift_card") }}
                      </td>
                      <td>
                        <price-view
                          :amount="-total_amount_by_gift_cards"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>
                    <tr style="border-top: #fff solid 2px">
                      <td>{{ $t("global.commons.sum") }}</td>
                      <td class="font-weight-bold">
                        <price-view
                          :amount="total_amount_remain_for_pay"
                          :currency="currency.code"
                        ></price-view>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-tooltip>
          </div>
        </div>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Charge Gift Cards ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <p v-if="total_amount_by_gift_cards > 0" class="mb-1 mt-2">
          <i
            class="text-success mx-1"
            :class="{
              'fas fa-circle-notch': total_amount_remain_for_pay > 0,
              'fas fa-circle': total_amount_remain_for_pay === 0,
            }"
          />
          {{ $t("global.payment_form.pay_amount_by_gift_cards") }}
          :

          <span class="text-success">
            {{
              FormatNumberCurrency(total_amount_by_gift_cards, currency.code)
            }}
          </span>

          <span class="small">
            {{ GetUserSelectedCurrencyName(currency.code) }}</span
          >
        </p>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Free payment ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <div v-if="isFree">
          <p class="m-2 small">
            {{ $t("global.payment_form.order_free_payment") }}
          </p>

          <payment-button
            class="m-auto pointer-pointer"
            pos=""
            small
            purple
            @click="
              () => {
                $emit('select-gateway', {
                  gateway: 'gift',
                  amount_check: final_payment, // Must check by server! For validate price calculated in client side! important!
                  gift_cards: getGiftCardsList(),
                  params: null,
                });
                busy = true;
              }
            "
          >
            <p class="font-weight-black m-0">
              {{ $t("global.payment_form.order_free_payment_action") }}
            </p>
            <img
              class="mx-2"
              src="@components/assets/icons/free-badge.svg"
              :width="24"
            />
            {{ $t("global.commons.free") }}
          </payment-button>
        </div>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Paypal (Instance payment form) ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <v-expand-transition>
          <v-card-text
            v-show="
              isBraintree &&
              !selected_gateway &&
              !isFree &&
              total_amount_remain_for_pay > 0
            "
          >
            <v-expansion-panels light :value="0" flat>
              <v-expansion-panel class="border rounded-18px">
                <v-expansion-panel-header>
                  <span>Secure Payment Form</span>
                  <s-loading
                    light
                    css-mode
                    v-if="!paypal_js_loaded || busy_get_paypal_client_token"
                  >
                  </s-loading>
                </v-expansion-panel-header>
                <v-expansion-panel-content style="border-radius: 12px">
                  <div>
                    <div dir="ltr" id="braintree-dropin-container"></div>

                    <v-btn
                      v-if="paypal_instance"
                      class="mt-3"
                      :loading="busy_paypal_submit"
                      color="#0061e0"
                      dark
                      block
                      x-large
                      depressed
                      @click="PayPalSubmit"
                      id="braintree-submit-button"
                    >
                      {{ $t("global.actions.pay") }}
                      <price-view
                        class="mx-2"
                        :amount="total_amount_remain_for_pay"
                        :currency="currency.code"
                      ></price-view>
                    </v-btn>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-expand-transition>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Select Gateway ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
        <v-slide-y-reverse-transition hide-on-leave>
          <div v-if="total_amount_remain_for_pay > 0 || isSelldoneSubscription">
            <p class="small text-start border-top-dashed pt-2 mb-2 mt-2">
              {{
                isBraintree
                  ? "Other payment methods"
                  : $t("global.payment_form.select_payment_method")
              }}:
            </p>

            <v-row justify="center">
              <v-col
                v-for="gateway in gateways"
                :key="gateway.code"
                class="px-1 py-2"
                cols="12"
                sm="6"
              >
                <payment-button
                  class="m-auto pointer-pointer"
                  :pos="GetUserSelectedCurrencyName(gateway.currency, true)"
                  small
                  :blue="gateway.cod"
                  @click="
                    () => {
                      $emit('select-gateway', {
                        gateway: gateway.code,
                        amount_check: final_payment, // Must check by server! For validate price calculated in client side! important!
                        gift_cards: getGiftCardsList(),
                        params: null,
                      });
                      busy = true;
                      selected_gateway = gateway.code;
                    }
                  "
                >
                  <p class="font-weight-black m-0">
                    {{
                      gateway.dir
                        ? $t("global.actions.dir_payment")
                        : gateway.cod
                        ? $t("global.actions.cod_payment")
                        : $t("global.actions.online_payment")
                    }}
                  </p>
                  <img
                    class="mx-2"
                    :src="getShopImagePath(gateway.icon)"
                    :width="24"
                  />
                  {{ gateway.name }}
                </payment-button>
              </v-col>
            </v-row>

            <div v-if="!gateways || !gateways.length">
              <img
                src="@components/assets/emotions/013-disappointed.svg"
                class="m-2"
                :width="48"
              /><br />

              Sorry, payment with <b>{{ currency.code }}</b> not supported. We
              can not find any gateway for the selected currency.
            </div>
          </div>
        </v-slide-y-reverse-transition>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Gift pay ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
        <v-slide-y-transition hide-on-leave>
          <div
            v-if="
              total_amount_remain_for_pay === 0 &&
              !isFree &&
              !isSelldoneSubscription
            "
          >
            <p class="mx-2 small">
              {{ $t("global.payment_form.all_paid_by_gift_cards") }}
            </p>

            <payment-button
              class="m-auto pointer-pointer"
              pos=""
              small
              purple
              @click="
                () => {
                  $emit('select-gateway', {
                    gateway: 'gift',
                    amount_check: final_payment, // Must check by server! For validate price calculated in client side! important!
                    gift_cards: getGiftCardsList(),
                    params: null,
                  });
                  busy = true;
                }
              "
            >
              <p class="font-weight-black m-0">
                {{ $t("global.payment_form.pay_by_gift_cards_action") }}
              </p>
              <img
                class="mx-2"
                src="@components/assets/icons/gift.svg"
                :width="24"
              />
              {{ $t("global.commons.free") }}
            </payment-button>
          </div>
        </v-slide-y-transition>
      </div>

      <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ QR Code View ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ QR Code ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="qrCode" class="p-3">
      <time-lapse
        v-if="timeout && !success_end_countdown"
        :duration-ms="timeout"
        color="red"
        class="absolute-top-start"
        width="3"
        size="20"
      >
      </time-lapse>

      <v-btn
        @click="$emit('close')"
        icon
        class="absolute-top-end zoomIn delay_100 z2"
        ><v-icon>close</v-icon></v-btn
      >

      <div class="position-relative">
        <qrcode
          class="my-6 mx-auto zoomIn delay_300 blur-animate"
          :class="{ blured: success_end_countdown }"
          :value="qrCode"
          :options="{
            width: 300,
            color: { light: '#fff', dark: '#000' },
          }"
        >
        </qrcode>

        <v-icon
          v-if="success_end_countdown"
          class="zoomIn center-absolute delay_600"
          size="120"
          color="#4CAF50"
          >check_circle</v-icon
        >
      </div>

      <s-value-copy-box
        :value="address"
        :message="$t('global.payment_form.qr.address')"
        :color="currency.gradient[0]"
        :image="currency.icon"
        class="fadeInDown delay_100"
      >
      </s-value-copy-box>
      <p class="mt-3 zoomIn delay_500">
        {{ $t("global.payment_form.qr.amount") }}
        :
      </p>
      <price-view
        class="fadeIn delay_600"
        :amount="amount"
        :currency="currency.code"
        large
      ></price-view>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Stripe ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isStripe">
      <s-payment-stripe
        v-if="pack && stripe_js_loaded"
        :amount="amount"
        :currency="currency.code.toLowerCase()"
        :client-secret="pack.client_secret"
        :payment-id="pack.id"
        :public-key="pack.public_key"
        @onEndPayment="
          (data) => {
            $emit('onEndPayment', data);
            success_end_countdown = true;
          }
        "
        :order-url="orderUrl"
        :billingName="billingName"
        :billingEmail="billingEmail"
        :billingPhone="billingPhone"
        :billingAddress="billingAddress"
      ></s-payment-stripe>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Razorpay ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isRazorpay">
      <s-payment-razorpay
        :pack="pack"
        :amount="amount"
        :currency="currency.code"
        :order-url="orderUrl"
        :billingName="billingName"
        :billingEmail="billingEmail"
        :billingPhone="billingPhone"
        :billingAddress="billingAddress"
      ></s-payment-razorpay>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ PayPal Standard ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isPayPalStandard">
      <s-payment-paypal-standard
        :shop-name="customShopName ? customShopName : shop_name"
        :pack="pack"
        :amount="amount"
        :currency="currency.code"
        :order-url="orderUrl"
        :billingName="billingName"
        :billingEmail="billingEmail"
        :billingPhone="billingPhone"
        :billingAddress="billingAddress"
      ></s-payment-paypal-standard>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Mercadopago ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isMercadopago">
      <s-payment-mercadopago
        :public-key="pack.public_key"
        :preference-id="pack.unique_id"
        :currency="currency.code"
      ></s-payment-mercadopago>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Paymob ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isPaymob">
      <s-payment-paymob
        :payment-token="pack.token"
        :iframe-card-id="pack.card_id"
        :iframe-installment-id="pack.installment_id"
        :iframe-valu-id="pack.valu_id"
        :iframe-forsa-id="pack.forsa_id"
      ></s-payment-paymob>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Squareup ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isSquareup">
      <s-payment-squareup
        :script="pack.script"
        :amount="pack.amount"
        :currency="pack.currency"
        :location-id="pack.location_id"
        :app-id="pack.app_id"
        :submit-url="pack.submit_url"
        :order-url="orderUrl"
        :transaction-id="pack.transaction_id"
        :billing-address="billingAddress"
      ></s-payment-squareup>
    </v-card-text>
  </v-card>
</template>

<script>
import CircleButton from "@components/ui/button/CircleButton.vue";

import SPaymentStripe from "./stripe/SPaymentStripe.vue";
import PaymentButton from "./widgets/PaymentButton.vue";
import SelectGiftCards from "@components/backoffice/incentives/gift-card/SelectGiftCards.vue";
import SValueCopyBox from "@components/ui/text/SValueCopyBox.vue";
import TimeLapse from "@components/ui/time-lapse/timeLapse.vue";
import CurrencyIcon from "@components/ui/currency/CurrencyIcon.vue";
import SPaymentRazorpay from "./razorpay/SPaymentRazorpay.vue";
import SPaymentPaypalStandard from "./paypal-standard/SPaymentPaypalStandard.vue";
import SPaymentMercadopago from "./mercadopago/SPaymentMercadopago.vue";
import SPaymentPaymob from "@components/payment/paymob/SPaymentPaymob.vue";
import SPaymentSquareup from "@components/payment/squareup/SPaymentSquareup.vue";

export default {
  name: "SPaymentForm",
  components: {
    SPaymentSquareup,
    SPaymentPaymob,
    SPaymentMercadopago,
    SPaymentPaypalStandard,
    SPaymentRazorpay,
    CurrencyIcon,
    TimeLapse,
    SValueCopyBox,
    SelectGiftCards,
    PaymentButton,
    SPaymentStripe,
    CircleButton,
  },
  props: {
    isOfficialSamin: {
      // For payment is Samin
      default: false,
      type: Boolean,
    },

    isDropshippingCharge: {
      // For charge drop shipping (Pay to other shop in shop admin panel)
      default: false,
      type: Boolean,
    },
    isSelldoneSubscription: {
      // For selldone subscription (Zero price)
      default: false,
      type: Boolean,
    },

    customShopName: {}, // Used only in dropshipping charge account

    bill: {},

    mode: {},

    currency: {
      required: true,
      type: Object,
    },

    //-------------- Final Payment Amount---------------

    paymentAmount: {},

    //-------------- QR code ---------------

    qrCode: {},
    address: {},
    amount: {
      type: Number,
    },
    timeout: {},
    //-------------- COD ---------------

    acceptCOD: {
      default: false,
      type: Boolean,
    },

    //-------------- Stripe ---------------
    pack: {},

    //-------------- Gift Card ---------------

    hasGiftCardField: {
      require: false,
      type: Boolean,
      default: false,
    },

    //-------------- Club ---------------

    hasClub: {
      require: false,
      type: Boolean,
      default: false,
    },

    //-------------- Available Gateways ---------------

    availableGateways: {
      require: true,
      type: Array,
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
    busy: false,

    selected_gateway: false,

    //-------------- Gift Cards ---------------
    selected_gift_cards: [],
    giftcards: [],
    busy_gift_cards: false,

    //-------------- Stripe ---------------
    stripe_js_loaded: false,

    //-------------- PayPal ---------------
    paypal_js_loaded: false,
    paypal_instance: null,
    paypal_deviceData: null,
    busy_paypal_submit: false,
    busy_get_paypal_client_token: false,
    in_paypal_message: false,

    // -----------------------------------
    paypal_success_message: null,
    paypal_error_message: null,

    //------------------------------------
    success_end_countdown: false,

    //------------------------------------
    kill_interval: false,
  }),

  computed: {
    isFree() {
      return (
        this.final_payment === 0 &&
        !this.isSelldoneSubscription /*Selldone add card with zero charge*/
      );
    },

    eligible_gateways_by_currency() {
      let out = [];
      this.availableGateways.forEach((gateway) => {
        if (
          gateway.enable &&
          (this.acceptCOD || !gateway.cod) &&
          gateway.currency === this.currency.code
        )
          out.push(gateway);
      });

      return out;
    },

    gateways() {
      return this.eligible_gateways_by_currency.filter((gateway) => {
        return !gateway.code.startsWith("paypal_"); // Don't show PayPal (Braintree) gateways in selection list of gateways!
      });
    },

    isStripe() {
      return this.mode === "stripe";
    },

    isRazorpay() {
      return this.mode === "razorpay";
    },

    isPayPalStandard() {
      return this.mode === "paypal-standard";
    },

    isMercadopago() {
      return this.mode === "mercadopago";
    },

    isPaymob() {
      return this.mode === "paymob";
    },
    isSquareup() {
      return this.mode === "squareup";
    },

    isBraintree() {
      // Braintree!
      return this.eligible_gateways_by_currency.some((item) => {
        return item.code.startsWith("paypal_");
      });
    },

    final_payment() {
      return this.bill ? this.bill.sum : 0;
    },

    total_amount_by_gift_cards() {
      let out = 0;
      this.selected_gift_cards.forEach((item) => {
        out += item.balance;
      });

      return out > this.final_payment ? this.final_payment : out;
    },

    total_amount_remain_for_pay() {
      let out = this.final_payment - this.total_amount_by_gift_cards;

      return out > 0 ? out : 0;
    },
  },

  watch: {
    qrCode() {
      this.busy = false;
    },
    isStripe(isStripe) {
      if (isStripe) this.loadStripeJs();
    },

    isBraintree(isBraintree) {
      if (isBraintree) this.loadPaypalJs();
    },

    hasGiftCardField() {
      this.fetchGiftCards();
    },
    currency() {
      this.fetchGiftCards();
    },
  },

  created() {
    this.fetchGiftCards();

    // Global listener: Reset form
    this.EventBus.$on("PaymentMethodsForm:reset", () => {
      this.reset();
    });

    if (this.isStripe) this.loadStripeJs();

    // PayPal load in step 1 : (Solve: Not call in first created!)
    if (this.isBraintree) this.loadPaypalJs();
  },

  beforeDestroy() {
    this.stopIntervalPaymentStatus();
    this.EventBus.$off("PaymentMethodsForm:reset");
  },

  methods: {
    /**
     * ――――――――――――――――――――― Stripe > Load JS ――――――――――――――――――――
     */
    loadStripeJs() {
      let t = this;

      try {
        let test = Stripe; // Check if previously loaded:
        this.stripe_js_loaded = true;
        this.busy = false;
        console.style(`✔ ❰ Stripe ❱  Script exist.`);
      } catch (e) {
        // Load dynamically:
        $.cachedScript("https://js.stripe.com/v3/")
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Stripe ❱  Load script file start... ▶ status: ${textStatus}`
            );
            t.stripe_js_loaded = true;
            t.busy = false;
            console.style(`🔔 ❰ Stripe ❱  Load script file end`);
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Stripe ❱  Failed to load script file: `,
              exception
            );
            this.showErrorAlert(null, "Can not load script!");
          });
      }
    },

    /**
     * ――――――――――――――――――――― Paypal > Load JS ――――――――――――――――――――
     */
    loadPaypalJs() {
      console.style(`...loadPaypalJs Start...`);

      let t = this;

      try {
        let test = braintree; // Check if previously loaded:
        this.paypal_js_loaded = true;
        this.busy = false;
        console.style(`✔ ❰ Paypal ❱  Script exist`);
        this.getClientTokenPaypal();
      } catch (e) {
        // Load dynamically:
        $.cachedScript(
          "https://js.braintreegateway.com/web/dropin/1.29.0/js/dropin.min.js"
        )
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Paypal ❱  Load script file start... ▶ status: ${textStatus}`
            );
            t.paypal_js_loaded = true;
            t.busy = false;

            console.style(`🔔 ❰ Paypal ❱  Load script file end`);
            t.getClientTokenPaypal();
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Paypal ❱  Failed to load script file: `,
              exception
            );
            t.showErrorAlert(null, "Can not load script!");
          });
      }
    },

    /**
     * ―――――――――――――――――― Paypal > Create / Get user paypal client token ―――――――――――――――――
     * Get Paypal client token to show saved cards.
     */
    getClientTokenPaypal() {
      this.busy_get_paypal_client_token = true;
      axios
        .post(
          this.isOfficialSamin
            ? window.API.GET_SELLDONE_PAYPAL_CLIENT_TOKEN(this.currency.code)
            : window.XAPI.GET_PAYPAL_CLIENT_TOKEN(
                this.customShopName ? this.customShopName : this.shop_name,
                this.currency.code
              )
        )
        .then(({ data }) => {
          if (!data.error) {
            this.createPayPalTransaction(data.token);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_get_paypal_client_token = false;
        });
    },

    /**
     * ――――――――――――――――――――― Paypal > Show Paypal UI ――――――――――――――――――――
     * Show the cards and input form for Paypal.
     */
    createPayPalTransaction(CLIENT_TOKEN_FROM_SERVER) {
      let callback = (createErr, instance) => {
        if (
          !document.getElementById("braintree-dropin-container") ||
          !this.paypal_js_loaded
        )
          return; // Form reset!

        if (createErr) {
          if (!this.selected_gateway) {
            // Prevent to show error when select other gateway (before UI create completely!
            this.showErrorAlert(null, "Problem in creating payment UI!");
            console.error(createErr);
          }
        }
        // console.error(createErr)
        // console.log('instance',instance)
        this.paypal_instance = instance;
      };

      braintree.dropin.create(
        {
          authorization: CLIENT_TOKEN_FROM_SERVER,
          container: "#braintree-dropin-container",
          dataCollector: {
            kount: true, // Required if Kount fraud data collection is enabled
          },
          vaultManager: true,
          paypal: {
            flow: "vault", //     flow: 'vault'
            // amount: '10.00',
            //currency: 'USD',
            buttonStyle: {
              color: "black",
              shape: "rect",
              size: "medium",
            },
          },
          card: {
            cardholderName: {
              required: true,
              // to make cardholder name required
              // required: true
            },
          },
        },
        callback
      );
    },

    /**
     * ――――――――――――――――――――― Paypal > Submit card ――――――――――――――――――――
     * Send data {nonce , device_data} to Selldone to complete payment.
     */
    PayPalSubmit() {
      this.busy_paypal_submit = true;

      this.paypal_success_message = null;
      this.paypal_error_message = null;

      this.paypal_instance.requestPaymentMethod((err, payload) => {
        if (!payload) {
          this.busy_paypal_submit = false;
          return;
        }
        // Submit payload.nonce to your server
        console.log("――――――― Submit payload.nonce to your server ―――――――");
        //console.log("nonce", payload.nonce, "deviceData", payload.deviceData);

        this.$emit("select-gateway", {
          gateway: this.getGatewayPaypal().code,
          amount_check: this.final_payment, // Must check by server! For validate price calculated in client side! important!
          gift_cards: this.getGiftCardsList(),
          params: {
            nonce: payload.nonce,
            device_data: payload.deviceData,
          },
          callback_paypal: (data, error) => {
            if (data && !data.error) {
              console.log("data", data);

              this.paypal_instance.teardown(function (teardownErr) {
                if (teardownErr) {
                  console.error("Could not tear down Drop-in UI!");
                } else {
                  console.info("Drop-in UI has been torn down!");
                  // Remove the 'Submit payment' button
                  $("#braintree-submit-button").remove();
                }
              });

              // Show paypal messages:
              this.in_paypal_message = true;

              if (!data.error) {
                this.paypal_success_message = "Your payment has been settled";
              } else {
                this.paypal_error_message = data.error_msg;
              }

              // End process:
              this.$emit("onEndPayment", data);
              this.success_end_countdown = true;
            } else {
            }

            this.busy_paypal_submit = false;
          },
        });
      });
    },
    /**
     * ――――――――――――――――――――― Paypal > Multi currency support ――――――――――――――――――――
     * Return gateway code for Paypal by selected currency
     */
    getGatewayPaypal() {
      return this.availableGateways.find(
        (item) =>
          item.code.startsWith("paypal") && item.currency === this.currency.code
      );
    },

    /**
     * ――――――――――――――――――――― Payment > List of selected giftcards ――――――――――――――――――――
     * Return array of selected gift cards [...giftcard.number]
     * */
    getGiftCardsList() {
      let out = [];
      this.selected_gift_cards.forEach((item) => {
        out.push(item.number);
      });
      return out;
    },

    /**
     * ――――――――――――――――――――― Reset Payment Form ――――――――――――――――――――
     *
     */
    reset() {
      this.resetToDefault(); // 🞇 Reset to default
      this.fetchGiftCards();

      // Remove previous paypal form:
      $("#braintree-dropin-container").empty();

      // Paypal load in step 1 : (re assign client token!)
      if (this.isBraintree) this.loadPaypalJs();
    },

    /**
     * ―――――――――――――――――――――― Fetch giftcards ――――――――――――――――――――
     * Get buyer giftcards for this shop.
     *
     */

    fetchGiftCards() {
      if (!this.hasGiftCardField) return;

      const currency = this.currency.code;

      this.busy_gift_cards = true;
      axios
        .get(window.XAPI.GET_MY_GIFT_CARDS_LIST(this.shop_name), {
          // Dropshipping not have gift card!
          params: {
            offset: 0,
            count: 10,
            currency: currency,
          },
        })
        .then(({ data }) => {
          this.giftcards = data.giftcards;
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_gift_cards = false;
        });
    },

    /**
     * ―――――――――――――――――――――― Stop check payment by interval ――――――――――――――――――――
     */
    stopIntervalPaymentStatus() {
      this.kill_interval = true;
    },

    /**
     * ―――――――――――――――――――――― Check payment by interval ――――――――――――――――――――
     * Use for blockchain payment check.
     *
     * @param gateway
     * @param transaction_id
     * @param unique_id
     * @param timeout
     * @param interval
     * @param start
     */

    pollIntervalPaymentStatus(
      gateway,
      transaction_id,
      unique_id,
      timeout = this.timeout,
      interval = 10000,
      start = null
    ) {
      console.log("pollPaymentStatus...", gateway, transaction_id, unique_id);

      start = start ? start : Date.now();

      // console.log('date',start,Date.now(),start + timeout)

      // Retrieve the payment status from our server:
      axios
        .get(
          !this.isOfficialSamin
            ? window.XAPI.GET_PAYMENT_STATUS_INTERVAL(
                this.customShopName ? this.customShopName : this.shop_name,
                gateway,
                transaction_id,
                unique_id
              )
            : window.API.GET_PAYMENT_STATUS_INTERVAL(
                gateway,
                transaction_id,
                unique_id
              )
        )
        .then(({ data }) => {
          if (data.success && data.payment_at) {
            // End process:
            this.$emit("onEndPayment", data);
            this.success_end_countdown = true;
            this.showSuccessAlert(
              "Payment received",
              "Your payment accepted successfully."
            );

            return;
          } else if (Date.now() < start + timeout) {
            // Stop interval check!
            if (this.kill_interval) return;

            // Not done yet. Let's wait and check again.
            setTimeout(
              this.pollIntervalPaymentStatus,
              interval,
              gateway,
              transaction_id,
              unique_id,
              timeout,
              interval,
              start
            );
          } else {
            this.showWarningAlert(
              "Please refresh page after payment completed."
            );

            // Finish payment:
            this.$emit("onEndPayment", data);
            this.success_end_countdown = true;
          }
        })
        .catch((e) => {
          this.showErrorAlert(e);
        })
        .finally(() => {});
    },
  },
};
</script>

<style scoped lang="scss">
.text-value {
  font-size: 2rem;
}
</style>
