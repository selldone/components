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
  <v-data-table
    v-model:page="page"
    v-model:items-per-page="items_per_page"
    :items="all_variants_items"
    :class="modern ? 'b-product-variants-refined sd-modern-data-table sd-modern-data-table--compact text-start' : 'rounded-lg overflow-hidden text-start'"
    :data-extended="modern && (profit || add_by_dropShipping) ? true : undefined"
    density="compact"
  >
    <template v-if="modern" #colgroup>
      <colgroup>
        <col style="width: 170px" />
        <col style="width: 90px" />
        <col style="width: 100px" />
        <col style="width: 160px" />
        <col style="width: 105px" />
        <col v-if="profit" style="width: 100px" />
        <col style="width: 100px" />
        <col style="width: 140px" />
        <col style="width: 96px" />
        <col v-if="add_by_dropShipping" style="width: 90px" />
      </colgroup>
    </template>
    <template v-slot:headers>
      <tr>
        <th v-if="modern" class="b-product-variants-refined__variant-column">{{ $t('global.commons.Variants') }}</th>
        <template v-else><th
          v-for="(val, key) in available_variants"
          :key="key"
          class="text-center min-width-100"
        >
          <v-icon size="small">{{ GetVariantIconByCode(val.code,product) }}</v-icon>
          {{ $t(GetVariantNameByCode(val.code,product)) }}
        </th></template>
        <th class="min-width-100">
          {{ $t("global.commons.Price") }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.commission") }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.Discount") }}
        </th>
        <th class="min-width-100">
          {{ $t("global.commons.customer_price") }}
        </th>
        <th v-if="profit" class="text-center min-width-100">{{ modern ? $t('b_product_dashboard.identity.profit') : 'Profit' }}</th>

        <th class="min-width-100">
          {{ $t("global.commons.In_Stock") }}
        </th>
        <th class="text-start min-width-100">SKU / MPN</th>
        <th class="min-width-100">{{ modern ? $t('global.commons.actions') : '' }}</th>

        <th v-if="add_by_dropShipping" class="min-width-100">
          {{ $t("global.commons.status") }}
        </th>
      </tr>
    </template>

    <template v-slot:item="{ item }">
      <tr
        :class="{
          'row-hover': !modern && !viewOnly,
          'sd-modern-clickable-item': modern && !viewOnly,
          'inactive-overlay': !item.quantity || !item.enable || item.missed,
          '-red': item.missed,
          '-amber': !item.enable,
        }"
        :tabindex="modern && !viewOnly ? 0 : undefined"
        :role="modern && !viewOnly ? 'button' : undefined"
        :aria-label="modern && !viewOnly ? $t('b_product_dashboard.identity.open_variant') : undefined"
        @click="selectVariant(item)"
        @keydown.enter.self.prevent="selectVariant(item)"
        @keydown.space.self.prevent="selectVariant(item)"
      >
        <td v-if="modern" :data-label="$t('global.commons.Variants')" class="b-product-variants-refined__variant">
          <span class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.Variants') }}</span>
          <div class="b-product-variants-refined__options">
            <button v-for="(val, key) in available_variants" :key="key" type="button" class="b-product-variants-refined__option"
              :aria-label="[$t(GetVariantNameByCode(val.code, product)), variantOptionName(key, item[key])].filter(Boolean).join(': ')"
              @click.stop="variant_help[item.id + ':' + key] = true"
              @keydown.esc.stop="variant_help[item.id + ':' + key] = false"
            >
              <u-color-circle v-if="key === 'color'" :color="item[key]" />
              <template v-else><u-variant-asset-image :size="24" :value="item[key]" /><span class="b-product-variants-refined__option-label">{{ item[key]?.removeVariantAsset() }}</span></template>
              <v-tooltip v-model="variant_help[item.id + ':' + key]" activator="parent" location="top" :open-on-click="false" :open-on-focus="true" content-class="sd-modern-tooltip text-start">
                <div class="b-product-variants-refined__option-detail">
                  <u-color-circle v-if="key === 'color'" :color="item[key]" :size="32" />
                  <u-variant-asset-image v-else :size="64" :value="item[key]" :alt="variantOptionName(key, item[key]) || $t(GetVariantNameByCode(val.code, product))" />
                  <span>
                    <span class="d-block">{{ $t(GetVariantNameByCode(val.code, product)) }}</span>
                    <span v-if="variantOptionName(key, item[key])" class="d-block">{{ variantOptionName(key, item[key]) }}</span>
                  </span>
                </div>
              </v-tooltip>
            </button>
          </div>
          <div v-if="item.missed || !item.enable" class="b-product-variants-refined__states">
            <span v-if="item.missed">{{ $t('b_product_dashboard.identity.missing_parameter') }}</span>
            <span v-if="!item.enable">{{ $t('global.commons.inactive') }}</span>
          </div>
        </td>
        <template v-else>
        <td
          v-for="(val, key) in available_variants"
          :key="key"
          :class="{ 'text-center': key === 'color' }"
        >
          <u-color-circle v-if="key === 'color'" :color="item[key]">
          </u-color-circle>
          <span v-else>
            <u-variant-asset-image
              :size="24"
              :value="item[key]"
            ></u-variant-asset-image>
            {{ item[key]?.removeVariantAsset() }}</span
          >
        </td>
        </template>
        <td :data-label="$t('global.commons.Price')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.Price') }}</span>
          <div class="d-flex align-center">
            <u-price
              :amount="item.pricing ? item.price : product.price"
              :currency="item.pricing ? item.currency : product.currency"
            ></u-price>
            <v-spacer></v-spacer>
            <!-- custom variant pricing or same as product pricing? -->
            <v-icon v-if="item.pricing" class="ms-1">price_change</v-icon>

            <v-tooltip activator="parent" location="top" :content-class="modern ? 'sd-modern-tooltip text-start' : 'bg-black'">
              <template v-if="item.pricing">
                {{ modern ? $t('b_product_dashboard.identity.independent_pricing') : 'Variant has independent pricing.' }}
              </template>
              <template v-else>{{ modern ? $t('b_product_dashboard.identity.product_pricing') : 'Same as main product.' }}</template>
            </v-tooltip>
          </div>
        </td>
        <td :data-label="$t('global.commons.commission')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.commission') }}</span>
          <u-price
            :amount="item.pricing ? item.commission : product.commission"
            :currency="item.pricing ? item.currency : product.currency"
          ></u-price>
        </td>

        <td class="min-width-200 b-product-variants-refined__discount" :data-label="$t('global.commons.Discount')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.Discount') }}</span>
          <div class="d-flex align-center">
            <u-price
              :amount="item.pricing ? item.discount : product.discount"
              :currency="item.pricing ? item.currency : product.currency"
            ></u-price>

            <u-chip-discount
              :percent="
                item.pricing
                  ? (100 * item.discount) / (item.price + item.commission)
                  : (100 * product.discount) /
                    (product.price + product.commission)
              "
              class="ms-2"
              size="small"
              :start="item.dis_start"
              :end="item.dis_end"
            ></u-chip-discount>
          </div>

          <u-time-progress-bar
            v-if="item.pricing"
            :created-time="item.created_at"
            :end-time="item.dis_end"
            :start-time="item.dis_start"
            class="max-width-field mx-auto"
            small
          />
          <u-time-progress-bar
            v-else
            :created-time="product.created_at"
            :end-time="product.dis_end"
            :start-time="product.dis_start"
            class="max-width-field mx-auto"
            small
          />
        </td>

        <td :data-label="$t('global.commons.customer_price')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.customer_price') }}</span>
          <u-price
            :amount="
              priceProductByCurrency(shop, product, item, product.currency)
            "
            :currency="product.currency"
          ></u-price>

          <v-icon v-if="shippingCost" class="mx-1" size="small">add</v-icon>
          <u-price
            v-if="shippingCost"
            :amount="shippingCost"
            :currency="product.currency"
            :title="$t('global.commons.shipping_cost')"
            class="text-blue"
          ></u-price>
        </td>

        <td v-if="profit" :data-label="$t('b_product_dashboard.identity.profit')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('b_product_dashboard.identity.profit') }}</span>
          <u-price
            v-if="profitFunction(product, item) !== null"
            :amount="profitFunction(product, item)"
            :class="
              profitFunction(product, item) > 0 ? 'text-success' : 'text-danger'
            "
            :currency="product.currency"
          ></u-price>
          <small v-else>{{ modern ? $t('b_product_dashboard.identity.variant_not_found') : 'Variant not found!' }}</small>
        </td>
        <td class="text-start" :class="modern ? 'b-product-variants-refined__stock' : undefined" :data-label="$t('global.commons.In_Stock')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.In_Stock') }}</span>
          <b
            v-if="!item.quantity"
            :class="modern ? 'b-product-variants-refined__stock-state' : 'text-red x-small'"
            title="Out of stock"
          >
            <v-icon class="me-1" color="red" :size="modern ? 16 : 'small'"
              >notification_important
            </v-icon>
            {{ $t("global.commons.out_of_stock") }}
          </b>
          <span v-else class="body-title">{{
            numeralFormat(item.quantity, "0.[0] a")
          }}</span>

          <div
            :title="`Average fulfillment time : ${item.lead} h`"
            class="d-block my-1 text-center d-flex align-center op-0-8"
          >
            <template v-if="item.lead === -1">
              <v-icon class="me-1" size="small">history_toggle_off</v-icon>
              {{ $t("global.commons.unset") }}
            </template>

            <span v-else>
              <v-icon class="me-1" size="small">timelapse</v-icon>
              {{ `${item.lead} ${$t("global.commons.hours")}` }}</span
            >
          </div>

          <div v-if="!item.enable" class="my-1" title="Inactive">
            <v-icon class="me-1" size="small">folder_off</v-icon>
            {{ $t("global.commons.inactive") }}
          </div>
        </td>

        <td class="text-start min-width-150" data-label="SKU / MPN">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">SKU / MPN</span>
          <div v-if="item.sku" :class="modern ? 'b-product-variants-refined__code-row' : undefined" :title="modern ? undefined : `Copy SKU: ${item.sku}`">
            <small>SKU:</small>
            <button v-if="modern" v-copy type="button" class="b-product-variants-refined__code" dir="ltr" :aria-label="`SKU: ${item.sku}`" @click.stop>{{ item.sku }}<v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-click="true">{{ item.sku }}</v-tooltip></button>
            <b v-else v-copy class="mx-1" @click.stop>{{ item.sku }}</b>
          </div>

          <div v-if="item.mpn" :class="modern ? 'b-product-variants-refined__code-row' : undefined" :title="modern ? undefined : `Copy MPN: ${item.mpn}`">
            <small>MPN:</small>
            <button v-if="modern" v-copy type="button" class="b-product-variants-refined__code" dir="ltr" :aria-label="`MPN: ${item.mpn}`" @click.stop>{{ item.mpn }}<v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" :open-on-click="true">{{ item.mpn }}</v-tooltip></button>
            <b v-else v-copy class="mx-1" @click.stop>{{ item.mpn }}</b>
          </div>
          <span v-if="modern && !item.sku" class="sd-modern-muted">{{ $t('b_product_dashboard.identity.sku_not_set') }}</span>
        </td>

        <td class="text-center b-product-variants-refined__action-cell" :data-label="$t('global.commons.actions')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.actions') }}</span>
          <div :class="modern ? 'b-product-variants-refined__actions' : undefined">
          <template v-if="item.sku || modern">
            <v-btn
              :class="modern ? 'sd-modern-icon-button' : 'mx-1 hover-scale-small'"
              :icon="modern"
              :aria-label="modern ? $t('b_product_dashboard.identity.sku_barcode') : undefined"
              :disabled="!item.sku"
              min-width="32"
              variant="text"
              :width="modern ? undefined : 36"
              @click.stop="showBarcode(item, false)"
            >
              <v-icon :size="modern ? 16 : 24">fa:fas fa-barcode</v-icon>

              <v-tooltip activator="parent" location="top" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined">
                {{ modern ? $t('b_product_dashboard.identity.sku_barcode') : 'Show printable barcode | SKU:' + item.sku }}
              </v-tooltip>
            </v-btn>
            <v-btn
              :class="modern ? 'sd-modern-icon-button' : 'mx-1 hover-scale-small'"
              :icon="modern"
              :aria-label="modern ? $t('b_product_dashboard.identity.sku_qr') : undefined"
              :disabled="!item.sku"
              min-width="32"
              variant="text"
              :width="modern ? undefined : 36"
              @click.stop="showBarcode(item, true)"
            >
              <v-icon :size="modern ? 16 : 24">fa:fas fa-qrcode</v-icon>
              <v-tooltip activator="parent" location="top" :content-class="modern ? 'sd-modern-tooltip text-start' : undefined">
                {{ modern ? $t('b_product_dashboard.identity.sku_qr') : 'Show printable QR code | SKU:' + item.sku }}
              </v-tooltip>
            </v-btn>
          </template>
          <v-icon v-else title="The SKU is not set for variant!"
            >warning_amber
          </v-icon>
          </div>
        </td>

        <td v-if="add_by_dropShipping" class="text-center" :data-label="$t('global.commons.status')">
          <span v-if="modern" class="sd-modern-list-header b-product-variants-refined__caption">{{ $t('global.commons.status') }}</span>
          <v-icon v-if="item.missed" color="blue">add_box</v-icon>
          <v-icon v-else-if="item.enable" color="green">check</v-icon>
          <v-icon v-else color="red">close</v-icon>
        </td>
      </tr>
    </template>

    <template v-slot:body.append>
      <tr :class="modern ? 'b-product-variants-refined__legend' : undefined">
        <td :colspan="modern ? 8 + Number(profit) + Number(add_by_dropShipping) : 6">
          <v-row no-gutters>
            <div class="d-flex align-center pa-1">
              <v-card
                class="me-2 inactive-overlay d-inline-block"
                height="24"
                variant="outlined"
                width="24"
              ></v-card>
              {{ modern ? $t('global.commons.out_of_stock') : 'Not in stock.' }}
            </div>
            <div class="d-flex align-center pa-1">
              <v-card
                class="me-2 inactive-overlay -red d-inline-block"
                height="24"
                variant="outlined"
                width="24"
              ></v-card>
              {{ modern ? $t('b_product_dashboard.identity.missing_parameter') : 'Missing variant parameter.' }}
            </div>

            <div class="d-flex align-center pa-1">
              <v-card
                class="me-2 inactive-overlay -amber d-inline-block"
                height="24"
                variant="outlined"
                width="24"
              ></v-card>
              {{ modern ? $t('b_product_dashboard.identity.disabled_variant') : 'Variant is disabled.' }}
            </div>
          </v-row>
        </td>
      </tr>
    </template>
    <template v-if="modern" #bottom="{ pageCount }">
      <div class="sd-modern-table-footer b-product-variants-refined__footer">
        <span>{{ $t('b_product_dashboard.identity.variant_count', { count: all_variants_items.length }) }}</span>
        <div class="b-product-variants-refined__paging">
          <v-select v-model="items_per_page" :items="[{ title: '10', value: 10 }, { title: '25', value: 25 }, { title: '50', value: 50 }, { title: '100', value: 100 }, { title: $t('global.commons.all'), value: -1 }]" :label="$t('b_product_dashboard.identity.per_page')" variant="plain" density="compact" hide-details class="b-product-variants-refined__page-size" />
          <v-pagination v-model="page" :length="pageCount" :total-visible="5" class="sd-modern-pagination" density="compact" />
        </div>
      </div>
    </template>
  </v-data-table>

  <!-- ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ Dialog > QR Code ⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬⬬ -->
  <b-product-barcode
    v-model="show_barcode"
    :barcode2d="barcode2d"
    :product="product"
    :shop="shop"
    :variant="barcode_variant"
  ></b-product-barcode>
</template>

<script lang="ts">
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  ProductVariants
} from "@selldone/core-js/enums/product/ProductVariants";
import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import UChipDiscount from "../../../../ui/chip/discount/UChipDiscount.vue";
import { defineAsyncComponent } from "vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper";

export default {
  name: "BProductVariantsTable",
  mixins: [ProductMixin ],

  components: {
    UChipDiscount,
    UColorCircle,
    UVariantAssetImage,
    BProductBarcode: defineAsyncComponent(
      () =>
        import(
          "@selldone/components-vue/backoffice/product/barcode/BProductBarcode.vue"
        ),
    ),
    UTimeProgressBar,
  },
  props: {
    modern: Boolean,
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    viewOnly: {
      default: false,
      type: Boolean,
    },
    shippingCost: {
      default: null,
    },
    profit: {
      default: false,
      type: Boolean,
    },
    profitFunction: {
      type: Function,
    },
    missedVariants: {
      type: Array,
    },
  },
  data: () => ({
    GetVariantNameByCode: GetVariantNameByCode,
    GetVariantIconByCode: GetVariantIconByCode,

    barcode_variant: null,
    barcode2d: false,
    show_barcode: false,

    busy_add_variant: false,
    // Clicking help must open it even when hover/focus has already opened the native tooltip.
    variant_help: {},
    page: 1,
    items_per_page: 10,
  }),

  computed: {
    available_variants() {
      let out = {};

      Object.keys(ProductVariants).forEach((key) => {
        if (this.all_variants_items.find((variant) => !!variant[key]))
          out[key] = ProductVariants[key];
      });

      return out;
    },

    all_variants_items() {
      if (!this.missedVariants) return this.product.product_variants;

      const missed_array = [];
      this.missedVariants.forEach((variant) => {
        const _variant = Object.assign({}, variant);
        _variant.missed = true;
        missed_array.push(_variant);
      });
      return [...this.product.product_variants, ...missed_array];
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    parent() {
      return this.product.parent;
    },
  },

  methods: {
    variantOptionName(key, value) {
      return key === 'color' ? GetNameOfColor(value) : value?.removeVariantAsset().trim() || '';
    },
    selectVariant(item) {
      if (this.modern && this.viewOnly) return;
      item.missed ? this.showAddVariantDialog(item) : this.$emit('select', item);
    },
    showBarcode(product_variant, barcode2d) {
      this.barcode_variant = product_variant;
      this.barcode2d = barcode2d;
      this.show_barcode = true;
    },

    showAddVariantDialog(parent_variant) {
      NotificationService.openConfirmationAlert(
        "Add variant",
        "Are you sure to add this variant to your product?",
        "Yes, Add now",
        () => {
          this.addMissedVariant(parent_variant);
        },
      );
    },
    addMissedVariant(parent_variant) {
      this.busy_add_variant = true;
      axios
        .post(
          window.API.POST_ADD_DROP_SHIPPING_VARIANT(
            this.product.shop_id,
            this.product.id,
          ),
          {
            variant_id: parent_variant.id,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.AddOrUpdateItemByID(
              this.product.product_variants,
              data.product_variant,
            );

            NotificationService.showSuccessAlert(null, "Variant added successfully.");
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_add_variant = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b-product-variants-refined {
  container: product-variants / inline-size;
  font-size: 12px;
  :deep(.v-table__wrapper) { overflow: visible; }
  :deep(table) { table-layout: fixed; width: 100%; }
  :deep(th), :deep(td) { min-width: 0 !important; overflow-wrap: anywhere; }
  &.sd-modern-data-table.sd-modern-data-table--compact.v-data-table {
    --v-table-row-height: 44px;
    --v-table-header-height: 36px;
  }
  :deep(th) { padding: 6px 8px !important; overflow-wrap: normal; word-break: normal; }
  &.v-data-table > :deep(.v-table__wrapper > table > tbody > tr > td) { padding: 4px 8px !important; }
  :deep(th:first-child),
  &.v-data-table > :deep(.v-table__wrapper > table > tbody > tr > td:first-child) { padding-inline-start: 12px !important; }
  :deep(th:last-child),
  &.v-data-table > :deep(.v-table__wrapper > table > tbody > tr > td:last-child) { padding-inline-end: 12px !important; }
  :deep(td .u--price) { font-size: 12px; white-space: nowrap; }
  :deep(td b) { font-size: 12px; font-weight: 500; }
  :deep(.inactive-overlay::after) { opacity: .12; background-size: 24px 24px; border-radius: 0; }
  :deep(.inactive-overlay.-red) { --color-1: rgb(var(--v-theme-error)); }
  :deep(.inactive-overlay.-amber:not(.-red)) { --color-1: rgb(var(--v-theme-warning)); }
  &__variant-column { width: 170px; }
  &__caption { display: none; }
  &__options { display: flex; flex-wrap: wrap; align-items: center; gap: 2px 4px; }
  &__option {
    display: inline-flex; gap: 4px; align-items: center; min-width: 0;
    padding: 0; border: 0; border-radius: 4px; background: transparent; color: inherit; font: inherit; cursor: help;
    &:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  }
  &__option-label { max-width: 48px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__option-detail { display: flex; align-items: center; gap: 12px; }
  &__option-detail > :first-child { flex-shrink: 0; }
  &__discount > .d-flex { flex-wrap: wrap; gap: 4px 6px; }
  &__states { display: flex; flex-wrap: wrap; gap: 3px 8px; margin-top: 3px; color: var(--sd-modern-muted); font-size: 11px; }
  &__stock-state { font-size: 12px; font-weight: 400; color: inherit; }
  &__stock > div { margin-block: 0 !important; }
  &__code-row { display: flex; align-items: center; gap: 5px; min-width: 0; }
  &__code-row > small { flex-shrink: 0; font-size: 11px; }
  &__code {
    display: block;
    flex: 1 1 auto;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    line-height: 17px;
    text-align: start;
    cursor: pointer;
  }
  :deep(.body-title) { font-size: 14px; font-weight: 400; }
  &__actions { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: nowrap; }
  &__action-cell { width: 96px; }
  &__legend :deep(.v-row) { gap: 8px 12px; font-size: 11px; color: var(--sd-modern-muted); }
  &__legend :deep(.v-card) { border: 0; border-radius: 2px; }
  &__footer { margin-block-start: 12px; }
  &__paging { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 12px; }
  &__page-size { flex: 0 0 90px; width: 90px; font-size: 12px; }
}

@mixin variant-rows {
    :deep(thead), :deep(colgroup) { display: none; }
    :deep(table), :deep(tbody) { display: block; }
    :deep(tbody > tr:not(.b-product-variants-refined__legend)) { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px 14px; padding: 10px 12px; border-bottom: 1px solid var(--sd-modern-border); }
    &.v-data-table > :deep(.v-table__wrapper > table > tbody > tr > td) { display: block; height: auto; padding: 0 !important; width: auto; min-width: 0; border: 0; }
    &.v-data-table > :deep(.v-table__wrapper > table > tbody > tr > td:is(:first-child, :last-child)) { padding-inline: 0 !important; }
    .b-product-variants-refined__caption { display: block; margin-block-end: 3px; }
    .b-product-variants-refined__action-cell { align-self: end; }
    .b-product-variants-refined__legend { display: block; margin-top: 12px; }
    .b-product-variants-refined__legend :deep(td) { display: block; }
}

// Reflow from the actual widget width, including the narrower source/vendor contexts.
@container product-variants (max-width: 975px) {
  .b-product-variants-refined { @include variant-rows; }
}

@container product-variants (min-width: 976px) {
  .b-product-variants-refined__stock-state { white-space: nowrap; }
}

@container product-variants (max-width: 1175px) {
  .b-product-variants-refined[data-extended] { @include variant-rows; }
}

@container product-variants (max-width: 500px) {
  .b-product-variants-refined {
    :deep(tbody > tr:not(.b-product-variants-refined__legend)) { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 12px; }
    &__actions { justify-content: flex-start; }
  }
}

@media (max-width: 599px), (pointer: coarse) {
  .b-product-variants-refined__code { min-height: 44px; }
  .b-product-variants-refined__option { min-width: 44px; min-height: 44px; }
}
</style>
