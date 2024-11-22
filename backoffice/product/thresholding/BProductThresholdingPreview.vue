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
  <div>
    <BProductThresholdingPreviewItem
      v-for="(variable, key) in variables"
      :key="key"
      :level="key"
      :variable="variable"
      :quantity-limit="max_quantity_limit"
      :min-sales-limit="min_sells_limit"
      class="mb-1"
    >
    </BProductThresholdingPreviewItem>

    <v-chip
      v-if="custom"
      label
      size="x-small"
      color="#000"
      variant="flat"
      density="comfortable"
      class="ma-1"
      prepend-icon="draw"
      >{{ $t("global.commons.custom") }}
    </v-chip>
    <v-chip
      v-if="has_progress"
      label
      size="x-small"
      color="#000"
      variant="flat"
      density="comfortable"
      class="ma-1"
      prepend-icon="data_thresholding"
      >{{ Math.round(progress * 100) }}%
    </v-chip>
    <v-chip
      v-if="has_in_cart_count"
      label
      size="x-small"
      color="#000"
      variant="flat"
      density="comfortable"
      class="ma-1"
      prepend-icon="shopping_cart"
      >{{ Math.round(carts * 100) }}%
    </v-chip>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BProductThresholdingPreviewItem from "@selldone/components-vue/backoffice/product/thresholding/BProductThresholdingPreviewItem.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";

export default defineComponent({
  name: "BProductThresholdingPreview",
  components: { BProductThresholdingPreviewItem },
  inject: ["$shop", "$product"],
  props: {
    variables: {},
    carts: {},
    progress: {},
    custom: Boolean,
  },
  computed: {
    has_progress() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },
    has_in_cart_count() {
      return [ProductType.PHYSICAL.code, ProductType.VIRTUAL.code].includes(
        this.$product.type,
      );
    },

    max_quantity_limit() {
      const out = Math.min(
        Object.values(this.variables).maxByKey("maxQuantity").maxQuantity,
        this.$product.quantity,
      );

      return Math.max(out, 100);
    },
    min_sells_limit() {
      return Math.max(
        Object.values(this.variables).maxByKey("minSales").minSales,
        100,
      );
    },
  },
});
</script>

<style scoped lang="scss"></style>
