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
    :class="{
      'border-warning': isRequireAction,
      'border-danger': isCanceled,
      'border-info': isProcessing,
      'border-success': isSucceeded && !isTestPayment,
      'border-lime': isCOD,
      'border-purple': isSucceeded && isTestPayment,
    }"
    class="widget shadow my-3 mx-0 mx-md-3 border-top overflow-hidden pb-0"
  >
    <h2 class="d-flex align-center">
      <v-icon class="me-1" color="#111">payment</v-icon>
      {{ $t("order_page.payment.title") }}

      <v-spacer></v-spacer>
      <u-currency-icon :currency="order.currency" gradient></u-currency-icon>
    </h2>

    <v-list-subheader v-if="payment" class="px-0">
      <v-icon
        :color="payment.livemode ? 'green' : 'amber'"
        class="me-1"
        size="x-small"
        >fa:fas fa-circle
      </v-icon>
      {{
        payment.livemode ? $t("global.status.live") : $t("global.status.test")
      }}
    </v-list-subheader>

    <!-- Step 1 : Check Payment -->
    <div class="text-start">
      <p>
        <span :class="{ 'text-muted': !isPayed }" class="h3">
          {{ FormatNumberCurrency(order.price, order.currency) }}
          <span class="small">
            {{ GetUserSelectedCurrencyName(order.currency) }}</span
          >
        </span>

        <v-chip
          v-if="isRequireAction"
          class="mx-2"
          color="warning"
          size="small"
          variant="flat"
        >
          <v-icon start> warning</v-icon>
          {{ $t("global.transaction_status.RequireAction") }}
        </v-chip>

        <v-chip
          v-if="isProcessing"
          class="mx-2"
          color="blue"
          size="small"
          variant="flat"
        >
          <v-icon start> loop</v-icon>
          {{ $t("global.transaction_status.Processing") }}
        </v-chip>

        <v-chip
          v-if="isCanceled"
          class="mx-2"
          color="red"
          size="small"
          variant="flat"
        >
          <v-icon start> close</v-icon>
          {{ $t("global.transaction_status.Canceled") }}
        </v-chip>

        <v-chip
          v-if="isSucceeded"
          :color="isTestPayment ? '#9C27B0' : 'success'"
          class="mx-2"
          variant="flat"
          size="small"
        >
          <v-icon start> check</v-icon>
          {{ $t("global.transaction_status.Succeeded") }}

          <b v-if="isTestPayment" class="ms-1"
            >● {{ $t("global.status.test") }}</b
          >
        </v-chip>

        <v-chip
          v-if="order.subscription_id"
          class="mx-2"
          color="#C2185B"
          size="small"
          variant="flat"
        >
          <v-icon start> shopping_bag</v-icon>

          By Subscription
        </v-chip>
      </p>
    </div>

    <div
      :class="{
        'mx-n5': $vuetify.display.smAndDown,
        'rounded-xl mb-4 border': !$vuetify.display.smAndDown,
      }"
      class="mt-5 overflow-hidden"
    >
      <v-table style="border-radius: unset">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-start min-width-200">
                {{ $t("order_page.payment.table.title") }}
              </th>
              <th class="text-left min-width-150">
                {{ $t("order_page.payment.table.amount") }}
              </th>
              <th class="text-start min-width-300">
                {{ $t("order_page.payment.table.description") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!------------ Total price ------------>

            <tr class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/baskets.svg"
                  width="24"
                />
                {{ $t("order_page.payment.total_price") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="
                    order.price +
                    order.discount -
                    (order.delivery_price > 0 ? order.delivery_price : 0)
                  "
                  :currency="order.currency"
                ></u-price>
              </td>
              <td></td>
            </tr>

            <!------------ Items discount (Products discount) ------------>

            <tr v-if="items_discount" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/product-discount-outline.svg"
                  width="24"
                />
                {{ $t("order_page.payment.total_items_discount") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="-items_discount"
                  :currency="order.currency"
                ></u-price>
              </td>
              <td></td>
            </tr>

            <!------------ Offer ------------>

            <tr v-if="total_offers" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/offer-outline.svg"
                  width="24"
                />
                {{ $t("global.commons.offer") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="-total_offers"
                  :currency="order.currency"
                  not-show-zero
                ></u-price>
              </td>
              <td>
                <v-chip
                  v-for="(item, index) in offer_orders"
                  :key="index"
                  class="m-1"
                  color="blue"
                  variant="flat"
                >
                  <v-avatar start>
                    <img
                      :src="getProductImage(item.product_id, IMAGE_SIZE_SMALL)"
                    />
                  </v-avatar>

                  <u-price
                    :amount="item.amount_discount"
                    :currency="order.currency"
                  ></u-price>
                </v-chip>
              </td>
            </tr>
            <!------------ Discount Code ------------>

            <tr v-if="order.discount_order" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/discount-code-outline.svg"
                  width="24"
                />
                {{ $t("order_page.payment.discount_code") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="-discount_code_amount"
                  :currency="order.discount_order.currency"
                  not-show-zero
                ></u-price>
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
            <tr v-if="order.coupon_order" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/coupon-outline.svg"
                  width="24"
                />
                {{ $t("global.commons.coupon") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="-coupon_amount"
                  :currency="order.coupon_order.currency"
                  not-show-zero
                ></u-price>
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
            <tr v-if="order.club_order && club" class="text-start">
              <td>
                <img
                  :src="club.icon_outline"
                  class="mx-2"
                  height="24"
                  width="24"
                />

                {{ $t("global.commons.customer_club") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="-club_amount"
                  :currency="order.club_order.currency"
                  not-show-zero
                ></u-price>
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
            <tr v-if="order.lottery_order" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/lottery-outline.svg"
                  width="24"
                />
                {{ $t("global.commons.prize") }}
              </td>
              <td v-if="order.lottery_order.amount_discount" class="text-left">
                <u-price
                  :amount="-lottery_amount"
                  :currency="order.lottery_order.currency"
                ></u-price>
              </td>
              <td
                v-else-if="order.lottery_order.product"
                :title="order.lottery_order.product.title"
                class="text-center"
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
            <tr v-if="total_cross_sells_discount" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/cross-sell-outline.svg"
                  width="24"
                />
                {{ $t("global.commons.extra_discount") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="-total_cross_sells_discount"
                  :currency="order.currency"
                ></u-price>
              </td>

              <td></td>
            </tr>

            <!------------ Shipping ------------>

            <tr v-if="isPhysical && delivery_info" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/shipping-outline.svg"
                  width="24"
                />
                {{ $t("order_page.payment.delivery_fee") }}
              </td>
              <td class="text-left">
                <u-price
                  v-if="order.delivery_price >= 0"
                  :amount="order.delivery_price"
                  :currency="order.currency"
                ></u-price>

                <span v-else>{{
                  $t("order_page.payment.delivery_fee_after")
                }}</span>
              </td>
              <td />
            </tr>

            <!------------ Tax ------------>

            <tr v-if="order.tax" class="text-start">
              <td>
                <img
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/tax-outline.svg"
                  width="24"
                />
                {{ $t("global.commons.tax") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="order.tax"
                  :currency="order.currency"
                ></u-price>
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
                  class="mx-2"
                  height="24"
                  src="../../../assets/icons/shipping-tax-outline.svg"
                  width="24"
                />
                {{ $t("global.commons.tax_shipping") }}
              </td>
              <td class="text-left">
                <u-price
                  :amount="order.tax_shipping"
                  :currency="order.currency"
                ></u-price>
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

            <template v-for="(bill, index) in bills" :key="'bl-' + index">
              <tr
                :class="{
                  'border-start-blue': bill.status === BillStatus.PENDING.code,
                  'border-start-green no-border-bottom-tr':
                    bill.status === BillStatus.PAYED.code,
                  'border-start-red': bill.status === BillStatus.CANCELED.code,
                }"
                class="row-hover"
                @click="
                  expanded_bill = expanded_bill === bill.id ? null : bill.id
                "
              >
                <td>
                  <div class="text-start py-1 d-flex align-center">
                    <v-icon class="mx-2" color="black">receipt_long</v-icon>

                    <div class="flex-grow-1">
                      <b>{{ $t("global.commons.bill") }} {{ bill.id }}</b>
                      <small
                        v-if="bill.payment?.payment_at"
                        :title="$t('global.commons.payment_date')"
                        class="d-block"
                      >
                        {{ getFromNowString(bill.payment.payment_at) }} ●
                        {{ getLocalTimeStringSmall(bill.payment.payment_at) }}
                      </small>
                      <small v-else class="d-block">Not paid yet!</small>
                    </div>

                    <i
                      v-if="bill.status === BillStatus.PENDING.code"
                      class="fas fa-spinner fa-spin m-1 text-blue"
                    ></i>
                    <img
                      v-else-if="bill.payment?.gateway?.logo"
                      :src="getShopImagePath(bill.payment?.gateway?.logo)"
                      height="20"
                    />
                  </div>
                </td>
                <td class="text-left">
                  <u-price
                    :amount="bill.price"
                    :currency="bill.currency"
                  ></u-price>
                </td>

                <td class="text-start">
                  <div
                    v-if="
                      bill.payment?.status ===
                      TransactionStatus.RequireCapture.code
                    "
                    class="small"
                  >
                    <v-icon class="me-1" size="small">check</v-icon>
                    {{
                      $t(
                        "order_page.payment.payment_is_in_require_capture_message",
                      )
                    }}
                  </div>
                  <div
                    v-else-if="
                      !isSubscription /*Manual payment not supported for subscription!*/ &&
                      bill.status === BillStatus.PENDING.code
                    "
                    class="widget-buttons my-1"
                  >
                    <v-btn
                      v-if="current_bill_waiting === bill"
                      :disabled="current_bill_waiting !== bill"
                      :size="current_bill_waiting === bill && 'x-large'"
                      :variant="current_bill_waiting !== bill && 'flat'"
                      color="success"
                      @click.stop="goToPaymentBill(bill)"
                    >
                      <v-icon
                        v-if="current_bill_waiting === bill"
                        class="me-1 blink-me"
                        size="small"
                        >lens
                      </v-icon>

                      {{ $t("global.actions.pay_now") }}
                    </v-btn>
                    <small v-else>
                      {{
                        $t("order_page.payment.settle_the_earlier_bill_first")
                      }}</small
                    >
                  </div>

                  <div v-if="bill.payment?.card" class="d-inline-block">
                    <u-payment-card
                      :card="bill.payment.card"
                      :currency="bill.payment.currency"
                      :method="bill.payment.method"
                      horizontal
                    ></u-payment-card>
                  </div>

                  <v-icon
                    v-if="bill.gift_cards?.length || bill.payment"
                    :class="{ 'rotate-180': expanded_bill !== bill.id }"
                    class="float-end"
                    >expand_more
                  </v-icon>
                </td>
              </tr>

              <template v-if="expanded_bill === bill.id">
                <!------------ Bills (For service / subscriptions)  > Gift cards ------------>
                <s-shop-row-customer-payment-gift-card
                  v-for="giftcard in bill.gift_cards"
                  :key="'bl-' + index + 'gif' + giftcard.number"
                  :class="{ 'no-border-bottom-tr': bill.payment }"
                  :giftcard="giftcard"
                  class="fadeIn"
                  sub
                >
                </s-shop-row-customer-payment-gift-card>

                <!------------ Bills (For service / subscriptions)  > Payment ------------>

                <s-shop-row-customer-payment-record
                  v-if="bill.payment"
                  :key="'bl-pay' + index"
                  :payment="bill.payment"
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
              :is-subscribed="isSubscription && order.status === 'Payed'"
              :is-unsubscribed="isSubscription && order.status === 'Canceled'"
              :payment="payment"
              class="border-top-medium"
            >
            </s-shop-row-customer-payment-record>
          </tbody>
        </template>
      </v-table>

      <v-row
        v-if="has_subscription_portal"
        class="border-top bg-light"
        no-gutters
      >
        <v-col
          :class="{ disabled: busy_portal }"
          class="p-2 row-hover pp"
          cols="12"
          @click="createMyPortalUrl()"
        >
          <v-btn :loading="busy_portal" class="float-end" icon>
            <v-icon color="#1976D2">open_in_new</v-icon>
          </v-btn>

          <b class="d-block">
            <v-icon v-if="cache_portal" class="me-1 zoomIn" color="green"
              >check_circle
            </v-icon>
            <v-icon v-else class="me-1" color="#333">credit_card</v-icon>
            Subscription Portal</b
          >
          <small
            >Billing history / Current plans / Update card and payment methods
          </small>
        </v-col>
      </v-row>
      <v-row class="border-top bg-light" no-gutters>
        <v-col class="p-2" cols="12" sm="6">
          <p class="font-weight-bold text-muted small my-1">
            {{ $t("order_page.payment.total_order_price_before_tax") }}
          </p>

          <u-price :amount="order.price" :currency="order.currency"></u-price>
        </v-col>

        <v-col v-if="isPayed" class="p-2" cols="12" sm="6">
          <p class="font-weight-bold text-muted small my-1">
            {{ $t("order_page.payment.buyer_payment") }}
            <span v-if="order.tax">+ {{ $t("global.commons.tax") }}</span>
          </p>

          <u-price :amount="total_payed" :currency="order.currency"></u-price>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import { BasketStatus } from "@core/enums/basket/BasketStatus";
import { PhysicalOrderStates } from "@core/enums/basket/PhysicalOrderStates";
import { ShopTransportations } from "@core/enums/logistic/ShopTransportations";

import VariantItemViewMicro from "@components/storefront/product/variant/VariantItemViewMicro.vue";
import { BillStatus } from "@core/enums/basket/BillStatus";
import { GtagEcommerce } from "@components/plugins/gtag/GtagEcommerce";
import SShopRowCustomerPaymentGiftCard from "@components/storefront/order/payment/rows/SShopRowCustomerPaymentGiftCard.vue";
import SShopRowCustomerPaymentRecord from "@components/storefront/order/payment/rows/SShopRowCustomerPaymentRecord.vue";
import SShopRowCustomerPendingPayment from "@components/storefront/order/payment/rows/SShopRowCustomerPendingPayment.vue";
import { ProductType } from "@core/enums/product/ProductType";
import UCurrencyIcon from "@components/ui/currency/icon/UCurrencyIcon.vue";
import UPaymentCard from "@components/ui/payment/card/UPaymentCard.vue";
import { URLHelper } from "@core/helper/url/URLHelper";
import { TransactionStatus } from "@core/enums/payment/TransactionStatus";

export default {
  name: "SShopCustomerOrderPaymentWidget",
  components: {
    UPaymentCard,
    UCurrencyIcon,
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
      TransactionStatus: TransactionStatus,
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
          (item) => item.status === "RequireAction",
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
      return this.order.bills?.sortByKey("id", true);
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
            this.order.id,
          ),
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
