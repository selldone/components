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
    :class="{ '-activated my-12': in_this_step }"
    class="s--shop-service-tasks widget shadow my-3 mx-0 mx-md-3"
  >
    <div class="border-between-vertical">
      <service-billing-item
        v-for="item in items"
        :key="item.id"
        :basket="basket"
        :initial-expand="
          in_this_step ||
          basket.delivery_state === ServiceOrderStates.ToCustomer.code
        "
        :item="item"
        :product="item.product"
        view-only-progress
      ></service-billing-item>
    </div>
  </div>
</template>

<script lang="ts">
import ServiceBillingItem from "../../../storefront/order/billing/ServiceBillingItem.vue";
import { Basket } from "@selldone/core-js";

export default {
  name: "SShopServiceTasks",
  components: { ServiceBillingItem },
  props: {
    basket: {
      require: true,
      type: Object,
    },
    items: {
      required: true,
      type: Array,
    },
  },

  data: function () {
    return {
      ServiceOrderStates: Basket.ServiceOrderStates,
    };
  },

  computed: {
    in_this_step() {
      return (
        this.basket.status === Basket.Status.Payed.code &&
        this.basket.delivery_state ===
          Basket.ServiceOrderStates.PreparingOrder.code
      );
    },
  },
  methods: {},
  created() {},
};
</script>

<style scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-service-tasks {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-service-tasks {
}
</style>
