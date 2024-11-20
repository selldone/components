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
  <component
    :is="to ? 'router-link' : href ? 'a' : 'div'"
    :class="{
      '-small-mode': smallMode,
      'no-hover': isInsta,
      '-insta-mode': isInsta,
      '-static': static,
      '-rtl': $vuetify.locale.isRtl,
    }"
    class="s--product-card"
    v-bind="to ? { to: to } : { href: href }"
    :draggable="false"
  >
    <div
      v-if="!isRow"
      :class="{
        'overflow-visible': hasDiscountCountDown,
        'rounded-18px': rounded,
      }"
      class="card card--1 m-0 text-center"
    >
      <div class="overflow-hidden position-relative card-wrap">
        <div class="card__info-hover">
          <div class="card__clock-info float-start">
            <img
              :src="getProductTypeImage(product.type)"
              width="20"
              :alt="product.type"
            />
          </div>
        </div>

        <div
          v-if="!product.original"
          :class="{ 'is-small': isSmall }"
          class="card__copy-product-badge"
        >
          <p>
            <i class="fas fa-exclamation pe-2 float-start" />
            {{ $t("product_card.not_original") }}
          </p>
        </div>

        <div class="card__img"></div>

        <v-img
          :alt="
            product.title + (product.title_en ? ` | ${product.title_en}` : '')
          "
          :class="{ contain: is_image_contain }"
          :cover="!is_image_contain"
          :src="product_image"
          class="card__img--hover"
        >
          <slot name="dynamic-background-layout"></slot>
          <template v-slot:placeholder>
            <v-row align="center" class="fill-height ma-0" justify="center">
              <v-progress-circular
                color="grey-lighten-1"
                indeterminate
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>

        <!-- ============== Color Rating in Small mode ================ -->
        <div v-if="isSmall" class="colors-rating-small-mode">
          <v-chip
            v-if="product.rate_count"
            class="mx-2 mb-2"
            color="#fafafa"
            style="backdrop-filter: blur(4px)"
          >
            <v-rating
              :model-value="product.rate"
              :size="isSmall ? 'x-small' : 'small'"
              active-color="yellow-darken-3"
              class="me-1"
              color="grey-darken-1"
              density="compact"
              half-increments
              readonly
            />
            <b>{{ Number(product.rate).toFixed(1) }}</b>
          </v-chip>
          <div v-if="colors && colors.length" class="p-1">
            <u-color-circle
              v-for="color in colors.slice(0, 5)"
              :key="color"
              :color="color"
              :size="14"
              class="me-1"
            >
            </u-color-circle>
            <v-icon v-if="colors.length > 5" class="me-1">more_horiz</v-icon>
          </div>
        </div>
        <!-- ============== Extra info on hover ================ -->

        <div
          v-if="
            !window.ExternalWidget &&
            (!isInsta || $vuetify.display.lgAndUp) &&
            quickBuy &&
            (product.quantity || isFile)
          "
          class="quick-buy"
        >
          <v-btn
            :size="
              $vuetify.display.mdAndUp && !isInsta
                ? 'large'
                : isInsta
                  ? 'small'
                  : undefined
            "
            color="primary"
            tile
            variant="elevated"
            width="100%"
            @click.prevent="$emit('quick-buy')"
          >
            <v-icon size="small">shopping_basket</v-icon>
            <span v-if="!isInsta" class="ms-1">
              {{ $t("global.actions.quick_buy") }}</span
            >
          </v-btn>
          <v-btn
            :size="
              $vuetify.display.mdAndUp && !isInsta
                ? 'large'
                : isInsta
                  ? 'small'
                  : undefined
            "
            :title="$t('global.commons.compare')"
            block
            color="primary"
            tile
            variant="text"
            @click.prevent="
              existInComparisonList
                ? removeFromProductComparison(product, null)
                : addToProductComparison(product, null, true)
            "
          >
            <v-icon
              v-if="existInComparisonList"
              class="blink-me"
              color="success"
              size="small"
              >lens
            </v-icon>
            <v-icon v-else size="small">data_saver_on</v-icon>
          </v-btn>
        </div>

        <div
          :class="{
            no_variants: !hasVariant || (isInsta && $vuetify.display.xs),
          }"
          class="card__info"
          style="z-index: 2"
        >
          <product-variants-view
            v-if="hasVariant && !(isInsta && $vuetify.display.xs)"
            v-model:selected-variant="current_variant"
            :limit="isInsta ? 3 : 5"
            :variants="product.variants"
            center
            class="toggle-visible-on-hover"
            hoverable
            :small="isInsta || smallMode || dense"
            :single-line="isInsta"
            :hide-icon="isInsta"
            :force-ultra-dense="isInsta"
          />

          <v-row class="toggle-hidden-on-hover" no-gutters>
            <v-col
              :class="{ small: isInsta || isSmall, 'my-1 ': !isInsta }"
              class="text-start pt-1 lhn"
              cols="12"
            >
              <div
                class="font-weight-bold"
                :class="{ 'single-line': !wrap_title }"
              >
                {{ product.title }}
              </div>
            </v-col>

            <v-col
              v-if="!isSmall"
              align-center
              class="small p-0 sec--rate-variants"
              cols="5"
              justify-center
            >
              <div v-if="product.rate_count">
                <v-rating
                  :model-value="product.rate"
                  active-color="yellow-darken-3"
                  color="grey-darken-1"
                  density="compact"
                  half-increments
                  readonly
                  size="small"
                />
              </div>

              <div v-if="product.rate_count" class="single-line">
                <b :class="{ '-zero-font': dense }" class="me-1">{{
                  Number(product.rate).toFixed(1)
                }}</b>
                <small>
                  ● {{ numeralFormat(product.rate_count, "0,0") }}
                  {{ $t("product_card.review_unit") }}
                </small>
              </div>

              <div
                v-if="colors && colors.length"
                class="p-1 overflow-hidden single-line"
              >
                <u-color-circle
                  v-for="color in colors.slice(0, 5)"
                  :key="color"
                  :color="color"
                  :size="14"
                  class="me-1"
                >
                </u-color-circle>
                <v-icon v-if="colors.length > 5" class="me-1"
                  >more_horiz
                </v-icon>
              </div>
            </v-col>

            <v-col
              v-if="product.quantity || isFile"
              :cols="isSmall ? 12 : 7"
              align-center
              class="small p-0 sec--price"
              justify-center
            >
              <div :class="{ 'text-center': isSmall }" class="main-price-label">
                <p class="dis-val d-flex align-center single-line">
                  <v-spacer></v-spacer>

                  <u-price
                    v-if="discount > 0 && !isInsta"
                    :amount="price_in_selected_currency + discount"
                    :class="{ small: dense }"
                    class="discount-price text-muted me-2"
                    line-through
                  ></u-price>

                  <span
                    v-if="discount > 0"
                    :class="{ small: dense || isInsta }"
                    class="discount-percent"
                    >{{ discount_percent }} %
                  </span>
                </p>
                <p :class="{ 'mt-2': !isInsta, 'mt-1': isInsta }" class="">
                  <!-- Main price -->
                  <!-- Price > ⛔ Invalid exchange rate -->
                  <u-price-invalid
                    v-if="isNaN(price_in_selected_currency)"
                    :currency="product.currency"
                    small
                  >
                  </u-price-invalid>

                  <u-price
                    v-else
                    :amount="price_in_selected_currency"
                    :medium="!dense && !isInsta && !isSmall"
                    class="-price-value"
                  ></u-price>

                  <!-- Price label -->
                  <span v-if="product.price_label" class="mx-1 price-label">{{
                    product.price_label
                  }}</span>

                  <!-- Coupon -->
                  <span v-if="hasCoupon && !isSmall && !isInsta">
                    <v-icon class="mx-1" color="#D32F2F" size="x-small"
                      >fa:fas fa-plus</v-icon
                    >
                    <img
                      height="24"
                      src="../../../assets/icons/coupon.svg"
                      alt="Coupon"
                    />
                  </span>
                </p>
              </div>
            </v-col>
            <v-col v-else :cols="7" class="sec--price">
              <template v-if="!isInsta">
                <h5 class="mt-1 mb-0">
                  {{ $t("product_card.sold_out") }}
                </h5>
                <img
                  :src="require('../../../assets/icons/sold.svg')"
                  :width="'36px'"
                  alt="Sold out"
                />
              </template>

              <img
                v-else
                :src="require('../../../assets/icons/sold.svg')"
                class="float-end"
                width="20px"
                alt="Sold out"
              />
            </v-col>
          </v-row>
        </div>

        <!--
           <v-btn outlined icon :color="liked?'red':'#eee'" style="position: absolute;bottom: 86px;left: 16px" @click.prevent="starArticle">
             <v-icon>favorite</v-icon>
           </v-btn>
           -->

        <span v-if="hasOffer" class="offer-top-end" role="img"
          ><img src="../../../assets/icons/gift-w.svg" alt="Especial Offer" />
          <span>{{ $t("global.commons.offer") }}</span></span
        >
      </div>
      <!--  -------- Discount countdown ---------- -->
      <img
        v-if="hasDiscountCountDown"
        class="count-down-bg fadeIn delay_400"
        alt="Countdown"
        src="../../../assets/icons/countdown-badge.svg"
      />

      <div
        v-if="hasDiscountCountDown"
        class="count-down-container fadeIn delay_400"
      >
        <u-count-down v-if="endOfDiscountDate" :end="endOfDiscountDate" />
        <p v-else class="discount-not-end">
          {{ $t("product_info.action") }}
        </p>
      </div>
    </div>

    <!-- ========================== Row ======================== -->

    <div v-else class="row-box position-relative overflow-visible row-hover">
      <v-container class="overflow-hidden position-relative" fluid>
        <v-row dense style="flex-wrap: nowrap">
          <v-img
            :alt="
              product.title + (product.title_en ? ` | ${product.title_en}` : '')
            "
            :height="$vuetify.display.smAndDown ? 64 : 84"
            :src="product_image"
            :width="$vuetify.display.smAndDown ? 64 : 84"
            class="flex-grow-0 rounded me-0 me-sm-2"
            cover
          >
          </v-img>

          <div class="text-start px-2 flex-grow-1">
            <p class="mb-1 flex-grow-1 row-pro-title">{{ product.title }}</p>

            <div class="single-line py-1">
              <v-chip
                v-if="product.rate_count"
                class="me-2"
                color="#fafafa"
                variant="flat"
                size="x-small"
              >
                <v-rating
                  :model-value="product.rate"
                  active-color="yellow-darken-3"
                  color="grey-darken-1"
                  density="compact"
                  half-increments
                  readonly
                  size="x-small"
                  class="me-1"
                />
                {{ Number(product.rate).toFixed(1) }}
              </v-chip>

              <span v-if="product.rate_count" class="text-black small"
                ><b class="me-2">{{
                  numeralFormat(product.rate_count, "0,0")
                }}</b>

                <small>{{ $t("product_card.review_unit") }}</small>
              </span>
            </div>

            <product-variants-view
              v-if="hasVariant"
              v-model:selected-variant="current_variant"
              :limit="5"
              :variants="product.variants"
              class="pa-0"
              dense
              hoverable
              small
            />
          </div>

          <div
            :class="{ small: $vuetify.display.smAndDown }"
            class="text-end align-self-center"
            style="flex-basis: 110px"
          >
            <div v-if="product.quantity || isFile" class="main-price-label p-0">
              <p v-if="discount > 0">
                <u-price
                  :amount="price_in_selected_currency + discount"
                  class="discount-price text-muted"
                  line-through
                ></u-price>
              </p>

              <p class="my-1">
                <!-- Coupon -->

                <img
                  v-if="hasCoupon"
                  height="24"
                  alt="Coupon"
                  src="../../../assets/icons/coupon.svg"
                  title="Has extra coupon!"
                />
                <v-icon
                  v-if="hasCoupon"
                  class="mx-1"
                  color="#D32F2F"
                  size="x-small"
                  >add
                </v-icon>
                <!-- Price label -->
                <span v-if="product.price_label" class="mx-1 price-label">{{
                  product.price_label
                }}</span>

                <!-- Main price  -->
                <u-price :amount="price_in_selected_currency"></u-price>
              </p>
            </div>

            <div v-else class="text-center" style="min-width: 80px">
              <h5 class="mt-2 mb-0">
                {{ $t("product_card.sold_out") }}
              </h5>
              <img
                :src="require('../../../assets/icons/sold.svg')"
                alt="Sold out"
                width="36px"
              />
            </div>

            <v-btn
              v-if="quickBuy && (product.quantity || isFile)"
              :size="$vuetify.display.mdAndUp ? 'small' : 'x-small'"
              min-height="36"
              class="align-self-center flex-grow-0 ms-2 tnt mt-1"
              color="#000"
              rounded
              variant="elevated"
              @click.prevent="$emit('quick-buy')"
            >
              <v-icon start>shopping_basket</v-icon>

              {{ $t("global.actions.quick_buy") }}
            </v-btn>
          </div>
        </v-row>

        <span v-if="hasOffer" class="offer-top-end" role="img"
          ><img src="../../../assets/icons/gift-w.svg" alt="Especial Offer" />
          <span>{{ $t("global.commons.offer") }}</span></span
        >
      </v-container>

      <!--  -------- Discount countdown ---------- -->
      <img
        v-if="hasDiscountCountDown"
        class="count-down-bg fadeIn delay_400"
        src="../../../assets/icons/countdown-badge.svg"
        alt="Countdown"
      />

      <div
        v-if="hasDiscountCountDown"
        class="count-down-container fadeIn delay_400"
      >
        <u-count-down v-if="endOfDiscountDate" :end="endOfDiscountDate" />
        <p v-else class="discount-not-end">
          {{ $t("product_info.action") }}
        </p>
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import ProductVariantsView from "../variant/ProductVariantsView.vue";
import UPrice from "../../../ui/price/UPrice.vue";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import UColorCircle from "../../../ui/color/circle/UColorCircle.vue";
import UCountDown from "../../../ui/count-down/UCountDown.vue";
import { PriceHelper } from "@selldone/core-js";
import UCurrencyIcon from "@selldone/components-vue/ui/currency/icon/UCurrencyIcon.vue";
import UPriceInvalid from "@selldone/components-vue/ui/price/invalid/UPriceInvalid.vue";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "SShopProductCard",
  mixins: [ProductMixin],

  components: {
    UPriceInvalid,
    UCurrencyIcon,
    UCountDown,
    UColorCircle,
    UPrice,
    ProductVariantsView,
  },
  inject: ["$shop"],
  props: {
    product: {
      required: true,
      type: Object,
    },
    to: {
      required: false,
      type: Object,
    },
    href: {},

    isSmall: {
      required: false,
      type: Boolean,
      default: false,
    },
    isRow: {
      required: false,
      type: Boolean,
      default: false,
    },
    dense: {
      // In the filter side menu opening
      type: Boolean,
      default: false,
    },
    smallMode: {
      default: false,
      type: Boolean,
    },
    quickBuy: {
      default: false,
      type: Boolean,
    },

    isInsta: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },

    static: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      ProductType: ProductType,

      rating_test: 4.5,
      rnd: null,
      current_variant: null,
    };
  },

  computed: {
    isFile() {
      return this.product.type === ProductType.FILE.code;
    },
    //----------------------------------------
    hasDiscountCountDown() {
      return PriceHelper.HasDiscountCountDownMode(this.product, null);
    },

    endOfDiscountDate() {
      return PriceHelper.GetEndOfDiscountDate(this.product, null);
    },
    //----------------------------------------

    hasCoupon() {
      try {
        return this.hasCouponThisProducts(this.product.id, null);
      } catch (e) {
        return false;
      }
    },

    hasOffer() {
      try {
        return this.hasOfferThisProduct(this.product.id, null);
      } catch (e) {
        return false;
      }
    },
    /*
            liked(){
                return this.product.like
            },*/
    colors() {
      if (!this.product.variants) return null;
      return this.getItemsInArray(this.product.variants, "color");
    },

    hasVariant() {
      return this.product.variants && this.product.variants.length;
    },
    product_style() {
      return this.product?.style;
    },

    is_image_contain() {
      const r = this.rnd;
      return this.product_style?.contain;
    },

    price_in_selected_currency() {
      if (!this.product) return 0;

      try {
        return this.CalcPriceProductCurrentCurrency(
          this.getShop(),
          this.product,
          null,
        );
      } catch (e) {
        return "🚨";
      }
    },

    discount_percent() {
      try {
        return this.discountProductPercent(this.getShop(), this.product, null);
      } catch (e) {
        return "🚨";
      }
    },

    discount() {
      try {
        return this.getProductDiscountAmount(
          this.getShop(),
          this.product,
          null,
        );
      } catch (e) {
        return "🚨";
      }
    },

    existInComparisonList() {
      let list = this.$store.getters.getProductsComparison;
      if (!list) return false;
      return list.some((item) => item.id === this.product.id);
    },

    product_image() {
      return this.getShopImagePath(
        this.current_variant?.image
          ? this.current_variant.image
          : this.product.icon,
      );
    },

    wrap_title() {
      return this.$shop?.theme?.wrap_title;
    },
  },

  watch: {},

  created() {},

  mounted() {},
  methods: {
    getItemsInArray(array, item_name) {
      let out = [];
      array.forEach((item) => {
        if (item[item_name] && !out.includes(item[item_name]))
          out.push(item[item_name]);
      });
      return out;
    },

    //――――――――――――――――――――――― External update functions ―――――――――――――――――――――――
    extRefreshStyle() {
      this.rnd = Math.random();
    },
  },
};
</script>

<style lang="scss" scoped>
.s--product-card {
  --card-height: 360px;
  --footer-height: 80px;

  --header-size: 60px;

  --image-height: 360px;

  --image-center-height-contain: 220px;

  $delay_reverse: 0.7s;
  $max_width_to_delay_reverse: 1200px;

  &.-small-mode {
    --card-height: 180px;
    --footer-height: 60px;

    --header-size: 30px;

    --image-height: 140px;

    --image-center-height-contain: 110px;
  }

  cursor: pointer;
  position: relative;
  line-height: 1em;

  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;

  // Fix Flickering in Safari in Safari: (Apple bug)
  -webkit-transform: translateZ(0);
  -webkit-backface-visibility: hidden;

  &:hover {
    -webkit-transform: unset; // Make sure card be on top!
  }

  // Disable hover effects on touch devices
  @media (hover: none) {
    &:hover {
      transform: none;
      box-shadow: none;

      .card__info,
      .card__img--hover,
      .card:hover {
        transform: none !important;
        transition: none !important;
      }

      .toggle-visible-on-hover {
        opacity: 1 !important;
        transition: none;
      }

      .toggle-hidden-on-hover {
        opacity: 1 !important;
      }
    }
  }


  p {
    font-size: 0.95em;
    line-height: 1.2em;
    max-height: 3.6em;
    overflow: hidden;
    word-wrap: break-word;
    text-overflow: ellipsis;
    display: block; /* or inline-block */
  }

  @media only screen and (max-width: 600px) {
    padding: 4px; //!important;
  }

  @media (max-width: 800px) {
    p {
      font-size: 0.85em;
      line-height: 1.2em;
      max-height: 3.6em;
      overflow: hidden;
      word-wrap: break-word;
      text-overflow: ellipsis;
      display: block; /* or inline-block */
    }
    .date {
      font-size: 0.6em;
    }
  }

  .main-price-label {
    font-size: 1.4em;
    color: #000;
    //   background: #fff;
    font-weight: 500;
    z-index: 1;
    //text-align: end;
    border-radius: 8px;
    padding: 8px;
    text-align: right !important;

    p {
      line-height: 1em !important;
      overflow: visible;
      max-height: unset;
      margin: 0;
      min-height: 21px;
    }

    .discount-price {
      color: #444;
      font-size: 0.7em;
    }
  }

  .flow-top-label {
    font-size: 1em;

    color: #000;
    background: #fff;
    font-weight: 500;

    z-index: 1;
    text-align: center;
    position: absolute;
    left: 12px;
    top: 64px;
    border-radius: 8px;
    padding: 8px;

    transition: all 0.4s ease-in-out;

    p {
      line-height: 1em !important;
      overflow: visible;
      max-height: unset;
      margin: 0;
    }
  }

  .date {
    //  transition: transform 0.4s ease-in-out;
    color: #444;
    //transform:translateY(-100%);
    font-size: 0.8em;
    width: auto;
    margin-left: auto;
    text-align: start;
  }

  .card__like {
    width: 18px;
  }

  .card__clock {
    width: 15px;
    vertical-align: middle;
    fill: white;
  }

  .card__time {
    font-size: 12px;
    color: white;
    vertical-align: middle;
    margin-left: 5px;
  }

  .card__clock-info {
    z-index: 1;
    transition: 0.2s transform ease-out;
    transform: translateY(-50px);
    transition-delay: 0.15s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: 0.15s + $delay_reverse;
    }

    //   float: right;
    // background-image: linear-gradient(to bottom right, #00796b, #0097a7);
    border-radius: 4px;
    padding: 3px;
  }

  .card__copy-product-badge {
    z-index: 2;
    transition: 0.2s transform ease-out;
    transform: translateX(80%);
    transition-delay: 0.15s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: 0.15s + $delay_reverse;
    }

    position: absolute;
    top: 0;
    right: 0;
    background-image: linear-gradient(to bottom right, #79040f, #a72a1d);
    border-radius: 0 0 0 12px;
    padding: 8px;
    color: white;

    &.is-small {
      font-size: 0.9rem;
    }

    p {
      margin: 0;
      overflow: visible;
    }
  }

  .card__img {
    visibility: hidden;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: var(--image-height);
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }

  .card__info-hover {
    transition: transform 0.4s ease-in-out;
    transition-delay: 0s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: $delay_reverse;
    }
    position: absolute;
    padding: 16px;
    width: 100%;
    opacity: 0;
    top: 0;
    z-index: 1;
  }

  .card__img--hover {
    transition: 0.2s all ease-out;
    transition-delay: 0s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: $delay_reverse;
    }
    background-size: cover; //cover   contain
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    position: absolute;
    //height: $image_center_height;
    // border-top-left-radius: 12px;
    //  border-top-right-radius: 12px;
    top: 0;
    height: calc(
      var(--image-center-height-contain) + var(--header-size) +
        var(--footer-height)
    );

    &.contain {
      background-size: contain;
      height: var(--image-center-height-contain);
      top: var(--header-size);
    }

    ::v-deep(.v-img__image) {
      // Force to show image on top of the dynamic background layout
      z-index: 1;
    }
  }

  .card {
    z-index: 1; //important!
    height: var(--card-height);

    transition: all 0.4s cubic-bezier(0.175, 0.885, 0, 1);
    transition-delay: 0s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: $delay_reverse;
    }
    background-color: #fff;
    width: 100%;
    position: relative;
    // border-radius: 12px;
    border-radius: 0;

    border: 1px solid rgba(0, 0, 0, 0.07);

    overflow: hidden;
    //box-shadow: 0px 13px 10px -7px rgba(0, 0, 0, 0.1);
    box-shadow: unset;
  }

  .card:hover {
    transition-delay: 0s;
    box-shadow: 0px 30px 18px -8px rgba(0, 0, 0, 0.1);
    z-index: 100;

    transform: scale(1.15, 1.15);

    @media (max-width: 1902px) {
      transform: scale(1.1, 1.1);
    }

    @media (max-width: 800px) {
      transform: scale(1.05, 1.05);
    }

    .colors-rating-small-mode {
      transform: translateY(26px);
      opacity: 0;
    }
  }

  .card__info {
    position: absolute;
    color: #333333;
    bottom: 0;
    left: 0;
    right: 0;
    height: max-content;
    min-height: var(--footer-height);
    backdrop-filter: blur(4px);
    background-color: rgba(255, 255, 255, 0.9);

    border-radius: 0px;
    display: flex;
    align-items: center;
    justify-content: center;

    transition:
      transform 0.4s ease-in-out,
      background-color 0.45s ease-in-out,
      backdrop-filter 0s step-start,
      border-radius 0.1s linear; // Flicker animation border-radius problem!!!

    transition-delay: 0.25s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: 0.25s + $delay_reverse;
    }
    z-index: 0;

    //  border-bottom-left-radius: 12px;
    //  border-bottom-right-radius: 12px;
    padding: 0px 8px 0px 8px;

    //  margin-bottom: 6px;
    margin-bottom: 0px;

    overflow: hidden;

    @media (max-width: 800px) {
      min-height: var(--footer-height);
    }
  }

  .card__category {
    text-transform: uppercase;
    font-size: 13px;
    letter-spacing: 2px;
    font-weight: 500;
    color: #868686;
  }

  .card__title {
    margin-top: 5px;
    margin-bottom: 10px;
  }

  .card__by {
    font-size: 12px;
    font-weight: 500;
  }

  .card__author {
    font-weight: 600;
    text-decoration: none;
    color: #ad7d52;
  }

  .card:hover .card__img--hover {
    transition-delay: 0s;

    height: 100%;
    top: 0;
    opacity: 1;
  }

  .card:hover {
    .card__info {
      backdrop-filter: none;
      border-radius: 16px;
      //  transform: scale(0.75, 0.75);
      background-color: rgba(255, 255, 255, 0.94);

      transform: scale(0.9, 0.9) translateY(-4px);

      &.no_variants {
        background: unset !important;
      }

      &:hover {
        transform: scale(0.96, 0.96);
      }
    }

    .card-wrap {
      border-radius: 12px;
    }
  }

  // Flicker animation border-radius problem!!!
  /*@keyframes fontbulger {
      from  {
        border-radius: 0px;
      }

      to {
        border-radius: 16px;
      }
    }*/

  .toggle-visible-on-hover {
    transition: all 0.4s ease-in-out;
    opacity: 0;
    position: absolute;
    width: 100%;
    z-index: 1; // enable hove variant items
  }

  .toggle-hidden-on-hover {
    transition: all 0.4s ease-in-out;
    transition-delay: 0.2s;
    opacity: 1;
    position: relative;
    width: 100%;
  }

  .card:hover {
    border-radius: 12px;

    .card__info-hover {
      transition-delay: 0s;
      opacity: 1;
    }

    .offer-top-end {
      transform: translate(90%, -90%);
    }

    .top-title {
      transition-delay: 0s;
      transform: translateY(-100%);
    }

    .flow-top-label {
      // font-size: 0.8em;
      transform: scale(0.7, 0.7);

      top: 8px;
      left: -10px;
    }

    .date {
    }

    .card__clock-info {
      transition-delay: 0.2s;
      transform: translateY(0px);
    }

    .card__copy-product-badge {
      transition-delay: 0.2s;
      transform: translateX(0px);
    }

    .toggle-visible-on-hover {
      transition-delay: 0.35s;
      opacity: 1;
    }

    .quick-buy {
      visibility: visible;
      opacity: 1;
    }

    .toggle-hidden-on-hover {
      opacity: 0;
    }
  }

  .top-title {
    color: #333;
    background: rgba(255, 255, 255, 0.97);

    transition: transform 0.4s ease-in-out;
    transition-delay: $delay_reverse;

    position: absolute;
    top: 0;
    width: 100%;
    //  height: $header_size;
    height: auto;
    // z-index: 10;

    h3 {
      font-size: 1.4em;
      //height: 2.8em;
      height: auto;
      margin: 8px 8px;
      line-height: 1.6em;
    }

    .bar-gradient {
      position: absolute;
      border-radius: 1px;
      bottom: 0;
      width: 100%;
      height: 3px;
      background: linear-gradient(to right bottom, #512da8, #9c27b0, #d32f2f);
    }
  }

  .card-new-title {
    text-align: start;
    font-size: 1.05rem !important;
    line-height: 1.1em;
    word-wrap: break-word;
    //padding: 0;
    padding-left: 8px;
    padding-right: 8px;

    display: block; /* or inline-block */
    text-overflow: ellipsis;
    overflow: hidden;
    min-height: 2em;
    -webkit-box-orient: vertical;
    font-weight: 400;

    &.is-small {
      font-size: 0.95rem !important;
      font-weight: 500;
    }
  }
}

.card-badge-info {
  color: slategrey;
  user-select: none;
  padding: 0 3px;
  font-weight: 600;
  font-size: 0.8em;
}

.discount-percent {
  font-size: 0.65em;
  font-weight: 500;
  background-color: #00796b;
  color: white;
  border-radius: 19px;
  padding: 2px 8px;

  &.small {
    font-size: 0.55em;
    padding: 2px 5px;
  }
}

.row-box {
  border: #f8f8f8 solid 1px;
  border-left: none;
  border-right: none;
  font-size: 0.9rem;
  overflow: hidden;

  p {
    color: #333 !important;
  }

  &:hover {
    .offer-top-end {
      transform: translate(90%, -90%);
    }
  }

  .offer-top-end {
    width: 36px;
    height: 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: 7px;

    img {
      width: 13px;
      height: 13px;
      margin: 0 auto;
    }

    span {
      font-size: 6px !important;
      margin: 0;
    }
  }
}

.colors-rating-small-mode {
  position: absolute;
  bottom: 96px;
  width: 90%;
  left: 5%;
  transition: all 0.3s;
}

.quick-buy {
  transition: all 0.3s;
  position: absolute;
  bottom: var(--footer-height);
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  visibility: hidden;
  opacity: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.91);
  border-radius: 24px;
  overflow: hidden;
  border: solid thin #ddd;
}

.row-pro-title {
  font-size: 1rem !important;
  line-height: 1.7em;
  font-weight: 500;

  @media only screen and (max-width: 600px) {
    font-size: 0.9rem !important;
    line-height: 1.5em;
  }
}

.offer-top-end {
  position: absolute;
  transition: all 0.45s;
  top: 0;
  right: 0;
  width: 72px;
  height: 72px;
  background-color: rgba(var(--offer-bg-color), 0.93);
  box-shadow: 0px 5px 5px 0px rgba(var(--offer-bg-color), 0.1);
  color: #fff;
  z-index: 2;
  border-bottom-left-radius: 72px;
  text-align: center;
  padding-left: 12px;
  backdrop-filter: blur(4px);

  img {
    display: block;
    margin: 3px auto;
    width: 24px;
    height: 24px;
  }

  span {
    font-size: 10px;
    font-weight: 500;
  }
}

.s--product-card {
  &.-rtl {
    .offer-top-end {
      right: unset;
      left: 0;
      border-bottom-left-radius: unset;
      border-bottom-right-radius: 72px;
      padding-left: unset;
      padding-right: 12px;
    }

    .s--product-card {
      .card:hover {
        &:hover {
          .offer-top-end {
            transform: translate(-90%, -90%);
          }
        }
      }

      .main-price-label {
        text-align: left !important;
      }
    }

    .row-box {
      &:hover {
        .offer-top-end {
          transform: translate(-90%, -90%);
        }
      }
    }

    .s--product-card {
      .card__copy-product-badge {
        left: 0;
        right: unset;
        transform: translateX(-80%);
        border-radius: 0 0 12px 0;
      }
    }

    .top-title {
      &.has-discount-banner {
        padding-left: unset;
        padding-right: 56px;
      }
    }

    .count-down-bg {
      right: -4px;
      left: unset;
      // -webkit-transform: unset;
      transform: unset;

      /*   @media only screen and (max-width: 1750px) {
        right: -1px;
        left: unset;
      }*/
    }

    .count-down-container {
      top: -15px;
      right: -65px;
      left: unset;

      transform: scale(0.5, 0.5) rotate(42deg) translate(24%, -30%);
    }
  }

  // End: &.-rtl
}

.top-title {
  &.has-discount-banner {
    padding-left: 56px;
  }
}

.count-down-bg {
  position: absolute;
  top: -5px;
  left: -4px;
  z-index: 3;
  width: 100px;
  pointer-events: none;

  transform: scaleX(-1);

  /*@media only screen and (max-width: 1750px) {
    left: -1px;
  }*/
}

.count-down-container {
  pointer-events: none;
  position: absolute;

  user-select: none;
  top: -15px;
  left: -65px;

  z-index: 4;
  padding: 6px;
  color: #fff;

  transform: scale(0.5, 0.5) rotate(-42deg) translate(-24%, -30%);

  //  background: rgba(194, 24, 91, 0.8);
  transform-origin: center;
  width: 250px;

  ul {
    padding: 0;
  }

  .discount-not-end {
    font-weight: 500;
    font-size: 1.2rem;
  }
}

.price-label {
  font-size: 12px;
  color: #000;
}

.-insta-mode {
  .card__info {
    background-color: #fff !important;
    backdrop-filter: unset !important;

    position: absolute;
    bottom: 0;
    width: 100%;
    height: max-content !important;
    padding: 2px 4px !important;
    margin: 0;
    border-radius: 0px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    @media (max-width: 450px) {
      font-size: 0.7rem;
    }

    .toggle-visible-on-hover {
      width: auto !important;
      margin: 0 2px !important;
    }

    .sec--rate-variants {
      display: none;
    }

    .sec--price {
      flex-grow: 1;
      max-width: 100%;

      .main-price-label {
        font-size: 1rem;
        margin: 1px !important;
        padding: 2px;
        display: flex !important;
        justify-content: space-between;

        p {
          min-height: 0 !important;
        }

        /* .mt-2 {
           margin: 0 !important;
         }*/

        .u--price.large {
          font-size: 1rem !important;
        }
      }
    }
  }

  .price-label {
    font-size: 10px;
    color: #000;
    display: block;
    text-align: end;
    margin: 0 !important;
  }

  .offer-top-end {
    width: 36px;
    height: 36px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-left: 7px;

    img {
      width: 13px;
      height: 13px;
      margin: 0 auto;
    }

    span {
      font-size: 6px !important;
      margin: 0;
    }
  }
}

.s--product-card.-static {
  .card:hover {
    transition: unset !important;
  }
}
</style>
