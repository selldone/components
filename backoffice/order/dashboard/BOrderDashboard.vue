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
  <div v-bind="$attrs">
    <v-toolbar class="text-start" color="transparent" flat>
      <v-toolbar-title class="body-title">
        <router-link
          :to="IS_VENDOR_PANEL ? {} : { name: root_baskets_name }"
          class="text-uppercase"
        >
          <img :src="getProductTypeImage(type)" height="20" width="20" />
          {{ order_type }}
        </router-link>

        <!-- 🎗️ Created by a subscription basket -->
        <span
          v-if="basket.subscription_id"
          title="This order created by a subscription."
        >
          <span class="mx-1">/</span>
          <img :src="ProductType.SUBSCRIPTION.image" height="20" width="20" />
          <router-link
            :to="
              IS_VENDOR_PANEL
                ? {}
                : {
                    name: ProductType.SUBSCRIPTION.order_page,
                    params: { basket_id: basket.subscription_id },
                  }
            "
          >
            SN-{{ basket.subscription_id }}
          </router-link>
        </span>

        <span class="mx-1">/</span>

        <b>{{ order_code }}</b>

        <span class="mx-1">/</span>

        <span :style="{ color: getStatusColor(basket.status) }" class="me-1"
          ><v-icon class="me-1" size="14">{{
            getStatusIcon(basket.status)
          }}</v-icon>
          {{ getStatusString(basket.status) }}</span
        >
      </v-toolbar-title>

      <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ In App Help (Help Center) ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->
      <inline-help :code="'SHOP:ORDER:' + type" class="mx-1"></inline-help>
      <!-- ✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜✜ -->

      <v-spacer />

      <v-btn
        v-if="
          !isHyper &&
          basket.delivery_state !== PhysicalOrderStates.ToCustomer.code &&
          (isCOD || isPayed || isReserved)
        "
        :size="!!basket.reject_at ? 'large' : undefined"
        :variant="!basket.reject_at ? 'text' : 'elevated'"
        class="tnt me-3"
        color="#F44336"
        rounded
        min-height="52"
        @click="dialog_reject = true"
      >
        <v-icon class="me-2" size="small">gavel</v-icon>
        <u-count-down
          v-if="!!basket.reject_at"
          :end="endOfRejectPeriod"
          class="mx-2"
        ></u-count-down>

        <span class="d-none d-sm-inline-block">{{
          $t("process_order_page_dashboard.cancel_order_action")
        }}</span>
      </v-btn>
    </v-toolbar>

    <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Open basket inform! ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

    <template v-if="isOpen">
      <v-img
        :src="require('../../../assets/placeholders/image/relax-cat.png')"
        class="mx-auto my-4"
        max-height="40vh"
        max-width="320"
      ></v-img>

      <p class="font-weight-bold fadeInUp">
        {{ $t("process_order_page_dashboard.open_basket_cation") }}
      </p>
    </template>

    <v-container :class="{ disabled: rejected }" class="px-0">
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Delivery > State ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <s-order-delivery-state
        v-if="!isHyper && basket"
        :basket="basket"
        :is-avocado="isAvocado"
        :is-fulfillment="isFulfillment"
        :offset="inFirstCheckState ? 0 : 1"
        class="mx-auto"
      />

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Pre Payment Slot ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <slot name="pre-payment"></slot>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Payment > Normal ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="basket && !IS_VENDOR_PANEL /*🟢 Not Vendor Panel 🟢*/"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <b-order-dashboard-payment
          :order="basket"
          :shop="shop"
          cod-enable
          @fetch-order="$emit('fetch-order')"
        ></b-order-dashboard-payment>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Payment > Vendor ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

      <b-order-vendor-payment-management
        v-if="basket && IS_VENDOR_PANEL /*🟢 In Vendor Panel 🟢*/"
        :shop="shop"
        :vendor-order="basket"
      ></b-order-vendor-payment-management>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Items ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="!isAvocado && has_local_processing_items"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <b-order-dashboard-cart
          :basket="basket"
          :class="{ disabled: !is_active_OrderBasketListWidget }"
          :is-fulfillment="isFulfillment"
          :readonly="isHyper"
          :shop="shop"
          @confirm-order="
            ({ list, callback }) =>
              updateState(
                PhysicalOrderStates.OrderConfirm.code,
                list,
                callback,
                null,
              )
          "
        ></b-order-dashboard-cart>
      </v-lazy>
      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ List > Drop Shipping Fulfillment (Middle Seller) ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="fulfillments && fulfillments.length"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <div>
          <b-order-dashboard-dropshipping-delivery
            v-if="basket.receiver_info"
            :basket="basket"
            :shop="shop"
          ></b-order-dashboard-dropshipping-delivery>

          <b-order-dashboard-dropshipping-fulfillment
            v-for="fulfillment in fulfillments"
            :key="fulfillment.id"
            :basket="basket"
            :fulfillment="fulfillment"
            :shop="shop"
            @confirm-fulfillment="
              ({ fulfillment, check, callback }) =>
                checkFulfillment(fulfillment, check, callback)
            "
          >
          </b-order-dashboard-dropshipping-fulfillment>
        </div>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ 🦠 Connect Orders ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="has_connect_orders"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <b-order-connects-list
          :basket="basket"
          :shop="shop"
          @show-edit-address="showEditAddress"
        ></b-order-connects-list>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ 🟣 Marketplace 🟣 List orders ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <v-lazy
        v-if="vendor_orders && vendor_orders.length"
        :options="{ threshold: 0 }"
        min-height="200"
      >
        <div>
          <b-order-dashboard-vendor
            v-for="vendor_order in vendor_orders"
            :key="vendor_order.id"
            :basket="basket"
            :shop="shop"
            :vendor-order="vendor_order"
            @update-vendor-order-status="
              ({ vendor_order, delivery_state, callback }) =>
                updateVendorOrderStatus(vendor_order, delivery_state, callback)
            "
          >
          </b-order-dashboard-vendor>
        </div>
      </v-lazy>

      <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Other sections ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
      <slot
        :deliveryReturn="deliveryReturn"
        :getDeliveryServiceOrderInfo="getDeliveryServiceOrderInfo"
        :setTracking="setTracking"
        :showEditAddress="showEditAddress"
        :updateState="updateState"
      ></slot>
    </v-container>
  </div>

  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > ❌ Reject ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->

  <v-dialog
    v-if="!isHyper && basket"
    v-model="dialog_reject"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="text-start">
      <v-card-title class="d-flex align-center justify-start">
        {{ $t("global.commons.reject") }} |
        {{ getBasketOrderCode(basket) }}

        <v-avatar
          v-for="item in basket.items"
          :key="item.id"
          class="ma-1 avatar-gradient -thin -gray"
          :image="getProductImage(item.product_id)"
        >
        </v-avatar>
      </v-card-title>

      <v-card-text>
        <div class="widget-box -large mb-5">
          <u-widget-header
            :title="$t('process_order_page_dashboard.reject_dialog.title')"
          >
          </u-widget-header>

          <v-list-subheader>
            {{ $t("process_order_page_dashboard.reject_dialog.message") }}
          </v-list-subheader>

          <b-shop-customer-box
            :customer="basket.customer"
          ></b-shop-customer-box>

          <u-smart-select
            v-model="reject_reason"
            :items="basketRejectReasons"
            item-text="title"
            item-value="code"
            class="mt-3"
          >
          </u-smart-select>
        </div>

        <div v-if="!rejected" class="widget-box -large mb-5">
          <u-widget-header
            :title="
              $t('process_order_page_dashboard.reject_dialog.options.title')
            "
          >
          </u-widget-header>
          <v-list-subheader>
            {{
              $t("process_order_page_dashboard.reject_dialog.options.subtitle")
            }}
          </v-list-subheader>

          <u-smart-switch
            v-model="reject_express"
            :true-title="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.true_title',
              )
            "
            :false-title="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.false_title',
              )
            "
            :true-description="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.true_description',
              )
            "
            :false-description="
              $t(
                'process_order_page_dashboard.reject_dialog.express_input.false_description',
              )
            "
            true-icon="flash_on"
            false-icon="timelapse"
            class="my-3"
          >
          </u-smart-switch>
        </div>

        <div v-if="rejected" class="widget-buttons">
          <v-btn
            :loading="busy_delete_reject"
            color="green-darken-1"
            size="x-large"
            variant="flat"
            @click="clearRejectOrder()"
          >
            <v-icon class="me-1">settings_backup_restore</v-icon>
            {{
              $t(
                "process_order_page_dashboard.reject_dialog.dismiss_reject_action",
              )
            }}
          </v-btn>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn size="x-large" variant="text" @click="dialog_reject = false">
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !reject_reason }"
            :loading="busy_reject_order"
            color="red-darken-1"
            size="x-large"
            variant="elevated"
            @click="rejectOrder()"
            prepend-icon="check"
          >
            {{
              reject_express
                ? $t(
                    "process_order_page_dashboard.reject_dialog.confirm_now_action",
                  )
                : $t(
                    "process_order_page_dashboard.reject_dialog.confirm_in48h_action",
                  )
            }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import SOrderDeliveryState from "../../../storefront/order/delivery-state/SOrderDeliveryState.vue";

import UCountDown from "../../../ui/count-down/UCountDown.vue";
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import BOrderDashboardCart from "./cart/BOrderDashboardCart.vue";
import BOrderDashboardPayment from "./payment/BOrderDashboardPayment.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BOrderDashboardDropshippingFulfillment from "../../order/dashboard/dropshipping/fulfillment/BOrderDashboardDropshippingFulfillment.vue";
import InlineHelp from "../../help/InlineHelp.vue";
import BOrderDashboardVendor from "../../order/dashboard/vendor/BOrderDashboardVendor.vue";
import USmartSelect from "../../../ui/smart/select/USmartSelect.vue";
import BOrderConnectsList from "../../order/connect/list/BOrderConnectsList.vue";

import BOrderDashboardDropshippingDelivery from "../../order/dashboard/dropshipping/delivery/BOrderDashboardDropshippingDelivery.vue";
import BOrderVendorPaymentManagement from "../../order/vendor/payment/BOrderVendorPaymentManagement.vue";
import { AvocadoItem, Basket, BasketItem, Order } from "@selldone/core-js";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";
import BShopCustomerBox from "@selldone/components-vue/backoffice/customer/box/BShopCustomerBox.vue";
import USmartSwitch from "@selldone/components-vue/ui/smart/switch/USmartSwitch.vue";
import { BEventBusMixin } from "@app-backoffice/mixins/event-bus/BEventBusMixin.ts";
import MapMixin from "@selldone/components-vue/mixin/map/MapMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "BOrderDashboard",
  mixins: [BEventBusMixin, MapMixin, OrderMixin,ProductMixin],
  components: {
    USmartSwitch,
    BShopCustomerBox,
    UWidgetHeader,
    BOrderVendorPaymentManagement,
    BOrderDashboardDropshippingDelivery,

    BOrderConnectsList,
    USmartSelect,
    BOrderDashboardVendor,
    InlineHelp,
    BOrderDashboardDropshippingFulfillment,
    UCountDown,
    BOrderDashboardCart,
    BOrderDashboardPayment,
    SOrderDeliveryState,
  },
  emits: ["fetch-order"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    basket: {
      require: true,
      type: Object,
    },

    isFulfillment: {
      // Drop shipping mode
      default: false,
      type: Boolean,
    },
    isAvocado: {
      // Avocado mode
      default: false,
      type: Boolean,
    },
    isHyper: {
      // Hyper mode
      default: false,
      type: Boolean,
    },
  },
  data: function () {
    return {
      PhysicalOrderStates: Basket.PhysicalOrderStates,

      ProductType: ProductType,

      center: { lat: 0, lng: 0 },
      location: null,

      dialog_reject: false,
      reject_reason: null,
      reject_express: false,
      basketRejectReasons: Object.values(Order.RejectReasons),

      busy_update_state: false,
      busy_reject_order: false,
      busy_delete_reject: false,
    };
  },
  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    type() {
      return this.basket.type;
    },
    order_code() {
      if (this.IS_VENDOR_PANEL) {
        // Vendor order code pattern: (Basket is Vendor order)
        return (
          this.getBasketOrderCode({
            type: this.basket.type,
            id: this.basket.basket_id,
          }) + ` ❯ ${this.getVendorOrderCode(this.basket)}`
        );
      }

      return this.getBasketOrderCode(this.basket);
      /*  if (this.type === ProductType.PHYSICAL.code)
        return `SM-${this.basket.id}`;
      else if (this.type === ProductType.VIRTUAL.code)
        return `SV-${this.basket.id}`;
      else if (this.type === ProductType.FILE.code)
        return `SF-${this.basket.id}`;
      else if (this.type === ProductType.SERVICE.code)
        return `SS-${this.basket.id}`;
      else if (this.isFulfillment) return `DS-${this.basket.id}`;

      return null;*/
    },
    order_type() {
      if (this.type === ProductType.PHYSICAL.code)
        return this.$t("global.commons.physical_orders");
      else if (this.type === ProductType.VIRTUAL.code)
        return this.$t("global.commons.virtual_orders");
      else if (this.type === ProductType.FILE.code)
        return this.$t("global.commons.file_orders");
      else if (this.type === ProductType.SERVICE.code)
        return this.$t("global.commons.service_orders");
      else if (this.type === ProductType.SUBSCRIPTION.code)
        return this.$t("global.commons.subscription_orders");
      else if (this.isFulfillment)
        return this.$t("global.commons.fulfillments");
      else if (this.isAvocado) return this.$t("global.commons.avocado_orders");
      else if (this.isHyper) return this.$t("global.commons.hyper_orders");
      else if (this.type === "POS") return this.$t("global.commons.pos_orders");
      else if (this.type === "BILL") return "⚠ Bill"; // TODO: Not used! deprecated!

      return null;
    },

    endOfRejectPeriod() {
      let date = DateConverter.convertToLocalTime(this.basket.reject_at);
      date.setHours(date.getHours() + 48);

      return date;
    },

    payment() {
      return this.basket.payment;
    },

    basketStatus() {
      return Basket.Status[this.basket.status];
    },

    rejected() {
      return this.basket && this.basket.reject;
    },
    inFirstCheckState() {
      return (
        this.basket.delivery_state ===
        Basket.PhysicalOrderStates.CheckQueue.code
      );
    },

    is_active_OrderBasketListWidget() {
      return (
        this.basket.status === Basket.Status.Payed.code ||
        this.basket.status === Basket.Status.COD.code
      );
    },

    fulfillments() {
      return this.basket.fulfillments;
    },

    vendor_orders() {
      return this.basket.vendor_orders /*Normal seller panel*/;
    },

    has_local_processing_items() {
      // Show all items in fulfillment mode!
      return (
        this.isFulfillment ||
        (this.basket && this.basket.items.some((item) => !item.fulfillment_id))
      );
    },

    isOpen() {
      return this.basket.status === Basket.Status.Open.code;
    },

    isReserved() {
      return this.basket.status === Basket.Status.Reserved.code;
    },

    isPayed() {
      return this.basket.status === Basket.Status.Payed.code;
    },

    isCOD() {
      return this.basket.status === Basket.Status.COD.code;
    },

    isCanceled() {
      return this.basket.status === Basket.Status.Canceled.code;
    },

    has_connect_orders() {
      return this.basket.connect_orders && this.basket.connect_orders.length;
    },

    root_baskets_name() {
      if (this.type === ProductType.PHYSICAL.code)
        return ProductType.PHYSICAL.process_page;
      else if (this.type === ProductType.VIRTUAL.code)
        return ProductType.VIRTUAL.process_page;
      else if (this.type === ProductType.FILE.code)
        return ProductType.FILE.process_page;
      else if (this.type === ProductType.SERVICE.code)
        return ProductType.SERVICE.process_page;
      else if (this.type === ProductType.SUBSCRIPTION.code)
        return ProductType.SUBSCRIPTION.process_page;
      else if (this.isFulfillment) return "BPageShopOrdersDropShipping";
      else if (this.isAvocado) return "BPageShopOrdersAvocado";
      else if (this.isHyper) return "BPageShopOrdersHyper";
      else if (this.type === "POS") return "BPageShopOrdersPos";

      return null;
    },
  },

  watch: {},
  created() {
    this.reject_reason = this.basket.reject;
  },
  unmounted() {},
  methods: {
    //―――――――――――――――― Order ▶ Update basket status ――――――――――――――――

    updateState(
      state,
      list,
      callback: (
        success: boolean,
        items: BasketItem[] | AvocadoItem[],
      ) => void = null,
      delivery_info = null,
    ) {
      this.busy_update_state = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_UPDATE_MY_VENDOR_ORDER_STATE(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.POST_UPDATE_FULFILLMENT_ORDER_STATE(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.POST_UPDATE_AVOCADO_ORDER_STATE(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.POST_UPDATE_ORDER_STATE(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
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
            if (callback) callback(false);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.update_status_success",
              ),
            );

            this.basket.delivery_state = data.delivery_state;
            this.basket.delivery_at = data.delivery_at; // If existed!
            this.$emit("fetch-order"); //optional!

            // ☢ Remove basket from shipping que:
            if (this.basket.delivery_state !== "PreparingOrder") {
              const found_in_que =
                this.$store.getters.getOrderSendingQue &&
                this.$store.getters.getOrderSendingQue.find(
                  (b) =>
                    b.type === this.basket.type && b.type === this.basket.id,
                );
              if (found_in_que) {
                this.onDeleteLogisticSendingOrderQue(found_in_que);
              }
            }
            if (callback) callback(true, data.items);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          if (callback) callback(false);
        })
        .finally(() => {
          this.busy_update_state = false;
        });
    },
    //―――――――――――――――― Drop shipping ▶ Check fulfillment by middle seller ――――――――――――――――

    checkFulfillment(fulfillment, check, callback = null) {
      axios
        .put(
          window.API.PUT_CHECK_FULFILLMENT(
            this.$route.params.shop_id,
            this.$route.params.basket_id,
          ),
          {
            fulfillment_id: fulfillment.id,
            check: check,
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

            fulfillment.check_at = data.check_at;
            this.$emit("fetch-order"); //optional!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          callback();
        });
    },

    //―――――――――――――――― Order ▶ Delivery return ――――――――――――――――

    deliveryReturn(state, list, callback = null, delivery_info = null) {
      this.busy_update_state = true;
      axios
        .post(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_UPDATE_MY_VENDOR_ORDER_DELIVERY_RETURN(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.POST_UPDATE_FULFILLMENT_ORDER_DELIVERY_RETURN(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.POST_UPDATE_AVOCADO_ORDER_DELIVERY_RETURN(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.POST_UPDATE_ORDER_DELIVERY_RETURN(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
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
            this.$emit("fetch-order"); //optional!
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

    //―――――――――――――――― Order ▶ Reject order ――――――――――――――――

    rejectOrder() {
      this.busy_reject_order = true;
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_REJECT_MY_VENDOR_ORDER(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.PUT_REJECT_FULFILLMENT_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.PUT_REJECT_AVOCADO_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.PUT_REJECT_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  ),
          {
            reject: this.reject_reason,
            express: this.reject_express,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.reject_update_success",
              ),
            );
            this.basket.reject = data.reject;
            this.basket.reject_at = data.reject_at;
            this.dialog_reject = false;

            this.$emit("fetch-order"); // Force refresh order!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_reject_order = false;
        });
    },
    //―――――――――――――――― Order ▶ Clear reject order ――――――――――――――――

    clearRejectOrder() {
      this.busy_delete_reject = true;
      axios
        .delete(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.DELETE_REJECT_MY_VENDOR_ORDER(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.DELETE_REJECT_FULFILLMENT_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : this.isAvocado
                ? window.API.DELETE_REJECT_AVOCADO_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  )
                : window.API.DELETE_REJECT_ORDER(
                    this.$route.params.shop_id,
                    this.$route.params.basket_id,
                  ),
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.dismiss_reject_success",
              ),
            );
            this.basket.reject = data.reject;
            this.basket.reject_at = data.reject_at;
            this.dialog_reject = false;
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete_reject = false;
        });
    },

    //―――――――――――――――― Delivery  ▶ Get delivery service order info ――――――――――――――――

    getDeliveryServiceOrderInfo(transportation_order, callback = null) {
      if (this.isFulfillment) return;

      if (!transportation_order.service) {
        NotificationService.showWarningAlert(null, "Delivery service order not exist!");
        if (callback) callback();
        return;
      }
      axios
        .get(
          this.IS_VENDOR_PANEL
            ? window.VAPI.GET_MY_VENDOR_DELIVERY_SERVICE_ORDER_INFO(
                transportation_order.vendor_id,
                transportation_order.transportation_id,
                transportation_order.service.id,
                transportation_order.uid,
              )
            : window.API.GET_DELIVERY_SERVICE_ORDER_INFO(
                transportation_order.shop_id,
                transportation_order.transportation_id,
                transportation_order.service.id,
                transportation_order.uid,
              ),
        )
        .then(({ data }) => {
          if (!data.error) {
            if (data.changed) {
              // Force refresh order completely:
              this.$emit("fetch-order"); //optional!
            } else if (data.tracking && data.tracking.history) {
              // Update shipping history:
              // console.log('history_changed',data.tracking.history)
              transportation_order.history = data.tracking.history;
            }
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          if (callback) callback();
        });
    },
    //―――――――――――――――― Delivery  ▶ Set tracking info manually ――――――――――――――――

    setTracking(
      tracking_code,
      tracking_url,
      callback: (success: boolean) => void,
    ) {
      axios
        .put(
          this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.PUT_SET_TRACKING_MY_VENDOR_ORDER(
                this.$route.params.vendor_id,
                this.$route.params.vendor_order_id,
              )
            : this.isFulfillment
              ? window.API.PUT_SET_TRACKING_FULFILLMENT_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                )
              : // Avocado not have tracking!
                window.API.PUT_SET_TRACKING_ORDER(
                  this.$route.params.shop_id,
                  this.$route.params.basket_id,
                ),
          {
            tracking_code: tracking_code,
            tracking_url: tracking_url,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
            if (callback) callback(false);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.set_tracking_success",
              ),
            );
            this.basket.delivery_info = data.delivery_info;
            if (callback) callback(true);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
          if (callback) callback(false);
        })
        .finally(() => {});
    },

    //―――――――――――――――― 🟣 Marketplace 🟣 ▶ Update delivery state manually by marketplace owner ――――――――――――――――

    updateVendorOrderStatus(vendor_order, delivery_state, callback = null) {
      axios
        .put(
          window.API.PUT_UPDATE_VENDOR_ORDER_BY_MARKETPLACE_OWNER(
            this.$route.params.shop_id,
            this.$route.params.basket_id,
          ),
          {
            vendor_id: vendor_order.id,
            delivery_state: delivery_state,
          },
        )
        .then(({ data }) => {
          if (data.error) {
            NotificationService.showErrorAlert(null, data.error_msg);
          } else {
            NotificationService.showSuccessAlert(
              null,
              this.$t(
                "process_order_page_dashboard.notifications.vendor_order_status_update_success",
              ),
            );

            Object.assign(vendor_order, data.vendor_order);

            if (data.basket) {
              // In some case like marketplace with direct shipping mode, it could update delivery_state of the main order.
              Object.assign(this.basket, data.basket);
            }
            // vendor_order.delivery_state = data.vendor_order.delivery_state;
            this.$emit("fetch-order"); //optional!
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          callback();
        });
    },

    //―――――――――――――――― Edit receiver info by seller ――――――――――――――――

    showEditAddress(callback) {
      const center =
        this.basket.receiver_info && this.basket.receiver_info.location
          ? Object.assign({}, this.basket.receiver_info.location)
          : null;
      const map_location = Object.assign({}, this.basket.receiver_info);
      this.showMap(
        center,
        "detail",
        map_location,
        (info) => {
          //  console.log("receiver_info", this.basket.receiver_info, ">>>", info);

          if (callback) callback(true);
          axios
            .put(
              this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
                ? window.VAPI.PUT_MY_VENDOR_UPDATE_ORDER_RECEIVER_INFO(
                    this.$route.params.vendor_id,
                    this.$route.params.vendor_order_id, // Vendor order id!
                  )
                : window.API.PUT_UPDATE_ORDER_RECEIVER_INFO(
                    this.shop.id,
                    this.basket.id,
                  ),
              {
                receiver_info: info,
              },
            )
            .then(({ data }) => {
              if (data.error) {
                NotificationService.showErrorAlert(null, data.error_msg);
              } else {
                NotificationService.showSuccessAlert(
                  null,
                  this.$t(
                    "process_order_page_dashboard.notifications.shipping_address_update_success",
                  ),
                );
                Object.assign(this.basket.receiver_info, data.receiver_info);
              }
            })
            .catch((error) => {
              NotificationService.showLaravelError(error);
            })
            .finally(() => {
              if (callback) callback(false);
            });

          this.closeMap();
        },
        false,
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>
