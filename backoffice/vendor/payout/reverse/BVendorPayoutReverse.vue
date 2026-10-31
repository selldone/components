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
  <v-card class="text-start" :class="{ 'sd-modern-widget b-vendor-payout-reverse': modern }" flat>
    <v-card-title :class="{ 'b-vendor-payout-reverse__header': modern }">
      <template v-if="modern"><h2>{{ $t('global.actions.reverse_fund') }}</h2><v-btn class="sd-modern-icon-button" icon variant="text" :aria-label="$t('global.actions.close')" :disabled="busy" @click="$emit('close')"><v-icon aria-hidden="true">close</v-icon><v-tooltip activator="parent" location="top" open-on-focus content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip></v-btn></template>
    </v-card-title>
    <v-card-text :class="{ 'b-vendor-payout-reverse__body': modern }">
      <template v-if="modern">
        <p class="b-vendor-payout-reverse__scope">{{ $t('marketplace_payouts.modern.partialScope') }}</p>
        <b-vendor-box v-if="vendor" :vendor="vendor" modern />
        <dl class="b-vendor-payout-reverse__totals">
          <div><dt class="b-vendor-payout-reverse__summary-label">{{ $t('marketplace_payouts.modern.originalAmount') }}</dt><dd><u-price :amount="payment.amount" :currency="currency" /></dd></div>
          <div><dt class="b-vendor-payout-reverse__summary-label">{{ $t('marketplace_payouts.modern.totalReversed') }}</dt><dd><u-price :amount="-Number(payment.reversal || 0)" :currency="currency" /></dd></div>
          <div><dt class="b-vendor-payout-reverse__summary-label">{{ $t('marketplace_payouts.modern.remaining') }}</dt><dd><u-price :amount="remains_amount" :currency="currency" /></dd></div>
        </dl>
        <p v-if="payment.deleted_at" class="sd-modern-notice" role="status">{{ $t('marketplace_payouts.modern.deletedHelp') }}</p>
        <p v-else-if="remains_amount <= 0" class="sd-modern-notice" role="status">{{ $t('marketplace_payouts.modern.noRemaining') }}</p>
        <div class="b-vendor-payout-reverse__fields">
          <u-currency-input :model-value="currency" :active-currencies="[currency]" :label="$t('global.commons.currency')" :return-object="false" disabled variant="underlined" class="sd-modern-underlined-field" />
          <u-price-input v-model="amount" :currency="currency" :disabled="busy || !!payment.deleted_at || remains_amount <= 0" :label="$t('global.commons.amount')" :error-messages="Number(amount) > remains_amount ? $t('marketplace_payouts.modern.remainingValue', { amount: `${remains_amount} ${currency}` }) : undefined" :messages="$t('marketplace_payouts.modern.remainingValue', { amount: `${remains_amount} ${currency}` })" variant="underlined" class="sd-modern-underlined-field" />
        </div>
        <v-textarea v-model="reason" :disabled="busy || !!payment.deleted_at" :label="$t('marketplace_payouts.modern.reason')" :messages="$t('marketplace_payouts.modern.noteHelp')" :placeholder="$t('marketplace_wallets.payout.note_placeholder')" class="sd-modern-underlined-field" variant="underlined" auto-grow rows="2" persistent-placeholder />
        <u-smart-suggestion v-if="!payment.deleted_at" :samples="$tm('suggestions.vendor_payment.reverse_fund_reason')" @select="value => reason = value" />
        <details class="b-vendor-payout-reverse__history"><summary>{{ $t('marketplace_payouts.modern.reversalHistory') }}</summary><b-vendor-payout-history v-if="payment.reversal_detail?.length" :payment="payment" /><p v-else>{{ $t('marketplace_payouts.modern.noReversals') }}</p></details>
        <details v-if="Object.keys(payment.meta || {}).length" class="b-vendor-payout-reverse__metadata"><summary>{{ $t('global.commons.meta') }}</summary><dl><div v-for="(value, key) in payment.meta" :key="key"><dt class="sd-modern-list-header">{{ getName(key) }}</dt><dd>{{ value }}</dd></div></dl></details>
      </template>
      <template v-else>
      <div class="widget-box mb-5">
        <u-widget-header icon="move_up" title="Revers transfer">
        </u-widget-header>

        <v-list-subheader>
          <div>
            <b>Important! </b>
            Following each reversal, funds will be added to the vendor's virtual
            wallet within your marketplace. If you need to issue a refund for an
            order or provide a partial refund while simultaneously deducting the
            amount from the vendor's wallet, please perform a
            <b>Vendor Refund</b> on the order page.
          </div>
        </v-list-subheader>

        <!-- Visual fund flow -->
        <div class="text-center d-flex align-center justify-center" dir="ltr">
          <div class="min-width-100">
            <v-icon>wallet</v-icon>
            <small class="d-block">Vendor wallet</small>
          </div>
          <v-icon class="rotate-180 mb-4">trending_flat</v-icon>
          <div class="min-width-100">
            <v-icon>account_balance</v-icon>
            <small class="d-block">Vendor account</small>
          </div>
        </div>

        <v-list-subheader>
          This is the detailed information about the payment and the history of
          any reversal transactions associated with it.
        </v-list-subheader>
        <b-vendor-payout-history :payment="payment"></b-vendor-payout-history>
      </div>

      <div class="widget-box mb-5">
        <u-widget-header :title="option" icon="account_balance">
        </u-widget-header>

        <v-list-subheader>
          This payment is transferred to the vendor, but under certain
          circumstances, such as order cancellation or partial order refund, a
          reversal can be applied.
        </v-list-subheader>

        <u-pods-panel>
          <u-pod-node icon="business" title="You"></u-pod-node>
          <u-pod-wire backward></u-pod-wire>
          <u-pod-node :image="vendor?.icon" :title="`Vendor ${vendor?.name}`">
          </u-pod-node>
        </u-pods-panel>

        <u-text-value-box
          v-for="(it, k) in payment.meta"
          :key="k"
          :label="getName(k)"
          vb50
          >{{ it }}
        </u-text-value-box>
      </div>

      <div class="widget-box mb-5">
        <u-widget-header icon="paid" title="Reversing transfer">
        </u-widget-header>

        <v-list-subheader
          >Initiate a reverse transfer from the vendor account back to your
          primary account. This option can be utilized for partial refunds.
        </v-list-subheader>

        <u-currency-input
          :label="$t('global.commons.currency')"
          :return-object="false"
          :value="currency"
          disabled
          variant="underlined"
        ></u-currency-input>
        <u-price-input
          v-model="amount"
          :currency="currency"
          :error-messages="
            amount > remains_amount
              ? 'The remaining amount has been exceeded.'
              : undefined
          "
          :label="$t('global.commons.amount')"
          :messages="`Remains amount: ${remains_amount} ${currency}`"
          class="strong-field"
          variant="underlined"
        ></u-price-input>

        <v-textarea
          v-model="reason"
          :label="$t('global.commons.note')"
          append-inner-icon="sticky_note_2"
          auto-grow
          hide-details
          persistent-placeholder
          placeholder="You can attach a note here... It's visible to the vendor."
          rows="2"
          variant="underlined"
        >
        </v-textarea>
        <u-smart-suggestion
          :samples="$tm('suggestions.vendor_payment.reverse_fund_reason')"
          @select="(v) => (reason = v)"
        >
        </u-smart-suggestion>
      </div>
      </template>
    </v-card-text>

    <v-card-actions :class="{ 'b-vendor-payout-reverse__footer': modern }">
      <div :class="modern ? 'b-vendor-payout-reverse__actions' : 'widget-buttons'">
        <v-btn :size="modern ? undefined : 'x-large'" :class="{ 'sd-modern-button': modern }" :disabled="modern && busy" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          v-if="!modern || !payment.deleted_at"
          :class="{ disabled: !amount || amount > remains_amount, 'sd-modern-button sd-modern-button--danger': modern }"
          :disabled="modern ? !canReverseModern : undefined"
          :loading="busy"
          :color="modern ? 'error' : 'red'"
          :size="modern ? undefined : 'x-large'"
          :variant="modern ? 'elevated' : 'flat'"
          @click="reverseTransfer"
        >
          <v-icon class="me-1">remove</v-icon>
          {{ $t("global.actions.reverse_fund") }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../../../ui/currency/input/UCurrencyInput.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import UTextValueBox from "../../../../ui/text/value-box/UTextValueBox.vue";
import BVendorPayoutHistory from "../../../vendor/payout/history/BVendorPayoutHistory.vue";
import USmartSuggestion from "../../../../ui/smart/suggestion/USmartSuggestion.vue";
import BVendorBox from "../../../vendor/box/BVendorBox.vue";


export default {
  name: "BVendorPayoutReverse",
  mixins: [],
  components: {
    BVendorBox,
    USmartSuggestion,
    BVendorPayoutHistory,

    UTextValueBox,
    UPodWire,
    UPodNode,
    UPodsPanel,

    UCurrencyInput,
    UPriceInput,
  },
  props: {
    modern: { type: Boolean, default: false },
    shop: {
      required: true,
    },

    payment: { required: true },
  },
  data: () => ({
    busy: false,
    reverseRequest: null,

    amount: 0,
    reason: null,
  }),
  computed: {
    canReverseModern() {
      return !!(this.payment?.id && !this.payment.deleted_at && !this.busy && Number.isFinite(Number(this.amount)) && Number(this.amount) > 0 && Number(this.amount) <= this.remains_amount);
    },
    option() {
      return this.payment.option;
    },
    vendor() {
      return this.payment.vendor;
    },
    currency() {
      return this.payment.currency;
    },
    remains_amount() {
      return this.payment.amount - (this.payment.reversal || 0);
    },
  },

  watch: {
    payment() {
      this.amount = 0;
      this.reason = null;
      if (this.modern) {
        this.reverseRequest = null;
        this.busy = false;
      }
    },
    'shop.id'() {
      if (!this.modern) return;
      this.reverseRequest = null;
      this.busy = false;
      this.amount = 0;
      this.reason = null;
    },
  },

  created() {},

  beforeUnmount() {
    this.reverseRequest = null;
  },

  methods: {
    //――――――――――――――――――――――― Revers transfer ―――――――――――――――――――――――
    reverseTransfer() {
      if (this.modern && !this.canReverseModern) return;
      const modern = this.modern;
      const payment = this.payment;
      const paymentId = payment.id;
      const shopId = this.shop.id;
      const request = Symbol();
      if (modern) this.reverseRequest = request;
      // A completed request must only affect the dialog that submitted it.
      const isCurrent = () => !modern || (this.modern && this.reverseRequest === request && this.payment === payment && this.payment.id === paymentId && this.shop.id === shopId);
      this.busy = true;

      return axios
        .post(
          window.API.POST_SHOP_VENDOR_PAYMENT_REVERSE_TRANSFER(
            shopId,
            paymentId,
          ),
          {
            currency: this.currency,
            amount: this.modern ? Number(this.amount) : (this.reverse ? -1 : 1) * this.amount,
            reason: this.reason,
          },
        )
        .then(({ data }) => {
          if (!isCurrent()) return;
          if (!data.error) {
            Object.assign(this.payment, data.payment); // Update current payment.
            this.$emit("update", data.payment);
            if (!isCurrent()) return;
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (!isCurrent()) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (!isCurrent()) return;
          this.busy = false;
          if (modern) this.reverseRequest = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-vendor-payout-reverse {
  --sd-modern-icon-button-size: 33px;
  padding: 24px;
  border: 0;
  border-radius: 18px !important;
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  > .b-vendor-payout-reverse__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; padding: 0; margin-block-end: 18px; white-space: normal; }
  &__header h2 { margin: 0; font-size: 21px; font-weight: 500; line-height: 29px; }
  > .b-vendor-payout-reverse__body { padding: 0 !important; font-size: 13px; line-height: 20px; }
  &__scope { margin: 0 0 20px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__totals { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin: 22px 0; }
  &__summary-label { margin: 0; color: var(--sd-modern-muted); font-size: 12px; line-height: 19px; font-weight: 400; }
  &__totals dd { margin: 6px 0 0; font-size: 14px; line-height: 21px; font-weight: 500; overflow-wrap: anywhere; }
  &__fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
  &__history, &__metadata { margin-block-start: 20px; }
  &__history summary, &__metadata summary { min-height: 44px; padding-block: 12px; cursor: pointer; }
  &__history summary:focus-visible, &__metadata summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
  &__metadata dl { display: grid; gap: 14px; margin: 8px 0 0; }
  &__metadata dd { margin: 6px 0 0; overflow-wrap: anywhere; }
  > .b-vendor-payout-reverse__footer { padding: 22px 0 0; }
  &__actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 10px; width: 100%; }
}
@media (max-width: 600px) {
  .b-vendor-payout-reverse { padding: 19px 15px; &__fields, &__totals { grid-template-columns: minmax(0, 1fr); gap: 14px; } }
}
</style>
