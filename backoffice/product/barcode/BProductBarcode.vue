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
  <v-dialog
    :model-value="modelValue"
    :max-width="barcode2d ? 520 : 640"
    :aria-label="dialog_title"
    scrollable
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card class="sd-modern-widget b-product-barcode b-product-barcode--compact text-start" :class="{ 'b-product-barcode--qr': barcode2d }" :theme="USER()?.preferences?.dark ? 'dark' : 'light'">
      <header class="b-product-barcode__header">
        <div class="b-product-barcode__heading">
          <v-icon size="22" aria-hidden="true">{{ barcode2d ? 'qr_code_2' : 'view_week' }}</v-icon>
          <div><h2>{{ dialog_title }}</h2><p>{{ dialog_subtitle }}</p></div>
        </div>
        <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t('global.actions.close')" @click="$emit('update:modelValue', false)">
          <v-icon>close</v-icon>
          <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('global.actions.close') }}</v-tooltip>
        </v-btn>
      </header>

      <v-card-text class="b-product-barcode__body">
        <template v-if="qrcode_value">
          <div class="b-product-barcode__identity">
            <div class="b-product-barcode__product">
              <v-avatar rounded="lg" size="38">
                <v-img v-if="product.icon" :src="getShopImagePath(product.icon, 128)" :alt="product.title" />
                <v-icon v-else size="22" aria-hidden="true">inventory_2</v-icon>
              </v-avatar>
              <div>
                <h3>{{ product.title }}</h3>
                <div class="b-product-barcode__price">
                  <span>{{ barcode_price }}</span>
                  <v-btn icon variant="text" class="sd-modern-icon-button sd-modern-info-button" :aria-label="$t('b_product_dashboard.barcode.caption_help')" @click="price_help_open = true" @keydown.esc="price_help_open = false">
                    <v-icon size="14">info_outline</v-icon>
                    <v-tooltip v-model="price_help_open" activator="parent" location="top" open-on-focus :open-on-click="false" content-class="sd-modern-tooltip text-start">{{ $t('b_product_dashboard.barcode.caption_help') }}</v-tooltip>
                  </v-btn>
                </div>
              </div>
            </div>
            <variant-item-view-micro v-if="variant" :product-variant="variant" :dark="!!USER()?.preferences?.dark" class="b-product-barcode__variant" />
          </div>

          <div v-if="!barcode2d" class="b-product-barcode__settings">
            <div class="b-product-barcode__format">
              <span>{{ $t('b_product_dashboard.barcode.format') }}</span>
              <v-tabs v-model="format" :aria-label="$t('b_product_dashboard.barcode.format')" height="44" hide-slider show-arrows class="b-product-barcode__formats">
                <v-tab v-for="item in available_formats" :key="item.value" :value="item.value">{{ item.title }}</v-tab>
              </v-tabs>
            </div>
            <div class="b-product-barcode__height">
              <span>{{ $t('b_product_dashboard.barcode.height') }}</span>
              <v-btn variant="text" class="sd-modern-button sd-modern-button--small" prepend-icon="height" :aria-label="$t('b_product_dashboard.barcode.change_height')" @click="toggleHeight">
                <bdi>{{ height }} px</bdi>
                <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t('b_product_dashboard.barcode.height_help') }}</v-tooltip>
              </v-btn>
            </div>
          </div>

          <div class="b-product-barcode__well" :class="{ 'b-product-barcode__well--linear': !barcode2d }">
            <div v-if="barcode2d" class="b-product-barcode__qr-paper" dir="ltr">
            <u-qrcode
              id="qr_code_container"
              :options="{
                width: qr_size,
                margin: 4,
                errorCorrectionLevel: 'H',
                color: { dark: '#202124', light: '#FFFFFF' },
              }"
              :title="qrcode_value"
              :value="qrcode_value"
              @ready="onQrReady"
              @vue:unmounted="qr_ready = false"
            />
              <img v-if="product.icon" class="b-product-barcode__qr-logo" :src="getShopImagePath(product.icon, 128)" alt="" />
            </div>
            <div v-else id="bar_code_container" class="b-product-barcode__linear-paper" dir="ltr" @click="toggleHeight">
              <p class="b-product-barcode__caption" dir="auto">{{ barcode_text }}</p>
              <u-barcode v-if="barcode_valid" :format="format" :height="height" :title="qrcode_value" :value="qrcode_value" background="#fff" line-color="#000">
                {{ $t('b_product_dashboard.barcode.render_error') }}
              </u-barcode>
              <p v-else role="status" class="b-product-barcode__render-error">{{ $t('b_product_dashboard.barcode.render_error') }}</p>
            </div>
          </div>

          <div class="b-product-barcode__payload">
            <p class="b-product-barcode__value-label">{{ $t(linkMode ? 'b_product_dashboard.barcode.product_link' : 'b_product_dashboard.barcode.sku') }}</p>
            <div class="b-product-barcode__value">
              <span dir="ltr">{{ qrcode_value }}</span>
              <v-btn icon variant="text" class="sd-modern-icon-button" :aria-label="$t(linkMode ? 'b_product_dashboard.barcode.copy_link' : 'b_product_dashboard.barcode.copy_sku')" @click="copyToClipboard(qrcode_value)">
                <v-icon>content_copy</v-icon>
                <v-tooltip activator="parent" location="top" content-class="sd-modern-tooltip text-start">{{ $t(linkMode ? 'b_product_dashboard.barcode.copy_link' : 'b_product_dashboard.barcode.copy_sku') }}</v-tooltip>
              </v-btn>
            </div>
          </div>
        </template>
        <p v-else role="status" class="b-product-barcode__empty">{{ $t('b_product_dashboard.barcode.unavailable') }}</p>
      </v-card-text>

      <v-card-actions class="b-product-barcode__actions">
        <v-btn variant="text" class="sd-modern-button sd-modern-button--form" @click="$emit('update:modelValue', false)">{{ $t('global.actions.close') }}</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="sd-modern-button sd-modern-button--form sd-modern-button--primary"
            :disabled="!qrcode_value || (barcode2d ? !qr_ready : !barcode_valid)"
            @click="
              Print.PrintElement(
                barcode2d ? 'qr_code_container' : 'bar_code_container',
              )
            "
          >
            <v-icon start aria-hidden="true">print</v-icon>
            {{ $t("global.actions.print") }}
          </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Print } from "@selldone/core-js/helper/canvas/Print";
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import { ShopURLs} from "@selldone/core-js/helper";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import {GetNameOfColor} from "@selldone/core-js/helper/color/ColorHelper.ts";
import JsBarcode from "jsbarcode";

export default {
  name: "BProductBarcode",
  mixins: [CurrencyMixin],
  emits: ["update:modelValue"],
  components: { VariantItemViewMicro },
  props: {
    modelValue: {},
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    variant: {
      required: false,
      type: Object,
    },
    barcode2d: {
      type: Boolean,
      default: false,
    },
    linkMode: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    Print: Print,

    qr_size: 280,
    qr_ready: false,
    price_help_open: false,
    qrcode_value: null,

    barcode_text: "",

    format: "CODE128",
    height: 100,
  }),

  computed: {
    dialog_title() {
      return this.$t(`b_product_dashboard.barcode.${this.barcode2d ? this.linkMode ? 'qr_title' : 'sku_qr_title' : 'barcode_title'}`);
    },
    dialog_subtitle() {
      return this.$t(`b_product_dashboard.barcode.${this.barcode2d ? this.linkMode ? 'qr_subtitle' : 'sku_qr_subtitle' : 'barcode_subtitle'}`);
    },
    barcode_price() {
      const pricing = this.variant?.pricing ? this.variant : this.product;
      return this.getFormatPriceCurrency(pricing.price + pricing.commission, pricing.currency);
    },
    barcode_valid() {
      if (!this.qrcode_value) return false;
      let valid = false;
      try {
        JsBarcode({}, String(this.qrcode_value), { format: this.format, valid: (value) => { valid = value; } });
      } catch {
        return false;
      }
      return valid;
    },
    link() {
      return `${ShopURLs.MainShopUrl(this.shop)}/product/${this.product.id}`;
    },

    available_formats() {
      const value = String(this.qrcode_value ?? '');
      let out = [
        { title: "CODE128", value: "CODE128" },

        { title: "CODE39", value: "CODE39" },
        { title: "MSI", value: "MSI" },
      ];

      if (value.length === 12) {
        out.push({ title: "EAN13", value: "ean13" });
      }
      if (value.length === 14) {
        out.push({ title: "ITF14", value: "ITF14" });
      }

      if (isNaN(value)) {
        let val = parseInt(value);
        if (val > 3 && val < 131070)
          out.push({ title: "Pharmacode", value: "pharmacode" });
      }

      return out;
    },
  },
  watch: {
    product() {
      this.initialize();
    },
    variant() {
      this.initialize();
    },
    linkMode() {
      this.initialize();
    },
    barcode2d() {
      this.qr_ready = false;
      this.initialize();
    },
    modelValue(value) {
      if (value) this.initialize();
      else this.price_help_open = false;
    },
  },

  methods: {
    onQrReady(element) {
      if (element?.width > 0 && element?.height > 0) this.qr_ready = true;
    },
    toggleHeight() {
      this.height = this.height === 100 ? 75 : this.height === 75 ? 50 : 100;
    },
    initialize() {
      const previous = this.qrcode_value;
      if (this.linkMode) {
        this.qrcode_value = this.link;
      } else {
        this.qrcode_value = this.variant ? this.variant.sku : this.product.sku;
      }
      if (previous !== this.qrcode_value) this.qr_ready = false;
      if (!this.available_formats.some(item => item.value === this.format)) this.format = 'CODE128';

      this.barcode_text = this.getBarcodeName(this.product, this.variant);
    },
    getBarcodeName(product, variant) {
      if (!variant) {
        const product_short_name = this.barcode2d
          ? product.title
          : product.title.split(" ").slice(0, 3).join(" ");

        let price = this.getFormatPriceCurrency(
          product.price + product.commission,
          product.currency,
        );

        return `${product_short_name} ${price}`;
      } else {
        const product_short_name = this.barcode2d
          ? product.title
          : product.title.split(" ").slice(0, 2).join(" ");
        let variant_name = "";
        // Color:
        if (variant.color)
          variant_name += GetNameOfColor(variant.color)
            ? GetNameOfColor(variant.color)
            : variant.color;

        ["style", "volume", "weight", "pack", "type"].forEach((key) => {
          if (variant[key]) {
            variant_name += (" " + variant[key]).removeVariantAsset();
          }
        });

        let price = variant.pricing
          ? this.getFormatPriceCurrency(
              variant.price + variant.commission,
              variant.currency,
            )
          : this.getFormatPriceCurrency(
              product.price + product.commission,
              product.currency,
            );

        return `${product_short_name} ${variant_name} ${price}`;
      }
    },
  },

  mounted() {
    this.initialize();
  },
};
</script>

<style scoped lang="scss">
.b-product-barcode.v-card {
  padding: 0;
  border-radius: 16px;
  font-family: inherit;
  font-size: 14px;
  line-height: 21px;

  .b-product-barcode__header {
    display: flex; flex: 0 0 auto; align-items: flex-start; justify-content: space-between; gap: 16px;
    padding: 22px 24px 20px; border-block-end: 1px solid var(--sd-modern-border);
  }
  .b-product-barcode__heading { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
  .b-product-barcode__heading > .v-icon { flex-shrink: 0; margin-block-start: 2px; }
  h2 { margin: 0; font-size: 18px; font-weight: 500; line-height: 27px; }
  .b-product-barcode__header p { margin: 2px 0 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  .b-product-barcode__body { min-width: 0; min-height: 0; padding: 22px 24px 24px; font: inherit; }
  .b-product-barcode__product { display: flex; align-items: center; gap: 10px; margin-block-end: 18px; }
  .b-product-barcode__product > .v-avatar { flex-shrink: 0; background: var(--sd-modern-inset); }
  .b-product-barcode__product > div { min-width: 0; }
  h3 { margin: 0; font-size: 14px; font-weight: 500; line-height: 21px; overflow-wrap: anywhere; }
  .b-product-barcode__price { display: flex; align-items: center; gap: 4px; margin: 2px 0 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  .b-product-barcode__variant { flex-wrap: wrap; gap: 4px 8px; margin-block: -8px 18px; }
  .b-product-barcode__variant :deep(.card-badge-info) { font-size: 12px; font-weight: 400; color: rgb(var(--v-theme-on-surface)); }

  .b-product-barcode__settings { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; margin-block-end: 18px; }
  .b-product-barcode__format { flex: 1 1 300px; min-width: 0; }
  .b-product-barcode__format > span,
  .b-product-barcode__height > span { display: block; margin-block-end: 6px; font-size: 12px; color: var(--sd-modern-muted); }
  .b-product-barcode__height { flex: 0 0 auto; }
  .b-product-barcode__formats { padding: 3px; border-radius: 10px; background: var(--sd-modern-inset); }
  .b-product-barcode__formats :deep(.v-slide-group__content) { gap: 3px; }
  .b-product-barcode__formats :deep(.v-tab) {
    min-width: 80px; padding-inline: 12px; border-radius: 7px; color: var(--sd-modern-muted);
    font-family: inherit; font-size: 12px; font-weight: 400; letter-spacing: 0; text-transform: none;
  }
  .b-product-barcode__formats :deep(.v-tab--selected) { color: rgb(var(--v-theme-on-surface)); background: rgb(var(--v-theme-surface)); box-shadow: 0 1px 4px rgba(var(--v-theme-on-surface), .08); }
  .b-product-barcode__formats :deep(.v-tab--selected .v-btn__overlay) { opacity: 0; }
  .b-product-barcode__formats :deep(.v-tab:focus-visible) { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: -2px; }

  .b-product-barcode__well {
    display: flex; justify-content: center; min-width: 0; padding: 16px; margin-block-end: 20px;
    border: 1px solid var(--sd-modern-border); border-radius: 12px; background: var(--sd-modern-inset);
  }
  // Scannable paper stays white in both appearance modes; only the surrounding dialog changes theme.
  .b-product-barcode__qr-paper { position: relative; width: min(280px, 100%); aspect-ratio: 1; border-radius: 6px; background: #fff; color: #202124; }
  .b-product-barcode__qr-paper :deep(canvas) { display: block; width: 100% !important; height: auto !important; filter: none !important; transform: none !important; }
  .b-product-barcode__qr-logo { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 32px; height: 32px; object-fit: contain; border: 3px solid #fff; border-radius: 50%; background: #fff; }
  .b-product-barcode__well--linear { display: block; max-width: 100%; overflow-x: auto; }
  .b-product-barcode__linear-paper { width: max-content; min-width: 100%; padding: 12px; border-radius: 6px; background: #fff; color: #202124; text-align: center; cursor: pointer; }
  .b-product-barcode__linear-paper :deep(canvas) { display: block; margin-inline: auto; max-width: none; filter: none !important; transform: none !important; }
  .b-product-barcode__caption { max-width: 560px; margin: 0 auto 8px; font-size: 12px; font-weight: 500; line-height: 19px; overflow-wrap: anywhere; }
  .b-product-barcode__render-error { max-width: 480px; margin: 0; font-size: 13px; line-height: 20px; }
  .b-product-barcode__value-label { margin: 0 0 6px; font-size: 12px; color: var(--sd-modern-muted); }
  .b-product-barcode__value { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .b-product-barcode__value > span { flex: 1; min-width: 0; font-size: 13px; line-height: 20px; overflow-wrap: anywhere; }
  .b-product-barcode__value > .v-btn { flex-shrink: 0; }
  .b-product-barcode__empty { margin: 14px 0 0; font-size: 13px; line-height: 20px; color: var(--sd-modern-muted); }
  .b-product-barcode__actions { display: flex; flex: 0 0 auto; justify-content: flex-end; gap: 10px; padding: 14px 24px; border-block-start: 1px solid var(--sd-modern-border); }
  .b-product-barcode__actions > .v-btn { --v-btn-height: 42px; min-height: 42px; }

  &.b-product-barcode--compact {
    .b-product-barcode__header { padding-block: 10px; }
    .b-product-barcode__body { padding-block: 10px; }
    .b-product-barcode__product { margin-block-end: 8px; }
    .b-product-barcode__variant { margin-block: -2px 10px; }
    .b-product-barcode__settings { gap: 10px; margin-block-end: 8px; }
    .b-product-barcode__format > span,
    .b-product-barcode__height > span { margin-block-end: 4px; }
    .b-product-barcode__well { padding: 6px; margin-block-end: 10px; }
    .b-product-barcode__linear-paper { padding: 8px; }
    .b-product-barcode__caption { margin-block-end: 2px; }
    .b-product-barcode__payload { display: flex; align-items: center; gap: 10px; }
    .b-product-barcode__value-label { flex-shrink: 0; margin: 0; }
    .b-product-barcode__value { flex: 1; }
    .b-product-barcode__actions { padding-block: 8px; }
  }

  &.b-product-barcode--qr {
    .b-product-barcode__header,
    .b-product-barcode__body { padding-block: 8px; }
  }
}

@media (min-width: 600px) {
  .b-product-barcode--compact {
    .b-product-barcode__identity { display: flex; align-items: center; gap: 16px; margin-block-end: 8px; }
    .b-product-barcode__product { flex: 1; min-width: 0; margin: 0; }
    .b-product-barcode__variant { flex: 0 1 180px; min-width: 0; margin: 0; }
  }
  .b-product-barcode--qr .b-product-barcode__variant { flex-basis: auto; max-width: 180px; }
}

@media (max-width: 479px) {
  .b-product-barcode.v-card {
    .b-product-barcode__header,
    .b-product-barcode__body { padding: 18px 16px; }
    .b-product-barcode__heading { gap: 8px; }
    .b-product-barcode__actions { padding: 12px 16px; }
  }
}
@media (max-width: 599px), (pointer: coarse) {
  .b-product-barcode.v-card .b-product-barcode__actions > .v-btn { --v-btn-height: 44px; min-height: 44px; }
}
</style>
