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
  <article
    v-if="modern"
    class="b-account-card--modern sd-modern-clickable-item text-start"
    @click="$emit('select', account)"
  >
    <header class="b-account-card__header">
      <u-currency-icon
        v-if="currency"
        :currency="currency"
        class="b-account-card__currency"
        flag
        gradient
        small
      />
      <div class="b-account-card__identity">
        <button
          type="button"
          class="b-account-card__name"
          @click.stop="$emit('select', account)"
        >
          <bdi>{{ title }}</bdi>
        </button>
        <div class="b-account-card__code">{{ account.currency }}</div>
        <p v-if="!currency" class="b-account-card__currency-error" role="status">
          <v-icon size="16" color="error" aria-hidden="true">warning_amber</v-icon>
          {{ account.currency }} not found in the currency list of webapp!
        </p>
      </div>
    </header>

    <div class="b-account-card__balance-block">
      <div class="b-account-card__label">{{ $t("account_card.balance") }}</div>
      <u-price
        :amount="account.balance"
        :currency="account.currency"
        :class="{ 'text-error': account.balance < 0 }"
        class="b-account-card__balance"
      />
    </div>

    <div class="b-account-card__locked">
      <span>{{ $t("account_card.locked") }}:</span>
      <u-price
        :amount="account.locked"
        :currency="account.currency"
        :class="{ 'text-error': account.locked < 0 }"
        class="b-account-card__locked-value"
      />
    </div>

    <div class="b-account-card__number-row">
      <button
        v-if="title_big"
        v-copy="formatCard(account.account_number)"
        type="button"
        class="b-account-card__number"
        :aria-label="$t('account_card.copy_account_number')"
        @click.stop
      >
        <bdi dir="ltr">{{ formatCard(account.account_number) }}</bdi>
        <v-icon size="14" aria-hidden="true">content_copy</v-icon>
        <v-tooltip
          activator="parent"
          location="top"
          content-class="sd-modern-tooltip text-start"
          open-on-focus
        >{{ $t("account_card.copy_account_number") }}</v-tooltip>
      </button>
    </div>

    <div class="b-account-card__states">
      <span class="sd-modern-status sd-modern-status--plain b-account-card__status">
        <span class="sd-modern-status__dot" :class="modern_status_class" aria-hidden="true" />
        {{ title_big_span }}
      </span>
      <span
        v-if="account.deleted_at"
        class="sd-modern-status sd-modern-status--plain b-account-card__status"
      >
        <span class="sd-modern-status__dot sd-modern-status__dot--error" aria-hidden="true" />
        {{ $t("global.commons.archived") }}
      </span>
      <span
        v-else-if="account.status === 'Payment'"
        class="sd-modern-status sd-modern-status--plain b-account-card__status"
      >
        <span class="sd-modern-status__dot sd-modern-status__dot--warning" aria-hidden="true" />
        {{ $t("global.commons.pending") }}
      </span>
    </div>

    <div class="b-account-card__receipt">
      <v-btn
        v-if="account.status === 'Payment'"
        color="primary"
        class="sd-modern-button sd-modern-button--compact"
        variant="flat"
        @click.stop="ShowReceiptPaymentDialog(account.fee_receipt.receipt_number)"
      >{{ $t("account_card.pay_create_receipt") }}</v-btn>
    </div>

    <div class="b-account-card__footer">
      <template v-if="extended">
        <v-btn
          :to="{
            name: 'BPageAccountTransfer',
            params: { account_number: account.account_number },
          }"
          class="sd-modern-button sd-modern-button--compact b-account-card__action"
          variant="text"
          prepend-icon="north"
          @click.stop
        >{{ $t("account_card.transfer") }}</v-btn>
        <v-btn
          :to="{
            name: 'BPageAccountDeposit',
            params: { account_number: account.account_number },
          }"
          class="sd-modern-button sd-modern-button--compact b-account-card__action"
          variant="text"
          prepend-icon="south"
          @click.stop
        >{{ $t("account_card.charge") }}</v-btn>
      </template>
    </div>
  </article>
  <div v-else style="height: 100%" @click="$emit('select', account)">
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
import { BEventBusMixin } from "../../../utils/events/BEventBusMixin.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import URibbon from "@selldone/components-vue/ui/ribbon/URibbon.vue";

export default {
  name: "BAccountCard",
  mixins: [BEventBusMixin,AccountMixin],
  components: {URibbon, UCurrencyIcon },
  props: {
    modern: {
      type: Boolean,
      default: false,
    },
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

    modern_status_class() {
      if (this.account.status === "Approved") return "sd-modern-status__dot--success";
      if (["Checking", "Payment"].includes(this.account.status)) return "sd-modern-status__dot--warning";
      if (["Rejected", "Deleted", "Banned"].includes(this.account.status)) return "sd-modern-status__dot--error";
      return undefined;
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

.b-account-card--modern {
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  padding: 18px 16px 12px;
  border: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.09));
  border-radius: 14px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  font-family: inherit;

  @supports (grid-template-rows: subgrid) {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 7;
    row-gap: 0;
  }

  .b-account-card__header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-width: 0;
    padding-block-end: 22px;
  }

  .b-account-card__currency {
    flex-shrink: 0;
    min-height: 34px;
    line-height: 34px;
  }

  .b-account-card__identity {
    min-width: 0;
    flex: 1;
  }

  .b-account-card__name {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: start;
    overflow-wrap: anywhere;

    &:hover {
      color: rgb(var(--v-theme-primary));
    }
  }

  .b-account-card__code,
  .b-account-card__label,
  .b-account-card__locked,
  .b-account-card__status {
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
  }

  .b-account-card__code {
    margin-block-start: 2px;
    line-height: 16px;
  }

  .b-account-card__currency-error {
    margin: 8px 0 0;
    font-size: 12px;
    line-height: 18px;
  }

  .b-account-card__balance {
    display: block;
    margin-block: 3px 7px;
    font-size: 25px;
    font-weight: 500;
    line-height: 32px;
    letter-spacing: -0.7px;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;

    :deep(.small) {
      font-size: 25px !important;
      font-weight: 500;
      letter-spacing: 0;
    }

    :deep(.cur-name) {
      font-size: 11px !important;
      font-weight: 400;
      letter-spacing: 0;
    }
  }

  .b-account-card__locked {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 4px;
  }

  .b-account-card__locked-value {
    color: rgb(var(--v-theme-on-surface));
    font-size: 11px;
    font-weight: 400;
    line-height: 17px;
    font-variant-numeric: tabular-nums;

    :deep(.small),
    :deep(.cur-name) {
      font-size: 11px !important;
      font-weight: 400;
    }
  }

  .b-account-card__number-row {
    padding-block-start: 20px;
    min-width: 0;
  }

  .b-account-card__number {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 26px;
    max-width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    font-variant-numeric: tabular-nums;

    bdi {
      overflow-wrap: anywhere;
    }
  }

  .b-account-card__states {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    padding-block: 7px 16px;
  }

  .b-account-card__status {
    line-height: 16px;
  }

  .b-account-card__receipt:has(.v-btn) {
    padding-block-end: 12px;
  }

  .b-account-card__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-block-start: auto;
  }

  .b-account-card__footer:has(.v-btn) {
    padding-block-start: 11px;
    border-block-start: 1px solid var(--sd-modern-border, rgba(var(--v-theme-on-surface), 0.09));
  }

  .b-account-card__action {
    flex: 1;
    min-width: 0;
    color: var(--sd-modern-muted, rgba(var(--v-theme-on-surface), 0.66));

    :deep(.v-icon) {
      font-size: 14px;
    }
  }

  @media (max-width: 599px), (pointer: coarse) {
    .b-account-card__name,
    .b-account-card__number {
      min-height: 44px;
    }

    .b-account-card__header {
      padding-block-end: 17px;
    }

    .b-account-card__number-row {
      padding-block-start: 15px;
    }
  }
}
</style>
