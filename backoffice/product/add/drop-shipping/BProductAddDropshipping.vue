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
  <div>
    <!-- --------------------------------------- STEP 1 : Select Shop ---------------------------------- -->
    <template v-if="!selected_shop">
      <b-product-add-dropshipping-shops
        :shop="shop"
        @select="showStore"
      ></b-product-add-dropshipping-shops>
    </template>
    <b-product-add-dropshipping-products
      v-else
      :shop="shop"
      @back="selected_shop = null"
      :wholesaler-shop="selected_shop"
    ></b-product-add-dropshipping-products>
    <!-- --------------------------------------- STEP 2 : Select Product ---------------------------------- -->
  </div>
</template>

<script>
import BProductAddDropshippingShops from "@selldone/components-vue/backoffice/product/add/drop-shipping/shops/BProductAddDropshippingShops.vue";
import BProductAddDropshippingProducts from "@selldone/components-vue/backoffice/product/add/drop-shipping/products/BProductAddDropshippingProducts.vue";

export default {
  name: "BProductAddDropshipping",
  components: {
    BProductAddDropshippingProducts,
    BProductAddDropshippingShops,
  },
  props: {
    shop: {
      required: true,
    },
  },
  data: () => ({
    selected_shop: null,
  }),

  computed: {},
  watch: {},

  created() {},

  methods: {
    showStore(drop_shop) {
      this.selected_shop = drop_shop;
    },
  },
};
</script>

<style scoped></style>
