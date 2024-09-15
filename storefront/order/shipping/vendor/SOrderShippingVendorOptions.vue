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
  <s-cart-shipping-options
    :shop="shop"
    :basket="basket"
    :transportations="vendorShippingOption.transportations"
    v-model:transportation="transportation"
    :item-ids="vendorShippingOption.item_ids"
    :deliveryInfo="vendor_delivery_info"
    @set-basket-config="setBasketConfig"
    :weight="vendorShippingOption.weight"
    :volume="vendorShippingOption.volume"
    :distance="vendorShippingOption.distance"
    :cost="vendorShippingOption.cost"
    :warehouse="vendorShippingOption.warehouse"
    :selectedPickup="selected_pickup"
    @pickupSelected="selectPickup"
    pickup-item-bg-color="#f4ffed"
  ></s-cart-shipping-options>
</template>

<script lang="ts">
import SCartShippingOptions from "@app-storefront/pages/basket/cart/SCartShippingOptions.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

export default {
  name: "SOrderShippingVendorOptions",
  components: {
    SCartShippingOptions,
  },
  emits: ["set-basket-config"],
  props: {
    shop: {
      required: true,
      type: Object,
    },

    basket: {
      required: true,
      type: Object,
    },
    deliveryInfo: {
      required: true,
      type: Object,
    },

    vendorShippingOption: {
      required: true,
    },
  },
  data: () => ({
    transportation: null,
    vendor_delivery_info: {},
  }),

  watch: {
    deliveryInfo() {
      this.init();
    },
  },

  computed: {
    selected_pickup() {
      return this.deliveryInfo.type === ShopTransportations.Pickup.code &&
        this.transportation?.pickups
        ? this.transportation.pickups[0]
        : null;
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      if (
        !this.deliveryInfo.vendor_shippings ||
        !Array.isArray(this.deliveryInfo.vendor_shippings)
      )
        this.deliveryInfo.vendor_shippings = [];

      this.vendor_delivery_info = this.deliveryInfo.vendor_shippings?.find(
        (x) => x.vendor_id === this.vendorShippingOption.vendor_id,
      );

      if (!this.vendor_delivery_info) {
        this.vendor_delivery_info = {};
        this.deliveryInfo.vendor_shippings.push(this.vendor_delivery_info);
      }
    },
    setBasketConfig() {
      this.vendor_delivery_info.type = this.transportation.type;
      console.log(
        "Vendor Shipping Update",
        this.vendor_delivery_info,
        "vendor_shippings",
        this.deliveryInfo.vendor_shippings,
      );
      this.$emit("set-basket-config");
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pickup ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    selectPickup({ pickup, transportation }) {
      this.transportation = transportation;

      this.deliveryInfo.type = this.transportation?.type;

      this.setBasketConfig();
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-connect-shipping-options {
}
</style>
