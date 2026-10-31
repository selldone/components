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

<template>
  <div class="b-account-charge-method">
    <div class="b-account-charge-method__fields">
      <slot name="method" :busy="busy_transfer" />
      <!-- ------------------- Top-up Form From Wallet ------------------- -->
      <b-account-input
        v-model="account_from"
        :disabled="busy_transfer"
        variant="underlined"
        clearable
        :label="$t('account_page.deposit.modern.source')"
        :messages="$t('account_page.deposit.modern.source_help')"
        class="sd-modern-underlined-field"
      />
      <div v-if="account_from" class="b-account-charge-method__source">
        <button
          v-copy="formatCard(account_from.account_number)"
          type="button"
          class="b-account-charge-method__copy"
          :aria-label="$t('account_page.deposit.modern.copy')"
        >
          <bdi dir="ltr">{{ formatCard(account_from.account_number) }}</bdi
          ><v-icon size="13" aria-hidden="true">content_copy</v-icon>
          <v-tooltip
            activator="parent"
            location="top"
            content-class="sd-modern-tooltip text-start"
            open-on-focus
            >{{ $t("account_page.deposit.modern.copy") }}</v-tooltip
          >
        </button>
        <div v-if="quote_ready" class="b-account-charge-method__note">
          {{ $t("account_page.deposit.modern.source_available") }} ·
          <u-price :amount="free_balance" :currency="account_from.currency" />
        </div>
      </div>
      <div
        v-if="busy_check"
        class="b-account-charge-method__note"
        role="status"
      >
        <v-progress-circular indeterminate size="14" width="2" class="me-2" />{{
          $t("global.commons.loading")
        }}
      </div>
      <div
        v-if="quote_error"
        class="b-account-charge-method__notice"
        role="alert"
      >
        <v-icon size="16" aria-hidden="true">error_outline</v-icon>
        <div>
          {{ $t("account_page.deposit.modern.source_error")
          }}<v-btn
            v-if="
              account_from &&
              account_from.account_number !== account.account_number
            "
            variant="text"
            class="sd-modern-button sd-modern-button--inline"
            @click="checkAccount()"
            >{{ $t("account_page.deposit.modern.retry") }}</v-btn
          >
        </div>
      </div>
      <div class="b-account-charge-method__amount">
        <label
          :for="`account-charge-wallet-${account.account_number}`"
          class="b-account-charge-method__label"
          >{{ $t("account_page.deposit.modern.amount")
          }}<span aria-hidden="true">*</span></label
        >
        <u-price-input
          :id="`account-charge-wallet-${account.account_number}`"
          v-model="amount"
          :decimal="currency.floats"
          :disabled="busy_transfer"
          :aria-label="$t('account_page.deposit.modern.amount')"
          :aria-describedby="`account-charge-wallet-help-${account.account_number}`"
          class="sd-modern-underlined-field"
          required
          hide-details
          variant="underlined"
          suffix=""
          dir="ltr"
          inputmode="decimal"
          ><template #append-inner
            ><span>{{ input_currency }}</span></template
          ></u-price-input
        >
        <p
          :id="`account-charge-wallet-help-${account.account_number}`"
          class="b-account-charge-method__note"
        >
          {{
            $t("account_page.deposit.modern.amount_help", {
              currency: input_currency,
            })
          }}<span v-if="charge_amount > 0">
            · <u-price :amount="charge_amount" :currency="account.currency"
          /></span>
        </p>
      </div>
      <div
        v-if="quote_ready && currency_from !== currency_to"
        class="b-account-charge-method__rate"
      >
        <span>{{ $t("account_page.deposit.modern.exchange_rate") }}</span>
        <u-currency-icon
          :currency="GetCurrency(currency_from)"
          flag-only
          small
        />
        <bdi dir="ltr"
          >1 {{ currency_from }} = {{ exchange_rate }} {{ currency_to }}</bdi
        >
        <u-currency-icon :currency="GetCurrency(currency_to)" flag-only small />
      </div>
      <p class="b-account-charge-method__note">
        {{ $t("account_page.deposit.modern.no_exchange_fee") }}
      </p>
    </div>
    <aside class="b-account-charge-method__context">
      <div class="b-account-charge-method__wallet"><slot name="account" /></div>
      <div
        class="b-account-charge-method__summary"
        aria-live="polite"
        :aria-busy="busy_check"
      >
        <h3>{{ $t("account_page.deposit.modern.summary") }}</h3>
        <dl class="b-account-charge-method__facts">
          <div>
            <dt>{{ $t("account_page.deposit.modern.source_debit") }}</dt>
            <dd>
              <u-price
                v-if="quote_ready"
                :amount="source_debit"
                :currency="account_from.currency"
              /><span v-else>—</span>
            </dd>
          </div>
          <div class="b-account-charge-method__total">
            <dt>{{ $t("account_page.deposit.modern.wallet_credit") }}</dt>
            <dd>
              <u-price :amount="charge_amount" :currency="account.currency" />
            </dd>
          </div>
        </dl>
      </div>
    </aside>
    <div class="b-account-charge-method__actions">
      <div
        v-if="quote_ready && source_debit > free_balance"
        class="b-account-charge-method__notice"
        role="alert"
      >
        <v-icon size="16" aria-hidden="true">error_outline</v-icon
        >{{ $t("account_page.deposit.modern.insufficient") }}
      </div>
      <v-btn
        :disabled="!can_transfer"
        :loading="busy_transfer"
        color="primary"
        variant="elevated"
        class="sd-modern-button sd-modern-button--primary"
        prepend-icon="swap_vert"
        @click.stop="topUpWithAnotherWallet()"
        >{{ $t("account_page.deposit.modern.wallet_transfer") }}</v-btn
      >
      <p
        v-if="!account_from || !charge_amount"
        class="b-account-charge-method__note"
      >
        {{
          $t(
            !account_from
              ? "account_page.deposit.modern.source_required"
              : "account_page.deposit.modern.amount_required",
          )
        }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import UPriceInput from "../../../../../ui/price/input/UPriceInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import UCurrencyIcon from "../../../../../ui/currency/icon/UCurrencyIcon.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import AccountMixin from "@selldone/components-vue/mixin/account/AccountMixin.ts";
import BAccountInput from "../../../input/BAccountInput.vue";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAccountChargePaymentFromWallet",
  mixins: [CurrencyMixin, AccountMixin],
  components: { BAccountInput, UCurrencyIcon, UPriceInput },
  emits: ["request:refresh"],
  props: { account: { required: true, type: Object } },
  data: () => ({
    amount: 0,
    account_from: null,
    busy_transfer: false,
    busy_check: false,
    exchange_rate: null,
    currency_from: null,
    currency_to: null,
    free_balance: 0,
    quote_request: 0,
    quote_source: null,
    quote_destination: null,
    quote_error: false,
  }),
  computed: {
    currency() {
      return Currency[this.account.currency];
    },
    input_currency() {
      const name = this.$t(
        this.account.currency === "IRR"
          ? "transaction_form.modern.rial"
          : this.currency.name,
      );
      return name === this.account.currency
        ? name
        : `${this.account.currency} · ${name}`;
    },
    charge_amount() {
      const amount = Number(this.amount);
      return Number.isFinite(amount) && amount > 0 ? amount : 0;
    },
    quote_ready() {
      return (
        !!this.account_from &&
        this.quote_source === this.account_from.account_number &&
        this.quote_destination === this.account.account_number &&
        this.currency_from === this.account_from.currency &&
        this.currency_to === this.account.currency &&
        Number.isFinite(this.exchange_rate) &&
        this.exchange_rate > 0 &&
        !this.busy_check &&
        !this.quote_error
      );
    },
    source_debit() {
      if (!this.quote_ready || !this.charge_amount) return 0;
      return Number(
        (this.charge_amount / this.exchange_rate).toFixed(
          Currency[this.account_from.currency].floats,
        ),
      );
    },
    can_transfer() {
      return (
        this.charge_amount > 0 &&
        this.account_from?.account_number !== this.account.account_number &&
        this.quote_ready &&
        !this.busy_transfer &&
        Number.isFinite(this.source_debit) &&
        this.source_debit > 0 &&
        this.source_debit <= this.free_balance
      );
    },
  },
  watch: {
    account_from() {
      this.checkAccount();
    },
  },
  created() {
    const amount = Number(this.$route.query.charge);
    if (Number.isFinite(amount) && amount > 0) this.amount = amount;
  },
  beforeUnmount() {
    this.quote_request++;
  },
  methods: {
    checkAccount() {
      const request = ++this.quote_request;
      this.exchange_rate = null;
      this.currency_from = null;
      this.currency_to = null;
      this.free_balance = 0;
      this.quote_source = null;
      this.quote_destination = null;
      this.quote_error = false;
      this.busy_check = false;
      if (!this.account_from) return;
      if (this.account_from.account_number === this.account.account_number) {
        this.quote_error = true;
        return;
      }
      const source = this.account_from.account_number;
      const destination = this.account.account_number;
      this.busy_check = true;
      return axios
        .post(
          window.API.POST_ACCOUNT_EXCHANGE_WITH_ANOTHER_WALLET_CHECK(
            destination,
          ),
          { account_from: source },
        )
        .then(({ data }) => {
          // A cleared or changed source must never reuse an older wallet's quote.
          if (request !== this.quote_request) return;
          const rate = Number(data.exchange_rate),
            balance = Number(data.free_balance);
          if (
            data.error ||
            !Number.isFinite(rate) ||
            rate <= 0 ||
            !Number.isFinite(balance) ||
            balance < 0 ||
            data.from !== this.account_from?.currency ||
            data.to !== this.account.currency
          ) {
            this.quote_error = true;
            if (data.error)
              NotificationService.showErrorAlert(null, data.error_msg);
            return;
          }
          this.exchange_rate = rate;
          this.free_balance = balance;
          this.currency_from = data.from;
          this.currency_to = data.to;
          this.quote_source = source;
          this.quote_destination = destination;
        })
        .catch((error) => {
          if (request !== this.quote_request) return;
          this.quote_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request === this.quote_request) this.busy_check = false;
        });
    },
    topUpWithAnotherWallet() {
      if (!this.can_transfer) return;
      this.busy_transfer = true;
      return axios
        .post(
          window.API.POST_ACCOUNT_EXCHANGE_WITH_ANOTHER_WALLET(
            this.account.account_number,
          ),
          {
            amount: this.charge_amount,
            account_from: this.account_from.account_number,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            this.amount = 0;
            this.$emit("request:refresh");
            NotificationService.showSuccessAlert(
              null,
              this.$t("account_page.deposit.modern.transferred"),
            );
            this.checkAccount();
          }
        })
        .catch((error) => NotificationService.showLaravelError(error))
        .finally(() => {
          this.busy_transfer = false;
        });
    },
  },
};
</script>
