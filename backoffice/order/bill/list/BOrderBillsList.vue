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
  <div class="widget-box -large mb-5" v-bind="$attrs">
    <s-widget-header
      :add-caption="isSubscription ? 'Sync Bills Manually' : undefined"
      :add-loading="busy_sync"
      add-icon="sync"
      add-text
      icon="receipt_long"
      title="Order bills"
      @click:add="syncBills"
    >
      <template v-slot:actions></template>
    </s-widget-header>
    <v-list-subheader>
      <div>
        Bills are records to keep transactions for orders with multiple
        payments. ● In <b>subscription orders </b>, these bills will be
        <b>auto-settled</b> for recurring payments. ● In <b>service orders</b>,
        these bills are created by the seller and paid by the buyer
        <b>manually</b>.
      </div>
    </v-list-subheader>

    <!-- -------------- Search -------------- -->

    <v-row align="center" class="mt-2" no-gutters>
      <v-spacer></v-spacer>

      <v-text-field
        v-model="search"
        :placeholder="$t('global.commons.search')"
        bg-color="transparent"
        class="max-width-field-mini me-1"
        clearable
        flat
        hide-details
        prepend-icon="search"
        single-line
        variant="solo"
      >
      </v-text-field>
    </v-row>

    <!-- -------------- Loading -------------- -->

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>

    <!-- -------------- List -------------- -->

    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="bills"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :mobile="$vuetify.display.xs"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      class="bg-transparent min-height-60vh"
      density="compact"
      hide-default-footer
      item-key="id"
      style="width: 100%"
      @click:row="(_, r) => showDetail(r.item)"
    >
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ Empty View ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      <template v-slot:no-data>
        <div v-if="!busy_fetch && !search" class="py-5 usn text-center fadeIn">
          <v-icon class="op-0-3">emoji_nature</v-icon>
          <h2 class="text-h4 font-weight-thin">Bills...</h2>
        </div>
        <div v-else class="text-center px-3 py-5 text-muted">
          <v-icon class="me-1">sentiment_dissatisfied</v-icon>
          {{ $t("global.commons.no_data") }}
        </div>
      </template>
      <!--  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ id ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.id="{ item }">
        <div class="min-width-150 py-1 d-flex align-center">
          <v-icon class="mx-2" color="black">receipt_long</v-icon>
          <div class="flex-grow-1">
            <b>{{ $t("global.commons.bill") }} {{ item.id }}</b>
            <small
              v-if="item.payment?.payment_at"
              :title="
                $t('global.commons.payment_date') +
                ': ' +
                getLocalTimeString(item.payment.payment_at) +
                ' ● ' +
                getFromNowString(item.payment.payment_at)
              "
              class="d-block"
            >
              {{ getLocalDateString(item.payment.payment_at) }}
            </small>
            <small v-else class="d-block">Not paid yet!</small>
          </div>

          <i
            v-if="item.status === BillStatus.PENDING.code"
            class="fas fa-spinner fa-spin m-1 text-blue"
          ></i>
          <img
            v-else-if="item.payment?.gateway?.logo"
            :src="getShopImagePath(item.payment?.gateway?.logo)"
            height="20"
          />
        </div>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ price ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.price="{ item }">
        <u-price :amount="item.price" :currency="item.currency"></u-price>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ payment_id ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.payment_id="{ item }">
        <u-payment-card
          v-if="item.payment?.card"
          :card="item.payment.card"
          :currency="item.payment.currency"
          :method="item.payment.method"
          horizontal
        ></u-payment-card>
        <small v-else>No payment.</small>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ issued_id ▁▁▁▁▁▁▁▁▁▁▁ -->

      <template v-slot:item.issued_id="{ item }">
        <b-order-button
          v-if="item.issued"
          :order="item.issued"
          :order-type="item.issued.type"
          text
        >
        </b-order-button>
        <small v-else>No issued cart.</small>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ delivery_state ▁▁▁▁▁▁▁▁▁▁▁ -->
      <template v-slot:item.delivery_state="{ item }">
        <template v-if="item.issued">
          <s-order-delivery-status-stepper
            :state="item.issued.delivery_state"
            :states="getDeliveryStates(item.issued.type)"
            class="my-1"
          />

          <div
            class="py-1 small min-width-200 d-flex align-center justify-center"
          >
            <span class="text-muted">
              {{ getDeliveryStateString(item.issued.delivery_state) }}
            </span>
            <template v-if="item.receiver_info">
              <span class="dashed-flex-space"></span>
              <div class="ps-1">
                <flag
                  :iso="item.receiver_info.country"
                  :squared="false"
                  class="me-1"
                ></flag>
                <span>{{ getShortAddress(item.issued.receiver_info) }}</span>
              </div>
            </template>
          </div>
        </template>
      </template>

      <!-- ▁▁▁▁▁▁▁▁▁▁▁ created_at ▁▁▁▁▁▁▁▁▁▁▁ -->
      <template v-slot:item.created_at="{ item }">
        <div class="min-width-150">
          {{ getFromNowString(item.created_at) }}<br />
          <small>
            {{ getLocalTimeStringSmall(item.created_at) }}
          </small>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>

  <!-- ██████████████████████ Dialog > Detail ██████████████████████ -->

  <v-bottom-sheet
    v-model="dialog_detail"
    content-class="rounded-t-xl overflow-hidden"
    dark
    max-width="1280"
    scrollable
    width="98%"
  >
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">receipt_long</v-icon>
        Bill-{{ selected_bill?.id }}
        <v-spacer></v-spacer>

        <span
          v-if="selected_bill?.payment?.payment_at"
          class="small text-green ms-2"
        >
          ● Paid
          {{ getFromNowString(selected_bill.payment.payment_at) }}</span
        >
        <span v-else class="small text-red ms-2">Not paid yet!</span>
      </v-card-title>
      <v-card-text>
        <b-order-payment-row-payment
          v-if="selected_bill?.payment"
          :payment="selected_bill.payment"
          flex-mode
          has-map
        >
        </b-order-payment-row-payment>

        <div
          v-if="selected_bill?.issued"
          class="pt-3 text-start mt-5 border-top pt-5"
        >
          <v-row no-gutters>
            <b>
              <v-icon class="me-2">shopping_bag</v-icon>
              An order has been created automatically</b
            >
            <v-spacer></v-spacer>
            <b-order-button
              :order="selected_bill.issued"
              :order-type="selected_bill.issued.type"
            >
            </b-order-button>
          </v-row>

          <div class="max-w-550 mx-auto">
            <s-order-delivery-status-stepper
              :state="selected_bill.issued.delivery_state"
              :states="getDeliveryStates(selected_bill.issued.type)"
              dark
            />
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_detail = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>

<script>
import UPaymentCard from "../../../../ui/payment/card/UPaymentCard.vue";
import BOrderButton from "../../../order/button/BOrderButton.vue";
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BOrderPaymentRowPayment from "../../../order/payment/row/payment/BOrderPaymentRowPayment.vue";
import _ from "lodash-es";
import { Bill } from "@selldone/core-js";

export default {
  name: "BOrderBillsList",
  components: {
    BOrderPaymentRowPayment,
    SOrderDeliveryStatusStepper,
    BOrderButton,
    UPaymentCard,
  },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {
      BillStatus: Bill.Status,

      busy_fetch: false,

      bills: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},
      sortBy: [{ key: null, order: "desc" }],

      search: null,
      segments_filter: [],

      //---------------------------
      selected_customer: null,
      show_set_ships: null,
      chips: 0,
      busy_set_chips: false,

      //---------------------------
      busy_set_club: false,
      show_set_club: false,
      level: null,

      //---------------------------
      show_import: false,
      show_import_pre: false,

      //---------------------------
      show_add: false,
      dialog_pre: false,

      //---------------------------
      show_segments_dialog: false,
      busy_set_segments: false,

      //---------------------------
      busy_access: null,

      //---------------------------
      busy_sync: false,

      //---------------------------
      dialog_detail: false,
      selected_bill: null,
    };
  },
  computed: {
    isService() {
      return this.product?.type === ProductType.SERVICE.code;
    },
    isSubscription() {
      return this.product?.type === ProductType.SUBSCRIPTION.code;
    },

    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },
    headers() {
      return [
        {
          title: "Bill",
          align: "start",
          sortable: true,
          value: "id",
        },
        {
          title: "Amount",
          align: "start",
          sortable: true,
          value: "price",
        },

        {
          title: "Payment",
          align: "start",
          sortable: true,
          value: "payment_id",
        },

        {
          title: "Issued Order",
          align: "center",
          value: "issued_id",
          sortable: true,
        },
        {
          title: "Issued Status",
          align: "center",
          value: "delivery_state",
          sortable: false,
        },

        {
          title: this.$t("global.sort.created_at"),
          align: "start",
          sortable: true,
          value: "created_at",
        },
      ];
    },
  },
  watch: {
    // Pagination:
    options: {
      handler() {
        const { sortBy, page, itemsPerPage } = this.options;
        this.fetchBills(page, sortBy[0]?.key, sortBy[0]?.order === "desc");
      },
      deep: true,
    },

    search: _.throttle(function (newVal, oldVal) {
      const { sortBy, page, itemsPerPage } = this.options;
      this.fetchBills(1, sortBy[0]?.key, sortBy[0]?.order === "desc");
    }, window.SERACH_THROTTLE),
  },
  created() {},

  methods: {
    fetchBills(page, sortBy, sortDesc = true) {
      this.page = page;

      this.busy_fetch = true;

      axios
        .get(window.API.GET_BASKET_BILLS(this.shop.id, this.basket.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,

            search: this.search,
            segments: this.segments_filter,
          },
        })
        .then(({ data }) => {
          this.totalItems = data.total;
          this.bills = data.bills;
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    getShortAddress(receiver_info) {
      if (receiver_info.state && receiver_info.city)
        return `${receiver_info.state} > ${receiver_info.city}`;
      else if (receiver_info.city) return receiver_info.city;
      else receiver_info.state;
    },

    getDeliveryStates(type) {
      return ProductType[type]?.delivery_states;
    },

    syncBills() {
      this.busy_sync = true;

      axios
        .post(
          window.API.POST_BASKET_SUBSCRIPTION_BILLS_SYNC_MANUALLY(
            this.shop.id,
            this.basket.id,
          ),
        )
        .then(({ data }) => {
          if (data.error) {
            return this.showErrorAlert(null, data.error_msg);
          }
          const { sortBy, page, itemsPerPage } = this.options;
          this.fetchBills(page, sortBy[0]?.key, sortBy[0]?.order === "desc");

          // Needs basket update:
          if (data.update_basket) this.$emit("fetch-order");
          // Show detail message:
          this.showSuccessAlert("Sync bills", data.message, "sync", 8000);
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_sync = false;
        });
    },

    showDetail(bill) {
      this.selected_bill = bill;
      this.dialog_detail = true;
    },
  },
};
</script>

<style lang="scss" scoped></style>
