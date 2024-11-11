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
  <tr v-if="payment" :class="{ 'flex-row': flexMode }" class="text-start">
    <td>
      <div class="d-flex align-center">
        <v-icon v-if="sub" class="ms-5 flip-ltr" color="black"
          >keyboard_return
        </v-icon>

        <img :src="getShopImagePath(gateway?.icon)" class="mx-2" height="24" />
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
        <div v-if="is_require_capture" class="widget-buttons">
          <v-btn color="#673AB7" size="x-large" @click="dialog_capture = true">
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

      <td class="text-center">
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
          color="#673AB7"
          size="x-small"
          target="_blank"
          @click.stop=""
          append-icon="launch"
        >
          Receipt URL
        </v-btn>

        <u-smart-menu
          v-if="action_items?.length"
          :items="action_items"
          class="ms-1 float-end"
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
        <div v-if="is_require_capture" class="widget-buttons">
          <v-btn color="#673AB7" size="x-large" @click="dialog_capture = true">
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
      <td class="text-center">
        <div
          v-if="payment.fee"
          :title="`${gateway?.name} transaction fee.`"
          class="ma-1 d-flex align-center"
        >
          <v-img
            :src="getShopImagePath(gateway?.logo)"
            height="24"
            max-width="36"
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
          color="#673AB7"
          size="x-small"
          target="_blank"
          title="See payment receipt on the payment service provider."
          @click.stop=""
          append-icon="launch"
        >
          Receipt URL
        </v-btn>

        <u-smart-menu
          v-if="action_items?.length"
          :items="action_items"
          class="ms-1 float-end"
        ></u-smart-menu>
      </td>
    </template>
  </tr>

  <!-- █████████████████████████ Refunds █████████████████████████ -->
  <tr
    v-for="refund in payment?.refunds"
    :key="refund.sd_unique_id"
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
  </tr>

  <!-- █████████████████████████ Dialog > Confirm Cash Payment (For bill only) █████████████████████████ -->

  <v-dialog
    v-if="is_require_capture"
    v-model="dialog_capture"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <img :src="getShopImagePath(gateway?.icon)" class="me-2" height="24" />
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
                This will replace the 'amount' value in Selldone's payment
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

export default {
  name: "BOrderPaymentRowPayment",
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
      return this.gateway?.actions?.includes("refund");
    },

    has_delivery_action() {
      return this.gateway?.actions?.includes("delivery");
    },

    action_items() {
      if (this.IS_VENDOR_PANEL) return [];

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
  },
  created() {
    this.capture_amount = this.payment.amount;
  },

  methods: {
    capturePayment() {
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
          if (data.error) return this.showErrorAlert(null, data.error_msg);

          Object.assign(this.payment, data.payment);
          this.$emit("payment-captured");
          this.dialog_capture = false;

          this.showSuccessAlert(
            null,
            "The fund has been captured successfully. We have been update order based on captured amount.",
          );
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_capture = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
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
