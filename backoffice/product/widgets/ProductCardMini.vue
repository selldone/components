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
    :product-id="product.id"
    @click="
      $emit('select');
      clicked = true;
    "
    class="position-relative d-flex flex-column align-center justify-center transition-ease-in-out hover-up tooltip-con"
    :class="{ 'op-0-5 ': product.deleted_at }"
  >
    <!-- Icons -->

    <div class="position-relative">
      <!-- Main icon -->

      <v-icon size="100" :color="selected ? 'primary' : '#eee'">note</v-icon>

      <!-- Connect service icon (top - Right) -->

      <div v-if="product.connect_id" class="top-r">
        <v-avatar size="24" rounded
          ><img :src="getConnectIcon(product.connect_id)"
        /></v-avatar>
      </div>

      <!-- Top icons -->

      <div class="top-b">
        <img :src="getProductTypeImage(product.type)" height="12" width="12" />

        <v-icon
          v-if="!product.original"
          x-small
          :title="$t('global.commons.fake')"
        >
          report
        </v-icon>

        <v-icon
          v-if="quantity < 5"
          x-small
          :title="'Quantity: ' + quantity"
          :color="quantity === 0 ? 'red' : 'amber'"
        >
          notification_important
        </v-icon>
      </div>

      <!-- Bottom icons -->

      <div class="bottom-b">
        <v-icon v-if="product.ar_src" x-small title="AR \ 3D">
          3d_rotation
        </v-icon>

        <v-icon v-if="product.video" x-small title="Video">
          fab fa-youtube
        </v-icon>

        <v-icon v-if="product.reselling" x-small title="Drop shipping">
          airline_stops
        </v-icon>
      </div>

      <!-- Colors -->
      <div class="colors">
        <color-circle
          v-for="(c, i) in colors"
          :key="i"
          :color="c"
          :size="8"
          border-less
        ></color-circle>
      </div>

      <v-chip
        v-if="status_obj && status_obj.code !== ProductStatus.Open.code"
        x-small
        class="product-status px-1"
        label
        :color="status_obj.color"
        :dark="status_obj.code !== ProductStatus.Pending.code"
        :title="$t(status_obj.description)"
        >{{ $t(status_obj.name) }}</v-chip
      >

      <!-- Image -->

      <div class="center-absolute">
        <circle-image
          :size="36"
          :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
          class="pos-img hover-scale force-top"
          :class="{
            '-deleted': product.deleted_at,
            '-close': product.status === ProductStatus.Close.code,
            '-pending': product.status === ProductStatus.Pending.code,
            '-rejected': product.status === ProductStatus.Rejected.code,

            '-available': product.status === 'Open' && quantity > 0,
            '-dropshipping': add_by_dropShipping,
          }"
          drop-image="true"
        ></circle-image>
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
          >settings_backup_restore</v-icon
        >
      </v-progress-circular>
    </div>

    <!-- Title -->
    <small class="d-block single-line">
      <v-avatar
        v-if="vendor"
        size="20"
        class="avatar-gradient -thin me-1"
        :class="vendor.enable ? '-blue' : '-red'"
        :title="vendor.name"
        ><img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 64)" />
        <v-icon v-else x-small color="#fff" style="height: 16px !important"
          >storefront</v-icon
        >
      </v-avatar>
      {{ product.title.limitWords(3) }}</small
    >
    <!-- Vendors -->
    <div v-if="vendors && vendors.length && !vendor" class="my-1">
      <v-avatar
        v-for="v in vendors"
        :key="v.id"
        size="20"
        class="avatar-gradient -thin me-1 hover-scale"
        :class="v.enable ? '-blue' : '-red'"
        :title="v.name"
        ><img v-if="v.icon" :src="getShopImagePath(v.icon, 64)" />
        <v-icon v-else x-small color="#fff" style="height: 16px !important"
          >storefront</v-icon
        >
      </v-avatar>
    </div>

    <!-- Price -->

    <div>
      <price-view :amount="price_converted"></price-view>

      <v-chip
        v-if="discount_percent"
        x-small
        color="#C2185B"
        dark
        class="px-1 ms-1"
        label
        >{{ discount_percent }}%</v-chip
      >
    </div>

    <div
      v-if="(product.variants && product.variants.length) || vendor"
      class="tooltip"
      :class="{ '-offset-v': vendors && vendors.length }"
    >
      <div
        v-if="vendor"
        class="pa-2 white--text text-start mb-1 tsec d-flex align-center small"
      >
        <div class="flex-grow-1">
          <small class="d-block">{{ $t("global.commons.vendor") }}</small>
          <b>{{ vendor.name }}</b>
        </div>
        <v-avatar
          v-if="vendor"
          size="32"
          class="avatar-gradient -thin ms-1"
          :class="vendor.enable ? '-blue' : '-red'"
          ><img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 64)" />
          <v-icon v-else color="#fff">storefront</v-icon>
        </v-avatar>
      </div>

      <product-variants-view
        v-if="product.variants && product.variants.length"
        small
        dense
        :variants="product.variants"
        center
        dark
        class="tsec"
      ></product-variants-view>
    </div>
  </div>
</template>

<script>
import CircleImage from "@components/ui/image/CircleImage.vue";
import { ProductType } from "@core/enums/product/ProductType";
import ProductVariantsView from "@components/product/variant/ProductVariantsView.vue";
import { GetArrayOfValuesInVariants } from "@core/enums/product/ProductVariants";
import ColorCircle from "@components/ui/color/ColorCircle.vue";
import { ProductStatus } from "@core/enums/product/ProductStatus";
export default {
  name: "ProductCardMini",
  components: { ColorCircle, ProductVariantsView, CircleImage },
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
  },
  data() {
    return {
      ProductStatus: ProductStatus,
      clicked: false,
    };
  },

  computed: {
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
          null
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

    colors() {
      return (
        this.product.variants &&
        GetArrayOfValuesInVariants(this.product.variants, "color").limit(4)
      );
    },
    status_obj() {
      return ProductStatus[this.product.status];
    },
  },
};
</script>

<style scoped lang="scss">
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
  top: 63px;
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
    transition: opacity 0.3s, top 0.4s;
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
