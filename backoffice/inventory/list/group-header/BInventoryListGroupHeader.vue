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
  <tr v-if="modern" class="b-inventory-list-group--modern">
    <td :colspan="columns.length">
      <button type="button" class="b-inventory-list-group__toggle" :aria-expanded="is_open" @click="toggleGroup(item)">
        <v-icon size="17">{{ is_open ? 'expand_more' : 'chevron_right' }}</v-icon>
        <v-avatar :size="isMobile ? 40 : 44" class="b-inventory-list-group__avatar hover-scale-small">
          <v-img :src="product.icon ? getShopImagePath(product.icon, IMAGE_SIZE_SMALL) : product_type.image" alt="">
            <template v-slot:error>
              <v-img :src="product_type.image" alt="" />
            </template>
          </v-img>
        </v-avatar>
        <span class="b-inventory-list-group__identity">
          <span class="b-inventory-list-group__name">{{ product.title }}</span>
          <span v-if="product.title_en" class="b-inventory-list-group__secondary">{{ product.title_en }}</span>
        </span>
        <product-variants-view v-if="product?.variants" :variants="product.variants" :dark="false" dense small />
        <span class="b-inventory-list-group__summary">
          <v-icon size="15" :aria-label="$t('inventory_list.table.status')">{{ icon }}</v-icon>
          <span>{{ $t('global.commons.total') }}: {{ quantity }}</span>
          <span>
            <u-price :amount="min_price" :currency="product.currency" />
            <template v-if="max_price !== min_price"> ~ <u-price :amount="max_price" :currency="product.currency" /></template>
          </span>
        </span>
      </button>
    </td>
  </tr>
  <!-- ------------------------ Group > Mobile ------------------------ -->

  <div
    v-else-if="isMobile"
    class="pp text-start p-2 my-2 usn d-flex flex-column"
    style="width: calc(100vw - 72px)"
    @click="toggleGroup(item)"
  >
    <v-list-item class="d-flex align-center" lines="one" density="compact">
      <template v-slot:prepend>
        <v-icon>{{ is_open ? "remove" : "add" }}</v-icon>
      </template>



      <v-list-item-title>
        <v-avatar class="me-2" size="24" variant="outlined" rounded>
          <img :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)" />
        </v-avatar>

        <b>{{ product.title}}</b>
      </v-list-item-title>
      <v-list-item-subtitle class="mt-1">
        {{ product.title_en }}
      </v-list-item-subtitle>
    </v-list-item>

    <div class="d-flex justify-space-between pt-1 mt-2 border-top-dashed">
      <div>
        <small>{{ $t("global.commons.total") }}: </small>
        <b>{{ quantity }}</b>
      </div>

      <div >
        <u-price v-if="min_price" :amount="min_price" :currency="product.currency"></u-price>
        <template v-if="max_price && max_price !== min_price">
          ~
          <u-price :amount="max_price" :currency="product.currency">></u-price>
        </template>
      </div>
    </div>
  </div>

  <!-- ------------------------ Group > Normal ------------------------ -->

  <tr v-else  :class="{ 'is-open elevation-6': is_open }">
    <td
      :colspan="columns.length - 4"
      class="pp usn"
      @click="toggleGroup(item)"
    >
      <div class="d-flex align-center ">
        <v-icon class="me-2">{{ is_open ? "remove" : "add" }}</v-icon>

        <u-avatar-folder
          :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
          class="me-2 my-1"
          is-gray
          side-icon="folder"
          small-side-icon elevated
        >
        </u-avatar-folder>

        <div class="text-start">
          <p class="m-0 text-subtitle-2 font-weight-bold single-line">
            <img
              :src="product_type.image"
              class="me-1"
              height="16"
              width="16"
            />
            {{ product.title?.limitWords(7) }}
          </p>
          <small class="single-line d-block">{{
            product.title_en?.limitWords(7)
          }}</small>
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
      class="pp usn"
      colspan="1"
      @click="toggleGroup(item)"
    >
      <v-icon >{{ icon }}</v-icon>
    </td>

    <td
      class="pp usn"
      colspan="1"
      @click="toggleGroup(item)"
    >
      <small class="x-small">{{ $t("global.commons.total") }}</small>
      <b class="d-block">{{ quantity }}</b>
    </td>
    <td
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

<script lang="ts">
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
    modern: Boolean,
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

<style scoped lang="scss">
.b-inventory-list-group--modern {
  background: rgba(var(--v-theme-on-surface), 0.025);
  color: rgb(var(--v-theme-on-surface));

  > td { padding: 0 !important; }

  .b-inventory-list-group__toggle {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    min-height: 54px;
    padding: 10px 18px;
    text-align: start;
    font: inherit;
    font-size: 12px;
    background: transparent;
    border: 0;
    color: inherit;

    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -3px; }
  }

  .b-inventory-list-group__identity { min-width: 0; }
  .b-inventory-list-group__avatar { flex: 0 0 44px; border-radius: 10px; background: rgba(var(--v-theme-on-surface), 0.035); }
  .b-inventory-list-group__name { display: block; font-weight: 500; }
  .b-inventory-list-group__secondary { display: block; font-size: 11px; color: var(--sd-modern-muted); }
  .b-inventory-list-group__summary { display: flex; flex-wrap: wrap; gap: 10px 20px; margin-inline-start: auto; font-size: 11px; font-variant-numeric: tabular-nums; }
  :deep(.u--price) { font-size: 12px; font-weight: 400; }

  @media (max-width: 1199px) {
    .b-inventory-list-group__toggle { gap: 8px; padding: 14px; }
    .b-inventory-list-group__avatar { flex-basis: 40px; }
    .b-inventory-list-group__identity { flex: 1; }
    .b-inventory-list-group__summary { flex-basis: 100%; justify-content: space-between; }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-inventory-list-group__avatar { transition: none; transform: none; }
  }
}
</style>
