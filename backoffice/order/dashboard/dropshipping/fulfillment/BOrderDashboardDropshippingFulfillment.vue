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
  <div
    :class="{ '-activated': in_this_step }"
    class="widget shadow my-3 mx-1 mx-md-3"
  >
    <div class="d-flex align-center">
      <h2>
        <img
          class="me-1"
          height="24"
          src="../../../../../assets/icons/dropshipping.svg"
          width="24"
        />
        {{ $t("fulfilment_order_widget.title") }}
      </h2>
      <v-spacer></v-spacer>
      <small
        :title="'Creation date: ' + getLocalTimeString(fulfillment.reserved_at)"
        class="text-capitalize"
      >
        {{ getFromNowString(fulfillment.reserved_at) }}</small
      >
    </div>

    <p
      class="text-start mt-2"
      v-html="$t('fulfilment_order_widget.message')"
    ></p>

    <!-- Main seller shop info -->
    <v-row>
      <v-col class="text-start" cols="12" md="6">
        <v-avatar size="36">
          <img :src="getShopImagePath(fulfillment.shop.icon)" />
        </v-avatar>
        <a
          :href="getShopMainUrl(fulfillment.shop)"
          class="link-dash ms-1"
          target="_blank"
        >
          {{ fulfillment.shop.title }}
        </a>
      </v-col>
      <v-col cols="12" md="6">
        <s-order-delivery-status-stepper
          :state="fulfillment.delivery_state"
          :states="PhysicalOrderStates"
          class="my-1"
          color="#0288D1"
          dark-color="#0288D1"
          show-caption
        />
      </v-col>
    </v-row>

    <div
      class="expand-button mb-2 mt-4 p-3 widget-hover rounded position-relative pointer-pointer"
      @click="force_show_items = !force_show_items"
    >
      <span class="absolute-top-end text-muted px-2 small"
        ><i
          :class="
            force_show_items ? 'fa:fas fa-angle-up' : 'fa:fas fa-angle-down'
          "
          class="mx-1"
        />{{ $t("fulfilment_order_widget.list_of_items") }}
      </span>

      <div class="d-flex my-2">
        <v-badge
          v-for="item in items"
          :key="item.id"
          :color="item.check ? 'green' : 'amber'"
          class="m-2"
          floating
        >
          <template v-slot:badge>{{ item.count }}</template>
          <v-avatar>
            <img :src="getProductImage(item.product_id)" />
          </v-avatar>
        </v-badge>
      </div>
    </div>

    <v-expand-transition>
      <b-order-cart
        v-show="force_show_items"
        :items="items"
        :select-all="initial_select_all"
        :shop="shop"
        :type="basket.type"
        class="pb-4"
      />
    </v-expand-transition>

    <!-- Step 2 : Order Confirmation -->
    <div class="text-start">
      <v-btn
        v-if="!isPayed"
        :color="!isCheck ? 'primary' : 'success'"
        :loading="busy"
        :size="!isCheck ? 'x-large' : undefined"
        :variant="isCheck ? 'outlined' : undefined"
        class="mt-2"
        rounded
        @click="fulfillmentConfirm(!isCheck)"
      >
        <v-icon v-if="isCheck" class="me-2" color="green">check</v-icon>
        <v-icon v-else class="me-2 blink-me" size="small"
          >fiber_manual_record
        </v-icon>

        {{
          !isCheck
            ? $t("fulfilment_order_widget.check_action")
            : $t("fulfilment_order_widget.uncheck_action")
        }}
      </v-btn>

      <ul class="tips mt-4">
        <li
          v-for="item in $tm('fulfilment_order_widget.checklist')"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>

      <v-btn
        v-if="isCheck"
        :disabled="isPayed"
        :rounded="!isPayed"
        :size="!isPayed ? 'x-large' : undefined"
        :to="IS_VENDOR_PANEL?{}:{ name: 'BPageShopFinanceResellerFulfillment' }"
        :variant="isPayed ? 'text' : 'flat'"
        class="mt-2"
        color="blue"
      >
        <v-icon v-if="!isPayed" class="me-2 blink-me" size="small"
          >fiber_manual_record
        </v-icon>
        <v-icon v-else class="me-2">check</v-icon>
        {{
          isPayed
            ? $t("fulfilment_order_widget.pay_completed")
            : $t("fulfilment_order_widget.pay_action")
        }}
      </v-btn>
    </div>

    <!-- Step 3 : Shipping tracking code -->

    <div
      v-if="tracking_code || tracking_url"
      class="d-flex border-between align-items-center"
    >
      <div class="p-3 me-2">
        <img
          height="36"
          src="../../../../../assets/icons/track-courier.svg"
          width="36"
        />
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
import BOrderCart from "../../../cart/BOrderCart.vue";
import { PhysicalOrderStates } from "@selldone/core-js/enums/basket/PhysicalOrderStates";
import { BasketStatus } from "@selldone/core-js/enums/basket/status/BasketStatus";
import SOrderDeliveryStatusStepper from "../../../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";

export default {
  name: "BOrderDashboardDropshippingFulfillment",
  components: { SOrderDeliveryStatusStepper, BOrderCart },
  props: {
    shop: {
      require: true,
      type: Object,
    },
    fulfillment: {
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
      PhysicalOrderStates: PhysicalOrderStates,
      force_show_items: false,
      busy: false,
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

    items() {
      return this.basket.items.filter(
        (item) => item.fulfillment_id === this.fulfillment.id,
      );
    },

    checked() {
      return [
        PhysicalOrderStates.OrderConfirm.code,
        PhysicalOrderStates.PreparingOrder.code,
        PhysicalOrderStates.SentOrder.code,
        PhysicalOrderStates.ToCustomer.code,
      ].includes(this.fulfillment.delivery_state);
    },
    in_this_step() {
      return !this.isPayed;
    },

    initial_select_all() {
      return (
        this.fulfillment.delivery_state ===
        this.PhysicalOrderStates.CheckQueue.code
      );
    },

    isCheck() {
      return !!this.fulfillment.check_at;
    },

    isPayed() {
      return this.fulfillment.status === BasketStatus.Payed.code;
    },

    showItems() {
      if (this.force_show_items) return true;
      if (!this.fulfillment) return false;
      return (
        this.fulfillment.delivery_state ===
          this.PhysicalOrderStates.CheckQueue.code ||
        this.fulfillment.delivery_state ===
          this.PhysicalOrderStates.PreparingOrder.code
      );
    },

    delivery_info() {
      return this.fulfillment.delivery_info;
    },
    tracking_code() {
      if (!this.delivery_info) return null;
      return this.delivery_info.tracking_code;
    },
    tracking_url() {
      if (!this.delivery_info) return null;
      return this.delivery_info.tracking_url;
    },
  },
  methods: {
    fulfillmentConfirm(check) {
      this.busy = true;

      this.$emit("confirm-fulfillment", {
        fulfillment: this.fulfillment,
        check: check,
        callback: () => {
          this.busy = false;
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
