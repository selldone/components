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
      <button type="button" class="b-inventory-list-group__toggle sd-modern-clickable-item" :aria-expanded="is_open" @click="toggleGroup(item)">
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
        <product-variants-view v-if="product?.variants" class="b-inventory-list-group__options" :variants="product.variants" :dark="false" dense small />
        <span v-if="product.sku || product.mpn" class="b-inventory-list-group__identifiers">
          <span v-if="product.sku"><span>{{ $t('inventory_list.table.sku') }}</span><bdi>{{ product.sku }}</bdi></span>
          <span v-if="product.mpn"><span>{{ $t('inventory_list.table.mpn') }}</span><bdi>{{ product.mpn }}</bdi></span>
        </span>
        <span class="b-inventory-list-group__stock">
          <template v-if="stock_summary">
            <span class="b-inventory-list-group__stock-heading"><span class="b-inventory-list-group__stock-count">{{ $t('inventory_list.modern.group_stock_count', { stocked: stock_summary.stocked, total: stock_summary.total }) }}</span><bdi class="b-inventory-list-group__percentage">{{ stock_summary.percentage }}%</bdi></span>
            <span class="b-inventory-list-group__stock-bar" aria-hidden="true"><span class="b-inventory-list-group__stock-fill" :style="{ width: stock_summary.percentage + '%' }"></span></span>
          </template>
          <template v-else>
            <span>{{ $t(variant_count === null ? 'inventory_list.modern.group_variants_unknown' : variant_count ? 'inventory_list.modern.group_variant_count' : 'inventory_list.modern.group_no_variants', { count: variant_count }) }}</span>
            <span class="b-inventory-list-group__secondary b-inventory-list-group__stock-state">
              <span v-if="stock_tracked && variant_count === 0 && parent_stock !== null" class="sd-modern-status__dot" :class="parent_stock > 0 ? 'sd-modern-status__dot--success' : 'sd-modern-status__dot--error'"></span>
              {{ $t(!stock_tracked ? 'inventory_list.modern.group_untracked_stock' : variant_count === 0 && parent_stock !== null ? parent_stock > 0 ? 'inventory_list.modern.group_in_stock' : 'inventory_list.modern.group_out_of_stock' : 'inventory_list.modern.group_stock_unknown') }}
            </span>
          </template>
        </span>
        <span class="b-inventory-list-group__summary">
          <v-icon size="15" :aria-label="$t('inventory_list.table.status')">{{ icon }}</v-icon>
          <span>{{ $t('global.commons.total') }}: {{ stock_tracked ? quantity : $t('global.commons.infinite') }}</span>
          <span>
            <u-price :amount="min_price" />
            <template v-if="max_price !== min_price"> ~ <u-price :amount="max_price" /></template>
          </span>
        </span>
        <v-tooltip v-if="product.sku || product.mpn || stock_summary" activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
          <div v-if="product.sku">{{ $t('inventory_list.table.sku') }}: <bdi>{{ product.sku }}</bdi></div>
          <div v-if="product.mpn">{{ $t('inventory_list.table.mpn') }}: <bdi>{{ product.mpn }}</bdi></div>
          <div v-if="stock_summary">{{ $t('inventory_list.modern.group_stock_help') }}</div>
        </v-tooltip>
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

    variant_count() {
      return Array.isArray(this.product.product_variants) ? this.product.product_variants.length : null;
    },

    stock_tracked() {
      return this.product.type === ProductType.PHYSICAL.code || this.product.type === ProductType.VIRTUAL.code;
    },

    parent_stock() {
      return this.recordedQuantity(this.product.quantity);
    },

    stock_summary() {
      if (!this.stock_tracked || !this.variant_count) return null;
      // The Inventory query returns every variant; count saved stock, including disabled variants.
      const quantities = this.product.product_variants.map(variant => this.recordedQuantity(variant?.quantity));
      if (quantities.some(quantity => quantity === null)) return null;
      const stocked = quantities.filter(quantity => quantity > 0).length;
      return { stocked, total: this.variant_count, percentage: Math.round(stocked / this.variant_count * 100) };
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
  methods: {
    recordedQuantity(value) {
      if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
      const quantity = Number(value);
      return Number.isFinite(quantity) ? quantity : null;
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

  .b-inventory-list-group__identity { flex: 1 1 160px; min-width: 0; }
  .b-inventory-list-group__avatar { flex: 0 0 44px; border-radius: 10px; background: rgba(var(--v-theme-on-surface), 0.035); }
  .b-inventory-list-group__name { display: block; font-weight: 500; overflow-wrap: anywhere; }
  .b-inventory-list-group__secondary { display: block; font-size: 11px; line-height: 18px; color: var(--sd-modern-muted); }
  .b-inventory-list-group__identifiers { flex: 0 1 190px; min-width: 110px; max-width: 220px; display: grid; gap: 4px; }
  .b-inventory-list-group__identifiers > span { display: flex; align-items: baseline; gap: 8px; min-width: 0; font-size: 11px; line-height: 18px; }
  .b-inventory-list-group__identifiers > span > span { color: var(--sd-modern-muted); flex: 0 0 30px; }
  .b-inventory-list-group__identifiers bdi { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .b-inventory-list-group__stock { flex: 0 0 210px; min-width: 160px; display: block; font-size: 12px; line-height: 18px; text-align: start; }
  .b-inventory-list-group__stock-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .b-inventory-list-group__percentage { color: var(--sd-modern-muted); font-size: 11px; white-space: nowrap; }
  .b-inventory-list-group__stock-bar { display: block; height: 3px; margin-block-start: 7px; background: rgba(var(--v-theme-on-surface), 0.1); border-radius: 2px; overflow: hidden; }
  .b-inventory-list-group__stock-fill { display: block; height: 100%; background: rgb(var(--v-theme-success)); border-radius: inherit; }
  .b-inventory-list-group__stock-state { display: flex; align-items: center; gap: 6px; margin-block-start: 3px; }
  .b-inventory-list-group__summary { display: flex; align-items: center; justify-content: space-between; flex: 0 0 210px; flex-wrap: wrap; gap: 10px; font-size: 11px; font-variant-numeric: tabular-nums; }
  :deep(.u--price) { font-size: 12px; font-weight: 400; }

  @media (max-width: 1199px) {
    .b-inventory-list-group__toggle { display: grid; grid-template-columns: 17px auto minmax(0, 1fr); gap: 10px 8px; padding: 14px; }
    .b-inventory-list-group__avatar { flex-basis: 40px; }
    .b-inventory-list-group__identity { grid-column: 3; }
    .b-inventory-list-group__options,
    .b-inventory-list-group__identifiers,
    .b-inventory-list-group__stock,
    .b-inventory-list-group__summary { grid-column: 2 / -1; min-width: 0; max-width: none; }
    .b-inventory-list-group__identifiers { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 6px 12px; }
    .b-inventory-list-group__summary { margin-inline-start: 0; justify-content: space-between; }
  }

  @media (prefers-reduced-motion: reduce) {
    .b-inventory-list-group__avatar { transition: none; transform: none; }
  }
}
</style>
