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
  <s-cart-shipping-options
    :shop="shop"
    :basket="basket"
    :transportations="storeShippingOption.transportations"
    v-model:transportation="transportation"
    :item-ids="storeShippingOption.item_ids"
    :deliveryInfo="deliveryInfo"
    @set-basket-config="setBasketConfig"
    :weight="storeShippingOption.weight"
    :volume="storeShippingOption.volume"
    :distance="storeShippingOption.distance"
    :cost="storeShippingOption.cost"
    :warehouse="storeShippingOption.warehouse"
    :selectedPickup="selected_pickup"
    @pickupSelected="selectPickup"
  ></s-cart-shipping-options>
</template>

<script lang="ts">
import SCartShippingOptions from "@app-storefront/pages/basket/cart/SCartShippingOptions.vue";
import { ShopTransportations } from "@selldone/core-js/enums/logistic/ShopTransportations";

export default {
  name: "SOrderShippingStoreOptions",
  components: {
    SCartShippingOptions,
  },
  emits: ["set-basket-config", "pickupSelected"],
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

    dark: {
      default: false,
      type: Boolean,
    },
    storeShippingOption: {
      required: true,
    },
  },
  data: () => ({
    transportation: null,
  }),

  watch: {
    deliveryInfo() {
      this.init();
    },
  },

  computed: {
    selected_pickup() {
      return (
        this.deliveryInfo.type === ShopTransportations.Pickup.code &&
        this.basket.receiver_info
      );
    },
  },

  created() {
    this.init();
  },

  methods: {
    init() {
      // No need for now! We just support one warehouse (origin) for shipping directly from store.
    },
    setBasketConfig() {
      this.deliveryInfo.type = this.transportation.type;
      console.log("Store Shipping Update", this.deliveryInfo);
      this.$emit("set-basket-config");
    },

    // ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pickup ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅
    selectPickup({ pickup, transportation }) {
      this.transportation = transportation;
      // console.log('selectPickup',pickup_address)
      this.basket.receiver_info = Object.assign({}, pickup);
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
