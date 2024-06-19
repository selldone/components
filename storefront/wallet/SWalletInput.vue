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
  <v-list-item v-if="wallet" variant="flat" base-color="#673AB7" rounded="lg" lines="two" prepend-icon="wallet" append-icon="celebration">
    <template v-slot:title>
      <u-price :amount="wallet.balance" :currency="wallet.currency" ></u-price>
    </template>
    <template v-slot:subtitle>
      <div class="mt-1">
        My wallet balance
      </div>
    </template>
  </v-list-item>
</template>

<script>
import UPrice from "@selldone/components-vue/ui/price/UPrice.vue";

export default {
  name: "SWalletInput",
  components: { UPrice },
  emits: ["update:modelValue"],
  props: {
    currency: {
      required: true,
      type: String,
    },
  },
  data: () => ({
    busy: false,
    wallet:null,
  }),
  watch: {
    currency() {
      this.fetchWallet();
    },
  },
  created() {
    this.fetchWallet();
  },
  methods: {
    fetchWallet() {
      this.busy = true;
      axios
        .get(window.XAPI.GET_MY_WALLETS(this.shop_name), {
          params: {
            currency: this.currency,
          },
        })
        .then(({ data }) => {
          this.wallet = data.wallets[0];
        })

        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy = false;
        });
    },
  },
};
</script>

<style scoped></style>
