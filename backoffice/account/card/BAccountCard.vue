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
  <div style="height: 100%" @click="$emit('select', account)">
    <s-widget
      :class="[small ? 'm-1' : '', dark ? 'widget-dark' : '']"
      :style="`background: ${color}`"
      :title="`<h5 class='align-items-center pb-1'>    <span class='circle ${status_class} mr-sm' style='font-size: 6px;'></span>  ${title}  </h5>`"
      body-class="p-0 mt"
      class="text-start widget-hover pointer-pointer"
      custom-header
      style="border-radius: 24px; min-height: 160px; height: inherit"
    >
      <u-ribbon v-if="account.deleted_at" red>{{$t('global.commons.archived')}}</u-ribbon>
      <u-ribbon v-else-if="account.status === 'Payment'" amber>{{$t('global.commons.pending')}}</u-ribbon>

      <template v-slot:top-left>
        <template v-if="currency">
          <u-currency-icon
            :currency="currency"
            :small="small"
            gradient
          ></u-currency-icon>

          <p class="small text-center text-muted">
            {{ $t(currency.name) }}
          </p>
        </template>

        <b v-else class="text-red">🚧 {{ account.currency }} 🚧</b>
      </template>

      <v-alert v-if="!currency" color="red" density="compact" type="error">
        {{ account.currency }} not found in the currency list of webapp!
      </v-alert>

      <p
        v-if="title_big"
        :class="small ? 'small' : ''"
        class="mb-1 mt-8 account-name text-center"
      >
        <flag
          v-if="currency && currency.flag"
          :iso="currency.flag"
          :squared="false"
          class="me-2"
        />

        <span v-copy @click.stop>{{ formatCard(account.account_number) }}</span>

        <v-chip
          :color="account.status === 'Approved' ? 'green' : undefined"
          class="ms-2"
          size="x-small"
        >
          {{ title_big_span }}
        </v-chip>
      </p>

      <p v-if="account.status === 'Payment'">
        <v-btn
          color="primary"
          rounded
          variant="elevated"
          @click.stop="ShowReceiptPaymentDialog(account.fee_receipt.receipt_number)"
        >
          {{ $t("account_card.pay_create_receipt") }}
        </v-btn>
      </p>

      <div class="d-flex justify-content-between mt-5 w-100 max-w-550 mx-auto">
        <p>
          <small>{{ $t("account_card.balance") }}:</small>
          <u-price
            :amount="account.balance"
            :class="{ 'text-danger': account.balance < 0 }"
            :currency="account.currency"
            class="mx-1"
          ></u-price>
        </p>
        <p>
          <small>{{ $t("account_card.locked") }}:</small>

          <u-price
            :amount="account.locked"
            :class="{ 'text-danger': account.locked < 0 }"
            :currency="account.currency"
            class="mx-1"
          ></u-price>
        </p>
      </div>

      <div
        v-if="extended"
        class="d-flex border-top pt-2 mt-2 justify-content-between"
      >
        <v-btn
          :to="{
            name: 'BPageAccountTransfer',
            params: { account_number: account.account_number },
          }"
          class="muted-hover-off"
          variant="flat"
          @click.stop
        >
          <v-icon class="mx-2" size="small">
            fa:fas fa-long-arrow-alt-up
          </v-icon>
          {{ $t("account_card.transfer") }}
        </v-btn>
        <v-btn
          :to="{
            name: 'BPageAccountDeposit',
            params: { account_number: account.account_number },
          }"
          class="muted-hover-off"
          variant="flat"
          @click.stop
        >
          <v-icon class="mx-2" size="small">
            fa:fas fa-long-arrow-alt-down
          </v-icon>
          {{ $t("account_card.charge") }}
        </v-btn>
      </div>
    </s-widget>
  </div>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { AccountStatus } from "@selldone/core-js/enums/wallet/AccountStatus";
import UCurrencyIcon from "../../../ui/currency/icon/UCurrencyIcon.vue";
import { BEventBusMixin } from "@app-backoffice/mixins/event-bus/BEventBusMixin.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import URibbon from "@selldone/components-vue/ui/ribbon/URibbon.vue";

export default {
  name: "BAccountCard",
  mixins: [BEventBusMixin,AccountMixin],
  components: {URibbon, UCurrencyIcon },
  props: {
    account: {
      required: true,
      type: Object,
    },

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "white",
      type: String,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },
    extended: {
      required: false,
      default: false,
      type: Boolean,
    },
    iconColor: {
      required: false,
      type: String,
      default: "#333",
    },
    active: {
      required: false,
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {};
  },
  computed: {
    currency() {
      return Currency[this.account.currency];
    },

    title() {
      return this.account.account_name;
    },

    title_big() {
      return this.formatCard(this.account.account_number);
    },

    title_big_span() {
      return this.$t(AccountStatus[this.account.status]?.name);
    },

    status_class() {
      return AccountStatus[this.account.status]?.class;
    },
  },
  created() {},
  mounted() {},
  methods: {},
};
</script>

<style lang="scss" scoped>
.account-name {
  font-weight: 600;
  font-size: 1.2em;
}

.float-numbers {
  font-size: 0.8em;
  opacity: 0.7;
}
</style>
