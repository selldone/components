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
  <section v-resize="onResize" class="border-bottom">
    <div class="stories">
      <div
        v-for="(highlight, i) in highlights"
        :key="highlight.id"
        class="story"
        @click="
          index = i;
          dialog = true;
          setCurrentStory();
        "
      >
        <span class="story-img-wrapper"
          ><img :src="getShopImagePath(highlight.cover)"
        /></span>
        <div class="story-title text-ellipsis">{{ highlight.name }}</div>
      </div>
    </div>
    <v-dialog v-model="dialog" fullscreen>
      <v-sheet class="d-flex justify-center" dark height="100%">
        <div
          :style="`max-width: ${max_width}px; max-height: ${max_height}px;`"
          style="
            align-self: center;
            height: 100%;
            overflow: hidden;
            position: relative;
            width: 100%;
          "
        >
          <div class="stories-con">
            <div
              v-for="(highlight, i) in highlights"
              :key="'h' + i"
              :class="{ '-active': index === i }"
              :style="{
                width: width + 'px',
                height: height + 'px',
                transform: calcTransform(i),
              }"
              class="-box"
              @click="
                index = i;
                setCurrentStory();
              "
            >
              <!-- ---------------- Main Image ---------------- -->

              <v-img
                :src="
                  index === i && product_data
                    ? getShopImagePath(product_data.icon)
                    : highlight.index < highlight.stories.length
                      ? getShopImagePath(
                          highlight.stories[highlight.index].display,
                        )
                      : getShopImagePath(highlight.cover)
                "
                class="-img"
                height="100%"
                width="100%"
                @click="showNormalPost()"
              >
                <!-- ---------------- User avatar center ---------------- -->

                <v-col class="avatar-center" cols="2" md="4">
                  <v-avatar :size="56" class="story-border -dense -black">
                    <img :src="profile_image" />
                  </v-avatar>
                  <b class="d-block mt-2">{{ instagram.userName }}</b>
                  <span v-if="highlight.index < highlight.stories.length">
                    {{
                      getFromNowString(
                        highlight.stories[highlight.index].date,
                        null,
                        true,
                      )
                    }}</span
                  >
                </v-col>

                <!-- ---------------- Pin products ---------------- -->
                <u-drag-pin
                  v-if="index === i && in_main_post && selected_story"
                  v-model="selected_story.products"
                  :editable="editable"
                  :initial-y="10"
                  class="pins"
                  @change="onChange"
                  @click:product="showProduct"
                  @click:category="showCategory"
                  @update:tags="(tags) => (selected_story.products.tags = tags)"
                >
                </u-drag-pin>
              </v-img>

              <!-- ---------------- Header ---------------- -->

              <header class="header pointer-event-none">
                <div class="story-bar">
                  <div
                    v-for="(st, j) in highlight.stories"
                    :key="j"
                    :style="{
                      '--prog':
                        (highlight.index < j
                          ? 0
                          : highlight.index > j
                            ? 100
                            : 50) + '%',
                    }"
                  ></div>
                </div>
                <div class="d-flex align-items-center">
                  <v-avatar :size="32">
                    <img :src="profile_image" />
                  </v-avatar>
                  <div>
                    <b class="pl-2 pr-3">{{ highlight.name }}</b>
                    <span
                      v-if="highlight.index < highlight.stories.length"
                      class="op-0-6"
                      >{{
                        getFromNowString(
                          highlight.stories[highlight.index].date,
                          null,
                          true,
                        )
                      }}</span
                    >
                  </div>
                  <v-spacer></v-spacer>
                  <v-btn icon style="pointer-events: auto">
                    <v-icon>play_arrow</v-icon>
                  </v-btn>
                </div>

                <v-progress-linear
                  v-if="busy"
                  class="-loading"
                  color="blue"
                  height="2"
                  indeterminate
                ></v-progress-linear>
              </header>

              <!-- ---------------- Product Info ---------------- -->
              <div
                v-if="index === i && product_data"
                class="default-font product-box slideInUp"
              >
                <!-- Select variant -->

                <div class="my-3">
                  <u-variant-selector
                    v-if="has_available_variants"
                    v-model="selected_variant"
                    :variants="product_variants"
                    active-color="#000"
                    bordered
                  ></u-variant-selector>
                </div>

                <v-row align="center" class="mx-0" dense>
                  <!-- Price -->

                  <v-col cols="12" md="6">
                    <p v-if="discount > 0">
                      <u-price
                        :amount="price + discount"
                        class="op-0-8"
                        line-through
                      ></u-price>

                      <v-chip
                        class="mx-1 float-end"
                        color="red"
                        variant="flat"
                        size="small"
                        >{{ discount_percent }} %
                      </v-chip>
                    </p>
                    <p class="-price">
                      <u-price :amount="price"></u-price>
                    </p>
                  </v-col>

                  <!-- Buy button -->

                  <v-col class="text-center" cols="12" md="6">
                    <s-shop-buy-button
                      :current-variant="selected_variant"
                      :product="product_data"
                      can-buy
                    ></s-shop-buy-button>
                  </v-col>
                </v-row>

                <!-- Variants -->
                <product-variants-view
                  v-if="hasVariant"
                  :variants="product_data.variants"
                  class="p-0"
                  dark
                  dense
                  small
                  style="font-size: 9px"
                />
                <!-- Pros & Cons -->
                <div v-if="product_data.pros" class="-pros-list">
                  <p class="my-1">{{ $t("product_info.pros") }}</p>
                  <ul>
                    <li v-for="(pro, i) in product_data.pros" :key="i">
                      {{ pro }}
                    </li>
                  </ul>
                </div>

                <div v-if="product_data.cons" class="-pros-list">
                  <p class="my-1">{{ $t("product_info.cons") }}</p>
                  <ul>
                    <li v-for="(con, i) in product_data.cons" :key="i">
                      {{ con }}
                    </li>
                  </ul>
                </div>
              </div>

              <!-- ---------------- Footer ---------------- -->

              <div class="footer">
                <div
                  v-if="
                    selected_story &&
                    selected_story.products &&
                    selected_story.products.list
                  "
                  class="default-font zoomIn"
                >
                  <products-dense-images-circles
                    :has-add="editable"
                    :ids="Object.keys(selected_story.products.list)"
                    :size="48"
                    link
                    @click:add="showSelectProducts(selected_story)"
                    @click:category="showCategory"
                    @click:item="showProduct"
                  ></products-dense-images-circles>
                </div>
              </div>

              <v-btn
                class="-back"
                icon
                size="x-small"
                variant="flat"
                @click="preStory(highlight)"
              >
                <v-icon size="large">chevron_left</v-icon>
              </v-btn>
              <v-btn
                class="-next"
                icon
                size="x-small"
                variant="flat"
                @click="nextStory(highlight)"
              >
                <v-icon size="large">chevron_right</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <v-btn
          class="absolute-top-right"
          icon
          size="large"
          @click="dialog = false"
        >
          <v-icon size="large">close</v-icon>
        </v-btn>
      </v-sheet>
    </v-dialog>
  </section>
</template>

<script lang="ts">
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import ProductsDenseImagesCircles from "../../storefront/product/products-dense-images-circles/ProductsDenseImagesCircles.vue";
import { InstagramHelper } from "./helpers/InstagramHelper.js";
import UDragPin from "../../ui/drag/pin/UDragPin.vue";
import ProductVariantsView from "../../storefront/product/variant/ProductVariantsView.vue";
import UVariantSelector from "../../ui/variant/selector/UVariantSelector.vue";
import SShopBuyButton from "../../storefront/product/button/SShopBuyButton.vue";
import { throttle } from "lodash-es";
import { BEventBusMixin } from "@app-backoffice/mixins/event-bus/BEventBusMixin.ts";
import ProductMixin from "@selldone/components-vue/mixin/product/ProductMixin.ts";
import { ShopURLs } from "@selldone/core-js/helper";


export default {
  name: "InstagramViewHighlights",
  mixins: [BEventBusMixin, ProductMixin],
  components: {
    SShopBuyButton,
    UVariantSelector,
    ProductVariantsView,
    UDragPin,
    ProductsDenseImagesCircles,
  },
  inject: ["$shop"],
  props: {
    instagram: {
      required: true,
      type: Object,
    },
    highlights: {
      required: false,
      type: Array,
    },
    editable: {
      default: false,
      type: Boolean,
    },
  },
  data: () => ({
    dialog: false,
    index: 0,
    windowSize: { x: window.innerWidth, y: window.innerHeight },

    // ------------------
    change: false,
    busy_save: false,

    // ------------------
    selected_story: null,

    product_data: null,
    category_data: null,
    busy: false,
    error_msg: null,

    // ------------------
    selected_variant: null,
  }),

  computed: {
    aspect() {
      return this.$vuetify.display.xs
        ? 0.8
        : this.$vuetify.display.smOnly
          ? 1.4
          : 1.7;
    },
    width() {
      return this.height * 0.562;
    },
    height() {
      return this.max_height - 32;
    },
    step_ps() {
      return this.width / 2;
    },

    max_width() {
      if (this.$vuetify.display.mdAndDown) return this.windowSize.x;

      return this.aspect * this.max_height;
    },
    max_height() {
      if (this.windowSize.x / this.windowSize.y > this.aspect)
        return this.windowSize.y;
      else return this.windowSize.x / this.aspect;
    },

    profile_image() {
      return this.getShopImagePath(this.instagram.picture);
    },

    /* selected_story(){
      const highlight=this.highlights[this.index]

      if(!highlight)return null;

      const story=highlight.stories[highlight.index];
      InstagramHelper.ProductsCorrection(story)

      return story;
    },*/

    in_main_post() {
      return !this.product_data && !this.category_data;
    },

    //---------------------------------------------------------------
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
    //---------------------------------------------------------------
  },

  watch: {
    selected_story() {
      this.product_data = null;
      this.category_data = null;
    },

    change: throttle(function (newVal, oldVal) {
      if (newVal) {
        this.saveStoryProductInfo(this.selected_story);
        this.change = false;
      }
    }, 5000),
  },

  created() {
    this.highlights.forEach((h) => {
      h.index = 0;
      h.stories.forEach((s) => {
        InstagramHelper.ProductsCorrection(s);
      });
    });
  },

  methods: {
    calcTransform(i) {
      const center = (this.max_width - this.width) / 2;

      return `translate(${
        center +
        (i - this.index) * this.step_ps +
        (i > this.index ? this.step_ps + 0.2 * this.step_ps : 0)
      }px) scale(${i === this.index ? 1 : 0.4})`;
    },

    onResize() {
      this.windowSize = { x: window.innerWidth, y: window.innerHeight };
    },

    nextStory(highlight) {
      if (!highlight.index) highlight.index = 0;
      if (highlight.index < highlight.stories.length - 1) highlight.index++;

      this.setCurrentStory();
      this.$forceUpdate(); // Update vue component!
    },

    preStory(highlight) {
      if (highlight.index > 0) highlight.index--;

      this.setCurrentStory();

      this.$forceUpdate(); // Update vue component!
    },

    setCurrentStory() {
      // 1. Save change:
      if (this.change) {
        this.saveStoryProductInfo(this.selected_story);
        this.change = false;
      }

      // 2. Now change story:
      const highlight = this.highlights[this.index];
      if (!highlight || highlight.index >= highlight.stories.length)
        return null;

      this.selected_story = highlight.stories[highlight.index];
    },

    //----------------------------------------------------------------------------------
    showSelectProducts(item) {
      this.showGlobalInstagramProductsSelectDialog(item, () => this.onChange());
    },
    onChange() {
      // Change values and need to be saved!

      this.change = true;
    },

    showCategory(id) {
      window.open(ShopURLs.GetCategoryLink(this.$shop, id), "_blank");
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
            NotificationService.showErrorAlert(null, data.error_msg);
            this.error_msg = data.error_msg;
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
          this.error_msg = "Product not found!";
        })
        .finally(() => {
          this.busy = false;
        });
    },

    saveStoryProductInfo(story) {
      if (!this.change) return; // Save only value changed!

      this.busy_save = null;

      axios
        .put(
          window.API.PUT_INSTAGRAM_STORY_SET_PRODUCTS(this.$shop.id, story.id),
          {
            products: story.products,
          },
        )
        .then(({ data }) => {
          if (!data.error) {
          } else {
            NotificationService.showErrorAlert(null, data.error_msg);
          }
        })
        .catch((e) => {
          NotificationService.showLaravelError(e);
        })
        .finally(() => {
          this.busy_save = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped>
section {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  overflow-y: auto;
}

.stories,
.story {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.story {
  width: 60px;
  padding: 10px 5px;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  cursor: pointer;
}

.story-img-wrapper {
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 50%;
  border: 1px solid #ccc;
  padding: 2px;
}

.story-img-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}

.story-title {
  padding-top: 8px;
  font-size: 12px;
  color: #262626;
  max-width: 100%;
}

@media (min-width: 768px) {
  .stories {
    padding: 50px 48px;
  }
  .story {
    padding: 10px 15px;
    width: 115px;
  }
  .story-img-wrapper {
    width: 77px;
    height: 77px;
  }
  .story-title {
    font-weight: 600;
    font-size: 14px;
  }
}

//-------------------------------------------------------------
.stories-con {
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
  height: 100%;
  transition: all;
}

.-box {
  position: absolute;
  left: 0;
  transform-origin: left center 0;
  transition: all 1s;

  cursor: pointer;
  user-select: none;

  &.-active {
    .-img {
      border-radius: 8px;
    }

    .-next,
    .-back {
      display: block;
    }

    .avatar-center {
      display: none;
    }
  }

  &:not(.-active) {
    .footer,
    .header {
      display: none;
    }
  }

  .-img {
    overflow: hidden;
    border-radius: 20px;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .-next,
  .-back {
    display: none;
    margin-top: -13px;
    opacity: 0.2;
    position: absolute;
    top: 50%;
    transition: opacity 0.1s ease-in;
  }

  .-back {
    left: -40px;
  }

  .-next {
    right: -40px;
  }

  &:hover {
    .-next,
    .-back {
      opacity: 1;
    }
  }
}

header {
  padding: 20px 16px 32px;
  direction: ltr;
  background: linear-gradient(
    180deg,
    rgba(38, 38, 38, 0.8) 0%,
    rgba(38, 38, 38, 0) 100%
  );
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 999;
}

.story-bar {
  display: flex;
  position: relative;
  z-index: 9;
  justify-content: space-around;
  margin-bottom: 8px;

  > div {
    flex-grow: 1;
    background-color: rgba(255, 255, 255, 0.25);
    height: 2px;
    margin: 0 2px;
    position: relative;

    &:after {
      position: absolute;
      left: 0;
      content: " ";
      display: block;
      height: 2px;
      width: var(--prog);
      background-color: #fff;
    }
  }
}

.footer {
  background: linear-gradient(
    180deg,
    rgba(38, 38, 38, 0) 0%,
    rgba(38, 38, 38, 0.6) 100%
  );
  bottom: 0;
  height: 150px;
  left: 0;
  margin-top: auto;
  padding: 0 16px 16px;
  position: absolute;
  width: 100%;
  z-index: 999;
  user-select: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.avatar-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(2.5);
  font-size: 14px;
}

.-loading {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  z-index: 8;
}

.pins {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
}

.product-box {
  position: absolute;
  bottom: 160px;
  background-color: rgba(30, 30, 30, 0.87);
  width: auto;
  left: 8px;
  right: 8px;
  z-index: 100;
  max-height: calc(100% - 300px);
  border-radius: 20px;
  color: #fff;
  padding: 8px;
  overflow: auto;

  // -------------------------------------------------------

  .-price {
    font-size: 1.6em;
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

  @media only screen and (max-width: 780px) {
    font-size: 11px;
    max-height: calc(100% - 180px);
    bottom: 100px;
  }
}
</style>
