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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <u-pods-panel color="#fff">
    <u-pod-node icon="credit_card" title="Another Wallet"></u-pod-node>
    <u-pod-wire forward></u-pod-wire>

    <u-pod-node is-selldone-icon title="This Wallet"></u-pod-node>
  </u-pods-panel>

  <!-- ------------------- Top-up Form From Wallet ------------------- -->

  <b-account-input v-model="account_from" variant="outlined" label="From" ></b-account-input>

  <u-price-input
    v-model="amount"
    :currency="currency"
    :label="`${$t('account_page.deposit.form.amount_input')}*`"
    :messages="`${FormatNumberCurrency(
      amount,
      account.currency,
    )} ${GetUserSelectedCurrencyName(account.currency)}`"
    class="strong-field"
    required
    suffix=""
  >
    <template v-slot:append-inner>
      <u-currency-icon
        :currency="currency"
        flag
        gradient
        small
      ></u-currency-icon>
    </template>
  </u-price-input>

  <u-loading-progress v-if="busy_check"></u-loading-progress>
  <div class="my-5 text-muted small">
    <ul>
      <li>
        You can transfer funds from another one of your wallets. The system will
        automatically calculate the exchange rate for you.
      </li>
      <li>
        We don't charge any additional fees on exchange rates—it's completely
        free!
      </li>
      <li v-if="!busy_check && account_from" class="d-inline-flex my-1">
        Balance can be withdrawn from selected wallet:
        <v-chip color="#000" class="ms-1" variant="flat" label density="compact">
        <u-price
          :amount="free_balance"
          :currency="account_from.currency"></u-price>
        </v-chip>
      </li>

      <li v-if="!busy_check && exchange_rate" class="d-inline-flex">

       <span class="d-inline-flex align-center justify-center">
          <u-currency-icon
            :currency="currency_from"
            flag
            flag-only
          ></u-currency-icon>
         <v-icon class="mx-1">{{ $t("icons.chevron_next") }}</v-icon>
        <u-currency-icon
          :currency="currency_to"
          flag
          flag-only
        ></u-currency-icon>
         Exchange rate:
       </span>
        <v-chip color="#000" class="ms-1 font-weight-bold" variant="flat" label density="compact">{{exchange_rate}}</v-chip>
      </li>
    </ul>
  </div>

  <div class="widget-buttons">
    <v-btn
      :disabled="amount <=0  || !account_from"
      color="primary"
      rounded
      size="x-large"
      stacked
      variant="elevated"
      @click.stop="topUpWithAnotherWallet()"
      :loading="busy_transfer"
    >
      <div>
        {{ $t("account_page.deposit.form.charge_action") }}

        <u-price
          v-if="amount > 0"
          :amount="amount"
          :currency="account.currency"
          class="ms-2"
        >
        </u-price>
      </div>
      <div v-if="!account_from" class="small mt-1">
        ⚠ Please select a wallet to transfer funds from.
      </div>
      <div v-else-if="amount <= 0" class="small mt-1">
        ⚠ Please enter an amount to charge.
      </div>
    </v-btn>
  </div>



</template>

<script lang="ts">
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UPaymentForm from "../../../../../ui/payment/form/UPaymentForm.vue";
import UCurrencyIcon from "../../../../../ui/currency/icon/UCurrencyIcon.vue";
import UPodWire from "../../../../../ui/pod/wire/UPodWire.vue";
import UPodsPanel from "../../../../../ui/pod/panel/UPodsPanel.vue";
import UPodNode from "../../../../../ui/pod/node/UPodNode.vue";

import BAccountTax from "../../../../account/tax/BAccountTax.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import BAccountInput from "@selldone/components-vue/backoffice/account/input/BAccountInput.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ULoadingProgress from "@selldone/components-vue/ui/loading/progress/ULoadingProgress.vue";

export default {
  name: "BAccountChargePaymentFromWallet",
  mixins: [CurrencyMixin],
  components: {
    ULoadingProgress,
    BAccountInput,
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
  },

  data: () => ({
    amount: 0,
    account_from: null,
    busy_transfer: false,


    busy_check:false,
    exchange_rate: null,
    currency_from:null,
    currency_to: null,
    free_balance: 0,
    can_execute:false,
  }),
  computed: {
    currency() {
      return Currency[this.account.currency];
    },
  },

  watch: {
    account_from(){
      this.exchange_rate= null;
      this.currency_from= null;
      this.currency_to= null;
      this.free_balance = 0;
    },

    account_from(){
      this.checkAccount();
    }
  },
  created() {
    if (this.$route.query.charge) this.amount = this.$route.query.charge;
  },

  methods: {
    checkAccount() {
      if(!this.account)return;

      this.busy_check = true;
      axios
        .post(
          window.API.POST_ACCOUNT_EXCHANGE_WITH_ANOTHER_WALLET_CHECK(this.account.account_number),
          {
            account_from: this.account_from.account_number,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.exchange_rate=data.exchange_rate;
            this.free_balance=data.free_balance;
            this.currency_from= data.from;
            this.currency_to= data.to;


          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_check = null;
        });
    },

    topUpWithAnotherWallet() {
      this.busy_transfer = true;
      axios
        .post(
          window.API.POST_ACCOUNT_EXCHANGE_WITH_ANOTHER_WALLET(this.account.account_number),
          {
            amount: this.amount,
            account_from: this.account_from.account_number,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.amount=0;
            this.$emit("request:refresh");
            NotificationService.showSuccessAlert(
              null,
              `The funds have been successfully transferred from your wallet.`,
            );
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_transfer = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
