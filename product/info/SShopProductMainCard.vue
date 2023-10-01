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
  <div class="s--product-info">
    <!-- ████████████████████ Main Product Info View  ████████████████████ -->

    <v-container fluid>
      <v-row>
        <!--  ▃▃▃▃▃▃▃▃▃▃ Product Title (Large) ▃▃▃▃▃▃▃▃▃▃ -->
        <v-col v-if="!$vuetify.breakpoint.lgAndUp" cols="12">
          <h1>
            {{ product.title }}
            <v-chip
              v-if="!has_original_warranty"
              small
              color="red"
              dark
              class="mx-2"
            >
              <v-icon x-small left>fas fa-exclamation</v-icon>
              {{ $t("product_info.fake") }}
            </v-chip>
          </h1>
        </v-col>

        <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Images ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col
          v-if="showCover"
          cols="12"
          :lg="vertical ? 12 : 6"
          class="image-gallery-root"
        >
          <!-- ▁▁▁▁▁▁ 🞇 Slide Show 🞇 ▁▁▁▁▁▁ -->

          <s-shop-product-slide-show
            :shop="shop"
            :product="product"
            :current-variant="current_variant"
            :vertical="$vuetify.breakpoint.smAndUp"
          ></s-shop-product-slide-show>
        </v-col>

        <!--  ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

        <v-col
          cols="12"
          :lg="vertical ? 12 : 6"
          class="text-start d-flex flex-column ps-3 ps-sm-6 ps-md-16"
        >
          <!--  ▃▃▃▃▃▃▃▃▃▃ Product Title En (Small) ▃▃▃▃▃▃▃▃▃▃ -->

          <div
            class="s--title-en d-flex flex-column flex-sm-row align-start align-sm-center"
          >
            <div class="d-flex align-center">
              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Type ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

              <img
                :src="getProductTypeImage(product.type)"
                height="16"
                width="16"
                class="m-1 me-2 flex-grow-0"
                :title="getProductTypeName(product.type)"
              />

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Brand ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

              <component
                v-if="product.brand"
                :is="!window.ExternalWidget ? 'router-link' : 'a'"
                :to="{
                  name: 'ShopPage',
                  query: { search: product.brand },
                }"
                v-bind="
                  window.ExternalWidget
                    ? {
                        href: getShopPageLink(shop, {
                          search: product.brand,
                        }),
                        target: '_blank',
                      }
                    : {}
                "
                class="link-underlined single-line d-inline-block flex-grow-0 me-2"
                :title="$t('product_info.brand')"
                ><b>{{ product.brand }}</b>
                <span class="mx-1 d-none d-sm-inline">/</span>
              </component>
            </div>

            <div class="flex-grow-1">
              {{ product.title_en?.limitWords(limit_title_en) }}
              <v-btn
                v-if="product.title_en?.wordsCount() > 20"
                @click="limit_title_en = limit_title_en > 20 ? 20 : 2000"
                small
                text
                color="#111"
                class="tnt"
                >{{
                  limit_title_en > 20
                    ? $t("global.actions.collapse")
                    : $t("global.actions.view_all")
                }}...</v-btn
              >
            </div>

            <template v-if="product.rate_count && product.rate">
              <b class="mx-2 -rate-value">{{
                product.rate | numeralFormat("0.0")
              }}</b>

              <v-rating
                v-model="product.rate"
                color="yellow darken-3"
                background-color="grey darken-1"
                empty-icon="$vuetify.icons.ratingFull"
                half-increments
                readonly
                small
                dense
              />
            </template>
          </div>

          <!--  ▃▃▃▃▃▃▃▃▃▃ Product Title (Large) ▃▃▃▃▃▃▃▃▃▃ -->

          <h1 v-if="$vuetify.breakpoint.lgAndUp">
            {{ product.title }}
            <v-chip
              v-if="!has_original_warranty"
              small
              color="red"
              dark
              class="mx-2"
            >
              <v-icon x-small left>fas fa-exclamation</v-icon>
              {{ $t("product_info.fake") }}
            </v-chip>
          </h1>

          <!-- ▁▁▁▁▁▁ 🞇 Under title buttons (Add to compare, like , ..) 🞇 ▁▁▁▁▁▁ -->
          <product-section-box-extra-buttons
            :current-variant="current_variant"
            :product="product"
            :shop="shop"
          ></product-section-box-extra-buttons>

          <!-- ▁▁▁▁▁▁ 🞇 Badges 🞇 ▁▁▁▁▁▁ -->
          <s-shop-product-section-box-badges
            :shop="shop"
            :product="product"
            :vertical="vertical"
            class="mt-5"
          ></s-shop-product-section-box-badges>

          <hr />

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Product info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <v-container fluid class="pt-0 pb-0 flex-grow-1 d-flex flex-column">
            <!--  ▃▃▃▃▃▃▃▃▃▃ Section 1 > Product General inf (Type, Category, Brand,...) ▃▃▃▃▃▃▃▃▃▃ -->

            <!-- ▁▁▁▁▁▁ 🞇 General info 🞇 ▁▁▁▁▁▁ -->
            <!--  <product-section-box-general-info
                :shop="shop"
                :product="product"
              ></product-section-box-general-info>
                -->
            <!-- ▁▁▁▁▁▁ 🞇 Conditions 🞇 ▁▁▁▁▁▁ -->
            <!--  <product-section-box-condition
                  :shop="shop"
                  :product="product"
                  :vertical="vertical"
                ></product-section-box-condition>-->

            <!-- ▁▁▁▁▁▁ 🞇 Variants 🞇 ▁▁▁▁▁▁ -->
            <product-section-box-variants
              :shop="shop"
              :product="product"
              :filter.sync="filter"
              :current-variant.sync="current_variant"
              :selection-values.sync="selection_values"
            ></product-section-box-variants>

            <!-- ▁▁▁▁▁▁ 🞇 Service 🞇 ▁▁▁▁▁▁ -->
            <product-section-box-service
              :shop="shop"
              :product="product"
              :preferences.sync="preferences"
            ></product-section-box-service>

            <v-spacer></v-spacer>

            <!-- ▁▁▁▁▁▁ 🞇 Valuation 🞇 ▁▁▁▁▁▁ -->

            <product-section-box-valuation
              v-if="preferences && preferences.valuation"
              :shop="shop"
              :product="product"
              :current-variant="current_variant"
              :preferences="preferences"
              :correspondingBasketItem="corresponding_basket_item"
            ></product-section-box-valuation>

            <!-- ▁▁▁▁▁▁ 🞇 🎗️ Subscription Price 🞇 ▁▁▁▁▁▁ -->
            <s-subscription-price-select
              v-if="isSubscription"
              v-model="selected_subscription_price"
              :subscription-prices="subscription_prices"
              class="my-3"
              return-object
              :class="{
                pen:
                  !!corresponding_basket_item?.subscription_price_id /*An item exists in the basket*/ ||
                  !!membership_subscribed_plan /* 🦄 Membership > Subscribed before*/,
              }"
              :disabled="!product.quantity"
            ></s-subscription-price-select>

            <!-- ▁▁▁▁▁▁ 🞇 Price 🞇 ▁▁▁▁▁▁ -->
            <product-section-box-price
              v-else
              :shop="shop"
              :product="product"
              :current-variant="current_variant"
              :selected-vendor-product="selected_vendor_product"
              :preferences="preferences"
            ></product-section-box-price>

            <!-- ▁▁▁▁▁▁ 🞇 Tax + Shipping 🞇 ▁▁▁▁▁▁ -->
            <product-section-box-tax
              :shop="shop"
              :product="product"
            ></product-section-box-tax>

            <!-- ▁▁▁▁▁▁ 🞇 Extra Pricings 🞇 ▁▁▁▁▁▁ -->
            <product-section-box-extra-pricings
              :shop="shop"
              :product="product"
              :current-variant="current_variant"
              :selected-vendor-product="selected_vendor_product"
              :preferences="preferences"
              :quantity="corresponding_basket_item?.count"
              @select="(val) => $refs.buy_section.triggerBuyButton(val.min)"
            >
            </product-section-box-extra-pricings>

            <!-- ▁▁▁▁▁▁ 🞇 Coupon 🞇 ▁▁▁▁▁▁ -->

            <s-coupons
              :product-id="product.id"
              :variant-id="current_variant ? current_variant.id : undefined"
            ></s-coupons>

            <!--
                  █████████████████████████████████████████████████████████████
                  ―――――――――――――――― Buy Button ―――――――――――――――
                  █████████████████████████████████████████████████████████████
                  -->

            <!-- ▁▁▁▁▁▁ 🞇 Buy Button 🞇 ▁▁▁▁▁▁ -->
            <product-section-box-buy-button
              ref="buy_section"
              :shop="shop"
              :product="product"
              :current-variant="current_variant"
              :preferences="preferences"
              :can-buy="canBuy"
              :selected-vendor-product="selected_vendor_product"
              :selected-subscription-price="selected_subscription_price"
              :quick-buy-mode="quickBuyMode"
              :hss-sticky-but-button="hssStickyButButton"
              class="mt-3 mb-3"
            ></product-section-box-buy-button>
            <!-- ▁▁▁▁▁▁ 🞇 Embed Mode 🞇 ▁▁▁▁▁▁ -->
            <div
              v-if="embedMode"
              class="mx-2 widget-buttons mt-3 mb-3 d-flex flex-column flex-grow-0"
            >
              <v-btn
                :href="getProductLink(shop, product.id, product.slug)"
                min-width="220"
                dark
                min-height="72"
                target="_blank"
                :color="
                  shop.theme?.color_buy ? shop.theme.color_buy : '#0061e0'
                "
                style="font-size: 18px"
              >
                {{ $t("global.actions.buy") }}
                <v-icon class="mx-1">open_in_new</v-icon>
              </v-btn>
            </div>

            <s-stripe-split-payment-info
              :product="product"
              :variant="current_variant"
              :vendor-product="selected_vendor_product"
              :preferences="preferences"
              :selected-vendor-product="selected_vendor_product"
              :selected-subscription-price="selected_subscription_price"
              :basket="corresponding_basket_item ? basket : null"
              :country-code="basket?.receiver_info?.country"
            ></s-stripe-split-payment-info>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <!-- ████████████████████ 🟣 Marketplace (Vendors) 🟣 ████████████████████ -->

    <v-container v-if="vendors && vendors.length" class="my-0 my-sm-5 my-md-10">
      <s-smart-select-vendor
        v-model="selected_vendor_product_id"
        :vendors="vendors"
        force-show-all
        :label="$t('global.commons.vendors')"
        :hint="$t('product_info.select_a_vendor_message')"
        @change="changeVendor"
      >
      </s-smart-select-vendor>
    </v-container>

    <!-- ████████████████████ USER MESSAGE > Physical (All now!) ████████████████████ -->

    <v-container>
      <basket-item-user-message-form
        class="my-10"
        v-if="basket"
        :basket="basket"
        :product="product"
        :variant-id="current_variant ? current_variant.id : null"
      ></basket-item-user-message-form>
    </v-container>

    <!-- ████████████████████ Discount Countdown ████████████████████ -->

    <product-discount-countdown :product="product"></product-discount-countdown>
  </div>
</template>

<script>
import SShopProductRatingView from "@/Components/product/rating/SShopProductRatingView.vue";
import BasketItemUserMessageForm from "@/Components/backoffice/basket/BasketItemUserMessageForm.vue";
import SCoupons from "@/Components/storefront/incentives/coupon/SCoupons.vue";
import { ProductVariants } from "../../../../core/enums/product/ProductVariants";
import SSmartSelectVendor from "@/Components/vendor/SSmartSelectVendor.vue";
import ProductSectionBoxGeneralInfo from "@/Components/product/sections/ProductSectionBoxGeneralInfo.vue";
import ProductSectionBoxCondition from "@/Components/product/sections/ProductSectionBoxCondition.vue";
import ProductSectionBoxService from "@/Components/product/sections/ProductSectionBoxService.vue";
import ProductSectionBoxVariants from "@/Components/product/sections/ProductSectionBoxVariants.vue";
import SShopProductSectionBoxBadges from "@/Components/product/sections/SShopProductSectionBoxBadges.vue";
import ProductSectionBoxPrice from "@/Components/product/sections/ProductSectionBoxPrice.vue";
import ProductSectionBoxForAuction from "@/Components/product/sections/ProductSectionBoxForAuction.vue";
import ProductSectionBoxBuyButton from "@/Components/product/sections/ProductSectionBoxBuyButton.vue";
import ProductSectionBoxExtraButtons from "@/Components/product/sections/ProductSectionBoxExtraButtons.vue";
import SShopProductSlideShow from "@/Components/product/images/SShopProductSlideShow.vue";
import ProductSectionBoxValuation from "@/Components/product/sections/ProductSectionBoxValuation.vue";
import { ProductType } from "../../../../core/enums/product/ProductType";
import SSubscriptionPriceSelect from "@/Components/storefront/order/subscription/SSubscriptionPriceSelect.vue";
import { RibbonHelper } from "../../../../core/helper/ribbon/RibbonHelper";
import ProductSectionBoxExtraPricings from "@/Components/product/sections/ProductSectionBoxExtraPricings.vue";
import ProductSectionBoxTax from "@/Components/product/sections/ProductSectionBoxTax.vue";
import ProductDiscountCountdown from "@/Components/storefront/product/count-down/ProductDiscountCountdown.vue";
import SShopBuyButton from "@/Components/product/button/SShopBuyButton.vue";
import SStripeSplitPaymentInfo from "@/Components/payment/stripe/SStripeSplitPaymentInfo.vue";

export default {
  name: "ProductInfo",
  components: {
    SStripeSplitPaymentInfo,
    SShopBuyButton,
    ProductDiscountCountdown,
    ProductSectionBoxTax,
    ProductSectionBoxExtraPricings,
    SSubscriptionPriceSelect,
    ProductSectionBoxValuation,
    SShopProductSlideShow,
    ProductSectionBoxExtraButtons,
    ProductSectionBoxBuyButton,
    ProductSectionBoxForAuction,
    ProductSectionBoxPrice,
    SShopProductSectionBoxBadges,
    ProductSectionBoxVariants,
    ProductSectionBoxService,
    ProductSectionBoxCondition,
    ProductSectionBoxGeneralInfo,
    SSmartSelectVendor,
    SCoupons,
    BasketItemUserMessageForm,
    SShopProductRatingView,
  },
  props: {
    product: {
      required: true,
      type: Object,
    },

    canBuy: {
      required: false,
      type: Boolean,
      default: false,
    },
    showCover: {
      required: false,
      type: Boolean,
      default: false,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    quickBuyMode: {
      // Show basket sidebar after add to cart
      required: false,
      type: Boolean,
      default: false,
    },

    embedMode: {
      required: false,
      type: Boolean,
      default: false,
    },

    hssStickyButButton: {
      // Show floating stick buy button in the bottom right corner
      type: Boolean,
      default: true,
    },
  },
  data: () => ({
    //▅▅▅▅▅▅▅▅ 🟣 Marketplace 🟣 ▅▅▅▅▅▅▅▅
    selected_vendor_product_id: null,
    //████████████████████▅▅▅▅▅▅▅▅
    ProductVariants: ProductVariants,

    loading: true,
    rotation: {
      x: -Math.PI / 2,
      y: 0,
      z: 0,
    },

    busy: false,

    current_variant: null,

    selected_subscription_price: null,

    filter: { available: false }, // true: show only available variants

    // Service preferences:
    preferences: {},

    // Smart filter:
    selection_values: [],

    limit_title_en: 20,
  }),

  computed: {
    shop() {
      return this.getShop();
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
            (this.current_variant ? this.current_variant.id : null)
      );
    },

    has_original_warranty() {
      return this.product && this.product.original;
    },

    product_variants() {
      if (
        !this.product ||
        !this.product.product_variants ||
        !this.product.product_variants.length
      )
        return [];
      return this.product.product_variants;
    },

    AvailableProductVariants() {
      return Object.values(ProductVariants).filter((it) => {
        return this.product_variants.some((variant) => !!variant[it.code]);
      });
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 🟣 Marketplace 🟣 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    vendors() {
      return (
        this.product.vendors &&
        this.product.vendors.filter(
          (v) =>
            v.variant_id === (this.current_variant && this.current_variant.id)
        )
      );
    },

    selected_vendor_product() {
      return (
        this.selected_vendor_product_id &&
        this.product.vendors &&
        this.product.vendors.find(
          (v) => v.id === this.selected_vendor_product_id
        )
      );
    },

    isService() {
      return this.product && this.product.type === ProductType.SERVICE.code;
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    // ▀▀▀▀▀▀▀▀▀ 🍁 Valuation (Pricing form) 🍁 ▀▀▀▀▀▀▀▀▀

    valuation() {
      return this.product.valuation;
    },

    structure() {
      return this.valuation && this.valuation.structure;
    },

    // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀▀▀▀▀▀

    isSubscription() {
      return (
        this.product && this.product.type === ProductType.SUBSCRIPTION.code
      );
    },

    subscription_prices() {
      return this.product.subscription_prices;
    },

    // 🦄 Membership > Subscribed
    membership_subscribed_plan() {
      return RibbonHelper.isMembershipSubscribed(this.product);
    },
  },
  watch: {
    product() {
      this.resetToDefault(); // 🞇 Reset to default
      this.init();
    },
    current_variant(variant) {
      // Not supported in dashboard!
      this.$store.commit("setCurrentSelectedVariant", variant);

      this.autoVarF();

      // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 🟣 Marketplace 🟣 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
      this.assignVendor();
      // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    },

    corresponding_basket_item() {
      this.assignValuesByCurrentItemInBasket();
    },
  },
  created() {
    this.init();
  },

  mounted() {
    //  this.assignValuesByCurrentItemInBasket();
  },
  beforeDestroy() {
    this.$store.commit("setCurrentSelectedVariant", null); // Reset
  },

  methods: {
    init() {
      // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 🟣 Marketplace 🟣 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
      this.assignVendor();
      // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

      this.selectFirstVariant();

      if (this.isService) {
        this.$nextTick(() => {
          // Make sure all preferences updated by components (In service preferences will be created by <product-section-box-service>)
          this.assignValuesByCurrentItemInBasket();
        });
      } else {
        // In physical and virtual we should update preferences immediately otherwise price will not update by user inputs!
        this.assignValuesByCurrentItemInBasket();
      }

      // Set initial selected price for subscription:
      if (this.isSubscription) {
        this.selected_subscription_price =
          this.corresponding_basket_item?.subscription_price;

        //  🦄 Membership:
        if (this.membership_subscribed_plan) {
          this.selected_subscription_price = this.membership_subscribed_plan;
        }
      }
    },

    assignValuesByCurrentItemInBasket() {
      const item = this.corresponding_basket_item;
      // console.log("Find item in cart!",item);
      if (item) this.preferences = item.preferences;

      if (!this.preferences) this.preferences = {};

      //  console.log('PRE preferences-->',this.preferences,this.product.price_input,this.valuation,this.structure)

      // ▀▀▀▀▀▀▀▀▀ 🍁 Valuation (Pricing form) 🍁 ▀▀▀▀▀▀▀▀▀
      if (this.product.price_input === "custom") {
        let preferences = this.preferences;
        if (!preferences || Array.isArray(preferences)) preferences = {};

        if (
          !this.preferences.valuation ||
          Array.isArray(this.preferences.valuation)
        )
          preferences.valuation = {};

        const preferences_valuation = preferences.valuation;

        // ▀▀▀▀▀▀▀▀▀ Set initial values by structure: ▀▀▀▀▀▀▀▀▀
        if (this.structure) {
          this.structure.forEach((row) => {
            if (preferences_valuation[row.name] !== undefined) {
              return; // Rerun if exist
            }

            if (row.type === "select") {
              preferences_valuation[row.name] = /*row.selects[0]*/ null; // Prevent select unavailable items
            } else if (row.type === "number") {
              preferences_valuation[row.name] = row.default ? row.default : 0;
            } else {
              preferences_valuation[row.name] = row.default;
            }
          });
        }
        //▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀

        this.preferences = preferences;

        this.$forceUpdate();
      }
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――― External Function ▶ Buy ―――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    buy(variant = null) {
      if (variant) {
        this.current_variant = variant;
      }
      this.$nextTick(() => {
        this.$refs.buy_section.triggerBuyButton(1);
      });
    },

    onLoad() {
      this.loading = false;
      this.rotate();
    },
    rotate() {
      requestAnimationFrame(this.rotate);
      this.rotation.z += 0.01;
    },

    //█████████████████████████████████████████████████████████████
    //――――――――――――――――――――――――― Buy ▶ Basket ―――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    // Nothing!

    selectFirstVariant() {
      // 1. Try to find first variant existed in the basket:
      const basket_items =
        this.basket &&
        this.basket.items.find((item) => item.product_id === this.product.id);
      this.current_variant =
        basket_items &&
        basket_items.variant_id &&
        this.product_variants.find((v) => v.id === basket_items.variant_id);

      // 2. Try to select first variant:
      if (!this.current_variant)
        this.current_variant = this.product_variants.length
          ? this.product_variants[0]
          : null;

      this.autoVarF();
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― Smart Variants Show ――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    // Auto set selection_values by current variant:
    autoVarF() {
      if (!this.current_variant) return;
      this.selection_values = [];

      this.AvailableProductVariants.forEach((it) => {
        this.selection_values.push({
          code: it.code,
          value: this.current_variant[it.code],
        });
      });
    },

    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― 🟣 Marketplace 🟣 ――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████
    changeVendor() {
      let found = this.corresponding_basket_item;
      // If current variant (product) exist in the basket we send a request to server to update vendor of the item!
      if (found) {
        this.$nextTick(() => {
          this.$refs.buy_button.buyAddAction();
        });
      }
    },

    assignVendor() {
      let found = this.corresponding_basket_item;
      this.selected_vendor_product_id = found ? found.vendor_product_id : null;

      // Try assign first vendor:
      if (
        !this.selected_vendor_product_id &&
        this.vendors &&
        this.vendors.length
      ) {
        this.selected_vendor_product_id = this.vendors[0].id;
      }
    },
  },
};
</script>

<style lang="scss">
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

.s--product-info {
  --h1-size: 3rem;
  --h1-margin: 8px 12px 32px 12px;
  --title-en-margin: 8px 12px 0 12px;
}

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--product-info {
  line-height: normal;

  // Product Title
  h1 {
    margin: var(--h1-margin);
    text-align: start;
    flex-grow: 0;
    font-size: var(--h1-size) !important;
  }

  .s--title-en {
    color: #888;
    margin: var(--title-en-margin);
    text-align: start;
    flex-grow: 0;

    .-rate-value {
      color: #222;
    }
  }

  h1 {
    font-size: 1.4rem;
  }

  .image-gallery-root {
  }
}
</style>
