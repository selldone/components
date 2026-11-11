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
  <div v-if="modern && product && shop" class="b-product-ar-table text-start">
    <div v-if="!can_add_3d_model" class="sd-modern-notice" role="status">
      <v-icon>lock_outline</v-icon>
      <div class="sd-modern-notice__content">
        {{ $t("product_ar.license_required") }}
      </div>
      <v-btn
        :to="{ name: 'BPageShopSettingLicense' }"
        variant="flat"
        color="primary"
        class="sd-modern-button sd-modern-button--small sd-modern-button--primary"
        >{{ $t("product_ar.upgrade_license") }}</v-btn
      >
    </div>
    <div v-else-if="add_by_dropShipping" class="sd-modern-notice" role="status">
      <v-icon>lock_outline</v-icon>
      <div class="sd-modern-notice__content">
        {{ $t("product_ar.readonly") }}
      </div>
    </div>
    <b-product-ar-table-row
      :key="`product-ar-default-${product.id}`"
      :product="product"
      :shop="shop"
      :editable="!add_by_dropShipping"
      :enabled="can_add_3d_model"
      modern
      @activity="setRowActivity('default', $event)"
    />
    <section
      v-if="product_variants.length"
      class="sd-modern-widget b-product-ar-table__variants"
    >
      <header class="b-product-ar-table__header">
        <v-icon icon="layers" size="18" aria-hidden="true" />
        <div>
          <h2>{{ $t("product_ar.variants_title") }}</h2>
          <p class="sd-modern-subtitle">
            {{ $t("product_ar.variants_subtitle") }}
          </p>
        </div>
        <span class="b-product-ar-table__count">{{
          $t("product_ar.variant_count", { count: product_variants.length })
        }}</span>
      </header>
      <v-table class="b-product-ar-table__list">
        <thead>
          <tr class="sd-modern-list-header">
            <th>{{ $t("product_ar.variant") }}</th>
            <th>{{ $t("product_ar.model_source") }}</th>
            <th><span class="b-product-ar-table__action-caption">{{ $t("product_ar.actions") }}</span></th>
          </tr>
        </thead>
        <tbody>
          <b-product-ar-table-row
            v-for="variant in displayed_variants"
            :key="variant.id"
            :variant="variant"
            :product="product"
            :shop="shop"
            :editable="!add_by_dropShipping"
            :enabled="can_add_3d_model"
            modern
            @activity="setRowActivity(variant.id, $event)"
          />
        </tbody>
      </v-table>
      <footer class="sd-modern-table-footer">
        {{
          $t("product_ar.model_count", {
            count: own_model_count,
            total: product_variants.length,
          })
        }}
        <v-btn v-if="product_variants.length > 5" class="sd-modern-button sd-modern-button--inline" color="primary" variant="text" :append-icon="show_all ? 'expand_less' : 'expand_more'" :disabled="workspaceBusy" @click="show_all = !show_all">{{ $t(show_all ? 'product_ar.show_fewer' : 'product_ar.show_all', { count: product_variants.length }) }}</v-btn>
      </footer>
    </section>
    <details class="b-product-ar-table__help">
      <summary>
        <v-icon size="18">help_outline</v-icon>{{ $t("product_ar.help_title")
        }}<v-icon size="16">expand_more</v-icon>
      </summary>
      <div>
        <p>
          <strong>{{ $t("product_ar.help_main_title") }}</strong
          >{{ $t("product_ar.help_main") }}
        </p>
        <p>
          <strong>{{ $t("product_ar.help_variant_title") }}</strong
          >{{ $t("product_ar.help_variant") }}
        </p>
      </div>
    </details>
    <p class="b-product-ar-table__saved"><v-icon icon="check" size="14" aria-hidden="true" />{{ $t('product_ar.all_saved') }}</p>
  </div>
  <v-table v-else-if="product && shop">
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
        :enabled="can_add_3d_model"
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
  emits: ['activity'],
  components: {
    BProductArTableRow,
  },
  props: {
    modern: Boolean,
    shop: {
      required: true,
    },
    product: {
      required: false,
      type: Object,
    },
  },
  data: () => ({ show_all: false, busy_rows: {} }),
  computed: {
    workspaceBusy() {
      return Object.values(this.busy_rows).some(Boolean);
    },
    displayed_variants() {
      return this.show_all ? this.product_variants : this.product_variants.slice(0, 5);
    },
    can_add_3d_model() {
      return !!this.shop && ShopLicense.CanAdd3DModel(this.shop);
    },
    product_variants() {
      return this.product?.product_variants || [];
    },
    own_model_count() {
      return this.product_variants.filter(
        (variant) => variant.ar?.src || variant.ar?.ios,
      ).length;
    },

    items() {
      return this.product ? [this.product, ...this.product_variants] : [];
    },
    add_by_dropShipping() {
      return !!this.product?.parent_id;
    },
  },
  watch: {
    workspaceBusy: { immediate: true, handler(busy) { this.$emit('activity', busy); } },
    product() { this.busy_rows = {}; this.show_all = false; },
  },
  methods: {
    setRowActivity(key, busy) {
      if (busy) this.busy_rows[key] = true;
      else delete this.busy_rows[key];
    },
  },
};
</script>

<style scoped lang="scss">
.b-product-ar-table {
  display: grid;
  gap: 18px;
  &__variants {
    padding: 21px;
  }
  &__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-block-end: 20px;
  }
  &__header > .v-icon { color: var(--sd-modern-muted); align-self: flex-start; margin-block-start: 3px; }
  &__header > div { flex: 1; min-width: 0; }
  &__header h2 {
    margin: 0;
    font-size: 15px;
    line-height: 23px;
    font-weight: 500;
  }
  &__header .sd-modern-subtitle {
    font-size: 12px;
    line-height: 19px;
    margin-top: 4px;
  }
  &__count {
    color: var(--sd-modern-muted);
    font-size: 12px;
    white-space: nowrap;
  }
  &__list {
    background: transparent;
  }
  &__list :deep(.v-table__wrapper) {
    overflow: visible;
  }
  &__list :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
  &__list th {
    padding: 0 10px 8px !important;
    height: 33px !important;
  }
  &__list th:nth-child(1) {
    width: 45%;
  }
  &__list th:nth-child(2) {
    width: 45%;
  }
  &__list th:nth-child(3) {
    width: 10%;
  }
  .sd-modern-table-footer {
    font-size: 11px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 10px 0;
    min-height: 0;
  }
  &__help {
    padding-inline: 3px;
  }
  &__help summary {
    display: flex;
    align-items: center;
    gap: 9px;
    list-style: none;
    padding: 0;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }
  &__help summary::-webkit-details-marker {
    display: none;
  }
  &__help summary .v-icon:last-child {
    margin-inline-start: auto;
  }
  &__help[open] summary .v-icon:last-child {
    transform: rotate(180deg);
  }
  &__help > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding-block: 14px 0;
    color: var(--sd-modern-muted);
    font-size: 12px;
    line-height: 20px;
  }
  &__help strong {
    display: block;
    font-weight: 500;
    color: rgb(var(--v-theme-on-surface));
    margin-bottom: 4px;
  }
  &__saved { display: flex; align-items: center; gap: 6px; margin: 0; color: var(--sd-modern-muted); font-size: 11px; line-height: 18px; }
  &__action-caption { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (max-width: 680px) {
    &__variants { padding: 17px; }
    &__header {
      align-items: flex-start;
    }
    &__list :deep(table),
    &__list :deep(tbody) {
      display: block;
    }
    &__list :deep(thead), &__list :deep(thead tr) { display: block; }
    &__list :deep(thead tr) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 44px; gap: 8px; }
    &__list th:nth-child(n) { width: auto; min-width: 0; padding-inline: 2px !important; }
    &__help > div {
      grid-template-columns: 1fr;
      gap: 14px;
    }
  }
}
</style>
