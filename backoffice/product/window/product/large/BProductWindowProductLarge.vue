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
  <s-widget
    :class="[
      small ? 'm-1' : '',
      hover ? 'widget-hover' : '',
      dashed ? '-dashed' : '',
      hover ? 'pointer-pointer' : '',
      product.deleted_at ? 'op-0-7 -deleted' : '',
      selected || iSelected ? 'border-selected ' : '',
      shortcut ? '-shortcut' : '',
    ]"
    :dark="dark"
    :deleted_at="getFromNowString(product.deleted_at)"
    :h100="false"
    :product-id="product.id"
    :style="{ '--card-color': color }"
    :title="`<h5 class='align-items-center pb-1'  style='font-size: 1.16rem;min-height: 42px'>    <span class='circle ${state_class}' style='font-size: 6px;'></span>  ${product.title?.limitWords(
      12,
    )}  </h5>`"
    body-class="pa-0"
    class="b--product-window-product-large text-start overflow-hidden"
    custom-header
    style="border-radius: 8px"
    @click="$emit('select')"
  >
    <template v-slot:top-left>
      <v-btn
        v-if="showEditButton"
        :to="{
          name: 'BPageProductEdit',
          params: { product_id: product.id },
          hash: '#general',
        }"
        class="z2 mx-1"
        icon
        size="small"
        title="Edit product."
        variant="text"
        @click.stop
      >
        <v-icon size="24"> edit_square</v-icon>
      </v-btn>

      <!-- Add Note Button -->
      <b-note-button
        v-if="showNotes || (product.note && product.note.length)"
        :activeColor="showNotes ? undefined : '#333'"
        :note="product.note"
        class="z2 mx-1"
        @click="$emit('onShowNote', product)"
      ></b-note-button>

      <!-- Selectable -->
      <template v-if="showSelect">
        <v-icon :color="iSelected ? 'primary' : '#333'" class="mx-1" size="24"
          >{{ iSelected ? "circle" : "radio_button_unchecked" }}
        </v-icon>
      </template>

      <circle-image
        v-if="compactMode"
        :size="64"
        :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
      ></circle-image>
    </template>

    <!-- Selectable -->
    <template v-if="showSelect">
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

    <div v-if="add_by_dropShipping" class="drop-shipping-mode">
      <img
        height="24"
        src="../../../../../assets/icons/dropshipping-w.svg"
        width="24"
      />
      <span>{{ $t("global.commons.drop_shipping") }}</span>
    </div>

    <div>
      <img
        v-if="!compactMode"
        :src="getProductTypeImage(product.type)"
        :title="`${$t(
          'admin_shop.products.product_widget.product_type',
        )}: ${getProductTypeName(product.type)}`"
        class="float-end"
        height="16px"
      />
      <h6
        :class="small ? 'small' : ''"
        class="fw-semi-bold mb-1 small"
        style="min-height: 21px"
      >
        <v-chip
          v-if="shortcut"
          class="me-1"
          color="#009688"
          label
          size="x-small"
          title="Originally, this product belongs to a different category."
        >
          <v-icon size="9" start>snippet_folder</v-icon>
          Shortcut
        </v-chip>
        <v-avatar v-if="product.connect_id" class="me-1" rounded size="24"
          ><img :src="getConnectIcon(product.connect_id)"
        /></v-avatar>

        {{ product.title_en?.limitWords(24) }}
      </h6>
    </div>

    <!-- Vendor owner -->
    <div
      v-if="vendor"
      :title="$t('global.commons.vendor')"
      class="pa-1 text-start d-flex align-center small"
    >
      <v-avatar
        v-if="vendor"
        :class="vendor.enable ? '-blue' : '-red'"
        class="avatar-gradient -thin me-2 hover-scale"
        size="30"
        ><img :src="getShopImagePath(vendor.icon, 64)"
      /></v-avatar>

      <div class="flex-grow-1">
        <small class="d-block">{{ $t("global.commons.vendor") }}</small>
        <b>{{ vendor.name }}</b>
      </div>
    </div>

    <!-- Vendors -->
    <div v-if="vendors && vendors.length && !vendor" class="my-1">
      <v-avatar
        v-for="v in vendors"
        :key="v.id"
        :class="v.enable ? '-blue' : '-red'"
        :title="v.name"
        class="avatar-gradient -thin me-1 hover-scale"
        size="30"
        ><img v-if="v.icon" :src="getShopImagePath(v.icon, 64)" />
        <v-icon v-else size="small">storefront</v-icon>
      </v-avatar>
    </div>

    <product-variants-view
      v-if="product.variants"
      :variants="filterVariant ? [filterVariant] : product.variants"
      center
      class="flex-grow-0 mb-2"
      small
    />

    <p
      v-if="showPrice"
      :class="{ 'editable-click': showEditButton }"
      class="m-0 px-2"
      title="Edit price"
      @mouseleave="show_price_detail = false"
      @mouseover="show_price_detail = true"
      @click.stop="
        showEditButton
          ? $router.push({
              name: 'BPageProductEdit',
              params: { product_id: product.id },
              hash: '#price',
            })
          : undefined
      "
    >
      <small class="text-muted mb-0 me"
        >{{ $t("global.commons.price") }}:
      </small>

      <u-price
        :amount="price_converted"
        class="font-weight-medium hover-able mx-1"
        large
      ></u-price>

      <span v-if="discount_percent" class="discount-badge m-1"
        >{{ discount_percent }} %</span
      >

      <v-icon
        v-if="!price_converted || price_converted <= 0"
        :title="
          product.price > 0 ? 'Exchange rate not valid!' : 'Price not valid!'
        "
        class="ms-2 mb-2 blink-me"
        color="red"
        size="small"
        >fa:fas fa-exclamation-triangle
      </v-icon>

      <small v-if="product.unit" class="ms-2">/ {{ product.unit }}</small>
    </p>

    <v-spacer></v-spacer>
    <div v-if="!compactMode && extended" class="border-top text-start mt-2">
      <v-slide-y-reverse-transition hide-on-leave>
        <div
          v-if="showPrice && show_price_detail"
          key="1"
          class="d-flex align-center"
        >
          <div class="w-50 pt-2">
            <p class="text-subtitle-2 my-1">
              {{ $t(pricing.title) }}
            </p>
            <p class="mb-1">
              <small>
                <i class="fas fa-tag"></i>
                {{ $t("global.commons.price") }}:
              </small>

              <u-price
                :amount="product.price"
                :currency="product.currency"
                class="text-success"
              ></u-price>
            </p>

            <p class="mb-1">
              <small>
                <i class="fas fa-plus"></i>
                {{ $t("admin_shop.products.product_widget.value_added") }}:
              </small>

              <u-price
                :amount="product.commission"
                :currency="product.currency"
                class="text-success"
              ></u-price>
            </p>

            <p class="mb-1">
              <small>
                <i class="fas fa-minus"></i>
                {{ $t("admin_shop.products.product_widget.discount") }}:
              </small>

              <u-price
                :amount="product.discount"
                :currency="product.currency"
                class="text-success"
              ></u-price>
            </p>
          </div>
          <div class="w-50 pt-2">
            <u-time-progress-bar
              :created-time="product.created_at"
              :end-time="product.dis_end"
              :start-time="product.dis_start"
              class="mx-auto"
            />
          </div>
        </div>
        <div v-else key="2" class="d-flex align-center">
          <div
            v-if="!compactMode && !show_price_detail"
            class="w-50 border-end p-3 px-4 text-center"
          >
            <v-avatar
              :size="60"
              class="hover-scale-small force-top"
              color="grey-lighten-4"
              drop-image="true"
              @click="(e) => $emit('click:image', e)"
              ><!-- dro-image : active drop area for images fast upload -->
              <v-img
                v-if="product.icon"
                :src="getShopImagePath(product.icon, IMAGE_SIZE_SMALL)"
                aspect-ratio="1"
                class="bg-grey-lighten-2"
              >
                <template v-slot:placeholder>
                  <v-progress-circular
                    class="center-absolute"
                    color="grey-lighten-5"
                    indeterminate
                  />
                </template>
                <v-progress-circular
                  v-if="uploading"
                  :model-value="uploading.progress"
                  class="center-absolute"
                  color="blue"
                ></v-progress-circular>
              </v-img>
            </v-avatar>

            <template v-if="showRatting && product.rate_count">
              <v-rating
                :model-value="product.rate"
                active-color="yellow-darken-3"
                color="grey-darken-1"
                density="compact"
                half-increments
                readonly
                size="small"
              />

              <div>
                <span class="small m-0">{{
                  numeralFormat(product.rate_count, "0,0a")
                }}</span>
                <span class="text-muted small me-1 ms-2 mt-0 mb-0">
                  {{ $t("admin_shop.products.product_widget.review_unit") }}
                </span>
              </div>
            </template>
            <small v-else-if="showRatting" class="d-block mt-2"
              >No Review</small
            >
          </div>
          <div
            v-if="showStatistics && !show_price_detail"
            class="w-50 p-3 px-4 text-start"
          >
            <p class="mb-1">
              <i
                :class="quantity ? 'text-success' : 'text-muted'"
                class="fas fa-boxes"
              />
              <small class="mx-1">
                {{ $t("admin_shop.products.product_widget.in_stock") }}:
              </small>
              <small v-if="isFile">
                {{ $t("global.commons.infinite") }}
              </small>
              <span v-else-if="quantity">
                {{ numeralFormat(quantity, "0,0a") }}
                <span class="small">{{
                  $t("admin_shop.products.product_widget.product_unit")
                }}</span>
              </span>
              <b v-else class="text-danger m-small">{{
                $t("global.commons.out_of_stock")
              }}</b>

              <v-icon
                v-if="quantity > 0 && quantity < 5"
                :title="$t('global.commons.low_inventory_warning')"
                class="ms-2"
                color="amber"
                size="small"
                >fa:fas fa-exclamation-circle
              </v-icon>
            </p>

            <p class="mb-1">
              <i class="fas fa-cash-register text-muted" />
              <small class="mx-1"
                >{{ $t("admin_shop.products.product_widget.total_sell") }}:
              </small>
              {{ numeralFormat(product.sells, "0,0a") }}
              <span class="small">{{
                $t("admin_shop.products.product_widget.product_unit")
              }}</span>
            </p>

            <p class="mb-1">
              <i class="fas fa-eye text-muted" />
              <small class="mx-1"
                >{{ $t("admin_shop.products.product_widget.total_view") }}:
              </small>
              {{ numeralFormat(product.visits, "0,0a") }}
              <span class="small">{{
                $t("admin_shop.products.product_widget.view_unit")
              }}</span>
            </p>

            <v-row no-gutters>
              <v-chip
                v-if="!product.original"
                class="m-1 text-uppercase px-2"
                color="red"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t("global.commons.fake") }}
              </v-chip>
              <v-chip
                v-if="
                  conditionObject &&
                  product.condition != ProductCondition.NEW.code
                "
                class="m-1 text-uppercase px-2"
                pill
                size="x-small"
                variant="outlined"
                >{{ $t(conditionObject.title) }}
              </v-chip>

              <router-link
                v-if="product.ar_src"
                :to="{
                  name: 'BPageProduct3D',
                  params: { product_id: product.id },
                }"
                class="row-hover mx-auto"
                title="AR \ 3D"
                @click.stop
              >
                <v-img
                  :src="require('../../../../../assets/icons/3d.svg')"
                  class=""
                  height="24"
                  width="24"
                ></v-img>
              </router-link>

              <router-link
                v-if="product.video"
                :to="{
                  name: 'BPageProductEdit',
                  params: { product_id: product.id },
                  hash: '#images',
                }"
                class="row-hover mx-auto"
                title="Video"
                @click.stop
              >
                <v-icon class="" color="#D93F21" size="24" width="24"
                  >fa:fab fa-youtube
                </v-icon>
              </router-link>

              <router-link
                v-if="product.reselling"
                :to="{
                  name: 'BPageProductDropshipping',
                  params: { product_id: product.id },
                }"
                class="row-hover mx-auto"
                title="Drop shipping"
                @click.stop
              >
                <img
                  :src="
                    require('../../../../../assets/icons/dropshipping-green.svg')
                  "
                  height="24"
                  width="24"
                />
              </router-link>
            </v-row>
          </div>
        </div>
      </v-slide-y-reverse-transition>
    </div>

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
  </s-widget>
</template>

<script>
import CircleImage from "../../../../../ui/image/CircleImage.vue";
import UTimeProgressBar from "../../../../../ui/time/progress-bar/UTimeProgressBar.vue";
import ProductVariantsView from "../../../../../storefront/product/variant/ProductVariantsView.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import { PricingTypes } from "@selldone/core-js/enums/product/PricingTypes";
import BNoteButton from "../../../../note/button/BNoteButton.vue";

export default {
  name: "BProductWindowProductLarge",
  components: {
    BNoteButton,
    ProductVariantsView,
    UTimeProgressBar,
    CircleImage,
  },
  emits: ["select", "click:image", "onShowNote", "onSelect"],
  props: {
    product: {
      required: true,
      type: Object,
    },
    shop: {
      required: true,
      type: Object,
    },

    small: {
      required: false,
      default: false,
      type: Boolean,
    },

    dark: {
      required: false,
      default: false,
      type: Boolean,
    },
    color: {
      required: false,
      default: "white",
      type: String,
    },

    extended: {
      required: false,
      default: true,
      type: Boolean,
    },

    showEditButton: {
      required: false,
      type: Boolean,
      default: false,
    },
    showRatting: {
      required: false,
      type: Boolean,
      default: false,
    },

    showStatistics: {
      required: false,
      type: Boolean,
      default: false,
    },
    showPrice: {
      required: false,
      type: Boolean,
      default: false,
    },

    compactMode: {
      required: false,
      type: Boolean,
      default: false,
    },

    hover: {
      type: Boolean,
      default: true,
    },
    filterVariant: {},

    dashed: {
      type: Boolean,
      default: true,
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
  },

  data() {
    return {
      show_price_detail: false,
      ProductCondition: ProductCondition,
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
    quantity() {
      return this.isFile ? 999 : this.product.quantity;
    },
    price_converted() {
      if (!this.product) return 0;

      if (this.filterVariant)
        return this.CalcPriceProductCurrentCurrency(
          this.shop,
          this.filterVariant,
          null,
        );

      return this.CalcPriceProductCurrentCurrency(
        this.shop,
        this.product,
        null,
      );
    },
    discount_percent() {
      return this.discountProductPercent(this.shop, this.product, null);
    },

    state_class() {
      return this.product.status === "Close"
        ? "bg-danger"
        : this.quantity || this.product.type === ProductType.FILE.code
          ? "bg-success"
          : "bg-warning";
    },
    conditionObject() {
      return Object.values(ProductCondition).find(
        (item) => item.code === this.product.condition,
      );
    },

    add_by_dropShipping() {
      return !!this.product.parent_id;
    },
    pricing() {
      return PricingTypes[this.product.pricing];
    },

    // -------- Uploading image: --------
    uploading() {
      const found = Object.values(this.$store.getters.getUploadingKeeper).find(
        (it) => it.target && it.target.product === this.product.id,
      );
      return found ? found : null;
    },
    // ----------------------------------
  },
  mounted() {},

  methods: {},
};
</script>

<style lang="scss" scoped>
.b--product-window-product-large {
  background: var(--card-color);
}

.discount-badge {
  vertical-align: text-top;
  color: white;
  background-image: linear-gradient(to bottom right, #d32f2f, #c2185b);
  border-radius: 8px;
  padding: 2px 4px;
  font-size: 0.7em;
  unicode-bidi: embed;
}

.widget-hover {
  transition: box-shadow 0.65s !important;
  min-height: 100px;

  &:hover {
    box-shadow: 0px 10px 50px 0px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.5s !important;

    .drop-shipping-mode {
      height: 32px;
      background-color: rgba(104, 159, 56, 0.89);

      img,
      span {
        transition-delay: 0.25s;
        opacity: 1;
      }
    }
  }
}

a {
  color: #444;

  &:hover {
    color: #444;
  }
}

.drop-shipping-mode {
  transition: all 0.35s;
  background-color: #689f38;
  position: absolute;
  height: 3px;
  top: 0;
  width: 100%;
  left: 0;
  pointer-events: none;

  color: #fff;

  img,
  span {
    transition: all 0.15s;
    opacity: 0;
    margin: 4px;
  }
}

.-deleted {
  border-color: red !important;

  &:after {
    position: absolute;
    bottom: 0;
    content: attr(deleted_at);
    background-color: red;
    padding: 4px 8px;
    width: 100%;
    left: 0;
    z-index: 1;
    color: #fff;
    text-align: center;
  }
}

.v-t {
  vertical-align: text-top;
}

.border-selected {
  border: solid #0061e0 4px !important;
}

.-dashed {
  border: #444 dashed 1.5px;
}

.-shortcut {
  border-color: #009688 !important;
}
</style>
