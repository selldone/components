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
  <v-table v-bind="$attrs">
    <template v-slot:default>
      <thead>
        <tr>
          <th class="text-start min-width-200">
            {{ $t("process_center.payment_widget.table.title") }}
          </th>
          <th class="text-left min-width-150">
            {{ $t("process_center.payment_widget.table.amount") }}
          </th>
          <th class="text-start min-width-200">
            {{ $t("process_center.payment_widget.table.description") }}
          </th>
          <th class="text-center min-width-200">
            {{ $t("process_center.payment_widget.table.info") }}
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Total price ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/baskets.svg"
              width="24"
            />
            {{ $t("process_center.payment_widget.total_price") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="
                order.price +wallet_paid+
                order.discount -
                (order.delivery_price > 0 ? order.delivery_price : 0)
              "
              :currency="order.currency"
            ></u-price>
          </td>
          <td></td>
          <td></td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Items discount (Products discount) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="items_discount" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/product-discount-outline.svg"
              width="24"
            />
            {{ $t("process_center.payment_widget.total_items_discount") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="-items_discount"
              :currency="order.currency"
            ></u-price>
          </td>
          <td></td>
          <td></td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Offer ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="total_offers" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/offer-outline.svg"
              width="24"
            />
            {{ $t("global.commons.offer") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="-total_offers"
              :currency="order.currency"
            ></u-price>
          </td>
          <td>
            <v-tooltip
              v-for="(item, index) in offer_orders"
              :key="index"
              color="#000"
              content-class="rounded-lg"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <v-chip class="m-1" color="blue" v-bind="props">
                  <v-avatar v-if="item.product_id" start>
                    <img
                      :src="getProductImage(item.product_id, IMAGE_SIZE_SMALL)"
                    />
                  </v-avatar>
                  <u-price
                    :amount="item.amount_discount"
                    :currency="order.currency"
                  ></u-price>
                </v-chip>
              </template>
              <div
                v-if="item.offer"
                class="text-start position-relative pt-14 min-width-150"
              >
                <v-avatar
                  v-if="item.product_id"
                  class="absolute-top-center mt-n10"
                  color="#000"
                  size="64"
                >
                  <img
                    v-if="item.product_id"
                    :src="getProductImage(item.product_id, IMAGE_SIZE_SMALL)"
                  />
                  <v-icon v-else>emoji_events</v-icon>
                </v-avatar>

                <p class="my-1 font-weight-bold">{{ item.offer.title }}</p>
                <p class="my-0">
                  {{ $t("global.commons.percent") }}: {{ item.offer.percent }}%
                </p>
                <p class="my-0">
                  {{ $t("global.commons.per_order") }}:
                  {{ item.offer.per_order }}
                </p>
                <p class="my-0">
                  {{ $t("global.commons.applied_count") }}: {{ item.count }}
                </p>
              </div>
            </v-tooltip>
          </td>
          <td class="text-start">
            <v-badge
              v-for="(item, index) in offer_orders"
              :key="index"
              :content="item.count"
              color="blue"
              floating
            >
              <v-avatar :size="32" class="hover-scale force-top">
                <img
                  :src="getProductImage(item.product_id, IMAGE_SIZE_SMALL)"
                />
              </v-avatar>
            </v-badge>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Discount Code ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="discount_order" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/discount-code-outline.svg"
              width="24"
            />
            {{ $t("process_center.payment_widget.discount_code.title") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="-discount_order.amount_discount"
              :currency="discount_order.currency"
              not-show-zero
            ></u-price>
          </td>
          <td>
            {{ discount_order.discount_code?.title }}
          </td>
          <td class="text-start">
            <div>
              <small class="me-1">
                {{
                  $t("process_center.payment_widget.discount_code.code")
                }}:</small
              >
              {{ discount_order.discount_code?.code }}
            </div>

            <div v-if="discount_order.discount_code">
              <span class="me-2"
                ><small class="me-1"
                  >{{
                    $t("process_center.payment_widget.discount_code.percent")
                  }}:</small
                >
                {{ discount_order.discount_code.percent }}%</span
              >

              <small class="me-1">
                {{
                  $t("process_center.payment_widget.discount_code.limit")
                }}:</small
              >

              <u-price
                :amount="discount_order.discount_code.limit"
                :currency="discount_order.discount_code.currency"
              ></u-price>
            </div>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Coupon ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="coupon_order" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/coupon-outline.svg"
              width="24"
            />
            {{ $t("process_center.payment_widget.coupon.title") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="-coupon_order.amount_discount"
              :currency="order.currency"
              not-show-zero
            ></u-price>
          </td>
          <td v-if="coupon_order.coupon">
            <p class="my-1">{{ coupon_order.coupon.title }}</p>
            <p class="text-muted m-0">
              {{ coupon_order.coupon.description }}
            </p>
          </td>
          <td class="text-start">
            <div v-if="coupon_order.coupon">
              <small class="me-1"
                >{{ $t("process_center.payment_widget.coupon.charge") }}:</small
              >
              <u-price
                :amount="coupon_order.coupon.charge"
                :currency="coupon_order.coupon.currency"
              ></u-price>
            </div>

            <div v-if="coupon_order.coupon">
              <small class="me-1">
                {{ $t("process_center.payment_widget.coupon.percent") }}:</small
              >
              {{ coupon_order.coupon.percent }}%
              <span class="mx-2">
                <small class="me-1">
                  {{ $t("process_center.payment_widget.coupon.limit") }}:</small
                >

                <u-price
                  :amount="coupon_order.coupon.limit"
                  :currency="coupon_order.coupon.currency"
                ></u-price>
              </span>
            </div>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Club Discount ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="club_order && club" class="text-start">
          <td>
            <img :src="club.icon_outline" class="mx-2" height="24" width="24" />
            {{ $t("process_center.payment_widget.club.title") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="-club_order.amount_discount"
              :currency="club_order.currency"
              not-show-zero
            ></u-price>
          </td>
          <td>
            {{ $t(club.name) }}
          </td>
          <td class="text-start">
            <div v-if="club_order.club">
              <small class="me-1">
                {{ $t("process_center.payment_widget.club.percent") }}:</small
              >
              <b class="small"> {{ club_order.club.percent }}%</b>
            </div>

            <div v-if="club_order.club">
              <small class="me-1">
                {{ $t("process_center.payment_widget.club.limit") }}:</small
              >

              <u-price
                :amount="club_order.club.limit"
                :currency="club_order.currency"
                class="small font-weight-bold"
              ></u-price>
            </div>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Lottery ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="lottery_order" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/lottery-outline.svg"
              width="24"
            />
            {{ $t("global.commons.prize") }}
          </td>
          <td v-if="lottery_order.amount_discount" class="text-left">
            <u-price
              :amount="-lottery_order.amount_discount"
              :currency="lottery_order.currency"
            ></u-price>
          </td>
          <td v-else-if="lottery_order.product">
            <router-link
              :to="
                isRolePanel
                  ? {}
                  : {
                      name: 'BPageProductDashboard',
                      params: { product_id: lottery_order.product.id },
                    }
              "
            >
              <v-avatar class="me-2 hover-scale" size="28">
                <img :src="getShopImagePath(lottery_order.product.icon)" />
              </v-avatar>
            </router-link>

            {{ lottery_order.product.title?.limitWords(6) }}
          </td>
          <td v-else></td>

          <td>
            <variant-item-view-micro
              v-if="lottery_order.variant"
              :product-variant="lottery_order.variant"
            ></variant-item-view-micro>
          </td>

          <td class="text-start">
            <div v-if="lottery_order.product" class="d-flex">
              <span class="w-50"
                ><small>SKU:</small>
                {{
                  lottery_order.variant
                    ? lottery_order.variant.sku
                    : lottery_order.product.sku
                }}</span
              >
              <span class="w-50"
                ><small>MPN:</small>
                {{
                  lottery_order.variant
                    ? lottery_order.variant.mpn
                    : lottery_order.product.mpn
                }}</span
              >
            </div>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Cross Selling ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="total_cross_sells_discount" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/cross-sell-outline.svg"
              width="24"
            />
            {{ $t("global.commons.cross_sell") }}
          </td>
          <td class="text-left">
            <u-price
              :amount="-total_cross_sells_discount"
              :currency="order.currency"
            ></u-price>
          </td>

          <td></td>

          <td></td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Shipping ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr
          v-if="isPhysical || (isAvocado && order.delivery)"
          class="text-start"
        >
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/shipping-outline.svg"
              width="24"
            />
            {{ $t("process_center.payment_widget.delivery.title") }}
          </td>
          <td class="text-left">
            <span v-if="order.delivery_price >= 0">
              <u-price
                :amount="order.delivery_price"
                :currency="order.currency"
              ></u-price>
            </span>
            <span v-else>{{
              $t("process_center.payment_widget.delivery.not_paid")
            }}</span>
          </td>
          <td />

          <td class="text-start">
            <div v-if="transportationTypeObject">
              <img
                :src="
                  shop_transportation?.logo
                    ? getShopImagePath(shop_transportation.logo)
                    : transportationTypeObject.icon
                "
                class="me-1"
                width="24px"
              />
              <b class="mx-1 small">{{
                shop_transportation?.title
                  ? shop_transportation?.title
                  : $t(transportationTypeObject.name)
              }}</b>
            </div>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 👛 ROW ▶ Wallet (Customer Wallet) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <b-order-payment-row-wallet
          v-if="order.wallet_transaction"
          key="wallet"
          :walletTransaction="order.wallet_transaction"
        >
        </b-order-payment-row-wallet>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Tax ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr
          v-if="order.tax"
          class="text-start"
          @click="show_tax_detail = !show_tax_detail"
        >
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/tax-outline.svg"
              width="24"
            />
            {{ $t("global.commons.tax") }}
          </td>
          <td class="text-left">
            <u-price :amount="order.tax" :currency="order.currency"></u-price>
          </td>
          <td>
            <span v-if="order.tax_included">{{
              $t("global.commons.tax_included")
            }}</span>
          </td>
          <td>
            <v-btn
              v-if="has_tax_detail"
              class="tnt"
              color="primary"
              variant="text"
              @click.stop="show_tax_detail = !show_tax_detail"
              :append-icon="
                show_tax_detail ? 'arrow_drop_up' : 'arrow_drop_down'
              "
              >{{
                show_tax_detail
                  ? $t("global.commons.hide")
                  : $t("global.commons.show_details")
              }}...
            </v-btn>
          </td>
        </tr>

        <b-order-payment-row-tax
          v-if="show_tax_detail && has_tax_detail"
          :order="order"
          :shop="shop"
          class="fadeIn"
        >
        </b-order-payment-row-tax>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Tax Shipping ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="order.tax_shipping" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/shipping-tax-outline.svg"
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
          <td></td>
        </tr>
        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Gift Cards ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <b-order-payment-row-giftcard
          v-for="item in gift_cards"
          :key="'gif' + item.number"
          :giftcard="item"
        >
        </b-order-payment-row-giftcard>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Pending Payments ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <b-order-payment-row-pending
          v-for="(transaction_pending, index) in transactions_pending"
          :key="'pp' + index"
          :busyCheck="busy_check"
          :transaction="transaction_pending"
          @check:payment="
            ({ gateway_code, unique_id, gateway_name }) =>
              checkPaymentStatus(gateway_code, unique_id, gateway_name)
          "
          @show-confirm-payment-dir="
            accept_action = false;
            dialog_customer_pay_money_dir = true;
          "
        >
        </b-order-payment-row-pending>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Bills > More than limit items ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
        <tr v-if="bills_count > 3" key="more-bills" class="text-start pen">
          <td class="py-2 font-weight-bold text-end" colspan="4">
            <router-link
              :to="
                isRolePanel
                  ? {}
                  : {
                      name: isSubscribed
                        ? 'BPageOrderSubscriptionBills'
                        : 'BPageOrderServiceBills',
                    }
              "
              class="peall"
            >
              <v-icon class="me-1" color="primary">more_horiz</v-icon>

              View old bills ({{ bills_count - 3 }})
            </router-link>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Bills > Add Bill (Service / Subscription) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <template v-for="(bill, index) in bills" :key="'bl-' + bill.id">
          <tr
            :class="{
              'border-start-blue': bill.status === BillStatus.PENDING.code,
              'border-start-green no-border-bottom-tr':
                bill.status === BillStatus.PAYED.code,
              'border-start-red': bill.status === BillStatus.CANCELED.code,
              'row-hover': bill.payment || bill.gift_cards?.length,
            }"
            class="text-start"
            @click="expanded_bill = expanded_bill === bill.id ? null : bill.id"
          >
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Payment Gateway ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <td>
              <div class="py-1 d-flex align-center">
                <v-icon class="mx-2" color="black">receipt_long</v-icon>
                <div class="flex-grow-1">
                  <b>{{ $t("global.commons.bill") }} {{ bill.id }}</b>
                  <small
                    v-if="bill.payment?.payment_at"
                    :title="
                      $t('global.commons.payment_date') +
                      ': ' +
                      getLocalTimeString(bill.payment.payment_at) +
                      ' ● ' +
                      getFromNowString(bill.payment.payment_at)
                    "
                    class="d-block"
                  >
                    {{ getLocalDateString(bill.payment.payment_at) }}
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
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Payment Amount ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <td class="text-left">
              <u-price :amount="bill.price" :currency="bill.currency"></u-price>
            </td>
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Payment Card ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <td>
              <div v-if="bill.payment?.card" class="d-inline-block">
                <u-payment-card
                  :card="bill.payment.card"
                  :currency="bill.payment.currency"
                  :method="bill.payment.method"
                  horizontal
                ></u-payment-card>
              </div>
            </td>
            <td>
              <div class="d-flex py-1 align-center">
                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Service Only [Require Capture] ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

                <v-chip
                  v-if="
                    bill.payment?.status ===
                    TransactionStatus.RequireCapture.code
                  "
                  class="mx-2"
                  color="#673AB7"
                  size="small"
                  title="You hold fund but to get money you need to capture it manually."
                >
                  <v-icon size="small" start> hourglass_empty</v-icon>
                  {{ $t("process_center.payment_widget.require_capture") }}
                </v-chip>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Service Only ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <template
                  v-else-if="
                    !isSubscription /*Manual payment not supported for subscription!*/ &&
                    bill.status !== BillStatus.PAYED.code
                  "
                >
                  <!-- ▃▃▃▃▃ Bill Manually Pay Actions ▃▃▃▃▃ -->

                  <v-btn-toggle
                    v-model="bill.status"
                    class="me-2 widget-toggle"
                    density="compact"
                    rounded
                    @update:model-value="(val) => updateBillStatus(bill, val)"
                  >
                    <v-btn
                      :loading="
                        busy_update_bill_status ===
                        bill.id + BillStatus.PENDING.code
                      "
                      :value="BillStatus.PENDING.code"
                      selected-class="blue-flat"
                    >
                      {{ $t(BillStatus.PENDING.title) }}
                    </v-btn>
                    <v-btn
                      :loading="
                        busy_update_bill_status ===
                        bill.id + BillStatus.CANCELED.code
                      "
                      :value="BillStatus.CANCELED.code"
                      selected-class="red-flat"
                    >
                      {{ $t(BillStatus.CANCELED.title) }}
                    </v-btn>
                  </v-btn-toggle>

                  <!-- ▃▃▃▃▃ Bill Menu ▃▃▃▃▃ -->
                  <v-menu class="ms-2">
                    <template v-slot:activator="{ props }">
                      <v-btn icon v-bind="props" variant="text">
                        <v-icon>more_vert</v-icon>
                      </v-btn>
                    </template>
                    <v-list class="text-start" rounded="xl">
                      <!-- ━━━━━━━━━━━━━━━━━ Bill action > Edit ━━━━━━━━━━━━━━━━━ -->

                      <v-list-item
                        :disabled="bill.status !== BillStatus.PENDING.code"
                        prepend-icon="edit"
                        @click="showEditBill(bill)"
                      >
                        <v-list-item-title>
                          {{ $t("global.actions.edit") }}
                        </v-list-item-title>
                      </v-list-item>

                      <!-- ━━━━━━━━━━━━━━━━━ Bill action > Delete ━━━━━━━━━━━━━━━━━ -->

                      <v-list-item
                        prepend-icon="delete"
                        @click="deleteBill(bill)"
                      >
                        <v-list-item-title>
                          {{ $t("global.actions.delete") }}
                        </v-list-item-title>
                      </v-list-item>

                      <!-- ━━━━━━━━━━━━━━━━━ Bill action >  Manual Pay ━━━━━━━━━━━━━━━━━ -->
                      <v-list-item
                        v-if="bill.status === BillStatus.PENDING.code"
                        @click="showManuallyPayment(bill)"
                      >
                        <template v-slot:prepend>
                          <v-icon color="success">lens</v-icon>
                        </template>
                        <v-list-item-title>
                          {{ $t("global.actions.cash_payment") }}
                        </v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </template>
                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Subscription only ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <template v-if="isSubscription">
                  <small>● Recurring payment.</small>
                </template>

                <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Bill > Expand more button ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
                <v-spacer></v-spacer>

                <v-icon
                  v-if="bill.gift_cards?.length || bill.payment"
                  :class="{ 'rotate-180': expanded_bill !== bill.id }"
                  >expand_more
                </v-icon>
              </div>
            </td>
          </tr>
          <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Bill > Extra Rows ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
          <template v-if="expanded_bill === bill.id">
            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Bill > Gift Cards (Service) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <b-order-payment-row-giftcard
              v-for="item in bill.gift_cards"
              :key="'gif-' + item.number"
              :class="{ 'no-border-bottom-tr': bill.payment }"
              :giftcard="item"
              class="fadeIn"
              sub
            >
            </b-order-payment-row-giftcard>

            <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Bills > Payment (Service / Subscription) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

            <b-order-payment-row-payment
              v-if="bill.payment"
              :key="'pay-' + index + 'pay'"
              :payment="bill.payment"
              class="fadeIn"
              has-map
              sub
              @payment-captured="$emit('fetch-order')"
            >
            </b-order-payment-row-payment>
          </template>
        </template>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Bills > Add Bill (Service) ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr
          v-if="can_add_pending_transaction"
          key="add-bill"
          class="text-start"
        >
          <td class="py-2" colspan="4">
            <v-btn
              :disabled="bills_remains <= 0"
              color="success"
              @click="showAddPayment()"
            >
              <v-icon start>add</v-icon>
              {{ $t("process_center.payment_widget.add_transaction") }}
            </v-btn>
            <p class="mb-0 mt-1 text-subtitle-2">
              {{ $t("process_center.payment_widget.add_transactions_message") }}
            </p>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Main Payment ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <b-order-payment-row-payment
          v-if="payment"
          key="pay"
          :payment="payment"
          class="border-top-medium"
          @payment-captured="$emit('fetch-order')"
        >
        </b-order-payment-row-payment>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Affiliate ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="affiliate_order" class="text-start position-relative">
          <td>
            <div class="d-flex align-center">
              <img
                class="mx-2"
                height="24"
                src="../../../../assets/icons/affiliate.svg"
              />
              {{ $t("process_center.payment_widget.affiliate.title") }}
              <v-spacer></v-spacer>
              <v-tooltip
                color="#000"
                content-class="rounded-lg"
                location="bottom"
                max-width="480px"
              >
                <template v-slot:activator="{ props }">
                  <v-btn
                    class="ms-1"
                    color="primary"
                    icon
                    size="small"
                    v-bind="props"
                    variant="text"
                  >
                    <v-icon>info</v-icon>
                  </v-btn>
                </template>

                <div class="text-start">
                  <p class="border-bottom border-white m-0 pb-1">
                    {{
                      $t(
                        "process_center.payment_widget.affiliate.affiliate_message",
                      )
                    }}
                  </p>

                  <products-dense-images-circles
                    v-if="
                      affiliate_order.products &&
                      Object.keys(affiliate_order.products).length
                    "
                    :ids="Object.keys(affiliate_order.products)"
                  ></products-dense-images-circles>
                  <span v-else>{{
                    $t("global.commons.apply_for_all_products")
                  }}</span>
                </div>
              </v-tooltip>
            </div>
          </td>
          <td class="text-left">
            <u-price
              :amount="affiliate_order.amount"
              :currency="affiliate.currency"
            ></u-price>
          </td>
          <td style="min-width: 300px">
            <div class="d-flex">
              <v-avatar
                v-if="affiliate.user_id"
                class="float-start hover-scale-small me-1"
                size="2.6em"
              >
                <v-img :src="getUserAvatar(affiliate.user_id)"></v-img>
              </v-avatar>

              <div class="w-50">
                <small>{{ $t("global.commons.name") }}:</small>
                {{ affiliate.name }}
                <br />
                <small>{{ $t("global.commons.email") }}:</small>
                {{ affiliate.email }}
              </div>

              <div class="ps-2">
                <template v-if="affiliate.commission">
                  <v-icon class="me-1">grain</v-icon>
                  {{ $t("global.commons.per_product") }}
                </template>
                <template v-else>
                  <small>{{ $t("global.commons.fix_commission") }}:</small>
                  {{ affiliate.fix }}
                  {{ affiliate.currency }}
                  <br />
                  <small>{{ $t("global.commons.percent_commission") }}:</small>
                  {{ affiliate.percent }}
                </template>
              </div>
            </div>
          </td>
          <td class="text-center">
            <v-btn-toggle
              :mandatory="affiliate_order.status !== 'PENDING'"
              :model-value="affiliate_order.status"
              :selected-class="'colored-flat'"
              class="widget-toggle mt-2"
              rounded
            >
              <v-btn
                :loading="busy_affiliate === 'ACCEPT'"
                class="me-1 -green"
                prepend-icon="check_circle"
                size="small"
                value="ACCEPT"
                @click="updateAffiliateStatus('ACCEPT')"
                >{{ $t("global.actions.accept") }}
              </v-btn>
              <v-btn
                :loading="busy_affiliate === 'REJECT'"
                class="ms-1 -red"
                prepend-icon="cancel"
                size="small"
                value="REJECT"
                @click="updateAffiliateStatus('REJECT')"
                >{{ $t("global.actions.reject") }}
              </v-btn>
            </v-btn-toggle>
          </td>
        </tr>

        <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ 🛕 ROW ▶ Selldone Fee ▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <tr v-if="wage" class="text-start">
          <td>
            <img
              class="mx-2"
              height="24"
              src="../../../../assets/icons/samin-token.svg"
            />
            {{ $t("process_center.payment_widget.samin.title") }}
          </td>
          <td class="text-left">
            <u-price :amount="wage" :currency="order.currency"></u-price>
          </td>
          <td>
            <small class="max-w-250 d-inline-block">{{
              $t("process_center.payment_widget.samin.description")
            }}</small>

            <v-btn
              v-if="linked_account"
              :to="
                isRolePanel
                  ? {}
                  : {
                      name: 'BPageAccountTransactions',
                      params: {
                        account_number: linked_account.account_number,
                      },
                    }
              "
              class="ma-1"
              color="primary"
              size="small"
              target="_blank"
              variant="text"
            >
              <v-icon start>wallet</v-icon>
              {{ linked_account.account_name?.limitWords(2) }}
              <v-icon end>open_in_new</v-icon>

              <v-tooltip
                v-if="linked_account"
                activator="parent"
                content-class="rounded-xl bg-black text-start"
                location="bottom"
                min-width="280"
              >
                <div class="d-flex align-center">
                  <v-icon class="me-1">wallet</v-icon>

                  {{ linked_account.account_name }}
                  <v-spacer></v-spacer>
                  <u-currency-icon
                    :currency="linked_account.currency"
                    class="ms-2"
                    flag
                  ></u-currency-icon>
                </div>
                <div class="font-weight-bold my-2">
                  {{ formatCard(linked_account.account_number) }}
                </div>

                <u-text-value-box label="Balance" vb50>
                  <template v-slot:value>
                    <u-price
                      :amount="linked_account.balance"
                      :currency="linked_account.currency"
                    ></u-price>
                  </template>
                </u-text-value-box>
                <u-text-value-box label="Locked" vb50>
                  <template v-slot:value>
                    <u-price
                      :amount="linked_account.locked"
                      :currency="linked_account.currency"
                    ></u-price>
                  </template>
                </u-text-value-box>
              </v-tooltip>
            </v-btn>
          </td>

          <td class="text-center">
            <v-chip
              :title="
                $t('process_center.payment_widget.samin.tooltip') +
                ' : ' +
                ((100 * wage) / final_price).toFixed(2) +
                '%'
              "
              color="#fafafa"
              size="small"
              variant="flat"
            >
              <v-icon color="green" size="12" start>
                fa:fas fa-dot-circle
              </v-icon>
              {{ $t("process_center.payment_widget.samin.percent") }}
              :
              {{ numeralFormat(wage / final_price, "0.[00]%") }}
            </v-chip>
          </td>
        </tr>
      </tbody>
    </template>
  </v-table>

  <!-- █████████████████████████ Dialog > Edit Bill █████████████████████████ -->

  <v-bottom-sheet
    v-model="edit_bill_dialog"
    max-width="680"
    width="98vw"
    content-class="rounded-t-xl"
  >
    <v-card v-if="selected_bill" rounded="t-xl" class="text-start">
      <v-card-title
        >{{ $t("process_center.payment_widget.edit_bill_dialog.title") }}
      </v-card-title>

      <v-card-text class="text-start">
        <div class="mb-5">
          {{ $t("process_center.payment_widget.edit_bill_dialog.message") }}
        </div>
        <u-price-input
          v-model="bill_price"
          :decimal="currency.floats"
          :disabled="!currency"
          :label="
            $t('process_center.payment_widget.add_bill_dialog.amount_input')
          "
          :rules="[GlobalRules.required()]"
          :suffix="$t(currency.name)"
          class="price-input strong-field"
          placeholder="0.00"
          required
        >
        </u-price-input>

        <div class="widget-buttons">
          <v-btn
            :variant="
              bill_price === bills_remains + selected_bill.price
                ? 'text'
                : 'elevated'
            "
            color="primary"
            size="x-large"
            @click="
              bill_price = bills_remains + selected_bill.price;
              $forceUpdate();
            "
          >
            <v-icon start>refresh</v-icon>
            Set remains amount:
            <u-price
              :amount="bills_remains + selected_bill.price"
              :currency="order.currency"
            ></u-price>
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="edit_bill_dialog = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :disabled="bill_price <= 0"
            :loading="busy_edit_bill"
            color="success"
            size="x-large"
            @click="editBillPrice()"
          >
            <v-icon start>save</v-icon>
            {{ $t("process_center.payment_widget.edit_bill_dialog.action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████████ Dialog > Add Bill █████████████████████████ -->

  <v-bottom-sheet
    v-model="add_bill_dialog"
    max-width="680"
    width="98vw"
    content-class="rounded-t-xl"
  >
    <v-card rounded="t-xl" class="text-start">
      <v-card-title>
        <v-icon class="me-2">note_add</v-icon>
        {{ $t("process_center.payment_widget.add_bill_dialog.title") }}
      </v-card-title>

      <v-card-text class="text-start">
        <div class="mb-5">
          {{ $t("process_center.payment_widget.add_bill_dialog.message") }}
        </div>
        <u-price-input
          v-model="bill_price"
          :decimal="currency.floats"
          :disabled="!currency"
          :label="
            $t('process_center.payment_widget.add_bill_dialog.amount_input')
          "
          :rules="[GlobalRules.required()]"
          :suffix="$t(currency.name)"
          class="price-input strong-field"
          placeholder="0.00"
          required
        >
        </u-price-input>

        <div class="widget-buttons">
          <v-btn
            :variant="bill_price === bills_remains ? 'text' : 'flat'"
            color="#000"
            size="x-large"
            @click="
              bill_price = bills_remains;
              $forceUpdate();
            "
          >
            <v-icon start>restart_alt</v-icon>
            Set remains amount:
            <u-price
              :amount="bills_remains"
              :currency="order.currency"
            ></u-price>
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="add_bill_dialog = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            :disabled="bill_price <= 0"
            :loading="busy_add_bill"
            color="primary"
            variant="elevated"
            size="x-large"
            @click="addBill()"
          >
            <v-icon start>add_box</v-icon>
            {{ $t("process_center.payment_widget.add_bill_dialog.action") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████████ Dialog > Confirm Cash Payment (For bill only) █████████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_pay_bill_by_cash"
    max-width="680"
    width="98vw"
    content-class="rounded-t-xl"
  >
    <v-card v-if="selected_bill_to_pay" rounded="t-xl" class="text-start">
      <v-card-title
        >{{
          $t("process_center.payment_widget.bill_cash_payment_dialog.title")
        }}
      </v-card-title>

      <v-card-text class="text-start">
        <div class="mb-5">
          {{
            $t("process_center.payment_widget.bill_cash_payment_dialog.message")
          }}
        </div>

        <u-smart-verify v-model="accept_action"></u-smart-verify>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_pay_bill_by_cash = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            v-for="item in cashGateways"
            :key="item.code"
            :class="{ disabled: !accept_action }"
            :loading="busy_pay"
            color="success"
            height="64"
            rounded
            size="x-large"
            variant="elevated"
            @click="
              confirmCashPaymentForBill(selected_bill_to_pay, item.gateway.code)
            "
          >
            <img
              :src="getShopImagePath(item.gateway.icon)"
              :width="24"
              class="mx-2"
            />

            <p class="my-0 mx-2">
              {{ item.gateway.name }}
              <br />
              <span class="small mx-2">
                {{
                  $t(
                    "process_center.payment_widget.bill_cash_payment_dialog.action",
                  )
                }}
              </span>
            </p>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>

  <!-- █████████████████████████ Dialog > Confirm DIR (Direct transfer money) Payment █████████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_customer_pay_money_dir"
    content-class="rounded-t-xl"
    max-width="680"
    width="98vw"
  >
    <v-card class="text-start" rounded="t-xl">
      <v-card-title>
        {{ $t("process_center.payment_widget.pay_dir_dialog.title") }}
      </v-card-title>

      <v-card-text class="text-start">
        <div class="mb-5">
          {{ $t("process_center.payment_widget.pay_dir_dialog.message") }}
        </div>
        <div class="rounded-lg pa-2 border my-3">
          <v-img
            v-for="im in receipt_images"
            :key="im"
            :src="getShopImagePath(im)"
            class="pointer-zoom-in"
            height="auto"
            rounded="lg"
            width="100%"
            @click="showFullscreen"
          ></v-img>
        </div>
        <u-smart-verify v-model="accept_action"></u-smart-verify>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="dialog_customer_pay_money_dir = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>
          <v-btn
            v-for="item in dirGateways"
            :key="item.code"
            :class="{ disabled: !accept_action }"
            :loading="busy_pay"
            color="success"
            height="64"
            rounded
            size="x-large"
            variant="flat"
            @click="confirmDIRPaymentCompleted(item.gateway.code)"
          >
            <img
              :src="getShopImagePath(item.gateway.icon)"
              :width="24"
              class="mx-2"
            />

            <p class="my-0 mx-2">
              {{ item.gateway.name }}
              <br />
              <span class="small mx-2">
                {{
                  $t(
                    "process_center.payment_widget.pay_dir_dialog.confirm_action",
                  )
                }}</span
              >
            </p>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import ProductsDenseImagesCircles from "../../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import VariantItemViewMicro from "../../../../storefront/product/variant/VariantItemViewMicro.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import BOrderPaymentRowPending from "../../../order/payment/row/pending/BOrderPaymentRowPending.vue";
import BOrderPaymentRowGiftcard from "../../../order/payment/row/giftcard/BOrderPaymentRowGiftcard.vue";
import BOrderPaymentRowPayment from "../../../order/payment/row/payment/BOrderPaymentRowPayment.vue";
import BillingPeriod from "@selldone/core-js/enums/subscription/BillingPeriod";
import BOrderPaymentRowTax from "../../../order/payment/row/tax/BOrderPaymentRowTax.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import UTextValueBox from "../../../../ui/text/value-box/UTextValueBox.vue";
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import USmartVerify from "../../../../ui/smart/verify/USmartVerify.vue";
import { Basket, Bill, PriceHelper } from "@selldone/core-js";
import BOrderPaymentRowWallet from "@selldone/components-vue/backoffice/order/payment/row/wallet/BOrderPaymentRowWallet.vue";

export default {
  name: "BOrderPaymentTable",
  components: {
    BOrderPaymentRowWallet,
    USmartVerify,
    UPriceInput,
    UTextValueBox,
    UCurrencyIcon,
    BOrderPaymentRowTax,

    BOrderPaymentRowPayment,
    BOrderPaymentRowGiftcard,
    BOrderPaymentRowPending,

    VariantItemViewMicro,
    ProductsDenseImagesCircles,
    UPaymentCard,
  },
  emits: ["fetch-order"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    order: {
      require: true,
      type: Object,
    },

    codEnable: {
      require: false,
      type: Boolean,
      default: false,
    },
    isRolePanel: Boolean,
  },

  data: function () {
    return {
      TransactionStatus: TransactionStatus,

      ProductType: ProductType,

      BillStatus: Bill.Status,

      dialog_customer_pay_money_dir: false,
      accept_action: false,

      PhysicalOrderStates: Basket.PhysicalOrderStates,

      busy_check: false,

      busy_affiliate: false,

      busy_pay: false,

      expanded_bill: null,

      //---------------------------------------------
      add_bill_dialog: false,
      bill_price: 0,
      busy_add_bill: false,

      //---------------------------------------------
      busy_update_bill_status: null,

      //---------------------------------------------
      edit_bill_dialog: false,
      selected_bill: null,
      busy_edit_bill: false,

      //---------------------------------------------
      dialog_pay_bill_by_cash: false,
      selected_bill_to_pay: null,

      //---------------------------------------------
      show_tax_detail: false,
    };
  },

  computed: {
    /**
     * 👛 Paid by customer wallet
     * @return {*|number}
     */
    wallet_paid() {
      return this.order.wallet_transaction
          ? this.order.wallet_transaction.amount
          : 0;
    },

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
    isAvocado() {
      return this.order.type === "AVO";
    },
    isPOS() {
      return this.order.type === "POS";
    },
    in_this_step() {
      const reserved = this.order.status === Basket.Status.Reserved.code;

      // console.log('===========',this.order.delivery_state ,reserved)
      if (this.isPhysical) {
        return (
          this.order.delivery_state ===
            Basket.PhysicalOrderStates.CheckQueue.code && reserved
        );
      } else if (this.isVirtual) {
        return (
          this.order.delivery_state ===
            Basket.VirtualOrderStates.CheckQueue.code && reserved
        );
      } else if (this.isFile) {
        return (
          this.order.delivery_state ===
            Basket.FileOrderStates.PreparingOrder.code && reserved
        );
      } else if (this.isService) {
        return (
          this.order.delivery_state ===
            Basket.ServiceOrderStates.CheckQueue.code &&
          reserved &&
          !this.in_service_billing_state
        );
      }

      // TODO: add POS! add Fulfilment!

      return false;
    },
    /**
     * Service pre checkout step:
     * All items must have service_item (set by seller in the service billing state)
     * @returns {boolean|*}
     */
    in_service_billing_state() {
      return this.isService && this.order.items.some((it) => !it.service_item);
    },
    can_add_pending_transaction() {
      return this.isService; // Always can edit bills (Not paid bills)
    },

    isPayed() {
      return this.order.status === "Payed";
    },

    card() {
      if (!this.payment) return null;
      return this.payment.card;
    },
    payment() {
      return this.order.payment;
    },

    gateway() {
      if (!this.payment) return null;
      return this.payment.gateway;
    },

    transactions_pending() {
      return this.order.transactions_pending;
    },

    billing_details() {
      if (!this.payment) return null;
      return this.payment.billing_details;
    },

    dirGateways() {
      if (!this.order) return null;
      return this.shop.shop_gateways.filter(
        (item) =>
          item.gateway.dir && item.gateway.currency === this.order.currency,
      );
    },

    cashGateways() {
      if (!this.order) return null;
      return this.shop.shop_gateways.filter(
        (item) =>
          item.gateway.cash && item.gateway.currency === this.order.currency,
      );
    },

    gift_cards() {
      return this.order.gift_cards;
    },

    discount_order() {
      return this.order.discount_order;
    },

    coupon_order() {
      return this.order.coupon_order;
    },

    club_order() {
      return this.order.club_order;
    },

    lottery_order() {
      return this.order.lottery_order;
    },

    club() {
      if (!this.club_order) return null;
      return this.getCustomerClubLevel(this.club_order.club.level);
    },

    wage() {
      /*🎗️ For auto created basket by subscriptions, we get wage on the bill payment step!*/
      if (this.order.subscription_id) return 0;

      let out = 0;

      if (this.gift_cards)
        this.gift_cards.forEach((item) => {
          out += item.wage;
        });

      // 🟡 💶 Wage of bills:
      if (this.bills?.length) {
        this.bills.forEach((bill) => {
          if (bill.payment)
            // Payment wage
            out += bill.payment.wage;

          if (bill.gift_cards)
            // Giftcard wages
            bill.gift_cards.forEach((item) => {
              out += item.wage;
            });
        });
      }

      // 🟠 💴 Normal payment:
      else {
        if (this.payment) out += this.payment.wage;
      }

      return out;
    },

    delivery_info() {
      return this.order.delivery_info;
    },
    shop_transportation() {
      return (
        this.delivery_info.type &&
        this.shop.transportations?.find(
          (x) => x.type === this.delivery_info.type,
        )
      );
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

    affiliate() {
      if (!this.affiliate_order) return null;
      return this.affiliate_order.affiliate;
    },
    affiliate_order() {
      return this.order.affiliate_order;
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
      const out =
        this.order.discount -
        (this.total_offers +
          this.discount_code_amount +
          this.coupon_amount +
          this.club_amount +
          this.lottery_amount +
          this.total_cross_sells_discount);
      return PriceHelper.FixPrecisionForCurrency(out, this.order.currency);
    },

    total_price() {
      return this.order.price;
    },

    tax() {
      return this.order.tax;
    },
    tax_shipping() {
      return this.order.tax_shipping ? this.order.tax_shipping : 0;
    },

    final_price() {
      return (
        this.total_price +
        (this.order.tax_included ? 0 : this.tax) +
        this.tax_shipping
      );
    },

    currency() {
      return Currency[this.order.currency];
    },

    bills() {
      return this.order.bills?.sortByKey("id", true);
    },
    bills_remains() {
      /*
      SERVICE: If all items' pricing is 'FIX', then the customer was asked to pay on checkout.
       */
      const pre_paid_service_order = this.payment ? this.payment.amount : 0;

      if (!this.bills) return this.order.price - pre_paid_service_order;

      let sum = pre_paid_service_order;
      this.bills.forEach((bill) => {
        if (bill.status !== Bill.Status.CANCELED.code)
          // Only payed and pending bills!
          sum += bill.price;
      });
      return this.order.price - sum;
    },

    receipt_images() {
      return (
        this.transactions_pending &&
        this.transactions_pending.map(
          (i) => i.billing_details && i.billing_details.receipt,
        )
      );
    },

    items() {
      return this.order.items;
    },

    // ――――――――――― 🎗️ Subscription ―――――――――――
    meta() {
      return this.order.meta;
    },
    isSubscribed() {
      return (
        this.isSubscription && this.order.status === Basket.Status.Payed.code
      );
    },

    subscription_period() {
      return BillingPeriod[
        this.meta?.subscription_period
          ? this.meta.subscription_period
          : this.items[0]?.subscription_price?.period
      ];
    },
    next_payment_date() {
      const payment_date =
        this.isSubscribed &&
        this.order.payment?.payment_at?.convertToLocalDate();
      if (!this.subscription_period || !payment_date) return null;

      return payment_date.addHours(this.subscription_period.hours);
    },

    bills_count() {
      return this.order.bills_count;
    },

    //------------------- Tax -------------------
    has_tax_detail() {
      return this.items.some((i) => i.tax?.amount);
    },

    total_cross_sells_discount() {
      return this.order.items.reduce((accumulator, item) => {
        return accumulator + item.cross_dis;
      }, 0);
    },

    //------------------- Linked account -------------------
    linked_account() {
      return (
        this.order.currency &&
        this.shop.accounts?.find((x) => x.currency === this.order.currency)
      );
    },

    is_require_capture() {
      return this.payment?.status === TransactionStatus.RequireCapture.code;
    },
  },
  methods: {
    //――――――――――――――――――――――― Check payment status ―――――――――――――――――――――――

    checkPaymentStatus(gateway_code, unique_id, gateway_name) {
      this.busy_check = true;

      axios
        .get(
          window.API.GET_CHECK_PAYMENT_GATEWAY(
            this.shop.id,
            gateway_code,
            unique_id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            if (data.success) {
              // If changed status request refresh order:
              if (
                (!this.payment && data.success) ||
                (this.payment &&
                  this.payment.status !== data.transaction_status)
              )
                this.$emit("fetch-order");

              this.showSuccessAlert(
                null,
                this.$t(
                  "process_center.payment_widget.notifications.pay_confirm_message",
                  {
                    payment_at: this.getLocalTimeString(data.payment_at),
                    gateway_name: gateway_name,
                  },
                ) +
                  `<br>Last status: ${data.status}` +
                  (data.message ? `<hr>${data.message}` : ""), // Add extra message!
              );
            } else {
              this.showWarningAlert(
                this.$t(
                  "process_center.payment_widget.notifications.pay_fail_title",
                ),
                this.$t(
                  "process_center.payment_widget.notifications.pay_fail_message",
                ) +
                  `<br>Last status: ${data.status}` +
                  (data.message ? `<hr>${data.message}` : ""), // Add extra message!
              );
            }
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_check = false;
        });
    },

    //――――――――――――――――――――――― DIR > Confirm payment ―――――――――――――――――――――――

    confirmDIRPaymentCompleted(gateway_code) {
      this.busy_pay = true;

      axios
        .post(
          window.API.POST_CONFIRM_DIR_PAYMENT_MANUALLY(
            this.$route.params.shop_id,
            this.$route.params.basket_id,
            gateway_code,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("process_center.notifications.pay_dir_success"),
            );
            this.$emit("fetch-order");
            this.order.status = data.status;
            this.dialog_customer_pay_money_dir = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_pay = false;
        });
    },

    //――――――――――――――――――――――― Update Affiliate status ―――――――――――――――――――――――

    updateAffiliateStatus(status) {
      this.busy_affiliate = status;
      axios
        .post(
          window.API.POST_UPDATE_AFFILIATE_STATUS(
            this.$route.params.shop_id,
            this.affiliate.id,
            this.affiliate_order.id,
          ),
          {
            status: status,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(null, "Affiliate status updated.");
            this.order.affiliate_order.status = data.status;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_affiliate = null;
        });
    },

    //――――――――――――――――――――――― Add Payment (Service) ―――――――――――――――――――――――
    showAddPayment() {
      this.add_bill_dialog = true;
      this.bill_price = 0;
    },
    addBill() {
      this.busy_add_bill = true;
      axios
        .post(window.API.POST_ADD_BILL(this.shop.id, this.order.id), {
          price: this.bill_price,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("process_center.notifications.new_bill_success"),
            );
            this.add_bill_dialog = false;
            this.AddOrUpdateItemByID(this.order.bills, data.bill);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_bill = false;
        });
    },

    editBillPrice() {
      this.busy_edit_bill = true;
      axios
        .put(
          window.API.PUT_EDIT_BILL_PRICE(
            this.shop.id,
            this.order.id,
            this.selected_bill.id,
          ),
          {
            price: this.bill_price,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t("process_center.notifications.edit_bill_success"),
            );
            this.edit_bill_dialog = false;
            this.AddOrUpdateItemByID(this.order.bills, data.bill);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_edit_bill = false;
        });
    },
    updateBillStatus(bill, status) {
      this.busy_update_bill_status = bill.id + status;
      axios
        .put(
          window.API.PUT_UPDATE_BILL_STATUS(
            this.shop.id,
            this.order.id,
            bill.id,
          ),
          {
            status: status,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t(
                "process_center.notifications.update_bill_status_success",
              ),
            );
            this.AddOrUpdateItemByID(this.order.bills, data.bill);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update_bill_status = null;
        });
    },
    showEditBill(bill) {
      this.edit_bill_dialog = true;
      this.bill_price = bill.price;
      this.selected_bill = bill;
    },

    deleteBill(bill) {
      this.openDangerAlert(
        this.$t("process_center.delete_bill_dialog.title"),
        this.$t("process_center.delete_bill_dialog.message"),
        this.$t("process_center.delete_bill_dialog.action"),
        () => {
          axios
            .delete(
              window.API.DELETE_BILL(this.shop.id, this.order.id, bill.id),
            )
            .then(({ data }) => {
              if (data.error) {
                this.showErrorAlert(null, data.error_msg);
              } else {
                this.showSuccessAlert(null, "Bill has been deleted.");
                this.DeleteItemByID(this.order.bills, bill.id);
              }
            })
            .catch((error) => {
              this.showLaravelError(error);
            })
            .finally(() => {});
        },
      );
    },

    //――――――――――――――――――――――― Bill > Confirm payment (Cash gateways) ―――――――――――――――――――――――
    showManuallyPayment(bill) {
      this.selected_bill_to_pay = bill;
      this.accept_action = false;
      this.dialog_pay_bill_by_cash = true;
    },
    confirmCashPaymentForBill(bill, gateway_code) {
      this.busy_pay = true;
      axios
        .post(
          window.API.POST_CONFIRM_CASH_PAYMENT_FOR_BILL_MANUALLY(
            this.$route.params.shop_id,
            this.$route.params.basket_id,
            bill.id,
            gateway_code,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.showSuccessAlert(
              null,
              this.$t(
                "process_center.notifications.set_payment_in_cash_success",
              ),
            );
            this.$emit("fetch-order");
            this.order.status = data.status;
            this.dialog_pay_bill_by_cash = false;
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_pay = false;
        });
    },
  },
};
</script>

<style scoped></style>
