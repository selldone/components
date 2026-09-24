<!--
  - Copyright (c) 2026. Selldone® Business OS™
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
  <tr class="text-start">
    <td>
      <div class="d-flex align-center">
        <img
          alt=""
          class="mx-2"
          height="24"
          src="../../../../../assets/icons/samin-token.svg"
        />
        <div class="d-flex flex-column align-start ga-1">
          <span>
            {{ $t("process_center.payment_widget.samin.title") }}
            {{ $t("global.commons.cashback") }}
          </span>
          <b-fee-cashback-deal-badge
            compact
            :label="$t('process_center.payment_widget.samin.special_cashback')"
          />
        </div>
      </div>
    </td>

    <td class="text-left">
      <div
        v-for="(cashback, index) in cashbacks"
        :key="`fee-cashback-amount-${index}`"
        :class="{
          'text-decoration-line-through text-medium-emphasis':
            cashback.status === 'reversed',
        }"
        class="my-1"
      >
        <span class="d-inline-flex align-center" dir="ltr">
          <span v-if="isFiniteNumericValue(cashback.cashback_amount)">−</span>
          <u-price
            :amount="cashbackAmountMagnitude(cashback.cashback_amount)"
            :currency="cashback.currency"
          />
        </span>
      </div>
    </td>

    <td>
      <div
        v-for="wallet in cashbackWallets"
        :key="wallet.accountNumber"
        class="my-1"
      >
        <b-account-box
          v-if="wallet.account"
          :account="wallet.account"
          :readonly="isRolePanel"
          compact
        />
        <small v-else class="d-flex align-center text-medium-emphasis">
          <v-icon class="me-1" size="small">wallet</v-icon>
          {{ formatCard(wallet.accountNumber) }}
        </small>
      </div>
    </td>

    <td class="text-start">
      <template
        v-for="(cashback, index) in cashbacks"
        :key="`fee-cashback-transactions-${index}`"
      >
        <div class="d-flex flex-column align-stretch ga-1 py-2">
          <div class="d-flex align-center justify-space-between flex-wrap ga-1">
            <div class="d-flex align-center flex-wrap ga-1">
              <v-chip
                :color="
                  cashback.status === 'reversed'
                    ? 'warning'
                    : !cashback.transferred
                      ? null
                      : 'success'
                "
                size="x-small"
                variant="tonal"
              >
                <v-icon size="12" start>
                  {{
                    cashback.status === "reversed"
                      ? "undo"
                      : !cashback.transferred
                        ? "pending"
                        : "check_circle"
                  }}
                </v-icon>
                {{
                  cashback.status === "reversed"
                    ? $t("global.actions.reverse_fund")
                    : !cashback.transferred
                      ? $t("global.commons.pending")
                      : $t("global.commons.credit")
                }}
              </v-chip>
              <small class="d-inline-flex align-center ga-1">
                <v-icon aria-hidden="true" size="14">
                  {{ cashback.component === "gift_card" ? "redeem" : "paid" }}
                </v-icon>
                {{
                  cashback.component === "gift_card"
                    ? $t("process_center.payment_widget.gift_card")
                    : $t("process_center.payment_widget.payment_gateway")
                }}
              </small>
            </div>

            <strong class="text-subtitle-2">
              <template v-if="isFiniteNumericValue(cashback.cashback_bps)">
                {{
                  numeralFormat(
                    cashbackPercent(cashback.cashback_bps),
                    "0.[00]",
                  )
                }}%
              </template>
              <template v-else>—</template>
            </strong>
          </div>

          <v-progress-linear
            v-if="isFiniteNumericValue(cashback.cashback_bps)"
            :aria-label="`${$t('process_center.payment_widget.samin.percent')}: ${numeralFormat(cashbackPercent(cashback.cashback_bps), '0.[00]')}%`"
            bg-color="surface-variant"
            bg-opacity="0.12"
            :color="cashback.status === 'reversed' ? 'warning' : 'primary'"
            height="6"
            :model-value="cashbackProgress(cashback.cashback_bps)"
            rounded
          />

          <div
            v-if="
              isFiniteNumericValue(cashback.cashback_bps) ||
              isFiniteNumericValue(cashback.fee_amount)
            "
            class="d-flex align-center justify-space-between flex-wrap ga-x-3 ga-y-1 text-caption text-medium-emphasis"
          >
            <span v-if="isFiniteNumericValue(cashback.cashback_bps)">
              {{ cashback.cashback_bps }} bps
            </span>
            <span
              v-if="isFiniteNumericValue(cashback.fee_amount)"
              class="d-inline-flex align-center ga-1"
            >
              {{ $t("process_center.payment_widget.samin.title") }}:
              <u-price
                :amount="cashback.fee_amount"
                :currency="cashback.currency"
              />
            </span>
          </div>
        </div>
        <v-divider v-if="index < cashbacks.length - 1" />
      </template>
    </td>
  </tr>
</template>

<script lang="ts">
import type { PropType } from "vue";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import BAccountBox from "@selldone/components-vue/backoffice/account/box/BAccountBox.vue";
import BFeeCashbackDealBadge from "./BFeeCashbackDealBadge.vue";

interface AccountSummary {
  user_id: number;
  account_number: string;
  account_name: string | null;
  balance: number | string;
  locked: number | string;
  currency: string;
}

interface CashbackWallet {
  accountNumber: string;
  account: AccountSummary | null;
}

type NumericValue = number | string | null | undefined;

interface SelldoneFeeCashbackSnapshot {
  event: "credit";
  component: "gateway" | "gift_card";
  currency: string;
  fee_amount?: number | string | null;
  cashback_bps?: number | string | null;
  cashback_amount?: number | string | null;
  status: "credited" | "reversed";
  transferred: boolean;
  wallet_account_number: string | null;
}

export default {
  name: "BOrderPaymentRowFeeCashback",
  components: { BAccountBox, BFeeCashbackDealBadge },
  mixins: [AccountMixin],
  props: {
    accounts: {
      type: Array as PropType<AccountSummary[]>,
      default: () => [],
    },
    cashbacks: {
      type: Array as PropType<SelldoneFeeCashbackSnapshot[]>,
      required: true,
    },
    isRolePanel: Boolean,
  },
  computed: {
    cashbackWallets() {
      const seenAccountNumbers = new Set<string>();
      const wallets: CashbackWallet[] = [];

      this.cashbacks.forEach((cashback) => {
        const accountNumber = cashback.wallet_account_number;
        if (!accountNumber || seenAccountNumbers.has(accountNumber)) return;

        seenAccountNumbers.add(accountNumber);
        wallets.push({
          accountNumber,
          account:
            this.accounts.find(
              (account) => account.account_number === accountNumber,
            ) || null,
        });
      });

      return wallets;
    },
  },
  methods: {
    isFiniteNumericValue(value: NumericValue) {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && !value.trim()) return false;
      return Number.isFinite(Number(value));
    },
    cashbackAmountMagnitude(amount: NumericValue) {
      if (!this.isFiniteNumericValue(amount)) return amount;
      return Math.abs(Number(amount));
    },
    cashbackPercent(bps: NumericValue) {
      const percent = Number(bps) / 100;
      return Number.isFinite(percent) ? percent : 0;
    },
    cashbackProgress(bps: NumericValue) {
      return Math.min(100, Math.max(0, this.cashbackPercent(bps)));
    },
  },
};
</script>
