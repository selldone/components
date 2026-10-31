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
  <div v-if="modern" class="b-product-ar-table text-start">
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
      :product="product"
      :shop="shop"
      :editable="!add_by_dropShipping"
      :enabled="can_add_3d_model"
      modern
    />
    <section
      v-if="product_variants.length"
      class="sd-modern-widget b-product-ar-table__variants"
    >
      <header class="b-product-ar-table__header">
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
            <th>{{ $t("product_ar.variant_code") }}</th>
            <th>{{ $t("product_ar.model_source") }}</th>
            <th>{{ $t("product_ar.formats") }}</th>
            <th class="text-end">{{ $t("product_ar.actions") }}</th>
          </tr>
        </thead>
        <tbody>
          <b-product-ar-table-row
            v-for="variant in product_variants"
            :key="variant.id"
            :variant="variant"
            :product="product"
            :shop="shop"
            :editable="!add_by_dropShipping"
            :enabled="can_add_3d_model"
            modern
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
  </div>
  <v-table v-else>
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
  data: () => ({}),
  computed: {
    can_add_3d_model() {
      return ShopLicense.CanAdd3DModel(this.shop);
    },
    product_variants() {
      return this.product.product_variants || [];
    },
    own_model_count() {
      return this.product_variants.filter(
        (variant) => variant.ar?.src || variant.ar?.ios,
      ).length;
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

<style scoped lang="scss">
.b-product-ar-table {
  display: grid;
  gap: 18px;
  &__variants {
    padding: 0;
  }
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 18px 20px 15px;
  }
  &__header h2 {
    font-size: 16px;
    line-height: 24px;
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
    margin-inline: 20px;
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
    padding: 9px 12px !important;
    height: 33px !important;
  }
  &__list th:nth-child(1) {
    width: 31%;
  }
  &__list th:nth-child(2) {
    width: 13%;
  }
  &__list th:nth-child(3) {
    width: 25%;
  }
  &__list th:nth-child(4) {
    width: 14%;
  }
  &__list th:nth-child(5) {
    width: 17%;
  }
  .sd-modern-table-footer {
    font-size: 11px;
    padding: 12px 20px;
    min-height: 0;
  }
  &__help {
    border-top: 1px solid var(--sd-modern-border);
  }
  &__help summary {
    display: flex;
    align-items: center;
    gap: 9px;
    list-style: none;
    padding: 14px 0;
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
    padding-bottom: 15px;
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
  @media (max-width: 680px) {
    &__header {
      padding: 16px 14px 12px;
    }
    &__list {
      margin-inline: 14px;
    }
    &__list thead {
      display: none;
    }
    &__list :deep(table),
    &__list :deep(tbody) {
      display: block;
    }
    &__help > div {
      grid-template-columns: 1fr;
      gap: 14px;
    }
  }
}
</style>
