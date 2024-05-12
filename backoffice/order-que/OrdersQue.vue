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
      class="flex-grow-1 d-flex"
    >
      <span :title="$t(item.name)" class="flex-grow-1">
        <v-icon :dark="dark" class="me-1" size="small"> {{ item.icon }}</v-icon>
        <b>
          {{ numeralFormat(getQueCountBasketsByType(item.code), "0,0") }}
        </b>
      </span>

      <v-icon
        v-if="index !== list.length - 1"
        :color="dark ? '#fff' : SaminColorLight"
        class="flex-grow-1 op-0-5"
      >
        {{ $t("icons.chevron_next") }}
      </v-icon>
    </div>

    <span v-if="!list.length" class="ma-auto"
      ><v-icon :dark="dark" class="me-1">emoji_food_beverage</v-icon>
      {{ $t("global.commons.auto") }}</span
    >
  </div>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { PhysicalOrderStates } from "@selldone/core-js/enums/basket/PhysicalOrderStates";
import { VirtualOrderStates } from "@selldone/core-js/enums/basket/VirtualOrderStates";

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
          PhysicalOrderStates.CheckQueue,
          PhysicalOrderStates.OrderConfirm,
          PhysicalOrderStates.PreparingOrder,
          PhysicalOrderStates.SentOrder,
        ];
      else if (this.type === ProductType.VIRTUAL.code)
        return [
          VirtualOrderStates.CheckQueue,
          VirtualOrderStates.OrderConfirm,
          VirtualOrderStates.PreparingOrder,
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
