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
    <div class="d-flex align-center">
      <h2>
        <img
          class="me-1"
          height="24"
          src="../../../../assets/icons/marketplace.svg"
          width="24"
        />
        {{ $t("global.commons.vendors_panel") }}
      </h2>
      <v-spacer></v-spacer>

      <small
        :title="'Date: ' + getLocalTimeString(last_state_text)"
        class="text-capitalize"
      >
        {{ getStatusString(vendorOrder.status) }} -
        {{ getFromNowString(last_state_text) }}</small
      >
    </div>

    <p class="text-start my-2" title="Vendor order ID.">
      <v-icon class="me-1" color="#111">shopping_bag</v-icon>
      <v-icon class="me-1" color="#111">{{ $t("icons.chevron_next") }}</v-icon>
      <b>{{ getVendorOrderCode(vendorOrder) }}</b>
    </p>

    <!-- Main seller shop info -->
    <v-row>
      <v-col class="text-start d-flex align-center" cols="12" md="6">
        <v-avatar class="me-1" color="#fafafa" rounded size="64">
          <img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 128)" />
          <v-icon v-else>storefront</v-icon>
        </v-avatar>

        <div class="text-start flex-grow-1">
          <v-btn
            v-if="!IS_VENDOR_PANEL"
            :to="{
              name: 'VPageVendorDashboard',
              params: { vendor_id: vendor.id },
            }"
            class="ms-1 tnt"
            prepend-icon="storefront"
            color="primary"
            target="_blank"
            title="Go to vendor panel."
            variant="elevated"
            size="small"
          >
            {{ vendor.name }}
          </v-btn>

          <v-btn
            :to="
              IS_VENDOR_PANEL ? undefined : { name: 'BPageMarketplaceVendors' }
            "
            class="ms-1 tnt"
            append-icon="launch"
            color="primary"
            target="_blank"
            title="Go to vendors management panel."
            variant="text"
            size="small"
          >
            {{ $t("global.commons.vendors") }}
          </v-btn>

          <div class="px-1 mt-1">
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

    <p class="text-start mt-2 text-muted" title="About the vendor.">
      {{ vendor.description }}
    </p>

    <div
      class="expand-button mb-2 mt-4 p-3 widget-hover rounded position-relative pointer-pointer"
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

      <div class="d-flex my-2">
        <v-badge
          v-for="item in items"
          :key="item.id"
          :color="item.check ? 'green' : 'amber'"
          class="m-2"
        >
          <template v-slot:badge>{{ item.count }}</template>
          <v-avatar>
            <img :src="getProductImage(item.product_id)" />
          </v-avatar>
        </v-badge>
      </div>
    </div>

    <v-expand-transition>
      <div v-if="force_show_items">
        <b-order-cart
          :items="items"
          :select-all="initial_select_all"
          :shop="shop"
          :type="basket.type"
          class="pb-4"
        />
      </div>
    </v-expand-transition>

    <v-expansion-panels class="mt-5" flat>
      <v-expansion-panel class="bg-transparent">
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
          <div class="widget-toggle">
            <v-btn
              v-for="item in orders_states"
              :key="item.code"
              :color="
                vendorOrder.delivery_state === item.code ? 'primary' : undefined
              "
              :loading="busy === item.code"
              :value="item.code"
              class="ma-1"
              rounded
              variant="flat"
              @click="setDeliveryStatus(item.code)"
            >
              <v-icon start>{{ item.icon }}</v-icon>
              {{ $t(item.name) }}
              <v-icon v-if="vendorOrder.delivery_state === item.code" end
                >check_circle
              </v-icon>
            </v-btn>
          </div>

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
        class="bg-transparent"
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

    <div
      v-if="
        volume && volume.width > 0 && volume.length > 0 && volume.height > 0
      "
      class="py-3 d-flex align-center"
    >
      <div class="p-3 me-2 border-end" title="Package">
        <v-icon size="36">aspect_ratio</v-icon>
      </div>

      <div class="mx-1 d-flex align-center">
        <div class="pa-1 rounded d-flex flex-column me-5 border">
          {{ delivery_info.weight }}
          <small>{{ $t("global.commons.weight") }}</small>
        </div>

        <div class="pa-1 rounded d-flex flex-column border me-1">
          {{ volume.width }}
          <small>{{ $t("global.commons.width") }}</small>
        </div>

        <div class="pa-1 rounded d-flex flex-column border me-1">
          {{ volume.length }}
          <small>{{ $t("global.commons.length") }}</small>
        </div>

        <div class="pa-1 rounded d-flex flex-column border me-1">
          {{ volume.height }}
          <small>{{ $t("global.commons.height") }}</small>
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

<script>
import BOrderCart from "../../cart/BOrderCart.vue";
import SOrderDeliveryStatusStepper from "../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UCube from "../../../../ui/cube/UCube.vue";
import BOrderVendorPaymentManagement from "../../../order/vendor/payment/BOrderVendorPaymentManagement.vue";
import { Basket } from "@selldone/core-js";

export default {
  name: "BOrderDashboardVendor",
  components: {
    BOrderVendorPaymentManagement,
    UCube,
    SOrderDeliveryStatusStepper,
    BOrderCart,
  },
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
