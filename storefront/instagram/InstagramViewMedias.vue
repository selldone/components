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
  <v-container class="instagram" v-bind="$attrs">
    <v-row>
      <v-col
        v-for="media in medias"
        :key="media.id"
        class="icard"
        cols="4"
        @click="showPost(media)"
      >
        <v-img
          :src="getShopImagePath(media.thumbnail)"
          aspect-ratio="1"
          class="-img"
          cover
          width="100%"
        >
          <v-icon class="absolute-top-right"
            >{{
              getProductsCount(media)
                ? "shopping_bag"
                : media.video
                  ? "videocam"
                  : media.igtv
                    ? "live_tv"
                    : media.typeName === "GraphSidecar"
                      ? "auto_awesome_motion"
                      : ""
            }}
          </v-icon>

          <div class="card-hover">
            <v-row class="card-hover-icons" no-gutters>
              <div class="p-1">
                <v-icon>favorite</v-icon>
                <span class="ms-2">{{
                  numeralFormat(media.likes, "0.[0]a")
                }}</span>
              </div>
              <div class="p-1">
                <v-icon>mode_comment</v-icon>
                <span class="ms-2">{{
                  numeralFormat(media.comments, "0.[0]a")
                }}</span>
              </div>
            </v-row>
          </div>
        </v-img>
      </v-col>
    </v-row>

    <u-loading-ellipsis v-if="busy_fetch" css-mode light></u-loading-ellipsis>
  </v-container>

  <!-- Dialog : Post -->

  <v-dialog
    v-model="dialog_media"
    :fullscreen="$vuetify.display.smAndDown && window.innerWidth < 760"
    max-width="935"
    retain-focus
    @update:model-value="
      (val) => {
        if (!val) {
          saveMediaProductInfo(selected_media);
          reset();
        }
      }
    "
  >
    <!-- Header > Master Top (Mobile only) -->
    <header v-if="$vuetify.display.mdAndDown" class="master-header">
      <v-btn icon variant="text" @click="dialog_media = false">
        <v-icon>arrow_back_ios</v-icon>
      </v-btn>
      <div class="flex-grow-1">
        <div class="-name">{{ instagram.userName }}</div>
        <b>Posts</b>
      </div>
    </header>

    <div ref="post_content">
      <!-- important: Add this div to solve initial scroll 0 (top) problem ( by: flex-direction: column-reverse;) -->
      <div v-if="selected_media" class="post-content">
        <v-progress-linear
          v-if="busy"
          class="-loading"
          color="blue"
          height="2"
          indeterminate
        ></v-progress-linear>

        <div class="post-caption">
          <header class="post-header md">
            <v-avatar class="avatar" size="32">
              <img :src="profile_image"
            /></v-avatar>
            <div class="w-100">
              <div class="d-flex justify-center align-items-center">
                <span class="user-id">{{ instagram.userName }}</span>
                <v-spacer></v-spacer>
                <v-btn
                  v-if="editable"
                  class="ms-2 default-font tnt"
                  color="primary"
                  size="small"
                  @click="showCreateProduct(selected_media)"
                >
                  <v-icon start>add</v-icon>
                  <b>{{ $t("instagram.create_product") }}</b></v-btn
                >
              </div>
              <span class="text-caption">{{
                selected_media.location ? selected_media.location.name : ""
              }}</span>
            </div>
          </header>

          <div
            v-if="selected_media.products && selected_media.products.list"
            class="border-bottom default-font"
          >
            <products-dense-images-circles
              :has-add="editable"
              :ids="Object.keys(selected_media.products.list)"
              :size="48"
              link
              @click:add="showSelectProducts(selected_media)"
              @click:category="showCategory"
              @click:item="showProduct"
            ></products-dense-images-circles>
          </div>

          <!-- ............................................................................................ -->
          <!-- Caption -->

          <div class="post-caption-content">
            <v-avatar
              v-if="!$vuetify.display.mdAndDown"
              class="item avatar"
              size="32"
              ><img :src="caption_image"
            /></v-avatar>
            <div class="item flex-grow-1">
              <span class="user-id me-2">{{ caption_name }}</span>

              <p
                v-if="editable && focus_caption && !product_data"
                key="c1"
                :class="{ disabled: busy_save }"
                class="editable"
                contenteditable="true"
                @blur="(e) => updateCaption(selected_media, e.target.innerHTML)"
                v-html="selected_media.caption"
              ></p>
              <p
                v-else
                key="c2"
                :class="{ 'hover-editable': editable }"
                @click="focus_caption = true"
                v-html="caption_html"
              ></p>

              <div v-if="product_data" class="default-font">
                <!-- Variants -->
                <product-variants-view
                  v-if="hasVariant"
                  :variants="product_data.variants"
                  class="p-0"
                  dense
                  small
                  style="font-size: 9px"
                />
                <!-- Pros & Cons -->
                <div v-if="product_data.pros" class="-pros-list">
                  <p class="my-1">{{ $t("product_info.pros") }}</p>
                  <ul>
                    <li v-for="(pro, key) in product_data.pros" :key="key">
                      <span>{{ key }} : </span> <b>{{ pro }}</b>
                    </li>
                  </ul>
                </div>

                <div v-if="product_data.cons" class="-pros-list">
                  <p class="my-1">{{ $t("product_info.cons") }}</p>
                  <ul>
                    <li v-for="(con, key) in product_data.cons" :key="key">
                      <span>{{ key }} : </span> <b> {{ con }}</b>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- ............................................................................................ -->

          <!-- Caption: Product info -->
          <footer
            v-if="product_data"
            class="post-footer default-font"
            @click.stop
          >
            <u-variant-selector
              v-if="has_available_variants"
              v-model="selected_variant"
              :variants="product_variants"
            ></u-variant-selector>

            <div>
              <div>
                <p v-if="discount > 0">
                  <u-price
                    :amount="price + discount"
                    class="text-muted"
                    line-through
                  ></u-price>

                  <v-chip class="mx-1 float-end" color="red" size="small"
                    >{{ discount_percent }} %
                  </v-chip>
                </p>
                <p class="-price">
                  <u-price :amount="price"></u-price>
                </p>
              </div>

              <div class="text-center py-5">
                <s-shop-buy-button
                  :current-variant="selected_variant"
                  :product="product_data"
                  can-buy
                ></s-shop-buy-button>
              </div>
            </div>
          </footer>

          <footer v-else class="post-footer">
            <div class="post-icons">
              <span class="item"
                ><svg
                  aria-label="Like"
                  fill="#262626"
                  height="24"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <path
                    d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"
                  ></path>
                </svg>
              </span>
              <span class="item"
                ><svg
                  aria-label="Comment"
                  fill="#262626"
                  height="24"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <path
                    clip-rule="evenodd"
                    d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"
                    fill-rule="evenodd"
                  ></path>
                </svg>
              </span>
              <span class="item"
                ><svg
                  aria-label="Share Post"
                  fill="#262626"
                  height="24"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <path
                    d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"
                  ></path>
                </svg> </span
              ><span class="item ml-auto"
                ><svg
                  aria-label="Save"
                  fill="#262626"
                  height="24"
                  viewBox="0 0 48 48"
                  width="24"
                >
                  <path
                    d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"
                  ></path></svg
              ></span>
            </div>
            <div class="like-count">
              {{ numeralFormat(selected_media.likes, "0,0") }} likes
            </div>
            <time
              :datetime="selected_media.date"
              :title="getLocalTimeString(selected_media.date)"
              class="post-time"
            >
              {{ getFromNowString(selected_media.date, "en", true) }}
            </time>
          </footer>
        </div>

        <!-- Start Main Image -->
        <v-img
          :class="{ 'post-img': !zoom }"
          :src="post_image"
          aspect-ratio="1.17"
          cover
          @click="showNormalPost()"
        >
          <v-alert
            v-if="error_msg"
            class="absolute-bottom-center"
            color="red"
            density="compact"
            type="error"
          >
            {{ error_msg }}
          </v-alert>

          <u-drag-pin
            v-if="in_main_post"
            v-model="selected_media.products"
            :editable="editable"
            big-scale
            class="pins"
            @change="onChange"
            @click:product="showProduct"
            @click:category="showCategory"
            @update:tags="(tags) => (selected_media.products.tags = tags)"
          >
          </u-drag-pin>
        </v-img>

        <!-- Header > User (Mobile only) -->

        <header v-if="$vuetify.display.mdAndDown" class="post-header">
          <v-avatar class="avatar" size="32"
            ><img :src="getShopImagePath(instagram.picture)"
          /></v-avatar>
          <div>
            <div class="d-flex justify-center align-items-center">
              <span class="user-id">{{ instagram.userName }}</span>
            </div>
            <span class="text-caption">{{
              selected_media.location ? selected_media.location.name : ""
            }}</span>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            v-if="editable"
            class="ms-2 default-font tnt"
            color="primary"
            size="small"
            @click="showCreateProduct(selected_media)"
          >
            <v-icon class="me-1" size="small">add</v-icon>
            <b>{{ $t("instagram.create_product") }}</b></v-btn
          >
        </header>

        <div v-if="$vuetify.display.mdAndDown" style="padding-top: 58px">
          <!-- Spacer for master top header -->
        </div>
      </div>
    </div>
  </v-dialog>

  <!-- Create New Product Dialog -->
  <v-dialog
    v-if="editable"
    v-model="new_product_dialog"
    fullscreen
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card>
      <v-card-text>
        <v-img
          v-if="selected_media"
          :src="getShopImagePath(selected_media.display)"
          aspect-ratio="1"
          class="mb-5 mx-auto"
          cover
          max-width="240"
          rounded="xl"
          width="100%"
        ></v-img>

        <div class="widget-box">
          <v-text-field
            v-model="in_title"
            :counter="120"
            :label="$t('add_product.edit_info.product_name')"
            :placeholder="$t('add_product.edit_info.product_name_placeholder')"
            :rules="[GlobalRules.required(), GlobalRules.counter(120)]"
            class="max-width-field mx-auto my-2"
            variant="underlined"
          ></v-text-field>

          <u-price-input
            v-model="in_price"
            :decimal="in_currency ? in_currency.floats : 0"
            :disabled="!in_currency"
            :label="$t('add_product.pricing.price_input')"
            :rules="[GlobalRules.required()]"
            class="max-width-field mx-auto my-2"
            placeholder="0.00"
            required
            variant="underlined"
          >
            <template v-slot:append-inner>
              <u-currency-input
                v-model="in_currency"
                :activeCurrencies="$shop.currencies"
                class="margin-n7px"
                dense
                hide-details
                icon-only
                style="max-width: 84px"
                variant="underlined"
              />
            </template>
          </u-price-input>

          <v-combobox
            v-model="in_unit"
            :counter="16"
            :hint="$t('add_product.edit_info.unit_message')"
            :items="unit_items"
            :label="$t('add_product.edit_info.unit')"
            :placeholder="
              $t('global.commons.default') + ' : ' + $t('buy_button.count_unit')
            "
            :rules="[GlobalRules.counter(16)]"
            class="max-width-field mx-auto my-2"
            persistent-hint
            variant="underlined"
          />

          <u-number-input
            v-model="in_quantity"
            :label="$t('product_admin.inventory.variants.count_input')"
            :min="0"
            class="max-width-field mx-auto my-2"
          >
          </u-number-input>
        </div>
      </v-card-text>

      <v-card-actions>
        <div class="widget-buttons">
          <v-btn
            size="x-large"
            variant="text"
            @click="new_product_dialog = false"
          >
            <v-icon start>close</v-icon>
            {{ $t("global.actions.close") }}
          </v-btn>
          <v-btn
            :class="{ disabled: !in_title || !in_price || !in_currency }"
            :loading="busy_new_product"
            color="success"
            size="x-large"
            @click="addProduct()"
          >
            <v-icon start>add</v-icon>
            {{ $t("instagram.add_product") }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import {
  SmartConvertTextToHtml,
  SmartConvertTextToHtmlHashtags,
} from "@selldone/core-js/helper/html/HtmlHelper";
import ProductsDenseImagesCircles from "../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import ProductVariantsView from "../../storefront/product/variant/ProductVariantsView.vue";
import SShopBuyButton from "../../storefront/product/button/SShopBuyButton.vue";
import UVariantSelector from "../../ui/variant/selector/UVariantSelector.vue";
import UDragPin from "../../ui/drag/pin/UDragPin.vue";
import { InstagramHelper } from "./helpers/InstagramHelper.js";
import UNumberInput from "../../ui/number/input/UNumberInput.vue";
import UPriceInput from "../../ui/price/input/UPriceInput.vue";
import UCurrencyInput from "../../ui/currency/input/UCurrencyInput.vue";
import { Currency } from "@selldone/core-js/enums/payment/Currency";
import { ProductCondition } from "@selldone/core-js/enums/product/ProductCondition";
import { ProductType } from "@selldone/core-js/enums/product/ProductType";
import { delay, throttle } from "lodash-es";
import ULoadingEllipsis from "@selldone/components-vue/ui/loading/ellipsis/ULoadingEllipsis.vue";
import { BEventBusMixin } from "@app-backoffice/mixins/event-bus/BEventBusMixin.ts";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";

export default {
  name: "InstagramViewMedias",
  mixins: [BEventBusMixin, DateMixin, ProductMixin],
  components: {
    ULoadingEllipsis,
    UCurrencyInput,
    UPriceInput,
    UNumberInput,
    UDragPin,
    UVariantSelector,
    SShopBuyButton,
    ProductVariantsView,
    ProductsDenseImagesCircles,
  },
  inject: ["$shop"],
  props: {
    instagram: {
      required: true,
      type: Object,
    },
    medias: {
      required: false,
      type: Array,
    },
    editable: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    SmartConvertTextToHtml: SmartConvertTextToHtml,
    SmartConvertTextToHtmlHashtags: SmartConvertTextToHtmlHashtags,
    busy_fetch: false,

    zoom: false,

    change: false,

    // ------------------
    page: 1,
    itemsPerPage: 12 * 3,

    // ------------------
    highlights: [],

    // ------------------
    dialog_media: false,
    selected_media: null,

    // ------------------

    // ------------------
    product_data: null,
    category_data: null,
    busy: false,
    error_msg: null,
    // ------------------
    selected_variant: null,

    // ------------------
    busy_save: false,

    // ------------------

    showMenu: false,
    x: 0,
    y: 0,

    // ------------------
    focus_caption: false,

    // ------------------
    new_product_dialog: false,

    in_title: null,
    in_price: null,
    in_currency: null,
    in_quantity: 100,
    in_unit: null,

    busy_new_product: false,
  }),

  computed: {
    post_image() {
      let path = this.selected_media ? this.selected_media.display : null;
      if (this.product_data && this.product_data.icon)
        path = this.product_data.icon;

      return this.getShopImagePath(path);
    },
    profile_image() {
      return this.getShopImagePath(this.instagram.picture);
    },
    caption_image() {
      return this.product_data ? this.post_image : this.profile_image;
    },
    caption_name() {
      return this.product_data
        ? this.product_data.title
        : this.instagram.userName;
    },

    caption_html() {
      return this.product_data
        ? `${this.product_data.title_en ? this.product_data.title_en : ""}`
        : this.SmartConvertTextToHtmlHashtags(
            this.selected_media.caption,
            this.selected_media.hashtags,
          );
    },

    hasVariant() {
      return (
        this.product_data &&
        this.product_data.variants &&
        this.product_data.variants.length
      );
    },
    has_available_variants() {
      return this.product_variants && this.product_variants.length;
    },

    price() {
      if (!this.product_data) return 0;

      return this.CalcPriceProductCurrentCurrency(
        this.$shop,
        this.product_data,
        this.selected_variant,
      );
    },
    discount_percent() {
      return this.discountProductPercent(
        this.$shop,
        this.product_data,
        this.selected_variant,
      );
    },

    discount() {
      return this.getProductDiscountAmount(
        this.$shop,
        this.product_data,
        this.selected_variant,
      );
    },

    product_variants() {
      return this.product_data && this.product_data.product_variants;
    },

    in_main_post() {
      return !this.product_data && !this.category_data;
    },

    unit_items() {
      return this.$tm("global.units");
    },
  },

  watch: {
    change: throttle(function (newVal, oldVal) {
      // Auto save ! even dialog not closed!
      if (newVal && this.selected_media)
        this.saveMediaProductInfo(this.selected_media);
    }, 5000),
  },

  created() {
    if (this.$shop.currencies.length)
      this.in_currency = Currency[this.$shop.currencies[0]];
  },

  methods: {
    reset() {
      /*  if(this.$refs.post_content){ not work!
        console.log('=----------------=-=-=',this.$refs.post_content);
        this.$refs.post_content.scrollTop =0
        this.$refs.post_content.parentElement.scrollTop =0
      }*/

      this.selected_media = null;
      this.product_data = null;
      this.category_data = null;
      this.busy = false;
      this.error_msg = null;
      this.selected_variant = null;
      this.zoom = false;
      this.change = false;
      this.focus_caption = false;

      this.in_title = "";
      this.in_price = 0;
      this.in_quantity = 100;
    },

    onChange() {
      // Change values and need to be saved!

      this.change = true;
    },

    showPost(media) {
      this.reset();
      this.dialog_media = true;
      this.selected_media = media;

      InstagramHelper.ProductsCorrection(media);

      // Scroll to first:
      delay(() => {
        if (
          this.$refs.post_content &&
          this.$refs.post_content.parentElement.scrollTop !== 0
        ) {
          $(this.$refs.post_content.parentElement)
            .stop()
            .animate({ scrollTop: 0 }, 500, "swing");
          /* console.log(
            "scrollTop",
            this.$refs.post_content.parentElement.scrollTop
          );*/
        }
      }, 250);
    },
    showSelectProducts(item) {
      this.showGlobalInstagramProductsSelectDialog(item, () => this.onChange());
    },

    showCategory(id) {
      window.open(this.getCategoryLink(this.$shop, id), "_blank");
      this.showNormalPost();
    },
    showProduct(id) {
      this.category_data = null;
      this.fetchProduct(id);
    },
    showNormalPost() {
      this.product_data = null;
      this.category_data = null;
    },

    fetchProduct(product_id) {
      this.busy = true;
      this.error_msg = null;

      axios
        .get(
          window.XAPI.GET_PRODUCT_INFO_INSTAGRAM(this.$shop.name, product_id),
        )
        .then(({ data }) => {
          if (!data.error) {
            this.product_data = data.product;

            this.selected_variant =
              data.product.product_variants &&
              data.product.product_variants.length
                ? data.product.product_variants[0]
                : null;
          } else {
            this.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
          this.error_msg = "Product not found!";
        })
        .finally(() => {
          this.busy = false;
        });
    },

    saveMediaProductInfo(media) {
      if (!this.change || !this.editable) return; // Save only value changed!

      this.busy_save = null;

      axios
        .put(
          window.API.PUT_INSTAGRAM_MEDIA_SET_PRODUCTS(this.$shop.id, media.id),
          {
            products: media.products,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },

    updateCaption(media, caption) {
      if (media.caption === caption) {
        this.focus_caption = false;
        return;
      }

      this.busy_save = null;
      axios
        .put(
          window.API.PUT_INSTAGRAM_MEDIA_SET_CAPTION(this.$shop.id, media.id),
          {
            caption: SmartConvertTextToHtml(caption),
          },
        )
        .then(({ data }) => {
          if (!data.error) {
            media.caption = data.media.caption;
            this.focus_caption = false;
          } else {
            this.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          this.showLaravelError(e);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
    //--------------------------------------------------------------------------------
    show(e) {
      e.preventDefault();
      this.showMenu = false;
      this.x = e.clientX;
      this.y = e.clientY;
      this.$nextTick(() => {
        this.showMenu = true;
      });
    },
    //--------------------------------------------------------------------------------

    getProductsCount(media) {
      return (
        media.products &&
        media.products.list &&
        Object.keys(media.products.list).length
      );
    },
    //--------------------------------------------------------------------------------

    showCreateProduct(selected_media) {
      this.new_product_dialog = true;
    },
    addProduct() {
      this.busy_new_product = true;

      axios
        .post(window.API.POST_ADD_PRODUCT(this.$shop.id), {
          type: ProductType.PHYSICAL.code,
          unit: this.in_unit,

          title: this.in_title,
          condition: ProductCondition.NEW.code,

          price: this.in_price,
          currency: this.in_currency.code,
          commission: 0,
          discount: 0,

          status: "Open",

          category_id: null,

          lead: 0,

          style: null,

          brand: null,
          warranty: null,
          original: true,
          return_warranty: null,

          video: null,

          quantity: this.in_quantity,

          icon: this.selected_media.display,
        })
        .then(({ data }) => {
          if (data.error) {
            this.showErrorAlert(null, data.error_msg);
          } else {
            this.product = data.product;

            this.showSuccessAlert(null, "The product added to the list.");

            this.selected_media.products.list[this.product.id] = []; // Add to products list
            this.selected_media.products.tags.push({
              id: "" + this.product.id, // Must be string!
              x: 5,
              y: 5,
            }); // Add to pins
            this.new_product_dialog = false;

            this.onChange(); // Fire change to auto save!
          }
        })
        .catch((error) => {
          this.showLaravelError(error);
        })
        .finally(() => {
          this.busy_new_product = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
.instagram {
  direction: ltr;
  color: #262626;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  line-height: 18px;
  font-size: 14px;
  text-align: left;
}

.user-id {
  font-size: 28px;
  color: #262626;
  font-weight: 300;
  display: block;
  white-space: nowrap;
  margin-top: 5px;
  user-select: none;
}

.icard {
  cursor: pointer;
  padding: 1.5px;

  &:hover {
    .card-hover {
      opacity: 1;
    }
  }

  .-img {
    background-color: #eee;
  }
}

.card-hover {
  position: absolute;
  right: 0;
  top: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 99;
  opacity: 0;
  -webkit-transition: opacity 0.1s ease-out;
  -o-transition: opacity 0.1s ease-out;
  transition: opacity 0.1s ease-out;
}

.card-hover-icons {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  position: absolute;
  top: 50%;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  width: 100%;
  font-size: 16px;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
}

//-------------------------------------------------------------

.post-content {
  direction: ltr;
  text-align: left;
  //max-width:815px;
  width: 100%;
  //height:100vh;
  height: 100%;
  overflow: auto;
  scrollbar-width: none;
  background-color: #fff;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  //position:fixed;
  -webkit-box-orient: vertical;
  -webkit-box-direction: reverse;
  -ms-flex-direction: column-reverse;
  flex-direction: column-reverse;
  //top:45px;
  right: 0;
  z-index: 200;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  position: relative;
  top: 0;
  padding-bottom: 74px; // Solve overlap with app navigation bar in mobiles!

  .user-id {
    font-size: 14px;
    font-weight: 600;
    display: inline-flex;
    margin-top: 0;
  }

  .avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    margin: 0 10px;
  }

  img {
    width: 100%;
    height: 100%;
  }

  .-loading {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 8;

    @media (max-width: 960px) {
      top: 58px;
      position: fixed;
    }
  }
}

@media (min-width: 768px) {
  .post-content {
    -webkit-box-orient: horizontal;
    -webkit-box-direction: reverse;
    -ms-flex-direction: row-reverse;
    flex-direction: row-reverse;
    //top:50%;
    //left:50%;
    //-webkit-transform:translate(-50%,-50%);
    //-ms-transform:translate(-50%,-50%);
    //transform:translate(-50%,-50%);
    height: auto;
    overflow: initial;
    padding-bottom: 0px; // Solve overlap with app navigation bar in mobiles!
  }

  .icard {
    padding: 12px;
  }
}

.post-img {
  flex-basis: 60%;
  height: max-content;
}

.post-caption {
  flex-basis: 40%;
  position: relative;
  flex-direction: column-reverse;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

.post-caption,
.post-header {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.post-header {
  height: 72px;
  padding: 16px;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  max-width: 100%;
  border-bottom: 1px solid #eee;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.post-header.md {
  display: none;
}

@media (min-width: 768px) {
  .post-header.md {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }
  .post-img {
    flex-basis: unset;
    margin-right: 40%;
  }
  .post-caption {
    position: absolute;
    height: 100%;
    width: 40%;
    right: 0;
    flex-direction: column;
  }
}

.user-follow {
  color: #0095f6;
  margin-left: 20px;
  position: relative;
  font-weight: 600;
}

.user-follow:before {
  content: " ";
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: #000;
  position: absolute;
  left: -10px;
  top: 50%;
}

.post-caption-content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  padding: 16px;
  color: #262626;
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  flex-grow: 1;
}

.post-footer {
  padding: 8px 8px 12px;
  border-top: 1px solid #eee;

  p {
    margin: 0;
  }

  .post-icons {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    margin-bottom: 10px;

    .item {
      padding: 8px;
    }
  }
}

@media (min-width: 768px) {
  .post-footer {
    //position:absolute;
    bottom: 0;
    right: 0;
    left: 0;
  }
}

.like-count {
  color: #262626;
  font-weight: 600;
}

.post-time {
  font-size: 10px;
  letter-spacing: 0.2px;
  color: #8e8e8e;
  text-transform: uppercase;
}

.black-wrapper {
  position: fixed;
  right: 0;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: rgba(1, 1, 1, 0.3);
  height: 100vh;
  z-index: 100;
  display: none;
}

.close-icon {
  outline: none;
  width: 25px;
  height: auto;
  padding: 10px;
  cursor: pointer;
  display: block;
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  position: absolute;
  z-index: 4;
  top: 15px;
  right: 5px;
}

.close-icon-line {
  display: block;
  height: 3px;
  width: 100%;
  background-color: #fff;
  margin-bottom: 4px;
  border-radius: 2px;
}

.close-icon-line-1 {
  -webkit-transform: translateY(4px) rotate(-135deg);
  -ms-transform: translateY(4px) rotate(-135deg);
  transform: translateY(4px) rotate(-135deg);
}

.close-icon-line-2 {
  -webkit-transform: translateY(-3px) rotate(135deg);
  -ms-transform: translateY(-3px) rotate(135deg);
  transform: translateY(-3px) rotate(135deg);
}

.black-wrapper.active {
  display: block;
}

.mobile-close-section {
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  background-color: #fff;
  height: 45px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: none;
}

.back-arrow,
.mobile-close-section.active {
  display: block;
}

.back-arrow {
  width: 10px;
  height: 10px;
  border: solid #333;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(135deg);
  -ms-transform: rotate(135deg);
  transform: rotate(135deg);
}

// -------------------------------------------------------
.-price {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.-pros-list {
  padding: 2px 12px;

  p {
    font-weight: 600;
    font-size: 0.85em;
  }

  li {
    font-size: 0.9em;
    font-weight: 400;
    margin: 0 14px;
  }
}

.pins {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

// -------------------------------------------------------
.master-header {
  position: fixed;
  direction: ltr;
  left: 0;
  width: 100%;
  top: 0;
  display: flex;
  background-color: #fff;
  padding: 8px 12px;
  font-size: 13px;
  text-align: center;
  height: 58px;
  align-items: center;
  z-index: 99999;
  border-bottom: solid #eee 1px;

  .-name {
    font-weight: 500;
    text-transform: uppercase;
    color: #888;
    font-size: 11px;
  }
}
</style>
