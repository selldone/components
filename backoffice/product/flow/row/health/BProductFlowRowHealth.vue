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
  <v-list-item
    :prepend-avatar="
      product.icon ? getShopImagePath(product.icon, 64) : undefined
    "
    :prepend-icon="product.icon ? undefined : 'add_photo_alternate'"
    :title="`Product Health ● ${product.title}`"
  >
    <template v-slot:subtitle>
      <div v-if="product.quantity > 0 && !isFile">
        <v-icon class="me-1" color="green">check_circle</v-icon>
        Product is available in stock.
      </div>
      <div v-else-if="!isFile">
        <v-icon class="me-1" color="red">cancel</v-icon>
        Product is out of stock.
      </div>
      <div v-else-if="isFile">
        <template v-if="files_count">
          <v-icon class="me-1" color="green">check_circle</v-icon>
          {{ files_count }} files with total
          {{ numeralFormat(files_size * 1024, "0.[0] ib") }} uploaded for this
          product.
        </template>
        <template v-else>
          <v-icon class="me-1" color="red">cancel</v-icon>
          No file has been uploaded yet.
        </template>
      </div>

      <div v-if="!product.icon">
        <v-icon class="me-1" color="red">cancel</v-icon>
        Upload a product image to make it more attractive.
      </div>
    </template>
  </v-list-item>
</template>

<script>
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default {
  name: "BProductFlowRowHealth",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
  },

  data: function () {
    return {};
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
          this.$route.params.vendor_id &&
          this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    isFile() {
      return this.product.type === ProductType.FILE.code;
    },

    files_count() {
      return this.product?.files?.length;
    },
    files_size() {
      return this.product?.files?.sumByKey("size");
    },
  },

  methods: {},
};
</script>

<style lang="scss" scoped></style>
