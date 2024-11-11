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
  <div>
    <!-- ███████████████████ Physical ███████████████████ -->

    <b-product-inventory-management-physical
      v-if="isPhysical"
      :for-studio="forStudio"
      :product="product"
      :shop="shop"
      :vendor="vendor"
      :withTrashed="withTrashed"
      @update:withTrashed="(val) => $emit('update:withTrashed', val)"
    ></b-product-inventory-management-physical>

    <!--  ███████████████████ Virtual ███████████████████ -->
    <b-product-inventory-management-virtual
      v-if="isVirtual"
      :product="product"
      :shop="shop"
      :vendor="vendor"
      :withTrashed="withTrashed"
      show-add-item
      show-filters
      @update:withTrashed="(val) => $emit('update:withTrashed', val)"
    ></b-product-inventory-management-virtual>

    <!--  ███████████████████ File ███████████████████ -->

    <b-product-inventory-management-file
      v-if="isFile"
      :for-studio="forStudio"
      :product="product"
      :shop="shop"
      :vendor="vendor"
    ></b-product-inventory-management-file>

    <!--  ███████████████████ Service ███████████████████ -->

    <b-product-inventory-management-service
      v-if="isService"
      :for-studio="forStudio"
      :product="product"
      :shop="shop"
      :vendor="vendor"
    ></b-product-inventory-management-service>

    <!--  ███████████████████ Subscription ███████████████████ -->

    <b-product-inventory-management-subscription
      v-if="isSubscription"
      :for-studio="forStudio"
      :product="product"
      :shop="shop"
      :vendor="vendor"
      :withTrashed="withTrashed"
      @update:withTrashed="(val) => $emit('update:withTrashed', val)"
    ></b-product-inventory-management-subscription>
  </div>
</template>

<script lang="ts">
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import BProductInventoryManagementVirtual from "../../../product/inventory/management/virtual/BProductInventoryManagementVirtual.vue";
import BProductInventoryManagementPhysical from "../../../product/inventory/management/physical/BProductInventoryManagementPhysical.vue";
import BProductInventoryManagementFile from "../../../product/inventory/management/file/BProductInventoryManagementFile.vue";
import BProductInventoryManagementService from "../../../product/inventory/management/service/BProductInventoryManagementService.vue";
import BProductInventoryManagementSubscription from "../../../product/inventory/management/subscription/BProductInventoryManagementSubscription.vue";

export default {
  name: "BProductInventoryManagement",
  components: {
    BProductInventoryManagementSubscription,
    BProductInventoryManagementService,
    BProductInventoryManagementFile,
    BProductInventoryManagementPhysical,
    BProductInventoryManagementVirtual,
  },
  props: {
    shop: {
      required: true,
      type: Object,
    },
    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },
    product: {
      required: true,
      type: Object,
    },
    forStudio: {
      default: false,
      type: Boolean,
    },

    withTrashed: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {};
  },

  computed: {
    isPhysical() {
      return this.product && this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product && this.product.type === ProductType.VIRTUAL.code;
    },
    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },

    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    isSubscription() {
      return (
        this.product && this.product.type === ProductType.SUBSCRIPTION.code
      );
    },
  },

  watch: {},
  created() {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>
