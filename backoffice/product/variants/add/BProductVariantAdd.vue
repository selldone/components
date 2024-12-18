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
      <u-avatar-folder
        v-if="productVariant?.image || product.icon"
        class="me-2"
        size="64"
        :src="
          getShopImagePath(
            productVariant?.image ? productVariant.image : product.icon,
            128,
          )
        "
        is-gray
        elevated
      >
      </u-avatar-folder>

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
        <u-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.config.title')"
          icon="tune"
        >
        </u-widget-header>

        <v-list-subheader>
          {{ $t("product_admin.inventory.variant_add_edit.config.subtitle") }}
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
          :messages="
            $t('product_admin.inventory.variant_add_edit.inputs.sku.message')
          "
          required
          variant="underlined"
        >
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
          :messages="
            $t('product_admin.inventory.variant_add_edit.inputs.mpn.message')
          "
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
          :label="
            $t('product_admin.inventory.variant_add_edit.inputs.gtin.label')
          "
          :messages="
            $t('product_admin.inventory.variant_add_edit.inputs.gtin.message')
          "
          required
          variant="underlined"
        />
      </div>

      <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅   Variant variables  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

      <div :class="{ disabled: !enable }" class="widget-box mb-5">
        <u-widget-header
          :title="
            $t('product_admin.inventory.variant_add_edit.variables.title')
          "
          :add-caption="
            $t(
              'product_admin.inventory.variant_add_edit.variables.graphical_asset_action',
            )
          "
          add-icon="wallpaper"
          :add-sub-caption="
            $t(
              'product_admin.inventory.variant_add_edit.variables.graphical_asset_action_caption',
            )
          "
          add-text
          icon="join_full"
          @click:add="show_graphical_asset_dialog = true"
        >
        </u-widget-header>

        <!-- ━━━━━━━━━━━━━━ Value > color ━━━━━━━━━━━━━━ -->

        <template v-if="hasColor">
          <v-list-subheader>
            <div
              v-html="
                $t(
                  'product_admin.inventory.variant_add_edit.variables.subtitle',
                )
              "
            ></div>
          </v-list-subheader>

          <b-product-variant-value-input
            variantCode="color"
            v-model="color"
            :disabled="add_by_dropShipping"
            class="input-variant"
          ></b-product-variant-value-input>
        </template>

        <!-- ============= Variant Info Form ============= -->

        <v-list-subheader
          v-if="hasStyle || hasVolume || hasWeight || hasPack || hasType"
        >
          <div
            v-html="
              $t(
                'product_admin.inventory.variant_add_edit.variables.graphical_asset_tips',
              )
            "
          ></div>
        </v-list-subheader>

        <!-- ━━━━━━━━━━━━━━ Value > style ━━━━━━━━━━━━━━ -->

        <b-product-variant-value-input
          v-if="hasStyle"
          variantCode="style"
          v-model="style"
          :disabled="add_by_dropShipping"
          class="input-variant"
        ></b-product-variant-value-input>

        <!-- ━━━━━━━━━━━━━━ Value > volume ━━━━━━━━━━━━━━ -->

        <b-product-variant-value-input
          v-if="hasVolume"
          variantCode="volume"
          v-model="volume"
          :disabled="add_by_dropShipping"
          class="input-variant"
        ></b-product-variant-value-input>

        <!-- ━━━━━━━━━━━━━━ Value > weight ━━━━━━━━━━━━━━ -->

        <b-product-variant-value-input
          v-if="hasWeight"
          variantCode="weight"
          v-model="weight"
          :disabled="add_by_dropShipping"
          class="input-variant"
        ></b-product-variant-value-input>

        <!-- ━━━━━━━━━━━━━━ Value > pack ━━━━━━━━━━━━━━ -->

        <b-product-variant-value-input
          v-if="hasPack"
          variantCode="pack"
          v-model="pack"
          :disabled="add_by_dropShipping"
          class="input-variant"
        ></b-product-variant-value-input>

        <!-- ━━━━━━━━━━━━━━ Value > type ━━━━━━━━━━━━━━ -->

        <b-product-variant-value-input
          v-if="hasType"
          variantCode="type"
          v-model="type"
          :disabled="add_by_dropShipping"
          class="input-variant"
        ></b-product-variant-value-input>

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
              content-class="text-start bg-black"
              location="bottom"
              max-width="360"
            >
              <span
                v-html="
                  $t(
                    'product_admin.inventory.variant_add_edit.smart_unit_price.tips',
                  )
                "
              >
              </span>
            </v-tooltip>
          </v-btn>
          <v-spacer></v-spacer>
          {{
            $t(
              "product_admin.inventory.variant_add_edit.smart_unit_price.smart_unit_price",
            )
          }}
          :

          <span class="min-width-100 ms-2"
            >(<s-product-price
              :product="product"
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
        <u-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.quantity.title')"
          icon="inventory_2"
        >
        </u-widget-header>

        <v-list-subheader
          >{{
            $t("product_admin.inventory.variant_add_edit.quantity.subtitle")
          }}
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
        <u-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.price.title')"
          icon="sell"
        >
        </u-widget-header>

        <v-list-subheader
          >{{ $t("product_admin.inventory.variant_add_edit.price.subtitle") }}
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
        <u-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.package.title')"
          icon="square_foot"
          add-text
          :add-caption="
            $t(
              'product_admin.inventory.variant_add_edit.package.same_as_product_action',
            )
          "
          add-icon="refresh"
          :disabled="!product.extra"
          @click:add="extra = Object.assign({}, product.extra)"
        >
        </u-widget-header>

        <v-list-subheader
          >{{ $t("product_admin.inventory.variant_add_edit.package.subtitle") }}
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
        <u-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.image.title')"
          icon="insert_photo"
        >
        </u-widget-header>

        <v-list-subheader
          >{{ $t("product_admin.inventory.variant_add_edit.image.subtitle") }}
        </v-list-subheader>

        <b-product-images-gallery
          :product="product"
          :variant="productVariant"
          class="mt-3"
        />
      </div>
      <div v-else class="widget-box mb-5">
        <u-widget-header
          :title="$t('product_admin.inventory.variant_add_edit.images')"
          icon="insert_photo"
        >
        </u-widget-header>
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

          {{ $t("variant_graphical_assets.title") }}
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

<script lang="ts">
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
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UAvatarFolder from "@selldone/components-vue/ui/avatar/folder/UAvatarFolder.vue";
import { GetNameOfColor } from "@selldone/core-js/helper/color/ColorHelper.ts";

import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";
import BProductVariantValueInput from "@selldone/components-vue/backoffice/product/variants/value-input/BProductVariantValueInput.vue";

export default {
  name: "BProductVariantAdd",
  mixins: [],
  components: {
    BProductVariantValueInput,
    UAvatarFolder,

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
      GetNameOfColor: GetNameOfColor,
      ProductVariants: ProductVariants,

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

      show_graphical_asset_dialog: false,

      // Add image on add new variant mode
      image_file: null,
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

      item._ATTACHED_IMAGE_FILE = this.image_file; // Send to server after variant created!

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
        NotificationService.showErrorAlert(null, "Invalid color code!");
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
