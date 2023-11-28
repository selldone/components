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
  <div
    class="widget shadow my-3 mx-0 mx-md-3 border-top overflow-hidden pb-0"
    :class="{
      'border-warning': isRequireAction,
      'border-danger': isCanceled,
      'border-info': isProcessing,
      'border-success': isSucceeded && !isTestPayment,
      'border-lime': isCOD,
      'border-purple': isSucceeded && isTestPayment,
    }"
  >
    <h2 class="d-flex align-center">
      <v-icon class="me-1" color="#111">payment</v-icon>
      {{ $t("physical_order_page.payment.title") }}

      <v-spacer></v-spacer>
      <currency-icon :currency="order.currency" gradient></currency-icon>
    </h2>

    <v-subheader v-if="payment" class="px-0">
      <v-icon x-small :color="payment.livemode ? 'green' : 'amber'" class="me-1"
        >fas fa-circle</v-icon
      >
      {{
        payment.livemode ? $t("global.status.live") : $t("global.status.test")
      }}
    </v-subheader>

    <!-- Step 1 : بررسی پرداخت -->
    <div class="text-start">
      <p>
        <span class="h3" :class="{ 'text-muted': !isPayed }">
          {{ FormatNumberCurrency(order.price, order.currency) }}
          <span class="small">
            {{ GetUserSelectedCurrencyName(order.currency) }}</span
          >
        </span>

        <v-chip v-if="isRequireAction" color="warning" small class="mx-2">
          <v-icon small left> warning </v-icon>
          {{ $t("global.transaction_status.RequireAction") }}
        </v-chip>

        <v-chip v-if="isProcessing" color="blue" dark small class="mx-2">
          <v-icon small left> loop </v-icon>
          {{ $t("global.transaction_status.Processing") }}
        </v-chip>

        <v-chip v-if="isCanceled" color="red" dark small class="mx-2">
          <v-icon small left> close </v-icon>
          {{ $t("global.transaction_status.Canceled") }}
        </v-chip>

        <v-chip
          v-if="isSucceeded"
          :color="isTestPayment ? '#9C27B0' : 'success'"
          dark
          small
          class="mx-2"
        >
          <v-icon small left> check </v-icon>
          {{ $t("global.transaction_status.Succeeded") }}

          <span v-if="isTestPayment" class="ms-2"
            >({{ $t("global.status.test") }})</span
          >
        </v-chip>

        <v-chip
          v-if="order.subscription_id"
          color="#C2185B"
          dark
          small
          class="mx-2"
        >
          <v-icon small left> shopping_bag </v-icon>

          By Subscription
        </v-chip>
      </p>
    </div>

    <div
      class="mt-5 overflow-hidden"
      :class="{
        'mx-n5': $vuetify.breakpoint.smAndDown,
        'rounded-xl mb-4 border': !$vuetify.breakpoint.smAndDown,
      }"
    >
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-start min-width-200">
                {{ $t("physical_order_page.payment.table.title") }}
              </th>
              <th class="text-left min-width-150">
                {{ $t("physical_order_page.payment.table.amount") }}
              </th>
              <th class="text-start min-width-300">
                {{ $t("physical_order_page.payment.table.description") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!------------ Total price ------------>

            <tr class="text-start">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/baskets.svg"
                />
                {{ $t("physical_order_page.payment.total_price") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="
                    order.price +
                    order.discount -
                    (order.delivery_price > 0 ? order.delivery_price : 0)
                  "
                  :currency="order.currency"
                ></price-view>
              </td>
              <td></td>
            </tr>

            <!------------ Items discount (Products discount) ------------>

            <tr v-if="items_discount" class="text-start">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/product-discount-outline.svg"
                />
                {{ $t("physical_order_page.payment.total_items_discount") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="-items_discount"
                  :currency="order.currency"
                ></price-view>
              </td>
              <td></td>
            </tr>

            <!------------ Offer ------------>

            <tr v-if="total_offers" class="text-start">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/offer-outline.svg"
                />
                {{ $t("global.commons.offer") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="-total_offers"
                  :currency="order.currency"
                  not-show-zero
                ></price-view>
              </td>
              <td>
                <v-chip
                  v-for="(item, index) in offer_orders"
                  :key="index"
                  class="m-1"
                  color="blue"
                  dark
                >
                  <v-avatar left>
                    <img
                      :src="getProductImage(item.product_id, IMAGE_SIZE_SMALL)"
                    />
                  </v-avatar>

                  <price-view
                    :amount="item.amount_discount"
                    :currency="order.currency"
                  ></price-view>
                </v-chip>
              </td>
            </tr>
            <!------------ Discount Code ------------>

            <tr class="text-start" v-if="order.discount_order">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/discount-code-outline.svg"
                />
                {{ $t("physical_order_page.payment.discount_code") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="-discount_code_amount"
                  :currency="order.discount_order.currency"
                  not-show-zero
                ></price-view>
              </td>
              <td v-if="order.discount_order.discount_code">
                <p class="my-1">
                  {{ order.discount_order.discount_code.title }}
                </p>
                <p class="text-muted m-0 limited-text-300px">
                  {{ order.discount_order.discount_code.description }}
                </p>
              </td>
            </tr>

            <!------------ Coupon ------------>
            <tr class="text-start" v-if="order.coupon_order">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/coupon-outline.svg"
                />
                {{ $t("global.commons.coupon") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="-coupon_amount"
                  :currency="order.coupon_order.currency"
                  not-show-zero
                ></price-view>
              </td>
              <td v-if="order.coupon_order.coupon">
                <p class="my-1">{{ order.coupon_order.coupon.title }}</p>
                <p class="text-muted m-0 limited-text-300px">
                  {{ order.coupon_order.coupon.description }}
                </p>
              </td>
              <td v-else></td>
            </tr>

            <!------------ Customer Club ------------>
            <tr class="text-start" v-if="order.club_order && club">
              <td>
                <img
                  :src="club.icon_outline"
                  height="24"
                  width="24"
                  class="mx-2"
                />

                {{ $t("global.commons.customer_club") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="-club_amount"
                  :currency="order.club_order.currency"
                  not-show-zero
                ></price-view>
              </td>
              <td>
                <p class="my-1">
                  {{ $t(club.name) }}
                </p>
                <p class="text-muted m-0 limited-text-300px">
                  {{ order.club_order.club.description }}
                </p>
              </td>
            </tr>

            <!------------ Lottery ------------>
            <tr class="text-start" v-if="order.lottery_order">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/lottery-outline.svg"
                />
                {{ $t("global.commons.prize") }}
              </td>
              <td v-if="order.lottery_order.amount_discount" class="text-left">
                <price-view
                  :amount="-lottery_amount"
                  :currency="order.lottery_order.currency"
                ></price-view>
              </td>
              <td
                v-else-if="order.lottery_order.product"
                class="text-center"
                :title="order.lottery_order.product.title"
              >
                <div class="d-flex align-center">
                  <router-link
                    :to="{
                      name: window.$storefront.routes.PRODUCT_PAGE,
                      params: { product_id: order.lottery_order.product.id },
                    }"
                  >
                    <v-avatar class="me-2 hover-scale" size="28">
                      <img
                        :src="
                          getShopImagePath(order.lottery_order.product.icon)
                        "
                      />
                    </v-avatar>
                  </router-link>

                  <div class="flex-grow-1">
                    {{ order.lottery_order.product.title?.limitWords(4) }}
                  </div>
                </div>
              </td>
              <td v-else></td>

              <td>
                <variant-item-view-micro
                  v-if="order.lottery_order.variant"
                  :product-variant="order.lottery_order.variant"
                ></variant-item-view-micro>
              </td>
            </tr>

            <!------------ Cross Selling ------------>
            <tr class="text-start" v-if="total_cross_sells_discount">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/cross-sell-outline.svg"
                />
                {{ $t("global.commons.extra_discount") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="-total_cross_sells_discount"
                  :currency="order.currency"
                ></price-view>
              </td>

              <td></td>
            </tr>

            <!------------ Shipping ------------>

            <tr v-if="isPhysical && delivery_info" class="text-start">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/shipping-outline.svg"
                />
                {{ $t("physical_order_page.payment.delivery_fee") }}
              </td>
              <td class="text-left">
                <price-view
                  v-if="order.delivery_price >= 0"
                  :amount="order.delivery_price"
                  :currency="order.currency"
                ></price-view>

                <span v-else>{{
                  $t("physical_order_page.payment.delivery_fee_after")
                }}</span>
              </td>
              <td />
            </tr>

            <!------------ Tax ------------>

            <tr v-if="order.tax" class="text-start">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/tax-outline.svg"
                />
                {{ $t("global.commons.tax") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="order.tax"
                  :currency="order.currency"
                ></price-view>
              </td>
              <td>
                <span v-if="order.tax_included">{{
                  $t("global.commons.tax_included")
                }}</span>
              </td>
            </tr>

            <!------------ Tax Shipping ------------>

            <tr v-if="order.tax_shipping" class="text-start">
              <td>
                <img
                  height="24"
                  width="24"
                  class="mx-2"
                  src="../../../assets/icons/shipping-tax-outline.svg"
                />
                {{ $t("global.commons.tax_shipping") }}
              </td>
              <td class="text-left">
                <price-view
                  :amount="order.tax_shipping"
                  :currency="order.currency"
                ></price-view>
              </td>
              <td></td>
            </tr>

            <!------------ Gift cards ------------>
            <s-shop-row-customer-payment-gift-card
              v-for="giftcard in order.gift_cards"
              :key="'gif' + giftcard.number"
              :giftcard="giftcard"
            >
            </s-shop-row-customer-payment-gift-card>

            <!------------ Bills (For service or subscriptions) ------------>

            <template v-for="(bill, index) in bills">
              <tr
                :key="'bl-' + index"
                :class="{
                  'border-start-blue': bill.status === BillStatus.PENDING.code,
                  'border-start-green no-border-bottom-tr':
                    bill.status === BillStatus.PAYED.code,
                  'border-start-red': bill.status === BillStatus.CANCELED.code,
                }"
                @click="
                  expanded_bill = expanded_bill === bill.id ? null : bill.id
                "
                class="row-hover"
              >
                <td>
                  <div class="text-start py-1 d-flex align-center">
                    <v-icon class="mx-2" color="black">receipt_long</v-icon>

                    <div class="flex-grow-1">
                      <b>{{ $t("global.commons.bill") }} {{ bill.id }}</b>
                      <small
                        v-if="bill.payment?.payment_at"
                        class="d-block"
                        :title="$t('global.commons.payment_date')"
                      >
                        {{ getFromNowString(bill.payment.payment_at) }} ●
                        {{ getLocalTimeStringSmall(bill.payment.payment_at) }}
                      </small>
                      <small v-else class="d-block">Not paid yet!</small>
                    </div>

                    <i
                      v-if="bill.status === BillStatus.PENDING.code"
                      class="fas fa-spinner fa-spin m-1 blue--text"
                    ></i>
                    <img
                      v-else-if="bill.payment?.gateway?.logo"
                      :src="getShopImagePath(bill.payment?.gateway?.logo)"
                      height="20"
                    />
                  </div>
                </td>
                <td class="text-left">
                  <price-view
                    :amount="bill.price"
                    :currency="bill.currency"
                  ></price-view>
                </td>

                <td class="text-start">
                  <v-btn
                    v-if="
                      !isSubscription /*Manual payment not supported for subscription!*/ &&
                      bill.status === BillStatus.PENDING.code
                    "
                    color="success"
                    :large="current_bill_waiting === bill"
                    :depressed="current_bill_waiting !== bill"
                    :disabled="current_bill_waiting !== bill"
                    @click.stop="goToPaymentBill(bill)"
                    class="my-2"
                  >
                    <v-icon
                      v-if="current_bill_waiting === bill"
                      small
                      class="me-1 blink-me"
                      >lens</v-icon
                    >
                    {{ $t("global.actions.pay_now") }}
                  </v-btn>
                  <div v-if="bill.payment?.card" class="d-inline-block">
                    <payment-card
                      :method="bill.payment.method"
                      :card="bill.payment.card"
                      :currency="bill.payment.currency"
                      horizontal
                    ></payment-card>
                  </div>

                  <v-icon
                    v-if="bill.gift_cards?.length || bill.payment"
                    class="float-end"
                    :class="{ 'rotate-180': expanded_bill !== bill.id }"
                    >expand_more</v-icon
                  >
                </td>
              </tr>

              <template v-if="expanded_bill === bill.id">
                <!------------ Bills (For service / subscriptions)  > Gift cards ------------>
                <s-shop-row-customer-payment-gift-card
                  v-for="giftcard in bill.gift_cards"
                  :key="'bl-' + index + 'gif' + giftcard.number"
                  :giftcard="giftcard"
                  :class="{ 'no-border-bottom-tr': bill.payment }"
                  sub
                  class="fadeIn"
                >
                </s-shop-row-customer-payment-gift-card>

                <!------------ Bills (For service / subscriptions)  > Payment ------------>

                <s-shop-row-customer-payment-record
                  v-if="bill.payment"
                  :payment="bill.payment"
                  :key="'bl-pay' + index"
                  class="fadeIn"
                  sub
                >
                </s-shop-row-customer-payment-record>
              </template>
            </template>

            <!------------ Pending Payments ------------>
            <s-shop-row-customer-pending-payment
              v-for="(transaction_pending, index) in transactions_pending"
              :key="'pp' + index"
              :transaction="transaction_pending"
            >
            </s-shop-row-customer-pending-payment>

            <!------------ Payment ------------>

            <s-shop-row-customer-payment-record
              v-if="payment"
              :payment="payment"
              class="border-top-medium"
              :is-subscribed="isSubscription && order.status === 'Payed'"
              :is-unsubscribed="isSubscription && order.status === 'Canceled'"
            >
            </s-shop-row-customer-payment-record>
          </tbody>
        </template>
      </v-simple-table>

      <v-row
        v-if="has_subscription_portal"
        class="border-top bg-light"
        no-gutters
      >
        <v-col
          cols="12"
          class="p-2 row-hover pp"
          @click="createMyPortalUrl()"
          :class="{ disabled: busy_portal }"
        >
          <v-btn class="float-end" icon :loading="busy_portal"
            ><v-icon color="#1976D2">open_in_new</v-icon>
          </v-btn>

          <b class="d-block">
            <v-icon v-if="cache_portal" class="me-1 zoomIn" color="green"
              >check_circle</v-icon
            >
            <v-icon v-else class="me-1" color="#333">credit_card</v-icon>
            Subscription Portal</b
          >
          <small
            >Billing history / Current plans / Update card and payment methods
          </small>
        </v-col>
      </v-row>
      <v-row class="border-top bg-light" no-gutters>
        <v-col cols="12" sm="6" class="p-2">
          <p class="font-weight-bold text-muted small my-1">
            {{ $t("physical_order_page.payment.total_order_price_before_tax") }}
          </p>

          <price-view
            :amount="order.price"
            :currency="order.currency"
          ></price-view>
        </v-col>

        <v-col v-if="isPayed" cols="12" sm="6" class="p-2">
          <p class="font-weight-bold text-muted small my-1">
            {{ $t("physical_order_page.payment.buyer_payment") }}
            <span v-if="order.tax">+ {{ $t("global.commons.tax") }}</span>
          </p>

          <price-view
            :amount="total_payed"
            :currency="order.currency"
          ></price-view>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { BasketStatus } from "@core/enums/basket/BasketStatus";
import { PhysicalOrderStates } from "@core/enums/basket/PhysicalOrderStates";
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";

import VariantItemViewMicro from "@components/product/variant/VariantItemViewMicro.vue";
import { BillStatus } from "@core/enums/basket/BillStatus";
import GtagEcommerce from "@components/plugins/gtag/GtagEcommerce";
import SShopRowCustomerPaymentGiftCard from "@components/storefront/order/payment/rows/SShopRowCustomerPaymentGiftCard.vue";
import SShopRowCustomerPaymentRecord from "@components/storefront/order/payment/rows/SShopRowCustomerPaymentRecord.vue";
import SShopRowCustomerPendingPayment from "@components/storefront/order/payment/rows/SShopRowCustomerPendingPayment.vue";
import { ProductType } from "@core/enums/product/ProductType";
import CurrencyIcon from "@components/ui/currency/CurrencyIcon.vue";
import PaymentCard from "@components/payment/widgets/PaymentCard.vue";
import { URLHelper } from "@core/helper/url/URLHelper";

export default {
  name: "SShopCustomerOrderPaymentWidget",
  components: {
    PaymentCard,
    CurrencyIcon,
    SShopRowCustomerPendingPayment,
    SShopRowCustomerPaymentRecord,
    SShopRowCustomerPaymentGiftCard,
    VariantItemViewMicro,
  },
  props: {
    order: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      PhysicalOrderStates: PhysicalOrderStates,
      BillStatus: BillStatus,

      busy_try_pay: false,

      expanded_bill: null,

      //-------------------------
      busy_portal: false,
      cache_portal: null,
    };
  },

  computed: {
    isPhysical() {
      return this.order.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.order.type === ProductType.VIRTUAL.code;
    },
    isFile() {
      return this.order.type === ProductType.FILE.code;
    },
    isService() {
      return this.order.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.order.type === ProductType.SUBSCRIPTION.code;
    },
    transactions_pending() {
      return this.order.transactions_pending;
    },

    payment() {
      return this.order.payment;
    },
    gateway() {
      if (!this.payment) return null;
      return this.payment.gateway;
    },

    isPayed() {
      return this.order.status === "Payed";
    },

    isRequireAction() {
      return (
        !this.isPayed &&
        this.transactions_pending.some(
          (item) => item.status === "RequireAction"
        )
      );
    },
    isProcessing() {
      return (
        !this.isPayed &&
        this.transactions_pending.some((item) => item.status === "Processing")
      );
    },
    isCanceled() {
      return (
        !this.isPayed &&
        this.transactions_pending.some((item) => item.status === "Canceled")
      );
    },
    isSucceeded() {
      return this.isPayed;
    },

    isTestPayment() {
      return this.payment && !this.payment.livemode;
    },

    isCOD() {
      return this.codEnable && this.order.status === BasketStatus.COD.code;
    },

    delivery_info() {
      return this.order.delivery_info;
    },

    transportationTypeObject() {
      if (!this.delivery_info) return null;
      return ShopTransportations[this.delivery_info.type];
    },

    offer_orders() {
      return this.order.offer_orders;
    },
    total_offers() {
      if (!this.offer_orders) return 0;
      let sum = 0;

      this.offer_orders.forEach((item) => (sum += item.amount_discount));

      return sum;
    },

    discount_code_amount() {
      return this.order.discount_order
        ? this.order.discount_order.amount_discount
        : 0;
    },

    coupon_amount() {
      return this.order.coupon_order
        ? this.order.coupon_order.amount_discount
        : 0;
    },

    club_amount() {
      return this.order.club_order ? this.order.club_order.amount_discount : 0;
    },

    lottery_amount() {
      return this.order.lottery_order
        ? this.order.lottery_order.amount_discount
        : 0;
    },

    items_discount() {
      return (
        this.order.discount -
        (this.total_offers +
          this.discount_code_amount +
          this.coupon_amount +
          this.club_amount +
          this.lottery_amount +
          this.total_cross_sells_discount)
      );
    },

    total_payed() {
      let out = 0;

      // Payment of bills:
      if (this.bills?.length) {
        this.bills.forEach((bill) => {
          if (bill.payment) out += bill.payment.amount;
        });
      }
      // Normal payment:
      else {
        if (this.payment) out += this.payment.amount;
      }

      if (this.gift_cards)
        this.gift_cards.forEach((item) => {
          out += item.amount;
        });

      return out;
    },

    bills() {
      return this.order.bills;
    },

    current_bill_waiting() {
      return this.bills.find((it) => it.status === BillStatus.PENDING.code); // return first bill waiting for payment
    },

    has_subscription_portal() {
      return this.isSubscription && this.gateway?.code?.startsWith("stripe_");
    },

    total_cross_sells_discount() {
      return this.order.items.reduce((accumulator, item) => {
        return accumulator + item.cross_dis;
      }, 0);
    },

    club() {
      return (
        this.order.club_order &&
        this.getCustomerClubLevel(this.order.club_order.club.level)
      );
    },
  },
  methods: {
    //―――――――――――――――――――――― Final Step > Go to payment bill (Service) ――――――――――――――――――――

    goToPaymentBill(bill) {
      this.ShowPaymentDialogBill(this.order.code, this.order, bill, () => {
        this.$emit("request:refresh"); // Refresh order info...
      });

      GtagEcommerce.MeasuringCheckoutSteps(this.order, 2, null);
    },

    //―――――――――――――――――――――― 🎗️ Subscription > Portal ――――――――――――――――――――

    createMyPortalUrl() {
      if (this.cache_portal) {
        return URLHelper.OpenInNewWindow(this.cache_portal);
      }
      this.busy_portal = true;

      axios
        .post(
          window.XAPI.POST_BASKET_CREATE_SUBSCRIPTION_PORTAL_URL(
            this.getShop().name,
            this.order.id
          )
        )
        .then(({ data }) => {
          if (!data.error) {
            this.cache_portal = data.url;
            URLHelper.OpenInNewWindow(data.url);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_portal = false;
        });
    },
  },
};
</script>

<style scoped></style>
