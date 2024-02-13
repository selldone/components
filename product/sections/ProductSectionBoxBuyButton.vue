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
  <div v-scroll="onScroll">
    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Product Locations ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->
    <div
      v-if="canBuy && has_product_locations_restriction"
      class="max-widget-width mx-4"
    >
      <v-sheet
        :color="buy_color"
        class="d-flex align-center position-relative border"
        dark
        style="padding: 4px 8px; border-radius: 12px"
      >
        <s-country-select
          v-model="selected_country"
          :dense="$vuetify.display.xsOnly"
          :filter="Object.keys(locations)"
          :no-country-name="$vuetify.display.xsOnly"
          :style="$vuetify.display.xsOnly ? 'max-width:80px' : ''"
          flat
          hide-details
          item-value="alpha2"
          placeholder="Select a country..."
          solo
          transparent
        ></s-country-select>
        <v-autocomplete
          v-model="selected_postal"
          :dense="$vuetify.display.xsOnly"
          :disabled="!locations[selected_country]"
          :items="locations[selected_country]"
          :no-data-text="$t('buy_button.zip_pin_not_available_msg')"
          :placeholder="$t('buy_button.zip_pin_placeholder')"
          bg-color="transparent"
          flat
          hide-details
          variant="solo"
          @update:model-value="setMyLocation"
        >
          <template v-slot:prepend-inner>
            <span class="small me-2 single-line" style="line-height: normal"
              >{{ $t("buy_button.zip_pin_input") }}
            </span>
          </template>
          <template v-slot:append-inner>
            <v-icon
              v-if="selected_country && !selected_postal"
              class="blink-me-linear"
              color="primary"
              >touch_app
            </v-icon>
          </template>
        </v-autocomplete>

        <s-progress-loading v-if="busy_location"></s-progress-loading>
      </v-sheet>
    </div>

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Main Buy Button ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

    <s-shop-buy-button
      v-if="has_buy_button"
      ref="buy_button"
      v-intersect="onIntersect"
      :can-buy="canBuy"
      :class="{ disabled: hasVariants && !currentVariant }"
      :current-variant="currentVariant"
      :preferences="preferences"
      :product="product"
      :quick-buy-mode="quickBuyMode"
      :selected-subscription-price="selectedSubscriptionPrice"
      :vendor-product="selectedVendorProduct"
      class="mx-2 widget-buttons mt-2 mb-3 d-flex flex-column flex-grow-0"
      style="min-height: 72px"
    />

    <!-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ FILE:  Download list files dialog ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ -->

    <v-btn
      v-if="isFile && product.buy_file"
      class="mx-2 widget-buttons mt-2 mb-3 d-flex flex-column flex-grow-0"
      color="green"
      dark
      min-width="200"
      rounded
      size="x-large"
      @click="
        () => {
          files_show = true;
        }
      "
    >
      <v-icon class="me-2">cloud_download</v-icon>
      {{ $t("global.actions.download") }}
    </v-btn>

    <!-- █████████████████ Dialog > Files List █████████████████ -->
    <v-dialog
      v-if="isFile"
      v-model="files_show"
      fullscreen
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-title>
          <v-icon class="me-1" color="black">folder</v-icon>
          {{ $t("global.commons.files_list") }}
        </v-card-title>

        <v-card-text>
          <div class="widget-box mb-5">
            <v-list-subheader>
              <v-icon class="me-1" size="small">warning_amber</v-icon>
              After downloading files, check those with your antivirus.
            </v-list-subheader>

            <s-shop-product-files-list
              :files="product.files"
              purchased
            ></s-shop-product-files-list>
          </div>
        </v-card-text>

        <v-card-actions>
          <div class="widget-buttons">
            <v-btn size="x-large" variant="text" @click="files_show = false">
              <v-icon start>close</v-icon>
              {{ $t("global.actions.close") }}
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- █████████████████ Sticky But Button █████████████████ -->

    <div
      v-if="
        canBuy &&
        has_buy_button &&
        hssStickyButButton &&
        !(
          (
            $vuetify.display.mdAndDown && corresponding_basket_item
          ) /*Don't show in small screen if exist in cart!*/
        )
      "
      :class="{
        '-hide': isIntersecting || no_side_buy,
        '-in-cart': corresponding_basket_item,
      }"
      class="sticky-buy-widget"
    >
      <div class="sticky-product">
        <v-avatar v-if="sticky_image" class="me-3" rounded size="64">
          <img
            :src="sticky_image"
            :style="{
              objectFit: product?.style?.contain ? 'contain' : 'cover',
            }"
          />
        </v-avatar>
        <div class="sticky-content">
          <div class="sticky-title">{{ product.title?.limitWords(10) }}</div>
          <div class="sticky-title-en">
            {{ product.title_en?.limitWords(20) }}
          </div>
        </div>
      </div>
      <div class="sticky-action">
        <s-shop-buy-button
          :can-buy="canBuy"
          :class="{ disabled: hasVariants && !currentVariant }"
          :current-variant="currentVariant"
          :preferences="preferences"
          :product="product"
          :quick-buy-mode="quickBuyMode"
          :selected-subscription-price="selectedSubscriptionPrice"
          :vendor-product="selectedVendorProduct"
          class="mx-2 widget-buttons mt-2 mb-3 d-flex flex-column flex-grow-0"
          style="min-height: 72px"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SShopBuyButton from "../button/SShopBuyButton.vue";
import { ProductType } from "@core/enums/product/ProductType";
import SShopProductFilesList from "@components/storefront/product/file/SShopProductFilesList.vue";
import SCountrySelect from "@components/ui/country/select/SCountrySelect.vue";

export default {
  name: "ProductSectionBoxBuyButton",
  components: { SCountrySelect, SShopProductFilesList, SShopBuyButton },
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },

    currentVariant: {},

    preferences: {},

    canBuy: {
      type: Boolean,
      default: false,
    },

    hssStickyButButton: {
      type: Boolean,
      default: true,
    },

    selectedVendorProduct: {},

    quickBuyMode: {
      // Show basket sidebar after add to cart
      required: false,
      type: Boolean,
      default: false,
    },

    // ▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀

    selectedSubscriptionPrice: { type: Object },
  },

  data: () => ({
    // 🞇 File
    files_show: false,

    isIntersecting: true,
    no_side_buy: true,

    //-------------------------
    selected_country: null,
    selected_postal: null,
    busy_location: false,
  }),

  computed: {
    sticky_image() {
      return this.getShopImagePath(
        this.currentVariant?.image
          ? this.currentVariant.image
          : this.product.icon,
      );
    },

    has_buy_button() {
      return (
        (!this.isFile || !this.product.buy_file) /*File not purchased yet!*/ &&
        (this.is_available_location || this.corresponding_basket_item)
      );
    },

    isFile() {
      return this.product && this.product.type === ProductType.FILE.code;
    },

    hasVariants() {
      return (
        this.product &&
        this.product.product_variants &&
        this.product.product_variants.length > 0
      );
    },

    files() {
      return this.product.files;
    },
    basket() {
      return this.getBasket(this.product.type);
    },

    corresponding_basket_item() {
      if (!this.basket) return null;
      return this.basket.items.find(
        (item) =>
          item.product_id === this.product.id &&
          item.variant_id ===
            (this.currentVariant ? this.currentVariant.id : null),
      );
    },

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Product Locations ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    locations() {
      return this.product?.locations;
    },
    has_product_locations_restriction() {
      return !!this.locations;
    },
    is_available_location() {
      const receiver_info = this.basket?.receiver_info;
      const my_country = this.selected_country
        ? this.selected_country
        : receiver_info?.country;
      const my_postal = this.selected_postal
        ? this.selected_postal
        : receiver_info?.postal;
      const locations = this.locations;

      return (
        !this.has_product_locations_restriction ||
        (my_country &&
          my_postal &&
          locations[my_country] &&
          Array.isArray(locations[my_country]) &&
          locations[my_country].includes(my_postal))
      );
    },
    theme() {
      return this.shop.theme;
    },
    buy_color() {
      return this.theme && this.theme.color_buy
        ? this.theme.color_buy
        : "#0061e0";
    },
  },
  watch: {
    product() {
      this.init();
    },
  },
  created() {
    this.init();
  },
  methods: {
    onScroll() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollProgress = (scrollTop + windowHeight) / documentHeight;
      this.no_side_buy = scrollProgress >= 0.8 || scrollProgress < 0.2; // Prevent showing sidebar buy button at the beginning and end of the page.
    },

    init() {
      if (this.has_product_locations_restriction) {
        // Set initial selected location:
        const receiver_info = this.basket?.receiver_info;
        if (receiver_info) {
          this.selected_country = receiver_info.country;
          this.selected_postal = receiver_info.postal;
        }
        if (
          !this.selected_country &&
          this.locations &&
          Object.keys(this.locations).length
        ) {
          // Auto select first country:
          this.selected_country = Object.keys(this.locations)[0];
        }
      }
    },

    setMyLocation() {
      if (!this.selected_country) return;

      this.busy_location = true;

      axios
        .post(
          window.XAPI.POST_SET_MY_LOCATION(this.shop.name, this.product.type),
          {
            country: this.selected_country,
            postal: this.selected_postal,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            this.setBasket(this.basket);
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_location = false;
        });
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――― External Function ▶ Buy ―――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    triggerBuyButton(count = 1) {
      this.$refs.buy_button.physicalBuyAction(count);
    },

    onIntersect(isIntersecting) {
      this.isIntersecting = isIntersecting;
    },
  },
};
</script>

<style lang="scss" scoped>
.sticky-buy-widget {
  --max-width: 460px;
  --bottom: 8px;
  --right: 8px;

  position: fixed;
  right: var(--right);
  bottom: var(--bottom);
  width: var(--max-width);
  border-radius: 12px;
  background-color: #fff;
  padding: 8px;
  transition: all 0.3s;
  z-index: 999;
  max-width: calc(100% - 16px);

  @media screen and (max-width: 960px) {
    --bottom: 86px;
  }
  @media screen and (max-width: 460px) {
    --bottom: 0;
    --right: 0;
    max-width: 100%;
    border-radius: 0;
  }

  &.-hide {
    --bottom: 0;
    transform: translateY(calc(100% + 24px));
  }

  &.-in-cart {
    --bottom: 52px; // Green strip!
    transform: translateX(90%);

    &:hover {
      transform: translateX(0);
    }

    &.-hide {
      --bottom: 0;
      transform: translateX(90%) translateY(calc(100% + 24px));
    }
  }

  .sticky-product {
    display: flex;
    align-items: center;

    .sticky-content {
      flex-grow: 1;

      .sticky-title {
        font-weight: 600;
        margin: 6px 0;
      }

      .sticky-title-en {
        opacity: 0.7;
      }
    }
  }
}
</style>
