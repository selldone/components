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
  <div
    v-if="vendor_shipping_options?.length"
    class="s--order-shipping-vendors-options"
  >
    <div
      v-for="(vendor_shipping_option, i) in vendor_shipping_options"
      :key="vendor_shipping_option.vendor_id"
    >
      <div
          class="spacer-line my-3"
          :caption="`${$t('global.commons.package')} ${startPackageIndex + i + 1}`"
      />

      <s-order-shipping-vendor-options
        :basket="basket"
        :vendorShippingOption="vendor_shipping_option"
        @set-basket-config="$emit('set-basket-config')"
        :deliveryInfo="deliveryInfo"
      ></s-order-shipping-vendor-options>
    </div>
  </div>
</template>

<script lang="ts">
import SOrderShippingVendorOptions from "@selldone/components-vue/storefront/order/shipping/vendor/SOrderShippingVendorOptions.vue";

export default {
  name: "SOrderShippingVendorsOptions",
  components: {
    SOrderShippingVendorOptions,
  },
  inject: ["$shop"],
  emits: ["set-basket-config"],
  props: {
    basket: {
      required: true,
      type: Object,
    },

    deliveryInfo: {
      required: true,
      type: Object,
    },
    startPackageIndex: {
      default: 0,
    },
  },
  data: () => ({}),

  watch: {},

  computed: {
    bill() {
      return this.basket?.bill;
    },
    vendor_shipping_options() {
      return this.bill?.vendor_shipping_options;
    },
  },

  created() {},

  methods: {},
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
