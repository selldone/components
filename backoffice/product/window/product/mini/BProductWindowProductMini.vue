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
      'op-0-5 ': product.deleted_at,
      'disabled sub-caption b-12px': disabled,
    }"
    :product-id="product.id"
    :caption="disabled ? $t('global.commons.can_not_edit') : undefined"
    class="position-relative d-flex flex-column align-center justify-center hover-up tooltip-con"
    @click="
      $emit('select');
      clicked = true;
    "
  >
    <!-- Icons -->

    <div class="position-relative">
      <!-- Main icon -->

      <v-icon :color="selected ? 'primary' : dark ? '#000' : '#eee'" size="100"
        >note
      </v-icon>

      <!-- Connect service icon (top - Right) -->

      <div v-if="product.connect_id" class="top-r">
        <v-avatar rounded size="24"
          ><img :src="getConnectIcon(product.connect_id)"
        /></v-avatar>
      </div>

      <!-- Top icons -->

      <div class="top-b">
        <img :src="getProductTypeImage(product.type)" height="12" width="12" />

        <v-icon
          v-if="!product.original"
          :title="$t('global.commons.fake')"
          size="x-small"
        >
          report
        </v-icon>

        <v-icon
          v-if="quantity < 5"
          :color="quantity === 0 ? 'red' : 'amber'"
          :title="'Quantity: ' + quantity"
          size="x-small"
        >
          notification_important
        </v-icon>
      </div>

      <!-- Bottom icons -->

      <div class="bottom-b">
        <v-icon v-if="product.ar_src" size="14" title="AR \ 3D"  style="margin-inline-start: 1px">
          3d_rotation
        </v-icon>

        <v-icon v-if="product.video" size="14" title="Video"  style="margin-inline-start: 1px">
          fa:fab fa-youtube
        </v-icon>

        <v-icon v-if="product.reselling" size="14" title="Drop shipping" style="margin-inline-start: 1px">
          airline_stops
        </v-icon>
      </div>

      <!-- Colors -->
      <div class="colors">
        <u-color-circle
          v-for="(c, i) in colors"
          :key="i"
          :color="c"
          :size="8"
          border-less
        ></u-color-circle>
      </div>

      <v-chip
        v-if="status_obj && status_obj.code !== ProductStatus.Open.code"
        :color="status_obj.color"
        :theme="
          status_obj.code !== ProductStatus.Pending.code ? 'dark' : 'light'
        "
        :title="$t(status_obj.description)"
        class="product-status px-1"
        label
        size="x-small"
        >{{ $t(status_obj.name) }}
      </v-chip>

      <!-- Image -->

      <div class="center-absolute">
        <circle-image
          :class="{
            '-deleted': product.deleted_at,
            '-close': product.status === ProductStatus.Close.code,
            '-pending': product.status === ProductStatus.Pending.code,
            '-rejected': product.status === ProductStatus.Rejected.code,

            '-available': product.status === 'Open' && quantity > 0,
            '-dropshipping': add_by_dropShipping,
          }"
          :size="36"
          :src="getShopImagePath(product.icon, imageSize)"
          class="pos-img hover-scale force-top"
          drop-image="true"
        ></circle-image>
        <v-avatar
          v-if="shortcut"
          :size="24"
          class="hover-scale"
          color="#FFA000"
          dark
          label
          style="
            border: solid 2px #ffa000;
            position: absolute;
            right: -5px;
            bottom: -5px;
          "
          title="Shortcut | Originally, this product belongs to a different category."
          x-small
        >
          <img
            v-if="product.category_id"
            :src="ShopCategoryHelper.GetCategoryIconById(product.category_id)"
          />
          <v-icon v-else color="#000" size="12">home</v-icon>
        </v-avatar>
      </div>

      <!-- Delete / Restore -->

      <v-progress-circular
        v-if="deleting || restoring"
        :color="deleting ? 'red' : 'green'"
        class="center-absolute"
        indeterminate
      >
        <v-icon v-if="deleting" color="red">delete</v-icon>
        <v-icon v-else-if="restoring" color="green"
          >settings_backup_restore
        </v-icon>
      </v-progress-circular>
    </div>

    <!-- Title -->
    <small class="d-block single-line">
      <v-avatar
        v-if="vendor"
        :class="vendor.enable ? '-blue' : '-red'"
        :title="vendor.name"
        class="avatar-gradient -thin me-1"
        size="20"
        ><img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 64)" />
        <v-icon
          v-else
          color="#fff"
          size="12"
          >storefront
        </v-icon>
      </v-avatar>
      {{ product.title.limitWords(3) }}</small
    >
    <!-- Vendors -->
    <div v-if="vendors && vendors.length && !vendor" class="my-1">
      <v-avatar
        v-for="v in vendors"
        :key="v.id"
        :class="v.enable ? '-blue' : '-red'"
        :title="v.name"
        class="avatar-gradient -thin me-1 hover-scale"
        size="20"
        ><img v-if="v.icon" :src="getShopImagePath(v.icon, 64)" />
        <v-icon
          v-else
          color="#fff"
          size="12"
          >storefront
        </v-icon>
      </v-avatar>
    </div>

    <!-- Price -->

    <div>
      <!-- Price > ⛔ Invalid exchange rate -->
      <u-price-invalid
        v-if="isNaN(price_converted)"
        :currency="product.currency"
        small
      >
      </u-price-invalid>

      <u-price v-else :amount="price_converted"></u-price>

      <v-chip
        v-if="
          discount_percent /*It will return value if discount be valid in this time*/
        "
        class="px-1 ms-1"
        color="#C2185B"
        label
        size="x-small"
        variant="flat"
        :class="{ disabled: finished }"
      >
        <div style="line-height: 8px">
          {{ discount_percent }}%
          <span class="d-block" style="font-size: 6px; font-weight: 500">{{
            finished
              ? $t("global.commons.finished")
              : $t("global.commons.discount")
          }}</span>
        </div>
      </v-chip>
    </div>

    <div
      v-if="(product.variants && product.variants.length) || vendor"
      :class="{ '-offset-v': vendors && vendors.length }"
      class="tooltip"
    >
      <div
        v-if="vendor"
        class="pa-2 text-white text-start mb-1 tsec d-flex align-center small"
      >
        <div class="flex-grow-1">
          <small class="d-block">{{ $t("global.commons.vendor") }}</small>
          <b>{{ vendor.name }}</b>
        </div>
        <v-avatar
          v-if="vendor"
          :class="vendor.enable ? '-blue' : '-red'"
          class="avatar-gradient -thin ms-1"
          size="32"
          ><img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 64)" />
          <v-icon v-else color="#fff">storefront</v-icon>
        </v-avatar>
      </div>

      <product-variants-view
        v-if="product.variants && product.variants.length"
        :variants="product.variants"
        class="tsec"
        :limit="7"
        dark
        dense
        small
        force-ultra-dense
      ></product-variants-view>
    </div>

    <!-- Add Note Button -->
    <b-note-button
      v-if="showNotes || (product.note && product.note.length)"
      :activeColor="showNotes ? undefined : '#333'"
      :note="product.note"
      class="position-absolute z2"
      style="top: -6px; left: -6px"
      @click="$emit('onShowNote', product)"
    ></b-note-button>

    <!-- Selectable -->
    <template v-if="showSelect">
      <v-icon
        :color="iSelected ? 'primary' : '#333'"
        class="absolute-top-end pp"
        style="z-index: 10"
        @click.stop="$emit('onSelect', product)"
        >{{ iSelected ? "circle" : "radio_button_unchecked" }}
      </v-icon>
      <div
        class="pp usall"
        style="
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        "
        @click.stop="$emit('onSelect', product)"
      ></div>
    </template>
  </div>
</template>

<script lang="ts">
import CircleImage from "../../../../../ui/image/CircleImage.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import ProductVariantsView from "../../../../../storefront/product/variant/ProductVariantsView.vue";
import { GetArrayOfValuesInVariants } from "@selldone/core-js/enums/product/ProductVariants";
import UColorCircle from "../../../../../ui/color/circle/UColorCircle.vue";
import { ProductStatus } from "@selldone/core-js/enums/product/ProductStatus";
import BNoteButton from "../../../../note/button/BNoteButton.vue";
import { BackofficeLocalStorages, DateConverter } from "@selldone/core-js";
import UPriceInvalid from "@selldone/components-vue/ui/price/invalid/UPriceInvalid.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import {ShopCategoryHelper} from "@selldone/core-js/helper/category/ShopCategoryHelper.ts";

export default {
  name: "BProductWindowProductMini",
  mixins: [ProductMixin],

  components: {
    UPriceInvalid,
    BNoteButton,
    UColorCircle,
    ProductVariantsView,
    CircleImage,
  },
  emits: ["select", "onShowNote", "onSelect"],
  props: {
    shop: {
      required: true,
      type: Object,
    },
    product: {
      required: true,
      type: Object,
    },
    deleting: {
      type: Boolean,
      default: false,
    },
    restoring: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    shortcut: {
      type: Boolean,
      default: false,
    },
    showNotes: Boolean,
    showSelect: Boolean,
    iSelected: Boolean,

    dark: Boolean,

    /**
     * Can be 64, 128,... or null
     */
    imageSize: {
      type: Number,
      default: BackofficeLocalStorages.IMAGE_SIZE_SMALL,
    },
  },
  data() {
    return {
      ProductType: ProductType,

      ProductStatus: ProductStatus,
      clicked: false,
    };
  },

  computed: {
    ShopCategoryHelper() {
      return ShopCategoryHelper
    },
    IS_VENDOR_PANEL() {
      /*🟢 Vendor Panel 🟢*/
      return (
        this.$route.params.vendor_id &&
        this.$route.matched.some((record) => record.meta.vendor)
      );
    },

    vendor() {
      // Vendor is owner!
      return this.product.vendor;
    },
    vendors() {
      // Vendors assigned to the product!
      return this.product.vendors;
    },
    isFile() {
      return this.product.type === ProductType.FILE.code;
    },
    isSubscription() {
      return this.product.type === ProductType.SUBSCRIPTION.code;
    },
    quantity() {
      if (this.isSubscription) return this.product.quantity > 0 ? 999 : 0;
      return this.isFile ? 999 : this.product.quantity;
    },
    add_by_dropShipping() {
      return !!this.product.parent_id;
    },

    price_converted() {
      if (!this.product) return 0;

      try {
        return this.CalcPriceProductCurrentCurrency(
          this.shop,
          this.product,
          null,
        );
      } catch (e) {
        return "🚨";
      }
    },
    discount_percent() {
      try {
        return this.discountProductPercent(this.shop, this.product, null);
      } catch (e) {
        return "🚨";
      }
    },
    inBetween() {
      return DateConverter.inBetweenDates(
        new Date(),
        DateConverter.convertToLocalTime(this.product.dis_start),
        DateConverter.convertToLocalTime(this.product.dis_end),
      );
    },

    finished() {
      return (
        (this.product.dis_start || this.product.dis_end) && !this.inBetween
      );
    },

    colors() {
      return (
        this.product.variants &&
        GetArrayOfValuesInVariants(this.product.variants, "color").limit(4)
      );
    },
    status_obj() {
      return ProductStatus[this.product.status];
    },
    disabled() {
      // On store panel always all products are enabled to click!
      if (!this.IS_VENDOR_PANEL) return false;

      // It's not a product of the vendor! It has multi vendors, so vendor can not edit it in their panel.
      return !this.vendor;
    },
  },

  methods: {
    getConnectIcon(connect_id: string | number) {
      return window.CDN.GET_CONNECT_ICON(connect_id);
    },
  },
};
</script>

<style lang="scss" scoped>
.pos-img {
  border: solid 2px #fff;

  &.-available {
    border-color: #689f38 !important;

    &.-dropshipping {
      border-color: #1976d2 !important;
    }
  }

  &.-close {
    border-color: #512da8 !important;
  }

  &.-deleted {
    border-color: #d32f2f !important;
  }

  &.-pending {
    border-color: #ffa000 !important;
  }

  &.-rejected {
    border-color: #212121 !important;
  }
}

.top-b {
  position: absolute;
  top: 16px;
  left: 14px;

  .v-icon {
    margin: 0 1px;
  }
}

.top-r {
  position: absolute;
  top: 14px;
  right: 0px;
  z-index: -1;
}

.bottom-b {
  position: absolute;
  top: 60px;
  right: 12px;

  .v-icon {
    margin: 0 1px;
  }
}

.tooltip-con {
  display: none;
  z-index: 1;

  .tooltip {
    opacity: 0;
    transition:
      opacity 0.3s,
      top 0.4s;
    position: absolute;
    max-width: 200px;

    z-index: 3;
    pointer-events: none;
    user-select: none;

    display: block;
    top: 114px;
    min-width: 140px;

    .tsec {
      padding: 4px 0;
      background-color: #111;
      border-radius: 6px;
      min-height: 24px;
    }

    &.-offset-v {
      top: 170px;
    }
  }

  &:hover {
    z-index: 10;

    .tooltip {
      top: 120px;
      opacity: 1;
      display: block;
    }
  }
}

.colors {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 12px;
  bottom: 20px;

  .v-icon {
    margin: 0 0 1px 0;
  }
}

.product-status {
  position: absolute;
  right: 12px;
  bottom: 20px;
  font-size: 7px !important;
  padding: 2px 4px !important;
  min-height: 0;
  height: 11px !important;
}
</style>
