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
  <div class="widget shadow my-3 mx-1 mx-md-3">
    <u-widget-header icon="hub">
      <template v-slot:title>
        Connect <span class="text-gradient bg-desert-hump">OS</span>
      </template>
    </u-widget-header>

    <v-list-subheader class="px-0">
      {{ $t("order_connect_list.subtitle") }}
    </v-list-subheader>

    <div
      class="text-start border-between-vertical -dashed"
      style="--border-color: #999"
    >
      <b-order-connect-item
        v-for="connect_order in connect_orders"
        :key="connect_order.id"
        :basket="basket"
        :connect-order="connect_order"
        :shop="shop"
        @show-edit-address="(cb) => $emit('show-edit-address', cb)"
      >
      </b-order-connect-item>
    </div>
  </div>
</template>

<script lang="ts">
import BOrderConnectItem from "../../../order/connect/item/BOrderConnectItem.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default {
  name: "BOrderConnectsList",
  components: { UWidgetHeader, BOrderConnectItem },
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
    connect_orders() {
      return this.basket.connect_orders;
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>
