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
  <div>
    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <v-data-table-server
      :mobile="$vuetify.display.xs"
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="transactions"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :row-props="
        (_data) => {
          return { class: 'row-hover -no-pointer' };
        }
      "
      class="bg-transparent min-height-40vh"
      density="compact"
      hide-default-footer
      item-key="id"
    >
      <template v-slot:item.gateway="{}">
        <v-img
          :src="getShopImagePath(gateway.icon)"
          class="my-1"
          height="32"
          width="32"
        ></v-img>
      </template>

      <template v-slot:item.amount="{ item }">
        <div class="min-width-100">
          <u-price :amount="item.amount" :currency="item.currency"></u-price>
          <v-chip
            v-if="item.target?.auto_charge"
            class="ma-2"
            label
            size="x-small"
            title="Auto charged by linked card."
          >
            <v-icon size="x-small" start>add_card</v-icon>
            Auto Charge
          </v-chip>
        </div>
      </template>

      <template v-slot:item.currency="{ item }">
        <u-currency-icon :currency="item.currency" flag></u-currency-icon>
      </template>

      <template v-slot:item.livemode="{ item }">
        <div class="small">
          <i
            :class="item.livemode ? 'text-success' : 'text-warning'"
            class="fas fa-circle"
          ></i>
          {{
            item.livemode
              ? $t("shop_gateway.transactions.live_mode")
              : $t("shop_gateway.transactions.test_mode")
          }}
        </div>
      </template>

      <template v-slot:item.status="{ item }">
        <u-text-value-dashed class="small">
          <template v-slot:label>
            {{ item.status }}
          </template>
          <v-icon v-if="item.status === 'Succeeded'" class="mx-1" color="green"
            >check
          </v-icon>

          <v-btn
            v-else
            :loading="busy_check === item.unique_id"
            color="primary"
            icon
            size="32"
            variant="elevated"
            @click="checkPaymentStatus(gateway.code, item, gateway.name)"
          >
            <v-icon size="20">refresh</v-icon>
          </v-btn>
        </u-text-value-dashed>
      </template>

      <template v-slot:item.target_id="{ item }">
        <small class="min-width-100">CHARGE-{{ item.target.id }}</small>
      </template>

      <template v-slot:item.risk="{ item }">
        <u-payment-risk-indicator
          v-if="item.risk > 0"
          :risk="item.risk"
          small
        ></u-payment-risk-indicator>
      </template>

      <template v-slot:item.card="{ item }">
        <div class="min-width-200 py-1">
          <u-payment-card
            :card="item.card"
            :currency="item.currency"
            :method="item.method"
            show-country
          ></u-payment-card>
        </div>
      </template>

      <template v-slot:item.issued_at="{ item }">
        <div class="min-width-200">
          <b>{{ getFromNowString(item.issued_at) }}</b
          ><br />
          <small>{{ getLocalTimeString(item.issued_at) }}</small>
        </div>
      </template>

      <template v-slot:item.payment_at="{ item }">
        <div class="min-width-200">
          <b>{{ getFromNowString(item.payment_at) }}</b
          ><br />
          <small> {{ getLocalTimeString(item.payment_at) }}</small>
        </div>
      </template>

      <template v-slot:item.action="{ item }">
        <v-btn
          v-if="item.target.completed"
          :loading="busy_download === item.target"
          color="#111"
          size="small"
          variant="elevated"
          @click="downloadSingleReceipt(item.target)"
        >
          <v-icon class="me-1" size="small">download</v-icon>
          Receipt
        </v-btn>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script lang="ts">
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import UPaymentRiskIndicator from "../../../../ui/payment/risk/indicator/UPaymentRiskIndicator.vue";
import UTextValueDashed from "../../../../ui/text/value-dashed/UTextValueDashed.vue";
import UCurrencyIcon from "../../../../ui/currency/icon/UCurrencyIcon.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import { FileHelper } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BAccountChargesList",
  mixins: [DateMixin ],
  components: {
    UCurrencyIcon,
    UTextValueDashed,
    UPaymentCard,
    UPaymentRiskIndicator,
  },
  props: {
    account: {
      require: true,
      type: Object,
    },

    gateway: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      busy_fetch: false,

      transactions: [],
      gateway_code: null,

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: null, order: "desc" }],

      headers: [
        {
          text: "",
          align: "center",
          sortable: false,
          value: "gateway",
          width: 40,
        },

        {
          text: this.$t("shop_gateway.transactions.table.amount"),
          align: "start",
          sortable: true,
          value: "amount",
        },
        {
          text: this.$t("shop_gateway.transactions.table.currency"),
          align: "center",
          sortable: true,
          value: "currency",
        },
        {
          text: this.$t("shop_gateway.transactions.table.livemode"),
          align: "center",
          sortable: true,
          value: "livemode",
        },
        {
          text: this.$t("shop_gateway.transactions.table.status"),
          align: "start",
          sortable: true,
          value: "status",
        },
        {
          text: this.$t("shop_gateway.transactions.table.target_id"),
          align: "center",
          value: "target_id",
          sortable: true,
        },
        {
          text: this.$t("shop_gateway.transactions.table.risk"),
          align: "center",
          value: "risk",
          sortable: true,
        },

        {
          text: this.$t("shop_gateway.transactions.table.card"),
          align: "center",
          value: "card",
          sortable: true,
        },

        {
          text: this.$t("shop_gateway.transactions.table.issued_at"),
          align: "start",
          value: "issued_at",
          sortable: true,
        },
        {
          text: this.$t("shop_gateway.transactions.table.payment_at"),
          align: "start",
          value: "payment_at",
          sortable: true,
        },

        {
          text: "",
          align: "center",
          value: "action",
          sortable: false,
        },
      ],

      busy_check: false,

      //----------------------------
      busy_download: null,
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
  },
  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchOrders(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    gateway() {
      this.page = 1;
      const { sortBy, page, itemsPerPage } = this.options;

      this.fetchOrders(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    },
  },
  created() {},

  methods: {
    fetchOrders(page, sortBy, sortDesc = true) {
      this.busy_fetch = true;

      axios
        .get(
          window.API.GET_ACCOUNT_CHARGES_HISTORY(
            this.account.account_number,
            this.gateway.code,
          ),
          {
            params: {
              offset: (page - 1) * this.itemsPerPage,
              limit: this.itemsPerPage,
              product_id: this.filterProductId,
              sortBy: sortBy,
              sortDesc: sortDesc,
            },
          },
        )
        .then(({ data }) => {
          this.totalItems = data.total;
          this.transactions = data.transactions;
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    //――――――――――――――――――――――― Check payment status ―――――――――――――――――――――――

    checkPaymentStatus(gateway_code, item, gateway_name) {
      this.busy_check = item.unique_id;
      axios
        .get(
          window.API.GET_CHECK_CHARGE_PAYMENT_GATEWAY(
            this.account.account_number,
            gateway_code,
            item.unique_id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            if (data.success) {
              item.status = data.transaction_status;

              NotificationService.showSuccessAlert(
                null,
                this.$t(
                  "process_center.payment_widget.notifications.pay_confirm_message",
                  {
                    payment_at: this.getLocalTimeString(data.payment_at),
                    gateway_name: gateway_name,
                  },
                ) +
                  `<br>${this.$t("global.commons.last_status")}: ${this.getName(
                    data.status,
                  )}`,
              );

              this.$emit("request:refresh");
            } else {
              NotificationService.showWarningAlert(
                this.$t(
                  "process_center.payment_widget.notifications.pay_fail_title",
                ),
                this.$t(
                  "process_center.payment_widget.notifications.pay_fail_message",
                ) +
                  `<br>${this.$t("global.commons.last_status")}: <b>${this.getName(
                    data.status,
                  )}</b><hr>${data.message}`,
              );
            }
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_check = false;
        });
    },

    downloadSingleReceipt(charge) {
      this.busy_download = charge;

      axios
        .request({
          url: window.API.GET_ACCOUNT_DOWNLOAD_SINGLE_CHARGE_RECEIPT(
            this.account.account_number,
            charge.id,
          ),
          method: "GET",
          responseType: "blob",
        })
        .then(({ data, headers }) => {
          console.log("headers", headers);

          FileHelper.DownloadBlobFile(data, headers);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_download = null;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.data-table {
  cursor: pointer;
  font-size: 1.071rem;
  font-weight: 400;
  color: #555;
  height: 68px;
}
</style>
