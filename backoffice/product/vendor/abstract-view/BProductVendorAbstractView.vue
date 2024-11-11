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
  <s-widget-box
    v-if="vendor"
    :title="$t('global.commons.vendor')"
    icon="storefront"
    :sub-title="$t('product_vendor_profile.vendor.subtitle')"
  >
    <b-product-vendor-abstract-view-item
      :shop="shop"
      :vendor="vendor"
      is-owner
    ></b-product-vendor-abstract-view-item>
  </s-widget-box>

  <s-widget-box
    v-else-if="vendors?.length"
    :title="$t('global.commons.vendors')"
    icon="storefront"
    :sub-title="$t('product_vendor_profile.vendors.subtitle') "
  >
    <div class="border-between-vertical">
      <b-product-vendor-abstract-view-item
        v-for="_vendor in vendors"
        :key="_vendor.id"
        :shop="shop"
        :vendor="_vendor"
        class="mb-1"
      ></b-product-vendor-abstract-view-item>
    </div>
  </s-widget-box>
</template>

<script lang="ts">
import BProductVendorAbstractViewItem from "../../../product/vendor/abstract-view/item/BProductVendorAbstractViewItem.vue";
import SWidgetBox from "../../../../ui/widget/box/SWidgetBox.vue";

export default {
  name: "BProductVendorAbstractView",
  components: { SWidgetBox, BProductVendorAbstractViewItem },
  props: {
    shop: {
      required: true,
    },

    product: {
      required: true,
    },
  },
  data: () => ({}),
  computed: {
    vendor() {
      // Single vendor product mode. Vendors access only to their product in the vendor pane, so vendor is equal to product vendor!
      return this.product.vendor;
    },
    vendors() {
      // Multi vendors product mode.
      return this.product.vendors;
    },
  },

  watch: {},

  created() {},

  methods: {},
};
</script>

<style scoped></style>
