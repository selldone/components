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
  <div class="s--shop-hyper-customer-orders-list border-between-vertical">
    <p v-if="orders.length" class="subtitle-2 text-start border-0">
      {{ $t("avocado.last_orders") }}
      :
    </p>
    <router-link
      v-for="item in orders"
      :key="item.id"
      class="subtitle-2 px-1 py-1 row-hover pointer-pointer black--text d-flex flex-column justify-content-center"
      :to="{ name: 'HyperOrderPage', params: { basket_id: item.id } }"
      style="min-height: 120px"
    >
      <div class="d-flex align-items-center">
        <img
          src="../../../../core/enums/product/assets/product-types/basket-hyper.svg"
          width="48"
          height="48"
          class="ms-1 me-2 flex-grow-0 my-3"
        />

        <div class="flex-grow-1 w-50 text-start">
          <b class="d-block text-ellipsis">{{ item.title }}</b>
          <span class="small d-block text-ellipsis">{{ item.message }}</span>

          <div class="border-between d-flex text-center my-1">
            <b class="w-50 english-field avocado-code highlight-yellow">HYP-{{ item.id }}</b>

            <small class="w-50" :title="getLocalTimeString(item.created_at)">{{
              getFromNowString(item.created_at)
            }}</small>
          </div>
          <v-progress-linear
            v-if="item.progress > 1"
            :value="item.progress"
            height="8"
            color="blue"
            rounded
            striped
            background-color="#eee"
          >
          </v-progress-linear>
        </div>
        <div class="flex-grow-1 text-center px-1" style="min-width: 50px">
          <order-status-view :status="item.status"></order-status-view>
        </div>
        <div
          class="font-weight-black flex-grow-1 text-center"
          style="min-width: 30%"
        >
          <price-view
            :amount="item.price"
            :currency="item.currency"
            not-show-zero
            class="d-block"
          ></price-view>

          <span
            v-if="item.status === BasketStatus.Reserved.code && !item.price"
          >
            <i class="fas fa-spinner fa-spin me-1"></i>

            {{ $t("avocado.pending_status") }}
          </span>

          <v-btn
            v-else-if="item.status === BasketStatus.Reserved.code && item.price"
            x-small
            depressed
            color="success"
          >
            <v-icon size="7" class="blink-me me-1">lens</v-icon>

            {{ $t("avocado.check_now") }}
          </v-btn>

          <v-icon
            v-if="item.status === BasketStatus.Payed.code"
            color="success"
            class="ms-1"
            >check</v-icon
          >
          <v-icon
            v-if="item.status === BasketStatus.Canceled.code"
            color="red"
            class="ms-1"
            >highlight_off</v-icon
          >
        </div>
      </div>
      <products-dense-images-circles    :ids="getProductsIDs(item)"></products-dense-images-circles>


      <status-stepper
        v-if="item.status === BasketStatus.Payed.code"
        :states="AvocadoOrderStates"
        :state="item.delivery_state"
        class="w-100 mb-5 mt-2"
        show-caption
      />
    </router-link>
  </div>
</template>

<script>
import OrderStatusView from "@components/backoffice/basket/OrderStatusView.vue";
import { AvocadoOrderStates } from "../../../../core/enums/avocado/AvocadoOrderStates";
import StatusStepper from "@components/storefront/order/order-status/StatusStepper.vue";
import { BasketStatus } from "../../../../core/enums/basket/BasketStatus";
import ProductsDenseImagesCircles
  from "@components/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";

export default {
  name: "SShopHyperCustomerOrdersList",
  components: {ProductsDenseImagesCircles, StatusStepper, OrderStatusView },
  props: {
    orders: {},
  },

  data: () => ({
    busy_delete: null,
    AvocadoOrderStates: AvocadoOrderStates,
    BasketStatus: BasketStatus,
  }),

  methods: {
    getProductsIDs(basket) {
      const out = [];
        basket.items.forEach((item) => {
          if (!out.includes("" + item.product_id))
            out.push("" + item.product_id);
        });
      return out;
    },

  },
};
</script>

<style scoped lang="scss">


/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-hyper-customer-orders-list{

}


/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.s--shop-hyper-customer-orders-list{
  .avocado-code{
    min-width: min-content;

    font-weight: 300;
    font-size: 1.2rem;
  }
}

</style>
