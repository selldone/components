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
  <div v-if="modern" class="b-inventory-variant" :class="{ 'b-inventory-variant--workspace': productWorkspace }">
    <div
      class="b-inventory-variant__row"
      :class="{
        'sd-modern-clickable-item': !is_deleted,
        disabled: busy_delete || busy_restore,
        'inactive-overlay': !productWorkspace && (quantity <= 0 || !enable || missing_options.length || is_deleted),
        '-red': missing_options.length,
        '-amber': !enable,
      }"
      :role="is_deleted ? undefined : 'button'"
      :tabindex="is_deleted ? undefined : 0"
      :aria-label="$t('b_product_inventory.open_variant') + ' SPV' + code"
      :aria-disabled="busy_delete || busy_restore || undefined"
      @click="selectVariant"
      @keydown.enter.self.prevent="selectVariant"
      @keydown.space.self.prevent="selectVariant"
    >
      <u-loading-progress v-if="busy_delete || busy_restore" :color="busy_delete ? 'red' : 'green'" />
      <div class="b-inventory-variant__identity">
        <u-avatar-folder
          :side-icon="productVariant.image ? 'collections' : 'highlight_alt'"
          :size="productWorkspace ? 40 : 44"
          :border-size="3"
          :src="getShopImagePath(productVariant.image || product.icon, 128)"
          is-blue
          class="b-inventory-variant__image"
          tabindex="0"
          @dragend="dragleave"
          @dragleave="dragleave"
          @dragover="dragover"
          @drop="dropImage"
        >
          <v-progress-circular v-if="uploading" class="center-absolute" color="blue" size="24" indeterminate />
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus>
            <div class="b-inventory-variant__image-preview">
              <img :src="getShopImagePath(productVariant.image || product.icon, 256)" :alt="'SPV' + code" width="120" height="120" />
              <span>{{ $t(productVariant.image ? 'b_product_inventory.image_help' : 'b_product_inventory.inherited_image_help') }}</span>
            </div>
          </v-tooltip>
        </u-avatar-folder>
        <div class="b-inventory-variant__identifiers">
          <b class="b-inventory-variant__code" dir="ltr">SPV{{ code }}</b>
          <div v-for="identifier in ['sku', 'mpn']" :key="identifier" class="b-inventory-variant__identifier" tabindex="0" @click.stop @keydown.stop>
            <span>{{ $t('global.commons.' + identifier) }}: </span>
            <bdi>{{ productVariant[identifier] || '—' }}</bdi>
            <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>
              <bdi>{{ productVariant[identifier] || $t('b_product_inventory.empty_identifier', { name: $t('global.commons.' + identifier) }) }}</bdi>
            </v-tooltip>
          </div>
        </div>
      </div>

      <div class="b-inventory-variant__options" :data-label="$t('b_product_inventory.options_title')">
        <span class="sd-modern-list-header b-inventory-variant__caption">{{ $t('b_product_inventory.options_title') }}</span>
        <div v-for="key in option_keys" :key="key" class="b-inventory-variant__option">
          <v-icon v-if="!productWorkspace" size="15" :aria-label="$t(GetVariantNameByCode(key, product))">{{ GetVariantIconByCode(key, product) }}</v-icon>
          <button v-if="productVariant[key]" type="button" class="b-inventory-variant__value" :aria-label="optionLabel(key)" @click.stop="option_tooltips[key] = !option_tooltips[key]" @keydown.stop @keydown.esc="option_tooltips[key] = false" @focus="option_tooltips[key] = true" @blur="option_tooltips[key] = false">
            <u-color-circle v-if="key === 'color'" :color="productVariant[key]" :size="productWorkspace ? 12 : 21" />
            <template v-else>
              <u-variant-asset-image :value="productVariant[key]" :size="productWorkspace ? 16 : 21" />
              <span>{{ productVariant[key].removeVariantAsset() }}</span>
            </template>
            <v-tooltip v-model="option_tooltips[key]" activator="parent" location="top" content-class="sd-modern-tooltip text-start">
              <div class="b-inventory-variant__preview">
                <u-color-circle v-if="key === 'color'" :color="productVariant[key]" :size="32" />
                <u-variant-asset-image v-else :value="productVariant[key]" :size="64" />
                <span>{{ optionLabel(key) }}</span>
              </div>
            </v-tooltip>
          </button>
          <span v-else class="b-inventory-variant__missing">{{ $t('b_product_inventory.missing_option') }}</span>
        </div>
      </div>

      <div class="b-inventory-variant__pricing" :data-label="$t(productWorkspace ? 'b_product_inventory.base_price' : 'b_product_inventory.pricing')">
        <span class="sd-modern-list-header b-inventory-variant__caption">{{ $t(productWorkspace ? 'b_product_inventory.base_price' : 'b_product_inventory.pricing') }}</span>
        <div class="b-inventory-variant__price-summary">
          <div class="b-inventory-variant__price">
            <u-price :amount="price" :currency="currency" :line-through="!productWorkspace && !!discount" />
            <span v-if="!productWorkspace && discount" tabindex="0" :aria-label="$t('b_product_inventory.offer_price')" @click.stop @keydown.stop>
              <u-price :amount="price - discount" :currency="currency" />
              <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>{{ $t('b_product_inventory.offer_help') }}</v-tooltip>
            </span>
          </div>
          <span class="b-inventory-variant__inheritance">{{ $t(productVariant.pricing ? 'b_product_inventory.own_price' : 'b_product_inventory.inherited_price') }}</span>
        </div>
        <details v-if="productWorkspace && has_pricing_details" class="b-inventory-variant__pricing-details" @click.stop @keydown.stop>
          <summary>{{ $t('b_product_inventory.pricing_details') }}</summary>
          <p v-if="discount" class="b-inventory-variant__configured-offer"><span>{{ $t('b_product_inventory.configured_offer') }}</span><u-price :amount="price - discount" :currency="currency" /></p>
          <u-time-progress-bar
            :created-time="productVariant.pricing ? productVariant.created_at : product.created_at"
            :end-time="productVariant.pricing ? productVariant.dis_end : product.dis_end"
            :start-time="productVariant.pricing ? productVariant.dis_start : product.dis_start"
            class="b-inventory-variant__period"
            modern
          />
          <extra-pricing-levels v-if="extra_pricings?.length" :extra-pricings="extra_pricings" :inventory-quantity="quantity" :product="product" height="16px" class="b-inventory-variant__tiers" modern />
        </details>
        <u-time-progress-bar
          v-if="!productWorkspace"
          :created-time="productVariant.pricing ? productVariant.created_at : product.created_at"
          :end-time="productVariant.pricing ? productVariant.dis_end : product.dis_end"
          :start-time="productVariant.pricing ? productVariant.dis_start : product.dis_start"
          class="b-inventory-variant__period"
          modern
          @click.stop
          @keydown.stop
        />
        <extra-pricing-levels v-if="!productWorkspace && extra_pricings?.length" :extra-pricings="extra_pricings" :inventory-quantity="quantity" :product="product" height="16px" class="b-inventory-variant__tiers" modern @click.stop @keydown.stop />
      </div>

      <div class="b-inventory-variant__stock" :data-label="$t('b_product_inventory.in_stock')">
        <span class="sd-modern-list-header b-inventory-variant__caption">{{ $t('b_product_inventory.in_stock') }}</span>
        <b>{{ numeralFormat(quantity, '0,0') }}</b>
        <u-cube v-if="extra && !productWorkspace" :color="invalid_size ? '#cccccc' : undefined" :size="26" :x="invalid_size ? 50 : extra.width" :y="invalid_size ? 50 : extra.length" :z="invalid_size ? 50 : extra.height" no-animation />
      </div>

      <div class="b-inventory-variant__availability" :data-label="$t('b_product_inventory.availability')">
        <span class="sd-modern-list-header b-inventory-variant__caption">{{ $t('b_product_inventory.availability') }}</span>
        <span v-if="is_deleted" class="b-inventory-variant__status" tabindex="0" @click.stop @keydown.stop>
          <v-icon size="14">delete_outline</v-icon>{{ $t('b_product_inventory.deleted') }}
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>{{ $t('b_product_inventory.deleted_at', { date: getLocalTimeString(productVariant.deleted_at) }) }}</v-tooltip>
        </span>
        <span v-else-if="enable != null" class="b-inventory-variant__status"><i :class="enable ? '-active' : '-inactive'"></i>{{ $t(enable ? 'b_product_inventory.active' : 'b_product_inventory.inactive') }}</span>
        <span v-if="quantity <= 0" class="b-inventory-variant__status"><v-icon size="14">inventory_2</v-icon>{{ $t('b_product_inventory.out_of_stock') }}</span>
        <span v-if="missing_options.length" class="b-inventory-variant__status" tabindex="0" @click.stop @keydown.stop>
          <v-icon size="14">warning_amber</v-icon>{{ $t('b_product_inventory.missing_option') }}
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>{{ $t('b_product_inventory.options_missing_help') }}</v-tooltip>
        </span>
        <span v-if="is_duplicated" class="b-inventory-variant__status"><v-icon size="14">content_copy</v-icon>{{ $t('b_product_inventory.duplicate_options') }}</span>
        <span v-if="badge || loading" class="b-inventory-variant__status"><v-progress-circular v-if="loading" size="18" width="2" indeterminate /><span v-else>{{ badge }}</span></span>
      </div>

      <div class="b-inventory-variant__actions" @click.stop @keydown.stop>
        <v-btn v-if="!is_deleted" class="sd-modern-icon-button" :icon="productWorkspace ? true : 'edit'" variant="text" size="small" :disabled="busy_delete || busy_restore" :aria-label="$t('b_product_inventory.edit_variant')" @click="selectVariant">
          <b-product-edit-info-icon v-if="productWorkspace" name="Pencil" :size="16" />
          <v-icon v-else size="17">edit</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>{{ $t('b_product_inventory.edit_variant') }}</v-tooltip>
        </v-btn>
        <v-btn v-if="hasDelete" class="sd-modern-icon-button" :icon="productWorkspace ? true : is_deleted ? 'restore' : 'delete_outline'" variant="text" size="small" :loading="busy_delete || busy_restore" :aria-label="$t(is_deleted ? 'global.actions.restore' : 'global.actions.delete')" @click="is_deleted ? showRestoreDialog() : showDeleteDialog()">
          <b-product-edit-info-icon v-if="productWorkspace" :name="is_deleted ? 'RotateCcw' : 'Trash2'" :size="16" />
          <v-icon v-else size="17">{{ is_deleted ? 'restore' : 'delete_outline' }}</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start" open-on-focus open-on-click>{{ $t(is_deleted ? 'global.actions.restore' : 'global.actions.delete') }}</v-tooltip>
        </v-btn>
      </div>
    </div>
  </div>
  <div
    v-else
    :class="{
      disabled: busy_delete || busy_restore,
      'widget-hover pp': !is_deleted,
    }"
    class="b--product-variant-item widget rounded-18px d-flex flex-wrap my-2 p-3"
    @click="is_deleted ? undefined : $emit('select')"
  >
    <u-loading-progress v-if="busy_delete" color="red"></u-loading-progress>
    <u-loading-progress v-if="busy_restore" color="green"></u-loading-progress>

    <div class="absolute-top-start" style="z-index: 1; top: 2px">
      <v-icon
        v-if="enable != null"
        :color="enable ? 'green' : 'red'"
        :title="
          enable
            ? $t('product_variant_item.enable.true_tooltip')
            : $t('product_variant_item.enable.false_tooltip')
        "
        size="small"
        >{{ enable ? "check_circle" : "cancel" }}
      </v-icon>
      <v-chip
        v-if="is_duplicated"
        class="mx-1"
        color="amber"
        size="x-small"
        variant="elevated"
        title="There are multiple variants with the same values."
      >
        <v-icon class="blink-me-linear" size="x-small" start>warning</v-icon>

        {{ $t("product_variant_item.duplicated_variant") }}
      </v-chip>
    </div>

    <div
      class="flex-grow-0 border-end pe-3 d-flex align-items-center justify-center --blue"
    >
      <u-avatar-folder
        :side-icon="productVariant.image ? 'collections' : 'highlight_alt'"
        :size="68"
        :src="
          getShopImagePath(
            productVariant.image ? productVariant.image : product.icon,
            128,
          )
        "
        class="hover-scale-tiny"
        is-blue
        :tooltip="$t('product_variant_item.image.tooltip')"
        @dragend="dragleave"
        @dragleave="dragleave"
        @dragover="dragover"
        @drop="dropImage"
        elevated
      >
        <v-progress-circular
          v-if="uploading"
          class="center-absolute"
          color="blue"
          indeterminate
        ></v-progress-circular>
      </u-avatar-folder>
    </div>

    <div
      class="border-end-grater-md d-flex align-items-center justify-center max-w-300 text-left"
    >
      <div class="min-width-150 py-1 px-2">
        <p class="mb-1"><small>Code:</small> SPV{{ code }}</p>

        <p class="mb-1">
          <small>{{ $t("global.commons.sku") }}:</small> {{ sku ? sku : "-" }}
        </p>

        <p class="mb-1">
          <small>{{ $t("global.commons.mpn") }}:</small> {{ mpn ? mpn : "-" }}
        </p>
      </div>
    </div>

    <div
      class="flex-grow-1 md-3 border-end-grater-md p-1 d-flex align-items-center justify-center"
    >
      <div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Color ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->
        <div v-if="color" class="my-1 d-flex align-center">
          <v-icon
            :title="$t(GetVariantNameByCode('color', product))"
            class="me-2"
            color="#777"
            size="small"
          >
            {{ GetVariantIconByCode("color", product) }}
          </v-icon>

          <u-color-circle :color="color" :size="24"></u-color-circle>
        </div>
        <div
          v-else-if="validateVariants && validateVariants.includes('color')"
          class="small text-red pa-1"
        >
          <v-icon color="red" size="small">warning_amber</v-icon>

          {{ $t("product_variant_item.set_color_warning") }}
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Volume ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div v-if="volume" class="my-1">
          <v-icon
            :title="$t(GetVariantNameByCode('volume', product))"
            class="me-2"
            color="#777"
            size="small"
          >
            {{ GetVariantIconByCode("volume", product) }}
          </v-icon>
          <u-variant-asset-image
            :size="24"
            :value="volume"
          ></u-variant-asset-image>

          <span class="card-badge-info">
            {{ volume.removeVariantAsset() }}
          </span>
        </div>
        <div
          v-else-if="validateVariants && validateVariants.includes('volume')"
          class="small text-red pa-1"
        >
          <v-icon color="red" size="small">warning_amber</v-icon>

          {{ $t("product_variant_item.set_volume_warning") }}
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Pack ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div v-if="pack" class="my-1">
          <v-icon
            :title="$t(GetVariantNameByCode('pack', product))"
            class="me-2"
            color="#777"
            size="small"
          >
            {{ GetVariantIconByCode("pack", product) }}
          </v-icon>

          <span class="card-badge-info">
            <u-variant-asset-image
              :size="24"
              :value="pack"
            ></u-variant-asset-image>

            {{ pack.removeVariantAsset() }}<span class="text-muted">x</span>
          </span>
        </div>
        <div
          v-else-if="validateVariants && validateVariants.includes('pack')"
          class="small text-red pa-1"
        >
          <v-icon color="red" size="small">warning_amber</v-icon>

          {{ $t("product_variant_item.set_pack_warning") }}
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Weight ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div v-if="weight" class="my-1">
          <v-icon
            :title="$t(GetVariantNameByCode('weight', product))"
            class="me-2"
            color="#777"
            size="small"
          >
            {{ GetVariantIconByCode("weight", product) }}
          </v-icon>

          <u-variant-asset-image
            :size="24"
            :value="weight"
          ></u-variant-asset-image>

          <span class="card-badge-info">
            {{ weight.removeVariantAsset() }}
          </span>
        </div>
        <div
          v-else-if="validateVariants && validateVariants.includes('weight')"
          class="small text-red pa-1"
        >
          <v-icon color="red" size="small">warning_amber</v-icon>

          {{ $t("product_variant_item.set_weight_warning") }}
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Type ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div v-if="type" class="my-1">
          <v-icon
            :title="$t(GetVariantNameByCode('type', product))"
            class="me-2"
            color="#777"
            size="small"
          >
            {{ GetVariantIconByCode("type", product) }}
          </v-icon>
          <u-variant-asset-image
            :size="24"
            :value="type"
          ></u-variant-asset-image>

          <span class="card-badge-info"> {{ type.removeVariantAsset() }} </span>
        </div>
        <div
          v-else-if="validateVariants && validateVariants.includes('type')"
          class="small text-red pa-1"
        >
          <v-icon color="red" size="small">warning_amber</v-icon>

          {{ $t("product_variant_item.set_type_warning") }}
        </div>
        <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Style ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

        <div v-if="style" class="my-1">
          <v-icon
            :title="$t(GetVariantNameByCode('style', product))"
            class="me-2"
            color="#777"
            size="small"
          >
            {{ GetVariantIconByCode("style", product) }}
          </v-icon>
          <u-variant-asset-image
            :size="24"
            :value="style"
          ></u-variant-asset-image>
          <span class="card-badge-info">
            {{ style.removeVariantAsset() }}
          </span>
        </div>
        <div
          v-else-if="validateVariants && validateVariants.includes('style')"
          class="small text-red pa-1"
        >
          <v-icon color="red" size="small">warning_amber</v-icon>

          {{ $t("product_variant_item.set_style_warning") }}
        </div>
      </div>
    </div>
    <!-- ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ Pricing ▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃ -->

    <div
      class="flex-grow-1 border-end-grater-md p-1 d-flex align-items-center justify-center max-w-300"
    >
      <div>
        <p class="mb-1">
          {{ $t("product_admin.inventory.variant_item.price") }}
          :

          <u-price
            v-if="discount"
            :amount="price"
            :currency="currency"
            class="me-2"
            line-through
            title="Net price before discount."
          ></u-price>

          <u-price
            :amount="price - discount"
            :currency="currency"
            class="text-success"
          ></u-price>
        </p>

        <u-time-progress-bar
          v-if="productVariant.pricing"
          :created-time="productVariant.created_at"
          :end-time="productVariant.dis_end"
          :start-time="productVariant.dis_start"
          class="mx-auto"
        />
        <u-time-progress-bar
          v-else
          :created-time="product.created_at"
          :end-time="product.dis_end"
          :start-time="product.dis_start"
          class="mx-auto"
        />

        <small v-if="!productVariant.pricing">
          ● {{ $t("product_admin.inventory.variant_item.same_as_product") }}
        </small>

        <!-- ▀▀▀▀▀▀▀▀▀ 🌸 Add extra pricing 🌸 ▀▀▀▀▀▀▀▀▀ -->
        <extra-pricing-levels
          v-if="extra_pricings?.length"
          :extra-pricings="extra_pricings"
          :inventory-quantity="quantity"
          :product="product"
        ></extra-pricing-levels>
        <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      </div>
    </div>

    <div
      class="flex-grow-1 p-1 d-flex flex-column align-items-center justify-center max-w-200"
    >
      <p class="m-0">
        {{ $t("product_admin.inventory.variant_item.in_stock") }}
        :
        <span class="card-badge-info text-success">
          {{ numeralFormat(quantity, "0,0") }}
        </span>
      </p>

      <u-cube
        v-if="extra"
        :color="invalid_size ? '#cccccc' : undefined"
        :size="42"
        :x="invalid_size ? 50 : extra.width"
        :y="invalid_size ? 50 : extra.length"
        :z="invalid_size ? 50 : extra.height"
        no-animation
      />

      <v-chip v-if="quantity <= 0" class="ma-1" color="red" label size="small">
        <v-icon start>error_outline</v-icon>

        {{ $t("product_variant_item.out_of_stock") }}
      </v-chip>

      <v-chip
        v-if="productVariant.deleted_at"
        class="ma-1"
        color="red"
        label
        size="small"
        variant="elevated"
      >
        <v-icon start>delete</v-icon>
        {{ getFromNowString(productVariant.deleted_at) }}
        <v-tooltip activator="parent">
          Removed at {{ getLocalTimeString(productVariant.deleted_at) }}
        </v-tooltip>
      </v-chip>
    </div>

    <div
      v-if="badge || loading"
      class="blue-badge m-2 align-self-center flex-grow-0"
    >
      <v-progress-circular v-if="loading" color="#fff" indeterminate>
      </v-progress-circular>
      <span v-else>{{ badge }}</span>
    </div>

    <div v-if="hasDelete" class="m-2 align-self-center flex-grow-0">
      <u-button-circle
        v-if="!productVariant.deleted_at"
        :loading="busy_delete"
        :tooltip="$t('global.actions.delete')"
        icon="close"
        icon-color="red"
        @click="showDeleteDialog()"
      />
      <u-button-circle
        v-else
        :loading="busy_restore"
        :tooltip="$t('global.actions.restore')"
        icon="cached"
        icon-color="#673AB7"
        @click="showRestoreDialog()"
      />
    </div>
  </div>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import UTimeProgressBar from "../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import ExtraPricingLevels from "../../../extra-pricing/ExtraPricingLevels.vue";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import {
  GetVariantIconByCode,
  GetVariantNameByCode,
  GetVariantOrderIndexByCode,
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants";
import { UploadHelper } from "@selldone/components-vue/utils/upload/UploadHelper.ts";
import UAvatarFolder from "../../../../ui/avatar/folder/UAvatarFolder.vue";
import UCube from "../../../../ui/cube/UCube.vue";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import BProductEditInfoIcon from "../../edit/info/BProductEditInfoIcon.vue";

export default {
  name: "BProductVariantItem",
  mixins: [DateMixin],
  components: {
    BProductEditInfoIcon,
    UCube,
    UAvatarFolder,
    UColorCircle,
    UVariantAssetImage,
    ExtraPricingLevels,
    UTimeProgressBar,
  },
  emits: ["delete", "restore", "select"],
  props: {
    modern: { type: Boolean, default: false },
    productWorkspace: { type: Boolean, default: false },
    productVariant: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    hasDelete: {
      default: false,
      type: Boolean,
    },
    badge: {},
    loading: {},

    validateVariants: {
      type: Array,
    },
  },
  data() {
    return {
      ProductVariants: ProductVariants,
      GetVariantNameByCode: GetVariantNameByCode,
      GetVariantIconByCode: GetVariantIconByCode,

      busy_restore: false,
      busy_delete: false,

      uploading: false,
      option_tooltips: {},
    };
  },
  computed: {
    has_pricing_details() {
      const source = this.productVariant.pricing ? this.productVariant : this.product;
      return !!(source.discount || source.dis_start || source.dis_end || this.extra_pricings?.length);
    },
    option_keys() {
      return Object.keys(ProductVariants)
        .filter((key) => this.productVariant[key] || this.validateVariants?.includes(key))
        .sort((a, b) => GetVariantOrderIndexByCode(a, this.product) - GetVariantOrderIndexByCode(b, this.product));
    },
    missing_options() {
      return this.validateVariants?.filter((key) => !this.productVariant[key]) || [];
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_deleted() {
      return !!this.productVariant.deleted_at;
    },

    enable() {
      return this.productVariant.enable;
    },

    code() {
      return this.productVariant.id;
    },

    sku() {
      return this.productVariant.sku;
    },

    mpn() {
      return this.productVariant.mpn;
    },

    color() {
      return this.productVariant.color;
    },
    weight() {
      return this.productVariant.weight;
    },
    volume() {
      return this.productVariant.volume;
    },
    style() {
      return this.productVariant.style;
    },
    pack() {
      return this.productVariant.pack;
    },
    quantity() {
      return this.productVariant.quantity;
    },
    price() {
      return this.productVariant.pricing
        ? this.productVariant.price
        : this.product.price;
    },
    discount() {
      return this.productVariant.pricing
        ? this.productVariant.discount
        : this.product.discount;
    },
    type() {
      return this.productVariant.type;
    },
    currency() {
      return this.productVariant.pricing
        ? this.productVariant.currency
        : this.product.currency;
    },

    extra_pricings() {
      return this.product?.extra_pricings?.filter(
        (x) =>
          ((this.productVariant.pricing &&
            x.variant_id ===
              this.productVariant.id) /*Independent pricing mode.*/ ||
            (!this.productVariant.pricing &&
              !x.variant_id)) /*It inherits the value from product*/ &&
          !x.product_vendor_id /*Extra pricing options for vendors are accessible only in the "Vendors" tab, not in the main product's vendor section.*/,
      );
    },

    is_duplicated() {
      return (
        this.product?.product_variants?.filter(
          (v) =>
            v.type === this.productVariant.type &&
            v.color === this.productVariant.color &&
            v.style === this.productVariant.style &&
            v.volume === this.productVariant.volume &&
            v.weight === this.productVariant.weight &&
            v.pack === this.productVariant.pack,
        ).length > 1
      );
    },

    extra() {
      return this.productVariant.extra
        ? this.productVariant.extra
        : this.product.extra;
    },

    invalid_size() {
      return !(this.extra?.width && this.extra?.length && this.extra?.height);
    },
  },
  methods: {
    selectVariant() {
      if (!this.is_deleted && !this.busy_delete && !this.busy_restore) this.$emit('select');
    },
    optionLabel(key) {
      const value = this.productVariant[key];
      const label = key === 'color' ? GetNameOfColor(value) : value?.removeVariantAsset().trim();
      const name = this.$t(GetVariantNameByCode(key, this.product));
      return label ? this.$t('b_product_inventory.option_help', { name, value: label }) : name;
    },
    showDeleteDialog() {
      NotificationService.openDangerAlert(
        this.$t("product_admin.inventory.variant_item.delete_dialog.title"),
        this.$t("product_admin.inventory.variant_item.delete_dialog.message"),
        this.$t("global.actions.delete"),
        () => {
          this.deleteProductVariant();
        },
      );
    },

    showRestoreDialog() {
      NotificationService.openDangerAlert(
        this.$t("product_variant_item.restore_dialog.title"),

        this.$t("product_variant_item.restore_dialog.message"),
        this.$t("product_variant_item.restore_dialog.action"),
        () => {
          this.restoreProductVariant();
        },
      );
    },

    dragover(event) {
      event.preventDefault();
      // Add some visual fluff to show the user can drop its files
      if (!event.currentTarget.parentNode.classList.contains("ripple-focus")) {
        event.currentTarget.parentNode.classList.add("ripple-focus");
      }
      if (!event.currentTarget.classList.contains("op-0-3")) {
        event.currentTarget.classList.add("op-0-3");
      }
    },
    dragleave(event) {
      // Clean up
      event.currentTarget.parentNode.classList.remove("ripple-focus");
      event.currentTarget.classList.remove("op-0-3");
    },

    dropImage(event) {
      event.preventDefault();
      this.dragleave(event);

      const image_files = Object.values(event.dataTransfer.files).filter((i) =>
        i.type.includes("image"),
      );
      if (image_files.length) {
        this.uploading = true;

        image_files.forEach((file) => {
          const url = this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
            ? window.VAPI.POST_MY_VENDOR_UPLOAD_PRODUCT_COVER(
                this.$route.params.vendor_id,
                this.product.id,
                this.productVariant.id,
              )
            : window.API.POST_UPLOAD_PRODUCT_COVER(
                this.$route.params.shop_id,
                this.product.id,
                this.productVariant.id,
              );

          UploadHelper.UploadFile(
            this,
            null,
            url,
            file.name,
            file,
            "photo",
            { "auto-set-main": "true" },
            true,
            (data) => {
              if (data.files.path) {
                if (!this.productVariant.image)
                  // Set variant image!
                  this.productVariant.image = data.files.path;
                this.$forceUpdate();
              }

              if (data.files.item) {
                this.AddOrUpdateItemByID(this.product.images, data.files.item);
              }

              this.uploading = false;
            },
          );
        });
      }
    },
    //――――――――――――――――――――――― Variant ▶ Delete ―――――――――――――――――――――――

    deleteProductVariant() {
      this.busy_delete = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.variants.remove(
            this.product.vendor_id,
            this.product.id,
            this.productVariant.id,
          )
        : window.$backoffice.product.variants.remove(
            this.product.shop_id,
            this.product.id,
            this.productVariant.id,
          )
      )

        .then(({ variants, quantity }) => {
          NotificationService.showSuccessAlert(
            null,
            this.$t(
              "product_admin.inventory.variants.notifications.delete_success",
            ),
          );
          this.product.variants = variants;
          this.product.quantity = quantity;

          this.dialog = false;

          this.productVariant.deleted_at = new Date().toISOString();
          this.$emit("delete", this.productVariant.id);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_delete = false;
        });
    },

    //――――――――――――――――――――――― Variant ▶ Restore ―――――――――――――――――――――――

    restoreProductVariant() {
      this.busy_restore = true;

      (this.IS_VENDOR_PANEL /*🟢 Vendor Panel 🟢*/
        ? window.$vendor.product.variants.restore(
            this.product.vendor_id,
            this.product.id,
            this.productVariant.id,
          )
        : window.$backoffice.product.variants.restore(
            this.product.shop_id,
            this.product.id,
            this.productVariant.id,
          )
      )

        .then(({ variants, quantity, product_variant }) => {
          NotificationService.showSuccessAlert(
            null,
            this.$t(
              "product_variant_item.notifications.restore_variant_success",
            ),
          );
          this.product.variants = variants;
          this.product.quantity = quantity;

          this.$emit("restore", product_variant);
        })
        .catch((error) => {
          NotificationService.showLaravelError(error);
        })
        .finally(() => {
          this.busy_restore = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.b--product-variant-item {
  font-weight: 500;
  min-height: 90px;
  position: relative;
  flex-direction: row !important;
  background: #fff;
}

.card-badge-info {
  color: slategrey;
  user-select: none;
  padding: 0 3px;
  font-weight: 600;
  font-size: 0.8em;
}

.b-inventory-variant {
  border-block-end: 1px solid var(--sd-modern-border);
  padding-block: 2px;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;

  &__row { position: relative; display: grid; grid-template-columns: var(--inventory-columns); align-items: center; gap: 12px; min-height: 87px; padding: 12px; border-radius: 8px; }
  &__row > div { min-width: 0; }
  &__identity { display: flex; gap: 10px; align-items: center; }
  &__image { flex: 0 0 auto; }
  &__identifiers { min-width: 0; flex: 1; }
  &__code { display: inline-block; font-size: 12px; font-weight: 500; margin-block-end: 2px; }
  &__identifier { display: flex; gap: 3px; font-size: 10px; line-height: 16px; color: var(--sd-modern-muted); }
  &__identifier bdi { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  &__identifier > span { flex: 0 0 auto; }
  &__options { display: flex; flex-direction: column; gap: 2px; }
  &__option { display: flex; align-items: center; gap: 5px; min-width: 0; min-height: 23px; }
  &__option > .v-icon { color: var(--sd-modern-muted); }
  &__value { display: inline-flex; align-items: center; gap: 5px; min-width: 0; border-radius: 4px; text-align: start; }
  &__value > span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  &__value:focus-visible, &__identifier:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
  &__preview { display: flex; align-items: center; gap: 10px; max-width: 260px; }
  &__image-preview { display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 230px; }
  &__image-preview img { object-fit: contain; border-radius: 8px; }
  &__missing { font-size: 10px; color: var(--sd-modern-muted); }
  &__pricing { display: flex; flex-direction: column; gap: 3px; }
  &__price-summary { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 8px; }
  &__price { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-weight: 500; }
  &__inheritance { font-size: 10px; color: var(--sd-modern-muted); }
  &__period { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0 5px; font-size: 11px; line-height: 16px; }
  &__period :deep(p) { text-align: start !important; margin: 0 !important; white-space: nowrap; }
  &__period :deep(.v-progress-linear) { flex-basis: 100%; order: 1; }
  &__period :deep(.mx-2) { margin-inline: 0 !important; }
  &__period :deep(.v-icon) { font-size: 13px; margin-inline: 3px; }
  &__tiers { display: grid; grid-template-columns: minmax(50px, 1fr) max-content; align-items: end; gap: 6px; }
  &__tiers :deep(> small) { font-size: 10px; line-height: 16px; text-align: start; }
  &__stock { display: flex; flex-direction: column; align-items: flex-start; gap: 3px; }
  &__stock > b { font-size: 14px; font-weight: 500; }
  &__availability { display: flex; flex-direction: column; gap: 4px; }
  &__caption { display: none; }
  &__status { display: flex; align-items: center; gap: 4px; font-size: 10px; line-height: 15px; }
  &__status i { display: inline-block; width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: #999; }
  &__status i.-active { background: #43a859; }
  &__status i.-inactive { background: #d19a38; }
  &__actions { display: flex; align-items: center; justify-content: flex-end; gap: 4px; }
  &__actions .v-btn { width: 32px; height: 32px; border-radius: 7px; }

  @media (max-width: 959px) {
    &__row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px 16px; padding: 12px; }
    &__identity { grid-column: 1 / -1; padding-inline-end: 92px; min-height: 48px; }
    &__identifier { max-width: 240px; }
    &__options, &__pricing, &__stock, &__availability { align-self: start; }
    &__caption { display: block; margin-block-end: 3px; }
    &__actions { position: absolute; inset-inline-end: 12px; top: 12px; }
    &__actions .v-btn { width: 44px; height: 44px; }
    &__value { min-height: 44px; }
  }
  @media (max-width: 359px) {
    &__row { gap: 10px; }
    &__identity { gap: 7px; }
    &__code { font-size: 11px; }
  }
}

.b-inventory-variant--workspace {
  padding-block: 0;

  .b-inventory-variant__row {
    grid-template-columns: var(--inventory-columns);
    gap: 10px;
    min-height: 96px;
    padding: 15px 12px;
    border-radius: 10px;
  }
  .b-inventory-variant__identity {
    grid-column: auto;
    grid-row: auto;
    min-height: 40px;
    padding-inline-end: 0;
    gap: 9px;
  }
  .b-inventory-variant__identifier {
    max-width: none;
    font-size: 11px;
    line-height: 17px;
  }
  .b-inventory-variant__code { font-size: 12px; line-height: 20px; }
  .b-inventory-variant__option { min-height: 20px; gap: 5px; }
  .b-inventory-variant__value { min-height: 20px; max-width: 100%; }
  .b-inventory-variant__caption { display: none; }
  .b-inventory-variant__missing,
  .b-inventory-variant__inheritance,
  .b-inventory-variant__status,
  .b-inventory-variant__tiers :deep(> small) { font-size: 11px; line-height: 18px; }
  .b-inventory-variant__price-summary { display: grid; gap: 1px; }
  .b-inventory-variant__price { font-size: 12px; line-height: 19px; font-variant-numeric: tabular-nums; }
  .b-inventory-variant__pricing :deep(.u--price .small) { font-size: 11px !important; line-height: 18px; }
  .b-inventory-variant__stock > b { font-size: 13px; line-height: 19px; font-variant-numeric: tabular-nums; }
  .b-inventory-variant__options,
  .b-inventory-variant__pricing,
  .b-inventory-variant__stock,
  .b-inventory-variant__availability { align-self: center; grid-column: auto; grid-row: auto; }
  .b-inventory-variant__status { gap: 4px; }
  .b-inventory-variant__actions {
    position: static;
    grid-column: auto;
    grid-row: auto;
    gap: 8px;
  }
  .b-inventory-variant__actions .v-btn { width: 32px; min-width: 32px; height: 32px; border-radius: 8px; }
  .b-inventory-variant__actions :deep(.v-btn__content > .v-icon) { font-size: 16px; }
  .b-inventory-variant__pricing-details { min-width: 0; font-size: 11px; line-height: 18px; }
  .b-inventory-variant__pricing-details > summary {
    padding-block: 3px;
    overflow-wrap: anywhere;
    color: var(--sd-modern-muted);
  }
  .b-inventory-variant__pricing-details[open] > summary { margin-block-end: 8px; }
  .b-inventory-variant__configured-offer { display: grid; gap: 2px; margin: 0 0 8px; }
  .b-inventory-variant__configured-offer > span { color: var(--sd-modern-muted); }
  .b-inventory-variant__period,
  .b-inventory-variant__tiers { margin-block-start: 8px; }
  .b-inventory-variant__period :deep(p) { white-space: normal; overflow-wrap: anywhere; }

  @container product-inventory (max-width: 720px) {
    .b-inventory-variant__row { grid-template-columns: minmax(110px, 1.3fr) minmax(80px, 1fr) minmax(78px, .9fr) minmax(54px, .6fr) var(--inventory-action-width, 72px); }
    .b-inventory-variant__identity,
    .b-inventory-variant__options,
    .b-inventory-variant__pricing { grid-row: 1 / 3; }
    .b-inventory-variant__stock { grid-column: 4; grid-row: 1; align-self: end; }
    .b-inventory-variant__availability { grid-column: 4; grid-row: 2; align-self: start; }
    .b-inventory-variant__status { white-space: nowrap; }
    .b-inventory-variant__actions { grid-column: 5; grid-row: 1 / 3; }
  }

  @container product-inventory (max-width: 650px) {
    .b-inventory-variant__row { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 13px 18px; padding-block: 17px; }
    .b-inventory-variant__identity { grid-column: 1 / -1; grid-row: auto; padding-inline-end: 104px; min-height: 44px; }
    .b-inventory-variant__options,
    .b-inventory-variant__pricing,
    .b-inventory-variant__stock,
    .b-inventory-variant__availability { grid-column: auto; grid-row: auto; align-self: start; }
    .b-inventory-variant__caption { display: block; margin-block-end: 3px; font-size: 11px; line-height: 18px; font-weight: 400; text-transform: none; letter-spacing: 0; }
    .b-inventory-variant__actions { position: absolute; inset-inline-end: 12px; top: 17px; grid-column: auto; grid-row: auto; }
    .b-inventory-variant__actions .v-btn { width: 44px; min-width: 44px; height: 44px; }
    .b-inventory-variant__value { min-height: 28px; }
    .b-inventory-variant__status { white-space: normal; }
    .b-inventory-variant__pricing-details > summary { min-height: 44px; display: flex; align-items: center; }
  }

  @container product-inventory (max-width: 380px) {
    .b-inventory-variant__row { gap: 12px; }
    .b-inventory-variant__identity { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 4px 9px; padding-inline-end: 0; }
    .b-inventory-variant__image { grid-column: 1; grid-row: 1; }
    .b-inventory-variant__identifiers { display: contents; }
    .b-inventory-variant__code { grid-column: 2; grid-row: 1; padding-inline-end: 96px; overflow-wrap: normal; white-space: nowrap; align-self: center; margin: 0; }
    // The Latin code stays LTR, so its reserved action space must follow the row direction.
    .b-inventory-variant__row:dir(rtl) .b-inventory-variant__code { padding-inline-start: 96px; padding-inline-end: 0; text-align: end; }
    .b-inventory-variant__identifier { grid-column: 1 / -1; min-width: 0; }
    .b-inventory-variant__actions { top: 17px; }
  }

  @media (pointer: coarse) {
    .b-inventory-variant__actions .v-btn { width: 44px; min-width: 44px; height: 44px; }
    .b-inventory-variant__value,
    .b-inventory-variant__pricing-details > summary { min-height: 44px; }
  }
}
</style>
