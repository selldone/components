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
  <v-table>
    <thead class="mt-3 rounded-xl">
      <tr>
        <th class="text-center">Type</th>
        <th class="text-left">Name</th>
        <th>Size</th>

        <th>File</th>
        <th>Preview</th>

        <th>Delete</th>
      </tr>
    </thead>

    <tbody class="text-start">
      <tr v-if="!can_add_3d_model">
        <td colspan="4">
          <v-icon class="me-2" color="red">warning</v-icon>
          Not available for free license!
        </td>

        <td colspan="2">
          <v-btn
            :to="{ name: 'BPageShopSettingLicense' }"
            class="float-end ms-2"
            color="primary"
            variant="flat"
            >Buy license
          </v-btn>
        </td>
      </tr>

      <b-product-ar-table-row
        v-for="item in items"
        :key="item.id + (item.product_id ? '_v' : '_p')"
        :class="{ disabled: !can_add_3d_model }"
        :editable="!add_by_dropShipping"
        :product="product"
        :shop="shop"
        :variant="item.product_id ? item : null"
        class="mb-5"
      ></b-product-ar-table-row>
    </tbody>
  </v-table>
</template>

<script lang="ts">
import BProductArTableRow from "../../../product/ar/table/row/BProductArTableRow.vue";
import { Eligible as ShopLicense } from "@selldone/core-js/enums/shop/ShopLicense";

export default {
  name: "BProductArTable",
  components: {
    BProductArTableRow,
  },
  props: {
    shop: {
      required: true,
    },
    product: {
      required: false,
      type: Object,
    },
  },
  data: () => ({}),
  computed: {
    can_add_3d_model() {
      return ShopLicense.CanAdd3DModel(this.shop);
    },
    product_variants() {
      return this.product.product_variants;
    },

    items() {
      return [this.product, ...this.product_variants];
    },
    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
  },
  methods: {},
};
</script>

<style scoped></style>
