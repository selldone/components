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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-card class="font-weight-regular text-start">
    <v-card-title class="d-flex align-center">
      <v-avatar
        v-if="productVariant?.image || product.icon"
        class="me-2"
        size="64"
      >
        <v-img
          :src="
            getShopImagePath(
              productVariant?.image ? productVariant.image : product.icon,
              128,
            )
          "
          cover
        />
      </v-avatar>

      <div class="flex-grow-1">
        <div>
          <div>
            {{
              productVariant
                ? $t("product_admin.inventory.variants.edit_title")
                : $t("product_admin.inventory.variants.add_title")
            }}
          </div>

          <small class="d-block">
            {{ $t("product_admin.inventory.variant_add_edit.message") }}
            :
            <b>SPV{{ code ? code : "-" }}</b>
          </small>
        </div>
      </div>
    </v-card-title>

    <v-card-text>
      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅  Defining Product Variant ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
      <div class="widget-box mb-5">
        <s-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.title')"
          icon="tune"
        >
        </s-widget-header>

        <v-list-subheader
          >Set variant's SKU and MPN and toggle availability here.
        </v-list-subheader>

        <u-smart-toggle
          v-model="enable"
          :false-title="$t('global.commons.inactive')"
          :true-description="
            $t('product_admin.inventory.variant_add_edit.active_input')
          "
          :true-title="$t('global.commons.active')"
          color="success"
          false-gray
        ></u-smart-toggle>

        <v-text-field
          v-model="sku"
          :counter="48"
          :label="$t('product_admin.inventory.variant_add_edit.sku')"
          class="input-variant"
          messages="Stock keeping unit"
          required
          variant="underlined"
        >
          <template v-if="product.connect" v-slot:message>
            <b-product-connect-locked
              :connect="product.connect"
              field="SKU"
            ></b-product-connect-locked>
          </template>

          <template v-slot:append-inner>
            <u-tooltip-tips
              :message="$t('product_admin.inventory.variant_add_edit.sku_tips')"
            ></u-tooltip-tips>
          </template>
        </v-text-field>

        <v-text-field
          v-model="mpn"
          :counter="48"
          :disabled="!!product.connect_id"
          :label="$t('product_admin.inventory.variant_add_edit.mpn')"
          class="input-variant"
          messages="Manufacturer Part Number"
          required
          variant="underlined"
        >
          <template v-if="product.connect" v-slot:message>
            <b-product-connect-locked
              :connect="product.connect"
              field="MPN"
            ></b-product-connect-locked>
          </template>

          <template v-slot:append-inner>
            <u-tooltip-tips
              :message="$t('product_admin.inventory.variant_add_edit.mpn_tips')"
            ></u-tooltip-tips>
          </template>
        </v-text-field>

        <v-text-field
          v-model="gtin"
          :counter="48"
          class="input-variant"
          label="Product's Global Trade Item Number"
          messages="Supported values are UPC (North America, 12 digits), EAN (Europe, 13 digits), JAN (Japan, 8 or 13 digits), ISBN (books, 13 digits)."
          required
          variant="underlined"
        />
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅   Variant variables  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div :class="{ disabled: !enable }" class="widget-box mb-5">
        <s-widget-header
          :title="
            $t('product_admin.inventory.variant_add_edit.variant_variable')
          "
          add-caption="Graphical Assets"
          add-icon="wallpaper"
          add-sub-caption="Small images for variant."
          add-text
          icon="join_full"
          @click:add="show_graphical_asset_dialog = true"
        >
        </s-widget-header>

        <template v-if="hasColor">
          <v-list-subheader>
            <div>
              Enter a hex color code here. You can enter a single color like
              <b>#654FFF</b> or dual colors separated by a slash, such as
              <b>#764FFA/#000000</b>.
            </div>
          </v-list-subheader>
          <v-text-field
            v-model="color"
            :counter="32"
            :disabled="add_by_dropShipping"
            :label="$t(ProductVariants.color.name)"
            :prepend-inner-icon="ProductVariants.color.icon"
            class="input-variant"
            required
            variant="underlined"
            @blur="validateColor"
          >
            <template v-slot:append-inner>
              <div class="d-flex align-center">
                <u-color-name :color="color" class="small mx-1"></u-color-name>
                <u-color-circle :color="color"></u-color-circle>
              </div>
            </template>
          </v-text-field>

          <div v-if="!add_by_dropShipping" class="text-center">
            <v-btn
              v-for="item in show_all_colors ? colors : colors.limit(22)"
              :key="item"
              :title="GetNameOfColor(item)"
              class="mx-1 color-button-ball no-inv"
              icon
              variant="text"
              @click="color = item"
            >
              <u-color-circle
                :color="item"
                :size="16"
                class="circle-border m-1"
              >
              </u-color-circle>
            </v-btn>

            <v-btn
              v-if="!show_all_colors"
              class="m-1 tnt"
              color="primary"
              variant="text"
              @click="show_all_colors = true"
              >{{ $t("global.actions.show_all") }}...
            </v-btn>
          </div>
        </template>

        <!-- ============= Variant Info Form ============= -->

        <v-list-subheader
          v-if="hasStyle || hasVolume || hasWeight || hasPack || hasType"
        >
          <div>
            You may input any value for the subsequent variable values.
            Additionally, you can incorporate images as values by utilizing
            <b>Graphic Assets</b>. Simply upload the desired pattern and insert
            the generated code into the variant value.
          </div>
        </v-list-subheader>

        <v-text-field
          v-if="hasStyle"
          v-model="style"
          :counter="21"
          :disabled="add_by_dropShipping"
          :label="$t(ProductVariants.style.name)"
          :prepend-inner-icon="ProductVariants.style.icon"
          class="input-variant"
          messages=" "
          required
          variant="underlined"
        >
          <template v-if="style" v-slot:append-inner>
            <u-variant-asset-image
              :shop-id="shop.id"
              :size="24"
              :value="style"
            ></u-variant-asset-image>
          </template>

          <template v-slot:message>
            <b-product-graphical-assets-selector
              :shop="shop"
              @select="(v) => (style = v)"
            ></b-product-graphical-assets-selector>
          </template>
        </v-text-field>

        <v-text-field
          v-if="hasVolume"
          v-model="volume"
          :counter="21"
          :disabled="add_by_dropShipping"
          :label="$t(ProductVariants.volume.name)"
          :prepend-inner-icon="ProductVariants.volume.icon"
          class="input-variant"
          messages=" "
          required
          variant="underlined"
        >
          <template v-if="volume" v-slot:append-inner>
            <u-variant-asset-image
              :shop-id="shop.id"
              :size="24"
              :value="volume"
            ></u-variant-asset-image>
          </template>

          <template v-slot:message>
            <b-product-graphical-assets-selector
              :shop="shop"
              @select="(v) => (volume = v)"
            ></b-product-graphical-assets-selector>
          </template>
        </v-text-field>

        <v-text-field
          v-if="hasWeight"
          v-model="weight"
          :counter="21"
          :disabled="add_by_dropShipping"
          :label="$t(ProductVariants.weight.name)"
          :prepend-inner-icon="ProductVariants.weight.icon"
          class="input-variant"
          messages=" "
          required
          variant="underlined"
        >
          <template v-if="weight" v-slot:append-inner>
            <u-variant-asset-image
              :shop-id="shop.id"
              :size="24"
              :value="weight"
            ></u-variant-asset-image>
          </template>

          <template v-slot:message>
            <b-product-graphical-assets-selector
              :shop="shop"
              @select="(v) => (weight = v)"
            ></b-product-graphical-assets-selector>
          </template>
        </v-text-field>

        <v-text-field
          v-if="hasPack"
          v-model="pack"
          :counter="21"
          :disabled="add_by_dropShipping"
          :label="$t(ProductVariants.pack.name)"
          :prepend-inner-icon="ProductVariants.pack.icon"
          :suffix="
            $t('product_admin.inventory.variant_add_edit.inventory_unit')
          "
          class="input-variant sm-suffix"
          messages=" "
          required
          variant="underlined"
        >
          <template v-if="pack" v-slot:append-inner>
            <u-variant-asset-image
              :shop-id="shop.id"
              :size="24"
              :value="pack"
            ></u-variant-asset-image>
          </template>

          <template v-slot:message>
            <b-product-graphical-assets-selector
              :shop="shop"
              @select="(v) => (pack = v)"
            ></b-product-graphical-assets-selector>
          </template>
        </v-text-field>

        <v-text-field
          v-if="hasType"
          v-model="type"
          :counter="21"
          :disabled="add_by_dropShipping"
          :label="$t(ProductVariants.type.name)"
          :prepend-inner-icon="ProductVariants.type.icon"
          class="input-variant"
          messages=" "
          required
          variant="underlined"
        >
          <template v-if="type" v-slot:append-inner>
            <u-variant-asset-image
              :shop-id="shop.id"
              :size="24"
              :value="type"
            ></u-variant-asset-image>
          </template>

          <template v-slot:message>
            <b-product-graphical-assets-selector
              :shop="shop"
              @select="(v) => (type = v)"
            ></b-product-graphical-assets-selector>
          </template>
        </v-text-field>

        <v-row
          v-if="smart_price_enable && (hasVolume || hasWeight || hasPack)"
          align="center"
          class="small text-muted py-2"
          no-gutters
        >
          <v-btn icon size="small" variant="text">
            <v-icon>info</v-icon>

            <v-tooltip
              activator="parent"
              content-class="text-start"
              location="bottom"
              max-width="360"
            >
              Calculating unit price by considering <b>weight</b>,
              <b>volume</b>, and <b>pack</b> variants property.
            </v-tooltip>
          </v-btn>
          <v-spacer></v-spacer>
          Smart unit price:

          <span class="min-width-100 ms-2"
            >(<s-product-price
              :product="product"
              :shop="shop"
              :variant="{
                pricing: pricing,
                price: price_object.price,
                commission: price_object.commission,
                discount: price_object.discount,
                currency: price_object.currency,
                weight: weight,
                volume: volume,
                pack: pack,
              }"
            ></s-product-price
            >)</span
          >
        </v-row>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Inventory ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        v-if="isPhysical"
        :class="{ disabled: !enable }"
        class="widget-box mb-5"
      >
        <s-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.inventory')"
          icon="inventory_2"
        >
        </s-widget-header>

        <v-list-subheader
          >For each product variant, set its unique stock level in the
          inventory.
        </v-list-subheader>

        <v-text-field
          v-model="quantity"
          :disabled="add_by_dropShipping || is_marketplace"
          :label="$t('product_admin.inventory.variant_add_edit.inventory')"
          :suffix="
            $t('product_admin.inventory.variant_add_edit.inventory_unit')
          "
          class="mt-5 mx-auto input-variant sm-suffix strong-field"
          color="#0288D1"
          variant="underlined"
        >
        </v-text-field>

        <!-- ▀▀▀▀▀▀▀▀▀ 🟣 Marketplace 🟣 ▀▀▀▀▀▀▀▀▀ -->
        <div v-if="is_marketplace" class="widget-box pa-3 my-5">
          <v-icon class="me-1">info_outline</v-icon>
          Change inventory in the
          <b>
            <router-link
              :to="{
                name: IS_VENDOR_PANEL
                  ? 'Vendor_ProductPage_Vendors'
                  : 'BPageProductVendors',
                params: product ? { product_id: product.id } : undefined,
              }"
              >Vendors
            </router-link>
          </b>
          tab.
        </div>
        <!-- ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀ -->
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Pricing ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div :class="{ disabled: !enable }" class="widget-box mb-5">
        <s-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.pricing')"
          icon="sell"
        >
        </s-widget-header>

        <v-list-subheader
          >Set a custom price for variant here, or they will use the product's
          default price.
        </v-list-subheader>

        <u-smart-toggle
          v-model="pricing"
          :false-title="$t('global.commons.inactive')"
          :true-description="
            $t('product_admin.inventory.variant_add_edit.has_pricing_input')
          "
          :true-title="$t('global.commons.active')"
          color="success"
          false-gray
        ></u-smart-toggle>

        <v-expand-transition>
          <b-product-edit-price
            v-if="pricing && shop && !forStudio"
            :custom-object="price_object"
            :is-marketplace="is_marketplace"
            :product="product"
            :shop="shop"
            :variant="productVariant"
            :vendor="vendor"
            class="mt-3"
          />
        </v-expand-transition>
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Packaging & Shipping ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        v-if="isPhysical"
        :class="{ disabled: !enable }"
        class="widget-box mb-5"
      >
        <s-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.delivery_info')"
          icon="square_foot"
          add-text
          add-caption="Same as product"
          add-icon="refresh"
          :disabled="!product.extra"
          @click:add="extra=Object.assign({},product.extra)"
        >
        </s-widget-header>

        <v-list-subheader
          >Set the weight and size for each variant if it's different from the
          main product. This helps us determine the right shipping methods at
          checkout.
        </v-list-subheader>

        <b-product-extra-input
          :class="{ disabled: add_by_dropShipping }"
          :default-lead-time="lead"
          :extra="extra"
          :shop="shop"
          @onLeadChange="
            (value) => {
              lead = value;
            }
          "
        />
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Variant Images ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div
        v-if="productVariant"
        :class="{ disabled: !enable }"
        class="widget-box -large mb-5"
      >
        <s-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.images')"
          icon="insert_photo"
        >
        </s-widget-header>

        <v-list-subheader
          >Here you can add unique images for each variant in your custom
          orders. These images will be displayed on the product page when a
          customer selects a particular variant. To avoid repetition, please do
          not upload the same images that have already been included in the main
          product images. Also, note that the first image uploaded for a variant
          will be considered the primary image for that variant.
        </v-list-subheader>

        <b-product-images-gallery
          :product="product"
          :variant="productVariant"
          class="mt-3"
        />
      </div>
      <div v-else class="widget-box mb-5">
        <s-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.images')"
          icon="insert_photo"
        >
        </s-widget-header>
        <v-list-subheader>
          {{ $t("product_admin.inventory.variant_add_edit.images_message") }}
        </v-list-subheader>

        <v-file-input
          v-model="image_file"
          accept="image/*"
          label="Select variant image..."
          prepend-icon=""
          prepend-inner-icon="filter"
          show-size
          variant="underlined"
        ></v-file-input>
      </div>
    </v-card-text>
    <!-- ██████████████████████ Actions ██████████████████████ -->

    <v-card-actions>
      <div class="widget-buttons">
        <v-btn size="x-large" variant="text" @click="$emit('close')">
          <v-icon start>close</v-icon>
          {{ $t("global.actions.close") }}
        </v-btn>

        <v-btn
          :loading="loading"
          color="primary"
          size="x-large"
          variant="elevated"
          @click="addItem()"
        >
          <v-icon class="me-1">{{ productVariant ? "save" : "add" }}</v-icon>
          {{
            productVariant
              ? $t("global.actions.save")
              : $t("global.actions.add")
          }}
        </v-btn>
      </div>
    </v-card-actions>

    <!-- ██████████████████████ Dialog > Graphical assets ██████████████████████ -->
    <v-dialog
      v-model="show_graphical_asset_dialog"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-1">snippet_folder</v-icon>
          Variant Graphical Assets
        </v-card-title>

        <v-card-text>
          <variant-graphical-assets-list
            :shop="shop"
            :vendor="vendor"
          ></variant-graphical-assets-list>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn
              size="x-large"
              variant="text"
              @click="show_graphical_asset_dialog = false"
            >
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import BProductEditPrice from "../../../product/edit/price/BProductEditPrice.vue";
import BProductExtraInput from "../../extra/input/BProductExtraInput.vue";
import BProductImagesGallery from "../../images/gallery/BProductImagesGallery.vue";
import UTooltipTips from "../../../../ui/tooltip/tips/UTooltipTips.vue";
import { BusinessModel } from "@selldone/core-js/enums/shop/BusinessModel";
import SProductPrice from "../../../../storefront/product/price/SProductPrice.vue";
import BProductConnectLocked from "../../../product/connect/locked/BProductConnectLocked.vue";
import USmartToggle from "../../../../ui/smart/toggle/USmartToggle.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";

import VariantGraphicalAssetsList from "../../../product/graphical-assets/VariantGraphicalAssetsList.vue";
import UVariantAssetImage from "../../../../ui/variant/asset/image/UVariantAssetImage.vue";
import UColorCircle from "../../../../ui/color/circle/UColorCircle.vue";
import UColorName from "../../../../ui/color/name/UColorName.vue";
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import BProductGraphicalAssetsSelector from "../../../product/graphical-assets/selector/BProductGraphicalAssetsSelector.vue";
import VariantColorsSet from "@selldone/core-js/helper/color/VariantColorsSet";

export default {
  name: "BProductVariantAdd",
  components: {
    BProductGraphicalAssetsSelector,
    UColorName,
    UColorCircle,
    UVariantAssetImage,
    VariantGraphicalAssetsList,

    USmartToggle,
    BProductConnectLocked,
    SProductPrice,
    UTooltipTips,
    BProductImagesGallery,
    BProductExtraInput,
    BProductEditPrice,
  },
  props: {
    shop: {
      required: true,
    },

    vendor: {
      /*🟢 Vendor Panel 🟢*/ required: false,
    },

    product: {
      required: true,
    },

    productVariant: {
      required: false,
    },

    hasColor: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasStyle: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasVolume: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasWeight: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasPack: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasType: {
      required: false,
      type: Boolean,
      default: false,
    },

    forStudio: {
      default: false,
      type: Boolean,
    },

    loading: {},
  },

  data() {
    return {
      ProductVariants: ProductVariants,

      colors: VariantColorsSet,

      sku: "",
      mpn: "",
      gtin: "",

      color: "",
      weight: "",
      volume: "",
      style: "",
      pack: "",
      quantity: 10,
      price: "",
      type: "",
      code: "",

      enable: true,

      pricing: false,

      price_object: {},

      lead: -1,

      extra: {},

      show_all_colors: false,

      show_graphical_asset_dialog: false,

      // Add image on add new variant mode
      image_file: [],
    };
  },

  computed: {
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    is_marketplace() {
      return this.shop.model === BusinessModel.MARKETPLACE.code;
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },

    smart_price_enable() {
      return this.shop.theme && this.shop.theme.smart_price;
    },

    isPhysical() {
      return this.product.type === ProductType.PHYSICAL.code;
    },
    isVirtual() {
      return this.product.type === ProductType.VIRTUAL.code;
    },
  },

  watch: {
    productVariant() {
      this.assignFromProp();
    },

    pricing() {
      if (
        this.price_object &&
        this.product.currency !== this.price_object.currency
      ) {
        // Fix not matched currency product <-> variant:
        this.price_object.currency = this.product.currency;
        this.price_object.price = this.product.price;
        this.price_object.discount = this.product.discount;
        this.price_object.commission = this.product.commission;

        this.price_object.price_label = this.product.price_label;
      }
    },
  },
  created() {
    this.assignFromProp();
  },

  methods: {
    addItem() {
      let item = {};
      if (this.productVariant) {
        item = this.productVariant;
      }

      if (this.hasColor) item.color = this.color;

      if (this.hasWeight) item.weight = this.weight;

      if (this.hasVolume) item.volume = this.volume;

      if (this.hasStyle) item.style = this.style;

      if (this.hasPack) item.pack = parseInt(this.pack, 10);

      if (this.hasType) item.type = this.type;

      item.sku = this.sku;
      item.mpn = this.mpn;
      item.gtin = this.gtin;

      item.enable = this.enable;

      item.pricing = this.pricing;

      item.price = parseFloat(this.price_object.price);
      item.currency = this.price_object.currency;
      item.commission = parseFloat(this.price_object.commission);
      item.discount = parseFloat(this.price_object.discount);

      item.dis_start = this.price_object.dis_start;
      item.dis_end = this.price_object.dis_end;

      item.price_label = this.price_object.price_label;

      item.quantity = parseInt(this.quantity, 10);

      item.lead = this.lead;
      item.extra = this.extra;

      item._ATTACHED_IMAGE_FILE = this.image_file?.length
        ? this.image_file[0]
        : null; // Send to server after variant created!

      if (this.productVariant) {
        this.$emit("update", this.productVariant);
      } else {
        this.$emit("add", item);
      }
    },

    assignFromProp() {
      this.resetToDefault(); // 🞇 Reset to default

      this.price_object.price = this.product.price;
      this.price_object.currency = this.product.currency;
      this.price_object.commission = this.product.commission;
      this.price_object.discount = this.product.discount;

      this.price_object.dis_start = this.product.dis_start;
      this.price_object.dis_end = this.product.dis_end;

      this.price_object.price_label = this.product.price_label;

      if (this.productVariant) {
        this.sku = this.productVariant.sku;
        this.mpn = this.productVariant.mpn;
        this.gtin = this.productVariant.gtin;

        this.color = this.productVariant.color;
        this.weight = this.productVariant.weight;
        this.volume = this.productVariant.volume;
        this.style = this.productVariant.style;
        this.pack = this.productVariant.pack;
        this.type = this.productVariant.type;

        this.code = this.productVariant.id;

        this.quantity = this.productVariant.quantity;

        this.pricing = this.productVariant.pricing;

        this.price_object.price = this.productVariant.price;
        this.price_object.currency = this.productVariant.currency;
        this.price_object.commission = this.productVariant.commission;
        this.price_object.discount = this.productVariant.discount;

        this.price_object.dis_start = this.productVariant.dis_start;
        this.price_object.dis_end = this.productVariant.dis_end;

        this.price_object.price_label = this.productVariant.price_label;

        this.enable = this.productVariant.enable;

        this.lead = this.productVariant.lead;

        if (
          !this.productVariant.extra ||
          Array.isArray(this.productVariant.extra)
        )
          this.productVariant.extra = {};

        this.extra = this.productVariant.extra;
      } else {
        // set from main product info!

        this.price_object.sku = "";
        this.price_object.mpn = "";
        this.price_object.gtin = "";

        this.price_object.price = this.product.price;
        this.price_object.currency = this.product.currency;
        this.price_object.commission = this.product.commission;
        this.price_object.discount = this.product.discount;

        this.price_object.dis_start = this.product.dis_start;
        this.price_object.dis_end = this.product.dis_end;

        this.price_object.price_label = this.product.price_label;

        this.lead = this.product.lead;

        if (!this.product.extra || Array.isArray(this.product.extra))
          this.product.extra = {};
        this.extra = this.product.extra;
      }
    },

    validateColor() {
      if (!this.color?.startsWith("#")) {
        this.color = "#FFFFFF";
        this.showErrorAlert(null, "Invalid color code!");
      }
    },
  },
};
</script>

<style lang="scss" scoped>
h2 {
  text-align: start;
  font-size: 1.4rem;
  margin-bottom: 1.4rem;
}

.input-variant {
  max-width: 480px;
  margin: 8px auto !important;
}

.color-button-ball {
  :hover {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0, 1);
    transform: scale(1.15, 1.15);
  }
}

.action-title {
  font-weight: 400;
}

.circle-border {
  border-radius: 50%;
  border-width: 2px;
  border-style: solid;
  border-color: #aaa;
}
</style>
