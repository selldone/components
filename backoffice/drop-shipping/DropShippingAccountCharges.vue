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
  <div class="widget-box -large s-table-loading">
    <u-widget-header icon="paid" title="Wallet top-ups"></u-widget-header>
    <v-list-subheader>
      This is the list of all transactions between you and the wholesaler in this wallet.
    </v-list-subheader>
    <b-list-loading-state v-if="busy_fetch && charges?.length" kind="payment" compact class="sd-modern-list-refresh" />
    <v-data-table-server
      :aria-busy="busy_fetch"
      :loading="busy_fetch"
        :mobile="$vuetify.display.xs"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="charges"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :row-props="
        (_data) => {
          return {
            class: 'row-hover -no-pointer',
          };
        }
      "
      class="bg-transparent min-height-40vh"
      hide-default-footer
      item-key="id"
      style="width: 100%"
    >
      <template v-if="!charges?.length" #loading>
        <b-list-loading-state kind="payment" />
      </template>

      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data><b-list-empty-state v-if="emptyStateLoaded && !busy_fetch" kind="payment" :title="(totalItems) > 0 ? $t('dashboard_empty_state.empty_page.title') : ($t('dashboard_empty_state.context.topups.title'))" :description="(totalItems) > 0 ? $t('dashboard_empty_state.empty_page.description') : ($t('dashboard_empty_state.context.topups.description'))" /></template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <template v-slot:item.price="{ item }">
        <u-price
          :amount="item.price"
          :currency="item.currency"
          medium
        ></u-price>
      </template>

      <template v-slot:item.completed="{ item }">
        <u-check v-if="item.completed" :model-value="item.completed" read-only></u-check>
        <v-btn
          v-else
          :loading="busy_refresh === item.id"
          icon variant="text"
          @click="refreshState(item)"
        >
          <v-icon>refresh</v-icon>
        </v-btn>
      </template>

      <template v-slot:item.created_at="{ item }">
        <b class="d-block">{{ getFromNowString(item.created_at) }}</b>
        <small>{{ getLocalTimeString(item.created_at) }}</small>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import BListEmptyState from "@selldone/components-vue/backoffice/empty-state/BListEmptyState.vue";
import BListLoadingState from "@selldone/components-vue/backoffice/loading-state/BListLoadingState.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "DropShippingAccountCharges",
  mixins: [DateMixin ],
  components: {
    BListLoadingState,
    BListEmptyState,},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    account: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    busy_fetch: false,
    emptyStateLoaded: false,
    emptyStateRequest: 0,

    charges: [],

    // Pagination:
    page: 1,
    itemsPerPage: 10,
    totalItems: 0,
    options: {},
    sortBy: [{ key: null, order: "desc" }],

    //-------------------------------
    busy_refresh: null,
  }),

  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    headers() {
      return [
        {
          title: this.$t("global.sort.amount"),
          align: "start",
          sortable: true,
          value: "price",
        },
        {
          title: this.$t("global.sort.status"),
          align: "center",
          sortable: true,
          value: "completed",
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
        this.fetchResellerAccountCharges(
          page,
          sortBy[0]?.key,
          sortBy[0]?.order === "desc",
        );
      },
      deep: true,
    },
  },

  methods: {
    fetchResellerAccountCharges(page, sortBy, sortDesc = true) {
      const emptyRequest = ++this.emptyStateRequest;
      this.page = page;

      this.busy_fetch = true;
      this.emptyStateLoaded = false;

      axios
        .get(
          window.API.GET_DROP_SHIPPING_RESELLER_ACCOUNT_CHARGES(
            this.shop.id,
            this.account.id,
          ),
          {
            params: {
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              sortBy: sortBy,
              sortDesc: sortDesc,
            },
          },
        )
        .then(({ data }) => {
          if (emptyRequest !== this.emptyStateRequest) return;
          this.totalItems = data.total;
          this.charges = data.charges;
          this.emptyStateLoaded = Array.isArray(data.charges);
        })
        .catch((error) => {
          if (emptyRequest !== this.emptyStateRequest) return;
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          if (emptyRequest !== this.emptyStateRequest) return;
          this.busy_fetch = false;
        });
    },

    refreshState(charge) {
      this.busy_refresh = charge.id;
      axios
        .post(
          window.API.POST_DROP_SHIPPING_RESELLER_ACCOUNT_CHARGE_REFRESH_STATE(
            this.shop.id,
            this.account.id,
            charge.id,
          ),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(this.charges, data.charge);

            if (data.success) {
              NotificationService.showSuccessAlert(
                null,
                this.$t("dropship_charges.notifications.pay_confirm_message", {
                  payment_at: this.getLocalTimeString(data.payment_at),
                }) +
                  `<br>${this.$t("global.commons.last_status")}: ${this.getName(
                    data.status,
                  )}`,
              );

              charge.completed = data.charge.completed;
              this.$emit("onSuccessCompletedChargePayment", data.charge);
            } else {
              NotificationService.showWarningAlert(
                this.$t("dropship_charges.notifications.pay_fail_title"),
                this.$t("dropship_charges.notifications.pay_fail_message") +
                  `<br>${this.$t("global.commons.last_status")}: ${this.getName(
                    data.status,
                  )}`,
              );
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .finally(() => {
          this.busy_refresh = null;
        });
    },
  },
};
</script>

<style scoped></style>
