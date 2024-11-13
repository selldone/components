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
  <span class="d-flex align-start flex-grow-1 w-100 text-start flex-wrap">
    <div>
      <div class="d-flex align-center">
        <u-currency-icon
          :currency="account.currency"
          class="mx-1"
          flag
        ></u-currency-icon>
        <b class="mx-1">{{ account.currency }}</b>
      </div>
      <v-icon class="me-1" size="small">wallet</v-icon>
      <b class="text-subtitle-2" title="Account Number">{{
        formatCard(account.account_number)
      }}</b>
    </div>

    <v-spacer></v-spacer>
    <span class="mx-2 flex-grow-1">
      <small class="d-block">{{ $t("account_list.free_balance") }} </small>
      <u-price
        :amount="account.balance - account.locked"
        :currency="account.currency"
      ></u-price>
    </span>

    <span class="mx-2 flex-grow-1">
      <small class="d-block"> {{ $t("account_list.account_name") }}</small>
      <div v-if="USER().id === account.user_id">
        <v-btn
          :to="{
            name: 'BPageAccountTransactions',
            params: { account_number: account.account_number },
          }"
          class="tnt"
          color="primary"
          size="small"
          title="See account detail and transactions."
          variant="text"
          >{{ account.account_name }}
          <v-icon class="ms-1" size="small">open_in_new</v-icon></v-btn
        >
      </div>
      <div v-else>
        <div class="text-subtitle-2 d-flex align-center">
          <v-avatar class="avatar-gradient -thin -user me-1" size="24">
            <v-img :src="getUserAvatar(account.user_id)" />
          </v-avatar>

          {{ account.account_name }}
        </div>
        <small>You are not the wallet owner!</small>
      </div>
    </span>
  </span>
</template>

<script lang="ts">
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";

export default {
  name: "BAccountBox",
  mixins: [AccountMixin],
  components: { UCurrencyIcon },
  props: {
    account: { required: true },
  },

  data: () => ({}),

  watch: {},

  created() {},
};
</script>

<style scoped></style>
