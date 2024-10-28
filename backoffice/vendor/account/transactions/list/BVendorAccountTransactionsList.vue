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
  <v-container class="overflow-hidden" fluid>
    <!-- █████████████████████ List of payments █████████████████████ -->

    <div class="widget-box -large">
      <u-widget-header
        :title="`${account.currency} ${$t('global.commons.transactions')}`"
        icon="wallet"
      ></u-widget-header>
      <v-list-subheader>
        {{ $t("vendor_account_transactions.subtitle") }}
      </v-list-subheader>

      <u-loading-progress v-if="busy_fetch"></u-loading-progress>

      <v-row align="center" no-gutters>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          :label="$t('global.commons.search')"
          class="max-width-field"
          clearable
          hide-details
          prepend-inner-icon="search"
          single-line
          variant="plain"
        ></v-text-field>
      </v-row>

      <v-data-table-server
        v-model:options="options"
        v-model:page="page"
        v-model:sort-by="sortBy"
        :header-props="{ sortByText: $t('global.commons.sort_by') }"
        :headers="headers"
        :items="transactions"
        :items-length="totalItems"
        :items-per-page="itemsPerPage"
        :loading-text="$t('global.commons.waiting_load_data')"
        :mobile="$vuetify.display.xs"
        class="bg-transparent min-height-60vh"
        density="compact"
        hide-default-footer
        item-key="id"
      >
        <template v-slot:item.amount="{ item }">
          <u-price :amount="item.amount" :currency="item.currency"></u-price>
          <div v-if="item.source === 'ORDER'" class="small">
            {{
              item.amount > 0
                ? `🟨 ${$t("global.commons.marketplace")} -> 🟪 ${$t("global.commons.wallet")}`
                : `🟪 ${$t("global.commons.wallet")} -> 🟨 ${$t("global.commons.marketplace")}`
            }}
          </div>
          <div v-else-if="item.source === 'PAYOUT'" class="small">
            {{
              item.amount > 0
                ? `🟥 ${$t("vendor_account_transactions.vendor_bank")} -> 🟪 ${$t("global.commons.wallet")}`
                : `🟪 ${$t("global.commons.wallet")} -> 🟥 ${$t("vendor_account_transactions.vendor_bank")}`
            }}
          </div>
        </template>

        <template v-slot:item.source="{ item }">
          <v-icon :title="item.source" class="me-1"
            >{{ item.source === "ORDER" ? "shopping_bag" : "account_balance" }}
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
        <template v-slot:item.officer_id="{ item }">
          <div v-if="item.officer" class="pa-1 d-flex align-center">
            <v-avatar
              class="me-2 flex-grow-0 avatar-gradient -thin -user"
              color="#fff"
              size="32"
            >
              <v-img :src="getUserAvatar(item.officer_id)" />
            </v-avatar>

            <b class="flex-grow-1">{{ item.officer.name }}</b>
          </div>
          <small v-else>System</small>
        </template>

        <template v-slot:item.note="{ item }">
          <div v-if="item.note" :title="item.note" class="max-w-250 small">
            {{ item.note ? item.note.limitWords(10) : "" }}
          </div>
        </template>

        <template v-slot:item.created_at="{ item }">
          <div class="min-width-200 py-1">
            {{ getFromNowString(item.created_at) }}<br />
            <small>
              {{ getLocalTimeString(item.created_at) }}
            </small>
          </div>
        </template>

        <template v-slot:bottom>
          <v-pagination v-model="page" :length="pageCount" rounded />
        </template>
      </v-data-table-server>

      <b-vendor-payout-pods
        :shop="shop"
        highlight-transactions
      ></b-vendor-payout-pods>
    </div>
  </v-container>
</template>
<script>
import BVendorPayoutPods from "../../../../vendor/payout/pods/BVendorPayoutPods.vue";
import _ from "lodash-es";

export default {
  name: "BVendorAccountTransactionsList",
  components: { BVendorPayoutPods },

  props: {
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

    transactions: [],

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    search: null,

    //-----------------------
    busy_set: null,

    //----------------------
    dialog: false,
    selected_payment: null,
    busy_verify: false,
    verify: false,
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
      ];
    },
  },

  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchRequests(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: _.throttle(function (newVal, oldVal) {
      // console.log("this.options", this.options);
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchRequests(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }, window.SERACH_THROTTLE),

    account(account) {
      this.transactions = [];
      if (account) {
        const { sortBy, page, itemsPerPage } = this.options;
        this.page = 1;
        this.fetchRequests(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
      }
    },
  },

  created() {},

  methods: {
    fetchRequests(page = 0, sortBy = null, sortDesc = true) {
      this.busy_fetch = true;

      axios
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
          if (!data.error) {
            this.transactions = data.transactions;
            this.totalItems = data.total;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
