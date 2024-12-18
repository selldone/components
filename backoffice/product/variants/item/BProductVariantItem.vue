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
  <div
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
  ProductVariants,
} from "@selldone/core-js/enums/product/ProductVariants";
import { UploadHelper } from "@selldone/core-js/helper/upload/UploadHelper";
import UAvatarFolder from "../../../../ui/avatar/folder/UAvatarFolder.vue";
import UCube from "../../../../ui/cube/UCube.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "BProductVariantItem",
  mixins: [DateMixin],
  components: {
    UCube,
    UAvatarFolder,
    UColorCircle,
    UVariantAssetImage,
    ExtraPricingLevels,
    UTimeProgressBar,
  },
  emits: ["delete", "restore", "select"],
  props: {
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
</style>
