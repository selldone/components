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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="widget-box -large">
    <s-order-statuses-select
      v-model="status"
      class="mt-4 mb-2 px-2"
      has-cod
      has-reserved
      @change="
        fetchOrders(
          1,
          options.sortBy?.[0]?.key,
          options.sortBy?.[0]?.order === 'desc',
        )
      "
    ></s-order-statuses-select>

    <u-loading-progress v-if="busy_fetch"></u-loading-progress>
    <v-data-table-server
      v-model:options="options"
      v-model:page="page"
      :header-props="{ sortByText: $t('global.commons.sort_by') }"
      :headers="headers"
      :items="orders"
      :items-length="totalItems"
      :items-per-page="itemsPerPage"
      :row-props="
        (_data) => {
          return { class: 'row-hover' };
        }
      "
      :sort-by="[{ key: null, order: 'desc' }]"
      class="bg-transparent"
      density="compact"
      hide-default-footer
      item-key="id"
      style="width: 100%"
      @click:row="(_, r) => $emit('select', r.item)"
    >
      <template v-slot:loading>
        <u-loading-ellipsis css-mode light></u-loading-ellipsis>
      </template>

      <template v-slot:item.type="{}">
        <v-img :aspect-ratio="1" :height="32" :src="type.basket" :width="32" />
      </template>

      <template v-slot:item.id="{ item }">
        <p class="m-0 font-weight-bold">
          {{ type.basket_code }}-{{ item.id }}

          <i
            v-if="
              inQueProcess(item.delivery_state) && !item.reject && !item.done
            "
            class="fas fa-circle-notch fa-spin text-info"
          ></i>
          <v-icon v-if="item.done" color="success">check</v-icon>
        </p>

        <span v-if="item.reject" class="text-danger font-weight-bold">
          {{ $t("admin_shop.orders.physical.rejected") }}

          <i class="fas fa-exclamation"></i
        ></span>
      </template>

      <template v-slot:item.price="{ item }">
        <u-price
          :amount="item.price"
          :currency="item.currency"
          title="Payment"
        >
        </u-price>

        <small v-if="item.discount" class="d-block">
          {{ $t("admin_shop.orders.physical.discount") }}:

          <u-price :amount="item.discount" :currency="item.currency">
          </u-price>
        </small>

        <small class="d-block">
          {{ $t("admin_shop.orders.physical.delivery") }}
          :

          <span v-if="item.delivery_price < 0">Not payed</span>
          <u-price
            v-else
            :amount="item.delivery_price"
            :currency="item.currency"
          >
          </u-price>
        </small>
      </template>

      <template v-slot:item.status="{ item }">
        <s-order-status-view :status="item.status"></s-order-status-view>
      </template>

      <template v-slot:item.delivery_state="{ item }">
        <div class="min-width-150 pt-2">
          <s-order-delivery-status-stepper
            :dark="dark"
            :state="item.delivery_state"
            :states="deliveryStates"
          />

          <p class="small m-0 text-muted">
            {{ getDeliveryStateString(item.delivery_state) }}
          </p>
        </div>
      </template>

      <template v-slot:item.basket_item_returns="{ item }">
        <return-request-button-badge
          v-if="item.basket_item_returns.length"
          :basket-item-returns="item.basket_item_returns"
        ></return-request-button-badge>
      </template>

      <template v-slot:item.reserved_at="{ item }">
        <div class="min-width-200">
          {{ getFromNowString(item.reserved_at) }}<br />
          <small>
            {{ getLocalTimeString(item.reserved_at) }}
          </small>
        </div>
      </template>

      <template v-slot:bottom>
        <v-pagination v-model="page" :length="pageCount" rounded />
      </template>
    </v-data-table-server>
  </div>
</template>

<script>
import { PhysicalOrderStates } from "@selldone/core-js/enums/basket/PhysicalOrderStates";
import SOrderStatusesSelect from "../../../../../storefront/order/status-select/SOrderStatusesSelect.vue";
import { BasketStatus } from "@selldone/core-js/enums/basket/status/BasketStatus";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { VirtualOrderStates } from "@selldone/core-js/enums/basket/VirtualOrderStates";
import { FileOrderStates } from "@selldone/core-js/enums/basket/FileOrderStates";
import SOrderDeliveryStatusStepper from "../../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import ReturnRequestButtonBadge from "../../../../../storefront/order/order-return/ReturnRequestButtonBadge.vue";
import SOrderStatusView from "../../../../../storefront/order/order-status/SOrderStatusView.vue";

export default {
  name: "BRolePanelOrdersList",
  components: {
    SOrderStatusView,
    ReturnRequestButtonBadge,
    SOrderStatusesSelect,
    SOrderDeliveryStatusStepper,
  },
  emits: ["total-tasks", "select"],
  props: {
    role: {
      required: true,
    },
    shop: {
      required: true,
    },

    type: {
      required: true,
      type: Object,
    },

    dark: {
      default: false,
      type: Boolean,
    },
  },

  data: function () {
    return {
      busy_fetch: false,

      status: [BasketStatus.Payed.code, BasketStatus.COD.code],

      orders: [],

      // Pagination:
      page: 1,
      itemsPerPage: 10,
      totalItems: 0,
      options: {},

      headers: [
        {
          align: "center",
          sortable: false,
          value: "type",
        },
        {
          title: this.$t("admin_shop.orders.physical.table.order_number"),
          align: "start",
          sortable: true,
          value: "id",
        },
        {
          title: this.$t("admin_shop.orders.physical.table.price"),
          align: "center",
          value: "price",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.payment_status"),
          align: "center",
          value: "status",
          sortable: true,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.status"),
          align: "center",
          value: "delivery_state",
          sortable: true,
        },

        {
          title: "",
          align: "center",
          value: "basket_item_returns",
          sortable: false,
        },

        {
          title: this.$t("admin_shop.orders.physical.table.order_date"),
          align: "start",
          sortable: true,
          value: "reserved_at",
        },
      ],
    };
  },
  computed: {
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    deliveryStates() {
      if (this.type.code === ProductType.PHYSICAL.code)
        return PhysicalOrderStates;
      else if (this.type.code === ProductType.VIRTUAL.code)
        return VirtualOrderStates;
      else if (this.type.code === ProductType.FILE.code) return FileOrderStates;
      else if (this.type.code === ProductType.SERVICE.code) return {};

      return null;
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
  },
  created() {},

  methods: {
    fetchOrders(page, sortBy, sortDesc = true) {
      // console.log('sortBy',sortBy,'sortDesc',sortDesc);
      this.page = page;

      this.busy_fetch = true;

      axios
        .get(window.API.GET_MY_ROLE_TASKS(this.role.id), {
          params: {
            offset: (page - 1) * this.itemsPerPage,
            limit: this.itemsPerPage,
            sortBy: sortBy,
            sortDesc: sortDesc,
            statuses: this.status,
          },
        })
        .then(({ data }) => {
          this.totalItems = data.total;
          this.orders = data.orders;
          this.$emit("total-tasks", data.total);
        })
        .finally(() => {
          this.busy_fetch = false;
        });
    },

    inQueProcess(delivery_state) {
      return [
        PhysicalOrderStates.CheckQueue.code,
        PhysicalOrderStates.OrderConfirm.code,
        PhysicalOrderStates.PreparingOrder.code,
      ].includes(delivery_state);
    },
  },
};
</script>

<style lang="scss" scoped></style>
