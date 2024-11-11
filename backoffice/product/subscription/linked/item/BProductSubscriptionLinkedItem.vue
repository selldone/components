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
  <v-list-item class="position-relative" density="compact">
    <img
      v-if="type"
      :src="type.image"
      :title="$t(type.name)"
      class="absolute-top-end"
      height="16"
      width="16"
    />

    <template v-slot:prepend>
      <u-avatar-flip
        :size="44"
        :src="getShopImagePath(image_path, IMAGE_SIZE_SMALL)"
        :to="{
          name: 'BPageProductDashboard',
          params: { product_id: item['product_id'] },
        }"
        class="me-3"
      >
      </u-avatar-flip>
    </template>

    <v-list-item-title
      >{{ product ? product.title : `Invalid or removed product!` }}
    </v-list-item-title>
    <v-list-item-subtitle class="d-flex"
      ><span v-if="variant?.sku || product?.sku" class="w-50"
        >SKU: {{ variant?.sku ? variant.sku : product.sku }}
      </span>
      <span v-if="variant?.mpn || product?.mpn" class="w-50"
        >MPN: {{ variant?.mpn ? variant.mpn : product.mpn }}
      </span>
      <span v-if="!product"
        >Product ID: <b>{{ item["product_id"] }}</b> / Variant ID:
        <b>{{ item["variant_id"] }}</b></span
      >
    </v-list-item-subtitle>

    <product-variants-view v-if="variant" :variants="[variant]" dense />

    <template v-slot:append>
      <v-list-item-action end>
        <u-number-input
          v-model="item.count"
          :min="1"
          class="strong-field"
          flat
          hide-details
          title="Items count"
          variant="plain"
        ></u-number-input>
      </v-list-item-action>

      <v-list-item-action end>
        <v-btn icon title="Remove item" variant="text" @click="$emit('clear')">
          <v-icon>close</v-icon>
        </v-btn>
      </v-list-item-action>
    </template>
  </v-list-item>
</template>

<script lang="ts">
import ProductVariantsView from "../../../../../storefront/product/variant/ProductVariantsView.vue";
import UNumberInput from "../../../../../ui/number/input/UNumberInput.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UAvatarFlip from "../../../../../ui/avatar/flip/UAvatarFlip.vue";

export default {
  name: "BProductSubscriptionLinkedItem",
  components: { UAvatarFlip, UNumberInput, ProductVariantsView },
  props: {
    item: {
      type: Object,
      required: true,
    },
    productsRepository: { type: Array },
  },

  computed: {
    product() {
      return this.productsRepository?.find(
        (p) => p.id === this.item.product_id,
      );
    },
    variant() {
      return this.product?.product_variants?.find(
        (v) => v.id === this.item.variant_id,
      );
    },

    image_path() {
      return this.variant?.image ? this.variant.image : this.product?.icon;
    },

    type() {
      return this.product && ProductType[this.product.type];
    },
  },

  watch: {
    "item.count"() {
      this.$emit("change");
    },
  },
};
</script>

<style scoped></style>
