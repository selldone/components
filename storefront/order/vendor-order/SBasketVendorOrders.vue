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
    class="s--basket-vendor-orders widget shadow my-3 mx-0 mx-md-3"
    v-if="vendor_orders"
  >
    <s-basket-vendor-order-item
      v-for="v in vendor_orders"
      :key="v.id"
      :basket="basket"
      :vendor-order="v"
    ></s-basket-vendor-order-item>
  </div>
</template>

<script lang="ts">
import TemplateMixin from "@selldone/components-vue/mixin/template/TemplateMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import SBasketVendorOrderItem from "@selldone/components-vue/storefront/order/vendor-order/SBasketVendorOrderItem.vue";

export default {
  name: "SBasketVendorOrders",
  mixins: [TemplateMixin, DateMixin],

  components: {
    SBasketVendorOrderItem,
  },
  inject: ["$shop"],
  props: {
    basket: {
      require: true,
      type: Object,
    },
  },

  data: function () {
    return {};
  },

  computed: {
    vendor_orders() {
      return this.basket?.vendor_orders;
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

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--basket-vendor-orders {
  text-align: start;
}
</style>
