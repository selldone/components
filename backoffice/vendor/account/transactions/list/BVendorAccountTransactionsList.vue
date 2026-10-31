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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-container
    class="text-start"
    :class="modern ? 'b-vendor-transactions' : 'overflow-hidden'"
    fluid
  >
    <!-- █████████████████████ List of payments █████████████████████ -->

    <div
      :class="
        modern
          ? 'sd-modern-content b-vendor-transactions__content'
          : 'widget-box -large'
      "
    >
      <u-widget-header
        v-if="!modern"
        :title="`${account.currency} ${$t('global.commons.transactions')}`"
        icon="wallet"
      ></u-widget-header>
      <v-list-subheader v-if="!modern">
        {{ $t("vendor_account_transactions.subtitle") }}
      </v-list-subheader>

      <header v-if="modern" class="b-vendor-transactions__heading">
        <div>
          <h2>
            {{
              $t("marketplace_wallets.transactions.title", {
                currency: account.currency,
              })
            }}
          </h2>
          <p>{{ $t("marketplace_wallets.transactions.subtitle") }}</p>
        </div>
        <div class="b-vendor-transactions__balance">
          <div class="b-vendor-transactions__balance-label">
            <u-currency-icon :currency="account.currency" flag-only />
            <span>{{ $t("marketplace_wallets.transactions.balance") }}</span>
            <v-btn class="sd-modern-icon-button sd-modern-info-button" icon variant="text" :aria-label="$t('marketplace_wallets.transactions.balance_help')">
              <v-icon aria-hidden="true">info_outline</v-icon>
              <v-tooltip activator="parent" location="top" open-on-focus open-on-click content-class="sd-modern-tooltip text-start">{{ $t('marketplace_wallets.transactions.balance_help') }}</v-tooltip>
            </v-btn>
          </div>
          <u-price :amount="account.balance" :currency="account.currency" />
        </div>
      </header>

      <section
        class="s-table-loading"
        :class="{ 'sd-modern-widget b-vendor-transactions__list': modern }"
        :aria-busy="busy_fetch"
      >
        <u-loading-progress v-if="busy_fetch"></u-loading-progress>

        <div
          :class="
            modern
              ? 'sd-modern-list-toolbar b-vendor-transactions__toolbar'
              : 'd-flex align-center'
          "
        >
          <div v-if="modern" class="b-vendor-transactions__count">
            <span>{{ $t('marketplace_wallets.transactions.all_transactions') }}</span>
            <span>{{ totalItems }}</span>
          </div>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            :placeholder="
              $t(
                modern
                  ? 'marketplace_wallets.transactions.search_placeholder'
                  : 'global.commons.search',
              )
            "
            :aria-label="
              $t(
                modern
                  ? 'marketplace_wallets.transactions.search_help'
                  : 'global.commons.search',
              )
            "
            :class="
              modern ? 'b-vendor-transactions__search' : 'max-width-field'
            "
            clearable
            hide-details
            prepend-inner-icon="search"
            single-line
            variant="plain"
          ></v-text-field>
          <u-smart-menu
            v-if="modern"
            modern
            icon="sort"
            :title="$t('marketplace_wallets.transactions.sort')"
            :items="sortItems"
          />
        </div>

        <div
          v-if="modern && fetch_error"
          class="sd-modern-notice b-vendor-transactions__error"
          role="alert"
        >
          <v-icon aria-hidden="true" size="18">error_outline</v-icon>
          <span class="sd-modern-notice__content">{{ $t("marketplace_wallets.transactions.load_error") }}</span>
          <v-btn
            class="sd-modern-button sd-modern-button--compact"
            variant="text"
            :loading="busy_fetch"
            @click="fetchRequests()"
          >
            <v-icon start aria-hidden="true">refresh</v-icon>
            {{ $t("marketplace_wallets.transactions.retry") }}
          </v-btn>
        </div>

        <v-data-table-server
          v-model:page="page"
          v-model:sort-by="sortBy"
          :header-props="{ sortByText: $t('global.commons.sort_by') }"
          :headers="headers"
          :items="transactions"
          :items-length="totalItems"
          :items-per-page="itemsPerPage"
          :loading-text="$t('global.commons.waiting_load_data')"
          :mobile="modern ? $vuetify.display.width < 760 : $vuetify.display.xs"
          :loading="busy_fetch"
          :class="
            modern
              ? 'sd-modern-data-table b-vendor-transactions__table'
              : 'bg-transparent min-height-60vh'
          "
          density="compact"
          hide-default-footer
          item-value="id"
        >
          <template v-slot:item.amount="{ item }">
            <div :class="{ 'b-vendor-transactions__amount': modern }">
              <u-price
                :amount="item.amount"
                :currency="item.currency"
              ></u-price>
            </div>
            <div
              v-if="modern && transactionDirection(item)"
              class="b-vendor-transactions__direction"
            >
              {{ transactionDirection(item) }}
            </div>
            <div v-else-if="!modern && item.source === 'ORDER'" class="small">
              {{
                item.amount > 0
                  ? `🟨 ${$t("global.commons.marketplace")} -> 🟪 ${$t("global.commons.wallet")}`
                  : `🟪 ${$t("global.commons.wallet")} -> 🟨 ${$t("global.commons.marketplace")}`
              }}
            </div>
            <div v-else-if="!modern && item.source === 'PAYOUT'" class="small">
              {{
                item.amount > 0
                  ? `🟥 ${$t("vendor_account_transactions.vendor_bank")} -> 🟪 ${$t("global.commons.wallet")}`
                  : `🟪 ${$t("global.commons.wallet")} -> 🟥 ${$t("vendor_account_transactions.vendor_bank")}`
              }}
            </div>
          </template>

          <template v-slot:item.source="{ item }">
            <div v-if="modern" class="b-vendor-transactions__source">
              <v-icon size="17" aria-hidden="true">{{
                item.source === "ORDER"
                  ? "shopping_bag"
                  : item.source === "PAYOUT"
                    ? "account_balance"
                    : "swap_horiz"
              }}</v-icon>
              <span>{{ transactionSource(item) }}</span>
            </div>
            <template v-else>
              <v-icon :title="item.source" class="me-1"
                >{{
                  item.source === "ORDER" ? "shopping_bag" : "account_balance"
                }}
              </v-icon>
              <span v-if="item.source === 'ORDER'">{{
                item.amount > 0
                  ? $t("vendor_account_transactions.order_fee")
                  : $t("vendor_account_transactions.order_refund")
              }}</span>
              <span v-else-if="item.source === 'PAYOUT'">{{
                item.amount > 0
                  ? $t("vendor_account_transactions.reverse_fund")
                  : $t("vendor_account_transactions.payout")
              }}</span>
            </template>
          </template>
          <template v-slot:item.officer_id="{ item }">
            <div
              v-if="item.officer"
              class="d-flex align-center"
              :class="modern ? 'b-vendor-transactions__officer' : 'pa-1'"
            >
              <v-avatar
                class="me-2 flex-grow-0 avatar-gradient -thin -user"
                color="#fff"
                size="32"
              >
                <v-img :src="getUserAvatar(item.officer_id)" />
              </v-avatar>

              <span
                class="flex-grow-1"
                :class="{ 'font-weight-bold': !modern }"
                >{{ item.officer.name }}</span
              >
            </div>
            <span v-else-if="modern">{{ $t("global.commons.system") }}</span>
            <small v-else>System</small>
          </template>

          <template v-slot:item.note="{ item }">
            <template v-if="modern">
              <details v-if="item.note?.length > 80" class="b-vendor-transactions__note-disclosure">
                <summary>
                  <span class="b-vendor-transactions__note b-vendor-transactions__note-preview" dir="auto">{{ item.note }}</span>
                  <span class="b-vendor-transactions__note-more">
                    <span class="b-vendor-transactions__note-show">{{ $t('marketplace_wallets.transactions.show_note') }}</span>
                    <span class="b-vendor-transactions__note-hide">{{ $t('marketplace_wallets.transactions.hide_note') }}</span>
                  </span>
                </summary>
              </details>
              <div v-else class="b-vendor-transactions__note" dir="auto">{{ item.note || "—" }}</div>
            </template>
            <div
              v-else-if="item.note"
              :title="item.note"
              class="max-w-250 small"
            >
              {{ item.note ? item.note.limitWords(10) : "" }}
            </div>
          </template>

          <template v-slot:item.created_at="{ item }">
            <div
              :class="
                modern ? 'b-vendor-transactions__date' : 'min-width-200 py-1'
              "
            >
              {{ getFromNowString(item.created_at) }}<br />
              <small
                ><bdi>
                  {{ getLocalTimeString(item.created_at) }}
                </bdi></small
              >
            </div>
          </template>

          <template v-if="modern" #no-data>
            <div
              v-if="!fetch_error && !busy_fetch"
              class="sd-modern-empty-state b-vendor-transactions__empty"
              role="status"
            >
              <v-icon size="26" aria-hidden="true">search_off</v-icon>
              <h3>{{ $t(search ? 'marketplace_wallets.transactions.no_results_title' : 'marketplace_wallets.transactions.empty_title') }}</h3>
              <p>{{ $t(search ? 'marketplace_wallets.transactions.no_results_help' : 'marketplace_wallets.transactions.empty_help') }}</p>
              <v-btn v-if="search" class="sd-modern-button sd-modern-button--inline" variant="text" color="primary" @click="search = null">{{ $t('marketplace_wallets.transactions.clear_search') }}</v-btn>
            </div>
          </template>

          <template v-slot:bottom>
            <div :class="{ 'sd-modern-table-footer b-vendor-transactions__footer': modern }">
              <span v-if="modern" aria-live="polite">{{
                $t("marketplace_wallets.transactions.showing", {
                  start: totalItems ? (page - 1) * itemsPerPage + 1 : 0,
                  end: Math.min(page * itemsPerPage, totalItems),
                  total: totalItems,
                })
              }}</span>
              <v-pagination
                v-model="page"
                :length="pageCount"
                :class="{ 'sd-modern-pagination': modern }"
                :total-visible="5"
                rounded
              />
            </div>
          </template>
        </v-data-table-server>
      </section>

      <b-vendor-payout-pods
        v-if="!modern"
        :shop="shop"
        :vendor="account?.vendor"
        active-stage="wallet"
        modern
      ></b-vendor-payout-pods>
      <details v-else class="b-vendor-transactions__flow">
        <summary>
          <span><v-icon size="17" aria-hidden="true">help_outline</v-icon>{{ $t("vendor_money_flow.title") }}</span>
          <v-icon size="16" aria-hidden="true">expand_more</v-icon>
        </summary>
        <b-vendor-payout-pods :shop="shop" :vendor="account?.vendor" active-stage="wallet" modern />
      </details>
    </div>
  </v-container>
</template>
<script lang="ts">
import BVendorPayoutPods from "../../../../vendor/payout/pods/BVendorPayoutPods.vue";
import { throttle } from "lodash-es";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import USmartMenu from "../../../../../ui/smart/menu/USmartMenu.vue";
import UCurrencyIcon from "../../../../../ui/currency/icon/UCurrencyIcon.vue";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BVendorAccountTransactionsList",
  mixins: [DateMixin],
  components: { BVendorPayoutPods, USmartMenu, UCurrencyIcon },

  props: {
    modern: { type: Boolean, default: false },
    shop: {
      require: true,
      type: Object,
    },
    account: {
      require: true,
      type: Object,
    },
  },

  data: () => ({
    busy_fetch: false,
    fetch_error: false,
    request_id: 0,

    transactions: [],

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    sortBy: [{ key: null, order: "desc" }],

    search: null,
  }),
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    headers() {
      return [
        {
          title: this.$t("global.commons.amount"),
          align: "start",
          value: "amount",
          sortable: true,
        },
        {
          title: this.$t("global.commons.source"),
          align: "start",
          value: "source",
          sortable: true,
        },

        {
          title: this.$t("global.commons.officer"),
          align: "start",
          value: "officer_id",
          sortable: true,
        },

        {
          title: this.$t("global.commons.note"),
          align: "start",
          value: "note",
          sortable: true,
        },

        {
          title: this.$t("global.sort.created_at"),
          align: "start",
          value: "created_at",
          sortable: true,
        },
      ].map((header, index) => ({
        ...header,
        ...(this.modern
          ? { width: ["18%", "18%", "15%", "27%", "22%"][index] }
          : {}),
      }));
    },
    sortItems() {
      return [
        ...this.headers.map((header) => ({
          title: header.title,
          icon: this.sortBy[0]?.key === header.value ? "check" : "sort",
          click: () => {
            this.sortBy = [
              { key: header.value, order: this.sortBy[0]?.order || "desc" },
            ];
          },
        })),
        {
          title: this.$t(
            this.sortBy[0]?.order === "asc"
              ? "marketplace_wallets.transactions.descending"
              : "marketplace_wallets.transactions.ascending",
          ),
          icon: this.sortBy[0]?.order === "asc" ? "south" : "north",
          click: () => {
            this.sortBy = [
              {
                key: this.sortBy[0]?.key || "created_at",
                order: this.sortBy[0]?.order === "asc" ? "desc" : "asc",
              },
            ];
          },
        },
      ];
    },
  },

  watch: {
    page() {
      this.fetchRequests();
    },
    sortBy() {
      this.fetchRequests();
    },

    search: throttle(function () {
      if (this.page !== 1) this.page = 1;
      else this.fetchRequests();
    }, window.SERACH_THROTTLE),

    account() {
      this.request_id++;
      this.transactions = [];
      this.totalItems = 0;
      if (this.page !== 1) this.page = 1;
      else this.fetchRequests();
    },
  },

  created() {
    this.fetchRequests();
  },

  beforeUnmount() {
    this.request_id++;
  },

  methods: {
    transactionDirection(item) {
      const direction =
        item.source === "ORDER"
          ? item.amount > 0
            ? "marketplace_to_wallet"
            : "wallet_to_marketplace"
          : item.source === "PAYOUT"
            ? item.amount > 0
              ? "bank_to_wallet"
              : "wallet_to_bank"
            : null;
      return direction
        ? this.$t("marketplace_wallets.transactions." + direction)
        : "";
    },
    transactionSource(item) {
      const source =
        item.source === "ORDER"
          ? item.amount > 0
            ? "order_fee"
            : "order_refund"
          : item.source === "PAYOUT"
            ? item.amount > 0
              ? "reverse_fund"
              : "payout"
            : null;
      return source
        ? this.$t("vendor_account_transactions." + source)
        : item.source ||
            this.$t("marketplace_wallets.transactions.unknown_source");
    },
    fetchRequests(
      page = this.page,
      sortBy = this.sortBy[0]?.key,
      sortDesc = this.sortBy[0]?.order === "desc",
    ) {
      // A late response for the previous wallet must not replace the active wallet's ledger.
      const request_id = ++this.request_id;
      if (!this.account?.id) {
        this.busy_fetch = false;
        return;
      }
      this.busy_fetch = true;
      this.fetch_error = false;

      return axios
        .get(
          window.API.GET_SHOP_VENDOR_ACCOUNT_TRANSACTIONS(
            this.shop.id,
            this.account.id,
          ),
          {
            params: {
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: sortBy,
              sortDesc: sortDesc,

              search: this.search,
            },
          },
        )
        .then(({ data }) => {
          if (request_id !== this.request_id) return;
          if (!data.error) {
            this.transactions = data.transactions;
            this.totalItems = data.total;
          } else {
            this.fetch_error = true;
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          if (request_id !== this.request_id) return;
          this.fetch_error = true;
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (request_id === this.request_id) this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-vendor-transactions {
  padding: 28px 24px 32px;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;

  &__content { min-width: 0; width: 100%; max-width: 1040px; margin-inline: auto; }
  &__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; margin-block-end: 22px; }
  &__heading h2 { margin: 0; font-family: inherit; font-size: 16px; font-weight: 500; line-height: 24px; letter-spacing: 0; }
  &__heading p { max-width: 550px; margin: 5px 0 0; color: var(--sd-modern-muted); font-size: 14px; line-height: 22px; }
  &__balance { display: flex; flex-direction: column; gap: 4px; text-align: end; flex-shrink: 0; }
  &__balance-label { display: flex; align-items: center; justify-content: flex-end; gap: 6px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__balance-label :deep(img) { width: 18px; }
  &__balance :deep(.u--price) { font-size: 26px; font-weight: 500; line-height: 34px; }
  &__list { padding: 0 20px; border: 0; border-radius: 16px; box-shadow: none; }
  &__toolbar { gap: 12px; min-height: 70px; padding-block: 16px; }
  &__count { display: flex; align-items: center; gap: 8px; font-size: 13px; line-height: 20px; white-space: nowrap; > span:last-child { color: var(--sd-modern-muted); } }
  &__search { max-width: 230px; }
  &__error { margin-block: 16px; }
  &__table {
    --sd-modern-table-font-size: 14px;
    --sd-modern-table-line-height: 22px;
    :deep(.v-table__wrapper) { overflow: visible; }
    :deep(.v-table__wrapper > table) { table-layout: fixed; }
    :deep(.v-table__wrapper > table > tbody > tr > td) { height: auto; padding: 16px 12px !important; vertical-align: top; overflow-wrap: anywhere; }
    :deep(.v-table__wrapper > table > thead > tr > th) { padding: 15px 12px !important; }
  }
  &__amount { font-weight: 400; font-variant-numeric: tabular-nums; }
  &__amount :deep(.u--price) { font-size: 14px; font-weight: 400; line-height: 22px; }
  &__direction { margin-block-start: 4px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; }
  &__source { display: flex; align-items: flex-start; gap: 8px; .v-icon { margin-block-start: 3px; flex-shrink: 0; color: var(--sd-modern-muted); } }
  &__officer { gap: 0; .v-avatar { flex-shrink: 0; } }
  &__note { white-space: pre-line; overflow-wrap: anywhere; font-size: 13px; line-height: 20px; }
  &__note-preview { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  &__note-disclosure {
    summary { list-style: none; cursor: pointer; &::-webkit-details-marker { display: none; } }
    summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 4px; }
    &[open] .b-vendor-transactions__note-preview { display: block; -webkit-line-clamp: unset; }
    .b-vendor-transactions__note-hide { display: none; }
    &[open] .b-vendor-transactions__note-show { display: none; }
    &[open] .b-vendor-transactions__note-hide { display: inline; }
  }
  &__note-more { display: inline-flex; align-items: center; min-height: 28px; padding-inline: 4px; margin-inline-start: -4px; font-size: 13px; line-height: 20px; color: rgb(var(--v-theme-primary)); }
  &__date { font-size: 13px; line-height: 20px; small { display: inline-block; margin-block-start: 3px; color: var(--sd-modern-muted); font-size: 13px; line-height: 20px; } }
  &__footer { padding: 13px 12px; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  &__empty { padding: 44px 20px; h3 { margin: 12px 0 6px; font-size: 16px; font-weight: 500; line-height: 24px; } p { margin: 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); } > .v-btn { margin-block-start: 16px; } }
  &__flow { margin-block-start: 18px; min-width: 0;
    summary { display: flex; align-items: center; justify-content: space-between; gap: 9px; min-height: 44px; padding: 12px 4px; list-style: none; cursor: pointer; font-size: 13px; line-height: 20px; > span { display: flex; align-items: center; gap: 9px; } &::-webkit-details-marker { display: none; } }
    summary:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; border-radius: 7px; }
    &[open] > summary > .v-icon { transform: rotate(180deg); }
  }
}

@media (max-width: 759px) {
  .b-vendor-transactions {
    padding-inline: 18px;
    &__list { padding-inline: 12px; }
    &__table :deep(table), &__table :deep(tbody) { display: block; width: 100%; min-width: 0; }
    &__table :deep(thead) { display: none; }
    &__table :deep(.v-data-table__tr--mobile) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px 18px; padding: 18px 12px; border-block-end: 1px solid var(--sd-modern-border); }
    &__table :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td) { display: flex; flex-direction: column; align-items: stretch; gap: 5px; width: auto !important; max-width: 100%; min-width: 0; height: auto; padding: 0 !important; border: 0; }
    &__table :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td:first-child) { padding-block-start: 0 !important; }
    &__table :deep(.v-table__wrapper > table > tbody > .v-data-table__tr--mobile > td:last-child) { padding-block-end: 0 !important; }
    &__table :deep(.v-data-table__tr--mobile > td:nth-child(4)) { grid-column: 1 / -1; grid-row: 3; }
    &__table :deep(.v-data-table__td-title), &__table :deep(.v-data-table__td-value) { width: 100%; max-width: 100%; min-width: 0; text-align: start; white-space: normal; overflow-wrap: anywhere; }
    &__table :deep(.v-data-table__tr--mobile:last-child) { border-block-end: 0; }
  }
}
@media (max-width: 620px) {
  .b-vendor-transactions {
    padding: 22px 12px 28px;
    &__heading { flex-direction: column; gap: 18px; padding-inline: 4px; }
    &__balance { text-align: start; }
    &__balance-label { justify-content: flex-start; }
    &__toolbar { flex-wrap: wrap; gap: 10px; padding-block: 12px; > .v-spacer { display: none; } }
    &__count { flex: 1 1 100%; padding-inline: 4px; margin-block-end: 3px; }
    &__search { flex: 1; max-width: none; min-width: 0; }
    &__search :deep(input) { font-size: 16px; }
    &__note-more { min-height: 44px; }
  }
}
@media (pointer: coarse) { .b-vendor-transactions__note-more { min-height: 44px; } }
</style>
