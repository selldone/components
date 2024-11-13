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
  <div :class="{ '-activated': in_this_step }" class="widget shadow m-3">
    <v-expansion-panels class="mb-5 rounded-18px overflow-hidden text-start" >
      <v-expansion-panel elevation="0">
        <v-expansion-panel-title>
          <div>
            <v-icon class="me-2" color="#111">help</v-icon>
            How to process this order?
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <ol>
            <li>
              Review and <b>set prices</b> for all basket items. Confirm their
              availability or make changes as needed.
            </li>
            <li>
              In the payment section, click '<b>Add New Bill</b>' to generate
              one or more bills.
            </li>
            <li>
              Direct the customer to the order page to pay the bill(s). The
              customer order page is <i>{{ customer_order_page }}</i>
              <v-icon
                class="mx-1"
                size="small"
                @click="copyToClipboard(customer_order_page)"
                >file_copy
              </v-icon>
            </li>
            <li>
              Once the order is paid, provide the service and keep the order
              progress updated here.
            </li>
          </ol>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="border-between-vertical">
      <service-billing-item
        v-for="item in items"
        :key="item.id"
        :basket="basket"
        :initial-expand="in_this_step"
        :item="item"
        :product="item.product"
        :shop="shop"
        editing
        view-only-progress
      ></service-billing-item>
    </div>
  </div>
</template>

<script lang="ts">
import ServiceBillingItem from "../../../../storefront/order/billing/ServiceBillingItem.vue";
import {Basket, ShopURLs} from "@selldone/core-js";

export default {
  name: "BOrderDashboardServiceBilling",
  components: { ServiceBillingItem },
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
    return {};
  },

  computed: {
    items() {
      return this.basket.items;
    },

    in_this_step() {
      return (
        this.basket.status === Basket.Status.Reserved.code &&
        this.basket.delivery_state ===
          Basket.ServiceOrderStates.CheckQueue.code &&
        this.in_service_billing_state
      );
    },
    /**
     * Service pre checkout step:
     * All items must have service_item (set by seller in the service billing state)
     * @returns {boolean|*}
     */
    in_service_billing_state() {
      return this.items.some((it) => !it.service_item?.id);
    },

    customer_order_page() {
      return (
          ShopURLs.MainShopUrl(this.shop) +
        `/orders/service/${this.getBasketOrderCode(this.basket)}`
      );
    },
  },
  methods: {},
  created() {},
};
</script>

<style scoped></style>
