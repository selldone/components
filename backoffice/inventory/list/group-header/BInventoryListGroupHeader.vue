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
  <!-- ------------------------ Group > Mobile ------------------------ -->

  <div
    v-if="isMobile"
    class="pp text-start p-2 usn"
    style="width: calc(100vw - 40px)"
    @click="toggleGroup(item)"
  >
    <div class="d-flex align-center">
      <v-icon class="me-2">{{ is_open ? "remove" : "add" }}</v-icon>

      <v-avatar class="me-2" size="24">
        <img :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)" />
      </v-avatar>

      <div class="text-start">
        <p class="m-0 text-subtitle-2 font-weight-bold single-line">
          {{ product.title }}
        </p>
        <small class="single-line d-block">{{ product.title_en }}</small>
      </div>
    </div>

    <div class="d-flex justify-space-between pt-2 mt-2 border-top-dashed">
      <div>
        <small class="x-small">{{ $t("global.commons.total") }}: </small>
        <b>{{ quantity }}</b>
      </div>

      <div>
        <u-price v-if="min_price" :amount="min_price"></u-price>
        <template v-if="max_price && max_price !== min_price">
          ~
          <u-price :amount="max_price"></u-price>
        </template>
      </div>
    </div>
  </div>

  <!-- ------------------------ Group > Normal ------------------------ -->

  <tr v-else>
    <td
      :class="{ 'is-open': is_open }"
      :colspan="columns.length - 4"
      class="pp usn"
      @click="toggleGroup(item)"
    >
      <div class="d-flex align-center">
        <v-icon class="me-2">{{ is_open ? "remove" : "add" }}</v-icon>

        <u-avatar-folder
          class="me-2 my-1"
          :size="42"
          side-icon="folder" is-gray
          :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
          small-side-icon
        >
        </u-avatar-folder>

        <div class="text-start">
          <p class="m-0 text-subtitle-2 font-weight-bold single-line">
            <img :src="product_type.image" width="16" height="16" class="me-1">
            {{ product.title?.limitWords(7) }}
          </p>
          <small class="single-line d-block">{{ product.title_en?.limitWords(7) }}</small>
        </div>

        <v-spacer></v-spacer>
        <product-variants-view
          v-if="product?.variants"
          :dark="is_open"
          :variants="product?.variants"
          center
          dense
          small
        />
      </div>
    </td>

    <td
      :class="{ 'is-open': is_open }"
      class="pp usn"
      colspan="1"
      @click="toggleGroup(item)"
    >
      <v-icon :dark="is_open">{{ icon }}</v-icon>
    </td>

    <td
      :class="{ 'is-open': is_open }"
      class="pp usn"
      colspan="1"
      @click="toggleGroup(item)"
    >
      <small class="x-small">{{ $t("global.commons.total") }}</small>
      <b class="d-block">{{ quantity }}</b>
    </td>
    <td
      :class="{ 'is-open': is_open }"
      class="pp usn"
      colspan="2"
      @click="toggleGroup(item)"
    >
      <u-price v-if="min_price" :amount="min_price"></u-price>
      <template v-if="max_price && max_price !== min_price">
        ~
        <u-price :amount="max_price"></u-price>
      </template>
    </td>
  </tr>
</template>

<script>
import { defineComponent } from "vue";
import ProductVariantsView from "../../../../storefront/product/variant/ProductVariantsView.vue";
import UAvatarFolder from "../../../../ui/avatar/folder/UAvatarFolder.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

export default defineComponent({
  name: "BInventoryListGroupHeader",
  components: { UAvatarFolder, ProductVariantsView },
  props: {
    item: {
      type: Object,
      required: true,
    },
    isGroupOpen: {},
    toggleGroup: {},
    isMobile: {},
    columns: {},
  },

  computed: {
    product_type() {
      return ProductType[this.product.type];
    },

    is_open() {
      return this.isGroupOpen(this.item);
    },

    product() {
      return this.item.items[0].raw.product;
    },

    min_price() {
      return this.item.items.map((x) => x.raw).minByKey("calc_price")
        .calc_price;
    },
    max_price() {
      return this.item.items.map((x) => x.raw).maxByKey("calc_price")
        .calc_price;
    },

    quantity() {
      return this.item.items.map((x) => x.raw).sumByKey("quantity");
    },

    icon() {
      return !this.item.items.some((i) => i.raw.status === "Open")
        ? "block"
        : this.item.items.some((i) => i.raw.status !== "Open")
          ? "rule"
          : "check_circle_outline";
    },
  },
});
</script>

<style scoped lang="scss"></style>