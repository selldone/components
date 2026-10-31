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
    :class="
      modern
        ? 'sd-modern-widget b-order-service-billing-modern'
        : { '-activated': in_this_step, 'widget shadow m-3': true }
    "
    class="text-start"
  >
    <u-widget-header
      v-if="modern"
      icon="design_services"
      :title="$t('process_center.modern.service_details_title')"
      class="sd-modern-form-header b-order-service-billing-modern__header"
    >
      <template #append-actions>
        <v-btn
          variant="text"
          color="primary"
          class="sd-modern-button sd-modern-button--inline"
          @click="copyToClipboard(customer_order_page)"
        >
          <v-icon start size="16" aria-hidden="true">content_copy</v-icon
          >{{ $t("process_center.modern.service_customer_order_link") }}
          <v-tooltip
            activator="parent"
            location="top"
            :open-on-focus="true"
            content-class="sd-modern-tooltip text-start"
            >{{
              $t("process_center.modern.service_customer_order_link_help")
            }}</v-tooltip
          >
        </v-btn>
      </template>
    </u-widget-header>
    <p
      v-if="modern"
      class="sd-modern-subtitle b-order-service-billing-modern__subtitle"
    >
      <span>{{ $t("process_center.modern.service_details_subtitle") }}</span>
      <v-tooltip
        location="top"
        :open-on-focus="true"
        :open-on-click="true"
        content-class="sd-modern-tooltip text-start"
      >
        <template #activator="{ props }"
          ><v-btn
            v-bind="props"
            icon="info_outline"
            variant="text"
            class="sd-modern-icon-button sd-modern-info-button"
            :aria-label="$t('process_center.modern.service_details_title')"
        /></template>
        {{ $t("process_center.modern.service_details_help") }}
      </v-tooltip>
    </p>
    <v-expansion-panels
      v-else
      class="mb-5 rounded-18px overflow-hidden text-start"
    >
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

    <div
      :class="
        modern
          ? 'b-order-service-billing-modern__items'
          : 'border-between-vertical'
      "
    >
      <service-billing-item
        v-for="item in items"
        :key="item.id"
        :basket="basket"
        :initial-expand="in_this_step"
        :item="item"
        :product="item.product"
        :shop="shop"
        :modern="modern"
        editing
        view-only-progress
      ></service-billing-item>
    </div>
  </div>
</template>

<script lang="ts">
import ServiceBillingItem from "../../../../storefront/order/billing/ServiceBillingItem.vue";
import { Basket, ShopURLs } from "@selldone/core-js";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BOrderDashboardServiceBilling",
  components: { ServiceBillingItem, UWidgetHeader },
  props: {
    modern: { type: Boolean, default: false },
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

<style lang="scss" scoped>
.b-order-service-billing-modern {
  &.sd-modern-widget {
    padding: 20px;
    margin-block-end: 18px;
    border-radius: 16px;
    font-family: inherit;
    font-size: 12px;
    line-height: 18px;
  }
  &__header {
    margin-block-end: 0;
  }
  &__header :deep(h2) {
    font-family: inherit;
    font-size: 18px;
    line-height: 24px;
    font-weight: 500;
  }
  &__subtitle {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 4px 0 20px;
    font-size: 12px;
    line-height: 18px;
  }
  &__items {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
  @media (max-width: 600px) {
    &.sd-modern-widget {
      padding: 17px 13px;
    }
  }
}
</style>
