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
  <div class="d-flex justify-content-between align-items-center text-center">
    <div
      v-for="(item, index) in list"
      :key="item.code"
      :title="$t(item.name)"
      class="flex-grow-1 d-flex align-center"
    >
      <span :title="$t(item.name)" class="flex-grow-1">
        <v-icon class="me-1" size="16"> {{ item.icon }}</v-icon>
        <b>
          {{ numeralFormat(getQueCountBasketsByType(item.code), "0,0") }}
        </b>
      </span>

      <v-icon
        v-if="index !== list.length - 1"
        :color="dark ? '#fff' : '#000'"
        class="flex-grow-1 op-0-7 flip-rtl"
        size="16"
      >
        trending_flat
      </v-icon>
    </div>

    <span v-if="!list.length" class="ma-auto"
      ><v-icon class="me-1">emoji_food_beverage</v-icon>
      {{ $t("global.commons.auto") }}</span
    >
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { Basket } from "@selldone/core-js";

export default {
  name: "OrdersQue",
  props: {
    orderQue: {
      required: true,
      type: Array,
    },
    type: {
      required: true,
      type: String,
    },
    dark: {
      deafult: false,
      type: Boolean,
    },
  },

  computed: {
    list() {
      if (this.type === ProductType.PHYSICAL.code || this.type === "AVO")
        return [
          Basket.PhysicalOrderStates.CheckQueue,
          Basket.PhysicalOrderStates.OrderConfirm,
          Basket.PhysicalOrderStates.PreparingOrder,
          Basket.PhysicalOrderStates.SentOrder,
        ];
      else if (this.type === ProductType.VIRTUAL.code)
        return [
          Basket.VirtualOrderStates.CheckQueue,
          Basket.VirtualOrderStates.OrderConfirm,
          Basket.VirtualOrderStates.PreparingOrder,
        ];
      else if (this.type === ProductType.FILE.code) return [];

      return [];
    },
  },
  methods: {
    getQueCountBasketsByType(delivery_state) {
      let order_que = this.orderQue.find((basket) => {
        return (
          (basket.type === this.type || this.type === "AVO") &&
          basket.delivery_state === delivery_state
        );
      });
      return order_que ? order_que.count : 0;
    },
  },
};
</script>

<style scoped></style>
