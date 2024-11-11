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
  <u-breadcrumb
    v-if="product"
    :hierarchy-items="hierarchy_items"
    :image-size="imageSize"
    :title="$t('product_admin.dashboard.info.category')"
    flex-mode
    :prependIcon="prependIcon"
  />
</template>

<script lang="ts">
import UBreadcrumb from "../../../ui/breadcrumb/UBreadcrumb.vue";
import { BProductBreadcrumbsHelper } from "./helper/BProductBreadcrumbsHelper";

export default {
  name: "BProductBreadcrumbs",
  components: { UBreadcrumb },
  props: {
    shop: {
      type: Object,
      required: true,
    },
    product: {
      type: Object,
      required: true,
    },
    imageSize: {
      default: 20,
    },
    prependIcon:{},
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    hierarchy_items() {
      return BProductBreadcrumbsHelper.GenerateCategoryHierarchy(
        this.$t("global.store"),
        this.product.category,
        undefined,
        false,
        false,
        this.shop.icon, // Raw address
        this.IS_VENDOR_PANEL,
      );
    },
  },
};
</script>

<style scoped></style>
