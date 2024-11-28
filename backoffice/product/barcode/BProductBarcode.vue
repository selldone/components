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
    content-class="no-shadow-dialog"
    max-width="640"
    @update:model-value="(val) => $emit('update:modelValue', val)"
  >
    <v-card
      v-if="qrcode_value"
      :style="`border-radius: ${qr_size / 10}px;padding:${qr_size / 10}px;`"
      class="dialog-shadow"
    >
      <div v-if="barcode2d" class="position-relative">
        <div>
          <div class="position-relative">
            <u-qrcode
              id="qr_code_container"
              :options="{
                width: qr_size,
                color: { dark: '#222', light: '#FFFFFF00' },
              }"
              :title="qrcode_value"
              :value="qrcode_value"
            />
            <v-avatar class="center-absolute" size="38" color="#fff">
              <v-img
                v-if="product.icon"
                :src="getShopImagePath(product.icon)"
              />
            </v-avatar>
          </div>
          <div
            style="font-size: 11px; font-weight: 500"
            title="Format: Product name +  [ price + commission ]"
          >
            {{ barcode_text }}
          </div>
          <variant-item-view-micro
            v-if="variant"
            :product-variant="variant"
            center
          ></variant-item-view-micro>

          <u-text-copy-box
            :value="qrcode_value"
            class="mt-3"
            small
            small-width-mode
          ></u-text-copy-box>
        </div>
      </div>
      <div v-else>
        <div class="overflow-auto mt-4 mb-8 thin-scroll">
          <u-tabs-rounded
            v-model="format"
            :tabs="available_formats"
            class="mx-auto"
            scrollable
            small
          ></u-tabs-rounded>
        </div>

        <div id="bar_code_container" class="pp" @click="toggleHeight">
          <div
            style="font-size: 11px; font-weight: 500"
            title="Format: Product name +  [ price + commission ]"
          >
            {{ barcode_text }}
          </div>
          <u-barcode
            :format="format"
            :height="height"
            :title="qrcode_value"
            :value="qrcode_value"
            background="#fff"
            lineColor="#000"
          >
            Rendering failed!
          </u-barcode>
        </div>

        <variant-item-view-micro
          v-if="variant"
          :product-variant="variant"
          center
        ></variant-item-view-micro>
      </div>

      <v-card-actions class="border-top-dashed mt-5 pt-6">
        <div class="widget-buttons">
          <v-btn
            color="primary"
            rounded
            size="x-large"
            variant="flat"
            @click="
              Print.PrintElement(
                barcode2d ? 'qr_code_container' : 'bar_code_container',
              )
            "
          >
            <v-icon class="me-2">print</v-icon>
            {{ $t("global.actions.print") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { Print } from "@selldone/core-js/helper/canvas/Print";
import UTabsRounded from "../../../ui/tab/rounded/UTabsRounded.vue";
import VariantItemViewMicro from "../../../storefront/product/variant/VariantItemViewMicro.vue";
import UTextCopyBox from "../../../ui/text/copy-box/UTextCopyBox.vue";
import { ShopURLs} from "@selldone/core-js/helper";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import {GetNameOfColor} from "@selldone/core-js/helper/color/ColorHelper.ts";

export default {
  name: "BProductBarcode",
  mixins: [CurrencyMixin],
  emits: ["update:modelValue"],
  components: { UTextCopyBox, VariantItemViewMicro, UTabsRounded },
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

    qr_size: 400,
    qrcode_value: null,

    barcode_text: "",

    format: "CODE128",
    height: 100,
  }),

  computed: {
    link() {
      return `${ShopURLs.MainShopUrl(this.shop)}/product/${this.product.id}`;
    },

    available_formats() {
      let out = [
        { title: "CODE128", value: "CODE128" },

        { title: "CODE39", value: "CODE39" },
        { title: "MSI", value: "MSI" },
      ];

      if (this.qrcode_value.length === 12) {
        out.push({ title: "EAN13", value: "ean13" });
      }
      if (this.qrcode_value.length === 14) {
        out.push({ title: "ITF14", value: "ITF14" });
      }

      if (isNaN(this.qrcode_value)) {
        let val = parseInt(this.qrcode_value);
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
  },

  methods: {
    toggleHeight() {
      this.height = this.height === 100 ? 75 : this.height === 75 ? 50 : 100;
    },
    initialize() {
      if (this.linkMode) {
        this.qrcode_value = this.link;
      } else {
        this.qrcode_value = this.variant ? this.variant.sku : this.product.sku;
      }

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

<style scoped></style>
