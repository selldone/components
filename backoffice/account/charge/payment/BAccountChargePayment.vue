<!--
  - Copyright (c) 2023-2025. Selldone® Business OS™
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
  <div class="widget-box">
    <u-widget-header
      :title="$t('account_page.deposit.form.title')"
      icon="add_box"
    ></u-widget-header>

    <v-list-subheader>
      {{ $t("account_page.deposit.form.sub_title") }}
    </v-list-subheader>

    <div class="text-center">
      <v-btn-toggle
        v-model="mode"
        class="my-3 overflow-visible bg-white"
        rounded="lg"
        selected-class="blue-flat elevation-1"
        style="max-height: 80px;height: auto"
      >
        <v-btn class="tnt ma-1" value="bank" variant="elevated" min-width="100" stacked height="52">
          My Bank

            <div class="mt-1">
              <img
                key="mastercard"
                class="me-1"
                height="16"
                src="../../../../../core-js/enums/payment/assets/payments/mastercard.svg"
                alt="Mastercard"
              />
              <img
                key="maestro"
                class="me-1"
                height="16"
                src="../../../../../core-js/enums/payment/assets/payments/maestro.svg"
                alt="Maestro"
              />
              <img
                key="visa"
                class="me-1"
                height="16"
                src="../../../../../core-js/enums/payment/assets/payments/visa.svg"
                alt="Visa"
              />
              <img
                key="visa"
                class="me-1"
                height="16"
                src="../../../../../core-js/enums/payment/assets/payments/wechat.png"
                alt="Visa"
              />
              <img
                key="visa"
                class="me-1"
                height="16"
                src="../../../../../core-js/enums/payment/assets/payments/amex.svg"
                alt="Visa"
              />
              ...
            </div>

        </v-btn>
        <v-btn
          class="tnt ma-1"
          value="wallet"
          variant="elevated"
          min-width="100"
          stacked height="52"
        >
          My Wallets
        </v-btn>
      </v-btn-toggle>
    </div>

    <b-account-charge-payment-from-bank
      v-if="mode==='bank'"
      :gateways="gateways"
      :account="account"
      @request:refresh="$emit('request:refresh')"
    ></b-account-charge-payment-from-bank>

    <b-account-charge-payment-from-wallet
      v-else-if="mode==='wallet'"
      :account="account"
      @request:refresh="$emit('request:refresh')"
    ></b-account-charge-payment-from-wallet>
  </div>
</template>

<script lang="ts">
import UPriceInput from "../../../../ui/price/input/UPriceInput.vue";
import UPaymentForm from "../../../../ui/payment/form/UPaymentForm.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import UPodWire from "../../../../ui/pod/wire/UPodWire.vue";
import UPodsPanel from "../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../ui/pod/node/UPodNode.vue";

import BAccountTax from "../../tax/BAccountTax.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import BAccountChargePaymentFromBank from "@selldone/components-vue/backoffice/account/charge/payment/from-bank/BAccountChargePaymentFromBank.vue";
import BAccountChargePaymentFromWallet
  from "@selldone/components-vue/backoffice/account/charge/payment/from-wallet/BAccountChargePaymentFromWallet.vue";

export default {
  name: "BAccountChargePayment",
  mixins: [CurrencyMixin],
  components: {
    BAccountChargePaymentFromWallet,
    BAccountChargePaymentFromBank,
    BAccountTax,

    UPodNode,
    UPodsPanel,
    UPodWire,
    UCurrencyIcon,
    UPaymentForm,
    UPriceInput,
  },

  emits: ["request:refresh"],

  props: {
    account: {
      required: true,
      type: Object,
    },

    gateways: {
      required: true,
      type: Array,
    },
  },

  data: () => ({
    mode: "bank",
  }),
  computed: {},

  watch: {},
  created() {},

  methods: {},
};
</script>

<style lang="scss" scoped></style>
