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
    class="s--storefront-avocado-customer-order-list border-between-vertical"
  >
    <p v-if="orders.length" class="text-subtitle-2 text-start border-0">
      {{ $t("avocado.last_orders") }}
      :
    </p>
    <router-link
      v-for="item in orders"
      :key="item.id"
      :to="{ name: 'AvocadoOrderPage', params: { hash: item.hash } }"
      class="text-subtitle-2 px-1 row-hover pointer-pointer d-flex flex-column justify-center"
      style="
        min-height: 120px;
        color: #000;
        padding-top: 32px;
        padding-bottom: 32px;
      "
    >
      <div class="d-flex align-items-center">
        <img
          class="ms-1 me-2 flex-grow-0 my-3"
          height="48"
          src="@selldone/core-js/assets/order-types/basket-avocado.svg"
          width="48"
        />

        <div class="flex-grow-1 w-50 text-start">
          <b class="d-block text-ellipsis">{{ item.title }}</b>
          <span class="small d-block text-ellipsis">{{ item.message }}</span>

          <div class="border-between d-flex text-center my-1">
            <b class="w-50 english-field avocado-order-code highlight-yellow"
              >AVO-{{ item.id }}</b
            >

            <small :title="getLocalTimeString(item.created_at)" class="w-50">{{
              getFromNowString(item.created_at)
            }}</small>
          </div>
          <v-progress-linear
            v-if="item.progress > 1"
            :model-value="item.progress"
            bg-color="#eee"
            color="blue"
            height="8"
            rounded
            striped
          >
          </v-progress-linear>
        </div>

        <div class="flex-grow-1 text-center px-1" style="min-width: 50px">
          <s-order-status-view :status="item.status"></s-order-status-view>
        </div>
        <div
          class="font-weight-black flex-grow-1 text-center"
          style="min-width: 30%"
        >
          <u-price
            :amount="item.price"
            :currency="item.currency"
            class="d-block"
            not-show-zero
          ></u-price>

          <span
            v-if="item.status === BasketStatus.Reserved.code && !item.price"
          >
            <i class="fas fa-spinner fa-spin me-1"></i>

            {{ $t("avocado.pending_status") }}
          </span>

          <v-btn
            v-else-if="item.status === BasketStatus.Reserved.code && item.price"
            color="success"
            size="x-small"
            variant="flat"
          >
            <v-icon class="blink-me me-1" size="7">lens</v-icon>

            {{ $t("avocado.check_now") }}
          </v-btn>

          <v-icon
            v-if="item.status === BasketStatus.Payed.code"
            class="ms-1"
            color="success"
            >check
          </v-icon>
          <v-icon
            v-if="item.status === BasketStatus.Canceled.code"
            class="ms-1"
            color="red"
            >highlight_off
          </v-icon>
        </div>
      </div>

      <products-dense-images-circles
        v-if="item.items && item.items.some((i) => i.image)"
        :ids="getItemsImages(item)"
        raw-images-path
      ></products-dense-images-circles>

      <s-order-delivery-status-stepper
        v-if="item.status === BasketStatus.Payed.code"
        :state="item.delivery_state"
        :states="AvocadoOrderStates"
        class="w-100 mb-5 mt-2"
        show-caption
      />
    </router-link>
  </div>
</template>

<script>
import SOrderStatusView from "../../../storefront/order/order-status/SOrderStatusView.vue";
import SOrderDeliveryStatusStepper from "../../../storefront/order/shipping/stepper/SOrderDeliveryStatusStepper.vue";
import ProductsDenseImagesCircles from "../../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import { Avocado, Basket } from "@selldone/core-js";

export default {
  name: "SStorefrontAvocadoCustomerOrderList",
  components: {
    ProductsDenseImagesCircles,
    SOrderDeliveryStatusStepper,
    SOrderStatusView,
  },
  props: {
    orders: {},
  },

  data: () => ({
    busy_delete: null,
    AvocadoOrderStates: Avocado.DeliveryStates,
    BasketStatus: Basket.Status,
  }),

  methods: {
    getItemsImages(basket) {
      const out = [];
      basket.items.forEach((item) => {
        if (item.image) out.push(item.image);
      });
      return out;
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

.s--storefront-avocado-customer-order-list {
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--storefront-avocado-customer-order-list {
  .avocado-order-code {
    min-width: min-content;

    font-weight: 300;
    font-size: 1.2rem;
  }
}
</style>
