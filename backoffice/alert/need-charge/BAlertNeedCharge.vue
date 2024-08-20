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
    v-if="
      (no_account_error || negative_balance_account_error) &&
      !force_hide &&
      !sample &&
      !busy
    "
    class="b--alert-need-charge"
  >
    <div class="text-muted ma-auto pa-2">
      <div class="ma-3 d-flex align-center justify-center">
        <v-avatar class="rounded-lg ma-1" color="red" size="48">
          <v-icon color="#fff">error_outline</v-icon>
        </v-avatar>
      </div>

      <template v-if="no_account_error">
        <h1 class="font-weight-thin text-h3">
          Please connect your wallet to continue.
        </h1>
        <p class="my-6 typo-body max-widget-width mx-auto">
          You don't have a connected wallet for your shop. The service fee for
          Selldone will be deducted from this virtual wallet. To connect a
          wallet, please click the button below.
        </p>

        <v-btn
          :to="{ name: 'BPageShopFinanceBill' }"
          prepend-icon="wallet"
          class="tnt"
          append-icon="open_in_new"
          target="_blank"
          >Manage Wallet
        </v-btn>
      </template>
      <template v-else>
        <h1 class="font-weight-thin text-h3">
          Please charge your accounts to continue.
        </h1>
        <p class="my-6 typo-body max-widget-width mx-auto">
          You have wallets with a negative balance! Please recharge them. You
          can easily add funds to your wallet to ensure you always have enough
          money to cover service fees.
        </p>

        <v-list class="pa-2 border-between-vertical" rounded="xl">
          <b-account-box
            v-for="account in negative_balance_accounts"
            :account="account"
            class="py-1"
          ></b-account-box>
        </v-list>

        <v-btn
          :to="{ name: 'BPageShopFinanceBill' }"
          prepend-icon="wallet"
          class="mt-3 tnt"
          append-icon="open_in_new"
          target="_blank"
          >Manage Connected Wallet
        </v-btn>
      </template>

      <u-count-down
        :end="end"
        @end="force_hide = true"
        class="ma-auto my-5 text-white"
      ></u-count-down>
    </div>
  </div>
</template>

<script lang="ts">
import BAccountBox from "@selldone/components-vue/backoffice/account/box/BAccountBox.vue";
import UCountDown from "@selldone/components-vue/ui/count-down/UCountDown.vue";

export default {
  name: "BAlertNeedCharge",
  components: { UCountDown, BAccountBox },
  inject: ["$shop"],
  data() {
    return {
      force_hide: false,
      end: new Date().addSeconds(60),

      exchanges: null,
      busy: false,
    };
  },
  computed: {
    sample() {
      return this.$shop.sample;
    },
    shop_gateways() {
      return this.$shop.shop_gateways;
    },
    accounts() {
      return this.$shop.accounts;
    },

    no_account_error() {
      return this.accounts?.length === 0;
    },
    negative_balance_accounts() {
      return this.accounts?.filter(
        (a) => a.balance < this.threshold(a.currency),
      );
    },
    negative_balance_account_error() {
      return this.negative_balance_accounts?.length > 0;
    },
  },
  created() {
    if (!this.sample) {
      this.busy = true;
      window.$backoffice?.finance.exchange
        .optimize(600)
        .cancellation(true)
        .list()
        .then((exchanges) => {
          this.exchanges = exchanges;
          //console.log("exchange list", exchanges);
        })
        .finally(() => {
          this.busy = false;
        });
    }
  },
  methods: {
    threshold(currency: string) {
      const USD_THRESHOLD = 25;
      if (!this.exchanges) return 0;
      if (currency === "USD") return -USD_THRESHOLD;
      const rate = this.exchanges[currency];
      if (!rate) return 0;
      return -USD_THRESHOLD * rate;
    },
  },
};
</script>
s

<style scoped lang="scss">
.b--alert-need-charge {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px) grayscale(0.8);
  color: #fff !important;
  z-index: 9999999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: auto;

  p,
  h1 {
    color: #fff !important;
  }
}
</style>
