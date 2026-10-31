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

<template>
  <section
    class="sd-modern-widget b-account-charge-payment text-start"
    :dir="$vuetify.locale.isRtl ? 'rtl' : 'ltr'"
  >
    <component
      :is="
        mode === 'bank'
          ? 'BAccountChargePaymentFromBank'
          : 'BAccountChargePaymentFromWallet'
      "
      :key="`${account.account_number}-${mode}`"
      :account="account"
      v-bind="mode === 'bank' ? { gateways } : {}"
      @request:refresh="$emit('request:refresh')"
    >
      <template #method="{ busy = false }">
        <h2>{{ $t("account_page.deposit.modern.method") }}</h2>
        <v-btn-toggle
          v-model="mode"
          mandatory
          :disabled="busy"
          class="b-account-charge-payment__tabs"
          variant="text"
          :aria-label="$t('account_page.deposit.modern.method')"
        >
          <v-btn
            value="bank"
            class="b-account-charge-payment__tab"
            :aria-pressed="mode === 'bank'"
          >
            <v-icon size="18" class="me-2" aria-hidden="true"
              >credit_card</v-icon
            >{{ $t("account_page.deposit.modern.bank") }}
          </v-btn>
          <v-btn
            value="wallet"
            class="b-account-charge-payment__tab"
            :aria-pressed="mode === 'wallet'"
          >
            <v-icon size="18" class="me-2" aria-hidden="true"
              >account_balance_wallet</v-icon
            >{{ $t("account_page.deposit.modern.wallet") }}
          </v-btn>
        </v-btn-toggle>
        <div
          class="b-account-charge-method__flow"
          role="img"
          :aria-label="`${$t(mode === 'bank' ? 'account_page.deposit.modern.bank' : 'account_page.deposit.modern.other_wallet')} → ${$t('account_page.deposit.modern.this_wallet')}`"
        >
          <div class="b-account-charge-method__node">
            <span
              ><v-icon size="20" aria-hidden="true">{{
                mode === "bank" ? "credit_card" : "account_balance_wallet"
              }}</v-icon></span
            >{{
              $t(
                mode === "bank"
                  ? "account_page.deposit.modern.bank"
                  : "account_page.deposit.modern.other_wallet",
              )
            }}
          </div>
          <div class="b-account-charge-method__wire">
            <span /><v-icon size="16" aria-hidden="true">{{
              $t("icons.arrow_next")
            }}</v-icon>
          </div>
          <div class="b-account-charge-method__node">
            <span
              ><img
                :src="require('../../../../assets/selldone-logo/selldone.svg')"
                width="20"
                height="20"
                alt="Selldone" /></span
            >{{ $t("account_page.deposit.modern.this_wallet") }}
          </div>
        </div>
      </template>
      <template #account>
        <h2>{{ $t("account_page.deposit.modern.to_wallet") }}</h2>
        <div class="b-account-charge-payment__account">
          <u-currency-icon
            :currency="currency"
            :flag-only="!!(currency?.flag || currency?.icon)"
            small
          />
          <div class="b-account-charge-payment__identity">
            <div class="b-account-charge-payment__name">
              <bdi>{{ account.account_name }}</bdi>
            </div>
            <button
              v-copy="formatCard(account.account_number)"
              type="button"
              class="b-account-charge-payment__copy"
              :aria-label="$t('account_page.deposit.modern.copy')"
            >
              <bdi dir="ltr">{{ formatCard(account.account_number) }}</bdi
              ><v-icon size="13" aria-hidden="true">content_copy</v-icon>
              <v-tooltip
                activator="parent"
                location="top"
                content-class="sd-modern-tooltip text-start"
                open-on-focus
                >{{ $t("account_page.deposit.modern.copy") }}</v-tooltip
              >
            </button>
            <span class="b-account-charge-payment__code">{{
              account.currency
            }}</span>
          </div>
        </div>
        <div class="b-account-charge-payment__available">
          <span class="b-account-charge-payment__caption">{{
            $t("account_page.deposit.modern.available")
          }}</span>
          <u-price
            :amount="account.balance - account.locked"
            :currency="account.currency"
            class="b-account-charge-payment__available-value"
          />
        </div>
        <dl class="b-account-charge-payment__facts">
          <div>
            <dt>{{ $t("account_page.deposit.modern.balance") }}</dt>
            <dd>
              <u-price :amount="account.balance" :currency="account.currency" />
            </dd>
          </div>
          <div>
            <dt>{{ $t("account_page.deposit.modern.locked") }}</dt>
            <dd>
              <u-price :amount="account.locked" :currency="account.currency" />
            </dd>
          </div>
        </dl>
      </template>
    </component>
  </section>
</template>

<script lang="ts">
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import BAccountChargePaymentFromBank from "./from-bank/BAccountChargePaymentFromBank.vue";
import BAccountChargePaymentFromWallet from "./from-wallet/BAccountChargePaymentFromWallet.vue";
export default {
  name: "BAccountChargePayment",
  mixins: [AccountMixin],
  components: {
    UCurrencyIcon,
    BAccountChargePaymentFromBank,
    BAccountChargePaymentFromWallet,
  },
  emits: ["request:refresh"],
  props: {
    account: { required: true, type: Object },
    gateways: { required: true, type: Array },
  },
  data: () => ({ mode: "bank" }),
  computed: {
    currency() {
      return Currency[this.account.currency];
    },
  },
};
</script>

<style lang="scss" scoped>
.b-account-charge-payment {
  padding: 26px;
  border-radius: 17px;
  font-size: 14px;
  line-height: 22px;
  :deep(.b-account-charge-method) {
    display: grid;
    grid-template-columns: minmax(0, 1.45fr) minmax(260px, 1fr);
    column-gap: 26px;
  }
  :deep(.b-account-charge-method__fields) {
    grid-column: 1;
    grid-row: 1;
    min-width: 0;
  }
  :deep(.b-account-charge-method__context) {
    grid-column: 2;
    grid-row: 1 / span 2;
    min-width: 0;
    padding-inline-start: 26px;
    border-inline-start: 1px solid var(--sd-modern-border);
  }
  :deep(.b-account-charge-method__actions) {
    grid-column: 1;
    grid-row: 2;
    min-width: 0;
    margin-block-start: 30px;
    padding-block-start: 18px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  :deep(h2),
  :deep(h3) {
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
  }
  &__tabs {
    display: flex;
    width: 100%;
    height: 44px;
    margin-block: 14px 28px;
    border-radius: 0;
    border-block-end: 1px solid var(--sd-modern-border);
  }
  &__tab {
    flex: 1;
    min-width: 0;
    height: 44px !important;
    border-radius: 0 !important;
    text-transform: none;
    color: var(--sd-modern-muted);
    font-size: 14px;
    font-weight: 400;
    letter-spacing: 0;
    border-block-end: 2px solid transparent;
  }
  &__tab.v-btn--active {
    color: rgb(var(--v-theme-on-surface));
    border-block-end-color: currentColor;
  }
  &__tab :deep(.v-btn__overlay) {
    opacity: 0 !important;
  }
  &__tab:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: -3px;
  }
  &__account {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-block-start: 18px;
    min-width: 0;
  }
  &__identity {
    min-width: 0;
    flex: 1;
  }
  &__name {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    overflow-wrap: anywhere;
  }
  &__copy,
  :deep(.b-account-charge-method__copy) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    min-height: 28px;
    padding: 2px 4px;
    margin-inline: -4px;
    border-radius: 5px;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 20px;
    text-align: start;
  }
  &__copy bdi,
  :deep(.b-account-charge-method__copy bdi) {
    overflow-wrap: anywhere;
  }
  &__copy:hover,
  :deep(.b-account-charge-method__copy:hover) {
    background: var(--sd-modern-inset);
  }
  &__copy:focus-visible,
  :deep(.b-account-charge-method__copy:focus-visible) {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }
  &__code,
  &__caption,
  :deep(.b-account-charge-method__caption) {
    display: block;
    color: var(--sd-modern-muted);
    font-size: 13px;
    line-height: 20px;
  }
  &__available {
    margin-block: 28px 18px;
  }
  &__available-value {
    display: block;
    margin-block-start: 4px;
    font-size: 24px;
    font-weight: 500;
    line-height: 31px;
    font-variant-numeric: tabular-nums;
  }
  &__available-value :deep(.small) {
    font-size: inherit !important;
    font-weight: inherit;
  }
  &__available-value :deep(.cur-name) {
    font-size: 13px !important;
    font-weight: 400;
  }
  &__facts,
  :deep(.b-account-charge-method__facts) {
    margin: 0;
    display: grid;
    gap: 12px;
    font-size: 13px;
    line-height: 20px;
  }
  &__facts > div,
  :deep(.b-account-charge-method__facts > div) {
    display: flex;
    justify-content: space-between;
    gap: 14px;
  }
  &__facts dt,
  :deep(.b-account-charge-method__facts dt) {
    color: var(--sd-modern-muted);
  }
  &__facts dd,
  :deep(.b-account-charge-method__facts dd) {
    margin: 0;
    text-align: end;
    overflow-wrap: anywhere;
  }
  &__facts :deep(.u--price),
  :deep(.b-account-charge-method__facts .u--price) {
    font-weight: inherit;
  }
  &__facts :deep(.u--price .small),
  :deep(.b-account-charge-method__facts .u--price .small) {
    font-size: inherit !important;
  }
  :deep(.b-account-charge-method__summary) {
    margin-block-start: 28px;
    padding-block-start: 24px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  :deep(.b-account-charge-method__summary h3) {
    margin-block-end: 18px;
  }
  :deep(.b-account-charge-method__total) {
    margin-block-start: 12px;
    padding-block-start: 20px;
    border-block-start: 1px solid var(--sd-modern-border);
  }
  :deep(.b-account-charge-method__total dd) {
    font-size: 20px;
    font-weight: 500;
    line-height: 28px;
  }
  :deep(.b-account-charge-method__total .cur-name) {
    font-size: 13px !important;
    font-weight: 400;
  }
  :deep(.b-account-charge-method__amount) {
    margin-block-start: 28px;
  }
  :deep(.b-account-charge-method__label) {
    display: flex;
    justify-content: space-between;
    margin-block-end: 4px;
    font-size: 13px;
    line-height: 20px;
  }
  :deep(.b-account-charge-method__amount .sd-modern-underlined-field) {
    --sd-modern-field-height: 56px;
  }
  :deep(
    .b-account-charge-method__amount
      .sd-modern-underlined-field
      .v-field.v-field--variant-underlined
      input.v-field__input
  ) {
    padding-block: 6px 8px;
    font-size: 30px;
    font-weight: 400;
    line-height: 40px;
    font-variant-numeric: tabular-nums;
  }
  :deep(
    .b-account-charge-method__amount
      .sd-modern-underlined-field
      .v-field.v-field--variant-underlined
      .v-field__append-inner
  ) {
    align-self: center;
    padding-block: 0;
    white-space: nowrap;
    font-size: 13px;
    color: var(--sd-modern-muted);
  }
  :deep(.b-account-charge-method__note) {
    margin: 8px 0 0;
    color: var(--sd-modern-muted);
    font-size: 13px;
    font-weight: 400;
    line-height: 21px;
  }
  :deep(.b-account-charge-method__flow) {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 12px;
    margin-block-end: 24px;
  }
  :deep(.b-account-charge-method__node) {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 56px;
    font-size: 12px;
    line-height: 19px;
    text-align: center;
  }
  :deep(.b-account-charge-method__node > span) {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid var(--sd-modern-border);
    border-radius: 11px;
    background: rgb(var(--v-theme-surface));
  }
  :deep(.b-account-charge-method__wire) {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 24px;
  }
  :deep(.b-account-charge-method__wire > span) {
    flex: 1;
    height: 1px;
    background: var(--sd-modern-border);
  }
  :deep(.b-account-charge-method__notice) {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 14px;
    margin-block: 16px;
    background: var(--sd-modern-inset);
    border-radius: 10px;
    font-size: 13px;
    line-height: 21px;
  }
  :deep(.b-account-charge-method__notice p) {
    margin: 0;
  }
  :deep(.b-account-charge-method__source) {
    margin-block: 24px;
  }
  :deep(.b-account-charge-method__rate) {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-block-start: 14px;
    font-size: 13px;
    line-height: 21px;
  }
  :deep(.b-account-charge-method__actions .sd-modern-button) {
    width: 100%;
  }
  @media (max-width: 760px) {
    padding: 22px;
    :deep(.b-account-charge-method) {
      display: flex;
      flex-direction: column;
    }
    :deep(.b-account-charge-method__context) {
      display: contents;
    }
    :deep(.b-account-charge-method__wallet) {
      order: 0;
      padding-block-end: 24px;
      border-block-end: 1px solid var(--sd-modern-border);
    }
    :deep(.b-account-charge-method__fields) {
      order: 1;
      margin-block-start: 24px;
    }
    :deep(.b-account-charge-method__summary) {
      order: 2;
      margin-block-start: 24px;
    }
    :deep(.b-account-charge-method__actions) {
      order: 3;
      margin-block-start: 20px;
    }
  }
  @media (max-width: 480px) {
    padding: 20px;
    &__copy,
    :deep(.b-account-charge-method__copy) {
      min-height: 44px;
    }
  }
  @media (pointer: coarse) {
    &__copy,
    :deep(.b-account-charge-method__copy) {
      min-height: 44px;
    }
  }
}
</style>
