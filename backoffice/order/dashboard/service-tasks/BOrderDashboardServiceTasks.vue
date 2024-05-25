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
    :class="{ '-activated': in_this_step, disabled: !is_active }"
    class="widget shadow m-3"
  >
    <div class="widget-buttons w-100">
      <v-btn
        v-if="can_start"
        :loading="busy_start"
        color="primary"
        size="x-large"
        @click="
          busy_start = true;
          $emit('confirm-preparing', {
            callback: () => {
              busy_start = false;
            },
          });
        "
      >
        <v-icon start>play_arrow</v-icon>
        {{ $t("service_bill.start_service") }}
      </v-btn>
    </div>

    <div class="border-between-vertical">
      <service-billing-item
        v-for="item in items"
        :key="item.id"
        :basket="basket"
        :initial-expand="in_this_step"
        :item="item"
        :product="item.product"
        :shop="shop"
      ></service-billing-item>
    </div>

    <div class="widget-buttons w-100">
      <v-btn
        v-if="can_end"
        :loading="busy_end"
        color="red"
        size="x-large"
        @click="finish()"
      >
        <v-icon start>stop</v-icon>
        {{ $t("service_bill.end_service") }}
      </v-btn>
    </div>
  </div>
</template>

<script>
import ServiceBillingItem from "../../../../storefront/order/billing/ServiceBillingItem.vue";
import { Basket } from "@selldone/core-js";

export default {
  name: "BOrderDashboardServiceTasks",
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
    return {
      busy_start: false,
      busy_end: false,

      ServiceOrderStates: Basket.ServiceOrderStates,
    };
  },

  computed: {
    can_start() {
      return (
        this.basket.delivery_state ===
        Basket.ServiceOrderStates.OrderConfirm.code
      );
    },
    can_end() {
      return (
        this.basket.delivery_state ===
        Basket.ServiceOrderStates.PreparingOrder.code
      );
    },

    items() {
      return this.basket.items;
    },

    is_active() {
      return this.basket.status === Basket.Status.Payed.code;
    },
    in_this_step() {
      return (
        this.basket.status === Basket.Status.Payed.code &&
        this.basket.delivery_state ===
          Basket.ServiceOrderStates.PreparingOrder.code
      );
    },
  },
  methods: {
    finish() {
      this.openConfirmationAlert(
        this.$t("service_tasks.notification_finish.title"),
        this.$t("service_tasks.notification_finish.message"),
        this.$t("service_tasks.notification_finish.action"),
        () => {
          this.busy_end = true;
          this.$emit("confirm-finish", {
            callback: () => {
              this.busy_end = false;
            },
          });
        },
      );
    },
  },
  created() {},
};
</script>

<style scoped></style>
