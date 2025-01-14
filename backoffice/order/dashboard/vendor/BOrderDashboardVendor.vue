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
  <div
    :class="{ '-activated': in_this_step, disabled: disabled }"
    class="widget shadow my-3 mx-1 mx-md-3"
  >
    <!-- ------------------ Title ------------------ -->

    <div class="d-flex align-center">
      <h2>
        <img
          class="me-1"
          height="24"
          :src="
            require('@selldone/components-vue/assets/icons/marketplace.svg')
          "
          width="24"
        />
        {{ $t("global.commons.vendors_panel") }}
      </h2>

      <v-chip
        v-if="canceled"
        class="mx-2"
        size="small"
        color="red"
        prepend-icon="cancel"
        variant="flat"
      >
        {{ $t("global.commons.canceled") }}

        <v-tooltip activator="parent" content-class="bg-red" location="bottom">
          The vendor has rejected the order, and its fulfillment has been fully
          canceled.
        </v-tooltip>
      </v-chip>

      <v-chip
        v-else-if="rejected"
        class="mx-2"
        size="small"
        color="red"
        prepend-icon="do_not_disturb"
        variant="flat"
      >
        {{ $t("global.commons.reject") }}

        <v-tooltip activator="parent" content-class="bg-red" location="bottom">
          The vendor has rejected the order, but it has not been fully canceled
          yet.
        </v-tooltip>
      </v-chip>

      <v-chip
        v-else-if="is_fulfilling"
        class="mx-2"
        size="small"
        variant="flat"
        color="#4CAF50"
      >
        {{ $t("global.commons.fulfilling") }}...
        <i class="fas fa-circle-notch fa-spin ms-1"></i>
      </v-chip>

      <v-spacer></v-spacer>

      <small
        :title="'Date: ' + getLocalTimeString(last_state_text)"
        class="text-capitalize"
      >
        {{ getStatusString(vendorOrder.status) }} -
        {{ getFromNowString(last_state_text) }}</small
      >
    </div>

    <!-- ------------------ Reject ------------------ -->
    <u-count-down
      v-if="vendorOrder?.reject_at && !canceled"
      :end="endOfRejectPeriod"
      class="mx-2 text-red"
    ></u-count-down>

    <div v-if="rejected" class="text-subtitle-2">
      <v-icon class="me-1">do_not_disturb</v-icon>

      {{ $t("order_vendor.order_rejected") }}:<b
        class="mx-1"
        v-if="vendorOrder.reject_at"
        >{{ getLocalDateString(vendorOrder.reject_at) }}
      </b>

      <span v-if="reject_reason">
        |
        {{ reject_reason }}
      </span>

      <div v-if="vendorOrder.reject_note">
        {{ vendorOrder.reject_note }}
      </div>
    </div>

    <!-- ------------------ Cancel ------------------ -->

    <div v-if="canceled" class="text-subtitle-2">
      <v-icon class="me-1" color="red">cancel</v-icon>

      {{ $t("order_vendor.order_canceled") }}:<b class="mx-1"
        >{{ getLocalDateString(vendorOrder.cancel_at) }}
      </b>

      <span v-if="vendorOrder.cancel_note">
        |
        {{ vendorOrder.cancel_note }}
      </span>
    </div>

    <!-- ------------------ Order Code ------------------ -->

    <p class="text-start my-2" title="Vendor order ID.">
      <v-icon class="me-1" color="#111">shopping_bag</v-icon>
      <v-icon class="me-1" color="#111">{{ $t("icons.chevron_next") }}</v-icon>
      <b>{{ getVendorOrderCode(vendorOrder) }}</b>
    </p>

    <!-- ------------------ Vendor Info ------------------ -->
    <v-row class="mb-0">
      <v-col class="text-start d-flex align-center" cols="12" md="6">
        <u-avatar-folder
          :src="getShopImagePath(vendor.icon, 128)"
          is-purple
          class="me-1"
          :size="64"
          side-icon="storefront"
          elevated
        >
        </u-avatar-folder>

        <div class="text-start flex-grow-1">
          <v-btn
            v-if="!IS_VENDOR_PANEL"
            :to="{ name: 'BPageMarketplaceVendors' }"
            class="ms-1 tnt my-1"
            append-icon="launch"
            color="#333"
            target="_blank"
            title="Go to vendors management panel."
            variant="outlined"
            size="small"
          >
            {{ $t("global.commons.vendors") }}
          </v-btn>
          <v-btn
            v-if="!IS_VENDOR_PANEL"
            :to="{
              name: 'VPageVendorDashboard',
              params: { vendor_id: vendor.id },
            }"
            class="ms-1 tnt my-1"
            prepend-icon="storefront"
            color="#333"
            target="_blank"
            title="Go to vendor panel."
            variant="outlined"
            size="small"
            append-icon="launch"
          >
            {{ vendor.name }}
          </v-btn>
          <v-btn
            v-if="!IS_VENDOR_PANEL && type_obj"
            :to="{
              name: type_obj.vendor_order_page,
              params: { vendor_id: vendor.id, vendor_order_id: vendorOrder.id },
            }"
            class="ms-1 tnt my-1"
            append-icon="launch"
            color="#333"
            target="_blank"
            title="Go to vendor order fulfillment page."
            variant="outlined"
            size="small"
          >
            <img :src="type_obj.image" width="14" height="14" class="ms-n2" />
          </v-btn>

          <div class="px-1">
            <v-chip
              v-if="vendor.enable"
              class="m-1"
              color="#fafafa"
              size="small"
              variant="flat"
            >
              <v-icon color="green" start>check</v-icon>
              {{ $t("global.commons.enable") }}
            </v-chip>
            <v-chip v-else class="m-1" color="#fafafa" size="small">
              <v-icon color="red" start>close</v-icon>
              {{ $t("global.commons.disable") }}
            </v-chip>

            <v-chip
              v-if="vendor.access"
              class="m-1"
              color="#fafafa"
              size="small"
              variant="flat"
            >
              <v-icon start>admin_panel_settings</v-icon>
              {{ $t("order_vendor.has_panel") }}
            </v-chip>
            <v-chip
              v-else
              class="m-1"
              color="#fafafa"
              size="small"
              variant="flat"
            >
              <v-icon start>person_outline</v-icon>
              {{ $t("order_vendor.has_panel") }}
            </v-chip>
          </div>
        </div>
      </v-col>
      <v-col cols="12" md="6">
        <s-order-delivery-status-stepper
          :state="vendorOrder.delivery_state"
          :states="orders_states"
          class="my-1"
          color="#000"
          dark-color="#000"
          show-caption
        />
      </v-col>
    </v-row>

    <p
      class="text-start mt-2 text-muted small single-line d-block"
      title="About the vendor."
    >
      {{ vendor.description }}
    </p>

    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Vendor cart count ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <div
      class="expand-button mb-2 mt-2 px-2 widget-hover rounded position-relative pointer-pointer"
      @click="force_show_items = !force_show_items"
    >
      <span class="absolute-top-end text-muted px-2 small"
        ><v-icon
          :class="{ 'rotate-180': force_show_items }"
          class="mx-1 t-all-400"
          size="12"
          >fa:fas fa-angle-up</v-icon
        >{{ $t("fulfilment_order_widget.list_of_items") }}
      </span>

      <b-order-cart-items-circle
        class="d-flex overflow-auto pt-5 pb-2"
        :delivery-state="vendorOrder.delivery_state"
        :items="items"
      >
      </b-order-cart-items-circle>


    </div>
    <!-- ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Vendor cart Table ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

    <v-expand-transition>
      <div v-if="force_show_items">
        <b-order-cart
          :items="items"
          :select-all="initial_select_all"
          :shop="shop"
          :basket="basket"
          :type="basket.type"
          class="pb-4 mb-2"
          @fetch-order="$emit('fetch-order')"
        />
      </div>
    </v-expand-transition>

    <v-expansion-panels flat>
      <v-expansion-panel
        v-if="!canceled"
        class="bg-transparent border"
        rounded="lg"
      >
        <v-expansion-panel-title>
          <v-icon class="me-1">arrow_drop_down</v-icon>
          <div class="d-inline-flex flex-column">
            <div>
              <b> {{ $t("order_vendor.manual_action.title") }}</b>
              <v-chip
                :prepend-icon="getDeliveryStateIcon(vendorOrder.delivery_state)"
                class="ma-1"
                color="#111"
                label
                size="x-small"
                variant="flat"
                >{{ getDeliveryStateString(vendorOrder.delivery_state) }}
              </v-chip>
            </div>
            <small class="mt-1">
              {{ $t("order_vendor.manual_action.message") }}
            </small>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-btn-toggle
            :model-value="vendorOrder.delivery_state"
            class="widget-toggle"
            selected-class="bg-primary"
          >
            <v-btn
              v-for="item in orders_states"
              :key="item.code"
              :loading="busy === item.code"
              :value="item.code"
              rounded
              variant="flat"
              class="border"
              :class="{
                'elevation-3': vendorOrder.delivery_state === item.code,
              }"
              @click="setDeliveryStatus(item.code)"
            >
              <v-icon start>{{ item.icon }}</v-icon>
              {{ $t(item.name) }}
              <v-icon v-if="vendorOrder.delivery_state === item.code" end
                >check_circle
              </v-icon>
            </v-btn>
          </v-btn-toggle>

          <ul class="tips mt-4 text-start">
            <li
              v-for="it in $tm('order_vendor.manual_action.guides')"
              :key="it"
            >
              {{ it }}
            </li>
          </ul>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel
        v-if="vendorOrder.transactions?.length /*It should be existed always!*/"
        class="bg-transparent border"
        rounded="lg"
      >
        <v-expansion-panel-title>
          <v-icon class="me-1">arrow_drop_down</v-icon>
          <div class="d-inline-flex flex-column">
            <div>
              <b> {{ $t("order_vendor.payouts.title") }}</b>

              <v-chip
                v-for="transaction in transactions"
                :key="transaction.id"
                class="ma-1"
                color="#111"
                label
                prepend-icon="wallet"
                size="x-small"
                variant="flat"
              >
                <u-price
                  :amount="transaction.amount"
                  :currency="transaction.currency"
                ></u-price>
                <v-tooltip
                  v-if="transaction.amount > 0"
                  activator="parent"
                  location="bottom"
                >
                  {{ $t("order_vendor.payouts.charge_tooltip") }}
                </v-tooltip>
                <v-tooltip v-else activator="parent" location="bottom">
                  {{ $t("order_vendor.payouts.withdraw_tooltip") }}
                </v-tooltip>
              </v-chip>

              <v-chip
                v-for="payment in payments"
                :key="payment.id"
                class="ma-1"
                color="#111"
                label
                prepend-icon="account_balance"
                size="x-small"
                variant="flat"
              >
                <u-price
                  :amount="payment.amount"
                  :currency="payment.currency"
                ></u-price>
                <v-tooltip activator="parent" location="bottom">
                  {{ $t("order_vendor.payouts.payout_tooltip") }}
                </v-tooltip>
              </v-chip>
            </div>

            <small class="mt-1">
              {{ $t("order_vendor.payouts.message") }}
            </small>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <b-order-vendor-payment-management
            :shop="shop"
            :vendor-order="vendorOrder"
          ></b-order-vendor-payment-management>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Package info -->

    <u-fade-scroll>
      <div
        v-if="
          volume && volume.width > 0 && volume.length > 0 && volume.height > 0
        "
        class="py-3 d-flex align-center"
      >
        <div class="p-3 me-2 border-end" title="Package">
          <v-icon size="18">aspect_ratio</v-icon>
        </div>

        <div class="mx-1 d-flex align-center">
          <div class="pa-1 rounded d-flex flex-column me-5 border">
            <div>
              {{ delivery_info.weight }}
              <small class="x-small">{{ mass_unit }}</small>
            </div>
            <small class="x-small min-width-50">{{
              $t("global.commons.weight")
            }}</small>
          </div>

          <div class="pa-1 rounded d-flex flex-column border me-1">
            <div>
              {{ volume.width }} <small class="x-small">{{ size_unit }}</small>
            </div>
            <small class="x-small min-width-50">{{
              $t("global.commons.width")
            }}</small>
          </div>

          <div class="pa-1 rounded d-flex flex-column border me-1">
            <div>
              {{ volume.length }} <small class="x-small">{{ size_unit }}</small>
            </div>
            <small class="x-small min-width-50">{{
              $t("global.commons.length")
            }}</small>
          </div>

          <div class="pa-1 rounded d-flex flex-column border me-1">
            <div>
              {{ volume.height }} <small class="x-small">{{ size_unit }}</small>
            </div>
            <small class="x-small min-width-50">{{
              $t("global.commons.height")
            }}</small>
          </div>
        </div>

        <u-cube
          :size="64"
          :x="volume.width"
          :y="volume.length"
          :z="volume.height"
          color="#FFC107"
          no-animation
        ></u-cube>
      </div>
    </u-fade-scroll>

    <!-- Step 3 : Shipment tracking code -->

    <div
      v-if="tracking_code || tracking_url"
      class="d-flex border-between align-center"
    >
      <div class="p-3 me-2" title="Track vendor courier">
        <v-icon size="36">location_searching</v-icon>
      </div>
      <div class="flex-grow-1 text-start">
        <p v-if="tracking_code" class="my-1">
          <span class="small me-1"
            >{{ $t("global.commons.tracking_code") }}:
          </span>
          <b v-copy>{{ tracking_code }}</b>
        </p>

        <p v-if="tracking_url" class="my-1">
          <span class="small me-1"
            >{{ $t("global.commons.tracking_url") }}:
          </span>
          <a :href="tracking_url" class="link-dash" target="_blank">{{
            tracking_url
          }}</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BOrderCart from "../../cart/BOrderCart.vue";
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UCube from "../../../../ui/cube/UCube.vue";
import BOrderVendorPaymentManagement from "../../../order/vendor/payment/BOrderVendorPaymentManagement.vue";
import {
  Basket,
  DateConverter,
  Order,
  ShopOptionsHelper,
} from "@selldone/core-js";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import UCountDown from "@selldone/components-vue/ui/count-down/UCountDown.vue";
import UFadeScroll from "@selldone/components-vue/ui/fade-scroll/UFadeScroll.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import OrderMixin from "@selldone/components-vue/mixin/order/OrderMixin.ts";
import BOrderCartItemsCircle from "@selldone/components-vue/backoffice/order/cart/items/circle/BOrderCartItemsCircle.vue";

export default {
  name: "BOrderDashboardVendor",
  mixins: [DateMixin, OrderMixin],

  components: {
    BOrderCartItemsCircle,
    UFadeScroll,
    UCountDown,
    UAvatarFolder,
    BOrderVendorPaymentManagement,
    UCube,
    SOrderDeliveryStatusStepper,
    BOrderCart,
  },
  emits: ["update-vendor-order-status", "fetch-order"],
  props: {
    shop: {
      require: true,
      type: Object,
    },
    vendorOrder: {
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
      force_show_items: false,
      busy: null,
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

    last_state_text() {
      if (this.vendorOrder.status === Basket.Status.Reserved.code)
        return this.vendorOrder.reserved_at;
      else if (this.vendorOrder.status === Basket.Status.Payed.code)
        return this.vendorOrder.payment_at;
      else if (this.vendorOrder.status === Basket.Status.Canceled.code)
        return this.vendorOrder.cancel_at;
      else if (this.vendorOrder.status === Basket.Status.COD.code)
        return this.vendorOrder.reserved_at;

      return null;
    },

    type() {
      return this.vendorOrder.type; // Equal to basket type!
    },
    type_obj() {
      return ProductType[this.type];
    },
    delivery_states() {
      return this.type_obj?.delivery_states;
    },
    is_fulfilling() {
      return [
        Order.DeliveryStateCode.OrderConfirm,
        Order.DeliveryStateCode.PreparingOrder,
      ].includes(this.vendorOrder.delivery_state);
    },

    orders_states() {
      if (this.type === ProductType.PHYSICAL.code) {
        return Basket.PhysicalOrderStates;
      } else if (this.type === ProductType.VIRTUAL.code) {
        return Basket.VirtualOrderStates;
      } else if (this.type === ProductType.FILE.code) {
        return Basket.FileOrderStates;
      } else if (this.type === ProductType.SERVICE.code) {
        return Basket.ServiceOrderStates;
      } else if (this.type === ProductType.SUBSCRIPTION.code) {
        return Basket.SubscriptionOrderStates;
      }
      return null;
    },

    vendor() {
      return this.vendorOrder.vendor;
    },

    items() {
      return this.basket.items.filter(
        (item) => item.vendor_id === this.vendor.id,
      );
    },

    disabled() {
      return this.basket.status === Basket.Status.Reserved.code;
    },

    in_this_step() {
      return false;
    },

    initial_select_all() {
      return (
        this.vendorOrder.delivery_state ===
        Basket.PhysicalOrderStates.CheckQueue.code
      );
    },

    isCheck() {
      return !!this.vendorOrder.check_at;
    },

    isPayed() {
      return this.vendorOrder.status === Basket.Status.Payed.code;
    },

    showItems() {
      if (this.force_show_items) return true;
      if (!this.vendorOrder) return false;
      return (
        this.vendorOrder.delivery_state ===
          Basket.PhysicalOrderStates.CheckQueue.code ||
        this.vendorOrder.delivery_state ===
          Basket.PhysicalOrderStates.PreparingOrder.code
      );
    },

    delivery_info() {
      return this.vendorOrder.delivery_info;
    },
    tracking_code() {
      if (!this.delivery_info) return null;
      return this.delivery_info.tracking_code;
    },
    tracking_url() {
      if (!this.delivery_info) return null;
      return this.delivery_info.tracking_url;
    },

    volume() {
      return this.delivery_info && this.delivery_info.volume;
    },

    payments() {
      return this.vendorOrder.payments;
    },

    transactions() {
      return this.vendorOrder.transactions;
    },
    size_unit() {
      return ShopOptionsHelper.GetSizeUnit(this.shop);
    },

    mass_unit() {
      return ShopOptionsHelper.GetMassUnit(this.shop);
    },
    endOfRejectPeriod() {
      let date = DateConverter.convertToLocalTime(this.vendorOrder.reject_at);
      date.setHours(date.getHours() + 48);

      return date;
    },
    rejected() {
      return this.basket && this.vendorOrder.reject;
    },
    canceled() {
      return this.vendorOrder.status === "Canceled";
    },

    reject_reason() {
      if (!this.rejected) return null;
      let obj = Order.RejectReasons[this.vendorOrder.reject];
      return obj
        ? this.$t(obj.title)
        : this.$t("global.basket_delivery_state.reason_not_found");
    },
  },
  methods: {
    setDeliveryStatus(delivery_state) {
      this.busy = delivery_state;

      this.$emit("update-vendor-order-status", {
        vendor_order: this.vendorOrder,
        delivery_state: delivery_state,
        callback: () => {
          this.busy = null;
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
