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
  <v-card class="text-start" flat>
    <v-card-title></v-card-title>
    <v-card-text>
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
    </v-card-text>

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :class="{ disabled: !amount || amount > remains_amount }"
          :loading="busy"
          color="red"
          size="x-large"
          variant="flat"
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


export default {
  name: "BVendorPayoutReverse",
  mixins: [],
  components: {
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
    shop: {
      required: true,
    },

    payment: { required: true },
  },
  data: () => ({
    busy: false,

    amount: 0,
    reason: null,
  }),
  computed: {
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
      return this.payment.amount - this.payment.reversal;
    },
  },

  watch: {
    payment() {
      this.assign();
    },
  },

  created() {},

  methods: {
    //――――――――――――――――――――――― Revers transfer ―――――――――――――――――――――――
    reverseTransfer() {
      this.busy = true;

      axios
        .post(
          window.API.POST_SHOP_VENDOR_PAYMENT_REVERSE_TRANSFER(
            this.shop.id,
            this.payment.id,
          ),
          {
            currency: this.currency,
            amount: (this.reverse ? -1 : 1) * this.amount,
            reason: this.reason,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            Object.assign(this.payment, data.payment); // Update current payment.
            this.$emit("update", data.payment);
            this.$emit("close");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
