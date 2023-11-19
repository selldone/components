<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <component
    :is="to ? 'router-link' : href ? 'a' : 'div'"
    v-bind="to ? { to: to } : { href: href }"
    class="card-item-new card-link pointer-pointer s--product-card"
    :class="{
      '-small-mode': smallMode,
      'no-hover': isInsta,
      '-insta-mode': isInsta,
      '-static': static,
    }"
  >
    <div
      v-if="!isRow"
      class="card card--1 m-0 text-center"
      :class="{
        'overflow-visible': hasDiscountCountDown,
        'rounded-18px': rounded,
      }"
      @click="$emit('click')"
    >
      <div class="overflow-hidden position-relative card-wrap">
        <div class="card__info-hover">
          <div class="card__clock-info float-start">
            <img :src="getProductTypeImage(product.type)" width="20" />
          </div>
        </div>

        <div
          v-if="!product.original"
          class="card__copy-product-badge"
          :class="{ 'is-small': isSmall }"
        >
          <p>
            <i class="fas fa-exclamation pe-2 float-start" />
            {{ $t("product_card.not_original") }}
          </p>
        </div>

        <div class="card__img"></div>

        <v-img
          class="card__img--hover"
          :contain="is_image_contain"
          :class="{ contain: is_image_contain }"
          :src="product_image"
          :alt="
            product.title + (product.title_en ? ` | ${product.title_en}` : '')
          "
        >
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular
                indeterminate
                color="grey lighten-1"
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>

        <div
          class="top-title flex-column"
          :class="{ 'has-discount-banner': hasDiscountCountDown }"
        >
          <h3 class="card-new-title" :class="{ 'is-small': isSmall }">
            {{ product.title?.limitWords(12) }}
          </h3>

          <div v-if="false" class="bar-gradient" />
        </div>

        <!-- ============== Color Rating in Small mode ================ -->
        <div v-if="isSmall" class="colors-rating-small-mode">
          <v-chip v-if="product.rate_count" color="#fafafa" class="mx-2">
            <v-rating
              :value="product.rate"
              color="yellow darken-3"
              background-color="grey darken-1"
              empty-icon="$vuetify.icons.ratingFull"
              half-increments
              small
              readonly
              dense
              :x-small="isSmall"
              class="me-1"
            />
            <b>{{ Number(product.rate).toFixed(1) }}</b>
          </v-chip>
          <div v-if="colors && colors.length" class="p-1">
            <color-circle
              v-for="color in colors.slice(0, 5)"
              :key="color"
              :color="color"
              class="mr-1"
              :size="14"
            >
            </color-circle>
            <v-icon v-if="colors.length > 5" class="mr-1">more_horiz</v-icon>
          </div>
        </div>
        <!-- ============== Extra info on hover ================ -->

        <div
          v-if="
            !window.ExternalWidget &&
            (!isInsta || $vuetify.breakpoint.lgAndUp) &&
            quickBuy &&
            (product.quantity || isFile)
          "
          class="quick-buy"
        >
          <v-btn
            @click.prevent="$emit('quick-buy')"
            depressed
            color="primary"
            dark
            tile
            :large="$vuetify.breakpoint.mdAndUp && !isInsta"
            :fab="isInsta"
            :small="isInsta"
            width="100%"
          >
            <v-icon small>shopping_basket</v-icon>
            <span class="ms-1" v-if="!isInsta">
              {{ $t("global.actions.quick_buy") }}</span
            >
          </v-btn>
          <v-btn
            @click.prevent="
              existInComparisonList
                ? removeFromProductComparison(product, null)
                : addToProductComparison(product, null, true)
            "
            depressed
            color="primary"
            icon
            tile
            block
            :large="$vuetify.breakpoint.mdAndUp && !isInsta"
            :fab="isInsta"
            :small="isInsta"
            :title="$t('global.commons.compare')"
          >
            <v-icon
              v-if="existInComparisonList"
              small
              color="success"
              class="blink-me"
              >lens
            </v-icon>
            <v-icon v-else small>data_saver_on</v-icon>
          </v-btn>
        </div>

        <div
          class="card__info pt-2"
          style="z-index: 2"
          :class="{ no_variants: !hasVariant }"
        >
          <product-variants-view
            v-if="hasVariant"
            class="toggle-visible-on-hover"
            :variants="product.variants"
            small
            center
            :selected-variant.sync="current_variant"
            hoverable
            :limit="5"
          />

          <v-row no-gutters class="toggle-hidden-on-hover">
            <v-col
              cols="5"
              align-center
              justify-center
              class="small p-0 sec--rate-variants"
              v-if="!isSmall"
            >
              <div v-if="product.rate_count">
                <v-rating
                  :value="product.rate"
                  color="yellow darken-3"
                  background-color="grey darken-1"
                  empty-icon="$vuetify.icons.ratingFull"
                  half-increments
                  small
                  readonly
                  dense
                />
              </div>

              <div v-if="product.rate_count" class="single-line">
                <b class="me-1" :class="{ '-zero-font': dense }">{{
                  Number(product.rate).toFixed(1)
                }}</b>
                <small>
                  ● {{ product.rate_count | numeralFormat("0,0") }}
                  {{ $t("product_card.review_unit") }}
                </small>
              </div>

              <div
                v-if="colors && colors.length"
                class="p-1 overflow-hidden single-line"
              >
                <color-circle
                  v-for="color in colors.slice(0, 5)"
                  :key="color"
                  :color="color"
                  class="mr-1"
                  :size="14"
                >
                </color-circle>
                <v-icon v-if="colors.length > 5" class="mr-1"
                  >more_horiz
                </v-icon>
              </div>
            </v-col>

            <v-col
              v-if="product.quantity || isFile"
              :cols="isSmall ? 12 : 7"
              align-center
              justify-center
              class="small p-0 sec--price"
            >
              <div class="main-price-label" :class="{ 'text-center': isSmall }">
                <p class="dis-val">
                  <price-view
                    v-if="discount > 0"
                    :amount="price_in_selected_currency + discount"
                    class="discount-price text-muted"
                    line-through
                    :class="{ small: dense }"
                  ></price-view>

                  <span
                    v-if="discount > 0"
                    class="discount-percent mx-1 float-right"
                    :class="{ small: dense }"
                    >{{ discount_percent }} %
                  </span>
                </p>
                <p class="mt-2">
                  <!-- Main price -->

                  <price-view
                    :amount="price_in_selected_currency"
                    :large="!dense"
                  ></price-view>

                  <!-- Price label -->
                  <span v-if="product.price_label" class="mx-1 price-label">{{
                    product.price_label
                  }}</span>

                  <!-- Coupon -->
                  <span v-if="hasCoupon">
                    <v-icon x-small color="#D32F2F" class="mx-1"
                      >fas fa-plus</v-icon
                    >
                    <img
                      src="@components/assets/icons/coupon.svg"
                      height="24"
                    />
                  </span>
                </p>
              </div>
            </v-col>
            <v-col v-else cols="7" class="sec--price">
              <h5 class="mt-1 mb-0">
                {{ $t("product_card.sold_out") }}
              </h5>
              <img
                width="36px"
                :src="require('@components/assets/icons/sold.svg')"
              />
            </v-col>
          </v-row>
        </div>

        <!--
           <v-btn outlined icon :color="liked?'red':'#eee'" style="position: absolute;bottom: 86px;left: 16px" @click.prevent="starArticle">
             <v-icon>favorite</v-icon>
           </v-btn>
           -->

        <span v-if="hasOffer" class="offer-top-end"
          ><img src="@components/assets/icons/gift-w.svg" />
          <span>{{ $t("global.commons.offer") }}</span></span
        >
      </div>
      <!--  -------- Discount countdown ---------- -->
      <img
        v-if="hasDiscountCountDown"
        src="@components/assets/icons/countdown-badge.svg"
        class="count-down-bg fadeIn delay_400"
      />

      <div
        v-if="hasDiscountCountDown"
        class="count-down-container fadeIn delay_400"
      >
        <count-down v-if="endOfDiscountDate" :end="endOfDiscountDate" />
        <p v-else class="discount-not-end">
          {{ $t("product_info.action") }}
        </p>
      </div>
    </div>

    <!-- ========================== Row ======================== -->

    <div
      v-else
      class="row-box position-relative overflow-visible row-hover"
      @click="$emit('click')"
    >
      <v-container fluid class="overflow-hidden position-relative">
        <v-row dense style="flex-wrap: nowrap;">
          <v-img
            :src="product_image"
            :height="$vuetify.breakpoint.smAndDown ? 64 : 84"
            :width="$vuetify.breakpoint.smAndDown ? 64 : 84"
            class="flex-grow-0 rounded me-0 me-sm-2"
            :alt="
              product.title + (product.title_en ? ` | ${product.title_en}` : '')
            "
          >
          </v-img>

          <div
            class="text-start px-2 flex-grow-1"
            :style="{
              'max-width': $vuetify.breakpoint.smAndDown
                ? 'calc(100% - 195px)'
                : 'calc(100% - 210px)',
            }"
          >
            <p class="mb-1 flex-grow-1 row-pro-title">{{ product.title }}</p>

            <v-chip
              v-if="product.rate_count"
              x-small
              color="#fafafa"
              class="my-1"
            >
              <v-rating
                :value="product.rate"
                color="yellow darken-3"
                background-color="grey darken-1"
                empty-icon="$vuetify.icons.ratingFull"
                half-increments
                x-small
                readonly
                dense
              />
              {{ Number(product.rate).toFixed(1) }}
            </v-chip>

            <span class="mx-2" v-if="product.rate_count"
              >{{ product.rate_count | numeralFormat("0,0") }}

              <small>{{ $t("product_card.review_unit") }}</small>
            </span>

            <product-variants-view
              v-if="hasVariant"
              class="p-0"
              :variants="product.variants"
              small
              dense
              :selected-variant.sync="current_variant"
              hoverable
              :limit="5"
            />
          </div>

          <div
            class="text-end align-self-center flex-grow-1"
            style="flex-basis: 110px"
            :class="{ small: $vuetify.breakpoint.smAndDown }"
          >
            <div v-if="product.quantity || isFile" class="main-price-label p-0">
              <p v-if="discount > 0">
                <price-view
                  :amount="price_in_selected_currency + discount"
                  class="discount-price text-muted"
                  line-through
                ></price-view>
              </p>

              <p class="my-1">
                <!-- Coupon -->

                <img
                  v-if="hasCoupon"
                  src="@components/assets/icons/coupon.svg"
                  height="24"
                  title="Has extra coupon!"
                />
                <v-icon v-if="hasCoupon" x-small color="#D32F2F" class="mx-1"
                  >fas fa-plus
                </v-icon>
                <!-- Price label -->
                <span v-if="product.price_label" class="mx-1 price-label">{{
                  product.price_label
                }}</span>

                <!-- Main price  -->
                <price-view :amount="price_in_selected_currency"></price-view>
              </p>
            </div>

            <div v-else style="min-width: 80px" class="text-center">
              <h5 class="mt-2 mb-0">
                {{ $t("product_card.sold_out") }}
              </h5>
              <img
                width="36px"
                :src="require('@components/assets/icons/sold.svg')"
              />
            </div>

            <v-btn
              v-if="product.quantity || isFile"
              @click.prevent="$emit('quick-buy')"
              depressed
              color="#000"
              dark
              :large="$vuetify.breakpoint.mdAndUp"
              small
              class="align-self-center flex-grow-0 ms-2 tnt"
            >
              <v-icon class="me-1" small>shopping_basket</v-icon>

              {{ $t("global.actions.quick_buy") }}
            </v-btn>
          </div>
        </v-row>

        <span v-if="hasOffer" class="offer-top-end"
          ><img src="@components/assets/icons/gift-w.svg" />
          <span>{{ $t("global.commons.offer") }}</span></span
        >
      </v-container>

      <!--  -------- Discount countdown ---------- -->
      <img
        v-if="hasDiscountCountDown"
        src="@components/assets/icons/countdown-badge.svg"
        class="count-down-bg fadeIn delay_400"
      />

      <div
        v-if="hasDiscountCountDown"
        class="count-down-container fadeIn delay_400"
      >
        <count-down v-if="endOfDiscountDate" :end="endOfDiscountDate" />
        <p v-else class="discount-not-end">
          {{ $t("product_info.action") }}
        </p>
      </div>
    </div>
  </component>
</template>

<script>
import ProductVariantsView from "../variant/ProductVariantsView.vue";
import PriceView from "@components/ui/price/PriceView.vue";
import CountDown from "@components/ui/count-down/CountDown.vue";
import { ProductType } from "@core/enums/product/ProductType";
import ColorCircle from "@components/ui/color/ColorCircle.vue";

export default {
  name: "SShopProductCard",
  components: { ColorCircle, CountDown, PriceView, ProductVariantsView },
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
      return this.HasDiscountCountDownMode(this.product, null);
    },

    endOfDiscountDate() {
      return this.GetEndOfDiscountDate(this.product, null);
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
      return this.product.style;
    },

    is_image_contain() {
      const r = this.rnd;
      return this.product_style && this.product_style.contain;
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

<style src="./ProductCard.scss" lang="scss" scoped />

<style lang="scss" scoped>


@media only screen and (max-width: 600px) {
  .card-item-new {
    padding: 4px; //!important;
  }
}

.card-item-new {
  --card-height: 360px;
  --footer-height: 80px;

  --header-size: 60px;

  --image-height: 280px;

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

  p {
    font-size: 0.95em;
    line-height: 1.2em;
    max-height: 3.6em;
    overflow: hidden;
    word-wrap: break-word;
    text-overflow: ellipsis;
    display: block; /* or inline-block */
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
    font-size: 1.7em;
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
      font-size: 0.8em;
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
    position: relative;
    color: #333333;

    // TODO: moshkel flash zadan moghe animate border-radius!!! => so small duration set!!!
    transition: transform 0.4s ease-in-out, background-color 0.45s ease-in-out,
    border-radius 0.1s linear; // Flicker animation border-radius problem!!!

    transition-delay: 0.25s;
    @media (max-width: $max_width_to_delay_reverse) {
      transition-delay: 0.25s + $delay_reverse;
    }
    z-index: 0;
    background-color: #fff;
    //  border-bottom-left-radius: 12px;
    //  border-bottom-right-radius: 12px;
    padding: 0px 8px 0px 8px;

    height: var(--footer-height);
    //  margin-bottom: 6px;
    margin-bottom: 0px;

    border-radius: 0px;

    overflow: hidden;
    @media (max-width: 800px) {
      height: var(--footer-height);
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
      border-radius: 16px;
      transform: scale(0.75, 0.75);
      background-color: rgba(255, 255, 255, 0.94);

      &.no_variants {
        background: unset;
      }

      &:hover {
        transform: scale(0.9, 0.9);
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
    font-size: 1.15rem !important;
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
  font-size: 0.7em;
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
  transform: translate(-50%, -50%);
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
  background-color: #6ac174;
  color: #fff;
  z-index: 2;
  border-bottom-left-radius: 72px;
  text-align: center;
  padding-left: 12px;
  opacity: 0.9;

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

.v-application--is-rtl {
  .offer-top-end {
    right: unset;
    left: 0;
    border-bottom-left-radius: unset;
    border-bottom-right-radius: 72px;
    padding-left: unset;
    padding-right: 12px;
  }

  .card-item-new {
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

  .card-item-new {
    .card__copy-product-badge {
      left: 0;
      right: unset;
      transform: translateX(-80%);
      border-radius: 0 0 12px 0;
    }
  }
}

.top-title {
  &.has-discount-banner {
    padding-left: 56px;
  }
}

.v-application--is-rtl {
  .top-title {
    &.has-discount-banner {
      padding-left: unset;
      padding-right: 56px;
    }
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

.v-application--is-rtl {
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

    -ms-transform: scale(0.5, 0.5) rotate(42deg) translate(24%, -30%); /* IE 9 */
    -webkit-transform: scale(0.5, 0.5) rotate(42deg) translate(24%, -30%); /* Safari */
    transform: scale(0.5, 0.5) rotate(42deg) translate(24%, -30%); /* Standard syntax */
  }
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

  -ms-transform: scale(0.5, 0.5) rotate(-42deg) translate(-24%, -30%);
  -webkit-transform: scale(0.5, 0.5) rotate(-42deg) translate(-24%, -30%);
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
  .price-label {
    font-size: 10px;
    color: #000;
  }
}

.card-item-new.-static {
  .card:hover {
    transition: unset !important;
  }
}
</style>
