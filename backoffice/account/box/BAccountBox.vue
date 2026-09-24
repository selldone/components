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
  <v-menu
    v-if="compact"
    :close-on-content-click="false"
    location="bottom start"
    offset="4"
    open-on-click
    open-on-focus
    open-on-hover
  >
    <template v-slot:activator="{ props: activatorProps }">
      <v-btn
        :aria-label="account.account_name || formatCard(account.account_number)"
        v-bind="activatorProps"
        class="ma-1"
        color="primary"
        height="40"
        size="small"
        variant="text"
      >
        <v-icon start>wallet</v-icon>
        {{
          account.account_name?.limitWords(2) ||
          formatCard(account.account_number)
        }}
        <v-icon end>expand_more</v-icon>
      </v-btn>
    </template>

    <v-card class="pa-3 text-start" min-width="280" rounded="xl">
      <div class="d-flex align-center flex-wrap">
        <v-btn
          v-if="!readonly && USER().id === account.user_id"
          :to="{
            name: 'BPageAccountTransactions',
            params: { account_number: account.account_number },
          }"
          class="px-0 me-2"
          color="primary"
          height="40"
          rel="noopener noreferrer"
          size="small"
          target="_blank"
          variant="text"
        >
          <v-icon start>wallet</v-icon>
          {{ account.account_name || formatCard(account.account_number) }}
          <v-icon end>open_in_new</v-icon>
        </v-btn>
        <div v-else class="d-flex align-center font-weight-bold me-2">
          <v-icon class="me-1">wallet</v-icon>
          {{ account.account_name || formatCard(account.account_number) }}
        </div>
        <v-spacer></v-spacer>
        <u-currency-icon
          :currency="account.currency"
          class="ms-2"
          flag
        ></u-currency-icon>
        <b class="ms-1">{{ account.currency }}</b>
      </div>

      <div class="font-weight-bold my-2">
        {{ formatCard(account.account_number) }}
      </div>

      <div>
        <small class="d-block">{{ $t("account_list.free_balance") }}</small>
        <u-price
          :amount="account.balance - account.locked"
          :currency="account.currency"
        ></u-price>
      </div>
    </v-card>
  </v-menu>

  <span
    v-else
    class="d-flex align-start flex-grow-1 w-100 text-start flex-wrap"
  >
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
      <div v-if="readonly || USER().id === account.user_id">
        <v-btn
          v-if="!readonly"
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
        <div v-else class="text-subtitle-2 d-flex align-center">
          <v-icon class="me-1" size="small">wallet</v-icon>
          {{ account.account_name }}
        </div>
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
    compact: Boolean,
    readonly: Boolean,
  },

  data: () => ({}),

  watch: {},

  created() {},
};
</script>

<style scoped></style>
