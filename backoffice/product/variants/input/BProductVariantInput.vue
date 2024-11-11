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
  <v-select
    :items="productVariants"
    :label="label"
    :model-value="modelValue"
    :return-object="returnObject"
    :variant="variant"
    item-value="id"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <template v-slot:item="{ item, props }">
      <variant-item-mini
        :product-variant="item.raw"
        class="py-1"
        force-enable
        v-bind="props"
      ></variant-item-mini>
    </template>

    <template v-slot:selection="{ item }">
      <variant-item-mini
        :product-variant="item.raw"
        force-enable
      ></variant-item-mini>
    </template>
  </v-select>
</template>

<script lang="ts">
import VariantItemMini from "../../../../storefront/product/variant/VariantItemMini.vue";

export default {
  name: "BProductVariantInput",
  components: { VariantItemMini },
  props: {
    modelValue: {},
    productVariants: {
      required: true,
      type: Array,
    },
    returnObject: {
      type: Boolean,
    },
    variant: { default: "underlined" },
    label: {},
  },
  data() {
    return {
      dialog: false,
    };
  },
  computed: {},
  methods: {},
};
</script>

<style lang="scss" scoped></style>
