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
  <section v-if="modern && (vendor || vendors?.length)" class="sd-modern-widget b-product-vendor-refined text-start">
    <header class="sd-modern-header">
      <div class="sd-modern-title">
        <span class="sd-modern-icon sd-modern-icon--plain"><v-icon>storefront</v-icon></span>
        <div><h2 class="sd-modern-title-text">{{ $t(vendor ? 'global.commons.vendor' : 'global.commons.vendors') }}</h2><p class="sd-modern-subtitle">{{ $t(vendor ? 'product_vendor_profile.vendor.subtitle' : 'product_vendor_profile.vendors.subtitle') }}</p></div>
      </div>
    </header>
    <b-product-vendor-abstract-view-item v-if="vendor" :shop="shop" :vendor="vendor" modern is-owner />
    <div v-else class="b-product-vendor-refined__list"><b-product-vendor-abstract-view-item v-for="item in vendors" :key="item.id" :shop="shop" :vendor="item" modern /></div>
  </section>
  <s-widget-box
    v-else-if="vendor"
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
    modern: Boolean,
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

<style lang="scss" scoped>
.b-product-vendor-refined.sd-modern-widget {
  padding: 22px;
  border-radius: 15px;
  .sd-modern-header { margin-block-end: 18px; align-items: flex-start; }
  .sd-modern-title { gap: 10px; }
  .sd-modern-title-text { font-size: 16px; font-weight: 500; line-height: 24px; }
  .sd-modern-subtitle { font-size: 12px; line-height: 19px; margin-block-start: 3px; }
  .sd-modern-icon--plain { width: 18px; height: 22px; flex-basis: 18px; :deep(.v-icon) { font-size: 16px; } }
  .b-product-vendor-refined__list { display: grid; gap: 8px; }
}
@media (max-width: 560px) { .b-product-vendor-refined.sd-modern-widget { padding: 16px 12px; border-radius: 12px; } }
</style>
