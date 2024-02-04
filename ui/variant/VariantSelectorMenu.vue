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
  <v-menu :disabled="disabled">
    <template v-slot:activator="{ props }">
      <div v-bind="props" class="position-relative">
        <variant-item-mini
          v-if="modelValue"
          class="m-2"
          :product-variant="modelValue"
          selected
          force-enable
          :active-color="activeColor"
          :bordered="bordered"
        />

        <div v-else class="text-muted p-2">Select one variant!</div>

        <v-icon class="absolute-top-end" dark> arrow_drop_down</v-icon>
      </div>
    </template>
    <v-sheet color="#fff" class="py-2">
      <variant-item-mini
        v-for="(product_variant, index) in variants"
        :key="index"
        class="m-2"
        :product-variant="product_variant"
        :selected="product_variant === modelValue"
        @select="$emit('update:modelValue', product_variant)"
        :active-color="activeColor"
      />
    </v-sheet>
  </v-menu>
</template>

<script>
import VariantItemMini from "@components/product/variant/VariantItemMini.vue";
export default {
  name: "VariantSelectorMenu",
  components: { VariantItemMini },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},
    variants: {
      require: true,
    },
    activeColor: {
      default: undefined,
    },
    bordered: { type: Boolean, default: false },

    disabled: {
      default: false,
      type: Boolean,
    },
  },
};
</script>

<style scoped></style>
