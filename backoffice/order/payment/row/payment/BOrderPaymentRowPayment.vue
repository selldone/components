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
  <section v-if="isModernBills && payment" v-bind="$attrs" class="b-order-bill-payment text-start">
    <header class="b-order-bill-payment__provider">
      <img v-if="gateway?.icon || gateway?.logo" :src="getShopImagePath(gateway.icon || gateway.logo)" alt="" :width="gateway.icon ? 28 : 48" height="28" />
      <div>
        <div v-if="gateway?.name || gateway?.code">{{ gateway.name || gateway.code }}</div>
        <p>{{ $t('process_center.payment_widget.user_payment') }}</p>
      </div>
      <u-smart-menu v-if="action_items?.length" :items="action_items" modern :title="$t('process_center.modern.payment_actions')" class="ms-auto" />
    </header>

    <div class="b-order-bill-payment__facts">
      <section class="b-order-bill-payment__fact">
        <h3 class="sd-modern-eyebrow">{{ $t('process_center.bills.recorded_payment') }}</h3>
        <div class="b-order-bill-payment__amount"><u-price :amount="payment.amount" :currency="payment.currency" /><bdi>{{ payment.currency }}</bdi></div>
        <span v-if="payment.status" class="sd-modern-status sd-modern-status--plain b-order-bill-payment__status" :aria-label="$t('process_center.bills.payment_status')">
          <span class="sd-modern-status__dot" :class="billPaymentStatusClass" />
          {{ billPaymentStatus ? $t(billPaymentStatus.name) : payment.status }}
        </span>
        <p v-if="payment.payment_at" class="b-order-bill-payment__date" :title="getFromNowString(payment.payment_at)">{{ getLocalTimeString(payment.payment_at) }}</p>
        <div v-if="payment.unique_id" class="b-order-bill-payment__reference">
          <span class="sd-modern-eyebrow">{{ $t('process_center.bills.payment_reference') }}</span><bdi>{{ payment.unique_id }}</bdi>
        </div>
        <p v-if="payment.fee" class="b-order-bill-payment__fee">{{ $t('process_center.bills.provider_fee') }}: <u-price :amount="-payment.fee" :currency="payment.currency" /></p>
        <v-btn v-if="payment.track_id && payment.track_id.startsWith('http')" :href="payment.track_id" target="_blank" rel="noopener noreferrer" class="sd-modern-button sd-modern-button--compact sd-modern-button--inline b-order-bill-payment__receipt" variant="text" color="primary" @click.stop="">
          {{ $t('process_center.bills.receipt') }}<v-icon size="16" class="ms-2" aria-hidden="true">north_east</v-icon>
        </v-btn>
      </section>

      <section class="b-order-bill-payment__fact">
        <h3 class="sd-modern-eyebrow">{{ $t('process_center.bills.payment_method') }}</h3>
        <u-payment-card v-if="payment.card" :card="payment.card" :currency="payment.currency" :method="payment.method" horizontal class="b-order-bill-payment__method" />
        <p v-else-if="payment.cod">{{ $t('process_center.payment_widget.cod') }}</p>
        <p v-else-if="payment.method"><bdi>{{ payment.method }}</bdi></p>
        <p v-else class="b-order-bill-payment__muted">{{ $t('global.commons.no_credit_card_info') }}</p>
        <div v-if="payment.risk !== null && payment.risk !== undefined && payment.risk >= 0" class="b-order-bill-payment__risk">
          <u-payment-risk-indicator :risk="payment.risk" small class="no-inv" />
          <div><span class="sd-modern-eyebrow">{{ $t('process_center.payment_widget.risk') }}</span><p>{{ $t('process_center.modern.risk_review') }}</p></div>
        </div>
      </section>

      <section v-if="payment.billing_details || payment.card?.country" class="b-order-bill-payment__fact">
        <template v-if="payment.billing_details">
          <h3 class="sd-modern-eyebrow">{{ $t('process_center.bills.billing_details') }}</h3>
          <u-payment-billing-details :billing-detail="payment.billing_details" class="b-order-bill-payment__billing" />
        </template>
        <div v-if="payment.card?.country" class="b-order-bill-payment__country">
          <h3 class="sd-modern-eyebrow">{{ $t('process_center.bills.card_country') }}</h3>
          <u-map-countries-single :country="payment.card.country" />
        </div>
      </section>
    </div>

    <div v-if="canBillCapture" class="sd-modern-notice b-order-bill-payment__capture-notice">
      <v-icon size="18" aria-hidden="true">info_outline</v-icon>
      <div class="sd-modern-notice__content"><p>{{ $t('process_center.bills.capture_intro') }}</p>
        <v-btn class="sd-modern-button sd-modern-button--compact sd-modern-button--inline" color="primary" variant="text" @click="dialog_capture = true"><v-icon size="17" start aria-hidden="true">done_all</v-icon>{{ $t('process_center.bills.capture_title') }}</v-btn>
      </div>
    </div>

    <section v-if="payment.refunds?.length" class="b-order-bill-payment__refunds">
      <h3><v-icon size="18" class="me-2" aria-hidden="true">keyboard_return</v-icon>{{ $t('global.commons.refund') }}</h3>
      <div v-for="refund in payment.refunds" :key="refund.sd_unique_id" class="b-order-bill-payment__refund">
        <u-price :amount="refund.amount" :currency="refund.currency" />
        <div><span class="sd-modern-eyebrow">{{ $t('process_center.bills.refund_reference') }}</span><bdi>{{ refund.sd_unique_id }}</bdi></div>
        <div><span class="sd-modern-eyebrow">{{ $t('process_center.bills.provider_reference') }}</span><bdi>{{ refund.ex_track_id }}</bdi></div>
        <div><span class="sd-modern-eyebrow">{{ $t('global.commons.refund_date') }}</span><span>{{ getLocalTimeStringSmall(refund.refund_at) }}</span></div>
      </div>
    </section>
  </section>
  <tr
    v-else-if="payment"
    v-bind="$attrs"
    :class="{ 'flex-row': flexMode }"
    class="text-start"
  >
    <td>
      <div class="d-flex align-center">
        <v-icon v-if="sub" class="ms-5 flip-ltr" color="black"
          >keyboard_return
        </v-icon>

        <img
          :src="getShopImagePath(gateway?.icon)"
          class="mx-2"
          height="24"
          alt="Gateway"
        />
        <div class="flex-grow-1">
          {{ gateway?.name }}
          <small class="d-block">{{
            $t("process_center.payment_widget.user_payment")
          }}</small>
        </div>
      </div>
    </td>
    <td class="text-left">
      <u-price :amount="payment.amount" :currency="payment.currency"></u-price>
    </td>

    <!-- Detailed -->

    <template v-if="hasMap">
      <td>
        <div class="d-flex align-items-center justify-space-around">
          <div class="flex-grow-1">
            <u-payment-card
              v-if="payment.card"
              :card="payment.card"
              :currency="payment.currency"
              :method="payment.method"
              horizontal
            ></u-payment-card>
            <span v-else-if="payment.cod">{{
              $t("process_center.payment_widget.cod")
            }}</span>

            <b
              :title="getFromNowString(payment.payment_at)"
              class="d-block small mb-1"
              >{{ getLocalTimeString(payment.payment_at) }}</b
            >
            <u-payment-billing-details
              v-if="payment.billing_details"
              :billing-detail="payment.billing_details"
              class="min-width-200"
            ></u-payment-billing-details>
          </div>
          <u-map-countries-single
            v-if="payment.card && payment.card.country"
            :country="payment.card.country"
            class="min-width-200 flex-grow-1 m-1"
          ></u-map-countries-single>
        </div>

        <!-- Require Capture -->
        <div v-if="!readonly && is_require_capture" class="widget-buttons">
          <v-btn :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--inline': modern }" :color="modern ? 'primary' : '#673AB7'" :variant="modern ? 'text' : undefined" size="x-large" @click="dialog_capture = true">
            <v-icon class="me-1">done_all</v-icon>
            <div class="d-flex flex-column">
              <div>
                Capture Payment

                <u-price
                  :amount="payment.amount"
                  :currency="payment.currency"
                  class="mx-1"
                ></u-price>
              </div>
              <div class="small tnt">The fund is on hold.</div>
            </div>
          </v-btn>
        </div>
      </td>

      <td :class="modern ? 'text-start' : 'text-center'">
        <div v-if="payment.risk >= 0">
          <small class="d-block"
            >{{ $t("process_center.payment_widget.risk") }}
          </small>

          <u-payment-risk-indicator
            :risk="payment.risk"
            class="mt-1 mb-2"
          ></u-payment-risk-indicator>
        </div>

        <div
          v-if="payment.fee"
          :title="`${gateway?.name} transaction fee.`"
          class="mx-2"
        >
          <small> {{ $t("process_center.payment_widget.gateway_wage") }}</small>

          <img
            :src="getShopImagePath(gateway?.logo)"
            class="mx-1"
            height="24"
            alt="Gateway"
          />

          <u-price
            :amount="-payment.fee"
            :currency="payment.currency"
          ></u-price>
        </div>

        <v-btn
          v-if="payment.track_id && payment.track_id.startsWith('http')"
          :href="payment.track_id"
          class="ma-1 tnt"
          :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--inline': modern }"
          :color="modern ? 'primary' : '#673AB7'"
          :variant="modern ? 'text' : undefined"
          size="x-small"
          target="_blank"
          @click.stop=""
          :append-icon="modern ? 'north_east' : 'launch'"
        >
          Receipt URL
        </v-btn>

        <u-smart-menu
          v-if="action_items?.length"
          :items="action_items"
          :modern="modern"
          :title="modern ? $t('process_center.modern.payment_actions') : undefined"
          :class="modern ? 'ms-2' : 'ms-1 float-end'"
        ></u-smart-menu>
      </td>
    </template>
    <!-- Normal -->
    <template v-else>
      <td>
        <u-payment-card
          v-if="payment.card"
          :card="payment.card"
          :currency="payment.currency"
          :method="payment.method"
          horizontal
        ></u-payment-card>
        <span v-else-if="payment.cod">{{
          $t("process_center.payment_widget.cod")
        }}</span>

        <!-- Require Capture -->
        <div v-if="!readonly && is_require_capture" class="widget-buttons">
          <v-btn :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--inline': modern }" :color="modern ? 'primary' : '#673AB7'" :variant="modern ? 'text' : undefined" size="x-large" @click="dialog_capture = true">
            <v-icon class="me-1">done_all</v-icon>
            <div class="d-flex flex-column">
              <div>
                Capture Payment

                <u-price
                  :amount="payment.amount"
                  :currency="payment.currency"
                  class="mx-1"
                ></u-price>
              </div>
              <div class="small tnt">The fund is on hold.</div>
            </div>
          </v-btn>
        </div>
      </td>
      <td :class="modern ? 'text-start' : 'text-center'">
        <div
          v-if="payment.fee"
          :title="`${gateway?.name} transaction fee.`"
          class="ma-1 d-flex align-center"
        >
          <v-img
            :src="getShopImagePath(gateway?.logo)"
            height="24"
            max-width="36"
            alt="Gateway"
          />

          <small class="mx-1">{{
            $t("process_center.payment_widget.gateway_wage")
          }}</small>

          <v-icon class="mx-1" size="x-small"
            >{{ $t("icons.chevron_next") }}
          </v-icon>
          <u-price
            :amount="-payment.fee"
            :currency="payment.currency"
          ></u-price>
        </div>

        <v-btn
          v-if="payment.track_id && payment.track_id.startsWith('http')"
          :href="payment.track_id"
          class="ma-1 tnt"
          :class="{ 'sd-modern-button sd-modern-button--compact sd-modern-button--inline': modern }"
          :color="modern ? 'primary' : '#673AB7'"
          :variant="modern ? 'text' : undefined"
          size="x-small"
          target="_blank"
          :title="modern ? undefined : 'See payment receipt on the payment service provider.'"
          @click.stop=""
          :append-icon="modern ? 'north_east' : 'launch'"
        >
          Receipt URL
        </v-btn>

        <u-smart-menu
          v-if="action_items?.length"
          :items="action_items"
          :modern="modern"
          :title="modern ? $t('process_center.modern.payment_actions') : undefined"
          :class="modern ? 'ms-2' : 'ms-1 float-end'"
        ></u-smart-menu>
      </td>
    </template>
  </tr>

  <!-- █████████████████████████ Refunds █████████████████████████ -->
  <template v-if="!isModernBills"><tr
    v-for="refund in payment?.refunds"
    :key="refund.sd_unique_id"
    v-bind="$attrs"
    :class="{ 'flex-row': flexMode }"
    class="text-start"
  >
    <td>
      <v-icon class="flip-ltr ms-4">subdirectory_arrow_left</v-icon>
      <img
        class="mx-2"
        height="24"
        src="../../../../../assets/icons/refund.svg"
        width="24"
        alt="Refund"
      />

      {{ $t("global.commons.refund") }}
    </td>

    <td>
      <u-price :amount="refund.amount" :currency="refund.currency"></u-price>
    </td>

    <td>
      <small>Selldone UID</small>
      <div class="text-subtitle-2">
        {{ refund.sd_unique_id }}
      </div>
      <small>{{ gateway?.name }} UID</small>
      <div class="text-subtitle-2">
        {{ refund.ex_track_id }}
      </div>
    </td>

    <td>
      <small>{{ $t("global.commons.refund_date") }}</small>
      <div class="text-subtitle-2">
        {{ getLocalTimeStringSmall(refund.refund_at) }}
      </div>
    </td>
  </tr></template>

  <!-- █████████████████████████ Dialog > Confirm Cash Payment (For bill only) █████████████████████████ -->

  <v-dialog
    v-if="!readonly && is_require_capture && (!isModernBills || canBillCapture)"
    v-model="dialog_capture"
    :fullscreen="!isModernBills"
    :max-width="isModernBills ? 520 : undefined"
    :content-class="isModernBills ? 'b-order-bill-capture-dialog' : undefined"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start" :class="{ 'sd-modern-widget b-order-bill-capture': isModernBills, 'b-order-bill-capture--inverted': isModernBillsDark }">
      <template v-if="isModernBills">
        <v-card-title class="b-order-bill-capture__header"><v-icon size="20" class="me-2" aria-hidden="true">price_check</v-icon>{{ $t('process_center.bills.capture_title') }}</v-card-title>
        <v-card-text class="b-order-bill-capture__body">
          <p>{{ $t('process_center.bills.capture_intro') }}</p>
          <div class="b-order-bill-capture__authorized"><span>{{ $t('process_center.bills.authorized_amount') }}</span><u-price :amount="payment.amount" :currency="payment.currency" /></div>
          <u-price-input v-model="capture_amount" :currency="payment.currency" :disabled="busy_capture" :label="$t('process_center.bills.capture_amount')" :rules="[() => isCaptureAmountValid || $t('process_center.bills.capture_amount_error')]" class="sd-modern-underlined-field b-order-bill-capture__amount" />
          <div class="sd-modern-notice"><v-icon size="18" aria-hidden="true">info_outline</v-icon><p class="sd-modern-notice__content">{{ $t('process_center.bills.capture_consequences') }}</p></div>
          <u-smart-verify v-model="accept_action" :true-title="$t('process_center.bills.capture_verify')" :disabled="busy_capture" class="b-order-bill-capture__verify" tabindex="0" role="checkbox" :aria-checked="accept_action" @keydown.space.prevent="!busy_capture && (accept_action = !accept_action)" @keydown.enter.prevent="!busy_capture && (accept_action = !accept_action)" />
        </v-card-text>
        <v-card-actions class="b-order-bill-capture__actions">
          <v-btn class="sd-modern-button" variant="outlined" :disabled="busy_capture" @click="dialog_capture = false"><v-icon size="17" start aria-hidden="true">close</v-icon>{{ $t('global.actions.cancel') }}</v-btn>
          <v-btn class="sd-modern-button sd-modern-button--primary" color="primary" variant="elevated" :disabled="!accept_action || !isCaptureAmountValid || busy_capture" :loading="busy_capture" @click="capturePayment"><v-icon size="17" start aria-hidden="true">done_all</v-icon>{{ $t('process_center.bills.capture_title') }}</v-btn>
        </v-card-actions>
      </template>
      <template v-else>
      <v-card-title>
        <img
          :src="getShopImagePath(gateway?.icon)"
          class="me-2"
          height="24"
          alt="Gateway"
        />
        Capture the funds | Payment {{ gateway?.name }}
        {{ payment.unique_id }}
      </v-card-title>

      <v-card-text>
        <div class="widget-box mb-5">
          <u-widget-header icon="price_check" title="Capture Amount">
          </u-widget-header>
          <v-list-subheader>
            Once the payment method is authorized, the Order payment status
            changes to 'Require Capture.' To seize the authorized funds,
            initiate a capture request. By default, this action captures the
            total authorized amount. If you wish to capture less than the
            initially authorized amount, adjust the 'amount to capture' field
            below. Performing a partial capture will automatically release any
            remaining funds. Note that capture can only be executed once.
          </v-list-subheader>

          <u-price-input
            v-model="capture_amount"
            :currency="payment.currency"
            class="strong-field"
            label="Amount to capture"
          ></u-price-input>

          <v-expand-transition>
            <ul v-if="capture_amount !== payment.amount">
              <li>

             Authorized amount by customer:   <u-price :amount="payment.amount" :currency="payment.currency"></u-price>
                <v-chip v-if="percentageChange" :color="percentageChange>0?'green':'red'" class="ms-2" size="small" variant="flat">
                  {{ percentageChange }}%
                </v-chip>

              </li>
              <li v-if="percentageChange>0">
                Capture more than the authorized amount on a payment has limits.
              </li>
              <li>
                This will replace the 'amount' value in Selldone payment
                details.
              </li>
              <li>
                This will also update the 'price' value in the order details on
                Selldone.
              </li>
              <li>
                If the order includes TAX, then both the price and tax will be
                recalculated based on the new amount, maintaining their original
                proportion to each other.
              </li>
            </ul>
          </v-expand-transition>

          <u-smart-verify
            v-model="accept_action"
            :true-title="`Verify capture ${capture_amount} ${payment.currency}`"
            class="my-3"
            true-description="I want to capture the payment and verify the order."
          ></u-smart-verify>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_capture = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.cancel") }}
          </v-btn>

          <v-btn
            :class="{ disabled: !accept_action }"
            :loading="busy_capture"
            color="primary"
            variant="elevated"
            size="x-large"
            @click="capturePayment"
          >
            <v-icon class="me-1">done_all</v-icon>
            Capture
            <u-price
              :amount="capture_amount"
              :currency="payment.currency"
              class="ms-2"
            ></u-price>
          </v-btn>
        </div>
      </v-card-actions>
      </template>
    </v-card>
  </v-dialog>

  <b-order-payment-actions-refund-dialog
    v-if="has_refund_action"
    v-model="refund_dialog"
    :payment="payment"
  ></b-order-payment-actions-refund-dialog>

  <b-order-payment-actions-delivery-dialog
    v-if="has_delivery_action"
    v-model="delivery_dialog"
    :payment="payment"
  ></b-order-payment-actions-delivery-dialog>
</template>

<script lang="ts">
import UPaymentCard from "../../../../../ui/payment/card/UPaymentCard.vue";
import UPaymentBillingDetails from "../../../../../ui/payment/billing-details/UPaymentBillingDetails.vue";
import UMapCountriesSingle from "../../../../../ui/map/countries/single/UMapCountriesSingle.vue";
import UPaymentRiskIndicator from "../../../../../ui/payment/risk/indicator/UPaymentRiskIndicator.vue";
import { TransactionStatus } from "@selldone/core-js/enums/payment/TransactionStatus";
import USmartVerify from "../../../../../ui/smart/verify/USmartVerify.vue";
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";
import USmartMenu from "@selldone/components-vue/ui/smart/menu/USmartMenu.vue";
import BOrderPaymentActionsRefundDialog from "@selldone/components-vue/backoffice/order/payment/actions/refund/dialog/BOrderPaymentActionsRefundDialog.vue";
import BOrderPaymentActionsDeliveryDialog from "@selldone/components-vue/backoffice/order/payment/actions/delivery/dialog/BOrderPaymentActionsDeliveryDialog.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BOrderPaymentRowPayment",
  mixins: [DateMixin],

  components: {
    BOrderPaymentActionsDeliveryDialog,
    BOrderPaymentActionsRefundDialog,
    USmartMenu,
    UPrice,
    UPriceInput,
    USmartVerify,
    UPaymentRiskIndicator,
    UMapCountriesSingle,
    UPaymentBillingDetails,
    UPaymentCard,
  },
  emits: ["payment-captured"],
  props: {
    readonly: Boolean,
    payment: {
      require: true,
    },
    hasMap: {
      default: false,
      type: Boolean,
    },
    sub: {
      default: false,
      type: Boolean,
    },
    flexMode: { default: false, type: Boolean },
    modern: { type: Boolean, default: false },
    modernBills: { type: Boolean, default: false },
  },

  data: function () {
    return {
      dialog_capture: false,
      accept_action: false,
      capture_amount: 0,
      busy_capture: false,

      refund_dialog: false,
      delivery_dialog: false,
    };
  },
  computed: {
    isModernBills() {
      return this.modern && this.modernBills;
    },
    isModernBillsDark() {
      return this.isModernBills && !!this.USER?.()?.preferences?.dark;
    },
    billPaymentStatus() {
      return Object.values(TransactionStatus).find((status) => status.code === this.payment?.status);
    },
    billPaymentStatusClass() {
      if (this.payment?.status === TransactionStatus.Succeeded.code) return "sd-modern-status__dot--success";
      if (this.payment?.status === TransactionStatus.Canceled.code) return "sd-modern-status__dot--error";
      if ([TransactionStatus.RequireAction.code, TransactionStatus.Processing.code, TransactionStatus.RequireCapture.code].includes(this.payment?.status)) return "sd-modern-status__dot--warning";
      return undefined;
    },
    isCaptureAmountValid() {
      const amount = Number(this.capture_amount);
      return Number.isFinite(amount) && amount > 0 && amount <= Number(this.payment?.amount);
    },
    canBillCapture() {
      return !this.readonly && !this.IS_VENDOR_PANEL && this.is_require_capture &&
        Boolean(this.payment?.id && this.payment.shop_id && this.gateway?.code);
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    gateway() {
      return this.payment?.gateway;
    },
    is_require_capture() {
      return this.payment?.status === TransactionStatus.RequireCapture.code;
    },

    has_refund_action() {
      return !this.readonly && this.gateway?.actions?.includes("refund");
    },

    has_delivery_action() {
      return !this.readonly && this.gateway?.actions?.includes("delivery");
    },

    action_items() {
      if (this.readonly || this.IS_VENDOR_PANEL) return [];

      const out = [];

      if (this.has_refund_action) {
        out.push({
          title: this.$t("row_payment.actions.refund.title"),
          subtitle: this.$t("row_payment.actions.refund.subtitle"),
          icon: "keyboard_return",
          click: () => {
            this.refund_dialog = true;
          },
        });
      }
      if (this.has_delivery_action) {
        out.push({
          title: this.$t("row_payment.actions.delivery.title"),
          subtitle: this.$t("row_payment.actions.delivery.subtitle"),
          icon: "where_to_vote",
          click: () => {
            this.delivery_dialog = true;
          },
        });
      }

      return out;
    },

    percentageChange() {
      if (!this.capture_amount || !this.payment.amount) return null;
      const change =
          ((this.capture_amount - this.payment.amount) / this.payment.amount) * 100;

      // Format the percentage with a sign
      const sign = change > 0 ? "+" : ""; // Add "+" for positive values
      return `${sign}${change.toFixed(2)}`; // Include the sign with the formatted value
    },
  },
  watch: {
    payment() {
      if (!this.isModernBills) return;
      this.dialog_capture = false;
      this.accept_action = false;
      this.capture_amount = this.payment.amount;
    },
    dialog_capture(open) {
      if (!this.isModernBills || !open) return;
      this.accept_action = false;
      this.capture_amount = this.payment.amount;
    },
    capture_amount() {
      if (this.isModernBills) this.accept_action = false;
    },
  },
  created() {
    this.capture_amount = this.payment.amount;
  },

  methods: {
    capturePayment() {
      if (this.readonly) return;
      if (this.isModernBills && (!this.canBillCapture || this.busy_capture || !this.accept_action || !this.isCaptureAmountValid)) return;
      // A late capture response must update the submitted payment, not a newly selected bill.
      const capturedPayment = this.isModernBills ? this.payment : null;
      this.busy_capture = true;

      axios
        .post(
          window.API.POST_PAYMENT_GATEWAY_CAPTURE(
            this.payment.shop_id,
            this.gateway.code,
            this.payment.id,
          ),
          {
            amount: this.capture_amount,
            list: this.payment.currency,
          },
        )
        .then(({ data }) => {
          if (data.error)
            return NotificationService.showErrorAlert(null, data.error_msg);

          Object.assign(capturedPayment || this.payment, data.payment);
          if (capturedPayment) this.$emit("payment-captured", capturedPayment);
          else this.$emit("payment-captured");
          if (!capturedPayment || this.payment === capturedPayment) this.dialog_capture = false;

          NotificationService.showSuccessAlert(
            null,
            "The fund has been captured successfully. We have been update order based on captured amount.",
          );
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_capture = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-order-bill-payment {
  min-width: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;

  &__provider { display: flex; align-items: center; gap: 9px; margin-block-end: 20px; font-weight: 500; }
  &__provider img { flex: none; object-fit: contain; }
  &__provider p { margin: 1px 0 0; color: var(--sd-modern-muted); font-size: 12px; font-weight: 400; line-height: 18px; }
  &__facts { display: grid; grid-template-columns: 1.1fr 1fr 1fr; border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 20px; }
  &__fact { min-width: 0; padding-inline: 18px; border-inline-start: 1px solid var(--sd-modern-border); overflow-wrap: anywhere; }
  &__fact:first-child { border: 0; padding-inline-start: 0; }
  &__fact:last-child { padding-inline-end: 0; }
  .sd-modern-eyebrow { display: block; margin: 0 0 7px; font-size: 10px; font-weight: 400; line-height: 15px; letter-spacing: .65px; }
  &__fact > p { margin: 7px 0 0; font-size: 13px; line-height: 20px; }
  &__amount { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; font-weight: 500; font-variant-numeric: tabular-nums; }
  &__amount > bdi { font-size: 12px; font-weight: 400; color: var(--sd-modern-muted); }
  &__amount :deep(.small), &__fee :deep(.small) { font-size: inherit !important; }
  &__status { margin-block-start: 7px; font-size: 13px; line-height: 20px; }
  &__date { text-wrap: balance; }
  &__reference { display: grid; gap: 3px; margin-block-start: 14px; overflow-wrap: anywhere; }
  &__reference .sd-modern-eyebrow { margin: 0; }
  &__receipt { margin-block-start: 9px; }
  &__method { flex-wrap: wrap; gap: 6px; font-size: 13px; line-height: 20px; }
  &__method :deep(.v-chip) { height: auto; padding: 0; background: transparent !important; font-size: 13px; line-height: 20px; }
  &__method :deep(.v-chip__underlay) { display: none; }
  &__method :deep(.small), &__method :deep(small) { font-size: 13px; line-height: 20px; }
  &__risk { display: flex; align-items: center; gap: 8px; margin-block-start: 16px; }
  &__risk > :deep(.v-avatar) { flex: none; }
  &__risk .sd-modern-eyebrow { margin: 0 0 2px; }
  &__risk p { margin: 0; font-size: 12px; line-height: 18px; color: var(--sd-modern-muted); }
  &__billing { font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  &__billing :deep(small), &__billing :deep(.small) { font-size: 13px; line-height: 20px; }
  &__country { margin-block-start: 16px; }
  &__country:first-child { margin-block-start: 0; }
  &__country :deep(.small) { font-size: 13px; line-height: 20px; }
  &__muted { color: var(--sd-modern-muted); }
  &__capture-notice { margin-block-start: 20px; font-size: 13px; line-height: 20px; }
  &__capture-notice p { margin: 0 0 5px; }
  &__refunds { margin-block-start: 20px; padding-block-start: 20px; border-block-start: 1px solid var(--sd-modern-border); }
  &__refunds > h3 { display: flex; align-items: center; margin: 0 0 14px; font-size: 15px; font-weight: 500; line-height: 22px; }
  &__refund { display: grid; grid-template-columns: .7fr 1fr 1fr 1fr; align-items: start; gap: 16px; padding-block: 12px; border-block-end: 1px solid var(--sd-modern-border); }
  &__refund:last-child { border-block-end: 0; padding-block-end: 0; }
  &__refund > div { min-width: 0; display: grid; gap: 3px; overflow-wrap: anywhere; }
  &__refund .sd-modern-eyebrow { margin: 0; }

  // Keep canonical map/card ink colored while the surrounding facts inherit dark conversion.
  .smart-invert .s--card-window-content & :deep(.vue-world-map),
  .smart-invert .s--card-window-content & .b-order-bill-payment__method :deep(.v-chip__content > .d-block) { filter: invert(1); }

  @media (max-width: 700px) {
    &__facts { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    &__fact { padding-inline: 0; border-inline-start: 0; }
    &__fact + &__fact { border-block-start: 1px solid var(--sd-modern-border); padding-block-start: 20px; }
    &__refund { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
}

.b-order-bill-capture {
  padding: 0;
  border-radius: 16px;
  font-family: inherit;
  font-size: var(--sd-modern-font-body, 14px);
  line-height: 22px;

  &__header { display: flex; align-items: center; padding: 20px; white-space: normal; font-family: inherit; font-size: 18px; font-weight: 500; line-height: 24px; }
  &__body { display: grid; gap: 18px; padding: 0 20px 20px !important; font-size: var(--sd-modern-font-body, 14px); line-height: 22px; }
  &__body > p { margin: 0; }
  &__authorized { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 8px; font-size: var(--sd-modern-font-small, 13px); line-height: 20px; }
  &__authorized :deep(.small) { font-size: inherit !important; }
  &__amount :deep(.v-field__input) { font-size: var(--sd-modern-font-body, 14px); line-height: 22px; }
  &__body .sd-modern-notice { font-size: var(--sd-modern-font-small, 13px); line-height: 20px; }
  &__body .sd-modern-notice p { margin: 0; }
  &__verify { font-size: var(--sd-modern-font-body, 14px); line-height: 22px; }
  &__verify :deep(b) { font-weight: 400; }
  &__verify :deep(.small) { font-size: var(--sd-modern-font-small, 13px); line-height: 20px; }
  &__verify:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 8px; }
  &__actions { justify-content: flex-end; flex-wrap: wrap; gap: 8px; padding: 16px 20px; border-block-start: 1px solid var(--sd-modern-border); }
  &__actions > .v-btn { margin-inline-start: 0; }
  &__actions :deep(.v-btn__content) { font-size: 14px; line-height: 20px; }

  // The teleported capture dialog has its own conversion boundary outside the content window.
  &--inverted {
    filter: invert(1);

    :deep(img), :deep(.no-inv), :deep(span.fi), :deep(.flag-icon),
    :deep(.s--smart-verify__indicator), :deep(.s--smart-verify .v-avatar.avatar-gradient),
    .sd-modern-button--primary:not(.v-btn--disabled, :disabled, [aria-disabled="true"]) { filter: invert(1); }

    :deep(.no-inv img), :deep(.s--smart-verify .v-avatar.avatar-gradient img) { filter: none; }
  }

  @media (max-width: 600px), (pointer: coarse) {
    &__amount :deep(.v-field__input) { font-size: 16px; }
  }
}

.flex-row {
  display: flex;
  flex-direction: row;

  & > * {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }

  @media screen and (max-width: 840px) {
    flex-direction: column !important;
  }
}
</style>
