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
  <div>
    <!-- ====== Select Gateway Dialog ===== -->

    <v-bottom-sheet
      v-model="showSelectGateway"
      inset
      :max-width="640"
      content-class="s--storefront-master-payment-dialog"
      scrollable
      persistent
    >
      <s-payment-form
        v-if="exist_payment_form"
        ref="payment_form"
        :mode="special_payment_mode"
        :bill="bill"
        :pack="pack"
        :currency="currency"
        :address="payment_form_address"
        :amount="payment_form_amount"
        :qr-code="payment_form_qr_code"
        :payment-amount="bill ? bill.sum : 0"
        :has-gift-card-field="
          type !== 'AVOCADO' &&
          type !== 'HYPER' &&
          !!USER() &&
          type !== 'SUBSCRIPTION'
        "
        :available-gateways="available_gateways"
        @select-gateway="buy"
        @close="delayedHide()"
        has-club
        :accept-c-o-d="acceptCOD"
        :timeout="timeout"
        @onEndPayment="(data) => onFinishPayment(data)"
        :order-url="order_url"
        :billingName="billingName"
        :billingEmail="billingEmail"
        :billingPhone="billingPhone"
        :billingAddress="billingAddress"
      />
    </v-bottom-sheet>

    <radial-progress-bar
      v-for="(item, index) in paymentQue"
      :key="index"
      class="widget-hover s--storefront-master-payment-circle-progress"
      :style="{ top: `${index * 55 + 120}px` }"
      :diameter="size"
      :completed-steps="item.progress"
      :total-steps="item.steps"
      start-color="#E64A19"
      stop-color="#FFA000"
      :inner-stroke-color="SaminColorDark"
      :stroke-width="size / 6"
      @click="getPendingPaymentInfo(item.gateway, item.id, item.order_id)"
      :loading="busy_loading_payment === item.id"
      :class="{
        disabled: busy_loading_payment && busy_loading_payment !== item.id,
      }"
    >
      <img
        :src="getShopImagePath(item.icon)"
        :width="size * 0.38"
        alt="Gateway"
      />
    </radial-progress-bar>

    <!-- ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Redirect loading dialog ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ -->
    <div v-if="redirect_loading" class="blocking-dialog">
      <v-btn
        @click="redirect_loading = false"
        class="absolute-top-end"
        icon
        dark
        ><v-icon>close</v-icon></v-btn
      >
      <div class="widget rounded-18px p-5 min-width-200">
        <s-loading css-mode light></s-loading>
        {{ $t("global.commons.waiting_connecting_payment") }}
      </div>
    </div>

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
        type="hidden"
        :name="key"
        :value="item"
      />
    </form>
  </div>
</template>

<script>
import { Currency } from "@core/enums/payment/Currency";
import SPaymentForm from "@components/payment/SPaymentForm.vue";
import RadialProgressBar from "@components/ui/progress/RadialProgressBar.vue";
import { DateConverter } from "@core/helper/date/DateConverter";
import { LocalStorages } from "@core/helper/local-storage/LocalStorages";
import { SetupService } from "@core/server/SetupService";
import { ProductType } from "@core/enums/product/ProductType";
import _ from "lodash-es";
import { BasketHelper } from "@core/helper/shop/BasketHelper";

export default {
  name: "SStorefrontMasterPaymentDialog",
  components: { RadialProgressBar, SPaymentForm },

  props: {
    shop: {
      required: true,
      type: Object,
    },
  },
  data: () => ({
    special_payment_mode: null, // null , stripe ,

    pack: null,

    busy_buy: false,

    showSelectGateway: false,
    exist_payment_form: false,
    //-------------- Data for create payment ---------------

    type: null,
    bill: null,

    product_id: null,
    variant_id: null,

    // Bill info keepers:
    shop_bill: null, // ShopBill :  bill object to pay service
    shop_avocado: null, // ShopBill :  avocado object to pay service
    shop_hyper: null, // ShopBill :  hyper object to pay service

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

    payment_form_qr_code: null,

    acceptCOD: false,

    //-------------- Payment Progress timeout ---------------

    size: 86,
    paymentQue: [],

    interval: null,

    currency: SetupService.DefaultCurrency(),

    busy_loading_payment: null,

    code: null /*🥶 Guest*/,

    order: null,

    //-------------------------------
    callback: null,

    timeout: null,

    // -----------------------------------
    need_refresh: false, // Need refresh basket and shop after close.

    // -----------------------------------
    redirect_loading: false,

    order_url: null, // Redirect url (used for Stripe)

    billingName: "",
    billingEmail: "",
    billingPhone: "",
    billingAddress: "",

    //―――――― 🎗️ Only for Subscription ――――――
    subscription_gateway_codes: [],
  }),

  computed: {
    available_gateways() {
      if (this.type === ProductType.SUBSCRIPTION.code) {
        return this.shop.gateways.filter((g) =>
          this.subscription_gateway_codes.includes(g.code)
        );
      }
      return this.shop.gateways;
    },
  },

  watch: {
    "$store.getters.getPendingTransactions"() {
      this.getPaymentQue();
    },
  },

  created() {
    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Event Bus ―――――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    this.EventBus.$on(
      "payment-form-basket",
      _.throttle(
        ({
          code /*🥶 Guest*/,
          order,
          type,
          bill,
          prize_selected_variant_id,
          gateway,
          acceptCOD,
          callback,
        }) => {
          // Based on delivery methods support COD!
          // Reset previous data:
          // 🞇 Reset to default
          this.resetToDefault();
          this.getPaymentQue();

          // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
          this.code = code;

          this.callback = callback; // Success / fail callback

          this.currency = this.GetUserSelectedCurrency();

          this.EventBus.$emit("PaymentMethodsForm:reset", null);

          this.order = order; // Basket

          this.bill = bill; // Bill of order

          this.prize_selected_variant_id = prize_selected_variant_id;

          this.type = type;

          this.acceptCOD = acceptCOD;

          // Pre-defined gateway: (In samin charge mode only)
          if (gateway) {
            //TODO: Maybe not show payment form! Deprecated!?
            this.buyBasketProduct(gateway);
          }
          // Select gateway:
          else {
            this.showSelectGateway = true;
            this.exist_payment_form = true;
          }

          // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
          if (!this.USER()) {
            // Save array of guest codes in local storage:
            LocalStorages.AddCurrentGuestCodeToHistory(
              type,
              bill.order_id,
              code
            );
          }

          //console.log("======payment-form=========",'acceptCOD',acceptCOD);
        },
        800
      )
    );
    //―――――――――――――――――――――― 🎗️ Subscription ――――――――――――――――――――

    this.EventBus.$on(
      "payment-form-subscription",
      _.throttle(({ currency, bill, gateway_codes, callback, order }) => {
        // Based on delivery methods support COD!
        // Reset previous data:

        this.resetToDefault(); // 🞇 Reset to default

        this.callback = callback; // Success / fail callback

        this.currency = Currency[currency];

        this.EventBus.$emit("PaymentMethodsForm:reset", null);

        this.order = order; // Basket

        this.bill = bill; // Bill of order

        this.type = "SUBSCRIPTION";

        // Pre-defined gateway: (In samin charge mode only)
        // this.buyBasketProduct(gateway,amount)

        this.showSelectGateway = true;
        this.exist_payment_form = true;

        this.subscription_gateway_codes = gateway_codes;
      }, 800)
    );

    // Try to pay pending transactions:
    /**
     * @param order_id        Only use for guest payment! 🥶 Guest (order_id: in payment que) (order_id: in transactions and pending transactions)
     */
    this.EventBus.$on(
      "try-to-pay",
      _.throttle(
        ({ gateway, transaction_id, order_id, force_reset_payment }) => {
          // console.log("====== TRY TO PAY ======", gateway, transaction_id);

          this.getPendingPaymentInfo(
            gateway,
            transaction_id,
            order_id,
            force_reset_payment
          );
        },
        800
      )
    );

    // Payment of bill:
    this.EventBus.$on(
      "payment-form-bill",
      _.throttle(({ code /*🥶 Guest*/, bill, callback, order }) => {
        // Reset previous data:
        this.resetToDefault(); // 🞇 Reset to default
        this.getPaymentQue();

        // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
        this.code = code;

        this.currency = Currency[bill.currency];

        this.EventBus.$emit("PaymentMethodsForm:reset", null);

        this.order = order; // Basket

        this.bill = {
          // ShopBill
          sum: bill.price,
          items_price: bill.price,
          currency: bill.currency,
          items_discount: 0,
          delivery_price: null,
        }; // Bill of order

        this.callback = callback; // Success / fail callback

        this.prize_selected_variant_id = null;

        this.type = "SERVICE";
        this.shop_bill = bill;

        this.acceptCOD = false;

        // Select gateway:

        this.showSelectGateway = true;
        this.exist_payment_form = true;
      }, 800)
    );

    // Payment of avocado:
    this.EventBus.$on(
      "payment-form-avocado",
      _.throttle(({ avocado, callback }) => {
        // Reset previous data:
        this.resetToDefault(); // 🞇 Reset to default
        /////this.getPaymentQue();

        // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
        this.code = null;

        this.currency = Currency[avocado.currency];

        this.EventBus.$emit("PaymentMethodsForm:reset", null);

        this.order = avocado; // Basket

        this.bill = {
          // ShopBill
          sum: avocado.price + (avocado.tax_included ? 0 : avocado.tax),
          items_price: avocado.price,
          currency: avocado.currency,
          items_discount: 0,
          delivery_price: avocado.delivery ? avocado.delivery_price : 0,
        }; // Bill of order

        this.callback = callback; // Success / fail callback

        this.prize_selected_variant_id = null;

        this.type = "AVOCADO";
        this.shop_avocado = avocado;

        this.acceptCOD = false;

        // Select gateway:

        this.showSelectGateway = true;
        this.exist_payment_form = true;
      }, 800)
    );

    // Payment of hyper:
    this.EventBus.$on(
      "payment-form-hyper",
      _.throttle(({ hyper, callback }) => {
        // Reset previous data:
        this.resetToDefault(); // 🞇 Reset to default

        // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
        this.code = null;

        this.currency = Currency[hyper.currency];

        this.EventBus.$emit("PaymentMethodsForm:reset", null);

        this.order = hyper; // Basket

        this.bill = {
          // ShopBill
          sum: hyper.price + (hyper.tax_included ? 0 : hyper.tax),
          items_price: hyper.price,
          currency: hyper.currency,
          items_discount: 0,
          delivery_price: 0,
        }; // Bill of order

        this.callback = callback; // Success / fail callback

        this.prize_selected_variant_id = null;

        this.type = "HYPER";
        this.shop_hyper = hyper;

        this.acceptCOD = false;

        // Select gateway:

        this.showSelectGateway = true;
        this.exist_payment_form = true;
      }, 800)
    );
  },

  mounted() {
    this.getPaymentQue();
    this.interval = setInterval(() => {
      // Get today's date and time
      let now = new Date().getTime();

      this.paymentQue.forEach((item) => {
        // Find the distance between now and the count-down date
        let distance = item.expire.getTime() - now;
        // Time calculations for days, hours, minutes and seconds
        item.progress = Math.floor(distance / 1000);
      });
      this.paymentQue = this.paymentQue.filter((obj) => {
        return obj.progress > 0;
      });

      // If the count down is over, write some text
      if (this.paymentQue.length <= 0) {
        clearInterval(this.interval);
      }
    }, 5000);

    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬
    //--------------------------- Stripe Redirect Handler ----------------------------------
    if (this.$route.query.source && this.$route.query.client_secret) {
    }
    // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬
  },
  beforeDestroy() {
    if (this.interval) clearInterval(this.interval);

    this.EventBus.$off("payment-form-basket");
    this.EventBus.$off("try-to-pay");
  },
  methods: {
    buy({ gateway, amount_check, gift_cards, params, callback_paypal }) {
      //console.log("gateway", gateway);
      //console.log("gift_cards", gift_cards);
      //console.log("params", params);

      this.buyBasketProduct(
        gateway,
        amount_check,
        gift_cards,
        params,
        callback_paypal
      );

      /*   if (this.type === "Physical") this.buyBasketProduct(gateway, gift_cards);
      else if (this.type === "virtual")
        this.buyVirtualProduct(gateway, gift_cards);*/
    },

    /**
     *
     * @param gateway
     * @param transaction_id
     * @param order_id        Only use for guest payment! 🥶 Guest
     *
     * @param force_reset_payment   Will force to create new payment and select payment options
     */
    getPendingPaymentInfo(
      gateway,
      transaction_id,
      order_id,
      force_reset_payment = false
    ) {
      this.busy_loading_payment = transaction_id;

      axios
        .get(
          window.XAPI.GET_PENDING_PAYMENT_INFO(
            this.shop_name,
            gateway,
            transaction_id
          ),
          {
            params: {
              code: !this.USER()
                ? LocalStorages.GetShopHistoryGuestCodeOfOrder(
                    order_id
                  ) /*🥶 Guest*/
                : undefined,

              force_reset_payment: force_reset_payment,
            },
          }
        )
        .then(({ data }) => {
          console.log("Received information...", data);

          // ―――――――― Reset Order ――――――――
          if (force_reset_payment && data.reset) {
            this.fetchBasketAndShop();
            this.$router.push({
              name: window.$storefront.routes.BASKET_PAGE,
              params: { type: data.order.type },
            });
            this.showSuccessAlert(
              "Reopen Order",
              "We've successfully reopened this order, allowing you to attempt payment with a different method."
            );
            return;
          }

          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
            this.fetchBasketAndShop(); // Refresh!
            return;
          }
          // ―――――――― Payment succeeded ――――――――

          if (data.success) {
            this.showSuccessAlert(
              this.$t("master_payment.notifications.payment_success_title"),
              this.$t("master_payment.notifications.payment_success")
            );

            const _refreshing_page = this.goToOrderInfo(
              data.order_type,
              data.order_id
            );
            if (!_refreshing_page) {
              this.fetchBasketAndShop(); // Refresh!
              this.OnPaymentCompleted(data.order_type, data.order_id); // Send global signal (refresh basket or pos basket poge if needed!)
            }

            return;
          }

          // ―――――――― Payment Waiting ――――――――

          this.currency = Currency[data.currency];

          // * Fill payment form:
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

          if (data.status === "Processing") {
            this.showWarningAlert(
              "Processing",
              "Payment on processing, require no more actions."
            );
          }
          // ―――――――― Direct payment  ――――――――
          if (data.dir) {
            this.goToOrderInfo(data.order_type, data.target_id);
            return;
          }

          // ―――――――― Interval check payment mode ――――――――                Use: blockchain

          // Restart interval checking:
          if (
            data.interval_check &&
            data.gateway_code &&
            data.transaction_id &&
            data.unique_id &&
            data.timeout &&
            data.interval
          ) {
            _.delay(() => {
              if (this.$refs.payment_form)
                this.$refs.payment_form.pollIntervalPaymentStatus(
                  data.gateway_code,
                  data.transaction_id,
                  data.unique_id,
                  data.timeout * 1000,
                  data.interval * 1000
                );
            }, 1000);
          }
          // ―――――――――――――――――――――――――――――――

          // Has QR code:
          if (data.address && data.amount && data.qr_code) {
            this.payment_form_qr_code = data.qr_code;
            this.timeout = data.timeout * 1000;

            this.$nextTick(function () {
              this.showSelectGateway = true;
              this.exist_payment_form = true;
            });
          }

          // is Stripe / Razorpay : (Complete payment on the site!)
          if (
            [
              "stripe",
              "razorpay",
              "paypal-standard",
              "mercadopago",
              "paymob",
              "squareup",
            ].includes(data.mode)
          ) {
            this.pack = data.pack;
            this.$nextTick(function () {
              this.showSelectGateway = true;
              this.exist_payment_form = true;
            });
            console.log("In site payment form.");
          }
        })
        .finally(() => {
          this.busy_loading_payment = null;
        });
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― Buy ▶ Basket ―――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    buyBasketProduct(
      gateway,
      amount_check,
      gift_cards,
      params,
      callback_paypal
    ) {
      this.busy_buy = true;
      // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
      let guest_code = LocalStorages.GetShopGuestCode(); // Auto set in headers!

      let url = window.XAPI.POST_BUY_BASKET(this.shop_name, this.type, gateway);

      if (
        BasketHelper.IsServiceAndNeedPricing(
          this.order
        ) /*this.type === "SERVICE"*/
      ) {
        console.log("It needs pricing by the seller after checkout.");
        url = window.XAPI.POST_PAY_BILL(
          this.shop_name,
          this.shop_bill.order_id,
          this.shop_bill.id,
          gateway
        );
        // ▀▀▀▀▀▀▀▀▀ 🥶 Guest ▀▀▀▀▀▀▀▀▀
        guest_code = LocalStorages.GetShopHistoryGuestCodeOfOrder(
          this.shop_bill.order_id
        ); // Service payments are after basket reservation! (Bills payments)
      } else if (this.type === "AVOCADO") {
        url = window.XAPI.POST_PAY_AVOCADO(
          this.shop_name,
          this.shop_avocado.hash,
          gateway
        );
      } else if (this.type === "HYPER") {
        url = window.XAPI.POST_PAY_HYPER(this.shop_name, gateway);
      }

      axios
        .post(url, {
          code: !this.USER() ? guest_code : undefined /*🥶 Guest*/,

          amount_check: amount_check,
          delivery_price: this.bill.delivery_price,

          currency: this.currency.code,

          return: this.GetCurrentShopUrl(),

          gift_cards: gift_cards,

          selected_variant_id: this.prize_selected_variant_id, // Selected prize variant by customer!

          ...params,
        })
        .then(({ data }) => {
          this.need_refresh = !(data.link && data.method); // Need refresh after close. not refresh if in need to redirect to payment site! (Prevent empty basket page show!)
          this.keeped_data_to_callback = null;

          if (!data.error) {
            // * Fill payment form:
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

            // ―――――――― Add Payment que if exist ――――――――
            if (data.que) {
              const pending_transactions = this.GetPendingTransactions();
              pending_transactions.push(data.que);
              this.$store.commit(
                "setPendingTransactions",
                pending_transactions
              );
            }

            // ―――――――― Interval check payment mode ――――――――                Use: blockchain
            if (
              data.interval_check &&
              data.gateway_code &&
              data.transaction_id &&
              data.unique_id &&
              data.timeout &&
              data.interval
            ) {
              // Start interval checking:
              this.$refs.payment_form.pollIntervalPaymentStatus(
                data.gateway_code,
                data.transaction_id,
                data.unique_id,
                data.timeout * 1000,
                data.interval * 1000
              );
            }

            // ―――――――― Giftcards payment ―――――――― ➔ Payment by Gift cards completed
            if (data.payed_by_gift_card) {
              this.showSuccessAlert(
                this.$t("master_payment.notifications.buy_title"),
                this.$t("master_payment.notifications.pay_by_giftcards")
              );

              this.onFinishPayment(data);

              this.delayedHide();
            }

            // ――――――――  Free order ――――――――  ➔ Payment Free order completed
            else if (data.free_order) {
              this.showSuccessAlert(
                this.$t("master_payment.notifications.buy_title"),
                this.$t("master_payment.notifications.free_order")
              );
              this.onFinishPayment(data);

              this.delayedHide();
            }

            // ―――――――― Cash on delivery ――――――――  ➔ Payment by COD
            else if (data.cod) {
              this.showSuccessAlert(
                this.$t("master_payment.notifications.buy_title"),
                this.$t("master_payment.notifications.pay_by_cod")
              );
              this.onFinishPayment(data);

              this.delayedHide();
            }

            // ―――――――― Direct payment ――――――――  ➔ Payment by Card to card, bank money transfer ,...
            else if (data.dir) {
              this.showSuccessAlert(
                this.$t("master_payment.notifications.buy_title"),
                this.$t("master_payment.notifications.pay_by_dir")
              );
              this.onFinishPayment(data);

              this.delayedHide();
            }
            // ―――――――― QR Code ――――――――  ➔ Payment by QR code              Use: blockchain
            else if (data.address && data.amount && data.qr_code) {
              // 1. Set time out to remove QR code: Time out in form!

              // Keep value to redirect to order page: (callback)
              this.keeped_data_to_callback = data;

              // 2. Show success alert:
              this.showSuccessAlert(
                this.$t("master_payment.notifications.pay_title"),
                this.$t("master_payment.notifications.qr_code_payment")
              );

              // 3. Show qr code:
              this.$nextTick(function () {
                this.showSelectGateway = true;
              });
            }
            // ―――――――― Stripe / Razorpay / PayPal ――――――――    ➔ Payment by Stripe / Razorpay / paypal: (Complete payment on the site!)
            else if (
              [
                "stripe",
                "razorpay",
                "paypal",
                "paypal-standard",
                "mercadopago",
                "paymob",
                "squareup",
              ].includes(data.mode)
            ) {
              this.pack = data.pack;

              // Keep value to redirect to order page: (callback)
              this.keeped_data_to_callback = data;
            }

            // ―――――――― Other ―――――――― ➔ Payment by online gateway
            else {
              this.delayedHide();
              this.showSuccessAlert(
                this.$t("master_payment.notifications.pay_title"),
                this.$t(
                  "master_payment.notifications.connecting_to_online_gateway"
                )
              );
              // Now redirect by auto form submit...
            }
          } else {
            // Error response:

            this.showErrorAlert(null, data.error_msg);
            this.delayedHide();
          }

          // ➔ Payment by paypal:
          if (data.mode === "paypal") {
            if (callback_paypal) callback_paypal(data, null);
          }
        })
        .catch((error) => {
          this.need_refresh = true; // Need refresh after close.

          this.showLaravelError(error);
          this.delayedHide();

          // Scroll to top page:
          this.$vuetify.goTo(0, {
            duration: 800,
            offset: 0,
            easing: "easeInOutQuad",
          });
        })
        .finally(() => {
          this.busy_buy = false;
        });
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――― Generate payment que ――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    getPaymentQue() {
      let pending_transactions = this.GetPendingTransactions();

      //console.log("getPaymentQue ➡ GetPendingTransactions", pending_transactions);
      if (!pending_transactions) {
        // Clear pending transactions:
        pending_transactions = [];
      }

      let current_date = new Date();

      let out = [];

      let date = new Date();
      date.setMinutes(date.getMinutes() + 1);

      //    out.push({icon:Currency.BTC.icon,steps:1*60,progress:1*60,expire:date.toUTCString()})
      //     out.push({icon:Currency.BTC.icon,steps:1*60,progress:1*60,expire:date.toUTCString()})
      pending_transactions.forEach((que_item) => {
        let gatewayObject = this.shop.gateways.find((item) => {
          return item.code === que_item.code;
        });
        if (!gatewayObject) return;

        let issue = DateConverter.convertToLocalTime(que_item.issued_at);
        let expire = DateConverter.convertToLocalTime(que_item.expire_at);

        // expire.setSeconds(expire.getSeconds() + gatewayObject.timeout);

        if (expire.getTime() > current_date.getTime())
          out.push({
            id: que_item.transaction_id,
            gateway: gatewayObject.code,
            icon: gatewayObject.icon,
            steps: (expire.getTime() - issue.getTime()) / 1000,
            progress: (expire.getTime() - current_date.getTime()) / 1000,
            expire: expire,
            order_id: que_item.order_id,
          });
      });

      this.paymentQue = out;

      // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬
      //--------------------------- Stripe Redirect Handler ----------------------------------
      if (this.$route.query.source && this.$route.query.client_secret) {
        try {
          let item = this.paymentQue[this.paymentQue.length - 1];
          this.getPendingPaymentInfo(
            item.gateway,
            item.id,
            item.order_id /*Order ID*/
          );
        } catch (e) {
          console.error(e);
        }
      }
      // ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬
    },

    onFinishPayment(data) {
      this.keeped_data_to_callback = null;

      // console.log("on finish payment", data);
      if (this.callback) {
        this.callback(data);
      }
    },

    delayedHide() {
      this.showSelectGateway = false;

      if (this.need_refresh) {
        // Prevent refresh on pending transaction view!
        this.fetchBasketAndShop(); // Refresh Basket : maybe change in available quantity or price cause the error!
        this.need_refresh = false;
      }

      // Scroll to top page:
      this.$vuetify.goTo(0, {
        duration: 800,
        offset: 0,
        easing: "easeInOutQuad",
      });

      _.delay(() => {
        this.exist_payment_form = false;

        // Callback to open order page:
        if (this.keeped_data_to_callback) {
          this.onFinishPayment(this.keeped_data_to_callback);
        }
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

      if (data.link && data.method) {
        // Show redirect loading dialog:
        this.redirect_loading = true;
        // Submit form:
        this.$nextTick(() => {
          this.$refs.form_payment_internal.submit();
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-master-payment-dialog {
  position: relative;


}
.s--storefront-master-payment-circle-progress {
  user-select: none;
  position: fixed;
  top: 128px;
  left: 12px;
  z-index: 100;

  cursor: pointer;

  border-radius: 50%;
  background-color: white;
  transition: transform 0.25s ease;
  transform: scale(0.5);

  &:hover {
    transform: scale(1);
    z-index: 101;
  }
}

</style>
