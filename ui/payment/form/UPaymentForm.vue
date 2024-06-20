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
  <!-- ========================== Payment Methods ========================== -->

  <v-card
    class="overflow-hidden text-start"
    rounded="t-xl"
    style="
      position: relative;
      min-height: 180px !important;
    "
  >
    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Top Bar ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-toolbar v-if="!busy && !qrCode" color="transparent" flat>
      <u-currency-icon :currency="currency" gradient></u-currency-icon>

      <div class="body-title px-3">
        {{ $t("global.payment_form.title") }}
        <b v-if="currency"
          >| {{ currency.code }}
          <flag :iso="currency.flag" :squared="false" />
        </b>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Success timeout ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <u-time-laps
          v-if="success_end_countdown"
          :duration-ms="8000"
          class="ms-2"
          color="green"
          size="20"
          width="3"
          @end="$emit('close')"
        >
        </u-time-laps>
      </div>

      <v-spacer />

      <img
        v-if="hasClub && getClub()"
        :src="getCustomerClubLevel(getClub().level).icon"
        height="32px"
        width="32px"
      />

      <u-button-circle
        :tooltip="$t('global.actions.close')"
        class="z2"
        icon="close"
        @click="$emit('close')"
      />
    </v-toolbar>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Loading View ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <div v-if="busy" class="py-8 text-muted text-center">
      <u-loading-progress></u-loading-progress>

      <b class="d-block text-success mb-1">
        <v-icon class="me-1" color="success">shield</v-icon>
        {{ $t("global.commons.creating_secure_payment") }}</b
      >
      {{ $t("global.commons.waiting_connecting_payment") }}
    </div>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Paypal ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="in_paypal_message">
      <v-alert v-if="paypal_success_message" class="mt-3" type="success">
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
        <s-giftcard-input
          v-if="hasGiftCardField && !isFree"
          v-model="selected_gift_cards"
          :gift-cards="giftcards"
          :loading="busy_gift_cards"
          class="mt-3"
          multiple
          return-object
          variant="outlined"
        >
        </s-giftcard-input>
        <!-- Wallet -->
        <s-wallet-input
            v-if="hasWallet && !isFree"
            class="mb-3"
            :currency="currency.code"

        >

        </s-wallet-input>


        <div class="text-start">
          <small>{{ $t("global.commons.total_payment") }} </small>
          <v-icon size="x-small">arrow_drop_down</v-icon>
          <br />

          <div class="d-flex align-center">
            <u-price
              :amount="total_amount_remain_for_pay"
              :currency="currency.code"
              class="text-h3"
            ></u-price>

            <v-chip
              v-if="isSelldoneSubscription"
              class="ma-2"
              color="#111"
              label
              size="small"
              variant="flat"
            >
              <v-icon start>add_card</v-icon>
              Add card to the wallet.
            </v-chip>
            <v-tooltip
              v-else-if="bill"
              content-class="bg-black text-start rounded-xl"
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-btn
                  class="ms-2"
                  icon
                  size="small"
                  style="vertical-align: top"
                  v-bind="props"
                  variant="text"
                >
                  <v-icon>info</v-icon>
                </v-btn>
              </template>

              <v-table class="bg-transparent" density="compact" theme="dark">
                <template v-slot:default>
                  <tbody class="text-start">
                    <tr>
                      <td>{{ $t("global.commons.amount") }}</td>

                      <td>
                        <u-price
                          :amount="bill.items_price"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>

                    <tr v-if="bill.items_discount">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-gift</v-icon>
                        {{ $t("global.commons.discount") }}
                      </td>

                      <td>
                        <u-price
                          :amount="-bill.items_discount"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>

                    <tr v-if="bill.offer">
                      <td>
                        <v-icon size="small" class="me-1">fa:fas fa-gift</v-icon>
                        {{ $t("global.commons.offer") }}
                      </td>

                      <td>
                        <u-price
                          :amount="-bill.offer"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>

                    <tr v-if="bill.delivery_price !== null">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-shipping-fast</v-icon>
                        {{ $t("global.commons.shipping") }}
                      </td>

                      <td>
                        <u-price
                          v-if="bill.delivery_price >= 0"
                          :amount="bill.delivery_price"
                          :currency="currency.code"
                        ></u-price>
                        <span v-else>{{ $t("global.commons.not_paid") }}</span>
                      </td>
                    </tr>

                    <tr v-if="bill.discount_code">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-percentage</v-icon>
                        {{ $t("global.commons.discount_code") }}
                      </td>
                      <td>
                        <u-price
                          :amount="-bill.discount_code"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>
                    <tr v-if="bill.club">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-gem</v-icon>
                        {{ $t("global.commons.customer_club") }}
                      </td>
                      <td>
                        <u-price
                          :amount="-bill.club"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>
                    <tr v-if="bill.coupon">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-ticket-alt</v-icon>
                        {{ $t("global.commons.coupon") }}
                      </td>
                      <td>
                        <u-price
                          :amount="-bill.coupon"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>

                    <tr v-if="bill.lottery">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-dice</v-icon>
                        {{ $t("global.commons.prize") }}
                      </td>
                      <td>
                        <u-price
                          :amount="-bill.lottery"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>

                    <tr v-if="bill.wallet">
                      <td>
                        <v-icon size="small"  class="me-1">wallet</v-icon>
                        {{ $t("global.commons.my_wallet") }}
                      </td>
                      <td>
                        <u-price
                            :amount="-bill.wallet"
                            :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>


                    <tr v-if="bill.tax">
                      <td>
                        <v-icon size="small"  class="me-1">fa:fas fa-coins</v-icon>
                        {{ $t("global.commons.tax") }}
                      </td>
                      <td>
                        <u-price
                          v-if="!bill.tax_included"
                          :amount="bill.tax"
                          :currency="currency.code"
                        ></u-price>
                        <span v-else>{{
                          $t("global.commons.tax_included")
                        }}</span>
                      </td>
                    </tr>

                    <tr v-if="total_amount_by_gift_cards">
                      <td>
                        <v-icon size="small"  class="me-1">card_giftcard</v-icon>
                        {{ $t("global.commons.gift_card") }}
                      </td>
                      <td>
                        <u-price
                          :amount="-total_amount_by_gift_cards"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>
                    <tr style="border-top: #fff solid 2px">
                      <td>
                        <b>{{ $t("global.commons.sum") }}</b>
                      </td>
                      <td class="font-weight-bold">
                        <u-price
                          :amount="total_amount_remain_for_pay"
                          :currency="currency.code"
                        ></u-price>
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-table>
            </v-tooltip>
          </div>
        </div>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Charge Gift Cards ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <p v-if="total_amount_by_gift_cards > 0" class="my-2">
          <v-icon class="me-1" size="small"
            >{{ total_amount_remain_for_pay > 0 ? "redeem" : "check_circle" }}
          </v-icon>
          {{ $t("global.payment_form.pay_amount_by_gift_cards") }}:

          <u-price
            :amount="total_amount_by_gift_cards"
            :currency="currency.code"
            class="text-success"
          >
          </u-price>
        </p>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Free payment ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

        <div v-if="isFree">
          <p class="my-2 small">
            {{ $t("global.payment_form.order_free_payment") }}
          </p>

          <u-payment-button
            class="ma-auto pointer-pointer"
            pos=""
            purple
            small
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
            <p class="font-weight-black m-0 pb-1 single-line">
              {{ $t("global.payment_form.order_free_payment_action") }}
            </p>
            <img
              :width="24"
              class="mx-2"
              src="../../../assets/icons/free-badge.svg"
            />
            {{ $t("global.commons.free") }}
          </u-payment-button>
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
            <v-expansion-panels :model-value="0" flat light>
              <v-expansion-panel class="border rounded-18px">
                <v-expansion-panel-title>
                  <span>Secure Payment Form</span>
                  <u-loading-ellipsis
                    v-if="!paypal_js_loaded || busy_get_paypal_client_token"
                    css-mode
                    light
                  >
                  </u-loading-ellipsis>
                </v-expansion-panel-title>
                <v-expansion-panel-text style="border-radius: 12px">
                  <div>
                    <div id="braintree-dropin-container" dir="ltr"></div>

                    <v-btn
                      v-if="paypal_instance"
                      id="braintree-submit-button"
                      :loading="busy_paypal_submit"
                      block
                      class="mt-3"
                      color="#000"
                      size="x-large"
                      variant="elevated"
                      @click="PayPalSubmit"
                    >
                      {{ $t("global.actions.pay") }}
                      <u-price
                        :amount="total_amount_remain_for_pay"
                        :currency="currency.code"
                        class="mx-2"
                      ></u-price>
                    </v-btn>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-expand-transition>

        <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Select Gateway ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
        <v-slide-y-reverse-transition hide-on-leave>
          <div
            v-if="total_amount_remain_for_pay > 0 || isSelldoneSubscription"
            class="pb-12"
          >
            <p class="small text-start border-top-dashed pt-3 mb-4 mt-2">
              {{
                isBraintree
                  ? "Other payment methods"
                  : $t("global.payment_form.select_payment_method")
              }}
            </p>

            <v-row justify="center">
              <v-col
                v-for="gateway in gateways"
                :key="gateway.code"
                class="px-1 py-2"
                cols="12"
                sm="6"
              >
                <u-payment-button
                  :blue="gateway.cod"
                  :pos="GetUserSelectedCurrencyName(gateway.currency, true)"
                  :disabled="gateway.limit && gateway.limit > final_payment"
                  class="ma-auto pointer-pointer"
                  small
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
                  <p class="font-weight-black m-0 pb-1 single-line">
                    {{
                      gateway.dir
                        ? $t("global.actions.dir_payment")
                        : gateway.cod
                          ? $t("global.actions.cod_payment")
                          : $t("global.actions.online_payment")
                    }}
                  </p>
                  <img
                    :src="getShopImagePath(gateway.icon)"
                    :width="24"
                    class="mx-2"
                  />
                  {{ gateway.name }}

                  <template v-slot:disable-reason>
                    <v-icon class="me-1" size="18A" color="#fff">shopping_bag</v-icon>
                    Min order: <u-price class="mx-1" :amount="gateway.limit" :currency="currency.code" />
                  </template>
                </u-payment-button>
              </v-col>
            </v-row>

            <div v-if="!gateways || !gateways.length">
              <img
                :width="48"
                class="m-2"
                src="../../../assets/emotions/013-disappointed.svg"
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
            class="pb-12"
          >
            <p class="mt-2 mb-5 small">
              {{ $t("global.payment_form.all_paid_by_gift_cards") }}
            </p>

            <u-payment-button
              class="ma-auto pointer-pointer"
              pos=""
              purple
              small
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
              <p class="font-weight-black m-0 pb-1 single-line">
                {{ $t("global.payment_form.pay_by_gift_cards_action") }}
              </p>
              <img
                :width="24"
                class="mx-2"
                src="../../../assets/icons/gift.svg"
              />
              {{ $t("global.commons.free") }}
            </u-payment-button>
          </div>
        </v-slide-y-transition>
      </div>

      <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ QR Code View ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ QR Code ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="qrCode" class="p-3">
      <u-time-laps
        v-if="timeout && !success_end_countdown"
        :duration-ms="timeout"
        class="absolute-top-start"
        color="red"
        size="20"
        width="3"
      >
      </u-time-laps>

      <v-btn
        class="absolute-top-end zoomIn delay_100 z2"
        icon
        variant="text"
        @click="$emit('close')"
      >
        <v-icon>close</v-icon>
      </v-btn>

      <div class="position-relative">
        <u-qrcode
          :class="{ blurred: success_end_countdown }"
          :options="{
            width: 300,
            color: { light: '#fff', dark: '#000' },
          }"
          :value="qrCode"
          class="my-6 mx-auto zoomIn delay_300 blur-animate"
        >
        </u-qrcode>

        <v-icon
          v-if="success_end_countdown"
          class="zoomIn center-absolute delay_600"
          color="#4CAF50"
          size="120"
          >check_circle
        </v-icon>
      </div>

      <u-text-copy-box
        :color="currency.gradient[0]"
        :image="currency.icon"
        :message="$t('global.payment_form.qr.address')"
        :value="address"
        class="fadeInDown delay_100"
      >
      </u-text-copy-box>
      <p class="mt-3 zoomIn delay_500">
        {{ $t("global.payment_form.qr.amount") }}
        :
      </p>
      <u-price
        :amount="amount"
        :currency="currency.code"
        class="fadeIn delay_600"
        large
      ></u-price>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Stripe ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isStripe">
      <u-payment-stripe
        v-if="pack && stripe_js_loaded"
        :amount="amount"
        :billingAddress="billingAddress"
        :billingEmail="billingEmail"
        :billingName="billingName"
        :billingPhone="billingPhone"
        :client-secret="pack.client_secret"
        :currency="currency.code.toLowerCase()"
        :order-url="orderUrl"
        :payment-id="pack.id"
        :public-key="pack.public_key"
        :theme="
          availableGateways.find(
            (g) => g.code === `stripe_${currency.code.toLowerCase()}`,
          )?.theme
        "
        @onEndPayment="
          (data) => {
            $emit('onEndPayment', data);
            success_end_countdown = true;
          }
        "
      ></u-payment-stripe>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Razorpay ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isRazorpay">
      <u-payment-razorpay
        :amount="amount"
        :billingAddress="billingAddress"
        :billingEmail="billingEmail"
        :billingName="billingName"
        :billingPhone="billingPhone"
        :currency="currency.code"
        :order-url="orderUrl"
        :pack="pack"
      ></u-payment-razorpay>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ PayPal Standard ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isPayPalStandard">
      <u-payment-paypal-standard
        :amount="amount"
        :billingAddress="billingAddress"
        :billingEmail="billingEmail"
        :billingName="billingName"
        :billingPhone="billingPhone"
        :currency="currency.code"
        :order-url="orderUrl"
        :pack="pack"
        :shop-name="customShopName ? customShopName : shop_name"
      ></u-payment-paypal-standard>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Mercadopago ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isMercadopago">
      <u-payment-mercadopago
        :currency="currency.code"
        :preference-id="pack.unique_id"
        :public-key="pack.public_key"
      ></u-payment-mercadopago>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Paymob ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isPaymob">
      <u-payment-paymob
        :iframe-card-id="pack.card_id"
        :iframe-forsa-id="pack.forsa_id"
        :iframe-installment-id="pack.installment_id"
        :iframe-valu-id="pack.valu_id"
        :payment-token="pack.token"
      ></u-payment-paymob>
    </v-card-text>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Squareup ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->

    <v-card-text v-if="isSquareup">
      <u-payment-squareup
        :amount="pack.amount"
        :app-id="pack.app_id"
        :billing-address="billingAddress"
        :currency="pack.currency"
        :location-id="pack.location_id"
        :order-url="orderUrl"
        :script="pack.script"
        :submit-url="pack.submit_url"
        :transaction-id="pack.transaction_id"
      ></u-payment-squareup>
    </v-card-text>
  </v-card>
</template>

<script>
import UPaymentStripe from "../../../ui/payment/stripe/UPaymentStripe.vue";
import UPaymentButton from "../../../ui/payment/button/UPaymentButton.vue";
import SGiftcardInput from "../../../storefront/giftcard/selector/SGiftcardInput.vue";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import UTimeLaps from "../../../ui/time/lapse/UTimeLaps.vue";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import UPaymentRazorpay from "../../../ui/payment/razorpay/UPaymentRazorpay.vue";
import UPaymentPaypalStandard from "../../../ui/payment/paypal-standard/UPaymentPaypalStandard.vue";
import UPaymentMercadopago from "../../../ui/payment/mercadopago/UPaymentMercadopago.vue";
import UPaymentPaymob from "../../../ui/payment/paymob/UPaymentPaymob.vue";
import UPaymentSquareup from "../../../ui/payment/squareup/UPaymentSquareup.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import SWalletInput from "@selldone/components-vue/storefront/wallet/SWalletInput.vue";

export default {
  name: "UPaymentForm",
  components: {
    SWalletInput,
    UPrice,
    UPaymentSquareup,
    UPaymentPaymob,
    UPaymentMercadopago,
    UPaymentPaypalStandard,
    UPaymentRazorpay,
    UCurrencyIcon,
    UTimeLaps,
    UTextCopyBox,
    SGiftcardInput,
    UPaymentButton,
    UPaymentStripe,
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

    //-------------- Gift Card (Shop) ---------------

    hasGiftCardField: {
      require: false,
      type: Boolean,
      default: false,
    },
    //-------------- Customer Virtual Wallet (Shop) ---------------

    hasWallet:Boolean,

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

  beforeUnmount() {
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
              `🔔 ❰ Stripe ❱  Load script file start... ▶ status: ${textStatus}`,
            );
            t.stripe_js_loaded = true;
            t.busy = false;
            console.style(`🔔 ❰ Stripe ❱  Load script file end`);
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Stripe ❱  Failed to load script file: `,
              exception,
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
          "https://js.braintreegateway.com/web/dropin/1.29.0/js/dropin.min.js",
        )
          .done(function (script, textStatus) {
            console.style(
              `🔔 ❰ Paypal ❱  Load script file start... ▶ status: ${textStatus}`,
            );
            t.paypal_js_loaded = true;
            t.busy = false;

            console.style(`🔔 ❰ Paypal ❱  Load script file end`);
            t.getClientTokenPaypal();
          })
          .fail(function (jqxhr, settings, exception) {
            console.errorStyle(
              `⚠ ❰ Paypal ❱  Failed to load script file: `,
              exception,
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
                this.currency.code,
              ),
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
        callback,
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
          item.code.startsWith("paypal") &&
          item.currency === this.currency.code,
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
      start = null,
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
                unique_id,
              )
            : window.API.GET_PAYMENT_STATUS_INTERVAL(
                gateway,
                transaction_id,
                unique_id,
              ),
        )
        .then(({ data }) => {
          if (data.success && data.payment_at) {
            // End process:
            this.$emit("onEndPayment", data);
            this.success_end_countdown = true;
            this.showSuccessAlert(
              "Payment received",
              "Your payment accepted successfully.",
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
              start,
            );
          } else {
            this.showWarningAlert(
              "Please refresh page after payment completed.",
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

<style lang="scss" scoped>
.text-value {
  font-size: 2rem;
}
</style>
