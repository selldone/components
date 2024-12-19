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
  <div class="s--product-info">
    <!-- ████████████████████ Main Product Info View  ████████████████████ -->

    <v-container fluid>
      <v-row>
        <!--  ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Product Title (Large) ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->
        <v-col v-if="!$vuetify.display.lgAndUp" cols="12">
          <h1>
            {{ $product.title }}
            <v-chip
              v-if="!has_original_warranty"
              class="mx-2"
              color="red"
              size="small"
              variant="tonal"
            >
              <v-icon start>fa:fas fa-exclamation</v-icon>
              {{ $t("product_info.fake") }}
            </v-chip>
          </h1>
        </v-col>

        <!--  ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Images ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <v-col
          v-if="showCover"
          :lg="vertical ? 12 : 6"
          class="image-gallery-root"
          cols="12"
        >
          <!-- ▁▁▁▁▁▁ 🞇 Slide Show 🞇 ▁▁▁▁▁▁ -->

          <s-shop-product-slide-show
            :current-variant="current_variant"
            :vertical="$vuetify.display.smAndUp"
          ></s-shop-product-slide-show>

          <!-- ▁▁▁▁▁▁ 🞇 Share 🞇 ▁▁▁▁▁▁ -->
          <u-button-share-group
            :title="$product.title"
            :url="ShopURLs.GetProductLink(shop, $product.id, $product.slug)"
            class="mt-3"
            small
            :description="$product.title_en"
            :media="getShopImagePath($product.icon)"
          ></u-button-share-group>
        </v-col>

        <!--  ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ Info ▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆▆ -->

        <v-col
          :lg="vertical ? 12 : 6"
          class="text-start d-flex flex-column ps-3 ps-sm-6 ps-md-16"
          cols="12"
        >
          <!--  ▃▃▃▃▃▃▃▃▃▃ Product Title En (Small) ▃▃▃▃▃▃▃▃▃▃ -->

          <div
            class="s--title-en d-flex flex-column flex-sm-row align-start align-sm-center mb-2"
          >
            <div class="d-flex align-center">
              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Type ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

              <img
                :src="getProductTypeImage($product.type)"
                :title="getProductTypeName($product.type)"
                alt="Product Type"
                class="m-1 me-2 flex-grow-0"
                height="16"
                width="16"
              />

              <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Brand ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->

              <component
                :is="!window.ExternalWidget ? 'router-link' : 'a'"
                v-if="$product.brand"
                :title="$t('product_info.brand')"
                :to="{
                  name: 'ShopPage',
                  query: { search: $product.brand },
                }"
                class="link-underlined single-line d-inline-block flex-grow-0 me-2"
                v-bind="
                  window.ExternalWidget
                    ? {
                        href: ShopURLs.GetShopPageLink(shop, {
                          search: $product.brand,
                        }),
                        target: '_blank',
                      }
                    : {}
                "
                ><b>{{ $product.brand }}</b>
              </component>
              <span
                v-if="$product.brand && $product.title_en"
                class="mx-1 d-none d-sm-inline"
                >/</span
              >
            </div>

            <div class="flex-grow-1 ps-0 ps-sm-1 py-2">
              {{ $product.title_en?.limitWords(limit_title_en) }}
            </div>

            <v-btn
              v-if="$product.title_en?.wordsCount() > 20"
              class="tnt"
              slim
              color="#444"
              variant="text"
              @click="limit_title_en = limit_title_en > 20 ? 20 : 2000"
              >{{
                limit_title_en > 20
                  ? $t("global.actions.collapse")
                  : $t("global.actions.view_all")
              }}
              <v-icon
                end
                class="t-all-400"
                :class="{ 'rotate-180': limit_title_en > 20 }"
                >expand_more
              </v-icon>
            </v-btn>

            <template v-if="$product.rate_count && $product.rate">
              <b class="mx-2 -rate-value">{{
                numeralFormat($product.rate, "0.0")
              }}</b>

              <v-rating
                v-model="$product.rate"
                active-color="yellow-darken-3"
                color="grey-darken-1"
                density="compact"
                half-increments
                readonly
                size="small"
              />
            </template>
          </div>

          <!--  ▃▃▃▃▃▃▃▃▃▃ Product Title (Large) ▃▃▃▃▃▃▃▃▃▃ -->

          <h1 v-if="$vuetify.display.lgAndUp">
            {{ $product.title }}
            <v-chip
              v-if="!has_original_warranty"
              class="mx-2"
              color="red"
              size="small"
            >
              <v-icon size="x-small" start>fa:fas fa-exclamation</v-icon>
              {{ $t("product_info.fake") }}
            </v-chip>
          </h1>

          <!-- ▁▁▁▁▁▁ 🞇 Under title buttons (Add to compare, like , ..) 🞇 ▁▁▁▁▁▁ -->
          <s-product-section-extra-buttons
            :current-variant="current_variant"
          ></s-product-section-extra-buttons>

          <!-- ▁▁▁▁▁▁ 🞇 Badges 🞇 ▁▁▁▁▁▁ -->
          <s-product-section-badges
            :vertical="vertical"
            class="mt-5"
          ></s-product-section-badges>

          <hr />

          <!-- ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ Product info ▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅▅ -->
          <v-container class="pt-0 pb-0 flex-grow-1 d-flex flex-column" fluid>
            <!-- ▁▁▁▁▁▁ 🞇 Variants 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-variants
              v-model:current-variant="current_variant"
              v-model:filter="filter"
              v-model:selection-values="selection_values"
            ></s-product-section-variants>

            <!-- ▁▁▁▁▁▁ 🞇 Service 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-service
              v-model:preferences="preferences"
            ></s-product-section-service>

            <v-spacer></v-spacer>

            <!-- ▁▁▁▁▁▁ 🞇 Valuation 🞇 ▁▁▁▁▁▁ -->

            <s-product-section-valuation
              v-if="preferences && preferences.valuation"
              :correspondingBasketItem="corresponding_basket_item"
              :current-variant="current_variant"
              :preferences="preferences"
            ></s-product-section-valuation>

            <!-- ▁▁▁▁▁▁ 🞇 🎗️ Subscription Price 🞇 ▁▁▁▁▁▁ -->
            <s-subscription-price-select
              v-if="isSubscription"
              v-model="selected_subscription_price"
              :class="{
                pen:
                  !!corresponding_basket_item?.subscription_price_id /*An item exists in the basket*/ ||
                  !!membership_subscribed_plan /* 🦄 Membership > Subscribed before*/,
              }"
              :disabled="!$product.quantity"
              :subscription-prices="subscription_prices"
              class="my-3"
              return-object
            ></s-subscription-price-select>

            <!-- ▁▁▁▁▁▁ 🞇 Price 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-price
              v-else
              :preferences="preferences"
              :selected-vendor-product="selected_vendor_product"
            ></s-product-section-price>

            <!-- ▁▁▁▁▁▁ 🞇 Tax + Shipping 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-tax></s-product-section-tax>

            <!-- ▁▁▁▁▁▁ 🞇 Cashback Program  🞇 ▁▁▁▁▁▁ -->
            <s-product-section-cashback
              :currency="GetUserSelectedCurrency()?.code"
              :amount="0"
            ></s-product-section-cashback>

            <!-- ▁▁▁▁▁▁ 🞇 Extra Pricings 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-extra-pricings
              :current-variant="current_variant"
              :preferences="preferences"
              :quantity="corresponding_basket_item?.count"
              :selected-vendor-product="selected_vendor_product"
              @select="(val) => $refs.buy_section.triggerBuyButton(val.min)"
            >
            </s-product-section-extra-pricings>

            <!-- ▁▁▁▁▁▁ 🞇 Coupon 🞇 ▁▁▁▁▁▁ -->

            <s-storefront-coupons-list
              :product-id="$product.id"
              :variant-id="current_variant ? current_variant.id : undefined"
            ></s-storefront-coupons-list>

            <!--
                  █████████████████████████████████████████████████████████████
                  ―――――――――――――――― Buy Button ―――――――――――――――
                  █████████████████████████████████████████████████████████████
                  -->

            <!-- ▁▁▁▁▁▁ 🞇 Buy Button 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-buy-button
              ref="buy_section"
              :can-buy="canBuy"
              :current-variant="current_variant"
              :hss-sticky-but-button="hssStickyButButton"
              :preferences="preferences"
              :quick-buy-mode="quickBuyMode"
              :selected-subscription-price="selected_subscription_price"
              :selected-vendor-product="selected_vendor_product"
              class="mt-3 mb-3"
            ></s-product-section-buy-button>
            <!-- ▁▁▁▁▁▁ 🞇 Embed Mode 🞇 ▁▁▁▁▁▁ -->
            <div
              v-if="embedMode"
              class="mx-2 widget-buttons mt-3 mb-3 d-flex flex-column flex-grow-0"
            >
              <v-btn
                :color="
                  shop.theme?.color_buy ? shop.theme.color_buy : '#0061e0'
                "
                :href="
                  ShopURLs.GetProductLink(shop, $product.id, $product.slug)
                "
                min-height="72"
                min-width="220"
                style="font-size: 18px"
                target="_blank"
              >
                {{ $t("global.actions.buy") }}
                <v-icon class="mx-1">open_in_new</v-icon>
              </v-btn>
            </div>

            <!-- ▁▁▁▁▁▁ 🞇 Sells & Inventory progress 🞇 ▁▁▁▁▁▁ -->
            <s-product-section-incentivise
              :variant="current_variant"
              :vendorProduct="selected_vendor_product"
            ></s-product-section-incentivise>

            <u-payment-stripe-split
              :basket="corresponding_basket_item ? basket : null"
              :country-code="basket?.receiver_info?.country"
              :preferences="preferences"
              :selected-subscription-price="selected_subscription_price"
              :selected-vendor-product="selected_vendor_product"
              :variant="current_variant"
              :vendor-product="selected_vendor_product"
              class="px-2"
            ></u-payment-stripe-split>
          </v-container>
        </v-col>
      </v-row>
    </v-container>

    <!-- ████████████████████ 🟣 Marketplace (Vendors) 🟣 ████████████████████ -->

    <v-container
      v-if="vendor_products && vendor_products.length"
      class="my-0 my-sm-5 my-md-10"
    >
      <s-smart-select-vendor
        v-model="selected_vendor_product_id"
        :hint="$t('product_info.select_a_vendor_message')"
        :label="$t('global.commons.vendors')"
        :vendorProducts="vendor_products"
        force-show-all
        @change="changeVendor"
      >
      </s-smart-select-vendor>
    </v-container>

    <!-- ████████████████████ USER MESSAGE > Physical (All now!) ████████████████████ -->

    <v-container>
      <basket-item-user-message-form
        v-if="basket"
        :basket="basket"
        :product="$product"
        :variant-id="current_variant ? current_variant.id : null"
        class="my-10"
      ></basket-item-user-message-form>
    </v-container>

    <!-- ████████████████████ Discount Countdown ████████████████████ -->

    <product-discount-countdown></product-discount-countdown>
  </div>
</template>

<script lang="ts">
import SShopProductRatingView from "../rating/SShopProductRatingView.vue";
import BasketItemUserMessageForm from "../../order/product-input/BasketItemUserMessageForm.vue";
import SStorefrontCouponsList from "../../coupon/list/SStorefrontCouponsList.vue";
import { ProductVariants } from "@selldone/core-js/enums/product/ProductVariants.ts";
import SSmartSelectVendor from "../../vendor/selector/SSmartSelectVendor.vue";

import SShopProductSlideShow from "../images/SShopProductSlideShow.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType.ts";
import SSubscriptionPriceSelect from "../../order/subscription/SSubscriptionPriceSelect.vue";
import { RibbonHelper } from "@selldone/core-js/helper/ribbon/RibbonHelper.ts";
import ProductDiscountCountdown from "../count-down/ProductDiscountCountdown.vue";
import SShopBuyButton from "../button/SShopBuyButton.vue";
import UPaymentStripeSplit from "../../../ui/payment/stripe/split/UPaymentStripeSplit.vue";
import SProductSectionService from "../section/service/SProductSectionService.vue";
import SProductSectionValuation from "../section/valuation/SProductSectionValuation.vue";
import SProductSectionExtraPricings from "../section/extra-pricing/SProductSectionExtraPricings.vue";
import SProductSectionTax from "../section/tax/SProductSectionTax.vue";
import SProductSectionBuyButton from "../section/buy-button/SProductSectionBuyButton.vue";
import SProductSectionExtraButtons from "../section/extra-buttons/SProductSectionExtraButtons.vue";
import SProductSectionPrice from "../section/price/SProductSectionPrice.vue";
import SProductSectionWaitingAuction from "../section/auction/SProductSectionWaitingAuction.vue";
import SProductSectionBadges from "../section/badges/SProductSectionBadges.vue";
import SProductSectionVariants from "../section/variants/SProductSectionVariants.vue";
import SProductSectionCashback from "@selldone/components-vue/storefront/product/section/cashback/SProductSectionCashback.vue";
import SProductSectionIncentivise from "@selldone/components-vue/storefront/product/section/incentivise/SProductSectionIncentivise.vue";
import CurrencyMixin from "@selldone/components-vue/mixin/currency/CurrencyMixin.ts";
import { Product } from "@selldone/core-js/models";
import { ShopURLs } from "@selldone/core-js";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import UButtonShareGroup from "@selldone/components-vue/ui/button/share/group/UButtonShareGroup.vue";
import UWidgetHeader from "@selldone/components-vue/ui/widget/header/UWidgetHeader.vue";

export default {
  name: "SProductOverview",
  mixins: [CurrencyMixin, ProductMixin],
  components: {
    UWidgetHeader,
    UButtonShareGroup,
    SProductSectionIncentivise,
    SProductSectionCashback,
    UPaymentStripeSplit,
    SShopBuyButton,
    ProductDiscountCountdown,
    SProductSectionTax,
    SProductSectionExtraPricings,
    SSubscriptionPriceSelect,
    SProductSectionValuation,
    SShopProductSlideShow,
    SProductSectionExtraButtons,
    SProductSectionBuyButton,
    SProductSectionWaitingAuction,
    SProductSectionPrice,
    SProductSectionBadges,
    SProductSectionVariants,
    SProductSectionService,
    SSmartSelectVendor,
    SStorefrontCouponsList,
    BasketItemUserMessageForm,
    SShopProductRatingView,
  },
  inject: ["$product"],
  props: {
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
    ShopURLs: ShopURLs,
    Product: Product,

    ProductType: ProductType,

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
      return this.getBasket(this.$product.type);
    },

    user() {
      return this.USER();
    },
    busy_user() {
      return this.$store.getters.getBusyUser;
    },

    corresponding_basket_item() {
      if (!this.basket) return null;
      return this.basket.items.find(
        (item) =>
          item.product_id === this.$product.id &&
          item.variant_id ===
            (this.current_variant ? this.current_variant.id : null),
      );
    },

    has_original_warranty() {
      return this.$product?.original;
    },

    product_variants() {
      if (!this.$product?.product_variants?.length) return [];
      return this.$product.product_variants;
    },

    AvailableProductVariants() {
      return Object.values(ProductVariants).filter((it) => {
        return this.product_variants.some((variant) => !!variant[it.code]);
      });
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄ 🟣 Marketplace 🟣 ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
    vendor_products() {
      return this.$product.vendor_products?.filter(
        (v) =>
          v.variant_id === (this.current_variant && this.current_variant.id),
      );
    },

    selected_vendor_product() {
      return (
        this.selected_vendor_product_id &&
        this.$product.vendor_products?.find(
          (v) => v.id === this.selected_vendor_product_id,
        )
      );
    },

    isService() {
      return this.$product.type === ProductType.SERVICE.code;
    },

    // ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

    // ▀▀▀▀▀▀▀▀▀ 🍁 Valuation (Pricing form) 🍁 ▀▀▀▀▀▀▀▀▀

    valuation() {
      return this.$product.valuation;
    },

    structure() {
      return this.valuation && this.valuation.structure;
    },

    // ▀▀▀▀▀▀▀▀▀▀▀▀▀▀ 🎗️ Subscription ▀▀▀▀▀▀▀▀▀▀▀▀▀▀

    isSubscription() {
      return this.$product.type === ProductType.SUBSCRIPTION.code;
    },

    subscription_prices() {
      return this.$product.subscription_prices;
    },

    // 🦄 Membership > Subscribed
    membership_subscribed_plan() {
      return RibbonHelper.isMembershipSubscribed(this.$product);
    },
  },
  watch: {
    $product() {
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

    user() {
      this.autoBuy();
    },
  },
  created() {
    this.init();
  },

  mounted() {
    //  this.assignValuesByCurrentItemInBasket();
  },
  beforeUnmount() {
    this.$store.commit("setCurrentSelectedVariant", null); // Reset
  },

  methods: {
    /**
     * Use to automatically add product to cart
     */
    autoBuy() {
      if (this.$route?.query.buy !== "true" || this.busy_user) return;

      console.log("🧺 Auto buy...");
      let variant = null;
      if (
        this.$product.product_variants.length &&
        this.$route?.query.variant_id
      ) {
        variant = this.$product.product_variants.find(
          (v) => v.id === parseInt(this.$route?.query.variant_id),
        );
      }

      if (!this.$product.product_variants.length || variant) {
        console.log("🧺 Buy now", variant);
        this.$nextTick(() => {
          this.buy(variant);
        });
      }
    },

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

      // Auto buy (Check query)
      this.autoBuy();
    },

    assignValuesByCurrentItemInBasket() {
      const item = this.corresponding_basket_item;
      // console.log("Find item in cart!",item);
      if (item) this.preferences = item.preferences;

      if (!this.preferences) this.preferences = {};

      // ▀▀▀▀▀▀▀▀▀ 🍁 Valuation (Pricing form) 🍁 ▀▀▀▀▀▀▀▀▀
      if (this.$product.price_input === "custom") {
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

        //this.$forceUpdate();
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
        this.basket.items.find((item) => item.product_id === this.$product.id);
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
          this.$refs.buy_section.triggerBuyButton(found.count);
        });
      }
    },

    assignVendor() {
      let found = this.corresponding_basket_item;
      this.selected_vendor_product_id = found ? found.vendor_product_id : null;

      // Try assign first vendor:
      if (
        !this.selected_vendor_product_id &&
        this.vendor_products &&
        this.vendor_products.length
      ) {
        this.selected_vendor_product_id = this.vendor_products[0].id;
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
  --hr-color: #efefef;
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
    color: #444;
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
