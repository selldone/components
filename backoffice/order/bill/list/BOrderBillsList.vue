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
  <div :class="isModern ? 'sd-modern-content b-order-bills-modern' : 'widget-box -large mb-5'" v-bind="$attrs">
    <header v-if="isModern" class="sd-modern-header b-order-bills-modern__header">
      <div>
        <h1 class="sd-modern-title-text"><v-icon size="20" aria-hidden="true">receipt_long</v-icon>{{ $t('process_center.bills.title') }}</h1>
        <div class="b-order-bills-modern__subtitle">
          <p>{{ $t(isSubscription ? 'process_center.bills.subscription_subtitle' : 'process_center.bills.service_subtitle') }}</p>
          <v-tooltip location="top" :open-on-click="true" :open-on-focus="true" content-class="sd-modern-tooltip text-start">
            <template #activator="{ props }"><v-btn v-bind="props" icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('process_center.bills.title')"><v-icon size="16" aria-hidden="true">info_outline</v-icon></v-btn></template>
            {{ $t(isSubscription ? 'process_center.bills.subscription_help' : 'process_center.bills.service_help') }}
          </v-tooltip>
        </div>
      </div>
      <v-btn v-if="canSyncBills" class="sd-modern-button b-order-bills-modern__sync" variant="outlined" :loading="busy_sync" @click="syncBills">
        <v-icon size="17" start aria-hidden="true">sync</v-icon>{{ $t('process_center.bills.sync') }}
        <v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('process_center.bills.sync_help') }}</v-tooltip>
      </v-btn>
    </header>
    <u-widget-header
      v-else
      :add-caption="canSyncBills ? 'Sync Bills Manually' : undefined"
      :add-loading="busy_sync"
      add-icon="sync"
      add-text
      icon="receipt_long"
      title="Order bills"
      @click:add="syncBills"
    >
      <template v-slot:actions></template>
    </u-widget-header>
    <v-list-subheader v-if="!isModern">
      <div>
        Bills are records to keep transactions for orders with multiple
        payments. ● In <b>subscription orders </b>, these bills will be
        <b>auto-settled</b> for recurring payments. ● In <b>service orders</b>,
        these bills are created by the seller and paid by the buyer
        <b>manually</b>.
      </div>
    </v-list-subheader>

    <!-- -------------- Search -------------- -->

    <section :class="{ 'sd-modern-widget b-order-bills-modern__list': isModern, 's-table-loading': !isModern }" :aria-busy="busy_fetch">
    <v-row align="center" :class="isModern ? 'sd-modern-list-toolbar b-order-bills-modern__toolbar' : 'mt-2'" no-gutters>
      <span v-if="isModern" class="b-order-bills-modern__count">{{ $t('process_center.bills.record_count', { count: totalItems }) }}</span>
      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        :placeholder="$t(isModern ? 'process_center.bills.search_placeholder' : 'global.commons.search')"
        :aria-label="isModern ? $t('process_center.bills.search_placeholder') : undefined"
        bg-color="transparent"
        :class="isModern ? 'b-order-bills-modern__search' : 'max-width-field-mini me-1'"
        clearable
        flat
        hide-details
        prepend-icon="search"
        single-line
        variant="solo"
      >
      </v-text-field>
    </v-row>

    <!-- -------------- Loading -------------- -->

    <u-loading-progress v-if="busy_fetch && !isModern"></u-loading-progress>

    <!-- -------------- List -------------- -->

    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="bills"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="isModern ? $vuetify.display.width < 900 : $vuetify.display.xs"
      :loading="isModern && busy_fetch"
      :loading-text="isModern ? $t('process_center.bills.loading') : undefined"
      :row-props="billRowProps"
      :class="isModern ? 'sd-modern-data-table b-order-bills-modern__table' : 'bg-transparent min-height-60vh'"
      density="compact"
      hide-default-footer
      item-key="id"
      style="width: 100%"
      @click:row="(_, r) => showDetail(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="isModern" class="sd-modern-empty-state b-order-bills-modern__empty" :role="fetch_error ? 'alert' : 'status'">
          <v-icon size="27" aria-hidden="true">{{ fetch_error ? 'error_outline' : busy_fetch ? 'hourglass_empty' : search ? 'search_off' : 'receipt_long' }}</v-icon>
          <h2>{{ $t(fetch_error ? 'process_center.bills.error_title' : busy_fetch ? 'process_center.bills.loading' : search ? 'process_center.bills.no_matches_title' : 'process_center.bills.empty_title') }}</h2>
          <p v-if="!busy_fetch">{{ $t(fetch_error ? 'process_center.bills.error_message' : search ? 'process_center.bills.no_matches_message' : isSubscription ? 'process_center.bills.empty_subscription' : 'process_center.bills.empty_service') }}</p>
          <v-btn v-if="fetch_error" class="sd-modern-button" variant="outlined" @click="refreshBills"><v-icon size="17" start aria-hidden="true">refresh</v-icon>{{ $t('process_center.bills.retry') }}</v-btn>
        </div>
        <div v-else-if="!busy_fetch && !search" class="py-5 usn text-center fadeIn">
          <v-icon class="op-0-3">emoji_nature</v-icon>
          <h2 class="text-h4 font-weight-thin">Bills...</h2>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ id ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.id="{ item }">
        <div v-if="isModern" class="b-order-bills-modern__identity">
          <button type="button" class="b-order-bills-modern__bill-button" @click.stop="showDetail(item)"><v-icon size="18" aria-hidden="true">receipt_long</v-icon>{{ $t('process_center.bills.bill_column') }} <bdi>{{ item.id }}</bdi></button>
          <span v-if="item.label" class="b-order-bills-modern__secondary">{{ item.label }}</span>
          <span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="billStatusClass(item.status)" />{{ billStatusLabel(item.status) }}</span>
        </div>
        <div v-else class="min-width-150 py-1 d-flex align-center">
          <v-icon class="mx-2" color="black">receipt_long</v-icon>
          <div class="flex-grow-1">
            <b>{{ $t("global.commons.bill") }} {{ item.id }}</b>
            <small
              v-if="item.payment?.payment_at"
              :title="
                $t('global.commons.payment_date') +
                ': ' +
                getLocalTimeString(item.payment.payment_at) +
                ' ● ' +
                getFromNowString(item.payment.payment_at)
              "
              class="d-block"
            >
              {{ getLocalDateString(item.payment.payment_at) }}
            </small>
            <small v-else class="d-block">Not paid yet!</small>
          </div>

          <i
            v-if="item.status === BillStatus.PENDING.code"
            class="fas fa-spinner fa-spin m-1 text-blue"
          ></i>
          <img
            v-else-if="item.payment?.gateway?.logo"
            :src="getShopImagePath(item.payment?.gateway?.logo)"
            height="20"
          />
        </div>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ price ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.price="{ item }">
        <span :class="{ 'b-order-bills-modern__amount': isModern }"><u-currency-icon v-if="isModern" :currency="item.currency" flag-only small /><u-price :amount="item.price" :currency="item.currency"></u-price></span>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ payment_id ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.payment_id="{ item }">
        <div v-if="isModern && item.payment" class="b-order-bills-modern__payment">
          <div class="b-order-bills-modern__provider"><img v-if="item.payment.gateway?.logo" :src="getShopImagePath(item.payment.gateway.logo)" :alt="item.payment.gateway.name || ''" height="17" /><span v-else>{{ item.payment.gateway?.name }}</span><u-price v-if="item.payment.amount !== undefined && item.payment.currency" :amount="item.payment.amount" :currency="item.payment.currency" /></div>
          <u-payment-card v-if="item.payment.card" :card="item.payment.card" :currency="item.payment.currency" :method="item.payment.method" horizontal />
          <span v-else-if="item.payment.method" class="b-order-bills-modern__secondary">{{ item.payment.method }}</span>
          <span class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="paymentStatusClass(item.payment.status)" />{{ paymentStatusLabel(item.payment.status) }}</span>
          <span v-if="item.payment.payment_at" class="b-order-bills-modern__date" :title="getLocalTimeString(item.payment.payment_at)">{{ getLocalTimeStringSmall(item.payment.payment_at) }}</span>
        </div>
        <u-payment-card
          v-else-if="!isModern && item.payment?.card"
          :card="item.payment.card"
          :currency="item.payment.currency"
          :method="item.payment.method"
          horizontal
        ></u-payment-card>
        <small v-else>{{ isModern ? $t('process_center.bills.no_payment') : 'No payment.' }}</small>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ issued_id ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.issued_id="{ item }">
        <b-order-button
          v-if="item.issued"
          :order="item.issued"
          :order-type="item.issued.type"
          :class="{ 'sd-modern-button sd-modern-button--inline b-order-bills-modern__order-link': isModern }"
          variant="text"
          @click.stop
        >
        </b-order-button>
        <small v-else>{{ isModern ? $t('process_center.bills.no_issued_order_short') : 'No issued cart.' }}</small>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ delivery_state ▁▁▁▁▁▁▁▁▁▁▁ -->
      <template v-slot:item.delivery_state="{ item }">
        <div v-if="isModern && item.issued" class="b-order-bills-modern__issued">
          <s-order-delivery-status-stepper v-if="hasIssuedState(item.issued)" :state="item.issued.delivery_state" :states="getDeliveryStates(item.issued.type)" modern-tooltips modern-final-tooltip :modern-tooltip-prefix="issuedTooltipPrefix(item.issued.type)" class="b-order-bills-modern__stepper" />
          <div class="b-order-bills-modern__order-meta">
            <span v-if="item.issued.receiver_info" class="b-order-bills-modern__address"><flag v-if="item.issued.receiver_info.country" :iso="item.issued.receiver_info.country" :squared="false" /><span>{{ getShortAddress(item.issued.receiver_info) }}</span></span>
            <span class="b-order-bills-modern__issued-status">{{ issuedStatusLabel(item.issued) }}</span>
          </div>
        </div>
        <template v-else-if="item.issued">
          <s-order-delivery-status-stepper
            :state="item.issued.delivery_state"
            :states="getDeliveryStates(item.issued.type)"
            class="my-1"
          />

          <div
            class="py-1 small min-width-200 d-flex align-center justify-center"
          >
            <span class="text-muted">
              {{ getDeliveryStateString(item.issued.delivery_state) }}
            </span>
            <template v-if="item.receiver_info">
              <span class="dashed-flex-space"></span>
              <div class="ps-1">
                <flag
                  :iso="item.receiver_info.country"
                  :squared="false"
                  class="me-1"
                ></flag>
                <span>{{ getShortAddress(item.issued.receiver_info) }}</span>
              </div>
            </template>
          </div>
        </template>
        <span v-else-if="isModern" class="b-order-bills-modern__secondary">—</span>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ created_at ▁▁▁▁▁▁▁▁▁▁▁ -->
      <template v-slot:item.created_at="{ item }">
        <div :class="isModern ? 'b-order-bills-modern__created' : 'min-width-150'">
          {{ getFromNowString(item.created_at) }}<br />
          <small :class="{ 'b-order-bills-modern__date': isModern }">
            {{ getLocalTimeStringSmall(item.created_at) }}
          </small>
        </div>
      </template>

      <template v-slot:bottom>
        <div :class="{ 'sd-modern-table-footer b-order-bills-modern__footer': isModern }">
          <span v-if="isModern">{{ $t('process_center.bills.record_range', { from: totalItems ? (page - 1) * itemsPerPage + 1 : 0, to: Math.min(page * itemsPerPage, totalItems), total: totalItems }) }}</span>
          <v-pagination v-model="page" :length="pageCount" :class="{ 'sd-modern-pagination': isModern }" :total-visible="isModern ? ($vuetify.display.xs ? 3 : 7) : undefined" rounded />
        </div>
      </template>
    </v-data-table-server>
    </section>
  </div>

  <!-- ██████████████████████ Dialog > Detail ██████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_detail"
    :content-class="isModern ? 'b-order-bills-modern__sheet overflow-hidden' : 'rounded-t-xl overflow-hidden'"
    :content-props="isModern ? { style: { borderBottomLeftRadius: '0', borderBottomRightRadius: '0' } } : undefined"
    :dark="!isModern"
    :max-width="isModern ? 850 : 1280"
    scrollable
    width="98%"
  >
    <v-card :class="{ 'sd-modern-widget b-order-bills-modern__detail': isModern, 'b-order-bills-modern__detail--inverted': isModernDark }">
      <v-card-title v-if="isModern" class="b-order-bills-modern__detail-header">
        <h2><v-icon size="20" aria-hidden="true">receipt_long</v-icon>{{ $t('process_center.bills.details_title', { id: selected_bill?.id }) }}</h2>
        <span v-if="selected_bill" class="sd-modern-status sd-modern-status--plain"><span class="sd-modern-status__dot" :class="billStatusClass(selected_bill.status)" />{{ billStatusLabel(selected_bill.status) }}</span>
        <v-btn icon variant="text" class="sd-modern-icon-button b-order-bills-modern__close" :aria-label="$t('global.actions.close')" @click="dialog_detail = false"><v-icon size="16" aria-hidden="true">close</v-icon><v-tooltip activator="parent" location="top" :open-on-focus="true" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn>
      </v-card-title>
      <v-card-title v-else class="d-flex align-center">
        <v-icon class="me-2">receipt_long</v-icon>
        Bill-{{ selected_bill?.id }}
        <v-spacer></v-spacer>

        <span
          v-if="selected_bill?.payment?.payment_at"
          class="small text-green ms-2"
        >
          ● Paid
          {{ getFromNowString(selected_bill.payment.payment_at) }}</span
        >
        <span v-else class="small text-red ms-2">Not paid yet!</span>
      </v-card-title>
      <v-card-text :class="{ 'b-order-bills-modern__detail-body': isModern }">
        <div v-if="isModern && selected_bill" class="b-order-bills-modern__bill-summary"><span class="sd-modern-eyebrow">{{ $t('process_center.bills.amount_column') }}</span><strong><u-currency-icon :currency="selected_bill.currency" flag-only small /><u-price :amount="selected_bill.price" :currency="selected_bill.currency" /></strong><p v-if="selected_bill.label" class="b-order-bills-modern__secondary">{{ selected_bill.label }}</p></div>
        <b-order-payment-row-payment
          v-for="bill in selected_bill?.payment ? [selected_bill] : []"
          :key="bill.id"
          :payment="bill.payment"
          :modern="isModern"
          :modern-bills="isModern"
          flex-mode
          has-map
          @payment-captured="paymentCaptured($event, bill.id)"
        >
        </b-order-payment-row-payment>
        <div v-if="isModern && selected_bill && !selected_bill.payment" class="sd-modern-notice"><v-icon size="18" aria-hidden="true">payment</v-icon><div class="sd-modern-notice__content">{{ $t('process_center.bills.no_payment') }}</div></div>

        <div
          v-if="selected_bill?.issued"
          :class="isModern ? 'b-order-bills-modern__detail-issued text-start' : 'pt-3 text-start mt-5 border-top pt-5'"
        >
          <v-row no-gutters>
            <b>
              <v-icon class="me-2">shopping_bag</v-icon>
              {{ isModern ? $t('process_center.bills.issued_order_column') : 'An order has been created automatically' }}</b
            >
            <v-spacer></v-spacer>
            <b-order-button
              :order="selected_bill.issued"
              :order-type="selected_bill.issued.type"
              :class="{ 'sd-modern-button sd-modern-button--inline': isModern }"
              :variant="isModern ? 'text' : undefined"
            >
            </b-order-button>
          </v-row>
          <p v-if="isModern" class="b-order-bills-modern__secondary">{{ $t('process_center.bills.issued_order_help') }}</p>

          <div class="max-w-550 mx-auto">
            <s-order-delivery-status-stepper
              v-if="!isModern || hasIssuedState(selected_bill.issued)"
              :state="selected_bill.issued.delivery_state"
              :states="getDeliveryStates(selected_bill.issued.type)"
              :dark="!isModern"
              :modern-tooltips="isModern"
              :modern-final-tooltip="isModern"
              :modern-tooltip-prefix="issuedTooltipPrefix(selected_bill.issued.type)"
              :class="{ 'b-order-bills-modern__stepper': isModern }"
            />
            <div v-if="isModern" class="b-order-bills-modern__order-meta"><span v-if="selected_bill.issued.receiver_info" class="b-order-bills-modern__address"><flag v-if="selected_bill.issued.receiver_info.country" :iso="selected_bill.issued.receiver_info.country" :squared="false" /><span>{{ getShortAddress(selected_bill.issued.receiver_info) }}</span></span><span class="b-order-bills-modern__issued-status">{{ issuedStatusLabel(selected_bill.issued) }}</span></div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions :class="{ 'b-order-bills-modern__detail-footer': isModern }">
        <span v-if="isModern && selected_bill?.created_at" class="b-order-bills-modern__date">{{ getLocalTimeStringSmall(selected_bill.created_at) }}</span>
        <div class="widget-buttons">
          <v-btn :size="isModern ? undefined : 'x-large'" :class="{ 'sd-modern-button': isModern }" :variant="isModern ? 'outlined' : 'text'" @click="dialog_detail = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import BOrderButton from "../../../order/button/BOrderButton.vue";
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BOrderPaymentRowPayment from "../../../order/payment/row/payment/BOrderPaymentRowPayment.vue";
import { throttle } from "lodash-es";
import { Bill } from "@selldone/core-js";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOrderBillsList",
  mixins: [DateMixin, OrderMixin ],
  emits: ["fetch-order"],

  components: {
    BOrderPaymentRowPayment,
    SOrderDeliveryStatusStepper,
    BOrderButton,
    UPaymentCard,
    UCurrencyIcon,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      BillStatus: Bill.Status,

      busy_fetch: false,
      fetch_error: false,
      list_request_id: 0,

      bills: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: null, order: "desc" }],

      search: null,
      segments_filter: [],

      //---------------------------
      selected_customer: null,
      show_set_ships: null,
      chips: 0,
      busy_set_chips: false,

      //---------------------------
      busy_set_club: false,
      show_set_club: false,
      level: null,

      //---------------------------
      show_import: false,
      show_import_pre: false,

      //---------------------------
      show_add: false,
      dialog_pre: false,

      //---------------------------
      show_segments_dialog: false,
      busy_set_segments: false,

      //---------------------------
      busy_access: null,

      //---------------------------
      busy_sync: false,

      //---------------------------
      dialog_detail: false,
      selected_bill: null,
    };
  },
  computed: {
    isModern() {
      return this.modern && (this.isService || this.isSubscription) && !this.IS_VENDOR_PANEL;
    },
    isModernDark() {
      return this.isModern && !!this.USER?.()?.preferences?.dark;
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return !!this.$route?.params?.vendor_id || this.$route?.matched?.some((record) => record.meta.vendor);
    },
    billContext() {
      return `${this.shop.id}:${this.basket.type}:${this.basket.id}`;
    },
    canSyncBills() {
      // Provider synchronization writes bills; the server retains ORDER_WRITE and ORDERS permission checks.
      return !!(!this.IS_VENDOR_PANEL && this.isSubscription &&
        ["Payed", "Canceled"].includes(this.basket.status) &&
        this.basket.payment?.gateway?.code?.startsWith("stripe_"));
    },
    isService() {
      return this.basket.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.basket.type === ProductType.SUBSCRIPTION.code;
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    headers() {
      return [
        {
          title: this.isModern ? this.$t('process_center.bills.bill_column') : "Bill",
          align: "start",
          sortable: true,
          value: "id",
        },
        {
          title: this.isModern ? this.$t('process_center.bills.amount_column') : "Amount",
          align: "start",
          sortable: true,
          value: "price",
        },

        {
          title: this.isModern ? this.$t('process_center.bills.payment_column') : "Payment",
          align: "start",
          sortable: true,
          value: "payment_id",
        },

        {
          title: this.isModern ? this.$t('process_center.bills.issued_order_column') : "Issued Order",
          align: this.isModern ? "start" : "center",
          value: "issued_id",
          sortable: true,
        },
        {
          title: this.isModern ? this.$t('process_center.bills.issued_status_column') : "Issued Status",
          align: this.isModern ? "start" : "center",
          value: "delivery_state",
          sortable: false,
        },

        {
          title: this.$t("global.sort.created_at"),
          align: "start",
          sortable: true,
          value: "created_at",
        },
      ];
    },
  },
  watch: {
    billContext() {
      if (!this.modern) return;
      this.list_request_id++;
      this.dialog_detail = false;
      this.selected_bill = null;
      this.bills = [];
      this.totalItems = 0;
      this.busy_fetch = false;
      this.busy_sync = false;
      this.fetch_error = false;
      this.page = 1;
      if (this.isModern) this.refreshBills();
    },
    // Pagination:
    options: {
      handler() {
        const { sortBy = [], page = 1 } = this.options;
        this.fetchBills(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: throttle(function (newVal, oldVal) {
      const { sortBy = [] } = this.options;
      this.fetchBills(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }, window.SERACH_THROTTLE),
  },
  created() {},

  methods: {
    billRowProps({ item }) {
      if (!this.isModern) return { class: 'row-hover' };
      return {
        class: 'row-hover sd-modern-clickable-item',
        tabindex: 0,
        role: 'button',
        'aria-label': this.$t('process_center.bills.details_title', { id: item.id }),
        onKeydown: (event) => {
          if (event.target !== event.currentTarget || !['Enter', ' '].includes(event.key)) return;
          event.preventDefault();
          this.showDetail(item);
        },
      };
    },
    billStatusLabel(status) {
      const labels = { PENDING: 'pending', PAYED: 'paid', CANCELED: 'canceled' };
      return this.$t(`process_center.bills.${labels[status] || 'unknown_status'}`);
    },
    billStatusClass(status) {
      return { 'sd-modern-status__dot--success': status === 'PAYED', 'sd-modern-status__dot--warning': status === 'PENDING', 'sd-modern-status__dot--error': status === 'CANCELED' };
    },
    paymentStatusLabel(status) {
      const state = Object.values(TransactionStatus).find((item) => item.code === status);
      return this.$t(state?.name || 'process_center.bills.unknown_status');
    },
    paymentStatusClass(status) {
      return {
        'sd-modern-status__dot--success': status === TransactionStatus.Succeeded.code,
        'sd-modern-status__dot--error': status === TransactionStatus.Canceled.code,
        'sd-modern-status__dot--warning': [TransactionStatus.RequireAction.code, TransactionStatus.Processing.code, TransactionStatus.RequireCapture.code].includes(status),
      };
    },
    hasIssuedState(issued) {
      return !!this.getDeliveryStates(issued.type)?.[issued.delivery_state];
    },
    issuedStatusLabel(issued) {
      const state = this.getDeliveryStates(issued.type)?.[issued.delivery_state];
      return this.$t(state?.name || 'process_center.bills.unknown_status');
    },
    issuedTooltipPrefix(type) {
      return type === ProductType.PHYSICAL.code ? 'admin_shop.orders.physical.modern.stages' : `admin_shop.orders.modern.${type?.toLowerCase()}.stages`;
    },
    refreshBills() {
      const sortBy = this.options.sortBy || this.sortBy;
      this.fetchBills(this.page, sortBy[0]?.key, sortBy[0]?.order === 'desc');
    },
    paymentCaptured(payment, bill_id) {
      if (!this.isModern || this.selected_bill?.id !== bill_id) return;
      if (payment && this.selected_bill.payment?.id !== payment.id) return;
      if (payment) Object.assign(this.selected_bill.payment, payment);
      this.refreshBills();
      this.$emit('fetch-order');
    },
    fetchBills(page, sortBy, sortDesc = true) {
      this.page = page;
      const modern_request = this.isModern;
      const request_id = ++this.list_request_id;
      const context = this.billContext;
      const selected_id = this.selected_bill?.id;
      // A later search, parent order or selected bill must not receive an older response.
      const isCurrent = () => !modern_request || (request_id === this.list_request_id && context === this.billContext && this.isModern);
      this.busy_fetch = true;
      if (modern_request) this.fetch_error = false;

      axios
        .get(window.API.GET_BASKET_BILLS(this.shop.id, this.basket.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,
            segments: this.segments_filter,
          },
        })
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (modern_request && data.error) {
            this.fetch_error = true;
            this.bills = [];
            this.totalItems = 0;
            NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.totalItems = data.total;
          this.bills = data.bills;
          if (modern_request && selected_id && this.selected_bill?.id === selected_id) {
            const current_bill = data.bills.find((bill) => bill.id === selected_id);
            if (current_bill) this.selected_bill = current_bill;
          }
        })
        .catch((e) => {
          if (!isCurrent()) return;
          if (modern_request) {
            this.fetch_error = true;
            this.bills = [];
            this.totalItems = 0;
          }
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          if (isCurrent()) this.busy_fetch = false;
        });
    },

    getShortAddress(receiver_info) {
      if (receiver_info.state && receiver_info.city)
        return `${receiver_info.state} > ${receiver_info.city}`;
      else if (receiver_info.city) return receiver_info.city;
      else return receiver_info.state;
    },

    getDeliveryStates(type) {
      return ProductType[type]?.delivery_states;
    },

    syncBills() {
      if (!this.canSyncBills || this.busy_sync) return;
      const context = this.billContext;
      this.busy_sync = true;

      axios
        .post(
          window.API.POST_BASKET_SUBSCRIPTION_BILLS_SYNC_MANUALLY(
            this.shop.id,
            this.basket.id,
          ),
        )
        .then(({ data }) => {
          if (context !== this.billContext) return;
          if (data.error) {
            return NotificationService.showErrorAlert(null, data.error_msg);
          }
          const { sortBy = [], page = this.page } = this.options;
          this.fetchBills(page, sortBy[0]?.key, sortBy[0]?.order === "desc");

          // Needs basket update:
          if (data.update_basket) this.$emit("fetch-order");
          // Show detail message:
          NotificationService.showSuccessAlert(this.isModern ? this.$t('process_center.bills.sync_success') : "Sync bills", data.message, "sync", 8000);
        })
        .catch((e) => {
          if (context !== this.billContext) return;
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          if (context === this.billContext) this.busy_sync = false;
        });
    },

    showDetail(bill) {
      this.selected_bill = bill;
      this.dialog_detail = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-bills-modern {
  min-width: 0;
  padding-block: 32px;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: start;

  &__header {
    align-items: flex-start;
    gap: 18px;
    margin-block-end: 22px;
  }

  &__header h1 {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 0;
    font-family: inherit;
    font-size: 20px;
    font-weight: 500;
    line-height: 26px;
  }

  &__header h1 > .v-icon {
    color: var(--sd-modern-muted);
  }

  &__subtitle {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-start: 5px;
    color: var(--sd-modern-muted);
  }

  &__subtitle > p {
    margin: 0;
    font-size: 13px;
    line-height: 20px;
    text-wrap: pretty;
  }

  &__sync {
    flex: none;
    font-size: 12px;
    line-height: 18px;
  }

  &__list {
    padding: 0;
    overflow: visible;
  }

  &__toolbar {
    gap: 18px;
    padding: 16px 20px;
    border-block-end: 1px solid var(--sd-modern-border);
  }

  &__count {
    font-size: 13px;
    line-height: 20px;
  }

  &__search {
    flex: 0 1 290px;
    width: 290px;
    max-width: 100%;

    :deep(.v-field__input) {
      min-height: 38px;
      padding-block: 9px;
      font-family: inherit;
      font-size: 12px;
      line-height: 18px;
    }

    :deep(.v-input__prepend) {
      margin-inline-end: 9px;
    }

    :deep(.v-input__prepend > .v-icon) {
      font-size: 17px;
      color: var(--sd-modern-muted);
    }
  }

  &__table {
    --sd-modern-table-font-size: 13px;
    border-radius: 0;

    :deep(.v-table__wrapper) {
      overflow: visible;
    }

    :deep(.v-table__wrapper > table) {
      table-layout: auto;
    }

    :deep(.v-table__wrapper > table > thead > tr > th),
    :deep(.v-table__wrapper > table > tbody > tr > td) {
      padding-inline: 14px;
    }

    :deep(.v-table__wrapper > table > thead > tr > th:first-child),
    :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
      padding-inline-start: 20px;
    }

    :deep(.v-table__wrapper > table > thead > tr > th:last-child),
    :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
      padding-inline-end: 20px;
    }

    :deep(.v-table__wrapper > table > tbody > tr > td) {
      padding-block: 14px;
      line-height: 20px;
      overflow-wrap: anywhere;
    }

    :deep(.v-data-table__td-value) {
      min-width: 0;
    }
  }

  &__identity {
    display: grid;
    gap: 4px;
    min-width: 110px;
  }

  &__bill-button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    width: fit-content;
    padding: 0;
    border: 0;
    border-radius: 4px;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-align: start;
  }

  &__bill-button > .v-icon {
    color: var(--sd-modern-muted);
  }

  &__bill-button:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 3px;
  }

  &__secondary {
    display: block;
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    overflow-wrap: anywhere;
  }

  &__amount,
  &__provider {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-variant-numeric: tabular-nums;
  }

  &__amount :deep(.u--price) {
    white-space: nowrap;
  }

  &__payment {
    display: grid;
    gap: 4px;
    min-width: 150px;
  }

  &__provider > img {
    max-width: 65px;
    object-fit: contain;
  }

  &__payment :deep(.u--payment-card) {
    min-width: 0;
  }

  &__order-link {
    min-width: 0;
    max-width: 100%;
    font-size: 12px;
    line-height: 18px;
  }

  &__issued {
    min-width: 180px;
  }

  &__stepper {
    margin-block: 4px 7px;

    :deep(.container-stepper > div) {
      top: 11px !important;
      height: 1px !important;
    }

    :deep(.container-stepper > div:first-child) {
      background: rgba(var(--v-theme-on-surface), .24) !important;
    }

    :deep(.container-stepper > div:nth-child(2)) {
      background: rgb(var(--v-theme-on-surface)) !important;
    }

    :deep(.progressbar) {
      display: flex;
      min-height: 22px;
      margin: 0;
    }

    :deep(.progressbar li) {
      float: none;
      min-height: 22px;
      transform: none !important;
    }

    :deep(.progressbar li::before) {
      width: 22px;
      height: 22px;
      border-width: 1px;
      line-height: 20px;
      border-color: rgba(var(--v-theme-on-surface), .24);
      background: rgb(var(--v-theme-surface));
    }

    :deep(.progressbar li.active::before) {
      border-color: rgb(var(--v-theme-on-surface));
      background: rgb(var(--v-theme-on-surface));
    }

    :deep(.progressbar li .v-icon) {
      font-size: 12px !important;
    }

    :deep(.progressbar li:not(.active) .v-icon) {
      color: var(--sd-modern-muted) !important;
      opacity: 1 !important;
    }
  }

  &__order-meta {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 4px 8px;
    font-size: 12px;
    line-height: 18px;
  }

  &__address {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }

  &__issued-status {
    margin-inline-start: auto;
    color: var(--sd-modern-muted);
    text-align: end;
  }

  &__created {
    min-width: 115px;
  }

  &__date {
    display: block;
    max-width: 145px;
    margin-block-start: 3px;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 18px;
    text-wrap: balance;
  }

  &__footer {
    padding: 15px 20px;
  }

  &__empty {
    display: grid;
    justify-items: center;
    gap: 9px;
    min-height: 260px;
    padding: 48px 22px 52px;
  }

  &__empty h2 {
    margin: 0;
    font-family: inherit;
    font-size: 15px;
    font-weight: 500;
    line-height: 22px;
  }

  &__empty p {
    max-width: 380px;
    margin: 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }

  @media (max-width: 899px) {
    &__table {
      :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile) {
        padding: 14px 20px;
      }

      :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) {
        padding-inline: 0;
        padding-block: 7px;
      }
    }

    &__identity,
    &__payment,
    &__issued,
    &__created {
      min-width: 0;
    }
  }

  @media (max-width: 600px) {
    padding-block: 24px;

    &__header {
      flex-wrap: wrap;
    }

    &__toolbar {
      flex-wrap: wrap;
      gap: 10px;
    }

    &__search {
      flex-basis: 100%;
      width: 100%;
    }

    &__bill-button {
      min-height: 44px;
    }
  }
}

.b-order-bills-modern__detail {
  padding: 0;
  border-radius: 20px 20px 0 0 !important;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  // This native sheet is teleported outside the window's Smart invert boundary.
  &--inverted {
    filter: invert(1);

    :deep(img),
    :deep(span.fi),
    :deep(.flag-icon),
    :deep(.no-inv),
    :deep(.vue-world-map),
    :deep(.b-order-bill-payment__method .v-chip__content > .d-block),
    :deep(.sd-modern-status__dot--success),
    :deep(.sd-modern-status__dot--error),
    :deep(.sd-modern-status__dot--warning),
    :deep(.sd-modern-button.text-primary:not(.v-btn--disabled, :disabled)),
    :deep(.sd-modern-button--primary:not(.v-btn--disabled, :disabled)) {
      filter: invert(1);
    }

    :deep(.no-inv img) { filter: none; }
    :deep(.sd-modern-button.text-primary:not(.v-btn--disabled, :disabled)) {
      color: color-mix(in srgb, rgb(var(--v-theme-primary)) 70%, rgb(var(--v-theme-surface))) !important;
    }
  }

  .b-order-bills-modern__detail-header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 20px 24px;
    border-block-end: 1px solid var(--sd-modern-border);
  }

  .b-order-bills-modern__detail-header h2 {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-family: inherit;
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
  }

  .b-order-bills-modern__close {
    --sd-modern-icon-button-size: 32px;
    margin-inline-start: auto;
  }

  .b-order-bills-modern__detail-body {
    padding: 22px 24px;
  }

  .b-order-bills-modern__bill-summary {
    margin-block-end: 22px;
    padding-block-end: 20px;
    border-block-end: 1px solid var(--sd-modern-border);
  }

  .b-order-bills-modern__bill-summary > strong {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 24px;
    font-weight: 500;
    line-height: 31px;
  }

  .b-order-bills-modern__detail-issued {
    margin-block-start: 22px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-order-bills-modern__detail-issued b {
    font-size: 14px;
    font-weight: 500;
    line-height: 21px;
  }

  .b-order-bills-modern__detail-footer {
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    padding: 16px 24px 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }

  .b-order-bills-modern__detail-footer .widget-buttons {
    justify-content: flex-end;
    flex: none;
    width: auto;
    margin: 0;
    padding: 0;
  }

  .b-order-bills-modern__detail-footer .widget-buttons > .v-btn {
    flex: none;
    margin: 0;
  }

  .b-order-bills-modern__detail-footer .sd-modern-button {
    font-size: 12px;
    line-height: 18px;
  }

  @media (max-width: 600px), (pointer: coarse) {
    .b-order-bills-modern__close {
      --sd-modern-icon-button-size: 44px;
    }
  }

  @media (max-width: 600px) {
    .b-order-bills-modern__detail-header,
    .b-order-bills-modern__detail-body,
    .b-order-bills-modern__detail-footer {
      padding-inline: 20px;
    }
  }
}
</style>
