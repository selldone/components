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

<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <s-widget
    :product-id="product.id"
    class="text-start overflow-hidden"
    style="border-radius: 8px"
    :class="[
      small ? 'm-1' : '',
      dark ? 'widget-dark' : '',
      hover ? 'widget-hover' : '',
      dashed ? '-dashed' : '',
      hover ? 'pointer-pointer' : '',
      product.deleted_at ? 'op-0-7 -deleted' : '',
      selected || iSelected ? 'border-selected ' : '',
      shortcut ? '-shortcut' : '',
    ]"
    :deleted_at="getFromNowString(product.deleted_at)"
    :style="`background: ${color}`"
    :title="`<h5 class='align-items-center pb-1'  style='font-size: 1.16rem;min-height: 42px'>    <span class='circle ${state_class}' style='font-size: 6px;'></span>  ${product.title?.limitWords(
      12,
    )}  </h5>`"
    body-class="pa-0"
    custom-header
    @click="$emit('select')"
    :h100="false"
  >
    <template v-slot:top-left>
      <v-btn
        v-if="showEditButton"
        icon
        variant="text"
        :to="{
          name: 'BProductAddFull',
          params: { product_id: product.id },
          hash: '#general',
        }"
        class="z2 mx-1"
        @click.stop
        title="Edit product."
        size="small"
      >
        <v-icon size="24"> edit_square</v-icon>
      </v-btn>

      <!-- Add Note Button -->
      <team-note-button
        v-if="showNotes || (product.note && product.note.length)"
        class="z2 mx-1"
        :note="product.note"
        @click="$emit('onShowNote', product)"
        :activeColor="showNotes ? undefined : '#333'"
      ></team-note-button>

      <!-- Selectable -->
      <template v-if="showSelect">
        <v-icon class="mx-1" :color="iSelected ? 'primary' : '#333'" size="24"
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
        style="
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
        "
        class="pp usall"
        @click.stop="$emit('onSelect', product)"
      ></div>
    </template>

    <div v-if="add_by_dropShipping" class="drop-shipping-mode">
      <img
        width="24"
        height="24"
        src="../../../assets/icons/dropshipping-w.svg"
      />
      <span>{{ $t("global.commons.drop_shipping") }}</span>
    </div>

    <div>
      <img
        v-if="!compactMode"
        class="float-end"
        :src="getProductTypeImage(product.type)"
        height="16px"
        :title="`${$t(
          'admin_shop.products.product_widget.product_type',
        )}: ${getProductTypeName(product.type)}`"
      />
      <h6
        class="fw-semi-bold mb-1 small"
        style="min-height: 21px"
        :class="small ? 'small' : ''"
      >
        <v-chip
          v-if="shortcut"
          label
          color="#009688"
          size="x-small"
          class="me-1"
          title="Originally, this product belongs to a different category."
        >
          <v-icon start size="9">snippet_folder</v-icon>
          Shortcut
        </v-chip>
        <v-avatar v-if="product.connect_id" size="24" rounded class="me-1"
          ><img :src="getConnectIcon(product.connect_id)"
        /></v-avatar>

        {{ product.title_en?.limitWords(24) }}
      </h6>
    </div>

    <!-- Vendor owner -->
    <div
      v-if="vendor"
      class="pa-1 text-start d-flex align-center small"
      :title="$t('global.commons.vendor')"
    >
      <v-avatar
        v-if="vendor"
        size="30"
        class="avatar-gradient -thin me-2 hover-scale"
        :class="vendor.enable ? '-blue' : '-red'"
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
        size="30"
        class="avatar-gradient -thin me-1 hover-scale"
        :class="v.enable ? '-blue' : '-red'"
        :title="v.name"
        ><img v-if="v.icon" :src="getShopImagePath(v.icon, 64)" />
        <v-icon v-else size="small">storefront</v-icon>
      </v-avatar>
    </div>

    <product-variants-view
      v-if="product.variants"
      :variants="filterVariant ? [filterVariant] : product.variants"
      small
      center
      class="flex-grow-0 mb-2"
    />

    <p
      v-if="showPrice"
      @mouseover="show_price_detail = true"
      @mouseleave="show_price_detail = false"
      class="m-0 px-2"
      :class="{ 'editable-click': showEditButton }"
      title="Edit price"
      @click.stop="
        showEditButton
          ? $router.push({
              name: 'BProductAddFull',
              params: { product_id: product.id },
              hash: '#price',
            })
          : undefined
      "
    >
      <small class="text-muted mb-0 me"
        >{{ $t("global.commons.price") }}:
      </small>

      <price-view
        class="font-weight-medium hover-able mx-1"
        :amount="price_converted"
        large
      ></price-view>

      <span v-if="discount_percent" class="discount-badge m-1"
        >{{ discount_percent }} %</span
      >

      <v-icon
        v-if="!price_converted || price_converted <= 0"
        class="ms-2 mb-2 blink-me"
        size="small"
        color="red"
        :title="
          product.price > 0 ? 'Exchange rate not valid!' : 'Price not valid!'
        "
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

              <price-view
                class="text-success"
                :amount="product.price"
                :currency="product.currency"
              ></price-view>
            </p>

            <p class="mb-1">
              <small>
                <i class="fas fa-plus"></i>
                {{ $t("admin_shop.products.product_widget.value_added") }}:
              </small>

              <price-view
                class="text-success"
                :amount="product.commission"
                :currency="product.currency"
              ></price-view>
            </p>

            <p class="mb-1">
              <small>
                <i class="fas fa-minus"></i>
                {{ $t("admin_shop.products.product_widget.discount") }}:
              </small>

              <price-view
                class="text-success"
                :amount="product.discount"
                :currency="product.currency"
              ></price-view>
            </p>
          </div>
          <div class="w-50 pt-2">
            <s-time-progress-bar
              class="mx-auto"
              :created-time="product.created_at"
              :start-time="product.dis_start"
              :end-time="product.dis_end"
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
              color="grey-lighten-4"
              class="hover-scale-small force-top"
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
                    indeterminate
                    color="grey-lighten-5"
                    class="center-absolute"
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
                color="grey-darken-1"
                active-color="yellow-darken-3"
                half-increments
                size="small"
                readonly
                density="compact"
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
                class="fas fa-boxes"
                :class="quantity ? 'text-success' : 'text-muted'"
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
                color="amber"
                v-if="quantity > 0 && quantity < 5"
                class="ms-2"
                :title="$t('global.commons.low_inventory_warning')"
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
                variant="outlined"
                v-if="!product.original"
                color="red"
                class="m-1 text-uppercase px-2"
                size="x-small"
                pill
                >{{ $t("global.commons.fake") }}
              </v-chip>
              <v-chip
                variant="outlined"
                v-if="
                  conditionObject &&
                  product.condition != ProductCondition.NEW.code
                "
                size="x-small"
                class="m-1 text-uppercase px-2"
                pill
                >{{ $t(conditionObject.title) }}
              </v-chip>

              <router-link
                v-if="product.ar_src"
                :to="{
                  name: 'Product3DPage',
                  params: { product_id: product.id },
                }"
                class="row-hover mx-auto"
                title="AR \ 3D"
                @click.stop
              >
                <v-img
                  height="24"
                  width="24"
                  :src="require('@components/assets/icons/3d.svg')"
                  class=""
                ></v-img>
              </router-link>

              <router-link
                v-if="product.video"
                title="Video"
                :to="{
                  name: 'BProductAddFull',
                  params: { product_id: product.id },
                  hash: '#images',
                }"
                class="row-hover mx-auto"
                @click.stop
              >
                <v-icon size="24" width="24" class="" color="#D93F21"
                  >fa:fab fa-youtube
                </v-icon>
              </router-link>

              <router-link
                v-if="product.reselling"
                title="Drop shipping"
                :to="{
                  name: 'ProductDropShippingPage',
                  params: { product_id: product.id },
                }"
                class="row-hover mx-auto"
                @click.stop
              >
                <img
                  width="24"
                  height="24"
                  :src="
                    require('@components/assets/icons/dropshipping-green.svg')
                  "
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
import CircleImage from "@components/ui/image/CircleImage.vue";
import STimeProgressBar from "@components/ui/calendar/time-progress/STimeProgressBar.vue";
import ProductVariantsView from "@components/product/variant/ProductVariantsView.vue";
import { ProductType } from "@core/enums/product/ProductType";
import { ProductCondition } from "@core/enums/product/ProductCondition";
import { PricingTypes } from "@core/enums/product/PricingTypes";
import TeamNoteButton from "@components/backoffice/note/TeamNoteButton.vue";

export default {
  name: "WidgetProductCard",
  components: {
    TeamNoteButton,
    ProductVariantsView,
    STimeProgressBar,
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
  border: #444 dashed thin;
}

.-shortcut {
  border-color: #009688 !important;
}
</style>
