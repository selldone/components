<!--
  - Copyright (c) 2024. Selldone® Business OS™
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
    v-if="$product"
    :hierarchy-items="hierarchy_items"
    style="max-width: inherit"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UBreadcrumb from "@selldone/components-vue/ui/breadcrumb/UBreadcrumb.vue";
import { SProductBreadcrumbHelper } from "@selldone/components-vue/storefront/products/listing/helper/SProductBreadcrumbHelper.ts";

export default defineComponent({
  name: "SProductBreadcrumb",
  components: { UBreadcrumb },

  inject: ["$shop", "$product"],
  props: {},

  computed: {
    // ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Tabs ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃

    hierarchy_items() {
      return SProductBreadcrumbHelper.GenerateCategoryHierarchyGeneral(
        this.$t("global.store"),
        this.$product.category,
        this.$shop.name,
        this.$product,
        "shopping_bag",
      );
    },
  },
});
</script>

<style scoped lang="scss"></style>
