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
  <v-container class="py-10" fluid v-bind="$attrs">
    <b-role-panel-orders-list
      :dark="dark"
      :role="role"
      :shop="shop"
      :type="ProductType.PHYSICAL"
      class="min-height-50vh"
      @select="selectTask"
      @total-tasks="(val) => (role.total_tasks = val)"
    ></b-role-panel-orders-list>
  </v-container>

  <!-- ██████████████████████ Dialog ██████████████████████ -->

  <v-dialog
    v-model="dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title>
        <img
          :src="ProductType.PHYSICAL.image"
          class="me-2"
          height="24"
          width="24"
        />
        Order SM-{{ selected.id }}
      </v-card-title>

      <v-card-text class="pb-16">
        <u-loading-progress v-if="busy_fetch"></u-loading-progress>
        <v-container>
          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Payment ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <b-order-dashboard-payment
            v-if="
              basket && role.level === ShopRoles.PhysicalOrdersChecking.code
            "
            :order="basket"
            :shop="shop"
            cod-enable
            is-role-panel
            @fetch-order="fetchBasket()"
          ></b-order-dashboard-payment>

          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Items ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <b-order-dashboard-cart
            v-if="
              basket && role.level === ShopRoles.PhysicalOrdersChecking.code
            "
            :basket="basket"
            :class="{ disabled: !is_active_OrderBasketListWidget }"
            :shop="shop"
            is-role-panel
            @confirm-order="
              ({ list, callback }) =>
                updateState(
                  PhysicalOrderStates.OrderConfirm.code,
                  list,
                  callback,
                  null,
                )
            "
            @fetch-order="$emit('fetch-order')"
          ></b-order-dashboard-cart>

          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Package info ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <b-order-dashboard-preparing
            v-if="
              basket && role.level === ShopRoles.PhysicalOrdersPackaging.code
            "
            :basket="basket"
            :class="{ disabled: !is_active_OrderPreparingWidget }"
            :shop="shop"
            is-role-panel
            @confirm-preparing="
              ({ delivery_info, callback }) =>
                updateState(
                  PhysicalOrderStates.PreparingOrder.code,
                  null,
                  callback,
                  delivery_info,
                )
            "
          ></b-order-dashboard-preparing>

          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Delivery Info ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <b-order-dashboard-delivery
            v-if="
              basket && role.level === ShopRoles.PhysicalOrdersDelivery.code
            "
            :basket="basket"
            :class="{ disabled: !is_active_OrderDeliveryWidget }"
            :shop="shop"
            is-role-panel
            @confirm-send="
              ({ callback }) =>
                updateState(
                  PhysicalOrderStates.SentOrder.code,
                  null,
                  callback,
                  null,
                )
            "
            @confirm-received="
              ({ callback }) =>
                updateState(
                  PhysicalOrderStates.ToCustomer.code,
                  null,
                  callback,
                  null,
                )
            "
            @fetch-order="$emit('fetch-order')"
          ></b-order-dashboard-delivery>
          <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Return Requests ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

          <s-order-basket-return
            v-if="basket && role.level === ShopRoles.PhysicalOrdersSupport.code"
            :basket="basket"
            :role="role"
            class="mt-4"
            is-role-panel
          />
        </v-container>
      </v-card-text>

      <v-card-actions>
        <s-widget-buttons>
          <v-btn
            prepend-icon="close"
            size="x-large"
            variant="text"
            @click="dialog = false"
          >
            {{ $t("global.actions.close") }}
          </v-btn>
        </s-widget-buttons>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import BRolePanelOrdersList from "../orders/list/BRolePanelOrdersList.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ShopRoles } from "@selldone/core-js/enums/staff/ShopRoles";
import BOrderDashboardPayment from "../../../order/dashboard/payment/BOrderDashboardPayment.vue";
import BOrderDashboardCart from "../../../order/dashboard/cart/BOrderDashboardCart.vue";
import BOrderDashboardPreparing from "../../../order/dashboard/preparing/BOrderDashboardPreparing.vue";
import BOrderDashboardDelivery from "../../../order/dashboard/delivery/BOrderDashboardDelivery.vue";
import SOrderBasketReturn from "../../../../storefront/order/basket/return/SOrderBasketReturn.vue";
import SWidgetButtons from "../../../../ui/widget/buttons/SWidgetButtons.vue";
import { Basket } from "@selldone/core-js";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

export default {
  name: "BRolePanelPhysical",
  mixins: [],
  components: {
    SWidgetButtons,
    SOrderBasketReturn,
    BOrderDashboardDelivery,
    BOrderDashboardPreparing,
    BOrderDashboardCart,
    BOrderDashboardPayment,

    BRolePanelOrdersList,
  },
  emits: ["fetch-order"],
  props: {
    role: {
      require: true,
      type: Object,
    },
    shop: {
      require: true,
      type: Object,
    },

    timeSeries: {
      require: true,
      type: Object,
    },
    dark: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      ProductType: ProductType,
      ShopRoles: ShopRoles,

      selected: null,

      busy_fetch: false,
      basket: null,

      busy_update_state: false,

      dialog: false,
    };
  },
  computed: {
    is_active_OrderBasketListWidget() {
      return (
        this.basket.status === Basket.Status.Payed.code ||
        this.basket.status === Basket.Status.COD.code
      );
    },

    is_active_OrderPreparingWidget() {
      return (
        this.is_active_OrderBasketListWidget &&
        (this.basket.delivery_state ===
          Basket.PhysicalOrderStates.OrderConfirm.code ||
          this.basket.delivery_state ===
            Basket.PhysicalOrderStates.PreparingOrder.code ||
          this.basket.delivery_state ===
            Basket.PhysicalOrderStates.SentOrder.code ||
          this.basket.delivery_state ===
            Basket.PhysicalOrderStates.ToCustomer.code)
      );
    },

    is_active_OrderDeliveryWidget() {
      return (
        this.is_active_OrderBasketListWidget &&
        (this.basket.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code ||
          this.basket.delivery_state ===
            Basket.PhysicalOrderStates.SentOrder.code ||
          this.basket.delivery_state ===
            Basket.PhysicalOrderStates.ToCustomer.code)
      );
    },
  },

  watch: {},

  mounted() {},
  created() {},

  methods: {
    //―――――――――――――――――――――――  ―――――――――――――――――――――――

    selectTask(task) {
      this.selected = task;
      this.basket = null;
      this.dialog = true;
      this.fetchBasket();
    },

    fetchBasket() {
      this.busy_fetch = true;
      axios
        .get(window.API.GET_MY_ROLE_TASK(this.role.id, this.selected.id))
        .then(({ data }) => {
          this.basket = data.basket;
        })
        .finally(() => (this.busy_fetch = false));
    },

    //――――――――――――――――――――――― Update status ―――――――――――――――――――――――

    updateState(state, list, callback = null, delivery_info = null) {
      this.busy_update_state = true;
      axios
        .post(
          window.API.POST_MY_ROLE_TASK_ACTION(
            this.role.id,
            this.selected.id,
            "update-status",
          ),
          {
            state: state,
            list: list,
            delivery_info: delivery_info,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.update_status_success",
              ),
            );

            this.basket.delivery_state = data.delivery_state;
            this.basket.delivery_at = data.delivery_at; // If exist!

            // Update selected item in list:
            this.selected.delivery_state = data.delivery_state;
            this.selected.delivery_at = data.delivery_at; // If exist!
            this.selected.done = true; // To set task as done!
            this.fetchBasket(); //optional!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_update_state = false;
          if (callback) callback();
        });
    },
  },
};
</script>
